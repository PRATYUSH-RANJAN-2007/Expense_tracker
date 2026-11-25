import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp, TrendingDown, Wallet, Target,
  ArrowUpRight, ArrowDownRight, CreditCard, AlertTriangle, Plus, BarChart3
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import {
  formatCurrency, formatDate, sumByType, filterByMonth,
  currentMonthYear, groupByCategory, getLastNMonths, getCategoryColor,
  calculateBalance, percent, groupByMonth
} from '../utils/helpers';
import { format, parseISO as parseDate } from 'date-fns';

export default function Dashboard() {
  const { user } = useAuth();
  const {
    getUserTransactions, getUserAccounts, getUserBudgets,
  } = useData();

  const transactions = getUserTransactions();
  const accounts = getUserAccounts();
  const budgets = getUserBudgets();
  const { month, year } = currentMonthYear();

  const thisMonthTxns = useMemo(() => filterByMonth(transactions, month, year), [transactions, month, year]);
  const totalIncome = useMemo(() => sumByType(thisMonthTxns, 'income'), [thisMonthTxns]);
  const totalExpense = useMemo(() => sumByType(thisMonthTxns, 'expense'), [thisMonthTxns]);
  const netBalance = useMemo(() =>
    accounts.reduce((acc, a) => acc + calculateBalance(a, transactions), 0),
  [accounts, transactions]);

  // Category breakdown for pie
  const expenseTxns = useMemo(() => thisMonthTxns.filter((t) => t.type === 'expense'), [thisMonthTxns]);
  const categoryData = useMemo(() => {
    const grouped = groupByCategory(expenseTxns);
    return Object.entries(grouped)
      .map(([name, value], i) => ({ name, value, fill: getCategoryColor(name, i) }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [expenseTxns]);

  // Monthly trend for area chart
  const monthLabels = useMemo(() => getLastNMonths(6), []);
  const monthlyData = useMemo(() => {
    const grouped = groupByMonth(transactions);
    return monthLabels.map((label) => ({
      month: label.split(' ')[0],
      income: grouped[label]?.income || 0,
      expense: grouped[label]?.expense || 0,
    }));
  }, [transactions, monthLabels]);

  // Budget progress
  const budgetProgress = useMemo(() =>
    budgets.slice(0, 5).map((b) => {
      const spent = thisMonthTxns
        .filter((t) => t.type === 'expense' && t.category === b.category)
        .reduce((acc, t) => acc + Number(t.amount), 0);
      const pct = percent(spent, b.limit);
      return { ...b, spent, pct };
    }),
  [budgets, thisMonthTxns]);

  // Recent transactions
  const recentTxns = useMemo(() =>
    [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 8),
  [transactions]);

  const accountBalances = useMemo(() =>
    accounts.map((a) => ({
      ...a,
      balance: calculateBalance(a, transactions),
    })),
  [accounts, transactions]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', boxShadow: 'var(--shadow-md)' }}>
        <p style={{ fontWeight: 600, marginBottom: 4, color: 'var(--text)' }}>{label}</p>
        {payload.map((p) => (
          <p key={p.name} style={{ color: p.color, fontSize: '.875rem' }}>
            {p.name}: {formatCurrency(p.value)}
          </p>
        ))}
      </div>
    );
  };

  const PieTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', boxShadow: 'var(--shadow-md)', fontSize: '.875rem' }}>
        <p style={{ fontWeight: 600, color: 'var(--text)' }}>{payload[0].name}</p>
        <p style={{ color: payload[0].fill }}>{formatCurrency(payload[0].value)}</p>
      </div>
    );
  };

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Hello, {user?.name?.split(' ')[0]} 👋 — {format(new Date(), 'EEEE, dd MMMM yyyy')}</p>
        </div>
        <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
          <Link to="/reports" className="btn btn-outline btn-sm">
            <BarChart3 size={15} /> Reports
          </Link>
          <Link to="/add-transaction" className="btn btn-primary btn-sm">
            <Plus size={15} /> Add Transaction
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-4" style={{ marginBottom: '1.5rem' }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--primary-light)' }}>
            <Wallet size={22} color="var(--primary)" />
          </div>
          <div className="stat-info">
            <div className="stat-label">Net Balance</div>
            <div className="stat-value" style={{ color: netBalance >= 0 ? 'var(--success)' : 'var(--danger)' }}>
              {formatCurrency(netBalance)}
            </div>
            <div className="stat-change text-muted">Across {accounts.length} accounts</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--success-light)' }}>
            <TrendingUp size={22} color="var(--success)" />
          </div>
          <div className="stat-info">
            <div className="stat-label">This Month Income</div>
            <div className="stat-value text-income">{formatCurrency(totalIncome)}</div>
            <div className="stat-change" style={{ color: 'var(--success)', fontSize: '.75rem' }}>
              <ArrowUpRight size={12} style={{ display: 'inline' }} /> Income
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--danger-light)' }}>
            <TrendingDown size={22} color="var(--danger)" />
          </div>
          <div className="stat-info">
            <div className="stat-label">This Month Expenses</div>
            <div className="stat-value text-expense">{formatCurrency(totalExpense)}</div>
            <div className="stat-change" style={{ color: 'var(--danger)', fontSize: '.75rem' }}>
              <ArrowDownRight size={12} style={{ display: 'inline' }} /> Expenses
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--warning-light)' }}>
            <Target size={22} color="var(--warning)" />
          </div>
          <div className="stat-info">
            <div className="stat-label">Savings This Month</div>
            <div className="stat-value" style={{ color: totalIncome - totalExpense >= 0 ? 'var(--success)' : 'var(--danger)' }}>
              {formatCurrency(totalIncome - totalExpense)}
            </div>
            <div className="stat-change text-muted">{thisMonthTxns.length} transactions</div>
          </div>
        </div>
      </div>

      {/* Charts row */}
      <div className="grid" style={{ gridTemplateColumns: '1fr 320px', marginBottom: '1.5rem', gap: '1rem' }}>
        {/* Area chart */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Income vs Expenses (6 Months)</h3>
          </div>
          {monthlyData.some((d) => d.income > 0 || d.expense > 0) ? (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={monthlyData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="gIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" iconSize={8} />
                <Area type="monotone" dataKey="income" name="Income" stroke="#22c55e" fill="url(#gIncome)" strokeWidth={2} dot={{ fill: '#22c55e', r: 3 }} />
                <Area type="monotone" dataKey="expense" name="Expense" stroke="#ef4444" fill="url(#gExpense)" strokeWidth={2} dot={{ fill: '#ef4444', r: 3 }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state" style={{ padding: '2rem' }}>
              <div className="empty-state-icon">📊</div>
              <p>No data yet. Add transactions to see your chart.</p>
            </div>
          )}
        </div>

        {/* Pie chart */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Expenses by Category</h3>
          </div>
          {categoryData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                    {categoryData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '.375rem', marginTop: '.5rem' }}>
                {categoryData.slice(0, 5).map((d) => (
                  <div key={d.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '.8125rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: d.fill, display: 'inline-block', flexShrink: 0 }} />
                      <span style={{ color: 'var(--text)' }}>{d.name}</span>
                    </div>
                    <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>{formatCurrency(d.value)}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="empty-state" style={{ padding: '2rem' }}>
              <div className="empty-state-icon">🥧</div>
              <p>No expenses this month.</p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        {/* Recent transactions */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Recent Transactions</h3>
            <a href="/transactions" style={{ fontSize: '.8125rem', color: 'var(--primary)' }}>View all</a>
          </div>
          {recentTxns.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
              {recentTxns.map((t) => (
                <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: '.75rem', padding: '.5rem 0', borderBottom: '1px solid var(--border)' }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 8,
                    background: t.type === 'income' ? 'var(--success-light)' : 'var(--danger-light)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    {t.type === 'income' ? <TrendingUp size={16} color="var(--success)" /> : <TrendingDown size={16} color="var(--danger)" />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '.875rem', fontWeight: 500, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.description || t.category}</div>
                    <div style={{ fontSize: '.75rem', color: 'var(--text-muted)' }}>{t.category} • {formatDate(t.date)}</div>
                  </div>
                  <div style={{ fontWeight: 600, fontSize: '.875rem', color: t.type === 'income' ? 'var(--success)' : 'var(--danger)', flexShrink: 0 }}>
                    {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">📝</div>
              <h3>No transactions yet</h3>
              <p>Add your first income or expense to get started.</p>
            </div>
          )}
        </div>

        {/* Budget + Accounts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Accounts */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Accounts</h3>
              <a href="/accounts" style={{ fontSize: '.8125rem', color: 'var(--primary)' }}>Manage</a>
            </div>
            {accountBalances.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
                {accountBalances.map((a) => (
                  <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '.5rem 0', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '.625rem' }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <CreditCard size={14} color="var(--primary)" />
                      </div>
                      <div>
                        <div style={{ fontSize: '.875rem', fontWeight: 500, color: 'var(--text)' }}>{a.name}</div>
                        <div style={{ fontSize: '.75rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{a.type}</div>
                      </div>
                    </div>
                    <div style={{ fontWeight: 600, color: a.balance >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                      {formatCurrency(a.balance)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state" style={{ padding: '1.5rem' }}>
                <p>No accounts yet. <a href="/accounts">Add one</a></p>
              </div>
            )}
          </div>

          {/* Budget progress */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Budget Overview</h3>
              <a href="/budgets" style={{ fontSize: '.8125rem', color: 'var(--primary)' }}>View all</a>
            </div>
            {budgetProgress.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '.875rem' }}>
                {budgetProgress.map((b) => (
                  <div key={b.id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.8125rem', marginBottom: '.25rem' }}>
                      <span style={{ fontWeight: 500, color: 'var(--text)' }}>{b.category}</span>
                      <span style={{ color: b.pct > 90 ? 'var(--danger)' : 'var(--text-muted)' }}>
                        {formatCurrency(b.spent)} / {formatCurrency(b.limit)}
                      </span>
                    </div>
                    <div className="progress">
                      <div
                        className={`progress-bar ${b.pct > 100 ? 'danger' : b.pct > 80 ? 'warning' : 'success'}`}
                        style={{ width: `${Math.min(b.pct, 100)}%` }}
                      />
                    </div>
                    {b.pct > 90 && (
                      <div style={{ fontSize: '.75rem', color: 'var(--danger)', marginTop: '.25rem', display: 'flex', alignItems: 'center', gap: '.25rem' }}>
                        <AlertTriangle size={12} /> {b.pct > 100 ? 'Over budget!' : 'Near limit!'}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state" style={{ padding: '1.5rem' }}>
                <p>No budgets set. <a href="/budgets">Create one</a></p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
