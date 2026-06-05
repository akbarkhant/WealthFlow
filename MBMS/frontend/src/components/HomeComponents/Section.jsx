import { useEffect, useRef } from 'react';
import { Sparkles, ArrowRight, PlayCircle, Wallet, Bell, Target, CheckCircle2, TrendingUp, Shield } from 'lucide-react';
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger.js";

gsap.registerPlugin(ScrollTrigger);

export default function Section() {
  const heroRef = useRef(null);
  const featureRef = useRef(null);
  const testimonialRef = useRef(null);
  const ctaRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {

      // ─── HERO SECTION ─────────────────────────────────────────────
      const heroTl = gsap.timeline({ delay: 0.2 });

      heroTl
        .from('.hero-badge', {
          opacity: 0, y: 24, duration: 0.7, ease: 'power3.out'
        })
        .from('.hero-title', {
          opacity: 0, y: 40, duration: 0.8, ease: 'power3.out'
        }, '-=0.4')
        .from('.hero-description', {
          opacity: 0, y: 30, duration: 0.7, ease: 'power3.out'
        }, '-=0.5')
        .from('.hero-cta', {
          opacity: 0, y: 20, duration: 0.6, ease: 'power3.out'
        }, '-=0.4')
        .from('.hero-proof', {
          opacity: 0, y: 16, duration: 0.5, ease: 'power3.out'
        }, '-=0.3')
        .from('.hero-visual', {
          opacity: 0, x: 60, rotateY: -15, duration: 1.1, ease: 'power3.out'
        }, '-=0.9')
        .from('.chart-bar', {
          scaleY: 0,
          transformOrigin: 'bottom center',
          duration: 0.6,
          stagger: 0.08,
          ease: 'back.out(1.4)'
        }, '-=0.3');

      // floating animation on mockup card
      gsap.to('.mockup-card', {
        y: -12,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });

      // Stat counter animation
      gsap.to('.stat-val-number', {
        innerHTML: '+12.4%',
        duration: 1.5,
        delay: 1,
        ease: 'power1.inOut'
      });

      // ─── FEATURES SECTION ────────────────────────────────────────
      gsap.from('.features-section .section-header', {
        scrollTrigger: {
          trigger: '.features-section',
          start: 'top 80%',
          toggleActions: 'play none none none'
        },
        opacity: 0, y: 50, duration: 0.9, ease: 'power3.out'
      });

      gsap.from('.bento-card', {
        scrollTrigger: {
          trigger: '.bento-grid',
          start: 'top 80%',
          toggleActions: 'play none none none'
        },
        opacity: 0,
        y: 70,
        scale: 0.95,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power3.out'
      });

      // Progress bar animation
      ScrollTrigger.create({
        trigger: '.bento-grid',
        start: 'top 75%',
        onEnter: () => {
          gsap.to('.progress-bar-fill', {
            width: '84%',
            duration: 1.4,
            ease: 'power2.out',
            delay: 0.5
          });
          gsap.from('.circular-progress', {
            background: `conic-gradient(#8b5cf6 0%, #e2e8f0 0)`,
            duration: 0,
          });
          gsap.to('.circular-progress', {
            duration: 1.4,
            ease: 'power2.out',
            delay: 0.5,
            onUpdate: function() {
              const progress = Math.round(this.progress() * 72);
              document.querySelectorAll('.circular-progress').forEach(el => {
                el.style.background = `conic-gradient(#8b5cf6 ${progress}%, #e2e8f0 0)`;
              });
            }
          });
        }
      });

      // Feature images parallax
      gsap.utils.toArray('.feature-img').forEach(img => {
        gsap.to(img, {
          yPercent: -15,
          ease: 'none',
          scrollTrigger: {
            trigger: img.closest('.bento-card'),
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.5
          }
        });
      });

      // ─── TESTIMONIAL SECTION ─────────────────────────────────────
      gsap.from('.testimonial-section .section-header', {
        scrollTrigger: {
          trigger: '.testimonial-section',
          start: 'top 80%',
        },
        opacity: 0, y: 40, duration: 0.8, ease: 'power3.out'
      });

      gsap.from('.testimonial-card', {
        scrollTrigger: {
          trigger: '.testimonial-grid',
          start: 'top 80%',
          toggleActions: 'play none none none'
        },
        opacity: 0,
        y: 60,
        rotateX: 8,
        transformOrigin: 'top center',
        duration: 0.9,
        stagger: 0.2,
        ease: 'power3.out'
      });

      // ─── CTA SECTION ─────────────────────────────────────────────
      gsap.from('.cta-wrapper', {
        scrollTrigger: {
          trigger: '.cta-section',
          start: 'top 80%',
        },
        opacity: 0,
        y: 80,
        scale: 0.94,
        duration: 1,
        ease: 'power3.out'
      });

      gsap.from('.cta-heading, .cta-paragraph, .cta-buttons', {
        scrollTrigger: {
          trigger: '.cta-section',
          start: 'top 75%',
        },
        opacity: 0,
        y: 30,
        duration: 0.8,
        stagger: 0.15,
        delay: 0.2,
        ease: 'power3.out'
      });

      // Glow orbs parallax
      gsap.to('.hero-glow-1', {
        y: -60, x: 30,
        ease: 'none',
        scrollTrigger: {
          trigger: '.hero-section',
          start: 'top top',
          end: 'bottom top',
          scrub: 2
        }
      });

      gsap.to('.hero-glow-2', {
        y: -80,
        ease: 'none',
        scrollTrigger: {
          trigger: '.hero-section',
          start: 'top top',
          end: 'bottom top',
          scrub: 2.5
        }
      });

      // Dashboard notification pop-in
      gsap.from('.dash-notification', {
        opacity: 0,
        x: 30,
        scale: 0.9,
        duration: 0.7,
        delay: 1.6,
        ease: 'back.out(1.7)'
      });

      // mini stat cards stagger
      gsap.from('.mini-stat', {
        opacity: 0,
        y: 20,
        scale: 0.9,
        duration: 0.6,
        stagger: 0.12,
        delay: 1.2,
        ease: 'back.out(1.4)'
      });

    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="landing-sections" ref={heroRef}>

      {/* A. HERO SECTION */}
      <section className="hero-section">
        <div className="hero-glow-1"></div>
        <div className="hero-glow-2"></div>
        <div className="hero-glow-3"></div>

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
                <a href="/signup">Get Started Free <ArrowRight size={18} /></a>
              </button>
              <button className="btn-hero-secondary">
                <PlayCircle size={20} /> Watch Demo
              </button>
            </div>

            <div className="hero-proof">
              <p className="proof-text">
                Built for professionals who want clarity on cashflow, budgets, and goals.
              </p>
            </div>
          </div>

          {/* Enhanced Hero Visual */}
          <div className="hero-visual">
            <div className="dashboard-wrapper">

              {/* Main Dashboard Card */}
              <div className="mockup-card glass-card">
                <div className="mockup-header">
                  <div className="mockup-dots"><span /><span /><span /></div>
                  <div className="mockup-title">Wealth Dashboard</div>
                </div>

                {/* Hero image inside the mockup */}
                <div className="mockup-hero-img">
                  <img
                    src="/assets/hero-dashboard.svg"
                    alt="Dashboard Preview"
                    className="feature-img"
                    onError={e => { e.target.style.display = 'none'; }}
                  />
                  <div className="mockup-body">
                    <div className="mockup-stat-row">
                      <div className="mockup-stat">
                        <span className="stat-label">Net Cashflow</span>
                        <span className="stat-val">$24,850</span>
                      </div>
                      <span className="mockup-badge-up">↑ +12.4%</span>
                    </div>
                    <div className="mockup-chart-placeholder">
                      <div className="chart-bar" style={{ height: '40%' }}></div>
                      <div className="chart-bar" style={{ height: '65%' }}></div>
                      <div className="chart-bar highlight" style={{ height: '85%' }}></div>
                      <div className="chart-bar" style={{ height: '55%' }}></div>
                      <div className="chart-bar" style={{ height: '72%' }}></div>
                      <div className="chart-bar" style={{ height: '90%' }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating notification card */}
              <div className="dash-notification glass-card">
                <div className="notif-icon">🎯</div>
                <div className="notif-text">
                  <span className="notif-title">Goal reached!</span>
                  <span className="notif-sub">Emergency fund 100%</span>
                </div>
              </div>

              {/* Mini stat cards */}
              <div className="mini-stats-row">
                <div className="mini-stat glass-card">
                  <TrendingUp size={16} className="mini-icon green" />
                  <div>
                    <div className="mini-val">$4,280</div>
                    <div className="mini-label">Saved this month</div>
                  </div>
                </div>
                <div className="mini-stat glass-card">
                  <Shield size={16} className="mini-icon blue" />
                  <div>
                    <div className="mini-val">99.9%</div>
                    <div className="mini-label">Uptime</div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* B. FEATURES SECTION */}
      <section id="features" className="features-section" ref={featureRef}>
        <div className="sections-container">
          <div className="section-header">
            <div className="section-eyebrow">Core Features</div>
            <h2 className="section-title">Financial Clarity, Redefined</h2>
            <p className="section-subtitle">Everything you need to manage your personal finances in one high-performance interface.</p>
          </div>

          <div className="bento-grid">
            {/* Card 1: Smart Budgeting */}
            <div className="bento-card card-large glass-card">
              <div className="card-top">
                <div className="card-icon-wrapper bg-emerald">
                  <Wallet size={24} />
                </div>
                <div className="card-info">
                  <h3>Smart Budgeting</h3>
                  <p>WealthFlow automatically categorizes your transactions and identifies spending patterns. Set limits that work around your actual lifestyle using predictive variables.</p>
                </div>
              </div>

              {/* Feature Image */}
              <div className="card-image-wrap">
                <img src="/assets/feature-budgeting.svg" alt="Budgeting" className="feature-img card-feat-img" onError={e => e.target.style.display='none'} />
              </div>

              <div className="card-widget">
                <div className="widget-row">
                  <span>Dining Out</span>
                  <span>$420 / $500</span>
                </div>
                <div className="progress-bar-container">
                  <div className="progress-bar-fill" style={{ width: '0%' }}></div>
                </div>
              </div>
            </div>

            {/* Card 2: Bill Reminders */}
            <div className="bento-card glass-card">
              <div className="card-icon-wrapper bg-blue">
                <Bell size={24} />
              </div>
              <div className="card-image-wrap small-img">
                <img src="/assets/feature-bills.svg" alt="Bill Reminders" className="feature-img" onError={e => e.target.style.display='none'} />
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
              <div className="card-image-wrap small-img">
                <img src="/assets/feature-goals.svg" alt="Goal Tracking" className="feature-img" onError={e => e.target.style.display='none'} />
              </div>
              <div className="card-info">
                <h3>Goal Tracking</h3>
                <p>Visualize milestones dynamically. Setup fractional investment paths for home down payments, travel funds, or early retirement.</p>
              </div>
              <div className="card-widget widget-center">
                <div className="circular-progress">
                  <div className="circular-inner">72%</div>
                </div>
              </div>
            </div>

            {/* Card 4: Security */}
            <div className="bento-card card-large glass-card security-card">
              <div className="card-top">
                <div className="card-icon-wrapper bg-dark">
                  <CheckCircle2 size={24} />
                </div>
                <div className="card-info">
                  <h3>Institutional-Grade Security</h3>
                  <p>AES-256 bank-level encryption, dual-layer authentication, and continuous penetration auditing — your data is locked down tight.</p>
                </div>
              </div>

              <div className="card-image-wrap">
                <img src="/assets/feature-security.svg" alt="Security" className="feature-img card-feat-img" onError={e => e.target.style.display='none'} />
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
      <section id="solutions" className="testimonial-section" ref={testimonialRef}>
        <div className="sections-container">
          <div className="section-header">
            <div className="section-eyebrow">Social Proof</div>
            <h2 className="section-title">Trusted by Modern Investors</h2>
            <p className="section-subtitle">See how forward-thinking professionals are taking control of their financial futures.</p>
          </div>

          <div className="testimonial-grid">
            <div className="testimonial-card glass-card">
              <div className="testimonial-stars">★★★★★</div>
              <p className="testimonial-text">"WealthFlow shifted how I visualize dynamic assets. The automated AI budgeting framework accurately forecasts month-end balances down to single-digit variances."</p>
              <div className="testimonial-profile">
                <div className="profile-img">JR</div>
                <div>
                  <h4 className="profile-name">James Richardson</h4>
                  <p className="profile-role">Product Manager</p>
                </div>
              </div>
            </div>

            <div className="testimonial-card glass-card testimonial-featured">
              <div className="testimonial-stars">★★★★★</div>
              <p className="testimonial-text">"The visual tracking updates allowed my family to accelerate a primary down payment window six months ahead of projection schedules. The visual reinforcement loop is incredible."</p>
              <div className="testimonial-profile">
                <div className="profile-img profile-alt">SL</div>
                <div>
                  <h4 className="profile-name">Sarah Lindholm</h4>
                  <p className="profile-role">Creative Director</p>
                </div>
              </div>
            </div>

            <div className="testimonial-card glass-card">
              <div className="testimonial-stars">★★★★★</div>
              <p className="testimonial-text">"Cleanest functional dashboard in the fintech space. No bloated overhead, zero-latency responsiveness, and persistent data connections throughout."</p>
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
      <section className="cta-section" ref={ctaRef}>
        <div className="sections-container">
          <div className="cta-wrapper">
            <div className="cta-glow"></div>
            <div className="cta-eyebrow">Get Started Today</div>
            <h2 className="cta-heading">Ready to Master Your Financial Flow?</h2>
            <p className="cta-paragraph">Join over 50,000 professionals managing their wealth with zero friction. Claim access to all tools immediately.</p>
            <div className="cta-buttons">
              <button className="btn-cta-light">
                <a href='/signup'>Create Free Account</a>
              </button>
              <button className="btn-cta-transparent">
                <a href='/contact_us'>Speak to Advisors</a>
              </button>
            </div>
            <div className="cta-logos">
              <span>🔒 Bank-level security</span>
              <span>·</span>
              <span>💳 No credit card required</span>
              <span>·</span>
              <span>⚡ Setup in 2 minutes</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}