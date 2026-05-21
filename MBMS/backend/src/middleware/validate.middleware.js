// middlewares/validate.middleware.js

function validate(schema, source = 'body') {
  return (req, res, next) => {
    try {
      const result = schema.safeParse(req[source]);

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

      // Attach validated data
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