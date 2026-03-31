import { type ReactNode, type ElementType, useState } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  ChevronRight,
  Clock,
  Download,
  FileText,
  Lock,
  PlayCircle,
  HelpCircle,
  Check,
  Star,
  Users,
  BookOpen,
  Award,
  Circle,
} from "lucide-react";

export interface CourseCardItem {
  id: string;
  title: string;
  thumbnail?: string;
  instructor: string;
  instructorAvatar?: string;
  progress?: number;
  lessonCount: number;
  duration: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  onClick?: () => void;
}

interface CourseCardProps extends CourseCardItem {
  className?: string;
}

const difficultyVariant: Record<string, "secondary" | "default" | "destructive"> = {
  beginner: "secondary",
  intermediate: "default",
  advanced: "destructive",
};

export function CourseCard({
  id,
  title,
  thumbnail,
  instructor,
  instructorAvatar,
  progress,
  lessonCount,
  duration,
  difficulty,
  onClick,
  className,
}: CourseCardProps) {
  return (
    <Card
      className={cn("overflow-visible", onClick && "cursor-pointer hover-elevate", className)}
      onClick={onClick}
      data-testid={`card-course-${id}`}
    >
      {thumbnail && (
        <div className="relative aspect-video w-full overflow-hidden rounded-t-lg">
          <img src={thumbnail} alt={title} className="h-full w-full object-cover" data-testid={`img-course-thumbnail-${id}`} />
          <Badge variant={difficultyVariant[difficulty]} className="absolute top-2 right-2" data-testid={`badge-difficulty-${id}`}>
            {difficulty}
          </Badge>
        </div>
      )}
      {!thumbnail && (
        <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
          <Badge variant={difficultyVariant[difficulty]} data-testid={`badge-difficulty-${id}`}>
            {difficulty}
          </Badge>
        </CardHeader>
      )}
      <CardContent className={cn(thumbnail ? "p-4" : "")}>
        <h3 className="text-sm font-semibold line-clamp-2" data-testid={`text-course-title-${id}`}>{title}</h3>
        <div className="mt-2 flex items-center gap-2">
          <Avatar className="h-5 w-5">
            {instructorAvatar && <AvatarImage src={instructorAvatar} alt={instructor} />}
            <AvatarFallback className="text-[10px]">{instructor.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <span className="text-xs text-muted-foreground" data-testid={`text-instructor-${id}`}>{instructor}</span>
        </div>
        <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
          <span className="flex items-center gap-1">
            <BookOpen className="h-3 w-3" />
            {lessonCount} lessons
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {duration}
          </span>
        </div>
        {progress !== undefined && (
          <div className="mt-3">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-xs text-muted-foreground">Progress</span>
              <span className="text-xs font-medium" data-testid={`text-progress-${id}`}>{progress}%</span>
            </div>
            <Progress value={progress} className="h-1.5" data-testid={`progress-course-${id}`} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface CourseGridProps {
  courses: CourseCardItem[];
  columns?: 2 | 3 | 4;
  emptyMessage?: string;
  className?: string;
}

const gridCols: Record<number, string> = {
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
};

export function CourseGrid({ courses, columns = 3, emptyMessage = "No courses found", className }: CourseGridProps) {
  if (courses.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-muted-foreground" data-testid="course-grid-empty">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={cn("grid gap-4", gridCols[columns], className)} data-testid="course-grid">
      {courses.map((course) => (
        <CourseCard key={course.id} {...course} />
      ))}
    </div>
  );
}

export interface LessonItemData {
  id: string;
  title: string;
  type: "video" | "text" | "quiz";
  duration?: string;
  completed?: boolean;
  locked?: boolean;
  onClick?: () => void;
}

interface LessonItemProps extends LessonItemData {
  className?: string;
}

const lessonTypeIcon: Record<string, ElementType> = {
  video: PlayCircle,
  text: FileText,
  quiz: HelpCircle,
};

export function LessonItem({ id, title, type, duration, completed, locked, onClick, className }: LessonItemProps) {
  const TypeIcon = lessonTypeIcon[type] || Circle;

  return (
    <div
      className={cn(
        "flex items-center gap-3 py-2 px-3 rounded-md",
        locked ? "opacity-50" : onClick ? "cursor-pointer hover-elevate" : "",
        className
      )}
      onClick={locked ? undefined : onClick}
      data-testid={`lesson-item-${id}`}
    >
      <div className="shrink-0">
        {completed ? (
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Check className="h-3 w-3" />
          </div>
        ) : locked ? (
          <Lock className="h-4 w-4 text-muted-foreground" />
        ) : (
          <TypeIcon className="h-4 w-4 text-muted-foreground" />
        )}
      </div>
      <span className={cn("flex-1 text-sm", completed && "line-through text-muted-foreground")} data-testid={`text-lesson-title-${id}`}>
        {title}
      </span>
      {duration && (
        <span className="text-xs text-muted-foreground shrink-0" data-testid={`text-lesson-duration-${id}`}>{duration}</span>
      )}
    </div>
  );
}

export interface ModuleData {
  id: string;
  title: string;
  lessons: LessonItemData[];
  completedCount?: number;
  duration?: string;
}

interface ModuleAccordionProps {
  modules: ModuleData[];
  defaultOpen?: string[];
  className?: string;
}

export function ModuleAccordion({ modules, defaultOpen = [], className }: ModuleAccordionProps) {
  const [openIds, setOpenIds] = useState<Set<string>>(new Set(defaultOpen));

  const toggle = (id: string) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (modules.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-muted-foreground" data-testid="module-accordion-empty">
        No modules available
      </div>
    );
  }

  return (
    <div className={cn("divide-y", className)} data-testid="module-accordion">
      {modules.map((mod) => {
        const isOpen = openIds.has(mod.id);
        const totalLessons = mod.lessons.length;
        const done = mod.completedCount ?? mod.lessons.filter((l) => l.completed).length;

        return (
          <div key={mod.id} data-testid={`module-${mod.id}`}>
            <button
              onClick={() => toggle(mod.id)}
              className="flex items-center gap-3 w-full py-3 px-1 text-left hover-elevate"
              data-testid={`module-trigger-${mod.id}`}
            >
              <span className="text-muted-foreground shrink-0">
                {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate" data-testid={`text-module-title-${mod.id}`}>{mod.title}</p>
                <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground flex-wrap">
                  <span>{done}/{totalLessons} completed</span>
                  {mod.duration && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {mod.duration}
                    </span>
                  )}
                </div>
              </div>
            </button>
            {isOpen && (
              <div className="pl-8 pb-2" data-testid={`module-content-${mod.id}`}>
                {mod.lessons.map((lesson) => (
                  <LessonItem key={lesson.id} {...lesson} />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

interface ProgressRingProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export function ProgressRing({ percentage, size = 80, strokeWidth = 6, className }: ProgressRingProps) {
  const clamped = Math.min(100, Math.max(0, percentage));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - clamped / 100);

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)} data-testid="progress-ring">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <span className="absolute text-sm font-semibold" data-testid="text-progress-ring-value">{clamped}%</span>
    </div>
  );
}

export interface QuizOption {
  id: string;
  label: string;
}

interface QuizBlockProps {
  question: string;
  options: QuizOption[];
  multiSelect?: boolean;
  onSubmit?: (selectedIds: string[]) => void;
  className?: string;
}

export function QuizBlock({ question, options, multiSelect = false, onSubmit, className }: QuizBlockProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggleOption = (id: string) => {
    setSelected((prev) => {
      if (multiSelect) {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      }
      return new Set([id]);
    });
  };

  return (
    <Card className={cn("", className)} data-testid="quiz-block">
      <CardContent className="p-5">
        <p className="text-sm font-medium mb-4" data-testid="text-quiz-question">{question}</p>
        <div className="space-y-2">
          {options.map((opt) => {
            const isSelected = selected.has(opt.id);
            return (
              <button
                key={opt.id}
                onClick={() => toggleOption(opt.id)}
                className={cn(
                  "flex items-center gap-3 w-full rounded-md border px-4 py-3 text-sm text-left transition-colors",
                  isSelected ? "border-primary bg-primary/5" : "border-border hover-elevate"
                )}
                data-testid={`quiz-option-${opt.id}`}
              >
                <div
                  className={cn(
                    "flex h-4 w-4 shrink-0 items-center justify-center border transition-colors",
                    multiSelect ? "rounded-sm" : "rounded-full",
                    isSelected ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground"
                  )}
                >
                  {isSelected && <Check className="h-3 w-3" />}
                </div>
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>
      </CardContent>
      {onSubmit && (
        <CardFooter className="justify-end gap-2 p-5 pt-0">
          <Button
            onClick={() => onSubmit(Array.from(selected))}
            disabled={selected.size === 0}
            data-testid="button-quiz-submit"
          >
            Submit Answer
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}

export interface CertificateCardItem {
  id: string;
  courseName: string;
  dateEarned: string;
  credentialId?: string;
  onDownload?: () => void;
}

interface CertificateCardProps extends CertificateCardItem {
  className?: string;
}

export function CertificateCard({ id, courseName, dateEarned, credentialId, onDownload, className }: CertificateCardProps) {
  return (
    <Card className={cn("", className)} data-testid={`card-certificate-${id}`}>
      <CardContent className="p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Award className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-semibold truncate" data-testid={`text-cert-course-${id}`}>{courseName}</h4>
            <p className="text-xs text-muted-foreground mt-0.5" data-testid={`text-cert-date-${id}`}>
              Earned on {dateEarned}
            </p>
            {credentialId && (
              <p className="text-xs text-muted-foreground mt-0.5" data-testid={`text-cert-credential-${id}`}>
                ID: {credentialId}
              </p>
            )}
          </div>
        </div>
      </CardContent>
      {onDownload && (
        <CardFooter className="p-5 pt-0">
          <Button variant="outline" size="sm" onClick={onDownload} data-testid={`button-download-cert-${id}`}>
            <Download className="h-3.5 w-3.5 mr-1.5" />
            Download
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}

interface CourseDetailHeaderProps {
  title: string;
  subtitle?: string;
  thumbnail?: string;
  rating?: number;
  enrollmentCount?: number;
  instructor: string;
  instructorAvatar?: string;
  ctaLabel?: string;
  onCtaClick?: () => void;
  className?: string;
}

export function CourseDetailHeader({
  title,
  subtitle,
  thumbnail,
  rating,
  enrollmentCount,
  instructor,
  instructorAvatar,
  ctaLabel = "Enroll Now",
  onCtaClick,
  className,
}: CourseDetailHeaderProps) {
  return (
    <Card className={cn("overflow-visible", className)} data-testid="course-detail-header">
      <div className="flex flex-col md:flex-row gap-5 p-5">
        {thumbnail && (
          <div className="w-full md:w-64 shrink-0 aspect-video overflow-hidden rounded-md">
            <img src={thumbnail} alt={title} className="h-full w-full object-cover" data-testid="img-course-detail-thumbnail" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bold" data-testid="text-course-detail-title">{title}</h2>
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-1" data-testid="text-course-detail-subtitle">{subtitle}</p>
          )}
          <div className="mt-3 flex items-center gap-4 flex-wrap">
            {rating !== undefined && (
              <div className="flex items-center gap-1" data-testid="rating-stars">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "h-4 w-4",
                      i < Math.round(rating) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                    )}
                  />
                ))}
                <span className="text-sm font-medium ml-1">{rating.toFixed(1)}</span>
              </div>
            )}
            {enrollmentCount !== undefined && (
              <span className="flex items-center gap-1 text-sm text-muted-foreground" data-testid="text-enrollment-count">
                <Users className="h-4 w-4" />
                {enrollmentCount.toLocaleString()} enrolled
              </span>
            )}
          </div>
          <div className="mt-3 flex items-center gap-2">
            <Avatar className="h-6 w-6">
              {instructorAvatar && <AvatarImage src={instructorAvatar} alt={instructor} />}
              <AvatarFallback className="text-[10px]">{instructor.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <span className="text-sm text-muted-foreground" data-testid="text-course-detail-instructor">{instructor}</span>
          </div>
          {onCtaClick && (
            <div className="mt-4">
              <Button onClick={onCtaClick} data-testid="button-course-cta">
                {ctaLabel}
              </Button>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
