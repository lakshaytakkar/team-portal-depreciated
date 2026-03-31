import { useState } from "react";
import { useLocation } from "wouter";
import {
  Package, Truck, CheckCircle2, DollarSign, Users, ShoppingCart,
  TrendingUp, Clock,
} from "lucide-react";
import { SopModal, TutorialModal, SopTutorialButtons } from "@/components/sop/sop-modal";
import { SOP_REGISTRY } from "@/lib/sop-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { VENDOR_COLOR, VENDOR_ORDER_STATUS_CONFIG } from "@/lib/vendor-config";
import {
  vendorOrders,
  vendorClients,
  vendorDashboardStats,
  type VendorOrder,
  type VendorOrderStatus,
} from "@/lib/mock-data-vendor";
import {
  PageShell,
  HeroBanner,
  StatGrid,
  StatCard,
  SectionCard,
  SectionGrid,
  DataTableContainer,
  DataTH,
  DataTD,
  DataTR,
} from "@/components/layout";

export default function VendorDashboard() {
  const [, setLocation] = useLocation();
  const isLoading = useSimulatedLoading(500);
  const [sopOpen, setSopOpen] = useState(false);
  const [tutorialOpen, setTutorialOpen] = useState(false);

  const stats = vendorDashboardStats;
  const recentOrders = [...vendorOrders]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10);

  const topClients = [...vendorClients]
    .filter(c => c.status === "Active")
    .sort((a, b) => b.totalOrders - a.totalOrders)
    .slice(0, 5);

  const pipelineCounts: { status: VendorOrderStatus; count: number; label: string; color: string }[] = [
    { status: "New", count: stats.newOrders, label: "New", color: VENDOR_ORDER_STATUS_CONFIG.new.color },
    { status: "Quoted", count: stats.quotedOrders, label: "Quoted", color: VENDOR_ORDER_STATUS_CONFIG.quoted.color },
    { status: "Processing", count: stats.processingOrders, label: "Processing", color: VENDOR_ORDER_STATUS_CONFIG.processing.color },
    { status: "Shipped", count: stats.shippedOrders, label: "Shipped", color: VENDOR_ORDER_STATUS_CONFIG.shipped.color },
    { status: "Delivered", count: stats.deliveredOrders, label: "Delivered", color: VENDOR_ORDER_STATUS_CONFIG.delivered.color },
  ];
  const pipelineMax = Math.max(...pipelineCounts.map(p => p.count), 1);

  if (isLoading) {
    return (
      <PageShell className="animate-pulse">
        <div className="h-48 bg-muted rounded-2xl" />
        <StatGrid>
          {[...Array(6)].map((_, i) => <div key={i} className="h-32 bg-muted rounded-xl" />)}
        </StatGrid>
        <SectionGrid>
          <div className="h-64 bg-muted rounded-xl" />
          <div className="h-64 bg-muted rounded-xl" />
        </SectionGrid>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="flex items-center justify-end gap-2 mb-2">
        <SopTutorialButtons onSopClick={() => setSopOpen(true)} onTutorialClick={() => setTutorialOpen(true)} />
      </div>
      <HeroBanner
        eyebrow="HQ DROPSHIPPING"
        headline="Order Fulfillment & Logistics Operations"
        tagline={`${stats.newOrders} new orders awaiting action · ${stats.activeClients} active clients · ${stats.fulfillmentRate}% fulfillment rate`}
        color={VENDOR_COLOR}
        colorDark={VENDOR_COLOR}
      />

      <StatGrid>
        <StatCard
          label="New Orders"
          value={stats.newOrders}
          icon={ShoppingCart}
          iconBg="rgba(30, 58, 95, 0.1)"
          iconColor={VENDOR_COLOR}
          data-testid="stat-new-orders"
        />
        <StatCard
          label="Processing"
          value={stats.processingOrders}
          icon={Clock}
          iconBg="rgba(124, 58, 237, 0.1)"
          iconColor="#7C3AED"
          data-testid="stat-processing"
        />
        <StatCard
          label="Shipped"
          value={stats.shippedOrders}
          icon={Truck}
          iconBg="rgba(37, 99, 235, 0.1)"
          iconColor="#2563EB"
          data-testid="stat-shipped"
        />
        <StatCard
          label="Delivered"
          value={stats.deliveredOrders}
          icon={CheckCircle2}
          iconBg="rgba(5, 150, 105, 0.1)"
          iconColor="#059669"
          data-testid="stat-delivered"
        />
        <StatCard
          label="Total Revenue"
          value={`$${stats.totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          iconBg="rgba(245, 158, 11, 0.1)"
          iconColor="#F59E0B"
          data-testid="stat-total-revenue"
        />
        <StatCard
          label="Active Clients"
          value={stats.activeClients}
          icon={Users}
          iconBg="rgba(236, 72, 153, 0.1)"
          iconColor="#EC4899"
          data-testid="stat-active-clients"
        />
      </StatGrid>

      <SectionGrid>
        <SectionCard
          title="Recent Orders"
          viewAllLabel="View All"
          onViewAll={() => setLocation("/vendor/orders")}
        >
          <DataTableContainer>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <DataTH>Order</DataTH>
                  <DataTH>Store</DataTH>
                  <DataTH>Customer</DataTH>
                  <DataTH align="center">Items</DataTH>
                  <DataTH>Total</DataTH>
                  <DataTH>Status</DataTH>
                  <DataTH>Date</DataTH>
                </tr>
              </thead>
              <tbody className="divide-y">
                {recentOrders.map((order: VendorOrder) => {
                  const statusKey = order.status.toLowerCase() as keyof typeof VENDOR_ORDER_STATUS_CONFIG;
                  const cfg = VENDOR_ORDER_STATUS_CONFIG[statusKey];
                  return (
                    <DataTR
                      key={order.id}
                      onClick={() => setLocation(`/vendor/orders/${order.id}`)}
                      data-testid={`order-row-${order.id}`}
                    >
                      <DataTD>
                        <span className="font-medium">{order.shopifyOrderNumber}</span>
                      </DataTD>
                      <DataTD className="text-muted-foreground">{order.storeName}</DataTD>
                      <DataTD>
                        <div>
                          <span className="font-medium">{order.customerName}</span>
                          <p className="text-xs text-muted-foreground">{order.shippingAddress.city}, {order.shippingAddress.state}</p>
                        </div>
                      </DataTD>
                      <DataTD align="center">
                        <div className="flex items-center justify-center gap-1">
                          {order.items[0] && (
                            <img
                              src={order.items[0].imageUrl}
                              alt=""
                              className="w-6 h-6 rounded object-cover"
                            />
                          )}
                          <span>{order.items.length}</span>
                        </div>
                      </DataTD>
                      <DataTD className="font-semibold">${order.total.toLocaleString()}</DataTD>
                      <DataTD>
                        <span
                          className="text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{ background: cfg?.bg, color: cfg?.color }}
                          data-testid={`status-badge-${order.id}`}
                        >
                          {cfg?.label ?? order.status}
                        </span>
                      </DataTD>
                      <DataTD className="text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </DataTD>
                    </DataTR>
                  );
                })}
              </tbody>
            </table>
          </DataTableContainer>
        </SectionCard>

        <SectionCard
          title="Top Clients"
          viewAllLabel="View All"
          onViewAll={() => setLocation("/vendor/clients")}
        >
          <div className="space-y-3">
            {topClients.map((client, index) => (
              <div
                key={client.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 cursor-pointer"
                onClick={() => setLocation("/vendor/clients")}
                data-testid={`client-card-${client.id}`}
              >
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                  style={{ backgroundColor: VENDOR_COLOR }}
                >
                  {client.businessName.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm truncate">{client.businessName}</span>
                    <Badge variant="outline" className="text-xs shrink-0">{client.planTier}</Badge>
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                    <span>{client.totalOrders} orders</span>
                    <span>${client.totalSpent.toLocaleString()}</span>
                  </div>
                </div>
                <span className="text-lg font-bold text-muted-foreground/40">#{index + 1}</span>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Fulfillment Pipeline">
          <div className="space-y-3">
            {pipelineCounts.map((stage) => {
              const pct = Math.round((stage.count / pipelineMax) * 100);
              return (
                <div key={stage.status} data-testid={`pipeline-${stage.status.toLowerCase()}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{stage.label}</span>
                    <span className="text-sm font-bold" style={{ color: stage.color }}>{stage.count}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${pct}%`, backgroundColor: stage.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 pt-3 border-t flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Fulfillment Rate</span>
            <span className="text-lg font-bold" style={{ color: VENDOR_COLOR }}>{stats.fulfillmentRate}%</span>
          </div>
        </SectionCard>

        <SectionCard title="Quick Actions">
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "View Orders", icon: Package, path: "/vendor/orders" },
              { label: "Clients", icon: Users, path: "/vendor/clients" },
              { label: "Tracking", icon: Truck, path: "/vendor/tracking" },
              { label: "Ledger", icon: DollarSign, path: "/vendor/ledger" },
              { label: "Products", icon: ShoppingCart, path: "/vendor/products" },
              { label: "Stores", icon: TrendingUp, path: "/vendor/stores" },
            ].map((action) => (
              <Button
                key={action.label}
                variant="outline"
                className="h-auto py-3 px-3 flex flex-col items-center gap-1.5"
                onClick={() => setLocation(action.path)}
                data-testid={`action-${action.label.toLowerCase().replace(/\s/g, "-")}`}
              >
                <action.icon className="h-4 w-4" style={{ color: VENDOR_COLOR }} />
                <span className="text-xs font-medium">{action.label}</span>
              </Button>
            ))}
          </div>
        </SectionCard>
      </SectionGrid>
      <SopModal open={sopOpen} onOpenChange={setSopOpen} config={SOP_REGISTRY["vendor-dashboard"].sop} color={VENDOR_COLOR} />
      <TutorialModal open={tutorialOpen} onOpenChange={setTutorialOpen} config={SOP_REGISTRY["vendor-dashboard"].tutorial} color={VENDOR_COLOR} />
    </PageShell>
  );
}
