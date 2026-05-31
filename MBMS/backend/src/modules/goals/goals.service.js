// goals.service.js
// Business logic for goal tracking. Sits between controller and repository.

const repo = require('./goals.repository');

/**
 * Returns all goals for a user with computed progress percentage.
 */
async function listAllForUser(userId) {
  return repo.findAllByUser(userId);
}

/**
 * Returns a single goal or throws if not found / not owned.
 */
async function getOne(goalId, userId) {
  const goal = await repo.findById(goalId, userId);
  if (!goal) {
    const err = new Error('Goal not found.');
    err.status = 404;
    throw err;
  }
  return goal;
}

/**
 * Creates a new goal after validating required fields.
 */
async function create(userId, body) {
  const { name, icon, targetAmount, currentAmount, deadline } = body;

  if (!name || !targetAmount) {
    const err = new Error('name and targetAmount are required.');
    err.status = 400;
    throw err;
  }
  if (Number(targetAmount) <= 0) {
    const err = new Error('targetAmount must be greater than zero.');
    err.status = 400;
    throw err;
  }

  return repo.create({ userId, name, icon, targetAmount, currentAmount, deadline });
}

/**
 * Adds an amount toward a goal's current_amount.
 * Returns the updated goal, or throws if goal not found.
 */
async function contribute(goalId, userId, amount) {
  if (!amount || Number(amount) <= 0) {
    const err = new Error('Contribution amount must be greater than zero.');
    err.status = 400;
    throw err;
  }

  const updated = await repo.contribute(goalId, userId, Number(amount));
  if (!updated) {
    const err = new Error('Goal not found.');
    err.status = 404;
    throw err;
  }
  return updated;
}

/**
 * Updates goal metadata (name, icon, target, deadline).
 */
async function update(goalId, userId, body) {
  const updated = await repo.update(goalId, userId, body);
  if (!updated) {
    const err = new Error('Goal not found.');
    err.status = 404;
    throw err;
  }
  return updated;
}

/**
 * Deletes a goal. Returns true on success.
 */
async function remove(goalId, userId) {
  const deleted = await repo.remove(goalId, userId);
  if (!deleted) {
    const err = new Error('Goal not found.');
    err.status = 404;
    throw err;
  }
  return true;
}

module.exports = { listAllForUser, getOne, create, contribute, update, remove };