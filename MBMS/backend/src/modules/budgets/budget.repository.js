const { query } = require('../../config/db.config');
const { v4: uuidv4 } = require('uuid');

const BUDGET_SELECT = `
  b.id,
  b.user_id AS "userId",
  b.category_id AS "categoryId",
  c.name AS "categoryName",
  c.icon AS "categoryIcon",
  c.color AS "categoryColor",
  b.month,
  b.year,
  b.amount_limit AS "amountLimit",
  b.currency,
  COALESCE(SUM(t.amount_in_base_currency), 0)::float AS spent
`;

// ── Helpers ─────────────────────────────────────────────────────────────

function enrichBudget(b) {
  const spent = Number(b.spent);

  return {
    ...b,
    spent,
    remaining: b.amountLimit - spent,
    percentUsed:
      b.amountLimit > 0 ? (spent / b.amountLimit) * 100 : 0,
  };
}

// ── Queries ─────────────────────────────────────────────────────────────

async function findAllForMonth(userId, month, year) {
  const rows = await query(
    `SELECT ${BUDGET_SELECT}
     FROM budgets b
     JOIN categories c ON c.id = b.category_id
     LEFT JOIN transactions t ON
       t.category_id = b.category_id
       AND t.user_id = b.user_id
       AND t.type = 'expense'
       AND EXTRACT(MONTH FROM t.date) = b.month
       AND EXTRACT(YEAR FROM t.date) = b.year
       AND t.deleted_at IS NULL
     WHERE b.user_id = $1 AND b.month = $2 AND b.year = $3
     GROUP BY b.id, c.name, c.icon, c.color`,
    [userId, month, year]
  );

  return rows.map(enrichBudget);
}

async function findById(id, userId) {
  const rows = await query(
    `SELECT ${BUDGET_SELECT}
     FROM budgets b
     JOIN categories c ON c.id = b.category_id
     LEFT JOIN transactions t ON
       t.category_id = b.category_id
       AND t.user_id = b.user_id
       AND t.type = 'expense'
       AND EXTRACT(MONTH FROM t.date) = b.month
       AND EXTRACT(YEAR FROM t.date) = b.year
       AND t.deleted_at IS NULL
     WHERE b.id = $1 AND b.user_id = $2
     GROUP BY b.id, c.name, c.icon, c.color`,
    [id, userId]
  );

  const budget = rows[0];
  if (!budget) return null;

  return enrichBudget(budget);
}

async function findByCategoryMonth(userId, categoryId, month, year) {
  const rows = await query(
    'SELECT id FROM budgets WHERE user_id=$1 AND category_id=$2 AND month=$3 AND year=$4',
    [userId, categoryId, month, year]
  );

  if (!rows[0]) return null;

  return findById(rows[0].id, userId);
}

async function create(userId, input) {
  const id = uuidv4();

  await query(
    `INSERT INTO budgets (
      id, user_id, category_id, month, year, amount_limit, currency
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7)`,
    [
      id,
      userId,
      input.categoryId,
      input.month,
      input.year,
      input.amountLimit,
      input.currency,
    ]
  );

  return findById(id, userId);
}

async function update(id, userId, input) {
  const fields = [];
  const values = [];
  let idx = 1;

  if (input.amountLimit !== undefined) {
    fields.push(`amount_limit = $${idx++}`);
    values.push(input.amountLimit);
  }

  if (input.currency !== undefined) {
    fields.push(`currency = $${idx++}`);
    values.push(input.currency);
  }

  if (fields.length === 0) {
    return findById(id, userId);
  }

  values.push(id, userId);

  await query(
    `UPDATE budgets SET ${fields.join(',')}
     WHERE id=$${idx++} AND user_id=$${idx}`,
    values
  );

  return findById(id, userId);
}

async function remove(id, userId) {
  const rows = await query(
    'DELETE FROM budgets WHERE id=$1 AND user_id=$2 RETURNING id',
    [id, userId]
  );

  return rows.length > 0;
}

// ── exports ─────────────────────────────────────────────────────────────

module.exports = {
  findAllForMonth,
  findById,
  findByCategoryMonth,
  create,
  update,
  remove,
};