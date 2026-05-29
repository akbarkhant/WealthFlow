import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import "../styles/pages/VerifyEmail.css";

const VerifyEmail = () => {
  const location = useLocation();

  const [email, setEmail] = useState(location.state?.email || "");
  const [loading, setLoading] = useState(!location.state?.email);
  const [error, setError] = useState(null);
  const [resendStatus, setResendStatus] = useState("idle");

  // ===============================
  // FETCH USER IF EMAIL NOT FOUND
  // ===============================
  useEffect(() => {
    if (email) return;

    const fetchUserEmail = async () => {
      try {
        setLoading(true);

        const token = localStorage.getItem("accessToken");

        // ❌ FIX: prevent malformed JWT request
        if (!token || token === "undefined" || token === "null") {
          throw new Error("No valid session found. Please login again.");
        }

        const response = await fetch("/api/users/me", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 401) {
          throw new Error("Session expired or unauthorized access.");
        }

        if (!response.ok) {
          throw new Error("Failed to fetch user details.");
        }

        const data = await response.json();

        if (!data?.data?.user?.email) {
          throw new Error("Email not found in user data.");
        }

        setEmail(data.data.user.email);
        setError(null);

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserEmail();
  }, [email]);

  // ===============================
  // RESEND EMAIL
  // ===============================
  const handleResendEmail = async () => {
    try {
      setResendStatus("sending");

      if (!email) {
        throw new Error("Email not available");
      }

      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error("Failed to resend verification email.");
      }

      setResendStatus("success");

    } catch (err) {
      setResendStatus("error");
    }
  };

  // ===============================
  // OPEN EMAIL APP
  // ===============================
  const handleOpenEmailApp = () => {
    window.location.href = "mailto:";
  };

  return (
    <div className="verify-email-page">

      {/* HEADER */}
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

      {/* MAIN */}
      <main className="verify-main">
        <div className="verify-container">

          <div className="verify-card">
            <div className="bg-circle"></div>

            {/* ICON */}
            <div className="verify-icon-wrapper">
              <div className="verify-icon-circle">
                <span className="material-symbols-outlined mail-icon">
                  mail
                </span>
              </div>
            </div>

            <h1 className="verify-title">Check your inbox</h1>

            {loading ? (
              <p className="verify-description">Loading user details...</p>
            ) : error ? (
              <p style={{ color: "red" }} className="verify-description">
                {error}
              </p>
            ) : (
              <p className="verify-description">
                We sent a verification link to{" "}
                <strong>{email}</strong>. Please check your inbox.
              </p>
            )}

            {/* ACTIONS */}
            <div className="verify-actions">

              <button
                className="open-email-btn"
                onClick={handleOpenEmailApp}
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
                  <p style={{ color: "green" }}>
                    Email sent successfully!
                  </p>
                )}

                {resendStatus === "error" && (
                  <p style={{ color: "red" }}>
                    Failed to resend email.
                  </p>
                )}
              </div>

            </div>

          </div>

        </div>
      </main>

      {/* FOOTER */}
      <footer className="verify-footer">
        <p>
          © {new Date().getFullYear()}  WealthFlow Financial Technologies.
          All rights reserved.
        </p>
      </footer>

    </div>
  );
};

export default VerifyEmail;