import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Wallet, Info } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import '../../styles/auth.css';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errs = {};
    if (!form.email.trim()) errs.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Enter a valid email.';
    if (!form.password) errs.password = 'Password is required.';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setLoading(true);
    const result = await login(form.email.trim(), form.password);
    setLoading(false);
    if (result.success) {
      toast.success('Welcome back! 👋');
      navigate(result.role === 'admin' ? '/admin' : '/dashboard', { replace: true });
    } else {
      setErrors({ general: result.error });
      toast.error(result.error);
    }
  };

  const fillDemo = (role) => {
    if (role === 'user') setForm({ email: 'user@example.com', password: 'User@123' });
    else setForm({ email: 'admin@example.com', password: 'Admin@123' });
    setErrors({});
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-brand">
          <div className="auth-brand-icon">💰</div>
          <div>
            <div className="auth-brand-name">ExpenseTracker</div>
            <div className="auth-brand-tag">Personal Finance Manager</div>
          </div>
        </div>
        <div className="auth-features">
          {[
            { icon: '📊', title: 'Smart Dashboard', desc: 'Get a clear overview of your finances at a glance.' },
            { icon: '🏦', title: 'Multi-Account', desc: 'Track all your accounts – bank, cash, savings & more.' },
            { icon: '🎯', title: 'Budget Goals', desc: 'Set budgets per category and track your progress.' },
            { icon: '📈', title: 'Reports & Charts', desc: 'Visual insights into your spending patterns.' },
            { icon: '🔁', title: 'Recurring Expenses', desc: 'Never miss a subscription or regular payment.' },
          ].map((f) => (
            <div key={f.title} className="auth-feature">
              <div className="auth-feature-icon">{f.icon}</div>
              <div>
                <div className="auth-feature-title">{f.title}</div>
                <div className="auth-feature-desc">{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '1.5rem' }}>
            <Wallet size={28} color="var(--primary)" />
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)' }}>ExpenseTracker</span>
          </div>
          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-subtitle">Sign in to your account to continue.</p>

          {/* Demo credentials box */}
          <div className="demo-box">
            <div className="demo-box-title"><Info size={14} /> Demo Credentials</div>
            <div className="demo-credentials">
              <div style={{ marginBottom: '.5rem' }}>
                <div className="demo-cred-row">
                  <span className="demo-cred-label">👤 User:</span>
                  <button onClick={() => fillDemo('user')} className="btn btn-sm" style={{ padding: '.2rem .5rem', fontSize: '.75rem', background: 'var(--primary)', color: '#fff' }}>Use</button>
                </div>
                <div style={{ fontSize: '.8125rem', color: '#3b82f6', marginTop: '.25rem' }}>
                  <span>user@example.com</span> / <span className="demo-cred-value">User@123</span>
                </div>
              </div>
              <div>
                <div className="demo-cred-row">
                  <span className="demo-cred-label">🔑 Admin:</span>
                  <button onClick={() => fillDemo('admin')} className="btn btn-sm" style={{ padding: '.2rem .5rem', fontSize: '.75rem', background: '#6b21a8', color: '#fff' }}>Use</button>
                </div>
                <div style={{ fontSize: '.8125rem', color: '#3b82f6', marginTop: '.25rem' }}>
                  <span>admin@example.com</span> / <span className="demo-cred-value">Admin@123</span>
                </div>
              </div>
            </div>
          </div>

          {errors.general && (
            <div className="form-error" style={{ marginBottom: '1rem', background: 'var(--danger-light)', padding: '.75rem', borderRadius: 'var(--radius-sm)', fontSize: '.875rem' }}>
              ⚠️ {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label className="form-label">Email <span className="required">*</span></label>
              <input
                type="email"
                className={`form-control ${errors.email ? 'error' : ''}`}
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                autoComplete="email"
              />
              {errors.email && <div className="form-error">⚠️ {errors.email}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Password <span className="required">*</span></label>
              <div className="password-wrapper">
                <input
                  type={showPass ? 'text' : 'password'}
                  className={`form-control ${errors.password ? 'error' : ''}`}
                  placeholder="Your password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  autoComplete="current-password"
                  style={{ paddingRight: '2.75rem' }}
                />
                <button type="button" className="password-toggle" onClick={() => setShowPass(!showPass)}>
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <div className="form-error">⚠️ {errors.password}</div>}
            </div>

            <button type="submit" className="btn btn-primary btn-full" disabled={loading} style={{ marginTop: '.5rem', padding: '.75rem' }}>
              {loading ? <><span className="spinner" style={{ width: 16, height: 16 }} /> Signing in…</> : 'Sign In'}
            </button>
          </form>

          <div className="auth-footer">
            Don't have an account? <Link to="/signup" style={{ fontWeight: 600 }}>Sign up</Link>
          </div>

          <div style={{ marginTop: '2rem', padding: '1rem', background: 'var(--bg-hover)', borderRadius: 'var(--radius-sm)', fontSize: '.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>
            🔒 This app uses LocalStorage for demo purposes. Not for production use.
          </div>
        </div>
      </div>
    </div>
  );
}
