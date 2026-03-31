import { useState } from "react";
import { Copy } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { SopModal, TutorialModal, SopTutorialButtons } from "@/components/sop/sop-modal";
import { SOP_REGISTRY } from "@/lib/sop-data";
import { CompanyCell } from "@/components/ui/avatar-cells";
import { Fade } from "@/components/ui/animated";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  PageShell, PageHeader, IndexToolbar, DataTableContainer, DataTH, SortableDataTH, DataTD, DataTR,
} from "@/components/layout";
import { FAIRE_COLOR, type OrderState } from "@/lib/faire-config";
import { DualCurrency } from "@/lib/faire-currency";



const orderStateConfig: Record<string, { label: string; color: string; bg: string }> = {
  PRE_TRANSIT: { label: "Pre-Transit", color: "#9333EA", bg: "#FAF5FF" },
  IN_TRANSIT: { label: "In Transit", color: "#D97706", bg: "#FFFBEB" },
  DELIVERED: { label: "Delivered", color: "#059669", bg: "#ECFDF5" },
};

const shipTypeLabels: Record<string, string> = {
  SHIP_ON_YOUR_OWN: "Own Label",
  FAIRE_SHIPPING_LABEL: "Faire Label",
};

export default function FaireShipments() {
  const { toast } = useToast();
  const [selectedStore, setSelectedStore] = useState("all");
  const [stateFilter, setStateFilter] = useState<"all" | "PRE_TRANSIT" | "IN_TRANSIT" | "DELIVERED">("all");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sort, setSort] = useState<{ key: string; dir: "asc" | "desc" } | null>(null);
  const [sopOpen, setSopOpen] = useState(false);
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const PAGE_SIZE = 25;

  const handleSort = (key: string) => {
    setSort((prev) => {
      if (!prev || prev.key !== key) return { key, dir: "asc" };
      if (prev.dir === "asc") return { key, dir: "desc" };
      return null;
    });
    setCurrentPage(1);
  };

  const { data: ordersData, isLoading: ordersLoading } = useQuery<{ orders: any[] }>({
    queryKey: ["/api/faire/orders"],
    queryFn: async () => {
      const res = await fetch("/api/faire/orders", { headers: { "Cache-Control": "no-cache" } });
      if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`);
      return res.json();
    },
  });

  const { data: storesData, isLoading: storesLoading } = useQuery<{ stores: any[] }>({
    queryKey: ["/api/faire/stores"],
    queryFn: async () => {
      const res = await fetch("/api/faire/stores", { headers: { "Cache-Control": "no-cache" } });
      if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`);
      return res.json();
    },
  });

  const isLoading = ordersLoading || storesLoading;
  const orders = ordersData?.orders ?? [];
  const stores = storesData?.stores ?? [];

  const enriched = orders
    .filter(order => order.shipments && order.shipments.length > 0)
    .flatMap(order => {
      const store = stores.find(s => s.id === order._storeId);
      return (order.shipments as any[]).map((ship: any) => ({
        ...ship,
        order,
        store,
        retailerId: order.retailer_id,
      }));
    })
    .filter(s => {
      if (selectedStore !== "all" && s.store?.id !== selectedStore) return false;
      if (stateFilter !== "all" && s.order?.state !== stateFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        const shipId = (s.id ?? "").toLowerCase();
        const orderId = (s.order?.display_id ?? "").toLowerCase();
        const carrier = (s.carrier ?? "").toLowerCase();
        const trackingCode = (s.tracking_code ?? "").toLowerCase();
        if (!shipId.includes(q) && !orderId.includes(q) && !carrier.includes(q) && !trackingCode.includes(q)) return false;
      }
      return true;
    });

  const sortedShipments = sort
    ? [...enriched].sort((a, b) => {
        let aVal: any, bVal: any;
        switch (sort.key) {
          case "id": aVal = a.id ?? ""; bVal = b.id ?? ""; break;
          case "orderId": aVal = a.order?.display_id ?? ""; bVal = b.order?.display_id ?? ""; break;
          case "store": aVal = a.store?.name ?? ""; bVal = b.store?.name ?? ""; break;
          case "carrier": aVal = a.carrier ?? ""; bVal = b.carrier ?? ""; break;
          case "shipped": aVal = a.shipped_at ?? ""; bVal = b.shipped_at ?? ""; break;
          case "cost": aVal = a.maker_cost_cents ?? 0; bVal = b.maker_cost_cents ?? 0; break;
          default: return 0;
        }
        if (typeof aVal === "number" && typeof bVal === "number") {
          return sort.dir === "asc" ? aVal - bVal : bVal - aVal;
        }
        const cmp = String(aVal).localeCompare(String(bVal));
        return sort.dir === "asc" ? cmp : -cmp;
      })
    : enriched;

  const totalPages = Math.max(1, Math.ceil(sortedShipments.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedShipments = sortedShipments.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const copyTracking = (code: string) => {
    navigator.clipboard.writeText(code).then(() => toast({ title: "Copied", description: code }));
  };

  if (isLoading) {
    return (
      <PageShell>
        <div className="h-10 bg-muted rounded w-64 animate-pulse" />
        <div className="h-80 bg-muted rounded-xl animate-pulse" />
      </PageShell>
    );
  }

  return (
    <PageShell>
      <Fade>
        <PageHeader
          title="Shipments"
          subtitle="All in-transit and recent shipments"
          actions={
            <div className="flex items-center gap-2">
            <SopTutorialButtons onSopClick={() => setSopOpen(true)} onTutorialClick={() => setTutorialOpen(true)} />
            <select value={selectedStore} onChange={e => { setSelectedStore(e.target.value); setCurrentPage(1); }} className="h-9 text-sm border rounded-lg px-3 bg-background" data-testid="select-store">
              <option value="all">All Stores</option>
              {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            </div>
          }
        />
      </Fade>

      <Fade>
        <IndexToolbar
          search={search}
          onSearch={(v) => { setSearch(v); setCurrentPage(1); }}
          placeholder="Search shipments..."
          color={FAIRE_COLOR}
          filters={[
            { value: "all", label: "All" },
            { value: "PRE_TRANSIT", label: "Pre-Transit" },
            { value: "IN_TRANSIT", label: "In Transit" },
            { value: "DELIVERED", label: "Delivered" },
          ]}
          activeFilter={stateFilter}
          onFilter={(v) => { setStateFilter(v as "all" | "PRE_TRANSIT" | "IN_TRANSIT" | "DELIVERED"); setCurrentPage(1); }}
        />
      </Fade>

      <Fade>
        <DataTableContainer>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <SortableDataTH sortKey="id" currentSort={sort} onSort={handleSort}>Shipment ID</SortableDataTH>
                <SortableDataTH sortKey="orderId" currentSort={sort} onSort={handleSort}>Order ID</SortableDataTH>
                <SortableDataTH sortKey="store" currentSort={sort} onSort={handleSort}>Store</SortableDataTH>
                <DataTH>Retailer</DataTH>
                <SortableDataTH sortKey="carrier" currentSort={sort} onSort={handleSort}>Carrier</SortableDataTH>
                <DataTH>Tracking Code</DataTH>
                <SortableDataTH sortKey="shipped" currentSort={sort} onSort={handleSort}>Shipped</SortableDataTH>
                <SortableDataTH sortKey="cost" currentSort={sort} onSort={handleSort} align="left">Shipping Cost</SortableDataTH>
                <DataTH>Type</DataTH>
                <DataTH>Order State</DataTH>
              </tr>
            </thead>
            <tbody className="divide-y">
              {paginatedShipments.map(ship => {
                const orderState = ship.order?.state ?? "IN_TRANSIT";
                const cfg = orderStateConfig[orderState] ?? { label: orderState, color: "#6B7280", bg: "#F9FAFB" };
                return (
                  <DataTR key={ship.id} data-testid={`shipment-row-${ship.id}`}>
                    <DataTD className="text-xs text-muted-foreground">{ship.id}</DataTD>
                    <DataTD>
                      <Badge variant="outline" className="text-xs">{ship.order?.display_id}</Badge>
                    </DataTD>
                    <DataTD>
                      <Badge variant="outline" className="text-xs">{ship.store?.name?.split(" ")[0] ?? "—"}</Badge>
                    </DataTD>
                    <DataTD>{ship.retailerId ? <CompanyCell name={ship.retailerId} size="xs" /> : "—"}</DataTD>
                    <DataTD className="font-medium">{ship.carrier}</DataTD>
                    <DataTD>
                      <div className="flex items-center gap-1">
                        <span className="text-xs bg-muted rounded px-1.5 py-0.5 max-w-[120px] truncate">{ship.tracking_code}</span>
                        <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => copyTracking(ship.tracking_code)} data-testid={`btn-copy-tracking-${ship.id}`}><Copy size={10} /></Button>
                      </div>
                    </DataTD>
                    <DataTD>{ship.shipped_at ? new Date(ship.shipped_at).toLocaleDateString() : "—"}</DataTD>
                    <DataTD className="font-semibold">{ship.maker_cost_cents != null ? <DualCurrency cents={ship.maker_cost_cents} /> : "—"}</DataTD>
                    <DataTD>
                      <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-medium">{shipTypeLabels[ship.shipping_type] ?? ship.shipping_type ?? "—"}</span>
                    </DataTD>
                    <DataTD>
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: cfg.bg, color: cfg.color }}>{cfg.label}</span>
                    </DataTD>
                  </DataTR>
                );
              })}
              {enriched.length === 0 && (
                <tr><td colSpan={10} className="p-8 text-center text-sm text-muted-foreground">No shipments match your filters.</td></tr>
              )}
            </tbody>
          </table>
        </DataTableContainer>
      </Fade>

      {sortedShipments.length > PAGE_SIZE && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, sortedShipments.length)} of {sortedShipments.length}
          </p>
          <div className="flex items-center gap-1">
            <Button size="sm" variant="outline" className="h-8" disabled={safePage <= 1} onClick={() => setCurrentPage(p => p - 1)} data-testid="btn-prev-page">Previous</Button>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              let page: number;
              if (totalPages <= 7) page = i + 1;
              else if (safePage <= 4) page = i + 1;
              else if (safePage >= totalPages - 3) page = totalPages - 6 + i;
              else page = safePage - 3 + i;
              return (
                <Button key={page} size="sm" variant={page === safePage ? "default" : "outline"} className="h-8 w-8 p-0" style={page === safePage ? { background: FAIRE_COLOR } : {}} onClick={() => setCurrentPage(page)} data-testid={`btn-page-${page}`}>{page}</Button>
              );
            })}
            <Button size="sm" variant="outline" className="h-8" disabled={safePage >= totalPages} onClick={() => setCurrentPage(p => p + 1)} data-testid="btn-next-page">Next</Button>
          </div>
        </div>
      )}

      <SopModal open={sopOpen} onOpenChange={setSopOpen} config={SOP_REGISTRY["faire-shipments"].sop} color={FAIRE_COLOR} />
      <TutorialModal open={tutorialOpen} onOpenChange={setTutorialOpen} config={SOP_REGISTRY["faire-shipments"].tutorial} color={FAIRE_COLOR} />
    </PageShell>
  );
}
