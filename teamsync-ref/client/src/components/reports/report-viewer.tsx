import { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell,
  ResponsiveContainer, Tooltip as RechartsTooltip, Legend,
} from "recharts";
import {
  Maximize2, Minimize2, X, Calendar, User, Briefcase,
  CheckCircle2, BarChart3, List, FileText, TrendingUp,
  ArrowUpRight, ArrowDownRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { ReportTemplate, SubmittedReport, ReportScope, ReportFrequency, ReportStatus } from "@/lib/mock-data-reports";

const CHART_COLORS = [
  "#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6",
  "#EC4899", "#06B6D4", "#F97316", "#14B8A6", "#6366F1",
];

const scopeStyle: Record<ReportScope, { label: string; className: string }> = {
  employee: { label: "Employee", className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  department: { label: "Department", className: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" },
  executive: { label: "Executive", className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
};

const freqStyle: Record<ReportFrequency, string> = {
  daily: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400",
  weekly: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
};

const statusStyle: Record<ReportStatus, { label: string; className: string; dot: string }> = {
  submitted: { label: "Submitted", className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400", dot: "bg-emerald-500" },
  pending: { label: "Pending", className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400", dot: "bg-amber-400" },
  late: { label: "Late", className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400", dot: "bg-red-500" },
};

interface ReportViewerProps {
  open: boolean;
  report: SubmittedReport;
  template: ReportTemplate | undefined;
  allReports?: SubmittedReport[];
  color?: string;
  onClose: () => void;
}

function formatNumber(val: number): string {
  if (val >= 10000000) return `${(val / 10000000).toFixed(1)}Cr`;
  if (val >= 100000) return `${(val / 100000).toFixed(1)}L`;
  if (val >= 1000) return `${(val / 1000).toFixed(1)}K`;
  return val.toLocaleString("en-IN");
}

function parseTextIntoBullets(text: string): string[] {
  const raw = String(text);
  const lines = raw.split(/[\n;•\-–—]/).map(l => l.trim()).filter(Boolean);
  if (lines.length > 1) return lines;
  const sentences = raw.split(/\.\s+/).map(s => s.trim().replace(/\.$/, "")).filter(Boolean);
  return sentences.length > 1 ? sentences : [raw];
}

function NumericMetricCard({ label, value, unit, color, prevValue }: {
  label: string; value: number; unit?: string; color: string; prevValue?: number;
}) {
  const trend = prevValue != null && prevValue > 0
    ? Math.round(((value - prevValue) / prevValue) * 100)
    : null;

  return (
    <Card className="p-4 flex flex-col gap-1 border-t-2" style={{ borderTopColor: color }}>
      <p className="text-xs font-medium text-muted-foreground truncate">{label}</p>
      <div className="flex items-baseline gap-1.5">
        <span className="text-2xl font-bold tabular-nums">{formatNumber(value)}</span>
        {unit && <span className="text-xs text-muted-foreground">{unit}</span>}
      </div>
      {trend !== null && (
        <div className={cn("flex items-center gap-1 text-xs font-medium", trend >= 0 ? "text-emerald-600" : "text-red-500")}>
          {trend >= 0 ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
          {Math.abs(trend)}% vs prev
        </div>
      )}
    </Card>
  );
}

function ReportContent({ report, template, allReports, color }: {
  report: SubmittedReport;
  template: ReportTemplate | undefined;
  allReports?: SubmittedReport[];
  color: string;
}) {
  if (!template) return <p className="text-sm text-muted-foreground">Template not found</p>;

  const numericFields = template.fields.filter(f => f.type === "number");
  const textFields = template.fields.filter(f => f.type === "textarea" || f.type === "text");
  const selectFields = template.fields.filter(f => f.type === "select");

  const sameTemplateReports = (allReports ?? [])
    .filter(r => r.templateId === report.templateId && r.status === "submitted" && r.id !== report.id)
    .sort((a, b) => b.period.localeCompare(a.period));

  const previousReport = sameTemplateReports[0];

  const barChartData = numericFields
    .filter(f => report.data[f.id] !== undefined && report.data[f.id] !== "")
    .map(f => ({
      name: f.label.replace(/\(.*?\)/g, "").trim(),
      value: Number(report.data[f.id]) || 0,
      unit: f.unit,
      fieldId: f.id,
    }));

  const trendData = numericFields.length > 0 ? sameTemplateReports.slice(0, 6).reverse().map(r => {
    const point: Record<string, string | number> = { period: r.periodLabel.replace(/Week of /g, "").slice(0, 6) };
    numericFields.forEach(f => { point[f.id] = Number(r.data[f.id]) || 0; });
    return point;
  }).concat([{
    period: "Current",
    ...numericFields.reduce((acc, f) => { acc[f.id] = Number(report.data[f.id]) || 0; return acc; }, {} as Record<string, number>),
  }]) : [];

  return (
    <div className="space-y-6">
      {numericFields.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="size-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">Key Metrics</h3>
          </div>
          <div className={cn(
            "grid gap-3",
            numericFields.length <= 2 ? "grid-cols-2" :
            numericFields.length <= 3 ? "grid-cols-3" : "grid-cols-2 sm:grid-cols-4"
          )}>
            {numericFields.map((f, i) => {
              const val = Number(report.data[f.id]) || 0;
              const prevVal = previousReport ? (Number(previousReport.data[f.id]) || undefined) : undefined;
              return (
                <NumericMetricCard
                  key={f.id}
                  label={f.label}
                  value={val}
                  unit={f.unit}
                  color={CHART_COLORS[i % CHART_COLORS.length]}
                  prevValue={prevVal}
                />
              );
            })}
          </div>
        </section>
      )}

      {barChartData.length >= 2 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="size-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">Metrics Overview</h3>
          </div>
          <Card className="p-4">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={barChartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                <YAxis tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  formatter={(value: number, _name: string, props: any) => {
                    const unit = props.payload?.unit ?? "";
                    return [`${formatNumber(value)} ${unit}`, "Value"];
                  }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {barChartData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </section>
      )}

      {trendData.length >= 3 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="size-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">Historical Trend</h3>
          </div>
          <Card className="p-4">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={trendData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" />
                <XAxis dataKey="period" tick={{ fontSize: 10 }} className="fill-muted-foreground" />
                <YAxis tick={{ fontSize: 10 }} className="fill-muted-foreground" />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
                {numericFields.slice(0, 4).map((f, i) => (
                  <Bar
                    key={f.id}
                    dataKey={f.id}
                    name={f.label.replace(/\(.*?\)/g, "").trim()}
                    fill={CHART_COLORS[i % CHART_COLORS.length]}
                    radius={[4, 4, 0, 0]}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </section>
      )}

      {selectFields.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <FileText className="size-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">Selections</h3>
          </div>
          <div className="space-y-2">
            {selectFields.map(f => {
              const val = report.data[f.id];
              if (val === undefined || val === "") return null;
              return (
                <div key={f.id} className="flex items-center gap-3 rounded-lg border px-4 py-2.5">
                  <span className="text-xs font-medium text-muted-foreground min-w-[120px]">{f.label}</span>
                  <Badge variant="secondary" className="text-xs">{String(val)}</Badge>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {textFields.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <List className="size-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">Details & Notes</h3>
          </div>
          <div className="space-y-4">
            {textFields.map(f => {
              const val = report.data[f.id];
              if (val === undefined || val === null || val === "") return null;
              const bullets = parseTextIntoBullets(String(val));
              return (
                <Card key={f.id} className="p-4">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{f.label}</h4>
                  {bullets.length > 1 ? (
                    <ul className="space-y-1.5">
                      {bullets.map((b, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <span className="mt-1.5 size-1.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm leading-relaxed">{String(val)}</p>
                  )}
                </Card>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}

function ReportHeader({ report, template }: { report: SubmittedReport; template?: ReportTemplate }) {
  const sc = scopeStyle[report.scope];
  const st = statusStyle[report.status];
  const freq = freqStyle[report.frequency];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Badge className={cn("text-[11px] border-none capitalize", sc.className)}>{sc.label}</Badge>
        <Badge className={cn("text-[11px] border-none capitalize", freq)}>{report.frequency}</Badge>
        <Badge className={cn("text-[11px] border-none", st.className)}>
          <span className={cn("size-1.5 rounded-full mr-1", st.dot)} />
          {st.label}
        </Badge>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Calendar className="size-3.5" />
          <span>{report.periodLabel}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <User className="size-3.5" />
          <span>{report.submittedBy}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Briefcase className="size-3.5" />
          <span>{report.submittedByRole}</span>
        </div>
        {report.submittedAt && (
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="size-3.5 text-emerald-500" />
            <span>{new Date(report.submittedAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ReportViewer({ open, report, template, allReports, color = "#3B82F6", onClose }: ReportViewerProps) {
  const [fullscreen, setFullscreen] = useState(false);

  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-background overflow-y-auto" data-testid="report-fullscreen">
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b">
          <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-lg" style={{ backgroundColor: `${color}20` }}>
                <FileText className="size-4" style={{ color }} />
              </div>
              <h1 className="text-lg font-bold">{report.templateName}</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setFullscreen(false)} data-testid="button-exit-fullscreen">
                <Minimize2 className="size-4 mr-1.5" />
                Exit Fullscreen
              </Button>
              <Button variant="ghost" size="icon" onClick={onClose} data-testid="button-close-fullscreen">
                <X className="size-4" />
              </Button>
            </div>
          </div>
        </div>
        <div className="max-w-5xl mx-auto px-6 py-8">
          <ReportHeader report={report} template={template} />
          <Separator className="my-6" />
          <ReportContent report={report} template={template} allReports={allReports} color={color} />
        </div>
      </div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-base font-semibold flex items-center gap-2">
              <div className="p-1.5 rounded-lg" style={{ backgroundColor: `${color}20` }}>
                <FileText className="size-4" style={{ color }} />
              </div>
              {report.templateName}
            </DialogTitle>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setFullscreen(true)} data-testid="button-fullscreen">
              <Maximize2 className="size-4" />
            </Button>
          </div>
          <DialogDescription className="sr-only">Detailed view of submitted report</DialogDescription>
          <ReportHeader report={report} template={template} />
        </DialogHeader>
        <Separator />
        <ReportContent report={report} template={template} allReports={allReports} color={color} />
      </DialogContent>
    </Dialog>
  );
}
