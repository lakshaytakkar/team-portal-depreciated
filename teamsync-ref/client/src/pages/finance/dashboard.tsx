import { useState } from "react";
import { Building2, DollarSign, TrendingUp, AlertTriangle, ArrowUpRight, ArrowDownRight, CheckCircle2, Clock, Landmark, CreditCard, BarChart3 } from "lucide-react";
import { Fade, Stagger, StaggerItem } from "@/components/ui/animated";
import {
  PageShell,
  PageHeader,
  HeroBanner,
  StatCard,
  StatGrid,
  SectionCard,
  SectionGrid,
} from "@/components/layout";
import { Badge } from "@/components/ui/badge";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import {
  ALL_FINANCE_COMPANIES, financeTransactions, interCompanyBalances, complianceFilings, exchangeRates,
  type FinanceCompany,
} from "@/lib/mock-data-finance";

const CURRENT_RATE = exchangeRates[0].rate;

function toINR(amount: number, currency: "INR" | "USD") {
  return currency === "USD" ? amount * CURRENT_RATE : amount;
}

function fmtINR(v: number) {
  if (v >= 10000000) return `₹${(v / 10000000).toFixed(2)}Cr`;
  if (v >= 100000) return `₹${(v / 100000).toFixed(1)}L`;
  if (v >= 1000) return `₹${(v / 1000).toFixed(0)}K`;
  return `₹${v.toFixed(0)}`;
}

function fmtNative(amount: number, currency: "INR" | "USD") {
  if (currency === "USD") return `$${amount.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  return fmtINR(amount);
}

function daysUntil(dateStr: string) {
  const due = new Date(dateStr);
  const now = new Date("2026-03-01");
  return Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function daysPillClass(days: number) {
  if (days < 0) return "bg-red-100 text-red-700";
  if (days <= 7) return "bg-orange-100 text-orange-700";
  if (days <= 30) return "bg-amber-100 text-amber-700";
  return "bg-emerald-100 text-emerald-700";
}

const getCompany = (id: string) => ALL_FINANCE_COMPANIES.find(c => c.id === id)!;

const txByCompany = (id: string) => financeTransactions.filter(t => t.companyId === id);
const income = (txs: typeof financeTransactions) => txs.filter(t => t.type === "income" || t.type === "cash-in").reduce((s, t) => s + toINR(t.amount, t.currency), 0);
const expense = (txs: typeof financeTransactions) => txs.filter(t => t.type === "expense" || t.type === "cash-out").reduce((s, t) => s + toINR(t.amount, t.currency), 0);

const complianceByCompany = (id: string) => {
  const items = complianceFilings.filter(f => f.companyId === id);
  const overdue = items.filter(f => f.status === "overdue").length;
  const pending = items.filter(f => f.status === "pending").length;
  if (overdue > 0) return "red";
  if (pending > 0) {
    const soonDue = items.filter(f => f.status === "pending" && daysUntil(f.dueDate) <= 14);
    return soonDue.length > 0 ? "amber" : "green";
  }
  return "green";
};

const totalCashINR = ALL_FINANCE_COMPANIES.reduce((s, c) => {
  const txs = txByCompany(c.id);
  return s + income(txs) - expense(txs);
}, 0);

const openIC = interCompanyBalances.filter(b => b.status !== "settled");
const totalICOutstanding = openIC.reduce((s, b) => s + b.inrEquivalent, 0);
const overdueCompliance = complianceFilings.filter(f => f.status === "overdue").length;
const allTx = financeTransactions;
const currentMonthTx = allTx.filter(t => t.date.startsWith("2026-02"));

const upcomingFilings = [...complianceFilings]
  .filter(f => f.status === "pending" || f.status === "overdue")
  .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
  .slice(0, 5);

const recentTx = [...financeTransactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10);

function CompanyHealthDot({ companyId }: { companyId: string }) {
  const color = complianceByCompany(companyId);
  const cls = color === "red" ? "bg-red-500" : color === "amber" ? "bg-amber-400" : "bg-emerald-500";
  const title = color === "red" ? "Overdue filing" : color === "amber" ? "Filing due soon" : "Compliant";
  return <span title={title} className={`inline-block w-2.5 h-2.5 rounded-full ${cls}`} />;
}

export default function FinanceDashboard() {
  const isLoading = useSimulatedLoading(700);

  if (isLoading) {
    return (
      <PageShell>
        <div className="h-36 bg-muted rounded-2xl animate-pulse" />
        <StatGrid>
          {[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-muted rounded-xl animate-pulse" />)}
        </StatGrid>
        <StatGrid>
          {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-muted rounded-xl animate-pulse" />)}
        </StatGrid>
        <SectionGrid>
          <div className="h-64 bg-muted rounded-xl animate-pulse" />
          <div className="h-64 bg-muted rounded-xl animate-pulse" />
        </SectionGrid>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <HeroBanner
        eyebrow="Finance & Accounts"
        headline="Multi-Entity Finance Hub"
        tagline="4 entities · 2 countries · INR + USD · GST + IRS Compliant"
        color="#92400E"
        colorDark="#D97706"
        metrics={[
          { label: "Total Cash (INR Equiv)", value: fmtINR(totalCashINR) },
          { label: "IC Outstanding", value: fmtINR(totalICOutstanding) },
          { label: "Overdue Filings", value: overdueCompliance }
        ]}
      />

      <StatGrid>
        {ALL_FINANCE_COMPANIES.map(company => {
          const txs = txByCompany(company.id);
          const inc = income(txs);
          const exp = expense(txs);
          const cashBalance = inc - exp;
          return (
            <StatCard
              key={company.id}
              label={company.shortName}
              value={fmtNative(cashBalance / (company.currency === "USD" ? CURRENT_RATE : 1), company.currency)}
              trend={company.jurisdiction}
              icon={company.country === "IN" ? Landmark : Landmark}
              iconBg={company.badgeBg}
              iconColor={company.color}
            />
          );
        })}
      </StatGrid>

      <StatGrid>
        <StatCard label="Total Cash (INR)" value={fmtINR(totalCashINR)} icon={DollarSign} iconBg="rgba(16, 185, 129, 0.1)" iconColor="#10b981" />
        <StatCard label="Receivables" value="₹3.45L" icon={ArrowUpRight} iconBg="rgba(14, 165, 233, 0.1)" iconColor="#0ea5e9" />
        <StatCard label="Payables" value="₹1.82L" icon={ArrowDownRight} iconBg="rgba(239, 68, 68, 0.1)" iconColor="#ef4444" />
        <StatCard label="Overdue Filings" value={overdueCompliance} icon={AlertTriangle} iconBg="rgba(239, 68, 68, 0.1)" iconColor="#ef4444" />
      </StatGrid>

      <SectionGrid>
        <SectionCard title="Monthly P&L Snapshot – Feb 2026">
          <div className="space-y-3">
            {ALL_FINANCE_COMPANIES.map(company => {
              const txs = financeTransactions.filter(t => t.companyId === company.id && t.date.startsWith("2026-02"));
              const inc = income(txs);
              const exp = expense(txs);
              const max = Math.max(inc, exp, 1);
              return (
                <div key={company.id} data-testid={`pl-row-${company.id}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${company.badgeBg} ${company.badgeText}`}>{company.shortName}</span>
                    <span className="text-xs text-muted-foreground">Net: <span className={inc - exp >= 0 ? "text-emerald-600 font-medium" : "text-red-600 font-medium"}>{fmtINR(Math.abs(inc - exp))}</span></span>
                  </div>
                  <div className="flex gap-1 items-center">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-muted-foreground w-8">In</span>
                        <div className="flex-1 bg-muted rounded-full h-2"><div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${(inc / max) * 100}%` }} /></div>
                        <span className="text-xs font-medium text-emerald-700 w-14 text-right">{fmtINR(inc)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-muted-foreground w-8">Out</span>
                        <div className="flex-1 bg-muted rounded-full h-2"><div className="bg-red-400 h-2 rounded-full" style={{ width: `${(exp / max) * 100}%` }} /></div>
                        <span className="text-xs font-medium text-red-600 w-14 text-right">{fmtINR(exp)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </SectionCard>

        <SectionCard title="Upcoming Compliance Deadlines">
          <div className="space-y-2">
            {upcomingFilings.map(f => {
              const company = getCompany(f.companyId);
              const days = daysUntil(f.dueDate);
              return (
                <div key={f.id} data-testid={`compliance-row-${f.id}`} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`text-xs font-semibold px-1.5 py-0.5 rounded shrink-0 ${company.badgeBg} ${company.badgeText}`}>{company.shortName}</span>
                    <div className="min-w-0">
                      <p className="text-xs font-medium truncate">{f.name}</p>
                      <p className="text-xs text-muted-foreground">{f.filingPeriod}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${daysPillClass(days)}`}>
                      {days < 0 ? `${Math.abs(days)}d overdue` : `${days}d left`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </SectionCard>
      </SectionGrid>

      <SectionGrid>
        <SectionCard title="Inter-Company Open Balances">
          <div className="space-y-2">
            {openIC.slice(0, 6).map(b => {
              const from = getCompany(b.fromCompany);
              const to = getCompany(b.toCompany);
              return (
                <div key={b.id} data-testid={`ic-row-${b.id}`} className="flex items-center justify-between py-1.5 border-b last:border-0">
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className={`font-semibold px-1.5 py-0.5 rounded ${from.badgeBg} ${from.badgeText}`}>{from.shortName}</span>
                    <span className="text-muted-foreground">→</span>
                    <span className={`font-semibold px-1.5 py-0.5 rounded ${to.badgeBg} ${to.badgeText}`}>{to.shortName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold">{fmtINR(b.inrEquivalent)}</span>
                    <Badge variant="outline" className={`text-xs ${b.status === "open" ? "border-amber-300 text-amber-700" : "border-sky-300 text-sky-700"}`}>{b.status}</Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </SectionCard>

        <SectionCard title="Recent Transactions">
          <div className="space-y-2">
            {recentTx.slice(0, 8).map(tx => {
              const company = getCompany(tx.companyId);
              const isIncome = tx.type === "income" || tx.type === "cash-in";
              const gwColors: Record<string, string> = { razorpay: "bg-orange-100 text-orange-700", stripe: "bg-violet-100 text-violet-700", bank: "bg-slate-100 text-slate-600", cash: "bg-emerald-100 text-emerald-700" };
              return (
                <div key={tx.id} data-testid={`recent-tx-${tx.id}`} className="flex items-center justify-between py-1.5 border-b last:border-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`text-xs font-semibold px-1.5 py-0.5 rounded shrink-0 ${company.badgeBg} ${company.badgeText}`}>{company.shortName}</span>
                    <p className="text-xs truncate text-muted-foreground">{tx.description}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    {tx.gateway && <span className={`text-xs px-1.5 py-0.5 rounded ${gwColors[tx.gateway] || "bg-slate-100 text-slate-600"}`}>{tx.gateway === "razorpay" ? "RZP" : tx.gateway === "stripe" ? "STRP" : tx.gateway.toUpperCase()}</span>}
                    <span className={`text-xs font-semibold ${isIncome ? "text-emerald-700" : "text-red-600"}`}>
                      {isIncome ? "+" : "-"}{tx.currency === "USD" ? `$${tx.amount}` : fmtINR(tx.amount)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </SectionCard>
      </SectionGrid>
    </PageShell>
  );
}
