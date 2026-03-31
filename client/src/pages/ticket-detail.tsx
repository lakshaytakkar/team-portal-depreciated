import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft, AlertCircle, Clock, CheckCircle2, XCircle, Ticket, User as UserIcon, Calendar, Tag, MessageSquare } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import type { Ticket as TicketType, User, AuditLog } from "@shared/schema";

const STATUSES = ["open", "in_progress", "resolved", "closed"];

const statusIcon = (status: string) => {
  switch (status) {
    case "open": return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    case "in_progress": return <Clock className="h-5 w-5 text-blue-500" />;
    case "resolved": return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    case "closed": return <XCircle className="h-5 w-5 text-muted-foreground" />;
    default: return <Ticket className="h-5 w-5" />;
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

const statusLabel = (s: string) => s.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());

export default function TicketDetailPage() {
  const [, params] = useRoute("/tickets/:id");
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const ticketId = params?.id;

  const [newStatus, setNewStatus] = useState<string | null>(null);
  const [resolution, setResolution] = useState("");

  const { data: ticket, isLoading } = useQuery<TicketType>({
    queryKey: ["/api/tickets", ticketId],
    queryFn: () => fetch(`/api/tickets/${ticketId}`, { credentials: "include" }).then(r => r.json()),
    enabled: !!ticketId,
  });

  const { data: users = [] } = useQuery<User[]>({ queryKey: ["/api/users"] });

  const { data: auditLogs = [] } = useQuery<AuditLog[]>({
    queryKey: ["/api/admin/audit", ticketId],
    queryFn: () => fetch(`/api/admin/audit?entity_type=ticket&entity_id=${ticketId}`, { credentials: "include" }).then(r => {
      if (!r.ok) return [];
      return r.json();
    }),
    enabled: !!ticketId,
  });

  const updateMutation = useMutation({
    mutationFn: (data: { status?: string; resolution?: string }) => apiRequest("PATCH", `/api/tickets/${ticketId}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tickets", ticketId] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/audit", ticketId] });
      queryClient.invalidateQueries({ queryKey: ["/api/tickets"] });
      setNewStatus(null);
      toast({ title: "Ticket updated" });
    },
  });

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  }

  if (!ticket) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Ticket not found.</p>
        <Button variant="link" onClick={() => navigate("/tickets")}>Back to Tickets</Button>
      </div>
    );
  }

  const assignee = users.find(u => u.id === ticket.assignedTo);
  const creator = users.find(u => u.id === ticket.createdBy);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/tickets")} data-testid="button-back">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-mono text-muted-foreground" data-testid="text-ticket-code">{ticket.ticketCode}</span>
            {statusIcon(ticket.status)}
            <Badge variant={priorityBadge(ticket.priority)}>{ticket.priority}</Badge>
          </div>
          <h1 className="text-2xl font-bold mt-1" data-testid="text-ticket-title">{ticket.title}</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle>Description</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap" data-testid="text-ticket-description">{ticket.description}</p>
            </CardContent>
          </Card>

          {ticket.resolution && (
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" />Resolution</CardTitle></CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap" data-testid="text-ticket-resolution">{ticket.resolution}</p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><MessageSquare className="h-4 w-4" />Activity Timeline</CardTitle></CardHeader>
            <CardContent>
              {auditLogs.length === 0 ? (
                <p className="text-sm text-muted-foreground">No activity recorded yet.</p>
              ) : (
                <div className="space-y-4">
                  {auditLogs.map((log) => {
                    const actor = users.find(u => u.id === log.userId);
                    const details = log.details as Record<string, unknown> | null;
                    return (
                      <div key={log.id} className="flex gap-3 text-sm" data-testid={`activity-${log.id}`}>
                        <div className="flex flex-col items-center">
                          <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
                          <div className="w-px flex-1 bg-border" />
                        </div>
                        <div className="flex-1 pb-4">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{actor?.name || "System"}</span>
                            <Badge variant="outline" className="text-xs">{log.action}</Badge>
                          </div>
                          {details && (
                            <p className="text-muted-foreground mt-1">
                              {details.status && `Status: ${statusLabel(String(details.status))}`}
                              {details.title && ` — ${details.title}`}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Category:</span>
                <Badge variant="outline">{ticket.category.replace(/_/g, " ")}</Badge>
              </div>
              <Separator />
              <div className="flex items-center gap-2 text-sm">
                <UserIcon className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Assigned to:</span>
                <span>{assignee?.name || "Unassigned"}</span>
              </div>
              <Separator />
              <div className="flex items-center gap-2 text-sm">
                <UserIcon className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Created by:</span>
                <span>{creator?.name || "Unknown"}</span>
              </div>
              <Separator />
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Created:</span>
                <span>{format(new Date(ticket.createdAt), "MMM d, yyyy h:mm a")}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Update Status</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={newStatus || ticket.status} onValueChange={setNewStatus}>
                  <SelectTrigger data-testid="select-ticket-status"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STATUSES.map(s => <SelectItem key={s} value={s}>{statusLabel(s)}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              {(newStatus === "resolved" || (ticket.status === "resolved" && !newStatus)) && (
                <div className="space-y-2">
                  <Label>Resolution Notes</Label>
                  <Textarea data-testid="input-resolution" value={resolution || ticket.resolution || ""} onChange={e => setResolution(e.target.value)} rows={3} placeholder="Describe how the issue was resolved..." />
                </div>
              )}
              <Button
                className="w-full"
                disabled={!newStatus || newStatus === ticket.status || updateMutation.isPending}
                onClick={() => {
                  const payload: { status?: string; resolution?: string } = {};
                  if (newStatus) payload.status = newStatus;
                  if (resolution) payload.resolution = resolution;
                  updateMutation.mutate(payload);
                }}
                data-testid="button-update-status"
              >
                {updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Update Status
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
