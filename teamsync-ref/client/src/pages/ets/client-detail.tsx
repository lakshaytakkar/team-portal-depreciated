import { useState, useMemo } from "react";
import { useRoute, useLocation } from "wouter";
import {
  ArrowLeft,
  Phone,
  MapPin,
  User,
  Store,
  CalendarDays,
  IndianRupee,
  ChevronRight,
  StickyNote,
  FileText,
  Clock,
  CheckCircle2,
  Circle,
  Plus,
  Flame,
  Thermometer,
  Snowflake,
} from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { DataTable, type Column } from "@/components/ds/data-table";
import { StatusBadge } from "@/components/ds/status-badge";
import { FormDialog } from "@/components/ds/form-dialog";
import { PageTransition, Fade, Stagger, StaggerItem } from "@/components/ui/animated";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ETS_PIPELINE_STAGES,
  ETS_STAGE_LABELS,
  type EtsClient,
  type EtsPayment,
  type EtsPipelineStage,
} from "@/lib/mock-data-ets";
import { PageShell } from "@/components/layout";
import { PersonCell } from "@/components/ui/avatar-cells";

const STAGE_INDEX: Record<EtsPipelineStage, number> = {
  "new-lead": 0,
  "qualified": 1,
  "token-paid": 2,
  "store-design": 3,
  "inventory-ordered": 4,
  "in-transit": 5,
  "launched": 6,
  "reordering": 7,
};

function getScoreLabel(score: number): { label: string; variant: "success" | "error" | "warning"; icon: typeof Flame } {
  if (score >= 75) return { label: "Hot", variant: "success", icon: Flame };
  if (score >= 50) return { label: "Warm", variant: "warning", icon: Thermometer };
  return { label: "Cold", variant: "error", icon: Snowflake };
}

const tierVariantMap: Record<string, "success" | "info" | "warning"> = {
  lite: "info",
  pro: "warning",
  elite: "success",
};

const paymentStatusVariantMap: Record<string, "success" | "error" | "warning"> = {
  received: "success",
  pending: "warning",
  overdue: "error",
};

const paymentTypeVariantMap: Record<string, "info" | "neutral" | "success"> = {
  token: "info",
  milestone: "neutral",
  final: "success",
};

interface EtsChecklistItem {
  id: number;
  itemId: number;
  clientId: number;
  completed: boolean;
  label: string;
  sortOrder: number;
}

interface EtsTimelineEntry {
  id: string;
  date: string;
  description: string;
  type: "payment" | "stage" | "note" | "action";
}

interface EtsNote {
  id: string;
  date: string;
  content: string;
  author: string;
}

function generateTimeline(client: EtsClient): EtsTimelineEntry[] {
  const entries: EtsTimelineEntry[] = [];
  const stageIdx = STAGE_INDEX[client.stage];

  entries.push({
    id: "TL-01",
    date: client.createdDate,
    description: `Lead created from ${client.leadSource}`,
    type: "stage",
  });

  if (stageIdx >= 1) {
    entries.push({
      id: "TL-02",
      date: client.createdDate,
      description: "Qualified after discovery call",
      type: "stage",
    });
  }

  if (client.totalPaid > 0) {
    entries.push({
      id: "TL-03",
      date: client.createdDate,
      description: `Token payment of ₹50,000 received`,
      type: "payment",
    });
  }

  if (stageIdx >= 3) {
    entries.push({
      id: "TL-04",
      date: client.createdDate,
      description: "Store design layout approved",
      type: "action",
    });
  }

  if (stageIdx >= 4) {
    entries.push({
      id: "TL-05",
      date: client.createdDate,
      description: "Inventory order placed with factory",
      type: "action",
    });
  }

  if (stageIdx >= 5) {
    entries.push({
      id: "TL-06",
      date: client.createdDate,
      description: "Shipment dispatched from Yiwu",
      type: "action",
    });
  }

  if (stageIdx >= 6) {
    entries.push({
      id: "TL-07",
      date: client.createdDate,
      description: "Store launched successfully",
      type: "stage",
    });
  }

  entries.push({
    id: "TL-08",
    date: new Date().toISOString().split("T")[0],
    description: client.lastNote,
    type: "note",
  });

  return entries.reverse();
}

function generateNotes(client: EtsClient): EtsNote[] {
  const notes: EtsNote[] = [
    {
      id: "NT-01",
      date: client.createdDate,
      content: `New lead from ${client.leadSource}. ${client.name} from ${client.city}, interested in ${client.packageTier} package for ${client.storeSize} sqft store.`,
      author: client.assignedTo,
    },
  ];

  if (STAGE_INDEX[client.stage] >= 1) {
    notes.push({
      id: "NT-02",
      date: client.createdDate,
      content: `Discovery call completed. Client is interested and asking good questions about ROI and timeline.`,
      author: client.assignedTo,
    });
  }

  if (client.totalPaid > 0) {
    notes.push({
      id: "NT-03",
      date: client.createdDate,
      content: `Payment received. Total paid so far: ₹${client.totalPaid.toLocaleString("en-IN")}`,
      author: client.assignedTo,
    });
  }

  notes.push({
    id: "NT-99",
    date: new Date().toISOString().split("T")[0],
    content: client.lastNote,
    author: client.assignedTo,
  });

  return notes.reverse();
}

function EtsStageStepper({ currentStage }: { currentStage: EtsPipelineStage }) {
  const currentIdx = STAGE_INDEX[currentStage];

  return (
    <div className="flex items-center gap-1 overflow-x-auto py-2" data-testid="stage-stepper">
      {ETS_PIPELINE_STAGES.map((stage, i) => {
        const isDone = i < currentIdx;
        const isCurrent = i === currentIdx;

        return (
          <div key={stage} className="flex items-center gap-1">
            {i > 0 && (
              <div
                className={cn(
                  "h-0.5 w-4 sm:w-6 transition-colors",
                  isDone ? "bg-emerald-500" : isCurrent ? "bg-blue-400" : "bg-muted"
                )}
              />
            )}
            <div
              className={cn(
                "flex shrink-0 items-center justify-center rounded-full font-medium transition-colors size-7 text-xs",
                isDone && "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
                isCurrent && "bg-blue-100 text-blue-700 ring-2 ring-blue-400/40 dark:bg-blue-950 dark:text-blue-300 dark:ring-blue-500/40",
                !isDone && !isCurrent && "bg-muted text-muted-foreground"
              )}
              data-testid={`stage-step-${i}`}
            >
              {isDone ? <Check className="size-3.5" /> : i + 1}
            </div>
            <span
              className={cn(
                "text-xs font-medium whitespace-nowrap hidden md:inline",
                isDone && "text-emerald-700 dark:text-emerald-300",
                isCurrent && "text-blue-700 dark:text-blue-300",
                !isDone && !isCurrent && "text-muted-foreground"
              )}
            >
              {ETS_STAGE_LABELS[stage]}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function EtsClientDetailPage() {
  const [, params] = useRoute("/ets/clients/:id");
  const [, navigate] = useLocation();
  const qc = useQueryClient();
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [noteText, setNoteText] = useState("");

  const clientId = params?.id;

  const { data, isLoading } = useQuery<{ client: EtsClient; payments: EtsPayment[]; checklist: EtsChecklistItem[] }>({
    queryKey: ['/api/ets/clients', clientId],
    enabled: !!clientId,
  });

  const client = data?.client;
  const clientPayments = data?.payments || [];
  const checklist = data?.checklist || [];

  const stageMutation = useMutation({
    mutationFn: (stage: string) => apiRequest("PATCH", `/api/ets/clients/${clientId}`, { stage }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['/api/ets/clients', clientId] });
      qc.invalidateQueries({ queryKey: ['/api/ets/clients'] });
    },
  });

  const noteMutation = useMutation({
    mutationFn: (last_note: string) => apiRequest("PATCH", `/api/ets/clients/${clientId}`, { last_note }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['/api/ets/clients', clientId] });
      qc.invalidateQueries({ queryKey: ['/api/ets/clients'] });
    },
  });

  const checklistMutation = useMutation({
    mutationFn: ({ statusId, completed }: { statusId: number; completed: boolean }) =>
      apiRequest("PATCH", `/api/ets/checklist/${statusId}`, { completed }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['/api/ets/clients', clientId] });
    },
  });

  const timeline = useMemo(
    () => (client ? generateTimeline(client) : []),
    [client]
  );

  const notes = useMemo(
    () => (client ? generateNotes(client) : []),
    [client]
  );

  const paymentColumns: Column<EtsPayment>[] = [
    {
      key: "amount",
      header: "Amount",
      sortable: true,
      render: (item) => (
        <span className="text-sm font-medium" data-testid={`text-amount-${item.id}`}>
          ₹{item.amount.toLocaleString("en-IN")}
        </span>
      ),
    },
    {
      key: "type",
      header: "Type",
      render: (item) => (
        <StatusBadge
          status={item.type.charAt(0).toUpperCase() + item.type.slice(1)}
          variant={paymentTypeVariantMap[item.type] as any}
        />
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (item) => (
        <StatusBadge
          status={item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          variant={paymentStatusVariantMap[item.status]}
        />
      ),
    },
    {
      key: "date",
      header: "Date",
      sortable: true,
      render: (item) => <span className="text-sm text-muted-foreground">{item.date}</span>,
    },
    {
      key: "notes",
      header: "Notes",
      render: (item) => (
        <span className="text-sm text-muted-foreground line-clamp-1">{item.notes}</span>
      ),
    },
  ];

  if (isLoading) {
    return (
      <PageShell>
        <div className="flex flex-col gap-4">
          <div className="h-8 w-48 animate-pulse rounded-md bg-muted" />
          <div className="h-16 w-full animate-pulse rounded-md bg-muted" />
          <div className="h-64 w-full animate-pulse rounded-md bg-muted" />
        </div>
      </PageShell>
    );
  }

  if (!client) {
    return (
      <PageShell>
        <PageTransition>
          <div className="flex flex-col items-center gap-4 py-12">
            <p className="text-sm font-medium" data-testid="text-not-found">Client not found</p>
            <Button size="sm" variant="outline" onClick={() => navigate("/ets/pipeline")} data-testid="button-back">
              Back to Pipeline
            </Button>
          </div>
        </PageTransition>
      </PageShell>
    );
  }

  const scoreInfo = getScoreLabel(client.score);
  const ScoreIcon = scoreInfo.icon;
  const totalDue = client.totalPaid + client.pendingDues;
  const paymentPercent = totalDue > 0 ? Math.round((client.totalPaid / totalDue) * 100) : 0;
  const completedChecks = checklist.filter((c) => c.completed).length;

  return (
    <PageShell>
      <PageTransition>
        <div className="mb-4">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => navigate("/ets/pipeline")}
            data-testid="button-back-pipeline"
          >
            <ArrowLeft className="mr-1.5 size-3.5" />
            Back to Pipeline
          </Button>
        </div>

        <Fade direction="down" distance={10} duration={0.3}>
          <div className="mb-6 flex flex-col gap-4">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <PersonCell name={client.name} subtitle={`${client.city} · ${client.phone}`} size="lg" />
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <StatusBadge
                  status={`${scoreInfo.label} (${client.score})`}
                  variant={scoreInfo.variant}
                />
                <StatusBadge
                  status={client.packageTier.charAt(0).toUpperCase() + client.packageTier.slice(1)}
                  variant={tierVariantMap[client.packageTier] as any}
                />
                <StatusBadge
                  status={ETS_STAGE_LABELS[client.stage]}
                  variant="info"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Button
                size="sm"
                onClick={() => {
                  const idx = STAGE_INDEX[client.stage];
                  if (idx < ETS_PIPELINE_STAGES.length - 1) {
                    const nextStage = ETS_PIPELINE_STAGES[idx + 1];
                    stageMutation.mutate(nextStage);
                  }
                }}
                disabled={stageMutation.isPending}
                data-testid="button-move-stage"
              >
                <ChevronRight className="size-3.5" />
                Move to Next Stage
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate("/ets/proposals")}
                data-testid="button-generate-proposal"
              >
                <FileText className="size-3.5" />
                Generate Proposal
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setNoteDialogOpen(true)}
                data-testid="button-add-note"
              >
                <Plus className="size-3.5" />
                Add Note
              </Button>
              <a href={`https://wa.me/${client.phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer">
                <Button variant="outline" size="sm" className="gap-1.5 text-green-600 border-green-200 hover:bg-green-50" data-testid={`btn-whatsapp-${client.id}`}>
                  <SiWhatsapp className="size-3.5" /> WhatsApp
                </Button>
              </a>
            </div>

            <EtsStageStepper currentStage={client.stage} />
          </div>
        </Fade>

        <Stagger staggerInterval={0.05} className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
          <StaggerItem>
            <Card data-testid="card-financial-summary">
              <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Financial Summary</CardTitle>
                <IndianRupee className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Total Paid</span>
                  <span className="font-medium text-emerald-600 dark:text-emerald-400" data-testid="text-total-paid">
                    ₹{client.totalPaid.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Pending Dues</span>
                  <span className="font-medium text-amber-600 dark:text-amber-400" data-testid="text-pending-dues">
                    ₹{client.pendingDues.toLocaleString("en-IN")}
                  </span>
                </div>
                {totalDue > 0 && (
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Payment Progress</span>
                      <span>{paymentPercent}%</span>
                    </div>
                    <Progress value={paymentPercent} className="h-2" data-testid="progress-payment" />
                  </div>
                )}
                <div className="flex items-center justify-between text-sm border-t pt-2">
                  <span className="text-muted-foreground">Total Value</span>
                  <span className="font-semibold" data-testid="text-total-value">
                    ₹{totalDue.toLocaleString("en-IN")}
                  </span>
                </div>
              </CardContent>
            </Card>
          </StaggerItem>

          <StaggerItem>
            <Card data-testid="card-store-details">
              <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Store Details</CardTitle>
                <Store className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <div className="flex items-center gap-2 text-sm">
                  <Store className="size-3.5 text-muted-foreground" />
                  <span data-testid="text-store-size">{client.storeSize} sq ft</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="size-3.5 text-muted-foreground" />
                  <span>Source: {client.leadSource}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <User className="size-3.5 text-muted-foreground" />
                  <span data-testid="text-assigned-to">Assigned: {client.assignedTo}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CalendarDays className="size-3.5 text-muted-foreground" />
                  <span data-testid="text-next-action">
                    {client.nextAction} ({client.nextActionDate})
                  </span>
                </div>
              </CardContent>
            </Card>
          </StaggerItem>

          <StaggerItem>
            <Card data-testid="card-client-info">
              <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Client Info</CardTitle>
                <User className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="size-3.5 text-muted-foreground" />
                  <span data-testid="text-phone">{client.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="size-3.5 text-muted-foreground" />
                  <span>{client.city}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CalendarDays className="size-3.5 text-muted-foreground" />
                  <span>Created: {client.createdDate}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="size-3.5 text-muted-foreground" />
                  <span>{client.daysInStage} days in current stage</span>
                </div>
              </CardContent>
            </Card>
          </StaggerItem>
        </Stagger>

        <Tabs defaultValue="payments" data-testid="client-tabs">
          <TabsList data-testid="client-tabs-list">
            <TabsTrigger value="payments" data-testid="tab-payments">
              Payments ({clientPayments.length})
            </TabsTrigger>
            <TabsTrigger value="checklist" data-testid="tab-checklist">
              Checklist ({completedChecks}/{checklist.length})
            </TabsTrigger>
            <TabsTrigger value="timeline" data-testid="tab-timeline">
              Timeline
            </TabsTrigger>
            <TabsTrigger value="notes" data-testid="tab-notes">
              Notes ({notes.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="payments">
            <DataTable
              data={clientPayments}
              columns={paymentColumns}
              searchPlaceholder="Search payments..."
              searchKey="notes"
              filters={[
                { label: "Status", key: "status", options: ["received", "pending", "overdue"] },
                { label: "Type", key: "type", options: ["token", "milestone", "final"] },
              ]}
              emptyTitle="No payments"
              emptyDescription="No payment records found for this client."
            />
          </TabsContent>

          <TabsContent value="checklist">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Store Launch Readiness — {completedChecks}/{checklist.length} completed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-2">
                  {checklist.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 rounded-md border px-3 py-2 cursor-pointer"
                      data-testid={`checklist-item-${item.id}`}
                      onClick={() => checklistMutation.mutate({ statusId: item.id, completed: !item.completed })}
                    >
                      {item.completed ? (
                        <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                      ) : (
                        <Circle className="size-4 text-muted-foreground shrink-0" />
                      )}
                      <span
                        className={cn(
                          "text-sm",
                          item.completed && "line-through text-muted-foreground"
                        )}
                      >
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="timeline">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Activity Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative flex flex-col gap-0">
                  {timeline.map((entry, i) => {
                    const typeIcon = {
                      payment: IndianRupee,
                      stage: ChevronRight,
                      note: StickyNote,
                      action: CheckCircle2,
                    }[entry.type];
                    const TypeIcon = typeIcon;

                    return (
                      <div
                        key={entry.id}
                        className="flex gap-3 pb-4 last:pb-0"
                        data-testid={`timeline-entry-${entry.id}`}
                      >
                        <div className="flex flex-col items-center">
                          <div
                            className={cn(
                              "flex size-7 shrink-0 items-center justify-center rounded-full",
                              entry.type === "payment" && "bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400",
                              entry.type === "stage" && "bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400",
                              entry.type === "note" && "bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400",
                              entry.type === "action" && "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                            )}
                          >
                            <TypeIcon className="size-3.5" />
                          </div>
                          {i < timeline.length - 1 && (
                            <div className="w-px flex-1 bg-border mt-1" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0 pt-0.5">
                          <p className="text-sm">{entry.description}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{entry.date}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notes">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Notes</CardTitle>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setNoteDialogOpen(true)}
                  data-testid="button-add-note-tab"
                >
                  <Plus className="size-3.5" />
                  Add Note
                </Button>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-3">
                  {notes.map((note) => (
                    <div
                      key={note.id}
                      className="rounded-md border px-4 py-3"
                      data-testid={`note-${note.id}`}
                    >
                      <p className="text-sm">{note.content}</p>
                      <p className="text-xs text-muted-foreground mt-1.5">
                        {note.author} &middot; {note.date}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <FormDialog
          open={noteDialogOpen}
          onOpenChange={setNoteDialogOpen}
          title="Add Note"
          onSubmit={() => {
            if (noteText.trim()) {
              noteMutation.mutate(noteText.trim());
            }
            setNoteText("");
            setNoteDialogOpen(false);
          }}
          submitLabel="Save Note"
        >
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Note</label>
            <Textarea
              placeholder="Write your note here..."
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              className="resize-none text-sm"
              rows={4}
              data-testid="input-note-text"
            />
          </div>
        </FormDialog>
      </PageTransition>
    </PageShell>
  );
}
