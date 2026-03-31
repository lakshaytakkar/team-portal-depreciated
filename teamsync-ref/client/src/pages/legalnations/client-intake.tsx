import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { CheckCircle, ArrowRight } from "lucide-react";
import { DataTable, type Column } from "@/components/ds/data-table";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { StatusBadge } from "@/components/ds/status-badge";
import { StatsCard } from "@/components/ds/stats-card";
import { MiniStageStepper } from "@/components/ds/stage-stepper";
import { Button } from "@/components/ui/button";
import { formationClients, stageChecklists, clientDocuments } from "@/lib/mock-data";
import { stageDefinitions } from "@shared/schema";
import type { FormationClient } from "@shared/schema";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { PageTransition, Stagger, StaggerItem } from "@/components/ui/animated";
import { FileText, AlertTriangle, Users } from "lucide-react";
import { PageShell } from "@/components/layout";
import { PersonCell, CompanyCell } from "@/components/ui/avatar-cells";

const riskVariantMap: Record<string, "success" | "error" | "warning" | "neutral" | "info"> = {
  "on-track": "success",
  "delayed": "warning",
  "at-risk": "error",
};

export default function ClientIntakePage() {
  const loading = useSimulatedLoading();
  const [, navigate] = useLocation();

  const intakeClients = useMemo(
    () => formationClients.filter((c) => c.currentStage <= 1),
    []
  );

  const intakeClientsWithMeta = useMemo(() => {
    return intakeClients.map((client) => {
      const checklists = stageChecklists.filter(
        (c) => c.clientId === client.id && (c.stage === 0 || c.stage === 1)
      );
      const completed = checklists.filter((c) => c.completed).length;
      const total = checklists.length;
      const docs = clientDocuments.filter((d) => d.clientId === client.id);
      const hasPassport = docs.some((d) => d.category === "Passport" && d.status === "verified");
      const hasAddress = docs.some((d) => d.category === "Address Proof" && d.status === "verified");
      const missingItems: string[] = [];
      if (!hasPassport) missingItems.push("Passport");
      if (!hasAddress) missingItems.push("Address Proof");

      return {
        ...client,
        intakeCompleted: completed,
        intakeTotal: total,
        intakePercent: total > 0 ? Math.round((completed / total) * 100) : 0,
        missingItems,
        kycComplete: hasPassport && hasAddress,
      };
    });
  }, [intakeClients]);

  type IntakeClient = (typeof intakeClientsWithMeta)[0];

  const totalIntake = intakeClientsWithMeta.length;
  const kycComplete = intakeClientsWithMeta.filter((c) => c.kycComplete).length;
  const missingDocs = intakeClientsWithMeta.filter((c) => c.missingItems.length > 0).length;

  const columns: Column<IntakeClient>[] = [
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
      key: "currentStage",
      header: "Stage",
      render: (item) => (
        <div className="flex items-center gap-2">
          <MiniStageStepper currentStage={item.currentStage} />
          <span className="text-xs text-muted-foreground">{stageDefinitions[item.currentStage]?.name}</span>
        </div>
      ),
    },
    {
      key: "intakePercent",
      header: "Intake Progress",
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-16 rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${item.intakePercent}%` }}
            />
          </div>
          <span className="text-xs text-muted-foreground">{item.intakePercent}%</span>
        </div>
      ),
    },
    {
      key: "kycComplete",
      header: "KYC Status",
      render: (item) => (
        <StatusBadge
          status={item.kycComplete ? "Complete" : "Incomplete"}
          variant={item.kycComplete ? "success" : "warning"}
        />
      ),
    },
    {
      key: "missingItems",
      header: "Missing Docs",
      render: (item) =>
        item.missingItems.length > 0 ? (
          <span className="text-xs text-muted-foreground">{item.missingItems.join(", ")}</span>
        ) : (
          <span className="text-xs text-emerald-600 dark:text-emerald-400">All collected</span>
        ),
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
      key: "assignedManager",
      header: "Manager",
      render: (item) => <PersonCell name={item.assignedManager} size="sm" />,
    },
  ];

  return (
    <PageShell>
      <PageTransition>
        <Stagger className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StaggerItem>
            <StatsCard
              title="Intake Queue"
              value={totalIntake}
              icon={<Users className="size-5" />}
              change={`Stage 0-1 clients`}
              changeType="neutral"
            />
          </StaggerItem>
          <StaggerItem>
            <StatsCard
              title="KYC Complete"
              value={kycComplete}
              icon={<CheckCircle className="size-5" />}
              change={`${totalIntake > 0 ? Math.round((kycComplete / totalIntake) * 100) : 0}% of intake`}
              changeType="positive"
            />
          </StaggerItem>
          <StaggerItem>
            <StatsCard
              title="Missing Documents"
              value={missingDocs}
              icon={<AlertTriangle className="size-5" />}
              change={`Clients with gaps`}
              changeType={missingDocs > 0 ? "warning" : "positive"}
            />
          </StaggerItem>
        </Stagger>

        {loading ? (
          <TableSkeleton rows={6} columns={8} />
        ) : (
          <DataTable
            data={intakeClientsWithMeta}
            columns={columns}
            searchPlaceholder="Search intake clients..."
            onRowClick={(item) => navigate(`/hr/clients/${item.id}`)}
            rowActions={[
              {
                label: "Mark KYC Complete",
                onClick: () => {},
              },
              {
                label: "Move to Formation",
                onClick: () => {},
              },
              {
                label: "View Details",
                onClick: (item) => navigate(`/hr/clients/${item.id}`),
              },
            ]}
          />
        )}
      </PageTransition>
    </PageShell>
  );
}
