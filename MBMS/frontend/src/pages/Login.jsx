import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { login as loginApi, getOAuthUrl, forgotPassword } from '../api/authApi';
import {
  Wallet,
  Mail,
  Lock,
  Eye,
  ArrowRight,
  ShieldCheck,
  ArrowLeft,
  AlertCircle,
  Loader2
} from 'lucide-react';
import '../styles/pages/Login.css';

const Login = () => {
  // ── Refs for Auto Focus & Focus Management ──────────────────────
  const emailRef = useRef(null);
  const passwordRef = useRef(null);

  // ── Core Form States ─────────────────────────────────────────────
  const [email, setEmail] = useState(() => localStorage.getItem('wf_remembered_email') || '');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(() => !!localStorage.getItem('wf_remembered_email'));
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [shakeError, setShakeError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(null); // 'google' | 'github' | null

  // ── Advanced Real-time & Visual UX States ───────────────────────
  const [capsLockOn, setCapsLockOn] = useState(false);
  const [emailValidationError, setEmailValidationError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: '', color: '' });

  // ── View States ──────────────────────────────────────────────────
  const [view, setView] = useState('login'); // 'login' | 'forgot' | 'forgot-sent'
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  // ── #11 Auto-Focus Hook ─────────────────────────────────────────
  useEffect(() => {
    if (view === 'login') {
      if (email) {
        passwordRef.current?.focus(); // If email was remembered, focus password
      } else {
        emailRef.current?.focus(); // Otherwise, focus email
      }
    }
  }, [view, email]);

  // ── #3 & #4 Debounced Email Validation ──────────────────────────
  useEffect(() => {
    if (!email) {
      setEmailValidationError('');
      return;
    }
    const delayDebounceFn = setTimeout(() => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setEmailValidationError('Please enter a valid email address.');
      } else {
        setEmailValidationError('');
      }
    }, 500); // 500ms debounce window

    return () => clearTimeout(delayDebounceFn);
  }, [email]);

  // ── #2 Password Strength Calculator ─────────────────────────────
  useEffect(() => {
    if (!password) {
      setPasswordStrength({ score: 0, label: '', color: '' });
      return;
    }
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    const mapping = [
      { label: 'Weak', color: '#ef4444' },       // Red
      { label: 'Fair', color: '#f97316' },       // Orange
      { label: 'Good', color: '#eab308' },       // Yellow
      { label: 'Strong', color: '#22c55e' }      // Green
    ];

    setPasswordStrength({
      score,
      label: mapping[score - 1]?.label || 'Weak',
      color: mapping[score - 1]?.color || '#ef4444'
    });
  }, [password]);

  // ── #1 Caps Lock Detection ──────────────────────────────────────
  const handleKeyDown = (e) => {
    if (e.getModifierState && e.getModifierState('CapsLock')) {
      setCapsLockOn(true);
    } else {
      setCapsLockOn(false);
    }
  };

  // ── Login Action ────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (emailValidationError) return;

    setError('');
    setShakeError(false);
    setLoading(true);

    try {
      const response = await loginApi({ email, password, rememberMe });

      // ── ADVANCED STRATEGY: Handle unverified user payload from API ──
      if (response?.isUnverified || response?.status === 'UNVERIFIED') {
        navigate('/verify-email', {
          replace: true,
          state: { email: email, fromLogin: true }
        });
        return; // Stop execution early
      }

      // fallback check if tokens are completely missing
      if (!response?.accessToken) {
        throw new Error('Login succeeded but no access token was returned.');
      }

      // ── #12 Remember Last Email Logic ───────────────────────────
      if (rememberMe) {
        localStorage.setItem('wf_remembered_email', email);
      } else {
        localStorage.removeItem('wf_remembered_email');
      }

      login(response); // Assuming tokens wrapper or direct response object
      navigate('/dashboard', { replace: true });

    } catch (err) {
      // ── ALTERNATIVE STRATEGY: Handle unverified error via catch block ──
      // Use this if your API throws an error (e.g., 403 Forbidden) for unverified users
      if (err.status === 403 || err.message?.toLowerCase().includes('verify your email')) {
        navigate('/verify-email', {
          replace: true,
          state: { email: email, fromLogin: true }
        });
        return;
      }

      setError(err.message || 'Invalid email or password.');
      setShakeError(true); // ── #26 Trigger shake dynamic response
    } finally {
      setLoading(false);
    }
  };

  // ── Render Helpers for Screen Readers (#10) ────────────────────
  const isFormDisabled = loading || !!socialLoading;

  if (view === 'forgot' || view === 'forgot-sent') {
    return (
      <div className="login-page page-fade-in">
        <header className="login-header">
          <Link to="/" className="login-brand"><Wallet size={28} /><span className="login-brand__name">WealthFlow</span></Link>
        </header>
        <main className="login-main">
          <div className="login-card">
            {view === 'forgot' ? (
              <>
                <button type="button" className="back-to-login-btn" onClick={() => setView('login')}><ArrowLeft size={16} /> Back to login</button>
                <div className="login-heading">
                  <h1 className="login-heading__title">Forgot Password</h1>
                  <p className="login-heading__subtitle">Enter your email and we'll send you a reset code.</p>
                </div>
                <form className="login-form" onSubmit={handleForgotSubmit}>
                  {forgotError && <div className="login-error" role="alert"><AlertCircle size={16} />{forgotError}</div>}
                  <div className="login-field">
                    <label className="login-field__label" htmlFor="forgot-email">Email Address</label>
                    <div className="login-input-wrap">
                      <Mail className="login-input-wrap__icon login-input-wrap__icon--left" size={20} />
                      <input className="login-input" id="forgot-email" type="email" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} required />
                    </div>
                  </div>
                  <button className="login-btn" type="submit" disabled={forgotLoading}>
                    {forgotLoading ? <Loader2 className="animate-spin" size={20} /> : <>Send Reset Code <ArrowRight size={20} /></>}
                  </button>
                </form>
              </>
            ) : (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 48, marginBottom: 16 }} aria-hidden="true">📬</div>
                <h1 className="login-heading__title">Check your inbox</h1>
                <p className="login-heading__subtitle">We sent a password reset code to <strong>{forgotEmail}</strong>.</p>
                <Link to="/reset-password" state={{ email: forgotEmail }} className="login-btn" style={{ display: 'flex', marginTop: 24, justifyContent: 'center' }}>
                  Enter Reset Code <ArrowRight size={20} />
                </Link>
                <button type="button" className="back-to-login-btn" style={{ marginTop: 16, width: '100%', justifyContent: 'center' }} onClick={() => setView('login')}>Back to login</button>
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="login-page page-fade-in">
      <div className="login-blob login-blob--top" aria-hidden="true" />
      <div className="login-blob login-blob--bottom" aria-hidden="true" />

      <header className="login-header">
        <Link to="/" className="login-brand">
          <Wallet className="login-brand__icon" size={28} strokeWidth={2.2} />
          <span className="login-brand__name">WealthFlow</span>
        </Link>
      </header>

      <main className="login-main">
        {/* ── #26 Conditional Card Shake Class ── */}
        <div className={`login-card ${shakeError ? 'shake-element' : ''}`} onAnimationEnd={() => setShakeError(false)}>
          <div className="login-heading">
            <h1 className="login-heading__title">Welcome Back</h1>
            <p className="login-heading__subtitle">Enter your credentials to access your wealth dashboard.</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit} noValidate>
            {error && (
              <div className="login-error" role="alert" aria-live="assertive">
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            {/* Email Field */}
            <div className="login-field">
              <label className="login-field__label" htmlFor="email">Email Address</label>
              <div className={`login-input-wrap ${emailValidationError ? 'input-wrap--error' : ''}`}>
                <Mail className="login-input-wrap__icon login-input-wrap__icon--left" size={20} />
                <input
                  ref={emailRef}
                  className="login-input"
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isFormDisabled}
                  aria-invalid={!!emailValidationError}
                  aria-describedby={emailValidationError ? "email-error" : undefined}
                  required
                />
              </div>
              {emailValidationError && (
                <span id="email-error" className="field-helper-error" role="alert">{emailValidationError}</span>
              )}
            </div>

            {/* Password Field */}
            <div className="login-field">
              <div className="login-field__label-row">
                <label className="login-field__label" htmlFor="password">Password</label>
                <button
                  type="button"
                  className="login-field__forgot"
                  onClick={() => { setView('forgot'); setForgotEmail(email); }}
                  disabled={isFormDisabled}
                >
                  Forgot password?
                </button>
              </div>
              <div className="login-input-wrap">
                <Lock className="login-input-wrap__icon login-input-wrap__icon--left" size={20} />
                <input
                  ref={passwordRef}
                  className="login-input"
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyUp={handleKeyDown}
                  onKeyDown={handleKeyDown}
                  disabled={isFormDisabled}
                  required
                />

                {/* ── #8 Press & Hold Visibility Interaction ── */}
                <button
                  type="button"
                  className="login-input-wrap__icon login-input-wrap__icon--right press-hold-btn"
                  onMouseDown={() => setShowPassword(true)}
                  onMouseUp={() => setShowPassword(false)}
                  onMouseLeave={() => setShowPassword(false)}
                  onTouchStart={(e) => { e.preventDefault(); setShowPassword(true); }}
                  onTouchEnd={() => setShowPassword(false)}
                  aria-label="Hold down to reveal password"
                  disabled={isFormDisabled}
                >
                  <Eye size={20} />
                </button>
              </div>

              {/* #1 Caps Lock Context Alert */}
              {capsLockOn && (
                <div className="login-caps-warning" role="status">
                  ⚠️ Caps Lock is active
                </div>
              )}

              {/* ── #2 Real-time Password Strength Meter ── */}
              {password && (
                <div className="strength-container" aria-live="polite">
                  <div className="strength-bars">
                    {[1, 2, 3, 4].map((index) => (
                      <div
                        key={index}
                        className="strength-bar-segment"
                        style={{ backgroundColor: index <= passwordStrength.score ? passwordStrength.color : '#e2e8f0' }}
                      />
                    ))}
                  </div>
                  <span className="strength-text" style={{ color: passwordStrength.color }}>Password Security: {passwordStrength.label}</span>
                </div>
              )}
            </div>

            {/* Remember Me Checkbox */}
            <div className="login-remember">
              <input
                className="login-remember__checkbox"
                id="remember"
                name="remember"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={isFormDisabled}
              />
              <label className="login-remember__label" htmlFor="remember">Remember me on this machine</label>
            </div>

            {/* Submit Button with Spinner (#6) */}
            <button className="login-btn" type="submit" disabled={isFormDisabled || !!emailValidationError}>
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>Log In <ArrowRight className="login-btn__icon" size={20} /></>
              )}
            </button>
          </form>

          <div className="login-divider">
            <span className="login-divider__label">Or continue with</span>
          </div>

          {/* Social Media Login Grid with Inline SVG Brand Assets (#16) */}
          <div className="login-social-grid">
            <button className="login-social-btn" type="button" disabled={isFormDisabled} onClick={() => handleSocialLogin('google')}>
              {socialLoading === 'google' ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <>
                  <svg className="social-icon" viewBox="0 0 24 24" width="18" height="18"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" /></svg>
                  Google
                </>
              )}
            </button>
            <button className="login-social-btn" type="button" disabled={isFormDisabled} onClick={() => handleSocialLogin('github')}>
              {socialLoading === 'github' ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <>
                  <svg className="social-icon" viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.07 2.91.83.1-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z" /></svg>
                  GitHub
                </>
              )}
            </button>
          </div>

          <p className="login-register">
            New to WealthFlow? <Link className="login-register__link" to="/signup">Create an account</Link>
          </p>
        </div>

        <div className="login-trust">
          <div className="login-trust__item"><ShieldCheck size={16} /> SECURED BY FLOWLOCK</div>
          <div className="login-trust__item"><Lock size={16} /> 256-BIT ENCRYPTION</div>
        </div>
      </main>

      <footer className="login-footer">
        <div className="login-footer__inner">
          <div className="login-footer__brand">WealthFlow</div>
          <nav className="login-footer__links">
            <Link className="login-footer__link" to="/legal/privacy">Privacy Policy</Link>
            <Link className="login-footer__link" to="/legal/terms">Terms of Service</Link>
            <Link className="login-footer__link" to="/legal/security">Security</Link>
          </nav>
          <p className="login-footer__copy">© 2026 WealthFlow Financial Technologies. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Login;