import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Camera, Plus, Edit2, Trash2, Upload, Video, MapPin } from "lucide-react";
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

const STATUS_CFG: Record<string, { label: string; color: string }> = {
  planned: { label: "Planned", color: "text-blue-700" },
  shot: { label: "Shot", color: "text-amber-700" },
  editing: { label: "Editing", color: "text-purple-700" },
  published: { label: "Published", color: "text-emerald-700" },
};

export default function TripHQContent() {
  const { toast } = useToast();
  const [sopOpen, setSopOpen] = useState(false);
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: plans = [], isLoading } = useQuery<any[]>({ queryKey: ["/api/triphq/content_plans"] });
  const { data: docs = [] } = useQuery<any[]>({ queryKey: ["/api/triphq/documents"] });

  const saveMutation = useMutation({
    mutationFn: async (body: any) => {
      if (editItem?.id) return apiRequest("PATCH", `/api/triphq/content_plans/${editItem.id}`, body);
      return apiRequest("POST", "/api/triphq/content_plans", body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/triphq/content_plans"] });
      setFormOpen(false); setEditItem(null);
      toast({ title: editItem?.id ? "Plan updated" : "Plan added" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/triphq/content_plans/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/triphq/content_plans"] }); toast({ title: "Plan removed" }); },
  });

  const handleUpload = async (planId: string, file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("doc_type", "content-thumbnail");
    fd.append("entity_type", "content");
    fd.append("entity_id", planId);
    await fetch("/api/triphq/upload", { method: "POST", body: fd });
    queryClient.invalidateQueries({ queryKey: ["/api/triphq/documents"] });
    toast({ title: "Thumbnail uploaded" });
  };

  const filtered = statusFilter === "all" ? plans : plans.filter((p: any) => p.status === statusFilter);

  const openCreate = () => { setEditItem(null); setFormOpen(true); };
  const openEdit = (p: any) => { setEditItem(p); setFormOpen(true); };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    saveMutation.mutate({
      title: fd.get("title"),
      description: fd.get("description") || null,
      city: fd.get("city") || null,
      status: fd.get("status") || "planned",
      equipment: fd.get("equipment") || null,
      video_link: fd.get("video_link") || null,
      notes: fd.get("notes") || null,
    });
  };

  if (isLoading) {
    return (<PageShell className="animate-pulse"><div className="h-16 bg-muted rounded-xl" /><div className="grid grid-cols-2 gap-4">{[...Array(4)].map((_, i) => <div key={i} className="h-48 bg-muted rounded-xl" />)}</div></PageShell>);
  }

  return (
    <PageShell>
      <PageHeader title="Content Planner" subtitle={`${plans.length} shot ideas`} actions={
        <div className="flex items-center gap-2">
          <SopTutorialButtons onSopClick={() => setSopOpen(true)} onTutorialClick={() => setTutorialOpen(true)} />
          <Button onClick={openCreate} style={{ backgroundColor: TRIPHQ_COLOR }} className="text-white" data-testid="button-add-content"><Plus className="h-4 w-4 mr-2" />Add Shot Idea</Button>
        </div>
      } />

      <div className="flex items-center gap-3 flex-wrap">
        <FilterPill label="All" active={statusFilter === "all"} onClick={() => setStatusFilter("all")} count={plans.length} />
        {Object.entries(STATUS_CFG).map(([key, cfg]) => (
          <FilterPill key={key} label={cfg.label} active={statusFilter === key} onClick={() => setStatusFilter(key)} count={plans.filter((p: any) => p.status === key).length} />
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((plan: any) => {
          const planDocs = docs.filter((d: any) => d.entityType === "content" && d.entityId === plan.id);
          const thumbnail = planDocs.find((d: any) => d.fileType?.startsWith("image/"));
          const statusCfg = STATUS_CFG[plan.status];
          return (
            <div key={plan.id} className="border rounded-xl overflow-hidden bg-card hover:shadow-sm transition-shadow" data-testid={`content-${plan.id}`}>
              <div className="h-32 bg-muted flex items-center justify-center relative">
                {thumbnail ? (
                  <img src={thumbnail.fileUrl} alt={plan.title} className="w-full h-full object-cover" />
                ) : (
                  <Video className="h-10 w-10 text-muted-foreground/30" />
                )}
                <label className="absolute bottom-2 right-2 cursor-pointer bg-white/90 dark:bg-gray-900/90 rounded-lg p-1.5 shadow">
                  <input type="file" className="hidden" accept="image/*" onChange={(e) => { if (e.target.files?.[0]) handleUpload(plan.id, e.target.files[0]); }} />
                  <Upload className="h-4 w-4 text-muted-foreground" />
                </label>
              </div>
              <div className="p-3 space-y-2">
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold text-sm">{plan.title}</h3>
                  <Badge variant="outline" className={`text-xs shrink-0 ${statusCfg?.color || ""}`}>{statusCfg?.label || plan.status}</Badge>
                </div>
                {plan.description && <p className="text-xs text-muted-foreground line-clamp-2">{plan.description}</p>}
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {plan.city && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{plan.city}</span>}
                  {plan.equipment && <span>· {plan.equipment}</span>}
                </div>
                {plan.videoLink && <a href={plan.videoLink} target="_blank" rel="noopener noreferrer" className="text-xs underline" style={{ color: TRIPHQ_COLOR }}>View Video</a>}
                <div className="flex items-center gap-1 pt-1">
                  <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => openEdit(plan)}><Edit2 className="h-3 w-3 mr-1" />Edit</Button>
                  <Button variant="ghost" size="sm" className="h-7 text-xs text-red-500" onClick={() => deleteMutation.mutate(plan.id)}><Trash2 className="h-3 w-3 mr-1" />Delete</Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <FormDialog open={formOpen} onOpenChange={setFormOpen} title={editItem?.id ? "Edit Shot" : "Add Shot Idea"} onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div><label className="text-sm font-medium">Title *</label><Input name="title" required defaultValue={editItem?.title || ""} data-testid="input-title" /></div>
          <div><label className="text-sm font-medium">Description</label><Textarea name="description" rows={2} defaultValue={editItem?.description || ""} data-testid="input-description" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-sm font-medium">City</label><Input name="city" defaultValue={editItem?.city || ""} data-testid="input-city" /></div>
            <div>
              <label className="text-sm font-medium">Status</label>
              <select name="status" defaultValue={editItem?.status || "planned"} className="w-full border rounded-md px-3 py-2 text-sm" data-testid="select-status">
                {Object.entries(STATUS_CFG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
          </div>
          <div><label className="text-sm font-medium">Equipment</label><Input name="equipment" defaultValue={editItem?.equipment || ""} data-testid="input-equipment" /></div>
          <div><label className="text-sm font-medium">Video Link</label><Input name="video_link" type="url" defaultValue={editItem?.videoLink || ""} data-testid="input-video-link" /></div>
          <div><label className="text-sm font-medium">Notes</label><Textarea name="notes" rows={2} defaultValue={editItem?.notes || ""} data-testid="input-notes" /></div>
        </div>
      </FormDialog>
      <SopModal open={sopOpen} onOpenChange={setSopOpen} config={SOP_REGISTRY["triphq-content"].sop} color={TRIPHQ_COLOR} />
      <TutorialModal open={tutorialOpen} onOpenChange={setTutorialOpen} config={SOP_REGISTRY["triphq-content"].tutorial} color={TRIPHQ_COLOR} />
    </PageShell>
  );
}
