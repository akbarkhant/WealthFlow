// src/modules/search/search.routes.js
const express = require('express');
const router = express.Router();
const controller = require('./search.controller');
const { protect } = require('../../middleware/auth.middleware'); // Your auth middleware

// GET /api/search?q=coffee
router.get('/', protect, controller.handleSearch);

module.exports = router;