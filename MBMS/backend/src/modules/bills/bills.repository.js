const { query } = require('../../config/db.config');

// ── Get all bills for a user ──────────────────────────────
async function findAllByUser(userId) {
  const sql = `
    SELECT
      b.id,
      b.user_id        AS "userId",
      b.category_id    AS "categoryId",
      c.name           AS "categoryName",
      c.icon           AS "categoryIcon",
      b.name,
      b.amount,
      b.currency,
      b.due_date::text AS "dueDate",
      b.recurrence,
      b.status,
      b.notes,
      b.is_autopay     AS "isAutopay",
      b.paid_at::text  AS "paidAt",
      b.created_at::text AS "createdAt",
      b.updated_at::text AS "updatedAt"
    FROM bills b
    LEFT JOIN categories c ON c.id = b.category_id
    WHERE b.user_id = $1
      AND b.deleted_at IS NULL
    ORDER BY b.due_date ASC;
  `;
  return query(sql, [userId]);
}

// ── Get single bill ───────────────────────────────────────
async function findById(billId, userId) {
  const sql = `
    SELECT
      b.id,
      b.user_id        AS "userId",
      b.category_id    AS "categoryId",
      c.name           AS "categoryName",
      c.icon           AS "categoryIcon",
      b.name,
      b.amount,
      b.currency,
      b.due_date::text AS "dueDate",
      b.recurrence,
      b.status,
      b.notes,
      b.is_autopay     AS "isAutopay",
      b.paid_at::text  AS "paidAt",
      b.created_at::text AS "createdAt",
      b.updated_at::text AS "updatedAt"
    FROM bills b
    LEFT JOIN categories c ON c.id = b.category_id
    WHERE b.id = $1
      AND b.user_id = $2
      AND b.deleted_at IS NULL;
  `;
  const rows = await query(sql, [billId, userId]);
  return rows[0] ?? null;
}

// ── Get overdue bills ─────────────────────────────────────
async function findOverdue(userId) {
  const sql = `
    SELECT
      b.id,
      b.user_id        AS "userId",
      b.category_id    AS "categoryId",
      c.name           AS "categoryName",
      c.icon           AS "categoryIcon",
      b.name,
      b.amount,
      b.currency,
      b.due_date::text AS "dueDate",
      b.recurrence,
      b.status,
      b.notes,
      b.is_autopay     AS "isAutopay",
      b.paid_at::text  AS "paidAt",
      b.created_at::text AS "createdAt",
      b.updated_at::text AS "updatedAt"
    FROM bills b
    LEFT JOIN categories c ON c.id = b.category_id
    WHERE b.user_id = $1
      AND b.deleted_at IS NULL
      AND b.status != 'paid'
      AND b.due_date < CURRENT_DATE
    ORDER BY b.due_date ASC;
  `;
  return query(sql, [userId]);
}

// ── Get upcoming bills (next 30 days) ─────────────────────
async function findUpcoming(userId) {
  const sql = `
    SELECT
      b.id,
      b.user_id        AS "userId",
      b.category_id    AS "categoryId",
      c.name           AS "categoryName",
      c.icon           AS "categoryIcon",
      b.name,
      b.amount,
      b.currency,
      b.due_date::text AS "dueDate",
      b.recurrence,
      b.status,
      b.notes,
      b.is_autopay     AS "isAutopay",
      b.paid_at::text  AS "paidAt",
      b.created_at::text AS "createdAt",
      b.updated_at::text AS "updatedAt"
    FROM bills b
    LEFT JOIN categories c ON c.id = b.category_id
    WHERE b.user_id = $1
      AND b.deleted_at IS NULL
      AND b.status != 'paid'
      AND b.due_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'
    ORDER BY b.due_date ASC;
  `;
  return query(sql, [userId]);
}

// ── Create bill ───────────────────────────────────────────
async function createBill(userId, data) {
  const sql = `
    INSERT INTO bills (
      user_id,
      category_id,
      name,
      amount,
      currency,
      due_date,
      recurrence,
      status,
      notes,
      is_autopay
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING
      id,
      user_id        AS "userId",
      category_id    AS "categoryId",
      name,
      amount,
      currency,
      due_date::text AS "dueDate",
      recurrence,
      status,
      notes,
      is_autopay     AS "isAutopay",
      paid_at::text  AS "paidAt",
      created_at::text AS "createdAt",
      updated_at::text AS "updatedAt";
  `;
  const rows = await query(sql, [
    userId,
    data.category_id ?? null,
    data.name,
    data.amount,
    data.currency,
    data.due_date,
    data.recurrence,
    data.status,
    data.notes ?? null,
    data.is_autopay,
  ]);
  return rows[0];
}

// ── Update bill ───────────────────────────────────────────
async function updateBill(billId, userId, data) {
  const fields = [];
  const values = [];
  let idx = 1;

  const allowed = ['name', 'amount', 'currency', 'due_date', 'category_id', 'recurrence', 'status', 'notes', 'is_autopay'];

  for (const key of allowed) {
    if (data[key] !== undefined) {
      fields.push(`${key} = $${idx++}`);
      values.push(data[key]);
    }
  }

  if (fields.length === 0) return null;

  fields.push(`updated_at = NOW()`);
  values.push(billId, userId);

  const sql = `
    UPDATE bills
    SET ${fields.join(', ')}
    WHERE id = $${idx++}
      AND user_id = $${idx++}
      AND deleted_at IS NULL
    RETURNING
      id,
      user_id        AS "userId",
      category_id    AS "categoryId",
      name,
      amount,
      currency,
      due_date::text AS "dueDate",
      recurrence,
      status,
      notes,
      is_autopay     AS "isAutopay",
      paid_at::text  AS "paidAt",
      created_at::text AS "createdAt",
      updated_at::text AS "updatedAt";
  `;
  const rows = await query(sql, values);
  return rows[0] ?? null;
}

// ── Mark as paid ──────────────────────────────────────────
async function markAsPaid(billId, userId) {
  const sql = `
    UPDATE bills
    SET status = 'paid', paid_at = NOW(), updated_at = NOW()
    WHERE id = $1
      AND user_id = $2
      AND deleted_at IS NULL
    RETURNING
      id,
      user_id        AS "userId",
      name,
      amount,
      currency,
      due_date::text AS "dueDate",
      status,
      paid_at::text  AS "paidAt",
      updated_at::text AS "updatedAt";
  `;
  const rows = await query(sql, [billId, userId]);
  return rows[0] ?? null;
}

// ── Mark as unpaid ────────────────────────────────────────
async function markAsUnpaid(billId, userId) {
  const sql = `
    UPDATE bills
    SET status = 'unpaid', paid_at = NULL, updated_at = NOW()
    WHERE id = $1
      AND user_id = $2
      AND deleted_at IS NULL
    RETURNING
      id,
      user_id        AS "userId",
      name,
      amount,
      currency,
      due_date::text AS "dueDate",
      status,
      paid_at::text  AS "paidAt",
      updated_at::text AS "updatedAt";
  `;
  const rows = await query(sql, [billId, userId]);
  return rows[0] ?? null;
}

// ── Soft delete ───────────────────────────────────────────
async function deleteBill(billId, userId) {
  const sql = `
    UPDATE bills
    SET deleted_at = NOW(), updated_at = NOW()
    WHERE id = $1
      AND user_id = $2
      AND deleted_at IS NULL
    RETURNING id;
  `;
  const rows = await query(sql, [billId, userId]);
  return rows[0] ?? null;
}

module.exports = {
  findAllByUser,
  findById,
  findOverdue,
  findUpcoming,
  createBill,
  updateBill,
  markAsPaid,
  markAsUnpaid,
  deleteBill,
};