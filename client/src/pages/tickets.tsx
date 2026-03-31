import { useState } from "react";
import { useLocation } from "wouter";
import { useStore } from "@/lib/store";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Search, Ticket, Clock, AlertCircle, CheckCircle2, XCircle, Pencil } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import type { Ticket as TicketType, User } from "@shared/schema";

const STATUSES = ["open", "in_progress", "resolved", "closed"];
const PRIORITIES = ["low", "medium", "high", "urgent"];
const CATEGORIES = ["general", "billing", "technical", "complaint", "feature_request", "refund"];

interface TicketFormData {
  title: string;
  description: string;
  priority: string;
  category: string;
  assignedTo: string | null;
  status: string;
  resolution: string;
}

function TicketForm({ ticket, users, onSave, onCancel }: {
  ticket?: TicketType;
  users: User[];
  onSave: (data: TicketFormData) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    title: ticket?.title || "",
    description: ticket?.description || "",
    priority: ticket?.priority || "medium",
    category: ticket?.category || "general",
    assignedTo: ticket?.assignedTo || "",
    status: ticket?.status || "open",
    resolution: ticket?.resolution || "",
  });

  return (
    <div className="grid gap-4 py-4">
      <div className="space-y-2">
        <Label>Title *</Label>
        <Input data-testid="input-ticket-title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
      </div>
      <div className="space-y-2">
        <Label>Description *</Label>
        <Textarea data-testid="input-ticket-desc" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={4} />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Priority</Label>
          <Select value={form.priority} onValueChange={v => setForm(f => ({ ...f, priority: v }))}>
            <SelectTrigger data-testid="select-ticket-priority"><SelectValue /></SelectTrigger>
            <SelectContent>
              {PRIORITIES.map(p => <SelectItem key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Category</Label>
          <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
            <SelectTrigger data-testid="select-ticket-category"><SelectValue /></SelectTrigger>
            <SelectContent>
              {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Status</Label>
          <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
            <SelectTrigger data-testid="select-ticket-status"><SelectValue /></SelectTrigger>
            <SelectContent>
              {STATUSES.map(s => <SelectItem key={s} value={s}>{s.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label>Assign To</Label>
        <Select value={form.assignedTo} onValueChange={v => setForm(f => ({ ...f, assignedTo: v }))}>
          <SelectTrigger data-testid="select-ticket-assigned"><SelectValue placeholder="Select user" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Unassigned</SelectItem>
            {users.map(u => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      {ticket && (
        <div className="space-y-2">
          <Label>Resolution Notes</Label>
          <Textarea data-testid="input-ticket-resolution" value={form.resolution} onChange={e => setForm(f => ({ ...f, resolution: e.target.value }))} rows={3} placeholder="Add resolution details..." />
        </div>
      )}
      <DialogFooter>
        <Button variant="outline" onClick={onCancel} data-testid="button-cancel">Cancel</Button>
        <Button onClick={() => {
          onSave({ ...form, assignedTo: form.assignedTo === "none" ? null : form.assignedTo || null });
        }} disabled={!form.title || !form.description} data-testid="button-save-ticket">
          {ticket ? "Update" : "Create"} Ticket
        </Button>
      </DialogFooter>
    </div>
  );
}

const statusIcon = (status: string) => {
  switch (status) {
    case "open": return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    case "in_progress": return <Clock className="h-4 w-4 text-blue-500" />;
    case "resolved": return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    case "closed": return <XCircle className="h-4 w-4 text-muted-foreground" />;
    default: return <Ticket className="h-4 w-4" />;
  }
};

const priorityBadge = (p: string) => {
  switch (p) {
    case "urgent": return "destructive" as const;
    case "high": return "default" as const;
    case "medium": return "secondary" as const;
    default: return "outline" as const;
  }
};

export default function TicketsPage() {
  const [, navigate] = useLocation();
  const { currentTeamId } = useStore();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState<TicketType | undefined>();
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("open");

  const ticketsUrl = currentTeamId ? `/api/tickets?team_id=${currentTeamId}` : "/api/tickets";
  const { data: allTickets = [], isLoading } = useQuery<TicketType[]>({
    queryKey: [ticketsUrl],
  });
  const { data: users = [] } = useQuery<User[]>({ queryKey: ["/api/users"] });

  const tickets = allTickets.filter(t => {
    if (activeTab !== "all" && t.status !== activeTab) return false;
    if (search && !t.title.toLowerCase().includes(search.toLowerCase()) && !t.ticketCode.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const createMutation = useMutation({
    mutationFn: (data: TicketFormData) => apiRequest("POST", "/api/tickets", { ...data, teamId: currentTeamId }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/tickets"] }); setDialogOpen(false); toast({ title: "Ticket created" }); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<TicketFormData> }) => apiRequest("PATCH", `/api/tickets/${id}`, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/tickets"] }); setDialogOpen(false); setEditingTicket(undefined); toast({ title: "Ticket updated" }); },
  });

  const counts = {
    open: allTickets.filter(t => t.status === "open").length,
    in_progress: allTickets.filter(t => t.status === "in_progress").length,
    resolved: allTickets.filter(t => t.status === "resolved").length,
    closed: allTickets.filter(t => t.status === "closed").length,
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-page-title">Tickets</h1>
          <p className="text-muted-foreground">{allTickets.length} total tickets</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) setEditingTicket(undefined); }}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-ticket"><Plus className="h-4 w-4 mr-2" /> New Ticket</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle>{editingTicket ? "Edit Ticket" : "New Ticket"}</DialogTitle></DialogHeader>
            <TicketForm ticket={editingTicket} users={users} onSave={(data) => { editingTicket ? updateMutation.mutate({ id: editingTicket.id, data }) : createMutation.mutate(data); }} onCancel={() => { setDialogOpen(false); setEditingTicket(undefined); }} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input data-testid="input-search-tickets" placeholder="Search by title or ticket code..." className="pl-10" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="open" data-testid="tab-open">Open ({counts.open})</TabsTrigger>
          <TabsTrigger value="in_progress" data-testid="tab-in-progress">In Progress ({counts.in_progress})</TabsTrigger>
          <TabsTrigger value="resolved" data-testid="tab-resolved">Resolved ({counts.resolved})</TabsTrigger>
          <TabsTrigger value="closed" data-testid="tab-closed">Closed ({counts.closed})</TabsTrigger>
          <TabsTrigger value="all" data-testid="tab-all">All</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="space-y-3">
        {tickets.length === 0 ? (
          <Card><CardContent className="py-8 text-center text-muted-foreground">No tickets in this category.</CardContent></Card>
        ) : (
          tickets.map(ticket => {
            const assignee = users.find(u => u.id === ticket.assignedTo);
            return (
              <Card key={ticket.id} className="hover:shadow-md transition-shadow cursor-pointer" data-testid={`card-ticket-${ticket.id}`} onClick={() => navigate(`/tickets/${ticket.id}`)}>
                <CardContent className="p-4 flex items-center gap-4">
                  {statusIcon(ticket.status)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-muted-foreground" data-testid={`text-ticket-code-${ticket.id}`}>{ticket.ticketCode}</span>
                      <p className="font-medium" data-testid={`text-ticket-title-${ticket.id}`}>{ticket.title}</p>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                      <Badge variant={priorityBadge(ticket.priority)}>{ticket.priority}</Badge>
                      <Badge variant="outline">{ticket.category.replace(/_/g, " ")}</Badge>
                      {assignee && <span>Assigned to {assignee.name}</span>}
                      <span>{formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); setEditingTicket(ticket); setDialogOpen(true); }} data-testid={`button-edit-ticket-${ticket.id}`}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
