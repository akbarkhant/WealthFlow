import React from 'react';
import DashboardLayout from '../layouts/DashboardLayout';

const Savings = () => {
  return (
    <DashboardLayout>
      {/* Header Section */}
      <section className="mb-section-gap">
        <div className="flex justify-between items-end mb-card-gap">
          <div>
            <h2 className="font-headline-lg text-headline-lg text-on-surface">Savings & Goals</h2>
            <p className="font-body-md text-secondary">You're on track to reach 3 of your 4 goals this year.</p>
          </div>
          <div className="flex gap-3">
            <button className="bg-surface-container-highest text-primary px-6 py-2.5 rounded-xl font-label-md hover:bg-surface-container-high transition-colors">
              View History
            </button>
          </div>
        </div>

        {/* Bento Grid of Active Goals */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-card-gap">
          {/* Goal Card: Emergency Fund */}
          <div className="glass-card p-6 rounded-[16px] shadow-sm relative overflow-hidden flex flex-col justify-between h-[240px]">
            <div className="absolute -right-4 -top-4 w-32 h-32 bg-primary/5 rounded-full blur-3xl"></div>
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-primary-container/20 p-3 rounded-2xl">
                  <span className="material-symbols-outlined text-primary" style={{fontVariationSettings: "'FILL' 1"}}>shield</span>
                </div>
                <span className="text-label-sm font-label-sm bg-primary/10 text-primary px-2 py-1 rounded-full">On Track</span>
              </div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface mb-1">Emergency Fund</h3>
              <p className="font-label-md text-secondary">Target: $15,000</p>
            </div>
            <div className="relative z-10">
              <div className="flex justify-between items-end mb-2">
                <span className="font-headline-sm text-primary">$12,450</span>
                <span className="font-label-sm text-secondary">83%</span>
              </div>
              <div className="w-full bg-primary/10 h-2 rounded-full overflow-hidden">
                <div className="bg-primary h-full rounded-full" style={{ width: '83%' }}></div>
              </div>
              <div className="flex justify-between mt-4">
                <div className="flex flex-col">
                  <span className="text-label-sm text-secondary uppercase tracking-wider">Monthly</span>
                  <span className="font-body-md font-semibold text-on-surface">+$500</span>
                </div>
                <button className="text-primary font-label-md hover:underline">Manage</button>
              </div>
            </div>
          </div>

          {/* Goal Card: New Car */}
          <div className="glass-card p-6 rounded-[16px] shadow-sm relative overflow-hidden flex flex-col justify-between h-[240px]">
            <div className="absolute -right-4 -top-4 w-32 h-32 bg-tertiary/5 rounded-full blur-3xl"></div>
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-tertiary-container/20 p-3 rounded-2xl">
                  <span className="material-symbols-outlined text-tertiary" style={{fontVariationSettings: "'FILL' 1"}}>directions_car</span>
                </div>
                <span className="text-label-sm font-label-sm bg-tertiary/10 text-tertiary px-2 py-1 rounded-full">Steady</span>
              </div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface mb-1">New SUV 2024</h3>
              <p className="font-label-md text-secondary">Target: $45,000</p>
            </div>
            <div className="relative z-10">
              <div className="flex justify-between items-end mb-2">
                <span className="font-headline-sm text-tertiary">$18,200</span>
                <span className="font-label-sm text-secondary">40%</span>
              </div>
              <div className="w-full bg-tertiary/10 h-2 rounded-full overflow-hidden">
                <div className="bg-tertiary h-full rounded-full" style={{ width: '40%' }}></div>
              </div>
              <div className="flex justify-between mt-4">
                <div className="flex flex-col">
                  <span className="text-label-sm text-secondary uppercase tracking-wider">Monthly</span>
                  <span className="font-body-md font-semibold text-on-surface">+$850</span>
                </div>
                <button className="text-tertiary font-label-md hover:underline">Manage</button>
              </div>
            </div>
          </div>

          {/* Create New Goal Card */}
          <button className="border-2 border-dashed border-outline-variant/50 p-6 rounded-[16px] flex flex-col items-center justify-center gap-4 hover:border-primary/50 hover:bg-surface-container-low transition-all group h-[240px]">
            <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center group-hover:bg-primary-container/20 transition-colors">
              <span className="material-symbols-outlined text-secondary group-hover:text-primary text-[32px]">add_circle</span>
            </div>
            <div className="text-center">
              <h3 className="font-headline-sm text-headline-sm text-on-surface">Create New Goal</h3>
              <p className="font-body-sm text-secondary mt-1">Start saving for your next milestone</p>
            </div>
          </button>
        </div>
      </section>

      {/* Goal Breakdown & Visuals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-card-gap items-start">
        {/* Monthly Contributions History Chart Area */}
        <div className="lg:col-span-2 glass-card p-gutter rounded-[24px] shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="font-headline-md text-headline-md text-on-surface">Goal Breakdown</h3>
              <p className="font-body-sm text-secondary">Savings velocity over the last 6 months</p>
            </div>
            <div className="flex gap-2">
              <select className="bg-surface-container-low border-none rounded-lg text-label-md py-2 px-4 focus:ring-1 focus:ring-primary">
                <option>All Goals</option>
                <option>Emergency Fund</option>
                <option>New Car</option>
              </select>
            </div>
          </div>
          <div className="h-[300px] w-full relative flex items-end justify-between px-4 pb-8">
            {/* Simple CSS Visualizer for Chart */}
            {[
              { month: 'Jan', height: '120px', fill: '80px' },
              { month: 'Feb', height: '140px', fill: '100px' },
              { month: 'Mar', height: '160px', fill: '130px' },
              { month: 'Apr', height: '150px', fill: '110px' },
              { month: 'May', height: '190px', fill: '160px' },
              { month: 'Jun', height: '210px', fill: '190px' }
            ].map((data, index) => (
              <div key={index} className="flex flex-col items-center gap-2 group w-full">
                <div className={`w-12 bg-primary/20 rounded-t-lg relative transition-all hover:bg-primary/40`} style={{ height: data.height }}>
                  <div className="absolute bottom-0 w-full bg-primary rounded-t-lg" style={{ height: data.fill }}></div>
                </div>
                <span className="text-label-sm text-secondary">{data.month}</span>
              </div>
            ))}
            
            {/* Chart Legend/Y-Axis subtle indicators */}
            <div className="absolute left-0 top-0 bottom-8 border-l border-outline-variant/30 flex flex-col justify-between text-[10px] text-secondary pl-2">
              <span>$5,000</span>
              <span>$2,500</span>
              <span>$0</span>
            </div>
          </div>
        </div>

        {/* Insight Sidebar */}
        <div className="flex flex-col gap-card-gap">
          <div className="bg-on-secondary-fixed text-on-secondary rounded-[24px] p-6 shadow-xl relative overflow-hidden">
            <img alt="Insight background" className="absolute inset-0 w-full h-full object-cover opacity-20" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC8OrZHeRX_MYS4Ia2umjSz4u3dFC6EeAVaf2a6PP4S_BTCGz_fHGmM9mPshM_YB3ZaoqMEpmb1_q0DPgJxZoLP7wRrmkduj1mSG9chLz5m9xyX49Z7gZrlNjAmUnDxP-sMOdcmYOw9Z_o7V8Ehvupx1bmhEBMin1B6Frpc4Y3XsoNrjdCpFuYfLsqCu66QPuWP1O4B6sSCHJKmfEuv0wZzfgqfFDVUH_hC091uSxhisnDMJHbxSljdsy5RPzUzD8bOkXzXDFlXkFWK" />
            <div className="relative z-10">
              <span className="inline-block bg-primary px-3 py-1 rounded-full text-label-sm font-label-sm mb-4">Smart Suggestion</span>
              <h4 className="font-headline-sm text-headline-sm mb-2">Boost your Interest</h4>
              <p className="font-body-sm text-surface-dim mb-6">Moving your Emergency Fund to a WealthFlow High-Yield account could earn you an extra $42.50 this month.</p>
              <button className="w-full bg-surface-bright text-on-secondary-fixed py-3 rounded-xl font-label-md active:scale-95 transition-transform">Compare Accounts</button>
            </div>
          </div>
          
          {/* Small Stat Tiles */}
          <div className="glass-card p-6 rounded-[24px] border border-outline-variant/30">
            <h4 className="font-label-sm text-secondary uppercase tracking-widest mb-4">Quick Stats</h4>
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-[18px]">trending_up</span>
                  </div>
                  <span className="font-body-sm text-on-surface">Avg. Monthly Sav.</span>
                </div>
                <span className="font-body-md font-semibold">$2,140</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-tertiary/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-tertiary text-[18px]">workspace_premium</span>
                  </div>
                  <span className="font-body-sm text-on-surface">Milestones Met</span>
                </div>
                <span className="font-body-md font-semibold">12</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Featured/Upcoming Goal - Visual Hero */}
      <section className="mt-section-gap">
        <div className="w-full h-64 rounded-[32px] overflow-hidden relative group cursor-pointer shadow-lg">
          <img alt="Tropical bungalow" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAQWFLqnSQClopcOtyYJ0odf-afPQZ3gdqZqazw_W2XCvsM8H7tbO_ft41VHdHucTCzij87O2SVnggBw-bV80sHQqHTGRWizpDJhYBANJu_BCOOAdB_zmLaNhgoPxlrpI5AWxIajStHv5JJ0xpGWHwGCzkNeeExwFzLRQDsOKggmTpn9HwyEtdemM-mneQb8iU6vb6sy3PC4F2coPufTo-pECBOIBRrfyJI6kl36wtBFupUhL6D-STRKstyYCQWuuSL73c0ubeu8GQ0" />
          <div className="absolute inset-0 bg-gradient-to-t from-on-surface/80 via-on-surface/40 to-transparent flex flex-col justify-end p-gutter">
            <div className="flex justify-between items-end">
              <div className="max-w-md">
                <h2 className="font-headline-lg text-headline-lg text-white mb-2">Summer in Maldives</h2>
                <p className="text-surface-dim font-body-md mb-4">Planning for August 2024 • 15% Funded</p>
                <div className="w-72 bg-white/20 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-primary-fixed-dim h-full" style={{ width: '15%' }}></div>
                </div>
              </div>
              <button className="bg-white text-on-surface-variant px-8 py-3 rounded-full font-label-md shadow-xl hover:bg-primary-fixed hover:text-on-primary-fixed transition-all">Add Contribution</button>
            </div>
          </div>
        </div>
      </section>
    </DashboardLayout>
  );
};

export default Savings;
