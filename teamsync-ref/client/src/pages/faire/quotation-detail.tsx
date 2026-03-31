import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft, Star, CheckCircle, AlertTriangle, XCircle, Send,
  ExternalLink, Package, MessageSquare, MapPin, Mail, Clock,
} from "lucide-react";
import { CompanyCell, PersonCell } from "@/components/ui/avatar-cells";
import { Fade } from "@/components/ui/animated";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { DualCurrency, DualCurrencyInline } from "@/lib/faire-currency";
import {
  faireQuotations, type FaireQuotation, type QuotationStatus,
} from "@/lib/mock-data-faire-ops";
import { DetailModal, InfoRow } from "@/components/layout";
import { FAIRE_COLOR } from "@/lib/faire-config";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";


const STATUS_CONFIG: Record<QuotationStatus, { label: string; color: string; bg: string }> = {
  DRAFT:          { label: "Draft",          color: "#6B7280", bg: "#F9FAFB" },
  SENT:           { label: "Sent",           color: "#2563EB", bg: "#EFF6FF" },
  QUOTE_RECEIVED: { label: "Quote Received", color: "#D97706", bg: "#FFFBEB" },
  ACCEPTED:       { label: "Accepted",       color: "#059669", bg: "#ECFDF5" },
  CHALLENGED:     { label: "Challenged",     color: "#EA580C", bg: "#FFF7ED" },
  SENT_ELSEWHERE: { label: "Sent Elsewhere", color: "#64748B", bg: "#F1F5F9" },
};

const FULFILLER_ID_TO_NAME: Record<string, string> = {
  "fulf-001": "ShipFast Logistics",
  "fulf-002": "GlobalPack Co",
  "fulf-003": "QuickFulfill EU",
  "fulf-004": "AsiaDirect Supply",
};

function StepTimeline({ status }: { status: QuotationStatus }) {
  const steps = ["DRAFT", "SENT", "QUOTE_RECEIVED"];
  const terminalIndex = ["ACCEPTED", "CHALLENGED", "SENT_ELSEWHERE"].includes(status) ? 3 : steps.indexOf(status);
  return (
    <div className="flex items-center gap-0 mb-2">
      {steps.map((step, i) => {
        const sc = STATUS_CONFIG[step as QuotationStatus];
        const done = i < terminalIndex || (i === 2 && ["ACCEPTED", "CHALLENGED", "SENT_ELSEWHERE"].includes(status));
        const active = steps.indexOf(status) === i;
        return (
          <div key={step} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2"
                style={{
                  background: done || active ? sc.bg : "var(--muted)",
                  borderColor: done || active ? sc.color : "var(--border)",
                  color: done || active ? sc.color : "var(--muted-foreground)",
                }}
              >
                {done ? "✓" : i + 1}
              </div>
              <span className="text-xs mt-1.5 font-medium whitespace-nowrap" style={{ color: done || active ? sc.color : "var(--muted-foreground)" }}>
                {sc.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className="flex-1 h-0.5 mx-2 mb-6" style={{ background: i < terminalIndex ? FAIRE_COLOR : "var(--border)" }} />
            )}
          </div>
        );
      })}
      <div className="flex items-center flex-1">
        <div className="flex-1 h-0.5 mx-2 mb-6" style={{ background: ["ACCEPTED", "CHALLENGED", "SENT_ELSEWHERE"].includes(status) ? FAIRE_COLOR : "var(--border)" }} />
        <div className="flex flex-col items-center">
          {(["ACCEPTED", "CHALLENGED", "SENT_ELSEWHERE"] as QuotationStatus[]).includes(status) ? (
            <>
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2"
                style={{ background: STATUS_CONFIG[status].bg, borderColor: STATUS_CONFIG[status].color, color: STATUS_CONFIG[status].color }}>
                ✓
              </div>
              <span className="text-xs mt-1.5 font-medium whitespace-nowrap" style={{ color: STATUS_CONFIG[status].color }}>
                {STATUS_CONFIG[status].label}
              </span>
            </>
          ) : (
            <>
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm border-2 border-dashed border-muted-foreground/30 text-muted-foreground">4</div>
              <span className="text-xs mt-1.5 text-muted-foreground">Decision</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5 items-center">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} className="h-3.5 w-3.5" fill={i <= Math.round(rating) ? "#F59E0B" : "none"} stroke={i <= Math.round(rating) ? "#F59E0B" : "#D1D5DB"} />
      ))}
      <span className="text-sm text-muted-foreground ml-1 font-medium">{rating}</span>
    </div>
  );
}

export default function FaireQuotationDetail() {
  const [, params] = useRoute("/faire/quotations/:id");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const id = params?.id ?? "";

  const { data: ordersData } = useQuery<{ orders: any[] }>({ queryKey: ["/api/faire/orders"] });
  const allOrders: any[] = ordersData?.orders ?? [];

  const { data: vendorsData } = useQuery<{ vendors: any[] }>({ queryKey: ["/api/faire/vendors"] });
  const allVendors: any[] = vendorsData?.vendors ?? [];

  const [quotations, setQuotations] = useState(faireQuotations);
  const quotation = quotations.find(q => q.id === id);
  const [ourNotes, setOurNotes] = useState(quotation?.our_notes ?? "");
  const [challengeDialog, setChallengeDialog] = useState(false);
  const [challengeText, setChallengeText] = useState("");
  const [elsewhereDialog, setElsewhereDialog] = useState(false);
  const [elsewhereFulfillerId, setElsewhereFulfillerId] = useState("");

  if (!quotation) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        <p className="text-base">Quotation not found.</p>
        <Button variant="outline" className="mt-4" onClick={() => setLocation("/faire/quotations")}>
          Back to Quotations
        </Button>
      </div>
    );
  }

  const sc = STATUS_CONFIG[quotation.status];

  const quotationIndex = faireQuotations.findIndex(q => q.id === id);
  const order = allOrders.length > 0
    ? allOrders[quotationIndex >= 0 && quotationIndex < allOrders.length ? quotationIndex : 0]
    : null;

  const fulfillerName = FULFILLER_ID_TO_NAME[quotation.fulfiller_id] ?? "";
  const fulfiller = allVendors.find(v => v.name === fulfillerName) ?? allVendors[0] ?? null;

  const grossOrderValue = order ? order.items.reduce((s: number, i: any) => s + i.price_cents * i.quantity, 0) : 0;
  const commission = order?.payout_costs?.commission_cents ?? Math.round(grossOrderValue * 0.2);
  const fairePayout = grossOrderValue - commission;

  const quoteItems = order
    ? order.items.map((oi: any, idx: number) => {
        const mock = quotation.items[idx] ?? quotation.items[quotation.items.length - 1];
        return {
          id: `qi_${oi.id}`,
          product_name: oi.product_name,
          variant_options: oi.variant_name ? [{ name: "Variant", value: oi.variant_name }] : [],
          image_url: mock?.image_url ?? "",
          ordered_quantity: oi.quantity,
          fulfiller_unit_cost_cents: Math.round(oi.price_cents * 0.4),
        };
      })
    : quotation.items;

  const itemsCost = quoteItems.reduce((s, i: any) => s + (i.fulfiller_unit_cost_cents ?? 0) * i.ordered_quantity, 0);
  const shippingCost = quotation.fulfiller_shipping_cost_cents;
  const fulfillerTotal = itemsCost + shippingCost;
  const netMargin = fairePayout - fulfillerTotal;
  const marginPct = fairePayout > 0 ? Math.round((netMargin / fairePayout) * 100) : 0;
  const marginColor = marginPct > 30 ? "#059669" : marginPct >= 15 ? "#D97706" : "#DC2626";

  function transition(newStatus: QuotationStatus, extra?: Partial<FaireQuotation>) {
    setQuotations(prev => prev.map(q => q.id === id ? { ...q, status: newStatus, our_notes: ourNotes, ...extra } : q));
  }

  function handleSend() {
    transition("SENT", { sent_at: new Date().toISOString() });
    toast({ title: "Sent to fulfiller", description: `Quote request sent to ${fulfiller?.name ?? "fulfiller"}` });
  }

  function handleMarkReceived() {
    transition("QUOTE_RECEIVED", { received_at: new Date().toISOString() });
    toast({ title: "Marked as received", description: "Quote received from fulfiller" });
  }

  function handleAccept() {
    transition("ACCEPTED", { accepted_at: new Date().toISOString() });
    toast({ title: "Quote accepted!", description: `Proceed to fulfillment for order #${order?.display_id}` });
  }

  function handleChallenge() {
    transition("CHALLENGED", { challenged_at: new Date().toISOString() });
    setChallengeDialog(false);
    toast({ title: "Quote challenged", description: "Fulfiller notified of counter-offer request" });
  }

  function handleSendElsewhere() {
    if (!elsewhereFulfillerId) return;
    transition("SENT_ELSEWHERE");
    setElsewhereDialog(false);
    toast({ title: "Sent to another fulfiller", description: "New draft quotation created" });
    setLocation("/faire/quotations");
  }

  return (
    <div className="py-8 px-6 max-w-screen-xl mx-auto space-y-6">

      {/* Breadcrumb */}
      <Fade>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => setLocation("/faire/quotations")} data-testid="button-back-quotations">
            <ArrowLeft size={16} className="mr-1" /> Quotations
          </Button>
          <span className="text-muted-foreground">/</span>
          <span className="text-sm font-semibold text-foreground">{quotation.id}</span>
          {order && (
            <>
              <span className="text-muted-foreground">/</span>
              <button
                className="text-sm font-bold px-2 py-0.5 rounded hover:opacity-80 transition-opacity"
                style={{ background: "#EFF6FF", color: "#2563EB" }}
                onClick={() => setLocation(`/faire/orders/${order.id}`)}
              >
                Order #{order.display_id}
              </button>
            </>
          )}
          <Badge style={{ background: sc.bg, color: sc.color }} className="border-0 text-sm font-medium">{sc.label}</Badge>
        </div>
      </Fade>

      {/* 3-column grid */}
      <Fade>
        <div className="grid grid-cols-10 gap-6">

          {/* LEFT: Order Context (30%) */}
          <div className="col-span-3 space-y-4">
            <div className="rounded-xl border bg-card p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Package className="h-4 w-4 text-muted-foreground" />
                <span className="font-semibold text-base">Order Context</span>
              </div>

              {order ? (
                <>
                  <div className="space-y-1 mb-4">
                    <InfoRow label="Order">
                      <button
                        className="text-sm px-2.5 py-0.5 rounded font-bold hover:opacity-80 transition-opacity"
                        style={{ background: "#EFF6FF", color: "#2563EB" }}
                        onClick={() => setLocation(`/faire/orders/${order.id}`)}
                        data-testid="link-order"
                      >
                        #{order.display_id}
                      </button>
                    </InfoRow>
                    <InfoRow label="State">
                      <Badge style={{ background: "var(--muted)", color: "var(--foreground)" }} className="border-0 text-sm">{order.state}</Badge>
                    </InfoRow>
                    <InfoRow label="Customer">{order.address?.name ? <PersonCell name={order.address.name} size="sm" /> : "—"}</InfoRow>
                    <InfoRow label="Location" value={`${order.address?.city ?? ""}, ${order.address?.state_code ?? ""}`} />
                  </div>

                  <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Items Ordered</div>
                  <div className="space-y-3">
                    {order.items.map((oi: any) => (
                      <div key={oi.id} className="flex gap-3">
                        {oi.product_images?.[0] ? (
                          <img src={oi.product_images[0]} alt={oi.product_name} className="w-14 h-14 object-cover rounded-lg flex-shrink-0" />
                        ) : (
                          <div className="w-14 h-14 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                            <Package className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                        <div>
                          <div className="font-medium text-sm leading-tight">{oi.product_name}</div>
                          {oi.variant_name && <div className="text-sm text-muted-foreground">{oi.variant_name}</div>}
                          <div className="text-sm text-muted-foreground mt-0.5">
                            Qty: {oi.quantity} × <DualCurrencyInline cents={oi.price_cents} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 pt-4 border-t space-y-2">
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Gross Order</span>
                      <span className="font-medium text-foreground"><DualCurrency cents={grossOrderValue} /></span>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Commission ({commission > 0 ? ((commission / grossOrderValue) * 100).toFixed(1) : "~20"}%)</span>
                      <span className="font-medium text-red-500">−<DualCurrency cents={commission} /></span>
                    </div>
                    <div className="flex justify-between border-t pt-2 font-semibold text-sm text-foreground">
                      <span>Net Payout</span>
                      <span style={{ color: FAIRE_COLOR }}><DualCurrency cents={fairePayout} /></span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="py-6 text-center text-muted-foreground">
                  <Package className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Order data loading…</p>
                </div>
              )}
            </div>
          </div>

          {/* CENTER: Quotation (40%) */}
          <div className="col-span-4 space-y-4">

            {/* Status timeline */}
            <div className="rounded-xl border bg-card p-5 shadow-sm">
              <div className="font-semibold text-base mb-5">Quote Status</div>
              <StepTimeline status={quotation.status} />
            </div>

            {/* Fulfiller card */}
            {fulfiller && (
              <div className="rounded-xl border bg-card p-5 shadow-sm">
                <div className="font-semibold text-base mb-4">Assigned Fulfiller</div>
                <div className="flex items-start gap-4">
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <CompanyCell name={fulfiller.name} subtitle={fulfiller.country ?? undefined} size="lg" />
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-2">
                      {fulfiller.contact_name && <PersonCell name={fulfiller.contact_name} size="sm" />}
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Mail className="h-3.5 w-3.5 shrink-0" />{fulfiller.email}
                    </div>
                    <StarRating rating={fulfiller.rating ?? 4.5} />
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Clock className="h-3.5 w-3.5 shrink-0" />Avg lead: {fulfiller.avg_lead_days ?? 10} days · {fulfiller.completed_orders ?? 0} completed orders
                    </div>
                    {Array.isArray(fulfiller.specialties) && fulfiller.specialties.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {fulfiller.specialties.slice(0, 4).map((s: string) => (
                          <span key={s} className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{s}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Quote line items */}
            <div className="rounded-xl border bg-card p-5 shadow-sm">
              <div className="font-semibold text-base mb-4">Quote Line Items</div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left pb-2 text-muted-foreground font-medium">Item</th>
                    <th className="text-right pb-2 text-muted-foreground font-medium">Qty</th>
                    <th className="text-right pb-2 text-muted-foreground font-medium">Unit Cost</th>
                    <th className="text-right pb-2 text-muted-foreground font-medium">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {quoteItems.map((item: any) => (
                    <tr key={item.id} className="border-b">
                      <td className="py-3">
                        <div className="flex items-center gap-3">
                          {item.image_url ? (
                            <img src={item.image_url} alt={item.product_name} className="w-10 h-10 object-cover rounded-lg shrink-0" />
                          ) : (
                            <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center shrink-0">
                              <Package className="h-4 w-4 text-muted-foreground" />
                            </div>
                          )}
                          <div>
                            <div className="font-medium leading-tight">{item.product_name}</div>
                            {item.variant_options.length > 0 && (
                              <div className="text-muted-foreground text-xs mt-0.5">
                                {item.variant_options.map((o: any) => `${o.name}: ${o.value}`).join(", ")}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 text-right font-medium">{item.ordered_quantity}</td>
                      <td className="py-3 text-right">
                        {item.fulfiller_unit_cost_cents > 0 ? <DualCurrency cents={item.fulfiller_unit_cost_cents} /> : "—"}
                      </td>
                      <td className="py-3 text-right font-semibold">
                        {item.fulfiller_unit_cost_cents > 0 ? <DualCurrency cents={item.fulfiller_unit_cost_cents * item.ordered_quantity} /> : "—"}
                      </td>
                    </tr>
                  ))}
                  {shippingCost > 0 && (
                    <tr className="text-muted-foreground">
                      <td colSpan={3} className="py-2 text-right text-sm">Shipping</td>
                      <td className="py-2 text-right"><DualCurrency cents={shippingCost} /></td>
                    </tr>
                  )}
                  {quotation.lead_days > 0 && (
                    <tr className="text-muted-foreground">
                      <td colSpan={3} className="py-2 text-right text-sm">Lead Time</td>
                      <td className="py-2 text-right">{quotation.lead_days} days</td>
                    </tr>
                  )}
                  <tr className="font-semibold border-t">
                    <td colSpan={3} className="py-3 text-right text-base">Total</td>
                    <td className="py-3 text-right text-base" style={{ color: FAIRE_COLOR }}>
                      {fulfillerTotal > 0 ? <DualCurrency cents={fulfillerTotal} /> : "—"}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Fulfiller notes */}
            {quotation.fulfiller_notes && (
              <div className="rounded-xl border bg-card p-5 shadow-sm">
                <div className="flex items-center gap-2 font-semibold text-base mb-3">
                  <MessageSquare className="h-4 w-4" /> Fulfiller Notes
                </div>
                <p className="text-sm text-muted-foreground bg-muted/40 p-3 rounded-lg leading-relaxed">{quotation.fulfiller_notes}</p>
              </div>
            )}

            {/* Our notes */}
            <div className="rounded-xl border bg-card p-5 shadow-sm">
              <div className="font-semibold text-base mb-3">Our Notes</div>
              <Textarea
                value={ourNotes}
                onChange={e => setOurNotes(e.target.value)}
                placeholder="Add internal notes…"
                data-testid="textarea-our-notes"
                className="text-sm min-h-24"
              />
            </div>
          </div>

          {/* RIGHT: Decision panel (30%) */}
          <div className="col-span-3 space-y-4">

            {/* Financial summary */}
            <div className="rounded-xl border bg-card p-5 shadow-sm">
              <div className="font-semibold text-base mb-4">Financial Summary</div>
              <div className="space-y-1">
                <InfoRow label="Faire Net Payout">
                  <span className="font-semibold text-base" style={{ color: FAIRE_COLOR }}>
                    {fairePayout > 0 ? <DualCurrency cents={fairePayout} /> : "—"}
                  </span>
                </InfoRow>
                <InfoRow label="Fulfiller Total">
                  <span className="font-semibold text-base">
                    {fulfillerTotal > 0 ? <DualCurrency cents={fulfillerTotal} /> : "—"}
                  </span>
                </InfoRow>
                <div className="border-t pt-3">
                  <InfoRow label="Net Margin">
                    <div className="text-right">
                      <div className="font-bold text-xl" style={{ color: marginColor }}>
                        {fulfillerTotal > 0 ? <DualCurrency cents={netMargin} /> : "—"}
                      </div>
                      {fulfillerTotal > 0 && (
                        <div className="text-sm font-semibold mt-0.5" style={{ color: marginColor }}>{marginPct}% margin</div>
                      )}
                    </div>
                  </InfoRow>
                </div>
              </div>
              {fulfillerTotal > 0 && (
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                    <span>Margin health</span>
                    <span>{marginPct}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${Math.min(marginPct, 100)}%`, background: marginColor }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground/60 mt-1.5">
                    <span>0%</span><span>15%</span><span>30%</span><span>50%+</span>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="rounded-xl border bg-card p-5 shadow-sm">
              <div className="font-semibold text-base mb-4">Actions</div>

              {quotation.status === "DRAFT" && (
                <Button className="w-full text-white" style={{ background: FAIRE_COLOR }} onClick={handleSend} data-testid="button-send-to-fulfiller">
                  <Send className="h-4 w-4 mr-2" /> Send to Fulfiller
                </Button>
              )}

              {quotation.status === "SENT" && (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">Waiting for fulfiller to respond. Mark manually when received.</p>
                  <Button variant="outline" className="w-full" onClick={handleMarkReceived} data-testid="button-mark-received">
                    Mark Quote Received
                  </Button>
                </div>
              )}

              {quotation.status === "QUOTE_RECEIVED" && (
                <div className="space-y-2.5">
                  <Button className="w-full text-white" style={{ background: FAIRE_COLOR }} onClick={handleAccept} data-testid="button-accept-quote">
                    <CheckCircle className="h-4 w-4 mr-2" /> Accept Quote
                  </Button>
                  <Button variant="outline" className="w-full border-orange-300 text-orange-600 hover:bg-orange-50" onClick={() => setChallengeDialog(true)} data-testid="button-challenge-quote">
                    <AlertTriangle className="h-4 w-4 mr-2" /> Challenge
                  </Button>
                  <Button variant="outline" className="w-full" onClick={() => setElsewhereDialog(true)} data-testid="button-send-elsewhere">
                    <XCircle className="h-4 w-4 mr-2" /> Send Elsewhere
                  </Button>
                </div>
              )}

              {quotation.status === "ACCEPTED" && (
                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span className="text-sm text-emerald-700 dark:text-emerald-400 font-medium">
                      Accepted {quotation.accepted_at ? new Date(quotation.accepted_at).toLocaleDateString() : ""}
                    </span>
                  </div>
                  {order && (
                    <Button variant="outline" className="w-full" onClick={() => setLocation(`/faire/orders/${order.id}`)} data-testid="button-go-to-fulfillment">
                      <ExternalLink className="h-4 w-4 mr-2" /> Go to Fulfillment
                    </Button>
                  )}
                </div>
              )}

              {quotation.status === "CHALLENGED" && (
                <div className="p-4 rounded-lg bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800">
                  <AlertTriangle className="h-5 w-5 text-orange-500 mb-2" />
                  <p className="text-sm text-orange-700 dark:text-orange-400 font-medium">Quote challenged</p>
                  <p className="text-sm text-orange-500 mt-1">Awaiting revised quote from fulfiller.</p>
                </div>
              )}

              {quotation.status === "SENT_ELSEWHERE" && (
                <div className="p-4 rounded-lg bg-muted border">
                  <p className="text-sm font-medium">Sent to another fulfiller</p>
                  <p className="text-sm text-muted-foreground mt-1">A new quotation was created with the selected fulfiller.</p>
                </div>
              )}
            </div>

            {/* Timeline */}
            <div className="rounded-xl border bg-card p-5 shadow-sm space-y-1">
              <div className="font-semibold text-base mb-2">Timeline</div>
              <InfoRow label="Created" value={new Date(quotation.created_at).toLocaleDateString()} />
              {quotation.sent_at && (
                <InfoRow label="Sent" value={new Date(quotation.sent_at).toLocaleDateString()} />
              )}
              {quotation.received_at && (
                <InfoRow label="Quote Received" value={new Date(quotation.received_at).toLocaleDateString()} />
              )}
              {quotation.accepted_at && (
                <InfoRow label="Accepted" value={new Date(quotation.accepted_at).toLocaleDateString()} />
              )}
              {quotation.challenged_at && (
                <InfoRow label="Challenged" value={new Date(quotation.challenged_at).toLocaleDateString()} />
              )}
            </div>
          </div>
        </div>
      </Fade>

      {/* Challenge dialog */}
      <DetailModal
        open={challengeDialog}
        onClose={() => setChallengeDialog(false)}
        title="Challenge Quote"
        subtitle="Provide counter-offer details or reasons for the challenge"
        footer={
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setChallengeDialog(false)}>Cancel</Button>
            <Button onClick={handleChallenge} className="text-white" style={{ background: "#EA580C" }} data-testid="button-confirm-challenge">
              Send Challenge
            </Button>
          </div>
        }
      >
        <div className="px-6 py-5">
          <Label className="mb-2 block">Counter-Offer / Notes</Label>
          <Textarea value={challengeText} onChange={e => setChallengeText(e.target.value)} placeholder="Describe the counter-offer or reason for challenge…" className="min-h-28" data-testid="textarea-challenge" />
        </div>
      </DetailModal>

      {/* Send Elsewhere dialog */}
      <DetailModal
        open={elsewhereDialog}
        onClose={() => setElsewhereDialog(false)}
        title="Send to Another Fulfiller"
        subtitle="Select a different fulfiller. A new draft quotation will be created."
        footer={
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setElsewhereDialog(false)}>Cancel</Button>
            <Button onClick={handleSendElsewhere} style={{ background: FAIRE_COLOR }} className="text-white" data-testid="button-confirm-elsewhere">
              Create New Draft
            </Button>
          </div>
        }
      >
        <div className="px-6 py-5">
          <Label className="mb-2 block">Select Fulfiller</Label>
          <Select value={elsewhereFulfillerId} onValueChange={setElsewhereFulfillerId}>
            <SelectTrigger data-testid="select-elsewhere-fulfiller">
              <SelectValue placeholder="Select a fulfiller…" />
            </SelectTrigger>
            <SelectContent>
              {allVendors
                .filter(v => v.name !== fulfillerName)
                .map((v: any) => (
                  <SelectItem key={v.id} value={v.id}>{v.name} ({v.country ?? "—"})</SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      </DetailModal>
    </div>
  );
}
