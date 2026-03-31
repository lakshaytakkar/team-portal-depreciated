import { Shield, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { StatsCard } from "@/components/ds/stats-card";
import { StatusBadge } from "@/components/ds/status-badge";
import { DataTable, type Column } from "@/components/ds/data-table";
import { Badge } from "@/components/ui/badge";
import { StatsCardSkeleton } from "@/components/ui/card-skeleton";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { complianceItems } from "@/lib/mock-data";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { Stagger, StaggerItem, PageTransition } from "@/components/ui/animated";
import type { ComplianceItem } from "@shared/schema";
import { cn } from "@/lib/utils";
import { PageShell } from "@/components/layout";
import { CompanyCell } from "@/components/ui/avatar-cells";

const typeLabels: Record<string, string> = {
  "annual-report": "Annual Report",
  "boi-recheck": "BOI Recheck",
  "irs-compliance": "IRS Compliance",
  "state-alert": "State Alert",
};

const statusVariantMap: Record<string, "success" | "error" | "warning"> = {
  completed: "success",
  overdue: "error",
  upcoming: "warning",
};

const columns: Column<ComplianceItem>[] = [
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
      <Badge
        variant="secondary"
        className="text-xs font-medium px-2 py-0.5 border-0"
        data-testid={`badge-compliance-type-${item.id}`}
      >
        {typeLabels[item.type] || item.type}
      </Badge>
    ),
  },
  {
    key: "dueDate",
    header: "Due Date",
    sortable: true,
    render: (item) => {
      const isOverdue = item.status === "overdue";
      const dueDate = new Date(item.dueDate);
      const now = new Date();
      const daysUntil = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      const isSoon = daysUntil > 0 && daysUntil <= 30;
      return (
        <div className="flex flex-col gap-0.5">
          <span className={cn("text-sm", isOverdue && "text-red-600 dark:text-red-400 font-medium")}>
            {item.dueDate}
          </span>
          {isOverdue && (
            <span className="text-[11px] text-red-500 dark:text-red-400">Overdue</span>
          )}
          {isSoon && item.status !== "completed" && (
            <span className="text-[11px] text-amber-600 dark:text-amber-400">Due in {daysUntil}d</span>
          )}
        </div>
      );
    },
  },
  {
    key: "state",
    header: "State",
    sortable: true,
    render: (item) => (
      <span className="text-sm" data-testid={`text-compliance-state-${item.id}`}>{item.state}</span>
    ),
  },
  {
    key: "status",
    header: "Status",
    render: (item) => (
      <StatusBadge
        status={item.status.charAt(0).toUpperCase() + item.status.slice(1)}
        variant={statusVariantMap[item.status]}
      />
    ),
  },
  {
    key: "notes",
    header: "Notes",
    render: (item) => (
      <span className="text-xs text-muted-foreground max-w-xs truncate block" data-testid={`text-compliance-notes-${item.id}`}>
        {item.notes}
      </span>
    ),
  },
];

export default function ComplianceTrackerPage() {
  const loading = useSimulatedLoading();

  const totalTracked = complianceItems.length;
  const overdue = complianceItems.filter((c) => c.status === "overdue").length;
  const completed = complianceItems.filter((c) => c.status === "completed").length;
  const upcoming30 = complianceItems.filter((c) => {
    if (c.status !== "upcoming") return false;
    const dueDate = new Date(c.dueDate);
    const now = new Date();
    const daysUntil = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntil <= 30 && daysUntil > 0;
  }).length;

  const types = Array.from(new Set(complianceItems.map((c) => c.type)));
  const statuses = Array.from(new Set(complianceItems.map((c) => c.status)));
  const states = Array.from(new Set(complianceItems.map((c) => c.state))).sort();

  return (
    <PageShell>
      <PageTransition>
{loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
          </div>
        ) : (
          <Stagger staggerInterval={0.05} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StaggerItem>
              <StatsCard
                title="Upcoming (30 days)"
                value={upcoming30}
                change="Due within 30 days"
                changeType="warning"
                icon={<Clock className="size-5" />}
              />
            </StaggerItem>
            <StaggerItem>
              <StatsCard
                title="Overdue"
                value={overdue}
                change="Requires immediate action"
                changeType="negative"
                icon={<AlertTriangle className="size-5" />}
              />
            </StaggerItem>
            <StaggerItem>
              <StatsCard
                title="Completed"
                value={completed}
                change="Successfully filed"
                changeType="positive"
                icon={<CheckCircle className="size-5" />}
              />
            </StaggerItem>
            <StaggerItem>
              <StatsCard
                title="Total Tracked"
                value={totalTracked}
                change={`${types.length} compliance types`}
                changeType="neutral"
                icon={<Shield className="size-5" />}
              />
            </StaggerItem>
          </Stagger>
        )}

        <div className="mt-6">
          {loading ? (
            <TableSkeleton rows={8} columns={6} />
          ) : (
            <DataTable
              data={complianceItems}
              columns={columns}
              searchPlaceholder="Search compliance items..."
              searchKey="companyName"
              filters={[
                { label: "Type", key: "type", options: types },
                { label: "Status", key: "status", options: statuses },
                { label: "State", key: "state", options: states },
              ]}
              pageSize={10}
              emptyTitle="No compliance items"
              emptyDescription="No compliance items are being tracked."
            />
          )}
        </div>
      </PageTransition>
    </PageShell>
  );
}
