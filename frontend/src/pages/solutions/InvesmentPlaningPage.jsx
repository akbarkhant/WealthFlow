import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import '../../styles/pages/InvesmentPlanningPage.css';

gsap.registerPlugin(ScrollTrigger);

const WHAT_WE_TRACK = [
  {
    title: 'Goal-based saving',
    body: 'Define a savings target — down payment, emergency fund, retirement contribution. Track how close you are.',
  },
  {
    title: 'Net worth snapshot',
    body: 'Assets minus liabilities. Updated each time you log a transaction or adjust a balance.',
  },
  {
    title: 'Cash surplus tracking',
    body: "How much is left after expenses? We surface your monthly surplus so you know what's available to allocate.",
  },
  {
    title: 'Historical trends',
    body: 'Month-over-month savings rate, income growth, and expense patterns — charted clearly.',
  },
];

const HONEST_SCOPE = [
  { canDo: true,  text: 'Track savings progress toward investment goals' },
  { canDo: true,  text: 'Show you monthly surplus available to invest' },
  { canDo: true,  text: 'Monitor net worth over time' },
  { canDo: false, text: 'Execute trades or manage a brokerage account' },
  { canDo: false, text: 'Provide financial advice or portfolio recommendations' },
  { canDo: false, text: 'Connect to investment platforms like Zerodha or Robinhood' },
];

export default function InvestmentPlanningPage() {
  const rootRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {

      // ── Hero entrance ─────────────────────────────────────────
      gsap.timeline({ defaults: { ease: 'power4.out' } })
        .from('.ip-tag',         { y: 20, opacity: 0, duration: 0.6 })
        .from('.ip-h1 em',       { y: '100%', duration: 0.9, stagger: 0.1 }, '-=0.3')
        .from('.ip-hero-p',      { y: 20, opacity: 0, duration: 0.7 }, '-=0.4')
        .from('.ip-hero-btn',    { y: 14, opacity: 0, duration: 0.5 }, '-=0.3')
        .from('.ip-meter-block', { x: 40, opacity: 0, duration: 0.9, ease: 'power2.out' }, '-=0.5');

      // Animate the meter bars on load
      gsap.from('.ip-bar-fill', {
        scaleX: 0,
        transformOrigin: 'left center',
        duration: 1.2,
        stagger: 0.15,
        ease: 'power3.out',
        delay: 1,
      });

      // ── What we track ─────────────────────────────────────────
      gsap.from('.ip-track-label', {
        opacity: 0, y: 30, duration: 0.7,
        scrollTrigger: { trigger: '.ip-track-section', start: 'top 75%' },
      });
      gsap.from('.ip-track-card', {
        y: 50, opacity: 0, duration: 0.7, stagger: 0.13, ease: 'power2.out',
        scrollTrigger: { trigger: '.ip-track-section', start: 'top 65%' },
      });

      // ── Scope table ───────────────────────────────────────────
      gsap.from('.ip-scope-title', {
        x: -40, opacity: 0, duration: 0.8,
        scrollTrigger: { trigger: '.ip-scope-section', start: 'top 75%' },
      });
      gsap.from('.ip-scope-row', {
        x: -20, opacity: 0, stagger: 0.1, duration: 0.5,
        scrollTrigger: { trigger: '.ip-scope-section', start: 'top 65%' },
      });

      // ── CTA ───────────────────────────────────────────────────
      gsap.from('.ip-cta-content', {
        y: 60, opacity: 0, duration: 1, ease: 'power3.out',
        scrollTrigger: { trigger: '.ip-cta-section', start: 'top 80%' },
      });

    }, rootRef);

    return () => ctx.revert();
  }, []);

  const goals = [
    { label: 'Emergency fund',  pct: 74, amt: '₹3,70,000', target: '₹5,00,000' },
    { label: 'House down payment', pct: 38, amt: '₹7,60,000', target: '₹20,00,000' },
    { label: 'Annual travel',   pct: 91, amt: '₹91,000', target: '₹1,00,000' },
  ];

  return (
    <div className="ip-root" ref={rootRef}>

      {/* ── NAV ── */}
      <nav className="ip-nav">
        <span className="ip-nav-logo">MBMS</span>
        <div className="ip-nav-links">
          <a href="#track" className="ip-nav-a">Features</a>
          <a href="#scope" className="ip-nav-a">Scope</a>
          <a href="#start" className="ip-nav-cta">Start free</a>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="ip-hero">
        <div className="ip-hero-left">
          <span className="ip-tag">Investment Planning</span>
          <h1 className="ip-h1">
            <em>Plan</em>{' '}
            <em>your</em>{' '}
            <em>financial</em>{' '}
            <em>future.</em>
          </h1>
          <p className="ip-hero-p">
            We help you understand how much you're saving, whether you're on track for your goals, and what your net worth looks like — month by month.
          </p>
          <a href="#start" className="ip-hero-btn">Plan my finances</a>
        </div>

        {/* Goal meter mockup */}
        <div className="ip-meter-block">
          <p className="ip-meter-label">Savings goals</p>
          {goals.map((g, i) => (
            <div key={i} className="ip-goal-row">
              <div className="ip-goal-meta">
                <span className="ip-goal-name">{g.label}</span>
                <span className="ip-goal-pct">{g.pct}%</span>
              </div>
              <div className="ip-bar-track">
                <div
                  className="ip-bar-fill"
                  style={{ width: `${g.pct}%` }}
                />
              </div>
              <div className="ip-goal-amounts">
                <span>{g.amt}</span>
                <span className="ip-goal-target">of {g.target}</span>
              </div>
            </div>
          ))}
          <div className="ip-meter-footer">
            <span>Net worth this month</span>
            <strong>₹42,18,500</strong>
          </div>
        </div>
      </section>

      {/* ── WHAT WE TRACK ── */}
      <section className="ip-track-section" id="track">
        <p className="ip-track-label">What we track</p>
        <div className="ip-track-grid">
          {WHAT_WE_TRACK.map((w, i) => (
            <div key={i} className="ip-track-card">
              <span className="ip-track-idx">{String(i + 1).padStart(2, '0')}</span>
              <h3>{w.title}</h3>
              <p>{w.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── SCOPE ── */}
      <section className="ip-scope-section" id="scope">
        <h2 className="ip-scope-title">Our honest scope</h2>
        <p className="ip-scope-sub">
          We're a financial tracking tool — not a broker, not an advisor.
        </p>
        <div className="ip-scope-table">
          {HONEST_SCOPE.map((row, i) => (
            <div key={i} className={`ip-scope-row ${row.canDo ? 'can' : 'cannot'}`}>
              <span className="ip-scope-icon">{row.canDo ? '✓' : '✕'}</span>
              <span>{row.text}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="ip-cta-section" id="start">
        <div className="ip-cta-content">
          <h2>Start planning. Stop guessing.</h2>
          <p>Connect your accounts and see your first net worth snapshot within minutes.</p>
          <a href="#start" className="ip-cta-btn">Create free account</a>
        </div>
      </section>

    </div>
  );
}