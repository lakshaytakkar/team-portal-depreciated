import { useState } from "react";
import { DataTable, type Column } from "@/components/ds/data-table";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { StatusBadge } from "@/components/ds/status-badge";
import { suppliers as initialSuppliers, type Supplier } from "@/lib/mock-data-sales";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { PageTransition } from "@/components/ui/animated";
import { Star, MapPin, Truck } from "lucide-react";
import { PageShell } from "@/components/layout";
import { CompanyCell } from "@/components/ui/avatar-cells";

const statusVariant: Record<string, "success" | "error" | "warning" | "neutral" | "info"> = {
  verified: "success",
  pending: "warning",
  suspended: "error",
};

export default function SuppliersPage() {
  const loading = useSimulatedLoading();
  const [data] = useState<Supplier[]>(initialSuppliers);

  const columns: Column<Supplier>[] = [
    {
      key: "name",
      header: "Supplier",
      sortable: true,
      render: (item) => <CompanyCell name={item.name} size="sm" />,
    },
    {
      key: "country",
      header: "Country",
      render: (item) => (
        <div className="flex items-center gap-1.5">
          <MapPin className="size-3.5 text-muted-foreground" />
          <span className="text-sm">{item.country}</span>
        </div>
      ),
    },
    {
      key: "rating",
      header: "Rating",
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-1">
          <Star className="size-3.5 fill-amber-400 text-amber-400" />
          <span className="text-sm font-medium">{item.rating}</span>
        </div>
      ),
    },
    {
      key: "products",
      header: "Products",
      sortable: true,
      render: (item) => <span className="text-sm">{item.products.toLocaleString()}</span>,
    },
    {
      key: "avgShipping",
      header: "Avg Shipping",
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-1.5">
          <Truck className="size-3.5 text-muted-foreground" />
          <span className="text-sm">{item.avgShipping} days</span>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (item) => (
        <StatusBadge
          status={item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          variant={statusVariant[item.status]}
        />
      ),
    },
  ];

  const countryOptions = Array.from(new Set(data.map((s) => s.country)));

  return (
    <PageShell>
      <PageTransition>
        {loading ? (
          <TableSkeleton rows={8} columns={6} />
        ) : (
          <DataTable
            data={data}
            columns={columns}
            searchPlaceholder="Search suppliers..."
            filters={[
              { label: "Country", key: "country", options: countryOptions },
              { label: "Status", key: "status", options: ["verified", "pending", "suspended"] },
            ]}
          />
        )}
      </PageTransition>
    </PageShell>
  );
}
