import React, { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import api from "../utils/api";
import "../styles/pages/Transactions.css";

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date-desc");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Add Transaction Modal / Form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    category: "Food",
    type: "expense",
    date: new Date().toISOString().split("T")[0]
  });
  const [formError, setFormError] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const txs = await api.get('/transactions');
      setTransactions(txs);
      
      const bgs = await api.get('/budgets');
      const formattedBgs = bgs.map(b => {
        const usedPercent = b.limit > 0 ? Math.round((b.spent / b.limit) * 100) : 0;
        return {
          ...b,
          usedPercent,
          used: b.spent,
          fillClass: usedPercent >= 90 ? 'danger' : usedPercent >= 70 ? 'warning' : 'success'
        };
      });
      setBudgets(formattedBgs);
    } catch (err) {
      console.error('Failed to load transaction data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!formData.description.trim()) {
      setFormError("Description is required");
      return;
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setFormError("Amount must be greater than zero");
      return;
    }

    try {
      const newTx = {
        description: formData.description,
        amount: parseFloat(formData.amount),
        category: formData.category,
        type: formData.type,
        date: formData.date
      };

      await api.post('/transactions', newTx);
      
      // Clear form and reload
      setFormData({
        description: "",
        amount: "",
        category: "Food",
        type: "expense",
        date: new Date().toISOString().split("T")[0]
      });
      setShowAddForm(false);
      loadData();
    } catch (err) {
      setFormError("Failed to add transaction");
    }
  };

  const handleDeleteTransaction = async (id) => {
    if (window.confirm("Are you sure you want to delete this transaction?")) {
      try {
        await api.delete(`/transactions/${id}`);
        loadData();
      } catch (err) {
        console.error("Failed to delete transaction", err);
      }
    }
  };

  // 1. Filtering logic
  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = tx.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || tx.type === typeFilter;
    const matchesCategory = categoryFilter === "all" || tx.category === categoryFilter;
    return matchesSearch && matchesType && matchesCategory;
  });

  // 2. Sorting logic
  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    if (sortBy === "date-desc") {
      return new Date(b.date) - new Date(a.date);
    }
    if (sortBy === "date-asc") {
      return new Date(a.date) - new Date(b.date);
    }
    if (sortBy === "amount-desc") {
      return b.amount - a.amount;
    }
    if (sortBy === "amount-asc") {
      return a.amount - b.amount;
    }
    return 0;
  });

  // 3. Pagination calculation
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTransactions = sortedTransactions.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedTransactions.length / itemsPerPage);

  const getTagClass = (category) => {
    switch (category?.toLowerCase()) {
      case "food": return "tag-food";
      case "utilities": return "tag-utilities";
      case "entertainment": return "tag-entertainment";
      case "income": return "tag-income";
      default: return "tag-other";
    }
  };

  return (
    <DashboardLayout>
      <div className="transactions-page">
        {/* Header Section */}
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-main)' }}>Transactions Ledger</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Monitor and analyze your financial transactions</p>
          </div>
          <button className="add-btn" onClick={() => setShowAddForm(true)}>
            <span className="material-symbols-outlined">add</span>
            New Transaction
          </button>
        </div>

        {/* Budgets Section */}
        <div className="budget-list">
          {budgets.map((budget) => (
            <div className="budget-item" key={budget.id}>
              <div className="budget-top">
                <div className="budget-info">
                  <div className="budget-icon" style={{ backgroundColor: budget.color + '15', color: budget.color }}>
                    <span className="material-symbols-outlined">
                      {budget.category === 'Food' ? 'restaurant' : budget.category === 'Utilities' ? 'bolt' : 'movie'}
                    </span>
                  </div>
                  <div>
                    <p className="budget-name">{budget.category}</p>
                    <p className="budget-meta">
                      {budget.usedPercent}% of ${budget.limit} limit
                    </p>
                  </div>
                </div>
                <p className="budget-price">${budget.used}</p>
              </div>
              <div className="progress-bar">
                <div
                  className={`progress-fill ${budget.fillClass}`}
                  style={{
                    width: `${Math.min(budget.usedPercent, 100)}%`,
                    backgroundColor: budget.color
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters and Controls */}
        <div className="filter-bar" style={{
          display: 'flex',
          gap: '16px',
          backgroundColor: 'var(--surface-container-lowest)',
          padding: '16px',
          borderRadius: 'var(--radius-xl)',
          marginBottom: '20px',
          flexWrap: 'wrap',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ flex: 1, minWidth: '200px', display: 'flex', alignItems: 'center', background: 'var(--background)', borderRadius: 'var(--radius-md)', padding: '0 12px' }}>
            <span className="material-symbols-outlined" style={{ color: 'var(--text-muted)', marginRight: '8px' }}>search</span>
            <input
              type="text"
              placeholder="Search by description..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              style={{ width: '100%', padding: '10px 0', border: 'none', background: 'transparent', color: 'var(--text-main)', fontSize: '14px', outline: 'none' }}
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1); }}
            style={{ padding: '10px 16px', background: 'var(--background)', color: 'var(--text-main)', borderRadius: 'var(--radius-md)', border: '1px solid var(--outline-variant)', fontSize: '14px', cursor: 'pointer' }}
          >
            <option value="all">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
            style={{ padding: '10px 16px', background: 'var(--background)', color: 'var(--text-main)', borderRadius: 'var(--radius-md)', border: '1px solid var(--outline-variant)', fontSize: '14px', cursor: 'pointer' }}
          >
            <option value="all">All Categories</option>
            <option value="Food">Food</option>
            <option value="Utilities">Utilities</option>
            <option value="Entertainment">Entertainment</option>
            <option value="Income">Income</option>
            <option value="Other">Other</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{ padding: '10px 16px', background: 'var(--background)', color: 'var(--text-main)', borderRadius: 'var(--radius-md)', border: '1px solid var(--outline-variant)', fontSize: '14px', cursor: 'pointer' }}
          >
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="amount-desc">Highest Amount</option>
            <option value="amount-asc">Lowest Amount</option>
          </select>
        </div>

        {/* Transactions Table */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Loading transactions...</div>
        ) : currentTransactions.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            backgroundColor: 'var(--surface-container-lowest)',
            borderRadius: 'var(--radius-2xl)',
            color: 'var(--text-muted)',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: '48px', color: 'var(--outline-variant)', marginBottom: '12px' }}>info</span>
            <h3>No Transactions Found</h3>
            <p>Try refining your filters or add a new transaction to get started.</p>
          </div>
        ) : (
          <div style={{ backgroundColor: 'var(--surface-container-lowest)', borderRadius: 'var(--radius-2xl)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
            <table className="transactions-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Category</th>
                  <th className="right">Amount</th>
                  <th style={{ width: '80px', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentTransactions.map((item) => {
                  const shortName = item.description ? item.description.substring(0, 2).toUpperCase() : "TX";
                  return (
                    <tr key={item.id}>
                      <td>{item.date}</td>
                      <td>
                        <div className="merchant">
                          <div className="merchant-logo" style={{
                            backgroundColor: item.type === 'income' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(186, 26, 26, 0.1)',
                            color: item.type === 'income' ? 'var(--success)' : 'var(--error)'
                          }}>
                            {shortName}
                          </div>
                          <span>{item.description}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`tag ${getTagClass(item.category)}`}>
                          {item.category}
                        </span>
                      </td>
                      <td className={`right ${item.type === "income" ? "amount-positive" : "amount-negative"}`}>
                        {item.type === "income" ? "+" : "-"}${Math.abs(item.amount).toFixed(2)}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          onClick={() => handleDeleteTransaction(item.id)}
                          style={{ background: 'transparent', border: 'none', color: 'var(--error)', cursor: 'pointer' }}
                          title="Delete transaction"
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="pagination" style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px 24px',
                borderTop: '1px solid var(--outline-variant)'
              }}>
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--outline-variant)',
                    background: currentPage === 1 ? '#f1f5f9' : 'transparent',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    color: currentPage === 1 ? '#cbd5e1' : 'var(--text-main)'
                  }}
                >
                  Previous
                </button>
                <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                  Page <strong>{currentPage}</strong> of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--outline-variant)',
                    background: currentPage === totalPages ? '#f1f5f9' : 'transparent',
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                    color: currentPage === totalPages ? '#cbd5e1' : 'var(--text-main)'
                  }}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}

        {/* Add Transaction Modal */}
        {showAddForm && (
          <div className="modal-overlay" style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(11, 28, 48, 0.4)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100000
          }}>
            <div className="modal-content" style={{
              backgroundColor: 'var(--surface-container-lowest)',
              padding: '30px',
              borderRadius: 'var(--radius-2xl)',
              width: '100%',
              maxWidth: '450px',
              boxShadow: 'var(--shadow-lg)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-main)' }}>Add New Transaction</h3>
                <button onClick={() => setShowAddForm(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              {formError && <div className="error-box" style={{
                backgroundColor: 'rgba(186, 26, 26, 0.1)',
                border: '1px solid var(--error)',
                color: 'var(--error)',
                padding: '12px',
                borderRadius: 'var(--radius-md)',
                marginBottom: '16px',
                fontSize: '14px',
                textAlign: 'center'
              }}>{formError}</div>}

              <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500, color: 'var(--text-soft)' }}>Description</label>
                  <input
                    type="text"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="e.g. Grocery Store"
                    required
                    style={{ width: '100%', padding: '12px', border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-md)', background: 'var(--background)', color: 'var(--text-main)', boxSizing: 'border-box' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500, color: 'var(--text-soft)' }}>Amount ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      name="amount"
                      value={formData.amount}
                      onChange={handleInputChange}
                      placeholder="0.00"
                      required
                      style={{ width: '100%', padding: '12px', border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-md)', background: 'var(--background)', color: 'var(--text-main)', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500, color: 'var(--text-soft)' }}>Type</label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      style={{ width: '100%', padding: '12px', border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-md)', background: 'var(--background)', color: 'var(--text-main)', boxSizing: 'border-box', height: '45px' }}
                    >
                      <option value="expense">Expense</option>
                      <option value="income">Income</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500, color: 'var(--text-soft)' }}>Category</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      style={{ width: '100%', padding: '12px', border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-md)', background: 'var(--background)', color: 'var(--text-main)', boxSizing: 'border-box', height: '45px' }}
                    >
                      <option value="Food">Food</option>
                      <option value="Utilities">Utilities</option>
                      <option value="Entertainment">Entertainment</option>
                      <option value="Rent">Rent</option>
                      <option value="Technology">Technology</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500, color: 'var(--text-soft)' }}>Date</label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      required
                      style={{ width: '100%', padding: '12px', border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-md)', background: 'var(--background)', color: 'var(--text-main)', boxSizing: 'border-box', height: '45px' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                  <button type="button" onClick={() => setShowAddForm(false)} style={{ flex: 1, padding: '12px', border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-md)', background: 'transparent', color: 'var(--text-main)', cursor: 'pointer' }}>
                    Cancel
                  </button>
                  <button type="submit" style={{ flex: 1, padding: '12px', border: 'none', borderRadius: 'var(--radius-md)', background: 'var(--primary)', color: 'white', fontWeight: 600, cursor: 'pointer' }}>
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Transactions;