import { useState, useMemo } from "react";
import { TrendingUp, TrendingDown, AlertTriangle, IndianRupee } from "lucide-react";

import { DataTable, type Column } from "@/components/ds/data-table";
import { StatusBadge } from "@/components/ds/status-badge";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { hubBudgetItems, hubEvents, type BudgetItem } from "@/lib/mock-data-eventhub";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { PageTransition, Fade } from "@/components/ui/animated";
import { PageShell } from "@/components/layout";

const formatCurrency = (val: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(val);

const statusVariantMap: Record<string, "success" | "error" | "warning" | "neutral"> = {
  "on-track": "success",
  "over-budget": "error",
  "under-budget": "success",
  pending: "neutral",
};

const getEventName = (id: string) => hubEvents.find((e) => e.id === id)?.name ?? id;

const allCategories = Array.from(new Set(hubBudgetItems.map((b) => b.category)));

export default function HubBudget() {
  const loading = useSimulatedLoading();
  const [eventFilter, setEventFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = useMemo(() =>
    hubBudgetItems.filter((b) => {
      if (eventFilter !== "all" && b.eventId !== eventFilter) return false;
      if (categoryFilter !== "all" && b.category !== categoryFilter) return false;
      if (statusFilter !== "all" && b.status !== statusFilter) return false;
      return true;
    }),
    [eventFilter, categoryFilter, statusFilter]
  );

  const totalPlanned = filtered.reduce((s, b) => s + b.plannedAmount, 0);
  const totalActual = filtered.reduce((s, b) => s + b.actualAmount, 0);
  const variance = totalActual - totalPlanned;
  const overBudgetCount = filtered.filter((b) => b.status === "over-budget").length;

  const categoryTotals = allCategories.map((cat) => {
    const items = filtered.filter((b) => b.category === cat);
    return {
      category: cat,
      planned: items.reduce((s, b) => s + b.plannedAmount, 0),
      actual: items.reduce((s, b) => s + b.actualAmount, 0),
    };
  }).filter((c) => c.planned > 0 || c.actual > 0);

  const columns: Column<BudgetItem>[] = [
    {
      key: "eventId",
      header: "Event",
      render: (item) => (
        <Badge variant="outline" className="text-xs max-w-[180px] truncate block" data-testid={`badge-event-${item.id}`}>
          {getEventName(item.eventId)}
        </Badge>
      ),
    },
    { key: "category", header: "Category", sortable: true },
    { key: "description", header: "Description" },
    {
      key: "plannedAmount",
      header: "Planned (INR)",
      sortable: true,
      render: (item) => <span data-testid={`text-planned-${item.id}`}>{formatCurrency(item.plannedAmount)}</span>,
    },
    {
      key: "actualAmount",
      header: "Actual (INR)",
      sortable: true,
      render: (item) => (
        <span data-testid={`text-actual-${item.id}`}>
          {item.actualAmount > 0 ? formatCurrency(item.actualAmount) : <span className="text-muted-foreground">—</span>}
        </span>
      ),
    },
    {
      key: "plannedAmount",
      header: "Variance",
      render: (item) => {
        const v = item.actualAmount - item.plannedAmount;
        if (item.actualAmount === 0) return <span className="text-muted-foreground text-xs">—</span>;
        return (
          <span className={`text-sm font-medium ${v > 0 ? "text-red-600" : "text-green-600"}`} data-testid={`text-variance-${item.id}`}>
            {v > 0 ? "+" : ""}{formatCurrency(v)}
          </span>
        );
      },
    },
    {
      key: "status",
      header: "Status",
      render: (item) => (
        <StatusBadge
          status={undefined}
          variant={statusVariantMap[item.status]}
        />
      ),
    },
  ];

  return (
    <PageShell>
      <PageTransition>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground" data-testid="hub-budget-title">Budget Tracker</h1>
          <p className="text-sm text-muted-foreground">Track planned vs actual spend across all events</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-4 mb-6 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />)}
          </div>
        ) : (
          <Fade>
            <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <Card data-testid="stat-total-planned">
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground mb-1">Total Planned</p>
                  <p className="text-lg font-bold text-foreground">{formatCurrency(totalPlanned)}</p>
                </CardContent>
              </Card>
              <Card data-testid="stat-total-actual">
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground mb-1">Total Actual</p>
                  <p className="text-lg font-bold text-foreground">{formatCurrency(totalActual)}</p>
                </CardContent>
              </Card>
              <Card data-testid="stat-variance">
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground mb-1">Variance</p>
                  <p className={`text-lg font-bold flex items-center gap-1 ${variance > 0 ? "text-red-600" : "text-green-600"}`}>
                    {variance > 0 ? <TrendingUp className="size-4" /> : <TrendingDown className="size-4" />}
                    {variance > 0 ? "+" : ""}{formatCurrency(variance)}
                  </p>
                </CardContent>
              </Card>
              <Card data-testid="stat-over-budget">
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground mb-1">Over Budget Items</p>
                  <p className={`text-lg font-bold flex items-center gap-1 ${overBudgetCount > 0 ? "text-red-600" : "text-foreground"}`}>
                    {overBudgetCount > 0 && <AlertTriangle className="size-4" />}
                    {overBudgetCount}
                  </p>
                </CardContent>
              </Card>
            </div>
          </Fade>
        )}

        {!loading && categoryTotals.length > 0 && (
          <Fade delay={0.1}>
            <Card className="mb-6" data-testid="budget-by-category">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Budget by Category</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {categoryTotals.map((cat) => {
                  const usageRate = cat.planned > 0 ? Math.min(Math.round((cat.actual / cat.planned) * 100), 150) : 0;
                  const isOver = cat.actual > cat.planned;
                  return (
                    <div key={cat.category} data-testid={`row-category-${cat.category.replace(/\s+/g, "-").toLowerCase()}`}>
                      <div className="flex items-center justify-between mb-1 text-sm">
                        <span className="font-medium text-foreground">{cat.category}</span>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span>Planned: {formatCurrency(cat.planned)}</span>
                          {cat.actual > 0 && (
                            <span className={isOver ? "text-red-600 font-medium" : "text-green-600 font-medium"}>
                              Actual: {formatCurrency(cat.actual)}
                            </span>
                          )}
                        </div>
                      </div>
                      <Progress
                        value={Math.min(usageRate, 100)}
                        className={`h-2 ${isOver ? "[&>div]:bg-red-500" : "[&>div]:bg-green-500"}`}
                      />
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </Fade>
        )}

        <div className="mb-4 flex flex-wrap gap-3">
          <Select value={eventFilter} onValueChange={setEventFilter}>
            <SelectTrigger className="w-56" data-testid="filter-event">
              <SelectValue placeholder="Event" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Events</SelectItem>
              {hubEvents.map((e) => (
                <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-40" data-testid="filter-category">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {allCategories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40" data-testid="filter-status">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="on-track">On Track</SelectItem>
              <SelectItem value="over-budget">Over Budget</SelectItem>
              <SelectItem value="under-budget">Under Budget</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <TableSkeleton rows={10} columns={7} />
        ) : (
          <DataTable columns={columns} data={filtered} />
        )}
      </PageTransition>
    </PageShell>
  );
}
