// authorize.middleware.js

const jwt = require('jsonwebtoken');

const { config } = require('../config/index.config');
const { logger } = require('../config/logger.config');

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
    const parts = authHeader.split(' ');

    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({
        success: false,
        message: 'Malformed authorization header',
      });
    }

    const token = parts[1];

    if (!token || token === 'undefined' || token === 'null') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token',
      });
    }

    //console.log("AUTH HEADER:", req.headers.authorization);
    //console.log("TOKEN:", token);
    // Verify token
    const decoded = jwt.verify(
      token,
      config.JWT_ACCESS_SECRET
    );

    // Clean up the string to ensure perfect compatibility with Postgres UUID types
    let rawUserId = decoded.sub ?? decoded.id;
    if (typeof rawUserId === 'string') {
      rawUserId = rawUserId.trim().toLowerCase();
    }

    // Attach user data to request
    req.user = {
      id: rawUserId,
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