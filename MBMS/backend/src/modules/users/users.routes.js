const { Router } = require('express');

const { authenticate } = require('../../middleware/authorize.middleware');

const {
  validate,
} = require('../../middleware/validate.middleware');

const {
  updateUserSchema,
} = require('./users.schema');

const controller = require('./users.controller');

const router = Router();

// ── Protected Routes ────────────────────────────────────────────
router.use(authenticate);

// ── User Routes ─────────────────────────────────────────────────
router.get('/me', controller.getMe);

router.patch(
  '/me',
  validate(updateUserSchema),
  controller.updateMe
);

router.delete(
  '/me',
  controller.deleteMe
);

module.exports = {
  usersRouter: router,
};