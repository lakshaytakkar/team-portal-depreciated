import { useState, useMemo } from "react";
import {
  IndianRupee,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Users,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { DataTable, type Column } from "@/components/ds/data-table";
import { StatsCard } from "@/components/ds/stats-card";
import { StatusBadge } from "@/components/ds/status-badge";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { CardSkeleton } from "@/components/ui/card-skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { PageTransition, Fade, Stagger, StaggerItem } from "@/components/ui/animated";
import { cn } from "@/lib/utils";
import { type EtsPayment } from "@/lib/mock-data-ets";
import { PageShell } from "@/components/layout";
import { PersonCell } from "@/components/ui/avatar-cells";
import { SopModal, TutorialModal, SopTutorialButtons } from "@/components/sop/sop-modal";
import { SOP_REGISTRY } from "@/lib/sop-data";
import { ETS_COLOR } from "@/lib/ets-config";

const paymentStatusVariant: Record<string, "success" | "error" | "warning" | "neutral" | "info"> = {
  received: "success",
  pending: "warning",
  overdue: "error",
};

const paymentTypeVariant: Record<string, "success" | "error" | "warning" | "neutral" | "info"> = {
  token: "info",
  milestone: "neutral",
  final: "success",
};

function formatCurrency(val: number): string {
  if (val >= 100000) {
    return `${(val / 100000).toFixed(1)}L`;
  }
  if (val >= 1000) {
    return `${(val / 1000).toFixed(0)}K`;
  }
  return val.toLocaleString("en-IN");
}

interface ClientPaymentSummary {
  clientId: string;
  clientName: string;
  totalReceived: number;
  totalPending: number;
  totalOverdue: number;
  payments: EtsPayment[];
}

export default function PaymentsPage() {
  const queryClient = useQueryClient();

  const { data: paymentsData, isLoading } = useQuery<{ payments: EtsPayment[] }>({
    queryKey: ['/api/ets/payments'],
  });

  const payments = paymentsData?.payments || [];

  const [sopOpen, setSopOpen] = useState(false);
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const [expandedClients, setExpandedClients] = useState<Set<string>>(new Set());

  const stats = useMemo(() => {
    const collected = payments
      .filter((p) => p.status === "received")
      .reduce((sum, p) => sum + p.amount, 0);
    const pending = payments
      .filter((p) => p.status === "pending")
      .reduce((sum, p) => sum + p.amount, 0);
    const overdue = payments
      .filter((p) => p.status === "overdue")
      .reduce((sum, p) => sum + p.amount, 0);
    const uniqueClients = new Set(payments.map((p) => p.clientId)).size;
    const avgPerClient = uniqueClients > 0 ? Math.round(collected / uniqueClients) : 0;

    return { collected, pending, overdue, avgPerClient };
  }, [payments]);

  const clientSummaries = useMemo(() => {
    const map = new Map<string, ClientPaymentSummary>();

    payments.forEach((p) => {
      if (!map.has(p.clientId)) {
        map.set(p.clientId, {
          clientId: p.clientId,
          clientName: p.clientName,
          totalReceived: 0,
          totalPending: 0,
          totalOverdue: 0,
          payments: [],
        });
      }
      const entry = map.get(p.clientId)!;
      entry.payments.push(p);
      if (p.status === "received") entry.totalReceived += p.amount;
      else if (p.status === "pending") entry.totalPending += p.amount;
      else if (p.status === "overdue") entry.totalOverdue += p.amount;
    });

    return Array.from(map.values()).sort(
      (a, b) => b.totalReceived + b.totalPending + b.totalOverdue - (a.totalReceived + a.totalPending + a.totalOverdue)
    );
  }, [payments]);

  const toggleClient = (clientId: string) => {
    setExpandedClients((prev) => {
      const next = new Set(prev);
      if (next.has(clientId)) next.delete(clientId);
      else next.add(clientId);
      return next;
    });
  };

  const columns: Column<EtsPayment>[] = [
    {
      key: "clientName",
      header: "Client",
      sortable: true,
      render: (item) => (
        <PersonCell name={item.clientName} size="sm" />
      ),
    },
    {
      key: "amount",
      header: "Amount",
      sortable: true,
      render: (item) => (
        <span className="text-sm font-semibold" data-testid={`text-payment-amount-${item.id}`}>
          {"\u20B9"}{item.amount.toLocaleString("en-IN")}
        </span>
      ),
    },
    {
      key: "type",
      header: "Type",
      render: (item) => (
        <StatusBadge
          status={item.type.charAt(0).toUpperCase() + item.type.slice(1)}
          variant={paymentTypeVariant[item.type]}
        />
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (item) => (
        <StatusBadge
          status={item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          variant={paymentStatusVariant[item.status]}
        />
      ),
    },
    {
      key: "date",
      header: "Date",
      sortable: true,
      render: (item) => (
        <span className="text-sm text-muted-foreground" data-testid={`text-payment-date-${item.id}`}>
          {item.date}
        </span>
      ),
    },
    {
      key: "notes",
      header: "Notes",
      render: (item) => (
        <span className="text-sm text-muted-foreground max-w-[200px] truncate block" data-testid={`text-payment-notes-${item.id}`}>
          {item.notes}
        </span>
      ),
    },
  ];

  return (
    <PageShell>
      <PageTransition>
        <Fade direction="down" distance={10} duration={0.3}>
          <div className="flex items-center justify-between gap-3 mb-1 flex-wrap">
            <h1 className="text-2xl font-bold font-heading" data-testid="text-page-title">
              Payments
            </h1>
            <div className="flex items-center gap-2 flex-wrap">
              <SopTutorialButtons onSopClick={() => setSopOpen(true)} onTutorialClick={() => setTutorialOpen(true)} />
            </div>
          </div>
          <p className="mb-5 text-sm text-muted-foreground" data-testid="text-page-description">
            Track collections, pending invoices, and overdue payments
          </p>
        </Fade>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <Stagger className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
            <StaggerItem>
              <StatsCard
                title="Total Collected"
                value={`\u20B9${formatCurrency(stats.collected)}`}
                icon={<CheckCircle2 className="size-5" />}
                changeType="positive"
              />
            </StaggerItem>
            <StaggerItem>
              <StatsCard
                title="Pending"
                value={`\u20B9${formatCurrency(stats.pending)}`}
                icon={<Clock className="size-5" />}
                changeType="warning"
              />
            </StaggerItem>
            <StaggerItem>
              <StatsCard
                title="Overdue"
                value={`\u20B9${formatCurrency(stats.overdue)}`}
                change={stats.overdue > 0 ? "Requires attention" : "All clear"}
                changeType={stats.overdue > 0 ? "negative" : "positive"}
                icon={<AlertTriangle className="size-5" />}
              />
            </StaggerItem>
            <StaggerItem>
              <StatsCard
                title="Avg per Client"
                value={`\u20B9${formatCurrency(stats.avgPerClient)}`}
                icon={<Users className="size-5" />}
              />
            </StaggerItem>
          </Stagger>
        )}

        {isLoading ? (
          <TableSkeleton rows={8} columns={6} />
        ) : (
          <DataTable
            data={payments}
            columns={columns}
            searchPlaceholder="Search payments..."
            filters={[
              {
                label: "Status",
                key: "status",
                options: ["received", "pending", "overdue"],
              },
              {
                label: "Type",
                key: "type",
                options: ["token", "milestone", "final"],
              },
            ]}
          />
        )}

        {!isLoading && (
          <Fade direction="up" distance={10} delay={0.2}>
            <div className="mt-6">
              <h2 className="mb-3 text-lg font-semibold font-heading" data-testid="text-section-client-summary">
                Per-Client Summary
              </h2>
              <div className="flex flex-col gap-3">
                {clientSummaries.map((cs) => {
                  const total = cs.totalReceived + cs.totalPending + cs.totalOverdue;
                  const receivedPct = total > 0 ? (cs.totalReceived / total) * 100 : 0;
                  const isExpanded = expandedClients.has(cs.clientId);

                  return (
                    <Card key={cs.clientId} data-testid={`card-client-summary-${cs.clientId}`}>
                      <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-2 p-4">
                        <div className="flex items-center gap-3 min-w-0 flex-1 flex-wrap">
                          <PersonCell name={cs.clientName} size="sm" />
                          <Badge variant="secondary" className="text-xs shrink-0">
                            {cs.payments.length} payments
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 flex-wrap">
                          <div className="flex items-center gap-2 text-xs flex-wrap">
                            <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                              {"\u20B9"}{formatCurrency(cs.totalReceived)}
                            </span>
                            {cs.totalPending > 0 && (
                              <span className="text-amber-600 dark:text-amber-400 font-medium">
                                {"\u20B9"}{formatCurrency(cs.totalPending)} pending
                              </span>
                            )}
                            {cs.totalOverdue > 0 && (
                              <span className="text-red-600 dark:text-red-400 font-medium">
                                {"\u20B9"}{formatCurrency(cs.totalOverdue)} overdue
                              </span>
                            )}
                          </div>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => toggleClient(cs.clientId)}
                            data-testid={`button-expand-${cs.clientId}`}
                          >
                            {isExpanded ? (
                              <ChevronDown className="size-4" />
                            ) : (
                              <ChevronRight className="size-4" />
                            )}
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="px-4 pb-3 pt-0">
                        <div className="h-1.5 w-full rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-emerald-500 transition-all"
                            style={{ width: `${receivedPct}%` }}
                          />
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {receivedPct.toFixed(0)}% collected of {"\u20B9"}{formatCurrency(total)} total
                        </p>

                        {isExpanded && (
                          <div className="mt-3 flex flex-col gap-2">
                            {cs.payments.map((p) => (
                              <div
                                key={p.id}
                                className="flex items-center justify-between gap-3 rounded-md border p-2.5 flex-wrap"
                                data-testid={`payment-detail-${p.id}`}
                              >
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-sm font-medium">
                                    {"\u20B9"}{p.amount.toLocaleString("en-IN")}
                                  </span>
                                  <StatusBadge
                                    status={p.type.charAt(0).toUpperCase() + p.type.slice(1)}
                                    variant={paymentTypeVariant[p.type]}
                                  />
                                  <StatusBadge
                                    status={p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                                    variant={paymentStatusVariant[p.status]}
                                  />
                                </div>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                                  <span>{p.date}</span>
                                  {p.notes && <span className="max-w-[150px] truncate">{p.notes}</span>}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </Fade>
        )}
      </PageTransition>
      <SopModal open={sopOpen} onOpenChange={setSopOpen} config={SOP_REGISTRY["ets-payments"].sop} color={ETS_COLOR} />
      <TutorialModal open={tutorialOpen} onOpenChange={setTutorialOpen} config={SOP_REGISTRY["ets-payments"].tutorial} color={ETS_COLOR} />
    </PageShell>
  );
}
