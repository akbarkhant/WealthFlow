import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { login as loginApi, forgotPassword, getOAuthUrl } from '../api/authApi';

export const useLoginForm = () => {
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const initialFocusDone = useRef(false);

  // ── Core States ──────────────────────────────────────────────────
  const [email, setEmail] = useState(() => localStorage.getItem('wf_remembered_email') || '');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(() => !!localStorage.getItem('wf_remembered_email'));
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [shakeError, setShakeError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(null);

  // ── Advanced Real-time & UX States ──────────────────────────────
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

  // Autofocus Management - Fixed dependency loop to prevent typing cursor jumps
  useEffect(() => {
    if (view === 'login' && !initialFocusDone.current) {
      if (email) {
        passwordRef.current?.focus();
      } else {
        emailRef.current?.focus();
      }
      initialFocusDone.current = true;
    }
    
    // Reset focus tracker if switching views back and forth
    if (view !== 'login') {
      initialFocusDone.current = false;
    }
  }, [view]);

  // Debounced Email Validation
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
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [email]);

  // Password Strength Calculation
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
      { label: 'Weak', color: '#ef4444' },
      { label: 'Fair', color: '#f97316' },
      { label: 'Good', color: '#eab308' },
      { label: 'Strong', color: '#22c55e' }
    ];

    setPasswordStrength({
      score,
      label: mapping[score - 1]?.label || 'Weak',
      color: mapping[score - 1]?.color || '#ef4444'
    });
  }, [password]);

  const handleKeyDown = (e) => {
    if (e.getModifierState && e.getModifierState('CapsLock')) {
      setCapsLockOn(true);
    } else {
      setCapsLockOn(false);
    }
  };

  // ── Redesigned Login Submission Execution ────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (emailValidationError) return;

    setError('');
    setShakeError(false);
    setLoading(true);

    try {
      const result = await loginApi({
        email: email.trim(),
        password,
        rememberMe,
      });
      
      // Handle clients that place data keys underneath a default `.data` wrapper
      const response = result?.data !== undefined ? result.data : result;

      // Check if user status flag marks them as unverified
      if (response?.isUnverified || response?.status === 'UNVERIFIED') {
        navigate('/verify-email', {
          replace: true,
          state: { email, fromLogin: true }
        });
        return;
      }

      //  Backend now returns response.user instead of response with tokens
      const user = response?.user || response;

      if (rememberMe) {
        localStorage.setItem('wf_remembered_email', email);
      } else {
        localStorage.removeItem('wf_remembered_email');
      }

      //  Pass only user object (tokens are in HttpOnly cookies)
      login(user);
      navigate('/dashboard', { replace: true });

    } catch (err) {
      // Extract status and message keys safely out of standard interceptor envelopes
      const status = err.status || err.response?.status;
      const message = err.message || err.response?.data?.message || '';

      if (status === 403 || message.toLowerCase().includes('verify your email')) {
        navigate('/verify-email', {
          replace: true,
          state: { email, fromLogin: true }
        });
        return;
      }

      if (message.toLowerCase().includes('social login')) {
        setError(message);
        setShakeError(true);
        return;
      }

      setError(message || 'Invalid email or password.');
      setShakeError(true);
    } finally {
      setLoading(false);
    }
  };

  // ── Recovery Submission Execution ────────────────────────────────
  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setForgotError('');
    setForgotLoading(true);
    try {
      await forgotPassword(forgotEmail);
      setView('forgot-sent');
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to send reset code.';
      setForgotError(message);
    } finally {
      setForgotLoading(false);
    }
  };

  const handleSocialLogin = (provider) => {
    setSocialLoading(provider);
    try {
      window.location.href = getOAuthUrl(provider);
    } catch (err) {
      setError(`Failed to authenticate via ${provider}.`);
      setSocialLoading(null);
    }
  };

  const isFormDisabled = loading || !!socialLoading;

  return {
    refs: { emailRef, passwordRef },
    state: {
      email, password, rememberMe, showPassword, error, shakeError, loading,
      socialLoading, capsLockOn, emailValidationError, passwordStrength,
      view, forgotEmail, forgotLoading, forgotError, isFormDisabled
    },
    actions: {
      setEmail, setPassword, setRememberMe, setShowPassword, setShakeError,
      setView, setForgotEmail, handleKeyDown, handleSubmit, handleForgotSubmit, handleSocialLogin
    }
  };
};