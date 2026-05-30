import { Search, X } from 'lucide-react';
import { useCallback, useRef } from 'react';
import { useSearch } from '../../hooks/useSearch';
import { SearchResultItem } from './SearchResultItem';
import '../../styles/components/search-bar.css';

const ACTIVE_PANEL_STATUSES = new Set(['loading', 'success', 'error', 'rate-limited']);
// ... (keep your existing imports and ACTIVE_PANEL_STATUSES)

export function SearchBar({ onSelect }) {
  const {
    query,
    setQuery,
    results,
    status,
    error,
    clearSearch,
    minQueryLength,
  } = useSearch();

  const inputRef = useRef(null);
  const hasSearchableQuery = query.trim().length >= minQueryLength;
  const isSuccess = status === 'success' && hasSearchableQuery;
  
  // 🛡️ Optional chaining guard ensures this evaluates safely to 0 instead of crashing if results is ever null
  const safeResultsLength = Array.isArray(results) ? results.length : 0;
  const isEmpty = isSuccess && safeResultsLength === 0;
  const shouldShowPanel = hasSearchableQuery && ACTIVE_PANEL_STATUSES.has(status);
  const panelMessageId = 'search-results-message';

  const handleKeyDown = useCallback(
    (event) => {
      if (event.key === 'Escape') {
        clearSearch();
        inputRef.current?.blur();
      }
    },
    [clearSearch],
  );

  const handleSelect = useCallback(
    (transaction) => {
      clearSearch();
      onSelect?.(transaction);
    },
    [clearSearch, onSelect],
  );

  return (
    <div className="sb-wrapper" role="search">
      <div className="sb-input-row">
        <span className="sb-icon" aria-hidden="true">
          {status === 'loading' ? <span className="sb-spinner" /> : <Search size={16} />}
        </span>

        <input
          ref={inputRef}
          type="search"
          className="sb-input"
          placeholder="Search transactions..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          spellCheck={false}
          aria-label="Search transactions"
          aria-autocomplete="list"
          aria-expanded={shouldShowPanel}
          aria-controls={shouldShowPanel ? 'search-results' : undefined}
          aria-describedby={shouldShowPanel ? panelMessageId : undefined}
          aria-busy={status === 'loading'}
        />

        {query.length > 0 && (
          <button
            type="button"
            className="sb-clear-btn"
            onClick={clearSearch}
            aria-label="Clear search"
          >
            <X size={16} aria-hidden="true" />
          </button>
        )}
      </div>

      <div aria-live="polite" aria-atomic="true" className="sb-sr-only">
        {status === 'loading' && 'Searching transactions'}
        {/* 🛡️ Guarded Length Reference */}
        {isSuccess && !isEmpty && `${safeResultsLength} result${safeResultsLength === 1 ? '' : 's'} found`}
        {isEmpty && 'No results found'}
        {status === 'error' && error?.message}
        {status === 'rate-limited' && 'Search rate limit reached'}
      </div>

      {shouldShowPanel && (
        <div className="sb-panel" id="search-results" role="listbox" aria-label="Search results">
          {status === 'loading' && (
            <p className="sb-message" id={panelMessageId} role="status">
              Searching...
            </p>
          )}

          {status === 'rate-limited' && (
            <p className="sb-message" id={panelMessageId} role="alert">
              {error?.message || 'Too many searches. Wait a moment and try again.'}
              {error?.retryAfter && (
                <span className="sb-request-id"> Retry after {error.retryAfter}s.</span>
              )}
              {error?.requestId && (
                <span className="sb-request-id"> Ref: {error.requestId}</span>
              )}
            </p>
          )}

          {status === 'error' && (
            <p className="sb-message" id={panelMessageId} role="alert">
              {error?.message || 'Something went wrong. Please try again.'}
              {error?.requestId && (
                <span className="sb-request-id"> Ref: {error.requestId}</span>
              )}
            </p>
          )}

          {isEmpty && (
            <p className="sb-message" id={panelMessageId}>
              No transactions found for "{query.trim()}"
            </p>
          )}

          {/* 🛡️ Double guard mapping verification via safe array syntax */}
          {isSuccess && Array.isArray(results) && results.map((transaction) => (
            <SearchResultItem
              key={transaction.id}
              transaction={transaction}
              query={query}
              onSelect={handleSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}