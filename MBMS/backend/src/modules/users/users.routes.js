const express = require('express');
const router = express.Router();

const controller = require('./users.controller');

// ==========================================
// 🔹 IDENTITY ROUTES (SELF USER)
// ==========================================

router.get('/me', controller.getMe);
router.put('/me', controller.updateMe);
router.delete('/me', controller.deleteMe);

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