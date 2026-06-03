const repo = require('./transactions.repository');
const { withTransaction } = require('../../config/db.config');
const currencyService = require('../currencies/currencies.service');
const notificationService = require('../notifications/notification.service');
const { AppError, ForbiddenError, NotFoundError } = require('../../shared/AppError');

const AMOUNT_SCALE = 100n;
const RATE_MAX_SCALE = 12;

function normalizeCurrency(value, fieldName = 'currency') {
  const currency = String(value || '').trim().toUpperCase();
  if (!/^[A-Z]{3}$/.test(currency)) {
    throw new AppError(`${fieldName} must be a 3-letter ISO currency code`, 400);
  }
  return currency;
}

function parseDecimalToMinorUnits(value, fieldName = 'amount', options = {}) {
  const { allowNegative = false } = options;
  const raw = String(value).trim();
  const pattern = allowNegative ? /^-?\d+(\.\d{1,2})?$/ : /^\d+(\.\d{1,2})?$/;

  if (!pattern.test(raw)) {
    throw new AppError(`${fieldName} must be a decimal with at most 2 fractional digits`, 400);
  }

  const sign = raw.startsWith('-') ? -1n : 1n;
  const unsigned = raw.startsWith('-') ? raw.slice(1) : raw;
  const [wholePart, fractionPart = ''] = unsigned.split('.');
  const whole = BigInt(wholePart);
  const cents = BigInt(fractionPart.padEnd(2, '0'));

  return sign * ((whole * AMOUNT_SCALE) + cents);
}

function formatMinorUnits(minorUnits) {
  const sign = minorUnits < 0n ? '-' : '';
  const absolute = minorUnits < 0n ? -minorUnits : minorUnits;
  const whole = absolute / AMOUNT_SCALE;
  const cents = absolute % AMOUNT_SCALE;

  return `${sign}${whole.toString()}.${cents.toString().padStart(2, '0')}`;
}

function parseRateToRatio(rate) {
  if (typeof rate === 'number') {
    if (!Number.isFinite(rate)) {
      throw new AppError('Exchange rate must be finite', 400);
    }
    rate = rate.toFixed(RATE_MAX_SCALE);
  }

  let raw = String(rate).trim();
  if (raw.includes('.')) {
    raw = raw.replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '');
  }

  if (!/^\d+(\.\d{1,12})?$/.test(raw)) {
    throw new AppError('Exchange rate must be a positive decimal', 400);
  }

  const [wholePart, fractionPart = ''] = raw.split('.');
  const numerator = BigInt(`${wholePart}${fractionPart}`);
  const denominator = 10n ** BigInt(fractionPart.length);

  if (numerator <= 0n) {
    throw new AppError('Exchange rate must be greater than zero', 400);
  }

  return { numerator, denominator };
}

function multiplyMinorUnitsByRate(amountMinorUnits, rate) {
  const { numerator, denominator } = parseRateToRatio(rate);
  const product = amountMinorUnits * numerator;

  return (product + (denominator / 2n)) / denominator;
}

async function convertCurrencyAmount(amount, fromCurrency, toCurrency) {
  const sourceCurrency = normalizeCurrency(fromCurrency, 'fromCurrency');
  const targetCurrency = normalizeCurrency(toCurrency, 'toCurrency');
  const amountMinorUnits = parseDecimalToMinorUnits(amount, 'amount');

  if (sourceCurrency === targetCurrency) {
    return formatMinorUnits(amountMinorUnits);
  }

  const rate = await currencyService.getExchangeRate(sourceCurrency, targetCurrency);
  const convertedMinorUnits = multiplyMinorUnitsByRate(amountMinorUnits, rate);

  if (convertedMinorUnits <= 0n) {
    throw new AppError('Converted amount rounds to zero', 400);
  }

  return formatMinorUnits(convertedMinorUnits);
}

function assertSufficientFunds(balance, requiredAmount, message = 'Insufficient funds') {
  const balanceMinorUnits = parseDecimalToMinorUnits(balance, 'balance', {
    allowNegative: true,
  });
  const requiredMinorUnits = parseDecimalToMinorUnits(requiredAmount, 'requiredAmount');

  if (balanceMinorUnits < requiredMinorUnits) {
    throw new AppError(message, 400);
  }
}

function signedAmount(minorUnits) {
  return formatMinorUnits(minorUnits);
}

function negateAmount(amount) {
  return formatMinorUnits(-parseDecimalToMinorUnits(amount, 'amount'));
}

function extractYearMonth(dateInput) {
  if (!dateInput) return null;
  const text = dateInput instanceof Date ? dateInput.toISOString() : String(dateInput);
  return /^\d{4}-\d{2}/.test(text) ? text.slice(0, 7) : null;
}

async function lockUsersForUpdate(userIds, client) {
  const uniqueIds = [...new Set(userIds)].sort();
  const lockedUsers = new Map();

  for (const id of uniqueIds) {
    const user = await repo.findUserByIdForUpdate(id, client);
    if (user) {
      lockedUsers.set(id, user);
    }
  }

  return lockedUsers;
}

function triggerBudgetAlert(userId, categoryId, yearMonth) {
  if (!categoryId || !yearMonth) return;

  notificationService
    .checkBudgetAlerts(userId, categoryId, yearMonth)
    .catch(() => {});
}

async function list(userId, query) {
  return repo.findAll(userId, query);
}

async function getById(id, userId) {
  const transaction = await repo.findById(id, userId);
  if (!transaction) throw new NotFoundError('Transaction');
  return transaction;
}

async function create(userId, input) {
  let budgetAlert = null;

  const transaction = await withTransaction(async (client) => {
    if (input.type === 'transfer' && !input.destinationUserId) {
      throw new AppError('Destination user ID is required for transfers', 400);
    }

    if (input.type === 'transfer' && input.destinationUserId === userId) {
      throw new AppError('Cannot transfer money to the same user', 400);
    }

    const userIdsToLock = input.type === 'transfer'
      ? [userId, input.destinationUserId]
      : [userId];
    const lockedUsers = await lockUsersForUpdate(userIdsToLock, client);
    const sourceUser = lockedUsers.get(userId);

    if (!sourceUser) {
      throw new NotFoundError('User');
    }

    const sourceAmountInBase = await convertCurrencyAmount(
      input.amount,
      input.currency,
      sourceUser.currency
    );

    if (input.type === 'transfer') {
      const destinationUser = lockedUsers.get(input.destinationUserId);

      if (!destinationUser) {
        throw new NotFoundError('Destination user');
      }

      assertSufficientFunds(sourceUser.balance, sourceAmountInBase);

      const destinationAmountInBase = await convertCurrencyAmount(
        input.amount,
        input.currency,
        destinationUser.currency
      );

      const created = await repo.create(userId, input, sourceAmountInBase, client);
      await repo.updateUserBalance(userId, negateAmount(sourceAmountInBase), client);
      await repo.updateUserBalance(input.destinationUserId, destinationAmountInBase, client);

      return {
        ...created,
        destinationAmountInBaseCurrency: destinationAmountInBase,
        destinationCurrency: destinationUser.currency,
      };
    }

    if (input.type === 'expense') {
      assertSufficientFunds(sourceUser.balance, sourceAmountInBase);
    }

    const created = await repo.create(userId, input, sourceAmountInBase, client);
    const balanceDelta = input.type === 'expense'
      ? negateAmount(sourceAmountInBase)
      : sourceAmountInBase;

    await repo.updateUserBalance(userId, balanceDelta, client);

    if (input.type === 'expense') {
      budgetAlert = {
        userId,
        categoryId: input.categoryId,
        yearMonth: extractYearMonth(input.date),
      };
    }

    return created;
  });

  if (budgetAlert) {
    triggerBudgetAlert(
      budgetAlert.userId,
      budgetAlert.categoryId,
      budgetAlert.yearMonth
    );
  }

  return transaction;
}

async function update(id, userId, input) {
  let budgetAlert = null;

  const transaction = await withTransaction(async (client) => {
    const existing = await repo.findById(id, userId, client);

    if (!existing) {
      throw new NotFoundError('Transaction');
    }

    if (existing.userId !== userId) {
      throw new ForbiddenError('Only the transfer sender can modify this transaction');
    }

    if (
      existing.type === 'transfer'
      || input.type === 'transfer'
      || input.destinationUserId !== undefined
    ) {
      throw new AppError(
        'Transfer transactions cannot be modified directly. Reverse and recreate instead.',
        400
      );
    }

    const lockedUsers = await lockUsersForUpdate([userId], client);
    const user = lockedUsers.get(userId);

    if (!user) {
      throw new NotFoundError('User');
    }

    const amountChanged = input.amount !== undefined;
    const currencyChanged = input.currency !== undefined;
    const typeChanged = input.type !== undefined;
    const needsBalanceRecalculation = amountChanged || currencyChanged || typeChanged;

    let nextAmountInBase;

    if (needsBalanceRecalculation) {
      const nextAmount = input.amount ?? existing.amount;
      const nextCurrency = input.currency ?? existing.currency;
      const nextType = input.type ?? existing.type;
      nextAmountInBase = await convertCurrencyAmount(nextAmount, nextCurrency, user.currency);

      const existingAmountMinorUnits = parseDecimalToMinorUnits(
        existing.amountInBaseCurrency,
        'amountInBaseCurrency'
      );
      const nextAmountMinorUnits = parseDecimalToMinorUnits(
        nextAmountInBase,
        'nextAmountInBase'
      );

      const reversalMinorUnits = existing.type === 'expense'
        ? existingAmountMinorUnits
        : -existingAmountMinorUnits;
      const applicationMinorUnits = nextType === 'expense'
        ? -nextAmountMinorUnits
        : nextAmountMinorUnits;
      const netDeltaMinorUnits = reversalMinorUnits + applicationMinorUnits;

      if (netDeltaMinorUnits < 0n) {
        assertSufficientFunds(user.balance, formatMinorUnits(-netDeltaMinorUnits));
      }

      if (netDeltaMinorUnits !== 0n) {
        await repo.updateUserBalance(userId, signedAmount(netDeltaMinorUnits), client);
      }
    }

    const updated = await repo.update(id, userId, input, nextAmountInBase, client);

    if ((input.type ?? existing.type) === 'expense') {
      budgetAlert = {
        userId,
        categoryId: input.categoryId ?? existing.categoryId,
        yearMonth: extractYearMonth(input.date ?? existing.date),
      };
    }

    return updated;
  });

  if (budgetAlert) {
    triggerBudgetAlert(
      budgetAlert.userId,
      budgetAlert.categoryId,
      budgetAlert.yearMonth
    );
  }

  return transaction;
}

async function remove(id, userId) {
  const transaction = await withTransaction(async (client) => {
    const existing = await repo.findById(id, userId, client);

    if (!existing) {
      throw new NotFoundError('Transaction');
    }

    if (existing.userId !== userId) {
      throw new ForbiddenError('Only the transfer sender can remove this transaction');
    }

    if (existing.type === 'transfer') {
      if (!existing.destinationUserId) {
        throw new AppError('Transfer destination is missing', 400);
      }

      const lockedUsers = await lockUsersForUpdate(
        [userId, existing.destinationUserId],
        client
      );
      const sourceUser = lockedUsers.get(userId);
      const destinationUser = lockedUsers.get(existing.destinationUserId);

      if (!sourceUser) {
        throw new NotFoundError('User');
      }

      if (!destinationUser) {
        throw new NotFoundError('Destination user');
      }

      const destinationReversalAmount = await convertCurrencyAmount(
        existing.amount,
        existing.currency,
        destinationUser.currency
      );

      assertSufficientFunds(
        destinationUser.balance,
        destinationReversalAmount,
        'Destination user has insufficient funds to reverse this transfer'
      );

      await repo.updateUserBalance(userId, existing.amountInBaseCurrency, client);
      await repo.updateUserBalance(
        existing.destinationUserId,
        negateAmount(destinationReversalAmount),
        client
      );

      const deleted = await repo.softDelete(id, userId, client);
      if (!deleted) throw new NotFoundError('Transaction');

      return existing;
    }

    const lockedUsers = await lockUsersForUpdate([userId], client);
    const user = lockedUsers.get(userId);

    if (!user) {
      throw new NotFoundError('User');
    }

    const amountInBase = existing.amountInBaseCurrency;
    const reversalMinorUnits = existing.type === 'expense'
      ? parseDecimalToMinorUnits(amountInBase, 'amountInBaseCurrency')
      : -parseDecimalToMinorUnits(amountInBase, 'amountInBaseCurrency');

    if (reversalMinorUnits < 0n) {
      assertSufficientFunds(user.balance, formatMinorUnits(-reversalMinorUnits));
    }

    if (reversalMinorUnits !== 0n) {
      await repo.updateUserBalance(userId, signedAmount(reversalMinorUnits), client);
    }

    const deleted = await repo.softDelete(id, userId, client);
    if (!deleted) throw new NotFoundError('Transaction');

    return existing;
  });

  return transaction;
}

async function listAllForAnalysis(userId) {
  if (typeof repo.findAllUnpaginated === 'function') {
    return repo.findAllUnpaginated(userId);
  }

  const result = await repo.findAll(userId, { limit: 100000, page: 1 });
  return result.data || result;
}

module.exports = {
  list,
  listAllForAnalysis,
  getById,
  create,
  update,
  remove,
};
