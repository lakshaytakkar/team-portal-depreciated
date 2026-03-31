import { useState } from "react";
import { ChevronRight, ChevronDown, Download, FileText } from "lucide-react";
import { PageTransition, Fade } from "@/components/ui/animated";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { ALL_FINANCE_COMPANIES, chartOfAccounts, financeTransactions, type ChartOfAccount } from "@/lib/mock-data-finance";
import { FINANCE_COLOR } from "@/lib/finance-config";
import { PageShell } from "@/components/layout";

const ACCOUNT_TYPE_ORDER = ["asset", "liability", "equity", "revenue", "expense"] as const;
const TYPE_LABELS: Record<string, string> = {
  asset: "Assets", liability: "Liabilities", equity: "Equity", revenue: "Revenue", expense: "Expenses"
};
const TYPE_COLORS: Record<string, string> = {
  asset: "text-sky-700", liability: "text-red-700", equity: "text-violet-700", revenue: "text-emerald-700", expense: "text-orange-700"
};
const TYPE_BG: Record<string, string> = {
  asset: "bg-sky-50", liability: "bg-red-50", equity: "bg-violet-50", revenue: "bg-emerald-50", expense: "bg-orange-50"
};

function fmtAmt(v: number, currency?: string) {
  const sym = currency === "USD" ? "$" : "₹";
  return `${sym}${Math.abs(v).toLocaleString("en-IN")}`;
}

function getAccountTx(accountId: string, companyFilter: string) {
  return financeTransactions.filter(t => t.accountId === accountId && (companyFilter === "all" || t.companyId === companyFilter));
}

function getCompany(id: string) {
  return ALL_FINANCE_COMPANIES.find(c => c.id === id);
}

export default function FinanceLedger() {
  const isLoading = useSimulatedLoading(600);
  const [companyFilter, setCompanyFilter] = useState("all");
  const [selectedAccount, setSelectedAccount] = useState<ChartOfAccount | null>(null);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [showAllAccounts, setShowAllAccounts] = useState(false);

  const filteredAccounts = chartOfAccounts.filter(a => {
    if (companyFilter === "all") return true;
    return a.companyId === companyFilter || a.companyId === "all";
  });

  const hasActivity = (account: ChartOfAccount) => {
    return financeTransactions.some(t => t.accountId === account.id && (companyFilter === "all" || t.companyId === companyFilter));
  };

  const visibleAccounts = showAllAccounts ? filteredAccounts : filteredAccounts.filter(a => hasActivity(a) || a.openingBalance !== 0);

  const toggleGroup = (type: string) => setCollapsed(prev => ({ ...prev, [type]: !prev[type] }));

  const selectedTx = selectedAccount ? getAccountTx(selectedAccount.id, companyFilter) : [];
  let running = selectedAccount?.openingBalance ?? 0;
  const txWithBalance = selectedTx.map(tx => {
    const isDebit = tx.type === "income" || tx.type === "cash-in";
    const dr = isDebit ? tx.amount : 0;
    const cr = isDebit ? 0 : tx.amount;
    running = running + dr - cr;
    return { ...tx, dr, cr, balance: running };
  });

  if (isLoading) {
    return (
      <PageShell>
        <div className="h-10 bg-muted rounded w-64" />
        <div className="flex gap-4">
          <div className="w-64 shrink-0 h-[600px] bg-muted rounded-xl" />
          <div className="flex-1 h-[600px] bg-muted rounded-xl" />
        </div>
      </PageShell>
    );
  }

  return (
    <PageTransition className="px-16 py-6 lg:px-24 space-y-5">
      <Fade>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">General Ledger</h1>
            <p className="text-sm text-muted-foreground">Chart of accounts + transaction-level view per account</p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={companyFilter} onValueChange={v => { setCompanyFilter(v); setSelectedAccount(null); }} data-testid="select-company">
              <SelectTrigger className="w-52">
                <SelectValue placeholder="All Companies" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Companies</SelectItem>
                {ALL_FINANCE_COMPANIES.map(c => <SelectItem key={c.id} value={c.id}>{c.shortName} – {c.name.split(" ")[0]}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-1" />Export</Button>
          </div>
        </div>
      </Fade>

      <div className="flex gap-4">
        <Fade className="w-64 shrink-0">
          <Card className="h-fit max-h-[650px] overflow-y-auto">
            <CardHeader className="pb-2 sticky top-0 bg-background z-10">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Chart of Accounts</CardTitle>
              </div>
              <button
                onClick={() => setShowAllAccounts(v => !v)}
                className="text-xs text-amber-600 hover:underline text-left"
                data-testid="toggle-all-accounts"
              >
                {showAllAccounts ? "Show active only" : "Show all accounts"}
              </button>
            </CardHeader>
            <CardContent className="p-2 pt-0">
              {ACCOUNT_TYPE_ORDER.map(type => {
                const group = visibleAccounts.filter(a => a.type === type);
                if (group.length === 0) return null;
                const isOpen = !collapsed[type];
                return (
                  <div key={type} className="mb-2">
                    <button
                      onClick={() => toggleGroup(type)}
                      className={`w-full flex items-center justify-between px-2 py-1.5 rounded text-xs font-semibold ${TYPE_COLORS[type]} ${TYPE_BG[type]}`}
                      data-testid={`ledger-group-${type}`}
                    >
                      <span>{TYPE_LABELS[type]}</span>
                      {isOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                    </button>
                    {isOpen && (
                      <div className="mt-0.5 space-y-0.5">
                        {group.map(account => (
                          <button
                            key={account.id}
                            onClick={() => setSelectedAccount(account)}
                            data-testid={`ledger-account-${account.id}`}
                            className={`w-full text-left px-3 py-1.5 rounded text-xs transition-colors ${selectedAccount?.id === account.id ? "font-semibold" : "text-muted-foreground hover:bg-muted"}`}
                            style={selectedAccount?.id === account.id ? { backgroundColor: "#FEF3C7", color: FINANCE_COLOR } : undefined}
                          >
                            <span className="mr-1.5 opacity-60">{account.code}</span>{account.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </Fade>

        <Fade className="flex-1 min-w-0">
          {!selectedAccount ? (
            <Card className="h-64 flex flex-col items-center justify-center text-center">
              <FileText className="h-12 w-12 text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground font-medium">Select an account</p>
              <p className="text-sm text-muted-foreground/60">Choose an account from the chart on the left to view its ledger</p>
            </Card>
          ) : (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">{selectedAccount.code}</span>
                      <CardTitle className="text-base">{selectedAccount.name}</CardTitle>
                      <Badge variant="outline" className={`text-xs ${TYPE_COLORS[selectedAccount.type]}`}>{TYPE_LABELS[selectedAccount.type]}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">Currency: {selectedAccount.currency} · {selectedAccount.subtype}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b bg-muted/40">
                        <th className="text-left px-4 py-2 text-muted-foreground font-medium">Date</th>
                        <th className="text-left px-4 py-2 text-muted-foreground font-medium">Narration</th>
                        {companyFilter === "all" && <th className="text-left px-4 py-2 text-muted-foreground font-medium">Entity</th>}
                        <th className="text-right px-4 py-2 text-muted-foreground font-medium">Dr</th>
                        <th className="text-right px-4 py-2 text-muted-foreground font-medium">Cr</th>
                        <th className="text-right px-4 py-2 text-muted-foreground font-medium">Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b bg-amber-50/40">
                        <td className="px-4 py-2 font-medium text-muted-foreground">—</td>
                        <td className="px-4 py-2 font-medium">Opening Balance</td>
                        {companyFilter === "all" && <td className="px-4 py-2" />}
                        <td className="px-4 py-2 text-right" />
                        <td className="px-4 py-2 text-right" />
                        <td className="px-4 py-2 text-right font-semibold">{fmtAmt(selectedAccount.openingBalance, selectedAccount.currency === "BOTH" ? "INR" : selectedAccount.currency)}</td>
                      </tr>
                      {txWithBalance.length === 0 && (
                        <tr><td colSpan={companyFilter === "all" ? 6 : 5} className="px-4 py-8 text-center text-muted-foreground">No transactions for this account</td></tr>
                      )}
                      {txWithBalance.map(tx => {
                        const co = getCompany(tx.companyId);
                        return (
                          <tr key={tx.id} className="border-b hover:bg-muted/20" data-testid={`ledger-row-${tx.id}`}>
                            <td className="px-4 py-2 text-muted-foreground">{tx.date}</td>
                            <td className="px-4 py-2 max-w-xs">
                              <p className="truncate">{tx.description}</p>
                              <p className="text-muted-foreground/60 truncate">{tx.reference}</p>
                            </td>
                            {companyFilter === "all" && (
                              <td className="px-4 py-2">
                                {co && <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${co.badgeBg} ${co.badgeText}`}>{co.shortName}</span>}
                              </td>
                            )}
                            <td className="px-4 py-2 text-right font-medium text-emerald-700">{tx.dr > 0 ? fmtAmt(tx.dr, tx.currency) : ""}</td>
                            <td className="px-4 py-2 text-right font-medium text-red-600">{tx.cr > 0 ? fmtAmt(tx.cr, tx.currency) : ""}</td>
                            <td className="px-4 py-2 text-right font-semibold">{fmtAmt(tx.balance, tx.currency)}</td>
                          </tr>
                        );
                      })}
                      <tr className="bg-amber-50/40 border-t-2 border-amber-200">
                        <td className="px-4 py-2 font-semibold">Closing</td>
                        <td className="px-4 py-2 font-semibold text-muted-foreground">Closing Balance</td>
                        {companyFilter === "all" && <td className="px-4 py-2" />}
                        <td className="px-4 py-2 text-right font-semibold text-emerald-700">{fmtAmt(txWithBalance.reduce((s, t) => s + t.dr, 0), "INR")}</td>
                        <td className="px-4 py-2 text-right font-semibold text-red-600">{fmtAmt(txWithBalance.reduce((s, t) => s + t.cr, 0), "INR")}</td>
                        <td className="px-4 py-2 text-right font-bold" style={{ color: FINANCE_COLOR }}>
                          {fmtAmt(txWithBalance.length > 0 ? txWithBalance[txWithBalance.length - 1].balance : selectedAccount.openingBalance, "INR")}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </Fade>
      </div>
    </PageTransition>
  );
}
