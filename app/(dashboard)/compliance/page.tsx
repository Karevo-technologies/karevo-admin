"use client";

import { ShieldCheckIcon } from "@hugeicons/core-free-icons";
import { ProtectedRoute } from "@/components/dashboards/shared/ProtectedRoute";
import { ModulePlaceholder } from "@/components/dashboards/shared/ModulePlaceholder";

export default function ComplianceSecurityPage() {
  return (
    <ProtectedRoute module="compliance_security">
      <ModulePlaceholder
        icon={ShieldCheckIcon}
        title="Compliance & Security"
        description="NDPR tooling, security alerting, and incident response (spec §4.5)."
        entities={["AuditLogEntry", "AdminActionLogEntry"]}
        screens={[
          "NDPR tooling: data subject access requests (export), right-to-erasure requests with a documented retention exception list",
          "Security alerts: failed login spikes, impossible-travel logins, brute-force detection",
          "Incident response: a documented \"freeze this account/org now\" action — immediate, reversible only by a second admin",
        ]}
      />
    </ProtectedRoute>
  );
}
