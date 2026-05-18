// PlaceholderPage.jsx

import React from 'react';
import '../styles/pages/PlaceholderPage.css';
import PublicLayout from '../layouts/PublicLayout';

const PlaceholderPage = ({ title, description }) => {
  return (
    <PublicLayout>
      <div className="placeholder-page">
        <div className="placeholder-container">

          <div className="placeholder-icon-wrapper">
            <span className="material-symbols-outlined placeholder-icon">
              construction
            </span>
          </div>

          <h1 className="placeholder-title">{title}</h1>

          <p className="placeholder-description">
            {description}
          </p>

          <div className="coming-soon-card">
            <h3>Coming Soon</h3>

            <p>
              We are currently building this section of WealthFlow.
              Please check back later for updates as we continue
              to expand our platform's capabilities.
            </p>
          </div>

        </div>
      </div>
    </PublicLayout>
  );
};

export default PlaceholderPage;