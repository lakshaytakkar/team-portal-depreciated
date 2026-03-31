import { useState } from "react";
import {
  BookOpen,
  Play,
  Clock,
  GripVertical,
  Plus,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronRight,
  Video,
  Eye,
  EyeOff,
  Link as LinkIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { PageShell, PageHeader, StatGrid, StatCard } from "@/components/layout";
import { SALES_COLOR } from "@/lib/sales-config";
import { onboardingModules, type OnboardingModule, type OnboardingVideo } from "@/lib/mock-data-sales";

export default function ContentFreeLearningPage() {
  const [modules, setModules] = useState<OnboardingModule[]>(onboardingModules);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [reorderMode, setReorderMode] = useState(false);

  const [moduleDialogOpen, setModuleDialogOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<OnboardingModule | null>(null);
  const [moduleForm, setModuleForm] = useState({ title: "", description: "" });

  const [videoSheetOpen, setVideoSheetOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<OnboardingVideo | null>(null);
  const [videoParentModuleId, setVideoParentModuleId] = useState<string | null>(null);
  const [videoForm, setVideoForm] = useState({ title: "", description: "", videoUrl: "", duration: "", thumbnailUrl: "" });

  const [deleteTarget, setDeleteTarget] = useState<{ type: "module" | "video"; moduleId: string; videoId?: string } | null>(null);

  const totalModules = modules.length;
  const publishedModules = modules.filter((m) => m.status === "published").length;
  const totalVideos = modules.reduce((s, m) => s + m.videos.length, 0);
  const totalDuration = modules.reduce((s, m) => {
    return s + m.videos.reduce((vs, v) => {
      const parts = v.duration.split(":");
      return vs + parseInt(parts[0]) * 60 + parseInt(parts[1]);
    }, 0);
  }, 0);
  const hours = Math.floor(totalDuration / 3600);
  const mins = Math.floor((totalDuration % 3600) / 60);

  function toggleExpanded(moduleId: string) {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(moduleId)) next.delete(moduleId);
      else next.add(moduleId);
      return next;
    });
  }

  function toggleModuleStatus(moduleId: string) {
    setModules((prev) =>
      prev.map((m) =>
        m.id === moduleId ? { ...m, status: m.status === "published" ? "draft" : "published" } : m
      )
    );
  }

  function openAddModule() {
    setEditingModule(null);
    setModuleForm({ title: "", description: "" });
    setModuleDialogOpen(true);
  }

  function openEditModule(mod: OnboardingModule) {
    setEditingModule(mod);
    setModuleForm({ title: mod.title, description: mod.description });
    setModuleDialogOpen(true);
  }

  function saveModule() {
    if (!moduleForm.title.trim()) return;
    if (editingModule) {
      setModules((prev) =>
        prev.map((m) =>
          m.id === editingModule.id ? { ...m, title: moduleForm.title, description: moduleForm.description } : m
        )
      );
    } else {
      const newModule: OnboardingModule = {
        id: `MOD-${String(modules.length + 1).padStart(3, "0")}`,
        title: moduleForm.title,
        description: moduleForm.description,
        status: "draft",
        order: modules.length + 1,
        videos: [],
      };
      setModules((prev) => [...prev, newModule]);
    }
    setModuleDialogOpen(false);
  }

  function openAddVideo(moduleId: string) {
    setEditingVideo(null);
    setVideoParentModuleId(moduleId);
    setVideoForm({ title: "", description: "", videoUrl: "", duration: "", thumbnailUrl: "" });
    setVideoSheetOpen(true);
  }

  function openEditVideo(moduleId: string, video: OnboardingVideo) {
    setEditingVideo(video);
    setVideoParentModuleId(moduleId);
    setVideoForm({
      title: video.title,
      description: video.description,
      videoUrl: video.videoUrl,
      duration: video.duration,
      thumbnailUrl: video.thumbnailUrl,
    });
    setVideoSheetOpen(true);
  }

  function saveVideo() {
    if (!videoForm.title.trim() || !videoParentModuleId) return;
    setModules((prev) =>
      prev.map((m) => {
        if (m.id !== videoParentModuleId) return m;
        if (editingVideo) {
          return {
            ...m,
            videos: m.videos.map((v) =>
              v.id === editingVideo.id
                ? { ...v, ...videoForm }
                : v
            ),
          };
        }
        const newVideo: OnboardingVideo = {
          id: `VID-${String(totalVideos + 1).padStart(3, "0")}`,
          ...videoForm,
          order: m.videos.length + 1,
        };
        return { ...m, videos: [...m.videos, newVideo] };
      })
    );
    setVideoSheetOpen(false);
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    if (deleteTarget.type === "module") {
      setModules((prev) => prev.filter((m) => m.id !== deleteTarget.moduleId));
    } else if (deleteTarget.videoId) {
      setModules((prev) =>
        prev.map((m) =>
          m.id === deleteTarget.moduleId
            ? { ...m, videos: m.videos.filter((v) => v.id !== deleteTarget.videoId) }
            : m
        )
      );
    }
    setDeleteTarget(null);
  }

  return (
    <PageShell>
      <PageHeader
        title="Free Learning Content"
        subtitle="Manage onboarding modules and video lessons for free users"
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant={reorderMode ? "default" : "outline"}
              onClick={() => setReorderMode(!reorderMode)}
              data-testid="button-toggle-reorder"
            >
              <GripVertical className="h-4 w-4 mr-1" />
              {reorderMode ? "Done Reordering" : "Reorder"}
            </Button>
            <Button
              onClick={openAddModule}
              style={{ backgroundColor: SALES_COLOR, borderColor: SALES_COLOR }}
              className="text-white"
              data-testid="button-add-module"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Module
            </Button>
          </div>
        }
      />

      <StatGrid cols={4}>
        <StatCard
          label="Total Modules"
          value={totalModules}
          icon={BookOpen}
          iconBg="#fee2e2"
          iconColor={SALES_COLOR}
        />
        <StatCard
          label="Published"
          value={publishedModules}
          trend={`${totalModules - publishedModules} drafts`}
          icon={Eye}
          iconBg="#d1fae5"
          iconColor="#059669"
        />
        <StatCard
          label="Total Videos"
          value={totalVideos}
          icon={Video}
          iconBg="#e0f2fe"
          iconColor="#0284c7"
        />
        <StatCard
          label="Total Duration"
          value={hours > 0 ? `${hours}h ${mins}m` : `${mins}m`}
          icon={Clock}
          iconBg="#fef3c7"
          iconColor="#d97706"
        />
      </StatGrid>

      <div className="space-y-3" data-testid="modules-list">
        {modules.map((mod) => {
          const isExpanded = expandedModules.has(mod.id);
          return (
            <div
              key={mod.id}
              className="rounded-xl border bg-card"
              data-testid={`module-${mod.id}`}
            >
              <div
                className="flex items-center gap-3 px-5 py-4 cursor-pointer"
                onClick={() => toggleExpanded(mod.id)}
                data-testid={`button-toggle-module-${mod.id}`}
              >
                {reorderMode && (
                  <GripVertical className="h-4 w-4 text-muted-foreground shrink-0 cursor-grab" />
                )}
                <div className="shrink-0">
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold" data-testid={`text-module-title-${mod.id}`}>
                      {mod.title}
                    </span>
                    <Badge variant="secondary" className="text-[10px]">
                      {mod.videos.length} {mod.videos.length === 1 ? "video" : "videos"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">
                    {mod.description}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center gap-1.5">
                    {mod.status === "published" ? (
                      <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                    ) : (
                      <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />
                    )}
                    <Switch
                      checked={mod.status === "published"}
                      onCheckedChange={() => toggleModuleStatus(mod.id)}
                      data-testid={`switch-module-status-${mod.id}`}
                    />
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => openEditModule(mod)}
                    data-testid={`button-edit-module-${mod.id}`}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setDeleteTarget({ type: "module", moduleId: mod.id })}
                    data-testid={`button-delete-module-${mod.id}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              {isExpanded && (
                <div className="border-t px-5 py-4 space-y-2" data-testid={`module-videos-${mod.id}`}>
                  {mod.videos.length === 0 ? (
                    <p className="text-xs text-muted-foreground py-3 text-center">
                      No videos in this module yet.
                    </p>
                  ) : (
                    mod.videos.map((video) => (
                      <div
                        key={video.id}
                        className="flex items-center gap-3 rounded-lg border p-3 hover-elevate"
                        data-testid={`video-${video.id}`}
                      >
                        {reorderMode && (
                          <GripVertical className="h-3.5 w-3.5 text-muted-foreground shrink-0 cursor-grab" />
                        )}
                        <div className="shrink-0 h-12 w-20 rounded-md bg-muted overflow-hidden flex items-center justify-center relative">
                          {video.thumbnailUrl ? (
                            <img
                              src={video.thumbnailUrl}
                              alt={video.title}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <Video className="h-5 w-5 text-muted-foreground" />
                          )}
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                            <Play className="h-4 w-4 text-white" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate" data-testid={`text-video-title-${video.id}`}>
                            {video.title}
                          </p>
                          <p className="text-xs text-muted-foreground truncate mt-0.5">
                            {video.description}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge variant="outline" className="text-[10px]">
                            <Clock className="h-3 w-3 mr-1" />
                            {video.duration}
                          </Badge>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => openEditVideo(mod.id, video)}
                            data-testid={`button-edit-video-${video.id}`}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setDeleteTarget({ type: "video", moduleId: mod.id, videoId: video.id })}
                            data-testid={`button-delete-video-${video.id}`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                  <Button
                    variant="outline"
                    className="w-full mt-2"
                    onClick={() => openAddVideo(mod.id)}
                    data-testid={`button-add-video-${mod.id}`}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Video
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Dialog open={moduleDialogOpen} onOpenChange={setModuleDialogOpen}>
        <DialogContent data-testid="dialog-module">
          <DialogHeader>
            <DialogTitle>{editingModule ? "Edit Module" : "Add Module"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="module-title">Title</Label>
              <Input
                id="module-title"
                value={moduleForm.title}
                onChange={(e) => setModuleForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="Module title"
                data-testid="input-module-title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="module-description">Description</Label>
              <Textarea
                id="module-description"
                value={moduleForm.description}
                onChange={(e) => setModuleForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Brief description of this module"
                data-testid="input-module-description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModuleDialogOpen(false)} data-testid="button-cancel-module">
              Cancel
            </Button>
            <Button
              onClick={saveModule}
              disabled={!moduleForm.title.trim()}
              style={{ backgroundColor: SALES_COLOR, borderColor: SALES_COLOR }}
              className="text-white"
              data-testid="button-save-module"
            >
              {editingModule ? "Save Changes" : "Add Module"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Sheet open={videoSheetOpen} onOpenChange={setVideoSheetOpen}>
        <SheetContent data-testid="sheet-video">
          <SheetHeader>
            <SheetTitle>{editingVideo ? "Edit Video" : "Add Video"}</SheetTitle>
          </SheetHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="video-title">Title</Label>
              <Input
                id="video-title"
                value={videoForm.title}
                onChange={(e) => setVideoForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="Video title"
                data-testid="input-video-title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="video-description">Description</Label>
              <Textarea
                id="video-description"
                value={videoForm.description}
                onChange={(e) => setVideoForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Brief description"
                data-testid="input-video-description"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="video-url">Video URL</Label>
              <div className="relative">
                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="video-url"
                  className="pl-10"
                  value={videoForm.videoUrl}
                  onChange={(e) => setVideoForm((f) => ({ ...f, videoUrl: e.target.value }))}
                  placeholder="https://example.com/video.mp4"
                  data-testid="input-video-url"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="video-duration">Duration</Label>
                <Input
                  id="video-duration"
                  value={videoForm.duration}
                  onChange={(e) => setVideoForm((f) => ({ ...f, duration: e.target.value }))}
                  placeholder="12:30"
                  data-testid="input-video-duration"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="video-thumbnail">Thumbnail URL</Label>
                <Input
                  id="video-thumbnail"
                  value={videoForm.thumbnailUrl}
                  onChange={(e) => setVideoForm((f) => ({ ...f, thumbnailUrl: e.target.value }))}
                  placeholder="https://example.com/thumb.jpg"
                  data-testid="input-video-thumbnail"
                />
              </div>
            </div>
          </div>
          <SheetFooter>
            <Button variant="outline" onClick={() => setVideoSheetOpen(false)} data-testid="button-cancel-video">
              Cancel
            </Button>
            <Button
              onClick={saveVideo}
              disabled={!videoForm.title.trim()}
              style={{ backgroundColor: SALES_COLOR, borderColor: SALES_COLOR }}
              className="text-white"
              data-testid="button-save-video"
            >
              {editingVideo ? "Save Changes" : "Add Video"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent data-testid="dialog-delete-confirm">
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete {deleteTarget?.type === "module" ? "Module" : "Video"}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget?.type === "module"
                ? "This will permanently delete this module and all its videos. This action cannot be undone."
                : "This will permanently delete this video. This action cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground"
              data-testid="button-confirm-delete"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageShell>
  );
}
