import { useState } from "react";
import { DataTable, type Column } from "@/components/ds/data-table";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { StatusBadge } from "@/components/ds/status-badge";
import { shopifyStores, type ShopifyStore } from "@/lib/mock-data-sales";
import { PersonCell, CompanyCell } from "@/components/ui/avatar-cells";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { PageTransition } from "@/components/ui/animated";
import { PageShell } from "@/components/layout";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);

const statusVariantMap: Record<string, "success" | "error" | "warning" | "neutral" | "info"> = {
  active: "success",
  paused: "warning",
  disconnected: "error",
};

export default function StoresPage() {
  const loading = useSimulatedLoading();
  const [data] = useState<ShopifyStore[]>(shopifyStores);

  const columns: Column<ShopifyStore>[] = [
    {
      key: "name",
      header: "Store Name",
      sortable: true,
      render: (item) => (
        <CompanyCell name={item.name} size="sm" />
      ),
    },
    {
      key: "owner",
      header: "Owner",
      sortable: true,
      render: (item) => (
        <PersonCell name={item.owner} size="sm" />
      ),
    },
    {
      key: "domain",
      header: "Domain",
      render: (item) => (
        <span className="text-sm text-muted-foreground" data-testid={`text-domain-${item.id}`}>{item.domain}</span>
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
      key: "products",
      header: "Products",
      sortable: true,
      render: (item) => <span className="text-sm">{item.products}</span>,
    },
    {
      key: "orders",
      header: "Orders",
      sortable: true,
      render: (item) => <span className="text-sm">{item.orders.toLocaleString()}</span>,
    },
    {
      key: "revenue",
      header: "Revenue",
      sortable: true,
      render: (item) => (
        <span className="text-sm font-medium" data-testid={`text-store-revenue-${item.id}`}>
          {formatCurrency(item.revenue)}
        </span>
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
            searchPlaceholder="Search stores..."
            filters={[
              { label: "Status", key: "status", options: ["active", "paused", "disconnected"] },
            ]}
          />
        )}
      </PageTransition>
    </PageShell>
  );
}
