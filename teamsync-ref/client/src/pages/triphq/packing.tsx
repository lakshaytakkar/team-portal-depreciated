import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Package, Plus, Edit2, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { TRIPHQ_COLOR } from "@/lib/triphq-config";
import { SopModal, TutorialModal, SopTutorialButtons } from "@/components/sop/sop-modal";
import { SOP_REGISTRY } from "@/lib/sop-data";
import { PageShell, PageHeader, FilterPill } from "@/components/layout";
import { FormDialog } from "@/components/ds/form-dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

const CATEGORIES = ["all", "documents", "tech", "clothing", "toiletries", "health", "business", "general"];

export default function TripHQPacking() {
  const { toast } = useToast();
  const [sopOpen, setSopOpen] = useState(false);
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [catFilter, setCatFilter] = useState("all");

  const { data: items = [], isLoading } = useQuery<any[]>({ queryKey: ["/api/triphq/packing_items"] });

  const toggleMutation = useMutation({
    mutationFn: (id: string) => apiRequest("PATCH", `/api/triphq/packing_items/${id}/toggle`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/triphq/packing_items"] }),
  });

  const saveMutation = useMutation({
    mutationFn: async (body: any) => {
      if (editItem?.id) return apiRequest("PATCH", `/api/triphq/packing_items/${editItem.id}`, body);
      return apiRequest("POST", "/api/triphq/packing_items", body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/triphq/packing_items"] });
      setFormOpen(false); setEditItem(null);
      toast({ title: editItem?.id ? "Item updated" : "Item added" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/triphq/packing_items/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/triphq/packing_items"] }); toast({ title: "Item removed" }); },
  });

  const filtered = catFilter === "all" ? items : items.filter((i: any) => i.category === catFilter);
  const packed = items.filter((i: any) => i.isPacked).length;
  const pct = items.length > 0 ? Math.round((packed / items.length) * 100) : 0;

  const grouped = filtered.reduce((acc: Record<string, any[]>, item: any) => {
    const cat = item.category || "general";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  const openCreate = () => { setEditItem(null); setFormOpen(true); };
  const openEdit = (item: any) => { setEditItem(item); setFormOpen(true); };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    saveMutation.mutate({
      item: fd.get("item"),
      quantity: parseInt(fd.get("quantity") as string) || 1,
      category: fd.get("category") || "general",
      notes: fd.get("notes") || null,
    });
  };

  if (isLoading) {
    return (<PageShell className="animate-pulse"><div className="h-16 bg-muted rounded-xl" /><div className="space-y-2">{[...Array(8)].map((_, i) => <div key={i} className="h-10 bg-muted rounded-lg" />)}</div></PageShell>);
  }

  return (
    <PageShell>
      <PageHeader title="Packing List" subtitle={`${packed}/${items.length} packed`} actions={
        <div className="flex items-center gap-2">
          <SopTutorialButtons onSopClick={() => setSopOpen(true)} onTutorialClick={() => setTutorialOpen(true)} />
          <Button onClick={openCreate} style={{ backgroundColor: TRIPHQ_COLOR }} className="text-white" data-testid="button-add-packing"><Plus className="h-4 w-4 mr-2" />Add Item</Button>
        </div>
      } />

      <div className="space-y-1">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">{pct}% packed</span>
          <span className="text-muted-foreground">{packed} of {items.length}</span>
        </div>
        <div className="h-3 bg-muted rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: TRIPHQ_COLOR }} />
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {CATEGORIES.map((cat) => (
          <FilterPill key={cat} label={cat === "all" ? "All" : cat.charAt(0).toUpperCase() + cat.slice(1)} active={catFilter === cat} onClick={() => setCatFilter(cat)} count={cat === "all" ? items.length : items.filter((i: any) => i.category === cat).length} />
        ))}
      </div>

      <div className="space-y-4">
        {Object.entries(grouped).map(([category, catItems]) => (
          <div key={category}>
            <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">{category} ({(catItems as any[]).filter((i: any) => i.isPacked).length}/{(catItems as any[]).length})</h3>
            <div className="space-y-1">
              {(catItems as any[]).map((item: any) => (
                <div key={item.id} className={`flex items-center gap-3 p-2.5 rounded-lg border transition-colors ${item.isPacked ? "bg-muted/30 opacity-60" : "bg-card hover:bg-muted/50"}`} data-testid={`packing-${item.id}`}>
                  <Checkbox checked={item.isPacked} onCheckedChange={() => toggleMutation.mutate(item.id)} data-testid={`toggle-${item.id}`} />
                  <div className="flex-1 min-w-0">
                    <span className={`text-sm ${item.isPacked ? "line-through text-muted-foreground" : "font-medium"}`}>{item.item}</span>
                    {item.quantity > 1 && <span className="text-xs text-muted-foreground ml-2">×{item.quantity}</span>}
                    {item.notes && <p className="text-xs text-muted-foreground">{item.notes}</p>}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => openEdit(item)}><Edit2 className="h-3 w-3" /></Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500" onClick={() => deleteMutation.mutate(item.id)}><Trash2 className="h-3 w-3" /></Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <FormDialog open={formOpen} onOpenChange={setFormOpen} title={editItem?.id ? "Edit Item" : "Add Item"} onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div><label className="text-sm font-medium">Item *</label><Input name="item" required defaultValue={editItem?.item || ""} data-testid="input-item" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-sm font-medium">Quantity</label><Input name="quantity" type="number" min="1" defaultValue={editItem?.quantity || 1} data-testid="input-quantity" /></div>
            <div>
              <label className="text-sm font-medium">Category</label>
              <select name="category" defaultValue={editItem?.category || "general"} className="w-full border rounded-md px-3 py-2 text-sm" data-testid="select-category">
                {CATEGORIES.filter((c) => c !== "all").map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
              </select>
            </div>
          </div>
          <div><label className="text-sm font-medium">Notes</label><Input name="notes" defaultValue={editItem?.notes || ""} data-testid="input-notes" /></div>
        </div>
      </FormDialog>
      <SopModal open={sopOpen} onOpenChange={setSopOpen} config={SOP_REGISTRY["triphq-packing"].sop} color={TRIPHQ_COLOR} />
      <TutorialModal open={tutorialOpen} onOpenChange={setTutorialOpen} config={SOP_REGISTRY["triphq-packing"].tutorial} color={TRIPHQ_COLOR} />
    </PageShell>
  );
}
