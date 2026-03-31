import { useParams } from "wouter";
import { useLocation } from "wouter";
import { BookOpen, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageShell } from "@/components/layout";
import { PageTransition } from "@/components/ui/animated";
import { courses } from "@/lib/mock-data-sales";

export default function CourseDetailPage() {
  const params = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const course = courses.find((c) => c.id === params.id);

  if (!course) {
    return (
      <PageShell>
        <div className="flex flex-col items-center justify-center py-20 text-center" data-testid="course-not-found">
          <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-lg font-semibold">Course not found</h2>
          <p className="text-sm text-muted-foreground mt-1">The course you are looking for does not exist.</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate("/usdrop/courses")} data-testid="button-back-courses">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Courses
          </Button>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <PageTransition>
        <div className="mb-4">
          <Button variant="ghost" onClick={() => navigate("/usdrop/courses")} data-testid="button-back">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Courses
          </Button>
        </div>

        <div className="rounded-xl border bg-card p-6 space-y-4">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-xl font-bold font-heading" data-testid="text-course-title">{course.title}</h1>
              <p className="text-sm text-muted-foreground mt-1">by {course.instructor} · {course.category}</p>
            </div>
            <div className="text-sm text-muted-foreground">
              {course.status === "published" ? "Published" : "Draft"} · {course.enrolled.toLocaleString()} enrolled
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Modules ({course.modules.length})</h3>
            {course.modules.map((mod, idx) => (
              <div key={mod.id} className="rounded-lg border p-4 space-y-2" data-testid={`module-section-${mod.id}`}>
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div>
                    <span className="text-sm font-semibold">{idx + 1}. {mod.title}</span>
                    <p className="text-xs text-muted-foreground">{mod.description}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{mod.chapters.length} chapters</span>
                </div>
                <div className="space-y-1 pl-4">
                  {mod.chapters.map((ch, chIdx) => (
                    <div key={ch.id} className="flex items-center justify-between gap-3 py-1.5 text-sm" data-testid={`chapter-row-${ch.id}`}>
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xs text-muted-foreground w-5">{chIdx + 1}.</span>
                        <span className="truncate">{ch.title}</span>
                        {ch.isPreview && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground shrink-0">Preview</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs text-muted-foreground">{ch.contentType}</span>
                        <span className="text-xs text-muted-foreground">{ch.duration}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <p className="text-xs text-muted-foreground">
            For full module and chapter management (add, edit, reorder), use the Courses page.
          </p>
        </div>
      </PageTransition>
    </PageShell>
  );
}
