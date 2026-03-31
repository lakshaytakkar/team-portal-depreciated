import { useState, useMemo } from "react";
import { useEtsSidebar } from "@/components/layout/ets-subnav-sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  RotateCcw, Search, Check, Receipt, Minus, Plus, History,
} from "lucide-react";
import { ProductImage } from "@/components/product-image";
import {
  EXPANDED_SALES, RETURN_RECORDS, RETURN_REASONS,
  getNextReturnNumber, addStockMovement, updateInventoryStock, INVENTORY,
  type PosSale, type ReturnRecord, type ReturnItem,
} from "@/lib/mock-data-pos-ets";

type Tab = "new" | "history";

function formatINR(n: number) {
  return "₹" + n.toLocaleString("en-IN");
}

export default function EtsReturns() {
  const inSidebar = useEtsSidebar();
  const { toast } = useToast();
  const [tab, setTab] = useState<Tab>("new");
  const [receiptSearch, setReceiptSearch] = useState("");
  const [selectedSale, setSelectedSale] = useState<PosSale | null>(null);
  const [returnItems, setReturnItems] = useState<Record<string, { checked: boolean; qty: number }>>({});
  const [reason, setReason] = useState("");
  const [otherReason, setOtherReason] = useState("");
  const [refundMethod, setRefundMethod] = useState<"cash" | "store-credit">("cash");
  const [showConfirm, setShowConfirm] = useState(false);
  const [returns, setReturns] = useState<ReturnRecord[]>([...RETURN_RECORDS]);
  const [selectedReturn, setSelectedReturn] = useState<ReturnRecord | null>(null);

  const recentSales = useMemo(() =>
    [...EXPANDED_SALES].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 20)
  , []);

  const filteredSales = useMemo(() => {
    if (!receiptSearch) return recentSales;
    const q = receiptSearch.toLowerCase();
    return recentSales.filter(s => s.receiptNumber.toLowerCase().includes(q));
  }, [receiptSearch, recentSales]);

  function selectSale(sale: PosSale) {
    setSelectedSale(sale);
    const items: Record<string, { checked: boolean; qty: number }> = {};
    sale.items.forEach(i => { items[i.id] = { checked: false, qty: i.quantity }; });
    setReturnItems(items);
    setReason("");
    setOtherReason("");
  }

  const checkedItems = selectedSale?.items.filter(i => returnItems[i.id]?.checked) ?? [];
  const totalRefund = checkedItems.reduce((s, i) => s + i.mrp * (returnItems[i.id]?.qty ?? 0), 0);
  const canSubmit = checkedItems.length > 0 && (reason === "Other" ? otherReason.trim() : reason);

  function confirmReturn() {
    if (!selectedSale || !canSubmit) return;
    const refNum = getNextReturnNumber();
    const items: ReturnItem[] = checkedItems.map(i => ({
      productId: i.productId, productName: i.name, image: i.image,
      mrp: i.mrp, originalQty: i.quantity,
      returnQty: returnItems[i.id]?.qty ?? 0,
      lineTotal: i.mrp * (returnItems[i.id]?.qty ?? 0),
    }));
    const record: ReturnRecord = {
      id: `ret-${Date.now()}`, referenceNumber: refNum, storeId: "store-001",
      originalSaleId: selectedSale.id, originalReceiptNumber: selectedSale.receiptNumber,
      items, totalRefund, refundMethod,
      reason: reason === "Other" ? otherReason : reason,
      processedBy: "Rajesh Kumar", timestamp: new Date().toISOString(),
    };
    items.forEach(item => {
      const inv = INVENTORY.find(x => x.productId === item.productId);
      if (inv) updateInventoryStock(item.productId, inv.currentStock + item.returnQty);
      addStockMovement({
        storeId: "store-001", productId: item.productId, movementType: "return",
        quantityChange: item.returnQty, referenceType: "return", referenceId: refNum,
        performedBy: "Rajesh Kumar", timestamp: new Date().toISOString(),
      });
    });
    setReturns(prev => [record, ...prev]);
    navigator.vibrate?.([100, 50, 200]);
    toast({ title: "Return Processed", description: `${refNum}: ${formatINR(totalRefund)} refund via ${refundMethod}` });
    setSelectedSale(null);
    setReturnItems({});
    setShowConfirm(false);
  }

  return (
    <div className={inSidebar ? "p-5 space-y-5" : "px-16 lg:px-24 py-6 space-y-6"}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading" data-testid="text-returns-title">Returns</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">Process product returns and refunds</p>
        </div>
        <div className="flex gap-1 bg-muted rounded-lg p-0.5">
          <Button
            variant={tab === "new" ? "default" : "ghost"}
            size="sm" className="h-7 text-xs gap-1.5"
            onClick={() => { setTab("new"); setSelectedSale(null); }}
            data-testid="button-tab-new-return"
          >
            <RotateCcw className="w-3.5 h-3.5" /> New Return
          </Button>
          <Button
            variant={tab === "history" ? "default" : "ghost"}
            size="sm" className="h-7 text-xs gap-1.5"
            onClick={() => setTab("history")}
            data-testid="button-tab-return-history"
          >
            <History className="w-3.5 h-3.5" /> History
          </Button>
        </div>
      </div>

      {tab === "new" && !selectedSale && (
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              className="pl-9 h-10"
              placeholder="Search by receipt number (e.g. R-0001)..."
              value={receiptSearch} onChange={e => setReceiptSearch(e.target.value)}
              data-testid="input-receipt-search"
            />
          </div>
          <h3 className="text-sm font-semibold">Recent Sales</h3>
          <div className="space-y-2">
            {filteredSales.map(sale => (
              <Card
                key={sale.id}
                className="rounded-xl border bg-card hover:bg-muted/20 transition-colors cursor-pointer"
                onClick={() => selectSale(sale)}
                data-testid={`card-sale-${sale.id}`}
              >
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center">
                      <Receipt className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{sale.receiptNumber}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(sale.timestamp).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                        {" · "}{sale.items.reduce((s, i) => s + i.quantity, 0)} items
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{formatINR(sale.totalAmount)}</p>
                    <Badge variant="outline" className="text-xs capitalize">{sale.paymentMethod}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {tab === "new" && selectedSale && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold">Return from {selectedSale.receiptNumber}</h2>
              <p className="text-xs text-muted-foreground">
                {new Date(selectedSale.timestamp).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                {" · "}Paid via {selectedSale.paymentMethod}
              </p>
            </div>
            <Button variant="outline" size="sm" className="text-xs h-7" onClick={() => setSelectedSale(null)} data-testid="button-back-to-sales">
              Back
            </Button>
          </div>

          <Card className="rounded-xl border bg-card">
            <CardContent className="p-5">
              <h3 className="text-sm font-semibold mb-3">Select items to return</h3>
              <div className="space-y-3">
                {selectedSale.items.map(item => {
                  const state = returnItems[item.id];
                  return (
                    <div key={item.id} className={`flex items-center gap-3 py-2.5 px-3 rounded-lg border ${state?.checked ? "border-rose-200 bg-rose-50/50" : "border-border"}`}>
                      <Checkbox
                        checked={state?.checked ?? false}
                        onCheckedChange={checked => setReturnItems(prev => ({ ...prev, [item.id]: { ...prev[item.id], checked: !!checked } }))}
                        data-testid={`checkbox-return-${item.id}`}
                      />
                      <ProductImage src={item.image} alt={item.name} size="md" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{formatINR(item.mrp)} x {item.quantity} = {formatINR(item.lineTotal)}</p>
                      </div>
                      {state?.checked && (
                        <div className="flex items-center gap-1.5">
                          <Button
                            variant="outline" size="icon" className="h-7 w-7"
                            onClick={() => setReturnItems(prev => ({
                              ...prev, [item.id]: { ...prev[item.id], qty: Math.max(1, (prev[item.id]?.qty ?? 1) - 1) }
                            }))}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="w-6 text-center font-semibold text-sm">{state.qty}</span>
                          <Button
                            variant="outline" size="icon" className="h-7 w-7"
                            onClick={() => setReturnItems(prev => ({
                              ...prev, [item.id]: { ...prev[item.id], qty: Math.min(item.quantity, (prev[item.id]?.qty ?? 1) + 1) }
                            }))}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {checkedItems.length > 0 && (
            <Card className="rounded-xl border bg-card border-l-4 border-l-rose-400">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold">Return Details</h3>
                  <p className="text-lg font-bold font-heading text-rose-600">{formatINR(totalRefund)}</p>
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Return Reason *</label>
                  <Select value={reason} onValueChange={setReason}>
                    <SelectTrigger className="h-9" data-testid="select-return-reason">
                      <SelectValue placeholder="Select reason..." />
                    </SelectTrigger>
                    <SelectContent>
                      {RETURN_REASONS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  {reason === "Other" && (
                    <Textarea
                      className="mt-2 text-sm" rows={2}
                      placeholder="Describe the reason..."
                      value={otherReason} onChange={e => setOtherReason(e.target.value)}
                      data-testid="input-other-reason"
                    />
                  )}
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Refund Method</label>
                  <div className="flex gap-2">
                    <Button
                      variant={refundMethod === "cash" ? "default" : "outline"} size="sm" className="text-xs flex-1"
                      onClick={() => setRefundMethod("cash")}
                      data-testid="button-refund-cash"
                    >
                      Cash Refund
                    </Button>
                    <Button
                      variant={refundMethod === "store-credit" ? "default" : "outline"} size="sm" className="text-xs flex-1"
                      onClick={() => setRefundMethod("store-credit")}
                      data-testid="button-refund-credit"
                    >
                      Store Credit
                    </Button>
                  </div>
                </div>

                <Button
                  className="w-full h-11 font-semibold bg-rose-600 hover:bg-rose-700 gap-2"
                  disabled={!canSubmit}
                  onClick={() => setShowConfirm(true)}
                  data-testid="button-process-return"
                >
                  <RotateCcw className="w-4 h-4" />
                  Process Return ({formatINR(totalRefund)})
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {tab === "history" && (
        <div className="space-y-3">
          {returns.length === 0 ? (
            <Card className="rounded-xl border bg-card">
              <CardContent className="p-8 text-center text-muted-foreground">No returns processed yet</CardContent>
            </Card>
          ) : (
            returns.map(ret => (
              <Card
                key={ret.id}
                className="rounded-xl border bg-card hover:bg-muted/20 transition-colors cursor-pointer"
                onClick={() => setSelectedReturn(ret)}
                data-testid={`card-return-${ret.id}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-rose-100 flex items-center justify-center">
                        <RotateCcw className="h-4 w-4 text-rose-600" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{ret.referenceNumber}</p>
                        <p className="text-xs text-muted-foreground">from {ret.originalReceiptNumber} · {ret.reason}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-rose-600">-{formatINR(ret.totalRefund)}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(ret.timestamp).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-2.5 flex-wrap">
                    {ret.items.map(i => (
                      <Badge key={i.productId} variant="secondary" className="text-xs gap-1.5 py-0.5">
                        <ProductImage src={i.image} alt={i.productName} size="xs" />
                        {i.productName} x{i.returnQty}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-rose-500" /> Confirm Return
            </DialogTitle>
            <DialogDescription>
              Returning {checkedItems.length} item{checkedItems.length !== 1 ? "s" : ""} from {selectedSale?.receiptNumber}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {checkedItems.map(i => (
              <div key={i.id} className="flex items-center justify-between py-1.5 text-sm">
                <span className="flex items-center gap-1.5">
                  <ProductImage src={i.image} alt={i.name} size="xs" />
                  <span className="truncate max-w-[160px]">{i.name}</span>
                  <span className="text-muted-foreground">x{returnItems[i.id]?.qty}</span>
                </span>
                <span className="font-semibold text-rose-600">-{formatINR(i.mrp * (returnItems[i.id]?.qty ?? 0))}</span>
              </div>
            ))}
          </div>
          <div className="bg-rose-50 rounded-xl p-4 text-center">
            <p className="text-xs text-muted-foreground">Total Refund</p>
            <p className="text-2xl font-bold font-heading text-rose-600">{formatINR(totalRefund)}</p>
            <p className="text-xs text-muted-foreground mt-1">via {refundMethod === "cash" ? "Cash" : "Store Credit"}</p>
          </div>
          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setShowConfirm(false)} data-testid="button-cancel-return">Cancel</Button>
            <Button className="flex-1 bg-rose-600 hover:bg-rose-700 gap-1.5" onClick={confirmReturn} data-testid="button-confirm-return">
              <Check className="w-4 h-4" /> Confirm
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedReturn} onOpenChange={open => !open && setSelectedReturn(null)}>
        <DialogContent className="max-w-md">
          {selectedReturn && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <RotateCcw className="w-5 h-5 text-rose-500" /> {selectedReturn.referenceNumber}
                </DialogTitle>
                <DialogDescription>
                  Return from {selectedReturn.originalReceiptNumber} · {new Date(selectedReturn.timestamp).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-2">
                {selectedReturn.items.map(i => (
                  <div key={i.productId} className="flex items-center gap-3 py-2.5 border-b last:border-0">
                    <ProductImage src={i.image} alt={i.productName} size="md" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{i.productName}</p>
                      <p className="text-xs text-muted-foreground">{formatINR(i.mrp)} x {i.returnQty}</p>
                    </div>
                    <span className="text-sm font-semibold text-rose-600">-{formatINR(i.lineTotal)}</span>
                  </div>
                ))}
              </div>
              <div className="bg-muted/30 rounded-xl p-4 space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Reason</span>
                  <span className="font-medium">{selectedReturn.reason}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Refund Method</span>
                  <span className="font-medium capitalize">{selectedReturn.refundMethod.replace("-", " ")}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Processed By</span>
                  <span className="font-medium">{selectedReturn.processedBy}</span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t mt-2">
                  <span className="font-semibold">Total Refund</span>
                  <span className="font-bold text-rose-600">{formatINR(selectedReturn.totalRefund)}</span>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
