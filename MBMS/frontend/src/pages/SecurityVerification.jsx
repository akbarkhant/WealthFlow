// SecurityVerification.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import '../styles/pages/securityVerification.css';

const SecurityVerification = () => {
  const navigate = useNavigate();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes in seconds
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const inputsRef = useRef([]);

  // Countdown timer effect
  useEffect(() => {
    if (timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleChange = (value, index) => {
    if (!/^[0-9]?$/.test(value)) return;

    const updatedOtp = [...otp];
    updatedOtp[index] = value;
    setOtp(updatedOtp);

    if (value && index < 5) {
      inputsRef.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputsRef.current[index - 1].focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (timeLeft <= 0) {
      setError('The code has expired. Please request a new one.');
      return;
    }

    const finalOtp = otp.join('');
    if (finalOtp.length < 6) {
      setError('Please enter all 6 digits.');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      await api.post('/auth/verify-otp', { otp: finalOtp });
      setMessage('Verification successful! Redirecting...');
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (err) {
      setError(err || 'Failed to verify code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    setError('');
    setMessage('');
    try {
      await api.post('/auth/resend-otp');
      setOtp(['', '', '', '', '', '']);
      setTimeLeft(120);
      setMessage('A new verification code has been sent.');
      if (inputsRef.current[0]) {
        inputsRef.current[0].focus();
      }
    } catch (err) {
      setError(err || 'Failed to resend code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="verification-page">
      {/* Background */}
      <div className="background-pattern"></div>
      <div className="blob blob-1"></div>
      <div className="blob blob-2"></div>

      {/* Main */}
      <main className="verification-main">
        {/* Logo */}
        <div className="logo-section">
          <div className="logo-box">
            <span className="material-symbols-outlined">
              account_balance_wallet
            </span>
          </div>
          <h2>WealthFlow</h2>
        </div>

        {/* Card */}
        <div className="verification-card">
          {/* Header */}
          <div className="card-header">
            <div className="lock-icon">
              <span className="material-symbols-outlined">
                lock_person
              </span>
            </div>
            <h1>Two-Step Verification</h1>
            <p>
              We&apos;ve sent a 6-digit verification code to your email.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {error && <div className="error-box" style={{
              backgroundColor: 'rgba(186, 26, 26, 0.1)',
              border: '1px solid var(--error)',
              color: 'var(--error)',
              padding: '12px',
              borderRadius: 'var(--radius-md)',
              marginBottom: '16px',
              fontSize: '14px',
              textAlign: 'center'
            }}>{error}</div>}

            {message && <div className="success-box" style={{
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid var(--success)',
              color: 'var(--success)',
              padding: '12px',
              borderRadius: 'var(--radius-md)',
              marginBottom: '16px',
              fontSize: '14px',
              textAlign: 'center'
            }}>{message}</div>}

            {/* OTP */}
            <div className="otp-container">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputsRef.current[index] = el)}
                  type="text"
                  maxLength="1"
                  value={digit}
                  onChange={(e) =>
                    handleChange(e.target.value, index)
                  }
                  onKeyDown={(e) =>
                    handleKeyDown(e, index)
                  }
                  className="otp-input"
                  required
                  disabled={timeLeft <= 0 || loading}
                />
              ))}
            </div>

            {/* Timer */}
            <div className="timer-box">
              <span className="material-symbols-outlined">
                schedule
              </span>
              <p>
                {timeLeft > 0 ? (
                  <>Code expires in <strong>{formatTime(timeLeft)}</strong></>
                ) : (
                  <strong style={{ color: 'var(--error)' }}>Code expired</strong>
                )}
              </p>
            </div>

            {/* Resend */}
            <button
              type="button"
              className="resend-btn"
              onClick={handleResend}
              disabled={loading}
            >
              Didn&apos;t receive the code?
              <span> Resend Code</span>
            </button>

            {/* Submit */}
            <button
              type="submit"
              className="verify-btn"
              disabled={loading || timeLeft <= 0}
            >
              {loading ? 'Verifying...' : 'Verify & Proceed'}
              <span className="material-symbols-outlined">
                arrow_forward
              </span>
            </button>
          </form>

          {/* Security Icons */}
          <div className="security-section">
            <div className="security-icons">
              <span className="material-symbols-outlined">
                verified_user
              </span>
              <span className="material-symbols-outlined">
                security
              </span>
              <span className="material-symbols-outlined">
                gpp_good
              </span>
            </div>
            <p>
              Secure 256-bit encrypted verification
            </p>
          </div>
        </div>

        {/* Footer */}
        <footer className="help-footer">
          <p>
            Having trouble?{' '}
            <Link to="/support">
              Contact our 24/7 security team
            </Link>
          </p>
        </footer>
      </main>

      {/* Bottom Accent */}
      <div className="bottom-accent"></div>
    </div>
  );
};

export default SecurityVerification;