import { useState, useMemo } from "react";
import { useEtsSidebar } from "@/components/layout/ets-subnav-sidebar";
import { Search, ExternalLink, Star, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  ETS_PORTAL_COLOR,
  SETUP_ITEMS,
  SETUP_ITEM_GROUPS,
  getRecommendedQty,
  type SetupItemGroup,
} from "@/lib/mock-data-portal-ets";
import { useEtsStoreSize } from "@/lib/use-ets-store-size";

function priceMidpoint(min: number, max: number) {
  return Math.round((min + max) / 2);
}

function formatINR(n: number) {
  return "\u20B9" + n.toLocaleString("en-IN");
}

export default function EtsSetupKit() {
  const inSidebar = useEtsSidebar();
  const { storeSize } = useEtsStoreSize();
  const [search, setSearch] = useState("");
  const [activeGroup, setActiveGroup] = useState<SetupItemGroup | "All">("All");
  const [essentialOnly, setEssentialOnly] = useState(false);

  const filtered = useMemo(() => {
    return SETUP_ITEMS.filter((item) => {
      const matchesGroup = activeGroup === "All" || item.group === activeGroup;
      const matchesSearch =
        !search ||
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.description.toLowerCase().includes(search.toLowerCase());
      const matchesEssential = !essentialOnly || item.isEssential;
      return matchesGroup && matchesSearch && matchesEssential;
    });
  }, [search, activeGroup, essentialOnly]);

  const grouped = useMemo(() => {
    if (activeGroup !== "All") {
      return { [activeGroup]: filtered };
    }
    const map: Record<string, typeof SETUP_ITEMS> = {};
    for (const item of filtered) {
      if (!map[item.group]) map[item.group] = [];
      map[item.group].push(item);
    }
    return map;
  }, [filtered, activeGroup]);

  return (
    <div className={inSidebar ? "p-5 space-y-5" : "px-16 lg:px-24 py-6 space-y-6"} data-testid="ets-setup-kit">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading" data-testid="text-setup-kit-title">Store Setup Kit</h1>
          <p className="text-muted-foreground">
            Browse fixtures, hardware, and infrastructure items for your store setup.{" "}
            <span className="font-medium text-foreground" data-testid="text-store-size-label">Quantities shown for {storeSize} sq ft.</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-sm" data-testid="badge-item-count">
            {filtered.length} items
          </Badge>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            data-testid="input-search-setup"
          />
        </div>
        <Button
          variant={essentialOnly ? "default" : "outline"}
          size="sm"
          className={cn(essentialOnly ? "text-white" : "")}
          style={essentialOnly ? { backgroundColor: ETS_PORTAL_COLOR } : {}}
          onClick={() => setEssentialOnly(!essentialOnly)}
          data-testid="button-filter-essential"
        >
          <Star className="h-3.5 w-3.5 mr-1.5" />
          Essential Only
        </Button>
      </div>

      <div className="flex gap-2 flex-wrap" data-testid="group-filter-tabs">
        {(["All", ...SETUP_ITEM_GROUPS] as const).map((group) => (
          <button
            key={group}
            onClick={() => setActiveGroup(group as SetupItemGroup | "All")}
            className={cn(
              "px-3 py-1.5 rounded-full text-sm font-medium border transition-colors",
              activeGroup === group
                ? "text-white border-transparent"
                : "bg-background border-border text-muted-foreground hover:bg-muted"
            )}
            style={activeGroup === group ? { backgroundColor: ETS_PORTAL_COLOR, borderColor: ETS_PORTAL_COLOR } : {}}
            data-testid={`tab-group-${group.toLowerCase().replace(/\s+/g, "-").replace(/[&]/g, "and")}`}
          >
            {group}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card className="rounded-xl border bg-card">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <ShoppingBag className="h-10 w-10 text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Items Found</h3>
            <p className="text-muted-foreground text-sm">Try adjusting your search or filter.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([group, items]) => (
            <div key={group}>
              <h2 className="text-base font-semibold text-foreground mb-3" data-testid={`heading-group-${group}`}>{group}</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((item) => (
                  <Card
                    key={item.id}
                    className="rounded-xl border bg-card hover:shadow-md transition-shadow"
                    data-testid={`card-setup-item-${item.id}`}
                  >
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="font-semibold text-sm leading-snug" data-testid={`text-item-name-${item.id}`}>{item.name}</p>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.description}</p>
                        </div>
                        {item.isEssential ? (
                          <Badge
                            className="shrink-0 text-white border-0 text-[10px]"
                            style={{ backgroundColor: ETS_PORTAL_COLOR }}
                            data-testid={`badge-essential-${item.id}`}
                          >
                            Essential
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="shrink-0 text-[10px]" data-testid={`badge-recommended-${item.id}`}>
                            Recommended
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-xs text-muted-foreground border-t pt-2">
                        <span>Rec. qty ({storeSize} sq ft)</span>
                        <span className="font-semibold text-foreground" data-testid={`text-qty-${item.id}`}>{getRecommendedQty(item, storeSize)}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-muted-foreground">Price Range</p>
                          <p className="text-sm font-bold" style={{ color: ETS_PORTAL_COLOR }} data-testid={`text-price-${item.id}`}>
                            {formatINR(item.priceRangeMin)} – {formatINR(item.priceRangeMax)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Midpoint: {formatINR(priceMidpoint(item.priceRangeMin, item.priceRangeMax))}
                          </p>
                        </div>
                        {item.buyLink && (
                          <a
                            href={item.buyLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            data-testid={`link-buy-${item.id}`}
                          >
                            <Button variant="outline" size="sm" className="gap-1 text-xs">
                              <ExternalLink className="h-3 w-3" /> Buy
                            </Button>
                          </a>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
