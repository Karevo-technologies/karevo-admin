"use client";

import { useState, type ReactNode } from "react";
import { ProtectedRoute } from "@/components/dashboards/shared/ProtectedRoute";
import { Navbar } from "@/components/dashboards/shared/Navbar";
import { Sidebar } from "@/components/dashboards/shared/Sidebar";
import { useAuth } from "@/context/AuthContext";
import { NAV_ENTRIES } from "@/lib/navigation";
import { canAccessModule } from "@/lib/rbac";

function DashboardShell({ children }: { children: ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { user } = useAuth();
  const items = user ? NAV_ENTRIES.filter((entry) => canAccessModule(user.role, entry.module)) : [];

  return (
    <div className="flex h-screen bg-background">
      <Sidebar
        items={items}
        dashboardLabel="Super Admin Dashboard"
        mobileOpen={mobileNavOpen}
        onMobileOpenChange={setMobileNavOpen}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar onMenuClick={() => setMobileNavOpen(true)} />
        <main className="flex-1 overflow-y-auto bg-muted/30 p-6">{children}</main>
      </div>
    </div>
  );
}

// Auth-only gate here; each page underneath adds its own module-level RBAC
// gate via ProtectedRoute's `module` prop so the sidebar can differ per role
// while still sharing one shell.
export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute>
      <DashboardShell>{children}</DashboardShell>
    </ProtectedRoute>
  );
}
