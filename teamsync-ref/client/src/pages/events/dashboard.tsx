import { useLocation } from "wouter";
import { Package, Users, IndianRupee, TrendingUp, AlertTriangle, ChevronRight } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";

import { StatsCardSkeleton } from "@/components/ui/card-skeleton";
import { StatusBadge } from "@/components/ds/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  PageShell,
  HeroBanner,
  StatGrid,
  StatCard,
  SectionCard,
  SectionGrid,
} from "@/components/layout";
import { tourPackages, leads, bookings } from "@/lib/mock-data-goyo";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { Fade, Stagger, StaggerItem } from "@/components/ui/animated";
import { PersonCell } from "@/components/ui/avatar-cells";

const formatCurrency = (val: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(val);

const paymentStatusConfig: Record<string, { label: string; variant: "success" | "warning" | "error" | "neutral" }> = {
  full: { label: "Fully Paid", variant: "success" },
  partial: { label: "Partial", variant: "warning" },
  pending: { label: "Pending", variant: "error" },
  refunded: { label: "Refunded", variant: "neutral" },
};

const leadStages = [
  { key: "new", label: "New", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" },
  { key: "contacted", label: "Contacted", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300" },
  { key: "interested", label: "Interested", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300" },
  { key: "booked", label: "Booked", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" },
  { key: "cold", label: "Cold", color: "bg-slate-100 text-slate-600 dark:bg-slate-900/30 dark:text-slate-400" },
];

export default function GoyoToursDashboard() {
  const [, navigate] = useLocation();
  const loading = useSimulatedLoading(700);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const totalRevenueCollected = bookings.reduce((sum, b) => sum + b.advance_paid, 0);
  const totalBookings = bookings.length;
  const activeLeads = leads.filter((l) => !["cold", "lost", "booked"].includes(l.status)).length;
  const totalSeatsAvailable = tourPackages.reduce((sum, p) => sum + p.seats_available, 0);
  const totalOwed = bookings.filter((b) => b.booking_status !== "cancelled").reduce((sum, b) => sum + b.total_amount, 0);
  const balancePending = bookings.reduce((sum, b) => sum + b.balance_due, 0);

  const recentBookings = [...bookings].sort((a, b) => b.booking_date.localeCompare(a.booking_date)).slice(0, 5);

  const today = new Date().toISOString().split("T")[0];
  const overdueFollowUps = leads.filter(
    (l) => l.status !== "booked" && l.status !== "lost" && l.follow_up_date < today
  );
  const visaUrgent = bookings.filter((b) => {
    const daysToTravel = Math.ceil((new Date(b.travel_date).getTime() - Date.now()) / 86400000);
    return b.visa_status === "pending" && daysToTravel > 0 && daysToTravel < 45;
  });

  return (
    <PageShell>
      <HeroBanner
        eyebrow={`${greeting}, Priya Kapoor`}
        headline="GoyoTours"
        tagline={`China B2B Delegations — 7 active packages · Apr–May 2026 season · ${totalBookings} bookings so far`}
        color="#E91E63"
        colorDark="#c21553"
      />

      {loading ? (
        <StatGrid>
          <StatsCardSkeleton />
          <StatsCardSkeleton />
          <StatsCardSkeleton />
          <StatsCardSkeleton />
        </StatGrid>
      ) : (
        <Stagger staggerInterval={0.05}>
          <StatGrid>
            <StaggerItem>
              <StatCard
                label="Revenue Collected"
                value={formatCurrency(totalRevenueCollected)}
                trend="Total advances received"
                icon={IndianRupee}
                iconBg="rgba(233, 30, 99, 0.1)"
                iconColor="#E91E63"
              />
            </StaggerItem>
            <StaggerItem>
              <StatCard
                label="Total Bookings"
                value={totalBookings}
                trend={`${bookings.filter((b) => b.payment_status === "full").length} fully paid`}
                icon={Package}
                iconBg="rgba(139, 92, 246, 0.1)"
                iconColor="#8B5CF6"
              />
            </StaggerItem>
            <StaggerItem>
              <StatCard
                label="Active Leads"
                value={activeLeads}
                trend={`${leads.length} total in pipeline`}
                icon={Users}
                iconBg="rgba(245, 158, 11, 0.1)"
                iconColor="#F59E0B"
              />
            </StaggerItem>
            <StaggerItem>
              <StatCard
                label="Seats Available"
                value={totalSeatsAvailable}
                trend="Across all 7 packages"
                icon={TrendingUp}
                iconBg="rgba(16, 185, 129, 0.1)"
                iconColor="#10B981"
              />
            </StaggerItem>
          </StatGrid>
        </Stagger>
      )}

      {loading ? (
        <div className="mb-6">
          <Skeleton className="h-5 w-40 mb-3" />
          <div className="flex gap-3 overflow-x-auto pb-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="min-w-[220px] rounded-xl border bg-card p-4">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-3 w-1/2 mb-3" />
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <Fade direction="up" delay={0.15}>
          <SectionCard
            title="Tour Packages"
            viewAllLabel="View all"
            onViewAll={() => navigate("/goyotours/packages")}
          >
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
              {tourPackages.map((pkg) => {
                const sold = pkg.max_pax - pkg.seats_available;
                const pct = Math.round((sold / pkg.max_pax) * 100);
                return (
                  <div
                    key={pkg.id}
                    className="min-w-[220px] max-w-[220px] rounded-xl border border-border bg-card p-4 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                    onClick={() => navigate("/goyotours/packages")}
                    data-testid={`card-pkg-${pkg.id}`}
                  >
                    <p className="text-sm font-semibold leading-tight mb-1 line-clamp-2" data-testid={`text-pkg-name-${pkg.id}`}>{pkg.name}</p>
                    {pkg.start_date && (
                      <p className="text-xs text-muted-foreground mb-2">
                        {new Date(pkg.start_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                        {pkg.end_date && ` – ${new Date(pkg.end_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`}
                      </p>
                    )}
                    <p className="text-sm font-bold text-pink-600 mb-2">
                      {formatCurrency(pkg.price_inr)}
                    </p>
                    <div className="mb-1">
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>{sold}/{pkg.max_pax} booked</span>
                        <span>{pkg.seats_available} left</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-pink-500 transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </SectionCard>
        </Fade>
      )}

      <SectionGrid>
        {loading ? (
          <>
            <div className="rounded-xl border bg-card p-5">
              <Skeleton className="h-5 w-36 mb-4" />
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full mb-2" />)}
            </div>
            <div className="rounded-xl border bg-card p-5">
              <Skeleton className="h-5 w-36 mb-4" />
              <Skeleton className="h-20 w-full mb-2" />
              <Skeleton className="h-20 w-full" />
            </div>
          </>
        ) : (
          <>
            <Fade direction="up" delay={0.2}>
              <SectionCard
                title="Recent Bookings"
                viewAllLabel="All bookings"
                onViewAll={() => navigate("/goyotours/bookings")}
                noPadding
              >
                <div className="divide-y">
                  {recentBookings.map((bkg) => {
                    const ps = paymentStatusConfig[bkg.payment_status];
                    return (
                      <div
                        key={bkg.id}
                        className="flex items-center gap-4 px-5 py-3 transition-colors hover:bg-muted/20 cursor-pointer"
                        onClick={() => navigate(`/goyotours/bookings/${bkg.id}`)}
                        data-testid={`row-booking-${bkg.id}`}
                      >
                        <div className="flex-1 min-w-0">
                          <PersonCell name={bkg.client_name} subtitle={bkg.package_name} size="sm" />
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">{bkg.passengers} pax</span>
                        <StatusBadge status={ps.label} variant={ps.variant} />
                        <a
                          href={`https://wa.me/${bkg.client_phone.replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          data-testid={`btn-whatsapp-${bkg.id}`}
                        >
                          <Button variant="ghost" size="icon" className="size-7 text-green-600 hover:text-green-700 hover:bg-green-50">
                            <SiWhatsapp className="size-3.5" />
                          </Button>
                        </a>
                      </div>
                    );
                  })}
                </div>
              </SectionCard>
            </Fade>

            <Fade direction="up" delay={0.25}>
              <div className="flex flex-col gap-4">
                <SectionCard title="Lead Pipeline">
                  <div className="flex flex-col gap-2">
                    {leadStages.map((stage) => {
                      const count = leads.filter((l) => l.status === stage.key).length;
                      return (
                        <div
                          key={stage.key}
                          className="flex items-center justify-between cursor-pointer"
                          onClick={() => navigate("/goyotours/leads")}
                          data-testid={`row-stage-${stage.key}`}
                        >
                          <span className="text-sm text-muted-foreground">{stage.label}</span>
                          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${stage.color}`} data-testid={`count-stage-${stage.key}`}>
                            {count}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </SectionCard>

                <SectionCard title="Payment Summary">
                  <div className="flex flex-col gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Owed</span>
                      <span className="font-medium" data-testid="stat-total-owed">{formatCurrency(totalOwed)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Collected</span>
                      <span className="font-medium text-green-600" data-testid="stat-collected">{formatCurrency(totalRevenueCollected)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Balance Due</span>
                      <span className="font-medium text-amber-600" data-testid="stat-balance">{formatCurrency(balancePending)}</span>
                    </div>
                  </div>
                </SectionCard>
              </div>
            </Fade>
          </>
        )}
      </SectionGrid>

      {!loading && (overdueFollowUps.length > 0 || visaUrgent.length > 0) && (
        <Fade direction="up" delay={0.3}>
          <div className="rounded-xl border border-amber-300 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800 p-5" data-testid="section-urgent">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="size-4 text-amber-600" />
              <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-300 font-heading">Urgent Actions Required</h3>
            </div>
            <div className="flex flex-col gap-2">
              {overdueFollowUps.map((lead) => (
                <div
                  key={lead.id}
                  className="flex items-center justify-between text-sm rounded-lg bg-white dark:bg-amber-950/30 px-3 py-2 cursor-pointer"
                  onClick={() => navigate("/goyotours/leads")}
                  data-testid={`urgent-lead-${lead.id}`}
                >
                  <span className="font-medium text-foreground">Follow-up overdue: <span className="text-amber-700 dark:text-amber-400">{lead.name}</span></span>
                  <span className="text-xs text-muted-foreground">Due {lead.follow_up_date}</span>
                </div>
              ))}
              {visaUrgent.map((bkg) => {
                const days = Math.ceil((new Date(bkg.travel_date).getTime() - Date.now()) / 86400000);
                return (
                  <div
                    key={bkg.id}
                    className="flex items-center justify-between text-sm rounded-lg bg-white dark:bg-amber-950/30 px-3 py-2 cursor-pointer"
                    onClick={() => navigate(`/goyotours/bookings/${bkg.id}`)}
                    data-testid={`urgent-visa-${bkg.id}`}
                  >
                    <span className="font-medium text-foreground">Visa pending: <span className="text-red-600 dark:text-red-400">{bkg.client_name}</span></span>
                    <span className="text-xs text-muted-foreground">Travel in {days} days</span>
                  </div>
                );
              })}
            </div>
          </div>
        </Fade>
      )}
    </PageShell>
  );
}
