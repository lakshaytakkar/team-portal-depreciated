import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft, Printer, CheckCircle, XCircle, AlertTriangle,
  FileText, BookOpen, ExternalLink, Truck, MapPin, Package, Mail,
} from "lucide-react";
import { CompanyCell } from "@/components/ui/avatar-cells";
import { SiWhatsapp } from "react-icons/si";
import { Fade } from "@/components/ui/animated";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  faireQuotations, faireFulfillers, faireLedgerEntries,
} from "@/lib/mock-data-faire-ops";
import {
  PageShell, SectionCard, DetailModal, DetailSection,
  DataTableContainer, DataTH, DataTD, InfoRow,
} from "@/components/layout";
import { DualCurrency, DualCurrencyInline, formatUSD, formatINR } from "@/lib/faire-currency";
import {
  FAIRE_COLOR,
  type OrderState,
  ORDER_STATE_CONFIG,
  QUOT_STATUS_CONFIG,
  LED_STATUS_CONFIG,
  TIMELINE_STATES,
  SOURCE_LABELS,
  CANCEL_REASONS,
  CARRIERS,
  SHIP_TYPES,
} from "@/lib/faire-config";

export default function FaireOrderDetail() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/faire/orders/:id");
  const { toast } = useToast();

  const { data: ordersData, isLoading: ordersLoading } = useQuery<{ orders: any[] }>({
    queryKey: ['/api/faire/orders'],
    queryFn: async () => {
      const res = await fetch("/api/faire/orders", { headers: { "Cache-Control": "no-cache" } });
      if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`);
      return res.json();
    },
  });
  const { data: storesData, isLoading: storesLoading } = useQuery<{ stores: any[] }>({
    queryKey: ['/api/faire/stores'],
    queryFn: async () => {
      const res = await fetch("/api/faire/stores", { headers: { "Cache-Control": "no-cache" } });
      if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`);
      return res.json();
    },
  });

  const isLoading = ordersLoading || storesLoading;
  const orders = ordersData?.orders ?? [];
  const stores = storesData?.stores ?? [];

  const order = orders.find((o: any) => o.id === params?.id) ?? orders[0];
  const store = order ? stores.find((s: any) => s.id === order._storeId) : undefined;

  const [productThumbMap, setProductThumbMap] = useState<Record<string, string | null>>({});

  useEffect(() => {
    if (!order?.items?.length || !order._storeId) return;
    const productIds = [...new Set(order.items.map((i: any) => i.product_id).filter(Boolean))] as string[];
    if (productIds.length === 0) return;
    const alreadyResolved = productIds.every(pid => pid in productThumbMap);
    if (alreadyResolved) return;
    fetch("/api/faire/product-thumbs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productIds, storeId: order._storeId }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.thumbs) setProductThumbMap(prev => ({ ...prev, ...data.thumbs }));
      })
      .catch(() => {});
  }, [order?.id, order?._storeId]);

  const linkedQuote = order ? faireQuotations.find(q => q.order_id === order.id) : undefined;
  const linkedFulfiller = linkedQuote ? faireFulfillers.find(f => f.id === linkedQuote.fulfiller_id) : null;
  const linkedLedger = order ? faireLedgerEntries.find(e => e.order_id === order.id) : undefined;

  const [addShipOpen, setAddShipOpen] = useState(false);
  const [carrier, setCarrier] = useState("UPS");
  const [tracking, setTracking] = useState("");
  const [makerCostDollars, setMakerCostDollars] = useState("");
  const [shipType, setShipType] = useState("SHIP_ON_YOUR_OWN");
  const [shipLoading, setShipLoading] = useState(false);
  const [shipFaireResult, setShipFaireResult] = useState<string | null>(null);

  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("REQUESTED_BY_RETAILER");
  const [cancelLoading, setCancelLoading] = useState(false);

  const [acceptLoading, setAcceptLoading] = useState(false);

  const cfg = order ? ORDER_STATE_CONFIG[order.state as OrderState] : ORDER_STATE_CONFIG.NEW;
  const timelineIdx = order ? TIMELINE_STATES.indexOf(order.state as OrderState) : -1;
  const itemsTotal = order ? (order.items ?? []).reduce((sum: number, i: any) => sum + i.price_cents * i.quantity, 0) : 0;
  const commissionAmt = order?.payout_costs?.commission_cents ?? 0;
  const payout = itemsTotal - commissionAmt - (order?.payout_costs?.payout_fee_cents ?? 0);

  const retailerDisplayName = order?.address?.company_name || order?.address?.name || order?.retailer_id || "Unknown";

  async function handleAccept() {
    setAcceptLoading(true);
    try {
      const res = await fetch(`/api/faire/orders/${order.id}/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeId: order._storeId }),
      });
      const data = await res.json() as { success: boolean; error?: string };
      if (data.success) {
        toast({ title: "Order Accepted", description: "Moved to Processing" });
      } else {
        toast({ title: "Faire API Error", description: data.error ?? "Unknown error", variant: "destructive" });
      }
    } catch {
      toast({ title: "Network error", variant: "destructive" });
    } finally {
      setAcceptLoading(false);
    }
  }

  async function handleCancel() {
    setCancelLoading(true);
    try {
      const res = await fetch(`/api/faire/orders/${order.id}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeId: order._storeId, reason: cancelReason }),
      });
      const data = await res.json() as { success: boolean; error?: string };
      if (data.success) {
        toast({ title: "Order Canceled", description: `${CANCEL_REASONS.find(r => r.value === cancelReason)?.label}` });
        setCancelOpen(false);
      } else {
        toast({ title: "Faire API Error", description: data.error ?? "Unknown error", variant: "destructive" });
      }
    } catch {
      toast({ title: "Network error", variant: "destructive" });
    } finally {
      setCancelLoading(false);
    }
  }

  async function handleAddShipment() {
    if (!tracking) {
      toast({ title: "Enter a tracking code", variant: "destructive" });
      return;
    }
    setShipLoading(true);
    setShipFaireResult(null);
    try {
      const res = await fetch(`/api/faire/orders/${order.id}/shipments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeId: order._storeId,
          carrier,
          tracking_code: tracking,
          maker_cost_cents: Math.round(parseFloat(makerCostDollars || "0") * 100),
          shipping_type: shipType,
        }),
      });
      const data = await res.json() as { success: boolean; mock?: boolean; error?: string };
      if (data.success) {
        const note = data.mock ? " (mock mode)" : " — pushed to Faire";
        setShipFaireResult(`${carrier} ${tracking}${note}`);
        toast({ title: "Shipment Added", description: `${carrier} — ${tracking}` });
      } else {
        toast({ title: "Error", description: data.error ?? "Failed to add shipment", variant: "destructive" });
      }
    } catch {
      toast({ title: "Network error", variant: "destructive" });
    } finally {
      setShipLoading(false);
    }
  }

  if (isLoading) {
    return (
      <PageShell className="animate-pulse">
        <div className="h-8 bg-muted rounded w-48" />
        <div className="h-16 bg-muted rounded-xl" />
        <div className="grid grid-cols-5 gap-5">
          <div className="col-span-3 space-y-4">
            <div className="h-48 bg-muted rounded-xl" />
            <div className="h-32 bg-muted rounded-xl" />
          </div>
          <div className="col-span-2 space-y-4">
            <div className="h-32 bg-muted rounded-xl" />
            <div className="h-24 bg-muted rounded-xl" />
          </div>
        </div>
      </PageShell>
    );
  }

  if (!order) {
    return (
      <PageShell>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => setLocation("/faire/orders")} data-testid="btn-back-not-found">
            <ArrowLeft size={15} className="mr-1.5" /> Orders
          </Button>
          <p className="text-sm text-muted-foreground">Order not found.</p>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      {order.has_pending_retailer_cancellation_request && (
        <Fade>
          <div className="flex items-center gap-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-300 rounded-xl px-4 py-3">
            <AlertTriangle size={16} className="shrink-0 text-amber-600" />
            <span className="text-sm font-medium text-amber-800 dark:text-amber-300">Retailer has requested cancellation of this order.</span>
          </div>
        </Fade>
      )}

      <Fade>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <Button variant="ghost" size="sm" className="mt-0.5" onClick={() => setLocation("/faire/orders")} data-testid="btn-back">
              <ArrowLeft size={15} />
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold font-heading">Order #{order.display_id}</h1>
                <span className="text-sm px-2.5 py-0.5 rounded-full font-medium" style={{ background: cfg.bg, color: cfg.color }}>{cfg.label}</span>
              </div>
              <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                <span>{new Date(order.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
                <span>·</span>
                <button className="hover:underline hover:text-primary" onClick={() => setLocation("/faire/stores")} data-testid="link-store-header">{store?.name ?? "Store"}</button>
                <span>·</span>
                <span>{SOURCE_LABELS[order.source] ?? order.source}</span>
                {order.is_free_shipping && (
                  <>
                    <span>·</span>
                    <span className="text-emerald-600 font-medium">Free Shipping</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {(() => {
              const itemLines = (order.items ?? []).map((i: any) => `• ${i.product_name} ×${i.quantity}`).join("\n");
              const total = (order.items ?? []).reduce((s: number, i: any) => s + i.price_cents * i.quantity, 0);
              const msg = `*Faire Order #${order.display_id}*\nRetailer: ${retailerDisplayName}\nStore: ${store?.name ?? ""}\nTotal: $${(total / 100).toFixed(2)}\n\nItems:\n${itemLines}`;
              const waUrl = `https://wa.me/?text=${encodeURIComponent(msg)}`;
              const mailSubject = `Faire Order #${order.display_id} – Quotation Request`;
              const mailBody = msg.replace(/\*/g, "");
              return (
                <>
                  <Button
                    variant="outline" size="sm"
                    className="text-[#25D366] border-[#25D366]/30 hover:bg-[#25D366]/10"
                    onClick={() => window.open(waUrl, "_blank")}
                    data-testid="btn-share-whatsapp"
                  >
                    <SiWhatsapp size={13} className="mr-1.5" /> WhatsApp
                  </Button>
                  <Button
                    variant="outline" size="sm"
                    onClick={() => window.open(`mailto:?subject=${encodeURIComponent(mailSubject)}&body=${encodeURIComponent(mailBody)}`, "_blank")}
                    data-testid="btn-share-email"
                  >
                    <Mail size={13} className="mr-1.5" /> Email
                  </Button>
                </>
              );
            })()}
            <Button variant="outline" size="sm" onClick={() => toast({ title: "Printing Packing Slip..." })} data-testid="btn-print">
              <Printer size={14} className="mr-2" /> Print Slip
            </Button>
            {order.state === "NEW" && (
              <Button size="sm" style={{ background: FAIRE_COLOR }} className="text-white hover:opacity-90" onClick={handleAccept} disabled={acceptLoading} data-testid="btn-accept">
                <CheckCircle size={14} className="mr-2" /> {acceptLoading ? "Accepting…" : "Accept Order"}
              </Button>
            )}
            {(order.state === "NEW" || order.state === "PROCESSING" || order.state === "PRE_TRANSIT") && (
              <Button variant="outline" size="sm" className="text-red-500 hover:text-red-600 border-red-200" onClick={() => setCancelOpen(true)} data-testid="btn-cancel">
                <XCircle size={14} className="mr-2" /> Cancel
              </Button>
            )}
          </div>
        </div>
      </Fade>

      <Fade>
        <div className="flex items-center gap-0 py-2">
          {TIMELINE_STATES.map((state, i) => {
            const stateCfg = ORDER_STATE_CONFIG[state];
            const isActive = i <= timelineIdx && timelineIdx >= 0;
            const isCurrent = TIMELINE_STATES[timelineIdx] === state;
            return (
              <div key={state} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`size-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${isActive ? "text-white border-transparent" : "text-muted-foreground border-muted"}`}
                    style={isActive ? { background: FAIRE_COLOR } : {}}
                  >
                    {i + 1}
                  </div>
                  <p className={`text-xs mt-1.5 font-medium ${isCurrent ? "text-foreground" : "text-muted-foreground"}`}>{stateCfg.label}</p>
                </div>
                {i < TIMELINE_STATES.length - 1 && (
                  <div className={`flex-1 h-0.5 mb-5 ${i < timelineIdx && timelineIdx >= 0 ? "" : "bg-muted"}`} style={i < timelineIdx && timelineIdx >= 0 ? { background: FAIRE_COLOR } : {}} />
                )}
              </div>
            );
          })}
        </div>
      </Fade>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <div className="lg:col-span-3 space-y-5">
          <Fade>
            <SectionCard title="Order Items" noPadding>
              <DataTableContainer>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/30">
                      <DataTH className="w-12"></DataTH>
                      <DataTH>Product</DataTH>
                      <DataTH>SKU</DataTH>
                      <DataTH align="center">Qty</DataTH>
                      <DataTH>Unit Price</DataTH>
                      <DataTH>Line Total</DataTH>
                      <DataTH>Status</DataTH>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {(order.items ?? []).map((item: any) => {
                      const isBackordered = item.state === "BACKORDERED";
                      const thumb = productThumbMap[item.product_id] ?? null;
                      return (
                        <tr key={item.id} className={isBackordered ? "bg-amber-50/50 dark:bg-amber-950/10" : ""} data-testid={`item-row-${item.id}`}>
                          <DataTD>
                            <div className="w-10 h-10 rounded-md overflow-hidden bg-muted flex items-center justify-center shrink-0">
                              {thumb ? (
                                <img src={thumb} alt={item.product_name} loading="lazy" decoding="async" className="w-full h-full object-cover" />
                              ) : (
                                <Package size={16} className="text-muted-foreground/50" />
                              )}
                            </div>
                          </DataTD>
                          <DataTD>
                            <p className="font-medium">{item.product_name}</p>
                            <p className="text-sm text-muted-foreground">{item.variant_name}</p>
                            {item.includes_tester && <Badge variant="outline" className="text-xs mt-1">Tester</Badge>}
                            {(item.discounts ?? []).length > 0 && (
                              <div className="flex gap-1 mt-1">
                                {(item.discounts ?? []).map((d: any) => (
                                  <Badge key={d.id} variant="outline" className="text-xs text-emerald-600 border-emerald-200">{d.code}</Badge>
                                ))}
                              </div>
                            )}
                          </DataTD>
                          <DataTD className="text-muted-foreground">{item.sku}</DataTD>
                          <DataTD align="center">{item.quantity}</DataTD>
                          <DataTD><DualCurrency cents={item.price_cents} /></DataTD>
                          <DataTD className="font-semibold"><DualCurrency cents={item.price_cents * item.quantity} /></DataTD>
                          <DataTD>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${isBackordered ? "bg-amber-100 text-amber-700" : "bg-emerald-50 text-emerald-700"}`}>
                              {item.state}
                            </span>
                          </DataTD>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </DataTableContainer>
            </SectionCard>
          </Fade>

          <Fade>
            <SectionCard title="Payout Breakdown">
              <div className="space-y-2">
                <InfoRow label="Items Total">
                  <DualCurrencyInline cents={itemsTotal} className="text-sm font-medium" />
                </InfoRow>
                <InfoRow label={`Commission${order.payout_costs?.commission_bps ? ` (${(order.payout_costs.commission_bps / 100).toFixed(0)}%)` : ""}`}>
                  {commissionAmt > 0 ? <span className="text-sm font-medium">-{formatUSD(commissionAmt)} <span className="text-xs text-muted-foreground/70 font-normal">(-{formatINR(commissionAmt)})</span></span> : <span className="text-sm font-medium">—</span>}
                </InfoRow>
                <InfoRow label="Platform Fee">
                  {(order.payout_costs?.payout_fee_cents ?? 0) > 0 ? <span className="text-sm font-medium">-{formatUSD(order.payout_costs.payout_fee_cents)} <span className="text-xs text-muted-foreground/70 font-normal">(-{formatINR(order.payout_costs.payout_fee_cents)})</span></span> : <span className="text-sm font-medium">—</span>}
                </InfoRow>
                <div className="border-t pt-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">Estimated Payout</span>
                  <DualCurrencyInline cents={payout} className="text-lg font-bold text-emerald-700 dark:text-emerald-400" />
                </div>
                {order.is_free_shipping && order.free_shipping_reason && (
                  <p className="text-xs text-muted-foreground pt-1">Free shipping: {order.free_shipping_reason.replace(/_/g, " ")}</p>
                )}
              </div>
            </SectionCard>
          </Fade>

          <Fade>
            <SectionCard title="Delivery Address">
              <div className="flex items-start gap-3">
                <div className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: "rgba(26, 107, 69, 0.1)" }}>
                  <MapPin size={16} style={{ color: FAIRE_COLOR }} />
                </div>
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">{order.address?.name}</p>
                  {order.address?.company_name && <p className="text-sm text-muted-foreground">{order.address.company_name}</p>}
                  <p className="text-sm text-muted-foreground">{order.address?.address1}</p>
                  {order.address?.address2 && <p className="text-sm text-muted-foreground">{order.address.address2}</p>}
                  <p className="text-sm text-muted-foreground">{order.address?.city}, {order.address?.state_code ?? order.address?.state} {order.address?.postal_code}</p>
                  <p className="text-sm text-muted-foreground">{order.address?.country}</p>
                  {order.address?.phone_number && <p className="text-sm text-muted-foreground">{order.address.phone_number}</p>}
                </div>
              </div>
            </SectionCard>
          </Fade>

          {(order.brand_discounts ?? []).length > 0 && (
            <Fade>
              <SectionCard title="Brand Discounts">
                <div className="space-y-2">
                  {(order.brand_discounts ?? []).map((d: any) => (
                    <div key={d.id} className="flex items-center justify-between">
                      <Badge variant="outline">{d.code}</Badge>
                      <span className="text-sm text-muted-foreground">
                        {d.discount_type === "PERCENTAGE" ? `${d.discount_percentage}% off` : "Flat discount"}
                        {d.includes_free_shipping && " + Free shipping"}
                      </span>
                    </div>
                  ))}
                </div>
              </SectionCard>
            </Fade>
          )}
        </div>

        <div className="lg:col-span-2 space-y-5">
          <Fade>
            <SectionCard title="Retailer">
              <div className="space-y-3">
                <button className="hover:underline hover:text-primary" onClick={() => setLocation(`/faire/retailers/${order.retailer_id}`)} data-testid="link-retailer-name">
                  <CompanyCell
                    name={retailerDisplayName}
                    subtitle={order.address?.city ? `${order.address.city}${order.address.state_code ? `, ${order.address.state_code}` : order.address.state ? `, ${order.address.state}` : ""}` : undefined}
                    size="lg"
                  />
                </button>
                {(() => {
                  const retailerOrders = orders.filter((o: any) => o.retailer_id === order.retailer_id);
                  const totalSpent = retailerOrders.reduce((sum: number, o: any) => sum + (o.items ?? []).reduce((s: number, i: any) => s + i.price_cents * i.quantity, 0), 0);
                  return (
                    <div className="space-y-1">
                      <InfoRow label="Total Orders" value={retailerOrders.length} />
                      <InfoRow label="Total Spent">
                        <span className="text-sm font-medium"><DualCurrency cents={totalSpent} /></span>
                      </InfoRow>
                    </div>
                  );
                })()}
                <Button size="sm" variant="outline" className="w-full" onClick={() => setLocation(`/faire/retailers/${order.retailer_id}`)} data-testid="btn-view-retailer">
                  View Retailer Profile
                </Button>
              </div>
            </SectionCard>
          </Fade>

          <Fade>
            <SectionCard title="Quotation">
              {linkedQuote ? (
                <div className="space-y-2">
                  <InfoRow label="Fulfiller" value={linkedFulfiller?.name ?? linkedQuote.fulfiller_id} />
                  <InfoRow label="Status">
                    {(() => {
                      const qsc = QUOT_STATUS_CONFIG[linkedQuote.status];
                      return <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: qsc.bg, color: qsc.color }}>{qsc.label}</span>;
                    })()}
                  </InfoRow>
                  {linkedQuote.status !== "DRAFT" && linkedQuote.status !== "SENT" && (
                    <>
                      <InfoRow label="Fulfiller Total">
                        <DualCurrencyInline cents={linkedQuote.items.reduce((s, i) => s + i.fulfiller_unit_cost_cents * i.ordered_quantity, 0) + linkedQuote.fulfiller_shipping_cost_cents} className="text-sm font-medium" />
                      </InfoRow>
                      <InfoRow label="Est. Margin">
                        <span className="text-sm font-semibold text-emerald-600">
                          {(() => {
                            const ftotal = linkedQuote.items.reduce((s, i) => s + i.fulfiller_unit_cost_cents * i.ordered_quantity, 0) + linkedQuote.fulfiller_shipping_cost_cents;
                            return payout > 0 ? `${Math.round(((payout - ftotal) / payout) * 100)}%` : "—";
                          })()}
                        </span>
                      </InfoRow>
                    </>
                  )}
                  <Button size="sm" variant="outline" className="w-full" onClick={() => setLocation(`/faire/quotations/${linkedQuote.id}`)} data-testid="btn-view-quotation">
                    <ExternalLink size={13} className="mr-2" /> View Quotation
                  </Button>
                </div>
              ) : (
                <div className="text-center py-3">
                  <FileText size={20} className="mx-auto mb-2 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground mb-3">No quotation yet</p>
                  <Button size="sm" variant="outline" onClick={() => setLocation("/faire/quotations")} data-testid="btn-request-quote-from-detail">
                    Request Quote
                  </Button>
                </div>
              )}
            </SectionCard>
          </Fade>

          <Fade>
            <SectionCard title="Financials">
              {linkedLedger ? (
                <div className="space-y-2">
                  <InfoRow label="Faire Payout">
                    <DualCurrencyInline cents={linkedLedger.faire_payout_cents} className="text-sm font-semibold text-emerald-600" />
                  </InfoRow>
                  <InfoRow label="Fulfiller Cost">
                    <DualCurrencyInline cents={linkedLedger.fulfiller_cost_cents + linkedLedger.shipping_cost_cents} className="text-sm font-medium" />
                  </InfoRow>
                  <div className="border-t pt-2">
                    <InfoRow label="Net Margin">
                      <DualCurrencyInline cents={linkedLedger.net_margin_cents} className={`text-sm font-bold`} />
                    </InfoRow>
                  </div>
                  <InfoRow label="Payment">
                    {(() => {
                      const lsc = LED_STATUS_CONFIG[linkedLedger.payment_status];
                      return <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: lsc.bg, color: lsc.color }}>{lsc.label}</span>;
                    })()}
                  </InfoRow>
                  <Button size="sm" variant="outline" className="w-full" onClick={() => setLocation("/faire/ledger")} data-testid="btn-view-ledger">
                    <ExternalLink size={13} className="mr-2" /> View in Ledger
                  </Button>
                </div>
              ) : (
                <div className="text-center py-3">
                  <BookOpen size={20} className="mx-auto mb-2 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">No ledger entry linked</p>
                </div>
              )}
            </SectionCard>
          </Fade>

          <Fade>
            <SectionCard title="Order Details">
              <div className="space-y-1">
                <InfoRow label="Source" value={SOURCE_LABELS[order.source]} />
                {order.purchase_order_number && <InfoRow label="PO Number" value={order.purchase_order_number} />}
                {order.sales_rep_name && <InfoRow label="Sales Rep" value={order.sales_rep_name} />}
                {order.ship_after && <InfoRow label="Ship After" value={new Date(order.ship_after).toLocaleDateString()} />}
                {order.estimated_payout_at && <InfoRow label="Est. Payout" value={new Date(order.estimated_payout_at).toLocaleDateString()} />}
                {order.notes && (
                  <div className="mt-3 p-3 bg-muted/40 rounded-lg">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Notes</p>
                    <p className="text-sm">{order.notes}</p>
                  </div>
                )}
              </div>
            </SectionCard>
          </Fade>

          <Fade>
            <SectionCard
              title="Shipments"
              viewAllLabel="+ Add"
              onViewAll={() => { setAddShipOpen(true); setCarrier("UPS"); setTracking(""); setMakerCostDollars(""); setShipType("SHIP_ON_YOUR_OWN"); setShipFaireResult(null); }}
            >
              {shipFaireResult && (
                <div className="mb-3 p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-sm text-emerald-700 flex items-center gap-2">
                  <CheckCircle size={14} /> {shipFaireResult}
                </div>
              )}
              {(order.shipments ?? []).length === 0 ? (
                <div className="text-center py-3">
                  <Truck size={20} className="mx-auto mb-2 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">No shipments yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {(order.shipments ?? []).map((ship: any) => (
                    <div key={ship.id} className="rounded-lg bg-muted/40 p-3">
                      <div className="flex items-center gap-2">
                        <Truck size={14} className="text-muted-foreground shrink-0" />
                        <span className="text-sm font-medium">{ship.carrier}</span>
                        <span className="text-sm text-muted-foreground">{ship.tracking_code}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground ml-6">
                        <span>{ship.shipped_at ? new Date(ship.shipped_at).toLocaleDateString() : "—"}</span>
                        <span>·</span>
                        <span className="font-medium text-foreground">{ship.maker_cost_cents != null ? <DualCurrencyInline cents={ship.maker_cost_cents} /> : "—"}</span>
                        <span>·</span>
                        <span>{ship.shipping_type === "SHIP_ON_YOUR_OWN" ? "Own Label" : "Faire Label"}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>
          </Fade>
        </div>
      </div>

      <DetailModal
        open={addShipOpen}
        onClose={() => setAddShipOpen(false)}
        title="Add Shipment"
        subtitle="Record tracking and shipping cost for this order"
        footer={
          <>
            <Button variant="outline" onClick={() => setAddShipOpen(false)}>Cancel</Button>
            <Button style={{ background: FAIRE_COLOR }} className="text-white hover:opacity-90" onClick={handleAddShipment} disabled={shipLoading} data-testid="btn-save-shipment">
              {shipLoading ? "Pushing…" : "Add Shipment"}
            </Button>
          </>
        }
      >
        <DetailSection title="Shipment Details">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Carrier</Label>
              <select value={carrier} onChange={e => setCarrier(e.target.value)} className="w-full h-10 border rounded-lg px-3 text-sm bg-background" data-testid="select-carrier">
                {CARRIERS.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Tracking Code</Label>
              <Input value={tracking} onChange={e => setTracking(e.target.value)} placeholder="Enter tracking code..." data-testid="input-tracking" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Shipping Cost ($)</Label>
              <Input type="number" value={makerCostDollars} onChange={e => setMakerCostDollars(e.target.value)} placeholder="e.g. 18.50" data-testid="input-maker-cost" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Shipping Type</Label>
              <select value={shipType} onChange={e => setShipType(e.target.value)} className="w-full h-10 border rounded-lg px-3 text-sm bg-background" data-testid="select-ship-type">
                {SHIP_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
          </div>
        </DetailSection>
      </DetailModal>

      <DetailModal
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        title="Cancel Order"
        subtitle="Select a reason for cancellation"
        footer={
          <>
            <Button variant="outline" onClick={() => setCancelOpen(false)} disabled={cancelLoading}>Back</Button>
            <Button variant="destructive" onClick={handleCancel} disabled={cancelLoading} data-testid="btn-confirm-cancel">
              {cancelLoading ? "Canceling…" : "Cancel Order"}
            </Button>
          </>
        }
      >
        <DetailSection title="Cancellation">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Reason</Label>
              <select value={cancelReason} onChange={e => setCancelReason(e.target.value)} className="w-full h-10 border rounded-lg px-3 text-sm bg-background" data-testid="select-cancel-reason">
                {CANCEL_REASONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>
          </div>
        </DetailSection>
      </DetailModal>
    </PageShell>
  );
}
