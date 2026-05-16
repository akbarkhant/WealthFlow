import React from 'react';
import DashboardLayout from '../layouts/DashboardLayout';

const Bills = () => {
  return (
    <DashboardLayout>
      <div className="mb-gutter flex justify-between items-end">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface">Bill Calendar</h2>
          <p className="font-body-md text-body-md text-secondary">Manage your upcoming obligations and subscription renewals.</p>
        </div>
        <button className="bg-primary text-on-primary px-6 py-3 rounded-full font-label-md flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-sm">
          <span className="material-symbols-outlined">add</span>
          Add Transaction
        </button>
      </div>
      
      <div className="grid grid-cols-12 gap-card-gap">
        {/* Calendar View */}
        <div className="col-span-12 xl:col-span-8">
          <div className="glass-card rounded-xl p-gutter shadow-sm overflow-hidden relative">
            {/* Subtle background decoration */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
            
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-4">
                <h3 className="font-headline-sm text-headline-sm text-on-surface">October 2023</h3>
                <div className="flex gap-1">
                  <button className="p-1 hover:bg-surface-container rounded-lg transition-colors">
                    <span className="material-symbols-outlined text-secondary">chevron_left</span>
                  </button>
                  <button className="p-1 hover:bg-surface-container rounded-lg transition-colors">
                    <span className="material-symbols-outlined text-secondary">chevron_right</span>
                  </button>
                </div>
              </div>
              <div className="flex bg-surface-container-low p-1 rounded-lg border border-outline-variant/30">
                <button className="px-4 py-1.5 font-label-md text-on-surface-variant rounded-md">Week</button>
                <button className="px-4 py-1.5 font-label-md bg-white text-primary shadow-sm rounded-md">Month</button>
              </div>
            </div>
            
            <div className="grid grid-cols-7 gap-px bg-outline-variant/20 rounded-lg border border-outline-variant/20 overflow-hidden">
              {/* Days of Week */}
              <div className="bg-surface-container-low py-3 text-center font-label-sm text-secondary uppercase">Mon</div>
              <div className="bg-surface-container-low py-3 text-center font-label-sm text-secondary uppercase">Tue</div>
              <div className="bg-surface-container-low py-3 text-center font-label-sm text-secondary uppercase">Wed</div>
              <div className="bg-surface-container-low py-3 text-center font-label-sm text-secondary uppercase">Thu</div>
              <div className="bg-surface-container-low py-3 text-center font-label-sm text-secondary uppercase">Fri</div>
              <div className="bg-surface-container-low py-3 text-center font-label-sm text-secondary uppercase">Sat</div>
              <div className="bg-surface-container-low py-3 text-center font-label-sm text-secondary uppercase">Sun</div>
              
              {/* Calendar Days Grid */}
              {/* Row 1 */}
              <div className="bg-white h-32 p-3 text-secondary/40 font-body-sm">25</div>
              <div className="bg-white h-32 p-3 text-secondary/40 font-body-sm">26</div>
              <div className="bg-white h-32 p-3 text-secondary/40 font-body-sm">27</div>
              <div className="bg-white h-32 p-3 text-secondary/40 font-body-sm">28</div>
              <div className="bg-white h-32 p-3 text-secondary/40 font-body-sm">29</div>
              <div className="bg-white h-32 p-3 text-secondary/40 font-body-sm">30</div>
              <div className="bg-white h-32 p-3 font-body-sm text-on-surface">1</div>
              
              {/* Row 2 */}
              <div className="bg-white h-32 p-3 font-body-sm text-on-surface">2</div>
              <div className="bg-white h-32 p-3 font-body-sm text-on-surface relative">
                3
                <div className="mt-2 flex flex-col gap-1">
                  <span className="block w-full h-1 bg-tertiary-container rounded-full"></span>
                  <span className="font-label-sm text-tertiary truncate">Rent</span>
                </div>
              </div>
              <div className="bg-white h-32 p-3 font-body-sm text-on-surface">4</div>
              <div className="bg-white h-32 p-3 font-body-sm text-on-surface relative">
                5
                <div className="mt-2 flex flex-col gap-1">
                  <span className="block w-full h-1 bg-primary-container rounded-full"></span>
                  <span className="font-label-sm text-primary truncate">Spotify</span>
                </div>
              </div>
              <div className="bg-white h-32 p-3 font-body-sm text-on-surface">6</div>
              <div className="bg-white h-32 p-3 font-body-sm text-on-surface">7</div>
              <div className="bg-white h-32 p-3 font-body-sm text-on-surface">8</div>
              
              {/* Row 3 */}
              <div className="bg-white h-32 p-3 font-body-sm text-on-surface">9</div>
              <div className="bg-white h-32 p-3 font-body-sm text-on-surface">10</div>
              <div className="bg-white h-32 p-3 font-body-sm text-on-surface border-2 border-primary/20 bg-primary/5 rounded-sm">
                11
                <span className="block mt-1 font-label-sm text-primary font-bold">Today</span>
              </div>
              <div className="bg-white h-32 p-3 font-body-sm text-on-surface">12</div>
              <div className="bg-white h-32 p-3 font-body-sm text-on-surface">13</div>
              <div className="bg-white h-32 p-3 font-body-sm text-on-surface">14</div>
              <div className="bg-white h-32 p-3 font-body-sm text-on-surface relative">
                15
                <div className="mt-2 flex flex-col gap-1">
                  <span className="block w-full h-1 bg-error/30 rounded-full"></span>
                  <span className="font-label-sm text-error truncate">Electricity</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bill List */}
        <div className="col-span-12 xl:col-span-4 flex flex-col gap-card-gap">
          {/* Summary Card */}
          <div className="bg-on-secondary-fixed text-white rounded-xl p-gutter shadow-lg relative overflow-hidden">
            <div className="relative z-10">
              <p className="font-label-md opacity-80 mb-1">Upcoming This Month</p>
              <h4 className="font-headline-lg text-headline-lg mb-6">$3,420.50</h4>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <p className="font-label-sm opacity-60">Paid</p>
                  <p className="font-body-md font-bold">$1,200.00</p>
                </div>
                <div className="flex-1 border-l border-white/20 pl-4">
                  <p className="font-label-sm opacity-60">Pending</p>
                  <p className="font-body-md font-bold">$2,220.50</p>
                </div>
              </div>
            </div>
            {/* Decorative gradient */}
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-primary/20 blur-3xl rounded-full"></div>
          </div>
          
          {/* Active Bills List */}
          <div className="glass-card rounded-xl shadow-sm flex-1 flex flex-col overflow-hidden">
            <div className="p-gutter border-b border-outline-variant/20 flex justify-between items-center">
              <h3 className="font-headline-sm text-headline-sm text-on-surface">Upcoming Bills</h3>
              <button className="text-primary font-label-md hover:underline transition-all">View All</button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {/* Bill Item */}
              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-surface-container transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center text-on-surface-variant group-hover:bg-white transition-colors shadow-sm">
                    <span className="material-symbols-outlined">house</span>
                  </div>
                  <div>
                    <p className="font-body-md font-semibold text-on-surface">Apartment Rent</p>
                    <p className="font-label-sm text-secondary">Due: Oct 3rd</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-body-md font-bold text-on-surface">$2,100.00</p>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                    <span className="material-symbols-outlined text-[12px]">sync</span>
                    Auto-pay
                  </span>
                </div>
              </div>
              
              {/* Bill Item */}
              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-surface-container transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center text-on-surface-variant group-hover:bg-white transition-colors shadow-sm">
                    <span className="material-symbols-outlined">bolt</span>
                  </div>
                  <div>
                    <p className="font-body-md font-semibold text-on-surface">Electricity</p>
                    <p className="font-label-sm text-secondary">Due: Oct 15th</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-body-md font-bold text-on-surface">$120.45</p>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-secondary bg-secondary/10 px-2 py-0.5 rounded-full">
                    <span className="material-symbols-outlined text-[12px]">person</span>
                    Manual
                  </span>
                </div>
              </div>
              
              {/* Bill Item */}
              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-surface-container transition-colors group border-l-4 border-error/50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center text-on-surface-variant group-hover:bg-white transition-colors shadow-sm">
                    <span className="material-symbols-outlined">play_circle</span>
                  </div>
                  <div>
                    <p className="font-body-md font-semibold text-on-surface">Netflix Premium</p>
                    <p className="font-label-sm text-error font-semibold">Overdue 2 days</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-body-md font-bold text-on-surface">$19.99</p>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                    <span className="material-symbols-outlined text-[12px]">sync</span>
                    Auto-pay
                  </span>
                </div>
              </div>
              
              {/* Bill Item */}
              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-surface-container transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center text-on-surface-variant group-hover:bg-white transition-colors shadow-sm">
                    <span className="material-symbols-outlined">wifi</span>
                  </div>
                  <div>
                    <p className="font-body-md font-semibold text-on-surface">Fiber Internet</p>
                    <p className="font-label-sm text-secondary">Due: Oct 22nd</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-body-md font-bold text-on-surface">$80.00</p>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                    <span className="material-symbols-outlined text-[12px]">sync</span>
                    Auto-pay
                  </span>
                </div>
              </div>
            </div>
            
            <div className="p-gutter bg-surface-container-low border-t border-outline-variant/20">
              <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-outline-variant/30">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined">verified</span>
                </div>
                <div>
                  <p className="font-label-sm text-on-surface font-bold">Smart Insights</p>
                  <p className="font-label-md text-secondary leading-tight">You could save $45/mo by switching your internet provider.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Bills;
