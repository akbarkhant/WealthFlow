// src/modules/accounts/pages/AccountsPage.jsx
import { useState, useCallback, useMemo } from 'react';
import '../styles/pages/AccountsPage.css';

import {
  useAccountsList,
  useCreateAccount,
  useUpdateAccount,
  useArchiveAccount,
  useRestoreAccount,
  useRemoveAccount,
  useSetDefaultAccount,
  useLedgerOperation,
} from '../hooks/useAccounts';

import {
  AccountCard,
  AccountFormModal,
  AccountsEmpty,
  ConfirmDialog,
  CurrencySelector,
  LedgerModal,
  NetWorthStrip,
  SkeletonCard,
  SummaryChips,
  Button,
  ToastContainer,
  useToast,
} from '../components/AccountsComponents';

// useCurrency lives at  src/hooks/useCurrency.js  (the file provided)
import { useCurrency, SUPPORTED_CURRENCIES } from '../hooks/useCurrency';
import DashboardLayout from '../layouts/DashboardLayout';

// ─────────────────────────────────────────────────────────────────────────────
// ACCOUNTS PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function AccountsPage() {
  const { toast, toasts, removeToast } = useToast();

  // ── exchange rates + display currency ─────────────────────────────────────
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
  } = useCurrency('PKR'); // default to PKR; user can switch live

  // Tag fmt with current displayCurrency so AccountCard can detect when
  // display ≠ native (used to decide whether to show the native subtitle).
  fmt._displayCurrency = displayCurrency;

  // ── server state ───────────────────────────────────────────────────────────
  const {
    accounts,
    isLoading,
    isError,
    error: listError,
    refresh,
    optimisticUpdate,
    optimisticRemove,
  } = useAccountsList();

  // ── Compute converted totals client-side ──────────────────────────────────
  // The backend getTotalAssets / getTotalLiabilities sums raw balances without
  // currency conversion, so a USD account's balance is counted as if it were
  // PKR.  We recompute here using live exchange rates so every account's
  // balance is properly converted to displayCurrency before summing.
  const convertedTotals = useMemo(() => {
    if (!accounts?.length) return { netWorth: 0, totalAssets: 0, totalLiabilities: 0 };

    let totalAssets      = 0;
    let totalLiabilities = 0;

    accounts.forEach(acc => {
      if (acc.status !== 'ACTIVE') return;
      const bal = Number(acc.balance || 0);
      // convert from the account's own currency → current displayCurrency
      const converted = rates
        ? convert(bal, acc.currency)
        : bal; // fallback: use raw value while rates load

      const isLiability = acc.type === 'CREDIT_CARD' || acc.type === 'LOAN';
      if (isLiability) totalLiabilities += converted;
      else             totalAssets      += converted;
    });

    return {
      totalAssets,
      totalLiabilities,
      netWorth: totalAssets - totalLiabilities,
    };
  }, [accounts, rates, convert, displayCurrency]);

  // ── modal state ────────────────────────────────────────────────────────────
  const [formModal,     setFormModal]     = useState({ open: false, initial: null });
  const [ledgerModal,   setLedgerModal]   = useState({ open: false, account: null, op: 'deposit' });
  const [confirmDelete, setConfirmDelete] = useState({ open: false, account: null });

  // ── mutations ──────────────────────────────────────────────────────────────
  const createAsync = useCreateAccount({
    onSuccess: () => { toast('Account created successfully!', 'success'); setFormModal({ open: false, initial: null }); refresh(); },
  });

  const updateAsync = useUpdateAccount({
    onSuccess: (data) => { toast('Account updated.', 'success'); setFormModal({ open: false, initial: null }); optimisticUpdate(data.id, data); },
  });

  const archiveAsync = useArchiveAccount({
    onSuccess: (data) => { toast('Account archived.', 'info'); optimisticUpdate(data.id, data); },
  });

  const restoreAsync = useRestoreAccount({
    onSuccess: () => { toast('Account restored.', 'success'); refresh(); },
  });

  const removeAsync = useRemoveAccount({
    onSuccess: () => {
      toast('Account deleted.', 'info');
      optimisticRemove(confirmDelete.account?.id);
      setConfirmDelete({ open: false, account: null });
      refresh();
    },
  });

  const defaultAsync = useSetDefaultAccount({
    onSuccess: (data) => { toast(`"${data.name}" set as default.`, 'success'); refresh(); },
  });

  const ledgerOp = useLedgerOperation({
    onSuccess: (data) => {
      toast('Transaction completed.', 'success');
      optimisticUpdate(data.id, { balance: data.balance });
      setLedgerModal({ open: false, account: null, op: 'deposit' });
      refresh();
    },
  });

  // ── handlers ───────────────────────────────────────────────────────────────
  const handleFormSubmit = useCallback(async (formData, id) => {
    if (id) await updateAsync.execute(id, formData);
    else     await createAsync.execute(formData);
  }, [createAsync, updateAsync]);

  const handleLedgerSubmit = useCallback(async (op, accountId, amount, targetId) => {
    if (op === 'deposit')  await ledgerOp.deposit(accountId, amount);
    if (op === 'withdraw') await ledgerOp.withdraw(accountId, amount);
    if (op === 'transfer') await ledgerOp.transfer(accountId, targetId, amount);
  }, [ledgerOp]);

  const openEdit     = (account) => setFormModal({ open: true, initial: account });
  const openLedger   = (account, op) => setLedgerModal({ open: true, account, op });
  const openCreate   = () => setFormModal({ open: true, initial: null });

  const handleArchive    = async (id) => { await archiveAsync.execute(id).catch(() => toast(archiveAsync.error || 'Failed to archive.', 'error')); };
  const handleRestore    = async (id) => { await restoreAsync.execute(id).catch(() => toast(restoreAsync.error || 'Failed to restore.', 'error')); };
  const handleSetDefault = async (id) => { await defaultAsync.execute(id).catch(() => toast(defaultAsync.error || 'Failed.', 'error')); };
  const handleDeleteInit = (account) => setConfirmDelete({ open: true, account });
  const handleDeleteConfirm = async () => {
    await removeAsync.execute(confirmDelete.account?.id).catch(() =>
      toast(removeAsync.error || 'Cannot delete account.', 'error')
    );
  };

  // ── render ─────────────────────────────────────────────────────────────────
  const formLoading = createAsync.isLoading || updateAsync.isLoading;
  const formError   = createAsync.error     || updateAsync.error;
  // Strip is loading until both accounts and rates are ready
  const stripLoading = isLoading || (ratesLoading && !rates);

  return (
    <DashboardLayout>

    <div className="accounts-module accounts-page">

      {/* ── Page header ──────────────────────────────────────────────────── */}
      <header className="accounts-page__header">
        <div className="accounts-page__headline">
          <span className="accounts-page__eyebrow">Financial Overview</span>
          <h1 className="accounts-page__title">Accounts</h1>
        </div>
        <div className="accounts-page__actions">
          {/* Live currency switcher */}
          <CurrencySelector
            value={displayCurrency}
            onChange={setDisplayCurrency}
            currencies={SUPPORTED_CURRENCIES}
            loading={ratesLoading}
          />
          <button
            className="btn btn--icon"
            onClick={refresh}
            title="Refresh"
            aria-label="Refresh accounts"
          >
            ↻
          </button>
          <Button variant="primary" onClick={openCreate}>
            + New account
          </Button>
        </div>
      </header>

      {/* ── Exchange-rate error (non-fatal, soft warning) ─────────────────── */}
      {ratesError && (
        <div className="alert alert--error" style={{ marginBottom: 'var(--space-4)' }}>
          ⚠ {ratesError}
        </div>
      )}

      {/* ── Net Worth Strip ───────────────────────────────────────────────── */}
      {/*  totals are computed here (multi-currency converted) not from the   */}
      {/*  backend endpoint which sums raw balances without conversion.        */}
      <NetWorthStrip
        totals={convertedTotals}
        displayCurrency={displayCurrency}
        fmtCompact={fmtCompact}
        loading={stripLoading}
      />

      {/* ── Summary chips ────────────────────────────────────────────────── */}
      <SummaryChips accounts={accounts} />

      {/* ── Error state ──────────────────────────────────────────────────── */}
      {isError && (
        <div className="alert alert--error" style={{ marginBottom: 'var(--space-6)' }}>
          ⚠ Failed to load accounts: {listError}
          <button
            onClick={refresh}
            style={{ marginLeft: 12, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', color: 'inherit', fontSize: 'inherit' }}
          >
            Retry
          </button>
        </div>
      )}

      {/* ── Account grid ─────────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="accounts-grid">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : accounts.length === 0 ? (
        <AccountsEmpty onAdd={openCreate} />
      ) : (
        <div className="accounts-grid">
          {accounts.map(account => (
            <AccountCard
              key={account.id}
              account={account}
              onEdit={openEdit}
              onArchive={handleArchive}
              onRestore={handleRestore}
              onDelete={handleDeleteInit}
              onSetDefault={handleSetDefault}
              onLedger={openLedger}
              fmt={fmt}
              fmtNative={fmtNative}
            />
          ))}
        </div>
      )}

      {/* ── Create / Edit Modal ───────────────────────────────────────────── */}
      <AccountFormModal
        open={formModal.open}
        onClose={() => setFormModal({ open: false, initial: null })}
        onSubmit={handleFormSubmit}
        initial={formModal.initial}
        loading={formLoading}
        error={formError}
      />

      {/* ── Ledger Modal ─────────────────────────────────────────────────── */}
      <LedgerModal
        open={ledgerModal.open}
        onClose={() => setLedgerModal({ open: false, account: null, op: 'deposit' })}
        account={ledgerModal.account}
        accounts={accounts}
        initialOp={ledgerModal.op}
        onSubmit={handleLedgerSubmit}
        loading={ledgerOp.isLoading}
        error={ledgerOp.error}
      />

      {/* ── Confirm Delete ───────────────────────────────────────────────── */}
      <ConfirmDialog
        open={confirmDelete.open}
        onClose={() => setConfirmDelete({ open: false, account: null })}
        onConfirm={handleDeleteConfirm}
        title="Delete account"
        message="This action is permanent and cannot be undone. The account must have a zero balance before deletion."
        detail={confirmDelete.account ? `${confirmDelete.account.name} — ${confirmDelete.account.currency}` : undefined}
        confirmLabel="Yes, delete"
        loading={removeAsync.isLoading}
      />

      {/* ── Toasts ───────────────────────────────────────────────────────── */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
    </DashboardLayout>
  );
}