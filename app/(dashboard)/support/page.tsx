"use client";

import { useMemo, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Search01Icon,
  File01Icon,
  CheckmarkCircle01Icon,
  Megaphone01Icon,
  ToggleOnIcon,
} from "@hugeicons/core-free-icons";
import { ProtectedRoute } from "@/components/dashboards/shared/ProtectedRoute";
import { Badge } from "@/components/common/Badge";
import { EmptyState } from "@/components/common/EmptyState";
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
import { formatDate } from "@/utils/formatDate";
import type { ActivityStatus } from "@/mock/activityData";
import {
  TICKET_STATUS_LABELS,
  TICKET_PRIORITY_LABELS,
  ROLLOUT_OPTIONS,
  DOCUMENT_TYPE_LABELS,
  BROADCAST_AUDIENCE_LABELS,
  mockTickets,
  mockFeatureFlags,
  mockDocumentVersions,
  mockAgreementRecords,
  mockBroadcasts,
  type SupportTicket,
  type TicketStatus,
  type FeatureFlag,
  type ConsentDocumentType,
  type BroadcastAudience,
  type BroadcastMessage,
} from "@/mock/supportData";

const TICKET_STATUS_VARIANT: Record<TicketStatus, ActivityStatus> = {
  open: "pending",
  pending: "pending",
  resolved: "approved",
  closed: "viewed",
};

const TICKET_STATUS_FILTERS: { value: TicketStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "open", label: "Open" },
  { value: "pending", label: "Pending" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
];

const DOCUMENT_TYPE_FILTERS: { value: ConsentDocumentType | "all"; label: string }[] = [
  { value: "all", label: "All documents" },
  { value: "consent_form", label: "Consent Form" },
  { value: "terms_of_service", label: "Terms of Service" },
];

const currentAdmin = "Amaka Chukwu";

// StatusBadge's labels (Pending/Approved/Declined/Viewed) are worded for the org/doctor
// verification flow — reuse its color variants here but with ticket-specific wording.
function TicketStatusBadge({ status }: { status: TicketStatus }) {
  return <Badge label={TICKET_STATUS_LABELS[status]} variant={TICKET_STATUS_VARIANT[status]} />;
}

function TicketDetailModal({
  ticket,
  onClose,
  onSave,
}: {
  ticket: SupportTicket;
  onClose: () => void;
  onSave: (status: TicketStatus, note: string) => void;
}) {
  const [status, setStatus] = useState<TicketStatus>(ticket.status);
  const [note, setNote] = useState(ticket.internalNote ?? "");
  const { account } = ticket;

  return (
    <Modal open onClose={onClose} title={ticket.subject}>
      <div className="max-h-[70vh] space-y-5 overflow-y-auto">
        <div className="flex items-center justify-between">
          <TicketStatusBadge status={ticket.status} />
          <span className="text-xs text-muted-foreground">
            {TICKET_PRIORITY_LABELS[ticket.priority]} priority · opened {formatDate(ticket.createdAt)}
          </span>
        </div>

        <p className="text-sm text-foreground">{ticket.description}</p>

        <div className="rounded-lg border border-border bg-muted/40 p-3">
          <p className="mb-2 text-xs font-semibold text-muted-foreground uppercase">
            {account.type === "organisation" ? "Organisation" : "Patient"} account
          </p>
          <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
            <div>
              <p className="text-xs text-muted-foreground">Name</p>
              <p className="font-medium text-foreground">{account.name}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Contact</p>
              <p className="font-medium text-foreground">{account.contactEmail}</p>
            </div>
            {account.type === "organisation" ? (
              <>
                <div>
                  <p className="text-xs text-muted-foreground">License number</p>
                  <p className="font-medium text-foreground">{account.licenseNumber}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Verification status</p>
                  <p className="font-medium text-foreground capitalize">{account.verificationStatus}</p>
                </div>
              </>
            ) : (
              <>
                <div>
                  <p className="text-xs text-muted-foreground">Patient ID</p>
                  <p className="font-medium text-foreground">{account.patientId}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Identity verification</p>
                  <p className="font-medium text-foreground capitalize">
                    {account.identityVerificationStatus?.replace("_", " ")}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label>Status</Label>
          <Select value={status} onValueChange={(v) => setStatus((v as TicketStatus) ?? status)}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(TICKET_STATUS_LABELS) as TicketStatus[]).map((s) => (
                <SelectItem key={s} value={s}>
                  {TICKET_STATUS_LABELS[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="ticket-note">Internal note</Label>
          <Textarea
            id="ticket-note"
            placeholder="Notes for other agents — not visible to the account"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-2 border-t border-border pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              onSave(status, note.trim());
              onClose();
            }}
          >
            Save
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function NewBroadcastModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (title: string, body: string, audience: BroadcastAudience) => void;
}) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [audience, setAudience] = useState<BroadcastAudience>("all");
  const [submitted, setSubmitted] = useState(false);

  const canSubmit = title.trim().length > 0 && body.trim().length > 0;

  return (
    <Modal open onClose={onClose} title={submitted ? "Broadcast Sent" : "New broadcast"}>
      {submitted ? (
        <EmptyState
          icon={<HugeiconsIcon icon={CheckmarkCircle01Icon} size={20} />}
          title="Announcement sent"
          message={`Delivered to: ${BROADCAST_AUDIENCE_LABELS[audience]}.`}
          action={<Button onClick={onClose}>Done</Button>}
        />
      ) : (
        <div className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="broadcast-title">Title</Label>
            <Input id="broadcast-title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="broadcast-body">Message</Label>
            <Textarea id="broadcast-body" value={body} onChange={(e) => setBody(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Audience</Label>
            <Select value={audience} onValueChange={(v) => setAudience((v as BroadcastAudience) ?? audience)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(BROADCAST_AUDIENCE_LABELS) as BroadcastAudience[]).map((a) => (
                  <SelectItem key={a} value={a}>
                    {BROADCAST_AUDIENCE_LABELS[a]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              disabled={!canSubmit}
              onClick={() => {
                onSubmit(title.trim(), body.trim(), audience);
                setSubmitted(true);
              }}
            >
              Send broadcast
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}

function SupportConfigContent() {
  const [tickets, setTickets] = useState<SupportTicket[]>(mockTickets);
  const [flags, setFlags] = useState<FeatureFlag[]>(mockFeatureFlags);
  const [broadcasts, setBroadcasts] = useState<BroadcastMessage[]>(mockBroadcasts);

  const [ticketSearch, setTicketSearch] = useState("");
  const [ticketStatusFilter, setTicketStatusFilter] = useState<TicketStatus | "all">("all");
  const [viewTicketId, setViewTicketId] = useState<string | null>(null);

  const [docTypeFilter, setDocTypeFilter] = useState<ConsentDocumentType | "all">("all");
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);

  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      if (ticketStatusFilter !== "all" && ticket.status !== ticketStatusFilter) return false;
      if (ticketSearch.trim()) {
        const haystack = `${ticket.subject} ${ticket.account.name}`.toLowerCase();
        if (!haystack.includes(ticketSearch.trim().toLowerCase())) return false;
      }
      return true;
    });
  }, [tickets, ticketStatusFilter, ticketSearch]);

  const currentVersions = useMemo(() => {
    const byType: Record<string, (typeof mockDocumentVersions)[number]> = {};
    for (const version of mockDocumentVersions) {
      const existing = byType[version.documentType];
      if (!existing || new Date(version.publishedAt) > new Date(existing.publishedAt)) {
        byType[version.documentType] = version;
      }
    }
    return Object.values(byType);
  }, []);

  const filteredAgreements = useMemo(() => {
    if (docTypeFilter === "all") return mockAgreementRecords;
    return mockAgreementRecords.filter((record) => record.documentType === docTypeFilter);
  }, [docTypeFilter]);

  const viewTicket = tickets.find((t) => t.id === viewTicketId) ?? null;

  const handleSaveTicket = (id: string, status: TicketStatus, note: string) => {
    setTickets((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, status, internalNote: note || undefined, updatedAt: new Date().toISOString() } : t
      )
    );
  };

  const handleToggleFlag = (id: string) => {
    setFlags((prev) =>
      prev.map((flag) =>
        flag.id === id
          ? { ...flag, enabled: !flag.enabled, updatedAt: new Date().toISOString(), updatedBy: currentAdmin }
          : flag
      )
    );
  };

  const handleRolloutChange = (id: string, rolloutPercentage: number) => {
    setFlags((prev) =>
      prev.map((flag) =>
        flag.id === id
          ? { ...flag, rolloutPercentage, updatedAt: new Date().toISOString(), updatedBy: currentAdmin }
          : flag
      )
    );
  };

  const handleSendBroadcast = (title: string, body: string, audience: BroadcastAudience) => {
    setBroadcasts((prev) => [
      {
        id: `BC-${Date.now()}`,
        title,
        body,
        audience,
        sentAt: new Date().toISOString(),
        sentBy: currentAdmin,
      },
      ...prev,
    ]);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Support & Config</h1>
        <p className="text-sm text-muted-foreground">
          Support tickets, feature flags, consent/ToS versioning, and platform announcements (spec §4.6).
        </p>
      </div>

      <Tabs defaultValue="tickets">
        <TabsList>
          <TabsTrigger value="tickets">Tickets</TabsTrigger>
          <TabsTrigger value="flags">Feature Flags</TabsTrigger>
          <TabsTrigger value="consent">Consent & ToS</TabsTrigger>
          <TabsTrigger value="broadcasts">Broadcasts</TabsTrigger>
        </TabsList>

        <TabsContent value="tickets" className="mt-4 space-y-4">
          <Card className="rounded-2xl">
            <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto]">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="ticket-search">Search</Label>
                <div className="relative">
                  <HugeiconsIcon
                    icon={Search01Icon}
                    size={15}
                    className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <Input
                    id="ticket-search"
                    placeholder="Subject or account name"
                    value={ticketSearch}
                    onChange={(e) => setTicketSearch(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Status</Label>
                <Select
                  value={ticketStatusFilter}
                  onValueChange={(v) => setTicketStatusFilter((v as TicketStatus | "all") ?? "all")}
                >
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TICKET_STATUS_FILTERS.map((filter) => (
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
              {filteredTickets.length === 0 ? (
                <EmptyState
                  icon={<HugeiconsIcon icon={File01Icon} size={20} />}
                  title="No matching tickets"
                  message="Try a different search term or status filter."
                />
              ) : (
                filteredTickets.map((ticket) => (
                  <button
                    key={ticket.id}
                    type="button"
                    onClick={() => setViewTicketId(ticket.id)}
                    className="flex w-full flex-wrap items-center justify-between gap-3 py-3.5 text-left first:pt-0 last:pb-0"
                  >
                    <div>
                      <p className="text-sm font-semibold text-foreground">{ticket.subject}</p>
                      <p className="text-[13px] text-muted-foreground">
                        {ticket.account.name} · {TICKET_PRIORITY_LABELS[ticket.priority]} priority ·{" "}
                        {formatDate(ticket.updatedAt)}
                      </p>
                    </div>
                    <TicketStatusBadge status={ticket.status} />
                  </button>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="flags" className="mt-4 space-y-4">
          <Card className="rounded-2xl">
            <CardContent className="divide-y divide-border">
              {flags.map((flag) => (
                <div key={flag.id} className="flex flex-wrap items-start justify-between gap-4 py-3.5 first:pt-0 last:pb-0">
                  <div className="max-w-md">
                    <p className="text-sm font-semibold text-foreground">{flag.label}</p>
                    <p className="text-[13px] text-muted-foreground">{flag.description}</p>
                    <p className="mt-1 font-mono text-xs text-muted-foreground/70">{flag.key}</p>
                    <p className="mt-1.5 text-xs text-muted-foreground/70">
                      Updated {formatDate(flag.updatedAt)} by {flag.updatedBy}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Select
                      value={String(flag.rolloutPercentage)}
                      onValueChange={(v) => handleRolloutChange(flag.id, Number(v ?? flag.rolloutPercentage))}
                      disabled={!flag.enabled}
                    >
                      <SelectTrigger className="w-24" size="sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ROLLOUT_OPTIONS.map((pct) => (
                          <SelectItem key={pct} value={String(pct)}>
                            {pct}%
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      size="sm"
                      variant={flag.enabled ? "default" : "outline"}
                      onClick={() => handleToggleFlag(flag.id)}
                    >
                      <HugeiconsIcon icon={ToggleOnIcon} size={14} />
                      {flag.enabled ? "Enabled" : "Disabled"}
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="consent" className="mt-4 space-y-4">
          <Card className="rounded-2xl">
            <CardContent className="space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase">Current versions</p>
              {currentVersions.map((version) => (
                <div
                  key={version.documentType}
                  className="rounded-lg border border-border px-3 py-2.5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-foreground">
                      {DOCUMENT_TYPE_LABELS[version.documentType]} — {version.version}
                    </p>
                    <span className="text-xs text-muted-foreground">Published {formatDate(version.publishedAt)}</span>
                  </div>
                  <p className="mt-1 text-[13px] text-muted-foreground">{version.changeSummary}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardContent className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase">Agreement history</p>
                <Select
                  value={docTypeFilter}
                  onValueChange={(v) => setDocTypeFilter((v as ConsentDocumentType | "all") ?? "all")}
                >
                  <SelectTrigger className="w-full sm:w-48" size="sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DOCUMENT_TYPE_FILTERS.map((filter) => (
                      <SelectItem key={filter.value} value={filter.value}>
                        {filter.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {filteredAgreements.length === 0 ? (
                <EmptyState
                  icon={<HugeiconsIcon icon={File01Icon} size={20} />}
                  title="No agreement records"
                  message="Try a different document type filter."
                />
              ) : (
                <div className="divide-y divide-border">
                  {filteredAgreements.map((record) => (
                    <div key={record.id} className="flex flex-wrap items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{record.accountName}</p>
                        <p className="text-[13px] text-muted-foreground">
                          {record.accountType === "organisation" ? "Organisation" : "Patient"} ·{" "}
                          {DOCUMENT_TYPE_LABELS[record.documentType]} {record.version}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground">{formatDate(record.agreedAt)}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="broadcasts" className="mt-4 space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setShowBroadcastModal(true)}>
              <HugeiconsIcon icon={Megaphone01Icon} size={15} />
              New broadcast
            </Button>
          </div>

          <Card className="rounded-2xl">
            <CardContent className="divide-y divide-border">
              {broadcasts.length === 0 ? (
                <EmptyState
                  icon={<HugeiconsIcon icon={Megaphone01Icon} size={20} />}
                  title="No broadcasts sent"
                  message="Platform-wide announcements will appear here once sent."
                />
              ) : (
                broadcasts.map((broadcast) => (
                  <div key={broadcast.id} className="flex flex-col gap-1.5 py-3.5 first:pt-0 last:pb-0">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-foreground">{broadcast.title}</p>
                      <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                        {BROADCAST_AUDIENCE_LABELS[broadcast.audience]}
                      </span>
                    </div>
                    <p className="text-[13px] text-muted-foreground">{broadcast.body}</p>
                    <p className="text-xs text-muted-foreground/70">
                      Sent {formatDate(broadcast.sentAt)} by {broadcast.sentBy}
                    </p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {viewTicket && (
        <TicketDetailModal
          ticket={viewTicket}
          onClose={() => setViewTicketId(null)}
          onSave={(status, note) => handleSaveTicket(viewTicket.id, status, note)}
        />
      )}

      {showBroadcastModal && (
        <NewBroadcastModal onClose={() => setShowBroadcastModal(false)} onSubmit={handleSendBroadcast} />
      )}
    </div>
  );
}

export default function SupportConfigPage() {
  return (
    <ProtectedRoute module="support_config">
      <SupportConfigContent />
    </ProtectedRoute>
  );
}
