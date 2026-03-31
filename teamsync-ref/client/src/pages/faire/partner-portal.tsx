import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Package, Send, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { formatUSD, DualCurrencyInline } from "@/lib/faire-currency";
import {
  faireFulfillers, faireQuotations, type FaireQuotation, type FaireQuotationItem,
} from "@/lib/mock-data-faire-ops";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";


interface QuoteForm {
  itemCosts: Record<string, string>;
  shippingCost: string;
  leadDays: string;
  notes: string;
}

function QuoteCard({
  quotation, onSubmit,
}: {
  quotation: FaireQuotation;
  onSubmit: (q: FaireQuotation, form: QuoteForm) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();
  const { data: ordersData } = useQuery<{ orders: any[] }>({
    queryKey: ['/api/faire/orders'],
    queryFn: async () => {
      const res = await fetch('/api/faire/orders', { headers: { 'Cache-Control': 'no-cache' } });
      if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`);
      return res.json();
    },
  });
  const allOrders = ordersData?.orders ?? [];
  const order = allOrders.find((o: any) => o.id === quotation.order_id);
  const [form, setForm] = useState<QuoteForm>({
    itemCosts: Object.fromEntries(quotation.items.map(i => [i.id, ""])),
    shippingCost: "",
    leadDays: "",
    notes: "",
  });

  function handleSubmit() {
    const allFilled = quotation.items.every(i => form.itemCosts[i.id] && parseFloat(form.itemCosts[i.id]) >= 0);
    if (!allFilled || !form.shippingCost || !form.leadDays) {
      toast({ title: "Fill all pricing fields", variant: "destructive" });
      return;
    }
    setSubmitted(true);
    setExpanded(false);
    onSubmit(quotation, form);
    toast({ title: "Quote submitted!", description: `Your pricing for ${quotation.id} has been received.` });
  }

  if (submitted) {
    return (
      <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50 p-6 flex items-center gap-4">
        <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
          <CheckCircle className="h-6 w-6 text-emerald-600" />
        </div>
        <div>
          <div className="font-semibold text-emerald-800">Quote Submitted</div>
          <div className="text-sm text-emerald-600">Order reference: <span className="font-bold">#{order?.display_id}</span></div>
          <div className="text-xs text-emerald-500 mt-0.5">Thank you! The team will review your pricing shortly.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      {/* Card header */}
      <div className="p-6 border-b border-slate-100">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-slate-400">{quotation.id}</span>
              <Badge className="border-0 text-xs" style={{ background: "#EFF6FF", color: "#2563EB" }}>
                Awaiting Your Quote
              </Badge>
            </div>
            {order && (
              <div className="text-sm text-slate-500">
                Deliver to: <span className="font-medium text-slate-700">{order.address.name}</span>
                {" — "}{order.address.city}, {order.address.state_code}
              </div>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setExpanded(e => !e)}
            data-testid={`button-expand-${quotation.id}`}
          >
            {expanded ? "Collapse" : "Submit Quote"}
          </Button>
        </div>
      </div>

      {/* Product grid */}
      <div className="p-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
          {quotation.items.map(item => (
            <div key={item.id} className="rounded-xl border border-slate-100 overflow-hidden bg-slate-50">
              {item.image_url ? (
                <img
                  src={item.image_url}
                  alt={item.product_name}
                  className="w-full h-32 object-cover"
                />
              ) : (
                <div className="w-full h-32 bg-slate-100 flex items-center justify-center">
                  <Package className="h-10 w-10 text-slate-300" />
                </div>
              )}
              <div className="p-3">
                <div className="font-semibold text-sm text-slate-800">{item.product_name}</div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {item.variant_options.map(o => (
                    <span key={o.name} className="text-xs px-1.5 py-0.5 bg-white rounded-full border border-slate-200 text-slate-500">
                      {o.name}: {o.value}
                    </span>
                  ))}
                </div>
                <div className="text-xs text-slate-500 mt-2 font-medium">Qty needed: <span className="text-slate-700 font-bold">{item.ordered_quantity}</span></div>
              </div>
            </div>
          ))}
        </div>

        {/* Inline quote form */}
        {expanded && (
          <div className="border-t border-slate-100 pt-4 mt-2">
            <div className="font-semibold text-sm text-slate-700 mb-4">Your Quote</div>

            <div className="space-y-4">
              {quotation.items.map(item => (
                <div key={item.id} className="flex items-center gap-4">
                  {item.image_url && (
                    <img src={item.image_url} alt={item.product_name} className="w-10 h-10 object-cover rounded-lg flex-shrink-0" />
                  )}
                  <div className="flex-1 text-sm text-slate-700 font-medium">{item.product_name} <span className="text-slate-400 font-normal">×{item.ordered_quantity}</span></div>
                  <div className="w-36">
                    <Label className="text-xs text-slate-500">Unit cost ($)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={form.itemCosts[item.id]}
                      onChange={e => setForm(f => ({ ...f, itemCosts: { ...f.itemCosts, [item.id]: e.target.value } }))}
                      placeholder="0.00"
                      className="mt-0.5"
                      data-testid={`input-unit-cost-${item.id}`}
                    />
                  </div>
                </div>
              ))}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-slate-500">Shipping cost ($)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.shippingCost}
                    onChange={e => setForm(f => ({ ...f, shippingCost: e.target.value }))}
                    placeholder="0.00"
                    data-testid="input-shipping-cost"
                  />
                </div>
                <div>
                  <Label className="text-xs text-slate-500">Lead time (days)</Label>
                  <Input
                    type="number"
                    min="1"
                    value={form.leadDays}
                    onChange={e => setForm(f => ({ ...f, leadDays: e.target.value }))}
                    placeholder="e.g. 7"
                    data-testid="input-lead-days"
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs text-slate-500">Notes</Label>
                <Textarea
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder="Any notes about availability, packaging, or lead times…"
                  data-testid="input-fulfiller-notes"
                />
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={handleSubmit}
                  className="text-white"
                  style={{ background: "#1A6B45" }}
                  data-testid={`button-submit-quote-${quotation.id}`}
                >
                  <Send className="h-4 w-4 mr-2" /> Submit Quote
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function FairePartnerPortal() {
  const { toast } = useToast();
  const [selectedFulfillerId, setSelectedFulfillerId] = useState(faireFulfillers[0]?.id ?? "");
  const [quotations, setQuotations] = useState(faireQuotations);

  const fulfiller = faireFulfillers.find(f => f.id === selectedFulfillerId);
  const sentQuotes = quotations.filter(q => q.fulfiller_id === selectedFulfillerId && q.status === "SENT");

  function handleSubmitQuote(quotation: FaireQuotation, form: QuoteForm) {
    setQuotations(prev => prev.map(q => {
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

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Portal header */}
      <div className="bg-white border-b border-slate-200 px-8 py-5 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-800">Fulfiller Quote Portal</h1>
            <p className="text-sm text-slate-500 mt-0.5">Submit pricing for open quote requests</p>
          </div>
          <div className="w-64">
            <Select value={selectedFulfillerId} onValueChange={setSelectedFulfillerId}>
              <SelectTrigger data-testid="select-fulfiller-portal">
                <SelectValue placeholder="Select your company…" />
              </SelectTrigger>
              <SelectContent>
                {faireFulfillers.map(f => (
                  <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-8 py-8">
        {fulfiller && (
          <div className="mb-6 p-4 rounded-xl bg-white border border-slate-200 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg" style={{ background: "#1A6B45" }}>
              {fulfiller.name.split(" ").map(w => w[0]).join("").slice(0, 2)}
            </div>
            <div>
              <div className="font-semibold text-slate-800">{fulfiller.name}</div>
              <div className="text-sm text-slate-500">{fulfiller.contact_name} · {fulfiller.email} · {fulfiller.country}</div>
            </div>
            <div className="ml-auto text-right">
              <div className="text-sm font-medium text-slate-700">{sentQuotes.length} pending request{sentQuotes.length !== 1 ? "s" : ""}</div>
              <div className="text-xs text-slate-400">Awaiting your quote</div>
            </div>
          </div>
        )}

        {sentQuotes.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <CheckCircle className="h-12 w-12 mx-auto mb-4 text-slate-200" />
            <div className="font-medium">No pending quote requests</div>
            <div className="text-sm mt-1">All quote requests for this fulfiller have been responded to.</div>
          </div>
        ) : (
          <div className="space-y-6">
            {sentQuotes.map(q => (
              <QuoteCard key={q.id} quotation={q} onSubmit={handleSubmitQuote} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
