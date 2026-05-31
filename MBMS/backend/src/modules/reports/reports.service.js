// reports.service.js

const { query } = require('../../config/db.config');
const { generateMonthlyInsights } = require('../insights/insights.service');

/* ─────────────────────────────────────────────
   1. MONTHLY SUMMARY (core data only)
───────────────────────────────────────────── */
async function getMonthlySummary(userId, month, year) {
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
       AND t.deleted_at IS NULL
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
    topCategories,
  };
}

/* ─────────────────────────────────────────────
   2. CATEGORY BREAKDOWN (expense analysis)
───────────────────────────────────────────── */
async function getCategoryBreakdown(userId, month, year) {
  const rows = await query(
    `SELECT c.name AS "categoryName",
            c.icon AS "categoryIcon",
            c.color AS "categoryColor",
            SUM(t.amount_in_base_currency)::float AS total
     FROM transactions t
     JOIN categories c ON c.id = t.category_id
     WHERE t.user_id=$1
       AND t.type='expense'
       AND EXTRACT(MONTH FROM t.date)=$2
       AND EXTRACT(YEAR FROM t.date)=$3
       AND t.deleted_at IS NULL
     GROUP BY c.name, c.icon, c.color
     ORDER BY total DESC`,
    [userId, month, year]
  );

  const grandTotal = rows.reduce((sum, r) => sum + r.total, 0);

  return rows.map((r) => ({
    ...r,
    percentage: grandTotal > 0 ? (r.total / grandTotal) * 100 : 0,
  }));
}

/* ─────────────────────────────────────────────
   3. MONTHLY REPORT (COMBINED + INSIGHTS)
───────────────────────────────────────────── */
async function getMonthlyReport(userId, month, year) {
  // Step 1: fetch raw data
  const summary = await getMonthlySummary(userId, month, year);
  const breakdown = await getCategoryBreakdown(userId, month, year);

  // Step 2: generate insights (AI-like layer)
  const insights = generateMonthlyInsights(summary, breakdown);

  // Step 3: final response
  return {
    ...summary,
    breakdown,
    insights,
  };
}

/* ─────────────────────────────────────────────
   4. YEARLY REPORT (builds from monthly)
───────────────────────────────────────────── */
async function getYearlySummary(userId, year) {
  const results = [];

  for (let month = 1; month <= 12; month++) {
    const monthly = await getMonthlyReport(userId, month, year);
    results.push(monthly);
  }

  return results;
}

/* ─────────────────────────────────────────────
   EXPORTS
───────────────────────────────────────────── */
module.exports = {
  getMonthlySummary,
  getCategoryBreakdown,
  getMonthlyReport,
  getYearlySummary,
};