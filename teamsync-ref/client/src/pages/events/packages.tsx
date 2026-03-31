import { useState } from "react";
import { useLocation } from "wouter";
import { Star, Plus, ChevronRight, MapPin } from "lucide-react";
import { Fade, Stagger, StaggerItem } from "@/components/ui/animated";
import { Button } from "@/components/ui/button";
import { tourPackages, type PackageStatus } from "@/lib/mock-data-goyo";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { StatusBadge } from "@/components/ds/status-badge";
import { EVENTS_COLOR } from "@/lib/events-config";
import {
  PageShell,
  PageHeader,
  IndexToolbar,
} from "@/components/layout";


const formatCurrency = (val: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(val);


const destinationGradients: Record<string, string> = {
  "Hong Kong": "from-rose-500 to-pink-600",
  "Guangzhou": "from-pink-500 to-fuchsia-600",
  "Foshan": "from-amber-500 to-orange-600",
  "Yiwu": "from-violet-500 to-purple-600",
  "Wuxi": "from-emerald-500 to-teal-600",
  "default": "from-pink-500 to-rose-600",
};

function StarRating({ stars }: { stars: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: stars }).map((_, i) => (
        <Star key={i} className="size-3 fill-amber-400 text-amber-400" />
      ))}
    </div>
  );
}

export default function EventsPackages() {
  const [, navigate] = useLocation();
  const loading = useSimulatedLoading(650);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = tourPackages.filter((p) => {
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    const matchesSearch = search === "" || p.name.toLowerCase().includes(search.toLowerCase()) || p.destination.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const totalSeats = tourPackages.reduce((s, p) => s + p.seats_available, 0);
  const activeCount = tourPackages.filter((p) => p.status === "active").length;

  if (loading) {
    return (
      <PageShell>
        <div className="h-10 bg-muted rounded w-64 animate-pulse" />
        <div className="h-12 bg-muted rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-64 bg-muted rounded-2xl animate-pulse" />
          ))}
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <Fade>
        <PageHeader
          title="Tour Packages"
          subtitle={`${tourPackages.length} packages · ${activeCount} active · ${totalSeats} seats remaining`}
          actions={
            <Button
              className="gap-2 text-white"
              style={{ backgroundColor: EVENTS_COLOR }}
              data-testid="button-add-package"
            >
              <Plus className="size-4" />
              Add Package
            </Button>
          }
        />
      </Fade>

      <Fade>
        <IndexToolbar
          search={search}
          onSearch={setSearch}
          placeholder="Search packages or destinations..."
          color={EVENTS_COLOR}
          filters={[
            { value: "all", label: "All Packages" },
            { value: "active", label: "Active" },
            { value: "upcoming", label: "Upcoming" },
            { value: "sold_out", label: "Sold Out" },
          ]}
          activeFilter={statusFilter}
          onFilter={setStatusFilter}
        />
      </Fade>

      <Stagger staggerInterval={0.06} className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filtered.map((pkg) => {
          const sold = pkg.max_pax - pkg.seats_available;
          const pct = Math.round((sold / pkg.max_pax) * 100);
          const destKey = Object.keys(destinationGradients).find((k) => pkg.destination.includes(k)) || "default";
          const gradient = destinationGradients[destKey];
          

          return (
            <StaggerItem key={pkg.id}>
              <div
                className="rounded-2xl border border-border bg-card overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                data-testid={`card-package-${pkg.id}`}
              >
                <div className={`relative bg-gradient-to-br ${gradient} px-6 py-5`}>
                  <p className="text-white/80 text-xs font-medium mb-1 uppercase tracking-wider">{pkg.category}</p>
                  <p className="text-white font-bold text-lg leading-tight flex items-center gap-2">
                    <MapPin size={16} />
                    {pkg.destination}
                  </p>
                  <p className="text-white/70 text-xs mt-1 font-medium">{pkg.duration_days}D/{pkg.duration_nights}N</p>
                  {pkg.discount_percent && (
                    <div className="absolute top-4 right-4 rounded-full bg-amber-400 text-amber-900 px-2.5 py-1 text-[10px] font-bold shadow-sm">
                      {pkg.discount_percent}% OFF
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <h3 className="text-sm font-bold leading-tight" data-testid={`text-pkg-name-${pkg.id}`}>{pkg.name}</h3>
                    <StatusBadge status={pkg.status} />
                  </div>

                  <div className="flex items-center gap-3 mb-3">
                    <StarRating stars={pkg.hotel_stars} />
                    <span className="text-xs text-muted-foreground font-medium">{pkg.hotel_name}</span>
                  </div>

                  {pkg.start_date && (
                    <p className="text-[11px] font-medium text-muted-foreground mb-3 bg-muted/50 rounded-md px-2 py-1 inline-block">
                      {new Date(pkg.start_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      {pkg.end_date && ` — ${new Date(pkg.end_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`}
                    </p>
                  )}

                  <div className="mb-2">
                    {pkg.original_price_inr && (
                      <p className="text-[10px] text-muted-foreground line-through font-medium">{formatCurrency(pkg.original_price_inr)}</p>
                    )}
                    <div className="flex items-baseline gap-2">
                      <p className="text-2xl font-bold text-pink-600" data-testid={`text-price-${pkg.id}`}>
                        {formatCurrency(pkg.price_inr)}
                      </p>
                      <span className="text-[10px] text-muted-foreground font-medium">{pkg.price_note}</span>
                    </div>
                    <p className="text-[11px] text-green-600 font-bold mt-1 uppercase tracking-tight">Book with {formatCurrency(pkg.advance_amount)} advance</p>
                  </div>

                  <div className="my-4">
                    <div className="flex justify-between text-[10px] font-bold text-muted-foreground mb-1.5 uppercase tracking-wider">
                      <span>{sold}/{pkg.max_pax} booked</span>
                      <span data-testid={`text-seats-${pkg.id}`}>{pkg.seats_available} seats left</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-pink-500 transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4 border-t border-border">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-1.5 text-xs font-bold"
                      onClick={() => navigate(`/goyotours/packages/${pkg.id}`)}
                      data-testid={`btn-view-${pkg.id}`}
                    >
                      View Details <ChevronRight className="size-3" />
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 text-xs text-white font-bold"
                      style={{ backgroundColor: EVENTS_COLOR }}
                      onClick={() => navigate("/goyotours/bookings")}
                      data-testid={`btn-book-${pkg.id}`}
                    >
                      New Booking
                    </Button>
                  </div>
                </div>
              </div>
            </StaggerItem>
          );
        })}
      </Stagger>
    </PageShell>
  );
}
