// Placeholder data for the Support & Config module (docs/SUPER_ADMIN_DASHBOARD.md §4.6)
// until this reads from the real SupportTicket / FeatureFlag / ConsentFormVersion tables.
// Spec explicitly allows a simpler v1 here ("even a shared inbox") — lowest-urgency module (§8).

export type TicketStatus = "open" | "pending" | "resolved" | "closed";
export type TicketPriority = "low" | "normal" | "high" | "urgent";
export type AccountType = "organisation" | "user";

export interface TicketAccountMeta {
  type: AccountType;
  id: string;
  name: string;
  contactEmail: string;
  licenseNumber?: string;
  verificationStatus?: string;
  patientId?: string;
  identityVerificationStatus?: string;
}

export interface SupportTicket {
  id: string;
  subject: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  account: TicketAccountMeta;
  createdAt: string;
  updatedAt: string;
  internalNote?: string;
}

export const TICKET_STATUS_LABELS: Record<TicketStatus, string> = {
  open: "Open",
  pending: "Pending",
  resolved: "Resolved",
  closed: "Closed",
};

export const TICKET_PRIORITY_LABELS: Record<TicketPriority, string> = {
  low: "Low",
  normal: "Normal",
  high: "High",
  urgent: "Urgent",
};

export const mockTickets: SupportTicket[] = [
  {
    id: "TCK-5081",
    subject: "Unable to link new doctor to organisation",
    description:
      "Admin at St. Nicholas Clinic reports the 'Add doctor' action fails silently when the doctor's license number contains a hyphen.",
    status: "open",
    priority: "high",
    account: {
      type: "organisation",
      id: "ORG-1002",
      name: "St. Nicholas Clinic",
      contactEmail: "ops@stnicholasclinic.ng",
      licenseNumber: "LIC-NG-44120",
      verificationStatus: "pending",
    },
    createdAt: "2026-09-18T09:12:00Z",
    updatedAt: "2026-09-18T09:12:00Z",
  },
  {
    id: "TCK-5080",
    subject: "Patient can't see exported record in app",
    description: "Patient says a record export approved yesterday still doesn't show in their downloads list.",
    status: "pending",
    priority: "normal",
    account: {
      type: "user",
      id: "KID-20260009",
      name: "Ifeoma Nwosu",
      contactEmail: "ifeoma.n@example.com",
      patientId: "KID-20260009",
      identityVerificationStatus: "verified",
    },
    createdAt: "2026-09-17T14:20:00Z",
    updatedAt: "2026-09-18T08:05:00Z",
    internalNote: "Checked export queue — file generated but notification email bounced. Resending.",
  },
  {
    id: "TCK-5079",
    subject: "Request to update org billing contact",
    description: "Reddington Hospital wants their billing contact email updated ahead of next invoice cycle.",
    status: "resolved",
    priority: "low",
    account: {
      type: "organisation",
      id: "ORG-1003",
      name: "Reddington Hospital",
      contactEmail: "compliance@reddingtonhospital.com",
      licenseNumber: "LIC-NG-30044",
      verificationStatus: "active",
    },
    createdAt: "2026-09-15T10:00:00Z",
    updatedAt: "2026-09-15T16:40:00Z",
    internalNote: "Updated billing contact per email confirmation from ops director.",
  },
  {
    id: "TCK-5078",
    subject: "Login MFA code not arriving",
    description: "Doctor at Lagos General Hospital not receiving SMS MFA codes for the last two login attempts.",
    status: "closed",
    priority: "urgent",
    account: {
      type: "user",
      id: "KID-20260052",
      name: "Chinedu Okafor",
      contactEmail: "c.okafor@example.com",
      patientId: "KID-20260052",
      identityVerificationStatus: "manual_review",
    },
    createdAt: "2026-09-12T08:30:00Z",
    updatedAt: "2026-09-12T12:15:00Z",
    internalNote: "Carrier-side SMS delay. Resolved once codes started arriving; advised user to allow a few minutes.",
  },
];

export interface FeatureFlag {
  id: string;
  key: string;
  label: string;
  description: string;
  enabled: boolean;
  rolloutPercentage: number;
  updatedAt: string;
  updatedBy: string;
}

export const ROLLOUT_OPTIONS = [0, 10, 25, 50, 75, 100];

export const mockFeatureFlags: FeatureFlag[] = [
  {
    id: "FLAG-1",
    key: "anomaly_detection_v2",
    label: "Anomaly Detection v2",
    description: "New scoring model for the record-access anomaly flags surfaced in Records & Consent.",
    enabled: true,
    rolloutPercentage: 25,
    updatedAt: "2026-09-16T11:00:00Z",
    updatedBy: "Amaka Chukwu",
  },
  {
    id: "FLAG-2",
    key: "doctor_self_serve_onboarding",
    label: "Doctor Self-Serve Onboarding",
    description: "Lets doctors submit credentials directly instead of going through an org admin.",
    enabled: false,
    rolloutPercentage: 0,
    updatedAt: "2026-09-10T09:30:00Z",
    updatedBy: "Amaka Chukwu",
  },
  {
    id: "FLAG-3",
    key: "consent_reminder_emails",
    label: "Consent Reminder Emails",
    description: "Sends patients a reminder email 24h before a pending consent request expires.",
    enabled: true,
    rolloutPercentage: 100,
    updatedAt: "2026-09-05T13:45:00Z",
    updatedBy: "Femi Adigun",
  },
];

export type ConsentDocumentType = "consent_form" | "terms_of_service";

export const DOCUMENT_TYPE_LABELS: Record<ConsentDocumentType, string> = {
  consent_form: "Consent Form",
  terms_of_service: "Terms of Service",
};

export interface DocumentVersion {
  documentType: ConsentDocumentType;
  version: string;
  publishedAt: string;
  changeSummary: string;
}

export const mockDocumentVersions: DocumentVersion[] = [
  {
    documentType: "consent_form",
    version: "v3.2",
    publishedAt: "2026-08-01T00:00:00Z",
    changeSummary: "Added explicit opt-in for research-use data sharing.",
  },
  {
    documentType: "consent_form",
    version: "v3.1",
    publishedAt: "2026-05-14T00:00:00Z",
    changeSummary: "Clarified record retention period language.",
  },
  {
    documentType: "terms_of_service",
    version: "v2.4",
    publishedAt: "2026-07-20T00:00:00Z",
    changeSummary: "Updated dispute resolution clause for NDPR alignment.",
  },
  {
    documentType: "terms_of_service",
    version: "v2.3",
    publishedAt: "2026-03-02T00:00:00Z",
    changeSummary: "Added org-level data processing addendum.",
  },
];

export interface AgreementRecord {
  id: string;
  accountType: AccountType;
  accountName: string;
  documentType: ConsentDocumentType;
  version: string;
  agreedAt: string;
}

export const mockAgreementRecords: AgreementRecord[] = [
  {
    id: "AGR-901",
    accountType: "user",
    accountName: "Ifeoma Nwosu",
    documentType: "consent_form",
    version: "v3.2",
    agreedAt: "2026-08-03T10:00:00Z",
  },
  {
    id: "AGR-900",
    accountType: "organisation",
    accountName: "Lagos General Hospital",
    documentType: "terms_of_service",
    version: "v2.4",
    agreedAt: "2026-07-21T09:00:00Z",
  },
  {
    id: "AGR-899",
    accountType: "user",
    accountName: "Chinedu Okafor",
    documentType: "consent_form",
    version: "v3.1",
    agreedAt: "2026-05-15T08:30:00Z",
  },
  {
    id: "AGR-898",
    accountType: "organisation",
    accountName: "Reddington Hospital",
    documentType: "terms_of_service",
    version: "v2.3",
    agreedAt: "2026-03-03T11:20:00Z",
  },
];

export type BroadcastAudience = "all" | "organisations" | "doctors" | "patients";

export const BROADCAST_AUDIENCE_LABELS: Record<BroadcastAudience, string> = {
  all: "Everyone",
  organisations: "Organisations",
  doctors: "Doctors",
  patients: "Patients",
};

export interface BroadcastMessage {
  id: string;
  title: string;
  body: string;
  audience: BroadcastAudience;
  sentAt: string;
  sentBy: string;
}

export const mockBroadcasts: BroadcastMessage[] = [
  {
    id: "BC-201",
    title: "Scheduled maintenance — Sept 21, 1–2am WAT",
    body: "The platform will be briefly unavailable for scheduled maintenance. No action is needed on your part.",
    audience: "all",
    sentAt: "2026-09-17T15:00:00Z",
    sentBy: "Amaka Chukwu",
  },
  {
    id: "BC-200",
    title: "New consent form version published",
    body: "We've updated the patient consent form to v3.2. Existing consents remain valid; new requests use the updated form.",
    audience: "organisations",
    sentAt: "2026-08-01T09:00:00Z",
    sentBy: "Femi Adigun",
  },
];
