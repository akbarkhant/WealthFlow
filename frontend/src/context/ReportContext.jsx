import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import reportsApi from '../api/reportsApi';

const ReportContext = createContext(null);

export function ReportProvider({ children }) {
  // Analytical State Ecosystem
  const [monthlyReport, setMonthlyReport] = useState(null);
  const [breakdown,     setBreakdown]     = useState(null);
  const [yearlyReport,  setYearlyReport]  = useState(null);
  const [goals,         setGoals]         = useState([]);

  // UX State Indicators
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  /**
   * Reference cache tracking system to intercept concurrent duplicate inflight
   * requests. Key structure: "month-year" or "year" -> maps to an inflight Promise.
   */
  const inflightRequests = useRef(new Map());

  /**
   * Orchestrates unified analytical data collection.
   * Uses Promise-level caching to collapse separate concurrent widget fetches.
   */
  const fetchDashboardData = useCallback(async (month, year, forceRefresh = false) => {
    const cacheKey = `${month}-${year}`;

    // If a request with these exact parameters is already in flight, return it
    if (inflightRequests.current.has(cacheKey) && !forceRefresh) {
      return inflightRequests.current.get(cacheKey);
    }

    // FIX #8: Set loading state before stashing the promise so ALL callers
    // (including those hitting the cache) see loading=true from the start
    setLoading(true);
    setError(null);

    const executionPromise = (async () => {
      try {
        const [monthlyData, breakdownData, yearlyData, goalsData] = await Promise.all([
          reportsApi.getMonthly(month, year),
          reportsApi.getBreakdown(month, year),
          reportsApi.getYearly(year),
          reportsApi.getGoals(),
        ]);

        // FIX #6: Was Array.isArray(goalsData) then Object.values(goalsData) —
        // Object.values on { success: true, data: { items: [], total: N } }
        // returns [true, { items: [], total: N }], not the goals array.
        // The backend wraps goals in data.items per the sendSuccess utility.
        const normalizedGoals =
          goalsData?.data?.items   ??   // standard sendSuccess shape
          goalsData?.items         ??   // already-unwrapped shape
          (Array.isArray(goalsData) ? goalsData : []);

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
        // Clear tracking once the request settles
        inflightRequests.current.delete(cacheKey);
      }
    })();

    // Stash the promise handle in case another widget calls within milliseconds
    inflightRequests.current.set(cacheKey, executionPromise);

    return executionPromise;
  }, []);

  /**
   * Invalidates all context data stores safely
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
    clearReportCache,
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