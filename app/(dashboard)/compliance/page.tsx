"use client";

import { useState, type FormEvent } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ShieldCheckIcon,
  Download01Icon,
  Delete02Icon,
  ShieldAlertIcon,
  Location01Icon,
  LockPasswordIcon,
  UserBlock01Icon,
  CheckmarkCircle01Icon,
} from "@hugeicons/core-free-icons";
import { ProtectedRoute } from "@/components/dashboards/shared/ProtectedRoute";
import { EmptyState } from "@/components/common/EmptyState";
import { Modal } from "@/components/common/Modal";
import { Button } from "@/components/common/Button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge, BADGE_VARIANT_CLASSES } from "@/components/common/Badge";
import { formatDate } from "@/utils/formatDate";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import type { ActivityStatus } from "@/mock/activityData";
import {
  mockDsarRequests,
  mockSecurityAlerts,
  mockFreezeTargets,
  SECURITY_ALERT_LABELS,
  type SecurityAlert,
  type FreezeTarget,
} from "@/mock/complianceData";

const DSAR_STATUS_VARIANT: Record<string, ActivityStatus> = {
  pending: "pending",
  completed: "approved",
  rejected: "declined",
};

const DSAR_STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  completed: "Completed",
  rejected: "Rejected",
};

const ALERT_ICONS: Record<SecurityAlert["type"], typeof ShieldAlertIcon> = {
  failed_login_spike: ShieldAlertIcon,
  impossible_travel: Location01Icon,
  brute_force: LockPasswordIcon,
};

interface FreezeModalProps {
  target: FreezeTarget | null;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

// Freeze is immediate and one-directional from here — reversing it is a second
// admin's job (spec §4.5), so this modal only ever asks for a reason, never an undo.
function FreezeModal({ target, onClose, onConfirm }: FreezeModalProps) {
  const [reason, setReason] = useState("");
  const [touched, setTouched] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const handleClose = () => {
    setReason("");
    setTouched(false);
    setConfirmed(false);
    onClose();
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!reason.trim()) return;
    onConfirm(reason.trim());
    setConfirmed(true);
  };

  return (
    <Modal open={!!target} onClose={handleClose} title={confirmed ? "Frozen" : `Freeze ${target?.name ?? ""}`}>
      {confirmed ? (
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <div
            className={cn(
              "flex size-14 items-center justify-center rounded-full duration-300 animate-in zoom-in-50",
              BADGE_VARIANT_CLASSES.declined
            )}
          >
            <HugeiconsIcon icon={CheckmarkCircle01Icon} size={28} />
          </div>
          <div className="animate-in fade-in slide-in-from-bottom-1 duration-300">
            <p className="font-semibold text-foreground">{target?.name} is now frozen</p>
            <p className="mt-1 text-sm text-muted-foreground">
              This took effect immediately. It can only be reversed by a second admin.
            </p>
          </div>
          <Button variant="ghost" className="mt-2 h-auto rounded-full px-5 py-2.5" onClick={handleClose}>
            Done
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-sm text-muted-foreground">
            This takes effect immediately and blocks all access for {target?.name}. Reversing it
            requires a second admin&apos;s approval.
          </p>
          <div className="space-y-1.5">
            <Label>Reason</Label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Why is this being frozen?"
              rows={3}
            />
            {touched && !reason.trim() && (
              <p className="text-xs text-destructive">A reason is required to freeze an account or org.</p>
            )}
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" className="h-auto rounded-full px-4 py-2.5" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" variant="destructive" className="h-auto rounded-full px-4 py-2.5">
              Freeze Now
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}

function ComplianceSecurityContent() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState(mockSecurityAlerts);
  const [targets, setTargets] = useState(mockFreezeTargets);
  const [freezeTarget, setFreezeTarget] = useState<FreezeTarget | null>(null);

  const advanceAlert = (id: string) => {
    setAlerts((prev) =>
      prev.map((alert) =>
        alert.id === id
          ? { ...alert, status: alert.status === "open" ? "acknowledged" : "resolved" }
          : alert
      )
    );
  };

  const confirmFreeze = (reason: string) => {
    if (!freezeTarget) return;
    setTargets((prev) =>
      prev.map((t) =>
        t.id === freezeTarget.id
          ? {
              ...t,
              status: "frozen",
              frozenReason: reason,
              frozenBy: user?.name,
              frozenAt: new Date().toISOString(),
            }
          : t
      )
    );
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Compliance & Security</h1>
        <p className="text-sm text-muted-foreground">
          NDPR tooling, security alerting, and incident response (spec §4.5).
        </p>
      </div>

      <Tabs defaultValue="ndpr">
        <TabsList className="max-w-full overflow-x-auto">
          <TabsTrigger value="ndpr">NDPR Requests</TabsTrigger>
          <TabsTrigger value="alerts">Security Alerts</TabsTrigger>
          <TabsTrigger value="incidents">Incident Response</TabsTrigger>
        </TabsList>

        <TabsContent value="ndpr" className="mt-4 space-y-4">
          <div className="flex items-start gap-2 rounded-lg border border-border bg-card px-3.5 py-2.5 text-xs text-muted-foreground">
            <HugeiconsIcon icon={ShieldCheckIcon} size={15} className="mt-0.5 shrink-0 text-primary" />
            <span>
              Retention exceptions below are placeholders — the actual legally-required retention
              list still needs sign-off from legal (spec §9, open question).
            </span>
          </div>

          <Card className="rounded-2xl">
            <CardContent className="divide-y divide-border">
              {mockDsarRequests.length === 0 ? (
                <EmptyState
                  icon={<HugeiconsIcon icon={Download01Icon} size={20} />}
                  title="No requests"
                  message="Data subject access requests will appear here."
                />
              ) : (
                mockDsarRequests.map((request) => (
                  <div key={request.id} className="flex flex-col gap-2 py-3.5 first:pt-0 last:pb-0">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                          <HugeiconsIcon
                            icon={request.type === "export" ? Download01Icon : Delete02Icon}
                            size={15}
                          />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">
                            {request.type === "export" ? "Data Export" : "Right to Erasure"}
                          </p>
                          <p className="text-[13px] text-muted-foreground">{request.patientId}</p>
                        </div>
                      </div>
                      <div className="flex shrink-0 flex-col items-end text-right">
                        <Badge
                          label={DSAR_STATUS_LABELS[request.status]}
                          variant={DSAR_STATUS_VARIANT[request.status]}
                        />
                        <p className="mt-1.5 text-xs text-muted-foreground/70">
                          {formatDate(request.completedAt ?? request.requestedAt)}
                        </p>
                      </div>
                    </div>
                    {request.retentionExceptions && request.retentionExceptions.length > 0 && (
                      <div className="rounded-lg bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
                        <p className="mb-1 font-medium text-foreground">Retained despite erasure:</p>
                        <ul className="list-disc space-y-0.5 pl-4">
                          {request.retentionExceptions.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="mt-4">
          <Card className="rounded-2xl">
            <CardContent className="divide-y divide-border">
              {alerts.length === 0 ? (
                <EmptyState
                  icon={<HugeiconsIcon icon={ShieldAlertIcon} size={20} />}
                  title="No security alerts"
                  message="Failed-login spikes, impossible-travel logins, and brute-force attempts will surface here."
                />
              ) : (
                alerts.map((alert) => (
                  <div key={alert.id} className="flex flex-wrap items-start justify-between gap-3 py-3.5 first:pt-0 last:pb-0">
                    <div className="flex items-start gap-2.5">
                      <div
                        className={cn(
                          "flex size-9 shrink-0 items-center justify-center rounded-full",
                          alert.severity === "critical" ? BADGE_VARIANT_CLASSES.declined : BADGE_VARIANT_CLASSES.pending
                        )}
                      >
                        <HugeiconsIcon icon={ALERT_ICONS[alert.type]} size={15} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {SECURITY_ALERT_LABELS[alert.type]}
                        </p>
                        <p className="text-[13px] text-muted-foreground">{alert.targetLabel}</p>
                        <p className="text-[13px] text-muted-foreground">{alert.detail}</p>
                        <p className="mt-1 text-xs text-muted-foreground/70">{formatDate(alert.detectedAt)}</p>
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-2">
                      <Badge
                        label={alert.severity === "critical" ? "Critical" : "Warning"}
                        variant={alert.severity === "critical" ? "declined" : "pending"}
                      />
                      {alert.status !== "resolved" ? (
                        <Button
                          variant="outline"
                          className="h-auto rounded-full px-3 py-1.5 text-xs"
                          onClick={() => advanceAlert(alert.id)}
                        >
                          {alert.status === "open" ? "Acknowledge" : "Resolve"}
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">Resolved</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="incidents" className="mt-4">
          <Card className="rounded-2xl">
            <CardContent className="divide-y divide-border">
              {targets.map((target) => (
                <div key={target.id} className="flex flex-col gap-2 py-3.5 first:pt-0 last:pb-0">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                        <HugeiconsIcon icon={UserBlock01Icon} size={15} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{target.name}</p>
                        <p className="text-[13px] capitalize text-muted-foreground">{target.type}</p>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <Badge
                        label={target.status === "frozen" ? "Frozen" : "Active"}
                        variant={target.status === "frozen" ? "declined" : "approved"}
                      />
                      {target.status === "active" ? (
                        <Button
                          variant="destructive"
                          className="h-auto rounded-full px-3.5 py-1.5 text-xs"
                          onClick={() => setFreezeTarget(target)}
                        >
                          Freeze Now
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          disabled
                          title="Requires a second admin's approval"
                          className="h-auto rounded-full px-3.5 py-1.5 text-xs"
                        >
                          Unfreeze
                        </Button>
                      )}
                    </div>
                  </div>
                  {target.status === "frozen" && (
                    <p className="rounded-lg bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
                      Frozen by {target.frozenBy} on {formatDate(target.frozenAt)} — {target.frozenReason}
                    </p>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <FreezeModal target={freezeTarget} onClose={() => setFreezeTarget(null)} onConfirm={confirmFreeze} />
    </div>
  );
}

export default function ComplianceSecurityPage() {
  return (
    <ProtectedRoute module="compliance_security">
      <ComplianceSecurityContent />
    </ProtectedRoute>
  );
}
