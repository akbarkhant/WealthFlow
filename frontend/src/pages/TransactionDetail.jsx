import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Calendar, 
  Tag, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Trash2,
  AlertCircle
} from 'lucide-react';
import { listTransactions, deleteTransaction } from '../api/transactionsApi'; // Adjust paths as needed
import '../styles/pages/TransactionDetail.css';

const money = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

const TransactionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTransaction = async () => {
      setLoading(true);
      try {
        // Fallback or specific dynamic individual fetch if available
        const result = await listTransactions({ limit: 100 });
        const data = Array.isArray(result) ? result : (result.data || []);
        const found = data.find(tx => String(tx.id) === String(id));
        
        if (found) {
          setTransaction(found);
        } else {
          setError('Transaction record could not be found.');
        }
      } catch (err) {
        setError('Failed to fetch transaction details.');
      } finally {
        setLoading(false);
      }
    };

    fetchTransaction();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to permanently delete this record?')) return;
    try {
      await deleteTransaction(id);
      navigate('/transactions');
    } catch (err) {
      setError('Failed to delete transaction record.');
    }
  };

  if (loading) {
    return (
      <div className="detail-loading-container">
        <div className="detail-spinner" />
        <p>Retrieving ledger item...</p>
      </div>
    );
  }

  if (error || !transaction) {
    return (
      <div className="detail-error-card">
        <AlertCircle size={40} className="error-icon" />
        <h2>Record Missing</h2>
        <p>{error || 'Something went wrong.'}</p>
        <Link to="/transactions" className="btn-back-link">
          <ArrowLeft size={16} /> Back to Ledger
        </Link>
      </div>
    );
  }

  const isIncome = transaction.type === 'income';

  return (
    <div className="detail-page-wrapper">
      {/* Navigation Breadcrumb Line */}
      <div className="detail-breadcrumb">
        <button onClick={() => navigate(-1)} className="btn-icon-back" aria-label="Go back">
          <ArrowLeft size={18} />
          <span>Back to Ledger</span>
        </button>
      </div>

      {/* Main Glassmorphic Display Card */}
      <div className="glass-detail-card">
        
        {/* Card Header Zone */}
        <div className="detail-card-header">
          <div className="header-meta">
            <span className={`type-pill ${isIncome ? 'income' : 'expense'}`}>
              {isIncome ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              {transaction.type}
            </span>
            <h1 className="detail-title">{transaction.description}</h1>
          </div>
          
          <div className={`detail-amount ${isIncome ? 'positive' : 'negative'}`}>
            {isIncome ? '+' : '-'}{money.format(Math.abs(Number(transaction.amount)))}
          </div>
        </div>

        <hr className="divider-line" />

        {/* Structured Grid Layout for Attributes */}
        <div className="detail-attribute-grid">
          <div className="attribute-item">
            <div className="attribute-label">
              <Calendar size={16} />
              <span>Posting Date</span>
            </div>
            <div className="attribute-value">{transaction.date}</div>
          </div>

          <div className="attribute-item">
            <div className="attribute-label">
              <Tag size={16} />
              <span>Category Allocation</span>
            </div>
            <div className="attribute-value">
              <span className="category-tag-pill">
                {transaction.categoryName || transaction.category || 'Unassigned'}
              </span>
            </div>
          </div>

          <div className="attribute-item">
            <div className="attribute-label">
              <DollarSign size={16} />
              <span>Base Currency</span>
            </div>
            <div className="attribute-value">{transaction.currency || 'USD'}</div>
          </div>

          <div className="attribute-item">
            <div className="attribute-label">
              <Clock size={16} />
              <span>Record Identity</span>
            </div>
            <div className="attribute-value security-hash">#{transaction.id}</div>
          </div>
        </div>

        <hr className="divider-line" />

        {/* Dynamic Action Sub-Footer */}
        <div className="detail-card-actions">
          <p className="audit-note">Audit trail finalized. Changes here mutate total budget calculations.</p>
          <button onClick={handleDelete} className="btn-destructive-action" type="button">
            <Trash2 size={16} />
            Delete Transaction
          </button>
        </div>

      </div>
    </div>
  );
};

export default TransactionDetail;