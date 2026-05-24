import { useCallback, useEffect, useState } from 'react';
import { Plus, Target, Trash2, X } from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';
import { listBudgets, createBudget, deleteBudget } from '../api/budgetsApi';
import { listCategories } from '../api/categoriesApi';
import ErrorMessage from '../components/feedback/ErrorMessage';
import EmptyState from '../components/feedback/EmptyState';
import { LoadingSkeleton } from '../components/feedback/LoadingSkeleton';
import { mapBudgetForUi } from '../services/mappers';
import '../styles/pages/Budgets.css';

const now = new Date();

const defaultForm = {
  categoryId: '',
  amountLimit: '',
  currency: 'USD',
  month: now.getMonth() + 1,
  year: now.getFullYear(),
};

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

const Budgets = () => {
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(defaultForm);
  const [formError, setFormError] = useState('');
  const [pendingDelete, setPendingDelete] = useState(null);
  const [period, setPeriod] = useState({ month: defaultForm.month, year: defaultForm.year });

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [bgs, cats] = await Promise.all([
        listBudgets({ month: period.month, year: period.year }),
        listCategories(),
      ]);
      setBudgets((Array.isArray(bgs) ? bgs : []).map(mapBudgetForUi));
      setCategories(Array.isArray(cats) ? cats : []);
    } catch (err) {
      setError(err.message || 'Could not load budgets.');
    } finally {
      setLoading(false);
    }
  }, [period.month, period.year]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const expenseCategories = categories.filter((c) => c.type === 'expense');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: name === 'month' || name === 'year' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError('');

    const amountLimit = Number(formData.amountLimit);
    if (!formData.categoryId) {
      setFormError('Select a category.');
      return;
    }
    if (!Number.isFinite(amountLimit) || amountLimit <= 0) {
      setFormError('Limit must be greater than zero.');
      return;
    }

    try {
      await createBudget({
        categoryId: formData.categoryId,
        amountLimit,
        currency: formData.currency || 'USD',
        month: period.month,
        year: period.year,
      });
      setFormData({ ...defaultForm, month: period.month, year: period.year });
      setShowForm(false);
      await loadData();
    } catch (err) {
      setFormError(err.message || 'Failed to create budget.');
    }
  };

  const handleDelete = async () => {
    if (!pendingDelete) return;
    try {
      await deleteBudget(pendingDelete.id);
      setPendingDelete(null);
      await loadData();
    } catch (err) {
      setError(err.message || 'Failed to delete budget.');
    }
  };

  return (
    <DashboardLayout>
      <section className="page-stack budgets-page">
        <div className="page-header">
          <div>
            <p className="page-eyebrow">Monthly limits</p>
            <h1 className="page-title">Budgets</h1>
            <p className="page-subtitle">Set spending limits per category and track utilization.</p>
          </div>
          <button className="btn btn-primary" type="button" onClick={() => setShowForm(true)}>
            <Plus size={18} />
            New Budget
          </button>
        </div>

        <div className="budgets-period">
          <label>
            Month
            <select
              className="select"
              value={period.month}
              onChange={(e) => setPeriod((p) => ({ ...p, month: Number(e.target.value) }))}
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(2000, i, 1).toLocaleString('en-US', { month: 'long' })}
                </option>
              ))}
            </select>
          </label>
          <label>
            Year
            <input
              className="input"
              type="number"
              min="2020"
              max="2100"
              value={period.year}
              onChange={(e) => setPeriod((p) => ({ ...p, year: Number(e.target.value) }))}
            />
          </label>
        </div>

        {loading && <div className="budgets-loading skeleton" />}

        {!loading && error && (
          <div className="error-state">
            <Target />
            <h3>Budgets unavailable</h3>
            <p>{error}</p>
            <button className="btn btn-primary" type="button" onClick={loadData}>
              Retry
            </button>
          </div>
        )}

        {!loading && !error && (
          <div className="budget-list budgets-list">
            {budgets.length === 0 ? (
              <div className="empty-state">
                <Target />
                <h3>No budgets for this period</h3>
                <p>Create a budget for an expense category.</p>
              </div>
            ) : (
              budgets.map((budget) => (
                <article className="budget-item" key={budget.id}>
                  <div className="budget-top">
                    <div className="budget-info">
                      <span
                        className="budget-icon"
                        style={{
                          backgroundColor: budget.categoryColor
                            ? `${budget.categoryColor}18`
                            : 'rgba(0, 108, 73, 0.10)',
                          color: budget.categoryColor || 'var(--primary)',
                        }}
                      >
                        <Target size={18} />
                      </span>
                      <div>
                        <p className="budget-name">{budget.category}</p>
                        <p className="budget-meta">
                          {budget.usedPercent}% of {money.format(Number(budget.limit || 0))}
                        </p>
                      </div>
                    </div>
                    <p className="budget-price amount">{money.format(Number(budget.used || 0))}</p>
                  </div>
                  <div className="progress-bar">
                    <div
                      className={`progress-fill ${budget.fillClass}`}
                      style={{ width: `${Math.min(budget.usedPercent, 100)}%` }}
                    />
                  </div>
                  <button
                    className="btn btn-secondary budgets-delete"
                    type="button"
                    onClick={() => setPendingDelete(budget)}
                  >
                    <Trash2 size={16} />
                    Remove
                  </button>
                </article>
              ))
            )}
          </div>
        )}

        {showForm && (
          <div className="modal-overlay" role="dialog" aria-modal="true">
            <div className="modal-panel">
              <div className="modal-header">
                <h2 className="modal-title">New Budget</h2>
                <button className="icon-button" type="button" aria-label="Close" onClick={() => setShowForm(false)}>
                  <X />
                </button>
              </div>
              <div className="modal-body">
                {formError && <div className="alert alert-error">{formError}</div>}
                <form className="modal-form" onSubmit={handleSubmit}>
                  <div className="field">
                    <label htmlFor="categoryId">Category</label>
                    <select
                      className="select"
                      id="categoryId"
                      name="categoryId"
                      value={formData.categoryId}
                      onChange={handleChange}
                    >
                      <option value="">Select category</option>
                      {expenseCategories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="field">
                    <label htmlFor="amountLimit">Monthly limit</label>
                    <input
                      className="input"
                      id="amountLimit"
                      name="amountLimit"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.amountLimit}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="modal-actions">
                    <button className="btn btn-secondary" type="button" onClick={() => setShowForm(false)}>
                      Cancel
                    </button>
                    <button className="btn btn-primary" type="submit">
                      Save
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {pendingDelete && (
          <div className="modal-overlay" role="dialog" aria-modal="true">
            <div className="modal-panel confirm-panel">
              <div className="modal-body">
                <p>
                  Remove budget for <strong>{pendingDelete.category}</strong>?
                </p>
                <div className="modal-actions">
                  <button className="btn btn-secondary" type="button" onClick={() => setPendingDelete(null)}>
                    Cancel
                  </button>
                  <button className="btn btn-danger" type="button" onClick={handleDelete}>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </DashboardLayout>
  );
};

export default Budgets;
