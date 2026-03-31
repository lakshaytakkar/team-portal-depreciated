import { useState } from "react";
import { useStore } from "@/lib/store";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Search, Plus, Pencil, Trash2, Phone, Mail, Building2, MapPin, User } from "lucide-react";
import type { Contact } from "@shared/schema";

const CATEGORIES = ["client", "vendor", "partner", "prospect", "other"];
const PRIORITIES = ["low", "medium", "high", "urgent"];

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  whatsapp: string;
  organization: string;
  designation: string;
  category: string;
  city: string;
  country: string;
  priority: string;
  notes: string;
}

function ContactForm({ contact, onSave, onCancel }: { contact?: Contact; onSave: (data: ContactFormData) => void; onCancel: () => void }) {
  const [form, setForm] = useState({
    name: contact?.name || "",
    email: contact?.email || "",
    phone: contact?.phone || "",
    whatsapp: contact?.whatsapp || "",
    organization: contact?.organization || "",
    designation: contact?.designation || "",
    category: contact?.category || "client",
    city: contact?.city || "",
    country: contact?.country || "India",
    priority: contact?.priority || "medium",
    notes: contact?.notes || "",
  });

  return (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Name *</Label>
          <Input data-testid="input-contact-name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
        </div>
        <div className="space-y-2">
          <Label>Email</Label>
          <Input data-testid="input-contact-email" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Phone</Label>
          <Input data-testid="input-contact-phone" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
        </div>
        <div className="space-y-2">
          <Label>WhatsApp</Label>
          <Input data-testid="input-contact-whatsapp" value={form.whatsapp} onChange={e => setForm(f => ({ ...f, whatsapp: e.target.value }))} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Organization</Label>
          <Input data-testid="input-contact-org" value={form.organization} onChange={e => setForm(f => ({ ...f, organization: e.target.value }))} />
        </div>
        <div className="space-y-2">
          <Label>Designation</Label>
          <Input data-testid="input-contact-designation" value={form.designation} onChange={e => setForm(f => ({ ...f, designation: e.target.value }))} />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Category</Label>
          <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
            <SelectTrigger data-testid="select-contact-category"><SelectValue /></SelectTrigger>
            <SelectContent>
              {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Priority</Label>
          <Select value={form.priority} onValueChange={v => setForm(f => ({ ...f, priority: v }))}>
            <SelectTrigger data-testid="select-contact-priority"><SelectValue /></SelectTrigger>
            <SelectContent>
              {PRIORITIES.map(p => <SelectItem key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>City</Label>
          <Input data-testid="input-contact-city" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Notes</Label>
        <Textarea data-testid="input-contact-notes" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={3} />
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel} data-testid="button-cancel">Cancel</Button>
        <Button onClick={() => onSave(form)} disabled={!form.name} data-testid="button-save-contact">
          {contact ? "Update" : "Create"} Contact
        </Button>
      </DialogFooter>
    </div>
  );
}

export default function ContactsPage() {
  const { currentTeamId } = useStore();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | undefined>();

  const contactsUrl = (() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (categoryFilter !== "all") params.set("category", categoryFilter);
    if (currentTeamId) params.set("team_id", currentTeamId);
    const qs = params.toString();
    return `/api/contacts${qs ? `?${qs}` : ""}`;
  })();

  const { data: contacts = [], isLoading } = useQuery<Contact[]>({
    queryKey: [contactsUrl],
  });

  const createMutation = useMutation({
    mutationFn: (data: ContactFormData) => apiRequest("POST", "/api/contacts", { ...data, teamId: currentTeamId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
      setDialogOpen(false);
      toast({ title: "Contact created" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ContactFormData> }) => apiRequest("PATCH", `/api/contacts/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
      setDialogOpen(false);
      setEditingContact(undefined);
      toast({ title: "Contact updated" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/contacts/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
      toast({ title: "Contact deleted" });
    },
  });

  const priorityColor = (p: string): "destructive" | "default" | "secondary" | "outline" => {
    switch (p) {
      case "urgent": return "destructive";
      case "high": return "default";
      case "medium": return "secondary";
      default: return "outline";
    }
  };

  const categoryColor = (c: string): "default" | "secondary" | "outline" => {
    switch (c) {
      case "client": return "default";
      case "vendor": return "secondary";
      default: return "outline";
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-page-title">Contacts</h1>
          <p className="text-muted-foreground">{contacts.length} contacts</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) setEditingContact(undefined); }}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-contact"><Plus className="h-4 w-4 mr-2" /> Add Contact</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingContact ? "Edit Contact" : "New Contact"}</DialogTitle>
            </DialogHeader>
            <ContactForm
              contact={editingContact}
              onSave={(data) => {
                if (editingContact) {
                  updateMutation.mutate({ id: editingContact.id, data });
                } else {
                  createMutation.mutate(data);
                }
              }}
              onCancel={() => { setDialogOpen(false); setEditingContact(undefined); }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input data-testid="input-search-contacts" placeholder="Search contacts..." className="pl-10" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[160px]" data-testid="select-category-filter"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Organization</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Location</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contacts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No contacts found. Add your first contact to get started.
                  </TableCell>
                </TableRow>
              ) : (
                contacts.map(contact => (
                  <TableRow key={contact.id} data-testid={`row-contact-${contact.id}`}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium" data-testid={`text-contact-name-${contact.id}`}>{contact.name}</p>
                          {contact.designation && <p className="text-xs text-muted-foreground">{contact.designation}</p>}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {contact.email && <div className="flex items-center gap-1 text-sm"><Mail className="h-3 w-3" />{contact.email}</div>}
                        {contact.phone && <div className="flex items-center gap-1 text-sm"><Phone className="h-3 w-3" />{contact.phone}</div>}
                      </div>
                    </TableCell>
                    <TableCell>
                      {contact.organization && <div className="flex items-center gap-1 text-sm"><Building2 className="h-3 w-3" />{contact.organization}</div>}
                    </TableCell>
                    <TableCell><Badge variant={categoryColor(contact.category)}>{contact.category}</Badge></TableCell>
                    <TableCell><Badge variant={priorityColor(contact.priority)}>{contact.priority}</Badge></TableCell>
                    <TableCell>
                      {(contact.city || contact.country) && (
                        <div className="flex items-center gap-1 text-sm"><MapPin className="h-3 w-3" />{[contact.city, contact.country].filter(Boolean).join(", ")}</div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" data-testid={`button-edit-contact-${contact.id}`} onClick={() => { setEditingContact(contact); setDialogOpen(true); }}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" data-testid={`button-delete-contact-${contact.id}`} onClick={() => { if (confirm("Delete this contact?")) deleteMutation.mutate(contact.id); }}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
