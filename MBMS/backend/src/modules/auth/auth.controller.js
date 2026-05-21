const authService = require('./auth.service');
const { sendSuccess } = require('../../shared/ApiResponse');
const { config } = require('../../config');

async function register(req, res, next) {
  try {
    const tokens = await authService.register(req.body);
    sendSuccess(res, tokens, 201);
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const tokens = await authService.login(req.body);
    sendSuccess(res, tokens);
  } catch (err) {
    next(err);
  }
}

async function refresh(req, res, next) {
  try {
    const { refreshToken } = req.body;
    const tokens = await authService.refresh(refreshToken);
    sendSuccess(res, tokens);
  } catch (err) {
    next(err);
  }
}

async function logout(req, res, next) {
  try {
    const authHeader = req.headers['authorization'] || '';
    const accessToken = authHeader.replace('Bearer ', '');

    const { refreshToken } = req.body || {};

    await authService.logout(accessToken, refreshToken);

    sendSuccess(res, { message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
}

async function oauthCallback(req, res) {
  // Passport attaches tokens to req.user
  const tokens = req.user || {};

  const { FRONTEND_URL } = config;

  const url = new URL('/auth/oauth/callback', FRONTEND_URL);
  url.searchParams.set('accessToken', tokens.accessToken || '');
  url.searchParams.set('refreshToken', tokens.refreshToken || '');

  res.redirect(url.toString());
}

module.exports = {
  register,
  login,
  refresh,
  logout,
  oauthCallback,
};