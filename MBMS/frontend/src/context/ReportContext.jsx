import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import reportsApi from '../api/reportsApi';

const ReportContext = createContext(null);

export function ReportProvider({ children }) {
  // Analytical State Ecosystem
  const [monthlyReport, setMonthlyReport] = useState(null);
  const [breakdown, setBreakdown] = useState(null);
  const [yearlyReport, setYearlyReport] = useState(null);
  const [goals, setGoals] = useState([]);

  // UX State Indicators
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Reference cache tracking system to intercept concurrent duplicate inflight requests.
   * key structure: "month-year" or "year" -> maps to an inflight Promise.
   */
  const inflightRequests = useRef(new Map());

  /**
   * Orchestrates unified analytical data collection loops.
   * Uses Promise-level caching to cleanly collapse separate widget mount executions.
   */
  const fetchDashboardData = useCallback(async (month, year, forceRefresh = false) => {
    const cacheKey = `${month}-${year}`;

    // If a request with these exact parameters is already moving, return it immediately
    if (inflightRequests.current.has(cacheKey) && !forceRefresh) {
      return inflightRequests.current.get(cacheKey);
    }

    setLoading(true);
    setError(null);

    const executionPromise = (async () => {
      try {
        // Execute analytics fetches in parallel to maximize performance
        const [monthlyData, breakdownData, yearlyData, goalsData] = await Promise.all([
          reportsApi.getMonthly(month, year),
          reportsApi.getBreakdown(month, year),
          reportsApi.getYearly(year),
          reportsApi.getGoals()
        ]);

        console.log('Goals API Response:', goalsData);

        const normalizedGoals = Array.isArray(goalsData)
          ? goalsData
          : goalsData && typeof goalsData === 'object'
            ? Object.values(goalsData)
            : [];

        setMonthlyReport(monthlyData);
        setBreakdown(breakdownData);
        setYearlyReport(yearlyData);
        setGoals(normalizedGoals);

        return { monthlyData, breakdownData, yearlyData, goalsData };
      } catch (err) {
        setError(err.message || 'An error occurred while compiling reports');
        throw err;
      } finally {
        setLoading(false);
        // Clear tracking once completed
        inflightRequests.current.delete(cacheKey);
      }
    })();

    // Stash the promise handle in case another widget calls this within the next few milliseconds
    inflightRequests.current.set(cacheKey, executionPromise);

    return executionPromise;
  }, []);

  /**
   * Invalidates context data stores safely
   */
  const clearReportCache = useCallback(() => {
    setMonthlyReport(null);
    setBreakdown(null);
    setYearlyReport(null);
    setGoals([]);
    inflightRequests.current.clear();
  }, []);

  const value = {
    monthlyReport,
    breakdown,
    yearlyReport,
    goals,
    loading,
    error,
    fetchDashboardData,
    clearReportCache
  };

  return (
    <ReportContext.Provider value={value}>
      {children}
    </ReportContext.Provider>
  );
}

/**
 * Access hook for UI consumption layers
 */
export function useReports() {
  const context = useContext(ReportContext);
  if (!context) {
    throw new Error('useReports must be implemented inside a valid ReportProvider hierarchy.');
  }
  return context;
}