// goals.repository.js
// Raw PostgreSQL queries for the goals module.
// Follows the same repository pattern as transactions.repository.js

const { pool } = require('../../config/db.config'); // adjust path to your DB pool

/**
 * Fetch all goals for a user, ordered by creation date.
 */
async function findAllByUser(userId) {
  const { rows } = await pool.query(
    `SELECT
       id, user_id, name, icon,
       target_amount, current_amount,
       ROUND((current_amount / NULLIF(target_amount, 0)) * 100, 1) AS progress_pct,
       deadline, is_completed, created_at, updated_at
     FROM goals
     WHERE user_id = $1
     ORDER BY created_at DESC`,
    [userId]
  );
  return rows;
}

/**
 * Fetch a single goal by ID, scoped to the user for security.
 */
async function findById(goalId, userId) {
  const { rows } = await pool.query(
    `SELECT * FROM goals WHERE id = $1 AND user_id = $2`,
    [goalId, userId]
  );
  return rows[0] || null;
}

/**
 * Create a new goal.
 */
async function create({ userId, name, icon, targetAmount, currentAmount, deadline }) {
  const { rows } = await pool.query(
    `INSERT INTO goals (user_id, name, icon, target_amount, current_amount, deadline)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [userId, name, icon || '🎯', targetAmount, currentAmount || 0, deadline || null]
  );
  return rows[0];
}

/**
 * Contribute an amount to a goal (adds to current_amount).
 * Automatically marks is_completed when target is reached.
 */
async function contribute(goalId, userId, amount) {
  const { rows } = await pool.query(
    `UPDATE goals
     SET
       current_amount = LEAST(current_amount + $1, target_amount),
       is_completed   = (current_amount + $1 >= target_amount)
     WHERE id = $2 AND user_id = $3
     RETURNING *`,
    [amount, goalId, userId]
  );
  return rows[0] || null;
}

/**
 * General update — name, icon, target, deadline.
 */
async function update(goalId, userId, fields) {
  const { name, icon, targetAmount, deadline } = fields;
  const { rows } = await pool.query(
    `UPDATE goals
     SET
       name          = COALESCE($1, name),
       icon          = COALESCE($2, icon),
       target_amount = COALESCE($3, target_amount),
       deadline      = COALESCE($4, deadline)
     WHERE id = $5 AND user_id = $6
     RETURNING *`,
    [name, icon, targetAmount, deadline, goalId, userId]
  );
  return rows[0] || null;
}

/**
 * Delete a goal.
 */
async function remove(goalId, userId) {
  const { rowCount } = await pool.query(
    `DELETE FROM goals WHERE id = $1 AND user_id = $2`,
    [goalId, userId]
  );
  return rowCount > 0;
}

module.exports = { findAllByUser, findById, create, contribute, update, remove };