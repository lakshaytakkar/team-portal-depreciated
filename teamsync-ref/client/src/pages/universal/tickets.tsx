import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import {
  Plus,
} from "lucide-react";
import { detectVerticalFromUrl } from "@/lib/verticals-config";
import { verticalMembers } from "@/lib/mock-data-shared";
import { PersonCell } from "@/components/ui/avatar-cells";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import {
  PageShell,
  IndexToolbar,
  FilterPill,
  PrimaryAction,
} from "@/components/layout";
import { DataTable, type Column, type RowAction } from "@/components/ds/data-table";
import { StatusBadge } from "@/components/ds/status-badge";
import { FormDialog } from "@/components/ds/form-dialog";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

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
  { value: "all", label: "All" },
  { value: "open", label: "Open" },
  { value: "in-progress", label: "In Progress" },
  { value: "waiting", label: "Waiting" },
  { value: "escalated", label: "Escalated" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
];

const PRIORITY_OPTIONS = [
  { value: "all", label: "All Priorities" },
  { value: "critical", label: "Critical" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

const CATEGORY_OPTIONS = [
  "Bug",
  "Feature Request",
  "Support",
  "Question",
  "Billing",
  "Access",
  "Integration",
  "Other",
];

export default function UniversalTickets() {
  const [location, setLocation] = useLocation();
  const vertical = detectVerticalFromUrl(location);
  const loading = useSimulatedLoading(600);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [assignDialogTicket, setAssignDialogTicket] = useState<CoreTicket | null>(null);
  const [statusDialogTicket, setStatusDialogTicket] = useState<CoreTicket | null>(null);

  const ticketsQueryKey = vertical?.id
    ? ["/api/core/tickets", { verticalId: vertical.id }]
    : null;

  const { data: ticketsResponse, isLoading: isTicketsLoading } = useQuery<{
    tickets: CoreTicket[];
    total: number;
  }>({
    queryKey: ticketsQueryKey!,
    queryFn: async () => {
      const params = new URLSearchParams({ verticalId: vertical!.id });
      const res = await fetch(`/api/core/tickets?${params}`);
      if (!res.ok) throw new Error("Failed to fetch tickets");
      return res.json();
    },
    enabled: !!vertical?.id,
  });

  const tickets = ticketsResponse?.tickets ?? [];

  const createMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      apiRequest("POST", "/api/core/tickets", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ticketsQueryKey! });
      setIsCreateOpen(false);
      toast({ title: "Ticket created", description: "New ticket has been created successfully." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create ticket.", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      apiRequest("PATCH", `/api/core/tickets/${id}`, data),
    onMutate: async ({ id, data }) => {
      if (!ticketsQueryKey) return;
      await queryClient.cancelQueries({ queryKey: ticketsQueryKey });
      const previous = queryClient.getQueryData<{ tickets: CoreTicket[]; total: number }>(ticketsQueryKey);
      if (previous) {
        queryClient.setQueryData(ticketsQueryKey, {
          ...previous,
          tickets: previous.tickets.map((t) =>
            t.id === id ? { ...t, ...data, updated_at: new Date().toISOString() } : t
          ),
        });
      }
      setAssignDialogTicket(null);
      setStatusDialogTicket(null);
      return { previous };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ticketsQueryKey! });
      toast({ title: "Ticket updated", description: "Ticket has been updated successfully." });
    },
    onError: (_err, _vars, context) => {
      if (context?.previous && ticketsQueryKey) {
        queryClient.setQueryData(ticketsQueryKey, context.previous);
      }
      toast({ title: "Error", description: "Failed to update ticket.", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/core/tickets/${id}`),
    onMutate: async (id) => {
      if (!ticketsQueryKey) return;
      await queryClient.cancelQueries({ queryKey: ticketsQueryKey });
      const previous = queryClient.getQueryData<{ tickets: CoreTicket[]; total: number }>(ticketsQueryKey);
      if (previous) {
        const filtered = previous.tickets.filter((t) => t.id !== id);
        queryClient.setQueryData(ticketsQueryKey, {
          tickets: filtered,
          total: Math.max(0, (previous.total ?? previous.tickets.length) - 1),
        });
      }
      return { previous };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ticketsQueryKey! });
      toast({ title: "Ticket deleted", description: "Ticket has been deleted." });
    },
    onError: (_err, _id, context) => {
      if (context?.previous && ticketsQueryKey) {
        queryClient.setQueryData(ticketsQueryKey, context.previous);
      }
      toast({ title: "Error", description: "Failed to delete ticket.", variant: "destructive" });
    },
  });

  const filteredTickets = useMemo(() => {
    let result = tickets;
    if (statusFilter !== "all") {
      result = result.filter((t) => t.status === statusFilter);
    }
    if (priorityFilter !== "all") {
      result = result.filter((t) => t.priority === priorityFilter);
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.ticket_code.toLowerCase().includes(q) ||
          (t.description ?? "").toLowerCase().includes(q)
      );
    }
    return result;
  }, [tickets, statusFilter, priorityFilter, search]);

  const stats = useMemo(() => {
    const total = tickets.length;
    const open = tickets.filter((t) => t.status === "open").length;
    const inProgress = tickets.filter((t) => t.status === "in-progress").length;
    const escalated = tickets.filter((t) => t.status === "escalated").length;
    const resolved = tickets.filter((t) => t.status === "resolved").length;
    return { total, open, inProgress, escalated, resolved };
  }, [tickets]);

  const members = useMemo(
    () => (vertical ? verticalMembers.filter((m) => m.verticalId === vertical.id) : []),
    [vertical]
  );

  const handleCreateSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    createMutation.mutate({
      vertical_id: vertical?.id ?? "",
      title: fd.get("title") as string,
      description: (fd.get("description") as string) || null,
      status: "open",
      priority: (fd.get("priority") as string) || "medium",
      category: (fd.get("category") as string) || null,
      reported_by: (fd.get("reported_by") as string) || null,
      assigned_to: (fd.get("assigned_to") as string) || null,
      due_date: (fd.get("due_date") as string) || null,
      tags: ((fd.get("tags") as string) || "")
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    });
  };

  if (!vertical) return null;

  const verticalPrefix = location.split("/").filter(Boolean)[0];

  const columns: Column<CoreTicket>[] = [
    {
      key: "ticket_code",
      header: "Code",
      width: "w-24",
      sortable: true,
      render: (t) => (
        <span className="text-xs font-semibold text-muted-foreground" data-testid={`text-code-${t.id}`}>
          {t.ticket_code}
        </span>
      ),
    },
    {
      key: "title",
      header: "Title",
      sortable: true,
      render: (t) => (
        <div className="max-w-[280px]">
          <p className="text-sm font-medium truncate" data-testid={`text-title-${t.id}`}>{t.title}</p>
          {t.description && (
            <p className="text-xs text-muted-foreground truncate mt-0.5">{t.description}</p>
          )}
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (t) => <StatusBadge status={t.status} />,
    },
    {
      key: "priority",
      header: "Priority",
      sortable: true,
      render: (t) => <StatusBadge status={t.priority} />,
    },
    {
      key: "category",
      header: "Category",
      sortable: true,
      render: (t) => (
        <span className="text-sm text-muted-foreground">{t.category ?? "—"}</span>
      ),
    },
    {
      key: "assigned_to",
      header: "Assigned To",
      sortable: true,
      render: (t) =>
        t.assigned_to ? (
          <PersonCell name={t.assigned_to} size="sm" />
        ) : (
          <span className="text-sm text-muted-foreground">Unassigned</span>
        ),
    },
    {
      key: "created_at",
      header: "Created",
      sortable: true,
      render: (t) => (
        <span className="text-sm text-muted-foreground">
          {new Date(t.created_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
        </span>
      ),
    },
    {
      key: "due_date",
      header: "Due Date",
      sortable: true,
      render: (t) => {
        if (!t.due_date) return <span className="text-sm text-muted-foreground">—</span>;
        const isOverdue =
          t.status !== "resolved" &&
          t.status !== "closed" &&
          new Date(t.due_date) < new Date();
        return (
          <span className={cn("text-sm", isOverdue ? "text-red-500 font-medium" : "text-muted-foreground")}>
            {new Date(t.due_date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </span>
        );
      },
    },
  ];

  const rowActions: RowAction<CoreTicket>[] = [
    {
      label: "View",
      onClick: (t) => setLocation(`/${verticalPrefix}/tickets/${t.id}`),
    },
    {
      label: "Assign",
      onClick: (t) => setAssignDialogTicket(t),
    },
    {
      label: "Change Status",
      onClick: (t) => setStatusDialogTicket(t),
    },
    {
      label: "Delete",
      variant: "destructive",
      separator: true,
      confirmMessage: "Are you sure you want to delete this ticket? This action cannot be undone.",
      onClick: (t) => deleteMutation.mutate(t.id),
    },
  ];

  const statusFilters = STATUS_OPTIONS.map((s) => ({
    value: s.value,
    label: s.label,
    count:
      s.value === "all"
        ? tickets.length
        : tickets.filter((t) => t.status === s.value).length,
  }));

  const showLoading = loading || isTicketsLoading;

  return (
    <PageShell className="flex flex-col h-full bg-background overflow-hidden p-0 lg:p-0">
      <div className="px-6 py-3 lg:px-10 border-b shrink-0 flex items-center gap-6 bg-card flex-wrap">
        <div className="shrink-0">
          <h1 className="text-[15px] font-semibold leading-tight">Tickets</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Track and resolve issues across your team</p>
        </div>
        <div className="w-px h-8 bg-border shrink-0 hidden sm:block" />
        <div className="flex items-center gap-2.5 flex-1 flex-wrap">
          {([
            { label: "Total", value: stats.total },
            { label: "Open", value: stats.open, color: "text-orange-500" },
            { label: "In Progress", value: stats.inProgress, color: "text-amber-500" },
            { label: "Escalated", value: stats.escalated, color: "text-red-500" },
            { label: "Resolved", value: stats.resolved, color: "text-emerald-600" },
          ] as { label: string; value: number; color?: string }[]).map((s) => (
            <div key={s.label} className="flex items-center gap-2 px-3 py-1.5 rounded-lg border bg-muted/40 shadow-sm">
              <span className={cn("text-base font-bold tabular-nums leading-none", s.color ?? "text-foreground")}>{s.value}</span>
              <span className="text-[11px] text-muted-foreground font-medium">{s.label}</span>
            </div>
          ))}
        </div>
        <div className="shrink-0">
          <PrimaryAction
            color={vertical.color}
            icon={Plus}
            onClick={() => setIsCreateOpen(true)}
            testId="btn-new-ticket"
          >
            New Ticket
          </PrimaryAction>
        </div>
      </div>

      <div className="px-6 lg:px-10 py-4 flex-1 overflow-y-auto space-y-4">

      <IndexToolbar
        search={search}
        onSearch={setSearch}
        filters={statusFilters}
        activeFilter={statusFilter}
        onFilter={setStatusFilter}
        color={vertical.color}
        placeholder="Search tickets by code, title, or description…"
        extra={
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-36 h-9 text-sm" data-testid="filter-priority">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              {PRIORITY_OPTIONS.map((p) => (
                <SelectItem key={p.value} value={p.value}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />

      {showLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-lg" />
          ))}
        </div>
      ) : (
        <DataTable
          data={filteredTickets}
          columns={columns}
          searchPlaceholder="Filter tickets…"
          searchKey="title"
          rowActions={rowActions}
          onRowClick={(t) => setLocation(`/${verticalPrefix}/tickets/${t.id}`)}
          filters={[
            {
              label: "Category",
              key: "category",
              options: CATEGORY_OPTIONS,
            },
          ]}
          pageSize={15}
          emptyTitle="No tickets found"
          emptyDescription="Create a new ticket to start tracking issues."
          data-testid="tickets-table"
        />
      )}
      </div>

      <FormDialog
        title="Create New Ticket"
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSubmit={() => {
          const form = document.getElementById("create-ticket-form") as HTMLFormElement;
          form?.requestSubmit();
        }}
        submitLabel="Create Ticket"
        isSubmitting={createMutation.isPending}
      >
        <form id="create-ticket-form" onSubmit={handleCreateSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ticket-title">Title</Label>
            <Input
              id="ticket-title"
              name="title"
              required
              placeholder="Brief description of the issue"
              data-testid="input-ticket-title"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ticket-description">Description</Label>
            <Textarea
              id="ticket-description"
              name="description"
              placeholder="Provide details about the issue…"
              data-testid="input-ticket-description"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select name="priority" defaultValue="medium">
                <SelectTrigger data-testid="select-ticket-priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select name="category" defaultValue="Support">
                <SelectTrigger data-testid="select-ticket-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_OPTIONS.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Reported By</Label>
              <Select name="reported_by">
                <SelectTrigger data-testid="select-ticket-reporter">
                  <SelectValue placeholder="Select reporter" />
                </SelectTrigger>
                <SelectContent>
                  {members.map((m) => (
                    <SelectItem key={m.id} value={m.name}>
                      <PersonCell name={m.name} size="sm" />
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Assign To</Label>
              <Select name="assigned_to">
                <SelectTrigger data-testid="select-ticket-assignee">
                  <SelectValue placeholder="Select assignee" />
                </SelectTrigger>
                <SelectContent>
                  {members.map((m) => (
                    <SelectItem key={m.id} value={m.name}>
                      <PersonCell name={m.name} size="sm" />
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ticket-due-date">Due Date</Label>
              <Input
                id="ticket-due-date"
                name="due_date"
                type="date"
                data-testid="input-ticket-due-date"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ticket-tags">Tags (comma separated)</Label>
              <Input
                id="ticket-tags"
                name="tags"
                placeholder="urgent, ui, backend"
                data-testid="input-ticket-tags"
              />
            </div>
          </div>
        </form>
      </FormDialog>

      <FormDialog
        title="Assign Ticket"
        open={!!assignDialogTicket}
        onOpenChange={(open) => !open && setAssignDialogTicket(null)}
        onSubmit={() => {
          const form = document.getElementById("assign-ticket-form") as HTMLFormElement;
          form?.requestSubmit();
        }}
        submitLabel="Assign"
        isSubmitting={updateMutation.isPending}
      >
        <form
          id="assign-ticket-form"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            if (assignDialogTicket) {
              updateMutation.mutate({
                id: assignDialogTicket.id,
                data: { assigned_to: fd.get("assigned_to") as string },
              });
            }
          }}
          className="space-y-4"
        >
          <p className="text-sm text-muted-foreground">
            Assign <span className="font-medium text-foreground">{assignDialogTicket?.ticket_code}</span> to a team member.
          </p>
          <div className="space-y-2">
            <Label>Assign To</Label>
            <Select name="assigned_to" defaultValue={assignDialogTicket?.assigned_to ?? undefined}>
              <SelectTrigger data-testid="select-assign-member">
                <SelectValue placeholder="Select member" />
              </SelectTrigger>
              <SelectContent>
                {members.map((m) => (
                  <SelectItem key={m.id} value={m.name}>
                    <PersonCell name={m.name} size="sm" />
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </form>
      </FormDialog>

      <FormDialog
        title="Change Status"
        open={!!statusDialogTicket}
        onOpenChange={(open) => !open && setStatusDialogTicket(null)}
        onSubmit={() => {
          const form = document.getElementById("status-ticket-form") as HTMLFormElement;
          form?.requestSubmit();
        }}
        submitLabel="Update Status"
        isSubmitting={updateMutation.isPending}
      >
        <form
          id="status-ticket-form"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            if (statusDialogTicket) {
              updateMutation.mutate({
                id: statusDialogTicket.id,
                data: { status: fd.get("status") as string },
              });
            }
          }}
          className="space-y-4"
        >
          <p className="text-sm text-muted-foreground">
            Change status for <span className="font-medium text-foreground">{statusDialogTicket?.ticket_code}</span>.
          </p>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select name="status" defaultValue={statusDialogTicket?.status ?? "open"}>
              <SelectTrigger data-testid="select-change-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.filter((s) => s.value !== "all").map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </form>
      </FormDialog>
    </PageShell>
  );
}
