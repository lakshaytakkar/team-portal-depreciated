import { useState } from "react";
import { Target, Plus } from "lucide-react";
import { PageTransition, Stagger, StaggerItem, Fade } from "@/components/ui/animated";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { PersonCell } from "@/components/ui/avatar-cells";
import { FormDialog } from "@/components/ds/form-dialog";
import { goals, employees } from "@/lib/mock-data-hrms";
import { HRMS_GOAL_CONFIG } from "@/lib/hrms-config";
import { StatusBadge } from "@/components/ds/status-badge";
import { PageShell } from "@/components/layout";

export default function HrmsGoals() {
  const isLoading = useSimulatedLoading(700);
  const [empFilter, setEmpFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [addOpen, setAddOpen] = useState(false);

  const uniqueEmps = Array.from(new Set(goals.map(g => g.employeeName)));

  const filtered = goals.filter(g => {
    const matchEmp = empFilter === "all" || g.employeeName === empFilter;
    const matchStatus = statusFilter === "all" || g.status === statusFilter;
    return matchEmp && matchStatus;
  });

  if (isLoading) {
    return (
      <PageShell>
        <div className="h-10 bg-muted rounded w-48" />
        <div className="grid grid-cols-2 gap-4">{[...Array(6)].map((_, i) => <div key={i} className="h-32 bg-muted rounded-xl" />)}</div>
      </PageShell>
    );
  }

  return (
    <PageTransition className="px-16 py-6 lg:px-24 space-y-5">
      <Fade>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Goals & OKRs</h1>
            <p className="text-sm text-muted-foreground">{goals.length} active goals across the team</p>
          </div>
          <Button onClick={() => setAddOpen(true)} className="bg-sky-600 hover:bg-sky-700" data-testid="add-goal-btn">
            <Plus className="size-4 mr-2" /> Add Goal
          </Button>
        </div>
      </Fade>

      <Fade>
        <div className="flex gap-3">
          <Select value={empFilter} onValueChange={setEmpFilter}>
            <SelectTrigger className="w-48" data-testid="emp-filter"><SelectValue placeholder="All Employees" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Employees</SelectItem>
              {uniqueEmps.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36" data-testid="status-filter"><SelectValue placeholder="All Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="on-track">On Track</SelectItem>
              <SelectItem value="at-risk">At Risk</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Fade>

      <Stagger className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((goal) => (
          <StaggerItem key={goal.id}>
            <Card className="border-0 shadow-sm" data-testid={`goal-card-${goal.id}`}>
              <CardContent className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="font-semibold">{goal.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{goal.description}</p>
                  </div>
                  <StatusBadge status={goal.status} />
                </div>
                <div className="flex items-center gap-2">
                  <PersonCell name={goal.employeeName} size="xs" />
                  <span className="text-xs text-muted-foreground ml-auto">Due {new Date(goal.targetDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{goal.progress}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-700 ${HRMS_GOAL_CONFIG[goal.status as keyof typeof HRMS_GOAL_CONFIG]?.bar ?? "bg-slate-400"}`} style={{ width: `${goal.progress}%` }} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </StaggerItem>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-2 text-center py-12 text-muted-foreground text-sm">No goals found</div>
        )}
      </Stagger>

      <FormDialog title="Add Goal" open={addOpen} onOpenChange={setAddOpen} onSubmit={() => setAddOpen(false)}>
        <div className="space-y-4">
          <div className="space-y-1.5"><label className="text-sm font-medium">Goal Title</label><Input placeholder="e.g. Achieve 90% test coverage" /></div>
          <div className="space-y-1.5"><label className="text-sm font-medium">Employee</label>
            <Select><SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger>
              <SelectContent>{employees.map(e => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5"><label className="text-sm font-medium">Description</label><Input placeholder="Brief description of the goal" /></div>
          <div className="space-y-1.5"><label className="text-sm font-medium">Target Date</label><Input type="date" /></div>
        </div>
        <Button className="w-full mt-4 bg-sky-600 hover:bg-sky-700" data-testid="submit-goal">Add Goal</Button>
      </FormDialog>
    </PageTransition>
  );
}
