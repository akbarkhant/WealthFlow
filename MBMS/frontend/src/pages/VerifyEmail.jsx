import React from 'react';
import { Link } from 'react-router-dom';

const VerifyEmail = () => {
  return (
    <div className="bg-surface font-body-md text-on-surface selection:bg-primary-container selection:text-on-primary-container min-h-screen flex flex-col">
      {/* Top Navigation Bar (Shared Component Style) */}
      <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-lg border-b border-outline-variant/20 shadow-sm">
        <div className="flex justify-between items-center w-full px-container-padding-mobile lg:px-container-padding-desktop h-20 max-w-7xl mx-auto">
          <div className="font-headline-md text-headline-md font-extrabold text-primary tracking-tight">WealthFlow</div>
          <div className="hidden md:flex gap-8">
            <Link className="font-label-md text-label-md text-secondary hover:text-primary transition-colors cursor-pointer" to="/features">Features</Link>
            <Link className="font-label-md text-label-md text-secondary hover:text-primary transition-colors cursor-pointer" to="/solutions">Solutions</Link>
            <Link className="font-label-md text-label-md text-secondary hover:text-primary transition-colors cursor-pointer" to="/pricing">Pricing</Link>
            <Link className="font-label-md text-label-md text-secondary hover:text-primary transition-colors cursor-pointer" to="/about">About</Link>
          </div>
          <div className="flex gap-4">
            <Link className="font-label-md text-label-md px-4 py-2 text-secondary hover:bg-primary/5 transition-all rounded-lg" to="/login">Log In</Link>
          </div>
        </div>
      </header>
      
      {/* Main Content Canvas */}
      <main className="flex-grow flex items-center justify-center pt-24 pb-12 px-container-padding-mobile">
        <div className="max-w-xl w-full">
          {/* Glassmorphic Container */}
          <div className="glass-card border border-outline-variant/30 rounded-xl p-8 md:p-12 shadow-sm text-center relative overflow-hidden">
            {/* Background Accent Circle */}
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-primary/5 rounded-full blur-3xl"></div>
            {/* Illustration Section */}
            <div className="relative mb-8 flex justify-center">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-primary/10 flex items-center justify-center relative">
                <span className="material-symbols-outlined text-primary text-[64px] md:text-[80px]">mail</span>
                {/* Notification Badge */}
                <div className="absolute top-2 right-2 w-8 h-8 md:w-10 md:h-10 bg-primary-container text-on-primary-container rounded-full flex items-center justify-center shadow-lg border-2 border-surface">
                  <span className="material-symbols-outlined text-[18px] md:text-[22px]" style={{fontVariationSettings: "'FILL' 1"}}>check_circle</span>
                </div>
              </div>
            </div>
            {/* Text Content */}
            <h1 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface mb-4 tracking-tight">Check your inbox</h1>
            <p className="font-body-lg text-body-lg text-on-secondary-container mb-10 max-w-md mx-auto">
              We've sent a verification link to <span className="font-bold text-on-surface">alex.finance@example.com</span>. Please click the link to confirm your account and start your journey.
            </p>
            {/* Actions Grid */}
            <div className="grid grid-cols-1 gap-4">
              <button className="w-full bg-primary text-on-primary h-14 rounded-lg font-label-md text-label-md hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-md active:scale-95 duration-100">
                <span className="material-symbols-outlined">open_in_new</span>
                Open Email App
              </button>
              <div className="pt-6 border-t border-outline-variant/30 mt-4">
                <p className="font-body-sm text-body-sm text-secondary mb-4">Didn't receive the email?</p>
                <button className="font-label-md text-label-md text-primary hover:bg-primary/5 px-6 py-2 rounded-full transition-all border border-primary/20">
                  Resend Email
                </button>
              </div>
            </div>
            {/* Assistance Footer */}
            <div className="mt-8">
              <p className="font-body-sm text-body-sm text-on-secondary-container">
                Need help? <Link className="text-primary font-semibold hover:underline" to="/support">Contact Support</Link>
              </p>
            </div>
          </div>
          
          {/* Contextual Image/Visual (Bento style hint) */}
          <div className="mt-8 grid grid-cols-2 gap-4 md:gap-6">
            <div className="bg-surface-container-low rounded-xl p-4 border border-outline-variant/20 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-tertiary-container/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-tertiary">security</span>
              </div>
              <div className="flex flex-col">
                <span className="font-label-sm text-label-sm text-secondary">Secure</span>
                <span className="font-label-md text-label-md font-bold">256-bit Encryption</span>
              </div>
            </div>
            <div className="bg-surface-container-low rounded-xl p-4 border border-outline-variant/20 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary-container/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary">speed</span>
              </div>
              <div className="flex flex-col">
                <span className="font-label-sm text-label-sm text-secondary">Fast</span>
                <span className="font-label-md text-label-md font-bold">Instant Setup</span>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Footer (Shared Component Style) */}
      <footer className="w-full py-12 bg-surface-container-low border-t border-outline-variant/30 mt-12">
        <div className="flex flex-col md:flex-row justify-between items-center w-full px-container-padding-mobile lg:px-container-padding-desktop gap-8 max-w-7xl mx-auto">
          <div className="flex flex-col items-center md:items-start gap-2">
            <div className="font-headline-sm text-headline-sm font-bold text-primary">WealthFlow</div>
            <p className="font-body-sm text-body-sm text-on-secondary-container">© 2024 WealthFlow Financial Technologies. All rights reserved.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            <Link className="font-label-sm text-label-sm text-on-secondary-container hover:text-primary hover:underline transition-all" to="/privacy">Privacy Policy</Link>
            <Link className="font-label-sm text-label-sm text-on-secondary-container hover:text-primary hover:underline transition-all" to="/terms">Terms of Service</Link>
            <Link className="font-label-sm text-label-sm text-on-secondary-container hover:text-primary hover:underline transition-all" to="/security">Security</Link>
            <Link className="font-label-sm text-label-sm text-on-secondary-container hover:text-primary hover:underline transition-all" to="/cookie-settings">Cookie Settings</Link>
          </div>
        </div>
      </footer>
      
      {/* Decorative Bottom Gradient */}
      <div className="fixed bottom-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-tertiary to-primary-container opacity-20"></div>
    </div>
  );
};

export default VerifyEmail;
