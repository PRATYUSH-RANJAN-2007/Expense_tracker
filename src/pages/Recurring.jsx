import { useState, useMemo } from 'react';
import { Plus, Edit, Trash2, Bell, RefreshCw, AlertCircle } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { generateId, formatCurrency, formatDate, computeNextDue, todayISO } from '../utils/helpers';

import { differenceInDays, parseISO } from 'date-fns';
import toast from 'react-hot-toast';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import Modal from '../components/ui/Modal';

const FREQUENCIES = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' },
];

function RecurringForm({ initial, accounts, categories, onSave, onCancel }) {
  const [form, setForm] = useState({
    name: initial?.name || '',
    amount: initial?.amount || '',
    category: initial?.category || '',
    accountId: initial?.accountId || (accounts[0]?.id || ''),
    frequency: initial?.frequency || 'monthly',
    nextDue: initial?.nextDue || todayISO(),
    description: initial?.description || '',
    isActive: initial?.isActive ?? true,
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required.';
    if (!form.amount || isNaN(form.amount) || Number(form.amount) <= 0) errs.amount = 'Enter valid amount.';
    if (!form.category) errs.category = 'Select category.';
    if (!form.accountId) errs.accountId = 'Select account.';
    if (!form.nextDue) errs.nextDue = 'Next due date is required.';
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length) return;
    onSave({ ...form, name: form.name.trim(), amount: Number(form.amount) });
  };

  const expenseCategories = categories.filter((c) => c.type === 'expense' || c.type === 'both');

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="form-group">
        <label className="form-label">Name <span className="required">*</span></label>
        <input type="text" className={`form-control ${errors.name ? 'error' : ''}`} placeholder="e.g. Netflix, Rent" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        {errors.name && <div className="form-error">⚠️ {errors.name}</div>}
      </div>
      <div className="grid grid-2">
        <div className="form-group">
          <label className="form-label">Amount (₹) <span className="required">*</span></label>
          <input type="number" min="0.01" step="0.01" className={`form-control ${errors.amount ? 'error' : ''}`} placeholder="0.00" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
          {errors.amount && <div className="form-error">⚠️ {errors.amount}</div>}
        </div>
        <div className="form-group">
          <label className="form-label">Frequency</label>
          <select className="form-control" value={form.frequency} onChange={(e) => setForm({ ...form, frequency: e.target.value })}>
            {FREQUENCIES.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
          </select>
        </div>
      </div>
      <div className="grid grid-2">
        <div className="form-group">
          <label className="form-label">Category <span className="required">*</span></label>
          <select className={`form-control ${errors.category ? 'error' : ''}`} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            <option value="">Select</option>
            {expenseCategories.map((c) => <option key={c.id} value={c.name}>{c.icon} {c.name}</option>)}
          </select>
          {errors.category && <div className="form-error">⚠️ {errors.category}</div>}
        </div>
        <div className="form-group">
          <label className="form-label">Account <span className="required">*</span></label>
          <select className={`form-control ${errors.accountId ? 'error' : ''}`} value={form.accountId} onChange={(e) => setForm({ ...form, accountId: e.target.value })}>
            <option value="">Select</option>
            {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
          {errors.accountId && <div className="form-error">⚠️ {errors.accountId}</div>}
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Next Due Date <span className="required">*</span></label>
        <input type="date" className={`form-control ${errors.nextDue ? 'error' : ''}`} value={form.nextDue} onChange={(e) => setForm({ ...form, nextDue: e.target.value })} />
        {errors.nextDue && <div className="form-error">⚠️ {errors.nextDue}</div>}
      </div>
      <div className="form-group">
        <label className="form-label">Description</label>
        <input type="text" className="form-control" placeholder="Optional description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      </div>
      <div className="form-group">
        <label style={{ display: 'flex', alignItems: 'center', gap: '.5rem', cursor: 'pointer', fontSize: '.875rem', fontWeight: 500, color: 'var(--text)' }}>
          <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} style={{ width: 16, height: 16 }} />
          Active
        </label>
      </div>
      <div className="modal-footer" style={{ padding: '1rem 0 0', border: 'none' }}>
        <button type="button" className="btn btn-outline" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn btn-primary">{initial ? 'Update' : 'Create'} Recurring</button>
      </div>
    </form>
  );
}

export default function Recurring() {
  const { user } = useAuth();
  const { getUserRecurring, addRecurring, editRecurring, removeRecurring, getUserAccounts, getCategories } = useData();

  const recurring = getUserRecurring();
  const accounts = getUserAccounts();
  const categories = getCategories();

  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const today = todayISO();

  const enriched = useMemo(() =>
    recurring.map((r) => {
      const daysUntil = differenceInDays(parseISO(r.nextDue), parseISO(today));
      return { ...r, daysUntil };
    }).sort((a, b) => a.daysUntil - b.daysUntil),
  [recurring, today]);

  const upcoming = enriched.filter((r) => r.isActive && r.daysUntil <= 7 && r.daysUntil >= 0);
  const overdue = enriched.filter((r) => r.isActive && r.daysUntil < 0);

  const handleSave = (data) => {
    if (editItem) {
      editRecurring({ ...editItem, ...data, updatedAt: new Date().toISOString() });
      toast.success('Recurring expense updated!');
    } else {
      addRecurring({ id: generateId(), userId: user.id, ...data, createdAt: new Date().toISOString() });
      toast.success('Recurring expense created!');
    }
    setShowForm(false);
    setEditItem(null);
  };

  const accountMap = useMemo(() => {
    const m = {};
    accounts.forEach((a) => { m[a.id] = a.name; });
    return m;
  }, [accounts]);

  const getDaysLabel = (days) => {
    if (days < 0) return <span style={{ color: 'var(--danger)', fontWeight: 600 }}>Overdue by {Math.abs(days)} day{Math.abs(days) !== 1 ? 's' : ''}</span>;
    if (days === 0) return <span style={{ color: 'var(--warning)', fontWeight: 600 }}>Due today</span>;
    if (days <= 7) return <span style={{ color: 'var(--warning)', fontWeight: 600 }}>In {days} day{days !== 1 ? 's' : ''}</span>;
    return <span style={{ color: 'var(--text-muted)' }}>In {days} days</span>;
  };

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">Recurring Expenses</h1>
          <p className="page-subtitle">Track subscriptions and regular payments</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditItem(null); setShowForm(true); }}>
          <Plus size={16} /> New Recurring
        </button>
      </div>

      {/* Reminders */}
      {(overdue.length > 0 || upcoming.length > 0) && (
        <div style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
          {overdue.length > 0 && (
            <div style={{ background: 'var(--danger-light)', border: '1px solid #fca5a5', borderRadius: 'var(--radius-sm)', padding: '1rem', display: 'flex', gap: '.75rem', alignItems: 'flex-start' }}>
              <AlertCircle size={20} color="var(--danger)" style={{ flexShrink: 0 }} />
              <div>
                <div style={{ fontWeight: 600, color: 'var(--danger)' }}>{overdue.length} Overdue Payment{overdue.length > 1 ? 's' : ''}</div>
                <div style={{ fontSize: '.8125rem', color: '#b91c1c' }}>{overdue.map((r) => r.name).join(', ')}</div>
              </div>
            </div>
          )}
          {upcoming.length > 0 && (
            <div style={{ background: 'var(--warning-light)', border: '1px solid #fcd34d', borderRadius: 'var(--radius-sm)', padding: '1rem', display: 'flex', gap: '.75rem', alignItems: 'flex-start' }}>
              <Bell size={20} color="var(--warning)" style={{ flexShrink: 0 }} />
              <div>
                <div style={{ fontWeight: 600, color: '#92400e' }}>Upcoming in 7 days</div>
                <div style={{ fontSize: '.8125rem', color: '#92400e' }}>{upcoming.map((r) => `${r.name} (${formatCurrency(r.amount)})`).join(', ')}</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Table */}
      {enriched.length > 0 ? (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Amount</th>
                  <th>Category</th>
                  <th>Account</th>
                  <th>Frequency</th>
                  <th>Next Due</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {enriched.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <div style={{ fontWeight: 500, color: 'var(--text)' }}>{r.name}</div>
                      {r.description && <div style={{ fontSize: '.75rem', color: 'var(--text-muted)' }}>{r.description}</div>}
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--danger)' }}>{formatCurrency(r.amount)}</td>
                    <td>{r.category}</td>
                    <td>{accountMap[r.accountId] || '-'}</td>
                    <td style={{ textTransform: 'capitalize' }}>{r.frequency}</td>
                    <td>
                      <div>{formatDate(r.nextDue)}</div>
                      <div style={{ fontSize: '.75rem' }}>{getDaysLabel(r.daysUntil)}</div>
                    </td>
                    <td>
                      <span className={`badge ${r.isActive ? 'badge-income' : 'badge-neutral'}`}>
                        {r.isActive ? '● Active' : '○ Inactive'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <button className="btn btn-ghost btn-icon btn-sm" onClick={() => { setEditItem(r); setShowForm(true); }}><Edit size={14} /></button>
                      <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setDeleteId(r.id)} style={{ color: 'var(--danger)' }}><Trash2 size={14} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">🔁</div>
            <h3>No recurring expenses</h3>
            <p>Add subscriptions, rent, EMIs, or other regular payments.</p>
            <button className="btn btn-primary" onClick={() => setShowForm(true)} style={{ marginTop: '.5rem' }}>
              <Plus size={16} /> Add Recurring
            </button>
          </div>
        </div>
      )}

      {showForm && (
        <Modal title={editItem ? 'Edit Recurring' : 'New Recurring Expense'} onClose={() => { setShowForm(false); setEditItem(null); }}>
          <RecurringForm initial={editItem} accounts={accounts} categories={categories} onSave={handleSave} onCancel={() => { setShowForm(false); setEditItem(null); }} />
        </Modal>
      )}

      {deleteId && (
        <ConfirmDialog
          title="Delete Recurring"
          message="Delete this recurring expense? This won't delete past transactions."
          onConfirm={() => { removeRecurring(deleteId); setDeleteId(null); toast.success('Deleted.'); }}
          onCancel={() => setDeleteId(null)}
          danger
        />
      )}
    </div>
  );
}
