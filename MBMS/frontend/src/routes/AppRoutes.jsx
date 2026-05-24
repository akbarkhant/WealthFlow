import { Routes, Route } from 'react-router-dom';

import ProtectedRoute from '../components/ProtectedRoute';

import Home from '../pages/Home';
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import VerifyEmail from '../pages/VerifyEmail';
import Dashboard from '../pages/Dashboard';
import Transactions from '../pages/Transactions';
import Budgets from '../pages/Budgets';
import Categories from '../pages/Categories';
import Settings from '../pages/Settings';
import SessionExpired from '../pages/SessionExpired';
import OAuthCallback from '../pages/OAuthCallback';
import NotFound from '../pages/NotFound';
import BudgetingPage from '../pages/features/Budgetingpage';
import SecurityPage from '../pages/features/SecurityPage';
import SmartAnalytics from '../pages/features/AnalyticsPage';
const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/features/budget-managment" element={<BudgetingPage />} />
      <Route path="/features/security" element={<SecurityPage />} />
      <Route path='/features/analytics' element={<SmartAnalytics />} />
      <Route path="/verify-email" element={< VerifyEmail />} />
      <Route path="/auth/oauth/callback" element={<OAuthCallback />} />
      <Route path="/session-expired" element={<SessionExpired />} />

      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/categories" element={<ProtectedRoute><Categories /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
