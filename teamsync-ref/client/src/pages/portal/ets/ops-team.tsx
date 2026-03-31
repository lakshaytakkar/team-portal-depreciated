import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";
import { mockTeamAssignments, mockOpsClients, TEAM_MEMBERS, OPS_STAGE_LABELS } from "@/lib/mock-data-ops-ets";

export default function EtsOpsTeamPage() {
  const activeClients = mockOpsClients.filter((c) => c.currentStage !== "launched");

  function getAssignment(member: string, clientId: string) {
    return mockTeamAssignments.find(
      (a) => a.teamMember === member && a.clientId === clientId
    );
  }

  return (
    <div className="px-6 lg:px-10 py-6 space-y-5" data-testid="ops-team-page">
      <div>
        <h1 className="text-xl font-bold">Team Assignments</h1>
        <p className="text-sm text-muted-foreground">Matrix view of team members vs active clients. Red cells indicate overdue items.</p>
      </div>

      <div className="flex gap-3 text-xs flex-wrap">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-red-100 border border-red-200 inline-block" />
          Overdue items
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-emerald-50 border border-emerald-200 inline-block" />
          Active responsibility
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-muted/30 border border-transparent inline-block" />
          No assignment
        </span>
      </div>

      <Card className="border-0 shadow-sm overflow-hidden" data-testid="team-matrix-card">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-muted/30 border-b">
                <th className="sticky left-0 bg-muted/40 z-10 text-left py-3 px-4 font-semibold text-sm min-w-[130px]">
                  Team Member
                </th>
                {activeClients.map((client) => (
                  <th key={client.id} className="text-left py-3 px-3 font-medium text-xs min-w-[140px] border-l border-border/50" data-testid={`matrix-client-header-${client.id}`}>
                    <div className="font-semibold">{client.name}</div>
                    <div className="text-muted-foreground font-normal">{client.city}</div>
                    <Badge variant="outline" className="text-[9px] mt-0.5 font-normal border-emerald-200 text-emerald-700">
                      {OPS_STAGE_LABELS[client.currentStage]}
                    </Badge>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TEAM_MEMBERS.map((member, memberIdx) => {
                const totalAssignments = activeClients.filter((c) => getAssignment(member, c.id)).length;
                const overdueCount = activeClients.filter((c) => {
                  const a = getAssignment(member, c.id);
                  return a?.hasOverdueItems;
                }).length;
                return (
                  <tr key={member} className={`border-b last:border-0 ${memberIdx % 2 === 0 ? "" : "bg-muted/10"}`} data-testid={`matrix-row-${member}`}>
                    <td className="sticky left-0 bg-background py-3 px-4 z-10 border-r border-border/50">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-xs font-bold text-emerald-700 shrink-0">
                          {member[0]}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{member}</p>
                          <p className="text-[10px] text-muted-foreground">{totalAssignments} clients{overdueCount > 0 ? ` · ${overdueCount} overdue` : ""}</p>
                        </div>
                      </div>
                    </td>
                    {activeClients.map((client) => {
                      const assignment = getAssignment(member, client.id);
                      return (
                        <td
                          key={client.id}
                          className={`py-3 px-3 border-l border-border/50 align-top ${assignment?.hasOverdueItems ? "bg-red-50" : assignment ? "bg-emerald-50/50" : ""}`}
                          data-testid={`matrix-cell-${member}-${client.id}`}
                        >
                          {assignment ? (
                            <div className="space-y-1">
                              <p className="text-xs font-medium leading-snug">{assignment.responsibility}</p>
                              {assignment.hasOverdueItems && (
                                <div className="flex items-center gap-1 text-[10px] text-red-600">
                                  <AlertTriangle className="w-3 h-3" /> Overdue
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-[10px] text-muted-foreground/40">—</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4" data-testid="team-summary-cards">
        {TEAM_MEMBERS.map((member) => {
          const assignments = mockTeamAssignments.filter((a) => a.teamMember === member);
          const overdueItems = assignments.filter((a) => a.hasOverdueItems);
          return (
            <Card key={member} className="border-0 shadow-sm" data-testid={`team-card-${member}`}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-sm font-bold text-emerald-700">
                    {member[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{member}</p>
                    <p className="text-xs text-muted-foreground">{assignments.length} total assignments</p>
                  </div>
                </div>
                {overdueItems.length > 0 ? (
                  <div className="flex items-center gap-1.5 text-xs text-red-600 mb-2">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>{overdueItems.length} overdue item{overdueItems.length > 1 ? "s" : ""}</span>
                  </div>
                ) : (
                  <p className="text-xs text-emerald-600 mb-2">All on track</p>
                )}
                <div className="space-y-1">
                  {assignments.slice(0, 3).map((a) => {
                    const client = mockOpsClients.find((c) => c.id === a.clientId);
                    return (
                      <div key={`${member}-${a.clientId}`} className="flex items-center justify-between gap-2">
                        <span className="text-xs text-muted-foreground truncate">{client?.name ?? a.clientId}</span>
                        {a.hasOverdueItems && <AlertTriangle className="w-3 h-3 text-red-500 shrink-0" />}
                      </div>
                    );
                  })}
                  {assignments.length > 3 && (
                    <p className="text-[10px] text-muted-foreground">+{assignments.length - 3} more</p>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
