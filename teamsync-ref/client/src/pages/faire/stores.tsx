import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { RefreshCw, CheckCircle2, AlertTriangle, Clock, Eye } from "lucide-react";
import { SopModal, TutorialModal, SopTutorialButtons } from "@/components/sop/sop-modal";
import { SOP_REGISTRY } from "@/lib/sop-data";
import { Fade } from "@/components/ui/animated";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatUSD, formatINR, DualCurrency } from "@/lib/faire-currency";
import {
  PageShell,
  PageHeader,
  IndexToolbar,
  DataTableContainer,
  DataTH,
  DataTD,
  DataTR,
} from "@/components/layout";
import { FAIRE_COLOR } from "@/lib/faire-config";

import buddhaAyurvedaLogo from "@/assets/store-logos/buddha-ayurveda.png";
import buddhaYogaLogo from "@/assets/store-logos/buddha-yoga.png";
import gulleeGadgetsLogo from "@/assets/store-logos/gullee-gadgets.png";
import holidayFarmLogo from "@/assets/store-logos/holiday-farm.png";
import superSantaLogo from "@/assets/store-logos/super-santa.png";
import toyarinaLogo from "@/assets/store-logos/toyarina.png";


const STORE_LOGOS: Record<string, string> = {
  "Buddha Ayurveda": buddhaAyurvedaLogo,
  "Buddha Yoga": buddhaYogaLogo,
  "Gullee Gadgets": gulleeGadgetsLogo,
  "Holiday Farm": holidayFarmLogo,
  "Super Santa": superSantaLogo,
  "Toyarina": toyarinaLogo,
};

const STORE_CATEGORIES: Record<string, string> = {
  "Buddha Ayurveda": "Ayurvedic & Wellness Products",
  "Buddha Yoga": "Yoga & Meditation Supplies",
  "Gullee Gadgets": "Electronics & Tech Gadgets",
  "Holiday Farm": "Seasonal & Holiday Decor",
  "Super Santa": "Holiday Toys & Gifts",
  "Toyarina": "Children's Toys & Plush",
};

interface FaireStore {
  id: string;
  name: string;
  active: boolean;
  last_synced_at: string | null;
}

interface StoreSummary {
  total_orders: number;
  total_revenue_cents: number;
  unique_retailers: number;
  orders_new: number;
  orders_processing: number;
  orders_in_transit: number;
  orders_delivered: number;
  orders_canceled: number;
  total_products: number;
  avg_order_value_cents: number;
  last_order_at: string | null;
}

interface StoresWithSummary {
  stores: FaireStore[];
  summary: Record<string, StoreSummary>;
}

interface SyncResult {
  success: boolean;
  orders_synced: number;
  products_synced: number;
  profile_synced: boolean;
  error?: string;
}

function getLastSyncLabel(ts: string | null): string {
  if (!ts) return "Never synced";
  const diff = Math.round((Date.now() - new Date(ts).getTime()) / 60000);
  if (diff < 2) return "Just now";
  if (diff < 60) return `${diff} min ago`;
  if (diff < 1440) return `${Math.round(diff / 60)}h ago`;
  return `${Math.round(diff / 1440)}d ago`;
}

const PAGE_SIZE = 25;

export default function FaireStores() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sopOpen, setSopOpen] = useState(false);
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const { data, isLoading } = useQuery<StoresWithSummary>({
    queryKey: ["/api/faire/stores?summary"],
  });

  const stores = data?.stores ?? [];
  const summaries = data?.summary ?? {};

  const syncMutation = useMutation({
    mutationFn: async (storeId: string) => {
      const res = await apiRequest("POST", `/api/faire/stores/${storeId}/sync`);
      return res.json() as Promise<SyncResult>;
    },
    onSuccess: (data, storeId) => {
      queryClient.invalidateQueries({ queryKey: ["/api/faire/stores?summary"] });
      queryClient.invalidateQueries({ queryKey: ["/api/faire/stores"] });
      queryClient.invalidateQueries({ queryKey: ["/api/faire/stores", storeId, "counts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/faire/stores", storeId, "orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/faire/stores", storeId, "products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/faire/products?slim"] });
      setSyncingId(null);
      if (data.success) {
        toast({
          title: "Sync Complete",
          description: `${data.orders_synced} orders · ${data.products_synced} products synced`,
        });
      } else {
        toast({ title: "Sync Failed", description: data.error ?? "Unknown error", variant: "destructive" });
      }
    },
    onError: () => {
      setSyncingId(null);
      toast({ title: "Sync Error", description: "Could not reach server", variant: "destructive" });
    },
  });

  const handleSync = (store: FaireStore) => {
    setSyncingId(store.id);
    syncMutation.mutate(store.id);
  };

  if (isLoading) {
    return (
      <PageShell>
        <div className="h-10 bg-muted rounded w-64 animate-pulse" />
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => <div key={i} className="h-20 bg-muted rounded-xl animate-pulse" />)}
        </div>
      </PageShell>
    );
  }

  const filtered = stores.filter(s => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.id.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedStores = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const activeCount = stores.filter(s => s.active).length;
  const syncedCount = stores.filter(s => s.last_synced_at).length;

  return (
    <PageShell>
      <Fade>
        <PageHeader
          title="Faire Stores"
          subtitle={`${stores.length} brand accounts · ${activeCount} connected · ${syncedCount} synced`}
          actions={
            <div className="flex items-center gap-2">
              <SopTutorialButtons onSopClick={() => setSopOpen(true)} onTutorialClick={() => setTutorialOpen(true)} />
              <Button
                size="sm"
                variant="outline"
                className="h-9"
                onClick={() => {
                  stores.filter(s => s.active).forEach(s => handleSync(s));
                }}
                disabled={!!syncingId}
                data-testid="btn-sync-all"
              >
                <RefreshCw size={14} className={`mr-2 ${syncingId ? "animate-spin" : ""}`} />
                Sync All
              </Button>
            </div>
          }
        />
      </Fade>

      <Fade>
        <IndexToolbar
          search={search}
          onSearch={(v) => { setSearch(v); setCurrentPage(1); }}
          placeholder="Search stores..."
          color={FAIRE_COLOR}
        />
      </Fade>

      <Fade>
        <DataTableContainer>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <DataTH>Store</DataTH>
                <DataTH>Category</DataTH>
                <DataTH>Revenue</DataTH>
                <DataTH>Orders</DataTH>
                <DataTH>Products</DataTH>
                <DataTH>Retailers</DataTH>
                <DataTH>Status</DataTH>
                <DataTH>Last Synced</DataTH>
                <DataTH align="right">Actions</DataTH>
              </tr>
            </thead>
            <tbody className="divide-y">
              {paginatedStores.map(store => {
                const isSyncing = syncingId === store.id;
                const logo = STORE_LOGOS[store.name];
                const category = STORE_CATEGORIES[store.name] ?? "General Merchandise";
                const s = summaries[store.id];
                return (
                  <DataTR key={store.id} onClick={() => setLocation(`/faire/orders?store=${store.id}`)} data-testid={`store-row-${store.id}`}>
                    <DataTD>
                      <div className="flex items-center gap-3">
                        {logo ? (
                          <img
                            src={logo}
                            alt={store.name}
                            className="size-12 rounded-xl object-cover shrink-0 shadow-sm border border-muted"
                            data-testid={`img-store-${store.id}`}
                          />
                        ) : (
                          <div
                            className="size-12 rounded-xl flex items-center justify-center text-white text-lg font-bold shrink-0 shadow-sm"
                            style={{ background: FAIRE_COLOR }}
                          >
                            {store.name.charAt(0)}
                          </div>
                        )}
                        <p className="font-semibold text-sm" data-testid={`text-store-name-${store.id}`}>{store.name}</p>
                      </div>
                    </DataTD>
                    <DataTD>
                      <span className="text-xs text-muted-foreground">{category}</span>
                    </DataTD>
                    <DataTD>
                      {s && s.total_revenue_cents > 0 ? (
                        <div className="font-semibold text-sm">
                          <DualCurrency cents={s.total_revenue_cents} />
                        </div>
                      ) : <span className="text-muted-foreground text-xs">—</span>}
                    </DataTD>
                    <DataTD>
                      <span className="font-semibold text-sm" data-testid={`text-orders-${store.id}`}>{s?.total_orders ?? 0}</span>
                    </DataTD>
                    <DataTD>
                      <span className="font-semibold text-sm" data-testid={`text-products-${store.id}`}>{s?.total_products ?? 0}</span>
                    </DataTD>
                    <DataTD>
                      <span className="font-semibold text-sm" data-testid={`text-retailers-${store.id}`}>{s?.unique_retailers ?? 0}</span>
                    </DataTD>
                    <DataTD>
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium ${store.active ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 text-emerald-600" : "bg-gray-50 dark:bg-gray-900/20 border-gray-200 text-gray-500"}`}>
                        {store.active ? <CheckCircle2 size={11} /> : <AlertTriangle size={11} />}
                        {store.active ? "Connected" : "Inactive"}
                      </div>
                    </DataTD>
                    <DataTD>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock size={11} />
                        {getLastSyncLabel(store.last_synced_at)}
                      </div>
                    </DataTD>
                    <DataTD align="right" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0"
                          onClick={() => setLocation(`/faire/orders?store=${store.id}`)}
                          data-testid={`btn-view-orders-${store.id}`}
                        >
                          <Eye size={14} />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0"
                          onClick={() => handleSync(store)}
                          disabled={isSyncing || !store.active}
                          data-testid={`btn-sync-${store.id}`}
                        >
                          <RefreshCw size={14} className={isSyncing ? "animate-spin" : ""} />
                        </Button>
                      </div>
                    </DataTD>
                  </DataTR>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-sm text-muted-foreground">
                    {stores.length === 0
                      ? "No stores configured. Add a Faire brand account to get started."
                      : "No stores match your search."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </DataTableContainer>
      </Fade>

      {filtered.length > PAGE_SIZE && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)} of {filtered.length}
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

      <SopModal open={sopOpen} onOpenChange={setSopOpen} config={SOP_REGISTRY["faire-stores"].sop} color={FAIRE_COLOR} />
      <TutorialModal open={tutorialOpen} onOpenChange={setTutorialOpen} config={SOP_REGISTRY["faire-stores"].tutorial} color={FAIRE_COLOR} />
    </PageShell>
  );
}
