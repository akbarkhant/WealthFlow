import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/pages/Home.css';

const Home = () => {
  return (
    <div className="page">

      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-inner">
          <div className="logo">WealthFlow</div>

          <div className="nav-links">
            <Link to="/features">Features</Link>
            <Link to="/solutions">Solutions</Link>
            <Link to="/pricing">Pricing</Link>
            <Link to="/about">About</Link>
          </div>

          <div className="nav-actions">
            <Link className="login-btn" to="/login">Log In</Link>
            <Link className="signup-btn" to="/signup">Get Started</Link>
          </div>
        </div>
      </nav>

      <main className="main">

        {/* Hero */}
        <section className="hero">
          <div className="hero-grid">

            <div className="hero-content">
              <div className="badge">NEW: AI-POWERED WEALTH INSIGHTS</div>

              <h1>
                Master Your Money with <span>Intelligent</span> Flow
              </h1>

              <p>
                WealthFlow brings institutional-grade financial tracking to your pocket.
              </p>

              <div className="hero-buttons">
                <Link to="/signup" className="primary-btn">Get Started Free</Link>
                <button className="secondary-btn">Watch Demo</button>
              </div>
            </div>

            <div className="hero-image">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBxLFczX7ZEl1ZNtAZ2mip-RVvc31DZTVxkpPK9Iattc3cRHjuIzQ1ktoFtiVHeJ4kFZviOWlk3m1fZQNC3QUDZrrBn-2eMkhI7hEVIqVDG-wkAix12L9nc7JwMzLCTWRg62l_PUNse-TYRQbFJWVYPtYLF2BSflXeAjlHVtgdWSMQTjm7AfHrdx6NrtfvRGBNK_tCXUbf-n4mpU90EYJvhWw90gEOIAh8uduyvoqQcut1kOCT05W_7XWNq-i1L4d6vIOnLBxMnHbRE"
                alt="dashboard"
              />
            </div>

          </div>
        </section>

        {/* Features */}
        <section className="features">
          <h2>Financial Clarity, Redefined</h2>
          <p>Everything you need in one place.</p>

          <div className="grid">

            <div className="card large">
              <h3>Smart Budgeting</h3>
              <p>AI-driven spending analysis and forecasting.</p>
            </div>

            <div className="card">
              <h3>Bill Reminders</h3>
              <p>Never miss payments again.</p>
            </div>

            <div className="card">
              <h3>Goal Tracking</h3>
              <p>Track savings and goals visually.</p>
            </div>

            <div className="card large dark">
              <h3>Security You Can Trust</h3>
              <p>Bank-level encryption and protection.</p>
            </div>

          </div>
        </section>

        {/* CTA */}
        <section className="cta">
          <h2>Ready to master your wealth?</h2>
          <p>Join thousands of users today.</p>

          <div className="cta-buttons">
            <Link to="/signup" className="primary-btn">Get Started</Link>
            <button className="secondary-btn">Schedule Demo</button>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="footer">
        <div>WealthFlow © 2024</div>
      </footer>

    </div>
  );
};

export default Home;