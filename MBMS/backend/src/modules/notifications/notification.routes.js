const express = require('express');
const router = express.Router();
const notificationController = require('./notification.controller');

router.get('/vapid-public-key',  notificationController.getVapidPublicKey);
router.post('/subscribe',        notificationController.subscribe);
router.post('/unsubscribe',      notificationController.unsubscribe);
router.post('/send/:userId',     notificationController.sendToUser);
router.post('/broadcast',        notificationController.broadcast);

module.exports = router;