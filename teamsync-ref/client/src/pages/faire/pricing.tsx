import { useState } from "react";
import { Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { SopModal, TutorialModal, SopTutorialButtons } from "@/components/sop/sop-modal";
import { SOP_REGISTRY } from "@/lib/sop-data";
import { Fade } from "@/components/ui/animated";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DetailModal } from "@/components/layout";
import { FAIRE_COLOR } from "@/lib/faire-config";
import { useToast } from "@/hooks/use-toast";
import { DualCurrency } from "@/lib/faire-currency";
import {
  PageShell, PageHeader, IndexToolbar, DataTableContainer, DataTH, SortableDataTH, DataTD, DataTR,
} from "@/components/layout";


function marginColor(pct: number) {
  if (pct >= 50) return { bg: "#ECFDF5", text: "#059669" };
  if (pct >= 30) return { bg: "#FFFBEB", text: "#D97706" };
  return { bg: "#FEF2F2", text: "#DC2626" };
}

const mockPrepacks = [
  { id: "pp-001", name: "Candle Sampler Trio", products: ["Soy Wax Pillar Candle Set (3 scents)"], units: 3, wholesale_price_cents: 7500, storeId: "store-001" },
  { id: "pp-002", name: "Wellness Starter Kit", products: ["Lavender Body Oil 4oz", "Rose Facial Serum 1oz"], units: 2, wholesale_price_cents: 3600, storeId: "store-005" },
  { id: "pp-003", name: "Kitchen Essentials Bundle", products: ["Rattan Fruit Bowl Lg", "Linen Napkin Set (Natural)"], units: 2, wholesale_price_cents: 4400, storeId: "store-002" },
];

export default function FairePricing() {
  const { toast } = useToast();
  const [selectedStore, setSelectedStore] = useState("all");
  const [search, setSearch] = useState("");
  const [addPrepackOpen, setAddPrepackOpen] = useState(false);
  const [prepackName, setPrepackName] = useState("");
  const [prepackPrice, setPrepackPrice] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sort, setSort] = useState<{ key: string; dir: "asc" | "desc" } | null>(null);
  const [sopOpen, setSopOpen] = useState(false);
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const PAGE_SIZE = 25;

  const handleSort = (key: string) => {
    setSort((prev) => {
      if (!prev || prev.key !== key) return { key, dir: "asc" };
      if (prev.dir === "asc") return { key, dir: "desc" };
      return null;
    });
    setCurrentPage(1);
  };

  const { data: productsData, isLoading: productsLoading } = useQuery<{ products: any[] }>({
    queryKey: ["/api/faire/products?slim"],
    queryFn: async () => {
      const res = await fetch("/api/faire/products?slim", { headers: { "Cache-Control": "no-cache" } });
      if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`);
      return res.json();
    },
  });

  const { data: storesData, isLoading: storesLoading } = useQuery<{ stores: any[] }>({
    queryKey: ["/api/faire/stores"],
    queryFn: async () => {
      const res = await fetch("/api/faire/stores", { headers: { "Cache-Control": "no-cache" } });
      if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`);
      return res.json();
    },
  });

  const isLoading = productsLoading || storesLoading;
  const products = productsData?.products ?? [];
  const stores = storesData?.stores ?? [];

  const rows = products.flatMap((p: any) =>
    (p.variants ?? []).map((v: any) => ({
      ...v,
      productName: p.name,
      storeId: p._storeId,
      moq: p.minimum_order_quantity,
      store: stores.find((s: any) => s.id === p._storeId),
    }))
  ).filter((r: any) => {
    if (selectedStore !== "all" && r.storeId !== selectedStore) return false;
    if (search && !r.productName.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const sortedRows = sort
    ? [...rows].sort((a, b) => {
        const dir = sort.dir === "asc" ? 1 : -1;
        const k = sort.key;
        let aVal: any, bVal: any;
        if (k === "productName") { aVal = a.productName; bVal = b.productName; }
        else if (k === "sku") { aVal = a.sku; bVal = b.sku; }
        else if (k === "wholesale") { aVal = a.wholesale_price_cents ?? 0; bVal = b.wholesale_price_cents ?? 0; }
        else if (k === "retail") { aVal = a.retail_price_cents ?? 0; bVal = b.retail_price_cents ?? 0; }
        else if (k === "margin") {
          const rA = a.retail_price_cents ?? 0; const wA = a.wholesale_price_cents ?? 0;
          const rB = b.retail_price_cents ?? 0; const wB = b.wholesale_price_cents ?? 0;
          aVal = rA > 0 ? ((rA - wA) / rA) : 0;
          bVal = rB > 0 ? ((rB - wB) / rB) : 0;
        }
        else { aVal = a[k]; bVal = b[k]; }
        if (aVal == null && bVal == null) return 0;
        if (aVal == null) return 1;
        if (bVal == null) return -1;
        if (typeof aVal === "number" && typeof bVal === "number") return (aVal - bVal) * dir;
        return String(aVal).localeCompare(String(bVal)) * dir;
      })
    : rows;

  const totalPages = Math.max(1, Math.ceil(sortedRows.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedRows = sortedRows.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const filteredPrepacks = selectedStore === "all" ? mockPrepacks : mockPrepacks.filter(pp => pp.storeId === selectedStore);

  if (isLoading) {
    return (
      <PageShell>
        <div className="h-10 bg-muted rounded w-64 animate-pulse" />
        <div className="h-80 bg-muted rounded-xl animate-pulse" />
      </PageShell>
    );
  }

  return (
    <PageShell>
      <Fade>
        <PageHeader
          title="Pricing & Prepacks"
          subtitle="Manage wholesale and retail prices across all stores"
          actions={
            <SopTutorialButtons onSopClick={() => setSopOpen(true)} onTutorialClick={() => setTutorialOpen(true)} />
          }
        />
      </Fade>

      <Fade>
        <IndexToolbar
          search={search}
          onSearch={(v) => { setSearch(v); setCurrentPage(1); }}
          placeholder="Search products..."
          color={FAIRE_COLOR}
          extra={
            <select value={selectedStore} onChange={e => { setSelectedStore(e.target.value); setCurrentPage(1); }} className="h-9 text-sm border rounded-lg px-3 bg-background" data-testid="select-store">
              <option value="all">All Stores</option>
              {stores.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          }
        />
      </Fade>

      <Fade>
        <DataTableContainer>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <SortableDataTH sortKey="productName" currentSort={sort} onSort={handleSort}>Product</SortableDataTH>
                <DataTH>Store</DataTH>
                <SortableDataTH sortKey="sku" currentSort={sort} onSort={handleSort}>SKU</SortableDataTH>
                <SortableDataTH sortKey="wholesale" currentSort={sort} onSort={handleSort}>Wholesale</SortableDataTH>
                <SortableDataTH sortKey="retail" currentSort={sort} onSort={handleSort}>Retail</SortableDataTH>
                <SortableDataTH sortKey="margin" currentSort={sort} onSort={handleSort}>Margin %</SortableDataTH>
                <DataTH>MOQ</DataTH>
              </tr>
            </thead>
            <tbody className="divide-y">
              {paginatedRows.map((r: any) => {
                const wholesaleCents = r.wholesale_price_cents ?? 0;
                const retailCents = r.retail_price_cents ?? 0;
                const margin = retailCents > 0 ? Math.round(((retailCents - wholesaleCents) / retailCents) * 100) : 0;
                const mc = marginColor(margin);
                return (
                  <DataTR key={r.id} data-testid={`pricing-row-${r.id}`}>
                    <DataTD>
                      <p className="font-medium">{r.productName}</p>
                      <p className="text-xs text-muted-foreground">{(r.options ?? []).map((o: any) => o.value).join(" / ")}</p>
                    </DataTD>
                    <DataTD><Badge variant="outline" className="text-xs">{r.store?.name?.split(" ")[0] ?? "—"}</Badge></DataTD>
                    <DataTD className="text-muted-foreground">{r.sku}</DataTD>
                    <DataTD className="font-semibold"><DualCurrency cents={wholesaleCents} /></DataTD>
                    <DataTD><DualCurrency cents={retailCents} /></DataTD>
                    <DataTD>
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: mc.bg, color: mc.text }}>{margin}%</span>
                    </DataTD>
                    <DataTD>{r.moq}</DataTD>
                  </DataTR>
                );
              })}
            </tbody>
          </table>
        </DataTableContainer>
      </Fade>

      {sortedRows.length > PAGE_SIZE && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, rows.length)} of {rows.length}
          </p>
          <div className="flex items-center gap-1">
            <Button size="sm" variant="outline" className="h-8" disabled={safePage <= 1} onClick={() => setCurrentPage(p => p - 1)} data-testid="btn-prev-page">Previous</Button>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              let page: number;
              if (totalPages <= 7) page = i + 1;
              else if (safePage <= 4) page = i + 1;
              else if (safePage >= totalPages - 3) page = totalPages - 6 + i;
              else page = safePage - 3 + i;
              return (
                <Button
                  key={page} size="sm"
                  variant={page === safePage ? "default" : "outline"}
                  className="h-8 w-8 p-0"
                  style={page === safePage ? { background: FAIRE_COLOR } : {}}
                  onClick={() => setCurrentPage(page)}
                  data-testid={`btn-page-${page}`}
                >
                  {page}
                </Button>
              );
            })}
            <Button size="sm" variant="outline" className="h-8" disabled={safePage >= totalPages} onClick={() => setCurrentPage(p => p + 1)} data-testid="btn-next-page">Next</Button>
          </div>
        </div>
      )}

      <Fade>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold">Prepacks</h2>
          <Button size="sm" variant="outline" onClick={() => setAddPrepackOpen(true)} data-testid="btn-add-prepack"><Plus size={13} className="mr-1.5" /> Add Prepack</Button>
        </div>
        <DataTableContainer>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <DataTH>Prepack Name</DataTH>
                <DataTH>Products</DataTH>
                <DataTH>Units</DataTH>
                <DataTH>Wholesale</DataTH>
                <DataTH>Store</DataTH>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredPrepacks.map(pp => (
                <DataTR key={pp.id} data-testid={`prepack-row-${pp.id}`}>
                  <DataTD className="font-medium">{pp.name}</DataTD>
                  <DataTD className="text-muted-foreground">{pp.products.join(", ")}</DataTD>
                  <DataTD>{pp.units}</DataTD>
                  <DataTD className="font-semibold"><DualCurrency cents={pp.wholesale_price_cents} /></DataTD>
                  <DataTD><Badge variant="outline" className="text-xs">{stores.find((s: any) => s.id === pp.storeId)?.name?.split(" ")[0] ?? "—"}</Badge></DataTD>
                </DataTR>
              ))}
            </tbody>
          </table>
        </DataTableContainer>
      </Fade>

      <DetailModal
        open={addPrepackOpen}
        onClose={() => setAddPrepackOpen(false)}
        title="Add Prepack"
        subtitle="Create a new product bundle for wholesale orders"
        footer={
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setAddPrepackOpen(false)}>Cancel</Button>
            <Button style={{ background: FAIRE_COLOR }} className="text-white hover:opacity-90" onClick={() => { toast({ title: "Prepack Created", description: prepackName }); setAddPrepackOpen(false); setPrepackName(""); setPrepackPrice(""); }} data-testid="btn-save-prepack">Create Prepack</Button>
          </div>
        }
      >
        <div className="space-y-4 px-6 py-5">
          <div className="space-y-1.5"><Label>Prepack Name</Label><Input value={prepackName} onChange={e => setPrepackName(e.target.value)} placeholder="e.g. Wellness Starter Kit" data-testid="input-prepack-name" /></div>
          <div className="space-y-1.5"><Label>Wholesale Price ($)</Label><Input type="number" value={prepackPrice} onChange={e => setPrepackPrice(e.target.value)} placeholder="e.g. 75.00" data-testid="input-prepack-price" /></div>
        </div>
      </DetailModal>

      <SopModal open={sopOpen} onOpenChange={setSopOpen} config={SOP_REGISTRY["faire-pricing"].sop} color={FAIRE_COLOR} />
      <TutorialModal open={tutorialOpen} onOpenChange={setTutorialOpen} config={SOP_REGISTRY["faire-pricing"].tutorial} color={FAIRE_COLOR} />
    </PageShell>
  );
}
