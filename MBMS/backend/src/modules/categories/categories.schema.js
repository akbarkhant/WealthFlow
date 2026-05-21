const { z } = require('zod');

const createCategorySchema = z.object({
  name: z
    .string()
    .min(2)
    .max(50)
    .trim(),

  icon: z
    .string()
    .min(1)
    .max(20),

  color: z
    .string()
    .regex(/^#([0-9A-Fa-f]{3}){1,2}$/),

  type: z.enum([
    'income',
    'expense',
  ]),
});

const updateCategorySchema =
  createCategorySchema.partial();

module.exports = {
  createCategorySchema,
  updateCategorySchema,
};
