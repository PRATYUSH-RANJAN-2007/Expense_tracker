import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getUsers, getSession, setSession, clearSession, saveUser, getUserByEmail } from '../utils/storage';
import { generateId } from '../utils/helpers';
import { isValidEmail } from '../utils/helpers';
import { seedInitialData } from '../utils/seedData';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount: seed data then restore session
  useEffect(() => {
    seedInitialData();
    const session = getSession();
    if (session && session.userId) {
      const users = getUsers();
      const found = users.find((u) => u.id === session.userId);
      if (found && found.isActive) {
        setUser(found);
      } else {
        clearSession();
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    const users = getUsers();
    const found = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (!found) return { success: false, error: 'Invalid email or password.' };
    if (!found.isActive) return { success: false, error: 'Your account has been deactivated. Contact admin.' };

    setSession({ userId: found.id, role: found.role, loginAt: new Date().toISOString() });
    setUser(found);
    return { success: true, role: found.role };
  }, []);

  const signup = useCallback(async (data) => {
    const { name, email, password } = data;
    if (!name || !email || !password) return { success: false, error: 'All fields are required.' };
    if (!isValidEmail(email)) return { success: false, error: 'Invalid email address.' };
    if (password.length < 6) return { success: false, error: 'Password must be at least 6 characters.' };

    const existing = getUserByEmail(email);
    if (existing) return { success: false, error: 'An account with this email already exists.' };

    const newUser = {
      id: generateId(),
      name,
      email,
      password,
      role: 'user',
      avatar: null,
      createdAt: new Date().toISOString(),
      isActive: true,
    };
    saveUser(newUser);
    return { success: true };
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
  }, []);

  const updateProfile = useCallback((updates) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    saveUser(updated);
    setUser(updated);
  }, [user]);

  const refreshUser = useCallback(() => {
    if (!user) return;
    const session = getSession();
    if (!session) return;
    const users = getUsers();
    const found = users.find((u) => u.id === session.userId);
    if (found) setUser(found);
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, updateProfile, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
