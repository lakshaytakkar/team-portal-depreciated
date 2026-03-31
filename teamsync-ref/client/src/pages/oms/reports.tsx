import { PageTransition, Fade } from "@/components/ui/animated";
import { useState, useMemo } from "react";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { omsOrders, omsShipments, omsInventory, omsProducts, omsReturns } from "@/lib/mock-data-oms";
import { cn } from "@/lib/utils";
import { PageShell } from "@/components/layout";

const COURIERS = ["Delhivery", "Shiprocket", "DTDC", "BlueDart", "Ekart"] as const;

const COURIER_BADGES: Record<string, string> = {
  Delhivery: "bg-blue-100 text-blue-700",
  Shiprocket: "bg-orange-100 text-orange-700",
  DTDC: "bg-red-100 text-red-700",
  BlueDart: "bg-indigo-100 text-indigo-700",
  Ekart: "bg-amber-100 text-amber-700",
};

type Tab = "fulfillment" | "inventory" | "shipping" | "returns";

export default function OmsReports() {
  const loading = useSimulatedLoading(600);
  const [tab, setTab] = useState<Tab>("fulfillment");
  const [period, setPeriod] = useState("this-month");

  const fulfillmentStats = useMemo(() => {
    const types = ["b2b", "b2c", "dropship"] as const;
    const byType = types.map(t => ({
      type: t,
      count: omsOrders.filter(o => o.type === t).length,
      value: omsOrders.filter(o => o.type === t).reduce((s, o) => s + o.totalAmount, 0),
    }));
    const delivered = omsOrders.filter(o => o.status === "delivered").length;
    const fillRate = Math.round((delivered / omsOrders.length) * 100);
    const maxCount = Math.max(...byType.map(b => b.count));

    const productCounts: Record<string, { name: string; count: number }> = {};
    for (const o of omsOrders) {
      for (const l of o.lines) {
        if (!productCounts[l.sku]) productCounts[l.sku] = { name: l.productName, count: 0 };
        productCounts[l.sku].count += l.qty;
      }
    }
    const topProducts = Object.entries(productCounts)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 10);

    return { byType, fillRate, maxCount, topProducts };
  }, []);

  const inventoryStats = useMemo(() => {
    const totalValue = omsInventory.reduce((s, i) => {
      const p = omsProducts.find(p => p.id === i.productId);
      return s + (p ? p.costPrice * i.qtyOnHand : 0);
    }, 0);
    const slowMoving = omsInventory.filter(i => {
      const daysSince = Math.floor((new Date("2026-03-01").getTime() - new Date(i.lastUpdated).getTime()) / 86400000);
      return daysSince > 14;
    });
    const topByValue = [...omsInventory].map(i => {
      const p = omsProducts.find(p => p.id === i.productId);
      return { ...i, value: p ? p.costPrice * i.qtyOnHand : 0 };
    }).sort((a, b) => b.value - a.value).slice(0, 5);
    return { totalValue, slowMoving: slowMoving.slice(0, 8), topByValue };
  }, []);

  const shippingStats = useMemo(() => {
    const courierData = COURIERS.map(c => {
      const shps = omsShipments.filter(s => s.courier === c);
      const delivered = shps.filter(s => s.status === "delivered");
      const rto = shps.filter(s => s.status === "rto");
      return {
        courier: c,
        total: shps.length,
        delivered: delivered.length,
        rto: rto.length,
        rtoRate: shps.length > 0 ? Math.round((rto.length / shps.length) * 100) : 0,
        avgTransit: delivered.length > 0 ? "3.2" : "—",
      };
    });

    const cityCounts: Record<string, number> = {};
    for (const s of omsShipments) {
      cityCounts[s.city] = (cityCounts[s.city] || 0) + 1;
    }
    const topCities = Object.entries(cityCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    return { courierData, topCities };
  }, []);

  const returnStats = useMemo(() => {
    const returnRate = Math.round((omsReturns.length / omsOrders.length) * 100);
    const reasonCounts: Record<string, number> = {};
    for (const r of omsReturns) {
      reasonCounts[r.reason] = (reasonCounts[r.reason] || 0) + 1;
    }
    const reasons = Object.entries(reasonCounts).sort((a, b) => b[1] - a[1]);
    const resolutionCounts: Record<string, number> = {};
    for (const r of omsReturns) {
      resolutionCounts[r.resolutionType] = (resolutionCounts[r.resolutionType] || 0) + 1;
    }
    return { returnRate, reasons, resolutionCounts };
  }, []);

  if (loading) {
    return (
      <PageShell>
        <div className="h-14 w-72 bg-muted rounded-lg" />
        <div className="h-10 bg-muted rounded-xl" />
        <div className="h-96 bg-muted rounded-xl" />
      </PageShell>
    );
  }

  return (
    <PageTransition>
      <div className="px-16 py-6 lg:px-24 space-y-5">
        <Fade>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold" data-testid="reports-heading">Reports</h1>
              <p className="text-sm text-muted-foreground mt-0.5">Fulfillment, inventory, shipping and returns analytics</p>
            </div>
            <div className="flex items-center gap-2">
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger className="w-36 h-9" data-testid="select-period">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="this-week">This Week</SelectItem>
                  <SelectItem value="this-month">This Month</SelectItem>
                  <SelectItem value="last-month">Last Month</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" className="h-9 text-xs" data-testid="btn-export-pdf">Export PDF</Button>
              <Button variant="outline" className="h-9 text-xs" data-testid="btn-export-excel">Export Excel</Button>
            </div>
          </div>

          <div className="flex border-b border-border">
            {(["fulfillment", "inventory", "shipping", "returns"] as Tab[]).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                data-testid={`tab-${t}`}
                className={cn("px-5 py-2.5 text-sm font-medium capitalize border-b-2 transition-colors",
                  tab === t ? "border-cyan-600 text-cyan-700" : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </Fade>

        {tab === "fulfillment" && (
          <Fade>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="border border-border rounded-xl p-4 bg-background text-center">
                <p className="text-3xl font-bold text-emerald-600">{fulfillmentStats.fillRate}%</p>
                <p className="text-xs text-muted-foreground mt-1">Fulfillment Rate</p>
              </div>
              <div className="border border-border rounded-xl p-4 bg-background text-center">
                <p className="text-3xl font-bold">{omsOrders.length}</p>
                <p className="text-xs text-muted-foreground mt-1">Total Orders</p>
              </div>
              <div className="border border-border rounded-xl p-4 bg-background text-center">
                <p className="text-3xl font-bold text-cyan-600">~4.2 hrs</p>
                <p className="text-xs text-muted-foreground mt-1">Avg Processing Time</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="border border-border rounded-xl p-5 bg-background">
                <h3 className="text-sm font-semibold mb-4">Orders by Type</h3>
                <div className="space-y-4">
                  {fulfillmentStats.byType.map(({ type, count, value }) => {
                    const pct = Math.round((count / fulfillmentStats.maxCount) * 100);
                    const colors = { b2b: "bg-blue-500", b2c: "bg-emerald-500", dropship: "bg-violet-500" };
                    const labels = { b2b: "B2B", b2c: "B2C", dropship: "Dropship" };
                    return (
                      <div key={type}>
                        <div className="flex justify-between text-sm mb-1.5">
                          <span className="font-medium">{labels[type]}</span>
                          <span className="text-muted-foreground">{count} orders · ₹{(value / 1000).toFixed(0)}K</span>
                        </div>
                        <div className="h-6 bg-muted rounded-full overflow-hidden">
                          <div className={cn("h-full rounded-full flex items-center pl-3", colors[type])} style={{ width: `${pct}%` }}>
                            <span className="text-[10px] text-white font-semibold">{count}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="border border-border rounded-xl bg-background overflow-hidden">
                <div className="p-4 border-b border-border">
                  <h3 className="text-sm font-semibold">Top 10 Products by Order Volume</h3>
                </div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/20">
                      <th className="text-left py-2 px-4 text-xs font-medium text-muted-foreground">#</th>
                      <th className="text-left py-2 px-4 text-xs font-medium text-muted-foreground">SKU</th>
                      <th className="text-left py-2 px-4 text-xs font-medium text-muted-foreground">Product</th>
                      <th className="text-right py-2 px-4 text-xs font-medium text-muted-foreground">Units</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fulfillmentStats.topProducts.map(([sku, { name, count }], idx) => (
                      <tr key={sku} className="border-b border-border/40">
                        <td className="py-2 px-4 text-xs text-muted-foreground">{idx + 1}</td>
                        <td className="py-2 px-4 text-xs">{sku}</td>
                        <td className="py-2 px-4 text-xs truncate max-w-[160px]">{name}</td>
                        <td className="py-2 px-4 text-right text-xs font-semibold">{count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Fade>
        )}

        {tab === "inventory" && (
          <Fade>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="border border-border rounded-xl p-4 bg-background text-center">
                <p className="text-3xl font-bold">₹{(inventoryStats.totalValue / 100000).toFixed(1)}L</p>
                <p className="text-xs text-muted-foreground mt-1">Inventory Value (at cost)</p>
              </div>
              <div className="border border-border rounded-xl p-4 bg-background text-center">
                <p className="text-3xl font-bold text-amber-600">{inventoryStats.slowMoving.length}</p>
                <p className="text-xs text-muted-foreground mt-1">Slow-Moving SKUs (&gt;14 days)</p>
              </div>
              <div className="border border-border rounded-xl p-4 bg-background text-center">
                <p className="text-3xl font-bold">{omsInventory.reduce((s, i) => s + i.qtyOnHand, 0).toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">Total Units on Hand</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="border border-border rounded-xl bg-background overflow-hidden">
                <div className="p-4 border-b border-border"><h3 className="text-sm font-semibold">Slow-Moving SKUs</h3></div>
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-border bg-muted/20">
                    <th className="text-left py-2 px-4 text-xs font-medium text-muted-foreground">SKU</th>
                    <th className="text-left py-2 px-4 text-xs font-medium text-muted-foreground">Product</th>
                    <th className="text-right py-2 px-4 text-xs font-medium text-muted-foreground">On Hand</th>
                    <th className="text-right py-2 px-4 text-xs font-medium text-muted-foreground">Last Updated</th>
                  </tr></thead>
                  <tbody>
                    {inventoryStats.slowMoving.map(inv => (
                      <tr key={inv.id} className="border-b border-border/40">
                        <td className="py-2 px-4 text-xs">{inv.sku}</td>
                        <td className="py-2 px-4 text-xs truncate max-w-[160px]">{inv.productName}</td>
                        <td className="py-2 px-4 text-right text-xs font-semibold">{inv.qtyOnHand}</td>
                        <td className="py-2 px-4 text-right text-xs text-muted-foreground">{inv.lastUpdated}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="border border-border rounded-xl bg-background overflow-hidden">
                <div className="p-4 border-b border-border"><h3 className="text-sm font-semibold">Top 5 SKUs by Stock Value</h3></div>
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-border bg-muted/20">
                    <th className="text-left py-2 px-4 text-xs font-medium text-muted-foreground">SKU</th>
                    <th className="text-left py-2 px-4 text-xs font-medium text-muted-foreground">Product</th>
                    <th className="text-right py-2 px-4 text-xs font-medium text-muted-foreground">Units</th>
                    <th className="text-right py-2 px-4 text-xs font-medium text-muted-foreground">Value</th>
                  </tr></thead>
                  <tbody>
                    {inventoryStats.topByValue.map(inv => (
                      <tr key={inv.id} className="border-b border-border/40">
                        <td className="py-2 px-4 text-xs">{inv.sku}</td>
                        <td className="py-2 px-4 text-xs truncate max-w-[120px]">{inv.productName}</td>
                        <td className="py-2 px-4 text-right text-xs">{inv.qtyOnHand}</td>
                        <td className="py-2 px-4 text-right text-xs font-semibold">₹{inv.value.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Fade>
        )}

        {tab === "shipping" && (
          <Fade>
            <div className="grid grid-cols-2 gap-4">
              <div className="border border-border rounded-xl bg-background overflow-hidden">
                <div className="p-4 border-b border-border"><h3 className="text-sm font-semibold">Courier Performance</h3></div>
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-border bg-muted/20">
                    <th className="text-left py-2.5 px-4 text-xs font-medium text-muted-foreground">Courier</th>
                    <th className="text-right py-2.5 px-4 text-xs font-medium text-muted-foreground">Ships.</th>
                    <th className="text-right py-2.5 px-4 text-xs font-medium text-muted-foreground">Delivered</th>
                    <th className="text-right py-2.5 px-4 text-xs font-medium text-muted-foreground">RTO</th>
                    <th className="text-right py-2.5 px-4 text-xs font-medium text-muted-foreground">RTO%</th>
                    <th className="text-right py-2.5 px-4 text-xs font-medium text-muted-foreground">Avg Transit</th>
                  </tr></thead>
                  <tbody>
                    {shippingStats.courierData.map(c => (
                      <tr key={c.courier} className="border-b border-border/40">
                        <td className="py-2.5 px-4">
                          <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded", COURIER_BADGES[c.courier])}>{c.courier}</span>
                        </td>
                        <td className="py-2.5 px-4 text-right text-xs font-semibold">{c.total}</td>
                        <td className="py-2.5 px-4 text-right text-xs text-emerald-600 font-semibold">{c.delivered}</td>
                        <td className="py-2.5 px-4 text-right text-xs text-orange-600 font-semibold">{c.rto}</td>
                        <td className="py-2.5 px-4 text-right text-xs">{c.rtoRate}%</td>
                        <td className="py-2.5 px-4 text-right text-xs text-muted-foreground">{c.avgTransit} days</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="border border-border rounded-xl bg-background overflow-hidden">
                <div className="p-4 border-b border-border"><h3 className="text-sm font-semibold">Top 10 Delivery Cities</h3></div>
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-border bg-muted/20">
                    <th className="text-left py-2.5 px-4 text-xs font-medium text-muted-foreground">#</th>
                    <th className="text-left py-2.5 px-4 text-xs font-medium text-muted-foreground">City</th>
                    <th className="text-right py-2.5 px-4 text-xs font-medium text-muted-foreground">Shipments</th>
                    <th className="py-2.5 px-4 text-xs font-medium text-muted-foreground">Share</th>
                  </tr></thead>
                  <tbody>
                    {shippingStats.topCities.map(([city, count], idx) => {
                      const share = Math.round((count / omsShipments.length) * 100);
                      return (
                        <tr key={city} className="border-b border-border/40">
                          <td className="py-2.5 px-4 text-xs text-muted-foreground">{idx + 1}</td>
                          <td className="py-2.5 px-4 text-xs font-medium">{city}</td>
                          <td className="py-2.5 px-4 text-right text-xs font-semibold">{count}</td>
                          <td className="py-2.5 px-4 w-24">
                            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                              <div className="h-full rounded-full bg-cyan-500" style={{ width: `${Math.min(share * 4, 100)}%` }} />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </Fade>
        )}

        {tab === "returns" && (
          <Fade>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="border border-border rounded-xl p-4 bg-background text-center">
                <p className="text-3xl font-bold text-amber-600">{returnStats.returnRate}%</p>
                <p className="text-xs text-muted-foreground mt-1">Return Rate</p>
              </div>
              <div className="border border-border rounded-xl p-4 bg-background text-center">
                <p className="text-3xl font-bold">{omsReturns.length}</p>
                <p className="text-xs text-muted-foreground mt-1">Total Returns</p>
              </div>
              <div className="border border-border rounded-xl p-4 bg-background text-center">
                <p className="text-3xl font-bold text-cyan-600">~5.2 days</p>
                <p className="text-xs text-muted-foreground mt-1">Avg Resolution Time</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="border border-border rounded-xl bg-background overflow-hidden">
                <div className="p-4 border-b border-border"><h3 className="text-sm font-semibold">Return Reasons</h3></div>
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-border bg-muted/20">
                    <th className="text-left py-2 px-4 text-xs font-medium text-muted-foreground">Reason</th>
                    <th className="text-right py-2 px-4 text-xs font-medium text-muted-foreground">Count</th>
                    <th className="py-2 px-4 text-xs font-medium text-muted-foreground">Share</th>
                  </tr></thead>
                  <tbody>
                    {returnStats.reasons.map(([reason, count]) => {
                      const pct = Math.round((count / omsReturns.length) * 100);
                      return (
                        <tr key={reason} className="border-b border-border/40">
                          <td className="py-2 px-4 text-xs">{reason}</td>
                          <td className="py-2 px-4 text-right text-xs font-semibold">{count}</td>
                          <td className="py-2 px-4 w-28">
                            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                              <div className="h-full rounded-full bg-amber-500" style={{ width: `${Math.min(pct * 3, 100)}%` }} />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="border border-border rounded-xl p-5 bg-background">
                <h3 className="text-sm font-semibold mb-4">Resolution Type Split</h3>
                <div className="space-y-3">
                  {Object.entries(returnStats.resolutionCounts).map(([type, count]) => {
                    const pct = Math.round((count / omsReturns.length) * 100);
                    const colors: Record<string, string> = { refund: "bg-red-500", replacement: "bg-blue-500", "restock-only": "bg-emerald-500" };
                    const labels: Record<string, string> = { refund: "Refund", replacement: "Replacement", "restock-only": "Restock Only" };
                    return (
                      <div key={type}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium">{labels[type] || type}</span>
                          <span className="text-muted-foreground">{count} ({pct}%)</span>
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                          <div className={cn("h-full rounded-full", colors[type] || "bg-slate-500")} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </Fade>
        )}
      </div>
    </PageTransition>
  );
}
