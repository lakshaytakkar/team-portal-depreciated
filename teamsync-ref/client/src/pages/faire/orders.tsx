import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { RefreshCw, CheckCircle, XCircle, Eye, ShoppingCart, FileText, Plus } from "lucide-react";
import { SopModal, TutorialModal, SopTutorialButtons } from "@/components/sop/sop-modal";
import { SOP_REGISTRY } from "@/lib/sop-data";

import { Fade } from "@/components/ui/animated";
import { CompanyCell } from "@/components/ui/avatar-cells";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  faireQuotations, faireFulfillers, type FaireQuotation,
} from "@/lib/mock-data-faire-ops";
import {
  PageShell, PageHeader, StatGrid, StatCard, IndexToolbar, DataTableContainer,
  DataTH, SortableDataTH, DataTD, DataTR, DetailModal,
} from "@/components/layout";
import { DualCurrency } from "@/lib/faire-currency";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  FAIRE_COLOR,
  type OrderState,
  ORDER_STATE_CONFIG,
  ORDER_STATE_LABELS,
  ALL_ORDER_STATES,
  CANCEL_REASONS,
  SOURCE_LABELS,
  QUOT_STATUS_CONFIG,
} from "@/lib/faire-config";

const PAGE_SIZE = 25;



interface FaireStore { id: string; name: string; active: boolean; last_synced_at: string | null }
interface OrderItem { id: string; variant_id: string; product_id: string; product_name: string; quantity: number; price_cents: number }
interface FaireOrder {
  id: string;
  display_id: string;
  state: OrderState;
  created_at: string;
  retailer_id: string;
  source: string;
  is_free_shipping: boolean;
  items: OrderItem[];
  address?: { name?: string; company_name?: string; city?: string; state?: string };
  payout_costs: { commission_bps: number };
  _storeId: string;
}






function retailerName(order: FaireOrder) {
  return order.address?.company_name || order.address?.name || order.retailer_id;
}

export default function FaireOrders() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedStore, setSelectedStore] = useState("all");
  const [stateFilter, setStateFilter] = useState<OrderState | "all">("all");
  const [search, setSearch] = useState("");
  const [syncing, setSyncing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const [acceptId, setAcceptId] = useState<string | null>(null);
  const [acceptLoading, setAcceptLoading] = useState(false);
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState("REQUESTED_BY_RETAILER");
  const [cancelNotes, setCancelNotes] = useState("");
  const [cancelLoading, setCancelLoading] = useState(false);

  const [sort, setSort] = useState<{ key: string; dir: "asc" | "desc" } | null>(null);
  const [sopOpen, setSopOpen] = useState(false);
  const [tutorialOpen, setTutorialOpen] = useState(false);

  const [quoteOrderId, setQuoteOrderId] = useState<string | null>(null);
  const [quoteFulfillerId, setQuoteFulfillerId] = useState("");
  const [quoteNotes, setQuoteNotes] = useState("");
  const [quotations, setQuotations] = useState(faireQuotations);

  const { data: storesData } = useQuery<{ stores: FaireStore[] }>({
    queryKey: ["/api/faire/stores"],
  });
  const stores = storesData?.stores ?? [];

  const { data: ordersData, isLoading: ordersLoading } = useQuery<{ orders: FaireOrder[] }>({
    queryKey: selectedStore === "all"
      ? ["/api/faire/orders"]
      : [`/api/faire/stores/${selectedStore}/orders`],
  });

  const allOrders = ordersData?.orders ?? [];

  const handleSort = (key: string) => {
    setSort(prev => {
      if (!prev || prev.key !== key) return { key, dir: "asc" };
      if (prev.dir === "asc") return { key, dir: "desc" };
      return null;
    });
  };

  const filtered = allOrders.filter(o => {
    if (stateFilter !== "all" && o.state !== stateFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const displayId = String(o.display_id ?? "").toLowerCase();
      const rName = retailerName(o).toLowerCase();
      if (!displayId.includes(q) && !rName.includes(q)) return false;
    }
    return true;
  });

  const sortedFiltered = sort
    ? [...filtered].sort((a, b) => {
        const dir = sort.dir === "asc" ? 1 : -1;
        let av: string | number = "";
        let bv: string | number = "";
        switch (sort.key) {
          case "date": av = a.created_at; bv = b.created_at; break;
          case "order": av = String(a.display_id ?? a.id); bv = String(b.display_id ?? b.id); break;
          case "retailer": av = retailerName(a).toLowerCase(); bv = retailerName(b).toLowerCase(); break;
          case "store": av = storeName(a._storeId).toLowerCase(); bv = storeName(b._storeId).toLowerCase(); break;
          case "items": av = (a.items ?? []).length; bv = (b.items ?? []).length; break;
          case "total":
            av = (a.items ?? []).reduce((s, i) => s + (i.price_cents ?? 0) * (i.quantity ?? 1), 0);
            bv = (b.items ?? []).reduce((s, i) => s + (i.price_cents ?? 0) * (i.quantity ?? 1), 0);
            break;
          case "state": av = a.state; bv = b.state; break;
        }
        if (av < bv) return -1 * dir;
        if (av > bv) return 1 * dir;
        return 0;
      })
    : filtered;

  const totalPages = Math.max(1, Math.ceil(sortedFiltered.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedOrders = sortedFiltered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const kpiCounts = {
    NEW: allOrders.filter(o => o.state === "NEW").length,
    PROCESSING: allOrders.filter(o => o.state === "PROCESSING").length,
    IN_TRANSIT: allOrders.filter(o => o.state === "IN_TRANSIT").length,
    DELIVERED: allOrders.filter(o => o.state === "DELIVERED").length,
  };

  const handleSync = async () => {
    if (selectedStore === "all") {
      toast({ title: "Select a store", description: "Please select a specific store to sync.", variant: "destructive" });
      return;
    }
    setSyncing(true);
    try {
      const res = await apiRequest("POST", `/api/faire/stores/${selectedStore}/sync`);
      const data = await res.json() as { success: boolean; orders_synced: number; products_synced: number; error?: string };
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ["/api/faire/stores", selectedStore, "orders"] });
        queryClient.invalidateQueries({ queryKey: ["/api/faire/orders"] });
        queryClient.invalidateQueries({ queryKey: ["/api/faire/stores"] });
        toast({ title: "Sync Complete", description: `${data.orders_synced} orders · ${data.products_synced} products synced` });
      } else {
        toast({ title: "Sync Failed", description: data.error ?? "Unknown error", variant: "destructive" });
      }
    } catch {
      toast({ title: "Network error", description: "Could not reach server", variant: "destructive" });
    } finally {
      setSyncing(false);
    }
  };

  async function handleAccept() {
    if (!acceptId) return;
    const order = allOrders.find(o => o.id === acceptId);
    setAcceptLoading(true);
    try {
      const res = await fetch(`/api/faire/orders/${acceptId}/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeId: order?._storeId }),
      });
      const data = await res.json() as { success: boolean; state?: string; mock?: boolean; error?: string };
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ["/api/faire/orders"] });
        queryClient.invalidateQueries({ queryKey: ["/api/faire/stores", order?._storeId, "orders"] });
        toast({ title: "Order Accepted", description: "Moved to Processing" });
      } else {
        toast({ title: "Faire API Error", description: data.error ?? "Unknown error", variant: "destructive" });
      }
    } catch {
      toast({ title: "Network error", description: "Could not reach server", variant: "destructive" });
    } finally {
      setAcceptLoading(false);
      setAcceptId(null);
    }
  }

  async function handleCancel() {
    if (!cancelId) return;
    const order = allOrders.find(o => o.id === cancelId);
    setCancelLoading(true);
    try {
      const res = await fetch(`/api/faire/orders/${cancelId}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeId: order?._storeId, reason: cancelReason }),
      });
      const data = await res.json() as { success: boolean; state?: string; mock?: boolean; error?: string };
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ["/api/faire/orders"] });
        queryClient.invalidateQueries({ queryKey: ["/api/faire/stores", order?._storeId, "orders"] });
        toast({ title: "Order Canceled", description: `Reason: ${CANCEL_REASONS.find(r => r.value === cancelReason)?.label ?? cancelReason}` });
      } else {
        toast({ title: "Faire API Error", description: data.error ?? "Unknown error", variant: "destructive" });
      }
    } catch {
      toast({ title: "Network error", description: "Could not reach server", variant: "destructive" });
    } finally {
      setCancelLoading(false);
      setCancelId(null);
      setCancelNotes("");
    }
  }

  function handleRequestQuote() {
    if (!quoteOrderId || !quoteFulfillerId) {
      toast({ title: "Select an order and fulfiller", variant: "destructive" });
      return;
    }
    const order = allOrders.find(o => o.id === quoteOrderId)!;
    const id = `q_new_${Date.now()}`;
    const newQ: FaireQuotation = {
      id, order_id: quoteOrderId, store_id: order._storeId, fulfiller_id: quoteFulfillerId,
      status: "DRAFT",
      items: (order.items ?? []).map((oi, idx) => ({
        id: `qi_new_${idx}`, quotation_id: id, order_item_id: oi.id,
        variant_id: oi.variant_id, product_id: oi.product_id,
        product_name: oi.product_name, variant_options: [], image_url: "",
        ordered_quantity: oi.quantity, fulfiller_unit_cost_cents: 0,
      })),
      fulfiller_shipping_cost_cents: 0, fulfiller_notes: "", our_notes: quoteNotes,
      lead_days: 0, sent_at: null, received_at: null, accepted_at: null, challenged_at: null,
      created_at: new Date().toISOString(),
    };
    setQuotations(prev => [newQ, ...prev]);
    setQuoteOrderId(null);
    setQuoteFulfillerId("");
    setQuoteNotes("");
    toast({ title: "Quotation created", description: `Draft #${id}` });
    setLocation(`/faire/quotations/${id}`);
  }

  const storeName = (storeId: string) => stores.find(s => s.id === storeId)?.name ?? "Store";

  if (ordersLoading) {
    return (
      <PageShell>
        <div className="h-10 bg-muted rounded w-80 animate-pulse" />
        <StatGrid>
          {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-muted rounded-xl animate-pulse" />)}
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
          subtitle={`${allOrders.length} orders across ${selectedStore === "all" ? "all stores" : storeName(selectedStore)}`}
          actions={
            <div className="flex items-center gap-2">
              <SopTutorialButtons onSopClick={() => setSopOpen(true)} onTutorialClick={() => setTutorialOpen(true)} />
              <Button size="sm" variant="outline" className="h-9" onClick={handleSync} disabled={syncing} data-testid="btn-sync-orders">
                <RefreshCw size={14} className={`mr-2 ${syncing ? "animate-spin" : ""}`} /> Sync
              </Button>
              <select
                value={selectedStore}
                onChange={e => { setSelectedStore(e.target.value); setCurrentPage(1); }}
                className="h-9 text-sm border rounded-lg px-3 bg-background"
                data-testid="select-store"
              >
                <option value="all">All Stores</option>
                {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          }
        />
      </Fade>

      <Fade>
        <StatGrid>
          {[
            { label: "New Orders", value: kpiCounts.NEW, color: "#2563EB", bg: "#EFF6FF" },
            { label: "Processing", value: kpiCounts.PROCESSING, color: "#7C3AED", bg: "#F5F3FF" },
            { label: "In Transit", value: kpiCounts.IN_TRANSIT, color: "#D97706", bg: "#FFFBEB" },
            { label: "Delivered", value: kpiCounts.DELIVERED, color: "#059669", bg: "#ECFDF5" },
          ].map((k, i) => (
            <StatCard key={i} label={k.label} value={k.value} icon={ShoppingCart} iconBg={k.bg} iconColor={k.color} />
          ))}
        </StatGrid>
      </Fade>

      <Fade>
        <IndexToolbar
          search={search}
          onSearch={(v) => { setSearch(v); setCurrentPage(1); }}
          placeholder="Search by order ID or retailer..."
          color={FAIRE_COLOR}
          filters={ALL_ORDER_STATES.map(s => ({ value: s, label: ORDER_STATE_LABELS[s] }))}
          activeFilter={stateFilter}
          onFilter={(v) => { setStateFilter(v as OrderState | "all"); setCurrentPage(1); }}
        />
      </Fade>

      <Fade>
        <DataTableContainer>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <SortableDataTH sortKey="order" currentSort={sort} onSort={handleSort}>Order</SortableDataTH>
                <SortableDataTH sortKey="retailer" currentSort={sort} onSort={handleSort}>Retailer</SortableDataTH>
                <SortableDataTH sortKey="store" currentSort={sort} onSort={handleSort}>Store</SortableDataTH>
                <DataTH>Source</DataTH>
                <SortableDataTH sortKey="items" currentSort={sort} onSort={handleSort} align="center">Items</SortableDataTH>
                <SortableDataTH sortKey="total" currentSort={sort} onSort={handleSort}>Total</SortableDataTH>
                <DataTH>Commission</DataTH>
                <DataTH>Quotation</DataTH>
                <SortableDataTH sortKey="state" currentSort={sort} onSort={handleSort}>Status</SortableDataTH>
                <SortableDataTH sortKey="date" currentSort={sort} onSort={handleSort}>Date</SortableDataTH>
                <DataTH align="right">Actions</DataTH>
              </tr>
            </thead>
            <tbody className="divide-y">
              {paginatedOrders.map(order => {
                const cfg = ORDER_STATE_CONFIG[order.state] ?? ORDER_STATE_CONFIG.CANCELED;
                const items = order.items ?? [];
                const itemsTotal = items.reduce((sum, i) => sum + (i.price_cents ?? 0) * (i.quantity ?? 1), 0);
                const commPct = ((order.payout_costs?.commission_bps ?? 0) / 100).toFixed(0);
                const linkedQuote = quotations.find(q => q.order_id === order.id);
                const qsc = linkedQuote ? QUOT_STATUS_CONFIG[linkedQuote.status] : null;
                const canRequestQuote = !linkedQuote && (order.state === "NEW" || order.state === "PROCESSING");
                return (
                  <DataTR key={order.id} onClick={() => setLocation(`/faire/orders/${order.id}`)} data-testid={`order-row-${order.id}`}>
                    <DataTD>
                      <span className="font-medium">#{order.display_id ?? order.id.slice(-8)}</span>
                    </DataTD>
                    <DataTD>
                      <button
                        className="text-left hover:underline hover:text-primary truncate max-w-[180px] block"
                        onClick={e => { e.stopPropagation(); setLocation(`/faire/retailers/${order.retailer_id}`); }}
                        data-testid={`link-retailer-${order.id}`}
                      >
                        <CompanyCell name={retailerName(order)} size="sm" />
                      </button>
                    </DataTD>
                    <DataTD>
                      <button
                        className="hover:underline hover:text-primary text-muted-foreground"
                        onClick={e => { e.stopPropagation(); setLocation("/faire/stores"); }}
                        data-testid={`link-store-${order.id}`}
                      >
                        <CompanyCell name={storeName(order._storeId)} size="xs" />
                      </button>
                    </DataTD>
                    <DataTD className="text-muted-foreground">
                      {SOURCE_LABELS[order.source] ?? order.source}
                    </DataTD>
                    <DataTD align="center">{items.length}</DataTD>
                    <DataTD className="font-semibold"><DualCurrency cents={itemsTotal} /></DataTD>
                    <DataTD className="text-muted-foreground">{commPct}%</DataTD>
                    <DataTD onClick={e => e.stopPropagation()}>
                      {linkedQuote && qsc ? (
                        <button
                          className="text-xs px-2 py-0.5 rounded-full font-medium hover:opacity-80"
                          style={{ background: qsc.bg, color: qsc.color }}
                          onClick={() => setLocation(`/faire/quotations/${linkedQuote.id}`)}
                          data-testid={`link-quote-${order.id}`}
                        >
                          <FileText size={10} className="inline mr-1" />{qsc.label}
                        </button>
                      ) : canRequestQuote ? (
                        <button
                          className="text-xs px-2 py-0.5 rounded-full font-medium border border-dashed border-muted-foreground/30 text-muted-foreground hover:border-emerald-400 hover:text-emerald-600 flex items-center gap-1"
                          onClick={e => { e.stopPropagation(); setQuoteOrderId(order.id); }}
                          data-testid={`btn-request-quote-${order.id}`}
                        >
                          <Plus size={10} /> Quote
                        </button>
                      ) : (
                        <span className="text-muted-foreground/40">—</span>
                      )}
                    </DataTD>
                    <DataTD>
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: cfg.bg, color: cfg.color }}>
                        {cfg.label}
                      </span>
                    </DataTD>
                    <DataTD className="text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</DataTD>
                    <DataTD align="right" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => setLocation(`/faire/orders/${order.id}`)} data-testid={`btn-view-order-${order.id}`}><Eye size={14} /></Button>
                        {order.state === "NEW" && (
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-emerald-600" onClick={() => setAcceptId(order.id)} data-testid={`btn-accept-order-${order.id}`}><CheckCircle size={14} /></Button>
                        )}
                        {(order.state === "NEW" || order.state === "PROCESSING" || order.state === "PRE_TRANSIT") && (
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-500" onClick={() => setCancelId(order.id)} data-testid={`btn-cancel-order-${order.id}`}><XCircle size={14} /></Button>
                        )}
                      </div>
                    </DataTD>
                  </DataTR>
                );
              })}
              {sortedFiltered.length === 0 && (
                <tr>
                  <td colSpan={11} className="px-4 py-8 text-center text-sm text-muted-foreground">
                    {allOrders.length === 0
                      ? "No orders synced yet. Use Sync to fetch orders from Faire."
                      : "No orders match your filters."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </DataTableContainer>
      </Fade>

      {sortedFiltered.length > PAGE_SIZE && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, sortedFiltered.length)} of {sortedFiltered.length}
          </p>
          <div className="flex items-center gap-1">
            <Button size="sm" variant="outline" className="h-8" disabled={safePage <= 1} onClick={() => setCurrentPage(p => p - 1)} data-testid="btn-prev-page">
              Previous
            </Button>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              let page: number;
              if (totalPages <= 7) page = i + 1;
              else if (safePage <= 4) page = i + 1;
              else if (safePage >= totalPages - 3) page = totalPages - 6 + i;
              else page = safePage - 3 + i;
              return (
                <Button
                  key={page} size="sm"
                  variant={page === safePage ? "default" : "outline"}
                  className="h-8 w-8 p-0"
                  style={page === safePage ? { background: FAIRE_COLOR } : {}}
                  onClick={() => setCurrentPage(page)}
                  data-testid={`btn-page-${page}`}
                >
                  {page}
                </Button>
              );
            })}
            <Button size="sm" variant="outline" className="h-8" disabled={safePage >= totalPages} onClick={() => setCurrentPage(p => p + 1)} data-testid="btn-next-page">
              Next
            </Button>
          </div>
        </div>
      )}

      <DetailModal
        open={!!acceptId}
        onClose={() => setAcceptId(null)}
        title="Accept Order"
        subtitle="This will call the Faire API to move the order to Processing"
        footer={
          <>
            <Button variant="outline" onClick={() => setAcceptId(null)} disabled={acceptLoading}>Cancel</Button>
            <Button
              style={{ background: FAIRE_COLOR }}
              className="text-white hover:opacity-90"
              onClick={handleAccept}
              disabled={acceptLoading}
              data-testid="btn-confirm-accept"
            >
              {acceptLoading ? "Accepting…" : "Accept Order"}
            </Button>
          </>
        }
      >
        <div className="px-6 py-5">
          <p className="text-sm text-muted-foreground">Accepting this order calls the Faire External API to move it to Processing. The retailer will be notified.</p>
        </div>
      </DetailModal>

      <DetailModal
        open={!!cancelId}
        onClose={() => setCancelId(null)}
        title="Cancel Order"
        subtitle="Select a reason for cancellation"
        footer={
          <>
            <Button variant="outline" onClick={() => setCancelId(null)} disabled={cancelLoading}>Back</Button>
            <Button variant="destructive" onClick={handleCancel} disabled={cancelLoading} data-testid="btn-confirm-cancel">
              {cancelLoading ? "Canceling…" : "Cancel Order"}
            </Button>
          </>
        }
      >
        <div className="px-6 py-5 space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Cancellation Reason</Label>
            <select value={cancelReason} onChange={e => setCancelReason(e.target.value)} className="w-full h-10 border rounded-lg px-3 text-sm bg-background" data-testid="select-cancel-reason">
              {CANCEL_REASONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Notes (optional)</Label>
            <Input value={cancelNotes} onChange={e => setCancelNotes(e.target.value)} placeholder="Additional context..." data-testid="input-cancel-notes" />
          </div>
        </div>
      </DetailModal>

      <DetailModal
        open={!!quoteOrderId}
        onClose={() => setQuoteOrderId(null)}
        title="Request Quote"
        subtitle="Create a draft quotation to send to a fulfiller."
        footer={
          <>
            <Button variant="outline" onClick={() => setQuoteOrderId(null)}>Cancel</Button>
            <Button style={{ background: FAIRE_COLOR }} className="text-white" onClick={handleRequestQuote} data-testid="btn-confirm-request-quote">
              Create Draft
            </Button>
          </>
        }
      >
        <div className="space-y-4 px-1">
          <div>
            <Label>Fulfiller</Label>
            <Select value={quoteFulfillerId} onValueChange={setQuoteFulfillerId}>
              <SelectTrigger data-testid="select-quote-fulfiller">
                <SelectValue placeholder="Select fulfiller…" />
              </SelectTrigger>
              <SelectContent>
                {faireFulfillers.map(f => (
                  <SelectItem key={f.id} value={f.id}>{f.name} ({f.country})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Notes</Label>
            <Input value={quoteNotes} onChange={e => setQuoteNotes(e.target.value)} placeholder="Optional notes…" data-testid="input-quote-notes" />
          </div>
        </div>
      </DetailModal>

      <SopModal open={sopOpen} onOpenChange={setSopOpen} config={SOP_REGISTRY["faire-orders"].sop} color={FAIRE_COLOR} />
      <TutorialModal open={tutorialOpen} onOpenChange={setTutorialOpen} config={SOP_REGISTRY["faire-orders"].tutorial} color={FAIRE_COLOR} />
    </PageShell>
  );
}
