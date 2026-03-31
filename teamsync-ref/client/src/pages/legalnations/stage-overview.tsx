import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ds/status-badge";
import { DataTable, type Column } from "@/components/ds/data-table";
import { MiniStageStepper } from "@/components/ds/stage-stepper";
import { PageTransition, Stagger, StaggerItem } from "@/components/ui/animated";
import { StatsCardSkeleton } from "@/components/ui/card-skeleton";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { formationClients } from "@/lib/mock-data";
import { stageDefinitions } from "@shared/schema";
import type { FormationClient } from "@shared/schema";
import { Users, Clock, AlertTriangle, ArrowRight, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageShell } from "@/components/layout";
import { PersonCell, CompanyCell } from "@/components/ui/avatar-cells";

const riskVariantMap: Record<string, "success" | "error" | "warning" | "neutral" | "info"> = {
  "on-track": "success",
  "delayed": "warning",
  "at-risk": "error",
};

const stageColorMap: Record<number, string> = {
  0: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  1: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  2: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300",
  3: "bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300",
  4: "bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
  5: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  6: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
};

export default function StageOverviewPage() {
  const loading = useSimulatedLoading();
  const [, navigate] = useLocation();
  const [selectedStage, setSelectedStage] = useState<number | null>(null);

  const stageData = useMemo(() => {
    return stageDefinitions.map((stage) => {
      const clients = formationClients.filter((c) => c.currentStage === stage.number);
      const atRisk = clients.filter((c) => c.riskFlag === "at-risk").length;
      const delayed = clients.filter((c) => c.riskFlag === "delayed").length;

      const avgDays = clients.length > 0
        ? Math.round(
            clients.reduce((sum, c) => {
              const start = new Date(c.startDate);
              const now = new Date();
              return sum + Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
            }, 0) / clients.length
          )
        : 0;

      return {
        ...stage,
        clientCount: clients.length,
        atRisk,
        delayed,
        avgDays,
        hasBottleneck: clients.length >= 4 || atRisk > 0,
        clients,
      };
    });
  }, []);

  const selectedStageClients = useMemo(() => {
    if (selectedStage === null) return [];
    return formationClients.filter((c) => c.currentStage === selectedStage);
  }, [selectedStage]);

  const clientColumns: Column<FormationClient>[] = [
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
      render: (item) => <span className="text-sm">{item.state}</span>,
    },
    {
      key: "packageType",
      header: "Package",
      render: (item) => <StatusBadge status={item.packageType} variant="info" />,
    },
    {
      key: "assignedManager",
      header: "Manager",
      render: (item) => <PersonCell name={item.assignedManager} size="sm" />,
    },
    {
      key: "riskFlag",
      header: "Risk",
      render: (item) => (
        <StatusBadge
          status={item.riskFlag === "on-track" ? "On Track" : item.riskFlag === "at-risk" ? "At Risk" : "Delayed"}
          variant={riskVariantMap[item.riskFlag]}
        />
      ),
    },
    {
      key: "startDate",
      header: "Start Date",
      sortable: true,
      render: (item) => <span className="text-sm text-muted-foreground">{item.startDate}</span>,
    },
  ];

  return (
    <PageShell>
      <PageTransition>
        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 7 }).map((_, i) => (
              <StatsCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <>
            <Stagger className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {stageData.map((stage) => (
                <StaggerItem key={stage.id}>
                  <Card
                    className={`cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                      selectedStage === stage.number ? "ring-2 ring-primary" : ""
                    }`}
                    onClick={() => setSelectedStage(selectedStage === stage.number ? null : stage.number)}
                    data-testid={`card-stage-${stage.number}`}
                  >
                    <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="secondary"
                          className={`border-0 text-xs font-semibold ${stageColorMap[stage.number] || ""}`}
                        >
                          {stage.number}
                        </Badge>
                        <CardTitle className="text-sm font-medium">{stage.name}</CardTitle>
                      </div>
                      <ChevronRight className="size-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <Users className="size-3.5 text-muted-foreground" />
                          <span className="text-2xl font-bold font-heading" data-testid={`text-stage-count-${stage.number}`}>
                            {stage.clientCount}
                          </span>
                          <span className="text-xs text-muted-foreground">clients</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="size-3" />
                            ~{stage.avgDays}d avg
                          </span>
                          {stage.hasBottleneck && (
                            <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                              <AlertTriangle className="size-3" />
                              Bottleneck
                            </span>
                          )}
                        </div>
                        {(stage.atRisk > 0 || stage.delayed > 0) && (
                          <div className="flex items-center gap-2 mt-1">
                            {stage.atRisk > 0 && (
                              <StatusBadge status={`${stage.atRisk} at risk`} variant="error" />
                            )}
                            {stage.delayed > 0 && (
                              <StatusBadge status={`${stage.delayed} delayed`} variant="warning" />
                            )}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </StaggerItem>
              ))}
            </Stagger>

            {selectedStage !== null && (
              <div className="mt-6">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-lg font-semibold font-heading" data-testid="text-selected-stage-title">
                    Stage {selectedStage}: {stageDefinitions[selectedStage]?.name} — {selectedStageClients.length} Clients
                  </h3>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setSelectedStage(null)}
                    data-testid="button-clear-stage"
                  >
                    Clear
                  </Button>
                </div>
                <DataTable
                  data={selectedStageClients}
                  columns={clientColumns}
                  searchPlaceholder="Search clients in stage..."
                  onRowClick={(item) => navigate(`/hr/clients/${item.id}`)}
                />
              </div>
            )}
          </>
        )}
      </PageTransition>
    </PageShell>
  );
}
