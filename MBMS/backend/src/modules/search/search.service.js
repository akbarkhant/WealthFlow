// src/modules/search/search.service.js
const repo = require('./search.repository');
const { AppError } = require('../../shared/AppError');

/**
 * Validates search parameters and fetches data
 */
async function executeGlobalSearch(userId, queryText) {
  const sanitizedQuery = queryText ? queryText.trim() : '';

  // UX Guardrail: Don't hit the DB for empty or single-character spam
  if (!sanitizedQuery || sanitizedQuery.length < 2) {
    return [];
  }

  // Prevent massive regex or wildcard denial-of-service lengths
  if (sanitizedQuery.length > 100) {
    throw new AppError('Search query is too long', 400);
  }

  return await repo.searchTransactions(userId, sanitizedQuery);
}

module.exports = {
  executeGlobalSearch,
};