import { useMemo, useState } from "react";
import { Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { DataTable, type Column } from "@/components/ds/data-table";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { StatusBadge } from "@/components/ds/status-badge";
import { FormDialog } from "@/components/ds/form-dialog";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageTransition, Stagger, StaggerItem, Fade } from "@/components/ui/animated";
import {
  ETS_PIPELINE_STAGES,
  ETS_STAGE_LABELS,
  type EtsClient,
  type EtsPipelineStage,
  type EtsPackageTier,
} from "@/lib/mock-data-ets";
import {
  LayoutGrid,
  Table2,
  Clock,
  MapPin,
  Store,
  Search,
  StickyNote,
  Eye,
  IndianRupee,
} from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { useToast } from "@/hooks/use-toast";
import { PageShell } from "@/components/layout";
import { PersonCell } from "@/components/ui/avatar-cells";
import { SopModal, TutorialModal, SopTutorialButtons } from "@/components/sop/sop-modal";
import { SOP_REGISTRY } from "@/lib/sop-data";
import { ETS_COLOR } from "@/lib/ets-config";
import { KanbanBoard, type KanbanColumnData, type KanbanCardItem } from "@/components/blocks/kanban-blocks";

const tierColors: Record<EtsPackageTier, string> = {
  lite: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  pro: "bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
  elite: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
};

const STAGE_COLORS: Record<EtsPipelineStage, { border: string; bg: string; text: string; hdr: string }> = {
  "new-lead": { border: "border-slate-200", bg: "bg-slate-50", text: "text-slate-700", hdr: "bg-slate-100" },
  "qualified": { border: "border-sky-200", bg: "bg-sky-50", text: "text-sky-700", hdr: "bg-sky-100" },
  "token-paid": { border: "border-amber-200", bg: "bg-amber-50", text: "text-amber-700", hdr: "bg-amber-100" },
  "store-design": { border: "border-violet-200", bg: "bg-violet-50", text: "text-violet-700", hdr: "bg-violet-100" },
  "inventory-ordered": { border: "border-blue-200", bg: "bg-blue-50", text: "text-blue-700", hdr: "bg-blue-100" },
  "in-transit": { border: "border-orange-200", bg: "bg-orange-50", text: "text-orange-700", hdr: "bg-orange-100" },
  "launched": { border: "border-emerald-200", bg: "bg-emerald-50", text: "text-emerald-700", hdr: "bg-emerald-100" },
  "reordering": { border: "border-teal-200", bg: "bg-teal-50", text: "text-teal-700", hdr: "bg-teal-100" },
};

const stageVariant: Record<EtsPipelineStage, "success" | "error" | "warning" | "neutral" | "info"> = {
  "new-lead": "neutral",
  "qualified": "info",
  "token-paid": "warning",
  "store-design": "info",
  "inventory-ordered": "warning",
  "in-transit": "info",
  "launched": "success",
  "reordering": "success",
};

function scoreColor(score: number): string {
  if (score >= 80) return "text-emerald-600 dark:text-emerald-400";
  if (score >= 60) return "text-amber-600 dark:text-amber-400";
  return "text-red-600 dark:text-red-400";
}

function scoreBg(score: number): string {
  if (score >= 80) return "bg-emerald-50 dark:bg-emerald-950";
  if (score >= 60) return "bg-amber-50 dark:bg-amber-950";
  return "bg-red-50 dark:bg-red-950";
}

function scoreLabel(score: number): string {
  if (score >= 80) return "Hot";
  if (score >= 60) return "Warm";
  return "Cold";
}

function formatInvestment(value: number): string {
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(0)}K`;
  return `₹${value}`;
}

export default function EtsPipeline() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [sopOpen, setSopOpen] = useState(false);
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const [view, setView] = useState<"kanban" | "table">("kanban");
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [tierFilter, setTierFilter] = useState<string>("all");
  const [citySearch, setCitySearch] = useState("");
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [noteClient, setNoteClient] = useState<EtsClient | null>(null);
  const [noteText, setNoteText] = useState("");

  const { data: clientsData, isLoading } = useQuery<{ clients: EtsClient[], total: number }>({ queryKey: ['/api/ets/clients'] });
  const clients = clientsData?.clients || [];

  const moveStageMutation = useMutation({
    mutationFn: async ({ id, stage }: { id: string | number, stage: EtsPipelineStage }) => {
      await apiRequest("PATCH", `/api/ets/clients/${id}`, { stage });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['/api/ets/clients'] });
    },
  });

  const filteredClients = useMemo(() => {
    let result = [...clients];
    if (stageFilter !== "all") {
      result = result.filter((c) => c.stage === stageFilter);
    }
    if (tierFilter !== "all") {
      result = result.filter((c) => c.packageTier === tierFilter);
    }
    if (citySearch.trim()) {
      const search = citySearch.toLowerCase();
      result = result.filter((c) => c.city.toLowerCase().includes(search) || c.name.toLowerCase().includes(search));
    }
    return result;
  }, [clients, stageFilter, tierFilter, citySearch]);

  const stageColumns = useMemo(() => {
    return ETS_PIPELINE_STAGES.map((stage) => ({
      stage,
      label: ETS_STAGE_LABELS[stage],
      clients: filteredClients.filter((c) => c.stage === stage),
    }));
  }, [filteredClients]);

  const clientMap = useMemo(() => {
    const map: Record<string, EtsClient> = {};
    for (const c of filteredClients) map[c.id] = c;
    return map;
  }, [filteredClients]);

  const kanbanColumns: KanbanColumnData[] = useMemo(() => {
    return stageColumns.map(({ stage, label, clients: stageClients }) => ({
      id: stage,
      title: label,
      cards: stageClients.map((c) => ({
        id: c.id,
        title: c.name,
        subtitle: c.city,
      })),
    }));
  }, [stageColumns]);

  const stageCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const stage of ETS_PIPELINE_STAGES) {
      counts[stage] = clients.filter((c) => c.stage === stage).length;
    }
    return counts;
  }, [clients]);

  const stageInvestment = useMemo(() => {
    const totals: Record<string, number> = {};
    for (const stage of ETS_PIPELINE_STAGES) {
      totals[stage] = clients
        .filter((c) => c.stage === stage)
        .reduce((sum, c) => sum + (c.totalInvestment || 0), 0);
    }
    return totals;
  }, [clients]);

  const handleAddNote = () => {
    if (noteClient && noteText.trim()) {
      toast({
        title: "Note Added",
        description: `Note added for ${noteClient.name}`,
      });
      setNoteDialogOpen(false);
      setNoteText("");
      setNoteClient(null);
    }
  };

  const handleMoveStage = (client: EtsClient, newStage: EtsPipelineStage) => {
    moveStageMutation.mutate({ id: client.id, stage: newStage });
    toast({
      title: "Stage Updated",
      description: `${client.name} moved to ${ETS_STAGE_LABELS[newStage]}`,
    });
  };

  const handleCardMove = (cardId: string, sourceColumnId: string, targetColumnId: string) => {
    const client = clientMap[cardId];
    if (client) {
      moveStageMutation.mutate({ id: client.id, stage: targetColumnId as EtsPipelineStage });
      toast({
        title: "Stage Updated",
        description: `${client.name} moved to ${ETS_STAGE_LABELS[targetColumnId as EtsPipelineStage]}`,
      });
    }
  };

  const renderEtsCard = (card: KanbanCardItem, columnId: string) => {
    const client = clientMap[card.id];
    if (!client) return null;
    return (
      <div
        className="bg-card rounded-xl p-3.5 shadow-sm border border-border/50 cursor-pointer hover:shadow-md hover:border-border transition-all space-y-2.5"
        data-testid={`card-pipeline-${client.id}`}
      >
        <Link href={`/ets/clients/${client.id}`}>
          <div className="flex items-start justify-between gap-2">
            <PersonCell name={client.name} subtitle={client.city} size="xs" />
            <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full shrink-0 ${scoreColor(client.score)} ${scoreBg(client.score)}`}>
              {client.score}
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Store className="size-3.5" />
            <span>{client.storeSize || client.storeArea ? `${client.storeSize || client.storeArea} sqft` : "—"}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="size-3.5" />
            <span className={client.daysInStage > 10 ? "text-amber-600 dark:text-amber-400 font-medium" : ""}>
              {client.daysInStage}d
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2">
          <Badge
            variant="secondary"
            className={`border-0 text-xs px-2 py-0.5 capitalize ${tierColors[client.packageTier]}`}
          >
            {client.packageTier}
          </Badge>
          {client.totalInvestment > 0 && (
            <span className="text-xs font-semibold text-foreground">
              {formatInvestment(client.totalInvestment)}
            </span>
          )}
        </div>

        {client.lastNote && (
          <p className="text-xs text-muted-foreground line-clamp-2" title={client.lastNote}>
            {client.lastNote}
          </p>
        )}

        <div className="flex items-center gap-1 pt-2 border-t border-border/50">
          <Button
            size="icon"
            variant="ghost"
            className="size-7"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setNoteClient(client);
              setNoteDialogOpen(true);
            }}
            title="Add Note"
            data-testid={`button-note-${client.id}`}
          >
            <StickyNote className="size-3.5" />
          </Button>
          <a
            href={`https://wa.me/${client.phone.replace(/\D/g, "")}`}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              size="icon"
              variant="ghost"
              className="size-7 text-green-600 hover:text-green-700 hover:bg-green-50"
              title="WhatsApp"
              data-testid={`button-whatsapp-${client.id}`}
            >
              <SiWhatsapp className="size-3.5" />
            </Button>
          </a>
          <Link href={`/ets/clients/${client.id}`} className="ml-auto">
            <Button
              size="icon"
              variant="ghost"
              className="size-7"
              title="View Detail"
              data-testid={`button-detail-${client.id}`}
            >
              <Eye className="size-3.5" />
            </Button>
          </Link>
        </div>
      </div>
    );
  };

  const renderColumnHeader = (column: KanbanColumnData) => {
    const stageKey = column.id as EtsPipelineStage;
    const colors = STAGE_COLORS[stageKey];
    const investment = stageInvestment[stageKey] || 0;
    return (
      <div data-testid={`pipeline-col-${stageKey}`}>
        <div className={`${colors.hdr} rounded-t-lg px-3 py-2.5`}>
          <div className="flex items-center justify-between gap-1">
            <span className={`text-sm font-semibold ${colors.text}`}>{column.title}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full bg-white/60 dark:bg-black/20 ${colors.text} font-semibold`}>
              {column.cards.length}
            </span>
          </div>
          {investment > 0 && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {formatInvestment(investment)}
            </p>
          )}
        </div>
      </div>
    );
  };

  const columns: Column<EtsClient>[] = [
    {
      key: "name",
      header: "Name",
      sortable: true,
      render: (item) => (
        <div className="flex flex-col">
          <Link href={`/ets/clients/${item.id}`}>
            <span className="text-sm font-medium hover:underline cursor-pointer" data-testid={`text-client-name-${item.id}`}>
              {item.name}
            </span>
          </Link>
          <span className="text-xs text-muted-foreground">{item.phone}</span>
        </div>
      ),
    },
    {
      key: "city",
      header: "City",
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-1.5">
          <MapPin className="size-3.5 text-muted-foreground" />
          <span className="text-sm">{item.city}</span>
        </div>
      ),
    },
    {
      key: "storeSize",
      header: "Store Size",
      sortable: true,
      render: (item) => <span className="text-sm">{item.storeSize} sqft</span>,
    },
    {
      key: "packageTier",
      header: "Package",
      sortable: true,
      render: (item) => (
        <Badge
          variant="secondary"
          className={`border-0 text-xs font-medium capitalize ${tierColors[item.packageTier]}`}
          data-testid={`badge-tier-${item.id}`}
        >
          {item.packageTier}
        </Badge>
      ),
    },
    {
      key: "stage",
      header: "Stage",
      sortable: true,
      render: (item) => (
        <StatusBadge
          status={ETS_STAGE_LABELS[item.stage]}
          variant={stageVariant[item.stage]}
        />
      ),
    },
    {
      key: "daysInStage",
      header: "Days in Stage",
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-1.5">
          <Clock className="size-3.5 text-muted-foreground" />
          <span className={`text-sm ${item.daysInStage > 10 ? "text-amber-600 dark:text-amber-400 font-medium" : ""}`}>
            {item.daysInStage}d
          </span>
        </div>
      ),
    },
    {
      key: "score",
      header: "Score",
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-1.5">
          <span className={`text-sm font-medium ${scoreColor(item.score)}`}>{item.score}</span>
          <span className={`text-xs ${scoreColor(item.score)}`}>({scoreLabel(item.score)})</span>
        </div>
      ),
    },
    {
      key: "lastNote",
      header: "Last Note",
      render: (item) => (
        <span className="text-xs text-muted-foreground line-clamp-1 max-w-[200px]" title={item.lastNote}>
          {item.lastNote}
        </span>
      ),
    },
    {
      key: "_contact",
      header: "",
      render: (item) => (
        <a href={`https://wa.me/${item.phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" data-testid={`btn-whatsapp-${item.id}`}>
          <Button variant="ghost" size="icon" className="size-8 text-green-600 hover:text-green-700 hover:bg-green-50">
            <SiWhatsapp className="size-4" />
          </Button>
        </a>
      ),
    },
  ];

  const rowActions = [
    {
      label: "View Detail",
      onClick: (item: EtsClient) => {
        window.location.href = `/ets/clients/${item.id}`;
      },
    },
    {
      label: "Add Note",
      onClick: (item: EtsClient) => {
        setNoteClient(item);
        setNoteDialogOpen(true);
      },
    },
    {
      label: "Generate Proposal",
      onClick: (item: EtsClient) => {
        window.location.href = `/ets/proposals`;
      },
    },
  ];

  return (
    <PageShell>
      <PageTransition>
        <Fade direction="up" distance={10} delay={0.1}>
          <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
            <h1 className="text-xl font-bold" data-testid="text-pipeline-title">Client Pipeline</h1>
            <div className="flex items-center gap-2 flex-wrap">
              <SopTutorialButtons onSopClick={() => setSopOpen(true)} onTutorialClick={() => setTutorialOpen(true)} />
            </div>
          </div>
          <div className="flex items-center justify-end mb-3">
            <div className="text-sm text-muted-foreground">
              {clients.length} clients · Total:{" "}
              <span className="font-semibold text-foreground">
                {formatInvestment(clients.reduce((s, c) => s + (c.totalInvestment || 0), 0))}
              </span>
            </div>
          </div>

          <Stagger className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            {[
              { label: "New Leads", count: (stageCounts["new-lead"] || 0) + (stageCounts["qualified"] || 0), icon: MapPin, desc: "Awaiting qualification" },
              { label: "In Setup", count: (stageCounts["token-paid"] || 0) + (stageCounts["store-design"] || 0), icon: Store, desc: "Store preparation" },
              { label: "In Fulfillment", count: (stageCounts["inventory-ordered"] || 0) + (stageCounts["in-transit"] || 0), icon: IndianRupee, desc: "Orders & shipping" },
              { label: "Active Stores", count: (stageCounts["launched"] || 0) + (stageCounts["reordering"] || 0), icon: Clock, desc: "Operational" },
            ].map((stat) => (
              <StaggerItem key={stat.label}>
                <Card className="p-4 hover-elevate" data-testid={`card-stat-${stat.label}`}>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <stat.icon className="size-4 text-muted-foreground" />
                  </div>
                  <p className="text-2xl font-semibold font-heading mt-1">{stat.count}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{stat.desc}</p>
                </Card>
              </StaggerItem>
            ))}
          </Stagger>
        </Fade>

        <Fade direction="up" distance={10} delay={0.15}>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search by name or city..."
                  value={citySearch}
                  onChange={(e) => setCitySearch(e.target.value)}
                  className="h-9 w-56 pl-9 text-sm rounded-lg"
                  data-testid="input-pipeline-search"
                />
              </div>
              <Select value={stageFilter} onValueChange={setStageFilter}>
                <SelectTrigger className="h-9 w-auto min-w-[140px] text-sm rounded-lg" data-testid="filter-stage">
                  <SelectValue placeholder="All Stages" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stages</SelectItem>
                  {ETS_PIPELINE_STAGES.map((stage) => (
                    <SelectItem key={stage} value={stage}>{ETS_STAGE_LABELS[stage]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={tierFilter} onValueChange={setTierFilter}>
                <SelectTrigger className="h-9 w-auto min-w-[130px] text-sm rounded-lg" data-testid="filter-tier">
                  <SelectValue placeholder="All Packages" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Packages</SelectItem>
                  <SelectItem value="lite">Lite</SelectItem>
                  <SelectItem value="pro">Pro</SelectItem>
                  <SelectItem value="elite">Elite</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-1 rounded-lg border p-0.5">
              <Button
                size="sm"
                variant={view === "kanban" ? "default" : "ghost"}
                onClick={() => setView("kanban")}
                className="rounded-md"
                data-testid="button-view-kanban"
              >
                <LayoutGrid className="size-4 mr-1.5" />
                Kanban
              </Button>
              <Button
                size="sm"
                variant={view === "table" ? "default" : "ghost"}
                onClick={() => setView("table")}
                className="rounded-md"
                data-testid="button-view-table"
              >
                <Table2 className="size-4 mr-1.5" />
                Table
              </Button>
            </div>
          </div>
        </Fade>

        <Fade direction="up" distance={10} delay={0.2}>
          {view === "kanban" ? (
            isLoading ? (
              <div className="flex gap-4 overflow-hidden pb-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="w-[280px] shrink-0 h-96 bg-muted rounded-xl" />
                ))}
              </div>
            ) : (
              <KanbanBoard
                columns={kanbanColumns}
                onCardMove={handleCardMove}
                renderCard={renderEtsCard}
                renderColumnHeader={renderColumnHeader}
                columnClassName="shrink-0 w-[280px]"
                className="pb-6 -mx-2 px-2"
              />
            )
          ) : (
            isLoading ? (
              <TableSkeleton rows={10} columns={8} />
            ) : (
              <DataTable
                data={filteredClients}
                columns={columns}
                searchPlaceholder="Search clients..."
                searchKey="name"
                rowActions={rowActions}
                filters={[
                  {
                    label: "Stage",
                    key: "stage",
                    options: ETS_PIPELINE_STAGES.map((s) => s),
                  },
                  {
                    label: "Package",
                    key: "packageTier",
                    options: ["lite", "pro", "elite"],
                  },
                ]}
                emptyTitle="No clients found"
                emptyDescription="There are no clients matching your filters."
              />
            )
          )}
        </Fade>

        <FormDialog
          open={noteDialogOpen}
          onOpenChange={setNoteDialogOpen}
          title={`Add Note — ${noteClient?.name || ""}`}
          onSubmit={handleAddNote}
          submitLabel="Add Note"
        >
          <div className="flex flex-col gap-2">
            <Label htmlFor="note-text">Note</Label>
            <Textarea
              id="note-text"
              placeholder="Enter your note..."
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              className="resize-none text-sm"
              rows={4}
              data-testid="input-note-text"
            />
          </div>
        </FormDialog>
      </PageTransition>
      <SopModal open={sopOpen} onOpenChange={setSopOpen} config={SOP_REGISTRY["ets-pipeline"].sop} color={ETS_COLOR} />
      <TutorialModal open={tutorialOpen} onOpenChange={setTutorialOpen} config={SOP_REGISTRY["ets-pipeline"].tutorial} color={ETS_COLOR} />
    </PageShell>
  );
}
