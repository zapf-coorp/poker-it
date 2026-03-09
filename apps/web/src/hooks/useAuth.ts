import { useState, useCallback } from "react";
import { getStoredAuth, setStoredAuth, clearStoredAuth } from "../storage";
import { mockLogin } from "../auth/auth-api";
import type { User } from "../types/auth";

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(() => {
    const stored = getStoredAuth();
    return stored?.user ?? null;
  });

  const login = useCallback(async (username: string, password: string) => {
    const result = await mockLogin(username, password);
    setStoredAuth(result.user, result.token);
    setUser(result.user);
    return result;
  }, []);

  const logout = useCallback(() => {
    clearStoredAuth();
    setUser(null);
  }, []);

  return {
    user,
    isAuthenticated: user !== null,
    login,
    logout,
  };
}
