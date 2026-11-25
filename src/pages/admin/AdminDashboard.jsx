import { useMemo } from 'react';
import { Users, FileText, TrendingUp, TrendingDown, Activity, Shield } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { formatCurrency, formatDate, sumByType, getLastNMonths, groupByMonth, currentMonthYear, filterByMonth } from '../../utils/helpers';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { format } from 'date-fns';

export default function AdminDashboard() {
  const { getAllUsers, getAllTransactions, getAllAccounts } = useData();
  const { month, year } = currentMonthYear();

  const users = getAllUsers();
  const allTxns = getAllTransactions();
  const accounts = getAllAccounts();

  const normalUsers = users.filter((u) => u.role === 'user');
  const activeUsers = normalUsers.filter((u) => u.isActive);
  const thisMonthTxns = useMemo(() => filterByMonth(allTxns, month, year), [allTxns, month, year]);
  const totalIncome = useMemo(() => sumByType(allTxns, 'income'), [allTxns]);
  const totalExpense = useMemo(() => sumByType(allTxns, 'expense'), [allTxns]);

  const monthLabels = useMemo(() => getLastNMonths(6), []);
  const monthlyData = useMemo(() => {
    const grouped = groupByMonth(allTxns);
    return monthLabels.map((label) => ({
      month: label.split(' ')[0],
      income: grouped[label]?.income || 0,
      expense: grouped[label]?.expense || 0,
    }));
  }, [allTxns, monthLabels]);

  const recentTxns = useMemo(() =>
    [...allTxns].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 10),
  [allTxns]);

  const userTxnCounts = useMemo(() => {
    const counts = {};
    allTxns.forEach((t) => {
      counts[t.userId] = (counts[t.userId] || 0) + 1;
    });
    return counts;
  }, [allTxns]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', boxShadow: 'var(--shadow-md)', fontSize: '.875rem' }}>
        <p style={{ fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>{label}</p>
        {payload.map((p) => (
          <p key={p.name} style={{ color: p.fill }}>{p.name}: {formatCurrency(p.value)}</p>
        ))}
      </div>
    );
  };

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.625rem', marginBottom: '.25rem' }}>
            <Shield size={20} color="#6b21a8" />
            <span style={{ fontSize: '.875rem', color: '#6b21a8', fontWeight: 600 }}>Admin Panel</span>
          </div>
          <h1 className="page-title">Admin Dashboard</h1>
          <p className="page-subtitle">{format(new Date(), 'EEEE, dd MMMM yyyy')}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-4" style={{ marginBottom: '1.5rem' }}>
        {[
          { icon: Users, label: 'Total Users', value: normalUsers.length, sub: `${activeUsers.length} active`, bg: '#ede9fe', color: '#7c3aed' },
          { icon: FileText, label: 'Total Transactions', value: allTxns.length, sub: `${thisMonthTxns.length} this month`, bg: 'var(--info-light)', color: '#1d4ed8' },
          { icon: TrendingUp, label: 'Total Income', value: formatCurrency(totalIncome), sub: 'All time', bg: 'var(--success-light)', color: 'var(--success)' },
          { icon: TrendingDown, label: 'Total Expenses', value: formatCurrency(totalExpense), sub: 'All time', bg: 'var(--danger-light)', color: 'var(--danger)' },
        ].map(({ icon: Icon, label, value, sub, bg, color }) => (
          <div key={label} className="stat-card">
            <div className="stat-icon" style={{ background: bg }}>
              <Icon size={22} color={color} />
            </div>
            <div className="stat-info">
              <div className="stat-label">{label}</div>
              <div className="stat-value" style={{ color }}>{value}</div>
              <div className="stat-change text-muted">{sub}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-2" style={{ marginBottom: '1.5rem', gap: '1rem' }}>
        {/* Monthly chart */}
        <div className="card">
          <div className="card-header"><h3 className="card-title">Monthly Overview</h3></div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={monthlyData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="circle" iconSize={8} />
              <Bar dataKey="income" name="Income" fill="#22c55e" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expense" name="Expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Users table */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">User Overview</h3>
          </div>
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Transactions</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {normalUsers.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div style={{ fontWeight: 500, color: 'var(--text)' }}>{u.name}</div>
                      <div style={{ fontSize: '.75rem', color: 'var(--text-muted)' }}>{u.email}</div>
                    </td>
                    <td>{userTxnCounts[u.id] || 0}</td>
                    <td>
                      <span className={`badge ${u.isActive ? 'badge-income' : 'badge-expense'}`}>
                        {u.isActive ? '● Active' : '○ Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
                {normalUsers.length === 0 && (
                  <tr><td colSpan={3} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '1.5rem' }}>No users yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Recent transactions */}
      <div className="card">
        <div className="card-header"><h3 className="card-title">Recent Transactions (All Users)</h3></div>
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>User</th>
                <th>Type</th>
                <th>Description</th>
                <th>Category</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {recentTxns.map((t) => {
                const u = users.find((u) => u.id === t.userId);
                return (
                  <tr key={t.id}>
                    <td style={{ whiteSpace: 'nowrap' }}>{formatDate(t.date)}</td>
                    <td style={{ fontSize: '.8125rem' }}>{u?.name || 'Unknown'}</td>
                    <td>
                      <span className={`badge ${t.type === 'income' ? 'badge-income' : 'badge-expense'}`}>{t.type}</span>
                    </td>
                    <td style={{ maxWidth: 160 }}>
                      <span className="truncate">{t.description || '-'}</span>
                    </td>
                    <td>{t.category}</td>
                    <td style={{ fontWeight: 600, color: t.type === 'income' ? 'var(--success)' : 'var(--danger)' }}>
                      {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                    </td>
                  </tr>
                );
              })}
              {recentTxns.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '1.5rem' }}>No transactions yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
