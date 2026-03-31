import { DataTable, type Column } from "@/components/ds/data-table";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { StatusBadge } from "@/components/ds/status-badge";
import { supportTickets, type SupportTicket } from "@/lib/mock-data-sales";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { PageTransition } from "@/components/ui/animated";
import { PageShell } from "@/components/layout";
import { PersonCell } from "@/components/ui/avatar-cells";

const priorityVariantMap: Record<string, "success" | "error" | "warning" | "neutral" | "info"> = {
  low: "neutral",
  medium: "warning",
  high: "error",
  urgent: "error",
};

const statusVariantMap: Record<string, "success" | "error" | "warning" | "neutral" | "info"> = {
  open: "info",
  "in-progress": "warning",
  resolved: "success",
  closed: "neutral",
};

const categoryVariantMap: Record<string, "success" | "error" | "warning" | "neutral" | "info"> = {
  billing: "warning",
  technical: "info",
  product: "neutral",
  account: "success",
};

export default function TicketsPage() {
  const loading = useSimulatedLoading();

  const columns: Column<SupportTicket>[] = [
    {
      key: "id",
      header: "Ticket ID",
      sortable: true,
      render: (item) => (
        <span className="text-xs font-medium text-muted-foreground">{item.id}</span>
      ),
    },
    {
      key: "subject",
      header: "Subject",
      sortable: true,
      render: (item) => (
        <span className="text-sm font-medium" data-testid={`text-subject-${item.id}`}>{item.subject}</span>
      ),
    },
    {
      key: "user",
      header: "User",
      sortable: true,
      render: (item) => <PersonCell name={item.user} size="sm" />,
    },
    {
      key: "priority",
      header: "Priority",
      render: (item) => (
        <StatusBadge
          status={item.priority.charAt(0).toUpperCase() + item.priority.slice(1)}
          variant={priorityVariantMap[item.priority]}
        />
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (item) => (
        <StatusBadge
          status={item.status.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
          variant={statusVariantMap[item.status]}
        />
      ),
    },
    {
      key: "category",
      header: "Category",
      render: (item) => (
        <StatusBadge
          status={item.category.charAt(0).toUpperCase() + item.category.slice(1)}
          variant={categoryVariantMap[item.category]}
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
      render: (item) => <PersonCell name={item.assignedTo} size="xs" />,
    },
  ];

  return (
    <PageShell>
      <PageTransition>
        {loading ? (
          <TableSkeleton rows={8} columns={8} />
        ) : (
          <DataTable
            data={supportTickets}
            columns={columns}
            searchPlaceholder="Search tickets..."
            searchKey="subject"
            filters={[
              { label: "Priority", key: "priority", options: ["low", "medium", "high", "urgent"] },
              { label: "Status", key: "status", options: ["open", "in-progress", "resolved", "closed"] },
              { label: "Category", key: "category", options: ["billing", "technical", "product", "account"] },
            ]}
          />
        )}
      </PageTransition>
    </PageShell>
  );
}
