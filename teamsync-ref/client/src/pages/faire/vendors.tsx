import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Pencil, Star, Phone, Mail, Building2 } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { CompanyCell, PersonCell } from "@/components/ui/avatar-cells";
import { Fade } from "@/components/ui/animated";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  PageShell, PageHeader, StatGrid, StatCard, IndexToolbar,
  DataTableContainer, DataTH, DataTD, DataTR, DetailModal,
} from "@/components/layout";
import { FAIRE_COLOR } from "@/lib/faire-config";


interface FaireVendor {
  id: string;
  name: string;
  contact_name: string | null;
  email: string | null;
  whatsapp: string | null;
  is_default: boolean;
  notes: string | null;
  created_at: string | null;
}

const PAGE_SIZE = 25;

export default function FaireVendors() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<{ vendors: FaireVendor[] }>({
    queryKey: ["/api/faire/vendors"],
    queryFn: async () => {
      const res = await fetch("/api/faire/vendors", { headers: { "Cache-Control": "no-cache" } });
      if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`);
      return res.json();
    },
  });

  const vendors = data?.vendors ?? [];

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<FaireVendor | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [fName, setFName] = useState("");
  const [fContact, setFContact] = useState("");
  const [fEmail, setFEmail] = useState("");
  const [fWhatsapp, setFWhatsapp] = useState("");
  const [fNotes, setFNotes] = useState("");
  const [fDefault, setFDefault] = useState(false);

  function openAdd() {
    setEditing(null);
    setFName(""); setFContact(""); setFEmail(""); setFWhatsapp(""); setFNotes(""); setFDefault(false);
    setFormOpen(true);
  }

  function openEdit(v: FaireVendor) {
    setEditing(v);
    setFName(v.name); setFContact(v.contact_name ?? ""); setFEmail(v.email ?? "");
    setFWhatsapp(v.whatsapp ?? ""); setFNotes(v.notes ?? ""); setFDefault(v.is_default);
    setFormOpen(true);
  }

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!fName.trim()) throw new Error("Name is required");
      const body = { id: editing?.id, name: fName.trim(), contact_name: fContact.trim() || null, email: fEmail.trim() || null, whatsapp: fWhatsapp.trim() || null, notes: fNotes.trim() || null, is_default: fDefault };
      return apiRequest("POST", "/api/faire/vendors", body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/faire/vendors"] });
      setFormOpen(false);
      toast({ title: editing ? "Vendor updated" : "Vendor added" });
    },
    onError: (e: any) => toast({ title: e.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => apiRequest("DELETE", `/api/faire/vendors/${id}`),
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: ["/api/faire/vendors"] });
      const previous = queryClient.getQueryData<{ vendors: FaireVendor[] }>(["/api/faire/vendors"]);
      queryClient.setQueryData<{ vendors: FaireVendor[] }>(["/api/faire/vendors"], (old) => {
        if (!old) return old;
        return { ...old, vendors: old.vendors.filter(v => v.id !== id) };
      });
      setDeleteId(null);
      return { previous };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/faire/vendors"] });
      toast({ title: "Vendor deleted" });
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["/api/faire/vendors"], context.previous);
      }
      toast({ title: "Failed to delete vendor", variant: "destructive" });
    },
  });

  const filtered = vendors.filter(v => {
    if (!search) return true;
    const s = search.toLowerCase();
    return v.name.toLowerCase().includes(s) || (v.contact_name ?? "").toLowerCase().includes(s) || (v.email ?? "").toLowerCase().includes(s);
  });

  const defaultVendor = vendors.find(v => v.is_default);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <PageShell>
      <Fade>
        <PageHeader
          title="Vendors"
          subtitle="Supplier and fulfiller directory for Faire quotations"
          actions={
            <Button onClick={openAdd} style={{ background: FAIRE_COLOR }} className="text-white hover:opacity-90" data-testid="btn-add-vendor">
              <Plus size={15} className="mr-1.5" /> Add Vendor
            </Button>
          }
        />
      </Fade>

      <Fade>
        <StatGrid cols={3}>
          <StatCard label="Total Vendors" value={isLoading ? "—" : String(vendors.length)} icon={Building2} iconBg="#EFF6FF" iconColor="#2563EB" />
          <StatCard label="Default Vendor" value={isLoading ? "—" : (defaultVendor?.name ?? "Not set")} icon={Star} iconBg="#FFFBEB" iconColor="#D97706" />
          <StatCard label="With WhatsApp" value={isLoading ? "—" : String(vendors.filter(v => v.whatsapp).length)} icon={Phone} iconBg="#ECFDF5" iconColor="#059669" />
        </StatGrid>
      </Fade>

      <Fade>
        <IndexToolbar
          search={search}
          onSearch={v => { setSearch(v); setCurrentPage(1); }}
          placeholder="Search vendors…"
          color={FAIRE_COLOR}
        />
      </Fade>

      <Fade>
        <DataTableContainer>
          {isLoading && <div className="h-48 animate-pulse bg-muted/30 rounded" />}
          {!isLoading && filtered.length === 0 && (
            <div className="p-10 text-center text-sm text-muted-foreground">
              {vendors.length === 0 ? "No vendors added yet. Click 'Add Vendor' to get started." : "No vendors match your search."}
            </div>
          )}
          {!isLoading && filtered.length > 0 && (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <DataTH>Vendor</DataTH>
                  <DataTH>Contact</DataTH>
                  <DataTH>Email</DataTH>
                  <DataTH>WhatsApp</DataTH>
                  <DataTH>Status</DataTH>
                  <DataTH>Notes</DataTH>
                  <DataTH align="right">Actions</DataTH>
                </tr>
              </thead>
              <tbody className="divide-y">
                {paginated.map(v => (
                  <DataTR key={v.id} data-testid={`row-vendor-${v.id}`}>
                    <DataTD>
                      <div className="flex items-center gap-2">
                        <CompanyCell name={v.name} subtitle={v.is_default ? "DEFAULT" : undefined} size="sm" />
                      </div>
                    </DataTD>
                    <DataTD>{v.contact_name ? <PersonCell name={v.contact_name} size="sm" /> : <span className="text-muted-foreground">—</span>}</DataTD>
                    <DataTD>
                      {v.email ? (
                        <a href={`mailto:${v.email}`} className="text-primary hover:underline flex items-center gap-1" data-testid={`link-email-${v.id}`}>
                          <Mail size={12} /> {v.email}
                        </a>
                      ) : <span className="text-muted-foreground">—</span>}
                    </DataTD>
                    <DataTD>
                      {v.whatsapp ? (
                        <a
                          href={`https://wa.me/${v.whatsapp.replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-[#25D366] hover:underline"
                          data-testid={`link-whatsapp-${v.id}`}
                        >
                          <SiWhatsapp size={13} /> {v.whatsapp}
                        </a>
                      ) : <span className="text-muted-foreground">—</span>}
                    </DataTD>
                    <DataTD>
                      <Badge variant="outline" className={v.is_default ? "border-amber-200 text-amber-700 bg-amber-50" : ""}>
                        {v.is_default ? "Default" : "Active"}
                      </Badge>
                    </DataTD>
                    <DataTD>
                      <p className="text-muted-foreground max-w-xs truncate">{v.notes ?? "—"}</p>
                    </DataTD>
                    <DataTD align="right">
                      <div className="flex items-center justify-end gap-1">
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => openEdit(v)} data-testid={`btn-edit-vendor-${v.id}`}>
                          <Pencil size={13} />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-500 hover:text-red-600" onClick={() => setDeleteId(v.id)} data-testid={`btn-delete-vendor-${v.id}`}>
                          <Trash2 size={13} />
                        </Button>
                      </div>
                    </DataTD>
                  </DataTR>
                ))}
              </tbody>
            </table>
          )}
        </DataTableContainer>
      </Fade>

      {filtered.length > PAGE_SIZE && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)} of {filtered.length}
          </p>
          <div className="flex items-center gap-1">
            <Button size="sm" variant="outline" className="h-8" disabled={safePage <= 1} onClick={() => setCurrentPage(p => p - 1)} data-testid="btn-prev-page">
              Previous
            </Button>
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
            <Button size="sm" variant="outline" className="h-8" disabled={safePage >= totalPages} onClick={() => setCurrentPage(p => p + 1)} data-testid="btn-next-page">
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Add/Edit modal */}
      <DetailModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? "Edit Vendor" : "Add Vendor"}
        subtitle="Supplier contact details for quotation workflow"
        footer={
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button onClick={() => saveMutation.mutate()} style={{ background: FAIRE_COLOR }} className="text-white" disabled={saveMutation.isPending} data-testid="btn-save-vendor">
              {saveMutation.isPending ? "Saving…" : editing ? "Save Changes" : "Add Vendor"}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <Label>Vendor / Company Name *</Label>
            <Input value={fName} onChange={e => setFName(e.target.value)} placeholder="e.g. Suprans Lifestyle" data-testid="input-vendor-name" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Contact Person</Label>
              <Input value={fContact} onChange={e => setFContact(e.target.value)} placeholder="e.g. Rajesh Kumar" data-testid="input-vendor-contact" />
            </div>
            <div>
              <Label>WhatsApp Number</Label>
              <Input value={fWhatsapp} onChange={e => setFWhatsapp(e.target.value)} placeholder="+91 98765 43210" data-testid="input-vendor-whatsapp" />
            </div>
          </div>
          <div>
            <Label>Email</Label>
            <Input type="email" value={fEmail} onChange={e => setFEmail(e.target.value)} placeholder="vendor@example.com" data-testid="input-vendor-email" />
          </div>
          <div>
            <Label>Notes</Label>
            <Input value={fNotes} onChange={e => setFNotes(e.target.value)} placeholder="e.g. Specializes in pet toys, lead time 5 days" data-testid="input-vendor-notes" />
          </div>
          <label className="flex items-center gap-2 cursor-pointer select-none" data-testid="checkbox-vendor-default">
            <input type="checkbox" checked={fDefault} onChange={e => setFDefault(e.target.checked)} className="w-4 h-4 rounded" />
            <span className="text-sm font-medium">Set as default vendor for auto-quotation</span>
          </label>
        </div>
      </DetailModal>

      {/* Delete confirmation */}
      <DetailModal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Delete Vendor"
        subtitle="This action cannot be undone."
        footer={
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteId && deleteMutation.mutate(deleteId)} disabled={deleteMutation.isPending} data-testid="btn-confirm-delete-vendor">
              {deleteMutation.isPending ? "Deleting…" : "Delete Vendor"}
            </Button>
          </div>
        }
      >
        <p className="text-sm text-muted-foreground">
          Are you sure you want to delete <span className="font-medium text-foreground">{vendors.find(v => v.id === deleteId)?.name}</span>? Any product assignments linked to this vendor will also be removed.
        </p>
      </DetailModal>
    </PageShell>
  );
}
