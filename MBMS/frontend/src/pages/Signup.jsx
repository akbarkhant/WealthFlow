import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { register as registerApi } from "../api/authApi";
import "../styles/pages/Register.css";

const Signup = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      return setError("Passwords do not match");
    }

    setLoading(true);

    try {
      const data = await registerApi({
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email,
        password: formData.password,
        currency: "USD",
      });

      login(data);
      navigate("/verify-email");
    } catch (err) {
      setError(err?.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-page">
      {/* Background Effects */}
      <div className="signup-bg">
        <div className="bg-circle bg-circle-1"></div>
        <div className="bg-circle bg-circle-2"></div>
      </div>

      <main className="signup-main">
        <div className="signup-container">
          {/* LEFT SIDE */}
          <div className="signup-left">
            <div className="branding-content">
              <h1 className="brand-title">
                Master your <span>WealthFlow</span>.
              </h1>

              <p className="brand-description">
                Join thousands of investors using WealthFlow to automate their
                financial growth with precision-grade analytics and
                institutional-level security.
              </p>
            </div>

            <div className="feature-grid">
              <div className="feature-card">
                <span className="material-symbols-outlined feature-icon">
                  verified_user
                </span>

                <h3>Secure</h3>

                <p>Bank-grade 256-bit encryption for all data.</p>
              </div>

              <div className="feature-card">
                <span className="material-symbols-outlined feature-icon">
                  trending_up
                </span>

                <h3>Insightful</h3>

                <p>Real-time tracking of all your assets.</p>
              </div>
            </div>

            <div className="trust-card">
              <div className="user-images">
                <img
                  src="https://i.pravatar.cc/100?img=1"
                  alt="user"
                />
                <img
                  src="https://i.pravatar.cc/100?img=2"
                  alt="user"
                />
                <img
                  src="https://i.pravatar.cc/100?img=3"
                  alt="user"
                />
              </div>

              <p>
                <strong>50,000+</strong> professionals trust WealthFlow
              </p>
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="signup-right">
            <div className="signup-card">
              <div className="signup-header">
                <div className="logo">WealthFlow</div>

                <h2>Create Account</h2>

                <p>
                  Start managing your future today.
                  <span> No credit card required.</span>
                </p>
              </div>

              <form onSubmit={handleSubmit} className="signup-form">
                {error && <div className="error-box">{error}</div>}

                <div className="form-group">
                  <label>First Name</label>

                  <div className="input-box">
                    <span className="material-symbols-outlined input-icon">
                      person
                    </span>

                    <input
                      type="text"
                      name="firstName"
                      placeholder="John"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Last Name</label>

                  <div className="input-box">
                    <span className="material-symbols-outlined input-icon">
                      person
                    </span>

                    <input
                      type="text"
                      name="lastName"
                      placeholder="Doe"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Email Address</label>

                  <div className="input-box">
                    <span className="material-symbols-outlined input-icon">
                      mail
                    </span>

                    <input
                      type="email"
                      name="email"
                      placeholder="name@company.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Password</label>

                  <div className="input-box">
                    <span className="material-symbols-outlined input-icon">
                      lock
                    </span>

                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />

                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() =>
                        setShowPassword(!showPassword)
                      }
                    >
                      <span className="material-symbols-outlined">
                        {showPassword ? "visibility_off" : "visibility"}
                      </span>
                    </button>
                  </div>

                  <small>
                    Must be at least 8 characters long.
                  </small>
                </div>

                <div className="form-group">
                  <label>Confirm Password</label>

                  <div className="input-box">
                    <span className="material-symbols-outlined input-icon">
                      lock
                    </span>

                    <input
                      type={
                        showConfirmPassword ? "text" : "password"
                      }
                      name="confirmPassword"
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                    />

                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() =>
                        setShowConfirmPassword(
                          !showConfirmPassword
                        )
                      }
                    >
                      <span className="material-symbols-outlined">
                        {showConfirmPassword
                          ? "visibility_off"
                          : "visibility"}
                      </span>
                    </button>
                  </div>
                </div>

                <div className="terms-box">
                  <input type="checkbox" required />

                  <p>
                    I agree to the{" "}
                    <Link to="/terms">Terms of Service</Link> and{" "}
                    <Link to="/privacy">Privacy Policy</Link>.
                  </p>
                </div>

                <button
                  type="submit"
                  className="signup-btn"
                  disabled={loading}
                >
                  {loading
                    ? "Creating Account..."
                    : "Create Account"}
                </button>
              </form>

              <div className="login-link">
                <p>
                  Already have an account?
                  <Link to="/login"> Log In</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="signup-footer">
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
            <Link to="/cookie-settings">
              Cookie Settings
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Signup;