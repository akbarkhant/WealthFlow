import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await api.post('/auth/login', { email, password });
      login(data, data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="bg-background text-on-background font-body-md min-h-screen flex flex-col items-center justify-center relative overflow-x-hidden">
      {/* Abstract Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] -z-10"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-tertiary/10 rounded-full blur-[120px] -z-10"></div>
      
      {/* Header Section (Brand Identity) */}
      <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-lg border-b border-outline-variant/20 h-20 flex items-center justify-center">
        <Link to="/" className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[32px]" style={{fontVariationSettings: "'FILL' 1"}}>account_balance_wallet</span>
          <span className="font-headline-md text-headline-md font-bold text-primary tracking-tight">WealthFlow</span>
        </Link>
      </header>
      
      <main className="w-full max-w-[440px] px-container-padding-mobile mt-20">
        {/* Login Card */}
        <div className="glass-panel border border-outline-variant/30 rounded-xl p-8 shadow-sm">
          <div className="text-center mb-8">
            <h1 className="font-headline-lg text-headline-lg text-on-surface mb-2">Welcome Back</h1>
            <p className="font-body-md text-body-md text-on-secondary-container">Enter your credentials to access your wealth dashboard.</p>
          </div>
          
          {/* Login Form */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 bg-error/10 border border-error/20 text-error rounded-lg text-sm text-center">
                {error}
              </div>
            )}
            
            {/* Email Field */}
            <div className="space-y-2">
              <label className="font-label-md text-label-md text-on-surface-variant block" htmlFor="email">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-outline text-[20px]">mail</span>
                </div>
                <input 
                  className="w-full pl-11 pr-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-lg font-body-md text-on-surface focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all duration-200 outline-none" 
                  id="email" 
                  name="email" 
                  placeholder="name@company.com" 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            
            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="font-label-md text-label-md text-on-surface-variant block" htmlFor="password">Password</label>
                <Link className="font-label-md text-label-md text-primary hover:underline" to="/forgot-password">Forgot Password?</Link>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-outline text-[20px]">lock</span>
                </div>
                <input 
                  className="w-full pl-11 pr-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-lg font-body-md text-on-surface focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all duration-200 outline-none" 
                  id="password" 
                  name="password" 
                  placeholder="••••••••" 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center cursor-pointer group-hover:text-primary transition-colors">
                  <span className="material-symbols-outlined text-outline text-[20px]">visibility</span>
                </div>
              </div>
            </div>
            
            {/* Remember Me */}
            <div className="flex items-center gap-3">
              <input className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary transition-all" id="remember" name="remember" type="checkbox"/>
              <label className="font-body-sm text-body-sm text-on-secondary-container select-none" htmlFor="remember">Remember me for 30 days</label>
            </div>
            
            {/* Action Button */}
            <button 
              className="w-full bg-primary hover:bg-on-primary-fixed-variant text-on-primary font-label-md text-[16px] py-4 rounded-lg shadow-sm active:scale-[0.98] transition-all duration-200 flex justify-center items-center gap-2 disabled:opacity-70" 
              type="submit"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Log In'}
              {!loading && <span className="material-symbols-outlined text-[20px]">arrow_forward</span>}
            </button>
          </form>
          
          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-outline-variant/30"></div>
            </div>
            <div className="relative flex justify-center text-label-md">
              <span className="bg-surface-container-lowest px-4 text-on-secondary-container font-label-md">Or continue with</span>
            </div>
          </div>
          
          {/* Social Logins */}
          <div className="grid grid-cols-2 gap-4">
            <button className="flex items-center justify-center gap-2 py-3 border border-outline-variant/50 rounded-lg hover:bg-surface-container-low transition-colors font-label-md text-on-surface">
              <img alt="Google Logo" className="w-5 h-5" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCar-w_fZW7zBTOwIWslJFz-RX6pnUabvQqIREXIEuMBAZP3WlEAuPnObKhD9St9lgrwxjIKu6Yfv4dJMELJ_63gIprOHEqCqOUMkncj7qzU77QZC-mlt1_e_t1LuNL6UFTafjW8cOcWQCURbO3a6XWsihol5ESfuxe2rGSENLDtO3iiZ9aguyD5muRWAFwdfzYYHIVcl5fDST_ByQ4qIydMTKALYOJ_3qjGQNFA1EN6AaPMdg6XBeQOSrjLeE8BIs5kBFPQs58v9rd"/>
              Google
            </button>
            <button className="flex items-center justify-center gap-2 py-3 border border-outline-variant/50 rounded-lg hover:bg-surface-container-low transition-colors font-label-md text-on-surface">
              <img alt="Apple Logo" className="w-5 h-5" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB2HyGSDRqxF4ucNwAWR_H_DxnoS_nR3ghmONW24Ihco-t9kUCQaL6rOd_cGDpPP6hOGM0Nh4ipi0Lzit1CG88UC6LGAiPzldlJAJQkQ6yrghHsvAku2t5ytDtnxCbWfYqNMZR9OFIU-clbXJdgS2H6A3AMbJDPpCO0uQDfxCgtvJtB3vGaj9gVopn4dPPQAfsOVLu2QjYhIAcpppPZ6UgH8k_NoY8xNqTma1x_sm5thVGwfiO6FoAG1-4goz1kWyubg1bNSIzYHnS0"/>
              Apple
            </button>
          </div>
          
          {/* Register Prompt */}
          <div className="text-center mt-8">
            <p className="font-body-sm text-body-sm text-on-secondary-container">
              New to WealthFlow? 
              <Link className="text-primary font-semibold hover:underline ml-1" to="/signup">Create an account</Link>
            </p>
          </div>
        </div>
        
        {/* Trust Indicator */}
        <div className="mt-8 flex items-center justify-center gap-6 opacity-60">
          <div className="flex items-center gap-1.5 grayscale">
            <span className="material-symbols-outlined text-[18px]">verified_user</span>
            <span className="font-label-sm text-label-sm">SECURED BY FLOWLOCK</span>
          </div>
          <div className="flex items-center gap-1.5 grayscale">
            <span className="material-symbols-outlined text-[18px]">lock_reset</span>
            <span className="font-label-sm text-label-sm">256-BIT ENCRYPTION</span>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="w-full py-12 bg-surface-container-low mt-auto border-t border-outline-variant/30">
        <div className="flex flex-col md:flex-row justify-between items-center w-full px-container-padding-mobile lg:px-container-padding-desktop gap-8 max-w-7xl mx-auto">
          <div className="font-headline-sm text-headline-sm font-bold text-primary tracking-tight">WealthFlow</div>
          <div className="flex flex-wrap justify-center gap-6">
            <Link className="font-label-sm text-label-sm text-on-secondary-container hover:text-primary transition-all" to="/privacy">Privacy Policy</Link>
            <Link className="font-label-sm text-label-sm text-on-secondary-container hover:text-primary transition-all" to="/terms">Terms of Service</Link>
            <Link className="font-label-sm text-label-sm text-on-secondary-container hover:text-primary transition-all" to="/security">Security</Link>
            <Link className="font-label-sm text-label-sm text-on-secondary-container hover:text-primary transition-all" to="/cookie-settings">Cookie Settings</Link>
          </div>
          <div className="font-body-sm text-body-sm text-on-secondary-container opacity-70">
            © 2024 WealthFlow Financial Technologies. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Login;
