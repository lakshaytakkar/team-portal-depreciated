import { useMemo } from "react";
import { DataTable, type Column, type RowAction } from "@/components/ds/data-table";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { StatsCard } from "@/components/ds/stats-card";
import { StatusBadge } from "@/components/ds/status-badge";
import { PageTransition, Stagger, StaggerItem, Fade } from "@/components/ui/animated";
import { StatsCardSkeleton } from "@/components/ui/card-skeleton";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { useToast } from "@/hooks/use-toast";
import { escalations } from "@/lib/mock-data";
import type { Escalation } from "@shared/schema";
import { AlertTriangle, ShieldAlert, AlertCircle, CheckCircle2 } from "lucide-react";
import { PageShell } from "@/components/layout";
import { PersonCell, CompanyCell } from "@/components/ui/avatar-cells";

const typeLabels: Record<Escalation["type"], string> = {
  delayed: "Delayed",
  "missing-docs": "Missing Docs",
  "irs-rejection": "IRS Rejection",
  "bank-rejection": "Bank Rejection",
  "client-unresponsive": "Client Unresponsive",
};

const typeVariants: Record<Escalation["type"], "error" | "warning" | "info" | "neutral"> = {
  delayed: "warning",
  "missing-docs": "warning",
  "irs-rejection": "error",
  "bank-rejection": "error",
  "client-unresponsive": "neutral",
};

export default function Escalations() {
  const loading = useSimulatedLoading();
  const { showSuccess } = useToast();

  const stats = useMemo(() => {
    const open = escalations.filter((e) => !e.resolvedDate).length;
    const critical = escalations.filter((e) => e.severity === "critical" && !e.resolvedDate).length;
    const warning = escalations.filter((e) => e.severity === "warning" && !e.resolvedDate).length;
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const resolvedThisWeek = escalations.filter(
      (e) => e.resolvedDate && new Date(e.resolvedDate) >= weekAgo
    ).length;
    return { open, critical, warning, resolvedThisWeek };
  }, []);

  const columns: Column<Escalation>[] = [
    {
      key: "companyName",
      header: "Company",
      sortable: true,
      render: (item) => (
        <CompanyCell name={item.companyName} size="sm" />
      ),
    },
    {
      key: "type",
      header: "Type",
      render: (item) => (
        <StatusBadge
          status={typeLabels[item.type]}
          variant={typeVariants[item.type]}
        />
      ),
    },
    {
      key: "severity",
      header: "Severity",
      sortable: true,
      render: (item) => (
        <StatusBadge
          status={item.severity === "critical" ? "Critical" : "Warning"}
          variant={item.severity === "critical" ? "error" : "warning"}
        />
      ),
    },
    {
      key: "createdDate",
      header: "Created",
      sortable: true,
      render: (item) => <span className="text-sm text-muted-foreground">{item.createdDate}</span>,
    },
    {
      key: "assignedTo",
      header: "Assigned To",
      sortable: true,
      render: (item) => <PersonCell name={item.assignedTo} size="sm" />,
    },
    {
      key: "resolvedDate",
      header: "Status",
      render: (item) => (
        <StatusBadge
          status={item.resolvedDate ? "Resolved" : "Open"}
          variant={item.resolvedDate ? "success" : "warning"}
        />
      ),
    },
    {
      key: "notes",
      header: "Notes",
      render: (item) => (
        <span className="text-xs text-muted-foreground line-clamp-2 max-w-[240px]">
          {item.notes}
        </span>
      ),
    },
  ];

  const rowActions: RowAction<Escalation>[] = [
    {
      label: "View Details",
      onClick: (item) => {
        showSuccess("Escalation Details", `Viewing escalation for ${item.companyName}`);
      },
    },
    {
      label: "Mark Resolved",
      onClick: (item) => {
        showSuccess("Escalation Resolved", `Marked escalation for ${item.companyName} as resolved`);
      },
    },
  ];

  return (
    <PageShell>
      <PageTransition>
{loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <StatsCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <Stagger className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6" staggerInterval={0.06}>
            <StaggerItem>
              <StatsCard
                title="Total Open"
                value={stats.open}
                icon={<AlertTriangle className="size-5" />}
                change={`${stats.open} unresolved`}
                changeType={stats.open > 5 ? "negative" : "warning"}
              />
            </StaggerItem>
            <StaggerItem>
              <StatsCard
                title="Critical"
                value={stats.critical}
                icon={<ShieldAlert className="size-5" />}
                change={stats.critical > 0 ? "Immediate action needed" : "No critical issues"}
                changeType={stats.critical > 0 ? "negative" : "positive"}
              />
            </StaggerItem>
            <StaggerItem>
              <StatsCard
                title="Warning"
                value={stats.warning}
                icon={<AlertCircle className="size-5" />}
                change="Monitor closely"
                changeType="warning"
              />
            </StaggerItem>
            <StaggerItem>
              <StatsCard
                title="Resolved This Week"
                value={stats.resolvedThisWeek}
                icon={<CheckCircle2 className="size-5" />}
                change="Last 7 days"
                changeType="positive"
              />
            </StaggerItem>
          </Stagger>
        )}

        <Fade direction="up" distance={10} delay={0.2}>
          {loading ? (
            <TableSkeleton rows={8} columns={6} />
          ) : (
            <DataTable
              data={escalations}
              columns={columns}
              searchPlaceholder="Search escalations..."
              searchKey="companyName"
              rowActions={rowActions}
              filters={[
                {
                  label: "Type",
                  key: "type",
                  options: ["delayed", "missing-docs", "irs-rejection", "bank-rejection", "client-unresponsive"],
                },
                {
                  label: "Severity",
                  key: "severity",
                  options: ["critical", "warning"],
                },
              ]}
              emptyTitle="No escalations found"
              emptyDescription="There are no escalations matching your filters."
            />
          )}
        </Fade>
      </PageTransition>
    </PageShell>
  );
}
