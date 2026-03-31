import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Bell, TrendingUp, Package, Users, AlertTriangle, ShoppingCart, DollarSign, Clock } from "lucide-react";
import { CompanyCell } from "@/components/ui/avatar-cells";
import { Stagger, StaggerItem, Fade } from "@/components/ui/animated";
import {
  PageShell,
  HeroBanner,
  StatGrid,
  StatCard,
  SectionCard,
  SectionGrid,
} from "@/components/layout";
import {
  FAIRE_COLOR,
  type OrderState,
  ORDER_STATE_CONFIG,
} from "@/lib/faire-config";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { formatINRFromDollars, DualFromDollars } from "@/lib/faire-currency";




export default function FaireDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedStore, setSelectedStore] = useState("all");

  const { data: storesData, isLoading: storesLoading } = useQuery<{ stores: any[] }>({
    queryKey: ["/api/faire/stores"],
    queryFn: async () => {
      const res = await fetch("/api/faire/stores", { headers: { "Cache-Control": "no-cache" } });
      if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`);
      return res.json();
    },
  });
  const stores = storesData?.stores ?? [];

  const { data: ordersData, isLoading: ordersLoading } = useQuery<{ orders: any[] }>({
    queryKey: ["/api/faire/orders"],
    queryFn: async () => {
      const res = await fetch("/api/faire/orders", { headers: { "Cache-Control": "no-cache" } });
      if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`);
      return res.json();
    },
  });
  const allOrders = ordersData?.orders ?? [];

  const { data: productsData, isLoading: productsLoading } = useQuery<{ products: any[] }>({
    queryKey: ["/api/faire/products?slim"],
    queryFn: async () => {
      const res = await fetch("/api/faire/products?slim", { headers: { "Cache-Control": "no-cache" } });
      if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`);
      return res.json();
    },
  });
  const allProducts = productsData?.products ?? [];

  const isLoading = storesLoading;

  const filteredOrders = selectedStore === "all"
    ? allOrders
    : allOrders.filter((o: any) => o._storeId === selectedStore);

  const filteredProducts = selectedStore === "all"
    ? allProducts
    : allProducts.filter((p: any) => p._storeId === selectedStore);

  const totalOrders = filteredOrders.length;
  const totalProducts = filteredProducts.length;
  const totalNewOrders = filteredOrders.filter((o: any) => o.state === "NEW").length;
  const pendingFulfillment = filteredOrders.filter((o: any) => o.state === "NEW" || o.state === "PROCESSING").length;

  const totalRevenueCents = filteredOrders.reduce((sum: number, order: any) => {
    const orderTotal = (order.items ?? []).reduce((itemSum: number, item: any) => {
      return itemSum + (item.price_cents ?? 0) * (item.quantity ?? 0);
    }, 0);
    return sum + orderTotal;
  }, 0);
  const totalRevenue = totalRevenueCents / 100;

  const uniqueRetailers = new Set(filteredOrders.map((o: any) => o.retailer_id)).size;

  const storeOrderMap: Record<string, any[]> = {};
  allOrders.forEach((o: any) => {
    if (!storeOrderMap[o._storeId]) storeOrderMap[o._storeId] = [];
    storeOrderMap[o._storeId].push(o);
  });

  const storeProductMap: Record<string, any[]> = {};
  allProducts.forEach((p: any) => {
    if (!storeProductMap[p._storeId]) storeProductMap[p._storeId] = [];
    storeProductMap[p._storeId].push(p);
  });

  const recentOrders = [...filteredOrders]
    .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  const topProducts = [...filteredProducts]
    .map((p: any) => {
      const totalQty = (p.variants ?? []).reduce((s: number, v: any) => s + (v.available_quantity ?? 0), 0);
      return { ...p, totalQty, variantCount: (p.variants ?? []).length };
    })
    .sort((a: any, b: any) => b.variantCount - a.variantCount || b.totalQty - a.totalQty)
    .slice(0, 5);

  const handleSync = () => {
    toast({ title: "Syncing Orders", description: "Fetching latest orders from Faire API..." });
  };

  if (isLoading) {
    return (
      <PageShell className="animate-pulse">
        <div className="h-32 bg-muted rounded-2xl" />
        <div className="grid grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-muted rounded-xl" />)}</div>
        <div className="h-48 bg-muted rounded-xl" />
      </PageShell>
    );
  }

  return (
    <PageShell>
      <HeroBanner
        eyebrow="Faire Marketplace"
        headline="Faire Marketplace"
        tagline={`Managing ${stores.length} brand storefronts · ${totalOrders.toLocaleString()} orders · ${totalProducts.toLocaleString()} products`}
        color={FAIRE_COLOR}
        colorDark="#2D8A60"
        actions={
          <select
            value={selectedStore}
            onChange={e => setSelectedStore(e.target.value)}
            className="text-xs bg-white/20 text-white border border-white/30 rounded-lg px-3 py-1.5 backdrop-blur-sm outline-none"
            data-testid="select-store"
          >
            <option value="all" className="text-foreground">All Stores</option>
            {stores.map((s: any) => <option key={s.id} value={s.id} className="text-foreground">{s.name}</option>)}
          </select>
        }
      />

      {totalNewOrders > 0 && (
        <Fade>
          <div className="rounded-xl border-2 border-amber-400 bg-amber-50 dark:bg-amber-950/20 p-4 flex items-center gap-4" data-testid="urgent-actions-widget">
            <div className="size-10 rounded-full bg-amber-400 flex items-center justify-center shrink-0">
              <AlertTriangle size={18} className="text-white" />
            </div>
            <div className="flex-1 space-y-1">
              <button onClick={() => setLocation("/faire/fulfillment")} className="flex items-center gap-2 text-sm text-amber-800 dark:text-amber-300 hover:underline" data-testid="link-fulfillment">
                <span className="font-semibold">{totalNewOrders} new orders need attention</span>
                <span className="text-amber-600">&rarr;</span>
              </button>
            </div>
            <Button size="sm" className="bg-amber-500 text-white shrink-0" onClick={() => setLocation("/faire/orders")} data-testid="btn-urgent-action">
              View Orders
            </Button>
          </div>
        </Fade>
      )}

      <Stagger>
        <StatGrid>
          <StaggerItem>
            <StatCard
              label="Total Revenue"
              value={`$${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
              trend={formatINRFromDollars(totalRevenue)}
              icon={DollarSign}
              iconBg="rgba(5, 150, 105, 0.1)"
              iconColor="#059669"
            />
          </StaggerItem>
          <StaggerItem>
            <StatCard
              label="Total Orders"
              value={totalOrders.toLocaleString()}
              icon={ShoppingCart}
              iconBg="rgba(37, 99, 235, 0.1)"
              iconColor="#2563EB"
            />
          </StaggerItem>
          <StaggerItem>
            <StatCard
              label="Pending Fulfillment"
              value={pendingFulfillment}
              icon={Bell}
              iconBg={pendingFulfillment > 0 ? "rgba(217, 119, 6, 0.1)" : "rgba(13, 148, 136, 0.1)"}
              iconColor={pendingFulfillment > 0 ? "#D97706" : "#0D9488"}
            />
          </StaggerItem>
          <StaggerItem>
            <StatCard
              label="Unique Retailers"
              value={uniqueRetailers}
              icon={Users}
              iconBg="rgba(124, 58, 237, 0.1)"
              iconColor="#7C3AED"
            />
          </StaggerItem>
        </StatGrid>
      </Stagger>

      <Fade>
        <SectionCard
          title="Store Overview"
          viewAllLabel="View All Stores"
          onViewAll={() => setLocation("/faire/stores")}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {stores.map((store: any) => {
              const storeOrders = storeOrderMap[store.id] ?? [];
              const storeProducts = storeProductMap[store.id] ?? [];
              const newOrders = storeOrders.filter((o: any) => o.state === "NEW").length;
              const isSelected = selectedStore === store.id;
              return (
                <div
                  key={store.id}
                  className={`rounded-xl border bg-card p-4 cursor-pointer hover:bg-muted/20 transition-colors ${isSelected ? "ring-2" : ""}`}
                  style={isSelected ? { borderColor: FAIRE_COLOR } : {}}
                  onClick={() => setSelectedStore(isSelected ? "all" : store.id)}
                  data-testid={`store-card-${store.id}`}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <CompanyCell name={store.name} size="sm" />
                    <div className={`size-2 rounded-full shrink-0 ${store.active ? "bg-emerald-500" : "bg-gray-400"}`} />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <p className="text-lg font-bold">{storeOrders.length}</p>
                      <p className="text-xs text-muted-foreground">Orders</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold">{storeProducts.length}</p>
                      <p className="text-xs text-muted-foreground">Products</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold">{newOrders}</p>
                      <p className="text-xs text-muted-foreground">New</p>
                    </div>
                  </div>
                  {store.last_synced_at && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Last synced {new Date(store.last_synced_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </SectionCard>
      </Fade>

      <Fade>
        <SectionGrid>
          <SectionCard
            title="Recent Orders"
            viewAllLabel="View All Orders"
            onViewAll={() => setLocation("/faire/orders")}
          >
            {ordersLoading ? (
              <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-12 bg-muted rounded-lg animate-pulse" />)}</div>
            ) : recentOrders.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4" data-testid="text-no-orders">No orders found</p>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((order: any) => {
                  const orderTotal = (order.items ?? []).reduce((s: number, i: any) => s + (i.price_cents ?? 0) * (i.quantity ?? 0), 0) / 100;
                  const cfg = ORDER_STATE_CONFIG[order.state as OrderState] ?? ORDER_STATE_CONFIG.NEW;
                  const store = stores.find((s: any) => s.id === order._storeId);
                  return (
                    <button
                      key={order.id}
                      onClick={() => setLocation(`/faire/orders/${order.id}`)}
                      className="flex items-center justify-between gap-3 w-full p-3 rounded-xl border text-left hover:bg-muted/20 transition-colors"
                      data-testid={`recent-order-${order.id}`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold">#{order.display_id ?? order.id.slice(-6)}</span>
                          <Badge
                            variant="outline"
                            className="text-xs"
                            style={{ color: cfg.color, backgroundColor: cfg.bg, borderColor: cfg.color + "30" }}
                          >
                            {cfg.label}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {store?.name ?? "Unknown Store"} · {order.retailer_id ?? "Unknown Retailer"}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-semibold"><DualFromDollars dollars={orderTotal} /></p>
                        <p className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </SectionCard>

          <SectionCard
            title="Top Products"
            viewAllLabel="View All Products"
            onViewAll={() => setLocation("/faire/products")}
          >
            {productsLoading ? (
              <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-12 bg-muted rounded-lg animate-pulse" />)}</div>
            ) : topProducts.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4" data-testid="text-no-products">No products found</p>
            ) : (
              <div className="space-y-3">
                {topProducts.map((product: any) => {
                  const store = stores.find((s: any) => s.id === product._storeId);
                  const category = product.taxonomy_type?.name ?? "Uncategorized";
                  return (
                    <button
                      key={product.id}
                      onClick={() => setLocation(`/faire/products/${product.id}`)}
                      className="flex items-center justify-between gap-3 w-full p-3 rounded-xl border text-left hover:bg-muted/20 transition-colors"
                      data-testid={`top-product-${product.id}`}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        {product.thumb_url ? (
                          <img
                            src={product.thumb_url}
                            alt={product.name}
                            className="size-10 rounded-lg object-cover shrink-0 border"
                          />
                        ) : (
                          <div className="size-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                            <Package size={16} className="text-muted-foreground" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-semibold truncate">{product.name}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {store?.name ?? "Unknown Store"} · {category}
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-semibold">{product.variantCount} variants</p>
                        <p className="text-xs text-muted-foreground">{product.totalQty} in stock</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </SectionCard>
        </SectionGrid>
      </Fade>

      <Fade>
        <SectionGrid>
          <SectionCard title="Quick Actions">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Orders", path: "/faire/orders", icon: ShoppingCart, color: "#059669" },
                { label: "Products", path: "/faire/products", icon: Package, color: "#2563EB" },
                { label: "Fulfillment", path: "/faire/fulfillment", icon: TrendingUp, color: "#D97706" },
                { label: "Analytics", path: "/faire/analytics", icon: TrendingUp, color: "#7C3AED" },
              ].map(action => (
                <button
                  key={action.label}
                  onClick={() => setLocation(action.path)}
                  className="flex items-center gap-3 p-3 rounded-xl border hover:bg-muted/20 transition-colors text-left"
                  data-testid={`quick-action-${action.label.toLowerCase()}`}
                >
                  <div className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${action.color}15`, color: action.color }}>
                    <action.icon size={16} />
                  </div>
                  <span className="text-sm font-medium">{action.label}</span>
                </button>
              ))}
            </div>
          </SectionCard>
          <SectionCard title="Sync Status">
            <div className="space-y-3">
              {stores.map((store: any) => (
                <div key={store.id} className="flex items-center justify-between gap-2" data-testid={`sync-status-${store.id}`}>
                  <div className="flex items-center gap-2">
                    <div className={`size-2 rounded-full ${store.active ? "bg-emerald-500" : "bg-gray-400"}`} />
                    <span className="text-sm font-medium">{store.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {store.last_synced_at
                        ? new Date(store.last_synced_at).toLocaleDateString()
                        : "Never synced"}
                    </Badge>
                    <Badge variant={store.active ? "default" : "secondary"} className="text-xs">
                      {store.active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        </SectionGrid>
      </Fade>
    </PageShell>
  );
}
