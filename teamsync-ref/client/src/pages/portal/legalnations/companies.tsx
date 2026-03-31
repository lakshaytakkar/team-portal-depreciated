import { useState } from "react";
import { CheckCircle2, Clock, Building2, MapPin, Package, Calendar, Hash, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ds/status-badge";
import { cn } from "@/lib/utils";
import { PageTransition } from "@/components/ui/animated";
import { portalCompanies, type PortalCompany } from "@/lib/mock-data-portal-legalnations";

const statusVariant: Record<string, "success" | "info" | "neutral"> = {
  completed: "success",
  "in-progress": "info",
  pending: "neutral",
};

function CompanyCard({ company }: { company: PortalCompany }) {
  const [expanded, setExpanded] = useState(company.status === "in-progress");
  const completedStages = company.stages.filter(s => s.status === "completed").length;
  const progress = Math.round((completedStages / company.stages.length) * 100);

  return (
    <Card className="overflow-hidden" data-testid={`company-${company.id}`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              "size-12 rounded-xl flex items-center justify-center",
              company.status === "completed" ? "bg-emerald-100 dark:bg-emerald-900/30" : "bg-blue-100 dark:bg-blue-900/30"
            )}>
              <Building2 className={cn("size-6", company.status === "completed" ? "text-emerald-600" : "text-blue-600")} />
            </div>
            <div>
              <h3 className="text-lg font-bold">{company.name}</h3>
              <p className="text-sm text-muted-foreground">{company.entityType}</p>
            </div>
          </div>
          <StatusBadge
            status={company.status === "completed" ? "Completed" : company.status === "in-progress" ? "In Progress" : "Pending"}
            variant={statusVariant[company.status]}
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="size-3.5 text-muted-foreground" />
            <span>{company.state}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Package className="size-3.5 text-muted-foreground" />
            <span>{company.package}</span>
          </div>
          {company.einNumber && (
            <div className="flex items-center gap-2 text-sm">
              <Hash className="size-3.5 text-muted-foreground" />
              <span>EIN: {company.einNumber}</span>
            </div>
          )}
          {company.filedAt && (
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="size-3.5 text-muted-foreground" />
              <span>Filed {new Date(company.filedAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 mb-2">
          <Progress value={progress} className="flex-1 h-2" />
          <span className="text-sm font-semibold">{progress}%</span>
        </div>
        <p className="text-xs text-muted-foreground">{completedStages} of {company.stages.length} stages completed</p>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setExpanded(!expanded)}
          className="mt-3 text-xs gap-1"
          data-testid={`toggle-stages-${company.id}`}
        >
          {expanded ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
          {expanded ? "Hide Stages" : "View All Stages"}
        </Button>
      </CardContent>

      {expanded && (
        <div className="border-t p-6 space-y-3 bg-muted/30">
          {company.stages.map((stage, i) => {
            const isDone = stage.status === "completed";
            const isCurrent = stage.status === "in-progress";
            return (
              <div key={stage.id} className="flex items-start gap-3" data-testid={`stage-${company.id}-${stage.id}`}>
                <div className="flex flex-col items-center gap-0">
                  <div className={cn(
                    "size-7 rounded-full flex items-center justify-center shrink-0 text-xs font-medium",
                    isDone && "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
                    isCurrent && "bg-blue-100 text-blue-700 ring-2 ring-blue-400/40 dark:bg-blue-950 dark:text-blue-300",
                    !isDone && !isCurrent && "bg-muted text-muted-foreground"
                  )}>
                    {isDone ? <CheckCircle2 className="size-3.5" /> : isCurrent ? <Clock className="size-3.5 animate-pulse" /> : i + 1}
                  </div>
                  {i < company.stages.length - 1 && (
                    <div className={cn("w-0.5 h-6 mt-1", isDone ? "bg-emerald-300" : "bg-muted")} />
                  )}
                </div>
                <div className="flex-1 pb-2">
                  <p className={cn(
                    "text-sm font-medium",
                    isDone && "text-emerald-700 dark:text-emerald-300",
                    isCurrent && "text-blue-700 dark:text-blue-300 font-semibold",
                    !isDone && !isCurrent && "text-muted-foreground"
                  )}>
                    {stage.name}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">{stage.description}</p>
                  {stage.completedAt && (
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      Completed {new Date(stage.completedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}

export default function PortalCompanies() {
  return (
    <PageTransition className="px-4 sm:px-8 py-6 lg:px-24 space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading">My Companies</h1>
        <p className="text-sm text-muted-foreground mt-1">Track the formation and compliance status of your businesses</p>
      </div>

      <div className="space-y-6">
        {portalCompanies.map(company => (
          <CompanyCard key={company.id} company={company} />
        ))}
      </div>
    </PageTransition>
  );
}
