import { Link } from "wouter";
import {
  Building2, MapPin, Hash, Calendar, Package, Plus,
  CheckCircle2, Clock, ArrowRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  CLIENT_PROFILE,
  FORMATION_STAGES,
  type LnCompany,
} from "@/lib/mock-data-dashboard-ln";

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  forming: { label: "In Progress", color: "text-blue-700", bg: "bg-blue-50 border-blue-200" },
  completed: { label: "Completed", color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" },
  active: { label: "Active", color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" },
  dissolved: { label: "Dissolved", color: "text-gray-500", bg: "bg-gray-50 border-gray-200" },
};

const entityBadge: Record<string, string> = {
  LLC: "bg-blue-100 text-blue-700",
  "C-Corp": "bg-violet-100 text-violet-700",
  "S-Corp": "bg-amber-100 text-amber-700",
};

function CompanyCard({ company }: { company: LnCompany }) {
  const completedStages = Math.min(company.currentStage, FORMATION_STAGES.length);
  const progress = Math.round((completedStages / FORMATION_STAGES.length) * 100);
  const st = statusConfig[company.status] || statusConfig.forming;
  const filedDate = new Date(company.startedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <Card className="hover:shadow-md transition-shadow" data-testid={`company-card-${company.id}`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              "size-12 rounded-xl flex items-center justify-center",
              company.status === "completed" || company.status === "active"
                ? "bg-emerald-100" : "bg-blue-100"
            )}>
              <Building2 className={cn(
                "size-6",
                company.status === "completed" || company.status === "active"
                  ? "text-emerald-600" : "text-blue-600"
              )} />
            </div>
            <div>
              <h3 className="text-lg font-bold" data-testid={`text-company-name-${company.id}`}>{company.name}</h3>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge className={cn("text-[10px] border-0 px-1.5 py-0", entityBadge[company.entityType] || "bg-gray-100 text-gray-700")}>
                  {company.entityType}
                </Badge>
              </div>
            </div>
          </div>
          <Badge variant="outline" className={cn("text-xs", st.bg, st.color)} data-testid={`badge-status-${company.id}`}>
            {st.label}
          </Badge>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="size-3.5 shrink-0" />
            <span>{company.state}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Package className="size-3.5 shrink-0" />
            <span>{company.packageTier}</span>
          </div>
          {company.ein && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Hash className="size-3.5 shrink-0" />
              <span>EIN: {company.ein}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="size-3.5 shrink-0" />
            <span>Filed {filedDate}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 mb-3">
          <Progress value={progress} className="flex-1 h-2" />
          <span className="text-sm font-semibold text-muted-foreground">{progress}%</span>
        </div>
        <div className="flex items-center gap-1.5 mb-2" data-testid={`stepper-${company.id}`}>
          {FORMATION_STAGES.map((stage, idx) => (
            <div key={stage.id} className="flex items-center gap-1 flex-1">
              <div className={cn(
                "size-5 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0",
                idx < completedStages ? "bg-emerald-500 text-white" :
                idx === completedStages && company.status === "forming" ? "bg-blue-500 text-white ring-2 ring-blue-200" :
                "bg-gray-200 text-gray-400"
              )}>
                {idx < completedStages ? <CheckCircle2 className="size-3" /> : idx + 1}
              </div>
              {idx < FORMATION_STAGES.length - 1 && (
                <div className={cn("h-0.5 flex-1 rounded-full", idx < completedStages ? "bg-emerald-400" : "bg-gray-200")} />
              )}
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {completedStages} of {FORMATION_STAGES.length} stages completed
          </p>
          <Link href={`/portal-ln/companies/${company.id}`}>
            <Button variant="ghost" size="sm" className="text-xs gap-1 text-blue-600 hover:text-blue-700" data-testid={`button-view-details-${company.id}`}>
              View Details <ArrowRight className="size-3" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export default function LnCompanies() {
  const companies = CLIENT_PROFILE.companies;

  return (
    <div className="p-6 space-y-6" data-testid="ln-companies-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading" data-testid="text-page-title">My Companies</h1>
          <p className="text-sm text-muted-foreground mt-1">Track the formation and compliance status of your businesses</p>
        </div>
        <Link href="/portal-ln/onboarding">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2" data-testid="button-new-formation">
            <Plus className="size-4" /> Form New Company
          </Button>
        </Link>
      </div>

      <div className="space-y-4">
        {companies.map(company => (
          <CompanyCard key={company.id} company={company} />
        ))}
      </div>
    </div>
  );
}
