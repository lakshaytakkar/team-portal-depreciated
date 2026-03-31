import { useQuery } from "@tanstack/react-query";
import {
  Package, Truck, CheckCircle2, Clock, Ship,
  Factory, Warehouse, Building2, ExternalLink,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  portalEtsClient,
  ETS_PORTAL_COLOR,
  ETS_ORDER_STAGE_LABELS,
  ETS_ORDER_STAGES,
} from "@/lib/mock-data-portal-ets";

const statusConfig: Record<string, { color: string; bgColor: string; icon: typeof Package }> = {
  ordered: { color: "text-blue-600", bgColor: "bg-blue-50 border-blue-200", icon: Package },
  "factory-ready": { color: "text-amber-600", bgColor: "bg-amber-50 border-amber-200", icon: Factory },
  shipped: { color: "text-purple-600", bgColor: "bg-purple-50 border-purple-200", icon: Ship },
  customs: { color: "text-orange-600", bgColor: "bg-orange-50 border-orange-200", icon: Building2 },
  warehouse: { color: "text-indigo-600", bgColor: "bg-indigo-50 border-indigo-200", icon: Warehouse },
  dispatched: { color: "text-green-600", bgColor: "bg-green-50 border-green-200", icon: CheckCircle2 },
};

function OrderTimeline({ status }: { status: string }) {
  const currentIndex = ETS_ORDER_STAGES.indexOf(status as any);

  return (
    <div className="flex items-center gap-0 w-full py-4">
      {ETS_ORDER_STAGES.map((stage, index) => {
        const isCompleted = index <= currentIndex;
        const isCurrent = index === currentIndex;
        const config = statusConfig[stage];
        const Icon = config?.icon || Package;

        return (
          <div key={stage} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center relative">
              <div
                className={cn(
                  "h-10 w-10 rounded-full flex items-center justify-center border-2 transition-all",
                  isCompleted
                    ? isCurrent
                      ? `${config?.bgColor || "bg-orange-50 border-orange-200"} ${config?.color || "text-orange-600"} ring-4 ring-orange-100`
                      : "bg-green-50 border-green-500 text-green-600"
                    : "bg-muted border-muted-foreground/20 text-muted-foreground/40"
                )}
                data-testid={`status-icon-${stage}`}
              >
                {isCompleted && !isCurrent ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : (
                  <Icon className="h-5 w-5" />
                )}
              </div>
              <span className={cn(
                "text-xs mt-2 text-center whitespace-nowrap font-medium",
                isCompleted ? (isCurrent ? config?.color || "text-orange-600" : "text-green-600") : "text-muted-foreground/50"
              )}>
                {ETS_ORDER_STAGE_LABELS[stage]}
              </span>
            </div>
            {index < ETS_ORDER_STAGES.length - 1 && (
              <div className={`flex-1 h-0.5 mx-1 mt-[-20px] ${
                index < currentIndex ? "bg-green-500" : "bg-muted-foreground/15"
              }`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function OrderCard({ order }: { order: any }) {
  const config = statusConfig[order.status] || statusConfig["ordered"];

  return (
    <Card className="rounded-xl border bg-card overflow-hidden" data-testid={`card-order-${order.id}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <CardTitle className="text-lg">Order #{order.id}</CardTitle>
              <Badge className={cn(`${config.bgColor} ${config.color} border`)} data-testid={`badge-status-${order.id}`}>
                {ETS_ORDER_STAGE_LABELS[order.status] || order.status}
              </Badge>
            </div>
            <CardDescription>{order.itemCount} items &middot; {"\u20B9"}{(order.valueInr || 0).toLocaleString("en-IN")}</CardDescription>
          </div>
          <div className="text-right text-sm text-muted-foreground">
            <p>Placed on</p>
            <p className="font-medium text-foreground">{order.createdDate || "—"}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <OrderTimeline status={order.status} />

        {order.etaDays != null && order.etaDays > 0 && order.status !== "dispatched" && (
          <div className="flex items-center gap-3 bg-muted/50 rounded-lg p-3">
            <Clock className="h-5 w-5 text-muted-foreground shrink-0" />
            <div>
              <p className="text-sm">
                <span className="text-muted-foreground">Expected Delivery:</span>{" "}
                <span className="font-semibold" data-testid={`text-delivery-${order.id}`}>~{order.etaDays} days remaining</span>
              </p>
            </div>
          </div>
        )}

        {order.documents && order.documents.length > 0 && (
          <div className="bg-muted/30 rounded-lg p-3 border border-dashed">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Documents</p>
            <div className="flex flex-wrap gap-2">
              {order.documents.map((doc: any, idx: number) => (
                <Badge key={idx} variant="outline" className="text-xs cursor-pointer hover:bg-accent">
                  {doc.name} <ExternalLink className="h-3 w-3 ml-1" />
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function OrdersSkeleton() {
  return (
    <div className="px-16 lg:px-24 py-6 space-y-6">
      <Skeleton className="h-10 w-48" />
      {[1, 2].map(i => <Skeleton key={i} className="h-64 rounded-xl" />)}
    </div>
  );
}

export default function EtsPortalOrders() {
  const clientId = portalEtsClient.id;

  const { data: ordersData, isLoading } = useQuery<{ orders: any[] }>({
    queryKey: ['/api/ets-portal/client', clientId, 'orders'],
  });

  if (isLoading) return <OrdersSkeleton />;

  const orders = ordersData?.orders || [];
  const activeOrders = orders.filter(o => o.status !== "dispatched");
  const deliveredOrders = orders.filter(o => o.status === "dispatched");

  return (
    <div className="px-16 lg:px-24 py-6 space-y-6" data-testid="ets-portal-orders">
      <div>
        <h1 className="text-2xl font-bold font-heading" data-testid="text-page-title">Order Tracking</h1>
        <p className="text-muted-foreground">Track the status of your inventory shipments and deliveries</p>
      </div>

      {orders.length === 0 ? (
        <Card className="rounded-xl border bg-card">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Package className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2" data-testid="text-empty-title">No Orders Yet</h3>
            <p className="text-muted-foreground max-w-md">
              Once your inventory is ordered and starts shipping, you'll be able to track every shipment right here.
              Your orders will appear with real-time status updates and tracking information.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {activeOrders.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full animate-pulse" style={{ backgroundColor: ETS_PORTAL_COLOR }} />
                <h2 className="text-lg font-semibold">Active Orders ({activeOrders.length})</h2>
              </div>
              {activeOrders.map(order => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          )}

          {deliveredOrders.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <h2 className="text-lg font-semibold text-muted-foreground">Delivered ({deliveredOrders.length})</h2>
              </div>
              {deliveredOrders.map(order => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
