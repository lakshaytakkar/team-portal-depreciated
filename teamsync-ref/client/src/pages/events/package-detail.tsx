import { useLocation } from "wouter";
import { ArrowLeft, Star, Check, X, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { DataTable, type Column } from "@/components/ds/data-table";
import { StatusBadge } from "@/components/ds/status-badge";
import { tourPackages, bookings, type Booking } from "@/lib/mock-data-goyo";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { PageTransition, Fade } from "@/components/ui/animated";
import { useToast } from "@/hooks/use-toast";
import { PageShell } from "@/components/layout";
import { PersonCell } from "@/components/ui/avatar-cells";

const formatCurrency = (val: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(val);

const paymentBadge: Record<string, "success" | "warning" | "error" | "neutral"> = {
  full: "success",
  partial: "warning",
  pending: "error",
  refunded: "neutral",
};

const bookingColumns: Column<Booking>[] = [
  { key: "client_name", header: "Client", sortable: true, render: (item) => <PersonCell name={item.client_name} size="sm" /> },
  { key: "passengers", header: "Pax", sortable: true },
  { key: "travel_date", header: "Travel Date", sortable: true, render: (item) => new Date(item.travel_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) },
  { key: "advance_paid", header: "Advance", sortable: true, render: (item) => formatCurrency(item.advance_paid) },
  { key: "balance_due", header: "Balance", sortable: true, render: (item) => <span className={item.balance_due > 0 ? "text-amber-600 font-medium" : "text-green-600"}>{formatCurrency(item.balance_due)}</span> },
  { key: "payment_status", header: "Payment", render: (item) => <StatusBadge status={item.payment_status} variant={paymentBadge[item.payment_status]} /> },
  { key: "visa_status", header: "Visa", render: (item) => <StatusBadge status={item.visa_status} variant={item.visa_status === "approved" ? "success" : item.visa_status === "rejected" ? "error" : "neutral"} /> },
];

export default function PackageDetail() {
  const [location, navigate] = useLocation();
  const loading = useSimulatedLoading(600);
  const { toast } = useToast();

  const id = location.split("/").pop();
  const pkg = tourPackages.find((p) => p.id === id || p.slug === id);

  if (!loading && !pkg) {
    return (
      <PageShell>
        <Button variant="ghost" size="sm" onClick={() => navigate("/goyotours/packages")} className="gap-2 mb-4">
          <ArrowLeft className="size-4" /> Back to Packages
        </Button>
        <p className="text-muted-foreground">Package not found.</p>
      </PageShell>
    );
  }

  const pkgBookings = pkg ? bookings.filter((b) => b.package_id === pkg.id) : [];
  const sold = pkg ? pkg.max_pax - pkg.seats_available : 0;
  const pct = pkg ? Math.round((sold / pkg.max_pax) * 100) : 0;

  const copyBrochureLink = () => {
    navigator.clipboard.writeText(`https://suprans.in/travel/${pkg?.slug}`);
    toast({ title: "Brochure link copied!", description: `suprans.in/travel/${pkg?.slug}` });
  };

  if (loading) {
    return (
      <PageShell>
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="grid grid-cols-5 gap-6">
          <div className="col-span-3 flex flex-col gap-4">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>
          <div className="col-span-2">
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <PageTransition>
        <Fade direction="up" delay={0}>
          <div className="mb-5 flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate("/goyotours/packages")} className="gap-2" data-testid="btn-back">
              <ArrowLeft className="size-4" /> Back
            </Button>
            <div className="flex items-center gap-2 flex-1">
              <h1 className="text-xl font-bold font-heading" data-testid="pkg-detail-title">{pkg!.name}</h1>
              <span className="text-sm text-muted-foreground">{pkg!.destination}</span>
              <span className="rounded-full px-2 py-0.5 text-xs font-medium bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400">{pkg!.category}</span>
            </div>
          </div>
        </Fade>

        <div className="grid grid-cols-5 gap-6 mb-8">
          <div className="col-span-3 flex flex-col gap-6">
            <Fade direction="up" delay={0.05}>
              <div className="rounded-xl border border-border bg-card p-5">
                <h2 className="text-sm font-semibold font-heading mb-4" data-testid="text-itinerary-title">Day-by-Day Itinerary</h2>
                <div className="flex flex-col gap-3">
                  {pkg!.itinerary.map((day) => (
                    <div key={day.day} className="flex gap-3" data-testid={`itinerary-day-${day.day}`}>
                      <div className="flex-shrink-0 size-7 rounded-full bg-pink-500 text-white text-xs font-bold flex items-center justify-center">
                        {day.day}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{day.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{day.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Fade>

            <Fade direction="up" delay={0.1}>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl border border-border bg-card p-5">
                  <h2 className="text-sm font-semibold font-heading mb-3 text-green-600">Inclusions</h2>
                  <div className="flex flex-col gap-1.5">
                    {pkg!.inclusions.map((item, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs" data-testid={`inclusion-${i}`}>
                        <Check className="size-3.5 text-green-500 mt-0.5 shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-xl border border-border bg-card p-5">
                  <h2 className="text-sm font-semibold font-heading mb-3 text-red-500">Exclusions</h2>
                  <div className="flex flex-col gap-1.5">
                    {pkg!.exclusions.map((item, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs" data-testid={`exclusion-${i}`}>
                        <X className="size-3.5 text-red-400 mt-0.5 shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Fade>
          </div>

          <div className="col-span-2 flex flex-col gap-4">
            <Fade direction="up" delay={0.08}>
              <div className="rounded-xl border border-pink-200 bg-pink-50 dark:bg-pink-950/20 dark:border-pink-900 p-5">
                <h2 className="text-sm font-semibold font-heading mb-4 text-pink-700 dark:text-pink-400">Pricing</h2>
                {pkg!.original_price_inr && (
                  <p className="text-sm text-muted-foreground line-through">{formatCurrency(pkg!.original_price_inr)}</p>
                )}
                <p className="text-3xl font-bold text-pink-600 mb-1" data-testid="detail-price">{formatCurrency(pkg!.price_inr)}</p>
                <p className="text-xs text-muted-foreground mb-3">{pkg!.price_note}</p>
                {pkg!.discount_percent && (
                  <Badge className="bg-amber-400 text-amber-900 hover:bg-amber-400 mb-3">{pkg!.discount_percent}% Discount Applied</Badge>
                )}
                <div className="rounded-lg bg-white dark:bg-pink-950/40 p-3 mb-4 text-xs">
                  <div className="flex justify-between mb-1">
                    <span className="text-muted-foreground">Base price</span>
                    <span>{formatCurrency(pkg!.price_inr)}</span>
                  </div>
                  <div className="flex justify-between mb-1">
                    <span className="text-muted-foreground">GST (5%)</span>
                    <span>{formatCurrency(Math.round(pkg!.price_inr * 0.05))}</span>
                  </div>
                  <div className="flex justify-between border-t pt-1 mt-1 font-semibold">
                    <span>Total (approx)</span>
                    <span>{formatCurrency(Math.round(pkg!.price_inr * 1.1))}</span>
                  </div>
                </div>
                <div className="rounded-lg bg-green-50 dark:bg-green-950/30 p-3 mb-4 text-xs">
                  <p className="font-medium text-green-700 dark:text-green-400">Book now with just</p>
                  <p className="text-xl font-bold text-green-600">{formatCurrency(pkg!.advance_amount)}</p>
                  <p className="text-muted-foreground">Balance payable before travel</p>
                </div>
                <Button
                  className="w-full text-white mb-2"
                  style={{ backgroundColor: "#E91E63" }}
                  onClick={() => navigate("/goyotours/bookings")}
                  data-testid="btn-create-booking"
                >
                  Create Booking
                </Button>
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={copyBrochureLink}
                  data-testid="btn-copy-brochure"
                >
                  <Copy className="size-3.5" /> Copy Brochure Link
                </Button>
              </div>
            </Fade>

            <Fade direction="up" delay={0.12}>
              <div className="rounded-xl border border-border bg-card p-5">
                <h2 className="text-sm font-semibold font-heading mb-3">Capacity</h2>
                <div className="flex gap-3 mb-3 text-center">
                  <div className="flex-1 rounded-lg bg-muted p-2">
                    <p className="text-lg font-bold">{pkg!.max_pax}</p>
                    <p className="text-xs text-muted-foreground">Max Pax</p>
                  </div>
                  <div className="flex-1 rounded-lg bg-muted p-2">
                    <p className="text-lg font-bold text-pink-600">{sold}</p>
                    <p className="text-xs text-muted-foreground">Booked</p>
                  </div>
                  <div className="flex-1 rounded-lg bg-muted p-2">
                    <p className="text-lg font-bold text-green-600">{pkg!.seats_available}</p>
                    <p className="text-xs text-muted-foreground">Available</p>
                  </div>
                </div>
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full bg-pink-500" style={{ width: `${pct}%` }} />
                </div>
                <p className="text-xs text-muted-foreground mt-1 text-right">{pct}% booked</p>
              </div>
            </Fade>

            <Fade direction="up" delay={0.14}>
              <div className="rounded-xl border border-border bg-card p-5">
                <h2 className="text-sm font-semibold font-heading mb-3">Hotel</h2>
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium" data-testid="detail-hotel-name">{pkg!.hotel_name}</p>
                </div>
                <div className="flex items-center gap-1">
                  {Array.from({ length: pkg!.hotel_stars }).map((_, i) => (
                    <Star key={i} className="size-3.5 fill-amber-400 text-amber-400" />
                  ))}
                  <span className="text-xs text-muted-foreground ml-1">{pkg!.hotel_stars}-star accommodation</span>
                </div>
              </div>
            </Fade>
          </div>
        </div>

        {pkgBookings.length > 0 && (
          <Fade direction="up" delay={0.18}>
            <div className="rounded-xl border border-border bg-card p-5">
              <h2 className="text-sm font-semibold font-heading mb-4" data-testid="text-pkg-bookings-title">
                Bookings for this Package ({pkgBookings.length})
              </h2>
              <DataTable
                columns={bookingColumns}
                data={pkgBookings}
                searchPlaceholder="Search bookings..."
                searchKey="client_name"
              />
            </div>
          </Fade>
        )}
      </PageTransition>
    </PageShell>
  );
}
