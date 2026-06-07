import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import '../../styles/pages/BankingSolutionPage.css';
import Navbar from '../../components/HomeComponents/Navbar';
import Footer from '../../components/HomeComponents/Footer';

gsap.registerPlugin(ScrollTrigger);

const FEATURES = [
  {
    num: '01',
    title: 'Multi-account tracking',
    body: 'Connect and monitor multiple bank accounts from a single dashboard. No switching tabs, no manual reconciliation.',
  },
  {
    num: '02',
    title: 'Transaction history',
    body: 'Every debit and credit logged with merchant name, category, and timestamp. Searchable and filterable.',
  },
  {
    num: '03',
    title: 'Balance snapshots',
    body: 'Daily end-of-day balances stored so you can chart cash flow over any period you choose.',
  },
  {
    num: '04',
    title: 'Secure read-only access',
    body: 'We pull data — we never push. Your credentials never leave your device. Bank-level TLS everywhere.',
  },
];

const HONEST = [
  { label: 'We do', text: 'Aggregate and display your banking data clearly.' },
  { label: 'We do', text: 'Alert you when balances drop below thresholds you set.' },
  { label: "We don't", text: 'Move money or initiate transfers of any kind.' },
  { label: "We don't", text: 'Sell your financial data to third parties.' },
];

export default function BankingSolutionPage() {
  const heroRef      = useRef(null);
  const featuresRef  = useRef(null);
  const honestRef    = useRef(null);
  const ctaRef       = useRef(null);
  const lineRef      = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {

      // ── Hero entrance ─────────────────────────────────────────
      const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      heroTl
        .from('.bs-hero-eyebrow', { y: 30, opacity: 0, duration: 0.7 })
        .from('.bs-hero-h1 .line', { y: '110%', duration: 0.9, stagger: 0.12 }, '-=0.3')
        .from('.bs-hero-sub',  { y: 20, opacity: 0, duration: 0.6 }, '-=0.4')
        .from('.bs-hero-cta',  { y: 20, opacity: 0, duration: 0.5 }, '-=0.3')
        .from('.bs-hero-card', { x: 60, opacity: 0, duration: 0.9, ease: 'power2.out' }, '-=0.6');

      // ── Vertical line draw ────────────────────────────────────
      gsap.from('.bs-line', {
        scaleY: 0,
        transformOrigin: 'top center',
        duration: 1.4,
        ease: 'power2.inOut',
        scrollTrigger: {
          trigger: '.bs-features-section',
          start: 'top 75%',
        },
      });

      // ── Feature rows stagger ─────────────────────────────────
      gsap.from('.bs-feature-row', {
        x: -50,
        opacity: 0,
        duration: 0.7,
        stagger: 0.15,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '.bs-features-section',
          start: 'top 65%',
        },
      });

      // ── Honest section ────────────────────────────────────────
      gsap.from('.bs-honest-title', {
        y: 40,
        opacity: 0,
        duration: 0.7,
        scrollTrigger: {
          trigger: '.bs-honest-section',
          start: 'top 75%',
        },
      });
      gsap.from('.bs-honest-row', {
        y: 30,
        opacity: 0,
        stagger: 0.12,
        duration: 0.6,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '.bs-honest-section',
          start: 'top 65%',
        },
      });

      // ── CTA section ───────────────────────────────────────────
      gsap.from('.bs-cta-inner', {
        y: 50,
        opacity: 0,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.bs-cta-section',
          start: 'top 75%',
        },
      });

    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="bs-root" ref={heroRef}>

      {/* ── NAV ── */}
        <Navbar />
      {/* ── HERO ── */}
      <section className="bs-hero">
        <div className="bs-hero-text">
          <p className="bs-hero-eyebrow">Banking Solution</p>
          <h1 className="bs-hero-h1">
            <span className="line">All your accounts.</span>
            <span className="line">One clear view.</span>
          </h1>
          <p className="bs-hero-sub">
            Connect your banks. See your balances, transactions, and cash flow — updated daily. Nothing more, nothing less.
          </p>
          <a href="#start" className="bs-hero-cta">Request early access</a>
        </div>

        <div className="bs-hero-card">
          <div className="bs-card-header">
            <span className="bs-card-dot bs-dot-green" />
            <span className="bs-card-dot bs-dot-amber" />
            <span className="bs-card-dot bs-dot-red" />
            <span className="bs-card-title">Account overview</span>
          </div>
          <div className="bs-card-accounts">
            {[
              { name: 'Checking ···4821', bal: '12,450.00', delta: '+240.00' },
              { name: 'Savings ···9103',  bal: '38,120.75', delta: '+1,200.00' },
              { name: 'Business ···0047', bal: '7,833.42',  delta: '-540.00' },
            ].map(a => (
              <div key={a.name} className="bs-account-row">
                <div className="bs-account-icon" />
                <div className="bs-account-info">
                  <span className="bs-account-name">{a.name}</span>
                  <span className="bs-account-bal">${a.bal}</span>
                </div>
                <span className={`bs-account-delta ${a.delta.startsWith('+') ? 'pos' : 'neg'}`}>
                  {a.delta}
                </span>
              </div>
            ))}
          </div>
          <div className="bs-card-footer">
            <span>Total liquid</span>
            <strong>$58,404.17</strong>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="bs-features-section" ref={featuresRef}>
        <div className="bs-line" ref={lineRef} />
        <div className="bs-features-inner">
          <p className="bs-section-label">What it does</p>
          {FEATURES.map(f => (
            <div key={f.num} className="bs-feature-row">
              <span className="bs-feature-num">{f.num}</span>
              <div className="bs-feature-body">
                <h3>{f.title}</h3>
                <p>{f.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── HONEST ── */}
      <section className="bs-honest-section" ref={honestRef}>
        <h2 className="bs-honest-title">Straight talk</h2>
        <div className="bs-honest-grid">
          {HONEST.map((h, i) => (
            <div key={i} className={`bs-honest-row ${h.label === 'We do' ? 'do' : 'dont'}`}>
              <span className="bs-honest-label">{h.label}</span>
              <p className="bs-honest-text">{h.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bs-cta-section" ref={ctaRef} id="start">
        <div className="bs-cta-inner">
          <h2>Ready to see everything in one place?</h2>
          <p>No demo calls. No pricing tiers hidden behind a form. Just your data, clean.</p>
          <a href="#start" className="bs-cta-btn">Get started free</a>
        </div>
      </section>
        <Footer />

    </div>
  );
}