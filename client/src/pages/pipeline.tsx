import { useState, useMemo, useCallback } from "react";
import { Link } from "wouter";
import { useStore } from "@/lib/store";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Lead, Activity } from "@shared/schema";
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  DragStartEvent,
  DragEndEvent,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { stages } from "@/lib/mock-data";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDistanceToNow } from "date-fns";
import {
  DollarSign,
  Phone,
  Mail,
  Calendar,
  Clock,
  FileText,
  Loader2,
  Search,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const STAGE_STYLES: Record<string, { bg: string; hdr: string; text: string; border: string }> = {
  new: { bg: "bg-slate-50 dark:bg-slate-900/30", hdr: "bg-slate-100 dark:bg-slate-800", text: "text-slate-700 dark:text-slate-300", border: "border-slate-200 dark:border-slate-700" },
  contacted: { bg: "bg-sky-50 dark:bg-sky-900/30", hdr: "bg-sky-100 dark:bg-sky-800", text: "text-sky-700 dark:text-sky-300", border: "border-sky-200 dark:border-sky-700" },
  qualified: { bg: "bg-amber-50 dark:bg-amber-900/30", hdr: "bg-amber-100 dark:bg-amber-800", text: "text-amber-700 dark:text-amber-300", border: "border-amber-200 dark:border-amber-700" },
  proposal: { bg: "bg-blue-50 dark:bg-blue-900/30", hdr: "bg-blue-100 dark:bg-blue-800", text: "text-blue-700 dark:text-blue-300", border: "border-blue-200 dark:border-blue-700" },
  negotiation: { bg: "bg-orange-50 dark:bg-orange-900/30", hdr: "bg-orange-100 dark:bg-orange-800", text: "text-orange-700 dark:text-orange-300", border: "border-orange-200 dark:border-orange-700" },
  won: { bg: "bg-emerald-50 dark:bg-emerald-900/30", hdr: "bg-emerald-100 dark:bg-emerald-800", text: "text-emerald-700 dark:text-emerald-300", border: "border-emerald-200 dark:border-emerald-700" },
  lost: { bg: "bg-red-50 dark:bg-red-900/30", hdr: "bg-red-100 dark:bg-red-800", text: "text-red-700 dark:text-red-300", border: "border-red-200 dark:border-red-700" },
};

const temperatureDot: Record<string, string> = {
  hot: "bg-red-500",
  warm: "bg-amber-400",
  cold: "bg-blue-400",
};

function formatValue(value: number) {
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(0)}K`;
  return `₹${value}`;
}

function DroppableArea({ columnId, children }: { columnId: string; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({
    id: `droppable-${columnId}`,
    data: { type: "column", columnId },
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex-1 overflow-y-auto p-2 space-y-3 min-h-[60px] rounded-b-lg transition-colors",
        isOver && "bg-primary/5 ring-2 ring-primary/20 ring-inset"
      )}
    >
      {children}
    </div>
  );
}

function PipelineColumn({
  stage,
  leads,
  activities,
  totalValue,
  conversionRate,
}: {
  stage: typeof stages[number];
  leads: Lead[];
  activities: Activity[];
  totalValue: number;
  conversionRate: number | null;
}) {
  const style = STAGE_STYLES[stage.id] || STAGE_STYLES.new;

  return (
    <div className={cn("flex flex-col h-full min-w-[280px] max-w-[280px] rounded-lg border", style.border)} data-testid={`pipeline-col-${stage.id}`}>
      <div className={cn("rounded-t-lg px-3 py-2.5", style.hdr)}>
        <div className="flex items-center justify-between gap-1">
          <span className={cn("text-sm font-semibold", style.text)}>{stage.label}</span>
          <span className={cn("text-xs px-2 py-0.5 rounded-full bg-white/60 dark:bg-black/20 font-semibold", style.text)}>
            {leads.length}
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">{formatValue(totalValue)}</p>
      </div>

      {conversionRate !== null && (
        <div className="text-center py-1 bg-muted/30 border-b">
          <span className="text-[10px] text-muted-foreground flex items-center justify-center gap-1">
            <TrendingUp className="h-3 w-3" />
            {conversionRate}% advance
          </span>
        </div>
      )}

      <DroppableArea columnId={stage.id}>
        <SortableContext items={leads.map((l) => l.id)} strategy={verticalListSortingStrategy}>
          {leads.map((lead) => (
            <SortableLeadCard
              key={lead.id}
              lead={lead}
              columnId={stage.id}
              lastActivity={
                activities
                  .filter((a) => a.leadId === lead.id)
                  .sort(
                    (a, b) =>
                      new Date(b.createdAt).getTime() -
                      new Date(a.createdAt).getTime()
                  )[0]
              }
            />
          ))}
        </SortableContext>
        {leads.length === 0 && (
          <div className="h-24 flex items-center justify-center text-xs text-muted-foreground border border-dashed rounded-md">
            Empty Stage
          </div>
        )}
      </DroppableArea>
    </div>
  );
}

function SortableLeadCard({
  lead,
  columnId,
  lastActivity,
}: {
  lead: Lead;
  columnId: string;
  lastActivity?: Activity;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: lead.id,
    data: { type: "card", lead, columnId },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <LeadCard lead={lead} lastActivity={lastActivity} />
    </div>
  );
}

function LeadCard({ lead, lastActivity }: { lead: Lead; lastActivity?: Activity }) {
  const temp = (lead as any).temperature as string | undefined;

  return (
    <Link href={`/leads/${lead.id}`}>
      <Card
        className="cursor-pointer hover:shadow-md hover:border-border transition-all bg-card border shadow-sm rounded-xl"
        data-testid={`card-pipeline-${lead.id}`}
      >
        <CardContent className="p-3 space-y-2.5">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-semibold leading-tight truncate">{lead.name}</h4>
              <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{lead.company}</p>
            </div>
            {temp && (
              <div className={cn("size-2 rounded-full shrink-0 mt-1.5", temperatureDot[temp] || "bg-gray-400")} title={`${temp} lead`} />
            )}
          </div>

          {lead.phone && (
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <Phone className="h-3 w-3" />
              <span>{lead.phone}</span>
            </div>
          )}

          {lastActivity && (
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground bg-muted/50 p-1.5 rounded">
              {lastActivity.type === "call" && <Phone className="h-3 w-3" />}
              {lastActivity.type === "email" && <Mail className="h-3 w-3" />}
              {lastActivity.type === "meeting" && <Calendar className="h-3 w-3" />}
              {lastActivity.type === "stage_change" && <Clock className="h-3 w-3" />}
              {lastActivity.type === "note" && <FileText className="h-3 w-3" />}
              <span className="truncate max-w-[150px]">
                {lastActivity.type === "note"
                  ? "Note added"
                  : formatDistanceToNow(new Date(lastActivity.createdAt), {
                      addSuffix: true,
                    })}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-border/50">
            <div className="flex items-center text-sm font-bold text-foreground">
              <DollarSign className="h-3.5 w-3.5 mr-0.5 text-muted-foreground" />
              {formatValue(lead.value)}
            </div>
            <span className="text-[10px] text-muted-foreground">
              {formatDistanceToNow(new Date(lead.createdAt.toString()), {
                addSuffix: true,
              })}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function Pipeline() {
  const { currentUser, currentTeamId, simulatedRole } = useStore();
  const { toast } = useToast();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeLead, setActiveLead] = useState<Lead | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const effectiveRole = useStore.getState().getEffectiveRole();

  const { data: leads = [], isLoading: leadsLoading } = useQuery<Lead[]>({
    queryKey: ["/api/leads", currentTeamId, effectiveRole, simulatedRole],
    queryFn: async () => {
      const role = useStore.getState().getEffectiveRole();
      const res = await fetch(
        `/api/leads?teamId=${currentTeamId}&effectiveRole=${role}`,
        { credentials: "include" }
      );
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    enabled: !!currentUser,
  });

  const { data: activities = [] } = useQuery<Activity[]>({
    queryKey: ["/api/activities"],
    queryFn: async () => {
      const res = await fetch("/api/activities", { credentials: "include" });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    enabled: !!currentUser,
  });

  const updateStageMutation = useMutation({
    mutationFn: async ({
      leadId,
      newStage,
    }: {
      leadId: string;
      newStage: string;
    }) => {
      await apiRequest("PATCH", `/api/leads/${leadId}`, { stage: newStage });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        predicate: (q) =>
          (q.queryKey[0] as string)?.startsWith("/api/leads"),
      });
      queryClient.invalidateQueries({
        predicate: (q) =>
          (q.queryKey[0] as string)?.startsWith("/api/activities"),
      });
    },
    onError: () => {
      toast({ title: "Failed to update deal stage", variant: "destructive" });
    },
  });

  const filteredLeads = useMemo(() => {
    if (!searchQuery) return leads;
    const q = searchQuery.toLowerCase();
    return leads.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        (l.company || "").toLowerCase().includes(q)
    );
  }, [leads, searchQuery]);

  const getLeadsByStage = useCallback(
    (stageId: string) => filteredLeads.filter((l) => l.stage === stageId),
    [filteredLeads]
  );

  const getStageTotal = useCallback(
    (stageId: string) =>
      getLeadsByStage(stageId).reduce((sum, l) => sum + (l.value || 0), 0),
    [getLeadsByStage]
  );

  const getConversionRate = useCallback(
    (stageId: string) => {
      const activeStages = ["new", "contacted", "qualified", "proposal", "negotiation"];
      const idx = activeStages.indexOf(stageId);
      if (idx < 0 || idx >= activeStages.length - 1) return null;
      const curr = getLeadsByStage(activeStages[idx]).length;
      const next = getLeadsByStage(activeStages[idx + 1]).length;
      if (curr + next === 0) return null;
      return Math.round((next / (curr + next)) * 100);
    },
    [getLeadsByStage]
  );

  const totalPipelineValue = useMemo(
    () =>
      ["new", "contacted", "qualified", "proposal", "negotiation"]
        .reduce((sum, sid) => sum + getStageTotal(sid), 0),
    [getStageTotal]
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    setActiveLead(event.active.data.current?.lead as Lead);
  };

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over) {
        setActiveId(null);
        setActiveLead(null);
        return;
      }

      const leadId = active.id as string;
      let targetStageId = "";

      const overData = over.data.current;
      if (overData?.type === "column") {
        targetStageId = overData.columnId;
      } else if (overData?.type === "card") {
        targetStageId = overData.columnId;
      } else {
        const overId = over.id as string;
        if (overId.startsWith("droppable-")) {
          targetStageId = overId.replace("droppable-", "");
        } else {
          const overLead = leads.find((l) => l.id === overId);
          if (overLead) {
            targetStageId = overLead.stage;
          }
        }
      }

      const validStage = stages.find((s) => s.id === targetStageId);
      const draggedLead = leads.find((l) => l.id === leadId);

      if (validStage && draggedLead && draggedLead.stage !== targetStageId) {
        updateStageMutation.mutate({ leadId, newStage: targetStageId });
        toast({
          title: "Lead moved",
          description: `"${draggedLead.name}" moved to ${validStage.label}`,
        });
      }

      setActiveId(null);
      setActiveLead(null);
    },
    [leads, updateStageMutation, toast]
  );

  if (leadsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col w-full">
      <div className="px-2 py-3 border-b shrink-0 flex items-center justify-between gap-4 bg-card">
        <div className="shrink-0">
          <h1 className="text-[15px] font-semibold leading-tight">Deal Pipeline</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Drag and drop opportunities through stages
          </p>
        </div>

        <div className="text-sm text-muted-foreground">
          {filteredLeads.length} deals · Total:{" "}
          <span className="font-semibold text-foreground">{formatValue(totalPipelineValue)}</span>
        </div>
      </div>

      <div className="px-2 py-2.5 border-b flex items-center gap-3 bg-card shrink-0">
        <div className="relative w-56">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <Input
            placeholder="Search deals..."
            className="pl-9 h-8 text-sm rounded-lg"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            data-testid="input-search-pipeline"
          />
        </div>
      </div>

      <ScrollArea className="flex-1 px-2 py-4 bg-muted/30">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 overflow-x-auto pb-4 items-start min-h-full">
            {stages.map((stage) => (
              <PipelineColumn
                key={stage.id}
                stage={stage}
                leads={getLeadsByStage(stage.id)}
                activities={activities}
                totalValue={getStageTotal(stage.id)}
                conversionRate={getConversionRate(stage.id)}
              />
            ))}
          </div>

          <DragOverlay>
            {activeLead ? <LeadCard lead={activeLead} /> : null}
          </DragOverlay>
        </DndContext>
      </ScrollArea>
    </div>
  );
}
