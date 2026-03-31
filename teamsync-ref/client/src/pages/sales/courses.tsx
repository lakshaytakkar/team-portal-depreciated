import { useState } from "react";
import { BookOpen, Users, BarChart3, GraduationCap, Plus, ChevronRight, Video, FileText, HelpCircle, GripVertical, Eye, EyeOff } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { StatsCard } from "@/components/ds/stats-card";
import { StatsCardSkeleton } from "@/components/ui/card-skeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { courses as initialCourses, type Course, type CourseModule, type CourseChapter } from "@/lib/mock-data-sales";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { Fade, Stagger, StaggerItem, PageTransition } from "@/components/ui/animated";
import { PageShell } from "@/components/layout";

function ContentTypeIcon({ type }: { type: string }) {
  switch (type) {
    case "video":
      return <Video className="h-3.5 w-3.5" style={{ color: "hsl(var(--info))" }} />;
    case "quiz":
      return <HelpCircle className="h-3.5 w-3.5" style={{ color: "hsl(var(--warning))" }} />;
    case "text":
      return <FileText className="h-3.5 w-3.5" style={{ color: "hsl(var(--success))" }} />;
    default:
      return <FileText className="h-3.5 w-3.5 text-muted-foreground" />;
  }
}

export default function CoursesPage() {
  const loading = useSimulatedLoading();
  const [coursesList, setCoursesList] = useState<Course[]>(initialCourses);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [reorderMode, setReorderMode] = useState(false);

  const [addModuleOpen, setAddModuleOpen] = useState(false);
  const [editModuleOpen, setEditModuleOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<CourseModule | null>(null);
  const [moduleForm, setModuleForm] = useState({ title: "", description: "", isPreview: false });

  const [addChapterOpen, setAddChapterOpen] = useState(false);
  const [editChapterOpen, setEditChapterOpen] = useState(false);
  const [editingChapter, setEditingChapter] = useState<CourseChapter | null>(null);
  const [chapterForm, setChapterForm] = useState({ title: "", contentType: "video" as "video" | "text" | "quiz", videoUrl: "", duration: "", isPreview: false });

  const selectedCourse = coursesList.find((c) => c.id === selectedCourseId);
  const selectedModule = selectedCourse?.modules.find((m) => m.id === selectedModuleId);

  const totalEnrolled = coursesList.reduce((s, c) => s + c.enrolled, 0);
  const publishedCount = coursesList.filter((c) => c.status === "published").length;
  const avgCompletion = publishedCount > 0 ? Math.round(
    coursesList.filter((c) => c.status === "published").reduce((s, c) => s + c.completionRate, 0) / publishedCount
  ) : 0;
  const totalLessons = coursesList.reduce((s, c) => s + c.lessons, 0);

  const toggleCourseStatus = (courseId: string) => {
    setCoursesList((prev) =>
      prev.map((c) =>
        c.id === courseId ? { ...c, status: c.status === "published" ? "draft" : "published" } : c
      )
    );
  };

  const handleAddModule = () => {
    if (!selectedCourseId || !moduleForm.title) return;
    const newModule: CourseModule = {
      id: `MOD-${Date.now()}`,
      title: moduleForm.title,
      description: moduleForm.description,
      isPreview: moduleForm.isPreview,
      chapters: [],
    };
    setCoursesList((prev) =>
      prev.map((c) =>
        c.id === selectedCourseId ? { ...c, modules: [...c.modules, newModule] } : c
      )
    );
    setModuleForm({ title: "", description: "", isPreview: false });
    setAddModuleOpen(false);
  };

  const handleEditModule = () => {
    if (!selectedCourseId || !editingModule || !moduleForm.title) return;
    setCoursesList((prev) =>
      prev.map((c) =>
        c.id === selectedCourseId
          ? {
              ...c,
              modules: c.modules.map((m) =>
                m.id === editingModule.id
                  ? { ...m, title: moduleForm.title, description: moduleForm.description, isPreview: moduleForm.isPreview }
                  : m
              ),
            }
          : c
      )
    );
    setEditModuleOpen(false);
    setEditingModule(null);
  };

  const openEditModule = (mod: CourseModule) => {
    setEditingModule(mod);
    setModuleForm({ title: mod.title, description: mod.description, isPreview: mod.isPreview });
    setEditModuleOpen(true);
  };

  const handleAddChapter = () => {
    if (!selectedCourseId || !selectedModuleId || !chapterForm.title) return;
    const newChapter: CourseChapter = {
      id: `CH-${Date.now()}`,
      title: chapterForm.title,
      contentType: chapterForm.contentType,
      videoUrl: chapterForm.contentType === "video" ? chapterForm.videoUrl : undefined,
      duration: chapterForm.duration,
      isPreview: chapterForm.isPreview,
    };
    setCoursesList((prev) =>
      prev.map((c) =>
        c.id === selectedCourseId
          ? {
              ...c,
              modules: c.modules.map((m) =>
                m.id === selectedModuleId ? { ...m, chapters: [...m.chapters, newChapter] } : m
              ),
            }
          : c
      )
    );
    setChapterForm({ title: "", contentType: "video", videoUrl: "", duration: "", isPreview: false });
    setAddChapterOpen(false);
  };

  const handleEditChapter = () => {
    if (!selectedCourseId || !selectedModuleId || !editingChapter || !chapterForm.title) return;
    setCoursesList((prev) =>
      prev.map((c) =>
        c.id === selectedCourseId
          ? {
              ...c,
              modules: c.modules.map((m) =>
                m.id === selectedModuleId
                  ? {
                      ...m,
                      chapters: m.chapters.map((ch) =>
                        ch.id === editingChapter.id
                          ? {
                              ...ch,
                              title: chapterForm.title,
                              contentType: chapterForm.contentType,
                              videoUrl: chapterForm.contentType === "video" ? chapterForm.videoUrl : undefined,
                              duration: chapterForm.duration,
                              isPreview: chapterForm.isPreview,
                            }
                          : ch
                      ),
                    }
                  : m
              ),
            }
          : c
      )
    );
    setEditChapterOpen(false);
    setEditingChapter(null);
  };

  const openEditChapter = (ch: CourseChapter) => {
    setEditingChapter(ch);
    setChapterForm({
      title: ch.title,
      contentType: ch.contentType,
      videoUrl: ch.videoUrl || "",
      duration: ch.duration,
      isPreview: ch.isPreview,
    });
    setEditChapterOpen(true);
  };

  const renderBreadcrumbs = () => {
    return (
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground flex-wrap" data-testid="breadcrumb-nav">
        <button
          className="hover:text-foreground transition-colors font-medium"
          onClick={() => { setSelectedCourseId(null); setSelectedModuleId(null); }}
          data-testid="breadcrumb-courses"
        >
          Courses
        </button>
        {selectedCourse && (
          <>
            <ChevronRight className="h-3.5 w-3.5" />
            <button
              className={`hover:text-foreground transition-colors ${!selectedModuleId ? "text-foreground font-medium" : ""}`}
              onClick={() => setSelectedModuleId(null)}
              data-testid="breadcrumb-course-name"
            >
              {selectedCourse.title}
            </button>
          </>
        )}
        {selectedModule && (
          <>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-foreground font-medium" data-testid="breadcrumb-module-name">
              {selectedModule.title}
            </span>
          </>
        )}
      </div>
    );
  };

  const renderChapterEditor = () => {
    if (!selectedModule || !selectedCourse) return null;
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h3 className="text-base font-semibold" data-testid="text-module-title">{selectedModule.title}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{selectedModule.description}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setReorderMode(!reorderMode)} data-testid="button-toggle-reorder-chapters">
              <GripVertical className="h-3.5 w-3.5 mr-1" />
              {reorderMode ? "Done" : "Reorder"}
            </Button>
            <Button size="sm" onClick={() => { setChapterForm({ title: "", contentType: "video", videoUrl: "", duration: "", isPreview: false }); setAddChapterOpen(true); }} data-testid="button-add-chapter">
              <Plus className="h-3.5 w-3.5 mr-1" />
              Add Chapter
            </Button>
          </div>
        </div>

        <div className="space-y-1.5">
          {selectedModule.chapters.map((ch, idx) => (
            <Card
              key={ch.id}
              className="p-3 hover-elevate cursor-pointer"
              onClick={() => openEditChapter(ch)}
              data-testid={`card-chapter-${ch.id}`}
            >
              <div className="flex items-center gap-3">
                {reorderMode && <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab shrink-0" />}
                <span className="text-xs text-muted-foreground w-6 shrink-0">{idx + 1}.</span>
                <ContentTypeIcon type={ch.contentType} />
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium truncate block" data-testid={`text-chapter-title-${ch.id}`}>{ch.title}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {ch.isPreview && (
                    <Badge variant="outline" className="text-[10px]">
                      <Eye className="h-2.5 w-2.5 mr-0.5" />
                      Preview
                    </Badge>
                  )}
                  <Badge variant="secondary" className="text-[10px]">{ch.contentType}</Badge>
                  <span className="text-xs text-muted-foreground">{ch.duration}</span>
                </div>
              </div>
            </Card>
          ))}
          {selectedModule.chapters.length === 0 && (
            <div className="text-center py-8 text-sm text-muted-foreground" data-testid="empty-chapters">
              No chapters yet. Click "Add Chapter" to create one.
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderModuleList = () => {
    if (!selectedCourse) return null;
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h3 className="text-base font-semibold" data-testid="text-course-detail-title">{selectedCourse.title}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{selectedCourse.instructor} · {selectedCourse.modules.length} modules · {selectedCourse.lessons} lessons</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setReorderMode(!reorderMode)} data-testid="button-toggle-reorder-modules">
              <GripVertical className="h-3.5 w-3.5 mr-1" />
              {reorderMode ? "Done" : "Reorder"}
            </Button>
            <Button size="sm" onClick={() => { setModuleForm({ title: "", description: "", isPreview: false }); setAddModuleOpen(true); }} data-testid="button-add-module">
              <Plus className="h-3.5 w-3.5 mr-1" />
              Add Module
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          {selectedCourse.modules.map((mod, idx) => (
            <Card
              key={mod.id}
              className="p-4 hover-elevate cursor-pointer"
              data-testid={`card-module-${mod.id}`}
            >
              <div className="flex items-center gap-3" onClick={() => setSelectedModuleId(mod.id)}>
                {reorderMode && <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab shrink-0" />}
                <div className="flex items-center justify-center h-8 w-8 rounded-md bg-muted text-xs font-semibold shrink-0">
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold" data-testid={`text-module-name-${mod.id}`}>{mod.title}</span>
                    {mod.isPreview && (
                      <Badge variant="outline" className="text-[10px]">
                        <Eye className="h-2.5 w-2.5 mr-0.5" />
                        Preview
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">{mod.description}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <Badge variant="secondary" className="text-[10px]">{mod.chapters.length} chapters</Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => { e.stopPropagation(); openEditModule(mod); }}
                    data-testid={`button-edit-module-${mod.id}`}
                  >
                    <FileText className="h-3.5 w-3.5" />
                  </Button>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </Card>
          ))}
          {selectedCourse.modules.length === 0 && (
            <div className="text-center py-8 text-sm text-muted-foreground" data-testid="empty-modules">
              No modules yet. Click "Add Module" to create one.
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderCourseList = () => {
    return (
      <>
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
                title="Total Courses"
                value={coursesList.length}
                change={`${publishedCount} published`}
                changeType="neutral"
                icon={<BookOpen className="size-5" />}
              />
            </StaggerItem>
            <StaggerItem>
              <StatsCard
                title="Total Enrolled"
                value={totalEnrolled.toLocaleString()}
                change="+18% this month"
                changeType="positive"
                icon={<Users className="size-5" />}
              />
            </StaggerItem>
            <StaggerItem>
              <StatsCard
                title="Avg Completion"
                value={`${avgCompletion}%`}
                change="+5% improvement"
                changeType="positive"
                icon={<BarChart3 className="size-5" />}
              />
            </StaggerItem>
            <StaggerItem>
              <StatsCard
                title="Total Lessons"
                value={totalLessons}
                change={`${coursesList.length} courses`}
                changeType="neutral"
                icon={<GraduationCap className="size-5" />}
              />
            </StaggerItem>
          </Stagger>
        )}

        {loading ? (
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-lg border bg-background p-5">
                <div className="flex flex-col gap-3">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Fade direction="up" delay={0.15} className="mt-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {coursesList.map((course) => (
                <Card
                  key={course.id}
                  className="p-5 hover-elevate cursor-pointer"
                  onClick={() => setSelectedCourseId(course.id)}
                  data-testid={`card-course-${course.id}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold truncate" data-testid={`text-course-title-${course.id}`}>
                        {course.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{course.instructor}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                      <Switch
                        checked={course.status === "published"}
                        onCheckedChange={() => toggleCourseStatus(course.id)}
                        data-testid={`switch-publish-${course.id}`}
                      />
                      <span className="text-[10px] text-muted-foreground w-14">
                        {course.status === "published" ? "Published" : "Draft"}
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-2 flex-wrap">
                    <Badge variant="secondary" className="text-xs">
                      {course.category}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      <Users className="h-3 w-3 mr-1" />
                      {course.enrolled.toLocaleString()}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {course.modules.length} modules
                    </Badge>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-3 border-t pt-3">
                    <div className="flex flex-col items-center">
                      <span className="text-lg font-semibold" data-testid={`text-lessons-${course.id}`}>
                        {course.lessons}
                      </span>
                      <span className="text-[10px] text-muted-foreground">Lessons</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-lg font-semibold" data-testid={`text-enrolled-${course.id}`}>
                        {course.enrolled.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-muted-foreground">Enrolled</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-lg font-semibold" data-testid={`text-completion-${course.id}`}>
                        {course.completionRate}%
                      </span>
                      <span className="text-[10px] text-muted-foreground">Completion</span>
                    </div>
                  </div>
                  {course.status === "published" && (
                    <div className="mt-3">
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary transition-all duration-500"
                          style={{ width: `${course.completionRate}%` }}
                        />
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </Fade>
        )}
      </>
    );
  };

  return (
    <PageShell>
      <PageTransition>
        {renderBreadcrumbs()}

        {!selectedCourseId && renderCourseList()}
        {selectedCourseId && !selectedModuleId && renderModuleList()}
        {selectedCourseId && selectedModuleId && renderChapterEditor()}

        <Dialog open={addModuleOpen} onOpenChange={setAddModuleOpen}>
          <DialogContent data-testid="dialog-add-module">
            <DialogHeader>
              <DialogTitle>Add Module</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="mod-title">Title</Label>
                <Input
                  id="mod-title"
                  value={moduleForm.title}
                  onChange={(e) => setModuleForm((f) => ({ ...f, title: e.target.value }))}
                  data-testid="input-module-title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mod-desc">Description</Label>
                <Textarea
                  id="mod-desc"
                  value={moduleForm.description}
                  onChange={(e) => setModuleForm((f) => ({ ...f, description: e.target.value }))}
                  className="resize-none"
                  data-testid="input-module-description"
                />
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  checked={moduleForm.isPreview}
                  onCheckedChange={(v) => setModuleForm((f) => ({ ...f, isPreview: v }))}
                  data-testid="switch-module-preview"
                />
                <Label>Free Preview</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddModuleOpen(false)} data-testid="button-cancel-module">Cancel</Button>
              <Button onClick={handleAddModule} disabled={!moduleForm.title} data-testid="button-save-module">Add Module</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={editModuleOpen} onOpenChange={setEditModuleOpen}>
          <DialogContent data-testid="dialog-edit-module">
            <DialogHeader>
              <DialogTitle>Edit Module</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-mod-title">Title</Label>
                <Input
                  id="edit-mod-title"
                  value={moduleForm.title}
                  onChange={(e) => setModuleForm((f) => ({ ...f, title: e.target.value }))}
                  data-testid="input-edit-module-title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-mod-desc">Description</Label>
                <Textarea
                  id="edit-mod-desc"
                  value={moduleForm.description}
                  onChange={(e) => setModuleForm((f) => ({ ...f, description: e.target.value }))}
                  className="resize-none"
                  data-testid="input-edit-module-description"
                />
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  checked={moduleForm.isPreview}
                  onCheckedChange={(v) => setModuleForm((f) => ({ ...f, isPreview: v }))}
                  data-testid="switch-edit-module-preview"
                />
                <Label>Free Preview</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditModuleOpen(false)} data-testid="button-cancel-edit-module">Cancel</Button>
              <Button onClick={handleEditModule} disabled={!moduleForm.title} data-testid="button-save-edit-module">Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={addChapterOpen} onOpenChange={setAddChapterOpen}>
          <DialogContent data-testid="dialog-add-chapter">
            <DialogHeader>
              <DialogTitle>Add Chapter</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ch-title">Title</Label>
                <Input
                  id="ch-title"
                  value={chapterForm.title}
                  onChange={(e) => setChapterForm((f) => ({ ...f, title: e.target.value }))}
                  data-testid="input-chapter-title"
                />
              </div>
              <div className="space-y-2">
                <Label>Content Type</Label>
                <Select value={chapterForm.contentType} onValueChange={(v) => setChapterForm((f) => ({ ...f, contentType: v as "video" | "text" | "quiz" }))}>
                  <SelectTrigger data-testid="select-content-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="quiz">Quiz</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {chapterForm.contentType === "video" && (
                <div className="space-y-2">
                  <Label htmlFor="ch-url">Video URL</Label>
                  <Input
                    id="ch-url"
                    value={chapterForm.videoUrl}
                    onChange={(e) => setChapterForm((f) => ({ ...f, videoUrl: e.target.value }))}
                    data-testid="input-chapter-url"
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="ch-duration">Duration</Label>
                <Input
                  id="ch-duration"
                  placeholder="e.g. 18m"
                  value={chapterForm.duration}
                  onChange={(e) => setChapterForm((f) => ({ ...f, duration: e.target.value }))}
                  data-testid="input-chapter-duration"
                />
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  checked={chapterForm.isPreview}
                  onCheckedChange={(v) => setChapterForm((f) => ({ ...f, isPreview: v }))}
                  data-testid="switch-chapter-preview"
                />
                <Label>Free Preview</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddChapterOpen(false)} data-testid="button-cancel-chapter">Cancel</Button>
              <Button onClick={handleAddChapter} disabled={!chapterForm.title} data-testid="button-save-chapter">Add Chapter</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={editChapterOpen} onOpenChange={setEditChapterOpen}>
          <DialogContent data-testid="dialog-edit-chapter">
            <DialogHeader>
              <DialogTitle>Edit Chapter</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-ch-title">Title</Label>
                <Input
                  id="edit-ch-title"
                  value={chapterForm.title}
                  onChange={(e) => setChapterForm((f) => ({ ...f, title: e.target.value }))}
                  data-testid="input-edit-chapter-title"
                />
              </div>
              <div className="space-y-2">
                <Label>Content Type</Label>
                <Select value={chapterForm.contentType} onValueChange={(v) => setChapterForm((f) => ({ ...f, contentType: v as "video" | "text" | "quiz" }))}>
                  <SelectTrigger data-testid="select-edit-content-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="quiz">Quiz</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {chapterForm.contentType === "video" && (
                <div className="space-y-2">
                  <Label htmlFor="edit-ch-url">Video URL</Label>
                  <Input
                    id="edit-ch-url"
                    value={chapterForm.videoUrl}
                    onChange={(e) => setChapterForm((f) => ({ ...f, videoUrl: e.target.value }))}
                    data-testid="input-edit-chapter-url"
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="edit-ch-duration">Duration</Label>
                <Input
                  id="edit-ch-duration"
                  placeholder="e.g. 18m"
                  value={chapterForm.duration}
                  onChange={(e) => setChapterForm((f) => ({ ...f, duration: e.target.value }))}
                  data-testid="input-edit-chapter-duration"
                />
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  checked={chapterForm.isPreview}
                  onCheckedChange={(v) => setChapterForm((f) => ({ ...f, isPreview: v }))}
                  data-testid="switch-edit-chapter-preview"
                />
                <Label>Free Preview</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditChapterOpen(false)} data-testid="button-cancel-edit-chapter">Cancel</Button>
              <Button onClick={handleEditChapter} disabled={!chapterForm.title} data-testid="button-save-edit-chapter">Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageTransition>
    </PageShell>
  );
}
