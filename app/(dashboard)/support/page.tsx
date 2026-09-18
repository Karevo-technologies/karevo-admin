"use client";

import { Settings01Icon } from "@hugeicons/core-free-icons";
import { ProtectedRoute } from "@/components/dashboards/shared/ProtectedRoute";
import { ModulePlaceholder } from "@/components/dashboards/shared/ModulePlaceholder";

export default function SupportConfigPage() {
  return (
    <ProtectedRoute module="support_config">
      <ModulePlaceholder
        icon={Settings01Icon}
        title="Support & Config"
        description="Support tickets, feature flags, consent/ToS versioning, and platform announcements — lowest urgency module (spec §4.6)."
        entities={["SupportTicket", "FeatureFlag", "ConsentFormVersion"]}
        screens={[
          "Support tickets scoped to an org/user account, with key account metadata inline",
          "Feature flags / staged rollout toggles",
          "Consent form and Terms of Service versioning — track which version each user/org agreed to and when",
          "Notification broadcast tool for platform-wide announcements",
        ]}
      />
    </ProtectedRoute>
  );
}
