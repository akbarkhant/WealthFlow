import pino from 'pino';
import { config } from './index.config.js';

export const logger = pino({
  level: config.NODE_ENV === 'production' ? 'info' : 'debug',
  transport:
    config.NODE_ENV !== 'production'
      ? { target: 'pino-pretty', options: { colorize: true, translateTime: 'SYS:standard' } }
      : undefined,
  redact: {
    paths: ['password', 'password_hash', 'token', 'refresh_token', 'authorization'],
    censor: '[REDACTED]',
  },
});