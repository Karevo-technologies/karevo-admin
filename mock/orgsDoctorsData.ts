// Placeholder data for the Orgs & Doctors module (docs/SUPER_ADMIN_DASHBOARD.md §4.2)
// until this reads from the real Organisation / Doctor / OrgMembership tables (§5).

export type OrgVerificationStatus = "pending" | "active" | "suspended" | "rejected";
export type DoctorVerificationStatus = "pending" | "active" | "suspended";
export type SuspensionDuration = "temporary" | "indefinite";

export interface OrgDocument {
  id: string;
  name: string;
  type: string;
  uploadedAt: string;
}

export interface SuspensionInfo {
  reasonCode: string;
  reasonLabel: string;
  note?: string;
  duration: SuspensionDuration;
  suspendedAt: string;
  suspendedBy: string;
}

export interface RejectionInfo {
  reasonCode: string;
  reasonLabel: string;
  note: string;
  rejectedAt: string;
  rejectedBy: string;
}

export interface Organisation {
  id: string;
  name: string;
  licenseNumber: string;
  verificationStatus: OrgVerificationStatus;
  createdAt: string;
  contactEmail: string;
  address: string;
  documents: OrgDocument[];
  doctorIds: string[];
  suspension?: SuspensionInfo;
  rejection?: RejectionInfo;
}

export interface DoctorAccessEvent {
  id: string;
  action: string;
  timestamp: string;
  orgName?: string;
}

export interface Doctor {
  id: string;
  name: string;
  credentials: string;
  verificationStatus: DoctorVerificationStatus;
  orgIds: string[];
  accessHistory: DoctorAccessEvent[];
  suspension?: SuspensionInfo;
}

export type OrgDoctorActionType =
  | "org_approved"
  | "org_rejected"
  | "org_suspended"
  | "doctor_suspended";

export interface OrgDoctorAuditEntry {
  id: string;
  actionType: OrgDoctorActionType;
  adminName: string;
  targetType: "organisation" | "doctor";
  targetId: string;
  targetName: string;
  reasonCode?: string;
  note?: string;
  duration?: SuspensionDuration;
  documentsReviewed?: string[];
  timestamp: string;
}

export const AUDIT_ACTION_LABELS: Record<OrgDoctorActionType, string> = {
  org_approved: "Organisation Approved",
  org_rejected: "Organisation Rejected",
  org_suspended: "Organisation Suspended",
  doctor_suspended: "Doctor Suspended",
};

export const REJECTION_REASON_CODES = [
  { value: "INCOMPLETE_DOCS", label: "Incomplete documentation" },
  { value: "EXPIRED_LICENSE", label: "Expired license" },
  { value: "UNVERIFIABLE_INFO", label: "Unverifiable information" },
  { value: "DUPLICATE_ORG", label: "Duplicate organisation" },
] as const;

export const SUSPENSION_REASON_CODES = [
  { value: "EXPIRED_LICENSE", label: "Expired license" },
  { value: "COMPLIANCE_VIOLATION", label: "Compliance violation" },
  { value: "FRAUD_SUSPECTED", label: "Suspected fraud" },
  { value: "PATIENT_COMPLAINT", label: "Patient complaint under investigation" },
  { value: "OTHER", label: "Other" },
] as const;

export const mockOrganisations: Organisation[] = [
  {
    id: "ORG-1001",
    name: "Lagos General Hospital",
    licenseNumber: "LIC-NG-88213",
    verificationStatus: "active",
    createdAt: "2026-06-02T09:00:00Z",
    contactEmail: "admin@lagosgeneral.ng",
    address: "12 Marina Road, Lagos Island, Lagos",
    documents: [
      { id: "DOC-1", name: "Facility License", type: "License", uploadedAt: "2026-06-01T10:00:00Z" },
      { id: "DOC-2", name: "Certificate of Incorporation", type: "Registration", uploadedAt: "2026-06-01T10:05:00Z" },
    ],
    doctorIds: ["DOC-2001", "DOC-2002"],
  },
  {
    id: "ORG-1002",
    name: "St. Nicholas Clinic",
    licenseNumber: "LIC-NG-44120",
    verificationStatus: "pending",
    createdAt: "2026-09-15T11:30:00Z",
    contactEmail: "ops@stnicholasclinic.ng",
    address: "5 Adeola Odeku Street, Victoria Island, Lagos",
    documents: [
      { id: "DOC-3", name: "Facility License", type: "License", uploadedAt: "2026-09-15T11:00:00Z" },
      { id: "DOC-4", name: "Practice Permit", type: "Permit", uploadedAt: "2026-09-15T11:10:00Z" },
    ],
    doctorIds: ["DOC-2003"],
  },
  {
    id: "ORG-1003",
    name: "Reddington Hospital",
    licenseNumber: "LIC-NG-30044",
    verificationStatus: "active",
    createdAt: "2026-05-20T08:15:00Z",
    contactEmail: "compliance@reddingtonhospital.com",
    address: "12 Idowu Martins Street, Victoria Island, Lagos",
    documents: [
      { id: "DOC-5", name: "Facility License", type: "License", uploadedAt: "2026-05-19T09:00:00Z" },
    ],
    doctorIds: ["DOC-2004"],
  },
  {
    id: "ORG-1004",
    name: "Wellness Point Pharmacy",
    licenseNumber: "LIC-NG-51290",
    verificationStatus: "suspended",
    createdAt: "2026-04-10T13:45:00Z",
    contactEmail: "info@wellnesspoint.ng",
    address: "18 Allen Avenue, Ikeja, Lagos",
    documents: [
      { id: "DOC-6", name: "Pharmacy License", type: "License", uploadedAt: "2026-04-09T12:00:00Z" },
    ],
    doctorIds: [],
    suspension: {
      reasonCode: "EXPIRED_LICENSE",
      reasonLabel: "Expired license",
      note: "Practice license expired 2026-08-01 and has not been renewed.",
      duration: "indefinite",
      suspendedAt: "2026-09-16T09:20:00Z",
      suspendedBy: "Amaka Chukwu",
    },
  },
  {
    id: "ORG-1005",
    name: "Sunrise Diagnostics Lab",
    licenseNumber: "LIC-NG-77031",
    verificationStatus: "pending",
    createdAt: "2026-09-17T08:00:00Z",
    contactEmail: "support@sunrisediagnostics.ng",
    address: "9 Awolowo Road, Ikoyi, Lagos",
    documents: [
      { id: "DOC-7", name: "Lab Accreditation", type: "Accreditation", uploadedAt: "2026-09-17T07:45:00Z" },
    ],
    doctorIds: [],
  },
  {
    id: "ORG-1006",
    name: "Greenfield Family Clinic",
    licenseNumber: "LIC-NG-19822",
    verificationStatus: "active",
    createdAt: "2026-03-11T10:20:00Z",
    contactEmail: "hello@greenfieldclinic.ng",
    address: "3 Herbert Macaulay Way, Yaba, Lagos",
    documents: [
      { id: "DOC-8", name: "Facility License", type: "License", uploadedAt: "2026-03-10T09:30:00Z" },
    ],
    doctorIds: ["DOC-2002"],
  },
];

export const mockDoctors: Doctor[] = [
  {
    id: "DOC-2001",
    name: "Dr. Tunde Bakare",
    credentials: "MBBS, FWACS (General Surgery)",
    verificationStatus: "active",
    orgIds: ["ORG-1001"],
    accessHistory: [
      { id: "ACC-1", action: "Viewed patient record", timestamp: "2026-09-17T15:42:00Z", orgName: "Lagos General Hospital" },
      { id: "ACC-2", action: "Logged in", timestamp: "2026-09-17T08:00:00Z", orgName: "Lagos General Hospital" },
    ],
  },
  {
    id: "DOC-2002",
    name: "Dr. Ngozi Eze",
    credentials: "MBBS, MWACP (Internal Medicine)",
    verificationStatus: "active",
    orgIds: ["ORG-1001", "ORG-1006"],
    accessHistory: [
      { id: "ACC-3", action: "Exported record set", timestamp: "2026-09-17T10:05:00Z", orgName: "Reddington Hospital" },
    ],
  },
  {
    id: "DOC-2003",
    name: "Dr. Kelechi Obi",
    credentials: "MBBS (Family Medicine)",
    verificationStatus: "pending",
    orgIds: ["ORG-1002"],
    accessHistory: [],
  },
  {
    id: "DOC-2004",
    name: "Dr. Femi Adigun",
    credentials: "MBBS, FMCP (Cardiology)",
    verificationStatus: "suspended",
    orgIds: ["ORG-1003"],
    accessHistory: [
      { id: "ACC-4", action: "Viewed patient record", timestamp: "2026-09-14T12:15:00Z", orgName: "Reddington Hospital" },
    ],
    suspension: {
      reasonCode: "PATIENT_COMPLAINT",
      reasonLabel: "Patient complaint under investigation",
      note: "Temporarily suspended pending outcome of complaint #KID-INC-0091.",
      duration: "temporary",
      suspendedAt: "2026-09-15T14:00:00Z",
      suspendedBy: "Amaka Chukwu",
    },
  },
];

export const mockOrgDoctorAuditLog: OrgDoctorAuditEntry[] = [
  {
    id: "OD-AUD-401",
    actionType: "org_suspended",
    adminName: "Amaka Chukwu",
    targetType: "organisation",
    targetId: "ORG-1004",
    targetName: "Wellness Point Pharmacy",
    reasonCode: "EXPIRED_LICENSE",
    note: "Practice license expired 2026-08-01 and has not been renewed.",
    duration: "indefinite",
    timestamp: "2026-09-16T09:20:00Z",
  },
  {
    id: "OD-AUD-400",
    actionType: "doctor_suspended",
    adminName: "Amaka Chukwu",
    targetType: "doctor",
    targetId: "DOC-2004",
    targetName: "Dr. Femi Adigun",
    reasonCode: "PATIENT_COMPLAINT",
    note: "Temporarily suspended pending outcome of complaint #KID-INC-0091.",
    duration: "temporary",
    timestamp: "2026-09-15T14:00:00Z",
  },
  {
    id: "OD-AUD-399",
    actionType: "org_approved",
    adminName: "Amaka Chukwu",
    targetType: "organisation",
    targetId: "ORG-1001",
    targetName: "Lagos General Hospital",
    documentsReviewed: ["Facility License", "Certificate of Incorporation"],
    timestamp: "2026-06-02T09:10:00Z",
  },
];
