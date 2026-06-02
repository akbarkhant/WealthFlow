// src/modules/accounts/accounts.routes.js
const express = require('express');
const router = express.Router();
const accountsController = require('./accounts.controller');

const { authenticate } = require('../../middleware/authorize.middleware'); 
const { validateBody } = require('../../middleware/validate.middleware');
const { createAccountSchema, updateAccountSchema } = require('./accounts.schema');

// Enforce auth across all endpoints
router.use(authenticate);

// 🛡️ Mount the validateBody middleware right before the controller actions
router.post('/', validateBody(createAccountSchema), accountsController.create);
router.put('/:id', validateBody(updateAccountSchema), accountsController.updateAccount); // If you add an update route
router.get('/', accountsController.list);

module.exports = router;