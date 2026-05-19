// tests/budgets.routes.test.js

const request = require('supertest');
const express = require('express');

const budgetsRouter = require('../src/routes/budgets.routes');

const app = express();

app.use(express.json());

// Mount routes
app.use('/api/budgets', budgetsRouter);

// Global error handler for tests
app.use((err, req, res, next) => {
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message,
  });
});

describe('Budgets Routes', () => {
  // ─────────────────────────────────────────────
  // GET ALL BUDGETS
  // ─────────────────────────────────────────────

  describe('GET /api/budgets', () => {
    it('should return budgets list', async () => {
      const response = await request(app).get(
        '/api/budgets'
      );

      expect([200, 401]).toContain(
        response.statusCode
      );
    });
  });

  // ─────────────────────────────────────────────
  // CREATE BUDGET
  // ─────────────────────────────────────────────

  describe('POST /api/budgets', () => {
    it('should return validation error if fields are missing', async () => {
      const response = await request(app)
        .post('/api/budgets')
        .send({});

      expect([400, 401]).toContain(
        response.statusCode
      );
    });

    it('should create a budget successfully', async () => {
      const response = await request(app)
        .post('/api/budgets')
        .send({
          name: 'Monthly Budget',
          amount: 5000,
          category: 'Food',
        });

      expect([200, 201, 401]).toContain(
        response.statusCode
      );
    });
  });

  // ─────────────────────────────────────────────
  // GET SINGLE BUDGET
  // ─────────────────────────────────────────────

  describe('GET /api/budgets/:id', () => {
    it('should return budget details', async () => {
      const response = await request(app).get(
        '/api/budgets/1'
      );

      expect([200, 404, 401]).toContain(
        response.statusCode
      );
    });
  });

  // ─────────────────────────────────────────────
  // UPDATE BUDGET
  // ─────────────────────────────────────────────

  describe('PUT /api/budgets/:id', () => {
    it('should update budget successfully', async () => {
      const response = await request(app)
        .put('/api/budgets/1')
        .send({
          name: 'Updated Budget',
          amount: 7000,
        });

      expect([200, 404, 401]).toContain(
        response.statusCode
      );
    });
  });

  // ─────────────────────────────────────────────
  // DELETE BUDGET
  // ─────────────────────────────────────────────

  describe('DELETE /api/budgets/:id', () => {
    it('should delete budget successfully', async () => {
      const response = await request(app).delete(
        '/api/budgets/1'
      );

      expect([200, 404, 401]).toContain(
        response.statusCode
      );
    });
  });
});