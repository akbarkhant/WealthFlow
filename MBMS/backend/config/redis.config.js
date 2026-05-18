import Redis from 'ioredis';
import { config } from './index';
import { logger } from './logger';

export const redis = new Redis(config.REDIS_URL, {
  maxRetriesPerRequest: 3,
  lazyConnect: true,
});

redis.on('connect', () => logger.info('✅ Redis connected'));
redis.on('error', (err) => logger.error({ err }, 'Redis error'));

export async function connectRedis(): Promise<void> {
  await redis.connect();
}

// ── Token blacklist helpers ───────────────────────────────────────────────────

const BLACKLIST_PREFIX = 'token:blacklist:';

/**
 * Blacklist a JWT (on logout or token rotation).
 * TTL matches the token's remaining lifetime.
 */
export async function blacklistToken(jti: string, ttlSeconds: number): Promise<void> {
  await redis.set(`${BLACKLIST_PREFIX}${jti}`, '1', 'EX', ttlSeconds);
}

export async function isTokenBlacklisted(jti: string): Promise<boolean> {
  const val = await redis.get(`${BLACKLIST_PREFIX}${jti}`);
  return val !== null;
}

// ── Alert rate-limit helpers ──────────────────────────────────────────────────

const ALERT_PREFIX = 'alert:sent:';

/**
 * Returns true if an alert of this type was already sent for this user today.
 */
export async function wasAlertSentToday(userId: string, alertType: string): Promise<boolean> {
  const key = `${ALERT_PREFIX}${userId}:${alertType}`;
  const val = await redis.get(key);
  return val !== null;
}

export async function markAlertSentToday(userId: string, alertType: string): Promise<void> {
  const key = `${ALERT_PREFIX}${userId}:${alertType}`;
  const secondsUntilMidnight = getSecondsUntilMidnight();
  await redis.set(key, '1', 'EX', secondsUntilMidnight);
}

function getSecondsUntilMidnight(): number {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  return Math.floor((midnight.getTime() - now.getTime()) / 1000);
}