"use client";

import { File01Icon } from "@hugeicons/core-free-icons";
import { ProtectedRoute } from "@/components/dashboards/shared/ProtectedRoute";
import { ModulePlaceholder } from "@/components/dashboards/shared/ModulePlaceholder";

export default function RecordsConsentPage() {
  return (
    <ProtectedRoute module="records_consent">
      <ModulePlaceholder
        icon={File01Icon}
        title="Records & Consent"
        description="The trust-critical module — build defensively. Every raw record read must generate an immutable audit log entry, no exceptions (spec §4.4)."
        entities={["ConsentRequest", "RecordAccessEvent", "AuditLogEntry"]}
        screens={[
          "Audit log viewer: searchable/filterable by patient, org, doctor, date range, action type — the single most important screen in the whole dashboard",
          "Consent request monitor: pending / approved / denied / expired, with drill-down into denial reasons",
          "Anomaly flags: e.g. an org's record-access volume spikes 3x above its trailing average — surfaced automatically",
        ]}
      />
    </ProtectedRoute>
  );
}
