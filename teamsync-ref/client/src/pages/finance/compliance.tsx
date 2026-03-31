import { useState } from "react";
import { ChevronDown, ChevronRight, AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import { PageTransition, Fade, Stagger, StaggerItem } from "@/components/ui/animated";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { ALL_FINANCE_COMPANIES, complianceFilings } from "@/lib/mock-data-finance";
import { FINANCE_COLOR } from "@/lib/finance-config";
import { PageShell } from "@/components/layout";

const FILING_TYPES = ["All", "GST", "TDS", "ROC", "Income Tax", "IRS", "Wyoming", "Other"];

function getCompany(id: string) {
  return ALL_FINANCE_COMPANIES.find(c => c.id === id)!;
}

function daysUntil(dateStr: string) {
  const due = new Date(dateStr);
  const now = new Date("2026-03-01");
  return Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function DaysPill({ dueDate, status }: { dueDate: string; status: string }) {
  if (status === "filed") return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-xs" variant="outline">Filed</Badge>;
  const days = daysUntil(dueDate);
  if (days < 0) return <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700">{Math.abs(days)}d overdue</span>;
  if (days <= 7) return <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">{days}d left</span>;
  if (days <= 30) return <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">{days}d left</span>;
  return <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">{days}d left</span>;
}

const complianceRules = [
  { type: "GST", title: "GSTR-1 (Outward Supplies)", desc: "Monthly filing due by 11th of next month. Lists all outward taxable supplies. Mandatory for turnover > ₹5Cr." },
  { type: "GST", title: "GSTR-3B (Summary Return)", desc: "Monthly summary return + tax payment due by 20th. Includes input tax credit claims and tax liability." },
  { type: "TDS", title: "TDS Return (Form 26Q)", desc: "Quarterly return. Q1: Jul 31 · Q2: Oct 31 · Q3: Jan 31 · Q4: May 31. Also covers professional fee TDS @10%." },
  { type: "ROC", title: "MGT-7 Annual Return", desc: "Filed with MCA within 60 days of AGM (typically by Nov 29 for March year-end companies)." },
  { type: "IRS", title: "Form 1065 – Partnership Return", desc: "Multi-member LLC taxed as partnership. Due March 15 (or Sept 15 with extension). Includes K-1 for each member." },
  { type: "Wyoming", title: "Wyoming Annual Report", desc: "Due on anniversary of incorporation each year. Online fee: $62. Late penalty: $50 additional." },
];

export default function FinanceCompliance() {
  const isLoading = useSimulatedLoading(600);
  const [companyFilter, setCompanyFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("All");
  const [expandedRules, setExpandedRules] = useState(false);
  const [filedEntries, setFiledEntries] = useState<Set<string>>(new Set());

  const filtered = complianceFilings.filter(f => {
    if (companyFilter !== "all" && f.companyId !== companyFilter) return false;
    if (typeFilter !== "All" && f.type !== typeFilter) return false;
    return true;
  }).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  const companyStats = ALL_FINANCE_COMPANIES.map(co => {
    const items = complianceFilings.filter(f => f.companyId === co.id);
    return {
      company: co,
      total: items.length,
      filed: items.filter(f => f.status === "filed").length,
      pending: items.filter(f => f.status === "pending").length,
      overdue: items.filter(f => f.status === "overdue").length,
    };
  });

  if (isLoading) {
    return (
      <PageShell>
        <div className="h-10 bg-muted rounded w-64" />
        <div className="grid grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-muted rounded-xl" />)}</div>
        <div className="h-96 bg-muted rounded-xl" />
      </PageShell>
    );
  }

  return (
    <PageTransition className="px-16 py-6 lg:px-24 space-y-5">
      <Fade>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Compliance Calendar</h1>
            <p className="text-sm text-muted-foreground">India (GST/TDS/ROC) + US (IRS/Wyoming) filings for all 4 entities</p>
          </div>
        </div>
      </Fade>

      <Stagger className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {companyStats.map(stat => (
          <StaggerItem key={stat.company.id}>
            <Card data-testid={`compliance-stat-${stat.company.id}`} className="border">
              <CardContent className="p-4">
                <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${stat.company.badgeBg} ${stat.company.badgeText}`}>{stat.company.shortName}</span>
                <p className="text-xs text-muted-foreground mt-2 mb-1">{stat.company.name.split(" ").slice(0, 2).join(" ")}</p>
                <div className="space-y-0.5 text-xs">
                  <div className="flex justify-between"><span className="text-muted-foreground">Total</span><span className="font-semibold">{stat.total}</span></div>
                  <div className="flex justify-between"><span className="text-emerald-600">Filed</span><span className="font-semibold text-emerald-700">{stat.filed}</span></div>
                  <div className="flex justify-between"><span className="text-amber-600">Pending</span><span className="font-semibold text-amber-700">{stat.pending}</span></div>
                  {stat.overdue > 0 && <div className="flex justify-between"><span className="text-red-600">Overdue</span><span className="font-semibold text-red-700">{stat.overdue}</span></div>}
                </div>
                <div className={`mt-2 h-1.5 rounded-full overflow-hidden bg-muted`}>
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(stat.filed / stat.total) * 100}%` }} />
                </div>
              </CardContent>
            </Card>
          </StaggerItem>
        ))}
      </Stagger>

      <Fade>
        <div className="flex flex-wrap gap-2 items-center">
          <div className="flex gap-1">
            {[{ id: "all", label: "All" }, ...ALL_FINANCE_COMPANIES.map(c => ({ id: c.id, label: c.shortName }))].map(c => (
              <button
                key={c.id}
                onClick={() => setCompanyFilter(c.id)}
                data-testid={`pill-company-${c.id}`}
                className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors ${companyFilter === c.id ? "text-white border-transparent" : "bg-background border-muted-foreground/20 text-muted-foreground"}`}
                style={companyFilter === c.id ? { backgroundColor: FINANCE_COLOR } : undefined}
              >{c.label}</button>
            ))}
          </div>
          <div className="flex gap-1">
            {FILING_TYPES.map(t => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                data-testid={`pill-type-${t}`}
                className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors ${typeFilter === t ? "text-white border-transparent" : "bg-background border-muted-foreground/20 text-muted-foreground"}`}
                style={typeFilter === t ? { backgroundColor: FINANCE_COLOR } : undefined}
              >{t}</button>
            ))}
          </div>
        </div>
      </Fade>

      <Fade>
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="text-left px-4 py-2 text-muted-foreground font-medium">Entity</th>
                  <th className="text-left px-4 py-2 text-muted-foreground font-medium">Filing</th>
                  <th className="text-left px-4 py-2 text-muted-foreground font-medium">Period</th>
                  <th className="text-left px-4 py-2 text-muted-foreground font-medium">Due Date</th>
                  <th className="text-left px-4 py-2 text-muted-foreground font-medium">Days</th>
                  <th className="text-left px-4 py-2 text-muted-foreground font-medium">Status</th>
                  <th className="text-left px-4 py-2 text-muted-foreground font-medium">Filed</th>
                  <th className="px-4 py-2" />
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr><td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">No filings match filters</td></tr>
                )}
                {filtered.map(f => {
                  const company = getCompany(f.companyId);
                  const isFiled = f.status === "filed" || filedEntries.has(f.id);
                  const isOverdue = f.status === "overdue" && !filedEntries.has(f.id);
                  return (
                    <tr key={f.id} data-testid={`compliance-row-${f.id}`} className={`border-b last:border-0 hover:bg-muted/20 ${isOverdue ? "bg-red-50" : ""}`}>
                      <td className="px-4 py-2.5">
                        <span className={`font-semibold px-1.5 py-0.5 rounded ${company.badgeBg} ${company.badgeText}`}>{company.shortName}</span>
                      </td>
                      <td className="px-4 py-2.5">
                        <p className="font-medium">{f.name}</p>
                        <p className="text-muted-foreground/60">{f.type}</p>
                      </td>
                      <td className="px-4 py-2.5 text-muted-foreground">{f.filingPeriod}</td>
                      <td className="px-4 py-2.5 font-medium">{f.dueDate}</td>
                      <td className="px-4 py-2.5">
                        <DaysPill dueDate={f.dueDate} status={isFiled ? "filed" : f.status} />
                      </td>
                      <td className="px-4 py-2.5">
                        {isFiled
                          ? <div className="flex items-center gap-1 text-emerald-700"><CheckCircle2 className="h-3.5 w-3.5" />Filed</div>
                          : isOverdue
                          ? <div className="flex items-center gap-1 text-red-700"><AlertTriangle className="h-3.5 w-3.5" />Overdue</div>
                          : <div className="flex items-center gap-1 text-amber-700"><Clock className="h-3.5 w-3.5" />Pending</div>}
                        {f.penaltyAmount && !filedEntries.has(f.id) && <p className="text-red-600 font-semibold mt-0.5">Penalty: ${f.penaltyAmount}</p>}
                      </td>
                      <td className="px-4 py-2.5 text-muted-foreground">
                        {isFiled && (
                          <div>
                            <p>{f.filedDate ?? "Today"}</p>
                            <p className="text-muted-foreground/60">{f.filedBy ?? "—"}</p>
                          </div>
                        )}
                        {f.notes && !isFiled && <p className="text-muted-foreground/60 max-w-48 truncate">{f.notes}</p>}
                      </td>
                      <td className="px-4 py-2.5">
                        {!isFiled && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs h-7"
                            onClick={() => setFiledEntries(prev => new Set([...Array.from(prev), f.id]))}
                            data-testid={`btn-mark-filed-${f.id}`}
                          >
                            Mark Filed
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </Fade>

      <Fade>
        <Card>
          <button
            onClick={() => setExpandedRules(v => !v)}
            className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/20 transition-colors"
            data-testid="btn-toggle-rules"
          >
            <span className="text-sm font-semibold">Compliance Reference — Filing Rules & Deadlines</span>
            {expandedRules ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
          </button>
          {expandedRules && (
            <CardContent className="pt-0 grid grid-cols-1 md:grid-cols-2 gap-3">
              {complianceRules.map(rule => (
                <div key={rule.title} className="border rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-xs">{rule.type}</Badge>
                    <p className="text-xs font-semibold">{rule.title}</p>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{rule.desc}</p>
                </div>
              ))}
            </CardContent>
          )}
        </Card>
      </Fade>
    </PageTransition>
  );
}
