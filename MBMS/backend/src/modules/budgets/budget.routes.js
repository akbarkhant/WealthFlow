const { Router } = require('express');

const { authenticate } = require('../../middleware/auth.middleware');
const { validate } = require('../../middleware/validate.middleware');

const { createBudgetSchema, updateBudgetSchema } = require('./budget.schema');

const controller = require('./budget.controller');

const router = Router();

// Protect all routes
router.use(authenticate);

// ── Budget Routes ───────────────────────────────────────────────

router.get('/', controller.list);

router.get('/:id', controller.getOne);

router.post('/', validate(createBudgetSchema), controller.create);

router.patch('/:id', validate(updateBudgetSchema), controller.update);

router.delete('/:id', controller.remove);

module.exports = {
     budgetsRouter: router 
};