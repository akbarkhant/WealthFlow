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

import { useCurrency, SUPPORTED_CURRENCIES } from '../hooks/useCurrency';
import DashboardLayout from '../layouts/DashboardLayout';

export default function AccountsPage() {
  const { toast, toasts, removeToast } = useToast();

  // ── Currency Layer ────────────────────────────────────────────────────────
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
  } = useCurrency('PKR');

  // Explicitly tag custom currency formatter context flags
  fmt._displayCurrency = displayCurrency;

  // ── Server State Tracking ──────────────────────────────────────────────────
  const {
    accounts,
    isLoading,
    isError,
    error: listError,
    refresh,
    optimisticUpdate,
    optimisticRemove,
  } = useAccountsList();

  // ── Client-Side Filters ────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState('ACTIVE'); // 'ACTIVE' or 'ARCHIVED'

  // ── Multi-Currency Aggregations ──────────────────────────────────────────
  const convertedTotals = useMemo(() => {
    if (!accounts?.length) return { netWorth: 0, totalAssets: 0, totalLiabilities: 0 };

    let totalAssets = 0;
    let totalLiabilities = 0;

    accounts.forEach(acc => {
      // Net worth calculations always evaluate active capital pools
      if (acc.status !== 'ACTIVE') return;
      
      const bal = Number(acc.balance || 0);
      const converted = rates ? convert(bal, acc.currency) : bal;

      const isLiability = acc.type === 'CREDIT_CARD' || acc.type === 'LOAN';
      if (isLiability) totalLiabilities += converted;
      else             totalAssets      += converted;
    });

    return {
      totalAssets,
      totalLiabilities,
      netWorth: totalAssets - totalLiabilities,
    };
  }, [accounts, rates, convert]);

  // Split and filter accounts arrays safely across analytical state lenses
  const filteredAccounts = useMemo(() => {
    if (!Array.isArray(accounts)) return [];
    return accounts.filter(acc => acc.status === activeTab);
  }, [accounts, activeTab]);

  // ── Modals Declarative State ───────────────────────────────────────────────
  const [formModal, setFormModal] = useState({ open: false, initial: null });
  const [ledgerModal, setLedgerModal] = useState({ open: false, account: null, op: 'deposit' });
  const [confirmDelete, setConfirmDelete] = useState({ open: false, account: null });

  // ── Async Mutations Engine ─────────────────────────────────────────────────
  const createAsync = useCreateAccount({
    onSuccess: () => { 
      toast('Account created successfully!', 'success'); 
      setFormModal({ open: false, initial: null }); 
      refresh(); 
    },
  });

  const updateAsync = useUpdateAccount({
    onSuccess: (data) => { 
      toast('Account details updated successfully.', 'success'); 
      setFormModal({ open: false, initial: null }); 
      optimisticUpdate(data.id, data); 
    },
  });

  const archiveAsync = useArchiveAccount({
    onSuccess: (data) => { 
      toast('Account moved to archive status context.', 'info'); 
      optimisticUpdate(data.id, data); 
    },
  });

  const restoreAsync = useRestoreAccount({
    onSuccess: () => { 
      toast('Account restored to active workbench state.', 'success'); 
      refresh(); 
    },
  });

  const removeAsync = useRemoveAccount({
    onSuccess: () => {
      toast('Account record removed from core storage.', 'info');
      optimisticRemove(confirmDelete.account?.id);
      setConfirmDelete({ open: false, account: null });
      refresh();
    },
  });

  const defaultAsync = useSetDefaultAccount({
    onSuccess: (data) => { 
      toast(`"${data.name}" set as system-wide standard baseline.`, 'success'); 
      refresh(); 
    },
  });

  const ledgerOp = useLedgerOperation({
    onSuccess: (data) => {
      toast('Transaction synchronized successfully.', 'success');
      optimisticUpdate(data.id, { balance: data.balance });
      setLedgerModal({ open: false, account: null, op: 'deposit' });
      refresh();
    },
  });

  // ── Memoized Event Orchestrators ───────────────────────────────────────────
  const handleFormSubmit = useCallback(async (formData, id) => {
    if (id) await updateAsync.execute(id, formData);
    else     await createAsync.execute(formData);
  }, [createAsync, updateAsync]);

  const handleLedgerSubmit = useCallback(async (op, accountId, amount, targetId) => {
    if (op === 'deposit')  await ledgerOp.deposit(accountId, amount);
    if (op === 'withdraw') await ledgerOp.withdraw(accountId, amount);
    if (op === 'transfer') await ledgerOp.transfer(accountId, targetId, amount);
  }, [ledgerOp]);

  const openEdit     = useCallback((account) => setFormModal({ open: true, initial: account }), []);
  const openLedger   = useCallback((account, op) => setLedgerModal({ open: true, account, op }), []);
  const openCreate   = useCallback(() => setFormModal({ open: true, initial: null }), []);

  const handleArchive    = useCallback(async (id) => { await archiveAsync.execute(id).catch(() => toast(archiveAsync.error || 'Failed to archive account pipeline.', 'error')); }, [archiveAsync, toast]);
  const handleRestore    = useCallback(async (id) => { await restoreAsync.execute(id).catch(() => toast(restoreAsync.error || 'Failed to restore active lifecycle context.', 'error')); }, [restoreAsync, toast]);
  const handleSetDefault = useCallback(async (id) => { await defaultAsync.execute(id).catch(() => toast(defaultAsync.error || 'Failed updating primary reference pointers.', 'error')); }, [defaultAsync, toast]);
  const handleDeleteInit = useCallback((account) => setConfirmDelete({ open: true, account }), []);
  
  const handleDeleteConfirm = useCallback(async () => {
    await removeAsync.execute(confirmDelete.account?.id).catch(() =>
      toast(removeAsync.error || 'Cannot clear account: Verify structural compliance standards.', 'error')
    );
  }, [removeAsync, confirmDelete.account, toast]);

  // ── Evaluation Context Flags ────────────────────────────────────────────────
  const formLoading = createAsync.isLoading || updateAsync.isLoading;
  const formError   = createAsync.error     || updateAsync.error;
  const stripLoading = isLoading || (ratesLoading && !rates);

  return (
    <DashboardLayout>
      <div className="accounts-module accounts-page">
        
        {/* ── Page Top Level Header ── */}
        <header className="accounts-page__header">
          <div className="accounts-page__headline">
            <span className="accounts-page__eyebrow">Financial Engine Balance Matrix</span>
            <h1 className="accounts-page__title">Capital Profiles</h1>
          </div>
          <div className="accounts-page__actions">
            <CurrencySelector
              value={displayCurrency}
              onChange={setDisplayCurrency}
              currencies={SUPPORTED_CURRENCIES}
              loading={ratesLoading}
            />
            <button
              className="btn btn--icon button-refresh-spin"
              onClick={refresh}
              disabled={isLoading}
              title="Refresh Structural Assets"
              aria-label="Refresh transactional account arrays"
            >
              ↻
            </button>
            <Button variant="primary" onClick={openCreate}>
              + Initialize Account
            </Button>
          </div>
        </header>

        {/* ── Soft Resiliency Notices ── */}
        {ratesError && (
          <div className="alert alert--error animated-fade-in-down">
            <span>⚠ Exchange Network Sync Stalled: Using local currency cache.</span>
          </div>
        )}

        {/* ── Analytical Metrics Bar ── */}
        <NetWorthStrip
          totals={convertedTotals}
          displayCurrency={displayCurrency}
          fmtCompact={fmtCompact}
          loading={stripLoading}
        />

        <SummaryChips accounts={accounts} />

        {/* ── Layout Controls ── */}
        <div className="accounts-page__filter-bar">
          <div className="tab-group-container">
            <button 
              className={`tab-item ${activeTab === 'ACTIVE' ? 'tab-item--active' : ''}`}
              onClick={() => setActiveTab('ACTIVE')}
            >
              Active Asset Ecosystem
            </button>
            <button 
              className={`tab-item ${activeTab === 'ARCHIVED' ? 'tab-item--active' : ''}`}
              onClick={() => setActiveTab('ARCHIVED')}
            >
              Cold Storage Records
            </button>
          </div>
        </div>

        {/* ── Central Error Handling State ── */}
        {isError && (
          <div className="alert alert--error-critical container-bounce">
            <span>⚠ Core Fetch Failure: {listError}</span>
            <button onClick={refresh} className="alert-retry-action">
              Retry Sync Lifecycle
            </button>
          </div>
        )}

        {/* ── Main Data Rendering Terminal ── */}
        <main className="accounts-content-stage">
          {isLoading ? (
            <div className="accounts-grid">
              {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : filteredAccounts.length === 0 ? (
            <AccountsEmpty onAdd={openCreate} context={activeTab} />
          ) : (
            <div className="accounts-grid animated-fade-in">
              {filteredAccounts.map(account => (
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
        </main>

        {/* ── Declarative Modal Control Layers ── */}
        <AccountFormModal
          open={formModal.open}
          onClose={() => setFormModal({ open: false, initial: null })}
          onSubmit={handleFormSubmit}
          initial={formModal.initial}
          loading={formLoading}
          error={formError}
        />

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

        <ConfirmDialog
          open={confirmDelete.open}
          onClose={() => setConfirmDelete({ open: false, account: null })}
          onConfirm={handleDeleteConfirm}
          title="Archive Sequence Purge Request"
          message="This system action deletes database entry constraints permanently. System controls enforce that accounts must settle to exactly a zero net baseline before destruction arrays execute."
          detail={confirmDelete.account ? `${confirmDelete.account.name} — Holding Native (${confirmDelete.account.currency})` : undefined}
          confirmLabel="Execute Clean Deletion"
          loading={removeAsync.isLoading}
        />

        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </div>
    </DashboardLayout>
  );
}