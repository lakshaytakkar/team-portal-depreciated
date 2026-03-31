import { PageTransition, Stagger, StaggerItem, Fade } from "@/components/ui/animated";
import { useState, useMemo } from "react";
import { Search, AlertTriangle } from "lucide-react";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PersonCell } from "@/components/ui/avatar-cells";
import { omsShipments, omsOrders } from "@/lib/mock-data-oms";
import { cn } from "@/lib/utils";
import { PageShell } from "@/components/layout";

const COURIERS = ["Delhivery", "Shiprocket", "DTDC", "BlueDart", "Ekart"] as const;

const COURIER_STYLES: Record<string, { bg: string; badge: string; abbr: string }> = {
  Delhivery: { bg: "from-blue-50 to-blue-100/50 border-blue-200", badge: "bg-blue-100 text-blue-700", abbr: "DLV" },
  Shiprocket: { bg: "from-orange-50 to-orange-100/50 border-orange-200", badge: "bg-orange-100 text-orange-700", abbr: "SHR" },
  DTDC: { bg: "from-red-50 to-red-100/50 border-red-200", badge: "bg-red-100 text-red-700", abbr: "DTC" },
  BlueDart: { bg: "from-indigo-50 to-indigo-100/50 border-indigo-200", badge: "bg-indigo-100 text-indigo-700", abbr: "BLU" },
  Ekart: { bg: "from-amber-50 to-amber-100/50 border-amber-200", badge: "bg-amber-100 text-amber-700", abbr: "EKT" },
  Self: { bg: "from-slate-50 to-slate-100/50 border-slate-200", badge: "bg-slate-100 text-slate-600", abbr: "SLF" },
};

const STATUS_STYLES: Record<string, string> = {
  created: "bg-slate-100 text-slate-600",
  picked_up: "bg-amber-100 text-amber-700",
  "in-transit": "bg-blue-100 text-blue-700",
  "out-for-delivery": "bg-cyan-100 text-cyan-700",
  delivered: "bg-emerald-100 text-emerald-700",
  rto: "bg-orange-100 text-orange-700",
  lost: "bg-red-100 text-red-700",
};

export default function OmsShipments() {
  const loading = useSimulatedLoading(600);
  const [courierFilter, setCourierFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

  const customerMap = useMemo(() =>
    omsOrders.reduce<Record<string, string>>((acc, o) => { acc[o.id] = o.customerName; return acc; }, {}),
  []);

  const courierStats = useMemo(() =>
    COURIERS.map(c => ({
      courier: c,
      total: omsShipments.filter(s => s.courier === c).length,
      inTransit: omsShipments.filter(s => s.courier === c && ["in-transit", "out-for-delivery", "picked_up"].includes(s.status)).length,
      delivered: omsShipments.filter(s => s.courier === c && s.status === "delivered").length,
      rto: omsShipments.filter(s => s.courier === c && s.status === "rto").length,
    })).map(c => ({
      ...c,
      rtoRate: c.total > 0 ? Math.round((c.rto / c.total) * 100) : 0,
    })),
  []);

  const filtered = useMemo(() => {
    let list = [...omsShipments].sort((a, b) => b.shippedDate.localeCompare(a.shippedDate));
    if (courierFilter !== "all") list = list.filter(s => s.courier === courierFilter);
    if (statusFilter !== "all") list = list.filter(s => s.status === statusFilter);
    if (search) list = list.filter(s =>
      s.awbNumber.toLowerCase().includes(search.toLowerCase()) ||
      s.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      s.city.toLowerCase().includes(search.toLowerCase()) ||
      (customerMap[s.orderId] || "").toLowerCase().includes(search.toLowerCase())
    );
    return list;
  }, [courierFilter, statusFilter, search, customerMap]);

  const rtoShipments = omsShipments.filter(s => s.status === "rto");

  if (loading) {
    return (
      <PageShell>
        <div className="h-14 w-72 bg-muted rounded-lg" />
        <div className="grid grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => <div key={i} className="h-32 bg-muted rounded-xl" />)}
        </div>
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
              <h1 className="text-2xl font-bold" data-testid="shipments-heading">Shipments</h1>
              <p className="text-sm text-muted-foreground mt-0.5">Track shipments across Delhivery, Shiprocket, DTDC, BlueDart and Ekart</p>
            </div>
            <Button style={{ backgroundColor: "#0891B2" }} className="text-white hover:opacity-90" data-testid="btn-book-shipment">
              + Book Shipment
            </Button>
          </div>
        </Fade>

        <Stagger>
          <div className="grid grid-cols-5 gap-4">
            {courierStats.map((cs) => (
              <StaggerItem key={cs.courier}>
                <div className={cn("border rounded-xl p-4 bg-gradient-to-br", COURIER_STYLES[cs.courier].bg)} data-testid={`card-courier-${cs.courier}`}>
                  <div className="flex items-center justify-between mb-3">
                    <span className={cn("text-xs font-bold px-2 py-0.5 rounded", COURIER_STYLES[cs.courier].badge)}>{cs.courier}</span>
                    <span className="text-xs text-muted-foreground">{cs.total} ships.</span>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">In-Transit</span>
                      <span className="font-semibold text-blue-600">{cs.inTransit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Delivered</span>
                      <span className="font-semibold text-emerald-600">{cs.delivered}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">RTO</span>
                      <span className={cn("font-semibold", cs.rto > 0 ? "text-orange-600" : "text-muted-foreground")}>{cs.rto} ({cs.rtoRate}%)</span>
                    </div>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </div>
        </Stagger>

        {rtoShipments.length > 0 && (
          <Fade>
            <div className="flex items-center gap-3 p-4 rounded-xl border border-amber-200 bg-amber-50">
              <AlertTriangle className="size-4 text-amber-600 shrink-0" />
              <p className="text-sm text-amber-700">
                <span className="font-semibold">{rtoShipments.length} shipments</span> are marked RTO — log returns to process refunds or restocking.
              </p>
            </div>
          </Fade>
        )}

        <Fade>
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => setCourierFilter("all")}
              className={cn("px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
                courierFilter === "all" ? "bg-cyan-600 text-white" : "bg-muted text-muted-foreground hover:bg-accent"
              )}
            >
              All Couriers
            </button>
            {COURIERS.map(c => (
              <button
                key={c}
                onClick={() => setCourierFilter(c)}
                data-testid={`filter-courier-${c}`}
                className={cn("px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
                  courierFilter === c ? "bg-cyan-600 text-white" : "bg-muted text-muted-foreground hover:bg-accent"
                )}
              >
                {c}
              </button>
            ))}
            <div className="flex-1" />
            <div className="flex rounded-lg border border-border overflow-hidden">
              {(["all", "in-transit", "delivered", "rto", "lost"] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  data-testid={`filter-shipstatus-${s}`}
                  className={cn("px-3 py-1.5 text-xs font-medium capitalize transition-colors",
                    statusFilter === s ? "bg-cyan-600 text-white" : "bg-background text-muted-foreground hover:bg-muted"
                  )}
                >
                  {s === "all" ? "All" : s}
                </button>
              ))}
            </div>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
              <Input className="pl-8 h-9 w-44" placeholder="Search AWB..." value={search} onChange={e => setSearch(e.target.value)} data-testid="input-search-shipments" />
            </div>
          </div>

          <div className="border border-border rounded-xl overflow-hidden bg-background">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">AWB #</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Order #</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Courier</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Customer</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">City / State</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground">Weight</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground">COD ₹</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Status / Milestone</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Shipped</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">EDD</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <tr
                    key={s.id}
                    className={cn(
                      "border-b border-border/50 hover:bg-muted/20",
                      s.status === "rto" && "bg-amber-50",
                      s.status === "lost" && "bg-red-50"
                    )}
                    data-testid={`row-shipment-${s.id}`}
                  >
                    <td className="py-2.5 px-4 text-xs text-cyan-700">{s.awbNumber}</td>
                    <td className="py-2.5 px-4 text-xs text-muted-foreground">{s.orderNumber}</td>
                    <td className="py-2.5 px-4">
                      <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded", COURIER_STYLES[s.courier]?.badge || "bg-slate-100 text-slate-600")}>{COURIER_STYLES[s.courier]?.abbr || s.courier}</span>
                    </td>
                    <td className="py-2.5 px-4">
                      <PersonCell name={customerMap[s.orderId] || "—"} size="xs" />
                    </td>
                    <td className="py-2.5 px-4">
                      <p className="text-xs font-medium">{s.city}</p>
                      <p className="text-[10px] text-muted-foreground">{s.state} · {s.pincode}</p>
                    </td>
                    <td className="py-2.5 px-4 text-right text-xs text-muted-foreground">{(s.weightGrams / 1000).toFixed(1)} kg</td>
                    <td className="py-2.5 px-4 text-right text-xs">{s.codAmount > 0 ? `₹${s.codAmount.toLocaleString()}` : "—"}</td>
                    <td className="py-2.5 px-4">
                      <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize", STATUS_STYLES[s.status])}>{s.status.replace(/-/g, " ")}</span>
                      <p className="text-[10px] text-muted-foreground mt-0.5 truncate max-w-[160px]">{s.lastMilestone}</p>
                    </td>
                    <td className="py-2.5 px-4 text-xs text-muted-foreground">{s.shippedDate}</td>
                    <td className="py-2.5 px-4 text-xs text-muted-foreground">{s.expectedDelivery}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-4 py-3 border-t border-border bg-muted/20">
              <p className="text-xs text-muted-foreground">Showing {filtered.length} of {omsShipments.length} shipments</p>
            </div>
          </div>
        </Fade>
      </div>
    </PageTransition>
  );
}
