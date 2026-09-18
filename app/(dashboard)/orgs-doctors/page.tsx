"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Building01Icon,
  UserMultiple02Icon,
  ShieldCheckIcon,
  File01Icon,
  Search01Icon,
  AlertCircleIcon,
  CheckmarkCircle01Icon,
} from "@hugeicons/core-free-icons";
import { ProtectedRoute } from "@/components/dashboards/shared/ProtectedRoute";
import { ActivityLogItem } from "@/components/dashboards/shared/ActivityLogItem";
import { StatusBadge } from "@/components/dashboards/shared/StatusBadge";
import { EmptyState } from "@/components/common/EmptyState";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { Modal } from "@/components/common/Modal";
import { Button } from "@/components/common/Button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDate, formatDateOnly } from "@/utils/formatDate";
import type { ActivityStatus } from "@/mock/activityData";
import {
  AUDIT_ACTION_LABELS,
  REJECTION_REASON_CODES,
  SUSPENSION_REASON_CODES,
  mockOrganisations,
  mockDoctors,
  mockOrgDoctorAuditLog,
  type Organisation,
  type Doctor,
  type OrgVerificationStatus,
  type DoctorVerificationStatus,
  type OrgDoctorAuditEntry,
  type OrgDoctorActionType,
  type SuspensionDuration,
} from "@/mock/orgsDoctorsData";

// Maps this module's org/doctor statuses onto the shared 4-state status palette
// (BADGE_VARIANT_CLASSES in components/common/Badge.tsx).
const ORG_STATUS_VARIANT: Record<OrgVerificationStatus, ActivityStatus> = {
  pending: "pending",
  active: "approved",
  suspended: "declined",
  rejected: "declined",
};

const DOCTOR_STATUS_VARIANT: Record<DoctorVerificationStatus, ActivityStatus> = {
  pending: "pending",
  active: "approved",
  suspended: "declined",
};

const AUDIT_STATUS: Record<OrgDoctorActionType, ActivityStatus> = {
  org_approved: "approved",
  org_rejected: "declined",
  org_suspended: "declined",
  doctor_suspended: "declined",
};

const ORG_STATUS_FILTERS: { value: OrgVerificationStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "active", label: "Active" },
  { value: "suspended", label: "Suspended" },
];

interface SuspendTarget {
  type: "organisation" | "doctor";
  id: string;
  name: string;
}

function auditDescription(entry: OrgDoctorAuditEntry): string {
  return (
    [
      entry.note,
      entry.reasonCode && `Reason: ${entry.reasonCode}`,
      entry.duration && `Duration: ${entry.duration}`,
      entry.documentsReviewed && `Reviewed: ${entry.documentsReviewed.join(", ")}`,
    ]
      .filter(Boolean)
      .join(" · ") || "—"
  );
}

function ApproveOrgModal({
  org,
  onClose,
  onSubmit,
}: {
  org: Organisation;
  onClose: () => void;
  onSubmit: (documentsReviewed: string[]) => void;
}) {
  const [submitted, setSubmitted] = useState(false);

  return (
    <Modal open onClose={onClose} title={submitted ? "Organisation Approved" : `Approve ${org.name}`}>
      {submitted ? (
        <EmptyState
          icon={<HugeiconsIcon icon={CheckmarkCircle01Icon} size={20} />}
          title="Verification approved"
          message={`${org.name} is now active and can operate on the platform.`}
          action={<Button onClick={onClose}>Done</Button>}
        />
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Confirm the submitted documents have been reviewed before approving. This is logged with
            your admin id and a timestamp.
          </p>
          {org.documents.length === 0 ? (
            <p className="text-sm text-muted-foreground">No documents submitted.</p>
          ) : (
            <ul className="space-y-1.5 rounded-lg border border-border bg-muted/40 p-3">
              {org.documents.map((doc) => (
                <li key={doc.id} className="flex items-center gap-2 text-sm text-foreground">
                  <HugeiconsIcon icon={File01Icon} size={14} className="shrink-0 text-muted-foreground" />
                  {doc.name}
                  <span className="text-xs text-muted-foreground">({doc.type})</span>
                </li>
              ))}
            </ul>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                onSubmit(org.documents.map((doc) => doc.name));
                setSubmitted(true);
              }}
            >
              Approve organisation
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}

function RejectOrgModal({
  org,
  onClose,
  onSubmit,
}: {
  org: Organisation;
  onClose: () => void;
  onSubmit: (reasonCode: string, reasonLabel: string, note: string) => void;
}) {
  const [reasonCode, setReasonCode] = useState("");
  const [note, setNote] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const canSubmit = !!reasonCode && note.trim().length > 0;

  return (
    <Modal open onClose={onClose} title={submitted ? "Rejection Sent" : `Reject ${org.name}`}>
      {submitted ? (
        <EmptyState
          icon={<HugeiconsIcon icon={CheckmarkCircle01Icon} size={20} />}
          title="Notification sent"
          message={`${org.name} has been notified that their verification was rejected.`}
          action={<Button onClick={onClose}>Done</Button>}
        />
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Rejecting requires a reason code and a free-text note. The organisation is notified
            automatically.
          </p>
          <div className="flex flex-col gap-1.5">
            <Label>Reason</Label>
            <Select value={reasonCode} onValueChange={(v) => setReasonCode(v ?? "")}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                {REJECTION_REASON_CODES.map((reason) => (
                  <SelectItem key={reason.value} value={reason.value}>
                    {reason.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="reject-note">Note</Label>
            <Textarea
              id="reject-note"
              placeholder="Explain the rejection so the org can resolve it"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={!canSubmit}
              onClick={() => {
                const reason = REJECTION_REASON_CODES.find((r) => r.value === reasonCode);
                if (!reason) return;
                onSubmit(reason.value, reason.label, note.trim());
                setSubmitted(true);
              }}
            >
              Reject organisation
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}

function SuspendModal({
  target,
  onClose,
  onSubmit,
}: {
  target: SuspendTarget;
  onClose: () => void;
  onSubmit: (reasonCode: string, reasonLabel: string, note: string, duration: SuspensionDuration) => void;
}) {
  const [reasonCode, setReasonCode] = useState("");
  const [note, setNote] = useState("");
  const [duration, setDuration] = useState<SuspensionDuration>("temporary");
  const [submitted, setSubmitted] = useState(false);

  const canSubmit = !!reasonCode;
  const targetLabel = target.type === "organisation" ? "organisation" : "doctor";

  return (
    <Modal open onClose={onClose} title={submitted ? "Suspended" : `Suspend ${target.name}`}>
      {submitted ? (
        <EmptyState
          icon={<HugeiconsIcon icon={AlertCircleIcon} size={20} />}
          title={target.type === "organisation" ? "Organisation suspended" : "Doctor suspended"}
          message={`${target.name} has been suspended (${duration}). This action has been logged.`}
          action={<Button onClick={onClose}>Done</Button>}
        />
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Suspending requires a reason and a duration. This is recorded as an audited admin action.
          </p>
          <div className="flex flex-col gap-1.5">
            <Label>Reason</Label>
            <Select value={reasonCode} onValueChange={(v) => setReasonCode(v ?? "")}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                {SUSPENSION_REASON_CODES.map((reason) => (
                  <SelectItem key={reason.value} value={reason.value}>
                    {reason.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Duration</Label>
            <Select value={duration} onValueChange={(v) => setDuration(v as SuspensionDuration)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="temporary">Temporary</SelectItem>
                <SelectItem value="indefinite">Indefinite</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="suspend-note">Additional note (optional)</Label>
            <Textarea id="suspend-note" value={note} onChange={(e) => setNote(e.target.value)} />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={!canSubmit}
              onClick={() => {
                const reason = SUSPENSION_REASON_CODES.find((r) => r.value === reasonCode);
                if (!reason) return;
                onSubmit(reason.value, reason.label, note.trim(), duration);
                setSubmitted(true);
              }}
            >
              Suspend {targetLabel}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}

function OrgDetailModal({
  org,
  doctors,
  auditLog,
  onClose,
  onApprove,
  onReject,
  onSuspend,
}: {
  org: Organisation;
  doctors: Doctor[];
  auditLog: OrgDoctorAuditEntry[];
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
  onSuspend: () => void;
}) {
  const linkedDoctors = doctors.filter((doctor) => org.doctorIds.includes(doctor.id));
  const activity = auditLog.filter((entry) => entry.targetType === "organisation" && entry.targetId === org.id);

  return (
    <Modal open onClose={onClose} title={org.name}>
      <div className="max-h-[70vh] space-y-5 overflow-y-auto">
        <div className="flex items-center justify-between">
          <StatusBadge status={ORG_STATUS_VARIANT[org.verificationStatus]} />
          <span className="text-xs text-muted-foreground">Onboarded {formatDateOnly(org.createdAt)}</span>
        </div>

        <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
          <div>
            <p className="text-xs text-muted-foreground">License number</p>
            <p className="font-medium text-foreground">{org.licenseNumber}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Contact email</p>
            <p className="font-medium text-foreground">{org.contactEmail}</p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-xs text-muted-foreground">Address</p>
            <p className="font-medium text-foreground">{org.address}</p>
          </div>
        </div>

        {org.rejection && (
          <p className="rounded-lg bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
            Rejected {formatDate(org.rejection.rejectedAt)} by {org.rejection.rejectedBy} —{" "}
            {org.rejection.reasonLabel}: {org.rejection.note}
          </p>
        )}
        {org.suspension && (
          <p className="rounded-lg bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
            Suspended ({org.suspension.duration}) {formatDate(org.suspension.suspendedAt)} by{" "}
            {org.suspension.suspendedBy} — {org.suspension.reasonLabel}
            {org.suspension.note && `: ${org.suspension.note}`}
          </p>
        )}

        <div>
          <p className="mb-1.5 text-xs font-semibold text-muted-foreground uppercase">Documents</p>
          {org.documents.length === 0 ? (
            <p className="text-sm text-muted-foreground">No documents submitted.</p>
          ) : (
            <ul className="space-y-1.5">
              {org.documents.map((doc) => (
                <li
                  key={doc.id}
                  className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm"
                >
                  <span className="flex items-center gap-2 text-foreground">
                    <HugeiconsIcon icon={File01Icon} size={14} className="text-muted-foreground" />
                    {doc.name}
                  </span>
                  <span className="text-xs text-muted-foreground">{formatDateOnly(doc.uploadedAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <p className="mb-1.5 text-xs font-semibold text-muted-foreground uppercase">Linked doctors</p>
          {linkedDoctors.length === 0 ? (
            <p className="text-sm text-muted-foreground">No doctors linked yet.</p>
          ) : (
            <ul className="space-y-1.5">
              {linkedDoctors.map((doctor) => (
                <li
                  key={doctor.id}
                  className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm"
                >
                  <span className="text-foreground">{doctor.name}</span>
                  <StatusBadge status={DOCTOR_STATUS_VARIANT[doctor.verificationStatus]} />
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <p className="mb-1.5 text-xs font-semibold text-muted-foreground uppercase">Activity</p>
          {activity.length === 0 ? (
            <p className="text-sm text-muted-foreground">No recorded activity yet.</p>
          ) : (
            activity.map((entry) => (
              <ActivityLogItem
                key={entry.id}
                item={{
                  id: entry.id,
                  action: AUDIT_ACTION_LABELS[entry.actionType],
                  description: auditDescription(entry),
                  timestamp: entry.timestamp,
                  status: AUDIT_STATUS[entry.actionType],
                }}
              />
            ))
          )}
        </div>

        <div className="flex flex-wrap justify-end gap-2 border-t border-border pt-4">
          {org.verificationStatus === "pending" && (
            <>
              <Button variant="destructive" onClick={onReject}>
                Reject
              </Button>
              <Button onClick={onApprove}>Approve</Button>
            </>
          )}
          {org.verificationStatus === "active" && (
            <Button variant="destructive" onClick={onSuspend}>
              Suspend organisation
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}

function DoctorDetailModal({
  doctor,
  organisations,
  onClose,
  onSuspend,
}: {
  doctor: Doctor;
  organisations: Organisation[];
  onClose: () => void;
  onSuspend: () => void;
}) {
  const linkedOrgs = organisations.filter((org) => doctor.orgIds.includes(org.id));

  return (
    <Modal open onClose={onClose} title={doctor.name}>
      <div className="max-h-[70vh] space-y-5 overflow-y-auto">
        <div className="flex items-center justify-between">
          <StatusBadge status={DOCTOR_STATUS_VARIANT[doctor.verificationStatus]} />
        </div>

        <div>
          <p className="text-xs text-muted-foreground">Credentials</p>
          <p className="text-sm font-medium text-foreground">{doctor.credentials}</p>
        </div>

        {doctor.suspension && (
          <p className="rounded-lg bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
            Suspended ({doctor.suspension.duration}) {formatDate(doctor.suspension.suspendedAt)} by{" "}
            {doctor.suspension.suspendedBy} — {doctor.suspension.reasonLabel}
            {doctor.suspension.note && `: ${doctor.suspension.note}`}
          </p>
        )}

        <div>
          <p className="mb-1.5 text-xs font-semibold text-muted-foreground uppercase">Organisations</p>
          {linkedOrgs.length === 0 ? (
            <p className="text-sm text-muted-foreground">Not linked to any organisation.</p>
          ) : (
            <ul className="space-y-1.5">
              {linkedOrgs.map((org) => (
                <li
                  key={org.id}
                  className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm"
                >
                  <span className="text-foreground">{org.name}</span>
                  <StatusBadge status={ORG_STATUS_VARIANT[org.verificationStatus]} />
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <p className="mb-1.5 text-xs font-semibold text-muted-foreground uppercase">Access history</p>
          {doctor.accessHistory.length === 0 ? (
            <p className="text-sm text-muted-foreground">No recorded access history yet.</p>
          ) : (
            doctor.accessHistory.map((event) => (
              <ActivityLogItem
                key={event.id}
                item={{
                  id: event.id,
                  action: event.action,
                  description: event.orgName ?? "",
                  timestamp: event.timestamp,
                  status: "viewed",
                  orgName: event.orgName,
                }}
              />
            ))
          )}
        </div>

        {doctor.verificationStatus === "active" && (
          <div className="flex justify-end border-t border-border pt-4">
            <Button variant="destructive" onClick={onSuspend}>
              Suspend doctor
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
}

function OrgsDoctorsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const statusParam = (searchParams.get("status") as OrgVerificationStatus | "all") ?? "all";

  const [organisations, setOrganisations] = useState<Organisation[]>(mockOrganisations);
  const [doctors, setDoctors] = useState<Doctor[]>(mockDoctors);
  const [auditLog, setAuditLog] = useState<OrgDoctorAuditEntry[]>(mockOrgDoctorAuditLog);

  const [orgSearch, setOrgSearch] = useState("");
  const [doctorSearch, setDoctorSearch] = useState("");

  const [viewOrgId, setViewOrgId] = useState<string | null>(null);
  const [viewDoctorId, setViewDoctorId] = useState<string | null>(null);
  const [approveOrgId, setApproveOrgId] = useState<string | null>(null);
  const [rejectOrgId, setRejectOrgId] = useState<string | null>(null);
  const [suspendTarget, setSuspendTarget] = useState<SuspendTarget | null>(null);

  const currentAdmin = "Amaka Chukwu";

  const setStatusFilter = (value: OrgVerificationStatus | "all") => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") params.delete("status");
    else params.set("status", value);
    router.replace(params.size > 0 ? `/orgs-doctors?${params.toString()}` : "/orgs-doctors");
  };

  const filteredOrgs = useMemo(() => {
    return organisations.filter((org) => {
      if (statusParam !== "all" && org.verificationStatus !== statusParam) return false;
      if (orgSearch.trim()) {
        const haystack = `${org.name} ${org.licenseNumber} ${org.contactEmail}`.toLowerCase();
        if (!haystack.includes(orgSearch.trim().toLowerCase())) return false;
      }
      return true;
    });
  }, [organisations, statusParam, orgSearch]);

  const pendingOrgs = useMemo(
    () => organisations.filter((org) => org.verificationStatus === "pending"),
    [organisations]
  );

  const filteredDoctors = useMemo(() => {
    return doctors.filter((doctor) => {
      if (doctorSearch.trim()) {
        const haystack = `${doctor.name} ${doctor.credentials}`.toLowerCase();
        if (!haystack.includes(doctorSearch.trim().toLowerCase())) return false;
      }
      return true;
    });
  }, [doctors, doctorSearch]);

  const viewOrg = organisations.find((org) => org.id === viewOrgId) ?? null;
  const viewDoctor = doctors.find((doctor) => doctor.id === viewDoctorId) ?? null;
  const approveOrg = organisations.find((org) => org.id === approveOrgId) ?? null;
  const rejectOrg = organisations.find((org) => org.id === rejectOrgId) ?? null;

  const orgName = (id: string) => organisations.find((org) => org.id === id)?.name ?? id;

  const handleApprove = (org: Organisation, documentsReviewed: string[]) => {
    setOrganisations((prev) =>
      prev.map((o) => (o.id === org.id ? { ...o, verificationStatus: "active" } : o))
    );
    setAuditLog((prev) => [
      {
        id: `OD-AUD-${Date.now()}`,
        actionType: "org_approved",
        adminName: currentAdmin,
        targetType: "organisation",
        targetId: org.id,
        targetName: org.name,
        documentsReviewed,
        timestamp: new Date().toISOString(),
      },
      ...prev,
    ]);
  };

  const handleReject = (org: Organisation, reasonCode: string, reasonLabel: string, note: string) => {
    const timestamp = new Date().toISOString();
    setOrganisations((prev) =>
      prev.map((o) =>
        o.id === org.id
          ? {
              ...o,
              verificationStatus: "rejected",
              rejection: { reasonCode, reasonLabel, note, rejectedAt: timestamp, rejectedBy: currentAdmin },
            }
          : o
      )
    );
    setAuditLog((prev) => [
      {
        id: `OD-AUD-${Date.now()}`,
        actionType: "org_rejected",
        adminName: currentAdmin,
        targetType: "organisation",
        targetId: org.id,
        targetName: org.name,
        reasonCode,
        note,
        timestamp,
      },
      ...prev,
    ]);
  };

  const handleSuspend = (
    target: SuspendTarget,
    reasonCode: string,
    reasonLabel: string,
    note: string,
    duration: SuspensionDuration
  ) => {
    const timestamp = new Date().toISOString();
    const suspension = {
      reasonCode,
      reasonLabel,
      note: note || undefined,
      duration,
      suspendedAt: timestamp,
      suspendedBy: currentAdmin,
    };

    if (target.type === "organisation") {
      setOrganisations((prev) =>
        prev.map((o) => (o.id === target.id ? { ...o, verificationStatus: "suspended", suspension } : o))
      );
    } else {
      setDoctors((prev) =>
        prev.map((d) => (d.id === target.id ? { ...d, verificationStatus: "suspended", suspension } : d))
      );
    }

    setAuditLog((prev) => [
      {
        id: `OD-AUD-${Date.now()}`,
        actionType: target.type === "organisation" ? "org_suspended" : "doctor_suspended",
        adminName: currentAdmin,
        targetType: target.type,
        targetId: target.id,
        targetName: target.name,
        reasonCode,
        note: note || undefined,
        duration,
        timestamp,
      },
      ...prev,
    ]);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Orgs & Doctors</h1>
        <p className="text-sm text-muted-foreground">
          Organisation onboarding, verification queue, and doctor credential management (spec §4.2).
        </p>
      </div>

      <div className="flex items-start gap-2 rounded-lg border border-border bg-card px-3.5 py-2.5 text-xs text-muted-foreground">
        <HugeiconsIcon icon={ShieldCheckIcon} size={15} className="mt-0.5 shrink-0 text-primary" />
        <span>
          Approvals, rejections, and suspensions are audited admin actions — every one is logged with an
          admin id, a timestamp, and the required reason.
        </span>
      </div>

      <Tabs defaultValue="organisations">
        <TabsList>
          <TabsTrigger value="organisations">Organisations</TabsTrigger>
          <TabsTrigger value="queue">
            Verification Queue
            {pendingOrgs.length > 0 && (
              <span className="ml-1 rounded-full bg-muted px-1.5 py-0.5 text-[11px]">
                {pendingOrgs.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="doctors">Doctors</TabsTrigger>
        </TabsList>

        <TabsContent value="organisations" className="mt-4 space-y-4">
          <Card className="rounded-2xl">
            <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto]">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="org-search">Search</Label>
                <div className="relative">
                  <HugeiconsIcon
                    icon={Search01Icon}
                    size={15}
                    className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <Input
                    id="org-search"
                    placeholder="Name, license number, or email"
                    value={orgSearch}
                    onChange={(e) => setOrgSearch(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Status</Label>
                <Select value={statusParam} onValueChange={(v) => setStatusFilter(v as OrgVerificationStatus | "all")}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ORG_STATUS_FILTERS.map((filter) => (
                      <SelectItem key={filter.value} value={filter.value}>
                        {filter.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardContent className="divide-y divide-border">
              {filteredOrgs.length === 0 ? (
                <EmptyState
                  icon={<HugeiconsIcon icon={Building01Icon} size={20} />}
                  title="No matching organisations"
                  message="Try a different search term or status filter."
                />
              ) : (
                filteredOrgs.map((org) => (
                  <button
                    key={org.id}
                    type="button"
                    onClick={() => setViewOrgId(org.id)}
                    className="flex w-full flex-wrap items-center justify-between gap-3 py-3.5 text-left first:pt-0 last:pb-0"
                  >
                    <div>
                      <p className="text-sm font-semibold text-foreground">{org.name}</p>
                      <p className="text-[13px] text-muted-foreground">
                        {org.licenseNumber} · {org.doctorIds.length} linked doctor
                        {org.doctorIds.length === 1 ? "" : "s"}
                      </p>
                    </div>
                    <StatusBadge status={ORG_STATUS_VARIANT[org.verificationStatus]} />
                  </button>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="queue" className="mt-4">
          <Card className="rounded-2xl">
            <CardContent className="divide-y divide-border">
              {pendingOrgs.length === 0 ? (
                <EmptyState
                  icon={<HugeiconsIcon icon={CheckmarkCircle01Icon} size={20} />}
                  title="Queue is empty"
                  message="Newly submitted organisations awaiting verification will appear here."
                />
              ) : (
                pendingOrgs.map((org) => (
                  <div key={org.id} className="flex flex-wrap items-center justify-between gap-3 py-3.5 first:pt-0 last:pb-0">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{org.name}</p>
                      <p className="text-[13px] text-muted-foreground">
                        {org.licenseNumber} · submitted {formatDateOnly(org.createdAt)} · {org.documents.length}{" "}
                        document{org.documents.length === 1 ? "" : "s"}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <Button variant="outline" size="sm" onClick={() => setViewOrgId(org.id)}>
                        Details
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => setRejectOrgId(org.id)}>
                        Reject
                      </Button>
                      <Button size="sm" onClick={() => setApproveOrgId(org.id)}>
                        Approve
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="doctors" className="mt-4 space-y-4">
          <Card className="rounded-2xl">
            <CardContent>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="doctor-search">Search</Label>
                <div className="relative">
                  <HugeiconsIcon
                    icon={Search01Icon}
                    size={15}
                    className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <Input
                    id="doctor-search"
                    placeholder="Name or credentials"
                    value={doctorSearch}
                    onChange={(e) => setDoctorSearch(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardContent className="divide-y divide-border">
              {filteredDoctors.length === 0 ? (
                <EmptyState
                  icon={<HugeiconsIcon icon={UserMultiple02Icon} size={20} />}
                  title="No matching doctors"
                  message="Try a different search term."
                />
              ) : (
                filteredDoctors.map((doctor) => (
                  <button
                    key={doctor.id}
                    type="button"
                    onClick={() => setViewDoctorId(doctor.id)}
                    className="flex w-full flex-wrap items-center justify-between gap-3 py-3.5 text-left first:pt-0 last:pb-0"
                  >
                    <div>
                      <p className="text-sm font-semibold text-foreground">{doctor.name}</p>
                      <p className="text-[13px] text-muted-foreground">
                        {doctor.credentials} · {doctor.orgIds.map((id) => orgName(id)).join(", ") || "No org"}
                      </p>
                    </div>
                    <StatusBadge status={DOCTOR_STATUS_VARIANT[doctor.verificationStatus]} />
                  </button>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {viewOrg && (
        <OrgDetailModal
          org={viewOrg}
          doctors={doctors}
          auditLog={auditLog}
          onClose={() => setViewOrgId(null)}
          onApprove={() => {
            setViewOrgId(null);
            setApproveOrgId(viewOrg.id);
          }}
          onReject={() => {
            setViewOrgId(null);
            setRejectOrgId(viewOrg.id);
          }}
          onSuspend={() => {
            setViewOrgId(null);
            setSuspendTarget({ type: "organisation", id: viewOrg.id, name: viewOrg.name });
          }}
        />
      )}

      {viewDoctor && (
        <DoctorDetailModal
          doctor={viewDoctor}
          organisations={organisations}
          onClose={() => setViewDoctorId(null)}
          onSuspend={() => {
            setViewDoctorId(null);
            setSuspendTarget({ type: "doctor", id: viewDoctor.id, name: viewDoctor.name });
          }}
        />
      )}

      {approveOrg && (
        <ApproveOrgModal
          org={approveOrg}
          onClose={() => setApproveOrgId(null)}
          onSubmit={(documentsReviewed) => handleApprove(approveOrg, documentsReviewed)}
        />
      )}

      {rejectOrg && (
        <RejectOrgModal
          org={rejectOrg}
          onClose={() => setRejectOrgId(null)}
          onSubmit={(reasonCode, reasonLabel, note) => handleReject(rejectOrg, reasonCode, reasonLabel, note)}
        />
      )}

      {suspendTarget && (
        <SuspendModal
          target={suspendTarget}
          onClose={() => setSuspendTarget(null)}
          onSubmit={(reasonCode, reasonLabel, note, duration) =>
            handleSuspend(suspendTarget, reasonCode, reasonLabel, note, duration)
          }
        />
      )}
    </div>
  );
}

export default function OrgsDoctorsPage() {
  return (
    <ProtectedRoute module="orgs_doctors">
      <Suspense fallback={<LoadingSpinner />}>
        <OrgsDoctorsContent />
      </Suspense>
    </ProtectedRoute>
  );
}
