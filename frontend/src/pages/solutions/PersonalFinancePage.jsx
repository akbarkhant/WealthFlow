import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import '../../styles/pages/PersonalFinancePage.css';

gsap.registerPlugin(ScrollTrigger);

const PILLARS = [
  {
    emoji: '💸',
    title: 'Spend tracking',
    body: 'Log every expense and categorise it. Know exactly where your money goes each month.',
  },
  {
    emoji: '🎯',
    title: 'Savings goals',
    body: 'Set a target, track contributions, and watch your progress bar fill up. Nothing fancier needed.',
  },
  {
    emoji: '📊',
    title: 'Monthly reports',
    body: 'Income vs expenses, net savings, top spending categories — delivered as a clean monthly summary.',
  },
  {
    emoji: '🔔',
    title: 'Balance alerts',
    body: 'Get notified when a balance drops below a threshold you define. Simple, not noisy.',
  },
];

const FLOW = [
  { step: '1', label: 'Connect your accounts' },
  { step: '2', label: 'Tag your transactions' },
  { step: '3', label: 'Review your monthly report' },
  { step: '4', label: 'Adjust and repeat' },
];

export default function PersonalFinancePage() {
  const rootRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {

      // ── Hero ──────────────────────────────────────────────────
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      tl
        .from('.pf-eyebrow',     { y: 24, opacity: 0, duration: 0.6 })
        .from('.pf-h1 .word',    { y: '110%', duration: 0.9, stagger: 0.08 }, '-=0.2')
        .from('.pf-hero-body',   { y: 20, opacity: 0, duration: 0.7 }, '-=0.4')
        .from('.pf-hero-action', { y: 16, opacity: 0, duration: 0.5, stagger: 0.1 }, '-=0.3')
        .from('.pf-hero-note',   { opacity: 0, duration: 0.5 }, '-=0.2');

      // ── Pillars pin ───────────────────────────────────────────
      gsap.from('.pf-pillar', {
        y: 50,
        opacity: 0,
        duration: 0.7,
        stagger: 0.13,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '.pf-pillars',
          start: 'top 72%',
        },
      });

      // ── Flow steps draw in ────────────────────────────────────
      gsap.from('.pf-flow-step', {
        scale: 0.85,
        opacity: 0,
        duration: 0.6,
        stagger: 0.15,
        ease: 'back.out(1.6)',
        scrollTrigger: {
          trigger: '.pf-flow-section',
          start: 'top 70%',
        },
      });

      // Connecting line draws left to right
      gsap.from('.pf-flow-line', {
        scaleX: 0,
        transformOrigin: 'left center',
        duration: 1.2,
        ease: 'power2.inOut',
        scrollTrigger: {
          trigger: '.pf-flow-section',
          start: 'top 65%',
        },
      });

      // ── Quote section ─────────────────────────────────────────
      gsap.from('.pf-quote', {
        y: 40,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.pf-quote-section',
          start: 'top 75%',
        },
      });

      // ── CTA ───────────────────────────────────────────────────
      gsap.from(['.pf-cta-h', '.pf-cta-p', '.pf-cta-a'], {
        y: 30,
        opacity: 0,
        duration: 0.7,
        stagger: 0.1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '.pf-cta',
          start: 'top 78%',
        },
      });

    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="pf-root" ref={rootRef}>

      {/* ── NAV ── */}
      <nav className="pf-nav">
        <span className="pf-nav-logo">MBMS</span>
        <a href="#go" className="pf-nav-link">Start for free</a>
      </nav>

      {/* ── HERO ── */}
      <section className="pf-hero">
        <p className="pf-eyebrow">Personal Finance</p>
        <h1 className="pf-h1">
          {['Know', 'your', 'money.', 'Actually', 'know', 'it.'].map((w, i) => (
            <span key={i} className="word-wrap">
              <span className="word">{w}</span>
            </span>
          ))}
        </h1>
        <p className="pf-hero-body">
          Track spending, set savings goals, and read a monthly report you actually understand. No financial jargon, no overwhelm.
        </p>
        <div className="pf-hero-actions">
          <a href="#go" className="pf-hero-action pf-btn-main">Get started free</a>
          <a href="#what" className="pf-hero-action pf-btn-soft">What's included ↓</a>
        </div>
        <p className="pf-hero-note">No credit card. No subscription required to start.</p>

        {/* Decorative balance strip */}
        <div className="pf-balance-strip">
          {[
            { label: 'Groceries',   amt: '-₹2,400', cat: 'expense' },
            { label: 'Salary',      amt: '+₹85,000', cat: 'income' },
            { label: 'Rent',        amt: '-₹18,000', cat: 'expense' },
            { label: 'Emergency fund', amt: '+₹5,000', cat: 'income' },
          ].map((tx, i) => (
            <div key={i} className={`pf-tx-pill pf-tx-${tx.cat}`}>
              <span className="pf-tx-label">{tx.label}</span>
              <span className="pf-tx-amt">{tx.amt}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── PILLARS ── */}
      <section className="pf-pillars" id="what">
        <p className="pf-section-eye">What you get</p>
        <div className="pf-pillars-grid">
          {PILLARS.map((p, i) => (
            <div key={i} className="pf-pillar">
              <span className="pf-pillar-emoji">{p.emoji}</span>
              <h3>{p.title}</h3>
              <p>{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FLOW ── */}
      <section className="pf-flow-section">
        <h2 className="pf-flow-title">How it works</h2>
        <div className="pf-flow-track">
          <div className="pf-flow-line" />
          {FLOW.map((f, i) => (
            <div key={i} className="pf-flow-step">
              <div className="pf-flow-circle">{f.step}</div>
              <p>{f.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── QUOTE ── */}
      <section className="pf-quote-section">
        <blockquote className="pf-quote">
          <p>"Most finance apps try to do everything. We just try to do the basics exceptionally well."</p>
          <cite>— The MBMS philosophy</cite>
        </blockquote>
      </section>

      {/* ── CTA ── */}
      <section className="pf-cta" id="go">
        <h2 className="pf-cta-h">Ready to actually know your money?</h2>
        <p className="pf-cta-p">Takes two minutes to connect your first account.</p>
        <a href="#go" className="pf-cta-a">Begin now</a>
      </section>

    </div>
  );
}