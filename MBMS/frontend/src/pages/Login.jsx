import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { login as loginApi, getOAuthUrl } from '../api/authApi';
import {
  Wallet,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import '../styles/pages/legin.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const tokens = await loginApi({ email, password });

      if (!tokens?.accessToken) {
        throw new Error('Login succeeded but no access token was returned.');
      }

      login(tokens);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-blob login-blob--top" aria-hidden="true" />
      <div className="login-blob login-blob--bottom" aria-hidden="true" />

      <header className="login-header">
        <Link to="/" className="login-brand">
          <Wallet className="login-brand__icon" size={28} strokeWidth={2.2} />
          <span className="login-brand__name">WealthFlow</span>
        </Link>
      </header>

      <main className="login-main">
        <div className="login-card">
          <div className="login-heading">
            <h1 className="login-heading__title">Welcome Back</h1>
            <p className="login-heading__subtitle">
              Enter your credentials to access your wealth dashboard.
            </p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            {error && <div className="login-error">{error}</div>}

            <div className="login-field">
              <label className="login-field__label" htmlFor="email">
                Email Address
              </label>
              <div className="login-input-wrap">
                <Mail className="login-input-wrap__icon login-input-wrap__icon--left" size={20} />
                <input
                  className="login-input"
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="login-field">
              <div className="login-field__label-row">
                <label className="login-field__label" htmlFor="password">
                  Password
                </label>
                <span className="login-field__forgot" style={{ opacity: 0.6 }}>
                  Password reset coming soon
                </span>
              </div>
              <div className="login-input-wrap">
                <Lock className="login-input-wrap__icon login-input-wrap__icon--left" size={20} />
                <input
                  className="login-input"
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                
                <button
                  type="button"
                  className="login-input-wrap__icon login-input-wrap__icon--right"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  style={{ background: 'none', border: 'none', padding: 0 }}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="login-remember">
              <input
                className="login-remember__checkbox"
                id="remember"
                name="remember"
                type="checkbox"
              />
              <label className="login-remember__label" htmlFor="remember">
                Remember me for 30 days
              </label>
            </div>

            <button className="login-btn" type="submit" disabled={loading}>
              {loading ? (
                'Logging in...'
              ) : (
                <>
                  Log In
                  <ArrowRight className="login-btn__icon" size={20} />
                </>
              )}
            </button>
          </form>

          <div className="login-divider">
            <span className="login-divider__label">Or continue with</span>
          </div>

          <div className="login-social-grid">
            <button
              className="login-social-btn"
              type="button"
              onClick={() => {
                window.location.href = getOAuthUrl('google');
              }}
            >
              Google
            </button>
            <button
              className="login-social-btn"
              type="button"
              onClick={() => {
                window.location.href = getOAuthUrl('github');
              }}
            >
              GitHub
            </button>
          </div>

          <p className="login-register">
            New to WealthFlow?
            <Link className="login-register__link" to="/signup">
              Create an account
            </Link>
          </p>
        </div>

        <div className="login-trust">
          <div className="login-trust__item">
            <ShieldCheck size={16} />
            SECURED BY FLOWLOCK
          </div>
          <div className="login-trust__item">
            <Lock size={16} />
            256-BIT ENCRYPTION
          </div>
        </div>
      </main>

      <footer className="login-footer">
        <div className="login-footer__inner">
          <div className="login-footer__brand">WealthFlow</div>
          <nav className="login-footer__links">
            <Link className="login-footer__link" to="/privacy">
              Privacy Policy
            </Link>
            <Link className="login-footer__link" to="/terms">
              Terms of Service
            </Link>
            <Link className="login-footer__link" to="/security">
              Security
            </Link>
            <Link className="login-footer__link" to="/cookie-settings">
              Cookie Settings
            </Link>
          </nav>
          <p className="login-footer__copy">
            © 2026 WealthFlow Financial Technologies. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Login;