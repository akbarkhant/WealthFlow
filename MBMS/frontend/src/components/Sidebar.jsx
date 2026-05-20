import React from 'react';
import { Link } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <h2>Finance App</h2>

      <nav>
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/transactions">Transactions</Link>
        <Link to="/savings">Savings</Link>
        <Link to="/bill">Bills</Link>
      </nav>
    </aside>
  );
};

export default Sidebar;