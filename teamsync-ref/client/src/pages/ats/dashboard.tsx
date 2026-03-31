import { useLocation } from "wouter";
import { Briefcase, Users, CalendarCheck, FileSignature } from "lucide-react";
import { Fade } from "@/components/ui/animated";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { PersonCell } from "@/components/ui/avatar-cells";
import { jobOpenings, candidates, interviews, offers } from "@/lib/mock-data-ats";
import {
  PageShell,
  HeroBanner,
  StatGrid,
  StatCard,
  SectionCard,
  SectionGrid,
} from "@/components/layout";
import { StatusBadge } from "@/components/ds/status-badge";
import { ATS_COLOR } from "@/lib/ats-config";


const funnelStages = [
  { label: "Applied", count: 25, color: "bg-slate-400" },
  { label: "Screening", count: 14, color: "bg-sky-400" },
  { label: "Interview", count: 8, color: "bg-violet-400" },
  { label: "Evaluation", count: 5, color: "bg-amber-400" },
  { label: "Offer", count: 3, color: "bg-orange-400" },
  { label: "Hired", count: 1, color: "bg-emerald-500" },
];

export default function AtsDashboard() {
  const [, setLocation] = useLocation();
  const isLoading = useSimulatedLoading(700);

  const openJobs = jobOpenings.filter(j => j.status === "active").length;
  const interviewsThisWeek = interviews.filter(i => i.scheduledDate >= "2026-02-28" && i.scheduledDate <= "2026-03-06").length;
  const offersExtended = offers.filter(o => o.status === "sent" || o.status === "accepted").length;

  const activeJobs = jobOpenings.filter(j => j.status === "active").slice(0, 5);
  const latestCandidates = [...candidates].sort((a, b) => new Date(b.addedDate).getTime() - new Date(a.addedDate).getTime()).slice(0, 5);

  if (isLoading) {
    return (
      <PageShell className="animate-pulse">
        <div className="h-48 bg-muted rounded-2xl" />
        <StatGrid>
          {[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-muted rounded-xl" />)}
        </StatGrid>
        <div className="h-32 bg-muted rounded-xl" />
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
        eyebrow="ATS · Recruitment"
        headline="Recruitment Dashboard"
        tagline={`${interviewsThisWeek} interviews scheduled this week and ${offersExtended} offers awaiting response.`}
        color={ATS_COLOR}
        colorDark={ATS_COLOR}
      />

      <StatGrid>
        <StatCard
          label="Open Positions"
          value={openJobs}
          icon={Briefcase}
          iconBg="hsl(var(--violet-500) / 0.1)"
          iconColor="#7c3aed"
        />
        <StatCard
          label="Total Candidates"
          value={candidates.length}
          icon={Users}
          iconBg="hsl(var(--sky-500) / 0.1)"
          iconColor="#0ea5e9"
        />
        <StatCard
          label="Interviews This Week"
          value={interviewsThisWeek}
          icon={CalendarCheck}
          iconBg="hsl(var(--amber-500) / 0.1)"
          iconColor="#d97706"
        />
        <StatCard
          label="Offers Extended"
          value={offersExtended}
          icon={FileSignature}
          iconBg="hsl(var(--emerald-500) / 0.1)"
          iconColor="#059669"
        />
      </StatGrid>

      <SectionCard title="Recruitment Funnel">
        <div className="space-y-2">
          {funnelStages.map((stage, idx) => (
            <div key={stage.label} className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground w-20 text-right">{stage.label}</span>
              <div className="flex-1 h-5 bg-muted rounded-full overflow-hidden relative">
                <div
                  className={`h-full ${stage.color} rounded-full flex items-center justify-end pr-2 transition-all duration-700`}
                  style={{ width: `${(stage.count / funnelStages[0].count) * 100}%` }}
                >
                  <span className="text-white text-[10px] font-bold">{stage.count}</span>
                </div>
              </div>
              {idx > 0 && (
                <span className="text-xs text-muted-foreground w-10 shrink-0">
                  {Math.round((stage.count / funnelStages[idx - 1].count) * 100)}%
                </span>
              )}
              {idx === 0 && <span className="w-10" />}
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionGrid>
        <SectionCard
          title="Active Job Openings"
          viewAllLabel="View all"
          onViewAll={() => setLocation("/ats/jobs")}
          noPadding
        >
          <div className="divide-y">
            {activeJobs.map((job) => (
              <div key={job.id} className="flex items-center justify-between gap-2 p-4 hover:bg-muted/20 transition-colors" data-testid={`job-item-${job.id}`}>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{job.title}</p>
                  <p className="text-xs text-muted-foreground">{job.department} · {job.location}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-medium">{job.filled}/{job.openings} filled</p>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${job.priority === "high" ? "bg-red-100 text-red-700" : job.priority === "medium" ? "bg-amber-100 text-amber-700" : "bg-muted text-muted-foreground"}`}>{job.priority}</span>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          title="Latest Candidates"
          viewAllLabel="View all"
          onViewAll={() => setLocation("/ats/candidates")}
          noPadding
        >
          <div className="divide-y">
            {latestCandidates.map((c) => (
              <div key={c.id} className="flex items-center gap-3 p-4 cursor-pointer hover:bg-muted/20 transition-colors" onClick={() => setLocation(`/ats/candidates/${c.id}`)} data-testid={`candidate-item-${c.id}`}>
                <PersonCell name={c.name} subtitle={`${c.currentRole} · ${c.currentCompany}`} size="sm" className="flex-1 min-w-0" />
                <StatusBadge status={c.stage} />
              </div>
            ))}
          </div>
        </SectionCard>
      </SectionGrid>
    </PageShell>
  );
}
