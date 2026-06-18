// src/modules/import/import.routes.js
const express = require('express');
const { authenticate } = require('../../middleware/authorize.middleware');
const transactionService = require('../transactions/transactions.service');
const categoriesRepository = require('../categories/categories.repository');
const transactionRepository = require('../transactions/transactions.repository');

const router = express.Router();

/**
 * POST /api/transactions/import
 * Import multiple transactions in bulk from a parsed XLSX file.
 *
 * Body: {
 *   transactions: [
 *     { date: "2024-01-15", amount: 50.00, merchant: "Starbucks", category: "Food", notes: "Coffee" },
 *     ...
 *   ]
 * }
 */
router.post('/', authenticate, async (req, res) => {
  try {
    const { transactions } = req.body;
    const userId = req.user.id;

    // ── Input validation ────────────────────────────────────────────────────
    if (!Array.isArray(transactions) || transactions.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid input',
        message: 'transactions must be a non-empty array',
      });
    }

    if (transactions.length > 10000) {
      return res.status(400).json({
        success: false,
        error: 'Too many transactions',
        message: 'Maximum 10,000 transactions per import',
      });
    }

    // ── Batch-resolve category names → UUIDs ────────────────────────────────
    // Fetch ALL categories for this user once (avoids N DB round-trips).
    const userCategories = await categoriesRepository.findAll(userId);

    // Build a case-insensitive name → id map
    const categoryMap = new Map(
      userCategories.map((c) => [c.name.toLowerCase(), c.id])
    );

    // Fallback: first expense category, then any category
    const fallbackCategoryId =
      userCategories.find((c) => c.type === 'expense')?.id ||
      userCategories[0]?.id ||
      null;

    // Fetch the user record once to get their default currency
    const userRecord = await transactionRepository.findUserById(userId);
    const userCurrency = userRecord?.currency || 'USD';

    // ── Map each imported row to a service-ready payload ────────────────────
    // Build a map from category name → full category object (for type lookup)
    const categoryObjectMap = new Map(
      userCategories.map((c) => [c.name.toLowerCase(), c])
    );

    const mapped = transactions.map((t) => {
      const categoryName = (t.category || '').trim().toLowerCase();

      // Resolve the full category object so we can read its 'type' (income/expense)
      const resolvedCategory = categoryObjectMap.get(categoryName);
      const resolvedCategoryId = resolvedCategory?.id || fallbackCategoryId;

      // Priority: category's DB type → explicit type from file → 'expense' default
      // This is what fixes "Salary" rows (category type='income') showing as negative.
      const resolvedType =
        resolvedCategory?.type ||
        (t.type ? t.type.toLowerCase() : null) ||
        'expense';

      return {
        description: (t.merchant || t.description || 'Imported').trim(),
        amount: t.amount,
        type: resolvedType,
        date: t.date,
        currency: userCurrency,
        categoryId: resolvedCategoryId,
        notes: t.notes || null,
        isRecurring: false,
      };
    });

    // ── Bulk-create via existing service (handles balance + budget alerts) ──
    const result = await transactionService.bulkCreateTransactions(userId, mapped);

    const successful = Array.isArray(result) ? result : (result.successful || []);
    const failedItems = Array.isArray(result) ? [] : (result.failed || []);

    return res.status(200).json({
      success: true,
      imported: successful.length,
      duplicates: 0,
      failed: failedItems.length,
      message: `Successfully imported ${successful.length} of ${transactions.length} transactions`,
    });

  } catch (error) {
    console.error('Transaction import error:', error);
    return res.status(500).json({
      success: false,
      error: 'Import failed',
      message: error.message || 'An error occurred during import',
    });
  }
});

module.exports = router;