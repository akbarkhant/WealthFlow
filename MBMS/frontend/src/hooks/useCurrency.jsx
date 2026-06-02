import { useState, useEffect, useCallback, useRef } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

/** Free, no-key-required exchange rate API (updates daily) */
const RATES_API_URL = 'https://open.er-api.com/v6/latest/USD';

/** How long to keep rates in memory before re-fetching (30 minutes) */
const CACHE_TTL_MS = 30 * 60 * 1000;

/** Supported display currencies with their symbols and locale strings */
export const SUPPORTED_CURRENCIES = [
  { code: 'USD', symbol: '$',  label: 'US Dollar',        locale: 'en-US'  },
  { code: 'EUR', symbol: '€',  label: 'Euro',             locale: 'de-DE'  },
  { code: 'GBP', symbol: '£',  label: 'British Pound',    locale: 'en-GB'  },
  { code: 'PKR', symbol: '₨',  label: 'Pakistani Rupee',  locale: 'ur-PK'  },
  { code: 'INR', symbol: '₹',  label: 'Indian Rupee',     locale: 'en-IN'  },
  { code: 'AED', symbol: 'د.إ',label: 'UAE Dirham',       locale: 'ar-AE'  },
  { code: 'SAR', symbol: '﷼',  label: 'Saudi Riyal',      locale: 'ar-SA'  },
  { code: 'JPY', symbol: '¥',  label: 'Japanese Yen',     locale: 'ja-JP'  },
  { code: 'CAD', symbol: 'C$', label: 'Canadian Dollar',  locale: 'en-CA'  },
  { code: 'AUD', symbol: 'A$', label: 'Australian Dollar',locale: 'en-AU'  },
  { code: 'CHF', symbol: 'Fr', label: 'Swiss Franc',      locale: 'de-CH'  },
  { code: 'CNY', symbol: '¥',  label: 'Chinese Yuan',     locale: 'zh-CN'  },
  { code: 'TRY', symbol: '₺',  label: 'Turkish Lira',     locale: 'tr-TR'  },
  { code: 'BRL', symbol: 'R$', label: 'Brazilian Real',   locale: 'pt-BR'  },
  { code: 'MXN', symbol: '$',  label: 'Mexican Peso',     locale: 'es-MX'  },
  { code: 'SGD', symbol: 'S$', label: 'Singapore Dollar', locale: 'en-SG'  },
  { code: 'HKD', symbol: 'HK$',label: 'Hong Kong Dollar', locale: 'zh-HK'  },
  { code: 'KRW', symbol: '₩',  label: 'South Korean Won', locale: 'ko-KR'  },
  { code: 'ZAR', symbol: 'R',  label: 'South African Rand',locale: 'en-ZA' },
  { code: 'NGN', symbol: '₦',  label: 'Nigerian Naira',   locale: 'en-NG'  },
];

// In-module cache — persists across re-renders and hook instances
const rateCache = {
  rates: null,       // { [currency_code]: rate_vs_usd }
  fetchedAt: null,   // timestamp
  promise: null,     // in-flight dedup promise
};

// ─────────────────────────────────────────────────────────────────────────────
// Core fetcher (module-level, deduplicated)
// ─────────────────────────────────────────────────────────────────────────────

async function fetchRates() {
  const now = Date.now();

  // Return cache if still fresh
  if (rateCache.rates && rateCache.fetchedAt && (now - rateCache.fetchedAt) < CACHE_TTL_MS) {
    return rateCache.rates;
  }

  // Deduplicate concurrent fetches
  if (rateCache.promise) return rateCache.promise;

  rateCache.promise = (async () => {
    try {
      const res = await fetch(RATES_API_URL);
      if (!res.ok) throw new Error(`Rates API responded with ${res.status}`);
      const data = await res.json();

      if (data.result !== 'success' || !data.rates) {
        throw new Error('Unexpected rates API response shape');
      }

      rateCache.rates     = data.rates;  // { USD: 1, EUR: 0.92, PKR: 278.5, ... }
      rateCache.fetchedAt = Date.now();
      return rateCache.rates;
    } finally {
      rateCache.promise = null;
    }
  })();

  return rateCache.promise;
}

// ─────────────────────────────────────────────────────────────────────────────
// Pure conversion utilities  (exported for use in components too)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Convert an amount from one currency to another using a rates map
 * where every rate is expressed as "units per 1 USD".
 *
 * @param {number} amount
 * @param {string} fromCurrency  ISO 4217 code, e.g. 'PKR'
 * @param {string} toCurrency    ISO 4217 code, e.g. 'EUR'
 * @param {Object} rates         { [code]: rateVsUsd }
 * @returns {number}
 */
export function convertAmount(amount, fromCurrency, toCurrency, rates) {
  if (!rates || fromCurrency === toCurrency) return amount;

  const fromRate = rates[fromCurrency];
  const toRate   = rates[toCurrency];

  if (!fromRate || !toRate) return amount; // graceful fallback — return as-is

  // amount → USD → target
  const inUsd = amount / fromRate;
  return inUsd * toRate;
}

/**
 * Format a number as a currency string.
 *
 * @param {number} amount
 * @param {string} currency  ISO 4217 code
 * @param {{ decimals?: number }} opts
 * @returns {string}
 */
export function formatCurrency(amount, currency = 'USD', { decimals } = {}) {
  const meta = SUPPORTED_CURRENCIES.find(c => c.code === currency);
  const locale = meta?.locale ?? 'en-US';

  // JPY and KRW conventionally show 0 decimals
  const noDecimals = ['JPY', 'KRW'];
  const minDecimals = decimals ?? (noDecimals.includes(currency) ? 0 : 2);
  const maxDecimals = decimals ?? (noDecimals.includes(currency) ? 0 : 2);

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: minDecimals,
    maximumFractionDigits: maxDecimals,
  }).format(amount);
}

/**
 * Compact formatter — no decimals, good for summary cards.
 */
export function formatCurrencyCompact(amount, currency = 'USD') {
  return formatCurrency(amount, currency, { decimals: 0 });
}

// ─────────────────────────────────────────────────────────────────────────────
// useCurrency hook
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Provides live exchange rates + conversion helpers.
 *
 * @param {string} [defaultDisplayCurrency='USD']  The initial currency to show all values in
 *
 * @returns {{
 *   rates: Object | null,
 *   ratesLoading: boolean,
 *   ratesError: string | null,
 *   displayCurrency: string,
 *   setDisplayCurrency: (code: string) => void,
 *   convert: (amount: number, fromCurrency: string) => number,
 *   fmt: (amount: number, fromCurrency: string) => string,
 *   fmtCompact: (amount: number, fromCurrency: string) => string,
 *   fmtNative: (amount: number, currency: string) => string,
 *   refreshRates: () => void,
 *   lastUpdated: Date | null,
 * }}
 */
export function useCurrency(defaultDisplayCurrency = 'USD') {
  const [rates,           setRates]           = useState(rateCache.rates);
  const [ratesLoading,    setRatesLoading]    = useState(!rateCache.rates);
  const [ratesError,      setRatesError]      = useState(null);
  const [displayCurrency, setDisplayCurrency] = useState(defaultDisplayCurrency);
  const [lastUpdated,     setLastUpdated]     = useState(
    rateCache.fetchedAt ? new Date(rateCache.fetchedAt) : null
  );
  const mountedRef = useRef(true);

  const loadRates = useCallback(async () => {
    setRatesLoading(true);
    setRatesError(null);
    try {
      const fresh = await fetchRates();
      if (!mountedRef.current) return;
      setRates(fresh);
      setLastUpdated(new Date(rateCache.fetchedAt));
    } catch (err) {
      if (!mountedRef.current) return;
      setRatesError('Could not load exchange rates. Showing native currencies.');
      // Don't null out stale rates — keep showing last-known values
    } finally {
      if (mountedRef.current) setRatesLoading(false);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    loadRates();
    return () => { mountedRef.current = false; };
  }, [loadRates]);

  // ── Conversion helpers bound to current displayCurrency & rates ──

  /**
   * Convert `amount` from its native `fromCurrency` → current `displayCurrency`.
   * Falls back to original amount if rates are unavailable.
   */
  const convert = useCallback(
    (amount, fromCurrency) => convertAmount(amount, fromCurrency, displayCurrency, rates),
    [rates, displayCurrency]
  );

  /**
   * Convert AND format with full decimals.
   * e.g. fmt(1500, 'PKR') → "€12.45" when displayCurrency is EUR
   */
  const fmt = useCallback(
    (amount, fromCurrency) => {
      const converted = convert(amount, fromCurrency);
      return formatCurrency(converted, displayCurrency);
    },
    [convert, displayCurrency]
  );

  /**
   * Convert AND format, compact (no decimals).
   * Good for summary strip totals.
   */
  const fmtCompact = useCallback(
    (amount, fromCurrency) => {
      const converted = convert(amount, fromCurrency);
      return formatCurrencyCompact(converted, displayCurrency);
    },
    [convert, displayCurrency]
  );

  /**
   * Format in the amount's OWN currency, without conversion.
   * Use this on individual goal cards to show the native value.
   */
  const fmtNative = useCallback(
    (amount, currency) => formatCurrency(amount, currency),
    []
  );

  return {
    rates,
    ratesLoading,
    ratesError,
    displayCurrency,
    setDisplayCurrency,
    convert,
    fmt,
    fmtCompact,
    fmtNative,
    refreshRates: loadRates,
    lastUpdated,
  };
}