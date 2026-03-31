import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { CheckSquare, Plus, Edit2, Trash2, Upload, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { TRIPHQ_COLOR } from "@/lib/triphq-config";
import { SopModal, TutorialModal, SopTutorialButtons } from "@/components/sop/sop-modal";
import { SOP_REGISTRY } from "@/lib/sop-data";
import { PageShell, PageHeader, FilterPill } from "@/components/layout";
import { FormDialog } from "@/components/ds/form-dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

const CATEGORIES = ["all", "documents", "travel", "tech", "business", "health", "general"];

export default function TripHQChecklist() {
  const { toast } = useToast();
  const [sopOpen, setSopOpen] = useState(false);
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [catFilter, setCatFilter] = useState("all");

  const { data: items = [], isLoading } = useQuery<any[]>({ queryKey: ["/api/triphq/checklist_items"] });
  const { data: docs = [] } = useQuery<any[]>({ queryKey: ["/api/triphq/documents"] });

  const toggleMutation = useMutation({
    mutationFn: (id: string) => apiRequest("PATCH", `/api/triphq/checklist_items/${id}/toggle`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/triphq/checklist_items"] }),
  });

  const saveMutation = useMutation({
    mutationFn: async (body: any) => {
      if (editItem?.id) return apiRequest("PATCH", `/api/triphq/checklist_items/${editItem.id}`, body);
      return apiRequest("POST", "/api/triphq/checklist_items", body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/triphq/checklist_items"] });
      setFormOpen(false); setEditItem(null);
      toast({ title: editItem?.id ? "Item updated" : "Item added" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/triphq/checklist_items/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/triphq/checklist_items"] }); toast({ title: "Item removed" }); },
  });

  const handleUpload = async (itemId: string, file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("doc_type", "checklist-doc");
    fd.append("entity_type", "checklist");
    fd.append("entity_id", itemId);
    await fetch("/api/triphq/upload", { method: "POST", body: fd });
    queryClient.invalidateQueries({ queryKey: ["/api/triphq/documents"] });
    toast({ title: "Document uploaded" });
  };

  const filtered = catFilter === "all" ? items : items.filter((i: any) => i.category === catFilter);
  const done = items.filter((i: any) => i.isCompleted).length;
  const pct = items.length > 0 ? Math.round((done / items.length) * 100) : 0;

  const openCreate = () => { setEditItem(null); setFormOpen(true); };
  const openEdit = (item: any) => { setEditItem(item); setFormOpen(true); };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    saveMutation.mutate({
      task: fd.get("task"),
      category: fd.get("category") || "general",
      deadline: fd.get("deadline") || null,
      notes: fd.get("notes") || null,
    });
  };

  if (isLoading) {
    return (<PageShell className="animate-pulse"><div className="h-16 bg-muted rounded-xl" /><div className="space-y-2">{[...Array(8)].map((_, i) => <div key={i} className="h-12 bg-muted rounded-lg" />)}</div></PageShell>);
  }

  return (
    <PageShell>
      <PageHeader title="Pre-Departure Checklist" subtitle={`${done}/${items.length} completed`} actions={
        <div className="flex items-center gap-2">
          <SopTutorialButtons onSopClick={() => setSopOpen(true)} onTutorialClick={() => setTutorialOpen(true)} />
          <Button onClick={openCreate} style={{ backgroundColor: TRIPHQ_COLOR }} className="text-white" data-testid="button-add-checklist"><Plus className="h-4 w-4 mr-2" />Add Task</Button>
        </div>
      } />

      <div className="space-y-1">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">{pct}% complete</span>
          <span className="text-muted-foreground">{done} of {items.length}</span>
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

      <div className="space-y-2">
        {filtered.map((item: any) => {
          const itemDocs = docs.filter((d: any) => d.entityType === "checklist" && d.entityId === item.id);
          const isOverdue = item.deadline && !item.isCompleted && new Date(item.deadline) < new Date();
          return (
            <div key={item.id} className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${item.isCompleted ? "bg-muted/30 opacity-70" : "bg-card hover:bg-muted/50"}`} data-testid={`checklist-${item.id}`}>
              <Checkbox checked={item.isCompleted} onCheckedChange={() => toggleMutation.mutate(item.id)} className="mt-0.5" data-testid={`toggle-${item.id}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium ${item.isCompleted ? "line-through text-muted-foreground" : ""}`}>{item.task}</span>
                  <Badge variant="outline" className="text-xs">{item.category}</Badge>
                  {isOverdue && <Badge variant="destructive" className="text-xs"><AlertCircle className="h-3 w-3 mr-1" />Overdue</Badge>}
                </div>
                {item.deadline && <span className="text-xs text-muted-foreground">Due: {new Date(item.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>}
                {item.notes && <p className="text-xs text-muted-foreground mt-1">{item.notes}</p>}
                {itemDocs.length > 0 && (
                  <div className="flex gap-1 mt-1">{itemDocs.map((d: any) => <a key={d.id} href={d.fileUrl} target="_blank" rel="noopener noreferrer"><Badge variant="secondary" className="text-xs">{d.fileName}</Badge></a>)}</div>
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <label className="cursor-pointer"><input type="file" className="hidden" accept="image/*,.pdf" onChange={(e) => { if (e.target.files?.[0]) handleUpload(item.id, e.target.files[0]); }} /><div className="h-7 w-7 rounded border flex items-center justify-center hover:bg-muted"><Upload className="h-3 w-3 text-muted-foreground" /></div></label>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(item)}><Edit2 className="h-3 w-3" /></Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => deleteMutation.mutate(item.id)}><Trash2 className="h-3 w-3" /></Button>
              </div>
            </div>
          );
        })}
      </div>

      <FormDialog open={formOpen} onOpenChange={setFormOpen} title={editItem?.id ? "Edit Task" : "Add Task"} onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div><label className="text-sm font-medium">Task *</label><Input name="task" required defaultValue={editItem?.task || ""} data-testid="input-task" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Category</label>
              <select name="category" defaultValue={editItem?.category || "general"} className="w-full border rounded-md px-3 py-2 text-sm" data-testid="select-category">
                {CATEGORIES.filter((c) => c !== "all").map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
              </select>
            </div>
            <div><label className="text-sm font-medium">Deadline</label><Input name="deadline" type="date" defaultValue={editItem?.deadline?.split("T")[0] || ""} data-testid="input-deadline" /></div>
          </div>
          <div><label className="text-sm font-medium">Notes</label><Textarea name="notes" rows={2} defaultValue={editItem?.notes || ""} data-testid="input-notes" /></div>
        </div>
      </FormDialog>
      <SopModal open={sopOpen} onOpenChange={setSopOpen} config={SOP_REGISTRY["triphq-checklist"].sop} color={TRIPHQ_COLOR} />
      <TutorialModal open={tutorialOpen} onOpenChange={setTutorialOpen} config={SOP_REGISTRY["triphq-checklist"].tutorial} color={TRIPHQ_COLOR} />
    </PageShell>
  );
}
