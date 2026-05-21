const { query } = require('../../config/db.config');

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

  const totals = totalsRows[0];

  const topCategories = await query(
    `SELECT c.name AS "categoryName", c.icon AS "categoryIcon",
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

  const totalIncome = parseFloat((totals && totals.income) || '0');
  const totalExpenses = parseFloat((totals && totals.expenses) || '0');

  return {
    month,
    year,
    totalIncome,
    totalExpenses,
    netSavings: totalIncome - totalExpenses,
    topCategories,
  };
}

async function getYearlySummary(userId, year) {
  const results = [];

  for (let m = 1; m <= 12; m++) {
    const summary = await getMonthlySummary(userId, m, year);
    results.push(summary);
  }

  return results;
}

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

module.exports = {
  getMonthlySummary,
  getYearlySummary,
  getCategoryBreakdown,
};