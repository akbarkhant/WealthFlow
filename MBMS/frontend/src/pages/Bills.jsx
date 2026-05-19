import React from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  Home,
  Zap,
  PlayCircle,
  Wifi,
  CheckCircle,
  Clock,
  CreditCard
} from 'lucide-react';
import '../styles/pages/Bills.css';

const Bills = () => {
  return (
    <DashboardLayout>
      <div className="mb-gutter flex justify-between items-end">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface">
            Bill Calendar
          </h2>
          <p className="font-body-md text-body-md text-secondary">
            Manage your upcoming obligations and subscription renewals.
          </p>
        </div>

        <button className="bg-primary text-on-primary px-6 py-3 rounded-full font-label-md flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-sm">
          <Plus size={18} />
          Add Transaction
        </button>
      </div>

      <div className="grid grid-cols-12 gap-card-gap">
        {/* Calendar */}
        <div className="col-span-12 xl:col-span-8">
          <div className="glass-card rounded-xl p-gutter shadow-sm overflow-hidden relative">
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />

            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-4">
                <h3 className="font-headline-sm text-headline-sm text-on-surface">
                  October 2023
                </h3>

                <div className="flex gap-1">
                  <button className="p-1 hover:bg-surface-container rounded-lg">
                    <ChevronLeft size={18} />
                  </button>
                  <button className="p-1 hover:bg-surface-container rounded-lg">
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>

              <div className="flex bg-surface-container-low p-1 rounded-lg border border-outline-variant/30">
                <button className="px-4 py-1.5 font-label-md">Week</button>
                <button className="px-4 py-1.5 font-label-md bg-white text-primary shadow-sm rounded-md">
                  Month
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-px bg-outline-variant/20 rounded-lg overflow-hidden">
              {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => (
                <div key={d} className="bg-surface-container-low py-3 text-center font-label-sm uppercase">
                  {d}
                </div>
              ))}

              {/* Calendar cells (unchanged structure) */}
              <div className="bg-white h-32 p-3 text-secondary/40">25</div>
              <div className="bg-white h-32 p-3 text-secondary/40">26</div>
              <div className="bg-white h-32 p-3 text-secondary/40">27</div>
              <div className="bg-white h-32 p-3 text-secondary/40">28</div>
              <div className="bg-white h-32 p-3 text-secondary/40">29</div>
              <div className="bg-white h-32 p-3 text-secondary/40">30</div>
              <div className="bg-white h-32 p-3">1</div>

              <div className="bg-white h-32 p-3">2</div>

              <div className="bg-white h-32 p-3">
                3
                <div className="mt-2 text-sm text-tertiary">Rent</div>
              </div>

              <div className="bg-white h-32 p-3">4</div>

              <div className="bg-white h-32 p-3">
                5
                <div className="mt-2 text-sm text-primary">Spotify</div>
              </div>

              <div className="bg-white h-32 p-3">6</div>
              <div className="bg-white h-32 p-3">7</div>
              <div className="bg-white h-32 p-3">8</div>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="col-span-12 xl:col-span-4 flex flex-col gap-card-gap">
          
          {/* Summary */}
          <div className="bg-primary text-white rounded-xl p-gutter">
            <h4 className="font-headline-lg mb-4">$3,420.50</h4>

            <div className="flex gap-4">
              <div>
                <p className="text-sm opacity-70">Paid</p>
                <p className="font-bold">$1,200</p>
              </div>
              <div>
                <p className="text-sm opacity-70">Pending</p>
                <p className="font-bold">$2,220</p>
              </div>
            </div>
          </div>

          {/* Bills List */}
          <div className="glass-card rounded-xl flex-1 flex flex-col">
            <div className="p-gutter border-b flex justify-between">
              <h3 className="font-headline-sm">Upcoming Bills</h3>
              <button className="text-primary">View All</button>
            </div>

            <div className="p-4 space-y-4">

              {/* Rent */}
              <div className="flex justify-between">
                <div className="flex gap-3">
                  <Home size={18} />
                  <div>
                    <p className="font-semibold">Apartment Rent</p>
                    <p className="text-sm text-secondary">Due Oct 3</p>
                  </div>
                </div>
                <p>$2100</p>
              </div>

              {/* Electricity */}
              <div className="flex justify-between">
                <div className="flex gap-3">
                  <Zap size={18} />
                  <div>
                    <p className="font-semibold">Electricity</p>
                    <p className="text-sm text-secondary">Due Oct 15</p>
                  </div>
                </div>
                <p>$120</p>
              </div>

              {/* Netflix */}
              <div className="flex justify-between">
                <div className="flex gap-3">
                  <PlayCircle size={18} />
                  <div>
                    <p className="font-semibold">Netflix</p>
                    <p className="text-sm text-error">Overdue</p>
                  </div>
                </div>
                <p>$19</p>
              </div>

              {/* Internet */}
              <div className="flex justify-between">
                <div className="flex gap-3">
                  <Wifi size={18} />
                  <div>
                    <p className="font-semibold">Internet</p>
                    <p className="text-sm text-secondary">Due Oct 22</p>
                  </div>
                </div>
                <p>$80</p>
              </div>

            </div>

            <div className="p-4 border-t">
              <div className="flex gap-3 items-center">
                <CheckCircle size={18} />
                <p className="text-sm">
                  Smart insight: You can save monthly by optimizing subscriptions
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Bills;