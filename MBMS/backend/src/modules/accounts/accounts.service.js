// src/modules/accounts/accounts.service.js
const accountsRepository = require('./accounts.repository');
const { logger } = require('../../config/logger.config');

/**
 * Business logic layer for allocating a new account asset profile
 */
async function createAccount(userId, accountData) {
  try {
    // Business rule: Normalize currency data into standard upper casing structures
    if (accountData.currency) {
      accountData.currency = accountData.currency.toUpperCase().trim();
    }
    
    return await accountsRepository.create(userId, accountData);
  } catch (error) {
    if (logger && typeof logger.error === 'function') {
      logger.error(`[ACCOUNTS_SERVICE_CREATE_ERROR]: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Collects structural profile collections and defaults fallback matrices safely
 */
async function getAccountsByUser(userId) {
  try {
    const records = await accountsRepository.findByUserId(userId);
    return Array.isArray(records) ? records : [];
  } catch (error) {
    if (logger && typeof logger.error === 'function') {
      logger.error(`[ACCOUNTS_SERVICE_GET_ALL_ERROR]: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Updates an account entry matching security constraints
 */
async function updateAccount(accountId, userId, updateData) {
  try {
    const existing = await accountsRepository.findByIdAndUser(accountId, userId);
    if (!existing) {
      const err = new Error("Target account resource not found or access denied.");
      err.status = 404;
      throw err;
    }

    return await accountsRepository.update(accountId, userId, updateData);
  } catch (error) {
    throw error;
  }
}

module.exports = {
  createAccount,
  getAccountsByUser,
  updateAccount
};