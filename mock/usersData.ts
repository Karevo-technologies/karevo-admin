export type PatientVerificationStatus = "verified" | "pending" | "failed";
export type PatientAccountStatus = "active" | "suspended" | "pending";
export type ConsentStatus = "approved" | "pending" | "denied";

export interface PatientConsentEntry {
  id: string;
  recordType: string;
  status: ConsentStatus;
  requestedAt: string;
}

export interface PatientAccount {
  id: string;
  name: string;
  phone: string;
  verificationStatus: PatientVerificationStatus;
  accountStatus: PatientAccountStatus;
  linkedConsentCount: number;
  linkedConsents: PatientConsentEntry[];
  lastUpdated: string;
}

export const mockPatients: PatientAccount[] = [
  {
    id: "KID-20260014",
    name: "Ada Okafor",
    phone: "+234 803 442 1121",
    verificationStatus: "verified",
    accountStatus: "active",
    linkedConsentCount: 2,
    linkedConsents: [
      { id: "CONS-001", recordType: "Blood Test Result", status: "approved", requestedAt: "2026-09-15T09:00:00Z" },
      { id: "CONS-002", recordType: "Vaccination History", status: "approved", requestedAt: "2026-09-12T14:20:00Z" },
    ],
    lastUpdated: "2026-09-18T08:35:00Z",
  },
  {
    id: "KID-20260031",
    name: "Kehinde Adebayo",
    phone: "+234 809 118 4470",
    verificationStatus: "failed",
    accountStatus: "suspended",
    linkedConsentCount: 1,
    linkedConsents: [
      { id: "CONS-003", recordType: "Prescription History", status: "pending", requestedAt: "2026-09-17T10:15:00Z" },
    ],
    lastUpdated: "2026-09-16T12:00:00Z",
  },
  {
    id: "KID-20260052",
    name: "Nneka Eze",
    phone: "+234 701 660 9042",
    verificationStatus: "pending",
    accountStatus: "active",
    linkedConsentCount: 3,
    linkedConsents: [
      { id: "CONS-004", recordType: "Full Medical History", status: "pending", requestedAt: "2026-09-10T09:55:00Z" },
      { id: "CONS-005", recordType: "Care Summary", status: "approved", requestedAt: "2026-09-09T07:10:00Z" },
      { id: "CONS-006", recordType: "Lab Results", status: "denied", requestedAt: "2026-09-02T15:45:00Z" },
    ],
    lastUpdated: "2026-09-18T06:20:00Z",
  },
  {
    id: "KID-20260009",
    name: "Daniel Yusuf",
    phone: "+234 813 902 2331",
    verificationStatus: "verified",
    accountStatus: "active",
    linkedConsentCount: 4,
    linkedConsents: [
      { id: "CONS-007", recordType: "Past Procedures", status: "approved", requestedAt: "2026-09-16T08:40:00Z" },
      { id: "CONS-008", recordType: "Medical Summary", status: "approved", requestedAt: "2026-09-11T13:20:00Z" },
      { id: "CONS-009", recordType: "Immunisation Record", status: "approved", requestedAt: "2026-09-10T08:15:00Z" },
      { id: "CONS-010", recordType: "Referral Notes", status: "pending", requestedAt: "2026-09-07T12:00:00Z" },
    ],
    lastUpdated: "2026-09-17T11:42:00Z",
  },
  {
    id: "KID-20260047",
    name: "Mariam Lawal",
    phone: "+234 816 445 2217",
    verificationStatus: "pending",
    accountStatus: "pending",
    linkedConsentCount: 2,
    linkedConsents: [
      { id: "CONS-011", recordType: "Insurance Referral", status: "pending", requestedAt: "2026-09-13T11:35:00Z" },
      { id: "CONS-012", recordType: "Treatment Summary", status: "pending", requestedAt: "2026-09-11T17:18:00Z" },
    ],
    lastUpdated: "2026-09-15T09:50:00Z",
  },
];
