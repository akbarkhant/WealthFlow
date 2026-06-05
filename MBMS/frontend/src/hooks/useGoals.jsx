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
        // 🟢 FIXED: Safely extract array regardless of backend payload structure
        const targetData = result.data?.items ?? result.data ?? [];
        setGoals(Array.isArray(targetData) ? targetData : []);
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
  // Optimistic State Modifiers
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Cleans a target goal item out of active state optimistically following deletion
   * @param {string|number} goalId
   */
  const removeGoalFromState = useCallback((goalId) => {
    setGoals((prev) => prev.filter((g) => g.id !== goalId));
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // Goals enriched with converted amounts + derived status
  // ─────────────────────────────────────────────────────────────────────────

  const enrichedGoals = useMemo(() => {
    // 🟢 FIXED: Safety fall-through check to prevent object mapper execution drops
    if (!Array.isArray(goals)) return [];

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

  const createGoal = useCallback(async (goalPayload) => {
    setError(null);

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
  // Currency switcher helper
  // ─────────────────────────────────────────────────────────────────────────

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
    goals: enrichedGoals,     
    rawGoals: goals,          
    loading,
    error,
    refetch: fetchGoals,

    // ── Actions ──
    fuelGoal,
    createGoal,
    removeGoalFromState, // 🟢 EXPOSED: Links deleting interface channels back inside state engines

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
    fmt,          
    fmtCompact,   
    fmtNative,    
    convertTo,    
  };
}