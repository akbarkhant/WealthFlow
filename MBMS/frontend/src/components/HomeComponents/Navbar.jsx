import React, { useState } from 'react';
import {
  Menu,
  X,
  ChevronDown,
  Wallet,
  ShieldCheck,
  BarChart3,
  CreditCard,
  Landmark,
  PieChart,
  Building2,
  TrendingUp
} from 'lucide-react';

import '../../styles/components/Navbar.css';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [featuresOpen, setFeaturesOpen] = useState(false);
  const [solutionsOpen, setSolutionsOpen] = useState(false);

  return (
    <nav className="navbar-sticky">
      <div className="navbar-container">

        {/* Logo */}
        <div className="navbar-brand">
          <a href="/" className="brand-logo">
            WealthFlow
          </a>
        </div>

        {/* Navigation Links */}
        <div className="nav-links"> 
        <ul className={`navbar-links ${isOpen ? 'active' : ''}`}>

          {/* Features Dropdown */}
          <li
            className="dropdown"
            onMouseEnter={() => setFeaturesOpen(true)}
            onMouseLeave={() => setFeaturesOpen(false)}
          >
            <button className="dropdown-btn">
              Features
              <ChevronDown size={18} />
            </button>

            <div className={`dropdown-menu ${featuresOpen ? 'show' : ''}`}>
              <a href="/features/budgeting">
                <Wallet size={18} />
                Budget Management
              </a>

              <a href="/features/security">
                <ShieldCheck size={18} />
                Advanced Security
              </a>

              <a href="/features/analytics">
                <BarChart3 size={18} />
                Smart Analytics
              </a>

              <a href="/features/payments">
                <CreditCard size={18} />
                Payment Tracking
              </a>
            </div>
          </li>

          {/* Solutions Dropdown */}
          <li
            className="dropdown"
            onMouseEnter={() => setSolutionsOpen(true)}
            onMouseLeave={() => setSolutionsOpen(false)}
          >
            <button className="dropdown-btn">
              Solutions
              <ChevronDown size={18} />
            </button>

            <div className={`dropdown-menu ${solutionsOpen ? 'show' : ''}`}>
              <a href="/solutions/personal">
                <PieChart size={18} />
                Personal Finance
              </a>

              <a href="/solutions/business">
                <Building2 size={18} />
                Business Finance
              </a>

              <a href="/solutions/investments">
                <TrendingUp size={18} />
                Investment Planning
              </a>

              <a href="/solutions/banking">
                <Landmark size={18} />
                Banking Solutions
              </a>
            </div>
          </li>

          <li>
            <a href="#pricing" onClick={() => setIsOpen(false)}>
              Pricing
            </a>
          </li>

          <li>
            <a href="/about" onClick={() => setIsOpen(false)}>
              About
            </a>
          </li>
        </ul>
        </div>

        {/* Action Buttons */}
        <div className={`navbar-actions ${isOpen ? 'active' : ''}`}>
          <a href="/login" className="btn-secondary">
            Log In
          </a>

          <a href="/signup" className="btn-primary">
            Get Started
          </a>
        </div>

        {/* Mobile Toggle */}
        <button
          className="navbar-toggle"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle navigation"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
    </nav>
  );
}