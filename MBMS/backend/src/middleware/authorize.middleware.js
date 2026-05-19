// middlewares/authorize.middleware.js

const jwt = require('jsonwebtoken');

const { config } = require('../config');
const logger = require('../config/logger');

/**
 * Authentication Middleware
 * Verifies JWT access token
 */
function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    // Check authorization header
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access token missing',
      });
    }

    // Extract token
    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = jwt.verify(
      token,
      config.JWT_ACCESS_SECRET
    );

    // Attach user data to request
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      jti: decoded.jti,
    };

    next();
  } catch (err) {
    logger.error(
      { err },
      'Authentication error'
    );

    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
    });
  }
}

/**
 * Role-based Authorization Middleware
 * Example:
 * authorize('admin')
 * authorize('admin', 'manager')
 */
function authorize(...roles) {
  return (req, res, next) => {
    try {
      // Ensure user exists
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
      }

      // Check role access
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: Access denied',
        });
      }

      next();
    } catch (err) {
      logger.error(
        { err },
        'Authorization error'
      );

      return res.status(500).json({
        success: false,
        message: 'Server error',
      });
    }
  };
}

module.exports = {
  authenticate,
  authorize,
};