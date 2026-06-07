const { randomUUID } = require('crypto');
const express = require('express');
const { rateLimit, ipKeyGenerator } = require('express-rate-limit');

const   controller          = require('./search.controller');
const   searchLogger        = require('./search.logger');
const { searchQuerySchema } = require('./search.schema');
const { protect }           = require('../../middleware/auth.middleware');
const { searchRateLimiter}  = require('../../middleware/rateLimiter.middleware')
const {validateSearchQuery} = require('../../middleware/validate.middleware')


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
