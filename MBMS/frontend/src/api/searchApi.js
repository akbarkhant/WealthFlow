import api from './client';

export const MIN_SEARCH_QUERY_LENGTH = 2;

function createRequestId() {
  return globalThis.crypto?.randomUUID?.()
    ?? `search-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function isAbortError(error) {
  return (
    error?.name === 'AbortError'
    || error?.name === 'CanceledError'
    || error?.code === 'ERR_CANCELED'
  );
}

function normalizeSearchError(error) {
  if (isAbortError(error)) {
    return error;
  }

  const responseData = error?.data || error?.response?.data || {};
  const normalized = new Error(
    responseData.message || error?.message || 'Search request failed.',
  );

  normalized.name = 'SearchApiError';
  normalized.status = error?.status || error?.response?.status || 0;
  normalized.requestId =
    error?.requestId
    || responseData.requestId
    || error?.response?.headers?.['x-request-id']
    || null;
  normalized.retryAfter =
    error?.retryAfter
    || error?.response?.headers?.['retry-after']
    || null;
  normalized.cause = error;

  return normalized;
}

export async function fetchSearchResults(query, signal) {
  const sanitizedQuery = query.trim();

  // Defense in depth: callers cannot accidentally send invalid search traffic.
  if (sanitizedQuery.length < MIN_SEARCH_QUERY_LENGTH) {
    return {
      success: true,
      count: 0,
      requestId: null,
      results: [],
    };
  }

  const requestId = createRequestId();

  try {
    const payload = await api.get('/search', {
      params: { q: sanitizedQuery },
      signal,
      headers: { 'X-Request-Id': requestId },
    });

    const results = Array.isArray(payload?.results) ? payload.results : [];

    return {
      success: payload?.success ?? true,
      count: Number(payload?.count ?? results.length),
      requestId: payload?.requestId || requestId,
      results,
    };
  } catch (error) {
    throw normalizeSearchError(error);
  }
}
