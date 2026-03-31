import { useState, useMemo } from "react";
import { useEtsSidebar } from "@/components/layout/ets-subnav-sidebar";
import { Plus, Minus, Trash2, Wand2, ShoppingBag, IndianRupee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  ETS_PORTAL_COLOR,
  SETUP_ITEMS,
  SETUP_ITEM_GROUPS,
  getRecommendedQty,
  type SetupItem,
  type SetupItemGroup,
} from "@/lib/mock-data-portal-ets";
import { useEtsStoreSize } from "@/lib/use-ets-store-size";

interface BOQEntry {
  item: SetupItem;
  quantity: number;
}

function priceMidpoint(item: SetupItem) {
  return Math.round((item.priceRangeMin + item.priceRangeMax) / 2);
}

function formatINR(n: number) {
  return "\u20B9" + n.toLocaleString("en-IN");
}

export default function EtsBOQBuilder() {
  const inSidebar = useEtsSidebar();
  const { storeSize } = useEtsStoreSize();
  const { toast } = useToast();
  const [boq, setBoq] = useState<BOQEntry[]>([]);
  const [activeGroup, setActiveGroup] = useState<SetupItemGroup | "All">("All");

  const catalogFiltered = useMemo(() => {
    return SETUP_ITEMS.filter(
      (item) => activeGroup === "All" || item.group === activeGroup
    );
  }, [activeGroup]);

  const boqMap = useMemo(() => {
    const m: Record<string, number> = {};
    for (const e of boq) m[e.item.id] = e.quantity;
    return m;
  }, [boq]);

  const total = useMemo(
    () => boq.reduce((sum, e) => sum + priceMidpoint(e.item) * e.quantity, 0),
    [boq]
  );

  function addItem(item: SetupItem) {
    setBoq((prev) => {
      const existing = prev.find((e) => e.item.id === item.id);
      if (existing) {
        return prev.map((e) =>
          e.item.id === item.id ? { ...e, quantity: e.quantity + 1 } : e
        );
      }
      return [...prev, { item, quantity: 1 }];
    });
  }

  function removeItem(itemId: string) {
    setBoq((prev) => prev.filter((e) => e.item.id !== itemId));
  }

  function adjustQty(itemId: string, delta: number) {
    setBoq((prev) =>
      prev
        .map((e) =>
          e.item.id === itemId ? { ...e, quantity: Math.max(0, e.quantity + delta) } : e
        )
        .filter((e) => e.quantity > 0)
    );
  }

  function useRecommended() {
    const essentials = SETUP_ITEMS.filter((i) => i.isEssential);
    const entries: BOQEntry[] = essentials.map((item) => ({
      item,
      quantity: getRecommendedQty(item, storeSize),
    }));
    setBoq(entries);
    toast({
      title: "BOQ Auto-filled",
      description: `${entries.length} essential items added at recommended quantities for ${storeSize} sq ft.`,
    });
  }

  function clearBOQ() {
    setBoq([]);
  }

  return (
    <div className={inSidebar ? "p-5 space-y-5" : "px-16 lg:px-24 py-6 space-y-6"} data-testid="ets-boq-builder">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading" data-testid="text-boq-title">BOQ Builder</h1>
          <p className="text-muted-foreground">Build your Bill of Quantities — add items, adjust quantities, and estimate costs.</p>
        </div>
        <Button
          onClick={useRecommended}
          className="text-white gap-2 self-start md:self-auto"
          style={{ backgroundColor: ETS_PORTAL_COLOR }}
          data-testid="button-use-recommended"
        >
          <Wand2 className="h-4 w-4" />
          Use Recommended ({storeSize} sq ft)
        </Button>
      </div>

      <div className="grid lg:grid-cols-[1fr_380px] gap-6">
        <div className="space-y-4">
          <div className="flex gap-2 flex-wrap">
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
                data-testid={`catalog-tab-${group.toLowerCase().replace(/\s+/g, "-").replace(/[&]/g, "and")}`}
              >
                {group}
              </button>
            ))}
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            {catalogFiltered.map((item) => {
              const inBoq = !!boqMap[item.id];
              return (
                <Card
                  key={item.id}
                  className={cn(
                    "rounded-xl border transition-shadow hover:shadow-md",
                    inBoq ? "border-orange-300 bg-orange-50/40" : "bg-card"
                  )}
                  data-testid={`catalog-card-${item.id}`}
                >
                  <CardContent className="p-3 flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                        <p className="text-sm font-medium leading-snug" data-testid={`catalog-name-${item.id}`}>{item.name}</p>
                        {item.isEssential && (
                          <Badge className="text-white border-0 text-[10px] py-0" style={{ backgroundColor: ETS_PORTAL_COLOR }}>
                            Essential
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-1">{item.description}</p>
                      <p className="text-xs font-semibold mt-1" style={{ color: ETS_PORTAL_COLOR }}>
                        {"\u20B9"}{item.priceRangeMin.toLocaleString("en-IN")} – {"\u20B9"}{item.priceRangeMax.toLocaleString("en-IN")}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant={inBoq ? "secondary" : "outline"}
                      className="shrink-0 text-xs h-7 px-2"
                      onClick={() => addItem(item)}
                      data-testid={`button-add-boq-${item.id}`}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      {inBoq ? "Add More" : "Add"}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          <Card className="rounded-xl border bg-card sticky top-6" data-testid="boq-summary-card">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Your BOQ</CardTitle>
                  <CardDescription>{boq.length} line items</CardDescription>
                </div>
                {boq.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive text-xs"
                    onClick={clearBOQ}
                    data-testid="button-clear-boq"
                  >
                    Clear All
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-2 pb-3">
              {boq.length === 0 ? (
                <div className="py-8 flex flex-col items-center text-center gap-2">
                  <ShoppingBag className="h-8 w-8 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">No items added yet.</p>
                  <p className="text-xs text-muted-foreground">Click "Add" on catalog items or use "Use Recommended".</p>
                </div>
              ) : (
                boq.map((entry) => (
                  <div key={entry.item.id} className="flex items-center gap-2 py-2 border-b last:border-0" data-testid={`boq-row-${entry.item.id}`}>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{entry.item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {entry.quantity} × {formatINR(priceMidpoint(entry.item))} = {formatINR(priceMidpoint(entry.item) * entry.quantity)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        className="h-6 w-6 rounded border flex items-center justify-center hover:bg-muted transition-colors"
                        onClick={() => adjustQty(entry.item.id, -1)}
                        data-testid={`button-decrease-${entry.item.id}`}
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="text-xs font-semibold w-5 text-center" data-testid={`qty-value-${entry.item.id}`}>{entry.quantity}</span>
                      <button
                        className="h-6 w-6 rounded border flex items-center justify-center hover:bg-muted transition-colors"
                        onClick={() => adjustQty(entry.item.id, 1)}
                        data-testid={`button-increase-${entry.item.id}`}
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                      <button
                        className="h-6 w-6 rounded border flex items-center justify-center hover:bg-red-50 hover:text-red-600 transition-colors ml-1"
                        onClick={() => removeItem(entry.item.id)}
                        data-testid={`button-remove-${entry.item.id}`}
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
            {boq.length > 0 && (
              <>
                <Separator />
                <div className="p-4 space-y-1">
                  <div className="flex items-center justify-between text-sm font-semibold">
                    <span className="flex items-center gap-1">
                      <IndianRupee className="h-4 w-4" /> Estimated Total
                    </span>
                    <span style={{ color: ETS_PORTAL_COLOR }} data-testid="text-boq-total">{formatINR(total)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Based on midpoint of price ranges. Actual costs may vary.</p>
                </div>
              </>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
