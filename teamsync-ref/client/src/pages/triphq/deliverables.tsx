import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ClipboardCheck, Plus, Edit2, Trash2, Upload, ExternalLink, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { TRIPHQ_COLOR } from "@/lib/triphq-config";
import { SopModal, TutorialModal, SopTutorialButtons } from "@/components/sop/sop-modal";
import { SOP_REGISTRY } from "@/lib/sop-data";
import { PageShell, PageHeader, StatGrid, StatCard, FilterPill } from "@/components/layout";
import { FormDialog } from "@/components/ds/form-dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

const STATUS_CFG: Record<string, { label: string; color: string }> = {
  pending: { label: "Pending", color: "text-amber-700 bg-amber-50" },
  "in-progress": { label: "In Progress", color: "text-blue-700 bg-blue-50" },
  done: { label: "Done", color: "text-emerald-700 bg-emerald-50" },
};

export default function TripHQDeliverables() {
  const { toast } = useToast();
  const [sopOpen, setSopOpen] = useState(false);
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: items = [], isLoading } = useQuery<any[]>({ queryKey: ["/api/triphq/deliverables"] });
  const { data: docs = [] } = useQuery<any[]>({ queryKey: ["/api/triphq/documents"] });

  const saveMutation = useMutation({
    mutationFn: async (body: any) => {
      if (editItem?.id) return apiRequest("PATCH", `/api/triphq/deliverables/${editItem.id}`, body);
      return apiRequest("POST", "/api/triphq/deliverables", body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/triphq/deliverables"] });
      setFormOpen(false); setEditItem(null);
      toast({ title: editItem?.id ? "Deliverable updated" : "Deliverable added" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/triphq/deliverables/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/triphq/deliverables"] }); toast({ title: "Deliverable removed" }); },
  });

  const handleUpload = async (itemId: string, file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("doc_type", "deliverable");
    fd.append("entity_type", "deliverable");
    fd.append("entity_id", itemId);
    await fetch("/api/triphq/upload", { method: "POST", body: fd });
    queryClient.invalidateQueries({ queryKey: ["/api/triphq/documents"] });
    toast({ title: "File uploaded" });
  };

  const filtered = statusFilter === "all" ? items : items.filter((i: any) => i.status === statusFilter);
  const done = items.filter((i: any) => i.status === "done").length;

  const openCreate = () => { setEditItem(null); setFormOpen(true); };
  const openEdit = (item: any) => { setEditItem(item); setFormOpen(true); };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    saveMutation.mutate({
      title: fd.get("title"),
      description: fd.get("description") || null,
      status: fd.get("status") || "pending",
      due_date: fd.get("due_date") || null,
      completion_notes: fd.get("completion_notes") || null,
      link_url: fd.get("link_url") || null,
    });
  };

  if (isLoading) {
    return (<PageShell className="animate-pulse"><div className="h-16 bg-muted rounded-xl" /><div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-24 bg-muted rounded-xl" />)}</div></PageShell>);
  }

  return (
    <PageShell>
      <PageHeader title="Post-Trip Deliverables" subtitle={`${done}/${items.length} completed`} actions={
        <div className="flex items-center gap-2">
          <SopTutorialButtons onSopClick={() => setSopOpen(true)} onTutorialClick={() => setTutorialOpen(true)} />
          <Button onClick={openCreate} style={{ backgroundColor: TRIPHQ_COLOR }} className="text-white" data-testid="button-add-deliverable"><Plus className="h-4 w-4 mr-2" />Add Deliverable</Button>
        </div>
      } />

      <StatGrid>
        <StatCard label="Total" value={items.length} icon={ClipboardCheck} iconBg="rgba(8,145,178,0.1)" iconColor={TRIPHQ_COLOR} />
        <StatCard label="Pending" value={items.filter((i: any) => i.status === "pending").length} icon={Calendar} iconBg="rgba(245,158,11,0.1)" iconColor="#F59E0B" />
        <StatCard label="Done" value={done} icon={ClipboardCheck} iconBg="rgba(16,185,129,0.1)" iconColor="#10B981" />
      </StatGrid>

      <div className="flex items-center gap-3 flex-wrap">
        <FilterPill label="All" active={statusFilter === "all"} onClick={() => setStatusFilter("all")} count={items.length} />
        {Object.entries(STATUS_CFG).map(([key, cfg]) => (
          <FilterPill key={key} label={cfg.label} active={statusFilter === key} onClick={() => setStatusFilter(key)} count={items.filter((i: any) => i.status === key).length} />
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((item: any) => {
          const itemDocs = docs.filter((d: any) => d.entityType === "deliverable" && d.entityId === item.id);
          const statusCfg = STATUS_CFG[item.status];
          const isOverdue = item.dueDate && item.status !== "done" && new Date(item.dueDate) < new Date();
          return (
            <div key={item.id} className="border rounded-xl p-4 bg-card hover:shadow-sm transition-shadow" data-testid={`deliverable-${item.id}`}>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${TRIPHQ_COLOR}15` }}>
                  <ClipboardCheck className="h-5 w-5" style={{ color: TRIPHQ_COLOR }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm">{item.title}</span>
                    <Badge variant="outline" className={`text-xs ${statusCfg?.color || ""}`}>{statusCfg?.label || item.status}</Badge>
                    {isOverdue && <Badge variant="destructive" className="text-xs">Overdue</Badge>}
                  </div>
                  {item.description && <p className="text-sm text-muted-foreground mt-1">{item.description}</p>}
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    {item.dueDate && <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />Due: {new Date(item.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>}
                    {item.linkUrl && <a href={item.linkUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 underline" style={{ color: TRIPHQ_COLOR }}><ExternalLink className="h-3 w-3" />Link</a>}
                  </div>
                  {item.completionNotes && <p className="text-xs text-muted-foreground mt-2 italic border-l-2 pl-2" style={{ borderColor: TRIPHQ_COLOR }}>{item.completionNotes}</p>}
                  {itemDocs.length > 0 && (
                    <div className="flex gap-1 mt-2 flex-wrap">{itemDocs.map((d: any) => <a key={d.id} href={d.fileUrl} target="_blank" rel="noopener noreferrer"><Badge variant="secondary" className="text-xs">{d.fileName}</Badge></a>)}</div>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <label className="cursor-pointer"><input type="file" className="hidden" onChange={(e) => { if (e.target.files?.[0]) handleUpload(item.id, e.target.files[0]); }} /><div className="h-8 w-8 rounded-md border flex items-center justify-center hover:bg-muted"><Upload className="h-3.5 w-3.5 text-muted-foreground" /></div></label>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(item)}><Edit2 className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => deleteMutation.mutate(item.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && <p className="text-center py-8 text-sm text-muted-foreground">No deliverables yet</p>}
      </div>

      <FormDialog open={formOpen} onOpenChange={setFormOpen} title={editItem?.id ? "Edit Deliverable" : "Add Deliverable"} onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div><label className="text-sm font-medium">Title *</label><Input name="title" required defaultValue={editItem?.title || ""} data-testid="input-title" /></div>
          <div><label className="text-sm font-medium">Description</label><Textarea name="description" rows={2} defaultValue={editItem?.description || ""} data-testid="input-description" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Status</label>
              <select name="status" defaultValue={editItem?.status || "pending"} className="w-full border rounded-md px-3 py-2 text-sm" data-testid="select-status">
                {Object.entries(STATUS_CFG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
            <div><label className="text-sm font-medium">Due Date</label><Input name="due_date" type="date" defaultValue={editItem?.dueDate?.split("T")[0] || ""} data-testid="input-due-date" /></div>
          </div>
          <div><label className="text-sm font-medium">Link URL</label><Input name="link_url" type="url" defaultValue={editItem?.linkUrl || ""} data-testid="input-link" /></div>
          <div><label className="text-sm font-medium">Completion Notes</label><Textarea name="completion_notes" rows={2} defaultValue={editItem?.completionNotes || ""} data-testid="input-completion-notes" /></div>
        </div>
      </FormDialog>
      <SopModal open={sopOpen} onOpenChange={setSopOpen} config={SOP_REGISTRY["triphq-deliverables"].sop} color={TRIPHQ_COLOR} />
      <TutorialModal open={tutorialOpen} onOpenChange={setTutorialOpen} config={SOP_REGISTRY["triphq-deliverables"].tutorial} color={TRIPHQ_COLOR} />
    </PageShell>
  );
}
