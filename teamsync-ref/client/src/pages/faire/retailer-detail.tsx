import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import { ArrowLeft, Mail, Phone, Globe, Instagram, MapPin, Briefcase, User, Pencil, MessageCircle } from "lucide-react";
import { CompanyCell } from "@/components/ui/avatar-cells";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Fade } from "@/components/ui/animated";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { DualCurrency, formatINRFromDollars } from "@/lib/faire-currency";
import {
  DataTableContainer,
  DataTH,
  DataTD,
  DataTR,
  DetailModal,
  InfoRow,
  PageShell,
} from "@/components/layout";
import {
  FAIRE_COLOR,
  type OrderState,
  ORDER_STATE_CONFIG,
} from "@/lib/faire-config";




interface Enrichment {
  retailer_id: string;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  store_address: string | null;
  business_type: string | null;
  store_type: string | null;
  website: string | null;
  instagram: string | null;
  notes: string | null;
  enriched_by: string | null;
  enriched_at: string | null;
  updated_at: string | null;
}

function whatsappUrl(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return `https://wa.me/${digits}`;
}

export default function FaireRetailerDetail() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/faire/retailers/:id");
  const retailerId = params?.id;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [enrichModal, setEnrichModal] = useState(false);
  const [formData, setFormData] = useState({
    contact_name: "",
    contact_email: "",
    contact_phone: "",
    store_address: "",
    business_type: "",
    store_type: "",
    website: "",
    instagram: "",
    notes: "",
    enriched_by: "",
  });

  const { data: retailerData, isLoading: retailerLoading } = useQuery<{ id: string; name: string; city?: string; state?: string; country?: string }>({
    queryKey: ["/api/faire/retailers", retailerId],
    queryFn: async () => {
      const res = await fetch(`/api/faire/retailers/${retailerId}`, { headers: { "Cache-Control": "no-cache" } });
      if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`);
      return res.json();
    },
    enabled: !!retailerId,
  });

  const { data: ordersData, isLoading: ordersLoading } = useQuery<{ orders: any[] }>({
    queryKey: ["/api/faire/orders"],
    queryFn: async () => {
      const res = await fetch("/api/faire/orders", { headers: { "Cache-Control": "no-cache" } });
      if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`);
      return res.json();
    },
  });

  const { data: storesData } = useQuery<{ stores: { id: string; name: string; active: boolean; last_synced_at: string }[] }>({
    queryKey: ["/api/faire/stores"],
    queryFn: async () => {
      const res = await fetch("/api/faire/stores", { headers: { "Cache-Control": "no-cache" } });
      if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`);
      return res.json();
    },
  });

  const { data: enrichmentData } = useQuery<{ enrichment: Enrichment | null }>({
    queryKey: ["/api/faire/retailers", retailerId, "enrichment"],
    queryFn: async () => {
      const res = await fetch(`/api/faire/retailers/${retailerId}/enrichment`);
      if (!res.ok) return { enrichment: null };
      return res.json();
    },
    enabled: !!retailerId,
  });

  const enrichMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await fetch(`/api/faire/retailers/${retailerId}/enrichment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to save");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/faire/retailers", retailerId, "enrichment"] });
      toast({ title: "Enrichment saved", description: "Retailer details updated successfully." });
      setEnrichModal(false);
    },
    onError: () => {
      toast({ title: "Save failed", variant: "destructive" });
    },
  });

  function openEnrichModal() {
    const e = enrichmentData?.enrichment;
    setFormData({
      contact_name: e?.contact_name ?? "",
      contact_email: e?.contact_email ?? "",
      contact_phone: e?.contact_phone ?? "",
      store_address: e?.store_address ?? "",
      business_type: e?.business_type ?? "",
      store_type: e?.store_type ?? "",
      website: e?.website ?? "",
      instagram: e?.instagram ?? "",
      notes: e?.notes ?? "",
      enriched_by: e?.enriched_by ?? "",
    });
    setEnrichModal(true);
  }

  const isLoading = retailerLoading || ordersLoading;

  if (isLoading) {
    return (
      <div className="px-16 py-6 lg:px-24 space-y-5 animate-pulse">
        <div className="h-8 bg-muted rounded w-48" />
        <div className="h-32 bg-muted rounded-xl" />
        <div className="h-64 bg-muted rounded-xl" />
      </div>
    );
  }

  const retailer = retailerData;
  const allOrders = ordersData?.orders ?? [];
  const stores = storesData?.stores ?? [];
  const enrichment = enrichmentData?.enrichment ?? null;

  const retailerOrders = allOrders.filter((o: any) => o.retailer_id === retailerId);

  const totalOrders = retailerOrders.length;
  const totalSpent = retailerOrders.reduce((sum: number, o: any) => {
    const orderTotal = (o.items ?? []).reduce((s: number, i: any) => s + (i.price_cents ?? 0) * (i.quantity ?? 0), 0);
    return sum + orderTotal;
  }, 0);
  const totalSpentDollars = totalSpent / 100;
  const avgOrderValue = totalOrders > 0 ? Math.round(totalSpentDollars / totalOrders) : 0;

  const sortedByDate = [...retailerOrders].sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  const firstOrder = sortedByDate.length > 0 ? sortedByDate[0] : null;
  const lastOrder = sortedByDate.length > 0 ? sortedByDate[sortedByDate.length - 1] : null;

  const storeIdsSet = new Set(retailerOrders.map((o: any) => o._storeId).filter(Boolean));

  const lastOrderDate = lastOrder ? new Date(lastOrder.created_at) : null;
  const isActive = lastOrderDate ? (Date.now() - lastOrderDate.getTime()) < 90 * 24 * 60 * 60 * 1000 : false;

  const retailerName = retailer?.name ?? retailerId ?? "Unknown Retailer";
  const retailerCity = retailer?.city ?? "";
  const retailerState = retailer?.state ?? "";
  const retailerCountry = retailer?.country ?? "";
  const locationParts = [retailerCity, retailerState, retailerCountry].filter(Boolean).join(", ");

  const hasEnrichment = !!enrichment && (
    !!enrichment.contact_name || !!enrichment.contact_email || !!enrichment.contact_phone ||
    !!enrichment.store_address || !!enrichment.website || !!enrichment.instagram
  );

  return (
    <PageShell>
      <Fade>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3 flex-wrap">
            <Button variant="ghost" size="sm" onClick={() => setLocation("/faire/retailers")} data-testid="btn-back">
              <ArrowLeft size={16} className="mr-1" /> Retailers
            </Button>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <CompanyCell name={retailerName} subtitle={locationParts || undefined} size="lg" />
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${isActive ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400" : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"}`} data-testid="text-retailer-status">
                  {isActive ? "active" : "inactive"}
                </span>
                {hasEnrichment && (
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: `${FAIRE_COLOR}15`, color: FAIRE_COLOR }}>
                    Enriched
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            {enrichment?.contact_email && (
              <Button size="sm" variant="outline" asChild>
                <a href={`mailto:${enrichment.contact_email}`} data-testid="btn-email">
                  <Mail size={13} className="mr-1.5" /> Email
                </a>
              </Button>
            )}
            {enrichment?.contact_phone && (
              <Button size="sm" variant="outline" asChild>
                <a href={whatsappUrl(enrichment.contact_phone)} target="_blank" rel="noopener noreferrer" data-testid="btn-whatsapp">
                  <MessageCircle size={13} className="mr-1.5" /> WhatsApp
                </a>
              </Button>
            )}
            <Button
              size="sm"
              onClick={openEnrichModal}
              style={{ background: FAIRE_COLOR }}
              className="text-white hover:opacity-90"
              data-testid="btn-enrich"
            >
              <Pencil size={13} className="mr-1.5" />
              {hasEnrichment ? "Edit Enrichment" : "Enrich"}
            </Button>
          </div>
        </div>
      </Fade>

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 space-y-4">
          <Fade>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Retailer Info</CardTitle></CardHeader>
              <CardContent className="space-y-1">
                <InfoRow label="Name" value={retailerName} />
                <InfoRow label="Retailer ID">
                  <span className="text-xs text-muted-foreground truncate" data-testid="text-info-id">{retailerId}</span>
                </InfoRow>
                {locationParts && <InfoRow label="Location" value={locationParts} />}
                <InfoRow label="Status" value={isActive ? "Active" : "Inactive"} />
              </CardContent>
            </Card>
          </Fade>

          {hasEnrichment && (
            <Fade>
              <Card>
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                  <CardTitle className="text-sm">Contact & Business Details</CardTitle>
                  <button
                    onClick={openEnrichModal}
                    className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                    data-testid="btn-edit-enrichment-inline"
                  >
                    <Pencil size={11} /> Edit
                  </button>
                </CardHeader>
                <CardContent className="space-y-1">
                  {enrichment?.contact_name && (
                    <InfoRow label="Contact Person" value={enrichment.contact_name} />
                  )}
                  {enrichment?.contact_email && (
                    <InfoRow label="Email">
                      <a href={`mailto:${enrichment.contact_email}`} className="text-sm font-medium hover:underline" data-testid="text-contact-email">{enrichment.contact_email}</a>
                    </InfoRow>
                  )}
                  {enrichment?.contact_phone && (
                    <InfoRow label="Phone">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium" data-testid="text-contact-phone">{enrichment.contact_phone}</span>
                        <a
                          href={whatsappUrl(enrichment.contact_phone)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs px-1.5 py-0.5 rounded font-medium text-white"
                          style={{ background: "#25D366" }}
                          data-testid="link-whatsapp"
                        >
                          WhatsApp
                        </a>
                      </div>
                    </InfoRow>
                  )}
                  {enrichment?.store_address && (
                    <InfoRow label="Store Address">
                      <span className="text-sm whitespace-pre-line" data-testid="text-store-address">{enrichment.store_address}</span>
                    </InfoRow>
                  )}
                  {enrichment?.business_type && (
                    <InfoRow label="Business Type" value={enrichment.business_type} />
                  )}
                  {enrichment?.store_type && (
                    <InfoRow label="Store Type" value={enrichment.store_type} />
                  )}
                  {enrichment?.website && (
                    <InfoRow label="Website">
                      <a
                        href={enrichment.website.startsWith("http") ? enrichment.website : `https://${enrichment.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium hover:underline"
                        style={{ color: FAIRE_COLOR }}
                        data-testid="link-website"
                      >
                        {enrichment.website}
                      </a>
                    </InfoRow>
                  )}
                  {enrichment?.instagram && (
                    <InfoRow label="Instagram">
                      <a
                        href={`https://instagram.com/${enrichment.instagram.replace(/^@/, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium hover:underline"
                        data-testid="link-instagram"
                      >
                        {enrichment.instagram.startsWith("@") ? enrichment.instagram : `@${enrichment.instagram}`}
                      </a>
                    </InfoRow>
                  )}
                  {enrichment?.notes && (
                    <InfoRow label="Notes">
                      <span className="text-sm text-muted-foreground whitespace-pre-line" data-testid="text-notes">{enrichment.notes}</span>
                    </InfoRow>
                  )}
                  {enrichment?.enriched_by && (
                    <p className="text-xs text-muted-foreground mt-3 pt-3 border-t">
                      Enriched by <span className="font-medium">{enrichment.enriched_by}</span>
                      {enrichment.updated_at && ` · ${new Date(enrichment.updated_at).toLocaleDateString()}`}
                    </p>
                  )}
                </CardContent>
              </Card>
            </Fade>
          )}

          {!hasEnrichment && (
            <Fade>
              <div
                className="rounded-xl border-2 border-dashed p-6 flex flex-col items-center justify-center gap-3 text-center cursor-pointer hover:border-primary/40 transition-colors"
                onClick={openEnrichModal}
                data-testid="enrich-empty-state"
              >
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: `${FAIRE_COLOR}15` }}>
                  <User size={18} style={{ color: FAIRE_COLOR }} />
                </div>
                <div>
                  <p className="font-medium text-sm">No contact details yet</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Click to add contact person, phone, address, and social links</p>
                </div>
                <Button size="sm" style={{ background: FAIRE_COLOR }} className="text-white hover:opacity-90" data-testid="btn-enrich-empty">
                  <Pencil size={12} className="mr-1.5" /> Enrich Retailer
                </Button>
              </div>
            </Fade>
          )}

          <Fade>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Order History</CardTitle></CardHeader>
              <CardContent className="p-0">
                {retailerOrders.length === 0 ? (
                  <div className="p-4 text-sm text-muted-foreground" data-testid="text-no-orders">No orders from this retailer yet.</div>
                ) : (
                  <DataTableContainer>
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-muted/30">
                          <DataTH>Display ID</DataTH>
                          <DataTH>Store</DataTH>
                          <DataTH>Date</DataTH>
                          <DataTH>Total</DataTH>
                          <DataTH>State</DataTH>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {retailerOrders.map((order: any) => {
                          const store = stores.find(s => s.id === order._storeId);
                          const cfg = ORDER_STATE_CONFIG[order.state as OrderState] ?? ORDER_STATE_CONFIG.NEW;
                          const itemsTotal = (order.items ?? []).reduce((s: number, i: any) => s + (i.price_cents ?? 0) * (i.quantity ?? 0), 0);
                          return (
                            <DataTR key={order.id} onClick={() => setLocation(`/faire/orders/${order.id}`)} data-testid={`order-history-row-${order.id}`}>
                              <DataTD><Badge variant="outline" className="text-xs">{order.display_id}</Badge></DataTD>
                              <DataTD><Badge variant="outline" className="text-xs">{store?.name?.split(" ")[0] ?? "Store"}</Badge></DataTD>
                              <DataTD className="text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</DataTD>
                              <DataTD className="font-semibold"><DualCurrency cents={itemsTotal} /></DataTD>
                              <DataTD><span className="text-xs px-1.5 py-0.5 rounded font-medium" style={{ background: cfg.bg, color: cfg.color }}>{cfg.label}</span></DataTD>
                            </DataTR>
                          );
                        })}
                      </tbody>
                    </table>
                  </DataTableContainer>
                )}
              </CardContent>
            </Card>
          </Fade>
        </div>

        <div className="space-y-4">
          <Fade>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Lifetime Stats</CardTitle></CardHeader>
              <CardContent className="space-y-1">
                <InfoRow label="Total Orders" value={totalOrders} />
                <InfoRow label="Total Spent">
                  <span className="text-sm font-medium" data-testid="text-stat-total-spent">
                    ${totalSpentDollars.toLocaleString()}
                    <span className="block text-xs text-muted-foreground/70 font-normal text-right">{formatINRFromDollars(totalSpentDollars)}</span>
                  </span>
                </InfoRow>
                <InfoRow label="Avg Order Value">
                  <span className="text-sm font-medium" data-testid="text-stat-avg-order-value">
                    ${avgOrderValue}
                    <span className="block text-xs text-muted-foreground/70 font-normal text-right">{formatINRFromDollars(avgOrderValue)}</span>
                  </span>
                </InfoRow>
                <InfoRow label="First Order" value={firstOrder ? new Date(firstOrder.created_at).toLocaleDateString() : "\u2014"} />
                <InfoRow label="Last Order" value={lastOrder ? new Date(lastOrder.created_at).toLocaleDateString() : "\u2014"} />
              </CardContent>
            </Card>
          </Fade>

          <Fade>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Orders From</CardTitle></CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1.5">
                  {Array.from(storeIdsSet).map((sid) => {
                    const store = stores.find(s => s.id === sid);
                    return <Badge key={sid as string} variant="outline" style={{ borderColor: `${FAIRE_COLOR}40`, color: FAIRE_COLOR }} data-testid={`badge-store-${sid}`}>{store?.name ?? "Unknown Store"}</Badge>;
                  })}
                  {storeIdsSet.size === 0 && <span className="text-xs text-muted-foreground">No store data</span>}
                </div>
              </CardContent>
            </Card>
          </Fade>
        </div>
      </div>

      <DetailModal
        open={enrichModal}
        onClose={() => setEnrichModal(false)}
        title={hasEnrichment ? "Edit Retailer Enrichment" : "Enrich Retailer"}
        subtitle={`Add or update contact details for ${retailerName}`}
        footer={
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setEnrichModal(false)}>Cancel</Button>
            <Button
              onClick={() => enrichMutation.mutate(formData)}
              disabled={enrichMutation.isPending}
              style={{ background: FAIRE_COLOR }}
              className="text-white hover:opacity-90"
              data-testid="btn-save-enrichment"
            >
              {enrichMutation.isPending ? "Saving…" : "Save Details"}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Contact Person Name</Label>
              <Input
                value={formData.contact_name}
                onChange={e => setFormData(p => ({ ...p, contact_name: e.target.value }))}
                placeholder="e.g. Theresa Moore"
                data-testid="input-contact-name"
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={formData.contact_email}
                onChange={e => setFormData(p => ({ ...p, contact_email: e.target.value }))}
                placeholder="e.g. theresa@store.com"
                data-testid="input-contact-email"
              />
            </div>
          </div>
          <div>
            <Label>Phone (for WhatsApp)</Label>
            <Input
              value={formData.contact_phone}
              onChange={e => setFormData(p => ({ ...p, contact_phone: e.target.value }))}
              placeholder="e.g. +1 361-813-1347"
              data-testid="input-contact-phone"
            />
          </div>
          <div>
            <Label>Store Address</Label>
            <Textarea
              value={formData.store_address}
              onChange={e => setFormData(p => ({ ...p, store_address: e.target.value }))}
              placeholder={"e.g. 309 North Water Street\nSuite C\nCorpus Christi, TX 78401\nUnited States"}
              rows={3}
              data-testid="input-store-address"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Business Type</Label>
              <Input
                value={formData.business_type}
                onChange={e => setFormData(p => ({ ...p, business_type: e.target.value }))}
                placeholder="e.g. Boutique Retail"
                data-testid="input-business-type"
              />
            </div>
            <div>
              <Label>Store Type</Label>
              <Input
                value={formData.store_type}
                onChange={e => setFormData(p => ({ ...p, store_type: e.target.value }))}
                placeholder="e.g. Brick & Mortar"
                data-testid="input-store-type"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Website</Label>
              <Input
                value={formData.website}
                onChange={e => setFormData(p => ({ ...p, website: e.target.value }))}
                placeholder="e.g. tmwildflowers.com"
                data-testid="input-website"
              />
            </div>
            <div>
              <Label>Instagram Handle</Label>
              <Input
                value={formData.instagram}
                onChange={e => setFormData(p => ({ ...p, instagram: e.target.value }))}
                placeholder="e.g. @tmwildflowers"
                data-testid="input-instagram"
              />
            </div>
          </div>
          <div>
            <Label>Notes</Label>
            <Textarea
              value={formData.notes}
              onChange={e => setFormData(p => ({ ...p, notes: e.target.value }))}
              placeholder="Any additional notes about this retailer…"
              rows={2}
              data-testid="input-notes"
            />
          </div>
          <div>
            <Label>Your Name (Enriched by)</Label>
            <Input
              value={formData.enriched_by}
              onChange={e => setFormData(p => ({ ...p, enriched_by: e.target.value }))}
              placeholder="e.g. Rahul Verma"
              data-testid="input-enriched-by"
            />
          </div>
        </div>
      </DetailModal>
    </PageShell>
  );
}
