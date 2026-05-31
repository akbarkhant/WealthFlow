// backend/src/modules/ai/ai.routes.js

const express  = require('express');
const multer   = require('multer');
const path     = require('path');
const os       = require('os');
const router   = express.Router();
const ctrl     = require('./ai.controller');
const { authenticate } = require('../../middleware/authorize.middleware');

// ── Multer config — temp disk storage for receipt images ─────────────────────
const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, os.tmpdir()),
    filename:    (_req, file, cb) => {
      const ext  = path.extname(file.originalname);
      const name = `receipt_${Date.now()}${ext}`;
      cb(null, name);
    },
  }),
  limits:       { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter:   (_req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp|bmp|tiff/i;
    if (allowed.test(path.extname(file.originalname)) && allowed.test(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for receipt scanning.'));
    }
  },
});

// ── All routes require authentication ────────────────────────────────────────
router.use(authenticate);

// ── Chat (Feature 1) ─────────────────────────────────────────────────────────
router.get   ('/chat/history',          ctrl.getChatHistory);
router.delete('/chat/history',          ctrl.clearChatHistory);
router.post  ('/chat',                  ctrl.chat);

// ── Analysis & Forecast (Features 3, 6, 14) ──────────────────────────────────
router.post  ('/analyze',               ctrl.analyze);
router.post  ('/suggest',               ctrl.suggest);

// ── Receipt Scanner (Feature 11) ─────────────────────────────────────────────
router.post  ('/receipt',  upload.single('receipt'), ctrl.scanReceipt);

// ── Financial Education (Feature 15) ─────────────────────────────────────────
router.get   ('/education',                    ctrl.getEducationTopics);
router.get   ('/education/:index',             ctrl.getEducationTip);
router.get   ('/education/topic/:name',        ctrl.getEducationTipByTopic);

// ── Monthly PDF Report (Feature 13) ──────────────────────────────────────────
router.get   ('/report/:month',                ctrl.getMonthlyReport);

module.exports = router;