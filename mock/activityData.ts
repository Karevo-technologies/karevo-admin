export type ActivityStatus = "pending" | "approved" | "declined" | "viewed";

export interface ActivityItem {
  id: string;
  action: string;
  description: string;
  timestamp: string;
  status: ActivityStatus;
  orgName?: string;
}

// Placeholder feed until this reads from the real AdminActionLogEntry / RecordAccessEvent
// tables (docs/SUPER_ADMIN_DASHBOARD.md §5). Every row here must be backed by an immutable
// audit log entry once real record access is wired up (§4.4).
export const mockActivityLog: ActivityItem[] = [
  {
    id: "ADM-001",
    action: "Org Approved",
    description: "Lagos General Hospital verification approved after document review",
    timestamp: "2026-09-17T14:30:00Z",
    status: "approved",
    orgName: "Lagos General Hospital",
  },
  {
    id: "ADM-002",
    action: "Verification Pending",
    description: "St. Nicholas Clinic submitted license documents for review",
    timestamp: "2026-09-17T11:05:00Z",
    status: "pending",
    orgName: "St. Nicholas Clinic",
  },
  {
    id: "ADM-003",
    action: "Record Viewed",
    description: "Super admin viewed KID-20260014's Blood Test Result (reason: support ticket #482)",
    timestamp: "2026-09-16T16:50:00Z",
    status: "viewed",
  },
  {
    id: "ADM-004",
    action: "Org Rejected",
    description: "Wellness Point Pharmacy verification rejected — expired practice license",
    timestamp: "2026-09-16T09:20:00Z",
    status: "declined",
    orgName: "Wellness Point Pharmacy",
  },
];
