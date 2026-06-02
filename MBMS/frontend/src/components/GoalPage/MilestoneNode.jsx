import React, { useMemo } from 'react';

const STATUS_META = {
  ACTIVE:    { label: 'Active',    colorClass: 'status--active',    barClass: 'bar--active' },
  COMPLETED: { label: 'Completed', colorClass: 'status--completed', barClass: 'bar--completed' },
  OVERDRIVE: { label: 'Overdrive', colorClass: 'status--overdrive', barClass: 'bar--overdrive' },
  OVERDUE:   { label: 'Overdue',   colorClass: 'status--overdue',   barClass: 'bar--overdue' },
  PAUSED:    { label: 'Paused',    colorClass: 'status--paused',    barClass: 'bar--paused' },
};

function calcProgress(goal) {
  if (!goal.target_amount || Number(goal.target_amount) === 0) return 0;
  return (Number(goal.current_amount) / Number(goal.target_amount)) * 100;
}

function daysLeft(targetDate) {
  if (!targetDate) return null;
  return Math.ceil((new Date(targetDate) - new Date()) / (1000 * 60 * 60 * 24));
}

function fmtCurrency(n, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency,
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(n);
}

function fmtCurrencyFull(n, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency,
    minimumFractionDigits: 2, maximumFractionDigits: 2,
  }).format(n);
}

export function MilestoneNode({ goal, derivedStatus, displayCurrency, onFuelClick, onDeleteClick }) {
  const status   = derivedStatus || 'ACTIVE';
  const meta     = STATUS_META[status] || STATUS_META.ACTIVE;
  const progress = calcProgress(goal);
  const dl       = daysLeft(goal.deadline || goal.target_date); // Adjusted for frontend form 'deadline' mapping

  const visualPct   = Math.min(progress, 100);
  const displayPct  = Math.round(progress);
  const remaining   = Math.max(0, Number(goal.target_amount) - Number(goal.current_amount));

  const dailyRequired = useMemo(() => {
    if (status !== 'ACTIVE' || !dl || dl <= 0 || remaining <= 0) return null;
    return remaining / dl;
  }, [status, dl, remaining]);

  const isActionable = status === 'ACTIVE' || status === 'OVERDUE';

  const daysLabel = useMemo(() => {
    if (!dl) return null;
    if (status === 'COMPLETED') return { text: 'Completed', mod: 'days--done' };
    if (dl < 0)  return { text: `${Math.abs(dl)}d overdue`, mod: 'days--urgent' };
    if (dl <= 7) return { text: `${dl}d left`,  mod: 'days--urgent' };
    return { text: `${dl}d left`, mod: '' };
  }, [dl, status]);

  /* SVG ring settings */
  const RADIUS = 44;
  const CIRC   = 2 * Math.PI * RADIUS;
  const offset = CIRC - (visualPct / 100) * CIRC;

  // Determine if we need to display a local exchange preview hint
  const hasAlternateCurrency = displayCurrency && goal.currency !== displayCurrency;

  return (
    <article className={`mn-card mn-card--${status.toLowerCase()}`}>

      {/* ── Card header ── */}
      <div className="mn-header">
        <div 
          className={`mn-ring-wrap ${meta.colorClass} ${isActionable ? 'mn-ring-wrap--actionable' : ''}`} 
          aria-hidden="true" 
          onClick={() => isActionable && onFuelClick(goal)}
        >
          <svg className="mn-ring-svg" viewBox="0 0 100 100" width="72" height="72">
            <circle className="mn-ring-bg"  cx="50" cy="50" r={RADIUS} />
            <circle
              className={`mn-ring-bar ${meta.barClass}`}
              cx="50" cy="50" r={RADIUS}
              strokeDasharray={CIRC}
              strokeDashoffset={offset}
              strokeLinecap="round"
              transform="rotate(-90 50 50)"
            />
          </svg>
          <span className="mn-ring-icon" aria-label={goal.name}>{goal.icon || '🎯'}</span>
          {status === 'COMPLETED' && <span className="mn-badge-complete" aria-label="Completed">✨</span>}
        </div>

        <div className="mn-header-right">
          <div className="mn-meta-row">
            <span className={`mn-status-chip ${meta.colorClass}`}>{meta.label}</span>
            {/* Delete Option Icon Anchor */}
            {onDeleteClick && (
              <button 
                className="mn-delete-action-btn"
                onClick={() => onDeleteClick(goal.id, goal.name)}
                title={`Purge milestone profile "${goal.name}"`}
                aria-label={`Delete ${goal.name}`}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </button>
            )}
          </div>
          <h3 className="mn-title">{goal.name}</h3>
          {goal.description && <p className="mn-desc">{goal.description}</p>}
        </div>
      </div>

      {/* ── Progress bar ── */}
      <div className="mn-progress-section">
        <div className="mn-progress-track" role="progressbar" aria-valuenow={displayPct} aria-valuemin={0} aria-valuemax={100}>
          <div className={`mn-progress-fill ${meta.barClass}`} style={{ width: `${visualPct}%` }} />
        </div>
        <div className="mn-progress-row">
          <span className={`mn-pct${status === 'OVERDRIVE' ? ' mn-pct--overdrive' : ''}`}>{displayPct}%</span>
          <div className="mn-amounts-stack">
            <span className="mn-amounts">
              {fmtCurrencyFull(goal.current_amount || 0, goal.currency)}
              <span className="mn-amounts-sep">/</span>
              {fmtCurrencyFull(goal.target_amount  || 0, goal.currency)}
            </span>
            {/* Currency conversion conversion mirror display */}
            {hasAlternateCurrency && goal.convertedCurrent !== undefined && (
              <span className="mn-amounts-converted">
                ≈ {fmtCurrencyFull(goal.convertedCurrent, displayCurrency)} / {fmtCurrencyFull(goal.convertedTarget, displayCurrency)}
              </span>
            )}
          </div>
        </div>
        {dailyRequired != null && (
          <p className="mn-daily-hint">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            {fmtCurrency(dailyRequired, goal.currency)}/day to stay on track
          </p>
        )}
      </div>

      {/* ── Card footer ── */}
      <div className="mn-footer">
        {daysLabel ? (
          <span className={`mn-days ${daysLabel.mod}`}>{daysLabel.text}</span>
        ) : (
          <span />
        )}
        {isActionable ? (
          <button
            className="mn-fuel-btn"
            onClick={() => onFuelClick(goal)}
            aria-label={`Add contribution to ${goal.name}`}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Fuel goal
          </button>
        ) : (
          <span className="mn-completed-tag">
            {status === 'COMPLETED' ? 'Goal reached' : status === 'PAUSED' ? 'On hold' : ''}
          </span>
        )}
      </div>

    </article>
  );
}