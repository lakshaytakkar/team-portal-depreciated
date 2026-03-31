import { PageTransition, Stagger, StaggerItem, Fade } from "@/components/ui/animated";
import { useState, useMemo } from "react";
import { Search, X } from "lucide-react";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { omsProducts } from "@/lib/mock-data-oms";
import { cn } from "@/lib/utils";
import { PageShell } from "@/components/layout";

const CATEGORIES = ["Fashion", "Electronics", "Homeware", "Stationery", "Personal Care", "Food"];

const CATEGORY_EMOJI: Record<string, string> = {
  Fashion: "👗",
  Electronics: "📱",
  Homeware: "🏠",
  Stationery: "📚",
  "Personal Care": "🧴",
  Food: "🍵",
};

export default function OmsProducts() {
  const loading = useSimulatedLoading(600);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [selected, setSelected] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let list = [...omsProducts];
    if (categoryFilter !== "all") list = list.filter(p => p.category === categoryFilter);
    if (typeFilter !== "all") list = list.filter(p => p.fulfillmentType === typeFilter);
    if (search) list = list.filter(p =>
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      p.name.toLowerCase().includes(search.toLowerCase())
    );
    return list;
  }, [categoryFilter, typeFilter, search]);

  const selectedProduct = selected ? omsProducts.find(p => p.id === selected) : null;

  if (loading) {
    return (
      <PageShell>
        <div className="h-14 w-72 bg-muted rounded-lg" />
        <div className="h-10 bg-muted rounded-xl" />
        <div className="grid grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <div key={i} className="h-48 bg-muted rounded-xl" />)}
        </div>
      </PageShell>
    );
  }

  return (
    <PageTransition>
      <div className="px-16 py-6 lg:px-24 space-y-5">
        <Fade>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold" data-testid="products-heading">Products / SKUs</h1>
                <span className="text-sm bg-cyan-100 text-cyan-700 font-semibold px-2.5 py-0.5 rounded-full">{filtered.length}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">{omsProducts.length} products · inventory and dropship catalog</p>
            </div>
            <Button style={{ backgroundColor: "#0891B2" }} className="text-white hover:opacity-90" data-testid="btn-add-product">
              + Add Product
            </Button>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {(["all", ...CATEGORIES]).map(cat => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                data-testid={`filter-cat-${cat}`}
                className={cn("px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
                  categoryFilter === cat ? "bg-cyan-600 text-white" : "bg-muted text-muted-foreground hover:bg-accent"
                )}
              >
                {cat === "all" ? "All" : cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {(["all", "inventory", "dropship"] as const).map(t => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                data-testid={`filter-fulfil-${t}`}
                className={cn("px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
                  typeFilter === t ? (t === "dropship" ? "bg-violet-600 text-white" : "bg-cyan-600 text-white") : "bg-muted text-muted-foreground hover:bg-accent"
                )}
              >
                {t === "all" ? "All Types" : t === "inventory" ? "Inventory-Based" : "Dropship"}
              </button>
            ))}
            <div className="flex-1" />
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
              <Input className="pl-8 h-9 w-48" placeholder="Search SKU..." value={search} onChange={e => setSearch(e.target.value)} data-testid="input-search-products" />
            </div>
            <div className="flex rounded-lg border border-border overflow-hidden">
              <button onClick={() => setViewMode("grid")} className={cn("px-3 py-1.5 text-xs font-medium transition-colors", viewMode === "grid" ? "bg-cyan-600 text-white" : "bg-background text-muted-foreground hover:bg-muted")}>Grid</button>
              <button onClick={() => setViewMode("table")} className={cn("px-3 py-1.5 text-xs font-medium transition-colors", viewMode === "table" ? "bg-cyan-600 text-white" : "bg-background text-muted-foreground hover:bg-muted")}>Table</button>
            </div>
          </div>
        </Fade>

        <div className="flex gap-4">
          <div className="flex-1">
            {viewMode === "grid" ? (
              <Stagger>
                <div className="grid grid-cols-4 gap-4">
                  {filtered.map(p => (
                    <StaggerItem key={p.id}>
                      <div
                        className={cn("border border-border rounded-xl bg-background overflow-hidden cursor-pointer hover:border-cyan-400 transition-colors", selected === p.id && "border-cyan-500 ring-1 ring-cyan-500")}
                        onClick={() => setSelected(selected === p.id ? null : p.id)}
                        data-testid={`card-product-${p.id}`}
                      >
                        <div className="h-28 bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                          <span className="text-2xl">{CATEGORY_EMOJI[p.category] || "📦"}</span>
                        </div>
                        <div className="p-3">
                          <div className="flex items-start justify-between gap-1 mb-1.5">
                            <span className="text-[10px] text-muted-foreground">{p.sku}</span>
                            <span className={cn("text-[10px] font-semibold px-1.5 py-0.5 rounded-full shrink-0",
                              p.fulfillmentType === "dropship" ? "bg-violet-100 text-violet-700" : "bg-cyan-100 text-cyan-700"
                            )}>
                              {p.fulfillmentType === "dropship" ? "Drop" : "Inv"}
                            </span>
                          </div>
                          <p className="text-xs font-semibold leading-tight mb-2 line-clamp-2">{p.name}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold">₹{p.mrp.toLocaleString()}</span>
                            <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full font-medium",
                              p.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
                            )}>
                              {p.isActive ? "Active" : "Inactive"}
                            </span>
                          </div>
                          <p className="text-[10px] text-muted-foreground mt-1">{p.weightGrams}g · HSN {p.hsnCode}</p>
                        </div>
                      </div>
                    </StaggerItem>
                  ))}
                </div>
              </Stagger>
            ) : (
              <div className="border border-border rounded-xl overflow-hidden bg-background">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">SKU</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Name</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Category</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">HSN</th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground">MRP</th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground">Cost</th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground">Weight</th>
                      <th className="text-center py-3 px-4 text-xs font-medium text-muted-foreground">Type</th>
                      <th className="text-center py-3 px-4 text-xs font-medium text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(p => (
                      <tr key={p.id} className="border-b border-border/50 hover:bg-muted/20 cursor-pointer" onClick={() => setSelected(selected === p.id ? null : p.id)} data-testid={`row-product-${p.id}`}>
                        <td className="py-2.5 px-4 text-xs">{p.sku}</td>
                        <td className="py-2.5 px-4 text-xs font-medium">{p.name}</td>
                        <td className="py-2.5 px-4 text-xs text-muted-foreground">{p.category}</td>
                        <td className="py-2.5 px-4 text-xs text-muted-foreground">{p.hsnCode}</td>
                        <td className="py-2.5 px-4 text-right font-semibold text-xs">₹{p.mrp.toLocaleString()}</td>
                        <td className="py-2.5 px-4 text-right text-xs text-muted-foreground">₹{p.costPrice.toLocaleString()}</td>
                        <td className="py-2.5 px-4 text-right text-xs text-muted-foreground">{p.weightGrams}g</td>
                        <td className="py-2.5 px-4 text-center">
                          <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full", p.fulfillmentType === "dropship" ? "bg-violet-100 text-violet-700" : "bg-cyan-100 text-cyan-700")}>
                            {p.fulfillmentType}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-center">
                          <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full", p.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600")}>
                            {p.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {selectedProduct && (
            <div className="w-72 border border-border rounded-xl bg-background overflow-hidden shrink-0 self-start">
              <div className="flex items-center justify-between p-4 border-b border-border">
                <span className="text-sm font-semibold">Product Detail</span>
                <button onClick={() => setSelected(null)} data-testid="btn-close-detail"><X className="size-4 text-muted-foreground" /></button>
              </div>
              <div className="h-32 bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center text-4xl">
                {CATEGORY_EMOJI[selectedProduct.category] || "📦"}
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <p className="text-[10px] text-muted-foreground">{selectedProduct.sku}</p>
                  <p className="font-bold text-sm leading-tight mt-0.5">{selectedProduct.name}</p>
                  <p className="text-xs text-muted-foreground">{selectedProduct.brand}</p>
                </div>
                <div className="flex gap-1">
                  <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full",
                    selectedProduct.fulfillmentType === "dropship" ? "bg-violet-100 text-violet-700" : "bg-cyan-100 text-cyan-700"
                  )}>{selectedProduct.fulfillmentType}</span>
                  <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full",
                    selectedProduct.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
                  )}>{selectedProduct.isActive ? "Active" : "Inactive"}</span>
                </div>
                <div className="space-y-2">
                  {[
                    ["Category", selectedProduct.category],
                    ["HSN Code", selectedProduct.hsnCode],
                    ["MRP", `₹${selectedProduct.mrp.toLocaleString()}`],
                    ["Cost Price", `₹${selectedProduct.costPrice.toLocaleString()}`],
                    ["Weight", `${selectedProduct.weightGrams} g`],
                    ["Dimensions", `${selectedProduct.dimensions.l}×${selectedProduct.dimensions.w}×${selectedProduct.dimensions.h} cm`],
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between">
                      <span className="text-xs text-muted-foreground">{label}</span>
                      <span className="text-xs font-medium">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
