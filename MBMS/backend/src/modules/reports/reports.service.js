// reports.service.js

const { query } = require('../../config/db.config');
const { generateMonthlyInsights } = require('../insights/insights.service');
const transactionRepo = require('../transactions/transactions.repository');


function sumByType(transactions, type) {
  return transactions
    .filter(t => t.type === type)
    .reduce((sum, t) => sum + Number(t.amount), 0);
}

function groupByCategory(transactions) {
  const map = {};

  for (const t of transactions) {
    const key = t.category_name || 'uncategorized';

    if (!map[key]) {
      map[key] = 0;
    }

    map[key] += Number(t.amount);
  }

  return Object.entries(map).map(([category, total]) => ({
    category,
    total,
  }));
}

/* ─────────────────────────────────────────────
   1. MONTHLY SUMMARY (core data only)
───────────────────────────────────────────── */
async function getMonthlySummary(userId, month, year) {
  // Keeping your original function intact so individual monthly endpoints still work perfectly!
  const totalsRows = await query(
    `SELECT
       COALESCE(SUM(CASE WHEN type='income'  THEN amount_in_base_currency END), 0) AS income,
       COALESCE(SUM(CASE WHEN type='expense' THEN amount_in_base_currency END), 0) AS expenses
     FROM transactions
     WHERE user_id=$1
       AND EXTRACT(MONTH FROM date)=$2
       AND EXTRACT(YEAR FROM date)=$3
       AND deleted_at IS NULL`,
    [userId, month, year]
  );

  const totals = totalsRows[0] || {};

  const topCategories = await query(
    `SELECT c.name AS "categoryName",
            c.icon AS "categoryIcon",
            SUM(t.amount_in_base_currency)::float AS total
     FROM transactions t
     JOIN categories c ON c.id = t.category_id
     WHERE t.user_id=$1
       AND t.type='expense'
       AND EXTRACT(MONTH FROM t.date)=$2
       AND EXTRACT(YEAR FROM t.date)=$3
       AND deleted_at IS NULL
     GROUP BY c.name, c.icon
     ORDER BY total DESC
     LIMIT 5`,
    [userId, month, year]
  );

  const totalIncome = parseFloat(totals.income || 0);
  const totalExpenses = parseFloat(totals.expenses || 0);

  return {
    month,
    year,
    totalIncome,
    totalExpenses,
    netSavings: totalIncome - totalExpenses,
    topCategories: Array.isArray(topCategories?.rows) ? topCategories.rows : topCategories || [],
  };
}

/* ─────────────────────────────────────────────
   2. CATEGORY BREAKDOWN (expense analysis)
───────────────────────────────────────────── */
async function getCategoryBreakdown(userId, month, year) {
  const result = await query(
    `SELECT c.name AS "categoryName",
            c.icon AS "categoryIcon",
            c.color AS "categoryColor",
            COALESCE(SUM(t.amount_in_base_currency), 0)::float AS total
     FROM transactions t
     JOIN categories c ON c.id = t.category_id
     WHERE t.user_id=$1
       AND t.type='expense'
       AND EXTRACT(MONTH FROM t.date)=$2
       AND EXTRACT(YEAR FROM t.date)=$3
       AND deleted_at IS NULL
     GROUP BY c.name, c.icon, c.color
     ORDER BY total DESC`,
    [userId, month, year]
  );

  const rows = Array.isArray(result?.rows) ? result.rows : result || [];
  if (rows.length === 0) return [];

  const grandTotal = rows.reduce((sum, r) => sum + Number(r.total || 0), 0);

  return rows.map((r) => ({
    categoryName: r.categoryName,
    categoryIcon: r.categoryIcon,
    categoryColor: r.categoryColor,
    total: Number(r.total || 0),
    percentage: grandTotal > 0 ? (Number(r.total || 0) / grandTotal) * 100 : 0,
  }));
}

/* ─────────────────────────────────────────────
   3. MONTHLY REPORT (COMBINED + INSIGHTS)
───────────────────────────────────────────── */
async function getMonthlyReport(userId, month, year) {
  const summary = await getMonthlySummary(userId, month, year);
  const breakdown = await getCategoryBreakdown(userId, month, year);
  const insights = generateMonthlyInsights(summary, breakdown);

  return {
    ...summary,
    breakdown,
    insights,
  };
}

/* ─────────────────────────────────────────────
   4. YEARLY REPORT (OPTIMIZED: NO N+1 LOOP)
───────────────────────────────────────────── */
async function getYearlySummary(userId, year) {
  // Step 1: Batch fetch all data for the year at once (Only 3 database calls total!)
  const yearlyTotalsPromise = query(
    `SELECT 
       EXTRACT(MONTH FROM date)::int AS month,
       COALESCE(SUM(CASE WHEN type='income'  THEN amount_in_base_currency END), 0)::float AS income,
       COALESCE(SUM(CASE WHEN type='expense' THEN amount_in_base_currency END), 0)::float AS expenses
     FROM transactions
     WHERE user_id = $1 
       AND EXTRACT(YEAR FROM date) = $2 
       AND deleted_at IS NULL
     GROUP BY EXTRACT(MONTH FROM date)`,
    [userId, year]
  );

  const yearlyBreakdownPromise = query(
    `SELECT 
       EXTRACT(MONTH FROM t.date)::int AS month,
       c.name AS "categoryName",
       c.icon AS "categoryIcon",
       c.color AS "categoryColor",
       SUM(t.amount_in_base_currency)::float AS total
     FROM transactions t
     JOIN categories c ON c.id = t.category_id
     WHERE t.user_id = $1
       AND t.type = 'expense'
       AND EXTRACT(YEAR FROM t.date) = $2
       AND t.deleted_at IS NULL
     GROUP BY EXTRACT(MONTH FROM t.date), c.name, c.icon, c.color
     ORDER BY month ASC, total DESC`,
    [userId, year]
  );

  // Execute them concurrently
  const [totalsResult, breakdownResult] = await Promise.all([
    yearlyTotalsPromise,
    yearlyBreakdownPromise
  ]);

  const totalsRows = Array.isArray(totalsResult?.rows) ? totalsResult.rows : totalsResult || [];
  const breakdownRows = Array.isArray(breakdownResult?.rows) ? breakdownResult.rows : breakdownResult || [];

  // Step 2: Structure the data by month in memory for instant lookups
  const totalsByMonth = {};
  totalsRows.forEach(row => {
    totalsByMonth[row.month] = row;
  });

  const breakdownByMonth = {};
  breakdownRows.forEach(row => {
    if (!breakdownByMonth[row.month]) breakdownByMonth[row.month] = [];
    breakdownByMonth[row.month].push({
      categoryName: row.categoryName,
      categoryIcon: row.categoryIcon,
      categoryColor: row.categoryColor,
      total: row.total
    });
  });

  // Step 3: Loop 1 to 12 in-memory (lightning fast)
  const results = [];
  for (let month = 1; month <= 12; month++) {
    const monthTotals = totalsByMonth[month] || { income: 0, expenses: 0 };
    const rawBreakdown = breakdownByMonth[month] || [];

    const totalIncome = parseFloat(monthTotals.income || 0);
    const totalExpenses = parseFloat(monthTotals.expenses || 0);

    // Calculate breakdown percentages
    const grandTotal = rawBreakdown.reduce((sum, r) => sum + r.total, 0);
    const breakdown = rawBreakdown.map(r => ({
      ...r,
      percentage: grandTotal > 0 ? (r.total / grandTotal) * 100 : 0
    }));

    // Get top 5 categories for the summary component
    const topCategories = breakdown.slice(0, 5).map(r => ({
      categoryName: r.categoryName,
      categoryIcon: r.categoryIcon,
      total: r.total
    }));

    const summary = {
      month,
      year: parseInt(year),
      totalIncome,
      totalExpenses,
      netSavings: totalIncome - totalExpenses,
      topCategories,
    };

    // Calculate AI insights using your existing module package
    const insights = generateMonthlyInsights(summary, breakdown);

    results.push({
      ...summary,
      breakdown,
      insights,
    });
  }

  return results;
}

async function getMonthlyReport(userId, month, year) {
  const transactions = await transactionRepo.findByMonth(
    userId,
    month,
    year
  );

  const income = sumByType(transactions, 'income');
  const expense = sumByType(transactions, 'expense');

  return {
    income,
    expense,
    balance: income - expense,
    byCategory: groupByCategory(transactions),
    transactions,
  };
}

/* ─────────────────────────────────────────────
   EXPORTS
───────────────────────────────────────────── */
module.exports = {
  getMonthlySummary,
  getCategoryBreakdown,
  getMonthlyReport,
  getYearlySummary,
  getMonthlyReport
};