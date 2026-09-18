"use client";

import { useMemo, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  File01Icon,
  Search01Icon,
  ShieldCheckIcon,
  ChartLineData01Icon,
  AlertCircleIcon,
} from "@hugeicons/core-free-icons";
import { ProtectedRoute } from "@/components/dashboards/shared/ProtectedRoute";
import { ActivityLogItem } from "@/components/dashboards/shared/ActivityLogItem";
import { StatusBadge } from "@/components/dashboards/shared/StatusBadge";
import { Badge } from "@/components/common/Badge";
import { EmptyState } from "@/components/common/EmptyState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDate } from "@/utils/formatDate";
import type { ActivityStatus } from "@/mock/activityData";
import {
  AUDIT_ACTION_LABELS,
  mockAuditLog,
  mockConsentRequests,
  mockAnomalyFlags,
  type AuditActionType,
} from "@/mock/recordsData";

// Maps this module's admin/record actions onto the shared 4-state status palette
// (BADGE_VARIANT_CLASSES in components/common/Badge.tsx) so the audit log can reuse
// ActivityLogItem/StatusBadge instead of a one-off status color.
const AUDIT_STATUS: Record<AuditActionType, ActivityStatus> = {
  record_view: "viewed",
  record_export: "viewed",
  org_approved: "approved",
  org_rejected: "declined",
  org_suspended: "declined",
  consent_approved: "approved",
  consent_denied: "declined",
  identity_override: "pending",
};

const CONSENT_STATUS_VARIANT: Record<string, ActivityStatus> = {
  pending: "pending",
  approved: "approved",
  denied: "declined",
  expired: "viewed",
};

function RecordsConsentContent() {
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState<AuditActionType | "all">("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const filteredAuditLog = useMemo(() => {
    return mockAuditLog.filter((entry) => {
      if (actionFilter !== "all" && entry.actionType !== actionFilter) return false;

      const entryDate = entry.timestamp.slice(0, 10);
      if (dateFrom && entryDate < dateFrom) return false;
      if (dateTo && entryDate > dateTo) return false;

      if (search.trim()) {
        const haystack = [entry.patientId, entry.orgName, entry.doctorName, entry.actorName, entry.note]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(search.trim().toLowerCase())) return false;
      }

      return true;
    });
  }, [search, actionFilter, dateFrom, dateTo]);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Records & Consent</h1>
        <p className="text-sm text-muted-foreground">
          The trust-critical module. Every screen here is built defensively (spec §4.4).
        </p>
      </div>

      <div className="flex items-start gap-2 rounded-lg border border-border bg-card px-3.5 py-2.5 text-xs text-muted-foreground">
        <HugeiconsIcon icon={ShieldCheckIcon} size={15} className="mt-0.5 shrink-0 text-primary" />
        <span>
          Every read of a raw record — by anyone, including super admins — generates an immutable
          audit log entry. No exceptions, no debug-mode bypass.
        </span>
      </div>

      <Tabs defaultValue="audit-log">
        <TabsList className="max-w-full overflow-x-auto">
          <TabsTrigger value="audit-log">Audit Log</TabsTrigger>
          <TabsTrigger value="consent">Consent Requests</TabsTrigger>
          <TabsTrigger value="anomalies">Anomalies</TabsTrigger>
        </TabsList>

        <TabsContent value="audit-log" className="mt-4 space-y-4">
          <Card className="rounded-2xl">
            <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto_auto_auto]">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="audit-search">Search</Label>
                <div className="relative">
                  <HugeiconsIcon
                    icon={Search01Icon}
                    size={15}
                    className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <Input
                    id="audit-search"
                    placeholder="Patient, org, or doctor"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label>Action type</Label>
                <Select
                  value={actionFilter}
                  onValueChange={(v) => setActionFilter((v as AuditActionType | "all") ?? "all")}
                >
                  <SelectTrigger className="w-full sm:w-44">
                    <SelectValue>
                      {(value: AuditActionType | "all") =>
                        value === "all" ? "All actions" : AUDIT_ACTION_LABELS[value]
                      }
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All actions</SelectItem>
                    {(Object.keys(AUDIT_ACTION_LABELS) as AuditActionType[]).map((type) => (
                      <SelectItem key={type} value={type}>
                        {AUDIT_ACTION_LABELS[type]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="audit-from">From</Label>
                <Input
                  id="audit-from"
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="audit-to">To</Label>
                <Input id="audit-to" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardContent>
              {filteredAuditLog.length === 0 ? (
                <EmptyState
                  icon={<HugeiconsIcon icon={File01Icon} size={20} />}
                  title="No matching audit entries"
                  message="Try widening the date range or clearing a filter."
                />
              ) : (
                filteredAuditLog.map((entry) => (
                  <ActivityLogItem
                    key={entry.id}
                    item={{
                      id: entry.id,
                      action: AUDIT_ACTION_LABELS[entry.actionType],
                      description: [
                        entry.note,
                        entry.patientId,
                        entry.doctorName,
                        entry.reasonCode && `Reason: ${entry.reasonCode}`,
                      ]
                        .filter(Boolean)
                        .join(" · "),
                      timestamp: entry.timestamp,
                      status: AUDIT_STATUS[entry.actionType],
                      orgName: entry.orgName,
                    }}
                  />
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="consent" className="mt-4">
          <Card className="rounded-2xl">
            <CardContent className="divide-y divide-border">
              {mockConsentRequests.length === 0 ? (
                <EmptyState
                  icon={<HugeiconsIcon icon={File01Icon} size={20} />}
                  title="No consent requests"
                  message="Consent requests will appear here as orgs request patient records."
                />
              ) : (
                mockConsentRequests.map((request) => (
                  <div key={request.id} className="flex flex-col gap-2 py-3.5 first:pt-0 last:pb-0">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{request.recordType}</p>
                        <p className="text-[13px] text-muted-foreground">
                          {request.requestingOrgName} → {request.patientId}
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-col items-end text-right">
                        <StatusBadge status={CONSENT_STATUS_VARIANT[request.status]} />
                        <p className="mt-1.5 text-xs text-muted-foreground/70">
                          {formatDate(request.resolvedAt ?? request.requestedAt)}
                        </p>
                      </div>
                    </div>
                    {request.denialReason && (
                      <p className="rounded-lg bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
                        Patient-provided reason: {request.denialReason}
                      </p>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="anomalies" className="mt-4 space-y-3">
          {mockAnomalyFlags.length === 0 ? (
            <Card className="rounded-2xl">
              <CardContent>
                <EmptyState
                  icon={<HugeiconsIcon icon={ChartLineData01Icon} size={20} />}
                  title="No anomalies detected"
                  message="Unusual record-access patterns will be surfaced here automatically."
                />
              </CardContent>
            </Card>
          ) : (
            mockAnomalyFlags.map((flag) => (
              <Card key={flag.id} className="rounded-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between gap-2 text-sm">
                    <span className="flex items-center gap-2">
                      <HugeiconsIcon
                        icon={AlertCircleIcon}
                        size={16}
                        className={flag.severity === "critical" ? "text-destructive" : "text-muted-foreground"}
                      />
                      {flag.orgName}
                    </span>
                    <Badge
                      label={flag.severity === "critical" ? "Critical" : "Warning"}
                      variant={flag.severity === "critical" ? "declined" : "pending"}
                    />
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap items-center justify-between gap-3 text-sm">
                  <p className="text-muted-foreground">{flag.metricLabel}</p>
                  <p className="font-mono text-foreground">
                    {flag.currentValue} vs. {flag.trailingAverage} avg
                    <span className="ml-2 font-sans text-xs text-muted-foreground">
                      ({flag.multiplier}x trailing average)
                    </span>
                  </p>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function RecordsConsentPage() {
  return (
    <ProtectedRoute module="records_consent">
      <RecordsConsentContent />
    </ProtectedRoute>
  );
}
