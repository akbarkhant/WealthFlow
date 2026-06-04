/**
 * Authentication Controller
 * * Part of the API/Routing layer. Responsible for handling incoming HTTP requests,
 * extracting payloads, invoking the core authentication service logic, and 
 * returning standardized HTTP responses.
 */
const authService = require('./auth.service');
const { sendSuccess } = require('../../shared/ApiResponse');
const { config } = require('../../config/index.config');

/**
 * Get current authenticated user profile
 * Route: GET /auth/me
 * Access: Private (Requires Auth Middleware)
 */
async function me(req, res, next) {
  try {
    // Extract user ID favoring standard 'id' fallback to JWT 'sub' (subject) claim
    const user = await authService.getMe(req.user.id ?? req.user.sub);
    
    // Fail early if the user record no longer exists in the database
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    res.json({ success: true, data: user });
  } catch (err) {
    next(err); // Pass unexpected errors to the global error-handling middleware
  }
}

/**
 * Register a new user account
 * Route: POST /auth/register
 * Access: Public
 */
async function register(req, res, next) {
  try {
    // Pass user details payload to service layer to handle validation, hashing, and storage
    const tokens = await authService.register(req.body);
    
    // Return standard 201 Created response containing access & refresh tokens
    sendSuccess(res, tokens, 201);
  } catch (err) {
    next(err);
  }
}

/**
 * Authenticate user credentials (Traditional Login)
 * Route: POST /auth/login
 * Access: Public
 */
async function login(req, res, next) {
  try {
    // 🔍 TEMPORARY TEST LOG
    console.log('--- LOGIN CONTROLLER TRACE ---');
    console.log('Raw Headers:', req.headers['content-type']);
    console.log('Parsed Request Body:', req.body);
    
    const tokens = await authService.login(req.body);
    sendSuccess(res, tokens);
  } catch (err) {
    next(err);
  }
}

/**
 * Renew expired access token using a valid refresh token
 * Route: POST /auth/refresh
 * Access: Public (Rotational)
 */
async function refresh(req, res, next) {
  try {
    const { refreshToken } = req.body;
    
    // Request a brand new pair of tokens from the service layer
    const tokens = await authService.refresh(refreshToken);
    sendSuccess(res, tokens);
  } catch (err) {
    next(err);
  }
}

/**
 * Invalidate user tokens and terminate session
 * Route: POST /auth/logout
 * Access: Private
 */
async function logout(req, res, next) {
  try {
    // Safely extract the raw Bearer token string from authorization headers
    const authHeader = req.headers['authorization'] || '';
    const accessToken = authHeader.replace('Bearer ', '');

    const { refreshToken } = req.body || {};

    // Blocklist or remove tokens from cache/database to prevent further use
    await authService.logout(accessToken, refreshToken);

    sendSuccess(res, { message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
}

/**
 * Process successful Passport OAuth authentication redirects
 * Route: GET /auth/[provider]/callback
 * Access: Third-Party Public Redirect
 */
async function oauthCallback(req, res) {
  // Passport-derived token payload injected post-strategy execution
  const tokens = req.user || {};
  const { FRONTEND_URL } = config;

  // Construct secure redirect URL to handoff JWTs to client client-side state
  const url = new URL('/auth/oauth/callback', FRONTEND_URL);
  url.searchParams.set('accessToken', tokens.accessToken || '');
  url.searchParams.set('refreshToken', tokens.refreshToken || '');

  // Perform client redirection back to the user interface
  res.redirect(url.toString());
}

async function verifyEmail(req, res, next) {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ message: 'Token is required.' });

    await service.verifyEmail(token);
    sendSuccess(res, { message: 'Email verified successfully.' });
  } catch (err) {
    next(err);
  }
}

async function resendVerification(req, res, next) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required.' });
    }

    await authService.resendVerification(email);

    sendSuccess(res, { message: 'Verification email sent successfully.' });
  } catch (err) {
    next(err);
  }
}

async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required.' });

    await authService.forgotPassword(email);
    sendSuccess(res, { message: 'Reset code sent to your email.' });
  } catch (err) {
    next(err);
  }
}

async function resetPassword(req, res, next) {
  try {
    const { code, newPassword } = req.body;
    if (!code || !newPassword) {
      return res.status(400).json({ message: 'Code and new password are required.' });
    }

    await authService.resetPassword(code, newPassword);
    sendSuccess(res, { message: 'Password reset successfully.' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  me,
  register,
  login,
  refresh,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword, 
  logout,
  oauthCallback,
};