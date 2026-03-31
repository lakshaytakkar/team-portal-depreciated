import { Users, UserPlus, UserMinus, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { StatsCard } from "@/components/ds/stats-card";
import { StatsCardSkeleton } from "@/components/ui/card-skeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { externalUsers, leads, subscriptions, revenueMetrics } from "@/lib/mock-data-sales";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { Fade, Stagger, StaggerItem, PageTransition } from "@/components/ui/animated";
import { PageShell } from "@/components/layout";

export default function UserAnalyticsPage() {
  const loading = useSimulatedLoading();

  const totalUsers = externalUsers.length;
  const activeUsers = externalUsers.filter((u) => u.status === "active").length;
  const trialUsers = externalUsers.filter((u) => u.status === "trial").length;
  const churnedUsers = externalUsers.filter((u) => u.status === "churned").length;
  const churnRate = Math.round((churnedUsers / totalUsers) * 100);

  const planDistribution = [
    { plan: "Free", count: externalUsers.filter((u) => u.plan === "free").length, color: "#94a3b8" },
    { plan: "Starter", count: externalUsers.filter((u) => u.plan === "starter").length, color: "#6366f1" },
    { plan: "Pro", count: externalUsers.filter((u) => u.plan === "pro").length, color: "#10b981" },
    { plan: "Enterprise", count: externalUsers.filter((u) => u.plan === "enterprise").length, color: "#f59e0b" },
  ];

  const sourceDistribution = [
    { source: "Website", count: leads.filter((l) => l.source === "website").length },
    { source: "Referral", count: leads.filter((l) => l.source === "referral").length },
    { source: "Ads", count: leads.filter((l) => l.source === "ad").length },
    { source: "Organic", count: leads.filter((l) => l.source === "organic").length },
  ];
  const maxSourceCount = Math.max(...sourceDistribution.map((s) => s.count));

  const topUsers = [...externalUsers].sort((a, b) => b.revenue - a.revenue).slice(0, 5);

  return (
    <PageShell>
      <PageTransition>
        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
          </div>
        ) : (
          <Stagger staggerInterval={0.05} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StaggerItem>
              <StatsCard
                title="Total Users"
                value={totalUsers}
                change={`${activeUsers} active`}
                changeType="neutral"
                icon={<Users className="size-5" />}
                sparkline={{ values: revenueMetrics.map((m) => m.newSubscriptions), color: "#6366f1" }}
              />
            </StaggerItem>
            <StaggerItem>
              <StatsCard
                title="New Signups (6mo)"
                value={revenueMetrics.reduce((s, m) => s + m.newSubscriptions, 0)}
                change="+22% growth"
                changeType="positive"
                icon={<UserPlus className="size-5" />}
                sparkline={{ values: revenueMetrics.map((m) => m.newSubscriptions), color: "#10b981" }}
              />
            </StaggerItem>
            <StaggerItem>
              <StatsCard
                title="Trial Users"
                value={trialUsers}
                change="Converting soon"
                changeType="warning"
                icon={<TrendingUp className="size-5" />}
              />
            </StaggerItem>
            <StaggerItem>
              <StatsCard
                title="Churn Rate"
                value={`${churnRate}%`}
                change={`${churnedUsers} churned users`}
                changeType="negative"
                icon={<UserMinus className="size-5" />}
                sparkline={{ values: revenueMetrics.map((m) => m.churn), color: "#ef4444" }}
              />
            </StaggerItem>
          </Stagger>
        )}

        {loading ? (
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-lg border bg-background p-5">
              <Skeleton className="h-4 w-1/3 mb-4" />
              <Skeleton className="h-48 w-full" />
            </div>
            <div className="rounded-lg border bg-background p-5">
              <Skeleton className="h-4 w-1/3 mb-4" />
              <Skeleton className="h-48 w-full" />
            </div>
          </div>
        ) : (
          <Fade direction="up" delay={0.15} className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-lg border bg-background" data-testid="section-plan-distribution">
              <div className="border-b px-5 py-4">
                <h3 className="text-base font-semibold font-heading">Users by Plan</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Distribution across subscription tiers</p>
              </div>
              <div className="p-5">
                <div className="flex flex-col gap-4">
                  {planDistribution.map((item) => {
                    const percentage = Math.round((item.count / totalUsers) * 100);
                    return (
                      <div key={item.plan} className="flex items-center gap-3" data-testid={`row-plan-${item.plan.toLowerCase()}`}>
                        <div className="size-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                        <span className="text-sm font-medium w-20">{item.plan}</span>
                        <div className="flex-1">
                          <div className="h-2 overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{ width: `${percentage}%`, backgroundColor: item.color }}
                            />
                          </div>
                        </div>
                        <span className="text-sm font-semibold w-8 text-right">{item.count}</span>
                        <span className="text-xs text-muted-foreground w-10 text-right">{percentage}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="rounded-lg border bg-background" data-testid="section-signups-by-source">
              <div className="border-b px-5 py-4">
                <h3 className="text-base font-semibold font-heading">Signups by Source</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Lead acquisition channels</p>
              </div>
              <div className="p-5">
                <div className="flex flex-col gap-4">
                  {sourceDistribution.map((item) => {
                    const percentage = Math.round((item.count / maxSourceCount) * 100);
                    return (
                      <div key={item.source} className="flex items-center gap-3" data-testid={`row-source-${item.source.toLowerCase()}`}>
                        <span className="text-sm font-medium w-20">{item.source}</span>
                        <div className="flex-1">
                          <div className="h-2 overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full rounded-full bg-primary transition-all duration-500"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                        <span className="text-sm font-semibold w-8 text-right">{item.count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </Fade>
        )}

        {loading ? (
          <div className="mt-6 rounded-lg border bg-background p-5">
            <Skeleton className="h-4 w-1/3 mb-4" />
            <div className="flex flex-col gap-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        ) : (
          <Fade direction="up" delay={0.25} className="mt-6">
            <div className="rounded-lg border bg-background" data-testid="section-top-users">
              <div className="border-b px-5 py-4">
                <h3 className="text-base font-semibold font-heading">Top Users by Revenue</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Highest revenue generating users</p>
              </div>
              <div className="divide-y">
                {topUsers.map((user, idx) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-3 px-5 py-3"
                    data-testid={`row-top-user-${user.id}`}
                  >
                    <span className="text-sm font-semibold text-muted-foreground w-6">#{idx + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <span className="text-xs text-muted-foreground capitalize">{user.plan}</span>
                    <span className="text-sm font-semibold w-24 text-right" data-testid={`text-user-revenue-${user.id}`}>
                      ${user.revenue.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Fade>
        )}
      </PageTransition>
    </PageShell>
  );
}
