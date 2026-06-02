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
    // 👇 ADD THIS LINE HERE TO INSPECT THE DATA
    console.log("💎 WHAT ZOD PASSED TO CONTROLLER:", req.body);

    const budget = await service.create(req.user.id, req.body);
    sendSuccess(res, budget, 201);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Send the sanitized body over to the service layer
    const updatedBudget = await service.update(id, userId, req.body);
    
    sendSuccess(res, updatedBudget, 200, 'Budget updated successfully');
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    await service.remove(id, userId);

    // Send a clean 200 OK success indicator back to Postman
    sendSuccess(res, null, 200, 'Budget deleted successfully');
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