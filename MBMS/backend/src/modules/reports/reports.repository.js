const { query } = require('../../config/db.config');

async function getWeeklyTransactions(userId, startDate, endDate) {
  const sql = `
    SELECT
      t.id,
      t.amount,
      t.type,
      t.description,
      t.date::text,
      c.name AS "categoryName"
    FROM transactions t
    LEFT JOIN categories c ON c.id = t.category_id
    WHERE t.user_id = $1
      AND t.deleted_at IS NULL
      AND t.type = 'expense'
      AND t.date >= $2
      AND t.date <= $3
    ORDER BY t.date DESC;
  `;
  return query(sql, [userId, startDate, endDate]);
}

async function getAllUsersWithEmail() {
  const sql = `
    SELECT
      id,
      name,
      email,
      currency
    FROM users
    WHERE deleted_at IS NULL
      AND email IS NOT NULL
    ORDER BY created_at ASC;
  `;
  return query(sql, []);
}

module.exports = { getWeeklyTransactions, getAllUsersWithEmail };