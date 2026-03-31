import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  ArrowLeft, Mail, Phone, Globe, Building2, Hash, CreditCard,
  FileText, Key, CheckCircle2, Circle, Shield, ExternalLink,
  Plus, Copy, Eye, EyeOff, Pencil, Save, X,
} from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/ds/status-badge";
import { PageTransition } from "@/components/ui/animated";
import { PageShell } from "@/components/layout";
import { FormDialog } from "@/components/ds/form-dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { DocumentManager } from "@/components/legalnations/document-manager";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const LLC_STAGES = [
  "LLC Booked", "Onboarded", "LLC Under Formation", "Under EIN",
  "Under Website Formation", "EIN received", "Received EIN Letter",
  "Under BOI", "Under Banking", "Under Payment Gateway",
  "Ready to Deliver", "Delivered",
];

const statusVariantMap: Record<string, "success" | "error" | "warning" | "neutral" | "info"> = {
  "LLC Booked": "neutral", "Onboarded": "info", "LLC Under Formation": "info",
  "Under EIN": "warning", "Under Website Formation": "warning", "EIN received": "info",
  "Received EIN Letter": "info", "Under BOI": "warning", "Under Banking": "warning",
  "Under Payment Gateway": "warning", "Ready to Deliver": "info",
  "Delivered": "success", "Refunded": "error",
};

const phaseLabels: Record<string, string> = {
  onboarding: "Onboarding Process",
  legal: "Legal Process",
  bank: "Bank Process",
};

const phaseColors: Record<string, string> = {
  onboarding: "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800",
  legal: "bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800",
  bank: "bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800",
};

export default function ClientDetailPage() {
  const [, params] = useRoute("/legalnations/clients/:id");
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const clientId = params?.id;

  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState<any>({});
  const [credDialogOpen, setCredDialogOpen] = useState(false);
  const [newCred, setNewCred] = useState({ service_name: "", category: "", access_url: "", user_id: "", password: "" });
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});

  const { data, isLoading } = useQuery<{
    client: any;
    checklist: any[];
    documents: any[];
    credentials: any[];
  }>({
    queryKey: ["/api/legalnations/clients", clientId],
    enabled: !!clientId,
  });

  const updateMutation = useMutation({
    mutationFn: async (updates: any) => {
      const res = await apiRequest("PATCH", `/api/legalnations/clients/${clientId}`, updates);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/legalnations/clients", clientId] });
      setEditing(false);
      toast({ title: "Client updated" });
    },
  });

  const checklistMutation = useMutation({
    mutationFn: async ({ id, is_completed }: { id: string; is_completed: boolean }) => {
      const res = await apiRequest("PATCH", `/api/legalnations/checklist/${id}`, { is_completed });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/legalnations/clients", clientId] });
    },
  });

  const addCredMutation = useMutation({
    mutationFn: async (cred: any) => {
      const res = await apiRequest("POST", `/api/legalnations/clients/${clientId}/credentials`, cred);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/legalnations/clients", clientId] });
      setCredDialogOpen(false);
      setNewCred({ service_name: "", category: "", access_url: "", user_id: "", password: "" });
      toast({ title: "Credential added" });
    },
  });

  const deleteCredMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("DELETE", `/api/legalnations/credentials/${id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/legalnations/clients", clientId] });
      toast({ title: "Credential removed" });
    },
  });

  if (isLoading || !data) {
    return (
      <PageShell>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-64" />
          <div className="h-48 bg-muted rounded" />
          <div className="h-96 bg-muted rounded" />
        </div>
      </PageShell>
    );
  }

  const { client, checklist, documents, credentials } = data;
  if (!client) {
    return (
      <PageShell>
        <div className="text-center py-20">
          <h2 className="text-xl font-semibold">Client not found</h2>
          <Button className="mt-4" onClick={() => navigate("/legalnations/clients")}>Back to Clients</Button>
        </div>
      </PageShell>
    );
  }

  const currentStageIdx = LLC_STAGES.indexOf(client.llc_status);
  const progressPercent = client.llc_status === "Delivered" ? 100 :
    client.llc_status === "Refunded" ? 0 :
    currentStageIdx < 0 ? 0 :
    Math.round(((currentStageIdx + 1) / LLC_STAGES.length) * 100);

  const groupedChecklist = checklist.reduce((acc: Record<string, any[]>, item: any) => {
    const key = (item.phase || "").toLowerCase();
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  const startEditing = () => {
    setEditing(true);
    setEditData({ ...client });
  };

  const saveEdits = () => {
    updateMutation.mutate(editData);
  };

  const formatCurrency = (val: number) => val ? `₹${val.toLocaleString("en-IN")}` : "—";

  return (
    <PageShell>
      <PageTransition>
        <div className="space-y-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate("/legalnations/clients")} data-testid="btn-back">
                <ArrowLeft className="size-4" />
              </Button>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold" data-testid="text-client-name">{client.client_name}</h1>
                  <StatusBadge status={client.llc_status} variant={statusVariantMap[client.llc_status] || "neutral"} />
                </div>
                <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                  <span className="font-mono">{client.client_code}</span>
                  {client.llc_name && <span data-testid="text-llc-name">{client.llc_name}</span>}
                  {client.plan && <span data-testid="text-plan">{client.plan}</span>}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {client.contact_number && (
                <a href={`https://wa.me/${client.contact_number.replace(/\D/g, "")}`} target="_blank" rel="noreferrer">
                  <Button variant="outline" size="sm" className="text-green-600 border-green-200" data-testid="btn-whatsapp">
                    <SiWhatsapp className="size-4 mr-1.5" /> WhatsApp
                  </Button>
                </a>
              )}
              {client.email && (
                <a href={`mailto:${client.email}`}>
                  <Button variant="outline" size="sm" data-testid="btn-email">
                    <Mail className="size-4 mr-1.5" /> Email
                  </Button>
                </a>
              )}
              {client.contact_number && (
                <a href={`tel:${client.contact_number}`}>
                  <Button variant="outline" size="sm" data-testid="btn-call">
                    <Phone className="size-4 mr-1.5" /> Call
                  </Button>
                </a>
              )}
            </div>
          </div>

          <Card>
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Formation Progress</span>
                <span className="text-sm text-muted-foreground">{progressPercent}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2 mb-3">
                <div
                  className="bg-primary rounded-full h-2 transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="flex gap-1 overflow-x-auto pb-1">
                {LLC_STAGES.map((stage, idx) => {
                  const isCompleted = idx < currentStageIdx || client.llc_status === "Delivered";
                  const isCurrent = idx === currentStageIdx && client.llc_status !== "Delivered";
                  return (
                    <div
                      key={stage}
                      className={`flex-1 min-w-0 text-center px-1 py-1 rounded text-[10px] font-medium truncate ${
                        isCompleted ? "bg-primary/10 text-primary" :
                        isCurrent ? "bg-primary text-primary-foreground" :
                        "bg-muted text-muted-foreground"
                      }`}
                      title={stage}
                      data-testid={`stage-${idx}`}
                    >
                      {stage}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="overview" data-testid="client-tabs">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
              <TabsTrigger value="onboarding" data-testid="tab-onboarding">Onboarding</TabsTrigger>
              <TabsTrigger value="documents" data-testid="tab-documents">Documents</TabsTrigger>
              <TabsTrigger value="credentials" data-testid="tab-credentials">Credentials</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4 mt-4">
              <div className="flex justify-end">
                {editing ? (
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setEditing(false)} data-testid="btn-cancel-edit">
                      <X className="size-3.5 mr-1" /> Cancel
                    </Button>
                    <Button size="sm" onClick={saveEdits} disabled={updateMutation.isPending} data-testid="btn-save-edit">
                      <Save className="size-3.5 mr-1" /> Save
                    </Button>
                  </div>
                ) : (
                  <Button size="sm" variant="outline" onClick={startEditing} data-testid="btn-edit-client">
                    <Pencil className="size-3.5 mr-1" /> Edit
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Client Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <InfoRow icon={<Hash className="size-3.5" />} label="Client ID" value={client.client_code} />
                    <InfoRow icon={<Mail className="size-3.5" />} label="Email" value={editing ? (
                      <Input value={editData.email || ""} onChange={(e) => setEditData({...editData, email: e.target.value})} className="h-7 text-sm" />
                    ) : client.email} />
                    <InfoRow icon={<Phone className="size-3.5" />} label="Contact" value={editing ? (
                      <Input value={editData.contact_number || ""} onChange={(e) => setEditData({...editData, contact_number: e.target.value})} className="h-7 text-sm" />
                    ) : client.contact_number} />
                    <InfoRow icon={<Globe className="size-3.5" />} label="Country" value={editing ? (
                      <Input value={editData.country || ""} onChange={(e) => setEditData({...editData, country: e.target.value})} className="h-7 text-sm" />
                    ) : client.country} />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">LLC Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <InfoRow icon={<Building2 className="size-3.5" />} label="LLC Name" value={editing ? (
                      <Input value={editData.llc_name || ""} onChange={(e) => setEditData({...editData, llc_name: e.target.value})} className="h-7 text-sm" />
                    ) : client.llc_name} />
                    <InfoRow icon={<Mail className="size-3.5" />} label="LLC Email" value={editing ? (
                      <Input value={editData.llc_email || ""} onChange={(e) => setEditData({...editData, llc_email: e.target.value})} className="h-7 text-sm" />
                    ) : client.llc_email} />
                    <InfoRow icon={<Hash className="size-3.5" />} label="EIN" value={editing ? (
                      <Input value={editData.ein || ""} onChange={(e) => setEditData({...editData, ein: e.target.value})} className="h-7 text-sm" />
                    ) : client.ein} />
                    <InfoRow icon={<Globe className="size-3.5" />} label="Website" value={editing ? (
                      <Input value={editData.website_url || ""} onChange={(e) => setEditData({...editData, website_url: e.target.value})} className="h-7 text-sm" />
                    ) : client.website_url ? (
                      <a href={client.website_url} target="_blank" rel="noreferrer" className="text-primary hover:underline flex items-center gap-1">
                        {client.website_url} <ExternalLink className="size-3" />
                      </a>
                    ) : null} />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Banking & Finance</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <InfoRow icon={<CreditCard className="size-3.5" />} label="Bank" value={editing ? (
                      <Input value={editData.bank_name || ""} onChange={(e) => setEditData({...editData, bank_name: e.target.value})} className="h-7 text-sm" />
                    ) : client.bank_name} />
                    <InfoRow icon={<Hash className="size-3.5" />} label="Account #" value={editing ? (
                      <Input value={editData.bank_account_number || ""} onChange={(e) => setEditData({...editData, bank_account_number: e.target.value})} className="h-7 text-sm" />
                    ) : client.bank_account_number} />
                    <InfoRow icon={<Hash className="size-3.5" />} label="Routing #" value={editing ? (
                      <Input value={editData.bank_routing_number || ""} onChange={(e) => setEditData({...editData, bank_routing_number: e.target.value})} className="h-7 text-sm" />
                    ) : client.bank_routing_number} />
                    <InfoRow label="Amount Received" value={formatCurrency(client.amount_received)} />
                    {client.remaining_payment > 0 && (
                      <InfoRow label="Remaining" value={<span className="text-orange-600 font-medium">{formatCurrency(client.remaining_payment)}</span>} />
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Dates</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <InfoRow label="Payment Date" value={client.date_of_payment} />
                    <InfoRow label="Onboarding Date" value={client.date_of_onboarding} />
                    <InfoRow label="Onboarding Call" value={client.date_of_onboarding_call} />
                    <InfoRow label="Doc Submission" value={client.date_of_document_submission} />
                    <InfoRow label="Closing Date" value={client.date_of_closing} />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Address & Notes</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <InfoRow label="LLC Address" value={editing ? (
                      <Input value={editData.llc_address || ""} onChange={(e) => setEditData({...editData, llc_address: e.target.value})} className="h-7 text-sm" />
                    ) : client.llc_address} />
                    {editing ? (
                      <div>
                        <Label className="text-xs text-muted-foreground">Notes</Label>
                        <Textarea
                          value={editData.notes || ""}
                          onChange={(e) => setEditData({...editData, notes: e.target.value})}
                          className="text-sm mt-1"
                          rows={3}
                        />
                      </div>
                    ) : client.notes ? (
                      <div>
                        <span className="text-xs text-muted-foreground">Notes</span>
                        <p className="text-sm mt-0.5">{client.notes}</p>
                      </div>
                    ) : null}
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Update Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <Select
                      value={client.llc_status}
                      onValueChange={(val) => updateMutation.mutate({ llc_status: val })}
                    >
                      <SelectTrigger className="w-64" data-testid="select-status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[...LLC_STAGES, "Refunded"].map((s) => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {client.client_health && (
                      <Select
                        value={client.client_health}
                        onValueChange={(val) => updateMutation.mutate({ client_health: val })}
                      >
                        <SelectTrigger className="w-40" data-testid="select-health">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {["Healthy", "Neutral", "At Risk", "Critical"].map((h) => (
                            <SelectItem key={h} value={h}>{h}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="onboarding" className="space-y-4 mt-4">
              {(["onboarding", "legal", "bank"] as const).map((phase) => {
                const items = groupedChecklist[phase] || [];
                const completed = items.filter((i: any) => i.is_completed).length;
                const total = items.length;
                const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

                return (
                  <Card key={phase} className={`border ${phaseColors[phase]}`}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base font-semibold">{phaseLabels[phase]}</CardTitle>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">{completed}/{total}</span>
                          <div className="w-24 bg-muted rounded-full h-1.5">
                            <div
                              className={`rounded-full h-1.5 transition-all ${pct === 100 ? "bg-green-500" : "bg-primary"}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-1">
                        {items.sort((a: any, b: any) => a.sort_order - b.sort_order).map((item: any) => (
                          <div
                            key={item.id}
                            className="flex items-center gap-3 py-2 px-3 rounded-md hover:bg-background/60 cursor-pointer"
                            onClick={() => checklistMutation.mutate({ id: item.id, is_completed: !item.is_completed })}
                            data-testid={`checklist-${item.id}`}
                          >
                            {item.is_completed ? (
                              <CheckCircle2 className="size-4 text-green-600 shrink-0" />
                            ) : (
                              <Circle className="size-4 text-muted-foreground shrink-0" />
                            )}
                            <span className={`text-sm flex-1 ${item.is_completed ? "line-through text-muted-foreground" : ""}`}>
                              {item.step_name}
                            </span>
                            {item.is_completed && item.completed_at && (
                              <span className="text-xs text-muted-foreground">
                                {new Date(item.completed_at).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </TabsContent>

            <TabsContent value="documents" className="mt-4">
              <DocumentManager clientId={client.id} />
            </TabsContent>

            <TabsContent value="credentials" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">External App Credentials</CardTitle>
                    <Button size="sm" onClick={() => setCredDialogOpen(true)} data-testid="btn-add-credential">
                      <Plus className="size-3.5 mr-1" /> Add Credential
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {credentials.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Key className="size-10 mx-auto mb-3 opacity-40" />
                      <p className="text-sm">No credentials stored</p>
                      <p className="text-xs mt-1">Add Gmail, Stripe, Mercury Bank, Payoneer, or Wise credentials</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {credentials.map((cred: any) => (
                        <div key={cred.id} className="border rounded-lg p-4" data-testid={`credential-${cred.id}`}>
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <Shield className="size-4 text-primary" />
                              <span className="font-medium text-sm">{cred.service_name}</span>
                              {cred.category && (
                                <span className="text-xs px-2 py-0.5 bg-muted rounded-full">{cred.category}</span>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive"
                              onClick={() => deleteCredMutation.mutate(cred.id)}
                              data-testid={`btn-delete-cred-${cred.id}`}
                            >
                              <X className="size-3.5" />
                            </Button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                            {cred.access_url && (
                              <div>
                                <span className="text-xs text-muted-foreground block">Access Link</span>
                                <a href={cred.access_url} target="_blank" rel="noreferrer" className="text-primary hover:underline flex items-center gap-1">
                                  Open <ExternalLink className="size-3" />
                                </a>
                              </div>
                            )}
                            {cred.user_id && (
                              <div>
                                <span className="text-xs text-muted-foreground block">User ID</span>
                                <div className="flex items-center gap-1">
                                  <span>{cred.user_id}</span>
                                  <Button variant="ghost" size="icon" className="size-5" onClick={() => { navigator.clipboard.writeText(cred.user_id); toast({ title: "Copied" }); }}>
                                    <Copy className="size-3" />
                                  </Button>
                                </div>
                              </div>
                            )}
                            {cred.password && (
                              <div>
                                <span className="text-xs text-muted-foreground block">Password</span>
                                <div className="flex items-center gap-1">
                                  <span className="font-mono text-xs">
                                    {showPasswords[cred.id] ? cred.password : "••••••••"}
                                  </span>
                                  <Button variant="ghost" size="icon" className="size-5" onClick={() => setShowPasswords(p => ({...p, [cred.id]: !p[cred.id]}))}>
                                    {showPasswords[cred.id] ? <EyeOff className="size-3" /> : <Eye className="size-3" />}
                                  </Button>
                                  <Button variant="ghost" size="icon" className="size-5" onClick={() => { navigator.clipboard.writeText(cred.password); toast({ title: "Copied" }); }}>
                                    <Copy className="size-3" />
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <FormDialog
                open={credDialogOpen}
                onOpenChange={setCredDialogOpen}
                title="Add Credential"
                onSubmit={() => addCredMutation.mutate(newCred)}
                submitLabel="Save Credential"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <Label>Service Name</Label>
                    <Select value={newCred.service_name} onValueChange={(v) => setNewCred({...newCred, service_name: v, category: v === "Gmail" ? "Email" : v === "Stripe" ? "Payment Gateway" : "Bank Account"})}>
                      <SelectTrigger data-testid="select-service">
                        <SelectValue placeholder="Select service" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Gmail">Gmail</SelectItem>
                        <SelectItem value="Stripe">Stripe</SelectItem>
                        <SelectItem value="Mercury Bank">Mercury Bank</SelectItem>
                        <SelectItem value="Payoneer Bank">Payoneer Bank</SelectItem>
                        <SelectItem value="Wise Bank">Wise Bank</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label>Category</Label>
                    <Input value={newCred.category} onChange={(e) => setNewCred({...newCred, category: e.target.value})} placeholder="Email / Bank / Payment Gateway" data-testid="input-category" />
                  </div>
                  <div className="flex flex-col gap-1.5 col-span-2">
                    <Label>Access URL</Label>
                    <Input value={newCred.access_url} onChange={(e) => setNewCred({...newCred, access_url: e.target.value})} placeholder="https://..." data-testid="input-access-url" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label>User ID / Email</Label>
                    <Input value={newCred.user_id} onChange={(e) => setNewCred({...newCred, user_id: e.target.value})} placeholder="user@example.com" data-testid="input-user-id" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label>Password</Label>
                    <Input type="password" value={newCred.password} onChange={(e) => setNewCred({...newCred, password: e.target.value})} placeholder="••••••••" data-testid="input-password" />
                  </div>
                </div>
              </FormDialog>
            </TabsContent>
          </Tabs>
        </div>
      </PageTransition>
    </PageShell>
  );
}

function InfoRow({ icon, label, value }: { icon?: React.ReactNode; label: string; value: any }) {
  return (
    <div className="flex items-start gap-2">
      {icon && <span className="mt-0.5 text-muted-foreground">{icon}</span>}
      <div className="flex-1 min-w-0">
        <span className="text-xs text-muted-foreground block">{label}</span>
        <span className="text-sm">{value || "—"}</span>
      </div>
    </div>
  );
}
