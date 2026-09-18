import { HugeiconsIcon } from "@hugeicons/react";
import {
  Clock01Icon,
  CheckmarkCircle01Icon,
  AlertCircleIcon,
  EyeIcon,
} from "@hugeicons/core-free-icons";
import { Badge, type BadgeVariant } from "@/components/common/Badge";
import type { ActivityStatus } from "@/mock/activityData";

const LABELS: Record<ActivityStatus, string> = {
  pending: "Pending",
  approved: "Approved",
  declined: "Declined",
  viewed: "Viewed",
};

const ICONS: Record<ActivityStatus, typeof Clock01Icon> = {
  pending: Clock01Icon,
  approved: CheckmarkCircle01Icon,
  declined: AlertCircleIcon,
  viewed: EyeIcon,
};

// A coloured badge for a request or activity status, shared by both dashboards
export function StatusBadge({ status }: { status: ActivityStatus }) {
  const variant: BadgeVariant = status;
  return (
    <Badge
      label={LABELS[status] ?? LABELS.pending}
      variant={variant}
      icon={<HugeiconsIcon icon={ICONS[status] ?? Clock01Icon} size={12} />}
    />
  );
}
