// src/routes/AppRoutes.jsx
import { Routes, Route, Outlet } from 'react-router-dom';

import ProtectedRoute from '../components/ProtectedRoute';
import { useAuth } from '../context/AuthContext';
import { NotificationProvider } from '../hooks/useNotification'; // Adjust this path if your file is named useNotifications.jsx

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
import AI from '../pages/AI_Page'; 
import Reports from '../pages/Reports';
import About from '../pages/About';
import ContactUs from '../pages/Contact_Us';
import  HistoryPage from '../pages/HistoryPage';
import GoalsPage from '../pages/GoalsPage';

// ── Authenticated Notification Wrapper ───────────────────────────
// This injects the logged-in user's ID cleanly into the provider
const AuthenticatedNotificationWrapper = () => {
  const { user } = useAuth();
  
  return (
    <NotificationProvider userId={user?.id}>
      <Outlet />
    </NotificationProvider>
  );
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path='/admin-dashboard' element={<AdminDashboard/>}/>
      <Route path="/features/budget-managment" element={<BudgetingPage />} />
      <Route path="/features/security" element={<SecurityPage />} />
      <Route path='/features/analytics' element={<SmartAnalytics />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path='/reset-password' element={<ResetPassword/>} />
      <Route path="/legal/privacy" element={<Privacy />} />
      <Route path="/legal/terms" element={<Terms />} />
      <Route path="/legal/security" element={<Security />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact_us" element={<ContactUs />} />
      <Route path="/auth/oauth/callback" element={<OAuthCallback />} />
      <Route path="/session-expired" element={<SessionExpired />} />

      {/* ── Protected & Notification Enabled Routes ────────────────── */}
      <Route element={<ProtectedRoute><AuthenticatedNotificationWrapper /></ProtectedRoute>}>
        <Route path='/bills' element={<Bills />} />
        <Route path="/ai" element={<AI />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path='/transactions' element={<Transactions />} />
        <Route path='/budgets' element={<Budgets />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/goals" element={<GoalsPage />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;