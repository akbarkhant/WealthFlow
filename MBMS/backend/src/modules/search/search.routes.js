const { randomUUID } = require('crypto');
const express = require('express');
const { rateLimit, ipKeyGenerator } = require('express-rate-limit');

const controller = require('./search.controller');
const searchLogger = require('./search.logger');
const { searchQuerySchema } = require('./search.schema');
const { protect } = require('../../middleware/auth.middleware');

const router = express.Router();

function readRequestId(req) {
  const header = req.headers['x-request-id'];
  return Array.isArray(header) ? header[0] : header;
}

function attachSearchContext(req, res, next) {
  const requestId = readRequestId(req) || randomUUID();
  req.searchRequestId = requestId;
  res.setHeader('X-Request-Id', requestId);
  next();
}

function attachRateLimitRequestIP(req, _res, next) {
  const sourceIP = req.ip || req.socket?.remoteAddress || '0.0.0.0';

  req.rateLimit = {
    ...(req.rateLimit || {}),
    // Store a normalized IP before the search limiter builds its key.
    requestIP: ipKeyGenerator(sourceIP),
  };

  next();
}

const searchRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 30,
  requestPropertyName: 'searchRateLimit',
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  keyGenerator: (req) => {
    const subject = req.user?.id
      ? `user:${req.user.id}`
      : `ip:${req.rateLimit.requestIP}`;

    return `search:${subject}`;
  },
  handler: (req, res) => {
    const requestId = req.searchRequestId || readRequestId(req) || randomUUID();

    res.setHeader('X-Request-Id', requestId);
    searchLogger.rateLimited({
      requestId,
      userId: req.user?.id,
      ip: req.rateLimit?.requestIP,
      key: req.searchRateLimit?.key,
    });

    return res.status(429).json({
      success: false,
      message: 'Too many search requests. Please slow down.',
      requestId,
    });
  },
});

function validateSearchQuery(req, res, next) {
  const { error, value } = searchQuerySchema.validate(req.query, {
    abortEarly: true,
    stripUnknown: true,
  });

  if (error) {
    const reason = error.details?.[0]?.message || 'Invalid search query.';
    const requestId = req.searchRequestId || readRequestId(req) || randomUUID();

    res.setHeader('X-Request-Id', requestId);
    searchLogger.validationFailed({
      requestId,
      userId: req.user?.id,
      reason,
    });

    return res.status(400).json({
      success: false,
      message: reason,
      requestId,
    });
  }

  req.validatedSearchQuery = value;
  return next();
}

router.get(
  '/',
  attachSearchContext,
  protect,
  attachRateLimitRequestIP,
  searchRateLimiter,
  validateSearchQuery,
  controller.handleSearch,
);

module.exports = router;
