import { useState, useMemo } from "react";
import { Package, AlertTriangle, TrendingDown, ArrowUpCircle, Layers, Plus } from "lucide-react";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { Button } from "@/components/ui/button";
import { omsInventory } from "@/lib/mock-data-oms";
import { cn } from "@/lib/utils";
import {
  PageShell,
  PageHeader,
  IndexToolbar,
  DataTableContainer,
  DataTH,
  DataTD,
  DataTR,
  StatGrid,
  StatCard,
} from "@/components/layout";
import { verticals } from "@/lib/verticals-config";

const STATUS_STYLES: Record<string, string> = {
  critical: "bg-red-100 text-red-700",
  low: "bg-amber-100 text-amber-700",
  ok: "bg-emerald-100 text-emerald-700",
  overstock: "bg-blue-100 text-blue-700",
};

export default function OmsInventory() {
  const loading = useSimulatedLoading(600);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

  const vertical = verticals.find((v) => v.id === "oms")!;

  const filtered = useMemo(() => {
    let list = [...omsInventory];
    if (statusFilter !== "all") list = list.filter((i) => i.status === statusFilter);
    if (search)
      list = list.filter(
        (i) =>
          i.sku.toLowerCase().includes(search.toLowerCase()) ||
          i.productName.toLowerCase().includes(search.toLowerCase())
      );
    return list;
  }, [statusFilter, search]);

  const summary = useMemo(
    () => ({
      total: omsInventory.length,
      units: omsInventory.reduce((s, i) => s + i.qtyOnHand, 0),
      critical: omsInventory.filter((i) => i.status === "critical").length,
      low: omsInventory.filter((i) => i.status === "low").length,
    }),
    []
  );

  const filterOptions = [
    { value: "all", label: "All Stock" },
    { value: "ok", label: "Healthy" },
    { value: "low", label: "Low Stock" },
    { value: "critical", label: "Critical" },
  ];

  return (
    <PageShell>
      <PageHeader
        title="Inventory"
        subtitle={`${omsInventory.length} SKUs · live stock levels`}
        actions={
          <Button variant="outline" data-testid="btn-stock-adjustment">
            Stock Adjustment
          </Button>
        }
      />

      <StatGrid>
        <StatCard
          label="Total SKUs"
          value={summary.total}
          icon={Package}
          iconBg="rgba(8, 145, 178, 0.1)"
          iconColor="rgb(8, 145, 178)"
        />
        <StatCard
          label="Total Units"
          value={summary.units.toLocaleString()}
          icon={Layers}
          iconBg="rgba(59, 130, 246, 0.1)"
          iconColor="rgb(59, 130, 246)"
        />
        <StatCard
          label="Critical"
          value={summary.critical}
          icon={AlertTriangle}
          iconBg="rgba(239, 68, 68, 0.1)"
          iconColor="rgb(239, 68, 68)"
        />
        <StatCard
          label="Low Stock"
          value={summary.low}
          icon={TrendingDown}
          iconBg="rgba(245, 158, 11, 0.1)"
          iconColor="rgb(245, 158, 11)"
        />
      </StatGrid>

      <IndexToolbar
        search={search}
        onSearch={setSearch}
        filters={filterOptions}
        activeFilter={statusFilter}
        onFilter={setStatusFilter}
        color={vertical.color}
        placeholder="Search SKU..."
      />

      {loading ? (
        <div className="space-y-4 animate-pulse">
          <div className="h-96 bg-muted rounded-xl" />
        </div>
      ) : (
        <DataTableContainer>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <DataTH>SKU</DataTH>
                <DataTH>Product</DataTH>
                <DataTH>Location</DataTH>
                <DataTH align="right">On Hand</DataTH>
                <DataTH align="right">Available</DataTH>
                <DataTH align="center">Status</DataTH>
                <DataTH align="right">Actions</DataTH>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((inv) => (
                <DataTR key={inv.id}>
                  <DataTD className="text-xs">{inv.sku}</DataTD>
                  <DataTD className="max-w-[200px] truncate">{inv.productName}</DataTD>
                  <DataTD className="text-muted-foreground">{inv.locationCode}</DataTD>
                  <DataTD align="right" className="font-semibold">
                    {inv.qtyOnHand}
                  </DataTD>
                  <DataTD align="right">{inv.qtyAvailable}</DataTD>
                  <DataTD align="center">
                    <span
                      className={cn(
                        "inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize",
                        STATUS_STYLES[inv.status]
                      )}
                    >
                      {inv.status}
                    </span>
                  </DataTD>
                  <DataTD align="right">
                    <Button variant="outline" size="sm" data-testid={`btn-reorder-${inv.id}`}>
                      Reorder
                    </Button>
                  </DataTD>
                </DataTR>
              ))}
            </tbody>
          </table>
        </DataTableContainer>
      )}
    </PageShell>
  );
}
