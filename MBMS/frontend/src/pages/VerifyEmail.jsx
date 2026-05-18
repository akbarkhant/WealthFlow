import React from "react";
import { Link } from "react-router-dom";
import "../styles/pages/VerifyEmail.css";

const VerifyEmail = () => {
  return (
    <div className="verify-email-page">
      {/* Top Navigation */}
      <header className="verify-header">
        <div className="verify-header-container">
          <div className="verify-logo">WealthFlow</div>

          <div className="verify-nav-links">
            <Link to="/features">Features</Link>
            <Link to="/solutions">Solutions</Link>
            <Link to="/pricing">Pricing</Link>
            <Link to="/about">About</Link>
          </div>

          <div className="verify-header-actions">
            <Link to="/login" className="login-btn">
              Log In
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="verify-main">
        <div className="verify-container">
          {/* Card */}
          <div className="verify-card">
            <div className="bg-circle"></div>

            {/* Icon */}
            <div className="verify-icon-wrapper">
              <div className="verify-icon-circle">
                <span className="material-symbols-outlined mail-icon">
                  mail
                </span>

                <div className="verify-badge">
                  <span
                    className="material-symbols-outlined"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    check_circle
                  </span>
                </div>
              </div>
            </div>

            {/* Content */}
            <h1 className="verify-title">Check your inbox</h1>

            <p className="verify-description">
              We've sent a verification link to{" "}
              <span>alex.finance@example.com</span>. Please click the link to
              confirm your account and start your journey.
            </p>

            {/* Actions */}
            <div className="verify-actions">
              <button className="open-email-btn">
                <span className="material-symbols-outlined">
                  open_in_new
                </span>
                Open Email App
              </button>

              <div className="resend-section">
                <p>Didn't receive the email?</p>

                <button className="resend-btn">Resend Email</button>
              </div>
            </div>

            {/* Footer */}
            <div className="verify-help">
              <p>
                Need help?{" "}
                <Link to="/support">Contact Support</Link>
              </p>
            </div>
          </div>

          {/* Info Cards */}
          <div className="info-grid">
            <div className="info-card">
              <div className="info-icon security">
                <span className="material-symbols-outlined">
                  security
                </span>
              </div>

              <div>
                <span className="info-label">Secure</span>
                <span className="info-title">
                  256-bit Encryption
                </span>
              </div>
            </div>

            <div className="info-card">
              <div className="info-icon speed">
                <span className="material-symbols-outlined">
                  speed
                </span>
              </div>

              <div>
                <span className="info-label">Fast</span>
                <span className="info-title">
                  Instant Setup
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="verify-footer">
        <div className="verify-footer-container">
          <div className="footer-brand">
            <div className="footer-logo">WealthFlow</div>

            <p>
              © 2024 WealthFlow Financial Technologies.
              All rights reserved.
            </p>
          </div>

          <div className="footer-links">
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Service</Link>
            <Link to="/security">Security</Link>
            <Link to="/cookie-settings">
              Cookie Settings
            </Link>
          </div>
        </div>
      </footer>

      {/* Bottom Gradient */}
      <div className="bottom-gradient"></div>
    </div>
  );
};

export default VerifyEmail;
