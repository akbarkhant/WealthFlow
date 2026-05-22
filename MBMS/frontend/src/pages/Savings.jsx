import React, { useEffect, useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { Target, TrendingUp, Award, DollarSign, Calendar, Plus, Trash2 } from 'lucide-react';
import api from '../utils/api';
import '../styles/pages/Savings.css';

const Savings = () => {
  const [goals, setGoals] = useState([]);
  const [stats, setStats] = useState({});
  const [chartData, setChartData] = useState([]);
  const [featuredGoal, setFeaturedGoal] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showManageModal, setShowManageModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [contributionAmount, setContributionAmount] = useState('');
  
  // Add Goal form state
  const [newGoalData, setNewGoalData] = useState({
    title: '',
    targetAmount: '',
    currentAmount: '0',
    monthlyContribution: '',
    category: 'Savings',
    status: 'On Track'
  });
  const [formError, setFormError] = useState('');

  const fetchSavingsData = async () => {
    try {
      const response = await api.get('/savings');
      setGoals(response.goals || []);
      setStats(response.stats || {});
      setChartData(response.chartData || []);
      setFeaturedGoal(response.featuredGoal || null);
    } catch (error) {
      console.error('Failed to fetch savings data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavingsData();
  }, []);

  // --- Add Goal Handler ---
  const handleAddInputChange = (e) => {
    setNewGoalData({
      ...newGoalData,
      [e.target.name]: e.target.value
    });
  };

  const handleAddGoalSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!newGoalData.title.trim()) {
      setFormError('Goal title is required');
      return;
    }
    if (!newGoalData.targetAmount || parseFloat(newGoalData.targetAmount) <= 0) {
      setFormError('Target amount must be greater than zero');
      return;
    }
    if (parseFloat(newGoalData.currentAmount) < 0) {
      setFormError('Current saved cannot be negative');
      return;
    }

    try {
      await api.post('/savings', {
        title: newGoalData.title,
        targetAmount: parseFloat(newGoalData.targetAmount),
        currentAmount: parseFloat(newGoalData.currentAmount || 0),
        monthlyContribution: parseFloat(newGoalData.monthlyContribution || 100),
        status: newGoalData.status,
        category: newGoalData.category
      });
      
      // Reset
      setNewGoalData({
        title: '',
        targetAmount: '',
        currentAmount: '0',
        monthlyContribution: '',
        category: 'Savings',
        status: 'On Track'
      });
      setShowAddModal(false);
      fetchSavingsData();
    } catch (err) {
      setFormError('Failed to create savings goal');
    }
  };

  // --- Manage Goal / Contributions Handler ---
  const openManageModal = (goal) => {
    setSelectedGoal(goal);
    setContributionAmount('');
    setFormError('');
    setShowManageModal(true);
  };

  const handleAddContribution = async (e) => {
    e.preventDefault();
    setFormError('');

    const amt = parseFloat(contributionAmount);
    if (!contributionAmount || isNaN(amt) || amt <= 0) {
      setFormError('Please enter a valid amount greater than zero');
      return;
    }

    try {
      const updatedAmount = (selectedGoal.currentAmount || 0) + amt;
      const nextStatus = updatedAmount >= selectedGoal.targetAmount ? 'Completed' : selectedGoal.status;
      
      await api.put(`/savings/${selectedGoal._id || selectedGoal.id}`, {
        currentAmount: updatedAmount,
        status: nextStatus
      });

      setShowManageModal(false);
      fetchSavingsData();
    } catch (err) {
      setFormError('Failed to record contribution');
    }
  };

  const handleDeleteGoal = async (id) => {
    if (window.confirm('Are you sure you want to delete this savings goal?')) {
      try {
        await api.delete(`/savings/${id}`);
        setShowManageModal(false);
        fetchSavingsData();
      } catch (err) {
        console.error('Failed to delete goal:', err);
      }
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px', fontSize: '18px', fontWeight: 600, color: 'var(--text-muted)' }}>
          Loading savings goals...
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <section className="savings-header">
        <div>
          <h2>Savings & Goals</h2>
          <p style={{ color: 'var(--text-muted)' }}>
            You're on track to reach {stats.goalsOnTrack || 0} of{' '}
            {stats.totalGoals || 0} goals this year.
          </p>
        </div>
        <button className="history-btn" style={{ border: '1px solid var(--outline-variant)', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <TrendingUp size={16} />
          View History
        </button>
      </section>

      {/* Grid of Goal Cards */}
      <div className="goal-grid">
        {goals.map((goal) => {
          const target = parseFloat(goal.targetAmount || goal.target || 1);
          const current = parseFloat(goal.currentAmount || goal.current || 0);
          const percentage = Math.min(Math.round((current / target) * 100), 100);
          const isCompleted = goal.status === 'Completed' || current >= target;

          const variant = goal.category === 'Emergency Fund' || goal.category === 'Savings' ? 'primary' : 'tertiary';

          return (
            <div className="goal-card" key={goal._id || goal.id}>
              <div className="goal-top">
                <div className={`goal-icon ${variant}`}>
                  <Target size={24} />
                </div>
                <span className={`goal-status ${variant}`}>
                  {isCompleted ? 'Completed' : goal.status || 'On Track'}
                </span>
              </div>

              <div className="goal-content" style={{ marginTop: '16px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-main)' }}>{goal.title || goal.name}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>
                  Target: ${target.toLocaleString()}
                </p>
              </div>

              <div className="goal-progress-text" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', fontSize: '14px', fontWeight: 600 }}>
                <span className={`goal-amount ${variant}`}>
                  ${current.toLocaleString()}
                </span>
                <span style={{ color: 'var(--text-muted)' }}>{percentage}%</span>
              </div>

              <div className="progress-bar" style={{ marginTop: '8px' }}>
                <div
                  className={`progress-fill ${variant}`}
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>

              <div className="goal-footer" style={{ marginTop: '20px', borderTop: '1px solid var(--outline-variant)', paddingTop: '16px' }}>
                <div>
                  <small style={{ color: 'var(--text-muted)', fontSize: '11px' }}>Monthly Contribution</small>
                  <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-main)', marginTop: '2px' }}>
                    +${(goal.monthlyContribution || 100).toLocaleString()}
                  </h4>
                </div>

                <button 
                  onClick={() => openManageModal(goal)}
                  style={{ 
                    border: 'none', 
                    background: 'transparent', 
                    color: 'var(--primary)', 
                    fontWeight: 700, 
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Manage
                </button>
              </div>
            </div>
          );
        })}

        <button className="new-goal-card" onClick={() => setShowAddModal(true)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div className="new-goal-icon">
            <span>+</span>
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--primary)', marginTop: '8px' }}>Create New Goal</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px', textAlign: 'center' }}>Start saving for your next milestone</p>
        </button>
      </div>

      {/* Chart Section - Layout aligned with CSS */}
      <div className="savings-content">
        <div className="chart-card">
          <div className="chart-header">
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-main)' }}>Goal Breakdown</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '2px' }}>Savings velocity over the last 6 months</p>
            </div>
          </div>

          <div className="chart-area" style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end', height: '240px', marginTop: '20px' }}>
            {chartData.map((item, index) => {
              // Calculate relative heights for chart columns
              const amountHeight = Math.min(Math.round((item.amount / 500) * 200), 200);
              const savedHeight = Math.min(Math.round((item.saved / item.amount) * amountHeight), amountHeight);

              return (
                <div className="chart-column" key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <div className="chart-bar-bg" style={{ height: `${amountHeight}px`, width: '40px', position: 'relative', background: 'rgba(0, 108, 73, 0.08)', borderRadius: '6px' }}>
                    <div
                      className="chart-bar-fill"
                      style={{ height: `${savedHeight}px`, width: '100%', position: 'absolute', bottom: 0, background: 'var(--primary)', borderRadius: '6px' }}
                    ></div>
                  </div>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>{item.month}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="sidebar">
          <div className="stats-card">
            <h4 style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.05em', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '20px' }}>Quick Stats</h4>

            <div className="stat-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div className="stat-left" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div className="stat-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(0, 108, 73, 0.08)', color: 'var(--primary)' }}>
                  <DollarSign size={18} />
                </div>
                <span style={{ fontSize: '14px', color: 'var(--text-soft)', fontWeight: 500 }}>Avg. Monthly Savings</span>
              </div>
              <strong style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)' }}>
                ${(stats.averageMonthlySavings || 0).toLocaleString()}
              </strong>
            </div>

            <div className="stat-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="stat-left" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div className="stat-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(0, 90, 194, 0.08)', color: 'var(--tertiary)' }}>
                  <Award size={18} />
                </div>
                <span style={{ fontSize: '14px', color: 'var(--text-soft)', fontWeight: 500 }}>Milestones Met</span>
              </div>
              <strong style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)' }}>
                {stats.milestonesMet || 0}
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Goal section */}
      {featuredGoal && (
        <section className="featured-goal" style={{ marginTop: '20px' }}>
          <img
            src={featuredGoal.image}
            alt={featuredGoal.title}
            style={{ width: '100%', height: '320px', objectFit: 'cover' }}
          />

          <div className="featured-overlay">
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'white' }}>{featuredGoal.title}</h2>

              <p style={{ opacity: 0.85, fontSize: '14px', marginTop: '4px' }}>
                Planning for {featuredGoal.deadline} • {featuredGoal.progress}% Funded
              </p>

              <div className="featured-progress" style={{ width: '300px', height: '8px', background: 'rgba(255,255,255,0.25)', borderRadius: '999px', overflow: 'hidden', marginTop: '12px' }}>
                <div
                  className="featured-fill"
                  style={{ width: `${featuredGoal.progress}%`, height: '100%', background: 'var(--primary-light)' }}
                ></div>
              </div>
            </div>

            <button 
              onClick={() => {
                // Find matching goal in list
                const matched = goals.find(g => (g.title === featuredGoal.title || g.name === featuredGoal.title));
                if (matched) {
                  openManageModal(matched);
                } else {
                  // Fallback: manage first goal
                  if (goals.length > 0) openManageModal(goals[0]);
                }
              }}
              style={{ padding: '12px 24px', borderRadius: '999px', background: 'white', color: 'var(--text-main)', border: 'none', fontWeight: 700, cursor: 'pointer' }}
            >
              Add Contribution
            </button>
          </div>
        </section>
      )}

      {/* --- Add Goal Modal --- */}
      {showAddModal && (
        <div className="modal-overlay" style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(11, 28, 48, 0.4)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100000
        }}>
          <div className="modal-content" style={{
            backgroundColor: 'var(--surface-container-lowest)', padding: '30px',
            borderRadius: 'var(--radius-xl)', width: '100%', maxWidth: '450px',
            boxShadow: 'var(--shadow-lg)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-main)' }}>Create Savings Goal</h3>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '16px', fontWeight: 'bold' }}>✕</button>
            </div>

            {formError && (
              <div className="error-box" style={{
                backgroundColor: 'rgba(186, 26, 26, 0.1)', border: '1px solid var(--error)',
                color: 'var(--error)', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px', textAlign: 'center'
              }}>
                {formError}
              </div>
            )}

            <form onSubmit={handleAddGoalSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500, color: 'var(--text-soft)' }}>Goal Title</label>
                <input
                  type="text"
                  name="title"
                  value={newGoalData.title}
                  onChange={handleAddInputChange}
                  placeholder="e.g. Travel to Japan"
                  required
                  style={{ width: '100%', padding: '12px', border: '1px solid var(--outline-variant)', borderRadius: '8px', background: 'var(--background)', color: 'var(--text-main)', boxSizing: 'border-box', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500, color: 'var(--text-soft)' }}>Target Amount ($)</label>
                  <input
                    type="number"
                    name="targetAmount"
                    value={newGoalData.targetAmount}
                    onChange={handleAddInputChange}
                    placeholder="5000"
                    required
                    style={{ width: '100%', padding: '12px', border: '1px solid var(--outline-variant)', borderRadius: '8px', background: 'var(--background)', color: 'var(--text-main)', boxSizing: 'border-box', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500, color: 'var(--text-soft)' }}>Initial Saved ($)</label>
                  <input
                    type="number"
                    name="currentAmount"
                    value={newGoalData.currentAmount}
                    onChange={handleAddInputChange}
                    placeholder="0"
                    style={{ width: '100%', padding: '12px', border: '1px solid var(--outline-variant)', borderRadius: '8px', background: 'var(--background)', color: 'var(--text-main)', boxSizing: 'border-box', outline: 'none' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500, color: 'var(--text-soft)' }}>Monthly Saved ($)</label>
                  <input
                    type="number"
                    name="monthlyContribution"
                    value={newGoalData.monthlyContribution}
                    onChange={handleAddInputChange}
                    placeholder="250"
                    required
                    style={{ width: '100%', padding: '12px', border: '1px solid var(--outline-variant)', borderRadius: '8px', background: 'var(--background)', color: 'var(--text-main)', boxSizing: 'border-box', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500, color: 'var(--text-soft)' }}>Category</label>
                  <select
                    name="category"
                    value={newGoalData.category}
                    onChange={handleAddInputChange}
                    style={{ width: '100%', padding: '12px', border: '1px solid var(--outline-variant)', borderRadius: '8px', background: 'var(--background)', color: 'var(--text-main)', boxSizing: 'border-box', height: '43px', outline: 'none', cursor: 'pointer' }}
                  >
                    <option value="Savings">General Savings</option>
                    <option value="Emergency Fund">Emergency Fund</option>
                    <option value="Retirement">Retirement</option>
                    <option value="Leisure">Travel & Leisure</option>
                    <option value="Tech">Technology</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500, color: 'var(--text-soft)' }}>Status</label>
                <select
                  name="status"
                  value={newGoalData.status}
                  onChange={handleAddInputChange}
                  style={{ width: '100%', padding: '12px', border: '1px solid var(--outline-variant)', borderRadius: '8px', background: 'var(--background)', color: 'var(--text-main)', boxSizing: 'border-box', height: '43px', outline: 'none', cursor: 'pointer' }}
                >
                  <option value="On Track">On Track</option>
                  <option value="Needs Attention">Needs Attention</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowAddModal(false)} style={{ flex: 1, padding: '12px', border: '1px solid var(--outline-variant)', borderRadius: '8px', background: 'transparent', color: 'var(--text-main)', cursor: 'pointer', fontSize: '14px' }}>
                  Cancel
                </button>
                <button type="submit" style={{ flex: 1, padding: '12px', border: 'none', borderRadius: '8px', background: 'var(--primary)', color: 'white', fontWeight: 600, cursor: 'pointer', fontSize: '14px' }}>
                  Create Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- Manage Goal Modal --- */}
      {showManageModal && selectedGoal && (
        <div className="modal-overlay" style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(11, 28, 48, 0.4)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100000
        }}>
          <div className="modal-content" style={{
            backgroundColor: 'var(--surface-container-lowest)', padding: '30px',
            borderRadius: 'var(--radius-xl)', width: '100%', maxWidth: '450px',
            boxShadow: 'var(--shadow-lg)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-main)' }}>Manage: {selectedGoal.title || selectedGoal.name}</h3>
              <button onClick={() => setShowManageModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '16px', fontWeight: 'bold' }}>✕</button>
            </div>

            {formError && (
              <div className="error-box" style={{
                backgroundColor: 'rgba(186, 26, 26, 0.1)', border: '1px solid var(--error)',
                color: 'var(--error)', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px', textAlign: 'center'
              }}>
                {formError}
              </div>
            )}

            <div style={{ marginBottom: '20px', padding: '16px', borderRadius: '8px', background: 'var(--surface-container-low)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '6px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Target:</span>
                <strong style={{ color: 'var(--text-main)' }}>${(selectedGoal.targetAmount || selectedGoal.target || 0).toLocaleString()}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Currently Saved:</span>
                <strong style={{ color: 'var(--text-main)' }}>${(selectedGoal.currentAmount || selectedGoal.current || 0).toLocaleString()}</strong>
              </div>
            </div>

            <form onSubmit={handleAddContribution} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500, color: 'var(--text-soft)' }}>Add Contribution ($)</label>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <input
                    type="number"
                    value={contributionAmount}
                    onChange={(e) => setContributionAmount(e.target.value)}
                    placeholder="e.g. 500"
                    required
                    style={{ flex: 1, padding: '12px', border: '1px solid var(--outline-variant)', borderRadius: '8px', background: 'var(--background)', color: 'var(--text-main)', outline: 'none' }}
                  />
                  <button type="submit" style={{ padding: '12px 24px', border: 'none', borderRadius: '8px', background: 'var(--primary)', color: 'white', fontWeight: 600, cursor: 'pointer' }}>
                    Add
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '20px', borderTop: '1px solid var(--outline-variant)', paddingTop: '20px' }}>
                <button
                  type="button"
                  onClick={() => handleDeleteGoal(selectedGoal._id || selectedGoal.id)}
                  style={{
                    flex: 1, padding: '12px', border: '1px solid var(--error)', borderRadius: '8px',
                    background: 'transparent', color: 'var(--error)', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '14px'
                  }}
                >
                  <Trash2 size={16} />
                  Delete Goal
                </button>
                <button
                  type="button"
                  onClick={() => setShowManageModal(false)}
                  style={{
                    flex: 1, padding: '12px', border: '1px solid var(--outline-variant)', borderRadius: '8px',
                    background: 'transparent', color: 'var(--text-main)', cursor: 'pointer', fontSize: '14px'
                  }}
                >
                  Close
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Savings;