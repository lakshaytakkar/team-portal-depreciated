import { TrendingUp, Users, CalendarCheck, IndianRupee, Star } from "lucide-react";

import { StatsCard } from "@/components/ds/stats-card";
import { StatsCardSkeleton } from "@/components/ui/card-skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { StatusBadge } from "@/components/ds/status-badge";
import { hubEvents, hubAttendees, hubVendors, hubBudgetItems } from "@/lib/mock-data-eventhub";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { PageTransition, Stagger, StaggerItem, Fade } from "@/components/ui/animated";
import { Skeleton } from "@/components/ui/skeleton";
import { PageShell } from "@/components/layout";

const formatCurrency = (val: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(val);

const eventTypes = ["Seminar", "Workshop", "Conference", "Investor Meet", "Launch Event", "Roundtable"] as const;

const typeColorMap: Record<string, string> = {
  Seminar: "bg-blue-500",
  Workshop: "bg-amber-500",
  Conference: "bg-purple-500",
  "Investor Meet": "bg-green-500",
  "Launch Event": "bg-pink-500",
  Roundtable: "bg-slate-500",
};

const statusVariantMap: Record<string, "info" | "success" | "neutral" | "error"> = {
  upcoming: "info",
  live: "success",
  completed: "neutral",
  cancelled: "error",
};

export default function HubAnalytics() {
  const loading = useSimulatedLoading();

  const completedEvents = hubEvents.filter((e) => e.status === "completed");
  const totalEventsRun = completedEvents.length;
  const totalAttendees = hubEvents.reduce((s, e) => s + e.totalAttendees, 0);
  const totalCheckedIn = hubEvents.reduce((s, e) => s + e.checkedIn, 0);
  const avgCheckinRate = totalAttendees > 0 ? Math.round((totalCheckedIn / totalAttendees) * 100) : 0;
  const totalBudgetAllocated = hubEvents.reduce((s, e) => s + e.budget, 0);
  const totalActualSpend = hubEvents.reduce((s, e) => s + e.actualSpend, 0);

  const typeDistribution = eventTypes.map((type) => {
    const count = hubEvents.filter((e) => e.type === type).length;
    return { type, count };
  }).filter((t) => t.count > 0);
  const maxTypeCount = Math.max(...typeDistribution.map((t) => t.count));

  const budgetCategories = ["Venue", "Catering", "AV & Tech", "Marketing", "Transport", "Decoration", "Miscellaneous"];
  const categoryBudgets = budgetCategories.map((cat) => {
    const items = hubBudgetItems.filter((b) => b.category === cat);
    return {
      category: cat,
      planned: items.reduce((s, b) => s + b.plannedAmount, 0),
      actual: items.reduce((s, b) => s + b.actualAmount, 0),
    };
  }).filter((c) => c.planned > 0);
  const maxCatBudget = Math.max(...categoryBudgets.map((c) => c.planned));

  const vendorsByEvents = [...hubVendors]
    .sort((a, b) => b.eventsAssigned.length - a.eventsAssigned.length)
    .slice(0, 5);

  const sourceDistribution = ["Direct", "Referral", "LinkedIn", "Email Campaign"].map((source) => {
    const count = hubAttendees.filter((a) => a.source === source).length;
    return { source, count };
  });

  return (
    <PageShell>
      <PageTransition>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground" data-testid="hub-analytics-title">Analytics</h1>
          <p className="text-sm text-muted-foreground">Performance overview across all networking events</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatsCardSkeleton /><StatsCardSkeleton /><StatsCardSkeleton /><StatsCardSkeleton />
          </div>
        ) : (
          <Stagger staggerInterval={0.05} className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StaggerItem>
              <StatsCard
                title="Events Completed"
                value={totalEventsRun}
                change={`${hubEvents.length} total events`}
                changeType="neutral"
                icon={<CalendarCheck className="size-5" />}
                sparkline={{ values: [1, 2, 2, 3, 3, 4, 4], color: "#7C3AED" }}
              />
            </StaggerItem>
            <StaggerItem>
              <StatsCard
                title="Total Attendees"
                value={totalAttendees}
                change="Across all events"
                changeType="positive"
                icon={<Users className="size-5" />}
                sparkline={{ values: [45, 150, 300, 420, 500, 560, 609], color: "#7C3AED" }}
              />
            </StaggerItem>
            <StaggerItem>
              <StatsCard
                title="Avg Check-in Rate"
                value={`${avgCheckinRate}%`}
                change="From completed events"
                changeType="positive"
                icon={<TrendingUp className="size-5" />}
                sparkline={{ values: [80, 90, 85, 92, 95, 96, avgCheckinRate], color: "#7C3AED" }}
              />
            </StaggerItem>
            <StaggerItem>
              <StatsCard
                title="Budget Allocated"
                value={formatCurrency(totalBudgetAllocated)}
                change={`${formatCurrency(totalActualSpend)} spent`}
                changeType="neutral"
                icon={<IndianRupee className="size-5" />}
                sparkline={{ values: [0, 800000, 1600000, 2400000, 3200000, 4000000, totalBudgetAllocated], color: "#7C3AED" }}
              />
            </StaggerItem>
          </Stagger>
        )}

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {loading ? (
            <>
              <Card><CardHeader><Skeleton className="h-5 w-40" /></CardHeader><CardContent className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}</CardContent></Card>
              <Card><CardHeader><Skeleton className="h-5 w-40" /></CardHeader><CardContent className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}</CardContent></Card>
            </>
          ) : (
            <>
              <Fade>
                <Card data-testid="card-type-distribution">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold">Attendance by Event Type</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {typeDistribution.map((t) => (
                      <div key={t.type} data-testid={`row-type-${t.type.replace(/\s+/g, "-").toLowerCase()}`}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-foreground">{t.type}</span>
                          <span className="text-xs text-muted-foreground">{t.count} event{t.count !== 1 ? "s" : ""}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                            <div
                              className={`h-full rounded-full ${typeColorMap[t.type] || "bg-violet-500"}`}
                              style={{ width: `${(t.count / maxTypeCount) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </Fade>

              <Fade delay={0.05}>
                <Card data-testid="card-source-distribution">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold">Attendee Source Mix</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {sourceDistribution.map((s) => {
                      const rate = hubAttendees.length > 0 ? Math.round((s.count / hubAttendees.length) * 100) : 0;
                      return (
                        <div key={s.source} data-testid={`row-source-${s.source.replace(/\s+/g, "-").toLowerCase()}`}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-foreground">{s.source}</span>
                            <span className="text-xs text-muted-foreground">{s.count} ({rate}%)</span>
                          </div>
                          <Progress value={rate} className="h-2" />
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              </Fade>

              <Fade delay={0.1}>
                <Card data-testid="card-event-performance">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold">Event Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border text-left">
                            <th className="pb-2 pr-3 text-xs font-medium text-muted-foreground">Event</th>
                            <th className="pb-2 pr-3 text-xs font-medium text-muted-foreground">Type</th>
                            <th className="pb-2 pr-3 text-xs font-medium text-muted-foreground text-right">Attendees</th>
                            <th className="pb-2 pr-3 text-xs font-medium text-muted-foreground text-right">Check-in %</th>
                            <th className="pb-2 text-xs font-medium text-muted-foreground">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {completedEvents.map((event) => {
                            const rate = event.totalAttendees > 0
                              ? Math.round((event.checkedIn / event.totalAttendees) * 100)
                              : 0;
                            return (
                              <tr key={event.id} data-testid={`row-perf-${event.id}`}>
                                <td className="py-2 pr-3 font-medium text-foreground text-xs max-w-[130px] truncate">{event.name}</td>
                                <td className="py-2 pr-3">
                                  <Badge variant="outline" className="text-xs">{event.type}</Badge>
                                </td>
                                <td className="py-2 pr-3 text-right text-xs">{event.totalAttendees}</td>
                                <td className="py-2 pr-3 text-right text-xs font-medium">{rate}%</td>
                                <td className="py-2">
                                  <StatusBadge status={event.status} variant={statusVariantMap[event.status]} />
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </Fade>

              <Fade delay={0.15}>
                <Card data-testid="card-top-vendors">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold">Top Vendors by Events</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {vendorsByEvents.map((vendor, idx) => (
                      <div key={vendor.id} className="flex items-center gap-3" data-testid={`row-vendor-${vendor.id}`}>
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet-100 dark:bg-violet-900/30 text-xs font-bold text-violet-700 dark:text-violet-400">
                          {idx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{vendor.name}</p>
                          <p className="text-xs text-muted-foreground">{vendor.category}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-bold text-violet-600">{vendor.eventsAssigned.length}</p>
                          <p className="text-xs text-muted-foreground">events</p>
                        </div>
                        <div className="flex items-center gap-0.5 shrink-0">
                          <Star className="size-3 fill-amber-400 text-amber-400" />
                          <span className="text-xs text-muted-foreground">{vendor.rating}</span>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </Fade>
            </>
          )}
        </div>

        {!loading && (
          <Fade delay={0.2}>
            <Card className="mt-6" data-testid="card-budget-by-category">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Budget by Category</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {categoryBudgets.map((cat) => {
                  const isOver = cat.actual > cat.planned && cat.actual > 0;
                  const usage = cat.planned > 0 ? Math.min(Math.round((cat.actual / cat.planned) * 100), 100) : 0;
                  return (
                    <div key={cat.category} data-testid={`row-budget-cat-${cat.category.replace(/\s+/g, "-").toLowerCase()}`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-foreground">{cat.category}</span>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span>Planned: {formatCurrency(cat.planned)}</span>
                          {cat.actual > 0 && (
                            <span className={isOver ? "text-red-600 font-medium" : "text-green-600 font-medium"}>
                              Actual: {formatCurrency(cat.actual)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="relative h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className={`absolute left-0 top-0 h-full rounded-full transition-all ${isOver ? "bg-red-500" : "bg-green-500"}`}
                          style={{ width: `${(cat.planned / maxCatBudget) * 100}%`, opacity: 0.3 }}
                        />
                        {cat.actual > 0 && (
                          <div
                            className={`absolute left-0 top-0 h-full rounded-full transition-all ${isOver ? "bg-red-500" : "bg-green-500"}`}
                            style={{ width: `${(Math.min(cat.actual, cat.planned) / maxCatBudget) * 100}%` }}
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </Fade>
        )}
      </PageTransition>
    </PageShell>
  );
}
