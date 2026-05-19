// middlewares/errorHandler.middleware.js

const logger = require('../config/logger');

/**
 * Global Error Handling Middleware
 * Handles all application errors centrally
 */
function errorHandler(err, req, res, next) {
  // Default values
  let statusCode = err.statusCode || 500;

  let message =
    err.message || 'Internal Server Error';

  // PostgreSQL Errors
  if (err.code) {
    switch (err.code) {
      // Unique violation
      case '23505':
        statusCode = 409;
        message = 'Resource already exists';
        break;

      // Foreign key violation
      case '23503':
        statusCode = 400;
        message = 'Invalid reference key';
        break;

      // Not-null violation
      case '23502':
        statusCode = 400;
        message = 'Required field missing';
        break;

      // Invalid text representation
      case '22P02':
        statusCode = 400;
        message = 'Invalid input format';
        break;

      default:
        break;
    }
  }

  // JWT Errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  // Zod Validation Errors
  if (err.name === 'ZodError') {
    statusCode = 400;

    message = 'Validation failed';

    return res.status(statusCode).json({
      success: false,
      message,
      errors: err.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    });
  }

  // Log Error
  logger.error(
    {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      statusCode,
      error: err.message,
      stack:
        process.env.NODE_ENV === 'development'
          ? err.stack
          : undefined,
    },
    'Application Error'
  );

  // Response
  res.status(statusCode).json({
    success: false,
    message,

    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
    }),
  });
}

module.exports = errorHandler;