import api, { buildQuery } from './client';

function getDateRangeStrings(month, year) {
  const targetYear = year ? parseInt(year, 10) : new Date().getFullYear();
  const targetMonth = month ? parseInt(month, 10) : new Date().getMonth() + 1;

  const startDate = `${targetYear}-${String(targetMonth).padStart(2, '0')}-01`;
  const lastDay = new Date(targetYear, targetMonth, 0).getDate();
  const endDate = `${targetYear}-${String(targetMonth).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

  return { startDate, endDate };
}

export async function getMonthlyReport({ month, year } = {}) {
  const { startDate, endDate } = getDateRangeStrings(month, year);
  const queryString = buildQuery({ startDate, endDate });
  const delimiter = queryString.startsWith('?') ? '' : '?';

  return api.get(`/transactions/reports/monthly${delimiter}${queryString}`);
}

export async function getCategoryBreakdown({ month, year } = {}) {
  const { startDate, endDate } = getDateRangeStrings(month, year);
  const queryString = buildQuery({ startDate, endDate });
  const delimiter = queryString.startsWith('?') ? '' : '?';

  return api.get(`/transactions/reports/breakdown${delimiter}${queryString}`);
}

export async function getYearlyReport({ year } = {}) {
  const targetYear = year ? parseInt(year, 10) : new Date().getFullYear();
  
  const startDate = `${targetYear}-01-01`;
  const endDate = `${targetYear}-12-31`;

  const queryString = buildQuery({ startDate, endDate });
  const delimiter = queryString.startsWith('?') ? '' : '?';
  
  return api.get(`/transactions/reports/yearly${delimiter}${queryString}`);
}