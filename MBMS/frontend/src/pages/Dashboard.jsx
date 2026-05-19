import React, { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import api from '../utils/api';
import '../styles/pages/Dashboard.css';

const Dashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await api.get('/dashboard/metrics');
        setMetrics(res);
      } catch (err) {
        console.error('Failed to load dashboard metrics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  if (loading || !metrics) {
    return (
      <DashboardLayout>
        <div className="loader-wrapper">
          <div className="loader" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>

      {/* METRICS */}
      <div className="metrics-grid">

        <div className="metric-card">
          <p>Total Balance</p>
          <h2>${metrics.totalBalance?.toLocaleString()}</h2>
          <span>
            {metrics.totalBalanceChange >= 0 ? '📈' : '📉'} {metrics.totalBalanceChange}% this month
          </span>
        </div>

        <div className="metric-card">
          <p>Monthly Income</p>
          <h2>${metrics.monthlyIncome?.toLocaleString()}</h2>
          <span>Next deposit in 4 days</span>
        </div>

        <div className="metric-card">
          <p>Monthly Expenses</p>
          <h2>${metrics.monthlyExpenses?.toLocaleString()}</h2>
          <span className="danger">
            {metrics.expensesChange}% vs last month
          </span>
        </div>

      </div>

      {/* CHARTS (NOW FULLY API-DRIVEN) */}
      <div className="charts">

        {/* INCOME VS EXPENSE (FROM API ONLY) */}
        <div className="chart-box">
          <h3>Financial Performance</h3>

          <div className="bars">
            {metrics.monthlyChart?.map((item) => (
              <div key={item.month} className="bar-group">
                <div className="bars-inner">
                  <div
                    className="bar income"
                    style={{ height: `${item.income}%` }}
                  />
                  <div
                    className="bar expense"
                    style={{ height: `${item.expense}%` }}
                  />
                </div>
                <span>{item.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* SPENDING BREAKDOWN (API DRIVEN) */}
        <div className="chart-box">
          <h3>Spending Breakdown</h3>

          <div className="pie">
            <svg viewBox="0 0 100 100">
              {metrics.spendingBreakdown?.map((item, i, arr) => {
                const offset = arr
                  .slice(0, i)
                  .reduce((acc, cur) => acc + cur.percent, 0);

                return (
                  <circle
                    key={item.category}
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke={item.color}
                    strokeWidth="20"
                    strokeDasharray={`${item.percent} 100`}
                    strokeDashoffset={`-${offset}`}
                  />
                );
              })}
            </svg>
          </div>

          <ul className="legend">
            {metrics.spendingBreakdown?.map((item) => (
              <li key={item.category}>
                {item.category} - {item.percent}%
              </li>
            ))}
          </ul>
        </div>

      </div>

      {/* TRANSACTIONS + BILLS (API ONLY) */}
      <div className="bottom-grid">

        {/* TRANSACTIONS */}
        <div className="table-box">
          <h3>Recent Transactions</h3>

          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th>Category</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {metrics.recentTransactions?.map((tx) => (
                <tr key={tx.id}>
                  <td>{tx.description}</td>
                  <td>{tx.category}</td>
                  <td className={tx.amount < 0 ? 'neg' : 'pos'}>
                    ${Math.abs(tx.amount).toFixed(2)}
                  </td>
                  <td>{tx.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* BILLS */}
        <div className="bills-box">
          <h3>Upcoming Bills</h3>

          {metrics.upcomingBills?.map((bill) => (
            <div key={bill.id} className="bill">
              <p><b>{bill.name}</b></p>
              <p>{bill.dueDate}</p>
              <p>${bill.amount}</p>
            </div>
          ))}
        </div>

      </div>

    </DashboardLayout>
  );
};

export default Dashboard;