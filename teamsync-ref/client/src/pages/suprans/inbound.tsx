import { useState } from "react";
import { PageShell } from "@/components/layout";
import { PageTransition } from "@/components/ui/animated";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Search, Globe, Instagram, Linkedin, MessageCircle, MapPin,
  BarChart3, Users, Phone, Mail, Clock, CheckCircle2,
} from "lucide-react";
import { supransLeads as initialLeads, type SupransLead } from "@/lib/mock-data-suprans";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { SUPRANS_COLOR } from "@/lib/suprans-config";
import { PersonCell } from "@/components/ui/avatar-cells";
import { SopModal, TutorialModal, SopTutorialButtons } from "@/components/sop/sop-modal";
import { SOP_REGISTRY } from "@/lib/sop-data";


const SOURCES = ["all", "website", "referral", "instagram", "linkedin", "google-ads", "walk-in", "whatsapp"] as const;
const SOURCE_LABELS: Record<string, string> = {
  all: "All",
  website: "Website",
  referral: "Referral",
  instagram: "Instagram",
  linkedin: "LinkedIn",
  "google-ads": "Google Ads",
  "walk-in": "Walk-in",
  whatsapp: "WhatsApp",
};

const SOURCE_ICONS: Record<string, typeof Globe> = {
  website: Globe,
  referral: Users,
  instagram: Instagram,
  linkedin: Linkedin,
  "google-ads": BarChart3,
  "walk-in": MapPin,
  whatsapp: MessageCircle,
};

const SOURCE_COLORS: Record<string, string> = {
  website: "bg-blue-100 text-blue-700",
  referral: "bg-emerald-100 text-emerald-700",
  instagram: "bg-pink-100 text-pink-700",
  linkedin: "bg-sky-100 text-sky-700",
  "google-ads": "bg-amber-100 text-amber-700",
  "walk-in": "bg-slate-100 text-slate-700",
  whatsapp: "bg-green-100 text-green-700",
};

const SERVICE_LABELS: Record<string, string> = {
  "company-formation": "Company Formation",
  "tour-booking": "Tour Booking",
  "ecommerce-setup": "E-Commerce Setup",
  "event-management": "Event Management",
  "hr-consulting": "HR Consulting",
  "franchise": "Franchise",
};

const PRIORITY_COLORS: Record<string, string> = {
  high: "text-red-500",
  medium: "text-amber-500",
  low: "text-emerald-500",
};

export default function SupransInbound() {
  const { toast } = useToast();
  const [sopOpen, setSopOpen] = useState(false);
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const [leads, setLeads] = useState<SupransLead[]>(
    initialLeads.filter(l => l.status === "new")
  );
  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [validateLead, setValidateLead] = useState<SupransLead | null>(null);
  const [notes, setNotes] = useState("");

  const filtered = leads.filter(l => {
    const matchSearch =
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.email.toLowerCase().includes(search.toLowerCase()) ||
      l.phone.includes(search);
    const matchSource = sourceFilter === "all" || l.source === sourceFilter;
    return matchSearch && matchSource;
  });

  function handleValidate() {
    if (!validateLead) return;
    setLeads(prev => prev.filter(l => l.id !== validateLead.id));
    toast({ title: "Lead validated", description: `${validateLead.name} moved to Enrichment.` });
    setValidateLead(null);
    setNotes("");
  }

  return (
    <PageShell>
    <PageTransition>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading">Inbound Leads</h1>
          <p className="text-muted-foreground text-sm mt-0.5">New leads requiring validation</p>
        </div>
        <div className="flex items-center gap-2">
          <SopTutorialButtons onSopClick={() => setSopOpen(true)} onTutorialClick={() => setTutorialOpen(true)} />
          <div
            className="rounded-full px-3 py-1 text-white text-xs font-bold"
            style={{ backgroundColor: SUPRANS_COLOR }}
            data-testid="badge-new-count"
          >
            {leads.length} new
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            className="pl-10"
            placeholder="Search by name, email, phone..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            data-testid="input-search-inbound"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {SOURCES.map(src => (
            <button
              key={src}
              onClick={() => setSourceFilter(src)}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm font-medium transition-colors shrink-0 cursor-pointer",
                sourceFilter === src ? "text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
              style={sourceFilter === src ? { backgroundColor: SUPRANS_COLOR } : {}}
              data-testid={`filter-source-${src}`}
            >
              {SOURCE_LABELS[src]}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="divide-y">
          {filtered.length === 0 && (
            <div className="py-16 text-center text-muted-foreground text-sm">
              No inbound leads match your filters.
            </div>
          )}
          {filtered.map(lead => {
            const SrcIcon = SOURCE_ICONS[lead.source] || Globe;
            return (
              <div key={lead.id} className="p-4 flex items-center gap-4" data-testid={`row-inbound-${lead.id}`}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <PersonCell name={lead.name} size="sm" />
                    <span className={`text-xs font-bold ${PRIORITY_COLORS[lead.priority]}`}>
                      ● {lead.priority}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground flex-wrap">
                    <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{lead.phone}</span>
                    <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{lead.email}</span>
                    <span>{SERVICE_LABELS[lead.service]}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className={cn("flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium", SOURCE_COLORS[lead.source])}>
                    <SrcIcon className="w-3 h-3" />
                    {SOURCE_LABELS[lead.source]}
                  </div>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {formatDistanceToNow(new Date(lead.createdAt), { addSuffix: true })}
                  </span>
                  <button
                    onClick={() => { setValidateLead(lead); setNotes(""); }}
                    className="text-sm px-3 py-1.5 rounded-lg text-white font-medium"
                    style={{ backgroundColor: SUPRANS_COLOR }}
                    data-testid={`button-validate-${lead.id}`}
                  >
                    Validate
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Dialog open={!!validateLead} onOpenChange={o => !o && setValidateLead(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Validate Lead</DialogTitle>
          </DialogHeader>
          {validateLead && (
            <div className="space-y-4">
              <div className="rounded-lg border p-3 space-y-1 text-sm">
                <div><PersonCell name={validateLead.name} size="sm" /></div>
                <div className="text-muted-foreground flex items-center gap-1"><Phone className="w-3 h-3" />{validateLead.phone}</div>
                <div className="text-muted-foreground flex items-center gap-1"><Mail className="w-3 h-3" />{validateLead.email}</div>
                <div className="text-muted-foreground">Service: <span className="text-foreground">{SERVICE_LABELS[validateLead.service]}</span></div>
                <div className="text-muted-foreground">Source: <span className="text-foreground capitalize">{validateLead.source.replace("-", " ")}</span></div>
              </div>
              <div className="space-y-1.5">
                <Label>Validation Notes</Label>
                <Textarea
                  placeholder="Confirm contact details, add any notes about this lead..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={3}
                  data-testid="textarea-validation-notes"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <button
              onClick={() => setValidateLead(null)}
              className="px-4 py-2 rounded-lg bg-muted text-sm font-medium"
              data-testid="button-cancel-validate"
            >
              Cancel
            </button>
            <button
              onClick={handleValidate}
              className="px-4 py-2 rounded-lg text-white text-sm font-medium flex items-center gap-2"
              style={{ backgroundColor: SUPRANS_COLOR }}
              data-testid="button-confirm-validate"
            >
              <CheckCircle2 className="w-4 h-4" />
              Mark as Validated
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageTransition>
      <SopModal open={sopOpen} onOpenChange={setSopOpen} config={SOP_REGISTRY["suprans-inbound"].sop} color={SUPRANS_COLOR} />
      <TutorialModal open={tutorialOpen} onOpenChange={setTutorialOpen} config={SOP_REGISTRY["suprans-inbound"].tutorial} color={SUPRANS_COLOR} />
    </PageShell>
  );
}
