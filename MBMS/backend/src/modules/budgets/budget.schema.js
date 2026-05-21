const { z } = require('zod');

const createBudgetSchema = z.object({
  categoryId: z.string().uuid(),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2020).max(2100),
  amountLimit: z.number().positive(),
  currency: z.string().length(3).toUpperCase().default('USD'),
});

const updateBudgetSchema = createBudgetSchema
  .partial()
  .omit({
    categoryId: true,
    month: true,
    year: true,
  });

module.exports = {
  createBudgetSchema,
  updateBudgetSchema,
};