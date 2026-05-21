const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const { config } = require('../../config/index.config');
const { query, withTransaction } = require('../../config/db.config');
const { blacklistToken, isTokenBlacklisted } = require('../../config/redis.config');
const { BCRYPT_ROUNDS, DEFAULT_CATEGORIES } = require('../../shared/constants');

const {
  ConflictError,
  UnauthorizedError,
} = require('../../shared/AppError');

// ── Token helpers ─────────────────────────────────────────────────────────────

function signAccessToken(userId, email) {
  const payload = {
    sub: userId,
    email,
    jti: uuidv4(),
  };

  return jwt.sign(payload, config.JWT_ACCESS_SECRET, {
    expiresIn: config.JWT_ACCESS_EXPIRES_IN,
  });
}

function signRefreshToken(userId) {
  const jti = uuidv4();

  const token = jwt.sign(
    {
      sub: userId,
      jti,
    },
    config.JWT_REFRESH_SECRET,
    {
      expiresIn: config.JWT_REFRESH_EXPIRES_IN,
    }
  );

  return { token, jti };
}

async function storeRefreshToken(client, userId, jti, tokenHash) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await client.query(
    `INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at)
     VALUES ($1, $2, $3, $4)`,
    [jti, userId, tokenHash, expiresAt]
  );
}

// ── Public service methods ────────────────────────────────────────────────────

async function register(input) {
  return withTransaction(async (client) => {
    // Check email uniqueness
    const existing = await client.query(
      'SELECT id FROM users WHERE email = $1',
      [input.email]
    );

    if (existing.rows.length > 0) {
      throw new ConflictError('An account with this email already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);

    // Create user
    const userId = uuidv4();

    await client.query(
      `INSERT INTO users (id, name, email, password_hash, currency)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, input.name, input.email, passwordHash, input.currency]
    );

    // Seed default categories
    for (const cat of DEFAULT_CATEGORIES) {
      await client.query(
        `INSERT INTO categories (id, user_id, name, icon, color, type, is_default)
         VALUES ($1, $2, $3, $4, $5, $6, true)`,
        [uuidv4(), userId, cat.name, cat.icon, cat.color, cat.type]
      );
    }

    // Issue tokens
    const accessToken = signAccessToken(userId, input.email);
    const { token: refreshToken, jti } = signRefreshToken(userId);

    const tokenHash = await bcrypt.hash(refreshToken, 10);
    await storeRefreshToken(client, userId, jti, tokenHash);

    return { accessToken, refreshToken };
  });
}

async function login(input) {
  const rows = await query(
    'SELECT id, email, password_hash FROM users WHERE email = $1 AND deleted_at IS NULL',
    [input.email]
  );

  const user = rows[0];

  // constant-time comparison safety
  const hashToCompare =
    (user && user.password_hash) ||
    '$2b$12$invalidhashpadding000000000000000000000000000000000000';

  const valid = await bcrypt.compare(input.password, hashToCompare);

  if (!user || !valid) {
    throw new UnauthorizedError('Invalid email or password');
  }

  return withTransaction(async (client) => {
    const accessToken = signAccessToken(user.id, user.email);
    const { token: refreshToken, jti } = signRefreshToken(user.id);

    const tokenHash = await bcrypt.hash(refreshToken, 10);
    await storeRefreshToken(client, user.id, jti, tokenHash);

    return { accessToken, refreshToken };
  });
}

async function refresh(rawRefreshToken) {
  let payload;

  try {
    payload = jwt.verify(rawRefreshToken, config.JWT_REFRESH_SECRET);
  } catch (err) {
    throw new UnauthorizedError('Invalid or expired refresh token');
  }

  if (await isTokenBlacklisted(payload.jti)) {
    throw new UnauthorizedError('Refresh token has been revoked');
  }

  return withTransaction(async (client) => {
    const rows = await client.query(
      `SELECT token_hash, user_id FROM refresh_tokens
       WHERE id = $1 AND expires_at > NOW() AND revoked_at IS NULL`,
      [payload.jti]
    );

    const stored = rows.rows[0];

    if (!stored) {
      throw new UnauthorizedError('Refresh token not found or expired');
    }

    const valid = await bcrypt.compare(rawRefreshToken, stored.token_hash);

    if (!valid) {
      throw new UnauthorizedError('Refresh token mismatch');
    }

    // revoke old token
    await client.query(
      'UPDATE refresh_tokens SET revoked_at = NOW() WHERE id = $1',
      [payload.jti]
    );

    await blacklistToken(payload.jti, 7 * 24 * 60 * 60);

    const userRows = await client.query(
      'SELECT email FROM users WHERE id = $1',
      [stored.user_id]
    );

    const email = userRows.rows[0]?.email;

    const accessToken = signAccessToken(stored.user_id, email);

    const { token: newRefreshToken, jti: newJti } = signRefreshToken(
      stored.user_id
    );

    const newHash = await bcrypt.hash(newRefreshToken, 10);
    await storeRefreshToken(client, stored.user_id, newJti, newHash);

    return { accessToken, refreshToken: newRefreshToken };
  });
}

async function logout(accessToken, refreshToken) {
  try {
    const payload = jwt.decode(accessToken);

    if (payload && payload.jti && payload.exp) {
      const ttl = payload.exp - Math.floor(Date.now() / 1000);
      if (ttl > 0) {
        await blacklistToken(payload.jti, ttl);
      }
    }
  } catch (err) {
    // ignore
  }

  if (refreshToken) {
    try {
      const payload = jwt.verify(refreshToken, config.JWT_REFRESH_SECRET);

      await query(
        'UPDATE refresh_tokens SET revoked_at = NOW() WHERE id = $1',
        [payload.jti]
      );

      await blacklistToken(payload.jti, 7 * 24 * 60 * 60);
    } catch (err) {
      // ignore
    }
  }
}

async function findOrCreateOAuthUser(profile) {
  return withTransaction(async (client) => {
    const linkRows = await client.query(
      `SELECT user_id FROM oauth_accounts WHERE provider = $1 AND provider_id = $2`,
      [profile.provider, profile.providerId]
    );

    let userId;

    if (linkRows.rows.length > 0) {
      userId = linkRows.rows[0].user_id;
    } else {
      const emailRows = await client.query(
        'SELECT id FROM users WHERE email = $1',
        [profile.email]
      );

      if (emailRows.rows.length > 0) {
        userId = emailRows.rows[0].id;
      } else {
        userId = uuidv4();

        await client.query(
          `INSERT INTO users (id, name, email, avatar_url, currency)
           VALUES ($1, $2, $3, $4, 'USD')`,
          [
            userId,
            profile.name,
            profile.email,
            profile.avatarUrl || null,
          ]
        );

        for (const cat of DEFAULT_CATEGORIES) {
          await client.query(
            `INSERT INTO categories (id, user_id, name, icon, color, type, is_default)
             VALUES ($1, $2, $3, $4, $5, $6, true)`,
            [uuidv4(), userId, cat.name, cat.icon, cat.color, cat.type]
          );
        }
      }

      await client.query(
        `INSERT INTO oauth_accounts (user_id, provider, provider_id, avatar_url)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (provider, provider_id) DO NOTHING`,
        [
          userId,
          profile.provider,
          profile.providerId,
          profile.avatarUrl || null,
        ]
      );
    }

    const userRows = await client.query(
      'SELECT email FROM users WHERE id = $1',
      [userId]
    );

    const email = userRows.rows[0].email;

    const accessToken = signAccessToken(userId, email);
    const { token: refreshToken, jti } = signRefreshToken(userId);

    const tokenHash = await bcrypt.hash(refreshToken, 10);
    await storeRefreshToken(client, userId, jti, tokenHash);

    return { accessToken, refreshToken };
  });
}

// ── exports ────────────────────────────────────────────────────────────────────

module.exports = {
  register,
  login,
  refresh,
  logout,
  findOrCreateOAuthUser,
};