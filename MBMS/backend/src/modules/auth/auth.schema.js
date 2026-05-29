/**
 * Authentication Validation Schemas
 * * Part of the Input Validation Layer. Ensures incoming request data 
 * conforms to strict data types, lengths, and security constraints before 
 * it ever hits your controllers or services.
 */

const { z } = require('zod');

/**
 * Schema for User Registration requests
 * Expects: name, email, password, and optional currency
 */
const registerSchema = z.object({
  // Enforces readable names, trims whitespace, and protects against database overflows
  name: z.string().min(2).max(80).trim(),
  
  // Sanitizes and standardizes emails to lowercase to prevent duplicates (e.g., User@Bio.com vs user@bio.com)
  email: z.string().email().toLowerCase().trim(),
  
  // Enforces strong security requirements for account creation
  password: z
    .string()
    .min(8) // Minimum length safeguard
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Must contain at least one special character'),
  
  // Enforces ISO 4217 standard currency codes (e.g., 'USD', 'EUR', 'GBP'), defaulting to 'USD'
  currency: z.string().length(3).toUpperCase().default('USD'),
});

/**
 * Schema for Traditional Login requests
 * Expects: email, password
 */
const loginSchema = z.object({
  // Matches registration sanitation for clean lookups
  email: z.string().email().toLowerCase().trim(),
  
  // Simply verifies a password was provided (hashing and checking happens in the service layer)
  password: z.string().min(1),
});

/**
 * Schema for Token Refresh requests
 * Expects: refreshToken
 */
const refreshSchema = z.object({
  // Ensures the rotation token payload is present and not an empty string
  refreshToken: z.string().min(1),
});

module.exports = {
  registerSchema,
  loginSchema,
  refreshSchema,
};