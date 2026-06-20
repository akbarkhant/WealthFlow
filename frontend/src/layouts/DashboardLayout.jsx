import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import {
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  ReceiptText,
  Settings,
  Tags,
  Target,
  UserRound,
  WalletCards,
  Banknote,
  Bot,
  FileChartColumn,
  History,
  X,
  Sun,
  Goal,
  Landmark,
  Import,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useReports } from '../context/ReportContext';
import { SearchBar } from '../components/SearchBar/SearchBar';
import NotificationBell from '../components/Notificationbell';
import './dash.css';

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Transactions', path: '/transactions', icon: Banknote },
  { name: 'Budgets', path: '/budgets', icon: Target },
  { name: 'Categories', path: '/categories', icon: Tags },
  { name: 'Bills', path: '/bills', icon: ReceiptText },
  { name: 'AI-Assistant', path: '/ai', icon: Bot },
  { name: 'Reports', path: '/reports', icon: FileChartColumn },
  //{ name: 'History', path: '/history', icon: History },
  { name: 'Goals', path: '/goals', icon: Goal },
  { name: 'Accounts', path: '/accounts', icon: Landmark },
  { name: 'Settings', path: '/settings', icon: Settings },
];

const DashboardLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => window.innerWidth > 768);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // ── Context Data Layer Integration ──────────────────────────────────────────
  const { monthlyReport, loading: isSummaryLoading } = useReports();
  const reportData = monthlyReport?.data ? monthlyReport.data : monthlyReport;

  // ── Safe Financial Conversions ─────────────────────────────────────────────
  const totalIncome = Number(reportData?.totalIncome ?? 0);
  const totalExpenses = Number(reportData?.totalExpenses ?? 0);
  const netCashflow = Number(reportData?.netSavings ?? (totalIncome - totalExpenses));

  // Currency formatter localized cleanly to user profile definitions
  const currency = useMemo(
    () =>
      new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: user?.currency || 'USD',
        maximumFractionDigits: 0,
      }),
    [user?.currency]
  );

  // ── Theme Management ───────────────────────────────────────────────────────
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // ── Close Flyouts on Navigation ───────────────────────────────────────────
  useEffect(() => {
    if (window.innerWidth <= 768) setIsSidebarOpen(false);
    setIsProfileOpen(false);
  }, [location.pathname]);

  // ── Hotkey Listeners (ESC) ─────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        if (window.innerWidth <= 768) setIsSidebarOpen(false);
        setIsProfileOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // ── Click Outside Dropdown Dismissal ───────────────────────────────────────
  useEffect(() => {
    if (!isProfileOpen) return;
    const handler = (e) => {
      if (!e.target.closest('.dropdown')) setIsProfileOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isProfileOpen]);

  // ── Responsive Layout Resize Tracking ──────────────────────────────────────
  useEffect(() => {
    const onResize = () => {
      setIsSidebarOpen(window.innerWidth > 768);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // ── User Information Normalization ─────────────────────────────────────────
  const displayName = user?.name || user?.email?.split('@')[0] || 'User';
  const displayEmail = user?.email || '';
  
  const initials = useMemo(
    () =>
      displayName
        .split(' ')
        .map((p) => p[0])
        .join('')
        .slice(0, 2)
        .toUpperCase(),
    [displayName]
  );

  const activePage = navItems.find((item) => location.pathname.startsWith(item.path));
  const ActiveIcon = activePage?.icon || LayoutDashboard;

  const handleSearchSelect = (transaction) => {
    navigate(`/transactions/${transaction.id}`);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className={`dashboard-shell ${!isSidebarOpen ? 'is-sidebar-closed' : ''}`}>

      {/* Mobile background backdrop click catcher */}
      <button
        className="sidebar-scrim"
        type="button"
        aria-label="Close sidebar"
        onClick={() => setIsSidebarOpen(false)}
      />

      {/* ── Sidebar Shell ─────────────────────────────────────────── */}
      <aside className="dashboard-sidebar" aria-label="Dashboard navigation">
        <div className="sidebar-brand-row">
          <Link to="/dashboard" className="sidebar-brand" aria-label="WealthFlow">
            <span className="sidebar-brand__mark">
              <WalletCards size={16} />
            </span>
            <span>
              <strong>WealthFlow</strong>
              <small>Budget Management</small>
            </span>
          </Link>

          <button
            className="icon-button sidebar-close"
            type="button"
            aria-label="Close navigation"
            onClick={() => setIsSidebarOpen((o) => !o)}
          >
            <X size={14} />
          </button>
        </div>

        <nav className="sidebar-nav" aria-label="Main navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.name}
                to={item.path}
                className={`sidebar-link ${isActive ? 'is-active' : ''}`}
              >
                <Icon size={14} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* ── Monthly Net Insights Widget ── */}
        <div className="sidebar-insight">
          <p>Monthly net</p>
          {isSummaryLoading ? (
            <span className="insight-loader">Loading balances...</span>
          ) : (
            <>
              <strong className={netCashflow >= 0 ? 'cashflow-positive' : 'cashflow-negative'}>
                {currency.format(netCashflow)}
              </strong>
              <span>
                Income {currency.format(totalIncome)}
                {' · '}
                Expenses {currency.format(totalExpenses)}
              </span>
            </>
          )}
        </div>

        <div className="sidebar-user">
          <div className="avatar">{initials}</div>
          <div>
            <strong>{displayName}</strong>
            <span>{displayEmail}</span>
          </div>
        </div>
      </aside>

      {/* ── Main Canvas View ──────────────────────────────────────── */}
      <div className="dashboard-main">
        <header className="dashboard-topbar">
          <div className="topbar-left">
            <button
              className="icon-button menu-trigger"
              type="button"
              aria-label="Toggle navigation"
              onClick={() => setIsSidebarOpen((o) => !o)}
            >
              <Menu size={15} />
            </button>

            <div className="topbar-title">
              <span className="topbar-title__icon">
                <ActiveIcon size={14} />
              </span>
              <div>
                <p>{activePage?.name || 'Workspace'}</p>
                <strong>Good to see you, {displayName.split(' ')[0]}</strong>
              </div>
            </div>
          </div>

          <div className="topbar-search">
            <SearchBar onSelect={handleSearchSelect} />
          </div>

          <div className="topbar-actions">
            {/* Theme Toggle */}
            <button
              className="icon-button"
              type="button"
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
              onClick={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))}
            >
              {theme === 'light' ? <Moon size={15} /> : <Sun size={15} />}
            </button>

            {/* Notifications System */}
            <NotificationBell />

            {/* Profile Dropdown context menu */}
            <div className="dropdown">
              <button
                className="profile-trigger"
                type="button"
                aria-label="Open profile menu"
                aria-expanded={isProfileOpen}
                onClick={() => setIsProfileOpen((o) => !o)}
              >
                <span className="avatar avatar-sm">{initials}</span>
                <ChevronDown size={13} />
              </button>

              {isProfileOpen && (
                <div className="dropdown-panel profile-panel">
                  <div className="profile-summary">
                    <span className="avatar">{initials}</span>
                    <div>
                      <strong>{displayName}</strong>
                      <p>{displayEmail}</p>
                    </div>
                  </div>
                  <Link className="dropdown-action" to="/settings">
                    <UserRound size={14} />
                    Profile settings
                  </Link>
                  <button
                    className="dropdown-action danger"
                    type="button"
                    onClick={handleLogout}
                  >
                    <LogOut size={14} />
                    Log out
                  </button>
                </div>
              )}
            </div>

          </div>
        </header>

        <main className="dashboard-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;