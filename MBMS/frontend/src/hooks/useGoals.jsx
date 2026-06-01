import { useState, useEffect, useCallback } from 'react';
import { goalsApi } from '../api/goalsApi';

export function useGoals() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch goals wrapped in useCallback to prevent infinite re-render loops
  const fetchGoals = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await goalsApi.getAll();
      
      if (result.success) {
        setGoals(result.data || []);
      } else {
        setError(result.message || 'Failed to sync with goals infrastructure.');
      }
    } catch (err) {
      setError('Network error: Could not reach backend server.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch immediately on hook initialization
  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  // Action dispatcher to contribute funds
  const fuelGoal = async (goalId, amount) => {
    setError(null);
    try {
      const result = await goalsApi.contribute(goalId, amount);
      if (result.success) {
        // Automatically sync UI balances following a successful database write
        await fetchGoals();
        return result;
      } else {
        setError(result.message || 'Transaction rejected by database engine.');
        return result;
      }
    } catch (err) {
      setError('Network connection lost during transaction.');
      return { success: false };
    }
  };

  return { goals, loading, error, refetch: fetchGoals, fuelGoal };
}