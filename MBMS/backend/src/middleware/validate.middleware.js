// middlewares/validate.middleware.js

/**
 * Zod Validation Middleware
 * Validates request body / params / query using Zod schemas
 */

function validate(schema) {
  return (req, res, next) => {
    try {
      const result = schema.safeParse({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: result.error.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        });
      }

      // Optional: attach parsed data (cleaned version)
      req.validated = result.data;

      next();
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: 'Validation middleware error',
      });
    }
  };
}

module.exports = validate;