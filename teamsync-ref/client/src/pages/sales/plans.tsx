import { Users, Check, DollarSign, Crown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatsCard } from "@/components/ds/stats-card";
import { planTiers, type PlanTier } from "@/lib/mock-data-sales";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { StatsCardSkeleton } from "@/components/ui/card-skeleton";
import { PageTransition, Stagger, StaggerItem } from "@/components/ui/animated";
import { PageShell } from "@/components/layout";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);

export default function PlansPage() {
  const loading = useSimulatedLoading();

  const totalUsers = planTiers.reduce((sum, p) => sum + p.userCount, 0);
  const totalRevenue = planTiers.reduce((sum, p) => sum + p.revenue, 0);
  const paidUsers = planTiers.filter(p => p.price > 0).reduce((sum, p) => sum + p.userCount, 0);
  const avgRevPerUser = paidUsers > 0 ? totalRevenue / paidUsers : 0;

  return (
    <PageShell>
      <PageTransition>
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <StatsCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
              <StatsCard
                title="Total Users"
                value={totalUsers}
                icon={<Users className="size-5" />}
                change="+12% this month"
                changeType="positive"
              />
              <StatsCard
                title="Total MRR"
                value={formatCurrency(totalRevenue)}
                icon={<DollarSign className="size-5" />}
                change="+8.5% this month"
                changeType="positive"
              />
              <StatsCard
                title="Paid Users"
                value={paidUsers}
                icon={<Crown className="size-5" />}
                change={`${((paidUsers / totalUsers) * 100).toFixed(1)}% conversion`}
                changeType="neutral"
              />
              <StatsCard
                title="Avg Revenue/User"
                value={formatCurrency(avgRevPerUser)}
                icon={<DollarSign className="size-5" />}
                change="+3.2% this month"
                changeType="positive"
              />
            </div>

            <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {planTiers.map((plan) => (
                <StaggerItem key={plan.id}>
                  <PlanCard plan={plan} />
                </StaggerItem>
              ))}
            </Stagger>
          </>
        )}
      </PageTransition>
    </PageShell>
  );
}

function PlanCard({ plan }: { plan: PlanTier }) {
  const isPro = plan.name === "Pro";

  return (
    <Card
      className={isPro ? "border-primary" : ""}
      data-testid={`card-plan-${plan.id}`}
    >
      <CardHeader className="flex flex-row items-center justify-between gap-2 pb-3">
        <CardTitle className="text-lg">{plan.name}</CardTitle>
        {isPro && (
          <Badge variant="default" className="text-xs">
            Popular
          </Badge>
        )}
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div>
          <span className="text-3xl font-bold font-heading tracking-tight">
            {plan.price === 0 ? "Free" : `$${plan.price}`}
          </span>
          {plan.price > 0 && (
            <span className="text-sm text-muted-foreground">/month</span>
          )}
        </div>

        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm text-muted-foreground">Users</span>
            <span className="text-sm font-medium" data-testid={`text-plan-users-${plan.id}`}>
              {plan.userCount.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm text-muted-foreground">Revenue</span>
            <span className="text-sm font-medium" data-testid={`text-plan-revenue-${plan.id}`}>
              {formatCurrency(plan.revenue)}
            </span>
          </div>
        </div>

        <div className="border-t pt-3">
          <p className="text-xs font-medium text-muted-foreground mb-2">Features</p>
          <ul className="flex flex-col gap-1.5">
            {plan.features.map((feature) => (
              <li key={feature} className="flex items-start gap-2 text-sm">
                <Check className="size-3.5 mt-0.5 shrink-0 text-emerald-500" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
