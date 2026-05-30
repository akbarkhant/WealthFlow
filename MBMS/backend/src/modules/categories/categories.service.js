// categories.service.js

const repo = require('./categories.repository');
const { NotFoundError, ConflictError } = require('../../shared/AppError');

async function list(userId) {
  return repo.findAll(userId);
}

async function getById(id, userId) {
  const category = await repo.findById(
    id,
    userId
  );

  if (!category) {
    throw new NotFoundError('Category');
  }

  return category;
}

async function create(userId, input) {
  const existing = await repo.findByName(
    userId,
    input.name
  );

  if (existing) {
    throw new ConflictError(
      'Category already exists'
    );
  }

  return repo.create(userId, input);
}

async function update(id, userId, input) {
  const existing = await repo.findById(
    id,
    userId
  );

  if (!existing) {
    throw new NotFoundError('Category');
  }

  return repo.update(
    id,
    userId,
    input
  );
}

async function remove(id, userId) {
  const deleted = await repo.remove(
    id,
    userId
  );

  if (!deleted) {
    throw new NotFoundError('Category');
  }
}

module.exports = {
  list,
  getById,
  create,
  update,
  remove,
};