"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { canAccessModule, type AdminModule } from "@/lib/rbac";

interface ProtectedRouteProps {
  children: ReactNode;
  /** When set, also enforces this role's module access (see lib/rbac.ts) — omit for role-agnostic pages */
  module?: AdminModule;
}

// Redirects to the login page if no one is authenticated, or to the overview
// page if the signed-in role isn't permitted to see this module. This is a UI
// convenience only — the corresponding API endpoints must reject the request
// server-side regardless (docs/SUPER_ADMIN_DASHBOARD.md §3).
export function ProtectedRoute({ children, module }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const authorized = isAuthenticated && (!module || (user && canAccessModule(user.role, module)));

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/auth/login");
    } else if (!authorized) {
      router.replace("/");
    }
  }, [isAuthenticated, authorized, router]);

  if (!authorized) {
    return <LoadingSpinner />;
  }

  return <>{children}</>;
}
