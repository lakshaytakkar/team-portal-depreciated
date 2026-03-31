import { useState, useRef, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { useEtsRole } from "@/lib/use-ets-role";
import {
  Barcode, Search, Plus, Minus, Trash2, ShoppingCart,
  CreditCard, Smartphone, Banknote, Printer, PauseCircle,
  PlayCircle, X, Camera, ChevronRight, Zap, ArrowLeft,
  Receipt, CheckCircle2, IndianRupee, Package, Clock,
  Store, Lock, Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { ProductImage } from "@/components/product-image";
import { QRCodeSVG } from "qrcode.react";
import {
  POS_PRODUCTS, QUICK_ADD_PRODUCTS, POS_STORE,
  getNextReceiptNumber,
  type PosProduct, type PosBillItem, type PosHeldBill, type PosSale,
} from "@/lib/mock-data-pos-ets";
import { getStoreStatus, getStaffMembers } from "@/lib/mock-data-ets-store";

function formatINR(val: number): string {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(val);
}

function StoreLocked() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-orange-50 via-white to-amber-50">
      <div className="max-w-md text-center px-6 space-y-6">
        <div className="mx-auto w-24 h-24 rounded-3xl bg-orange-100 flex items-center justify-center shadow-lg">
          <Lock className="w-12 h-12 text-orange-500" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900" data-testid="text-store-locked">Store Not Active</h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Your store needs to be live before you can access billing and operations.
            Complete your store setup to unlock the POS system.
          </p>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-left">
          <p className="text-xs font-semibold text-orange-800 mb-1">What's next?</p>
          <p className="text-xs text-orange-700">
            Our operations team will activate your store once your setup is complete.
            You'll get a notification when it's ready.
          </p>
        </div>
        <Button variant="outline" className="gap-2" data-testid="button-go-dashboard" onClick={() => window.location.href = "/portal-ets"}>
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Button>
      </div>
    </div>
  );
}

type PaymentMethod = "cash" | "upi" | "card";
type ScreenState = "billing" | "payment" | "receipt";

export default function PosBilling() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const { subRole, roleId } = useEtsRole();
  const barcodeRef = useRef<HTMLInputElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const [screenState, setScreenState] = useState<ScreenState>("billing");
  const [billItems, setBillItems] = useState<PosBillItem[]>([]);
  const [barcodeInput, setBarcodeInput] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [searchResults, setSearchResults] = useState<PosProduct[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [barcodeError, setBarcodeError] = useState(false);

  const [heldBills, setHeldBills] = useState<PosHeldBill[]>([]);
  const [showHeldBills, setShowHeldBills] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [cashReceived, setCashReceived] = useState("");

  const [completedSale, setCompletedSale] = useState<PosSale | null>(null);

  const store = POS_STORE;
  const storeActive = getStoreStatus().status === "active";

  if (!storeActive) {
    return <StoreLocked />;
  }

  const totalAmount = billItems.reduce((sum, item) => sum + item.lineTotal, 0);
  const totalItems = billItems.reduce((sum, item) => sum + item.quantity, 0);
  const changeAmount = cashReceived ? parseFloat(cashReceived) - totalAmount : 0;

  const focusBarcode = useCallback(() => {
    setTimeout(() => barcodeRef.current?.focus(), 50);
  }, []);

  useEffect(() => {
    focusBarcode();
  }, [focusBarcode]);

  const addProductToBill = useCallback((product: PosProduct) => {
    setBillItems(prev => {
      const existing = prev.find(i => i.productId === product.id);
      if (existing) {
        return prev.map(i =>
          i.productId === product.id
            ? { ...i, quantity: i.quantity + 1, lineTotal: (i.quantity + 1) * i.mrp }
            : i
        );
      }
      return [...prev, {
        id: `bill-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        productId: product.id,
        name: product.name,
        mrp: product.mrp,
        quantity: 1,
        lineTotal: product.mrp,
        image: product.image,
      }];
    });

    if (navigator.vibrate) navigator.vibrate(30);

    setBarcodeInput("");
    setSearchInput("");
    setSearchResults([]);
    setShowSearch(false);
    setBarcodeError(false);
    focusBarcode();
  }, [focusBarcode]);

  const handleBarcodeScan = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;
    const code = barcodeInput.trim();
    if (!code) return;

    const product = POS_PRODUCTS.find(p => p.barcode === code);
    if (product) {
      addProductToBill(product);
    } else {
      setBarcodeError(true);
      if (navigator.vibrate) navigator.vibrate([50, 30, 50]);
      setTimeout(() => {
        setBarcodeError(false);
        setBarcodeInput("");
      }, 1200);
    }
  }, [barcodeInput, addProductToBill]);

  const handleSearch = useCallback((query: string) => {
    setSearchInput(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    const results = POS_PRODUCTS.filter(p =>
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.category.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 6);
    setSearchResults(results);
  }, []);

  const updateQuantity = (itemId: string, delta: number) => {
    setBillItems(prev => prev.map(item => {
      if (item.id !== itemId) return item;
      const newQty = Math.max(1, item.quantity + delta);
      return { ...item, quantity: newQty, lineTotal: newQty * item.mrp };
    }));
    if (navigator.vibrate) navigator.vibrate(15);
  };

  const removeItem = (itemId: string) => {
    setBillItems(prev => prev.filter(i => i.id !== itemId));
    if (navigator.vibrate) navigator.vibrate([20, 10, 20]);
  };

  const holdBill = () => {
    if (billItems.length === 0) return;
    const held: PosHeldBill = {
      id: `held-${Date.now()}`,
      items: [...billItems],
      total: totalAmount,
      itemCount: totalItems,
      createdAt: new Date().toISOString(),
    };
    setHeldBills(prev => [...prev, held]);
    setBillItems([]);
    if (navigator.vibrate) navigator.vibrate(50);
    toast({ title: "Bill held", description: `${held.itemCount} items saved. You can recall it anytime.` });
    focusBarcode();
  };

  const recallBill = (heldId: string) => {
    const held = heldBills.find(h => h.id === heldId);
    if (!held) return;
    if (billItems.length > 0) {
      holdBill();
    }
    setBillItems(held.items);
    setHeldBills(prev => prev.filter(h => h.id !== heldId));
    setShowHeldBills(false);
    if (navigator.vibrate) navigator.vibrate(30);
    focusBarcode();
  };

  useEffect(() => {
    if (screenState === "billing") {
      focusBarcode();
    }
  }, [screenState, focusBarcode]);

  const openPayment = () => {
    if (billItems.length === 0) return;
    setScreenState("payment");
    setPaymentMethod(null);
    setCashReceived("");
  };

  const completeSale = () => {
    if (!paymentMethod) return;
    let cashierId: string | undefined;
    let cashierName: string | undefined;
    if (subRole === "cashier") {
      const staff = getStaffMembers().find(s => s.active && s.role === "cashier");
      cashierId = staff?.id ?? "cashier";
      cashierName = staff?.name ?? "Cashier";
    }
    const sale: PosSale = {
      id: `sale-${Date.now()}`,
      receiptNumber: getNextReceiptNumber(),
      storeId: store.id,
      items: [...billItems],
      totalAmount,
      paymentMethod,
      cashReceived: paymentMethod === "cash" ? parseFloat(cashReceived) || totalAmount : undefined,
      changeReturned: paymentMethod === "cash" ? Math.max(0, changeAmount) : undefined,
      timestamp: new Date().toISOString(),
      cashierId,
      cashierName,
    };
    setCompletedSale(sale);
    setScreenState("receipt");
    if (navigator.vibrate) navigator.vibrate([30, 50, 30]);
  };

  const resetBilling = () => {
    setBillItems([]);
    setCompletedSale(null);
    setScreenState("billing");
    setPaymentMethod(null);
    setCashReceived("");
    focusBarcode();
  };

  const printReceipt = () => {
    window.print();
  };

  if (screenState === "receipt" && completedSale) {
    return <ReceiptScreen sale={completedSale} store={store} onNewSale={resetBilling} onPrint={printReceipt} />;
  }

  if (screenState === "payment") {
    return (
      <PaymentScreen
        total={totalAmount}
        itemCount={totalItems}
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
        cashReceived={cashReceived}
        setCashReceived={setCashReceived}
        changeAmount={changeAmount}
        onComplete={completeSale}
        onBack={() => setScreenState("billing")}
      />
    );
  }

  return (
    <div className="px-16 lg:px-24 py-6">
      <div className="flex h-[calc(100vh-3.5rem-3rem)] w-full bg-gray-50 overflow-hidden print:hidden rounded-lg border">
      <div className="flex-1 flex flex-col min-w-0">
        <div className="bg-white border-b px-4 py-2 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-orange-500" />
            <h1 className="text-sm font-bold font-heading" data-testid="text-store-name">POS Billing</h1>
            <Badge variant="outline" className="text-xs border-green-300 text-green-700 bg-green-50 ml-1">Live</Badge>
          </div>
          <div className="flex items-center gap-2">
            {heldBills.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs h-7 border-amber-300 text-amber-700 bg-amber-50 hover:bg-amber-100"
                onClick={() => setShowHeldBills(!showHeldBills)}
                data-testid="button-held-bills"
              >
                <PauseCircle className="w-3.5 h-3.5" />
                {heldBills.length} on hold
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs h-7"
              onClick={holdBill}
              disabled={billItems.length === 0}
              data-testid="button-hold-bill"
            >
              <PauseCircle className="w-3.5 h-3.5" />
              Hold
            </Button>
          </div>
        </div>

        <div className="p-3 bg-white border-b space-y-2 shrink-0">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Barcode className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                ref={barcodeRef}
                type="text"
                placeholder="Scan barcode or enter code..."
                value={barcodeInput}
                onChange={e => { setBarcodeInput(e.target.value); setBarcodeError(false); }}
                onKeyDown={handleBarcodeScan}
                className={cn(
                  "pl-10 h-11 text-base font-mono transition-all",
                  barcodeError && "border-red-500 bg-red-50 ring-2 ring-red-200 animate-pulse"
                )}
                data-testid="input-barcode"
                autoComplete="off"
              />
              {barcodeError && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-red-600" data-testid="text-barcode-error">
                  Not found
                </span>
              )}
            </div>
            <Button variant="outline" size="icon" className="h-11 w-11 shrink-0" data-testid="button-camera-scan">
              <Camera className="w-4 h-4" />
            </Button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              ref={searchRef}
              type="text"
              placeholder="Search product by name..."
              value={searchInput}
              onChange={e => handleSearch(e.target.value)}
              onFocus={() => setShowSearch(true)}
              className="pl-10 h-9 text-sm"
              data-testid="input-product-search"
              autoComplete="off"
            />
            {showSearch && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-20 max-h-60 overflow-auto">
                {searchResults.map(p => (
                  <button
                    key={p.id}
                    className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-orange-50 transition-colors text-left"
                    onClick={() => addProductToBill(p)}
                    data-testid={`search-result-${p.id}`}
                  >
                    <ProductImage src={p.image} alt={p.name} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.category}</p>
                    </div>
                    <span className="text-sm font-bold text-orange-600">{formatINR(p.mrp)}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <ScrollArea className="flex-1">
          {billItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-16 text-center px-6">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center mb-4">
                <ShoppingCart className="w-10 h-10 text-orange-400" />
              </div>
              <p className="text-lg font-semibold text-gray-700" data-testid="text-empty-bill">Start scanning</p>
              <p className="text-sm text-muted-foreground mt-1">Scan a barcode or search for a product to begin billing</p>
            </div>
          ) : (
            <div className="divide-y">
              {billItems.map((item, idx) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50/50 transition-colors group"
                  data-testid={`bill-item-${idx}`}
                >
                  <span className="text-xs font-mono text-muted-foreground w-5 text-right">{idx + 1}</span>
                  <ProductImage src={item.image} alt={item.name} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{formatINR(item.mrp)} each</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => updateQuantity(item.id, -1)}
                      data-testid={`button-qty-minus-${idx}`}
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                    <span className="w-8 text-center text-sm font-bold" data-testid={`text-qty-${idx}`}>{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => updateQuantity(item.id, 1)}
                      data-testid={`button-qty-plus-${idx}`}
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                  <span className="text-sm font-bold w-20 text-right" data-testid={`text-line-total-${idx}`}>
                    {formatINR(item.lineTotal)}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-red-400 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeItem(item.id)}
                    data-testid={`button-remove-${idx}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="border-t bg-white px-4 py-3 shrink-0">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground" data-testid="text-item-count">
                {totalItems} item{totalItems !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black text-gray-900 tracking-tight" data-testid="text-grand-total">
                {formatINR(totalAmount)}
              </p>
            </div>
          </div>
          <Button
            className="w-full h-14 text-lg font-bold rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg gap-2"
            onClick={openPayment}
            disabled={billItems.length === 0}
            data-testid="button-charge"
          >
            <Zap className="w-5 h-5" />
            Charge {formatINR(totalAmount)}
          </Button>
        </div>
      </div>

      <div className="w-72 border-l bg-white flex flex-col shrink-0 hidden lg:flex">
        <div className="p-3 border-b">
          <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-orange-500" />
            Quick Add
          </h2>
        </div>
        <ScrollArea className="flex-1 p-2">
          <div className="grid grid-cols-2 gap-2">
            {QUICK_ADD_PRODUCTS.map(p => (
              <button
                key={p.id}
                className="flex flex-col items-center gap-1 p-3 rounded-xl border border-gray-100 bg-gradient-to-b from-white to-gray-50/50 hover:border-orange-300 hover:bg-orange-50 transition-all text-center group active:scale-95"
                onClick={() => addProductToBill(p)}
                data-testid={`quickadd-${p.id}`}
              >
                <ProductImage src={p.image} alt={p.name} size="lg" className="group-hover:scale-110 transition-transform" />
                <p className="text-xs font-medium text-gray-700 leading-tight line-clamp-2">{p.name}</p>
                <p className="text-xs font-bold text-orange-600">{formatINR(p.mrp)}</p>
              </button>
            ))}
          </div>
        </ScrollArea>

        <div className="p-3 border-t space-y-2">
          {heldBills.length > 0 ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-700 flex items-center gap-1">
                  <PauseCircle className="w-3.5 h-3.5" />
                  Held Bills
                </span>
                <Badge variant="outline" className="text-xs border-amber-300 text-amber-600 bg-amber-50">
                  {heldBills.length}
                </Badge>
              </div>
              {heldBills.map(held => (
                <button
                  key={held.id}
                  className="w-full flex items-center gap-2 p-2 rounded-lg border border-amber-200 bg-amber-50 hover:bg-amber-100 transition-colors text-left"
                  onClick={() => recallBill(held.id)}
                  data-testid={`recall-bill-${held.id}`}
                >
                  <PlayCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium">{held.itemCount} items</p>
                    <p className="text-xs text-muted-foreground">{formatINR(held.total)}</p>
                  </div>
                  <ChevronRight className="w-3 h-3 text-muted-foreground" />
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-3">
              <PauseCircle className="w-6 h-6 mx-auto text-gray-300 mb-1" />
              <p className="text-xs text-muted-foreground">No held bills</p>
            </div>
          )}
        </div>
      </div>

      {showHeldBills && heldBills.length > 0 && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 lg:hidden" onClick={() => setShowHeldBills(false)}>
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-bold text-sm">Held Bills ({heldBills.length})</h3>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setShowHeldBills(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="p-3 space-y-2 max-h-72 overflow-auto">
              {heldBills.map(held => (
                <button
                  key={held.id}
                  className="w-full flex items-center gap-3 p-3 rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100 transition-colors text-left"
                  onClick={() => recallBill(held.id)}
                >
                  <PlayCircle className="w-5 h-5 text-amber-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{held.itemCount} items</p>
                    <p className="text-xs text-muted-foreground">{formatINR(held.total)}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(held.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
  );
}

function PaymentScreen({
  total, itemCount, paymentMethod, setPaymentMethod,
  cashReceived, setCashReceived, changeAmount, onComplete, onBack,
}: {
  total: number;
  itemCount: number;
  paymentMethod: PaymentMethod | null;
  setPaymentMethod: (m: PaymentMethod) => void;
  cashReceived: string;
  setCashReceived: (v: string) => void;
  changeAmount: number;
  onComplete: () => void;
  onBack: () => void;
}) {
  const cashInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (paymentMethod === "cash") {
      setTimeout(() => cashInputRef.current?.focus(), 100);
    }
  }, [paymentMethod]);

  const canComplete = paymentMethod === "cash"
    ? parseFloat(cashReceived) >= total
    : paymentMethod !== null;

  return (
    <div className="flex h-[calc(100vh-3.5rem)] w-full items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 print:hidden">
      <div className="w-full max-w-lg mx-4">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 text-white text-center">
            <p className="text-sm font-medium opacity-90">{itemCount} item{itemCount !== 1 ? "s" : ""}</p>
            <p className="text-4xl font-black mt-1 tracking-tight" data-testid="text-payment-total">{formatINR(total)}</p>
          </div>

          <div className="p-6 space-y-4">
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Payment Method</p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: "cash" as PaymentMethod, icon: Banknote, label: "Cash", color: "green" },
                { id: "upi" as PaymentMethod, icon: Smartphone, label: "UPI", color: "blue" },
                { id: "card" as PaymentMethod, icon: CreditCard, label: "Card", color: "purple" },
              ].map(method => (
                <button
                  key={method.id}
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all active:scale-95",
                    paymentMethod === method.id
                      ? method.color === "green"
                        ? "border-green-500 bg-green-50 shadow-md"
                        : method.color === "blue"
                        ? "border-blue-500 bg-blue-50 shadow-md"
                        : "border-purple-500 bg-purple-50 shadow-md"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  )}
                  onClick={() => {
                    setPaymentMethod(method.id);
                    if (navigator.vibrate) navigator.vibrate(20);
                  }}
                  data-testid={`button-pay-${method.id}`}
                >
                  <method.icon className={cn(
                    "w-8 h-8",
                    paymentMethod === method.id
                      ? method.color === "green" ? "text-green-600"
                      : method.color === "blue" ? "text-blue-600"
                      : "text-purple-600"
                    : "text-gray-400"
                  )} />
                  <span className={cn(
                    "text-sm font-bold",
                    paymentMethod === method.id ? "text-gray-900" : "text-gray-500"
                  )}>
                    {method.label}
                  </span>
                </button>
              ))}
            </div>

            {paymentMethod === "cash" && (
              <div className="space-y-3 animate-in slide-in-from-bottom-2 duration-200">
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Amount Received</label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      ref={cashInputRef}
                      type="number"
                      placeholder="0"
                      value={cashReceived}
                      onChange={e => setCashReceived(e.target.value)}
                      className="pl-10 h-14 text-2xl font-bold"
                      data-testid="input-cash-received"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  {[500, 1000, 2000].map(amt => (
                    <Button
                      key={amt}
                      variant="outline"
                      size="sm"
                      className="flex-1 text-xs h-9"
                      onClick={() => setCashReceived(String(amt))}
                      data-testid={`button-quick-${amt}`}
                    >
                      ₹{amt}
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs h-9 bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                    onClick={() => setCashReceived(String(total))}
                    data-testid="button-exact-amount"
                  >
                    Exact
                  </Button>
                </div>
                {parseFloat(cashReceived) >= total && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center animate-in fade-in duration-200">
                    <p className="text-xs text-green-600 font-medium">Change to return</p>
                    <p className="text-2xl font-black text-green-700" data-testid="text-change-amount">
                      {formatINR(Math.max(0, changeAmount))}
                    </p>
                  </div>
                )}
              </div>
            )}

            {paymentMethod === "upi" && (
              <div className="text-center py-4 space-y-3 animate-in slide-in-from-bottom-2 duration-200">
                <div className="mx-auto bg-white border-2 border-blue-200 rounded-2xl p-4 w-fit shadow-sm">
                  <QRCodeSVG
                    value={`upi://pay?pa=${POS_STORE.upiId}&pn=${encodeURIComponent(POS_STORE.name)}&am=${total}&cu=INR`}
                    size={160}
                    level="M"
                    data-testid="qr-upi-payment"
                  />
                </div>
                <p className="text-sm font-semibold text-gray-700">Scan to pay {formatINR(total)}</p>
                <p className="text-xs text-muted-foreground">GPay / PhonePe / Paytm / any UPI app</p>
                <div className="flex items-center justify-center gap-1.5 text-xs text-blue-600 bg-blue-50 rounded-lg py-1.5 px-3 mx-auto w-fit" data-testid="text-upi-id">
                  <Smartphone className="w-3.5 h-3.5" />
                  <span className="font-medium">{POS_STORE.upiId}</span>
                </div>
              </div>
            )}

            {paymentMethod === "card" && (
              <div className="text-center py-4 space-y-3 animate-in slide-in-from-bottom-2 duration-200">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-purple-100 flex items-center justify-center">
                  <CreditCard className="w-8 h-8 text-purple-600" />
                </div>
                <p className="text-sm text-gray-600">Customer swipes card on your store's card machine</p>
                <p className="text-xs text-muted-foreground">Tap confirm once payment is processed</p>
              </div>
            )}
          </div>

          <div className="p-4 border-t space-y-2">
            <Button
              className={cn(
                "w-full h-14 text-lg font-bold rounded-xl shadow-lg gap-2",
                canComplete
                  ? "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                  : "bg-gray-200 text-gray-400"
              )}
              onClick={onComplete}
              disabled={!canComplete}
              data-testid="button-confirm-payment"
            >
              <CheckCircle2 className="w-5 h-5" />
              {paymentMethod === "upi" ? "UPI Payment Received" :
               paymentMethod === "card" ? "Card Payment Received" :
               paymentMethod === "cash" && canComplete ? `Confirm - Change ${formatINR(Math.max(0, changeAmount))}` :
               paymentMethod === "cash" ? "Enter sufficient cash amount" :
               "Select payment method"}
            </Button>
            <Button
              variant="ghost"
              className="w-full text-sm text-gray-500"
              onClick={onBack}
              data-testid="button-back-billing"
            >
              <ArrowLeft className="w-4 h-4 mr-1" /> Back to bill
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReceiptScreen({ sale, store, onNewSale, onPrint }: {
  sale: PosSale;
  store: typeof POS_STORE;
  onNewSale: () => void;
  onPrint: () => void;
}) {
  const date = new Date(sale.timestamp);
  const dateStr = date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  const timeStr = date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="flex h-[calc(100vh-3.5rem)] w-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="hidden print:block w-full">
        <ThermalReceipt sale={sale} store={store} dateStr={dateStr} timeStr={timeStr} />
      </div>

      <div className="flex-1 flex items-center justify-center p-4 print:hidden">
        <div className="w-full max-w-sm">
          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-green-500 flex items-center justify-center animate-in zoom-in duration-300">
              <CheckCircle2 className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white" data-testid="text-sale-complete">Sale Complete!</h2>
            <p className="text-gray-400 text-sm mt-1">{sale.receiptNumber} • {formatINR(sale.totalAmount)}</p>
            {sale.cashierName && (
              <p className="text-amber-300 text-xs mt-1 font-medium" data-testid="text-cashier-attribution">
                Processed by {sale.cashierName}
              </p>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-b from-gray-50 to-white">
              <ThermalReceipt sale={sale} store={store} dateStr={dateStr} timeStr={timeStr} />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <Button
              variant="outline"
              className="flex-1 h-12 bg-white/10 border-white/20 text-white hover:bg-white/20 gap-2 font-semibold"
              onClick={onPrint}
              data-testid="button-print-receipt"
            >
              <Printer className="w-4 h-4" /> Print
            </Button>
            <Button
              className="flex-1 h-12 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold gap-2 shadow-lg"
              onClick={onNewSale}
              data-testid="button-new-sale"
            >
              <Zap className="w-4 h-4" /> New Sale
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ThermalReceipt({ sale, store, dateStr, timeStr }: {
  sale: PosSale;
  store: typeof POS_STORE;
  dateStr: string;
  timeStr: string;
}) {
  return (
    <div className="receipt-thermal font-mono text-[11px] leading-snug p-4 text-center" data-testid="receipt-content">
      <p className="text-sm font-bold">{store.name}</p>
      <p className="text-[10px] text-gray-600">{store.address}</p>
      <p className="text-[10px] text-gray-600">GSTIN: {store.gstin}</p>
      <p className="text-[10px] text-gray-600">Ph: {store.phone}</p>
      <div className="border-t border-dashed border-gray-300 my-2" />
      <div className="flex justify-between text-[10px]">
        <span>{sale.receiptNumber}</span>
        <span>{dateStr} {timeStr}</span>
      </div>
      <div className="flex justify-between text-[10px]">
        <span>Payment: {sale.paymentMethod.toUpperCase()}</span>
        {sale.cashierName && <span>By: {sale.cashierName}</span>}
      </div>
      <div className="border-t border-dashed border-gray-300 my-2" />
      <div className="text-left space-y-1">
        {sale.items.map((item, i) => (
          <div key={i} className="flex justify-between">
            <span className="flex-1 truncate pr-2">
              {item.quantity > 1 && <span className="font-bold">{item.quantity}x </span>}
              {item.name}
            </span>
            <span className="font-bold shrink-0">{formatINR(item.lineTotal)}</span>
          </div>
        ))}
      </div>
      <div className="border-t border-dashed border-gray-300 my-2" />
      <div className="flex justify-between font-bold text-sm">
        <span>TOTAL</span>
        <span data-testid="receipt-total">{formatINR(sale.totalAmount)}</span>
      </div>
      {sale.paymentMethod === "cash" && sale.cashReceived && (
        <>
          <div className="flex justify-between text-[10px] mt-1">
            <span>Cash Received</span>
            <span>{formatINR(sale.cashReceived)}</span>
          </div>
          <div className="flex justify-between text-[10px]">
            <span>Change</span>
            <span>{formatINR(sale.changeReturned || 0)}</span>
          </div>
        </>
      )}
      <div className="border-t border-dashed border-gray-300 my-2" />
      <p className="text-[10px] text-gray-500 mt-1">Thank you! Visit again</p>
      <p className="text-[9px] text-gray-400 mt-0.5">Powered by EazyToSell</p>
    </div>
  );
}
