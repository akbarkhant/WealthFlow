// transactions.repository.js

const { query } = require('../../config/db.config');
const { v4: uuidv4 } = require('uuid');

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

// ── Get Running Net Wallet Balance ────────────────────────────────
async function getUserBalance(userId) {
  const result = await query(
    `SELECT 
        COALESCE(SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE -t.amount END), 0) as balance
     FROM transactions t
     WHERE t.user_id = $1 AND t.deleted_at IS NULL`,
    [userId]
  );
  return parseFloat(result[0]?.balance || '0');
}

// ── Find All Transactions ────────────────────────────────────────
// ── Find All Transactions ────────────────────────────────────────
async function findAll(userId, q = {}) {
  // 1. Fallback securely to defaults if page or limit are missing
  const page = parseInt(q.page, 10) || 1;
  const limit = parseInt(q.limit, 10) || 20;

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
  
  // 2. Safe calculation with real numerical primitives
  const offset = (page - 1) * limit;

  // Total count query
  const countRows = await query(
    `SELECT COUNT(*) FROM transactions t WHERE ${where}`,
    values
  );
  const countRow = countRows[0];

  // Paginated data rows
  const rows = await query(
    `SELECT ${TRANSACTION_SELECT}
     FROM transactions t
     JOIN categories c ON c.id = t.category_id
     WHERE ${where}
     ORDER BY t.date DESC, t.created_at DESC
     LIMIT $${idx++}
     OFFSET $${idx}`,
    [...values, limit, offset] // 3. Pass clean numbers instead of inputs directly
  );

  const total = parseInt((countRow && countRow.count) || '0', 10);

  return {
    data: rows,
    meta: {
      total,
      page,  // Return standardized context
      limit, // Return standardized context
      totalPages: Math.ceil(total / limit),
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

// ── Create Transaction with Balance Protection ───────────────────
async function create(userId, input, amountInBase) {
  // 1. Guard against insufficient funds on expenses
  if (input.type === 'expense') {
    const currentBalance = await getUserBalance(userId);

    if (currentBalance < amountInBase) {
      const balanceError = new Error('Insufficient wallet funds for this operation.');
      balanceError.code = 'INSUFFICIENT_FUNDS';
      balanceError.statusCode = 400;
      throw balanceError;
    }
  }

  const id = uuidv4();

  // 2. Safe balance insert
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
      ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
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

  return findById(id, userId);
}

// ── Update Transaction ───────────────────────────────────────────
async function update(id, userId, input, amountInBase) {
  const fields = [];
  const values = [];
  let idx = 1;

  // Handle balance updates logic safely if modification occurs
  if (input.amount !== undefined || input.type !== undefined) {
    const currentTx = await findById(id, userId);
    if (!currentTx) {
      const notFoundError = new Error('Transaction not found');
      notFoundError.statusCode = 404;
      throw notFoundError;
    }

    if ((input.type || currentTx.type) === 'expense') {
      const netWalletBalance = await getUserBalance(userId);
      // Calculate delta context to prevent locking valid adjustments
      const currentTxImpact = currentTx.type === 'expense' ? -Number(currentTx.amount) : Number(currentTx.amount);
      const targetAmount = input.amount !== undefined ? Number(input.amount) : Number(currentTx.amount);
      const simulatedBalance = netWalletBalance - currentTxImpact - targetAmount;

      if (simulatedBalance < 0) {
        const balanceError = new Error('Insufficient wallet funds for this modification.');
        balanceError.code = 'INSUFFICIENT_FUNDS';
        balanceError.statusCode = 400;
        throw balanceError;
      }
    }
  }

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
  getUserBalance,
  findAll,
  findById,
  create,
  update,
  softDelete,
};