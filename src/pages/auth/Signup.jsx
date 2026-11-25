import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Wallet } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import '../../styles/auth.css';

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Full name is required.';
    else if (form.name.trim().length < 2) errs.name = 'Name must be at least 2 characters.';
    if (!form.email.trim()) errs.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Enter a valid email.';
    if (!form.password) errs.password = 'Password is required.';
    else if (form.password.length < 6) errs.password = 'Password must be at least 6 characters.';
    if (!form.confirmPassword) errs.confirmPassword = 'Please confirm your password.';
    else if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match.';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setLoading(true);
    const result = await signup({ name: form.name.trim(), email: form.email.trim(), password: form.password });
    setLoading(false);
    if (result.success) {
      toast.success('Account created! Please sign in.');
      navigate('/login', { replace: true });
    } else {
      setErrors({ general: result.error });
    }
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
            { icon: '✅', title: 'Free to Use', desc: 'Completely free, no subscriptions required.' },
            { icon: '🔐', title: 'Your Data Only', desc: 'Your data stays in your browser, fully private.' },
            { icon: '📱', title: 'Works Everywhere', desc: 'Desktop, tablet, and mobile friendly.' },
            { icon: '📤', title: 'Export Anytime', desc: 'Download your data as CSV or JSON.' },
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
          <h1 className="auth-title">Create account</h1>
          <p className="auth-subtitle">Start tracking your expenses today.</p>

          {errors.general && (
            <div className="form-error" style={{ marginBottom: '1rem', background: 'var(--danger-light)', padding: '.75rem', borderRadius: 'var(--radius-sm)', fontSize: '.875rem' }}>
              ⚠️ {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label className="form-label">Full Name <span className="required">*</span></label>
              <input
                type="text"
                className={`form-control ${errors.name ? 'error' : ''}`}
                placeholder="John Doe"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                autoComplete="name"
              />
              {errors.name && <div className="form-error">⚠️ {errors.name}</div>}
            </div>

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
                  placeholder="At least 6 characters"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  autoComplete="new-password"
                  style={{ paddingRight: '2.75rem' }}
                />
                <button type="button" className="password-toggle" onClick={() => setShowPass(!showPass)}>
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <div className="form-error">⚠️ {errors.password}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password <span className="required">*</span></label>
              <div className="password-wrapper">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  className={`form-control ${errors.confirmPassword ? 'error' : ''}`}
                  placeholder="Repeat your password"
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  autoComplete="new-password"
                  style={{ paddingRight: '2.75rem' }}
                />
                <button type="button" className="password-toggle" onClick={() => setShowConfirm(!showConfirm)}>
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.confirmPassword && <div className="form-error">⚠️ {errors.confirmPassword}</div>}
            </div>

            <button type="submit" className="btn btn-primary btn-full" disabled={loading} style={{ marginTop: '.5rem', padding: '.75rem' }}>
              {loading ? <><span className="spinner" style={{ width: 16, height: 16 }} /> Creating account…</> : 'Create Account'}
            </button>
          </form>

          <div className="auth-footer">
            Already have an account? <Link to="/login" style={{ fontWeight: 600 }}>Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
