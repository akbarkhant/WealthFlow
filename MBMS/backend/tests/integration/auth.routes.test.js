// tests/auth.routes.test.js

const request = require('supertest');
const express = require('express');

const authRouter = require('../src/routes/auth.routes');

const app = express();

app.use(express.json());

app.use('/api/auth', authRouter);

// Mock route error handler
app.use((err, req, res, next) => {
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message,
  });
});

describe('Auth Routes', () => {
  // ─────────────────────────────────────────────
  // Register Route
  // ─────────────────────────────────────────────

  describe('POST /api/auth/register', () => {
    it('should return 400 if required fields are missing', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
        });

      expect(response.statusCode).toBe(400);

      expect(response.body.success).toBe(false);
    });

    it('should register a user successfully', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Akbar',
          email: 'akbar@example.com',
          password: 'Password123',
        });

      // Adjust according to your controller
      expect([200, 201]).toContain(
        response.statusCode
      );
    });
  });

  // ─────────────────────────────────────────────
  // Login Route
  // ─────────────────────────────────────────────

  describe('POST /api/auth/login', () => {
    it('should return 400 for invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: '',
          password: '',
        });

      expect(response.statusCode).toBe(400);
    });

    it('should login successfully with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'akbar@example.com',
          password: 'Password123',
        });

      // Adjust depending on your logic
      expect([200, 201]).toContain(
        response.statusCode
      );
    });
  });

  // ─────────────────────────────────────────────
  // Profile Route Example
  // ─────────────────────────────────────────────

  describe('GET /api/auth/profile', () => {
    it('should return unauthorized without token', async () => {
      const response = await request(app).get(
        '/api/auth/profile'
      );

      expect(response.statusCode).toBe(401);
    });
  });
});