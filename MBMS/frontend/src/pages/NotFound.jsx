import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -right-24 w-64 h-64 bg-tertiary-container/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-gradient-to-t from-surface-container-low to-transparent opacity-50"></div>
      </div>
      
      {/* Main Content Canvas */}
      <main className="relative z-10 w-full max-w-7xl mx-auto px-container-padding-mobile lg:px-container-padding-desktop flex flex-col items-center text-center mt-12">
        {/* Brand Header */}
        <div className="mb-12">
          <span className="font-headline-md text-headline-md font-bold text-primary tracking-tight">WealthFlow</span>
        </div>
        
        {/* 404 Visual Content Section */}
        <div className="relative w-full max-w-2xl mx-auto mb-12">
          {/* Glassmorphic Card Container */}
          <div className="glass-card border border-outline-variant/30 rounded-xl p-8 md:p-16 shadow-sm flex flex-col items-center">
            {/* Financial Themed Illustration */}
            <div className="relative mb-10">
              <div className="w-64 h-64 md:w-80 md:h-80 bg-surface-container rounded-full flex items-center justify-center overflow-hidden border-8 border-surface shadow-inner">
                <img 
                  alt="Empty wallet 404 concept" 
                  className="w-full h-full object-cover grayscale opacity-80" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBu-zikhMxsOcndpzKXXWntErSaykDP8qPEa_TEwdglDb2K-1tN8CbFqQMhQmnlies-sSnHon6_xQL_MeOGqdSr0BdAbqqFOfrhsyJcXRFQazCwtlUE4sfT9UdbtmOGMeKg-iisel1pQIhk2KTaqg7ED2P12X9Ap_DBO50Pj-t_5y9T5vnXymBLUINr-rWprLRxOJVNQCbq6ESGNTLGej3z3oPgOoe1awVZSiidGzRC4A4pOtH3y-4J1lkZdN3e9s_EYOcl_u0_8jSK"
                />
              </div>
              {/* Floating Icons */}
              <div className="absolute -top-4 -right-4 bg-white p-3 rounded-xl shadow-lg border border-outline-variant/20 animate-bounce">
                <span className="material-symbols-outlined text-primary text-3xl" style={{fontVariationSettings: "'FILL' 1"}}>account_balance_wallet</span>
              </div>
              <div className="absolute bottom-4 -left-6 bg-white p-3 rounded-xl shadow-lg border border-outline-variant/20">
                <span className="material-symbols-outlined text-error text-3xl" style={{fontVariationSettings: "'FILL' 1"}}>search_off</span>
              </div>
            </div>
            
            {/* Error Message Text */}
            <div className="space-y-4">
              <h1 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface">
                Assets Not Found
              </h1>
              <p className="font-body-lg text-body-lg text-secondary max-w-md mx-auto">
                It looks like this page has been liquidated from our servers. Even the best diversified portfolios have missing links sometimes.
              </p>
            </div>
            
            {/* CTA Actions */}
            <div className="mt-12 flex flex-col md:flex-row gap-4 w-full md:w-auto">
              <Link className="group bg-primary text-on-primary px-8 py-4 rounded-lg font-label-md text-label-md flex items-center justify-center gap-2 hover:bg-primary/90 transition-all duration-200 active:scale-95 shadow-md shadow-primary/20" to="/">
                <span className="material-symbols-outlined">home</span>
                Back to Home
              </Link>
              <button className="bg-surface-container-highest text-on-surface px-8 py-4 rounded-lg font-label-md text-label-md flex items-center justify-center gap-2 hover:bg-surface-container-high transition-all duration-200 active:scale-95 border border-outline-variant/20">
                <span className="material-symbols-outlined">support_agent</span>
                Contact Support
              </button>
            </div>
          </div>
        </div>
        
        {/* Secondary Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter w-full max-w-4xl text-left">
          <div className="p-6 rounded-xl bg-surface-container-low/50 border border-outline-variant/10">
            <span className="material-symbols-outlined text-primary mb-3 block">monitoring</span>
            <h3 className="font-headline-sm text-headline-sm text-on-surface mb-2">Check Markets</h3>
            <p className="font-body-sm text-body-sm text-secondary">Keep an eye on your real-time investment performance while we find the way.</p>
          </div>
          <div className="p-6 rounded-xl bg-surface-container-low/50 border border-outline-variant/10">
            <span className="material-symbols-outlined text-primary mb-3 block">account_tree</span>
            <h3 className="font-headline-sm text-headline-sm text-on-surface mb-2">Sitemap</h3>
            <p className="font-body-sm text-body-sm text-secondary">Explore our full organizational structure to find exactly what you need.</p>
          </div>
          <div className="p-6 rounded-xl bg-surface-container-low/50 border border-outline-variant/10">
            <span className="material-symbols-outlined text-primary mb-3 block">security</span>
            <h3 className="font-headline-sm text-headline-sm text-on-surface mb-2">Security Hub</h3>
            <p className="font-body-sm text-body-sm text-secondary">Your data remains protected even when you stray off the beaten path.</p>
          </div>
        </div>
        
        {/* Error Code Footnote */}
        <div className="mt-16 opacity-40">
          <p className="font-label-sm text-label-sm uppercase tracking-widest text-secondary">Error Reference: WEALTH_404_NULL_POINTER</p>
        </div>
      </main>
      
      {/* Simple Footer for 404 Context */}
      <footer className="mt-auto w-full py-8 border-t border-outline-variant/10 text-center">
        <p className="font-body-sm text-body-sm text-secondary-fixed-dim">
          © 2024 WealthFlow Financial Technologies. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default NotFound;
