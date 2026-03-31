import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  Package, Truck, CheckSquare, Tag, AlertTriangle, Printer,
  LayoutDashboard, Clock, ChevronRight, Layers, CheckCircle2, XCircle, Plus, Flag,
} from "lucide-react";
import {
  fulfillmentOrders as INITIAL_ORDERS,
  chinaBatches as INITIAL_BATCHES,
  taggingQueue as INITIAL_TAGGING_QUEUE,
  buildTaggingItems,
  FULFILLMENT_STAGES,
  SUPPLIER_LABELS,
  CHINA_SUPPLIERS,
  getDaysInStage,
  isOrderOverdue,
  getOrderUrgency,
  type FulfillmentOrder,
  type FulfillmentStatus,
  type VendorGroup,
  type SupplierSource,
  type TaggingQueueItem,
  type ChinaBatch,
  type QCProductRecord,
} from "@/lib/mock-data-fulfillment";

const STATUS_COLORS: Record<string, string> = {
  "New": "bg-slate-100 text-slate-700",
  "Source Split": "bg-violet-100 text-violet-700",
  "Vendor Orders Placed": "bg-blue-100 text-blue-700",
  "Partially Received": "bg-orange-100 text-orange-700",
  "Fully Received": "bg-cyan-100 text-cyan-700",
  "QC In Progress": "bg-amber-100 text-amber-700",
  "QC Passed": "bg-lime-100 text-lime-700",
  "MRP Tagging": "bg-pink-100 text-pink-700",
  "Ready to Ship": "bg-indigo-100 text-indigo-700",
  "Shipped": "bg-green-100 text-green-700",
  "Delivered": "bg-emerald-100 text-emerald-700",
};

const URGENCY_COLORS = {
  green: "bg-green-100 text-green-700 border-green-200",
  yellow: "bg-yellow-100 text-yellow-700 border-yellow-200",
  red: "bg-red-100 text-red-700 border-red-200",
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default function EtsFulfillmentPortal() {
  const stageCounts = FULFILLMENT_STAGES.reduce<Record<FulfillmentStatus, number>>((acc, s) => {
    acc[s] = INITIAL_ORDERS.filter(o => o.status === s).length;
    return acc;
  }, {} as Record<FulfillmentStatus, number>);

  const overdueOrders = INITIAL_ORDERS.filter(isOrderOverdue);
  const activeBatches = INITIAL_BATCHES.filter(b => b.status !== "Received");

  const avgTimes: { stage: FulfillmentStatus; avg: number }[] = FULFILLMENT_STAGES.slice(0, 9).map(stage => {
    const ordersInStage = INITIAL_ORDERS.filter(o => o.stageEnteredAt?.[stage]);
    if (ordersInStage.length === 0) return { stage, avg: 0 };
    const totalDays = ordersInStage.reduce((sum, o) => {
      const entered = new Date(o.stageEnteredAt![stage]!);
      const now = new Date("2026-03-26");
      return sum + Math.floor((now.getTime() - entered.getTime()) / (1000 * 60 * 60 * 24));
    }, 0);
    return { stage, avg: Math.round(totalDays / ordersInStage.length) };
  });

  return (
    <div className="px-6 lg:px-10 py-6 space-y-6" data-testid="fulfillment-dashboard">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 p-6 text-white shadow-lg">
        <div className="relative z-10">
          <p className="text-sm text-amber-200 mb-1 flex items-center gap-2"><LayoutDashboard className="w-4 h-4" /> Fulfillment Dashboard</p>
          <h1 className="text-2xl font-bold" data-testid="text-dashboard-title">Warehouse Operations — Today's Overview</h1>
          <div className="flex flex-wrap items-center gap-6 mt-3 text-sm text-amber-200">
            <span><strong className="text-white">{INITIAL_ORDERS.length}</strong> Total Orders</span>
            <span><strong className="text-white">{overdueOrders.length}</strong> Overdue</span>
            <span><strong className="text-white">{activeBatches.length}</strong> Active China Batches</span>
            <span><strong className="text-white">{INITIAL_ORDERS.filter(o => o.status === "Ready to Ship").length}</strong> Ready to Ship</span>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-500" /> Pipeline Funnel
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                {FULFILLMENT_STAGES.map((stage) => {
                  const count = stageCounts[stage];
                  const maxCount = Math.max(...Object.values(stageCounts), 1);
                  const pct = (count / maxCount) * 100;
                  return (
                    <div key={stage} className="flex items-center gap-3" data-testid={`funnel-stage-${stage.toLowerCase().replace(/\s+/g, "-")}`}>
                      <span className="text-xs text-muted-foreground w-36 shrink-0 text-right">{stage}</span>
                      <div className="flex-1 bg-muted/40 rounded-full h-5 relative overflow-hidden">
                        <div className="h-full rounded-full bg-amber-400 transition-all" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs font-semibold w-6 text-center">{count}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" /> Avg Days Per Stage
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-3 gap-2">
                {avgTimes.map(({ stage, avg }) => (
                  <div key={stage} className="bg-muted/30 rounded-lg p-2 text-center" data-testid={`avg-time-${stage.toLowerCase().replace(/\s+/g, "-")}`}>
                    <p className="text-xs text-muted-foreground leading-tight">{stage}</p>
                    <p className={`text-lg font-bold mt-0.5 ${avg > 5 ? "text-red-600" : avg > 3 ? "text-amber-600" : "text-emerald-600"}`}>{avg}d</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500" /> Overdue Items ({overdueOrders.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              {overdueOrders.length === 0 && <p className="text-xs text-muted-foreground">No overdue orders</p>}
              {overdueOrders.map(order => (
                <div key={order.id} className="p-2.5 rounded-lg bg-red-50 border border-red-100" data-testid={`overdue-${order.id}`}>
                  <p className="text-xs font-semibold">{order.orderNumber} — {order.partnerName}</p>
                  <p className="text-[11px] text-red-600 mt-0.5">{getDaysInStage(order)}d in <em>{order.status}</em></p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Package className="w-4 h-4 text-amber-500" /> China Batches
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              {INITIAL_BATCHES.map(batch => (
                <div key={batch.id} className="p-2.5 rounded-lg bg-muted/40" data-testid={`dashboard-batch-${batch.id}`}>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-mono font-bold">{batch.batchNumber}</span>
                    <Badge variant="outline" className={`text-[10px] ${batch.status === "In Transit" ? "border-blue-200 text-blue-700" : batch.status === "Active" ? "border-amber-200 text-amber-700" : "border-green-200 text-green-700"}`}>
                      {batch.status}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">{SUPPLIER_LABELS[batch.supplier]} · {batch.totalItems} items · ETA {formatDate(batch.estimatedArrival)}</p>
                  <p className="text-[11px] text-muted-foreground">{batch.includedOrderIds.length} partner orders</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export function EtsFulfillmentOrders() {
  const [, setLocation] = useLocation();

  const sorted = [...INITIAL_ORDERS]
    .filter(o => o.status !== "Shipped" && o.status !== "Delivered")
    .sort((a, b) => new Date(a.orderDate).getTime() - new Date(b.orderDate).getTime());

  return (
    <div className="px-6 lg:px-10 py-6 space-y-6" data-testid="order-queue">
      <div>
        <h1 className="text-xl font-bold">Order Queue</h1>
        <p className="text-sm text-muted-foreground">Oldest-first · click a row to process</p>
      </div>
      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left p-3 text-xs font-semibold text-muted-foreground">Order</th>
                  <th className="text-left p-3 text-xs font-semibold text-muted-foreground">Partner</th>
                  <th className="text-left p-3 text-xs font-semibold text-muted-foreground">Date</th>
                  <th className="text-left p-3 text-xs font-semibold text-muted-foreground">Items</th>
                  <th className="text-left p-3 text-xs font-semibold text-muted-foreground">Value</th>
                  <th className="text-left p-3 text-xs font-semibold text-muted-foreground">Status</th>
                  <th className="text-left p-3 text-xs font-semibold text-muted-foreground">Urgency</th>
                  <th className="p-3"></th>
                </tr>
              </thead>
              <tbody>
                {sorted.map(order => {
                  const urgency = getOrderUrgency(order);
                  const days = Math.floor((new Date("2026-03-26").getTime() - new Date(order.orderDate).getTime()) / (1000 * 60 * 60 * 24));
                  return (
                    <tr
                      key={order.id}
                      className="border-b last:border-0 hover:bg-muted/20 cursor-pointer transition-colors"
                      onClick={() => setLocation(`/portal-ets/fulfillment/orders/${order.id}`)}
                      data-testid={`order-row-${order.id}`}
                    >
                      <td className="p-3 font-mono text-xs font-semibold">{order.orderNumber}</td>
                      <td className="p-3">
                        <p className="font-medium text-sm">{order.partnerName}</p>
                        <p className="text-xs text-muted-foreground">{order.partnerCity}</p>
                      </td>
                      <td className="p-3 text-xs text-muted-foreground">{formatDate(order.orderDate)}</td>
                      <td className="p-3 text-xs">{order.items.reduce((s, i) => s + i.quantity, 0)}</td>
                      <td className="p-3 text-xs font-medium">₹{order.totalValue.toLocaleString("en-IN")}</td>
                      <td className="p-3">
                        <Badge variant="outline" className={`text-[10px] ${STATUS_COLORS[order.status]}`}>{order.status}</Badge>
                      </td>
                      <td className="p-3">
                        <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border font-medium ${URGENCY_COLORS[urgency]}`} data-testid={`urgency-${order.id}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${urgency === "green" ? "bg-green-500" : urgency === "yellow" ? "bg-yellow-500" : "bg-red-500"}`} />
                          {days}d ago
                        </span>
                      </td>
                      <td className="p-3">
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function computeOrderStatus(vendorGroups: VendorGroup[]): FulfillmentStatus {
  const allReceived = vendorGroups.every(g => g.status === "Received");
  const anyReceived = vendorGroups.some(g => g.receivedQty > 0);
  const allOrdered = vendorGroups.every(g => g.status !== "Pending");
  if (allReceived) return "QC In Progress";
  if (anyReceived) return "Partially Received";
  if (allOrdered) return "Vendor Orders Placed";
  return "Source Split";
}

export function EtsFulfillmentOrderDetail({ params }: { params: { id: string } }) {
  const orderId = params.id;
  const [orders, setOrders] = useState<FulfillmentOrder[]>(INITIAL_ORDERS);
  const [refModal, setRefModal] = useState<{ groupId: string; ref: string; date: string } | null>(null);
  const [receiveModal, setReceiveModal] = useState<{ groupId: string; qty: string } | null>(null);

  const order = orders.find(o => o.id === orderId);
  if (!order) return <div className="p-8 text-center text-muted-foreground">Order not found</div>;

  const supplierGroups: Record<string, typeof order.items> = {};
  for (const item of order.items) {
    if (!supplierGroups[item.supplier]) supplierGroups[item.supplier] = [];
    supplierGroups[item.supplier].push(item);
  }

  function handleSplitBySource() {
    setOrders(prev => prev.map(o => {
      if (o.id !== orderId) return o;
      const seenSuppliers: SupplierSource[] = [];
      const groups: VendorGroup[] = [];
      for (const item of o.items) {
        if (!seenSuppliers.includes(item.supplier)) seenSuppliers.push(item.supplier);
      }
      seenSuppliers.forEach((sup, idx) => {
        const grpItems = o.items.filter(i => i.supplier === sup);
        groups.push({
          id: `${o.id}-vg-${idx + 1}`,
          orderId: o.id,
          supplier: sup,
          items: grpItems,
          status: "Pending",
          orderedQty: grpItems.reduce((s, i) => s + i.quantity, 0),
          receivedQty: 0,
        });
      });
      return { ...o, vendorGroups: groups, status: "Source Split" };
    }));
  }

  function handleMarkOrdered(groupId: string, ref: string, date: string) {
    setOrders(prev => prev.map(o => {
      if (o.id !== orderId) return o;
      const updated = (o.vendorGroups ?? []).map(g =>
        g.id === groupId ? { ...g, status: "Ordered" as const, referenceNumber: ref, expectedArrival: date } : g
      );
      return { ...o, vendorGroups: updated, status: computeOrderStatus(updated) };
    }));
    setRefModal(null);
  }

  function handleReceive(groupId: string, qty: number) {
    setOrders(prev => prev.map(o => {
      if (o.id !== orderId) return o;
      const updated = (o.vendorGroups ?? []).map(g => {
        if (g.id !== groupId) return g;
        const newStatus: VendorGroup["status"] = qty >= g.orderedQty ? "Received" : "Partially Received";
        return { ...g, receivedQty: qty, status: newStatus };
      });
      return { ...o, vendorGroups: updated, status: computeOrderStatus(updated) };
    }));
    setReceiveModal(null);
  }

  return (
    <div className="px-6 lg:px-10 py-6 space-y-6" data-testid={`order-detail-${orderId}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground font-mono">{order.orderNumber}</p>
          <h1 className="text-xl font-bold">{order.partnerName}</h1>
          <p className="text-sm text-muted-foreground">{order.partnerCity} · {order.deliveryAddress}</p>
          <p className="text-sm text-muted-foreground">Ordered: {formatDate(order.orderDate)} · Total: ₹{order.totalValue.toLocaleString("en-IN")}</p>
        </div>
        <Badge variant="outline" className={`text-sm ${STATUS_COLORS[order.status]}`}>{order.status}</Badge>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold">
              Items ({order.items.length} lines · {order.items.reduce((s, i) => s + i.quantity, 0)} units)
            </CardTitle>
            {!order.vendorGroups && (
              <Button
                size="sm"
                className="bg-amber-500 hover:bg-amber-600 text-white gap-1"
                onClick={handleSplitBySource}
                data-testid="btn-split-by-source"
              >
                <Layers className="w-3.5 h-3.5" /> Split by Source
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {!order.vendorGroups ? (
            <div className="space-y-4">
              {Object.entries(supplierGroups).map(([sup, items]) => (
                <div key={sup} className="mb-3">
                  <p className="text-xs font-semibold text-muted-foreground mb-1">{SUPPLIER_LABELS[sup as SupplierSource]}</p>
                  {items.map(item => (
                    <div key={item.id} className="flex items-center justify-between py-1.5 border-b last:border-0 text-sm" data-testid={`item-${item.id}`}>
                      <div>
                        <span className="font-medium">{item.productName}</span>
                        <span className="text-xs text-muted-foreground ml-2">{item.sku}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-xs text-muted-foreground">Qty: {item.quantity}</span>
                        <span className="text-xs font-medium">MRP ₹{item.mrp}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {order.vendorGroups.map(group => (
                <div key={group.id} className="border rounded-xl p-4" data-testid={`vendor-group-${group.id}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-semibold text-sm">{SUPPLIER_LABELS[group.supplier]}</p>
                      <p className="text-xs text-muted-foreground">{group.items.length} products · {group.orderedQty} units total</p>
                    </div>
                    <Badge variant="outline" className={`text-[10px] ${group.status === "Received" ? "border-green-200 text-green-700 bg-green-50" : group.status === "Ordered" ? "border-blue-200 text-blue-700 bg-blue-50" : group.status === "Partially Received" ? "border-orange-200 text-orange-700 bg-orange-50" : "border-gray-200 text-gray-500"}`}>
                      {group.status}
                    </Badge>
                  </div>
                  <div className="space-y-1 mb-3">
                    {group.items.map(item => (
                      <div key={item.id} className="flex justify-between text-xs text-muted-foreground">
                        <span>{item.productName}</span>
                        <span>× {item.quantity}</span>
                      </div>
                    ))}
                  </div>
                  {group.referenceNumber && (
                    <div className="text-xs text-muted-foreground mb-2">
                      Ref: <span className="font-mono">{group.referenceNumber}</span>
                      {group.expectedArrival && <span className="ml-2">· ETA: {formatDate(group.expectedArrival)}</span>}
                    </div>
                  )}
                  {group.receivedQty > 0 && (
                    <div className="text-xs text-muted-foreground mb-2">
                      Received: <strong>{group.receivedQty}</strong> / {group.orderedQty} units
                    </div>
                  )}
                  <div className="flex gap-2 flex-wrap">
                    {group.status === "Pending" && (
                      <Button
                        size="sm"
                        className="h-7 text-xs bg-blue-600 hover:bg-blue-700 text-white gap-1"
                        onClick={() => setRefModal({ groupId: group.id, ref: "", date: "" })}
                        data-testid={`btn-mark-ordered-${group.id}`}
                      >
                        <CheckCircle2 className="w-3 h-3" /> Mark Ordered
                      </Button>
                    )}
                    {(group.status === "Ordered" || group.status === "Partially Received") && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs gap-1"
                        onClick={() => setReceiveModal({ groupId: group.id, qty: String(group.orderedQty) })}
                        data-testid={`btn-receive-${group.id}`}
                      >
                        <Package className="w-3 h-3" /> Receive Stock
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {refModal && (
        <Dialog open onOpenChange={() => setRefModal(null)}>
          <DialogContent>
            <DialogHeader><DialogTitle>Mark as Ordered</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div>
                <Label className="text-xs">Supplier Reference Number</Label>
                <Input
                  value={refModal.ref}
                  onChange={e => setRefModal({ ...refModal, ref: e.target.value })}
                  placeholder="e.g. REF-HDB-2024"
                  data-testid="input-ref-number"
                />
              </div>
              <div>
                <Label className="text-xs">Expected Arrival Date</Label>
                <Input
                  type="date"
                  value={refModal.date}
                  onChange={e => setRefModal({ ...refModal, date: e.target.value })}
                  data-testid="input-arrival-date"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setRefModal(null)}>Cancel</Button>
              <Button
                className="bg-amber-500 hover:bg-amber-600 text-white"
                onClick={() => handleMarkOrdered(refModal.groupId, refModal.ref, refModal.date)}
                data-testid="btn-confirm-ordered"
              >
                Confirm
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {receiveModal && (
        <Dialog open onOpenChange={() => setReceiveModal(null)}>
          <DialogContent>
            <DialogHeader><DialogTitle>Receive Stock</DialogTitle></DialogHeader>
            <div>
              <Label className="text-xs">Actual Quantity Received</Label>
              <Input
                type="number"
                value={receiveModal.qty}
                onChange={e => setReceiveModal({ ...receiveModal, qty: e.target.value })}
                data-testid="input-received-qty"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setReceiveModal(null)}>Cancel</Button>
              <Button
                className="bg-amber-500 hover:bg-amber-600 text-white"
                onClick={() => handleReceive(receiveModal.groupId, Number(receiveModal.qty))}
                data-testid="btn-confirm-receive"
              >
                Confirm Receipt
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

let batchCounter = 3;
function nextBatchNumber(): string {
  batchCounter++;
  return `CB-2026-00${batchCounter}`;
}

export function EtsFulfillmentBatches() {
  const [batches, setBatches] = useState<ChinaBatch[]>(INITIAL_BATCHES);
  const [orders, setOrders] = useState<FulfillmentOrder[]>(INITIAL_ORDERS);
  const [createModal, setCreateModal] = useState(false);
  const [newBatchForm, setNewBatchForm] = useState<{ supplier: SupplierSource; estArrival: string; shippingCost: string }>({
    supplier: "china_haoduobao",
    estArrival: "",
    shippingCost: "",
  });
  const [receiveModal, setReceiveModal] = useState<string | null>(null);

  const pendingChinaItems = orders.flatMap(order =>
    order.items
      .filter(item => (CHINA_SUPPLIERS as string[]).includes(item.supplier))
      .map(item => ({ ...item, orderId: order.id, orderNumber: order.orderNumber, partnerName: order.partnerName }))
  );

  const haoduobaoItems = pendingChinaItems.filter(i => i.supplier === "china_haoduobao");
  const allenItems = pendingChinaItems.filter(i => i.supplier === "china_allen");

  function handleCreateBatch() {
    const sup = newBatchForm.supplier;
    const relevantItems = sup === "china_haoduobao" ? haoduobaoItems : allenItems;
    const includedOrderIds = [...new Set(relevantItems.map(i => i.orderId))];
    const totalItems = relevantItems.reduce((s, i) => s + i.quantity, 0);

    const newBatch: ChinaBatch = {
      id: `BATCH-C00${batchCounter + 1}`,
      batchNumber: nextBatchNumber(),
      supplier: sup,
      status: "Active",
      totalItems,
      totalCbm: parseFloat((totalItems * 0.04).toFixed(2)),
      estimatedShippingCost: Number(newBatchForm.shippingCost) || totalItems * 300,
      includedOrderIds,
      estimatedArrival: newBatchForm.estArrival || "2026-05-15",
      createdDate: "2026-03-26",
    };
    setBatches(prev => [...prev, newBatch]);
    setCreateModal(false);
    setNewBatchForm({ supplier: "china_haoduobao", estArrival: "", shippingCost: "" });
  }

  function handleReceiveBatch(batchId: string) {
    const batch = batches.find(b => b.id === batchId);
    if (!batch) return;
    setBatches(prev => prev.map(b => b.id === batchId ? { ...b, status: "Received", receivedDate: "2026-03-26" } : b));
    setOrders(prev => prev.map(o => {
      if (!batch.includedOrderIds.includes(o.id)) return o;
      if (o.status !== "Vendor Orders Placed" && o.status !== "Partially Received") return o;
      const updatedGroups = (o.vendorGroups ?? []).map(g =>
        (CHINA_SUPPLIERS as string[]).includes(g.supplier)
          ? { ...g, status: "Received" as const, receivedQty: g.orderedQty }
          : g
      );
      const allReceived = updatedGroups.every(g => g.status === "Received");
      return {
        ...o,
        vendorGroups: updatedGroups,
        status: allReceived ? ("QC In Progress" as FulfillmentStatus) : ("Partially Received" as FulfillmentStatus),
      };
    }));
    setReceiveModal(null);
  }

  return (
    <div className="px-6 lg:px-10 py-6 space-y-6" data-testid="batches-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">China Batch Consolidation</h1>
          <p className="text-sm text-muted-foreground">Group items from multiple partner orders into consolidated shipments</p>
        </div>
        <Button className="bg-amber-500 hover:bg-amber-600 text-white gap-1" onClick={() => setCreateModal(true)} data-testid="btn-create-batch">
          <Plus className="w-4 h-4" /> New Batch
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Package className="w-4 h-4 text-red-500" /> Haoduobao — Pending ({haoduobaoItems.length} lines)
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-2">
            {haoduobaoItems.length === 0 && <p className="text-xs text-muted-foreground">No pending items</p>}
            {haoduobaoItems.map(item => (
              <div key={item.id} className="flex justify-between items-start py-1.5 border-b last:border-0" data-testid={`haoduobao-item-${item.id}`}>
                <div>
                  <p className="text-xs font-medium">{item.productName}</p>
                  <p className="text-[11px] text-muted-foreground">{item.orderNumber} · {item.partnerName}</p>
                </div>
                <span className="text-xs font-semibold">× {item.quantity}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Package className="w-4 h-4 text-blue-500" /> Allen — Pending ({allenItems.length} lines)
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-2">
            {allenItems.length === 0 && <p className="text-xs text-muted-foreground">No pending items</p>}
            {allenItems.map(item => (
              <div key={item.id} className="flex justify-between items-start py-1.5 border-b last:border-0" data-testid={`allen-item-${item.id}`}>
                <div>
                  <p className="text-xs font-medium">{item.productName}</p>
                  <p className="text-[11px] text-muted-foreground">{item.orderNumber} · {item.partnerName}</p>
                </div>
                <span className="text-xs font-semibold">× {item.quantity}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-base font-semibold mb-3">Active Batches</h2>
        <div className="space-y-4">
          {batches.map(batch => (
            <Card key={batch.id} className="border-0 shadow-sm" data-testid={`batch-card-${batch.id}`}>
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="font-bold font-mono">{batch.batchNumber}</p>
                    <p className="text-sm text-muted-foreground">{SUPPLIER_LABELS[batch.supplier]}</p>
                  </div>
                  <Badge variant="outline" className={`${batch.status === "In Transit" ? "border-blue-200 text-blue-700 bg-blue-50" : batch.status === "Active" ? "border-amber-200 text-amber-700 bg-amber-50" : "border-green-200 text-green-700 bg-green-50"}`}>
                    {batch.status}
                  </Badge>
                </div>
                <div className="grid grid-cols-4 gap-3 text-center mb-4">
                  <div className="bg-muted/40 rounded-lg p-2.5">
                    <p className="text-lg font-bold">{batch.totalItems}</p>
                    <p className="text-xs text-muted-foreground">Items</p>
                  </div>
                  <div className="bg-muted/40 rounded-lg p-2.5">
                    <p className="text-lg font-bold">{batch.totalCbm}</p>
                    <p className="text-xs text-muted-foreground">CBM</p>
                  </div>
                  <div className="bg-muted/40 rounded-lg p-2.5">
                    <p className="text-lg font-bold">₹{(batch.estimatedShippingCost / 1000).toFixed(0)}k</p>
                    <p className="text-xs text-muted-foreground">Ship Cost</p>
                  </div>
                  <div className="bg-muted/40 rounded-lg p-2.5">
                    <p className="text-sm font-bold">{batch.includedOrderIds.length}</p>
                    <p className="text-xs text-muted-foreground">Orders</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">ETA: {formatDate(batch.estimatedArrival)}</p>
                    <p className="text-[11px] text-muted-foreground">Orders: {batch.includedOrderIds.join(", ")}</p>
                  </div>
                  {batch.status !== "Received" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs gap-1"
                      onClick={() => setReceiveModal(batch.id)}
                      data-testid={`btn-receive-batch-${batch.id}`}
                    >
                      <CheckCircle2 className="w-3 h-3" /> Mark Arrived
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {createModal && (
        <Dialog open onOpenChange={() => setCreateModal(false)}>
          <DialogContent>
            <DialogHeader><DialogTitle>Create China Batch</DialogTitle></DialogHeader>
            <p className="text-sm text-muted-foreground">Consolidates all pending items from the selected supplier across all active partner orders into one shipment batch.</p>
            <div className="space-y-3">
              <div>
                <Label className="text-xs">Supplier</Label>
                <select
                  className="w-full border rounded-md p-2 text-sm mt-1"
                  value={newBatchForm.supplier}
                  onChange={e => setNewBatchForm({ ...newBatchForm, supplier: e.target.value as SupplierSource })}
                  data-testid="select-batch-supplier"
                >
                  <option value="china_haoduobao">China – Haoduobao ({haoduobaoItems.reduce((s, i) => s + i.quantity, 0)} units from {[...new Set(haoduobaoItems.map(i => i.orderId))].length} orders)</option>
                  <option value="china_allen">China – Allen ({allenItems.reduce((s, i) => s + i.quantity, 0)} units from {[...new Set(allenItems.map(i => i.orderId))].length} orders)</option>
                </select>
              </div>
              <div>
                <Label className="text-xs">Estimated Arrival Date</Label>
                <Input
                  type="date"
                  value={newBatchForm.estArrival}
                  onChange={e => setNewBatchForm({ ...newBatchForm, estArrival: e.target.value })}
                  data-testid="input-batch-arrival"
                />
              </div>
              <div>
                <Label className="text-xs">Estimated Shipping Cost (₹)</Label>
                <Input
                  type="number"
                  placeholder="e.g. 32000"
                  value={newBatchForm.shippingCost}
                  onChange={e => setNewBatchForm({ ...newBatchForm, shippingCost: e.target.value })}
                  data-testid="input-batch-cost"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateModal(false)}>Cancel</Button>
              <Button className="bg-amber-500 hover:bg-amber-600 text-white" onClick={handleCreateBatch} data-testid="btn-confirm-create-batch">
                Create Batch
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {receiveModal && (
        <Dialog open onOpenChange={() => setReceiveModal(null)}>
          <DialogContent>
            <DialogHeader><DialogTitle>Mark Batch as Arrived</DialogTitle></DialogHeader>
            <p className="text-sm text-muted-foreground">Marking this batch arrived will auto-update all included partner orders: China vendor groups will be marked Received, and orders where all groups are received will advance to QC In Progress.</p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setReceiveModal(null)}>Cancel</Button>
              <Button className="bg-amber-500 hover:bg-amber-600 text-white" onClick={() => handleReceiveBatch(receiveModal)} data-testid="btn-confirm-arrive">
                Confirm Arrival
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

export function EtsFulfillmentQC() {
  const [orders, setOrders] = useState<FulfillmentOrder[]>(INITIAL_ORDERS);

  const qcOrders = orders.filter(o => o.status === "QC In Progress");

  function handleUpdateQC(orderId: string, groupId: string, itemId: string, field: keyof QCProductRecord, value: number | string) {
    setOrders(prev => prev.map(o => {
      if (o.id !== orderId) return o;
      const updated = (o.vendorGroups ?? []).map(g => {
        if (g.id !== groupId) return g;
        const updatedProducts = (g.qcProducts ?? []).map(p =>
          p.itemId !== itemId ? p : { ...p, [field]: value }
        );
        return { ...g, qcProducts: updatedProducts };
      });
      return { ...o, vendorGroups: updated };
    }));
  }

  function handleMarkQCResult(orderId: string, groupId: string, result: "Passed" | "Failed") {
    setOrders(prev => prev.map(o => {
      if (o.id !== orderId) return o;
      const updated = (o.vendorGroups ?? []).map(g =>
        g.id === groupId ? { ...g, qcStatus: result as QCStatus } : g
      );
      const allPassed = updated.every(g => g.qcStatus === "Passed");
      return {
        ...o,
        vendorGroups: updated,
        status: allPassed ? ("MRP Tagging" as FulfillmentStatus) : o.status,
      };
    }));
  }

  if (qcOrders.length === 0) {
    return (
      <div className="px-6 lg:px-10 py-6 space-y-6" data-testid="qc-page">
        <h1 className="text-xl font-bold">QC — Quality Check</h1>
        <div className="text-center py-12 text-muted-foreground">
          <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-green-400" />
          <p>No orders currently in QC.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 lg:px-10 py-6 space-y-6" data-testid="qc-page">
      <h1 className="text-xl font-bold">QC — Quality Check</h1>
      <p className="text-sm text-muted-foreground -mt-4">Spot-check received vendor orders. Fail rate &gt;10% per product is flagged in red. When all groups pass, the order advances to MRP Tagging.</p>
      {qcOrders.map(order => (
        <Card key={order.id} className="border-0 shadow-sm" data-testid={`qc-order-${order.id}`}>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-base">{order.partnerName} — {order.orderNumber}</CardTitle>
                <p className="text-xs text-muted-foreground">{order.partnerCity}</p>
              </div>
              <Badge variant="outline" className={STATUS_COLORS[order.status]}>{order.status}</Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0 space-y-4">
            {(order.vendorGroups ?? []).map(group => (
              <div key={group.id} className="border rounded-xl p-4" data-testid={`qc-group-${group.id}`}>
                <div className="flex items-center justify-between mb-3">
                  <p className="font-semibold text-sm">{SUPPLIER_LABELS[group.supplier]}</p>
                  <Badge variant="outline" className={`text-[10px] ${group.qcStatus === "Passed" ? "border-green-200 text-green-700" : group.qcStatus === "Failed" ? "border-red-200 text-red-700" : "border-amber-200 text-amber-700"}`}>
                    {group.qcStatus ?? "Pending"}
                  </Badge>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2 text-muted-foreground">Product</th>
                        <th className="text-center p-2 text-muted-foreground">Qty</th>
                        <th className="text-center p-2 text-muted-foreground">Checked</th>
                        <th className="text-center p-2 text-muted-foreground">Passed</th>
                        <th className="text-center p-2 text-muted-foreground">Failed</th>
                        <th className="text-center p-2 text-muted-foreground">Fail%</th>
                        <th className="text-left p-2 text-muted-foreground">Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(group.qcProducts ?? []).map(prod => {
                        const failRate = prod.checked > 0 ? (prod.failed / prod.checked) * 100 : 0;
                        const isHighFail = failRate > 10;
                        return (
                          <tr key={prod.itemId} className={`border-b last:border-0 ${isHighFail ? "bg-red-50" : ""}`} data-testid={`qc-product-${prod.itemId}`}>
                            <td className="p-2 font-medium">{prod.productName}</td>
                            <td className="p-2 text-center text-muted-foreground">{prod.qty}</td>
                            <td className="p-2 text-center">
                              <Input
                                type="number"
                                className="w-16 h-6 text-center text-xs p-1"
                                value={prod.checked}
                                onChange={e => handleUpdateQC(order.id, group.id, prod.itemId, "checked", Number(e.target.value))}
                                data-testid={`input-checked-${prod.itemId}`}
                              />
                            </td>
                            <td className="p-2 text-center">
                              <Input
                                type="number"
                                className="w-16 h-6 text-center text-xs p-1"
                                value={prod.passed}
                                onChange={e => handleUpdateQC(order.id, group.id, prod.itemId, "passed", Number(e.target.value))}
                                data-testid={`input-passed-${prod.itemId}`}
                              />
                            </td>
                            <td className="p-2 text-center">
                              <Input
                                type="number"
                                className="w-16 h-6 text-center text-xs p-1"
                                value={prod.failed}
                                onChange={e => handleUpdateQC(order.id, group.id, prod.itemId, "failed", Number(e.target.value))}
                                data-testid={`input-failed-${prod.itemId}`}
                              />
                            </td>
                            <td className={`p-2 text-center font-semibold ${isHighFail ? "text-red-600" : "text-muted-foreground"}`}>
                              {failRate.toFixed(1)}%
                              {isHighFail && <Flag className="w-3 h-3 inline ml-1 text-red-500" />}
                            </td>
                            <td className="p-2">
                              <Input
                                className="h-6 text-xs p-1"
                                placeholder="Notes..."
                                value={prod.notes}
                                onChange={e => handleUpdateQC(order.id, group.id, prod.itemId, "notes", e.target.value)}
                                data-testid={`input-notes-${prod.itemId}`}
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {group.qcStatus !== "Passed" && group.qcStatus !== "Failed" && (
                  <div className="flex gap-2 mt-3">
                    <Button
                      size="sm"
                      className="h-7 text-xs bg-green-600 hover:bg-green-700 text-white gap-1"
                      onClick={() => handleMarkQCResult(order.id, group.id, "Passed")}
                      data-testid={`btn-qc-pass-${group.id}`}
                    >
                      <CheckCircle2 className="w-3 h-3" /> Mark QC Passed
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs border-red-300 text-red-600 hover:bg-red-50 gap-1"
                      onClick={() => handleMarkQCResult(order.id, group.id, "Failed")}
                      data-testid={`btn-qc-fail-${group.id}`}
                    >
                      <XCircle className="w-3 h-3" /> Mark QC Failed
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function EtsFulfillmentStickers() {
  const [items, setItems] = useState<TaggingQueueItem[]>(INITIAL_TAGGING_QUEUE);
  const [orders, setOrders] = useState<FulfillmentOrder[]>(INITIAL_ORDERS);
  const [printModal, setPrintModal] = useState(false);

  const mrpTaggingOrders = orders.filter(o => o.status === "MRP Tagging");
  const currentBatchOrderId = mrpTaggingOrders[0]?.id ?? "ORD-F008";
  const currentBatchItems = items.filter(i => i.orderId === currentBatchOrderId);

  function handleUpdateStatus(id: string, status: TaggingQueueItem["status"]) {
    setItems(prev => {
      const updated = prev.map(item => item.id === id ? { ...item, status } : item);
      const orderItems = updated.filter(i => i.orderId === currentBatchOrderId);
      const allDone = orderItems.length > 0 && orderItems.every(i => i.status === "Done");
      if (allDone) {
        setOrders(prev2 => prev2.map(o =>
          o.id !== currentBatchOrderId ? o : { ...o, status: "Ready to Ship" as FulfillmentStatus }
        ));
      }
      return updated;
    });
  }

  const statusColors: Record<TaggingQueueItem["status"], string> = {
    "Pending": "bg-gray-100 text-gray-600",
    "In Progress": "bg-amber-100 text-amber-700",
    "Done": "bg-green-100 text-green-700",
  };

  return (
    <div className="px-6 lg:px-10 py-6 space-y-6" data-testid="stickers-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">MRP Tagging Queue</h1>
          <p className="text-sm text-muted-foreground">Mark each product as tagged. When all items in an order are tagged, it advances to Ready to Ship.</p>
        </div>
        <Button
          variant="outline"
          className="gap-2"
          onClick={() => setPrintModal(true)}
          data-testid="btn-print-tag-sheet"
        >
          <Printer className="w-4 h-4" /> Print Tag Sheet
        </Button>
      </div>

      <div className="space-y-3">
        {items.map(item => (
          <Card key={item.id} className="border-0 shadow-sm" data-testid={`tag-item-${item.id}`}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-sm">{item.productName}</p>
                    <Badge variant="outline" className={`text-[10px] ${statusColors[item.status]}`}>{item.status}</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-0.5 text-xs text-muted-foreground">
                    <span>SKU: {item.sku}</span>
                    <span>Order: {item.orderNumber} — {item.partnerName}</span>
                    <span>Qty to Tag: <strong className="text-foreground">{item.quantityToTag}</strong></span>
                    <span>MRP: <strong className="text-foreground">₹{item.mrp}</strong></span>
                    <span>Barcode: {item.barcode}</span>
                    <span>Origin: {item.countryOfOrigin}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5 shrink-0">
                  {item.status === "Pending" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs"
                      onClick={() => handleUpdateStatus(item.id, "In Progress")}
                      data-testid={`btn-start-tag-${item.id}`}
                    >
                      Start Tagging
                    </Button>
                  )}
                  {item.status === "In Progress" && (
                    <Button
                      size="sm"
                      className="h-7 text-xs bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => handleUpdateStatus(item.id, "Done")}
                      data-testid={`btn-done-tag-${item.id}`}
                    >
                      Mark Done
                    </Button>
                  )}
                  {item.status === "Done" && (
                    <span className="flex items-center gap-1 text-green-600 text-xs font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Tagged
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {printModal && (
        <Dialog open onOpenChange={() => setPrintModal(false)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Printer className="w-5 h-5" /> Print Tag Sheet — Current Batch
              </DialogTitle>
            </DialogHeader>
            <div className="border rounded-xl p-6 bg-white space-y-4 text-sm" data-testid="print-preview">
              <div className="text-center border-b pb-4">
                <p className="text-xs text-muted-foreground">IMPORTER DETAILS</p>
                <p className="font-bold">EazyToSell Commerce Pvt. Ltd.</p>
                <p className="text-xs text-muted-foreground">Plot 12, Sector 44, Gurugram, HR 122003 | GSTIN: 06AABCE1234Z5</p>
              </div>
              {currentBatchItems.map(item => (
                <div key={item.id} className="border rounded-lg p-3 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <p className="font-bold">{item.productName}</p>
                    <p className="text-muted-foreground">SKU: {item.sku}</p>
                    <p className="text-muted-foreground">Barcode: {item.barcode}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold">MRP ₹{item.mrp}</p>
                    <p className="text-muted-foreground">Qty: {item.quantityToTag} units</p>
                    <p className="text-muted-foreground">Made in: {item.countryOfOrigin}</p>
                  </div>
                </div>
              ))}
              <p className="text-[10px] text-center text-muted-foreground">All prices inclusive of all taxes. Printed: 26 Mar 2026.</p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setPrintModal(false)}>Close</Button>
              <Button className="bg-amber-500 hover:bg-amber-600 text-white gap-1" onClick={() => window.print()} data-testid="btn-print-confirm">
                <Printer className="w-4 h-4" /> Print
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

export function EtsFulfillmentDispatch() {
  const [orders, setOrders] = useState<FulfillmentOrder[]>(INITIAL_ORDERS);
  const [shipModal, setShipModal] = useState<{ orderId: string; provider: string; tracking: string; delivery: string; boxes: string } | null>(null);
  const [deliveredModal, setDeliveredModal] = useState<string | null>(null);

  const readyToShip = orders.filter(o => o.status === "Ready to Ship");
  const shipped = orders.filter(o => o.status === "Shipped" || o.status === "Delivered");

  function handleShip(orderId: string, provider: string, tracking: string, delivery: string, boxes: number) {
    setOrders(prev => prev.map(o =>
      o.id !== orderId ? o : {
        ...o,
        status: "Shipped" as FulfillmentStatus,
        shippingProvider: provider,
        trackingNumber: tracking,
        expectedDelivery: delivery,
        boxCount: boxes,
        shippedDate: "2026-03-26",
      }
    ));
    setShipModal(null);
  }

  function handleDelivered(orderId: string) {
    setOrders(prev => prev.map(o =>
      o.id !== orderId ? o : { ...o, status: "Delivered" as FulfillmentStatus, deliveredDate: "2026-03-26" }
    ));
    setDeliveredModal(null);
  }

  return (
    <div className="px-6 lg:px-10 py-6 space-y-6" data-testid="dispatch-page">
      <h1 className="text-xl font-bold">Dispatch</h1>

      <div>
        <h2 className="text-base font-semibold mb-3 flex items-center gap-2">
          <Truck className="w-4 h-4 text-amber-500" /> Ready to Ship ({readyToShip.length})
        </h2>
        {readyToShip.length === 0 && <p className="text-sm text-muted-foreground">No orders ready to ship right now.</p>}
        <div className="space-y-3">
          {readyToShip.map(order => (
            <div key={order.id} className="flex items-center gap-4 p-4 rounded-xl border bg-white" data-testid={`dispatch-row-${order.id}`}>
              <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                <Truck className="w-4 h-4 text-amber-600" />
              </div>
              <div className="flex-1">
                <p className="font-semibold">{order.partnerName} — {order.orderNumber}</p>
                <p className="text-sm text-muted-foreground">{order.partnerCity} · {order.deliveryAddress}</p>
                <p className="text-xs text-muted-foreground">{order.items.reduce((s, i) => s + i.quantity, 0)} items · ₹{order.totalValue.toLocaleString("en-IN")}</p>
              </div>
              <Button
                size="sm"
                className="bg-amber-500 hover:bg-amber-600 text-white gap-1 shrink-0"
                onClick={() => setShipModal({ orderId: order.id, provider: "", tracking: "", delivery: "", boxes: "" })}
                data-testid={`btn-ship-${order.id}`}
              >
                <Truck className="w-3.5 h-3.5" /> Ship
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-base font-semibold mb-3 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-500" /> Shipped / Delivered ({shipped.length})
        </h2>
        <div className="space-y-3">
          {shipped.map(order => (
            <div key={order.id} className="flex items-center gap-4 p-4 rounded-xl border bg-white" data-testid={`shipped-row-${order.id}`}>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="font-semibold">{order.partnerName} — {order.orderNumber}</p>
                  <Badge variant="outline" className={`text-[10px] ${STATUS_COLORS[order.status]}`}>{order.status}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{order.partnerCity}</p>
                {order.shippingProvider && (
                  <p className="text-xs text-muted-foreground">{order.shippingProvider} · {order.trackingNumber} · {order.boxCount} boxes · ETA {order.expectedDelivery}</p>
                )}
              </div>
              {order.status === "Shipped" && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs gap-1 border-green-200 text-green-700 hover:bg-green-50 shrink-0"
                  onClick={() => setDeliveredModal(order.id)}
                  data-testid={`btn-delivered-${order.id}`}
                >
                  <CheckCircle2 className="w-3 h-3" /> Delivered
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>

      {shipModal && (
        <Dialog open onOpenChange={() => setShipModal(null)}>
          <DialogContent>
            <DialogHeader><DialogTitle>Ship Order</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div>
                <Label className="text-xs">Shipping Provider</Label>
                <Input
                  value={shipModal.provider}
                  onChange={e => setShipModal({ ...shipModal, provider: e.target.value })}
                  placeholder="e.g. Delhivery, DTDC, BlueDart"
                  data-testid="input-provider"
                />
              </div>
              <div>
                <Label className="text-xs">Tracking Number</Label>
                <Input
                  value={shipModal.tracking}
                  onChange={e => setShipModal({ ...shipModal, tracking: e.target.value })}
                  placeholder="e.g. DL2026031601"
                  data-testid="input-tracking"
                />
              </div>
              <div>
                <Label className="text-xs">Expected Delivery Date</Label>
                <Input
                  type="date"
                  value={shipModal.delivery}
                  onChange={e => setShipModal({ ...shipModal, delivery: e.target.value })}
                  data-testid="input-delivery-date"
                />
              </div>
              <div>
                <Label className="text-xs">Box Count</Label>
                <Input
                  type="number"
                  value={shipModal.boxes}
                  onChange={e => setShipModal({ ...shipModal, boxes: e.target.value })}
                  placeholder="Number of boxes"
                  data-testid="input-boxes"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShipModal(null)}>Cancel</Button>
              <Button
                className="bg-amber-500 hover:bg-amber-600 text-white"
                onClick={() => handleShip(shipModal.orderId, shipModal.provider, shipModal.tracking, shipModal.delivery, Number(shipModal.boxes))}
                data-testid="btn-confirm-ship"
              >
                Confirm Shipment
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {deliveredModal && (
        <Dialog open onOpenChange={() => setDeliveredModal(null)}>
          <DialogContent>
            <DialogHeader><DialogTitle>Confirm Delivery</DialogTitle></DialogHeader>
            <p className="text-sm text-muted-foreground">Mark this order as delivered? This updates the partner's portal order status to Delivered.</p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeliveredModal(null)}>Cancel</Button>
              <Button
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={() => handleDelivered(deliveredModal)}
                data-testid="btn-confirm-delivered"
              >
                Mark Delivered
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
