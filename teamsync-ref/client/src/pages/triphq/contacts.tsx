import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Users, Plus, Edit2, Trash2, Phone, Mail, MessageCircle, MapPin, Upload } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TRIPHQ_COLOR, CONTACT_STATUS_CONFIG } from "@/lib/triphq-config";
import { SopModal, TutorialModal, SopTutorialButtons } from "@/components/sop/sop-modal";
import { SOP_REGISTRY } from "@/lib/sop-data";
import { PageShell, PageHeader, StatGrid, StatCard, FilterPill } from "@/components/layout";
import { FormDialog } from "@/components/ds/form-dialog";
import { StatusBadge } from "@/components/ds/status-badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function TripHQContacts() {
  const { toast } = useToast();
  const [sopOpen, setSopOpen] = useState(false);
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [uploadOpen, setUploadOpen] = useState<string | null>(null);

  const { data: contacts = [], isLoading } = useQuery<any[]>({ queryKey: ["/api/triphq/contacts"] });
  const { data: docs = [] } = useQuery<any[]>({ queryKey: ["/api/triphq/documents"] });

  const saveMutation = useMutation({
    mutationFn: async (body: any) => {
      if (editItem?.id) return apiRequest("PATCH", `/api/triphq/contacts/${editItem.id}`, body);
      return apiRequest("POST", "/api/triphq/contacts", body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/triphq/contacts"] });
      setFormOpen(false); setEditItem(null);
      toast({ title: editItem?.id ? "Contact updated" : "Contact added" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/triphq/contacts/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/triphq/contacts"] }); toast({ title: "Contact removed" }); },
  });

  const handleUpload = async (contactId: string, file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("doc_type", "business-card");
    fd.append("entity_type", "contact");
    fd.append("entity_id", contactId);
    fd.append("contact_name", contacts.find((c) => c.id === contactId)?.name || "");
    await fetch("/api/triphq/upload", { method: "POST", body: fd });
    queryClient.invalidateQueries({ queryKey: ["/api/triphq/documents"] });
    toast({ title: "File uploaded" });
  };

  const filtered = contacts.filter((c: any) => {
    if (search && !c.name.toLowerCase().includes(search.toLowerCase()) && !(c.company || "").toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter !== "all" && c.meetingStatus !== statusFilter) return false;
    return true;
  });

  const met = contacts.filter((c: any) => c.meetingStatus === "met" || c.meetingStatus === "followed-up").length;

  const openCreate = () => { setEditItem(null); setFormOpen(true); };
  const openEdit = (c: any) => { setEditItem(c); setFormOpen(true); };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    saveMutation.mutate({
      name: fd.get("name"),
      company: fd.get("company") || null,
      role: fd.get("role") || null,
      email: fd.get("email") || null,
      phone: fd.get("phone") || null,
      wechat_id: fd.get("wechat_id") || null,
      city: fd.get("city") || null,
      meeting_status: fd.get("meeting_status") || "upcoming",
      notes: fd.get("notes") || null,
    });
  };

  if (isLoading) {
    return (<PageShell className="animate-pulse"><div className="h-16 bg-muted rounded-xl" /><div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-20 bg-muted rounded-xl" />)}</div></PageShell>);
  }

  return (
    <PageShell>
      <PageHeader title="Contacts" subtitle={`${contacts.length} contacts · ${met} met`} actions={
        <div className="flex items-center gap-2">
          <SopTutorialButtons onSopClick={() => setSopOpen(true)} onTutorialClick={() => setTutorialOpen(true)} />
          <Button onClick={openCreate} style={{ backgroundColor: TRIPHQ_COLOR }} className="text-white" data-testid="button-add-contact"><Plus className="h-4 w-4 mr-2" />Add Contact</Button>
        </div>
      } />

      <div className="flex items-center gap-3 flex-wrap">
        <Input placeholder="Search by name or company..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" data-testid="input-search-contacts" />
        <FilterPill label="All" active={statusFilter === "all"} onClick={() => setStatusFilter("all")} count={contacts.length} />
        <FilterPill label="Upcoming" active={statusFilter === "upcoming"} onClick={() => setStatusFilter("upcoming")} count={contacts.filter((c: any) => c.meetingStatus === "upcoming").length} />
        <FilterPill label="Met" active={statusFilter === "met"} onClick={() => setStatusFilter("met")} count={contacts.filter((c: any) => c.meetingStatus === "met").length} />
        <FilterPill label="Followed Up" active={statusFilter === "followed-up"} onClick={() => setStatusFilter("followed-up")} count={contacts.filter((c: any) => c.meetingStatus === "followed-up").length} />
      </div>

      <div className="space-y-3">
        {filtered.map((c: any) => {
          const contactDocs = docs.filter((d: any) => d.entityType === "contact" && d.entityId === c.id);
          return (
            <div key={c.id} className="border rounded-xl p-4 bg-card hover:shadow-sm transition-shadow" data-testid={`contact-${c.id}`}>
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0" style={{ backgroundColor: TRIPHQ_COLOR }}>
                  {c.name.split(" ").map((n: string) => n[0]).join("").substring(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold">{c.name}</span>
                    <Badge variant="outline" className={`text-xs ${CONTACT_STATUS_CONFIG[c.meetingStatus as keyof typeof CONTACT_STATUS_CONFIG]?.color || ""}`}>
                      {CONTACT_STATUS_CONFIG[c.meetingStatus as keyof typeof CONTACT_STATUS_CONFIG]?.label || c.meetingStatus}
                    </Badge>
                    {c.city && <Badge variant="secondary" className="text-xs"><MapPin className="h-3 w-3 mr-1" />{c.city}</Badge>}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
                    {c.company && <span>{c.company}</span>}
                    {c.role && <span>· {c.role}</span>}
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    {c.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{c.phone}</span>}
                    {c.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{c.email}</span>}
                    {c.wechatId && <span className="flex items-center gap-1"><MessageCircle className="h-3 w-3" />{c.wechatId}</span>}
                  </div>
                  {c.notes && <p className="text-sm text-muted-foreground mt-2 italic">{c.notes}</p>}
                  {contactDocs.length > 0 && (
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {contactDocs.map((d: any) => (
                        <a key={d.id} href={d.fileUrl} target="_blank" rel="noopener noreferrer" className="block">
                          {d.fileType?.startsWith("image/") ? (
                            <img src={d.fileUrl} alt={d.fileName} className="h-16 w-16 object-cover rounded border" />
                          ) : (
                            <Badge variant="outline" className="text-xs">{d.fileName}</Badge>
                          )}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <label className="cursor-pointer">
                    <input type="file" className="hidden" accept="image/*,audio/*,.pdf" onChange={(e) => { if (e.target.files?.[0]) handleUpload(c.id, e.target.files[0]); }} data-testid={`upload-${c.id}`} />
                    <div className="h-8 w-8 rounded-md border flex items-center justify-center hover:bg-muted"><Upload className="h-3.5 w-3.5 text-muted-foreground" /></div>
                  </label>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(c)} data-testid={`edit-${c.id}`}><Edit2 className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => deleteMutation.mutate(c.id)} data-testid={`delete-${c.id}`}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <FormDialog open={formOpen} onOpenChange={setFormOpen} title={editItem?.id ? "Edit Contact" : "Add Contact"} onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-sm font-medium">Name *</label><Input name="name" required defaultValue={editItem?.name || ""} data-testid="input-name" /></div>
            <div><label className="text-sm font-medium">Company</label><Input name="company" defaultValue={editItem?.company || ""} data-testid="input-company" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-sm font-medium">Role</label><Input name="role" defaultValue={editItem?.role || ""} data-testid="input-role" /></div>
            <div><label className="text-sm font-medium">City</label><Input name="city" defaultValue={editItem?.city || ""} data-testid="input-city" /></div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div><label className="text-sm font-medium">Email</label><Input name="email" type="email" defaultValue={editItem?.email || ""} data-testid="input-email" /></div>
            <div><label className="text-sm font-medium">Phone</label><Input name="phone" defaultValue={editItem?.phone || ""} data-testid="input-phone" /></div>
            <div><label className="text-sm font-medium">WeChat ID</label><Input name="wechat_id" defaultValue={editItem?.wechatId || ""} data-testid="input-wechat" /></div>
          </div>
          <div>
            <label className="text-sm font-medium">Status</label>
            <select name="meeting_status" defaultValue={editItem?.meetingStatus || "upcoming"} className="w-full border rounded-md px-3 py-2 text-sm" data-testid="select-status">
              <option value="upcoming">Upcoming</option>
              <option value="met">Met</option>
              <option value="followed-up">Followed Up</option>
            </select>
          </div>
          <div><label className="text-sm font-medium">Notes</label><Textarea name="notes" rows={3} defaultValue={editItem?.notes || ""} data-testid="input-notes" /></div>
        </div>
      </FormDialog>
      <SopModal open={sopOpen} onOpenChange={setSopOpen} config={SOP_REGISTRY["triphq-contacts"].sop} color={TRIPHQ_COLOR} />
      <TutorialModal open={tutorialOpen} onOpenChange={setTutorialOpen} config={SOP_REGISTRY["triphq-contacts"].tutorial} color={TRIPHQ_COLOR} />
    </PageShell>
  );
}
