import { useState } from "react";
import { Download, FileSpreadsheet, TrendingUp, TrendingDown, CheckCircle2, XCircle } from "lucide-react";
import { PageTransition, Fade } from "@/components/ui/animated";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { ALL_FINANCE_COMPANIES, financeTransactions, chartOfAccounts } from "@/lib/mock-data-finance";
import { FINANCE_COLOR } from "@/lib/finance-config";
import { PageShell } from "@/components/layout";

const USD_RATE = 83.20;

function getCompany(id: string) {
  return ALL_FINANCE_COMPANIES.find(c => c.id === id)!;
}

function toINR(amount: number, currency: string) {
  return currency === "USD" ? amount * USD_RATE : amount;
}

function fmtINR(v: number, currency = "INR") {
  const abs = Math.abs(v);
  const sym = currency === "USD" ? "$" : "₹";
  if (abs >= 100000) return `${sym}${(abs / 100000).toFixed(1)}L`;
  if (abs >= 1000) return `${sym}${(abs / 1000).toFixed(0)}K`;
  return `${sym}${abs.toFixed(0)}`;
}

function computePL(companyId: string) {
  const txs = companyId === "all"
    ? financeTransactions
    : financeTransactions.filter(t => t.companyId === companyId);

  const currentTxs = txs.filter(t => t.date >= "2026-02-01");
  const priorTxs = txs.filter(t => t.date >= "2026-01-01" && t.date < "2026-02-01");

  const income = (list: typeof txs) => list.filter(t => t.type === "income" || t.type === "cash-in").reduce((s, t) => s + toINR(t.amount, t.currency), 0);
  const expense = (list: typeof txs) => list.filter(t => t.type === "expense" || t.type === "cash-out").reduce((s, t) => s + toINR(t.amount, t.currency), 0);

  return {
    currentIncome: income(currentTxs),
    priorIncome: income(priorTxs),
    currentExpense: expense(currentTxs),
    priorExpense: expense(priorTxs),
  };
}

function variance(current: number, prior: number) {
  if (prior === 0) return current > 0 ? 100 : 0;
  return ((current - prior) / prior) * 100;
}

const INCOME_CATEGORIES = ["Service Revenue", "Product Sales", "Wholesale Revenue – Faire", "Commission Income", "Forex Gain"];
const EXPENSE_CATEGORIES = ["Salaries", "Office Rent", "Marketing", "Platform Fees", "Software", "Professional Fees", "COGS", "Utilities", "Bank Charges", "Forex Loss", "Depreciation", "Tax Payment", "Compliance"];

export default function FinanceReports() {
  const isLoading = useSimulatedLoading(600);
  const [companyFilter, setCompanyFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("pl");

  const showConsolidated = companyFilter === "all";
  const companies = showConsolidated ? ALL_FINANCE_COMPANIES : [getCompany(companyFilter)];

  const plData = companies.map(co => ({ company: co, ...computePL(co.id) }));
  const totalCurrentIncome = plData.reduce((s, d) => s + d.currentIncome, 0);
  const totalCurrentExpense = plData.reduce((s, d) => s + d.currentExpense, 0);
  const totalCurrentNet = totalCurrentIncome - totalCurrentExpense;

  function getCategoryAmount(category: string, companyId: string) {
    const txs = financeTransactions.filter(t => {
      const matchCo = companyId === "all" || t.companyId === companyId;
      const matchCat = t.category.toLowerCase().includes(category.toLowerCase()) || category.toLowerCase().includes(t.category.toLowerCase());
      return matchCo && matchCat && t.date >= "2026-02-01";
    });
    return txs.reduce((s, t) => s + toINR(t.amount, t.currency), 0);
  }

  if (isLoading) {
    return (
      <PageShell>
        <div className="h-10 bg-muted rounded w-64" />
        <div className="h-12 bg-muted rounded" />
        <div className="h-96 bg-muted rounded-xl" />
      </PageShell>
    );
  }

  return (
    <PageTransition className="px-16 py-6 lg:px-24 space-y-5">
      <Fade>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Financial Reports</h1>
            <p className="text-sm text-muted-foreground">P&L · Balance Sheet · Cash Flow · Trial Balance — per entity or consolidated</p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={companyFilter} onValueChange={setCompanyFilter} data-testid="select-company">
              <SelectTrigger className="w-52"><SelectValue placeholder="Consolidated" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Consolidated (All 4)</SelectItem>
                {ALL_FINANCE_COMPANIES.map(c => <SelectItem key={c.id} value={c.id}>{c.shortName} – {c.name.split(" ")[0]}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" data-testid="btn-export-pdf"><Download className="h-4 w-4 mr-1" />PDF</Button>
            <Button variant="outline" size="sm" data-testid="btn-export-excel"><FileSpreadsheet className="h-4 w-4 mr-1" />Excel</Button>
          </div>
        </div>
        {showConsolidated && (
          <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mt-2">
            <span className="font-semibold">Consolidated view:</span> USD entities (NEOM, CLOUD) converted to INR @ ₹83.20/USD
          </div>
        )}
      </Fade>

      <Fade>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="pl" data-testid="tab-pl">P&L</TabsTrigger>
            <TabsTrigger value="bs" data-testid="tab-bs">Balance Sheet</TabsTrigger>
            <TabsTrigger value="cf" data-testid="tab-cf">Cash Flow</TabsTrigger>
            <TabsTrigger value="tb" data-testid="tab-tb">Trial Balance</TabsTrigger>
          </TabsList>

          <TabsContent value="pl">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Profit & Loss — Feb 2026</CardTitle>
                  {showConsolidated && <Badge variant="outline" className="text-xs" style={{ borderColor: FINANCE_COLOR, color: FINANCE_COLOR }}>Consolidated</Badge>}
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b bg-muted/40">
                      <th className="text-left px-4 py-2 text-muted-foreground font-medium">Account</th>
                      {showConsolidated
                        ? ALL_FINANCE_COMPANIES.map(co => <th key={co.id} className="text-right px-3 py-2 text-muted-foreground font-medium"><span className={`font-semibold px-1.5 py-0.5 rounded ${co.badgeBg} ${co.badgeText}`}>{co.shortName}</span></th>)
                        : null}
                      <th className="text-right px-4 py-2 text-muted-foreground font-medium">Current</th>
                      <th className="text-right px-4 py-2 text-muted-foreground font-medium">Prior</th>
                      <th className="text-right px-4 py-2 text-muted-foreground font-medium">Variance</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-emerald-50/40 border-b">
                      <td colSpan={showConsolidated ? ALL_FINANCE_COMPANIES.length + 4 : 4} className="px-4 py-2 font-semibold text-emerald-700 text-xs uppercase">Income</td>
                    </tr>
                    {INCOME_CATEGORIES.map(cat => {
                      const amounts = companies.map(co => getCategoryAmount(cat, co.id));
                      const total = amounts.reduce((s, a) => s + a, 0);
                      if (total === 0) return null;
                      return (
                        <tr key={cat} className="border-b hover:bg-muted/20">
                          <td className="px-4 py-2 pl-6">{cat}</td>
                          {showConsolidated && amounts.map((a, i) => (
                            <td key={i} className="px-3 py-2 text-right text-emerald-700">{a > 0 ? fmtINR(a) : "—"}</td>
                          ))}
                          <td className="px-4 py-2 text-right font-semibold text-emerald-700">{fmtINR(total)}</td>
                          <td className="px-4 py-2 text-right text-muted-foreground">{fmtINR(total * 0.85)}</td>
                          <td className="px-4 py-2 text-right text-emerald-700 font-medium">+17.6%</td>
                        </tr>
                      );
                    })}
                    <tr className="border-b bg-emerald-50">
                      <td className="px-4 py-2 font-semibold text-emerald-700">Total Income</td>
                      {showConsolidated && plData.map(d => <td key={d.company.id} className="px-3 py-2 text-right font-semibold text-emerald-700">{fmtINR(d.currentIncome)}</td>)}
                      <td className="px-4 py-2 text-right font-bold text-emerald-700">{fmtINR(totalCurrentIncome)}</td>
                      <td className="px-4 py-2 text-right text-emerald-700">{fmtINR(totalCurrentIncome * 0.87)}</td>
                      <td className="px-4 py-2 text-right text-emerald-700 font-semibold">+14.9%</td>
                    </tr>

                    <tr className="bg-red-50/40 border-b border-t">
                      <td colSpan={showConsolidated ? ALL_FINANCE_COMPANIES.length + 4 : 4} className="px-4 py-2 font-semibold text-red-600 text-xs uppercase">Expenses</td>
                    </tr>
                    {EXPENSE_CATEGORIES.map(cat => {
                      const amounts = companies.map(co => getCategoryAmount(cat, co.id));
                      const total = amounts.reduce((s, a) => s + a, 0);
                      if (total === 0) return null;
                      return (
                        <tr key={cat} className="border-b hover:bg-muted/20">
                          <td className="px-4 py-2 pl-6">{cat}</td>
                          {showConsolidated && amounts.map((a, i) => (
                            <td key={i} className="px-3 py-2 text-right text-red-600">{a > 0 ? fmtINR(a) : "—"}</td>
                          ))}
                          <td className="px-4 py-2 text-right font-semibold text-red-600">{fmtINR(total)}</td>
                          <td className="px-4 py-2 text-right text-muted-foreground">{fmtINR(total * 0.9)}</td>
                          <td className="px-4 py-2 text-right text-red-600 font-medium">+11.1%</td>
                        </tr>
                      );
                    })}
                    <tr className="border-b bg-red-50">
                      <td className="px-4 py-2 font-semibold text-red-600">Total Expenses</td>
                      {showConsolidated && plData.map(d => <td key={d.company.id} className="px-3 py-2 text-right font-semibold text-red-600">{fmtINR(d.currentExpense)}</td>)}
                      <td className="px-4 py-2 text-right font-bold text-red-600">{fmtINR(totalCurrentExpense)}</td>
                      <td className="px-4 py-2 text-right text-red-600">{fmtINR(totalCurrentExpense * 0.9)}</td>
                      <td className="px-4 py-2 text-right text-red-600 font-semibold">+11.1%</td>
                    </tr>

                    <tr className={`border-t-2 ${totalCurrentNet >= 0 ? "bg-emerald-50" : "bg-red-50"}`}>
                      <td className="px-4 py-3 font-bold text-sm">Net Profit / Loss</td>
                      {showConsolidated && plData.map(d => {
                        const net = d.currentIncome - d.currentExpense;
                        return <td key={d.company.id} className={`px-3 py-3 text-right font-bold ${net >= 0 ? "text-emerald-700" : "text-red-600"}`}>{fmtINR(net)}</td>;
                      })}
                      <td className={`px-4 py-3 text-right font-bold text-base ${totalCurrentNet >= 0 ? "text-emerald-700" : "text-red-600"}`}>{fmtINR(totalCurrentNet)}</td>
                      <td className="px-4 py-3 text-right font-semibold">{fmtINR((totalCurrentIncome - totalCurrentExpense) * 0.85)}</td>
                      <td className={`px-4 py-3 text-right font-semibold ${totalCurrentNet >= 0 ? "text-emerald-700" : "text-red-600"}`}>
                        {totalCurrentNet >= 0 ? <TrendingUp className="inline h-4 w-4 mr-1" /> : <TrendingDown className="inline h-4 w-4 mr-1" />}+17.6%
                      </td>
                    </tr>
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bs">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Balance Sheet — As of Feb 28, 2026</CardTitle>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span className="text-xs text-emerald-700 font-medium">Assets = Liabilities + Equity</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {["asset", "liability", "equity"].map(type => {
                  const accounts = chartOfAccounts.filter(a => a.type === type && (companyFilter === "all" || a.companyId === companyFilter || a.companyId === "all"));
                  const total = accounts.reduce((s, a) => s + a.openingBalance, 0);
                  const typeLabel = type === "asset" ? "Assets" : type === "liability" ? "Liabilities" : "Equity";
                  const typeColor = type === "asset" ? "text-sky-700 bg-sky-50" : type === "liability" ? "text-red-700 bg-red-50" : "text-violet-700 bg-violet-50";
                  return (
                    <div key={type}>
                      <div className={`px-4 py-2 text-xs font-semibold uppercase border-b border-t ${typeColor}`}>{typeLabel}</div>
                      <table className="w-full text-xs">
                        <tbody>
                          {accounts.map(acc => (
                            <tr key={acc.id} className="border-b hover:bg-muted/20">
                              <td className="px-4 py-2 pl-6">
                                <span className="text-muted-foreground/60 mr-2">{acc.code}</span>{acc.name}
                              </td>
                              {showConsolidated && ALL_FINANCE_COMPANIES.map(co => {
                                const matches = acc.companyId === co.id || acc.companyId === "all";
                                return <td key={co.id} className="px-3 py-2 text-right text-muted-foreground text-xs">{matches && acc.openingBalance > 0 ? fmtINR(acc.openingBalance) : "—"}</td>;
                              })}
                              <td className="px-4 py-2 text-right font-medium">{acc.openingBalance > 0 ? fmtINR(acc.openingBalance) : "—"}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="border-t-2 bg-muted/20 font-semibold">
                            <td className="px-4 py-2">Total {typeLabel}</td>
                            {showConsolidated && ALL_FINANCE_COMPANIES.map(co => <td key={co.id} className="px-3 py-2" />)}
                            <td className="px-4 py-2 text-right">{fmtINR(total)}</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cf">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Cash Flow Statement — Feb 2026</CardTitle>
              </CardHeader>
              <CardContent>
                {[
                  {
                    title: "Operating Activities", color: "text-emerald-700", items: [
                      { label: "Cash received from customers", amount: totalCurrentIncome * 0.85 },
                      { label: "Cash paid to suppliers & employees", amount: -(totalCurrentExpense * 0.9) },
                      { label: "Tax payments (GST, TDS)", amount: -56500 },
                      { label: "Net cash from operating", amount: totalCurrentIncome * 0.85 - totalCurrentExpense * 0.9 - 56500, bold: true },
                    ]
                  },
                  {
                    title: "Investing Activities", color: "text-sky-700", items: [
                      { label: "Purchase of equipment", amount: -0 },
                      { label: "Security deposits paid", amount: -0 },
                      { label: "Net cash from investing", amount: 0, bold: true },
                    ]
                  },
                  {
                    title: "Financing Activities", color: "text-violet-700", items: [
                      { label: "Director loan repayment", amount: -50000 },
                      { label: "Owner's draw (Neom LLC)", amount: -415000 },
                      { label: "Net cash from financing", amount: -465000, bold: true },
                    ]
                  },
                ].map(section => (
                  <div key={section.title} className="mb-6">
                    <p className={`text-xs font-semibold uppercase mb-2 ${section.color}`}>{section.title}</p>
                    <table className="w-full text-xs border rounded-lg overflow-hidden">
                      <tbody>
                        {section.items.map((item, i) => (
                          <tr key={i} className={`border-b last:border-0 ${item.bold ? "bg-muted/30 font-semibold border-t-2" : "hover:bg-muted/20"}`}>
                            <td className="px-4 py-2">{item.label}</td>
                            <td className={`px-4 py-2 text-right font-medium ${item.amount >= 0 ? "text-emerald-700" : "text-red-600"}`}>
                              {item.amount === 0 ? "—" : fmtINR(Math.abs(item.amount))}
                              {item.amount !== 0 && <span className="text-muted-foreground ml-1">{item.amount < 0 ? "(outflow)" : ""}</span>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}
                <div className="border-t-2 pt-4 space-y-1 text-sm">
                  <div className="flex justify-between"><span className="font-medium">Opening Cash Balance (Feb 1)</span><span className="font-bold">₹6.60L</span></div>
                  <div className="flex justify-between text-emerald-700"><span className="font-medium">Net Increase in Cash</span><span className="font-bold">+{fmtINR(totalCurrentIncome - totalCurrentExpense - 465000)}</span></div>
                  <div className="flex justify-between border-t pt-2"><span className="font-semibold">Closing Cash Balance (Feb 28)</span><span className="font-bold" style={{ color: FINANCE_COLOR }}>{fmtINR(660000 + totalCurrentIncome - totalCurrentExpense - 465000)}</span></div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tb">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Trial Balance — Feb 28, 2026</CardTitle>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span className="text-xs text-emerald-700 font-medium">Total Dr = Total Cr ✓</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b bg-muted/40">
                      <th className="text-left px-4 py-2 text-muted-foreground font-medium">Code</th>
                      <th className="text-left px-4 py-2 text-muted-foreground font-medium">Account Name</th>
                      <th className="text-left px-4 py-2 text-muted-foreground font-medium">Type</th>
                      <th className="text-right px-4 py-2 text-muted-foreground font-medium text-emerald-700">Dr Balance</th>
                      <th className="text-right px-4 py-2 text-muted-foreground font-medium text-red-600">Cr Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {chartOfAccounts.filter(a => a.openingBalance > 0 && (companyFilter === "all" || a.companyId === companyFilter || a.companyId === "all")).map(acc => {
                      const isDrAccount = acc.type === "asset" || acc.type === "expense";
                      return (
                        <tr key={acc.id} className="border-b hover:bg-muted/20">
                          <td className="px-4 py-2 text-muted-foreground">{acc.code}</td>
                          <td className="px-4 py-2">{acc.name}</td>
                          <td className="px-4 py-2 capitalize text-muted-foreground">{acc.type}</td>
                          <td className="px-4 py-2 text-right font-medium text-emerald-700">{isDrAccount ? fmtINR(acc.openingBalance) : ""}</td>
                          <td className="px-4 py-2 text-right font-medium text-red-600">{!isDrAccount ? fmtINR(acc.openingBalance) : ""}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 bg-muted/30 font-bold">
                      <td colSpan={3} className="px-4 py-3">Total</td>
                      <td className="px-4 py-3 text-right text-emerald-700">
                        {fmtINR(chartOfAccounts.filter(a => (a.type === "asset" || a.type === "expense") && (companyFilter === "all" || a.companyId === companyFilter || a.companyId === "all")).reduce((s, a) => s + a.openingBalance, 0))}
                      </td>
                      <td className="px-4 py-3 text-right text-red-600">
                        {fmtINR(chartOfAccounts.filter(a => (a.type === "liability" || a.type === "equity" || a.type === "revenue") && (companyFilter === "all" || a.companyId === companyFilter || a.companyId === "all")).reduce((s, a) => s + a.openingBalance, 0))}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </Fade>
    </PageTransition>
  );
}
