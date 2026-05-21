import React from 'react';
import { Sparkles, ArrowRight, PlayCircle, Wallet, Bell, Target, CheckCircle2 } from 'lucide-react';
import '../../styles/components/Section.css';

export default function Sections() {
  return (
    <div className="landing-sections">
      {/* A. HERO SECTION */}
      <section className="hero-section">
        <div className="hero-glow-1"></div>
        <div className="hero-glow-2"></div>
        
        <div className="sections-container hero-grid">
          <div className="hero-content">
            <div className="hero-badge">
              <Sparkles size={14} className="badge-icon" />
              <span>New: AI-Powered Wealth Insights</span>
            </div>
            
            <h1 className="hero-title">
              Master Your Money with <span className="highlight">Intelligent</span> Flow
            </h1>
            
            <p className="hero-description">
              WealthFlow brings institutional-grade financial tracking to your pocket. Automated budgeting, real-time goal monitoring, and smart bill reminders designed for the modern professional.
            </p>
            
            <div className="hero-cta">
              <button className="btn-hero-primary">
                Get Started Free <ArrowRight size={18} />
              </button>
              <button className="btn-hero-secondary">
                <PlayCircle size={20} /> Watch Demo
              </button>
            </div>
            
            <div className="hero-proof">
              <div className="avatar-stack">
                <div className="avatar">AM</div>
                <div className="avatar">JD</div>
                <div className="avatar">SK</div>
              </div>
              <p className="proof-text">
                <strong>50,000+</strong> users tracking $2B+ in assets
              </p>
            </div>
          </div>
          
          <div className="hero-visual">
            <div className="mockup-card glass-card">
              <div className="mockup-header">
                <div className="mockup-dots"><span /><span /><span /></div>
                <div className="mockup-title">Wealth Dashboard</div>
              </div>
              <div className="mockup-body">
                <div className="mockup-stat-row">
                  <div className="mockup-stat">
                    <span className="stat-label">Net Worth</span>
                    <span className="stat-val">$142,350.80</span>
                  </div>
                  <div className="mockup-badge-up">+12.4%</div>
                </div>
                <div className="mockup-chart-placeholder">
                  <div className="chart-bar" style={{ height: '40%' }}></div>
                  <div className="chart-bar" style={{ height: '65%' }}></div>
                  <div className="chart-bar highlight" style={{ height: '85%' }}></div>
                  <div className="chart-bar" style={{ height: '55%' }}></div>
                  <div className="chart-bar" style={{ height: '70%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* B. FEATURES SECTION (Bento Grid) */}
      <section id="features" className="features-section">
        <div className="sections-container">
          <div className="section-header">
            <h2 className="section-title">Financial Clarity, Redefined</h2>
            <p className="section-subtitle">Everything you need to manage your personal finances in one high-performance interface.</p>
          </div>
          
          <div className="bento-grid">
            {/* Card 1: Smart Budgeting */}
            <div className="bento-card card-large glass-card">
              <div className="card-icon-wrapper bg-emerald">
                <Wallet size={24} />
              </div>
              <div className="card-info">
                <h3>Smart Budgeting</h3>
                <p>WealthFlow automatically categorizes your transactions and identifies spending patterns. Set limits that work around your actual lifestyle using predictive variables.</p>
              </div>
              <div className="card-widget">
                <div className="widget-row">
                  <span>Dining Out</span>
                  <span>$420 / $500</span>
                </div>
                <div className="progress-bar-container">
                  <div className="progress-bar-fill" style={{ width: '84%' }}></div>
                </div>
              </div>
            </div>

            {/* Card 2: Bill Reminders */}
            <div className="bento-card glass-card">
              <div className="card-icon-wrapper bg-blue">
                <Bell size={24} />
              </div>
              <div className="card-info">
                <h3>Bill Reminders</h3>
                <p>Never run into late payment penalties again. Predictive calendar tracking alerts you days before obligations arrive.</p>
              </div>
              <div className="card-widget widget-alert">
                <div className="alert-strip">
                  <span className="alert-dot" />
                  <span>Cloud SaaS due in 2 days</span>
                </div>
              </div>
            </div>

            {/* Card 3: Goal Tracking */}
            <div className="bento-card glass-card">
              <div className="card-icon-wrapper bg-purple">
                <Target size={24} />
              </div>
              <div className="card-info">
                <h3>Goal Tracking</h3>
                <p>Visualize milestones dynamically. Setup fractional investment paths for home down payments, travel funds, or early retirement metrics.</p>
              </div>
              <div className="card-widget widget-center">
                <div className="circular-progress">
                  <div className="circular-inner">72%</div>
                </div>
              </div>
            </div>

            {/* Card 4: Security */}
            <div className="bento-card card-large glass-card">
              <div className="card-icon-wrapper bg-dark">
                <CheckCircle2 size={24} />
              </div>
              <div className="card-info">
                <h3>Institutional-Grade Security</h3>
                <p>We deploy standard AES-256 bank-level encryption algorithms, dual-layer authentication mechanisms, and continuous penetration auditing vectors to lock down raw metadata architectures.</p>
              </div>
              <div className="security-badges">
                <span className="sec-tag">✓ SOC2 Type II Compliant</span>
                <span className="sec-tag">✓ End-To-End Encryption</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* C. TESTIMONIAL SECTION */}
      <section id="solutions" className="testimonial-section">
        <div className="sections-container">
          <div className="section-header">
            <h2 className="section-title">Trusted by Modern Investors</h2>
            <p className="section-subtitle">See how forward-thinking professionals are optimization-scaling their personal asset tracking paths.</p>
          </div>
          
          <div className="testimonial-grid">
            <div className="testimonial-card glass-card">
              <p className="testimonial-text">"WealthFlow shifted how I visualize dynamic assets. The automated AI budgeting framework accurately forecasts month-end balances down to single-digit variances."</p>
              <div className="testimonial-profile">
                <div className="profile-img">JR</div>
                <div>
                  <h4 className="profile-name">James Richardson</h4>
                  <p className="profile-role">Product Manager</p>
                </div>
              </div>
            </div>

            <div className="testimonial-card glass-card">
              <p className="testimonial-text">"The visual tracking updates allowed my family to accelerate a primary down payment window six months ahead of projection schedules. The visual reinforcement loop is incredible."</p>
              <div className="testimonial-profile">
                <div className="profile-img">SL</div>
                <div>
                  <h4 className="profile-name">Sarah Lindholm</h4>
                  <p className="profile-role">Creative Director</p>
                </div>
              </div>
            </div>

            <div className="testimonial-card glass-card">
              <p className="testimonial-text">"Cleanest functional dashboard layout available in active fintech space. No bloated overhead paths, structural responsiveness remains zero-latency, and verification connections persist perfectly."</p>
              <div className="testimonial-profile">
                <div className="profile-img">DK</div>
                <div>
                  <h4 className="profile-name">David Kross</h4>
                  <p className="profile-role">Software Engineer</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* D. CTA SECTION */}
      <section className="cta-section">
        <div className="sections-container">
          <div className="cta-wrapper">
            <h2 className="cta-heading">Ready to Master Your Financial Flow?</h2>
            <p className="cta-paragraph">Join over 50,000 algorithmic builders managing scalable assets with zero friction. Claim access to tools immediately.</p>
            <div className="cta-buttons">
              <button className="btn-cta-light">Create Free Account</button>
              <button className="btn-cta-transparent">Speak to Advisors</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}