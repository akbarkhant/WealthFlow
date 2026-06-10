// src/modules/accounts/components/AccountsComponents.jsx
import { useState, useEffect, useRef, useCallback } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// UTILS
// ─────────────────────────────────────────────────────────────────────────────
const ACCOUNT_TYPE_META = {
  CASH: { emoji: '💵', label: 'Cash' },
  BANK: { emoji: '🏦', label: 'Bank' },
  SAVINGS: { emoji: '🪙', label: 'Savings' },
  CREDIT_CARD: { emoji: '💳', label: 'Credit Card' },
  LOAN: { emoji: '📋', label: 'Loan' },
  INVESTMENT: { emoji: '📈', label: 'Investment' },
  DIGITAL_WALLET: { emoji: '📲', label: 'Digital Wallet' },
};

export const ACCOUNT_TYPES = Object.keys(ACCOUNT_TYPE_META);
export const CURRENCIES = ['PKR', 'USD', 'EUR', 'GBP', 'AED', 'SAR'];

export function formatCurrency(amount, currency = 'PKR') {
  const n = Number(amount || 0);
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency', currency,
      minimumFractionDigits: 2, maximumFractionDigits: 2,
    }).format(n);
  } catch {
    return `${currency} ${n.toFixed(2)}`;
  }
}

export function formatCompact(amount, currency = 'PKR') {
  const n = Number(amount || 0);
  const abs = Math.abs(n);
  const sign = n < 0 ? '−' : '';
  if (abs >= 1_000_000) return `${sign}${currency} ${(abs / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${sign}${currency} ${(abs / 1_000).toFixed(1)}K`;
  return `${sign}${currency} ${abs.toFixed(2)}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// CURRENCY SELECTOR
// ─────────────────────────────────────────────────────────────────────────────
export function CurrencySelector({ value, onChange, currencies, loading }) {
  return (
    <div className="currency-selector" title="Display currency">
      <span className="currency-selector__icon" aria-hidden="true">🌐</span>
      <select
        className="currency-selector__select"
        value={value}
        onChange={e => onChange(e.target.value)}
        disabled={loading}
        aria-label="Select display currency"
      >
        {currencies.map(c => (
          <option key={c.code} value={c.code}>
            {c.symbol} {c.code}
          </option>
        ))}
      </select>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// BADGE
// ─────────────────────────────────────────────────────────────────────────────
export function Badge({ variant = 'type', children }) {
  return <span className={`badge badge--${variant.toLowerCase()}`}>{children}</span>;
}

// ─────────────────────────────────────────────────────────────────────────────
// BUTTON
// ─────────────────────────────────────────────────────────────────────────────
export function Button({ variant = 'primary', size, loading, children, className = '', ...props }) {
  return (
    <button
      className={`btn btn--${variant}${size ? ` btn--${size}` : ''}${loading ? ' btn--loading' : ''} ${className}`}
      disabled={props.disabled || loading}
      {...props}
    >
      {loading && <span className="btn__spinner" />}
      {children}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MODAL
// ─────────────────────────────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, footer, className = '' }) {
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === 'Escape') onClose?.(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose?.()}>
      <div className={`modal ${className}`} role="dialog" aria-modal="true">
        <div className="modal__header">
          <h2 className="modal__title">{title}</h2>
          <button className="modal__close" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className="modal__body">{children}</div>
        {footer && <div className="modal__footer">{footer}</div>}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TOAST
// ─────────────────────────────────────────────────────────────────────────────
const TOAST_ICONS = { success: '✓', error: '✕', info: 'ℹ' };

export function ToastContainer({ toasts, onRemove }) {
  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast--${t.type}`}>
          <span className="toast__icon">{TOAST_ICONS[t.type] ?? '·'}</span>
          <span style={{ flex: 1 }}>{t.message}</span>
          <button
            onClick={() => onRemove(t.id)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.5, fontSize: 14, padding: '0 0 0 8px' }}
          >✕</button>
        </div>
      ))}
    </div>
  );
}

export function useToast() {
  const [toasts, setToasts] = useState([]);
  const addToast = useCallback((message, type = 'info', duration = 3500) => {
    const id = Date.now() + Math.random();
    setToasts(p => [...p, { id, message, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), duration);
  }, []);
  const removeToast = useCallback((id) => setToasts(p => p.filter(t => t.id !== id)), []);
  return { toasts, addToast, removeToast, toast: addToast };
}

// ─────────────────────────────────────────────────────────────────────────────
// CONFIRM DIALOG
// ─────────────────────────────────────────────────────────────────────────────
export function ConfirmDialog({ open, onClose, onConfirm, title, message, detail, confirmLabel = 'Confirm', loading }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      className="confirm-dialog"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button variant="danger" onClick={onConfirm} loading={loading}>{confirmLabel}</Button>
        </>
      }
    >
      <p className="confirm-dialog__text">{message}</p>
      {detail && <div className="confirm-dialog__detail">{detail}</div>}
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SKELETON
// ─────────────────────────────────────────────────────────────────────────────
export function SkeletonCard() {
  return <div className="skeleton skeleton-card" />;
}

// ─────────────────────────────────────────────────────────────────────────────
// CONTEXT MENU
// ─────────────────────────────────────────────────────────────────────────────
function ContextMenu({ items, onClose }) {
  const ref = useRef(null);
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  return (
    <div className="ctx-menu" ref={ref} role="menu">
      {items.map((item, i) =>
        item === 'divider' ? (
          <div key={i} className="ctx-menu__divider" />
        ) : (
          <button
            key={i}
            className={`ctx-menu__item${item.danger ? ' ctx-menu__item--danger' : ''}`}
            onClick={() => { item.onClick(); onClose(); }}
            role="menuitem"
          >
            <span className="ctx-menu__icon">{item.icon}</span>
            {item.label}
          </button>
        )
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ACCOUNT CARD
// ─────────────────────────────────────────────────────────────────────────────
export function AccountCard({ account, onEdit, onArchive, onRestore, onDelete, onSetDefault, onLedger, fmt, fmtNative }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const meta = ACCOUNT_TYPE_META[account.type] || { emoji: '💼', label: account.type };
  const isDebt = account.type === 'CREDIT_CARD' || account.type === 'LOAN';
  const balance = Number(account.balance || 0);
  const limit = Number(account.credit_limit || 0);
  const util = limit > 0 ? Math.min(100, (balance / limit) * 100) : 0;
  const isActive = account.status === 'ACTIVE';

  const displayBalance = fmt
    ? fmt(balance, account.currency)
    : formatCompact(balance, account.currency);
  const nativeBalance = fmtNative
    ? fmtNative(balance, account.currency)
    : null;
  const showNative = fmtNative && fmt;

  const menuItems = [
    { icon: '✏️', label: 'Edit account', onClick: () => onEdit(account) },
    { icon: '💸', label: 'Deposit', onClick: () => onLedger(account, 'deposit'), disabled: !isActive },
    { icon: '📤', label: 'Withdraw', onClick: () => onLedger(account, 'withdraw'), disabled: !isActive },
    { icon: '🔄', label: 'Transfer', onClick: () => onLedger(account, 'transfer'), disabled: !isActive },
    'divider',
    ...(account.is_default ? [] : [{ icon: '⭐', label: 'Set as default', onClick: () => onSetDefault(account.id) }]),
    account.status === 'ARCHIVED'
      ? { icon: '♻️', label: 'Restore account', onClick: () => onRestore(account.id) }
      : { icon: '🗂️', label: 'Archive account', onClick: () => onArchive(account.id) },
    'divider',
    { icon: '🗑️', label: 'Delete account', onClick: () => onDelete(account), danger: true },
  ].filter(i => !(i?.disabled));

  return (
    <div
      className={`account-card${account.status === 'ARCHIVED' ? ' account-card--archived' : ''}${account.is_default ? ' account-card--default' : ''}`}
      data-type={account.type}
    >
      <div className="account-card__top">
        <div className="account-card__icon-wrap" aria-hidden="true">
          {meta.emoji}
        </div>
        <div className="account-card__meta">
          <div className="account-card__name" title={account.name}>{account.name}</div>
          {account.institution_name && (
            <div className="account-card__institution">{account.institution_name}</div>
          )}
        </div>
        <div style={{ position: 'relative' }}>
          <button className="account-card__menu-btn" onClick={() => setMenuOpen(o => !o)} aria-label="Account options">
            ⋯
          </button>
          {menuOpen && <ContextMenu items={menuItems} onClose={() => setMenuOpen(false)} />}
        </div>
      </div>

      <div className="account-card__balance-area">
        <div className="account-card__balance-label">
          {isDebt ? 'Amount Owed' : 'Balance'}
        </div>
        <div className={`account-card__balance${isDebt && balance > 0 ? ' account-card__balance--debt' : ''}`}>
          {displayBalance}
        </div>
        {showNative && account.currency !== (fmt._displayCurrency) && (
          <div className="account-card__balance-native">{nativeBalance}</div>
        )}

        {account.type === 'CREDIT_CARD' && limit > 0 && (
          <div className="account-card__credit-bar-wrap">
            <div className="account-card__credit-bar-label">
              <span>Credit used</span>
              <span>{util.toFixed(0)}% of {fmt ? fmt(limit, account.currency) : formatCompact(limit, account.currency)}</span>
            </div>
            <div className="account-card__credit-bar-track">
              <div
                className="account-card__credit-bar-fill"
                style={{ width: `${util}%` }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="account-card__footer">
        {account.account_number_masked ? (
          <span className="account-card__masked">{account.account_number_masked}</span>
        ) : (
          <span className="account-card__masked" style={{ opacity: 0.3 }}>
            {account.currency}
          </span>
        )}
        <div className="account-card__badges">
          {account.is_default && <Badge variant="default">Default</Badge>}
          <Badge variant={account.status?.toLowerCase() ?? 'active'}>
            {account.status ?? 'ACTIVE'}
          </Badge>
          <Badge variant="type">{meta.label}</Badge>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// NET WORTH STRIP
// ─────────────────────────────────────────────────────────────────────────────
export function NetWorthStrip({ totals, displayCurrency = 'PKR', fmtCompact: fmt, loading }) {
  if (loading) return (
    <div className="networth-strip">
      {[0, 1, 2].map(i => (
        <div key={i} className="networth-stat">
          <div className="skeleton" style={{ height: 14, width: 80, marginBottom: 8 }} />
          <div className="skeleton" style={{ height: 44, width: 200 }} />
        </div>
      ))}
    </div>
  );

  const nw = totals?.netWorth ?? 0;
  const ta = totals?.totalAssets ?? 0;
  const tl = totals?.totalLiabilities ?? 0;

  const display = fmt
    ? (n) => fmt(n, displayCurrency)
    : (n) => formatCompact(n, displayCurrency);

  const nwVariant = nw > 0 ? 'positive' : nw < 0 ? 'negative' : 'neutral';

  return (
    <div className="networth-strip" role="region" aria-label="Net worth summary">
      <div className="networth-stat">
        <span className="networth-stat__label">Net Worth</span>
        <span className={`networth-stat__value networth-stat__value--${nwVariant}`}>
          {display(nw)}
        </span>
        <span className="networth-stat__sub">Assets minus liabilities</span>
      </div>
      <div className="networth-stat">
        <span className="networth-stat__label">Total Assets</span>
        <span className="networth-stat__value networth-stat__value--positive">
          {display(ta)}
        </span>
        <span className="networth-stat__sub">Cash, bank &amp; savings</span>
      </div>
      <div className="networth-stat">
        <span className="networth-stat__label">Total Liabilities</span>
        <span className="networth-stat__value networth-stat__value--negative">
          {display(tl)}
        </span>
        <span className="networth-stat__sub">Credit cards &amp; loans</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SUMMARY CHIPS
// ─────────────────────────────────────────────────────────────────────────────
export function SummaryChips({ summary, accounts }) {
  if (!summary && !accounts?.length) return null;
  const activeCount = accounts?.filter(a => a.status === 'ACTIVE').length ?? 0;

  return (
    <div className="summary-chips">
      <div className="summary-chip">
        <span className="summary-chip__dot summary-chip__dot--green" />
        {activeCount} active {activeCount === 1 ? 'account' : 'accounts'}
      </div>
      {summary?.netWorth !== undefined && (
        <div className="summary-chip">
          <span className="summary-chip__dot summary-chip__dot--blue" />
          Net worth tracked
        </div>
      )}
      {accounts?.some(a => a.type === 'CREDIT_CARD') && (
        <div className="summary-chip">
          <span className="summary-chip__dot summary-chip__dot--amber" />
          Credit monitored
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CREATE / EDIT ACCOUNT MODAL
// ─────────────────────────────────────────────────────────────────────────────
const EMPTY_FORM = {
  name: '', type: 'BANK', currency: 'PKR',
  balance: '', credit_limit: '', institution_name: '', account_number_masked: '',
};

export function AccountFormModal({ open, onClose, onSubmit, initial, loading, error }) {
  const isEdit = Boolean(initial?.id);
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    if (open) setForm(initial ? {
      name: initial.name || '',
      type: initial.type || 'BANK',
      currency: initial.currency || 'PKR',
      balance: initial.balance ?? '',
      credit_limit: initial.credit_limit ?? '',
      institution_name: initial.institution_name || '',
      account_number_masked: initial.account_number_masked || '',
    } : EMPTY_FORM);
  }, [open, initial]);

  const set = (field) => (e) => setForm(p => ({ ...p, [field]: e.target.value }));

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const toNum = (v) => { const n = parseFloat(v); return Number.isFinite(n) ? n : undefined; };
    const toStr = (v) => (v && v.trim() ? v.trim() : undefined);

    const payload = {
      name: form.name,
      type: form.type,
      currency: form.currency,
      balance: toNum(form.balance),
      credit_limit: toNum(form.credit_limit),
      institution_name: toStr(form.institution_name),
      account_number_masked: toStr(form.account_number_masked),
    };

    const clean = Object.fromEntries(
      Object.entries(payload).filter(([, v]) => v !== undefined)
    );

    onSubmit(clean, initial?.id);
  };

  const isCreditCard = form.type === 'CREDIT_CARD';

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Account' : 'New Account'}
      footer={null}
    >
      <form id="account-core-form" onSubmit={handleFormSubmit}>
        {error && <div className="alert alert--error">⚠ {error}</div>}

        <div className="form-row">
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">
              Account name <span>*</span>
            </label>
            <input
              className="form-input"
              value={form.name}
              onChange={set('name')}
              placeholder="e.g. HBL Checking"
              maxLength={100}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">
              Account type <span>*</span>
            </label>
            <div className="form-select-wrap">
              <select
                className="form-select"
                value={form.type}
                onChange={set('type')}
              >
                {ACCOUNT_TYPES.map(t => (
                  <option key={t} value={t}>
                    {ACCOUNT_TYPE_META[t]?.label ?? t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Currency</label>
            <div className="form-select-wrap">
              <select
                className="form-select"
                value={form.currency}
                onChange={set('currency')}
              >
                {CURRENCIES.map(c => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {!isEdit && (
          <div className="form-group">
            <label className="form-label">Opening balance</label>
            <input
              className="form-input"
              type="number"
              min="0"
              step="0.01"
              value={form.balance}
              onChange={set('balance')}
              placeholder="0.00"
            />
            <span className="form-hint">
              Starting balance for this account
            </span>
          </div>
        )}

        {isCreditCard && (
          <div className="form-group">
            <label className="form-label">Credit limit</label>
            <input
              className="form-input"
              type="number"
              min="0"
              step="0.01"
              value={form.credit_limit}
              onChange={set('credit_limit')}
              placeholder="0.00"
            />
          </div>
        )}

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Institution</label>
            <input
              className="form-input"
              value={form.institution_name}
              onChange={set('institution_name')}
              placeholder="e.g. Meezan Bank"
              maxLength={100}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Account # (masked)</label>
            <input
              className="form-input"
              value={form.account_number_masked}
              onChange={set('account_number_masked')}
              placeholder="•••• 1234"
              maxLength={30}
            />
          </div>
        </div>

        <div className="form-actions">
          <Button
            variant="primary"
            type="submit"
            loading={loading}
            className="create-account-btn"
          >
            {isEdit ? (
              <>
                <span> Save Changes</span>
              </>
            ) : (
              <>
                <span>Create Account</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LEDGER OPERATION MODAL
// ─────────────────────────────────────────────────────────────────────────────
const OP_META = {
  deposit: { label: 'Deposit', icon: '💸', color: 'success', btnVariant: 'primary' },
  withdraw: { label: 'Withdraw', icon: '📤', color: 'error', btnVariant: 'danger' },
  transfer: { label: 'Transfer', icon: '🔄', color: 'tertiary', btnVariant: 'primary' },
};

export function LedgerModal({ open, onClose, account, accounts, initialOp = 'deposit', onSubmit, loading, error }) {
  const [op, setOp] = useState(initialOp);
  const [amount, setAmount] = useState('');
  const [targetId, setTargetId] = useState('');

  useEffect(() => { if (open) { setOp(initialOp); setAmount(''); setTargetId(''); } }, [open, initialOp]);

  const otherAccounts = accounts?.filter(a => a.id !== account?.id && a.status === 'ACTIVE') ?? [];
  const meta = OP_META[op];
  const targetAccount = otherAccounts.find(a => a.id === targetId);

  const handleLedgerSubmit = (e) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (!num || num <= 0) return;
    if (op === 'transfer') onSubmit(op, account.id, num, targetId);
    else onSubmit(op, account.id, num);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`${meta?.icon} ${meta?.label}`}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button
            variant={meta?.btnVariant}
            type="submit"
            form="ledger-operation-form"
            loading={loading}
            disabled={!amount || (op === 'transfer' && !targetId)}
          >
            {meta?.label} funds
          </Button>
        </>
      }
    >
      <form id="ledger-operation-form" onSubmit={handleLedgerSubmit}>
        {error && <div className="alert alert--error">⚠ {error}</div>}

        {/* Op tabs */}
        <div className="op-tabs">
          {(['deposit', 'withdraw', 'transfer']).map(o => (
            <button
              type="button"
              key={o}
              className={`op-tab op-tab--${o}${op === o ? ' op-tab--active' : ''}`}
              onClick={() => setOp(o)}
            >
              <span className="op-tab__icon">{OP_META[o].icon}</span>
              {OP_META[o].label}
            </button>
          ))}
        </div>

        {/* Account context */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px',
          background: 'var(--color-surface-container-low)', borderRadius: 'var(--radius-md)', marginBottom: 15
        }}>
          <span style={{ fontSize: 20 }}>{ACCOUNT_TYPE_META[account?.type]?.emoji ?? '💼'}</span>
          <div>
            <div style={{ fontSize: 'var(--acc-type-base)', fontWeight: 600, color: 'var(--color-on-surface)' }}>
              {account?.name}
            </div>
            <div style={{ fontSize: 'var(--acc-type-xs)', color: 'var(--color-secondary)', fontFamily: 'var(--acc-font-mono)' }}>
              Balance: {formatCurrency(account?.balance, account?.currency)}
            </div>
          </div>
        </div>

        {/* Amount */}
        <div className="form-group">
          <label className="form-label">Amount <span style={{ color: 'var(--color-error)' }}>*</span></label>
          <div className="amount-input-wrap">
            <span className="amount-currency">{account?.currency ?? 'PKR'}</span>
            <input
              className="form-input"
              type="number"
              min="0.01"
              step="0.01"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="0.00"
              required
              autoFocus
            />
          </div>
        </div>

        {/* Transfer target */}
        {op === 'transfer' && (
          <div className="form-group">
            <label className="form-label">To account <span style={{ color: 'var(--color-error)' }}>*</span></label>
            <div className="form-select-wrap">
              <select className="form-select" value={targetId} onChange={e => setTargetId(e.target.value)} required>
                <option value="">Select destination…</option>
                {otherAccounts.map(a => (
                  <option key={a.id} value={a.id}>
                    {ACCOUNT_TYPE_META[a.type]?.emoji} {a.name} ({formatCompact(a.balance, a.currency)})
                  </option>
                ))}
              </select>
            </div>
            {otherAccounts.length === 0 ? (
              <span className="form-hint">No other active accounts available.</span>
            ) : account && targetAccount && account.currency !== targetAccount.currency ? (
              <span className="form-hint" style={{ color: 'var(--color-warning, #d97706)' }}>
                ⚠️ Multi-currency transfer ({account.currency} → {targetAccount.currency}). Conversion rate will be applied.
              </span>
            ) : null}
          </div>
        )}
      </form>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EMPTY STATE
// ─────────────────────────────────────────────────────────────────────────────
export function AccountsEmpty({ onAdd }) {
  return (
    <div className="accounts-empty">
      <span className="accounts-empty__icon">🏦</span>
      <h3 className="accounts-empty__title">No accounts yet</h3>
      <p className="accounts-empty__sub">
        Add your first account to start tracking your net worth, balances, and transactions.
      </p>
      <Button variant="primary" onClick={onAdd}>+ Add account</Button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// INTEGRATED CONTROLLER ACTION (NEW COMPONENT)
// ─────────────────────────────────────────────────────────────────────────────
export function CreateAccountAction({ onAdd }) {
  return (
    <Button
      variant="primary"
      onClick={onAdd}
      className="accounts-action-trigger"
    >
      <span style={{ marginRight: '6px', fontSize: '1.1em', lineHeight: 0 }}>+</span>
      New Account
    </Button>
  );
}