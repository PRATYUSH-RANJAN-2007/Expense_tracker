import { useState } from 'react';
import { todayISO } from '../../utils/helpers';

export default function TransactionForm({ initial, accounts, categories, onSave, onCancel }) {
  const [form, setForm] = useState({
    type: initial?.type || 'expense',
    amount: initial?.amount || '',
    category: initial?.category || '',
    accountId: initial?.accountId || (accounts[0]?.id || ''),
    date: initial?.date || todayISO(),
    description: initial?.description || '',
    note: initial?.note || '',
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!form.type) errs.type = 'Required';
    if (!form.amount || isNaN(form.amount) || Number(form.amount) <= 0) errs.amount = 'Enter a valid amount greater than 0.';
    if (!form.category) errs.category = 'Please select a category.';
    if (!form.accountId) errs.accountId = 'Please select an account.';
    if (!form.date) errs.date = 'Date is required.';
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length) return;
    onSave({ ...form, amount: Number(form.amount) });
  };

  const filteredCategories = categories.filter(
    (c) => c.type === 'both' || c.type === form.type
  );

  return (
    <form onSubmit={handleSubmit} noValidate>
      {accounts.length === 0 && (
        <div style={{ background: 'var(--warning-light)', color: '#92400e', border: '1px solid #fcd34d', borderRadius: 'var(--radius-sm)', padding: '.75rem', marginBottom: '1rem', fontSize: '.8125rem' }}>
          ⚠️ You have not created any accounts yet. Please create an account first in the <a href="/accounts" style={{ color: 'var(--primary)', fontWeight: 600 }}>Accounts</a> page.
        </div>
      )}

      {/* Type */}
      <div className="form-group">
        <label className="form-label">Type <span className="required">*</span></label>
        <div style={{ display: 'flex', gap: '.5rem' }}>
          {['income', 'expense'].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => { setForm({ ...form, type: t, category: '' }); }}
              style={{
                flex: 1,
                padding: '.625rem',
                borderRadius: 'var(--radius-sm)',
                border: `2px solid ${form.type === t ? (t === 'income' ? 'var(--success)' : 'var(--danger)') : 'var(--border)'}`,
                background: form.type === t ? (t === 'income' ? 'var(--success-light)' : 'var(--danger-light)') : 'transparent',
                color: form.type === t ? (t === 'income' ? 'var(--success)' : 'var(--danger)') : 'var(--text-muted)',
                fontWeight: 600,
                cursor: 'pointer',
                textTransform: 'capitalize',
                fontFamily: 'inherit',
                fontSize: '.875rem',
                transition: 'all .15s',
              }}
            >
              {t === 'income' ? '📈' : '📉'} {t}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-2">
        {/* Amount */}
        <div className="form-group">
          <label className="form-label">Amount <span className="required">*</span></label>
          <div className="input-group">
            <span className="input-icon" style={{ left: '.75rem' }}>₹</span>
            <input
              type="number"
              min="0.01"
              step="0.01"
              className={`form-control ${errors.amount ? 'error' : ''}`}
              style={{ paddingLeft: '2rem' }}
              placeholder="0.00"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
            />
          </div>
          {errors.amount && <div className="form-error">⚠️ {errors.amount}</div>}
        </div>

        {/* Date */}
        <div className="form-group">
          <label className="form-label">Date <span className="required">*</span></label>
          <input
            type="date"
            className={`form-control ${errors.date ? 'error' : ''}`}
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            max={todayISO()}
          />
          {errors.date && <div className="form-error">⚠️ {errors.date}</div>}
        </div>
      </div>

      <div className="grid grid-2">
        {/* Category */}
        <div className="form-group">
          <label className="form-label">Category <span className="required">*</span></label>
          <select
            className={`form-control ${errors.category ? 'error' : ''}`}
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          >
            <option value="">Select category</option>
            {filteredCategories.map((c) => (
              <option key={c.id} value={c.name}>{c.icon} {c.name}</option>
            ))}
          </select>
          {errors.category && <div className="form-error">⚠️ {errors.category}</div>}
        </div>

        {/* Account */}
        <div className="form-group">
          <label className="form-label">Account <span className="required">*</span></label>
          <select
            className={`form-control ${errors.accountId ? 'error' : ''}`}
            value={form.accountId}
            onChange={(e) => setForm({ ...form, accountId: e.target.value })}
          >
            <option value="">Select account</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
          {errors.accountId && <div className="form-error">⚠️ {errors.accountId}</div>}
        </div>
      </div>

      {/* Description */}
      <div className="form-group">
        <label className="form-label">Description</label>
        <input
          type="text"
          className="form-control"
          placeholder="What was this for?"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          maxLength={100}
        />
      </div>

      {/* Note */}
      <div className="form-group">
        <label className="form-label">Note <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span></label>
        <input
          type="text"
          className="form-control"
          placeholder="Additional notes"
          value={form.note}
          onChange={(e) => setForm({ ...form, note: e.target.value })}
          maxLength={200}
        />
      </div>

      <div className="modal-footer" style={{ padding: '1rem 0 0', margin: 0, border: 'none' }}>
        <button type="button" className="btn btn-outline" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={accounts.length === 0}>{initial ? 'Update' : 'Add'} Transaction</button>
      </div>
    </form>
  );
}
