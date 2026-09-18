"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { AdminRole } from "@/lib/rbac";

export interface AdminUser {
  name: string;
  email: string;
  role: AdminRole;
}

interface AuthContextValue {
  user: AdminUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// Mock identity until the admin-scoped auth realm exists (see docs/SUPER_ADMIN_DASHBOARD.md §2.1, §6 — MFA required)
const MOCK_ADMIN: Omit<AdminUser, "email"> = {
  name: "Amaka Chukwu",
  role: "super_admin",
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);

  const login = (email: string, password: string) => {
    // Mock login — accept any non-empty input. Replace with real MFA-gated admin auth later.
    if (email.trim() && password) {
      setUser({ ...MOCK_ADMIN, email: email.trim() });
      return true;
    }
    return false;
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
