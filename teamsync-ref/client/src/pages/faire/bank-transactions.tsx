import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus, CreditCard, CheckCircle, Link2, Paperclip, Upload, FileText,
  RefreshCw, Landmark, Building2, User, Tag, X, Pencil,
} from "lucide-react";
import { SiWise } from "react-icons/si";
import { Fade } from "@/components/ui/animated";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { formatUSD, DualCurrencyInline } from "@/lib/faire-currency";
import { apiRequest } from "@/lib/queryClient";
import {
  PageShell, PageHeader, StatGrid, StatCard, IndexToolbar,
  DataTableContainer, DataTH, SortableDataTH, DataTD, DataTR, DetailModal,
} from "@/components/layout";
import { FAIRE_COLOR } from "@/lib/faire-config";

const WISE_GREEN = "#9FE870";
const MERCURY_TEAL = "#00B8A9";

const PRESET_TAGS = [
  "VIP", "Faire Revenue", "Supplier Payment", "Personal", "Tax Deductible",
  "Wire Transfer", "Recurring", "One-time",
];

type BankView = "faire" | "mercury" | "wise";
type FaireFilter = "all" | "credit" | "debit" | "unreconciled" | "personal";
type MercuryFilter = "all" | "neom" | "cloudnest";

interface BankTx {
  id: string;
  source: string;
  entity: string | null;
  bank_name: string;
  date: string;
  description: string;
  amount: number;
  currency: string;
  amount_usd: number | null;
  type: string;
  category: string | null;
  is_business: boolean;
  tags: string[];
  reference: string | null;
  faire_order_id: string | null;
  reconciled: boolean;
  notes: string | null;
  external_id: string | null;
  created_at: string;
  updated_at: string;
}

function formatWiseCurrency(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 2 }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

function wiseStatusConfig(status: string): { bg: string; color: string; label: string } {
  const s = (status ?? "").toLowerCase();
  if (["outgoing_payment_sent", "funds_converted"].includes(s)) return { bg: "#ECFDF5", color: "#059669", label: "Sent" };
  if (s === "processing") return { bg: "#EFF6FF", color: "#2563EB", label: "Processing" };
  if (s === "cancelled") return { bg: "#FEF2F2", color: "#DC2626", label: "Cancelled" };
  if (s === "incoming_payment_waiting") return { bg: "#FFFBEB", color: "#D97706", label: "Waiting" };
  return { bg: "#F3F4F6", color: "#6B7280", label: s.replace(/_/g, " ") || "Unknown" };
}

function BusinessToggle({ tx, onToggle }: { tx: BankTx; onToggle: (id: string, val: boolean) => void }) {
  return (
    <button
      onClick={() => onToggle(tx.id, !tx.is_business)}
      title={tx.is_business ? "Business — click to mark Personal" : "Personal — click to mark Business"}
      className="flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium border transition-all hover:opacity-80"
      style={
        tx.is_business
          ? { background: "#ECFDF5", color: "#059669", borderColor: "#A7F3D0" }
          : { background: "#FFFBEB", color: "#D97706", borderColor: "#FDE68A" }
      }
      data-testid={`toggle-business-${tx.id}`}
    >
      {tx.is_business ? <Building2 size={11} /> : <User size={11} />}
      {tx.is_business ? "Biz" : "Personal"}
    </button>
  );
}

function TagEditor({
  tags,
  onChange,
}: {
  tags: string[];
  onChange: (tags: string[]) => void;
}) {
  const [input, setInput] = useState("");
  function addTag(tag: string) {
    const t = tag.trim();
    if (t && !tags.includes(t)) onChange([...tags, t]);
    setInput("");
  }
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {PRESET_TAGS.map((pt) => (
          <button
            key={pt}
            onClick={() => tags.includes(pt) ? onChange(tags.filter((x) => x !== pt)) : addTag(pt)}
            className="text-xs px-2 py-0.5 rounded-full border transition-all"
            style={
              tags.includes(pt)
                ? { background: FAIRE_COLOR, color: "#fff", borderColor: FAIRE_COLOR }
                : { background: "transparent", color: "var(--muted-foreground)", borderColor: "var(--border)" }
            }
          >
            {pt}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(input); } }}
          placeholder="Type custom tag + Enter…"
          className="h-8 text-sm"
        />
      </div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {tags.map((t) => (
            <span key={t} className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full" style={{ background: "#EFF6FF", color: "#2563EB" }}>
              {t}
              <button onClick={() => onChange(tags.filter((x) => x !== t))} className="hover:opacity-70" data-testid={`remove-tag-${t}`}><X size={9} /></button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function WiseView() {
  const [syncing, setSyncing] = useState(false);
  const { data: summaryData, isLoading: summaryLoading, refetch: refetchSummary } = useQuery<{ profile: any; balances: any[]; lastSynced: string }>({ queryKey: ["/api/wise/summary"] });
  const { data: transfersData, isLoading: transfersLoading, refetch: refetchTransfers } = useQuery<{ transfers: any[] }>({ queryKey: ["/api/wise/transfers"] });

  async function handleSync() {
    setSyncing(true);
    await Promise.all([refetchSummary(), refetchTransfers()]);
    setSyncing(false);
  }

  const profile = summaryData?.profile;
  const balances = summaryData?.balances ?? [];
  const transfers = transfersData?.transfers ?? [];
  const lastSynced = summaryData?.lastSynced;
  const isLoading = summaryLoading || transfersLoading;
  const profileName =
    profile?.details?.businessName ??
    profile?.details?.name ??
    (profile?.details?.firstName && profile?.details?.lastName ? `${profile.details.firstName} ${profile.details.lastName}` : null) ??
    "Wise Account";

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <SiWise size={36} style={{ color: WISE_GREEN }} />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-lg font-bold font-heading">Wise</span>
              {profile && <Badge variant="outline" className="text-xs">{profileName}</Badge>}
              {lastSynced && <span className="text-xs text-muted-foreground">Synced {new Date(lastSynced).toLocaleTimeString()}</span>}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">Multi-currency business account · Live API</p>
          </div>
        </div>
        <Button size="sm" variant="outline" onClick={handleSync} disabled={syncing || isLoading} data-testid="button-wise-sync">
          <RefreshCw size={13} className={`mr-1.5 ${syncing ? "animate-spin" : ""}`} />
          {syncing ? "Syncing…" : "Sync Now"}
        </Button>
      </div>

      {isLoading && <div className="h-32 animate-pulse bg-muted/30 rounded-xl" />}

      {!isLoading && balances.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {balances.map((b: any) => {
            const amt = b.amount?.value ?? b.cashAmount?.value ?? b.totalWorth?.value ?? 0;
            const cur = b.amount?.currency ?? b.currency ?? "USD";
            return (
              <Card key={b.id ?? cur} className="border">
                <CardContent className="pt-4 pb-4">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{cur} Balance</p>
                  <p className="text-xl font-bold mt-1" style={{ color: WISE_GREEN }}>{formatWiseCurrency(amt, cur)}</p>
                  {b.type && <p className="text-xs text-muted-foreground mt-1 capitalize">{b.type.replace(/_/g, " ").toLowerCase()}</p>}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {!isLoading && transfers.length > 0 && (
        <DataTableContainer>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <DataTH>Date</DataTH>
                <DataTH>Reference</DataTH>
                <DataTH>Direction</DataTH>
                <DataTH>Amount</DataTH>
                <DataTH>Status</DataTH>
              </tr>
            </thead>
            <tbody className="divide-y">
              {transfers.map((t: any) => {
                const cfg = wiseStatusConfig(t.status ?? "");
                const created = t.created ? new Date(t.created).toLocaleDateString() : "—";
                const amt = t.sourceValue ?? t.targetValue ?? 0;
                const cur = t.sourceCurrency ?? t.targetCurrency ?? "USD";
                return (
                  <DataTR key={t.id} data-testid={`wise-row-${t.id}`}>
                    <DataTD className="text-muted-foreground whitespace-nowrap">{created}</DataTD>
                    <DataTD><span className="text-xs">{t.reference ?? `#${t.id}`}</span></DataTD>
                    <DataTD className="text-muted-foreground text-xs capitalize">{t.type?.replace(/_/g, " ").toLowerCase() ?? "transfer"}</DataTD>
                    <DataTD><span className="font-semibold">{formatWiseCurrency(amt, cur)}</span></DataTD>
                    <DataTD>
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: cfg.bg, color: cfg.color }}>{cfg.label}</span>
                    </DataTD>
                  </DataTR>
                );
              })}
            </tbody>
          </table>
        </DataTableContainer>
      )}

      {!isLoading && transfers.length === 0 && (
        <div className="p-8 text-center text-sm text-muted-foreground">No Wise transfers found.</div>
      )}
    </div>
  );
}

function MercuryView() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [entityFilter, setEntityFilter] = useState<MercuryFilter>("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<{ key: string; dir: "asc" | "desc" } | null>(null);
  const [editModal, setEditModal] = useState<BankTx | null>(null);
  const [editTags, setEditTags] = useState<string[]>([]);
  const [editNotes, setEditNotes] = useState("");
  const [editCategory, setEditCategory] = useState("");

  const { data, isLoading } = useQuery<{ transactions: BankTx[]; total: number }>({
    queryKey: ["/api/bank-transactions", { source: "mercury" }],
    queryFn: () => fetch("/api/bank-transactions?source=mercury&limit=200").then((r) => r.json()),
  });

  const mercuryKey = ["/api/bank-transactions", { source: "mercury" }] as const;

  const toggleBiz = useMutation({
    mutationFn: ({ id, is_business }: { id: string; is_business: boolean }) =>
      apiRequest("PATCH", `/api/bank-transactions/${id}`, { is_business }),
    onMutate: async ({ id, is_business }) => {
      await qc.cancelQueries({ queryKey: mercuryKey });
      const prev = qc.getQueryData<{ transactions: BankTx[]; total: number }>(mercuryKey);
      qc.setQueryData<{ transactions: BankTx[]; total: number } | undefined>(mercuryKey, (old) =>
        old ? { ...old, transactions: old.transactions.map((t) => t.id === id ? { ...t, is_business } : t) } : old
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(mercuryKey, ctx.prev);
      toast({ title: "Update failed", variant: "destructive" });
    },
    onSettled: () => qc.invalidateQueries({ queryKey: mercuryKey }),
  });

  const saveEdit = useMutation({
    mutationFn: ({ id, ...patch }: { id: string; tags: string[]; notes: string; category: string }) =>
      apiRequest("PATCH", `/api/bank-transactions/${id}`, { tags: patch.tags, notes: patch.notes, category: patch.category }),
    onMutate: async ({ id, tags, notes, category }) => {
      await qc.cancelQueries({ queryKey: mercuryKey });
      const prev = qc.getQueryData<{ transactions: BankTx[]; total: number }>(mercuryKey);
      qc.setQueryData<{ transactions: BankTx[]; total: number } | undefined>(mercuryKey, (old) =>
        old ? { ...old, transactions: old.transactions.map((t) => t.id === id ? { ...t, tags, notes, category } : t) } : old
      );
      return { prev };
    },
    onSuccess: () => {
      setEditModal(null);
      toast({ title: "Transaction updated" });
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(mercuryKey, ctx.prev);
      toast({ title: "Update failed", variant: "destructive" });
    },
    onSettled: () => qc.invalidateQueries({ queryKey: mercuryKey }),
  });

  const allTxns: BankTx[] = data?.transactions ?? [];

  const filtered = allTxns.filter((t) => {
    if (entityFilter === "neom" && t.entity !== "neom") return false;
    if (entityFilter === "cloudnest" && t.entity !== "cloudnest") return false;
    if (search) {
      const s = search.toLowerCase();
      if (!t.description.toLowerCase().includes(s) && !(t.reference ?? "").toLowerCase().includes(s)) return false;
    }
    return true;
  });

  const sorted = sort
    ? [...filtered].sort((a, b) => {
        const dir = sort.dir === "asc" ? 1 : -1;
        const k = sort.key;
        const aVal = k === "amount" ? (a.amount_usd ?? a.amount) : (a as any)[k];
        const bVal = k === "amount" ? (b.amount_usd ?? b.amount) : (b as any)[k];
        if (aVal == null) return 1; if (bVal == null) return -1;
        if (typeof aVal === "number") return (aVal - bVal) * dir;
        return String(aVal).localeCompare(String(bVal)) * dir;
      })
    : filtered;

  const handleSort = (key: string) => {
    setSort((p) => !p || p.key !== key ? { key, dir: "asc" } : p.dir === "asc" ? { key, dir: "desc" } : null);
  };

  const totalInflow = allTxns.filter((t) => t.type === "credit").reduce((s, t) => s + (t.amount_usd ?? t.amount), 0);
  const totalOutflow = allTxns.filter((t) => t.type === "debit").reduce((s, t) => s + (t.amount_usd ?? t.amount), 0);

  const entityStats = [
    { id: "neom", label: "Neom International LLC" },
    { id: "cloudnest", label: "Cloudnest LLC" },
  ].map((e) => {
    const txns = allTxns.filter((t) => t.entity === e.id);
    return { ...e, txns, inflow: txns.filter((t) => t.type === "credit").reduce((s, t) => s + (t.amount_usd ?? t.amount), 0) };
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-xl shadow-sm" style={{ background: MERCURY_TEAL }}>M</div>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-lg font-bold font-heading">Mercury</span>
            <Badge variant="outline" className="text-xs text-muted-foreground border-muted-foreground/30">USD Business Checking</Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">2 entities · Neom International LLC · Cloudnest LLC</p>
        </div>
      </div>

      <StatGrid cols={4}>
        <StatCard label="Total Inflow" value={formatUSD(totalInflow * 100)} icon={CreditCard} iconBg="#ECFDF5" iconColor="#059669" />
        <StatCard label="Total Outflow" value={formatUSD(totalOutflow * 100)} icon={CreditCard} iconBg="#FEF2F2" iconColor="#DC2626" />
        <StatCard label="Net Balance" value={formatUSD((totalInflow - totalOutflow) * 100)} icon={CreditCard} iconBg="#EFF6FF" iconColor="#2563EB" />
        <StatCard label="Transactions" value={String(allTxns.length)} icon={CreditCard} iconBg="#FFFBEB" iconColor="#D97706" />
      </StatGrid>

      <div className="grid grid-cols-2 gap-4">
        {entityStats.map(({ id, label, txns, inflow }) => (
          <Card key={id} className="border">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold text-sm">{label}</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mt-0.5">{id === "neom" ? "Neom LLC" : "Cloudnest LLC"}</p>
                </div>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center font-black text-white text-sm" style={{ background: MERCURY_TEAL }}>M</div>
              </div>
              <div className="space-y-1.5 pt-1 border-t">
                <div className="flex justify-between text-xs pt-1.5">
                  <span className="text-muted-foreground">Total inflow</span>
                  <span className="font-semibold text-emerald-600">+${inflow.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Transactions</span>
                  <span className="font-semibold">{txns.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <IndexToolbar
        search={search}
        onSearch={setSearch}
        placeholder="Search by description or reference…"
        color={MERCURY_TEAL}
        filters={[
          { value: "all", label: "All Entities" },
          { value: "neom", label: "Neom" },
          { value: "cloudnest", label: "Cloudnest" },
        ]}
        activeFilter={entityFilter}
        onFilter={(k) => setEntityFilter(k as MercuryFilter)}
      />

      <DataTableContainer>
        {isLoading && <div className="h-48 animate-pulse bg-muted/30 rounded" />}
        {!isLoading && sorted.length === 0 && <div className="p-8 text-center text-sm text-muted-foreground">No transactions found.</div>}
        {!isLoading && sorted.length > 0 && (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <SortableDataTH sortKey="date" currentSort={sort} onSort={handleSort}>Date</SortableDataTH>
                <SortableDataTH sortKey="description" currentSort={sort} onSort={handleSort}>Description</SortableDataTH>
                <DataTH>Entity</DataTH>
                <SortableDataTH sortKey="amount" currentSort={sort} onSort={handleSort}>Amount (USD)</SortableDataTH>
                <DataTH>Category</DataTH>
                <DataTH>Business?</DataTH>
                <DataTH>Tags</DataTH>
                <DataTH>Action</DataTH>
              </tr>
            </thead>
            <tbody className="divide-y">
              {sorted.map((t) => (
                <DataTR key={t.id} data-testid={`mercury-row-${t.id}`}>
                  <DataTD className="text-muted-foreground whitespace-nowrap">{t.date}</DataTD>
                  <DataTD>
                    <div className="font-medium leading-tight max-w-xs">{t.description}</div>
                    {t.reference && <div className="text-xs text-muted-foreground mt-0.5">{t.reference}</div>}
                  </DataTD>
                  <DataTD>
                    <Badge variant="outline" className="text-xs font-medium" style={{ borderColor: `${MERCURY_TEAL}40`, color: MERCURY_TEAL }}>
                      {t.entity === "neom" ? "Neom" : "Cloudnest"}
                    </Badge>
                  </DataTD>
                  <DataTD>
                    <span className="font-semibold" style={{ color: t.type === "credit" ? "#059669" : "#DC2626" }}>
                      {t.type === "credit" ? "+" : "−"}${(t.amount_usd ?? t.amount).toLocaleString()}
                    </span>
                  </DataTD>
                  <DataTD className="text-muted-foreground text-xs">{t.category ?? "—"}</DataTD>
                  <DataTD>
                    <BusinessToggle tx={t} onToggle={(id, val) => toggleBiz.mutate({ id, is_business: val })} />
                  </DataTD>
                  <DataTD>
                    {t.tags.length > 0
                      ? <div className="flex flex-wrap gap-1">{t.tags.map((tag) => <span key={tag} className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: "#EFF6FF", color: "#2563EB" }}>{tag}</span>)}</div>
                      : <span className="text-muted-foreground text-xs">—</span>}
                  </DataTD>
                  <DataTD>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => { setEditModal(t); setEditTags(t.tags ?? []); setEditNotes(t.notes ?? ""); setEditCategory(t.category ?? ""); }} data-testid={`btn-edit-${t.id}`} title="Edit">
                      <Pencil size={14} />
                    </Button>
                  </DataTD>
                </DataTR>
              ))}
            </tbody>
          </table>
        )}
      </DataTableContainer>

      <DetailModal
        open={!!editModal}
        onClose={() => setEditModal(null)}
        title="Edit Transaction"
        subtitle={editModal?.description ?? ""}
        footer={
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setEditModal(null)}>Cancel</Button>
            <Button
              style={{ background: MERCURY_TEAL }} className="text-white hover:opacity-90"
              onClick={() => editModal && saveEdit.mutate({ id: editModal.id, tags: editTags, notes: editNotes, category: editCategory })}
              disabled={saveEdit.isPending}
              data-testid="btn-save-edit"
            >
              {saveEdit.isPending ? "Saving…" : "Save"}
            </Button>
          </div>
        }
      >
        <div className="space-y-4 px-6 py-5">
          <div className="space-y-1.5">
            <Label>Category</Label>
            <Input value={editCategory} onChange={(e) => setEditCategory(e.target.value)} placeholder="e.g. Revenue, Operating Cost" />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5"><Tag size={13} /> Tags</Label>
            <TagEditor tags={editTags} onChange={setEditTags} />
          </div>
          <div className="space-y-1.5">
            <Label>Notes</Label>
            <textarea className="w-full h-20 border rounded-lg px-3 py-2 text-sm resize-none bg-background" value={editNotes} onChange={(e) => setEditNotes(e.target.value)} placeholder="Internal notes…" />
          </div>
        </div>
      </DetailModal>
    </div>
  );
}

export default function FaireBankTransactions() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [bankView, setBankView] = useState<BankView>("faire");

  const [filter, setFilter] = useState<FaireFilter>("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<{ key: string; dir: "asc" | "desc" } | null>(null);
  const [mapModal, setMapModal] = useState<BankTx | null>(null);
  const [mapSearch, setMapSearch] = useState("");
  const [mapOrderId, setMapOrderId] = useState("");
  const [attachModal, setAttachModal] = useState<BankTx | null>(null);
  const [attachUploading, setAttachUploading] = useState(false);
  const [attachments, setAttachments] = useState<Record<string, { id: string; file_name: string; url: string }[]>>({});
  const [addModal, setAddModal] = useState(false);
  const [addDate, setAddDate] = useState("");
  const [addAmount, setAddAmount] = useState("");
  const [addType, setAddType] = useState("credit");
  const [addRef, setAddRef] = useState("");
  const [addDesc, setAddDesc] = useState("");
  const [addBank, setAddBank] = useState("");
  const [editModal, setEditModal] = useState<BankTx | null>(null);
  const [editTags, setEditTags] = useState<string[]>([]);
  const [editNotes, setEditNotes] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 25;

  const { data: faireData, isLoading: faireLoading } = useQuery<{ transactions: BankTx[]; total: number }>({
    queryKey: ["/api/bank-transactions", { source: "faire_payout" }],
    queryFn: () => fetch("/api/bank-transactions?source=faire_payout&limit=200").then((r) => r.json()),
  });

  const { data: allOrdersData } = useQuery<{ orders: any[] }>({ queryKey: ["/api/faire/orders"] });
  const allOrders: any[] = allOrdersData?.orders ?? [];

  const faireKey = ["/api/bank-transactions", { source: "faire_payout" }] as const;

  const toggleBiz = useMutation({
    mutationFn: ({ id, is_business }: { id: string; is_business: boolean }) =>
      apiRequest("PATCH", `/api/bank-transactions/${id}`, { is_business }),
    onMutate: async ({ id, is_business }) => {
      await qc.cancelQueries({ queryKey: faireKey });
      const prev = qc.getQueryData<{ transactions: BankTx[]; total: number }>(faireKey);
      qc.setQueryData<{ transactions: BankTx[]; total: number } | undefined>(faireKey, (old) =>
        old ? { ...old, transactions: old.transactions.map((t) => t.id === id ? { ...t, is_business } : t) } : old
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(faireKey, ctx.prev);
      toast({ title: "Update failed", variant: "destructive" });
    },
    onSettled: () => qc.invalidateQueries({ queryKey: faireKey }),
  });

  const mapToOrder = useMutation({
    mutationFn: ({ id, faire_order_id }: { id: string; faire_order_id: string }) =>
      apiRequest("PATCH", `/api/bank-transactions/${id}`, { faire_order_id, reconciled: true }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/bank-transactions", { source: "faire_payout" }] });
      setMapModal(null);
      setMapOrderId("");
      setMapSearch("");
      toast({ title: "Transaction mapped to order" });
    },
    onError: () => toast({ title: "Failed to map order", variant: "destructive" }),
  });

  const addTransaction = useMutation({
    mutationFn: (tx: object) => apiRequest("POST", "/api/bank-transactions", tx),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/bank-transactions", { source: "faire_payout" }] });
      setAddModal(false);
      setAddDate(""); setAddAmount(""); setAddRef(""); setAddDesc(""); setAddBank("");
      toast({ title: "Transaction added" });
    },
    onError: () => toast({ title: "Failed to add transaction", variant: "destructive" }),
  });

  const saveEdit = useMutation({
    mutationFn: ({ id, ...patch }: { id: string; tags: string[]; notes: string; category: string }) =>
      apiRequest("PATCH", `/api/bank-transactions/${id}`, { tags: patch.tags, notes: patch.notes, category: patch.category }),
    onMutate: async ({ id, tags, notes, category }) => {
      await qc.cancelQueries({ queryKey: faireKey });
      const prev = qc.getQueryData<{ transactions: BankTx[]; total: number }>(faireKey);
      qc.setQueryData<{ transactions: BankTx[]; total: number } | undefined>(faireKey, (old) =>
        old ? { ...old, transactions: old.transactions.map((t) => t.id === id ? { ...t, tags, notes, category } : t) } : old
      );
      return { prev };
    },
    onSuccess: () => {
      setEditModal(null);
      toast({ title: "Transaction updated" });
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(faireKey, ctx.prev);
      toast({ title: "Update failed", variant: "destructive" });
    },
    onSettled: () => qc.invalidateQueries({ queryKey: faireKey }),
  });

  const handleSort = (key: string) => {
    setSort((p) => !p || p.key !== key ? { key, dir: "asc" } : p.dir === "asc" ? { key, dir: "desc" } : null);
    setCurrentPage(1);
  };

  const transactions: BankTx[] = faireData?.transactions ?? [];

  const filtered = transactions.filter((t) => {
    if (filter === "credit" && t.type !== "credit") return false;
    if (filter === "debit" && t.type !== "debit") return false;
    if (filter === "unreconciled" && t.reconciled) return false;
    if (filter === "personal" && t.is_business) return false;
    if (search) {
      const s = search.toLowerCase();
      if (!t.description.toLowerCase().includes(s) && !(t.reference ?? "").toLowerCase().includes(s)) return false;
    }
    return true;
  });

  const sorted = sort
    ? [...filtered].sort((a, b) => {
        const dir = sort.dir === "asc" ? 1 : -1;
        const k = sort.key;
        const aVal = k === "amount" ? (a.amount_usd ?? a.amount) : (a as any)[k];
        const bVal = k === "amount" ? (b.amount_usd ?? b.amount) : (b as any)[k];
        if (aVal == null) return 1; if (bVal == null) return -1;
        if (typeof aVal === "number") return (aVal - bVal) * dir;
        return String(aVal).localeCompare(String(bVal)) * dir;
      })
    : filtered;

  const btTotalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const btSafePage = Math.min(currentPage, btTotalPages);
  const paginated = sorted.slice((btSafePage - 1) * PAGE_SIZE, btSafePage * PAGE_SIZE);

  const totalCredits = transactions.filter((t) => t.type === "credit").reduce((s, t) => s + (t.amount_usd ?? t.amount), 0);
  const totalDebits = transactions.filter((t) => t.type === "debit").reduce((s, t) => s + (t.amount_usd ?? t.amount), 0);
  const unreconciledCount = transactions.filter((t) => !t.reconciled).length;
  const personalCount = transactions.filter((t) => !t.is_business).length;

  const mapSearchResults = allOrders.filter(
    (o: any) => mapSearch.length > 1 && String(o.display_id ?? "").toLowerCase().includes(mapSearch.toLowerCase())
  );

  async function openAttachments(txn: BankTx) {
    setAttachModal(txn);
    if (!attachments[txn.id]) {
      try {
        const res = await fetch(`/api/faire/transactions/${txn.id}/attachments`);
        const data = await res.json();
        setAttachments((prev) => ({ ...prev, [txn.id]: data.attachments ?? [] }));
      } catch {
        setAttachments((prev) => ({ ...prev, [txn.id]: [] }));
      }
    }
  }

  async function handleFileUpload(txn: BankTx, file: File) {
    setAttachUploading(true);
    try {
      const res = await fetch(`/api/faire/transactions/${txn.id}/attachments`, {
        method: "POST",
        headers: { "Content-Type": file.type, "x-file-name": file.name },
        body: await file.arrayBuffer(),
      });
      const data = await res.json();
      if (data.attachment) {
        setAttachments((prev) => ({ ...prev, [txn.id]: [...(prev[txn.id] ?? []), { id: data.attachment.id, file_name: data.attachment.file_name, url: data.attachment.url }] }));
        toast({ title: "File attached", description: file.name });
      }
    } catch {
      toast({ title: "Upload failed", variant: "destructive" });
    }
    setAttachUploading(false);
  }

  const BANK_TABS: { id: BankView; label: string; icon: React.ReactNode }[] = [
    { id: "faire", label: "Faire Payouts", icon: <Landmark size={15} /> },
    {
      id: "mercury", label: "Mercury",
      icon: <span className="inline-flex w-[18px] h-[18px] rounded items-center justify-center font-black text-white leading-none" style={{ background: MERCURY_TEAL, fontSize: 11 }}>M</span>,
    },
    { id: "wise", label: "Wise", icon: <SiWise size={15} style={{ color: bankView === "wise" ? "#fff" : WISE_GREEN }} /> },
  ];

  return (
    <PageShell>
      <Fade>
        <PageHeader
          title="Bank Transactions"
          subtitle="Credit and debit transaction log for reconciliation"
          actions={
            bankView === "faire" ? (
              <Button onClick={() => setAddModal(true)} style={{ background: FAIRE_COLOR }} className="text-white hover:opacity-90" data-testid="button-add-transaction">
                <Plus className="h-4 w-4 mr-1" /> Add Transaction
              </Button>
            ) : undefined
          }
        />
      </Fade>

      <Fade>
        <div className="flex gap-1.5 p-1 rounded-xl bg-muted/50 border w-fit" data-testid="bank-view-switcher">
          {BANK_TABS.map((tab) => {
            const active = bankView === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setBankView(tab.id)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
                style={active ? { background: FAIRE_COLOR, color: "#fff" } : { color: "var(--muted-foreground)", background: "transparent" }}
                data-testid={`bank-tab-${tab.id}`}
              >
                {tab.icon}
                {tab.label}
              </button>
            );
          })}
        </div>
      </Fade>

      {bankView === "mercury" && <Fade><MercuryView /></Fade>}
      {bankView === "wise" && <Fade><WiseView /></Fade>}

      {bankView === "faire" && (
        <>
          <Fade>
            <StatGrid cols={4}>
              <StatCard label="Total Credits" value={faireLoading ? "—" : `$${totalCredits.toLocaleString()}`} icon={CreditCard} iconBg="#ECFDF5" iconColor="#059669" />
              <StatCard label="Total Debits" value={faireLoading ? "—" : `$${totalDebits.toLocaleString()}`} icon={CreditCard} iconBg="#FEF2F2" iconColor="#DC2626" />
              <StatCard label="Unreconciled" value={faireLoading ? "—" : String(unreconciledCount)} icon={CreditCard} iconBg="#FFFBEB" iconColor="#D97706" />
              <StatCard label="Personal Txns" value={faireLoading ? "—" : String(personalCount)} icon={User} iconBg="#F5F3FF" iconColor="#7C3AED" />
            </StatGrid>
          </Fade>

          <Fade>
            <IndexToolbar
              search={search}
              onSearch={v => { setSearch(v); setCurrentPage(1); }}
              placeholder="Search by description or reference…"
              color={FAIRE_COLOR}
              filters={[
                { value: "all", label: "All" },
                { value: "credit", label: "Faire Payouts" },
                { value: "debit", label: "Paid to Suppliers" },
                { value: "unreconciled", label: "Unreconciled" },
                { value: "personal", label: "Personal" },
              ]}
              activeFilter={filter}
              onFilter={(k) => { setFilter(k as FaireFilter); setCurrentPage(1); }}
            />
          </Fade>

          <Fade>
            <DataTableContainer>
              {faireLoading && <div className="h-48 animate-pulse bg-muted/30 rounded" />}
              {!faireLoading && sorted.length === 0 && (
                <div className="p-8 text-center text-sm text-muted-foreground">No transactions match current filters.</div>
              )}
              {!faireLoading && sorted.length > 0 && (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/30">
                      <SortableDataTH sortKey="date" currentSort={sort} onSort={handleSort}>Date</SortableDataTH>
                      <SortableDataTH sortKey="description" currentSort={sort} onSort={handleSort}>Description</SortableDataTH>
                      <DataTH>Bank</DataTH>
                      <SortableDataTH sortKey="type" currentSort={sort} onSort={handleSort}>Type</SortableDataTH>
                      <SortableDataTH sortKey="amount" currentSort={sort} onSort={handleSort}>Amount (USD)</SortableDataTH>
                      <DataTH>Reference</DataTH>
                      <DataTH>Order</DataTH>
                      <DataTH>Business?</DataTH>
                      <DataTH>Tags</DataTH>
                      <DataTH>Status</DataTH>
                      <DataTH align="right">Actions</DataTH>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {paginated.map((t) => (
                      <DataTR
                        key={t.id}
                        data-testid={`row-txn-${t.id}`}
                        className={!t.reconciled ? "border-l-[3px] border-l-amber-400" : ""}
                      >
                        <DataTD className="text-muted-foreground whitespace-nowrap">{t.date}</DataTD>
                        <DataTD>
                          <div className="max-w-xs">
                            <div className="font-medium leading-tight">{t.description}</div>
                          </div>
                        </DataTD>
                        <DataTD className="text-sm text-muted-foreground">{t.bank_name}</DataTD>
                        <DataTD>
                          <Badge className="border-0 text-xs" style={{ background: t.type === "credit" ? "#ECFDF5" : "#FEF2F2", color: t.type === "credit" ? "#059669" : "#DC2626" }}>
                            {t.type.toUpperCase()}
                          </Badge>
                        </DataTD>
                        <DataTD>
                          <span className="font-semibold" style={{ color: t.type === "credit" ? "#059669" : "#DC2626" }}>
                            {t.type === "credit" ? "+" : "−"}${(t.amount_usd ?? t.amount).toLocaleString()}
                          </span>
                        </DataTD>
                        <DataTD><span className="text-muted-foreground text-xs">{t.reference ?? "—"}</span></DataTD>
                        <DataTD>
                          {t.faire_order_id ? (
                            <button
                              onClick={() => setLocation(`/faire/orders/${t.faire_order_id}`)}
                              className="text-xs px-1.5 py-0.5 rounded hover:opacity-80"
                              style={{ background: "#EFF6FF", color: "#2563EB" }}
                              data-testid={`link-txn-order-${t.faire_order_id}`}
                            >
                              {t.faire_order_id.slice(0, 8)}…
                            </button>
                          ) : (
                            <span className="text-muted-foreground text-xs">—</span>
                          )}
                        </DataTD>
                        <DataTD>
                          <BusinessToggle tx={t} onToggle={(id, val) => toggleBiz.mutate({ id, is_business: val })} />
                        </DataTD>
                        <DataTD>
                          {t.tags.length > 0
                            ? <div className="flex flex-wrap gap-1">{t.tags.map((tag) => <span key={tag} className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: "#EFF6FF", color: "#2563EB" }}>{tag}</span>)}</div>
                            : <span className="text-muted-foreground text-xs">—</span>}
                        </DataTD>
                        <DataTD>
                          {t.reconciled ? (
                            <span className="text-xs text-emerald-600 font-medium flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Reconciled</span>
                          ) : (
                            <span className="text-xs text-amber-600 font-medium flex items-center gap-1"><Link2 className="h-3 w-3" /> Pending</span>
                          )}
                        </DataTD>
                        <DataTD align="right">
                          <div className="flex items-center justify-end gap-1">
                            {!t.reconciled && (
                              <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => { setMapModal(t); setMapOrderId(""); setMapSearch(""); }} data-testid={`button-map-${t.id}`} title="Map Order">
                                <Link2 size={14} />
                              </Button>
                            )}
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => { setEditModal(t); setEditTags(t.tags ?? []); setEditNotes(t.notes ?? ""); setEditCategory(t.category ?? ""); }} data-testid={`btn-edit-${t.id}`} title="Edit">
                              <Pencil size={14} />
                            </Button>
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 relative" onClick={() => openAttachments(t)} data-testid={`button-attach-${t.id}`} title="Attachments">
                              <Paperclip size={14} />
                              {(attachments[t.id]?.length ?? 0) > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center text-white" style={{ background: FAIRE_COLOR }}>
                                  {attachments[t.id].length}
                                </span>
                              )}
                            </Button>
                          </div>
                        </DataTD>
                      </DataTR>
                    ))}
                  </tbody>
                </table>
              )}
            </DataTableContainer>
          </Fade>

          {sorted.length > PAGE_SIZE && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing {(btSafePage - 1) * PAGE_SIZE + 1}–{Math.min(btSafePage * PAGE_SIZE, sorted.length)} of {sorted.length}
                </p>
                <div className="flex items-center gap-1">
                  <Button size="sm" variant="outline" className="h-8" disabled={btSafePage <= 1} onClick={() => setCurrentPage(p => p - 1)} data-testid="btn-prev-page">
                    Previous
                  </Button>
                  {Array.from({ length: Math.min(btTotalPages, 7) }, (_, i) => {
                    let page: number;
                    if (btTotalPages <= 7) page = i + 1;
                    else if (btSafePage <= 4) page = i + 1;
                    else if (btSafePage >= btTotalPages - 3) page = btTotalPages - 6 + i;
                    else page = btSafePage - 3 + i;
                    return (
                      <Button
                        key={page} size="sm"
                        variant={page === btSafePage ? "default" : "outline"}
                        className="h-8 w-8 p-0"
                        style={page === btSafePage ? { background: FAIRE_COLOR } : {}}
                        onClick={() => setCurrentPage(page)}
                        data-testid={`btn-page-${page}`}
                      >
                        {page}
                      </Button>
                    );
                  })}
                  <Button size="sm" variant="outline" className="h-8" disabled={btSafePage >= btTotalPages} onClick={() => setCurrentPage(p => p + 1)} data-testid="btn-next-page">
                    Next
                  </Button>
                </div>
              </div>
          )}

          <DetailModal
            open={!!attachModal}
            onClose={() => setAttachModal(null)}
            title="Transaction Attachments"
            subtitle={`Proof files for: ${attachModal?.reference ?? ""}`}
            footer={<div className="flex justify-end"><Button variant="outline" onClick={() => setAttachModal(null)}>Close</Button></div>}
          >
            <div className="space-y-4 px-6 py-5">
              <div className="p-3 rounded-lg bg-muted/40 text-sm">
                <div className="font-medium">{attachModal?.description}</div>
                <div className="text-muted-foreground mt-1">{attachModal?.type?.toUpperCase()} · {attachModal?.date}</div>
              </div>
              <div>
                <Label className="mb-2 block">Upload New File</Label>
                <label className={`flex items-center gap-2 px-4 py-3 border-2 border-dashed rounded-lg cursor-pointer transition-colors hover:border-primary/50 hover:bg-muted/30 ${attachUploading ? "opacity-50 pointer-events-none" : ""}`}>
                  <Upload size={16} className="text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{attachUploading ? "Uploading…" : "Click to select a file (PDF, image, etc.)"}</span>
                  <input type="file" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file && attachModal) handleFileUpload(attachModal, file); e.target.value = ""; }} data-testid="input-attachment-file" />
                </label>
              </div>
              <div>
                <Label className="mb-2 block">Attached Files ({(attachModal && attachments[attachModal.id]?.length) ?? 0})</Label>
                {attachModal && (attachments[attachModal.id]?.length ?? 0) === 0 && <p className="text-sm text-muted-foreground py-2">No attachments yet.</p>}
                {attachModal && (attachments[attachModal.id] ?? []).map((a: any) => (
                  <div key={a.id} className="flex items-center gap-2 py-2 border-b last:border-b-0">
                    <FileText size={14} className="text-muted-foreground shrink-0" />
                    <a href={a.url} target="_blank" rel="noopener noreferrer" className="text-sm hover:underline text-primary flex-1 truncate" data-testid={`attachment-link-${a.id}`}>{a.file_name}</a>
                  </div>
                ))}
              </div>
            </div>
          </DetailModal>

          <DetailModal
            open={!!mapModal}
            onClose={() => setMapModal(null)}
            title="Map to Order"
            subtitle={`Link transaction "${mapModal?.reference ?? ""}" to a Faire order`}
            footer={
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setMapModal(null)}>Cancel</Button>
                <Button
                  onClick={() => mapModal && mapOrderId && mapToOrder.mutate({ id: mapModal.id, faire_order_id: mapOrderId })}
                  style={{ background: FAIRE_COLOR }} className="text-white"
                  disabled={!mapOrderId || mapToOrder.isPending}
                  data-testid="button-confirm-map"
                >
                  {mapToOrder.isPending ? "Saving…" : "Confirm Mapping"}
                </Button>
              </div>
            }
          >
            <div className="space-y-4 px-6 py-5">
              <div className="p-3 rounded-lg bg-muted/40 text-sm">
                <div className="font-medium">{mapModal?.description}</div>
                <div className="text-muted-foreground mt-1">{mapModal?.type?.toUpperCase()} · ${(mapModal?.amount_usd ?? mapModal?.amount ?? 0).toLocaleString()} · {mapModal?.date}</div>
              </div>
              <div>
                <Label>Search Orders by Display ID</Label>
                <Input value={mapSearch} onChange={(e) => setMapSearch(e.target.value)} placeholder="e.g. 28841" data-testid="input-map-search" />
              </div>
              {mapSearchResults.length > 0 && (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {mapSearchResults.map((o: any) => (
                    <label key={o.id} className="flex items-center gap-2 cursor-pointer p-2 rounded border hover:bg-muted/30">
                      <input type="radio" name="map-order" checked={mapOrderId === o.id} onChange={() => setMapOrderId(o.id)} data-testid={`radio-order-${o.id}`} />
                      <div className="text-sm">
                        <span className="font-bold">#{o.display_id}</span>
                        <span className="text-muted-foreground ml-2">{o.state}</span>
                      </div>
                    </label>
                  ))}
                </div>
              )}
              {mapSearch.length > 1 && mapSearchResults.length === 0 && (
                <p className="text-sm text-muted-foreground">No orders found for "{mapSearch}".</p>
              )}
            </div>
          </DetailModal>

          <DetailModal
            open={!!editModal}
            onClose={() => setEditModal(null)}
            title="Edit Transaction"
            subtitle={editModal?.description ?? ""}
            footer={
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setEditModal(null)}>Cancel</Button>
                <Button
                  style={{ background: FAIRE_COLOR }} className="text-white hover:opacity-90"
                  onClick={() => editModal && saveEdit.mutate({ id: editModal.id, tags: editTags, notes: editNotes, category: editCategory })}
                  disabled={saveEdit.isPending}
                  data-testid="btn-save-edit"
                >
                  {saveEdit.isPending ? "Saving…" : "Save"}
                </Button>
              </div>
            }
          >
            <div className="space-y-4 px-6 py-5">
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Input value={editCategory} onChange={(e) => setEditCategory(e.target.value)} placeholder="e.g. Faire Revenue, Supplier Cost" />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5"><Tag size={13} /> Tags</Label>
                <TagEditor tags={editTags} onChange={setEditTags} />
              </div>
              <div className="space-y-1.5">
                <Label>Notes</Label>
                <textarea className="w-full h-20 border rounded-lg px-3 py-2 text-sm resize-none bg-background" value={editNotes} onChange={(e) => setEditNotes(e.target.value)} placeholder="Internal notes…" />
              </div>
            </div>
          </DetailModal>

          <DetailModal
            open={addModal}
            onClose={() => setAddModal(false)}
            title="Add Bank Transaction"
            subtitle="Record a new Faire payout or supplier payment."
            footer={
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setAddModal(false)}>Cancel</Button>
                <Button
                  style={{ background: FAIRE_COLOR }} className="text-white hover:opacity-90"
                  disabled={addTransaction.isPending}
                  onClick={() => {
                    if (!addDate || !addAmount || !addRef || !addDesc || !addBank) { toast({ title: "Fill all fields", variant: "destructive" }); return; }
                    addTransaction.mutate({
                      source: "faire_payout", bank_name: addBank, date: addDate,
                      description: addDesc, amount: parseFloat(addAmount), currency: "USD",
                      amount_usd: parseFloat(addAmount), type: addType, reference: addRef,
                    });
                  }}
                  data-testid="button-confirm-add"
                >
                  {addTransaction.isPending ? "Adding…" : "Add Transaction"}
                </Button>
              </div>
            }
          >
            <div className="space-y-4 px-6 py-5">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Date</Label>
                  <Input type="date" value={addDate} onChange={(e) => setAddDate(e.target.value)} data-testid="input-add-date" />
                </div>
                <div className="space-y-1.5">
                  <Label>Type</Label>
                  <select value={addType} onChange={(e) => setAddType(e.target.value)} className="w-full h-9 border rounded-lg px-3 text-sm bg-background" data-testid="select-add-type">
                    <option value="credit">Credit (Payout)</option>
                    <option value="debit">Debit (Payment)</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Amount (USD)</Label>
                <Input type="number" value={addAmount} onChange={(e) => setAddAmount(e.target.value)} placeholder="e.g. 1250.00" data-testid="input-add-amount" />
              </div>
              <div className="space-y-1.5">
                <Label>Bank Name</Label>
                <Input value={addBank} onChange={(e) => setAddBank(e.target.value)} placeholder="e.g. Faire, Mercury" data-testid="input-add-bank" />
              </div>
              <div className="space-y-1.5">
                <Label>Reference</Label>
                <Input value={addRef} onChange={(e) => setAddRef(e.target.value)} placeholder="e.g. PO-2024-001" data-testid="input-add-ref" />
              </div>
              <div className="space-y-1.5">
                <Label>Description</Label>
                <Input value={addDesc} onChange={(e) => setAddDesc(e.target.value)} placeholder="Brief description…" data-testid="input-add-desc" />
              </div>
            </div>
          </DetailModal>
        </>
      )}
    </PageShell>
  );
}
