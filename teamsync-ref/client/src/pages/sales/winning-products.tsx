import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ds/status-badge";
import { products } from "@/lib/mock-data-sales";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { Stagger, StaggerItem, PageTransition } from "@/components/ui/animated";
import { StatsCardSkeleton } from "@/components/ui/card-skeleton";
import { TrendingUp, ShoppingCart, DollarSign } from "lucide-react";
import { PageShell } from "@/components/layout";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);

export default function WinningProductsPage() {
  const loading = useSimulatedLoading();

  const winningProducts = [...products]
    .filter((p) => p.status === "active" && p.orders > 0)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 12);

  return (
    <PageShell>
      <PageTransition>
        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <StatsCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <Stagger staggerInterval={0.04} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {winningProducts.map((product, index) => (
              <StaggerItem key={product.id}>
                <Card className="p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md" data-testid={`card-winning-${product.id}`}>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="size-10 shrink-0 rounded-md bg-muted flex items-center justify-center overflow-hidden">
                          <img src={product.image} alt={product.name} className="size-10 object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                        </div>
                        <span className="text-xs font-medium text-muted-foreground">#{index + 1}</span>
                      </div>
                      <StatusBadge
                        status={product.source}
                        variant={product.source === "aliexpress" ? "info" : product.source === "cjdropshipping" ? "warning" : "success"}
                      />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold line-clamp-2">{product.name}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{product.category}</p>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <TrendingUp className="size-3" />
                          <span className="text-[10px]">Margin</span>
                        </div>
                        <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">{product.margin}%</span>
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <ShoppingCart className="size-3" />
                          <span className="text-[10px]">Orders</span>
                        </div>
                        <span className="text-sm font-semibold">{product.orders.toLocaleString()}</span>
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <DollarSign className="size-3" />
                          <span className="text-[10px]">Revenue</span>
                        </div>
                        <span className="text-sm font-semibold">{formatCurrency(product.revenue)}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </StaggerItem>
            ))}
          </Stagger>
        )}
      </PageTransition>
    </PageShell>
  );
}
