import { DollarSign, TrendingUp, Users, CreditCard } from "lucide-react";
import { Card } from "@/components/ui/card";
import { StatsCard } from "@/components/ds/stats-card";
import { StatsCardSkeleton } from "@/components/ui/card-skeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { revenueMetrics, planTiers, subscriptions } from "@/lib/mock-data-sales";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { Fade, Stagger, StaggerItem, PageTransition } from "@/components/ui/animated";
import { PageShell } from "@/components/layout";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);

export default function RevenuePage() {
  const loading = useSimulatedLoading();

  const currentMrr = revenueMetrics[revenueMetrics.length - 1].mrr;
  const previousMrr = revenueMetrics[revenueMetrics.length - 2].mrr;
  const mrrGrowth = Math.round(((currentMrr - previousMrr) / previousMrr) * 100);
  const totalRevenue = revenueMetrics.reduce((s, m) => s + m.revenue, 0);
  const totalNewSubs = revenueMetrics.reduce((s, m) => s + m.newSubscriptions, 0);
  const totalChurn = revenueMetrics.reduce((s, m) => s + m.churn, 0);
  const avgChurnRate = Math.round((totalChurn / totalNewSubs) * 100);
  const activeSubscriptions = subscriptions.filter((s) => s.status === "active").length;

  const maxMrr = Math.max(...revenueMetrics.map((m) => m.mrr));
  const totalPlanRevenue = planTiers.reduce((s, p) => s + p.revenue, 0);

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
                title="Current MRR"
                value={formatCurrency(currentMrr)}
                change={`+${mrrGrowth}% from last month`}
                changeType="positive"
                icon={<DollarSign className="size-5" />}
                sparkline={{ values: revenueMetrics.map((m) => m.mrr), color: "#10b981" }}
              />
            </StaggerItem>
            <StaggerItem>
              <StatsCard
                title="Total Revenue (6mo)"
                value={formatCurrency(totalRevenue)}
                change={`${revenueMetrics.length} months tracked`}
                changeType="neutral"
                icon={<TrendingUp className="size-5" />}
                sparkline={{ values: revenueMetrics.map((m) => m.revenue), color: "#6366f1" }}
              />
            </StaggerItem>
            <StaggerItem>
              <StatsCard
                title="Active Subscriptions"
                value={activeSubscriptions}
                change={`${totalNewSubs} new this period`}
                changeType="positive"
                icon={<Users className="size-5" />}
                sparkline={{ values: revenueMetrics.map((m) => m.newSubscriptions), color: "#f59e0b" }}
              />
            </StaggerItem>
            <StaggerItem>
              <StatsCard
                title="Churn Rate"
                value={`${avgChurnRate}%`}
                change={`${totalChurn} churned total`}
                changeType="warning"
                icon={<CreditCard className="size-5" />}
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
            <div className="rounded-lg border bg-background" data-testid="section-mrr-chart">
              <div className="border-b px-5 py-4">
                <h3 className="text-base font-semibold font-heading">MRR Growth</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Monthly recurring revenue trend</p>
              </div>
              <div className="p-5">
                <svg viewBox="0 0 400 200" className="w-full h-auto" data-testid="chart-mrr">
                  {revenueMetrics.map((m, i) => {
                    const barWidth = 40;
                    const gap = (400 - revenueMetrics.length * barWidth) / (revenueMetrics.length + 1);
                    const x = gap + i * (barWidth + gap);
                    const height = (m.mrr / maxMrr) * 150;
                    return (
                      <g key={m.month}>
                        <rect
                          x={x}
                          y={170 - height}
                          width={barWidth}
                          height={height}
                          rx={3}
                          className="fill-primary"
                          opacity={0.85}
                          data-testid={`bar-mrr-${m.month}`}
                        />
                        <text
                          x={x + barWidth / 2}
                          y={190}
                          textAnchor="middle"
                          className="fill-muted-foreground text-[11px]"
                        >
                          {m.month}
                        </text>
                        <text
                          x={x + barWidth / 2}
                          y={165 - height}
                          textAnchor="middle"
                          className="fill-muted-foreground text-[9px]"
                        >
                          ${(m.mrr / 1000).toFixed(1)}k
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>

            <div className="rounded-lg border bg-background" data-testid="section-plan-distribution">
              <div className="border-b px-5 py-4">
                <h3 className="text-base font-semibold font-heading">Revenue by Plan</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Distribution across plan tiers</p>
              </div>
              <div className="divide-y">
                {planTiers.filter((p) => p.revenue > 0).map((plan) => {
                  const percentage = Math.round((plan.revenue / totalPlanRevenue) * 100);
                  return (
                    <div
                      key={plan.id}
                      className="flex items-center gap-3 px-5 py-3"
                      data-testid={`row-plan-revenue-${plan.id}`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{plan.name}</p>
                        <p className="text-xs text-muted-foreground">{plan.userCount} users</p>
                      </div>
                      <div className="w-32 flex items-center gap-2">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-primary transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground w-8 text-right">{percentage}%</span>
                      </div>
                      <span className="text-sm font-semibold w-20 text-right" data-testid={`text-plan-revenue-${plan.id}`}>
                        {formatCurrency(plan.revenue)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </Fade>
        )}

        {loading ? (
          <div className="mt-6 rounded-lg border bg-background p-5">
            <Skeleton className="h-4 w-1/3 mb-4" />
            <div className="grid grid-cols-3 gap-4">
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
            </div>
          </div>
        ) : (
          <Fade direction="up" delay={0.25} className="mt-6">
            <div className="rounded-lg border bg-background" data-testid="section-top-plans">
              <div className="border-b px-5 py-4">
                <h3 className="text-base font-semibold font-heading">Plan Tier Overview</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Revenue and user metrics per plan</p>
              </div>
              <div className="grid grid-cols-1 divide-y sm:grid-cols-4 sm:divide-x sm:divide-y-0">
                {planTiers.map((plan) => (
                  <div key={plan.id} className="flex flex-col items-center gap-1 p-5" data-testid={`stat-plan-${plan.id}`}>
                    <span className="text-2xl font-semibold font-heading">{formatCurrency(plan.price)}</span>
                    <span className="text-sm font-medium">{plan.name}</span>
                    <span className="text-xs text-muted-foreground">{plan.userCount.toLocaleString()} users</span>
                    <span className="text-xs text-muted-foreground">{formatCurrency(plan.revenue)} revenue</span>
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
