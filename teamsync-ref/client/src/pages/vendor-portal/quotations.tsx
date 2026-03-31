import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Package, Send, CheckCircle, AlertCircle, Clock, ChevronDown, ChevronUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { DualCurrencyInline } from "@/lib/faire-currency";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Fade } from "@/components/ui/animated";
import { faireQuotations, type FaireQuotation } from "@/lib/mock-data-faire-ops";
import { VENDOR_COLOR } from "@/lib/suprans-config";


const FULFILLER_ID_TO_NAME: Record<string, string> = {
  "fulf-001": "ShipFast Logistics",
  "fulf-002": "GlobalPack Co",
  "fulf-003": "QuickFulfill EU",
  "fulf-004": "AsiaDirect Supply",
};
const NAME_TO_FULFILLER_ID = Object.fromEntries(
  Object.entries(FULFILLER_ID_TO_NAME).map(([k, v]) => [v, k])
);

type TabKey = "open" | "submitted" | "history";

interface QuoteForm {
  itemCosts: Record<string, string>;
  shippingCost: string;
  leadDays: string;
  notes: string;
}

function QuoteRequestCard({
  quotation, orders, submitted, onSubmit,
}: {
  quotation: FaireQuotation;
  orders: any[];
  submitted: boolean;
  onSubmit: (q: FaireQuotation, form: QuoteForm) => void;
}) {
  const { toast } = useToast();
  const [expanded, setExpanded] = useState(false);
  const [form, setForm] = useState<QuoteForm>({
    itemCosts: Object.fromEntries(quotation.items.map(i => [i.id, ""])),
    shippingCost: "",
    leadDays: "",
    notes: "",
  });

  const order = orders.find((o: any) => o.id === quotation.order_id)
    ?? (orders.length > 0 ? orders[faireQuotations.indexOf(quotation) % orders.length] : null);

  function handleSubmit() {
    const allFilled = quotation.items.every(i => form.itemCosts[i.id] && parseFloat(form.itemCosts[i.id]) >= 0);
    if (!allFilled || !form.shippingCost || !form.leadDays) {
      toast({ title: "Please fill all pricing fields", variant: "destructive" });
      return;
    }
    onSubmit(quotation, form);
    setExpanded(false);
    toast({ title: "Quote submitted!", description: `Pricing for ${quotation.id} has been received by the team.` });
  }

  if (submitted) {
    return (
      <div className="rounded-xl border-2 border-emerald-200 bg-emerald-50 dark:bg-emerald-950 dark:border-emerald-800 p-5 flex items-center gap-4">
        <div className="w-11 h-11 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center shrink-0">
          <CheckCircle className="h-5 w-5 text-emerald-600" />
        </div>
        <div>
          <div className="font-semibold text-emerald-800 dark:text-emerald-300">Quote Submitted</div>
          <div className="text-sm text-emerald-600 dark:text-emerald-400">Request ID: <span className="font-bold">{quotation.id}</span></div>
          <div className="text-xs text-emerald-500 mt-0.5">The team will review and accept or challenge your pricing.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card shadow-sm overflow-hidden" data-testid={`quote-card-${quotation.id}`}>
      <div className="p-5 border-b">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-bold text-muted-foreground">{quotation.id}</span>
              <Badge style={{ background: "#EFF6FF", color: "#2563EB" }} className="border-0 text-xs">Open Request</Badge>
            </div>
            {order && (
              <div className="text-sm text-muted-foreground">
                Ship to: <span className="font-medium text-foreground">{order.address?.name}</span>
                {order.address?.city ? ` — ${order.address.city}, ${order.address.state_code}` : ""}
              </div>
            )}
            <div className="text-xs text-muted-foreground">
              Requested: {new Date(quotation.created_at).toLocaleDateString()}
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => setExpanded(e => !e)}
            style={{ background: expanded ? "var(--muted)" : VENDOR_COLOR }}
            className={expanded ? "text-foreground" : "text-white"}
            data-testid={`button-expand-${quotation.id}`}
          >
            {expanded ? (<><ChevronUp className="h-4 w-4 mr-1" /> Collapse</>) : (<><Send className="h-4 w-4 mr-1" /> Submit Quote</>)}
          </Button>
        </div>
      </div>

      <div className="p-5">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
          {quotation.items.map(item => (
            <div key={item.id} className="rounded-lg border overflow-hidden bg-muted/20">
              {item.image_url ? (
                <img src={item.image_url} alt={item.product_name} className="w-full h-28 object-cover" />
              ) : (
                <div className="w-full h-28 flex items-center justify-center bg-muted">
                  <Package className="h-8 w-8 text-muted-foreground/40" />
                </div>
              )}
              <div className="p-3">
                <div className="font-semibold text-sm leading-tight">{item.product_name}</div>
                {item.variant_options.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {item.variant_options.map(o => (
                      <span key={o.name} className="text-xs px-1.5 py-0.5 bg-background rounded-full border text-muted-foreground">
                        {o.name}: {o.value}
                      </span>
                    ))}
                  </div>
                )}
                <div className="text-xs text-muted-foreground mt-2">
                  Qty needed: <span className="font-bold text-foreground">{item.ordered_quantity}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {expanded && (
          <div className="border-t pt-5 mt-2 space-y-5">
            <div className="text-sm font-semibold">Your Pricing</div>

            <div className="space-y-3">
              {quotation.items.map(item => (
                <div key={item.id} className="flex items-center gap-4">
                  {item.image_url && (
                    <img src={item.image_url} alt={item.product_name} className="w-10 h-10 object-cover rounded-lg shrink-0" />
                  )}
                  <div className="flex-1 text-sm font-medium">{item.product_name} <span className="text-muted-foreground font-normal">×{item.ordered_quantity}</span></div>
                  <div className="w-36">
                    <Label className="text-xs text-muted-foreground">Unit cost (USD)</Label>
                    <Input
                      type="number" step="0.01" min="0"
                      value={form.itemCosts[item.id]}
                      onChange={e => setForm(f => ({ ...f, itemCosts: { ...f.itemCosts, [item.id]: e.target.value } }))}
                      placeholder="0.00"
                      className="mt-1 h-9"
                      data-testid={`input-unit-cost-${item.id}`}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground">Shipping cost (USD)</Label>
                <Input
                  type="number" step="0.01" min="0"
                  value={form.shippingCost}
                  onChange={e => setForm(f => ({ ...f, shippingCost: e.target.value }))}
                  placeholder="0.00"
                  className="mt-1 h-9"
                  data-testid="input-shipping-cost"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Lead time (days)</Label>
                <Input
                  type="number" min="1"
                  value={form.leadDays}
                  onChange={e => setForm(f => ({ ...f, leadDays: e.target.value }))}
                  placeholder="e.g. 7"
                  className="mt-1 h-9"
                  data-testid="input-lead-days"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs text-muted-foreground">Notes (optional)</Label>
              <Textarea
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                placeholder="Notes on availability, packaging, lead time caveats…"
                className="mt-1 min-h-20 text-sm"
                data-testid="input-vendor-notes"
              />
            </div>

            <div className="flex justify-end">
              <Button onClick={handleSubmit} className="text-white" style={{ background: VENDOR_COLOR }} data-testid={`button-submit-${quotation.id}`}>
                <Send className="h-4 w-4 mr-2" /> Submit Quote
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function QuoteHistoryCard({ quotation }: { quotation: FaireQuotation }) {
  const [expanded, setExpanded] = useState(false);
  const statusConfig: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
    QUOTE_RECEIVED: { label: "Under Review", color: "#D97706", bg: "#FFFBEB", icon: <Clock className="h-4 w-4" /> },
    ACCEPTED:       { label: "Accepted",     color: "#059669", bg: "#ECFDF5", icon: <CheckCircle className="h-4 w-4" /> },
    CHALLENGED:     { label: "Challenged",   color: "#EA580C", bg: "#FFF7ED", icon: <AlertCircle className="h-4 w-4" /> },
    SENT_ELSEWHERE: { label: "Not Selected", color: "#64748B", bg: "#F1F5F9", icon: null },
  };
  const sc = statusConfig[quotation.status] ?? statusConfig["QUOTE_RECEIVED"];

  return (
    <div className="rounded-xl border bg-card shadow-sm" data-testid={`history-card-${quotation.id}`}>
      <div className="p-5 flex items-center justify-between gap-4 flex-wrap">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-bold">{quotation.id}</span>
            <span className="text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1" style={{ background: sc.bg, color: sc.color }}>
              {sc.icon}{sc.label}
            </span>
          </div>
          <div className="text-sm text-muted-foreground">
            {quotation.items.length} item{quotation.items.length !== 1 ? "s" : ""} · {new Date(quotation.created_at).toLocaleDateString()}
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setExpanded(e => !e)}>
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </div>
      {expanded && (
        <div className="border-t px-5 pb-5 pt-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {quotation.items.map(item => (
              <div key={item.id} className="flex items-center gap-2.5">
                {item.image_url && <img src={item.image_url} alt={item.product_name} className="w-10 h-10 object-cover rounded-lg shrink-0" />}
                <div>
                  <div className="text-sm font-medium leading-tight">{item.product_name}</div>
                  <div className="text-xs text-muted-foreground">
                    Qty {item.ordered_quantity}
                    {item.fulfiller_unit_cost_cents > 0 && (
                      <> · <DualCurrencyInline cents={item.fulfiller_unit_cost_cents} /></>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          {quotation.fulfiller_notes && (
            <div className="mt-3 p-3 rounded-lg bg-muted/40 text-sm text-muted-foreground">
              <span className="font-medium">Your notes: </span>{quotation.fulfiller_notes}
            </div>
          )}
          {quotation.status === "CHALLENGED" && (
            <div className="mt-3 p-3 rounded-lg bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 text-sm text-orange-700 dark:text-orange-400">
              <AlertCircle className="h-4 w-4 inline mr-1" />
              Your quote was challenged. Please contact the team to discuss a revised price.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function VendorQuotations() {
  const [activeTab, setActiveTab] = useState<TabKey>("open");
  const [selectedVendorId, setSelectedVendorId] = useState<string>("");
  const [submittedIds, setSubmittedIds] = useState<Set<string>>(new Set());
  const [localQuotations, setLocalQuotations] = useState(faireQuotations);

  const { data: vendorsData } = useQuery<{ vendors: any[] }>({ queryKey: ["/api/faire/vendors"] });
  const allVendors: any[] = vendorsData?.vendors ?? [];

  const { data: ordersData } = useQuery<{ orders: any[] }>({ queryKey: ["/api/faire/orders"] });
  const allOrders: any[] = ordersData?.orders ?? [];

  useEffect(() => {
    if (allVendors.length > 0 && !selectedVendorId) {
      const stored = localStorage.getItem("vp_vendor_id");
      const match = allVendors.find(v => v.id === stored);
      setSelectedVendorId(match ? stored! : allVendors[0].id);
    }
  }, [allVendors, selectedVendorId]);

  function handleVendorChange(id: string) {
    setSelectedVendorId(id);
    localStorage.setItem("vp_vendor_id", id);
  }

  const vendor = allVendors.find(v => v.id === selectedVendorId);
  const vendorName = vendor?.name ?? "";
  const fulfillerKey = NAME_TO_FULFILLER_ID[vendorName] ?? "";

  const myQuotations = localQuotations.filter(q => q.fulfiller_id === fulfillerKey);
  const openRequests = myQuotations.filter(q => q.status === "SENT");
  const submitted = myQuotations.filter(q => q.status === "QUOTE_RECEIVED");
  const history = myQuotations.filter(q => ["ACCEPTED", "CHALLENGED", "SENT_ELSEWHERE"].includes(q.status));

  function handleSubmitQuote(quotation: FaireQuotation, form: any) {
    setSubmittedIds(prev => new Set([...prev, quotation.id]));
    setLocalQuotations(prev => prev.map(q => {
      if (q.id !== quotation.id) return q;
      return {
        ...q,
        status: "QUOTE_RECEIVED" as const,
        received_at: new Date().toISOString(),
        fulfiller_shipping_cost_cents: Math.round(parseFloat(form.shippingCost) * 100),
        lead_days: parseInt(form.leadDays, 10),
        fulfiller_notes: form.notes,
        items: q.items.map(i => ({
          ...i,
          fulfiller_unit_cost_cents: Math.round(parseFloat(form.itemCosts[i.id] ?? "0") * 100),
        })),
      };
    }));
  }

  const TABS = [
    { key: "open" as TabKey, label: "Open Requests", count: openRequests.length, color: "#2563EB" },
    { key: "submitted" as TabKey, label: "Submitted", count: submitted.length, color: "#D97706" },
    { key: "history" as TabKey, label: "History", count: history.length, color: "#6B7280" },
  ];

  return (
    <div className="py-8 px-6 max-w-screen-xl mx-auto space-y-6">
      <Fade>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold font-heading">Quotations</h1>
            <p className="text-sm text-muted-foreground mt-1">Review open requests and submit your pricing</p>
          </div>
          <div className="w-64">
            <Select value={selectedVendorId} onValueChange={handleVendorChange}>
              <SelectTrigger data-testid="select-vendor-quotations">
                <SelectValue placeholder="Select your company…" />
              </SelectTrigger>
              <SelectContent>
                {allVendors.map(v => (
                  <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Fade>

      <Fade>
        <div className="flex gap-1 p-1 bg-muted/50 rounded-xl w-fit border">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
              style={activeTab === tab.key
                ? { background: VENDOR_COLOR, color: "#fff" }
                : { color: "var(--muted-foreground)" }}
              data-testid={`tab-${tab.key}`}
            >
              {tab.label}
              <span
                className="text-xs px-1.5 py-0.5 rounded-full font-bold"
                style={activeTab === tab.key
                  ? { background: "rgba(255,255,255,0.2)", color: "#fff" }
                  : { background: "var(--muted)", color: "var(--muted-foreground)" }}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </Fade>

      <Fade>
        <div className="space-y-4">
          {activeTab === "open" && (
            <>
              {openRequests.length === 0 ? (
                <div className="p-12 text-center border rounded-xl bg-card">
                  <CheckCircle className="h-10 w-10 mx-auto mb-3 text-muted-foreground/30" />
                  <div className="font-medium text-muted-foreground">No open requests</div>
                  <div className="text-sm text-muted-foreground mt-1">All quote requests have been responded to.</div>
                </div>
              ) : openRequests.map(q => (
                <QuoteRequestCard
                  key={q.id}
                  quotation={q}
                  orders={allOrders}
                  submitted={submittedIds.has(q.id)}
                  onSubmit={handleSubmitQuote}
                />
              ))}
            </>
          )}

          {activeTab === "submitted" && (
            <>
              {submitted.length === 0 ? (
                <div className="p-12 text-center border rounded-xl bg-card">
                  <Clock className="h-10 w-10 mx-auto mb-3 text-muted-foreground/30" />
                  <div className="font-medium text-muted-foreground">No submitted quotes</div>
                  <div className="text-sm text-muted-foreground mt-1">Submit pricing for open requests to see them here.</div>
                </div>
              ) : submitted.map(q => (
                <QuoteHistoryCard key={q.id} quotation={q} />
              ))}
            </>
          )}

          {activeTab === "history" && (
            <>
              {history.length === 0 ? (
                <div className="p-12 text-center border rounded-xl bg-card">
                  <Package className="h-10 w-10 mx-auto mb-3 text-muted-foreground/30" />
                  <div className="font-medium text-muted-foreground">No history yet</div>
                  <div className="text-sm text-muted-foreground mt-1">Completed quotations will appear here.</div>
                </div>
              ) : history.map(q => (
                <QuoteHistoryCard key={q.id} quotation={q} />
              ))}
            </>
          )}
        </div>
      </Fade>
    </div>
  );
}
