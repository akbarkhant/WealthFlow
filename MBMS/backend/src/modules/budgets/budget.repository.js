// budget.repository.js

const { query } = require('../../config/db.config');
const { v4: uuidv4 } = require('uuid');

// ── Column selector matching actual table schema ─────────────────────────────
//
// Table: budgets
// Columns: id, user_id, category_id, name, amount, spent,
//          period, status, start_date, end_date,
//          alert_threshold, created_at, updated_at

const BUDGET_SELECT = `
  b.id,
  b.user_id          AS "userId",
  b.category_id      AS "categoryId",
  c.name             AS "categoryName",
  c.icon             AS "categoryIcon",
  c.color            AS "categoryColor",
  b.name,
  b.amount,
  b.period,
  b.status,
  b.start_date       AS "startDate",
  b.end_date         AS "endDate",
  b.alert_threshold  AS "alertThreshold",
  b.created_at       AS "createdAt",
  b.updated_at       AS "updatedAt",
  COALESCE(
    SUM(
      CASE
        WHEN t.type = 'expense'
         AND t.deleted_at IS NULL
         AND t.date >= b.start_date
         AND (b.end_date IS NULL OR t.date <= b.end_date)
        THEN t.amount_in_base_currency
        ELSE 0
      END
    ), 0
  )::float AS spent
`;

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Enriches a raw budget row with computed fields:
 *  - remaining   : amount - spent
 *  - percentUsed : (spent / amount) * 100
 *  - isOverBudget: spent > amount
 *  - isAlerted   : percentUsed >= alertThreshold
 */
function enrichBudget(b) {
  const spent      = Number(b.spent);
  const amount     = Number(b.amount);
  const threshold  = Number(b.alertThreshold ?? 80);
  const percentUsed = amount > 0 ? (spent / amount) * 100 : 0;

  return {
    ...b,
    amount,
    spent,
    remaining:    amount - spent,
    percentUsed,
    isOverBudget: spent > amount,
    isAlerted:    percentUsed >= threshold,
  };
}

// ── Base GROUP BY clause (must list every non-aggregate SELECT column) ────────

const GROUP_BY = `
  GROUP BY
    b.id,
    c.name,
    c.icon,
    c.color
`;

// ── Queries ──────────────────────────────────────────────────────────────────

/**
 * Get all budgets for a user, optionally filtered by status or period.
 *
 * @param {string} userId
 * @param {object} filters  - { status, period }  (both optional)
 */
async function findAllForUser(userId, filters = {}) {
  const conditions = ['b.user_id = $1', 'b.deleted_at IS NULL'];
  const values     = [userId];
  let   idx        = 2;

  if (filters.status) {
    conditions.push(`b.status = $${idx++}`);
    values.push(filters.status);
  }

  if (filters.period) {
    conditions.push(`b.period = $${idx++}`);
    values.push(filters.period);
  }

  const rows = await query(
    `SELECT ${BUDGET_SELECT}
     FROM   budgets b
     JOIN   categories c ON c.id = b.category_id
     LEFT   JOIN transactions t ON t.category_id = b.category_id
                                AND t.user_id     = b.user_id
     WHERE  ${conditions.join(' AND ')}
     ${GROUP_BY}
     ORDER BY b.created_at DESC`,
    values
  );

  return rows.map(enrichBudget);
}

/**
 * Get budgets that are currently active (today falls between start_date and end_date).
 *
 * @param {string} userId
 */
async function findActive(userId) {
  const rows = await query(
    `SELECT ${BUDGET_SELECT}
     FROM   budgets b
     JOIN   categories c ON c.id = b.category_id
     LEFT   JOIN transactions t ON t.category_id = b.category_id
                                AND t.user_id     = b.user_id
     WHERE  b.user_id    = $1
       AND  b.status     = 'active'
       AND  b.start_date <= CURRENT_DATE
       AND  (b.end_date IS NULL OR b.end_date >= CURRENT_DATE)
       AND  b.deleted_at IS NULL
     ${GROUP_BY}
     ORDER BY b.created_at DESC`,
    [userId]
  );

  return rows.map(enrichBudget);
}

/**
 * Get a single budget by id, scoped to the user.
 *
 * @param {string} id
 * @param {string} userId
 */
async function findById(id, userId) {
  const rows = await query(
    `SELECT ${BUDGET_SELECT}
     FROM   budgets b
     JOIN   categories c ON c.id = b.category_id
     LEFT   JOIN transactions t ON t.category_id = b.category_id
                                AND t.user_id     = b.user_id
     WHERE  b.id      = $1
       AND  b.user_id = $2
       AND  b.deleted_at IS NULL
     ${GROUP_BY}`,
    [id, userId]
  );

  if (!rows[0]) return null;
  return enrichBudget(rows[0]);
}

/**
 * Find a budget by category for the user (useful for duplicate-check on create).
 *
 * @param {string} userId
 * @param {string} categoryId
 */
async function findByCategory(userId, categoryId) {
  const rows = await query(
    `SELECT id FROM budgets
     WHERE  user_id     = $1
       AND  category_id = $2
       AND  status      = 'active'
       AND  deleted_at  IS NULL
     LIMIT 1`,
    [userId, categoryId]
  );

  if (!rows[0]) return null;
  return findById(rows[0].id, userId);
}

/**
 * Create a new budget.
 *
 * @param {string} userId
 * @param {object} input  - { categoryId, name, amount, period,
 *                            startDate, endDate?, alertThreshold? }
 */
async function create(userId, input) {
  const id = uuidv4();

  await query(
    `INSERT INTO budgets (
       id, user_id, category_id, name,
       amount, period, status,
       start_date, end_date, alert_threshold
     )
     VALUES ($1,$2,$3,$4,$5,$6,'active',$7,$8,$9)`,
    [
      id,
      userId,
      input.categoryId,
      input.name,
      input.amount,
      input.period,                    // 'weekly' | 'monthly' | 'yearly' | 'custom'
      input.startDate,
      input.endDate    ?? null,
      input.alertThreshold ?? 80,      // default alert at 80 %
    ]
  );

  return findById(id, userId);
}

/**
 * Update allowed fields on an existing budget.
 *
 * @param {string} id
 * @param {string} userId
 * @param {object} input  - any subset of { name, amount, period,
 *                            startDate, endDate, alertThreshold, status }
 */
async function update(id, userId, input) {
  const ALLOWED = {
    name:           'name',
    amount:         'amount',
    period:         'period',
    startDate:      'start_date',
    endDate:        'end_date',
    alertThreshold: 'alert_threshold',
    status:         'status',
  };

  const fields = [];
  const values = [];
  let   idx    = 1;

  // 1. Loop through allowed keys to build dynamic SET clauses
  for (const [jsKey, dbCol] of Object.entries(ALLOWED)) {
    if (input[jsKey] !== undefined) {
      fields.push(`${dbCol} = $${idx++}`);
      values.push(input[jsKey]);
    }
  }

  // If no allowed fields are provided, bypass db hit and return current record
  if (fields.length === 0) {
    return findById(id, userId);
  }

  // 2. Append standard timestamp changes
  fields.push(`updated_at = NOW()`);

  // 3. Track parameter placements cleanly to keep values in structural alignment
  const idIdx = idx++;
  values.push(id);

  const userIdIdx = idx;
  values.push(userId);

  // 4. Fire query securely against your PostgreSQL database connection pool
  await query(
    `UPDATE budgets
     SET    ${fields.join(', ')}
     WHERE  id      = $${idIdx}
       AND  user_id = $${userIdIdx}
       AND  deleted_at IS NULL`,
    values
  );

  // Return the newly modified budget record
  return findById(id, userId);
}

/**
 * Soft-delete a budget (sets deleted_at instead of hard DELETE).
 *
 * @param {string} id
 * @param {string} userId
 */
async function remove(id, userId) {
  // 🛠️ FIX: Capitalized 'INACTIVE' to match your PostgreSQL enum constraint type exactly
  const result = await query(
    `UPDATE budgets 
     SET    status     = 'archived', 
            deleted_at = NOW() 
     WHERE  id         = $1 
       AND  user_id    = $2 
       AND  deleted_at IS NULL`, 
    [id, userId]
  );

  return result;
}

/**
 * Sync the stored `spent` column from live transaction data.
 * Call this after any transaction insert / update / delete.
 *
 * @param {string} budgetId
 * @param {string} userId
 */
async function syncSpent(budgetId, userId) {
  await query(
    `UPDATE budgets b
     SET    spent      = (
              SELECT COALESCE(SUM(t.amount_in_base_currency), 0)
              FROM   transactions t
              WHERE  t.category_id = b.category_id
                AND  t.user_id     = b.user_id
                AND  t.type        = 'expense'
                AND  t.date       >= b.start_date
                AND  (b.end_date IS NULL OR t.date <= b.end_date)
                AND  t.deleted_at IS NULL
            ),
            updated_at = NOW()
     WHERE  b.id      = $1
       AND  b.user_id = $2`,
    [budgetId, userId]
  );

  return findById(budgetId, userId);
}

/**
 * Get all budgets for a user for a specific month and year.
 */
async function findAllForMonth(userId, month, year) {
  const rows = await query(
    `SELECT ${BUDGET_SELECT}
     FROM   budgets b
     JOIN   categories c ON c.id = b.category_id
     LEFT   JOIN transactions t ON t.category_id = b.category_id
                                AND t.user_id     = b.user_id
     WHERE  b.user_id    = $1
       AND  EXTRACT(MONTH FROM b.start_date) = $2
       AND  EXTRACT(YEAR FROM b.start_date)  = $3
       AND  b.deleted_at IS NULL
     ${GROUP_BY}
     ORDER BY b.created_at DESC`,
    [userId, month, year]
  );

  return rows.map(enrichBudget);
}

/**
 * Find a budget for a category and specific month/year.
 */
async function findByCategoryMonth(userId, categoryId, month, year) {
  const rows = await query(
    `SELECT ${BUDGET_SELECT}
     FROM   budgets b
     JOIN   categories c ON c.id = b.category_id
     LEFT   JOIN transactions t ON t.category_id = b.category_id
                                AND t.user_id     = b.user_id
     WHERE  b.user_id     = $1
       AND  b.category_id = $2
       AND  EXTRACT(MONTH FROM b.start_date) = $3
       AND  EXTRACT(YEAR FROM b.start_date)  = $4
       AND  b.deleted_at  IS NULL
     ${GROUP_BY}`,
    [userId, categoryId, month, year]
  );

  if (!rows[0]) return null;
  return enrichBudget(rows[0]);
}

// ── Exports ──────────────────────────────────────────────────────────────────

module.exports = {
  findAllForUser,
  findActive,
  findById,
  findByCategory,
  findByCategoryMonth,
  findAllForMonth,
  create,
  update,
  remove,
  syncSpent,
};