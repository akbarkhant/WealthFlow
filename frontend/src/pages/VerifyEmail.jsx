import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Mail, Loader2, CheckCircle2, AlertCircle, ArrowLeft } from "lucide-react";
import api from "../api/client"; 
import Navbar from '../components/HomeComponents/Navbar1';
import "../styles/pages/VerifyEmail.css";

const VerifyEmail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const [email, setEmail] = useState(location.state?.email || "");
  const [loading, setLoading] = useState(!location.state?.email);
  const [error, setError] = useState(null);
  const [resendStatus, setResendStatus] = useState("idle");
  const [countdown, setCountdown] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Handle countdown timer for resending email
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  // Fetch email if not passed through navigation state
  useEffect(() => {
    if (email) return;

    const fetchUserEmail = async () => {
      try {
        setLoading(true);
        const data = await api.get("/users/me");
        const resolvedEmail = data?.user?.email || data?.email;

        if (!resolvedEmail) {
          throw new Error("Could not find an email address associated with this account.");
        }
        setEmail(resolvedEmail);
      } catch (err) {
        setError(err.message || "Your session expired. Please log in again.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserEmail();
  }, [email]);

  // Close the email app dropdown if the user clicks anywhere outside of it
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleResendEmail = async () => {
    if (!email || countdown > 0) return;
    try {
      setResendStatus("sending");
      await api.post("/auth/resend-verification", { email });
      setResendStatus("success");
      setCountdown(60); // 60-second cooldown to pace the user and protect backend routes
    } catch (err) {
      setResendStatus("error");
    }
  };

  return (
    <div className="verify-email-page">
      <Navbar />

      <main className="verify-main">
        <div className="verify-container">
          <div className="verify-card">
            
            {/* Top Functional State Icon */}
            <div className="verify-icon-wrapper">
              <div className={`verify-icon-circle ${resendStatus === "success" ? "success-glow" : ""}`}>
                {resendStatus === "success" ? (
                  <CheckCircle2 className="verify-icon success-color" size={32} />
                ) : error ? (
                  <AlertCircle className="verify-icon error-color" size={32} />
                ) : (
                  <Mail className="verify-icon primary-color" size={32} />
                )}
              </div>
            </div>

            {/* Dynamic Card Headings */}
            <h1 className="verify-title">
              {error ? "Verification Issue" : resendStatus === "success" ? "Link sent!" : "Check your inbox"}
            </h1>

            {/* Content Status Blocks */}
            {loading ? (
              <div className="verify-loading-state">
                <Loader2 className="spinner" size={20} />
                <p className="verify-description">Securing your profile context...</p>
              </div>
            ) : error ? (
              <div className="status-alert-box error-box">
                <p className="verify-description error-text">{error}</p>
              </div>
            ) : (
              <p className="verify-description">
                We sent a secure verification link to <strong className="user-email">{email}</strong>. Please check your spam folder if it doesn't arrive shortly.
              </p>
            )}

            {/* Interaction Actions Area */}
            <div className="verify-actions">
              
              {/* Smart Email Client Dropdown Wrapper */}
              <div className="email-client-selector" ref={dropdownRef}>
                <button
                  className="open-email-btn"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  disabled={loading || !!error}
                >
                  <Mail size={18} />
                  Open Email App
                </button>
                
                {isDropdownOpen && (
                  <div className="email-dropdown-menu">
                    <a href="https://mail.google.com" target="_blank" rel="noopener noreferrer" onClick={() => setIsDropdownOpen(false)}>
                      Gmail
                    </a>
                    <a href="https://outlook.live.com" target="_blank" rel="noopener noreferrer" onClick={() => setIsDropdownOpen(false)}>
                      Outlook / Hotmail
                    </a>
                    <a href="https://mail.yahoo.com" target="_blank" rel="noopener noreferrer" onClick={() => setIsDropdownOpen(false)}>
                      Yahoo Mail
                    </a>
                    <a href="https://www.icloud.com/mail" target="_blank" rel="noopener noreferrer" onClick={() => setIsDropdownOpen(false)}>
                      iCloud Mail
                    </a>
                    <div className="dropdown-divider"></div>
                    <a href="mailto:" className="fallback-client" onClick={() => setIsDropdownOpen(false)}>
                      Default Native App (mailto:)
                    </a>
                  </div>
                )}
              </div>

              <div className="resend-divider">
                <span>or</span>
              </div>

              {/* Email Resend Trigger Pipeline */}
              <div className="resend-section">
                <button
                  className="resend-btn"
                  onClick={handleResendEmail}
                  disabled={resendStatus === "sending" || countdown > 0 || !email || !!error}
                >
                  {resendStatus === "sending" ? (
                    <>
                      <Loader2 className="spinner" size={16} />
                      Sending link...
                    </>
                  ) : countdown > 0 ? (
                    `Resend email in ${countdown}s`
                  ) : (
                    "Resend verification email"
                  )}
                </button>

                {resendStatus === "error" && (
                  <p className="status-msg error-text">
                    Unable to send link. Please try again in a moment.
                  </p>
                )}
              </div>
            </div>

            {/* Back Navigation Escape Hatch */}
            <button className="back-to-login-btn" onClick={() => navigate("/login")}>
              <ArrowLeft size={16} />
              Back to Sign In
            </button>

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