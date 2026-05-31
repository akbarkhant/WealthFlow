// ai.routes.js

const express = require('express');
const { authenticate } = require('../../middleware/authorize.middleware');
const controller = require('./ai.controller');
const { runWeeklyInsights } = require('./ai.cron');

const router = express.Router();

router.post('/chat',    authenticate, controller.chat);
router.post('/analyze', authenticate, controller.analyze);
router.post('/suggest', authenticate, controller.suggest);

// ← remove after testing
router.post('/test-insights', authenticate, async (req, res) => {
  await runWeeklyInsights();
  res.json({ success: true, message: 'Insights job ran' });
});

module.exports = router;