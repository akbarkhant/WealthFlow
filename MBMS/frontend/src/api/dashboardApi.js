import { listTransactions } from './transactionsApi';
import { listBudgets } from './budgetsApi';
import { getMonthlyReport, getYearlyReport, getCategoryBreakdown } from './chartsApi';
import { mapDashboardMetrics } from '../services/mappers';

/**
 * Fetches all dashboard data for a given period.
 * KPIs come from GET /reports/monthly; charts from yearly + breakdown; activity from paginated transactions.
 */
export async function fetchDashboard({ month, year, startDate, endDate, transactionLimit = 5 }) {
  const [monthly, yearly, breakdown, budgets, transactionsResult] = await Promise.all([
    getMonthlyReport({ month, year }),
    getYearlyReport({ year }),
    getCategoryBreakdown({ month, year }),
    listBudgets({ month, year }),
    listTransactions({
      page: 1,
      limit: transactionLimit,
      startDate,
      endDate,
    }),
  ]);

  return mapDashboardMetrics({
    monthly,
    yearly,
    breakdown,
    budgets,
    transactions: transactionsResult.data,
    transactionsMeta: transactionsResult.meta,
  });
}
