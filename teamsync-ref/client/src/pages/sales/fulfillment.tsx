import { useState } from "react";
import { DataTable, type Column } from "@/components/ds/data-table";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { StatusBadge } from "@/components/ds/status-badge";
import { fulfillmentOrders, type FulfillmentOrder } from "@/lib/mock-data-sales";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { PageTransition } from "@/components/ui/animated";
import { PageShell } from "@/components/layout";
import { CompanyCell } from "@/components/ui/avatar-cells";

const statusVariantMap: Record<string, "success" | "error" | "warning" | "neutral" | "info"> = {
  pending: "neutral",
  processing: "warning",
  shipped: "info",
  delivered: "success",
};

export default function FulfillmentPage() {
  const loading = useSimulatedLoading();
  const [data] = useState<FulfillmentOrder[]>(fulfillmentOrders);

  const columns: Column<FulfillmentOrder>[] = [
    {
      key: "orderId",
      header: "Order ID",
      sortable: true,
      render: (item) => (
        <span className="text-sm font-medium text-muted-foreground" data-testid={`text-order-id-${item.id}`}>
          {item.orderId}
        </span>
      ),
    },
    {
      key: "store",
      header: "Store",
      sortable: true,
      render: (item) => <CompanyCell name={item.store} size="sm" />,
    },
    {
      key: "product",
      header: "Product",
      render: (item) => <span className="text-sm font-medium">{item.product}</span>,
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
      key: "trackingNumber",
      header: "Tracking",
      render: (item) => (
        <span className="text-sm text-muted-foreground" data-testid={`text-tracking-${item.id}`}>
          {item.trackingNumber || "---"}
        </span>
      ),
    },
    {
      key: "supplier",
      header: "Supplier",
      render: (item) => <CompanyCell name={item.supplier} size="sm" />,
    },
    {
      key: "createdDate",
      header: "Date",
      sortable: true,
      render: (item) => <span className="text-sm text-muted-foreground">{item.createdDate}</span>,
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
            searchPlaceholder="Search fulfillment orders..."
            filters={[
              { label: "Status", key: "status", options: ["pending", "processing", "shipped", "delivered"] },
            ]}
          />
        )}
      </PageTransition>
    </PageShell>
  );
}
