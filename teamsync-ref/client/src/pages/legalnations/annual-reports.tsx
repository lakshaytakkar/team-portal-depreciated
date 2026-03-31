import { Calendar, FileText, AlertTriangle, CheckCircle } from "lucide-react";
import { StatsCard } from "@/components/ds/stats-card";
import { StatusBadge } from "@/components/ds/status-badge";
import { DataTable, type Column } from "@/components/ds/data-table";
import { StatsCardSkeleton } from "@/components/ui/card-skeleton";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { complianceItems } from "@/lib/mock-data";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { Fade, Stagger, StaggerItem, PageTransition } from "@/components/ui/animated";
import type { ComplianceItem } from "@shared/schema";
import { cn } from "@/lib/utils";
import { PageShell } from "@/components/layout";
import { CompanyCell } from "@/components/ui/avatar-cells";

const annualReports = complianceItems.filter((c) => c.type === "annual-report");

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
    key: "state",
    header: "State",
    sortable: true,
    render: (item) => (
      <span className="text-sm" data-testid={`text-ar-state-${item.id}`}>{item.state}</span>
    ),
  },
  {
    key: "dueDate",
    header: "Due Date",
    sortable: true,
    render: (item) => {
      const isOverdue = item.status === "overdue";
      return (
        <span className={cn("text-sm", isOverdue && "text-red-600 dark:text-red-400 font-medium")} data-testid={`text-ar-due-${item.id}`}>
          {item.dueDate}
        </span>
      );
    },
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
      <span className="text-xs text-muted-foreground max-w-xs truncate block" data-testid={`text-ar-notes-${item.id}`}>
        {item.notes}
      </span>
    ),
  },
];

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function getMonthCalendarData() {
  const calendar: Record<string, ComplianceItem[]> = {};
  for (const month of monthNames) {
    calendar[month] = [];
  }
  for (const report of annualReports) {
    const date = new Date(report.dueDate);
    const month = monthNames[date.getMonth()];
    if (calendar[month]) {
      calendar[month].push(report);
    }
  }
  return calendar;
}

export default function AnnualReportsPage() {
  const loading = useSimulatedLoading();

  const totalReports = annualReports.length;
  const upcoming = annualReports.filter((r) => r.status === "upcoming").length;
  const overdue = annualReports.filter((r) => r.status === "overdue").length;
  const completed = annualReports.filter((r) => r.status === "completed").length;

  const calendarData = getMonthCalendarData();
  const states = Array.from(new Set(annualReports.map((r) => r.state))).sort();
  const statuses = Array.from(new Set(annualReports.map((r) => r.status)));

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
                title="Total Reports"
                value={totalReports}
                change="Annual reports tracked"
                changeType="neutral"
                icon={<FileText className="size-5" />}
              />
            </StaggerItem>
            <StaggerItem>
              <StatsCard
                title="Upcoming"
                value={upcoming}
                change="Scheduled filings"
                changeType="warning"
                icon={<Calendar className="size-5" />}
              />
            </StaggerItem>
            <StaggerItem>
              <StatsCard
                title="Overdue"
                value={overdue}
                change={overdue > 0 ? "Action required" : "All on track"}
                changeType={overdue > 0 ? "negative" : "positive"}
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
          </Stagger>
        )}

        <div className="mt-6">
          {loading ? (
            <div className="rounded-lg border bg-background p-5">
              <Skeleton className="h-4 w-1/3 mb-4" />
              <div className="grid grid-cols-4 gap-3">
                {Array.from({ length: 12 }).map((_, i) => (
                  <Skeleton key={i} className="h-20" />
                ))}
              </div>
            </div>
          ) : (
            <Fade direction="up" delay={0.1}>
              <div className="rounded-lg border bg-background" data-testid="section-calendar-view">
                <div className="border-b px-5 py-4">
                  <h3 className="text-base font-semibold font-heading">Filing Calendar</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Annual report due dates by month</p>
                </div>
                <div className="grid grid-cols-3 gap-px bg-border p-px sm:grid-cols-4 lg:grid-cols-6">
                  {monthNames.map((month) => {
                    const items = calendarData[month];
                    return (
                      <div
                        key={month}
                        className={cn(
                          "flex flex-col gap-1.5 bg-background p-3 min-h-[100px]",
                          items.length > 0 && "bg-primary/[0.02]"
                        )}
                        data-testid={`calendar-month-${month.toLowerCase()}`}
                      >
                        <span className="text-xs font-semibold text-muted-foreground">{month}</span>
                        {items.map((item) => (
                          <div key={item.id} className="flex items-center gap-1">
                            <div
                              className={cn(
                                "size-1.5 shrink-0 rounded-full",
                                item.status === "overdue" && "bg-red-500",
                                item.status === "upcoming" && "bg-amber-500",
                                item.status === "completed" && "bg-emerald-500"
                              )}
                            />
                            <span className="text-[11px] text-foreground truncate" data-testid={`text-calendar-item-${item.id}`}>
                              {item.companyName.split(" ")[0]}
                            </span>
                          </div>
                        ))}
                        {items.length === 0 && (
                          <span className="text-[10px] text-muted-foreground/50">No filings</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </Fade>
          )}
        </div>

        <div className="mt-6">
          {loading ? (
            <TableSkeleton rows={6} columns={5} />
          ) : (
            <DataTable
              data={annualReports}
              columns={columns}
              searchPlaceholder="Search annual reports..."
              searchKey="companyName"
              filters={[
                { label: "Status", key: "status", options: statuses },
                { label: "State", key: "state", options: states },
              ]}
              pageSize={10}
              emptyTitle="No annual reports"
              emptyDescription="No annual report filings are being tracked."
            />
          )}
        </div>
      </PageTransition>
    </PageShell>
  );
}
