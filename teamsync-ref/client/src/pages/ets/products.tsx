import { useState, useMemo } from "react";
import { Package, Eye, EyeOff, Star, StarOff, ChevronDown, ChevronRight, ArrowRight, AlertTriangle, Search, Filter } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { StatsCard } from "@/components/ds/stats-card";
import { StatusBadge } from "@/components/ds/status-badge";
import { PageTransition, Fade, Stagger, StaggerItem } from "@/components/ui/animated";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  type EtsProduct,
  type EtsProductCategory,
  ETS_PRODUCT_CATEGORIES,
  calculateEtsPrices,
  getDefaultPriceInputs,
} from "@/lib/mock-data-ets";
import { PageShell } from "@/components/layout";
import { SopModal, TutorialModal, SopTutorialButtons } from "@/components/sop/sop-modal";
import { SOP_REGISTRY } from "@/lib/sop-data";
import { ETS_COLOR } from "@/lib/ets-config";

const formatInr = (v: number) => "₹" + v.toLocaleString("en-IN", { maximumFractionDigits: 2 });
const formatYuan = (v: number) => "¥" + v.toFixed(2);

const categoryVariant: Record<string, "success" | "error" | "warning" | "neutral" | "info"> = {
  toys: "info",
  kitchenware: "success",
  stationery: "warning",
  decor: "neutral",
  bags: "info",
  household: "success",
  gifts: "warning",
};

const marginTierVariant: Record<string, "success" | "error" | "warning" | "neutral" | "info"> = {
  premium: "success",
  standard: "neutral",
  value: "warning",
};

interface PriceChainRowProps {
  label: string;
  value: string;
  detail?: string;
  isHighlight?: boolean;
  isWarning?: boolean;
}

function PriceChainRow({ label, value, detail, isHighlight, isWarning }: PriceChainRowProps) {
  return (
    <div className={`flex items-center justify-between py-1.5 px-3 rounded-md text-sm ${isHighlight ? "bg-primary/5 font-medium" : ""} ${isWarning ? "bg-amber-50 dark:bg-amber-950/30" : ""}`}>
      <div className="flex items-center gap-2">
        <ArrowRight className="size-3 text-muted-foreground shrink-0" />
        <span className="text-muted-foreground">{label}</span>
        {detail && <span className="text-xs text-muted-foreground/70">({detail})</span>}
      </div>
      <span className={isWarning ? "text-amber-600 dark:text-amber-400 font-medium" : ""}>{value}</span>
    </div>
  );
}

function ExpandedPriceBreakdown({ product }: { product: EtsProduct }) {
  const inputs = getDefaultPriceInputs(product);
  const result = calculateEtsPrices(inputs);

  return (
    <Fade direction="down" distance={6} duration={0.2}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg border border-dashed">
        <div className="space-y-0.5">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2" data-testid="text-price-chain-title">Price Chain Breakdown</h4>
          <PriceChainRow label="EXW Price" value={formatYuan(product.exwPriceYuan)} />
          <PriceChainRow label="+ Sourcing 5%" value={formatYuan(result.fobPriceYuan - product.exwPriceYuan)} detail="commission" />
          <PriceChainRow label="FOB Price" value={`${formatYuan(result.fobPriceYuan)} / ${formatInr(result.fobPriceInr)}`} isHighlight />
          <PriceChainRow label="+ Freight" value={formatInr(result.freightPerUnit)} detail={`${result.cbmPerUnit.toFixed(4)} CBM/unit`} />
          <PriceChainRow label="+ Insurance 0.5%" value={formatInr(result.fobPriceInr * 0.005)} />
          <PriceChainRow label="CIF Price" value={formatInr(result.cifPriceInr)} isHighlight />
        </div>
        <div className="space-y-0.5">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Duties & Final Price</h4>
          <PriceChainRow label={`+ Customs Duty ${product.dutyPercent}%`} value={formatInr(result.customsDuty)} />
          <PriceChainRow label="+ SW Surcharge 10%" value={formatInr(result.swSurcharge)} />
          <PriceChainRow label={`+ IGST ${product.igstPercent}%`} value={formatInr(result.igst)} />
          <PriceChainRow label="Total Landed Cost" value={formatInr(result.totalLandedCost)} isHighlight />
          <PriceChainRow label="+ Our Markup 25%" value={formatInr(result.storeLandingPrice - result.totalLandedCost)} />
          <PriceChainRow label="Store Landing Price" value={formatInr(result.storeLandingPrice)} isHighlight />
          <PriceChainRow label="Suggested MRP" value={formatInr(result.suggestedMrp)} isHighlight />
          <PriceChainRow
            label="Store Margin"
            value={`${result.storeMarginPercent}% (${formatInr(result.storeMarginRs)})`}
            isWarning={result.marginWarning}
          />
          {result.marginWarning && (
            <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 mt-1 px-3">
              <AlertTriangle className="size-3" />
              <span>Below target margin of 50%</span>
            </div>
          )}
        </div>
      </div>
    </Fade>
  );
}

export default function EtsProductsPage() {
  const qc = useQueryClient();
  const { data: productsData, isLoading } = useQuery<{ products: EtsProduct[] }>({ queryKey: ['/api/ets/products'] });
  const products = productsData?.products || [];

  const [sopOpen, setSopOpen] = useState(false);
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [marginTierFilter, setMarginTierFilter] = useState<string>("all");
  const [visibilityFilter, setVisibilityFilter] = useState<string>("all");
  const [heroFilter, setHeroFilter] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | number | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set());
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const patchProductMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string | number, data: Record<string, any> }) => {
      await apiRequest("PATCH", `/api/ets/products/${id}`, data);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['/api/ets/products'] });
    },
  });

  const productsWithPricing = useMemo(() => {
    return products.map((p) => {
      const inputs = getDefaultPriceInputs(p);
      const result = calculateEtsPrices(inputs);
      return { ...p, pricing: result };
    });
  }, [products]);

  const filteredProducts = useMemo(() => {
    let result = [...productsWithPricing];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter((p) => p.name.toLowerCase().includes(q));
    }
    if (categoryFilter !== "all") {
      result = result.filter((p) => p.category === categoryFilter);
    }
    if (marginTierFilter !== "all") {
      result = result.filter((p) => p.marginTier === marginTierFilter);
    }
    if (visibilityFilter !== "all") {
      result = result.filter((p) => (visibilityFilter === "visible" ? p.isVisible : !p.isVisible));
    }
    if (heroFilter !== "all") {
      result = result.filter((p) => (heroFilter === "hero" ? p.isHeroSku : !p.isHeroSku));
    }

    if (sortKey) {
      result.sort((a, b) => {
        let aVal: number | string = 0;
        let bVal: number | string = 0;
        switch (sortKey) {
          case "name": aVal = a.name; bVal = b.name; break;
          case "exwPriceYuan": aVal = a.exwPriceYuan; bVal = b.exwPriceYuan; break;
          case "landedCost": aVal = a.pricing.totalLandedCost; bVal = b.pricing.totalLandedCost; break;
          case "suggestedMrp": aVal = a.pricing.suggestedMrp; bVal = b.pricing.suggestedMrp; break;
          case "margin": aVal = a.pricing.storeMarginPercent; bVal = b.pricing.storeMarginPercent; break;
        }
        if (typeof aVal === "string" && typeof bVal === "string") {
          return sortDir === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        }
        return sortDir === "asc" ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
      });
    }

    return result;
  }, [productsWithPricing, searchQuery, categoryFilter, marginTierFilter, visibilityFilter, heroFilter, sortKey, sortDir]);

  const stats = useMemo(() => {
    const total = products.length;
    const active = products.filter((p) => p.isVisible).length;
    const heroSkus = products.filter((p) => p.isHeroSku).length;
    const categories = new Set(products.map((p) => p.category)).size;
    const avgMargin = productsWithPricing.length > 0
      ? productsWithPricing.reduce((sum, p) => sum + p.pricing.storeMarginPercent, 0) / productsWithPricing.length
      : 0;
    return { total, active, heroSkus, avgMargin: Math.round(avgMargin * 10) / 10, categories };
  }, [products, productsWithPricing]);

  const toggleVisibility = (id: string | number) => {
    const product = products.find((p) => p.id === id);
    if (product) {
      patchProductMutation.mutate({ id, data: { is_visible: !product.isVisible } });
    }
  };

  const toggleHeroSku = (id: string | number) => {
    const product = products.find((p) => p.id === id);
    if (product) {
      patchProductMutation.mutate({ id, data: { is_hero_sku: !product.isHeroSku } });
    }
  };

  const toggleSelect = (id: string | number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredProducts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredProducts.map((p) => p.id)));
    }
  };

  const bulkToggleVisibility = (visible: boolean) => {
    Array.from(selectedIds).forEach((id) => {
      patchProductMutation.mutate({ id, data: { is_visible: visible } });
    });
    setSelectedIds(new Set());
  };

  const bulkSetMarginTier = (tier: "standard" | "premium" | "value") => {
    Array.from(selectedIds).forEach((id) => {
      patchProductMutation.mutate({ id, data: { margin_tier: tier } });
    });
    setSelectedIds(new Set());
  };

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const SortButton = ({ label, sortKeyName }: { label: string; sortKeyName: string }) => (
    <button
      className="inline-flex items-center gap-1 text-left"
      onClick={() => handleSort(sortKeyName)}
      data-testid={`sort-${sortKeyName}`}
    >
      {label}
      {sortKey === sortKeyName && (
        <span className="text-xs">{sortDir === "asc" ? "\u25B2" : "\u25BC"}</span>
      )}
    </button>
  );

  if (isLoading) {
    return (
      <PageShell>
        <PageTransition>
          <TableSkeleton rows={8} columns={7} />
        </PageTransition>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <PageTransition>
        <Fade direction="down" distance={10} duration={0.3}>
          <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
            <div>
              <h1 className="text-2xl font-bold font-heading" data-testid="text-page-title">Product Catalog</h1>
              <p className="text-sm text-muted-foreground">Manage products, pricing, and visibility</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <SopTutorialButtons onSopClick={() => setSopOpen(true)} onTutorialClick={() => setTutorialOpen(true)} />
            </div>
          </div>
        </Fade>
        <Stagger className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StaggerItem>
            <StatsCard
              title="Total Products"
              value={stats.total}
              icon={<Package className="size-5" />}
            />
          </StaggerItem>
          <StaggerItem>
            <StatsCard
              title="Active Products"
              value={stats.active}
              change={`${Math.round((stats.active / Math.max(stats.total, 1)) * 100)}% visible`}
              changeType="positive"
              icon={<Eye className="size-5" />}
            />
          </StaggerItem>
          <StaggerItem>
            <StatsCard
              title="Hero SKUs"
              value={stats.heroSkus}
              change={`${stats.categories} categories`}
              icon={<Star className="size-5" />}
            />
          </StaggerItem>
          <StaggerItem>
            <StatsCard
              title="Avg Margin"
              value={`${stats.avgMargin}%`}
              changeType={stats.avgMargin >= 50 ? "positive" : "warning"}
              change={stats.avgMargin >= 50 ? "Above target" : "Below 50% target"}
              icon={<Package className="size-5" />}
            />
          </StaggerItem>
        </Stagger>

        <Fade direction="up" distance={8} delay={0.15}>
          <div className="flex flex-col rounded-lg border bg-background">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-9 w-60 pl-9 text-sm rounded-lg"
                  data-testid="input-product-search"
                />
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="h-9 w-auto min-w-[120px] text-sm rounded-lg" data-testid="filter-category">
                    <Filter className="mr-1.5 size-3.5 text-muted-foreground" />
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {ETS_PRODUCT_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={marginTierFilter} onValueChange={setMarginTierFilter}>
                  <SelectTrigger className="h-9 w-auto min-w-[120px] text-sm rounded-lg" data-testid="filter-margin-tier">
                    <Filter className="mr-1.5 size-3.5 text-muted-foreground" />
                    <SelectValue placeholder="Margin Tier" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tiers</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="value">Value</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={visibilityFilter} onValueChange={setVisibilityFilter}>
                  <SelectTrigger className="h-9 w-auto min-w-[110px] text-sm rounded-lg" data-testid="filter-visibility">
                    <Filter className="mr-1.5 size-3.5 text-muted-foreground" />
                    <SelectValue placeholder="Visibility" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="visible">Visible</SelectItem>
                    <SelectItem value="hidden">Hidden</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={heroFilter} onValueChange={setHeroFilter}>
                  <SelectTrigger className="h-9 w-auto min-w-[110px] text-sm rounded-lg" data-testid="filter-hero">
                    <Filter className="mr-1.5 size-3.5 text-muted-foreground" />
                    <SelectValue placeholder="Hero SKU" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All SKUs</SelectItem>
                    <SelectItem value="hero">Hero Only</SelectItem>
                    <SelectItem value="regular">Regular Only</SelectItem>
                  </SelectContent>
                </Select>

                {selectedIds.size > 0 && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" variant="outline" data-testid="button-bulk-actions">
                        Bulk ({selectedIds.size})
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => bulkToggleVisibility(true)} data-testid="action-bulk-show">
                        <Eye className="size-3.5 mr-2" /> Show Selected
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => bulkToggleVisibility(false)} data-testid="action-bulk-hide">
                        <EyeOff className="size-3.5 mr-2" /> Hide Selected
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => bulkSetMarginTier("premium")} data-testid="action-bulk-premium">
                        Set Premium
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => bulkSetMarginTier("standard")} data-testid="action-bulk-standard">
                        Set Standard
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => bulkSetMarginTier("value")} data-testid="action-bulk-value">
                        Set Value
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm" data-testid="data-table-products">
                <thead>
                  <tr className="border-b bg-muted/40">
                    <th className="w-10 px-3 py-2.5">
                      <Checkbox
                        checked={filteredProducts.length > 0 && selectedIds.size === filteredProducts.length}
                        onCheckedChange={toggleSelectAll}
                        aria-label="Select all"
                        data-testid="checkbox-select-all"
                      />
                    </th>
                    <th className="w-8 px-2 py-2.5" />
                    <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      <SortButton label="Product" sortKeyName="name" />
                    </th>
                    <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Category
                    </th>
                    <th className="px-3 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      <SortButton label="EXW" sortKeyName="exwPriceYuan" />
                    </th>
                    <th className="px-3 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      <SortButton label="Landed" sortKeyName="landedCost" />
                    </th>
                    <th className="px-3 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      <SortButton label="MRP" sortKeyName="suggestedMrp" />
                    </th>
                    <th className="px-3 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      <SortButton label="Margin" sortKeyName="margin" />
                    </th>
                    <th className="px-3 py-2.5 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Hero
                    </th>
                    <th className="px-3 py-2.5 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Visible
                    </th>
                    <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Tier
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="px-4 py-12 text-center">
                        <div className="flex flex-col items-center gap-2" data-testid="empty-state">
                          <Package className="size-10 text-muted-foreground/50" />
                          <p className="text-sm font-medium text-foreground">No products found</p>
                          <p className="text-xs text-muted-foreground">Try adjusting your filters or search query.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((product) => {
                      const isExpanded = expandedId === product.id;
                      const marginColor = product.pricing.storeMarginPercent >= 50
                        ? "text-emerald-600 dark:text-emerald-400"
                        : product.pricing.storeMarginPercent >= 35
                          ? "text-amber-600 dark:text-amber-400"
                          : "text-red-600 dark:text-red-400";

                      return (
                        <tr key={product.id} data-testid={`row-product-${product.id}`}>
                          <td className="w-10 px-3 py-3" onClick={(e) => e.stopPropagation()}>
                            <Checkbox
                              checked={selectedIds.has(product.id)}
                              onCheckedChange={() => toggleSelect(product.id)}
                              aria-label={`Select ${product.name}`}
                              data-testid={`checkbox-product-${product.id}`}
                            />
                          </td>
                          <td className="w-8 px-2 py-3">
                            <button
                              onClick={() => setExpandedId(isExpanded ? null : product.id)}
                              className="p-0.5 rounded text-muted-foreground"
                              data-testid={`button-expand-${product.id}`}
                            >
                              {isExpanded ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
                            </button>
                          </td>
                          <td className="px-3 py-3">
                            <span className="text-sm font-medium" data-testid={`text-product-name-${product.id}`}>{product.name}</span>
                          </td>
                          <td className="px-3 py-3">
                            <StatusBadge
                              status={product.category.charAt(0).toUpperCase() + product.category.slice(1)}
                              variant={categoryVariant[product.category] || "neutral"}
                            />
                          </td>
                          <td className="px-3 py-3 text-right">
                            <span className="text-sm" data-testid={`text-exw-${product.id}`}>{formatYuan(product.exwPriceYuan)}</span>
                          </td>
                          <td className="px-3 py-3 text-right">
                            <span className="text-sm" data-testid={`text-landed-${product.id}`}>{formatInr(product.pricing.totalLandedCost)}</span>
                          </td>
                          <td className="px-3 py-3 text-right">
                            <span className="text-sm font-medium" data-testid={`text-mrp-${product.id}`}>{formatInr(product.pricing.suggestedMrp)}</span>
                          </td>
                          <td className="px-3 py-3 text-right">
                            <span className={`text-sm font-medium ${marginColor}`} data-testid={`text-margin-${product.id}`}>
                              {product.pricing.storeMarginPercent}%
                            </span>
                          </td>
                          <td className="px-3 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => toggleHeroSku(product.id)}
                              data-testid={`button-hero-${product.id}`}
                            >
                              {product.isHeroSku
                                ? <Star className="size-4 text-amber-500 fill-amber-500" />
                                : <StarOff className="size-4 text-muted-foreground" />
                              }
                            </Button>
                          </td>
                          <td className="px-3 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => toggleVisibility(product.id)}
                              data-testid={`button-visibility-${product.id}`}
                            >
                              {product.isVisible
                                ? <Eye className="size-4 text-emerald-600 dark:text-emerald-400" />
                                : <EyeOff className="size-4 text-muted-foreground" />
                              }
                            </Button>
                          </td>
                          <td className="px-3 py-3">
                            <StatusBadge
                              status={product.marginTier.charAt(0).toUpperCase() + product.marginTier.slice(1)}
                              variant={marginTierVariant[product.marginTier] || "neutral"}
                            />
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>

              {filteredProducts.map((product) => {
                if (expandedId !== product.id) return null;
                return (
                  <div key={`expanded-${product.id}`} className="border-t px-4 py-4" data-testid={`expanded-row-${product.id}`}>
                    <ExpandedPriceBreakdown product={product} />
                  </div>
                );
              })}
            </div>

            {filteredProducts.length > 0 && (
              <div className="flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3">
                <p className="text-sm text-muted-foreground" data-testid="text-product-count">
                  Showing {filteredProducts.length} of {products.length} products
                </p>
              </div>
            )}
          </div>
        </Fade>
      </PageTransition>
      <SopModal open={sopOpen} onOpenChange={setSopOpen} config={SOP_REGISTRY["ets-products"].sop} color={ETS_COLOR} />
      <TutorialModal open={tutorialOpen} onOpenChange={setTutorialOpen} config={SOP_REGISTRY["ets-products"].tutorial} color={ETS_COLOR} />
    </PageShell>
  );
}
