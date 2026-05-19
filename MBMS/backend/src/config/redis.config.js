// redis.config.js

const Redis = require('ioredis');
const { config } = require('./index');
const logger = require('./logger');

const redis = new Redis(config.REDIS_URL, {
  maxRetriesPerRequest: 3,
  lazyConnect: true,

  // Production-level reconnect strategy
  retryStrategy(times) {
    return Math.min(times * 100, 3000);
  },
});

// Redis Events
redis.on('connect', () => {
  logger.info('✅ Redis connected');
});

redis.on('error', (err) => {
  logger.error(
    { err },
    '❌ Redis error'
  );
});

redis.on('reconnecting', () => {
  logger.warn('🔄 Redis reconnecting...');
});

/**
 * Connect Redis manually
 */
async function connectRedis() {
  try {
    await redis.connect();

    logger.info('✅ Redis connection established');
  } catch (err) {
    logger.error(
      { err },
      '❌ Failed to connect Redis'
    );

    process.exit(1);
  }
}

// ─────────────────────────────────────────────
// Token Blacklist Helpers
// ─────────────────────────────────────────────

const BLACKLIST_PREFIX = 'token:blacklist:';

/**
 * Blacklist JWT token
 * Used during logout or refresh token rotation
 */
async function blacklistToken(jti, ttlSeconds) {
  await redis.set(
    `${BLACKLIST_PREFIX}${jti}`,
    '1',
    'EX',
    ttlSeconds
  );
}

/**
 * Check if token is blacklisted
 */
async function isTokenBlacklisted(jti) {
  const value = await redis.get(
    `${BLACKLIST_PREFIX}${jti}`
  );

  return value !== null;
}

// ─────────────────────────────────────────────
// Alert Rate Limiting Helpers
// ─────────────────────────────────────────────

const ALERT_PREFIX = 'alert:sent:';

/**
 * Check if alert was already sent today
 */
async function wasAlertSentToday(userId, alertType) {
  const key = `${ALERT_PREFIX}${userId}:${alertType}`;

  const value = await redis.get(key);

  return value !== null;
}

/**
 * Mark alert as sent for today
 */
async function markAlertSentToday(userId, alertType) {
  const key = `${ALERT_PREFIX}${userId}:${alertType}`;

  const secondsUntilMidnight =
    getSecondsUntilMidnight();

  await redis.set(
    key,
    '1',
    'EX',
    secondsUntilMidnight
  );
}

/**
 * Get seconds remaining until midnight
 */
function getSecondsUntilMidnight() {
  const now = new Date();

  const midnight = new Date(now);

  midnight.setHours(24, 0, 0, 0);

  return Math.floor(
    (midnight.getTime() - now.getTime()) / 1000
  );
}

module.exports = {
  redis,
  connectRedis,

  blacklistToken,
  isTokenBlacklisted,

  wasAlertSentToday,
  markAlertSentToday,
};