import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Search, MapPin, Clock, ChevronRight } from "lucide-react";
import {
  mockOpsClients,
  mockChecklist,
  mockClientChecklistStates,
  OPS_STAGE_LABELS,
} from "@/lib/mock-data-ops-ets";

function daysSince(dateStr: string): number {
  const d = new Date(dateStr);
  const now = new Date("2026-03-26");
  return Math.max(0, Math.floor((now.getTime() - d.getTime()) / 86400000));
}

function fmtDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

const packageColors: Record<string, string> = {
  lite: "bg-blue-100 text-blue-700 border-blue-200",
  pro: "bg-emerald-100 text-emerald-700 border-emerald-200",
  elite: "bg-purple-100 text-purple-700 border-purple-200",
};

export default function EtsOpsClientsPage() {
  const [, navigate] = useLocation();
  const [search, setSearch] = useState("");

  const filtered = mockOpsClients.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.city.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="px-6 lg:px-10 py-6 space-y-5" data-testid="ops-clients-page">
      <div>
        <h1 className="text-xl font-bold">Client Journey</h1>
        <p className="text-sm text-muted-foreground">Select a client to view their full journey details</p>
      </div>
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or city..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
          data-testid="input-client-search"
        />
      </div>
      <div className="space-y-3" data-testid="clients-list">
        {filtered.map((client) => {
          const checklistState = mockClientChecklistStates.find((cs) => cs.clientId === client.id);
          const checklistPct = checklistState
            ? Math.round((checklistState.completedItems.length / mockChecklist.length) * 100)
            : 0;
          return (
            <Card
              key={client.id}
              className="border-0 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate(`/portal-ets/ops/client/${client.id}`)}
              data-testid={`client-row-${client.id}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-sm font-bold text-emerald-700 shrink-0">
                      {client.name[0]}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold" data-testid={`client-name-${client.id}`}>{client.name}</p>
                        <Badge variant="outline" className={`text-[10px] capitalize ${packageColors[client.package]}`}>
                          {client.package}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5 flex-wrap">
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {client.city}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {daysSince(client.tokenPaidDate)}d since token</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <Badge variant="outline" className="text-[10px] border-emerald-200 text-emerald-700 mb-1">
                        {OPS_STAGE_LABELS[client.currentStage]}
                      </Badge>
                      <p className="text-[10px] text-muted-foreground">Launch: {fmtDate(client.estimatedLaunchDate)}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-muted-foreground">Readiness</span>
                    <span className="text-[10px] text-muted-foreground">{checklistPct}%</span>
                  </div>
                  <Progress value={checklistPct} className="h-1.5" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
