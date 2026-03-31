import { IndianRupee, Users, Package, TrendingUp, Target, UserPlus } from "lucide-react";

import { StatsCard } from "@/components/ds/stats-card";
import { StatsCardSkeleton } from "@/components/ui/card-skeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { tourPackages, leads, bookings } from "@/lib/mock-data-goyo";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { PageTransition, Fade, Stagger, StaggerItem } from "@/components/ui/animated";
import { PageShell } from "@/components/layout";

const formatCurrency = (val: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(val);

const sourceLabels: Record<string, string> = {
  website: "Website",
  whatsapp: "WhatsApp",
  referral: "Referral",
  social: "Social Media",
  walk_in: "Walk-in",
  phone: "Phone",
};

const sourceColors: Record<string, string> = {
  website: "bg-blue-500",
  whatsapp: "bg-green-500",
  referral: "bg-purple-500",
  social: "bg-pink-500",
  walk_in: "bg-amber-500",
  phone: "bg-indigo-500",
};

export default function EventsAnalytics() {
  const loading = useSimulatedLoading(700);

  const totalRevenue = bookings.reduce((s, b) => s + b.advance_paid, 0);
  const thisMonthBookings = bookings.filter((b) => b.booking_date >= "2026-02-01").length;
  const totalPax = bookings.reduce((s, b) => s + b.passengers, 0);
  const totalOwed = bookings.filter((b) => b.booking_status !== "cancelled").reduce((s, b) => s + b.total_amount, 0);
  const collectionRate = totalOwed > 0 ? Math.round((totalRevenue / totalOwed) * 100) : 0;
  const avgBookingValue = bookings.length > 0 ? Math.round(totalOwed / bookings.length) : 0;
  const activeLeads = leads.filter((l) => !["cold", "lost", "booked"].includes(l.status)).length;

  const revenueByPackage = tourPackages.map((pkg) => {
    const pkgBookings = bookings.filter((b) => b.package_id === pkg.id);
    const revenue = pkgBookings.reduce((s, b) => s + b.advance_paid, 0);
    return { name: pkg.name, revenue, bookings: pkgBookings.length };
  }).sort((a, b) => b.revenue - a.revenue);

  const maxRevenue = Math.max(...revenueByPackage.map((r) => r.revenue), 1);

  const funnelStages = [
    { key: "new", label: "New Leads" },
    { key: "contacted", label: "Contacted" },
    { key: "interested", label: "Interested" },
    { key: "booked", label: "Booked" },
  ];
  const funnelCounts = funnelStages.map((s) =>
    leads.filter((l) => {
      if (s.key === "new") return true;
      if (s.key === "contacted") return ["contacted", "interested", "booked"].includes(l.status);
      if (s.key === "interested") return ["interested", "booked"].includes(l.status);
      return l.status === "booked";
    }).length
  );
  const funnelData = funnelStages.map((s, i) => {
    const count = funnelCounts[i];
    const prev = i === 0 ? leads.length : funnelCounts[i - 1];
    return { ...s, count, conversion: prev > 0 ? Math.round((count / prev) * 100) : 0 };
  });

  const sourceData = (["website", "whatsapp", "referral", "social", "walk_in", "phone"] as const).map((src) => ({
    source: src,
    leads: leads.filter((l) => l.source === src).length,
    bookings: bookings.filter((b) => {
      const lead = leads.find((l) => l.id === b.lead_id);
      return lead?.source === src;
    }).length,
  })).sort((a, b) => b.leads - a.leads);

  const cityData = (() => {
    const cityMap: Record<string, { leads: number; bookings: number; revenue: number }> = {};
    leads.forEach((l) => {
      if (!cityMap[l.city]) cityMap[l.city] = { leads: 0, bookings: 0, revenue: 0 };
      cityMap[l.city].leads++;
    });
    bookings.forEach((b) => {
      if (!cityMap[b.client_city]) cityMap[b.client_city] = { leads: 0, bookings: 0, revenue: 0 };
      cityMap[b.client_city].bookings++;
      cityMap[b.client_city].revenue += b.advance_paid;
    });
    return Object.entries(cityMap)
      .map(([city, data]) => ({ city, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 8);
  })();

  return (
    <PageShell>
      <PageTransition>
        <Fade direction="up" delay={0}>
          <div className="mb-6">
            <h1 className="text-2xl font-bold font-heading text-foreground" data-testid="analytics-title">GoyoTours Analytics</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Apr–May 2026 Season Performance Overview</p>
          </div>
        </Fade>

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {[1, 2, 3, 4, 5, 6].map((i) => <StatsCardSkeleton key={i} />)}
          </div>
        ) : (
          <Stagger staggerInterval={0.05} className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <StaggerItem>
              <StatsCard title="Revenue Collected" value={formatCurrency(totalRevenue)} change="Total advances received" changeType="positive" icon={<IndianRupee className="size-5" />} sparkline={{ values: [30, 90, 120, 150, 210, 270, totalRevenue / 10000], color: "#E91E63" }} />
            </StaggerItem>
            <StaggerItem>
              <StatsCard title="Bookings This Month" value={thisMonthBookings} change="New bookings in Feb 2026" changeType="positive" icon={<Package className="size-5" />} sparkline={{ values: [1, 2, 4, 5, 6, 7, thisMonthBookings], color: "#8B5CF6" }} />
            </StaggerItem>
            <StaggerItem>
              <StatsCard title="Total Passengers" value={totalPax} change="Across all bookings" changeType="neutral" icon={<Users className="size-5" />} sparkline={{ values: [2, 4, 8, 10, 13, 16, totalPax], color: "#10B981" }} />
            </StaggerItem>
            <StaggerItem>
              <StatsCard title="Collection Rate" value={`${collectionRate}%`} change="Advance vs total owed" changeType={collectionRate > 50 ? "positive" : "neutral"} icon={<TrendingUp className="size-5" />} />
            </StaggerItem>
            <StaggerItem>
              <StatsCard title="Avg Booking Value" value={formatCurrency(avgBookingValue)} change="Per confirmed booking" changeType="neutral" icon={<Target className="size-5" />} />
            </StaggerItem>
            <StaggerItem>
              <StatsCard title="Active Leads" value={activeLeads} change="In pipeline (excl. booked/lost)" changeType="neutral" icon={<UserPlus className="size-5" />} sparkline={{ values: [5, 6, 8, 9, 8, 7, activeLeads], color: "#F59E0B" }} />
            </StaggerItem>
          </Stagger>
        )}

        <div className="grid grid-cols-2 gap-5 mb-5">
          {loading ? (
            <>
              <Skeleton className="h-72 rounded-xl" />
              <Skeleton className="h-72 rounded-xl" />
            </>
          ) : (
            <>
              <Fade direction="up" delay={0.15}>
                <div className="rounded-xl border border-border bg-card p-5">
                  <h2 className="text-sm font-semibold font-heading mb-4" data-testid="text-rev-by-package">Revenue by Package</h2>
                  <div className="flex flex-col gap-3">
                    {revenueByPackage.map((pkg) => (
                      <div key={pkg.name} data-testid={`bar-pkg-${pkg.name.substring(0, 10)}`}>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-muted-foreground line-clamp-1 max-w-[60%]">{pkg.name.substring(0, 40)}</span>
                          <span className="font-medium text-foreground">{formatCurrency(pkg.revenue)}</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full bg-pink-500 transition-all duration-700"
                            style={{ width: `${(pkg.revenue / maxRevenue) * 100}%` }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{pkg.bookings} booking{pkg.bookings !== 1 ? "s" : ""}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </Fade>

              <Fade direction="up" delay={0.18}>
                <div className="rounded-xl border border-border bg-card p-5">
                  <h2 className="text-sm font-semibold font-heading mb-4" data-testid="text-lead-funnel">Lead Conversion Funnel</h2>
                  <div className="flex flex-col gap-3">
                    {funnelData.map((stage, i) => (
                      <div key={stage.key} data-testid={`funnel-${stage.key}`}>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-muted-foreground">{stage.label}</span>
                          <span className="font-semibold text-foreground">{stage.count} leads</span>
                        </div>
                        <div className="h-8 w-full rounded-lg bg-muted overflow-hidden flex items-center">
                          <div
                            className="h-full rounded-lg flex items-center justify-end pr-3 transition-all duration-700"
                            style={{
                              width: `${(stage.count / (leads.length || 1)) * 100}%`,
                              backgroundColor: i === 0 ? "#E91E63" : i === 1 ? "#c21553" : i === 2 ? "#a01040" : "#7d0c2e",
                            }}
                          >
                            {stage.count > 0 && (
                              <span className="text-xs font-bold text-white">{stage.conversion}%</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Fade>
            </>
          )}
        </div>

        <div className="grid grid-cols-2 gap-5">
          {loading ? (
            <>
              <Skeleton className="h-56 rounded-xl" />
              <Skeleton className="h-56 rounded-xl" />
            </>
          ) : (
            <>
              <Fade direction="up" delay={0.2}>
                <div className="rounded-xl border border-border bg-card p-5">
                  <h2 className="text-sm font-semibold font-heading mb-4" data-testid="text-bookings-source">Bookings by Source</h2>
                  <div className="flex flex-col gap-2">
                    {sourceData.map((s) => (
                      <div key={s.source} className="flex items-center gap-3" data-testid={`source-row-${s.source}`}>
                        <div className={`size-2.5 rounded-full ${sourceColors[s.source]}`} />
                        <span className="text-sm flex-1 text-muted-foreground">{sourceLabels[s.source]}</span>
                        <span className="text-xs text-muted-foreground">{s.leads} leads</span>
                        <span className="rounded-full bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400 text-xs font-medium px-2 py-0.5">
                          {s.bookings} bookings
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </Fade>

              <Fade direction="up" delay={0.22}>
                <div className="rounded-xl border border-border bg-card p-5">
                  <h2 className="text-sm font-semibold font-heading mb-4" data-testid="text-top-cities">Top Cities</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm" data-testid="table-cities">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left pb-2 text-xs text-muted-foreground font-medium">City</th>
                          <th className="text-right pb-2 text-xs text-muted-foreground font-medium">Leads</th>
                          <th className="text-right pb-2 text-xs text-muted-foreground font-medium">Bookings</th>
                          <th className="text-right pb-2 text-xs text-muted-foreground font-medium">Revenue</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {cityData.map((city) => (
                          <tr key={city.city} className="hover:bg-muted/30 transition-colors" data-testid={`city-row-${city.city}`}>
                            <td className="py-2 font-medium">{city.city}</td>
                            <td className="py-2 text-right text-muted-foreground">{city.leads}</td>
                            <td className="py-2 text-right text-muted-foreground">{city.bookings}</td>
                            <td className="py-2 text-right font-medium text-pink-600">{formatCurrency(city.revenue)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </Fade>
            </>
          )}
        </div>
      </PageTransition>
    </PageShell>
  );
}
