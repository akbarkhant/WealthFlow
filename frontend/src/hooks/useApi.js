import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Custom hook to safely handle asynchronous API requests with race-condition guards.
 * @param {() => Promise<T>} apiFn
 * @param {unknown[]} deps
 * @returns {{ data: T | null, loading: boolean, error: string | null, refetch: () => Promise<T|undefined> }}
 */
export function useApi(apiFn, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Keep a stable tracking reference of the most recent apiFn execution instance
  const apiFnRef = useRef(apiFn);
  useEffect(() => {
    apiFnRef.current = apiFn;
  }, [apiFn]);

  // Track active execution IDs to eliminate manual-trigger race conditions
  const activeExecutionIdRef = useRef(0);

  const executeRequest = useCallback(async (isManualTrigger = false) => {
    const currentExecutionId = ++activeExecutionIdRef.current;
    
    try {
      setLoading(true);
      setError(null);
      
      const result = await apiFnRef.current();
      
      // Guard: drop state mutation completely if a newer request overtook this one
      if (currentExecutionId === activeExecutionIdRef.current) {
        setData(result);
        return result;
      }
    } catch (err) {
      if (currentExecutionId === activeExecutionIdRef.current) {
        setError(err.message || 'Something went wrong');
        if (isManualTrigger) throw err; // Bubble up errors exclusively for manual code blocks
      }
    } finally {
      if (currentExecutionId === activeExecutionIdRef.current) {
        setLoading(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  // Expose a stable, memoized manual invocation function
  const refetch = useCallback(() => {
    return executeRequest(true);
  }, [executeRequest]);

  // Automatically trigger requests whenever primitive dependencies pivot
  useEffect(() => {
    executeRequest(false);

    return () => {
      // Invalidate the running execution track immediately on unmount or dep swap
      activeExecutionIdRef.current++;
    };
  }, [executeRequest]);

  return { data, loading, error, refetch };
}