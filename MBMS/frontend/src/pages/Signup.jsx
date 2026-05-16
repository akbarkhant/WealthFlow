import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const Signup = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }

    setLoading(true);

    try {
      const data = await api.post('/auth/register', { firstName, lastName, email, password });
      login(data, data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col font-body-md">
      {/* TopNavBar Suppression: Page intent is Transactional (Signup) */}
      <main className="flex-grow flex items-center justify-center relative overflow-hidden px-container-padding-mobile lg:px-container-padding-desktop py-12">
        {/* Abstract Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
          <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-primary/5 blur-[120px]"></div>
          <div className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-tertiary/5 blur-[120px]"></div>
        </div>
        <div className="w-full max-w-[1200px] grid lg:grid-cols-2 gap-12 items-center relative z-10">
          {/* Left Side: Branding & Trust */}
          <div className="hidden lg:flex flex-col gap-8">
            <div>
              <h1 className="font-display-lg text-display-lg text-on-surface tracking-tight mb-4">
                Master your <span className="text-primary">WealthFlow</span>.
              </h1>
              <p className="font-body-lg text-body-lg text-secondary max-w-md">
                Join thousands of investors using WealthFlow to automate their financial growth with precision-grade analytics and institutional-level security.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant/30 shadow-sm">
                <span className="material-symbols-outlined text-primary mb-3">verified_user</span>
                <h3 className="font-headline-sm text-headline-sm text-on-surface mb-1">Secure</h3>
                <p className="font-body-sm text-body-sm text-secondary">Bank-grade 256-bit encryption for all data.</p>
              </div>
              <div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant/30 shadow-sm">
                <span className="material-symbols-outlined text-primary mb-3">trending_up</span>
                <h3 className="font-headline-sm text-headline-sm text-on-surface mb-1">Insightful</h3>
                <p className="font-body-sm text-body-sm text-secondary">Real-time tracking of all your assets.</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-surface-container-highest/30 rounded-xl border border-outline-variant/20">
              <div className="flex -space-x-2">
                <img alt="User profile 1" className="w-10 h-10 rounded-full border-2 border-surface shadow-sm" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA1MVdv0PBM8W7ECSOcxl13nZxFSW7VP8E0tdRpoENrjYymHfu9sxOG6I7e5txJW0uJ63Y1rXAKcGbm8Yf6cBnjfwjOIUQ8RPB-noMhgz1Z1zd_LVUBnMrwyYG_7ucxPMerVJiLsmC0WaNRB0VMEIDcHKUMzCd1l-UUmyP4cxRJHX2SeIf5cnEz0YWIdKpuXHB5fKC76I-NlNGFBOMthZwckw0TME2aaiD6oHecve_WO-Ix_RNXPr-Qrag0D_0cq-X8j3Fctbdz_rLX"/>
                <img alt="User profile 2" className="w-10 h-10 rounded-full border-2 border-surface shadow-sm" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC4T53nA4WzF3cNPYX7Amn0TfEhTK6aVtDC6GU6UbBuN71xXLfodnCYSNNLAexU513Xqpk9IrJKCXpfNhYwK3n-zgUQ1LwON7UsJ6a-tppuHRhPrawnCDZULhTFjuwPSOqiwdguPcy5HA9YFsNbUea_BUTgW7a6_Kr5h3VZdJcLhIkGVSwUXnnzkysvjpJgi9nem0mdYJ77U9A3KhiKKJOkEtXMuMkVCclDCmu4em4dq9wD8Bc_Km9lnKC25GvOB0bxYQthwT__UuJr"/>
                <img alt="User profile 3" className="w-10 h-10 rounded-full border-2 border-surface shadow-sm" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB4qViPB4J76XxWDR7s4aYvp_g4K-r_yXuMq4I2_BAHeZuyo3_A8VIStR2JkaD_kQeWgWHudD13dfzLJvU71oal8h0QX6OY7vMb_-i5_DC04_EqlyOkeHS3AEi_MC-oGbGSap8DRLoRyx4a3i7v-div1JDLXaZscDw5kRuPGLDa884p5DAagcgkH7uUGDCZ2v0kEur-rMRwPIblMpBrZ55KlWsKNv4rSaGU94Ewg9FdKssVGQ8o827rOX1RfSvQuOpsguPCdcFPKi7Y"/>
              </div>
              <p className="font-label-md text-label-md text-secondary">
                <span className="font-bold text-on-surface">50,000+</span> professionals trust WealthFlow
              </p>
            </div>
          </div>
          {/* Right Side: Signup Form */}
          <div className="flex justify-center">
            <div className="glass-card w-full max-w-[480px] p-8 lg:p-10 rounded-2xl border border-outline-variant/50 shadow-xl">
              <div className="mb-10 text-center lg:text-left">
                <div className="font-headline-md text-headline-md font-bold text-primary tracking-tight mb-2">WealthFlow</div>
                <h2 className="font-headline-lg text-headline-lg text-on-surface mb-2">Create Account</h2>
                <p className="font-body-md text-body-md text-secondary">Start managing your future today. <span className="text-primary-container font-semibold">No credit card required.</span></p>
              </div>
              <form className="space-y-6" onSubmit={handleSubmit}>
                {error && (
                  <div className="p-3 bg-error/10 border border-error/20 text-error rounded-lg text-sm text-center">
                    {error}
                  </div>
                )}
                <div className="space-y-2">
                  <label className="font-label-md text-label-md text-on-surface-variant block px-1" htmlFor="firstName">First Name</label>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-secondary group-focus-within:text-primary transition-colors">person</span>
                    <input className="w-full pl-12 pr-4 py-4 bg-surface-container-low border border-outline-variant rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-body-md text-on-surface placeholder:text-secondary/50" id="firstName" placeholder="John" type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required/>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="font-label-md text-label-md text-on-surface-variant block px-1" htmlFor="lastName">Last Name</label>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-secondary group-focus-within:text-primary transition-colors">person</span>
                    <input className="w-full pl-12 pr-4 py-4 bg-surface-container-low border border-outline-variant rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-body-md text-on-surface placeholder:text-secondary/50" id="lastName" placeholder="Doe" type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} required/>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="font-label-md text-label-md text-on-surface-variant block px-1" htmlFor="email">Email Address</label>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-secondary group-focus-within:text-primary transition-colors">mail</span>
                    <input className="w-full pl-12 pr-4 py-4 bg-surface-container-low border border-outline-variant rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-body-md text-on-surface placeholder:text-secondary/50" id="email" placeholder="name@company.com" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required/>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="font-label-md text-label-md text-on-surface-variant block px-1" htmlFor="password">Password</label>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-secondary group-focus-within:text-primary transition-colors">lock</span>
                    <input className="w-full pl-12 pr-12 py-4 bg-surface-container-low border border-outline-variant rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-body-md text-on-surface placeholder:text-secondary/50" id="password" placeholder="••••••••" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required/>
                    <button className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary hover:text-on-surface transition-colors" type="button">
                      <span className="material-symbols-outlined">visibility</span>
                    </button>
                  </div>
                  <p className="font-label-sm text-label-sm text-secondary px-1">Must be at least 8 characters long.</p>
                </div>
                <div className="space-y-2">
                  <label className="font-label-md text-label-md text-on-surface-variant block px-1" htmlFor="confirmPassword">Confirm Password</label>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-secondary group-focus-within:text-primary transition-colors">lock</span>
                    <input className="w-full pl-12 pr-12 py-4 bg-surface-container-low border border-outline-variant rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-body-md text-on-surface placeholder:text-secondary/50" id="confirmPassword" placeholder="••••••••" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required/>
                  </div>
                </div>
                <div className="flex items-start gap-3 py-2">
                  <input className="mt-1 w-4 h-4 text-primary bg-surface-container-low border-outline-variant rounded focus:ring-primary transition-all" id="terms" type="checkbox"/>
                  <label className="font-body-sm text-body-sm text-secondary" htmlFor="terms">
                    I agree to the <Link className="text-primary hover:underline" to="/terms">Terms of Service</Link> and <Link className="text-primary hover:underline" to="/privacy">Privacy Policy</Link>.
                  </label>
                </div>
                <button className="w-full bg-primary text-on-primary font-label-md text-label-md py-4 rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 active:scale-[0.98] transition-all duration-200 disabled:opacity-70" type="submit" disabled={loading}>
                  {loading ? 'Creating Account...' : 'Create Account'}
                </button>
              </form>
              <div className="mt-8 pt-8 border-t border-outline-variant/30 text-center">
                <p className="font-body-sm text-body-sm text-secondary">
                  Already have an account? 
                  <Link className="text-primary font-bold hover:underline ml-1" to="/login">Log In</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Footer Component from JSON */}
      <footer className="w-full py-12 bg-surface-container-low dark:bg-on-surface border-t border-outline-variant/30 dark:border-outline/10">
        <div className="flex flex-col md:flex-row justify-between items-center w-full px-container-padding-mobile lg:px-container-padding-desktop gap-8 max-w-7xl mx-auto">
          <div className="flex flex-col items-center md:items-start gap-2">
            <div className="font-headline-sm text-headline-sm font-bold text-primary dark:text-primary-fixed-dim">WealthFlow</div>
            <p className="font-body-sm text-body-sm text-secondary dark:text-secondary-fixed-dim">© 2024 WealthFlow Financial Technologies. All rights reserved.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            <Link className="font-label-sm text-label-sm text-on-secondary-container dark:text-secondary-fixed-dim hover:text-primary hover:underline transition-all" to="/privacy">Privacy Policy</Link>
            <Link className="font-label-sm text-label-sm text-on-secondary-container dark:text-secondary-fixed-dim hover:text-primary hover:underline transition-all" to="/terms">Terms of Service</Link>
            <Link className="font-label-sm text-label-sm text-on-secondary-container dark:text-secondary-fixed-dim hover:text-primary hover:underline transition-all" to="/security">Security</Link>
            <Link className="font-label-sm text-label-sm text-on-secondary-container dark:text-secondary-fixed-dim hover:text-primary hover:underline transition-all" to="/cookie-settings">Cookie Settings</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Signup;
