
'use client';

import React, { createContext, useState, useCallback, useEffect, ReactNode } from 'react';
import type { User } from '@/lib/types';
import { usersData, ALL_USERS_PASSWORD } from '@/lib/auth';
import { Loader2 } from 'lucide-react';

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('rolecall-user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Failed to parse user from localStorage', error);
      localStorage.removeItem('rolecall-user');
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const userData = usersData[username.toLowerCase()];
    if (userData && password === ALL_USERS_PASSWORD) {
      const loggedInUser: User = { ...userData, username };
      setUser(loggedInUser);
      localStorage.setItem('rolecall-user', JSON.stringify(loggedInUser));
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    const loggedOutUser = user;
    setUser(null);
    localStorage.removeItem('rolecall-user');
    if (loggedOutUser) {
      localStorage.removeItem(`avatar_${loggedOutUser.id}`);
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
