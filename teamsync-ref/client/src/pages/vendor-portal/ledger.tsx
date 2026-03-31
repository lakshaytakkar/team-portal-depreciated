import { useState, useMemo } from "react";
import {
  DollarSign, TrendingUp, TrendingDown, Percent, Search, FileText, Calendar,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Fade } from "@/components/ui/animated";
import {
  PageShell, PageHeader, StatGrid, StatCard, IndexToolbar,
  DataTableContainer, DataTH, SortableDataTH, DataTD, DataTR,
} from "@/components/layout";
import { VENDOR_COLOR, LEDGER_PAYMENT_STATUS_CONFIG } from "@/lib/vendor-config";
import { SopModal, TutorialModal, SopTutorialButtons } from "@/components/sop/sop-modal";
import { SOP_REGISTRY } from "@/lib/sop-data";
import {
  vendorLedger, vendorClients,
  type VendorLedgerEntry, type VendorLedgerPaymentStatus,
} from "@/lib/mock-data-vendor";

const STATUS_TABS: (VendorLedgerPaymentStatus | "all")[] = ["all", "Paid", "Pending", "Overdue"];
const STATUS_LABELS: Record<string, string> = {
  all: "All", Paid: "Paid", Pending: "Pending", Overdue: "Overdue",
};

function fmt(n: number): string {
  return "$" + Math.abs(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function VendorLedger() {
  const [statusFilter, setStatusFilter] = useState<VendorLedgerPaymentStatus | "all">("all");
  const [sopOpen, setSopOpen] = useState(false);
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const [clientFilter, setClientFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<{ key: string; dir: "asc" | "desc" } | null>({ key: "date", dir: "desc" });

  const handleSort = (key: string) => {
    setSort(prev => {
      if (!prev || prev.key !== key) return { key, dir: "desc" };
      if (prev.dir === "desc") return { key, dir: "asc" };
      return null;
    });
  };

  const filtered = useMemo(() => {
    return vendorLedger.filter(e => {
      if (statusFilter !== "all" && e.paymentStatus !== statusFilter) return false;
      if (clientFilter !== "all" && e.clientId !== clientFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        if (
          !e.description.toLowerCase().includes(q) &&
          !e.invoiceNumber.toLowerCase().includes(q) &&
          !e.clientName.toLowerCase().includes(q)
        ) return false;
      }
      return true;
    });
  }, [statusFilter, clientFilter, search]);

  const sorted = useMemo(() => {
    if (!sort) return filtered;
    return [...filtered].sort((a, b) => {
      const dir = sort.dir === "asc" ? 1 : -1;
      const k = sort.key;
      let aVal: any, bVal: any;
      if (k === "date") { aVal = a.date; bVal = b.date; }
      else if (k === "amount") { aVal = a.amount; bVal = b.amount; }
      else if (k === "balance") { aVal = a.balance; bVal = b.balance; }
      else if (k === "client") { aVal = a.clientName; bVal = b.clientName; }
      else { aVal = (a as any)[k]; bVal = (b as any)[k]; }
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      if (typeof aVal === "number") return (aVal - bVal) * dir;
      return String(aVal).localeCompare(String(bVal)) * dir;
    });
  }, [filtered, sort]);

  const totalRevenue = vendorLedger.filter(e => e.type === "Credit").reduce((s, e) => s + e.amount, 0);
  const totalPayouts = vendorLedger.filter(e => e.type === "Debit").reduce((s, e) => s + e.amount, 0);
  const outstanding = vendorLedger.filter(e => e.paymentStatus === "Pending" || e.paymentStatus === "Overdue").reduce((s, e) => s + (e.type === "Credit" ? e.amount : -e.amount), 0);
  const profitMargin = totalRevenue > 0 ? ((totalRevenue - totalPayouts) / totalRevenue * 100) : 0;

  const runningBalances = useMemo(() => {
    const map: Record<string, number> = {};
    let bal = 0;
    const sortedByDate = [...vendorLedger].sort((a, b) => a.date.localeCompare(b.date));
    for (const entry of sortedByDate) {
      bal += entry.type === "Credit" ? entry.amount : -entry.amount;
      map[entry.id] = +bal.toFixed(2);
    }
    return map;
  }, []);

  return (
    <PageShell>
      <Fade>
        <PageHeader
          title="Ledger"
          subtitle="Financial transactions, payment history, and running balance"
          actions={<SopTutorialButtons onSopClick={() => setSopOpen(true)} onTutorialClick={() => setTutorialOpen(true)} />}
        />
      </Fade>

      <Fade>
        <StatGrid cols={4}>
          <StatCard
            label="Total Revenue"
            value={fmt(totalRevenue)}
            icon={TrendingUp}
            iconBg="#ECFDF5"
            iconColor="#059669"
          />
          <StatCard
            label="Total Payouts"
            value={fmt(totalPayouts)}
            icon={TrendingDown}
            iconBg="#FEF2F2"
            iconColor="#DC2626"
          />
          <StatCard
            label="Outstanding"
            value={fmt(Math.abs(outstanding))}
            icon={DollarSign}
            iconBg="#FFFBEB"
            iconColor="#D97706"
          />
          <StatCard
            label="Profit Margin"
            value={`${profitMargin.toFixed(1)}%`}
            icon={Percent}
            iconBg="#F5F3FF"
            iconColor="#7C3AED"
          />
        </StatGrid>
      </Fade>

      <Fade>
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search description, invoice, client..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9"
              data-testid="input-search-ledger"
            />
          </div>
          <div className="w-52">
            <Select value={clientFilter} onValueChange={setClientFilter}>
              <SelectTrigger data-testid="select-client-filter">
                <SelectValue placeholder="All Clients" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Clients</SelectItem>
                {vendorClients.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.businessName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-1.5 p-1 bg-muted/50 rounded-xl w-fit border">
            {STATUS_TABS.map(f => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                style={statusFilter === f ? { background: VENDOR_COLOR, color: "#fff" } : { color: "var(--muted-foreground)" }}
                data-testid={`filter-ledger-${f}`}
              >
                {STATUS_LABELS[f]}
                <span className="ml-1.5 text-xs opacity-70">
                  ({f === "all"
                    ? vendorLedger.length
                    : vendorLedger.filter(e => e.paymentStatus === f).length
                  })
                </span>
              </button>
            ))}
          </div>
        </div>
      </Fade>

      <Fade>
        {sorted.length === 0 ? (
          <div className="p-12 text-center border rounded-xl bg-card">
            <FileText className="h-10 w-10 mx-auto mb-3 text-muted-foreground/30" />
            <div className="font-medium text-muted-foreground">No ledger entries found</div>
            <div className="text-sm text-muted-foreground mt-1">Try adjusting your filters or search terms.</div>
          </div>
        ) : (
          <DataTableContainer>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <SortableDataTH sortKey="date" currentSort={sort} onSort={handleSort}>Date</SortableDataTH>
                  <SortableDataTH sortKey="client" currentSort={sort} onSort={handleSort}>Client</SortableDataTH>
                  <DataTH>Description</DataTH>
                  <DataTH>Invoice #</DataTH>
                  <DataTH>Debit</DataTH>
                  <DataTH>Credit</DataTH>
                  <SortableDataTH sortKey="balance" currentSort={sort} onSort={handleSort}>Balance</SortableDataTH>
                  <DataTH>Status</DataTH>
                </tr>
              </thead>
              <tbody className="divide-y">
                {sorted.map(entry => {
                  const sc = LEDGER_PAYMENT_STATUS_CONFIG[entry.paymentStatus.toLowerCase() as keyof typeof LEDGER_PAYMENT_STATUS_CONFIG];
                  const balance = runningBalances[entry.id] ?? entry.balance;
                  return (
                    <DataTR key={entry.id} data-testid={`row-ledger-${entry.id}`}>
                      <DataTD className="text-muted-foreground whitespace-nowrap">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" />
                          {new Date(entry.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                      </DataTD>
                      <DataTD>
                        <span className="font-medium">{entry.clientName}</span>
                      </DataTD>
                      <DataTD className="max-w-xs">
                        <span className="line-clamp-2 text-sm">{entry.description}</span>
                      </DataTD>
                      <DataTD>
                        <span className="text-xs text-muted-foreground font-mono">{entry.invoiceNumber}</span>
                      </DataTD>
                      <DataTD>
                        {entry.type === "Debit" ? (
                          <span className="font-semibold text-red-500">-{fmt(entry.amount)}</span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </DataTD>
                      <DataTD>
                        {entry.type === "Credit" ? (
                          <span className="font-semibold text-emerald-600">+{fmt(entry.amount)}</span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </DataTD>
                      <DataTD>
                        <span className={`font-bold ${balance >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                          {fmt(balance)}
                        </span>
                      </DataTD>
                      <DataTD>
                        <Badge
                          style={{ background: sc?.bg, color: sc?.color }}
                          className="border-0 text-xs"
                          data-testid={`badge-status-${entry.id}`}
                        >
                          {sc?.label ?? entry.paymentStatus}
                        </Badge>
                      </DataTD>
                    </DataTR>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t bg-muted/20">
                  <td colSpan={4} className="px-4 py-3 text-sm font-semibold">
                    Totals ({sorted.length} entries)
                  </td>
                  <td className="px-4 py-3 font-bold text-red-500">
                    -{fmt(sorted.filter(e => e.type === "Debit").reduce((s, e) => s + e.amount, 0))}
                  </td>
                  <td className="px-4 py-3 font-bold text-emerald-600">
                    +{fmt(sorted.filter(e => e.type === "Credit").reduce((s, e) => s + e.amount, 0))}
                  </td>
                  <td className="px-4 py-3 font-bold" style={{ color: VENDOR_COLOR }}>
                    {fmt(
                      sorted.filter(e => e.type === "Credit").reduce((s, e) => s + e.amount, 0) -
                      sorted.filter(e => e.type === "Debit").reduce((s, e) => s + e.amount, 0)
                    )}
                  </td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </DataTableContainer>
        )}
      </Fade>
      <SopModal open={sopOpen} onOpenChange={setSopOpen} config={SOP_REGISTRY["vendor-ledger"].sop} color={VENDOR_COLOR} />
      <TutorialModal open={tutorialOpen} onOpenChange={setTutorialOpen} config={SOP_REGISTRY["vendor-ledger"].tutorial} color={VENDOR_COLOR} />
    </PageShell>
  );
}
