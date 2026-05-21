const repo = require('./budget.repository');

const {
  ConflictError,
  NotFoundError,
} = require('../../shared/AppError');

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

  return repo.create(userId, input);
}

async function update(id, userId, input) {
  const existing = await repo.findById(id, userId);

  if (!existing) {
    throw new NotFoundError('Budget');
  }

  const updated = await repo.update(id, userId, input);

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