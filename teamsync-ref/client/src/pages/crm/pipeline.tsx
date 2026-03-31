import { useState } from "react";
import { Search } from "lucide-react";
import { PageTransition, Fade } from "@/components/ui/animated";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SmallDetailModal } from "@/components/blocks/detail-view-blocks";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { useToast } from "@/hooks/use-toast";
import { PersonCell, CompanyCell } from "@/components/ui/avatar-cells";
import { crmDeals, crmContacts, crmActivities, ALL_VERTICALS_IN_CRM, type CrmDeal } from "@/lib/mock-data-crm";
import { CRM_COLOR } from "@/lib/crm-config";
import { PageShell } from "@/components/layout";
import { KanbanBoard, type KanbanColumnData, type KanbanCardItem } from "@/components/blocks/kanban-blocks";
import { SopModal, TutorialModal, SopTutorialButtons } from "@/components/sop/sop-modal";
import { SOP_REGISTRY } from "@/lib/sop-data";

const COLUMNS: { stage: string; label: string; border: string; bg: string; text: string; hdr: string }[] = [
  { stage: "new", label: "New Lead", border: "border-slate-200", bg: "bg-slate-50", text: "text-slate-700", hdr: "bg-slate-100" },
  { stage: "contacted", label: "Contacted", border: "border-sky-200", bg: "bg-sky-50", text: "text-sky-700", hdr: "bg-sky-100" },
  { stage: "qualified", label: "Qualified", border: "border-amber-200", bg: "bg-amber-50", text: "text-amber-700", hdr: "bg-amber-100" },
  { stage: "proposal", label: "Proposal Sent", border: "border-blue-200", bg: "bg-blue-50", text: "text-blue-700", hdr: "bg-blue-100" },
  { stage: "negotiation", label: "Negotiation", border: "border-orange-200", bg: "bg-orange-50", text: "text-orange-700", hdr: "bg-orange-100" },
  { stage: "won", label: "Won", border: "border-emerald-200", bg: "bg-emerald-50", text: "text-emerald-700", hdr: "bg-emerald-100" },
  { stage: "lost", label: "Lost", border: "border-red-200", bg: "bg-red-50", text: "text-red-700", hdr: "bg-red-100" },
];

const priorityDot: Record<string, string> = {
  high: "bg-red-500", medium: "bg-amber-400", low: "bg-emerald-500",
};

const REPS = Array.from(new Set(crmDeals.map(d => d.assignedTo))).sort();

function formatValue(d: CrmDeal) {
  if (d.currency === "USD") return `$${(d.value / 1000).toFixed(0)}K`;
  if (d.value >= 100000) return `₹${(d.value / 100000).toFixed(1)}L`;
  return `₹${(d.value / 1000).toFixed(0)}K`;
}

function convRate(stage: string) {
  const stageOrder = ["new", "contacted", "qualified", "proposal", "negotiation"];
  const idx = stageOrder.indexOf(stage);
  if (idx < 0 || idx >= stageOrder.length - 1) return null;
  const curr = crmDeals.filter(d => d.stage === stageOrder[idx]).length;
  const next = crmDeals.filter(d => d.stage === stageOrder[idx + 1]).length;
  if (curr === 0) return null;
  return Math.round((next / (curr + next)) * 100);
}

export default function CrmPipeline() {
  const isLoading = useSimulatedLoading(700);
  const [sopOpen, setSopOpen] = useState(false);
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const { toast } = useToast();
  const [verticalFilter, setVerticalFilter] = useState("all");
  const [repFilter, setRepFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedDeal, setSelectedDeal] = useState<CrmDeal | null>(null);
  const [dealStageOverrides, setDealStageOverrides] = useState<Record<string, string>>({});

  const filtered = crmDeals.filter(d => {
    if (verticalFilter !== "all" && d.vertical !== verticalFilter) return false;
    if (repFilter !== "all" && d.assignedTo !== repFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!d.title.toLowerCase().includes(q) && !d.companyName.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const getDealStage = (d: CrmDeal) => dealStageOverrides[d.id] ?? d.stage;
  const dealsByStage = (stage: string) => filtered.filter(d => getDealStage(d) === stage);
  const stageTotal = (stage: string) => dealsByStage(stage).reduce((s, d) => s + (d.currency === "INR" ? d.value : d.value * 83), 0);

  const getVertical = (id: string) => ALL_VERTICALS_IN_CRM.find(v => v.id === id);
  const getContact = (id: string) => crmContacts.find(c => c.id === id);
  const getDealActivities = (dealId: string) => crmActivities.filter(a => a.dealId === dealId).slice(0, 4);

  if (isLoading) {
    return (
      <PageShell>
        <div className="h-10 bg-muted rounded w-48" />
        <div className="h-10 bg-muted rounded" />
        <div className="flex gap-4">
          {[...Array(7)].map((_, i) => <div key={i} className="w-72 shrink-0 h-96 bg-muted rounded-xl" />)}
        </div>
      </PageShell>
    );
  }

  return (
    <PageTransition className="px-16 py-6 lg:px-24 space-y-5">
      <Fade>
        <div className="flex items-center justify-between gap-2">
          <h1 className="text-xl font-bold">Deal Pipeline</h1>
          <div className="flex items-center gap-2">
            <SopTutorialButtons onSopClick={() => setSopOpen(true)} onTutorialClick={() => setTutorialOpen(true)} />
          </div>
          <div className="text-sm text-muted-foreground">
            {filtered.length} deals · Total:{" "}
            <span className="font-semibold text-foreground">
              ₹{(["new", "contacted", "qualified", "proposal", "negotiation"].reduce((s, st) => s + stageTotal(st), 0) / 100000).toFixed(1)}L
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {[{ id: "all", name: "All Verticals", color: CRM_COLOR }, ...ALL_VERTICALS_IN_CRM].map(v => (
            <button
              key={v.id}
              onClick={() => setVerticalFilter(v.id)}
              data-testid={`pill-vertical-${v.id}`}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                verticalFilter === v.id ? "text-white border-transparent" : "bg-background border-border text-muted-foreground hover:border-foreground/30"
              }`}
              style={verticalFilter === v.id ? { backgroundColor: v.color, borderColor: v.color } : {}}
            >
              {v.name}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input placeholder="Search deals..." className="pl-9 h-9 w-56 rounded-lg" value={search} onChange={e => setSearch(e.target.value)} data-testid="input-search" />
          </div>
          <Select value={repFilter} onValueChange={setRepFilter}>
            <SelectTrigger className="h-9 w-44 rounded-lg" data-testid="select-assignee"><SelectValue placeholder="Assigned To" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Reps</SelectItem>
              {REPS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </Fade>

      <KanbanBoard
        columns={COLUMNS.map(col => {
          const deals = dealsByStage(col.stage);
          return {
            id: col.stage,
            title: col.label,
            color: undefined,
            cards: deals.map(deal => ({
              id: deal.id,
              title: deal.title,
              subtitle: deal.companyName,
            })),
          } satisfies KanbanColumnData;
        })}
        columnClassName="shrink-0 w-[280px]"
        className="pb-6 -mx-2 px-2"
        renderColumnHeader={(column) => {
          const col = COLUMNS.find(c => c.stage === column.id)!;
          const total = stageTotal(col.stage);
          const rate = convRate(col.stage);
          return (
            <div data-testid={`pipeline-col-${col.stage}`}>
              <div className={`${col.hdr} rounded-t-lg px-3 py-2.5`}>
                <div className="flex items-center justify-between gap-1">
                  <span className={`text-sm font-semibold ${col.text}`}>{col.label}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full bg-white/60 ${col.text} font-semibold`}>{column.cards.length}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {total >= 100000 ? `₹${(total / 100000).toFixed(1)}L` : `₹${(total / 1000).toFixed(0)}K`}
                </p>
              </div>
              {rate !== null && (
                <div className="text-center py-1">
                  <span className="text-xs text-muted-foreground">{rate}% advance to next</span>
                </div>
              )}
            </div>
          );
        }}
        renderCard={(card) => {
          const deal = filtered.find(d => d.id === card.id);
          if (!deal) return null;
          const vert = getVertical(deal.vertical);
          return (
            <div
              className="bg-card rounded-xl p-3 shadow-sm border border-border/50 cursor-pointer hover:shadow-md hover:border-border transition-all space-y-2.5"
              onClick={() => setSelectedDeal(deal)}
              data-testid={`deal-card-${deal.id}`}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium leading-tight line-clamp-2">{deal.title}</p>
                <div className={`size-2 rounded-full shrink-0 mt-1 ${priorityDot[deal.priority]}`} title={`${deal.priority} priority`} />
              </div>
              <CompanyCell name={deal.companyName} subtitle={deal.contactName} size="xs" />
              <div className="flex items-center justify-between gap-1">
                <span className="text-base font-bold">{formatValue(deal)}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium">
                  {deal.probability}%
                </span>
              </div>
              <div className="flex items-center justify-between gap-1">
                {vert && (
                  <span className="text-xs px-1.5 py-0.5 rounded-full text-white font-medium" style={{ backgroundColor: vert.color }}>
                    {vert.name}
                  </span>
                )}
                <div className="flex items-center gap-1.5">
                  <PersonCell name={deal.assignedTo} size="xs" />
                  <span className="text-xs text-muted-foreground">{deal.expectedClose.slice(5)}</span>
                </div>
              </div>
            </div>
          );
        }}
        onCardMove={(cardId, sourceColumnId, targetColumnId) => {
          const deal = crmDeals.find(d => d.id === cardId);
          const targetCol = COLUMNS.find(c => c.stage === targetColumnId);
          setDealStageOverrides(prev => ({ ...prev, [cardId]: targetColumnId }));
          toast({
            title: "Deal moved",
            description: `${deal?.title ?? cardId} moved to ${targetCol?.label ?? targetColumnId}`,
          });
        }}
      />

      {selectedDeal && (() => {
        const vert = getVertical(selectedDeal.vertical);
        const contact = getContact(selectedDeal.contactId);
        const acts = getDealActivities(selectedDeal.id);
        return (
          <SmallDetailModal
            open={!!selectedDeal}
            onClose={() => setSelectedDeal(null)}
            title={selectedDeal.title}
            subtitle={`${formatValue(selectedDeal)} · ${selectedDeal.probability}% probability`}
          >
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                {vert && (
                  <span className="text-xs px-2.5 py-1 rounded-full text-white font-medium" style={{ backgroundColor: vert.color }}>
                    {vert.name}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Stage</p>
                  <p className="font-medium capitalize">{selectedDeal.stage}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Priority</p>
                  <div className="flex items-center gap-1.5">
                    <div className={`size-2 rounded-full ${priorityDot[selectedDeal.priority]}`} />
                    <p className="font-medium capitalize">{selectedDeal.priority}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Expected Close</p>
                  <p className="font-medium">{selectedDeal.expectedClose}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Assigned To</p>
                  <p className="font-medium">{selectedDeal.assignedTo}</p>
                </div>
              </div>

              {contact && (
                <div className="border rounded-xl p-3 space-y-1">
                  <p className="text-xs text-muted-foreground font-medium mb-2">Contact</p>
                  <PersonCell name={contact.name} subtitle={`${contact.designation} · ${contact.company} · ${contact.email}`} />
                </div>
              )}

              {selectedDeal.notes && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Notes</p>
                  <p className="text-sm bg-muted rounded-lg p-3">{selectedDeal.notes}</p>
                </div>
              )}

              {acts.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Recent Activities</p>
                  <div className="space-y-2">
                    {acts.map(a => (
                      <div key={a.id} className="flex items-start gap-2 text-sm">
                        <span className="text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded capitalize shrink-0">{a.type}</span>
                        <span className="text-muted-foreground truncate">{a.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </SmallDetailModal>
        );
      })()}
      <SopModal open={sopOpen} onOpenChange={setSopOpen} config={SOP_REGISTRY["crm-pipeline"].sop} color={CRM_COLOR} />
      <TutorialModal open={tutorialOpen} onOpenChange={setTutorialOpen} config={SOP_REGISTRY["crm-pipeline"].tutorial} color={CRM_COLOR} />
    </PageTransition>
  );
}
