import React from 'react';
import '../styles/components/LoadingBar.css';

const LoadingBar = ({ message = "Loading your dashboard..." }) => {
  return (
    <div className="loading-container">
      <div className="loading-card">
        {/* Spinner Visual */}
        <div className="spinner-wrapper">
          <div className="spinner-outer"></div>
          <div className="spinner-inner"></div>
        </div>

        {/* Loading Content */}
        <div className="loading-content">
          <h2 className="loading-text">{message}</h2>
          <p className="loading-subtext">Please wait while we fetch the latest data.</p>
        </div>

        {/* Subtle Progress Bar Decoration */}
        <div className="loading-bar-track">
          <div className="loading-bar-fill"></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingBar;