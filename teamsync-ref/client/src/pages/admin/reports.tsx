import { useState } from "react";
import { Download, RefreshCw } from "lucide-react";

import { StatusBadge } from "@/components/ds/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { reports } from "@/lib/mock-data-admin";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { Fade, Stagger, StaggerItem, PageTransition } from "@/components/ui/animated";
import { Filter } from "lucide-react";
import { PageShell } from "@/components/layout";

const categories = Array.from(new Set(reports.map((r) => r.category)));
const frequencies = Array.from(new Set(reports.map((r) => r.frequency)));

const statusIndicator: Record<string, { dot: string; label: string }> = {
  ready: { dot: "bg-emerald-500", label: "Ready" },
  generating: { dot: "bg-amber-500 animate-pulse", label: "Generating" },
  scheduled: { dot: "bg-blue-500", label: "Scheduled" },
};

export default function AdminReports() {
  const loading = useSimulatedLoading();
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [frequencyFilter, setFrequencyFilter] = useState("all");

  const filtered = reports.filter((r) => {
    if (categoryFilter !== "all" && r.category !== categoryFilter) return false;
    if (frequencyFilter !== "all" && r.frequency !== frequencyFilter) return false;
    return true;
  });

  return (
    <PageShell>
      <PageTransition>
        {loading ? (
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <Skeleton className="h-9 w-[150px]" />
              <Skeleton className="h-9 w-[150px]" />
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="rounded-lg border bg-background p-5">
                  <div className="flex flex-col gap-3">
                    <Skeleton className="h-5 w-2/3" />
                    <Skeleton className="h-3 w-full" />
                    <div className="flex gap-2">
                      <Skeleton className="h-5 w-16 rounded-full" />
                      <Skeleton className="h-5 w-16 rounded-full" />
                    </div>
                    <Skeleton className="h-8 w-24 mt-2" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <Fade direction="up" delay={0.1}>
            <div className="flex flex-wrap items-center gap-3 mb-6" data-testid="section-filters">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="h-9 w-auto min-w-[150px] text-sm" data-testid="filter-category">
                  <Filter className="mr-1.5 size-3 text-muted-foreground" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={frequencyFilter} onValueChange={setFrequencyFilter}>
                <SelectTrigger className="h-9 w-auto min-w-[150px] text-sm" data-testid="filter-frequency">
                  <Filter className="mr-1.5 size-3 text-muted-foreground" />
                  <SelectValue placeholder="Frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Frequencies</SelectItem>
                  {frequencies.map((freq) => (
                    <SelectItem key={freq} value={freq}>{freq}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Stagger staggerInterval={0.05} className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {filtered.map((report) => {
                const statusConfig = statusIndicator[report.status];
                return (
                  <StaggerItem key={report.id}>
                    <div
                      className="rounded-lg border bg-background p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                      data-testid={`card-report-${report.id}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-semibold" data-testid={`text-report-name-${report.id}`}>
                              {report.name}
                            </h4>
                            <div className="flex items-center gap-1.5">
                              <span className={`size-2 rounded-full ${statusConfig.dot}`} />
                              <span className="text-xs text-muted-foreground">{statusConfig.label}</span>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1" data-testid={`text-report-desc-${report.id}`}>
                            {report.description}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <StatusBadge status={report.category} variant="info" />
                        <StatusBadge status={report.frequency} variant="neutral" />
                      </div>
                      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                        <span className="text-xs text-muted-foreground" data-testid={`text-last-generated-${report.id}`}>
                          Last generated: {new Date(report.lastGenerated).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                        {report.status === "ready" ? (
                          <Button size="sm" variant="outline" data-testid={`button-download-${report.id}`}>
                            <Download className="mr-1.5 size-3.5" />
                            Download
                          </Button>
                        ) : (
                          <Button size="sm" variant="outline" data-testid={`button-generate-${report.id}`}>
                            <RefreshCw className="mr-1.5 size-3.5" />
                            Generate
                          </Button>
                        )}
                      </div>
                    </div>
                  </StaggerItem>
                );
              })}
            </Stagger>
          </Fade>
        )}
      </PageTransition>
    </PageShell>
  );
}
