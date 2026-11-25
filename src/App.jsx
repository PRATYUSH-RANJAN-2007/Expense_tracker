import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { DataProvider } from './context/DataContext';
import { PrivateRoute, AdminRoute, PublicRoute } from './components/routes/ProtectedRoutes';

// Auth pages
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';

// User pages
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Budgets from './pages/Budgets';
import Accounts from './pages/Accounts';
import Recurring from './pages/Recurring';
import Reports from './pages/Reports';
import Profile from './pages/Profile';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminTransactions from './pages/admin/AdminTransactions';
import AdminCategories from './pages/admin/AdminCategories';

// 404
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <DataProvider>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3000,
                style: {
                  background: 'var(--bg-card)',
                  color: 'var(--text)',
                  border: '1px solid var(--border)',
                  borderRadius: '10px',
                  fontSize: '.875rem',
                  boxShadow: 'var(--shadow-md)',
                },
                success: {
                  iconTheme: { primary: '#22c55e', secondary: '#fff' },
                },
                error: {
                  iconTheme: { primary: '#ef4444', secondary: '#fff' },
                },
              }}
            />
            <Routes>
              {/* Public routes (redirect if logged in) */}
              <Route element={<PublicRoute />}>
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
              </Route>

              {/* User routes */}
              <Route element={<PrivateRoute />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/transactions" element={<Transactions />} />
                <Route path="/add-transaction" element={<Transactions />} />
                <Route path="/budgets" element={<Budgets />} />
                <Route path="/accounts" element={<Accounts />} />
                <Route path="/recurring" element={<Recurring />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/settings" element={<Profile />} />
              </Route>

              {/* Admin routes */}
              <Route element={<AdminRoute />}>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/users" element={<AdminUsers />} />
                <Route path="/admin/transactions" element={<AdminTransactions />} />
                <Route path="/admin/categories" element={<AdminCategories />} />
              </Route>

              {/* Redirects */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </DataProvider>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
