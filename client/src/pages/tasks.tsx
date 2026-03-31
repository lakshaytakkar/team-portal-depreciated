import { useState, useMemo, useCallback } from "react";
import { useStore } from "@/lib/store";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  DragStartEvent,
  DragEndEvent,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { taskStages } from "@/lib/mock-data";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import {
  Calendar,
  MoreHorizontal,
  Plus,
  LayoutGrid,
  List,
  Search,
  Filter,
  CheckSquare,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { AddTaskDialog } from "@/components/dialogs/AddTaskDialog";
import { TaskDetailDialog } from "@/components/dialogs/TaskDetailDialog";
import { useToast } from "@/hooks/use-toast";

const statusColors: Record<string, string> = {
  todo: "#60a5fa",
  in_progress: "#fbbf24",
  review: "#a78bfa",
  done: "#34d399",
};

function DroppableArea({ columnId, children }: { columnId: string; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({
    id: `droppable-${columnId}`,
    data: { type: "column", columnId },
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex-1 overflow-y-auto px-3 pb-3 space-y-3 min-h-[60px] rounded-b-xl transition-colors",
        isOver && "bg-primary/5 ring-2 ring-primary/20 ring-inset"
      )}
    >
      {children}
    </div>
  );
}

function KanbanColumn({
  id,
  title,
  tasks,
  color,
  onTaskClick,
}: {
  id: string;
  title: string;
  tasks: any[];
  color: string;
  onTaskClick?: (task: any) => void;
}) {
  return (
    <div className="flex flex-col h-full min-w-[280px] w-full max-w-[320px] bg-muted rounded-xl border" data-testid={`kanban-col-${id}`}>
      <div className="p-3.5 flex items-center justify-between border-b">
        <div className="flex items-center gap-2">
          <div
            className="h-2.5 w-2.5 rounded-full shrink-0"
            style={{ backgroundColor: statusColors[id] || "#94a3b8" }}
          />
          <span className="font-semibold text-[13px] text-foreground">{title}</span>
        </div>
        <Badge variant="secondary" className="bg-card text-muted-foreground text-xs">
          {tasks.length}
        </Badge>
      </div>

      <DroppableArea columnId={id}>
        <SortableContext items={tasks.map((t: any) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task: any) => (
            <SortableTaskCard key={task.id} task={task} columnId={id} onClick={onTaskClick} />
          ))}
        </SortableContext>
        {tasks.length === 0 && (
          <div className="h-24 flex items-center justify-center text-xs text-muted-foreground border border-dashed rounded-md">
            No tasks
          </div>
        )}
      </DroppableArea>
    </div>
  );
}

function SortableTaskCard({
  task,
  columnId,
  onClick,
}: {
  task: any;
  columnId: string;
  onClick?: (task: any) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: { type: "card", task, columnId },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskCard task={task} onClick={onClick} />
    </div>
  );
}

function TaskCard({ task, onClick }: { task: any; onClick?: (task: any) => void }) {
  const isOverdue =
    task.status !== "done" && task.dueDate && new Date(task.dueDate) < new Date();
  const taskCode = `T-${(task.id || "").slice(-4).toUpperCase()}`;
  const thumb = `https://api.dicebear.com/9.x/glass/svg?seed=${taskCode}`;

  return (
    <Card
      className="cursor-pointer hover-elevate bg-card group border shadow-sm rounded-xl p-4 space-y-2"
      onClick={() => onClick?.(task)}
      data-testid={`task-card-${task.id}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img
            src={thumb}
            alt={taskCode}
            className="h-7 w-7 rounded-lg border bg-muted shrink-0 object-cover"
            loading="lazy"
          />
          <span className="text-[10px] font-semibold text-muted-foreground tracking-wide">
            {taskCode}
          </span>
        </div>
        <Badge
          className={cn(
            "text-[10px] px-2 py-0.5 border-0 font-medium capitalize",
            task.priority === "high" && "bg-red-50 text-red-500 dark:bg-red-500/10",
            task.priority === "medium" && "bg-orange-50 text-orange-500 dark:bg-orange-500/10",
            task.priority === "low" && "bg-blue-50 text-blue-500 dark:bg-blue-500/10"
          )}
        >
          {task.priority}
        </Badge>
      </div>

      <div className="space-y-1">
        <h4 className="text-[14px] font-semibold line-clamp-2 leading-tight">{task.title}</h4>
        <p className="text-[12px] text-muted-foreground line-clamp-2">{task.description}</p>
      </div>

      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {task.tags.map((tag: string) => (
            <span
              key={tag}
              className="text-[10px] bg-muted px-2 py-0.5 rounded-full border text-muted-foreground"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-border/50">
        <div
          className={cn(
            "flex items-center gap-1.5 text-[12px]",
            isOverdue ? "text-red-500" : "text-muted-foreground"
          )}
        >
          <Calendar className="h-3.5 w-3.5" />
          {task.dueDate
            ? format(new Date(task.dueDate), "MMM d")
            : "No date"}
        </div>
        <Avatar className="h-6 w-6 border border-card shadow-sm">
          <AvatarImage
            src={`https://api.dicebear.com/7.x/micah/svg?seed=${task.assignedTo}`}
          />
          <AvatarFallback className="text-[10px]">U</AvatarFallback>
        </Avatar>
      </div>
    </Card>
  );
}

function TasksListView({
  tasks,
  onTaskClick,
}: {
  tasks: any[];
  onTaskClick: (task: any) => void;
}) {
  const priorityColor: Record<string, string> = {
    low: "text-blue-500 bg-blue-50 dark:bg-blue-500/10 border-blue-100 dark:border-blue-500/20",
    medium:
      "text-orange-500 bg-orange-50 dark:bg-orange-500/10 border-orange-100 dark:border-orange-500/20",
    high: "text-red-500 bg-red-50 dark:bg-red-500/10 border-red-100 dark:border-red-500/20",
  };

  return (
    <div className="border rounded-lg overflow-hidden bg-card shadow-[0px_1px_2px_0px_rgba(13,13,18,0.06)] dark:shadow-none">
      <Table>
        <TableHeader className="bg-muted">
          <TableRow className="hover:bg-transparent border-b">
            <TableHead className="w-[50px] pl-6">
              <Checkbox className="border data-[state=checked]:bg-primary data-[state=checked]:border-primary rounded" />
            </TableHead>
            <TableHead className="text-[12px] font-medium text-muted-foreground uppercase tracking-wider h-[48px]">
              Task Name
            </TableHead>
            <TableHead className="text-[12px] font-medium text-muted-foreground uppercase tracking-wider">
              Due Date
            </TableHead>
            <TableHead className="text-[12px] font-medium text-muted-foreground uppercase tracking-wider">
              Assignee
            </TableHead>
            <TableHead className="text-[12px] font-medium text-muted-foreground uppercase tracking-wider w-[200px]">
              Progress
            </TableHead>
            <TableHead className="text-[12px] font-medium text-muted-foreground uppercase tracking-wider">
              Priority
            </TableHead>
            <TableHead className="text-[12px] font-medium text-muted-foreground uppercase tracking-wider text-right pr-6">
              Action
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => (
            <TableRow
              key={task.id}
              className="hover-elevate border-b cursor-pointer group transition-colors"
              onClick={() => onTaskClick(task)}
              data-testid={`task-row-${task.id}`}
            >
              <TableCell className="pl-6 py-4">
                <Checkbox
                  className="border data-[state=checked]:bg-primary data-[state=checked]:border-primary rounded"
                  onClick={(e) => e.stopPropagation()}
                />
              </TableCell>
              <TableCell>
                <div className="flex flex-col gap-1">
                  <span className="text-[14px] font-medium text-foreground">
                    {task.title}
                  </span>
                  <span className="text-[12px] text-muted-foreground line-clamp-1">
                    {task.description}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <span className="text-[14px] text-foreground">
                  {task.dueDate
                    ? format(new Date(task.dueDate), "MMM d, yyyy")
                    : "—"}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex -space-x-2">
                  <Avatar className="h-8 w-8 border-2 border-card">
                    <AvatarImage
                      src={`https://api.dicebear.com/7.x/micah/svg?seed=${task.assignedTo}`}
                    />
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Progress
                    value={
                      task.status === "done"
                        ? 100
                        : task.status === "review"
                        ? 75
                        : task.status === "in_progress"
                        ? 50
                        : 0
                    }
                    className="h-1.5"
                  />
                  <span className="text-[12px] font-medium text-foreground">
                    {task.status === "done"
                      ? "100%"
                      : task.status === "review"
                      ? "75%"
                      : task.status === "in_progress"
                      ? "50%"
                      : "0%"}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={cn(
                    "border font-medium capitalize",
                    priorityColor[task.priority as keyof typeof priorityColor]
                  )}
                >
                  {task.priority}
                </Badge>
              </TableCell>
              <TableCell className="text-right pr-6">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default function Tasks() {
  const { currentUser, currentTeamId, simulatedRole } = useStore();
  const { toast } = useToast();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeTask, setActiveTask] = useState<any | null>(null);
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"board" | "list">("board");
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");

  const effectiveRole = useStore.getState().getEffectiveRole();

  const { data: tasks = [], isLoading: tasksLoading } = useQuery<any[]>({
    queryKey: ["/api/tasks", currentTeamId, effectiveRole],
    queryFn: async () => {
      const res = await fetch(
        `/api/tasks?teamId=${currentTeamId}&effectiveRole=${effectiveRole}`,
        { credentials: "include" }
      );
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    enabled: !!currentUser,
  });

  const { data: users = [] } = useQuery<any[]>({
    queryKey: ["/api/users"],
    queryFn: async () => {
      const res = await fetch("/api/users", { credentials: "include" });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    enabled: !!currentUser,
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const res = await apiRequest("PATCH", `/api/tasks/${id}`, updates);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        predicate: (q) =>
          (q.queryKey[0] as string)?.startsWith("/api/tasks"),
      });
    },
    onError: () => {
      toast({ title: "Failed to update task", variant: "destructive" });
    },
  });

  const filteredTasks = useMemo(() => {
    let result = tasks;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (t: any) =>
          t.title?.toLowerCase().includes(q) ||
          t.description?.toLowerCase().includes(q)
      );
    }
    if (priorityFilter !== "all") {
      result = result.filter((t: any) => t.priority === priorityFilter);
    }
    return result;
  }, [tasks, searchQuery, priorityFilter]);

  const stats = useMemo(() => {
    const total = filteredTasks.length;
    const inProgress = filteredTasks.filter(
      (t: any) => t.status === "in_progress"
    ).length;
    const done = filteredTasks.filter((t: any) => t.status === "done").length;
    const overdue = filteredTasks.filter((t: any) => {
      if (t.status === "done") return false;
      return t.dueDate && new Date(t.dueDate) < new Date();
    }).length;
    return { total, inProgress, done, overdue };
  }, [filteredTasks]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    setActiveTask(event.active.data.current?.task as any);
  };

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over) {
        setActiveId(null);
        setActiveTask(null);
        return;
      }

      const taskId = active.id as string;
      let targetStageId = "";

      const overData = over.data.current;
      if (overData?.type === "column") {
        targetStageId = overData.columnId;
      } else if (overData?.type === "card") {
        targetStageId = overData.columnId;
      } else {
        const overId = over.id as string;
        if (overId.startsWith("droppable-")) {
          targetStageId = overId.replace("droppable-", "");
        } else {
          const overTask = tasks.find((t: any) => t.id === overId);
          if (overTask) {
            targetStageId = overTask.status;
          }
        }
      }

      const validStage = taskStages.find((s) => s.id === targetStageId);
      const draggedTask = tasks.find((t: any) => t.id === taskId);

      if (validStage && draggedTask && draggedTask.status !== targetStageId) {
        updateTaskMutation.mutate({
          id: taskId,
          updates: { status: targetStageId },
        });
        toast({
          title: "Task moved",
          description: `"${draggedTask.title}" moved to ${validStage.label}`,
        });
      }

      setActiveId(null);
      setActiveTask(null);
    },
    [tasks, updateTaskMutation, toast]
  );

  const handleTaskClick = (task: any) => {
    if (!activeId) {
      setSelectedTask(task);
      setDetailOpen(true);
    }
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col w-full max-w-[1600px] mx-auto overflow-hidden">
      <div className="px-2 py-3 border-b shrink-0 flex items-center gap-6 bg-card">
        <div className="shrink-0">
          <h1 className="text-[15px] font-semibold leading-tight">
            {currentUser?.role === "superadmin" ? "Team Tasks" : "My Tasks"}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage and track team responsibilities
          </p>
        </div>

        <div className="w-px h-8 bg-border shrink-0" />

        <div className="flex items-center gap-2.5 flex-1">
          {(
            [
              { label: "Total", value: stats.total },
              {
                label: "In Progress",
                value: stats.inProgress,
                color: "text-amber-500",
              },
              {
                label: "Overdue",
                value: stats.overdue,
                color: "text-red-500",
              },
              {
                label: "Completed",
                value: stats.done,
                color: "text-emerald-600",
              },
            ] as { label: string; value: number; color?: string }[]
          ).map((s) => (
            <div
              key={s.label}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border bg-muted/40 shadow-sm"
              data-testid={`stat-${s.label.toLowerCase().replace(" ", "-")}`}
            >
              <span
                className={cn(
                  "text-base font-bold tabular-nums leading-none",
                  s.color ?? "text-foreground"
                )}
              >
                {s.value}
              </span>
              <span className="text-[11px] text-muted-foreground font-medium">
                {s.label}
              </span>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center bg-muted p-1 rounded-lg border">
            <Button
              variant={viewMode === "board" ? "secondary" : "ghost"}
              size="icon"
              className={cn(
                "h-7 w-7",
                viewMode === "board" && "bg-card shadow-sm"
              )}
              onClick={() => setViewMode("board")}
              data-testid="btn-grid-view"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="icon"
              className={cn(
                "h-7 w-7",
                viewMode === "list" && "bg-card shadow-sm"
              )}
              onClick={() => setViewMode("list")}
              data-testid="btn-list-view"
            >
              <List className="h-3.5 w-3.5" />
            </Button>
          </div>
          <Button
            className="h-8 rounded-lg px-4 text-xs font-semibold"
            onClick={() => setAddOpen(true)}
            data-testid="btn-new-task"
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Add Task
          </Button>
        </div>
      </div>

      <div className="px-2 py-2.5 border-b flex items-center gap-3 bg-card shrink-0">
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
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <ScrollArea className="flex-1 px-2 py-4 bg-muted/30">
        {tasksLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : viewMode === "board" ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="flex gap-6 overflow-x-auto pb-4 items-start min-h-full">
              {taskStages.map((stage) => (
                <KanbanColumn
                  key={stage.id}
                  id={stage.id}
                  title={stage.label}
                  color={stage.color}
                  tasks={filteredTasks.filter(
                    (t: any) => t.status === stage.id
                  )}
                  onTaskClick={handleTaskClick}
                />
              ))}
            </div>

            <DragOverlay>
              {activeTask ? <TaskCard task={activeTask} /> : null}
            </DragOverlay>
          </DndContext>
        ) : (
          <TasksListView tasks={filteredTasks} onTaskClick={handleTaskClick} />
        )}
      </ScrollArea>

      <TaskDetailDialog
        task={selectedTask}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />

      <AddTaskDialog open={addOpen} onOpenChange={setAddOpen} />
    </div>
  );
}
