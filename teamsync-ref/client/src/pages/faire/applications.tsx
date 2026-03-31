import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus, ClipboardList, CheckCircle2, Clock, AlertTriangle, XCircle,
  FileText, Eye,
} from "lucide-react";
import { CompanyCell } from "@/components/ui/avatar-cells";
import { Fade } from "@/components/ui/animated";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  PageShell, PageHeader, StatGrid, StatCard, IndexToolbar,
  DataTableContainer, DataTH, DataTD, DataTR, DetailModal,
} from "@/components/layout";
import { FAIRE_COLOR } from "@/lib/faire-config";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { SopModal, TutorialModal, SopTutorialButtons } from "@/components/sop/sop-modal";
import { SOP_REGISTRY } from "@/lib/sop-data";


const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; icon: typeof Clock }> = {
  drafting:     { label: "Drafting",      bg: "bg-slate-100",  text: "text-slate-700",  icon: Clock },
  applied:      { label: "Applied",       bg: "bg-blue-100",   text: "text-blue-700",   icon: ClipboardList },
  pending_docs: { label: "Pending Docs",  bg: "bg-amber-100",  text: "text-amber-700",  icon: AlertTriangle },
  approved:     { label: "Approved",      bg: "bg-green-100",  text: "text-green-700",  icon: CheckCircle2 },
  rejected:     { label: "Rejected",      bg: "bg-red-100",    text: "text-red-700",    icon: XCircle },
};

const STRATEGY_LABEL: Record<string, string> = {
  etsy: "Etsy", website: "Website", both: "Both",
};

interface SellerApplication {
  id: string;
  brand_name: string;
  category: string | null;
  email_id: string | null;
  status: string;
  marketplace_strategy: string | null;
  num_products_listed: number | null;
  application_date: string | null;
  created_at: string | null;
}

export default function FaireApplications() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<{ applications: SellerApplication[] }>({
    queryKey: ["/api/faire/applications"],
    queryFn: async () => {
      const res = await fetch("/api/faire/applications", { headers: { "Cache-Control": "no-cache" } });
      if (!res.ok) throw new Error(`${res.status}`);
      return res.json();
    },
  });

  const apps = data?.applications ?? [];

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [sopOpen, setSopOpen] = useState(false);
  const [tutorialOpen, setTutorialOpen] = useState(false);

  const [fBrandName, setFBrandName] = useState("");
  const [fCategory, setFCategory] = useState("");
  const [fBrandStory, setFBrandStory] = useState("");
  const [fEmailId, setFEmailId] = useState("");
  const [fEmailType, setFEmailType] = useState("basic");
  const [fStrategy, setFStrategy] = useState("website");
  const [fDomain, setFDomain] = useState("");
  const [fWebsite, setFWebsite] = useState("");
  const [fEtsy, setFEtsy] = useState("");
  const [fNotes, setFNotes] = useState("");

  function openAdd() {
    setFBrandName(""); setFCategory(""); setFBrandStory(""); setFEmailId("");
    setFEmailType("basic"); setFStrategy("website"); setFDomain("");
    setFWebsite(""); setFEtsy(""); setFNotes("");
    setFormOpen(true);
  }

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!fBrandName.trim()) throw new Error("Brand name is required");
      return apiRequest("POST", "/api/faire/applications", {
        brand_name: fBrandName.trim(),
        category: fCategory.trim() || null,
        brand_story: fBrandStory.trim() || null,
        email_id: fEmailId.trim() || null,
        email_type: fEmailType,
        marketplace_strategy: fStrategy,
        domain_name: fDomain.trim() || null,
        website_url: fWebsite.trim() || null,
        etsy_store_url: fEtsy.trim() || null,
        notes: fNotes.trim() || null,
        status: "drafting",
      });
    },
    onSuccess: async (res: Response) => {
      const json = await res.json();
      queryClient.invalidateQueries({ queryKey: ["/api/faire/applications"] });
      setFormOpen(false);
      toast({ title: "Application created" });
      setLocation(`/faire/applications/${json.application.id}`);
    },
    onError: (e: any) => toast({ title: e.message, variant: "destructive" }),
  });

  const PAGE_SIZE = 25;

  const filtered = apps.filter(a => {
    const matchStatus = statusFilter === "all" || a.status === statusFilter;
    const s = search.toLowerCase();
    const matchSearch = !s || a.brand_name.toLowerCase().includes(s) || (a.email_id ?? "").toLowerCase().includes(s) || (a.category ?? "").toLowerCase().includes(s);
    return matchStatus && matchSearch;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedApps = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const counts = {
    total: apps.length,
    drafting: apps.filter(a => a.status === "drafting").length,
    applied: apps.filter(a => a.status === "applied").length,
    pending_docs: apps.filter(a => a.status === "pending_docs").length,
    approved: apps.filter(a => a.status === "approved").length,
    rejected: apps.filter(a => a.status === "rejected").length,
  };

  return (
    <PageShell>
      <Fade>
        <PageHeader
          title="Seller Applications"
          subtitle="Manage Faire wholesale seller account applications from start to approval"
          actions={
            <div className="flex items-center gap-2">
              <SopTutorialButtons onSopClick={() => setSopOpen(true)} onTutorialClick={() => setTutorialOpen(true)} />
              <Button onClick={openAdd} style={{ background: FAIRE_COLOR }} className="text-white hover:opacity-90" data-testid="btn-new-application">
                <Plus size={15} className="mr-1.5" /> New Application
              </Button>
            </div>
          }
        />
      </Fade>

      <Fade>
        <StatGrid cols={6}>
          <StatCard label="Total" value={String(counts.total)} icon={ClipboardList} iconBg="#F0FDF4" iconColor={FAIRE_COLOR} />
          <StatCard label="Drafting" value={String(counts.drafting)} icon={Clock} iconBg="#F8FAFC" iconColor="#64748B" />
          <StatCard label="Applied" value={String(counts.applied)} icon={ClipboardList} iconBg="#EFF6FF" iconColor="#2563EB" />
          <StatCard label="Pending Docs" value={String(counts.pending_docs)} icon={AlertTriangle} iconBg="#FFFBEB" iconColor="#D97706" />
          <StatCard label="Approved" value={String(counts.approved)} icon={CheckCircle2} iconBg="#F0FDF4" iconColor="#16A34A" />
          <StatCard label="Rejected" value={String(counts.rejected)} icon={XCircle} iconBg="#FEF2F2" iconColor="#DC2626" />
        </StatGrid>
      </Fade>

      <Fade>
        <IndexToolbar
          search={search}
          onSearch={(v) => { setSearch(v); setCurrentPage(1); }}
          placeholder="Search by brand or contact..."
          color={FAIRE_COLOR}
          filters={[
            { value: "all", label: "All" },
            { value: "drafting", label: "Drafting", count: counts.drafting },
            { value: "applied", label: "Applied", count: counts.applied },
            { value: "pending_docs", label: "Pending Docs", count: counts.pending_docs },
            { value: "approved", label: "Approved", count: counts.approved },
            { value: "rejected", label: "Rejected", count: counts.rejected },
          ]}
          activeFilter={statusFilter}
          onFilter={(v) => { setStatusFilter(v); setCurrentPage(1); }}
        />
      </Fade>

      <Fade>
        <DataTableContainer>
          {isLoading && <div className="h-48 animate-pulse bg-muted/30 rounded" />}
          {!isLoading && filtered.length === 0 && (
            <div className="p-12 text-center text-sm text-muted-foreground">
              {apps.length === 0
                ? "No applications yet. Click 'New Application' to start tracking your first Faire seller account."
                : "No applications match your filters."}
            </div>
          )}
          {!isLoading && filtered.length > 0 && (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <DataTH>Brand Name</DataTH>
                  <DataTH>Category</DataTH>
                  <DataTH>Status</DataTH>
                  <DataTH>Email</DataTH>
                  <DataTH>Strategy</DataTH>
                  <DataTH>Products</DataTH>
                  <DataTH>Applied Date</DataTH>
                  <DataTH>Created</DataTH>
                  <DataTH align="right">Actions</DataTH>
                </tr>
              </thead>
              <tbody className="divide-y">
                {paginatedApps.map(a => {
                  const sc = STATUS_CONFIG[a.status] ?? STATUS_CONFIG.drafting;
                  const Icon = sc.icon;
                  return (
                    <DataTR key={a.id} onClick={() => setLocation(`/faire/applications/${a.id}`)} data-testid={`row-application-${a.id}`}>
                      <DataTD>
                        <CompanyCell name={a.brand_name} size="sm" />
                      </DataTD>
                      <DataTD className="text-muted-foreground">{a.category ?? "—"}</DataTD>
                      <DataTD>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${sc.bg} ${sc.text}`}>
                          <Icon size={11} /> {sc.label}
                        </span>
                      </DataTD>
                      <DataTD className="text-muted-foreground text-xs">{a.email_id ?? "—"}</DataTD>
                      <DataTD>
                        <span className="text-xs text-muted-foreground">{STRATEGY_LABEL[a.marketplace_strategy ?? "website"] ?? "—"}</span>
                      </DataTD>
                      <DataTD className="text-muted-foreground text-xs">{a.num_products_listed ?? 0}</DataTD>
                      <DataTD className="text-muted-foreground text-xs">
                        {a.application_date ? new Date(a.application_date).toLocaleDateString() : "—"}
                      </DataTD>
                      <DataTD className="text-muted-foreground text-xs">
                        {a.created_at ? new Date(a.created_at).toLocaleDateString() : "—"}
                      </DataTD>
                      <DataTD align="right" onClick={e => e.stopPropagation()}>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0"
                          onClick={() => setLocation(`/faire/applications/${a.id}`)}
                          data-testid={`button-view-application-${a.id}`}
                        >
                          <Eye size={14} />
                        </Button>
                      </DataTD>
                    </DataTR>
                  );
                })}
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

      {/* New Application Modal */}
      <DetailModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title="New Seller Application"
        subtitle="Start tracking a new Faire wholesale seller account application"
        footer={
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button onClick={() => createMutation.mutate()} style={{ background: FAIRE_COLOR }} className="text-white" disabled={createMutation.isPending} data-testid="btn-create-application">
              {createMutation.isPending ? "Creating…" : "Create Application"}
            </Button>
          </div>
        }
      >
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Label>Brand Name *</Label>
              <Input value={fBrandName} onChange={e => setFBrandName(e.target.value)} placeholder="e.g. Buddha Candles" data-testid="input-brand-name" />
            </div>
            <div>
              <Label>Product Category</Label>
              <Input value={fCategory} onChange={e => setFCategory(e.target.value)} placeholder="e.g. Home & Living" data-testid="input-category" />
            </div>
            <div>
              <Label>Email ID</Label>
              <Input value={fEmailId} onChange={e => setFEmailId(e.target.value)} placeholder="brand@domain.com" data-testid="input-email-id" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Email Type</Label>
              <Select value={fEmailType} onValueChange={setFEmailType}>
                <SelectTrigger data-testid="select-email-type"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="branded">Branded (name@domain.com)</SelectItem>
                  <SelectItem value="basic">Basic (Gmail / Outlook)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Marketplace Strategy</Label>
              <Select value={fStrategy} onValueChange={setFStrategy}>
                <SelectTrigger data-testid="select-strategy"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="website">Website Only</SelectItem>
                  <SelectItem value="etsy">Etsy Store</SelectItem>
                  <SelectItem value="both">Both</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Domain Name</Label>
              <Input value={fDomain} onChange={e => setFDomain(e.target.value)} placeholder="buddhacandles.com" data-testid="input-domain" />
            </div>
            <div>
              <Label>Website URL</Label>
              <Input value={fWebsite} onChange={e => setFWebsite(e.target.value)} placeholder="https://buddhacandles.com" data-testid="input-website-url" />
            </div>
          </div>
          {(fStrategy === "etsy" || fStrategy === "both") && (
            <div>
              <Label>Etsy Store URL</Label>
              <Input value={fEtsy} onChange={e => setFEtsy(e.target.value)} placeholder="https://www.etsy.com/shop/buddhacandles" data-testid="input-etsy-url" />
            </div>
          )}
          <div>
            <Label>Brand Story</Label>
            <Textarea value={fBrandStory} onChange={e => setFBrandStory(e.target.value)} placeholder="Describe the brand's story, mission, and what makes it unique…" rows={3} data-testid="input-brand-story" />
          </div>
          <div>
            <Label>Notes</Label>
            <Textarea value={fNotes} onChange={e => setFNotes(e.target.value)} placeholder="Any additional notes about this application…" rows={2} data-testid="input-notes" />
          </div>
        </div>
      </DetailModal>

      <SopModal open={sopOpen} onOpenChange={setSopOpen} config={SOP_REGISTRY["faire-applications"].sop} color={FAIRE_COLOR} />
      <TutorialModal open={tutorialOpen} onOpenChange={setTutorialOpen} config={SOP_REGISTRY["faire-applications"].tutorial} color={FAIRE_COLOR} />
    </PageShell>
  );
}
