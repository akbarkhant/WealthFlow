// src/modules/accounts/hooks/useAccounts.js
import { useState, useCallback, useEffect, useRef } from 'react';
import * as api from '../api/accountsApi';

const IDLE    = 'idle';
const LOADING = 'loading';
const SUCCESS = 'success';
const ERROR   = 'error';

function useAsync(asyncFn, opts = {}) {
  const { immediate = false, onSuccess, onError } = opts;
  const [status, setStatus] = useState(IDLE);
  const [data, setData]     = useState(null);
  const [error, setError]   = useState(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const execute = useCallback(async (...args) => {
    setStatus(LOADING);
    setError(null);
    try {
      const result = await asyncFn(...args);
      if (!mountedRef.current) return;
      setData(result?.data ?? result);
      setStatus(SUCCESS);
      onSuccess?.(result?.data ?? result);
      return result?.data ?? result;
    } catch (err) {
      if (!mountedRef.current) return;
      setError(err.message || 'Something went wrong.');
      setStatus(ERROR);
      onError?.(err);
      throw err;
    }
  }, [asyncFn, onSuccess, onError]);

  useEffect(() => {
    if (immediate) execute();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return { execute, data, status, error,
    isIdle:    status === IDLE,
    isLoading: status === LOADING,
    isSuccess: status === SUCCESS,
    isError:   status === ERROR,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// useAccountsList  — fetch + optimistic local mutations
// ─────────────────────────────────────────────────────────────────────────────
export function useAccountsList() {
  const [accounts, setAccounts] = useState([]);
  const [summary,  setSummary]  = useState(null);
  const [netWorth, setNetWorth] = useState(null);

  const listAsync  = useAsync(api.listAccounts,        { immediate: true });
  const summaryAsync = useAsync(api.getAccountsSummary, { immediate: true });
  const netWorthAsync = useAsync(api.getNetWorth,       { immediate: true });

  // Sync server responses into local state
  useEffect(() => { if (listAsync.data)    setAccounts(listAsync.data);  }, [listAsync.data]);
  useEffect(() => { if (summaryAsync.data) setSummary(summaryAsync.data); }, [summaryAsync.data]);
  useEffect(() => { if (netWorthAsync.data) setNetWorth(netWorthAsync.data); }, [netWorthAsync.data]);

  const refresh = useCallback(() => {
    listAsync.execute();
    summaryAsync.execute();
    netWorthAsync.execute();
  }, [listAsync, summaryAsync, netWorthAsync]);

  // Optimistic helpers --------------------------------------------------------
  const optimisticUpdate = useCallback((id, patch) => {
    setAccounts(prev => prev.map(a => a.id === id ? { ...a, ...patch } : a));
  }, []);

  const optimisticRemove = useCallback((id) => {
    setAccounts(prev => prev.filter(a => a.id !== id));
  }, []);

  return {
    accounts,
    summary,
    netWorth,
    isLoading: listAsync.isLoading,
    isError:   listAsync.isError,
    error:     listAsync.error,
    refresh,
    optimisticUpdate,
    optimisticRemove,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// useCreateAccount
// ─────────────────────────────────────────────────────────────────────────────
export function useCreateAccount({ onSuccess } = {}) {
  return useAsync(api.createAccount, { onSuccess });
}

// ─────────────────────────────────────────────────────────────────────────────
// useUpdateAccount
// ─────────────────────────────────────────────────────────────────────────────
export function useUpdateAccount({ onSuccess } = {}) {
  const updateFn = useCallback((id, payload) => api.updateAccount(id, payload), []);
  return useAsync(updateFn, { onSuccess });
}

// ─────────────────────────────────────────────────────────────────────────────
// useArchiveAccount
// ─────────────────────────────────────────────────────────────────────────────
export function useArchiveAccount({ onSuccess } = {}) {
  return useAsync(api.archiveAccount, { onSuccess });
}

// ─────────────────────────────────────────────────────────────────────────────
// useRestoreAccount
// ─────────────────────────────────────────────────────────────────────────────
export function useRestoreAccount({ onSuccess } = {}) {
  return useAsync(api.restoreAccount, { onSuccess });
}

// ─────────────────────────────────────────────────────────────────────────────
// useRemoveAccount
// ─────────────────────────────────────────────────────────────────────────────
export function useRemoveAccount({ onSuccess } = {}) {
  return useAsync(api.removeAccount, { onSuccess });
}

// ─────────────────────────────────────────────────────────────────────────────
// useSetDefaultAccount
// ─────────────────────────────────────────────────────────────────────────────
export function useSetDefaultAccount({ onSuccess } = {}) {
  return useAsync(api.setDefaultAccount, { onSuccess });
}

// ─────────────────────────────────────────────────────────────────────────────
// useLedgerOperation  (deposit / withdraw / transfer)
// ─────────────────────────────────────────────────────────────────────────────
export function useLedgerOperation({ onSuccess } = {}) {
  const [activeOp, setActiveOp] = useState(null); // 'deposit' | 'withdraw' | 'transfer'

  const depositAsync  = useAsync(api.depositFunds,  { onSuccess });
  const withdrawAsync = useAsync(api.withdrawFunds, { onSuccess });
  const transferAsync = useAsync(api.transferFunds, { onSuccess });

  const deposit  = useCallback((id, amount)             => { setActiveOp('deposit');  return depositAsync.execute(id, amount); },  [depositAsync]);
  const withdraw = useCallback((id, amount)             => { setActiveOp('withdraw'); return withdrawAsync.execute(id, amount); }, [withdrawAsync]);
  const transfer = useCallback((src, target, amount)    => { setActiveOp('transfer'); return transferAsync.execute(src, target, amount); }, [transferAsync]);

  const isLoading = depositAsync.isLoading || withdrawAsync.isLoading || transferAsync.isLoading;
  const error     = depositAsync.error     || withdrawAsync.error     || transferAsync.error;

  return { deposit, withdraw, transfer, isLoading, error, activeOp };
}

// ─────────────────────────────────────────────────────────────────────────────
// useAccountById  — single account detail
// ─────────────────────────────────────────────────────────────────────────────
export function useAccountById(id) {
  const fetchFn = useCallback(() => api.getAccountById(id), [id]);
  const { execute, data, isLoading, isError, error } = useAsync(fetchFn, {
    immediate: !!id,
  });
  return { account: data, isLoading, isError, error, refetch: execute };
}