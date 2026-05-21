// src/routes/AppRoutes.jsx

import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Pages
import Home from '../pages/test/Home';
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import Dashboard from '../pages/Dashboard';
import AdminDashboard from '../pages/AdminDashboard';
import Bill from '../pages/Bills';
import Savings from '../pages/Savings';
import Transactions from '../pages/Transactions';
import ForgotPassword from '../pages/ForgotPassword';
import ResetPassword from '../pages/ResetPassword';
import VerifyEmail from '../pages/VerifyEmail';
import SecurityVerification from '../pages/SecurityVerification';
import SessionExpired from '../pages/SessionExpired';
import PlaceHolder from '../pages/PlaceholderPage';
import NotFound from '../pages/NotFound';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route
        path="/security-verification"
        element={<SecurityVerification />}
      />

      {/* User Routes */}
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/bills" element={<Bill />} />
      <Route path="/savings" element={<Savings />} />
      <Route path="/transactions" element={<Transactions />} />

      {/* Admin Routes */}
      <Route path="/admin-dashboard" element={<AdminDashboard />} />

      {/* Utility Routes */}
      <Route path="/session-expired" element={<SessionExpired />} />
      <Route path="/placeholder" element={<PlaceHolder />} />

      {/* 404 Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;