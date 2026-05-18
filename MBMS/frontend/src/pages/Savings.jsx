import React, { useEffect, useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import api from '../utils/api';
import '../styles/pages/Savings.css'; 


const Savings = () => {
  const [goals, setGoals] = useState([]);
  const [stats, setStats] = useState({});
  const [chartData, setChartData] = useState([]);
  const [featuredGoal, setFeaturedGoal] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSavingsData();
  }, []);

  const fetchSavingsData = async () => {
    try {
      const response = await api.get('/savings');

      setGoals(response.goals || []);
      setStats(response.stats || {});
      setChartData(response.chartData || []);
      setFeaturedGoal(response.featuredGoal || null);
    } catch (error) {
      console.log('Failed to fetch savings data', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="loading-container">
          <h2>Loading savings data...</h2>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <section className="savings-header">
        <div>
          <h2>Savings & Goals</h2>
          <p>
            You're on track to reach {stats.goalsOnTrack || 0} of{' '}
            {stats.totalGoals || 0} goals this year.
          </p>
        </div>

        <button className="history-btn">View History</button>
      </section>

      <div className="goals-grid">
        {goals.map((goal) => {
          const percentage = Math.round(
            (goal.currentAmount / goal.targetAmount) * 100
          );

          return (
            <div className="goal-card" key={goal._id}>
              <div className="goal-top">
                <div>
                  <h3>{goal.title}</h3>
                  <p>
                    Target: ${goal.targetAmount?.toLocaleString()}
                  </p>
                </div>

                <span className="goal-status">{goal.status}</span>
              </div>

              <div className="goal-progress">
                <div className="progress-info">
                  <span>
                    ${goal.currentAmount?.toLocaleString()}
                  </span>
                  <span>{percentage}%</span>
                </div>

                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>

              <div className="goal-footer">
                <div>
                  <small>Monthly</small>
                  <h4>
                    +${goal.monthlyContribution?.toLocaleString()}
                  </h4>
                </div>

                <button>Manage</button>
              </div>
            </div>
          );
        })}

        <button className="new-goal-card">
          <span>+</span>
          <h3>Create New Goal</h3>
          <p>Start saving for your next milestone</p>
        </button>
      </div>

      <div className="chart-section">
        <div className="chart-card">
          <div className="chart-header">
            <div>
              <h3>Goal Breakdown</h3>
              <p>Savings velocity over the last 6 months</p>
            </div>
          </div>

          <div className="chart-container">
            {chartData.map((item, index) => (
              <div className="chart-bar-wrapper" key={index}>
                <div
                  className="chart-bar"
                  style={{ height: `${item.amount}px` }}
                >
                  <div
                    className="chart-fill"
                    style={{ height: `${item.saved}px` }}
                  ></div>
                </div>

                <span>{item.month}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="stats-card">
          <h4>Quick Stats</h4>

          <div className="stat-row">
            <span>Avg. Monthly Savings</span>
            <strong>
              ${stats.averageMonthlySavings || 0}
            </strong>
          </div>

          <div className="stat-row">
            <span>Milestones Met</span>
            <strong>{stats.milestonesMet || 0}</strong>
          </div>
        </div>
      </div>

      {featuredGoal && (
        <section className="featured-goal">
          <img
            src={featuredGoal.image}
            alt={featuredGoal.title}
          />

          <div className="featured-overlay">
            <div>
              <h2>{featuredGoal.title}</h2>

              <p>
                Planning for {featuredGoal.deadline} •{' '}
                {featuredGoal.progress}% Funded
              </p>

              <div className="featured-progress">
                <div
                  className="featured-fill"
                  style={{ width: `${featuredGoal.progress}%` }}
                ></div>
              </div>
            </div>

            <button>Add Contribution</button>
          </div>
        </section>
      )}
    </DashboardLayout>
  );
};

export default Savings;