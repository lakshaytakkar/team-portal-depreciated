import { useState, useRef } from "react";
import {
  X,
  Bug,
  Zap,
  ArrowUp,
  CheckSquare,
  BookOpen,
  AlertTriangle,
  ChevronUp,
  Minus,
  ChevronDown,
  Plus,
  Paperclip,
  Send,
  Calendar,
  User,
  Tag,
  Clock,
  FileText,
  Upload,
  Loader2,
  ExternalLink,
  Trash2,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/ds/status-badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { devProjects, devSprints, type DevTask } from "@/lib/mock-data-dev";

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

const statusOptions = ["backlog", "todo", "in-progress", "in-review", "done", "cancelled"] as const;
const priorityOptions = ["critical", "high", "medium", "low"] as const;
const typeOptions = ["feature", "bug", "improvement", "task", "story"] as const;

const statusVariant: Record<string, "success" | "error" | "warning" | "neutral" | "info"> = {
  backlog: "neutral",
  todo: "info",
  "in-progress": "warning",
  "in-review": "info",
  done: "success",
  cancelled: "error",
};

const priorityVariant: Record<string, "success" | "error" | "warning" | "neutral" | "info"> = {
  critical: "error",
  high: "warning",
  medium: "info",
  low: "neutral",
};

const typeIcons: Record<string, JSX.Element> = {
  bug: <Bug className="size-3.5 text-red-500" />,
  feature: <Zap className="size-3.5 text-purple-500" />,
  improvement: <ArrowUp className="size-3.5 text-blue-500" />,
  task: <CheckSquare className="size-3.5 text-gray-500" />,
  story: <BookOpen className="size-3.5 text-amber-500" />,
};

const priorityIcons: Record<string, JSX.Element> = {
  critical: <AlertTriangle className="size-3.5 text-red-500" />,
  high: <ChevronUp className="size-3.5 text-orange-500" />,
  medium: <Minus className="size-3.5 text-blue-500" />,
  low: <ChevronDown className="size-3.5 text-gray-400" />,
};

function formatLabel(s: string): string {
  return s.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

function getInitials(name: string): string {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

interface TaskDetailDialogProps {
  task: DevTask | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTaskUpdate?: (task: DevTask) => void;
}

export function TaskDetailDialog({ task, open, onOpenChange, onTaskUpdate }: TaskDetailDialogProps) {
  const { toast } = useToast();
  const [newSubtask, setNewSubtask] = useState("");
  const [newComment, setNewComment] = useState("");
  const [localTask, setLocalTask] = useState<DevTask | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const qc = useQueryClient();

  const currentTask = localTask?.id === task?.id ? localTask : task;
  const taskId = currentTask?.id ?? "";

  const { data: attachmentData } = useQuery<{ items: ActivityItem[] }>({
    queryKey: ["/api/tasks", taskId, "activity"],
    queryFn: async () => {
      const res = await fetch(`/api/tasks/${taskId}/activity`);
      if (!res.ok) throw new Error("Failed to fetch activity");
      return res.json();
    },
    enabled: open && !!taskId,
    select: (d) => ({ items: d.items.filter((i) => i.type === "attachment") }),
  });

  const supabaseAttachments = attachmentData?.items ?? [];

  const deleteAttachmentMutation = useMutation({
    mutationFn: async (id: string) => {
      await fetch(`/api/tasks/${taskId}/activity/${id}`, { method: "DELETE" });
    },
    onMutate: async (id) => {
      const activityKey = ["/api/tasks", taskId, "activity"];
      await qc.cancelQueries({ queryKey: activityKey });
      const previous = qc.getQueryData<{ items: ActivityItem[] }>(activityKey);
      if (previous) {
        qc.setQueryData<{ items: ActivityItem[] }>(activityKey, {
          items: previous.items.filter((item) => item.id !== id),
        });
      }
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        qc.setQueryData(["/api/tasks", taskId, "activity"], context.previous);
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["/api/tasks", taskId, "activity"] });
    },
  });

  if (!currentTask) return null;
  const task_ = currentTask;

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append("file", file);
        await fetch(`/api/tasks/${task_.id}/attachments`, { method: "POST", body: fd });
      }
      qc.invalidateQueries({ queryKey: ["/api/tasks", task_.id, "activity"] });
      toast({ title: "File uploaded successfully" });
    } catch {
      toast({ title: "Upload failed", variant: "destructive" });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  const project = devProjects.find((p) => p.id === task_.projectId);
  const sprint = task_.sprintId ? devSprints.find((s) => s.id === task_.sprintId) : null;
  const completedSubtasks = task_.subtasks.filter((s) => s.completed).length;
  const subtaskProgress = task_.subtasks.length > 0 ? (completedSubtasks / task_.subtasks.length) * 100 : 0;

  function updateTask(updates: Partial<DevTask>) {
    const updated = { ...task_, ...updates } as DevTask;
    setLocalTask(updated);
    onTaskUpdate?.(updated);
  }

  function toggleSubtask(subtaskId: string) {
    const updatedSubtasks = task_.subtasks.map((s) =>
      s.id === subtaskId ? { ...s, completed: !s.completed } : s
    );
    updateTask({ subtasks: updatedSubtasks });
  }

  function addSubtask() {
    if (!newSubtask.trim()) return;
    const newSt = {
      id: `st-new-${Date.now()}`,
      title: newSubtask.trim(),
      completed: false,
    };
    updateTask({ subtasks: [...task_.subtasks, newSt] });
    setNewSubtask("");
    toast({ title: "Subtask added" });
  }

  function addComment() {
    if (!newComment.trim()) return;
    const newC = {
      id: `c-new-${Date.now()}`,
      author: "Lakshay Takkar",
      content: newComment.trim(),
      date: new Date().toISOString().split("T")[0],
    };
    updateTask({ comments: [...task_.comments, newC] });
    setNewComment("");
    toast({ title: "Comment added" });
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-[720px] overflow-y-auto p-0" data-testid="sheet-task-detail">
        <SheetHeader className="sticky top-0 z-10 bg-background border-b px-6 py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <Badge
                variant="outline"
                className="shrink-0 text-xs"
                style={{ borderColor: project?.color, color: project?.color }}
                data-testid={`badge-task-id-${currentTask.id}`}
              >
                {currentTask.id}
              </Badge>
              {typeIcons[currentTask.type]}
              <SheetTitle className="text-base font-semibold truncate" data-testid={`text-task-title-${currentTask.id}`}>
                {currentTask.title}
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
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{currentTask.description || "No description provided."}</p>
            </div>

            <Separator />

            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Subtasks ({completedSubtasks}/{currentTask.subtasks.length})
                </h4>
                {currentTask.subtasks.length > 0 && (
                  <span className="text-xs text-muted-foreground">{Math.round(subtaskProgress)}%</span>
                )}
              </div>
              {currentTask.subtasks.length > 0 && (
                <Progress value={subtaskProgress} className="h-1.5 mb-3" />
              )}
              <div className="space-y-1.5">
                {currentTask.subtasks.map((st) => (
                  <div
                    key={st.id}
                    className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted/50 cursor-pointer"
                    onClick={() => toggleSubtask(st.id)}
                    data-testid={`subtask-${st.id}`}
                  >
                    <div className={`flex size-4 shrink-0 items-center justify-center rounded border ${st.completed ? "bg-primary border-primary" : "border-border"}`}>
                      {st.completed && <CheckSquare className="size-3 text-primary-foreground" />}
                    </div>
                    <span className={`text-sm ${st.completed ? "line-through text-muted-foreground" : ""}`}>
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
                  Comments{currentTask.comments.length > 0 ? ` (${currentTask.comments.length})` : ""}
                </TabsTrigger>
                <TabsTrigger value="files" className="text-xs gap-1" data-testid="tab-files">
                  <Paperclip className="size-3" />
                  Files{supabaseAttachments.length > 0 ? ` (${supabaseAttachments.length})` : ""}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="comments" className="mt-3 space-y-3">
                <div className="space-y-3">
                  {currentTask.comments.map((comment) => (
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
                  {currentTask.comments.length === 0 && (
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
                  {uploading ? <Loader2 className="size-3 animate-spin" /> : <Upload className="size-3" />}
                  {uploading ? "Uploading..." : "Attach Files"}
                </Button>
                <div className="space-y-2">
                  {supabaseAttachments.length === 0 && (
                    <p className="text-xs text-muted-foreground">No files attached.</p>
                  )}
                  {supabaseAttachments.map((att) => (
                    <div key={att.id} className="flex items-center gap-3 rounded-md border px-3 py-2 group" data-testid={`attachment-${att.id}`}>
                      <Paperclip className="size-3.5 text-muted-foreground shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{att.file_name}</p>
                        {att.file_size != null && (
                          <p className="text-xs text-muted-foreground">{formatBytes(att.file_size)}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {att.file_url && (
                          <a href={att.file_url} target="_blank" rel="noopener noreferrer" data-testid={`link-download-${att.id}`}>
                            <Button variant="ghost" size="icon" className="size-6">
                              <ExternalLink className="size-3 text-muted-foreground" />
                            </Button>
                          </a>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-6"
                          onClick={() => deleteAttachmentMutation.mutate(att.id)}
                          data-testid={`btn-delete-attachment-${att.id}`}
                        >
                          <Trash2 className="size-3 text-muted-foreground" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <div className="w-full lg:w-[240px] shrink-0 border-t lg:border-t-0 lg:border-l bg-muted/30 p-4 space-y-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Clock className="size-3" /> Status
              </label>
              <Select value={currentTask.status} onValueChange={(v) => { updateTask({ status: v as DevTask["status"] }); toast({ title: `Status changed to ${formatLabel(v)}` }); }}>
                <SelectTrigger className="h-8 text-sm" data-testid="select-task-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((s) => (
                    <SelectItem key={s} value={s}>{formatLabel(s)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1">
                {priorityIcons[currentTask.priority]} Priority
              </label>
              <Select value={currentTask.priority} onValueChange={(v) => { updateTask({ priority: v as DevTask["priority"] }); toast({ title: `Priority changed to ${formatLabel(v)}` }); }}>
                <SelectTrigger className="h-8 text-sm" data-testid="select-task-priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priorityOptions.map((p) => (
                    <SelectItem key={p} value={p}>{formatLabel(p)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <FileText className="size-3" /> Type
              </label>
              <Select value={currentTask.type} onValueChange={(v) => { updateTask({ type: v as DevTask["type"] }); }}>
                <SelectTrigger className="h-8 text-sm" data-testid="select-task-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {typeOptions.map((t) => (
                    <SelectItem key={t} value={t}>{formatLabel(t)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <User className="size-3" /> Assignee
              </label>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold">
                  {getInitials(currentTask.assignee)}
                </div>
                <span className="text-sm truncate">{currentTask.assignee}</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1">
                <User className="size-3" /> Reporter
              </label>
              <span className="text-sm text-muted-foreground">{currentTask.reporter}</span>
            </div>

            <Separator />

            {sprint && (
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Sprint</label>
                <p className="text-sm">{sprint.name}</p>
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Story Points</label>
              <Badge variant="secondary" className="text-xs">{currentTask.storyPoints} pts</Badge>
            </div>

            {currentTask.dueDate && (
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Calendar className="size-3" /> Due Date
                </label>
                <p className={`text-sm ${new Date(currentTask.dueDate) < new Date() && currentTask.status !== "done" ? "text-red-500 font-medium" : ""}`}>
                  {currentTask.dueDate}
                </p>
              </div>
            )}

            {currentTask.tags.length > 0 && (
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Tag className="size-3" /> Tags
                </label>
                <div className="flex flex-wrap gap-1">
                  {currentTask.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            <div className="space-y-1 text-xs text-muted-foreground">
              <p>Created: {currentTask.createdDate}</p>
              <p>Updated: {currentTask.updatedDate}</p>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
