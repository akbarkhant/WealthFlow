const { query } = require('../../config/db.config');
const { v4: uuidv4 } = require('uuid');

const TRANSACTION_SELECT = `
  t.id,
  t.user_id AS "userId",
  t.destination_user_id AS "destinationUserId",
  t.category_id AS "categoryId",
  c.name AS "categoryName",
  c.icon AS "categoryIcon",
  t.amount::text AS amount,
  t.currency,
  t.amount_in_base_currency::text AS "amountInBaseCurrency",
  t.amount_in_base_currency::text AS "amountInBase",
  t.type,
  t.description,
  t.date::text,
  t.is_recurring AS "isRecurring",
  t.created_at AS "createdAt",
  t.updated_at AS "updatedAt"
`;

async function runQuery(client, text, params = []) {
  if (client) {
    const result = await client.query(text, params);
    return result.rows;
  }

  return query(text, params);
}

async function getUserBalance(userId, client) {
  const rows = await runQuery(
    client,
    `SELECT
       COALESCE(SUM(
         CASE
           WHEN t.type = 'income' THEN t.amount_in_base_currency
           WHEN t.type IN ('expense', 'transfer') THEN -t.amount_in_base_currency
           ELSE 0
         END
       ), 0)::text AS balance
     FROM transactions t
     WHERE t.user_id = $1
       AND t.deleted_at IS NULL`,
    [userId]
  );

  return rows[0]?.balance ?? '0.00';
}

async function findUserByIdForUpdate(userId, client) {
  const rows = await runQuery(
    client,
    `SELECT
       id,
       currency,
       balance::text AS balance
     FROM users
     WHERE id = $1
     FOR UPDATE`,
    [userId]
  );

  return rows[0] || null;
}

async function updateUserBalance(userId, deltaAmount, client) {
  const rows = await runQuery(
    client,
    `UPDATE users
     SET balance = balance + $1,
         updated_at = NOW()
     WHERE id = $2
     RETURNING id, currency, balance::text AS balance`,
    [deltaAmount, userId]
  );

  return rows[0] || null;
}

async function findAll(userId, q = {}, client) {
  const page = Number.parseInt(q.page, 10) || 1;
  const limit = Number.parseInt(q.limit, 10) || 20;
  const offset = (page - 1) * limit;

  const conditions = [
    '(t.user_id = $1 OR t.destination_user_id = $1)',
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

  const whereClause = conditions.join(' AND ');

  const countRows = await runQuery(
    client,
    `SELECT COUNT(*)::int AS count
     FROM transactions t
     WHERE ${whereClause}`,
    values
  );

  const rows = await runQuery(
    client,
    `SELECT ${TRANSACTION_SELECT}
     FROM transactions t
     LEFT JOIN categories c ON c.id = t.category_id
     WHERE ${whereClause}
     ORDER BY t.date DESC, t.created_at DESC
     LIMIT $${idx++}
     OFFSET $${idx}`,
    [...values, limit, offset]
  );

  const total = Number.parseInt(countRows[0]?.count || '0', 10);

  return {
    data: rows,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

async function findAllUnpaginated(userId, client) {
  const rows = await runQuery(
    client,
    `SELECT ${TRANSACTION_SELECT}
     FROM transactions t
     LEFT JOIN categories c ON c.id = t.category_id
     WHERE (t.user_id = $1 OR t.destination_user_id = $1)
       AND t.deleted_at IS NULL
     ORDER BY t.date DESC, t.created_at DESC`,
    [userId]
  );

  return rows;
}

async function findById(id, userId, client) {
  const rows = await runQuery(
    client,
    `SELECT ${TRANSACTION_SELECT}
     FROM transactions t
     LEFT JOIN categories c ON c.id = t.category_id
     WHERE t.id = $1
       AND (t.user_id = $2 OR t.destination_user_id = $2)
       AND t.deleted_at IS NULL`,
    [id, userId]
  );

  return rows[0] || null;
}

async function create(userId, input, amountInBaseCurrency, client) {
  const id = uuidv4();

  await runQuery(
    client,
    `INSERT INTO transactions (
       id,
       user_id,
       destination_user_id,
       category_id,
       amount,
       currency,
       amount_in_base_currency,
       type,
       description,
       date,
       is_recurring
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
    [
      id,
      userId,
      input.destinationUserId || null,
      input.categoryId || null,
      input.amount,
      input.currency,
      amountInBaseCurrency,
      input.type,
      input.description || null,
      input.date,
      input.isRecurring || false,
    ]
  );

  return findById(id, userId, client);
}

async function update(id, userId, input, amountInBaseCurrency, client) {
  const fields = [];
  const values = [];
  let idx = 1;

  if (input.categoryId !== undefined) {
    fields.push(`category_id = $${idx++}`);
    values.push(input.categoryId);
  }

  if (input.destinationUserId !== undefined) {
    fields.push(`destination_user_id = $${idx++}`);
    values.push(input.destinationUserId);
  }

  if (input.amount !== undefined) {
    fields.push(`amount = $${idx++}`);
    values.push(input.amount);
  }

  if (input.currency !== undefined) {
    fields.push(`currency = $${idx++}`);
    values.push(input.currency);
  }

  if (amountInBaseCurrency !== undefined) {
    fields.push(`amount_in_base_currency = $${idx++}`);
    values.push(amountInBaseCurrency);
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
    return findById(id, userId, client);
  }

  fields.push('updated_at = NOW()');

  const idIndex = idx++;
  const userIdIndex = idx;
  values.push(id, userId);

  await runQuery(
    client,
    `UPDATE transactions
     SET ${fields.join(', ')}
     WHERE id = $${idIndex}
       AND user_id = $${userIdIndex}
       AND deleted_at IS NULL`,
    values
  );

  return findById(id, userId, client);
}

async function softDelete(id, userId, client) {
  const rows = await runQuery(
    client,
    `UPDATE transactions
     SET deleted_at = NOW(),
         updated_at = NOW()
     WHERE id = $1
       AND user_id = $2
       AND deleted_at IS NULL
     RETURNING id`,
    [id, userId]
  );

  return rows.length > 0;
}

module.exports = {
  getUserBalance,
  findUserByIdForUpdate,
  updateUserBalance,
  findAll,
  findAllUnpaginated,
  findById,
  create,
  update,
  softDelete,
};
