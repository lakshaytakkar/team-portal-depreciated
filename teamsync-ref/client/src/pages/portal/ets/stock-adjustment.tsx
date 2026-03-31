import { useState, useRef, useMemo } from "react";
import { useEtsSidebar } from "@/components/layout/ets-subnav-sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  ClipboardList, Search, Barcode, Check, AlertTriangle, ArrowRight,
} from "lucide-react";
import { ProductImage } from "@/components/product-image";
import {
  POS_PRODUCTS, INVENTORY, ADJUSTMENT_REASONS, addAdjustmentToInventory,
  type AdjustmentReason,
} from "@/lib/mock-data-pos-ets";

interface AdjustmentLog {
  id: string;
  productId: string;
  productName: string;
  image: string | null;
  systemCount: number;
  physicalCount: number;
  difference: number;
  reason: string;
  timestamp: string;
}

export default function EtsStockAdjustment() {
  const inSidebar = useEtsSidebar();
  const { toast } = useToast();
  const [barcodeInput, setBarcodeInput] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [physicalCount, setPhysicalCount] = useState("");
  const [reason, setReason] = useState<AdjustmentReason | "">("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [adjustmentLogs, setAdjustmentLogs] = useState<AdjustmentLog[]>([]);
  const barcodeRef = useRef<HTMLInputElement>(null);

  const searchResults = useMemo(() => {
    if (!searchInput || searchInput.length < 2) return [];
    const q = searchInput.toLowerCase();
    return POS_PRODUCTS.filter(p => p.name.toLowerCase().includes(q) || p.barcode.includes(q)).slice(0, 5);
  }, [searchInput]);

  const selectedProduct = selectedProductId ? POS_PRODUCTS.find(p => p.id === selectedProductId) : null;
  const selectedInv = selectedProductId ? INVENTORY.find(i => i.productId === selectedProductId) : null;
  const systemCount = selectedInv?.currentStock ?? 0;
  const physicalNum = parseInt(physicalCount) || 0;
  const difference = physicalNum - systemCount;
  const canSubmit = selectedProductId && physicalCount !== "" && reason !== "" && difference !== 0;

  function selectProduct(productId: string) {
    setSelectedProductId(productId);
    setPhysicalCount("");
    setReason("");
    setSearchInput("");
    setBarcodeInput("");
  }

  function handleBarcodeScan(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key !== "Enter" || !barcodeInput.trim()) return;
    const prod = POS_PRODUCTS.find(p => p.barcode === barcodeInput.trim());
    if (!prod) {
      navigator.vibrate?.([100, 50, 100]);
      toast({ title: "Not found", description: `Barcode ${barcodeInput} not in catalog`, variant: "destructive" });
      setBarcodeInput("");
      return;
    }
    selectProduct(prod.id);
  }

  function confirmAdjustment() {
    if (!selectedProduct || !selectedInv || !reason) return;
    const log: AdjustmentLog = {
      id: `adj-${Date.now()}`,
      productId: selectedProduct.id, productName: selectedProduct.name, image: selectedProduct.image,
      systemCount, physicalCount: physicalNum, difference,
      reason: ADJUSTMENT_REASONS[reason as AdjustmentReason],
      timestamp: new Date().toISOString(),
    };
    addAdjustmentToInventory(selectedProduct.id, systemCount, physicalNum, ADJUSTMENT_REASONS[reason as AdjustmentReason]);
    setAdjustmentLogs(prev => [log, ...prev]);
    navigator.vibrate?.([100, 50, 200]);
    toast({
      title: "Stock Adjusted",
      description: `${selectedProduct.name}: ${systemCount} → ${physicalNum} (${difference > 0 ? "+" : ""}${difference})`,
    });
    setSelectedProductId(null);
    setPhysicalCount("");
    setReason("");
    setShowConfirm(false);
  }

  return (
    <div className={inSidebar ? "p-5 space-y-5" : "px-16 lg:px-24 py-6 space-y-6"}>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading" data-testid="text-adjustment-title">Stock Adjustment</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">Fix stock mismatches between system and shelf</p>
        </div>
        <Badge variant="outline" className="text-xs border-amber-300 text-amber-700 bg-amber-50">
          Owner Only
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-4">
          <Card className="rounded-xl border bg-card">
            <CardContent className="p-5 space-y-3">
              <h2 className="text-sm font-semibold">Find Product</h2>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  Scan Barcode
                </label>
                <div className="relative">
                  <Barcode className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    ref={barcodeRef}
                    className="pl-9 h-10"
                    placeholder="Scan or enter barcode..."
                    value={barcodeInput}
                    onChange={e => setBarcodeInput(e.target.value)}
                    onKeyDown={handleBarcodeScan}
                    data-testid="input-adj-barcode"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  Or Search
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    className="pl-9 h-9"
                    placeholder="Search by name..."
                    value={searchInput}
                    onChange={e => setSearchInput(e.target.value)}
                    data-testid="input-adj-search"
                  />
                </div>
                {searchResults.length > 0 && (
                  <div className="mt-1 border rounded-xl overflow-hidden bg-card shadow-lg z-10 relative">
                    {searchResults.map(p => (
                      <button
                        key={p.id}
                        className="w-full text-left px-3 py-2.5 hover:bg-muted/30 flex items-center justify-between text-sm border-b last:border-0"
                        onClick={() => selectProduct(p.id)}
                        data-testid={`button-select-${p.id}`}
                      >
                        <span className="flex items-center gap-2">
                          <ProductImage src={p.image} alt={p.name} size="xs" />
                          <span>{p.name}</span>
                        </span>
                        <span className="text-xs text-muted-foreground">{p.barcode}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {selectedProduct && selectedInv && (
            <Card className="rounded-xl border bg-card border-l-4 border-l-amber-400">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <ProductImage src={selectedProduct.image} alt={selectedProduct.name} size="xl" />
                  <div>
                    <p className="font-semibold">{selectedProduct.name}</p>
                    <p className="text-xs text-muted-foreground">{selectedProduct.barcode}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 items-end">
                  <div className="bg-muted/30 rounded-xl p-4 text-center">
                    <p className="text-xs font-medium text-muted-foreground">System</p>
                    <p className="text-2xl font-bold font-heading mt-1">{systemCount}</p>
                  </div>
                  <div className="flex justify-center">
                    <ArrowRight className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block text-center">
                      Actual Count
                    </label>
                    <Input
                      type="number" min="0" className="text-center text-lg font-bold h-12"
                      value={physicalCount}
                      onChange={e => setPhysicalCount(e.target.value)}
                      placeholder="0"
                      data-testid="input-physical-count"
                    />
                  </div>
                </div>

                {physicalCount !== "" && (
                  <div className={`rounded-xl p-4 text-center ${difference > 0 ? "bg-green-50" : difference < 0 ? "bg-red-50" : "bg-muted/30"}`}>
                    <p className="text-xs text-muted-foreground">Difference</p>
                    <p className={`text-2xl font-bold font-heading ${difference > 0 ? "text-green-600" : difference < 0 ? "text-red-600" : "text-muted-foreground"}`}>
                      {difference === 0 ? "No change" : `${difference > 0 ? "+" : ""}${difference}`}
                    </p>
                  </div>
                )}

                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                    Reason *
                  </label>
                  <Select value={reason} onValueChange={v => setReason(v as AdjustmentReason)}>
                    <SelectTrigger className="h-10" data-testid="select-reason">
                      <SelectValue placeholder="Select reason..." />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(ADJUSTMENT_REASONS).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  className="w-full h-11 font-semibold bg-amber-600 hover:bg-amber-700 gap-2"
                  disabled={!canSubmit}
                  onClick={() => setShowConfirm(true)}
                  data-testid="button-adjust-stock"
                >
                  <ClipboardList className="w-4 h-4" />
                  Adjust Stock
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-3">
          <h2 className="text-sm font-semibold">Recent Adjustments</h2>
          {adjustmentLogs.length === 0 ? (
            <Card className="rounded-xl border bg-card">
              <CardContent className="p-8 text-center">
                <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <ClipboardList className="w-7 h-7 text-amber-500" />
                </div>
                <p className="text-sm text-muted-foreground">No adjustments made yet this session</p>
              </CardContent>
            </Card>
          ) : (
            adjustmentLogs.map(log => (
              <Card key={log.id} className="rounded-xl border bg-card">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <ProductImage src={log.image} alt={log.productName} size="md" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{log.productName}</p>
                      <p className="text-xs text-muted-foreground">{log.reason}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1.5 text-sm">
                        <span className="text-muted-foreground">{log.systemCount}</span>
                        <ArrowRight className="w-3 h-3 text-muted-foreground" />
                        <span className="font-semibold">{log.physicalCount}</span>
                      </div>
                      <span className={`text-xs font-semibold ${log.difference > 0 ? "text-green-600" : "text-red-500"}`}>
                        {log.difference > 0 ? "+" : ""}{log.difference}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1.5">
                    {new Date(log.timestamp).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" /> Confirm Adjustment
            </DialogTitle>
            <DialogDescription>
              This will update the stock count for {selectedProduct?.name}.
            </DialogDescription>
          </DialogHeader>
          {selectedProduct && (
            <div className="bg-amber-50 rounded-xl p-4 text-center space-y-1">
              <ProductImage src={selectedProduct.image} alt={selectedProduct.name} size="xl" className="mx-auto" />
              <p className="font-semibold">{selectedProduct.name}</p>
              <div className="flex items-center justify-center gap-3 mt-2">
                <span className="text-lg text-muted-foreground">{systemCount}</span>
                <ArrowRight className="w-5 h-5" />
                <span className="text-lg font-bold">{physicalNum}</span>
              </div>
              <p className={`text-sm font-semibold ${difference > 0 ? "text-green-600" : "text-red-600"}`}>
                {difference > 0 ? "+" : ""}{difference} units
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {reason ? ADJUSTMENT_REASONS[reason as AdjustmentReason] : ""}
              </p>
            </div>
          )}
          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setShowConfirm(false)} data-testid="button-adj-cancel">
              Cancel
            </Button>
            <Button
              className="flex-1 bg-amber-600 hover:bg-amber-700"
              onClick={confirmAdjustment}
              data-testid="button-adj-confirm"
            >
              <Check className="w-4 h-4 mr-1.5" />
              Confirm
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
