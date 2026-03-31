import { useState } from "react";
import { DataTable, type Column } from "@/components/ds/data-table";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { StatusBadge } from "@/components/ds/status-badge";
import { subscriptions, type Subscription } from "@/lib/mock-data-sales";
import { PersonCell } from "@/components/ui/avatar-cells";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { PageTransition } from "@/components/ui/animated";
import { PageShell } from "@/components/layout";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);

const planVariantMap: Record<string, "success" | "error" | "warning" | "neutral" | "info"> = {
  free: "neutral",
  starter: "info",
  pro: "warning",
  enterprise: "success",
};

const statusVariantMap: Record<string, "success" | "error" | "warning" | "neutral" | "info"> = {
  active: "success",
  canceled: "error",
  past_due: "warning",
  trialing: "info",
};

export default function SubscriptionsPage() {
  const loading = useSimulatedLoading();
  const [data] = useState<Subscription[]>(subscriptions);

  const columns: Column<Subscription>[] = [
    {
      key: "userName",
      header: "User",
      sortable: true,
      render: (item) => (
        <PersonCell name={item.userName} size="sm" />
      ),
    },
    {
      key: "plan",
      header: "Plan",
      render: (item) => (
        <StatusBadge
          status={item.plan.charAt(0).toUpperCase() + item.plan.slice(1)}
          variant={planVariantMap[item.plan]}
        />
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (item) => (
        <StatusBadge
          status={undefined || item.status}
          variant={statusVariantMap[item.status]}
        />
      ),
    },
    {
      key: "mrr",
      header: "MRR",
      sortable: true,
      render: (item) => (
        <span className="text-sm font-medium" data-testid={`text-mrr-${item.id}`}>
          {formatCurrency(item.mrr)}
        </span>
      ),
    },
    {
      key: "startDate",
      header: "Start Date",
      sortable: true,
      render: (item) => <span className="text-sm text-muted-foreground">{item.startDate}</span>,
    },
    {
      key: "endDate",
      header: "End Date",
      sortable: true,
      render: (item) => <span className="text-sm text-muted-foreground">{item.endDate}</span>,
    },
  ];

  return (
    <PageShell>
      <PageTransition>
        {loading ? (
          <TableSkeleton rows={8} columns={6} />
        ) : (
          <DataTable
            data={data}
            columns={columns}
            searchPlaceholder="Search subscriptions..."
            filters={[
              { label: "Plan", key: "plan", options: ["free", "starter", "pro", "enterprise"] },
              { label: "Status", key: "status", options: ["active", "canceled", "past_due", "trialing"] },
            ]}
          />
        )}
      </PageTransition>
    </PageShell>
  );
}
