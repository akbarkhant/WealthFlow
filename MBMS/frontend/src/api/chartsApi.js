import api, { buildQuery } from './client';

export async function getMonthlyReport({ month, year } = {}) {
  return api.get(`/reports/monthly${buildQuery({ month, year })}`);
}

export async function getYearlyReport({ year } = {}) {
  return api.get(`/reports/yearly${buildQuery({ year })}`);
}

export async function getCategoryBreakdown({ month, year } = {}) {
  return api.get(`/reports/breakdown${buildQuery({ month, year })}`);
}
