const repo = require('./users.repository');

const {
  NotFoundError,
} = require('../../shared/AppError');

// ── Get Current User ─────────────────────────────────────────────
async function getMe(userId) {
  const user = await repo.getUserById(userId);

  if (!user) {
    throw new NotFoundError('User');
  }

  return user;
}

// ── Update User ──────────────────────────────────────────────────
async function updateMe(userId, input) {
  const existing = await repo.getUserById(userId);

  if (!existing) {
    throw new NotFoundError('User');
  }

  return repo.updateUser(userId, input);
}

// ── Delete User ──────────────────────────────────────────────────
async function deleteMe(userId) {
  const existing = await repo.getUserById(userId);

  if (!existing) {
    throw new NotFoundError('User');
  }

  await repo.softDeleteUser(userId);
}

module.exports = {
  getMe,
  updateMe,
  deleteMe,
};