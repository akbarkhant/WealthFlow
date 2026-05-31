import React, { useEffect, useMemo, useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  PieChart,
  Calendar,
  RefreshCw,
} from 'lucide-react';

import DashboardLayout from '../layouts/DashboardLayout';
import api from '../utils/api';
import '../styles/pages/Reports.css';

const money = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

const Reports = () => {
  const today = new Date();

  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year, setYear] = useState(today.getFullYear());

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [report, setReport] = useState(null);
  const [breakdown, setBreakdown] = useState([]);

  const fetchReports = async () => {
    setLoading(true);
    setError('');

    try {
      const [monthlyRes, breakdownRes] = await Promise.all([
        api.get(`/reports/monthly?month=${month}&year=${year}`),
        api.get(`/reports/breakdown?month=${month}&year=${year}`),
      ]);

      setReport(monthlyRes?.data || null);
      setBreakdown(breakdownRes?.data || []);
    } catch (err) {
      console.error(err);
      setError('Failed to load reports.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [month, year]);

  const summaryCards = useMemo(() => {
    if (!report) return [];

    return [
      {
        label: 'Income',
        value: report.totalIncome,
        icon: TrendingUp,
        color: 'green',
      },
      {
        label: 'Expenses',
        value: report.totalExpenses,
        icon: TrendingDown,
        color: 'red',
      },
      {
        label: 'Net Savings',
        value: report.netSavings,
        icon: PieChart,
        color: report.netSavings >= 0 ? 'green' : 'red',
      },
    ];
  }, [report]);

  const changeMonth = (delta) => {
    setMonth((m) => {
      let newMonth = m + delta;
      let newYear = year;

      if (newMonth < 1) {
        newMonth = 12;
        newYear -= 1;
      }

      if (newMonth > 12) {
        newMonth = 1;
        newYear += 1;
      }

      setYear(newYear);
      return newMonth;
    });
  };

  return (
    <DashboardLayout>
      <div className="reports-page">

        {/* Header */}
        <div className="reports-header">
          <h2>Monthly Reports</h2>

          <div className="reports-controls">
            <button onClick={() => changeMonth(-1)}>
              ◀
            </button>

            <span>
              {month}/{year}
            </span>

            <button onClick={() => changeMonth(1)}>
              ▶
            </button>

            <button onClick={fetchReports}>
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
                <card.icon />
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
                <span>
                  {item.categoryIcon} {item.categoryName}
                </span>

                <span>{money.format(item.total)}</span>

                <span>{item.percentage.toFixed(1)}%</span>
              </div>
            ))
          )}
        </div>

        {/* Top Categories */}
        {report?.topCategories && (
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
    </DashboardLayout>
  );
};

export default Reports;