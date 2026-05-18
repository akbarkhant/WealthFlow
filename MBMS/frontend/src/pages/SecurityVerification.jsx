// SecurityVerification.jsx
import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import '../styles/pages/securityVerification.css';

const SecurityVerification = () => {

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputsRef = useRef([]);
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

  const handleSubmit = (e) => {
    e.preventDefault();

    const finalOtp = otp.join('');

    console.log('OTP:', finalOtp);

    // Add verification API here
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
              We&apos;ve sent a 6-digit verification code to
              <span> joh***@wealthflow.com</span>
            </p>

          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>

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
                />
              ))}

            </div>

            {/* Timer */}
            <div className="timer-box">

              <span className="material-symbols-outlined">
                schedule
              </span>

              <p>
                Code expires in
                <strong> 01:54</strong>
              </p>

            </div>

            {/* Resend */}
            <button
              type="button"
              className="resend-btn"
            >
              Didn&apos;t receive the code?
              <span> Resend Code</span>
            </button>

            {/* Submit */}
            <button
              type="submit"
              className="verify-btn"
            >

              Verify & Proceed

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
            Having trouble?
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