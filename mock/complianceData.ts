// Placeholder data for the Compliance & Security module (docs/SUPER_ADMIN_DASHBOARD.md §4.5)
// until this reads from real NDPR/security-alerting/incident-response tables.

export type DsarType = "export" | "erasure";
export type DsarStatus = "pending" | "completed" | "rejected";

export interface DataSubjectRequest {
  id: string;
  patientId: string;
  type: DsarType;
  status: DsarStatus;
  requestedAt: string;
  completedAt?: string;
  // Records legally required to be retained despite an erasure request — the
  // exception list the spec says must be documented explicitly with legal (§9 open question).
  retentionExceptions?: string[];
}

export const mockDsarRequests: DataSubjectRequest[] = [
  {
    id: "DSAR-081",
    patientId: "KID-20260009",
    type: "export",
    status: "completed",
    requestedAt: "2026-09-14T08:00:00Z",
    completedAt: "2026-09-17T10:05:00Z",
  },
  {
    id: "DSAR-080",
    patientId: "KID-20260052",
    type: "erasure",
    status: "completed",
    requestedAt: "2026-09-10T12:00:00Z",
    completedAt: "2026-09-12T09:30:00Z",
    retentionExceptions: [
      "Immunisation records (statutory public-health retention)",
      "Billing records tied to an open insurance claim",
    ],
  },
  {
    id: "DSAR-079",
    patientId: "KID-20260031",
    type: "erasure",
    status: "pending",
    requestedAt: "2026-09-17T11:20:00Z",
  },
];

export type SecurityAlertType = "failed_login_spike" | "impossible_travel" | "brute_force";
export type SecurityAlertSeverity = "warning" | "critical";
export type SecurityAlertStatus = "open" | "acknowledged" | "resolved";

export interface SecurityAlert {
  id: string;
  type: SecurityAlertType;
  targetLabel: string;
  detail: string;
  severity: SecurityAlertSeverity;
  status: SecurityAlertStatus;
  detectedAt: string;
}

export const SECURITY_ALERT_LABELS: Record<SecurityAlertType, string> = {
  failed_login_spike: "Failed Login Spike",
  impossible_travel: "Impossible-Travel Login",
  brute_force: "Brute-Force Attempt",
};

export const mockSecurityAlerts: SecurityAlert[] = [
  {
    id: "SEC-221",
    type: "impossible_travel",
    targetLabel: "femi.adigun@karevo.app",
    detail: "Signed in from Lagos, NG and Lisbon, PT 6 minutes apart",
    severity: "critical",
    status: "open",
    detectedAt: "2026-09-17T14:12:00Z",
  },
  {
    id: "SEC-220",
    type: "brute_force",
    targetLabel: "Reddington Hospital org login",
    detail: "22 failed attempts from a single IP in 3 minutes",
    severity: "critical",
    status: "open",
    detectedAt: "2026-09-17T06:40:00Z",
  },
  {
    id: "SEC-219",
    type: "failed_login_spike",
    targetLabel: "amaka.chukwu@karevo.app",
    detail: "6 failed attempts, up from a trailing average of under 1/day",
    severity: "warning",
    status: "acknowledged",
    detectedAt: "2026-09-16T20:05:00Z",
  },
];

export type FreezeTargetType = "organisation" | "account";
export type FreezeStatus = "active" | "frozen";

export interface FreezeTarget {
  id: string;
  type: FreezeTargetType;
  name: string;
  status: FreezeStatus;
  frozenReason?: string;
  frozenBy?: string;
  frozenAt?: string;
}

export const mockFreezeTargets: FreezeTarget[] = [
  { id: "ORG-014", type: "organisation", name: "Reddington Hospital", status: "active" },
  { id: "ACC-052", type: "account", name: "KID-20260052", status: "active" },
  {
    id: "ORG-009",
    type: "organisation",
    name: "Wellness Point Pharmacy",
    status: "frozen",
    frozenReason: "Expired practice license, pending re-verification",
    frozenBy: "Amaka Chukwu",
    frozenAt: "2026-09-16T09:20:00Z",
  },
];
