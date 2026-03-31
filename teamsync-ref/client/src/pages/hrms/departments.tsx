import { useState } from "react";
import { Users, ChevronDown, ChevronUp } from "lucide-react";
import { PageTransition, Stagger, StaggerItem, Fade } from "@/components/ui/animated";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { PersonCell } from "@/components/ui/avatar-cells";
import { hrmsDepartments, employees } from "@/lib/mock-data-hrms";
import { PageShell } from "@/components/layout";

export default function HrmsDepartments() {
  const isLoading = useSimulatedLoading(600);
  const [expandedDept, setExpandedDept] = useState<string | null>(null);

  if (isLoading) {
    return (
      <PageShell>
        <div className="h-10 bg-muted rounded w-48" />
        <div className="grid grid-cols-3 gap-4">
          {[...Array(5)].map((_, i) => <div key={i} className="h-48 bg-muted rounded-xl" />)}
        </div>
      </PageShell>
    );
  }

  return (
    <PageTransition className="px-16 py-6 lg:px-24 space-y-5">
      <Fade>
        <div>
          <h1 className="text-2xl font-bold">Departments</h1>
          <p className="text-sm text-muted-foreground">{hrmsDepartments.length} departments · {employees.length} total employees</p>
        </div>
      </Fade>

      <Stagger className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {hrmsDepartments.map((dept) => {
          const deptEmployees = employees.filter((e) => e.department === dept.name);
          const isExpanded = expandedDept === dept.id;

          return (
            <StaggerItem key={dept.id}>
              <Card className="border-0 shadow-sm overflow-hidden" data-testid={`dept-card-${dept.id}`}>
                <div className="h-1.5" style={{ background: dept.color }} />
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-lg">{dept.name}</h3>
                      <p className="text-xs text-muted-foreground">{dept.headCount} employees</p>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs px-2 py-1 rounded-full" style={{ background: `${dept.color}20`, color: dept.color }}>
                      <Users className="size-3" />{dept.headCount}
                    </div>
                  </div>

                  <PersonCell name={dept.head} subtitle="Department Head" size="sm" />

                  <div className="flex flex-wrap gap-1.5">
                    {dept.designations.slice(0, 3).map((d) => (
                      <Badge key={d} variant="secondary" className="text-[10px]">{d}</Badge>
                    ))}
                  </div>

                  <button
                    className="w-full text-xs flex items-center justify-center gap-1 text-muted-foreground hover:text-foreground transition-colors py-1 border-t"
                    onClick={() => setExpandedDept(isExpanded ? null : dept.id)}
                    data-testid={`expand-dept-${dept.id}`}
                  >
                    {isExpanded ? <><ChevronUp className="size-3" /> Hide members</> : <><ChevronDown className="size-3" /> View {deptEmployees.length} members</>}
                  </button>

                  {isExpanded && (
                    <div className="space-y-2 pt-1 border-t">
                      {deptEmployees.map((emp) => (
                        <div key={emp.id} className="flex items-center gap-2">
                          <PersonCell name={emp.name} subtitle={emp.designation} size="xs" className="flex-1 min-w-0" />
                          <div className={`size-1.5 rounded-full ${emp.status === "active" ? "bg-emerald-500" : emp.status === "on-leave" ? "bg-amber-500" : "bg-red-500"}`} />
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </StaggerItem>
          );
        })}
      </Stagger>
    </PageTransition>
  );
}
