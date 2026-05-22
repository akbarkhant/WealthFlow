// src/pages/Bills.jsx

import React, { useEffect, useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  Home,
  Zap,
  PlayCircle,
  Wifi,
  CreditCard,
  RefreshCw,
  User,
  ShieldCheck,
} from 'lucide-react';
import api from '../utils/api';
import '../styles/pages/Bills.css';

// ── Helpers ──────────────────────────────────────────────────

/**
 * Returns the lucide icon component for a bill type.
 * @param {string} type  - 'rent' | 'electricity' | 'subscription' | 'internet' | *
 */
const getBillIcon = (type) => {
  const map = {
    rent:         <Home size={22} />,
    electricity:  <Zap size={22} />,
    subscription: <PlayCircle size={22} />,
    internet:     <Wifi size={22} />,
  };
  return map[type] ?? <CreditCard size={22} />;
};

/**
 * Maps a payment_method value to a badge config.
 * Falls back to 'Manual' when unrecognised.
 * @param {string} method - 'auto' | 'manual' | *
 */
const getPaymentBadge = (method) => {
  if (method === 'auto') {
    return {
      className: 'bill-item__badge bill-item__badge--autopay',
      icon: <RefreshCw size={12} />,
      label: 'Auto-pay',
    };
  }
  return {
    className: 'bill-item__badge bill-item__badge--manual',
    icon: <User size={12} />,
    label: 'Manual',
  };
};

/**
 * Derives the event-bar / event-label colour variant from a bill type.
 * Drives calendar cell event tag colours.
 */
const getEventVariant = (type) => {
  if (type === 'rent')         return 'tertiary';
  if (type === 'electricity')  return 'error';
  return 'primary';             // subscription, internet, default
};

// ── Calendar helpers ─────────────────────────────────────────

const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/**
 * Returns an array of cell objects for the calendar grid.
 * Includes leading "overflow" cells from the previous month so the
 * first day always falls on the correct weekday column (Mon = 0).
 *
 * @param {number} year
 * @param {number} month - 0-indexed (0 = January)
 * @param {Array}  bills  - API bills array (used to attach events)
 */
const buildCalendarCells = (year, month, bills) => {
  const firstDay  = new Date(year, month, 1);
  const lastDate  = new Date(year, month + 1, 0).getDate();
  const today     = new Date();

  // getDay(): 0=Sun … 6=Sat  →  remap to Mon=0 … Sun=6
  const startDow = (firstDay.getDay() + 6) % 7;

  const cells = [];

  // Leading overflow cells (previous month tail)
  const prevLastDate = new Date(year, month, 0).getDate();
  for (let i = startDow - 1; i >= 0; i--) {
    cells.push({ day: prevLastDate - i, overflow: true, events: [] });
  }

  // Current-month cells
  for (let d = 1; d <= lastDate; d++) {
    const isToday =
      today.getFullYear() === year &&
      today.getMonth()    === month &&
      today.getDate()     === d;

    // Bills whose due date lands on this calendar day.
    // API bill.due_day should be a number (1-31); fall back to parsing bill.due string.
    const events = bills.filter((b) => {
      const dueDay =
        b.due_day ??
        parseInt((b.due ?? '').replace(/\D+(\d+).*/, '$1'), 10);
      return dueDay === d;
    });

    cells.push({ day: d, overflow: false, isToday, events });
  }

  return cells;
};

// ── Component ────────────────────────────────────────────────

const Bills = () => {
  const [bills,    setBills]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [viewMode, setViewMode] = useState('month'); // 'week' | 'month'
  
  // Search & Form states
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    due: new Date().toISOString().split('T')[0],
    type: 'rent',
    payment_method: 'manual',
    status: 'unpaid'
  });
  const [formError, setFormError] = useState('');

  // Calendar navigation state
  const today         = new Date();
  const [calYear,  setCalYear]  = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth()); // 0-indexed

  // ── Data fetching ──────────────────────────────────────────
  const fetchBills = async () => {
    try {
      const data = await api.get('/bills');
      setBills(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching bills:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBills();
  }, []);

  // ── Operations ─────────────────────────────────────────────
  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.title.trim()) {
      setFormError('Bill title/description is required');
      return;
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setFormError('Amount must be greater than zero');
      return;
    }
    if (!formData.due) {
      setFormError('Due date is required');
      return;
    }

    try {
      await api.post('/bills', formData);
      setFormData({
        title: '',
        amount: '',
        due: new Date().toISOString().split('T')[0],
        type: 'rent',
        payment_method: 'manual',
        status: 'unpaid'
      });
      setShowAddForm(false);
      fetchBills();
    } catch (err) {
      setFormError('Failed to add bill');
    }
  };

  const handleToggleStatus = async (bill) => {
    try {
      const nextStatus = bill.status === 'paid' ? 'unpaid' : 'paid';
      await api.put(`/bills/${bill.id}`, { status: nextStatus });
      fetchBills();
    } catch (err) {
      console.error('Failed to toggle bill status:', err);
    }
  };

  const handleDeleteBill = async (id) => {
    if (window.confirm('Are you sure you want to delete this bill?')) {
      try {
        await api.delete(`/bills/${id}`);
        fetchBills();
      } catch (err) {
        console.error('Failed to delete bill:', err);
      }
    }
  };

  // ── Calendar navigation ────────────────────────────────────
  const goToPrevMonth = () => {
    setCalMonth((m) => {
      if (m === 0) { setCalYear((y) => y - 1); return 11; }
      return m - 1;
    });
  };
  const goToNextMonth = () => {
    setCalMonth((m) => {
      if (m === 11) { setCalYear((y) => y + 1); return 0; }
      return m + 1;
    });
  };

  // ── Derived values ─────────────────────────────────────────
  const monthLabel = new Date(calYear, calMonth, 1)
    .toLocaleString('default', { month: 'long', year: 'numeric' });

  const calendarCells = buildCalendarCells(calYear, calMonth, bills);

  // Filter bills by search query
  const filteredBills = bills.filter(b => 
    (b.title ?? b.name ?? '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Summary totals (computed from real data)
  const totalAmount   = bills.reduce((s, b) => s + (parseFloat(b.amount) || 0), 0);
  const paidAmount    = bills
    .filter((b) => b.status === 'paid')
    .reduce((s, b) => s + (parseFloat(b.amount) || 0), 0);
  const pendingAmount = totalAmount - paidAmount;

  const fmt = (n) =>
    n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

  // ── Loading state ──────────────────────────────────────────
  if (loading) {
    return (
      <DashboardLayout>
        <div className="bills-loading">Loading Bills…</div>
      </DashboardLayout>
    );
  }

  // ── Render ─────────────────────────────────────────────────
  return (
    <DashboardLayout>

      {/* ── Page Header ─────────────────────────────────── */}
      <div className="bills-header">
        <div>
          <h2 className="bills-header__title">Bill Calendar</h2>
          <p className="bills-header__subtitle">
            Manage your upcoming obligations and subscription renewals.
          </p>
        </div>
        <button className="bills-header__btn" onClick={() => setShowAddForm(true)}>
          <Plus size={18} />
          Add Bill
        </button>
      </div>

      {/* ── Main Grid ───────────────────────────────────── */}
      <div className="bills-grid">

        {/* ── Calendar Column ─────────────────────────── */}
        <div className="glass-card calendar-card">
          <div className="calendar-card__glow" aria-hidden="true" />

          {/* Calendar top bar */}
          <div className="calendar-top">
            <div className="calendar-top__left">
              <h3 className="calendar-top__month">{monthLabel}</h3>
              <div className="calendar-nav">
                <button
                  className="calendar-nav__btn"
                  onClick={goToPrevMonth}
                  aria-label="Previous month"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  className="calendar-nav__btn"
                  onClick={goToNextMonth}
                  aria-label="Next month"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>

            <div className="calendar-view-toggle">
              <button
                className={`calendar-view-toggle__btn${viewMode === 'week' ? ' calendar-view-toggle__btn--active' : ''}`}
                onClick={() => setViewMode('week')}
              >
                Week
              </button>
              <button
                className={`calendar-view-toggle__btn${viewMode === 'month' ? ' calendar-view-toggle__btn--active' : ''}`}
                onClick={() => setViewMode('month')}
              >
                Month
              </button>
            </div>
          </div>

          {/* Calendar grid */}
          <div className="calendar-grid">
            {/* Week-day headers */}
            {WEEK_DAYS.map((d) => (
              <div key={d} className="calendar-day-header">{d}</div>
            ))}

            {/* Day cells */}
            {calendarCells.map((cell, idx) => {
              const cellClass = [
                'calendar-cell',
                cell.overflow ? 'calendar-cell--muted'  : '',
                cell.isToday  ? 'calendar-cell--today'  : '',
              ].filter(Boolean).join(' ');

              return (
                <div key={idx} className={cellClass}>
                  {cell.day}
                  {cell.isToday && (
                    <span className="calendar-cell__today-label">Today</span>
                  )}
                  {!cell.overflow && cell.events.map((ev, ei) => {
                    const variant = getEventVariant(ev.type);
                    return (
                      <div key={ei} className="calendar-cell__event">
                        <span className={`calendar-cell__event-bar calendar-cell__event-bar--${variant}`} />
                        <span className={`calendar-cell__event-label calendar-cell__event-label--${variant}`}>
                          {ev.title ?? ev.name}
                        </span>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Right Panel ─────────────────────────────── */}
        <div className="right-panel">

          {/* Summary Card */}
          <div className="summary-card">
            <div className="summary-card__content">
              <p className="summary-card__label">Upcoming This Month</p>
              <h4 className="summary-card__total">{fmt(totalAmount)}</h4>
              <div className="summary-card__stats">
                <div className="summary-card__stat">
                  <p className="summary-card__stat-label">Paid</p>
                  <p className="summary-card__stat-value">{fmt(paidAmount)}</p>
                </div>
                <div className="summary-card__stat summary-card__stat--bordered">
                  <p className="summary-card__stat-label">Pending</p>
                  <p className="summary-card__stat-value">{fmt(pendingAmount)}</p>
                </div>
              </div>
            </div>
            <div className="summary-card__glow" aria-hidden="true" />
          </div>

          {/* Upcoming Bills Card */}
          <div className="glass-card upcoming-card">
            <div className="upcoming-card__header">
              <h3 className="upcoming-card__title">Upcoming Bills</h3>
              <span style={{ fontSize: '12px', color: 'var(--color-secondary)' }}>
                {filteredBills.length} found
              </span>
            </div>

            {/* Search filter input */}
            <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(187, 202, 191, 0.20)' }}>
              <input
                type="text"
                placeholder="Search bills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--color-outline-variant)',
                  background: 'var(--color-surface-container-low)',
                  color: 'var(--color-on-surface)',
                  fontSize: '13px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div className="bills-list" style={{ maxHeight: '420px' }}>
              {filteredBills.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px', color: 'var(--color-secondary)', fontSize: '13px' }}>
                  No bills found
                </div>
              ) : (
                filteredBills.map((bill) => {
                  const isOverdue = bill.status === 'overdue';
                  const badge     = getPaymentBadge(bill.payment_method);

                  return (
                    <div
                      key={bill.id}
                      className={`bill-item${isOverdue ? ' bill-item--overdue' : ''}`}
                    >
                      <div className="bill-item__left">
                        <div className="bill-item__icon">
                          {getBillIcon(bill.type)}
                        </div>
                        <div>
                          <p className="bill-item__name">{bill.title ?? bill.name}</p>
                          <p className={`bill-item__due${isOverdue ? ' bill-item__due--overdue' : ''}`}>
                            {isOverdue ? `Overdue ${bill.overdue_days ?? ''} days` : `Due: ${bill.due}`}
                          </p>
                        </div>
                      </div>

                      <div className="bill-item__right" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ textAlign: 'right' }}>
                          <p className="bill-item__amount">
                            {typeof bill.amount === 'number'
                              ? fmt(bill.amount)
                              : bill.amount}
                          </p>
                          <span className={badge.className}>
                            {badge.icon}
                            {badge.label}
                          </span>
                        </div>
                        <div className="bill-item__actions" style={{ display: 'flex', gap: '4px' }}>
                          <button
                            onClick={() => handleToggleStatus(bill)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: bill.status === 'paid' ? 'var(--color-primary)' : 'var(--color-secondary)',
                              cursor: 'pointer',
                              padding: '4px',
                              display: 'flex',
                              alignItems: 'center'
                            }}
                            title={bill.status === 'paid' ? "Mark as unpaid" : "Mark as paid"}
                          >
                            <ShieldCheck size={18} style={{ color: bill.status === 'paid' ? 'var(--color-primary)' : '#94a3b8' }} />
                          </button>
                          <button
                            onClick={() => handleDeleteBill(bill.id)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: 'var(--color-error)',
                              cursor: 'pointer',
                              padding: '4px',
                              display: 'flex',
                              alignItems: 'center'
                            }}
                            title="Delete bill"
                          >
                            <span style={{ fontSize: '18px', color: 'var(--color-error)', cursor: 'pointer', fontWeight: 'bold' }}>✕</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Smart Insight */}
            <div className="insight-box">
              <div className="insight-box__inner">
                <div className="insight-box__icon-wrap">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <p className="insight-box__heading">Smart Insights</p>
                  <p className="insight-box__text">
                    You could save $45/mo by switching your internet provider.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>{/* /right-panel */}
      </div>{/* /bills-grid */}

      {/* ── Add Bill Modal ─────────────────────────────── */}
      {showAddForm && (
        <div className="modal-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(11, 28, 48, 0.4)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100000
        }}>
          <div className="modal-content" style={{
            backgroundColor: 'var(--color-surface-container-lowest)',
            padding: '30px',
            borderRadius: 'var(--radius-lg)',
            width: '100%',
            maxWidth: '450px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.15)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-on-surface)' }}>Add New Bill</h3>
              <button onClick={() => setShowAddForm(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-secondary)', fontSize: '18px', fontWeight: 'bold' }}>
                ✕
              </button>
            </div>

            {formError && (
              <div className="error-box" style={{
                backgroundColor: 'rgba(186, 26, 26, 0.1)',
                border: '1px solid var(--color-error)',
                color: 'var(--color-error)',
                padding: '12px',
                borderRadius: '8px',
                marginBottom: '16px',
                fontSize: '14px',
                textAlign: 'center'
              }}>
                {formError}
              </div>
            )}

            <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500, color: 'var(--color-secondary)' }}>Bill Description / Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g. Electric Bill"
                  required
                  style={{ width: '100%', padding: '12px', border: '1px solid var(--color-outline-variant)', borderRadius: '8px', background: 'var(--color-surface-container-low)', color: 'var(--color-on-surface)', boxSizing: 'border-box', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500, color: 'var(--color-secondary)' }}>Amount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    required
                    style={{ width: '100%', padding: '12px', border: '1px solid var(--color-outline-variant)', borderRadius: '8px', background: 'var(--color-surface-container-low)', color: 'var(--color-on-surface)', boxSizing: 'border-box', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500, color: 'var(--color-secondary)' }}>Due Date</label>
                  <input
                    type="date"
                    name="due"
                    value={formData.due}
                    onChange={handleInputChange}
                    required
                    style={{ width: '100%', padding: '12px', border: '1px solid var(--color-outline-variant)', borderRadius: '8px', background: 'var(--color-surface-container-low)', color: 'var(--color-on-surface)', boxSizing: 'border-box', height: '43px', outline: 'none' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500, color: 'var(--color-secondary)' }}>Category / Type</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    style={{ width: '100%', padding: '12px', border: '1px solid var(--color-outline-variant)', borderRadius: '8px', background: 'var(--color-surface-container-low)', color: 'var(--color-on-surface)', boxSizing: 'border-box', height: '43px', outline: 'none', cursor: 'pointer' }}
                  >
                    <option value="rent">Rent / Home</option>
                    <option value="electricity">Electricity / Utility</option>
                    <option value="subscription">Subscription</option>
                    <option value="internet">Internet / Wifi</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500, color: 'var(--color-secondary)' }}>Payment Method</label>
                  <select
                    name="payment_method"
                    value={formData.payment_method}
                    onChange={handleInputChange}
                    style={{ width: '100%', padding: '12px', border: '1px solid var(--color-outline-variant)', borderRadius: '8px', background: 'var(--color-surface-container-low)', color: 'var(--color-on-surface)', boxSizing: 'border-box', height: '43px', outline: 'none', cursor: 'pointer' }}
                  >
                    <option value="manual">Manual Payment</option>
                    <option value="auto">Auto-pay</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500, color: 'var(--color-secondary)' }}>Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  style={{ width: '100%', padding: '12px', border: '1px solid var(--color-outline-variant)', borderRadius: '8px', background: 'var(--color-surface-container-low)', color: 'var(--color-on-surface)', boxSizing: 'border-box', height: '43px', outline: 'none', cursor: 'pointer' }}
                >
                  <option value="unpaid">Unpaid</option>
                  <option value="paid">Paid</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowAddForm(false)} style={{ flex: 1, padding: '12px', border: '1px solid var(--color-outline-variant)', borderRadius: '8px', background: 'transparent', color: 'var(--color-on-surface)', cursor: 'pointer', fontFamily: 'var(--font-family)', fontSize: '14px' }}>
                  Cancel
                </button>
                <button type="submit" style={{ flex: 1, padding: '12px', border: 'none', borderRadius: '8px', background: 'var(--color-primary)', color: 'var(--color-on-primary)', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-family)', fontSize: '14px' }}>
                  Save Bill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Bills;