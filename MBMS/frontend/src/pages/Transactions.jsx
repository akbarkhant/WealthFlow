import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  AlertCircle,
  CheckCircle2,
  Filter,
  Plus,
  ReceiptText,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Trash2,
  WalletCards,
  X,
} from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';
import {
  listTransactions,
  createTransaction,
  deleteTransaction,
} from '../api/transactionsApi';
import { listBudgets } from '../api/budgetsApi';
import { listCategories } from '../api/categoriesApi';
import { getMonthlyReport } from '../api/chartsApi';
import { mapBudgetForUi } from '../services/mappers';
import { getCurrentPeriod, getMonthDateRange } from '../utils/dateRange';
import { TableRowSkeleton } from '../components/feedback/LoadingSkeleton';
import ErrorMessage from '../components/feedback/ErrorMessage';
import EmptyState from '../components/feedback/EmptyState';
import '../styles/pages/Transactions.css';

const PAGE_SIZE = 7;
const period = getMonthDateRange(...Object.values(getCurrentPeriod()).reverse());

const money = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

const getCategoryClass = (category = '') => {
  const normalized = category.toLowerCase();
  if (normalized === 'income') return 'status-success';
  if (normalized === 'food') return 'category-food';
  if (normalized === 'utilities') return 'category-utilities';
  if (normalized === 'entertainment') return 'category-entertainment';
  return 'status-muted';
};

const getLocalDateString = () => {
  const date = new Date();
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - (offset * 60 * 1000));
  return localDate.toISOString().split('T')[0];
};

const Transactions = () => {
  const [searchParams] = useSearchParams();
  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0, hasMore: false });
  const [summary, setSummary] = useState(null);
  const [categories, setCategories] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);

  const [searchQuery, setSearchQuery] = useState(() => searchParams.get('search') || '');
  const [typeFilter, setTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date-desc');
  const [currentPage, setCurrentPage] = useState(1);

  const [showAddForm, setShowAddForm] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [formError, setFormError] = useState('');
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    categoryId: '',
    type: 'expense',
    date: getLocalDateString(),
    currency: 'USD',
  });

  // Track active toast timer to prevent memory leaks
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  const showToast = useCallback((message, tone = 'success') => {
    setToast({ message, tone });
  }, []);

  const categoryIdFilter = useMemo(() => {
    return categoryFilter === 'all'
      ? undefined
      : categories.find((c) => c.name === categoryFilter)?.id;
  }, [categoryFilter, categories]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const [txResult, bgs, cats, monthly] = await Promise.all([
        listTransactions({
          page: currentPage,
          limit: PAGE_SIZE,
          search: searchQuery.trim() || undefined,
          type: typeFilter === 'all' ? undefined : typeFilter,
          categoryId: categoryIdFilter,
          sortBy, // Pass sorting string straight to API instead of evaluating after delivery
          startDate: period.startDate,
          endDate: period.endDate,
        }),
        listBudgets({ month: period.month, year: period.year }),
        listCategories(),
        getMonthlyReport({ month: period.month, year: period.year }),
      ]);

      setTransactions(txResult.data);
      setPagination({
        page: txResult.meta.page,
        totalPages: Math.max(1, txResult.meta.totalPages),
        total: txResult.meta.total,
        hasMore: txResult.meta.hasMore,
      });
      setCategories(Array.isArray(cats) ? cats : []);
      setBudgets((Array.isArray(bgs) ? bgs : []).map(mapBudgetForUi));
      setSummary(monthly);
    } catch (err) {
      console.error('Failed to load transaction data:', err);
      setError(err.message || 'We could not load transactions.');
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery, typeFilter, categoryIdFilter, sortBy]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle Type switching and category syncing gracefully inside an input handler context
  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => {
      const updated = { ...current, [name]: value };

      // If the user flips the transaction type, automatically pick the first valid matching category
      if (name === 'type') {
        const firstMatchingCat = categories.find((c) => c.type === value);
        updated.categoryId = firstMatchingCat ? firstMatchingCat.id : '';
      }
      return updated;
    });
  };

  const resetForm = useCallback(() => {
    const defaultCat = categories.find((c) => c.type === 'expense');
    setFormData({
      description: '',
      amount: '',
      categoryId: defaultCat?.id || '',
      type: 'expense',
      date: getLocalDateString(),
      currency: 'USD',
    });
    setFormError('');
  }, [categories]);

  // Set initial category value once categories load from backend
  useEffect(() => {
    if (categories.length > 0 && !formData.categoryId) {
      const defaultCat = categories.find((c) => c.type === 'expense');
      if (defaultCat) {
        setFormData((curr) => ({ ...curr, categoryId: defaultCat.id }));
      }
    }
  }, [categories, formData.categoryId]);

  useEffect(() => {
    const query = searchParams.get('search') || '';
    setSearchQuery(query);
    setCurrentPage(1);
  }, [searchParams]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowAddForm(false);
        setPendingDelete(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    setFormError('');

    const amount = Number(formData.amount);
    if (!formData.description.trim()) {
      setFormError('Description is required.');
      return;
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      setFormError('Amount must be greater than zero.');
      return;
    }
    if (!formData.date) {
      setFormError('Date is required.');
      return;
    }
    if (!formData.categoryId) {
      setFormError('Select a category.');
      return;
    }

    try {
      await createTransaction({
        description: formData.description.trim(),
        amount,
        categoryId: formData.categoryId,
        currency: formData.currency || 'USD',
        type: formData.type,
        date: formData.date,
        isRecurring: false,
      });

      resetForm();
      setShowAddForm(false);
      await loadData();
      showToast('Transaction added successfully.');
    } catch (err) {
      setFormError(err.response?.data?.error || err.message || 'Failed to add transaction.');
    }
  };

  const handleDeleteTransaction = async () => {
    if (!pendingDelete) return;

    try {
      await deleteTransaction(pendingDelete.id);
      setPendingDelete(null);
      await loadData();
      showToast('Transaction deleted successfully.');
    } catch (err) {
      showToast('Failed to delete transaction.', 'error');
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setTypeFilter('all');
    setCategoryFilter('all');
    setSortBy('date-desc');
    setCurrentPage(1);
  };

  const totalPages = pagination.totalPages;
  const currentTransactions = transactions;

  return (
    <DashboardLayout>
      <section className="page-stack transactions-page">
        <div className="page-header">
          <div>
            <p className="page-eyebrow">Ledger</p>
            <h1 className="page-title">Transactions</h1>
            <p className="page-subtitle">
              Review, filter, sort, and record income or expenses with a clean audit trail.
            </p>
          </div>

          <button className="btn btn-primary" type="button" onClick={() => setShowAddForm(true)}>
            <Plus size={18} />
            New Transaction
          </button>
        </div>

        <div className="transaction-summary-grid">
          <article className="summary-tile">
            <span><WalletCards size={19} /></span>
            <div>
              <p>Total Income</p>
              <strong className="amount">{money.format(Number(summary?.totalIncome ?? 0))}</strong>
            </div>
          </article>
          <article className="summary-tile">
            <span><ReceiptText size={19} /></span>
            <div>
              <p>Total Expenses</p>
              <strong className="amount">{money.format(Number(summary?.totalExpenses ?? 0))}</strong>
            </div>
          </article>
          <article className="summary-tile">
            <span><SlidersHorizontal size={19} /></span>
            <div>
              <p>Visible Records</p>
              <strong>{pagination.total}</strong>
            </div>
          </article>
        </div>

        <div className="budget-list">
          {budgets.map((budget) => (
            <article className="budget-item" key={budget.id}>
              <div className="budget-top">
                <div className="budget-info">
                  <span className="budget-icon" style={{ backgroundColor: budget.color ? `${budget.color}18` : 'rgba(0, 108, 73, 0.10)', color: budget.color || 'var(--primary)' }}>
                    <WalletCards size={18} />
                  </span>
                  <div>
                    <p className="budget-name">{budget.category}</p>
                    <p className="budget-meta">{budget.usedPercent}% of {money.format(Number(budget.limit || 0))}</p>
                  </div>
                </div>
                <p className="budget-price amount">{money.format(Number(budget.used || 0))}</p>
              </div>
              <div className="progress-bar">
                <div
                  className={`progress-fill ${budget.fillClass}`}
                  style={{
                    width: `${Math.min(budget.usedPercent, 100)}%`,
                    ...(!['warning', 'danger'].includes(budget.fillClass) && budget.color ? { backgroundColor: budget.color } : {})
                  }}
                />
              </div>
            </article>
          ))}
        </div>

        <div className="filter-panel">
          <div className="filter-panel__title">
            <Filter size={18} />
            Filters
          </div>

          <div className="filter-controls">
            <div className="input-shell filter-search">
              <Search className="input-icon" />
              <input
                className="input"
                type="search"
                placeholder="Search by description"
                value={searchQuery}
                onChange={(event) => {
                  setSearchQuery(event.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>

            <select className="select" value={typeFilter} onChange={(event) => { setTypeFilter(event.target.value); setCurrentPage(1); }}>
              <option value="all">All types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>

            <select className="select" value={categoryFilter} onChange={(event) => { setCategoryFilter(event.target.value); setCurrentPage(1); }}>
              <option value="all">All categories</option>
              {[...new Set(categories.map((c) => c.name))].map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>

            <select className="select" value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
              <option value="date-desc">Newest first</option>
              <option value="date-asc">Oldest first</option>
              <option value="amount-desc">Highest amount</option>
              <option value="amount-asc">Lowest amount</option>
            </select>

            <button className="btn btn-secondary" type="button" onClick={clearFilters}>
              <RotateCcw size={16} />
              Reset
            </button>
          </div>
        </div>

        {loading && <TableRowSkeleton rows={6} />}

        {!loading && error && (
          <ErrorMessage title="Transactions unavailable" message={error} onRetry={loadData} />
        )}

        {!loading && !error && currentTransactions.length === 0 && (
          <EmptyState
            icon={ReceiptText}
            title="No transactions found"
            description="Try changing your filters, or add a new transaction to start building the ledger."
            action={
              <button className="btn btn-primary" type="button" onClick={() => setShowAddForm(true)}>
                <Plus size={18} />
                Add Transaction
              </button>
            }
          />
        )}

        {!loading && !error && currentTransactions.length > 0 && (
          <section className="table-card">
            <div className="table-scroll">
              <table className="data-table transactions-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Category</th>
                    <th className="right">Amount</th>
                    <th className="table-action">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {currentTransactions.map((item) => {
                    const isIncome = item.type === 'income';
                    const initials = (item.description || 'TX').slice(0, 2).toUpperCase();
                    return (
                      <tr key={item.id}>
                        <td className="timestamp">{item.date}</td>
                        <td>
                          <div className="merchant">
                            <span className={`merchant-logo ${isIncome ? 'income' : 'expense'}`}>{initials}</span>
                            <span>{item.description}</span>
                          </div>
                        </td>
                        <td>
                          <span className={`status-pill ${getCategoryClass(item.categoryName || item.category)}`}>{item.categoryName || item.category || 'Other'}</span>
                        </td>
                        <td className={`right amount ${isIncome ? 'amount-positive' : 'amount-negative'}`}>
                          {isIncome ? '+' : '-'}{money.format(Math.abs(Number(item.amount || 0)))}
                        </td>
                        <td className="table-action">
                          <button
                            className="icon-button danger-button"
                            type="button"
                            aria-label={`Delete ${item.description}`}
                            onClick={() => setPendingDelete(item)}
                          >
                            <Trash2 size={17} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="pagination">
              <button
                className="btn btn-secondary"
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}
              >
                Previous
              </button>
              <span className="pagination__meta">
                Page {currentPage} of {totalPages} ({pagination.total} total)
              </span>
              <button
                className="btn btn-secondary"
                type="button"
                disabled={currentPage >= totalPages || !pagination.hasMore}
                onClick={() => setCurrentPage((page) => Math.min(page + 1, totalPages))}
              >
                Next
              </button>
            </div>
          </section>
        )}

        {showAddForm && (
          <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="transaction-modal-title">
            <div className="modal-panel">
              <div className="modal-header">
                <h2 className="modal-title" id="transaction-modal-title">Add Transaction</h2>
                <button className="icon-button" type="button" aria-label="Close modal" onClick={() => { setShowAddForm(false); resetForm(); }}>
                  <X />
                </button>
              </div>

              <div className="modal-body">
                {formError && <div className="alert alert-error">{formError}</div>}

                <form className="modal-form" onSubmit={handleFormSubmit}>
                  <div className="field">
                    <label htmlFor="description">Description</label>
                    <input
                      className="input"
                      id="description"
                      name="description"
                      type="text"
                      placeholder="Grocery Store"
                      value={formData.description}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="form-grid">
                    <div className="field">
                      <label htmlFor="amount">Amount</label>
                      <input
                        className="input"
                        id="amount"
                        name="amount"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        value={formData.amount}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="field">
                      <label htmlFor="type">Type</label>
                      <select className="select" id="type" name="type" value={formData.type} onChange={handleInputChange}>
                        <option value="expense">Expense</option>
                        <option value="income">Income</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-grid">
                    <div className="field">
                      <label htmlFor="categoryId">Category</label>
                      <select
                        className="select"
                        id="categoryId"
                        name="categoryId"
                        value={formData.categoryId}
                        onChange={handleInputChange}
                      >
                        <option value="">Select category</option>
                        {categories
                          .filter((c) => c.type === formData.type)
                          .map((cat) => (
                            <option key={cat.id} value={cat.id}>
                              {cat.name}
                            </option>
                          ))}
                      </select>
                    </div>
                    <div className="field">
                      <label htmlFor="date">Date</label>
                      <input className="input" id="date" name="date" type="date" value={formData.date} onChange={handleInputChange} />
                    </div>
                  </div>

                  <div className="modal-actions">
                    <button className="btn btn-secondary" type="button" onClick={() => { setShowAddForm(false); resetForm(); }}>
                      Cancel
                    </button>
                    <button className="btn btn-primary" type="submit">
                      Save Transaction
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {pendingDelete && (
          <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="delete-transaction-title">
            <div className="modal-panel confirm-panel">
              <div className="modal-header">
                <h2 className="modal-title" id="delete-transaction-title">Delete transaction?</h2>
                <button className="icon-button" type="button" aria-label="Close modal" onClick={() => setPendingDelete(null)}>
                  <X />
                </button>
              </div>
              <div className="modal-body">
                <p className="confirm-copy">
                  This will remove <strong>{pendingDelete.description}</strong> from your ledger.
                </p>
                <div className="modal-actions">
                  <button className="btn btn-secondary" type="button" onClick={() => setPendingDelete(null)}>Cancel</button>
                  <button className="btn btn-danger" type="button" onClick={handleDeleteTransaction}>
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {toast && (
          <div className="toast-stack" role="status" aria-live="polite">
            <div className={`toast toast-${toast.tone}`}>
              {toast.tone === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
              <span>{toast.message}</span>
            </div>
          </div>
        )}
      </section>
    </DashboardLayout>
  );
};

export default Transactions;