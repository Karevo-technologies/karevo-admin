# Karevo Super Admin Dashboard — Technical Documentation

## 1. Purpose & scope

This document specifies the internal Super Admin Dashboard for Karevo (K-ID), the patient-identity and records-verification platform. This is not a public-facing product — it is an internal tool used by Karevo staff to manage organisations, doctors, patients, records governance, compliance, and platform operations across the two existing surfaces: the Doctors/Organisation Dashboard and the Users Webapp.

Out of scope: patient-facing or doctor-facing features. This doc only covers the internal admin surface.

## 2. Architecture overview

### 2.1 Suggested stack

- **Frontend:** Next.js (matches the existing Vercel-hosted apps, so the team can share components/design tokens)
- **Backend:** Same API layer the doctors dashboard and users webapp already consume, extended with admin-scoped endpoints — do not stand up a separate backend unless the existing one can't support row-level access control cleanly
- **Auth:** Separate auth realm from patient/doctor auth. Admin sessions should never share a token namespace with patient or doctor sessions, even if they hit the same API gateway
- **Database:** Reuse the existing data store; admin dashboard should be read-heavy against existing tables plus a small number of admin-specific tables (roles, audit log, support tickets)

### 2.2 Deployment

- Separate subdomain (e.g. `admin.karevo.app`), not a route under an existing app — this keeps the attack surface and auth boundary clean
- IP allowlisting or VPN-gating strongly recommended given the sensitivity of the data (patient identity + health records)
- Should **NOT** be indexable — robots.txt disallow, no public links anywhere

## 3. Roles & permissions (RBAC)

This is the most important section. Get this wrong and you either lock out staff who need access or expose patient data to staff who shouldn't see it.

| Role | Can see | Cannot see |
| --- | --- | --- |
| Super admin | Everything, including raw record contents in exceptional/audited circumstances | N/A — but every raw-record view must be logged and justified with a reason code |
| Compliance officer | Audit logs, consent records, NDPR tooling, incident reports | Should NOT need raw patient record contents by default |
| Ops / support agent | Org and user account metadata, support tickets, verification status | Should NOT see record contents or full audit trail — only enough to resolve a ticket |
| Analyst | Aggregated metrics and dashboards only | No individual patient, doctor, or org records at all |

**Implementation notes:**

- Enforce this at the API layer, not just hidden UI — a support agent's token must be rejected server-side if it requests a records endpoint, not merely have the button hidden client-side.
- Every role assignment/change is itself an audited event.
- Consider requiring a second admin's approval ("four-eyes") for any raw record access outside a ticket context.

## 4. Module specifications

### 4.1 Overview

- Platform-wide KPIs: active orgs, active doctors, active patients, records created/accessed (rolling 7/30/90-day)
- System health indicators (API error rate, verification queue backlog)
- Data source: aggregated read-only queries — should be cached, not hitting production tables live on every page load

### 4.2 Orgs & doctors

**Entities:** Organisation, Doctor/Practitioner, OrgMembership

**Screens:**

- Org list (filter: pending verification / active / suspended)
- Org detail: license/credential documents, submitted verification info, linked doctors, activity summary
- Verification queue: approve/reject with a required reason; rejection triggers a notification to the org
- Doctor detail: credentials, which orgs they belong to, access history

**Key actions & required audit fields:**

| Action | Required metadata logged |
| --- | --- |
| Approve org | admin id, timestamp, documents reviewed |
| Reject org | admin id, timestamp, reason code, free-text note |
| Suspend org/doctor | admin id, timestamp, reason, duration (temporary/indefinite) |

### 4.3 Users (patients)

**Entities:** PatientAccount, IdentityVerification

**Screens:**

- Search (by ID, name, phone — never expose full search-by-name to lower-privilege roles if it could enable fishing for a specific person)
- Account detail: verification status, linked consents, account status
- Identity dispute/recovery workflow: manual override for failed automated KYC, with mandatory reason + evidence attachment

### 4.4 Records & consent

This is the trust-critical module. Build it defensively.

**Entities:** ConsentRequest, RecordAccessEvent, AuditLogEntry

**Screens:**

- Audit log viewer: searchable/filterable by patient, org, doctor, date range, action type. This is the single most important screen in the whole dashboard — regulators, disputes, and incident response all route through it.
- Consent request monitor: pending / approved / denied / expired, with the ability to drill into why a request was denied (patient-side reason if provided)
- Anomaly flags: e.g. an org's record-access volume spikes 3x above its trailing average — surfaced automatically, not something an admin has to notice by eye

**Non-negotiable requirement:** every read of a raw record by anyone, including super admins, must generate an immutable audit log entry. No exceptions, no "debug mode" bypass.

### 4.5 Compliance & security

- NDPR tooling: data subject access requests (export), right-to-erasure requests (with a defined retention exception list — some records may be legally required to be retained even after an erasure request; document this list explicitly with legal)
- Security alerts: failed login spikes, impossible-travel logins, brute-force detection
- Incident response: a documented "freeze this account/org now" action that takes effect immediately and is reversible only by a second admin

### 4.6 Support & config

- Support tickets scoped to an org/user account, with the account's key metadata inline so agents don't need separate lookups
- Feature flags / staged rollout toggles
- Consent form and Terms of Service versioning — track which version each user/org agreed to and when
- Notification broadcast tool for platform-wide announcements

## 5. Data model (core entities)

```
Organisation
├── id, name, license_number, verification_status, created_at
├── has_many: Doctors (via OrgMembership)
└── has_many: AuditLogEntries (as actor context)

Doctor
├── id, name, credentials, verification_status
└── belongs_to_many: Organisations

PatientAccount
├── id, identity_verification_status, created_at
└── has_many: ConsentRequests

ConsentRequest
├── id, patient_id, requesting_org_id, status (pending/approved/denied/expired)
├── requested_at, resolved_at
└── has_many: RecordAccessEvents (once approved)

RecordAccessEvent
├── id, patient_id, org_id, doctor_id, accessed_at, action (view/export/etc)
└── linked_consent_request_id

AdminUser
├── id, role, created_at
└── has_many: AdminActionLogEntries

AdminActionLogEntry  (separate from RecordAccessEvent — this logs *admin* actions on the dashboard itself)
├── admin_id, action, target_type, target_id, reason_code, timestamp
```

## 6. Security requirements

- All admin sessions require MFA — no exceptions, including for support/analyst roles
- Session timeout shorter than patient/doctor-facing apps (recommend 15–30 min idle timeout given data sensitivity)
- Every admin action that modifies state (approve, reject, suspend, freeze, export) requires a reason code — free-text alone is not queryable at scale later
- Raw record contents should never be cached client-side; render server-side per request and avoid storing in browser memory longer than needed
- Rate-limit and monitor the audit log search endpoint itself — an admin account doing unusual bulk searches is itself a signal worth flagging

## 7. Non-functional requirements

| Requirement | Target |
| --- | --- |
| Audit log write latency | Synchronous — a record access should not complete if the audit write fails |
| Dashboard load time (Overview) | Under 2s on cached aggregates |
| Audit log retention | Per NDPR/legal guidance — confirm with legal before setting a default (do not guess a number here) |
| Uptime | Lower priority than the patient/doctor-facing apps, but verification-queue and freeze-account actions should have high availability since they're often used in time-sensitive situations |

## 8. Build sequencing (recommended)

1. **Auth & RBAC foundation** — nothing else should be built until role-based access control is enforced server-side
2. **Orgs & doctors module** — unblocks onboarding, which everything downstream depends on
3. **Records & consent module** — the trust-critical piece; audit logging must exist before this ships
4. **Compliance & security module** — builds on audit log data already being captured
5. **Overview/analytics** — mostly reporting on data the earlier modules already generate
6. **Support & config** — lowest urgency, can be a simpler v1 (even a shared inbox) before a full ticketing UI is justified

## 9. Open questions to resolve before build

- What is the legal data retention period for audit logs and record-access events under NDPR guidance for Karevo specifically?
- Does "super admin" ever need unaudited raw record access (e.g. for debugging), or should that path simply not exist?
- Will compliance officers be internal Karevo staff only, or could a partner organisation ever need read access to their own audit trail (a self-service compliance export)?
- What's the SLA for the verification queue — how fast must a new org be approved/rejected?
