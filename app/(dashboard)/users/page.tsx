"use client";

import { UserMultiple02Icon } from "@hugeicons/core-free-icons";
import { ProtectedRoute } from "@/components/dashboards/shared/ProtectedRoute";
import { ModulePlaceholder } from "@/components/dashboards/shared/ModulePlaceholder";

export default function UsersPage() {
  return (
    <ProtectedRoute module="users">
      <ModulePlaceholder
        icon={UserMultiple02Icon}
        title="Users"
        description="Patient account search, verification status, and identity dispute/recovery (spec §4.3)."
        entities={["PatientAccount", "IdentityVerification"]}
        screens={[
          "Search (by ID, name, phone — never expose full search-by-name to lower-privilege roles)",
          "Account detail: verification status, linked consents, account status",
          "Identity dispute/recovery workflow: manual override for failed automated KYC, with mandatory reason + evidence attachment",
        ]}
      />
    </ProtectedRoute>
  );
}
