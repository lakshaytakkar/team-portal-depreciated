import { useState } from "react";
import { Printer, Truck } from "lucide-react";
import { SopModal, TutorialModal, SopTutorialButtons } from "@/components/sop/sop-modal";
import { SOP_REGISTRY } from "@/lib/sop-data";
import { Stagger, StaggerItem, Fade } from "@/components/ui/animated";
import { CompanyCell } from "@/components/ui/avatar-cells";
import { PageShell, PageHeader } from "@/components/layout";
import { FAIRE_COLOR } from "@/lib/faire-config";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { DualCurrencyInline } from "@/lib/faire-currency";
import { DetailModal } from "@/components/layout";

const CARRIERS = ["UPS", "FedEx", "USPS", "DHL"];
const SHIP_TYPES = [
  { value: "SHIP_ON_YOUR_OWN", label: "Ship on your own" },
  { value: "FAIRE_SHIPPING_LABEL", label: "Faire shipping label" },
];

function getAge(dateStr: string) {
  const diff = Math.round((Date.now() - new Date(dateStr).getTime()) / 86400000);
  if (diff === 0) return "today";
  if (diff === 1) return "1 day ago";
  return `${diff} days ago`;
}

export default function FaireFulfillment() {
  const { toast } = useToast();
  const [selectedStore, setSelectedStore] = useState("all");
  const [sopOpen, setSopOpen] = useState(false);
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const [shipOrderId, setShipOrderId] = useState<string | null>(null);
  const [carrier, setCarrier] = useState("UPS");
  const [tracking, setTracking] = useState("");
  const [makerCostDollars, setMakerCostDollars] = useState("");
  const [shipType, setShipType] = useState("SHIP_ON_YOUR_OWN");

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

  const isLoading = storesLoading || ordersLoading;
  const stores = storesData?.stores ?? [];
  const allOrders = ordersData?.orders ?? [];

  const queue = allOrders
    .filter(o => o.state === "NEW" || o.state === "PROCESSING")
    .filter(o => selectedStore === "all" || o._storeId === selectedStore)
    .sort((a, b) => a.created_at.localeCompare(b.created_at));

  if (isLoading) {
    return (
      <PageShell>
        <div className="animate-pulse space-y-6">
          <div className="h-10 bg-muted rounded w-64" />
          <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-muted rounded-xl" />)}</div>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <Fade>
        <PageHeader
          title="Fulfillment Queue"
          subtitle="Orders ready to pack and ship — sorted oldest first"
          actions={
            <div className="flex items-center gap-2">
              <SopTutorialButtons onSopClick={() => setSopOpen(true)} onTutorialClick={() => setTutorialOpen(true)} />
              <select value={selectedStore} onChange={e => setSelectedStore(e.target.value)} className="h-8 text-xs border rounded-lg px-2" data-testid="select-store">
                <option value="all">All Stores</option>
                {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              <Button size="sm" variant="outline" onClick={() => toast({ title: "Packing Slips", description: "Printing all packing slips..." })} data-testid="btn-print-all">
                <Printer size={13} className="mr-1.5" /> Print All Packing Slips
              </Button>
            </div>
          }
        />
      </Fade>

      <Fade>
        <div className="flex gap-4">
          <div className="rounded-xl border px-4 py-3 bg-blue-50 dark:bg-blue-950/20 border-blue-200">
            <p className="text-lg font-bold text-blue-700">{queue.filter(o => o.state === "NEW").length}</p>
            <p className="text-xs text-muted-foreground">New — To Accept</p>
          </div>
          <div className="rounded-xl border px-4 py-3 bg-violet-50 dark:bg-violet-950/20 border-violet-200">
            <p className="text-lg font-bold text-violet-700">{queue.filter(o => o.state === "PROCESSING").length}</p>
            <p className="text-xs text-muted-foreground">Processing — To Pack</p>
          </div>
        </div>
      </Fade>

      {queue.length === 0 && (
        <Fade>
          <div className="text-center py-16 text-muted-foreground">
            <Truck size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">Fulfillment queue is empty. All orders are shipped!</p>
          </div>
        </Fade>
      )}

      <Stagger>
        <div className="space-y-3">
          {queue.map(order => {
            const store = stores.find(s => s.id === order._storeId);
            const isNew = order.state === "NEW";
            const itemsTotal = (order.items ?? []).reduce((sum: number, i: any) => sum + i.price_cents * i.quantity, 0);
            return (
              <StaggerItem key={order.id}>
                <div
                  className="rounded-xl border bg-card p-4 flex items-start gap-4"
                  style={{ borderLeftWidth: 3, borderLeftColor: isNew ? "#D97706" : FAIRE_COLOR }}
                  data-testid={`fulfillment-card-${order.id}`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <Badge variant="outline" className="text-xs">{order.display_id}</Badge>
                      <Badge variant="outline" className="text-xs">{store?.name?.split(" ")[0] ?? "Store"}</Badge>
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={isNew
                          ? { background: "#FFFBEB", color: "#D97706" }
                          : { background: "#ECFDF5", color: "#059669" }}
                      >
                        {isNew ? "New — Accept First" : "Processing — Pack Now"}
                      </span>
                      {order.has_pending_retailer_cancellation_request && (
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-red-50 text-red-600">Cancel Requested</span>
                      )}
                    </div>
                    <CompanyCell
                      name={order.address?.company_name ?? order.address?.name ?? order.retailer_id}
                      subtitle={[order.address?.city, order.address?.state].filter(Boolean).join(", ") || undefined}
                      size="sm"
                    />
                    <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                      <span>{(order.items ?? []).length} {(order.items ?? []).length === 1 ? "item" : "items"}</span>
                      <span className="font-semibold text-foreground"><DualCurrencyInline cents={itemsTotal} /></span>
                      <span>Ordered {getAge(order.created_at)}</span>
                    </div>
                    <div className="mt-2 space-y-1">
                      {(order.items ?? []).map((item: any) => (
                        <p key={item.id} className="text-xs text-muted-foreground">• {item.product_name} — {item.variant_name} × {item.quantity}</p>
                      ))}
                    </div>
                    {order.notes && (
                      <p className="text-xs text-amber-700 bg-amber-50 dark:bg-amber-950/20 rounded px-2 py-1 mt-2">Note: {order.notes}</p>
                    )}
                  </div>
                  <Button
                    size="sm"
                    style={{ background: FAIRE_COLOR }}
                    className="text-white hover:opacity-90 shrink-0"
                    onClick={() => { setShipOrderId(order.id); setCarrier("UPS"); setTracking(""); setMakerCostDollars(""); setShipType("SHIP_ON_YOUR_OWN"); }}
                    data-testid={`btn-ship-${order.id}`}
                  >
                    <Truck size={13} className="mr-1.5" /> Record Shipment
                  </Button>
                </div>
              </StaggerItem>
            );
          })}
        </div>
      </Stagger>

      <DetailModal
        open={!!shipOrderId}
        onClose={() => setShipOrderId(null)}
        title="Record Shipment"
        subtitle="Log carrier, tracking, and shipping cost for this order"
        footer={
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setShipOrderId(null)}>Cancel</Button>
            <Button style={{ background: FAIRE_COLOR }} className="text-white hover:opacity-90" onClick={() => { toast({ title: "Shipment Recorded", description: `${carrier} — ${tracking || "No tracking"}. Order moved to In-Transit.` }); setShipOrderId(null); }} data-testid="btn-confirm-ship">Record Shipment</Button>
          </div>
        }
      >
        <div className="space-y-4 px-6 py-5">
          <div className="space-y-1.5">
            <Label>Carrier</Label>
            <select value={carrier} onChange={e => setCarrier(e.target.value)} className="w-full h-9 border rounded-lg px-3 text-sm bg-background" data-testid="select-carrier">
              {CARRIERS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label>Tracking Code</Label>
            <Input value={tracking} onChange={e => setTracking(e.target.value)} placeholder="Enter tracking code..." data-testid="input-tracking" />
          </div>
          <div className="space-y-1.5">
            <Label>Shipping Cost ($)</Label>
            <Input type="number" value={makerCostDollars} onChange={e => setMakerCostDollars(e.target.value)} placeholder="e.g. 18.50" data-testid="input-maker-cost" />
          </div>
          <div className="space-y-1.5">
            <Label>Shipping Type</Label>
            <select value={shipType} onChange={e => setShipType(e.target.value)} className="w-full h-9 border rounded-lg px-3 text-sm bg-background" data-testid="select-ship-type">
              {SHIP_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
        </div>
      </DetailModal>

      <SopModal open={sopOpen} onOpenChange={setSopOpen} config={SOP_REGISTRY["faire-fulfillment"].sop} color={FAIRE_COLOR} />
      <TutorialModal open={tutorialOpen} onOpenChange={setTutorialOpen} config={SOP_REGISTRY["faire-fulfillment"].tutorial} color={FAIRE_COLOR} />
    </PageShell>
  );
}
