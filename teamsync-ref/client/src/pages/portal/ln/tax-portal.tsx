import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { useLocation, useParams } from "wouter";
import {
  FileText, Calendar, ClipboardList, Receipt,
  CheckCircle2, Circle, Clock,
  Send, Printer, Eye, Mail,
  Search, ChevronRight, CheckSquare,
  Square, Paperclip, MessageSquare, ArrowLeft,
  TrendingUp, AlertCircle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  TAX_FILINGS, TAX_STATUS_LABELS, TAX_STATUS_COLORS,
  TAX_CALENDAR_DEADLINES,
  type TaxFilingStatus,
} from "@/lib/mock-data-dashboard-ln";

function daysUntil(dateStr: string): number {
  const now = new Date();
  const d = new Date(dateStr);
  return Math.ceil((d.getTime() - now.getTime()) / 86400000);
}

function TaxSeasonProgress() {
  const now = new Date();
  const year = now.getFullYear();
  const seasonStart = new Date(`${year}-01-01`).getTime();
  const seasonEnd = new Date(`${year}-04-15`).getTime();
  const current = Math.min(now.getTime(), seasonEnd);
  const seasonPercent = Math.round(((current - seasonStart) / (seasonEnd - seasonStart)) * 100);

  const milestones = [
    { label: "Jan 1", desc: "Season Opens", date: `${year}-01-01`, offset: 0 },
    { label: "Mar 15", desc: "S-Corp Deadline", date: `${year}-03-15`, offset: 62 },
    { label: "Apr 15", desc: "Main Deadline", date: `${year}-04-15`, offset: 100 },
    { label: "Oct 15", desc: "Extension", date: `${year}-10-15`, offset: 100 },
  ];

  return (
    <Card className="border-0 shadow-sm" data-testid="tax-season-progress">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tax Season Progress</p>
            <p className="text-sm font-bold mt-0.5">Jan 1 → Apr 15 {year}</p>
          </div>
          <Badge variant="outline" className={`text-xs ${seasonPercent >= 100 ? "border-red-300 text-red-700 bg-red-50" : "border-amber-300 text-amber-700 bg-amber-50"}`}>
            {seasonPercent >= 100 ? "Deadline Passed" : `${100 - seasonPercent}% remaining`}
          </Badge>
        </div>
        <div className="relative">
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${seasonPercent >= 90 ? "bg-red-500" : seasonPercent >= 70 ? "bg-amber-500" : "bg-amber-400"}`}
              style={{ width: `${Math.min(seasonPercent, 100)}%` }}
            />
          </div>
          <div className="flex justify-between mt-2">
            {milestones.slice(0, 3).map((m) => {
              const isPast = new Date(m.date) < now;
              return (
                <div key={m.label} className="text-center">
                  <p className={`text-[10px] font-bold ${isPast ? "text-muted-foreground" : "text-amber-700"}`}>{m.label}</p>
                  <p className="text-[9px] text-muted-foreground">{m.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function LnTaxPortal() {
  const [, setLocation] = useLocation();
  const filed = TAX_FILINGS.filter(f => f.status === "filed").length;
  const inProgress = TAX_FILINGS.filter(f => !["filed", "not-started"].includes(f.status)).length;
  const notStarted = TAX_FILINGS.filter(f => f.status === "not-started").length;
  const readyToFile = TAX_FILINGS.filter(f => f.status === "ready-to-file").length;
  const docsReview = TAX_FILINGS.filter(f => f.status === "review").length;
  const nextDeadline = TAX_CALENDAR_DEADLINES.filter(d => !d.done).sort((a, b) => a.date.localeCompare(b.date))[0];
  const defaultFilingId = TAX_FILINGS.find(f => !["not-started"].includes(f.status))?.id ?? TAX_FILINGS[0].id;
  const daysLeft = nextDeadline ? daysUntil(nextDeadline.date) : 0;
  const completionRate = Math.round((filed / TAX_FILINGS.length) * 100);

  return (
    <div className="px-16 lg:px-24 py-6 space-y-6" data-testid="ln-tax-portal-dashboard">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600 p-6 text-white shadow-lg">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/3 translate-x-1/3" />
        <div className="relative z-10">
          <p className="text-sm text-amber-200 mb-1">Tax Specialist — Deepak Verma</p>
          <h1 className="text-2xl font-bold font-heading" data-testid="text-tax-title">Tax Season Dashboard</h1>
          <div className="flex items-center gap-6 mt-3 text-sm text-amber-200">
            <span><strong className="text-white">{TAX_FILINGS.length}</strong> Total Filings</span>
            <span><strong className="text-white">{filed}</strong> Filed</span>
            <span><strong className="text-white">{inProgress}</strong> In Progress</span>
            {daysLeft > 0 && (
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <strong className="text-white">{daysLeft}</strong> days to deadline
              </span>
            )}
          </div>
        </div>
      </div>

      <TaxSeasonProgress />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Active Filings", value: inProgress, color: "text-amber-600", bg: "bg-amber-50", icon: FileText },
          { label: "Docs Pending", value: TAX_FILINGS.filter(f => f.status === "docs-pending").length, color: "text-red-600", bg: "bg-red-50", icon: AlertCircle },
          { label: "Reviews Needed", value: docsReview, color: "text-blue-600", bg: "bg-blue-50", icon: Eye },
          { label: "Filed This Season", value: filed, color: "text-emerald-600", bg: "bg-emerald-50", icon: CheckCircle2 },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className={`w-9 h-9 rounded-lg ${stat.bg} flex items-center justify-center mb-3`}>
                  <Icon className={`w-4 h-4 ${stat.color}`} />
                </div>
                <p className="text-xl font-bold" data-testid={`stat-tax-${stat.label.toLowerCase().replace(/\s+/g, "-")}`}>{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card className="md:col-span-2 border-0 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-500" /> Active Filings
              </CardTitle>
              <Button size="sm" variant="ghost" className="text-xs text-amber-600 h-7" onClick={() => setLocation("/portal-ln/tax/queue")} data-testid="button-view-all-filings">
                View All <ChevronRight className="w-3 h-3 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0 space-y-2">
            {TAX_FILINGS.filter(f => f.status !== "not-started").slice(0, 5).map((f) => (
              <div
                key={f.id}
                className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 hover:bg-muted/60 transition-colors cursor-pointer"
                onClick={() => setLocation(`/portal-ln/tax/filing/${f.id}`)}
                data-testid={`tax-filing-row-${f.id}`}
              >
                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-xs font-bold text-amber-600 shrink-0">
                  {f.company[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{f.company}</p>
                  <p className="text-xs text-muted-foreground">{f.client} · {f.ein || "No EIN"} · {f.forms.join(", ")}</p>
                </div>
                <Badge variant="outline" className={`text-[10px] shrink-0 ${TAX_STATUS_COLORS[f.status]}`}>
                  {TAX_STATUS_LABELS[f.status]}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-500" /> Upcoming Deadlines
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              {TAX_CALENDAR_DEADLINES.filter(d => !d.done).slice(0, 4).map((dl) => (
                <div key={dl.id} className="p-2.5 rounded-lg bg-muted/40" data-testid={`tax-deadline-${dl.id}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold">{dl.title}</span>
                    <Badge
                      variant="outline"
                      className={`text-[10px] ${dl.priority === "critical" ? "border-red-300 text-red-700 bg-red-50" : dl.priority === "high" ? "border-amber-300 text-amber-700 bg-amber-50" : "border-gray-200 text-gray-500"}`}
                    >
                      {dl.priority}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{dl.date}{dl.company ? ` · ${dl.company}` : ""}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-amber-50/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-semibold text-amber-800">Filing Completion Rate</span>
              </div>
              <div className="relative flex items-center justify-center w-24 h-24 mx-auto mb-2">
                <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#fef3c7" strokeWidth="3" />
                  <circle
                    cx="18" cy="18" r="15.9" fill="none"
                    stroke="#f59e0b" strokeWidth="3"
                    strokeDasharray={`${completionRate} ${100 - completionRate}`}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute text-lg font-bold text-amber-700">{completionRate}%</span>
              </div>
              <p className="text-xs text-amber-700 text-center">{filed} of {TAX_FILINGS.length} filings complete</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-1.5">
              {[
                { label: "Filing Queue", url: "/portal-ln/tax/queue", icon: ClipboardList },
                { label: "Preparation Workspace", url: "/portal-ln/tax/prep", icon: FileText },
                { label: "Filing Detail", url: `/portal-ln/tax/filing/${defaultFilingId}`, icon: Receipt },
                { label: "Tax Calendar", url: "/portal-ln/tax/calendar", icon: Calendar },
              ].map((action) => (
                <Button
                  key={action.url}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-between text-xs h-8 font-medium"
                  onClick={() => setLocation(action.url)}
                  data-testid={`quick-action-${action.label.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  <span className="flex items-center gap-2">
                    <action.icon className="w-3.5 h-3.5 text-muted-foreground" />
                    {action.label}
                  </span>
                  <ChevronRight className="w-3 h-3 text-muted-foreground" />
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

const ENTITY_TYPES = ["All", "LLC", "C-Corp"] as const;
type EntityTypeFilter = typeof ENTITY_TYPES[number];

export function LnTaxQueue() {
  const [statusFilter, setStatusFilter] = useState<TaxFilingStatus | "all">("all");
  const [entityFilter, setEntityFilter] = useState<EntityTypeFilter>("All");
  const [search, setSearch] = useState("");
  const [, setLocation] = useLocation();

  const filtered = useMemo(() => {
    let list = TAX_FILINGS;
    if (statusFilter !== "all") list = list.filter(f => f.status === statusFilter);
    if (entityFilter !== "All") list = list.filter(f => f.entityType === entityFilter);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(f => f.company.toLowerCase().includes(q) || f.client.toLowerCase().includes(q));
    }
    return list;
  }, [statusFilter, entityFilter, search]);

  const statuses: (TaxFilingStatus | "all")[] = ["all", "docs-pending", "in-prep", "review", "ready-to-file", "filed", "not-started"];
  const statusLabels: Record<string, string> = { all: "All", ...TAX_STATUS_LABELS };

  return (
    <div className="px-16 lg:px-24 py-6 space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground h-8 px-2" onClick={() => setLocation("/portal-ln/tax")} data-testid="breadcrumb-back-tax">
          <ArrowLeft className="w-3.5 h-3.5" /> Dashboard
        </Button>
        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="text-sm font-semibold">Filing Queue</span>
      </div>

      <div>
        <h1 className="text-xl font-bold" data-testid="text-tax-queue-title">Filing Queue</h1>
        <p className="text-sm text-muted-foreground">Track all tax filings for the current season</p>
      </div>

      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          {statuses.map((s) => (
            <Button
              key={s}
              size="sm"
              variant={statusFilter === s ? "default" : "outline"}
              className={statusFilter === s ? "bg-amber-500 hover:bg-amber-600 text-white" : ""}
              onClick={() => setStatusFilter(s)}
              data-testid={`filter-status-${s}`}
            >
              {statusLabels[s]}
              {s !== "all" && (
                <span className="ml-1 text-xs opacity-70">
                  ({TAX_FILINGS.filter(f => f.status === s).length})
                </span>
              )}
            </Button>
          ))}
          <div className="ml-auto relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              placeholder="Search company or client..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-8 w-56 text-xs"
              data-testid="input-tax-search"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground font-medium">Entity:</span>
          {ENTITY_TYPES.map((et) => (
            <Button
              key={et}
              size="sm"
              variant={entityFilter === et ? "secondary" : "ghost"}
              className={`h-7 text-xs ${entityFilter === et ? "bg-amber-100 text-amber-700 hover:bg-amber-200" : "text-muted-foreground"}`}
              onClick={() => setEntityFilter(et)}
              data-testid={`filter-entity-${et.toLowerCase().replace("-", "")}`}
            >
              {et}
              {et !== "All" && (
                <span className="ml-1 opacity-60">({TAX_FILINGS.filter(f => f.entityType === et).length})</span>
              )}
            </Button>
          ))}
          {(statusFilter !== "all" || entityFilter !== "All" || search) && (
            <Button
              size="sm"
              variant="ghost"
              className="h-7 text-xs text-muted-foreground ml-auto"
              onClick={() => { setStatusFilter("all"); setEntityFilter("All"); setSearch(""); }}
              data-testid="clear-filters"
            >
              Clear filters
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map((f) => (
          <Card key={f.id} className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer" data-testid={`tax-queue-card-${f.id}`} onClick={() => setLocation(`/portal-ln/tax/filing/${f.id}`)}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-sm font-bold text-amber-600 shrink-0">
                    {f.company[0]}
                  </div>
                  <div>
                    <p className="font-semibold">{f.company}</p>
                    <p className="text-sm text-muted-foreground">{f.client} · {f.state} · {f.entityType} · TY {f.taxYear}</p>
                  </div>
                </div>
                <Badge variant="outline" className={TAX_STATUS_COLORS[f.status]}>
                  {TAX_STATUS_LABELS[f.status]}
                </Badge>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs mb-3">
                <div className="bg-muted/40 rounded-lg p-2.5">
                  <p className="text-muted-foreground">EIN</p>
                  <p className="font-semibold mt-0.5">{f.ein || "Pending"}</p>
                </div>
                <div className="bg-muted/40 rounded-lg p-2.5">
                  <p className="text-muted-foreground">Forms</p>
                  <p className="font-semibold mt-0.5">{f.forms.join(", ")}</p>
                </div>
                <div className="bg-muted/40 rounded-lg p-2.5">
                  <p className="text-muted-foreground">Revenue</p>
                  <p className="font-semibold mt-0.5">{f.revenue > 0 ? `$${f.revenue.toLocaleString()}` : "Zero-activity"}</p>
                </div>
                <div className="bg-muted/40 rounded-lg p-2.5">
                  <p className="text-muted-foreground">Due Date</p>
                  <p className="font-semibold mt-0.5">{f.dueDate}</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">{f.notes}</p>
              {f.status === "ready-to-file" && (
                <div className="flex gap-2 mt-3">
                  <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white gap-1" onClick={(e) => e.stopPropagation()} data-testid={`print-${f.id}`}>
                    <Printer className="w-3.5 h-3.5" /> Print & Mail
                  </Button>
                </div>
              )}
              {f.status === "filed" && f.trackingNumber && (
                <div className="mt-3 p-2 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-emerald-600" />
                  <div>
                    <p className="text-xs font-semibold text-emerald-700">Filed {f.filedDate}</p>
                    <p className="text-[10px] text-emerald-600">Tracking: {f.trackingNumber}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground text-sm">No filings match your filter</div>
        )}
      </div>
    </div>
  );
}

const TEN_STEP_PROCEDURE = [
  { n: 1, title: "Gather Documents", desc: "Bank statements, income/expense records, prior year returns", icon: FileText },
  { n: 2, title: "EIN Verification", desc: "Verify EIN with IRS records and confirm entity type", icon: CheckSquare },
  { n: 3, title: "Prepare Form 1120", desc: "Corporate income tax return — entity info, income/deductions, balance sheet", icon: FileText },
  { n: 4, title: "Prepare Form 5472", desc: "Transactions with 25%+ foreign owners — mandatory for international LLCs", icon: FileText },
  { n: 5, title: "Internal Review", desc: "Cross-check all forms for accuracy and completeness", icon: Eye },
  { n: 6, title: "Client Review", desc: "Send forms to client for review and written confirmation", icon: MessageSquare },
  { n: 7, title: "Client Approval", desc: "Obtain signed approval before proceeding to filing", icon: CheckCircle2 },
  { n: 8, title: "Print & Sign", desc: "Print final filing package, prepare cover letter", icon: Printer },
  { n: 9, title: "LetterStream Certified Mail", desc: "Send via USPS certified mail using LetterStream portal", icon: Mail },
  { n: 10, title: "IRS Confirmation", desc: "Track delivery, log tracking number, await IRS acknowledgment", icon: CheckCircle2 },
];

interface PrepStepState {
  done: boolean;
  notes: string;
  completedAt: string | null;
  attachments: string[];
}

export function LnTaxPrep() {
  const [, setLocation] = useLocation();
  const [selectedFiling, setSelectedFiling] = useState(TAX_FILINGS[0]);
  const [stepStates, setStepStates] = useState<Record<string, PrepStepState>>({});
  const [activeStep, setActiveStep] = useState<number | null>(null);

  const activeFilings = TAX_FILINGS.filter(f => !["not-started", "filed"].includes(f.status));

  const getFilingStep = (filing: typeof TAX_FILINGS[0]): number => {
    const statusOrder: TaxFilingStatus[] = ["docs-pending", "in-prep", "review", "client-review", "ready-to-file", "mailed"];
    const idx = statusOrder.indexOf(filing.status);
    return idx >= 0 ? idx + 1 : 0;
  };

  const filingKey = selectedFiling.id;
  const currentStep = getFilingStep(selectedFiling);

  const getStepKey = (stepN: number) => `${filingKey}-${stepN}`;

  const getEmptyStep = (): PrepStepState => ({ done: false, notes: "", completedAt: null, attachments: [] });

  const toggleStep = (stepN: number) => {
    const key = getStepKey(stepN);
    const currentlyDone = isStepDone(stepN);
    const nowDone = !currentlyDone;
    setStepStates(s => {
      const prev = s[key] ?? getEmptyStep();
      return {
        ...s,
        [key]: { ...prev, done: nowDone, completedAt: nowDone ? new Date().toISOString() : null },
      };
    });
  };

  const updateStepNotes = (stepN: number, notes: string) => {
    const key = getStepKey(stepN);
    setStepStates(s => ({
      ...s,
      [key]: { ...(s[key] ?? getEmptyStep()), notes },
    }));
  };

  const addStepAttachment = (stepN: number, fileName: string) => {
    const key = getStepKey(stepN);
    setStepStates(s => {
      const existing = s[key] ?? getEmptyStep();
      return { ...s, [key]: { ...existing, attachments: [...existing.attachments, fileName] } };
    });
  };

  const removeStepAttachment = (stepN: number, fileName: string) => {
    const key = getStepKey(stepN);
    setStepStates(s => {
      const existing = s[key] ?? getEmptyStep();
      return { ...s, [key]: { ...existing, attachments: existing.attachments.filter(f => f !== fileName) } };
    });
  };

  const isStepDone = (stepN: number) => {
    const key = getStepKey(stepN);
    if (key in stepStates) {
      return stepStates[key].done;
    }
    return stepN <= currentStep;
  };

  const getStepCompletedAt = (stepN: number): string | null => {
    const key = getStepKey(stepN);
    return stepStates[key]?.completedAt ?? null;
  };

  const doneCount = TEN_STEP_PROCEDURE.filter(s => isStepDone(s.n)).length;
  const progressPercent = Math.round((doneCount / TEN_STEP_PROCEDURE.length) * 100);

  return (
    <div className="px-16 lg:px-24 py-6 space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground h-8 px-2" onClick={() => setLocation("/portal-ln/tax")} data-testid="breadcrumb-back-prep">
          <ArrowLeft className="w-3.5 h-3.5" /> Dashboard
        </Button>
        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="text-sm font-semibold">Preparation Workspace</span>
      </div>

      <div>
        <h1 className="text-xl font-bold" data-testid="text-tax-prep-title">Preparation Workspace</h1>
        <p className="text-sm text-muted-foreground">10-step IRS procedure checklist per client</p>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <div className="space-y-1.5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">Select Client</p>
          {activeFilings.map((f) => (
            <button
              key={f.id}
              onClick={() => { setSelectedFiling(f); setActiveStep(null); }}
              className={`w-full text-left p-3 rounded-xl transition-colors ${selectedFiling.id === f.id ? "bg-amber-100 border border-amber-300" : "bg-muted/40 hover:bg-muted/60"}`}
              data-testid={`select-prep-filing-${f.id}`}
            >
              <p className="text-xs font-semibold truncate">{f.company}</p>
              <Badge variant="outline" className={`text-[9px] mt-1 ${TAX_STATUS_COLORS[f.status]}`}>
                {TAX_STATUS_LABELS[f.status]}
              </Badge>
            </button>
          ))}
        </div>

        <div className="md:col-span-3 space-y-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-sm font-bold text-amber-600">
                    {selectedFiling.company[0]}
                  </div>
                  <div>
                    <p className="font-semibold">{selectedFiling.company}</p>
                    <p className="text-xs text-muted-foreground">{selectedFiling.client} · {selectedFiling.ein || "No EIN"} · {selectedFiling.entityType}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className={TAX_STATUS_COLORS[selectedFiling.status]}>
                    {TAX_STATUS_LABELS[selectedFiling.status]}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-3 mb-1">
                <Progress value={progressPercent} className="flex-1 h-2.5" />
                <span className="text-sm font-bold text-muted-foreground">{doneCount}/10</span>
              </div>
              <p className="text-xs text-muted-foreground">{progressPercent}% of 10-step IRS procedure complete</p>
            </CardContent>
          </Card>

          <div className="space-y-2">
            {TEN_STEP_PROCEDURE.map((step) => {
              const done = isStepDone(step.n);
              const isActive = activeStep === step.n;
              const isCurrent = step.n === currentStep + 1;
              const completedAt = getStepCompletedAt(step.n);
              const stepNotes = stepStates[getStepKey(step.n)]?.notes || "";
              const stepAttachments = stepStates[getStepKey(step.n)]?.attachments ?? [];

              return (
                <Card
                  key={step.n}
                  className={`border shadow-sm transition-all ${done ? "border-emerald-200 bg-emerald-50/30" : isCurrent ? "border-amber-300 bg-amber-50/30" : "border-transparent"}`}
                  data-testid={`prep-step-${step.n}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleStep(step.n)}
                        className="shrink-0"
                        data-testid={`toggle-step-${step.n}`}
                      >
                        {done
                          ? <CheckSquare className="w-5 h-5 text-emerald-600" />
                          : <Square className="w-5 h-5 text-gray-300" />
                        }
                      </button>
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 bg-amber-100 text-amber-700">
                        {step.n}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className={`text-sm font-semibold ${done ? "line-through text-muted-foreground" : ""}`}>{step.title}</p>
                          {isCurrent && !done && <Badge variant="outline" className="text-[9px] border-amber-300 text-amber-700 bg-amber-50">Current</Badge>}
                          {done && completedAt && (
                            <span className="text-[10px] text-emerald-600 font-medium" data-testid={`completed-at-step-${step.n}`}>
                              ✓ {new Date(completedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{step.desc}</p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {stepAttachments.length > 0 && !isActive && (
                          <span className="text-[9px] bg-amber-100 text-amber-700 rounded-full px-1.5 py-0.5 font-medium">
                            {stepAttachments.length} file{stepAttachments.length !== 1 ? "s" : ""}
                          </span>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-[11px]"
                          onClick={() => setActiveStep(isActive ? null : step.n)}
                          data-testid={`expand-step-${step.n}`}
                        >
                          <Paperclip className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                    {isActive && (
                      <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
                        <Textarea
                          placeholder="Add notes for this step..."
                          className="text-xs h-20 resize-none"
                          value={stepNotes}
                          onChange={(e) => updateStepNotes(step.n, e.target.value)}
                          data-testid={`notes-step-${step.n}`}
                        />
                        {stepAttachments.length > 0 && (
                          <div className="flex flex-wrap gap-1.5" data-testid={`attachments-step-${step.n}`}>
                            {stepAttachments.map((fileName) => (
                              <div key={fileName} className="flex items-center gap-1 bg-amber-50 border border-amber-200 rounded-md px-2 py-1">
                                <Paperclip className="w-3 h-3 text-amber-600 shrink-0" />
                                <span className="text-[10px] text-amber-700 font-medium truncate max-w-[120px]">{fileName}</span>
                                <button
                                  onClick={() => removeStepAttachment(step.n, fileName)}
                                  className="text-amber-400 hover:text-amber-700 ml-0.5"
                                  data-testid={`remove-attach-${step.n}-${fileName}`}
                                >×</button>
                              </div>
                            ))}
                          </div>
                        )}
                        <div className="flex gap-2">
                          <label className="cursor-pointer">
                            <input
                              type="file"
                              className="hidden"
                              data-testid={`file-input-step-${step.n}`}
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) { addStepAttachment(step.n, file.name); e.target.value = ""; }
                              }}
                            />
                            <span className="inline-flex items-center gap-1 text-xs h-7 px-2 border border-input rounded-md bg-background hover:bg-accent transition-colors">
                              <Paperclip className="w-3 h-3" /> Attach File
                            </span>
                          </label>
                          <Button
                            size="sm"
                            className="text-xs h-7 bg-amber-500 hover:bg-amber-600 text-white gap-1"
                            onClick={() => toggleStep(step.n)}
                            data-testid={`mark-done-step-${step.n}`}
                          >
                            <CheckCircle2 className="w-3 h-3" /> {done ? "Mark Incomplete" : "Mark Complete"}
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

const ACTIVITY_TIMELINE = [
  { id: "a1", date: "2026-03-10", action: "Filing Submitted", detail: "Certified mail sent via LetterStream", user: "Deepak Verma", type: "success" },
  { id: "a2", date: "2026-03-08", action: "Client Approval Received", detail: "Client confirmed all forms are correct", user: "Rajesh Kumar", type: "success" },
  { id: "a3", date: "2026-03-05", action: "Sent to Client for Review", detail: "Form 1120 and 5472 draft sent for review", user: "Deepak Verma", type: "info" },
  { id: "a4", date: "2026-02-28", action: "Internal QC Complete", detail: "Senior review passed — ready for client", user: "Deepak Verma", type: "success" },
  { id: "a5", date: "2026-02-20", action: "Form 5472 Prepared", detail: "Foreign owner transactions reported", user: "Deepak Verma", type: "info" },
  { id: "a6", date: "2026-02-15", action: "Form 1120 Prepared", detail: "Zero-activity return with balance sheet", user: "Deepak Verma", type: "info" },
  { id: "a7", date: "2026-02-05", action: "Documents Collected", detail: "Bank statements and expense records received", user: "Rajesh Kumar", type: "info" },
  { id: "a8", date: "2026-01-20", action: "Filing Started", detail: "Assigned to Deepak Verma for preparation", user: "System", type: "neutral" },
];

export function LnTaxDetail() {
  const params = useParams<{ filingId?: string }>();
  const [, setLocation] = useLocation();

  const initialFiling = params.filingId
    ? (TAX_FILINGS.find(f => f.id === params.filingId) ?? TAX_FILINGS[0])
    : TAX_FILINGS[0];

  const [selected, setSelected] = useState(initialFiling);

  const isFiled = selected.status === "filed";

  return (
    <div className="px-16 lg:px-24 py-6 space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground h-8 px-2" onClick={() => setLocation("/portal-ln/tax/queue")} data-testid="breadcrumb-back-detail">
          <ArrowLeft className="w-3.5 h-3.5" /> Filing Queue
        </Button>
        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="text-sm font-semibold">Filing Detail</span>
        {selected && <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />}
        {selected && <span className="text-sm text-muted-foreground truncate max-w-[200px]">{selected.company}</span>}
      </div>

      <div>
        <h1 className="text-xl font-bold" data-testid="text-tax-detail-title">Filing Detail</h1>
        <p className="text-sm text-muted-foreground">Complete filing information and history</p>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <div className="space-y-1.5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">Select Filing</p>
          {TAX_FILINGS.map((f) => (
            <button
              key={f.id}
              onClick={() => { setSelected(f); setLocation(`/portal-ln/tax/filing/${f.id}`); }}
              className={`w-full text-left p-3 rounded-xl transition-colors ${selected.id === f.id ? "bg-amber-100 border border-amber-300" : "bg-muted/40 hover:bg-muted/60"}`}
              data-testid={`select-filing-${f.id}`}
            >
              <p className="text-xs font-semibold truncate">{f.company}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <Badge variant="outline" className={`text-[9px] ${TAX_STATUS_COLORS[f.status]}`}>
                  {TAX_STATUS_LABELS[f.status]}
                </Badge>
              </div>
            </button>
          ))}
        </div>

        <div className="md:col-span-3 space-y-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-lg font-bold text-amber-600">
                    {selected.company[0]}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">{selected.company}</h2>
                    <p className="text-sm text-muted-foreground">{selected.client} · {selected.entityType} · {selected.state}</p>
                  </div>
                </div>
                <Badge variant="outline" className={`text-sm ${TAX_STATUS_COLORS[selected.status]}`}>
                  {TAX_STATUS_LABELS[selected.status]}
                </Badge>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-muted/40 rounded-xl p-4">
                  <p className="text-xs text-muted-foreground mb-1">EIN</p>
                  <p className="font-bold">{selected.ein || "Not Assigned"}</p>
                </div>
                <div className="bg-muted/40 rounded-xl p-4">
                  <p className="text-xs text-muted-foreground mb-1">Tax Year</p>
                  <p className="font-bold">{selected.taxYear}</p>
                </div>
                <div className="bg-muted/40 rounded-xl p-4">
                  <p className="text-xs text-muted-foreground mb-1">Due Date</p>
                  <p className="font-bold">{selected.dueDate}</p>
                </div>
                <div className="bg-muted/40 rounded-xl p-4">
                  <p className="text-xs text-muted-foreground mb-1">Revenue</p>
                  <p className="font-bold">{selected.revenue > 0 ? `$${selected.revenue.toLocaleString()}` : "Zero-activity"}</p>
                </div>
                <div className="bg-muted/40 rounded-xl p-4">
                  <p className="text-xs text-muted-foreground mb-1">Required Forms</p>
                  <p className="font-bold text-sm">{selected.forms.join(", ")}</p>
                </div>
                <div className="bg-muted/40 rounded-xl p-4">
                  <p className="text-xs text-muted-foreground mb-1">Assigned To</p>
                  <p className="font-bold">{selected.assignedTo}</p>
                </div>
              </div>

              <div className="mt-4 p-3 rounded-xl bg-amber-50/50 border border-amber-200">
                <p className="text-xs font-semibold text-amber-800 mb-1">Notes</p>
                <p className="text-sm text-amber-700">{selected.notes}</p>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-4">
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-500" /> Required Forms
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-2">
                {selected.forms.map((form) => (
                  <div key={form} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/40" data-testid={`form-row-${form.replace(/\s+/g, "-")}`}>
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-amber-500" />
                      <span className="text-sm font-medium">{form}</span>
                    </div>
                    <Badge variant="outline" className={isFiled ? "border-emerald-300 text-emerald-700 bg-emerald-50" : "border-amber-300 text-amber-700 bg-amber-50"}>
                      {isFiled ? "Filed" : "Pending"}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Mail className="w-4 h-4 text-amber-500" /> Mailing & IRS Response
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {isFiled && selected.trackingNumber ? (
                  <div className="space-y-3">
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span className="text-sm font-semibold text-emerald-700">Mailed via LetterStream</span>
                      </div>
                      <p className="text-xs text-emerald-600">Filed: {selected.filedDate}</p>
                      <p className="text-xs text-emerald-600 font-mono mt-1">Tracking: {selected.trackingNumber}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-blue-50 border border-blue-200">
                      <p className="text-xs font-semibold text-blue-800 mb-1">IRS Response</p>
                      <p className="text-xs text-blue-700">Awaiting IRS acknowledgment (4-6 weeks)</p>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-muted/40 text-center">
                    <Mail className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">Not yet mailed</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Complete preparation steps first</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {isFiled && (
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-500" /> Activity Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {ACTIVITY_TIMELINE.map((act, idx) => (
                    <div key={act.id} className="flex items-start gap-3" data-testid={`timeline-${act.id}`}>
                      <div className="relative flex flex-col items-center">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                          act.type === "success" ? "bg-emerald-100 text-emerald-600" :
                          act.type === "info" ? "bg-blue-100 text-blue-600" :
                          "bg-gray-100 text-gray-500"
                        }`}>
                          {act.type === "success" ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Circle className="w-3.5 h-3.5" />}
                        </div>
                        {idx < ACTIVITY_TIMELINE.length - 1 && (
                          <div className="w-px h-6 bg-gray-200 mt-1" />
                        )}
                      </div>
                      <div className="flex-1 pb-2">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold">{act.action}</p>
                          <span className="text-[10px] text-muted-foreground">{act.date}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{act.detail}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5 font-medium">{act.user}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex gap-2">
            {selected.status === "docs-pending" && (
              <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white gap-1" data-testid="button-request-docs">
                <Send className="w-3.5 h-3.5" /> Request Documents
              </Button>
            )}
            {selected.status === "review" && (
              <Button size="sm" className="bg-blue-500 hover:bg-blue-600 text-white gap-1" data-testid="button-approve-review">
                <Eye className="w-3.5 h-3.5" /> Complete Review
              </Button>
            )}
            {selected.status === "ready-to-file" && (
              <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white gap-1" data-testid="button-print-file">
                <Printer className="w-3.5 h-3.5" /> Print & File
              </Button>
            )}
            <Button size="sm" variant="outline" className="gap-1" onClick={() => setLocation("/portal-ln/tax/prep")} data-testid="button-view-sop">
              <ClipboardList className="w-3.5 h-3.5" /> View Preparation
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function LnTaxCalendar() {
  const [, setLocation] = useLocation();
  const upcoming = TAX_CALENDAR_DEADLINES.filter(d => !d.done).sort((a, b) => a.date.localeCompare(b.date));
  const completed = TAX_CALENDAR_DEADLINES.filter(d => d.done);

  const typeColors: Record<string, string> = {
    filing: "bg-red-100 text-red-700",
    extension: "bg-purple-100 text-purple-700",
    "estimated-tax": "bg-blue-100 text-blue-700",
    state: "bg-amber-100 text-amber-700",
    reminder: "bg-gray-100 text-gray-700",
  };

  const typeLabels: Record<string, string> = {
    filing: "Filing",
    extension: "Extension",
    "estimated-tax": "Est. Tax",
    state: "State",
    reminder: "Reminder",
  };

  const months = useMemo(() => {
    const map = new Map<string, typeof TAX_CALENDAR_DEADLINES>();
    upcoming.forEach(d => {
      const m = new Date(d.date).toLocaleDateString("en-US", { month: "long", year: "numeric" });
      if (!map.has(m)) map.set(m, []);
      map.get(m)!.push(d);
    });
    return Array.from(map.entries());
  }, []);

  return (
    <div className="px-16 lg:px-24 py-6 space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground h-8 px-2" onClick={() => setLocation("/portal-ln/tax")} data-testid="breadcrumb-back-calendar">
          <ArrowLeft className="w-3.5 h-3.5" /> Dashboard
        </Button>
        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="text-sm font-semibold">Tax Calendar</span>
      </div>

      <div>
        <h1 className="text-xl font-bold" data-testid="text-tax-calendar-title">Tax Calendar</h1>
        <p className="text-sm text-muted-foreground">All IRS and state filing deadlines</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {(["filing", "extension", "estimated-tax", "state"] as const).map((type) => {
          const count = TAX_CALENDAR_DEADLINES.filter(d => d.type === type && !d.done).length;
          const colors: Record<string, string> = {
            filing: "text-red-600",
            extension: "text-purple-600",
            "estimated-tax": "text-blue-600",
            state: "text-amber-600",
          };
          return (
            <Card key={type} className="border-0 shadow-sm">
              <CardContent className="p-4 text-center">
                <p className={`text-2xl font-bold ${colors[type]}`} data-testid={`cal-count-${type}`}>{count}</p>
                <p className="text-xs text-muted-foreground mt-1">{typeLabels[type]} Deadlines</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="space-y-6">
        {months.map(([month, items]) => (
          <div key={month}>
            <h2 className="text-sm font-bold mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-500" /> {month}
            </h2>
            <div className="space-y-2">
              {items.map((dl) => {
                const days = daysUntil(dl.date);
                const isOverdue = days < 0;
                const isUrgent = days >= 0 && days <= 7;
                const isUpcoming = days > 7 && days <= 30;
                return (
                  <div
                    key={dl.id}
                    className={`flex items-center gap-4 p-4 rounded-xl border ${isOverdue ? "border-red-300 bg-red-50/40" : isUrgent ? "border-amber-300 bg-amber-50/30" : "bg-white border-transparent shadow-sm"}`}
                    data-testid={`cal-item-${dl.id}`}
                  >
                    <div className="w-14 text-center shrink-0">
                      <p className="text-lg font-bold">{new Date(dl.date).getDate()}</p>
                      <p className="text-[10px] text-muted-foreground uppercase">{new Date(dl.date).toLocaleDateString("en-US", { weekday: "short" })}</p>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{dl.title}</p>
                      {dl.company && <p className="text-xs text-muted-foreground">{dl.company}</p>}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${typeColors[dl.type]}`}>
                        {typeLabels[dl.type]}
                      </span>
                      {isOverdue && <span className="text-xs font-bold text-red-600">Overdue</span>}
                      {!isOverdue && days <= 30 && (
                        <span className={`text-xs font-bold ${isUrgent ? "text-red-600" : isUpcoming ? "text-amber-600" : "text-muted-foreground"}`}>
                          {days}d
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {completed.length > 0 && (
          <div>
            <h2 className="text-sm font-bold mb-3 flex items-center gap-2 text-muted-foreground">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Completed
            </h2>
            <div className="space-y-2">
              {completed.map((dl) => (
                <div key={dl.id} className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 opacity-60" data-testid={`cal-done-${dl.id}`}>
                  <div className="w-14 text-center shrink-0">
                    <p className="text-lg font-bold">{new Date(dl.date).getDate()}</p>
                    <p className="text-[10px] text-muted-foreground uppercase">{new Date(dl.date).toLocaleDateString("en-US", { weekday: "short" })}</p>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm line-through">{dl.title}</p>
                    {dl.company && <p className="text-xs text-muted-foreground">{dl.company}</p>}
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
