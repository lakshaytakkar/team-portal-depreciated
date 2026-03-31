import { useState, useMemo } from "react";
import { MoreHorizontal, ArrowUpDown } from "lucide-react";
import { Fade } from "@/components/ui/animated";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { PersonCell } from "@/components/ui/avatar-cells";
import { crmDeals, crmContacts, crmActivities, ALL_VERTICALS_IN_CRM, type CrmDeal } from "@/lib/mock-data-crm";
import {
  PageShell,
  PageHeader,
  IndexToolbar,
  DataTableContainer,
  DataTH,
  DataTD,
  DataTR,
  StatGrid,
  StatCard,
  DetailModal,
  DetailSection,
} from "@/components/layout";
import { Target, Calendar, BarChart3 } from "lucide-react";
import { CRM_COLOR } from "@/lib/crm-config";
import { SopModal, TutorialModal, SopTutorialButtons } from "@/components/sop/sop-modal";
import { SOP_REGISTRY } from "@/lib/sop-data";

const stageBadge: Record<string, string> = {
  new: "bg-slate-100 text-slate-700",
  contacted: "bg-sky-100 text-sky-700",
  qualified: "bg-amber-100 text-amber-700",
  proposal: "bg-blue-100 text-blue-700",
  negotiation: "bg-orange-100 text-orange-700",
  won: "bg-emerald-100 text-emerald-700",
  lost: "bg-red-100 text-red-700",
};

const stageLabels: Record<string, string> = {
  new: "New Lead", contacted: "Contacted", qualified: "Qualified",
  proposal: "Proposal Sent", negotiation: "Negotiation", won: "Won", lost: "Lost",
};

const priorityDot: Record<string, string> = {
  high: "bg-red-500", medium: "bg-amber-400", low: "bg-emerald-500",
};

const REPS = Array.from(new Set(crmDeals.map(d => d.assignedTo))).sort();

function formatValue(d: CrmDeal) {
  if (d.currency === "USD") return `$${d.value.toLocaleString()}`;
  return `₹${d.value.toLocaleString()}`;
}

function formatINRShort(v: number) {
  if (v >= 10000000) return `₹${(v / 10000000).toFixed(1)}Cr`;
  if (v >= 100000) return `₹${(v / 100000).toFixed(1)}L`;
  return `₹${(v / 1000).toFixed(0)}K`;
}

export default function CrmDeals() {
  const isLoading = useSimulatedLoading(600);
  const [sopOpen, setSopOpen] = useState(false);
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const [verticalFilter, setVerticalFilter] = useState("all");
  const [stageFilter, setStageFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"value" | "close" | "probability">("value");
  const [selectedDeal, setSelectedDeal] = useState<CrmDeal | null>(null);

  const filtered = useMemo(() => {
    return crmDeals
      .filter(d => {
        if (verticalFilter !== "all" && d.vertical !== verticalFilter) return false;
        if (stageFilter !== "all" && d.stage !== stageFilter) return false;
        if (priorityFilter !== "all" && d.priority !== priorityFilter) return false;
        if (search) {
          const q = search.toLowerCase();
          if (!d.title.toLowerCase().includes(q) && !d.companyName.toLowerCase().includes(q) && !d.contactName.toLowerCase().includes(q)) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "value") {
          const av = a.currency === "INR" ? a.value : a.value * 83;
          const bv = b.currency === "INR" ? b.value : b.value * 83;
          return bv - av;
        }
        if (sortBy === "close") return a.expectedClose.localeCompare(b.expectedClose);
        if (sortBy === "probability") return b.probability - a.probability;
        return 0;
      });
  }, [verticalFilter, stageFilter, priorityFilter, search, sortBy]);

  const totalPipeline = filtered
    .filter(d => !["won", "lost"].includes(d.stage))
    .reduce((s, d) => s + (d.currency === "INR" ? d.value : d.value * 83), 0);

  const avgProb = filtered.length
    ? Math.round(filtered.reduce((s, d) => s + d.probability, 0) / filtered.length)
    : 0;

  const closingThisMonth = filtered.filter(d => d.expectedClose.startsWith("2026-03")).length;

  const getVertical = (id: string) => ALL_VERTICALS_IN_CRM.find(v => v.id === id);
  const getContact = (id: string) => crmContacts.find(c => c.id === id);
  const getDealActivities = (dealId: string) => crmActivities.filter(a => a.dealId === dealId).slice(0, 4);

  if (isLoading) {
    return (
      <PageShell>
        <div className="h-10 bg-muted rounded w-48 animate-pulse" />
        <StatGrid>
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-muted rounded-xl animate-pulse" />
          ))}
        </StatGrid>
        <div className="space-y-2">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-14 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      </PageShell>
    );
  }

  const verticalOptions = [
    { value: "all", label: "All Verticals" },
    ...ALL_VERTICALS_IN_CRM.map((v) => ({ value: v.id, label: v.name })),
  ];

  return (
    <PageShell>
      <Fade>
        <PageHeader
          title="All Deals"
          actions={
            <div className="flex items-center gap-2">
              <SopTutorialButtons onSopClick={() => setSopOpen(true)} onTutorialClick={() => setTutorialOpen(true)} />
            </div>
          }
        />

        <StatGrid>
          <StatCard
            label="Pipeline Value"
            value={formatINRShort(totalPipeline)}
            icon={Target}
            iconBg="bg-sky-50 dark:bg-sky-950"
            iconColor="text-sky-600"
            trend="Active deals only"
          />
          <StatCard
            label="Closing This Month"
            value={`${closingThisMonth} deals`}
            icon={Calendar}
            iconBg="bg-amber-50 dark:bg-amber-950"
            iconColor="text-amber-600"
            trend="Expected in March 2026"
          />
          <StatCard
            label="Avg Probability"
            value={`${avgProb}%`}
            icon={BarChart3}
            iconBg="bg-blue-50 dark:bg-blue-950"
            iconColor="text-blue-600"
            trend="Across filtered deals"
          />
        </StatGrid>

        <IndexToolbar
          search={search}
          onSearch={setSearch}
          placeholder="Search deals..."
          color={CRM_COLOR}
          filters={verticalOptions}
          activeFilter={verticalFilter}
          onFilter={setVerticalFilter}
          primaryAction={{
            label: "Add Deal",
            onClick: () => {},
          }}
          extra={
            <div className="flex items-center gap-2">
              <Select value={stageFilter} onValueChange={setStageFilter}>
                <SelectTrigger className="h-9 w-40 bg-muted/30" data-testid="select-stage">
                  <SelectValue placeholder="Stage" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stages</SelectItem>
                  {Object.entries(stageLabels).map(([k, v]) => (
                    <SelectItem key={k} value={k}>
                      {v}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="h-9 w-36 bg-muted/30" data-testid="select-priority">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
                <SelectTrigger className="h-9 w-40 bg-muted/30" data-testid="select-sort">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="value">Sort by Value</SelectItem>
                  <SelectItem value="close">Sort by Close Date</SelectItem>
                  <SelectItem value="probability">Sort by Probability</SelectItem>
                </SelectContent>
              </Select>
            </div>
          }
        />
      </Fade>

      <Fade>
        <DataTableContainer>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <DataTH>Deal</DataTH>
                <DataTH>Vertical</DataTH>
                <DataTH>Value</DataTH>
                <DataTH>Stage</DataTH>
                <DataTH>Probability</DataTH>
                <DataTH>Close Date</DataTH>
                <DataTH>Assigned To</DataTH>
                <DataTH>Priority</DataTH>
                <DataTH>Last Activity</DataTH>
                <DataTH className="w-10" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((deal) => {
                const vert = getVertical(deal.vertical);
                return (
                  <DataTR
                    key={deal.id}
                    onClick={() => setSelectedDeal(deal)}
                    data-testid={`deal-row-${deal.id}`}
                  >
                    <DataTD>
                      <p className="text-sm font-medium max-w-[200px] truncate">
                        {deal.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {deal.companyName} · {deal.contactName}
                      </p>
                    </DataTD>
                    <DataTD>
                      {vert && (
                        <span
                          className="text-xs px-2 py-0.5 rounded-full text-white font-medium"
                          style={{ backgroundColor: vert.color }}
                        >
                          {vert.name}
                        </span>
                      )}
                    </DataTD>
                    <DataTD>
                      <span className="text-sm font-bold">{formatValue(deal)}</span>
                    </DataTD>
                    <DataTD>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          stageBadge[deal.stage]
                        }`}
                      >
                        {stageLabels[deal.stage]}
                      </span>
                    </DataTD>
                    <DataTD>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-muted rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              deal.probability >= 70
                                ? "bg-emerald-500"
                                : deal.probability >= 40
                                ? "bg-amber-400"
                                : "bg-slate-400"
                            }`}
                            style={{ width: `${deal.probability}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium">
                          {deal.probability}%
                        </span>
                      </div>
                    </DataTD>
                    <DataTD className="text-muted-foreground whitespace-nowrap">
                      {deal.expectedClose}
                    </DataTD>
                    <DataTD>
                      <PersonCell name={deal.assignedTo} size="sm" />
                    </DataTD>
                    <DataTD>
                      <div className="flex items-center gap-1.5">
                        <div
                          className={`size-2 rounded-full ${priorityDot[deal.priority]}`}
                        />
                        <span className="text-xs capitalize text-muted-foreground">
                          {deal.priority}
                        </span>
                      </div>
                    </DataTD>
                    <DataTD className="text-xs text-muted-foreground whitespace-nowrap">
                      {deal.lastActivity}
                    </DataTD>
                    <DataTD>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7"
                        onClick={(e) => e.stopPropagation()}
                        data-testid={`btn-more-${deal.id}`}
                      >
                        <MoreHorizontal className="size-3.5" />
                      </Button>
                    </DataTD>
                  </DataTR>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={10}
                    className="p-12 text-center text-sm text-muted-foreground"
                  >
                    No deals match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <div className="border-t px-4 py-3 flex items-center justify-between text-xs text-muted-foreground bg-muted/30">
            <span>
              Showing {filtered.length} of {crmDeals.length} deals
            </span>
            <span>
              Total value:{" "}
              <span className="font-semibold text-foreground">
                {formatINRShort(
                  filtered.reduce(
                    (s, d) => s + (d.currency === "INR" ? d.value : d.value * 83),
                    0
                  )
                )}
              </span>{" "}
              · Avg probability:{" "}
              <span className="font-semibold text-foreground">{avgProb}%</span>
            </span>
          </div>
        </DataTableContainer>
      </Fade>

      <DetailModal
        open={!!selectedDeal}
        onClose={() => setSelectedDeal(null)}
        title={selectedDeal?.title || ""}
        subtitle={selectedDeal ? `${selectedDeal.companyName} · ${selectedDeal.contactName}` : ""}
        footer={
          <>
            <Button variant="outline" onClick={() => setSelectedDeal(null)}>
              Close
            </Button>
            <Button style={{ backgroundColor: CRM_COLOR }} className="text-white">
              Edit Deal
            </Button>
          </>
        }
      >
        {selectedDeal && (() => {
          const vert = getVertical(selectedDeal.vertical);
          const contact = getContact(selectedDeal.contactId);
          const acts = getDealActivities(selectedDeal.id);
          return (
            <>
              <DetailSection title="Overview">
                <div className="flex items-center gap-3 flex-wrap mb-4">
                  {vert && (
                    <span
                      className="text-xs px-2.5 py-1 rounded-full text-white font-medium"
                      style={{ backgroundColor: vert.color }}
                    >
                      {vert.name}
                    </span>
                  )}
                  <span className="text-xl font-bold">
                    {formatValue(selectedDeal)}
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      stageBadge[selectedDeal.stage]
                    }`}
                  >
                    {stageLabels[selectedDeal.stage]}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">
                      Probability
                    </p>
                    <p className="font-medium">{selectedDeal.probability}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">
                      Priority
                    </p>
                    <div className="flex items-center gap-1.5">
                      <div
                        className={`size-2 rounded-full ${
                          priorityDot[selectedDeal.priority]
                        }`}
                      />
                      <p className="font-medium capitalize">
                        {selectedDeal.priority}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">
                      Expected Close
                    </p>
                    <p className="font-medium">{selectedDeal.expectedClose}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">
                      Assigned To
                    </p>
                    <p className="font-medium">{selectedDeal.assignedTo}</p>
                  </div>
                </div>
              </DetailSection>

              <DetailSection title="Contact Info">
                {contact && (
                  <PersonCell name={contact.name} subtitle={`${contact.designation} · ${contact.company} · ${contact.email} · ${contact.phone}`} size="lg" />
                )}
              </DetailSection>

              {selectedDeal.notes && (
                <DetailSection title="Notes">
                  <p className="text-sm bg-muted/50 rounded-lg p-3">
                    {selectedDeal.notes}
                  </p>
                </DetailSection>
              )}

              {acts.length > 0 && (
                <DetailSection title="Recent Activities">
                  <div className="space-y-3">
                    {acts.map((a) => (
                      <div key={a.id} className="flex items-start gap-2 text-sm">
                        <span className="text-xs bg-muted px-1.5 py-0.5 rounded capitalize shrink-0 font-medium">
                          {a.type}
                        </span>
                        <span className="text-muted-foreground">{a.title}</span>
                      </div>
                    ))}
                  </div>
                </DetailSection>
              )}
            </>
          );
        })()}
      </DetailModal>
      <SopModal open={sopOpen} onOpenChange={setSopOpen} config={SOP_REGISTRY["crm-deals"].sop} color={CRM_COLOR} />
      <TutorialModal open={tutorialOpen} onOpenChange={setTutorialOpen} config={SOP_REGISTRY["crm-deals"].tutorial} color={CRM_COLOR} />
    </PageShell>
  );
}
