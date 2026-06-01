// pages/History/HistoryPage.jsx

import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Wallet, Tag } from 'lucide-react';
import { useApi } from '../hooks/useApi';
import { getMonthlyReport, getCategoryBreakdown } from '../api/chartsApi';
import '../styles/pages/HistoryPage.css';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function getCurrentPeriod() {
  const now = new Date();
  return { month: now.getMonth() + 1, year: now.getFullYear() };
}

export default function HistoryPage() {
  const { month: currentMonth, year: currentYear } = getCurrentPeriod();

  const [month, setMonth] = useState(currentMonth);
  const [year, setYear]   = useState(currentYear);

  const isCurrentMonth = month === currentMonth && year === currentYear;

  // ── Navigation ───────────────────────────────────────────────────
  const goBack = () => {
    if (month === 1) { setMonth(12); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
  };

  const goForward = () => {
    if (isCurrentMonth) return;
    if (month === 12) { setMonth(1); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
  };

  // ── Data ─────────────────────────────────────────────────────────
  const { data: summary, loading: loadingSummary } = useApi(
    () => getMonthlyReport({ month, year }),
    [month, year]
  );

  const { data: breakdown, loading: loadingBreakdown } = useApi(
    () => getCategoryBreakdown({ month, year }),
    [month, year]
  );

  const loading = loadingSummary || loadingBreakdown;

  const totalIncome   = Number(summary?.totalIncome   ?? 0);
  const totalExpenses = Number(summary?.totalExpenses ?? 0);
  const netSavings    = Number(summary?.netSavings    ?? 0);
  const isPositive    = netSavings >= 0;

  // Normalize breakdown — API may return array or object with categories key
  const categories = useMemo(() => {
    if (!breakdown) return [];
    if (Array.isArray(breakdown)) return breakdown;
    if (Array.isArray(breakdown.categories)) return breakdown.categories;
    if (Array.isArray(summary?.topCategories)) return summary.topCategories;
    return [];
  }, [breakdown, summary]);

  const maxCategoryTotal = Math.max(...categories.map((c) => Number(c.total ?? 0)), 1);

  const fmt = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  });

  return (
    <div className="history-page">

      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="history-header">
        <div className="history-header__text">
          <h1>History</h1>
          <p>Browse your financial activity month by month</p>
        </div>
      </div>

      {/* ── Month Navigator ────────────────────────────────────── */}
      <div className="history-nav">
        <button className="history-nav__btn" onClick={goBack} aria-label="Previous month">
          <ChevronLeft size={18} />
        </button>

        <div className="history-nav__label">
          <span className="history-nav__month">{MONTH_NAMES[month - 1]}</span>
          <span className="history-nav__year">{year}</span>
        </div>

        <button
          className={`history-nav__btn ${isCurrentMonth ? 'is-disabled' : ''}`}
          onClick={goForward}
          aria-label="Next month"
          disabled={isCurrentMonth}
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {loading ? (
        <div className="history-loading">
          <div className="history-loading__spinner" />
          <p>Loading data…</p>
        </div>
      ) : (
        <>
          {/* ── Summary Cards ──────────────────────────────────── */}
          <div className="history-cards">

            <div className="history-card history-card--income">
              <div className="history-card__icon">
                <TrendingUp size={18} />
              </div>
              <div className="history-card__body">
                <span>Total Income</span>
                <strong>{fmt.format(totalIncome)}</strong>
              </div>
            </div>

            <div className="history-card history-card--expense">
              <div className="history-card__icon">
                <TrendingDown size={18} />
              </div>
              <div className="history-card__body">
                <span>Total Expenses</span>
                <strong>{fmt.format(totalExpenses)}</strong>
              </div>
            </div>

            <div className={`history-card history-card--net ${isPositive ? 'is-positive' : 'is-negative'}`}>
              <div className="history-card__icon">
                <Wallet size={18} />
              </div>
              <div className="history-card__body">
                <span>Net Savings</span>
                <strong>{fmt.format(netSavings)}</strong>
              </div>
            </div>

          </div>

          {/* ── Category Breakdown ─────────────────────────────── */}
          <div className="history-breakdown">
            <div className="history-breakdown__header">
              <Tag size={14} />
              <h2>Spending by Category</h2>
            </div>

            {categories.length === 0 ? (
              <div className="history-empty">
                <p>No transactions recorded for {MONTH_NAMES[month - 1]} {year}.</p>
              </div>
            ) : (
              <div className="history-breakdown__list">
                {categories.map((cat, i) => {
                  const total   = Number(cat.total ?? 0);
                  const pct     = Math.round((total / maxCategoryTotal) * 100);
                  return (
                    <div key={cat.categoryName ?? i} className="history-breakdown__row">
                      <div className="history-breakdown__meta">
                        <span className="history-breakdown__icon">{cat.categoryIcon}</span>
                        <span className="history-breakdown__name">{cat.categoryName}</span>
                        <span className="history-breakdown__amount">{fmt.format(total)}</span>
                      </div>
                      <div className="history-breakdown__bar-track">
                        <div
                          className="history-breakdown__bar-fill"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}