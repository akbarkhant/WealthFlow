import React from 'react';
import { Link } from 'react-router-dom';

const ForgotPassword = () => {
  return (
    <div className="bg-background min-h-screen flex flex-col">
      {/* TopNavBar Strategy: Hidden on Focused/Transactional Pages per Shell Visibility Rules */}
      <main className="flex-grow flex items-center justify-center px-container-padding-mobile lg:px-container-padding-desktop relative overflow-hidden">
        {/* Abstract Background Elements for Premium Feel */}
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-primary-container/10 rounded-full blur-[100px] z-0"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-tertiary-container/10 rounded-full blur-[80px] z-0"></div>
        <div className="max-w-md w-full z-10">
          {/* Branding Header */}
          <div className="text-center mb-base gap-2 flex flex-col items-center">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-primary/20">
              <span className="material-symbols-outlined text-on-primary" style={{fontVariationSettings: "'FILL' 1"}}>account_balance_wallet</span>
            </div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">WealthFlow</h1>
          </div>
          {/* Main Auth Card */}
          <div className="glass-card border border-outline-variant/30 rounded-xl p-8 shadow-xl">
            <div className="mb-8">
              <h2 className="font-headline-md text-headline-md text-on-surface mb-2">Forgot Password?</h2>
              <p className="font-body-md text-body-md text-on-secondary-container">Enter your email address and we'll send you a link to reset your password and get back to your finances.</p>
            </div>
            <form className="space-y-6">
              {/* Email Input */}
              <div className="space-y-2">
                <label className="font-label-md text-label-md text-on-surface-variant block ml-1" htmlFor="email">Email Address</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-on-surface-variant text-body-md">mail</span>
                  </div>
                  <input className="w-full pl-11 pr-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all duration-200" id="email" name="email" placeholder="name@company.com" required type="email"/>
                </div>
              </div>
              {/* Action Button */}
              <button className="w-full py-4 px-6 bg-primary text-on-primary font-label-md text-label-md rounded-lg shadow-lg shadow-primary/20 hover:bg-primary-fixed-dim hover:text-on-primary-fixed transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2" type="submit">
                <span>Send Reset Link</span>
                <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
              </button>
            </form>
            {/* Navigation Back */}
            <div className="mt-8 pt-6 border-t border-outline-variant/30 text-center">
              <Link className="inline-flex items-center gap-2 font-label-md text-label-md text-secondary hover:text-primary transition-colors group" to="/login">
                <span className="material-symbols-outlined text-[18px] group-hover:-translate-x-1 transition-transform">arrow_back</span>
                <span>Back to Login</span>
              </Link>
            </div>
          </div>
          {/* Support Text */}
          <div className="mt-8 text-center">
            <p className="font-body-sm text-body-sm text-on-secondary-container">
              Need help? <Link className="text-primary font-semibold hover:underline" to="/support">Contact WealthFlow Support</Link>
            </p>
          </div>
        </div>
      </main>
      {/* Footer: Integrated minimally for the transactional context */}
      <footer className="w-full py-8 border-t border-outline-variant/20">
        <div className="max-w-7xl mx-auto px-container-padding-mobile lg:px-container-padding-desktop flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-label-sm text-label-sm text-on-secondary-container">
            © 2024 WealthFlow Financial Technologies. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link className="font-label-sm text-label-sm text-on-secondary-container hover:text-primary transition-colors" to="/privacy">Privacy Policy</Link>
            <Link className="font-label-sm text-label-sm text-on-secondary-container hover:text-primary transition-colors" to="/terms">Terms of Service</Link>
            <Link className="font-label-sm text-label-sm text-on-secondary-container hover:text-primary transition-colors" to="/security">Security</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ForgotPassword;
