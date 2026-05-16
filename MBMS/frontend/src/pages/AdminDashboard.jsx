import React from 'react';
import DashboardLayout from '../layouts/DashboardLayout';

const AdminDashboard = () => {
  return (
    <DashboardLayout>
      <div className="flex-grow flex flex-col items-center justify-center py-16">
        <div className="max-w-3xl text-center space-y-6">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-full mb-4">
            <span className="material-symbols-outlined text-[40px] text-primary" style={{fontVariationSettings: "'FILL' 1"}}>admin_panel_settings</span>
          </div>
          <h1 className="font-display-lg-mobile md:font-display-lg text-primary">Admin Dashboard</h1>
          <p className="font-body-lg text-secondary">Manage users, system settings, and monitor transactions.</p>
          <div className="pt-8">
            <div className="glass-card p-8 rounded-2xl border border-outline-variant/30 text-left">
              <h3 className="font-headline-sm text-on-surface mb-4">Under Construction</h3>
              <p className="font-body-md text-on-surface-variant">
                The administrative panel is currently being developed. Stay tuned for advanced system monitoring and user management features.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
