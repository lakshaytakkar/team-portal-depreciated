import { useState } from "react";
import { Package, Search, Grid3X3, List, Weight, DollarSign, Warehouse } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { VENDOR_COLOR } from "@/lib/vendor-config";
import { SopModal, TutorialModal, SopTutorialButtons } from "@/components/sop/sop-modal";
import { SOP_REGISTRY } from "@/lib/sop-data";
import {
  PageShell,
  PageHeader,
  StatGrid,
  StatCard,
  FilterPill,
  DataTableContainer,
  DataTH,
  DataTD,
  DataTR,
} from "@/components/layout";
import {
  vendorProducts,
  type VendorProduct,
  type VendorProductStockStatus,
} from "@/lib/mock-data-vendor";

const STOCK_STATUS_CONFIG: Record<VendorProductStockStatus, { label: string; color: string; bg: string }> = {
  "In Stock":     { label: "In Stock",     color: "#059669", bg: "#d1fae5" },
  "Low Stock":    { label: "Low Stock",    color: "#d97706", bg: "#fef3c7" },
  "Out of Stock": { label: "Out of Stock", color: "#dc2626", bg: "#fee2e2" },
};

const categories = Array.from(new Set(vendorProducts.map((p) => p.category)));

export default function VendorProducts() {
  const [search, setSearch] = useState("");
  const [sopOpen, setSopOpen] = useState(false);
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  const filtered = vendorProducts.filter((p) => {
    if (search) {
      const q = search.toLowerCase();
      if (
        !p.name.toLowerCase().includes(q) &&
        !p.sku.toLowerCase().includes(q) &&
        !p.supplier.toLowerCase().includes(q)
      )
        return false;
    }
    if (categoryFilter !== "all" && p.category !== categoryFilter) return false;
    return true;
  });

  const inStockCount = vendorProducts.filter((p) => p.stockStatus === "In Stock").length;
  const lowStockCount = vendorProducts.filter((p) => p.stockStatus === "Low Stock").length;
  const outOfStockCount = vendorProducts.filter((p) => p.stockStatus === "Out of Stock").length;
  const totalValue = vendorProducts.reduce((s, p) => s + p.sellingPrice * p.stockQuantity, 0);

  const formatCurrency = (v: number) => `$${v.toFixed(2)}`;

  return (
    <PageShell>
      <PageHeader
        title="Products Catalogue"
        subtitle={`${vendorProducts.length} products in inventory`}
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <SopTutorialButtons onSopClick={() => setSopOpen(true)} onTutorialClick={() => setTutorialOpen(true)} />
            <div className="flex border rounded-md overflow-visible">
              <Button
                size="icon"
                variant={viewMode === "grid" ? "default" : "ghost"}
                onClick={() => setViewMode("grid")}
                data-testid="button-view-grid"
                style={viewMode === "grid" ? { backgroundColor: VENDOR_COLOR } : {}}
                className={viewMode === "grid" ? "text-white" : ""}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant={viewMode === "table" ? "default" : "ghost"}
                onClick={() => setViewMode("table")}
                data-testid="button-view-table"
                style={viewMode === "table" ? { backgroundColor: VENDOR_COLOR } : {}}
                className={viewMode === "table" ? "text-white" : ""}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        }
      />

      <StatGrid>
        <StatCard label="Total Products" value={vendorProducts.length} icon={Package} iconBg="#e0f2fe" iconColor={VENDOR_COLOR} />
        <StatCard label="In Stock" value={inStockCount} icon={Warehouse} iconBg="#d1fae5" iconColor="#059669" />
        <StatCard label="Low Stock" value={lowStockCount} icon={Warehouse} iconBg="#fef3c7" iconColor="#d97706" />
        <StatCard label="Out of Stock" value={outOfStockCount} icon={Warehouse} iconBg="#fee2e2" iconColor="#dc2626" />
        <StatCard label="Inventory Value" value={`$${Math.round(totalValue).toLocaleString()}`} icon={DollarSign} iconBg="#e0f2fe" iconColor={VENDOR_COLOR} />
      </StatGrid>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, SKU, or supplier..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            data-testid="input-search-products"
          />
        </div>
        <FilterPill active={categoryFilter === "all"} color={VENDOR_COLOR} onClick={() => setCategoryFilter("all")} testId="filter-all">All ({vendorProducts.length})</FilterPill>
        {categories.map((cat) => (
          <FilterPill
            key={cat}
            active={categoryFilter === cat}
            color={VENDOR_COLOR}
            onClick={() => setCategoryFilter(cat)}
            testId={`filter-${cat.toLowerCase().replace(/\s+/g, "-")}`}
          >
            {cat} ({vendorProducts.filter((p) => p.category === cat).length})
          </FilterPill>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card className="p-12 text-center">
          <Package className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground font-medium" data-testid="text-no-products">No products match your filters.</p>
        </Card>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <DataTableContainer>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <DataTH>Product</DataTH>
                <DataTH>SKU</DataTH>
                <DataTH>Category</DataTH>
                <DataTH>Supplier</DataTH>
                <DataTH align="right">Cost</DataTH>
                <DataTH align="right">Selling</DataTH>
                <DataTH align="right">Weight</DataTH>
                <DataTH align="center">Stock</DataTH>
                <DataTH align="right">Qty</DataTH>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((product) => {
                const stockCfg = STOCK_STATUS_CONFIG[product.stockStatus];
                return (
                  <DataTR key={product.id} data-testid={`row-product-${product.id}`}>
                    <DataTD>
                      <div className="flex items-center gap-3">
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="size-9 rounded-md object-cover shrink-0"
                          loading="lazy"
                          data-testid={`img-product-${product.id}`}
                        />
                        <span className="font-medium" data-testid={`text-product-name-${product.id}`}>{product.name}</span>
                      </div>
                    </DataTD>
                    <DataTD>
                      <span className="text-muted-foreground font-mono text-xs" data-testid={`text-sku-${product.id}`}>{product.sku}</span>
                    </DataTD>
                    <DataTD>
                      <span className="text-muted-foreground">{product.category}</span>
                    </DataTD>
                    <DataTD>
                      <span className="text-muted-foreground">{product.supplier}</span>
                    </DataTD>
                    <DataTD align="right">
                      <span className="text-muted-foreground">{formatCurrency(product.costPrice)}</span>
                    </DataTD>
                    <DataTD align="right">
                      <span className="font-medium">{formatCurrency(product.sellingPrice)}</span>
                    </DataTD>
                    <DataTD align="right">
                      <span className="text-muted-foreground">{product.weight} lb</span>
                    </DataTD>
                    <DataTD align="center">
                      <Badge
                        variant="outline"
                        className="text-xs"
                        style={{ color: stockCfg.color, backgroundColor: stockCfg.bg, borderColor: stockCfg.color + "30" }}
                        data-testid={`badge-stock-${product.id}`}
                      >
                        {stockCfg.label}
                      </Badge>
                    </DataTD>
                    <DataTD align="right">
                      <span className="font-medium" data-testid={`text-qty-${product.id}`}>{product.stockQuantity}</span>
                    </DataTD>
                  </DataTR>
                );
              })}
            </tbody>
          </table>
        </DataTableContainer>
      )}
      <SopModal open={sopOpen} onOpenChange={setSopOpen} config={SOP_REGISTRY["vendor-products"].sop} color={VENDOR_COLOR} />
      <TutorialModal open={tutorialOpen} onOpenChange={setTutorialOpen} config={SOP_REGISTRY["vendor-products"].tutorial} color={VENDOR_COLOR} />
    </PageShell>
  );
}

function ProductCard({ product }: { product: VendorProduct }) {
  const stockCfg = STOCK_STATUS_CONFIG[product.stockStatus];
  const margin = product.sellingPrice - product.costPrice;
  const marginPct = ((margin / product.sellingPrice) * 100).toFixed(0);

  return (
    <Card className="overflow-visible" data-testid={`card-product-${product.id}`}>
      <div className="aspect-square bg-muted rounded-t-md overflow-hidden relative">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover"
          loading="lazy"
          data-testid={`img-product-${product.id}`}
        />
        <Badge
          variant="outline"
          className="absolute top-2 right-2 text-xs"
          style={{ color: stockCfg.color, backgroundColor: stockCfg.bg, borderColor: stockCfg.color + "30" }}
          data-testid={`badge-stock-${product.id}`}
        >
          {stockCfg.label}
        </Badge>
      </div>
      <div className="p-3 space-y-2">
        <div>
          <h3 className="font-semibold text-sm line-clamp-1" data-testid={`text-product-name-${product.id}`}>{product.name}</h3>
          <p className="text-xs text-muted-foreground" data-testid={`text-sku-${product.id}`}>{product.sku}</p>
        </div>
        <div className="flex items-center justify-between gap-2">
          <div>
            <span className="text-xs text-muted-foreground">Cost </span>
            <span className="text-sm text-muted-foreground">${product.costPrice.toFixed(2)}</span>
          </div>
          <div>
            <span className="text-xs text-muted-foreground">Sell </span>
            <span className="text-sm font-semibold">${product.sellingPrice.toFixed(2)}</span>
          </div>
        </div>
        <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Weight className="h-3 w-3" />
            {product.weight} lb
          </span>
          <span>{marginPct}% margin</span>
        </div>
        <div className="flex items-center justify-between gap-2 pt-1 border-t">
          <span className="text-xs text-muted-foreground">{product.supplier}</span>
          <span className="text-xs text-muted-foreground">Qty: {product.stockQuantity}</span>
        </div>
        <div>
          <Badge variant="outline" className="text-xs">{product.category}</Badge>
        </div>
      </div>
    </Card>
  );
}
