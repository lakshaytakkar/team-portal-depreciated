import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Users,
  AlertTriangle,
  CheckSquare,
  Ticket,
  ChevronRight,
  Calendar,
  Clock,
} from "lucide-react";
import {
  mockOpsClients,
  mockMilestonePayments,
  mockChecklist,
  mockClientChecklistStates,
  mockTickets,
  mockBatches,
  OPS_STAGE_LABELS,
  type OpsClient,
} from "@/lib/mock-data-ops-ets";

function daysSince(dateStr: string): number {
  const d = new Date(dateStr);
  const now = new Date("2026-03-26");
  return Math.max(0, Math.floor((now.getTime() - d.getTime()) / 86400000));
}

function fmtDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function daysUntil(dateStr: string): number {
  const d = new Date(dateStr);
  const now = new Date("2026-03-26");
  return Math.ceil((d.getTime() - now.getTime()) / 86400000);
}

const activeClients = mockOpsClients.filter((c) => c.currentStage !== "launched");

const overdueMilestones = mockMilestonePayments.filter(
  (m) => !m.isPaid && new Date(m.dueDate) < new Date("2026-03-26")
).length;

const overdueChecklistClients = mockClientChecklistStates.filter((cs) => {
  const client = mockOpsClients.find((c) => c.id === cs.clientId);
  if (!client || client.currentStage === "launched") return false;
  const stageIdx = ["token-paid","space-confirmed","design-phase","interior-construction","inventory-ordered","goods-at-warehouse","mrp-tagging","dispatched","store-ready","launched"].indexOf(client.currentStage);
  const expectedPct = Math.round((stageIdx / 9) * 100);
  const actualPct = Math.round((cs.completedItems.length / mockChecklist.length) * 100);
  return actualPct < expectedPct - 20;
}).length;

const openTickets = mockTickets.filter((t) => t.status === "open" || t.status === "in-progress").length;

function urgencyScore(client: OpsClient): number {
  const dtu = daysUntil(client.estimatedLaunchDate);
  const dtsPenalty = dtu < 30 ? (30 - dtu) * 2 : 0;
  const overdueMilestoneCount = mockMilestonePayments.filter(
    (m) => m.clientId === client.id && !m.isPaid && new Date(m.dueDate) < new Date("2026-03-26")
  ).length;
  return dtsPenalty + overdueMilestoneCount * 5;
}

const sortedClients = [...activeClients].sort((a, b) => urgencyScore(b) - urgencyScore(a));

export default function EtsOpsPortal() {
  const [, navigate] = useLocation();

  return (
    <div className="px-6 lg:px-10 py-6 space-y-6" data-testid="ops-portal-dashboard">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-6 text-white shadow-lg">
        <div className="relative z-10">
          <p className="text-sm text-emerald-200 mb-1">Operations Center</p>
          <h1 className="text-2xl font-bold" data-testid="text-ops-title">Client Stage Management</h1>
          <p className="text-sm text-emerald-200 mt-1">Aditya · March 26, 2026</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4" data-testid="ops-kpi-cards">
        <Card className="border-0 shadow-sm" data-testid="kpi-active-clients">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                <Users className="w-4 h-4 text-emerald-600" />
              </div>
              <span className="text-xs text-muted-foreground">Active Clients</span>
            </div>
            <p className="text-2xl font-bold">{activeClients.length}</p>
            <p className="text-xs text-muted-foreground">Not yet launched</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm" data-testid="kpi-overdue-milestones">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                <Calendar className="w-4 h-4 text-red-600" />
              </div>
              <span className="text-xs text-muted-foreground">Overdue Milestones</span>
            </div>
            <p className={`text-2xl font-bold ${overdueMilestones > 0 ? "text-red-600" : ""}`}>{overdueMilestones}</p>
            <p className="text-xs text-muted-foreground">Payments past due</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm" data-testid="kpi-overdue-checklist">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                <CheckSquare className="w-4 h-4 text-amber-600" />
              </div>
              <span className="text-xs text-muted-foreground">Behind on Checklist</span>
            </div>
            <p className={`text-2xl font-bold ${overdueChecklistClients > 0 ? "text-amber-600" : ""}`}>{overdueChecklistClients}</p>
            <p className="text-xs text-muted-foreground">Clients behind schedule</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm" data-testid="kpi-open-tickets">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                <Ticket className="w-4 h-4 text-orange-600" />
              </div>
              <span className="text-xs text-muted-foreground">Open Tickets</span>
            </div>
            <p className={`text-2xl font-bold ${openTickets > 0 ? "text-orange-600" : ""}`}>{openTickets}</p>
            <p className="text-xs text-muted-foreground">Open or in-progress</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-3" data-testid="active-client-list">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-sm">Active Clients — Urgency Sorted</h2>
            <span className="text-xs text-muted-foreground">{sortedClients.length} clients</span>
          </div>
          {sortedClients.map((client) => {
            const checklistState = mockClientChecklistStates.find((cs) => cs.clientId === client.id);
            const checklistPct = checklistState
              ? Math.round((checklistState.completedItems.length / mockChecklist.length) * 100)
              : 0;
            const overdueMs = mockMilestonePayments.filter(
              (m) => m.clientId === client.id && !m.isPaid && new Date(m.dueDate) < new Date("2026-03-26")
            ).length;
            const dtu = daysUntil(client.estimatedLaunchDate);
            const isUrgent = dtu < 14 || overdueMs > 0;

            return (
              <Card
                key={client.id}
                className={`border shadow-sm cursor-pointer hover:shadow-md transition-shadow ${isUrgent ? "border-amber-200 bg-amber-50/30" : "border-transparent"}`}
                onClick={() => navigate(`/portal-ets/ops/client/${client.id}`)}
                data-testid={`client-card-${client.id}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-sm font-bold text-emerald-700 shrink-0">
                        {client.name[0]}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-sm" data-testid={`client-name-${client.id}`}>{client.name}</p>
                          <span className="text-xs text-muted-foreground">{client.city}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <Badge variant="outline" className="text-[10px] border-emerald-200 text-emerald-700">
                            {OPS_STAGE_LABELS[client.currentStage]}
                          </Badge>
                          <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                            <Clock className="w-3 h-3" /> {daysSince(client.tokenPaidDate)}d since token
                          </span>
                          {overdueMs > 0 && (
                            <span className="text-[10px] text-red-600 flex items-center gap-0.5">
                              <AlertTriangle className="w-3 h-3" /> {overdueMs} overdue payment
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-muted-foreground">Launch in</p>
                      <p className={`text-sm font-semibold ${dtu < 14 ? "text-red-600" : dtu < 30 ? "text-amber-600" : "text-foreground"}`}>
                        {dtu < 0 ? `${Math.abs(dtu)}d overdue` : `${dtu}d`}
                      </p>
                      <p className="text-[10px] text-muted-foreground">{fmtDate(client.estimatedLaunchDate)}</p>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] text-muted-foreground">Readiness checklist</span>
                      <span className="text-[10px] text-muted-foreground">{checklistPct}%</span>
                    </div>
                    <Progress value={checklistPct} className="h-1.5" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="space-y-4">
          <h2 className="font-semibold text-sm">Current Batches</h2>
          {mockBatches.map((batch) => {
            const batchClients = mockOpsClients.filter((c) => batch.clientIds.includes(c.id));
            return (
              <Card key={batch.id} className="border-0 shadow-sm" data-testid={`batch-card-${batch.id}`}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold">{batch.name}</CardTitle>
                  <p className="text-xs text-muted-foreground">Target: {fmtDate(batch.targetLaunchDate)}</p>
                </CardHeader>
                <CardContent className="pt-0 space-y-2">
                  <div className="flex items-center gap-2 mb-3">
                    <Progress value={batch.overallProgress} className="flex-1 h-2" />
                    <span className="text-xs font-medium">{batch.overallProgress}%</span>
                  </div>
                  {batchClients.map((c) => (
                    <div key={c.id} className="flex items-center justify-between text-xs" data-testid={`batch-client-${c.id}`}>
                      <span className="font-medium truncate">{c.name}</span>
                      <Badge variant="outline" className="text-[9px] ml-2 border-emerald-200 text-emerald-700 shrink-0">
                        {OPS_STAGE_LABELS[c.currentStage]}
                      </Badge>
                    </div>
                  ))}
                  {batch.blockers.length > 0 && (
                    <div className="mt-3 pt-2 border-t space-y-1">
                      <p className="text-[10px] font-semibold text-red-600 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Blockers
                      </p>
                      {batch.blockers.map((b, i) => (
                        <p key={i} className="text-[10px] text-muted-foreground leading-snug">{b}</p>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}

          <Card className="border-0 shadow-sm" data-testid="card-quick-tickets">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> Open Tickets
                </CardTitle>
                <Button size="sm" variant="ghost" className="text-xs h-7" onClick={() => navigate("/portal-ets/ops/tickets")} data-testid="button-view-all-tickets">
                  View all <ChevronRight className="w-3 h-3 ml-0.5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              {mockTickets.filter((t) => t.status === "open" || t.status === "in-progress").slice(0, 3).map((ticket) => (
                <div
                  key={ticket.id}
                  className="p-2.5 rounded-lg bg-muted/40 cursor-pointer hover:bg-muted/60 transition-colors"
                  onClick={() => navigate("/portal-ets/ops/tickets")}
                  data-testid={`quick-ticket-${ticket.id}`}
                >
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <span className="text-xs font-medium truncate">{ticket.clientName}</span>
                    <Badge
                      variant="outline"
                      className={`text-[9px] shrink-0 ${ticket.priority === "urgent" ? "border-red-200 text-red-700 bg-red-50" : ticket.priority === "high" ? "border-orange-200 text-orange-700 bg-orange-50" : "border-yellow-200 text-yellow-700 bg-yellow-50"}`}
                    >
                      {ticket.priority}
                    </Badge>
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-snug">{ticket.title}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
