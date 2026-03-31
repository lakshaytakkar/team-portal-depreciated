import { useLocation } from "wouter";
import { ShoppingCart, Trash2, Plus, Minus, ArrowLeft, Zap, Clock, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useEtsCart } from "@/lib/ets-cart-context";
import { ETS_PORTAL_COLOR } from "@/lib/mock-data-portal-ets";
import { useToast } from "@/hooks/use-toast";

const FREE_SHIPPING_THRESHOLD = 10000;
const FLAT_SHIPPING_FEE = 499;

function DeliveryBadge({ speed }: { speed: "india" | "standard" }) {
  if (speed === "india") {
    return (
      <Badge className="text-[10px] px-1.5 py-0 bg-green-100 text-green-700 border-green-200 hover:bg-green-100">
        <Zap className="h-2.5 w-2.5 mr-1" /> Express
      </Badge>
    );
  }
  return (
    <Badge className="text-[10px] px-1.5 py-0 bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100">
      <Clock className="h-2.5 w-2.5 mr-1" /> Standard
    </Badge>
  );
}

export default function EtsPortalCart() {
  const [, navigate] = useLocation();
  const { items, subtotal, updateQty, removeItem, clearCart } = useEtsCart();
  const { toast } = useToast();

  const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
  const shippingFee = items.length === 0 ? 0 : isFreeShipping ? 0 : FLAT_SHIPPING_FEE;
  const grandTotal = subtotal + shippingFee;

  function handleProceedToCheckout() {
    toast({
      title: "Proceeding to Checkout",
      description: "Checkout integration coming soon. Your cart is saved.",
    });
  }

  if (items.length === 0) {
    return (
      <div className="px-16 lg:px-24 py-8" data-testid="ets-cart-empty">
        <div className="flex items-center gap-3 mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/portal-ets/catalog")}
            className="gap-1.5"
            data-testid="button-back-to-catalog"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Catalog
          </Button>
        </div>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-6">
            <ShoppingCart className="h-10 w-10 text-muted-foreground/30" />
          </div>
          <h2 className="text-2xl font-bold mb-2" data-testid="text-cart-empty-title">Your cart is empty</h2>
          <p className="text-muted-foreground mb-6">Browse the catalog to add products for your store.</p>
          <Button
            className="text-white"
            style={{ backgroundColor: ETS_PORTAL_COLOR }}
            onClick={() => navigate("/portal-ets/catalog")}
            data-testid="button-browse-catalog"
          >
            Browse Catalog
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-16 lg:px-24 py-6" data-testid="ets-portal-cart">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/portal-ets/catalog")}
            className="gap-1.5"
            data-testid="button-continue-shopping"
          >
            <ArrowLeft className="h-4 w-4" /> Continue Shopping
          </Button>
          <Separator orientation="vertical" className="h-5" />
          <h1 className="text-xl font-bold" data-testid="text-cart-title">
            Shopping Cart <span className="text-muted-foreground text-base font-normal">({items.length} item{items.length !== 1 ? "s" : ""})</span>
          </h1>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-destructive text-xs"
          onClick={() => {
            clearCart();
            toast({ title: "Cart Cleared", description: "All items removed from cart." });
          }}
          data-testid="button-clear-cart"
        >
          <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Clear All
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          {items.map(item => {
            const lineTotal = item.product.partnerPrice * item.quantity;
            return (
              <Card key={item.product.id} className="rounded-xl border" data-testid={`cart-item-${item.product.id}`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <Package className="h-7 w-7 text-muted-foreground/25" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div>
                          <p className="text-xs text-muted-foreground">{item.product.categoryName}</p>
                          <h3 className="font-semibold text-sm leading-tight" data-testid={`text-cart-item-name-${item.product.id}`}>
                            {item.product.name}
                          </h3>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0"
                          onClick={() => removeItem(item.product.id)}
                          data-testid={`button-remove-item-${item.product.id}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                      <div className="flex items-center gap-2 mb-3">
                        <DeliveryBadge speed={item.product.deliverySpeed} />
                        <span className="text-xs text-muted-foreground">MOQ: {item.product.minOrderQty}</span>
                      </div>
                      <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => updateQty(item.product.id, item.quantity - item.product.minOrderQty)}
                            disabled={item.quantity <= item.product.minOrderQty}
                            data-testid={`button-decrease-${item.product.id}`}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-10 text-center text-sm font-semibold" data-testid={`text-qty-${item.product.id}`}>
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => updateQty(item.product.id, item.quantity + item.product.minOrderQty)}
                            data-testid={`button-increase-${item.product.id}`}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">₹{item.product.partnerPrice.toLocaleString("en-IN")} × {item.quantity}</p>
                          <p className="font-bold text-sm" style={{ color: ETS_PORTAL_COLOR }} data-testid={`text-line-total-${item.product.id}`}>
                            ₹{lineTotal.toLocaleString("en-IN")}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="lg:col-span-1">
          <Card className="rounded-xl border sticky top-20" data-testid="cart-summary">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} units)</span>
                  <span className="font-medium" data-testid="text-subtotal">₹{subtotal.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-medium" data-testid="text-shipping">
                    {isFreeShipping ? (
                      <span className="text-green-600 font-semibold">FREE</span>
                    ) : (
                      `₹${shippingFee.toLocaleString("en-IN")}`
                    )}
                  </span>
                </div>
                {!isFreeShipping && (
                  <p className="text-[11px] text-muted-foreground bg-muted/50 rounded-lg px-2.5 py-2">
                    Add ₹{(FREE_SHIPPING_THRESHOLD - subtotal).toLocaleString("en-IN")} more for free shipping
                  </p>
                )}
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-base">
                <span>Grand Total</span>
                <span data-testid="text-grand-total">₹{grandTotal.toLocaleString("en-IN")}</span>
              </div>
              <Button
                className="w-full text-white h-10 font-semibold"
                style={{ backgroundColor: ETS_PORTAL_COLOR }}
                onClick={handleProceedToCheckout}
                data-testid="button-proceed-checkout"
              >
                Proceed to Checkout
              </Button>
              <Button
                variant="outline"
                className="w-full h-9 text-sm"
                onClick={() => navigate("/portal-ets/catalog")}
                data-testid="button-cart-continue-shopping"
              >
                Continue Shopping
              </Button>

              <Separator />
              <div className="space-y-1.5">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">What's in your cart</p>
                {items.map(item => (
                  <div key={item.product.id} className="flex justify-between text-xs text-muted-foreground">
                    <span className="truncate max-w-[150px]">{item.product.name}</span>
                    <span>×{item.quantity}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
