// src/modules/accounts/accounts.schema.js
const Joi = require('joi');

/**
 * Validation blueprint schema for creating a brand new account record.
 * Guards incoming HTTP data types, lengths, and valid options.
 */
const createAccountSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(3)
    .max(100)
    .required()
    .messages({
      'string.empty': 'Account name cannot be empty.',
      'string.min': 'Account name must be at least 3 characters long.',
      'any.required': 'Account name is a required parameter.'
    }),

  type: Joi.string()
    .trim()
    .lowercase()
    .valid('bank', 'cash', 'credit_card', 'wallet', 'investment')
    .required()
    .messages({
      'any.only': 'Account type must be one of: bank, cash, credit_card, wallet, investment.',
      'any.required': 'Account type is a required parameter.'
    }),

  balance: Joi.number()
    .default(0.00)
    .messages({
      'number.base': 'Starting balance must be a valid number.'
    }),

  currency: Joi.string()
    .trim()
    .uppercase()
    .min(3)
    .max(10)
    .default('PKR')
    .messages({
      'string.min': 'Currency code must be at least 3 characters (e.g., PKR, USD).'
    })
});

/**
 * Validation blueprint schema for updating an existing account record.
 * Makes fields optional, but enforces structural rules if they are provided.
 */
const updateAccountSchema = Joi.object({
  name: Joi.string().trim().min(3).max(100),
  type: Joi.string().trim().lowercase().valid('bank', 'cash', 'credit_card', 'wallet', 'investment'),
  balance: Joi.number(),
  currency: Joi.string().trim().uppercase().min(3).max(10)
}).min(1); // Enforces that at least one field must be provided to run an update

module.exports = {
  createAccountSchema,
  updateAccountSchema
};