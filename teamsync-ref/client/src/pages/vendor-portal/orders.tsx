import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { Package, ShoppingCart, Truck, CheckCircle2, XCircle, Clock, Search, Eye } from "lucide-react";
import { Fade } from "@/components/ui/animated";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import {
  vendorOrders, vendorStores,
  type VendorOrder, type VendorOrderStatus,
} from "@/lib/mock-data-vendor";
import { VENDOR_COLOR, VENDOR_ORDER_STATUS_CONFIG } from "@/lib/vendor-config";
import { SopModal, TutorialModal, SopTutorialButtons } from "@/components/sop/sop-modal";
import { SOP_REGISTRY } from "@/lib/sop-data";
import {
  PageShell, PageHeader, StatGrid, StatCard, IndexToolbar,
  DataTableContainer, DataTH, SortableDataTH, DataTD, DataTR,
} from "@/components/layout";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

const STATUS_ICONS: Record<VendorOrderStatus, typeof Package> = {
  New: Clock,
  Quoted: Package,
  Processing: ShoppingCart,
  Shipped: Truck,
  Delivered: CheckCircle2,
  Cancelled: XCircle,
};

const ALL_STATUSES: VendorOrderStatus[] = ["New", "Quoted", "Processing", "Shipped", "Delivered", "Cancelled"];

export default function VendorOrders() {
  const [, setLocation] = useLocation();
  const [sopOpen, setSopOpen] = useState(false);
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const loading = useSimulatedLoading(500);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<VendorOrderStatus | "all">("all");
  const [storeFilter, setStoreFilter] = useState("all");
  const [sort, setSort] = useState<{ key: string; dir: "asc" | "desc" } | null>(null);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    ALL_STATUSES.forEach(s => { counts[s] = 0; });
    vendorOrders.forEach(o => { counts[o.status] = (counts[o.status] || 0) + 1; });
    return counts;
  }, []);

  const filtered = useMemo(() => {
    let list = [...vendorOrders];
    if (statusFilter !== "all") list = list.filter(o => o.status === statusFilter);
    if (storeFilter !== "all") list = list.filter(o => o.storeId === storeFilter);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(o =>
        o.shopifyOrderNumber.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.storeName.toLowerCase().includes(q)
      );
    }
    return list;
  }, [statusFilter, storeFilter, search]);

  const handleSort = (key: string) => {
    setSort(prev => {
      if (!prev || prev.key !== key) return { key, dir: "asc" };
      if (prev.dir === "asc") return { key, dir: "desc" };
      return null;
    });
  };

  const sortedFiltered = useMemo(() => {
    if (!sort) return filtered;
    return [...filtered].sort((a, b) => {
      const dir = sort.dir === "asc" ? 1 : -1;
      let av: string | number = "";
      let bv: string | number = "";
      switch (sort.key) {
        case "order": av = a.shopifyOrderNumber; bv = b.shopifyOrderNumber; break;
        case "store": av = a.storeName.toLowerCase(); bv = b.storeName.toLowerCase(); break;
        case "customer": av = a.customerName.toLowerCase(); bv = b.customerName.toLowerCase(); break;
        case "items": av = a.items.length; bv = b.items.length; break;
        case "total": av = a.total; bv = b.total; break;
        case "status": av = a.status; bv = b.status; break;
        case "date": av = a.createdAt; bv = b.createdAt; break;
      }
      if (av < bv) return -1 * dir;
      if (av > bv) return 1 * dir;
      return 0;
    });
  }, [filtered, sort]);

  const filterOptions = [
    { value: "all", label: "All Orders" },
    ...ALL_STATUSES.map(s => ({ value: s, label: s })),
  ];

  const uniqueStores = useMemo(() => {
    const storeIds = new Set(vendorOrders.map(o => o.storeId));
    return vendorStores.filter(s => storeIds.has(s.id));
  }, []);

  if (loading) {
    return (
      <PageShell>
        <div className="h-10 bg-muted rounded w-80 animate-pulse" />
        <StatGrid>
          {[...Array(6)].map((_, i) => <div key={i} className="h-24 bg-muted rounded-xl animate-pulse" />)}
        </StatGrid>
        <div className="h-80 bg-muted rounded-xl animate-pulse" />
      </PageShell>
    );
  }

  return (
    <PageShell>
      <Fade>
        <PageHeader
          title="Orders"
          subtitle={`${vendorOrders.length} total orders`}
          actions={
            <div className="flex items-center gap-2 flex-wrap">
              <SopTutorialButtons onSopClick={() => setSopOpen(true)} onTutorialClick={() => setTutorialOpen(true)} />
              <Select value={storeFilter} onValueChange={setStoreFilter}>
                <SelectTrigger className="w-[200px]" data-testid="select-store-filter">
                  <SelectValue placeholder="All Stores" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stores</SelectItem>
                  {uniqueStores.map(s => (
                    <SelectItem key={s.id} value={s.id}>{s.storeName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          }
        />
      </Fade>

      <Fade>
        <StatGrid>
          {ALL_STATUSES.map(status => {
            const cfg = VENDOR_ORDER_STATUS_CONFIG[status.toLowerCase() as keyof typeof VENDOR_ORDER_STATUS_CONFIG];
            const Icon = STATUS_ICONS[status];
            return (
              <StatCard
                key={status}
                label={status}
                value={statusCounts[status]}
                icon={Icon}
                iconBg={cfg?.bg ?? "#f1f5f9"}
                iconColor={cfg?.color ?? "#64748b"}
              />
            );
          })}
        </StatGrid>
      </Fade>

      <Fade>
        <IndexToolbar
          search={search}
          onSearch={setSearch}
          placeholder="Search by order #, customer, or store..."
          color={VENDOR_COLOR}
          filters={filterOptions}
          activeFilter={statusFilter}
          onFilter={(v) => setStatusFilter(v as VendorOrderStatus | "all")}
        />
      </Fade>

      <Fade>
        <DataTableContainer>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <SortableDataTH sortKey="order" currentSort={sort} onSort={handleSort}>Order #</SortableDataTH>
                <SortableDataTH sortKey="store" currentSort={sort} onSort={handleSort}>Store</SortableDataTH>
                <SortableDataTH sortKey="customer" currentSort={sort} onSort={handleSort}>Customer</SortableDataTH>
                <SortableDataTH sortKey="items" currentSort={sort} onSort={handleSort} align="center">Items</SortableDataTH>
                <SortableDataTH sortKey="total" currentSort={sort} onSort={handleSort} align="right">Total</SortableDataTH>
                <SortableDataTH sortKey="status" currentSort={sort} onSort={handleSort}>Status</SortableDataTH>
                <SortableDataTH sortKey="date" currentSort={sort} onSort={handleSort}>Date</SortableDataTH>
                <DataTH align="right">Actions</DataTH>
              </tr>
            </thead>
            <tbody className="divide-y">
              {sortedFiltered.map(order => {
                const cfg = VENDOR_ORDER_STATUS_CONFIG[order.status.toLowerCase() as keyof typeof VENDOR_ORDER_STATUS_CONFIG];
                const firstItemImg = order.items[0]?.imageUrl;
                return (
                  <DataTR
                    key={order.id}
                    onClick={() => setLocation(`/vendor/orders/${order.id}`)}
                    data-testid={`row-order-${order.id}`}
                  >
                    <DataTD>
                      <span className="font-semibold" data-testid={`text-order-number-${order.id}`}>
                        {order.shopifyOrderNumber}
                      </span>
                    </DataTD>
                    <DataTD>
                      <span className="text-muted-foreground" data-testid={`text-store-${order.id}`}>
                        {order.storeName}
                      </span>
                    </DataTD>
                    <DataTD>
                      <div className="flex items-center gap-2">
                        <div>
                          <p className="font-medium text-sm" data-testid={`text-customer-${order.id}`}>{order.customerName}</p>
                          <p className="text-xs text-muted-foreground">
                            {order.shippingAddress.city}, {order.shippingAddress.state}
                          </p>
                        </div>
                      </div>
                    </DataTD>
                    <DataTD align="center">
                      <div className="flex items-center justify-center gap-2">
                        {firstItemImg && (
                          <img
                            src={firstItemImg}
                            alt=""
                            className="w-7 h-7 rounded object-cover"
                            data-testid={`img-product-${order.id}`}
                          />
                        )}
                        <span data-testid={`text-items-count-${order.id}`}>{order.items.length}</span>
                      </div>
                    </DataTD>
                    <DataTD align="right">
                      <span className="font-semibold" data-testid={`text-total-${order.id}`}>
                        ${order.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </DataTD>
                    <DataTD>
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap"
                        style={{ background: cfg?.bg, color: cfg?.color }}
                        data-testid={`badge-status-${order.id}`}
                      >
                        {order.status}
                      </span>
                    </DataTD>
                    <DataTD>
                      <span className="text-muted-foreground text-xs" data-testid={`text-date-${order.id}`}>
                        {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                    </DataTD>
                    <DataTD align="right" onClick={e => e.stopPropagation()}>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setLocation(`/vendor/orders/${order.id}`)}
                        data-testid={`btn-view-order-${order.id}`}
                      >
                        <Eye size={14} />
                      </Button>
                    </DataTD>
                  </DataTR>
                );
              })}
              {sortedFiltered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-sm text-muted-foreground">
                    No orders match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </DataTableContainer>
      </Fade>

      {sortedFiltered.length > 0 && (
        <Fade>
          <p className="text-sm text-muted-foreground" data-testid="text-results-count">
            Showing {sortedFiltered.length} of {vendorOrders.length} orders
          </p>
        </Fade>
      )}
      <SopModal open={sopOpen} onOpenChange={setSopOpen} config={SOP_REGISTRY["vendor-orders"].sop} color={VENDOR_COLOR} />
      <TutorialModal open={tutorialOpen} onOpenChange={setTutorialOpen} config={SOP_REGISTRY["vendor-orders"].tutorial} color={VENDOR_COLOR} />
    </PageShell>
  );
}
