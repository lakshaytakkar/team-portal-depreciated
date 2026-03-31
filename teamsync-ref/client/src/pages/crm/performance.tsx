import { useState } from "react";
import { TrendingUp, TrendingDown, Target, Zap, Clock, Award, DollarSign, Activity } from "lucide-react";
import { Fade, Stagger, StaggerItem } from "@/components/ui/animated";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { PersonCell } from "@/components/ui/avatar-cells";
import { teamPerformance, crmDeals, ALL_VERTICALS_IN_CRM } from "@/lib/mock-data-crm";
import { CRM_COLOR } from "@/lib/crm-config";
import {
  PageShell,
  PageHeader,
  IndexToolbar,
  DataTableContainer,
  DataTH,
  DataTD,
  DataTR,
  StatGrid,
  StatCard,
} from "@/components/layout";

function formatINR(v: number) {
  if (v >= 10000000) return `₹${(v / 10000000).toFixed(1)}Cr`;
  if (v >= 100000) return `₹${(v / 100000).toFixed(1)}L`;
  return `₹${(v / 1000).toFixed(0)}K`;
}

const auditFeed = [
  { text: "Arjun Nair closed deal ₹12,50,000 with China Trade Link", time: "Feb 24 · GoyoTours", avatar: "Arjun Nair", type: "win" },
  { text: "Priya Menon closed LegalConsult India deal ₹6,80,000", time: "Feb 10 · LegalNations", avatar: "Priya Menon", type: "win" },
  { text: "Rahul Verma won LBM Lifestyle wholesale deal ₹7,50,000", time: "Jan 30 · LBM Lifestyle", avatar: "Rahul Verma", type: "win" },
  { text: "Arjun Nair won FaireDesk Premium deal ($18,000)", time: "Feb 15 · FaireDesk", avatar: "Arjun Nair", type: "win" },
  { text: "Sneha Reddy closed BrightBridge Commerce negotiation", time: "Feb 26 · USDrop AI", avatar: "Sneha Reddy", type: "progress" },
  { text: "Team hit 78% of February monthly revenue target", time: "Feb 28 · All Verticals", avatar: "Rahul Verma", type: "milestone" },
  { text: "Rahul Verma — top activities in HR vertical this month (71 completed)", time: "Feb 28 · LegalNations", avatar: "Rahul Verma", type: "milestone" },
  { text: "Deepa Iyer — highest win rate in team this quarter (75%)", time: "Feb 28 · FaireDesk", avatar: "Deepa Iyer", type: "milestone" },
  { text: "Fatima Khan enrolled in sales training program", time: "Mar 1 · ATS", avatar: "Fatima Khan", type: "progress" },
  { text: "Sneha Reddy lost EazyToSell Multi-Store deal — budget constraints", time: "Feb 5 · EazyToSell", avatar: "Sneha Reddy", type: "loss" },
];

const kpiCards = [
  {
    label: "Total Leads Generated",
    value: teamPerformance.reduce((s, r) => s + r.leadsAssigned, 0).toString(),
    icon: TrendingUp,
    color: "text-blue-600",
    bg: "bg-blue-50 dark:bg-blue-950",
    trend: "+12%",
    up: true,
  },
  {
    label: "Avg Response Time",
    value: `${(teamPerformance.reduce((s, r) => s + r.responseTime, 0) / teamPerformance.length).toFixed(1)}h`,
    icon: Clock,
    color: "text-amber-600",
    bg: "bg-amber-50 dark:bg-amber-950",
    trend: "-0.4h",
    up: true,
  },
  {
    label: "Activities Completed",
    value: teamPerformance.reduce((s, r) => s + r.activitiesCompleted, 0).toString(),
    icon: Activity,
    color: "text-violet-600",
    bg: "bg-violet-50 dark:bg-violet-950",
    trend: "+18%",
    up: true,
  },
  {
    label: "Avg Deal Size",
    value: formatINR(Math.round(teamPerformance.filter(r => r.avgDealSize > 0).reduce((s, r) => s + r.avgDealSize, 0) / teamPerformance.filter(r => r.avgDealSize > 0).length)),
    icon: DollarSign,
    color: "text-emerald-600",
    bg: "bg-emerald-50 dark:bg-emerald-950",
    trend: "+8%",
    up: true,
  },
  {
    label: "Pipeline Created",
    value: formatINR(crmDeals.filter(d => !["won", "lost"].includes(d.stage)).reduce((s, d) => s + (d.currency === "INR" ? d.value : d.value * 83), 0)),
    icon: Target,
    color: "text-sky-600",
    bg: "bg-sky-50 dark:bg-sky-950",
    trend: "+24%",
    up: true,
  },
  {
    label: "Conversion Rate",
    value: `${Math.round((teamPerformance.reduce((s, r) => s + r.leadsConverted, 0) / teamPerformance.reduce((s, r) => s + r.leadsAssigned, 0)) * 100)}%`,
    icon: Zap,
    color: "text-orange-600",
    bg: "bg-orange-50 dark:bg-orange-950",
    trend: "+3%",
    up: true,
  },
  {
    label: "Revenue Closed",
    value: formatINR(teamPerformance.reduce((s, r) => s + r.revenue, 0)),
    icon: Award,
    color: "text-emerald-600",
    bg: "bg-emerald-50 dark:bg-emerald-950",
    trend: "+31%",
    up: true,
  },
  {
    label: "Deals In Progress",
    value: crmDeals.filter(d => !["won", "lost"].includes(d.stage)).length.toString(),
    icon: TrendingUp,
    color: "text-blue-600",
    bg: "bg-blue-50 dark:bg-blue-950",
    trend: "-2",
    up: false,
  },
];

export default function CrmPerformance() {
  const isLoading = useSimulatedLoading(700);
  const [verticalFilter, setVerticalFilter] = useState("all");
  const [period, setPeriod] = useState("this-month");
  const [expandedRep, setExpandedRep] = useState<string | null>(null);

  const filtered = teamPerformance.filter(r => {
    if (verticalFilter !== "all" && r.vertical !== verticalFilter) return false;
    return true;
  }).sort((a, b) => a.rank - b.rank);

  const rankMedal = (rank: number) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return `#${rank}`;
  };

  const getVertical = (id: string) => ALL_VERTICALS_IN_CRM.find(v => v.id === id);

  if (isLoading) {
    return (
      <PageShell>
        <div className="h-10 bg-muted rounded w-48 animate-pulse" />
        <StatGrid>
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-muted rounded-xl animate-pulse" />
          ))}
        </StatGrid>
        <div className="h-80 bg-muted rounded-xl animate-pulse" />
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
        <PageHeader
          title="Team Performance"
          actions={
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="h-9 w-44 bg-muted/30" data-testid="select-period">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="this-month">This Month</SelectItem>
                <SelectItem value="last-month">Last Month</SelectItem>
                <SelectItem value="this-quarter">This Quarter</SelectItem>
                <SelectItem value="last-quarter">Last Quarter</SelectItem>
              </SelectContent>
            </Select>
          }
        />

        <IndexToolbar
          search=""
          onSearch={() => {}}
          color={CRM_COLOR}
          filters={verticalOptions}
          activeFilter={verticalFilter}
          onFilter={setVerticalFilter}
        />
      </Fade>

      <StatGrid>
        {kpiCards.map((kpi) => (
          <StatCard
            key={kpi.label}
            label={kpi.label}
            value={kpi.value}
            icon={kpi.icon}
            iconBg={kpi.bg}
            iconColor={kpi.color}
            trend={`${kpi.trend} vs last period`}
          />
        ))}
      </StatGrid>

      <Fade>
        <DataTableContainer>
          <div className="px-5 py-3.5 border-b bg-card">
            <h3 className="text-sm font-semibold">Sales Leaderboard</h3>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <DataTH>Rank</DataTH>
                <DataTH>Rep</DataTH>
                <DataTH>Vertical</DataTH>
                <DataTH>Leads</DataTH>
                <DataTH>Converted</DataTH>
                <DataTH>Deals Won</DataTH>
                <DataTH>Revenue</DataTH>
                <DataTH>Win Rate</DataTH>
                <DataTH>vs Target</DataTH>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((rep) => {
                const vert = getVertical(rep.vertical);
                const pct = Math.min(
                  Math.round((rep.achieved / rep.target) * 100),
                  100
                );
                const winColor =
                  rep.winRate >= 60
                    ? "text-emerald-600"
                    : rep.winRate >= 30
                    ? "text-amber-600"
                    : "text-red-500";
                const isExpanded = expandedRep === rep.id;
                return (
                  <>
                    <DataTR
                      key={rep.id}
                      onClick={() => setExpandedRep(isExpanded ? null : rep.id)}
                      data-testid={`rep-row-${rep.id}`}
                    >
                      <DataTD>
                        <span
                          className={`text-lg font-bold ${
                            rep.rank <= 3 ? "" : "text-muted-foreground text-sm"
                          }`}
                        >
                          {rankMedal(rep.rank)}
                        </span>
                      </DataTD>
                      <DataTD>
                        <PersonCell name={rep.name} subtitle={rep.role} />
                      </DataTD>
                      <DataTD>
                        {vert && (
                          <span
                            className="text-xs px-2 py-0.5 rounded-full text-white font-medium"
                            style={{ backgroundColor: vert.color }}
                          >
                            {vert.name}
                          </span>
                        )}
                      </DataTD>
                      <DataTD>{rep.leadsAssigned}</DataTD>
                      <DataTD>{rep.leadsConverted}</DataTD>
                      <DataTD className="font-medium">{rep.dealsWon}</DataTD>
                      <DataTD className="font-bold">{formatINR(rep.revenue)}</DataTD>
                      <DataTD>
                        <span className={`font-bold ${winColor}`}>
                          {rep.winRate}%
                        </span>
                      </DataTD>
                      <DataTD>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">{pct}%</span>
                          </div>
                          <div className="w-24 bg-muted rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                pct >= 80
                                  ? "bg-emerald-500"
                                  : pct >= 50
                                  ? "bg-amber-400"
                                  : "bg-red-400"
                              }`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {formatINR(rep.achieved)} / {formatINR(rep.target)}
                          </p>
                        </div>
                      </DataTD>
                    </DataTR>
                    {isExpanded && (
                      <tr key={`${rep.id}-exp`}>
                        <td colSpan={9} className="bg-muted/30 px-8 py-4 text-sm">
                          <div className="grid grid-cols-3 gap-6">
                            <div>
                              <p className="text-xs font-medium text-muted-foreground mb-2">
                                Activity Breakdown
                              </p>
                              <div className="space-y-1.5">
                                <div className="flex justify-between">
                                  <span>Activities Done</span>
                                  <span className="font-medium">
                                    {rep.activitiesCompleted}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Avg Response</span>
                                  <span className="font-medium">
                                    {rep.responseTime}h
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Deals Lost</span>
                                  <span className="font-medium text-red-500">
                                    {rep.dealsLost}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div>
                              <p className="text-xs font-medium text-muted-foreground mb-2">
                                Notable Events
                              </p>
                              <div className="space-y-1.5">
                                {rep.auditEvents.map((e, i) => (
                                  <p
                                    key={i}
                                    className="text-xs text-muted-foreground"
                                  >
                                    · {e}
                                  </p>
                                ))}
                              </div>
                            </div>
                            <div>
                              <p className="text-xs font-medium text-muted-foreground mb-2">
                                Monthly Trend
                              </p>
                              <div className="flex items-end gap-1 h-14">
                                {[40, 55, 35, 70, 60, 80, pct].map((h, i) => (
                                  <div
                                    key={i}
                                    className="flex-1 rounded-sm bg-blue-200 dark:bg-blue-800"
                                    style={{ height: `${h}%` }}
                                  />
                                ))}
                              </div>
                              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                                <span>Aug</span>
                                <span>Feb</span>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </DataTableContainer>
      </Fade>

      <Fade>
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3 px-5 py-3.5 border-b">
            <CardTitle className="text-sm font-semibold">Audit Trail — Recent Significant Events</CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            <div className="space-y-3">
              {auditFeed.map((entry, i) => {
                const dotColor = entry.type === "win" ? "bg-emerald-500" : entry.type === "loss" ? "bg-red-400" : "bg-blue-400";
                return (
                  <div key={i} className="flex items-start gap-3" data-testid={`audit-entry-${i}`}>
                    <PersonCell name={entry.avatar} size="sm" className="shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">{entry.text}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <div className={`size-1.5 rounded-full ${dotColor}`} />
                        <p className="text-xs text-muted-foreground">{entry.time}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </Fade>
    </PageShell>
  );
}
