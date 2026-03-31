import { useParams, Link } from "wouter";
import { ArrowLeft, Package, CheckCircle2, Clock, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { ETS_PORTAL_COLOR } from "@/lib/mock-data-portal-ets";
import { useEtsOrders } from "@/lib/ets-order-store";
import { useEtsSidebar } from "@/components/layout/ets-subnav-sidebar";

export default function EtsOrderDetail() {
  const params = useParams<{ orderId: string }>();
  const { getOrder } = useEtsOrders();
  const order = getOrder(params.orderId);
  const inSidebar = useEtsSidebar();
  const containerClass = inSidebar ? "p-5 space-y-5" : "px-16 lg:px-24 py-6 space-y-6";

  if (!order) {
    return (
      <div className={containerClass} data-testid="order-not-found">
        <Link href="/portal-ets/my-orders">
          <Button variant="ghost" className="mb-4"><ArrowLeft className="h-4 w-4 mr-2" /> Back to Orders</Button>
        </Link>
        <div className="text-center py-16">
          <h3 className="text-lg font-semibold mb-2">Order Not Found</h3>
          <p className="text-muted-foreground">The order {params.orderId} could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={containerClass} data-testid="ets-order-detail">
      <div className="flex items-center gap-4">
        <Link href="/portal-ets/my-orders">
          <Button variant="ghost" size="sm" data-testid="button-back-orders">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Orders
          </Button>
        </Link>
        <div className="flex-1" />
        <Link href={`/portal-ets/invoices/${order.invoiceId}`}>
          <Button variant="outline" size="sm" data-testid="button-download-invoice">
            <Download className="h-4 w-4 mr-2" /> Download Invoice
          </Button>
        </Link>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold font-heading" data-testid="text-order-title">{order.id}</h1>
          <p className="text-muted-foreground">Placed on {order.date}</p>
        </div>
        <div className="flex gap-2">
          <Badge
            className={order.paymentStatus === "Paid" ? "bg-green-50 text-green-700 border-green-200" : "bg-yellow-50 text-yellow-700 border-yellow-200"}
            variant="outline"
            data-testid="badge-payment-status"
          >
            {order.paymentStatus}
          </Badge>
          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200" data-testid="badge-fulfillment-status">
            {order.fulfillmentStatus}
          </Badge>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="rounded-xl border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" style={{ color: ETS_PORTAL_COLOR }} />
                Line Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Unit Price</TableHead>
                    <TableHead className="text-right">Line Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.items.map(item => (
                    <TableRow key={item.id} data-testid={`row-item-${item.id}`}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">{item.category}</Badge>
                      </TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right">₹{item.price.toLocaleString("en-IN")}</TableCell>
                      <TableCell className="text-right font-medium">₹{item.lineTotal.toLocaleString("en-IN")}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="rounded-xl border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" style={{ color: ETS_PORTAL_COLOR }} />
                Fulfillment Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-0">
                {order.timeline.map((step, idx) => (
                  <div key={step.label} className="flex gap-4" data-testid={`timeline-step-${idx}`}>
                    <div className="flex flex-col items-center">
                      <div
                        className={cn(
                          "h-8 w-8 rounded-full flex items-center justify-center border-2 shrink-0",
                          step.completed
                            ? "bg-green-50 border-green-500 text-green-600"
                            : "bg-muted border-muted-foreground/20 text-muted-foreground/40"
                        )}
                      >
                        {step.completed ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : (
                          <div className="h-2 w-2 rounded-full bg-muted-foreground/30" />
                        )}
                      </div>
                      {idx < order.timeline.length - 1 && (
                        <div className={cn(
                          "w-0.5 flex-1 my-1",
                          step.completed ? "bg-green-300" : "bg-muted-foreground/15"
                        )} style={{ minHeight: "32px" }} />
                      )}
                    </div>
                    <div className="pb-6 flex-1">
                      <p className={cn(
                        "font-medium text-sm",
                        step.completed ? "text-foreground" : "text-muted-foreground/60"
                      )} data-testid={`step-label-${idx}`}>
                        {step.label}
                      </p>
                      <p className="text-xs text-muted-foreground" data-testid={`step-time-${idx}`}>
                        {step.timestamp ?? "Pending"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="rounded-xl border bg-card">
            <CardHeader>
              <CardTitle className="text-base">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span data-testid="text-subtotal">₹{order.subtotal.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Delivery Fee</span>
                <span>₹{order.deliveryFee.toLocaleString("en-IN")}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span data-testid="text-total">₹{order.total.toLocaleString("en-IN")}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl border bg-card">
            <CardHeader>
              <CardTitle className="text-base">Payment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date</span>
                <span data-testid="text-payment-date">{order.paymentDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Method</span>
                <span data-testid="text-payment-method">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Reference</span>
                <span className="font-mono text-xs" data-testid="text-payment-ref">{order.paymentReference}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <Badge
                  className={order.paymentStatus === "Paid" ? "bg-green-50 text-green-700 border-green-200" : "bg-yellow-50 text-yellow-700 border-yellow-200"}
                  variant="outline"
                >
                  {order.paymentStatus}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl border bg-card">
            <CardHeader>
              <CardTitle className="text-base">Delivery Address</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground" data-testid="text-delivery-address">{order.deliveryAddress}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
