"use client";

import { Building01Icon } from "@hugeicons/core-free-icons";
import { ProtectedRoute } from "@/components/dashboards/shared/ProtectedRoute";
import { ModulePlaceholder } from "@/components/dashboards/shared/ModulePlaceholder";

export default function OrgsDoctorsPage() {
  return (
    <ProtectedRoute module="orgs_doctors">
      <ModulePlaceholder
        icon={Building01Icon}
        title="Orgs & Doctors"
        description="Organisation onboarding, verification queue, and doctor credential management (spec §4.2)."
        entities={["Organisation", "Doctor/Practitioner", "OrgMembership"]}
        screens={[
          "Org list (filter: pending verification / active / suspended)",
          "Org detail: license/credential documents, submitted verification info, linked doctors, activity summary",
          "Verification queue: approve/reject with a required reason; rejection triggers a notification to the org",
          "Doctor detail: credentials, which orgs they belong to, access history",
        ]}
      />
    </ProtectedRoute>
  );
}
