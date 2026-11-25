import { useState, useMemo, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, Edit, Trash2, Download, X, TrendingUp, TrendingDown } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { generateId, formatCurrency, formatDate, todayISO, exportToCSV, exportToJSON } from '../utils/helpers';
import toast from 'react-hot-toast';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import Modal from '../components/ui/Modal';
import TransactionForm from '../components/forms/TransactionForm';

export default function Transactions() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { getUserTransactions, addTransaction, editTransaction, removeTransaction, getUserAccounts, getCategories: getCats } = useData();

  const allTxns = getUserTransactions();
  const accounts = getUserAccounts();
  const categories = getCats();

  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterAccount, setFilterAccount] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [sortBy, setSortBy] = useState('date_desc');
  const [page, setPage] = useState(1);
  const PER_PAGE = 15;

  const [showForm, setShowForm] = useState(location.pathname === '/add-transaction');
  const [editTxn, setEditTxn] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    if (location.pathname === '/add-transaction') {
      setEditTxn(null);
      setShowForm(true);
    }
  }, [location.pathname]);

  const handleCloseForm = () => {
    setShowForm(false);
    setEditTxn(null);
    if (location.pathname === '/add-transaction') {
      navigate('/transactions', { replace: true });
    }
  };

  const filtered = useMemo(() => {
    let list = [...allTxns];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((t) =>
        (t.description || '').toLowerCase().includes(q) ||
        (t.category || '').toLowerCase().includes(q) ||
        (t.note || '').toLowerCase().includes(q)
      );
    }
    if (filterType !== 'all') list = list.filter((t) => t.type === filterType);
    if (filterCategory) list = list.filter((t) => t.category === filterCategory);
    if (filterAccount) list = list.filter((t) => t.accountId === filterAccount);
    if (filterDateFrom) list = list.filter((t) => t.date >= filterDateFrom);
    if (filterDateTo) list = list.filter((t) => t.date <= filterDateTo);

    switch (sortBy) {
      case 'date_asc': list.sort((a, b) => a.date.localeCompare(b.date)); break;
      case 'date_desc': list.sort((a, b) => b.date.localeCompare(a.date)); break;
      case 'amount_asc': list.sort((a, b) => a.amount - b.amount); break;
      case 'amount_desc': list.sort((a, b) => b.amount - a.amount); break;
    }
    return list;
  }, [allTxns, search, filterType, filterCategory, filterAccount, filterDateFrom, filterDateTo, sortBy]);

  const paginated = useMemo(() => {
    const start = (page - 1) * PER_PAGE;
    return filtered.slice(start, start + PER_PAGE);
  }, [filtered, page]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);

  const accountMap = useMemo(() => {
    const m = {};
    accounts.forEach((a) => { m[a.id] = a.name; });
    return m;
  }, [accounts]);

  const handleSave = (data) => {
    if (editTxn) {
      editTransaction({ ...editTxn, ...data, updatedAt: new Date().toISOString() });
      toast.success('Transaction updated!');
    } else {
      addTransaction({ id: generateId(), userId: user.id, ...data, createdAt: new Date().toISOString() });
      toast.success('Transaction added!');
    }
    handleCloseForm();
    setPage(1);
  };

  const handleDelete = () => {
    removeTransaction(deleteId);
    setDeleteId(null);
    toast.success('Transaction deleted.');
  };

  const clearFilters = () => {
    setSearch('');
    setFilterType('all');
    setFilterCategory('');
    setFilterAccount('');
    setFilterDateFrom('');
    setFilterDateTo('');
  };

  const hasFilters = search || filterType !== 'all' || filterCategory || filterAccount || filterDateFrom || filterDateTo;

  const totalIncome = filtered.filter((t) => t.type === 'income').reduce((a, t) => a + Number(t.amount), 0);
  const totalExpense = filtered.filter((t) => t.type === 'expense').reduce((a, t) => a + Number(t.amount), 0);

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">Transactions</h1>
          <p className="page-subtitle">{allTxns.length} total • {filtered.length} filtered</p>
        </div>
        <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
          <button className="btn btn-outline btn-sm" onClick={() => exportToCSV(filtered, accounts)}>
            <Download size={15} /> CSV
          </button>
          <button className="btn btn-outline btn-sm" onClick={() => exportToJSON(filtered)}>
            <Download size={15} /> JSON
          </button>
          <button className="btn btn-primary" onClick={() => { setEditTxn(null); setShowForm(true); }}>
            <Plus size={16} /> Add Transaction
          </button>
        </div>
      </div>

      {/* Summary row */}
      <div className="grid grid-3" style={{ marginBottom: '1rem', gap: '.75rem' }}>
        <div className="card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '.75rem' }}>
          <TrendingUp size={20} color="var(--success)" />
          <div>
            <div style={{ fontSize: '.75rem', color: 'var(--text-muted)' }}>Total Income</div>
            <div style={{ fontWeight: 700, color: 'var(--success)' }}>{formatCurrency(totalIncome)}</div>
          </div>
        </div>
        <div className="card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '.75rem' }}>
          <TrendingDown size={20} color="var(--danger)" />
          <div>
            <div style={{ fontSize: '.75rem', color: 'var(--text-muted)' }}>Total Expenses</div>
            <div style={{ fontWeight: 700, color: 'var(--danger)' }}>{formatCurrency(totalExpense)}</div>
          </div>
        </div>
        <div className="card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '.75rem' }}>
          <div style={{ width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {totalIncome - totalExpense >= 0 ? '📈' : '📉'}
          </div>
          <div>
            <div style={{ fontSize: '.75rem', color: 'var(--text-muted)' }}>Net</div>
            <div style={{ fontWeight: 700, color: totalIncome - totalExpense >= 0 ? 'var(--success)' : 'var(--danger)' }}>
              {formatCurrency(totalIncome - totalExpense)}
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: '1rem', padding: '1rem' }}>
        <div style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          {/* Search */}
          <div className="search-bar" style={{ flex: '1 1 200px' }}>
            <Search size={16} color="var(--text-muted)" />
            <input placeholder="Search transactions…" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
          </div>

          {/* Type */}
          <select className="form-control" style={{ width: 'auto' }} value={filterType} onChange={(e) => { setFilterType(e.target.value); setPage(1); }}>
            <option value="all">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>

          {/* Category */}
          <select className="form-control" style={{ width: 'auto' }} value={filterCategory} onChange={(e) => { setFilterCategory(e.target.value); setPage(1); }}>
            <option value="">All Categories</option>
            {categories.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
          </select>

          {/* Account */}
          <select className="form-control" style={{ width: 'auto' }} value={filterAccount} onChange={(e) => { setFilterAccount(e.target.value); setPage(1); }}>
            <option value="">All Accounts</option>
            {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>

          {/* Date range */}
          <input type="date" className="form-control" style={{ width: 'auto' }} value={filterDateFrom} onChange={(e) => { setFilterDateFrom(e.target.value); setPage(1); }} title="From date" />
          <input type="date" className="form-control" style={{ width: 'auto' }} value={filterDateTo} onChange={(e) => { setFilterDateTo(e.target.value); setPage(1); }} title="To date" />

          {/* Sort */}
          <select className="form-control" style={{ width: 'auto' }} value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="date_desc">Date ↓</option>
            <option value="date_asc">Date ↑</option>
            <option value="amount_desc">Amount ↓</option>
            <option value="amount_asc">Amount ↑</option>
          </select>

          {hasFilters && (
            <button className="btn btn-outline btn-sm" onClick={clearFilters}>
              <X size={14} /> Clear
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {paginated.length > 0 ? (
          <>
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Description</th>
                    <th>Category</th>
                    <th>Account</th>
                    <th>Amount</th>
                    <th>Note</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((t) => (
                    <tr key={t.id}>
                      <td style={{ whiteSpace: 'nowrap' }}>{formatDate(t.date)}</td>
                      <td>
                        <span className={`badge ${t.type === 'income' ? 'badge-income' : 'badge-expense'}`}>
                          {t.type === 'income' ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                          {t.type}
                        </span>
                      </td>
                      <td style={{ maxWidth: 180 }}>
                        <span className="truncate" title={t.description}>{t.description || '-'}</span>
                      </td>
                      <td>{t.category}</td>
                      <td>{accountMap[t.accountId] || '-'}</td>
                      <td style={{ fontWeight: 600, color: t.type === 'income' ? 'var(--success)' : 'var(--danger)', whiteSpace: 'nowrap' }}>
                        {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '.8125rem' }}>{t.note || '-'}</td>
                      <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <button className="btn btn-ghost btn-icon btn-sm" onClick={() => { setEditTxn(t); setShowForm(true); }} title="Edit">
                          <Edit size={15} />
                        </button>
                        <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setDeleteId(t.id)} title="Delete" style={{ color: 'var(--danger)' }}>
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '.75rem 1.25rem', borderTop: '1px solid var(--border)' }}>
                <span style={{ fontSize: '.875rem', color: 'var(--text-muted)' }}>
                  Showing {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length}
                </span>
                <div style={{ display: 'flex', gap: '.25rem' }}>
                  <button className="btn btn-outline btn-sm" disabled={page === 1} onClick={() => setPage(page - 1)}>Prev</button>
                  {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      className={`btn btn-sm ${p === page ? 'btn-primary' : 'btn-outline'}`}
                      onClick={() => setPage(p)}
                    >{p}</button>
                  ))}
                  <button className="btn btn-outline btn-sm" disabled={page === totalPages} onClick={() => setPage(page + 1)}>Next</button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="empty-state" style={{ padding: '3rem' }}>
            <div className="empty-state-icon">📋</div>
            <h3>No transactions found</h3>
            <p>{hasFilters ? 'Try adjusting your filters.' : 'Start by adding your first transaction.'}</p>
            {!hasFilters && (
              <button className="btn btn-primary" onClick={() => setShowForm(true)} style={{ marginTop: '.5rem' }}>
                <Plus size={16} /> Add Transaction
              </button>
            )}
          </div>
        )}
      </div>

      {/* Form modal */}
      {showForm && (
        <Modal title={editTxn ? 'Edit Transaction' : 'Add Transaction'} onClose={handleCloseForm}>
          <TransactionForm
            initial={editTxn}
            accounts={accounts}
            categories={categories}
            onSave={handleSave}
            onCancel={handleCloseForm}
          />
        </Modal>
      )}

      {/* Confirm delete */}
      {deleteId && (
        <ConfirmDialog
          title="Delete Transaction"
          message="Are you sure you want to delete this transaction? This action cannot be undone."
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
          danger
        />
      )}
    </div>
  );
}
