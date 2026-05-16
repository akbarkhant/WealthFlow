import React from 'react';
import { Link } from 'react-router-dom';

const ResetPassword = () => {
  return (
    <div className="bg-background text-on-background font-body-md min-h-screen flex flex-col selection:bg-primary-container selection:text-on-primary-container">
      {/* TopNavBar (Transactional Suppressed Logic: Simplified Branding Only) */}
      <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-lg border-b border-outline-variant/20 h-20 flex items-center">
        <div className="flex justify-between items-center w-full px-container-padding-mobile lg:px-container-padding-desktop max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <span className="font-headline-md text-headline-md font-bold text-primary tracking-tight">WealthFlow</span>
          </div>
          <div className="hidden md:flex gap-4">
            <Link className="font-label-md text-label-md text-secondary hover:text-primary transition-colors" to="/support">Help Center</Link>
          </div>
        </div>
      </header>
      {/* Main Content Canvas */}
      <main className="flex-grow flex items-center justify-center pt-20 px-container-padding-mobile">
        <div className="w-full max-w-[480px] my-12">
          {/* Glassmorphic Auth Card */}
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl shadow-sm overflow-hidden p-8 lg:p-10 relative">
            {/* Branding Accent */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-tertiary"></div>
            <div className="mb-8">
              <div className="w-12 h-12 bg-primary-container/10 rounded-lg flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-primary text-[28px]">lock_reset</span>
              </div>
              <h1 className="font-headline-lg text-headline-lg text-on-surface mb-2">Reset Password</h1>
              <p className="font-body-md text-body-md text-secondary">Choose a secure password to protect your WealthFlow account. Avoid using easily guessable phrases.</p>
            </div>
            <form className="space-y-6">
              {/* New Password Field */}
              <div className="space-y-2">
                <label className="block font-label-md text-label-md text-on-surface-variant" htmlFor="new-password">New Password</label>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">key</span>
                  <input className="w-full bg-surface border border-outline-variant rounded-lg py-3 pl-10 pr-12 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-body-md" id="new-password" placeholder="••••••••" type="password"/>
                  <button className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors" type="button">
                    <span className="material-symbols-outlined">visibility</span>
                  </button>
                </div>
              </div>
              {/* Password Strength Indicators (Visual Component) */}
              <div className="space-y-3">
                <div className="flex gap-1.5 h-1.5">
                  <div className="flex-1 rounded-full bg-primary-container"></div>
                  <div className="flex-1 rounded-full bg-primary-container"></div>
                  <div className="flex-1 rounded-full bg-primary-container"></div>
                  <div className="flex-1 rounded-full bg-surface-container"></div>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[16px]" style={{fontVariationSettings: "'FILL' 1"}}>check_circle</span>
                    <span className="font-label-sm text-label-sm text-secondary">At least 8 characters</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[16px]" style={{fontVariationSettings: "'FILL' 1"}}>check_circle</span>
                    <span className="font-label-sm text-label-sm text-secondary">A special character</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[16px]" style={{fontVariationSettings: "'FILL' 1"}}>check_circle</span>
                    <span className="font-label-sm text-label-sm text-secondary">Uppercase & lowercase</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-outline-variant text-[16px]">radio_button_unchecked</span>
                    <span className="font-label-sm text-label-sm text-outline">Include a number</span>
                  </div>
                </div>
              </div>
              {/* Confirm Password Field */}
              <div className="space-y-2">
                <label className="block font-label-md text-label-md text-on-surface-variant" htmlFor="confirm-password">Confirm New Password</label>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">shield_lock</span>
                  <input className="w-full bg-surface border border-outline-variant rounded-lg py-3 pl-10 pr-12 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-body-md" id="confirm-password" placeholder="••••••••" type="password"/>
                </div>
              </div>
              {/* Submit Button */}
              <button className="w-full bg-primary text-on-primary font-label-md text-label-md py-4 rounded-lg shadow-sm hover:bg-primary/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2" type="submit">
                Update Password
                <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
              </button>
              {/* Back to Login */}
              <div className="text-center pt-4">
                <Link className="font-label-md text-label-md text-secondary hover:text-primary transition-colors inline-flex items-center gap-1 group" to="/login">
                  <span className="material-symbols-outlined text-[18px] group-hover:-translate-x-1 transition-transform">arrow_back</span>
                  Back to Log In
                </Link>
              </div>
            </form>
          </div>
          {/* Trust Badges (Asymmetric Detail) */}
          <div className="mt-10 flex flex-col items-center">
            <div className="flex items-center gap-6 opacity-60">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">verified_user</span>
                <span className="font-label-sm text-label-sm uppercase tracking-widest">256-bit AES</span>
              </div>
              <div className="w-px h-4 bg-outline-variant/40"></div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">security</span>
                <span className="font-label-sm text-label-sm uppercase tracking-widest">SEC Compliant</span>
              </div>
            </div>
            <div className="mt-8">
              <img alt="Security Partner Logos" className="h-8 grayscale opacity-40 mix-blend-multiply" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAjNmAKZNN9MVa0yV0TUL1WofchajD987_8RpERgRdP0rCrXJz-QDtcpkkEPuhuKEsoJhBPg3HZxgcUwAyep2pwr69K2aSmKi-ZGntYz614gNL5s04pqivEOlr1dKAkWDAsPDSzIC0CKJ75KG-3Gy6b-uQFoD7ZKjWCi6aSBh0gPaHgzzuCklkkikrrt01QB6GwL5DaAn64S3EVomOrJJEoyJIxy3jNC7ZB7MOYwsKNNBpvZYReNRPX_C_XVlDW47B6rI67HTfgHFkf"/>
            </div>
          </div>
        </div>
      </main>
      {/* Footer (Universal Brand Shell) */}
      <footer className="w-full py-12 bg-surface-container-low border-t border-outline-variant/30">
        <div className="flex flex-col md:flex-row justify-between items-center w-full px-container-padding-mobile lg:px-container-padding-desktop gap-8 max-w-7xl mx-auto">
          <div className="flex flex-col items-center md:items-start gap-4">
            <span className="font-headline-sm text-headline-sm font-bold text-primary">WealthFlow</span>
            <p className="font-body-sm text-body-sm text-on-secondary-container max-w-xs text-center md:text-left">
              © 2024 WealthFlow Financial Technologies. All rights reserved.
            </p>
          </div>
          <nav className="flex flex-wrap justify-center gap-6">
            <Link className="font-label-sm text-label-sm text-on-secondary-container hover:text-primary transition-all hover:underline" to="/privacy">Privacy Policy</Link>
            <Link className="font-label-sm text-label-sm text-on-secondary-container hover:text-primary transition-all hover:underline" to="/terms">Terms of Service</Link>
            <Link className="font-label-sm text-label-sm text-on-secondary-container hover:text-primary transition-all hover:underline" to="/security">Security</Link>
            <Link className="font-label-sm text-label-sm text-on-secondary-container hover:text-primary transition-all hover:underline" to="/cookie-settings">Cookie Settings</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
};

export default ResetPassword;
