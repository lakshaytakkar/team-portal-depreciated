import { useState } from "react";
import { Plus, Wallet, TrendingUp, TrendingDown } from "lucide-react";
import { PageTransition, Fade } from "@/components/ui/animated";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { ALL_FINANCE_COMPANIES, cashBookEntries } from "@/lib/mock-data-finance";
import { FINANCE_COLOR } from "@/lib/finance-config";
import { PageShell } from "@/components/layout";


function getCompany(id: string) {
  return ALL_FINANCE_COMPANIES.find(c => c.id === id)!;
}

function fmtINR(v: number) {
  if (v >= 100000) return `₹${(v / 100000).toFixed(1)}L`;
  if (v >= 1000) return `₹${(v / 1000).toFixed(0)}K`;
  return `₹${v.toFixed(0)}`;
}

const CATEGORY_STYLES: Record<string, string> = {
  "Petty Expense": "bg-slate-100 text-slate-600",
  "Client Payment": "bg-emerald-100 text-emerald-700",
  "Cash Advance": "bg-sky-100 text-sky-700",
  "Cash Sale": "bg-violet-100 text-violet-700",
  "Cash Settlement": "bg-orange-100 text-orange-700",
  "Advance Return": "bg-teal-100 text-teal-700",
};

function groupByDate(entries: typeof cashBookEntries) {
  const map: Record<string, typeof cashBookEntries> = {};
  entries.forEach(e => {
    if (!map[e.date]) map[e.date] = [];
    map[e.date].push(e);
  });
  return Object.entries(map).sort(([a], [b]) => b.localeCompare(a));
}

export default function FinanceCashBook() {
  const isLoading = useSimulatedLoading(500);
  const [companyFilter, setCompanyFilter] = useState("all");
  const [period, setPeriod] = useState("month");

  const periodFilter = (date: string) => {
    if (period === "week") return date >= "2026-02-22";
    if (period === "month") return date >= "2026-02-01";
    return true;
  };

  const filtered = cashBookEntries.filter(e => {
    if (companyFilter !== "all" && e.companyId !== companyFilter) return false;
    if (!periodFilter(e.date)) return false;
    return true;
  });

  const currentCash = filtered.length > 0 ? filtered.sort((a, b) => b.date.localeCompare(a.date))[0].runningBalance : 0;
  const totalIn = filtered.filter(e => e.type === "in").reduce((s, e) => s + e.amount, 0);
  const totalOut = filtered.filter(e => e.type === "out").reduce((s, e) => s + e.amount, 0);

  const grouped = groupByDate(filtered);

  if (isLoading) {
    return (
      <PageShell>
        <div className="h-10 bg-muted rounded w-64" />
        <div className="h-24 bg-muted rounded-xl" />
        <div className="h-96 bg-muted rounded-xl" />
      </PageShell>
    );
  }

  return (
    <PageTransition className="px-16 py-6 lg:px-24 space-y-5">
      <Fade>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Cash Book</h1>
            <p className="text-sm text-muted-foreground">Petty cash, cash sales, settlements and advances</p>
          </div>
          <div className="flex gap-2">
            <Select value={companyFilter} onValueChange={setCompanyFilter} data-testid="select-company">
              <SelectTrigger className="w-44"><SelectValue placeholder="All Companies" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Companies</SelectItem>
                {ALL_FINANCE_COMPANIES.map(c => <SelectItem key={c.id} value={c.id}>{c.shortName}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button style={{ backgroundColor: FINANCE_COLOR }} className="text-white" data-testid="btn-new-cash-entry">
              <Plus className="h-4 w-4 mr-1" />New Entry
            </Button>
          </div>
        </div>
      </Fade>

      <Fade>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-emerald-200 bg-emerald-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Wallet className="h-5 w-5 text-emerald-600" />
                <p className="text-xs text-emerald-700 font-medium">Cash in Hand</p>
              </div>
              <p className="text-2xl font-bold text-emerald-700">₹{currentCash.toLocaleString("en-IN")}</p>
              <p className="text-xs text-emerald-600/70 mt-1">As of Feb 28, 2026</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-5 w-5 text-emerald-600" />
                <p className="text-xs text-muted-foreground">Total Cash In</p>
              </div>
              <p className="text-2xl font-bold text-emerald-700">{fmtINR(totalIn)}</p>
              <p className="text-xs text-muted-foreground mt-1">Receipts this {period}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <TrendingDown className="h-5 w-5 text-red-500" />
                <p className="text-xs text-muted-foreground">Total Cash Out</p>
              </div>
              <p className="text-2xl font-bold text-red-600">{fmtINR(totalOut)}</p>
              <p className="text-xs text-muted-foreground mt-1">Payments this {period}</p>
            </CardContent>
          </Card>
        </div>
      </Fade>

      <Fade>
        <div className="flex items-center gap-2">
          {[{ id: "week", label: "This Week" }, { id: "month", label: "This Month" }, { id: "all", label: "All" }].map(p => (
            <button
              key={p.id}
              onClick={() => setPeriod(p.id)}
              data-testid={`pill-period-${p.id}`}
              className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors ${period === p.id ? "text-white border-transparent" : "bg-background border-muted-foreground/20 text-muted-foreground"}`}
              style={period === p.id ? { backgroundColor: FINANCE_COLOR } : undefined}
            >{p.label}</button>
          ))}
        </div>
      </Fade>

      <Fade>
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="text-left px-4 py-2 text-muted-foreground font-medium">Date</th>
                  <th className="text-left px-4 py-2 text-muted-foreground font-medium">Voucher</th>
                  <th className="text-left px-4 py-2 text-muted-foreground font-medium">Description</th>
                  <th className="text-left px-4 py-2 text-muted-foreground font-medium">Entity</th>
                  <th className="text-left px-4 py-2 text-muted-foreground font-medium">Category</th>
                  <th className="text-right px-4 py-2 text-muted-foreground font-medium text-emerald-700">Cash In</th>
                  <th className="text-right px-4 py-2 text-muted-foreground font-medium text-red-600">Cash Out</th>
                  <th className="text-right px-4 py-2 text-muted-foreground font-medium">Balance</th>
                  <th className="text-left px-4 py-2 text-muted-foreground font-medium">By</th>
                </tr>
              </thead>
              <tbody>
                {grouped.length === 0 && (
                  <tr><td colSpan={9} className="px-4 py-8 text-center text-muted-foreground">No entries found</td></tr>
                )}
                {grouped.map(([date, entries]) => (
                  <>
                    <tr key={`header-${date}`} className="bg-muted/20 border-b border-t">
                      <td colSpan={9} className="px-4 py-1.5">
                        <span className="text-xs font-semibold text-muted-foreground">{date}</span>
                      </td>
                    </tr>
                    {entries.sort((a, b) => b.reference.localeCompare(a.reference)).map(entry => {
                      const company = getCompany(entry.companyId);
                      return (
                        <tr key={entry.id} data-testid={`cashbook-row-${entry.id}`} className="border-b hover:bg-muted/20 last:border-0">
                          <td className="px-4 py-2 text-muted-foreground">{entry.date}</td>
                          <td className="px-4 py-2 text-muted-foreground/70">{entry.reference}</td>
                          <td className="px-4 py-2 max-w-xs truncate">{entry.description}</td>
                          <td className="px-4 py-2">
                            <span className={`font-semibold px-1.5 py-0.5 rounded ${company.badgeBg} ${company.badgeText}`}>{company.shortName}</span>
                          </td>
                          <td className="px-4 py-2">
                            <span className={`px-1.5 py-0.5 rounded ${CATEGORY_STYLES[entry.category] ?? "bg-slate-100 text-slate-600"}`}>{entry.category}</span>
                          </td>
                          <td className="px-4 py-2 text-right font-semibold text-emerald-700">{entry.type === "in" ? `₹${entry.amount.toLocaleString("en-IN")}` : ""}</td>
                          <td className="px-4 py-2 text-right font-semibold text-red-600">{entry.type === "out" ? `₹${entry.amount.toLocaleString("en-IN")}` : ""}</td>
                          <td className="px-4 py-2 text-right font-bold">₹{entry.runningBalance.toLocaleString("en-IN")}</td>
                          <td className="px-4 py-2 text-muted-foreground">{entry.enteredBy.split(" ")[0]}</td>
                        </tr>
                      );
                    })}
                  </>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 bg-muted/30 font-semibold">
                  <td colSpan={5} className="px-4 py-2 text-muted-foreground">Monthly Total</td>
                  <td className="px-4 py-2 text-right text-emerald-700">{fmtINR(totalIn)}</td>
                  <td className="px-4 py-2 text-right text-red-600">{fmtINR(totalOut)}</td>
                  <td className="px-4 py-2 text-right" style={{ color: FINANCE_COLOR }}>{fmtINR(totalIn - totalOut)}</td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        </Card>
      </Fade>
    </PageTransition>
  );
}
