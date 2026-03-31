import { useState } from "react";
import { Mail } from "lucide-react";
import { DataTable, type Column } from "@/components/ds/data-table";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { StatusBadge } from "@/components/ds/status-badge";
import { Button } from "@/components/ui/button";
import { externalUsers, type ExternalUser } from "@/lib/mock-data-sales";
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
  churned: "error",
  trial: "info",
};

export default function UsersPage() {
  const loading = useSimulatedLoading();
  const [data] = useState<ExternalUser[]>(externalUsers);

  const columns: Column<ExternalUser>[] = [
    {
      key: "name",
      header: "User",
      sortable: true,
      render: (item) => (
        <PersonCell name={item.name} subtitle={item.email} size="sm" />
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
          status={item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          variant={statusVariantMap[item.status]}
        />
      ),
    },
    {
      key: "signupDate",
      header: "Signup Date",
      sortable: true,
      render: (item) => <span className="text-sm text-muted-foreground">{item.signupDate}</span>,
    },
    {
      key: "storesConnected",
      header: "Stores",
      sortable: true,
      render: (item) => <span className="text-sm">{item.storesConnected}</span>,
    },
    {
      key: "productsImported",
      header: "Products",
      sortable: true,
      render: (item) => <span className="text-sm">{item.productsImported}</span>,
    },
    {
      key: "revenue",
      header: "Revenue",
      sortable: true,
      render: (item) => (
        <span className="text-sm font-medium" data-testid={`text-revenue-${item.id}`}>
          {formatCurrency(item.revenue)}
        </span>
      ),
    },
    {
      key: "_contact",
      header: "",
      render: (item) => (
        <a href={`mailto:${item.email}`} data-testid={`btn-email-${item.id}`}>
          <Button variant="ghost" size="icon" className="size-8">
            <Mail className="size-4" />
          </Button>
        </a>
      ),
    },
  ];

  return (
    <PageShell>
      <PageTransition>
        {loading ? (
          <TableSkeleton rows={8} columns={7} />
        ) : (
          <DataTable
            data={data}
            columns={columns}
            searchPlaceholder="Search users..."
            filters={[
              { label: "Plan", key: "plan", options: ["free", "starter", "pro", "enterprise"] },
              { label: "Status", key: "status", options: ["active", "churned", "trial"] },
            ]}
          />
        )}
      </PageTransition>
    </PageShell>
  );
}
