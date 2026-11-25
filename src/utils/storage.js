// LocalStorage Data Layer
// All keys use the expenseTracker_ prefix for namespacing

export const KEYS = {
  USERS: 'expenseTracker_users',
  SESSION: 'expenseTracker_session',
  TRANSACTIONS: 'expenseTracker_transactions',
  ACCOUNTS: 'expenseTracker_accounts',
  BUDGETS: 'expenseTracker_budgets',
  CATEGORIES: 'expenseTracker_categories',
  RECURRING: 'expenseTracker_recurring',
  SETTINGS: 'expenseTracker_settings',
  INITIALIZED: 'expenseTracker_initialized',
};

// Generic helpers
export function getData(key) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return null;
    return JSON.parse(raw);
  } catch {
    console.warn(`[storage] Failed to parse key "${key}", returning null.`);
    return null;
  }
}

export function setData(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`[storage] Failed to set key "${key}"`, e);
  }
}

export function updateData(key, updater) {
  const current = getData(key);
  const next = updater(current);
  setData(key, next);
  return next;
}

export function removeData(key) {
  localStorage.removeItem(key);
}

export function clearData() {
  Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
}

// --- Users ---
export function getUsers() { return getData(KEYS.USERS) || []; }
export function setUsers(users) { setData(KEYS.USERS, users); }
export function getUserById(id) { return getUsers().find((u) => u.id === id) || null; }
export function getUserByEmail(email) {
  return getUsers().find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
}
export function saveUser(user) {
  const users = getUsers();
  const idx = users.findIndex((u) => u.id === user.id);
  if (idx === -1) users.push(user); else users[idx] = user;
  setUsers(users);
}
export function deleteUser(id) { setUsers(getUsers().filter((u) => u.id !== id)); }

// --- Session ---
export function getSession() { return getData(KEYS.SESSION); }
export function setSession(session) { setData(KEYS.SESSION, session); }
export function clearSession() { removeData(KEYS.SESSION); }

// --- Transactions ---
export function getTransactions() { return getData(KEYS.TRANSACTIONS) || []; }
export function setTransactions(txns) { setData(KEYS.TRANSACTIONS, txns); }
export function getTransactionsByUser(userId) { return getTransactions().filter((t) => t.userId === userId); }
export function saveTransaction(txn) {
  const list = getTransactions();
  const idx = list.findIndex((t) => t.id === txn.id);
  if (idx === -1) list.push(txn); else list[idx] = txn;
  setTransactions(list);
}
export function deleteTransaction(id) { setTransactions(getTransactions().filter((t) => t.id !== id)); }

// --- Accounts ---
export function getAccounts() { return getData(KEYS.ACCOUNTS) || []; }
export function setAccounts(accs) { setData(KEYS.ACCOUNTS, accs); }
export function getAccountsByUser(userId) { return getAccounts().filter((a) => a.userId === userId); }
export function saveAccount(acc) {
  const list = getAccounts();
  const idx = list.findIndex((a) => a.id === acc.id);
  if (idx === -1) list.push(acc); else list[idx] = acc;
  setAccounts(list);
}
export function deleteAccount(id) { setAccounts(getAccounts().filter((a) => a.id !== id)); }

// --- Budgets ---
export function getBudgets() { return getData(KEYS.BUDGETS) || []; }
export function setBudgets(b) { setData(KEYS.BUDGETS, b); }
export function getBudgetsByUser(userId) { return getBudgets().filter((b) => b.userId === userId); }
export function saveBudget(budget) {
  const list = getBudgets();
  const idx = list.findIndex((b) => b.id === budget.id);
  if (idx === -1) list.push(budget); else list[idx] = budget;
  setBudgets(list);
}
export function deleteBudget(id) { setBudgets(getBudgets().filter((b) => b.id !== id)); }

// --- Categories ---
export function getCategories() { return getData(KEYS.CATEGORIES) || []; }
export function setCategories(cats) { setData(KEYS.CATEGORIES, cats); }
export function saveCategory(cat) {
  const list = getCategories();
  const idx = list.findIndex((c) => c.id === cat.id);
  if (idx === -1) list.push(cat); else list[idx] = cat;
  setCategories(list);
}
export function deleteCategory(id) { setCategories(getCategories().filter((c) => c.id !== id)); }

// --- Recurring ---
export function getRecurring() { return getData(KEYS.RECURRING) || []; }
export function setRecurring(r) { setData(KEYS.RECURRING, r); }
export function getRecurringByUser(userId) { return getRecurring().filter((r) => r.userId === userId); }
export function saveRecurring(item) {
  const list = getRecurring();
  const idx = list.findIndex((r) => r.id === item.id);
  if (idx === -1) list.push(item); else list[idx] = item;
  setRecurring(list);
}
export function deleteRecurring(id) { setRecurring(getRecurring().filter((r) => r.id !== id)); }

// --- Settings ---
export function getSettings(userId) {
  const all = getData(KEYS.SETTINGS) || {};
  return all[userId] || { theme: 'light', currency: 'INR', dateFormat: 'dd/MM/yyyy' };
}
export function saveSettings(userId, settings) {
  const all = getData(KEYS.SETTINGS) || {};
  all[userId] = { ...all[userId], ...settings };
  setData(KEYS.SETTINGS, all);
}
