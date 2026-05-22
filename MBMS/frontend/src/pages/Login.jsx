import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import '../styles/pages/Login.css';

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
      const data = await api.post('/auth/login', { email, password });
      login(data);
      navigate('/dashboard');
    } catch (err) {
      setError(err || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Background blobs */}
      <div className="login-blob login-blob--top" aria-hidden="true" />
      <div className="login-blob login-blob--bottom" aria-hidden="true" />

      {/* Header */}
      <header className="login-header">
        <Link to="/" className="login-brand">
          <span
            className="material-symbols-outlined login-brand__icon"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            account_balance_wallet
          </span>
          <span className="login-brand__name">WealthFlow</span>
        </Link>
      </header>

      {/* Main */}
      <main className="login-main">
        <div className="login-card">
          {/* Heading */}
          <div className="login-heading">
            <h1 className="login-heading__title">Welcome Back</h1>
            <p className="login-heading__subtitle">
              Enter your credentials to access your wealth dashboard.
            </p>
          </div>

          {/* Form */}
          <form className="login-form" onSubmit={handleSubmit}>
            {error && <div className="login-error">{error}</div>}

            {/* Email */}
            <div className="login-field">
              <label className="login-field__label" htmlFor="email">
                Email Address
              </label>
              <div className="login-input-wrap">
                <span className="material-symbols-outlined login-input-wrap__icon login-input-wrap__icon--left">
                  mail
                </span>
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

            {/* Password */}
            <div className="login-field">
              <div className="login-field__label-row">
                <label className="login-field__label" htmlFor="password">
                  Password
                </label>
                <Link className="login-field__forgot" to="/forgot-password">
                  Forgot Password?
                </Link>
              </div>
              <div className="login-input-wrap">
                <span className="material-symbols-outlined login-input-wrap__icon login-input-wrap__icon--left">
                  lock
                </span>
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
                <span
                  className="material-symbols-outlined login-input-wrap__icon login-input-wrap__icon--right"
                  onClick={() => setShowPassword((v) => !v)}
                  role="button"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </div>
            </div>

            {/* Remember Me */}
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

            {/* Submit */}
            <button className="login-btn" type="submit" disabled={loading}>
              {loading ? (
                'Logging in...'
              ) : (
                <>
                  Log In
                  <span className="material-symbols-outlined login-btn__icon">
                    arrow_forward
                  </span>
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="login-divider">
            <span className="login-divider__label">Or continue with</span>
          </div>

          {/* Social */}
          <div className="login-social-grid">
            <button className="login-social-btn" type="button">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCar-w_fZW7zBTOwIWslJFz-RX6pnUabvQqIREXIEuMBAZP3WlEAuPnObKhD9St9lgrwxjIKu6Yfv4dJMELJ_63gIprOHEqCqOUMkncj7qzU77QZC-mlt1_e_t1LuNL6UFTafjW8cOcWQCURbO3a6XWsihol5ESfuxe2rGSENLDtO3iiZ9aguyD5muRWAFwdfzYYHIVcl5fDST_ByQ4qIydMTKALYOJ_3qjGQNFA1EN6AaPMdg6XBeQOSrjLeE8BIs5kBFPQs58v9rd"
                alt="Google Logo"
              />
              Google
            </button>
            <button className="login-social-btn" type="button">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuB2HyGSDRqxF4ucNwAWR_H_DxnoS_nR3ghmONW24Ihco-t9kUCQaL6rOd_cGDpPP6hOGM0Nh4ipi0Lzit1CG88UC6LGAiPzldlJAJQkQ6yrghHsvAku2t5ytDtnxCbWfYqNMZR9OFIU-clbXJdgS2H6A3AMbJDPpCO0uQDfxCgtvJtB3vGaj9gVopn4dPPQAfsOVLu2QjYhIAcpppPZ6UgH8k_NoY8xNqTma1x_sm5thVGwfiO6FoAG1-4goz1kWyubg1bNSIzYHnS0"
                alt="Apple Logo"
              />
              Apple
            </button>
          </div>

          {/* Register */}
          <p className="login-register">
            New to WealthFlow?
            <Link className="login-register__link" to="/signup">
              Create an account
            </Link>
          </p>
        </div>

        {/* Trust strip */}
        <div className="login-trust">
          <div className="login-trust__item">
            <span className="material-symbols-outlined">verified_user</span>
            SECURED BY FLOWLOCK
          </div>
          <div className="login-trust__item">
            <span className="material-symbols-outlined">lock_reset</span>
            256-BIT ENCRYPTION
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="login-footer">
        <div className="login-footer__inner">
          <div className="login-footer__brand">WealthFlow</div>
          <nav className="login-footer__links">
            <Link className="login-footer__link" to="/privacy">Privacy Policy</Link>
            <Link className="login-footer__link" to="/terms">Terms of Service</Link>
            <Link className="login-footer__link" to="/security">Security</Link>
            <Link className="login-footer__link" to="/cookie-settings">Cookie Settings</Link>
          </nav>
          <p className="login-footer__copy">
            © 2024 WealthFlow Financial Technologies. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Login;