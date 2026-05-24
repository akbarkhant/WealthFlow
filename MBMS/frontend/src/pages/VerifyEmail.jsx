import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import "../styles/pages/VerifyEmail.css";

const VerifyEmail = () => {
  const location = useLocation();
  
  // 1. Initialize state with email from navigation history if available
  const [email, setEmail] = useState(location.state?.email || "");
  const [loading, setLoading] = useState(!location.state?.email);
  const [error, setError] = useState(null);
  const [resendStatus, setResendStatus] = useState(""); // 'idle', 'sending', 'success', 'error'

  // 2. Fetch user data if it wasn't passed via router state (e.g., page refresh)
  useEffect(() => {
    if (email) return; // Skip if we already have it

    const fetchUserEmail = async () => {
      try {
        setLoading(true);
        // Replace with your actual endpoint URL. If using cookies/sessions, include credentials
        const response = await fetch("/api/auth/me", {
          headers: {
            "Content-Type": "application/json",
            // If you use JWT tokens in localStorage:
            // "Authorization": `Bearer ${localStorage.getItem("token")}`
          }
        });

        if (!response.ok) {
          throw new Error("Could not retrieve user session details.");
        }

        const data = await response.json();
        setEmail(data.email);
      } catch (err) {
        setError(err.message);
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserEmail();
  }, [email]);

  // 3. Handle the Resend Email action triggered by the user
  const handleResendEmail = async () => {
    try {
      setResendStatus("sending");
      
      const response = await fetch("/api/v1/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error("Failed to send verification link.");
      }

      setResendStatus("success");
    } catch (err) {
      setResendStatus("error");
    }
  };

  // 4. Open mail client protocol helper
  const handleOpenEmailApp = () => {
    window.open("mailto:", "_blank");
  };

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

            {/* Content Switchboards based on API lifecycle */}
            <h1 className="verify-title">Check your inbox</h1>

            {loading ? (
              <p className="verify-description">Loading user details...</p>
            ) : error ? (
              <p className="verify-description" style={{ color: "var(--error-color, red)" }}>
                Error: {error}. Please try logging in again.
              </p>
            ) : (
              <p className="verify-description">
                We've sent a verification link to{" "}
                <span style={{ fontWeight: "bold" }}>{email}</span>. Please click the link to
                confirm your account and start your journey.
              </p>
            )}

            {/* Actions */}
            <div className="verify-actions">
              <button 
                className="open-email-btn" 
                onClick={handleOpenEmailApp}
                disabled={loading || !!error}
              >
                <span className="material-symbols-outlined">
                  open_in_new
                </span>
                Open Email App
              </button>

              <div className="resend-section">
                <p>Didn't receive the email?</p>

                <button 
                  className="resend-btn" 
                  onClick={handleResendEmail}
                  disabled={resendStatus === "sending" || loading || !!error}
                >
                  {resendStatus === "sending" ? "Sending..." : "Resend Email"}
                </button>

                {resendStatus === "success" && (
                  <p style={{ color: "green", fontSize: "0.85rem", marginTop: "4px" }}>
                    Verification link sent successfully!
                  </p>
                )}
                {resendStatus === "error" && (
                  <p style={{ color: "red", fontSize: "0.85rem", marginTop: "4px" }}>
                    Could not resend email. Please try again later.
                  </p>
                )}
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
              © {new Date().getFullYear()} WealthFlow Financial Technologies.
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