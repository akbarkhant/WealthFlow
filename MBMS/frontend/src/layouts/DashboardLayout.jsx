// src/layouts/DashboardLayout.jsx

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './DashboardLayout.css';

const DashboardLayout = ({ children }) => {
  const location = useLocation();

  const navItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: 'dashboard',
    },
    {
      name: 'Transactions',
      path: '/transactions',
      icon: 'receipt_long',
    },
    {
      name: 'Savings',
      path: '/savings',
      icon: 'savings',
    },
    {
      name: 'Bills',
      path: '/bills',
      icon: 'calendar_month',
    },
  ];

  const user = {
    name: 'Akbar Khan',
    membership: 'Premium Member',
    image:
      'https://ui-avatars.com/api/?name=Akbar+Khan&background=2563eb&color=ffffff',
  };

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1>WealthFlow</h1>
          <p>Premium Finance System</p>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.name}
                to={item.path}
                className={`nav-link ${isActive ? 'active' : ''}`}
              >
                <span className="material-symbols-outlined">
                  {item.icon}
                </span>

                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <Link to="/settings" className="nav-link footer-link">
            <span className="material-symbols-outlined">settings</span>
            <span>Settings</span>
          </Link>

          <Link to="/support" className="nav-link footer-link">
            <span className="material-symbols-outlined">help</span>
            <span>Support</span>
          </Link>

          <div className="user-profile">
            <img src={user.image} alt={user.name} />

            <div>
              <h4>{user.name}</h4>
              <p>{user.membership}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Section */}
      <div className="main-section">
        {/* Topbar */}
        <header className="topbar">
          <div className="search-box">
            <span className="material-symbols-outlined">search</span>

            <input
              type="text"
              placeholder="Search transactions..."
            />
          </div>

          <div className="topbar-actions">
            <button className="icon-btn">
              <span className="material-symbols-outlined">
                notifications
              </span>
            </button>

            <button className="icon-btn">
              <span className="material-symbols-outlined">
                dark_mode
              </span>
            </button>

            <button className="add-btn">
              <span className="material-symbols-outlined">add</span>
              Add Transaction
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="dashboard-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;


