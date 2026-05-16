import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const DashboardLayout = ({ children }) => {
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
    { name: 'Transactions', path: '/transactions', icon: 'receipt_long' },
    { name: 'Savings', path: '/savings', icon: 'savings' },
    { name: 'Bills', path: '/bills', icon: 'calendar_month' },
  ];

  return (
    <div className="bg-background text-on-surface font-body-md overflow-x-hidden min-h-screen">
      {/* Left Sidebar Shell */}
      <aside className="w-[280px] h-screen fixed left-0 top-0 bg-surface shadow-[4px_0_20px_0_rgba(0,0,0,0.05)] flex flex-col py-base z-50">
        <div className="px-6 mb-10">
          <h1 className="font-headline-md text-headline-md font-bold text-primary">WealthFlow</h1>
          <p className="font-label-md text-label-md text-secondary">Premium Account</p>
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-r-full active:scale-[0.98] transition-all ${
                  isActive
                    ? 'bg-primary/10 text-primary border-l-2 border-primary'
                    : 'text-secondary hover:bg-surface-container-low'
                }`}
              >
                <span className="material-symbols-outlined">{item.icon}</span>
                <span className="font-body-md text-body-md">{item.name}</span>
              </Link>
            );
          })}
        </nav>
        
        <div className="px-4 mt-auto space-y-2 border-t border-outline-variant pt-4">
          <Link className="flex items-center gap-3 text-secondary px-4 py-3 hover:bg-surface-container-low transition-colors rounded-r-full" to="/settings">
            <span className="material-symbols-outlined">settings</span>
            <span className="font-body-md text-body-md">Settings</span>
          </Link>
          <Link className="flex items-center gap-3 text-secondary px-4 py-3 hover:bg-surface-container-low transition-colors rounded-r-full" to="/support">
            <span className="material-symbols-outlined">help</span>
            <span className="font-body-md text-body-md">Support</span>
          </Link>
          <div className="mt-4 flex items-center gap-3 px-4 py-3 bg-surface-container-low rounded-xl">
            <img alt="User profile photo" className="w-10 h-10 rounded-full object-cover border-2 border-primary-fixed" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAwq3GEKSQxp3v1mbekCqPScfWhDvdl0JU-iC0l2TwK_OTPw7dYorZJyO1NF6aLOUpQDF2pPRKdWgA1IN7JhQNogWnVz19Ws-vcJpOCmPFVJA4awq_vEgmb1-fSz05rYPl06Gpxoc8j1Yi_MVgQC5vo5ASalbrmNXAwQZ6ayau2s4pZ5PNSY3WXbfgVsmrWXbfgVsmrRitaSO88fczVYCmtWmqe29f7eFJNiTXO8gyo0NX_CTkFe47BH2F7mOqiOIzvYtbvAkfxEXNi8u57_QOJD" />
            <div>
              <p className="font-label-md text-label-md font-bold text-on-surface">Alex Thompson</p>
              <p className="text-[10px] text-secondary">Pro Member</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Top Navigation Shell */}
      <header className="h-16 fixed top-0 right-0 left-[280px] z-40 bg-surface/80 backdrop-blur-md flex justify-between items-center px-gutter">
        <div className="flex items-center gap-4 flex-1 max-w-md">
          <div className="relative w-full">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary scale-90">search</span>
            <input className="w-full bg-surface-container-low border-none rounded-full py-2 pl-10 pr-4 text-body-sm focus:ring-2 focus:ring-primary/20" placeholder="Search transactions..." type="text"/>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4">
            <span className="material-symbols-outlined text-secondary cursor-pointer hover:text-primary transition-colors">notifications</span>
            <span className="material-symbols-outlined text-secondary cursor-pointer hover:text-primary transition-colors">dark_mode</span>
          </div>
          <button className="bg-primary text-on-primary px-6 py-2.5 rounded-full font-label-md text-label-md flex items-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all shadow-sm">
            <span className="material-symbols-outlined text-[18px]">add</span>
            Add Transaction
          </button>
        </div>
      </header>

      {/* Main Content Canvas */}
      <main className="ml-[280px] pt-24 min-h-screen px-gutter pb-section-gap">
        {children}
      </main>

      {/* Floating Action Trigger (Mobile mainly) */}
      <button className="fixed bottom-gutter right-gutter w-14 h-14 bg-primary text-on-primary rounded-full shadow-2xl flex items-center justify-center lg:hidden hover:scale-110 active:scale-95 transition-transform z-50">
        <span className="material-symbols-outlined text-[32px]">add</span>
      </button>
    </div>
  );
};

export default DashboardLayout;
