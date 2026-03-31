import { useState } from "react";
import { ArrowRight, RefreshCw, Info } from "lucide-react";
import { PageTransition, Fade, Stagger, StaggerItem } from "@/components/ui/animated";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { ALL_FINANCE_COMPANIES, interCompanyBalances, exchangeRates } from "@/lib/mock-data-finance";
import { FINANCE_COLOR } from "@/lib/finance-config";
import { PageShell } from "@/components/layout";

const RATE = exchangeRates[0].rate;

function getCompany(id: string) {
  return ALL_FINANCE_COMPANIES.find(c => c.id === id)!;
}

function fmtINR(v: number) {
  if (v >= 100000) return `₹${(v / 100000).toFixed(1)}L`;
  if (v >= 1000) return `₹${(v / 1000).toFixed(0)}K`;
  return `₹${v.toFixed(0)}`;
}

function daysSince(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date("2026-03-01");
  return Math.ceil((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
}

const IDS = ALL_FINANCE_COMPANIES.map(c => c.id);

function getMatrixBalance(from: string, to: string) {
  return interCompanyBalances.filter(b => b.fromCompany === from && b.toCompany === to && b.status !== "settled").reduce((s, b) => s + b.inrEquivalent, 0);
}

const openBalances = interCompanyBalances.filter(b => b.status !== "settled");
const settledBalances = interCompanyBalances.filter(b => b.status === "settled");

export default function FinanceIntercompany() {
  const isLoading = useSimulatedLoading(600);
  const [statusFilter, setStatusFilter] = useState("active");

  const shown = statusFilter === "settled" ? settledBalances : statusFilter === "all" ? interCompanyBalances : openBalances;

  if (isLoading) {
    return (
      <PageShell>
        <div className="h-10 bg-muted rounded w-64" />
        <div className="h-48 bg-muted rounded-xl" />
        <div className="h-64 bg-muted rounded-xl" />
      </PageShell>
    );
  }

  return (
    <PageTransition className="px-16 py-6 lg:px-24 space-y-5">
      <Fade>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Inter-Company Accounts</h1>
            <p className="text-sm text-muted-foreground">Due-to / Due-from balances across Neom, Cloudnest, SSPL & LIPL</p>
          </div>
          <Button style={{ backgroundColor: FINANCE_COLOR }} className="text-white" data-testid="btn-record-settlement">
            <RefreshCw className="h-4 w-4 mr-1" />Record Settlement
          </Button>
        </div>
      </Fade>

      <Fade>
        <div className="rounded-xl border bg-amber-50 p-4 flex gap-3">
          <Info className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-sm text-amber-900">
            <p className="font-semibold mb-1">How inter-company settlement works</p>
            <p className="text-amber-800 leading-relaxed">When a US client pays <strong>Neom LLC (USD)</strong> for work delivered by <strong>Startup Squad India</strong>, Neom records a "Due-To SSPL" entry. The USD is converted to INR at Wise rate and transferred to SSPL's HDFC account. Similarly, <strong>Cloudnest</strong> (Faire dropshipping) owes revenue to <strong>LIPL</strong> when LIPL handles India-side operations. Office rent and shared costs are recharged between SSPL and LIPL monthly via journal entries.</p>
          </div>
        </div>
      </Fade>

      <Fade>
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">Balance Matrix — Open Positions (INR Equivalent)</CardTitle>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="inline-block w-3 h-3 rounded bg-red-100 border border-red-200" /> Owes money
                <span className="inline-block w-3 h-3 rounded bg-emerald-100 border border-emerald-200 ml-2" /> Is owed
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="text-xs w-full border-collapse">
                <thead>
                  <tr>
                    <th className="px-3 py-2 text-left text-muted-foreground font-medium border-b border-r bg-muted/30">Owes ↓ / Owed By →</th>
                    {ALL_FINANCE_COMPANIES.map(c => (
                      <th key={c.id} className="px-3 py-2 text-center border-b border-r bg-muted/30">
                        <span className={`font-semibold px-1.5 py-0.5 rounded ${c.badgeBg} ${c.badgeText}`}>{c.shortName}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ALL_FINANCE_COMPANIES.map(fromCo => (
                    <tr key={fromCo.id} className="border-b">
                      <td className="px-3 py-2 border-r bg-muted/10">
                        <span className={`font-semibold text-xs px-1.5 py-0.5 rounded ${fromCo.badgeBg} ${fromCo.badgeText}`}>{fromCo.shortName}</span>
                      </td>
                      {ALL_FINANCE_COMPANIES.map(toCo => {
                        if (fromCo.id === toCo.id) {
                          return <td key={toCo.id} className="px-3 py-3 text-center border-r bg-muted/30 text-muted-foreground">—</td>;
                        }
                        const bal = getMatrixBalance(fromCo.id, toCo.id);
                        if (bal === 0) {
                          return <td key={toCo.id} data-testid={`matrix-${fromCo.id}-${toCo.id}`} className="px-3 py-3 text-center border-r text-muted-foreground/40">—</td>;
                        }
                        return (
                          <td key={toCo.id} data-testid={`matrix-${fromCo.id}-${toCo.id}`} className="px-3 py-2 text-center border-r bg-red-50">
                            <span className="font-semibold text-red-700">{fmtINR(bal)}</span>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </Fade>

      <Fade>
        <div className="rounded-lg border bg-muted/20 px-4 py-2 flex items-center gap-4 text-sm">
          <span className="text-muted-foreground font-medium">Exchange Rate:</span>
          <span className="font-bold">1 USD = ₹{RATE.toFixed(2)}</span>
          <span className="text-muted-foreground text-xs">({exchangeRates[0].source}, {exchangeRates[0].date})</span>
        </div>
      </Fade>

      <Fade>
        <div className="flex gap-2 mb-2">
          {[{ id: "active", label: "Open / Partial" }, { id: "settled", label: "Settled" }, { id: "all", label: "All" }].map(s => (
            <button
              key={s.id}
              onClick={() => setStatusFilter(s.id)}
              data-testid={`pill-ic-status-${s.id}`}
              className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors ${statusFilter === s.id ? "text-white border-transparent" : "bg-background border-muted-foreground/20 text-muted-foreground"}`}
              style={statusFilter === s.id ? { backgroundColor: FINANCE_COLOR } : undefined}
            >{s.label}</button>
          ))}
        </div>
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="text-left px-4 py-2 text-muted-foreground font-medium">From → To</th>
                  <th className="text-right px-4 py-2 text-muted-foreground font-medium">Amount</th>
                  <th className="text-right px-4 py-2 text-muted-foreground font-medium">INR Equiv</th>
                  <th className="text-left px-4 py-2 text-muted-foreground font-medium">Description</th>
                  <th className="text-right px-4 py-2 text-muted-foreground font-medium">Age</th>
                  <th className="text-left px-4 py-2 text-muted-foreground font-medium">Status</th>
                  <th className="px-4 py-2" />
                </tr>
              </thead>
              <tbody>
                {shown.map(b => {
                  const from = getCompany(b.fromCompany);
                  const to = getCompany(b.toCompany);
                  const age = daysSince(b.createdDate);
                  return (
                    <tr key={b.id} data-testid={`ic-balance-${b.id}`} className="border-b hover:bg-muted/20 last:border-0">
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-1.5">
                          <span className={`font-semibold px-1.5 py-0.5 rounded ${from.badgeBg} ${from.badgeText}`}>{from.shortName}</span>
                          <ArrowRight className="h-3 w-3 text-muted-foreground" />
                          <span className={`font-semibold px-1.5 py-0.5 rounded ${to.badgeBg} ${to.badgeText}`}>{to.shortName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-right font-semibold">
                        {b.currency === "USD" ? `$${b.amount.toLocaleString()}` : fmtINR(b.amount)}
                      </td>
                      <td className="px-4 py-2.5 text-right font-semibold">{fmtINR(b.inrEquivalent)}</td>
                      <td className="px-4 py-2.5 max-w-xs">
                        <p className="truncate text-muted-foreground">{b.description}</p>
                        {b.lastSettledDate && <p className="text-muted-foreground/60">Last settled: {b.lastSettledDate}</p>}
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <span className={`px-2 py-0.5 rounded-full font-semibold ${age > 60 ? "bg-red-100 text-red-700" : age > 30 ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>{age}d</span>
                      </td>
                      <td className="px-4 py-2.5">
                        <Badge variant="outline" className={`text-xs ${b.status === "open" ? "border-amber-300 text-amber-700" : b.status === "partial" ? "border-sky-300 text-sky-700" : "border-emerald-300 text-emerald-700"}`}>{b.status}</Badge>
                      </td>
                      <td className="px-4 py-2.5">
                        {b.status !== "settled" && <Button variant="outline" size="sm" className="text-xs h-7">Settle</Button>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </Fade>
    </PageTransition>
  );
}
