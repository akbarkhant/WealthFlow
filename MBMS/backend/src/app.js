// app.js

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');

const { config } = require('../src/config/index.config');

// Middlewares
const requestLogger = require('./middleware/requestLogger.middleware');
const notFound = require('./middleware/notFound.middleware');
const {
  errorHandler,
  registerProcessHandlers,
} = require('./middleware/errorHandler.middleware');
const { apiLimiter } = require('./middleware/rateLimiter.middleware');

// Routes
const authRoutes = require('./modules/auth/auth.routes');
const budgetsRouter = require('./modules/budgets/budget.routes');
const transactionsRouter = require('./modules/transactions/transactions.routes');

const app = express();

// ─────────────────────────────────────────────
// Security Middlewares
// ─────────────────────────────────────────────

app.use(helmet());

app.use(
  cors({
    origin: config.FRONTEND_URL,
    credentials: true,
  })
);

app.use(compression());

app.use(cookieParser());

// ─────────────────────────────────────────────
// Body Parsers
// ─────────────────────────────────────────────

app.use(express.json({ limit: '10mb' }));

app.use(
  express.urlencoded({
    extended: true,
    limit: '10mb',
  })
);

// ─────────────────────────────────────────────
// Logging
// ─────────────────────────────────────────────

if (config.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(requestLogger);

// ─────────────────────────────────────────────
// Rate Limiting
// ─────────────────────────────────────────────

app.use(apiLimiter);

// ─────────────────────────────────────────────
// Health Check
// ─────────────────────────────────────────────

app.get('/health', (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Server is running',
    environment: config.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// ─────────────────────────────────────────────
// API Routes
// ─────────────────────────────────────────────

app.use('/api/auth', authRoutes);

app.use('/api/budgets', budgetsRouter);

app.use(
  '/api/transactions',
  transactionsRouter
);

// ─────────────────────────────────────────────
// Root Route
// ─────────────────────────────────────────────

app.get('/', (req, res) => {
  return res.status(200).json({
    success: true,
    message:
      'Budget Management System API',
    version: '1.0.0',
  });
});

// ─────────────────────────────────────────────
// 404 Middleware
// ─────────────────────────────────────────────

app.use(notFound);

// ─────────────────────────────────────────────
// Global Error Handler
// ─────────────────────────────────────────────

app.use(errorHandler);

module.exports = app;