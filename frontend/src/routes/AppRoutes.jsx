// src/routes/AppRoutes.jsx
import { Routes, Route, Outlet } from 'react-router-dom';
import { lazy, Suspense } from "react";
import DashboardLayout from '../layouts/DashboardLayout';

// ── 1. Critical & Immediate Imports ──────────────────────────────
import Home from '../pages/Home';
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import NotFound from '../pages/NotFound';
import ProtectedRoute from '../components/ProtectedRoute';
import { useAuth } from '../context/AuthContext';
import { NotificationProvider } from '../hooks/useNotification';
import UpcomingFeatures from '../pages/UpcomingFeatures';
import { ReportProvider } from '../context/ReportContext';

// ── 2. Lazy Loaded Components ────────────────────────────────────
// Core Dynamic Dashboard & Dashboard Sub-routes
const Dashboard = lazy(() => import("../pages/Dashboard"));
const Settings = lazy(() => import("../pages/Settings"));
const Transactions = lazy(() => import('../pages/Transactions'));
const Budgets = lazy(() => import('../pages/Budgets'));
const Categories = lazy(() => import('../pages/Categories'));
const Bills = lazy(() => import('../pages/Bills'));
const AI = lazy(() => import('../pages/AI_Page'));
const Reports = lazy(() => import('../pages/Reports'));
const HistoryPage = lazy(() => import('../pages/HistoryPage'));
const GoalsPage = lazy(() => import('../pages/GoalsPage'));
const AccountsPage = lazy(() => import('../pages/AccountsPage'));
const AdminDashboard = lazy(() => import('../pages/AdminDashboard'));

// Feature & Solution Explainer Pages
const BudgetingPage = lazy(() => import('../pages/features/Budgetingpage'));
const SecurityPage = lazy(() => import('../pages/features/SecurityPage'));
const SmartAnalytics = lazy(() => import('../pages/features/AnalyticsPage'));
const BankingSolutionPage = lazy(() => import('../pages/solutions/BankingSolutionsPage'));
const InvestmentPlanningPage = lazy(() => import('../pages/solutions/InvesmentPlaningPage'));
const PersonalFinancePage = lazy(() => import('../pages/solutions/PersonalFinancePage'));
const BusinessFinancePage = lazy(() => import('../pages/solutions/BusinessFinancePage'));

// Auxiliary, Legal & Auth Utilities
const VerifyEmail = lazy(() => import('../pages/VerifyEmail'));
const ResetPassword = lazy(() => import('../pages/ResetPassword'));
const SessionExpired = lazy(() => import('../pages/SessionExpired'));
const OAuthCallback = lazy(() => import('../pages/OAuthCallback'));
const About = lazy(() => import('../pages/About'));
const ContactUs = lazy(() => import('../pages/Contact_Us'));
const Privacy = lazy(() => import('../pages/legal/Privacy'));
const Terms = lazy(() => import('../pages/legal/Terms'));
const Security = lazy(() => import('../pages/legal/Security'));


// ── Authenticated Notification Wrapper ───────────────────────────
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
    /* We wrap the routes inside Suspense. 
      You can swap 'Loading...' out for a custom Spinner/Skeleton component.
    */
    <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading...</div>}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route path='/admin-dashboard' element={<AdminDashboard />} />
        <Route path="/features/budget-management" element={<BudgetingPage />} />
        <Route path="/features/security" element={<SecurityPage />} />
        <Route path='/features/analytics' element={<SmartAnalytics />} />
        <Route path="/solutions/banking-solutions" element={<BankingSolutionPage />} />
        <Route path="/solutions/investment-planning" element={<InvestmentPlanningPage />} />
        <Route path="/solutions/personal-finance" element={<PersonalFinancePage />} />
        <Route path="/solutions/business-finance" element={<BusinessFinancePage />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path='/reset-password' element={<ResetPassword />} />
        <Route path="/legal/privacy" element={<Privacy />} />
        <Route path="/legal/terms" element={<Terms />} />
        <Route path="/legal/security" element={<Security />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact_us" element={<ContactUs />} />
        <Route path="/upcoming_features" element={<UpcomingFeatures />} />
        <Route path="/auth/oauth/callback" element={<OAuthCallback />} />
        <Route path="/session-expired" element={<SessionExpired />} />

        {/* ── Protected & Notification Enabled Routes ────────────────── */}
        <Route element={<ProtectedRoute><AuthenticatedNotificationWrapper /></ProtectedRoute>}>

          {/* Wrap all private pages in a shared layout route */}
          <Route element={<ReportProvider><DashboardLayout /></ReportProvider>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path='/bills' element={<Bills />} />
            <Route path="/ai" element={<AI />} />
            <Route path="/reports" element={<Reports />} />
            <Route path='/transactions' element={<Transactions />} />
            <Route path='/budgets' element={<Budgets />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/goals" element={<GoalsPage />} />
            <Route path="/accounts" element={<AccountsPage />} />
          </Route>

        </Route>


        {/* Catch-all */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;