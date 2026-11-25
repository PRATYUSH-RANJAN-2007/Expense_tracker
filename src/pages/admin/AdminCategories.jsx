import { useState } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { generateId } from '../../utils/helpers';
import toast from 'react-hot-toast';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Modal from '../../components/ui/Modal';

const CATEGORY_TYPES = [
  { value: 'both', label: 'Both (Income & Expense)' },
  { value: 'income', label: 'Income only' },
  { value: 'expense', label: 'Expense only' },
];

const ICONS = ['🍕','🚗','🛍️','💡','🎬','💊','📚','✈️','💼','💻','📈','📦','🏠','🎮','🎵','🏋️','🛒','🍔','☕','📱'];

function CategoryForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState({
    name: initial?.name || '',
    icon: initial?.icon || '📦',
    type: initial?.type || 'both',
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required.';
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length) return;
    onSave({ ...form, name: form.name.trim() });
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="form-group">
        <label className="form-label">Category Name <span className="required">*</span></label>
        <input type="text" className={`form-control ${errors.name ? 'error' : ''}`} placeholder="e.g. Groceries" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        {errors.name && <div className="form-error">⚠️ {errors.name}</div>}
      </div>
      <div className="form-group">
        <label className="form-label">Icon</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem' }}>
          {ICONS.map((icon) => (
            <button
              key={icon}
              type="button"
              onClick={() => setForm({ ...form, icon })}
              style={{
                width: 36, height: 36,
                border: `2px solid ${form.icon === icon ? 'var(--primary)' : 'var(--border)'}`,
                borderRadius: 8,
                background: form.icon === icon ? 'var(--primary-light)' : 'transparent',
                cursor: 'pointer',
                fontSize: '1.125rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >{icon}</button>
          ))}
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Type</label>
        <select className="form-control" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
          {CATEGORY_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      </div>
      <div className="modal-footer" style={{ padding: '1rem 0 0', border: 'none' }}>
        <button type="button" className="btn btn-outline" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn btn-primary">{initial ? 'Update' : 'Add'} Category</button>
      </div>
    </form>
  );
}

export default function AdminCategories() {
  const { getCategories, addCategory, editCategory, removeCategory, getAllTransactions } = useData();
  const categories = getCategories();
  const allTxns = getAllTransactions();

  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const handleSave = (data) => {
    if (editItem) {
      editCategory({ ...editItem, ...data, updatedAt: new Date().toISOString() });
      toast.success('Category updated!');
    } else {
      addCategory({ id: generateId(), ...data, isDefault: false, createdAt: new Date().toISOString() });
      toast.success('Category added!');
    }
    setShowForm(false);
    setEditItem(null);
  };

  const handleDelete = () => {
    const usedInTxn = allTxns.some((t) => {
      const cat = categories.find((c) => c.id === deleteId);
      return cat && t.category === cat.name;
    });
    if (usedInTxn) {
      toast.error('Cannot delete category used in transactions.');
      setDeleteId(null);
      return;
    }
    removeCategory(deleteId);
    setDeleteId(null);
    toast.success('Category deleted.');
  };

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">Category Management</h1>
          <p className="page-subtitle">{categories.length} categories</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditItem(null); setShowForm(true); }}>
          <Plus size={16} /> Add Category
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
        {categories.map((c) => {
          const usageCount = allTxns.filter((t) => t.category === c.name).length;
          return (
            <div key={c.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '.625rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>{c.icon}</span>
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--text)' }}>{c.name}</div>
                    <div style={{ fontSize: '.75rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{c.type}</div>
                  </div>
                </div>
                {!c.isDefault && (
                  <div style={{ display: 'flex', gap: '.25rem' }}>
                    <button className="btn btn-ghost btn-icon btn-sm" onClick={() => { setEditItem(c); setShowForm(true); }}><Edit size={13} /></button>
                    <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setDeleteId(c.id)} style={{ color: 'var(--danger)' }}><Trash2 size={13} /></button>
                  </div>
                )}
                {c.isDefault && (
                  <span className="badge badge-neutral" style={{ fontSize: '.6875rem' }}>Default</span>
                )}
              </div>
              <div style={{ marginTop: '.75rem', fontSize: '.8125rem', color: 'var(--text-muted)' }}>
                Used in {usageCount} transaction{usageCount !== 1 ? 's' : ''}
              </div>
            </div>
          );
        })}
      </div>

      {showForm && (
        <Modal title={editItem ? 'Edit Category' : 'New Category'} onClose={() => { setShowForm(false); setEditItem(null); }}>
          <CategoryForm initial={editItem} onSave={handleSave} onCancel={() => { setShowForm(false); setEditItem(null); }} />
        </Modal>
      )}

      {deleteId && (
        <ConfirmDialog
          title="Delete Category"
          message="Delete this category? Categories used in transactions cannot be deleted."
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
          danger
        />
      )}
    </div>
  );
}
