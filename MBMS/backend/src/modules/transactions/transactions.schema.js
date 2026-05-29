// transactions.schema.js

const { z } = require('zod');

// ── Create Transaction Schema ────────────────────────────────────
const createTransactionSchema = z.object({
  categoryId: z.string().uuid(),

  amount: z
    .number()
    .positive('Amount must be positive'),

  currency: z
    .string()
    .length(3)
    .toUpperCase()
    .default('USD'),

  type: z.enum([
    'income',
    'expense',
  ]),

  description: z
    .string()
    .max(500)
    .optional(),

  date: z
    .string()
    .regex(
      /^\d{4}-\d{2}-\d{2}$/,
      'Date must be YYYY-MM-DD'
    ),

  isRecurring: z
    .boolean()
    .default(false),
});

// ── Update Transaction Schema ────────────────────────────────────
const updateTransactionSchema =
  createTransactionSchema.partial();

// ── List Transactions Schema ─────────────────────────────────────
const listTransactionsSchema = z.object({
  page: z.coerce
    .number()
    .int()
    .positive()
    .default(1),

  limit: z.coerce
    .number()
    .int()
    .positive()
    .max(100)
    .default(20),

  type: z.enum([
    'income',
    'expense',
  ]).optional(),

  categoryId: z
    .string()
    .uuid()
    .optional(),

  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),

  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),

  search: z
    .string()
    .max(100)
    .optional(),
});

// ── Exports ──────────────────────────────────────────────────────
module.exports = {
  createTransactionSchema,
  updateTransactionSchema,
  listTransactionsSchema,
};