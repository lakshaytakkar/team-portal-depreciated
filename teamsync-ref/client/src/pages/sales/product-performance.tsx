import { Package, ShoppingCart, TrendingUp, BarChart3 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatsCard } from "@/components/ds/stats-card";
import { StatsCardSkeleton } from "@/components/ui/card-skeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { products, categories } from "@/lib/mock-data-sales";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { Fade, Stagger, StaggerItem, PageTransition } from "@/components/ui/animated";
import { PageShell } from "@/components/layout";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);

export default function ProductPerformancePage() {
  const loading = useSimulatedLoading();

  const activeProducts = products.filter((p) => p.status === "active");
  const totalOrders = activeProducts.reduce((s, p) => s + p.orders, 0);
  const totalRevenue = activeProducts.reduce((s, p) => s + p.revenue, 0);
  const avgMargin = Math.round(activeProducts.reduce((s, p) => s + p.margin, 0) / activeProducts.length);
  const avgRating = (activeProducts.reduce((s, p) => s + p.rating, 0) / activeProducts.length).toFixed(1);

  const topByOrders = [...activeProducts].sort((a, b) => b.orders - a.orders).slice(0, 5);
  const topByRevenue = [...activeProducts].sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  const topByMargin = [...activeProducts].sort((a, b) => b.margin - a.margin).slice(0, 5);
  const maxOrders = Math.max(...topByOrders.map((p) => p.orders));
  const maxRevenue = Math.max(...topByRevenue.map((p) => p.revenue));

  const categoryBreakdown = categories
    .map((cat) => {
      const catProducts = activeProducts.filter((p) => p.category === cat.name);
      return {
        name: cat.name,
        productCount: catProducts.length,
        totalOrders: catProducts.reduce((s, p) => s + p.orders, 0),
        totalRevenue: catProducts.reduce((s, p) => s + p.revenue, 0),
      };
    })
    .filter((c) => c.productCount > 0)
    .sort((a, b) => b.totalRevenue - a.totalRevenue);

  const maxCatRevenue = Math.max(...categoryBreakdown.map((c) => c.totalRevenue));

  return (
    <PageShell>
      <PageTransition>
        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
          </div>
        ) : (
          <Stagger staggerInterval={0.05} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StaggerItem>
              <StatsCard
                title="Active Products"
                value={activeProducts.length}
                change={`${products.length} total listed`}
                changeType="neutral"
                icon={<Package className="size-5" />}
              />
            </StaggerItem>
            <StaggerItem>
              <StatsCard
                title="Total Orders"
                value={totalOrders.toLocaleString()}
                change="+15% this month"
                changeType="positive"
                icon={<ShoppingCart className="size-5" />}
              />
            </StaggerItem>
            <StaggerItem>
              <StatsCard
                title="Total Revenue"
                value={formatCurrency(totalRevenue)}
                change={`Avg rating: ${avgRating}`}
                changeType="positive"
                icon={<TrendingUp className="size-5" />}
              />
            </StaggerItem>
            <StaggerItem>
              <StatsCard
                title="Avg Margin"
                value={`${avgMargin}%`}
                change="Across active products"
                changeType="neutral"
                icon={<BarChart3 className="size-5" />}
              />
            </StaggerItem>
          </Stagger>
        )}

        {loading ? (
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-lg border bg-background p-5">
              <Skeleton className="h-4 w-1/3 mb-4" />
              <div className="flex flex-col gap-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            </div>
            <div className="rounded-lg border bg-background p-5">
              <Skeleton className="h-4 w-1/3 mb-4" />
              <div className="flex flex-col gap-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <Fade direction="up" delay={0.15} className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-lg border bg-background" data-testid="section-top-by-orders">
              <div className="border-b px-5 py-4">
                <h3 className="text-base font-semibold font-heading">Top Products by Orders</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Most ordered products</p>
              </div>
              <div className="divide-y">
                {topByOrders.map((product, idx) => {
                  const percentage = Math.round((product.orders / maxOrders) * 100);
                  return (
                    <div key={product.id} className="flex items-center gap-3 px-5 py-3" data-testid={`row-orders-${product.id}`}>
                      <span className="text-sm font-semibold text-muted-foreground w-6">#{idx + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{product.name}</p>
                        <p className="text-xs text-muted-foreground">{product.category}</p>
                      </div>
                      <div className="w-24 flex items-center gap-2">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-primary transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-sm font-semibold w-16 text-right">{product.orders.toLocaleString()}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-lg border bg-background" data-testid="section-top-by-revenue">
              <div className="border-b px-5 py-4">
                <h3 className="text-base font-semibold font-heading">Top Products by Revenue</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Highest revenue generating products</p>
              </div>
              <div className="divide-y">
                {topByRevenue.map((product, idx) => {
                  const percentage = Math.round((product.revenue / maxRevenue) * 100);
                  return (
                    <div key={product.id} className="flex items-center gap-3 px-5 py-3" data-testid={`row-revenue-${product.id}`}>
                      <span className="text-sm font-semibold text-muted-foreground w-6">#{idx + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{product.name}</p>
                        <p className="text-xs text-muted-foreground">{product.category}</p>
                      </div>
                      <div className="w-24 flex items-center gap-2">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-primary transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-sm font-semibold w-20 text-right" data-testid={`text-revenue-${product.id}`}>
                        {formatCurrency(product.revenue)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </Fade>
        )}

        {loading ? (
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-lg border bg-background p-5">
              <Skeleton className="h-4 w-1/3 mb-4" />
              <div className="flex flex-col gap-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            </div>
            <div className="rounded-lg border bg-background p-5">
              <Skeleton className="h-4 w-1/3 mb-4" />
              <div className="flex flex-col gap-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <Fade direction="up" delay={0.25} className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-lg border bg-background" data-testid="section-top-by-margin">
              <div className="border-b px-5 py-4">
                <h3 className="text-base font-semibold font-heading">Top Products by Margin</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Highest profit margin products</p>
              </div>
              <div className="divide-y">
                {topByMargin.map((product, idx) => (
                  <div key={product.id} className="flex items-center gap-3 px-5 py-3" data-testid={`row-margin-${product.id}`}>
                    <span className="text-sm font-semibold text-muted-foreground w-6">#{idx + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{product.name}</p>
                      <p className="text-xs text-muted-foreground">{product.category}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">{product.margin}%</Badge>
                      <span className="text-sm text-muted-foreground">${product.price}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border bg-background" data-testid="section-category-breakdown">
              <div className="border-b px-5 py-4">
                <h3 className="text-base font-semibold font-heading">Category Breakdown</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Revenue by product category</p>
              </div>
              <div className="divide-y">
                {categoryBreakdown.map((cat) => {
                  const percentage = Math.round((cat.totalRevenue / maxCatRevenue) * 100);
                  return (
                    <div key={cat.name} className="flex items-center gap-3 px-5 py-3" data-testid={`row-category-${cat.name.toLowerCase().replace(/\s+/g, "-")}`}>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{cat.name}</p>
                        <p className="text-xs text-muted-foreground">{cat.productCount} products, {cat.totalOrders.toLocaleString()} orders</p>
                      </div>
                      <div className="w-24 flex items-center gap-2">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-primary transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-sm font-semibold w-20 text-right">{formatCurrency(cat.totalRevenue)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </Fade>
        )}
      </PageTransition>
    </PageShell>
  );
}
