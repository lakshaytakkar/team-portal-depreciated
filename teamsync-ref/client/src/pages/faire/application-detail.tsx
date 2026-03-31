import { useState } from "react";
import { useLocation, useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft, Pencil, ExternalLink, Trash2, Plus, Clock, Mail, Phone, FileText,
  CheckCircle2, AlertTriangle, XCircle, ClipboardList, Globe, Link2,
  ShoppingBag, Package, BookOpen, PlayCircle, Store,
} from "lucide-react";
import { CompanyCell } from "@/components/ui/avatar-cells";
import { Fade } from "@/components/ui/animated";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { PageShell, DetailModal } from "@/components/layout";
import { FAIRE_COLOR } from "@/lib/faire-config";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";


const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; icon: typeof Clock }> = {
  drafting:     { label: "Drafting",      bg: "bg-slate-100",  text: "text-slate-700",  icon: Clock },
  applied:      { label: "Applied",       bg: "bg-blue-100",   text: "text-blue-700",   icon: ClipboardList },
  pending_docs: { label: "Pending Docs",  bg: "bg-amber-100",  text: "text-amber-700",  icon: AlertTriangle },
  approved:     { label: "Approved",      bg: "bg-green-100",  text: "text-green-700",  icon: CheckCircle2 },
  rejected:     { label: "Rejected",      bg: "bg-red-100",    text: "text-red-700",    icon: XCircle },
};

const FOLLOWUP_TYPE_CONFIG: Record<string, { label: string; icon: typeof Clock; color: string }> = {
  email:         { label: "Email",          icon: Mail,          color: "#2563EB" },
  call:          { label: "Call",           icon: Phone,         color: "#7C3AED" },
  doc_submitted: { label: "Doc Submitted",  icon: FileText,      color: "#16A34A" },
  doc_requested: { label: "Doc Requested",  icon: AlertTriangle, color: "#D97706" },
  note:          { label: "Note",           icon: Pencil,        color: "#64748B" },
};

const LINK_TYPE_CONFIG: Record<string, { label: string; icon: typeof Link2 }> = {
  domain_purchase:    { label: "Domain Purchase",  icon: Globe },
  faire_registration: { label: "Faire Reg",        icon: Store },
  marketplace_store:  { label: "Marketplace",      icon: ShoppingBag },
  website:            { label: "Website",           icon: Globe },
  other:              { label: "Link",              icon: Link2 },
};

interface Followup {
  id: string;
  application_id: string;
  followup_date: string;
  followup_type: string;
  note: string | null;
  created_at: string | null;
}

interface AppLink {
  id: string;
  application_id: string;
  label: string;
  url: string;
  link_type: string;
  created_at: string | null;
}

interface ApplicationDetail {
  id: string;
  brand_name: string;
  category: string | null;
  brand_story: string | null;
  logo_url: string | null;
  banner_url: string | null;
  email_id: string | null;
  email_type: string | null;
  application_date: string | null;
  status: string;
  marketplace_strategy: string | null;
  domain_name: string | null;
  website_url: string | null;
  etsy_store_url: string | null;
  reference_store_url: string | null;
  num_products_listed: number | null;
  listing_method: string | null;
  csv_storage_path: string | null;
  ein_storage_path: string | null;
  articles_storage_path: string | null;
  faire_reg_url: string | null;
  notes: string | null;
  linked_store_id: string | null;
  created_at: string | null;
  updated_at: string | null;
  followups: Followup[];
  links: AppLink[];
}

function InlineField({
  label, value, onSave, type = "text", placeholder, multiline,
}: {
  label: string;
  value: string;
  onSave: (v: string) => void;
  type?: string;
  placeholder?: string;
  multiline?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  if (!editing) {
    return (
      <div className="group flex items-start gap-1.5">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
          <p
            className="text-sm text-foreground break-words cursor-pointer hover:text-primary group-hover:underline decoration-dotted"
            onClick={() => { setDraft(value); setEditing(true); }}
            data-testid={`field-${label.toLowerCase().replace(/\s+/g, "-")}`}
          >
            {value || <span className="text-muted-foreground italic">Click to edit…</span>}
          </p>
        </div>
        <button
          className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-muted transition-opacity shrink-0"
          onClick={() => { setDraft(value); setEditing(true); }}
        >
          <Pencil size={11} className="text-muted-foreground" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <p className="text-xs text-muted-foreground">{label}</p>
      {multiline ? (
        <Textarea
          value={draft}
          onChange={e => setDraft(e.target.value)}
          autoFocus
          rows={3}
          placeholder={placeholder}
        />
      ) : (
        <Input
          type={type}
          value={draft}
          onChange={e => setDraft(e.target.value)}
          autoFocus
          placeholder={placeholder}
        />
      )}
      <div className="flex gap-1.5">
        <Button size="sm" className="h-7 text-xs text-white" style={{ background: FAIRE_COLOR }}
          onClick={() => { onSave(draft); setEditing(false); }}>Save</Button>
        <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setEditing(false)}>Cancel</Button>
      </div>
    </div>
  );
}

export default function FaireApplicationDetail() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<{ application: ApplicationDetail }>({
    queryKey: ["/api/faire/applications", id],
    queryFn: async () => {
      const res = await fetch(`/api/faire/applications/${id}`, { headers: { "Cache-Control": "no-cache" } });
      if (!res.ok) throw new Error(`${res.status}`);
      return res.json();
    },
  });

  const app = data?.application;

  const patchMutation = useMutation({
    mutationFn: async (patch: Partial<ApplicationDetail>) => {
      if (!app) return;
      return apiRequest("PATCH", `/api/faire/applications/${id}`, { ...app, ...patch, followups: undefined, links: undefined });
    },
    onMutate: async (patchData: Partial<ApplicationDetail>) => {
      await queryClient.cancelQueries({ queryKey: ["/api/faire/applications", id] });
      const previous = queryClient.getQueryData<{ application: ApplicationDetail }>(["/api/faire/applications", id]);
      if (previous) {
        queryClient.setQueryData(["/api/faire/applications", id], {
          application: { ...previous.application, ...patchData },
        });
      }
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(["/api/faire/applications", id], context.previous);
      toast({ title: "Failed to save", variant: "destructive" });
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["/api/faire/applications", id] }),
  });

  const patch = (field: keyof ApplicationDetail, value: unknown) => {
    if (!app) return;
    patchMutation.mutate({ [field]: value } as Partial<ApplicationDetail>);
  };

  // Edit modal
  const [editOpen, setEditOpen] = useState(false);
  const [fBrandName, setFBrandName] = useState("");
  const [fCategory, setFCategory] = useState("");
  const [fBrandStory, setFBrandStory] = useState("");
  const [fEmailId, setFEmailId] = useState("");
  const [fEmailType, setFEmailType] = useState("basic");
  const [fStrategy, setFStrategy] = useState("website");
  const [fDomain, setFDomain] = useState("");
  const [fWebsite, setFWebsite] = useState("");
  const [fEtsy, setFEtsy] = useState("");
  const [fRefStore, setFRefStore] = useState("");
  const [fNumProducts, setFNumProducts] = useState("0");
  const [fListingMethod, setFListingMethod] = useState("manual");
  const [fAppDate, setFAppDate] = useState("");
  const [fFaireRegUrl, setFFaireRegUrl] = useState("");
  const [fNotes, setFNotes] = useState("");
  const [fLogoUrl, setFLogoUrl] = useState("");
  const [fBannerUrl, setFBannerUrl] = useState("");

  function openEdit() {
    if (!app) return;
    setFBrandName(app.brand_name ?? "");
    setFCategory(app.category ?? "");
    setFBrandStory(app.brand_story ?? "");
    setFEmailId(app.email_id ?? "");
    setFEmailType(app.email_type ?? "basic");
    setFStrategy(app.marketplace_strategy ?? "website");
    setFDomain(app.domain_name ?? "");
    setFWebsite(app.website_url ?? "");
    setFEtsy(app.etsy_store_url ?? "");
    setFRefStore(app.reference_store_url ?? "");
    setFNumProducts(String(app.num_products_listed ?? 0));
    setFListingMethod(app.listing_method ?? "manual");
    setFAppDate(app.application_date ?? "");
    setFFaireRegUrl(app.faire_reg_url ?? "");
    setFNotes(app.notes ?? "");
    setFLogoUrl(app.logo_url ?? "");
    setFBannerUrl(app.banner_url ?? "");
    setEditOpen(true);
  }

  const editMutation = useMutation({
    mutationFn: async () => {
      if (!app || !fBrandName.trim()) throw new Error("Brand name required");
      return apiRequest("PATCH", `/api/faire/applications/${id}`, {
        brand_name: fBrandName.trim(),
        category: fCategory.trim() || null,
        brand_story: fBrandStory.trim() || null,
        logo_url: fLogoUrl.trim() || null,
        banner_url: fBannerUrl.trim() || null,
        email_id: fEmailId.trim() || null,
        email_type: fEmailType,
        marketplace_strategy: fStrategy,
        domain_name: fDomain.trim() || null,
        website_url: fWebsite.trim() || null,
        etsy_store_url: fEtsy.trim() || null,
        reference_store_url: fRefStore.trim() || null,
        num_products_listed: parseInt(fNumProducts) || 0,
        listing_method: fListingMethod,
        application_date: fAppDate || null,
        faire_reg_url: fFaireRegUrl.trim() || "https://www.faire.com/brand-portal/signup",
        notes: fNotes.trim() || null,
        status: app.status,
        linked_store_id: app.linked_store_id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/faire/applications", id] });
      queryClient.invalidateQueries({ queryKey: ["/api/faire/applications"] });
      setEditOpen(false);
      toast({ title: "Application updated" });
    },
    onError: (e: any) => toast({ title: e.message, variant: "destructive" }),
  });

  // Status change
  const statusMutation = useMutation({
    mutationFn: async (newStatus: string) => {
      if (!app) return;
      return apiRequest("PATCH", `/api/faire/applications/${id}`, { ...app, status: newStatus, followups: undefined, links: undefined });
    },
    onMutate: async (newStatus: string) => {
      await queryClient.cancelQueries({ queryKey: ["/api/faire/applications", id] });
      const previous = queryClient.getQueryData<{ application: ApplicationDetail }>(["/api/faire/applications", id]);
      if (previous) {
        queryClient.setQueryData(["/api/faire/applications", id], {
          application: { ...previous.application, status: newStatus },
        });
      }
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(["/api/faire/applications", id], context.previous);
      toast({ title: "Failed to update status", variant: "destructive" });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/faire/applications", id] });
      queryClient.invalidateQueries({ queryKey: ["/api/faire/applications"] });
    },
    onSuccess: () => toast({ title: "Status updated" }),
  });

  // Delete application
  const [deleteOpen, setDeleteOpen] = useState(false);
  const deleteMutation = useMutation({
    mutationFn: async () => apiRequest("DELETE", `/api/faire/applications/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/faire/applications"] });
      toast({ title: "Application deleted" });
      setLocation("/faire/applications");
    },
    onError: () => toast({ title: "Failed to delete", variant: "destructive" }),
  });

  // Followup
  const [followupOpen, setFollowupOpen] = useState(false);
  const [fFollowupDate, setFFollowupDate] = useState(new Date().toISOString().split("T")[0]);
  const [fFollowupType, setFFollowupType] = useState("note");
  const [fFollowupNote, setFFollowupNote] = useState("");

  const addFollowupMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", `/api/faire/applications/${id}/followups`, {
        followup_date: fFollowupDate,
        followup_type: fFollowupType,
        note: fFollowupNote.trim() || null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/faire/applications", id] });
      setFollowupOpen(false);
      setFFollowupNote("");
      toast({ title: "Follow-up logged" });
    },
    onError: () => toast({ title: "Failed to add follow-up", variant: "destructive" }),
  });

  const deleteFollowupMutation = useMutation({
    mutationFn: async (fid: string) => apiRequest("DELETE", `/api/faire/applications/${id}/followups/${fid}`),
    onMutate: async (fid: string) => {
      await queryClient.cancelQueries({ queryKey: ["/api/faire/applications", id] });
      const previous = queryClient.getQueryData<{ application: ApplicationDetail }>(["/api/faire/applications", id]);
      if (previous) {
        queryClient.setQueryData(["/api/faire/applications", id], {
          application: {
            ...previous.application,
            followups: previous.application.followups.filter(f => f.id !== fid),
          },
        });
      }
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(["/api/faire/applications", id], context.previous);
      toast({ title: "Failed to delete follow-up", variant: "destructive" });
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["/api/faire/applications", id] }),
  });

  // Links
  const [linkOpen, setLinkOpen] = useState(false);
  const [fLinkLabel, setFLinkLabel] = useState("");
  const [fLinkUrl, setFLinkUrl] = useState("");
  const [fLinkType, setFLinkType] = useState("other");

  const addLinkMutation = useMutation({
    mutationFn: async () => {
      if (!fLinkLabel.trim() || !fLinkUrl.trim()) throw new Error("Label and URL are required");
      return apiRequest("POST", `/api/faire/applications/${id}/links`, {
        label: fLinkLabel.trim(),
        url: fLinkUrl.trim(),
        link_type: fLinkType,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/faire/applications", id] });
      setLinkOpen(false);
      setFLinkLabel(""); setFLinkUrl(""); setFLinkType("other");
      toast({ title: "Link added" });
    },
    onError: (e: any) => toast({ title: e.message, variant: "destructive" }),
  });

  const deleteLinkMutation = useMutation({
    mutationFn: async (lid: string) => apiRequest("DELETE", `/api/faire/applications/${id}/links/${lid}`),
    onMutate: async (lid: string) => {
      await queryClient.cancelQueries({ queryKey: ["/api/faire/applications", id] });
      const previous = queryClient.getQueryData<{ application: ApplicationDetail }>(["/api/faire/applications", id]);
      if (previous) {
        queryClient.setQueryData(["/api/faire/applications", id], {
          application: {
            ...previous.application,
            links: previous.application.links.filter(l => l.id !== lid),
          },
        });
      }
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(["/api/faire/applications", id], context.previous);
      toast({ title: "Failed to delete link", variant: "destructive" });
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["/api/faire/applications", id] }),
  });

  // Promote modal
  const [promoteOpen, setPromoteOpen] = useState(false);
  const promoteMutation = useMutation({
    mutationFn: async () => {
      if (!app) return;
      return apiRequest("PATCH", `/api/faire/applications/${id}`, { ...app, status: "approved", followups: undefined, links: undefined });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/faire/applications", id] });
      queryClient.invalidateQueries({ queryKey: ["/api/faire/applications"] });
      setPromoteOpen(false);
      toast({ title: "Application approved! Head to Stores to connect credentials." });
    },
    onError: () => toast({ title: "Failed to promote", variant: "destructive" }),
  });

  if (isLoading) {
    return (
      <PageShell>
        <div className="space-y-4 animate-pulse">
          <div className="h-10 bg-muted/40 rounded w-1/3" />
          <div className="h-48 bg-muted/30 rounded" />
        </div>
      </PageShell>
    );
  }

  if (!app) {
    return (
      <PageShell>
        <div className="p-12 text-center text-muted-foreground">Application not found.</div>
      </PageShell>
    );
  }

  const sc = STATUS_CONFIG[app.status] ?? STATUS_CONFIG.drafting;
  const StatusIcon = sc.icon;

  return (
    <PageShell>
      <Fade>
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-start gap-3">
            <Button variant="ghost" size="sm" onClick={() => setLocation("/faire/applications")} data-testid="btn-back">
              <ArrowLeft size={16} className="mr-1" /> Applications
            </Button>
            <div>
              <div className="flex items-center gap-2.5 mb-1">
                <CompanyCell name={app.brand_name} size="lg" />
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${sc.bg} ${sc.text}`}>
                  <StatusIcon size={11} /> {sc.label}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {app.category ? `${app.category} · ` : ""}Created {app.created_at ? new Date(app.created_at).toLocaleDateString() : "—"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            {/* Status actions */}
            {app.status !== "applied" && app.status !== "approved" && app.status !== "rejected" && (
              <Button size="sm" variant="outline" className="text-blue-700 border-blue-200 hover:bg-blue-50" onClick={() => statusMutation.mutate("applied")} data-testid="btn-mark-applied">
                Mark Applied
              </Button>
            )}
            {app.status === "applied" && (
              <Button size="sm" variant="outline" className="text-amber-700 border-amber-200 hover:bg-amber-50" onClick={() => statusMutation.mutate("pending_docs")} data-testid="btn-mark-pending-docs">
                Docs Requested
              </Button>
            )}
            {(app.status === "applied" || app.status === "pending_docs") && (
              <>
                <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => statusMutation.mutate("rejected")} data-testid="btn-mark-rejected">
                  Mark Rejected
                </Button>
                <Button size="sm" className="text-white" style={{ background: FAIRE_COLOR }} onClick={() => setPromoteOpen(true)} data-testid="btn-promote">
                  <CheckCircle2 size={13} className="mr-1" /> Mark Approved
                </Button>
              </>
            )}
            <Button size="sm" variant="outline" onClick={openEdit} data-testid="btn-edit-application">
              <Pencil size={13} className="mr-1" /> Edit
            </Button>
            <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-600" onClick={() => setDeleteOpen(true)} data-testid="btn-delete-application">
              <Trash2 size={13} />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left: Main Info */}
          <div className="lg:col-span-2 space-y-4">

            {/* Brand Identity */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <BookOpen size={14} style={{ color: FAIRE_COLOR }} /> Brand Identity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <InlineField label="Brand Name" value={app.brand_name} onSave={v => patch("brand_name", v)} placeholder="Brand name" />
                <InlineField label="Category" value={app.category ?? ""} onSave={v => patch("category", v || null)} placeholder="e.g. Home & Living" />
                <InlineField label="Brand Story" value={app.brand_story ?? ""} onSave={v => patch("brand_story", v || null)} placeholder="Write the brand story…" multiline />
                <InlineField label="Logo URL" value={app.logo_url ?? ""} onSave={v => patch("logo_url", v || null)} placeholder="https://…" />
                <InlineField label="Banner URL" value={app.banner_url ?? ""} onSave={v => patch("banner_url", v || null)} placeholder="https://…" />
              </CardContent>
            </Card>

            {/* Email & Contact */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Mail size={14} style={{ color: FAIRE_COLOR }} /> Email & Contact
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <InlineField label="Email ID" value={app.email_id ?? ""} onSave={v => patch("email_id", v || null)} placeholder="brand@domain.com" />
                <div>
                  <p className="text-xs text-muted-foreground mb-1.5">Email Type</p>
                  <div className="flex gap-2">
                    {["branded", "basic"].map(t => (
                      <button
                        key={t}
                        onClick={() => patch("email_type", t)}
                        className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${app.email_type === t ? "text-white border-transparent" : "bg-background border-border text-muted-foreground hover:bg-muted"}`}
                        style={app.email_type === t ? { background: FAIRE_COLOR } : {}}
                        data-testid={`btn-email-type-${t}`}
                      >
                        {t === "branded" ? "Branded (name@domain.com)" : "Basic (Gmail / Outlook)"}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Domain & Website */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Globe size={14} style={{ color: FAIRE_COLOR }} /> Domain & Website
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <InlineField label="Domain Name" value={app.domain_name ?? ""} onSave={v => patch("domain_name", v || null)} placeholder="brandname.com" />
                <div className="group flex items-start gap-1.5">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground mb-0.5">Website URL</p>
                    {app.website_url ? (
                      <a href={app.website_url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1" data-testid="link-website">
                        {app.website_url} <ExternalLink size={11} />
                      </a>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">Click to edit…</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Marketplace Strategy */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <ShoppingBag size={14} style={{ color: FAIRE_COLOR }} /> Marketplace Strategy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-1.5">Strategy</p>
                  <div className="flex gap-2">
                    {["website", "etsy", "both"].map(s => (
                      <button
                        key={s}
                        onClick={() => patch("marketplace_strategy", s)}
                        className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors capitalize ${app.marketplace_strategy === s ? "text-white border-transparent" : "bg-background border-border text-muted-foreground hover:bg-muted"}`}
                        style={app.marketplace_strategy === s ? { background: FAIRE_COLOR } : {}}
                        data-testid={`btn-strategy-${s}`}
                      >
                        {s === "website" ? "Website" : s === "etsy" ? "Etsy" : "Both"}
                      </button>
                    ))}
                  </div>
                </div>
                {(app.marketplace_strategy === "etsy" || app.marketplace_strategy === "both") && (
                  <InlineField label="Etsy Store URL" value={app.etsy_store_url ?? ""} onSave={v => patch("etsy_store_url", v || null)} placeholder="https://www.etsy.com/shop/…" />
                )}
              </CardContent>
            </Card>

            {/* Product Listings */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Package size={14} style={{ color: FAIRE_COLOR }} /> Product Listings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <InlineField label="Reference Store URL" value={app.reference_store_url ?? ""} onSave={v => patch("reference_store_url", v || null)} placeholder="Store used for product scraping" />
                <div className="grid grid-cols-2 gap-4">
                  <InlineField label="Number of Products Listed" value={String(app.num_products_listed ?? 0)} onSave={v => patch("num_products_listed", parseInt(v) || 0)} type="number" />
                  <div>
                    <p className="text-xs text-muted-foreground mb-1.5">Listing Method</p>
                    <div className="flex flex-wrap gap-1.5">
                      {["csv", "shopify_sync", "manual"].map(m => (
                        <button
                          key={m}
                          onClick={() => patch("listing_method", m)}
                          className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${app.listing_method === m ? "text-white border-transparent" : "bg-background border-border text-muted-foreground hover:bg-muted"}`}
                          style={app.listing_method === m ? { background: FAIRE_COLOR } : {}}
                          data-testid={`btn-listing-${m}`}
                        >
                          {m === "csv" ? "CSV" : m === "shopify_sync" ? "Shopify Sync" : "Manual"}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                {app.csv_storage_path && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <FileText size={13} /> CSV saved: <span>{app.csv_storage_path}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Legal Documents */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <FileText size={14} style={{ color: FAIRE_COLOR }} /> Legal Documents
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <InlineField label="EIN Document Path" value={app.ein_storage_path ?? ""} onSave={v => patch("ein_storage_path", v || null)} placeholder="Path or identifier for EIN file" />
                <InlineField label="Articles of Organization Path" value={app.articles_storage_path ?? ""} onSave={v => patch("articles_storage_path", v || null)} placeholder="Path or identifier for Articles file" />
              </CardContent>
            </Card>

            {/* Application Submission */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <ClipboardList size={14} style={{ color: FAIRE_COLOR }} /> Application Submission
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <InlineField label="Application Date" value={app.application_date ?? ""} onSave={v => patch("application_date", v || null)} type="date" />
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Faire Registration URL</p>
                  <div className="flex items-center gap-2">
                    <a
                      href={app.faire_reg_url ?? "https://www.faire.com/brand-portal/signup"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline flex items-center gap-1"
                      data-testid="link-faire-registration"
                    >
                      <ExternalLink size={12} /> Open Faire Registration
                    </a>
                  </div>
                </div>
                <InlineField label="Notes" value={app.notes ?? ""} onSave={v => patch("notes", v || null)} placeholder="Application notes, comments, special instructions…" multiline />
              </CardContent>
            </Card>
          </div>

          {/* Right: Followups + Links */}
          <div className="space-y-4">

            {/* Follow-up Timeline */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Clock size={14} style={{ color: FAIRE_COLOR }} /> Follow-up Timeline
                  </CardTitle>
                  <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setFollowupOpen(true)} data-testid="btn-add-followup">
                    <Plus size={12} className="mr-1" /> Add
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {app.followups.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-3 text-center">No follow-ups logged yet.</p>
                ) : (
                  <div className="space-y-3">
                    {app.followups.map((f) => {
                      const fc = FOLLOWUP_TYPE_CONFIG[f.followup_type] ?? FOLLOWUP_TYPE_CONFIG.note;
                      const FIcon = fc.icon;
                      return (
                        <div key={f.id} className="flex gap-2.5 group" data-testid={`followup-${f.id}`}>
                          <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: `${fc.color}18` }}>
                            <FIcon size={11} style={{ color: fc.color }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <span className="text-xs font-medium">{fc.label}</span>
                              <span className="text-xs text-muted-foreground">· {new Date(f.followup_date).toLocaleDateString()}</span>
                            </div>
                            {f.note && <p className="text-xs text-muted-foreground">{f.note}</p>}
                          </div>
                          <button
                            className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-red-500 transition-opacity shrink-0"
                            onClick={() => deleteFollowupMutation.mutate(f.id)}
                            data-testid={`btn-delete-followup-${f.id}`}
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Links */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Link2 size={14} style={{ color: FAIRE_COLOR }} /> Quick Links
                  </CardTitle>
                  <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setLinkOpen(true)} data-testid="btn-add-link">
                    <Plus size={12} className="mr-1" /> Add
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {app.links.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-3 text-center">No links saved yet.</p>
                ) : (
                  <div className="space-y-2">
                    {app.links.map(l => {
                      const lc = LINK_TYPE_CONFIG[l.link_type] ?? LINK_TYPE_CONFIG.other;
                      const LIcon = lc.icon;
                      return (
                        <div key={l.id} className="flex items-center gap-2 group" data-testid={`link-${l.id}`}>
                          <div className="w-6 h-6 rounded flex items-center justify-center bg-muted shrink-0">
                            <LIcon size={12} className="text-muted-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <a href={l.url} target="_blank" rel="noopener noreferrer" className="text-xs font-medium hover:underline text-primary flex items-center gap-1 truncate" data-testid={`link-url-${l.id}`}>
                              {l.label} <ExternalLink size={10} />
                            </a>
                            <p className="text-xs text-muted-foreground">{lc.label}</p>
                          </div>
                          <button
                            className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-red-500 transition-opacity shrink-0"
                            onClick={() => deleteLinkMutation.mutate(l.id)}
                            data-testid={`btn-delete-link-${l.id}`}
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Metadata */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-muted-foreground">Record Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span>Created</span>
                  <span>{app.created_at ? new Date(app.created_at).toLocaleDateString() : "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span>Last Updated</span>
                  <span>{app.updated_at ? new Date(app.updated_at).toLocaleDateString() : "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span>ID</span>
                  <span className="text-xs text-muted-foreground">{app.id.slice(0, 8)}…</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Fade>

      {/* Edit Full Modal */}
      <DetailModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit Application"
        subtitle={`Editing: ${app.brand_name}`}
        footer={
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={() => editMutation.mutate()} style={{ background: FAIRE_COLOR }} className="text-white" disabled={editMutation.isPending} data-testid="btn-save-edit">
              {editMutation.isPending ? "Saving…" : "Save Changes"}
            </Button>
          </div>
        }
      >
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Label>Brand Name *</Label>
              <Input value={fBrandName} onChange={e => setFBrandName(e.target.value)} data-testid="input-edit-brand-name" />
            </div>
            <div>
              <Label>Category</Label>
              <Input value={fCategory} onChange={e => setFCategory(e.target.value)} data-testid="input-edit-category" />
            </div>
            <div>
              <Label>Email ID</Label>
              <Input value={fEmailId} onChange={e => setFEmailId(e.target.value)} data-testid="input-edit-email" />
            </div>
            <div>
              <Label>Email Type</Label>
              <Select value={fEmailType} onValueChange={setFEmailType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="branded">Branded</SelectItem>
                  <SelectItem value="basic">Basic</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Strategy</Label>
              <Select value={fStrategy} onValueChange={setFStrategy}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="website">Website</SelectItem>
                  <SelectItem value="etsy">Etsy</SelectItem>
                  <SelectItem value="both">Both</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Domain</Label>
              <Input value={fDomain} onChange={e => setFDomain(e.target.value)} data-testid="input-edit-domain" />
            </div>
            <div>
              <Label>Website URL</Label>
              <Input value={fWebsite} onChange={e => setFWebsite(e.target.value)} data-testid="input-edit-website" />
            </div>
            {(fStrategy === "etsy" || fStrategy === "both") && (
              <div className="col-span-2">
                <Label>Etsy Store URL</Label>
                <Input value={fEtsy} onChange={e => setFEtsy(e.target.value)} data-testid="input-edit-etsy" />
              </div>
            )}
            <div>
              <Label>Reference Store URL</Label>
              <Input value={fRefStore} onChange={e => setFRefStore(e.target.value)} placeholder="Competitor store to model products from" data-testid="input-edit-ref-store" />
            </div>
            <div>
              <Label>No. of Products Listed</Label>
              <Input type="number" value={fNumProducts} onChange={e => setFNumProducts(e.target.value)} data-testid="input-edit-num-products" />
            </div>
            <div>
              <Label>Listing Method</Label>
              <Select value={fListingMethod} onValueChange={setFListingMethod}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV Upload</SelectItem>
                  <SelectItem value="shopify_sync">Shopify Sync</SelectItem>
                  <SelectItem value="manual">Manual</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Application Date</Label>
              <Input type="date" value={fAppDate} onChange={e => setFAppDate(e.target.value)} data-testid="input-edit-app-date" />
            </div>
            <div>
              <Label>Logo URL</Label>
              <Input value={fLogoUrl} onChange={e => setFLogoUrl(e.target.value)} data-testid="input-edit-logo" />
            </div>
            <div>
              <Label>Banner URL</Label>
              <Input value={fBannerUrl} onChange={e => setFBannerUrl(e.target.value)} data-testid="input-edit-banner" />
            </div>
          </div>
          <div>
            <Label>Brand Story</Label>
            <Textarea value={fBrandStory} onChange={e => setFBrandStory(e.target.value)} rows={3} data-testid="input-edit-brand-story" />
          </div>
          <div>
            <Label>Notes</Label>
            <Textarea value={fNotes} onChange={e => setFNotes(e.target.value)} rows={2} data-testid="input-edit-notes" />
          </div>
        </div>
      </DetailModal>

      {/* Follow-up Modal */}
      <DetailModal
        open={followupOpen}
        onClose={() => setFollowupOpen(false)}
        title="Log Follow-up"
        subtitle="Record a communication or update for this application"
        footer={
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setFollowupOpen(false)}>Cancel</Button>
            <Button onClick={() => addFollowupMutation.mutate()} style={{ background: FAIRE_COLOR }} className="text-white" disabled={addFollowupMutation.isPending} data-testid="btn-save-followup">
              {addFollowupMutation.isPending ? "Saving…" : "Log Follow-up"}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Date</Label>
              <Input type="date" value={fFollowupDate} onChange={e => setFFollowupDate(e.target.value)} data-testid="input-followup-date" />
            </div>
            <div>
              <Label>Type</Label>
              <Select value={fFollowupType} onValueChange={setFFollowupType}>
                <SelectTrigger data-testid="select-followup-type"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="call">Call</SelectItem>
                  <SelectItem value="doc_submitted">Doc Submitted</SelectItem>
                  <SelectItem value="doc_requested">Doc Requested</SelectItem>
                  <SelectItem value="note">Note</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Note</Label>
            <Textarea value={fFollowupNote} onChange={e => setFFollowupNote(e.target.value)} placeholder="What happened? What was communicated?" rows={3} data-testid="input-followup-note" />
          </div>
        </div>
      </DetailModal>

      {/* Link Modal */}
      <DetailModal
        open={linkOpen}
        onClose={() => setLinkOpen(false)}
        title="Add Quick Link"
        subtitle="Save a useful link for this application"
        footer={
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setLinkOpen(false)}>Cancel</Button>
            <Button onClick={() => addLinkMutation.mutate()} style={{ background: FAIRE_COLOR }} className="text-white" disabled={addLinkMutation.isPending} data-testid="btn-save-link">
              {addLinkMutation.isPending ? "Saving…" : "Add Link"}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Label *</Label>
              <Input value={fLinkLabel} onChange={e => setFLinkLabel(e.target.value)} placeholder="e.g. GoDaddy Domain" data-testid="input-link-label" />
            </div>
            <div>
              <Label>Type</Label>
              <Select value={fLinkType} onValueChange={setFLinkType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="domain_purchase">Domain Purchase</SelectItem>
                  <SelectItem value="faire_registration">Faire Registration</SelectItem>
                  <SelectItem value="marketplace_store">Marketplace Store</SelectItem>
                  <SelectItem value="website">Website</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>URL *</Label>
            <Input value={fLinkUrl} onChange={e => setFLinkUrl(e.target.value)} placeholder="https://…" data-testid="input-link-url" />
          </div>
        </div>
      </DetailModal>

      {/* Promote Modal */}
      <Dialog open={promoteOpen} onOpenChange={setPromoteOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 size={18} className="text-green-600" /> Confirm Approval
            </DialogTitle>
            <DialogDescription>
              Mark <strong>{app.brand_name}</strong> as approved and move it forward.
            </DialogDescription>
          </DialogHeader>
          <div className="my-2 p-3 bg-green-50 border border-green-200 rounded text-sm text-green-800">
            After approving, head to the <strong>Stores</strong> section to connect this brand's Faire credentials and activate it as a live store.
          </div>
          <div className="flex gap-2 justify-end mt-2">
            <Button variant="outline" onClick={() => setPromoteOpen(false)}>Cancel</Button>
            <Button className="text-white bg-green-600 hover:bg-green-700" onClick={() => promoteMutation.mutate()} disabled={promoteMutation.isPending} data-testid="btn-confirm-approve">
              {promoteMutation.isPending ? "Approving…" : "Confirm Approval"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Modal */}
      <DetailModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete Application"
        subtitle="This action cannot be undone."
        footer={
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteMutation.mutate()} disabled={deleteMutation.isPending} data-testid="btn-confirm-delete">
              {deleteMutation.isPending ? "Deleting…" : "Delete Application"}
            </Button>
          </div>
        }
      >
        <p className="text-sm text-muted-foreground">
          Are you sure you want to delete the application for <span className="font-medium text-foreground">{app.brand_name}</span>? All follow-ups and links will also be removed.
        </p>
      </DetailModal>
    </PageShell>
  );
}
