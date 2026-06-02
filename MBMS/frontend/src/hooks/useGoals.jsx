import { useState, useEffect, useCallback, useMemo } from 'react';
import { goalsApi } from '../api/goalsApi';
import { useCurrency, convertAmount } from './useCurrency';

// ─────────────────────────────────────────────────────────────────────────────
// Status derivation (pure — no side effects)
// ─────────────────────────────────────────────────────────────────────────────

export function deriveGoalStatus(goal) {
  if (goal.status === 'PAUSED') return 'PAUSED';

  const current = Number(goal.current_amount ?? 0);
  const target = Number(goal.target_amount ?? 0);
  const pct = target > 0 ? (current / target) * 100 : 0;

  if (goal.allow_overflow && pct > 100) return 'OVERDRIVE';
  if (goal.status === 'COMPLETED' || pct >= 100) return 'COMPLETED';
  if (goal.status === 'OVERDUE') return 'OVERDUE';
  return 'ACTIVE';
}

// ─────────────────────────────────────────────────────────────────────────────
// useGoals
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Central hook for goal data + currency conversion.
 *
 * What it does beyond the original:
 *  - Embeds useCurrency so the entire feature has one source of truth for rates
 *  - Exposes `displayCurrency` / `setDisplayCurrency` so any child can switch
 *  - Computes `summary` with all amounts converted to displayCurrency
 *  - Attaches `convertedCurrent` / `convertedTarget` to each goal object so
 *    MilestoneNode / FuelDrawer don't need to call convert() themselves
 *  - Provides `fmt`, `fmtCompact`, `fmtNative` formatters for consistent rendering
 *  - Validates contributions against the goal's NATIVE currency (not converted)
 *
 * @param {{ defaultCurrency?: string }} options
 */
export function useGoals({ defaultCurrency = 'USD' } = {}) {

  // ── Raw goal state ──
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ── Currency layer ──
  const {
    rates,
    ratesLoading,
    ratesError,
    displayCurrency,
    setDisplayCurrency,
    convert,
    fmt,
    fmtCompact,
    fmtNative,
    refreshRates,
    lastUpdated,
  } = useCurrency(defaultCurrency);

  // ─────────────────────────────────────────────────────────────────────────
  // Fetch goals
  // ─────────────────────────────────────────────────────────────────────────

  const fetchGoals = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await goalsApi.getAll();

      if (result.success) {
        setGoals(result.data ?? []);
      } else {
        setError(result.message ?? 'Failed to sync with goals infrastructure.');
      }
    } catch {
      setError('Network error: Could not reach backend server.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchGoals(); }, [fetchGoals]);

  // ─────────────────────────────────────────────────────────────────────────
  // Goals enriched with converted amounts + derived status
  // Recomputes whenever raw goals OR rates OR displayCurrency change
  // ─────────────────────────────────────────────────────────────────────────

  const enrichedGoals = useMemo(() => {
    return goals.map(goal => {
      const current = Number(goal.current_amount ?? 0);
      const target = Number(goal.target_amount ?? 0);
      const native = goal.currency ?? 'USD';

      return {
        ...goal,
        // Converted to display currency (for summary totals)
        convertedCurrent: convert(current, native),
        convertedTarget: convert(target, native),
        // Derived status so every consumer is consistent
        derivedStatus: deriveGoalStatus(goal),
      };
    });
  }, [goals, convert]);

  // ─────────────────────────────────────────────────────────────────────────
  // Summary — everything expressed in displayCurrency
  // ─────────────────────────────────────────────────────────────────────────

  const summary = useMemo(() => {
    const totalSaved = enrichedGoals.reduce((s, g) => s + g.convertedCurrent, 0);
    const totalTarget = enrichedGoals.reduce((s, g) => s + g.convertedTarget, 0);
    const completed = enrichedGoals.filter(g => g.derivedStatus === 'COMPLETED').length;
    const overdue = enrichedGoals.filter(g => g.derivedStatus === 'OVERDUE').length;

    const avgProgress = enrichedGoals.length
      ? Math.round(
        enrichedGoals.reduce((s, g) => {
          const pct = g.target_amount > 0
            ? (Number(g.current_amount) / Number(g.target_amount)) * 100
            : 0;
          return s + Math.min(pct, 100);
        }, 0) / enrichedGoals.length
      )
      : 0;

    const totalRemaining = Math.max(0, totalTarget - totalSaved);

    return {
      totalSaved,
      totalTarget,
      totalRemaining,
      completed,
      overdue,
      avgProgress,
      goalCount: enrichedGoals.length,
      // Pre-formatted strings for the summary strip
      fmtSaved: fmtCompact(totalSaved, displayCurrency),
      fmtTarget: fmtCompact(totalTarget, displayCurrency),
      fmtRemaining: fmtCompact(totalRemaining, displayCurrency),
    };
  }, [enrichedGoals, fmtCompact, displayCurrency]);

  // ─────────────────────────────────────────────────────────────────────────
  // Contribute to a goal
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Add a contribution to a goal.
   *
   * `amount` must always be in the goal's NATIVE currency (same as what the
   * user types in FuelDrawer — we never send converted values to the backend).
   *
   * @param {number|string} goalId
   * @param {number|string} amount       In goal's native currency
   * @param {string}        [note]       Optional audit note
   * @returns {Promise<{ success: boolean, message?: string }>}
   */
  const fuelGoal = useCallback(async (goalId, amount, note) => {
    setError(null);

    // ── Client-side validation ──
    const goal = goals.find(g => g.id === goalId);
    const parsedAmt = parseFloat(amount);

    if (!goal) {
      return { success: false, message: 'Goal not found.' };
    }
    if (!parsedAmt || parsedAmt <= 0) {
      return { success: false, message: 'Amount must be greater than zero.' };
    }
    if (deriveGoalStatus(goal) === 'COMPLETED' || deriveGoalStatus(goal) === 'PAUSED') {
      return { success: false, message: 'This goal cannot accept contributions in its current state.' };
    }

    const current = Number(goal.current_amount);
    const target = Number(goal.target_amount);
    const remaining = Math.max(0, target - current);

    if (!goal.allow_overflow && parsedAmt > remaining) {
      return {
        success: false,
        message: `Max contribution is ${fmtNative(remaining, goal.currency ?? 'USD')} (overflow is disabled for this goal).`,
      };
    }

    // ── API call ──
    try {
      const result = await goalsApi.contribute(goalId, parsedAmt, note);

      if (result.success) {
        // Re-sync from server to stay consistent with backend calculations
        await fetchGoals();
        return result;
      }

      setError(result.message ?? 'Transaction rejected by database engine.');
      return result;

    } catch {
      const msg = 'Network connection lost during transaction.';
      setError(msg);
      return { success: false, message: msg };
    }
  }, [goals, fetchGoals, fmtNative]);


  // ─────────────────────────────────────────────────────────────────────────
  // Create a new goal
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Initialize a brand new savings goal.
   * * @param {Object} goalPayload
   * @param {string} goalPayload.name
   * @param {number|string} goalPayload.target_amount
   * @param {string} [goalPayload.currency] - defaults to USD
   * @param {string} [goalPayload.icon] - defaults to 🎯
   * @param {boolean} [goalPayload.allowOverflow]
   * @param {string|null} [goalPayload.deadline]
   */
  const createGoal = useCallback(async (goalPayload) => {
    setError(null);

    // Client-side quick guardrails mirroring backend logic
    if (!goalPayload.name || goalPayload.name.trim() === '') {
      return { success: false, message: 'Goal name is required.' };
    }
    if (!goalPayload.target_amount || Number(goalPayload.target_amount) <= 0) {
      return { success: false, message: 'Target amount must be greater than 0.' };
    }

    try {
      const result = await goalsApi.create({
        name: goalPayload.name,
        target_amount: Number(goalPayload.target_amount),
        currency: goalPayload.currency ?? 'USD',
        icon: goalPayload.icon ?? '🎯',
        allowOverflow: !!goalPayload.allowOverflow,
        deadline: goalPayload.deadline ?? null
      });

      if (result.success) {
        // Re-sync from server to instantly show new goal in the UI list
        await fetchGoals();
        return result;
      }

      setError(result.message ?? 'Failed to initialize financial goal.');
      return result;

    } catch {
      const msg = 'Network connection lost while creating goal.';
      setError(msg);
      return { success: false, message: msg };
    }
  }, [fetchGoals]);

  // ─────────────────────────────────────────────────────────────────────────
  // Currency switcher helper: convert a one-off amount on the fly
  // (useful if FuelDrawer wants to show an "≈ EUR 12.50" hint)
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Convert `amount` in `fromCurrency` to any arbitrary `toCurrency`.
   * Uses the same live rates as everything else.
   */
  const convertTo = useCallback(
    (amount, fromCurrency, toCurrency) =>
      convertAmount(amount, fromCurrency, toCurrency, rates),
    [rates]
  );

  // ─────────────────────────────────────────────────────────────────────────
  // Public API
  // ─────────────────────────────────────────────────────────────────────────

  return {
    // ── Goal data ──
    goals: enrichedGoals,     // goals with convertedCurrent/Target + derivedStatus
    rawGoals: goals,          // untouched API response, if needed
    loading,
    error,
    refetch: fetchGoals,

    // ── Actions ──
    fuelGoal,
    createGoal,

    // ── Currency state ──
    displayCurrency,
    setDisplayCurrency,
    ratesLoading,
    ratesError,
    lastUpdated,
    refreshRates,

    // ── Summary (in displayCurrency) ──
    summary,

    // ── Formatters ──
    fmt,          // convert + full decimals  → fmt(goal.current_amount, goal.currency)
    fmtCompact,   // convert + no decimals    → fmtCompact(goal.target_amount, goal.currency)
    fmtNative,    // no conversion, native    → fmtNative(goal.current_amount, goal.currency)
    convertTo,    // one-off arbitrary convert
  };
}