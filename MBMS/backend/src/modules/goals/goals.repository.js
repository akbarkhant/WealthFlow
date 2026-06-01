// goals.repository.js

const { pool } = require('../../config/db.config');

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * AUXILIARY HELPERS / STATUS FRAGMENT
 * Used to compute dynamic status (ACTIVE, COMPLETED, OVERDUE) based on target,
 * current amounts, and the deadline timestamp.
 * ─────────────────────────────────────────────────────────────────────────────
 */
const STATUS_EXPRESSION = `
  CASE 
    WHEN status = 'COMPLETED' OR current_amount >= target_amount THEN 'COMPLETED'
    WHEN deadline IS NOT NULL AND deadline < NOW() THEN 'OVERDUE'
    ELSE 'ACTIVE'
  END AS status
`;

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * GET ALL GOALS (USER SCOPED)
 * Includes dynamic progress calculations, currency defaults, and live statuses.
 * ─────────────────────────────────────────────────────────────────────────────
 */
async function findAllByUser(userId) {
  const { rows } = await pool.query(
    `SELECT
        id,
        user_id,
        name,
        icon,
        target_amount,
        current_amount,
        currency,
        allow_overflow,
        deadline,
        status,
        ${STATUS_EXPRESSION},
        ROUND(
          CASE 
            WHEN target_amount IS NULL OR target_amount = 0 THEN 0
            ELSE (current_amount::numeric / target_amount) * 100
          END,
          2
        ) AS progress_percentage,
        CASE 
          WHEN deadline IS NOT NULL AND deadline > NOW() AND current_amount < target_amount THEN
            GREATEST(CEIL(EXTRACT(EPOCH FROM (deadline - NOW())) / 86400), 1)
          ELSE 0
        END AS days_remaining,
        created_at,
        updated_at
     FROM goals
     WHERE user_id = $1
     ORDER BY created_at DESC`,
    [userId]
  );
  // Inside goals.repository.js -> findAllByUser
console.log("REPOSITORY QUERYING FOR USER ID:", userId);

  return rows;
}

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * GET GOAL BY ID (SECURE)
 * ─────────────────────────────────────────────────────────────────────────────
 */
// Inside goals.repository.js -> findById function
async function findById(id, userId) {
  const query = `
    SELECT 
      id, 
      user_id, 
      name, 
      target_amount, 
      current_amount, 
      currency, 
      status, -- Updated from status to match your new schema
      allow_overflow, 
      deadline, 
      created_at, 
      updated_at
    FROM goals 
    WHERE id = $1 AND user_id = $2;
  `;
  
  const res = await pool.query(query, [id, userId]);
  return res.rows[0];
}

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * CREATE GOAL
 * Enforces schema validation baselines like target_amount > 0.
 * ─────────────────────────────────────────────────────────────────────────────
 */
async function create({
  userId,
  name,
  icon = '🎯',
  target_amount,
  current_amount = 0,
  currency = 'USD',
  allow_overflow = false,
  deadline = null
}) {
  // Defensive validation in the repository layer
  if (!name || !userId || target_amount <= 0) {
    throw new Error("Invalid payload: Name, User ID, and a positive Target Amount are required.");
  }

  const { rows } = await pool.query(
    `INSERT INTO goals (
        user_id,
        name,
        icon,
        target_amount,
        current_amount,
        currency,
        allow_overflow,
        deadline,
        status
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING *, ${STATUS_EXPRESSION}`,
    [
      userId, 
      name, 
      icon, 
      target_amount, 
      current_amount, 
      currency, 
      allow_overflow, 
      deadline, 
      current_amount >= target_amount ? 'COMPLETED' : 'ACTIVE'
    ]
  );

  return rows[0];
}

/**
 * ─────────────────────────────────────────────────────────────────
 * REPOSITORY LAYER: PROCESS GOAL CONTRIBUTION (LEDGER TRANSATION)
 * ─────────────────────────────────────────────────────────────────
 * Handled inside an atomic database transaction using FOR UPDATE 
 * locking to prevent financial race conditions in concurrent requests.
 */
async function contribute({ goalId, userId, amount, source = 'manual', note = null }) {
  // Defensive validation rule
  if (!amount || Number(amount) <= 0) {
    throw new Error("Contribution amount must be greater than 0");
  }

  // Get a single client out of the pool to ensure structural atomicity for our transaction
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Fetch current goal state with an exclusive lock for updates (Prevents race conditions)
    const goalRes = await client.query(
      `SELECT id, current_amount, target_amount, allow_overflow, status 
       FROM goals 
       WHERE id = $1 AND user_id = $2 
       FOR UPDATE`,
      [goalId, userId]
    );

    const goal = goalRes.rows[0];
    if (!goal) {
      throw new Error("Goal not found or access denied.");
    }

    // Guardrail: Completed goals should not accept contributions unless explicitly reopened
    if (goal.status === 'COMPLETED') {
      throw new Error("Cannot contribute to a completed goal unless explicitly reopened.");
    }

    // 2. Calculate New Balance based on your Overflow Rules
    let newAmount = Number(goal.current_amount || 0) + Number(amount);
    const target = Number(goal.target_amount || 0);

    if (newAmount > target && !goal.allow_overflow) {
      newAmount = target; // Clamp to cap if overflow is disabled
    }

    // Dynamic lifecycle management status change
    const nextStatus = newAmount >= target ? 'COMPLETED' : goal.status;

    // 3. Persist the updated Goal Metrics
    const updatedGoalRes = await client.query(
      `UPDATE goals
       SET
         current_amount = $1,
         status = $2,
         updated_at = NOW()
       WHERE id = $3
       RETURNING *`,
      [newAmount, nextStatus, goalId]
    );

    // 4. Record into Ledger Table for Audit / Metrics tracking (ERP compliant)
    await client.query(
      `INSERT INTO goal_contributions (
        goal_id,
        amount,
        source,
        note,
        created_at
       )
       VALUES ($1, $2, $3, $4, NOW())`,
      [goalId, Number(amount), source, note]
    );

    // Everything checks out safely, commit transaction atomically
    await client.query('COMMIT');

    // Return the updated goal state back to the service layer
    return updatedGoalRes.rows[0];

  } catch (error) {
    // If anything fails during calculation or entry, wipe execution trail completely
    await client.query('ROLLBACK');
    throw error;
  } finally {
    // Release client back to the connection pool instantly
    client.release();
  }
}

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * UPDATE GOAL (PARTIAL UPDATE WITH CONSTRAINTS)
 * Prevents dropping the target below the current accumulated balance.
 * ─────────────────────────────────────────────────────────────────────────────
 */
async function update(goalId, userId, fields) {
  const { name, icon, target_amount, deadline, allowOverflow } = fields;

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Lock and evaluate the current value
    const goalRes = await client.query(
      `SELECT current_amount, status FROM goals WHERE id = $1 AND user_id = $2 FOR UPDATE`,
      [goalId, userId]
    );
    
    const currentGoal = goalRes.rows[0];
    if (!currentGoal) {
      throw new Error("Goal not found or access denied.");
    }

    // Validation: block targets that would slice through current actual numbers
    if (target_amount !== undefined && target_amount < currentGoal.current_amount) {
      throw new Error("Cannot update target amount to be lower than the current accumulated progress.");
    }

    const { rows } = await client.query(
      `UPDATE goals
       SET
         name = COALESCE($1, name),
         icon = COALESCE($2, icon),
         target_amount = COALESCE($3, target_amount),
         deadline = COALESCE($4, deadline),
         allow_overflow = COALESCE($5, allow_overflow),
         status = CASE 
            WHEN COALESCE($3, target_amount) <= current_amount THEN 'COMPLETED'
            ELSE status
         END,
         updated_at = NOW()
       WHERE id = $6 AND user_id = $7
       RETURNING *, ${STATUS_EXPRESSION}`,
      [name, icon, target_amount, deadline, allowOverflow, goalId, userId]
    );

    await client.query('COMMIT');
    return rows[0] || null;

  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * DELETE GOAL
 * Cascades or securely detaches contributions automatically if FK is setup.
 * ─────────────────────────────────────────────────────────────────────────────
 */
async function remove(goalId, userId) {
  const { rowCount } = await pool.query(
    `DELETE FROM goals
     WHERE id = $1 AND user_id = $2`,
    [goalId, userId]
  );

  return rowCount > 0;
}

module.exports = {
  findAllByUser,
  findById,
  create,
  contribute,
  update,
  remove
};