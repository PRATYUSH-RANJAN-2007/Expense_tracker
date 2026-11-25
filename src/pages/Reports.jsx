import { useState, useMemo } from 'react';
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import {
  formatCurrency, sumByType, filterByMonth,
  groupByCategory, getLastNMonths, getCategoryColor, groupByMonth,
  currentMonthYear, percent, exportToCSV, exportToJSON
} from '../utils/helpers';
import { Download } from 'lucide-react';
import { format } from 'date-fns';

export default function Reports() {
  const { user } = useAuth();
  const { getUserTransactions, getUserAccounts, getUserBudgets } = useData();

  const allTxns = getUserTransactions();
  const accounts = getUserAccounts();
  const budgets = getUserBudgets();
  const { month, year } = currentMonthYear();

  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterAccount, setFilterAccount] = useState('');
  const [filterType, setFilterType] = useState('all');

  // Apply filters
  const filtered = useMemo(() => {
    let list = [...allTxns];
    if (dateFrom) list = list.filter((t) => t.date >= dateFrom);
    if (dateTo) list = list.filter((t) => t.date <= dateTo);
    if (filterCategory) list = list.filter((t) => t.category === filterCategory);
    if (filterAccount) list = list.filter((t) => t.accountId === filterAccount);
    if (filterType !== 'all') list = list.filter((t) => t.type === filterType);
    return list;
  }, [allTxns, dateFrom, dateTo, filterCategory, filterAccount, filterType]);

  const totalIncome = useMemo(() => sumByType(filtered, 'income'), [filtered]);
  const totalExpense = useMemo(() => sumByType(filtered, 'expense'), [filtered]);

  // Category pie
  const expensesByCategory = useMemo(() => {
    const expenses = filtered.filter((t) => t.type === 'expense');
    const grouped = groupByCategory(expenses);
    return Object.entries(grouped)
      .map(([name, value], i) => ({ name, value, fill: getCategoryColor(name, i) }))
      .sort((a, b) => b.value - a.value);
  }, [filtered]);

  // Monthly bar data (last 6 months)
  const monthLabels = useMemo(() => getLastNMonths(6), []);
  const monthlyBarData = useMemo(() => {
    const grouped = groupByMonth(allTxns);
    return monthLabels.map((label) => ({
      month: label.split(' ')[0],
      income: grouped[label]?.income || 0,
      expense: grouped[label]?.expense || 0,
      net: (grouped[label]?.income || 0) - (grouped[label]?.expense || 0),
    }));
  }, [allTxns, monthLabels]);

  // Account distribution pie
  const accountData = useMemo(() => {
    return accounts.map((a) => {
      const txns = filtered.filter((t) => t.accountId === a.id);
      return {
        name: a.name,
        value: txns.reduce((acc, t) => acc + Number(t.amount), 0),
      };
    }).filter((d) => d.value > 0);
  }, [accounts, filtered]);

  // Budget utilization bar
  const budgetData = useMemo(() => {
    const monthTxns = filterByMonth(allTxns, month, year);
    return budgets
      .filter((b) => b.month === month && b.year === year)
      .map((b) => {
        const spent = monthTxns.filter((t) => t.type === 'expense' && t.category === b.category).reduce((acc, t) => acc + Number(t.amount), 0);
        return { name: b.category, budget: b.limit, spent };
      });
  }, [budgets, allTxns, month, year]);

  const categories = [...new Set(allTxns.map((t) => t.category))].sort();

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', boxShadow: 'var(--shadow-md)', fontSize: '.875rem' }}>
        <p style={{ fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>{label}</p>
        {payload.map((p) => (
          <p key={p.name} style={{ color: p.color || p.fill }}>{p.name}: {formatCurrency(p.value)}</p>
        ))}
      </div>
    );
  };

  const PieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent: pct, name }) => {
    if (pct < 0.05) return null;
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
      <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600}>
        {`${(pct * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">Reports & Analytics</h1>
          <p className="page-subtitle">Financial insights and spending patterns</p>
        </div>
        <div style={{ display: 'flex', gap: '.5rem' }}>
          <button className="btn btn-outline btn-sm" onClick={() => exportToCSV(filtered, accounts)}>
            <Download size={15} /> Export CSV
          </button>
          <button className="btn btn-outline btn-sm" onClick={() => exportToJSON(filtered)}>
            <Download size={15} /> Export JSON
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
        <div style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '.25rem' }}>
            <label style={{ fontSize: '.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>From Date</label>
            <input type="date" className="form-control" style={{ width: 'auto' }} value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '.25rem' }}>
            <label style={{ fontSize: '.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>To Date</label>
            <input type="date" className="form-control" style={{ width: 'auto' }} value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
          </div>
          <select className="form-control" style={{ width: 'auto' }} value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            <option value="all">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
          <select className="form-control" style={{ width: 'auto' }} value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
            <option value="">All Categories</option>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select className="form-control" style={{ width: 'auto' }} value={filterAccount} onChange={(e) => setFilterAccount(e.target.value)}>
            <option value="">All Accounts</option>
            {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
          {(dateFrom || dateTo || filterCategory || filterAccount || filterType !== 'all') && (
            <button className="btn btn-outline btn-sm" onClick={() => { setDateFrom(''); setDateTo(''); setFilterCategory(''); setFilterAccount(''); setFilterType('all'); }}>
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-3" style={{ marginBottom: '1.5rem', gap: '.75rem' }}>
        <div className="card" style={{ padding: '1rem', textAlign: 'center' }}>
          <div style={{ fontSize: '.75rem', color: 'var(--text-muted)', marginBottom: '.25rem' }}>Total Income</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--success)' }}>{formatCurrency(totalIncome)}</div>
        </div>
        <div className="card" style={{ padding: '1rem', textAlign: 'center' }}>
          <div style={{ fontSize: '.75rem', color: 'var(--text-muted)', marginBottom: '.25rem' }}>Total Expenses</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--danger)' }}>{formatCurrency(totalExpense)}</div>
        </div>
        <div className="card" style={{ padding: '1rem', textAlign: 'center' }}>
          <div style={{ fontSize: '.75rem', color: 'var(--text-muted)', marginBottom: '.25rem' }}>Net Savings</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: totalIncome - totalExpense >= 0 ? 'var(--success)' : 'var(--danger)' }}>
            {formatCurrency(totalIncome - totalExpense)}
          </div>
        </div>
      </div>

      {/* Charts grid */}
      <div className="grid grid-2" style={{ marginBottom: '1.5rem', gap: '1rem' }}>
        {/* Monthly bar chart */}
        <div className="card">
          <div className="card-header"><h3 className="card-title">Monthly Income vs Expenses</h3></div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={monthlyBarData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
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

        {/* Expense by category pie */}
        <div className="card">
          <div className="card-header"><h3 className="card-title">Expenses by Category</h3></div>
          {expensesByCategory.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={expensesByCategory} cx="50%" cy="50%" outerRadius={80} dataKey="value" labelLine={false} label={PieLabel}>
                    {expensesByCategory.map((e, i) => <Cell key={i} fill={e.fill} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem', marginTop: '.75rem' }}>
                {expensesByCategory.slice(0, 8).map((d) => (
                  <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: '.375rem', fontSize: '.8125rem' }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: d.fill, display: 'inline-block' }} />
                    <span style={{ color: 'var(--text-muted)' }}>{d.name}: {formatCurrency(d.value)}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="empty-state" style={{ padding: '2rem' }}>
              <p>No expense data for selected period.</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-2" style={{ gap: '1rem' }}>
        {/* Budget utilization */}
        <div className="card">
          <div className="card-header"><h3 className="card-title">Budget Utilization (This Month)</h3></div>
          {budgetData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={budgetData} layout="vertical" margin={{ top: 5, right: 10, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} width={80} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" iconSize={8} />
                <Bar dataKey="budget" name="Budget" fill="#6366f1" radius={[0, 4, 4, 0]} />
                <Bar dataKey="spent" name="Spent" fill="#f97316" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state" style={{ padding: '2rem' }}>
              <p>No budgets set for this month.</p>
            </div>
          )}
        </div>

        {/* Category breakdown table */}
        <div className="card">
          <div className="card-header"><h3 className="card-title">Top Expense Categories</h3></div>
          {expensesByCategory.length > 0 ? (
            <div>
              {expensesByCategory.map((d, i) => (
                <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: '.75rem', padding: '.5rem 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ width: 20, height: 20, borderRadius: '50%', background: d.fill, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '.6875rem', fontWeight: 700 }}>{i + 1}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.875rem' }}>
                      <span style={{ fontWeight: 500, color: 'var(--text)' }}>{d.name}</span>
                      <span style={{ fontWeight: 600, color: 'var(--danger)' }}>{formatCurrency(d.value)}</span>
                    </div>
                    <div className="progress" style={{ marginTop: '.375rem', height: 4 }}>
                      <div className="progress-bar danger" style={{ width: `${percent(d.value, totalExpense)}%`, background: d.fill }} />
                    </div>
                  </div>
                  <span style={{ fontSize: '.75rem', color: 'var(--text-muted)', width: 40, textAlign: 'right' }}>{percent(d.value, totalExpense)}%</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state" style={{ padding: '2rem' }}>
              <p>No expense data for selected period.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
