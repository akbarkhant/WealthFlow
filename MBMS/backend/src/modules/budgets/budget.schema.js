// budget.schema.js

const { z } = require('zod');

// Replace your old schema with this inside budget.schema.js
const createBudgetSchema = z.object({
  categoryId: z.string().uuid(),
  name: z.string().min(1, "Name is required"),
  amount: z.number().positive("Amount must be greater than 0"),
  period: z.enum(['weekly', 'monthly', 'yearly', 'custom']),
  startDate: z.string(), // Expects a date string like "2026-06-02"
  endDate: z.string().nullable().optional(),
  alertThreshold: z.number().int().min(1).max(100).optional()
});

const updateBudgetSchema = z.object({
  name: z.string().min(1).optional(),
  amountLimit: z.number().positive().optional(),
  period: z.enum(['weekly', 'monthly', 'yearly', 'custom']).optional(),
  startDate: z.string().optional(),
  endDate: z.string().nullable().optional(),
  alertThreshold: z.number().int().min(1).max(100).optional(),
  status: z.enum(['active', 'inactive']).optional()
});
module.exports = {
  createBudgetSchema,
  updateBudgetSchema,
};