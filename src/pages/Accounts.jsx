import { useState, useMemo } from 'react';
import { Plus, Edit, Trash2, CreditCard, Landmark, PiggyBank, Wallet } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { generateId, formatCurrency, calculateBalance } from '../utils/helpers';

import toast from 'react-hot-toast';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import Modal from '../components/ui/Modal';

const ACCOUNT_TYPES = [
  { value: 'bank', label: 'Bank Account', icon: Landmark },
  { value: 'cash', label: 'Cash', icon: Wallet },
  { value: 'savings', label: 'Savings', icon: PiggyBank },
  { value: 'credit', label: 'Credit Card', icon: CreditCard },
  { value: 'wallet', label: 'Wallet', icon: Wallet },
];

function AccountForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState({
    name: initial?.name || '',
    type: initial?.type || 'bank',
    openingBalance: initial?.openingBalance ?? 0,
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Account name is required.';
    if (form.openingBalance === '' || isNaN(form.openingBalance)) errs.openingBalance = 'Enter a valid amount.';
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length) return;
    onSave({ ...form, name: form.name.trim(), openingBalance: Number(form.openingBalance) });
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="form-group">
        <label className="form-label">Account Name <span className="required">*</span></label>
        <input type="text" className={`form-control ${errors.name ? 'error' : ''}`} placeholder="e.g. HDFC Savings" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        {errors.name && <div className="form-error">⚠️ {errors.name}</div>}
      </div>
      <div className="form-group">
        <label className="form-label">Account Type</label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '.5rem' }}>
          {ACCOUNT_TYPES.map(({ value, label }) => (
            <button key={value} type="button"
              onClick={() => setForm({ ...form, type: value })}
              style={{
                padding: '.5rem',
                border: `2px solid ${form.type === value ? 'var(--primary)' : 'var(--border)'}`,
                background: form.type === value ? 'var(--primary-light)' : 'transparent',
                color: form.type === value ? 'var(--primary)' : 'var(--text-muted)',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                fontSize: '.8125rem',
                fontWeight: 500,
                fontFamily: 'inherit',
                transition: 'all .15s',
              }}
            >{label}</button>
          ))}
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Opening Balance (₹)</label>
        <input type="number" step="0.01" className={`form-control ${errors.openingBalance ? 'error' : ''}`} placeholder="0.00" value={form.openingBalance} onChange={(e) => setForm({ ...form, openingBalance: e.target.value })} />
        {errors.openingBalance && <div className="form-error">⚠️ {errors.openingBalance}</div>}
        <div className="form-hint">The initial balance when you started tracking this account.</div>
      </div>
      <div className="modal-footer" style={{ padding: '1rem 0 0', border: 'none' }}>
        <button type="button" className="btn btn-outline" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn btn-primary">{initial ? 'Update' : 'Create'} Account</button>
      </div>
    </form>
  );
}

export default function Accounts() {
  const { user } = useAuth();
  const { getUserAccounts, addAccount, editAccount, removeAccount, getUserTransactions } = useData();

  const accounts = getUserAccounts();
  const transactions = getUserTransactions();

  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const accountsWithBalance = useMemo(() =>
    accounts.map((a) => ({
      ...a,
      balance: calculateBalance(a, transactions),
      txnCount: transactions.filter((t) => t.accountId === a.id).length,
    })),
  [accounts, transactions]);

  const totalBalance = accountsWithBalance.reduce((acc, a) => acc + a.balance, 0);

  const handleSave = (data) => {
    if (editItem) {
      editAccount({ ...editItem, ...data, updatedAt: new Date().toISOString() });
      toast.success('Account updated!');
    } else {
      addAccount({ id: generateId(), userId: user.id, ...data, createdAt: new Date().toISOString() });
      toast.success('Account created!');
    }
    setShowForm(false);
    setEditItem(null);
  };

  const handleDelete = () => {
    const hasTransactions = transactions.some((t) => t.accountId === deleteId);
    if (hasTransactions) {
      toast.error('Cannot delete account with existing transactions. Please delete or move transactions first.');
      setDeleteId(null);
      return;
    }
    removeAccount(deleteId);
    setDeleteId(null);
    toast.success('Account deleted.');
  };

  const getAccountIcon = (type) => {
    const found = ACCOUNT_TYPES.find((t) => t.value === type);
    const Icon = found?.icon || CreditCard;
    return <Icon size={20} color="var(--primary)" />;
  };

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">Accounts</h1>
          <p className="page-subtitle">Manage your financial accounts</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditItem(null); setShowForm(true); }}>
          <Plus size={16} /> New Account
        </button>
      </div>

      {/* Total balance */}
      <div className="card" style={{ marginBottom: '1.5rem', background: 'linear-gradient(135deg, var(--primary) 0%, #4f46e5 100%)', color: '#fff', border: 'none' }}>
        <div style={{ fontSize: '.875rem', opacity: .8, marginBottom: '.5rem' }}>Total Balance Across All Accounts</div>
        <div style={{ fontSize: '2.5rem', fontWeight: 800 }}>{formatCurrency(totalBalance)}</div>
        <div style={{ fontSize: '.875rem', opacity: .7, marginTop: '.5rem' }}>{accounts.length} account{accounts.length !== 1 ? 's' : ''}</div>
      </div>

      {/* Account cards */}
      {accountsWithBalance.length > 0 ? (
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
          {accountsWithBalance.map((a) => (
            <div key={a.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', gap: '.75rem', alignItems: 'center' }}>
                  <div style={{ width: 44, height: 44, background: 'var(--primary-light)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {getAccountIcon(a.type)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--text)' }}>{a.name}</div>
                    <div style={{ fontSize: '.75rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{a.type}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '.25rem' }}>
                  <button className="btn btn-ghost btn-icon btn-sm" onClick={() => { setEditItem(a); setShowForm(true); }}><Edit size={14} /></button>
                  <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setDeleteId(a.id)} style={{ color: 'var(--danger)' }}><Trash2 size={14} /></button>
                </div>
              </div>

              <div style={{ marginTop: '1.25rem' }}>
                <div style={{ fontSize: '.75rem', color: 'var(--text-muted)' }}>Current Balance</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: a.balance >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                  {formatCurrency(a.balance)}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)', fontSize: '.8125rem', color: 'var(--text-muted)' }}>
                <span>Opening: {formatCurrency(a.openingBalance)}</span>
                <span>{a.txnCount} transaction{a.txnCount !== 1 ? 's' : ''}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">🏦</div>
            <h3>No accounts yet</h3>
            <p>Add your bank accounts, cash, credit cards, and more to track balances.</p>
            <button className="btn btn-primary" onClick={() => setShowForm(true)} style={{ marginTop: '.5rem' }}>
              <Plus size={16} /> Create Account
            </button>
          </div>
        </div>
      )}

      {showForm && (
        <Modal title={editItem ? 'Edit Account' : 'New Account'} onClose={() => { setShowForm(false); setEditItem(null); }}>
          <AccountForm initial={editItem} onSave={handleSave} onCancel={() => { setShowForm(false); setEditItem(null); }} />
        </Modal>
      )}

      {deleteId && (
        <ConfirmDialog
          title="Delete Account"
          message="Are you sure? Accounts with transactions cannot be deleted. This action is permanent."
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
          danger
        />
      )}
    </div>
  );
}
