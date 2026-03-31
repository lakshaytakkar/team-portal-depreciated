import { useState, useMemo } from "react";
import { useRoute, useLocation } from "wouter";
import {
  ArrowLeft, MapPin, Package, Store, Clock, Truck,
  CheckCircle2, XCircle, FileText, DollarSign,
} from "lucide-react";
import { Fade } from "@/components/ui/animated";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  vendorOrders, vendorStores, vendorClients, vendorTracking,
  type VendorOrder, type VendorOrderStatus, type VendorTracking,
} from "@/lib/mock-data-vendor";
import { VENDOR_COLOR, VENDOR_ORDER_STATUS_CONFIG } from "@/lib/vendor-config";
import { SopModal, TutorialModal, SopTutorialButtons } from "@/components/sop/sop-modal";
import { SOP_REGISTRY } from "@/lib/sop-data";
import {
  PageShell, SectionCard, InfoRow,
  DataTableContainer, DataTH, DataTD,
} from "@/components/layout";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

const TIMELINE_STATUSES: VendorOrderStatus[] = ["New", "Quoted", "Processing", "Shipped", "Delivered"];

const ACTIVITY_LOG_MAP: Record<VendorOrderStatus, string[]> = {
  New: ["Order received from Shopify"],
  Quoted: ["Order received from Shopify", "Quotation submitted to client"],
  Processing: ["Order received from Shopify", "Quotation submitted to client", "Quote accepted — processing started"],
  Shipped: ["Order received from Shopify", "Quotation submitted to client", "Quote accepted — processing started", "Shipment dispatched"],
  Delivered: ["Order received from Shopify", "Quotation submitted to client", "Quote accepted — processing started", "Shipment dispatched", "Package delivered to customer"],
  Cancelled: ["Order received from Shopify", "Order cancelled"],
};

export default function VendorOrderDetail() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/vendor/orders/:id");
  const { toast } = useToast();
  const [sopOpen, setSopOpen] = useState(false);
  const [tutorialOpen, setTutorialOpen] = useState(false);

  const order = useMemo(() => vendorOrders.find(o => o.id === params?.id), [params?.id]);
  const store = useMemo(() => order ? vendorStores.find(s => s.id === order.storeId) : undefined, [order]);
  const client = useMemo(() => store ? vendorClients.find(c => c.id === store.clientId) : undefined, [store]);
  const tracking = useMemo(() => order ? vendorTracking.find(t => t.orderId === order.id) : undefined, [order]);

  const [quoteCost, setQuoteCost] = useState("");
  const [trackingCarrier, setTrackingCarrier] = useState("FedEx");
  const [trackingNumber, setTrackingNumber] = useState("");

  const cfg = order
    ? VENDOR_ORDER_STATUS_CONFIG[order.status.toLowerCase() as keyof typeof VENDOR_ORDER_STATUS_CONFIG]
    : null;

  const timelineIdx = order && order.status !== "Cancelled"
    ? TIMELINE_STATUSES.indexOf(order.status)
    : -1;

  const activityLog = order ? (ACTIVITY_LOG_MAP[order.status] ?? []) : [];

  function handleAction(action: string) {
    toast({ title: action, description: `Action performed on order ${order?.shopifyOrderNumber}` });
  }

  if (!order) {
    return (
      <PageShell>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => setLocation("/vendor/orders")} data-testid="btn-back-not-found">
            <ArrowLeft size={15} className="mr-1.5" /> Orders
          </Button>
          <p className="text-sm text-muted-foreground">Order not found.</p>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <Fade>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-start gap-3">
            <Button variant="ghost" size="icon" className="mt-0.5" onClick={() => setLocation("/vendor/orders")} data-testid="btn-back">
              <ArrowLeft size={16} />
            </Button>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold font-heading" data-testid="text-order-number">
                  Order {order.shopifyOrderNumber}
                </h1>
                <span
                  className="text-xs px-2.5 py-0.5 rounded-full font-medium"
                  style={{ background: cfg?.bg, color: cfg?.color }}
                  data-testid="badge-order-status"
                >
                  {order.status}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground flex-wrap">
                <span>{new Date(order.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
                <span>·</span>
                <span>{order.storeName}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {order.status === "New" && (
              <Button
                size="sm"
                style={{ background: VENDOR_COLOR }}
                className="text-white"
                onClick={() => handleAction("Quote Submitted")}
                data-testid="btn-quote"
              >
                <DollarSign size={14} className="mr-1.5" /> Quote
              </Button>
            )}
            {order.status === "Quoted" && (
              <Button
                size="sm"
                style={{ background: VENDOR_COLOR }}
                className="text-white"
                onClick={() => handleAction("Order Accepted")}
                data-testid="btn-accept"
              >
                <CheckCircle2 size={14} className="mr-1.5" /> Accept
              </Button>
            )}
            {order.status === "Processing" && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleAction("Tracking Added")}
                  data-testid="btn-add-tracking"
                >
                  <Truck size={14} className="mr-1.5" /> Add Tracking
                </Button>
                <Button
                  size="sm"
                  style={{ background: VENDOR_COLOR }}
                  className="text-white"
                  onClick={() => handleAction("Marked as Shipped")}
                  data-testid="btn-mark-shipped"
                >
                  <Package size={14} className="mr-1.5" /> Mark Shipped
                </Button>
              </>
            )}
            {order.status === "Shipped" && (
              <Button
                size="sm"
                style={{ background: "#059669" }}
                className="text-white"
                onClick={() => handleAction("Marked as Delivered")}
                data-testid="btn-mark-delivered"
              >
                <CheckCircle2 size={14} className="mr-1.5" /> Mark Delivered
              </Button>
            )}
            {order.status !== "Delivered" && order.status !== "Cancelled" && (
              <Button
                size="sm"
                variant="outline"
                className="text-red-500 border-red-200"
                onClick={() => handleAction("Order Cancelled")}
                data-testid="btn-cancel"
              >
                <XCircle size={14} className="mr-1.5" /> Cancel
              </Button>
            )}
          </div>
        </div>
      </Fade>

      {order.status !== "Cancelled" && (
        <Fade>
          <div className="flex items-center gap-0 py-2">
            {TIMELINE_STATUSES.map((status, i) => {
              const stepCfg = VENDOR_ORDER_STATUS_CONFIG[status.toLowerCase() as keyof typeof VENDOR_ORDER_STATUS_CONFIG];
              const isActive = i <= timelineIdx && timelineIdx >= 0;
              const isCurrent = TIMELINE_STATUSES[timelineIdx] === status;
              return (
                <div key={status} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`size-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${isActive ? "text-white border-transparent" : "text-muted-foreground border-muted"}`}
                      style={isActive ? { background: VENDOR_COLOR } : {}}
                    >
                      {i + 1}
                    </div>
                    <p className={`text-xs mt-1.5 font-medium ${isCurrent ? "text-foreground" : "text-muted-foreground"}`}>
                      {stepCfg?.label ?? status}
                    </p>
                  </div>
                  {i < TIMELINE_STATUSES.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 mb-5 ${i < timelineIdx && timelineIdx >= 0 ? "" : "bg-muted"}`}
                      style={i < timelineIdx && timelineIdx >= 0 ? { background: VENDOR_COLOR } : {}}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </Fade>
      )}

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
                      <DataTH align="right">Unit Price</DataTH>
                      <DataTH align="right">Total</DataTH>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {order.items.map(item => (
                      <tr key={item.id} data-testid={`row-item-${item.id}`}>
                        <DataTD>
                          <div className="w-10 h-10 rounded-md overflow-hidden bg-muted flex items-center justify-center shrink-0">
                            {item.imageUrl ? (
                              <img
                                src={item.imageUrl}
                                alt={item.productName}
                                loading="lazy"
                                className="w-full h-full object-cover"
                                data-testid={`img-item-${item.id}`}
                              />
                            ) : (
                              <Package size={16} className="text-muted-foreground/50" />
                            )}
                          </div>
                        </DataTD>
                        <DataTD>
                          <p className="font-medium" data-testid={`text-item-name-${item.id}`}>{item.productName}</p>
                        </DataTD>
                        <DataTD>
                          <span className="text-muted-foreground" data-testid={`text-item-sku-${item.id}`}>{item.sku}</span>
                        </DataTD>
                        <DataTD align="center" data-testid={`text-item-qty-${item.id}`}>{item.quantity}</DataTD>
                        <DataTD align="right" data-testid={`text-item-price-${item.id}`}>
                          ${item.unitPrice.toFixed(2)}
                        </DataTD>
                        <DataTD align="right">
                          <span className="font-semibold" data-testid={`text-item-total-${item.id}`}>
                            ${item.total.toFixed(2)}
                          </span>
                        </DataTD>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </DataTableContainer>
            </SectionCard>
          </Fade>

          <Fade>
            <SectionCard title="Shipping Address">
              <div className="flex items-start gap-3">
                <div
                  className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${VENDOR_COLOR}15` }}
                >
                  <MapPin size={16} style={{ color: VENDOR_COLOR }} />
                </div>
                <div className="space-y-0.5">
                  <p className="text-sm font-medium" data-testid="text-customer-name">{order.customerName}</p>
                  <p className="text-sm text-muted-foreground" data-testid="text-address-line1">{order.shippingAddress.line1}</p>
                  {order.shippingAddress.line2 && (
                    <p className="text-sm text-muted-foreground" data-testid="text-address-line2">{order.shippingAddress.line2}</p>
                  )}
                  <p className="text-sm text-muted-foreground" data-testid="text-address-city-state">
                    {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}
                  </p>
                  <p className="text-sm text-muted-foreground" data-testid="text-address-country">{order.shippingAddress.country}</p>
                </div>
              </div>
            </SectionCard>
          </Fade>

          {order.status === "New" && (
            <Fade>
              <SectionCard title="Submit Quote">
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="quoteCost">Fulfillment Cost ($)</Label>
                    <Input
                      id="quoteCost"
                      type="number"
                      placeholder="Enter cost..."
                      value={quoteCost}
                      onChange={e => setQuoteCost(e.target.value)}
                      data-testid="input-quote-cost"
                    />
                  </div>
                  <Button
                    style={{ background: VENDOR_COLOR }}
                    className="text-white w-full"
                    onClick={() => {
                      if (!quoteCost) {
                        toast({ title: "Enter a cost", variant: "destructive" });
                        return;
                      }
                      handleAction(`Quote of $${quoteCost} submitted`);
                      setQuoteCost("");
                    }}
                    data-testid="btn-submit-quote"
                  >
                    <DollarSign size={14} className="mr-1.5" /> Submit Quote
                  </Button>
                </div>
              </SectionCard>
            </Fade>
          )}

          {(order.status === "Processing" || order.status === "Shipped") && (
            <Fade>
              <SectionCard title="Tracking Information">
                {tracking ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 flex-wrap">
                      <InfoRow label="Carrier" value={tracking.carrier} />
                      <InfoRow label="Tracking #" value={tracking.trackingNumber} />
                      <InfoRow label="Ship Date" value={new Date(tracking.shipDate).toLocaleDateString()} />
                      <InfoRow label="ETA" value={new Date(tracking.estimatedDelivery).toLocaleDateString()} />
                    </div>
                    <div className="space-y-3 pt-2">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status Updates</p>
                      <div className="space-y-0">
                        {tracking.statusUpdates.map((update, i) => (
                          <div key={i} className="flex items-start gap-3 pb-3">
                            <div className="flex flex-col items-center">
                              <div
                                className="w-3 h-3 rounded-full border-2 shrink-0"
                                style={{
                                  borderColor: VENDOR_COLOR,
                                  background: i === tracking.statusUpdates.length - 1 ? VENDOR_COLOR : "transparent",
                                }}
                              />
                              {i < tracking.statusUpdates.length - 1 && (
                                <div className="w-0.5 h-6 bg-muted" />
                              )}
                            </div>
                            <div className="-mt-0.5">
                              <p className="text-sm font-medium" data-testid={`text-tracking-status-${i}`}>{update.status}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(update.date).toLocaleString()} — {update.location}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="carrier">Carrier</Label>
                        <Select value={trackingCarrier} onValueChange={setTrackingCarrier}>
                          <SelectTrigger data-testid="select-carrier">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="FedEx">FedEx</SelectItem>
                            <SelectItem value="UPS">UPS</SelectItem>
                            <SelectItem value="USPS">USPS</SelectItem>
                            <SelectItem value="DHL">DHL</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="trackingNum">Tracking Number</Label>
                        <Input
                          id="trackingNum"
                          placeholder="Enter tracking #"
                          value={trackingNumber}
                          onChange={e => setTrackingNumber(e.target.value)}
                          data-testid="input-tracking-number"
                        />
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        if (!trackingNumber) {
                          toast({ title: "Enter tracking number", variant: "destructive" });
                          return;
                        }
                        handleAction(`Tracking ${trackingCarrier} ${trackingNumber} added`);
                        setTrackingNumber("");
                      }}
                      data-testid="btn-save-tracking"
                    >
                      <Truck size={14} className="mr-1.5" /> Save Tracking
                    </Button>
                  </div>
                )}
              </SectionCard>
            </Fade>
          )}
        </div>

        <div className="lg:col-span-2 space-y-5">
          <Fade>
            <SectionCard title="Order Summary">
              <div className="space-y-2">
                <InfoRow label="Subtotal">
                  <span className="text-sm font-medium" data-testid="text-subtotal">
                    ${order.subtotal.toFixed(2)}
                  </span>
                </InfoRow>
                <InfoRow label="Shipping">
                  <span className="text-sm font-medium" data-testid="text-shipping">
                    ${order.shippingCost.toFixed(2)}
                  </span>
                </InfoRow>
                <div className="border-t pt-2 flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold">Total</span>
                  <span className="text-lg font-bold" data-testid="text-order-total">
                    ${order.total.toFixed(2)}
                  </span>
                </div>
                {order.quotedCost !== undefined && (
                  <div className="border-t pt-2">
                    <InfoRow label="Quoted Cost">
                      <span className="text-sm font-medium text-emerald-600" data-testid="text-quoted-cost">
                        ${order.quotedCost.toFixed(2)}
                      </span>
                    </InfoRow>
                    <InfoRow label="Margin">
                      <span className="text-sm font-medium" data-testid="text-margin">
                        ${(order.total - order.quotedCost).toFixed(2)} ({((1 - order.quotedCost / order.total) * 100).toFixed(1)}%)
                      </span>
                    </InfoRow>
                  </div>
                )}
              </div>
            </SectionCard>
          </Fade>

          <Fade>
            <SectionCard title="Store Info">
              <div className="flex items-start gap-3">
                <div
                  className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${VENDOR_COLOR}15` }}
                >
                  <Store size={16} style={{ color: VENDOR_COLOR }} />
                </div>
                <div className="space-y-1 flex-1">
                  <p className="text-sm font-medium" data-testid="text-store-name">{order.storeName}</p>
                  {store && (
                    <>
                      <p className="text-xs text-muted-foreground" data-testid="text-store-domain">{store.domain}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className="text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{
                            background: store.status === "Connected" ? "#d1fae5" : store.status === "Syncing" ? "#fef3c7" : "#fee2e2",
                            color: store.status === "Connected" ? "#059669" : store.status === "Syncing" ? "#d97706" : "#dc2626",
                          }}
                          data-testid="badge-store-status"
                        >
                          {store.status}
                        </span>
                      </div>
                    </>
                  )}
                  {client && (
                    <div className="pt-2 border-t mt-2 space-y-1">
                      <InfoRow label="Client" value={client.businessName} />
                      <InfoRow label="Contact" value={client.contactPerson} />
                      <InfoRow label="Plan" value={client.planTier} />
                    </div>
                  )}
                </div>
              </div>
            </SectionCard>
          </Fade>

          <Fade>
            <SectionCard title="Customer">
              <div className="space-y-1">
                <InfoRow label="Name" value={order.customerName} />
                <InfoRow
                  label="Location"
                  value={`${order.shippingAddress.city}, ${order.shippingAddress.state}`}
                />
              </div>
            </SectionCard>
          </Fade>

          <Fade>
            <SectionCard title="Activity Log">
              <div className="space-y-0">
                {activityLog.map((entry, i) => {
                  const dateOffset = activityLog.length - 1 - i;
                  const baseDate = new Date(order.createdAt);
                  baseDate.setHours(baseDate.getHours() + dateOffset * 8);
                  return (
                    <div key={i} className="flex items-start gap-3 pb-3">
                      <div className="flex flex-col items-center">
                        <div
                          className="w-2.5 h-2.5 rounded-full shrink-0 mt-1"
                          style={{
                            background: i === activityLog.length - 1 ? VENDOR_COLOR : "hsl(var(--muted))",
                          }}
                        />
                        {i < activityLog.length - 1 && (
                          <div className="w-0.5 h-5 bg-muted" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm" data-testid={`text-activity-${i}`}>{entry}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(order.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </SectionCard>
          </Fade>
        </div>
      </div>
    </PageShell>
  );
}
