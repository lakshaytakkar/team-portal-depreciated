import { useState, useMemo, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import {
  Tag, CreditCard, CheckSquare, Upload, AlertTriangle, Search,
  Edit2, ChevronRight, ChevronDown, Plus, Trash2,
  ArrowUpDown, ArrowLeft, ShieldAlert, ShieldCheck, ShieldX, XCircle,
  Download, CheckCircle2, RefreshCw, BarChart3, Settings, ArrowRight,
  TrendingUp, Layers, Brain, FileUp, AlertCircle, Info, Sliders, Package,
} from "lucide-react";
import {
  CATALOG_PRODUCTS, CATALOG_ZONE_TREE, getCatalogStats, SOURCE_LABELS,
  SOURCE_COLORS, ALL_PRODUCT_TAGS,
  type CatalogProduct, type ProductSource, type ProductComplianceStatus,
  type ProductLabelStatus, type ProductTag, type CatalogZone,
} from "@/lib/mock-data-product-catalog";
import { calculateEtsPrices, ETS_CATEGORY_DUTY_RATES, ETS_MRP_BANDS, defaultPriceSettings } from "@/lib/mock-data-ets";
import { mockPriceSettingsStore } from "@/lib/mock-price-settings-store";

const ZONE_NAME: Record<string, string> = {};
const CAT_NAME: Record<string, string> = {};
const SUBCAT_NAME: Record<string, string> = {};
for (const z of CATALOG_ZONE_TREE) {
  ZONE_NAME[z.id] = z.name;
  for (const c of z.categories) {
    CAT_NAME[c.id] = c.name;
    for (const sc of c.subcategories) {
      SUBCAT_NAME[sc.id] = sc.name;
    }
  }
}

function ComplianceBadge({ status }: { status?: ProductComplianceStatus }) {
  if (!status) return <Badge variant="outline" className="text-xs border-gray-300 text-gray-500">Unset</Badge>;
  if (status === "safe") return <Badge className="text-xs bg-green-100 text-green-700 border-green-200">Safe</Badge>;
  if (status === "restricted") return <Badge className="text-xs bg-amber-100 text-amber-700 border-amber-200">Restricted</Badge>;
  return <Badge className="text-xs bg-red-100 text-red-700 border-red-200">Banned</Badge>;
}

function SourceBadge({ source }: { source: ProductSource }) {
  return (
    <Badge variant="outline" className={`text-[10px] ${SOURCE_COLORS[source]}`}>
      {SOURCE_LABELS[source].split(" ")[0]}
    </Badge>
  );
}

export default function EtsProductPortal() {
  const stats = useMemo(() => getCatalogStats(), []);

  const sourceRows = Object.entries(stats.bySource).sort((a, b) => b[1] - a[1]);

  return (
    <div className="px-16 lg:px-24 py-6 space-y-6" data-testid="product-portal-dashboard">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 p-6 text-white shadow-lg">
        <div className="relative z-10">
          <p className="text-sm text-pink-200 mb-1">Product Team</p>
          <h1 className="text-2xl font-bold" data-testid="text-product-title">Catalog Health</h1>
          <div className="flex items-center gap-6 mt-3 text-sm text-pink-100">
            <span><strong className="text-white">{stats.total}</strong> Total SKUs</span>
            <span><strong className="text-white">{stats.compliance.safe}</strong> Safe</span>
            <span><strong className="text-amber-300">{stats.compliance.restricted}</strong> Restricted</span>
            <span><strong className="text-red-300">{stats.compliance.banned}</strong> Banned</span>
          </div>
        </div>
        <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-white/10" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm" data-testid="kpi-total">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Total Products</p>
            <p className="text-3xl font-bold mt-1">{stats.total}</p>
          </CardContent>
        </Card>
        {stats.compliance.banned > 0 && (
          <Card className="border-0 shadow-sm border-l-4 border-l-red-500" data-testid="kpi-banned">
            <CardContent className="p-5">
              <div className="flex items-center gap-1.5 text-red-600 mb-1">
                <ShieldX className="w-4 h-4" />
                <p className="text-sm font-semibold">Banned Products</p>
              </div>
              <p className="text-3xl font-bold text-red-600">{stats.compliance.banned}</p>
              <p className="text-xs text-muted-foreground mt-1">Must be removed from catalog</p>
            </CardContent>
          </Card>
        )}
        <Card className="border-0 shadow-sm" data-testid="kpi-restricted">
          <CardContent className="p-5">
            <div className="flex items-center gap-1.5 text-amber-600 mb-1">
              <ShieldAlert className="w-4 h-4" />
              <p className="text-sm font-medium">Restricted</p>
            </div>
            <p className="text-3xl font-bold">{stats.compliance.restricted}</p>
            <p className="text-xs text-muted-foreground mt-1">Need certification</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm" data-testid="kpi-safe">
          <CardContent className="p-5">
            <div className="flex items-center gap-1.5 text-green-600 mb-1">
              <ShieldCheck className="w-4 h-4" />
              <p className="text-sm font-medium">Safe</p>
            </div>
            <p className="text-3xl font-bold">{stats.compliance.safe}</p>
            <p className="text-xs text-muted-foreground mt-1">Ready to list</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="border-0 shadow-sm lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Products by Source</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-2.5">
            {sourceRows.map(([src, count]) => (
              <div key={src} className="flex items-center gap-3" data-testid={`source-row-${src}`}>
                <div className="w-32 shrink-0">
                  <Badge variant="outline" className={`text-[10px] ${SOURCE_COLORS[src as ProductSource]}`}>
                    {SOURCE_LABELS[src as ProductSource]}
                  </Badge>
                </div>
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-pink-500 rounded-full transition-all"
                    style={{ width: `${(count / stats.total) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-semibold w-8 text-right">{count}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Avg Margin by Origin</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              <div className="flex justify-between items-center" data-testid="margin-china">
                <span className="text-sm">China Products</span>
                <span className="font-bold text-pink-600">{stats.avgMarginChina}%</span>
              </div>
              <div className="flex justify-between items-center" data-testid="margin-india">
                <span className="text-sm">India Products</span>
                <span className="font-bold text-pink-600">{stats.avgMarginIndia}%</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" /> Missing Data
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              {[
                { label: "No MRP assigned", count: stats.missingMrp },
                { label: "No barcode", count: stats.missingBarcode },
                { label: "No category", count: stats.missingCategory },
                { label: "No compliance", count: stats.missingCompliance },
              ].map(({ label, count }) => (
                <div key={label} className="flex justify-between items-center text-sm" data-testid={`missing-${label.replace(/\s+/g, "-").toLowerCase()}`}>
                  <span className="text-muted-foreground">{label}</span>
                  <Badge variant="outline" className={count > 0 ? "border-amber-300 text-amber-700" : "border-green-300 text-green-700"}>
                    {count > 0 ? count : "✓"}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

type SortKey = "name" | "zoneId" | "source" | "exwPriceYuan" | "landedCostInr" | "partnerPriceInr" | "suggestedMrp" | "marginPercent" | "complianceStatus" | "labelStatus" | "barcode";

function sortProducts(list: CatalogProduct[], key: SortKey, dir: "asc" | "desc"): CatalogProduct[] {
  return [...list].sort((a, b) => {
    let av: string | number | undefined;
    let bv: string | number | undefined;
    if (key === "exwPriceYuan") {
      av = a.exwPriceYuan ?? a.wholesalePriceInr ?? 0;
      bv = b.exwPriceYuan ?? b.wholesalePriceInr ?? 0;
    } else {
      av = a[key] as string | number | undefined;
      bv = b[key] as string | number | undefined;
    }
    av = av ?? (typeof av === "string" ? "" : 0);
    bv = bv ?? (typeof bv === "string" ? "" : 0);
    const cmp = typeof av === "string" ? (av as string).localeCompare(bv as string) : (av as number) - (bv as number);
    return dir === "asc" ? cmp : -cmp;
  });
}

export function EtsProductList() {
  const [products, setProducts] = useState<CatalogProduct[]>(CATALOG_PRODUCTS);
  const [search, setSearch] = useState("");
  const [filterSource, setFilterSource] = useState<string>("all");
  const [filterZone, setFilterZone] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterCompliance, setFilterCompliance] = useState<string>("all");
  const [filterMissing, setFilterMissing] = useState<string>("all");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [editingProduct, setEditingProduct] = useState<CatalogProduct | null>(null);
  const [showForm, setShowForm] = useState(false);

  const categoryOptions = useMemo(() => {
    if (filterZone !== "all") {
      const zone = CATALOG_ZONE_TREE.find(z => z.id === filterZone);
      return zone ? zone.categories.map(c => ({ id: c.id, name: c.name, zoneName: zone.name })) : [];
    }
    return CATALOG_ZONE_TREE.flatMap(z => z.categories.map(c => ({ id: c.id, name: c.name, zoneName: z.name })));
  }, [filterZone]);

  function handleSaveProduct(saved: CatalogProduct) {
    setProducts(prev => {
      const idx = prev.findIndex(p => p.id === saved.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = saved;
        return next;
      }
      return [saved, ...prev];
    });
    setShowForm(false);
    setEditingProduct(null);
  }

  const filtered = useMemo(() => {
    let list = products;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.barcode || "").includes(q) ||
          (p.id || "").toLowerCase().includes(q) ||
          (p.zoneId ? ZONE_NAME[p.zoneId] ?? "" : "").toLowerCase().includes(q) ||
          (p.categoryId ? CAT_NAME[p.categoryId] ?? "" : "").toLowerCase().includes(q) ||
          (p.subcategoryId ? SUBCAT_NAME[p.subcategoryId] ?? "" : "").toLowerCase().includes(q)
      );
    }
    if (filterSource !== "all") list = list.filter((p) => p.source === filterSource);
    if (filterZone !== "all") list = list.filter((p) => p.zoneId === filterZone);
    if (filterCategory !== "all") list = list.filter((p) => p.categoryId === filterCategory);
    if (filterCompliance !== "all") {
      if (filterCompliance === "unset") list = list.filter((p) => !p.complianceStatus);
      else list = list.filter((p) => p.complianceStatus === filterCompliance);
    }
    if (filterMissing === "no-mrp") list = list.filter((p) => !p.suggestedMrp);
    if (filterMissing === "no-barcode") list = list.filter((p) => !p.barcode);
    if (filterMissing === "no-category") list = list.filter((p) => !p.zoneId);
    if (filterMissing === "no-compliance") list = list.filter((p) => !p.complianceStatus);

    return sortProducts(list, sortKey, sortDir);
  }, [products, search, filterSource, filterZone, filterCategory, filterCompliance, filterMissing, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  }

  if (showForm) {
    return (
      <EtsProductFormPage
        product={editingProduct}
        onBack={() => { setShowForm(false); setEditingProduct(null); }}
        onSave={handleSaveProduct}
      />
    );
  }

  const cols: { label: string; key: SortKey | null }[] = [
    { label: "Product", key: "name" },
    { label: "Zone / Category", key: "zoneId" },
    { label: "Source", key: "source" },
    { label: "EXW / Wholesale", key: "exwPriceYuan" },
    { label: "Landed ₹", key: "landedCostInr" },
    { label: "Partner ₹", key: "partnerPriceInr" },
    { label: "MRP", key: "suggestedMrp" },
    { label: "Margin", key: "marginPercent" },
    { label: "Compliance", key: "complianceStatus" },
    { label: "Label", key: "labelStatus" },
    { label: "Barcode", key: "barcode" },
    { label: "", key: null },
  ];

  return (
    <div className="px-16 lg:px-24 py-6 space-y-5" data-testid="product-list-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Product List</h1>
          <p className="text-sm text-muted-foreground">{filtered.length} of {CATALOG_PRODUCTS.length} products</p>
        </div>
        <Button
          className="bg-pink-500 hover:bg-pink-600 text-white"
          onClick={() => { setEditingProduct(null); setShowForm(true); }}
          data-testid="button-add-product"
        >
          <Plus className="w-4 h-4 mr-1" /> Add Product
        </Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, barcode, ID, category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            data-testid="input-product-search"
          />
        </div>
        <Select value={filterSource} onValueChange={setFilterSource}>
          <SelectTrigger className="w-44" data-testid="filter-source">
            <SelectValue placeholder="All Sources" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sources</SelectItem>
            {(Object.keys(SOURCE_LABELS) as ProductSource[]).map((s) => (
              <SelectItem key={s} value={s}>{SOURCE_LABELS[s]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterZone} onValueChange={v => { setFilterZone(v); setFilterCategory("all"); }}>
          <SelectTrigger className="w-44" data-testid="filter-zone">
            <SelectValue placeholder="All Zones" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Zones</SelectItem>
            {CATALOG_ZONE_TREE.map(z => (
              <SelectItem key={z.id} value={z.id}>{z.icon} {z.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-48" data-testid="filter-category">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categoryOptions.map(c => (
              <SelectItem key={c.id} value={c.id}>
                <span className="text-xs text-muted-foreground mr-1">{c.zoneName.split(" ")[0]}</span>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterCompliance} onValueChange={setFilterCompliance}>
          <SelectTrigger className="w-40" data-testid="filter-compliance">
            <SelectValue placeholder="All Compliance" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Compliance</SelectItem>
            <SelectItem value="safe">Safe</SelectItem>
            <SelectItem value="restricted">Restricted</SelectItem>
            <SelectItem value="banned">Banned</SelectItem>
            <SelectItem value="unset">Unset</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterMissing} onValueChange={setFilterMissing}>
          <SelectTrigger className="w-40" data-testid="filter-missing">
            <SelectValue placeholder="Missing Fields" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Products</SelectItem>
            <SelectItem value="no-mrp">Missing MRP</SelectItem>
            <SelectItem value="no-barcode">Missing Barcode</SelectItem>
            <SelectItem value="no-category">Missing Category</SelectItem>
            <SelectItem value="no-compliance">Missing Compliance</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="border-b bg-gray-50/80">
            <tr>
              {cols.map(({ label, key }) => (
                <th
                  key={label || "actions"}
                  className={`px-3 py-2.5 text-left font-semibold text-xs text-muted-foreground whitespace-nowrap ${key ? "cursor-pointer hover:text-foreground select-none" : ""} ${sortKey === key ? "text-foreground" : ""}`}
                  onClick={() => key && toggleSort(key)}
                >
                  <div className="flex items-center gap-1">
                    {label}
                    {key && <ArrowUpDown className={`w-3 h-3 ${sortKey === key ? "opacity-100 text-pink-500" : "opacity-40"}`} />}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.map((p) => (
              <tr
                key={p.id}
                className={`hover:bg-gray-50/60 ${p.complianceStatus === "banned" ? "bg-red-50/40" : ""}`}
                data-testid={`product-row-${p.id}`}
              >
                <td className="px-3 py-2.5 max-w-48">
                  <p className="font-medium text-sm truncate" title={p.name}>{p.name}</p>
                  <p className="text-[10px] text-muted-foreground">{p.id}</p>
                </td>
                <td className="px-3 py-2.5 text-xs whitespace-nowrap">
                  {p.zoneId ? (
                    <div>
                      <p className="text-muted-foreground">{ZONE_NAME[p.zoneId] ?? p.zoneId}</p>
                      {p.categoryId && <p className="font-medium text-foreground">{CAT_NAME[p.categoryId]}</p>}
                      {p.subcategoryId && <p className="text-[10px] text-muted-foreground/70">{SUBCAT_NAME[p.subcategoryId]}</p>}
                    </div>
                  ) : <span className="text-amber-500">—</span>}
                </td>
                <td className="px-3 py-2.5"><SourceBadge source={p.source} /></td>
                <td className="px-3 py-2.5 text-xs text-muted-foreground whitespace-nowrap">
                  {p.exwPriceYuan != null ? `¥${p.exwPriceYuan}` : p.wholesalePriceInr != null ? `₹${p.wholesalePriceInr}` : "—"}
                </td>
                <td className="px-3 py-2.5 text-xs">{p.landedCostInr != null ? `₹${p.landedCostInr}` : <span className="text-amber-500">—</span>}</td>
                <td className="px-3 py-2.5 text-xs">{p.partnerPriceInr != null ? `₹${p.partnerPriceInr}` : "—"}</td>
                <td className="px-3 py-2.5 text-xs font-semibold">{p.suggestedMrp != null ? `₹${p.suggestedMrp}` : <span className="text-amber-500">Missing</span>}</td>
                <td className="px-3 py-2.5 text-xs">
                  {p.marginPercent != null ? (
                    <span className={p.marginPercent < 30 ? "text-red-600" : "text-green-600"}>{p.marginPercent}%</span>
                  ) : "—"}
                </td>
                <td className="px-3 py-2.5"><ComplianceBadge status={p.complianceStatus} /></td>
                <td className="px-3 py-2.5">
                  <Badge variant="outline" className={`text-[10px] ${p.labelStatus === "english" ? "border-green-200 text-green-700" : p.labelStatus === "chinese" ? "border-red-200 text-red-700" : "border-amber-200 text-amber-700"}`}>
                    {p.labelStatus === "needs_relabel" ? "Relabel" : p.labelStatus === "chinese" ? "Chinese" : "English"}
                  </Badge>
                </td>
                <td className="px-3 py-2.5 text-[10px] text-muted-foreground">{p.barcode ?? <span className="text-amber-500">Missing</span>}</td>
                <td className="px-3 py-2.5">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0"
                    onClick={() => { setEditingProduct(p); setShowForm(true); }}
                    data-testid={`edit-product-${p.id}`}
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-muted-foreground text-sm">No products match the current filters</div>
        )}
      </div>
    </div>
  );
}

function EtsProductFormPage({ product, onBack, onSave }: { product: CatalogProduct | null; onBack: () => void; onSave: (p: CatalogProduct) => void }) {
  const isNew = product === null;
  const [activeTab, setActiveTab] = useState("basic");
  const [formData, setFormData] = useState({
    name: product?.name ?? "",
    description: product?.description ?? "",
    zoneId: product?.zoneId ?? "",
    categoryId: product?.categoryId ?? "",
    subcategoryId: product?.subcategoryId ?? "",
    barcode: product?.barcode ?? "",
    imageUrl: product?.imageUrl ?? "",
    tags: product?.tags ?? [] as ProductTag[],
    source: product?.source ?? ("china_haoduobao" as ProductSource),
    supplierName: product?.supplierName ?? "",
    exwPriceYuan: product?.exwPriceYuan ?? 0,
    wholesalePriceInr: product?.wholesalePriceInr ?? 0,
    moq: product?.moq ?? 6,
    unitsPerCarton: product?.unitsPerCarton ?? 12,
    cartonLengthCm: product?.cartonLengthCm ?? 40,
    cartonWidthCm: product?.cartonWidthCm ?? 30,
    cartonHeightCm: product?.cartonHeightCm ?? 30,
    mrpOverride: product?.suggestedMrp ?? undefined as number | undefined,
    complianceStatus: product?.complianceStatus ?? ("safe" as ProductComplianceStatus),
    bisRequired: product?.bisRequired ?? false,
    complianceNotes: product?.complianceNotes ?? "",
    labelStatus: product?.labelStatus ?? ("english" as ProductLabelStatus),
  });

  const isChina = formData.source.startsWith("china_");

  const pricing = useMemo(() => {
    if (!isChina || !formData.exwPriceYuan) return null;
    const dutyKey = Object.keys(ETS_CATEGORY_DUTY_RATES).find(k =>
      formData.categoryId?.includes(k) || formData.zoneId?.includes(k)
    );
    const rates = dutyKey ? ETS_CATEGORY_DUTY_RATES[dutyKey as keyof typeof ETS_CATEGORY_DUTY_RATES] : { duty: 15, igst: 18 };
    return calculateEtsPrices({
      exwPriceYuan: formData.exwPriceYuan,
      unitsPerCarton: formData.unitsPerCarton,
      cartonLengthCm: formData.cartonLengthCm,
      cartonWidthCm: formData.cartonWidthCm,
      cartonHeightCm: formData.cartonHeightCm,
      categoryDutyPercent: rates.duty,
      categoryIgstPercent: rates.igst,
      exchangeRate: 12.0,
      sourcingCommission: formData.source === "china_haoduobao" ? 3 : 5,
      freightPerCbm: 8000,
      insurancePercent: 0.5,
      swSurchargePercent: 10,
      ourMarkupPercent: 25,
      targetStoreMargin: 35,
    });
  }, [formData.exwPriceYuan, formData.source, formData.unitsPerCarton, formData.cartonLengthCm, formData.cartonWidthCm, formData.cartonHeightCm, formData.categoryId, formData.zoneId, isChina]);

  const selectedZone = CATALOG_ZONE_TREE.find(z => z.id === formData.zoneId);
  const selectedCat = selectedZone?.categories.find(c => c.id === formData.categoryId);

  function updateField<K extends keyof typeof formData>(k: K, v: (typeof formData)[K]) {
    setFormData(prev => ({ ...prev, [k]: v }));
  }

  function handleSave() {
    const saved: CatalogProduct = {
      id: product?.id ?? `PRD-NEW-${Date.now()}`,
      name: formData.name || "Untitled Product",
      description: formData.description,
      zoneId: formData.zoneId || undefined,
      categoryId: formData.categoryId || undefined,
      subcategoryId: formData.subcategoryId || undefined,
      barcode: formData.barcode || undefined,
      imageUrl: formData.imageUrl || undefined,
      tags: formData.tags,
      source: formData.source,
      supplierName: formData.supplierName,
      exwPriceYuan: isChina ? (formData.exwPriceYuan || undefined) : undefined,
      wholesalePriceInr: !isChina ? (formData.wholesalePriceInr || undefined) : undefined,
      moq: formData.moq,
      unitsPerCarton: formData.unitsPerCarton,
      cartonLengthCm: formData.cartonLengthCm,
      cartonWidthCm: formData.cartonWidthCm,
      cartonHeightCm: formData.cartonHeightCm,
      landedCostInr: pricing ? pricing.totalLandedCost : (!isChina && formData.wholesalePriceInr ? Math.round(formData.wholesalePriceInr * 1.2) : undefined),
      partnerPriceInr: pricing ? pricing.storeLandingPrice : (!isChina && formData.wholesalePriceInr ? Math.round(formData.wholesalePriceInr * 1.2 * 1.25) : undefined),
      suggestedMrp: formData.mrpOverride ?? (pricing ? pricing.suggestedMrp : undefined),
      marginPercent: pricing ? pricing.storeMarginPercent : undefined,
      complianceStatus: formData.complianceStatus,
      bisRequired: formData.bisRequired,
      complianceNotes: formData.complianceNotes || undefined,
      labelStatus: formData.labelStatus,
    };
    onSave(saved);
  }

  function toggleTag(tag: ProductTag) {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag) ? prev.tags.filter(t => t !== tag) : [...prev.tags, tag],
    }));
  }

  return (
    <div className="px-16 lg:px-24 py-6 space-y-5" data-testid="product-form-page">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack} data-testid="button-back-product">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to List
        </Button>
        <div>
          <h1 className="text-xl font-bold">{isNew ? "Add New Product" : "Edit Product"}</h1>
          {product && <p className="text-sm text-muted-foreground">{product.id}</p>}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full max-w-lg">
          <TabsTrigger value="basic" data-testid="tab-basic-info">Basic Info</TabsTrigger>
          <TabsTrigger value="sourcing" data-testid="tab-sourcing">Sourcing</TabsTrigger>
          <TabsTrigger value="pricing" data-testid="tab-pricing">Pricing</TabsTrigger>
          <TabsTrigger value="compliance" data-testid="tab-compliance">Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="mt-5">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6 grid md:grid-cols-2 gap-5">
              <div className="md:col-span-2 space-y-1.5">
                <Label htmlFor="name">Product Name *</Label>
                <Input id="name" value={formData.name} onChange={e => updateField("name", e.target.value)} placeholder="e.g. Non-Stick Granite Frying Pan 26cm" data-testid="input-product-name" />
              </div>
              <div className="md:col-span-2 space-y-1.5">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" value={formData.description} onChange={e => updateField("description", e.target.value)} rows={3} placeholder="Product description..." data-testid="input-product-description" />
              </div>
              <div className="space-y-1.5">
                <Label>Zone *</Label>
                <Select value={formData.zoneId} onValueChange={v => { updateField("zoneId", v); updateField("categoryId", ""); updateField("subcategoryId", ""); }}>
                  <SelectTrigger data-testid="select-zone">
                    <SelectValue placeholder="Select Zone" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATALOG_ZONE_TREE.map(z => (
                      <SelectItem key={z.id} value={z.id}>{z.icon} {z.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Category *</Label>
                <Select value={formData.categoryId} onValueChange={v => { updateField("categoryId", v); updateField("subcategoryId", ""); }} disabled={!formData.zoneId}>
                  <SelectTrigger data-testid="select-category">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedZone?.categories.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Subcategory</Label>
                <Select value={formData.subcategoryId} onValueChange={v => updateField("subcategoryId", v)} disabled={!formData.categoryId}>
                  <SelectTrigger data-testid="select-subcategory">
                    <SelectValue placeholder="Select Subcategory" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedCat?.subcategories.map(sc => (
                      <SelectItem key={sc.id} value={sc.id}>{sc.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="barcode">Barcode (EAN-13)</Label>
                <Input id="barcode" value={formData.barcode} onChange={e => updateField("barcode", e.target.value)} placeholder="8901234567890" data-testid="input-barcode" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="imageUrl">Image URL</Label>
                <Input id="imageUrl" value={formData.imageUrl} onChange={e => updateField("imageUrl", e.target.value)} placeholder="https://..." data-testid="input-image-url" />
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label>Tags</Label>
                <div className="flex flex-wrap gap-2">
                  {ALL_PRODUCT_TAGS.map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      data-testid={`tag-${tag.toLowerCase().replace(/\s+/g, "-")}`}
                      className={`text-xs px-3 py-1 rounded-full border transition-colors ${formData.tags.includes(tag) ? "bg-pink-100 border-pink-300 text-pink-700" : "border-gray-200 text-gray-500 hover:border-gray-300"}`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
          <div className="flex justify-end mt-4">
            <Button className="bg-pink-500 hover:bg-pink-600 text-white" onClick={() => setActiveTab("sourcing")} data-testid="button-next-sourcing">Next: Sourcing →</Button>
          </div>
        </TabsContent>

        <TabsContent value="sourcing" className="mt-5">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6 grid md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <Label>Source *</Label>
                <Select value={formData.source} onValueChange={v => updateField("source", v as ProductSource)}>
                  <SelectTrigger data-testid="select-source">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(SOURCE_LABELS) as ProductSource[]).map(s => (
                      <SelectItem key={s} value={s}>{SOURCE_LABELS[s]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="supplier">Supplier Name</Label>
                <Input id="supplier" value={formData.supplierName} onChange={e => updateField("supplierName", e.target.value)} placeholder="e.g. Haoduobao Industrial" data-testid="input-supplier" />
              </div>
              {isChina ? (
                <div className="space-y-1.5">
                  <Label htmlFor="exw">EXW Price (¥ Yuan) *</Label>
                  <Input id="exw" type="number" value={formData.exwPriceYuan} onChange={e => updateField("exwPriceYuan", Number(e.target.value))} placeholder="18.50" data-testid="input-exw-yuan" />
                </div>
              ) : (
                <div className="space-y-1.5">
                  <Label htmlFor="wholesale">Wholesale Price (₹ INR) *</Label>
                  <Input id="wholesale" type="number" value={formData.wholesalePriceInr} onChange={e => updateField("wholesalePriceInr", Number(e.target.value))} placeholder="180" data-testid="input-wholesale-inr" />
                </div>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="moq">Minimum Order Qty (MOQ)</Label>
                <Input id="moq" type="number" value={formData.moq} onChange={e => updateField("moq", Number(e.target.value))} data-testid="input-moq" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="upc">Units per Carton</Label>
                <Input id="upc" type="number" value={formData.unitsPerCarton} onChange={e => updateField("unitsPerCarton", Number(e.target.value))} data-testid="input-units-per-carton" />
              </div>
              <div className="md:col-span-2">
                <Label className="mb-2 block">Carton Dimensions (cm)</Label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Length", key: "cartonLengthCm" as const, testId: "input-carton-length" },
                    { label: "Width", key: "cartonWidthCm" as const, testId: "input-carton-width" },
                    { label: "Height", key: "cartonHeightCm" as const, testId: "input-carton-height" },
                  ].map(({ label, key, testId }) => (
                    <div key={key} className="space-y-1">
                      <Label className="text-xs text-muted-foreground">{label}</Label>
                      <Input type="number" value={formData[key]} onChange={e => updateField(key, Number(e.target.value))} data-testid={testId} />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
          <div className="flex justify-between mt-4">
            <Button variant="outline" onClick={() => setActiveTab("basic")}>← Back</Button>
            <Button className="bg-pink-500 hover:bg-pink-600 text-white" onClick={() => setActiveTab("pricing")} data-testid="button-next-pricing">Next: Pricing →</Button>
          </div>
        </TabsContent>

        <TabsContent value="pricing" className="mt-5">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              {isChina && pricing ? (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground mb-4">Auto-calculated from EXW price using global price engine settings.</p>
                  <div className="grid md:grid-cols-2 gap-4">
                    {[
                      { label: "FOB Price (¥)", value: `¥${pricing.fobPriceYuan}` },
                      { label: "FOB Price (₹)", value: `₹${pricing.fobPriceInr}` },
                      { label: "Freight per Unit", value: `₹${pricing.freightPerUnit}` },
                      { label: "CIF Price (₹)", value: `₹${pricing.cifPriceInr}` },
                      { label: "Customs Duty", value: `₹${pricing.customsDuty}` },
                      { label: "IGST", value: `₹${pricing.igst}` },
                      { label: "Total Landed Cost", value: `₹${pricing.totalLandedCost}`, highlight: true },
                      { label: "Partner Price (with markup)", value: `₹${pricing.storeLandingPrice}`, highlight: true },
                      { label: "Suggested MRP", value: `₹${pricing.suggestedMrp}`, highlight: true },
                      { label: "Partner Margin", value: `${pricing.storeMarginPercent}%`, highlight: pricing.marginWarning },
                    ].map(({ label, value, highlight }) => (
                      <div key={label} className={`flex justify-between items-center py-2 border-b last:border-0 ${highlight ? "font-semibold" : ""}`} data-testid={`pricing-${label.toLowerCase().replace(/\s+/g, "-")}`}>
                        <span className={`text-sm ${highlight ? "" : "text-muted-foreground"}`}>{label}</span>
                        <span className={highlight ? "text-pink-600" : ""}>{value}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 space-y-1.5">
                    <Label htmlFor="mrp-override">Override Suggested MRP (₹)</Label>
                    <Input
                      id="mrp-override"
                      type="number"
                      value={formData.mrpOverride ?? ""}
                      onChange={e => updateField("mrpOverride", e.target.value ? Number(e.target.value) : undefined)}
                      placeholder={`Suggested: ₹${pricing.suggestedMrp}`}
                      data-testid="input-mrp-override"
                    />
                    <p className="text-xs text-muted-foreground">Leave blank to use the suggested MRP above</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {isChina ? "Enter EXW price in the Sourcing tab to see auto-calculated pricing." : "For India-sourced products, pricing is based on the wholesale price plus your markup."}
                  </p>
                  {!isChina && formData.wholesalePriceInr > 0 && (
                    <div className="grid md:grid-cols-2 gap-4">
                      {[
                        { label: "Wholesale Price", value: `₹${formData.wholesalePriceInr}` },
                        { label: "Landed Cost (est.)", value: `₹${Math.round(formData.wholesalePriceInr * 1.2)}` },
                        { label: "Partner Price (+25% markup)", value: `₹${Math.round(formData.wholesalePriceInr * 1.2 * 1.25)}`, highlight: true },
                      ].map(({ label, value, highlight }) => (
                        <div key={label} className={`flex justify-between items-center py-2 border-b last:border-0 ${highlight ? "font-semibold" : ""}`}>
                          <span className={`text-sm ${highlight ? "" : "text-muted-foreground"}`}>{label}</span>
                          <span className={highlight ? "text-pink-600" : ""}>{value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="space-y-1.5">
                    <Label htmlFor="mrp-manual">Suggested MRP (₹)</Label>
                    <Input id="mrp-manual" type="number" value={formData.mrpOverride ?? ""} onChange={e => updateField("mrpOverride", e.target.value ? Number(e.target.value) : undefined)} placeholder="e.g. 299" data-testid="input-mrp-manual" />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          <div className="flex justify-between mt-4">
            <Button variant="outline" onClick={() => setActiveTab("sourcing")}>← Back</Button>
            <Button className="bg-pink-500 hover:bg-pink-600 text-white" onClick={() => setActiveTab("compliance")} data-testid="button-next-compliance">Next: Compliance →</Button>
          </div>
        </TabsContent>

        <TabsContent value="compliance" className="mt-5">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6 space-y-5">
              {formData.complianceStatus === "banned" && (
                <div className="flex items-start gap-2 p-4 rounded-xl bg-red-50 border border-red-200" data-testid="banned-warning">
                  <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-red-700">This product is marked as BANNED</p>
                    <p className="text-xs text-red-600 mt-1">Banned products cannot appear in the partner catalog. Remove or resolve the compliance issue before listing.</p>
                  </div>
                </div>
              )}
              <div className="space-y-1.5">
                <Label>Compliance Status *</Label>
                <Select value={formData.complianceStatus} onValueChange={v => updateField("complianceStatus", v as ProductComplianceStatus)}>
                  <SelectTrigger data-testid="select-compliance-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="safe">✅ Safe — can be listed</SelectItem>
                    <SelectItem value="restricted">⚠️ Restricted — needs certification</SelectItem>
                    <SelectItem value="banned">🚫 Banned — must not be listed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="bis"
                  checked={formData.bisRequired}
                  onCheckedChange={v => updateField("bisRequired", Boolean(v))}
                  data-testid="checkbox-bis"
                />
                <Label htmlFor="bis">BIS Certification Required</Label>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="compliance-notes">Compliance Notes</Label>
                <Textarea
                  id="compliance-notes"
                  value={formData.complianceNotes}
                  onChange={e => updateField("complianceNotes", e.target.value)}
                  rows={3}
                  placeholder="e.g. BIS certification mandatory for toys, do not list until certified"
                  data-testid="input-compliance-notes"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Label Status</Label>
                <Select value={formData.labelStatus} onValueChange={v => updateField("labelStatus", v as ProductLabelStatus)}>
                  <SelectTrigger data-testid="select-label-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="english">English — ready</SelectItem>
                    <SelectItem value="chinese">Chinese — needs English label</SelectItem>
                    <SelectItem value="needs_relabel">Needs Relabelling</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
          <div className="flex justify-between mt-4">
            <Button variant="outline" onClick={() => setActiveTab("pricing")}>← Back</Button>
            <Button className="bg-pink-500 hover:bg-pink-600 text-white" onClick={handleSave} data-testid="button-save-product">
              {isNew ? "Add Product" : "Save Changes"}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

type TreeNodeState = Record<string, boolean>;

export function EtsProductCategories() {
  const [expanded, setExpanded] = useState<TreeNodeState>({});
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
  const [selectedCatId, setSelectedCatId] = useState<string | null>(null);
  const [zones, setZones] = useState<CatalogZone[]>(CATALOG_ZONE_TREE);

  const [showAddZone, setShowAddZone] = useState(false);
  const [showAddCatFor, setShowAddCatFor] = useState<string | null>(null);
  const [showAddSubcatFor, setShowAddSubcatFor] = useState<string | null>(null);
  const [addInput, setAddInput] = useState("");

  const [editingZoneId, setEditingZoneId] = useState<string | null>(null);
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editingSubcatId, setEditingSubcatId] = useState<string | null>(null);
  const [editInput, setEditInput] = useState("");
  const [editDesc, setEditDesc] = useState("");

  function toggleExpand(id: string) {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  }

  const selectedZone = zones.find(z => z.id === selectedZoneId) ?? null;
  const selectedCat = selectedZone?.categories.find(c => c.id === selectedCatId) ?? null;

  const totalProducts = CATALOG_PRODUCTS.length;
  function zoneCount(zoneId: string) { return CATALOG_PRODUCTS.filter(p => p.zoneId === zoneId).length; }
  function catCount(zoneId: string, catId: string) { return CATALOG_PRODUCTS.filter(p => p.zoneId === zoneId && p.categoryId === catId).length; }
  function subcatCount(scId: string) { return CATALOG_PRODUCTS.filter(p => p.subcategoryId === scId).length; }

  function handleAddZone() {
    if (!addInput.trim()) return;
    const id = `zone_${addInput.trim().toLowerCase().replace(/\s+/g, "_")}_${Date.now()}`;
    setZones(prev => [...prev, { id, name: addInput.trim(), icon: "📦", description: "", categories: [] }]);
    setShowAddZone(false);
    setAddInput("");
  }

  function handleAddCategory() {
    if (!addInput.trim() || !showAddCatFor) return;
    const zoneId = showAddCatFor;
    const id = `${zoneId}_${addInput.trim().toLowerCase().replace(/\s+/g, "_")}_${Date.now()}`;
    setZones(prev => prev.map(z => z.id === zoneId
      ? { ...z, categories: [...z.categories, { id, name: addInput.trim(), subcategories: [] }] }
      : z
    ));
    setShowAddCatFor(null);
    setAddInput("");
  }

  function handleAddSubcategory() {
    if (!addInput.trim() || !showAddSubcatFor) return;
    const catId = showAddSubcatFor;
    const id = `${catId}_${addInput.trim().toLowerCase().replace(/\s+/g, "_")}_${Date.now()}`;
    setZones(prev => prev.map(z => ({
      ...z,
      categories: z.categories.map(c => c.id === catId
        ? { ...c, subcategories: [...c.subcategories, { id, name: addInput.trim() }] }
        : c
      ),
    })));
    setShowAddSubcatFor(null);
    setAddInput("");
  }

  function handleSaveSubcatEdit(catId: string) {
    if (!editInput.trim() || !editingSubcatId) return;
    setZones(prev => prev.map(z => ({
      ...z,
      categories: z.categories.map(c => c.id === catId
        ? { ...c, subcategories: c.subcategories.map(sc => sc.id === editingSubcatId ? { ...sc, name: editInput.trim(), description: editDesc.trim() || undefined } : sc) }
        : c
      ),
    })));
    setEditingSubcatId(null);
    setEditInput("");
    setEditDesc("");
  }

  function handleSaveZoneEdit() {
    if (!editInput.trim() || !editingZoneId) return;
    setZones(prev => prev.map(z => z.id === editingZoneId ? { ...z, name: editInput.trim(), description: editDesc.trim() || undefined } : z));
    setEditingZoneId(null);
    setEditInput("");
    setEditDesc("");
  }

  function handleSaveCatEdit() {
    if (!editInput.trim() || !editingCatId || !selectedZone) return;
    setZones(prev => prev.map(z => z.id === selectedZone.id
      ? { ...z, categories: z.categories.map(c => c.id === editingCatId ? { ...c, name: editInput.trim(), description: editDesc.trim() || undefined } : c) }
      : z
    ));
    setEditingCatId(null);
    setEditInput("");
    setEditDesc("");
  }

  function handleDeleteZone(zoneId: string) {
    setZones(prev => prev.filter(z => z.id !== zoneId));
    if (selectedZoneId === zoneId) { setSelectedZoneId(null); setSelectedCatId(null); }
  }

  function handleDeleteCategory(zoneId: string, catId: string) {
    setZones(prev => prev.map(z => z.id === zoneId
      ? { ...z, categories: z.categories.filter(c => c.id !== catId) }
      : z
    ));
    if (selectedCatId === catId) setSelectedCatId(null);
  }

  function handleDeleteSubcategory(catId: string, scId: string) {
    setZones(prev => prev.map(z => ({
      ...z,
      categories: z.categories.map(c => c.id === catId
        ? { ...c, subcategories: c.subcategories.filter(sc => sc.id !== scId) }
        : c
      ),
    })));
  }

  function startEditZone(zone: CatalogZone) {
    setEditingZoneId(zone.id);
    setEditingCatId(null);
    setEditInput(zone.name);
    setEditDesc(zone.description ?? "");
  }

  function startEditCat(cat: { id: string; name: string; description?: string }) {
    setEditingCatId(cat.id);
    setEditingZoneId(null);
    setEditInput(cat.name);
    setEditDesc(cat.description ?? "");
  }

  return (
    <div className="px-16 lg:px-24 py-6" data-testid="categories-page">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold">Category Manager</h1>
          <p className="text-sm text-muted-foreground">{totalProducts} products across {zones.length} zones</p>
        </div>
        <Button
          className="bg-pink-500 hover:bg-pink-600 text-white"
          onClick={() => { setShowAddZone(true); setShowAddCatFor(null); setShowAddSubcatFor(null); setAddInput(""); }}
          data-testid="button-add-zone"
        >
          <Plus className="w-4 h-4 mr-1" /> Add Zone
        </Button>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2 space-y-1" data-testid="category-tree">
          {zones.map(zone => (
            <div key={zone.id}>
              <button
                type="button"
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${selectedZoneId === zone.id && !selectedCatId ? "bg-pink-50 text-pink-700" : "hover:bg-gray-50"}`}
                onClick={() => { toggleExpand(zone.id); setSelectedZoneId(zone.id); setSelectedCatId(null); }}
                data-testid={`zone-${zone.id}`}
              >
                {expanded[zone.id] ? <ChevronDown className="w-4 h-4 shrink-0 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 shrink-0 text-muted-foreground" />}
                <span>{zone.icon}</span>
                <span className="flex-1 text-left truncate">{zone.name}</span>
                <Badge variant="outline" className="text-[10px] shrink-0">{zoneCount(zone.id)}</Badge>
              </button>
              {expanded[zone.id] && (
                <div className="ml-5 space-y-0.5 mt-0.5">
                  {zone.categories.map(cat => (
                    <div key={cat.id}>
                      <button
                        type="button"
                        className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${selectedCatId === cat.id ? "bg-pink-50 text-pink-700 font-medium" : "hover:bg-gray-50 text-muted-foreground"}`}
                        onClick={() => { setSelectedZoneId(zone.id); setSelectedCatId(cat.id); setExpanded(prev => ({ ...prev, [`cat-${cat.id}`]: !prev[`cat-${cat.id}`] })); }}
                        data-testid={`cat-${cat.id}`}
                      >
                        {expanded[`cat-${cat.id}`] ? <ChevronDown className="w-3.5 h-3.5 shrink-0" /> : <ChevronRight className="w-3.5 h-3.5 shrink-0" />}
                        <span className="flex-1 text-left truncate">{cat.name}</span>
                        <Badge variant="outline" className="text-[10px] shrink-0">{catCount(zone.id, cat.id)}</Badge>
                      </button>
                      {expanded[`cat-${cat.id}`] && (
                        <div className="ml-5 space-y-0.5 mt-0.5">
                          {cat.subcategories.map(sc => (
                            <div key={sc.id} className="flex items-center gap-2 px-3 py-1 text-xs text-muted-foreground rounded-lg hover:bg-gray-50" data-testid={`subcat-${sc.id}`}>
                              <span className="w-1 h-1 rounded-full bg-gray-300 shrink-0" />
                              <span className="flex-1">{sc.name}</span>
                              <span className="text-[10px]">{subcatCount(sc.id)}</span>
                            </div>
                          ))}
                          {showAddSubcatFor === cat.id ? (
                            <div className="p-2 rounded-lg border border-pink-200 bg-pink-50/50 space-y-1.5" data-testid={`add-subcat-form-${cat.id}`}>
                              <Input autoFocus value={addInput} onChange={e => setAddInput(e.target.value)} placeholder="Subcategory name..." className="h-7 text-xs" data-testid="input-subcat-name"
                                onKeyDown={e => { if (e.key === "Enter") handleAddSubcategory(); if (e.key === "Escape") { setShowAddSubcatFor(null); setAddInput(""); } }} />
                              <div className="flex gap-1">
                                <Button size="sm" className="h-6 text-xs bg-pink-500 hover:bg-pink-600 text-white px-2" onClick={handleAddSubcategory} data-testid="button-save-subcat">Add</Button>
                                <Button size="sm" variant="ghost" className="h-6 text-xs px-2" onClick={() => { setShowAddSubcatFor(null); setAddInput(""); }}>Cancel</Button>
                              </div>
                            </div>
                          ) : (
                            <button type="button" className="flex items-center gap-1.5 px-3 py-1 text-xs text-pink-600 hover:bg-pink-50 rounded-lg w-full"
                              onClick={() => { setShowAddSubcatFor(cat.id); setShowAddCatFor(null); setShowAddZone(false); setAddInput(""); }}
                              data-testid={`add-subcat-${cat.id}`}>
                              <Plus className="w-3 h-3" /> Add subcategory
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                  {showAddCatFor === zone.id ? (
                    <div className="p-2 rounded-lg border border-pink-200 bg-pink-50/50 space-y-1.5" data-testid={`add-cat-form-${zone.id}`}>
                      <Input autoFocus value={addInput} onChange={e => setAddInput(e.target.value)} placeholder="Category name..." className="h-7 text-xs" data-testid="input-cat-name"
                        onKeyDown={e => { if (e.key === "Enter") handleAddCategory(); if (e.key === "Escape") { setShowAddCatFor(null); setAddInput(""); } }} />
                      <div className="flex gap-1">
                        <Button size="sm" className="h-6 text-xs bg-pink-500 hover:bg-pink-600 text-white px-2" onClick={handleAddCategory} data-testid="button-save-cat">Add</Button>
                        <Button size="sm" variant="ghost" className="h-6 text-xs px-2" onClick={() => { setShowAddCatFor(null); setAddInput(""); }}>Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <button type="button" className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-pink-600 hover:bg-pink-50 rounded-lg w-full"
                      onClick={() => { setShowAddCatFor(zone.id); setShowAddSubcatFor(null); setShowAddZone(false); setAddInput(""); }}
                      data-testid={`add-cat-${zone.id}`}>
                      <Plus className="w-3 h-3" /> Add category
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}

          {showAddZone && (
            <div className="p-3 rounded-xl border border-pink-200 bg-pink-50/50 space-y-2 mt-2" data-testid="add-zone-form">
              <Label className="text-xs font-medium">New Zone Name</Label>
              <Input autoFocus value={addInput} onChange={e => setAddInput(e.target.value)} placeholder="e.g. Sports Zone" className="h-8 text-sm" data-testid="input-zone-name"
                onKeyDown={e => { if (e.key === "Enter") handleAddZone(); if (e.key === "Escape") { setShowAddZone(false); setAddInput(""); } }} />
              <div className="flex gap-2">
                <Button size="sm" className="h-7 bg-pink-500 hover:bg-pink-600 text-white text-xs" onClick={handleAddZone} data-testid="button-save-zone">Add Zone</Button>
                <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => { setShowAddZone(false); setAddInput(""); }}>Cancel</Button>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-3">
          {selectedCat && selectedZone ? (
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">{selectedZone.name}</p>
                    {editingCatId === selectedCat.id ? (
                      <div className="space-y-2 mt-1">
                        <Input autoFocus value={editInput} onChange={e => setEditInput(e.target.value)} className="h-8 text-base font-bold" placeholder="Category name" data-testid="input-edit-cat-name"
                          onKeyDown={e => { if (e.key === "Escape") { setEditingCatId(null); setEditInput(""); setEditDesc(""); } }} />
                        <Input value={editDesc} onChange={e => setEditDesc(e.target.value)} className="h-7 text-sm" placeholder="Short description (optional)" data-testid="input-edit-cat-desc" />
                        <div className="flex gap-2">
                          <Button size="sm" className="h-7 bg-pink-500 hover:bg-pink-600 text-white" onClick={handleSaveCatEdit} data-testid="button-save-cat-edit">Save</Button>
                          <Button size="sm" variant="ghost" className="h-7" onClick={() => { setEditingCatId(null); setEditInput(""); setEditDesc(""); }}>Cancel</Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <CardTitle className="text-lg">{selectedCat.name}</CardTitle>
                        {selectedCat.description && <p className="text-sm text-muted-foreground mt-0.5">{selectedCat.description}</p>}
                      </>
                    )}
                  </div>
                  {editingCatId !== selectedCat.id && (
                    <div className="flex gap-2 ml-3">
                      <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => startEditCat(selectedCat)} data-testid="button-edit-category">
                        <Edit2 className="w-3.5 h-3.5 mr-1" />Edit
                      </Button>
                      <Button size="sm" variant="outline" className="h-8 text-xs text-red-600 border-red-200"
                        onClick={() => handleDeleteCategory(selectedZone.id, selectedCat.id)}
                        data-testid="button-delete-category">
                        <Trash2 className="w-3.5 h-3.5 mr-1" />Delete
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-0 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-xl bg-gray-50">
                    <p className="text-sm text-muted-foreground">Products in Category</p>
                    <p className="text-2xl font-bold">{catCount(selectedZone.id, selectedCat.id)}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-gray-50">
                    <p className="text-sm text-muted-foreground">Subcategories</p>
                    <p className="text-2xl font-bold">{selectedCat.subcategories.length}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold mb-2">Subcategories</p>
                  <div className="space-y-1.5">
                    {selectedCat.subcategories.map(sc => (
                      <div key={sc.id} className="p-2.5 rounded-lg border" data-testid={`detail-subcat-${sc.id}`}>
                        {editingSubcatId === sc.id ? (
                          <div className="space-y-1.5">
                            <Input autoFocus value={editInput} onChange={e => setEditInput(e.target.value)} className="h-7 text-sm"
                              placeholder="Subcategory name"
                              data-testid={`input-edit-subcat-${sc.id}`}
                              onKeyDown={e => { if (e.key === "Escape") { setEditingSubcatId(null); setEditInput(""); setEditDesc(""); } }} />
                            <Input value={editDesc} onChange={e => setEditDesc(e.target.value)} className="h-6 text-xs" placeholder="Description (optional)" data-testid={`input-edit-subcat-desc-${sc.id}`} />
                            <div className="flex gap-1.5">
                              <Button size="sm" className="h-6 bg-pink-500 hover:bg-pink-600 text-white text-xs" onClick={() => handleSaveSubcatEdit(selectedCat.id)} data-testid={`save-subcat-edit-${sc.id}`}>Save</Button>
                              <Button size="sm" variant="ghost" className="h-6 text-xs" onClick={() => { setEditingSubcatId(null); setEditInput(""); setEditDesc(""); }}>Cancel</Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-sm">{sc.name}</span>
                              {sc.description && <p className="text-xs text-muted-foreground mt-0.5">{sc.description}</p>}
                            </div>
                            <div className="flex items-center gap-1">
                              <Badge variant="outline" className="text-[10px]">{subcatCount(sc.id)} products</Badge>
                              <Button size="sm" variant="ghost" className="h-7 w-7 p-0"
                                onClick={() => { setEditingSubcatId(sc.id); setEditInput(sc.name); setEditDesc(sc.description ?? ""); setEditingZoneId(null); setEditingCatId(null); }}
                                data-testid={`edit-subcat-${sc.id}`}>
                                <Edit2 className="w-3 h-3 text-muted-foreground" />
                              </Button>
                              <Button size="sm" variant="ghost" className="h-7 w-7 p-0"
                                onClick={() => handleDeleteSubcategory(selectedCat.id, sc.id)}
                                data-testid={`delete-subcat-${sc.id}`}>
                                <Trash2 className="w-3 h-3 text-red-500" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                    {showAddSubcatFor === `detail-${selectedCat.id}` ? (
                      <div className="flex gap-2 p-2 rounded-lg border border-pink-200 bg-pink-50/50" data-testid="add-subcat-detail-form">
                        <Input autoFocus value={addInput} onChange={e => setAddInput(e.target.value)} placeholder="New subcategory..." className="h-7 text-sm"
                          onKeyDown={e => {
                            if (e.key === "Enter") {
                              const catId = selectedCat.id;
                              const id = `${catId}_${addInput.trim().toLowerCase().replace(/\s+/g, "_")}_${Date.now()}`;
                              setZones(prev => prev.map(z => ({ ...z, categories: z.categories.map(c => c.id === catId ? { ...c, subcategories: [...c.subcategories, { id, name: addInput.trim() }] } : c) })));
                              setShowAddSubcatFor(null); setAddInput("");
                            }
                            if (e.key === "Escape") { setShowAddSubcatFor(null); setAddInput(""); }
                          }} />
                        <Button size="sm" className="h-7 bg-pink-500 hover:bg-pink-600 text-white text-xs" onClick={() => {
                          const catId = selectedCat.id;
                          if (!addInput.trim()) return;
                          const id = `${catId}_${addInput.trim().toLowerCase().replace(/\s+/g, "_")}_${Date.now()}`;
                          setZones(prev => prev.map(z => ({ ...z, categories: z.categories.map(c => c.id === catId ? { ...c, subcategories: [...c.subcategories, { id, name: addInput.trim() }] } : c) })));
                          setShowAddSubcatFor(null); setAddInput("");
                        }} data-testid="button-save-detail-subcat">Add</Button>
                        <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => { setShowAddSubcatFor(null); setAddInput(""); }}>Cancel</Button>
                      </div>
                    ) : (
                      <button type="button" className="flex items-center gap-1.5 text-sm text-pink-600 hover:text-pink-700 py-1"
                        onClick={() => { setShowAddSubcatFor(`detail-${selectedCat.id}`); setAddInput(""); }}
                        data-testid="button-add-subcat-detail">
                        <Plus className="w-4 h-4" /> Add Subcategory
                      </button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : selectedZone && !selectedCatId ? (
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {editingZoneId === selectedZone.id ? (
                      <div className="space-y-2 mt-1">
                        <Input autoFocus value={editInput} onChange={e => setEditInput(e.target.value)} className="h-8 text-base font-bold" placeholder="Zone name" data-testid="input-edit-zone-name"
                          onKeyDown={e => { if (e.key === "Escape") { setEditingZoneId(null); setEditInput(""); setEditDesc(""); } }} />
                        <Input value={editDesc} onChange={e => setEditDesc(e.target.value)} className="h-7 text-sm" placeholder="Short description (optional)" data-testid="input-edit-zone-desc" />
                        <div className="flex gap-2">
                          <Button size="sm" className="h-7 bg-pink-500 hover:bg-pink-600 text-white" onClick={handleSaveZoneEdit} data-testid="button-save-zone-edit">Save</Button>
                          <Button size="sm" variant="ghost" className="h-7" onClick={() => { setEditingZoneId(null); setEditInput(""); setEditDesc(""); }}>Cancel</Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <CardTitle className="text-lg">{selectedZone.icon} {selectedZone.name}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">{selectedZone.description}</p>
                      </>
                    )}
                  </div>
                  {editingZoneId !== selectedZone.id && (
                    <div className="flex gap-2 ml-3">
                      <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => startEditZone(selectedZone)} data-testid="button-edit-zone">
                        <Edit2 className="w-3.5 h-3.5 mr-1" />Edit
                      </Button>
                      <Button size="sm" variant="outline" className="h-8 text-xs text-red-600 border-red-200"
                        onClick={() => handleDeleteZone(selectedZone.id)}
                        data-testid="button-delete-zone">
                        <Trash2 className="w-3.5 h-3.5 mr-1" />Delete
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="p-3 rounded-xl bg-gray-50">
                    <p className="text-sm text-muted-foreground">Total Products</p>
                    <p className="text-2xl font-bold">{zoneCount(selectedZone.id)}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-gray-50">
                    <p className="text-sm text-muted-foreground">Categories</p>
                    <p className="text-2xl font-bold">{selectedZone.categories.length}</p>
                  </div>
                </div>
                <div className="space-y-1.5">
                  {selectedZone.categories.map(cat => (
                    <div key={cat.id} className="flex items-center justify-between p-2.5 rounded-lg border hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedCatId(cat.id)} data-testid={`zone-cat-${cat.id}`}>
                      <span className="text-sm font-medium">{cat.name}</span>
                      <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                        <Badge variant="outline" className="text-[10px]">{catCount(selectedZone.id, cat.id)} products</Badge>
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => handleDeleteCategory(selectedZone.id, cat.id)} data-testid={`delete-cat-${cat.id}`}>
                          <Trash2 className="w-3 h-3 text-red-400" />
                        </Button>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground" data-testid="category-empty-state">
              <Tag className="w-10 h-10 mb-3 opacity-30" />
              <p className="text-sm">Select a zone or category from the tree to see details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const DUTY_CATEGORY_LABELS: Record<string, string> = {
  toys: "Toys", kitchenware: "Kitchenware", stationery: "Stationery",
  decor: "Decor", bags: "Bags", household: "Household", gifts: "Gifts",
};

export function EtsProductPricing() {
  const [settings, setSettings] = useState(() => {
    return mockPriceSettingsStore.get() as {
      exchange_rate: number; sourcing_commission: number; freight_per_cbm: number;
      insurance_percent: number; sw_surcharge_percent: number; cha_port_percent: number;
      domestic_freight_percent: number; mrp_tagging_cost_per_unit: number;
      our_markup_percent: number; opening_inventory_markup: number; target_store_margin: number;
    };
  });
  const [categoryRates, setCategoryRates] = useState(() => {
    const copy: Record<string, { duty: number; igst: number }> = {};
    for (const [k, v] of Object.entries(ETS_CATEGORY_DUTY_RATES)) copy[k] = { ...v };
    return copy;
  });
  const [test, setTest] = useState({
    exwPriceYuan: 25,
    unitsPerCarton: 12,
    cartonLengthCm: 40,
    cartonWidthCm: 30,
    cartonHeightCm: 25,
    category: "kitchenware" as keyof typeof ETS_CATEGORY_DUTY_RATES,
  });
  const [saved, setSaved] = useState(false);
  const [recalcOpen, setRecalcOpen] = useState(false);
  const [recalcProgress, setRecalcProgress] = useState(0);
  const [recalcDone, setRecalcDone] = useState(false);

  const preview = useMemo(() => {
    const duty = categoryRates[test.category] ?? ETS_CATEGORY_DUTY_RATES[test.category];
    return calculateEtsPrices({
      exwPriceYuan: test.exwPriceYuan,
      unitsPerCarton: test.unitsPerCarton,
      cartonLengthCm: test.cartonLengthCm,
      cartonWidthCm: test.cartonWidthCm,
      cartonHeightCm: test.cartonHeightCm,
      categoryDutyPercent: duty.duty,
      categoryIgstPercent: duty.igst,
      exchangeRate: settings.exchange_rate,
      sourcingCommission: settings.sourcing_commission,
      freightPerCbm: settings.freight_per_cbm,
      insurancePercent: settings.insurance_percent,
      swSurchargePercent: settings.sw_surcharge_percent,
      chaPortPercent: settings.cha_port_percent,
      domesticFreightPercent: settings.domestic_freight_percent,
      mrpTaggingCostPerUnit: settings.mrp_tagging_cost_per_unit,
      ourMarkupPercent: settings.our_markup_percent,
      openingInventoryMarkup: settings.opening_inventory_markup,
      targetStoreMargin: settings.target_store_margin,
    });
  }, [settings, categoryRates, test]);

  function setSetting(key: keyof typeof settings, val: number) {
    setSettings(s => ({ ...s, [key]: val }));
    setSaved(false);
  }

  function setCategoryRate(cat: string, field: "duty" | "igst", val: number) {
    setCategoryRates(r => ({ ...r, [cat]: { ...r[cat], [field]: val } }));
    setSaved(false);
  }

  function startRecalc() {
    setRecalcProgress(0);
    setRecalcDone(false);
    let p = 0;
    const iv = setInterval(() => {
      p += Math.random() * 18 + 4;
      if (p >= 100) { p = 100; clearInterval(iv); setRecalcDone(true); }
      setRecalcProgress(Math.min(p, 100));
    }, 180);
  }

  return (
    <div className="px-16 lg:px-24 py-6 space-y-6" data-testid="pricing-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2"><Sliders className="w-5 h-5 text-pink-500" />Price Engine Settings</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Configure global pricing variables — changes immediately update the live preview</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="text-sm gap-1.5" onClick={() => setRecalcOpen(true)} data-testid="button-recalculate-all">
            <RefreshCw className="w-4 h-4" />Recalculate All Products
          </Button>
          <Button className="bg-pink-500 hover:bg-pink-600 text-white text-sm gap-1.5" onClick={() => { mockPriceSettingsStore.save(settings); setSaved(true); }} data-testid="button-save-settings">
            <CheckCircle2 className="w-4 h-4" />{saved ? "Saved!" : "Save Settings"}
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_380px] gap-6">
        <div className="space-y-4">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2"><TrendingUp className="w-4 h-4 text-pink-500" />Exchange & Sourcing</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground">Exchange Rate (₹ per ¥)</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input type="number" step="0.1" value={settings.exchange_rate} onChange={e => setSetting("exchange_rate", +e.target.value)} className="h-9" data-testid="input-exchange-rate" />
                  <span className="text-sm text-muted-foreground whitespace-nowrap">₹/¥</span>
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Sourcing Commission</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input type="number" step="0.5" value={settings.sourcing_commission} onChange={e => setSetting("sourcing_commission", +e.target.value)} className="h-9" data-testid="input-sourcing-commission" />
                  <span className="text-sm text-muted-foreground">%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2"><Layers className="w-4 h-4 text-pink-500" />Freight & Insurance</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground">Freight per CBM (₹)</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input type="number" step="100" value={settings.freight_per_cbm} onChange={e => setSetting("freight_per_cbm", +e.target.value)} className="h-9" data-testid="input-freight-per-cbm" />
                  <span className="text-sm text-muted-foreground">₹/m³</span>
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Insurance</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input type="number" step="0.1" value={settings.insurance_percent} onChange={e => setSetting("insurance_percent", +e.target.value)} className="h-9" data-testid="input-insurance" />
                  <span className="text-sm text-muted-foreground">%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-pink-500" />Customs & Duties</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-4">
              <div className="max-w-xs">
                <Label className="text-xs text-muted-foreground">SW Surcharge (on customs duty)</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input type="number" step="1" value={settings.sw_surcharge_percent} onChange={e => setSetting("sw_surcharge_percent", +e.target.value)} className="h-9" data-testid="input-sw-surcharge" />
                  <span className="text-sm text-muted-foreground">%</span>
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">Per-Category Duty & IGST Rates <span className="text-pink-500">(editable)</span></p>
                <div className="rounded-xl border overflow-hidden">
                  <table className="w-full text-xs">
                    <thead className="bg-muted/40">
                      <tr>
                        <th className="text-left px-3 py-2 font-medium">Category</th>
                        <th className="text-right px-3 py-2 font-medium w-28">Customs Duty %</th>
                        <th className="text-right px-3 py-2 font-medium w-28">IGST %</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {Object.keys(ETS_CATEGORY_DUTY_RATES).map(cat => {
                        const rates = categoryRates[cat] ?? ETS_CATEGORY_DUTY_RATES[cat as keyof typeof ETS_CATEGORY_DUTY_RATES];
                        const defaults = ETS_CATEGORY_DUTY_RATES[cat as keyof typeof ETS_CATEGORY_DUTY_RATES];
                        const dutyChanged = rates.duty !== defaults.duty;
                        const igstChanged = rates.igst !== defaults.igst;
                        return (
                          <tr key={cat} className={`hover:bg-muted/20 ${test.category === cat ? "bg-pink-50/50" : ""}`}>
                            <td className="px-3 py-2 font-medium">
                              {DUTY_CATEGORY_LABELS[cat] ?? cat}
                              {test.category === cat && <span className="ml-1 text-[9px] text-pink-500 font-medium">preview</span>}
                            </td>
                            <td className="px-3 py-1.5 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <Input
                                  type="number" step="1" min="0" max="100"
                                  value={rates.duty}
                                  onChange={e => setCategoryRate(cat, "duty", +e.target.value)}
                                  className={`h-7 w-16 text-right text-xs ${dutyChanged ? "border-pink-400 bg-pink-50" : ""}`}
                                  data-testid={`duty-${cat}`}
                                />
                                <span className="text-muted-foreground">%</span>
                              </div>
                            </td>
                            <td className="px-3 py-1.5 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <Input
                                  type="number" step="1" min="0" max="100"
                                  value={rates.igst}
                                  onChange={e => setCategoryRate(cat, "igst", +e.target.value)}
                                  className={`h-7 w-16 text-right text-xs ${igstChanged ? "border-pink-400 bg-pink-50" : ""}`}
                                  data-testid={`igst-${cat}`}
                                />
                                <span className="text-muted-foreground">%</span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1.5">Pink inputs indicate values changed from defaults. Click the category in the preview to test its rates.</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2"><Package className="w-4 h-4 text-pink-500" />Clearance & Domestic Costs</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground">CHA / Port Handling %</Label>
                <p className="text-[10px] text-muted-foreground mb-1">% of assessable value</p>
                <div className="flex items-center gap-2">
                  <Input type="number" step="0.5" value={settings.cha_port_percent} onChange={e => setSetting("cha_port_percent", +e.target.value)} className="h-9" data-testid="input-cha-port" />
                  <span className="text-sm text-muted-foreground">%</span>
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Domestic Freight %</Label>
                <p className="text-[10px] text-muted-foreground mb-1">% of post-customs cost</p>
                <div className="flex items-center gap-2">
                  <Input type="number" step="0.5" value={settings.domestic_freight_percent} onChange={e => setSetting("domestic_freight_percent", +e.target.value)} className="h-9" data-testid="input-domestic-freight" />
                  <span className="text-sm text-muted-foreground">%</span>
                </div>
              </div>
              <div className="col-span-2">
                <Label className="text-xs text-muted-foreground">MRP Tagging Cost (per unit)</Label>
                <p className="text-[10px] text-muted-foreground mb-1">Fixed ₹ cost added to landed cost per unit for sticker labelling</p>
                <div className="flex items-center gap-2 max-w-xs">
                  <Input type="number" step="1" value={settings.mrp_tagging_cost_per_unit} onChange={e => setSetting("mrp_tagging_cost_per_unit", +e.target.value)} className="h-9" data-testid="input-mrp-tagging" />
                  <span className="text-sm text-muted-foreground">₹/unit</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2"><CreditCard className="w-4 h-4 text-pink-500" />Markup & Target Margin</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground">Replenishment Markup %</Label>
                <p className="text-[10px] text-muted-foreground mb-1">Applied to ongoing orders</p>
                <div className="flex items-center gap-2">
                  <Input type="number" step="1" value={settings.our_markup_percent} onChange={e => setSetting("our_markup_percent", +e.target.value)} className="h-9" data-testid="input-our-markup" />
                  <span className="text-sm text-muted-foreground">%</span>
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Opening Inventory Markup %</Label>
                <p className="text-[10px] text-muted-foreground mb-1">Applied to first stock order</p>
                <div className="flex items-center gap-2">
                  <Input type="number" step="1" value={settings.opening_inventory_markup} onChange={e => setSetting("opening_inventory_markup", +e.target.value)} className="h-9" data-testid="input-opening-markup" />
                  <span className="text-sm text-muted-foreground">%</span>
                </div>
              </div>
              <div className="col-span-2">
                <Label className="text-xs text-muted-foreground">Target Store Margin</Label>
                <p className="text-[10px] text-muted-foreground mb-1">Minimum % margin to snap MRP band</p>
                <div className="flex items-center gap-2 max-w-xs">
                  <Input type="number" step="1" value={settings.target_store_margin} onChange={e => setSetting("target_store_margin", +e.target.value)} className="h-9" data-testid="input-target-margin" />
                  <span className="text-sm text-muted-foreground">%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-muted/20">
            <CardContent className="p-4 flex items-start gap-3">
              <Info className="w-4 h-4 text-pink-400 shrink-0 mt-0.5" />
              <div className="text-xs text-muted-foreground space-y-0.5">
                <p><strong>MRP Bands:</strong> {ETS_MRP_BANDS.join(", ")} — suggested MRP snaps to the lowest band that meets the target store margin.</p>
                <p><strong>Formula:</strong> EXW × FX → FOB → +Freight+Insurance → CIF → +Duty+SW+IGST → +CHA+Tagging → +DomFreight → Landed Cost → ×Replenishment Markup → Store Price → Snap to MRP Band</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="border-0 shadow-sm sticky top-6">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-sm font-semibold flex items-center gap-2"><Brain className="w-4 h-4 text-pink-500" />Live Price Preview</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="space-y-3">
                <div>
                  <Label className="text-xs text-muted-foreground">EXW Price (¥)</Label>
                  <Input type="number" step="1" value={test.exwPriceYuan} onChange={e => setTest(t => ({ ...t, exwPriceYuan: +e.target.value }))} className="h-8 mt-1" data-testid="preview-exw-price" />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label className="text-xs text-muted-foreground">L (cm)</Label>
                    <Input type="number" value={test.cartonLengthCm} onChange={e => setTest(t => ({ ...t, cartonLengthCm: +e.target.value }))} className="h-8 mt-1" data-testid="preview-length" />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">W (cm)</Label>
                    <Input type="number" value={test.cartonWidthCm} onChange={e => setTest(t => ({ ...t, cartonWidthCm: +e.target.value }))} className="h-8 mt-1" data-testid="preview-width" />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">H (cm)</Label>
                    <Input type="number" value={test.cartonHeightCm} onChange={e => setTest(t => ({ ...t, cartonHeightCm: +e.target.value }))} className="h-8 mt-1" data-testid="preview-height" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs text-muted-foreground">Units/Carton</Label>
                    <Input type="number" value={test.unitsPerCarton} onChange={e => setTest(t => ({ ...t, unitsPerCarton: +e.target.value }))} className="h-8 mt-1" data-testid="preview-units" />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Category</Label>
                    <Select value={test.category} onValueChange={v => setTest(t => ({ ...t, category: v as typeof test.category }))}>
                      <SelectTrigger className="h-8 mt-1" data-testid="preview-category">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(ETS_CATEGORY_DUTY_RATES).map(c => (
                          <SelectItem key={c} value={c}>{DUTY_CATEGORY_LABELS[c] ?? c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-muted/30 p-3 space-y-1.5 text-xs">
                {[
                  ["FOB Price (¥)", `¥${preview.fobPriceYuan}`],
                  ["FOB Price (₹)", `₹${preview.fobPriceInr}`],
                  ["Freight/unit", `₹${preview.freightPerUnit}`],
                  ["CIF Price", `₹${preview.cifPriceInr}`],
                  ["Customs Duty", `₹${preview.customsDuty}`],
                  ["SW Surcharge", `₹${preview.swSurcharge}`],
                  ["IGST", `₹${preview.igst}`],
                  ["CHA / Port", `₹${preview.chaPortCost}`],
                  ["MRP Tagging", `₹${preview.mrpTaggingCost}`],
                  ["Domestic Freight", `₹${preview.domesticFreightCost}`],
                  ["Total Landed Cost", `₹${preview.totalLandedCost}`],
                ].map(([label, val]) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-mono font-medium">{val}</span>
                  </div>
                ))}
                <div className="border-t pt-1.5 mt-1 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Opening Inv. Price</span>
                    <span className="font-mono font-medium">₹{preview.openingInventoryPrice}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Replenishment Price</span>
                    <span className="font-mono font-medium">₹{preview.storeLandingPrice}</span>
                  </div>
                </div>
                <div className="border-t pt-1.5 mt-1 space-y-1">
                  <div className="flex justify-between font-semibold text-sm">
                    <span>Suggested MRP</span>
                    <span className="text-pink-600">₹{preview.suggestedMrp}</span>
                  </div>
                  <div className={`flex justify-between text-xs ${preview.marginWarning ? "text-red-600" : "text-green-700"}`}>
                    <span>Store Margin</span>
                    <span className="font-semibold">{preview.storeMarginPercent}% (₹{preview.storeMarginRs})</span>
                  </div>
                  {preview.marginWarning && (
                    <div className="flex items-center gap-1 text-red-600 text-[10px] mt-1">
                      <AlertCircle className="w-3 h-3" />Margin below target — consider adjusting settings
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {recalcOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" data-testid="recalculate-modal">
          <Card className="w-full max-w-md border-0 shadow-xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Recalculate All Products</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                This will apply the current price settings to all {CATALOG_PRODUCTS.length} products and recompute landed costs, store prices, and suggested MRPs.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {!recalcDone && recalcProgress === 0 && (
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setRecalcOpen(false)} className="flex-1" data-testid="recalc-cancel">Cancel</Button>
                  <Button className="flex-1 bg-pink-500 hover:bg-pink-600 text-white" onClick={startRecalc} data-testid="recalc-confirm">Recalculate</Button>
                </div>
              )}
              {recalcProgress > 0 && !recalcDone && (
                <div className="space-y-3">
                  <Progress value={recalcProgress} className="h-2" data-testid="recalc-progress" />
                  <p className="text-xs text-center text-muted-foreground">Processing {Math.round((recalcProgress / 100) * CATALOG_PRODUCTS.length)} / {CATALOG_PRODUCTS.length} products…</p>
                </div>
              )}
              {recalcDone && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-green-50 border border-green-200">
                    <CheckCircle2 className="w-6 h-6 text-green-600 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-green-800">Recalculation complete</p>
                      <p className="text-xs text-green-700 mt-0.5">{CATALOG_PRODUCTS.length} products updated — {Math.round(CATALOG_PRODUCTS.length * 0.82)} prices changed, {Math.round(CATALOG_PRODUCTS.length * 0.18)} unchanged</p>
                    </div>
                  </div>
                  <Button className="w-full bg-pink-500 hover:bg-pink-600 text-white" onClick={() => { setRecalcOpen(false); setRecalcDone(false); setRecalcProgress(0); }} data-testid="recalc-done">Done</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export function EtsProductCompliance() {
  const [search, setSearch] = useState("");
  const items = useMemo(() => {
    const q = search.toLowerCase();
    return CATALOG_PRODUCTS.filter(p =>
      p.complianceStatus !== "safe" &&
      (p.name.toLowerCase().includes(q) || (p.complianceStatus ?? "").includes(q))
    );
  }, [search]);

  return (
    <div className="px-16 lg:px-24 py-6 space-y-5" data-testid="compliance-page">
      <div>
        <h1 className="text-xl font-bold">Compliance Flags</h1>
        <p className="text-sm text-muted-foreground">Products requiring attention — restricted or banned items</p>
      </div>
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" data-testid="input-compliance-search" />
      </div>
      <div className="space-y-2">
        {items.map(p => (
          <div
            key={p.id}
            className={`flex items-start gap-4 p-4 rounded-xl border ${p.complianceStatus === "banned" ? "border-red-200 bg-red-50/40" : "border-amber-200 bg-amber-50/30"}`}
            data-testid={`compliance-row-${p.id}`}
          >
            <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${p.complianceStatus === "banned" ? "bg-red-100" : "bg-amber-100"}`}>
              {p.complianceStatus === "banned"
                ? <ShieldX className="w-4 h-4 text-red-600" />
                : <ShieldAlert className="w-4 h-4 text-amber-600" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <p className="font-medium text-sm">{p.name}</p>
                <ComplianceBadge status={p.complianceStatus} />
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">{p.id} · <SourceBadge source={p.source} /></div>
              {p.complianceNotes && (
                <p className="text-xs mt-1.5 text-muted-foreground bg-white/60 rounded-lg px-2 py-1">{p.complianceNotes}</p>
              )}
            </div>
            <Button size="sm" variant="outline" className="shrink-0 text-xs h-8" data-testid={`edit-compliance-${p.id}`}><Edit2 className="w-3.5 h-3.5 mr-1" />Edit</Button>
          </div>
        ))}
        {items.length === 0 && (
          <div className="py-12 text-center text-sm text-muted-foreground">
            <ShieldCheck className="w-8 h-8 mx-auto mb-2 text-green-400" />
            <p>No flagged products matching the filter</p>
          </div>
        )}
      </div>
    </div>
  );
}

const BULK_CSV_COLUMNS = [
  "name", "description", "zone", "category", "subcategory", "source", "supplier_name",
  "barcode", "exw_price_yuan", "wholesale_price_inr", "moq", "units_per_carton",
  "carton_length_cm", "carton_width_cm", "carton_height_cm",
  "compliance_status", "bis_required", "label_status", "tags", "suggested_mrp",
];

const MOCK_PREVIEW_ROWS = [
  { row: 2, name: "Bamboo Cutting Board XL", zone: "Kitchen Zone", category: "cooking-utensils", source: "india_deodap", exw: "₹145", mrp: "₹349", status: "valid" as const, error: null },
  { row: 3, name: "Stainless Steel Lunch Box 4pc", zone: "Kitchen Zone", category: "food-storage", source: "india_wholesaledock", exw: "₹210", mrp: "₹499", status: "valid" as const, error: null },
  { row: 4, name: "LED String Fairy Lights 10m", zone: "Home Decor", category: "indoor-decor", source: "china_allen", exw: "¥18", mrp: "₹299", status: "valid" as const, error: null },
  { row: 5, name: "Wooden Desk Organiser 5 Slot", zone: "Stationery", category: "office-supplies", source: "india_basketo", exw: "₹180", mrp: "₹449", status: "valid" as const, error: null },
  { row: 6, name: "Silicone Baking Mat 2pc", zone: "Kitchen Zone", category: "cooking-utensils", source: "china_haoduobao", exw: "¥12", mrp: "₹199", status: "valid" as const, error: null },
  { row: 7, name: "Kids Watercolour Set 24pc", zone: "Toys & Games", category: "educational", source: "india_deodap", exw: "₹95", mrp: "₹199", status: "valid" as const, error: null },
  { row: 8, name: "Portable Phone Stand Adjustable", zone: "Gifts & Novelty", category: "novelty", source: "china_allen", exw: "¥8", mrp: "₹149", status: "valid" as const, error: null },
  { row: 9, name: "Cotton Tote Bag Printed", zone: "Bags & Storage", category: "everyday-bags", source: "india_wholesaledock", exw: "₹65", mrp: "₹149", status: "valid" as const, error: null },
  { row: 10, name: "Essential Oil Roller Set 6pc", zone: "Personal Care", category: "skincare", source: "india_deodap", exw: "₹220", mrp: "₹499", status: "valid" as const, error: null },
  { row: 11, name: "Wall Clock Silent Sweep 30cm", zone: "Home Decor", category: "indoor-decor", source: "china_haoduobao", exw: "¥22", mrp: "₹399", status: "valid" as const, error: null },
  { row: 12, name: "Kitchen Scale Digital 5kg", zone: "Kitchen Zone", category: "cooking-utensils", source: "china_allen", exw: "¥35", mrp: "", status: "warning" as const, error: "Missing suggested_mrp — price will be auto-calculated" },
  { row: 13, name: "Yoga Block Eva 2pc", zone: "Personal Care", category: "bath-body", source: "india_basketo", exw: "₹310", mrp: "₹699", status: "warning" as const, error: "Missing barcode — will be auto-generated on import" },
  { row: 14, name: "Ceramic Mug Set 6pc", zone: "Kitchen Zone", category: "dining", source: "", exw: "₹380", mrp: "₹799", status: "warning" as const, error: "Unknown source value 'hand_made' — defaulted to india_other" },
  { row: 15, name: "Bluetooth RC Car 1:16", zone: "Toys & Games", category: "kids-toys", source: "china_haoduobao", exw: "¥45", mrp: "₹1,299", status: "error" as const, error: "BIS required but compliance_status is missing — review required before import" },
  { row: 16, name: "Electronic Smart Lock Wifi", zone: "", category: "", source: "china_allen", exw: "¥280", mrp: "₹5,499", status: "error" as const, error: "Missing zone and category — cannot determine duty rates. Fix and re-upload" },
];

const ROW_STATUS = {
  valid: { bg: "bg-green-50 border-green-200", dot: "bg-green-500", label: "Valid" },
  warning: { bg: "bg-amber-50 border-amber-200", dot: "bg-amber-400", label: "Warning" },
  error: { bg: "bg-red-50 border-red-200", dot: "bg-red-500", label: "Error" },
};

const STEPS = ["Download Template", "Upload File", "Preview & Validate", "Confirm", "Import"];

function downloadCsvTemplate() {
  const header = BULK_CSV_COLUMNS.join(",");
  const sampleRows = [
    "Bamboo Cutting Board XL,Premium bamboo chopping board with juice groove,Kitchen Zone,cooking-utensils,choppers-graters,india_deodap,Deodap,8901234500001,,145,6,24,35,25,15,safe,false,english,\"Recommended,Fast Mover\",299",
    "LED Fairy String Lights 10m,Warm white 100-LED copper wire indoor lights,Home Decor Zone,indoor-decor,clocks,china_allen,Allen Exports,8901234500002,18,,4,12,40,30,10,,true,chinese,,399",
    "Stainless Steel Tiffin 3-tier,BPA-free insulated lunch box with clip lock,Kitchen Zone,food-storage,containers,india_wholesaledock,Wholesaledock India,8901234500003,,210,6,12,30,20,20,safe,false,english,Bestseller,499",
  ];
  const csv = [header, ...sampleRows].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "ets-product-template.csv"; a.click();
  URL.revokeObjectURL(url);
}

export function EtsProductBulkUpload() {
  const [step, setStep] = useState(1);
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [importProgress, setImportProgress] = useState(0);
  const [importDone, setImportDone] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const validCount = MOCK_PREVIEW_ROWS.filter(r => r.status === "valid").length;
  const warnCount = MOCK_PREVIEW_ROWS.filter(r => r.status === "warning").length;
  const errorCount = MOCK_PREVIEW_ROWS.filter(r => r.status === "error").length;

  function handleFileDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) { setFileName(f.name); setStep(3); }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) { setFileName(f.name); setStep(3); }
  }

  function startImport() {
    setStep(5);
    setImportProgress(0);
    setImportDone(false);
    let p = 0;
    const iv = setInterval(() => {
      p += Math.random() * 14 + 5;
      if (p >= 100) { p = 100; clearInterval(iv); setImportDone(true); }
      setImportProgress(Math.min(p, 100));
    }, 200);
  }

  return (
    <div className="px-16 lg:px-24 py-6 space-y-6" data-testid="bulk-upload-page">
      <div>
        <h1 className="text-xl font-bold flex items-center gap-2"><FileUp className="w-5 h-5 text-pink-500" />Bulk Upload</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Add or update up to 10,000+ products at once via CSV</p>
      </div>

      <div className="flex items-center gap-0">
        {STEPS.map((s, i) => {
          const n = i + 1;
          const isActive = step === n;
          const isDone = step > n;
          return (
            <div key={s} className="flex items-center flex-1 last:flex-none">
              <div className={`flex items-center gap-2 shrink-0 px-3 py-2 rounded-full text-xs font-medium ${isActive ? "bg-pink-100 text-pink-700" : isDone ? "bg-green-100 text-green-700" : "text-muted-foreground"}`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${isActive ? "bg-pink-500 text-white" : isDone ? "bg-green-500 text-white" : "bg-gray-200 text-gray-500"}`}>
                  {isDone ? "✓" : n}
                </span>
                {s}
              </div>
              {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 mx-1 ${isDone ? "bg-green-300" : "bg-gray-200"}`} />}
            </div>
          );
        })}
      </div>

      {step === 1 && (
        <div className="space-y-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-pink-100 flex items-center justify-center shrink-0">
                  <Download className="w-6 h-6 text-pink-600" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold">Download the CSV template</p>
                  <p className="text-sm text-muted-foreground mt-1 mb-4">Use our template to ensure your data is formatted correctly. Fill in all required columns before uploading.</p>
                  <Button className="bg-pink-500 hover:bg-pink-600 text-white gap-2" onClick={() => { downloadCsvTemplate(); setStep(2); }} data-testid="button-download-template">
                    <Download className="w-4 h-4" />Download Template (CSV)
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">Required CSV Columns</CardTitle></CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-wrap gap-2">
                {BULK_CSV_COLUMNS.map(col => (
                  <Badge key={col} variant="outline" className="text-xs font-mono" data-testid={`col-${col}`}>{col}</Badge>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-3">Fields marked <strong>source</strong>, <strong>name</strong>, <strong>zone</strong>, and <strong>category</strong> are required. All others are optional.</p>

              <div className="mt-4 border rounded-xl overflow-hidden">
                <div className="bg-muted/40 px-3 py-2 text-xs font-semibold">Field Guide — all 19 columns</div>
                <table className="w-full text-xs">
                  <thead className="bg-muted/20 border-b">
                    <tr>
                      <th className="text-left px-3 py-2 font-medium">Column</th>
                      <th className="text-center px-2 py-2 font-medium w-20">Required</th>
                      <th className="text-left px-3 py-2 font-medium">Description / Example</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {[
                      ["name", true, "Product display name — e.g. Bamboo Cutting Board XL"],
                      ["description", false, "Short product description (max 200 chars)"],
                      ["zone", true, "Zone label — e.g. Kitchen Zone, Home Decor Zone"],
                      ["category", true, "Category slug — e.g. cooking-utensils, indoor-decor"],
                      ["subcategory", false, "Subcategory slug — e.g. choppers-graters, clocks"],
                      ["source", true, "Source code: india_deodap | india_wholesaledock | china_allen | china_haoduobao | china_bestex"],
                      ["supplier_name", false, "Supplier display name — e.g. Deodap, Allen Exports"],
                      ["barcode", false, "EAN-13 barcode — 13 digits"],
                      ["exw_price_yuan", false, "China EXW price in ¥ (required for China-source products)"],
                      ["wholesale_price_inr", false, "India wholesale price in ₹ (required for India-source products)"],
                      ["moq", false, "Minimum order quantity — integer, e.g. 12"],
                      ["units_per_carton", false, "Units packed per carton — integer"],
                      ["carton_length_cm", false, "Carton outer length in cm"],
                      ["carton_width_cm", false, "Carton outer width in cm"],
                      ["carton_height_cm", false, "Carton outer height in cm"],
                      ["compliance_status", false, "safe | restricted | banned (leave blank if unknown)"],
                      ["bis_required", false, "true or false — whether BIS certification applies"],
                      ["label_status", false, "english | chinese | needs_relabel"],
                      ["tags", false, "Comma-separated tags — e.g. \"Bestseller,Fast Mover\""],
                      ["suggested_mrp", false, "Suggested retail price in ₹ — snaps to nearest MRP band"],
                    ].map(([col, req, desc]) => (
                      <tr key={col as string} className="hover:bg-muted/10">
                        <td className="px-3 py-1.5 font-mono font-medium text-[10px]">{col as string}</td>
                        <td className="px-2 py-1.5 text-center">{req ? <span className="text-pink-600 font-semibold">✓</span> : <span className="text-muted-foreground">—</span>}</td>
                        <td className="px-3 py-1.5 text-muted-foreground">{desc as string}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
          <Button variant="outline" className="text-sm gap-1.5" onClick={() => setStep(2)}>
            Skip — I already have the template <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleFileChange} data-testid="file-input" />
          <div
            className={`border-2 border-dashed ${dragging ? "border-pink-400 bg-pink-50" : "border-gray-200 hover:border-pink-300 hover:bg-pink-50/30"} rounded-2xl cursor-pointer transition-colors`}
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleFileDrop}
            onClick={() => fileRef.current?.click()}
            data-testid="drop-zone"
          >
            <div className="p-14 text-center">
              <Upload className={`w-12 h-12 mx-auto mb-4 ${dragging ? "text-pink-500" : "text-gray-300"}`} />
              <p className="text-sm font-medium mb-1">Drag & drop your CSV file here</p>
              <p className="text-xs text-muted-foreground mb-4">or click to browse — max 50 MB</p>
              <Button variant="outline" className="gap-2 pointer-events-none" data-testid="button-choose-file">
                <Upload className="w-4 h-4" />Choose File
              </Button>
            </div>
          </div>
          <div className="flex justify-between">
            <Button variant="ghost" onClick={() => setStep(1)} className="gap-1.5 text-sm"><ArrowLeft className="w-4 h-4" />Back</Button>
            <Button className="bg-pink-500 hover:bg-pink-600 text-white gap-1.5 text-sm" onClick={() => { setFileName("products_batch_03.csv"); setStep(3); }} data-testid="button-use-sample">
              Use Sample File for Demo <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/30 border">
            <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
            <div>
              <p className="text-sm font-medium">{fileName ?? "products_batch_03.csv"} parsed</p>
              <p className="text-xs text-muted-foreground">{MOCK_PREVIEW_ROWS.length} rows found — review below before proceeding</p>
            </div>
          </div>
          <div className="flex gap-3">
            {[["Valid", validCount, "text-green-700 bg-green-100"], ["Warnings", warnCount, "text-amber-700 bg-amber-100"], ["Errors", errorCount, "text-red-700 bg-red-100"]].map(([label, count, cls]) => (
              <div key={label as string} className={`flex-1 rounded-xl p-3 text-center ${cls as string}`}>
                <p className="text-xl font-bold">{count as number}</p>
                <p className="text-xs font-medium">{label as string}</p>
              </div>
            ))}
          </div>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-0 overflow-hidden rounded-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-muted/40 border-b">
                    <tr>
                      <th className="text-left px-3 py-2.5 font-medium w-10">Row</th>
                      <th className="text-left px-3 py-2.5 font-medium">Product Name</th>
                      <th className="text-left px-3 py-2.5 font-medium">Zone / Category</th>
                      <th className="text-left px-3 py-2.5 font-medium">Source</th>
                      <th className="text-right px-3 py-2.5 font-medium">EXW</th>
                      <th className="text-right px-3 py-2.5 font-medium">MRP</th>
                      <th className="text-left px-3 py-2.5 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {MOCK_PREVIEW_ROWS.map(r => {
                      const s = ROW_STATUS[r.status];
                      return (
                        <tr key={r.row} className={`${r.status !== "valid" ? s.bg : "hover:bg-muted/20"} border-l-2 ${r.status === "valid" ? "border-l-transparent" : r.status === "warning" ? "border-l-amber-400" : "border-l-red-400"}`} data-testid={`preview-row-${r.row}`}>
                          <td className="px-3 py-2 text-muted-foreground">{r.row}</td>
                          <td className="px-3 py-2 font-medium max-w-[200px]">
                            <p className="truncate">{r.name}</p>
                            {r.error && <p className={`text-[10px] mt-0.5 ${r.status === "error" ? "text-red-600" : "text-amber-600"}`}>{r.error}</p>}
                          </td>
                          <td className="px-3 py-2 text-muted-foreground">{r.zone} · {r.category}</td>
                          <td className="px-3 py-2 text-muted-foreground">{r.source || <span className="italic text-red-500">missing</span>}</td>
                          <td className="px-3 py-2 text-right font-mono">{r.exw}</td>
                          <td className="px-3 py-2 text-right font-mono">{r.mrp || <span className="italic text-muted-foreground">auto</span>}</td>
                          <td className="px-3 py-2">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${s.bg}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />{s.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
          <div className="flex justify-between">
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setStep(2)} className="gap-1.5 text-sm"><ArrowLeft className="w-4 h-4" />Back</Button>
              <Button variant="outline" className="gap-1.5 text-sm" onClick={() => setStep(2)} data-testid="button-re-upload">
                <RefreshCw className="w-4 h-4" />Fix & Re-upload
              </Button>
            </div>
            {errorCount === 0
              ? <Button className="bg-pink-500 hover:bg-pink-600 text-white gap-1.5 text-sm" onClick={() => setStep(4)} data-testid="button-proceed">Proceed to Confirm <ArrowRight className="w-4 h-4" /></Button>
              : <Button className="bg-pink-500 hover:bg-pink-600 text-white gap-1.5 text-sm" onClick={() => setStep(4)} data-testid="button-proceed-anyway">Proceed (skip errors) <ArrowRight className="w-4 h-4" /></Button>
            }
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-4 max-w-xl">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">Import Summary</CardTitle></CardHeader>
            <CardContent className="pt-0 space-y-3">
              {[
                ["New products to add", validCount + warnCount, "text-green-700"],
                ["Rows with warnings (will import with auto-fixes)", warnCount, "text-amber-700"],
                ["Rows with errors (will be skipped)", errorCount, "text-red-700"],
                ["Total rows in file", MOCK_PREVIEW_ROWS.length, ""],
              ].map(([label, count, cls]) => (
                <div key={label as string} className="flex justify-between items-center text-sm border-b pb-2 last:border-0 last:pb-0">
                  <span className="text-muted-foreground">{label as string}</span>
                  <span className={`font-semibold ${cls as string}`}>{count as number}</span>
                </div>
              ))}
            </CardContent>
          </Card>
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>Importing will add new products to your catalog. Existing products with matching barcodes will be updated. This action cannot be undone — save a backup of your current catalog first.</span>
          </div>
          <div className="flex justify-between">
            <Button variant="ghost" onClick={() => setStep(3)} className="gap-1.5 text-sm"><ArrowLeft className="w-4 h-4" />Back</Button>
            <Button className="bg-pink-500 hover:bg-pink-600 text-white gap-1.5 text-sm" onClick={startImport} data-testid="button-start-import">
              Import {validCount + warnCount} Products <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {step === 5 && (
        <div className="max-w-lg space-y-6">
          {!importDone ? (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-8 space-y-5">
                <div className="text-center">
                  <FileUp className="w-10 h-10 mx-auto mb-3 text-pink-400 animate-pulse" />
                  <p className="font-semibold">Importing products…</p>
                  <p className="text-xs text-muted-foreground mt-1">Please wait while we process your file</p>
                </div>
                <Progress value={importProgress} className="h-2" data-testid="import-progress" />
                <p className="text-xs text-center text-muted-foreground">
                  {Math.round((importProgress / 100) * (validCount + warnCount))} / {validCount + warnCount} products processed
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-8 space-y-5">
                <div className="flex items-center gap-4 p-4 rounded-xl bg-green-50 border border-green-200">
                  <CheckCircle2 className="w-8 h-8 text-green-600 shrink-0" />
                  <div>
                    <p className="font-semibold text-green-900">Import Complete!</p>
                    <p className="text-xs text-green-700 mt-0.5">{validCount + warnCount} products imported successfully · {errorCount} rows skipped</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  {[["Added", validCount, "text-green-700"], ["Auto-fixed", warnCount, "text-amber-700"], ["Skipped", errorCount, "text-red-600"]].map(([l, c, cls]) => (
                    <div key={l as string} className="rounded-xl bg-muted/30 p-3">
                      <p className={`text-2xl font-bold ${cls as string}`}>{c as number}</p>
                      <p className="text-xs text-muted-foreground">{l as string}</p>
                    </div>
                  ))}
                </div>
                <Button className="w-full bg-pink-500 hover:bg-pink-600 text-white" onClick={() => { setStep(1); setFileName(null); setImportProgress(0); setImportDone(false); }} data-testid="button-new-upload">
                  Start Another Upload
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

export function EtsProductIntelligence() {
  const stats = useMemo(() => getCatalogStats(), []);

  const byZone = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of CATALOG_PRODUCTS) {
      if (p.zoneId) counts[p.zoneId] = (counts[p.zoneId] || 0) + 1;
    }
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, []);

  const maxZoneCount = byZone[0]?.[1] ?? 1;

  const mrpBands = useMemo(() => {
    const bands: number[] = [0, ...ETS_MRP_BANDS];
    const buckets: { label: string; count: number }[] = [];
    for (let i = 0; i < ETS_MRP_BANDS.length; i++) {
      const lo = bands[i];
      const hi = ETS_MRP_BANDS[i];
      const count = CATALOG_PRODUCTS.filter(p => {
        const m = p.suggestedMrp ?? 0;
        return m > lo && m <= hi;
      }).length;
      buckets.push({ label: `₹${hi}`, count });
    }
    const maxCount = Math.max(...buckets.map(b => b.count), 1);
    return { buckets, maxCount };
  }, []);

  const bySource = useMemo(() => {
    const sourceStats: Record<string, { count: number; totalMargin: number; marginCount: number; avgPrice: number; priceCount: number }> = {};
    for (const p of CATALOG_PRODUCTS) {
      if (!sourceStats[p.source]) sourceStats[p.source] = { count: 0, totalMargin: 0, marginCount: 0, avgPrice: 0, priceCount: 0 };
      sourceStats[p.source].count++;
      if (p.marginPercent !== undefined) { sourceStats[p.source].totalMargin += p.marginPercent; sourceStats[p.source].marginCount++; }
      const price = p.partnerPriceInr ?? 0;
      if (price > 0) { sourceStats[p.source].avgPrice += price; sourceStats[p.source].priceCount++; }
    }
    return Object.entries(sourceStats).map(([source, s]) => ({
      source,
      label: SOURCE_LABELS[source as ProductSource] ?? source,
      count: s.count,
      avgMargin: s.marginCount ? Math.round(s.totalMargin / s.marginCount) : 0,
      avgPrice: s.priceCount ? Math.round(s.avgPrice / s.priceCount) : 0,
    })).sort((a, b) => b.avgMargin - a.avgMargin);
  }, []);

  const zoneName = (id: string) => ZONE_NAME[id] || id;

  return (
    <div className="px-16 lg:px-24 py-6 space-y-6" data-testid="intelligence-page">
      <div>
        <h1 className="text-xl font-bold flex items-center gap-2"><Brain className="w-5 h-5 text-pink-500" />Catalog Intelligence</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Analytics and insights across your {CATALOG_PRODUCTS.length}-product catalog</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <Card className="border-0 shadow-sm" data-testid="panel-by-zone">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2"><BarChart3 className="w-4 h-4 text-pink-500" />Products by Zone</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-2">
            {byZone.map(([zoneId, count]) => (
              <div key={zoneId} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-medium">{zoneName(zoneId)}</span>
                  <span className="text-muted-foreground">{count} products</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-pink-400 to-rose-500 rounded-full"
                    style={{ width: `${(count / maxZoneCount) * 100}%` }}
                    data-testid={`bar-zone-${zoneId}`}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm" data-testid="panel-compliance">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2"><CheckSquare className="w-4 h-4 text-pink-500" />Compliance Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-4">
            {[
              { label: "Safe", count: stats.compliance.safe, color: "bg-green-500", text: "text-green-700", bg: "bg-green-50" },
              { label: "Restricted", count: stats.compliance.restricted, color: "bg-amber-400", text: "text-amber-700", bg: "bg-amber-50" },
              { label: "Banned", count: stats.compliance.banned, color: "bg-red-500", text: "text-red-700", bg: "bg-red-50" },
              { label: "Unclassified", count: stats.compliance.undefined, color: "bg-gray-300", text: "text-gray-600", bg: "bg-gray-50" },
            ].map(s => (
              <div key={s.label} className={`flex items-center justify-between p-3 rounded-xl ${s.bg}`}>
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${s.color}`} />
                  <span className={`text-sm font-medium ${s.text}`}>{s.label}</span>
                </div>
                <div className="text-right">
                  <span className={`text-lg font-bold ${s.text}`}>{s.count}</span>
                  <span className="text-xs text-muted-foreground ml-1.5">({Math.round((s.count / stats.total) * 100)}%)</span>
                </div>
              </div>
            ))}
            <div className="text-xs text-muted-foreground flex items-start gap-1.5 pt-1">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-500" />
              {stats.missingCompliance} products have no compliance classification — review recommended.
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm lg:col-span-2" data-testid="panel-mrp-histogram">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2"><TrendingUp className="w-4 h-4 text-pink-500" />MRP Band Distribution</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-end gap-1 h-28">
              {mrpBands.buckets.map(b => (
                <div key={b.label} className="flex-1 flex flex-col items-center gap-1 group">
                  <span className="text-[9px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity font-medium">{b.count}</span>
                  <div
                    className="w-full rounded-t-sm bg-gradient-to-t from-pink-500 to-rose-400 transition-all"
                    style={{ height: `${Math.max((b.count / mrpBands.maxCount) * 90, b.count > 0 ? 4 : 0)}%` }}
                    data-testid={`mrp-bar-${b.label}`}
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-1 mt-1">
              {mrpBands.buckets.map(b => (
                <div key={b.label} className="flex-1 text-center text-[9px] text-muted-foreground truncate">{b.label}</div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">{stats.missingMrp} products have no MRP set · hover bars to see counts</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm" data-testid="panel-margin-by-source">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2"><BarChart3 className="w-4 h-4 text-pink-500" />Margin by Source</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b">
                  <th className="text-left pb-2 font-medium text-muted-foreground">Source</th>
                  <th className="text-right pb-2 font-medium text-muted-foreground">SKUs</th>
                  <th className="text-right pb-2 font-medium text-muted-foreground">Avg Margin</th>
                  <th className="text-right pb-2 font-medium text-muted-foreground">Avg Price</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {bySource.map(s => (
                  <tr key={s.source} className="hover:bg-muted/20" data-testid={`margin-row-${s.source}`}>
                    <td className="py-2.5">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] ${SOURCE_COLORS[s.source as ProductSource]}`}>
                        {s.label.split(" (")[0]}
                      </span>
                    </td>
                    <td className="py-2.5 text-right font-medium">{s.count}</td>
                    <td className="py-2.5 text-right">
                      <span className={`font-semibold ${s.avgMargin >= 38 ? "text-green-700" : s.avgMargin >= 33 ? "text-amber-700" : "text-red-600"}`}>
                        {s.avgMargin}%
                      </span>
                    </td>
                    <td className="py-2.5 text-right text-muted-foreground">₹{s.avgPrice}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm" data-testid="panel-source-comparison">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2"><ArrowUpDown className="w-4 h-4 text-pink-500" />Source Price Comparison</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            <p className="text-xs text-muted-foreground">Average partner price per source — higher indicates premium product positioning</p>
            {bySource.slice().sort((a, b) => b.avgPrice - a.avgPrice).map(s => {
              const maxAvg = Math.max(...bySource.map(x => x.avgPrice), 1);
              return (
                <div key={s.source} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className={`inline-block px-2 py-0.5 rounded-full ${SOURCE_COLORS[s.source as ProductSource]}`}>
                      {s.label.split(" (")[0]}
                    </span>
                    <span className="font-mono font-medium">₹{s.avgPrice}</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-pink-400 to-rose-400 rounded-full" style={{ width: `${(s.avgPrice / maxAvg) * 100}%` }} />
                  </div>
                </div>
              );
            })}
            <div className="pt-2 border-t text-xs text-muted-foreground space-y-1">
              <p>China avg margin: <strong>{stats.avgMarginChina}%</strong> · India avg margin: <strong>{stats.avgMarginIndia}%</strong></p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm lg:col-span-2" data-testid="panel-china-vs-india">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2"><ArrowUpDown className="w-4 h-4 text-pink-500" />China vs India — Landed Cost Comparison</CardTitle>
            <p className="text-xs text-muted-foreground">Products in overlapping categories — comparing cheapest China-sourced vs India-sourced landed cost per unit</p>
          </CardHeader>
          <CardContent className="pt-0">
            {(() => {
              const chinaProds = CATALOG_PRODUCTS.filter(p => p.source?.startsWith("china_") && p.landedCostInr);
              const indiaProds = CATALOG_PRODUCTS.filter(p => p.source?.startsWith("india_") && p.landedCostInr);
              const sharedCats = [...new Set(chinaProds.map(p => p.categoryId).filter(c => indiaProds.some(p => p.categoryId === c)))];
              const rows = sharedCats.map(catId => {
                const china = chinaProds.filter(p => p.categoryId === catId).sort((a, b) => (a.landedCostInr ?? 999999) - (b.landedCostInr ?? 999999))[0];
                const india = indiaProds.filter(p => p.categoryId === catId).sort((a, b) => (a.landedCostInr ?? 999999) - (b.landedCostInr ?? 999999))[0];
                if (!china || !india) return null;
                const diff = (india.landedCostInr ?? 0) - (china.landedCostInr ?? 0);
                const pct = china.landedCostInr ? Math.round(Math.abs(diff) / china.landedCostInr * 100) : 0;
                return { catId, catName: CAT_NAME[catId] || catId, china, india, diff, pct, cheaperSource: diff > 0 ? "china" : "india" };
              }).filter(Boolean);
              return (
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left pb-2 font-medium text-muted-foreground">Category</th>
                      <th className="text-right pb-2 font-medium text-muted-foreground">China Product</th>
                      <th className="text-right pb-2 font-medium text-muted-foreground">China Landed ₹</th>
                      <th className="text-right pb-2 font-medium text-muted-foreground">India Product</th>
                      <th className="text-right pb-2 font-medium text-muted-foreground">India Landed ₹</th>
                      <th className="text-right pb-2 font-medium text-muted-foreground">Delta</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {rows.map(r => !r ? null : (
                      <tr key={r.catId} className="hover:bg-muted/20" data-testid={`china-vs-india-${r.catId}`}>
                        <td className="py-2 font-medium">{r.catName}</td>
                        <td className="py-2 text-right text-muted-foreground max-w-[120px] truncate">{r.china.name}</td>
                        <td className="py-2 text-right font-mono">₹{r.china.landedCostInr}</td>
                        <td className="py-2 text-right text-muted-foreground max-w-[120px] truncate">{r.india.name}</td>
                        <td className="py-2 text-right font-mono">₹{r.india.landedCostInr}</td>
                        <td className="py-2 text-right">
                          <span className={`font-semibold ${r.cheaperSource === "china" ? "text-blue-600" : "text-orange-600"}`}>
                            {r.cheaperSource === "china" ? "China " : "India "}{r.pct}% cheaper
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              );
            })()}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm lg:col-span-2" data-testid="panel-margin-by-category">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2"><BarChart3 className="w-4 h-4 text-pink-500" />Margin by Category</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {(() => {
              const catStats: Record<string, { count: number; totalMargin: number; marginCount: number }> = {};
              for (const p of CATALOG_PRODUCTS) {
                const cat = p.categoryId ?? "uncat";
                if (!catStats[cat]) catStats[cat] = { count: 0, totalMargin: 0, marginCount: 0 };
                catStats[cat].count++;
                if (p.marginPercent !== undefined) { catStats[cat].totalMargin += p.marginPercent; catStats[cat].marginCount++; }
              }
              const rows = Object.entries(catStats)
                .map(([catId, s]) => ({
                  catId,
                  label: CAT_NAME[catId] || catId,
                  count: s.count,
                  avgMargin: s.marginCount ? Math.round(s.totalMargin / s.marginCount) : 0,
                }))
                .filter(r => r.avgMargin > 0)
                .sort((a, b) => b.avgMargin - a.avgMargin);
              const maxMargin = Math.max(...rows.map(r => r.avgMargin), 1);
              return (
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left pb-2 font-medium text-muted-foreground">Category</th>
                      <th className="text-right pb-2 font-medium text-muted-foreground w-12">SKUs</th>
                      <th className="text-right pb-2 font-medium text-muted-foreground w-20">Avg Margin</th>
                      <th className="pb-2 pl-4 w-48">Margin bar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {rows.map(r => (
                      <tr key={r.catId} className="hover:bg-muted/20" data-testid={`margin-cat-${r.catId}`}>
                        <td className="py-2 font-medium">{r.label}</td>
                        <td className="py-2 text-right text-muted-foreground">{r.count}</td>
                        <td className="py-2 text-right">
                          <span className={`font-semibold ${r.avgMargin >= 38 ? "text-green-700" : r.avgMargin >= 33 ? "text-amber-700" : "text-red-600"}`}>
                            {r.avgMargin}%
                          </span>
                        </td>
                        <td className="py-2 pl-4">
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${r.avgMargin >= 38 ? "bg-green-400" : r.avgMargin >= 33 ? "bg-amber-400" : "bg-red-400"}`}
                              style={{ width: `${(r.avgMargin / maxMargin) * 100}%` }}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              );
            })()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
