// NotFound.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/pages/NotFound.css';

const NotFound = () => {
  return (
    <div className="notfound-page">

      {/* Background Effects */}
      <div className="background-effects">
        <div className="bg-circle bg-circle-1"></div>
        <div className="bg-circle bg-circle-2"></div>
        <div className="bg-gradient"></div>
      </div>

      {/* Main Content */}
      <main className="notfound-main">

        {/* Brand */}
        <div className="brand-logo">
          WealthFlow
        </div>

        {/* Card */}
        <div className="notfound-card">

          {/* Image Section */}
          <div className="image-wrapper">

            <div className="image-circle">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBu-zikhMxsOcndpzKXXWntErSaykDP8qPEa_TEwdglDb2K-1tN8CbFqQMhQmnlies-sSnHon6_xQL_MeOGqdSr0BdAbqqFOfrhsyJcXRFQazCwtlUE4sfT9UdbtmOGMeKg-iisel1pQIhk2KTaqg7ED2P12X9Ap_DBO50Pj-t_5y9T5vnXymBLUINr-rWprLRxOJVNQCbq6ESGNTLGej3z3oPgOoe1awVZSiidGzRC4A4pOtH3y-4J1lkZdN3e9s_EYOcl_u0_8jSK"
                alt="404"
              />
            </div>

            {/* Floating Icons */}
            <div className="floating-icon wallet-icon">
              <span className="material-symbols-outlined">
                account_balance_wallet
              </span>
            </div>

            <div className="floating-icon search-icon">
              <span className="material-symbols-outlined">
                search_off
              </span>
            </div>

          </div>

          {/* Text */}
          <div className="notfound-text">
            <h1>Assets Not Found</h1>

            <p>
              It looks like this page has been liquidated from our servers.
              Even the best diversified portfolios have missing links sometimes.
            </p>
          </div>

          {/* Buttons */}
          <div className="button-group">

            <Link to="/" className="primary-btn">
              <span className="material-symbols-outlined">home</span>
              Back to Home
            </Link>

            <button className="secondary-btn">
              <span className="material-symbols-outlined">
                support_agent
              </span>
              Contact Support
            </button>

          </div>

        </div>

        {/* Info Cards */}
        <div className="info-grid">

          <div className="info-card">
            <span className="material-symbols-outlined icon">
              monitoring
            </span>

            <h3>Check Markets</h3>

            <p>
              Keep an eye on your real-time investment performance while we
              find the way.
            </p>
          </div>

          <div className="info-card">
            <span className="material-symbols-outlined icon">
              account_tree
            </span>

            <h3>Sitemap</h3>

            <p>
              Explore our full organizational structure to find exactly what
              you need.
            </p>
          </div>

          <div className="info-card">
            <span className="material-symbols-outlined icon">
              security
            </span>

            <h3>Security Hub</h3>

            <p>
              Your data remains protected even when you stray off the beaten
              path.
            </p>
          </div>

        </div>

        {/* Footer Note */}
        <div className="error-reference">
          Error Reference: WEALTH_404_NULL_POINTER
        </div>

      </main>

      {/* Footer */}
      <footer className="notfound-footer">
        © 2024 WealthFlow Financial Technologies. All rights reserved.
      </footer>

    </div>
  );
};

export default NotFound;