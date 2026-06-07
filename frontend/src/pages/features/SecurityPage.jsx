import { useState } from 'react';
import  Footer from '../../components/HomeComponents/Footer';
import './SecurityPage.css';

/* ── Icons ── */
const IconShield = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="m9 12 2 2 4-4" />
  </svg>
);
const IconKey = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="7.5" cy="15.5" r="5.5" /><path d="m21 2-9.6 9.6" /><path d="m15.5 7.5 3 3L22 7l-3-3" />
  </svg>
);
const IconEye = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
  </svg>
);
const IconAlertTriangle = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);
const IconScroll = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
  </svg>
);
const IconGlobe = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);
const IconArrowRight = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
  </svg>
);

/* ── Data ── */
const certifications = [
  { label: 'AES-256', sub: 'Encryption at rest', color: 'green' },
  { label: 'TLS 1.3', sub: 'In-transit security', color: 'green' },
  { label: 'SOC 2 Type II', sub: 'Audited annually', color: 'gold' },
  { label: 'ISO 27001', sub: 'Info-sec standard', color: 'blue' },
  { label: 'PCI-DSS L1', sub: 'Payment security', color: 'gold' },
  { label: 'GDPR', sub: 'EU data compliance', color: 'blue' },
];

const threatLog = [
  {
    status: 'safe',
    title: 'Login verified',
    detail: 'Face ID authentication from your iPhone — 09:14 AM, London',
    time: '9:14 AM',
  },
  {
    status: 'warn',
    title: 'Unusual location blocked',
    detail: 'Login attempt from Bucharest, Romania — automatically denied',
    time: '11:32 AM',
  },
  {
    status: 'safe',
    title: 'Transaction cleared',
    detail: '$249 at Apple Store — verified by push notification',
    time: '2:07 PM',
  },
  {
    status: 'info',
    title: 'Dark-web scan complete',
    detail: 'No credential exposure found in latest scan',
    time: '4:00 PM',
  },
];

const extraFeatures = [
  {
    icon: <IconKey />,
    title: 'Passwordless login',
    desc: 'Face ID, Touch ID, or hardware keys. Passwords are a vulnerability — we don\'t need them.',
    color: 'green',
  },
  {
    icon: <IconScroll />,
    title: 'Full audit logs',
    desc: 'Every action on your account is timestamped with IP, device, and location. Total transparency.',
    color: 'gold',
  },
  {
    icon: <IconGlobe />,
    title: 'Zero-knowledge design',
    desc: 'We can\'t read your data. Even our engineers have no access to your private information.',
    color: 'blue',
  },
];

/* ── Sub-components ── */
function CertBadge({ label, sub, color }) {
  return (
    <div className={`sp-cert sp-cert--${color}`}>
      <span className="sp-cert-label">{label}</span>
      <span className="sp-cert-sub">{sub}</span>
    </div>
  );
}

function ThreatRow({ status, title, detail, time }) {
  return (
    <div className={`sp-threat-row sp-threat-row--${status}`}>
      <div className={`sp-threat-dot sp-threat-dot--${status}`} />
      <div className="sp-threat-body">
        <div className="sp-threat-title">{title}</div>
        <div className="sp-threat-detail">{detail}</div>
      </div>
      <span className="sp-threat-time">{time}</span>
    </div>
  );
}

function FeatureCard({ icon, title, desc, color }) {
  return (
    <div className="sp-feature-card">
      <div className={`sp-feature-icon sp-feature-icon--${color}`}>{icon}</div>
      <h3 className="sp-feature-title">{title}</h3>
      <p className="sp-feature-desc">{desc}</p>
    </div>
  );
}

/* ── Page ── */
export default function SecurityPage() {
  const [activePanel, setActivePanel] = useState('threat');

  return (
    <div className="sp-root">

      {/* ── Hero ── */}
      <section className="sp-hero">
        <div className="sp-hero-inner">
          <div className="sp-eyebrow">
            <span>🛡️</span> Feature — Advanced Security
          </div>

          <h1 className="sp-hero-title">
            Your money, <em>fortress-grade</em> protection
          </h1>

          <p className="sp-hero-sub">
            WealthFlow employs the same security standards as the world's largest banks,
            layered with AI-driven fraud detection running 24 hours a day, 7 days a week.
          </p>

          <div className="sp-hero-actions">
            <button className="sp-btn-primary">
              Get started securely
              <span className="sp-btn-arrow"><IconArrowRight /></span>
            </button>
            <button className="sp-btn-outline">Read security whitepaper</button>
          </div>

          {/* Trust indicators */}
          <div className="sp-trust-row">
            <div className="sp-trust-item">
              <span className="sp-trust-val">256-bit</span>
              <span className="sp-trust-lbl">AES encryption</span>
            </div>
            <div className="sp-trust-div" />
            <div className="sp-trust-item">
              <span className="sp-trust-val">99.99%</span>
              <span className="sp-trust-lbl">Uptime SLA</span>
            </div>
            <div className="sp-trust-div" />
            <div className="sp-trust-item">
              <span className="sp-trust-val">200ms</span>
              <span className="sp-trust-lbl">Fraud detection latency</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Container ── */}
      <div className="sp-container">

        {/* ── Split: Certs + Live threat ── */}
        <div className="sp-split">

          {/* Left — certifications + panel toggle */}
          <div className="sp-left">
            <h2 className="sp-block-title">Military-grade encryption</h2>
            <p className="sp-block-body">
              All data is encrypted with AES-256 at rest and TLS 1.3 in transit.
              Your credentials are never stored — only salted cryptographic hashes exist on our servers.
            </p>

            <div className="sp-certs-grid">
              {certifications.map(c => <CertBadge key={c.label} {...c} />)}
            </div>

            <div className="sp-panel-tabs">
              <button
                className={`sp-panel-tab ${activePanel === 'threat' ? 'sp-panel-tab--active' : ''}`}
                onClick={() => setActivePanel('threat')}
              >
                Live threat feed
              </button>
              <button
                className={`sp-panel-tab ${activePanel === 'layers' ? 'sp-panel-tab--active' : ''}`}
                onClick={() => setActivePanel('layers')}
              >
                Security layers
              </button>
            </div>

            {activePanel === 'threat' && (
              <div className="sp-threat-log">
                <div className="sp-threat-log-header">
                  <span>Today's activity</span>
                  <span className="sp-live-pill">● Live</span>
                </div>
                {threatLog.map(t => <ThreatRow key={t.time} {...t} />)}
              </div>
            )}

            {activePanel === 'layers' && (
              <div className="sp-layers">
                {[
                  { icon: '🔒', label: 'Data encrypted at rest (AES-256)' },
                  { icon: '🔐', label: 'TLS 1.3 for all data in transit' },
                  { icon: '👁', label: 'Biometric login + hardware key support' },
                  { icon: '📱', label: 'Two-factor authentication (TOTP/SMS)' },
                  { icon: '🤖', label: 'AI anomaly detection, <200ms' },
                  { icon: '🌍', label: 'Dark-web credential monitoring' },
                  { icon: '🚫', label: 'Instant card freeze from mobile' },
                ].map(l => (
                  <div key={l.label} className="sp-layer-row">
                    <span className="sp-layer-icon">{l.icon}</span>
                    <span className="sp-layer-label">{l.label}</span>
                    <span className="sp-layer-check">✓</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right — 4-quadrant visual + AI detail */}
          <div className="sp-right">
            <div className="sp-security-quad">
              <div className="sp-quad sp-quad--green">
                <div className="sp-quad-icon">🔒</div>
                <div className="sp-quad-title">End-to-end encrypted</div>
                <div className="sp-quad-sub">Every byte. Always.</div>
              </div>
              <div className="sp-quad sp-quad--gold">
                <div className="sp-quad-icon">👁</div>
                <div className="sp-quad-title">Biometric login</div>
                <div className="sp-quad-sub">Face ID or Touch ID</div>
              </div>
              <div className="sp-quad sp-quad--blue">
                <div className="sp-quad-icon">📱</div>
                <div className="sp-quad-title">2FA on every device</div>
                <div className="sp-quad-sub">TOTP &amp; push verify</div>
              </div>
              <div className="sp-quad sp-quad--purple">
                <div className="sp-quad-icon">🚨</div>
                <div className="sp-quad-title">Fraud AI, 24/7</div>
                <div className="sp-quad-sub">200+ risk signals</div>
              </div>
            </div>

            <div className="sp-ai-card">
              <div className="sp-ai-header">
                <span className="sp-ai-badge">AI</span>
                <h3 className="sp-ai-title">Real-time fraud detection</h3>
              </div>
              <p className="sp-ai-body">
                Our model monitors every transaction against 200+ risk signals —
                geo-anomalies, velocity checks, device fingerprinting — in under 200ms.
                Suspicious activity freezes your account instantly until you confirm.
              </p>
              <div className="sp-ai-signals">
                {['Geo-anomaly', 'Velocity check', 'Device mismatch', 'Dark web alert', 'Pattern shift'].map(s => (
                  <span key={s} className="sp-ai-signal">{s}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Extra features ── */}
        <section className="sp-features-section">
          <h2 className="sp-section-title">Defence in depth</h2>
          <p className="sp-section-sub">Security isn't one thing. It's every layer, working together.</p>
          <div className="sp-features-grid">
            {extraFeatures.map(f => <FeatureCard key={f.title} {...f} />)}
          </div>
        </section>

        {/* ── Banner ── */}
        <section className="sp-banner">
          <div className="sp-banner-inner">
            <div className="sp-banner-lock">🔒</div>
            <h2 className="sp-banner-title">Bank-grade security, fintech speed</h2>
            <p className="sp-banner-sub">
              Your financial data deserves the best protection available. That's what we built.
            </p>
            <button className="sp-btn-white">
              Start securely — it's free
              <span className="sp-btn-arrow"><IconArrowRight /></span>
            </button>
          </div>
        </section>

      </div>
      <Footer />
    </div>
  );
}