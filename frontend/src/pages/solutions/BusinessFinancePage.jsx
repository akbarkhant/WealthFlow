import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import '../../styles/pages/BusinessFinancePage.css';

gsap.registerPlugin(ScrollTrigger);

const TOOLS = [
  {
    icon: '⬛',
    title: 'Expense categorisation',
    body: 'Every business transaction tagged to a category you define. Filter by vendor, team, or project.',
  },
  {
    icon: '⬛',
    title: 'Monthly P&L snapshot',
    body: 'Revenue minus expenses equals your net. Computed automatically each month-end.',
  },
  {
    icon: '⬛',
    title: 'Cash flow timeline',
    body: 'See incoming and outgoing cash plotted over 30, 60, or 90 days. Spot gaps before they hurt.',
  },
  {
    icon: '⬛',
    title: 'Export-ready reports',
    body: 'Download your data as CSV or PDF. Hand it to your accountant, your CFO, or import into your ERP.',
  },
];

const WHAT_NOT = [
  'Invoice generation or payment collection',
  'Payroll processing',
  'Tax filing or advisory',
  'Multi-user access controls (coming later)',
];

export default function BusinessFinancePage() {
  const rootRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {

      // ── Hero ──────────────────────────────────────────────────
      gsap.timeline({ defaults: { ease: 'expo.out' } })
        .from('.bf-badge',    { y: 20, opacity: 0, duration: 0.6 })
        .from('.bf-h1 span',  { y: '100%', duration: 1, stagger: 0.1 }, '-=0.2')
        .from('.bf-sub',      { y: 20, opacity: 0, duration: 0.7 }, '-=0.5')
        .from('.bf-hero-btns a', { y: 16, opacity: 0, duration: 0.5, stagger: 0.1 }, '-=0.4')
        .from('.bf-stat',     { scale: 0.9, opacity: 0, duration: 0.5, stagger: 0.1 }, '-=0.3');

      // ── Tools ─────────────────────────────────────────────────
      gsap.from('.bf-tool-card', {
        y: 60,
        opacity: 0,
        duration: 0.7,
        stagger: 0.15,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.bf-tools-section',
          start: 'top 70%',
        },
      });

      // ── Marquee pause on scroll ───────────────────────────────
      // (pure CSS animation, no GSAP needed)

      // ── What not section ─────────────────────────────────────
      gsap.from('.bf-not-title', {
        x: -60, opacity: 0, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: '.bf-not-section', start: 'top 75%' },
      });
      gsap.from('.bf-not-item', {
        x: -30, opacity: 0, duration: 0.6, stagger: 0.1,
        scrollTrigger: { trigger: '.bf-not-section', start: 'top 65%' },
      });

      // ── CTA ───────────────────────────────────────────────────
      gsap.from('.bf-cta-block', {
        y: 50, opacity: 0, duration: 1, ease: 'power3.out',
        scrollTrigger: { trigger: '.bf-cta-section', start: 'top 75%' },
      });

    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="bf-root" ref={rootRef}>

      {/* ── NAV ── */}
      <nav className="bf-nav">
        <span className="bf-nav-logo">MBMS</span>
        <div className="bf-nav-right">
          <span className="bf-nav-tag">Business</span>
          <a href="#start" className="bf-nav-cta">Get started</a>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="bf-hero">
        <div className="bf-hero-inner">
          <span className="bf-badge">Business Finance</span>
          <h1 className="bf-h1">
            <span>Business money,</span>
            <span>without the chaos.</span>
          </h1>
          <p className="bf-sub">
            Track what comes in, what goes out, and what's left — for your business. No accounting degree required.
          </p>
          <div className="bf-hero-btns">
            <a href="#start" className="bf-btn-primary">Start tracking</a>
            <a href="#tools" className="bf-btn-ghost">See what's included</a>
          </div>
        </div>

        <div className="bf-stats-row">
          {[
            { val: 'Real-time', label: 'Balance sync' },
            { val: 'Monthly', label: 'P&L reports' },
            { val: 'CSV / PDF', label: 'Export formats' },
          ].map(s => (
            <div key={s.label} className="bf-stat">
              <strong>{s.val}</strong>
              <span>{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── TOOLS ── */}
      <section className="bf-tools-section" id="tools">
        <div className="bf-tools-header">
          <p className="bf-section-eyebrow">What's included</p>
          <h2>Built for the basics — done right</h2>
        </div>
        <div className="bf-tools-grid">
          {TOOLS.map((t, i) => (
            <div key={i} className="bf-tool-card">
              <span className="bf-tool-num">0{i + 1}</span>
              <h3>{t.title}</h3>
              <p>{t.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── WHAT WE DON'T DO ── */}
      <section className="bf-not-section">
        <div className="bf-not-inner">
          <h2 className="bf-not-title">Not on the list</h2>
          <p className="bf-not-sub">
            We'd rather be honest about scope than over-promise and under-deliver.
          </p>
          <ul className="bf-not-list">
            {WHAT_NOT.map((item, i) => (
              <li key={i} className="bf-not-item">
                <span className="bf-not-x">✕</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="bf-not-accent" aria-hidden="true">
          <span>P&amp;L</span>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bf-cta-section" id="start">
        <div className="bf-cta-block">
          <h2>Your business finances. One tab.</h2>
          <p>Connect your accounts and get your first monthly report in minutes.</p>
          <a href="#start" className="bf-btn-primary bf-btn-lg">Create free account</a>
        </div>
      </section>

    </div>
  );
}