import { useState } from "react";
import { useEtsSidebar } from "@/components/layout/ets-subnav-sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ETS_PORTAL_COLOR } from "@/lib/mock-data-portal-ets";
import { useEtsStoreSize } from "@/lib/use-ets-store-size";

type StoreSize = 500 | 800 | 1000;

interface Zone {
  id: string;
  label: string;
  purpose: string;
  approxDimensions: string;
  categories: string;
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
}

const ZONES_1000: Zone[] = [
  { id: "entrance", label: "Entrance & Feature Wall", purpose: "First impression, hero products", approxDimensions: "4m × 3m", categories: "Seasonal, Trending, New Arrivals", x: 30, y: 10, w: 240, h: 70, color: "#FED7AA" },
  { id: "gondola-a", label: "Gondola Aisle A", purpose: "High-turnover everyday products", approxDimensions: "6m × 1.2m", categories: "Electronics, Accessories, Gadgets", x: 30, y: 100, w: 100, h: 200, color: "#E0F2FE" },
  { id: "gondola-b", label: "Gondola Aisle B", purpose: "Mid-range lifestyle products", approxDimensions: "6m × 1.2m", categories: "Home Decor, Gifting, Wellness", x: 170, y: 100, w: 100, h: 200, color: "#E0F2FE" },
  { id: "wall-left", label: "Left Wall Shelving", purpose: "Category deep-dive & stacking", approxDimensions: "8m × 0.5m", categories: "Fashion, Bags, Footwear", x: 10, y: 100, w: 20, h: 220, color: "#D1FAE5" },
  { id: "wall-right", label: "Right Wall Shelving", purpose: "Category deep-dive & stacking", approxDimensions: "8m × 0.5m", categories: "Beauty, Personal Care, Health", x: 270, y: 100, w: 20, h: 220, color: "#D1FAE5" },
  { id: "checkout", label: "Checkout Counter", purpose: "Billing, impulse buys, staff zone", approxDimensions: "3m × 1.5m", categories: "Impulse Items, Loyalty Cards, Bags", x: 30, y: 310, w: 240, h: 55, color: "#FEF9C3" },
  { id: "backroom", label: "Backroom / Stock Area", purpose: "Inventory storage, staff break area", approxDimensions: "4m × 3m", categories: "Reserve Stock, Supplies, Admin", x: 220, y: 10, w: 70, h: 70, color: "#F3F4F6" },
];

const ZONES_800: Zone[] = [
  { id: "entrance", label: "Entrance & Feature Wall", purpose: "First impression, hero products", approxDimensions: "3m × 2.5m", categories: "Seasonal, Trending, New Arrivals", x: 30, y: 10, w: 200, h: 60, color: "#FED7AA" },
  { id: "gondola-a", label: "Gondola Aisle A", purpose: "High-turnover everyday products", approxDimensions: "5m × 1.2m", categories: "Electronics, Accessories, Gadgets", x: 30, y: 90, w: 85, h: 180, color: "#E0F2FE" },
  { id: "gondola-b", label: "Gondola Aisle B", purpose: "Mid-range lifestyle products", approxDimensions: "5m × 1.2m", categories: "Home Decor, Gifting, Wellness", x: 155, y: 90, w: 75, h: 180, color: "#E0F2FE" },
  { id: "wall-left", label: "Left Wall Shelving", purpose: "Category stacking", approxDimensions: "6m × 0.5m", categories: "Fashion, Bags", x: 10, y: 90, w: 20, h: 190, color: "#D1FAE5" },
  { id: "wall-right", label: "Right Wall Shelving", purpose: "Category stacking", approxDimensions: "6m × 0.5m", categories: "Beauty, Personal Care", x: 230, y: 90, w: 20, h: 190, color: "#D1FAE5" },
  { id: "checkout", label: "Checkout Counter", purpose: "Billing, impulse buys", approxDimensions: "2.5m × 1.5m", categories: "Impulse Items, Bags", x: 30, y: 280, w: 200, h: 48, color: "#FEF9C3" },
  { id: "backroom", label: "Backroom / Stock Area", purpose: "Inventory storage", approxDimensions: "3m × 2.5m", categories: "Reserve Stock, Supplies", x: 200, y: 10, w: 50, h: 60, color: "#F3F4F6" },
];

const ZONES_500: Zone[] = [
  { id: "entrance", label: "Entrance & Feature Wall", purpose: "First impression, hero products", approxDimensions: "2.5m × 2m", categories: "Seasonal, New Arrivals", x: 30, y: 10, w: 160, h: 50, color: "#FED7AA" },
  { id: "gondola-a", label: "Gondola Aisle", purpose: "Core product range", approxDimensions: "4m × 1.2m", categories: "Electronics, Accessories, Home Decor", x: 30, y: 80, w: 140, h: 160, color: "#E0F2FE" },
  { id: "wall-left", label: "Left Wall Shelving", purpose: "Category stacking", approxDimensions: "5m × 0.5m", categories: "Fashion, Bags", x: 10, y: 80, w: 18, h: 170, color: "#D1FAE5" },
  { id: "wall-right", label: "Right Wall Shelving", purpose: "Beauty & personal care", approxDimensions: "5m × 0.5m", categories: "Beauty, Personal Care", x: 172, y: 80, w: 18, h: 170, color: "#D1FAE5" },
  { id: "checkout", label: "Checkout Counter", purpose: "Billing, impulse buys", approxDimensions: "2m × 1.2m", categories: "Impulse Items, Bags", x: 30, y: 248, w: 160, h: 42, color: "#FEF9C3" },
  { id: "backroom", label: "Backroom / Stock", purpose: "Storage & admin", approxDimensions: "2m × 2m", categories: "Reserve Stock", x: 170, y: 10, w: 20, h: 50, color: "#F3F4F6" },
];

const STORE_ZONE_MAP: Record<StoreSize, Zone[]> = {
  500: ZONES_500,
  800: ZONES_800,
  1000: ZONES_1000,
};

const SVG_W = 300;
const SVG_H = 380;

function FloorPlan({ zones, size }: { zones: Zone[]; size: StoreSize }) {
  const [hoveredZone, setHoveredZone] = useState<string | null>(null);

  return (
    <div className="space-y-1">
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        className="w-full border rounded-xl bg-white"
        style={{ maxHeight: 400 }}
        aria-label={`Floor plan for ${size} sq ft store`}
        data-testid="svg-floor-plan"
      >
        <rect x={0} y={0} width={SVG_W} height={SVG_H} fill="#F9FAFB" />
        <rect x={8} y={8} width={SVG_W - 16} height={SVG_H - 16} fill="none" stroke="#D1D5DB" strokeWidth={1.5} strokeDasharray="6 3" rx={4} />

        {zones.map((zone) => (
          <g
            key={zone.id}
            onMouseEnter={() => setHoveredZone(zone.id)}
            onMouseLeave={() => setHoveredZone(null)}
            style={{ cursor: "pointer" }}
          >
            <rect
              x={zone.x}
              y={zone.y}
              width={zone.w}
              height={zone.h}
              fill={zone.color}
              stroke={hoveredZone === zone.id ? ETS_PORTAL_COLOR : "#CBD5E1"}
              strokeWidth={hoveredZone === zone.id ? 2 : 1}
              rx={4}
            />
            <foreignObject x={zone.x + 4} y={zone.y + 4} width={zone.w - 8} height={zone.h - 8}>
              <div
                style={{
                  fontSize: zone.w < 40 ? "6px" : zone.w < 60 ? "7px" : "8px",
                  fontWeight: 600,
                  color: "#374151",
                  lineHeight: 1.3,
                  overflow: "hidden",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                }}
              >
                {zone.label}
              </div>
            </foreignObject>
          </g>
        ))}

        <text x={SVG_W / 2} y={SVG_H - 8} textAnchor="middle" fill="#9CA3AF" fontSize={9} fontFamily="sans-serif">
          {size} sq ft floor plan (not to scale)
        </text>
      </svg>
      {hoveredZone && (() => {
        const z = zones.find((z) => z.id === hoveredZone);
        if (!z) return null;
        return (
          <div className="p-3 rounded-lg border bg-muted/50 text-xs space-y-1 transition-all" data-testid="zone-tooltip">
            <p className="font-semibold text-sm text-foreground">{z.label}</p>
            <p className="text-muted-foreground">{z.purpose}</p>
            <p><span className="font-medium">Dimensions:</span> {z.approxDimensions}</p>
            <p><span className="font-medium">Categories:</span> {z.categories}</p>
          </div>
        );
      })()}
    </div>
  );
}

const ZONE_COLORS: Record<string, { bg: string; label: string }> = {
  "#FED7AA": { bg: "bg-orange-100", label: "Entrance / Feature Wall" },
  "#E0F2FE": { bg: "bg-sky-100", label: "Gondola Aisle" },
  "#D1FAE5": { bg: "bg-emerald-100", label: "Wall Shelving" },
  "#FEF9C3": { bg: "bg-yellow-100", label: "Checkout Counter" },
  "#F3F4F6": { bg: "bg-gray-100", label: "Backroom / Stock" },
};

export default function EtsLayoutGuide() {
  const inSidebar = useEtsSidebar();
  const { storeSize: partnerSize } = useEtsStoreSize();
  const [selectedSize, setSelectedSize] = useState<StoreSize | null>(null);

  const activeSize: StoreSize = selectedSize ?? partnerSize;
  const zones = STORE_ZONE_MAP[activeSize];

  return (
    <div className={inSidebar ? "p-5 space-y-5" : "px-16 lg:px-24 py-6 space-y-6"} data-testid="ets-layout-guide">
      <div>
        <h1 className="text-2xl font-bold font-heading" data-testid="text-layout-title">Store Layout Guide</h1>
        <p className="text-muted-foreground">Reference floor plans for 3 store sizes with labeled zones. Hover a zone to see details.</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-2 flex-wrap" data-testid="size-selector">
          {([500, 800, 1000] as StoreSize[]).map((size) => (
            <button
              key={size}
              onClick={() => setSelectedSize(size)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium border transition-colors",
                activeSize === size
                  ? "text-white border-transparent"
                  : "bg-background border-border text-muted-foreground hover:bg-muted"
              )}
              style={activeSize === size ? { backgroundColor: ETS_PORTAL_COLOR, borderColor: ETS_PORTAL_COLOR } : {}}
              data-testid={`size-btn-${size}`}
            >
              {size} sq ft{size === partnerSize && selectedSize === null ? " (your store)" : ""}
            </button>
          ))}
        </div>
        {selectedSize !== null && selectedSize !== partnerSize && (
          <button
            className="text-xs text-muted-foreground underline hover:text-foreground"
            onClick={() => setSelectedSize(null)}
            data-testid="button-reset-size"
          >
            Back to my store ({partnerSize} sq ft)
          </button>
        )}
      </div>

      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-4">
          <FloorPlan zones={zones} size={activeSize} />
        </div>

        <div className="space-y-4">
          <Card className="rounded-xl border bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Zone Legend</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {Object.entries(ZONE_COLORS).map(([color, { bg, label }]) => (
                <div key={color} className="flex items-center gap-2 text-sm">
                  <div className={cn("h-4 w-4 rounded border border-gray-200", bg)} />
                  <span>{label}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="rounded-xl border bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Zone Details — {activeSize} sq ft</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {zones.map((zone) => (
                <div key={zone.id} className="border rounded-lg p-3 space-y-1" data-testid={`zone-detail-${zone.id}`}>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold">{zone.label}</p>
                    <Badge variant="outline" className="text-[10px] shrink-0">{zone.approxDimensions}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{zone.purpose}</p>
                  <p className="text-xs"><span className="font-medium text-foreground">Products:</span> {zone.categories}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="rounded-xl border bg-muted/40">
        <CardContent className="p-4 text-xs text-muted-foreground">
          <p className="font-medium text-foreground mb-1">Note</p>
          Floor plans are illustrative reference guides only and are not to scale. Actual store dimensions, fixture placement, and zone boundaries will be finalized by your assigned store design architect based on the actual space.
        </CardContent>
      </Card>
    </div>
  );
}
