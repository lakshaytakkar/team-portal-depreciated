import { BarChart3, Clock, TrendingUp, AlertTriangle } from "lucide-react";
import { StatsCard } from "@/components/ds/stats-card";
import { StatsCardSkeleton } from "@/components/ui/card-skeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { formationMetrics, formationClients, stageDefinitions } from "@/lib/mock-data";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { Fade, Stagger, StaggerItem, PageTransition } from "@/components/ui/animated";
import { PageShell } from "@/components/layout";

export default function FormationAnalyticsPage() {
  const loading = useSimulatedLoading();

  const totalFormations = formationMetrics.reduce((s, m) => s + m.formations, 0);
  const totalCompleted = formationMetrics.reduce((s, m) => s + m.completed, 0);
  const avgFormationTime = Math.round(formationMetrics.reduce((s, m) => s + m.avgDays, 0) / formationMetrics.length);
  const totalRejections = formationMetrics.reduce((s, m) => s + m.rejections, 0);
  const rejectionRate = Math.round((totalRejections / totalFormations) * 100);
  const reworkCount = formationClients.filter((c) => c.riskFlag === "at-risk").length;
  const reworkRate = Math.round((reworkCount / formationClients.length) * 100);

  const maxFormations = Math.max(...formationMetrics.map((m) => m.formations));
  const maxCompleted = Math.max(...formationMetrics.map((m) => m.completed));

  const stageAvgDays: { name: string; avgDays: number; clientCount: number }[] = stageDefinitions.map((stage) => {
    const clientsAtStage = formationClients.filter((c) => c.currentStage === stage.number);
    const avgDaysInStage = clientsAtStage.length > 0
      ? Math.round(clientsAtStage.reduce((s, c) => {
          const start = new Date(c.startDate);
          const now = new Date();
          return s + Math.ceil((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        }, 0) / clientsAtStage.length)
      : 0;
    return { name: stage.name, avgDays: avgDaysInStage, clientCount: clientsAtStage.length };
  });

  const maxStageDays = Math.max(...stageAvgDays.map((s) => s.avgDays), 1);

  return (
    <PageShell>
      <PageTransition>
{loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
          </div>
        ) : (
          <Stagger staggerInterval={0.05} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StaggerItem>
              <StatsCard
                title="Total Formations"
                value={totalFormations}
                change={`${totalCompleted} completed`}
                changeType="positive"
                icon={<BarChart3 className="size-5" />}
                sparkline={{ values: formationMetrics.map((m) => m.formations), color: "#6366f1" }}
              />
            </StaggerItem>
            <StaggerItem>
              <StatsCard
                title="Avg Formation Time"
                value={`${avgFormationTime}d`}
                change="Average across all months"
                changeType="neutral"
                icon={<Clock className="size-5" />}
                sparkline={{ values: formationMetrics.map((m) => m.avgDays), color: "#f59e0b" }}
              />
            </StaggerItem>
            <StaggerItem>
              <StatsCard
                title="Rejection Rate"
                value={`${rejectionRate}%`}
                change={`${totalRejections} total rejections`}
                changeType="warning"
                icon={<AlertTriangle className="size-5" />}
                sparkline={{ values: formationMetrics.map((m) => m.rejections), color: "#ef4444" }}
              />
            </StaggerItem>
            <StaggerItem>
              <StatsCard
                title="Rework Rate"
                value={`${reworkRate}%`}
                change={`${reworkCount} at-risk clients`}
                changeType="warning"
                icon={<TrendingUp className="size-5" />}
              />
            </StaggerItem>
          </Stagger>
        )}

        {loading ? (
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-lg border bg-background p-5">
              <Skeleton className="h-4 w-1/3 mb-4" />
              <Skeleton className="h-48 w-full" />
            </div>
            <div className="rounded-lg border bg-background p-5">
              <Skeleton className="h-4 w-1/3 mb-4" />
              <Skeleton className="h-48 w-full" />
            </div>
          </div>
        ) : (
          <Fade direction="up" delay={0.15} className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-lg border bg-background" data-testid="section-formation-volume">
              <div className="border-b px-5 py-4">
                <h3 className="text-base font-semibold font-heading">Formation Volume by Month</h3>
                <p className="text-xs text-muted-foreground mt-0.5">New formations started each month</p>
              </div>
              <div className="p-5">
                <svg viewBox="0 0 400 200" className="w-full h-auto" data-testid="chart-formation-volume">
                  {formationMetrics.map((m, i) => {
                    const barWidth = 25;
                    const groupWidth = barWidth * 2 + 4;
                    const gap = (400 - formationMetrics.length * groupWidth) / (formationMetrics.length + 1);
                    const x = gap + i * (groupWidth + gap);
                    const heightF = (m.formations / maxFormations) * 140;
                    const heightC = (m.completed / maxFormations) * 140;
                    return (
                      <g key={m.month}>
                        <rect
                          x={x}
                          y={165 - heightF}
                          width={barWidth}
                          height={heightF}
                          rx={3}
                          className="fill-primary"
                          opacity={0.85}
                          data-testid={`bar-formations-${m.month}`}
                        />
                        <rect
                          x={x + barWidth + 4}
                          y={165 - heightC}
                          width={barWidth}
                          height={heightC}
                          rx={3}
                          className="fill-emerald-500 dark:fill-emerald-400"
                          opacity={0.7}
                          data-testid={`bar-completed-${m.month}`}
                        />
                        <text
                          x={x + groupWidth / 2}
                          y={185}
                          textAnchor="middle"
                          className="fill-muted-foreground text-[11px]"
                        >
                          {m.month}
                        </text>
                      </g>
                    );
                  })}
                </svg>
                <div className="flex items-center justify-center gap-4 mt-2">
                  <div className="flex items-center gap-1.5">
                    <div className="size-2.5 rounded-sm bg-primary" />
                    <span className="text-xs text-muted-foreground">Started</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="size-2.5 rounded-sm bg-emerald-500 dark:bg-emerald-400" />
                    <span className="text-xs text-muted-foreground">Completed</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-lg border bg-background" data-testid="section-completion-trend">
              <div className="border-b px-5 py-4">
                <h3 className="text-base font-semibold font-heading">Avg Completion Days Trend</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Average days to complete a formation</p>
              </div>
              <div className="p-5">
                <svg viewBox="0 0 400 200" className="w-full h-auto" data-testid="chart-completion-trend">
                  {(() => {
                    const maxDays = Math.max(...formationMetrics.map((m) => m.avgDays));
                    const minDays = Math.min(...formationMetrics.map((m) => m.avgDays));
                    const range = maxDays - minDays || 1;
                    const points = formationMetrics.map((m, i) => {
                      const x = 30 + (i / (formationMetrics.length - 1)) * 340;
                      const y = 160 - ((m.avgDays - minDays) / range) * 130;
                      return { x, y, month: m.month, days: m.avgDays };
                    });
                    const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
                    return (
                      <>
                        <path
                          d={linePath}
                          fill="none"
                          stroke="hsl(var(--primary))"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        {points.map((p) => (
                          <g key={p.month}>
                            <circle cx={p.x} cy={p.y} r={4} className="fill-primary" />
                            <text
                              x={p.x}
                              y={p.y - 10}
                              textAnchor="middle"
                              className="fill-muted-foreground text-[10px]"
                            >
                              {p.days}d
                            </text>
                            <text
                              x={p.x}
                              y={185}
                              textAnchor="middle"
                              className="fill-muted-foreground text-[11px]"
                            >
                              {p.month}
                            </text>
                          </g>
                        ))}
                      </>
                    );
                  })()}
                </svg>
              </div>
            </div>
          </Fade>
        )}

        {loading ? (
          <div className="mt-6 rounded-lg border bg-background p-5">
            <Skeleton className="h-4 w-1/3 mb-4" />
            <div className="flex flex-col gap-3">
              {Array.from({ length: 7 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          </div>
        ) : (
          <Fade direction="up" delay={0.25} className="mt-6">
            <div className="rounded-lg border bg-background" data-testid="section-stage-bottleneck">
              <div className="border-b px-5 py-4">
                <h3 className="text-base font-semibold font-heading">Stage Bottleneck Analysis</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Average days clients spend at each stage</p>
              </div>
              <div className="divide-y">
                {stageAvgDays.map((stage, idx) => {
                  const percentage = maxStageDays > 0 ? Math.round((stage.avgDays / maxStageDays) * 100) : 0;
                  return (
                    <div
                      key={idx}
                      className="flex items-center gap-3 px-5 py-3"
                      data-testid={`row-stage-bottleneck-${idx}`}
                    >
                      <span className="text-sm font-semibold text-muted-foreground w-6">{idx}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{stage.name}</p>
                        <p className="text-xs text-muted-foreground">{stage.clientCount} clients currently</p>
                      </div>
                      <div className="w-32 flex items-center gap-2">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-primary transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-sm font-semibold w-16 text-right">{stage.avgDays}d avg</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </Fade>
        )}
      </PageTransition>
    </PageShell>
  );
}
