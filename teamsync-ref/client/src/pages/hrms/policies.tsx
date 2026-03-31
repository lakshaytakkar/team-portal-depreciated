import { useState } from "react";
import { FileText, Download } from "lucide-react";
import { PageTransition, Stagger, StaggerItem, Fade } from "@/components/ui/animated";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SmallDetailModal } from "@/components/blocks/detail-view-blocks";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { hrPolicies, type HrPolicy } from "@/lib/mock-data-hrms";
import { PageShell } from "@/components/layout";

const categoryColors: Record<string, string> = {
  leave: "bg-sky-100 text-sky-700",
  "code-of-conduct": "bg-violet-100 text-violet-700",
  payroll: "bg-emerald-100 text-emerald-700",
  benefits: "bg-amber-100 text-amber-700",
  "remote-work": "bg-orange-100 text-orange-700",
};

const categoryLabels: Record<string, string> = {
  leave: "Leave",
  "code-of-conduct": "Code of Conduct",
  payroll: "Payroll",
  benefits: "Benefits",
  "remote-work": "Remote Work",
};

const allCategories = ["all", "leave", "code-of-conduct", "payroll", "benefits", "remote-work"];

export default function HrmsPolicies() {
  const isLoading = useSimulatedLoading(600);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedPolicy, setSelectedPolicy] = useState<HrPolicy | null>(null);

  const filtered = hrPolicies.filter(p => categoryFilter === "all" || p.category === categoryFilter);

  if (isLoading) {
    return (
      <PageShell>
        <div className="h-10 bg-muted rounded w-48" />
        <div className="grid grid-cols-2 gap-4">{[...Array(4)].map((_, i) => <div key={i} className="h-40 bg-muted rounded-xl" />)}</div>
      </PageShell>
    );
  }

  return (
    <PageTransition className="px-16 py-6 lg:px-24 space-y-5">
      <Fade>
        <div>
          <h1 className="text-2xl font-bold">HR Policies</h1>
          <p className="text-sm text-muted-foreground">{hrPolicies.length} policies · Last updated Jan 2026</p>
        </div>
      </Fade>

      <Fade>
        <div className="flex flex-wrap gap-2">
          {allCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors border ${categoryFilter === cat ? "bg-sky-600 text-white border-sky-600" : "border-border text-muted-foreground hover:border-sky-300"}`}
              data-testid={`category-filter-${cat}`}
            >
              {cat === "all" ? "All Policies" : categoryLabels[cat]}
            </button>
          ))}
        </div>
      </Fade>

      <Stagger className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((policy) => (
          <StaggerItem key={policy.id}>
            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow" data-testid={`policy-card-${policy.id}`}>
              <CardContent className="p-5 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-muted rounded-lg">
                    <FileText className="size-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">{policy.title}</p>
                    <p className="text-xs text-muted-foreground">Updated {new Date(policy.updatedDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${categoryColors[policy.category]}`}>{categoryLabels[policy.category]}</span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">{policy.description}</p>
                <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => setSelectedPolicy(policy)} data-testid={`view-policy-${policy.id}`}>
                  View Policy
                </Button>
              </CardContent>
            </Card>
          </StaggerItem>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-2 text-center py-12 text-muted-foreground text-sm">No policies found</div>
        )}
      </Stagger>

      {selectedPolicy && (
        <SmallDetailModal
          open={!!selectedPolicy}
          onClose={() => setSelectedPolicy(null)}
          title={selectedPolicy.title}
          footer={
            <Button className="w-full bg-sky-600 hover:bg-sky-700" data-testid="download-policy">
              <Download className="size-4 mr-2" /> Download PDF
            </Button>
          }
        >
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${categoryColors[selectedPolicy.category]}`}>{categoryLabels[selectedPolicy.category]}</span>
              <span className="text-xs text-muted-foreground">Last updated {selectedPolicy.updatedDate}</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{selectedPolicy.description}</p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              This policy applies to all employees and contractors of TeamSync. Any violations will be addressed per the escalation procedures outlined in the Code of Conduct. The policy is reviewed annually and updated to reflect changes in regulatory requirements or organizational needs.
            </p>
          </div>
        </SmallDetailModal>
      )}
    </PageTransition>
  );
}
