import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Package, Plus, Edit2, Trash2, Star, Upload, Grid3X3, List } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { TRIPHQ_COLOR, CATALOGUE_STATUS_CONFIG } from "@/lib/triphq-config";
import { SopModal, TutorialModal, SopTutorialButtons } from "@/components/sop/sop-modal";
import { SOP_REGISTRY } from "@/lib/sop-data";
import { PageShell, PageHeader, StatGrid, StatCard, FilterPill } from "@/components/layout";
import { FormDialog } from "@/components/ds/form-dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function TripHQCatalogue() {
  const { toast } = useToast();
  const [sopOpen, setSopOpen] = useState(false);
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  const { data: products = [], isLoading } = useQuery<any[]>({ queryKey: ["/api/triphq/catalogue_products"] });
  const { data: docs = [] } = useQuery<any[]>({ queryKey: ["/api/triphq/documents"] });

  const saveMutation = useMutation({
    mutationFn: async (body: any) => {
      if (editItem?.id) return apiRequest("PATCH", `/api/triphq/catalogue_products/${editItem.id}`, body);
      return apiRequest("POST", "/api/triphq/catalogue_products", body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/triphq/catalogue_products"] });
      setFormOpen(false); setEditItem(null);
      toast({ title: editItem?.id ? "Product updated" : "Product added" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/triphq/catalogue_products/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/triphq/catalogue_products"] }); toast({ title: "Product removed" }); },
  });

  const handleUpload = async (productId: string, file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("doc_type", "product-photo");
    fd.append("entity_type", "product");
    fd.append("entity_id", productId);
    await fetch("/api/triphq/upload", { method: "POST", body: fd });
    queryClient.invalidateQueries({ queryKey: ["/api/triphq/documents"] });
    toast({ title: "Photo uploaded" });
  };

  const filtered = products.filter((p: any) => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter !== "all" && p.status !== statusFilter) return false;
    return true;
  });

  const openCreate = () => { setEditItem(null); setFormOpen(true); };
  const openEdit = (p: any) => { setEditItem(p); setFormOpen(true); };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    saveMutation.mutate({
      name: fd.get("name"),
      category: fd.get("category") || null,
      sub_category: fd.get("sub_category") || null,
      supplier_name: fd.get("supplier_name") || null,
      cny_price: fd.get("cny_price") ? parseFloat(fd.get("cny_price") as string) : null,
      moq: fd.get("moq") ? parseInt(fd.get("moq") as string) : null,
      franchise_fit_score: fd.get("franchise_fit_score") ? parseInt(fd.get("franchise_fit_score") as string) : null,
      status: fd.get("status") || "shortlisted",
      notes: fd.get("notes") || null,
    });
  };

  const renderStars = (score: number) => (
    <div className="flex gap-0.5">{[1, 2, 3, 4, 5].map((s) => <Star key={s} className={`h-3.5 w-3.5 ${s <= score ? "fill-amber-400 text-amber-400" : "text-gray-300"}`} />)}</div>
  );

  if (isLoading) {
    return (<PageShell className="animate-pulse"><div className="h-16 bg-muted rounded-xl" /><div className="grid grid-cols-3 gap-4">{[...Array(6)].map((_, i) => <div key={i} className="h-48 bg-muted rounded-xl" />)}</div></PageShell>);
  }

  return (
    <PageShell>
      <PageHeader title="Catalogue Builder" subtitle={`${products.length} products scouted`} actions={
        <div className="flex items-center gap-2">
          <SopTutorialButtons onSopClick={() => setSopOpen(true)} onTutorialClick={() => setTutorialOpen(true)} />
          <div className="flex border rounded-lg overflow-hidden">
            <button onClick={() => setViewMode("grid")} className={`p-2 ${viewMode === "grid" ? "bg-muted" : ""}`} data-testid="view-grid"><Grid3X3 className="h-4 w-4" /></button>
            <button onClick={() => setViewMode("table")} className={`p-2 ${viewMode === "table" ? "bg-muted" : ""}`} data-testid="view-table"><List className="h-4 w-4" /></button>
          </div>
          <Button onClick={openCreate} style={{ backgroundColor: TRIPHQ_COLOR }} className="text-white" data-testid="button-add-product"><Plus className="h-4 w-4 mr-2" />Add Product</Button>
        </div>
      } />

      <div className="flex items-center gap-3 flex-wrap">
        <Input placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" data-testid="input-search-products" />
        <FilterPill label="All" active={statusFilter === "all"} onClick={() => setStatusFilter("all")} count={products.length} />
        <FilterPill label="Shortlisted" active={statusFilter === "shortlisted"} onClick={() => setStatusFilter("shortlisted")} count={products.filter((p: any) => p.status === "shortlisted").length} />
        <FilterPill label="Confirmed" active={statusFilter === "confirmed"} onClick={() => setStatusFilter("confirmed")} count={products.filter((p: any) => p.status === "confirmed").length} />
        <FilterPill label="Rejected" active={statusFilter === "rejected"} onClick={() => setStatusFilter("rejected")} count={products.filter((p: any) => p.status === "rejected").length} />
      </div>

      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p: any) => {
            const productDocs = docs.filter((d: any) => d.entityType === "product" && d.entityId === p.id && d.fileType?.startsWith("image/"));
            const statusCfg = CATALOGUE_STATUS_CONFIG[p.status as keyof typeof CATALOGUE_STATUS_CONFIG];
            return (
              <div key={p.id} className="border rounded-xl overflow-hidden bg-card hover:shadow-sm transition-shadow" data-testid={`product-${p.id}`}>
                <div className="h-40 bg-muted flex items-center justify-center relative">
                  {productDocs.length > 0 ? (
                    <img src={productDocs[0].fileUrl} alt={p.name} className="w-full h-full object-cover" />
                  ) : (
                    <Package className="h-12 w-12 text-muted-foreground/30" />
                  )}
                  <label className="absolute bottom-2 right-2 cursor-pointer bg-white/90 dark:bg-gray-900/90 rounded-lg p-1.5 shadow">
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => { if (e.target.files?.[0]) handleUpload(p.id, e.target.files[0]); }} />
                    <Upload className="h-4 w-4 text-muted-foreground" />
                  </label>
                </div>
                <div className="p-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-sm line-clamp-1">{p.name}</h3>
                      {p.category && <span className="text-xs text-muted-foreground">{p.category}{p.subCategory ? ` · ${p.subCategory}` : ""}</span>}
                    </div>
                    <Badge variant="outline" className={`text-xs shrink-0 ${statusCfg?.color || ""}`}>{statusCfg?.label || p.status}</Badge>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="text-sm">{p.cnyPrice ? `¥${p.cnyPrice}` : "—"}{p.moq ? <span className="text-xs text-muted-foreground ml-1">MOQ: {p.moq}</span> : ""}</div>
                    {p.franchiseFitScore && renderStars(p.franchiseFitScore)}
                  </div>
                  {p.supplierName && <div className="text-xs text-muted-foreground mt-1">{p.supplierName}</div>}
                  <div className="flex items-center gap-1 mt-2">
                    <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => openEdit(p)} data-testid={`edit-${p.id}`}><Edit2 className="h-3 w-3 mr-1" />Edit</Button>
                    <Button variant="ghost" size="sm" className="h-7 text-xs text-red-500" onClick={() => deleteMutation.mutate(p.id)} data-testid={`delete-${p.id}`}><Trash2 className="h-3 w-3 mr-1" />Delete</Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="border rounded-xl overflow-hidden">
          <table className="w-full">
            <thead><tr className="border-b bg-muted/50">
              <th className="text-left px-4 py-3 text-xs font-medium">Product</th>
              <th className="text-left px-4 py-3 text-xs font-medium">Category</th>
              <th className="text-left px-4 py-3 text-xs font-medium">Supplier</th>
              <th className="text-right px-4 py-3 text-xs font-medium">Price</th>
              <th className="text-right px-4 py-3 text-xs font-medium">MOQ</th>
              <th className="text-center px-4 py-3 text-xs font-medium">Fit</th>
              <th className="text-center px-4 py-3 text-xs font-medium">Status</th>
              <th className="text-right px-4 py-3 text-xs font-medium">Actions</th>
            </tr></thead>
            <tbody>
              {filtered.map((p: any) => {
                const statusCfg = CATALOGUE_STATUS_CONFIG[p.status as keyof typeof CATALOGUE_STATUS_CONFIG];
                return (
                  <tr key={p.id} className="border-b hover:bg-muted/30" data-testid={`row-${p.id}`}>
                    <td className="px-4 py-3 text-sm font-medium">{p.name}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{p.category || "—"}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{p.supplierName || "—"}</td>
                    <td className="px-4 py-3 text-sm text-right">{p.cnyPrice ? `¥${p.cnyPrice}` : "—"}</td>
                    <td className="px-4 py-3 text-sm text-right">{p.moq || "—"}</td>
                    <td className="px-4 py-3 text-center">{p.franchiseFitScore ? renderStars(p.franchiseFitScore) : "—"}</td>
                    <td className="px-4 py-3 text-center"><Badge variant="outline" className={`text-xs ${statusCfg?.color || ""}`}>{statusCfg?.label || p.status}</Badge></td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(p)}><Edit2 className="h-3 w-3" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => deleteMutation.mutate(p.id)}><Trash2 className="h-3 w-3" /></Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <FormDialog open={formOpen} onOpenChange={setFormOpen} title={editItem?.id ? "Edit Product" : "Add Product"} onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div><label className="text-sm font-medium">Product Name *</label><Input name="name" required defaultValue={editItem?.name || ""} data-testid="input-product-name" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-sm font-medium">Category</label><Input name="category" defaultValue={editItem?.category || ""} data-testid="input-category" /></div>
            <div><label className="text-sm font-medium">Sub-Category</label><Input name="sub_category" defaultValue={editItem?.subCategory || ""} data-testid="input-subcategory" /></div>
          </div>
          <div><label className="text-sm font-medium">Supplier Name</label><Input name="supplier_name" defaultValue={editItem?.supplierName || ""} data-testid="input-supplier" /></div>
          <div className="grid grid-cols-3 gap-3">
            <div><label className="text-sm font-medium">Price (CNY)</label><Input name="cny_price" type="number" step="0.01" defaultValue={editItem?.cnyPrice || ""} data-testid="input-price" /></div>
            <div><label className="text-sm font-medium">MOQ</label><Input name="moq" type="number" defaultValue={editItem?.moq || ""} data-testid="input-moq" /></div>
            <div><label className="text-sm font-medium">Franchise Fit (1-5)</label><Input name="franchise_fit_score" type="number" min="1" max="5" defaultValue={editItem?.franchiseFitScore || ""} data-testid="input-fit-score" /></div>
          </div>
          <div>
            <label className="text-sm font-medium">Status</label>
            <select name="status" defaultValue={editItem?.status || "shortlisted"} className="w-full border rounded-md px-3 py-2 text-sm" data-testid="select-status">
              <option value="shortlisted">Shortlisted</option>
              <option value="confirmed">Confirmed</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div><label className="text-sm font-medium">Notes</label><Textarea name="notes" rows={2} defaultValue={editItem?.notes || ""} data-testid="input-notes" /></div>
        </div>
      </FormDialog>
      <SopModal open={sopOpen} onOpenChange={setSopOpen} config={SOP_REGISTRY["triphq-catalogue"].sop} color={TRIPHQ_COLOR} />
      <TutorialModal open={tutorialOpen} onOpenChange={setTutorialOpen} config={SOP_REGISTRY["triphq-catalogue"].tutorial} color={TRIPHQ_COLOR} />
    </PageShell>
  );
}
