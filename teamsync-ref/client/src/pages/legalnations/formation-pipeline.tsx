import { useMemo, useState } from "react";
import { DataTable, type Column } from "@/components/ds/data-table";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { StatsCardSkeleton } from "@/components/ui/card-skeleton";
import { StatusBadge } from "@/components/ds/status-badge";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PageTransition, Stagger, StaggerItem, Fade } from "@/components/ui/animated";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { formationClients, stageDefinitions } from "@/lib/mock-data";
import type { FormationClient } from "@shared/schema";
import { Building2, Clock, AlertTriangle, Users } from "lucide-react";
import { PageShell } from "@/components/layout";
import { PersonCell, CompanyCell } from "@/components/ui/avatar-cells";
import { KanbanBoard, type KanbanColumnData, type KanbanCardItem } from "@/components/blocks/kanban-blocks";
import { useToast } from "@/hooks/use-toast";

const riskColors: Record<string, string> = {
  "at-risk": "bg-red-500",
  delayed: "bg-amber-500",
  "on-track": "bg-emerald-500",
};

const priorityDot: Record<string, string> = {
  high: "bg-red-500",
  medium: "bg-amber-500",
  low: "bg-slate-400",
};

function daysInStage(startDate: string, currentStage: number): number {
  const start = new Date(startDate);
  const now = new Date();
  const totalDays = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  const avgPerStage = currentStage > 0 ? Math.floor(totalDays / currentStage) : totalDays;
  return Math.max(1, avgPerStage);
}

export default function FormationPipeline() {
  const loading = useSimulatedLoading();
  const { toast } = useToast();

  const clientsByStage = useMemo(() => {
    const map: Record<number, FormationClient[]> = {};
    for (const stage of stageDefinitions) {
      map[stage.number] = [];
    }
    for (const c of formationClients) {
      if (map[c.currentStage]) {
        map[c.currentStage].push(c);
      }
    }
    return map;
  }, []);

  const kanbanColumns: KanbanColumnData[] = useMemo(() => {
    return stageDefinitions.map((stage) => ({
      id: String(stage.number),
      title: stage.name,
      cards: (clientsByStage[stage.number] || []).map((client) => ({
        id: client.id,
        title: client.companyName,
        subtitle: client.clientName,
      })),
    }));
  }, [clientsByStage]);

  const clientMap = useMemo(() => {
    const map: Record<string, FormationClient> = {};
    for (const c of formationClients) {
      map[c.id] = c;
    }
    return map;
  }, []);

  const handleCardMove = (cardId: string, sourceColumnId: string, targetColumnId: string) => {
    const client = clientMap[cardId];
    const targetStage = stageDefinitions.find((s) => String(s.number) === targetColumnId);
    toast({
      title: "Stage updated",
      description: `${client?.companyName ?? cardId} moved to ${targetStage?.name ?? targetColumnId}`,
    });
  };

  const renderColumnHeader = (column: KanbanColumnData) => {
    const stageNum = parseInt(column.id);
    return (
      <div className="flex items-center gap-2 mb-3 px-1">
        <span className="flex size-5 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
          {stageNum}
        </span>
        <span className="text-xs font-medium truncate">{column.title}</span>
        <span className="text-xs text-muted-foreground ml-auto">{column.cards.length}</span>
      </div>
    );
  };

  const renderCard = (card: KanbanCardItem) => {
    const client = clientMap[card.id];
    if (!client) return null;
    return (
      <Card
        className="p-3 hover-elevate"
        data-testid={`card-pipeline-${client.id}`}
      >
        <div className="flex items-start justify-between gap-1 mb-2">
          <p className="text-xs font-medium leading-snug truncate" data-testid={`text-pipeline-company-${client.id}`}>
            {client.companyName}
          </p>
          <span
            className={`size-2 rounded-full shrink-0 mt-1 ${riskColors[client.riskFlag]}`}
            title={client.riskFlag}
          />
        </div>
        <p className="text-[11px] text-muted-foreground mb-2 truncate">{client.clientName}</p>
        <div className="flex items-center justify-between gap-1">
          <PersonCell name={client.assignedManager} size="xs" />
          <div className="flex items-center gap-0.5 text-[10px] text-muted-foreground shrink-0">
            <Clock className="size-2.5" />
            {daysInStage(client.startDate, client.currentStage)}d
          </div>
        </div>
        <div className="flex items-center gap-1 mt-1.5">
          <span className={`size-1.5 rounded-full ${priorityDot[client.priority]}`} />
          <span className="text-[10px] capitalize text-muted-foreground">{client.priority}</span>
        </div>
      </Card>
    );
  };

  const columns: Column<FormationClient>[] = [
    {
      key: "companyName",
      header: "Company",
      sortable: true,
      render: (item) => (
        <CompanyCell name={item.companyName} subtitle={item.clientName} />
      ),
    },
    {
      key: "state",
      header: "State",
      sortable: true,
    },
    {
      key: "currentStage",
      header: "Stage",
      sortable: true,
      render: (item) => {
        const stageDef = stageDefinitions.find((s) => s.number === item.currentStage);
        return (
          <Badge variant="outline" className="text-xs" data-testid={`badge-stage-${item.id}`}>
            {item.currentStage}. {stageDef?.name}
          </Badge>
        );
      },
    },
    {
      key: "assignedManager",
      header: "Manager",
      sortable: true,
      render: (item) => <PersonCell name={item.assignedManager} size="sm" />,
    },
    {
      key: "priority",
      header: "Priority",
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-1.5">
          <span className={`size-2 rounded-full ${priorityDot[item.priority]}`} />
          <span className="text-sm capitalize">{item.priority}</span>
        </div>
      ),
    },
    {
      key: "riskFlag",
      header: "Risk",
      render: (item) => (
        <StatusBadge
          status={item.riskFlag === "at-risk" ? "At Risk" : item.riskFlag === "delayed" ? "Delayed" : "On Track"}
          variant={item.riskFlag === "at-risk" ? "error" : item.riskFlag === "delayed" ? "warning" : "success"}
        />
      ),
    },
    {
      key: "packageType",
      header: "Package",
      render: (item) => <span className="text-sm text-muted-foreground">{item.packageType}</span>,
    },
  ];

  return (
    <PageShell>
      <PageTransition>
        <Fade direction="up" distance={10} delay={0.1}>
          <Tabs defaultValue="kanban" data-testid="tabs-pipeline-view">
            <TabsList data-testid="tabs-list-pipeline-view">
              <TabsTrigger value="kanban" data-testid="tab-kanban">Kanban</TabsTrigger>
              <TabsTrigger value="table" data-testid="tab-table">Table</TabsTrigger>
            </TabsList>

            <TabsContent value="kanban">
              {loading ? (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 mt-2">
                  {Array.from({ length: 7 }).map((_, i) => (
                    <StatsCardSkeleton key={i} />
                  ))}
                </div>
              ) : (
                <div className="mt-2">
                  <KanbanBoard
                    columns={kanbanColumns}
                    onCardMove={handleCardMove}
                    renderCard={renderCard}
                    renderColumnHeader={renderColumnHeader}
                    columnClassName="flex-1 min-w-[160px]"
                    className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7"
                  />
                </div>
              )}
            </TabsContent>

            <TabsContent value="table">
              {loading ? (
                <TableSkeleton rows={8} columns={6} />
              ) : (
                <DataTable
                  data={formationClients}
                  columns={columns}
                  searchPlaceholder="Search clients..."
                  searchKey="companyName"
                  filters={[
                    {
                      label: "Stage",
                      key: "currentStage",
                      options: stageDefinitions.map((s) => String(s.number)),
                    },
                    {
                      label: "Risk",
                      key: "riskFlag",
                      options: ["at-risk", "delayed", "on-track"],
                    },
                    {
                      label: "Priority",
                      key: "priority",
                      options: ["high", "medium", "low"],
                    },
                  ]}
                  emptyTitle="No formations found"
                  emptyDescription="There are no active formations to display."
                />
              )}
            </TabsContent>
          </Tabs>
        </Fade>
      </PageTransition>
    </PageShell>
  );
}
