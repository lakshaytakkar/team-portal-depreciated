import { CalendarDays, Users, Briefcase, TrendingUp, MapPin, ArrowRight } from "lucide-react";
import { Link } from "wouter";

import { StatsCardSkeleton } from "@/components/ui/card-skeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ds/status-badge";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  PageShell,
  HeroBanner,
  StatGrid,
  StatCard,
  SectionCard,
  SectionGrid,
} from "@/components/layout";
import { hubEvents, hubVendors } from "@/lib/mock-data-eventhub";
import { PersonCell, CompanyCell } from "@/components/ui/avatar-cells";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { Fade, Stagger, StaggerItem } from "@/components/ui/animated";

const formatCurrency = (val: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(val);

const statusVariantMap: Record<string, "info" | "success" | "neutral" | "error"> = {
  upcoming: "info",
  live: "success",
  completed: "neutral",
  cancelled: "error",
};

const typeColorMap: Record<string, string> = {
  Seminar: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  Workshop: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  Conference: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  "Investor Meet": "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  "Launch Event": "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
  Roundtable: "bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400",
};

export default function HubDashboard() {
  const loading = useSimulatedLoading();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const upcomingEvents = hubEvents.filter((e) => e.status === "upcoming");
  const completedEvents = hubEvents.filter((e) => e.status === "completed");
  const activeVendors = hubVendors.filter((v) => v.status === "active").length;
  const totalAttendees = hubEvents.reduce((sum, e) => sum + e.totalAttendees, 0);
  const totalPlanned = hubEvents.reduce((sum, e) => sum + e.budget, 0);
  const totalActual = hubEvents.reduce((sum, e) => sum + e.actualSpend, 0);
  const budgetUtilized = totalPlanned > 0 ? Math.round((totalActual / totalPlanned) * 100) : 0;

  const now = new Date();
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const thisWeekEvents = hubEvents.filter((e) => {
    const d = new Date(e.date);
    return d >= now && d <= sevenDaysFromNow;
  });

  return (
    <PageShell>
      <HeroBanner
        eyebrow={`${greeting}, Sneha Patel`}
        headline="Event Hub"
        tagline="Internal networking events, vendor coordination & engagement platform"
        color="#7C3AED"
        colorDark="#6025d8"
      />

      {loading ? (
        <StatGrid>
          <StatsCardSkeleton />
          <StatsCardSkeleton />
          <StatsCardSkeleton />
          <StatsCardSkeleton />
        </StatGrid>
      ) : (
        <Stagger staggerInterval={0.05}>
          <StatGrid>
            <StaggerItem>
              <StatCard
                label="Upcoming Events"
                value={upcomingEvents.length}
                trend={`${hubEvents.length} total events`}
                icon={CalendarDays}
                iconBg="rgba(124, 58, 237, 0.1)"
                iconColor="#7C3AED"
              />
            </StaggerItem>
            <StaggerItem>
              <StatCard
                label="Total Attendees"
                value={totalAttendees}
                trend="Across all events"
                icon={Users}
                iconBg="rgba(124, 58, 237, 0.1)"
                iconColor="#7C3AED"
              />
            </StaggerItem>
            <StaggerItem>
              <StatCard
                label="Active Vendors"
                value={activeVendors}
                trend={`${hubVendors.length} total vendors`}
                icon={Briefcase}
                iconBg="rgba(124, 58, 237, 0.1)"
                iconColor="#7C3AED"
              />
            </StaggerItem>
            <StaggerItem>
              <StatCard
                label="Budget Utilized"
                value={`${budgetUtilized}%`}
                trend={`${formatCurrency(totalActual)} of ${formatCurrency(totalPlanned)}`}
                icon={TrendingUp}
                iconBg="rgba(124, 58, 237, 0.1)"
                iconColor="#7C3AED"
              />
            </StaggerItem>
          </StatGrid>
        </Stagger>
      )}

      <SectionGrid>
        {loading ? (
          <div className="rounded-xl border bg-card p-5">
            <Skeleton className="h-5 w-40 mb-4" />
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-lg" />)}
            </div>
          </div>
        ) : (
          <Fade>
            <SectionCard
              title="Upcoming Events"
              viewAllLabel="View all"
              onViewAll={() => {}}
              noPadding
            >
              <div className="space-y-3 p-5 pt-0">
                {upcomingEvents.slice(0, 5).map((event) => (
                  <Link key={event.id} href={`/hub/events/${event.id}`}>
                    <div
                      className="group flex cursor-pointer items-start gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-muted/20"
                      data-testid={`card-event-${event.id}`}
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-900/30">
                        <CalendarDays className="size-5 text-violet-600 dark:text-violet-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="truncate text-sm font-medium text-foreground" data-testid={`text-event-name-${event.id}`}>{event.name}</p>
                          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${typeColorMap[event.type] || ""}`} data-testid={`badge-event-type-${event.id}`}>{event.type}</span>
                        </div>
                        <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><MapPin className="size-3" />{event.venue}, {event.city}</span>
                          <span className="flex items-center gap-1"><Users className="size-3" />{event.totalAttendees}</span>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground" data-testid={`text-event-date-${event.id}`}>
                          {new Date(event.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                      </div>
                      <div className="shrink-0">
                        <StatusBadge status={event.status} variant={statusVariantMap[event.status]} />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </SectionCard>
          </Fade>
        )}

        {loading ? (
          <div className="rounded-xl border bg-card p-5">
            <Skeleton className="h-5 w-32 mb-4" />
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          </div>
        ) : (
          <Fade delay={0.15}>
            <SectionCard title="This Week">
              {thisWeekEvents.length === 0 ? (
                <p className="text-sm text-muted-foreground">No events this week</p>
              ) : (
                <div className="space-y-3">
                  {thisWeekEvents.map((event) => {
                    const diff = Math.ceil((new Date(event.date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                    return (
                      <div key={event.id} className="flex items-center justify-between" data-testid={`row-week-event-${event.id}`}>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{event.name}</p>
                          <p className="text-xs text-muted-foreground">{event.city}</p>
                        </div>
                        <Badge variant="outline" className="shrink-0 text-xs border-violet-300 text-violet-700 dark:text-violet-400">
                          {diff === 0 ? "Today" : `in ${diff}d`}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              )}
            </SectionCard>
          </Fade>
        )}

        {loading ? (
          <div className="rounded-xl border bg-card p-5">
            <Skeleton className="h-5 w-40 mb-4" />
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}
            </div>
          </div>
        ) : (
          <Fade delay={0.1}>
            <SectionCard title="Recently Completed">
              <div className="space-y-3">
                {completedEvents.map((event) => {
                  const rate = event.totalAttendees > 0 ? Math.round((event.checkedIn / event.totalAttendees) * 100) : 0;
                  return (
                    <div key={event.id} className="space-y-1" data-testid={`row-completed-${event.id}`}>
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-foreground">{event.name}</span>
                        <span className="text-muted-foreground text-xs">{event.checkedIn}/{event.totalAttendees} checked in</span>
                      </div>
                      <Progress value={rate} className="h-1.5" />
                    </div>
                  );
                })}
              </div>
            </SectionCard>
          </Fade>
        )}

        {loading ? (
          <div className="rounded-xl border bg-card p-5">
            <Skeleton className="h-5 w-32 mb-4" />
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          </div>
        ) : (
          <Fade delay={0.2}>
            <SectionCard
              title="Vendor Status"
              viewAllLabel="All"
              onViewAll={() => {}}
            >
              <div className="space-y-2">
                {hubVendors.slice(0, 5).map((vendor) => (
                  <div key={vendor.id} className="flex items-center justify-between" data-testid={`row-vendor-${vendor.id}`}>
                    <CompanyCell name={vendor.name} subtitle={vendor.category} size="sm" />
                    <StatusBadge
                      status={vendor.status}
                      variant={vendor.status === "active" ? "success" : vendor.status === "pending" ? "warning" : "neutral"}
                    />
                  </div>
                ))}
              </div>
            </SectionCard>
          </Fade>
        )}

        {loading ? (
          <div className="rounded-xl border bg-card p-5">
            <Skeleton className="h-5 w-32 mb-4" />
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          </div>
        ) : (
          <Fade delay={0.25}>
            <SectionCard title="Organizers">
              <div className="space-y-3">
                {Array.from(new Set(hubEvents.map((e) => e.organizer))).map((organizer) => {
                  const count = hubEvents.filter((e) => e.organizer === organizer).length;
                  return (
                    <div key={organizer} className="flex items-center gap-3" data-testid={`row-organizer-${organizer.replace(/\s+/g, "-").toLowerCase()}`}>
                      <PersonCell name={organizer} subtitle={`${count} event${count !== 1 ? "s" : ""}`} size="sm" />
                    </div>
                  );
                })}
              </div>
            </SectionCard>
          </Fade>
        )}
      </SectionGrid>
    </PageShell>
  );
}
