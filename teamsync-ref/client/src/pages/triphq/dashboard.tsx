import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import {
  Users, Package, DollarSign, CheckCircle2, Calendar, Plane, Camera, FileText,
  MapPin, ArrowRight, Clock,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { TRIPHQ_COLOR } from "@/lib/triphq-config";
import {
  PageShell,
  HeroBanner,
  StatGrid,
  StatCard,
  SectionCard,
  SectionGrid,
} from "@/components/layout";
import { SopModal, TutorialModal, SopTutorialButtons } from "@/components/sop/sop-modal";
import { SOP_REGISTRY } from "@/lib/sop-data";

const TRIP_ID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";

export default function TripHQDashboard() {
  const [, setLocation] = useLocation();
  const isLoading = useSimulatedLoading(500);
  const [sopOpen, setSopOpen] = useState(false);
  const [tutorialOpen, setTutorialOpen] = useState(false);

  const { data: trip } = useQuery<any>({ queryKey: ["/api/triphq/trips", TRIP_ID] });
  const { data: stats } = useQuery<any>({ queryKey: ["/api/triphq/trips", TRIP_ID, "stats"] });
  const { data: itinerary } = useQuery<any[]>({ queryKey: ["/api/triphq/itinerary_days"] });
  const { data: contacts } = useQuery<any[]>({ queryKey: ["/api/triphq/contacts"] });

  const startDate = trip?.startDate ? new Date(trip.startDate) : null;
  const daysUntil = startDate ? Math.max(0, Math.ceil((startDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))) : 0;

  const nextDays = (itinerary || []).slice(0, 3);
  const upcomingContacts = (contacts || []).filter((c: any) => c.meetingStatus === "upcoming").slice(0, 4);

  if (isLoading || !stats) {
    return (
      <PageShell className="animate-pulse">
        <div className="h-48 bg-muted rounded-2xl" />
        <StatGrid>
          {[...Array(6)].map((_, i) => <div key={i} className="h-32 bg-muted rounded-xl" />)}
        </StatGrid>
        <SectionGrid>
          <div className="h-64 bg-muted rounded-xl" />
          <div className="h-64 bg-muted rounded-xl" />
        </SectionGrid>
      </PageShell>
    );
  }

  return (
    <PageShell>

      <div className="flex items-center justify-end gap-2 mb-2">
        <SopTutorialButtons onSopClick={() => setSopOpen(true)} onTutorialClick={() => setTutorialOpen(true)} />
      </div>

      <HeroBanner
        eyebrow="TRIP HQ · Travel Operations"
        headline={trip?.name || "China Sourcing Trip 2026"}
        tagline={
          daysUntil > 0
            ? `${daysUntil} days until departure · ${stats.totalDays} days · ${stats.totalLegs} transport legs planned`
            : `Trip in progress · ${stats.contactsMet}/${stats.totalContacts} contacts met`
        }
        color={TRIPHQ_COLOR}
        colorDark={TRIPHQ_COLOR}
      />

      <StatGrid>
        <StatCard
          label="Days Until Departure"
          value={daysUntil}
          icon={Calendar}
          iconBg="rgba(8, 145, 178, 0.1)"
          iconColor={TRIPHQ_COLOR}
          data-testid="stat-days-until"
        />
        <StatCard
          label="Contacts"
          value={`${stats.contactsMet}/${stats.totalContacts}`}
          icon={Users}
          iconBg="rgba(16, 185, 129, 0.1)"
          iconColor="#10B981"
          data-testid="stat-contacts"
        />
        <StatCard
          label="Products Scouted"
          value={stats.totalProducts}
          icon={Package}
          iconBg="rgba(245, 158, 11, 0.1)"
          iconColor="#F59E0B"
          data-testid="stat-products"
        />
        <StatCard
          label="Budget Spent"
          value={`¥${stats.totalExpense.toLocaleString()}`}
          icon={DollarSign}
          iconBg="rgba(239, 68, 68, 0.1)"
          iconColor="#EF4444"
          data-testid="stat-budget"
        />
        <StatCard
          label="Checklist Progress"
          value={`${stats.checklistDone}/${stats.checklistTotal}`}
          icon={CheckCircle2}
          iconBg="rgba(139, 92, 246, 0.1)"
          iconColor="#8B5CF6"
          data-testid="stat-checklist"
        />
        <StatCard
          label="Content Shots"
          value={`${stats.contentShot}/${stats.totalContent}`}
          icon={Camera}
          iconBg="rgba(236, 72, 153, 0.1)"
          iconColor="#EC4899"
          data-testid="stat-content"
        />
      </StatGrid>

      <SectionGrid>
        <SectionCard title="Upcoming Itinerary" icon={MapPin} action={{ label: "View All", onClick: () => setLocation("/triphq/itinerary") }}>
          <div className="space-y-3">
            {nextDays.map((day: any) => (
              <div key={day.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors" data-testid={`itinerary-day-${day.dayNumber}`}>
                <div className="flex flex-col items-center min-w-[48px]">
                  <span className="text-xs font-medium text-muted-foreground">Day</span>
                  <span className="text-lg font-bold" style={{ color: TRIPHQ_COLOR }}>{day.dayNumber}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{day.city}</span>
                    <Badge variant="outline" className="text-xs">{new Date(day.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</Badge>
                  </div>
                  {day.morningPlan && <p className="text-xs text-muted-foreground mt-1 truncate">{day.morningPlan}</p>}
                </div>
              </div>
            ))}
            {nextDays.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No itinerary days yet</p>}
          </div>
        </SectionCard>

        <SectionCard title="Upcoming Meetings" icon={Users} action={{ label: "View All", onClick: () => setLocation("/triphq/contacts") }}>
          <div className="space-y-3">
            {upcomingContacts.map((c: any) => (
              <div key={c.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors" data-testid={`contact-${c.id}`}>
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: TRIPHQ_COLOR }}>
                  {c.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-medium text-sm">{c.name}</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-muted-foreground">{c.company}</span>
                    {c.city && <Badge variant="outline" className="text-xs">{c.city}</Badge>}
                  </div>
                </div>
              </div>
            ))}
            {upcomingContacts.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No upcoming meetings</p>}
          </div>
        </SectionCard>

        <SectionCard title="Quick Actions" icon={ArrowRight}>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "Add Expense", icon: DollarSign, path: "/triphq/budget" },
              { label: "Add Contact", icon: Users, path: "/triphq/contacts" },
              { label: "Add Product", icon: Package, path: "/triphq/catalogue" },
              { label: "Upload File", icon: FileText, path: "/triphq/documents" },
              { label: "View Transport", icon: Plane, path: "/triphq/transport" },
              { label: "View Checklist", icon: CheckCircle2, path: "/triphq/checklist" },
            ].map((action) => (
              <Button
                key={action.label}
                variant="outline"
                className="h-auto py-3 px-3 flex flex-col items-center gap-1.5 hover:border-cyan-300"
                onClick={() => setLocation(action.path)}
                data-testid={`action-${action.label.toLowerCase().replace(/\s/g, "-")}`}
              >
                <action.icon className="h-4 w-4" style={{ color: TRIPHQ_COLOR }} />
                <span className="text-xs font-medium">{action.label}</span>
              </Button>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Trip Progress" icon={Clock}>
          <div className="space-y-3">
            {[
              { label: "Packing", done: stats.packingDone, total: stats.packingTotal },
              { label: "Checklist", done: stats.checklistDone, total: stats.checklistTotal },
              { label: "Transport Booked", done: stats.bookedLegs, total: stats.totalLegs },
              { label: "Contacts Met", done: stats.contactsMet, total: stats.totalContacts },
            ].map((item) => {
              const pct = item.total > 0 ? Math.round((item.done / item.total) * 100) : 0;
              return (
                <div key={item.label} data-testid={`progress-${item.label.toLowerCase().replace(/\s/g, "-")}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{item.label}</span>
                    <span className="text-xs text-muted-foreground">{item.done}/{item.total}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: TRIPHQ_COLOR }} />
                  </div>
                </div>
              );
            })}
          </div>
        </SectionCard>
      </SectionGrid>

      <SopModal open={sopOpen} onOpenChange={setSopOpen} config={SOP_REGISTRY["triphq-dashboard"].sop} color={TRIPHQ_COLOR} />
      <TutorialModal open={tutorialOpen} onOpenChange={setTutorialOpen} config={SOP_REGISTRY["triphq-dashboard"].tutorial} color={TRIPHQ_COLOR} />
    </PageShell>
  );
}
