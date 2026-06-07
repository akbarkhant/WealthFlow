// reports.routes.js

const { Router } = require('express');
const { authenticate } = require('../../middleware/authorize.middleware');
const controller = require('./reports.controller');

const router = Router();

router.use(authenticate);

router.get('/monthly', controller.getMonthlyReport);
router.get('/yearly', controller.getYearlyReport);
router.get('/breakdown', controller.getCategoryBreakdown);

module.exports = { reportsRouter: router };
