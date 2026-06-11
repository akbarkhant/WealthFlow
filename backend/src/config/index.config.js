// src/config/index.config.js
require('dotenv').config();

function required(name, defaultValue = null) {
  const value = process.env[name];

  // In test environment, allow missing variables with sensible defaults
  if (!value && process.env.NODE_ENV === 'test') {
    if (defaultValue !== null) return defaultValue;
    return `test_${name.toLowerCase()}`;
  }

  if (!value) {
    console.error(`❌ Missing environment variable: ${name}`);
    process.exit(1);
  }

  return value;
}

const config = {
  NODE_ENV: process.env.NODE_ENV || 'development',

  PORT: Number(process.env.PORT) || 5000,

  // Database
  DATABASE_URL: required('DATABASE_URL'),

  // Redis
  REDIS_URL: required('REDIS_URL'),

  // JWT
  JWT_ACCESS_SECRET: required('JWT_ACCESS_SECRET'),
  JWT_REFRESH_SECRET: required('JWT_REFRESH_SECRET'),

  JWT_ACCESS_EXPIRES_IN:
    process.env.JWT_ACCESS_EXPIRES_IN || '15m',

  JWT_REFRESH_EXPIRES_IN:
    process.env.JWT_REFRESH_EXPIRES_IN || '7d',

  // OAuth
  GOOGLE_CLIENT_ID: required('GOOGLE_CLIENT_ID'),
  GOOGLE_CLIENT_SECRET: required('GOOGLE_CLIENT_SECRET'),

  GITHUB_CLIENT_ID: required('GITHUB_CLIENT_ID'),
  GITHUB_CLIENT_SECRET: required('GITHUB_CLIENT_SECRET'),

  // SMTP
  SMTP_HOST: required('SMTP_HOST'),

  SMTP_PORT: Number(process.env.SMTP_PORT) || 587,

  SMTP_USER: required('SMTP_USER'),
  SMTP_PASS: required('SMTP_PASS'),

  EMAIL_FROM:
    process.env.EMAIL_FROM ||
    'BudgetManager <no-reply@example.com>',

  // Frontend
  FRONTEND_URL: required('FRONTEND_URL'),
};

module.exports = {
  config,
};