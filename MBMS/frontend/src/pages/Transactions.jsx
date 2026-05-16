import React from 'react';
import DashboardLayout from '../layouts/DashboardLayout';

const Transactions = () => {
  return (
    <DashboardLayout>
      <div className="max-w-[1200px] mx-auto py-8">
        {/* Page Header */}
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="font-headline-lg text-headline-lg text-on-surface mb-1">Transactions & History</h2>
            <p className="font-body-md text-secondary">Keep track of your spending and manage your monthly budgets.</p>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-surface-container rounded-lg font-label-md text-on-surface hover:bg-surface-container-high transition-colors">
              <span className="material-symbols-outlined text-[18px]">file_download</span>
              Export CSV
            </button>
          </div>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-12 gap-card-gap">
          {/* Category Budgets Section (Bento Sidebar) */}
          <section className="col-span-12 lg:col-span-4 space-y-card-gap">
            <div className="glass-card rounded-xl p-6 shadow-sm border-surface-variant">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-headline-sm text-headline-sm text-on-surface">Monthly Budgets</h3>
                <button className="text-primary font-label-md hover:underline">Edit</button>
              </div>
              <div className="space-y-6">
                {/* Budget Item: Food (Warning State) */}
                <div className="space-y-2">
                  <div className="flex justify-between items-end">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">
                        <span className="material-symbols-outlined">restaurant</span>
                      </div>
                      <div>
                        <p className="font-label-md text-on-surface">Dining & Food</p>
                        <p className="text-[11px] text-secondary">75% of $600 used</p>
                      </div>
                    </div>
                    <p className="font-label-md text-on-surface">$450.00</p>
                  </div>
                  <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
                    <div className="h-full bg-orange-500 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                </div>

                {/* Budget Item: Shopping */}
                <div className="space-y-2">
                  <div className="flex justify-between items-end">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                        <span className="material-symbols-outlined">shopping_bag</span>
                      </div>
                      <div>
                        <p className="font-label-md text-on-surface">Shopping</p>
                        <p className="text-[11px] text-secondary">42% of $1,200 used</p>
                      </div>
                    </div>
                    <p className="font-label-md text-on-surface">$504.00</p>
                  </div>
                  <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: '42%' }}></div>
                  </div>
                </div>

                {/* Budget Item: Travel (Danger State) */}
                <div className="space-y-2">
                  <div className="flex justify-between items-end">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-error-container text-error flex items-center justify-center">
                        <span className="material-symbols-outlined">commute</span>
                      </div>
                      <div>
                        <p className="font-label-md text-on-surface">Transport</p>
                        <p className="text-[11px] text-error font-bold">92% of $300 used</p>
                      </div>
                    </div>
                    <p className="font-label-md text-error">$276.00</p>
                  </div>
                  <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
                    <div className="h-full bg-error rounded-full animate-pulse" style={{ width: '92%' }}></div>
                  </div>
                </div>

                {/* Budget Item: Bills */}
                <div className="space-y-2">
                  <div className="flex justify-between items-end">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-tertiary/10 text-tertiary flex items-center justify-center">
                        <span className="material-symbols-outlined">electric_bolt</span>
                      </div>
                      <div>
                        <p className="font-label-md text-on-surface">Utilities</p>
                        <p className="text-[11px] text-secondary">58% of $400 used</p>
                      </div>
                    </div>
                    <p className="font-label-md text-on-surface">$232.00</p>
                  </div>
                  <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
                    <div className="h-full bg-tertiary rounded-full" style={{ width: '58%' }}></div>
                  </div>
                </div>
              </div>

              <button className="w-full mt-8 py-3 border-2 border-dashed border-outline-variant rounded-xl text-secondary font-label-md hover:bg-surface-container-low transition-colors flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-[18px]">add_circle</span>
                New Budget Category
              </button>
            </div>

            {/* Small Stat Card */}
            <div className="bg-primary p-6 rounded-xl text-on-primary shadow-lg overflow-hidden relative">
              <div className="relative z-10">
                <p className="font-label-sm uppercase tracking-widest opacity-80 mb-1">Total Spent this Month</p>
                <h4 className="text-[32px] font-bold leading-none mb-4">$3,429.50</h4>
                <div className="flex items-center gap-2 text-[12px] bg-white/20 w-fit px-2 py-1 rounded-full">
                  <span className="material-symbols-outlined text-[14px]">trending_down</span>
                  12.5% less than last month
                </div>
              </div>
              <div className="absolute -right-4 -bottom-4 opacity-10">
                <span className="material-symbols-outlined text-[120px]">account_balance_wallet</span>
              </div>
            </div>
          </section>

          {/* Transactions Main Area */}
          <section className="col-span-12 lg:col-span-8 space-y-card-gap">
            {/* Filter Bar */}
            <div className="glass-card rounded-xl p-4 flex flex-wrap items-center gap-4 shadow-sm border-surface-variant">
              <div className="flex items-center gap-2 bg-surface-container px-3 py-2 rounded-lg border border-outline-variant/30">
                <span className="material-symbols-outlined text-secondary text-[18px]">calendar_today</span>
                <span className="text-body-sm font-medium">Oct 1 - Oct 31, 2023</span>
                <span className="material-symbols-outlined text-secondary text-[18px] cursor-pointer">expand_more</span>
              </div>
              <div className="flex items-center gap-2 bg-surface-container px-3 py-2 rounded-lg border border-outline-variant/30">
                <span className="material-symbols-outlined text-secondary text-[18px]">filter_list</span>
                <span className="text-body-sm font-medium">All Categories</span>
                <span className="material-symbols-outlined text-secondary text-[18px] cursor-pointer">expand_more</span>
              </div>
              <div className="flex items-center gap-2 bg-surface-container px-3 py-2 rounded-lg border border-outline-variant/30">
                <span className="material-symbols-outlined text-secondary text-[18px]">payments</span>
                <span className="text-body-sm font-medium">Amount: Any</span>
                <span className="material-symbols-outlined text-secondary text-[18px] cursor-pointer">expand_more</span>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <button className="p-2 text-secondary hover:text-primary transition-colors">
                  <span className="material-symbols-outlined">view_list</span>
                </button>
                <button className="p-2 text-secondary/40 hover:text-primary transition-colors">
                  <span className="material-symbols-outlined">grid_view</span>
                </button>
              </div>
            </div>

            {/* Transactions Table */}
            <div className="glass-card rounded-xl shadow-sm border-surface-variant overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low/50">
                    <th className="px-6 py-4 font-label-sm text-secondary uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 font-label-sm text-secondary uppercase tracking-wider">Description</th>
                    <th className="px-6 py-4 font-label-sm text-secondary uppercase tracking-wider">Category</th>
                    <th className="px-6 py-4 font-label-sm text-secondary uppercase tracking-wider text-right">Amount</th>
                    <th className="px-6 py-4 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-variant">
                  {/* Row 1 */}
                  <tr className="hover:bg-surface-container-lowest transition-colors group">
                    <td className="px-6 py-4 text-body-sm text-on-surface">Oct 24, 2023</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center font-bold text-secondary text-[10px]">AP</div>
                        <span className="font-body-md font-medium">Apple Store Subscription</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-tertiary/10 text-tertiary border border-tertiary/20">Digital Services</span>
                    </td>
                    <td className="px-6 py-4 text-right font-body-md font-bold text-on-surface">-$14.99</td>
                    <td className="px-6 py-4">
                      <span className="material-symbols-outlined text-secondary opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">more_vert</span>
                    </td>
                  </tr>

                  {/* Row 2 */}
                  <tr className="hover:bg-surface-container-lowest transition-colors group">
                    <td className="px-6 py-4 text-body-sm text-on-surface">Oct 23, 2023</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center font-bold text-secondary text-[10px]">WF</div>
                        <span className="font-body-md font-medium">Whole Foods Market</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-primary/10 text-primary border border-primary/20">Groceries</span>
                    </td>
                    <td className="px-6 py-4 text-right font-body-md font-bold text-on-surface">-$124.50</td>
                    <td className="px-6 py-4">
                      <span className="material-symbols-outlined text-secondary opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">more_vert</span>
                    </td>
                  </tr>

                  {/* Row 3 */}
                  <tr className="hover:bg-surface-container-lowest transition-colors group">
                    <td className="px-6 py-4 text-body-sm text-on-surface">Oct 22, 2023</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center font-bold text-secondary text-[10px]">SH</div>
                        <span className="font-body-md font-medium">Shell Gas Station</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-orange-100 text-orange-600 border border-orange-200">Transport</span>
                    </td>
                    <td className="px-6 py-4 text-right font-body-md font-bold text-on-surface">-$65.00</td>
                    <td className="px-6 py-4">
                      <span className="material-symbols-outlined text-secondary opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">more_vert</span>
                    </td>
                  </tr>

                  {/* Row 4 (Income) */}
                  <tr className="hover:bg-surface-container-lowest transition-colors group">
                    <td className="px-6 py-4 text-body-sm text-on-surface">Oct 20, 2023</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-[10px]">
                          <span className="material-symbols-outlined text-[16px]">arrow_downward</span>
                        </div>
                        <span className="font-body-md font-medium">Salary Deposit - TechCorp</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-600 border border-emerald-200">Income</span>
                    </td>
                    <td className="px-6 py-4 text-right font-body-md font-bold text-emerald-600">+$4,250.00</td>
                    <td className="px-6 py-4">
                      <span className="material-symbols-outlined text-secondary opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">more_vert</span>
                    </td>
                  </tr>

                  {/* Row 5 */}
                  <tr className="hover:bg-surface-container-lowest transition-colors group">
                    <td className="px-6 py-4 text-body-sm text-on-surface">Oct 19, 2023</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center font-bold text-secondary text-[10px]">NF</div>
                        <span className="font-body-md font-medium">Netflix.com</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-tertiary/10 text-tertiary border border-tertiary/20">Digital Services</span>
                    </td>
                    <td className="px-6 py-4 text-right font-body-md font-bold text-on-surface">-$19.99</td>
                    <td className="px-6 py-4">
                      <span className="material-symbols-outlined text-secondary opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">more_vert</span>
                    </td>
                  </tr>

                  {/* Row 6 */}
                  <tr className="hover:bg-surface-container-lowest transition-colors group">
                    <td className="px-6 py-4 text-body-sm text-on-surface">Oct 18, 2023</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center font-bold text-secondary text-[10px]">SB</div>
                        <span className="font-body-md font-medium">Starbucks Coffee</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-primary/10 text-primary border border-primary/20">Groceries</span>
                    </td>
                    <td className="px-6 py-4 text-right font-body-md font-bold text-on-surface">-$5.75</td>
                    <td className="px-6 py-4">
                      <span className="material-symbols-outlined text-secondary opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">more_vert</span>
                    </td>
                  </tr>

                  {/* Row 7 */}
                  <tr className="hover:bg-surface-container-lowest transition-colors group">
                    <td className="px-6 py-4 text-body-sm text-on-surface">Oct 17, 2023</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center font-bold text-secondary text-[10px]">AM</div>
                        <span className="font-body-md font-medium">Amazon.com Marketplace</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-secondary-container text-on-secondary-container border border-outline-variant">Shopping</span>
                    </td>
                    <td className="px-6 py-4 text-right font-body-md font-bold text-on-surface">-$89.99</td>
                    <td className="px-6 py-4">
                      <span className="material-symbols-outlined text-secondary opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">more_vert</span>
                    </td>
                  </tr>
                </tbody>
              </table>

              <div className="px-6 py-4 bg-surface-container-low/30 border-t border-surface-variant flex items-center justify-between">
                <p className="text-[12px] text-secondary">Showing 7 of 142 transactions</p>
                <div className="flex gap-2">
                  <button className="p-1 hover:bg-surface-container rounded transition-colors disabled:opacity-30" disabled>
                    <span className="material-symbols-outlined">chevron_left</span>
                  </button>
                  <button className="p-1 hover:bg-surface-container rounded transition-colors">
                    <span className="material-symbols-outlined">chevron_right</span>
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Transactions;
