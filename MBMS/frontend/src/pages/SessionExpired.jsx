import React from 'react';
import { Link } from 'react-router-dom';

const SessionExpired = () => {
  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col">
      {/* Header (Suppressed Nav, Only Brand) */}
      <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-lg border-b border-outline-variant/20 h-20 flex items-center">
        <div className="flex justify-between items-center w-full px-container-padding-mobile lg:px-container-padding-desktop max-w-7xl mx-auto">
          <span className="font-headline-md text-headline-md font-bold text-primary tracking-tight">WealthFlow</span>
        </div>
      </header>
      
      {/* Main Content (Transactional Focus) */}
      <main className="flex-grow flex items-center justify-center px-container-padding-mobile py-section-gap">
        <div className="max-w-md w-full text-center space-y-8 z-10">
          {/* Graphic Element */}
          <div className="relative inline-block">
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-primary text-[48px]" style={{fontVariationSettings: "'wght' 300"}}>lock_clock</span>
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-surface-container-highest rounded-full flex items-center justify-center border-4 border-surface">
              <span className="material-symbols-outlined text-on-surface-variant text-[16px]">security</span>
            </div>
          </div>
          
          {/* Notification Text */}
          <div className="space-y-4">
            <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">Your session has expired</h1>
            <p className="font-body-md text-body-md text-on-secondary-container max-w-[320px] mx-auto leading-relaxed">
              For your financial security, we've logged you out after a period of inactivity. Please log in again to continue managing your wealth.
            </p>
          </div>
          
          {/* Glassmorphic Action Card */}
          <div className="glass-card p-gutter rounded-xl shadow-sm space-y-4 border border-slate-200/80">
            <Link className="w-full bg-primary text-on-primary py-4 px-6 rounded-lg font-label-md text-label-md hover:bg-primary/90 transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 group" to="/login">
              Log In Again
              <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </Link>
            <Link className="w-full py-3 px-6 rounded-lg font-label-md text-label-md text-secondary hover:bg-primary/5 transition-all inline-block" to="/">
              Return to Homepage
            </Link>
          </div>
          
          {/* Institutional Trust Indicator */}
          <div className="pt-base flex items-center justify-center gap-2 text-on-surface-variant/60">
            <span className="material-symbols-outlined text-[14px]">encrypted</span>
            <span className="font-label-sm text-label-sm uppercase tracking-widest">Bank-Grade Encryption Enabled</span>
          </div>
        </div>
      </main>
      
      {/* Visual Background Element (Subtle Gradient) */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[0%] right-[0%] w-[30%] h-[30%] bg-tertiary-container/10 rounded-full blur-[100px]"></div>
      </div>
      
      {/* Footer (Simplified for Transactional Page) */}
      <footer className="w-full py-12 bg-surface-container-low border-t border-outline-variant/30 z-10">
        <div className="flex flex-col md:flex-row justify-between items-center w-full px-container-padding-mobile lg:px-container-padding-desktop max-w-7xl mx-auto gap-8">
          <div className="space-y-2 text-center md:text-left">
            <span className="font-headline-sm text-headline-sm font-bold text-primary">WealthFlow</span>
            <p className="font-body-sm text-body-sm text-on-secondary-container">© 2024 WealthFlow Financial Technologies. All rights reserved.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            <Link className="font-label-sm text-label-sm text-on-secondary-container hover:text-primary transition-all" to="/privacy">Privacy Policy</Link>
            <Link className="font-label-sm text-label-sm text-on-secondary-container hover:text-primary transition-all" to="/terms">Terms of Service</Link>
            <Link className="font-label-sm text-label-sm text-on-secondary-container hover:text-primary transition-all" to="/security">Security</Link>
            <Link className="font-label-sm text-label-sm text-on-secondary-container hover:text-primary transition-all" to="/support">Contact Support</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SessionExpired;
