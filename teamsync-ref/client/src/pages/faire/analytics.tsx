import { useState } from "react";
import { TrendingUp, TrendingDown, Mail } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { useQuery } from "@tanstack/react-query";
import { Fade } from "@/components/ui/animated";
import { PageShell } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTableContainer, DataTH, DataTD, DataTR } from "@/components/layout";
import {
  FAIRE_COLOR,
  type OrderState,
  ORDER_STATE_CONFIG,
} from "@/lib/faire-config";
import { formatINR, formatINRFromDollars, DualFromDollars } from "@/lib/faire-currency";




const ALL_ORDER_STATES: OrderState[] = ["NEW", "PROCESSING", "PRE_TRANSIT", "IN_TRANSIT", "DELIVERED", "PENDING_RETAILER_CONFIRMATION", "BACKORDERED", "CANCELED"];

export default function FaireAnalytics() {
  const [selectedStore, setSelectedStore] = useState("all");
  const [timeFilter, setTimeFilter] = useState<"7d" | "30d" | "month" | "3m">("month");

  const { data: storesData, isLoading: storesLoading } = useQuery<{ stores: any[] }>({
    queryKey: ["/api/faire/stores"],
    queryFn: async () => {
      const res = await fetch("/api/faire/stores", { headers: { "Cache-Control": "no-cache" } });
      if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`);
      return res.json();
    },
  });
  const { data: ordersData, isLoading: ordersLoading } = useQuery<{ orders: any[] }>({
    queryKey: ["/api/faire/orders"],
    queryFn: async () => {
      const res = await fetch("/api/faire/orders", { headers: { "Cache-Control": "no-cache" } });
      if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`);
      return res.json();
    },
  });
  const { data: productsData, isLoading: productsLoading } = useQuery<{ products: any[] }>({
    queryKey: ["/api/faire/products?slim"],
    queryFn: async () => {
      const res = await fetch("/api/faire/products?slim", { headers: { "Cache-Control": "no-cache" } });
      if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`);
      return res.json();
    },
  });

  const isLoading = storesLoading || ordersLoading || productsLoading;
  const stores = storesData?.stores ?? [];
  const allOrders = ordersData?.orders ?? [];
  const allProducts = productsData?.products ?? [];

  const storeOrders = selectedStore === "all" ? allOrders : allOrders.filter((o: any) => o._storeId === selectedStore);
  const storeProducts = selectedStore === "all" ? allProducts : allProducts.filter((p: any) => p._storeId === selectedStore);

  const computeOrderRevenue = (order: any) =>
    (order.items ?? []).reduce((s: number, i: any) => s + (i.price_cents ?? 0) * (i.quantity ?? 0), 0);

  const totalRevenueCents = storeOrders.reduce((s: number, o: any) => s + computeOrderRevenue(o), 0);
  const totalRevenue = totalRevenueCents / 100;

  const totalOrders = storeOrders.length;
  const uniqueRetailers = new Set(storeOrders.map((o: any) => o.retailer_id)).size;
  const totalItemsCents = storeOrders.reduce((s: number, o: any) => s + computeOrderRevenue(o), 0);
  const avgOrderValueCents = totalOrders > 0 ? Math.round(totalItemsCents / totalOrders) : 0;
  const unitsSold = storeOrders.reduce((s: number, o: any) => s + (o.items ?? []).reduce((si: number, i: any) => si + (i.quantity ?? 0), 0), 0);
  const canceledOrders = storeOrders.filter((o: any) => o.state === "CANCELED").length;
  const cancelRate = totalOrders > 0 ? ((canceledOrders / totalOrders) * 100).toFixed(1) : "0.0";

  const storeRevenues = stores.map((store: any) => {
    const rev = allOrders
      .filter((o: any) => o._storeId === store.id)
      .reduce((s: number, o: any) => s + computeOrderRevenue(o), 0);
    return { ...store, revenue: rev / 100 };
  });
  const maxRevenue = Math.max(...storeRevenues.map((s: any) => s.revenue), 1);

  const topProducts = [...storeProducts]
    .map((p: any) => {
      const store = stores.find((s: any) => s.id === p._storeId);
      const reviews = p.reviews ?? [];
      const avgRating = reviews.length > 0
        ? (reviews.reduce((s: number, r: any) => s + r.rating, 0) / reviews.length).toFixed(1)
        : "\u2014";
      const totalQty = (p.variants ?? []).reduce((s: number, v: any) => s + (v.available_quantity ?? 0), 0);
      return { name: p.name, store, totalQty, rating: avgRating };
    })
    .sort((a, b) => b.totalQty - a.totalQty)
    .slice(0, 10)
    .map((p, i) => ({ ...p, rank: i + 1 }));

  const monthlyData = (() => {
    const buckets: Record<string, number> = {};
    storeOrders.forEach((o: any) => {
      if (!o.created_at) return;
      const d = new Date(o.created_at);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      buckets[key] = (buckets[key] ?? 0) + computeOrderRevenue(o);
    });
    const sorted = Object.entries(buckets).sort((a, b) => a[0].localeCompare(b[0])).slice(-6);
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return sorted.map(([key, cents]) => {
      const [year, month] = key.split("-");
      return { label: `${monthNames[parseInt(month) - 1]} '${year.slice(2)}`, revenue: cents / 100 };
    });
  })();

  const maxMonthlyRevenue = Math.max(...monthlyData.map(m => m.revenue), 1);

  const geoData = (() => {
    const buckets: Record<string, { retailers: Set<string>; orders: number; revenue: number }> = {};
    storeOrders.forEach((o: any) => {
      const stateCode = o.address?.state_code || o.address?.state || "Unknown";
      if (!buckets[stateCode]) buckets[stateCode] = { retailers: new Set(), orders: 0, revenue: 0 };
      buckets[stateCode].retailers.add(o.retailer_id);
      buckets[stateCode].orders += 1;
      buckets[stateCode].revenue += computeOrderRevenue(o) / 100;
    });
    return Object.entries(buckets)
      .map(([state, data]) => ({ state, retailers: data.retailers.size, orders: data.orders, revenue: Math.round(data.revenue) }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
  })();

  if (isLoading) {
    return (
      <div className="px-16 py-6 lg:px-24 space-y-6 animate-pulse">
        <div className="h-10 bg-muted rounded w-64" />
        <div className="grid grid-cols-6 gap-3">{[...Array(6)].map((_, i) => <div key={i} className="h-20 bg-muted rounded-xl" />)}</div>
        <div className="grid grid-cols-2 gap-5">{[...Array(4)].map((_, i) => <div key={i} className="h-48 bg-muted rounded-xl" />)}</div>
      </div>
    );
  }

  return (
    <PageShell>
      <Fade>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold font-heading">Analytics</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Marketplace performance across all stores</p>
          </div>
          <div className="flex gap-2 items-center">
            {(() => {
              const summary = `*Faire Analytics*\nStores: ${stores.length}\nOrders: ${totalOrders}\nRevenue: $${totalRevenue >= 1000 ? `${(totalRevenue / 1000).toFixed(1)}K` : totalRevenue.toFixed(0)}\nRetailers: ${uniqueRetailers}\nUnits Sold: ${unitsSold}\nCancel Rate: ${cancelRate}%`;
              return (
                <>
                  <button
                    className="h-8 w-8 flex items-center justify-center rounded-lg border text-[#25D366] border-[#25D366]/30 hover:bg-[#25D366]/10 transition-colors"
                    onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(summary)}`, "_blank")}
                    title="Share on WhatsApp"
                    data-testid="btn-analytics-share-whatsapp"
                  >
                    <SiWhatsapp size={15} />
                  </button>
                  <button
                    className="h-8 w-8 flex items-center justify-center rounded-lg border hover:bg-muted transition-colors text-muted-foreground"
                    onClick={() => window.open(`mailto:?subject=${encodeURIComponent("Faire Analytics Summary")}&body=${encodeURIComponent(summary.replace(/\*/g, ""))}`, "_blank")}
                    title="Share via Email"
                    data-testid="btn-analytics-share-email"
                  >
                    <Mail size={15} />
                  </button>
                </>
              );
            })()}
            <div className="flex gap-1">
              {(["7d", "30d", "month", "3m"] as const).map(t => (
                <button key={t} onClick={() => setTimeFilter(t)} className={`px-3 py-1 text-xs rounded-lg border transition-colors ${timeFilter === t ? "text-white border-transparent" : "bg-background hover:bg-muted"}`} style={timeFilter === t ? { background: FAIRE_COLOR } : {}} data-testid={`filter-time-${t}`}>
                  {t === "7d" ? "7 Days" : t === "30d" ? "30 Days" : t === "month" ? "This Month" : "3 Months"}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Fade>

      <Fade>
        <div className="flex gap-1 overflow-x-auto pb-1">
          <button onClick={() => setSelectedStore("all")} className={`px-4 py-1.5 text-xs rounded-lg border shrink-0 transition-colors font-medium ${selectedStore === "all" ? "text-white border-transparent" : "bg-background hover:bg-muted"}`} style={selectedStore === "all" ? { background: FAIRE_COLOR } : {}} data-testid="tab-all-stores">
            All Stores
          </button>
          {stores.map((s: any) => (
            <button key={s.id} onClick={() => setSelectedStore(s.id)} className={`px-4 py-1.5 text-xs rounded-lg border shrink-0 transition-colors font-medium ${selectedStore === s.id ? "text-white border-transparent" : "bg-background hover:bg-muted"}`} style={selectedStore === s.id ? { background: FAIRE_COLOR } : {}} data-testid={`tab-store-${s.id}`}>
              {s.name.split(" ")[0]}
            </button>
          ))}
        </div>
      </Fade>

      <Fade>
        <div className="grid grid-cols-6 gap-3">
          {[
            { label: "Total Revenue", value: `$${totalRevenue >= 1000 ? `${(totalRevenue / 1000).toFixed(0)}K` : totalRevenue.toFixed(0)}`, sub: formatINRFromDollars(totalRevenue) },
            { label: "Total Orders", value: totalOrders, sub: null },
            { label: "Avg Order Value", value: `$${(avgOrderValueCents / 100).toFixed(0)}`, sub: formatINR(avgOrderValueCents) },
            { label: "Unique Retailers", value: uniqueRetailers, sub: null },
            { label: "Units Sold", value: unitsSold, sub: null },
            { label: "Cancel Rate", value: `${cancelRate}%`, sub: null },
          ].map((k, i) => (
            <div key={i} className="rounded-xl border bg-card p-3" data-testid={`analytics-kpi-${i}`}>
              <p className="text-lg font-bold">{k.value}</p>
              {k.sub && <p className="text-xs text-muted-foreground/70">{k.sub}</p>}
              <p className="text-xs text-muted-foreground mt-0.5">{k.label}</p>
            </div>
          ))}
        </div>
      </Fade>

      <div className="grid grid-cols-2 gap-5">
        <Fade>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Revenue by Store</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {storeRevenues.map((store: any) => {
                const barWidth = Math.round((store.revenue / maxRevenue) * 100);
                return (
                  <div key={store.id} data-testid={`bar-store-${store.id}`}>
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <p className="text-xs font-medium truncate">{store.name}</p>
                      <p className="text-xs font-bold"><DualFromDollars dollars={store.revenue} /></p>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${barWidth}%`, background: FAIRE_COLOR }} />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </Fade>

        <Fade>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Orders by State</CardTitle></CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {ALL_ORDER_STATES.map(state => {
                  const cfg = ORDER_STATE_CONFIG[state];
                  const count = storeOrders.filter((o: any) => o.state === state).length;
                  return (
                    <div key={state} className="flex items-center gap-1.5 px-3 py-2 rounded-lg" style={{ background: cfg.bg }} data-testid={`state-chip-${state}`}>
                      <span className="text-lg font-bold" style={{ color: cfg.color }}>{count}</span>
                      <span className="text-xs" style={{ color: cfg.color }}>{cfg.label}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </Fade>

        <Fade>
          <DataTableContainer>
            <div className="px-4 py-3 border-b">
              <h3 className="text-sm font-semibold">Top 10 Products</h3>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <DataTH>#</DataTH>
                  <DataTH>Product</DataTH>
                  <DataTH>Store</DataTH>
                  <DataTH>Qty in Stock</DataTH>
                  <DataTH>Avg Rating</DataTH>
                </tr>
              </thead>
              <tbody className="divide-y">
                {topProducts.map(p => (
                  <DataTR key={p.rank} data-testid={`top-product-row-${p.rank}`}>
                    <DataTD className="font-medium text-muted-foreground">{p.rank}</DataTD>
                    <DataTD className="font-medium">{p.name}</DataTD>
                    <DataTD className="text-muted-foreground">{p.store?.name?.split(" ")[0] ?? "\u2014"}</DataTD>
                    <DataTD className="font-medium">{p.totalQty}</DataTD>
                    <DataTD>{p.rating}</DataTD>
                  </DataTR>
                ))}
              </tbody>
            </table>
          </DataTableContainer>
        </Fade>

        <Fade>
          <DataTableContainer>
            <div className="px-4 py-3 border-b">
              <h3 className="text-sm font-semibold">Retailer Geography</h3>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <DataTH>State</DataTH>
                  <DataTH>Retailers</DataTH>
                  <DataTH>Orders</DataTH>
                  <DataTH>Revenue</DataTH>
                </tr>
              </thead>
              <tbody className="divide-y">
                {geoData.map(row => (
                  <DataTR key={row.state} data-testid={`geo-row-${row.state}`}>
                    <DataTD className="font-medium">{row.state}</DataTD>
                    <DataTD>{row.retailers}</DataTD>
                    <DataTD>{row.orders}</DataTD>
                    <DataTD className="font-semibold"><DualFromDollars dollars={row.revenue} /></DataTD>
                  </DataTR>
                ))}
                {geoData.length === 0 && (
                  <tr><td colSpan={4} className="p-4 text-center text-muted-foreground">No geographic data available</td></tr>
                )}
              </tbody>
            </table>
          </DataTableContainer>
        </Fade>
      </div>

      <Fade>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Revenue Trend</CardTitle></CardHeader>
          <CardContent>
            {monthlyData.length > 0 ? (
              <div className="flex gap-0">
                {monthlyData.map((month, i) => {
                  const barH = Math.round((month.revenue / maxMonthlyRevenue) * 100);
                  const pct = i > 0 && monthlyData[i - 1].revenue > 0
                    ? parseFloat(((month.revenue - monthlyData[i - 1].revenue) / monthlyData[i - 1].revenue * 100).toFixed(1))
                    : null;
                  return (
                    <div key={month.label} className="flex-1 flex flex-col items-center gap-2" data-testid={`month-bar-${i}`}>
                      <div className="flex items-end h-20 w-full px-1">
                        <div className="w-full rounded-t-md transition-all" style={{ height: `${barH}%`, background: FAIRE_COLOR, opacity: i === monthlyData.length - 1 ? 1 : 0.7 }} />
                      </div>
                      <div className="text-center">
                        <p className="text-xs font-bold"><DualFromDollars dollars={month.revenue} /></p>
                        {pct !== null && (
                          <div className={`flex items-center gap-0.5 text-xs font-medium ${pct >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                            {pct >= 0 ? <TrendingUp size={8} /> : <TrendingDown size={8} />}
                            {Math.abs(pct)}%
                          </div>
                        )}
                        <p className="text-xs text-muted-foreground">{month.label}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-6">No revenue data to display</p>
            )}
          </CardContent>
        </Card>
      </Fade>
    </PageShell>
  );
}
