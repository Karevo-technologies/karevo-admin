import { HugeiconsIcon } from "@hugeicons/react";
import {
  Clock01Icon,
  CheckmarkCircle01Icon,
  AlertCircleIcon,
  EyeIcon,
} from "@hugeicons/core-free-icons";
import { StatusBadge } from "@/components/dashboards/shared/StatusBadge";
import { BADGE_VARIANT_CLASSES } from "@/components/common/Badge";
import { formatDate } from "@/utils/formatDate";
import { cn } from "@/lib/utils";
import type { ActivityStatus } from "@/mock/activityData";

const STATUS_ICONS: Record<ActivityStatus, typeof Clock01Icon> = {
  pending: Clock01Icon,
  approved: CheckmarkCircle01Icon,
  declined: AlertCircleIcon,
  viewed: EyeIcon,
};

interface ActivityLogItemProps {
  item: {
    id: string;
    action: string;
    description: string;
    timestamp: string;
    status: ActivityStatus;
    orgName?: string;
  };
}

// One item in an activity log. Shows an org chip when the entry carries one (admin's global feed).
export function ActivityLogItem({ item }: ActivityLogItemProps) {
  return (
    <div className="flex items-start gap-3 border-b border-border py-3.5 last:border-b-0">
      <div
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-full",
          BADGE_VARIANT_CLASSES[item.status]
        )}
      >
        <HugeiconsIcon icon={STATUS_ICONS[item.status] ?? Clock01Icon} size={15} />
      </div>
      <div className="flex flex-1 items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-foreground">{item.action}</p>
            {item.orgName && (
              <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                {item.orgName}
              </span>
            )}
          </div>
          <p className="text-[13px] text-muted-foreground">{item.description}</p>
        </div>
        <div className="flex shrink-0 flex-col items-end text-right">
          <StatusBadge status={item.status} />
          <p className="mt-1.5 text-xs text-muted-foreground/70">{formatDate(item.timestamp)}</p>
        </div>
      </div>
    </div>
  );
}
