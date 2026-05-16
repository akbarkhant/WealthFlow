import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';
import SecurityVerification from './pages/SecurityVerification';
import SessionExpired from './pages/SessionExpired';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Savings from './pages/Savings';
import Bills from './pages/Bills';
import PlaceholderPage from './pages/PlaceholderPage';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import NotFound from './pages/NotFound';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/security-verification" element={<SecurityVerification />} />
      <Route path="/session-expired" element={<SessionExpired />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/transactions" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
      <Route path="/savings" element={<ProtectedRoute><Savings /></ProtectedRoute>} />
      <Route path="/bills" element={<ProtectedRoute><Bills /></ProtectedRoute>} />
      
      {/* Public Pages */}
      <Route path="/features" element={<PlaceholderPage title="Features" description="Explore the powerful tools WealthFlow offers to manage your finances." />} />
      <Route path="/solutions" element={<PlaceholderPage title="Solutions" description="Tailored financial solutions for individuals and businesses." />} />
      <Route path="/pricing" element={<PlaceholderPage title="Pricing" description="Transparent pricing plans designed to scale with your wealth." />} />
      <Route path="/about" element={<PlaceholderPage title="About Us" description="Learn about the team and mission behind WealthFlow." />} />
      <Route path="/contact" element={<PlaceholderPage title="Contact Us" description="Get in touch with our team." />} />
      <Route path="/privacy" element={<PlaceholderPage title="Privacy Policy" description="We take your data privacy seriously." />} />
      <Route path="/terms" element={<PlaceholderPage title="Terms of Service" description="Please read our terms of service carefully." />} />
      <Route path="/security" element={<PlaceholderPage title="Security" description="Learn how we keep your financial data bank-grade secure." />} />
      <Route path="/cookie-settings" element={<PlaceholderPage title="Cookie Settings" description="Manage your cookie preferences." />} />
      <Route path="/support" element={<PlaceholderPage title="Support" description="Get help with your WealthFlow account." />} />
      <Route path="/settings" element={<PlaceholderPage title="Settings" description="Manage your account preferences." />} />

      {/* Admin Pages */}
      <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />

      {/* Catch-all route for 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
