import { Routes, Route } from 'react-router-dom';

import ProtectedRoute from '../components/ProtectedRoute';

import Home from '../pages/Home';
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import VerifyEmail from '../pages/VerifyEmail';
import ResetPassword from '../pages/ResetPassword';
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
import AdminDashboard from '../pages/AdminDashboard';
import Privacy from '../pages/legal/Privacy';
import Terms from '../pages/legal/Terms';
import Security from '../pages/legal/Security';
import Bills from '../pages/Bills';
const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path='/admin-dashboard' element={<AdminDashboard/>}/>
      <Route path="/features/budget-managment" element={<BudgetingPage />} />
      <Route path="/features/security" element={<SecurityPage />} />
      <Route path='/features/analytics' element={<SmartAnalytics />} />
      <Route path="/verify-email" element={< VerifyEmail />} />
      <Route path='/reset-password' element={< ResetPassword/>} />
      <Route path="/legal/privacy" element={<Privacy />} />
      <Route path="/legal/terms" element={<Terms />} />
      <Route path="/legal/security" element={<Security />} />
      <Route path='/bills' element={<Bills />} />

      <Route path="/auth/oauth/callback" element={<OAuthCallback />} />
      <Route path="/session-expired" element={<SessionExpired />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path='/transactions' element={<ProtectedRoute><Transactions/></ProtectedRoute>}/>
      <Route path='/budgets' element={<ProtectedRoute><Budgets /></ProtectedRoute>}/>
      <Route path="/categories" element={<ProtectedRoute><Categories /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
