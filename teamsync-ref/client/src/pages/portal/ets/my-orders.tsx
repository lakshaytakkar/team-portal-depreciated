import { Link } from "wouter";
import { Package, ChevronRight, ShoppingCart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ETS_PORTAL_COLOR } from "@/lib/mock-data-portal-ets";
import { useEtsOrders, type Order, type PaymentStatus, type FulfillmentStatus } from "@/lib/ets-order-store";
import { useEtsSidebar } from "@/components/layout/ets-subnav-sidebar";

function paymentBadge(status: PaymentStatus) {
  if (status === "Paid") return <Badge className="bg-green-50 text-green-700 border-green-200" variant="outline">Paid</Badge>;
  return <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200" variant="outline">Pending</Badge>;
}

function fulfillmentBadge(status: FulfillmentStatus) {
  const configs: Record<FulfillmentStatus, { className: string; label: string }> = {
    "Processing": { className: "bg-orange-50 text-orange-700 border-orange-200", label: "Processing" },
    "Shipped": { className: "bg-blue-50 text-blue-700 border-blue-200", label: "Shipped" },
    "Out for Delivery": { className: "bg-blue-50 text-blue-700 border-blue-200", label: "Out for Delivery" },
    "Delivered": { className: "bg-green-50 text-green-700 border-green-200", label: "Delivered" },
    "Partially Shipped": { className: "bg-yellow-50 text-blue-700 border-yellow-200", label: "Partially Shipped" },
  };
  const cfg = configs[status] || configs["Processing"];
  return <Badge className={cfg.className} variant="outline">{cfg.label}</Badge>;
}

function EmptyOrders() {
  return (
    <Card className="rounded-xl border bg-card">
      <CardContent className="flex flex-col items-center justify-center py-16 text-center">
        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <ShoppingCart className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2" data-testid="text-empty-orders">No Orders Yet</h3>
        <p className="text-muted-foreground mb-4 max-w-md">
          Place your first order from the catalog to get started.
        </p>
        <Link href="/portal-ets/checkout">
          <Button style={{ backgroundColor: ETS_PORTAL_COLOR }} className="text-white" data-testid="button-go-checkout">
            Go to Checkout
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

export default function EtsMyOrders() {
  const { orders } = useEtsOrders();
  const inSidebar = useEtsSidebar();
  const containerClass = inSidebar ? "p-5 space-y-5" : "px-16 lg:px-24 py-6 space-y-6";

  return (
    <div className={containerClass} data-testid="ets-my-orders">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading" data-testid="text-my-orders-title">My Orders</h1>
          <p className="text-muted-foreground">Track all your placed orders and their status.</p>
        </div>
        <Link href="/portal-ets/checkout">
          <Button style={{ backgroundColor: ETS_PORTAL_COLOR }} className="text-white" data-testid="button-new-order">
            <ShoppingCart className="h-4 w-4 mr-2" /> New Order
          </Button>
        </Link>
      </div>

      {orders.length === 0 ? (
        <EmptyOrders />
      ) : (
        <Card className="rounded-xl border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" style={{ color: ETS_PORTAL_COLOR }} />
              All Orders ({orders.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order #</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Fulfillment</TableHead>
                  <TableHead className="text-right">Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order: Order) => (
                  <TableRow
                    key={order.id}
                    className="cursor-pointer hover:bg-muted/50"
                    data-testid={`row-order-${order.id}`}
                  >
                    <TableCell className="font-medium" data-testid={`text-order-id-${order.id}`}>{order.id}</TableCell>
                    <TableCell>{order.date}</TableCell>
                    <TableCell>{order.itemCount} units</TableCell>
                    <TableCell className="font-medium">₹{order.total.toLocaleString("en-IN")}</TableCell>
                    <TableCell data-testid={`badge-payment-${order.id}`}>{paymentBadge(order.paymentStatus)}</TableCell>
                    <TableCell data-testid={`badge-fulfillment-${order.id}`}>{fulfillmentBadge(order.fulfillmentStatus)}</TableCell>
                    <TableCell className="text-right">
                      <Link href={`/portal-ets/my-orders/${order.id}`}>
                        <Button variant="ghost" size="sm" data-testid={`button-view-order-${order.id}`}>
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
