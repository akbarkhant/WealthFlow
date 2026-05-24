import { useState } from 'react';
import { Menu, X, ChevronDown, ArrowRight } from 'lucide-react';
import '../../styles/components/Navbar.css';

/* ── Icon components (inline SVG for crisp rendering) ── */

const IconWallet = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
    <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
    <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
  </svg>
);

const IconShield = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

const IconChart = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M3 9h18M9 21V9" />
  </svg>
);

const IconCard = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="5" width="20" height="14" rx="2" />
    <path d="M2 10h20" />
  </svg>
);

const IconPie = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
    <path d="M22 12A10 10 0 0 0 12 2v10z" />
  </svg>
);

const IconBuilding = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const IconTrend = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
    <polyline points="16 7 22 7 22 13" />
  </svg>
);

const IconBank = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);

/* ── Data ── */

const featuresItems = [
  {
    icon: <IconWallet />,
    title: 'Budget Management',
    sub: 'Track income, expenses & goals',
    href: '/features/budget-managment',
  },
  {
    icon: <IconShield />,
    title: 'Advanced Security',
    sub: 'Bank-grade encryption & 2FA',
    href: '/features/security',
  },
  {
    icon: <IconChart />,
    title: 'Smart Analytics',
    sub: 'AI-powered financial insights',
    href: '/features/analytics',
  },
  {
    icon: <IconCard />,
    title: 'Payment Tracking',
    sub: 'Manage bills & subscriptions',
    href: '/features/payments',
  },
];

const solutionsItems = [
  {
    icon: <IconPie />,
    title: 'Personal Finance',
    sub: 'Budgets, savings & net worth',
    href: '/solutions/personal',
  },
  {
    icon: <IconBuilding />,
    title: 'Business Finance',
    sub: 'Cash flow & expense reports',
    href: '/solutions/business',
  },
  {
    icon: <IconTrend />,
    title: 'Investment Planning',
    sub: 'Portfolio tracking & projections',
    href: '/solutions/investments',
  },
  {
    icon: <IconBank />,
    title: 'Banking Solutions',
    sub: 'Sync accounts & transfers',
    href: '/solutions/banking',
  },
];

/* ── Sub-components ── */

function DropdownItem({ icon, title, sub, href }) {
  return (
    <a href={href} className="dropdown-item">
      <span className="dropdown-item-icon">{icon}</span>
      <span className="dropdown-item-label">
        <span className="dropdown-item-title">{title}</span>
        <span className="dropdown-item-sub">{sub}</span>
      </span>
    </a>
  );
}

function Dropdown({ label, sectionLabel, items, isOpen, onToggle, onMouseEnter, onMouseLeave }) {
  return (
    <li
      className="dropdown"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <button
        className={`dropdown-btn ${isOpen ? 'open' : ''}`}
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {label}
        <ChevronDown className="chevron" size={16} strokeWidth={2} />
      </button>

      <div className={`dropdown-menu ${isOpen ? 'show' : ''}`} role="menu">
        {sectionLabel && (
          <div className="dropdown-section-label">{sectionLabel}</div>
        )}
        {items.map((item) => (
          <DropdownItem key={item.href} {...item} />
        ))}
      </div>
    </li>
  );
}

/* ── Main component ── */

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [featuresOpen, setFeaturesOpen] = useState(false);
  const [solutionsOpen, setSolutionsOpen] = useState(false);

  const closeAll = () => {
    setFeaturesOpen(false);
    setSolutionsOpen(false);
  };

  return (
    <nav className="navbar-sticky">
      <div className="navbar-container">

        {/* Logo */}
        <a href="/" className="brand-logo">WealthFlow</a>

        {/* Navigation Links */}
        <ul className={`navbar-links ${mobileOpen ? 'active' : ''}`}>

          <Dropdown
            label="Features"
            sectionLabel="Tools"
            items={featuresItems}
            isOpen={featuresOpen}
            onToggle={() => {
              setSolutionsOpen(false);
              setFeaturesOpen((prev) => !prev);
            }}
            onMouseEnter={() => { setSolutionsOpen(false); setFeaturesOpen(true); }}
            onMouseLeave={() => setFeaturesOpen(false)}
          />

          <Dropdown
            label="Solutions"
            sectionLabel="By need"
            items={solutionsItems}
            isOpen={solutionsOpen}
            onToggle={() => {
              setFeaturesOpen(false);
              setSolutionsOpen((prev) => !prev);
            }}
            onMouseEnter={() => { setFeaturesOpen(false); setSolutionsOpen(true); }}
            onMouseLeave={() => setSolutionsOpen(false)}
          />

          <li>
            <a href="#pricing" onClick={() => setMobileOpen(false)}>Pricing</a>
          </li>

          <li>
            <a href="/about" onClick={() => setMobileOpen(false)}>About</a>
          </li>
        </ul>

        {/* Action Buttons */}
        <div className={`navbar-actions ${mobileOpen ? 'active' : ''}`}>
          <a href="/login" className="btn-login">Log in</a>
          <a href="/signup" className="btn-primary">
            Get started
            <span className="btn-primary-arrow">
              <ArrowRight size={13} strokeWidth={2.5} />
            </span>
          </a>
        </div>

        {/* Mobile Toggle */}
        <button
          className="navbar-toggle"
          onClick={() => { setMobileOpen((prev) => !prev); closeAll(); }}
          aria-label="Toggle navigation"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

      </div>
    </nav>
  );
}