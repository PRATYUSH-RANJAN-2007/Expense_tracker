import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getSettings, saveSettings } from '../utils/storage';
import toast from 'react-hot-toast';
import { User, Lock, Bell, Palette, Eye, EyeOff, Sliders } from 'lucide-react';

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [activeTab, setActiveTab] = useState('profile');

  // Profile form
  const [profile, setProfile] = useState({ name: user?.name || '', email: user?.email || '' });
  const [profileErrors, setProfileErrors] = useState({});

  // Password form
  const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' });
  const [passErrors, setPassErrors] = useState({});
  const [showPass, setShowPass] = useState({ current: false, new: false, confirm: false });

  // Preferences form
  const [prefs, setPrefs] = useState(() => {
    const s = getSettings(user?.id);
    return {
      currency: s.currency || 'INR',
      dateFormat: s.dateFormat || 'dd/MM/yyyy',
      budgetAlerts: s.budgetAlerts ?? true,
    };
  });

  const handleProfileSave = (e) => {
    e.preventDefault();
    const errs = {};
    if (!profile.name.trim()) errs.name = 'Name is required.';
    if (!profile.email.trim()) errs.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) errs.email = 'Invalid email.';
    setProfileErrors(errs);
    if (Object.keys(errs).length) return;
    updateProfile({ name: profile.name.trim(), email: profile.email.trim() });
    toast.success('Profile updated!');
  };

  const handlePasswordSave = (e) => {
    e.preventDefault();
    const errs = {};
    if (!passwords.current) errs.current = 'Enter current password.';
    else if (passwords.current !== user.password) errs.current = 'Current password is incorrect.';
    if (!passwords.newPass) errs.newPass = 'Enter new password.';
    else if (passwords.newPass.length < 6) errs.newPass = 'Min 6 characters.';
    if (passwords.newPass !== passwords.confirm) errs.confirm = 'Passwords do not match.';
    setPassErrors(errs);
    if (Object.keys(errs).length) return;
    updateProfile({ password: passwords.newPass });
    setPasswords({ current: '', newPass: '', confirm: '' });
    toast.success('Password changed!');
  };

  const handlePrefsSave = (e) => {
    e.preventDefault();
    if (user) {
      saveSettings(user.id, prefs);
      toast.success('Preferences saved!');
    }
  };

  const initials = user?.name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || 'U';

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'preferences', label: 'Preferences', icon: Sliders },
    { id: 'appearance', label: 'Appearance', icon: Palette },
  ];

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">Profile & Settings</h1>
          <p className="page-subtitle">Manage your account information</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Left panel */}
        <div>
          <div className="card" style={{ textAlign: 'center', padding: '1.5rem' }}>
            <div className="avatar avatar-lg" style={{ margin: '0 auto 1rem', width: 72, height: 72, fontSize: '1.5rem', background: user?.role === 'admin' ? '#6b21a8' : 'var(--primary)', color: '#fff' }}>
              {initials}
            </div>
            <div style={{ fontWeight: 700, color: 'var(--text)', marginBottom: '.25rem' }}>{user?.name}</div>
            <div style={{ fontSize: '.8125rem', color: 'var(--text-muted)', marginBottom: '.5rem' }}>{user?.email}</div>
            <span className={`badge ${user?.role === 'admin' ? 'badge-primary' : 'badge-info'}`}>
              {user?.role === 'admin' ? '🔑 Admin' : '👤 User'}
            </span>
          </div>

          <div className="card" style={{ padding: '.5rem', marginTop: '1rem' }}>
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '.625rem',
                  padding: '.625rem .75rem',
                  border: 'none',
                  background: activeTab === id ? 'var(--primary-light)' : 'transparent',
                  color: activeTab === id ? 'var(--primary)' : 'var(--text-muted)',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  fontSize: '.875rem',
                  fontWeight: activeTab === id ? 600 : 400,
                  textAlign: 'left',
                  transition: 'all .15s',
                  marginBottom: '.25rem',
                }}
              >
                <Icon size={16} /> {label}
              </button>
            ))}
          </div>
        </div>

        {/* Right panel */}
        <div>
          {activeTab === 'profile' && (
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Personal Information</h3>
              </div>
              <form onSubmit={handleProfileSave} noValidate>
                <div className="form-group">
                  <label className="form-label">Full Name <span className="required">*</span></label>
                  <input type="text" className={`form-control ${profileErrors.name ? 'error' : ''}`} value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
                  {profileErrors.name && <div className="form-error">⚠️ {profileErrors.name}</div>}
                </div>
                <div className="form-group">
                  <label className="form-label">Email <span className="required">*</span></label>
                  <input type="email" className={`form-control ${profileErrors.email ? 'error' : ''}`} value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
                  {profileErrors.email && <div className="form-error">⚠️ {profileErrors.email}</div>}
                </div>
                <div className="form-group">
                  <label className="form-label">Role</label>
                  <input type="text" className="form-control" value={user?.role} disabled />
                </div>
                <div className="form-group">
                  <label className="form-label">Member Since</label>
                  <input type="text" className="form-control" value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN') : '-'} disabled />
                </div>
                <button type="submit" className="btn btn-primary">Save Changes</button>
              </form>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Change Password</h3>
              </div>
              <div style={{ background: 'var(--warning-light)', border: '1px solid #fcd34d', borderRadius: 'var(--radius-sm)', padding: '.75rem', marginBottom: '1rem', fontSize: '.8125rem', color: '#92400e' }}>
                ⚠️ Note: This app uses LocalStorage for demo purposes. Passwords are stored in plain text for educational purposes only. This is not secure for production use.
              </div>
              <form onSubmit={handlePasswordSave} noValidate>
                {['current', 'new', 'confirm'].map((field) => (
                  <div key={field} className="form-group">
                    <label className="form-label">
                      {field === 'current' ? 'Current Password' : field === 'new' ? 'New Password' : 'Confirm New Password'}
                      <span className="required"> *</span>
                    </label>
                    <div className="password-wrapper">
                      <input
                        type={showPass[field] ? 'text' : 'password'}
                        className={`form-control ${passErrors[field === 'new' ? 'newPass' : field === 'confirm' ? 'confirm' : 'current'] ? 'error' : ''}`}
                        value={field === 'new' ? passwords.newPass : field === 'confirm' ? passwords.confirm : passwords.current}
                        onChange={(e) => setPasswords({ ...passwords, [field === 'new' ? 'newPass' : field]: e.target.value })}
                        style={{ paddingRight: '2.75rem' }}
                        placeholder={field === 'new' ? 'Min 6 characters' : ''}
                      />
                      <button type="button" className="password-toggle" onClick={() => setShowPass({ ...showPass, [field]: !showPass[field] })}>
                        {showPass[field] ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {passErrors[field === 'new' ? 'newPass' : field] && (
                      <div className="form-error">⚠️ {passErrors[field === 'new' ? 'newPass' : field]}</div>
                    )}
                  </div>
                ))}
                <button type="submit" className="btn btn-primary">Change Password</button>
              </form>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Preferences & Settings</h3>
              </div>
              <form onSubmit={handlePrefsSave}>
                <div className="form-group">
                  <label className="form-label">Preferred Currency</label>
                  <select
                    className="form-control"
                    value={prefs.currency}
                    onChange={(e) => setPrefs({ ...prefs, currency: e.target.value })}
                  >
                    <option value="INR">INR (₹) - Indian Rupee</option>
                    <option value="USD">USD ($) - US Dollar</option>
                    <option value="EUR">EUR (€) - Euro</option>
                    <option value="GBP">GBP (£) - British Pound</option>
                  </select>
                  <div className="form-hint">Used for displaying financial summaries and reports.</div>
                </div>

                <div className="form-group">
                  <label className="form-label">Date Format</label>
                  <select
                    className="form-control"
                    value={prefs.dateFormat}
                    onChange={(e) => setPrefs({ ...prefs, dateFormat: e.target.value })}
                  >
                    <option value="dd/MM/yyyy">DD/MM/YYYY (e.g. 25/11/2026)</option>
                    <option value="MM/dd/yyyy">MM/DD/YYYY (e.g. 11/25/2026)</option>
                    <option value="yyyy-MM-dd">YYYY-MM-DD (e.g. 2026-11-25)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '.5rem', cursor: 'pointer', fontSize: '.875rem', fontWeight: 500, color: 'var(--text)' }}>
                    <input
                      type="checkbox"
                      checked={prefs.budgetAlerts}
                      onChange={(e) => setPrefs({ ...prefs, budgetAlerts: e.target.checked })}
                      style={{ width: 16, height: 16 }}
                    />
                    Enable Budget Overspending Warnings
                  </label>
                </div>

                <button type="submit" className="btn btn-primary" style={{ marginTop: '.5rem' }}>
                  Save Preferences
                </button>
              </form>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Appearance</h3>
              </div>
              <div className="form-group">
                <label className="form-label">Theme</label>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '.5rem' }}>
                  {['light', 'dark'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => { if (theme !== t) toggleTheme(); }}
                      style={{
                        flex: 1,
                        padding: '1rem',
                        border: `2px solid ${theme === t ? 'var(--primary)' : 'var(--border)'}`,
                        background: theme === t ? 'var(--primary-light)' : 'transparent',
                        borderRadius: 'var(--radius)',
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        fontSize: '.875rem',
                        fontWeight: 500,
                        color: theme === t ? 'var(--primary)' : 'var(--text-muted)',
                        transition: 'all .15s',
                      }}
                    >
                      {t === 'light' ? '☀️ Light Mode' : '🌙 Dark Mode'}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ background: 'var(--bg-hover)', borderRadius: 'var(--radius-sm)', padding: '1rem', marginTop: '.5rem', fontSize: '.875rem', color: 'var(--text-muted)' }}>
                Your theme preference is saved automatically and persists across sessions.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
