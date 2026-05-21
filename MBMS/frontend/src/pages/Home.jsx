import React from "react";
import "../styles/pages/Home.css";

import {
  Wallet,
  Bell,
  Target,
  CheckCircle2,
  ArrowRight,
  PlayCircle,
  Sparkles,
} from "lucide-react";

const Home = () => {
  return (
    <div className="landing-page">
      {/* Navbar */}
      <nav className="navbar">
        <div className="container nav-container">
          <h2 className="logo">WealthFlow</h2>

          <div className="nav-links">
            <a href="/">Features</a>
            <a href="/">Solutions</a>
            <a href="/">Pricing</a>
            <a href="/">About</a>
          </div>

          <div className="nav-buttons">
            <button className="login-btn">Log In</button>

            <button className="primary-btn">
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="container hero-grid">
          {/* Left */}
          <div className="hero-content">
            <div className="hero-badge">
              <Sparkles size={16} />
              NEW: AI-POWERED WEALTH INSIGHTS
            </div>

            <h1>
              Master Your Money with{" "}
              <span>Intelligent</span> Flow
            </h1>

            <p>
              WealthFlow brings institutional-grade financial tracking to your
              pocket. Automated budgeting, real-time goal monitoring, and smart
              bill reminders designed for the modern professional.
            </p>

            <div className="hero-buttons">
              <button className="primary-btn large-btn">
                Get Started Free
                <ArrowRight className="btn-icon" size={16} />
              </button>

              <button className="secondary-btn large-btn">
                <PlayCircle className="btn-icon" size={18} />
                Watch Demo
              </button>
            </div>

            <div className="hero-users">
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
                <strong>50,000+</strong> users tracking $2B+ in assets
              </p>
            </div>
          </div>

          {/* Right */}
          <div className="hero-image">
            <div className="dashboard-card">
              <img
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71"
                alt="dashboard"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features-section">
        <div className="container">
          <div className="section-heading">
            <h2>Financial Clarity, Redefined</h2>

            <p>
              Everything you need to manage your personal or business finances
              in one high-performance interface.
            </p>
          </div>

          <div className="features-grid">
            {/* Smart Budgeting */}
            <div className="feature-card large-card">
              <div className="feature-icon">
                <Wallet size={24} />
              </div>

              <h3>Smart Budgeting</h3>

              <p>
                Automatically categorize transactions and identify spending
                patterns using AI forecasting.
              </p>

              <div className="progress-box">
                <div className="progress-header">
                  <span>Dining & Groceries</span>
                  <span>85%</span>
                </div>

                <div className="progress-bar">
                  <div className="progress-fill"></div>
                </div>

                <div className="progress-footer">
                  <span>Spent: $850</span>
                  <span>Remaining: $150</span>
                </div>
              </div>
            </div>

            {/* Bill Reminders */}
            <div className="feature-card">
              <div className="feature-icon blue-icon">
                <Bell size={24} />
              </div>

              <h3>Bill Reminders</h3>

              <p>
                Never miss a payment again with predictive due alerts.
              </p>

              <div className="bill-card">
                <div>
                  <h4>Electric Bill</h4>
                  <p>Due in 2 days</p>
                </div>

                <span>$142</span>
              </div>
            </div>

            {/* Goal Tracking */}
            <div className="feature-card">
              <div className="feature-icon green-icon">
                <Target size={24} />
              </div>

              <h3>Goal Tracking</h3>

              <p>
                Visualize your dreams and track savings progress with ease.
              </p>

              <div className="goal-progress">
                <div className="circle">
                  <span>72%</span>
                </div>

                <div>
                  <h4>House Downpayment</h4>
                  <p>$54k of $75k</p>
                </div>
              </div>
            </div>

            {/* Security */}
            <div className="security-card">
              <div className="security-content">
                <h3>Security You Can Trust</h3>

                <p>
                  AES-256 bank-level encryption and 2FA keep your data safe and
                  secure.
                </p>

                <ul>
                  <li>
                    <CheckCircle2
                      className="list-icon"
                      size={18}
                    />
                    Read-only access protocol
                  </li>

                  <li>
                    <CheckCircle2
                      className="list-icon"
                      size={18}
                    />
                    Biometric authentication
                  </li>
                </ul>
              </div>

              <img
                src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3"
                alt="security"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonial-section">
        <div className="container">
          <div className="section-heading">
            <h2>Loved by Thousands</h2>

            <p>4.9/5 average rating from our users.</p>
          </div>

          <div className="testimonial-grid">
            <div className="testimonial-card">
              <p>
                “WealthFlow changed the way I look at monthly expenses.”
              </p>

              <div className="testimonial-user">
                <img
                  src="https://i.pravatar.cc/100?img=4"
                  alt="user"
                />

                <div>
                  <h4>James Richardson</h4>
                  <span>Product Manager</span>
                </div>
              </div>
            </div>

            <div className="testimonial-card">
              <p>
                “Goal tracking helped me save for my first home ahead of time.”
              </p>

              <div className="testimonial-user">
                <img
                  src="https://i.pravatar.cc/100?img=5"
                  alt="user"
                />

                <div>
                  <h4>Sarah Lindholm</h4>
                  <span>Creative Director</span>
                </div>
              </div>
            </div>

            <div className="testimonial-card">
              <p>
                “Cleanest UI I've ever used for financial management.”
              </p>

              <div className="testimonial-user">
                <img
                  src="https://i.pravatar.cc/100?img=6"
                  alt="user"
                />

                <div>
                  <h4>David Kross</h4>
                  <span>Software Engineer</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-box">
            <h2>Ready to master your wealth?</h2>

            <p>
              Join over 50,000 users transforming their financial lives with
              WealthFlow.
            </p>

            <div className="cta-buttons">
              <button className="white-btn">
                Get Started Now
              </button>

              <button className="outline-btn">
                Schedule a Demo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container footer-container">
          <div>
            <h3>WealthFlow</h3>

            <p>
              Empowering professionals with intelligent financial tools.
            </p>
          </div>

          <div className="footer-links">
            <a href="/">Privacy</a>
            <a href="/">Terms</a>
            <a href="/">Security</a>
            <a href="/">Cookies</a>
          </div>

          <p>© 2026 WealthFlow</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;