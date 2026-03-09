import { createContext, useContext, useMemo } from "react";
import { useAuth } from "../hooks/useAuth";
import type { User } from "../types/auth";

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<{ user: User; token: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  const value = useMemo<AuthContextValue>(
    () => ({
      user: auth.user,
      isAuthenticated: auth.isAuthenticated,
      login: auth.login,
      logout: auth.logout,
    }),
    [auth.user, auth.isAuthenticated, auth.login, auth.logout]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuthContext must be used within AuthProvider");
  }
  return ctx;
}
