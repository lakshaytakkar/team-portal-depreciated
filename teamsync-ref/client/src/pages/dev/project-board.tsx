import { useMemo, useState, useCallback } from "react";
import { Link, useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { DataTable, type Column } from "@/components/ds/data-table";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { StatsCardSkeleton } from "@/components/ui/card-skeleton";
import { StatusBadge } from "@/components/ds/status-badge";
import { FormDialog } from "@/components/ds/form-dialog";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { KanbanBoard, type KanbanColumnData, type KanbanCardItem } from "@/components/blocks/kanban-blocks";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { PersonCell } from "@/components/ui/avatar-cells";
import { Spinner } from "@/components/ui/spinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageTransition, Stagger, StaggerItem, Fade } from "@/components/ui/animated";
import {
  projectLinks,
  projectCredentials,
  type DevTask,
  type DevProject,
} from "@/lib/mock-data-dev";
import type { DevTaskRecord, DevProjectRecord, DevSubtaskRecord, DevCommentRecord } from "@shared/schema";
import {
  ArrowLeft,
  LayoutGrid,
  List,
  Search,
  Plus,
  Calendar,
  Clock,
  Zap,
  Bug,
  ArrowUpCircle,
  CheckCircle2,
  BookOpen,
  AlertCircle,
  CircleDot,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Globe,
  type LucideIcon,
} from "lucide-react";
import {
  SiReplit,
  SiSupabase,
  SiGithub,
  SiStripe,
  SiVercel,
  SiOpenai,
  SiFigma,
  SiNotion,
  SiResend,
} from "react-icons/si";
import { useToast } from "@/hooks/use-toast";
import { TaskDetailDialog } from "@/components/dev/task-detail-dialog";
import { PageShell } from "@/components/layout";

type IconComponent = LucideIcon | ((props: { className?: string }) => JSX.Element);

const siIconMap: Record<string, IconComponent> = {
  SiReplit: (props: { className?: string }) => <SiReplit className={props.className} />,
  SiSupabase: (props: { className?: string }) => <SiSupabase className={props.className} />,
  SiGithub: (props: { className?: string }) => <SiGithub className={props.className} />,
  SiStripe: (props: { className?: string }) => <SiStripe className={props.className} />,
  SiVercel: (props: { className?: string }) => <SiVercel className={props.className} />,
  SiOpenai: (props: { className?: string }) => <SiOpenai className={props.className} />,
  SiFigma: (props: { className?: string }) => <SiFigma className={props.className} />,
  SiNotion: (props: { className?: string }) => <SiNotion className={props.className} />,
  SiResend: (props: { className?: string }) => <SiResend className={props.className} />,
};

function getIconComponent(iconName: string): IconComponent {
  if (siIconMap[iconName]) return siIconMap[iconName];
  return Globe;
}

type TaskStatus = "backlog" | "todo" | "in-progress" | "in-review" | "done";

const KANBAN_STATUSES: TaskStatus[] = ["backlog", "todo", "in-progress", "in-review", "done"];

const STATUS_LABELS: Record<TaskStatus, string> = {
  backlog: "Backlog",
  todo: "To Do",
  "in-progress": "In Progress",
  "in-review": "In Review",
  done: "Done",
};

const STATUS_VARIANT: Record<string, "success" | "error" | "warning" | "neutral" | "info"> = {
  backlog: "neutral",
  todo: "info",
  "in-progress": "warning",
  "in-review": "info",
  done: "success",
  cancelled: "error",
};

const PRIORITY_COLORS: Record<string, string> = {
  critical: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300",
  high: "bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
  medium: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  low: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
};

const TYPE_ICONS: Record<string, typeof Bug> = {
  bug: Bug,
  feature: Zap,
  improvement: ArrowUpCircle,
  task: CheckCircle2,
  story: BookOpen,
};


function isOverdue(dueDate: string | null): boolean {
  if (!dueDate) return false;
  return new Date(dueDate) < new Date();
}

interface BoardTask {
  id: string;
  dbId: string;
  projectId: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  type: string;
  assignee: string;
  reporter: string;
  tags: string[];
  dueDate: string;
  storyPoints: number;
  createdDate: string;
  updatedDate: string;
}

function mapDbTask(t: DevTaskRecord): BoardTask {
  return {
    id: t.taskCode || t.id,
    dbId: t.id,
    projectId: t.projectId || "",
    title: t.title,
    description: t.description || "",
    status: t.status,
    priority: t.priority,
    type: t.type,
    assignee: t.assignee,
    reporter: t.reporter,
    tags: t.tags || [],
    dueDate: t.dueDate || "",
    storyPoints: t.storyPoints || 0,
    createdDate: t.createdAt ? new Date(t.createdAt).toISOString().split("T")[0] : "",
    updatedDate: t.updatedAt ? new Date(t.updatedAt).toISOString().split("T")[0] : "",
  };
}

function boardTaskToDevTask(t: BoardTask, projectKey: string): DevTask {
  return {
    id: t.id,
    projectId: t.projectId,
    projectKey,
    title: t.title,
    description: t.description,
    status: t.status as DevTask["status"],
    priority: t.priority as DevTask["priority"],
    type: t.type as DevTask["type"],
    assignee: t.assignee,
    reporter: t.reporter,
    tags: t.tags,
    dueDate: t.dueDate,
    createdDate: t.createdDate,
    updatedDate: t.updatedDate,
    storyPoints: t.storyPoints,
    subtasks: [],
    comments: [],
    attachments: [],
  };
}

interface DbProjectResponse extends DevProjectRecord {
  taskCount?: number;
  completedTaskCount?: number;
}

export default function DevProjectBoard() {
  const params = useParams<{ id: string }>();
  const { toast } = useToast();

  const { data: project, isLoading: projectLoading } = useQuery<DbProjectResponse>({
    queryKey: ["/api/dev/projects", params.id],
  });

  const { data: dbTasks = [], isLoading: tasksLoading } = useQuery<DevTaskRecord[]>({
    queryKey: ["/api/dev/projects", params.id, "tasks"],
  });

  const loading = projectLoading || tasksLoading;

  const projectTasks = useMemo(() => dbTasks.map(mapDbTask), [dbTasks]);

  const [view, setView] = useState<"kanban" | "list">("kanban");
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [assigneeFilter, setAssigneeFilter] = useState("all");
  const [addTaskOpen, setAddTaskOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<DevTask | null>(null);
  const [taskDetailOpen, setTaskDetailOpen] = useState(false);
  const [linksExpanded, setLinksExpanded] = useState(true);

  const projLinks = useMemo(
    () => projectLinks.filter((l) => l.projectId === params.id),
    [params.id]
  );
  const projCreds = useMemo(
    () => projectCredentials.filter((c) => c.projectId === params.id),
    [params.id]
  );
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Record<string, string>>({});

  function startEditing(fieldId: string, currentValue: string) {
    setEditingField(fieldId);
    setEditValues((prev) => ({ ...prev, [fieldId]: currentValue }));
  }

  function commitEdit(fieldId: string) {
    setEditingField(null);
    toast({ title: "Updated", description: "Field saved (local only)" });
  }
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    status: "todo" as string,
    priority: "medium" as string,
    type: "task" as string,
    assignee: "",
    dueDate: "",
    storyPoints: "",
    tags: "",
  });

  const assignees = useMemo(() => {
    const set = new Set<string>();
    projectTasks.forEach((t) => { if (t.assignee) set.add(t.assignee); });
    return Array.from(set);
  }, [projectTasks]);

  const filteredTasks = useMemo(() => {
    let result = [...projectTasks];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.id.toLowerCase().includes(q)
      );
    }
    if (priorityFilter !== "all") {
      result = result.filter((t) => t.priority === priorityFilter);
    }
    if (typeFilter !== "all") {
      result = result.filter((t) => t.type === typeFilter);
    }
    if (assigneeFilter !== "all") {
      result = result.filter((t) => t.assignee === assigneeFilter);
    }
    return result;
  }, [projectTasks, searchQuery, priorityFilter, typeFilter, assigneeFilter]);

  const kanbanColumns = useMemo(() => {
    return KANBAN_STATUSES.map((status) => ({
      status,
      label: STATUS_LABELS[status],
      tasks: filteredTasks.filter((t) => t.status === status),
    }));
  }, [filteredTasks]);

  const kanbanBoardColumns: KanbanColumnData[] = useMemo(() => {
    return kanbanColumns.map(({ status, label, tasks }) => ({
      id: status,
      title: label,
      cards: tasks.map((task) => ({
        id: task.id,
        title: task.title,
      })),
    }));
  }, [kanbanColumns]);

  const taskMap = useMemo(() => {
    const map = new Map<string, BoardTask>();
    filteredTasks.forEach((t) => map.set(t.id, t));
    return map;
  }, [filteredTasks]);

  const invalidateAllDevQueries = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/dev/projects", params.id, "tasks"] });
    queryClient.invalidateQueries({ queryKey: ["/api/dev/projects"] });
    queryClient.invalidateQueries({ queryKey: ["/api/dev/tasks"] });
  };

  const updateTaskMutation = useMutation({
    mutationFn: async ({ dbId, updates }: { dbId: string; updates: Record<string, unknown> }) => {
      await apiRequest("PATCH", `/api/dev/tasks/${dbId}`, updates);
    },
    onSuccess: invalidateAllDevQueries,
    onError: (err: Error) => {
      toast({ title: "Update failed", description: err.message, variant: "destructive" });
    },
  });

  const handleCardMove = useCallback(
    (cardId: string, sourceColumnId: string, targetColumnId: string) => {
      const task = taskMap.get(cardId);
      if (task) {
        updateTaskMutation.mutate({ dbId: task.dbId, updates: { status: targetColumnId } });
        toast({
          title: "Task Moved",
          description: `${task.id} moved from ${STATUS_LABELS[sourceColumnId as TaskStatus]} to ${STATUS_LABELS[targetColumnId as TaskStatus]}`,
        });
      }
    },
    [taskMap, toast, updateTaskMutation]
  );

  const createTaskMutation = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await apiRequest("POST", "/api/dev/tasks", data);
      return res.json();
    },
    onSuccess: () => {
      invalidateAllDevQueries();
      toast({ title: "Task Created" });
    },
    onError: (err: Error) => {
      toast({ title: "Create failed", description: err.message, variant: "destructive" });
    },
  });

  const handleAddTask = () => {
    if (!newTask.title.trim()) return;
    const taskData: Record<string, unknown> = {
      projectId: params.id,
      title: newTask.title.trim(),
      description: newTask.description.trim() || null,
      status: newTask.status,
      priority: newTask.priority,
      type: newTask.type,
      assignee: newTask.assignee || "Replit Agent",
      reporter: "Sneha Patel",
      tags: newTask.tags ? newTask.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
      dueDate: newTask.dueDate || null,
      storyPoints: newTask.storyPoints ? parseInt(newTask.storyPoints, 10) : null,
    };
    createTaskMutation.mutate(taskData);
    setAddTaskOpen(false);
    setNewTask({
      title: "",
      description: "",
      status: "todo",
      priority: "medium",
      type: "task",
      assignee: "",
      dueDate: "",
      storyPoints: "",
      tags: "",
    });
  };

  const handleTaskUpdate = useCallback(
    (updatedTask: DevTask) => {
      const original = projectTasks.find((t) => t.id === updatedTask.id);
      if (!original) return;
      const updates: Record<string, unknown> = {};
      if (updatedTask.status !== original.status) updates.status = updatedTask.status;
      if (updatedTask.priority !== original.priority) updates.priority = updatedTask.priority;
      if (updatedTask.type !== original.type) updates.type = updatedTask.type;
      if (updatedTask.assignee !== original.assignee) updates.assignee = updatedTask.assignee;
      if (Object.keys(updates).length > 0) {
        updateTaskMutation.mutate({ dbId: original.dbId, updates });
      }
    },
    [projectTasks, updateTaskMutation]
  );

  const openTaskDetail = useCallback(
    async (task: BoardTask) => {
      const devTask = boardTaskToDevTask(task, project?.key || "");
      setSelectedTask(devTask);
      setTaskDetailOpen(true);
      try {
        const res = await fetch(`/api/dev/tasks/${task.dbId}`);
        if (res.ok) {
          const fullTask = await res.json();
          setSelectedTask({
            ...devTask,
            subtasks: (fullTask.subtasks || []).map((s: any) => ({
              id: s.id,
              title: s.title,
              completed: s.completed,
            })),
            comments: (fullTask.comments || []).map((c: any) => ({
              id: c.id,
              author: c.author,
              content: c.content,
              timestamp: c.createdAt ? new Date(c.createdAt).toLocaleString() : "",
            })),
          });
        }
      } catch {}
    },
    [project]
  );

  if (!loading && !project) {
    return (
      <PageShell>
        <div className="flex flex-col items-center justify-center gap-4 py-20">
          <AlertCircle className="size-12 text-muted-foreground" />
          <h2 className="text-lg font-semibold font-heading" data-testid="text-project-not-found">
            Project Not Found
          </h2>
          <p className="text-sm text-muted-foreground">
            The project you're looking for doesn't exist.
          </p>
          <Link href="/dev/projects">
            <Button variant="outline" data-testid="link-back-projects">
              <ArrowLeft className="size-4 mr-1" />
              Back to Projects
            </Button>
          </Link>
        </div>
      </PageShell>
    );
  }

  if (loading || !project) {
    return (
      <PageShell>
        <div className="flex flex-col items-center justify-center gap-4 py-20">
          <Spinner className="size-8" />
          <p className="text-sm text-muted-foreground">Loading project...</p>
        </div>
      </PageShell>
    );
  }

  const totalTasks = projectTasks.length;
  const doneTasks = projectTasks.filter((t) => t.status === "done").length;
  const inProgressTasks = projectTasks.filter((t) => t.status === "in-progress").length;
  const overdueTasks = projectTasks.filter((t) => isOverdue(t.dueDate) && t.status !== "done" && t.status !== "cancelled").length;

  const columns: Column<BoardTask>[] = [
    {
      key: "id",
      header: "ID",
      sortable: true,
      render: (item) => (
        <Badge
          variant="secondary"
          className="border-0 text-xs"
          style={{ backgroundColor: `${project.color}15`, color: project.color }}
          data-testid={`badge-task-id-${item.id}`}
        >
          {item.id}
        </Badge>
      ),
    },
    {
      key: "title",
      header: "Title",
      sortable: true,
      render: (item) => (
        <span className="text-sm font-medium line-clamp-1 max-w-[300px]" data-testid={`text-task-title-${item.id}`}>
          {item.title}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (item) => (
        <StatusBadge
          status={STATUS_LABELS[item.status as TaskStatus] || item.status}
          variant={STATUS_VARIANT[item.status]}
        />
      ),
    },
    {
      key: "priority",
      header: "Priority",
      sortable: true,
      render: (item) => (
        <Badge
          variant="secondary"
          className={`border-0 text-xs capitalize ${PRIORITY_COLORS[item.priority]}`}
          data-testid={`badge-priority-${item.id}`}
        >
          {item.priority}
        </Badge>
      ),
    },
    {
      key: "type",
      header: "Type",
      sortable: true,
      render: (item) => {
        const TypeIcon = TYPE_ICONS[item.type] || CircleDot;
        return (
          <div className="flex items-center gap-1.5">
            <TypeIcon className="size-3.5 text-muted-foreground" />
            <span className="text-sm capitalize">{item.type}</span>
          </div>
        );
      },
    },
    {
      key: "assignee",
      header: "Assignee",
      sortable: true,
      render: (item) => (
        <PersonCell name={item.assignee} size="xs" />
      ),
    },
    {
      key: "dueDate",
      header: "Due Date",
      sortable: true,
      render: (item) =>
        item.dueDate ? (
          <span
            className={`text-sm ${isOverdue(item.dueDate) && item.status !== "done" ? "text-red-600 dark:text-red-400 font-medium" : "text-muted-foreground"}`}
            data-testid={`text-due-date-${item.id}`}
          >
            {item.dueDate}
          </span>
        ) : (
          <span className="text-sm text-muted-foreground">-</span>
        ),
    },
    {
      key: "storyPoints",
      header: "SP",
      sortable: true,
      render: (item) => (
        <Badge variant="secondary" className="border-0 text-xs" data-testid={`badge-sp-${item.id}`}>
          {item.storyPoints}
        </Badge>
      ),
    },
  ];

  const rowActions = [
    {
      label: "View Detail",
      onClick: (item: BoardTask) => {
        openTaskDetail(item);
      },
    },
  ];

  return (
    <PageShell>
      <PageTransition>
        <Fade direction="up" distance={10} delay={0.05}>
          <div className="flex flex-wrap items-center gap-3 mb-5">
            <Link href="/dev/projects">
              <Button variant="ghost" size="icon" data-testid="button-back-projects">
                <ArrowLeft className="size-4" />
              </Button>
            </Link>
            <div
              className="size-3 rounded-sm shrink-0"
              style={{ backgroundColor: project.color }}
            />
            <Badge
              variant="secondary"
              className="border-0 text-xs font-semibold"
              style={{ backgroundColor: `${project.color}15`, color: project.color }}
              data-testid="badge-project-key"
            >
              {project.key}
            </Badge>
            <h1 className="text-xl font-semibold font-heading tracking-tight" data-testid="text-project-name">
              {project.name}
            </h1>
            <StatusBadge
              status={project.status.charAt(0).toUpperCase() + project.status.slice(1)}
              variant={project.status === "active" ? "success" : project.status === "paused" ? "warning" : project.status === "completed" ? "info" : "neutral"}
            />
          </div>
          <p className="text-sm text-muted-foreground mb-5 ml-11" data-testid="text-project-description">
            {project.description}
          </p>
        </Fade>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
          </div>
        ) : (
          <Stagger staggerInterval={0.05} className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            <StaggerItem>
              <Card className="p-4" data-testid="card-stat-total-tasks">
                <p className="text-xs text-muted-foreground">Total Tasks</p>
                <p className="text-2xl font-semibold font-heading mt-1">{totalTasks}</p>
              </Card>
            </StaggerItem>
            <StaggerItem>
              <Card className="p-4" data-testid="card-stat-in-progress">
                <p className="text-xs text-muted-foreground">In Progress</p>
                <p className="text-2xl font-semibold font-heading mt-1">{inProgressTasks}</p>
              </Card>
            </StaggerItem>
            <StaggerItem>
              <Card className="p-4" data-testid="card-stat-done">
                <p className="text-xs text-muted-foreground">Completed</p>
                <p className="text-2xl font-semibold font-heading mt-1">{doneTasks}</p>
              </Card>
            </StaggerItem>
            <StaggerItem>
              <Card className="p-4" data-testid="card-stat-overdue">
                <p className="text-xs text-muted-foreground">Overdue</p>
                <p className={`text-2xl font-semibold font-heading mt-1 ${overdueTasks > 0 ? "text-red-600 dark:text-red-400" : ""}`}>
                  {overdueTasks}
                </p>
              </Card>
            </StaggerItem>
          </Stagger>
        )}

        {!loading && (projLinks.length > 0 || projCreds.length > 0) && (
          <Fade direction="up" distance={10} delay={0.08}>
            <div className="mb-5 rounded-lg border bg-background" data-testid="section-project-links-creds">
              <button
                onClick={() => setLinksExpanded(!linksExpanded)}
                className="flex w-full items-center justify-between gap-2 px-5 py-3 text-left transition-colors hover:bg-muted/30"
                data-testid="button-toggle-links-creds"
              >
                <div className="flex items-center gap-2">
                  {linksExpanded ? <ChevronDown className="size-4 text-muted-foreground" /> : <ChevronRight className="size-4 text-muted-foreground" />}
                  <span className="text-sm font-semibold font-heading">Links & Credentials</span>
                  <Badge variant="secondary" className="border-0 text-[10px] px-1.5 py-0">
                    {projLinks.length + projCreds.length}
                  </Badge>
                </div>
              </button>
              {linksExpanded && (
                <div className="border-t px-5 py-4 space-y-4">
                  {projLinks.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Quick Links</p>
                      <div className="flex flex-wrap gap-2">
                        {projLinks.map((link) => {
                          const IconComp = getIconComponent(link.iconName);
                          return (
                            <a
                              key={link.id}
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors hover:bg-muted/50"
                              data-testid={`link-project-${link.id}`}
                            >
                              <IconComp className="size-4 text-muted-foreground" />
                              <span className="font-medium">{link.label}</span>
                              <ExternalLink className="size-3 text-muted-foreground" />
                            </a>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  {projCreds.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">API Keys & Credentials</p>
                      <div className="rounded-md border overflow-hidden">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b bg-muted/30">
                              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">App</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Environment</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">API Key</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Status</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Notes</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y">
                            {projCreds.map((cred) => {
                              const IconComp = getIconComponent(cred.iconName);
                              const notesFieldId = `cred-notes-${cred.id}`;
                              const urlFieldId = `cred-url-${cred.id}`;
                              return (
                                <tr key={cred.id} className="transition-colors hover:bg-muted/20" data-testid={`row-project-cred-${cred.id}`}>
                                  <td className="px-3 py-2">
                                    <div className="flex items-center gap-2">
                                      <div className="flex size-7 items-center justify-center rounded-md bg-primary/10">
                                        <IconComp className="size-3.5 text-primary" />
                                      </div>
                                      <div className="min-w-0">
                                        <p className="font-medium text-sm truncate">{cred.appName}</p>
                                        {editingField === urlFieldId ? (
                                          <input
                                            className="text-xs text-muted-foreground bg-transparent border-b border-primary outline-none w-full"
                                            value={editValues[urlFieldId] ?? cred.url}
                                            onChange={(e) => setEditValues((prev) => ({ ...prev, [urlFieldId]: e.target.value }))}
                                            onBlur={() => commitEdit(urlFieldId)}
                                            onKeyDown={(e) => { if (e.key === "Enter") commitEdit(urlFieldId); }}
                                            autoFocus
                                            data-testid={`input-edit-cred-url-${cred.id}`}
                                          />
                                        ) : (
                                          <p
                                            className="text-xs text-muted-foreground truncate cursor-pointer hover:text-primary"
                                            onClick={() => startEditing(urlFieldId, cred.url)}
                                            data-testid={`text-cred-url-${cred.id}`}
                                          >
                                            {editValues[urlFieldId] ?? cred.url.replace("https://", "")}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-3 py-2">
                                    <StatusBadge
                                      status={cred.environment.charAt(0).toUpperCase() + cred.environment.slice(1)}
                                      variant={cred.environment === "production" ? "success" : cred.environment === "staging" ? "warning" : "info"}
                                    />
                                  </td>
                                  <td className="px-3 py-2">
                                    <code className="rounded-md bg-muted px-2 py-1 text-xs" data-testid={`text-cred-key-${cred.id}`}>
                                      {cred.apiKeyHint}
                                    </code>
                                  </td>
                                  <td className="px-3 py-2">
                                    <StatusBadge
                                      status={cred.status.charAt(0).toUpperCase() + cred.status.slice(1)}
                                      variant={cred.status === "active" ? "success" : cred.status === "expired" ? "error" : "warning"}
                                    />
                                  </td>
                                  <td className="px-3 py-2 max-w-[200px]">
                                    {editingField === notesFieldId ? (
                                      <input
                                        className="text-xs bg-transparent border-b border-primary outline-none w-full"
                                        value={editValues[notesFieldId] ?? cred.notes}
                                        onChange={(e) => setEditValues((prev) => ({ ...prev, [notesFieldId]: e.target.value }))}
                                        onBlur={() => commitEdit(notesFieldId)}
                                        onKeyDown={(e) => { if (e.key === "Enter") commitEdit(notesFieldId); }}
                                        autoFocus
                                        data-testid={`input-edit-cred-notes-${cred.id}`}
                                      />
                                    ) : (
                                      <p
                                        className="text-xs text-muted-foreground truncate cursor-pointer hover:text-foreground"
                                        onClick={() => startEditing(notesFieldId, cred.notes)}
                                        data-testid={`text-cred-notes-${cred.id}`}
                                      >
                                        {editValues[notesFieldId] ?? cred.notes}
                                      </p>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </Fade>
        )}

        <Fade direction="up" distance={10} delay={0.1}>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-9 w-52 pl-8 text-sm"
                  data-testid="input-board-search"
                />
              </div>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="h-9 w-auto min-w-[130px] text-sm" data-testid="filter-priority">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="h-9 w-auto min-w-[120px] text-sm" data-testid="filter-type">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="feature">Feature</SelectItem>
                  <SelectItem value="bug">Bug</SelectItem>
                  <SelectItem value="improvement">Improvement</SelectItem>
                  <SelectItem value="task">Task</SelectItem>
                  <SelectItem value="story">Story</SelectItem>
                </SelectContent>
              </Select>
              <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
                <SelectTrigger className="h-9 w-auto min-w-[140px] text-sm" data-testid="filter-assignee">
                  <SelectValue placeholder="Assignee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Assignees</SelectItem>
                  {assignees.map((a) => (
                    <SelectItem key={a} value={a}>{a}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" onClick={() => setAddTaskOpen(true)} data-testid="button-add-task">
                <Plus className="size-4 mr-1" />
                Add Task
              </Button>
              <div className="flex items-center gap-1 rounded-md border p-0.5">
                <Button
                  size="sm"
                  variant={view === "kanban" ? "default" : "ghost"}
                  onClick={() => setView("kanban")}
                  data-testid="button-view-kanban"
                >
                  <LayoutGrid className="size-4" />
                  Kanban
                </Button>
                <Button
                  size="sm"
                  variant={view === "list" ? "default" : "ghost"}
                  onClick={() => setView("list")}
                  data-testid="button-view-list"
                >
                  <List className="size-4" />
                  List
                </Button>
              </div>
            </div>
          </div>
        </Fade>

        <Fade direction="up" distance={10} delay={0.15}>
          {view === "kanban" ? (
            loading ? (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 mt-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <StatsCardSkeleton key={i} />
                ))}
              </div>
            ) : (
              <KanbanBoard
                columns={kanbanBoardColumns}
                onCardMove={handleCardMove}
                columnClassName="flex-1 min-w-[200px]"
                className="mt-2"
                onCardClick={(card) => {
                  const task = taskMap.get(card.id);
                  if (task) {
                    openTaskDetail(task);
                  }
                }}
                renderCard={(card) => {
                  const task = taskMap.get(card.id);
                  if (!task) return null;
                  const TypeIcon = TYPE_ICONS[task.type] || CircleDot;
                  return (
                    <Card
                      className="p-3 hover-elevate cursor-pointer"
                      data-testid={`card-task-${task.id}`}
                      onClick={() => {
                        openTaskDetail(task);
                      }}
                    >
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Badge
                          variant="secondary"
                          className="border-0 text-[10px] px-1.5 py-0"
                          style={{ backgroundColor: `${project.color}15`, color: project.color }}
                        >
                          {task.id}
                        </Badge>
                        <TypeIcon className="size-3 text-muted-foreground ml-auto shrink-0" />
                      </div>
                      <p
                        className="text-xs font-medium leading-snug line-clamp-2 mb-2"
                        data-testid={`text-task-card-title-${task.id}`}
                      >
                        {task.title}
                      </p>
                      <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                        <Badge
                          variant="secondary"
                          className={`border-0 text-[10px] px-1.5 py-0 capitalize ${PRIORITY_COLORS[task.priority]}`}
                        >
                          {task.priority}
                        </Badge>
                        {task.storyPoints > 0 && (
                          <Badge variant="secondary" className="border-0 text-[10px] px-1.5 py-0">
                            {task.storyPoints} SP
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center justify-between gap-1.5 mt-2 pt-1.5 border-t">
                        <PersonCell name={task.assignee} size="xs" />
                        {task.dueDate && (
                          <div className="flex items-center gap-0.5">
                            <Calendar className="size-2.5 text-muted-foreground" />
                            <span
                              className={`text-[10px] ${
                                isOverdue(task.dueDate) && task.status !== "done"
                                  ? "text-red-600 dark:text-red-400 font-medium"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {task.dueDate}
                            </span>
                          </div>
                        )}
                        {task.tags.length > 0 && (
                          <Badge variant="secondary" className="border-0 text-[9px] px-1 py-0 truncate max-w-[60px]">
                            {task.tags[0]}
                          </Badge>
                        )}
                      </div>
                    </Card>
                  );
                }}
              />
            )
          ) : loading ? (
            <TableSkeleton rows={10} columns={8} />
          ) : (
            <DataTable
              data={filteredTasks}
              columns={columns}
              searchPlaceholder="Search tasks..."
              searchKey="title"
              rowActions={rowActions}
              onRowClick={(task) => {
                openTaskDetail(task);
              }}
              filters={[
                {
                  label: "Status",
                  key: "status",
                  options: ["backlog", "todo", "in-progress", "in-review", "done", "cancelled"],
                },
                {
                  label: "Priority",
                  key: "priority",
                  options: ["critical", "high", "medium", "low"],
                },
                {
                  label: "Type",
                  key: "type",
                  options: ["feature", "bug", "improvement", "task", "story"],
                },
              ]}
              emptyTitle="No tasks found"
              emptyDescription="There are no tasks matching your filters."
            />
          )}
        </Fade>

        <FormDialog
          open={addTaskOpen}
          onOpenChange={setAddTaskOpen}
          title="Add Task"
          onSubmit={handleAddTask}
          submitLabel="Create Task"
        >
          <div className="flex flex-col gap-3">
            <div>
              <Label htmlFor="task-title">Title</Label>
              <Input
                id="task-title"
                placeholder="Task title..."
                value={newTask.title}
                onChange={(e) => setNewTask((prev) => ({ ...prev, title: e.target.value }))}
                className="mt-1"
                data-testid="input-task-title"
              />
            </div>
            <div>
              <Label htmlFor="task-description">Description</Label>
              <Textarea
                id="task-description"
                placeholder="Describe the task..."
                value={newTask.description}
                onChange={(e) => setNewTask((prev) => ({ ...prev, description: e.target.value }))}
                className="mt-1 resize-none text-sm"
                rows={3}
                data-testid="input-task-description"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Status</Label>
                <Select
                  value={newTask.status}
                  onValueChange={(val) => setNewTask((prev) => ({ ...prev, status: val }))}
                >
                  <SelectTrigger className="mt-1" data-testid="select-task-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="backlog">Backlog</SelectItem>
                    <SelectItem value="todo">To Do</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="in-review">In Review</SelectItem>
                    <SelectItem value="done">Done</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Priority</Label>
                <Select
                  value={newTask.priority}
                  onValueChange={(val) => setNewTask((prev) => ({ ...prev, priority: val }))}
                >
                  <SelectTrigger className="mt-1" data-testid="select-task-priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Type</Label>
                <Select
                  value={newTask.type}
                  onValueChange={(val) => setNewTask((prev) => ({ ...prev, type: val }))}
                >
                  <SelectTrigger className="mt-1" data-testid="select-task-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="feature">Feature</SelectItem>
                    <SelectItem value="bug">Bug</SelectItem>
                    <SelectItem value="improvement">Improvement</SelectItem>
                    <SelectItem value="task">Task</SelectItem>
                    <SelectItem value="story">Story</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Assignee</Label>
                <Select
                  value={newTask.assignee || "unassigned"}
                  onValueChange={(val) => setNewTask((prev) => ({ ...prev, assignee: val === "unassigned" ? "" : val }))}
                >
                  <SelectTrigger className="mt-1" data-testid="select-task-assignee">
                    <SelectValue placeholder="Select assignee" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {assignees.map((a) => (
                      <SelectItem key={a} value={a}>{a}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="task-due-date">Due Date</Label>
                <Input
                  id="task-due-date"
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask((prev) => ({ ...prev, dueDate: e.target.value }))}
                  className="mt-1"
                  data-testid="input-task-due-date"
                />
              </div>
              <div>
                <Label htmlFor="task-story-points">Story Points</Label>
                <Input
                  id="task-story-points"
                  type="number"
                  min="0"
                  max="21"
                  placeholder="0"
                  value={newTask.storyPoints}
                  onChange={(e) => setNewTask((prev) => ({ ...prev, storyPoints: e.target.value }))}
                  className="mt-1"
                  data-testid="input-task-story-points"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="task-tags">Tags (comma-separated)</Label>
              <Input
                id="task-tags"
                placeholder="e.g., ui, backend, api"
                value={newTask.tags}
                onChange={(e) => setNewTask((prev) => ({ ...prev, tags: e.target.value }))}
                className="mt-1"
                data-testid="input-task-tags"
              />
            </div>
          </div>
        </FormDialog>

        <TaskDetailDialog
          task={selectedTask}
          open={taskDetailOpen}
          onOpenChange={setTaskDetailOpen}
          onTaskUpdate={handleTaskUpdate}
        />
      </PageTransition>
    </PageShell>
  );
}
