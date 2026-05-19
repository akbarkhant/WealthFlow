import React from 'react';
import { Link } from 'react-router-dom';
import {
  BriefcaseBusiness,
  Mail,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import '../styles/pages/ForgotPassword.css';

const ForgotPassword = () => {
  return (
    <div className="page">

      <main className="main">

        {/* Background Blobs */}
        <div className="blob blob1"></div>
        <div className="blob blob2"></div>

        <div className="container">

          {/* Branding */}
          <div className="brand">

            <div className="logo-box">
              <BriefcaseBusiness size={26} strokeWidth={2.2} />
            </div>

            <h1>WealthFlow</h1>

          </div>

          {/* Card */}
          <div className="card">

            <h2>Forgot Password?</h2>

            <p>
              Enter your email address and we’ll send you a reset link.
            </p>

            <form>

              <label>Email Address</label>

              <div className="input-box">

                <Mail
                  size={18}
                  className="input-icon"
                />

                <input
                  type="email"
                  placeholder="name@company.com"
                  required
                />

              </div>

              <button
                type="submit"
                className="btn"
              >

                <span>Send Reset Link</span>

                <ArrowRight size={18} />

              </button>

            </form>

            <div className="back">

              <Link to="/login">

                <ArrowLeft size={16} />

                <span>Back to Login</span>

              </Link>

            </div>

          </div>

          {/* Support */}
          <div className="support">

            Need help?{' '}

            <Link to="/support">
              Contact Support
            </Link>

          </div>

        </div>

      </main>

      {/* Footer */}
      <footer className="footer">

        <p>© 2024 WealthFlow</p>

        <div className="footer-links">

          <Link to="/privacy">Privacy</Link>
          <Link to="/terms">Terms</Link>
          <Link to="/security">Security</Link>

        </div>

      </footer>
    </div>
  );
};

export default ForgotPassword;