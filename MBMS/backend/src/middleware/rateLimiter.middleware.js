// middlewares/rateLimiter.middleware.js

const rateLimit = require('express-rate-limit');

/**
 * General API Rate Limiter
 * Prevents abuse and brute force requests
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,

  message: {
    success: false,
    message: 'Too many requests, please try again later.',
  },
});

/**
 * Strict limiter for auth routes (login/register)
 */
const authRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 10, // only 10 attempts per IP

  standardHeaders: true,
  legacyHeaders: false,

  message: {
    success: false,
    message: 'Too many login attempts, please try again later.',
  },
});

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

module.exports = {
  apiLimiter,
  authRateLimiter,
  searchRateLimiter,
};