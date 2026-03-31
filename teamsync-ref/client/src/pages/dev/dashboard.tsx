import {
  MessageSquare,
  Key,
  BookOpen,
  Link2,
  ArrowRight,
  Palette,
  Wrench,
  Terminal,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Star,
  FolderKanban,
  CheckSquare,
  Bug,
  Zap,
  ArrowUp,
  ChevronUp,
  Minus,
  ChevronDown,
} from "lucide-react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { StatsCardSkeleton } from "@/components/ui/card-skeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ds/status-badge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  devPrompts,
  appCredentials,
  devResources,
  importantLinks,
} from "@/lib/mock-data-dev";
import { Fade, Stagger, StaggerItem, PageTransition } from "@/components/ui/animated";
import {
  PageShell,
  HeroBanner,
  StatGrid,
  StatCard,
  SectionCard,
  SectionGrid,
} from "@/components/layout";
import { ShortcutGrid } from "@/components/blocks";

interface ProjectWithCounts {
  id: string;
  name: string;
  key: string;
  description: string | null;
  color: string;
  status: string;
  owner: string;
  verticalId: string;
  createdAt: string;
  updatedAt: string;
  taskCount: number;
  completedTaskCount: number;
}

interface TaskRecord {
  id: string;
  projectId: string | null;
  taskCode: string | null;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  type: string;
  assignee: string;
  reporter: string;
  tags: string[] | null;
  dueDate: string | null;
  storyPoints: number | null;
  createdAt: string;
  updatedAt: string;
}

const priorityIcons: Record<string, JSX.Element> = {
  critical: <AlertTriangle className="size-3 text-red-500" />,
  high: <ChevronUp className="size-3 text-orange-500" />,
  medium: <Minus className="size-3 text-blue-500" />,
  low: <ChevronDown className="size-3 text-gray-400" />,
};

const typeIcons: Record<string, JSX.Element> = {
  bug: <Bug className="size-3 text-red-500" />,
  feature: <Zap className="size-3 text-purple-500" />,
  improvement: <ArrowUp className="size-3 text-blue-500" />,
  task: <CheckSquare className="size-3 text-gray-500" />,
  story: <BookOpen className="size-3 text-amber-500" />,
};

const statusVariant: Record<string, "success" | "error" | "warning" | "neutral" | "info"> = {
  backlog: "neutral",
  todo: "info",
  "in-progress": "warning",
  "in-review": "info",
  done: "success",
  cancelled: "error",
};

function formatLabel(s: string): string {
  return s.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

export default function DevDashboard() {
  const [, navigate] = useLocation();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const { data: dbProjects, isLoading: projectsLoading } = useQuery<ProjectWithCounts[]>({
    queryKey: ["/api/dev/projects"],
  });

  const { data: dbTasks, isLoading: tasksLoading } = useQuery<TaskRecord[]>({
    queryKey: ["/api/dev/tasks"],
  });

  const loading = projectsLoading || tasksLoading;
  const projects = dbProjects ?? [];
  const tasks = dbTasks ?? [];

  const totalPrompts = devPrompts.length;
  const activeCredentials = appCredentials.filter((c) => c.status === "active").length;
  const expiredCredentials = appCredentials.filter((c) => c.status === "expired").length;
  const pendingCredentials = appCredentials.filter((c) => c.status === "pending").length;
  const totalResources = devResources.length;
  const pinnedLinks = importantLinks.filter((l) => l.isPinned);
  const activeProjects = projects.filter((p) => p.status === "active").length;
  const totalTasks = tasks.length;
  const inProgressTasks = tasks.filter((t) => t.status === "in-progress").length;

  const recentPrompts = [...devPrompts]
    .sort((a, b) => new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime())
    .slice(0, 5);

  const myTasks = tasks
    .filter((t) => t.assignee === "Replit Agent" && t.status !== "done" && t.status !== "cancelled")
    .sort((a, b) => {
      const priorityOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
      return (priorityOrder[a.priority] ?? 3) - (priorityOrder[b.priority] ?? 3);
    })
    .slice(0, 6);

  const quickLinks = [
    {
      title: "Design System",
      description: "Style guide, components & icons",
      icon: Palette,
      url: "/dev/design-system",
      color: "#8b5cf6",
    },
    {
      title: "Projects",
      description: `${activeProjects} active projects`,
      icon: FolderKanban,
      url: "/dev/projects",
      color: "#6366f1",
    },
    {
      title: "Tasks",
      description: `${inProgressTasks} in progress`,
      icon: CheckSquare,
      url: "/dev/projects",
      color: "#f97316",
    },
    {
      title: "Prompts",
      description: `${totalPrompts} saved prompts`,
      icon: MessageSquare,
      url: "/dev/prompts",
      color: "#3b82f6",
    },
    {
      title: "Resources",
      description: `${totalResources} processes & playbooks`,
      icon: BookOpen,
      url: "/dev/resources",
      color: "#f59e0b",
    },
    {
      title: "Apps & Credentials",
      description: "External services & API keys",
      icon: Wrench,
      url: "/dev/apps",
      color: "#10b981",
    },
  ];

  return (
    <PageShell>
      <HeroBanner
        eyebrow={`${greeting}, Sneha Patel`}
        headline="Developer Hub"
        tagline="Design system, internal tooling & developer resources"
        color="#10B981"
        colorDark="#0a9064"
      />

      {loading ? (
        <StatGrid>
          <StatsCardSkeleton />
          <StatsCardSkeleton />
          <StatsCardSkeleton />
          <StatsCardSkeleton />
        </StatGrid>
      ) : (
        <StatGrid>
          <StatCard
            label="Active Projects"
            value={activeProjects}
            trend={`${projects.length} total`}
            icon={FolderKanban}
            iconBg="rgba(99, 102, 241, 0.1)"
            iconColor="#6366f1"
          />
          <StatCard
            label="Open Tasks"
            value={totalTasks - tasks.filter((t) => t.status === "done" || t.status === "cancelled").length}
            trend={`${inProgressTasks} in progress`}
            icon={CheckSquare}
            iconBg="rgba(249, 115, 22, 0.1)"
            iconColor="#f97316"
          />
          <StatCard
            label="Active Credentials"
            value={activeCredentials}
            trend={expiredCredentials > 0 ? `${expiredCredentials} expired` : "All active"}
            icon={Key}
            iconBg="rgba(16, 185, 129, 0.1)"
            iconColor="#10b981"
          />
          <StatCard
            label="Pinned Links"
            value={pinnedLinks.length}
            trend={`${importantLinks.length} total links`}
            icon={Link2}
            iconBg="rgba(139, 92, 246, 0.1)"
            iconColor="#8b5cf6"
          />
        </StatGrid>
      )}

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {[...Array(6)].map((_, i) => <StatsCardSkeleton key={i} />)}
        </div>
      ) : (
        <ShortcutGrid
          items={quickLinks.map((link) => ({
            id: link.title.toLowerCase().replace(/\s+/g, "-"),
            icon: link.icon,
            iconBg: `${link.color}15`,
            iconColor: link.color,
            label: link.title,
            onClick: () => navigate(link.url),
          }))}
          cols={6}
        />
      )}

      {loading ? (
        <SectionGrid>
          <Skeleton className="h-[400px] w-full rounded-xl" />
          <Skeleton className="h-[400px] w-full rounded-xl" />
        </SectionGrid>
      ) : (
        <SectionGrid>
          <SectionCard
            title="My Tasks"
            viewAllLabel="View All"
            onViewAll={() => navigate("/dev/projects")}
            noPadding
          >
            <div className="divide-y">
              {myTasks.map((task) => {
                const proj = projects.find((p) => p.id === task.projectId);
                return (
                  <div
                    key={task.id}
                    className="flex items-center justify-between gap-3 px-5 py-3 transition-colors hover:bg-muted/20 cursor-pointer"
                    onClick={() => navigate(`/dev/projects/${task.projectId}`)}
                    data-testid={`card-my-task-${task.id}`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 shrink-0">
                        {priorityIcons[task.priority]}
                        {typeIcons[task.type]}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className="text-[10px] shrink-0 px-1"
                            style={{ borderColor: proj?.color, color: proj?.color }}
                          >
                            {task.taskCode ?? task.id.slice(0, 8)}
                          </Badge>
                          <p className="text-sm font-medium truncate">{task.title}</p>
                        </div>
                      </div>
                    </div>
                    <StatusBadge status={formatLabel(task.status)} variant={statusVariant[task.status]} />
                  </div>
                );
              })}
              {myTasks.length === 0 && (
                <div className="p-5 text-center text-sm text-muted-foreground">All tasks complete!</div>
              )}
            </div>
          </SectionCard>

          <SectionCard
            title="Project Progress"
            viewAllLabel="View All"
            onViewAll={() => navigate("/dev/projects")}
          >
            <div className="space-y-4">
              {projects.map((proj) => {
                const pct = proj.taskCount > 0 ? Math.round((proj.completedTaskCount / proj.taskCount) * 100) : 0;
                return (
                  <div
                    key={proj.id}
                    className="cursor-pointer rounded-lg px-3 py-2 transition-colors hover:bg-muted/20"
                    onClick={() => navigate(`/dev/projects/${proj.id}`)}
                    data-testid={`card-project-progress-${proj.id}`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="size-2.5 rounded-full shrink-0" style={{ backgroundColor: proj.color }} />
                        <span className="text-sm font-medium truncate">{proj.name}</span>
                        <Badge variant="outline" className="text-[10px] shrink-0" style={{ borderColor: proj.color, color: proj.color }}>
                          {proj.key}
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0">{proj.completedTaskCount}/{proj.taskCount}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={pct} className="h-1.5 flex-1" />
                      <span className="text-xs font-medium text-muted-foreground w-8 text-right">{pct}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </SectionCard>
        </SectionGrid>
      )}

      {loading ? (
        <SectionGrid>
          <Skeleton className="h-[400px] w-full rounded-xl" />
          <Skeleton className="h-[400px] w-full rounded-xl" />
        </SectionGrid>
      ) : (
        <SectionGrid>
          <SectionCard
            title="Recent Prompts"
            viewAllLabel="View All"
            onViewAll={() => navigate("/dev/prompts")}
            noPadding
          >
            <div className="divide-y">
              {recentPrompts.map((prompt) => (
                <div
                  key={prompt.id}
                  className="flex items-center justify-between gap-3 px-5 py-3 transition-colors hover:bg-muted/20"
                  data-testid={`card-prompt-${prompt.id}`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium truncate">{prompt.title}</p>
                      {prompt.isFavorite && <Star className="size-3 text-amber-500 fill-amber-500 shrink-0" />}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {prompt.category} &middot; Last used {prompt.lastUsed}
                    </p>
                  </div>
                  <Badge variant="secondary" className="shrink-0">
                    {prompt.model}
                  </Badge>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard
            title="Credential Status"
            viewAllLabel="View All"
            onViewAll={() => navigate("/dev/apps")}
          >
            <div className="grid grid-cols-3 gap-4 mb-5">
              <div className="flex flex-col items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900 dark:bg-emerald-950/50" data-testid="credential-active-count">
                <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-2xl font-semibold font-heading text-emerald-700 dark:text-emerald-300">{activeCredentials}</span>
                <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Active</span>
              </div>
              <div className="flex flex-col items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/50" data-testid="credential-expired-count">
                <AlertTriangle className="size-4 text-red-600 dark:text-red-400" />
                <span className="text-2xl font-semibold font-heading text-red-700 dark:text-red-300">{expiredCredentials}</span>
                <span className="text-xs font-medium text-red-600 dark:text-red-400">Expired</span>
              </div>
              <div className="flex flex-col items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/50" data-testid="credential-pending-count">
                <Clock className="size-4 text-amber-600 dark:text-amber-400" />
                <span className="text-2xl font-semibold font-heading text-amber-700 dark:text-amber-300">{pendingCredentials}</span>
                <span className="text-xs font-medium text-amber-600 dark:text-amber-400">Pending</span>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              {appCredentials
                .filter((c) => c.status !== "active")
                .slice(0, 4)
                .map((cred) => (
                  <div
                    key={cred.id}
                    className="flex items-center justify-between gap-3 rounded-md px-3 py-2 transition-colors hover:bg-muted/20"
                    data-testid={`credential-alert-${cred.id}`}
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{cred.appName}</p>
                      <p className="text-xs text-muted-foreground">{cred.environment} &middot; {cred.apiKeyHint}</p>
                    </div>
                    <StatusBadge
                      status={cred.status === "expired" ? "Expired" : "Pending"}
                      variant={cred.status === "expired" ? "error" : "warning"}
                    />
                  </div>
                ))}
            </div>
          </SectionCard>
        </SectionGrid>
      )}
    </PageShell>
  );
}
