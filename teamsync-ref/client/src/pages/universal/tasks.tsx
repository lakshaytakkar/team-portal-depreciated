import { useState, useMemo, useRef, useCallback } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  LayoutGrid, 
  List, 
  Search, 
  Plus, 
  Calendar, 
  MoreHorizontal, 
  CheckSquare, 
  MoreVertical,
  PlusCircle,
  MessageSquare,
  X,
  Paperclip,
  Link2,
  Trash2,
  Send,
  Loader2,
  Upload,
  ExternalLink,
  Copy,
  Check
} from "lucide-react";
import { detectVerticalFromUrl } from "@/lib/verticals-config";
import { 
  sharedTasks, 
  sharedTaskCodeMap,
  verticalMembers, 
  SharedTask, 
  SharedTaskSubtask 
} from "@/lib/mock-data-shared";

interface CoreTask {
  id: string;
  task_code: string | null;
  vertical_id: string | null;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  assignee_name: string | null;
  due_date: string | null;
  tags: string[];
  created_at: string;
}

function coreTaskToShared(t: CoreTask): SharedTask {
  return {
    id: t.id,
    taskCode: t.task_code ?? undefined,
    verticalId: t.vertical_id ?? "",
    title: t.title,
    description: t.description ?? "",
    status: t.status as SharedTask["status"],
    priority: t.priority as SharedTask["priority"],
    assigneeName: t.assignee_name ?? "",
    dueDate: t.due_date ?? new Date().toISOString().split("T")[0],
    tags: t.tags ?? [],
    createdDate: t.created_at?.split("T")[0] ?? "",
    subtasks: [],
  };
}

import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { 
  PageShell,
  PrimaryAction,
  FilterPill
} from "@/components/layout";
import { KanbanBoard, type KanbanColumnData, type KanbanCardItem } from "@/components/blocks/kanban-blocks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getPersonAvatar } from "@/lib/avatars";
import { PersonCell } from "@/components/ui/avatar-cells";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { FormDialog } from "@/components/ds/form-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

function getTaskCode(task: SharedTask): string {
  return task.taskCode ?? sharedTaskCodeMap[task.id] ?? "T???";
}

function getTaskThumbnail(task: SharedTask): string {
  return `https://api.dicebear.com/9.x/glass/svg?seed=${getTaskCode(task)}`;
}

export default function UniversalTasks() {
  const [location] = useLocation();
  const vertical = detectVerticalFromUrl(location);
  const loading = useSimulatedLoading(600);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [viewMode, setViewMode] = useState<"board" | "list">("board");
  const [activeTab, setActiveTab] = useState<"all" | "my">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");

  const tasksQueryKey = vertical?.id ? `/api/core/tasks?verticalId=${vertical.id}` : null;

  const { data: dbTasks = [] } = useQuery<CoreTask[]>({
    queryKey: [tasksQueryKey],
    enabled: !!tasksQueryKey,
  });

  const [subtaskMap, setSubtaskMap] = useState<Record<string, SharedTaskSubtask[]>>({});

  const tasks: SharedTask[] = useMemo(() => {
    if (!vertical) return [];
    if (dbTasks.length > 0) return dbTasks.map(coreTaskToShared);
    return sharedTasks.filter(t => t.verticalId === vertical.id);
  }, [dbTasks, vertical]);

  const usingDB = dbTasks.length > 0;

  const createTaskMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      apiRequest("POST", "/api/core/tasks", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [tasksQueryKey] });
      setIsCreateOpen(false);
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      apiRequest("PATCH", `/api/core/tasks/${id}`, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: [tasksQueryKey] });
      const previous = queryClient.getQueryData<CoreTask[]>([tasksQueryKey]);
      queryClient.setQueryData<CoreTask[]>(
        [tasksQueryKey],
        (old) => (old ?? []).map(t => t.id === id ? { ...t, ...data } as CoreTask : t)
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData([tasksQueryKey], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [tasksQueryKey] });
    },
  });

  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const filteredTasks = useMemo(() => {
    let result = tasks;
    
    if (activeTab === "my") {
      // Mocking current user as the first member of the vertical
      const currentUser = verticalMembers.find(m => m.verticalId === vertical?.id)?.name;
      result = result.filter(t => t.assigneeName === currentUser);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(t => 
        t.title.toLowerCase().includes(q) || 
        t.description.toLowerCase().includes(q)
      );
    }

    if (priorityFilter !== "all") {
      result = result.filter(t => t.priority === priorityFilter);
    }

    return result;
  }, [tasks, activeTab, searchQuery, priorityFilter, vertical]);

  const stats = useMemo(() => {
    const total = filteredTasks.length;
    const inProgress = filteredTasks.filter(t => t.status === "in-progress").length;
    const done = filteredTasks.filter(t => t.status === "done").length;
    const overdue = filteredTasks.filter(t => {
      if (t.status === "done") return false;
      const dueDate = new Date(t.dueDate);
      return dueDate < new Date();
    }).length;

    return { total, inProgress, done, overdue };
  }, [filteredTasks]);

  const statusLabels: Record<string, string> = {
    backlog: "Backlog",
    todo: "To Do",
    "in-progress": "In Progress",
    review: "In Review",
    done: "Done"
  };

  const statusColors: Record<string, string> = {
    backlog: "#94a3b8",
    todo: "#60a5fa",
    "in-progress": "#fbbf24",
    review: "#a78bfa",
    done: "#34d399"
  };

  const kanbanColumns: KanbanColumnData[] = useMemo(() => {
    return ["backlog", "todo", "in-progress", "review", "done"].map((status) => ({
      id: status,
      title: statusLabels[status],
      color: statusColors[status],
      cards: filteredTasks
        .filter(t => t.status === status)
        .map((task): KanbanCardItem => ({
          id: task.id,
          title: task.title,
          subtitle: task.description,
          priority: task.priority === "critical" ? "urgent" : task.priority as "low" | "medium" | "high",
          dueDate: new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          assignee: task.assigneeName,
          avatar: getPersonAvatar(task.assigneeName),
        })),
    }));
  }, [filteredTasks]);

  const handleCardMove = useCallback((cardId: string, sourceColumnId: string, targetColumnId: string) => {
    const task = tasks.find(t => t.id === cardId);
    if (!task) return;
    if (usingDB) {
      updateTaskMutation.mutate({ id: cardId, data: { status: targetColumnId } });
    }
    toast({
      title: "Task moved",
      description: `"${task.title}" moved from ${statusLabels[sourceColumnId]} to ${statusLabels[targetColumnId]}`,
    });
  }, [tasks, usingDB, updateTaskMutation, toast]);

  const renderTaskCard = useCallback((card: KanbanCardItem, _columnId: string) => {
    const task = filteredTasks.find(t => t.id === card.id);
    if (!task) return null;
    const isOverdue = !task.status.includes("done") && new Date(task.dueDate) < new Date();
    const code = getTaskCode(task);
    const thumb = getTaskThumbnail(task);

    return (
      <Card
        className="cursor-pointer hover-elevate bg-card group border shadow-sm rounded-xl p-4 space-y-2"
        onClick={() => {
          setSelectedTaskId(task.id);
          setIsDetailOpen(true);
        }}
        data-testid={`task-card-${task.id}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src={thumb}
              alt={code}
              className="h-7 w-7 rounded-lg border bg-muted shrink-0 object-cover"
              loading="lazy"
            />
            <span className="text-[10px] font-semibold text-muted-foreground tracking-wide">{code}</span>
          </div>
          <Badge
            className={cn(
              "text-[10px] px-2 py-0.5 border-0 font-medium capitalize",
              task.priority === "critical" && "bg-red-50 text-red-500",
              task.priority === "high" && "bg-orange-50 text-orange-500",
              task.priority === "medium" && "bg-blue-50 text-blue-500",
              task.priority === "low" && "bg-slate-50 text-slate-500",
            )}
          >
            {task.priority}
          </Badge>
        </div>
        <div className="space-y-1">
          <h4 className="text-[14px] font-semibold line-clamp-2 leading-tight">{task.title}</h4>
          <p className="text-[12px] text-muted-foreground line-clamp-2">{task.description}</p>
        </div>
        {task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {task.tags.map(tag => (
              <span key={tag} className="text-[10px] bg-muted px-2 py-0.5 rounded-full border text-muted-foreground">
                {tag}
              </span>
            ))}
          </div>
        )}
        <div className="flex items-center justify-between pt-3 border-t border-border/50">
          <div className={cn(
            "flex items-center gap-1.5 text-[12px]",
            isOverdue ? "text-red-500" : "text-muted-foreground"
          )}>
            <Calendar className="h-3.5 w-3.5" />
            {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </div>
          <PersonCell name={task.assigneeName} size="xs" />
        </div>
      </Card>
    );
  }, [filteredTasks]);

  const handleCreateTask = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const payload: Record<string, unknown> = {
      vertical_id: vertical?.id ?? "",
      title: formData.get("title") as string,
      description: (formData.get("description") as string) || null,
      status: (formData.get("status") as string) || "todo",
      priority: (formData.get("priority") as string) || "medium",
      assignee_name: (formData.get("assignee") as string) || null,
      due_date: (formData.get("dueDate") as string) || null,
      tags: ((formData.get("tags") as string) || "")
        .split(",").map(t => t.trim()).filter(Boolean),
    };
    createTaskMutation.mutate(payload);
  };

  const selectedTaskRaw = tasks.find(t => t.id === selectedTaskId);
  const selectedTask = selectedTaskRaw
    ? { ...selectedTaskRaw, subtasks: subtaskMap[selectedTaskRaw.id] ?? selectedTaskRaw.subtasks }
    : undefined;

  if (!vertical) return null;

  return (
    <PageShell className="flex flex-col h-full bg-background overflow-hidden p-0 lg:p-0">
      {/* Header + Stats + Actions — single combined row */}
      <div className="px-16 py-3 lg:px-24 border-b shrink-0 flex items-center gap-6 bg-card">
        {/* Title */}
        <div className="shrink-0">
          <h1 className="text-[15px] font-semibold leading-tight">Tasks</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Manage and track team responsibilities</p>
        </div>

        {/* Divider */}
        <div className="w-px h-8 bg-border shrink-0" />

        {/* Stat cards */}
        <div className="flex items-center gap-2.5 flex-1">
          {([
            { label: "Total",       value: stats.total },
            { label: "In Progress", value: stats.inProgress,  color: "text-amber-500" },
            { label: "Overdue",     value: stats.overdue,     color: "text-red-500" },
            { label: "Completed",   value: stats.done,        color: "text-emerald-600" },
          ] as { label: string; value: number; color?: string }[]).map((s) => (
            <div key={s.label} className="flex items-center gap-2 px-3 py-1.5 rounded-lg border bg-muted/40 shadow-sm">
              <span className={cn("text-base font-bold tabular-nums leading-none", s.color ?? "text-foreground")}>{s.value}</span>
              <span className="text-[11px] text-muted-foreground font-medium">{s.label}</span>
            </div>
          ))}
        </div>

        {/* View toggle + Add Task — right-aligned */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center bg-muted p-1 rounded-lg border">
            <Button 
              variant={viewMode === "board" ? "secondary" : "ghost"} 
              size="icon" 
              className={cn("h-7 w-7", viewMode === "board" && "bg-card shadow-sm")}
              onClick={() => setViewMode("board")}
              data-testid="btn-grid-view"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </Button>
            <Button 
              variant={viewMode === "list" ? "secondary" : "ghost"} 
              size="icon" 
              className={cn("h-7 w-7", viewMode === "list" && "bg-card shadow-sm")}
              onClick={() => setViewMode("list")}
              data-testid="btn-list-view"
            >
              <List className="h-3.5 w-3.5" />
            </Button>
          </div>
          <PrimaryAction 
            color={vertical.color}
            icon={Plus}
            onClick={() => setIsCreateOpen(true)}
            testId="btn-new-task"
          >
            Add Task
          </PrimaryAction>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="px-16 py-2.5 lg:px-24 border-b flex items-center justify-between bg-card shrink-0 gap-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input 
              placeholder="Search tasks..." 
              className="pl-9 h-8 text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              data-testid="input-search"
            />
          </div>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-36 h-8 text-sm" data-testid="filter-priority">
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
        </div>
        <div className="flex items-center gap-2">
          <FilterPill
            active={activeTab === "all"}
            color={vertical.color}
            onClick={() => setActiveTab("all")}
            testId="tab-board"
          >
            All Tasks
          </FilterPill>
          <FilterPill
            active={activeTab === "my"}
            color={vertical.color}
            onClick={() => setActiveTab("my")}
            testId="tab-my-tasks"
          >
            My Tasks
          </FilterPill>
        </div>
      </div>

      {/* Main Content Area */}
      <ScrollArea className="flex-1 px-16 py-6 lg:px-24 bg-muted/30">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : viewMode === "board" ? (
          <KanbanBoard
            columns={kanbanColumns}
            onCardMove={handleCardMove}
            renderCard={renderTaskCard}
            columnClassName="min-w-[280px] max-w-[320px]"
            className="gap-6 items-start min-h-full"
          />
        ) : (
          <TasksListView 
            tasks={filteredTasks} 
            onTaskClick={(id) => {
              setSelectedTaskId(id);
              setIsDetailOpen(true);
            }} 
          />
        )}
      </ScrollArea>

      {/* Detail Dialog */}
      {selectedTask && (
        <TaskDetailDialog 
          task={selectedTask}
          isOpen={isDetailOpen}
          onOpenChange={setIsDetailOpen}
          onStatusChange={(status) => {
            if (usingDB) {
              updateTaskMutation.mutate({ id: selectedTask.id, data: { status } });
            }
          }}
          onPriorityChange={(priority) => {
            if (usingDB) {
              updateTaskMutation.mutate({ id: selectedTask.id, data: { priority } });
            }
          }}
          onAssigneeChange={(name) => {
            if (usingDB) {
              updateTaskMutation.mutate({ id: selectedTask.id, data: { assignee_name: name } });
            }
          }}
          onDueDateChange={(date) => {
            if (usingDB) {
              updateTaskMutation.mutate({ id: selectedTask.id, data: { due_date: date } });
            }
          }}
          onSubtaskToggle={(subtaskId) => {
            const currentSubs = subtaskMap[selectedTask.id] ?? selectedTask.subtasks;
            setSubtaskMap(prev => ({
              ...prev,
              [selectedTask.id]: currentSubs.map(s =>
                s.id === subtaskId ? { ...s, completed: !s.completed } : s
              ),
            }));
          }}
          onAddSubtask={(title) => {
            const newSubtask: SharedTaskSubtask = {
              id: `SUB-${Date.now()}`,
              title,
              completed: false,
            };
            const currentSubs = subtaskMap[selectedTask.id] ?? selectedTask.subtasks;
            setSubtaskMap(prev => ({
              ...prev,
              [selectedTask.id]: [...currentSubs, newSubtask],
            }));
          }}
        />
      )}

      {/* Create Dialog */}
      <FormDialog
        title="Create New Task"
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSubmit={() => {
          const form = document.getElementById("create-task-form") as HTMLFormElement;
          form.requestSubmit();
        }}
        submitLabel="Create Task"
      >
        <form id="create-task-form" onSubmit={handleCreateTask} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Task Title</Label>
            <Input id="title" name="title" required placeholder="Enter task title" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" placeholder="Describe the task..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select name="priority" defaultValue="medium">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select name="status" defaultValue="todo">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="backlog">Backlog</SelectItem>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="review">In Review</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="assignee">Assignee</Label>
              <Select name="assignee" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select member" />
                </SelectTrigger>
                <SelectContent>
                  {verticalMembers.filter(m => m.verticalId === vertical.id).map(m => (
                    <SelectItem key={m.id} value={m.name}>{m.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input id="dueDate" name="dueDate" type="date" required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma separated)</Label>
            <Input id="tags" name="tags" placeholder="urgent, design, frontend" />
          </div>
        </form>
      </FormDialog>
    </PageShell>
  );
}

function TasksListView({ tasks, onTaskClick }: { tasks: SharedTask[], onTaskClick: (id: string) => void }) {
  return (
    <div className="bg-card rounded-xl border overflow-hidden shadow-sm" data-testid="tab-list">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 border-b">
          <tr>
            <th className="w-10 p-4"><Checkbox /></th>
            <th className="text-left p-4 font-medium text-muted-foreground">Task Name</th>
            <th className="text-left p-4 font-medium text-muted-foreground">Due Date</th>
            <th className="text-left p-4 font-medium text-muted-foreground">Assignee</th>
            <th className="text-left p-4 font-medium text-muted-foreground">Priority</th>
            <th className="w-10 p-4"></th>
          </tr>
        </thead>
        <tbody>
          {tasks.map(task => {
            const isOverdue = !task.status.includes("done") && new Date(task.dueDate) < new Date();
            return (
              <tr 
                key={task.id} 
                className="border-b last:border-0 hover:bg-muted/30 cursor-pointer transition-colors"
                onClick={() => onTaskClick(task.id)}
              >
                <td className="p-4" onClick={(e) => e.stopPropagation()}><Checkbox /></td>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={getTaskThumbnail(task)}
                      alt={getTaskCode(task)}
                      className="h-8 w-8 rounded-lg border bg-muted shrink-0 object-cover"
                      loading="lazy"
                    />
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-semibold text-muted-foreground">{getTaskCode(task)}</span>
                        <span className="font-semibold text-[14px] truncate">{task.title}</span>
                      </div>
                      <span className="text-[12px] text-muted-foreground line-clamp-1">{task.description}</span>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <span className={cn("text-[13px]", isOverdue ? "text-red-500 font-medium" : "text-muted-foreground")}>
                    {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </td>
                <td className="p-4">
                  <PersonCell name={task.assigneeName} size="sm" />
                </td>
                <td className="p-4">
                  <Badge 
                    className={cn(
                      "text-[10px] px-2 py-0.5 border-0 font-medium capitalize",
                      task.priority === "critical" && "bg-red-50 text-red-500",
                      task.priority === "high" && "bg-orange-50 text-orange-500",
                      task.priority === "medium" && "bg-blue-50 text-blue-500",
                      task.priority === "low" && "bg-slate-50 text-slate-500",
                    )}
                  >
                    {task.priority}
                  </Badge>
                </td>
                <td className="p-4">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

interface ActivityItem {
  id: string;
  task_id: string;
  type: "comment" | "attachment" | "link";
  content: string | null;
  author: string;
  file_url: string | null;
  file_name: string | null;
  file_size: number | null;
  link_url: string | null;
  link_title: string | null;
  created_at: string;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function TaskDetailDialog({ 
  task, 
  isOpen, 
  onOpenChange, 
  onStatusChange,
  onPriorityChange,
  onAssigneeChange,
  onDueDateChange,
  onSubtaskToggle,
  onAddSubtask,
  onDelete
}: { 
  task: SharedTask, 
  isOpen: boolean, 
  onOpenChange: (open: boolean) => void,
  onStatusChange: (status: string) => void,
  onPriorityChange: (priority: string) => void,
  onAssigneeChange: (name: string) => void,
  onDueDateChange: (date: string) => void,
  onSubtaskToggle: (id: string) => void,
  onAddSubtask: (title: string) => void,
  onDelete?: () => void
}) {
  const [newSubtask, setNewSubtask] = useState("");
  const [copied, setCopied] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [newLinkUrl, setNewLinkUrl] = useState("");
  const [newLinkTitle, setNewLinkTitle] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const qc = useQueryClient();

  const isOverdue = !task.status.includes("done") && new Date(task.dueDate) < new Date();
  const completedSubtasks = task.subtasks.filter(s => s.completed).length;

  const { data: activityData } = useQuery<{ items: ActivityItem[] }>({
    queryKey: ["/api/tasks", task.id, "activity"],
    queryFn: async () => {
      const res = await fetch(`/api/tasks/${task.id}/activity`);
      if (!res.ok) throw new Error("Failed to fetch activity");
      return res.json();
    },
    enabled: isOpen,
  });

  const comments = (activityData?.items ?? []).filter(i => i.type === "comment");
  const attachments = (activityData?.items ?? []).filter(i => i.type === "attachment");
  const links = (activityData?.items ?? []).filter(i => i.type === "link");

  const addCommentMutation = useMutation({
    mutationFn: () => apiRequest("POST", `/api/tasks/${task.id}/comments`, { content: newComment }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/tasks", task.id, "activity"] });
      setNewComment("");
    },
  });

  const addLinkMutation = useMutation({
    mutationFn: () => apiRequest("POST", `/api/tasks/${task.id}/links`, { url: newLinkUrl, title: newLinkTitle }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/tasks", task.id, "activity"] });
      setNewLinkUrl("");
      setNewLinkTitle("");
    },
  });

  const deleteActivityMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/tasks/${task.id}/activity/${id}`),
    onMutate: async (deletedId: string) => {
      const activityKey = ["/api/tasks", task.id, "activity"];
      await qc.cancelQueries({ queryKey: activityKey });
      const previous = qc.getQueryData<{ items: ActivityItem[] }>(activityKey);
      qc.setQueryData<{ items: ActivityItem[] }>(
        activityKey,
        (old) => ({ items: (old?.items ?? []).filter(item => item.id !== deletedId) })
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        qc.setQueryData(["/api/tasks", task.id, "activity"], context.previous);
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["/api/tasks", task.id, "activity"] });
    },
  });

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append("file", file);
        await fetch(`/api/tasks/${task.id}/attachments`, { method: "POST", body: fd });
      }
      qc.invalidateQueries({ queryKey: ["/api/tasks", task.id, "activity"] });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl p-0 gap-0 overflow-hidden" data-testid="dialog-task-detail">
        {/* Sticky header */}
        <div className="sticky top-0 z-10 bg-card border-b px-6 py-3 shrink-0">
          <div className="flex items-center gap-3">
            <img
              src={getTaskThumbnail(task)}
              alt={getTaskCode(task)}
              className="h-10 w-10 rounded-xl border bg-muted shrink-0 object-cover"
            />
            <div className="flex flex-col min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-semibold text-muted-foreground tracking-wide shrink-0">{getTaskCode(task)}</span>
                <DialogTitle className="text-base font-semibold truncate" data-testid={`text-task-title-${task.id}`}>
                  {task.title}
                </DialogTitle>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Created on {new Date(task.createdDate).toLocaleDateString()}
              </p>
            </div>
            {/* Action buttons */}
            <div className="flex items-center gap-1 shrink-0">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                title="Copy task title"
                onClick={() => {
                  navigator.clipboard.writeText(task.title);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1500);
                }}
                data-testid="button-copy-task"
              >
                {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
              </Button>
              {onDelete && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                  title="Delete task"
                  onClick={() => { onOpenChange(false); onDelete(); }}
                  data-testid="button-delete-task"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
              <div className="w-px h-5 bg-border mx-1" />
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onOpenChange(false)}
                data-testid="button-close-task-detail"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Body: left content + right activity */}
        <div className="flex flex-row h-[75vh]">
          {/* LEFT: task content */}
          <div className="flex-1 overflow-y-auto divide-y min-w-0">
            {/* Details */}
            <div className="px-6 py-3.5">
              {(() => {
                const labelCls = "shrink-0 text-xs font-medium text-muted-foreground";
                const triggerCls = "h-7 text-xs font-medium border-0 bg-secondary shadow-none px-2.5 gap-1.5 flex-1 min-w-0";
                const cellCls = "flex items-center gap-2 min-w-0";
                const tagPalettes = [
                  "bg-sky-50 text-sky-600 border border-sky-200",
                  "bg-violet-50 text-violet-600 border border-violet-200",
                  "bg-emerald-50 text-emerald-600 border border-emerald-200",
                  "bg-amber-50 text-amber-600 border border-amber-200",
                  "bg-rose-50 text-rose-600 border border-rose-200",
                  "bg-indigo-50 text-indigo-600 border border-indigo-200",
                  "bg-teal-50 text-teal-600 border border-teal-200",
                  "bg-orange-50 text-orange-600 border border-orange-200",
                ];
                return (
                  <div className="grid grid-cols-2 gap-x-5 gap-y-2.5">
                    {/* Assigned To */}
                    <div className={cellCls}>
                      <span className={labelCls}>Assignee</span>
                      <Select value={task.assigneeName} onValueChange={onAssigneeChange}>
                        <SelectTrigger className={triggerCls} data-testid="select-task-assignee">
                          <PersonCell name={task.assigneeName} size="xs" />
                        </SelectTrigger>
                        <SelectContent>
                          {verticalMembers.filter(m => m.verticalId === task.verticalId).map(m => (
                            <SelectItem key={m.id} value={m.name}>
                              <PersonCell name={m.name} size="sm" />
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Priority */}
                    <div className={cellCls}>
                      <span className={labelCls}>Priority</span>
                      <Select value={task.priority} onValueChange={onPriorityChange}>
                        <SelectTrigger className={triggerCls} data-testid="select-task-priority">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="critical"><span className="text-red-500 font-medium">Critical</span></SelectItem>
                          <SelectItem value="high"><span className="text-orange-500 font-medium">High</span></SelectItem>
                          <SelectItem value="medium"><span className="text-blue-500 font-medium">Medium</span></SelectItem>
                          <SelectItem value="low"><span className="text-slate-500 font-medium">Low</span></SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Status */}
                    <div className={cellCls}>
                      <span className={labelCls}>Status</span>
                      <Select value={task.status} onValueChange={onStatusChange}>
                        <SelectTrigger className={triggerCls} data-testid="select-task-status">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="backlog">Backlog</SelectItem>
                          <SelectItem value="todo">To Do</SelectItem>
                          <SelectItem value="in-progress">In Progress</SelectItem>
                          <SelectItem value="review">In Review</SelectItem>
                          <SelectItem value="done">Done</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Due Date */}
                    <div className={cellCls}>
                      <span className={labelCls}>Due Date</span>
                      <div className="relative flex-1 min-w-0">
                        <Calendar className={cn("absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 pointer-events-none z-10", isOverdue ? "text-red-500" : "text-muted-foreground")} />
                        <input
                          type="date"
                          value={task.dueDate ? task.dueDate.split("T")[0] : ""}
                          onChange={e => onDueDateChange(e.target.value)}
                          className={cn(
                            "h-7 w-full rounded-md bg-secondary pl-6 pr-2 text-xs font-medium border-0 shadow-none outline-none focus:ring-1 focus:ring-ring",
                            isOverdue ? "text-red-500" : "text-foreground"
                          )}
                          data-testid="input-task-due-date"
                        />
                      </div>
                    </div>

                    {/* Tags */}
                    {task.tags.length > 0 && (
                      <div className="col-span-2 flex items-center gap-2 min-w-0">
                        <span className={labelCls}>Tags</span>
                        <div className="flex flex-wrap gap-1.5">
                          {task.tags.map((tag, i) => (
                            <span key={tag} className={cn("text-xs font-medium px-2 py-0.5 rounded-full", tagPalettes[i % tagPalettes.length])}>
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Description */}
            <div className="px-6 py-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Description</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {task.description || "No description provided."}
              </p>
            </div>

            {/* Progress */}
            <div className="px-6 py-5">
              <div className="flex items-center justify-between text-xs mb-2">
                <p className="font-semibold uppercase tracking-wider text-muted-foreground">Progress</p>
                <span className="font-medium">{completedSubtasks}/{task.subtasks.length} subtasks</span>
              </div>
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-500"
                  style={{ width: `${task.subtasks.length > 0 ? (completedSubtasks / task.subtasks.length) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Subtasks */}
            <div className="px-6 py-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Subtasks</p>
              <div className="space-y-2">
                {task.subtasks.map((subtask) => (
                  <div key={subtask.id} className="flex items-center gap-3 p-1 rounded-lg hover:bg-muted/50 transition-colors group">
                    <Checkbox
                      id={subtask.id}
                      checked={subtask.completed}
                      onCheckedChange={() => onSubtaskToggle(subtask.id)}
                      data-testid={`subtask-${subtask.id}`}
                    />
                    <label
                      htmlFor={subtask.id}
                      className={cn(
                        "text-sm flex-1 cursor-pointer transition-colors",
                        subtask.completed ? "text-muted-foreground line-through" : "text-foreground"
                      )}
                    >
                      {subtask.title}
                    </label>
                  </div>
                ))}
                <div className="flex items-center gap-2 mt-2 pt-2 border-t border-dashed">
                  <PlusCircle className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Add a subtask..."
                    value={newSubtask}
                    onChange={(e) => setNewSubtask(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && newSubtask.trim()) {
                        onAddSubtask(newSubtask.trim());
                        setNewSubtask("");
                      }
                    }}
                    className="h-8 border-none bg-transparent shadow-none focus-visible:ring-0 p-0 text-sm"
                    data-testid="input-add-subtask"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: activity panel */}
          <div className="w-[340px] shrink-0 border-l flex flex-col overflow-hidden bg-muted/10">
            <Tabs defaultValue="comments" className="flex flex-col flex-1 overflow-hidden">
              <div className="bg-card border-b px-4 pt-3 pb-0 shrink-0">
                <TabsList className="w-full grid grid-cols-3 h-8 bg-muted/60">
                  <TabsTrigger value="comments" className="text-xs gap-1.5" data-testid="tab-comments">
                    <MessageSquare className="h-3.5 w-3.5" />
                    Comments{comments.length > 0 ? ` (${comments.length})` : ""}
                  </TabsTrigger>
                  <TabsTrigger value="files" className="text-xs gap-1.5" data-testid="tab-files">
                    <Paperclip className="h-3.5 w-3.5" />
                    Files{attachments.length > 0 ? ` (${attachments.length})` : ""}
                  </TabsTrigger>
                  <TabsTrigger value="links" className="text-xs gap-1.5" data-testid="tab-links">
                    <Link2 className="h-3.5 w-3.5" />
                    Links{links.length > 0 ? ` (${links.length})` : ""}
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Comments tab */}
              <TabsContent value="comments" className="flex-1 overflow-y-auto px-4 py-3 m-0 space-y-3">
                <div className="space-y-3">
                  {comments.length === 0 && (
                    <p className="text-sm text-muted-foreground/70">No comments yet.</p>
                  )}
                  {comments.map(c => (
                    <div key={c.id} className="flex gap-2.5 group" data-testid={`comment-${c.id}`}>
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold">
                        {c.author.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-semibold truncate">{c.author}</span>
                          <div className="flex items-center gap-1 shrink-0">
                            <span className="text-xs text-muted-foreground">{timeAgo(c.created_at)}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => deleteActivityMutation.mutate(c.id)}
                              data-testid={`btn-delete-comment-${c.id}`}
                            >
                              <Trash2 className="h-3 w-3 text-muted-foreground" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-xs text-foreground/70 mt-0.5 leading-relaxed">{c.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex items-end gap-2 pt-3 border-t border-dashed">
                  <Textarea
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="min-h-[56px] text-xs resize-none"
                    onKeyDown={e => {
                      if (e.key === "Enter" && !e.shiftKey && newComment.trim()) {
                        e.preventDefault();
                        addCommentMutation.mutate();
                      }
                    }}
                    data-testid="input-add-comment"
                  />
                  <Button
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    disabled={!newComment.trim() || addCommentMutation.isPending}
                    onClick={() => addCommentMutation.mutate()}
                    data-testid="button-post-comment"
                  >
                    {addCommentMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                  </Button>
                </div>
              </TabsContent>

              {/* Files tab */}
              <TabsContent value="files" className="flex-1 overflow-y-auto px-4 py-3 m-0 space-y-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileUpload}
                  data-testid="input-file-upload"
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full h-8 text-xs gap-1.5"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  data-testid="button-attach-file"
                >
                  {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                  {uploading ? "Uploading..." : "Attach Files"}
                </Button>
                <div className="space-y-2">
                  {attachments.length === 0 && (
                    <p className="text-xs text-muted-foreground/70">No files attached.</p>
                  )}
                  {attachments.map(a => (
                    <div key={a.id} className="flex items-center gap-2 rounded-md border bg-card px-3 py-2 group" data-testid={`attachment-${a.id}`}>
                      <Paperclip className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{a.file_name}</p>
                        {a.file_size != null && (
                          <p className="text-xs text-muted-foreground">{formatBytes(a.file_size)}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        {a.file_url && (
                          <a href={a.file_url} target="_blank" rel="noopener noreferrer" data-testid={`link-download-${a.id}`}>
                            <Button variant="ghost" size="icon" className="h-5 w-5">
                              <ExternalLink className="h-3 w-3 text-muted-foreground" />
                            </Button>
                          </a>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5"
                          onClick={() => deleteActivityMutation.mutate(a.id)}
                          data-testid={`btn-delete-attachment-${a.id}`}
                        >
                          <Trash2 className="h-3 w-3 text-muted-foreground" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              {/* Links tab */}
              <TabsContent value="links" className="flex-1 overflow-y-auto px-4 py-3 m-0 space-y-3">
                <div className="space-y-2">
                  {links.length === 0 && (
                    <p className="text-xs text-muted-foreground/70">No links added.</p>
                  )}
                  {links.map(l => (
                    <div key={l.id} className="flex items-center gap-2 rounded-md border bg-card px-3 py-2 group" data-testid={`link-${l.id}`}>
                      <Link2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <div className="flex-1 min-w-0">
                        <a
                          href={l.link_url ?? "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-medium text-primary hover:underline truncate block"
                        >
                          {l.link_title || l.link_url}
                        </a>
                        {l.link_title && (
                          <p className="text-xs text-muted-foreground truncate">{l.link_url}</p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                        onClick={() => deleteActivityMutation.mutate(l.id)}
                        data-testid={`btn-delete-link-${l.id}`}
                      >
                        <Trash2 className="h-3 w-3 text-muted-foreground" />
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="space-y-2 pt-3 border-t border-dashed">
                  <Input
                    value={newLinkUrl}
                    onChange={e => setNewLinkUrl(e.target.value)}
                    placeholder="https://..."
                    className="h-8 text-xs"
                    data-testid="input-link-url"
                  />
                  <Input
                    value={newLinkTitle}
                    onChange={e => setNewLinkTitle(e.target.value)}
                    placeholder="Title (optional)"
                    className="h-8 text-xs"
                    data-testid="input-link-title"
                  />
                  <Button
                    size="sm"
                    className="w-full h-8 text-xs gap-1.5"
                    disabled={!newLinkUrl.trim() || addLinkMutation.isPending}
                    onClick={() => addLinkMutation.mutate()}
                    data-testid="button-add-link"
                  >
                    {addLinkMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Link2 className="h-3.5 w-3.5" />}
                    Add Link
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
