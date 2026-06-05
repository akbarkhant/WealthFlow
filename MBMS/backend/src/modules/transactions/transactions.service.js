/**
 * @module services/transaction.service
 * @description Production-grade transaction engine coordinating high-precision 
 * minor-unit ledger logic, isolated network IO, and robust streaming mechanisms.
 */

'use strict';

const transactionRepository = require('./transactions.repository');
const dbConfig = require('../../config/db.config');
const currencyService = require('../currencies/currencies.service');
const notificationService = require('../notifications/notification.service');
const { AppError, ForbiddenError, NotFoundError } = require('../../shared/AppError');
const { logger } = require('../../config/logger.config');
const moneyUtil = require('../../utils/money.utils');
const { calculateNetAmount } = require('../../utils/netAmount.utils');
``
if (!dbConfig || typeof dbConfig.withTransaction !== 'function') {
  throw new Error('Database Infrastructure Failure: withTransaction helper not found.');
}

const withTransaction = dbConfig.withTransaction;

/* ────────────────────────────────────────────────────────────────────────── */
/* 🛡️ INTERNAL AUXILIARY ENGINE METHODS                                       */
/* ────────────────────────────────────────────────────────────────────────── */

/**
 * Validates balance limits using clean minor-unit calculations.
 */
function assertSufficientFunds(balanceStr, requiredMinorUnits, message = 'Insufficient funds') {
  const balanceMinorUnits = moneyUtil.parseDecimalToMinorUnits(balanceStr, 'balance', { allowNegative: true });
  if (balanceMinorUnits < requiredMinorUnits) {
    throw new AppError(message, 400);
  }
}

/**
 * Extracts Year-Month elements safely via structural token arrays.
 * Fixes Bug #3 (Potential formatting structure crash).
 */
function extractYearMonth(dateInput, timezone = 'UTC') {
  if (!dateInput) return null;
  const targetDate = dateInput instanceof Date ? dateInput : new Date(dateInput);

  if (Number.isNaN(targetDate.getTime())) return null;

  try {
    const parts = new Intl.DateTimeFormat('en', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit'
    }).formatToParts(targetDate);

    const yearPart = parts.find(p => p.type === 'year');
    const monthPart = parts.find(p => p.type === 'month');

    if (!yearPart || !monthPart) return null;
    return `${yearPart.value}-${monthPart.value}`;
  } catch (error) {
    logger.error({ error, dateInput }, 'Failed to parse year-month format string components.');
    return null;
  }
}

/**
 * Triggers asynchronous background budget compliance assessments.
 * Fixes Improvement #1 (Silent background failure logging).
 */
function triggerBudgetAlert(userId, categoryId, yearMonth) {
  if (!categoryId || !yearMonth) return;
  notificationService.checkBudgetAlerts(userId, categoryId, yearMonth)
    .catch((error) => {
      logger.warn({ error, userId, categoryId, yearMonth }, 'Deferred budget tracking evaluation failed.');
    });
}

/**
 * Organizes profile record indexes deterministically to minimize database deadlock possibilities.
 */
async function lockUsersForUpdate(userIds, client) {
  const uniqueIds = [...new Set(userIds.filter(id => id !== null && id !== undefined))].sort();
  const lockedUsers = new Map();

  for (const id of uniqueIds) {
    const user = await transactionRepository.findUserByIdForUpdate(id, client);
    if (user) {
      lockedUsers.set(id, user);
    }
  }
  return lockedUsers;
}

/* ────────────────────────────────────────────────────────────────────────── */
/* 🚀 MUTATION ORCHESTRATION PIPELINES (ATOMIC TRANSACTIONS)                  */
/* ────────────────────────────────────────────────────────────────────────── */

/**
 * Handles atomic single-party and multi-party transaction entries.
 * Fixes Critical Issues #1 & #2: Resolves exchange metrics and un-locked lookups outside the transaction context.
 */
async function create(userId, input, contextOptions = {}) {
  const { idempotencyKey = null } = contextOptions;
  let budgetAlert = null;

  // 1. Idempotency Guard check before hitting core locks
  if (idempotencyKey) {
    const existingTx = await transactionRepository.findByIdempotencyKey(userId, idempotencyKey);
    if (existingTx) {
      logger.info({ userId, idempotencyKey, event: 'TRANSACTION_IDEMPOTENCY_HIT' }, 'Idempotency checkpoint matched. Returning cached record.');
      return existingTx;
    }
  }

  // 2. Perform safe read-only target validation outside transaction locks
  const sourceUserCheck = await transactionRepository.findUserById(userId);

  if (!sourceUserCheck) throw new NotFoundError('User');

  const inputCurrency = moneyUtil.normalizeCurrency(input.currency || sourceUserCheck.currency);
  const userBaseCurrency = moneyUtil.normalizeCurrency(sourceUserCheck.currency);

  let targetDestUserCurrency = null;
  let computedExchangeRate = '1.000000000000';

  if (input.type === 'transfer') {
    if (!input.destinationUserId) throw new AppError('Destination user ID is required for transfers', 400);
    if (input.destinationUserId === userId) throw new AppError('Cannot transfer money to the same user', 400);

    const destUserCheck = await transactionRepository.findUserById(input.destinationUserId);
    if (!destUserCheck) throw new NotFoundError('Destination user');
    targetDestUserCurrency = moneyUtil.normalizeCurrency(destUserCheck.currency);
  }

  // 3. Resolve network currency exchange data safely prior to executing database engine locks
  if (inputCurrency !== userBaseCurrency) {
    const rate = await currencyService.getExchangeRate(inputCurrency, userBaseCurrency);
    computedExchangeRate = typeof rate === 'number' ? rate.toFixed(12) : String(rate);
  }

  const sourceAmountMinorUnits = moneyUtil.parseDecimalToMinorUnits(input.amount, 'amount');
  const sourceAmountInBaseMinor = inputCurrency === userBaseCurrency
    ? sourceAmountMinorUnits
    : moneyUtil.multiplyMinorUnitsByRate(sourceAmountMinorUnits, computedExchangeRate);

  let destinationAmountInBaseMinor = sourceAmountInBaseMinor;

  if (input.type === 'transfer' && targetDestUserCurrency !== userBaseCurrency) {
    const destRate = await currencyService.getExchangeRate(inputCurrency, targetDestUserCurrency);
    destinationAmountInBaseMinor = moneyUtil.multiplyMinorUnitsByRate(sourceAmountMinorUnits, destRate);
  }

  // 4. Open atomic database transaction container
  const transaction = await withTransaction(async (client) => {
    const userIdsToLock = input.type === 'transfer' ? [userId, input.destinationUserId] : [userId];
    const lockedUsers = await lockUsersForUpdate(userIdsToLock, client);

    const sourceUser = lockedUsers.get(userId);
    if (!sourceUser) throw new NotFoundError('User');

    if (input.type === 'transfer' || input.type === 'expense') {
      assertSufficientFunds(sourceUser.balance, sourceAmountInBaseMinor);
    }

    // Capture precise parameters directly inside immutable entry structure values
    const enrichedInput = {
      ...input,
      exchangeRateUsed: computedExchangeRate,
      destinationAmountInBaseCurrency: input.type === 'transfer' ? moneyUtil.formatMinorUnits(destinationAmountInBaseMinor) : null,
      idempotencyKey
    };

    const created = await transactionRepository.create(
      userId,
      enrichedInput,
      moneyUtil.formatMinorUnits(sourceAmountInBaseMinor),
      client
    );

    if (input.type === 'transfer') {
      await transactionRepository.updateUserBalance(userId, moneyUtil.formatMinorUnits(-sourceAmountInBaseMinor), client);
      await transactionRepository.updateUserBalance(input.destinationUserId, moneyUtil.formatMinorUnits(destinationAmountInBaseMinor), client);
    } else {
      const balanceDelta = input.type === 'expense' ? -sourceAmountInBaseMinor : sourceAmountInBaseMinor;
      await transactionRepository.updateUserBalance(userId, moneyUtil.formatMinorUnits(balanceDelta), client);
    }

    if (input.type === 'expense') {
      budgetAlert = { userId, categoryId: input.categoryId, yearMonth: extractYearMonth(input.date) };
    }

    // Structured Audit Logging (Improvement #3)
    logger.info({
      event: 'TRANSACTION_CREATED',
      userId,
      transactionId: created.id,
      amount: input.amount,
      currency: inputCurrency,
      type: input.type,
      exchangeRateUsed: computedExchangeRate
    }, 'Ledger asset transaction processed successfully.');

    return created;
  });

  if (budgetAlert) {
    triggerBudgetAlert(budgetAlert.userId, budgetAlert.categoryId, budgetAlert.yearMonth);
  }
  return transaction;
}

/**
 * Handles field modifications on single-party records safely.
 * Fixes Bugs #4, #8, #10: Adds runtime validation, currency-lookup safety checks, and handles meta changes.
 */
async function update(id, userId, input) {
  let budgetAlert = null;

  const originalCheck = await transactionRepository.findById(id, userId);
  if (!originalCheck) throw new NotFoundError('Transaction');
  if (originalCheck.userId !== userId) throw new ForbiddenError('Access Denied');

  const prospectiveType = input.type !== undefined ? input.type : originalCheck.type;
  if (originalCheck.type === 'transfer' || prospectiveType === 'transfer' || input.destinationUserId !== undefined) {
    throw new AppError('Transfer transactions cannot be modified directly. Reverse and recreate instead.', 400);
  }

  const userProfile = await transactionRepository.findUserById(userId);
  if (!userProfile) throw new NotFoundError('User profile details not found');

  const fieldsAffectingCalculations = ['amount', 'currency', 'type', 'categoryId', 'date'];
  const hasCalculationFieldChanges = fieldsAffectingCalculations.some(field => input[field] !== undefined);

  let nextAmountInBaseMinor = moneyUtil.parseDecimalToMinorUnits(originalCheck.amountInBaseCurrency, 'amountInBaseCurrency');
  let computedExchangeRate = originalCheck.exchangeRateUsed || '1.000000000000';

  // Perform currency calculations outside database engine locks
  if (hasCalculationFieldChanges) {
    const nextAmount = input.amount ?? originalCheck.amount;
    const nextCurrency = moneyUtil.normalizeCurrency(input.currency ?? originalCheck.currency);
    const userBaseCurrency = moneyUtil.normalizeCurrency(userProfile.currency);

    if (nextCurrency !== userBaseCurrency) {
      const rate = await currencyService.getExchangeRate(nextCurrency, userBaseCurrency);
      computedExchangeRate = typeof rate === 'number' ? rate.toFixed(12) : String(rate);
    } else {
      computedExchangeRate = '1.000000000000';
    }

    const nextAmountMinorUnits = moneyUtil.parseDecimalToMinorUnits(nextAmount, 'amount');
    nextAmountInBaseMinor = nextCurrency === userBaseCurrency
      ? nextAmountMinorUnits
      : moneyUtil.multiplyMinorUnitsByRate(nextAmountMinorUnits, computedExchangeRate);
  }

  const transaction = await withTransaction(async (client) => {
    const lockedUsers = await lockUsersForUpdate([userId], client);
    const user = lockedUsers.get(userId);
    if (!user) throw new NotFoundError('User');

    if (hasCalculationFieldChanges) {
      const existingAmountMinorUnits = moneyUtil.parseDecimalToMinorUnits(originalCheck.amountInBaseCurrency, 'amountInBaseCurrency');
      const reversalMinorUnits = originalCheck.type === 'expense' ? existingAmountMinorUnits : -existingAmountMinorUnits;
      const applicationMinorUnits = prospectiveType === 'expense' ? -nextAmountInBaseMinor : nextAmountInBaseMinor;
      const netDeltaMinorUnits = reversalMinorUnits + applicationMinorUnits;

      if (netDeltaMinorUnits < 0n) {
        assertSufficientFunds(user.balance, moneyUtil.formatMinorUnits(-netDeltaMinorUnits));
      }

      if (netDeltaMinorUnits !== 0n) {
        await transactionRepository.updateUserBalance(userId, moneyUtil.formatMinorUnits(netDeltaMinorUnits), client);
      }
    }

    const enrichedInput = { ...input, exchangeRateUsed: computedExchangeRate };
    const updated = await transactionRepository.update(id, userId, enrichedInput, moneyUtil.formatMinorUnits(nextAmountInBaseMinor), client);

    if (prospectiveType === 'expense') {
      budgetAlert = {
        userId,
        categoryId: input.categoryId ?? originalCheck.categoryId,
        yearMonth: extractYearMonth(input.date ?? originalCheck.date),
      };
    }

    logger.info({
      event: 'TRANSACTION_UPDATED',
      userId,
      transactionId: id,
      modifiedFields: Object.keys(input)
    }, 'Ledger tracking item structural line updated.');

    return updated;
  });

  if (budgetAlert) {
    triggerBudgetAlert(budgetAlert.userId, budgetAlert.categoryId, budgetAlert.yearMonth);
  }
  return transaction;
}

/**
 * Clears an active record and safely reverses minor-unit allocation deltas.
 */
async function remove(id, userId) {
  return withTransaction(async (client) => {
    const existing = await transactionRepository.findById(id, userId, client);
    if (!existing) throw new NotFoundError('Transaction');
    if (existing.userId !== userId) throw new ForbiddenError('Access Denied');

    if (existing.type === 'transfer') {
      if (!existing.destinationUserId) {
        throw new AppError('Transfer destination target context metadata missing association link records.', 400);
      }
      // Fixes Bug #6: Require destination baseline values explicitly on line reversals
      if (!existing.destinationAmountInBaseCurrency) {
        throw new AppError('Historical multi-currency data integrity failure: destination base amount missing.', 500);
      }

      const lockedUsers = await lockUsersForUpdate([userId, existing.destinationUserId], client);
      const destinationUser = lockedUsers.get(existing.destinationUserId);
      if (!destinationUser) throw new NotFoundError('Destination user record missing');

      const destReversalMinor = moneyUtil.parseDecimalToMinorUnits(existing.destinationAmountInBaseCurrency, 'destinationAmountInBaseCurrency');

      assertSufficientFunds(
        destinationUser.balance,
        destReversalMinor,
        'Destination user has insufficient balance space to reverse this transfer'
      );

      await transactionRepository.updateUserBalance(userId, existing.amountInBaseCurrency, client);
      await transactionRepository.updateUserBalance(existing.destinationUserId, moneyUtil.formatMinorUnits(-destReversalMinor), client);
    } else {
      const lockedUsers = await lockUsersForUpdate([userId], client);
      const user = lockedUsers.get(userId);
      if (!user) throw new NotFoundError('User');

      const amountMinor = moneyUtil.parseDecimalToMinorUnits(existing.amountInBaseCurrency, 'amountInBaseCurrency');
      const reversalDelta = existing.type === 'expense' ? amountMinor : -amountMinor;

      if (reversalDelta < 0n) {
        assertSufficientFunds(user.balance, moneyUtil.formatMinorUnits(-reversalDelta));
      }

      await transactionRepository.updateUserBalance(userId, moneyUtil.formatMinorUnits(reversalDelta), client);
    }

    const deleted = await transactionRepository.softDelete(id, userId, client);
    if (!deleted) throw new NotFoundError('Transaction record deletion aborted');

    logger.info({
      event: 'TRANSACTION_DELETED',
      userId,
      transactionId: id,
      type: existing.type
    }, 'Ledger line record removed and structural asset allocation balances reverted.');

    return existing;
  });
}

/* ────────────────────────────────────────────────────────────────────────── */
/* 🔍 READ & ANALYTICS PIPELINES (READ-ONLY POOL DISPATCH)                    */
/* ────────────────────────────────────────────────────────────────────────── */

async function list(userId, query) {
  return transactionRepository.findAll(userId, query);
}

async function listPaginated(userId, query) {
  return transactionRepository.findPaginated(userId, query);
}

async function getById(id, userId) {
  const transaction = await transactionRepository.findById(id, userId);
  if (!transaction) throw new NotFoundError('Transaction');
  return transaction;
}

/**
 * Streams massive user transaction histories asynchronously to protect system process memory blocks.
 * Fixes Bug #7: Uses a progressive chunk stream instead of bulk-loading arrays into memory.
 * * @example
 * for await (const transaction of transactionService.listAllForAnalysis(userId)) {
 * analyticsEngine.process(transaction);
 * }
 */
async function* listAllForAnalysis(userId) {
  if (typeof transactionRepository.streamAllByUserId === 'function') {
    yield* transactionRepository.streamAllByUserId(userId);
    return;
  }

  let currentCursor = null;
  let hasNext = true;
  let processingSafetyGuard = 0;

  while (hasNext) {
    const pageResult = await transactionRepository.findPaginated(userId, {
      limit: 250,
      nextCursor: currentCursor
    });

    if (!pageResult.transactions || pageResult.transactions.length === 0) {
      break;
    }

    for (const transaction of pageResult.transactions) {
      yield transaction;
    }

    hasNext = pageResult.pagination.hasNextPage;
    currentCursor = pageResult.pagination.nextCursor;
    processingSafetyGuard += pageResult.transactions.length;

    if (processingSafetyGuard >= 100000) {
      logger.error({ userId }, 'Bulk data generation streaming pipeline capped to prevent worker process execution crashes.');
      break;
    }
  }
}

async function fetchDashboardData(userId, timezone = 'UTC') {
  const now = new Date();
  const parts = new Intl.DateTimeFormat('en', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(now);

  const year = parts.find(p => p.type === 'year').value;
  const month = parts.find(p => p.type === 'month').value;

  const startOfMonth = `${year}-${month}-01`;
  const endOfMonth = new Date(parseInt(year, 10), parseInt(month, 10), 0).toISOString().split('T')[0];

  const startOfYear = `${year}-01-01`;
  const endOfYear = `${year}-12-31`;

  const results = await Promise.allSettled([
    transactionRepository.getUserBalance(userId),
    transactionRepository.getMonthlySummary(userId, startOfMonth, endOfMonth),
    transactionRepository.getCategoryBreakdown(userId, startOfMonth, endOfMonth),
    transactionRepository.getYearlyTrajectory(userId, startOfYear, endOfYear),
    transactionRepository.getRecentDashboardTransactions(userId, 5)
  ]);

  const [balance, monthlySummary, breakdown, trajectory, recent] = results.map(r =>
    r.status === 'fulfilled' ? r.value : null
  );

  const netIncome = calculateNetAmount(recent ?? []);

  return {
    balance: balance ?? '0.00',
    monthlySummary: monthlySummary ?? { income: 0.0, expenses: 0.0 },
    categoryBreakdown: breakdown ?? [],
    yearlyTrajectory: trajectory ?? [],
    recentTransactions: recent ?? []
  };
}

module.exports = {
  list,
  listPaginated,
  listAllForAnalysis,
  getById,
  create,
  update,
  remove,
  fetchDashboardData
};