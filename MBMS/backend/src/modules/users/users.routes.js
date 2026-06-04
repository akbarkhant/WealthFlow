const express = require('express');
const router = express.Router();

const controller = require('./users.controller');
const { authenticate } = require('../../middleware/authorize.middleware');

// ==========================================
// 🔹 IDENTITY ROUTES (SELF USER)
// ==========================================

router.get('/me', authenticate, controller.getMe);
router.put('/me', authenticate, controller.updateMe);
router.delete('/me', authenticate, controller.deleteMe);

// ==========================================
// 🔹 ADMIN ROUTES
// ==========================================

router.get('/:id', controller.getUserById);
router.put('/:id', controller.updateUserById);
router.delete('/:id', controller.deleteUserById);

// ==========================================
// 🔹 SECURITY ROUTES
// ==========================================

router.put('/me/password', controller.updatePassword);
router.put('/me/email', controller.updateEmail);

// ==========================================
// 🔹 MEDIA ROUTES
// ==========================================

//router.put('/me/avatar', controller.updateAvatar);

// ==========================================
// 🔹 ANALYTICS ROUTES
// ==========================================

router.get('/me/activity', controller.getMyActivity);
router.get('/me/stats', controller.getMyStats);

// ==========================================
// 🔹 PREFERENCES ROUTES
// ==========================================

//router.get('/me/preferences', controller.getPreferences);
//router.put('/me/preferences', controller.updatePreferences);

module.exports = router;