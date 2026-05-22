import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../utils/api';
import '../styles/pages/resetPassword.css';

const ResetPassword = () => {
  const navigate = useNavigate();
  const { token } = useParams();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const hasLength = newPassword.length >= 8;
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);
  const hasUpperLower =
    /[A-Z]/.test(newPassword) && /[a-z]/.test(newPassword);
  const hasNumber = /\d/.test(newPassword);

  const strength =
    [hasLength, hasSpecial, hasUpperLower, hasNumber].filter(Boolean).length;

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError('');
    setMessage('');

    if (newPassword !== confirmPassword) {
      return setError('Passwords do not match');
    }

    try {
      setLoading(true);

      await api.post(`/auth/reset-password/${token}`, {
        password: newPassword
      });

      setMessage('Password updated successfully');

      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-page">
      <header className="reset-header">
        <div className="header-content">
          <h2 className="logo">WealthFlow</h2>

          <Link to="/support" className="help-link">
            Help Center
          </Link>
        </div>
      </header>

      <main className="reset-main">
        <div className="reset-card">
          <div className="top-line"></div>

          <div className="card-header">
            <div className="icon-box">
              <span className="material-symbols-outlined">
                lock_reset
              </span>
            </div>

            <h1>Reset Password</h1>

            <p>
              Choose a secure password to protect your account.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {error && <div className="error-box">{error}</div>}

            {message && (
              <div className="success-box">{message}</div>
            )}

            <div className="form-group">
              <label>New Password</label>

              <div className="input-box">
                <span className="material-symbols-outlined input-icon">
                  key
                </span>

                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) =>
                    setNewPassword(e.target.value)
                  }
                />

                <button
                  type="button"
                  className="toggle-btn"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                >
                  <span className="material-symbols-outlined">
                    {showPassword
                      ? 'visibility_off'
                      : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            <div className="strength-bars">
              <div className={strength >= 1 ? 'active' : ''}></div>
              <div className={strength >= 2 ? 'active' : ''}></div>
              <div className={strength >= 3 ? 'active' : ''}></div>
              <div className={strength >= 4 ? 'active' : ''}></div>
            </div>

            <div className="rules-grid">
              <div className={hasLength ? 'valid' : 'invalid'}>
                {hasLength ? '✓' : '○'} At least 8 characters
              </div>

              <div className={hasSpecial ? 'valid' : 'invalid'}>
                {hasSpecial ? '✓' : '○'} Special character
              </div>

              <div
                className={hasUpperLower ? 'valid' : 'invalid'}
              >
                {hasUpperLower ? '✓' : '○'} Upper & lowercase
              </div>

              <div className={hasNumber ? 'valid' : 'invalid'}>
                {hasNumber ? '✓' : '○'} Include a number
              </div>
            </div>

            <div className="form-group">
              <label>Confirm Password</label>

              <div className="input-box">
                <span className="material-symbols-outlined input-icon">
                  shield_lock
                </span>

                <input
                  type={
                    showConfirmPassword
                      ? 'text'
                      : 'password'
                  }
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(e.target.value)
                  }
                />

                <button
                  type="button"
                  className="toggle-btn"
                  onClick={() =>
                    setShowConfirmPassword(
                      !showConfirmPassword
                    )
                  }
                >
                  <span className="material-symbols-outlined">
                    {showConfirmPassword
                      ? 'visibility_off'
                      : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            <button
              className="submit-btn"
              type="submit"
              disabled={loading}
            >
              {loading
                ? 'Updating Password...'
                : 'Update Password'}
            </button>

            <div className="back-login">
              <Link to="/login">
                ← Back to Log In
              </Link>
            </div>
          </form>
        </div>
      </main>

      <footer className="reset-footer">
        <div className="footer-content">
          <div>
            <h3>WealthFlow</h3>
            <p>
              © 2026 WealthFlow Financial Technologies.
            </p>
          </div>

          <div className="footer-links">
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms</Link>
            <Link to="/security">Security</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ResetPassword;