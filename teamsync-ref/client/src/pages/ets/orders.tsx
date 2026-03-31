import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import {
  Package,
  Truck,
  CheckCircle2,
  IndianRupee,
  AlertTriangle,
  FileText,
  Flag,
  Check,
} from "lucide-react";
import { DataTable, type Column } from "@/components/ds/data-table";
import { StatsCard } from "@/components/ds/stats-card";
import { StatusBadge } from "@/components/ds/status-badge";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { CardSkeleton } from "@/components/ui/card-skeleton";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { PageTransition, Fade, Stagger, StaggerItem } from "@/components/ui/animated";
import { cn } from "@/lib/utils";
import {
  ETS_ORDER_STATUSES,
  ETS_ORDER_STATUS_LABELS,
  type EtsOrder,
  type EtsOrderStatus,
  type EtsOrderDocument,
} from "@/lib/mock-data-ets";
import { useToast } from "@/hooks/use-toast";
import { PageShell } from "@/components/layout";
import { PersonCell } from "@/components/ui/avatar-cells";
import { SopModal, TutorialModal, SopTutorialButtons } from "@/components/sop/sop-modal";
import { SOP_REGISTRY } from "@/lib/sop-data";
import { ETS_COLOR } from "@/lib/ets-config";

const ORDER_STATUS_STEPS: EtsOrderStatus[] = [
  "ordered",
  "factory-ready",
  "shipped",
  "customs",
  "warehouse",
  "dispatched",
];

const statusVariantMap: Record<EtsOrderStatus, "success" | "error" | "warning" | "neutral" | "info"> = {
  ordered: "neutral",
  "factory-ready": "info",
  shipped: "warning",
  customs: "warning",
  warehouse: "info",
  dispatched: "success",
};

function getStatusIndex(status: EtsOrderStatus): number {
  return ORDER_STATUS_STEPS.indexOf(status);
}

function MiniOrderStepper({ status }: { status: EtsOrderStatus }) {
  const currentIdx = getStatusIndex(status);

  return (
    <div className="flex items-center gap-0.5" data-testid="mini-order-stepper">
      {ORDER_STATUS_STEPS.map((step, i) => {
        const isDone = i < currentIdx;
        const isCurrent = i === currentIdx;

        return (
          <div key={step} className="flex items-center gap-0.5">
            {i > 0 && (
              <div
                className={cn(
                  "h-0.5 w-2",
                  isDone ? "bg-emerald-500" : isCurrent ? "bg-blue-400" : "bg-muted"
                )}
              />
            )}
            <div
              className={cn(
                "flex size-4 shrink-0 items-center justify-center rounded-full text-[8px] font-medium",
                isDone && "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
                isCurrent && "bg-blue-100 text-blue-700 ring-1 ring-blue-400/40 dark:bg-blue-950 dark:text-blue-300",
                !isDone && !isCurrent && "bg-muted text-muted-foreground"
              )}
              title={ETS_ORDER_STATUS_LABELS[step]}
              data-testid={`mini-order-step-${step}`}
            >
              {isDone ? <Check className="size-2.5" /> : i + 1}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function formatCurrency(val: number): string {
  if (val >= 100000) {
    return `${(val / 100000).toFixed(1)}L`;
  }
  if (val >= 1000) {
    return `${(val / 1000).toFixed(0)}K`;
  }
  return val.toLocaleString("en-IN");
}

export default function OrdersPage() {
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const { data: ordersData, isLoading } = useQuery<{ orders: EtsOrder[] }>({
    queryKey: ['/api/ets/orders'],
  });

  const orders = ordersData?.orders || [];

  const [sopOpen, setSopOpen] = useState(false);
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const [docsDialog, setDocsDialog] = useState<{ open: boolean; order: EtsOrder | null }>({
    open: false,
    order: null,
  });

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string | number; status: EtsOrderStatus }) => {
      await apiRequest("PATCH", `/api/ets/orders/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ets/orders'] });
    },
  });

  const flagMutation = useMutation({
    mutationFn: async ({ id, is_flagged }: { id: string | number; is_flagged: boolean }) => {
      await apiRequest("PATCH", `/api/ets/orders/${id}`, { is_flagged });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ets/orders'] });
    },
  });

  const stats = useMemo(() => {
    const totalOrders = orders.length;
    const inTransitCount = orders.filter(
      (o) => !["dispatched"].includes(o.status)
    ).length;
    const deliveredCount = orders.filter((o) => o.status === "dispatched").length;
    const totalValue = orders.reduce((sum, o) => sum + o.valueInr, 0);

    return { totalOrders, inTransitCount, deliveredCount, totalValue };
  }, [orders]);

  const handleStatusChange = (orderId: string | number, newStatus: EtsOrderStatus) => {
    statusMutation.mutate({ id: orderId, status: newStatus });
    toast({
      title: "Status Updated",
      description: `Order ${orderId} moved to ${ETS_ORDER_STATUS_LABELS[newStatus]}`,
    });
  };

  const handleFlagToggle = (orderId: string | number) => {
    const order = orders.find((o) => o.id === orderId);
    flagMutation.mutate({ id: orderId, is_flagged: !order?.isFlagged });
    toast({
      title: order?.isFlagged ? "Flag Removed" : "Order Flagged",
      description: `Order ${orderId} has been ${order?.isFlagged ? "unflagged" : "flagged for delay"}`,
    });
  };

  const clientNames = useMemo(
    () => Array.from(new Set(orders.map((o) => o.clientName))),
    [orders]
  );

  const columns: Column<EtsOrder>[] = [
    {
      key: "id",
      header: "Order ID",
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium" data-testid={`text-order-id-${item.id}`}>
            {item.id}
          </span>
          {item.isFlagged && (
            <AlertTriangle className="size-3.5 text-amber-500" />
          )}
        </div>
      ),
    },
    {
      key: "clientName",
      header: "Client",
      sortable: true,
      render: (item) => (
        <button
          className="text-sm font-medium text-primary underline-offset-2 hover:underline"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/ets/clients/${item.clientId}`);
          }}
          data-testid={`link-client-${item.clientId}`}
        >
          <PersonCell name={item.clientName} size="sm" />
        </button>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (item) => (
        <div className="flex flex-col gap-1.5">
          <StatusBadge
            status={ETS_ORDER_STATUS_LABELS[item.status]}
            variant={statusVariantMap[item.status]}
          />
          <MiniOrderStepper status={item.status} />
        </div>
      ),
    },
    {
      key: "etaDays",
      header: "ETA",
      sortable: true,
      render: (item) => {
        if (item.status === "dispatched") {
          return (
            <span className="text-sm text-emerald-600 dark:text-emerald-400" data-testid={`text-eta-${item.id}`}>
              Delivered
            </span>
          );
        }
        const maxEta = 50;
        const progress = Math.max(0, Math.min(100, ((maxEta - item.etaDays) / maxEta) * 100));
        return (
          <div className="flex flex-col gap-1 min-w-[80px]" data-testid={`text-eta-${item.id}`}>
            <span className="text-sm font-medium">{item.etaDays} days</span>
            <div className="h-1.5 w-full rounded-full bg-muted">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  item.etaDays <= 5 ? "bg-emerald-500" : item.etaDays <= 15 ? "bg-blue-500" : "bg-amber-500"
                )}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        );
      },
    },
    {
      key: "valueInr",
      header: "Value",
      sortable: true,
      render: (item) => (
        <span className="text-sm font-medium" data-testid={`text-value-${item.id}`}>
          {"\u20B9"}{item.valueInr.toLocaleString("en-IN")}
        </span>
      ),
    },
    {
      key: "itemCount",
      header: "Items",
      sortable: true,
      render: (item) => (
        <span className="text-sm text-muted-foreground">{item.itemCount}</span>
      ),
    },
    {
      key: "documents",
      header: "Docs",
      render: (item) => (
        <Button
          size="sm"
          variant="ghost"
          className="gap-1"
          onClick={(e) => {
            e.stopPropagation();
            setDocsDialog({ open: true, order: item });
          }}
          disabled={item.documents.length === 0}
          data-testid={`button-docs-${item.id}`}
        >
          <FileText className="size-3.5" />
          <span>{item.documents.length}</span>
        </Button>
      ),
    },
    {
      key: "createdDate",
      header: "Created",
      sortable: true,
      render: (item) => (
        <span className="text-sm text-muted-foreground">{item.createdDate}</span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (item) => (
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <Select
            value={item.status}
            onValueChange={(val) => handleStatusChange(item.id, val as EtsOrderStatus)}
          >
            <SelectTrigger
              className="h-8 w-auto min-w-[110px] text-xs"
              data-testid={`select-status-${item.id}`}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ETS_ORDER_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {ETS_ORDER_STATUS_LABELS[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            size="icon"
            variant={item.isFlagged ? "destructive" : "ghost"}
            onClick={() => handleFlagToggle(item.id)}
            data-testid={`button-flag-${item.id}`}
          >
            <Flag className="size-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  const docTypeLabels: Record<string, string> = {
    "packing-list": "Packing List",
    invoice: "Invoice",
    "bill-of-lading": "Bill of Lading",
    "customs-declaration": "Customs Declaration",
  };

  return (
    <PageShell>
      <PageTransition>
        <Fade direction="down" distance={10} duration={0.3}>
          <div className="flex items-center justify-between gap-3 mb-1 flex-wrap">
            <h1 className="text-2xl font-bold font-heading" data-testid="text-page-title">
              Order Tracker
            </h1>
            <div className="flex items-center gap-2 flex-wrap">
              <SopTutorialButtons onSopClick={() => setSopOpen(true)} onTutorialClick={() => setTutorialOpen(true)} />
            </div>
          </div>
          <p className="mb-5 text-sm text-muted-foreground" data-testid="text-page-description">
            Track orders from factory to delivery
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
                title="Total Orders"
                value={stats.totalOrders}
                icon={<Package className="size-5" />}
              />
            </StaggerItem>
            <StaggerItem>
              <StatsCard
                title="In Transit"
                value={stats.inTransitCount}
                change={`${orders.filter((o) => o.isFlagged).length} flagged`}
                changeType={orders.some((o) => o.isFlagged) ? "warning" : "neutral"}
                icon={<Truck className="size-5" />}
              />
            </StaggerItem>
            <StaggerItem>
              <StatsCard
                title="Delivered"
                value={stats.deliveredCount}
                icon={<CheckCircle2 className="size-5" />}
              />
            </StaggerItem>
            <StaggerItem>
              <StatsCard
                title="Total Value"
                value={`\u20B9${formatCurrency(stats.totalValue)}`}
                icon={<IndianRupee className="size-5" />}
              />
            </StaggerItem>
          </Stagger>
        )}

        {isLoading ? (
          <TableSkeleton rows={8} columns={9} />
        ) : (
          <DataTable
            data={orders}
            columns={columns}
            searchPlaceholder="Search orders..."
            filters={[
              {
                label: "Status",
                key: "status",
                options: [...ETS_ORDER_STATUSES],
              },
              {
                label: "Client",
                key: "clientName",
                options: clientNames,
              },
            ]}
          />
        )}

        <Dialog
          open={docsDialog.open}
          onOpenChange={(open) => setDocsDialog({ open, order: open ? docsDialog.order : null })}
        >
          <DialogContent data-testid="dialog-documents">
            <DialogHeader>
              <DialogTitle data-testid="text-docs-title">
                Documents — {docsDialog.order?.id}
              </DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-2 pt-2">
              {docsDialog.order?.documents.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  No documents attached
                </p>
              ) : (
                docsDialog.order?.documents.map((doc: EtsOrderDocument, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 rounded-md border p-3"
                    data-testid={`doc-item-${idx}`}
                  >
                    <FileText className="size-4 shrink-0 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{doc.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {docTypeLabels[doc.type] || doc.type}
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-xs shrink-0">
                      {docTypeLabels[doc.type] || doc.type}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </DialogContent>
        </Dialog>
      </PageTransition>
      <SopModal open={sopOpen} onOpenChange={setSopOpen} config={SOP_REGISTRY["ets-orders"].sop} color={ETS_COLOR} />
      <TutorialModal open={tutorialOpen} onOpenChange={setTutorialOpen} config={SOP_REGISTRY["ets-orders"].tutorial} color={ETS_COLOR} />
    </PageShell>
  );
}
