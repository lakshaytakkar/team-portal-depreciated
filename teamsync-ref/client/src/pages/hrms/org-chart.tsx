import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { PageTransition, Fade } from "@/components/ui/animated";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { PersonCell } from "@/components/ui/avatar-cells";
import { orgChart, hrmsDepartments, type OrgNode } from "@/lib/mock-data-hrms";
import { PageShell } from "@/components/layout";

const deptColors: Record<string, string> = {
  Leadership: "#0EA5E9",
  Engineering: "#0EA5E9",
  Operations: "#10B981",
  Sales: "#F97316",
  Finance: "#8B5CF6",
  HR: "#E91E63",
};

function OrgChartNode({ node, deptFilter, level = 0 }: { node: OrgNode; deptFilter: string; level?: number }) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = node.children && node.children.length > 0;
  const dimmed = deptFilter !== "all" && node.department !== deptFilter && node.department !== "Leadership";

  return (
    <div className="flex flex-col items-center">
      <div
        className={`relative flex flex-col items-center transition-opacity duration-300 ${dimmed ? "opacity-30" : "opacity-100"}`}
        data-testid={`org-node-${node.id}`}
      >
        <div
          className="bg-white dark:bg-card border rounded-xl px-3 py-2.5 shadow-sm flex flex-col items-center gap-1 cursor-pointer hover:shadow-md transition-shadow w-28"
          onClick={() => hasChildren && setExpanded(!expanded)}
        >
          <div
            className="w-full h-1 rounded-full mb-1"
            style={{ background: deptColors[node.department] || "#6b7280" }}
          />
          <PersonCell name={node.name} subtitle={node.role} size="sm" />
          {hasChildren && (
            <div className="text-muted-foreground">
              {expanded ? <ChevronDown className="size-3" /> : <ChevronRight className="size-3" />}
            </div>
          )}
        </div>
      </div>

      {hasChildren && expanded && (
        <div className="flex flex-col items-center">
          <div className="w-px h-5 bg-border" />
          <div className="flex gap-6 relative">
            <div className="absolute top-0 left-[calc(50%-0.5px)] w-full border-t border-border" style={{ left: 0, right: 0, top: 0 }} />
            {node.children!.map((child, idx) => (
              <div key={child.id} className="flex flex-col items-center">
                <div className="w-px h-5 bg-border" />
                <OrgChartNode node={child} deptFilter={deptFilter} level={level + 1} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function HrmsOrgChart() {
  const isLoading = useSimulatedLoading(700);
  const [deptFilter, setDeptFilter] = useState("all");

  if (isLoading) {
    return (
      <PageShell>
        <div className="h-10 bg-muted rounded w-48" />
        <div className="h-[500px] bg-muted rounded-xl" />
      </PageShell>
    );
  }

  return (
    <PageTransition className="px-16 py-6 lg:px-24 space-y-5">
      <Fade>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Org Chart</h1>
            <p className="text-sm text-muted-foreground">Organization hierarchy and reporting structure</p>
          </div>
          <Select value={deptFilter} onValueChange={setDeptFilter}>
            <SelectTrigger className="w-44" data-testid="dept-filter">
              <SelectValue placeholder="All Departments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {hrmsDepartments.map((d) => <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </Fade>

      <Fade>
        <div className="bg-muted/20 border rounded-2xl p-8 overflow-auto">
          <div className="flex justify-center min-w-max">
            <OrgChartNode node={orgChart} deptFilter={deptFilter} />
          </div>
        </div>
      </Fade>

      <Fade>
        <div className="flex flex-wrap gap-3">
          {Object.entries(deptColors).filter(([k]) => k !== "Leadership").map(([dept, color]) => (
            <div key={dept} className="flex items-center gap-1.5 text-xs">
              <div className="size-3 rounded-sm" style={{ background: color }} />
              <span className="text-muted-foreground">{dept}</span>
            </div>
          ))}
        </div>
      </Fade>
    </PageTransition>
  );
}
