import React from 'react';
import './Topbar.css';

const Topbar = () => {
  return (
    <header className="topbar">
      <h2>Dashboard</h2>

      <div className="topbar-user">
        <span>Welcome Back</span>
      </div>
    </header>
  );
};

export default Topbar;