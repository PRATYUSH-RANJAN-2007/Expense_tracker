import { useState, useMemo } from 'react';
import { Search, UserCheck, UserX, Trash2, Eye } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { formatDate, formatCurrency, sumByType } from '../../utils/helpers';
import toast from 'react-hot-toast';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Modal from '../../components/ui/Modal';

function UserDetailModal({ user, transactions, onClose }) {
  const income = sumByType(transactions, 'income');
  const expense = sumByType(transactions, 'expense');
  return (
    <Modal title={`User: ${user.name}`} onClose={onClose} maxWidth={500}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Name', value: user.name },
          { label: 'Email', value: user.email },
          { label: 'Role', value: user.role },
          { label: 'Status', value: user.isActive ? '✅ Active' : '❌ Inactive' },
          { label: 'Member Since', value: formatDate(user.createdAt) },
          { label: 'Transactions', value: transactions.length },
          { label: 'Total Income', value: formatCurrency(income) },
          { label: 'Total Expenses', value: formatCurrency(expense) },
        ].map(({ label, value }) => (
          <div key={label} style={{ padding: '.75rem', background: 'var(--bg-hover)', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontSize: '.75rem', color: 'var(--text-muted)', marginBottom: '.125rem' }}>{label}</div>
            <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: '.9375rem' }}>{value}</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button className="btn btn-outline" onClick={onClose}>Close</button>
      </div>
    </Modal>
  );
}

export default function AdminUsers() {
  const { getAllUsers, getAllTransactions, updateUser, removeUser } = useData();

  const users = getAllUsers().filter((u) => u.role !== 'admin');
  const allTxns = getAllTransactions();

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewUser, setViewUser] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const filtered = useMemo(() => {
    let list = [...users];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
    }
    if (filterStatus !== 'all') list = list.filter((u) => String(u.isActive) === filterStatus);
    return list;
  }, [users, search, filterStatus]);

  const toggleActive = (u) => {
    updateUser({ ...u, isActive: !u.isActive });
    toast.success(`User ${u.isActive ? 'deactivated' : 'activated'}.`);
  };

  const handleDelete = () => {
    removeUser(deleteId);
    setDeleteId(null);
    toast.success('User deleted.');
  };

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle">{users.length} registered users</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: '1rem', padding: '1rem' }}>
        <div style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap' }}>
          <div className="search-bar" style={{ flex: '1 1 200px' }}>
            <Search size={16} color="var(--text-muted)" />
            <input placeholder="Search by name or email…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className="form-control" style={{ width: 'auto' }} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">All Users</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {filtered.length > 0 ? (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Member Since</th>
                  <th>Transactions</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => {
                  const txnCount = allTxns.filter((t) => t.userId === u.id).length;
                  return (
                    <tr key={u.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '.625rem' }}>
                          <div className="avatar avatar-sm" style={{ background: 'var(--primary)', color: '#fff' }}>
                            {u.name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 500, color: 'var(--text)' }}>{u.name}</div>
                            <div style={{ fontSize: '.75rem', color: 'var(--text-muted)' }}>{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>{formatDate(u.createdAt)}</td>
                      <td>{txnCount}</td>
                      <td>
                        <span className={`badge ${u.isActive ? 'badge-income' : 'badge-expense'}`}>
                          {u.isActive ? '● Active' : '○ Inactive'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <button
                          className="btn btn-ghost btn-icon btn-sm"
                          onClick={() => setViewUser(u)}
                          title="View details"
                        ><Eye size={14} /></button>
                        <button
                          className="btn btn-ghost btn-icon btn-sm"
                          onClick={() => toggleActive(u)}
                          title={u.isActive ? 'Deactivate' : 'Activate'}
                          style={{ color: u.isActive ? 'var(--warning)' : 'var(--success)' }}
                        >
                          {u.isActive ? <UserX size={14} /> : <UserCheck size={14} />}
                        </button>
                        <button
                          className="btn btn-ghost btn-icon btn-sm"
                          onClick={() => setDeleteId(u.id)}
                          title="Delete user"
                          style={{ color: 'var(--danger)' }}
                        ><Trash2 size={14} /></button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">👥</div>
            <h3>No users found</h3>
            <p>Try adjusting the search or filters.</p>
          </div>
        )}
      </div>

      {viewUser && (
        <UserDetailModal
          user={viewUser}
          transactions={allTxns.filter((t) => t.userId === viewUser.id)}
          onClose={() => setViewUser(null)}
        />
      )}

      {deleteId && (
        <ConfirmDialog
          title="Delete User"
          message="Permanently delete this user? Their data will also be lost."
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
          danger
        />
      )}
    </div>
  );
}
