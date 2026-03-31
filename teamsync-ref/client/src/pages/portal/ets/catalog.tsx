import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import {
  Search, Package, ShoppingCart, SlidersHorizontal, X,
  Zap, Clock, ChevronDown, ChevronUp, AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useEtsCart, type CartProduct } from "@/lib/ets-cart-context";
import { ETS_PORTAL_COLOR } from "@/lib/mock-data-portal-ets";
import mockData from "@/lib/mock-products.json";

type DeliverySpeed = "india" | "standard";
type ComplianceStatus = "approved" | "restricted" | "banned";

interface Product {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  categoryName: string;
  partnerPrice: number;
  suggestedMrp: number;
  deliverySpeed: DeliverySpeed;
  imageUrl: string | null;
  complianceStatus: ComplianceStatus;
  minOrderQty: number;
  inStock: boolean;
}

interface Category {
  id: string;
  name: string;
  icon: string;
}

const products: Product[] = (mockData.products as Product[]).filter(p => p.complianceStatus !== "banned");
const categories: Category[] = mockData.categories as Category[];

const RECOMMENDED_CATEGORIES = ["decor", "household", "gifts"];

type SortOption = "relevance" | "price-asc" | "price-desc" | "recommended";

function DeliveryBadge({ speed }: { speed: DeliverySpeed }) {
  if (speed === "india") {
    return (
      <Badge className="text-[10px] px-1.5 py-0.5 bg-green-100 text-green-700 border-green-200 hover:bg-green-100">
        <Zap className="h-2.5 w-2.5 mr-1" /> Express: 3-7 days
      </Badge>
    );
  }
  return (
    <Badge className="text-[10px] px-1.5 py-0.5 bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100">
      <Clock className="h-2.5 w-2.5 mr-1" /> Standard: 30-45 days
    </Badge>
  );
}

function PriceRangeSlider({ min, max, value, onChange }: { min: number; max: number; value: [number, number]; onChange: (v: [number, number]) => void }) {
  return (
    <div className="space-y-3">
      <Slider
        min={min}
        max={max}
        step={50}
        value={value}
        onValueChange={(v) => onChange(v as [number, number])}
        className="mt-2"
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>₹{value[0].toLocaleString("en-IN")}</span>
        <span>₹{value[1].toLocaleString("en-IN")}</span>
      </div>
    </div>
  );
}

function FilterPanel({
  selectedCategory,
  setSelectedCategory,
  deliveryFilter,
  setDeliveryFilter,
  priceRange,
  setPriceRange,
  search,
  setSearch,
  onClose,
}: {
  selectedCategory: string;
  setSelectedCategory: (v: string) => void;
  deliveryFilter: string;
  setDeliveryFilter: (v: string) => void;
  priceRange: [number, number];
  setPriceRange: (v: [number, number]) => void;
  search: string;
  setSearch: (v: string) => void;
  onClose?: () => void;
}) {
  const minPrice = Math.min(...products.map(p => p.partnerPrice));
  const maxPrice = Math.max(...products.map(p => p.partnerPrice));

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Search</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
            data-testid="input-search-catalog"
          />
        </div>
      </div>

      <Separator />

      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Category</label>
        <div className="space-y-1">
          <button
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${selectedCategory === "all" ? "bg-orange-100 text-orange-700 font-semibold" : "hover:bg-muted text-foreground"}`}
            onClick={() => setSelectedCategory("all")}
            data-testid="filter-cat-all"
          >
            All Categories
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${selectedCategory === cat.id ? "bg-orange-100 text-orange-700 font-semibold" : "hover:bg-muted text-foreground"}`}
              onClick={() => setSelectedCategory(cat.id)}
              data-testid={`filter-cat-${cat.id}`}
            >
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      <Separator />

      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Delivery Speed</label>
        <div className="space-y-1">
          {[
            { value: "all", label: "All" },
            { value: "india", label: "Express (3-7 days)" },
            { value: "standard", label: "Standard (30-45 days)" },
          ].map(opt => (
            <button
              key={opt.value}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${deliveryFilter === opt.value ? "bg-orange-100 text-orange-700 font-semibold" : "hover:bg-muted text-foreground"}`}
              onClick={() => setDeliveryFilter(opt.value)}
              data-testid={`filter-speed-${opt.value}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <Separator />

      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Partner Price</label>
        <PriceRangeSlider min={minPrice} max={maxPrice} value={priceRange} onChange={setPriceRange} />
      </div>

      {onClose && (
        <Button className="w-full text-white" style={{ backgroundColor: ETS_PORTAL_COLOR }} onClick={onClose} data-testid="button-apply-filters">
          Apply Filters
        </Button>
      )}
    </div>
  );
}

function ProductCard({ product, onViewDetail }: { product: Product; onViewDetail: (p: Product) => void }) {
  const { addItem } = useEtsCart();
  const { toast } = useToast();

  const margin = product.suggestedMrp - product.partnerPrice;
  const marginPct = Math.round((margin / product.suggestedMrp) * 100);

  function handleAddToCart(e: React.MouseEvent) {
    e.stopPropagation();
    const cartProduct: CartProduct = {
      id: product.id,
      name: product.name,
      categoryName: product.categoryName,
      partnerPrice: product.partnerPrice,
      suggestedMrp: product.suggestedMrp,
      deliverySpeed: product.deliverySpeed,
      minOrderQty: product.minOrderQty,
    };
    addItem(cartProduct, product.minOrderQty);
    toast({
      title: "Added to Cart",
      description: `${product.name} (qty: ${product.minOrderQty}) added to your cart.`,
    });
  }

  return (
    <Card
      className="rounded-xl border bg-card overflow-hidden hover:shadow-md transition-shadow cursor-pointer group"
      onClick={() => onViewDetail(product)}
      data-testid={`card-product-${product.id}`}
    >
      <div className="aspect-square bg-muted flex items-center justify-center relative">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <Package className="h-12 w-12 text-muted-foreground/20" />
        )}
        <div className="absolute top-2 left-2">
          <DeliveryBadge speed={product.deliverySpeed} />
        </div>
        {product.complianceStatus === "restricted" && (
          <div className="absolute top-2 right-2">
            <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-700 border-amber-300">
              <AlertTriangle className="h-2.5 w-2.5 mr-1" /> Restricted
            </Badge>
          </div>
        )}
      </div>
      <CardContent className="p-3">
        <p className="text-[10px] text-muted-foreground mb-0.5">{product.categoryName}</p>
        <h3 className="font-semibold text-sm leading-tight mb-2 line-clamp-2" data-testid={`text-product-name-${product.id}`}>
          {product.name}
        </h3>
        <div className="flex items-end justify-between mb-1">
          <div>
            <p className="text-[10px] text-muted-foreground">Partner Price</p>
            <p className="font-bold text-base" style={{ color: ETS_PORTAL_COLOR }} data-testid={`text-price-${product.id}`}>
              ₹{product.partnerPrice.toLocaleString("en-IN")}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-muted-foreground">MRP</p>
            <p className="text-sm font-semibold text-foreground" data-testid={`text-mrp-${product.id}`}>₹{product.suggestedMrp.toLocaleString("en-IN")}</p>
          </div>
        </div>
        <p className="text-[10px] text-green-600 font-medium mb-3">Margin: {marginPct}% (₹{margin.toLocaleString("en-IN")})</p>
        <Button
          className="w-full text-white text-xs h-8"
          style={{ backgroundColor: ETS_PORTAL_COLOR }}
          onClick={handleAddToCart}
          data-testid={`button-add-${product.id}`}
        >
          <ShoppingCart className="h-3 w-3 mr-1.5" /> Add to Cart
        </Button>
      </CardContent>
    </Card>
  );
}

function ProductDetailPanel({ product, onClose }: { product: Product; onClose: () => void }) {
  const { addItem } = useEtsCart();
  const { toast } = useToast();
  const [qty, setQty] = useState(product.minOrderQty);

  const margin = product.suggestedMrp - product.partnerPrice;
  const marginPct = Math.round((margin / product.suggestedMrp) * 100);

  const today = new Date();
  const expressDate = new Date(today);
  expressDate.setDate(today.getDate() + 7);
  const standardDate = new Date(today);
  standardDate.setDate(today.getDate() + 45);
  const estimatedDate = product.deliverySpeed === "india" ? expressDate : standardDate;
  const dateStr = estimatedDate.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  function handleAdd() {
    const cartProduct: CartProduct = {
      id: product.id,
      name: product.name,
      categoryName: product.categoryName,
      partnerPrice: product.partnerPrice,
      suggestedMrp: product.suggestedMrp,
      deliverySpeed: product.deliverySpeed,
      minOrderQty: product.minOrderQty,
    };
    addItem(cartProduct, qty);
    toast({ title: "Added to Cart", description: `${product.name} (qty: ${qty}) added to your cart.` });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex justify-end" onClick={onClose} data-testid="product-detail-overlay">
      <div
        className="w-full max-w-md bg-white dark:bg-gray-900 h-full overflow-y-auto shadow-2xl"
        onClick={e => e.stopPropagation()}
        data-testid="product-detail-panel"
      >
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b px-5 py-4 flex items-center justify-between z-10">
          <h2 className="font-bold text-base" data-testid="text-detail-title">Product Details</h2>
          <Button variant="ghost" size="icon" onClick={onClose} data-testid="button-close-detail">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="aspect-video bg-muted flex items-center justify-center">
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <Package className="h-16 w-16 text-muted-foreground/20" />
          )}
        </div>

        <div className="p-5 space-y-5">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary" className="text-xs">{product.categoryName}</Badge>
              <DeliveryBadge speed={product.deliverySpeed} />
              {product.complianceStatus === "restricted" && (
                <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-700 border-amber-300">
                  <AlertTriangle className="h-2.5 w-2.5 mr-1" /> Restricted
                </Badge>
              )}
            </div>
            <h2 className="text-xl font-bold leading-tight" data-testid="text-detail-name">{product.name}</h2>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{product.description}</p>
            {product.complianceStatus === "restricted" && (
              <div className="mt-3 p-3 rounded-lg bg-amber-50 border border-amber-200 text-sm text-amber-800">
                <AlertTriangle className="h-4 w-4 inline mr-1.5" />
                This product has some sourcing restrictions. It remains orderable but may require additional documentation.
              </div>
            )}
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-muted/50 rounded-xl p-3">
              <p className="text-[11px] text-muted-foreground mb-0.5">Partner Purchase Price</p>
              <p className="text-xl font-bold" style={{ color: ETS_PORTAL_COLOR }} data-testid="text-detail-partner-price">
                ₹{product.partnerPrice.toLocaleString("en-IN")}
              </p>
            </div>
            <div className="bg-muted/50 rounded-xl p-3">
              <p className="text-[11px] text-muted-foreground mb-0.5">Suggested MRP</p>
              <p className="text-xl font-bold text-foreground" data-testid="text-detail-mrp">
                ₹{product.suggestedMrp.toLocaleString("en-IN")}
              </p>
            </div>
            <div className="bg-green-50 border border-green-100 rounded-xl p-3">
              <p className="text-[11px] text-muted-foreground mb-0.5">Your Margin</p>
              <p className="text-lg font-bold text-green-700" data-testid="text-detail-margin">
                ₹{margin.toLocaleString("en-IN")}
              </p>
            </div>
            <div className="bg-green-50 border border-green-100 rounded-xl p-3">
              <p className="text-[11px] text-muted-foreground mb-0.5">Margin %</p>
              <p className="text-lg font-bold text-green-700" data-testid="text-detail-margin-pct">
                {marginPct}%
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Delivery Speed</span>
              <span className="font-medium">
                {product.deliverySpeed === "india" ? "Express (India Sourced)" : "Standard (China Sourced)"}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Estimated Arrival</span>
              <span className="font-medium" data-testid="text-detail-eta">By {dateStr}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Min. Order Qty</span>
              <span className="font-medium" data-testid="text-detail-moq">{product.minOrderQty} units</span>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <label className="text-sm font-semibold">Quantity</label>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9"
                onClick={() => setQty(q => Math.max(product.minOrderQty, q - product.minOrderQty))}
                data-testid="button-qty-decrease"
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
              <Input
                type="number"
                value={qty}
                min={product.minOrderQty}
                step={product.minOrderQty}
                onChange={e => setQty(Math.max(product.minOrderQty, parseInt(e.target.value) || product.minOrderQty))}
                className="w-24 text-center font-semibold"
                data-testid="input-qty-detail"
              />
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9"
                onClick={() => setQty(q => q + product.minOrderQty)}
                data-testid="button-qty-increase"
              >
                <ChevronUp className="h-4 w-4" />
              </Button>
              <span className="text-xs text-muted-foreground">× ₹{product.partnerPrice} = <strong>₹{(qty * product.partnerPrice).toLocaleString("en-IN")}</strong></span>
            </div>
            <p className="text-xs text-muted-foreground">Min. order: {product.minOrderQty} units</p>
          </div>

          <Button
            className="w-full text-white h-11 text-sm font-semibold"
            style={{ backgroundColor: ETS_PORTAL_COLOR }}
            onClick={handleAdd}
            data-testid="button-add-to-cart-detail"
          >
            <ShoppingCart className="h-4 w-4 mr-2" /> Add to Cart — ₹{(qty * product.partnerPrice).toLocaleString("en-IN")}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function EtsPortalCatalog() {
  const [, navigate] = useLocation();
  const { itemCount } = useEtsCart();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [deliveryFilter, setDeliveryFilter] = useState("all");
  const [priceRange, setPriceRange] = useState<[number, number]>([
    Math.min(...products.map(p => p.partnerPrice)),
    Math.max(...products.map(p => p.partnerPrice)),
  ]);
  const [sortBy, setSortBy] = useState<SortOption>("relevance");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);

  const filtered = useMemo(() => {
    let list = products.filter(p => {
      const matchSearch = !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase()) ||
        p.categoryName.toLowerCase().includes(search.toLowerCase());
      const matchCat = selectedCategory === "all" || p.categoryId === selectedCategory;
      const matchSpeed = deliveryFilter === "all" || p.deliverySpeed === deliveryFilter;
      const matchPrice = p.partnerPrice >= priceRange[0] && p.partnerPrice <= priceRange[1];
      return matchSearch && matchCat && matchSpeed && matchPrice;
    });

    if (sortBy === "price-asc") list = [...list].sort((a, b) => a.partnerPrice - b.partnerPrice);
    else if (sortBy === "price-desc") list = [...list].sort((a, b) => b.partnerPrice - a.partnerPrice);
    else if (sortBy === "recommended") {
      list = [...list].sort((a, b) => {
        const aRec = RECOMMENDED_CATEGORIES.includes(a.categoryId) ? 0 : 1;
        const bRec = RECOMMENDED_CATEGORIES.includes(b.categoryId) ? 0 : 1;
        return aRec - bRec;
      });
    }

    return list;
  }, [search, selectedCategory, deliveryFilter, priceRange, sortBy]);

  const filterPanelProps = {
    selectedCategory, setSelectedCategory,
    deliveryFilter, setDeliveryFilter,
    priceRange, setPriceRange,
    search, setSearch,
  };

  return (
    <div className="min-h-full" data-testid="ets-portal-catalog">
      <div className="sticky top-0 z-20 bg-background border-b px-16 lg:px-24 py-3 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold font-heading" data-testid="text-catalog-title">Product Catalog</h1>
          <p className="text-xs text-muted-foreground hidden sm:block">Browse and order products for your store</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={sortBy} onValueChange={v => setSortBy(v as SortOption)}>
            <SelectTrigger className="w-40 h-8 text-xs" data-testid="select-sort">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="relevance">Relevance</SelectItem>
              <SelectItem value="price-asc">Price: Low to High</SelectItem>
              <SelectItem value="price-desc">Price: High to Low</SelectItem>
              <SelectItem value="recommended">Recommended for You</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            className="relative h-8 text-xs"
            onClick={() => navigate("/portal-ets/cart")}
            data-testid="button-go-to-cart"
          >
            <ShoppingCart className="h-3.5 w-3.5 mr-1.5" />
            Cart
            {itemCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] rounded-full text-[10px] font-bold text-white flex items-center justify-center px-1" style={{ backgroundColor: ETS_PORTAL_COLOR }} data-testid="badge-cart-count">
                {itemCount}
              </span>
            )}
          </Button>

          <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 text-xs md:hidden" data-testid="button-open-filters">
                <SlidersHorizontal className="h-3.5 w-3.5 mr-1.5" /> Filters
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 overflow-y-auto">
              <SheetHeader className="mb-4">
                <SheetTitle>Filter Products</SheetTitle>
              </SheetHeader>
              <FilterPanel {...filterPanelProps} onClose={() => setFilterOpen(false)} />
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <div className="flex min-h-[calc(100vh-120px)]">
        <aside className="hidden md:block w-60 lg:w-64 shrink-0 border-r p-4 overflow-y-auto sticky top-[57px] h-[calc(100vh-57px)]" data-testid="filter-sidebar">
          <FilterPanel {...filterPanelProps} />
        </aside>

        <div className="flex-1 p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground" data-testid="badge-product-count">
              {filtered.length} product{filtered.length !== 1 ? "s" : ""} found
            </p>
          </div>

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Package className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2" data-testid="text-empty-title">No Products Found</h3>
              <p className="text-muted-foreground text-sm">Try adjusting your filters or search term.</p>
              <Button variant="outline" className="mt-4" onClick={() => {
                setSearch("");
                setSelectedCategory("all");
                setDeliveryFilter("all");
                setPriceRange([Math.min(...products.map(p => p.partnerPrice)), Math.max(...products.map(p => p.partnerPrice))]);
              }} data-testid="button-clear-filters">
                Clear All Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map(product => (
                <ProductCard key={product.id} product={product} onViewDetail={setSelectedProduct} />
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedProduct && (
        <ProductDetailPanel product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      )}
    </div>
  );
}
