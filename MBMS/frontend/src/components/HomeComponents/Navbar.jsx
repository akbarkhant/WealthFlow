import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import '../../styles/components/Navbar.css';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="navbar-sticky">
      <div className="navbar-container">
        <div className="navbar-brand">
          <span className="brand-logo">WealthFlow</span>
        </div>

        <ul className={`navbar-links ${isOpen ? 'active' : ''}`}>
          <li><a href="#features" onClick={() => setIsOpen(false)}>Features</a></li>
          <li><a href="#solutions" onClick={() => setIsOpen(false)}>Solutions</a></li>
          <li><a href="#pricing" onClick={() => setIsOpen(false)}>Pricing</a></li>
          <li><a href="#about" onClick={() => setIsOpen(false)}>About</a></li>
        </ul>

        <div className={`navbar-actions ${isOpen ? 'active' : ''}`}>
          <button className="btn-secondary">Log In</button>
          <button className="btn-primary">Get Started</button>
        </div>

        <button className="navbar-toggle" onClick={() => setIsOpen(!isOpen)} aria-label="Toggle navigation">
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
    </nav>
  );
}