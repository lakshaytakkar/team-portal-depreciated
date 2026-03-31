import { useState, useRef } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { taskStages } from "@/lib/mock-data";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useStore } from "@/lib/store";
import { format } from "date-fns";
import {
  Calendar,
  User,
  CheckSquare,
  Paperclip,
  X,
  Plus,
  Clock,
  Send,
  Tag,
  AlertTriangle,
  ChevronUp,
  Minus,
  ChevronDown,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const priorityConfig: Record<string, { icon: JSX.Element; variant: string }> = {
  high: { icon: <AlertTriangle className="size-3.5 text-red-500" />, variant: "text-red-500 bg-red-50 dark:bg-red-500/10" },
  medium: { icon: <Minus className="size-3.5 text-orange-500" />, variant: "text-orange-500 bg-orange-50 dark:bg-orange-500/10" },
  low: { icon: <ChevronDown className="size-3.5 text-blue-500" />, variant: "text-blue-500 bg-blue-50 dark:bg-blue-500/10" },
};

function formatLabel(s: string): string {
  return s.split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

function getInitials(name: string): string {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

interface TaskDetailDialogProps {
  task: any | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusChange?: (taskId: string, status: string) => void;
}

export function TaskDetailDialog({ task, open, onOpenChange, onStatusChange }: TaskDetailDialogProps) {
  const { currentUser } = useStore();
  const { toast } = useToast();
  const [newSubtask, setNewSubtask] = useState("");
  const [newComment, setNewComment] = useState("");

  const { data: users = [] } = useQuery<any[]>({
    queryKey: ["/api/users"],
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await apiRequest("PATCH", `/api/tasks/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ predicate: (q) => (q.queryKey[0] as string)?.startsWith('/api/tasks') });
    },
  });

  const [subtasks, setSubtasks] = useState([
    { id: "st-1", title: "Review requirements", completed: true },
    { id: "st-2", title: "Draft initial proposal", completed: false },
    { id: "st-3", title: "Share with team", completed: false },
  ]);

  const [comments, setComments] = useState([
    { id: "c-1", author: "Dea Ananda", content: "Can you please update the numbers for Q3?", date: "2 hours ago" },
    { id: "c-2", author: currentUser?.name || "You", content: "Sure, working on it right now.", date: "1 hour ago" },
  ]);

  if (!task) return null;

  const assignedUser = users.find((u: any) => u.id === task.assignedTo);
  const completedSubtasks = subtasks.filter((s) => s.completed).length;
  const subtaskProgress = subtasks.length > 0 ? (completedSubtasks / subtasks.length) * 100 : 0;

  const handleStatusChange = (val: string) => {
    if (onStatusChange) {
      onStatusChange(task.id, val);
    } else {
      updateTaskMutation.mutate({ id: task.id, data: { status: val } });
    }
    toast({ title: `Status changed to ${formatLabel(val)}` });
  };

  const handlePriorityChange = (val: string) => {
    updateTaskMutation.mutate({ id: task.id, data: { priority: val } });
    toast({ title: `Priority changed to ${formatLabel(val)}` });
  };

  const toggleSubtask = (id: string) => {
    setSubtasks((prev) =>
      prev.map((s) => (s.id === id ? { ...s, completed: !s.completed } : s))
    );
  };

  const addSubtask = () => {
    if (!newSubtask.trim()) return;
    setSubtasks((prev) => [
      ...prev,
      { id: `st-${Date.now()}`, title: newSubtask.trim(), completed: false },
    ]);
    setNewSubtask("");
    toast({ title: "Subtask added" });
  };

  const addComment = () => {
    if (!newComment.trim()) return;
    setComments((prev) => [
      ...prev,
      {
        id: `c-${Date.now()}`,
        author: currentUser?.name || "You",
        content: newComment.trim(),
        date: "Just now",
      },
    ]);
    setNewComment("");
    toast({ title: "Comment added" });
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "done";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-[720px] overflow-y-auto p-0" data-testid="sheet-task-detail">
        <SheetHeader className="sticky top-0 z-10 bg-background border-b px-6 py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <Badge
                variant="outline"
                className="shrink-0 text-xs border-primary/40 text-primary"
                data-testid={`badge-task-id-${task.id}`}
              >
                {task.id?.slice(0, 8) || "TASK"}
              </Badge>
              <CheckSquare className="size-3.5 text-muted-foreground shrink-0" />
              <SheetTitle className="text-base font-semibold truncate" data-testid={`text-task-title-${task.id}`}>
                {task.title}
              </SheetTitle>
            </div>
            <Button variant="ghost" size="icon" className="size-8 shrink-0" onClick={() => onOpenChange(false)} data-testid="button-close-task-detail">
              <X className="size-4" />
            </Button>
          </div>
        </SheetHeader>

        <div className="flex flex-col lg:flex-row">
          <div className="flex-1 p-6 space-y-6 min-w-0">
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Description</h4>
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                {task.description || "No description provided."}
              </p>
            </div>

            <Separator />

            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Subtasks ({completedSubtasks}/{subtasks.length})
                </h4>
                {subtasks.length > 0 && (
                  <span className="text-xs text-muted-foreground">{Math.round(subtaskProgress)}%</span>
                )}
              </div>
              {subtasks.length > 0 && (
                <Progress value={subtaskProgress} className="h-1.5 mb-3" />
              )}
              <div className="space-y-1.5">
                {subtasks.map((st) => (
                  <div
                    key={st.id}
                    className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted/50 cursor-pointer"
                    onClick={() => toggleSubtask(st.id)}
                    data-testid={`subtask-${st.id}`}
                  >
                    <div className={cn(
                      "flex size-4 shrink-0 items-center justify-center rounded border",
                      st.completed ? "bg-primary border-primary" : "border-border"
                    )}>
                      {st.completed && <CheckSquare className="size-3 text-primary-foreground" />}
                    </div>
                    <span className={cn("text-sm", st.completed && "line-through text-muted-foreground")}>
                      {st.title}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Input
                  value={newSubtask}
                  onChange={(e) => setNewSubtask(e.target.value)}
                  placeholder="Add a subtask..."
                  className="h-8 text-sm"
                  onKeyDown={(e) => e.key === "Enter" && addSubtask()}
                  data-testid="input-add-subtask"
                />
                <Button size="sm" variant="ghost" onClick={addSubtask} className="shrink-0 h-8" data-testid="button-add-subtask">
                  <Plus className="size-3.5" />
                </Button>
              </div>
            </div>

            <Separator />

            <Tabs defaultValue="comments">
              <TabsList className="w-full grid grid-cols-2 h-8 bg-muted/60">
                <TabsTrigger value="comments" className="text-xs gap-1" data-testid="tab-comments">
                  <Send className="size-3" />
                  Comments{comments.length > 0 ? ` (${comments.length})` : ""}
                </TabsTrigger>
                <TabsTrigger value="files" className="text-xs gap-1" data-testid="tab-files">
                  <Paperclip className="size-3" />
                  Files
                </TabsTrigger>
              </TabsList>

              <TabsContent value="comments" className="mt-3 space-y-3">
                <div className="space-y-3">
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3" data-testid={`comment-${comment.id}`}>
                      <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold">
                        {getInitials(comment.author)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{comment.author}</span>
                          <span className="text-xs text-muted-foreground">{comment.date}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-0.5">{comment.content}</p>
                      </div>
                    </div>
                  ))}
                  {comments.length === 0 && (
                    <p className="text-xs text-muted-foreground">No comments yet.</p>
                  )}
                </div>
                <div className="flex items-start gap-2">
                  <Textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                    className="min-h-[60px] text-sm resize-none"
                    data-testid="input-add-comment"
                  />
                  <Button size="sm" onClick={addComment} className="shrink-0 mt-1" disabled={!newComment.trim()} data-testid="button-add-comment">
                    <Send className="size-3.5" />
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="files" className="mt-3 space-y-3">
                <div className="flex flex-col items-center justify-center py-8 text-center bg-muted/40 rounded-lg border border-dashed">
                  <Paperclip className="h-5 w-5 text-muted-foreground mb-2" />
                  <p className="text-sm font-medium text-foreground">No files attached</p>
                  <p className="text-xs text-muted-foreground mt-1 mb-3">Upload files to share with your team</p>
                  <Button variant="outline" size="sm" data-testid="button-upload-file">Upload File</Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <div className="w-full lg:w-[240px] shrink-0 border-t lg:border-t-0 lg:border-l bg-muted/30 p-4 space-y-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Clock className="size-3" /> Status
              </label>
              <Select value={task.status} onValueChange={handleStatusChange}>
                <SelectTrigger className="h-8 text-sm" data-testid="select-task-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {taskStages.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1">
                {priorityConfig[task.priority]?.icon} Priority
              </label>
              <Select value={task.priority} onValueChange={handlePriorityChange}>
                <SelectTrigger className="h-8 text-sm" data-testid="select-task-priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <User className="size-3" /> Assignee
              </label>
              <div className="flex items-center gap-2 mt-1">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={`https://api.dicebear.com/7.x/micah/svg?seed=${task.assignedTo}`} />
                  <AvatarFallback className="text-xs">{getInitials(assignedUser?.name || "U")}</AvatarFallback>
                </Avatar>
                <span className="text-sm truncate">{assignedUser?.name || "Unassigned"}</span>
              </div>
            </div>

            <Separator />

            {task.dueDate && (
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Calendar className="size-3" /> Due Date
                </label>
                <p className={cn("text-sm", isOverdue && "text-red-500 font-medium")}>
                  {format(new Date(task.dueDate), "MMM d, yyyy")}
                </p>
              </div>
            )}

            {task.tags && task.tags.length > 0 && (
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Tag className="size-3" /> Tags
                </label>
                <div className="flex flex-wrap gap-1">
                  {task.tags.map((tag: string) => (
                    <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Progress</label>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">Subtasks</span>
                <span className="font-medium">{Math.round(subtaskProgress)}%</span>
              </div>
              <Progress value={subtaskProgress} className="h-1.5" />
            </div>

            <div className="space-y-1 text-xs text-muted-foreground pt-2">
              {task.createdAt && <p>Created: {format(new Date(task.createdAt), "MMM d, yyyy")}</p>}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
