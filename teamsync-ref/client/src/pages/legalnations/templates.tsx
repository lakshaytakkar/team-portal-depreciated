import { FileText, Download, FolderOpen, Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatsCardSkeleton } from "@/components/ui/card-skeleton";
import { StatsCard } from "@/components/ds/stats-card";
import { Skeleton } from "@/components/ui/skeleton";
import { documentTemplates } from "@/lib/mock-data";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { Fade, Stagger, StaggerItem, PageTransition } from "@/components/ui/animated";
import { PageShell } from "@/components/layout";

const categoryColors: Record<string, string> = {
  Formation: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  Agreement: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  IRS: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  Compliance: "bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300",
  Intake: "bg-cyan-50 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300",
  Completion: "bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300",
};

export default function TemplatesPage() {
  const loading = useSimulatedLoading();

  const totalTemplates = documentTemplates.length;
  const categories = Array.from(new Set(documentTemplates.map((t) => t.category)));
  const latestUpdate = documentTemplates.reduce((latest, t) =>
    t.lastUpdated > latest ? t.lastUpdated : latest, ""
  );

  return (
    <PageShell>
      <PageTransition>
{loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
          </div>
        ) : (
          <Stagger staggerInterval={0.05} className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StaggerItem>
              <StatsCard
                title="Total Templates"
                value={totalTemplates}
                change={`${categories.length} categories`}
                changeType="neutral"
                icon={<FileText className="size-5" />}
              />
            </StaggerItem>
            <StaggerItem>
              <StatsCard
                title="Categories"
                value={categories.length}
                change={categories.join(", ")}
                changeType="neutral"
                icon={<FolderOpen className="size-5" />}
              />
            </StaggerItem>
            <StaggerItem>
              <StatsCard
                title="Last Updated"
                value={latestUpdate}
                change="Most recent template update"
                changeType="neutral"
                icon={<Calendar className="size-5" />}
              />
            </StaggerItem>
          </Stagger>
        )}

        <div className="mt-6">
          {loading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-lg border bg-background p-5">
                  <Skeleton className="h-4 w-2/3 mb-3" />
                  <Skeleton className="h-3 w-full mb-2" />
                  <Skeleton className="h-3 w-1/2 mb-4" />
                  <Skeleton className="h-8 w-24" />
                </div>
              ))}
            </div>
          ) : (
            <Fade direction="up" delay={0.1}>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {documentTemplates.map((template) => (
                  <Card
                    key={template.id}
                    className="p-5 flex flex-col gap-3"
                    data-testid={`card-template-${template.id}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <FileText className="size-4" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-sm font-semibold truncate" data-testid={`text-template-name-${template.id}`}>
                            {template.name}
                          </h3>
                          <Badge
                            variant="secondary"
                            className={`border-0 text-[10px] font-medium px-1.5 py-0 mt-0.5 ${categoryColors[template.category] || "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"}`}
                            data-testid={`badge-template-category-${template.id}`}
                          >
                            {template.category}
                          </Badge>
                        </div>
                      </div>
                      <span className="text-[10px] text-muted-foreground shrink-0">v{template.version}</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed" data-testid={`text-template-desc-${template.id}`}>
                      {template.description}
                    </p>
                    <div className="flex items-center justify-between gap-2 mt-auto pt-1">
                      <span className="text-[11px] text-muted-foreground">Updated {template.lastUpdated}</span>
                      <Button size="sm" variant="outline" data-testid={`button-download-${template.id}`}>
                        <Download className="size-3.5 mr-1.5" />
                        Download
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </Fade>
          )}
        </div>
      </PageTransition>
    </PageShell>
  );
}
