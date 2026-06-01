// transactions.service.js

const repo = require('./transactions.repository');
const { getExchangeRate } = require('../currencies/currencies.service');
// FIXED: Uncommented the budget alerts import so it actually runs
const { checkBudgetAlerts } = require('../notifications/notification.service');
const { getUserById, updateBalance } = require('../users/users.repository');
const { NotFoundError, AppError } = require('../../shared/AppError');

// ── Helpers ──────────────────────────────────────────────────────

/**
 * Resolves the exchange rate and returns the amount converted to the
 * user's base currency, rounded to 2 decimal places.
 */
async function toBaseAmount(amount, fromCurrency, toCurrency) {
  if (fromCurrency === toCurrency) return parseFloat(amount.toFixed(2));

  const rate = await getExchangeRate(fromCurrency, toCurrency);

  if (!rate || !Number.isFinite(rate)) {
    throw new AppError(`Could not get exchange rate for ${fromCurrency} → ${toCurrency}`, 400);
  }

  const result = parseFloat((amount * rate).toFixed(2));

  if (!Number.isFinite(result)) {
    throw new AppError('Invalid amount after currency conversion', 400);
  }

  return result;
}

/**
 * Throws a 400 if the user's current balance cannot cover `required`.
 */
function assertSufficientFunds(balance, required) {
  if (balance < required) {
    throw new AppError('Insufficient funds', 400);
  }
}

/**
 * Safely extracts 'YYYY-MM' from an ISO string, Date object, or date string.
 */
function safeExtractYearMonth(dateInput) {
  if (!dateInput) return null;
  try {
    const dateStr = dateInput instanceof Date ? dateInput.toISOString() : String(dateInput);
    return dateStr.slice(0, 7); // "2026-05"
  } catch (error) {
    return null;
  }
}

// ── List Transactions ────────────────────────────────────────────

async function list(userId, query) {
  return repo.findAll(userId, query);
}

// ── Get Transaction By ID ────────────────────────────────────────

async function getById(id, userId) {
  const transaction = await repo.findById(id, userId);
  if (!transaction) throw new NotFoundError('Transaction');
  return transaction;
}

// ── Create Transaction ───────────────────────────────────────────

async function create(userId, input) {
  // NOTE: In production, pass a transaction client/session to repo/database methods 
  // to execute steps 1 & 2 atomically (e.g., using Knex tx, Prisma $transaction, or Mongoose session)
  
  // 1. Fetch user (Ideally use SELECT ... FOR UPDATE here to prevent concurrent balance race conditions)
  const user = await getUserById(userId);

  const amountInBase = await toBaseAmount(
    input.amount,
    input.currency,
    user.currency
  );

  if (input.type === 'expense') {
    assertSufficientFunds(user.balance, amountInBase);
  }

  // 2. Persist transaction
  const transaction = await repo.create(userId, input, amountInBase);

  // 3. Adjust balance: negative for expense, positive for income
  const balanceDelta = input.type === 'expense' ? -amountInBase : amountInBase;
  await updateBalance(userId, balanceDelta);

  // 4. Fire-and-forget budget check (safely runs in background)
  if (input.type === 'expense') {
    const yearMonth = safeExtractYearMonth(input.date);
    if (yearMonth) {
      checkBudgetAlerts(userId, input.categoryId, yearMonth).catch(() => {});
    }
  }

  return transaction;
}

// ── Update Transaction ───────────────────────────────────────────

async function update(id, userId, input) {
  const existing = await repo.findById(id, userId);
  if (!existing) throw new NotFoundError('Transaction');

  const amountChanged = input.amount !== undefined;
  const currencyChanged = input.currency !== undefined;
  const typeChanged = input.type !== undefined;
  const needsRecalc = amountChanged || currencyChanged || typeChanged;

  // REFACTOR: Early exit if balance recalculation isn't necessary
  if (!needsRecalc) {
    return repo.update(id, userId, input, existing.amountInBase);
  }

  // ── Balance recalculation logic ─────────────────────────────────
  const user = await getUserById(userId);

  const newCurrency = input.currency ?? existing.currency;
  const newAmount = input.amount ?? existing.amount;
  const newType = input.type ?? existing.type;
  const oldType = existing.type;

  const amountInBase = await toBaseAmount(newAmount, newCurrency, user.currency);

  // Reverse old effect, apply new effect
  const reversal = oldType === 'expense' ? existing.amountInBase : -existing.amountInBase;
  const application = newType === 'expense' ? -amountInBase : amountInBase;
  const netDelta = reversal + application;

  // Check funds if the net balance change puts the user deeper in the negative
  if (netDelta < 0) {
    assertSufficientFunds(user.balance, Math.abs(netDelta));
  }

  // Update balance and repository within your application's DB transaction context
  await updateBalance(userId, netDelta);
  const updated = await repo.update(id, userId, input, amountInBase);

  // Trigger budget updates if constraints changed
  if (newType === 'expense' && (amountChanged || currencyChanged || input.categoryId !== undefined)) {
    const categoryId = input.categoryId ?? existing.categoryId;
    const yearMonth = safeExtractYearMonth(input.date ?? existing.date);
    if (yearMonth) {
      checkBudgetAlerts(userId, categoryId, yearMonth).catch(() => {});
    }
  }

  return updated;
}

// ── Delete Transaction ───────────────────────────────────────────

async function remove(id, userId) {
  const existing = await repo.findById(id, userId);
  if (!existing) throw new NotFoundError('Transaction');

  // Reverse the transaction's balance effect before deleting
  const reversal = existing.type === 'expense' 
    ? existing.amountInBase   // refund expense
    : -existing.amountInBase; // claw back income

  await updateBalance(userId, reversal);
  await repo.softDelete(id, userId);
}

// ── List All Transactions Unpaginated (Internal Analysis Use) ────
async function listAllForAnalysis(userId) {
  // Checks your repository layer for an unpaginated query fetcher
  if (typeof repo.findAllUnpaginated === 'function') {
    return repo.findAllUnpaginated(userId);
  }
  // Fallback to basic list query object if your repository structure uses flexible routing args
  return repo.findAll(userId, { limit: 100000, page: 1 });
}

module.exports = {
  list,
  listAllForAnalysis,
  getById,
  create,
  update,
  remove,
};