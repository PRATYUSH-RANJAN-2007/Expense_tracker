import { useState, useMemo } from 'react';
import { Plus, Edit, Trash2, AlertTriangle } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { generateId, formatCurrency, currentMonthYear, filterByMonth, percent } from '../utils/helpers';

import toast from 'react-hot-toast';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import Modal from '../components/ui/Modal';

function BudgetForm({ initial, categories, onSave, onCancel }) {
  const { month, year } = currentMonthYear();
  const [form, setForm] = useState({
    category: initial?.category || '',
    limit: initial?.limit || '',
    month: initial?.month || month,
    year: initial?.year || year,
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!form.category) errs.category = 'Select a category.';
    if (!form.limit || isNaN(form.limit) || Number(form.limit) <= 0) errs.limit = 'Enter valid limit.';
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length) return;
    onSave({ ...form, limit: Number(form.limit) });
  };

  const expenseCategories = categories.filter((c) => c.type === 'expense' || c.type === 'both');
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const years = [2023, 2024, 2025, 2026, 2027];

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="form-group">
        <label className="form-label">Category <span className="required">*</span></label>
        <select className={`form-control ${errors.category ? 'error' : ''}`} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
          <option value="">Select category</option>
          {expenseCategories.map((c) => <option key={c.id} value={c.name}>{c.icon} {c.name}</option>)}
        </select>
        {errors.category && <div className="form-error">⚠️ {errors.category}</div>}
      </div>
      <div className="form-group">
        <label className="form-label">Monthly Limit (₹) <span className="required">*</span></label>
        <input type="number" min="1" step="1" className={`form-control ${errors.limit ? 'error' : ''}`} placeholder="e.g. 5000" value={form.limit} onChange={(e) => setForm({ ...form, limit: e.target.value })} />
        {errors.limit && <div className="form-error">⚠️ {errors.limit}</div>}
      </div>
      <div className="grid grid-2">
        <div className="form-group">
          <label className="form-label">Month</label>
          <select className="form-control" value={form.month} onChange={(e) => setForm({ ...form, month: Number(e.target.value) })}>
            {months.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Year</label>
          <select className="form-control" value={form.year} onChange={(e) => setForm({ ...form, year: Number(e.target.value) })}>
            {years.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>
      <div className="modal-footer" style={{ padding: '1rem 0 0', border: 'none' }}>
        <button type="button" className="btn btn-outline" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn btn-primary">{initial ? 'Update' : 'Create'} Budget</button>
      </div>
    </form>
  );
}

export default function Budgets() {
  const { user } = useAuth();
  const { getUserBudgets, addBudget, editBudget, removeBudget, getUserTransactions, getCategories } = useData();
  const { month, year } = currentMonthYear();

  const allBudgets = getUserBudgets();
  const transactions = getUserTransactions();
  const categories = getCategories();

  const [filterMonth, setFilterMonth] = useState(month);
  const [filterYear, setFilterYear] = useState(year);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const monthTxns = useMemo(() => filterByMonth(transactions, filterMonth, filterYear), [transactions, filterMonth, filterYear]);

  const budgetsWithProgress = useMemo(() =>
    allBudgets
      .filter((b) => b.month === filterMonth && b.year === filterYear)
      .map((b) => {
        const spent = monthTxns
          .filter((t) => t.type === 'expense' && t.category === b.category)
          .reduce((acc, t) => acc + Number(t.amount), 0);
        const pct = percent(spent, b.limit);
        const remaining = b.limit - spent;
        return { ...b, spent, pct, remaining };
      }),
  [allBudgets, monthTxns, filterMonth, filterYear]);

  const handleSave = (data) => {
    if (editItem) {
      editBudget({ ...editItem, ...data, updatedAt: new Date().toISOString() });
      toast.success('Budget updated!');
    } else {
      addBudget({ id: generateId(), userId: user.id, ...data, createdAt: new Date().toISOString() });
      toast.success('Budget created!');
    }
    setShowForm(false);
    setEditItem(null);
  };

  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  const totalBudgeted = budgetsWithProgress.reduce((a, b) => a + b.limit, 0);
  const totalSpent = budgetsWithProgress.reduce((a, b) => a + b.spent, 0);

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">Budgets</h1>
          <p className="page-subtitle">Set monthly spending limits by category</p>
        </div>
        <div style={{ display: 'flex', gap: '.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <select className="form-control" style={{ width: 'auto' }} value={filterMonth} onChange={(e) => setFilterMonth(Number(e.target.value))}>
            {monthNames.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
          </select>
          <select className="form-control" style={{ width: 'auto' }} value={filterYear} onChange={(e) => setFilterYear(Number(e.target.value))}>
            {[2023, 2024, 2025, 2026, 2027].map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
          <button className="btn btn-primary" onClick={() => { setEditItem(null); setShowForm(true); }}>
            <Plus size={16} /> New Budget
          </button>
        </div>
      </div>

      {/* Overview */}
      {budgetsWithProgress.length > 0 && (
        <div className="grid grid-3" style={{ marginBottom: '1.5rem', gap: '.75rem' }}>
          <div className="card" style={{ padding: '1rem' }}>
            <div style={{ fontSize: '.75rem', color: 'var(--text-muted)', marginBottom: '.25rem' }}>Total Budgeted</div>
            <div style={{ fontWeight: 700, fontSize: '1.25rem' }}>{formatCurrency(totalBudgeted)}</div>
          </div>
          <div className="card" style={{ padding: '1rem' }}>
            <div style={{ fontSize: '.75rem', color: 'var(--text-muted)', marginBottom: '.25rem' }}>Total Spent</div>
            <div style={{ fontWeight: 700, fontSize: '1.25rem', color: 'var(--danger)' }}>{formatCurrency(totalSpent)}</div>
          </div>
          <div className="card" style={{ padding: '1rem' }}>
            <div style={{ fontSize: '.75rem', color: 'var(--text-muted)', marginBottom: '.25rem' }}>Total Remaining</div>
            <div style={{ fontWeight: 700, fontSize: '1.25rem', color: totalBudgeted - totalSpent >= 0 ? 'var(--success)' : 'var(--danger)' }}>
              {formatCurrency(totalBudgeted - totalSpent)}
            </div>
          </div>
        </div>
      )}

      {/* Budget cards */}
      {budgetsWithProgress.length > 0 ? (
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
          {budgetsWithProgress.map((b) => (
            <div key={b.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '.75rem' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--text)' }}>{b.category}</div>
                  <div style={{ fontSize: '.75rem', color: 'var(--text-muted)', marginTop: '.125rem' }}>
                    {monthNames[b.month - 1]} {b.year}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '.25rem' }}>
                  <button className="btn btn-ghost btn-icon btn-sm" onClick={() => { setEditItem(b); setShowForm(true); }}><Edit size={14} /></button>
                  <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setDeleteId(b.id)} style={{ color: 'var(--danger)' }}><Trash2 size={14} /></button>
                </div>
              </div>

              {/* Progress */}
              <div style={{ marginBottom: '.5rem' }}>
                <div className="progress">
                  <div
                    className={`progress-bar ${b.pct > 100 ? 'danger' : b.pct > 80 ? 'warning' : 'success'}`}
                    style={{ width: `${Math.min(b.pct, 100)}%` }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.8125rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Spent: <strong style={{ color: 'var(--text)' }}>{formatCurrency(b.spent)}</strong></span>
                <span style={{ color: 'var(--text-muted)' }}>Limit: <strong style={{ color: 'var(--text)' }}>{formatCurrency(b.limit)}</strong></span>
              </div>

              <div style={{ marginTop: '.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '.75rem', fontWeight: 600, color: b.pct > 100 ? 'var(--danger)' : b.pct > 80 ? 'var(--warning)' : 'var(--success)' }}>
                  {b.pct}% used
                </span>
                {b.pct > 100 ? (
                  <span className="badge badge-expense"><AlertTriangle size={10} /> Over budget</span>
                ) : b.pct > 80 ? (
                  <span className="badge badge-warning"><AlertTriangle size={10} /> Near limit</span>
                ) : (
                  <span className="badge badge-income">✓ On track</span>
                )}
              </div>

              {b.remaining < 0 && (
                <div style={{ marginTop: '.5rem', fontSize: '.8125rem', color: 'var(--danger)', fontWeight: 500 }}>
                  Overspent by {formatCurrency(Math.abs(b.remaining))}
                </div>
              )}
              {b.remaining >= 0 && (
                <div style={{ marginTop: '.5rem', fontSize: '.8125rem', color: 'var(--text-muted)' }}>
                  Remaining: {formatCurrency(b.remaining)}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">🎯</div>
            <h3>No budgets for this period</h3>
            <p>Set monthly spending limits to track your expenses better.</p>
            <button className="btn btn-primary" onClick={() => setShowForm(true)} style={{ marginTop: '.5rem' }}>
              <Plus size={16} /> Create Budget
            </button>
          </div>
        </div>
      )}

      {showForm && (
        <Modal title={editItem ? 'Edit Budget' : 'New Budget'} onClose={() => { setShowForm(false); setEditItem(null); }}>
          <BudgetForm initial={editItem} categories={categories} onSave={handleSave} onCancel={() => { setShowForm(false); setEditItem(null); }} />
        </Modal>
      )}

      {deleteId && (
        <ConfirmDialog
          title="Delete Budget"
          message="Are you sure you want to delete this budget? Your transactions will not be affected."
          onConfirm={() => { removeBudget(deleteId); setDeleteId(null); toast.success('Budget deleted.'); }}
          onCancel={() => setDeleteId(null)}
          danger
        />
      )}
    </div>
  );
}
