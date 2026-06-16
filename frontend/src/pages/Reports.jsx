import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  TrendingUp,
  TrendingDown,
  PieChart,
  RefreshCw,
} from 'lucide-react';
import reportsApi from '../api/reportsApi';
import '../styles/pages/Reports.css';

const money = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

// FIX #5: Readable month label instead of bare "6/2026"
const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

const Reports = () => {
  const today = new Date();

  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year,  setYear]  = useState(today.getFullYear());

  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');
  const [report,    setReport]    = useState(null);
  const [breakdown, setBreakdown] = useState([]);

  // FIX #3 & #4: Wrap in useCallback so the function reference is stable and
  // can be safely listed in the useEffect dependency array without causing
  // an infinite re-fetch loop.
  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const [monthlyRes, breakdownRes] = await Promise.all([
        reportsApi.getMonthly(month, year),
        reportsApi.getBreakdown(month, year),
      ]);

      // FIX #2: The api client (axios) already unwraps response.data via its
      // interceptor, so the values here are already the payload objects — no
      // additional .data access needed. Using them directly avoids double-unwrap.
      setReport(monthlyRes   ?? null);
      setBreakdown(breakdownRes ?? []);
    } catch (err) {
      console.error(err);
      setError('Failed to load reports.');
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const summaryCards = useMemo(() => {
    if (!report) return [];

    return [
      {
        label: 'Income',
        value: report.totalIncome,
        icon:  TrendingUp,
        color: 'green',
      },
      {
        label: 'Expenses',
        value: report.totalExpenses,
        icon:  TrendingDown,
        color: 'red',
      },
      {
        label: 'Net Savings',
        value: report.netSavings,
        icon:  PieChart,
        color: report.netSavings >= 0 ? 'green' : 'red',
      },
    ];
  }, [report]);

  const changeMonth = (delta) => {
    setMonth((m) => {
      let newMonth = m + delta;
      let newYear  = year;

      if (newMonth < 1)  { newMonth = 12; newYear -= 1; }
      if (newMonth > 12) { newMonth = 1;  newYear += 1; }

      setYear(newYear);
      return newMonth;
    });
  };

  return (
      <div className="reports-page">

        {/* Header */}
        <div className="reports-header">
          <h2>Monthly Reports</h2>

          <div className="reports-controls">
            <button onClick={() => changeMonth(-1)} aria-label="Previous month">◀</button>

            {/* FIX #5: Human-readable month name instead of "6/2026" */}
            <span>{MONTH_NAMES[month - 1]} {year}</span>

            <button onClick={() => changeMonth(1)} aria-label="Next month">▶</button>

            <button onClick={fetchReports} aria-label="Refresh reports">
              <RefreshCw size={16} />
            </button>
          </div>
        </div>

        {/* Loading */}
        {loading && <p>Loading reports...</p>}

        {/* Error */}
        {error && <p className="error">{error}</p>}

        {/* Summary Cards */}
        {report && (
          <div className="summary-grid">
            {summaryCards.map((card) => (
              <div key={card.label} className={`card ${card.color}`}>
                <card.icon aria-hidden="true" />
                <div>
                  <p>{card.label}</p>
                  <h3>{money.format(card.value)}</h3>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Breakdown */}
        <div className="breakdown-section">
          <h3>Category Breakdown</h3>

          {breakdown.length === 0 ? (
            <p>No data available</p>
          ) : (
            breakdown.map((item) => (
              <div key={item.categoryName} className="breakdown-row">
                <span>{item.categoryIcon} {item.categoryName}</span>
                <span>{money.format(item.total)}</span>
                <span>{item.percentage.toFixed(1)}%</span>
              </div>
            ))
          )}
        </div>

        {/* Top Categories */}
        {report?.topCategories?.length > 0 && (
          <div className="top-categories">
            <h3>Top Categories</h3>

            {report.topCategories.map((c) => (
              <div key={c.categoryName} className="category-item">
                <span>{c.categoryIcon} {c.categoryName}</span>
                <span>{money.format(c.total)}</span>
              </div>
            ))}
          </div>
        )}

      </div>
  );
};

export default Reports;