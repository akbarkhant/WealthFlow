// src/layouts/DashboardLayout.jsx

import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import './DashboardLayout.css';

const DashboardLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  // Theme state
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  // Mobile sidebar state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.warn('Backend logout failed:', err);
    }
    logout();
    navigate('/login');
  };

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

  const displayName = user?.name || user?.email?.split('@')[0] || 'User';
  const displayEmail = user?.email || 'Premium Member';
  const avatarUrl = user?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=006c49&color=ffffff`;

  return (
    <div className={`dashboard-layout ${isSidebarOpen ? 'sidebar-open' : ''}`}>
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <div>
              <h1>WealthFlow</h1>
              <p>Premium Finance System</p>
            </div>
            <button 
              className="close-sidebar-btn" 
              onClick={() => setIsSidebarOpen(false)}
              style={{ display: 'none' }}
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.name}
                to={item.path}
                className={`nav-link ${isActive ? 'active' : ''}`}
                onClick={() => setIsSidebarOpen(false)}
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
          <Link to="/settings" className="nav-link footer-link" onClick={() => setIsSidebarOpen(false)}>
            <span className="material-symbols-outlined">settings</span>
            <span>Settings</span>
          </Link>

          <button 
            onClick={handleLogout} 
            className="nav-link footer-link" 
            style={{ 
              width: '100%', 
              border: 'none', 
              background: 'transparent', 
              textAlign: 'left', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              color: '#ba1a1a'
            }}
          >
            <span className="material-symbols-outlined">logout</span>
            <span>Logout</span>
          </button>

          <div className="user-profile">
            <img src={avatarUrl} alt={displayName} />
            <div>
              <h4 style={{ textTransform: 'capitalize' }}>{displayName}</h4>
              <p style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '140px' }}>{displayEmail}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Section */}
      <div className="main-section">
        {/* Topbar */}
        <header className="topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button 
              className="menu-btn" 
              onClick={() => setIsSidebarOpen(true)}
              style={{ display: 'none' }}
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
            <div className="search-box">
              <span className="material-symbols-outlined">search</span>
              <input
                type="text"
                placeholder="Search transactions..."
              />
            </div>
          </div>

          <div className="topbar-actions">
            <button className="icon-btn">
              <span className="material-symbols-outlined">
                notifications
              </span>
            </button>

            <button className="icon-btn" onClick={toggleTheme}>
              <span className="material-symbols-outlined">
                {theme === 'light' ? 'dark_mode' : 'light_mode'}
              </span>
            </button>

            <button className="add-btn" onClick={() => navigate('/transactions')}>
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
