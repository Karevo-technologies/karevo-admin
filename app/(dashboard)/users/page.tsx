"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  CheckmarkCircle01Icon,
  Clock01Icon,
  File01Icon,
  Search01Icon,
  ShieldCheckIcon,
  UserMultiple02Icon,
} from "@hugeicons/core-free-icons";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/common/Button";
import { Badge } from "@/components/common/Badge";
import { Modal } from "@/components/common/Modal";
import { ProtectedRoute } from "@/components/dashboards/shared/ProtectedRoute";
import { StatusBadge } from "@/components/dashboards/shared/StatusBadge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";
import type { AdminRole } from "@/lib/rbac";
import type { ActivityStatus } from "@/mock/activityData";
import { mockPatients, type PatientAccount, type PatientAccountStatus, type PatientVerificationStatus } from "@/mock/usersData";
import { Textarea } from "@/components/ui/textarea";

type SearchType = "id" | "phone" | "name";

type RecoveryFormState = {
  reasonCode: string;
  explanation: string;
  evidenceName: string;
};

const RECOVERY_REASON_CODES = [
  { value: "DOCUMENT_REVIEW_COMPLETED", label: "Document review completed" },
  { value: "IDENTITY_MISMATCH_RESOLVED", label: "Identity mismatch resolved" },
  { value: "KYC_PROVIDER_FAILURE", label: "KYC provider failure" },
  { value: "OTHER", label: "Other" },
] as const;

const VERIFICATION_STATUS_MAP: Record<PatientVerificationStatus, ActivityStatus> = {
  verified: "approved",
  pending: "pending",
  failed: "declined",
};

const VERIFICATION_STATUS_LABELS: Record<PatientVerificationStatus, string> = {
  verified: "Verified",
  pending: "Pending",
  failed: "Failed",
};

const ACCOUNT_STATUS_MAP: Record<PatientAccountStatus, ActivityStatus> = {
  active: "approved",
  pending: "pending",
  suspended: "declined",
};

const ACCOUNT_STATUS_LABELS: Record<PatientAccountStatus, string> = {
  active: "Active",
  pending: "Pending",
  suspended: "Suspended",
};

function normalizeSearch(value: string) {
  return value.trim().toLowerCase();
}

function searchMatches(patient: PatientAccount, type: SearchType, query: string, role: AdminRole) {
  const normalized = normalizeSearch(query);
  if (!normalized) return true;

  if (type === "id") return patient.id.toLowerCase().includes(normalized);
  if (type === "phone") {
    const phoneQuery = normalized.replace(/\D/g, "");
    return Boolean(phoneQuery) && patient.phone.replace(/\D/g, "").includes(phoneQuery);
  }
  return role === "super_admin" && patient.name.toLowerCase().includes(normalized);
}

function UsersContent() {
  const { user } = useAuth();
  const router = useRouter();
  const role = user?.role ?? "super_admin";

  const roleSearchOptions: { value: SearchType; label: string }[] =
    role === "super_admin"
      ? [
          { value: "id", label: "Patient ID" },
          { value: "phone", label: "Phone number" },
          { value: "name", label: "Patient name" },
        ]
      : [
          { value: "id", label: "Patient ID" },
          { value: "phone", label: "Phone number" },
        ];

  const [searchType, setSearchType] = useState<SearchType>(roleSearchOptions[0].value);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const patients = mockPatients;
  const [submittedRecoveryIds, setSubmittedRecoveryIds] = useState<string[]>([]);
  const [isRecoveryOpen, setIsRecoveryOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<PatientAccount | null>(null);
  const [isSubmittingRecovery, setIsSubmittingRecovery] = useState(false);
  const [recoverySuccess, setRecoverySuccess] = useState(false);
  const [recoveryForm, setRecoveryForm] = useState<RecoveryFormState>({ reasonCode: "", explanation: "", evidenceName: "" });
  const [touched, setTouched] = useState({ reasonCode: false, explanation: false, evidence: false });

  const filteredPatients = useMemo(() => {
    const query = activeSearch.trim();
    if (!query) return [];
    return patients.filter((patient) => searchMatches(patient, searchType, query, role));
  }, [activeSearch, patients, role, searchType]);

  const visiblePatient =
    filteredPatients.find((patient) => patient.id === selectedPatientId) ?? filteredPatients[0] ?? null;

  const patientDetail = selectedPatient ?? visiblePatient;

  const handleSearch = () => {
    if (!searchTerm.trim()) {
      setActiveSearch("");
      setSelectedPatientId(null);
      setSelectedPatient(null);
      return;
    }

    setActiveSearch(searchTerm.trim());
    setSelectedPatientId(null);
    setSelectedPatient(null);
  };

  const resetRecoveryForm = () => {
    setRecoveryForm({ reasonCode: "", explanation: "", evidenceName: "" });
    setTouched({ reasonCode: false, explanation: false, evidence: false });
    setRecoverySuccess(false);
    setIsSubmittingRecovery(false);
  };

  const openRecoveryFlow = (patient: PatientAccount) => {
    setSelectedPatient(patient);
    setIsRecoveryOpen(true);
    setRecoverySuccess(false);
    resetRecoveryForm();
  };

  const handleRecoveryClose = () => {
    setIsRecoveryOpen(false);
    setSelectedPatient(null);
    resetRecoveryForm();
  };

  const reasonError = touched.reasonCode && !recoveryForm.reasonCode ? "Select a reason code." : "";
  const explanationError = touched.explanation && !recoveryForm.explanation.trim() ? "Provide a reason or explanation." : "";
  const evidenceError = touched.evidence && !recoveryForm.evidenceName ? "Attach supportive evidence." : "";

  const submitRecovery = () => {
    const nextTouched = { reasonCode: true, explanation: true, evidence: true };
    setTouched(nextTouched);

    if (!recoveryForm.reasonCode || !recoveryForm.explanation.trim() || !recoveryForm.evidenceName) {
      return;
    }

    setIsSubmittingRecovery(true);

    window.setTimeout(() => {
      if (!selectedPatient) {
        setIsSubmittingRecovery(false);
        return;
      }

      setSubmittedRecoveryIds((current) => [...new Set([...current, selectedPatient.id])]);
      setRecoverySuccess(true);
      setIsSubmittingRecovery(false);
    }, 350);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="space-y-2">
        <h1 className="text-xl font-semibold text-foreground">Users</h1>
        <p className="text-sm text-muted-foreground">
          Search patient accounts, review verification status, and resolve KYC disputes when needed.
        </p>
      </div>

      <Card className="rounded-2xl">
        <CardContent className="space-y-4 py-4 sm:py-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1">
              <Label>Search type</Label>
              <Select
                value={searchType}
                onValueChange={(value) => setSearchType((value as SearchType) ?? roleSearchOptions[0].value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a field" />
                </SelectTrigger>
                <SelectContent>
                  {roleSearchOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1">
              <Label htmlFor="patient-search">Search query</Label>
              <div className="relative">
                <HugeiconsIcon
                  icon={Search01Icon}
                  size={15}
                  className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  id="patient-search"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      handleSearch();
                    }
                  }}
                  placeholder={
                    role === "super_admin"
                      ? "Search by patient ID, phone, or name"
                      : "Search by patient ID or phone number"
                  }
                  className="pl-8"
                />
              </div>
            </div>

            <Button disabled={!searchTerm.trim()} onClick={handleSearch} className="w-full sm:w-auto">
              Search
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            {role === "super_admin"
              ? "Super admins can search by patient ID, phone number, or name."
              : "Ops/support agents can search by patient ID or phone number only."}
          </p>
        </CardContent>
      </Card>

      {!activeSearch ? (
        <Card className="rounded-2xl">
          <CardContent>
            <EmptyState
              icon={<HugeiconsIcon icon={UserMultiple02Icon} size={20} />}
              title="Patient accounts"
              message="Search by patient identifier to review KYC, consent, and account status."
            />
          </CardContent>
        </Card>
      ) : filteredPatients.length === 0 ? (
        <Card className="rounded-2xl">
          <CardContent>
            <EmptyState
              icon={<HugeiconsIcon icon={Search01Icon} size={20} />}
              title="No patient matches"
              message="No users match this search. Try a different patient ID, phone number, or name."
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <Card className="rounded-2xl">
            <CardContent className="space-y-3 py-4">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-sm font-semibold text-foreground">Search results</h2>
                <span className="text-xs text-muted-foreground">{filteredPatients.length} match(es)</span>
              </div>

              <div className="space-y-3">
                {filteredPatients.map((patient) => (
                  <Button
                    key={patient.id}
                    variant={visiblePatient?.id === patient.id ? "default" : "outline"}
                    onClick={() => setSelectedPatientId(patient.id)}
                    className="h-auto w-full justify-start rounded-xl border border-border bg-background p-3 text-left shadow-none hover:bg-muted"
                  >
                    <div className="flex w-full items-start gap-3">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <HugeiconsIcon icon={UserMultiple02Icon} size={18} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="truncate font-medium text-foreground">{patient.name}</p>
                          <Badge
                            label={VERIFICATION_STATUS_LABELS[patient.verificationStatus]}
                            variant={VERIFICATION_STATUS_MAP[patient.verificationStatus]}
                          />
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">{patient.id}</p>
                        <p className="text-xs text-muted-foreground">{patient.phone}</p>
                        <p className="mt-2 text-[11px] text-muted-foreground">
                          Linked consent: {patient.linkedConsentCount}
                        </p>
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {patientDetail ? (
            <Card className="rounded-2xl">
              <CardContent className="space-y-5 py-4 sm:py-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <HugeiconsIcon icon={UserMultiple02Icon} size={18} />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Patient</p>
                      <h2 className="text-lg font-semibold text-foreground">{patientDetail.name}</h2>
                    </div>
                  </div>
                  <Badge
                    label={VERIFICATION_STATUS_LABELS[patientDetail.verificationStatus]}
                    variant={VERIFICATION_STATUS_MAP[patientDetail.verificationStatus]}
                  />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-border bg-muted/40 p-3">
                    <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">Patient ID</p>
                    <p className="mt-1 text-sm font-medium text-foreground">{patientDetail.id}</p>
                  </div>
                  <div className="rounded-xl border border-border bg-muted/40 p-3">
                    <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">Phone</p>
                    <p className="mt-1 text-sm font-medium text-foreground">{patientDetail.phone}</p>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-border bg-card p-3">
                    <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
                      <HugeiconsIcon icon={ShieldCheckIcon} size={14} />
                      Verification
                    </div>
                    <Badge
                      label={VERIFICATION_STATUS_LABELS[patientDetail.verificationStatus]}
                      variant={VERIFICATION_STATUS_MAP[patientDetail.verificationStatus]}
                    />
                  </div>
                  <div className="rounded-xl border border-border bg-card p-3">
                    <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
                      <HugeiconsIcon icon={CheckmarkCircle01Icon} size={14} />
                      Account status
                    </div>
                    <Badge
                      label={ACCOUNT_STATUS_LABELS[patientDetail.accountStatus]}
                      variant={ACCOUNT_STATUS_MAP[patientDetail.accountStatus]}
                    />
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-muted/40 p-3">
                  <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
                    <HugeiconsIcon icon={File01Icon} size={14} />
                    Linked consent
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm text-foreground">{patientDetail.linkedConsentCount} consent(s) linked</p>
                    <Button variant="outline" size="sm" onClick={() => router.push("/records")}>
                      View Records & Consent
                    </Button>
                  </div>
                  <div className="mt-3 space-y-2">
                    {patientDetail.linkedConsents.slice(0, 3).map((consent) => (
                      <div
                        key={consent.id}
                        className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background px-2.5 py-2 text-xs"
                      >
                        <span className="truncate text-foreground">{consent.recordType}</span>
                        <StatusBadge
                          status={
                            consent.status === "approved"
                              ? "approved"
                              : consent.status === "pending"
                                ? "pending"
                                : "declined"
                          }
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {patientDetail.verificationStatus !== "verified" && (
                  submittedRecoveryIds.includes(patientDetail.id) ? (
                    <div className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
                      A KYC recovery request has been submitted for review.
                    </div>
                  ) : (
                    <div className="flex justify-end">
                      <Button
                        variant="outline"
                        onClick={() => openRecoveryFlow(patientDetail)}
                        className="w-full sm:w-auto"
                      >
                        {patientDetail.verificationStatus === "failed" ? "Recover Identity" : "Resolve KYC"}
                      </Button>
                    </div>
                  )
                )}

                <div className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <HugeiconsIcon icon={Clock01Icon} size={14} />
                    Last updated: {new Date(patientDetail.lastUpdated).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : null}
        </div>
      )}

      <Modal
        open={isRecoveryOpen}
        onClose={handleRecoveryClose}
        title={recoverySuccess ? "Recovery submitted" : `Recover identity: ${selectedPatient?.name ?? "Patient"}`}
      >
        {recoverySuccess ? (
          <div className="flex flex-col items-center py-2 text-center">
            <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
              <HugeiconsIcon icon={CheckmarkCircle01Icon} size={22} />
            </div>
            <h3 className="text-base font-semibold text-foreground">Recovery request submitted</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              The request has been recorded for review. The patient&apos;s verification and account statuses
              remain unchanged until the request is reviewed.
            </p>
            <Button onClick={handleRecoveryClose} className="mt-5">
              Close
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Submit a recovery or dispute request with a reason code, explanation, and supporting evidence.
            </p>

            <div className="space-y-1.5">
              <Label>Reason code</Label>
              <Select
                value={recoveryForm.reasonCode}
                onValueChange={(value) => {
                  setRecoveryForm((current) => ({ ...current, reasonCode: value ?? "" }));
                  setTouched((current) => ({ ...current, reasonCode: true }));
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  {RECOVERY_REASON_CODES.map((reason) => (
                    <SelectItem key={reason.value} value={reason.value}>
                      {reason.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {reasonError ? <p className="text-xs text-destructive">{reasonError}</p> : null}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="kyc-explanation">Reason / explanation</Label>
              <Textarea
                id="kyc-explanation"
                value={recoveryForm.explanation}
                onChange={(event) => setRecoveryForm((current) => ({ ...current, explanation: event.target.value }))}
                onBlur={() => setTouched((current) => ({ ...current, explanation: true }))}
                placeholder="Describe what was reviewed or resolved"
                rows={3}
                aria-invalid={Boolean(explanationError)}
              />
              {explanationError ? <p className="text-xs text-destructive">{explanationError}</p> : null}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="kyc-evidence">Evidence attachment</Label>
              <Input
                id="kyc-evidence"
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                value={undefined}
                onChange={(event) => {
                  const selectedFile = event.target.files?.[0];
                  setRecoveryForm((current) => ({
                    ...current,
                    evidenceName: selectedFile ? selectedFile.name : "",
                  }));
                  setTouched((current) => ({ ...current, evidence: true }));
                }}
                onBlur={() => setTouched((current) => ({ ...current, evidence: true }))}
              />
              {recoveryForm.evidenceName ? (
                <p className="text-xs text-muted-foreground">Selected evidence: {recoveryForm.evidenceName}</p>
              ) : null}
              {evidenceError ? <p className="text-xs text-destructive">{evidenceError}</p> : null}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={handleRecoveryClose}>
                Cancel
              </Button>
              <Button loading={isSubmittingRecovery} disabled={isSubmittingRecovery} onClick={submitRecovery}>
                Submit recovery
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default function UsersPage() {
  return (
    <ProtectedRoute module="users">
      <UsersContent />
    </ProtectedRoute>
  );
}
