// middlewares/rateLimiter.middleware.js

const rateLimit = require('express-rate-limit');

/**
 * General API Rate Limiter
 * Prevents abuse and brute force requests
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per window
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
const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 10, // only 10 attempts per IP

  standardHeaders: true,
  legacyHeaders: false,

  message: {
    success: false,
    message: 'Too many login attempts, please try again later.',
  },
});

module.exports = {
  apiLimiter,
  authLimiter,
};