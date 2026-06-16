"use client";
import React, {createContext, useContext, useState, useEffect, ReactNode} from 'react';
import type {SessionUser} from '@/lib/auth';

interface AuthContextValue {
  user: SessionUser | null;
  setUser: (u: SessionUser | null) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({initialUser, children}: {initialUser: SessionUser | null; children: ReactNode}) {
  const [user, setUser] = useState<SessionUser | null>(initialUser);
  return <AuthContext.Provider value={{user, setUser}}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
