// transactions.repository.js

const { query } = require('../../config/db.config');
const { v4: uuidv4 } = require('uuid');
const { PAGINATION_DEFAULTS } = require('../../shared/constants');

const TRANSACTION_SELECT = `
  t.id,
  t.user_id AS "userId",
  t.category_id AS "categoryId",
  c.name AS "categoryName",
  c.icon AS "categoryIcon",
  t.amount,
  t.currency,
  t.amount_in_base_currency AS "amountInBaseCurrency",
  t.type,
  t.description,
  t.date::text,
  t.is_recurring AS "isRecurring",
  t.created_at AS "createdAt",
  t.updated_at AS "updatedAt"
`;

// ── Find All Transactions ────────────────────────────────────────
async function findAll(userId, q) {
  const conditions = [
    't.user_id = $1',
    't.deleted_at IS NULL',
  ];

  const values = [userId];

  let idx = 2;

  if (q.type) {
    conditions.push(`t.type = $${idx++}`);
    values.push(q.type);
  }

  if (q.categoryId) {
    conditions.push(`t.category_id = $${idx++}`);
    values.push(q.categoryId);
  }

  if (q.startDate) {
    conditions.push(`t.date >= $${idx++}`);
    values.push(q.startDate);
  }

  if (q.endDate) {
    conditions.push(`t.date <= $${idx++}`);
    values.push(q.endDate);
  }

  if (q.search) {
    conditions.push(`t.description ILIKE $${idx++}`);
    values.push(`%${q.search}%`);
  }

  const where = conditions.join(' AND ');

  const offset = (q.page - 1) * q.limit;

  // Total count
  const countRows = await query(
    `SELECT COUNT(*) FROM transactions t WHERE ${where}`,
    values
  );

  const countRow = countRows[0];

  // Paginated rows
  const rows = await query(
    `SELECT ${TRANSACTION_SELECT}
     FROM transactions t
     JOIN categories c ON c.id = t.category_id
     WHERE ${where}
     ORDER BY t.date DESC, t.created_at DESC
     LIMIT $${idx++}
     OFFSET $${idx}`,
    [...values, q.limit, offset]
  );

  const total = parseInt(
    (countRow && countRow.count) || '0',
    10
  );

  return {
    data: rows,

    meta: {
      total,
      page: q.page,
      limit: q.limit,
      totalPages: Math.ceil(total / q.limit),
    },
  };
}

// ── Find Transaction By ID ───────────────────────────────────────
async function findById(id, userId) {
  const rows = await query(
    `SELECT ${TRANSACTION_SELECT}
     FROM transactions t
     JOIN categories c ON c.id = t.category_id
     WHERE t.id = $1
       AND t.user_id = $2
       AND t.deleted_at IS NULL`,
    [id, userId]
  );

  return rows[0] || null;
}

// ── Create Transaction ───────────────────────────────────────────
async function create(userId, input, amountInBase) {
  const id = uuidv4();

  await query(
    `INSERT INTO transactions
      (
        id,
        user_id,
        category_id,
        amount,
        currency,
        amount_in_base_currency,
        type,
        description,
        date,
        is_recurring
      )
     VALUES
      ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
    [
      id,
      userId,
      input.categoryId,
      input.amount,
      input.currency,
      amountInBase,
      input.type,
      input.description || null,
      input.date,
      input.isRecurring,
    ]
  );

  // Re-fetch transaction with JOIN data
  return findById(id, userId);
}

// ── Update Transaction ───────────────────────────────────────────
async function update(
  id,
  userId,
  input,
  amountInBase
) {
  const fields = [];
  const values = [];

  let idx = 1;

  if (input.categoryId !== undefined) {
    fields.push(`category_id = $${idx++}`);
    values.push(input.categoryId);
  }

  if (input.amount !== undefined) {
    fields.push(`amount = $${idx++}`);
    values.push(input.amount);
  }

  if (input.currency !== undefined) {
    fields.push(`currency = $${idx++}`);
    values.push(input.currency);
  }

  if (amountInBase !== undefined) {
    fields.push(`amount_in_base_currency = $${idx++}`);
    values.push(amountInBase);
  }

  if (input.type !== undefined) {
    fields.push(`type = $${idx++}`);
    values.push(input.type);
  }

  if (input.description !== undefined) {
    fields.push(`description = $${idx++}`);
    values.push(input.description);
  }

  if (input.date !== undefined) {
    fields.push(`date = $${idx++}`);
    values.push(input.date);
  }

  if (input.isRecurring !== undefined) {
    fields.push(`is_recurring = $${idx++}`);
    values.push(input.isRecurring);
  }

  // Nothing to update
  if (fields.length === 0) {
    return findById(id, userId);
  }

  fields.push('updated_at = NOW()');

  values.push(id, userId);

  await query(
    `UPDATE transactions
     SET ${fields.join(', ')}
     WHERE id = $${idx++}
       AND user_id = $${idx}
       AND deleted_at IS NULL`,
    values
  );

  return findById(id, userId);
}

// ── Soft Delete Transaction ──────────────────────────────────────
async function softDelete(id, userId) {
  const rows = await query(
    `UPDATE transactions
     SET deleted_at = NOW()
     WHERE id = $1
       AND user_id = $2
       AND deleted_at IS NULL
     RETURNING id`,
    [id, userId]
  );

  return rows.length > 0;
}

// ── Exports ──────────────────────────────────────────────────────
module.exports = {
  findAll,
  findById,
  create,
  update,
  softDelete,
};