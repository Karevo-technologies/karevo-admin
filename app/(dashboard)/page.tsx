"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  Building01Icon,
  Stethoscope02Icon,
  UserMultiple02Icon,
  File01Icon,
  Activity01Icon,
} from "@hugeicons/core-free-icons";
import { ProtectedRoute } from "@/components/dashboards/shared/ProtectedRoute";
import { StatCard } from "@/components/dashboards/shared/StatCard";
import { ActivityLogItem } from "@/components/dashboards/shared/ActivityLogItem";
import { EmptyState } from "@/components/common/EmptyState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { ADMIN_ROLE_LABELS } from "@/lib/rbac";
import { mockActivityLog } from "@/mock/activityData";

// Platform-wide KPIs — placeholder values until wired to cached aggregate queries
// (docs/SUPER_ADMIN_DASHBOARD.md §4.1: should not hit production tables live on every load).
const KPIS = [
  { label: "Active Organisations", value: 128, tone: "approved" as const, icon: Building01Icon },
  { label: "Active Doctors", value: 412, tone: "viewed" as const, icon: Stethoscope02Icon },
  { label: "Active Patients", value: "24,981", tone: "neutral" as const, icon: UserMultiple02Icon },
  { label: "Records Accessed (7d)", value: "1,204", tone: "pending" as const, icon: File01Icon },
];

export default function OverviewPage() {
  const { user } = useAuth();

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Overview</h1>
        <p className="text-sm text-muted-foreground">
          Signed in as {user?.name} · {user && ADMIN_ROLE_LABELS[user.role]}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {KPIS.map((kpi) => (
          <StatCard
            key={kpi.label}
            label={kpi.label}
            value={kpi.value}
            tone={kpi.tone}
            icon={<HugeiconsIcon icon={kpi.icon} size={18} />}
          />
        ))}
      </div>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HugeiconsIcon icon={Activity01Icon} size={16} />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {mockActivityLog.length === 0 ? (
            <EmptyState
              icon={<HugeiconsIcon icon={Activity01Icon} size={20} />}
              title="No activity yet"
              message="Platform activity will appear here as it happens."
            />
          ) : (
            mockActivityLog.map((item) => <ActivityLogItem key={item.id} item={item} />)
          )}
        </CardContent>
      </Card>
    </div>
  );
}
