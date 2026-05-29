import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { resetPassword as resetPasswordApi } from '../api/authApi';
import {
  Wallet, KeyRound, ShieldCheck, Eye, EyeOff,
  ArrowLeft, CircleCheck, Circle
} from 'lucide-react';
import '../styles/pages/resetPassword.css';

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Pre-fill email context passed from forgot-password view (display only)
  const sentTo = location.state?.email || '';

  // ── Password strength ──────────────────────────────────────────
  const hasLength = newPassword.length >= 8;
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);
  const hasUpperLower = /[A-Z]/.test(newPassword) && /[a-z]/.test(newPassword);
  const hasNumber = /\d/.test(newPassword);
  const strength = [hasLength, hasSpecial, hasUpperLower, hasNumber].filter(Boolean).length;

  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][strength];
  const strengthColor = ['', '#E24B4A', '#EF9F27', '#1D9E75', '#0F6E56'][strength];

  // ── Submit ─────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!code.trim()) return setError('Please enter the reset code.');
    if (newPassword !== confirmPassword) return setError('Passwords do not match.');
    if (strength < 2) return setError('Please choose a stronger password.');

    try {
      setLoading(true);
      await resetPasswordApi(code.trim(), newPassword);
      setMessage('Password updated successfully! Redirecting to login…');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err?.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  const RuleItem = ({ met, label }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: met ? '#0F6E56' : 'var(--color-text-secondary)' }}>
      {met
        ? <CircleCheck size={14} strokeWidth={2.5} />
        : <Circle size={14} strokeWidth={2} />}
      {label}
    </div>
  );

  return (
    <div className="reset-page">

      {/* HEADER */}
      <header className="reset-header">
        <div className="header-content">
          <Link to="/" className="login-brand" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <Wallet size={26} strokeWidth={2.2} />
            <span className="logo">WealthFlow</span>
          </Link>
          <Link to="/support" className="help-link">Help Center</Link>
        </div>
      </header>

      {/* MAIN */}
      <main className="reset-main">
        <div className="reset-card">
          <div className="top-line" />

          <div className="card-header">
            <div className="icon-box">
              <KeyRound size={28} strokeWidth={2} />
            </div>
            <h1>Reset Password</h1>
            <p>
              {sentTo
                ? <>Enter the code we sent to <strong>{sentTo}</strong> and choose a new password.</>
                : 'Enter the reset code from your email and choose a new password.'}
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {error && <div className="error-box">{error}</div>}
            {message && <div className="success-box">{message}</div>}

            {/* RESET CODE */}
            <div className="form-group">
              <label>Reset Code</label>
              <div className="input-box">
                <ShieldCheck size={18} className="input-icon" />
                <input
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  maxLength={6}
                  required
                />
              </div>
            </div>

            {/* NEW PASSWORD */}
            <div className="form-group">
              <label>New Password</label>
              <div className="input-box">
                <KeyRound size={18} className="input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="toggle-btn"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* STRENGTH BARS */}
            {newPassword && (
              <>
                <div className="strength-bars">
                  <div className={strength >= 1 ? 'active' : ''} style={{ background: strength >= 1 ? strengthColor : undefined }} />
                  <div className={strength >= 2 ? 'active' : ''} style={{ background: strength >= 2 ? strengthColor : undefined }} />
                  <div className={strength >= 3 ? 'active' : ''} style={{ background: strength >= 3 ? strengthColor : undefined }} />
                  <div className={strength >= 4 ? 'active' : ''} style={{ background: strength >= 4 ? strengthColor : undefined }} />
                </div>
                <div style={{ fontSize: 12, color: strengthColor, marginBottom: 8, fontWeight: 500 }}>
                  {strengthLabel}
                </div>
                <div className="rules-grid">
                  <RuleItem met={hasLength} label="At least 8 characters" />
                  <RuleItem met={hasSpecial} label="Special character" />
                  <RuleItem met={hasUpperLower} label="Upper & lowercase" />
                  <RuleItem met={hasNumber} label="Include a number" />
                </div>
              </>
            )}

            {/* CONFIRM PASSWORD */}
            <div className="form-group">
              <label>Confirm Password</label>
              <div className="input-box">
                <ShieldCheck size={18} className="input-icon" />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="toggle-btn"
                  onClick={() => setShowConfirm((v) => !v)}
                  aria-label={showConfirm ? 'Hide password' : 'Show password'}
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button className="submit-btn" type="submit" disabled={loading}>
              {loading ? 'Updating Password…' : 'Update Password'}
            </button>

            <div className="back-login">
              <Link to="/login" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <ArrowLeft size={16} /> Back to Log In
              </Link>
            </div>
          </form>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="reset-footer">
        <div className="footer-content">
          <div>
            <h3>WealthFlow</h3>
            <p> © {new Date().getFullYear()}  WealthFlow Financial Technologies.
              All rights reserved.</p>
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