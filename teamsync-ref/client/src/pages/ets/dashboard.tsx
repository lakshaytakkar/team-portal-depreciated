import {
  Users,
  CheckCircle2,
  Banknote,
  Rocket,
  TrendingUp,
  Clock,
  AlertTriangle,
  Package,
  ArrowRight,
  IndianRupee,
  Ship,
} from "lucide-react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import {
  PageShell,
  PageHeader,
  HeroBanner,
  StatCard,
  StatGrid,
  SectionCard,
  SectionGrid,
} from "@/components/layout";
import { StatsCardSkeleton } from "@/components/ui/card-skeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ds/status-badge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ETS_STAGE_LABELS,
  ETS_ORDER_STATUS_LABELS,
  ETS_ORDER_STATUSES,
  type EtsClient,
  type EtsOrder,
  type EtsPayment,
  type EtsPipelineStage,
} from "@/lib/mock-data-ets";
import { Fade, Stagger, StaggerItem } from "@/components/ui/animated";
import { PersonCell } from "@/components/ui/avatar-cells";

const stageVariantMap: Record<EtsPipelineStage, "success" | "error" | "warning" | "neutral" | "info"> = {
  "new-lead": "neutral",
  "qualified": "info",
  "token-paid": "warning",
  "store-design": "info",
  "inventory-ordered": "warning",
  "in-transit": "warning",
  "launched": "success",
  "reordering": "success",
};

function formatCurrency(amount: number): string {
  if (amount >= 10000000) return `${(amount / 10000000).toFixed(1)}Cr`;
  if (amount >= 100000) return `${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000) return `${(amount / 1000).toFixed(0)}K`;
  return amount.toLocaleString("en-IN");
}

export default function EtsDashboard() {
  const [, navigate] = useLocation();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const { data: clientsData, isLoading } = useQuery<{ clients: EtsClient[], total: number }>({ queryKey: ['/api/ets/clients'] });
  const { data: ordersData } = useQuery<{ orders: EtsOrder[] }>({ queryKey: ['/api/ets/orders'] });
  const { data: paymentsData } = useQuery<{ payments: EtsPayment[] }>({ queryKey: ['/api/ets/payments'] });

  const etsClients = clientsData?.clients || [];
  const etsOrders = ordersData?.orders || [];
  const etsPayments = paymentsData?.payments || [];

  const totalClients = etsClients.length;
  const qualifiedClients = etsClients.filter((c) => c.stage === "qualified").length;
  const tokenPaidClients = etsClients.filter((c) => c.stage === "token-paid").length;
  const launchedClients = etsClients.filter((c) => c.stage === "launched" || c.stage === "reordering").length;

  const totalTokensCollected = etsPayments
    .filter((p) => p.status === "received")
    .reduce((sum, p) => sum + p.amount, 0);
  const pendingInvoices = etsPayments
    .filter((p) => p.status === "pending" || p.status === "overdue")
    .reduce((sum, p) => sum + p.amount, 0);
  const estimatedPipelineValue = etsClients.reduce(
    (sum, c) => sum + c.totalPaid + c.pendingDues,
    0
  );

  const activeOrders = etsOrders.filter(
    (o) => o.status !== "dispatched"
  );

  const stuckClients = etsClients.filter((c) => c.daysInStage > 3 && c.stage !== "launched" && c.stage !== "reordering");
  const flaggedOrders = etsOrders.filter((o) => o.isFlagged);
  const alerts = [
    ...stuckClients.map((c) => ({
      id: c.id,
      type: "client" as const,
      title: `${c.name} stuck in ${ETS_STAGE_LABELS[c.stage]}`,
      detail: `${c.daysInStage} days — ${c.city}`,
      severity: c.daysInStage > 10 ? "error" as const : "warning" as const,
    })),
    ...flaggedOrders.map((o) => ({
      id: o.id,
      type: "order" as const,
      title: `Order ${o.id} flagged — ${o.clientName}`,
      detail: `${ETS_ORDER_STATUS_LABELS[o.status]} — ETA ${o.etaDays} days`,
      severity: "error" as const,
    })),
  ].sort((a, b) => (a.severity === "error" ? -1 : 1));

  const recentClients = [...etsClients]
    .sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime())
    .slice(0, 5);

  const orderStatusIndex = (status: string) => ETS_ORDER_STATUSES.indexOf(status as any);
  const orderProgressPercent = (status: string) => {
    const idx = orderStatusIndex(status);
    return Math.round(((idx + 1) / ETS_ORDER_STATUSES.length) * 100);
  };

  return (
    <PageShell>
      <HeroBanner
        eyebrow={`${greeting}, Sneha Patel`}
        headline="EazyToSell Command Center"
        tagline="China-to-India value retail franchise pipeline & operations"
        color="#F97316"
        colorDark="#d96012"
        metrics={[
          { label: "Total Clients", value: totalClients },
          { label: "Tokens Collected", value: `₹${formatCurrency(totalTokensCollected)}` },
          { label: "Pipeline Value", value: `₹${formatCurrency(estimatedPipelineValue)}` }
        ]}
      />

      {isLoading ? (
        <StatGrid>
          <StatsCardSkeleton />
          <StatsCardSkeleton />
          <StatsCardSkeleton />
          <StatsCardSkeleton />
        </StatGrid>
      ) : (
        <StatGrid>
          <StatCard
            label="Total Clients"
            value={totalClients}
            trend={`${etsClients.filter((c) => c.stage === "new-lead").length} new leads`}
            icon={Users}
            iconBg="rgba(249, 115, 22, 0.1)"
            iconColor="#F97316"
          />
          <StatCard
            label="Qualified"
            value={qualifiedClients}
            trend="Ready for proposal"
            icon={CheckCircle2}
            iconBg="rgba(59, 130, 246, 0.1)"
            iconColor="#3b82f6"
          />
          <StatCard
            label="Token Paid"
            value={tokenPaidClients}
            trend="In onboarding"
            icon={Banknote}
            iconBg="rgba(245, 158, 11, 0.1)"
            iconColor="#f59e0b"
          />
          <StatCard
            label="Launched"
            value={launchedClients}
            trend="Active stores"
            icon={Rocket}
            iconBg="rgba(16, 185, 129, 0.1)"
            iconColor="#10b981"
          />
        </StatGrid>
      )}

      {isLoading ? (
        <SectionGrid>
          <Skeleton className="h-[400px] w-full rounded-xl" />
          <Skeleton className="h-[400px] w-full rounded-xl" />
        </SectionGrid>
      ) : (
        <SectionGrid>
          <SectionCard
            title="Active Orders"
            viewAllLabel="View All"
            onViewAll={() => navigate("/ets/orders")}
          >
            <div className="divide-y -mx-5 -mb-5">
              {activeOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center gap-4 px-5 py-3.5"
                  data-testid={`card-order-${order.id}`}
                >
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-orange-600 dark:bg-orange-950/50 dark:text-orange-400">
                    {order.status === "shipped" ? (
                      <Ship className="size-4" />
                    ) : (
                      <Package className="size-4" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium truncate">{order.clientName}</p>
                      <StatusBadge
                        status={ETS_ORDER_STATUS_LABELS[order.status]}
                        variant={
                          order.isFlagged
                            ? "error"
                            : order.status === "customs"
                              ? "warning"
                              : order.status === "warehouse"
                                ? "info"
                                : "neutral"
                        }
                      />
                    </div>
                    <div className="mt-1.5 flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full bg-muted">
                        <div
                          className="h-1.5 rounded-full transition-all"
                          style={{
                            width: `${orderProgressPercent(order.status)}%`,
                            backgroundColor: order.isFlagged ? "#ef4444" : "#F97316",
                          }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {order.etaDays > 0 ? `${order.etaDays}d ETA` : "Delivered"}
                      </span>
                    </div>
                  </div>
                  <span className="text-sm font-medium shrink-0">
                    ₹{formatCurrency(order.valueInr)}
                  </span>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard
            title="Alerts"
            viewAllLabel="Pipeline"
            onViewAll={() => navigate("/ets/pipeline")}
          >
            <div className="divide-y -mx-5 -mb-5 max-h-[320px] overflow-y-auto">
              {alerts.slice(0, 8).map((alert) => (
                <button
                  key={`${alert.type}-${alert.id}`}
                  className="w-full text-left flex items-center gap-3 px-5 py-3 transition-colors hover:bg-muted/20"
                  onClick={() =>
                    alert.type === "client"
                      ? navigate(`/ets/clients/${alert.id}`)
                      : navigate("/ets/orders")
                  }
                  data-testid={`alert-${alert.type}-${alert.id}`}
                >
                  <AlertTriangle
                    className={`size-4 shrink-0 ${
                      alert.severity === "error"
                        ? "text-red-500"
                        : "text-amber-500"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{alert.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {alert.detail}
                    </p>
                  </div>
                  <StatusBadge
                    status={alert.severity === "error" ? "High" : "Medium"}
                    variant={alert.severity === "error" ? "error" : "warning"}
                  />
                </button>
              ))}
            </div>
          </SectionCard>
        </SectionGrid>
      )}

      {!isLoading && (
        <SectionGrid>
          <SectionCard
            title="Recent Clients"
            viewAllLabel="View All"
            onViewAll={() => navigate("/ets/pipeline")}
          >
            <div className="divide-y -mx-5 -mb-5">
              {recentClients.map((client) => (
                <button
                  key={client.id}
                  className="w-full text-left flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-muted/20"
                  onClick={() => navigate(`/ets/clients/${client.id}`)}
                  data-testid={`card-recent-client-${client.id}`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <PersonCell name={client.name} size="sm" />
                      <StatusBadge
                        status={ETS_STAGE_LABELS[client.stage]}
                        variant={stageVariantMap[client.stage]}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {client.city} &middot; {client.storeSize} sqft &middot; {client.packageTier.charAt(0).toUpperCase() + client.packageTier.slice(1)}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-muted-foreground">
                      {client.daysInStage}d in stage
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Pipeline Progress">
            <div className="flex items-end gap-2 pt-8">
              {(
                [
                  "new-lead",
                  "qualified",
                  "token-paid",
                  "store-design",
                  "inventory-ordered",
                  "in-transit",
                  "launched",
                  "reordering",
                ] as const
              ).map((stage) => {
                const count = etsClients.filter((c) => c.stage === stage).length;
                const maxCount = Math.max(
                  ...["new-lead", "qualified", "token-paid", "store-design", "inventory-ordered", "in-transit", "launched", "reordering"].map(
                    (s) => etsClients.filter((c) => c.stage === (s as any)).length
                  )
                );
                const heightPercent = maxCount > 0 ? (count / maxCount) * 100 : 0;
                return (
                  <button
                    key={stage}
                    className="flex-1 flex flex-col items-center gap-1.5"
                    onClick={() => navigate("/ets/pipeline")}
                    data-testid={`pipeline-bar-${stage}`}
                  >
                    <span className="text-xs font-semibold">{count}</span>
                    <div
                      className="w-full rounded-md transition-all"
                      style={{
                        height: `${Math.max(heightPercent, 8)}px`,
                        minHeight: "8px",
                        maxHeight: "80px",
                        backgroundColor:
                          stage === "launched" || stage === "reordering"
                            ? "#10b981"
                            : stage === "new-lead"
                              ? "#94a3b8"
                              : "#F97316",
                        opacity: 0.8,
                      }}
                    />
                    <span className="text-[10px] text-muted-foreground text-center leading-tight">
                      {ETS_STAGE_LABELS[stage].split(" ").slice(0, 2).join(" ")}
                    </span>
                  </button>
                );
              })}
            </div>
          </SectionCard>
        </SectionGrid>
      )}
    </PageShell>
  );
}
