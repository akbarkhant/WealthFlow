import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BriefcaseBusiness,
  Mail,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import api from '../utils/api';
import '../styles/pages/ForgotPassword.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const response = await api.post('/auth/forgot-password', { email });
      setMessage(response?.message || 'Password reset link sent to your email.');
    } catch (err) {
      setError(err || 'Failed to send reset link.');
    } finally {
      setLoading(false);
    }
  };

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

            <form onSubmit={handleSubmit}>
              <label>Email Address</label>
              <div className="input-box">
                <Mail
                  size={18}
                  className="input-icon"
                />
                <input
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn"
                disabled={loading}
              >
                <span>{loading ? 'Sending...' : 'Send Reset Link'}</span>
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
        <p>© {new Date().getFullYear()}  WealthFlow Financial Technologies.
              All rights reserved.</p>
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