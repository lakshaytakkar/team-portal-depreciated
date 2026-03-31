import { useState, useMemo } from "react";
import { Plus, List, CalendarDays, CheckCircle2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PersonCell } from "@/components/ui/avatar-cells";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import {
  ALL_FINANCE_COMPANIES,
  financeTransactions,
  type FinanceTransaction,
} from "@/lib/mock-data-finance";
import {
  PageShell,
  PageHeader,
  IndexToolbar,
  DataTableContainer,
  DataTH,
  DataTD,
  DataTR,
} from "@/components/layout";
import { verticals } from "@/lib/verticals-config";
import { Badge } from "@/components/ui/badge";
import { FINANCE_GATEWAY_CONFIG } from "@/lib/finance-config";
import { SopModal, TutorialModal, SopTutorialButtons } from "@/components/sop/sop-modal";
import { SOP_REGISTRY } from "@/lib/sop-data";


function fmtAmt(tx: FinanceTransaction) {
  const sym = tx.currency === "USD" ? "$" : "₹";
  const v =
    tx.amount >= 1000 && tx.currency === "INR"
      ? `${(tx.amount / 1000).toFixed(0)}K`
      : tx.amount.toLocaleString("en-IN");
  return `${sym}${v}`;
}

function getCompany(id: string) {
  return ALL_FINANCE_COMPANIES.find((c) => c.id === id);
}

function fmtINR(v: number) {
  if (v >= 100000) return `₹${(v / 100000).toFixed(1)}L`;
  if (v >= 1000) return `₹${(v / 1000).toFixed(0)}K`;
  return `₹${v.toFixed(0)}`;
}

export default function FinanceTransactions() {
  const isLoading = useSimulatedLoading(500);
  const [companyFilter, setCompanyFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [sopOpen, setSopOpen] = useState(false);
  const [tutorialOpen, setTutorialOpen] = useState(false);

  const vertical = verticals.find((v) => v.id === "finance")!;

  const filtered = useMemo(() => {
    return financeTransactions
      .filter((tx) => {
        if (companyFilter !== "all" && tx.companyId !== companyFilter) return false;
        if (search) {
          const q = search.toLowerCase();
          if (!tx.description.toLowerCase().includes(q) && !tx.reference.toLowerCase().includes(q))
            return false;
        }
        return true;
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [companyFilter, search]);

  const totalIn = filtered
    .filter((t) => t.type === "income" || t.type === "cash-in")
    .reduce((s, t) => s + (t.currency === "USD" ? t.amount * 83.2 : t.amount), 0);
  const totalOut = filtered
    .filter((t) => t.type === "expense" || t.type === "cash-out")
    .reduce((s, t) => s + (t.currency === "USD" ? t.amount * 83.2 : t.amount), 0);

  const filterOptions = [
    { value: "all", label: "All Companies" },
    ...ALL_FINANCE_COMPANIES.map((c) => ({ value: c.id, label: c.shortName })),
  ];

  return (
    <PageShell>
      <PageHeader
        title="Transactions"
        subtitle={`${filtered.length} of ${financeTransactions.length} entries`}
        actions={
          <>
            <SopTutorialButtons onSopClick={() => setSopOpen(true)} onTutorialClick={() => setTutorialOpen(true)} />
            <Button
              style={{ backgroundColor: vertical.color, color: "#fff" }}
              data-testid="btn-new-entry"
            >
              <Plus className="h-4 w-4 mr-1" />
              New Entry
            </Button>
          </>
        }
      />

      <IndexToolbar
        search={search}
        onSearch={setSearch}
        filters={filterOptions}
        activeFilter={companyFilter}
        onFilter={setCompanyFilter}
        color={vertical.color}
        placeholder="Search transactions..."
      />

      {isLoading ? (
        <div className="space-y-4 animate-pulse">
          <div className="h-96 bg-muted rounded-xl" />
        </div>
      ) : (
        <DataTableContainer>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <DataTH>Date</DataTH>
                <DataTH>Description</DataTH>
                <DataTH>Entity</DataTH>
                <DataTH>Category</DataTH>
                <DataTH>Gateway</DataTH>
                <DataTH align="right">Amount</DataTH>
                <DataTH align="center">Rec.</DataTH>
                <DataTH>By</DataTH>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.length === 0 && (
                <tr>
                  <DataTD align="center" className="py-12 text-muted-foreground">
                    No transactions match your filters
                  </DataTD>
                </tr>
              )}
              {filtered.map((tx) => {
                const company = getCompany(tx.companyId);
                const isIncome = tx.type === "income" || tx.type === "cash-in";
                const gw = tx.gateway ? FINANCE_GATEWAY_CONFIG[tx.gateway] : null;
                return (
                  <DataTR key={tx.id} data-testid={`tx-row-${tx.id}`}>
                    <DataTD className="text-xs text-muted-foreground">{tx.date}</DataTD>
                    <DataTD>
                      <p className="text-xs font-medium truncate max-w-xs">{tx.description}</p>
                      <p className="text-[10px] text-muted-foreground/60">{tx.reference}</p>
                    </DataTD>
                    <DataTD>
                      {company && (
                        <span
                          className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${company.badgeBg} ${company.badgeText}`}
                        >
                          {company.shortName}
                        </span>
                      )}
                    </DataTD>
                    <DataTD>
                      <Badge variant="outline" className="text-[10px] h-4">
                        {tx.category}
                      </Badge>
                    </DataTD>
                    <DataTD>
                      {gw && (
                        <span
                          className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${(gw.bg + " " + gw.color)}`}
                        >
                          {gw.label}
                        </span>
                      )}
                    </DataTD>
                    <DataTD
                      align="right"
                      className={`text-xs font-semibold ${
                        isIncome ? "text-emerald-700" : "text-red-600"
                      }`}
                    >
                      {isIncome ? "+" : "-"}{fmtAmt(tx)}
                    </DataTD>
                    <DataTD align="center">
                      {tx.reconciledStatus === "reconciled" ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 mx-auto" />
                      ) : (
                        <Clock className="h-3.5 w-3.5 text-amber-400 mx-auto" />
                      )}
                    </DataTD>
                    <DataTD>
                      <PersonCell name={tx.enteredBy} size="xs" />
                    </DataTD>
                  </DataTR>
                );
              })}
            </tbody>
          </table>

          <div className="px-4 py-2 border-t bg-muted/20 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              Showing {filtered.length} of {financeTransactions.length} transactions
            </span>
            <div className="flex gap-6">
              <span className="text-emerald-700 font-medium">In: {fmtINR(totalIn)}</span>
              <span className="text-red-600 font-medium">Out: {fmtINR(totalOut)}</span>
              <span
                className={`font-semibold ${totalIn - totalOut >= 0 ? "text-emerald-700" : "text-red-600"}`}
              >
                Net: {fmtINR(Math.abs(totalIn - totalOut))}
              </span>
            </div>
          </div>
        </DataTableContainer>
      )}
      <SopModal open={sopOpen} onOpenChange={setSopOpen} config={SOP_REGISTRY["finance-transactions"].sop} color={vertical.color} />
      <TutorialModal open={tutorialOpen} onOpenChange={setTutorialOpen} config={SOP_REGISTRY["finance-transactions"].tutorial} color={vertical.color} />
    </PageShell>
  );
}
