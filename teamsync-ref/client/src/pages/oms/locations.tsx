import { PageTransition, Stagger, StaggerItem, Fade } from "@/components/ui/animated";
import { useState, useMemo, Fragment } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { Button } from "@/components/ui/button";
import { omsLocations, omsInventory } from "@/lib/mock-data-oms";
import { cn } from "@/lib/utils";
import { PageShell } from "@/components/layout";

const TYPE_STYLES: Record<string, string> = {
  rack: "bg-blue-100 text-blue-700",
  shelf: "bg-cyan-100 text-cyan-700",
  bin: "bg-violet-100 text-violet-700",
  zone: "bg-slate-100 text-slate-600",
};

function UtilBar({ pct }: { pct: number }) {
  const color = pct >= 80 ? "bg-red-500" : pct >= 50 ? "bg-amber-500" : "bg-emerald-500";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
        <div className={cn("h-full rounded-full", color)} style={{ width: `${Math.min(pct, 100)}%` }} />
      </div>
      <span className={cn("text-[10px] font-semibold w-8 text-right", pct >= 80 ? "text-red-600" : pct >= 50 ? "text-amber-600" : "text-emerald-600")}>{pct}%</span>
    </div>
  );
}

export default function OmsLocations() {
  const loading = useSimulatedLoading(600);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);

  const zones = useMemo(() => {
    const z: Record<string, typeof omsLocations> = {};
    for (const loc of omsLocations) {
      z[loc.zone] = [...(z[loc.zone] || []), loc];
    }
    return z;
  }, []);

  const zoneStats = useMemo(() =>
    Object.entries(zones).map(([zone, locs]) => ({
      zone,
      count: locs.length,
      totalCap: locs.reduce((s, l) => s + l.capacityUnits, 0),
      totalCurrent: locs.reduce((s, l) => s + l.currentUnits, 0),
    })).map(z => ({ ...z, utilPct: Math.round((z.totalCurrent / z.totalCap) * 100) })),
  [zones]);

  const locationInventory = useMemo(() => {
    if (!selectedLocation) return [];
    return omsInventory.filter(i => i.locationId === selectedLocation);
  }, [selectedLocation]);

  if (loading) {
    return (
      <PageShell>
        <div className="h-14 w-72 bg-muted rounded-lg" />
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-muted rounded-xl" />)}
        </div>
        <div className="h-96 bg-muted rounded-xl" />
      </PageShell>
    );
  }

  return (
    <PageTransition>
      <div className="px-16 py-6 lg:px-24 space-y-5">
        <Fade>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold" data-testid="locations-heading">Storage Locations</h1>
              <p className="text-sm text-muted-foreground mt-0.5">{omsLocations.length} storage locations across 4 warehouse zones</p>
            </div>
            <Button style={{ backgroundColor: "#0891B2" }} className="text-white hover:opacity-90" data-testid="btn-add-location">
              + Add Location
            </Button>
          </div>
        </Fade>

        <Stagger>
          <div className="grid grid-cols-4 gap-4">
            {zoneStats.map(z => (
              <StaggerItem key={z.zone}>
                <div className="border border-border rounded-xl p-4 bg-background" data-testid={`card-zone-${z.zone}`}>
                  <p className="font-semibold text-sm mb-3">{z.zone}</p>
                  <div className="space-y-1.5 text-xs mb-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Locations</span>
                      <span className="font-medium">{z.count}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Capacity</span>
                      <span className="font-medium">{z.totalCap.toLocaleString()} units</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">In Use</span>
                      <span className="font-medium">{z.totalCurrent.toLocaleString()} units</span>
                    </div>
                  </div>
                  <UtilBar pct={z.utilPct} />
                </div>
              </StaggerItem>
            ))}
          </div>
        </Stagger>

        <Fade>
          <div className="border border-border rounded-xl overflow-hidden bg-background">
            <div className="p-4 border-b border-border">
              <p className="text-sm font-semibold">All Locations</p>
              <p className="text-xs text-muted-foreground mt-0.5">Click a row to see stored inventory</p>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="w-6 py-3 px-2" />
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Code</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Name</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Zone</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Type</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground">Capacity</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground">Current</th>
                  <th className="py-3 px-4 text-xs font-medium text-muted-foreground">Utilization</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground">SKUs Stored</th>
                </tr>
              </thead>
              <tbody>
                {omsLocations.map(loc => {
                  const utilPct = Math.round((loc.currentUnits / loc.capacityUnits) * 100);
                  const storedSkus = omsInventory.filter(i => i.locationId === loc.id).length;
                  const isSelected = selectedLocation === loc.id;
                  return (
                    <Fragment key={loc.id}>
                      <tr
                        className={cn("border-b border-border/50 hover:bg-muted/20 cursor-pointer", isSelected && "bg-cyan-50")}
                        onClick={() => setSelectedLocation(isSelected ? null : loc.id)}
                        data-testid={`row-location-${loc.id}`}
                      >
                        <td className="py-2.5 px-2 text-center">
                          {isSelected ? <ChevronDown className="size-3.5 text-muted-foreground" /> : <ChevronRight className="size-3.5 text-muted-foreground" />}
                        </td>
                        <td className="py-2.5 px-4 text-xs font-semibold text-cyan-700">{loc.code}</td>
                        <td className="py-2.5 px-4 text-xs font-medium">{loc.name}</td>
                        <td className="py-2.5 px-4 text-xs text-muted-foreground">{loc.zone}</td>
                        <td className="py-2.5 px-4">
                          <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize", TYPE_STYLES[loc.type])}>{loc.type}</span>
                        </td>
                        <td className="py-2.5 px-4 text-right text-xs">{loc.capacityUnits}</td>
                        <td className="py-2.5 px-4 text-right text-xs font-semibold">{loc.currentUnits}</td>
                        <td className="py-2.5 px-4 w-40"><UtilBar pct={utilPct} /></td>
                        <td className="py-2.5 px-4 text-right text-xs font-semibold text-cyan-700">{storedSkus}</td>
                      </tr>
                      {isSelected && locationInventory.length > 0 && (
                        <tr key={`${loc.id}-inv`} className="bg-cyan-50/50">
                          <td colSpan={9} className="px-6 py-3">
                            <p className="text-xs font-semibold text-muted-foreground mb-2">STORED AT {loc.code}</p>
                            <div className="grid grid-cols-4 gap-2">
                              {locationInventory.map(inv => (
                                <div key={inv.id} className="border border-cyan-200 rounded-lg p-2.5 bg-white">
                                  <p className="text-[10px] text-muted-foreground">{inv.sku}</p>
                                  <p className="text-xs font-medium leading-tight">{inv.productName}</p>
                                  <div className="flex justify-between mt-1">
                                    <span className="text-[10px] text-muted-foreground">On Hand</span>
                                    <span className="text-[10px] font-semibold">{inv.qtyOnHand} units</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Fade>
      </div>
    </PageTransition>
  );
}
