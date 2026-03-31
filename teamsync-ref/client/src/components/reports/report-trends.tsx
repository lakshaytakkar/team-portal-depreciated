import { useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell,
  ResponsiveContainer, Tooltip as RechartsTooltip, Legend,
} from "recharts";
import { Card } from "@/components/ui/card";
import { TrendingUp, PieChart as PieIcon } from "lucide-react";
import type { SubmittedReport } from "@/lib/mock-data-reports";

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"];

interface ReportTrendsProps {
  reports: SubmittedReport[];
  templates?: ReportTemplate[];
  color?: string;
}

export default function ReportTrends({ reports, color = "#3B82F6" }: ReportTrendsProps) {
  const submittedReports = reports.filter(r => r.status === "submitted");

  const submissionsByDate = useMemo(() => {
    const map = new Map<string, number>();
    submittedReports.forEach(r => {
      const d = r.period;
      map.set(d, (map.get(d) ?? 0) + 1);
    });
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-7)
      .map(([date, count]) => {
        const parsed = new Date(date);
        const label = isNaN(parsed.getTime())
          ? date.slice(0, 10)
          : parsed.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
        return { date: label, submissions: count };
      });
  }, [submittedReports]);

  const byScope = useMemo(() => {
    const counts = { Employee: 0, Department: 0, Executive: 0 };
    submittedReports.forEach(r => {
      if (r.scope === "employee") counts.Employee++;
      else if (r.scope === "department") counts.Department++;
      else counts.Executive++;
    });
    return Object.entries(counts)
      .filter(([, v]) => v > 0)
      .map(([name, value]) => ({ name, value }));
  }, [submittedReports]);

  const byTemplate = useMemo(() => {
    const map = new Map<string, number>();
    submittedReports.forEach(r => {
      map.set(r.templateName, (map.get(r.templateName) ?? 0) + 1);
    });
    return Array.from(map.entries())
      .sort(([, a], [, b]) => b - a)
      .map(([name, count]) => ({ name: name.length > 20 ? name.slice(0, 18) + "…" : name, count }));
  }, [submittedReports]);

  if (submittedReports.length < 2) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {submissionsByDate.length >= 2 && (
        <Card className="p-4 md:col-span-2">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="size-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">Submissions Over Time</h3>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={submissionsByDate} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} className="fill-muted-foreground" />
              <YAxis tick={{ fontSize: 10 }} className="fill-muted-foreground" allowDecimals={false} />
              <RechartsTooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Bar dataKey="submissions" fill={color} radius={[4, 4, 0, 0]} name="Reports" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      {byScope.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <PieIcon className="size-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">By Scope</h3>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={byScope} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={4} dataKey="value">
                {byScope.map((_entry, index) => (
                  <Cell key={`scope-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <RechartsTooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Legend wrapperStyle={{ fontSize: "11px" }} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      )}

      {byTemplate.length > 1 && (
        <Card className="p-4 md:col-span-3">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="size-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">Submissions by Template</h3>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={byTemplate} layout="vertical" margin={{ top: 5, right: 20, left: 5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" />
              <XAxis type="number" tick={{ fontSize: 10 }} className="fill-muted-foreground" allowDecimals={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={120} className="fill-muted-foreground" />
              <RechartsTooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Bar dataKey="count" fill={color} radius={[0, 4, 4, 0]} name="Submissions">
                {byTemplate.map((_entry, index) => (
                  <Cell key={`tmpl-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}
    </div>
  );
}
