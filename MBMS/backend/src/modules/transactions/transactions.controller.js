// transactions.controller.js

const service = require('./transactions.service');
const { sendSuccess } = require('../../shared/ApiResponse');

// ── Get All Transactions ─────────────────────────────────────────
async function list(req, res, next) {
  try {
    const result = await service.list(
      req.user.id,
      req.query
    );

    sendSuccess(
      res,
      result.data,
      200,
      result.meta
    );
  } catch (err) {
    next(err);
  }
}

// ── Get Single Transaction ───────────────────────────────────────
async function getOne(req, res, next) {
  try {
    const transaction = await service.getById(
      req.params.id,
      req.user.id
    );

    sendSuccess(res, transaction);
  } catch (err) {
    next(err);
  }
}

// ── Create Transaction ───────────────────────────────────────────
async function create(req, res, next) {
  try {
    const transaction = await service.create(
      req.user.id,
      req.body
    );

    sendSuccess(res, transaction, 201);
  } catch (err) {
    next(err);
  }
}

// ── Update Transaction ───────────────────────────────────────────
async function update(req, res, next) {
  try {
    const transaction = await service.update(
      req.params.id,
      req.user.id,
      req.body
    );

    sendSuccess(res, transaction);
  } catch (err) {
    next(err);
  }
}

// ── Delete Transaction ───────────────────────────────────────────
async function remove(req, res, next) {
  try {
    await service.remove(
      req.params.id,
      req.user.id
    );

    sendSuccess(res, {
      message: 'Transaction deleted',
    });
  } catch (err) {
    next(err);
  }
}

// ── Exports ──────────────────────────────────────────────────────
module.exports = {
  list,
  getOne,
  create,
  update,
  remove,
};