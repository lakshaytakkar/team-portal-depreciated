import { Users, UserCheck, Clock, BarChart3 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatsCard } from "@/components/ds/stats-card";
import { StatsCardSkeleton } from "@/components/ui/card-skeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { teamMembers, formationClients } from "@/lib/mock-data";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { getPersonAvatar } from "@/lib/avatars";
import { Fade, Stagger, StaggerItem, PageTransition } from "@/components/ui/animated";
import { PageShell } from "@/components/layout";

const roleLabels: Record<string, string> = {
  "ops-manager": "Ops Manager",
  executive: "Executive",
  admin: "Admin",
};

const roleColors: Record<string, string> = {
  "ops-manager": "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  executive: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  admin: "bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300",
};

export default function TeamPerformancePage() {
  const loading = useSimulatedLoading();

  const activeMembers = teamMembers.filter((m) => m.role !== "admin");
  const totalActiveClients = activeMembers.reduce((s, m) => s + m.activeClients, 0);
  const totalCompletedMonth = activeMembers.reduce((s, m) => s + m.completedThisMonth, 0);
  const avgCompletionDays = Math.round(
    activeMembers.filter((m) => m.avgCompletionDays > 0).reduce((s, m) => s + m.avgCompletionDays, 0) /
    activeMembers.filter((m) => m.avgCompletionDays > 0).length
  );
  const maxActiveClients = Math.max(...activeMembers.map((m) => m.activeClients), 1);

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
                title="Team Members"
                value={teamMembers.length}
                change={`${activeMembers.length} active`}
                changeType="neutral"
                icon={<Users className="size-5" />}
              />
            </StaggerItem>
            <StaggerItem>
              <StatsCard
                title="Active Clients"
                value={totalActiveClients}
                change="Across all members"
                changeType="neutral"
                icon={<BarChart3 className="size-5" />}
              />
            </StaggerItem>
            <StaggerItem>
              <StatsCard
                title="Completed This Month"
                value={totalCompletedMonth}
                change="Formations completed"
                changeType="positive"
                icon={<UserCheck className="size-5" />}
              />
            </StaggerItem>
            <StaggerItem>
              <StatsCard
                title="Avg Completion Days"
                value={`${avgCompletionDays}d`}
                change="Team average"
                changeType="neutral"
                icon={<Clock className="size-5" />}
              />
            </StaggerItem>
          </Stagger>
        )}

        <div className="mt-6">
          {loading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-lg border bg-background p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <Skeleton className="size-10 rounded-full" />
                    <div className="flex flex-col gap-1">
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Fade direction="up" delay={0.1}>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {teamMembers.map((member) => {
                  const memberClients = formationClients.filter((c) => c.assignedManager === member.name);
                  const atRisk = memberClients.filter((c) => c.riskFlag === "at-risk" || c.riskFlag === "delayed").length;
                  const initials = member.name.split(" ").map((n) => n[0]).join("");
                  return (
                    <Card
                      key={member.id}
                      className="p-5"
                      data-testid={`card-team-member-${member.id}`}
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <Avatar className="size-10">
                          <AvatarImage src={getPersonAvatar(member.name)} alt={member.name} />
                          <AvatarFallback>{initials}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-sm font-semibold truncate" data-testid={`text-member-name-${member.id}`}>
                            {member.name}
                          </h3>
                          <Badge
                            variant="secondary"
                            className={`border-0 text-[10px] font-medium px-1.5 py-0 ${roleColors[member.role] || ""}`}
                            data-testid={`badge-member-role-${member.id}`}
                          >
                            {roleLabels[member.role] || member.role}
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3 text-center">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-lg font-semibold font-heading" data-testid={`text-member-active-${member.id}`}>
                            {member.activeClients}
                          </span>
                          <span className="text-[11px] text-muted-foreground">Active</span>
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-lg font-semibold font-heading" data-testid={`text-member-completed-${member.id}`}>
                            {member.completedThisMonth}
                          </span>
                          <span className="text-[11px] text-muted-foreground">Completed</span>
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-lg font-semibold font-heading" data-testid={`text-member-avgdays-${member.id}`}>
                            {member.avgCompletionDays > 0 ? `${member.avgCompletionDays}d` : "-"}
                          </span>
                          <span className="text-[11px] text-muted-foreground">Avg Days</span>
                        </div>
                      </div>

                      {member.role !== "admin" && (
                        <div className="mt-3 pt-3 border-t">
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <span className="text-xs text-muted-foreground">Workload</span>
                            <span className="text-xs text-muted-foreground">{member.activeClients}/{maxActiveClients}</span>
                          </div>
                          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full rounded-full bg-primary transition-all duration-500"
                              style={{ width: `${Math.round((member.activeClients / maxActiveClients) * 100)}%` }}
                            />
                          </div>
                          {atRisk > 0 && (
                            <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1.5">
                              {atRisk} client{atRisk > 1 ? "s" : ""} at risk/delayed
                            </p>
                          )}
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            </Fade>
          )}
        </div>

        {loading ? (
          <div className="mt-6 rounded-lg border bg-background p-5">
            <Skeleton className="h-4 w-1/3 mb-4" />
            <div className="flex flex-col gap-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          </div>
        ) : (
          <Fade direction="up" delay={0.2} className="mt-6">
            <div className="rounded-lg border bg-background" data-testid="section-completion-comparison">
              <div className="border-b px-5 py-4">
                <h3 className="text-base font-semibold font-heading">Completion Rate Comparison</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Per-member completion rate this month</p>
              </div>
              <div className="divide-y">
                {activeMembers
                  .sort((a, b) => b.completedThisMonth - a.completedThisMonth)
                  .map((member, idx) => {
                    const maxCompleted = Math.max(...activeMembers.map((m) => m.completedThisMonth), 1);
                    const percentage = Math.round((member.completedThisMonth / maxCompleted) * 100);
                    return (
                      <div
                        key={member.id}
                        className="flex items-center gap-3 px-5 py-3"
                        data-testid={`row-completion-${member.id}`}
                      >
                        <span className="text-sm font-semibold text-muted-foreground w-6">#{idx + 1}</span>
                        <Avatar className="size-7">
                          <AvatarImage src={getPersonAvatar(member.name)} alt={member.name} />
                          <AvatarFallback className="text-[10px]">{member.name.split(" ").map((n) => n[0]).join("")}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{member.name}</p>
                          <p className="text-xs text-muted-foreground">{roleLabels[member.role]}</p>
                        </div>
                        <div className="w-24 flex items-center gap-2">
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full rounded-full bg-primary transition-all duration-500"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                        <span className="text-sm font-semibold w-12 text-right" data-testid={`text-completion-count-${member.id}`}>
                          {member.completedThisMonth}
                        </span>
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
