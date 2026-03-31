import { useState } from "react";
import { PageShell } from "@/components/layout";
import { PageTransition } from "@/components/ui/animated";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  Search, Phone, Mail, Sparkles, CheckCircle2, ArrowRight,
} from "lucide-react";
import {
  supransLeads as initialLeads,
  supransServices,
  VERTICAL_SERVICE_MAP,
  type SupransLead,
} from "@/lib/mock-data-suprans";
import { cn } from "@/lib/utils";
import { SUPRANS_COLOR } from "@/lib/suprans-config";
import { PersonCell } from "@/components/ui/avatar-cells";
import { SopModal, TutorialModal, SopTutorialButtons } from "@/components/sop/sop-modal";
import { SOP_REGISTRY } from "@/lib/sop-data";


const PRIORITY_OPTIONS = [
  { value: "high", label: "High", color: "text-red-600", dot: "bg-red-500" },
  { value: "medium", label: "Medium", color: "text-amber-600", dot: "bg-amber-500" },
  { value: "low", label: "Low", color: "text-emerald-600", dot: "bg-emerald-500" },
];

const SERVICE_LABELS: Record<string, string> = {
  "company-formation": "Company Formation",
  "tour-booking": "Tour Booking",
  "ecommerce-setup": "E-Commerce Setup",
  "event-management": "Event Management",
  "hr-consulting": "HR Consulting",
  "franchise": "Franchise",
};

const VERTICAL_OPTIONS = [
  { value: "legalnations", label: "LegalNations" },
  { value: "goyotours", label: "GoyoTours" },
  { value: "usdrop", label: "USDrop AI" },
  { value: "eventhub", label: "EventHub" },
  { value: "hrms", label: "HRMS" },
  { value: "ets", label: "EazyToSell" },
];

const VERTICAL_LABELS: Record<string, string> = {
  legalnations: "LegalNations",
  goyotours: "GoyoTours",
  usdrop: "USDrop AI",
  eventhub: "EventHub",
  hrms: "HRMS",
  ets: "EazyToSell",
};

export default function SupransEnrichment() {
  const { toast } = useToast();
  const [sopOpen, setSopOpen] = useState(false);
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const [leads, setLeads] = useState<SupransLead[]>(
    initialLeads.filter(l => l.status === "validated")
  );
  const [search, setSearch] = useState("");
  const [enrichLead, setEnrichLead] = useState<SupransLead | null>(null);
  const [selectedVertical, setSelectedVertical] = useState("");
  const [selectedPriority, setSelectedPriority] = useState<"high" | "medium" | "low">("medium");
  const [notes, setNotes] = useState("");

  const filtered = leads.filter(l =>
    l.name.toLowerCase().includes(search.toLowerCase()) ||
    l.email.toLowerCase().includes(search.toLowerCase())
  );

  function openEnrich(lead: SupransLead) {
    setEnrichLead(lead);
    setSelectedVertical(VERTICAL_SERVICE_MAP[lead.service] || "");
    setSelectedPriority(lead.priority);
    setNotes(lead.notes || "");
  }

  function handleEnrich() {
    if (!enrichLead) return;
    setLeads(prev => prev.filter(l => l.id !== enrichLead.id));
    toast({ title: "Lead enriched", description: `${enrichLead.name} is ready for assignment.` });
    setEnrichLead(null);
    setNotes("");
  }

  return (
    <PageShell>
    <PageTransition>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading">Enrichment</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Validate details and route leads to the right vertical</p>
        </div>
        <div className="flex items-center gap-2">
          <SopTutorialButtons onSopClick={() => setSopOpen(true)} onTutorialClick={() => setTutorialOpen(true)} />
          <div
            className="rounded-full px-3 py-1 text-white text-xs font-bold"
            style={{ backgroundColor: SUPRANS_COLOR }}
            data-testid="badge-enrichment-count"
          >
            {leads.length} to enrich
          </div>
        </div>
      </div>

      <div className="relative w-full md:w-80">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          className="pl-10"
          placeholder="Search validated leads..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          data-testid="input-search-enrichment"
        />
      </div>

      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="rounded-xl border bg-card py-16 text-center text-muted-foreground text-sm">
            No validated leads to enrich right now.
          </div>
        )}
        {filtered.map(lead => {
          const suggestedVertical = VERTICAL_LABELS[VERTICAL_SERVICE_MAP[lead.service]] || "—";
          const priorityInfo = PRIORITY_OPTIONS.find(p => p.value === lead.priority);
          return (
            <div key={lead.id} className="rounded-xl border bg-card p-4 flex items-start justify-between gap-4" data-testid={`card-enrichment-${lead.id}`}>
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-center gap-2">
                  <PersonCell name={lead.name} size="sm" />
                  <span className={cn("text-xs font-bold flex items-center gap-1", priorityInfo?.color)}>
                    <span className={cn("w-1.5 h-1.5 rounded-full", priorityInfo?.dot)} />
                    {lead.priority}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{lead.phone}</span>
                  <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{lead.email}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  Service: <span className="text-foreground font-medium">{SERVICE_LABELS[lead.service]}</span>
                </div>
                {lead.notes && (
                  <p className="text-xs text-muted-foreground italic">{lead.notes}</p>
                )}
                <div className="flex items-center gap-1.5 text-xs">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span className="text-muted-foreground">AI suggests:</span>
                  <span className="font-medium" style={{ color: SUPRANS_COLOR }}>{suggestedVertical}</span>
                  <ArrowRight className="w-3 h-3 text-muted-foreground" />
                </div>
              </div>
              <button
                onClick={() => openEnrich(lead)}
                className="px-4 py-2 rounded-lg text-white text-sm font-medium shrink-0"
                style={{ backgroundColor: SUPRANS_COLOR }}
                data-testid={`button-enrich-${lead.id}`}
              >
                Enrich
              </button>
            </div>
          );
        })}
      </div>

      <Dialog open={!!enrichLead} onOpenChange={o => !o && setEnrichLead(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Enrich Lead</DialogTitle>
          </DialogHeader>
          {enrichLead && (
            <div className="space-y-4">
              <div className="rounded-lg border p-3 text-sm space-y-1">
                <div><PersonCell name={enrichLead.name} size="sm" /></div>
                <div className="text-muted-foreground">Service: {SERVICE_LABELS[enrichLead.service]}</div>
              </div>

              <div className="space-y-1.5">
                <Label>Route to Vertical</Label>
                <Select value={selectedVertical} onValueChange={setSelectedVertical}>
                  <SelectTrigger data-testid="select-vertical">
                    <SelectValue placeholder="Select vertical..." />
                  </SelectTrigger>
                  <SelectContent>
                    {VERTICAL_OPTIONS.map(v => (
                      <SelectItem key={v.value} value={v.value}>{v.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Priority</Label>
                <div className="flex gap-2">
                  {PRIORITY_OPTIONS.map(p => (
                    <button
                      key={p.value}
                      onClick={() => setSelectedPriority(p.value as typeof selectedPriority)}
                      className={cn(
                        "flex-1 py-1.5 rounded-lg border text-xs font-medium flex items-center justify-center gap-1.5 transition-colors",
                        selectedPriority === p.value ? "border-current" : "border-border text-muted-foreground"
                      )}
                      style={selectedPriority === p.value ? { color: p.value === "high" ? "#dc2626" : p.value === "medium" ? "#d97706" : "#16a34a", borderColor: "currentColor" } : {}}
                      data-testid={`button-priority-${p.value}`}
                    >
                      <span className={cn("w-2 h-2 rounded-full", p.dot)} />
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Enrichment Notes</Label>
                <Textarea
                  placeholder="Add context, confirmed details, recommendations..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={3}
                  data-testid="textarea-enrichment-notes"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <button
              onClick={() => setEnrichLead(null)}
              className="px-4 py-2 rounded-lg bg-muted text-sm font-medium"
              data-testid="button-cancel-enrich"
            >
              Cancel
            </button>
            <button
              onClick={handleEnrich}
              disabled={!selectedVertical}
              className="px-4 py-2 rounded-lg text-white text-sm font-medium flex items-center gap-2 disabled:opacity-50"
              style={{ backgroundColor: SUPRANS_COLOR }}
              data-testid="button-confirm-enrich"
            >
              <CheckCircle2 className="w-4 h-4" />
              Mark as Enriched
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageTransition>
      <SopModal open={sopOpen} onOpenChange={setSopOpen} config={SOP_REGISTRY["suprans-enrichment"].sop} color={SUPRANS_COLOR} />
      <TutorialModal open={tutorialOpen} onOpenChange={setTutorialOpen} config={SOP_REGISTRY["suprans-enrichment"].tutorial} color={SUPRANS_COLOR} />
    </PageShell>
  );
}
