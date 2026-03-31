import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Activity, Plus, Pencil, Trash2, Eye } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import type { AuditLog, User } from "@shared/schema";

const ENTITY_TYPES = ["contact", "deal", "appointment", "ticket", "user", "lead", "task"];

const actionIcon = (action: string) => {
  switch (action) {
    case "create": return <Plus className="h-3.5 w-3.5 text-green-500" />;
    case "update": return <Pencil className="h-3.5 w-3.5 text-blue-500" />;
    case "delete": return <Trash2 className="h-3.5 w-3.5 text-red-500" />;
    default: return <Eye className="h-3.5 w-3.5 text-muted-foreground" />;
  }
};

const actionBadge = (action: string) => {
  switch (action) {
    case "create": return "default" as const;
    case "update": return "secondary" as const;
    case "delete": return "destructive" as const;
    default: return "outline" as const;
  }
};

export default function AuditLogPage() {
  const [entityFilter, setEntityFilter] = useState("all");
  const [userFilter, setUserFilter] = useState("all");

  const auditUrl = (() => {
    const params = new URLSearchParams();
    if (entityFilter !== "all") params.set("entity_type", entityFilter);
    if (userFilter !== "all") params.set("user_id", userFilter);
    const qs = params.toString();
    return `/api/audit-logs${qs ? `?${qs}` : ""}`;
  })();

  const { data: logs = [], isLoading } = useQuery<AuditLog[]>({
    queryKey: [auditUrl],
  });
  const { data: users = [] } = useQuery<User[]>({ queryKey: ["/api/admin/users"] });

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" data-testid="text-page-title">Audit Logs</h1>
        <p className="text-muted-foreground">Track all system activities and changes</p>
      </div>

      <div className="flex items-center gap-4">
        <Select value={entityFilter} onValueChange={setEntityFilter}>
          <SelectTrigger className="w-[180px]" data-testid="select-entity-filter"><SelectValue placeholder="Entity Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Entities</SelectItem>
            {ENTITY_TYPES.map(t => <SelectItem key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={userFilter} onValueChange={setUserFilter}>
          <SelectTrigger className="w-[180px]" data-testid="select-user-filter"><SelectValue placeholder="User" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Users</SelectItem>
            {users.map(u => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px]"></TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No audit logs found.
                  </TableCell>
                </TableRow>
              ) : (
                logs.map(log => {
                  const user = users.find(u => u.id === log.userId);
                  const details = log.details as Record<string, unknown> | null;
                  return (
                    <TableRow key={log.id} data-testid={`row-audit-${log.id}`}>
                      <TableCell>{actionIcon(log.action)}</TableCell>
                      <TableCell><Badge variant={actionBadge(log.action)}>{log.action}</Badge></TableCell>
                      <TableCell>
                        <div>
                          <span className="font-medium">{log.entityType}</span>
                          {log.entityId && <span className="text-xs text-muted-foreground ml-1">({log.entityId.slice(0, 8)}...)</span>}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{user?.name || log.userId || "-"}</TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                        {details ? Object.entries(details).map(([k, v]) => `${k}: ${v}`).join(", ") : "-"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                        <div title={format(new Date(log.createdAt), "PPpp")}>
                          {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
