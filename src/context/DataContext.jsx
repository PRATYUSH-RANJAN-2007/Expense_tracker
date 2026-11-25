import { createContext, useContext, useState, useCallback } from 'react';
import {
  getTransactionsByUser, saveTransaction, deleteTransaction, getTransactions,
  getAccountsByUser, saveAccount, deleteAccount, getAccounts,
  getBudgetsByUser, saveBudget, deleteBudget,
  getRecurringByUser, saveRecurring, deleteRecurring,
  getCategories, saveCategory, deleteCategory,
  getUsers, saveUser, deleteUser,
} from '../utils/storage';
import { useAuth } from './AuthContext';

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const { user } = useAuth();
  const [refresh, setRefresh] = useState(0);

  const triggerRefresh = useCallback(() => setRefresh((r) => r + 1), []);

  // ---- Transactions ----
  const getUserTransactions = useCallback(() => {
    if (!user) return [];
    return getTransactionsByUser(user.id);
  }, [user, refresh]);

  const getAllTransactions = useCallback(() => getTransactions(), [refresh]);

  const addTransaction = useCallback((txn) => {
    saveTransaction(txn);
    triggerRefresh();
  }, [triggerRefresh]);

  const editTransaction = useCallback((txn) => {
    saveTransaction(txn);
    triggerRefresh();
  }, [triggerRefresh]);

  const removeTransaction = useCallback((id) => {
    deleteTransaction(id);
    triggerRefresh();
  }, [triggerRefresh]);

  // ---- Accounts ----
  const getUserAccounts = useCallback(() => {
    if (!user) return [];
    return getAccountsByUser(user.id);
  }, [user, refresh]);

  const getAllAccounts = useCallback(() => getAccounts(), [refresh]);

  const addAccount = useCallback((acc) => { saveAccount(acc); triggerRefresh(); }, [triggerRefresh]);
  const editAccount = useCallback((acc) => { saveAccount(acc); triggerRefresh(); }, [triggerRefresh]);
  const removeAccount = useCallback((id) => { deleteAccount(id); triggerRefresh(); }, [triggerRefresh]);

  // ---- Budgets ----
  const getUserBudgets = useCallback(() => {
    if (!user) return [];
    return getBudgetsByUser(user.id);
  }, [user, refresh]);

  const addBudget = useCallback((b) => { saveBudget(b); triggerRefresh(); }, [triggerRefresh]);
  const editBudget = useCallback((b) => { saveBudget(b); triggerRefresh(); }, [triggerRefresh]);
  const removeBudget = useCallback((id) => { deleteBudget(id); triggerRefresh(); }, [triggerRefresh]);

  // ---- Recurring ----
  const getUserRecurring = useCallback(() => {
    if (!user) return [];
    return getRecurringByUser(user.id);
  }, [user, refresh]);

  const addRecurring = useCallback((r) => { saveRecurring(r); triggerRefresh(); }, [triggerRefresh]);
  const editRecurring = useCallback((r) => { saveRecurring(r); triggerRefresh(); }, [triggerRefresh]);
  const removeRecurring = useCallback((id) => { deleteRecurring(id); triggerRefresh(); }, [triggerRefresh]);

  // ---- Categories ----
  const getCategories_ = useCallback(() => getCategories(), [refresh]);
  const addCategory = useCallback((c) => { saveCategory(c); triggerRefresh(); }, [triggerRefresh]);
  const editCategory = useCallback((c) => { saveCategory(c); triggerRefresh(); }, [triggerRefresh]);
  const removeCategory = useCallback((id) => { deleteCategory(id); triggerRefresh(); }, [triggerRefresh]);

  // ---- Admin: Users ----
  const getAllUsers = useCallback(() => getUsers(), [refresh]);
  const updateUser = useCallback((u) => { saveUser(u); triggerRefresh(); }, [triggerRefresh]);
  const removeUser = useCallback((id) => { deleteUser(id); triggerRefresh(); }, [triggerRefresh]);

  return (
    <DataContext.Provider value={{
      refresh,
      triggerRefresh,
      // transactions
      getUserTransactions,
      getAllTransactions,
      addTransaction,
      editTransaction,
      removeTransaction,
      // accounts
      getUserAccounts,
      getAllAccounts,
      addAccount,
      editAccount,
      removeAccount,
      // budgets
      getUserBudgets,
      addBudget,
      editBudget,
      removeBudget,
      // recurring
      getUserRecurring,
      addRecurring,
      editRecurring,
      removeRecurring,
      // categories
      getCategories: getCategories_,
      addCategory,
      editCategory,
      removeCategory,
      // admin
      getAllUsers,
      updateUser,
      removeUser,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
