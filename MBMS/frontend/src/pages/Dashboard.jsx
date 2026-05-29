import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowDownRight,
  ArrowUpRight,
  AlertTriangle,
  Bell,
  BellOff,
  RefreshCw,
  TrendingUp,
  WalletCards,
  ReceiptText,
  PiggyBank,
} from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';
import { fetchDashboard } from '../api/dashboardApi';
import { useApi } from '../hooks/useApi';
import { getCurrentPeriod, getMonthDateRange, periodFromDateInputs } from '../utils/dateRange';
import { MetricCardSkeleton, ChartSkeleton } from '../components/feedback/LoadingSkeleton';
import ErrorMessage from '../components/feedback/ErrorMessage';
import EmptyState from '../components/feedback/EmptyState';
import usePushNotification from '../hooks/usePushNotification';
import '../styles/pages/Dashboard.css';

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

const percent = new Intl.NumberFormat('en-US', {
  style: 'percent',
  maximumFractionDigits: 1,
});

const defaultPeriod = getMonthDateRange(...Object.values(getCurrentPeriod()).reverse());

const Dashboard = () => {
  const [range, setRange] = useState('6m');
  const [startDate, setStartDate] = useState(defaultPeriod.startDate);
  const [endDate, setEndDate] = useState(defaultPeriod.endDate);

  const {
    isSubscribed,
    isSupported,
    isLoading: notifLoading,
    error: notifError,
    toggle,
  } = usePushNotification();

  const period = useMemo(
    () => periodFromDateInputs(startDate, endDate),
    [startDate, endDate]
  );

  const { data: metrics, loading, error, refetch } = useApi(
    () =>
      fetchDashboard({
        month: period.month,
        year: period.year,
        startDate: period.startDate,
        endDate: period.endDate,
        transactionLimit: 5,
      }),
    [period.month, period.year, period.startDate, period.endDate]
  );

  const summaryCards = useMemo(() => {
    if (!metrics) return [];

    return [
      {
        label: 'Net This Month',
        value: currency.format(metrics.netSavings ?? 0),
        detail: 'Income minus expenses',
        tone: (metrics.netSavings ?? 0) >= 0 ? 'positive' : 'negative',
        icon: WalletCards,
      },
      {
        label: 'Monthly Income',
        value: currency.format(metrics.monthlyIncome ?? 0),
        detail: 'From reports API',
        tone: 'positive',
        icon: ArrowUpRight,
      },
      {
        label: 'Monthly Expenses',
        value: currency.format(metrics.monthlyExpenses ?? 0),
        detail: 'From reports API',
        tone: 'negative',
        icon: ArrowDownRight,
      },
      {
        label: 'Savings Rate',
        value: percent.format((metrics.savingsRate ?? 0) / 100),
        detail: 'Net savings / income',
        tone: 'neutral',
        icon: PiggyBank,
      },
    ];
  }, [metrics]);

  const chartData = useMemo(() => {
    const all = metrics?.monthlyChart ?? [];
    return range === '6m' ? all.slice(-6) : all.slice(-12);
  }, [metrics, range]);

  const chartMax = useMemo(() => {
    if (!chartData.length) return 1;
    return Math.max(...chartData.map((d) => Math.max(d.income, d.expense)), 1);
  }, [chartData]);

  const applyCurrentMonth = () => {
    const p = getMonthDateRange(...Object.values(getCurrentPeriod()).reverse());
    setStartDate(p.startDate);
    setEndDate(p.endDate);
  };

  return (
    <DashboardLayout>
      <section className="page-stack dashboard-page">

        {/* ── Page Header ── */}
        <div className="page-header">
          <div>
            <p className="page-eyebrow">Financial command center</p>
            <h1 className="page-title">Dashboard Overview</h1>
            <p className="page-subtitle">Live KPIs, charts, and activity from your WealthFlow API.</p>
          </div>

          <div className="page-header__actions">
            {/* Notification toggle — hidden if browser doesn't support push */}
            {isSupported && (
              <div className="notif-toggle-wrap">
                <button
                  className={`btn ${isSubscribed ? 'btn-danger' : 'btn-secondary'}`}
                  type="button"
                  onClick={toggle}
                  disabled={notifLoading}
                  title={isSubscribed ? 'Disable notifications' : 'Enable notifications'}
                >
                  {notifLoading ? (
                    <RefreshCw size={18} className="spin" />
                  ) : isSubscribed ? (
                    <BellOff size={18} />
                  ) : (
                    <Bell size={18} />
                  )}
                  {isSubscribed ? 'Notifications On' : 'Notifications Off'}
                </button>
                {notifError && (
                  <p className="notif-error">{notifError}</p>
                )}
              </div>
            )}

            <button className="btn btn-secondary" type="button" onClick={refetch} disabled={loading}>
              <RefreshCw size={18} />
              Refresh
            </button>
          </div>
        </div>

        {/* ── Date Filters ── */}
        <div className="dashboard-filters">
          <label>
            From
            <input
              className="input"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </label>
          <label>
            To
            <input
              className="input"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </label>
          <button className="btn btn-secondary" type="button" onClick={applyCurrentMonth}>
            This month
          </button>
        </div>

        {/* ── Loading Skeletons ── */}
        {loading && (
          <>
            <MetricCardSkeleton count={4} />
            <div className="dashboard-analytics-grid">
              <ChartSkeleton />
              <ChartSkeleton />
            </div>
          </>
        )}

        {/* ── Error State ── */}
        {!loading && error && (
          <ErrorMessage title="Dashboard unavailable" message={error} onRetry={refetch} />
        )}

        {/* ── Main Content ── */}
        {!loading && !error && metrics && (
          <>
            {/* Metric Cards */}
            <div className="metrics-grid">
              {summaryCards.map((card) => {
                const Icon = card.icon;
                return (
                  <article className={`metric-card metric-card--${card.tone}`} key={card.label}>
                    <div className="metric-card__top">
                      <div>
                        <p>{card.label}</p>
                        <h2 className="amount">{card.value}</h2>
                      </div>
                      <span className="metric-card__icon">
                        <Icon size={21} />
                      </span>
                    </div>
                    <span className="metric-card__detail">{card.detail}</span>
                  </article>
                );
              })}
            </div>

            {/* Charts */}
            <div className="dashboard-analytics-grid">

              {/* Income vs Expenses Bar Chart */}
              <section className="analytics-card chart-card-large">
                <div className="analytics-card__header">
                  <div>
                    <span className="section-kicker">
                      <TrendingUp size={16} />
                      Performance
                    </span>
                    <h2>Income vs Expenses</h2>
                  </div>
                  <div className="segmented-control" aria-label="Chart range">
                    <button
                      className={range === '6m' ? 'is-active' : ''}
                      type="button"
                      onClick={() => setRange('6m')}
                    >
                      6M
                    </button>
                    <button
                      className={range === '12m' ? 'is-active' : ''}
                      type="button"
                      onClick={() => setRange('12m')}
                    >
                      12M
                    </button>
                  </div>
                </div>

                {chartData.length === 0 ? (
                  <EmptyState
                    icon={TrendingUp}
                    title="No chart data yet"
                    description="Add income and expense transactions for this period to see trends."
                  />
                ) : (
                  <>
                    <div
                      className="bar-chart"
                      style={{
                        gridTemplateColumns: `repeat(${chartData.length}, minmax(32px, 1fr))`,
                      }}
                    >
                      {chartData.map((item) => (
                        <div className="bar-chart__group" key={item.month}>
                          <div className="bar-chart__bars">
                            <span
                              className="bar-chart__bar income"
                              style={{ height: `${(item.income / chartMax) * 100}%` }}
                            />
                            <span
                              className="bar-chart__bar expense"
                              style={{ height: `${(item.expense / chartMax) * 100}%` }}
                            />
                          </div>
                          <span className="bar-chart__label">{item.month}</span>
                        </div>
                      ))}
                    </div>
                    <div className="chart-legend">
                      <span>
                        <i className="legend-dot income" /> Income
                      </span>
                      <span>
                        <i className="legend-dot expense" /> Expenses
                      </span>
                    </div>
                  </>
                )}
              </section>

              {/* Spending Breakdown Donut */}
              <section className="analytics-card spending-card">
                <div className="analytics-card__header">
                  <div>
                    <span className="section-kicker">Spending</span>
                    <h2>Breakdown</h2>
                  </div>
                </div>

                {(metrics.spendingBreakdown ?? []).length === 0 ? (
                  <EmptyState
                    icon={WalletCards}
                    title="No spending breakdown"
                    description="No expense transactions in this date range."
                  />
                ) : (
                  <>
                    <div className="donut-wrap">
                      <svg viewBox="0 0 42 42" className="donut-chart" role="img" aria-label="Spending breakdown">
                        {metrics.spendingBreakdown.map((item, index, list) => {
                          const offset = list
                            .slice(0, index)
                            .reduce((total, current) => total + current.percent, 0);
                          return (
                            <circle
                              key={item.category}
                              cx="21"
                              cy="21"
                              r="15.915"
                              fill="transparent"
                              stroke={item.color}
                              strokeWidth="5"
                              strokeDasharray={`${item.percent} ${100 - item.percent}`}
                              strokeDashoffset={25 - offset}
                            />
                          );
                        })}
                      </svg>
                    </div>
                    <div className="breakdown-list">
                      {metrics.spendingBreakdown.map((item) => (
                        <div className="breakdown-item" key={item.category}>
                          <span>
                            <i style={{ backgroundColor: item.color }} />
                            {item.category}
                          </span>
                          <strong>{item.percent}%</strong>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </section>
            </div>

            {/* Bottom Grid: Transactions + Budgets */}
            <div className="dashboard-bottom-grid">

              {/* Recent Transactions */}
              <section className="table-card">
                <div className="dashboard-table-header">
                  <div>
                    <span className="section-kicker">
                      <ReceiptText size={16} />
                      Activity
                    </span>
                    <h2>Recent Transactions</h2>
                  </div>
                  <Link className="btn btn-secondary" to="/transactions">
                    View all
                  </Link>
                </div>

                <div className="table-scroll">
                  <table className="data-table dashboard-table">
                    <thead>
                      <tr>
                        <th>Description</th>
                        <th>Category</th>
                        <th>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {metrics.recentTransactions.length === 0 ? (
                        <tr>
                          <td colSpan={3}>
                            <EmptyState
                              icon={ReceiptText}
                              title="No transactions yet"
                              description="Record your first transaction to see activity here."
                              action={
                                <Link className="btn btn-primary" to="/transactions">
                                  Add transaction
                                </Link>
                              }
                            />
                          </td>
                        </tr>
                      ) : (
                        metrics.recentTransactions.map((tx) => (
                          <tr key={tx.id}>
                            <td>{tx.description}</td>
                            <td>
                              <span className="status-pill status-muted">{tx.category}</span>
                            </td>
                            <td className={`amount ${tx.amount < 0 ? 'negative' : 'positive'}`}>
                              {tx.amount < 0 ? '-' : '+'}
                              {currency.format(Math.abs(tx.amount || 0))}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Budgets At Risk */}
              <section className="analytics-card upcoming-bills-card">
                <div className="analytics-card__header">
                  <div>
                    <span className="section-kicker">
                      <AlertTriangle size={16} />
                      Budgets
                    </span>
                    <h2>At Risk</h2>
                  </div>
                  <Link className="small-link" to="/budgets">
                    Manage
                  </Link>
                </div>

                <div className="bill-preview-list">
                  {metrics.budgetsAtRisk.length === 0 ? (
                    <EmptyState
                      title="All budgets on track"
                      description="No categories are at or above 90% of their limit."
                    />
                  ) : (
                    metrics.budgetsAtRisk.map((budget) => (
                      <div className="bill-preview" key={budget.id}>
                        <span className="bill-preview__icon">
                          <WalletCards size={18} />
                        </span>
                        <div>
                          <strong>{budget.category}</strong>
                          <p>{budget.usedPercent}% of limit used</p>
                        </div>
                        <span className="amount">{currency.format(Number(budget.used || 0))}</span>
                      </div>
                    ))
                  )}
                </div>
              </section>

            </div>
          </>
        )}

      </section>
    </DashboardLayout>
  );
};

export default Dashboard;
