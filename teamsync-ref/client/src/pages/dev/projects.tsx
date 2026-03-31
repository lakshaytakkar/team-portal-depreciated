import { useMemo, useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PersonCell } from "@/components/ui/avatar-cells";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { StatsCard } from "@/components/ds/stats-card";
import { StatsCardSkeleton } from "@/components/ui/card-skeleton";
import { StatusBadge } from "@/components/ds/status-badge";
import { FormDialog } from "@/components/ds/form-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageTransition, Stagger, StaggerItem, Fade } from "@/components/ui/animated";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { DevProjectRecord, DevTaskRecord } from "@shared/schema";
import {
  FolderKanban,
  Search,
  Plus,
  Users,
  CheckCircle2,
  ListTodo,
  TrendingUp,
  Calendar,
} from "lucide-react";
import { PageShell } from "@/components/layout";

interface ProjectWithCounts extends DevProjectRecord {
  taskCount: number;
  completedTaskCount: number;
}

const statusVariant: Record<string, "success" | "error" | "warning" | "neutral" | "info"> = {
  active: "success",
  paused: "warning",
  completed: "info",
  archived: "neutral",
};

export default function DevProjects() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newProject, setNewProject] = useState({
    name: "",
    key: "",
    description: "",
    color: "#6366F1",
    status: "active" as string,
  });

  const { data: projects = [], isLoading: projectsLoading } = useQuery<ProjectWithCounts[]>({
    queryKey: ["/api/dev/projects"],
  });

  const { data: tasks = [], isLoading: tasksLoading } = useQuery<DevTaskRecord[]>({
    queryKey: ["/api/dev/tasks"],
  });

  const loading = projectsLoading || tasksLoading;

  const createProjectMutation = useMutation({
    mutationFn: async (data: { name: string; key: string; description: string; color: string; status: string }) => {
      const res = await apiRequest("POST", "/api/dev/projects", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dev/projects"] });
      toast({
        title: "Project Created",
        description: `${newProject.name} (${newProject.key}) has been created.`,
      });
      setAddDialogOpen(false);
      setNewProject({ name: "", key: "", description: "", color: "#6366F1", status: "active" });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const filteredProjects = useMemo(() => {
    let result = [...projects];
    if (statusFilter !== "all") {
      result = result.filter((p) => p.status === statusFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.key.toLowerCase().includes(q) ||
          (p.description ?? "").toLowerCase().includes(q)
      );
    }
    return result;
  }, [projects, statusFilter, searchQuery]);

  const totalProjects = projects.length;
  const activeProjects = projects.filter((p) => p.status === "active").length;
  const tasksInProgress = tasks.filter((t) => t.status === "in-progress").length;
  const totalTasks = projects.reduce((sum, p) => sum + p.taskCount, 0);
  const completedTasks = projects.reduce((sum, p) => sum + p.completedTaskCount, 0);
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const handleAddProject = () => {
    if (newProject.name.trim() && newProject.key.trim()) {
      createProjectMutation.mutate(newProject);
    }
  };

  return (
    <PageShell>
      <PageTransition>
        <Fade direction="up" delay={0}>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-3">
              <FolderKanban className="size-6 text-primary" />
              <div>
                <h1 className="text-2xl font-semibold font-heading tracking-tight" data-testid="text-page-title">
                  Projects
                </h1>
                <p className="text-sm text-muted-foreground">
                  Manage all development projects and track progress
                </p>
              </div>
            </div>
            <Button onClick={() => setAddDialogOpen(true)} data-testid="button-add-project">
              <Plus className="size-4" />
              New Project
            </Button>
          </div>
        </Fade>

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
                title="Total Projects"
                value={totalProjects}
                change={`${activeProjects} active`}
                changeType="positive"
                icon={<FolderKanban className="size-5" />}
                sparkline={{ values: [3, 4, 4, 5, 5, 6, totalProjects], color: "#6366F1" }}
              />
            </StaggerItem>
            <StaggerItem>
              <StatsCard
                title="Active Projects"
                value={activeProjects}
                change={`${projects.filter((p) => p.status === "paused").length} paused`}
                changeType="warning"
                icon={<CheckCircle2 className="size-5" />}
                sparkline={{ values: [2, 3, 3, 4, 4, 5, activeProjects], color: "#10B981" }}
              />
            </StaggerItem>
            <StaggerItem>
              <StatsCard
                title="Tasks In Progress"
                value={tasksInProgress}
                change={`${tasks.filter((t) => t.status === "todo").length} to do`}
                changeType="neutral"
                icon={<ListTodo className="size-5" />}
                sparkline={{ values: [4, 5, 6, 5, 7, 6, tasksInProgress], color: "#3B82F6" }}
              />
            </StaggerItem>
            <StaggerItem>
              <StatsCard
                title="Completion Rate"
                value={`${completionRate}%`}
                change={`${completedTasks}/${totalTasks} tasks done`}
                changeType={completionRate >= 50 ? "positive" : "warning"}
                icon={<TrendingUp className="size-5" />}
                sparkline={{ values: [30, 35, 40, 42, 45, 48, completionRate], color: "#F59E0B" }}
              />
            </StaggerItem>
          </Stagger>
        )}

        <Fade direction="up" delay={0.1}>
          <div className="flex flex-wrap items-center gap-3 mt-6 mb-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 w-56 pl-8 text-sm"
                data-testid="input-project-search"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-9 w-auto min-w-[140px] text-sm" data-testid="filter-project-status">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Fade>

        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-lg border bg-background p-5">
                <div className="flex flex-col gap-3">
                  <Skeleton className="h-2 w-full rounded-full" />
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-6 w-10 rounded" />
                    <Skeleton className="h-5 w-32" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-2 w-full rounded-full" />
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Stagger staggerInterval={0.05} delay={0.15} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-2">
            {filteredProjects.map((project) => (
              <StaggerItem key={project.id}>
                <ProjectCard project={project} onClick={() => navigate(`/dev/projects/${project.id}`)} />
              </StaggerItem>
            ))}
          </Stagger>
        )}

        {!loading && filteredProjects.length === 0 && (
          <Fade direction="up" delay={0.2}>
            <div className="mt-12 text-center">
              <FolderKanban className="mx-auto size-12 text-muted-foreground/40" />
              <h3 className="mt-3 text-base font-semibold font-heading" data-testid="text-empty-title">No projects found</h3>
              <p className="mt-1 text-sm text-muted-foreground" data-testid="text-empty-description">
                Try adjusting your search or filter criteria.
              </p>
            </div>
          </Fade>
        )}

        <FormDialog
          open={addDialogOpen}
          onOpenChange={setAddDialogOpen}
          title="Create New Project"
          onSubmit={handleAddProject}
          submitLabel="Create Project"
        >
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="project-name">Project Name</Label>
              <Input
                id="project-name"
                placeholder="e.g., My Project"
                value={newProject.name}
                onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                data-testid="input-project-name"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="project-key">Key</Label>
              <Input
                id="project-key"
                placeholder="e.g., MP"
                value={newProject.key}
                onChange={(e) => setNewProject({ ...newProject, key: e.target.value.toUpperCase() })}
                className="uppercase"
                maxLength={5}
                data-testid="input-project-key"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="project-description">Description</Label>
              <Input
                id="project-description"
                placeholder="Brief description of the project"
                value={newProject.description}
                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                data-testid="input-project-description"
              />
            </div>
            <div className="flex items-center gap-4">
              <div className="flex flex-col gap-2 flex-1">
                <Label htmlFor="project-color">Color</Label>
                <div className="flex items-center gap-2">
                  <input
                    id="project-color"
                    type="color"
                    value={newProject.color}
                    onChange={(e) => setNewProject({ ...newProject, color: e.target.value })}
                    className="h-9 w-12 cursor-pointer rounded-md border p-1"
                    data-testid="input-project-color"
                  />
                  <span className="text-sm text-muted-foreground">{newProject.color}</span>
                </div>
              </div>
              <div className="flex flex-col gap-2 flex-1">
                <Label>Status</Label>
                <Select
                  value={newProject.status}
                  onValueChange={(val) => setNewProject({ ...newProject, status: val })}
                >
                  <SelectTrigger className="h-9 text-sm" data-testid="select-project-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </FormDialog>
      </PageTransition>
    </PageShell>
  );
}

function ProjectCard({ project, onClick }: { project: ProjectWithCounts; onClick: () => void }) {
  const progressPercent =
    project.taskCount > 0
      ? Math.round((project.completedTaskCount / project.taskCount) * 100)
      : 0;

  const updatedLabel = project.updatedAt
    ? new Date(project.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "";

  return (
    <Card
      className="overflow-visible cursor-pointer hover-elevate"
      onClick={onClick}
      data-testid={`card-project-${project.id}`}
    >
      <div
        className="h-1.5 rounded-t-md"
        style={{ backgroundColor: project.color }}
      />
      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <Badge
              variant="secondary"
              className="border-0 text-xs font-bold shrink-0"
              style={{
                backgroundColor: `${project.color}15`,
                color: project.color,
              }}
              data-testid={`badge-project-key-${project.id}`}
            >
              {project.key}
            </Badge>
            <h3
              className="text-sm font-semibold font-heading truncate"
              data-testid={`text-project-name-${project.id}`}
            >
              {project.name}
            </h3>
          </div>
          <StatusBadge
            status={project.status.charAt(0).toUpperCase() + project.status.slice(1)}
            variant={statusVariant[project.status]}
          />
        </div>

        <p
          className="text-xs text-muted-foreground line-clamp-2 mb-4"
          data-testid={`text-project-description-${project.id}`}
        >
          {project.description}
        </p>

        <div className="mb-3">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="text-xs text-muted-foreground">Progress</span>
            <span className="text-xs font-medium" data-testid={`text-project-progress-${project.id}`}>
              {project.completedTaskCount}/{project.taskCount} tasks ({progressPercent}%)
            </span>
          </div>
          <Progress value={progressPercent} className="h-1.5" />
        </div>

        <div className="flex items-center justify-between gap-2 pt-3 border-t flex-wrap">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <ListTodo className="size-3" />
              <span>{project.taskCount} tasks</span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="size-3" />
            <span data-testid={`text-project-updated-${project.id}`}>{updatedLabel}</span>
          </div>
        </div>

        <div className="mt-3" data-testid={`text-project-owner-${project.id}`}>
          <PersonCell name={project.owner} subtitle="Owner" size="xs" />
        </div>
      </div>
    </Card>
  );
}
