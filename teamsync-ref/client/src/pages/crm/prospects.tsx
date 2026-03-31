import { useState } from "react";
import { ArrowUpRight, Plus, Activity, Calendar } from "lucide-react";
import { Fade, Stagger, StaggerItem } from "@/components/ui/animated";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { PersonCell } from "@/components/ui/avatar-cells";
import { crmContacts, crmDeals, ALL_VERTICALS_IN_CRM } from "@/lib/mock-data-crm";
import { CRM_COLOR } from "@/lib/crm-config";
import {
  PageShell,
  PageHeader,
  IndexToolbar,
} from "@/components/layout";

const REPS = Array.from(new Set(crmContacts.map(c => c.assignedTo))).sort();

function formatINR(v: number) {
  if (v >= 100000) return `₹${(v / 100000).toFixed(1)}L`;
  return `₹${(v / 1000).toFixed(0)}K`;
}

function NurtureBar({ score }: { score: number }) {
  const color = score >= 70 ? "bg-emerald-500" : score >= 40 ? "bg-amber-400" : "bg-red-400";
  const textColor = score >= 70 ? "text-emerald-600" : score >= 40 ? "text-amber-600" : "text-red-600";
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">Nurture Score</span>
        <span className={`text-xs font-bold ${textColor}`}>{score}%</span>
      </div>
      <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

export default function CrmProspects() {
  const isLoading = useSimulatedLoading(600);
  const [verticalFilter, setVerticalFilter] = useState("all");
  const [repFilter, setRepFilter] = useState("all");
  const [sort, setSort] = useState("nurture");
  const [search, setSearch] = useState("");

  const prospects = crmContacts.filter(c => c.status === "prospect");

  const filtered = prospects.filter(c => {
    if (verticalFilter !== "all" && c.vertical !== verticalFilter) return false;
    if (repFilter !== "all" && c.assignedTo !== repFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!c.name.toLowerCase().includes(q) && !c.company.toLowerCase().includes(q)) return false;
    }
    return true;
  }).sort((a, b) => {
    if (sort === "nurture") return b.nurtureScore - a.nurtureScore;
    if (sort === "contact") return b.lastActivity.localeCompare(a.lastActivity);
    if (sort === "value") return (b.expectedValue ?? 0) - (a.expectedValue ?? 0);
    return 0;
  });

  const getVertical = (id: string) => ALL_VERTICALS_IN_CRM.find(v => v.id === id);
  const getLinkedDeal = (contactId: string) => crmDeals.find(d => d.contactId === contactId && !["won", "lost"].includes(d.stage));

  if (isLoading) {
    return (
      <PageShell>
        <div className="h-10 bg-muted rounded w-52 animate-pulse" />
        <div className="h-10 bg-muted rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-52 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      </PageShell>
    );
  }

  const verticalOptions = [
    { value: "all", label: "All Verticals" },
    ...ALL_VERTICALS_IN_CRM.map((v) => ({ value: v.id, label: v.name })),
  ];

  return (
    <PageShell>
      <Fade>
        <PageHeader title="Prospects" subtitle={`${filtered.length} qualified prospects`} />

        <IndexToolbar
          search={search}
          onSearch={setSearch}
          placeholder="Search prospects..."
          color={CRM_COLOR}
          filters={verticalOptions}
          activeFilter={verticalFilter}
          onFilter={setVerticalFilter}
          primaryAction={{
            label: "Convert to Deal",
            onClick: () => {},
          }}
          extra={
            <div className="flex items-center gap-2">
              <Select value={repFilter} onValueChange={setRepFilter}>
                <SelectTrigger className="h-9 w-44 bg-muted/30" data-testid="select-assignee">
                  <SelectValue placeholder="Assigned To" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Reps</SelectItem>
                  {REPS.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={sort} onValueChange={setSort}>
                <SelectTrigger className="h-9 w-44 bg-muted/30" data-testid="select-sort">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nurture">Nurture Score</SelectItem>
                  <SelectItem value="contact">Last Contact</SelectItem>
                  <SelectItem value="value">Expected Value</SelectItem>
                </SelectContent>
              </Select>
            </div>
          }
        />
      </Fade>

      <Stagger className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(c => {
          const vert = getVertical(c.vertical);
          const deal = getLinkedDeal(c.id);
          return (
            <StaggerItem key={c.id}>
              <Card className="border-0 shadow-sm hover:shadow-md transition-shadow" data-testid={`prospect-card-${c.id}`}>
                <CardContent className="p-5 space-y-4">
                  <PersonCell name={c.name} subtitle={`${c.designation} · ${c.company}`} size="lg" />

                  <div className="flex items-center gap-2 flex-wrap">
                    {vert && (
                      <span className="text-xs px-2 py-0.5 rounded-full text-white font-medium" style={{ backgroundColor: vert.color }}>
                        {vert.name}
                      </span>
                    )}
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 capitalize">
                      via {c.source.replace("-", " ")}
                    </span>
                  </div>

                  <NurtureBar score={c.nurtureScore} />

                  {c.nextAction && (
                    <div className="flex items-start gap-2">
                      <ArrowUpRight className="size-3.5 text-blue-500 mt-0.5 shrink-0" />
                      <p className="text-xs text-blue-600">{c.nextAction}</p>
                    </div>
                  )}

                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="size-3" />
                      <span>Last: {c.lastActivity}</span>
                    </div>
                    {deal && (
                      <div className="flex items-center gap-1 text-emerald-600">
                        <span className="font-medium">
                          {deal.currency === "INR" ? formatINR(deal.value) : `$${(deal.value / 1000).toFixed(0)}K`}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 pt-1 border-t">
                    <Button variant="outline" size="sm" className="flex-1 h-8 text-xs rounded-lg gap-1.5" data-testid={`btn-log-activity-${c.id}`}>
                      <Activity className="size-3" /> Log Activity
                    </Button>
                    <Button size="sm" className="flex-1 h-8 text-xs rounded-lg text-white" style={{ backgroundColor: CRM_COLOR }} data-testid={`btn-create-deal-${c.id}`}>
                      Create Deal
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </StaggerItem>
          );
        })}
        {filtered.length === 0 && (
          <div className="col-span-3 py-20 text-center text-muted-foreground text-sm">
            No prospects match the current filters.
          </div>
        )}
      </Stagger>
    </PageShell>
  );
}
