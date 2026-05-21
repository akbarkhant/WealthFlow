const { Router } = require('express');
const passport = require('passport');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
const { Strategy: GitHubStrategy } = require('passport-github2');

const { config } = require('../../config');
const { authRateLimiter } = require('../../middleware/rateLimiter.middleware');
const { validate } = require('../../middleware/validate.middleware');
const { authenticate } = require('../../middleware/auth.middleware');

const {
  registerSchema,
  loginSchema,
  refreshSchema,
} = require('./auth.schema');

const controller = require('./auth.controller');
const { findOrCreateOAuthUser } = require('./auth.service');

const router = Router();

// ── Passport: Google ───────────────────────────────────────────────
passport.use(
  new GoogleStrategy(
    {
      clientID: config.GOOGLE_CLIENT_ID,
      clientSecret: config.GOOGLE_CLIENT_SECRET,
      callbackURL: `${config.FRONTEND_URL.replace('5173', '4000')}/api/v1/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const tokens = await findOrCreateOAuthUser({
          provider: 'google',
          providerId: profile.id,
          email: profile.emails?.[0]?.value || '',
          name: profile.displayName,
          avatarUrl: profile.photos?.[0]?.value,
        });

        done(null, tokens);
      } catch (err) {
        done(err);
      }
    }
  )
);

// ── Passport: GitHub ───────────────────────────────────────────────
passport.use(
  new GitHubStrategy(
    {
      clientID: config.GITHUB_CLIENT_ID,
      clientSecret: config.GITHUB_CLIENT_SECRET,
      callbackURL: `${config.FRONTEND_URL.replace('5173', '4000')}/api/v1/auth/github/callback`,
      scope: ['user:email'],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email =
          profile.emails?.find((e) => e.primary)?.value ||
          profile.emails?.[0]?.value ||
          '';

        const tokens = await findOrCreateOAuthUser({
          provider: 'github',
          providerId: profile.id,
          email,
          name: profile.displayName || profile.username,
          avatarUrl: profile.photos?.[0]?.value,
        });

        done(null, tokens);
      } catch (err) {
        done(err);
      }
    }
  )
);

// ── Auth Routes ────────────────────────────────────────────────────

// Email/password auth
router.post('/register', authRateLimiter, validate(registerSchema), controller.register);
router.post('/login', authRateLimiter, validate(loginSchema), controller.login);
router.post('/refresh', authRateLimiter, validate(refreshSchema), controller.refresh);
router.post('/logout', authenticate, controller.logout);

// Google OAuth
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  controller.oauthCallback
);

// GitHub OAuth
router.get(
  '/github',
  passport.authenticate('github', { scope: ['user:email'], session: false })
);

router.get(
  '/github/callback',
  passport.authenticate('github', { session: false, failureRedirect: '/login' }),
  controller.oauthCallback
);

module.exports = router;