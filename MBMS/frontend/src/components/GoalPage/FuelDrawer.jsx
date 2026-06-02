import React, { useState, useEffect, useRef } from 'react';

const QUICK_AMOUNTS = [10, 25, 50, 100, 250, 500];

function fmtFull(n, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency,
    minimumFractionDigits: 2, maximumFractionDigits: 2,
  }).format(n);
}
function fmtShort(n, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency,
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(n);
}

function GoalProgressMini({ goal }) {
  const pct = goal.target_amount > 0
    ? Math.min((Number(goal.current_amount) / Number(goal.target_amount)) * 100, 100)
    : 0;
  return (
    <div className="fd-mini-progress">
      <div className="fd-mini-track">
        <div className="fd-mini-fill" style={{ width: `${pct}%` }} />
      </div>
      <span className="fd-mini-pct">{Math.round(pct)}%</span>
    </div>
  );
}

export function FuelDrawer({ goal, isOpen, onClose, onContribute }) {
  const [amount,    setAmount]    = useState('');
  const [note,      setNote]      = useState('');
  const [loading,   setLoading]   = useState(false);
  const [amtError,  setAmtError]  = useState('');
  const inputRef = useRef(null);

  /* Reset on open */
  useEffect(() => {
    if (isOpen) {
      setAmount('');
      setNote('');
      setAmtError('');
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 280);
    }
  }, [isOpen, goal?.id]);

  /* Close on Escape */
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape' && isOpen) onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!goal) return null;

  const remaining   = Math.max(0, Number(goal.target_amount) - Number(goal.current_amount));
  const smartQuick  = QUICK_AMOUNTS.filter(v => v < remaining + 0.01).slice(0, 5);
  if (remaining > 0 && !smartQuick.includes(Math.round(remaining))) {
    smartQuick.push(Math.round(remaining));
  }

  const parsedAmt = parseFloat(amount);
  const willComplete = parsedAmt > 0 && (Number(goal.current_amount) + parsedAmt) >= Number(goal.target_amount);
  const overflow     = !goal.allow_overflow && parsedAmt > remaining;

  const validate = () => {
    if (!parsedAmt || parsedAmt <= 0) { setAmtError('Enter an amount greater than 0'); return false; }
    if (overflow) {
      setAmtError(`Max contribution is ${fmtFull(remaining, goal.currency)} (overflow disabled)`);
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await onContribute(goal.id, parsedAmt, note.trim() || undefined);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fd-backdrop${isOpen ? ' fd-backdrop--open' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <aside
        className={`fd-panel${isOpen ? ' fd-panel--open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={`Add contribution to ${goal.name}`}
      >
        {/* Handle */}
        <div className="fd-handle" aria-hidden="true" />

        {/* Header */}
        <div className="fd-header">
          <div>
            <p className="fd-header-eyebrow">Contribution</p>
            <h2 className="fd-header-title">Fuel a goal</h2>
          </div>
          <button className="fd-close-btn" onClick={onClose} aria-label="Close drawer">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Goal card preview */}
        <div className="fd-goal-preview">
          <div className="fd-goal-icon">{goal.icon || '🎯'}</div>
          <div className="fd-goal-info">
            <p className="fd-goal-name">{goal.name}</p>
            <p className="fd-goal-balance">
              {fmtFull(goal.current_amount, goal.currency)}
              <span className="fd-goal-balance-sep"> saved of </span>
              {fmtFull(goal.target_amount, goal.currency)}
            </p>
            <GoalProgressMini goal={goal} />
          </div>
        </div>

        {/* Form */}
        <form className="fd-form" onSubmit={handleSubmit} noValidate>

          {/* Amount input */}
          <div className={`fd-field${amtError ? ' fd-field--error' : ''}`}>
            <label className="fd-label" htmlFor="fuel-amount">Amount</label>
            <div className="fd-amount-wrap">
              <span className="fd-currency-prefix">
                {goal.currency === 'USD' ? '$' : goal.currency}
              </span>
              <input
                ref={inputRef}
                id="fuel-amount"
                className="fd-amount-input"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={e => { setAmount(e.target.value); setAmtError(''); }}
                disabled={loading}
                autoComplete="off"
              />
              {remaining > 0 && (
                <button
                  type="button"
                  className="fd-max-btn"
                  onClick={() => { setAmount(remaining.toFixed(2)); setAmtError(''); }}
                  disabled={loading}
                >
                  Max
                </button>
              )}
            </div>
            {amtError && <p className="fd-error-msg" role="alert">{amtError}</p>}
          </div>

          {/* Quick amounts */}
          {smartQuick.length > 0 && (
            <div className="fd-quick-row" role="group" aria-label="Quick amount presets">
              {smartQuick.map(v => (
                <button
                  key={v}
                  type="button"
                  className={`fd-quick-btn${parseFloat(amount) === v ? ' fd-quick-btn--active' : ''}`}
                  onClick={() => { setAmount(String(v)); setAmtError(''); }}
                  disabled={loading}
                >
                  {fmtShort(v, goal.currency)}
                </button>
              ))}
            </div>
          )}

          {/* Will-complete hint */}
          {willComplete && !overflow && (
            <div className="fd-completion-hint" role="note">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              This contribution will complete your goal 🎉
            </div>
          )}

          {/* Note field */}
          <div className="fd-field">
            <label className="fd-label" htmlFor="fuel-note">
              Note
              <span className="fd-label-optional"> — optional</span>
            </label>
            <textarea
              id="fuel-note"
              className="fd-note-input"
              rows={2}
              placeholder="Monthly saving, bonus payout, etc."
              value={note}
              onChange={e => setNote(e.target.value)}
              disabled={loading}
              maxLength={120}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className={`fd-submit-btn${loading ? ' fd-submit-btn--loading' : ''}`}
            disabled={loading || !amount}
          >
            {loading ? (
              <>
                <span className="fd-spinner" aria-hidden="true" />
                Processing…
              </>
            ) : (
              <>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Add contribution
              </>
            )}
          </button>

        </form>
      </aside>
    </>
  );
}