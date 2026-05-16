import React from 'react';
import { Link } from 'react-router-dom';

const PublicLayout = ({ children }) => {
  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col">
      {/* TopNavBar */}
      <nav className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-lg border-b border-outline-variant/20 shadow-sm">
        <div className="flex justify-between items-center w-full px-container-padding-mobile lg:px-container-padding-desktop h-20 max-w-7xl mx-auto">
          <Link to="/" className="font-headline-md text-headline-md font-bold text-primary tracking-tight">WealthFlow</Link>
          <div className="hidden lg:flex items-center gap-8">
            <Link className="font-label-md text-label-md text-secondary hover:text-primary transition-colors" to="/features">Features</Link>
            <Link className="font-label-md text-label-md text-secondary hover:text-primary transition-colors" to="/solutions">Solutions</Link>
            <Link className="font-label-md text-label-md text-secondary hover:text-primary transition-colors" to="/pricing">Pricing</Link>
            <Link className="font-label-md text-label-md text-secondary hover:text-primary transition-colors" to="/about">About</Link>
          </div>
          <div className="flex items-center gap-4">
            <Link className="hidden sm:block font-label-md text-label-md text-secondary hover:text-primary transition-all px-4 py-2" to="/login">Log In</Link>
            <Link className="bg-primary hover:bg-primary/90 text-on-primary font-label-md text-label-md px-6 py-3 rounded-xl transition-all active:scale-95" to="/signup">Get Started</Link>
          </div>
        </div>
      </nav>
      
      <main className="pt-20 flex-grow flex flex-col">
        {children}
      </main>
      
      {/* Footer */}
      <footer className="bg-surface-container-low border-t border-outline-variant/30 w-full py-12 mt-auto">
        <div className="flex flex-col md:flex-row justify-between items-center w-full px-container-padding-mobile lg:px-container-padding-desktop gap-8 max-w-7xl mx-auto">
          <div className="space-y-4 text-center md:text-left">
            <div className="font-headline-sm text-headline-sm font-bold text-primary">WealthFlow</div>
            <p className="font-body-sm text-body-sm text-secondary max-w-xs">Empowering professionals with intelligent financial tools for a better tomorrow.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            <Link className="font-label-sm text-label-sm text-on-secondary-container hover:text-primary hover:underline transition-all" to="/privacy">Privacy Policy</Link>
            <Link className="font-label-sm text-label-sm text-on-secondary-container hover:text-primary hover:underline transition-all" to="/terms">Terms of Service</Link>
            <Link className="font-label-sm text-label-sm text-on-secondary-container hover:text-primary hover:underline transition-all" to="/security">Security</Link>
            <Link className="font-label-sm text-label-sm text-on-secondary-container hover:text-primary hover:underline transition-all" to="/cookie-settings">Cookie Settings</Link>
          </div>
          <div className="font-label-sm text-label-sm text-secondary">
            © 2024 WealthFlow Financial Technologies. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
