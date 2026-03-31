import { useState, useMemo } from "react";
import { RefreshCw, CheckCircle2, Clock, XCircle, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PersonCell } from "@/components/ui/avatar-cells";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import {
  ALL_FINANCE_COMPANIES,
  gatewayTransactions,
  type GatewayTransaction,
} from "@/lib/mock-data-finance";
import {
  PageShell,
  PageHeader,
  IndexToolbar,
  DataTableContainer,
  DataTH,
  DataTD,
  DataTR,
  StatGrid,
  StatCard,
} from "@/components/layout";
import { verticals } from "@/lib/verticals-config";
import { Badge } from "@/components/ui/badge";
import { SopModal, TutorialModal, SopTutorialButtons } from "@/components/sop/sop-modal";
import { SOP_REGISTRY } from "@/lib/sop-data";

const STATUS_STYLES: Record<string, { cls: string; icon: typeof CheckCircle2 }> = {
  captured: { cls: "bg-emerald-100 text-emerald-700", icon: CheckCircle2 },
  paid: { cls: "bg-sky-100 text-sky-700", icon: CheckCircle2 },
  failed: { cls: "bg-red-100 text-red-700", icon: XCircle },
  pending: { cls: "bg-amber-100 text-amber-700", icon: Clock },
};

const TYPE_STYLES: Record<string, string> = {
  payment: "bg-emerald-100 text-emerald-700",
  payout: "bg-sky-100 text-sky-700",
  refund: "bg-orange-100 text-orange-700",
  fee: "bg-slate-100 text-slate-600",
};

function getCompany(id: string) {
  return ALL_FINANCE_COMPANIES.find((c) => c.id === id)!;
}

function fmtAmt(amount: number, currency: string) {
  const sym = currency === "USD" ? "$" : "₹";
  return `${sym}${amount.toLocaleString("en-IN")}`;
}

function fmtINR(v: number) {
  if (v >= 100000) return `₹${(v / 100000).toFixed(1)}L`;
  if (v >= 1000) return `₹${(v / 1000).toFixed(0)}K`;
  return `₹${v.toFixed(0)}`;
}

export default function FinancePayments() {
  const isLoading = useSimulatedLoading(600);
  const [gatewayFilter, setGatewayFilter] = useState("all");
  const [sopOpen, setSopOpen] = useState(false);
  const [tutorialOpen, setTutorialOpen] = useState(false);

  const vertical = verticals.find((v) => v.id === "finance")!;

  const rzpTx = useMemo(
    () => gatewayTransactions.filter((t) => t.gateway === "razorpay"),
    []
  );
  const stripeTx = useMemo(
    () => gatewayTransactions.filter((t) => t.gateway === "stripe"),
    []
  );

  const rzpTotal = rzpTx
    .filter((t) => t.status === "captured" || t.status === "paid")
    .reduce((s, t) => s + t.amount, 0);
  const stripeTotal = stripeTx
    .filter((t) => t.status === "captured" || t.status === "paid")
    .reduce((s, t) => s + t.amount, 0);

  const filtered = useMemo(() => {
    return gatewayTransactions
      .filter((t) => {
        if (gatewayFilter !== "all" && t.gateway !== gatewayFilter) return false;
        return true;
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [gatewayFilter]);

  const filterOptions = [
    { value: "all", label: "All Gateways" },
    { value: "razorpay", label: "Razorpay" },
    { value: "stripe", label: "Stripe" },
  ];

  return (
    <PageShell>
      <PageHeader
        title="Payment Gateways"
        subtitle="Razorpay (INR) + Stripe (USD) transaction log & reconciliation"
        actions={
          <>
            <SopTutorialButtons onSopClick={() => setSopOpen(true)} onTutorialClick={() => setTutorialOpen(true)} />
            <Button
              style={{ backgroundColor: vertical.color, color: "#fff" }}
              data-testid="btn-sync"
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Sync Now
            </Button>
          </>
        }
      />

      <StatGrid>
        <StatCard
          label="Razorpay (INR)"
          value={fmtINR(rzpTotal)}
          icon={CheckCircle2}
          iconBg="rgba(249, 115, 22, 0.1)"
          iconColor="rgb(249, 115, 22)"
        />
        <StatCard
          label="Stripe (USD)"
          value={`$${stripeTotal.toLocaleString()}`}
          icon={CheckCircle2}
          iconBg="rgba(124, 58, 237, 0.1)"
          iconColor="rgb(124, 58, 237)"
        />
      </StatGrid>

      <IndexToolbar
        search=""
        onSearch={() => {}}
        filters={filterOptions}
        activeFilter={gatewayFilter}
        onFilter={setGatewayFilter}
        color={vertical.color}
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
                <DataTH>Gateway</DataTH>
                <DataTH>Transaction ID</DataTH>
                <DataTH>Date</DataTH>
                <DataTH>Customer</DataTH>
                <DataTH align="right">Amount</DataTH>
                <DataTH>Type</DataTH>
                <DataTH>Status</DataTH>
                <DataTH>Entity</DataTH>
                <DataTH align="center">Rec.</DataTH>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((tx) => {
                const company = getCompany(tx.companyId);
                const statusInfo = STATUS_STYLES[tx.status];
                const StatusIcon = statusInfo?.icon ?? Clock;
                return (
                  <DataTR
                    key={tx.id}
                    data-testid={`gw-tx-${tx.id}`}
                    className={!tx.reconciledToLedger ? "bg-amber-50/30" : ""}
                  >
                    <DataTD>
                      <span
                        className={`font-bold px-1.5 py-0.5 rounded text-[10px] ${
                          tx.gateway === "razorpay"
                            ? "bg-orange-100 text-orange-700"
                            : "bg-violet-100 text-violet-700"
                        }`}
                      >
                        {tx.gateway === "razorpay" ? "RZP" : "STRP"}
                      </span>
                    </DataTD>
                    <DataTD className="text-[10px] text-muted-foreground">
                      {tx.transactionId.substring(0, 12)}…
                    </DataTD>
                    <DataTD className="text-[10px] text-muted-foreground">{tx.date}</DataTD>
                    <DataTD><PersonCell name={tx.customerName} size="xs" /></DataTD>
                    <DataTD align="right" className="font-semibold">
                      {fmtAmt(tx.amount, tx.currency)}
                    </DataTD>
                    <DataTD>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                          TYPE_STYLES[tx.type]
                        }`}
                      >
                        {tx.type}
                      </span>
                    </DataTD>
                    <DataTD>
                      <span
                        className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold w-fit ${statusInfo?.cls}`}
                      >
                        <StatusIcon className="h-2.5 w-2.5" />
                        {tx.status}
                      </span>
                    </DataTD>
                    <DataTD>
                      <span
                        className={`font-semibold px-1.5 py-0.5 rounded text-[10px] ${company.badgeBg} ${company.badgeText}`}
                      >
                        {company.shortName}
                      </span>
                    </DataTD>
                    <DataTD align="center">
                      {tx.reconciledToLedger ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 mx-auto" />
                      ) : (
                        <button
                          className="text-amber-600 hover:text-amber-800"
                          title="Mark Reconciled"
                          data-testid={`btn-reconcile-${tx.id}`}
                        >
                          <Check className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </DataTD>
                  </DataTR>
                );
              })}
            </tbody>
          </table>
        </DataTableContainer>
      )}
      <SopModal open={sopOpen} onOpenChange={setSopOpen} config={SOP_REGISTRY["finance-payments"].sop} color={vertical.color} />
      <TutorialModal open={tutorialOpen} onOpenChange={setTutorialOpen} config={SOP_REGISTRY["finance-payments"].tutorial} color={vertical.color} />
    </PageShell>
  );
}
