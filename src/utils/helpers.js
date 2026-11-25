import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

// Generate UUID
export function generateId() {
  return crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

// Format currency
export function formatCurrency(amount, currency = 'INR') {
  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `₹${Number(amount).toFixed(2)}`;
  }
}

// Format date
export function formatDate(dateStr, fmt = 'dd MMM yyyy') {
  if (!dateStr) return '-';
  try {
    return format(typeof dateStr === 'string' ? parseISO(dateStr) : dateStr, fmt);
  } catch {
    return dateStr;
  }
}

// Today's ISO date string
export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

// Get current month/year
export function currentMonthYear() {
  const now = new Date();
  return { month: now.getMonth() + 1, year: now.getFullYear() };
}

// Filter transactions for a specific month/year
export function filterByMonth(transactions, month, year) {
  return transactions.filter((t) => {
    const d = parseISO(t.date);
    return d.getMonth() + 1 === month && d.getFullYear() === year;
  });
}

// Sum transactions by type
export function sumByType(transactions, type) {
  return transactions
    .filter((t) => t.type === type)
    .reduce((acc, t) => acc + Number(t.amount), 0);
}

// Group transactions by category
export function groupByCategory(transactions) {
  return transactions.reduce((acc, t) => {
    const key = t.category;
    if (!acc[key]) acc[key] = 0;
    acc[key] += Number(t.amount);
    return acc;
  }, {});
}

// Group transactions by month label "Jan 2025"
export function groupByMonth(transactions) {
  const map = {};
  transactions.forEach((t) => {
    const label = format(parseISO(t.date), 'MMM yyyy');
    if (!map[label]) map[label] = { income: 0, expense: 0 };
    if (t.type === 'income') map[label].income += Number(t.amount);
    else map[label].expense += Number(t.amount);
  });
  return map;
}

// Validate email
export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Calculate account balance
export function calculateBalance(account, transactions) {
  const related = transactions.filter((t) => t.accountId === account.id);
  const income = sumByType(related, 'income');
  const expense = sumByType(related, 'expense');
  return Number(account.openingBalance || 0) + income - expense;
}

// Export to CSV
export function exportToCSV(transactions, accounts) {
  const accountMap = {};
  accounts.forEach((a) => { accountMap[a.id] = a.name; });

  const headers = ['Date', 'Type', 'Amount', 'Category', 'Account', 'Description', 'Note'];
  const rows = transactions.map((t) => [
    t.date,
    t.type,
    t.amount,
    t.category,
    accountMap[t.accountId] || t.accountId || '-',
    t.description || '-',
    t.note || '-',
  ]);

  const csvContent = [headers, ...rows].map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `transactions_${todayISO()}.csv`);
  link.click();
  URL.revokeObjectURL(url);
}

// Export to JSON
export function exportToJSON(transactions) {
  const blob = new Blob([JSON.stringify(transactions, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `transactions_${todayISO()}.json`);
  link.click();
  URL.revokeObjectURL(url);
}

// Get last N months labels
export function getLastNMonths(n = 6) {
  const months = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    months.push(format(d, 'MMM yyyy'));
  }
  return months;
}

// Compute next due date for recurring
export function computeNextDue(lastDate, frequency) {
  const d = lastDate ? new Date(lastDate) : new Date();
  switch (frequency) {
    case 'weekly': d.setDate(d.getDate() + 7); break;
    case 'monthly': d.setMonth(d.getMonth() + 1); break;
    case 'quarterly': d.setMonth(d.getMonth() + 3); break;
    case 'yearly': d.setFullYear(d.getFullYear() + 1); break;
    default: d.setMonth(d.getMonth() + 1);
  }
  return d.toISOString().slice(0, 10);
}

// Truncate text
export function truncate(str, n = 30) {
  if (!str) return '';
  return str.length > n ? str.slice(0, n) + '…' : str;
}

// Percentage
export function percent(value, total) {
  if (!total) return 0;
  return Math.min(100, Math.round((value / total) * 100));
}

// Category color map
export const CATEGORY_COLORS = {
  Food: '#f97316',
  Transport: '#3b82f6',
  Shopping: '#a855f7',
  Bills: '#ef4444',
  Entertainment: '#ec4899',
  Health: '#10b981',
  Education: '#6366f1',
  Travel: '#f59e0b',
  Salary: '#22c55e',
  Freelance: '#14b8a6',
  Investment: '#8b5cf6',
  Other: '#6b7280',
};

export const DEFAULT_COLORS = [
  '#6366f1','#f97316','#22c55e','#ef4444','#f59e0b',
  '#3b82f6','#ec4899','#14b8a6','#8b5cf6','#a855f7',
];

export function getCategoryColor(category, index = 0) {
  return CATEGORY_COLORS[category] || DEFAULT_COLORS[index % DEFAULT_COLORS.length];
}
