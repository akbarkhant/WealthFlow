// src/middleware/rateLimiter.middleware.js
const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis').default;
const { randomUUID } = require('crypto');
const { redis } = require('../config/redis.config');
const { logger } = require('../config/logger.config');

// ── Trusted internal IPs to bypass all rate limiting ─────────────────────────
const BYPASS_IPS = new Set(['127.0.0.1', '::1']);

const skipInternalRequests = (req) =>
  BYPASS_IPS.has(req.ip) || req.path === '/health' || req.path === '/metrics';

// ── Redis Store Factory with failure handling ─────────────────────────────────
const createRedisStore = (prefix) => {
  return new RedisStore({
    sendCommand: async (...args) => {
      try {
        return await redis.call(...args);
      } catch (err) {
        // Log but don't crash — express-rate-limit will fall back to memory
        logger.error({ err, prefix }, 'Redis rate-limit store error');
        throw err; // rethrow so express-rate-limit triggers its own fallback
      }
    },
    prefix: `ratelimit:${prefix}:`,
  });
};

// ── Shared key resolver (proxy-safe) ─────────────────────────────────────────
const getClientIp = (req) =>
  req.ip                          // set correctly when 'trust proxy' is on
  ?? req.socket?.remoteAddress    // raw socket fallback
  ?? 'unknown';

// ── General API Rate Limiter ──────────────────────────────────────────────────
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 200,                     // use 'limit', not deprecated 'max'
  standardHeaders: true,
  legacyHeaders: false,
  store: createRedisStore('api'),
  skip: skipInternalRequests,
  keyGenerator: (req) => getClientIp(req),
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
  },
});

// ── Strict Limiter for Auth Routes ────────────────────────────────────────────
const authRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  store: createRedisStore('auth'),
  skip: skipInternalRequests,
  // Key on email + IP so rotating IPs don't bypass and shared IPs don't collide
  keyGenerator: (req) => {
    const email = req.body?.email?.toLowerCase().trim();
    const ip = getClientIp(req);
    return email ? `email:${email}` : `ip:${ip}`;
  },
  handler: (req, res) => {
    const requestId = req.headers['x-request-id'] || randomUUID();
    res.setHeader('X-Request-Id', requestId);

    // ⚠️ Security: log auth brute-force attempts
    logger.warn({
      requestId,
      email: req.body?.email,
      ip: getClientIp(req),
    }, 'Auth rate limit threshold triggered — possible brute-force');

    return res.status(429).json({
      success: false,
      message: 'Too many login attempts, please try again later.',
      requestId,
    });
  },
});

// ── High-Precision Search Rate Limiter ────────────────────────────────────────
const searchRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 30,
  requestPropertyName: 'searchRateLimit',
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  store: createRedisStore('search'),
  skip: skipInternalRequests,
  keyGenerator: (req) => {
    // No 'search:' prefix here — store already applies 'ratelimit:search:'
    return req.user?.id
      ? `user:${req.user.id}`
      : `ip:${getClientIp(req)}`;
  },
  handler: (req, res) => {
    const requestId =
      req.searchRequestId || req.headers['x-request-id'] || randomUUID();
    res.setHeader('X-Request-Id', requestId);

    logger.warn({
      requestId,
      userId: req.user?.id,
      ip: getClientIp(req),
      key: req.searchRateLimit?.key,
    }, 'Search rate limit threshold triggered');

    return res.status(429).json({
      success: false,
      message: 'Too many search requests. Please slow down.',
      requestId,
    });
  },
});

module.exports = { apiLimiter, authRateLimiter, searchRateLimiter };