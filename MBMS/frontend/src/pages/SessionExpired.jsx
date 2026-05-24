// SessionExpired.jsx
import { Link } from 'react-router-dom';
import '../styles/pages/sessionExpired.css';

const SessionExpired = () => {
  return (
    <div className="session-page">

      {/* Header */}
      <header className="session-header">
        <div className="session-header-container">
          <h2 className="brand-logo">WealthFlow</h2>
        </div>
      </header>

      {/* Background Effects */}
      <div className="background-effects">
        <div className="bg-circle bg-circle-1"></div>
        <div className="bg-circle bg-circle-2"></div>
      </div>

      {/* Main Content */}
      <main className="session-main">
        <div className="session-container">

          {/* Icon */}
          <div className="session-icon-wrapper">
            <div className="session-icon">
              <span className="material-symbols-outlined">
                lock_clock
              </span>
            </div>

            <div className="session-security-badge">
              <span className="material-symbols-outlined">
                security
              </span>
            </div>
          </div>

          {/* Text */}
          <div className="session-text">
            <h1>Your session has expired</h1>

            <p>
              For your financial security, we&apos;ve logged you out after a
              period of inactivity. Please log in again to continue managing
              your wealth.
            </p>
          </div>

          {/* Card */}
          <div className="session-card">

            <Link to="/login" className="primary-btn">
              <span>Log In Again</span>

              <span className="material-symbols-outlined arrow-icon">
                arrow_forward
              </span>
            </Link>

            <Link to="/" className="secondary-btn">
              Return to Homepage
            </Link>

          </div>

          {/* Trust Indicator */}
          <div className="trust-indicator">
            <span className="material-symbols-outlined">
              encrypted
            </span>

            <p>Bank-Grade Encryption Enabled</p>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="session-footer">

        <div className="footer-container">

          <div className="footer-left">
            <h3>WealthFlow</h3>

            <p>
              © 2024 WealthFlow Financial Technologies.
              All rights reserved.
            </p>
          </div>

          <div className="footer-links">
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Service</Link>
            <Link to="/security">Security</Link>
            <Link to="/support">Contact Support</Link>
          </div>

        </div>

      </footer>

    </div>
  );
};

export default SessionExpired;