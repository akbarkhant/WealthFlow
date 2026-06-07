import { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  Bell,
  CheckCircle2,
  CreditCard,
  LockKeyhole,
  Moon,
  Save,
  Settings as SettingsIcon,
  Shield,
  Sun,
  UserRound,
} from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { updateMe } from '../api/userApi';
import '../styles/pages/Settings.css';

const tabs = [
  { id: 'profile', label: 'Profile', icon: UserRound },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'preferences', label: 'Preferences', icon: SettingsIcon },
];

const Settings = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [toast, setToast] = useState(null);
  const [profileError, setProfileError] = useState('');
  const [securityError, setSecurityError] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingSecurity, setSavingSecurity] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    currency: user?.currency || 'USD',
    monthlyBudget: user?.monthlyBudget || '3200',
  });
  const [securityForm, setSecurityForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [notifications, setNotifications] = useState({
    billReminders: true,
    budgetAlerts: true,
    weeklyReports: false,
    productUpdates: true,
  });
  const [preferences, setPreferences] = useState({
    density: 'comfortable',
    startPage: 'dashboard',
    language: 'English',
  });

  useEffect(() => {
    setProfileForm((current) => ({
      ...current,
      name: user?.name || current.name,
      email: user?.email || current.email,
      currency: user?.currency || current.currency,
    }));
  }, [user]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const initials = useMemo(() => {
    const display = profileForm.name || profileForm.email || 'WF';
    return display
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }, [profileForm.email, profileForm.name]);

  const showToast = (message, tone = 'success') => {
    setToast({ message, tone });
    window.setTimeout(() => setToast(null), 3000);
  };

  const handleProfileChange = (event) => {
    const { name, value } = event.target;
    setProfileForm((current) => ({ ...current, [name]: value }));
  };

  const handleSecurityChange = (event) => {
    const { name, value } = event.target;
    setSecurityForm((current) => ({ ...current, [name]: value }));
  };

  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    setProfileError('');

    if (!profileForm.name.trim()) {
      setProfileError('Name is required.');
      return;
    }
    setSavingProfile(true);
    try {
      const updatedUser = await updateMe({
        name: profileForm.name.trim(),
        currency: profileForm.currency || 'USD',
      });
      updateUser(updatedUser || profileForm);
      showToast('Profile settings saved.');
    } catch (err) {
      setProfileError('Failed to save profile settings.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSecuritySubmit = async (event) => {
    event.preventDefault();
    setSecurityError('Password change is not available yet. This will be enabled when the API supports it.');
  };

  const toggleNotification = (key) => {
    setNotifications((current) => ({ ...current, [key]: !current[key] }));
    showToast('Notification preference updated.');
  };

  return (
    <DashboardLayout>
      <section className="page-stack settings-page">
        <div className="page-header">
          <div>
            <p className="page-eyebrow">Workspace controls</p>
            <h1 className="page-title">Settings</h1>
            <p className="page-subtitle">
              Manage your profile, security, notifications, and app preferences from one place.
            </p>
          </div>
        </div>

        <div className="settings-layout">
          <aside className="settings-tabs surface-card">
            <div className="settings-profile-card">
              <span className="settings-avatar">{initials}</span>
              <div>
                <strong>{profileForm.name || 'WealthFlow User'}</strong>
                <p>{profileForm.email || 'member@wealthflow.local'}</p>
              </div>
            </div>

            <nav aria-label="Settings sections">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    className={`settings-tab ${activeTab === tab.id ? 'is-active' : ''}`}
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <Icon size={18} />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </aside>

          <div className="settings-panel surface-card">
            {activeTab === 'profile' && (
              <form className="settings-form" onSubmit={handleProfileSubmit}>
                <div className="settings-section-header">
                  <span><UserRound size={20} /></span>
                  <div>
                    <h2>Profile Information</h2>
                    <p>Keep your dashboard identity and financial defaults up to date.</p>
                  </div>
                </div>

                {profileError && <div className="alert alert-error">{profileError}</div>}

                <div className="form-grid">
                  <div className="field">
                    <label htmlFor="name">Full name</label>
                    <input className="input" id="name" name="name" value={profileForm.name} onChange={handleProfileChange} />
                  </div>
                  <div className="field">
                    <label htmlFor="email">Email address</label>
                    <input className="input" id="email" name="email" type="email" value={profileForm.email} readOnly disabled />
                  </div>
                  <div className="field">
                    <label htmlFor="currency">Currency</label>
                    <select className="select" id="currency" name="currency" value={profileForm.currency} onChange={handleProfileChange}>
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                      <option value="PKR">PKR</option>
                    </select>
                  </div>
                  <div className="field">
                    <p className="settings-hint">Set monthly limits per category on the Budgets page.</p>
                  </div>
                </div>

                <div className="settings-actions">
                  <button className="btn btn-primary" type="submit" disabled={savingProfile}>
                    <Save size={16} />
                    {savingProfile ? 'Saving...' : 'Save Profile'}
                  </button>
                </div>
              </form>
            )}

            {activeTab === 'security' && (
              <form className="settings-form" onSubmit={handleSecuritySubmit}>
                <div className="settings-section-header">
                  <span><LockKeyhole size={20} /></span>
                  <div>
                    <h2>Security</h2>
                    <p>Update password credentials and review protection preferences.</p>
                  </div>
                </div>

                {securityError && <div className="alert alert-error">{securityError}</div>}

                <div className="form-grid">
                  <div className="field">
                    <label htmlFor="currentPassword">Current password</label>
                    <input className="input" id="currentPassword" name="currentPassword" type="password" value={securityForm.currentPassword} onChange={handleSecurityChange} />
                  </div>
                  <div className="field">
                    <label htmlFor="newPassword">New password</label>
                    <input className="input" id="newPassword" name="newPassword" type="password" value={securityForm.newPassword} onChange={handleSecurityChange} />
                  </div>
                  <div className="field">
                    <label htmlFor="confirmPassword">Confirm password</label>
                    <input className="input" id="confirmPassword" name="confirmPassword" type="password" value={securityForm.confirmPassword} onChange={handleSecurityChange} />
                  </div>
                </div>

                <div className="security-checklist">
                  <div><CheckCircle2 size={16} /> Two-step verification enabled</div>
                  <div><CheckCircle2 size={16} /> Session timeout protection active</div>
                  <div><CheckCircle2 size={16} /> Login alerts enabled</div>
                </div>

                <div className="settings-actions">
                  <button className="btn btn-primary" type="submit" disabled={savingSecurity}>
                    <Save size={16} />
                    {savingSecurity ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </form>
            )}

            {activeTab === 'notifications' && (
              <div className="settings-form">
                <div className="settings-section-header">
                  <span><Bell size={20} /></span>
                  <div>
                    <h2>Notifications</h2>
                    <p>Choose the alerts that should reach you inside the dashboard.</p>
                  </div>
                </div>

                <div className="toggle-list">
                  {[
                    ['billReminders', 'Bill reminders', 'Get notified before upcoming due dates.'],
                    ['budgetAlerts', 'Budget alerts', 'Know when category spending approaches the limit.'],
                    ['weeklyReports', 'Weekly reports', 'Receive a weekly digest of cashflow movement.'],
                    ['productUpdates', 'Product updates', 'Hear about useful new WealthFlow features.'],
                  ].map(([key, title, description]) => (
                    <div className="toggle-row" key={key}>
                      <div>
                        <strong>{title}</strong>
                        <p>{description}</p>
                      </div>
                      <button
                        className={`switch ${notifications[key] ? 'is-on' : ''}`}
                        type="button"
                        aria-pressed={notifications[key]}
                        onClick={() => toggleNotification(key)}
                      >
                        <span />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'preferences' && (
              <div className="settings-form">
                <div className="settings-section-header">
                  <span><CreditCard size={20} /></span>
                  <div>
                    <h2>Preferences</h2>
                    <p>Personalize presentation, defaults, and dashboard density.</p>
                  </div>
                </div>

                <div className="preference-grid">
                  <div className="preference-card">
                    <div>
                      <strong>Theme</strong>
                      <p>Switch between light and dark surfaces.</p>
                    </div>
                    <button className="btn btn-secondary" type="button" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
                      {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
                      {theme === 'light' ? 'Dark' : 'Light'}
                    </button>
                  </div>

                  <div className="field">
                    <label htmlFor="density">Interface density</label>
                    <select className="select" id="density" value={preferences.density} onChange={(event) => setPreferences((current) => ({ ...current, density: event.target.value }))}>
                      <option value="comfortable">Comfortable</option>
                      <option value="compact">Compact</option>
                    </select>
                  </div>

                  <div className="field">
                    <label htmlFor="startPage">Default page</label>
                    <select className="select" id="startPage" value={preferences.startPage} onChange={(event) => setPreferences((current) => ({ ...current, startPage: event.target.value }))}>
                      <option value="dashboard">Dashboard</option>
                      <option value="transactions">Transactions</option>
                      <option value="bills">Bills</option>
                      <option value="savings">Savings</option>
                    </select>
                  </div>

                  <div className="field">
                    <label htmlFor="language">Language</label>
                    <select className="select" id="language" value={preferences.language} onChange={(event) => setPreferences((current) => ({ ...current, language: event.target.value }))}>
                      <option value="English">English</option>
                      <option value="Urdu">Urdu</option>
                      <option value="Spanish">Spanish</option>
                    </select>
                  </div>
                </div>

                <div className="settings-actions">
                  <button className="btn btn-primary" type="button" onClick={() => showToast('Preferences saved.')}>
                    <Save size={16} />
                    Save Preferences
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {toast && (
          <div className="toast-stack" role="status" aria-live="polite">
            <div className={`toast toast-${toast.tone}`}>
              {toast.tone === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
              <span>{toast.message}</span>
            </div>
          </div>
        )}
      </section>
    </DashboardLayout>
  );
};

export default Settings;
