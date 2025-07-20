
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, Dispatch, SetStateAction } from 'react';
import type { User, Client, RecentActivity, UpcomingPayment } from '@/lib/types';
import { getStoredUsers, initializeData, getStoredClients, getStoredRecentActivities, getStoredUpcomingPayments } from '@/lib/storage';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  users: User[];
  clients: Client[];
  activities: RecentActivity[];
  upcomingPayments: UpcomingPayment[];
  setUsers: Dispatch<SetStateAction<User[]>>;
  setClients: Dispatch<SetStateAction<Client[]>>;
  setActivities: Dispatch<SetStateAction<RecentActivity[]>>;
  login: (username: string, password?: string) => boolean;
  logout: () => void;
  loading: boolean;
  refetchUsers?: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [upcomingPayments, setUpcomingPayments] = useState<UpcomingPayment[]>([]);

  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const refetchUsers = useCallback(() => {
    // This function can be called to ensure the latest users are loaded.
    // The main purpose is to ensure session storage has data on first load.
    initializeData();
  }, []);

  useEffect(() => {
    refetchUsers();

    try {
      const storedUser = localStorage.getItem('loadbuddy-user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
      // Load all data into context state
      setUsers(getStoredUsers());
      const loadedClients = getStoredClients();
      setClients(loadedClients);
      setActivities(getStoredRecentActivities().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      setUpcomingPayments(getStoredUpcomingPayments(loadedClients));

    } catch (error) {
      console.error("Failed to parse user from localStorage or load initial data", error);
      localStorage.removeItem('loadbuddy-user');
    } finally {
      setLoading(false);
    }
  }, [refetchUsers]);

  // When clients data changes in the context, recalculate upcoming payments
  useEffect(() => {
    if (!loading) {
      setUpcomingPayments(getStoredUpcomingPayments(clients));
    }
  }, [clients, loading]);

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

  const value = { 
    user, 
    users,
    clients,
    activities,
    upcomingPayments,
    setUsers,
    setClients,
    setActivities,
    login, 
    logout, 
    loading, 
    refetchUsers 
  };

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
