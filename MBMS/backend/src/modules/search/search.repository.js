// src/modules/search/search.repository.js
const pool = require('../../config/db.config');

/**
 * Searches user transactions by description, notes, or category name.
 * @param {number|string} userId - The authenticated user's ID
 * @param {string} searchTerm - The raw text query from the frontend
 * @returns {Promise<Array>} Array of matching transaction objects
 */
async function searchTransactions(userId, searchTerm) {
  const query = `
    SELECT 
      t.id,
      t.description,
      t.amount,
      t.amount_in_base,
      t.currency,
      t.type,
      t.date,
      t.notes,
      c.name AS category_name
    FROM transactions t
    LEFT JOIN categories c ON t.category_id = c.id
    WHERE t.user_id = $1
      AND (
        t.description ILIKE $2 
        OR t.notes ILIKE $2 
        OR c.name ILIKE $2
      )
    ORDER BY t.date DESC
    LIMIT 30;
  `;

  // Wrapping the term in % means "contains this string anywhere"
  const wildCardTerm = `%${searchTerm}%`;
  const values = [userId, wildCardTerm];

  const result = await pool.query(query, values);
  return result.rows;
}

module.exports = {
  searchTransactions,
};