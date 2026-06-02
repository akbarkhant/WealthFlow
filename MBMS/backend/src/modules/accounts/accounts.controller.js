// src/modules/accounts/accounts.controller.js
const accountsService = require('./accounts.service');
const { logger } = require('../../config/logger.config');

/**
 * POST /api/accounts
 * Creates a brand new wallet or bank account asset
 */
async function create(req, res, next) {
  try {
    const userId = req.user.id; // Extracted from authorization middleware
    const { name, type, balance, currency } = req.body || {};

    // Basic Validation
    if (!name || !type) {
      return res.status(400).json({
        success: false,
        message: "Missing required parameters: 'name' and 'type' are mandatory structural elements."
      });
    }

    const newAccount = await accountsService.createAccount(userId, { name, type, balance, currency });

    return res.status(201).json({
      success: true,
      data: newAccount
    });
  } catch (error) {
    if (logger && typeof logger.error === 'function') {
      logger.error(`Accounts Controller Create Error: ${error.message}`, { stack: error.stack });
    }
    return next(error);
  }
}

/**
 * GET /api/accounts
 * Pulls all connected accounts for the current user session
 */
async function list(req, res, next) {
  try {
    const userId = req.user.id;
    
    // Fetch raw accounts from data layer
    const accounts = await accountsService.getAccountsByUser(userId);

    // Defensive check: Ensure we are always executing against a valid collection array
    const verifiedAccountsList = Array.isArray(accounts) ? accounts : [];

    // Calculate overall net-worth aggregates instantly
    const netWorthSummary = verifiedAccountsList.reduce((sum, acc) => sum + Number(acc.balance || 0), 0);

    return res.status(200).json({
      success: true,
      netWorthBaseCurrency: Number(netWorthSummary.toFixed(2)),
      data: verifiedAccountsList
    });
  } catch (error) {
    if (logger && typeof logger.error === 'function') {
      logger.error(`Accounts Controller List Error: ${error.message}`, { stack: error.stack });
    }
    return next(error);
  }
}

/**
 * PUT /api/accounts/:id
 * Updates specific parameter definitions for an account asset container
 */
async function update(req, res, next) {
  try {
    const userId = req.user.id;
    const accountId = req.params.id; // Extract URL parameters directly
    const updatePayload = req.body || {};

    const updatedAccount = await accountsService.updateAccount(accountId, userId, updatePayload);

    return res.status(200).json({
      success: true,
      message: "Account properties modified successfully.",
      data: updatedAccount
    });
  } catch (error) {
    if (logger && typeof logger.error === 'function') {
      logger.error(`Accounts Controller Update Error: ${error.message}`, { stack: error.stack });
    }
    
    // Check if the service layer threw our specific 404 security exception
    if (error.status === 404) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    
    return next(error);
  }
}

module.exports = {
  create,
  list,
  update,
};