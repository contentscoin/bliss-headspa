"use client";

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

type UserRole = "customer" | "branch_admin" | "buyer" | "super_admin";

interface User {
  _id: string;
  email: string;
  name: string;
  phone: string;
  role: UserRole;
  branchId?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const SESSION_KEY = "bliss_session_token";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loginMutation = useMutation(api.auth.login);
  const logoutMutation = useMutation(api.auth.logout);
  const sessionUser = useQuery(
    api.auth.getSession,
    sessionToken ? { sessionToken } : "skip"
  );

  useEffect(() => {
    const stored = localStorage.getItem(SESSION_KEY);
    setSessionToken(stored);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!isLoading && sessionToken && sessionUser === null) {
      localStorage.removeItem(SESSION_KEY);
      setSessionToken(null);
    }
  }, [sessionUser, sessionToken, isLoading]);

  const login = useCallback(
    async (email: string, password: string) => {
      const result = await loginMutation({ email, password });
      localStorage.setItem(SESSION_KEY, result.token);
      setSessionToken(result.token);
    },
    [loginMutation]
  );

  const logout = useCallback(async () => {
    if (sessionToken) {
      await logoutMutation({ sessionToken });
    }
    localStorage.removeItem(SESSION_KEY);
    setSessionToken(null);
  }, [sessionToken, logoutMutation]);

  const user = sessionUser as User | null | undefined;
  const stillLoading = isLoading || (sessionToken !== null && sessionUser === undefined);

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading: stillLoading,
        isAuthenticated: !!user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
