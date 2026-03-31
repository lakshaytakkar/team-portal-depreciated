import { useState } from "react";
import { CheckCircle2, Circle, Clock } from "lucide-react";
import { PageTransition, Fade } from "@/components/ui/animated";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { PersonCell } from "@/components/ui/avatar-cells";
import { employees } from "@/lib/mock-data-hrms";
import { PageShell, PageHeader } from "@/components/layout";
import { SopModal, TutorialModal, SopTutorialButtons } from "@/components/sop/sop-modal";
import { SOP_REGISTRY } from "@/lib/sop-data";
import { HRMS_COLOR } from "@/lib/hrms-config";

const checklistItems = ["IT Equipment Setup", "Company Email", "Slack / Tools Access", "HR Documents Submitted", "Orientation Session", "Manager 1:1 Done"];

const onboardingData = employees
  .filter((e) => e.joiningDate >= "2024-01-01")
  .map((emp) => {
    const seed = emp.id.charCodeAt(emp.id.length - 1);
    const progress = Math.min(6, Math.round((seed % 7)));
    return {
      ...emp,
      progress,
      status: progress === 0 ? "not-started" : progress === 6 ? "complete" : "in-progress",
    };
  });

const statusBadge = (s: string) => {
  if (s === "complete") return "bg-emerald-100 text-emerald-700";
  if (s === "in-progress") return "bg-sky-100 text-sky-700";
  return "bg-muted text-muted-foreground";
};

export default function HrmsOnboarding() {
  const isLoading = useSimulatedLoading(700);
  const [sopOpen, setSopOpen] = useState(false);
  const [tutorialOpen, setTutorialOpen] = useState(false);

  if (isLoading) {
    return (
      <PageShell>
        <div className="h-10 bg-muted rounded w-48" />
        {[...Array(5)].map((_, i) => <div key={i} className="h-24 bg-muted rounded-xl" />)}
      </PageShell>
    );
  }

  return (
    <PageTransition className="px-16 py-6 lg:px-24 space-y-5">
      <Fade>
        <PageHeader
          title="Onboarding Tracker"
          subtitle={`${onboardingData.length} employees in onboarding pipeline`}
          actions={
            <SopTutorialButtons onSopClick={() => setSopOpen(true)} onTutorialClick={() => setTutorialOpen(true)} />
          }
        />
      </Fade>

      <Fade>
        <Card className="border-0 shadow-sm overflow-hidden">
          <CardContent className="p-0">
            <table className="w-full">
              <thead className="border-b bg-muted/30">
                <tr>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Employee</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Department</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Joining Date</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3 w-48">Onboarding Progress</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Checklist</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {onboardingData.map((emp) => (
                  <tr key={emp.id} className="hover:bg-muted/20" data-testid={`onboarding-row-${emp.id}`}>
                    <td className="px-4 py-3">
                      <PersonCell name={emp.name} subtitle={emp.designation} size="sm" />
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{emp.department}</td>
                    <td className="px-4 py-3 text-sm">{new Date(emp.joiningDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</td>
                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>{emp.progress}/{checklistItems.length} tasks</span>
                          <span className="text-muted-foreground">{Math.round((emp.progress / checklistItems.length) * 100)}%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-sky-500 rounded-full transition-all"
                            style={{ width: `${(emp.progress / checklistItems.length) * 100}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5">
                        {checklistItems.map((item, idx) => (
                          <div
                            key={idx}
                            title={item}
                            className="cursor-default"
                          >
                            {idx < emp.progress
                              ? <CheckCircle2 className="size-4 text-emerald-500" />
                              : <Circle className="size-4 text-muted-foreground/40" />
                            }
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusBadge(emp.status)}`}>
                        {emp.status === "not-started" ? "Not Started" : emp.status === "in-progress" ? "In Progress" : "Complete"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </Fade>

      <SopModal open={sopOpen} onOpenChange={setSopOpen} config={SOP_REGISTRY["hrms-onboarding"].sop} color={HRMS_COLOR} />
      <TutorialModal open={tutorialOpen} onOpenChange={setTutorialOpen} config={SOP_REGISTRY["hrms-onboarding"].tutorial} color={HRMS_COLOR} />
    </PageTransition>
  );
}
