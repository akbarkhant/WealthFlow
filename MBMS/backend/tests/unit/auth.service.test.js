// tests/auth.service.test.js

const jwt = require('jsonwebtoken');

const {
  hashPassword,
  comparePassword,
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} = require('../src/services/auth.service');

describe('Auth Service Tests', () => {
  // ─────────────────────────────────────────────
  // PASSWORD HASHING
  // ─────────────────────────────────────────────

  describe('hashPassword()', () => {
    it('should hash password correctly', async () => {
      const password = 'Password123!';

      const hashedPassword =
        await hashPassword(password);

      expect(hashedPassword).toBeDefined();

      expect(hashedPassword).not.toBe(
        password
      );

      expect(hashedPassword.length).toBeGreaterThan(
        20
      );
    });
  });

  // ─────────────────────────────────────────────
  // PASSWORD COMPARISON
  // ─────────────────────────────────────────────

  describe('comparePassword()', () => {
    it('should validate correct password', async () => {
      const password = 'Password123!';

      const hashedPassword =
        await hashPassword(password);

      const isMatch =
        await comparePassword(
          password,
          hashedPassword
        );

      expect(isMatch).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const password = 'Password123!';

      const hashedPassword =
        await hashPassword(password);

      const isMatch =
        await comparePassword(
          'WrongPassword',
          hashedPassword
        );

      expect(isMatch).toBe(false);
    });
  });

  // ─────────────────────────────────────────────
  // ACCESS TOKEN
  // ─────────────────────────────────────────────

  describe('generateAccessToken()', () => {
    it('should generate valid access token', () => {
      const user = {
        id: 1,
        email: 'akbar@example.com',
        role: 'user',
      };

      const token =
        generateAccessToken(user);

      expect(token).toBeDefined();

      const decoded = jwt.decode(token);

      expect(decoded.id).toBe(user.id);

      expect(decoded.email).toBe(
        user.email
      );
    });
  });

  // ─────────────────────────────────────────────
  // REFRESH TOKEN
  // ─────────────────────────────────────────────

  describe('generateRefreshToken()', () => {
    it('should generate valid refresh token', () => {
      const user = {
        id: 1,
      };

      const token =
        generateRefreshToken(user);

      expect(token).toBeDefined();

      const decoded = jwt.decode(token);

      expect(decoded.id).toBe(user.id);
    });
  });

  // ─────────────────────────────────────────────
  // VERIFY ACCESS TOKEN
  // ─────────────────────────────────────────────

  describe('verifyAccessToken()', () => {
    it('should verify valid access token', () => {
      const user = {
        id: 1,
        email: 'akbar@example.com',
        role: 'user',
      };

      const token =
        generateAccessToken(user);

      const decoded =
        verifyAccessToken(token);

      expect(decoded.id).toBe(user.id);

      expect(decoded.email).toBe(
        user.email
      );
    });

    it('should throw error for invalid token', () => {
      expect(() => {
        verifyAccessToken('invalid-token');
      }).toThrow();
    });
  });

  // ─────────────────────────────────────────────
  // VERIFY REFRESH TOKEN
  // ─────────────────────────────────────────────

  describe('verifyRefreshToken()', () => {
    it('should verify valid refresh token', () => {
      const user = {
        id: 1,
      };

      const token =
        generateRefreshToken(user);

      const decoded =
        verifyRefreshToken(token);

      expect(decoded.id).toBe(user.id);
    });
  });
});