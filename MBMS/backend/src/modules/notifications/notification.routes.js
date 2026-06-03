const { Router } = require('express');

const { authenticate, authorize } = require('../../middleware/authorize.middleware');
const notificationController = require('./notification.controller');
const {
  validate,
  subscribeSchema,
  unsubscribeSchema,
  sendSchema,
  broadcastSchema,
  historySchema,
  preferenceSchema,
} = require('./notification.schema');

const router = Router();

router.get('/vapid-public-key', notificationController.getVapidPublicKey);

router.post(
  '/subscribe',
  authenticate,
  subscribeSchema,
  validate,
  notificationController.subscribe
);

router.post(
  '/unsubscribe',
  authenticate,
  unsubscribeSchema,
  validate,
  notificationController.unsubscribe
);

router.get(
  '/history/:userId',
  authenticate,
  historySchema,
  validate,
  notificationController.getHistory
);

router.get(
  '/preferences/:userId',
  authenticate,
  notificationController.getPreferences
);

router.patch(
  '/preferences/:userId',
  authenticate,
  preferenceSchema,
  validate,
  notificationController.updatePreference
);

router.post(
  '/send/:userId',
  authenticate,
  authorize('admin'),
  sendSchema,
  validate,
  notificationController.sendToUser
);

router.post(
  '/broadcast',
  authenticate,
  authorize('admin'),
  broadcastSchema,
  validate,
  notificationController.broadcast
);

module.exports = router;
