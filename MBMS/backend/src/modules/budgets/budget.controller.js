//budget.controller.js

const service = require('./budget.service');
const { sendSuccess } = require('../../shared/ApiResponse');


async function list(req, res, next) {
  try {
    const now = new Date();

    const month = Number(req.query.month ?? now.getMonth() + 1);
    const year = Number(req.query.year ?? now.getFullYear());

    const budgets = await service.list(req.user.id, month, year);

    sendSuccess(res, budgets);
  } catch (err) {
    next(err);
  }
}

async function getOne(req, res, next) {
  try {
    const budget = await service.getById(req.params.id, req.user.id);
    sendSuccess(res, budget);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const budget = await service.create(req.user.id, req.body);
    sendSuccess(res, budget, 201);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const budget = await service.update(
      req.params.id,
      req.user.id,
      req.body
    );

    sendSuccess(res, budget);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    await service.remove(req.params.id, req.user.id);
    sendSuccess(res, { message: 'Budget deleted' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  list,
  getOne,
  create,
  update,
  remove,
};