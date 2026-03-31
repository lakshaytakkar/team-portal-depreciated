import {
  Users,
  Flame,
  UserCheck,
  Headphones,
  AlertTriangle,
  UserPlus,
  CreditCard,
  Building2,
  GraduationCap,
  TicketCheck,
  LogIn,
  Store,
  TrendingUp,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  PageShell,
  HeroBanner,
  StatCard,
  StatGrid,
  SectionCard,
  SectionGrid,
} from "@/components/layout";
import { StatsCardSkeleton } from "@/components/ui/card-skeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { useLocation } from "wouter";
import {
  externalUsers,
  leads,
  supportTickets,
  pipelineFunnel,
  llcStatusBreakdown,
  stalledClients,
  recentActivityFeed,
} from "@/lib/mock-data-sales";

const activityIcon: Record<string, typeof UserPlus> = {
  signup: UserPlus,
  payment: CreditCard,
  llc_update: Building2,
  course_complete: GraduationCap,
  ticket: TicketCheck,
  login: LogIn,
  store_connect: Store,
};

const activityColor: Record<string, string> = {
  signup: "hsl(var(--chart-1))",
  payment: "hsl(var(--success))",
  llc_update: "hsl(var(--chart-3))",
  course_complete: "hsl(var(--info))",
  ticket: "hsl(var(--destructive))",
  login: "hsl(var(--muted-foreground))",
  store_connect: "hsl(var(--warning))",
};

function formatTimeAgo(timestamp: string): string {
  const now = new Date();
  const date = new Date(timestamp);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

export default function SalesDashboard() {
  const loading = useSimulatedLoading();
  const [, navigate] = useLocation();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const totalUsers = externalUsers.length;
  const hotLeadsToday = leads.filter((l) => l.status === "new" || l.status === "contacted").length;
  const activeClients = externalUsers.filter((u) => u.status === "active" && u.plan !== "free").length;
  const openTickets = supportTickets.filter((t) => t.status === "open" || t.status === "in-progress").length;

  const totalLLC = llcStatusBreakdown.reduce((sum, s) => sum + s.count, 0);

  return (
    <PageShell>
      <HeroBanner
        eyebrow={`${greeting}, Lakshay`}
        headline="USDrop AI Command Center"
        tagline="CEO dashboard — pipeline, clients, LLC tracking & operations at a glance"
        color="#F34147"
        colorDark="#cc2a2f"
        metrics={[
          { label: "Total Users", value: totalUsers },
          { label: "Hot Leads", value: hotLeadsToday },
          { label: "Active Clients", value: activeClients },
        ]}
      />

      {loading ? (
        <StatGrid>
          <StatsCardSkeleton />
          <StatsCardSkeleton />
          <StatsCardSkeleton />
          <StatsCardSkeleton />
        </StatGrid>
      ) : (
        <StatGrid>
          <StatCard
            label="Total Users"
            value={totalUsers}
            trend="Free + Paid accounts"
            icon={Users}
            iconBg="rgba(243, 65, 71, 0.1)"
            iconColor="#F34147"
          />
          <StatCard
            label="Hot Leads Today"
            value={hotLeadsToday}
            trend="New + Contacted"
            icon={Flame}
            iconBg="hsl(var(--warning) / 0.1)"
            iconColor="hsl(var(--warning))"
          />
          <StatCard
            label="Active Clients"
            value={activeClients}
            trend="Paid & active"
            icon={UserCheck}
            iconBg="hsl(var(--success) / 0.1)"
            iconColor="hsl(var(--success))"
          />
          <StatCard
            label="Open Tickets"
            value={openTickets}
            trend={`${supportTickets.length} total`}
            icon={Headphones}
            iconBg="hsl(var(--destructive) / 0.1)"
            iconColor="hsl(var(--destructive))"
          />
        </StatGrid>
      )}

      {loading ? (
        <SectionGrid>
          <Skeleton className="h-[320px] w-full rounded-xl" />
          <Skeleton className="h-[320px] w-full rounded-xl" />
        </SectionGrid>
      ) : (
        <SectionGrid>
          <SectionCard title="Pipeline Funnel">
            <div className="space-y-3 py-2" data-testid="section-pipeline-funnel">
              {pipelineFunnel.map((stage, i) => {
                const maxCount = pipelineFunnel[0].count;
                const widthPct = Math.max((stage.count / maxCount) * 100, 12);
                const dropOff = i > 0
                  ? (((pipelineFunnel[i - 1].count - stage.count) / pipelineFunnel[i - 1].count) * 100).toFixed(1)
                  : null;
                return (
                  <div key={stage.stage} data-testid={`funnel-stage-${stage.stage}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{stage.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">{stage.count.toLocaleString()}</span>
                        {dropOff && (
                          <span className="text-xs text-muted-foreground">
                            -{dropOff}%
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="h-7 rounded-md bg-muted/30 overflow-hidden">
                      <div
                        className="h-full rounded-md transition-all duration-500 flex items-center justify-end pr-2"
                        style={{ width: `${widthPct}%`, backgroundColor: stage.color }}
                      >
                        {widthPct > 20 && (
                          <span className="text-[10px] font-medium text-white">
                            {((stage.count / maxCount) * 100).toFixed(0)}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </SectionCard>

          <SectionCard
            title="LLC Status Breakdown"
            viewAllLabel="View Tracker"
            onViewAll={() => navigate("/usdrop/llc")}
          >
            <div className="space-y-2.5 py-2" data-testid="section-llc-breakdown">
              {llcStatusBreakdown.map((entry) => {
                const pct = ((entry.count / totalLLC) * 100).toFixed(0);
                return (
                  <div
                    key={entry.stage}
                    className="flex items-center gap-3"
                    data-testid={`llc-stage-${entry.stage}`}
                  >
                    <div
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-sm flex-1 min-w-0 truncate">{entry.label}</span>
                    <span className="text-sm font-semibold tabular-nums">{entry.count}</span>
                    <span className="text-xs text-muted-foreground w-10 text-right">{pct}%</span>
                  </div>
                );
              })}
              <div className="pt-2 border-t mt-3 flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Total Applications</span>
                <span className="text-sm font-bold">{totalLLC}</span>
              </div>
            </div>
          </SectionCard>
        </SectionGrid>
      )}

      {loading ? (
        <Skeleton className="h-[300px] w-full rounded-xl" />
      ) : (
        <SectionCard
          title="Stalled Clients"
          viewAllLabel="View All Clients"
          onViewAll={() => navigate("/usdrop/clients")}
        >
          <div className="divide-y -mx-5 -mb-5" data-testid="section-stalled-clients">
            {stalledClients.map((client) => (
              <div
                key={client.id}
                className="flex items-center justify-between gap-3 px-5 py-3 transition-colors hover:bg-muted/20"
                style={{ borderLeft: "3px solid hsl(var(--warning))" }}
                data-testid={`stalled-client-${client.id}`}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="flex items-center justify-center w-8 h-8 rounded-md shrink-0" style={{ backgroundColor: "hsl(var(--warning) / 0.1)" }}>
                    <AlertTriangle className="w-4 h-4" style={{ color: "hsl(var(--warning))" }} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{client.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {client.batch} &middot; Last active: {client.lastActive}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0 flex-wrap">
                  <Badge variant="outline" style={{ color: "hsl(var(--warning))", borderColor: "hsl(var(--warning) / 0.4)" }}>
                    {client.daysSinceActivity}d inactive
                  </Badge>
                  <Badge variant="secondary">{client.llcStage}</Badge>
                  <div className="w-20">
                    <Progress value={client.progress} className="h-1.5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {loading ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Skeleton className="h-[400px] w-full lg:col-span-2 rounded-xl" />
          <Skeleton className="h-[400px] w-full rounded-xl" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <SectionCard title="Recent Activity Feed">
              <div className="divide-y -mx-5 -mb-5" data-testid="section-activity-feed">
                {recentActivityFeed.slice(0, 10).map((activity) => {
                  const Icon = activityIcon[activity.type] || UserPlus;
                  const color = activityColor[activity.type] || "hsl(var(--muted-foreground))";
                  return (
                    <div
                      key={activity.id}
                      className="flex items-start gap-3 px-5 py-3 transition-colors hover:bg-muted/20"
                      data-testid={`activity-item-${activity.id}`}
                    >
                      <div
                        className="flex items-center justify-center w-8 h-8 rounded-md shrink-0 mt-0.5"
                        style={{ backgroundColor: `${color}15`, color }}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">
                          <span className="font-medium">{activity.user}</span>{" "}
                          <span className="text-muted-foreground">{activity.description}</span>
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {formatTimeAgo(activity.timestamp)}
                        </p>
                      </div>
                      {activity.meta && (
                        <Badge variant="secondary" className="shrink-0 mt-0.5">
                          {activity.meta}
                        </Badge>
                      )}
                    </div>
                  );
                })}
              </div>
            </SectionCard>
          </div>

          <SectionCard title="Quick Actions">
            <div className="flex flex-col gap-2">
              <Button variant="outline" className="justify-start" onClick={() => navigate("/usdrop/leads")} data-testid="button-quick-pipeline">
                <Flame className="mr-2 size-4" /> Pipeline & Leads
              </Button>
              <Button variant="outline" className="justify-start" onClick={() => navigate("/usdrop/clients")} data-testid="button-quick-clients">
                <UserCheck className="mr-2 size-4" /> Client Management
              </Button>
              <Button variant="outline" className="justify-start" onClick={() => navigate("/usdrop/llc")} data-testid="button-quick-llc">
                <Building2 className="mr-2 size-4" /> LLC Tracker
              </Button>
              <Button variant="outline" className="justify-start" onClick={() => navigate("/usdrop/products")} data-testid="button-quick-products">
                <Package className="mr-2 size-4" /> Browse Products
              </Button>
              <Button variant="outline" className="justify-start" onClick={() => navigate("/usdrop/users")} data-testid="button-quick-users">
                <Users className="mr-2 size-4" /> Manage Users
              </Button>
              <Button variant="outline" className="justify-start" onClick={() => navigate("/usdrop/tickets")} data-testid="button-quick-tickets">
                <Headphones className="mr-2 size-4" /> Support Tickets
              </Button>
              <Button variant="outline" className="justify-start" onClick={() => navigate("/usdrop/revenue")} data-testid="button-quick-analytics">
                <TrendingUp className="mr-2 size-4" /> Revenue Analytics
              </Button>
            </div>
          </SectionCard>
        </div>
      )}
    </PageShell>
  );
}
