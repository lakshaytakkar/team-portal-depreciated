import { useState } from "react";
import { useStore } from "@/lib/store";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, DollarSign, Calendar, GripVertical, Pencil, Trash2 } from "lucide-react";
import { format } from "date-fns";
import type { Deal, Contact, User } from "@shared/schema";

const STAGES = [
  { id: "discovery", label: "Discovery", color: "bg-blue-500" },
  { id: "proposal", label: "Proposal", color: "bg-yellow-500" },
  { id: "negotiation", label: "Negotiation", color: "bg-orange-500" },
  { id: "closed_won", label: "Closed Won", color: "bg-green-500" },
  { id: "closed_lost", label: "Closed Lost", color: "bg-red-500" },
];

interface DealFormData {
  name: string;
  contactId: string | null;
  value: number;
  stage: string;
  expectedCloseDate: string | null;
  assignedTo: string | null;
  notes: string;
}

function DealForm({ deal, contacts, users, onSave, onCancel }: {
  deal?: Deal;
  contacts: Contact[];
  users: User[];
  onSave: (data: DealFormData) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    name: deal?.name || "",
    contactId: deal?.contactId || "",
    value: deal?.value || 0,
    stage: deal?.stage || "discovery",
    expectedCloseDate: deal?.expectedCloseDate ? format(new Date(deal.expectedCloseDate), "yyyy-MM-dd") : "",
    assignedTo: deal?.assignedTo || "",
    notes: deal?.notes || "",
  });

  return (
    <div className="grid gap-4 py-4">
      <div className="space-y-2">
        <Label>Deal Name *</Label>
        <Input data-testid="input-deal-name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Value (INR)</Label>
          <Input data-testid="input-deal-value" type="number" value={form.value} onChange={e => setForm(f => ({ ...f, value: parseInt(e.target.value) || 0 }))} />
        </div>
        <div className="space-y-2">
          <Label>Stage</Label>
          <Select value={form.stage} onValueChange={v => setForm(f => ({ ...f, stage: v }))}>
            <SelectTrigger data-testid="select-deal-stage"><SelectValue /></SelectTrigger>
            <SelectContent>
              {STAGES.map(s => <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Contact</Label>
          <Select value={form.contactId} onValueChange={v => setForm(f => ({ ...f, contactId: v }))}>
            <SelectTrigger data-testid="select-deal-contact"><SelectValue placeholder="Select contact" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No contact</SelectItem>
              {contacts.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Expected Close Date</Label>
          <Input data-testid="input-deal-close-date" type="date" value={form.expectedCloseDate} onChange={e => setForm(f => ({ ...f, expectedCloseDate: e.target.value }))} />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Assigned To</Label>
        <Select value={form.assignedTo} onValueChange={v => setForm(f => ({ ...f, assignedTo: v }))}>
          <SelectTrigger data-testid="select-deal-assigned"><SelectValue placeholder="Select user" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Unassigned</SelectItem>
            {users.map(u => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Notes</Label>
        <Textarea data-testid="input-deal-notes" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={3} />
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel} data-testid="button-cancel">Cancel</Button>
        <Button onClick={() => {
          const payload = { ...form, contactId: form.contactId === "none" ? null : form.contactId || null, assignedTo: form.assignedTo === "none" ? null : form.assignedTo || null, expectedCloseDate: form.expectedCloseDate ? new Date(form.expectedCloseDate).toISOString() : null };
          onSave(payload);
        }} disabled={!form.name} data-testid="button-save-deal">
          {deal ? "Update" : "Create"} Deal
        </Button>
      </DialogFooter>
    </div>
  );
}

export default function DealsPage() {
  const { currentTeamId } = useStore();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | undefined>();
  const [viewMode, setViewMode] = useState<"pipeline" | "list">("pipeline");

  const dealsUrl = currentTeamId ? `/api/deals?team_id=${currentTeamId}` : "/api/deals";
  const { data: deals = [], isLoading } = useQuery<Deal[]>({ queryKey: [dealsUrl] });
  const { data: contacts = [] } = useQuery<Contact[]>({ queryKey: ["/api/contacts"] });
  const { data: users = [] } = useQuery<User[]>({ queryKey: ["/api/users"] });

  const createMutation = useMutation({
    mutationFn: (data: DealFormData) => apiRequest("POST", "/api/deals", { ...data, teamId: currentTeamId }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/deals"] }); setDialogOpen(false); toast({ title: "Deal created" }); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<DealFormData> }) => apiRequest("PATCH", `/api/deals/${id}`, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/deals"] }); setDialogOpen(false); setEditingDeal(undefined); toast({ title: "Deal updated" }); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/deals/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/deals"] }); toast({ title: "Deal deleted" }); },
  });

  const totalValue = deals.reduce((sum, d) => sum + (d.value || 0), 0);

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-page-title">Deals</h1>
          <p className="text-muted-foreground">{deals.length} deals - Total Value: {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(totalValue)}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex border rounded-md">
            <Button variant={viewMode === "pipeline" ? "default" : "ghost"} size="sm" onClick={() => setViewMode("pipeline")} data-testid="button-view-pipeline">Pipeline</Button>
            <Button variant={viewMode === "list" ? "default" : "ghost"} size="sm" onClick={() => setViewMode("list")} data-testid="button-view-list">List</Button>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) setEditingDeal(undefined); }}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-deal"><Plus className="h-4 w-4 mr-2" /> Add Deal</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader><DialogTitle>{editingDeal ? "Edit Deal" : "New Deal"}</DialogTitle></DialogHeader>
              <DealForm deal={editingDeal} contacts={contacts} users={users} onSave={(data) => { editingDeal ? updateMutation.mutate({ id: editingDeal.id, data }) : createMutation.mutate(data); }} onCancel={() => { setDialogOpen(false); setEditingDeal(undefined); }} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {viewMode === "pipeline" ? (
        <div className="grid grid-cols-5 gap-4">
          {STAGES.map(stage => {
            const stageDeals = deals.filter(d => d.stage === stage.id);
            const stageValue = stageDeals.reduce((sum, d) => sum + (d.value || 0), 0);
            return (
              <div key={stage.id} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${stage.color}`} />
                    <h3 className="font-semibold text-sm">{stage.label}</h3>
                  </div>
                  <Badge variant="secondary">{stageDeals.length}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(stageValue)}</p>
                <div className="space-y-2">
                  {stageDeals.map(deal => (
                    <Card key={deal.id} className="cursor-pointer hover:shadow-md transition-shadow" data-testid={`card-deal-${deal.id}`} onClick={() => { setEditingDeal(deal); setDialogOpen(true); }}>
                      <CardContent className="p-3 space-y-2">
                        <p className="font-medium text-sm" data-testid={`text-deal-name-${deal.id}`}>{deal.name}</p>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <DollarSign className="h-3 w-3" />
                          {new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(deal.value || 0)}
                        </div>
                        {deal.expectedCloseDate && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(deal.expectedCloseDate), "MMM d, yyyy")}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 text-sm font-medium">Name</th>
                  <th className="text-left p-3 text-sm font-medium">Value</th>
                  <th className="text-left p-3 text-sm font-medium">Stage</th>
                  <th className="text-left p-3 text-sm font-medium">Close Date</th>
                  <th className="text-left p-3 text-sm font-medium w-[100px]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {deals.map(deal => (
                  <tr key={deal.id} className="border-b last:border-0" data-testid={`row-deal-${deal.id}`}>
                    <td className="p-3 font-medium">{deal.name}</td>
                    <td className="p-3">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(deal.value || 0)}</td>
                    <td className="p-3"><Badge variant="secondary">{STAGES.find(s => s.id === deal.stage)?.label || deal.stage}</Badge></td>
                    <td className="p-3 text-sm">{deal.expectedCloseDate ? format(new Date(deal.expectedCloseDate), "MMM d, yyyy") : "-"}</td>
                    <td className="p-3">
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => { setEditingDeal(deal); setDialogOpen(true); }} data-testid={`button-edit-deal-${deal.id}`}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => { if (confirm("Delete?")) deleteMutation.mutate(deal.id); }} data-testid={`button-delete-deal-${deal.id}`}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
