// notification.routes.js  (enhanced)

const express    = require('express');
const router     = express.Router();
const { body, param, query, validationResult } = require('express-validator');

const notificationController = require('./notification.controller');

// ─── Middleware: Auth ────────────────────────────────────────────
// Replace with your actual JWT/session middleware.
// Example using a hypothetical `authenticate` and `requireAdmin`:
//   const { authenticate, requireAdmin } = require('../../middleware/auth');
//
// For now we define lightweight placeholders so the file runs standalone.
const authenticate = (req, res, next) => {
  // TODO: validate JWT / session token and attach req.user
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorised.' });
  next();
};

const requireAdmin = (req, res, next) => {
  // TODO: check req.user.role === 'admin'
  next();
};

// ─── Middleware: Validation runner ───────────────────────────────
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  next();
};

// ─── Validation schemas ──────────────────────────────────────────
const subscribeSchema = [
  body('subscription').isObject().withMessage('subscription must be an object'),
  body('subscription.endpoint').isURL().withMessage('Invalid endpoint URL'),
  body('subscription.keys.p256dh').isString().notEmpty(),
  body('subscription.keys.auth').isString().notEmpty(),
  body('user_id').optional().isUUID().withMessage('user_id must be a valid UUID'),
];

const unsubscribeSchema = [
  body('endpoint').isURL().withMessage('A valid endpoint URL is required'),
];

const sendSchema = [
  param('userId').isUUID().withMessage('userId must be a valid UUID'),
  body('title').isString().trim().isLength({ min: 1, max: 100 }).withMessage('title is required (max 100 chars)'),
  body('body').isString().trim().isLength({ min: 1, max: 300 }).withMessage('body is required (max 300 chars)'),
  body('url').optional().isString().trim(),
  body('type').optional().isString().trim().isLength({ max: 50 }),
];

const broadcastSchema = [
  body('title').isString().trim().isLength({ min: 1, max: 100 }).withMessage('title is required (max 100 chars)'),
  body('body').isString().trim().isLength({ min: 1, max: 300 }).withMessage('body is required (max 300 chars)'),
  body('url').optional().isString().trim(),
  body('type').optional().isString().trim().isLength({ max: 50 }),
];

const historySchema = [
  param('userId').isUUID().withMessage('userId must be a valid UUID'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be 1–100'),
  query('offset').optional().isInt({ min: 0 }).withMessage('offset must be ≥ 0'),
];

const preferenceSchema = [
  param('userId').isUUID().withMessage('userId must be a valid UUID'),
  body('type').isString().trim().notEmpty().withMessage('type is required'),
  body('enabled').isBoolean().withMessage('enabled must be a boolean'),
];

// ─── Routes ──────────────────────────────────────────────────────

// Public — no auth needed (browser needs VAPID key before subscribing)
router.get('/vapid-public-key', notificationController.getVapidPublicKey);

// Authenticated — any signed-in user
router.post('/subscribe',    authenticate, subscribeSchema,   validate, notificationController.subscribe);
router.post('/unsubscribe',  authenticate, unsubscribeSchema, validate, notificationController.unsubscribe);

// History & preferences — user-scoped (owner or admin)
router.get('/history/:userId',              authenticate, historySchema,    validate, notificationController.getHistory);
router.get('/preferences/:userId',          authenticate,                             notificationController.getPreferences);
router.patch('/preferences/:userId',        authenticate, preferenceSchema, validate, notificationController.updatePreference);

// Admin-only — restrict send/broadcast to trusted roles
router.post('/send/:userId',  authenticate, requireAdmin, sendSchema,       validate, notificationController.sendToUser);
router.post('/broadcast',     authenticate, requireAdmin, broadcastSchema,  validate, notificationController.broadcast);

module.exports = router;