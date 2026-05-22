const repo = require('./transactions.repository');

const {
  getExchangeRate,
} = require('../currencies/currencies.service');

const {
  checkBudgetAlerts,
} = require('../notifications/notification.service');

const {
  getUserById,
} = require('../users/users.repository');

const {
  NotFoundError,
} = require('../../shared/AppError');

// ── List Transactions ────────────────────────────────────────────
async function list(userId, query) {
  return repo.findAll(userId, query);
}

// ── Get Transaction By ID ────────────────────────────────────────
async function getById(id, userId) {
  const transaction = await repo.findById(id, userId);

  if (!transaction) {
    throw new NotFoundError('Transaction');
  }

  return transaction;
}

// ── Create Transaction ───────────────────────────────────────────
async function create(userId, input) {
  // Convert transaction amount into user's base currency
  const user = await getUserById(userId);

  const rate = await getExchangeRate(
    input.currency,
    user.currency
  );

  const amountInBase = parseFloat(
    (input.amount * rate).toFixed(2)
  );

  const transaction = await repo.create(
    userId,
    input,
    amountInBase
  );

  // Fire-and-forget budget alert checking
  if (input.type === 'expense') {
    checkBudgetAlerts(
      userId,
      input.categoryId,
      input.date.slice(0, 7)
    ).catch(() => {});
  }

  return transaction;
}

// ── Update Transaction ───────────────────────────────────────────
async function update(id, userId, input) {
  const existing = await repo.findById(id, userId);

  if (!existing) {
    throw new NotFoundError('Transaction');
  }

  let amountInBase;

  // Recalculate base currency amount if needed
  if (
    input.amount !== undefined ||
    input.currency !== undefined
  ) {
    const user = await getUserById(userId);

    const currency =
      input.currency ?? existing.currency;

    const amount =
      input.amount ?? existing.amount;

    const rate = await getExchangeRate(
      currency,
      user.currency
    );

    amountInBase = parseFloat(
      (amount * rate).toFixed(2)
    );
  }

  const updated = await repo.update(
    id,
    userId,
    input,
    amountInBase
  );

  return updated;
}

// ── Delete Transaction ───────────────────────────────────────────
async function remove(id, userId) {
  const deleted = await repo.softDelete(id, userId);

  if (!deleted) {
    throw new NotFoundError('Transaction');
  }
}

// ── Exports ──────────────────────────────────────────────────────
module.exports = {
  list,
  getById,
  create,
  update,
  remove,
};