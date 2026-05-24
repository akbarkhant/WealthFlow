import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  Award,
  CheckCircle2,
  DollarSign,
  Plus,
  Target,
  Trash2,
  TrendingUp,
  X,
} from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';
import api from '../utils/api';
import '../styles/pages/Savings.css';

const money = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

const defaultGoal = {
  title: '',
  targetAmount: '',
  currentAmount: '0',
  monthlyContribution: '',
  category: 'Savings',
  status: 'On Track',
};

const Savings = () => {
  const [goals, setGoals] = useState([]);
  const [stats, setStats] = useState({});
  const [chartData, setChartData] = useState([]);
  const [featuredGoal, setFeaturedGoal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');

  const [showAddModal, setShowAddModal] = useState(false);
  const [showManageModal, setShowManageModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [contributionAmount, setContributionAmount] = useState('');
  const [newGoalData, setNewGoalData] = useState(defaultGoal);
  const [formError, setFormError] = useState('');

  const showToast = (message, tone = 'success') => {
    setToast({ message, tone });
    window.setTimeout(() => setToast(null), 3000);
  };

  const fetchSavingsData = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await api.get('/savings');
      setGoals(response.goals || []);
      setStats(response.stats || {});
      setChartData(response.chartData || []);
      setFeaturedGoal(response.featuredGoal || null);
    } catch (err) {
      console.error('Failed to fetch savings data', err);
      setError('We could not load savings goals right now.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavingsData();
  }, []);

  const filteredGoals = useMemo(() => {
    if (statusFilter === 'all') return goals;
    if (statusFilter === 'completed') {
      return goals.filter((goal) => {
        const current = Number(goal.currentAmount || goal.current || 0);
        const target = Number(goal.targetAmount || goal.target || 1);
        return goal.status === 'Completed' || current >= target;
      });
    }
    if (statusFilter === 'attention') {
      return goals.filter((goal) => goal.status === 'Needs Attention');
    }
    return goals.filter((goal) => goal.status === 'On Track');
  }, [goals, statusFilter]);

  const handleAddInputChange = (event) => {
    const { name, value } = event.target;
    setNewGoalData((current) => ({ ...current, [name]: value }));
  };

  const resetGoalForm = () => {
    setNewGoalData(defaultGoal);
    setFormError('');
  };

  const handleAddGoalSubmit = async (event) => {
    event.preventDefault();
    setFormError('');

    if (!newGoalData.title.trim()) {
      setFormError('Goal title is required.');
      return;
    }
    if (!Number.isFinite(Number(newGoalData.targetAmount)) || Number(newGoalData.targetAmount) <= 0) {
      setFormError('Target amount must be greater than zero.');
      return;
    }
    if (Number(newGoalData.currentAmount) < 0) {
      setFormError('Current saved cannot be negative.');
      return;
    }

    try {
      await api.post('/savings', {
        title: newGoalData.title.trim(),
        targetAmount: Number(newGoalData.targetAmount),
        currentAmount: Number(newGoalData.currentAmount || 0),
        monthlyContribution: Number(newGoalData.monthlyContribution || 100),
        status: newGoalData.status,
        category: newGoalData.category,
      });

      resetGoalForm();
      setShowAddModal(false);
      await fetchSavingsData();
      showToast('Savings goal created.');
    } catch (err) {
      setFormError('Failed to create savings goal.');
    }
  };

  const openManageModal = (goal) => {
    setSelectedGoal(goal);
    setContributionAmount('');
    setFormError('');
    setShowManageModal(true);
  };

  const handleAddContribution = async (event) => {
    event.preventDefault();
    setFormError('');

    const amount = Number(contributionAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      setFormError('Please enter a valid contribution amount.');
      return;
    }

    try {
      const current = Number(selectedGoal.currentAmount || selectedGoal.current || 0);
      const target = Number(selectedGoal.targetAmount || selectedGoal.target || 0);
      const updatedAmount = current + amount;
      const nextStatus = updatedAmount >= target ? 'Completed' : selectedGoal.status;

      await api.put(`/savings/${selectedGoal._id || selectedGoal.id}`, {
        currentAmount: updatedAmount,
        status: nextStatus,
      });

      setShowManageModal(false);
      await fetchSavingsData();
      showToast('Contribution recorded.');
    } catch (err) {
      setFormError('Failed to record contribution.');
    }
  };

  const handleDeleteGoal = async () => {
    if (!selectedGoal) return;

    try {
      await api.delete(`/savings/${selectedGoal._id || selectedGoal.id}`);
      setShowManageModal(false);
      await fetchSavingsData();
      showToast('Savings goal deleted.');
    } catch (err) {
      showToast('Failed to delete goal.', 'error');
    }
  };

  return (
    <DashboardLayout>
      <section className="page-stack savings-page">
        <div className="page-header">
          <div>
            <p className="page-eyebrow">Goals</p>
            <h1 className="page-title">Savings & Goals</h1>
            <p className="page-subtitle">
              Track milestones, contribute toward targets, and keep long-term progress visible.
            </p>
          </div>
          <button className="btn btn-primary" type="button" onClick={() => setShowAddModal(true)}>
            <Plus size={18} />
            New Goal
          </button>
        </div>

        <div className="savings-stat-grid">
          <article className="savings-stat">
            <span><Target size={20} /></span>
            <div>
              <p>Goals on track</p>
              <strong>{stats.goalsOnTrack || 0} / {stats.totalGoals || 0}</strong>
            </div>
          </article>
          <article className="savings-stat">
            <span><DollarSign size={20} /></span>
            <div>
              <p>Average monthly savings</p>
              <strong>{money.format(stats.averageMonthlySavings || 0)}</strong>
            </div>
          </article>
          <article className="savings-stat">
            <span><Award size={20} /></span>
            <div>
              <p>Milestones met</p>
              <strong>{stats.milestonesMet || 0}</strong>
            </div>
          </article>
        </div>

        <div className="savings-toolbar">
          <div className="segmented-control" aria-label="Goal status filter">
            <button className={statusFilter === 'all' ? 'is-active' : ''} type="button" onClick={() => setStatusFilter('all')}>All</button>
            <button className={statusFilter === 'track' ? 'is-active' : ''} type="button" onClick={() => setStatusFilter('track')}>On Track</button>
            <button className={statusFilter === 'completed' ? 'is-active' : ''} type="button" onClick={() => setStatusFilter('completed')}>Completed</button>
            <button className={statusFilter === 'attention' ? 'is-active' : ''} type="button" onClick={() => setStatusFilter('attention')}>Attention</button>
          </div>
          <button className="btn btn-secondary" type="button" onClick={fetchSavingsData}>
            <TrendingUp size={16} />
            Refresh
          </button>
        </div>

        {loading && (
          <div className="savings-loading-grid">
            {Array.from({ length: 6 }).map((_, index) => (
              <div className="skeleton savings-skeleton-card" key={index} />
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="error-state">
            <AlertCircle />
            <h3>Savings unavailable</h3>
            <p>{error}</p>
            <button className="btn btn-primary" type="button" onClick={fetchSavingsData}>Retry</button>
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="goal-grid">
              {filteredGoals.map((goal) => {
                const target = Number(goal.targetAmount || goal.target || 1);
                const current = Number(goal.currentAmount || goal.current || 0);
                const percentage = Math.min(Math.round((current / target) * 100), 100);
                const isCompleted = goal.status === 'Completed' || current >= target;
                const needsAttention = goal.status === 'Needs Attention';
                const variant = isCompleted ? 'completed' : needsAttention ? 'warning' : 'primary';

                return (
                  <article className="goal-card" key={goal._id || goal.id}>
                    <div className="goal-top">
                      <span className={`goal-icon goal-icon--${variant}`}>
                        <Target size={22} />
                      </span>
                      <span className={`status-pill ${isCompleted ? 'status-success' : needsAttention ? 'status-warning' : 'status-muted'}`}>
                        {isCompleted ? 'Completed' : goal.status || 'On Track'}
                      </span>
                    </div>

                    <div className="goal-body">
                      <h3>{goal.title || goal.name}</h3>
                      <p>Target {money.format(target)}</p>
                    </div>

                    <div className="goal-progress-row">
                      <strong className="amount">{money.format(current)}</strong>
                      <span>{percentage}%</span>
                    </div>

                    <div className="progress-bar">
                      <div className={`progress-fill progress-fill--${variant}`} style={{ width: `${percentage}%` }} />
                    </div>

                    <div className="goal-footer">
                      <div>
                        <span>Monthly contribution</span>
                        <strong>{money.format(goal.monthlyContribution || 100)}</strong>
                      </div>
                      <button className="btn btn-secondary" type="button" onClick={() => openManageModal(goal)}>Manage</button>
                    </div>
                  </article>
                );
              })}

              <button className="new-goal-card" type="button" onClick={() => setShowAddModal(true)}>
                <span><Plus size={24} /></span>
                <strong>Create New Goal</strong>
                <p>Start saving for the next milestone.</p>
              </button>
            </div>

            <div className="savings-content-grid">
              <section className="savings-chart-card surface-card">
                <div className="savings-card-header">
                  <div>
                    <p className="section-kicker">Velocity</p>
                    <h2>Goal Breakdown</h2>
                  </div>
                </div>
                <div className="savings-chart">
                  {chartData.map((item) => {
                    const amountHeight = Math.max(40, Math.min(Math.round((item.amount / 500) * 220), 220));
                    const savedHeight = Math.min(Math.round((item.saved / item.amount) * amountHeight), amountHeight);
                    return (
                      <div className="savings-chart__column" key={item.month}>
                        <div className="savings-chart__bar" style={{ height: `${amountHeight}px` }}>
                          <span style={{ height: `${savedHeight}px` }} />
                        </div>
                        <strong>{item.month}</strong>
                      </div>
                    );
                  })}
                </div>
              </section>

              <section className="savings-insight-card surface-card">
                <p className="section-kicker">Quick Stats</p>
                <div className="insight-row">
                  <span><DollarSign size={18} /></span>
                  <div>
                    <p>Average Monthly Savings</p>
                    <strong>{money.format(stats.averageMonthlySavings || 0)}</strong>
                  </div>
                </div>
                <div className="insight-row">
                  <span><Award size={18} /></span>
                  <div>
                    <p>Milestones Met</p>
                    <strong>{stats.milestonesMet || 0}</strong>
                  </div>
                </div>
              </section>
            </div>

            {featuredGoal && (
              <section className="featured-goal">
                <img src={featuredGoal.image} alt={featuredGoal.title} />
                <div className="featured-overlay">
                  <div>
                    <span>Featured Goal</span>
                    <h2>{featuredGoal.title}</h2>
                    <p>Planning for {featuredGoal.deadline}. {featuredGoal.progress}% funded.</p>
                    <div className="featured-progress">
                      <span style={{ width: `${featuredGoal.progress}%` }} />
                    </div>
                  </div>
                  <button
                    className="btn btn-secondary"
                    type="button"
                    onClick={() => {
                      const matched = goals.find((goal) => goal.title === featuredGoal.title || goal.name === featuredGoal.title);
                      if (matched) openManageModal(matched);
                    }}
                  >
                    Add Contribution
                  </button>
                </div>
              </section>
            )}
          </>
        )}

        {showAddModal && (
          <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="goal-modal-title">
            <div className="modal-panel">
              <div className="modal-header">
                <h2 className="modal-title" id="goal-modal-title">Create Savings Goal</h2>
                <button className="icon-button" type="button" aria-label="Close modal" onClick={() => { setShowAddModal(false); resetGoalForm(); }}>
                  <X />
                </button>
              </div>
              <div className="modal-body">
                {formError && <div className="alert alert-error">{formError}</div>}
                <form className="modal-form" onSubmit={handleAddGoalSubmit}>
                  <div className="field">
                    <label htmlFor="goal-title">Goal title</label>
                    <input className="input" id="goal-title" name="title" type="text" placeholder="Travel to Japan" value={newGoalData.title} onChange={handleAddInputChange} />
                  </div>
                  <div className="form-grid">
                    <div className="field">
                      <label htmlFor="targetAmount">Target amount</label>
                      <input className="input" id="targetAmount" name="targetAmount" type="number" min="0" placeholder="5000" value={newGoalData.targetAmount} onChange={handleAddInputChange} />
                    </div>
                    <div className="field">
                      <label htmlFor="currentAmount">Initial saved</label>
                      <input className="input" id="currentAmount" name="currentAmount" type="number" min="0" placeholder="0" value={newGoalData.currentAmount} onChange={handleAddInputChange} />
                    </div>
                  </div>
                  <div className="form-grid">
                    <div className="field">
                      <label htmlFor="monthlyContribution">Monthly saved</label>
                      <input className="input" id="monthlyContribution" name="monthlyContribution" type="number" min="0" placeholder="250" value={newGoalData.monthlyContribution} onChange={handleAddInputChange} />
                    </div>
                    <div className="field">
                      <label htmlFor="category">Category</label>
                      <select className="select" id="category" name="category" value={newGoalData.category} onChange={handleAddInputChange}>
                        <option value="Savings">General Savings</option>
                        <option value="Emergency Fund">Emergency Fund</option>
                        <option value="Retirement">Retirement</option>
                        <option value="Leisure">Travel & Leisure</option>
                        <option value="Tech">Technology</option>
                      </select>
                    </div>
                  </div>
                  <div className="field">
                    <label htmlFor="status">Status</label>
                    <select className="select" id="status" name="status" value={newGoalData.status} onChange={handleAddInputChange}>
                      <option value="On Track">On Track</option>
                      <option value="Needs Attention">Needs Attention</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                  <div className="modal-actions">
                    <button className="btn btn-secondary" type="button" onClick={() => { setShowAddModal(false); resetGoalForm(); }}>Cancel</button>
                    <button className="btn btn-primary" type="submit">Create Goal</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {showManageModal && selectedGoal && (
          <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="manage-goal-title">
            <div className="modal-panel">
              <div className="modal-header">
                <h2 className="modal-title" id="manage-goal-title">Manage {selectedGoal.title || selectedGoal.name}</h2>
                <button className="icon-button" type="button" aria-label="Close modal" onClick={() => setShowManageModal(false)}>
                  <X />
                </button>
              </div>
              <div className="modal-body">
                {formError && <div className="alert alert-error">{formError}</div>}
                <div className="goal-modal-summary">
                  <div><span>Target</span><strong>{money.format(selectedGoal.targetAmount || selectedGoal.target || 0)}</strong></div>
                  <div><span>Saved</span><strong>{money.format(selectedGoal.currentAmount || selectedGoal.current || 0)}</strong></div>
                </div>
                <form className="modal-form" onSubmit={handleAddContribution}>
                  <div className="field">
                    <label htmlFor="contribution">Add contribution</label>
                    <input className="input" id="contribution" type="number" min="0" step="0.01" placeholder="500" value={contributionAmount} onChange={(event) => setContributionAmount(event.target.value)} />
                  </div>
                  <div className="modal-actions split-actions">
                    <button className="btn btn-danger" type="button" onClick={handleDeleteGoal}>
                      <Trash2 size={16} />
                      Delete Goal
                    </button>
                    <button className="btn btn-primary" type="submit">Add Contribution</button>
                  </div>
                </form>
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

export default Savings;
