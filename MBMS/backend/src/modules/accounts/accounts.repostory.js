// src/modules/accounts/accounts.repository.js
const db = require('../../config/db.config'); // Your pg Pool instance

/**
 * Executes raw SQL insertions to create an account row in PostgreSQL
 */
async function create(userId, { name, type, balance, currency }) {
  const query = `
    INSERT INTO accounts (user_id, name, type, balance, currency)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *;
  `;
  const values = [userId, name, type, balance, currency];
  const { rows } = await db.query(query, values);
  return rows[0];
}

/**
 * Queries the database for all account records tied to a specific User UUID
 */
async function findByUserId(userId) {
  const query = `
    SELECT id, user_id, name, type, balance, currency, created_at, updated_at 
    FROM accounts 
    WHERE user_id = $1 
    ORDER BY created_at DESC;
  `;
  const { rows } = await db.query(query, [userId]);
  return rows;
}

/**
 * Queries a single account by ID and verifies owner access
 */
async function findByIdAndUser(accountId, userId) {
  const query = `
    SELECT * FROM accounts 
    WHERE id = $1 AND user_id = $2;
  `;
  const { rows } = await db.query(query, [accountId, userId]);
  return rows[0] || null;
}

/**
 * Updates variable parameters for a specific database row record
 */
async function update(accountId, userId, { name, type, balance, currency }) {
  const query = `
    UPDATE accounts 
    SET name = COALESCE($1, name),
        type = COALESCE($2, type),
        balance = COALESCE($3, balance),
        currency = COALESCE($4, currency),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $5 AND user_id = $6
    RETURNING *;
  `;
  const values = [name, type, balance, currency, accountId, userId];
  const { rows } = await db.query(query, values);
  return rows[0];
}

module.exports = {
  create,
  findByUserId,
  findByIdAndUser,
  update
};