import { useState } from "react";
import { useLocation, Link } from "wouter";
import { CheckCircle2, ShoppingCart, MapPin, Loader2, Download, Package, Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { ETS_PORTAL_COLOR } from "@/lib/mock-data-portal-ets";
import { useEtsOrders, type Order } from "@/lib/ets-order-store";
import { useEtsSidebar } from "@/components/layout/ets-subnav-sidebar";

type Stage = "review" | "paying" | "success";

function ConfettiEffect() {
  const colors = ["#F97316", "#22C55E", "#3B82F6", "#EC4899", "#EAB308"];
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {Array.from({ length: 40 }).map((_, i) => (
        <div
          key={i}
          className="absolute animate-confetti"
          style={{
            left: `${Math.random() * 100}%`,
            top: `-${Math.random() * 20}px`,
            width: `${Math.random() * 8 + 6}px`,
            height: `${Math.random() * 8 + 6}px`,
            backgroundColor: colors[Math.floor(Math.random() * colors.length)],
            borderRadius: Math.random() > 0.5 ? "50%" : "0",
            animationDuration: `${Math.random() * 2 + 2}s`,
            animationDelay: `${Math.random() * 0.5}s`,
          }}
        />
      ))}
    </div>
  );
}

export default function EtsPortalCheckout() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const inSidebar = useEtsSidebar();
  const { cart, removeFromCart, updateCartQty, clearCart, placeOrder } = useEtsOrders();
  const [deliveryAddress, setDeliveryAddress] = useState("12, Lajpat Nagar, New Delhi - 110024");
  const [stage, setStage] = useState<Stage>("review");
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);
  const containerClass = inSidebar ? "p-5 space-y-5" : "px-16 lg:px-24 py-6 space-y-6";

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = subtotal > 50000 ? 2000 : 1000;
  const total = subtotal + deliveryFee;

  function handlePay() {
    if (!deliveryAddress.trim()) {
      toast({ title: "Address required", description: "Please enter a delivery address.", variant: "destructive" });
      return;
    }
    setStage("paying");
    setTimeout(() => {
      const order = placeOrder(deliveryAddress);
      clearCart();
      setPlacedOrder(order);
      setStage("success");
    }, 2000);
  }

  if (stage === "success" && placedOrder) {
    return (
      <div className={containerClass} data-testid="checkout-success">
        <ConfettiEffect />
        <div className="max-w-lg mx-auto mt-8">
          <Card className="rounded-2xl border bg-card text-center shadow-lg">
            <CardContent className="py-12 px-8">
              <div className="flex items-center justify-center mb-6">
                <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="h-10 w-10 text-green-600" />
                </div>
              </div>
              <h2 className="text-2xl font-bold font-heading mb-2" data-testid="text-success-heading">Order Placed Successfully!</h2>
              <p className="text-muted-foreground mb-4">
                Your order number is{" "}
                <span className="font-bold text-foreground" data-testid="text-order-number">{placedOrder.id}</span>.
                We'll start processing it right away.
              </p>
              <div className="bg-muted/50 rounded-xl p-4 mb-6 text-left">
                <p className="text-sm text-muted-foreground mb-1">Order Summary</p>
                <p className="text-sm"><span className="text-muted-foreground">Items:</span> {placedOrder.itemCount} units</p>
                <p className="text-sm"><span className="text-muted-foreground">Total:</span> <span className="font-semibold">₹{placedOrder.total.toLocaleString("en-IN")}</span></p>
                <p className="text-sm"><span className="text-muted-foreground">Payment:</span> <Badge className="bg-green-50 text-green-700 border-green-200 ml-1" variant="outline">Paid</Badge></p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href={`/portal-ets/invoices/${placedOrder.invoiceId}`} className="flex-1">
                  <Button variant="outline" className="w-full" data-testid="button-download-invoice">
                    <Download className="h-4 w-4 mr-2" /> Download Invoice
                  </Button>
                </Link>
                <Link href={`/portal-ets/my-orders/${placedOrder.id}`} className="flex-1">
                  <Button className="w-full text-white" style={{ backgroundColor: ETS_PORTAL_COLOR }} data-testid="button-view-order">
                    View Order Status
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (cart.length === 0 && stage === "review") {
    return (
      <div className={containerClass} data-testid="checkout-empty">
        <Card className="rounded-xl border bg-card">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <ShoppingCart className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Your cart is empty</h3>
            <p className="text-muted-foreground mb-4">Add products from the catalog before checking out.</p>
            <Link href="/portal-ets/catalog">
              <Button style={{ backgroundColor: ETS_PORTAL_COLOR }} className="text-white" data-testid="button-go-catalog">
                Browse Catalog
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={containerClass} data-testid="ets-portal-checkout">
      <div>
        <h1 className="text-2xl font-bold font-heading" data-testid="text-checkout-title">Checkout</h1>
        <p className="text-muted-foreground">Review your order and confirm payment.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="rounded-xl border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" style={{ color: ETS_PORTAL_COLOR }} />
                Order Items ({cart.length} products)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {cart.map(item => (
                  <div key={item.id} className="flex items-center gap-4 py-3 border-b last:border-0" data-testid={`checkout-item-${item.id}`}>
                    <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <Package className="h-5 w-5 text-muted-foreground/40" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm" data-testid={`text-item-name-${item.id}`}>{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.category}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        variant="outline" size="icon" className="h-7 w-7"
                        onClick={() => updateCartQty(item.id, item.quantity - 1)}
                        data-testid={`button-decrease-${item.id}`}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center text-sm font-medium" data-testid={`text-qty-${item.id}`}>{item.quantity}</span>
                      <Button
                        variant="outline" size="icon" className="h-7 w-7"
                        onClick={() => updateCartQty(item.id, item.quantity + 1)}
                        data-testid={`button-increase-${item.id}`}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="text-right shrink-0 w-24">
                      <p className="font-semibold text-sm" data-testid={`text-line-total-${item.id}`}>
                        ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                      </p>
                      <p className="text-xs text-muted-foreground">@ ₹{item.price}</p>
                    </div>
                    <Button
                      variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => removeFromCart(item.id)}
                      data-testid={`button-remove-${item.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" style={{ color: ETS_PORTAL_COLOR }} />
                Delivery Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={deliveryAddress}
                  onChange={e => setDeliveryAddress(e.target.value)}
                  placeholder="Enter delivery address"
                  data-testid="input-delivery-address"
                />
                <p className="text-xs text-muted-foreground">Pre-filled from your store profile. Edit if needed.</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="rounded-xl border bg-card sticky top-6">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span data-testid="text-subtotal">₹{subtotal.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Delivery Fee</span>
                <span data-testid="text-delivery-fee">₹{deliveryFee.toLocaleString("en-IN")}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-base">
                <span>Total</span>
                <span data-testid="text-order-total">₹{total.toLocaleString("en-IN")}</span>
              </div>

              <div className="mt-4 pt-2 border-t">
                <div className="bg-muted/40 rounded-lg p-3 mb-4 text-xs text-muted-foreground flex items-start gap-2">
                  <span className="mt-0.5">🔒</span>
                  <span>Secure payment via Razorpay. Your payment details are encrypted.</span>
                </div>
                <Button
                  className="w-full text-white font-semibold"
                  style={{ backgroundColor: ETS_PORTAL_COLOR }}
                  onClick={handlePay}
                  disabled={stage === "paying" || cart.length === 0}
                  data-testid="button-pay-now"
                >
                  {stage === "paying" ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    `Pay ₹${total.toLocaleString("en-IN")}`
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <style>{`
        @keyframes confetti-fall {
          0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        .animate-confetti { animation: confetti-fall linear forwards; }
      `}</style>
    </div>
  );
}
