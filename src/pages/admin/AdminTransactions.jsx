import { useState, useMemo } from 'react';
import { Search, Trash2, TrendingUp, TrendingDown, Filter, X } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { formatCurrency, formatDate } from '../../utils/helpers';
import toast from 'react-hot-toast';
import ConfirmDialog from '../../components/ui/ConfirmDialog';

export default function AdminTransactions() {
  const { getAllUsers, getAllTransactions, getAllAccounts, removeTransaction } = useData();

  const users = getAllUsers();
  const allTxns = getAllTransactions();
  const accounts = getAllAccounts();

  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterUser, setFilterUser] = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const [page, setPage] = useState(1);
  const PER_PAGE = 20;

  const userMap = useMemo(() => {
    const m = {};
    users.forEach((u) => { m[u.id] = u.name; });
    return m;
  }, [users]);

  const accountMap = useMemo(() => {
    const m = {};
    accounts.forEach((a) => { m[a.id] = a.name; });
    return m;
  }, [accounts]);

  const filtered = useMemo(() => {
    let list = [...allTxns];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((t) =>
        (t.description || '').toLowerCase().includes(q) ||
        (t.category || '').toLowerCase().includes(q)
      );
    }
    if (filterType !== 'all') list = list.filter((t) => t.type === filterType);
    if (filterUser) list = list.filter((t) => t.userId === filterUser);
    return list.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [allTxns, search, filterType, filterUser]);

  const paginated = useMemo(() => {
    const start = (page - 1) * PER_PAGE;
    return filtered.slice(start, start + PER_PAGE);
  }, [filtered, page]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);

  const normalUsers = users.filter((u) => u.role !== 'admin');

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">All Transactions</h1>
          <p className="page-subtitle">{filtered.length} of {allTxns.length} transactions</p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '1rem', padding: '1rem' }}>
        <div style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap' }}>
          <div className="search-bar" style={{ flex: '1 1 200px' }}>
            <Search size={16} color="var(--text-muted)" />
            <input placeholder="Search description or category…" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <select className="form-control" style={{ width: 'auto' }} value={filterType} onChange={(e) => { setFilterType(e.target.value); setPage(1); }}>
            <option value="all">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
          <select className="form-control" style={{ width: 'auto' }} value={filterUser} onChange={(e) => { setFilterUser(e.target.value); setPage(1); }}>
            <option value="">All Users</option>
            {normalUsers.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
          {(search || filterType !== 'all' || filterUser) && (
            <button className="btn btn-outline btn-sm" onClick={() => { setSearch(''); setFilterType('all'); setFilterUser(''); setPage(1); }}>
              <X size={14} /> Clear
            </button>
          )}
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {paginated.length > 0 ? (
          <>
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>User</th>
                    <th>Type</th>
                    <th>Description</th>
                    <th>Category</th>
                    <th>Account</th>
                    <th>Amount</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((t) => (
                    <tr key={t.id}>
                      <td style={{ whiteSpace: 'nowrap' }}>{formatDate(t.date)}</td>
                      <td style={{ fontSize: '.8125rem' }}>{userMap[t.userId] || 'Unknown'}</td>
                      <td>
                        <span className={`badge ${t.type === 'income' ? 'badge-income' : 'badge-expense'}`}>
                          {t.type === 'income' ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                          {t.type}
                        </span>
                      </td>
                      <td><span className="truncate" style={{ maxWidth: 150, display: 'block' }}>{t.description || '-'}</span></td>
                      <td>{t.category}</td>
                      <td>{accountMap[t.accountId] || '-'}</td>
                      <td style={{ fontWeight: 600, color: t.type === 'income' ? 'var(--success)' : 'var(--danger)', whiteSpace: 'nowrap' }}>
                        {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setDeleteId(t.id)} style={{ color: 'var(--danger)' }}>
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '.75rem 1.25rem', borderTop: '1px solid var(--border)' }}>
                <span style={{ fontSize: '.875rem', color: 'var(--text-muted)' }}>
                  Showing {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length}
                </span>
                <div style={{ display: 'flex', gap: '.25rem' }}>
                  <button className="btn btn-outline btn-sm" disabled={page === 1} onClick={() => setPage(page - 1)}>Prev</button>
                  <button className="btn btn-outline btn-sm" disabled={page === totalPages} onClick={() => setPage(page + 1)}>Next</button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <h3>No transactions found</h3>
            <p>Try adjusting your filters.</p>
          </div>
        )}
      </div>

      {deleteId && (
        <ConfirmDialog
          title="Delete Transaction"
          message="Permanently delete this transaction? This cannot be undone."
          onConfirm={() => { removeTransaction(deleteId); setDeleteId(null); toast.success('Transaction deleted.'); }}
          onCancel={() => setDeleteId(null)}
          danger
        />
      )}
    </div>
  );
}
