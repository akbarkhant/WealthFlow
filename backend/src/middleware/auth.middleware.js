// auth.middleware.js

const jwt = require('jsonwebtoken');

const protect = async (req, res, next) => {
  // ── Guard: secret must exist at startup, not silently fall back ──
  if (!process.env.JWT_SECRET) {
    console.error('FATAL: JWT_SECRET is not set in environment variables');
    return res.status(500).json({ message: 'Server configuration error' });
  }

  const header = req.headers.authorization;

  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  const token = header.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // ← no fallback
    req.user = decoded;
    next();
  } catch (error) {
    console.error('JWT verification failed:', error.message);
    return res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

module.exports = { protect };