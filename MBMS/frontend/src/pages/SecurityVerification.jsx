import React from 'react';
import { Link } from 'react-router-dom';

const SecurityVerification = () => {
  return (
    <div className="bg-background text-on-background font-body-md min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background Texture */}
      <div className="absolute inset-0 bg-pattern opacity-5 pointer-events-none"></div>
      
      {/* Floating Decorative Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-tertiary/10 rounded-full blur-[100px] pointer-events-none"></div>
      
      {/* Main Content Container */}
      <main className="relative z-10 w-full max-w-lg px-container-padding-mobile md:px-0">
        {/* Header Section */}
        <div className="text-center mb-base-12 mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shadow-lg">
              <span className="material-symbols-outlined text-white text-[24px]" style={{fontVariationSettings: "'FILL' 1"}}>account_balance_wallet</span>
            </div>
            <span className="font-headline-md text-headline-md font-bold text-primary tracking-tight">WealthFlow</span>
          </div>
        </div>
        
        {/* OTP Card */}
        <div className="glass-card border border-outline-variant/30 rounded-xl p-8 md:p-10 shadow-[0_20px_50px_rgba(11,28,48,0.05)]">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-16 h-16 bg-primary-container/10 text-primary rounded-full flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-[32px]">lock_person</span>
            </div>
            <h1 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface mb-2">Two-Step Verification</h1>
            <p className="font-body-md text-body-md text-on-secondary-container max-w-[320px]">
              We've sent a 6-digit verification code to <span className="font-semibold text-on-surface">joh***@wealthflow.com</span>
            </p>
          </div>
          
          {/* Verification Form */}
          <form className="space-y-8">
            {/* OTP Inputs */}
            <div className="flex justify-between gap-2 md:gap-4">
              <input className="otp-input w-12 h-14 md:w-16 md:h-20 text-center font-headline-md text-headline-md bg-surface border-outline-variant rounded-lg focus:border-primary focus:ring-0 transition-all duration-200 outline-none" maxLength="1" placeholder="·" required type="text"/>
              <input className="otp-input w-12 h-14 md:w-16 md:h-20 text-center font-headline-md text-headline-md bg-surface border-outline-variant rounded-lg focus:border-primary focus:ring-0 transition-all duration-200 outline-none" maxLength="1" placeholder="·" required type="text"/>
              <input className="otp-input w-12 h-14 md:w-16 md:h-20 text-center font-headline-md text-headline-md bg-surface border-outline-variant rounded-lg focus:border-primary focus:ring-0 transition-all duration-200 outline-none" maxLength="1" placeholder="·" required type="text"/>
              <input className="otp-input w-12 h-14 md:w-16 md:h-20 text-center font-headline-md text-headline-md bg-surface border-outline-variant rounded-lg focus:border-primary focus:ring-0 transition-all duration-200 outline-none" maxLength="1" placeholder="·" required type="text"/>
              <input className="otp-input w-12 h-14 md:w-16 md:h-20 text-center font-headline-md text-headline-md bg-surface border-outline-variant rounded-lg focus:border-primary focus:ring-0 transition-all duration-200 outline-none" maxLength="1" placeholder="·" required type="text"/>
              <input className="otp-input w-12 h-14 md:w-16 md:h-20 text-center font-headline-md text-headline-md bg-surface border-outline-variant rounded-lg focus:border-primary focus:ring-0 transition-all duration-200 outline-none" maxLength="1" placeholder="·" required type="text"/>
            </div>
            
            {/* Timer & Resend */}
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-2 text-secondary px-4 py-2 bg-secondary-container/30 rounded-full">
                <span className="material-symbols-outlined text-[18px]">schedule</span>
                <span className="font-label-md text-label-md">Code expires in <span className="font-bold text-on-surface">01:54</span></span>
              </div>
              <button className="font-label-md text-label-md text-primary hover:text-on-primary-fixed-variant transition-colors flex items-center gap-1 group" type="button">
                Didn't receive the code? 
                <span className="font-bold underline underline-offset-4 group-hover:no-underline ml-1">Resend Code</span>
              </button>
            </div>
            
            {/* Action Button */}
            <button className="w-full bg-primary hover:bg-on-primary-fixed-variant text-white font-body-lg font-semibold py-4 rounded-xl shadow-lg shadow-primary/20 transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-2 group" type="submit">
              Verify & Proceed
              <span className="material-symbols-outlined text-[20px] transition-transform group-hover:translate-x-1">arrow_forward</span>
            </button>
          </form>
          
          {/* Institutional Trust Indicator */}
          <div className="mt-10 pt-8 border-t border-outline-variant/20 flex flex-col items-center">
            <div className="flex items-center gap-6 opacity-40">
              <span className="material-symbols-outlined text-[32px]">verified_user</span>
              <span className="material-symbols-outlined text-[32px]">security</span>
              <span className="material-symbols-outlined text-[32px]">gpp_good</span>
            </div>
            <p className="font-label-sm text-label-sm text-secondary mt-4 uppercase tracking-widest">Secure 256-bit encrypted verification</p>
          </div>
        </div>
        
        {/* Footer Help */}
        <footer className="mt-8 text-center">
          <p className="font-body-sm text-body-sm text-on-secondary-container">
            Having trouble? <Link className="text-primary font-semibold hover:underline" to="/support">Contact our 24/7 security team</Link>
          </p>
        </footer>
      </main>
      
      {/* Visual Accent Element */}
      <div className="fixed bottom-0 left-0 w-full h-1 bg-gradient-to-r from-primary/10 via-primary to-primary/10"></div>
    </div>
  );
};

export default SecurityVerification;
