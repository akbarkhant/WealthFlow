import { useState, useEffect, useRef, useCallback } from 'react';
import { Menu, X, ChevronDown, ArrowRight } from 'lucide-react';
import '../../styles/components/Navbar.css';

/* ── Icon components ── */

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
  { icon: <IconWallet />, title: 'Budget Management', sub: 'Track income, expenses & goals',     href: '/features/budget-management' },
  { icon: <IconShield />, title: 'Advanced Security',  sub: 'Bank-grade encryption & 2FA',        href: '/features/security'          },
  { icon: <IconChart  />, title: 'Smart Analytics',    sub: 'AI-powered financial insights',      href: '/features/analytics'         },
  { icon: <IconCard   />, title: 'Payment Tracking',   sub: 'Manage bills & subscriptions',       href: '/features/payments'          },
];

const solutionsItems = [
  { icon: <IconPie      />, title: 'Personal Finance',    sub: 'Budgets, savings & net worth',     href: '/solutions/personal-finance'     },
  { icon: <IconBuilding />, title: 'Business Finance',    sub: 'Cash flow & expense reports',      href: '/solutions/business-finance'     },
  { icon: <IconTrend    />, title: 'Investment Planning', sub: 'Portfolio tracking & projections', href: '/solutions/investment-planning'  },
  { icon: <IconBank     />, title: 'Banking Solutions',   sub: 'Sync accounts & transfers',        href: '/solutions/banking-solutions'      },
];

/* ── DropdownItem ── */

function DropdownItem({ icon, title, sub, href, onClick }) {
  return (
    <a href={href} className="dropdown-item" onClick={onClick} role="menuitem">
      <span className="dropdown-item-icon">{icon}</span>
      <span className="dropdown-item-label">
        <span className="dropdown-item-title">{title}</span>
        <span className="dropdown-item-sub">{sub}</span>
      </span>
    </a>
  );
}

/* ── Dropdown ── */

function Dropdown({ label, sectionLabel, items, isOpen, onToggle, onMouseEnter, onMouseLeave, onItemClick }) {
  return (
    <li
      className="dropdown"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <button
        className={`dropdown-btn${isOpen ? ' open' : ''}`}
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {label}
        <ChevronDown className="chevron" size={16} strokeWidth={2} />
      </button>

      <div className={`dropdown-menu${isOpen ? ' show' : ''}`} role="menu">
        {sectionLabel && <div className="dropdown-section-label">{sectionLabel}</div>}
        {items.map((item) => (
          <DropdownItem key={item.href} {...item} onClick={onItemClick} />
        ))}
      </div>
    </li>
  );
}

/* ── Main Navbar ── */

export default function Navbar() {
  const [mobileOpen,    setMobileOpen]    = useState(false);
  const [featuresOpen,  setFeaturesOpen]  = useState(false);
  const [solutionsOpen, setSolutionsOpen] = useState(false);

  const navRef = useRef(null);

  /* Close all dropdowns */
  const closeDropdowns = useCallback(() => {
    setFeaturesOpen(false);
    setSolutionsOpen(false);
  }, []);

  /* Close mobile panel + dropdowns */
  const closeMobile = useCallback(() => {
    setMobileOpen(false);
    closeDropdowns();
  }, [closeDropdowns]);

  /* Keyboard: Escape closes everything */
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        closeMobile();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [closeMobile]);

  /* Click outside: close dropdowns on desktop */
  useEffect(() => {
    const onClickOutside = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        closeDropdowns();
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [closeDropdowns]);

  /* Lock body scroll while mobile menu is open */
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  return (
    <nav className="navbar-sticky" ref={navRef}>
      <div className="navbar-container">

        {/* Logo */}
        <a href="/" className="brand-logo">WealthFlow</a>

        {/*
          Single unified panel — both nav links and action buttons live here.
          The CSS toggles this one element on mobile (.active),
          avoiding the old fragile dual-panel + hardcoded offset approach.
        */}
        <div className={`navbar-mobile-panel${mobileOpen ? ' active' : ''}`}>

          {/* Nav Links */}
          <ul className="navbar-links">

            <Dropdown
              label="Features"
              sectionLabel="Tools"
              items={featuresItems}
              isOpen={featuresOpen}
              onToggle={() => { setSolutionsOpen(false); setFeaturesOpen((p) => !p); }}
              onMouseEnter={() => { setSolutionsOpen(false); setFeaturesOpen(true);  }}
              onMouseLeave={() => setFeaturesOpen(false)}
              onItemClick={closeMobile}
            />

            <Dropdown
              label="Solutions"
              sectionLabel="By need"
              items={solutionsItems}
              isOpen={solutionsOpen}
              onToggle={() => { setFeaturesOpen(false); setSolutionsOpen((p) => !p); }}
              onMouseEnter={() => { setFeaturesOpen(false); setSolutionsOpen(true);  }}
              onMouseLeave={() => setSolutionsOpen(false)}
              onItemClick={closeMobile}
            />

            <li>
              <a href="#pricing" onClick={closeMobile}>Pricing</a>
            </li>

            <li>
              <a href="/about" onClick={closeMobile}>About</a>
            </li>

          </ul>          

        </div>{/* /.navbar-mobile-panel */}

        {/* Burger — sits outside the panel so it's always visible */}
        <button
          className="navbar-toggle"
          onClick={() => { setMobileOpen((p) => !p); closeDropdowns(); }}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
          aria-controls="navbar-mobile-panel"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

      </div>
    </nav>
  );
}