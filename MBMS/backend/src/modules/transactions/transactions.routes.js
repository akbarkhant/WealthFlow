// transactions.routes.js

const { Router } = require('express');

const { authenticate } = require('../../middleware/authorize.middleware');
const { validate } = require('../../middleware/validate.middleware');

const {
  createTransactionSchema,
  updateTransactionSchema,
  listTransactionsSchema,
} = require('./transactions.schema');

const controller = require('./transactions.controller');

const router = Router();

// Protect all routes
router.use(authenticate);

// ── Transaction Routes ───────────────────────────────────────────

// Get all transactions
router.get(
  '/',
  validate(listTransactionsSchema, 'query'),
  controller.list
);

// Get one transaction
router.get(
  '/:id',
  controller.getOne
);

// Create transaction
router.post(
  '/',
  validate(createTransactionSchema),
  controller.create
);

// Update transaction
router.patch(
  '/:id',
  validate(updateTransactionSchema),
  controller.update
);

// Delete transaction
router.delete(
  '/:id',
  controller.remove
);

module.exports = router;