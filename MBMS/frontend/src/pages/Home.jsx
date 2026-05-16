import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="bg-background text-on-background">
      {/* TopNavBar */}
      <nav className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-lg border-b border-outline-variant/20 shadow-sm">
        <div className="flex justify-between items-center w-full px-container-padding-mobile lg:px-container-padding-desktop h-20 max-w-7xl mx-auto">
          <div className="font-headline-md text-headline-md font-bold text-primary tracking-tight">WealthFlow</div>
          <div className="hidden lg:flex items-center gap-8">
            <Link className="font-label-md text-label-md text-primary font-bold border-b-2 border-primary pb-1" to="/features">Features</Link>
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
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="hero-gradient relative overflow-hidden py-16 lg:py-24">
          <div className="max-w-7xl mx-auto px-container-padding-mobile lg:px-container-padding-desktop grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 font-label-sm text-label-sm">
                <span className="material-symbols-outlined text-[16px]" style={{fontVariationSettings: "'FILL' 1"}}>auto_awesome</span>
                NEW: AI-POWERED WEALTH INSIGHTS
              </div>
              <h1 className="font-display-lg-mobile lg:font-display-lg text-display-lg-mobile lg:text-display-lg text-on-surface leading-tight">
                Master Your Money with <span className="text-primary">Intelligent</span> Flow
              </h1>
              <p className="font-body-lg text-body-lg text-secondary max-w-lg">
                WealthFlow brings institutional-grade financial tracking to your pocket. Automated budgeting, real-time goal monitoring, and smart bill reminders designed for the modern professional.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/signup" className="bg-primary text-on-primary px-8 py-4 rounded-xl font-label-md text-label-md hover:shadow-lg hover:shadow-primary/20 transition-all flex items-center justify-center gap-2">
                  Get Started Free <span className="material-symbols-outlined">arrow_forward</span>
                </Link>
                <button className="bg-white border border-outline-variant/30 text-on-surface px-8 py-4 rounded-xl font-label-md text-label-md hover:bg-surface-container-low transition-all flex items-center justify-center gap-2">
                  Watch Demo <span className="material-symbols-outlined">play_circle</span>
                </button>
              </div>
              <div className="flex items-center gap-4 pt-4">
                <div className="flex -space-x-3">
                  <img alt="User 1" className="w-10 h-10 rounded-full border-2 border-surface" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBnhRXYNYeJJLCrWMIoFftDyknJ9-VSjyGUjmsa0eUxzqM19h2SyIZV2pcQYwoUsWd4VDg-pt32pajqwSVWcecqz0nyLdorqyVitllWr7--u1Xo64ef2Ti5D9FY88G9s1bFTAkpTosfpS1wzNB1d9ZD28Gwo0H1laLenV1LxmCCV9algGUqxFJLLZ__kXqKb2wshKCotlwo7Iei3aCsG5sVDEBR7TW_-ZxtQ9R_aJToniIu9pocIkPNeshpVhROTjIFU2u7priqVPOG"/>
                  <img alt="User 2" className="w-10 h-10 rounded-full border-2 border-surface" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDaUZYYjCkV5Mh_clZJJ0CL_bhPhHvKZZ8Mf01wwPm2Q3VNIVahZHLLWpjSs-wqEE28Spy1xrj_1N2w9uSjKWi3Q5kGlbDJKfy0Q_t8baVa0GPfylyFISA0I2DIDWRCFXyFVaBCvb9Kh1hbfoLVdlxMyKYSy0kt7Z6WBwLgkqFbwrJmPtqPbIEBaRhJb5MCL9vXChDW28VurlaMs42BcETJ18HP3uMkURuaxrKZ7CfwVb6aQkcNEsGuPNMCEsdlC8WaAoWYmt5gDkWm"/>
                  <img alt="User 3" className="w-10 h-10 rounded-full border-2 border-surface" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAybSsqZ6_9pyo6vgVHJWcGlTUpIgbvmel0sJ1HfejIbiXdv0UjYVUrQlpt-IgJMXYcdNtvMJd7L6G0o-1Xkr5N8u4h7uVIQlxtuugb7IaWtFCc5Z_3cX9t_XAz5BTupA5FahTtS9mCs1kz4EeN0BLhWSaOByqPbk0ry98ejZ8q7vGWrBZ9mZ41wZNBiGDjv7AlnQIfh3-8hXmmZIusUWRUkP7iecpDjiA5KTi9veRV0Pizp58KJFWksn201pVsgmF-IgDBkSqhTgaU"/>
                </div>
                <p className="font-label-sm text-label-sm text-secondary">
                  <span className="font-bold text-on-surface">50,000+</span> users tracking $2B+ in assets
                </p>
              </div>
            </div>
            <div className="relative lg:block">
              <div className="absolute -inset-4 bg-primary/5 blur-3xl rounded-full"></div>
              <div className="relative bg-white rounded-2xl shadow-2xl border border-outline-variant/20 overflow-hidden transform lg:rotate-2 lg:hover:rotate-0 transition-transform duration-500">
                <img alt="Dashboard Mockup" className="w-full h-auto" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBxLFczX7ZEl1ZNtAZ2mip-RVvc31DZTVxkpPK9Iattc3cRHjuIzQ1ktoFtiVHeJ4kFZviOWlk3m1fZQNC3QUDZrrBn-2eMkhI7hEVIqVDG-wkAix12L9nc7JwMzLCTWRg62l_PUNse-TYRQbFJWVYPtYLF2BSflXeAjlHVtgdWSMQTjm7AfHrdx6NrtfvRGBNK_tCXUbf-n4mpU90EYJvhWw90gEOIAh8uduyvoqQcut1kOCT05W_7XWNq-i1L4d6vIOnLBxMnHbRE"/>
              </div>
            </div>
          </div>
        </section>
        
        {/* Features Bento Grid */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-container-padding-mobile lg:px-container-padding-desktop">
            <div className="text-center mb-16 space-y-4">
              <h2 className="font-headline-lg text-headline-lg text-on-surface">Financial Clarity, Redefined</h2>
              <p className="font-body-md text-body-md text-secondary max-w-2xl mx-auto">Everything you need to manage your personal or business finances in one high-performance interface.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Smart Budgeting */}
              <div className="md:col-span-2 group p-8 rounded-3xl bg-surface-container-low border border-outline-variant/20 hover:border-primary/30 transition-all duration-300">
                <div className="flex flex-col h-full justify-between gap-8">
                  <div className="space-y-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>account_balance_wallet</span>
                    </div>
                    <h3 className="font-headline-sm text-headline-sm">Smart Budgeting</h3>
                    <p className="font-body-md text-body-md text-secondary">WealthFlow automatically categorizes your transactions and identifies spending patterns. Set limits that actually work with your lifestyle using our AI-driven forecasting.</p>
                  </div>
                  <div className="relative overflow-hidden rounded-xl bg-white p-4 shadow-sm border border-outline-variant/10">
                    <div className="space-y-3">
                      <div className="flex justify-between text-label-sm">
                        <span>Dining & Groceries</span>
                        <span className="text-primary font-bold">85%</span>
                      </div>
                      <div className="h-2 w-full bg-primary/10 rounded-full">
                        <div className="h-full bg-primary rounded-full" style={{width: "85%"}}></div>
                      </div>
                      <div className="flex justify-between text-label-sm pt-2">
                        <span className="text-secondary">Spent: $850.00</span>
                        <span className="text-secondary">Remaining: $150.00</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Bill Reminders */}
              <div className="group p-8 rounded-3xl bg-surface-container-highest/30 border border-outline-variant/20 hover:border-primary/30 transition-all duration-300">
                <div className="flex flex-col h-full justify-between gap-8">
                  <div className="space-y-4">
                    <div className="w-12 h-12 rounded-xl bg-tertiary/10 flex items-center justify-center text-tertiary">
                      <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>notifications_active</span>
                    </div>
                    <h3 className="font-headline-sm text-headline-sm">Bill Reminders</h3>
                    <p className="font-body-md text-body-md text-secondary">Never miss a payment again. Get predictive alerts before bills are due.</p>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-outline-variant/20 shadow-sm">
                      <div className="w-8 h-8 rounded bg-red-50 text-error flex items-center justify-center">
                        <span className="material-symbols-outlined text-sm">priority_high</span>
                      </div>
                      <div className="flex-1">
                        <div className="font-label-md text-on-surface">Electric Bill</div>
                        <div className="text-[10px] text-secondary">Due in 2 days</div>
                      </div>
                      <div className="font-label-md text-on-surface">$142.50</div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-white/50 rounded-xl border border-dashed border-outline-variant/40">
                      <div className="w-8 h-8 rounded bg-surface-container flex items-center justify-center">
                        <span className="material-symbols-outlined text-sm text-secondary">schedule</span>
                      </div>
                      <div className="flex-1">
                        <div className="font-label-md text-secondary">Subscription</div>
                        <div className="text-[10px] text-secondary/60">Oct 24, 2024</div>
                      </div>
                      <div className="font-label-md text-secondary">$14.99</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Goal Tracking */}
              <div className="group p-8 rounded-3xl bg-primary-container/5 border border-outline-variant/20 hover:border-primary/30 transition-all duration-300">
                <div className="flex flex-col h-full justify-between gap-8">
                  <div className="space-y-4">
                    <div className="w-12 h-12 rounded-xl bg-primary-container/20 flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>track_changes</span>
                    </div>
                    <h3 className="font-headline-sm text-headline-sm">Goal Tracking</h3>
                    <p className="font-body-md text-body-md text-secondary">Visualize your dreams. Whether it's a home, travel, or retirement, WealthFlow calculates exactly how to get there.</p>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-outline-variant/10 shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent flex items-center justify-center">
                        <span className="text-label-sm font-bold text-primary">72%</span>
                      </div>
                      <div>
                        <div className="font-label-md">House Downpayment</div>
                        <div className="text-[10px] text-secondary">$54,000 of $75,000</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Value Proposition */}
              <div className="md:col-span-2 group p-8 rounded-3xl bg-on-surface text-surface-bright flex flex-col md:flex-row items-center gap-8 overflow-hidden">
                <div className="flex-1 space-y-4">
                  <h3 className="font-headline-md text-headline-md">Security You Can Trust</h3>
                  <p className="font-body-md text-body-md opacity-70">We use AES-256 bank-level encryption and 2FA to ensure your financial data remains private and secure. SOC2 Type II compliant.</p>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-label-md">
                      <span className="material-symbols-outlined text-primary">verified_user</span>
                      Read-only access protocol
                    </li>
                    <li className="flex items-center gap-2 text-label-md">
                      <span className="material-symbols-outlined text-primary">verified_user</span>
                      Biometric authentication
                    </li>
                  </ul>
                </div>
                <div className="w-full md:w-1/2 flex justify-center">
                  <img alt="Security Illustration" className="w-48 h-auto opacity-50" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCwxnQofg5rSs1mC7QJ_38LHeg0FcScIkovqKZVPWhmXuB2Iq_LvY0XUtH-cmoQHZPU5jsdMiTsxnKdNkLoiWEqD9kr6fBUPbi85gmns3cfkFO3FRM7OEe31YeaScNmG-0C9Hfpak-Nz0orGtknyBq0ds_GUkb3JomMU48yTDjttX3g7eREMsOfY4AKlFpsoLLFOsqtRL0Qrt0vpA1bl5Tx0A4hKwfYm3N_RwXh5CpmZtkoBhVxfE-_cEWLP-8oT7_edX-__iXJTtyy"/>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Social Proof */}
        <section className="py-24 bg-surface-container-low/50">
          <div className="max-w-7xl mx-auto px-container-padding-mobile lg:px-container-padding-desktop">
            <div className="flex flex-col lg:flex-row items-end justify-between mb-16 gap-8">
              <div className="space-y-4">
                <h2 className="font-headline-lg text-headline-lg text-on-surface">Loved by Thousands of Wealth Builders</h2>
                <div className="flex items-center gap-1 text-primary">
                  <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
                  <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
                  <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
                  <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
                  <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
                  <span className="ml-2 font-label-md text-on-surface">4.9/5 Average Rating</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-2xl border border-outline-variant/10 shadow-sm space-y-6">
                <p className="font-body-md text-body-md italic text-secondary">"WealthFlow changed the way I look at my monthly expenses. The smart budgeting tool actually predicts my spending accurately!"</p>
                <div className="flex items-center gap-4">
                  <img alt="James R." className="w-12 h-12 rounded-full" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC3IRh1-mJbc3xFtVsy61l374S1Ec3VLHAS7Jpgu1znUJQmjNuFHCxydJuiyL8rRlrLwDfEsn_Gd-l7L2FvWXl-eYDc5Vn_W0U4Dz1Ya7DsPU1fjgCxD6h0rFK2T12x1RsRccURqOz8ptFcNYOve0mqILHD7P-q-LqglVaXHl1WpzrjykpWLt2PoiNsYiMxfaH0z2oakLgshl3H7ub8jP_UWEDdrZWEQVEy8JznogUzeaMd2OIwZcUvLQ1_N_tu3vPUsP9bUDEoHQZO"/>
                  <div>
                    <div className="font-label-md font-bold">James Richardson</div>
                    <div className="text-[10px] text-secondary">Product Manager</div>
                  </div>
                </div>
              </div>
              <div className="bg-white p-8 rounded-2xl border border-outline-variant/10 shadow-sm space-y-6">
                <p className="font-body-md text-body-md italic text-secondary">"The goal tracking feature helped me save for my first home 6 months ahead of schedule. The visual progress is incredibly motivating."</p>
                <div className="flex items-center gap-4">
                  <img alt="Sarah L." className="w-12 h-12 rounded-full" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA3E5g7CO2_M-2RdtSfsLnLkaWrIzH5rA6MK9qHd5Dtdh5J1UJGIJf7iefYnMyYvP1u_4sJKE_RiRaO9-BIpiA74hm8pdQxlqlgKUgjsBNZKrxLmmXOLSgGT3N7gcJBEul_l6c68HixOeEKvVfWA7tnHiqZVATRYJDLbKks87fsELeRXJRNWdMpG-4R_QqpzczIiHht912sC3XhJcdR6U0Omi6oGFVBC0xM2GFg56MxeQ_u-8qZmX3TFpfLx_NF50NQOkQXcMyw3g4r"/>
                  <div>
                    <div className="font-label-md font-bold">Sarah Lindholm</div>
                    <div className="text-[10px] text-secondary">Creative Director</div>
                  </div>
                </div>
              </div>
              <div className="bg-white p-8 rounded-2xl border border-outline-variant/10 shadow-sm space-y-6">
                <p className="font-body-md text-body-md italic text-secondary">"Cleanest UI I've ever used for financial management. It doesn't feel like a chore to check my dashboard anymore."</p>
                <div className="flex items-center gap-4">
                  <img alt="David K." className="w-12 h-12 rounded-full" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAqrJQJUUOnbZK5o72G3520RjY3zzkXwS-sZkK-qP96IF0RNIf5jjxFirY6K-5DzFTxKzf4xRHey5RsuK1mzE54SNjGnHDwnHe_RiysulRsmE9GSJmS5gRwQdm0zWQUFybRojNe3D-_90xTe3D80Pb4S5HOAjBEsUJz9_doJJmKEzkPBmSlAid7kiRHkNGSIjrsr7v5M1UVHcXAsGgR6ubpT6qh_rB3rhHldRtkeu-Noy0Sj5XbcMydvfG0iWBtzX1fi7qhAb3rLWkH"/>
                  <div>
                    <div className="font-label-md font-bold">David Kross</div>
                    <div className="text-[10px] text-secondary">Software Engineer</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-24">
          <div className="max-w-5xl mx-auto px-container-padding-mobile lg:px-container-padding-desktop">
            <div className="bg-primary rounded-[3rem] p-8 md:p-16 text-center text-on-primary relative overflow-hidden shadow-2xl shadow-primary/30">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full -ml-32 -mb-32 blur-3xl"></div>
              <div className="relative z-10 space-y-8">
                <h2 className="font-display-lg-mobile lg:font-display-lg text-display-lg-mobile lg:text-display-lg font-extrabold tracking-tight">Ready to master your wealth?</h2>
                <p className="font-body-lg text-body-lg opacity-90 max-w-xl mx-auto">Join over 50,000 users who have transformed their financial lives with WealthFlow. Start your 14-day free trial today.</p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <Link to="/signup" className="bg-white text-primary px-10 py-5 rounded-2xl font-label-md text-label-md font-bold hover:bg-surface-bright transition-all active:scale-95 shadow-xl inline-block">Get Started Now</Link>
                  <button className="bg-primary-container/20 border border-white/30 text-white px-10 py-5 rounded-2xl font-label-md text-label-md hover:bg-white/10 transition-all">Schedule a Demo</button>
                </div>
                <p className="text-label-sm opacity-70">No credit card required. Cancel anytime.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      {/* Footer */}
      <footer className="bg-surface-container-low border-t border-outline-variant/30 w-full py-12">
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

export default Home;
