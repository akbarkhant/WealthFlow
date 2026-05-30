// budget.service.js

const { query } = require('../../config/db.config');
const repo = require('./budget.repository');
const { ConflictError, NotFoundError } = require('../../shared/AppError');

async function list(userId, month, year) {
  return repo.findAllForMonth(userId, month, year);
}

async function getById(id, userId) {
  const budget = await repo.findById(id, userId);

  if (!budget) {
    throw new NotFoundError('Budget');
  }

  return budget;
}

async function create(userId, input) {
  const existing = await repo.findByCategoryMonth(
    userId,
    input.categoryId,
    input.month,
    input.year
  );

  if (existing) {
    throw new ConflictError(
      'A budget for this category and month already exists'
    );
  }

  // Look up category name to formulate budget name
  const categories = await query('SELECT name FROM categories WHERE id = $1', [input.categoryId]);
  const categoryName = categories[0] ? categories[0].name : 'Category';

  const startDate = `${input.year}-${String(input.month).padStart(2, '0')}-01`;
  const lastDay = new Date(input.year, input.month, 0).getDate();
  const endDate = `${input.year}-${String(input.month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

  const repoInput = {
    categoryId: input.categoryId,
    name: `${categoryName} Budget`,
    amount: input.amountLimit,
    period: 'monthly',
    startDate,
    endDate,
    alertThreshold: 80
  };

  return repo.create(userId, repoInput);
}

async function update(id, userId, input) {
  const existing = await repo.findById(id, userId);

  if (!existing) {
    throw new NotFoundError('Budget');
  }

  const repoInput = {};
  if (input.amountLimit !== undefined) {
    repoInput.amount = input.amountLimit;
  }

  const updated = await repo.update(id, userId, repoInput);

  return updated;
}

async function remove(id, userId) {
  const deleted = await repo.remove(id, userId);

  if (!deleted) {
    throw new NotFoundError('Budget');
  }
}

/** Used by notification service to check alert thresholds */
async function getBudgetForCategoryMonth(userId, categoryId, month, year) {
  return repo.findByCategoryMonth(userId, categoryId, month, year);
}

module.exports = {
  list,
  getById,
  create,
  update,
  remove,
  getBudgetForCategoryMonth,
};