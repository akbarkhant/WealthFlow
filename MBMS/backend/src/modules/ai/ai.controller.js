// ai.controller.js

const service = require('./ai.service');

async function chat(req, res, next) {
  try {
    await service.chatService({
      message:      req.body.message,
      transactions: req.body.transactions,
      res,
      next,
    });
  } catch (err) {
    next(err);
  }
}

async function analyze(req, res, next) {
  try {
    await service.analyzeService({
      expenses: req.body.expenses,
      res,
      next,
    });
  } catch (err) {
    next(err);
  }
}

async function suggest(req, res, next) {
  try {
    await service.suggestService({
      income: req.body.income,
      expenses: req.body.expenses,
      res,
      next,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  chat,
  analyze,
  suggest,
};