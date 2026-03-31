import { useLocation } from "wouter";
import {
  TrendingUp, Users, DollarSign, Target, Award, BarChart2,
  Phone, Mail, MessageCircle, CalendarCheck, CheckSquare, FileText,
  ChevronRight, ArrowUpRight, Circle,
} from "lucide-react";
import { Fade } from "@/components/ui/animated";
import { CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { PersonCell } from "@/components/ui/avatar-cells";
import {
  crmDeals, crmActivities, teamPerformance, ALL_VERTICALS_IN_CRM,
  type CrmDeal, type CrmActivity,
} from "@/lib/mock-data-crm";
import { CRM_COLOR } from "@/lib/crm-config";
import {
  PageShell,
  HeroBanner,
  StatGrid,
  StatCard,
  SectionCard,
  SectionGrid,
} from "@/components/layout";


const stageOrder = ["new", "contacted", "qualified", "proposal", "negotiation", "won", "lost"] as const;
const stageLabels: Record<string, string> = {
  new: "New Lead", contacted: "Contacted", qualified: "Qualified",
  proposal: "Proposal Sent", negotiation: "Negotiation", won: "Won", lost: "Lost",
};
const stageCounts = stageOrder.map(s => ({ stage: s, count: crmDeals.filter(d => d.stage === s).length }));

const activityIcons: Record<string, { icon: typeof Phone; color: string; bg: string }> = {
  call: { icon: Phone, color: "text-blue-600", bg: "bg-blue-50" },
  email: { icon: Mail, color: "text-slate-600", bg: "bg-slate-50" },
  whatsapp: { icon: MessageCircle, color: "text-emerald-600", bg: "bg-emerald-50" },
  meeting: { icon: CalendarCheck, color: "text-amber-600", bg: "bg-amber-50" },
  task: { icon: CheckSquare, color: "text-violet-600", bg: "bg-violet-50" },
  note: { icon: FileText, color: "text-purple-600", bg: "bg-purple-50" },
};

function formatINR(v: number, currency?: string) {
  if (currency === "USD") return `$${(v / 1000).toFixed(0)}K`;
  if (v >= 100000) return `₹${(v / 100000).toFixed(1)}L`;
  return `₹${(v / 1000).toFixed(0)}K`;
}

const wonDeals = crmDeals.filter(d => d.stage === "won");
const activeDeals = crmDeals.filter(d => !["won", "lost"].includes(d.stage));
const totalPipeline = activeDeals.reduce((sum, d) => sum + (d.currency === "INR" ? d.value : d.value * 83), 0);
const totalWon = wonDeals.reduce((sum, d) => sum + (d.currency === "INR" ? d.value : d.value * 83), 0);
const allWon = crmDeals.filter(d => d.stage === "won").length;
const allLost = crmDeals.filter(d => d.stage === "lost").length;
const winRate = Math.round((allWon / (allWon + allLost)) * 100);
const avgDeal = Math.round(totalWon / (wonDeals.length || 1));

const topDeals: CrmDeal[] = activeDeals
  .sort((a, b) => {
    const av = a.currency === "INR" ? a.value : a.value * 83;
    const bv = b.currency === "INR" ? b.value : b.value * 83;
    return bv - av;
  })
  .slice(0, 5);

const recentActivities: CrmActivity[] = [...crmActivities]
  .sort((a, b) => {
    const ta = a.completedAt || a.scheduledAt || "";
    const tb = b.completedAt || b.scheduledAt || "";
    return tb.localeCompare(ta);
  })
  .slice(0, 8);

const topPerformers = [...teamPerformance].sort((a, b) => a.rank - b.rank).slice(0, 3);

const stageBadgeColor: Record<string, string> = {
  new: "bg-slate-100 text-slate-700",
  contacted: "bg-sky-100 text-sky-700",
  qualified: "bg-amber-100 text-amber-700",
  proposal: "bg-blue-100 text-blue-700",
  negotiation: "bg-orange-100 text-orange-700",
  won: "bg-emerald-100 text-emerald-700",
  lost: "bg-red-100 text-red-700",
};

const verticalLeadCount = ALL_VERTICALS_IN_CRM.map(v => ({
  ...v,
  count: crmDeals.filter(d => d.vertical === v.id).length,
})).filter(v => v.count > 0);

export default function CrmDashboard() {
  const [, setLocation] = useLocation();
  const isLoading = useSimulatedLoading(700);

  if (isLoading) {
    return (
      <PageShell className="animate-pulse">
        <div className="h-48 bg-muted rounded-2xl" />
        <StatGrid>
          {[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-muted rounded-xl" />)}
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
      <HeroBanner
        eyebrow="Sales CRM · Cross-Vertical"
        headline="Sales Dashboard"
        tagline={`${activeDeals.length} active deals worth ${formatINR(totalPipeline)} across all verticals. ${wonDeals.length} deals won totalling ${formatINR(totalWon)} this quarter.`}
        color={CRM_COLOR}
        colorDark={CRM_COLOR}
        actions={
          <>
            <Button
              size="sm"
              className="bg-white/20 hover:bg-white/30 text-white border-0 rounded-full"
              onClick={() => setLocation("/crm/pipeline")}
              data-testid="btn-view-pipeline"
            >
              View Pipeline
            </Button>
            <Button
              size="sm"
              className="bg-white/20 hover:bg-white/30 text-white border-0 rounded-full"
              onClick={() => setLocation("/crm/leads")}
              data-testid="btn-view-leads"
            >
              All Leads
            </Button>
          </>
        }
      />

      <StatGrid>
        <StatCard
          label="Total Leads"
          value={crmDeals.length}
          icon={Users}
          iconBg="hsl(var(--blue-500) / 0.1)"
          iconColor="#2563eb"
        />
        <StatCard
          label="Pipeline Value"
          value={formatINR(totalPipeline)}
          icon={DollarSign}
          iconBg="hsl(var(--amber-500) / 0.1)"
          iconColor="#d97706"
        />
        <StatCard
          label="Win Rate"
          value={`${winRate}%`}
          icon={Award}
          iconBg="hsl(var(--violet-500) / 0.1)"
          iconColor="#7c3aed"
        />
        <StatCard
          label="Avg Deal Size"
          value={formatINR(avgDeal)}
          icon={BarChart2}
          iconBg="hsl(var(--orange-500) / 0.1)"
          iconColor="#ea580c"
        />
      </StatGrid>

      <SectionGrid>
        <SectionCard title="Pipeline Funnel">
          <div className="space-y-2.5">
            {stageCounts.map(({ stage, count }) => {
              const pct = Math.round((count / crmDeals.length) * 100);
              const barColors: Record<string, string> = {
                new: "bg-slate-400", contacted: "bg-sky-400", qualified: "bg-amber-400",
                proposal: "bg-blue-500", negotiation: "bg-orange-400", won: "bg-emerald-500", lost: "bg-red-400",
              };
              return (
                <div key={stage} className="flex items-center gap-3" data-testid={`funnel-stage-${stage}`}>
                  <span className="text-xs text-muted-foreground w-28 shrink-0">{stageLabels[stage]}</span>
                  <div className="flex-1 bg-muted rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${barColors[stage]}`}
                      style={{ width: `${Math.max(pct, 4)}%` }}
                    />
                  </div>
                  <span className="text-xs font-semibold w-5 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </SectionCard>

        <SectionCard
          title="Top Performers"
          viewAllLabel="View all"
          onViewAll={() => setLocation("/crm/performance")}
        >
          <div className="space-y-3">
            {topPerformers.map((rep, i) => (
              <div key={rep.id} className="flex items-center gap-3" data-testid={`performer-${rep.id}`}>
                <span className="text-lg">{["🥇", "🥈", "🥉"][i]}</span>
                <PersonCell name={rep.name} subtitle={`${rep.dealsWon} won · ${formatINR(rep.revenue)}`} />
                <span className="text-xs font-semibold text-emerald-600">{rep.winRate}%</span>
              </div>
            ))}
          </div>
        </SectionCard>
      </SectionGrid>

      <SectionGrid cols={3}>
        <div className="lg:col-span-2">
          <SectionCard
            title="Top Open Deals"
            viewAllLabel="All deals"
            onViewAll={() => setLocation("/crm/deals")}
            noPadding
          >
            <div className="divide-y">
              {topDeals.map((deal) => {
                const vert = ALL_VERTICALS_IN_CRM.find(v => v.id === deal.vertical);
                return (
                  <div
                    key={deal.id}
                    className="flex items-center gap-3 p-4 hover:bg-muted/20 transition-colors cursor-pointer"
                    onClick={() => setLocation("/crm/deals")}
                    data-testid={`deal-row-${deal.id}`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{deal.title}</p>
                      <p className="text-xs text-muted-foreground">{deal.companyName} · {deal.assignedTo}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {vert && (
                        <span
                          className="text-[10px] px-2 py-0.5 rounded-full font-medium text-white"
                          style={{ backgroundColor: vert.color }}
                        >
                          {vert.name}
                        </span>
                      )}
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${stageBadgeColor[deal.stage]}`}>
                        {stageLabels[deal.stage]}
                      </span>
                      <span className="text-sm font-bold text-foreground min-w-[60px] text-right">
                        {formatINR(deal.value, deal.currency)}
                      </span>
                      <span className="text-xs text-muted-foreground w-8 text-right">{deal.probability}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </SectionCard>
        </div>

        <SectionCard title="Vertical Breakdown">
          <div className="space-y-3">
            {verticalLeadCount.map((v) => (
              <div key={v.id} className="flex items-center gap-2.5" data-testid={`vertical-count-${v.id}`}>
                <Circle className="size-2.5 shrink-0" style={{ fill: v.color, color: v.color }} />
                <span className="text-xs text-muted-foreground flex-1 truncate">{v.name}</span>
                <span className="text-xs font-semibold">{v.count} deals</span>
              </div>
            ))}
          </div>
        </SectionCard>
      </SectionGrid>

      <SectionCard
        title="Recent Activities"
        viewAllLabel="All activities"
        onViewAll={() => setLocation("/crm/activities")}
        noPadding
      >
        <div className="divide-y">
          {recentActivities.map((act) => {
            const cfg = activityIcons[act.type] ?? activityIcons.note;
            const Icon = cfg.icon;
            return (
              <div key={act.id} className="flex items-start gap-3 p-4 hover:bg-muted/20 transition-colors" data-testid={`activity-${act.id}`}>
                <div className={`size-8 rounded-full ${cfg.bg} flex items-center justify-center shrink-0`}>
                  <Icon className={`size-4 ${cfg.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{act.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {act.contactName} · by {act.performedBy}
                    {act.outcome && (
                      <span className="text-emerald-600 ml-1">· {act.outcome.split(".")[0]}</span>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                    act.status === "completed" ? "bg-emerald-50 text-emerald-700" :
                    act.status === "overdue" ? "bg-red-50 text-red-700" :
                    "bg-sky-50 text-sky-700"
                  }`}>
                    {act.status}
                  </span>
                  <ArrowUpRight className="size-3.5 text-muted-foreground" />
                </div>
              </div>
            );
          })}
        </div>
      </SectionCard>
    </PageShell>
  );
}
