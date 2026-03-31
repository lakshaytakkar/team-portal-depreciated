import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import {
  ArrowLeft,
  Calendar,
  User,
  Tag,
  AlertTriangle,
  CheckCircle2,
  Clock,
  XCircle,
  Trash2,
  Send,
  Copy,
  Check,
  Shield,
  MessageSquare,
  FileText,
  Loader2,
} from "lucide-react";
import { detectVerticalFromUrl } from "@/lib/verticals-config";
import { verticalMembers } from "@/lib/mock-data-shared";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { PageShell } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PersonCell } from "@/components/ui/avatar-cells";
import { cn } from "@/lib/utils";
import { StatusBadge } from "@/components/ds/status-badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface CoreTicket {
  id: string;
  ticket_code: string;
  vertical_id: string | null;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  category: string | null;
  reported_by: string | null;
  assigned_to: string | null;
  created_by: string | null;
  tags: string[];
  resolution: string | null;
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

const STATUS_OPTIONS = [
  { value: "open", label: "Open" },
  { value: "in-progress", label: "In Progress" },
  { value: "waiting", label: "Waiting" },
  { value: "escalated", label: "Escalated" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
];

const PRIORITY_OPTIONS = [
  { value: "critical", label: "Critical" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

const CATEGORY_OPTIONS = [
  "Bug",
  "Feature Request",
  "Support",
  "Billing",
  "Access",
  "Performance",
  "Security",
  "Other",
];

function priorityColor(p: string) {
  if (p === "critical") return "bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-300";
  if (p === "high") return "bg-orange-50 text-orange-600 dark:bg-orange-950 dark:text-orange-300";
  if (p === "medium") return "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-300";
  return "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300";
}

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function TicketDetailPage() {
  const [, params] = useRoute("/:vertical/tickets/:id");
  const [location, navigate] = useLocation();
  const vertical = detectVerticalFromUrl(location);
  const queryClient = useQueryClient();
  const [copied, setCopied] = useState(false);
  const [editingResolution, setEditingResolution] = useState(false);
  const [resolutionText, setResolutionText] = useState("");
  const [editingDescription, setEditingDescription] = useState(false);
  const [descriptionText, setDescriptionText] = useState("");

  const ticketId = params?.id;
  const ticketQueryKey = ["/api/core/tickets", ticketId];

  const { data: ticket, isLoading, error } = useQuery<CoreTicket>({
    queryKey: ticketQueryKey,
    queryFn: async () => {
      const res = await fetch(`/api/core/tickets/${ticketId}`);
      if (!res.ok) throw new Error("Failed to fetch ticket");
      return res.json();
    },
    enabled: !!ticketId,
  });

  const updateMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      apiRequest("PATCH", `/api/core/tickets/${ticketId}`, data),
    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey: ticketQueryKey });
      const previous = queryClient.getQueryData<CoreTicket>(ticketQueryKey);
      if (previous) {
        queryClient.setQueryData<CoreTicket>(ticketQueryKey, { ...previous, ...data, updated_at: new Date().toISOString() });
      }
      return { previous };
    },
    onError: (_err, _data, context) => {
      if (context?.previous) {
        queryClient.setQueryData(ticketQueryKey, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ticketQueryKey });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => apiRequest("DELETE", `/api/core/tickets/${ticketId}`),
    onSuccess: () => {
      const base = location.split("/tickets")[0];
      navigate(`${base}/tickets`);
    },
  });

  if (!vertical) return null;

  const backUrl = `${vertical.navCategories[0]?.defaultUrl?.split("/")[1] ? "/" + location.split("/")[1] : ""}/tickets`;

  if (isLoading) {
    return (
      <PageShell className="space-y-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-md" />
          <Skeleton className="h-6 w-48" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-48 rounded-xl" />
            <Skeleton className="h-32 rounded-xl" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-64 rounded-xl" />
          </div>
        </div>
      </PageShell>
    );
  }

  if (error || !ticket) {
    return (
      <PageShell className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <XCircle className="h-12 w-12 text-muted-foreground" />
        <h2 className="text-lg font-semibold" data-testid="text-error">Ticket not found</h2>
        <Button variant="outline" onClick={() => navigate(backUrl)} data-testid="button-back-to-tickets">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Tickets
        </Button>
      </PageShell>
    );
  }

  const isOverdue = ticket.due_date && !["resolved", "closed"].includes(ticket.status) && new Date(ticket.due_date) < new Date();
  const members = verticalMembers.filter(m => m.verticalId === vertical.id);

  function handleFieldUpdate(field: string, value: string | null) {
    updateMutation.mutate({ [field]: value });
  }

  return (
    <PageShell className="space-y-0 p-0 lg:p-0">
      <div className="px-6 py-4 lg:px-8 border-b bg-card flex items-center gap-4 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(backUrl)}
          data-testid="button-back"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Badge variant="outline" className="text-xs shrink-0" data-testid="text-ticket-code">
            {ticket.ticket_code}
          </Badge>
          <h1 className="text-lg font-semibold truncate" data-testid="text-ticket-title">
            {ticket.title}
          </h1>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <StatusBadge status={ticket.status} />
          <Badge className={cn("text-xs font-medium capitalize border-0", priorityColor(ticket.priority))} data-testid="badge-priority">
            {ticket.priority}
          </Badge>
          <Button
            variant="ghost"
            size="icon"
            title="Copy ticket code"
            onClick={() => {
              navigator.clipboard.writeText(`${ticket.ticket_code}: ${ticket.title}`);
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            }}
            data-testid="button-copy-ticket"
          >
            {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <div className="px-6 py-3 lg:px-8 border-b bg-card flex items-center gap-2 flex-wrap shrink-0">
        <Select
          value={ticket.status}
          onValueChange={(v) => handleFieldUpdate("status", v)}
        >
          <SelectTrigger className="w-40 h-8 text-xs" data-testid="select-status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map(s => (
              <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="sm"
          onClick={() => handleFieldUpdate("status", "escalated")}
          disabled={ticket.status === "escalated" || updateMutation.isPending}
          data-testid="button-escalate"
        >
          <AlertTriangle className="h-3.5 w-3.5 mr-1.5" />
          Escalate
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleFieldUpdate("status", "resolved")}
          disabled={ticket.status === "resolved" || updateMutation.isPending}
          data-testid="button-resolve"
        >
          <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
          Resolve
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleFieldUpdate("status", "closed")}
          disabled={ticket.status === "closed" || updateMutation.isPending}
          data-testid="button-close-ticket"
        >
          <XCircle className="h-3.5 w-3.5 mr-1.5" />
          Close
        </Button>

        <div className="flex-1" />

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive"
              data-testid="button-delete-ticket"
            >
              <Trash2 className="h-3.5 w-3.5 mr-1.5" />
              Delete
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Ticket</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete ticket {ticket.ticket_code}? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteMutation.mutate()}
                className="bg-destructive text-destructive-foreground"
                data-testid="button-confirm-delete"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6 lg:px-8 bg-muted/30">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="rounded-xl overflow-hidden" data-testid="section-details">
              <div className="px-5 py-3.5 border-b bg-card">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  Details
                </h3>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <Label className="text-xs text-muted-foreground font-medium">Description</Label>
                  {editingDescription ? (
                    <div className="mt-1.5 space-y-2">
                      <Textarea
                        value={descriptionText}
                        onChange={(e) => setDescriptionText(e.target.value)}
                        className="min-h-[100px] text-sm"
                        data-testid="input-edit-description"
                      />
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          onClick={() => {
                            handleFieldUpdate("description", descriptionText);
                            setEditingDescription(false);
                          }}
                          disabled={updateMutation.isPending}
                          data-testid="button-save-description"
                        >
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingDescription(false)}
                          data-testid="button-cancel-description"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p
                      className="mt-1.5 text-sm leading-relaxed cursor-pointer hover:bg-muted/50 rounded-md px-2 py-1.5 -mx-2 transition-colors"
                      onClick={() => {
                        setDescriptionText(ticket.description ?? "");
                        setEditingDescription(true);
                      }}
                      data-testid="text-description"
                    >
                      {ticket.description || "No description provided. Click to add one."}
                    </p>
                  )}
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground font-medium">Category</Label>
                    <Select
                      value={ticket.category ?? ""}
                      onValueChange={(v) => handleFieldUpdate("category", v)}
                    >
                      <SelectTrigger className="mt-1.5 h-8 text-xs" data-testid="select-category">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORY_OPTIONS.map(c => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground font-medium">Priority</Label>
                    <Select
                      value={ticket.priority}
                      onValueChange={(v) => handleFieldUpdate("priority", v)}
                    >
                      <SelectTrigger className="mt-1.5 h-8 text-xs" data-testid="select-priority">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PRIORITY_OPTIONS.map(p => (
                          <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground font-medium">Reported By</Label>
                    <div className="mt-1.5" data-testid="text-reported-by">
                      {ticket.reported_by ? <PersonCell name={ticket.reported_by} size="sm" /> : <span className="text-sm">—</span>}
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground font-medium">Created By</Label>
                    <div className="mt-1.5" data-testid="text-created-by">
                      {ticket.created_by ? <PersonCell name={ticket.created_by} size="sm" /> : <span className="text-sm">—</span>}
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground font-medium">Due Date</Label>
                    <div className="mt-1.5">
                      <input
                        type="date"
                        value={ticket.due_date ? ticket.due_date.split("T")[0] : ""}
                        onChange={(e) => handleFieldUpdate("due_date", e.target.value || null)}
                        className={cn(
                          "h-8 w-full rounded-md bg-secondary px-3 text-xs font-medium border-0 shadow-none outline-none focus:ring-1 focus:ring-ring",
                          isOverdue ? "text-red-500" : "text-foreground"
                        )}
                        data-testid="input-due-date"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground font-medium">Assigned To</Label>
                    <Select
                      value={ticket.assigned_to ?? ""}
                      onValueChange={(v) => handleFieldUpdate("assigned_to", v)}
                    >
                      <SelectTrigger className="mt-1.5 h-8 text-xs" data-testid="select-assignee">
                        <SelectValue placeholder="Unassigned" />
                      </SelectTrigger>
                      <SelectContent>
                        {members.map(m => (
                          <SelectItem key={m.id} value={m.name}>
                            <PersonCell name={m.name} size="sm" />
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {ticket.tags && ticket.tags.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <Label className="text-xs text-muted-foreground font-medium">Tags</Label>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {ticket.tags.map(tag => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="text-xs"
                            data-testid={`tag-${tag}`}
                          >
                            <Tag className="h-3 w-3 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </Card>

            <Card className="rounded-xl overflow-hidden" data-testid="section-resolution">
              <div className="px-5 py-3.5 border-b bg-card">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                  Resolution
                </h3>
              </div>
              <div className="p-5">
                {editingResolution ? (
                  <div className="space-y-2">
                    <Textarea
                      value={resolutionText}
                      onChange={(e) => setResolutionText(e.target.value)}
                      placeholder="Describe how this ticket was resolved..."
                      className="min-h-[100px] text-sm"
                      data-testid="input-edit-resolution"
                    />
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={() => {
                          handleFieldUpdate("resolution", resolutionText);
                          setEditingResolution(false);
                        }}
                        disabled={updateMutation.isPending}
                        data-testid="button-save-resolution"
                      >
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditingResolution(false)}
                        data-testid="button-cancel-resolution"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p
                    className="text-sm leading-relaxed cursor-pointer hover:bg-muted/50 rounded-md px-2 py-1.5 -mx-2 transition-colors"
                    onClick={() => {
                      setResolutionText(ticket.resolution ?? "");
                      setEditingResolution(true);
                    }}
                    data-testid="text-resolution"
                  >
                    {ticket.resolution || "No resolution yet. Click to add one."}
                  </p>
                )}
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="rounded-xl overflow-hidden" data-testid="section-sidebar-info">
              <div className="px-5 py-3.5 border-b bg-card">
                <h3 className="text-sm font-semibold">Ticket Info</h3>
              </div>
              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Status</span>
                  <StatusBadge status={ticket.status} />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Priority</span>
                  <Badge className={cn("text-xs font-medium capitalize border-0", priorityColor(ticket.priority))}>
                    {ticket.priority}
                  </Badge>
                </div>
                <Separator />
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-muted-foreground">Assigned To</span>
                  {ticket.assigned_to ? (
                    <PersonCell name={ticket.assigned_to} size="sm" />
                  ) : (
                    <span className="text-xs text-muted-foreground">Unassigned</span>
                  )}
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Category</span>
                  <span className="text-xs font-medium" data-testid="text-sidebar-category">
                    {ticket.category || "—"}
                  </span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Due Date</span>
                  <span className={cn("text-xs font-medium", isOverdue && "text-red-500")} data-testid="text-sidebar-due-date">
                    {formatDate(ticket.due_date)}
                  </span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Created</span>
                  <span className="text-xs font-medium" data-testid="text-sidebar-created">
                    {formatDateTime(ticket.created_at)}
                  </span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Updated</span>
                  <span className="text-xs font-medium" data-testid="text-sidebar-updated">
                    {timeAgo(ticket.updated_at)}
                  </span>
                </div>
              </div>
            </Card>

            <Card className="rounded-xl overflow-hidden" data-testid="section-timeline">
              <div className="px-5 py-3.5 border-b bg-card">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  Timeline
                </h3>
              </div>
              <div className="p-5">
                <div className="space-y-4">
                  {ticket.resolution && (
                    <TimelineItem
                      icon={<CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />}
                      title="Resolution added"
                      description={ticket.resolution.length > 80 ? ticket.resolution.substring(0, 80) + "..." : ticket.resolution}
                      time={timeAgo(ticket.updated_at)}
                    />
                  )}
                  {ticket.status === "escalated" && (
                    <TimelineItem
                      icon={<AlertTriangle className="h-3.5 w-3.5 text-amber-500" />}
                      title="Ticket escalated"
                      description="This ticket has been escalated for urgent attention"
                      time={timeAgo(ticket.updated_at)}
                    />
                  )}
                  {ticket.assigned_to && (
                    <TimelineItem
                      icon={<User className="h-3.5 w-3.5 text-blue-500" />}
                      title={`Assigned to ${ticket.assigned_to}`}
                      time={timeAgo(ticket.updated_at)}
                    />
                  )}
                  <TimelineItem
                    icon={<MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />}
                    title="Ticket created"
                    description={`Created by ${ticket.created_by || "System"}`}
                    time={formatDateTime(ticket.created_at)}
                  />
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </PageShell>
  );
}

function TimelineItem({
  icon,
  title,
  description,
  time,
}: {
  icon: React.ReactNode;
  title: string;
  description?: string;
  time: string;
}) {
  return (
    <div className="flex gap-3">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold">{title}</p>
        {description && (
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{description}</p>
        )}
        <p className="text-xs text-muted-foreground/70 mt-0.5">{time}</p>
      </div>
    </div>
  );
}
