import { Plus, Info } from "lucide-react";
import { PersonCell } from "@/components/ui/avatar-cells";
import { PageTransition, Fade, Stagger, StaggerItem } from "@/components/ui/animated";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { ALL_FINANCE_COMPANIES, sharedExpenseRules, sharedExpenseHistory } from "@/lib/mock-data-finance";
import { FINANCE_COLOR } from "@/lib/finance-config";
import { PageShell } from "@/components/layout";


function getCompany(id: string) {
  return ALL_FINANCE_COMPANIES.find(c => c.id === id)!;
}

function fmtINR(v: number) {
  if (v >= 1000) return `₹${(v / 1000).toFixed(0)}K`;
  return `₹${v}`;
}

const months = Array.from(new Set(sharedExpenseHistory.map(h => h.month))).sort().reverse();
const currentMonthTotal = sharedExpenseHistory.filter(h => h.month === months[0]).reduce((s, h) => s + h.totalAmount, 0);

const companyCurrentMonth = ALL_FINANCE_COMPANIES.map(co => {
  const total = sharedExpenseHistory.filter(h => h.month === months[0]).reduce((s, h) => {
    const alloc = h.allocations.find(a => a.companyId === co.id);
    return s + (alloc?.amount ?? 0);
  }, 0);
  return { company: co, total };
}).filter(c => c.total > 0);

export default function FinanceSharedExpenses() {
  const isLoading = useSimulatedLoading(500);

  if (isLoading) {
    return (
      <PageShell>
        <div className="h-10 bg-muted rounded w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(5)].map((_, i) => <div key={i} className="h-40 bg-muted rounded-xl" />)}
        </div>
        <div className="h-64 bg-muted rounded-xl" />
      </PageShell>
    );
  }

  return (
    <PageTransition className="px-16 py-6 lg:px-24 space-y-5">
      <Fade>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Shared Expenses</h1>
            <p className="text-sm text-muted-foreground">Allocation rules + monthly split history across entities</p>
          </div>
          <Button style={{ backgroundColor: FINANCE_COLOR }} className="text-white" data-testid="btn-add-rule">
            <Plus className="h-4 w-4 mr-1" />Add Rule
          </Button>
        </div>
      </Fade>

      <Fade>
        <div className="rounded-xl border bg-amber-50 p-4 flex gap-3">
          <Info className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-sm text-amber-900 leading-relaxed">
            <strong>Office rent</strong> and utilities at the Gurugram office (Plot 42, Sector 18) are shared between <strong>Lumbee International (60%)</strong> and <strong>Startup Squad (40%)</strong>. Pan-company costs like CA accounting fees are split equally across all 4 entities. Monthly journal entries are auto-generated from these rules.
          </div>
        </div>
      </Fade>

      <Fade>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Allocation Rules</h2>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>Current month total: <strong className="text-foreground">{fmtINR(currentMonthTotal)}</strong></span>
            {companyCurrentMonth.map(c => (
              <span key={c.company.id}>
                <span className={`font-semibold px-1.5 py-0.5 rounded ${c.company.badgeBg} ${c.company.badgeText}`}>{c.company.shortName}</span>
                {" "}<strong>{fmtINR(c.total)}</strong>
              </span>
            ))}
          </div>
        </div>
      </Fade>

      <Stagger className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sharedExpenseRules.map(rule => (
          <StaggerItem key={rule.id}>
            <Card data-testid={`rule-card-${rule.id}`} className="border hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-sm">{rule.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{rule.description}</p>
                  </div>
                  <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-xs" variant="outline">Active</Badge>
                </div>
                <div className="flex items-center justify-between mb-3">
                  <Badge variant="outline" className="text-xs">{rule.category}</Badge>
                  <span className="text-sm font-bold">{fmtINR(rule.totalAmount)} <span className="text-xs font-normal text-muted-foreground">/ {rule.frequency}</span></span>
                </div>
                <div className="mb-3">
                  <div className="flex h-5 rounded-full overflow-hidden gap-0.5">
                    {rule.allocations.map(alloc => {
                      const co = getCompany(alloc.companyId);
                      return (
                        <div
                          key={alloc.companyId}
                          data-testid={`alloc-bar-${rule.id}-${alloc.companyId}`}
                          className="flex items-center justify-center text-white text-xs font-semibold transition-all"
                          style={{ width: `${alloc.percentage}%`, backgroundColor: co.color }}
                          title={`${co.shortName}: ${alloc.percentage}%`}
                        >
                          {alloc.percentage >= 20 && `${alloc.percentage}%`}
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="space-y-1">
                  {rule.allocations.map(alloc => {
                    const co = getCompany(alloc.companyId);
                    return (
                      <div key={alloc.companyId} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: co.color }} />
                          <span className={`font-semibold px-1.5 py-0.5 rounded ${co.badgeBg} ${co.badgeText}`}>{co.shortName}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-semibold">{fmtINR(alloc.amount)}</span>
                          <span className="text-muted-foreground ml-1">({alloc.percentage}%)</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center gap-1.5 mt-3 text-xs text-muted-foreground">
                  <span>Effective from {rule.effectiveFrom} · Approved by</span>
                  <PersonCell name={rule.approvedBy} size="xs" />
                </div>
              </CardContent>
            </Card>
          </StaggerItem>
        ))}
      </Stagger>

      <Fade>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Monthly History</h2>
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="text-left px-4 py-2 text-muted-foreground font-medium">Month</th>
                  <th className="text-left px-4 py-2 text-muted-foreground font-medium">Rule</th>
                  <th className="text-right px-4 py-2 text-muted-foreground font-medium">Total</th>
                  {ALL_FINANCE_COMPANIES.map(co => (
                    <th key={co.id} className="text-right px-3 py-2 text-muted-foreground font-medium">{co.shortName}</th>
                  ))}
                  <th className="text-left px-4 py-2 text-muted-foreground font-medium">JE Ref</th>
                  <th className="text-left px-4 py-2 text-muted-foreground font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {months.map(month => {
                  const monthEntries = sharedExpenseHistory.filter(h => h.month === month);
                  return monthEntries.map((entry, idx) => (
                    <tr key={entry.id} data-testid={`history-row-${entry.id}`} className={`border-b hover:bg-muted/20 last:border-0 ${idx === 0 ? "border-t-2 border-muted" : ""}`}>
                      <td className="px-4 py-2.5 font-medium text-muted-foreground">{idx === 0 ? month : ""}</td>
                      <td className="px-4 py-2.5 font-medium">{entry.ruleName}</td>
                      <td className="px-4 py-2.5 text-right font-semibold">{fmtINR(entry.totalAmount)}</td>
                      {ALL_FINANCE_COMPANIES.map(co => {
                        const alloc = entry.allocations.find(a => a.companyId === co.id);
                        return (
                          <td key={co.id} className="px-3 py-2.5 text-right">
                            {alloc ? <span className="font-medium">{fmtINR(alloc.amount)}</span> : <span className="text-muted-foreground/40">—</span>}
                          </td>
                        );
                      })}
                      <td className="px-4 py-2.5 text-muted-foreground">{entry.journalEntryRef}</td>
                      <td className="px-4 py-2.5">
                        <Badge variant="outline" className={`text-xs ${entry.status === "allocated" ? "border-emerald-300 text-emerald-700" : "border-amber-300 text-amber-700"}`}>
                          {entry.status}
                        </Badge>
                      </td>
                    </tr>
                  ));
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </Fade>
    </PageTransition>
  );
}
