// reportsApi.js

import api from './client';
/**
 * Reports API Module
 * Interacts with the analytical and goal reporting backend infrastructure.
 */
export const reportsApi = {
  /**
   * Fetches monthly financial aggregations (Income, Expenses summary)
   * Target endpoint: GET /api/reports/monthly?month=6&year=2026
   * @param {number|string} month - 1-12 numerical representation
   * @param {number|string} year - 4-digit numerical representation of the year
   */
  getMonthly: (month, year) => {
    return api.get('/reports/monthly', {
      params: { month, year }
    });
  },

  /**
   * Fetches category breakdown distributions for structured visualization layers
   * Target endpoint: GET /api/reports/breakdown?month=6&year=2026
   * @param {number|string} month - 1-12 numerical representation
   * @param {number|string} year - 4-digit numerical representation of the year
   */
  getBreakdown: (month, year) => {
    return api.get('/reports/breakdown', {
      params: { month, year }
    });
  },

  /**
   * Fetches full calendar-year aggregate summaries
   * Target endpoint: GET /api/reports/yearly?year=2026
   * @param {number|string} year - 4-digit numerical representation of the year
   */
  getYearly: (year) => {
    return api.get('/reports/yearly', {
      params: { year }
    });
  },

  /**
   * Fetches active, completed, or overdue financial milestones and tracking data
   * Target endpoint: GET /api/goals
   */
  getGoals: () => {
    return api.get('/goals');
  }
};

export default reportsApi;