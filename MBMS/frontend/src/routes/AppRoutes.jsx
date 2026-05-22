// src/routes/AppRoutes.jsx

import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Protected Route Component
import ProtectedRoute from '../components/ProtectedRoute';

// Pages
import Home from '../pages/Home';
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import Dashboard from '../pages/Dashboard';
import AdminDashboard from '../pages/AdminDashboard';
import Bill from '../pages/Bills';
import Savings from '../pages/Savings';
import Transactions from '../pages/Transactions';
import Settings from '../pages/Settings';
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

      {/* User Routes (Protected) */}
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/bills" element={<ProtectedRoute><Bill /></ProtectedRoute>} />
      <Route path="/savings" element={<ProtectedRoute><Savings /></ProtectedRoute>} />
      <Route path="/transactions" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

      {/* Admin Routes (Protected) */}
      <Route path="/admin-dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />

      {/* Utility Routes */}
      <Route path="/session-expired" element={<SessionExpired />} />
      <Route path="/placeholder" element={<PlaceHolder />} />

      {/* 404 Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;