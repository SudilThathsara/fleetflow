'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; message?: string; redirectUrl?: string; role?: string }>;
  logout: () => Promise<void>;
  updateUser: (updatedData: Partial<User>) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => ({ success: false }),
  logout: async () => {},
  updateUser: () => {},
  refreshUser: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Function to refresh user profile from database
  const refreshUser = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('fleetflow_token') : '';
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/auth/me', { headers });
      const data = await res.json();
      if (data.success && data.user) {
        const u: User = {
          id: data.user._id || data.user.id,
          name: data.user.name,
          email: data.user.email,
          role: data.user.role,
          phone: data.user.phone,
        };
        setUser(u);
        localStorage.setItem('fleetflow_user', JSON.stringify(u));
      }
    } catch (err) {
      console.warn('Auth refresh warning:', err);
    }
  };

  // Immediate state update helper (instant navbar/profile update)
  const updateUser = (updatedData: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...updatedData };
      if (typeof window !== 'undefined') {
        localStorage.setItem('fleetflow_user', JSON.stringify(updated));
      }
      return updated;
    });
  };

  useEffect(() => {
    // 1. Initial hydration from localStorage
    if (typeof window !== 'undefined') {
      const local = localStorage.getItem('fleetflow_user');
      if (local) {
        try {
          setUser(JSON.parse(local));
        } catch {
          // ignore parse error
        }
      }
    }

    // 2. Fetch latest fresh profile from DB
    refreshUser().finally(() => setLoading(false));

    // 3. Listen to cross-component and cross-tab update events
    const handleUserUpdate = (e: any) => {
      if (e.detail) {
        updateUser(e.detail);
      } else {
        refreshUser();
      }
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'fleetflow_user' && e.newValue) {
        try {
          setUser(JSON.parse(e.newValue));
        } catch {
          // ignore
        }
      }
    };

    window.addEventListener('fleetflow:user-updated', handleUserUpdate);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('fleetflow:user-updated', handleUserUpdate);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const login = async (email: string, pass: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        const u: User = {
          id: data.user.id || data.user._id,
          name: data.user.name,
          email: data.user.email,
          role: data.user.role,
          phone: data.user.phone,
        };
        setUser(u);
        localStorage.setItem('fleetflow_user', JSON.stringify(u));
        if (data.token) {
          localStorage.setItem('fleetflow_token', data.token);
          if (typeof document !== 'undefined') {
            document.cookie = `token=${data.token}; path=/; max-age=604800; SameSite=Lax`;
          }
        }
        return {
          success: true,
          redirectUrl: data.redirectUrl || (u.role === 'customer' ? '/portal' : '/dashboard'),
          role: u.role,
        };
      }
      return { success: false, message: data.message || 'Login failed' };
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      setUser(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('fleetflow_user');
        localStorage.removeItem('fleetflow_token');
      }
      if (typeof document !== 'undefined') {
        document.cookie = 'token=; path=/; max-age=0; SameSite=Lax';
      }
      // Use a full navigation so protected page state cannot remain mounted
      // after the token and cached user have been cleared.
      window.location.replace('/login');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
