import { useMemo, useState, useEffect } from 'react';
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
import { ReportProvider, useReports } from '../context/ReportContext';
import { getCurrentPeriod, getMonthDateRange, periodFromDateInputs } from '../utils/dateRange';
import { MetricCardSkeleton, ChartSkeleton } from '../components/feedback/LoadingSkeleton';
import ErrorMessage from '../components/feedback/ErrorMessage';
import EmptyState from '../components/feedback/EmptyState';
import usePushNotification from '../hooks/usePushNotification';
import { listTransactions } from '../api/transactionsApi';
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

const DashboardContent = () => {
  const [range, setRange] = useState('6m');
  const [startDate, setStartDate] = useState(defaultPeriod.startDate);
  const [endDate, setEndDate] = useState(defaultPeriod.endDate);
  const [recentTransactions, setRecentTransactions] = useState([]);

  const {
    isSubscribed,
    isSupported,
    isLoading: notifLoading,
    error: notifError,
    toggle,
  } = usePushNotification();

  // Consume our new unified, cached state context layer
  const {
    monthlyReport,
    breakdown,
    yearlyReport,
    goals,
    loading,
    error,
    fetchDashboardData
  } = useReports();

  const period = useMemo(
    () => periodFromDateInputs(startDate, endDate),
    [startDate, endDate]
  );

  // Trigger centralized data retrieval when period state adjustments occur
  useEffect(() => {
    fetchDashboardData(period.month, period.year).catch(() => {});
  }, [period.month, period.year, fetchDashboardData]);

  useEffect(() => {
    const loadTransactions = async () => {
      try {
        const result = await listTransactions({
          page: 1,
          limit: 7,
          sortBy: 'date-desc',
          startDate,
          endDate,
        });

        console.log('Transactions API Result:', result);

        setRecentTransactions(result.data || []);
      } catch (err) {
        console.error('Failed to load transactions:', err);
        setRecentTransactions([]);
      }
    };

    loadTransactions();
  }, [startDate, endDate]);

  const handleManualRefetch = () => {
    fetchDashboardData(period.month, period.year, true);
  };

  // Compile individual states from our concurrent context objects back into standard UI view models
  const summaryCards = useMemo(() => {
    
    // Extract data directly matching your API payload keys
    const reportData = monthlyReport?.data ? monthlyReport.data : monthlyReport;

    const income = Number(reportData?.totalIncome || 0);
    const expenses = Number(reportData?.totalExpenses || 0);
    const netSavings = income - expenses;
    const savingsRate = income > 0 ? (netSavings / income) * 100 : 0;

    return [
      {
        label: 'Net This Month',
        value: currency.format(netSavings),
        detail: 'Income minus expenses',
        tone: netSavings >= 0 ? 'positive' : 'negative',
        icon: WalletCards,
      },
      {
        label: 'Monthly Income',
        value: currency.format(income),
        detail: 'Gross earnings tracked',
        tone: 'positive',
        icon: ArrowUpRight,
      },
      {
        label: 'Monthly Expenses',
        value: currency.format(expenses),
        detail: 'Total outward cashflow',
        tone: 'negative',
        icon: ArrowDownRight,
      },
      {
        label: 'Savings Rate',
        value: percent.format(savingsRate / 100),
        detail: 'Net savings / income',
        tone: 'neutral',
        icon: PiggyBank,
      },
    ];
  }, [monthlyReport]);

  const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const chartData = useMemo(() => {
    // Normalize if data arrives wrapped or as a raw array directly
    const rawMonths = Array.isArray(yearlyReport)
      ? yearlyReport
      : (yearlyReport?.months || []);

    const formattedData = rawMonths.map(item => ({
      ...item,
      // Convert numerical 1-indexed months (e.g., 5) to short labels (e.g., 'May')
      month: typeof item.month === 'number'
        ? MONTH_NAMES[item.month - 1] || `M${item.month}`
        : item.month
    }));

    // Filter based on the selected premium segmented-control timeline toggle
    return range === '6m' ? formattedData.slice(-6) : formattedData.slice(-12);
  }, [yearlyReport, range]);

  // Track maximum layout ceiling to dynamically calculate CSS bar heights safely
  const chartMax = useMemo(() => {
    if (!chartData || chartData.length === 0) return 1;

    return Math.max(
      ...chartData.map((d) => Math.max(Number(d.income || 0), Number(d.expense || 0))),
      1
    );
  }, [chartData]);

  const spendingBreakdownData = useMemo(() => {
    return Array.isArray(breakdown) ? breakdown : [];
  }, [breakdown]);

  const recentTransactionsData = useMemo(() => {
    return Array.isArray(recentTransactions)
      ? recentTransactions
      : [];
  }, [recentTransactions]);

  const budgetsAtRiskData = useMemo(
    () =>
      Array.isArray(goals)
        ? goals.filter(goal => Number(goal?.usedPercent || 0) >= 90)
        : [],
    [goals]
  );

  const applyCurrentMonth = () => {
    const p = getMonthDateRange(...Object.values(getCurrentPeriod()).reverse());
    setStartDate(p.startDate);
    setEndDate(p.endDate);
  };

  return (
      <section className="page-stack dashboard-page">

        {/* ── Page Header ── */}
        <div className="page-header">
          <div>
            <p className="page-eyebrow">Financial command center</p>
            <h1 className="page-title">Dashboard Overview</h1>
            <p className="page-subtitle">Live KPIs, charts, and activity from your WealthFlow API.</p>
          </div>

          <div className="page-header__actions">
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

            <button className="btn btn-secondary" type="button" onClick={handleManualRefetch} disabled={loading}>
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
          <ErrorMessage title="Dashboard unavailable" message={error} onRetry={handleManualRefetch} />
        )}

        {/* ── Main Content ── */}
        {!loading && !error && monthlyReport && (
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

                {spendingBreakdownData.length === 0 ? (
                  <EmptyState
                    icon={WalletCards}
                    title="No spending breakdown"
                    description="No expense transactions in this date range."
                  />
                ) : (
                  <>
                    <div className="donut-wrap">
                      <svg viewBox="0 0 42 42" className="donut-chart" role="img" aria-label="Spending breakdown">
                        {spendingBreakdownData.map((item, index, list) => {
                          const offset = list
                            .slice(0, index)
                            .reduce((total, current) => total + current.percentage, 0);

                          return (
                            <circle
                              key={item.categoryName}
                              cx="21"
                              cy="21"
                              r="15.915"
                              fill="transparent"
                              stroke={item.categoryColor}
                              strokeWidth="5"
                              strokeDasharray={`${item.percentage} ${100 - item.percentage}`}
                              strokeDashoffset={25 - offset}
                            />
                          );
                        })}
                      </svg>
                    </div>
                    <div className="breakdown-list">
                      {spendingBreakdownData.map((item) => (
                        <div className="breakdown-item" key={item.categoryName}>
                          <span>
                            <i style={{ backgroundColor: item.categoryColor }} />
                            {item.categoryName}
                          </span>
                          <strong>{item.percentage}%</strong>
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
                      {recentTransactionsData.length === 0 ? (
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
                        recentTransactionsData.map((tx) => (
                          <tr key={tx.id}>
                            <td>{tx.description}</td>
                            <td>
                              <span className="status-pill status-muted">
                                {tx.categoryName || 'Uncategorized'}
                              </span>
                            </td>
                            <td
                              className={`amount ${tx.type === 'expense' ? 'negative' : 'positive'
                                }`}
                            >
                              {tx.type === 'expense' ? '-' : '+'}
                              {currency.format(Number(tx.amount || 0))}
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
                  {budgetsAtRiskData.length === 0 ? (
                    <EmptyState
                      title="All budgets on track"
                      description="No categories are at or above 90% of their limit."
                    />
                  ) : (
                    budgetsAtRiskData.map((budget) => (
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
  );
};

// Index shell safely injects the shared Provider boundary condition context context
const Dashboard = () => {
  return (
    <ReportProvider>
      <DashboardContent />
    </ReportProvider>
  );
};

export default Dashboard;