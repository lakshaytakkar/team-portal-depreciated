import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Pencil, Package, RefreshCw, Building2 } from "lucide-react";
import { Fade } from "@/components/ui/animated";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { DualCurrency, formatUSD, formatINR } from "@/lib/faire-currency";
import { apiRequest } from "@/lib/queryClient";
import {
  PageShell,
  PageHeader,
  IndexToolbar,
  DataTableContainer,
  DataTH,
  SortableDataTH,
  DataTD,
  DataTR,
  DetailModal,
} from "@/components/layout";
import { FAIRE_COLOR } from "@/lib/faire-config";


type ProductLifecycleState = "PUBLISHED" | "DRAFT" | "UNPUBLISHED" | "DELETED";
type ProductSaleState = "FOR_SALE" | "SALES_PAUSED";

interface FaireStore { id: string; name: string; active: boolean; last_synced_at: string | null }
interface ProductVariant {
  id: string;
  sku?: string;
  wholesale_price_cents: number;
  retail_price_cents: number;
  available_quantity: number;
  options?: { name: string; value: string }[];
}
interface FaireProduct {
  id: string;
  name: string;
  lifecycle_state: ProductLifecycleState;
  sale_state: ProductSaleState;
  taxonomy_type?: { id: string; name: string };
  variants: ProductVariant[];
  reviews?: { rating: number }[];
  minimum_order_quantity?: number;
  unit_multiplier?: number;
  thumb_url?: string | null;
  _storeId: string;
}

const lifecycleColors: Record<ProductLifecycleState, { bg: string; text: string }> = {
  PUBLISHED: { bg: "#ECFDF5", text: "#059669" },
  DRAFT: { bg: "#EFF6FF", text: "#2563EB" },
  UNPUBLISHED: { bg: "#F9FAFB", text: "#6B7280" },
  DELETED: { bg: "#FEF2F2", text: "#DC2626" },
};
const lifecycleLabels: Record<ProductLifecycleState, string> = {
  PUBLISHED: "Published", DRAFT: "Draft", UNPUBLISHED: "Unpublished", DELETED: "Deleted",
};
const saleColors: Record<ProductSaleState, { bg: string; text: string }> = {
  FOR_SALE: { bg: "#ECFDF5", text: "#059669" },
  SALES_PAUSED: { bg: "#FFF7ED", text: "#EA580C" },
};
const categoryColors: Record<string, string> = {
  "Textiles": "#8B5CF6",
  "Candles & Home Fragrance": "#F59E0B",
  "Kitchen & Dining": "#10B981",
  "Stationery & Office": "#3B82F6",
  "Wall Art & Decor": "#EF4444",
  "Bath & Body": "#EC4899",
  "Skincare": "#F472B6",
  "Food & Beverage": "#84CC16",
};

export default function FaireProducts() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedStore, setSelectedStore] = useState("all");
  const [lifecycle, setLifecycle] = useState<"all" | ProductLifecycleState>("all");
  const [saleState, setSaleState] = useState<"all" | ProductSaleState>("all");
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sort, setSort] = useState<{ key: string; dir: "asc" | "desc" } | null>(null);
  const PAGE_SIZE = 50;
  const [assignModal, setAssignModal] = useState<{ productId: string; productName: string } | null>(null);
  const [assignVendorId, setAssignVendorId] = useState("");
  const [assignExclusive, setAssignExclusive] = useState(false);
  const [productVendors, setProductVendors] = useState<Record<string, string>>({});

  const { data: storesData } = useQuery<{ stores: FaireStore[] }>({
    queryKey: ["/api/faire/stores"],
  });
  const stores = storesData?.stores ?? [];

  const { data: vendorsData } = useQuery<{ vendors: { id: string; name: string; is_default: boolean }[] }>({
    queryKey: ["/api/faire/vendors"],
    queryFn: async () => {
      const res = await fetch("/api/faire/vendors");
      if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`);
      return res.json();
    },
  });
  const vendors = vendorsData?.vendors ?? [];

  const { data: productsData, isLoading: productsLoading } = useQuery<{ products: FaireProduct[] }>({
    queryKey: ["/api/faire/products?slim"],
    queryFn: async () => {
      const res = await fetch("/api/faire/products?slim", { headers: { "Cache-Control": "no-cache" } });
      if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`);
      return res.json();
    },
  });

  const rawProducts = productsData?.products ?? [];
  const allProducts = selectedStore === "all"
    ? rawProducts
    : rawProducts.filter(p => p._storeId === selectedStore);

  const filtered = allProducts.filter(p => {
    if (lifecycle !== "all" && p.lifecycle_state !== lifecycle) return false;
    if (saleState !== "all" && p.sale_state !== saleState) return false;
    if (search) {
      const q = search.toLowerCase();
      const nameMatch = (p.name ?? "").toLowerCase().includes(q);
      const skuMatch = (p.variants ?? []).some(v => (v.sku ?? "").toLowerCase().includes(q));
      if (!nameMatch && !skuMatch) return false;
    }
    return true;
  });

  const handleSort = (key: string) => {
    setSort((prev) => {
      if (!prev || prev.key !== key) return { key, dir: "asc" };
      if (prev.dir === "asc") return { key, dir: "desc" };
      return null;
    });
  };

  const sortedFiltered = [...filtered].sort((a, b) => {
    if (!sort) return 0;
    const { key, dir } = sort;
    let aVal: any, bVal: any;
    switch (key) {
      case "name":
        aVal = (a.name ?? "").toLowerCase();
        bVal = (b.name ?? "").toLowerCase();
        break;
      case "sku":
        aVal = (a.variants?.[0]?.sku ?? "").toLowerCase();
        bVal = (b.variants?.[0]?.sku ?? "").toLowerCase();
        break;
      case "store":
        aVal = storeName(a._storeId).toLowerCase();
        bVal = storeName(b._storeId).toLowerCase();
        break;
      case "wholesale":
        aVal = Math.min(...(a.variants ?? []).map(v => v.wholesale_price_cents ?? 0).filter(Boolean), Infinity);
        bVal = Math.min(...(b.variants ?? []).map(v => v.wholesale_price_cents ?? 0).filter(Boolean), Infinity);
        break;
      case "retail":
        aVal = Math.min(...(a.variants ?? []).map(v => v.retail_price_cents ?? 0).filter(Boolean), Infinity);
        bVal = Math.min(...(b.variants ?? []).map(v => v.retail_price_cents ?? 0).filter(Boolean), Infinity);
        break;
      case "moq":
        aVal = a.minimum_order_quantity ?? 1;
        bVal = b.minimum_order_quantity ?? 1;
        break;
      case "state":
        aVal = a.lifecycle_state;
        bVal = b.lifecycle_state;
        break;
      default:
        return 0;
    }
    if (aVal < bVal) return dir === "asc" ? -1 : 1;
    if (aVal > bVal) return dir === "asc" ? 1 : -1;
    return 0;
  });

  const totalPages = Math.max(1, Math.ceil(sortedFiltered.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedProducts = sortedFiltered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const [settingInventory, setSettingInventory] = useState(false);

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
        queryClient.invalidateQueries({ queryKey: [`/api/faire/stores/${selectedStore}/products`] });
        queryClient.invalidateQueries({ queryKey: ["/api/faire/products"] });
        queryClient.invalidateQueries({ queryKey: ["/api/faire/products?slim"] });
        queryClient.invalidateQueries({ queryKey: ["/api/faire/stores"] });
        toast({ title: "Sync Complete", description: `${data.products_synced} products · ${data.orders_synced} orders synced` });
      } else {
        toast({ title: "Sync Failed", description: data.error ?? "Unknown error", variant: "destructive" });
      }
    } catch {
      toast({ title: "Network error", description: "Could not reach server", variant: "destructive" });
    } finally {
      setSyncing(false);
    }
  };

  const handleSetInventory = async () => {
    if (selectedStore === "all") {
      toast({ title: "Select a store", description: "Please select a specific store first.", variant: "destructive" });
      return;
    }
    setSettingInventory(true);
    try {
      const res = await apiRequest("POST", `/api/faire/stores/${selectedStore}/set-inventory`, { quantity: 10000 });
      const data = await res.json() as { success: boolean; updated: number; failed: number; error?: string };
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: [`/api/faire/stores/${selectedStore}/products`] });
        queryClient.invalidateQueries({ queryKey: ["/api/faire/products"] });
        queryClient.invalidateQueries({ queryKey: ["/api/faire/products?slim"] });
        toast({ title: "Inventory Updated", description: `${data.updated} variants set to 10,000 · ${data.failed} failed` });
      } else {
        toast({ title: "Failed", description: data.error ?? "Unknown error", variant: "destructive" });
      }
    } catch {
      toast({ title: "Network error", description: "Could not reach server", variant: "destructive" });
    } finally {
      setSettingInventory(false);
    }
  };

  const storeName = (storeId: string) => stores.find(s => s.id === storeId)?.name ?? storeId;

  async function openAssign(productId: string, productName: string) {
    setAssignModal({ productId, productName });
    setAssignVendorId(productVendors[productId] ?? "");
    setAssignExclusive(false);
    try {
      const res = await fetch(`/api/faire/products/${productId}/vendors`);
      const data = await res.json();
      if (data.vendors?.length > 0) {
        setAssignVendorId(data.vendors[0].vendor_id);
        setAssignExclusive(data.vendors[0].is_exclusive ?? false);
      }
    } catch { /* silently ignore */ }
  }

  async function confirmAssign() {
    if (!assignModal) return;
    if (!assignVendorId) {
      toast({ title: "Select a vendor", variant: "destructive" });
      return;
    }
    try {
      await apiRequest("POST", `/api/faire/products/${assignModal.productId}/vendors`, { vendor_id: assignVendorId, is_exclusive: assignExclusive });
      const vendorName = vendors.find(v => v.id === assignVendorId)?.name ?? "";
      setProductVendors(prev => ({ ...prev, [assignModal.productId]: vendorName }));
      toast({ title: "Vendor assigned", description: `${vendorName} assigned to ${assignModal.productName}` });
      setAssignModal(null);
    } catch {
      toast({ title: "Failed to assign vendor", variant: "destructive" });
    }
  }

  if (productsLoading) {
    return (
      <PageShell>
        <div className="h-10 bg-muted rounded w-64 animate-pulse" />
        <div className="h-12 bg-muted rounded animate-pulse" />
        <div className="h-80 bg-muted rounded-xl animate-pulse" />
      </PageShell>
    );
  }

  return (
    <PageShell>
      <Fade>
        <PageHeader
          title="Product Catalog"
          subtitle={`${filtered.length} products${selectedStore !== "all" ? ` · ${storeName(selectedStore)}` : " across all stores"}`}
          actions={
            <div className="flex items-center gap-2">
              <select
                value={selectedStore}
                onChange={e => { setSelectedStore(e.target.value); setCurrentPage(1); }}
                className="h-9 text-sm border rounded-lg px-3 bg-background"
                data-testid="select-store-filter"
              >
                <option value="all">All Stores</option>
                {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              <Button
                size="sm"
                variant="outline"
                className="h-9"
                onClick={handleSetInventory}
                disabled={settingInventory || selectedStore === "all"}
                data-testid="btn-set-inventory"
              >
                <Package size={14} className={`mr-2 ${settingInventory ? "animate-spin" : ""}`} />
                {settingInventory ? "Updating…" : "Set Qty 10K"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-9"
                onClick={handleSync}
                disabled={syncing || selectedStore === "all"}
                data-testid="btn-sync-products"
              >
                <RefreshCw size={14} className={`mr-2 ${syncing ? "animate-spin" : ""}`} />
                Sync
              </Button>
              <Button onClick={() => toast({ title: "Add Product", description: "Product creation form coming soon." })} style={{ background: FAIRE_COLOR }} className="text-white hover-elevate" data-testid="btn-add-product">
                <Plus size={16} className="mr-2" /> Add Product
              </Button>
            </div>
          }
        />
      </Fade>

      <Fade>
        <IndexToolbar
          search={search}
          onSearch={(v) => { setSearch(v); setCurrentPage(1); }}
          placeholder="Search products or SKU..."
          color={FAIRE_COLOR}
          filters={[
            { value: "all", label: "All Lifecycle" },
            { value: "PUBLISHED", label: "Published" },
            { value: "DRAFT", label: "Draft" },
            { value: "UNPUBLISHED", label: "Unpublished" },
            { value: "DELETED", label: "Deleted" },
          ]}
          activeFilter={lifecycle}
          onFilter={(v) => { setLifecycle(v as any); setCurrentPage(1); }}
          extra={
            <div className="flex gap-1 ml-auto">
              {(["all", "FOR_SALE", "SALES_PAUSED"] as const).map(s => (
                <button
                  key={s}
                  onClick={() => { setSaleState(s); setCurrentPage(1); }}
                  className={`px-3 py-1 text-xs rounded-full border transition-colors ${saleState === s ? "text-white border-transparent" : "bg-background hover:bg-muted"}`}
                  style={saleState === s ? { background: FAIRE_COLOR } : {}}
                  data-testid={`filter-sale-${s}`}
                >
                  {s === "all" ? "All Sales" : s === "FOR_SALE" ? "For Sale" : "Paused"}
                </button>
              ))}
            </div>
          }
        />
      </Fade>

      <Fade>
        <DataTableContainer>
          <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <SortableDataTH sortKey="name" currentSort={sort} onSort={handleSort}>Product</SortableDataTH>
                  <SortableDataTH sortKey="sku" currentSort={sort} onSort={handleSort}>SKU</SortableDataTH>
                  <SortableDataTH sortKey="store" currentSort={sort} onSort={handleSort}>Store</SortableDataTH>
                  <DataTH align="center">Variants</DataTH>
                  <SortableDataTH sortKey="wholesale" currentSort={sort} onSort={handleSort}>Wholesale</SortableDataTH>
                  <SortableDataTH sortKey="retail" currentSort={sort} onSort={handleSort}>Retail</SortableDataTH>
                  <SortableDataTH sortKey="moq" currentSort={sort} onSort={handleSort}>MOQ / Case</SortableDataTH>
                  <SortableDataTH sortKey="state" currentSort={sort} onSort={handleSort}>State</SortableDataTH>
                  <DataTH>Vendor</DataTH>
                  <DataTH align="right">Actions</DataTH>
                </tr>
              </thead>
              <tbody className="divide-y">
                {paginatedProducts.map(product => {
                  const category = product.taxonomy_type?.name ?? "Uncategorized";
                  const catColor = categoryColors[category] || "#6B7280";
                  const lc = lifecycleColors[product.lifecycle_state] ?? lifecycleColors.DRAFT;
                  const sc = saleColors[product.sale_state] ?? saleColors.SALES_PAUSED;
                  const variants = product.variants ?? [];
                  const wholesalePrices = variants.map(v => v.wholesale_price_cents ?? 0).filter(Boolean);
                  const retailPrices = variants.map(v => v.retail_price_cents ?? 0).filter(Boolean);
                  const wMin = wholesalePrices.length ? Math.min(...wholesalePrices) : 0;
                  const wMax = wholesalePrices.length ? Math.max(...wholesalePrices) : 0;
                  const rMin = retailPrices.length ? Math.min(...retailPrices) : 0;
                  const rMax = retailPrices.length ? Math.max(...retailPrices) : 0;
                  const moq = product.minimum_order_quantity ?? 1;
                  const caseSize = product.unit_multiplier ?? 1;
                  return (
                    <DataTR key={product.id} onClick={() => setLocation(`/faire/products/${product.id}`)} data-testid={`product-row-${product.id}`}>
                      <DataTD>
                        <div className="flex items-center gap-3">
                          {product.thumb_url ? (
                            <img
                              src={product.thumb_url}
                              alt={product.name}
                              className="size-9 rounded-lg object-cover shrink-0 shadow-sm"
                              loading="lazy"
                              data-testid={`img-product-${product.id}`}
                            />
                          ) : (
                            <div className="size-9 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm" style={{ background: catColor }}>
                              {category.charAt(0)}
                            </div>
                          )}
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider">{category}</p>
                          </div>
                        </div>
                      </DataTD>
                      <DataTD>
                        <div className="text-muted-foreground">
                          {variants.length === 1 ? (variants[0].sku || "—") : (
                            <span title={variants.map(v => v.sku).filter(Boolean).join(", ")}>
                              {variants[0]?.sku || "—"}
                              {variants.length > 1 && <span className="text-xs text-muted-foreground/60 ml-1">+{variants.length - 1}</span>}
                            </span>
                          )}
                        </div>
                      </DataTD>
                      <DataTD><Badge variant="outline" className="text-xs">{storeName(product._storeId).split(" ")[0]}</Badge></DataTD>
                      <DataTD align="center" className="font-medium">{variants.length}</DataTD>
                      <DataTD className="font-semibold">
                        {wMin === 0 ? "—" : wMin === wMax ? (
                          <DualCurrency cents={wMin} />
                        ) : (
                          <span>
                            {`$${(wMin / 100).toFixed(0)}–$${(wMax / 100).toFixed(0)}`}
                            <span className="block text-xs text-muted-foreground/70 font-normal">{formatINR(wMin)}–{formatINR(wMax)}</span>
                          </span>
                        )}
                      </DataTD>
                      <DataTD className="font-semibold">
                        {rMin === 0 ? "—" : rMin === rMax ? (
                          <DualCurrency cents={rMin} />
                        ) : (
                          <span>
                            {`$${(rMin / 100).toFixed(0)}–$${(rMax / 100).toFixed(0)}`}
                            <span className="block text-xs text-muted-foreground/70 font-normal">{formatINR(rMin)}–{formatINR(rMax)}</span>
                          </span>
                        )}
                      </DataTD>
                      <DataTD>
                        <div>
                          <span className="font-medium">{moq}</span>
                          <span className="text-muted-foreground"> / </span>
                          <span className="font-medium">{caseSize}</span>
                        </div>
                      </DataTD>
                      <DataTD>
                        <div className="flex flex-col gap-1">
                          <span className="text-xs px-1.5 py-0.5 rounded font-medium uppercase tracking-tighter" style={{ background: lc.bg, color: lc.text }}>{lifecycleLabels[product.lifecycle_state] ?? product.lifecycle_state}</span>
                          <span className="text-xs px-1.5 py-0.5 rounded font-medium uppercase tracking-tighter" style={{ background: sc.bg, color: sc.text }}>{product.sale_state === "FOR_SALE" ? "For Sale" : "Paused"}</span>
                        </div>
                      </DataTD>
                      <DataTD onClick={e => e.stopPropagation()}>
                        {productVendors[product.id] ? (
                          <button
                            onClick={() => openAssign(product.id, product.name)}
                            className="flex items-center gap-1 text-xs text-primary hover:underline"
                            data-testid={`btn-vendor-${product.id}`}
                          >
                            <Building2 size={11} />
                            {productVendors[product.id]}
                          </button>
                        ) : (
                          <button
                            onClick={() => openAssign(product.id, product.name)}
                            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 hover:underline"
                            data-testid={`btn-assign-vendor-${product.id}`}
                          >
                            <Building2 size={11} />
                            {vendors.find(v => v.is_default)?.name ? `Default` : "Assign"}
                          </button>
                        )}
                      </DataTD>
                      <DataTD align="right" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => setLocation(`/faire/products/${product.id}`)} data-testid={`btn-view-product-${product.id}`}><Pencil size={14} /></Button>
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-500 hover:text-red-600" onClick={() => setDeleteId(product.id)} data-testid={`btn-delete-product-${product.id}`}><Trash2 size={14} /></Button>
                        </div>
                      </DataTD>
                    </DataTR>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={10} className="p-8 text-center text-sm text-muted-foreground font-medium">
                      {allProducts.length === 0
                        ? "No products synced yet. Select a store and click Sync."
                        : "No products match your filters."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
        </DataTableContainer>
      </Fade>

      {filtered.length > PAGE_SIZE && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground" data-testid="text-pagination-info">
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

      {/* Vendor Assignment Modal */}
      <DetailModal
        open={!!assignModal}
        onClose={() => setAssignModal(null)}
        title="Assign Vendor"
        subtitle={`Select a supplier for: ${assignModal?.productName ?? ""}`}
        footer={
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setAssignModal(null)}>Cancel</Button>
            <Button onClick={confirmAssign} style={{ background: FAIRE_COLOR }} className="text-white" data-testid="btn-confirm-assign-vendor">
              Assign Vendor
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <Label className="mb-2 block">Vendor</Label>
            {vendors.length === 0 ? (
              <p className="text-sm text-muted-foreground">No vendors available. Add vendors first from the Vendors page.</p>
            ) : (
              <div className="space-y-2">
                {vendors.map(v => (
                  <label key={v.id} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors hover:bg-muted/50 ${assignVendorId === v.id ? "border-primary bg-primary/5" : ""}`}>
                    <input
                      type="radio"
                      name="vendor"
                      value={v.id}
                      checked={assignVendorId === v.id}
                      onChange={() => setAssignVendorId(v.id)}
                      className="w-4 h-4"
                      data-testid={`radio-vendor-${v.id}`}
                    />
                    <div>
                      <p className="text-sm font-medium">{v.name}</p>
                      {v.is_default && <span className="text-xs text-amber-600 font-semibold">DEFAULT</span>}
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>
          {vendors.length > 0 && (
            <label className="flex items-center gap-2 cursor-pointer select-none" data-testid="checkbox-exclusive">
              <input type="checkbox" checked={assignExclusive} onChange={e => setAssignExclusive(e.target.checked)} className="w-4 h-4 rounded" />
              <div>
                <p className="text-sm font-medium">Exclusive assignment</p>
                <p className="text-xs text-muted-foreground">Only this vendor can quote for this product</p>
              </div>
            </label>
          )}
        </div>
      </DetailModal>

      <DetailModal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Delete Product"
        subtitle="This action cannot be undone"
        footer={
          <>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => { toast({ title: "Product Deleted" }); setDeleteId(null); }} data-testid="btn-confirm-delete">Delete Product</Button>
          </>
        }
      >
        <div className="px-6 py-5">
          <p className="text-sm text-muted-foreground font-medium">Are you sure you want to delete this product? This will remove the product and all its variants from your Faire store permanently.</p>
        </div>
      </DetailModal>
    </PageShell>
  );
}
