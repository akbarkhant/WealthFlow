import { useState, useRef, useCallback, useEffect } from 'react';
// 🛡️ Fixed: Correctly import api utilities and search configs from your API module
import { fetchSearchResults, MIN_SEARCH_QUERY_LENGTH } from '../api/searchApi';

const DEBOUNCE_MS = 350;

function isAbortError(error) {
  return (
    error?.name === 'AbortError' ||
    error?.name === 'CanceledError' ||
    error?.code === 'ERR_CANCELED'
  );
}

function toErrorState(error) {
  return {
    message: error?.message || 'Something went wrong. Please try again.',
    requestId: error?.requestId || error?.data?.requestId || null,
    retryAfter: error?.retryAfter || null,
    status: error?.status || null,
  };
}

export function useSearch() {
  const [query, setQuery] = useState('');
  // 🛡️ Guardrail 1: Initialize safely as an empty array
  const [results, setResults] = useState([]); 
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);

  const abortRef = useRef(null);
  const timerRef = useRef(null);
  const requestSeqRef = useRef(0);

  const cancelPendingWork = useCallback(() => {
    window.clearTimeout(timerRef.current);
    abortRef.current?.abort();
    abortRef.current = null;
  }, []);

  const clearSearch = useCallback(() => {
    requestSeqRef.current += 1;
    cancelPendingWork();
    setQuery('');
    setResults([]);
    setStatus('idle');
    setError(null);
  }, [cancelPendingWork]);

  useEffect(() => {
    cancelPendingWork();

    const sanitizedQuery = query.trim();
    const sequence = requestSeqRef.current + 1;
    requestSeqRef.current = sequence;

    if (sanitizedQuery.length < MIN_SEARCH_QUERY_LENGTH) {
      setResults([]);
      setStatus('idle');
      setError(null);
      return undefined;
    }

    setStatus('loading');
    setError(null);

    timerRef.current = window.setTimeout(async () => {
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const data = await fetchSearchResults(sanitizedQuery, controller.signal);

        if (controller.signal.aborted || sequence !== requestSeqRef.current) {
          return;
        }

        // 🛡️ Guardrail 2: Ensure that if data or data.results is null/undefined, it defaults safely to []
        const cleanResults = Array.isArray(data?.results) ? data.results : [];

        setResults(cleanResults);
        setStatus('success');
        setError(null);
      } catch (caughtError) {
        if (
          isAbortError(caughtError) ||
          controller.signal.aborted ||
          sequence !== requestSeqRef.current
        ) {
          return;
        }

        const nextError = toErrorState(caughtError);
        // 🛡️ Guardrail 3: Force empty array on error states so render loop doesn't break
        setResults([]); 
        setError(nextError);
        setStatus(nextError.status === 429 ? 'rate-limited' : 'error');
      } finally {
        if (abortRef.current === controller) {
          abortRef.current = null;
        }
      }
    }, DEBOUNCE_MS);

    return cancelPendingWork;
  }, [cancelPendingWork, query]);

  return {
    query,
    setQuery,
    results,
    status,
    error,
    clearSearch,
    minQueryLength: MIN_SEARCH_QUERY_LENGTH,
  };
}