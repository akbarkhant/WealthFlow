// validate.middleware.js
const { searchQuerySchema } = require('../modules/search/search.schema');
const   searchLogger        = require('../modules/search/search.logger');


function validate(schema, source = 'body') {
  return (req, res, next) => {
    try {

      // 2. Add a safety check in case the schema itself is missing/undefined
      if (!schema || typeof schema.safeParse !== 'function') {
        throw new Error(`The schema passed to the validation middleware is invalid or undefined.`);
      }

      const result = schema.safeParse(req[source]);

      if (!result.success) {
        // Log validation failures for tracking bad payloads
        console.warn(`⚠️ [Validation Failed] Field errors:`, result.error.errors);

        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: result.error.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        });
      }

      // Overwrite request payload data with Zod's parsed output
      req[source] = result.data;

      next();
    } catch (err) {
      // THE CRITICAL LOG: This reveals exactly what went wrong internally
      console.error(" [Validation Critical Error]:", {
        message: err.message,
        stack: err.stack,
        sourceType: source
      });

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

/**
 * Higher-order middleware factory that validates incoming payloads against a Joi schema
 * @param {Joi.ObjectSchema} schema The Joi compilation object blueprint
 */
const validateBody = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { 
      abortEarly: false, // Captures all validation errors, not just the first one
      stripUnknown: true // Safely strips out malicious or unexpected body properties injected by clients
    });

    if (error) {
      const errorDetails = error.details.map(detail => detail.message);
      return res.status(400).json({
        success: false,
        message: "Data validation constraints breached.",
        errors: errorDetails
      });
    }

    // Replace req.body with the sanitized, validated value collection
    req.body = value;
    return next();
  };
};


module.exports = {
  validate,
  validateSearchQuery,
  validateBody,
};