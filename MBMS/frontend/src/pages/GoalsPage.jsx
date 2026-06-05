import React, { useState, useMemo } from 'react';
import { useGoals } from '../hooks/useGoals';
import { MilestoneNode } from '../components/GoalPage/MilestoneNode';
import { FuelDrawer } from '../components/GoalPage/FuelDrawer';
import { SUPPORTED_CURRENCIES } from '../hooks/useCurrency';
import DashboardLayout from '../layouts/DashboardLayout';
import '../styles/pages/GoalsPage.css';

const STATUS_FILTERS = [
  { key: 'all', label: 'All goals' },
  { key: 'ACTIVE', label: 'Active' },
  { key: 'COMPLETED', label: 'Completed' },
  { key: 'OVERDRIVE', label: 'Overdrive' },
  { key: 'OVERDUE', label: 'Overdue' },
  { key: 'PAUSED', label: 'Paused' },
];

export default function GoalsPage() {
  const {
    goals,
    loading,
    error,
    fuelGoal,
    createGoal, // <-- Added hook function
    // Currency
    displayCurrency,
    setDisplayCurrency,
    ratesLoading,
    ratesError,
    lastUpdated,
    refreshRates,
    // Summary (already converted + formatted)
    summary,
    // Formatters
    fmtNative,
  } = useGoals({ defaultCurrency: 'USD' });

  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); // <-- Modal visibility
  const [toastMsg, setToastMsg] = useState(null);
  const [toastType, setToastType] = useState('success');

  // New Goal Form State
  const [newGoalData, setNewGoalData] = useState({
    name: '',
    target_amount: '',
    currency: 'USD',
    icon: '🎯',
    allowOverflow: false,
    deadline: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filtered = useMemo(() => {
    if (activeFilter === 'all') return goals;
    return goals.filter(g => g.derivedStatus === activeFilter);
  }, [goals, activeFilter]);

  const showToast = (msg, type = 'success') => {
    setToastMsg(msg);
    setToastType(type);
    setTimeout(() => setToastMsg(null), 3200);
  };

  const handleContribute = async (goalId, amount, note) => {
    const result = await fuelGoal(goalId, amount, note);
    if (result.success) {
      setIsDrawerOpen(false);
      showToast('Contribution added successfully', 'success');
    } else {
      showToast(result.message || 'Transaction failed', 'error');
    }
    return result;
  };

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const result = await createGoal(newGoalData);
    setIsSubmitting(false);

    if (result.success) {
      setIsModalOpen(false);
      showToast('Financial milestone established!', 'success');
      // Reset form variables
      setNewGoalData({
        name: '',
        target_amount: '',
        currency: displayCurrency || 'USD',
        icon: '🎯',
        allowOverflow: false,
        deadline: ''
      });
    } else {
      showToast(result.message || 'Failed to construct goal.', 'error');
    }
  };
  const handleDeleteGoal = async (goalId, goalName) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${goalName}"? This will also remove all its contribution history.`
    );
    if (!confirmDelete) return;

    try {
      const result = await goalsApi.delete(goalId);
      if (result.success) {
        // FIXED: Invoke the clean wrapper function exposed from your hook
        removeGoalFromState(goalId);
        showToast("Goal successfully deleted", "success");
      } else {
        showToast(result.message || "Failed to delete goal", "error");
      }
    } catch (err) {
      showToast("An unexpected error occurred", "error");
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="gp-loading-state">
          <div className="gp-loading-spinner" />
          <span>Loading your milestones…</span>
        </div>
      </DashboardLayout>
    );
  }

  const currencyMeta = SUPPORTED_CURRENCIES.find(c => c.code === displayCurrency);

  return (
    <DashboardLayout>
      <div className="gp-root">

        {/* ── Page header ── */}
        <header className="gp-header">
          <div className="gp-header-left">
            <p className="gp-header-eyebrow">Finance Dashboard</p>
            <h1 className="gp-header-title">Savings Milestones</h1>
          </div>

          <div className="gp-header-actions">
            {/* Currency selector */}
            <div className="gp-currency-selector-wrap">
              <span className="gp-currency-flag" aria-hidden="true">
                {ratesLoading
                  ? <span className="gp-rates-spinner" />
                  : currencyMeta?.symbol ?? displayCurrency}
              </span>
              <select
                className="gp-currency-select"
                value={displayCurrency}
                onChange={e => setDisplayCurrency(e.target.value)}
                aria-label="Display currency"
                title="Change display currency"
              >
                {SUPPORTED_CURRENCIES.map(c => (
                  <option key={c.code} value={c.code}>
                    {c.code} — {c.label}
                  </option>
                ))}
              </select>
              <svg className="gp-currency-chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>

            <button
              className="gp-new-btn"
              onClick={() => setIsModalOpen(true)}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              New goal
            </button>
          </div>
        </header>

        {/* ── Rates / errors ── */}
        {ratesError && (
          <div className="gp-info-banner gp-info-banner--warning" role="alert">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            {ratesError}
            <button className="gp-inline-retry" onClick={refreshRates}>Retry</button>
          </div>
        )}
        {error && (
          <div className="gp-info-banner gp-info-banner--error" role="alert">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
          </div>
        )}

        {/* ── Summary strip ── */}
        <section className="gp-summary-strip" aria-label="Goals summary">
          <SummaryCard
            label="Total saved"
            value={summary.fmtSaved}
            sublabel={`in ${displayCurrency}`}
            accent="green"
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
              </svg>
            }
          />
          <SummaryCard
            label="Target total"
            value={summary.fmtTarget}
            sublabel={`in ${displayCurrency}`}
            accent="blue"
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
              </svg>
            }
          />
          <SummaryCard
            label="Remaining"
            value={summary.fmtRemaining}
            sublabel={`in ${displayCurrency}`}
            accent="amber"
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
              </svg>
            }
          />
          <SummaryCard
            label="Completed"
            value={`${summary.completed} / ${summary.goalCount}`}
            sublabel={`${summary.avgProgress}% avg`}
            accent="teal"
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            }
          />
        </section>

        {/* ── Rates last-updated stamp ── */}
        {lastUpdated && !ratesLoading && (
          <p className="gp-rates-stamp">
            Rates updated {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            <button className="gp-rates-refresh" onClick={refreshRates} aria-label="Refresh exchange rates">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
              </svg>
              Refresh
            </button>
          </p>
        )}

        {/* ── Filters ── */}
        <nav className="gp-filter-bar" aria-label="Filter goals by status">
          {STATUS_FILTERS.map(f => (
            <button
              key={f.key}
              className={`gp-filter-pill${activeFilter === f.key ? ' gp-filter-pill--active' : ''}`}
              onClick={() => setActiveFilter(f.key)}
            >
              {f.label}
              {f.key !== 'all' && (
                <span className="gp-filter-count">
                  {goals.filter(g => g.derivedStatus === f.key).length}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* ── Goals grid ── */}
        <main className="gp-grid" aria-label="Goal cards">
          {filtered.length === 0 ? (
            <div className="gp-empty-state">
              <div className="gp-empty-icon">🎯</div>
              <p>No goals in this category</p>
            </div>
          ) : (
            filtered.map(goal => (
              <MilestoneNode
                key={goal.id}
                goal={goal}
                derivedStatus={goal.derivedStatus}
                displayCurrency={displayCurrency}
                fmtNative={fmtNative}
                onFuelClick={() => { setSelectedGoal(goal); setIsDrawerOpen(true); }}
                onDeleteClick={handleDeleteGoal}
              />
            ))
          )}
        </main>

      </div>

      {/* ── Fuel drawer ── */}
      <FuelDrawer
        goal={selectedGoal}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onContribute={handleContribute}
        fmtNative={fmtNative}
      />

      {/* ── Creation Overlay Modal ── */}
      {isModalOpen && (
        <div className="gp-modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="gp-modal-surface" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true">
            <header className="gp-modal-header">
              <h2>Establish Savings Goal</h2>
              <button className="gp-modal-close" onClick={() => setIsModalOpen(false)} aria-label="Close modal">&times;</button>
            </header>
            <form onSubmit={handleCreateGoal} className="gp-modal-form">
              <div className="gp-form-row">
                <div className="gp-form-group gp-fg-icon">
                  <label htmlFor="goal-icon">Icon</label>
                  <select
                    id="goal-icon"
                    value={newGoalData.icon}
                    onChange={e => setNewGoalData(p => ({ ...p, icon: e.target.value }))}
                  >
                    <option value="🎯">🎯 Target</option>
                    <option value="🏠">🏠 House</option>
                    <option value="🚗">🚗 Vehicle</option>
                    <option value="✈️">✈️ Travel</option>
                    <option value="🎓">🎓 Education</option>
                    <option value="💰">💰 Wealth</option>
                    <option value="🚨">🚨 Emergency</option>
                  </select>
                </div>
                <div className="gp-form-group gp-fg-name">
                  <label htmlFor="goal-name">Goal Identifier Name</label>
                  <input
                    id="goal-name"
                    type="text"
                    required
                    placeholder="e.g., Q4 Emergency Fund"
                    value={newGoalData.name}
                    onChange={e => setNewGoalData(p => ({ ...p, name: e.target.value }))}
                  />
                </div>
              </div>

              <div className="gp-form-row">
                <div className="gp-form-group">
                  <label htmlFor="goal-currency">Native Currency</label>
                  <select
                    id="goal-currency"
                    value={newGoalData.currency}
                    onChange={e => setNewGoalData(p => ({ ...p, currency: e.target.value }))}
                  >
                    {SUPPORTED_CURRENCIES.map(c => (
                      <option key={c.code} value={c.code}>{c.code}</option>
                    ))}
                  </select>
                </div>
                <div className="gp-form-group">
                  <label htmlFor="goal-target">Target Target Amount</label>
                  <input
                    id="goal-target"
                    type="number"
                    min="0.01"
                    step="any"
                    required
                    placeholder="0.00"
                    value={newGoalData.target_amount}
                    onChange={e => setNewGoalData(p => ({ ...p, target_amount: e.target.value }))}
                  />
                </div>
              </div>

              <div className="gp-form-group">
                <label htmlFor="goal-deadline">Target Milestone Deadline (Optional)</label>
                <input
                  id="goal-deadline"
                  type="date"
                  value={newGoalData.deadline}
                  onChange={e => setNewGoalData(p => ({ ...p, deadline: e.target.value }))}
                />
              </div>

              <div className="gp-form-checkbox">
                <input
                  id="goal-overflow"
                  type="checkbox"
                  checked={newGoalData.allowOverflow}
                  onChange={e => setNewGoalData(p => ({ ...p, allowOverflow: e.target.checked }))}
                />
                <label htmlFor="goal-overflow">
                  <strong>Allow Overflow Allocations</strong>
                  <span>Allow ledger records to push overall totals past 100% into Overdrive status.</span>
                </label>
              </div>

              <footer className="gp-modal-actions">
                <button type="button" className="gp-btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="gp-btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Provisioning...' : 'Construct Goal'}
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}

      {/* ── Toast ── */}
      {toastMsg && (
        <div className={`gp-toast gp-toast--${toastType}`} role="status" aria-live="polite">
          <span className="gp-toast-dot" />
          {toastMsg}
        </div>
      )}
    </DashboardLayout>
  );
}

function SummaryCard({ label, value, sublabel, accent, icon }) {
  return (
    <div className={`gp-stat-card gp-stat-card--${accent}`}>
      <div className="gp-stat-icon-wrap" aria-hidden="true">{icon}</div>
      <div>
        <p className="gp-stat-label">{label}</p>
        <p className="gp-stat-value">{value}</p>
        {sublabel && <p className="gp-stat-sublabel">{sublabel}</p>}
      </div>
    </div>
  );
}