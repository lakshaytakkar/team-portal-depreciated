import {
  CheckCircle2, Clock, AlertCircle, ArrowRight, Calendar,
  Shield, FileText, DollarSign, MessageSquare, Building2,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { StatusBadge } from "@/components/ds/status-badge";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import {
  PageShell, HeroBanner, StatGrid, StatCard, SectionGrid, SectionCard,
} from "@/components/layout";
import {
  portalClient, portalCompanies, portalActivity, upcomingDeadlines,
  portalMessages, portalDocuments, portalInvoices,
} from "@/lib/mock-data-portal-legalnations";

function FormationProgressCard() {
  const [, navigate] = useLocation();
  const activeCompany = portalCompanies.find(c => c.status === "in-progress");
  if (!activeCompany) return null;

  const completedStages = activeCompany.stages.filter(s => s.status === "completed").length;
  const totalStages = activeCompany.stages.length;
  const progressPercent = Math.round((completedStages / totalStages) * 100);
  const currentStage = activeCompany.stages.find(s => s.status === "in-progress");

  return (
    <SectionCard
      title="Formation Progress"
      viewAllLabel="View Details"
      onViewAll={() => navigate("/portal/legalnations/companies")}
    >
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">{activeCompany.name} — {activeCompany.entityType} ({activeCompany.state})</p>
        <div className="flex items-center gap-3">
          <Progress value={progressPercent} className="flex-1 h-2.5" />
          <span className="text-sm font-bold text-blue-600">{progressPercent}%</span>
        </div>

        <div className="flex items-center gap-1">
          {activeCompany.stages.map((stage, i) => {
            const isDone = stage.status === "completed";
            const isCurrent = stage.status === "in-progress";
            return (
              <div key={stage.id} className="flex items-center gap-1">
                {i > 0 && (
                  <div className={cn(
                    "h-0.5 w-4 lg:w-6",
                    isDone ? "bg-emerald-500" : isCurrent ? "bg-blue-400" : "bg-muted"
                  )} />
                )}
                <div className="flex flex-col items-center gap-1">
                  <div className={cn(
                    "size-7 rounded-full flex items-center justify-center text-xs font-medium",
                    isDone && "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
                    isCurrent && "bg-blue-100 text-blue-700 ring-2 ring-blue-400/40 dark:bg-blue-950 dark:text-blue-300",
                    !isDone && !isCurrent && "bg-muted text-muted-foreground"
                  )}>
                    {isDone ? <CheckCircle2 className="size-3.5" /> : i + 1}
                  </div>
                  <span className={cn(
                    "text-[9px] text-center leading-tight font-medium hidden lg:block max-w-[60px]",
                    isDone && "text-emerald-700 dark:text-emerald-300",
                    isCurrent && "text-blue-700 dark:text-blue-300",
                    !isDone && !isCurrent && "text-muted-foreground"
                  )}>
                    {stage.name.split(" & ")[0].split(" ").slice(0, 2).join(" ")}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {currentStage && (
          <div className="rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900 p-3">
            <div className="flex items-center gap-2">
              <Clock className="size-4 text-blue-600 animate-pulse" />
              <span className="text-sm font-semibold text-blue-800 dark:text-blue-300">Current: {currentStage.name}</span>
            </div>
            <p className="text-xs text-blue-700/70 dark:text-blue-400/70 mt-1">{currentStage.description}</p>
          </div>
        )}
      </div>
    </SectionCard>
  );
}

const activityIconMap: Record<string, typeof CheckCircle2> = {
  check: CheckCircle2,
  file: FileText,
  dollar: DollarSign,
  shield: Shield,
};

const activityColorMap: Record<string, string> = {
  check: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30",
  file: "bg-blue-100 text-blue-600 dark:bg-blue-900/30",
  dollar: "bg-green-100 text-green-600 dark:bg-green-900/30",
  shield: "bg-purple-100 text-purple-600 dark:bg-purple-900/30",
};

const deadlinePriorityVariant: Record<string, "success" | "error" | "warning" | "neutral" | "info"> = {
  high: "error",
  medium: "warning",
  low: "neutral",
};

function DashboardSkeleton() {
  return (
    <PageShell>
      <Skeleton className="h-40 w-full rounded-2xl" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-48 rounded-xl" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    </PageShell>
  );
}

export default function PortalDashboard() {
  const unreadMessages = portalMessages.filter(m => !m.read).length;
  const pendingInvoices = portalInvoices.filter(i => i.status === "pending" || i.status === "overdue").length;
  const actionDocs = portalDocuments.filter(d => d.status === "pending-review" || d.status === "action-required").length;
  const activeFormations = portalCompanies.filter(c => c.status === "in-progress").length;

  return (
    <PageShell>
      <HeroBanner
        eyebrow={`Welcome back, ${portalClient.name}`}
        headline="Client Portal"
        tagline="Your company formations are on track. Here's your latest overview."
        color="#2563eb"
        colorDark="#3730a3"
        metrics={[
          { label: "Companies", value: portalCompanies.length },
          { label: "Documents", value: portalDocuments.filter(d => d.status === "verified").length },
          { label: "New Messages", value: unreadMessages },
        ]}
      />

      <StatGrid cols={4}>
        <StatCard
          label="Active Formations"
          value={activeFormations}
          icon={Building2}
          iconBg="#dbeafe"
          iconColor="#2563eb"
          trend={`${portalCompanies.filter(c => c.status === "completed").length} completed`}
        />
        <StatCard
          label="Pending Invoices"
          value={pendingInvoices}
          icon={DollarSign}
          iconBg="#fef3c7"
          iconColor="#d97706"
          trend={`$${portalInvoices.filter(i => i.status !== "paid").reduce((s, i) => s + i.amount, 0)} due`}
        />
        <StatCard
          label="Action Required"
          value={actionDocs}
          icon={AlertCircle}
          iconBg="#fee2e2"
          iconColor="#dc2626"
          trend="Documents need review"
        />
        <StatCard
          label="Messages"
          value={unreadMessages}
          icon={MessageSquare}
          iconBg="#d1fae5"
          iconColor="#059669"
          trend="Unread from team"
        />
      </StatGrid>

      <FormationProgressCard />

      <SectionGrid cols={2}>
        <SectionCard title="Recent Activity">
          <div className="space-y-3">
            {portalActivity.slice(0, 5).map((act) => {
              const Icon = activityIconMap[act.icon] || Clock;
              const color = activityColorMap[act.icon] || "bg-slate-100 text-slate-500";
              return (
                <div key={act.id} className="flex items-start gap-3" data-testid={`activity-${act.id}`}>
                  <div className={cn("size-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5", color)}>
                    <Icon className="size-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{act.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{act.description}</p>
                  </div>
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap shrink-0">
                    {new Date(act.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                </div>
              );
            })}
          </div>
        </SectionCard>

        <SectionCard title="Upcoming Deadlines">
          <div className="space-y-3">
            {upcomingDeadlines.map(dl => (
              <div key={dl.id} className="flex items-center gap-3 rounded-lg border px-4 py-3" data-testid={`deadline-${dl.id}`}>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{dl.title}</p>
                  <p className="text-xs text-muted-foreground">{dl.company}</p>
                </div>
                <div className="text-right shrink-0 flex items-center gap-2">
                  <span className="text-xs font-medium">
                    {new Date(dl.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                  <StatusBadge status={dl.priority} variant={deadlinePriorityVariant[dl.priority]} />
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </SectionGrid>

      <SectionGrid cols={3}>
        <Link href="/portal/legalnations/companies">
          <SectionCard title="My Companies">
            <div className="space-y-2">
              <Building2 className="size-5 text-blue-500" />
              <p className="text-xs text-muted-foreground">View all your companies and their formation status</p>
              <ArrowRight className="size-4 text-muted-foreground" />
            </div>
          </SectionCard>
        </Link>
        <Link href="/portal/legalnations/documents">
          <SectionCard title="Documents">
            <div className="space-y-2">
              <FileText className="size-5 text-purple-500" />
              <p className="text-xs text-muted-foreground">Access your formation documents and compliance files</p>
              <ArrowRight className="size-4 text-muted-foreground" />
            </div>
          </SectionCard>
        </Link>
        <Link href="/portal/legalnations/messages">
          <SectionCard title="Messages">
            <div className="space-y-2">
              <MessageSquare className="size-5 text-emerald-500" />
              <p className="text-xs text-muted-foreground">Chat with your formation specialist team</p>
              <ArrowRight className="size-4 text-muted-foreground" />
            </div>
          </SectionCard>
        </Link>
      </SectionGrid>
    </PageShell>
  );
}
