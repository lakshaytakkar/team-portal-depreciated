import { PageTransition, Stagger, StaggerItem, Fade } from "@/components/ui/animated";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { jobOpenings, candidates, offers, applications } from "@/lib/mock-data-ats";
import { PageShell } from "@/components/layout";

const funnelStages = [
  { label: "Applied", count: 25, color: "#8B5CF6" },
  { label: "Screened", count: 14, color: "#7C3AED" },
  { label: "Interviewed", count: 8, color: "#6D28D9" },
  { label: "Evaluated", count: 5, color: "#5B21B6" },
  { label: "Offered", count: 3, color: "#4C1D95" },
  { label: "Hired", count: 1, color: "#2E1065" },
];

const sourceData = [
  { source: "LinkedIn", count: 10, color: "#0EA5E9" },
  { source: "Referral", count: 6, color: "#8B5CF6" },
  { source: "Website", count: 4, color: "#10B981" },
  { source: "Job Board", count: 3, color: "#F97316" },
  { source: "Direct", count: 2, color: "#F59E0B" },
];

const deptTimeToHire = [
  { dept: "Engineering", days: 32 },
  { dept: "Sales", days: 21 },
  { dept: "Operations", days: 18 },
  { dept: "HR / Design", days: 14 },
];

const topJobs = jobOpenings.slice(0, 5).map(j => ({
  title: j.title,
  applications: applications.filter(a => a.jobId === j.id).length,
})).sort((a, b) => b.applications - a.applications);

const interviewerLoad = [
  { name: "Rohan Mehta", count: 5 },
  { name: "Priya Sharma", count: 4 },
  { name: "Ankit Verma", count: 3 },
  { name: "Divya Nair", count: 3 },
  { name: "Suresh Iyer", count: 2 },
];

const totalApps = applications.length;
const avgTimeToHire = Math.round(deptTimeToHire.reduce((s, d) => s + d.days, 0) / deptTimeToHire.length);
const acceptedOffers = offers.filter(o => o.status === "accepted").length;
const sentOffers = offers.filter(o => ["sent", "accepted", "declined"].includes(o.status)).length;
const offerAcceptRate = sentOffers > 0 ? Math.round((acceptedOffers / sentOffers) * 100) : 0;
const activePipelines = jobOpenings.filter(j => j.status === "active").length;

const totalSources = sourceData.reduce((s, d) => s + d.count, 0);
const maxDeptDays = Math.max(...deptTimeToHire.map(d => d.days));

export default function AtsAnalytics() {
  const isLoading = useSimulatedLoading(800);

  if (isLoading) {
    return (
      <PageShell>
        <div className="h-10 bg-muted rounded w-48" />
        <div className="grid grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-muted rounded-xl" />)}</div>
        <div className="h-36 bg-muted rounded-xl" />
        <div className="grid grid-cols-2 gap-6"><div className="h-64 bg-muted rounded-xl" /><div className="h-64 bg-muted rounded-xl" /></div>
      </PageShell>
    );
  }

  return (
    <PageTransition className="px-16 py-6 lg:px-24 space-y-6">
      <Fade>
        <div>
          <h1 className="text-2xl font-bold">Recruitment Analytics</h1>
          <p className="text-sm text-muted-foreground">Funnel performance, source mix, and team metrics</p>
        </div>
      </Fade>

      <Stagger className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Applications", value: totalApps, suffix: "", color: "text-violet-600" },
          { label: "Avg. Time to Hire", value: avgTimeToHire, suffix: " days", color: "text-sky-600" },
          { label: "Offer Acceptance Rate", value: offerAcceptRate, suffix: "%", color: "text-emerald-600" },
          { label: "Active Pipelines", value: activePipelines, suffix: "", color: "text-amber-600" },
        ].map((stat) => (
          <StaggerItem key={stat.label}>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-5">
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}{stat.suffix}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
              </CardContent>
            </Card>
          </StaggerItem>
        ))}
      </Stagger>

      <Fade>
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">Recruitment Funnel</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {funnelStages.map((stage, idx) => (
              <div key={stage.label} className="flex items-center gap-4">
                <span className="text-xs text-muted-foreground w-24 text-right font-medium">{stage.label}</span>
                <div className="flex-1 h-6 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full flex items-center px-3 transition-all duration-700"
                    style={{ width: `${(stage.count / funnelStages[0].count) * 100}%`, background: stage.color }}
                  >
                    <span className="text-white text-xs font-bold">{stage.count}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 w-24 shrink-0">
                  {idx > 0 && (
                    <span className="text-xs text-muted-foreground">
                      {Math.round((stage.count / funnelStages[idx - 1].count) * 100)}% conv.
                    </span>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </Fade>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Fade>
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">Source Mix</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {sourceData.map((src) => (
                <div key={src.source} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium">{src.source}</span>
                    <span className="text-muted-foreground">{src.count} · {Math.round((src.count / totalSources) * 100)}%</span>
                  </div>
                  <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${(src.count / totalSources) * 100}%`, background: src.color }} />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </Fade>

        <Fade>
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">Time-to-Hire by Department</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {deptTimeToHire.map((d) => (
                <div key={d.dept} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium">{d.dept}</span>
                    <span className="text-muted-foreground">{d.days} days</span>
                  </div>
                  <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-violet-500 rounded-full" style={{ width: `${(d.days / maxDeptDays) * 100}%` }} />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </Fade>

        <Fade>
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">Top Performing Jobs</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {topJobs.map((job, idx) => (
                <div key={job.title} className="flex items-center gap-3 py-1.5">
                  <span className="text-xs font-bold text-muted-foreground w-5">{idx + 1}.</span>
                  <span className="text-sm flex-1 font-medium truncate">{job.title}</span>
                  <span className="text-xs text-muted-foreground shrink-0">{job.applications} applicants</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </Fade>

        <Fade>
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">Interviewer Load (Feb 2026)</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {interviewerLoad.map((iv) => (
                <div key={iv.name} className="flex items-center gap-3 py-1.5">
                  <span className="text-sm font-medium flex-1">{iv.name}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-violet-400 rounded-full" style={{ width: `${(iv.count / 5) * 100}%` }} />
                    </div>
                    <span className="text-xs text-muted-foreground w-16 shrink-0">{iv.count} interviews</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </Fade>
      </div>
    </PageTransition>
  );
}
