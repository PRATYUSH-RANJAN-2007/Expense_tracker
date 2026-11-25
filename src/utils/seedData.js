import { generateId } from './helpers';
import { KEYS, setData, getData } from './storage';

export const DEFAULT_CATEGORIES = [
  { id: 'cat-food', name: 'Food', icon: '🍕', type: 'both', isDefault: true },
  { id: 'cat-transport', name: 'Transport', icon: '🚗', type: 'both', isDefault: true },
  { id: 'cat-shopping', name: 'Shopping', icon: '🛍️', type: 'both', isDefault: true },
  { id: 'cat-bills', name: 'Bills', icon: '💡', type: 'expense', isDefault: true },
  { id: 'cat-entertainment', name: 'Entertainment', icon: '🎬', type: 'expense', isDefault: true },
  { id: 'cat-health', name: 'Health', icon: '💊', type: 'both', isDefault: true },
  { id: 'cat-education', name: 'Education', icon: '📚', type: 'both', isDefault: true },
  { id: 'cat-travel', name: 'Travel', icon: '✈️', type: 'both', isDefault: true },
  { id: 'cat-salary', name: 'Salary', icon: '💼', type: 'income', isDefault: true },
  { id: 'cat-freelance', name: 'Freelance', icon: '💻', type: 'income', isDefault: true },
  { id: 'cat-investment', name: 'Investment', icon: '📈', type: 'both', isDefault: true },
  { id: 'cat-other', name: 'Other', icon: '📦', type: 'both', isDefault: true },
];

export function seedInitialData() {
  if (getData(KEYS.INITIALIZED)) return;

  // Seed categories
  setData(KEYS.CATEGORIES, DEFAULT_CATEGORIES);

  // Create demo users
  const adminId = 'user-admin-001';
  const userId = 'user-demo-001';
  const adminAccId = 'acc-admin-bank';
  const userAccId1 = 'acc-user-bank';
  const userAccId2 = 'acc-user-cash';

  const users = [
    {
      id: adminId,
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'Admin@123',
      role: 'admin',
      avatar: null,
      createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
      isActive: true,
    },
    {
      id: userId,
      name: 'Demo User',
      email: 'user@example.com',
      password: 'User@123',
      role: 'user',
      avatar: null,
      createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
      isActive: true,
    },
  ];
  setData(KEYS.USERS, users);

  // Create demo accounts
  const accounts = [
    { id: adminAccId, userId: adminId, name: 'Admin Bank', type: 'bank', openingBalance: 50000, createdAt: new Date().toISOString() },
    { id: userAccId1, userId: userId, name: 'HDFC Bank', type: 'bank', openingBalance: 25000, createdAt: new Date().toISOString() },
    { id: userAccId2, userId: userId, name: 'Cash', type: 'cash', openingBalance: 5000, createdAt: new Date().toISOString() },
  ];
  setData(KEYS.ACCOUNTS, accounts);

  // Create demo transactions for user
  const now = new Date();
  const demoTxns = [
    { id: generateId(), userId, type: 'income', amount: 55000, category: 'Salary', accountId: userAccId1, date: fmtDate(now, -25), description: 'Monthly Salary', note: '', createdAt: new Date().toISOString() },
    { id: generateId(), userId, type: 'expense', amount: 3200, category: 'Food', accountId: userAccId1, date: fmtDate(now, -22), description: 'Grocery shopping', note: 'Big Bazaar', createdAt: new Date().toISOString() },
    { id: generateId(), userId, type: 'expense', amount: 1500, category: 'Transport', accountId: userAccId2, date: fmtDate(now, -20), description: 'Monthly metro pass', note: '', createdAt: new Date().toISOString() },
    { id: generateId(), userId, type: 'expense', amount: 2500, category: 'Bills', accountId: userAccId1, date: fmtDate(now, -18), description: 'Electricity bill', note: 'BESCOM', createdAt: new Date().toISOString() },
    { id: generateId(), userId, type: 'income', amount: 12000, category: 'Freelance', accountId: userAccId1, date: fmtDate(now, -15), description: 'Web design project', note: 'Client: TechCorp', createdAt: new Date().toISOString() },
    { id: generateId(), userId, type: 'expense', amount: 4500, category: 'Shopping', accountId: userAccId1, date: fmtDate(now, -12), description: 'Clothes shopping', note: 'Myntra', createdAt: new Date().toISOString() },
    { id: generateId(), userId, type: 'expense', amount: 800, category: 'Entertainment', accountId: userAccId2, date: fmtDate(now, -10), description: 'Movie tickets', note: 'PVR Cinemas', createdAt: new Date().toISOString() },
    { id: generateId(), userId, type: 'expense', amount: 1200, category: 'Health', accountId: userAccId1, date: fmtDate(now, -8), description: 'Doctor consultation', note: '', createdAt: new Date().toISOString() },
    { id: generateId(), userId, type: 'expense', amount: 2800, category: 'Food', accountId: userAccId2, date: fmtDate(now, -5), description: 'Restaurant dinners', note: '', createdAt: new Date().toISOString() },
    { id: generateId(), userId, type: 'income', amount: 5000, category: 'Investment', accountId: userAccId1, date: fmtDate(now, -3), description: 'Dividend received', note: 'Stocks', createdAt: new Date().toISOString() },
    { id: generateId(), userId, type: 'expense', amount: 999, category: 'Entertainment', accountId: userAccId1, date: fmtDate(now, -2), description: 'Netflix subscription', note: '', createdAt: new Date().toISOString() },
    { id: generateId(), userId, type: 'expense', amount: 650, category: 'Transport', accountId: userAccId2, date: fmtDate(now, -1), description: 'Fuel', note: 'Petrol', createdAt: new Date().toISOString() },
    // Previous month
    { id: generateId(), userId, type: 'income', amount: 55000, category: 'Salary', accountId: userAccId1, date: fmtDate(now, -55), description: 'Monthly Salary', note: '', createdAt: new Date().toISOString() },
    { id: generateId(), userId, type: 'expense', amount: 15000, category: 'Travel', accountId: userAccId1, date: fmtDate(now, -48), description: 'Goa trip', note: 'Family vacation', createdAt: new Date().toISOString() },
    { id: generateId(), userId, type: 'expense', amount: 3500, category: 'Food', accountId: userAccId2, date: fmtDate(now, -45), description: 'Monthly groceries', note: '', createdAt: new Date().toISOString() },
    { id: generateId(), userId, type: 'expense', amount: 2500, category: 'Bills', accountId: userAccId1, date: fmtDate(now, -42), description: 'Electricity bill', note: '', createdAt: new Date().toISOString() },
    { id: generateId(), userId, type: 'expense', amount: 1800, category: 'Education', accountId: userAccId1, date: fmtDate(now, -40), description: 'Online course', note: 'Udemy', createdAt: new Date().toISOString() },
  ];
  setData(KEYS.TRANSACTIONS, demoTxns);

  // Demo budgets
  const { month, year } = { month: now.getMonth() + 1, year: now.getFullYear() };
  const budgets = [
    { id: generateId(), userId, category: 'Food', limit: 6000, month, year, createdAt: new Date().toISOString() },
    { id: generateId(), userId, category: 'Transport', limit: 3000, month, year, createdAt: new Date().toISOString() },
    { id: generateId(), userId, category: 'Entertainment', limit: 2000, month, year, createdAt: new Date().toISOString() },
    { id: generateId(), userId, category: 'Shopping', limit: 5000, month, year, createdAt: new Date().toISOString() },
    { id: generateId(), userId, category: 'Bills', limit: 4000, month, year, createdAt: new Date().toISOString() },
  ];
  setData(KEYS.BUDGETS, budgets);

  // Demo recurring
  const recurring = [
    { id: generateId(), userId, name: 'Netflix', amount: 999, category: 'Entertainment', accountId: userAccId1, frequency: 'monthly', nextDue: fmtDate(now, 28), isActive: true, description: 'Streaming subscription', createdAt: new Date().toISOString() },
    { id: generateId(), userId, name: 'Metro Pass', amount: 1500, category: 'Transport', accountId: userAccId2, frequency: 'monthly', nextDue: fmtDate(now, 5), isActive: true, description: 'Monthly metro pass', createdAt: new Date().toISOString() },
    { id: generateId(), userId, name: 'Domain Renewal', amount: 850, category: 'Bills', accountId: userAccId1, frequency: 'yearly', nextDue: fmtDate(now, 180), isActive: true, description: 'Website domain', createdAt: new Date().toISOString() },
    { id: generateId(), userId, name: 'Gym Membership', amount: 1200, category: 'Health', accountId: userAccId1, frequency: 'monthly', nextDue: fmtDate(now, 10), isActive: false, description: 'Monthly gym fee', createdAt: new Date().toISOString() },
  ];
  setData(KEYS.RECURRING, recurring);

  setData(KEYS.INITIALIZED, true);
}

function fmtDate(base, offsetDays) {
  const d = new Date(base);
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}
