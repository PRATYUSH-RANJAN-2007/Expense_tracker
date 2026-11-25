import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, ArrowUpDown, PiggyBank, CreditCard,
  RefreshCw, BarChart3, Settings, LogOut, Users, Tag,
  FileText, Menu, X, Wallet, ChevronRight, Shield
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import toast from 'react-hot-toast';
import '../../styles/sidebar.css';

const userNav = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/transactions', icon: ArrowUpDown, label: 'Transactions' },
  { to: '/budgets', icon: PiggyBank, label: 'Budgets' },
  { to: '/accounts', icon: CreditCard, label: 'Accounts' },
  { to: '/recurring', icon: RefreshCw, label: 'Recurring' },
  { to: '/reports', icon: BarChart3, label: 'Reports' },
];

const adminNav = [
  { to: '/admin', icon: LayoutDashboard, label: 'Admin Dashboard', end: true },
  { to: '/admin/users', icon: Users, label: 'User Management' },
  { to: '/admin/transactions', icon: FileText, label: 'All Transactions' },
  { to: '/admin/categories', icon: Tag, label: 'Categories' },
];

const bottomNav = [
  { to: '/profile', icon: Settings, label: 'Profile & Settings' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Signed out successfully.');
    navigate('/login', { replace: true });
  };

  const navItems = user?.role === 'admin' ? adminNav : userNav;
  const initials = user?.name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || 'U';

  const SidebarContent = () => (
    <>
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon"><Wallet size={22} /></div>
        <div>
          <div className="sidebar-logo-text">ExpenseTracker</div>
          <div className="sidebar-logo-sub">{user?.role === 'admin' ? 'Admin Panel' : 'Finance Manager'}</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {user?.role === 'admin' && (
          <div className="sidebar-section">Admin</div>
        )}
        {!user?.role === 'admin' && (
          <div className="sidebar-section">Menu</div>
        )}

        {navItems.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
            onClick={() => setMobileOpen(false)}
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}

        {user?.role !== 'admin' && (
          <>
            <div className="sidebar-section" style={{ marginTop: '1rem' }}>Settings</div>
            {bottomNav.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
                onClick={() => setMobileOpen(false)}
              >
                <Icon size={18} />
                {label}
              </NavLink>
            ))}
          </>
        )}

        {user?.role === 'admin' && (
          <>
            <div className="sidebar-section" style={{ marginTop: '1rem' }}>Account</div>
            <NavLink
              to="/profile"
              className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
              onClick={() => setMobileOpen(false)}
            >
              <Settings size={18} /> Profile & Settings
            </NavLink>
          </>
        )}
      </nav>

      {/* Theme toggle */}
      <div style={{ padding: '0 1.25rem .5rem' }}>
        <button
          onClick={toggleTheme}
          className="sidebar-link"
          style={{ width: '100%', border: 'none', background: 'transparent', cursor: 'pointer', borderLeft: 'none' }}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
          <span style={{ marginLeft: '.5rem' }}>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
        </button>
      </div>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="avatar avatar-sm" style={{ background: user?.role === 'admin' ? '#6b21a8' : 'var(--primary)', color: '#fff' }}>
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="sidebar-user-name truncate">{user?.name}</div>
            <div className="sidebar-user-role">{user?.role === 'admin' ? '🔑 Administrator' : '👤 User'}</div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="sidebar-link"
          style={{ width: '100%', border: 'none', background: 'transparent', cursor: 'pointer', color: '#ef4444', marginTop: '.5rem', borderLeft: 'none' }}
        >
          <LogOut size={18} /> Sign Out
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile header */}
      <div className="mobile-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
          <button className="btn btn-ghost btn-icon" onClick={() => setMobileOpen(true)}>
            <Menu size={22} />
          </button>
          <span style={{ fontWeight: 700, color: 'var(--primary)' }}>ExpenseTracker</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
          <button className="btn btn-ghost btn-icon" onClick={toggleTheme} title="Toggle theme">
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <div className="avatar avatar-sm" style={{ background: 'var(--primary)', color: '#fff' }}>
            {initials}
          </div>
        </div>
      </div>

      {/* Mobile overlay */}
      <div
        className={`mobile-overlay${mobileOpen ? ' show' : ''}`}
        onClick={() => setMobileOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`sidebar${mobileOpen ? ' open' : ''}`}>
        {mobileOpen && (
          <button
            onClick={() => setMobileOpen(false)}
            style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(255,255,255,.1)', border: 'none', borderRadius: '8px', padding: '.5rem', cursor: 'pointer', color: '#fff', display: 'flex' }}
          >
            <X size={20} />
          </button>
        )}
        <SidebarContent />
      </aside>
    </>
  );
}
