import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ExternalLink, Plus, Edit2, Trash2, Plane, CreditCard, MessageCircle, Map, Wifi, Globe, Smartphone, ShoppingBag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { TRIPHQ_COLOR } from "@/lib/triphq-config";
import { SopModal, TutorialModal, SopTutorialButtons } from "@/components/sop/sop-modal";
import { SOP_REGISTRY } from "@/lib/sop-data";
import { PageShell, PageHeader, FilterPill } from "@/components/layout";
import { FormDialog } from "@/components/ds/form-dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

const CATEGORY_ICONS: Record<string, any> = {
  transport: Plane, payment: CreditCard, communication: MessageCircle,
  navigation: Map, connectivity: Wifi, business: Globe,
  shopping: ShoppingBag, other: Smartphone,
};
const CATEGORY_COLORS: Record<string, string> = {
  transport: "bg-blue-50 text-blue-700", payment: "bg-emerald-50 text-emerald-700",
  communication: "bg-purple-50 text-purple-700", navigation: "bg-amber-50 text-amber-700",
  connectivity: "bg-cyan-50 text-cyan-700", business: "bg-rose-50 text-rose-700",
  shopping: "bg-pink-50 text-pink-700", other: "bg-gray-50 text-gray-700",
};

export default function TripHQApps() {
  const { toast } = useToast();
  const [sopOpen, setSopOpen] = useState(false);
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [catFilter, setCatFilter] = useState("all");

  const { data: apps = [], isLoading } = useQuery<any[]>({ queryKey: ["/api/triphq/external_apps"] });

  const saveMutation = useMutation({
    mutationFn: async (body: any) => {
      if (editItem?.id) return apiRequest("PATCH", `/api/triphq/external_apps/${editItem.id}`, body);
      return apiRequest("POST", "/api/triphq/external_apps", body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/triphq/external_apps"] });
      setFormOpen(false); setEditItem(null);
      toast({ title: editItem?.id ? "App updated" : "App added" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/triphq/external_apps/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/triphq/external_apps"] }); toast({ title: "App removed" }); },
  });

  const filtered = catFilter === "all" ? apps : apps.filter((a: any) => a.category === catFilter);
  const categories = [...new Set(apps.map((a: any) => a.category))];

  const openCreate = () => { setEditItem(null); setFormOpen(true); };
  const openEdit = (app: any) => { setEditItem(app); setFormOpen(true); };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    saveMutation.mutate({
      app_name: fd.get("app_name"),
      url: fd.get("url"),
      category: fd.get("category") || "other",
      notes: fd.get("notes") || null,
      icon_name: fd.get("icon_name") || null,
    });
  };

  if (isLoading) {
    return (<PageShell className="animate-pulse"><div className="h-16 bg-muted rounded-xl" /><div className="grid grid-cols-3 gap-4">{[...Array(6)].map((_, i) => <div key={i} className="h-32 bg-muted rounded-xl" />)}</div></PageShell>);
  }

  const grouped = filtered.reduce((acc: Record<string, any[]>, app: any) => {
    const cat = app.category || "other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(app);
    return acc;
  }, {});

  return (
    <PageShell>
      <PageHeader title="External Apps" subtitle={`${apps.length} apps configured`} actions={
        <div className="flex items-center gap-2">
          <SopTutorialButtons onSopClick={() => setSopOpen(true)} onTutorialClick={() => setTutorialOpen(true)} />
          <Button onClick={openCreate} style={{ backgroundColor: TRIPHQ_COLOR }} className="text-white" data-testid="button-add-app"><Plus className="h-4 w-4 mr-2" />Add App</Button>
        </div>
      } />

      <div className="flex items-center gap-2 flex-wrap">
        <FilterPill label="All" active={catFilter === "all"} onClick={() => setCatFilter("all")} count={apps.length} />
        {categories.map((cat) => (
          <FilterPill key={cat} label={cat.charAt(0).toUpperCase() + cat.slice(1)} active={catFilter === cat} onClick={() => setCatFilter(cat)} count={apps.filter((a: any) => a.category === cat).length} />
        ))}
      </div>

      {Object.entries(grouped).map(([category, catApps]) => {
        const CatIcon = CATEGORY_ICONS[category] || Smartphone;
        return (
          <div key={category}>
            <div className="flex items-center gap-2 mb-3">
              <CatIcon className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">{category}</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
              {(catApps as any[]).map((app: any) => {
                const AppIcon = CATEGORY_ICONS[app.category] || Smartphone;
                return (
                  <div key={app.id} className="border rounded-xl p-4 bg-card hover:shadow-sm transition-shadow flex items-start gap-3" data-testid={`app-${app.id}`}>
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${CATEGORY_COLORS[app.category] || CATEGORY_COLORS.other}`}>
                      <AppIcon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">{app.appName}</span>
                        <Badge variant="outline" className="text-xs">{app.category}</Badge>
                      </div>
                      {app.notes && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{app.notes}</p>}
                      <div className="flex items-center gap-1 mt-2">
                        <a href={app.url} target="_blank" rel="noopener noreferrer">
                          <Button variant="outline" size="sm" className="h-7 text-xs" data-testid={`launch-${app.id}`}><ExternalLink className="h-3 w-3 mr-1" />Open</Button>
                        </a>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(app)} data-testid={`edit-${app.id}`}><Edit2 className="h-3 w-3" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => deleteMutation.mutate(app.id)} data-testid={`delete-${app.id}`}><Trash2 className="h-3 w-3" /></Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
      {filtered.length === 0 && <p className="text-center py-8 text-sm text-muted-foreground">No apps configured yet</p>}

      <FormDialog open={formOpen} onOpenChange={setFormOpen} title={editItem?.id ? "Edit App" : "Add App"} onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div><label className="text-sm font-medium">App Name *</label><Input name="app_name" required defaultValue={editItem?.appName || ""} data-testid="input-app-name" /></div>
          <div><label className="text-sm font-medium">URL *</label><Input name="url" type="url" required defaultValue={editItem?.url || ""} data-testid="input-url" /></div>
          <div>
            <label className="text-sm font-medium">Category</label>
            <select name="category" defaultValue={editItem?.category || "other"} className="w-full border rounded-md px-3 py-2 text-sm" data-testid="select-category">
              {Object.keys(CATEGORY_ICONS).map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
            </select>
          </div>
          <div><label className="text-sm font-medium">Notes</label><Textarea name="notes" rows={2} defaultValue={editItem?.notes || ""} data-testid="input-notes" /></div>
          <div><label className="text-sm font-medium">Icon Name</label><Input name="icon_name" defaultValue={editItem?.iconName || ""} placeholder="e.g., plane, credit-card" data-testid="input-icon" /></div>
        </div>
      </FormDialog>
      <SopModal open={sopOpen} onOpenChange={setSopOpen} config={SOP_REGISTRY["triphq-apps"].sop} color={TRIPHQ_COLOR} />
      <TutorialModal open={tutorialOpen} onOpenChange={setTutorialOpen} config={SOP_REGISTRY["triphq-apps"].tutorial} color={TRIPHQ_COLOR} />
    </PageShell>
  );
}
