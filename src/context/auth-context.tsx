
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { User } from '@/lib/types';
import { users as initialUsers } from '@/lib/data';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  login: (username: string, password?: string) => boolean;
  logout: () => void;
  loading: boolean;
  refetchUsers?: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const getStoredUsers = (): User[] => {
    if (typeof window === 'undefined') return initialUsers;
    const storedUsers = sessionStorage.getItem('all-users');
    if (storedUsers) {
        try {
            // This allows an empty array to be a valid, persisted state.
            return JSON.parse(storedUsers);
        } catch (e) {
            console.error("Failed to parse users from sessionStorage", e);
            // Fallback to default if parsing fails.
            return initialUsers;
        }
    }
    // If no users are in storage (e.g., first visit), seed with initial data.
    sessionStorage.setItem('all-users', JSON.stringify(initialUsers));
    return initialUsers;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const refetchUsers = useCallback(() => {
    // This function can be called to ensure the latest users are loaded.
    // The main purpose is to ensure session storage has data on first load.
    getStoredUsers();
  }, []);

  useEffect(() => {
    refetchUsers();

    try {
      const storedUser = localStorage.getItem('loadbuddy-user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem('loadbuddy-user');
    } finally {
      setLoading(false);
    }
  }, [refetchUsers]);

  const login = (username: string, password?: string): boolean => {
    // Always get the most up-to-date user list from session storage.
    const usersToSearch = getStoredUsers(); 
    const foundUser = usersToSearch.find(
      (u) => u.username.toLowerCase() === username.toLowerCase() && u.password === password
    );

    if (foundUser) {
      const { password: _, ...userToStore } = foundUser;
      setUser(userToStore);
      localStorage.setItem('loadbuddy-user', JSON.stringify(userToStore));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('loadbuddy-user');
    router.push('/login');
  };

  const value = { user, login, logout, loading, refetchUsers };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
