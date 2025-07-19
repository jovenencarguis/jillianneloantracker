"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User } from '@/lib/types';
import { users as mockUsers } from '@/lib/data';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  login: (username: string, password?: string) => boolean;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check for a logged-in user in localStorage to persist session
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
  }, []);

  const login = (username: string, password?: string): boolean => {
    // In a real app, password should be hashed and compared on the server.
    // For this mock app, we're just finding the user by username.
    // Password can be any string.
    const foundUser = mockUsers.find((u) => u.username.toLowerCase() === username.toLowerCase());
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

  const value = { user, login, logout, loading };

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
