import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Clock, AlertTriangle, Plus, MessageSquare, User, X } from "lucide-react";
import { mockTickets, mockOpsClients, TEAM_MEMBERS, type OpsTicket, type TicketPriority, type TicketStatus } from "@/lib/mock-data-ops-ets";

const PRIORITY_COLORS: Record<TicketPriority, string> = {
  urgent: "bg-red-100 text-red-700 border-red-200",
  high: "bg-orange-100 text-orange-700 border-orange-200",
  medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
  low: "bg-gray-100 text-gray-600 border-gray-200",
};

const STATUS_COLORS: Record<TicketStatus, string> = {
  open: "bg-blue-100 text-blue-700",
  "in-progress": "bg-amber-100 text-amber-700",
  resolved: "bg-emerald-100 text-emerald-700",
  closed: "bg-gray-100 text-gray-500",
};

function fmtTimestamp(ts: string): string {
  return new Date(ts).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function daysSince(ts: string): number {
  const d = new Date(ts);
  const now = new Date("2026-03-26");
  return Math.max(0, Math.floor((now.getTime() - d.getTime()) / 86400000));
}

export default function EtsOpsTicketsPage() {
  const [tickets, setTickets] = useState<OpsTicket[]>(mockTickets);
  const [selectedTicket, setSelectedTicket] = useState<OpsTicket | null>(null);
  const [filterPriority, setFilterPriority] = useState<TicketPriority | "all">("all");
  const [filterStatus, setFilterStatus] = useState<TicketStatus | "all">("all");
  const [filterAssignee, setFilterAssignee] = useState<"all" | "mine">("all");
  const [filterClient, setFilterClient] = useState<string>("all");
  const [replyText, setReplyText] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  const [newTitle, setNewTitle] = useState("");
  const [newClientId, setNewClientId] = useState("OC001");
  const [newPriority, setNewPriority] = useState<TicketPriority>("medium");
  const [newDescription, setNewDescription] = useState("");
  const [newAssignee, setNewAssignee] = useState("Aditya");

  const priorityCounts: Record<TicketPriority, number> = {
    urgent: tickets.filter((t) => t.priority === "urgent").length,
    high: tickets.filter((t) => t.priority === "high").length,
    medium: tickets.filter((t) => t.priority === "medium").length,
    low: tickets.filter((t) => t.priority === "low").length,
  };

  const filtered = tickets.filter((t) => {
    if (filterPriority !== "all" && t.priority !== filterPriority) return false;
    if (filterStatus !== "all" && t.status !== filterStatus) return false;
    if (filterAssignee === "mine" && t.assignedTo !== "Aditya") return false;
    if (filterClient !== "all" && t.clientId !== filterClient) return false;
    return true;
  });

  function addReply() {
    if (!selectedTicket || !replyText.trim()) return;
    const updatedTickets = tickets.map((t) => {
      if (t.id !== selectedTicket.id) return t;
      return {
        ...t,
        updatedAt: new Date().toISOString(),
        thread: [
          ...t.thread,
          { id: `TM-${Date.now()}`, actor: "Aditya", text: replyText.trim(), timestamp: new Date().toISOString() },
        ],
      };
    });
    setTickets(updatedTickets);
    setSelectedTicket(updatedTickets.find((t) => t.id === selectedTicket.id) ?? null);
    setReplyText("");
  }

  function createTicket() {
    if (!newTitle.trim()) return;
    const client = mockOpsClients.find((c) => c.id === newClientId);
    const newTicket: OpsTicket = {
      id: `TK${String(tickets.length + 1).padStart(3, "0")}`,
      title: newTitle.trim(),
      clientId: newClientId,
      clientName: client?.name ?? "Unknown",
      priority: newPriority,
      status: "open",
      assignedTo: newAssignee,
      description: newDescription.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      thread: [
        { id: `TM-${Date.now()}`, actor: "Aditya", text: newDescription.trim(), timestamp: new Date().toISOString() },
      ],
    };
    setTickets([newTicket, ...tickets]);
    setNewTitle("");
    setNewDescription("");
    setNewPriority("medium");
    setShowCreate(false);
  }

  if (selectedTicket) {
    const ticket = tickets.find((t) => t.id === selectedTicket.id) ?? selectedTicket;
    return (
      <div className="px-6 lg:px-10 py-6 space-y-4" data-testid="ops-ticket-detail">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => setSelectedTicket(null)} className="text-muted-foreground" data-testid="button-back-to-tickets">
            ← Back to Tickets
          </Button>
        </div>
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <p className="text-xs text-muted-foreground font-mono mb-1">{ticket.id}</p>
                <h2 className="text-lg font-bold" data-testid="text-ticket-title">{ticket.title}</h2>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <Badge className={`${PRIORITY_COLORS[ticket.priority]} text-xs capitalize`} variant="outline">
                    {ticket.priority}
                  </Badge>
                  <Badge className={`${STATUS_COLORS[ticket.status]} text-xs capitalize`} variant="outline">
                    {ticket.status.replace("-", " ")}
                  </Badge>
                  <span className="text-xs text-muted-foreground">Client: {ticket.clientName}</span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <User className="w-3 h-3" /> {ticket.assignedTo}
                  </span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0 space-y-4">
            <div className="p-3 bg-muted/30 rounded-lg text-sm text-muted-foreground">
              {ticket.description}
            </div>
            <div className="space-y-3" data-testid="ticket-thread">
              {ticket.thread.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.actor === "Aditya" ? "flex-row-reverse" : ""}`}
                  data-testid={`thread-message-${msg.id}`}
                >
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-xs font-bold text-emerald-700 shrink-0">
                    {msg.actor[0]}
                  </div>
                  <div className={`max-w-[80%] ${msg.actor === "Aditya" ? "items-end" : "items-start"} flex flex-col`}>
                    <div className={`px-3 py-2 rounded-lg text-sm ${msg.actor === "Aditya" ? "bg-emerald-50 text-emerald-900" : "bg-muted/50"}`}>
                      {msg.text}
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {msg.actor} · {fmtTimestamp(msg.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2 pt-2 border-t">
              <Textarea
                placeholder="Add an update..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="text-sm min-h-[60px]"
                data-testid="input-ticket-reply"
              />
              <Button size="sm" className="self-end shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={addReply} data-testid="button-send-reply">
                Send
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="px-6 lg:px-10 py-6 space-y-5" data-testid="ops-tickets-page">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold">Support Tickets</h1>
          <p className="text-sm text-muted-foreground">Manage and track all client issues</p>
        </div>
        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" data-testid="button-create-ticket">
              <Plus className="w-4 h-4 mr-1" /> New Ticket
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Ticket</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 mt-2">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Title</label>
                <Input placeholder="Ticket title..." value={newTitle} onChange={(e) => setNewTitle(e.target.value)} data-testid="input-ticket-title" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Client</label>
                <Select value={newClientId} onValueChange={setNewClientId}>
                  <SelectTrigger data-testid="select-ticket-client">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {mockOpsClients.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name} — {c.city}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Priority</label>
                  <Select value={newPriority} onValueChange={(v) => setNewPriority(v as TicketPriority)}>
                    <SelectTrigger data-testid="select-ticket-priority">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Assignee</label>
                  <Select value={newAssignee} onValueChange={setNewAssignee}>
                    <SelectTrigger data-testid="select-ticket-assignee">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TEAM_MEMBERS.map((m) => (
                        <SelectItem key={m} value={m}>{m}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Description</label>
                <Textarea placeholder="Describe the issue..." value={newDescription} onChange={(e) => setNewDescription(e.target.value)} className="min-h-[80px]" data-testid="input-ticket-description" />
              </div>
              <div className="flex gap-2 pt-1">
                <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={createTicket} data-testid="button-submit-ticket">
                  Create Ticket
                </Button>
                <Button variant="outline" onClick={() => setShowCreate(false)} data-testid="button-cancel-create">Cancel</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-2 flex-wrap" data-testid="priority-count-bar">
        {(["urgent", "high", "medium", "low"] as TicketPriority[]).map((p) => (
          <button
            key={p}
            onClick={() => setFilterPriority(filterPriority === p ? "all" : p)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${filterPriority === p ? PRIORITY_COLORS[p] + " ring-1 ring-offset-1 ring-current" : "bg-muted/30 text-muted-foreground border-transparent"}`}
            data-testid={`filter-priority-${p}`}
          >
            {priorityCounts[p]} {p.charAt(0).toUpperCase() + p.slice(1)}
          </button>
        ))}
        {filterPriority !== "all" && (
          <button onClick={() => setFilterPriority("all")} className="flex items-center gap-1 px-2 py-1 text-xs text-muted-foreground hover:text-foreground" data-testid="button-clear-priority-filter">
            <X className="w-3 h-3" /> Clear
          </button>
        )}
      </div>

      <div className="flex gap-2 flex-wrap items-center">
        <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as TicketStatus | "all")}>
          <SelectTrigger className="w-36 h-8 text-xs" data-testid="filter-status">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterClient} onValueChange={setFilterClient}>
          <SelectTrigger className="w-44 h-8 text-xs" data-testid="filter-client">
            <SelectValue placeholder="Client" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Clients</SelectItem>
            {mockOpsClients.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <button
          onClick={() => setFilterAssignee(filterAssignee === "mine" ? "all" : "mine")}
          className={`px-3 py-1.5 rounded-lg text-xs border transition-all ${filterAssignee === "mine" ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-muted/30 text-muted-foreground border-transparent"}`}
          data-testid="filter-assigned-to-me"
        >
          Assigned to me
        </button>
      </div>

      <div className="space-y-2" data-testid="tickets-list">
        {filtered.length === 0 && (
          <div className="text-center py-10 text-muted-foreground text-sm">No tickets match your filters.</div>
        )}
        {filtered.map((ticket) => (
          <Card
            key={ticket.id}
            className="border-0 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setSelectedTicket(ticket)}
            data-testid={`ticket-row-${ticket.id}`}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-xs font-mono text-muted-foreground">{ticket.id}</span>
                    <Badge className={`${PRIORITY_COLORS[ticket.priority]} text-[10px] capitalize`} variant="outline">
                      {ticket.priority}
                    </Badge>
                    <Badge className={`${STATUS_COLORS[ticket.status]} text-[10px] capitalize`} variant="outline">
                      {ticket.status.replace("-", " ")}
                    </Badge>
                  </div>
                  <p className="font-medium text-sm">{ticket.title}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1 flex-wrap">
                    <span>{ticket.clientName}</span>
                    <span className="flex items-center gap-1"><User className="w-3 h-3" /> {ticket.assignedTo}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {daysSince(ticket.createdAt)}d open</span>
                    <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" /> {ticket.thread.length} messages</span>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {new Date(ticket.updatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
