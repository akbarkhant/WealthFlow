import React from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import './AppShell.css';

const AppShell = ({ children }) => {
  return (
    <div className="app-shell">
      <Sidebar />

      <div className="app-main">
        <Topbar />

        <div className="app-content">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AppShell;