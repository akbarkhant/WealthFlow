// middlewares/validate.middleware.js
const { searchQuerySchema } = require('../modules/search/search.schema');

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

function validateSearchQuery(req, res, next) {
  const { error, value } = searchQuerySchema.validate(req.query, {
    abortEarly: true,
    stripUnknown: true,
  });

  if (error) {
    const reason = error.details?.[0]?.message || 'Invalid search query.';
    const requestId = req.searchRequestId || readRequestId(req) || randomUUID();

    res.setHeader('X-Request-Id', requestId);
    searchLogger.validationFailed({
      requestId,
      userId: req.user?.id,
      reason,
    });

    return res.status(400).json({
      success: false,
      message: reason,
      requestId,
    });
  }

  req.validatedSearchQuery = value;
  return next();
}

module.exports = {
  validate,
  validateSearchQuery,
};