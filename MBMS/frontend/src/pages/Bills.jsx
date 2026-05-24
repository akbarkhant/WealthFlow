import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Home,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  User,
  Wifi,
  X,
  Zap,
  PlayCircle,
} from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';
import api from '../utils/api';
import '../styles/pages/Bills.css';

const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const money = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

const getBillIcon = (type) => {
  const icons = {
    rent: Home,
    electricity: Zap,
    subscription: PlayCircle,
    internet: Wifi,
  };
  return icons[type] || CreditCard;
};

const getPaymentBadge = (method) => {
  if (method === 'auto') {
    return { className: 'status-pill status-success', icon: RefreshCw, label: 'Auto-pay' };
  }
  return { className: 'status-pill status-muted', icon: User, label: 'Manual' };
};

const getEventVariant = (type) => {
  if (type === 'rent') return 'tertiary';
  if (type === 'electricity') return 'error';
  return 'primary';
};

const buildCalendarCells = (year, month, bills) => {
  const firstDay = new Date(year, month, 1);
  const lastDate = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  const startDow = (firstDay.getDay() + 6) % 7;
  const cells = [];
  const prevLastDate = new Date(year, month, 0).getDate();

  for (let index = startDow - 1; index >= 0; index -= 1) {
    cells.push({ day: prevLastDate - index, overflow: true, events: [] });
  }

  for (let day = 1; day <= lastDate; day += 1) {
    const isToday =
      today.getFullYear() === year &&
      today.getMonth() === month &&
      today.getDate() === day;

    const events = bills.filter((bill) => {
      const dueDay = bill.due_day ?? Number((bill.due || '').split('-')[2]);
      return dueDay === day;
    });

    cells.push({ day, overflow: false, isToday, events });
  }

  while (cells.length % 7 !== 0) {
    cells.push({ day: cells.length, overflow: true, events: [] });
  }

  return cells;
};

const Bills = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const [viewMode, setViewMode] = useState('month');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [formError, setFormError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    due: new Date().toISOString().split('T')[0],
    type: 'rent',
    payment_method: 'manual',
    status: 'unpaid',
  });

  const today = useMemo(() => new Date(), []);
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());

  const showToast = (message, tone = 'success') => {
    setToast({ message, tone });
    window.setTimeout(() => setToast(null), 3000);
  };

  const fetchBills = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await api.get('/bills');
      setBills(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching bills:', err);
      setError('We could not load the bill calendar right now.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBills();
  }, []);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      title: '',
      amount: '',
      due: new Date().toISOString().split('T')[0],
      type: 'rent',
      payment_method: 'manual',
      status: 'unpaid',
    });
    setFormError('');
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    setFormError('');

    if (!formData.title.trim()) {
      setFormError('Bill title is required.');
      return;
    }
    if (!Number.isFinite(Number(formData.amount)) || Number(formData.amount) <= 0) {
      setFormError('Amount must be greater than zero.');
      return;
    }
    if (!formData.due) {
      setFormError('Due date is required.');
      return;
    }

    try {
      await api.post('/bills', formData);
      resetForm();
      setShowAddForm(false);
      await fetchBills();
      showToast('Bill added to the calendar.');
    } catch (err) {
      setFormError('Failed to add bill.');
    }
  };

  const handleToggleStatus = async (bill) => {
    try {
      const nextStatus = bill.status === 'paid' ? 'unpaid' : 'paid';
      await api.put(`/bills/${bill.id}`, { status: nextStatus });
      await fetchBills();
      showToast(`Marked ${bill.title || bill.name} as ${nextStatus}.`);
    } catch (err) {
      showToast('Failed to update bill status.', 'error');
    }
  };

  const handleDeleteBill = async () => {
    if (!pendingDelete) return;

    try {
      await api.delete(`/bills/${pendingDelete.id}`);
      setPendingDelete(null);
      await fetchBills();
      showToast('Bill deleted.');
    } catch (err) {
      showToast('Failed to delete bill.', 'error');
    }
  };

  const goToPrevMonth = () => {
    setCalMonth((month) => {
      if (month === 0) {
        setCalYear((year) => year - 1);
        return 11;
      }
      return month - 1;
    });
  };

  const goToNextMonth = () => {
    setCalMonth((month) => {
      if (month === 11) {
        setCalYear((year) => year + 1);
        return 0;
      }
      return month + 1;
    });
  };

  const filteredBills = useMemo(() => {
    return bills.filter((bill) => (bill.title || bill.name || '').toLowerCase().includes(searchQuery.toLowerCase()));
  }, [bills, searchQuery]);

  const calendarCells = useMemo(() => buildCalendarCells(calYear, calMonth, bills), [calYear, calMonth, bills]);
  const visibleCalendarCells = useMemo(() => {
    if (viewMode === 'month') return calendarCells;

    const activeDay =
      calYear === today.getFullYear() && calMonth === today.getMonth()
        ? today.getDate()
        : 1;
    const activeIndex = Math.max(0, calendarCells.findIndex((cell) => !cell.overflow && cell.day === activeDay));
    const weekStart = activeIndex - (activeIndex % 7);
    return calendarCells.slice(weekStart, weekStart + 7);
  }, [calendarCells, calMonth, calYear, today, viewMode]);

  const monthLabel = new Date(calYear, calMonth, 1).toLocaleString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const summary = bills.reduce(
    (acc, bill) => {
      const amount = Number(bill.amount || 0);
      acc.total += amount;
      if (bill.status === 'paid') acc.paid += amount;
      if (bill.status !== 'paid') acc.pending += amount;
      return acc;
    },
    { total: 0, paid: 0, pending: 0 }
  );

  return (
    <DashboardLayout>
      <section className="page-stack bills-page">
        <div className="page-header">
          <div>
            <p className="page-eyebrow">Payment schedule</p>
            <h1 className="page-title">Bill Calendar</h1>
            <p className="page-subtitle">
              Plan recurring obligations, track payment status, and keep every due date visible.
            </p>
          </div>
          <button className="btn btn-primary" type="button" onClick={() => setShowAddForm(true)}>
            <Plus size={18} />
            Add Bill
          </button>
        </div>

        {loading && (
          <div className="loading-state">
            <div className="spinner" />
            <h3>Loading bill calendar</h3>
            <p>We are syncing upcoming payments and calendar events.</p>
          </div>
        )}

        {!loading && error && (
          <div className="error-state">
            <AlertCircle />
            <h3>Bills unavailable</h3>
            <p>{error}</p>
            <button className="btn btn-primary" type="button" onClick={fetchBills}>Retry</button>
          </div>
        )}

        {!loading && !error && (
          <div className="bills-grid">
            <section className="calendar-card surface-card">
              <div className="calendar-top">
                <div className="calendar-top__left">
                  <span className="calendar-icon"><CalendarDays size={20} /></span>
                  <div>
                    <p className="section-kicker">Calendar</p>
                    <h2>{monthLabel}</h2>
                  </div>
                </div>

                <div className="calendar-actions">
                  <div className="calendar-nav">
                    <button className="icon-button" type="button" aria-label="Previous month" onClick={goToPrevMonth}>
                      <ChevronLeft />
                    </button>
                    <button className="icon-button" type="button" aria-label="Next month" onClick={goToNextMonth}>
                      <ChevronRight />
                    </button>
                  </div>
                  <div className="segmented-control" aria-label="Calendar view">
                    <button className={viewMode === 'week' ? 'is-active' : ''} type="button" onClick={() => setViewMode('week')}>Week</button>
                    <button className={viewMode === 'month' ? 'is-active' : ''} type="button" onClick={() => setViewMode('month')}>Month</button>
                  </div>
                </div>
              </div>

              <div className={`calendar-grid calendar-grid--${viewMode}`}>
                {weekDays.map((day) => (
                  <div key={day} className="calendar-day-header">{day}</div>
                ))}

                {visibleCalendarCells.map((cell, index) => (
                  <div
                    key={`${cell.day}-${index}`}
                    className={[
                      'calendar-cell',
                      cell.overflow ? 'calendar-cell--muted' : '',
                      cell.isToday ? 'calendar-cell--today' : '',
                    ].filter(Boolean).join(' ')}
                  >
                    <span className="calendar-cell__day">{cell.day}</span>
                    {cell.isToday && <span className="calendar-cell__today-label">Today</span>}
                    {!cell.overflow && cell.events.map((event, eventIndex) => {
                      const variant = getEventVariant(event.type);
                      return (
                        <div key={`${event.id}-${eventIndex}`} className={`calendar-event calendar-event--${variant}`}>
                          <span />
                          <strong>{event.title || event.name}</strong>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </section>

            <aside className="bills-side-panel">
              <section className="summary-card">
                <p>Upcoming This Month</p>
                <h2 className="amount">{money.format(summary.total)}</h2>
                <div className="summary-card__stats">
                  <div>
                    <span>Paid</span>
                    <strong>{money.format(summary.paid)}</strong>
                  </div>
                  <div>
                    <span>Pending</span>
                    <strong>{money.format(summary.pending)}</strong>
                  </div>
                </div>
              </section>

              <section className="upcoming-card surface-card">
                <div className="upcoming-card__header">
                  <div>
                    <p className="section-kicker">Bills</p>
                    <h2>Upcoming Bills</h2>
                  </div>
                  <span className="status-pill status-muted">{filteredBills.length} found</span>
                </div>

                <div className="input-shell bills-search">
                  <Search className="input-icon" />
                  <input
                    className="input"
                    type="search"
                    placeholder="Search bills"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                  />
                </div>

                <div className="bills-list">
                  {filteredBills.length === 0 ? (
                    <div className="mini-empty">No bills match your search.</div>
                  ) : (
                    filteredBills.map((bill) => {
                      const Icon = getBillIcon(bill.type);
                      const badge = getPaymentBadge(bill.payment_method);
                      const BadgeIcon = badge.icon;
                      const isOverdue = bill.status === 'overdue';

                      return (
                        <article className={`bill-item ${isOverdue ? 'bill-item--overdue' : ''}`} key={bill.id}>
                          <div className="bill-item__left">
                            <span className="bill-item__icon"><Icon size={20} /></span>
                            <div>
                              <h3>{bill.title || bill.name}</h3>
                              <p>{isOverdue ? `Overdue ${bill.overdue_days || ''} days` : `Due ${bill.due}`}</p>
                            </div>
                          </div>

                          <div className="bill-item__right">
                            <strong className="amount">{money.format(Number(bill.amount || 0))}</strong>
                            <span className={badge.className}>
                              <BadgeIcon size={12} />
                              {badge.label}
                            </span>
                          </div>

                          <div className="bill-item__actions">
                            <button
                              className="icon-button"
                              type="button"
                              aria-label={bill.status === 'paid' ? 'Mark unpaid' : 'Mark paid'}
                              onClick={() => handleToggleStatus(bill)}
                            >
                              <ShieldCheck size={18} />
                            </button>
                            <button
                              className="icon-button danger-button"
                              type="button"
                              aria-label={`Delete ${bill.title || bill.name}`}
                              onClick={() => setPendingDelete(bill)}
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </article>
                      );
                    })
                  )}
                </div>
              </section>
            </aside>
          </div>
        )}

        {showAddForm && (
          <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="bill-modal-title">
            <div className="modal-panel">
              <div className="modal-header">
                <h2 className="modal-title" id="bill-modal-title">Add Bill</h2>
                <button className="icon-button" type="button" aria-label="Close modal" onClick={() => { setShowAddForm(false); resetForm(); }}>
                  <X />
                </button>
              </div>
              <div className="modal-body">
                {formError && <div className="alert alert-error">{formError}</div>}
                <form className="modal-form" onSubmit={handleFormSubmit}>
                  <div className="field">
                    <label htmlFor="bill-title">Bill title</label>
                    <input className="input" id="bill-title" name="title" type="text" placeholder="Electric Bill" value={formData.title} onChange={handleInputChange} />
                  </div>
                  <div className="form-grid">
                    <div className="field">
                      <label htmlFor="bill-amount">Amount</label>
                      <input className="input" id="bill-amount" name="amount" type="number" min="0" step="0.01" placeholder="0.00" value={formData.amount} onChange={handleInputChange} />
                    </div>
                    <div className="field">
                      <label htmlFor="bill-due">Due date</label>
                      <input className="input" id="bill-due" name="due" type="date" value={formData.due} onChange={handleInputChange} />
                    </div>
                  </div>
                  <div className="form-grid">
                    <div className="field">
                      <label htmlFor="bill-type">Category</label>
                      <select className="select" id="bill-type" name="type" value={formData.type} onChange={handleInputChange}>
                        <option value="rent">Rent or Home</option>
                        <option value="electricity">Electricity</option>
                        <option value="subscription">Subscription</option>
                        <option value="internet">Internet</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div className="field">
                      <label htmlFor="bill-method">Payment method</label>
                      <select className="select" id="bill-method" name="payment_method" value={formData.payment_method} onChange={handleInputChange}>
                        <option value="manual">Manual</option>
                        <option value="auto">Auto-pay</option>
                      </select>
                    </div>
                  </div>
                  <div className="field">
                    <label htmlFor="bill-status">Status</label>
                    <select className="select" id="bill-status" name="status" value={formData.status} onChange={handleInputChange}>
                      <option value="unpaid">Unpaid</option>
                      <option value="paid">Paid</option>
                      <option value="overdue">Overdue</option>
                    </select>
                  </div>
                  <div className="modal-actions">
                    <button className="btn btn-secondary" type="button" onClick={() => { setShowAddForm(false); resetForm(); }}>Cancel</button>
                    <button className="btn btn-primary" type="submit">Save Bill</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {pendingDelete && (
          <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="delete-bill-title">
            <div className="modal-panel confirm-panel">
              <div className="modal-header">
                <h2 className="modal-title" id="delete-bill-title">Delete bill?</h2>
                <button className="icon-button" type="button" aria-label="Close modal" onClick={() => setPendingDelete(null)}>
                  <X />
                </button>
              </div>
              <div className="modal-body">
                <p className="confirm-copy">This removes <strong>{pendingDelete.title || pendingDelete.name}</strong> from the schedule.</p>
                <div className="modal-actions">
                  <button className="btn btn-secondary" type="button" onClick={() => setPendingDelete(null)}>Cancel</button>
                  <button className="btn btn-danger" type="button" onClick={handleDeleteBill}>
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {toast && (
          <div className="toast-stack" role="status" aria-live="polite">
            <div className={`toast toast-${toast.tone}`}>
              {toast.tone === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
              <span>{toast.message}</span>
            </div>
          </div>
        )}
      </section>
    </DashboardLayout>
  );
};

export default Bills;
