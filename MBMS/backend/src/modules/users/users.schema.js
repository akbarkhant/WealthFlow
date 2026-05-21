const { z } = require('zod');

const updateUserSchema = z.object({
  name: z
    .string()
    .min(2)
    .max(80)
    .trim()
    .optional(),

  currency: z
    .string()
    .length(3)
    .toUpperCase()
    .optional(),

  avatarUrl: z
    .string()
    .url()
    .optional(),
});

module.exports = {
  updateUserSchema,
};