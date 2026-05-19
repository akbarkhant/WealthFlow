import React, { useEffect, useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import api from '../utils/api';
import '../styles/pages/AdminDashboard.css';

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminDashboard = async () => {
      try {
        const response = await api.get('/admin/dashboard');

        setDashboardData(response);
      } catch (error) {
        console.error('Failed to load admin dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminDashboard();
  }, []);

  if (loading || !dashboardData) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-14 h-14 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="admin-dashboard">

        {/* ================= HEADER ================= */}

        <div className="admin-header">
          <div className="admin-header-left">
            <h1>Admin Dashboard</h1>

            <p>
              Monitor platform activity, users, revenue,
              and system performance.
            </p>
          </div>

          <div className="admin-header-right">
            <button className="admin-btn admin-btn-secondary">
              <span className="material-symbols-outlined">
                download
              </span>

              Export
            </button>

            <button className="admin-btn admin-btn-primary">
              <span className="material-symbols-outlined">
                person_add
              </span>

              Add User
            </button>
          </div>
        </div>

        {/* ================= STATS ================= */}

        <div className="admin-stats-grid">

          {/* TOTAL USERS */}

          <div className="admin-stat-card">
            <div className="admin-stat-top">

              <div className="admin-stat-icon bg-primary/10 text-primary">
                <span className="material-symbols-outlined">
                  groups
                </span>
              </div>
            </div>

            <h4>Total Users</h4>

            <h2>
              {dashboardData.totalUsers?.toLocaleString()}
            </h2>

            <div className="admin-stat-change admin-positive">
              <span className="material-symbols-outlined text-[18px]">
                trending_up
              </span>

              {dashboardData.usersGrowth}% this month
            </div>
          </div>

          {/* TRANSACTIONS */}

          <div className="admin-stat-card">
            <div className="admin-stat-top">

              <div className="admin-stat-icon bg-blue-100 text-blue-700">
                <span className="material-symbols-outlined">
                  payments
                </span>
              </div>
            </div>

            <h4>Total Transactions</h4>

            <h2>
              {dashboardData.totalTransactions?.toLocaleString()}
            </h2>

            <div className="admin-stat-change admin-positive">
              <span className="material-symbols-outlined text-[18px]">
                sync_alt
              </span>

              {dashboardData.transactionGrowth}% growth
            </div>
          </div>

          {/* REVENUE */}

          <div className="admin-stat-card">
            <div className="admin-stat-top">

              <div className="admin-stat-icon bg-green-100 text-green-700">
                <span className="material-symbols-outlined">
                  account_balance_wallet
                </span>
              </div>
            </div>

            <h4>Platform Revenue</h4>

            <h2>
              $
              {dashboardData.revenue?.toLocaleString(
                undefined,
                {
                  minimumFractionDigits: 2
                }
              )}
            </h2>

            <div className="admin-stat-change admin-positive">
              <span className="material-symbols-outlined text-[18px]">
                monitoring
              </span>

              Revenue stable
            </div>
          </div>

          {/* ALERTS */}

          <div className="admin-stat-card">
            <div className="admin-stat-top">

              <div className="admin-stat-icon bg-red-100 text-red-700">
                <span className="material-symbols-outlined">
                  warning
                </span>
              </div>
            </div>

            <h4>System Alerts</h4>

            <h2>
              {dashboardData.alertsCount}
            </h2>

            <div className="admin-stat-change admin-negative">
              <span className="material-symbols-outlined text-[18px]">
                error
              </span>

              Requires attention
            </div>
          </div>
        </div>

        {/* ================= MAIN GRID ================= */}

        <div className="admin-main-grid">

          {/* ================= USERS TABLE ================= */}

          <div className="admin-users-card">

            <div className="admin-card-header">
              <h3>Recent Users</h3>

              <button>
                View All
              </button>
            </div>

            <div className="admin-table-wrapper">

              <table className="admin-table">

                <thead>
                  <tr>
                    <th>User</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Joined</th>
                  </tr>
                </thead>

                <tbody>

                  {dashboardData.recentUsers?.map((user) => (
                    <tr key={user.id}>

                      <td>
                        <div className="admin-user">

                          <div className="admin-user-avatar">
                            <span className="material-symbols-outlined">
                              person
                            </span>
                          </div>

                          <div className="admin-user-info">
                            <h4>
                              {user.name}
                            </h4>

                            <p>
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td>
                        {user.role}
                      </td>

                      <td>

                        <span
                          className={`admin-badge ${
                            user.status === 'active'
                              ? 'admin-badge-active'
                              : user.status === 'pending'
                              ? 'admin-badge-pending'
                              : 'admin-badge-blocked'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[14px]">

                            {user.status === 'active'
                              ? 'check_circle'
                              : user.status === 'pending'
                              ? 'schedule'
                              : 'block'}

                          </span>

                          {user.status}
                        </span>

                      </td>

                      <td>
                        {user.joinedAt}
                      </td>

                    </tr>
                  ))}

                </tbody>
              </table>
            </div>
          </div>

          {/* ================= SIDE PANEL ================= */}

          <div className="admin-side-panel">

            {/* RECENT ACTIVITY */}

            <div className="admin-activity-card">

              <h3>Recent Activity</h3>

              <div className="admin-activity-list">

                {dashboardData.activities?.map((activity) => (
                  <div
                    key={activity.id}
                    className="admin-activity-item"
                  >

                    <div className="admin-activity-icon">
                      <span className="material-symbols-outlined">
                        {activity.icon}
                      </span>
                    </div>

                    <div className="admin-activity-text">
                      <h4>
                        {activity.title}
                      </h4>

                      <p>
                        {activity.time}
                      </p>
                    </div>

                  </div>
                ))}

              </div>
            </div>

            {/* SYSTEM STATUS */}

            <div className="admin-system-card">

              <h3>System Status</h3>

              <div className="admin-system-status">

                {dashboardData.systemStatus?.map((service) => (
                  <div
                    key={service.id}
                    className="admin-system-row"
                  >

                    <div className="admin-system-row-left">

                      <div
                        className={`admin-status-dot ${
                          service.status === 'online'
                            ? 'admin-status-online'
                            : service.status === 'warning'
                            ? 'admin-status-warning'
                            : 'admin-status-offline'
                        }`}
                      ></div>

                      <span>
                        {service.name}
                      </span>

                    </div>

                    <strong>
                      {service.label}
                    </strong>

                  </div>
                ))}

              </div>
            </div>

          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;