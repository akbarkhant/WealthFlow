import React from 'react';
import { ArrowRight } from 'lucide-react';
import '../styles/components/Topbar.css';

export default function TopBar() {
  const handleNavigation = () => {
    window.location.href = '/upcoming-features';
  };

  return (
    <div className="uf-topbar" onClick={handleNavigation} role="button" tabIndex={0}>
      <p className="uf-topbar-text">
        ✨ New features coming soon
      </p>
      <ArrowRight size={16} className="uf-topbar-arrow" />
    </div>
  );
}