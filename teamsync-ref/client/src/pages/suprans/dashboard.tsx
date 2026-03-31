import { useState } from "react";
import { useLocation } from "wouter";
import {
  Users, UserPlus, CheckCircle2, TrendingUp,
  ArrowRight, Globe, Instagram, Linkedin, MessageCircle,
  Phone, MapPin, BarChart3,
} from "lucide-react";
import {
  supransLeads,
} from "@/lib/mock-data-suprans";
import { SUPRANS_COLOR } from "@/lib/suprans-config";
import {
  PageShell,
  HeroBanner,
  StatGrid,
  StatCard,
  SectionCard,
  SectionGrid,
} from "@/components/layout";
import { PersonCell } from "@/components/ui/avatar-cells";


const SOURCE_ICONS: Record<string, typeof Globe> = {
  website: Globe,
  referral: Users,
  instagram: Instagram,
  linkedin: Linkedin,
  "google-ads": BarChart3,
  "walk-in": MapPin,
  whatsapp: MessageCircle,
};

const STATUS_STYLES: Record<string, string> = {
  new: "bg-slate-100 text-slate-700",
  validated: "bg-sky-100 text-sky-700",
  enriched: "bg-amber-100 text-amber-700",
  assigned: "bg-purple-100 text-purple-700",
  converted: "bg-emerald-100 text-emerald-700",
  dropped: "bg-red-100 text-red-700",
};

const newToday = supransLeads.filter(l => {
  const d = new Date(l.createdAt);
  const today = new Date();
  return d.getDate() === today.getDate() && d.getMonth() === today.getMonth();
}).length;

const assignedLeads = supransLeads.filter(l => l.status === "assigned" || l.status === "converted");
const convertedLeads = supransLeads.filter(l => l.status === "converted");
const conversionRate = Math.round((convertedLeads.length / supransLeads.length) * 100);

const verticalBreakdown = [
  { name: "LegalNations", id: "legalnations", color: "#225AEA", leads: supransLeads.filter(l => l.service === "company-formation").length, assigned: supransLeads.filter(l => l.assignedVertical === "legalnations").length, converted: supransLeads.filter(l => l.assignedVertical === "legalnations" && l.status === "converted").length },
  { name: "GoyoTours", id: "goyotours", color: "#E91E63", leads: supransLeads.filter(l => l.service === "tour-booking").length, assigned: supransLeads.filter(l => l.assignedVertical === "goyotours").length, converted: supransLeads.filter(l => l.assignedVertical === "goyotours" && l.status === "converted").length },
  { name: "USDrop AI", id: "usdrop", color: "#F34147", leads: supransLeads.filter(l => l.service === "ecommerce-setup").length, assigned: supransLeads.filter(l => l.assignedVertical === "usdrop").length, converted: supransLeads.filter(l => l.assignedVertical === "usdrop" && l.status === "converted").length },
  { name: "EventHub", id: "eventhub", color: "#7C3AED", leads: supransLeads.filter(l => l.service === "event-management").length, assigned: supransLeads.filter(l => l.assignedVertical === "eventhub").length, converted: supransLeads.filter(l => l.assignedVertical === "eventhub" && l.status === "converted").length },
  { name: "HRMS", id: "hrms", color: "#0EA5E9", leads: supransLeads.filter(l => l.service === "hr-consulting").length, assigned: supransLeads.filter(l => l.assignedVertical === "hrms").length, converted: supransLeads.filter(l => l.assignedVertical === "hrms" && l.status === "converted").length },
  { name: "EazyToSell", id: "ets", color: "#F97316", leads: supransLeads.filter(l => l.service === "franchise").length, assigned: supransLeads.filter(l => l.assignedVertical === "ets").length, converted: supransLeads.filter(l => l.assignedVertical === "ets" && l.status === "converted").length },
];

const recentLeads = [...supransLeads]
  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  .slice(0, 8);

const SERVICE_LABELS: Record<string, string> = {
  "company-formation": "Company Formation",
  "tour-booking": "Tour Booking",
  "ecommerce-setup": "E-Commerce Setup",
  "event-management": "Event Management",
  "hr-consulting": "HR Consulting",
  "franchise": "Franchise",
};

export default function SupransDashboard() {
  const [, setLocation] = useLocation();

  return (
    <PageShell>
      <HeroBanner
        eyebrow="Lead Intelligence Hub"
        headline="Suprans Command Center"
        tagline={`${supransLeads.length} total leads received across all verticals.`}
        color={SUPRANS_COLOR}
        colorDark={SUPRANS_COLOR}
        metrics={[
          { label: "New Today", value: newToday },
          { label: "Assigned", value: assignedLeads.length },
          { label: "Converted", value: convertedLeads.length },
        ]}
      />

      <StatGrid>
        <StatCard
          label="Total Leads"
          value={supransLeads.length}
          icon={Users}
          iconBg="hsl(var(--indigo-500) / 0.1)"
          iconColor="#6366f1"
        />
        <StatCard
          label="New Today"
          value={newToday}
          icon={UserPlus}
          iconBg="hsl(var(--sky-500) / 0.1)"
          iconColor="#0ea5e9"
        />
        <StatCard
          label="Assigned"
          value={assignedLeads.length}
          icon={CheckCircle2}
          iconBg="hsl(var(--emerald-500) / 0.1)"
          iconColor="#10b981"
        />
        <StatCard
          label="Conversion Rate"
          value={`${conversionRate}%`}
          icon={TrendingUp}
          iconBg="hsl(var(--amber-500) / 0.1)"
          iconColor="#f59e0b"
        />
      </StatGrid>

      <SectionGrid>
        <SectionCard title="Vertical Breakdown">
          <div className="divide-y -mx-5 -mb-5">
            {verticalBreakdown.map((v) => (
              <div key={v.id} className="px-5 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: v.color }} />
                  <span className="text-sm font-medium">{v.name}</span>
                </div>
                <div className="flex items-center gap-6 text-xs text-muted-foreground">
                  <span><span className="text-foreground font-medium">{v.leads}</span> leads</span>
                  <span><span className="text-foreground font-medium">{v.assigned}</span> assigned</span>
                  <span><span className="text-emerald-600 font-medium">{v.converted}</span> converted</span>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          title="Recent Leads"
          viewAllLabel="View all"
          onViewAll={() => setLocation("/suprans/inbound")}
          noPadding
        >
          <div className="divide-y">
            {recentLeads.map((lead) => {
              const SrcIcon = SOURCE_ICONS[lead.source] || Globe;
              return (
                <div key={lead.id} className="p-4 flex items-center justify-between gap-3 hover:bg-muted/20 transition-colors" data-testid={`row-lead-${lead.id}`}>
                  <div className="min-w-0">
                    <PersonCell name={lead.name} subtitle={SERVICE_LABELS[lead.service]} size="sm" />
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <SrcIcon className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[lead.status]}`}>
                      {lead.status}
                    </span>
                    {(lead.status === "new" || lead.status === "validated") && (
                      <button
                        onClick={() => setLocation(lead.status === "new" ? "/suprans/inbound" : "/suprans/enrichment")}
                        className="text-[10px] px-2 py-0.5 rounded text-white font-medium hover:opacity-90"
                        style={{ backgroundColor: SUPRANS_COLOR }}
                        data-testid={`button-quick-assign-${lead.id}`}
                      >
                        {lead.status === "new" ? "Validate" : "Enrich"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </SectionCard>
      </SectionGrid>
    </PageShell>
  );
}
