import React, { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import api from '../utils/api';

const Dashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const data = await api.get('/dashboard/metrics');
        setMetrics(data);
      } catch (error) {
        console.error('Failed to load dashboard metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  if (loading || !metrics) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-card-gap mb-8">
        <div className="metric-gradient glass-card p-6 rounded-xl relative overflow-hidden">
          <div className="relative z-10">
            <p className="font-label-md text-label-md text-secondary mb-1">Total Balance</p>
            <h2 className="font-headline-lg text-headline-lg text-on-surface">${metrics.totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h2>
            <div className="mt-4 flex items-center gap-2 text-primary">
              <span className="material-symbols-outlined text-sm">{metrics.totalBalanceChange >= 0 ? 'trending_up' : 'trending_down'}</span>
              <span className="font-label-sm text-label-sm">{metrics.totalBalanceChange > 0 ? '+' : ''}{metrics.totalBalanceChange}% this month</span>
            </div>
          </div>
          <div className="absolute bottom-0 right-0 opacity-10 pointer-events-none">
            <svg fill="none" height="60" viewBox="0 0 120 60" width="120">
              <path d="M0 50C20 45 30 20 50 25C70 30 80 50 100 45C110 42.5 120 30 120 30V60H0V50Z" fill="var(--tw-colors-primary)"></path>
            </svg>
          </div>
        </div>
        
        <div className="metric-gradient glass-card p-6 rounded-xl relative overflow-hidden">
          <div className="relative z-10">
            <p className="font-label-md text-label-md text-secondary mb-1">Monthly Income</p>
            <h2 className="font-headline-lg text-headline-lg text-on-surface">${metrics.monthlyIncome.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h2>
            <div className="mt-4 flex items-center gap-2 text-primary">
              <span className="material-symbols-outlined text-sm">arrow_downward</span>
              <span className="font-label-sm text-label-sm">Next deposit in 4 days</span>
            </div>
          </div>
          <div className="absolute bottom-0 right-0 opacity-10 pointer-events-none">
            <svg fill="none" height="60" viewBox="0 0 120 60" width="120">
              <path d="M0 40C20 45 40 35 60 50C80 65 100 30 120 35V60H0V40Z" fill="var(--tw-colors-primary)"></path>
            </svg>
          </div>
        </div>
        
        <div className="metric-gradient glass-card p-6 rounded-xl relative overflow-hidden">
          <div className="relative z-10">
            <p className="font-label-md text-label-md text-secondary mb-1">Monthly Expenses</p>
            <h2 className="font-headline-lg text-headline-lg text-on-surface">${metrics.monthlyExpenses.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h2>
            <div className="mt-4 flex items-center gap-2 text-error">
              <span className="material-symbols-outlined text-sm">trending_up</span>
              <span className="font-label-sm text-label-sm">{metrics.expensesChange}% more than last month</span>
            </div>
          </div>
          <div className="absolute bottom-0 right-0 opacity-10 pointer-events-none">
            <svg fill="none" height="60" viewBox="0 0 120 60" width="120">
              <path d="M0 30C30 50 60 20 90 45C105 57.5 120 40 120 40V60H0V30Z" fill="#ba1a1a"></path>
            </svg>
          </div>
        </div>
      </div>
      
      {/* Charts Section (Bento Grid) */}
      <div className="grid grid-cols-12 gap-card-gap mb-8">
        {/* Main Income vs Expenses Chart */}
        <div className="col-span-12 lg:col-span-8 glass-card p-8 rounded-xl">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="font-headline-sm text-headline-sm">Financial Performance</h3>
              <p className="font-label-md text-label-md text-secondary">Income vs Expenses (Last 6 Months)</p>
            </div>
            <select className="bg-surface-container-low border-none rounded-lg text-label-md px-4 py-2 focus:ring-primary">
              <option>Last 6 Months</option>
              <option>Year to Date</option>
            </select>
          </div>
          <div className="h-64 flex items-end justify-between gap-4 px-4">
            {/* Simplified Visual Chart Placeholder */}
            {[
              { month: 'Jan', income: '60%', expense: '45%' },
              { month: 'Feb', income: '65%', expense: '50%' },
              { month: 'Mar', income: '55%', expense: '40%' },
              { month: 'Apr', income: '75%', expense: '60%' },
              { month: 'May', income: '80%', expense: '55%' },
              { month: 'Jun', income: '85%', expense: '50%' },
            ].map((data, index) => (
              <div key={index} className="flex flex-col items-center gap-2 w-full">
                <div className="flex gap-1 items-end w-full h-full">
                  <div className="bg-primary/20 rounded-t w-1/2" style={{ height: data.income }}></div>
                  <div className="bg-primary rounded-t w-1/2" style={{ height: data.expense }}></div>
                </div>
                <span className="text-label-sm text-secondary">{data.month}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Spending Pie Chart */}
        <div className="col-span-12 lg:col-span-4 glass-card p-8 rounded-xl">
          <h3 className="font-headline-sm text-headline-sm mb-6">Spending Breakdown</h3>
          <div className="relative w-48 h-48 mx-auto mb-8">
            {/* Simulated Pie Chart with SVG */}
            <svg className="w-full h-full rotate-[-90deg]" viewBox="0 0 100 100">
              <circle cx="50" cy="50" fill="transparent" r="40" stroke="#006c49" strokeDasharray="125 251" strokeWidth="20"></circle>
              <circle cx="50" cy="50" fill="transparent" r="40" stroke="#71a1ff" strokeDasharray="75 251" strokeDashoffset="-125" strokeWidth="20"></circle>
              <circle cx="50" cy="50" fill="transparent" r="40" stroke="#10b981" strokeDasharray="51 251" strokeDashoffset="-200" strokeWidth="20"></circle>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-label-sm text-secondary">Total</span>
              <span className="text-headline-sm font-bold">$8.2k</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary"></div>
                <span className="text-body-sm">Housing & Rent</span>
              </div>
              <span className="text-label-md font-bold">50%</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-tertiary-container"></div>
                <span className="text-body-sm">Food & Dining</span>
              </div>
              <span className="text-label-md font-bold">30%</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary-container"></div>
                <span className="text-body-sm">Entertainment</span>
              </div>
              <span className="text-label-md font-bold">20%</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom Grid: Transactions & Bills */}
      <div className="grid grid-cols-12 gap-card-gap">
        {/* Recent Transactions Table */}
        <div className="col-span-12 lg:col-span-8 glass-card rounded-xl overflow-hidden">
          <div className="p-6 border-b border-outline-variant flex justify-between items-center">
            <h3 className="font-headline-sm text-headline-sm">Recent Transactions</h3>
            <button className="text-primary font-label-md hover:underline">View All</button>
          </div>
          <table className="w-full text-left">
            <thead className="bg-surface-container-low text-label-sm text-on-surface-variant">
              <tr>
                <th className="px-6 py-3 font-bold">Description</th>
                <th className="px-6 py-3 font-bold">Category</th>
                <th className="px-6 py-3 font-bold text-right">Amount</th>
                <th className="px-6 py-3 font-bold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {metrics.recentTransactions && metrics.recentTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-surface-container-lowest transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center text-${tx.iconColor}`}>
                        <span className="material-symbols-outlined">{tx.icon}</span>
                      </div>
                      <div>
                        <p className="font-body-sm font-semibold">{tx.description}</p>
                        <p className="text-[11px] text-secondary">{tx.date}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-body-sm">{tx.category}</td>
                  <td className={`px-6 py-4 text-body-sm font-bold text-right ${tx.amount < 0 ? 'text-error' : 'text-primary'}`}>
                    {tx.amount < 0 ? '-' : '+'}${Math.abs(tx.amount).toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-primary/10 text-primary text-[10px] px-2 py-1 rounded-full font-bold uppercase">{tx.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Upcoming Bills Widget */}
        <div className="col-span-12 lg:col-span-4 glass-card p-6 rounded-xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-headline-sm text-headline-sm">Upcoming Bills</h3>
            <span className="bg-error/10 text-error text-[10px] px-2 py-1 rounded-full font-bold">3 Action Required</span>
          </div>
          <div className="space-y-4">
            <div className="p-4 rounded-xl border border-outline-variant hover:border-primary transition-all cursor-pointer group">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center">
                    <span className="material-symbols-outlined text-tertiary">bolt</span>
                  </div>
                  <div>
                    <p className="font-body-sm font-bold">Electric Utility</p>
                    <p className="text-label-sm text-secondary">Due in 2 days</p>
                  </div>
                </div>
                <p className="font-body-sm font-bold">$124.80</p>
              </div>
              <button className="w-full mt-2 py-2 text-label-md font-bold text-primary bg-primary/5 rounded-lg group-hover:bg-primary group-hover:text-on-primary transition-all">Pay Now</button>
            </div>
            
            <div className="p-4 rounded-xl border border-outline-variant hover:border-primary transition-all cursor-pointer group">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center">
                    <span className="material-symbols-outlined text-secondary">wifi</span>
                  </div>
                  <div>
                    <p className="font-body-sm font-bold">Internet Services</p>
                    <p className="text-label-sm text-secondary">Due in 5 days</p>
                  </div>
                </div>
                <p className="font-body-sm font-bold">$85.00</p>
              </div>
              <button className="w-full mt-2 py-2 text-label-md font-bold text-primary bg-primary/5 rounded-lg group-hover:bg-primary group-hover:text-on-primary transition-all">Pay Now</button>
            </div>
            
            <div className="p-4 rounded-xl border border-outline-variant hover:border-primary transition-all cursor-pointer group">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center">
                    <span className="material-symbols-outlined text-error">health_and_safety</span>
                  </div>
                  <div>
                    <p className="font-body-sm font-bold">Health Insurance</p>
                    <p className="text-label-sm text-secondary">Due in 1 week</p>
                  </div>
                </div>
                <p className="font-body-sm font-bold">$420.00</p>
              </div>
              <button className="w-full mt-2 py-2 text-label-md font-bold text-primary bg-primary/5 rounded-lg group-hover:bg-primary group-hover:text-on-primary transition-all">Pay Now</button>
            </div>
          </div>
          <div className="mt-6 p-4 bg-primary/5 rounded-xl border border-dashed border-primary/30 text-center">
            <p className="text-body-sm text-on-surface-variant italic">"You've saved $120 this month by paying bills on time!"</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
