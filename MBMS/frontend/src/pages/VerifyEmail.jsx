import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../api/client"; 
import "../styles/pages/VerifyEmail.css";

const VerifyEmail = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [email, setEmail] = useState(location.state?.email || "");
  const [loading, setLoading] = useState(!location.state?.email);
  const [error, setError] = useState(null);
  const [resendStatus, setResendStatus] = useState("idle");

  useEffect(() => {
    if (email) return;

    const fetchUserEmail = async () => {
      try {
        setLoading(true);
        // Uses your optimized framework call with automated intercept retry loops
        const data = await api.get("/users/me");
        const resolvedEmail = data?.user?.email || data?.email;

        if (!resolvedEmail) {
          throw new Error("Could not extract email address from your account.");
        }
        setEmail(resolvedEmail);
      } catch (err) {
        setError(err.message || "Session error. Please log in again.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserEmail();
  }, [email]);

  const handleResendEmail = async () => {
    if (!email) return;
    try {
      setResendStatus("sending");
      await api.post("/auth/resend-verification", { email });
      setResendStatus("success");
    } catch (err) {
      setResendStatus("error");
    }
  };

  return (
    <div className="verify-email-page">
      <header className="verify-header">
        <div className="verify-header-container">
          <div className="verify-logo" onClick={() => navigate('/')} style={{cursor: 'pointer'}}>
            WealthFlow
          </div>
          <div className="verify-nav-links">
            <Link to="/features">Features</Link>
            <Link to="/solutions">Solutions</Link>
            <Link to="/pricing">Pricing</Link>
          </div>
          <div className="verify-header-actions">
            <Link to="/login" className="login-btn">Log In</Link>
          </div>
        </div>
      </header>

      <main className="verify-main">
        <div className="verify-container">
          <div className="verify-card">
            <div className="bg-circle"></div>
            <div className="verify-icon-wrapper">
              <div className="verify-icon-circle">
                <span className="material-symbols-outlined mail-icon">mail</span>
              </div>
            </div>

            <h1 className="verify-title">Check your inbox</h1>

            {loading ? (
              <p className="verify-description">Loading profile parameters...</p>
            ) : error ? (
              <p className="verify-description error-text-display" style={{ color: "#ef4444" }}>
                {error}
              </p>
            ) : (
              <p className="verify-description">
                We sent a verification link to <strong>{email}</strong>. Please check your inbox.
              </p>
            )}

            <div className="verify-actions">
              <button
                className="open-email-btn"
                onClick={() => window.location.href = "mailto:"}
                disabled={loading || !!error}
              >
                Open Email App
              </button>

              <div className="resend-section">
                <p>Didn't receive the email?</p>
                <button
                  className="resend-btn"
                  onClick={handleResendEmail}
                  disabled={resendStatus === "sending" || !email}
                >
                  {resendStatus === "sending" ? "Sending..." : "Resend Email"}
                </button>

                {resendStatus === "success" && (
                  <p className="status-msg success" style={{ color: "#10b981", fontSize: "14px", marginTop: "8px" }}>
                    Email sent successfully!
                  </p>
                )}
                {resendStatus === "error" && (
                  <p className="status-msg error" style={{ color: "#ef4444", fontSize: "14px", marginTop: "8px" }}>
                    Failed to resend email wrapper.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="verify-footer">
        <p>© {new Date().getFullYear()} WealthFlow Financial Technologies. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default VerifyEmail;