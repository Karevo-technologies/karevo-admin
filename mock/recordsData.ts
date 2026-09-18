// Placeholder data for the Records & Consent module (docs/SUPER_ADMIN_DASHBOARD.md §4.4)
// until this reads from the real ConsentRequest / RecordAccessEvent / AuditLogEntry tables (§5).

export type AuditActionType =
  | "record_view"
  | "record_export"
  | "org_approved"
  | "org_rejected"
  | "org_suspended"
  | "consent_approved"
  | "consent_denied"
  | "identity_override";

export interface AuditLogEntry {
  id: string;
  actionType: AuditActionType;
  actorName: string;
  patientId?: string;
  orgName?: string;
  doctorName?: string;
  reasonCode?: string;
  note: string;
  timestamp: string;
}

export const AUDIT_ACTION_LABELS: Record<AuditActionType, string> = {
  record_view: "Record Viewed",
  record_export: "Record Exported",
  org_approved: "Org Approved",
  org_rejected: "Org Rejected",
  org_suspended: "Org Suspended",
  consent_approved: "Consent Approved",
  consent_denied: "Consent Denied",
  identity_override: "Identity Override",
};

export const mockAuditLog: AuditLogEntry[] = [
  {
    id: "AUD-2041",
    actionType: "record_view",
    actorName: "Amaka Chukwu",
    patientId: "KID-20260014",
    orgName: "Lagos General Hospital",
    doctorName: "Dr. Tunde Bakare",
    reasonCode: "SUPPORT_TICKET",
    note: "Viewed Blood Test Result while resolving support ticket #482",
    timestamp: "2026-09-17T15:42:00Z",
  },
  {
    id: "AUD-2040",
    actionType: "consent_denied",
    actorName: "System",
    patientId: "KID-20260031",
    orgName: "St. Nicholas Clinic",
    note: "Patient denied consent request for Vaccination History",
    timestamp: "2026-09-17T13:10:00Z",
  },
  {
    id: "AUD-2039",
    actionType: "record_export",
    actorName: "Femi Adigun",
    patientId: "KID-20260009",
    orgName: "Reddington Hospital",
    doctorName: "Dr. Ngozi Eze",
    reasonCode: "NDPR_EXPORT",
    note: "Exported full record set for a data subject access request",
    timestamp: "2026-09-17T10:05:00Z",
  },
  {
    id: "AUD-2038",
    actionType: "org_suspended",
    actorName: "Amaka Chukwu",
    orgName: "Wellness Point Pharmacy",
    reasonCode: "EXPIRED_LICENSE",
    note: "Suspended indefinitely — practice license expired 2026-08-01",
    timestamp: "2026-09-16T09:20:00Z",
  },
  {
    id: "AUD-2037",
    actionType: "identity_override",
    actorName: "Femi Adigun",
    patientId: "KID-20260052",
    reasonCode: "KYC_MANUAL_REVIEW",
    note: "Manual KYC override after automated verification failed twice",
    timestamp: "2026-09-15T17:55:00Z",
  },
  {
    id: "AUD-2036",
    actionType: "org_approved",
    actorName: "Amaka Chukwu",
    orgName: "Lagos General Hospital",
    note: "Verification approved after document review",
    timestamp: "2026-09-14T11:30:00Z",
  },
];

export type ConsentStatus = "pending" | "approved" | "denied" | "expired";

export interface ConsentRequestItem {
  id: string;
  patientId: string;
  requestingOrgName: string;
  recordType: string;
  status: ConsentStatus;
  requestedAt: string;
  resolvedAt?: string;
  denialReason?: string;
}

export const mockConsentRequests: ConsentRequestItem[] = [
  {
    id: "CR-3301",
    patientId: "KID-20260014",
    requestingOrgName: "Lagos General Hospital",
    recordType: "Blood Test Result",
    status: "approved",
    requestedAt: "2026-09-15T09:00:00Z",
    resolvedAt: "2026-09-15T09:20:00Z",
  },
  {
    id: "CR-3300",
    patientId: "KID-20260031",
    requestingOrgName: "St. Nicholas Clinic",
    recordType: "Vaccination History",
    status: "denied",
    requestedAt: "2026-09-16T14:00:00Z",
    resolvedAt: "2026-09-17T13:10:00Z",
    denialReason: "Patient noted they no longer use this clinic",
  },
  {
    id: "CR-3299",
    patientId: "KID-20260009",
    requestingOrgName: "Reddington Hospital",
    recordType: "Full Medical History",
    status: "pending",
    requestedAt: "2026-09-17T08:30:00Z",
  },
  {
    id: "CR-3298",
    patientId: "KID-20260052",
    requestingOrgName: "Wellness Point Pharmacy",
    recordType: "Prescription History",
    status: "expired",
    requestedAt: "2026-09-01T10:00:00Z",
  },
];

export interface AnomalyFlag {
  id: string;
  orgName: string;
  metricLabel: string;
  currentValue: number;
  trailingAverage: number;
  multiplier: number;
  detectedAt: string;
  severity: "warning" | "critical";
}

export const mockAnomalyFlags: AnomalyFlag[] = [
  {
    id: "ANM-014",
    orgName: "Reddington Hospital",
    metricLabel: "Record access volume (24h)",
    currentValue: 342,
    trailingAverage: 96,
    multiplier: 3.6,
    detectedAt: "2026-09-17T16:00:00Z",
    severity: "critical",
  },
  {
    id: "ANM-013",
    orgName: "St. Nicholas Clinic",
    metricLabel: "Consent requests sent (24h)",
    currentValue: 41,
    trailingAverage: 18,
    multiplier: 2.3,
    detectedAt: "2026-09-16T22:15:00Z",
    severity: "warning",
  },
];
