import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Bell,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Plus,
  ReceiptText,
  Search,
  Settings,
  Sun,
  Tags,
  Target,
  UserRound,
  WalletCards,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApi } from '../hooks/useApi';
import { getMonthlyReport } from '../api/chartsApi';
import { listBudgets } from '../api/budgetsApi';
import { mapBudgetForUi, mapBudgetsToNotifications } from '../services/mappers';
import { getCurrentPeriod, getMonthDateRange } from '../utils/dateRange';
import './DashboardLayout.css';

const navItems = [
  { name: 'Dashboard',    path: '/dashboard',    icon: LayoutDashboard },
  { name: 'Transactions', path: '/transactions', icon: ReceiptText },
  { name: 'Budgets',      path: '/budgets',      icon: Target },
  { name: 'Categories',   path: '/categories',   icon: Tags },
  { name: 'Settings',     path: '/settings',     icon: Settings },
];

const { month, year } = getCurrentPeriod();
const period = getMonthDateRange(year, month);

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

const DashboardLayout = ({ children }) => {
  const location  = useLocation();
  const navigate  = useNavigate();
  const { user, logout } = useAuth();

  const [theme,                setTheme]                = useState(() => localStorage.getItem('theme') || 'light');
  const [isSidebarOpen,        setIsSidebarOpen]        = useState(false);
  const [searchQuery,          setSearchQuery]          = useState('');
  const [isNotificationsOpen,  setIsNotificationsOpen]  = useState(false);
  const [isProfileOpen,        setIsProfileOpen]        = useState(false);

  const { data: monthlySummary } = useApi(
    () => getMonthlyReport({ month: period.month, year: period.year }),
    [period.month, period.year]
  );

  const { data: budgetsRaw } = useApi(
    () => listBudgets({ month: period.month, year: period.year }),
    [period.month, period.year]
  );

  const notifications = useMemo(() => {
    const budgets = (Array.isArray(budgetsRaw) ? budgetsRaw : []).map(mapBudgetForUi);
    return mapBudgetsToNotifications(budgets.filter((b) => b.usedPercent >= 70));
  }, [budgetsRaw]);

  const netCashflow = Number(monthlySummary?.netSavings ?? 0);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  /* Close all drawers on route change */
  useEffect(() => {
    setIsSidebarOpen(false);
    setIsNotificationsOpen(false);
    setIsProfileOpen(false);
  }, [location.pathname]);

  /* ESC key closes everything */
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setIsSidebarOpen(false);
        setIsNotificationsOpen(false);
        setIsProfileOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const displayName  = user?.name || user?.email?.split('@')[0] || 'User';
  const displayEmail = user?.email || '';
  const initials     = useMemo(
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

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const q = searchQuery.trim();
    navigate(q ? `/transactions?search=${encodeURIComponent(q)}` : '/transactions');
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className={`dashboard-shell ${isSidebarOpen ? 'is-sidebar-open' : ''}`}>
      {/* Mobile scrim */}
      <button
        className="sidebar-scrim"
        type="button"
        aria-label="Close sidebar"
        onClick={() => setIsSidebarOpen(false)}
      />

      {/* ── Sidebar ────────────────────────────────────────────────── */}
      <aside className="dashboard-sidebar" aria-label="Dashboard navigation">

        {/* Brand */}
        <div className="sidebar-brand-row">
          <Link to="/dashboard" className="sidebar-brand" aria-label="WealthFlow">
            {/* Icon only — no colored blob wrapper */}
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
            onClick={() => setIsSidebarOpen(false)}
          >
            <X size={14} />
          </button>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav" aria-label="Main navigation">
          {navItems.map((item) => {
            const Icon     = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.name}
                to={item.path}
                className={`sidebar-link ${isActive ? 'is-active' : ''}`}
              >
                {/* Icons are 14px, same color as text — no separate accent color */}
                <Icon size={14} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Monthly insight strip */}
        <div className="sidebar-insight">
          <p>Monthly net</p>
          <strong>{currency.format(netCashflow)}</strong>
          <span>
            Income {currency.format(Number(monthlySummary?.totalIncome ?? 0))}
            {' · '}
            Expenses {currency.format(Number(monthlySummary?.totalExpenses ?? 0))}
          </span>
        </div>

        {/* User */}
        <div className="sidebar-user">
          <div className="avatar">{initials}</div>
          <div>
            <strong>{displayName}</strong>
            <span>{displayEmail}</span>
          </div>
        </div>
      </aside>

      {/* ── Main ───────────────────────────────────────────────────── */}
      <div className="dashboard-main">

        {/* Topbar — 48px height */}
        <header className="dashboard-topbar">

          {/* Left */}
          <div className="topbar-left">
            <button
              className="icon-button menu-trigger"
              type="button"
              aria-label="Open navigation"
              onClick={() => setIsSidebarOpen(true)}
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

          {/* Search */}
          <form className="topbar-search" onSubmit={handleSearchSubmit}>
            <Search size={13} />
            <input
              type="search"
              placeholder="Search transactions"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>

          {/* Actions */}
          <div className="topbar-actions">

            {/* Theme toggle */}
            <button
              className="icon-button"
              type="button"
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
              onClick={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))}
            >
              {theme === 'light' ? <Moon size={15} /> : <Sun size={15} />}
            </button>

            {/* Notifications */}
            <div className="dropdown">
              <button
                className="icon-button"
                type="button"
                aria-label="Notifications"
                aria-expanded={isNotificationsOpen}
                onClick={() => {
                  setIsNotificationsOpen((o) => !o);
                  setIsProfileOpen(false);
                }}
              >
                <Bell size={15} />
                {notifications.length > 0 && <span className="notification-dot" />}
              </button>

              {isNotificationsOpen && (
                <div className="dropdown-panel notification-panel">
                  <div className="dropdown-header">
                    <strong>Alerts</strong>
                    <span>{notifications.length} active</span>
                  </div>

                  {notifications.length === 0 ? (
                    <p className="notification-empty">No budget alerts right now.</p>
                  ) : (
                    notifications.map((item) => (
                      <div className="notification-item" key={item.id}>
                        <span />
                        <div>
                          <strong>{item.title}</strong>
                          <p>{item.detail}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Add transaction */}
            <button
              className="btn btn-primary topbar-add"
              type="button"
              onClick={() => navigate('/transactions')}
            >
              <Plus size={13} />
              <span>Add Transaction</span>
            </button>

            {/* Profile */}
            <div className="dropdown">
              <button
                className="profile-trigger"
                type="button"
                aria-label="Open profile menu"
                aria-expanded={isProfileOpen}
                onClick={() => {
                  setIsProfileOpen((o) => !o);
                  setIsNotificationsOpen(false);
                }}
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

        {/* Page content */}
        <main className="dashboard-content">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
