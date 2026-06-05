import { useEffect, useRef } from 'react';
import { Sparkles, ArrowRight, PlayCircle, Wallet, Bell, Target, TrendingUp } from 'lucide-react';
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function Section() {
  const containerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      
      // 1. HERO ENTRANCE (Immediate execution)
      const heroTl = gsap.timeline({ delay: 0.2 });
      heroTl
        .from('.js-hero-fade', {
          opacity: 0,
          y: 30,
          duration: 0.8,
          stagger: 0.12,
          ease: 'power3.out'
        })
        .from('.js-hero-panel', {
          opacity: 0,
          x: 40,
          scale: 0.96,
          duration: 1,
          ease: 'power3.out'
        }, '-=0.5')
        .from('.js-chart-bar', {
          scaleY: 0,
          transformOrigin: 'bottom center',
          duration: 0.6,
          stagger: 0.06,
          ease: 'back.out(1.4)'
        }, '-=0.4');

      // Subtle loop for floating hero graphics
      gsap.to('.js-ambient-float', {
        y: -10,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });

      // Interactive Cashflow dynamic ticker
      const moneyCounter = { value: 18000 };
      gsap.to(moneyCounter, {
        value: 24850,
        duration: 2,
        delay: 0.4,
        ease: 'power4.out',
        onUpdate: () => {
          const el = document.querySelector('.js-live-counter');
          if (el) el.textContent = `$${Math.round(moneyCounter.value).toLocaleString()}`;
        }
      });

      // 2. CORE FEATURES SCROLL TRIGGER
      gsap.from('.js-header-trigger', {
        scrollTrigger: {
          trigger: '.js-features-section',
          start: 'top 80%',
          toggleActions: 'play none none none'
        },
        opacity: 0,
        y: 35,
        duration: 0.8,
        ease: 'power3.out'
      });

      gsap.from('.js-card-trigger', {
        scrollTrigger: {
          trigger: '.js-features-grid',
          start: 'top 82%',
          toggleActions: 'play none none none'
        },
        opacity: 0,
        y: 45,
        duration: 0.8,
        stagger: 0.12,
        ease: 'power3.out'
      });

      gsap.from('.js-progress-fill', {
        scrollTrigger: {
          trigger: '.js-features-grid',
          start: 'top 80%',
        },
        width: '0%',
        duration: 1.4,
        ease: 'power3.out'
      });

      // 3. TRUST & SOCIAL PROOF SCROLL TRIGGER
      gsap.from('.js-testimonial-card', {
        scrollTrigger: {
          trigger: '.js-testimonial-section',
          start: 'top 80%',
          toggleActions: 'play none none none'
        },
        opacity: 0,
        y: 35,
        stagger: 0.12,
        duration: 0.8,
        ease: 'power3.out'
      });

      // 4. CLOSING CTA SCROLL TRIGGER
      gsap.from('.js-cta-box', {
        scrollTrigger: {
          trigger: '.js-cta-section',
          start: 'top 85%',
          toggleActions: 'play none none none'
        },
        opacity: 0,
        scale: 0.96,
        y: 40,
        duration: 0.85,
        ease: 'power4.out'
      });

    }, containerRef);

    return () => ctx.revert();
  }, []);

  // ─── DESIGN SYSTEM VARIABLES MAPPING ─────────────────────────────
  const styles = {
    wrapper: {
      backgroundColor: 'var(--color-background)',
      color: 'var(--color-on-surface)',
      minHeight: '100vh',
      fontFamily: 'var(--font-sans)',
      overflowX: 'hidden',
      position: 'relative',
      padding: '0 var(--space-6)',
      transition: 'background-color var(--transition-base), color var(--transition-base)'
    },
    container: {
      maxWidth: 'var(--content-max-width)',
      margin: '0 auto',
      position: 'relative',
      zIndex: 2
    },
    heroGrid: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 'var(--space-12)',
      alignItems: 'center',
      padding: '120px 0 var(--space-12) 0',
    },
    badge: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 'var(--space-2)',
      padding: '6px var(--space-3)',
      borderRadius: 'var(--radius-full)',
      backgroundColor: 'var(--color-surface-container-high)',
      color: 'var(--color-primary)',
      fontSize: '13px',
      fontWeight: '600',
      marginBottom: 'var(--space-6)',
      border: '1px solid var(--color-outline-variant)'
    },
    title: {
      fontSize: 'clamp(2.5rem, 5vw, 3.5rem)',
      fontWeight: '800',
      lineHeight: '1.15',
      color: 'var(--color-on-surface)',
      margin: '0 0 var(--space-5) 0',
      letterSpacing: '-0.02em'
    },
    gradientText: {
      color: 'var(--color-primary)'
    },
    description: {
      color: 'var(--color-on-surface-variant)',
      fontSize: '18px',
      lineHeight: '1.6',
      maxWidth: '540px',
      margin: '0 0 var(--space-8) 0'
    },
    btnStack: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 'var(--space-4)',
      marginBottom: 'var(--space-8)'
    },
    primaryBtn: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 'var(--space-2)',
      padding: '14px var(--space-8)',
      borderRadius: 'var(--radius-lg)',
      backgroundColor: 'var(--color-primary)',
      color: 'var(--color-on-primary)',
      fontWeight: '600',
      textDecoration: 'none',
      boxShadow: 'var(--shadow-primary)',
      transition: 'background-color var(--transition-fast)',
    },
    secondaryBtn: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 'var(--space-2)',
      padding: '14px var(--space-8)',
      borderRadius: 'var(--radius-lg)',
      backgroundColor: 'var(--color-surface-container-lowest)',
      border: '1px solid var(--color-outline-variant)',
      color: 'var(--color-on-surface)',
      fontWeight: '600',
      cursor: 'pointer',
      boxShadow: 'var(--shadow-xs)',
    },
    mockupCard: {
      backgroundColor: 'var(--glass-bg)',
      backdropFilter: 'var(--glass-backdrop)',
      border: '1px solid var(--glass-border)',
      borderRadius: 'var(--radius-2xl)',
      padding: 'var(--space-8)',
      boxShadow: 'var(--shadow-lg)',
      position: 'relative',
      width: '100%',
      maxWidth: '500px',
      margin: '0 auto'
    },
    chartContainer: {
      height: '140px',
      display: 'flex',
      alignItems: 'end',
      justifyContent: 'space-between',
      gap: 'var(--space-3)',
      paddingTop: 'var(--space-6)',
      borderBottom: '1px solid var(--color-outline-variant)'
    },
    featuresGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: 'var(--space-8)',
      marginTop: 'var(--space-10)',
      paddingBottom: 'var(--space-12)'
    },
    featureCard: {
      backgroundColor: 'var(--color-surface-container-lowest)',
      border: '1px solid var(--color-outline-variant)',
      borderRadius: 'var(--radius-xl)',
      padding: 'var(--space-8)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      gap: 'var(--space-10)',
      boxShadow: 'var(--shadow-sm)'
    }
  };

  return (
    <div ref={containerRef} style={styles.wrapper}>
      
      {/* DECORATIVE LIGHT REFRACTION GLOW */}
      <div style={{ position: 'absolute', top: 0, left: '15%', width: '600px', height: '600px', backgroundColor: 'var(--color-surface-container-high)', borderRadius: 'var(--radius-full)', filter: 'blur(140px)', pointerEvents: 'none', opacity: 0.6 }} />

      {/* A. HERO SECTION */}
      <section style={styles.container}>
        <div style={styles.heroGrid}>
          
          {/* Content Column */}
          <div style={{ flex: '1 1 500px', minWidth: '320px' }}>
            <div className="js-hero-fade" style={styles.badge}>
              <Sparkles size={13} />
              <span>New: AI-Powered Wealth Insights</span>
            </div>

            <h1 className="js-hero-fade" style={styles.title}>
              Master Your Money <br />
              with <span style={styles.gradientText}>Intelligent</span> Flow
            </h1>

            <p className="js-hero-fade" style={styles.description}>
              WealthFlow brings institutional-grade financial tracking to your pocket. Automated budgeting, real-time goal monitoring, and smart reminders built for modern professionals.
            </p>

            <div className="js-hero-fade" style={styles.btnStack}>
              <a href="/signup" style={styles.primaryBtn}>
                Get Started Free <ArrowRight size={16} />
              </a>
              <button type="button" style={styles.secondaryBtn}>
                <PlayCircle size={18} /> Watch Demo
              </button>
            </div>
          </div>

          {/* Interface Visual Column */}
          <div className="js-hero-panel" style={{ flex: '1 1 450px', position: 'relative' }}>
            <div className="js-ambient-float" style={styles.mockupCard}>
              
              <div style={{ display: 'flex', gap: '6px', marginBottom: 'var(--space-6)' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--color-error)' }} />
                <span style={{ width: '10px', height: '10px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--color-warning)' }} />
                <span style={{ width: '10px', height: '10px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--color-success)' }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: 'var(--space-4)' }}>
                <div>
                  <p style={{ textTransform: 'uppercase', fontSize: '11px', color: 'var(--color-secondary)', margin: 0, letterSpacing: '1px', fontWeight: '700' }}>Net Cashflow</p>
                  <h3 className="js-live-counter" style={{ fontSize: '36px', fontWeight: '800', margin: '4px 0 0 0', color: 'var(--color-on-surface)', letterSpacing: '-0.03em' }}>$18,000</h3>
                </div>
                <span style={{ padding: '4px var(--space-2)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-surface-container-high)', color: 'var(--color-income)', fontSize: '12px', fontWeight: '700' }}>↑ +12.4%</span>
              </div>

              <div style={styles.chartContainer}>
                <div className="js-chart-bar" style={{ width: '13%', backgroundColor: 'var(--color-surface-container-high)', borderRadius: '4px 4px 0 0', height: '40%' }} />
                <div className="js-chart-bar" style={{ width: '13%', backgroundColor: 'var(--color-surface-container-high)', borderRadius: '4px 4px 0 0', height: '65%' }} />
                <div className="js-chart-bar" style={{ width: '13%', backgroundColor: 'var(--color-tertiary)', borderRadius: '4px 4px 0 0', height: '85%' }} />
                <div className="js-chart-bar" style={{ width: '13%', backgroundColor: 'var(--color-surface-container-high)', borderRadius: '4px 4px 0 0', height: '55%' }} />
                <div className="js-chart-bar" style={{ width: '13%', backgroundColor: 'var(--color-surface-container-high)', borderRadius: '4px 4px 0 0', height: '72%' }} />
                <div className="js-chart-bar" style={{ width: '13%', backgroundColor: 'var(--color-primary)', borderRadius: '4px 4px 0 0', height: '90%' }} />
              </div>

              {/* Floated Badge */}
              <div style={{ position: 'absolute', bottom: '-15px', left: '-15px', backgroundColor: 'var(--color-surface-container-lowest)', border: '1px solid var(--color-outline-variant)', borderRadius: 'var(--radius-lg)', padding: '12px var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)', boxShadow: 'var(--shadow-md)' }}>
                <TrendingUp size={16} color="var(--color-success)" />
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--color-secondary)' }}>Saved this month</div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--color-on-surface)' }}>$4,280</div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* B. FEATURES SECTION */}
      <section id="features" className="js-features-section" style={{ ...styles.container, padding: 'var(--space-10) 0' }}>
        <div className="js-header-trigger" style={{ textAlign: 'center', marginBottom: 'var(--space-10)' }}>
          <p style={{ color: 'var(--color-primary)', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '2px', margin: '0 0 var(--space-2) 0' }}>Core Features</p>
          <h2 style={{ fontSize: '36px', fontWeight: '700', color: 'var(--color-on-surface)', margin: '0 0 var(--space-3) 0', letterSpacing: '-0.01em' }}>Financial Clarity, Redefined</h2>
          <p style={{ color: 'var(--color-secondary)', fontSize: '16px', maxWidth: '600px', margin: '0 auto', lineHeight: '1.5' }}>Everything you need to manage your personal finances in one interface.</p>
        </div>

        <div className="js-features-grid" style={styles.featuresGrid}>
          
          {/* Card 1 */}
          <div className="js-card-trigger" style={styles.featureCard}>
            <div>
              <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--color-surface-container-low)', color: 'var(--color-income)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 'var(--space-5)' }}>
                <Wallet size={22} />
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: '700', margin: '0 0 var(--space-2) 0', color: 'var(--color-on-surface)' }}>Smart Budgeting</h3>
              <p style={{ fontSize: '14px', color: 'var(--color-on-surface-variant)', lineHeight: '1.6', margin: 0 }}>Automatically categorize your spend patterns and monitor lifestyle adjustments flawlessly.</p>
            </div>
            <div style={{ padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--color-surface-container-low)', border: '1px solid var(--color-outline-variant)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: 'var(--space-2)' }}><span style={{ color: 'var(--color-secondary)' }}>Dining Out</span><span style={{ color: 'var(--color-on-surface)', fontWeight: '600' }}>$420 / $500</span></div>
              <div style={{ height: '6px', backgroundColor: 'var(--color-surface-container-high)', borderRadius: '3px', overflow: 'hidden' }}>
                <div className="js-progress-fill" style={{ height: '100%', backgroundColor: 'var(--color-primary)', width: '84%' }} />
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="js-card-trigger" style={styles.featureCard}>
            <div>
              <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--color-surface-container-low)', color: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 'var(--space-5)' }}>
                <Bell size={22} />
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: '700', margin: '0 0 var(--space-2) 0', color: 'var(--color-on-surface)' }}>Bill Reminders</h3>
              <p style={{ fontSize: '14px', color: 'var(--color-on-surface-variant)', lineHeight: '1.6', margin: 0 }}>Predictive system trackers alert you ahead of external premium schedules to bypass late fees.</p>
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', padding: '10px var(--space-4)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-surface-container-high)', border: '1px solid var(--color-outline-variant)', color: 'var(--color-warning)', fontSize: '13px', fontWeight: '600' }}>
              <span style={{ width: '6px', height: '6px', backgroundColor: 'var(--color-warning)', borderRadius: 'var(--radius-full)' }} />
              <span style={{ color: 'var(--color-on-surface)' }}>Subscription renewal in 2 days</span>
            </div>
          </div>

          {/* Card 3 */}
          <div className="js-card-trigger" style={styles.featureCard}>
            <div>
              <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--color-surface-container-low)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 'var(--space-5)' }}>
                <Target size={22} />
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: '700', margin: '0 0 var(--space-2) 0', color: 'var(--color-on-surface)' }}>Goal Tracking</h3>
              <p style={{ fontSize: '14px', color: 'var(--color-on-surface-variant)', lineHeight: '1.6', margin: 0 }}>Dynamically visualize targets. Establish fractional asset loops for homes or early retirement maps.</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-full)', border: '2px solid var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700', color: 'var(--color-primary)' }}>72%</div>
              <span style={{ fontSize: '13px', color: 'var(--color-on-surface)', fontWeight: '500' }}>Retirement Target Reached</span>
            </div>
          </div>

        </div>
      </section>

      {/* C. TESTIMONIALS SECTION */}
      <section className="js-testimonial-section" style={{ ...styles.container, padding: 'var(--space-6) 0 var(--space-12) 0' }}>
        <h2 style={{ textAlign: 'center', fontSize: '32px', fontWeight: '700', margin: '0 0 var(--space-10) 0', color: 'var(--color-on-surface)' }}>Trusted by Modern Investors</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-8)' }}>
          {[
            { text: '"WealthFlow shifted how I visualize dynamic assets. The automated AI framework accurately forecasts month-end balances."', author: "James Richardson", role: "Product Manager" },
            { text: '"The visual reinforcement loops allowed my family to accelerate a primary down payment window six months ahead of schedule."', author: "Sarah Lindholm", role: "Creative Director" },
            { text: '"Cleanest functional dashboard in the fintech space. No bloated overhead, and persistent zero-latency connections throughout."', author: "David Kross", role: "Software Engineer" }
          ].map((t, i) => (
            <div key={i} className="js-testimonial-card" style={{ padding: 'var(--space-8)', borderRadius: 'var(--radius-xl)', backgroundColor: 'var(--color-surface-container-low)', border: '1px solid var(--color-outline-variant)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 'var(--space-8)', boxShadow: 'var(--shadow-xs)' }}>
              <p style={{ fontSize: '14px', color: 'var(--color-on-surface-variant)', lineHeight: '1.6', margin: 0, fontStyle: 'italic' }}>{t.text}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '700' }}>{t.author[0]}</div>
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: '700', margin: 0, color: 'var(--color-on-surface)' }}>{t.author}</h4>
                  <p style={{ fontSize: '12px', color: 'var(--color-secondary)', margin: 0 }}>{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* D. CTA SECTION */}
      <section className="js-cta-section" style={{ ...styles.container, padding: 'var(--space-4) 0 var(--space-12) 0' }}>
        <div className="js-cta-box" style={{ padding: '80px var(--space-6)', borderRadius: 'var(--radius-2xl)', background: 'linear-gradient(to bottom, var(--color-surface-container-low), var(--color-surface-container-high))', border: '1px solid var(--color-outline-variant)', textAlign: 'center', boxShadow: 'var(--shadow-md)' }}>
          <h2 style={{ fontSize: '36px', fontWeight: '800', margin: '0 0 var(--space-4) 0', color: 'var(--color-on-surface)', letterSpacing: '-0.02em' }}>Ready to Master Your Financial Flow?</h2>
          <p style={{ color: 'var(--color-on-surface-variant)', fontSize: '17px', maxWidth: '500px', margin: '0 auto var(--space-10) auto', lineHeight: '1.6' }}>Join over 50,000 users building clean capital habits with absolute transparency.</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
            <a href="/signup" style={styles.primaryBtn}>Create Free Account</a>
            <a href="/contact_us" style={{ ...styles.secondaryBtn, textDecoration: 'none' }}>Speak to Advisors</a>
          </div>
        </div>
      </section>

    </div>
  );
}