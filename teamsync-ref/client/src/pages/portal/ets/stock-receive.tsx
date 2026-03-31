import { useState, useRef, useEffect, useMemo } from "react";
import { useEtsSidebar } from "@/components/layout/ets-subnav-sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Truck, Search, Plus, Minus, Check, Package, History, Barcode, Trash2,
} from "lucide-react";
import { ProductImage } from "@/components/product-image";
import {
  POS_PRODUCTS, STOCK_RECEIVES, getNextSRNumber, addReceiveToInventory,
  type StockReceiveSession, type StockReceiveItem,
} from "@/lib/mock-data-pos-ets";

type Tab = "new" | "history";

export default function EtsStockReceive() {
  const inSidebar = useEtsSidebar();
  const { toast } = useToast();
  const [tab, setTab] = useState<Tab>("new");
  const [sessionRef, setSessionRef] = useState(() => getNextSRNumber());
  const [receiveItems, setReceiveItems] = useState<StockReceiveItem[]>([]);
  const [barcodeInput, setBarcodeInput] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [qtyInput, setQtyInput] = useState("1");
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedHistory, setSelectedHistory] = useState<StockReceiveSession | null>(null);
  const barcodeRef = useRef<HTMLInputElement>(null);
  const [receives, setReceives] = useState<StockReceiveSession[]>([...STOCK_RECEIVES]);

  useEffect(() => {
    if (tab === "new") barcodeRef.current?.focus();
  }, [tab]);

  const searchResults = useMemo(() => {
    if (!searchInput || searchInput.length < 2) return [];
    const q = searchInput.toLowerCase();
    return POS_PRODUCTS.filter(p => p.name.toLowerCase().includes(q) || p.barcode.includes(q)).slice(0, 5);
  }, [searchInput]);

  function addProduct(productId: string, qty?: number) {
    const prod = POS_PRODUCTS.find(p => p.id === productId);
    if (!prod) return;
    const quantity = qty || parseInt(qtyInput) || 1;
    const existing = receiveItems.find(i => i.productId === productId);
    if (existing) {
      setReceiveItems(prev => prev.map(i =>
        i.productId === productId ? { ...i, quantity: i.quantity + quantity } : i
      ));
    } else {
      setReceiveItems(prev => [...prev, {
        productId: prod.id, productName: prod.name, barcode: prod.barcode,
        quantity, image: prod.image,
      }]);
    }
    navigator.vibrate?.(50);
    toast({ title: `Added: ${prod.name}`, description: `+${quantity} units added to receive list` });
  }

  function handleBarcodeScan(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key !== "Enter" || !barcodeInput.trim()) return;
    const prod = POS_PRODUCTS.find(p => p.barcode === barcodeInput.trim());
    if (!prod) {
      navigator.vibrate?.([100, 50, 100]);
      toast({ title: "Not found", description: `Barcode ${barcodeInput} not in catalog`, variant: "destructive" });
    } else {
      addProduct(prod.id);
    }
    setBarcodeInput("");
  }

  function removeItem(productId: string) {
    setReceiveItems(prev => prev.filter(i => i.productId !== productId));
  }

  function updateQuantity(productId: string, delta: number) {
    setReceiveItems(prev => prev.map(i => {
      if (i.productId !== productId) return i;
      const newQty = Math.max(1, i.quantity + delta);
      return { ...i, quantity: newQty };
    }));
  }

  function confirmReceive() {
    const total = receiveItems.reduce((s, i) => s + i.quantity, 0);
    const session: StockReceiveSession = {
      id: `sr-${Date.now()}`, storeId: "store-001", referenceNumber: sessionRef,
      items: [...receiveItems], totalItems: total,
      receivedBy: "Rajesh Kumar", timestamp: new Date().toISOString(),
    };
    addReceiveToInventory(receiveItems, sessionRef);
    setReceives(prev => [session, ...prev]);
    navigator.vibrate?.([100, 50, 100, 50, 200]);
    toast({ title: "Stock Received!", description: `${sessionRef}: ${total} items confirmed` });
    setReceiveItems([]);
    setSessionRef(getNextSRNumber());
    setShowConfirm(false);
  }

  const totalUnits = receiveItems.reduce((s, i) => s + i.quantity, 0);

  return (
    <div className={inSidebar ? "p-5 space-y-5" : "px-16 lg:px-24 py-6 space-y-6"}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading" data-testid="text-receive-title">Stock Receive</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">Record incoming inventory</p>
        </div>
        <div className="flex gap-1 bg-muted rounded-lg p-0.5">
          <Button
            variant={tab === "new" ? "default" : "ghost"}
            size="sm" className="h-7 text-xs gap-1.5"
            onClick={() => setTab("new")}
            data-testid="button-tab-new"
          >
            <Plus className="w-3.5 h-3.5" /> New Receive
          </Button>
          <Button
            variant={tab === "history" ? "default" : "ghost"}
            size="sm" className="h-7 text-xs gap-1.5"
            onClick={() => setTab("history")}
            data-testid="button-tab-history"
          >
            <History className="w-3.5 h-3.5" /> History
          </Button>
        </div>
      </div>

      {tab === "new" && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-2 space-y-4">
            <Card className="rounded-xl border bg-card">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <Badge className="bg-green-100 text-green-700 border-0 text-xs">
                    {sessionRef}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                  </span>
                </div>

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
                      data-testid="input-receive-barcode"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                    Or Search Product
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      className="pl-9 h-9"
                      placeholder="Search by name..."
                      value={searchInput}
                      onChange={e => setSearchInput(e.target.value)}
                      data-testid="input-receive-search"
                    />
                  </div>
                  {searchResults.length > 0 && (
                    <div className="mt-1 border rounded-xl overflow-hidden bg-card shadow-lg z-10 relative">
                      {searchResults.map(p => (
                        <button
                          key={p.id}
                          className="w-full text-left px-3 py-2.5 hover:bg-muted/30 flex items-center justify-between text-sm border-b last:border-0"
                          onClick={() => { addProduct(p.id); setSearchInput(""); }}
                          data-testid={`button-add-product-${p.id}`}
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

                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                    Quantity per scan
                  </label>
                  <Input
                    type="number" min="1" className="h-9 w-24"
                    value={qtyInput} onChange={e => setQtyInput(e.target.value)}
                    data-testid="input-receive-qty"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-3 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">
                Receive List · {receiveItems.length} product{receiveItems.length !== 1 ? "s" : ""} · {totalUnits} units
              </h2>
              {receiveItems.length > 0 && (
                <Button variant="ghost" size="sm" className="text-xs text-red-500 h-7" onClick={() => setReceiveItems([])}>
                  Clear All
                </Button>
              )}
            </div>

            {receiveItems.length === 0 ? (
              <Card className="rounded-xl border bg-card">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <Package className="w-8 h-8 text-green-500" />
                  </div>
                  <p className="font-medium">No items yet</p>
                  <p className="text-sm text-muted-foreground mt-1">Scan barcodes or search products to start receiving</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {receiveItems.map(item => (
                  <Card key={item.productId} className="rounded-xl border bg-card">
                    <CardContent className="p-4 flex items-center gap-3">
                      <ProductImage src={item.image} alt={item.productName} size="lg" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.productName}</p>
                        <p className="text-xs text-muted-foreground">{item.barcode}</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Button
                          variant="outline" size="icon" className="h-7 w-7"
                          onClick={() => updateQuantity(item.productId, -1)}
                          data-testid={`button-qty-minus-${item.productId}`}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="w-8 text-center font-semibold text-sm">{item.quantity}</span>
                        <Button
                          variant="outline" size="icon" className="h-7 w-7"
                          onClick={() => updateQuantity(item.productId, 1)}
                          data-testid={`button-qty-plus-${item.productId}`}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                      <Button
                        variant="ghost" size="icon" className="h-7 w-7 text-red-400 hover:text-red-600"
                        onClick={() => removeItem(item.productId)}
                        data-testid={`button-remove-${item.productId}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {receiveItems.length > 0 && (
              <Button
                className="w-full h-12 text-base font-semibold bg-green-600 hover:bg-green-700 gap-2"
                onClick={() => setShowConfirm(true)}
                data-testid="button-confirm-receive"
              >
                <Check className="w-5 h-5" />
                Confirm Receive ({totalUnits} units)
              </Button>
            )}
          </div>
        </div>
      )}

      {tab === "history" && (
        <div className="space-y-3">
          {receives.length === 0 ? (
            <Card className="rounded-xl border bg-card">
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">No receive sessions yet</p>
              </CardContent>
            </Card>
          ) : (
            receives.map(session => (
              <Card
                key={session.id}
                className="rounded-xl border bg-card hover:bg-muted/20 transition-colors cursor-pointer"
                onClick={() => setSelectedHistory(session)}
                data-testid={`card-receive-${session.id}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-green-100 flex items-center justify-center">
                        <Truck className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{session.referenceNumber}</p>
                        <p className="text-xs text-muted-foreground">{session.receivedBy}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="text-xs">{session.items.length} products</Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(session.timestamp).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3 flex-wrap">
                    {session.items.map(it => (
                      <Badge key={it.productId} variant="secondary" className="text-xs gap-1.5 py-0.5">
                        <ProductImage src={it.image} alt={it.productName} size="xs" />
                        {it.productName} x {it.quantity}
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
              <Check className="w-5 h-5 text-green-500" /> Confirm Stock Receive
            </DialogTitle>
            <DialogDescription>
              This will add {totalUnits} units across {receiveItems.length} product{receiveItems.length !== 1 ? "s" : ""} to your store inventory.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {receiveItems.map(i => (
              <div key={i.productId} className="flex items-center justify-between py-1.5 text-sm">
                <span className="flex items-center gap-1.5">
                  <ProductImage src={i.image} alt={i.productName} size="xs" />
                  <span className="truncate max-w-[180px]">{i.productName}</span>
                </span>
                <span className="font-semibold text-green-600">+{i.quantity}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setShowConfirm(false)} data-testid="button-cancel-confirm">
              Cancel
            </Button>
            <Button
              className="flex-1 bg-green-600 hover:bg-green-700"
              onClick={confirmReceive}
              data-testid="button-do-confirm"
            >
              Confirm
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedHistory} onOpenChange={open => !open && setSelectedHistory(null)}>
        <DialogContent className="max-w-md">
          {selectedHistory && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Truck className="w-5 h-5 text-green-500" /> {selectedHistory.referenceNumber}
                </DialogTitle>
                <DialogDescription>
                  Received by {selectedHistory.receivedBy} on{" "}
                  {new Date(selectedHistory.timestamp).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {selectedHistory.items.map(i => (
                  <div key={i.productId} className="flex items-center gap-3 py-2.5 border-b last:border-0">
                    <ProductImage src={i.image} alt={i.productName} size="md" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{i.productName}</p>
                      <p className="text-xs text-muted-foreground">{i.barcode}</p>
                    </div>
                    <Badge className="bg-green-100 text-green-700 border-0">+{i.quantity}</Badge>
                  </div>
                ))}
              </div>
              <div className="bg-muted/30 rounded-xl p-4 text-center">
                <p className="text-xs text-muted-foreground">Total items received</p>
                <p className="text-2xl font-bold font-heading text-green-700">{selectedHistory.totalItems}</p>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
