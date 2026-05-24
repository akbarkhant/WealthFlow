import { useCallback, useEffect, useState } from 'react';
import { Plus, Tags, Trash2, X } from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';
import { listCategories, createCategory, deleteCategory } from '../api/categoriesApi';
import ErrorMessage from '../components/feedback/ErrorMessage';
import EmptyState from '../components/feedback/EmptyState';
import '../styles/pages/Categories.css';

const defaultForm = {
  name: '',
  icon: 'tag',
  color: '#006c49',
  type: 'expense',
};

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(defaultForm);
  const [formError, setFormError] = useState('');
  const [pendingDelete, setPendingDelete] = useState(null);

  const loadCategories = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await listCategories();
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Could not load categories.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError('');

    if (!formData.name.trim()) {
      setFormError('Name is required.');
      return;
    }

    try {
      await createCategory({
        name: formData.name.trim(),
        icon: formData.icon.trim() || 'tag',
        color: formData.color,
        type: formData.type,
      });
      setFormData(defaultForm);
      setShowForm(false);
      await loadCategories();
    } catch (err) {
      setFormError(err.message || 'Failed to create category.');
    }
  };

  const handleDelete = async () => {
    if (!pendingDelete) return;
    try {
      await deleteCategory(pendingDelete.id);
      setPendingDelete(null);
      await loadCategories();
    } catch (err) {
      setError(err.message || 'Failed to delete category.');
    }
  };

  return (
    <DashboardLayout>
      <section className="page-stack categories-page">
        <div className="page-header">
          <div>
            <p className="page-eyebrow">Chart of accounts</p>
            <h1 className="page-title">Categories</h1>
            <p className="page-subtitle">
              Organize income and expenses. Categories are required for transactions and budgets.
            </p>
          </div>
          <button className="btn btn-primary" type="button" onClick={() => setShowForm(true)}>
            <Plus size={18} />
            New Category
          </button>
        </div>

        {loading && <div className="categories-loading skeleton" />}

        {!loading && error && (
          <div className="error-state">
            <Tags />
            <h3>Categories unavailable</h3>
            <p>{error}</p>
            <button className="btn btn-primary" type="button" onClick={loadCategories}>
              Retry
            </button>
          </div>
        )}

        {!loading && !error && (
          <div className="categories-grid">
            {categories.length === 0 ? (
              <div className="empty-state categories-empty">
                <Tags />
                <h3>No categories yet</h3>
                <p>Create your first category to start tracking transactions.</p>
              </div>
            ) : (
              categories.map((cat) => (
                <article className="category-card surface-card" key={cat.id}>
                  <span
                    className="category-card__swatch"
                    style={{ backgroundColor: cat.color || '#006c49' }}
                  />
                  <div className="category-card__body">
                    <strong>{cat.name}</strong>
                    <span className={`status-pill ${cat.type === 'income' ? 'status-success' : 'status-muted'}`}>
                      {cat.type}
                    </span>
                  </div>
                  <button
                    className="icon-button danger-button"
                    type="button"
                    aria-label={`Delete ${cat.name}`}
                    onClick={() => setPendingDelete(cat)}
                  >
                    <Trash2 size={17} />
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
                <h2 className="modal-title">New Category</h2>
                <button className="icon-button" type="button" aria-label="Close" onClick={() => setShowForm(false)}>
                  <X />
                </button>
              </div>
              <div className="modal-body">
                {formError && <div className="alert alert-error">{formError}</div>}
                <form className="modal-form" onSubmit={handleSubmit}>
                  <div className="field">
                    <label htmlFor="name">Name</label>
                    <input className="input" id="name" name="name" value={formData.name} onChange={handleChange} />
                  </div>
                  <div className="form-grid">
                    <div className="field">
                      <label htmlFor="type">Type</label>
                      <select className="select" id="type" name="type" value={formData.type} onChange={handleChange}>
                        <option value="expense">Expense</option>
                        <option value="income">Income</option>
                      </select>
                    </div>
                    <div className="field">
                      <label htmlFor="color">Color</label>
                      <input className="input" id="color" name="color" type="color" value={formData.color} onChange={handleChange} />
                    </div>
                  </div>
                  <div className="field">
                    <label htmlFor="icon">Icon label</label>
                    <input className="input" id="icon" name="icon" value={formData.icon} onChange={handleChange} placeholder="tag" />
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
                  Delete <strong>{pendingDelete.name}</strong>? Linked budgets may be affected.
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

export default Categories;
