const { Router } = require('express');

const { authenticate } = require('../../middleware/authenticate');
const { sendSuccess } = require('../../shared/ApiResponse');
const service = require('./reports.service');

const router = Router();

// Protect all routes
router.use(authenticate);

// ── Monthly Report ───────────────────────────────────────────────
router.get('/monthly', async (req, res, next) => {
  try {
    const now = new Date();

    const month = Number(req.query.month ?? now.getMonth() + 1);
    const year = Number(req.query.year ?? now.getFullYear());

    const data = await service.getMonthlySummary(
      req.user.id,
      month,
      year
    );

    sendSuccess(res, data);
  } catch (err) {
    next(err);
  }
});

// ── Yearly Report ────────────────────────────────────────────────
router.get('/yearly', async (req, res, next) => {
  try {
    const year = Number(req.query.year ?? new Date().getFullYear());

    const data = await service.getYearlySummary(
      req.user.id,
      year
    );

    sendSuccess(res, data);
  } catch (err) {
    next(err);
  }
});

// ── Category Breakdown ───────────────────────────────────────────
router.get('/breakdown', async (req, res, next) => {
  try {
    const now = new Date();

    const month = Number(req.query.month ?? now.getMonth() + 1);
    const year = Number(req.query.year ?? now.getFullYear());

    const data = await service.getCategoryBreakdown(
      req.user.id,
      month,
      year
    );

    sendSuccess(res, data);
  } catch (err) {
    next(err);
  }
});

module.exports = { reportsRouter: router };