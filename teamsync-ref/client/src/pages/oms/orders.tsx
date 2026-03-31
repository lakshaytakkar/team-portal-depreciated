import { useState, useMemo } from "react";
import { ChevronDown, ChevronRight, Plus } from "lucide-react";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { Button } from "@/components/ui/button";
import { PersonCell } from "@/components/ui/avatar-cells";
import { omsOrders } from "@/lib/mock-data-oms";
import {
  PageShell,
  PageHeader,
  IndexToolbar,
  DataTableContainer,
  DataTH,
  DataTD,
  DataTR,
} from "@/components/layout";
import { StatusBadge } from "@/components/ds/status-badge";
import { verticals } from "@/lib/verticals-config";
import { SopModal, TutorialModal, SopTutorialButtons } from "@/components/sop/sop-modal";
import { SOP_REGISTRY } from "@/lib/sop-data";

export default function OmsOrders() {
  const loading = useSimulatedLoading(600);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [sopOpen, setSopOpen] = useState(false);
  const [tutorialOpen, setTutorialOpen] = useState(false);

  const vertical = verticals.find((v) => v.id === "oms")!;

  const filtered = useMemo(() => {
    let list = [...omsOrders].sort((a, b) => b.orderDate.localeCompare(a.orderDate));
    if (statusFilter !== "all") list = list.filter((o) => o.status === statusFilter);
    if (search)
      list = list.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
          o.customerName.toLowerCase().includes(search.toLowerCase()) ||
          o.city.toLowerCase().includes(search.toLowerCase())
      );
    return list;
  }, [statusFilter, search]);

  const filterOptions = [
    { value: "all", label: "All Orders" },
    { value: "pending", label: "Pending" },
    { value: "confirmed", label: "Confirmed" },
    { value: "dispatched", label: "Dispatched" },
    { value: "delivered", label: "Delivered" },
  ];

  return (
    <PageShell>
      <PageHeader
        title="Orders"
        subtitle={`${omsOrders.length} orders across all channels`}
        actions={
          <>
            <SopTutorialButtons onSopClick={() => setSopOpen(true)} onTutorialClick={() => setTutorialOpen(true)} />
            <Button
              className="gap-2"
              style={{ backgroundColor: vertical.color, color: "#fff" }}
              data-testid="btn-new-order"
            >
              <Plus className="h-4 w-4" />
              New Order
            </Button>
          </>
        }
      />

      <IndexToolbar
        search={search}
        onSearch={setSearch}
        filters={filterOptions}
        activeFilter={statusFilter}
        onFilter={setStatusFilter}
        color={vertical.color}
        placeholder="Search orders..."
      />

      {loading ? (
        <div className="space-y-4 animate-pulse">
          <div className="h-96 bg-muted rounded-xl" />
        </div>
      ) : (
        <DataTableContainer>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <DataTH className="w-10" />
                <DataTH>Order #</DataTH>
                <DataTH>Date</DataTH>
                <DataTH>Customer</DataTH>
                <DataTH>Type</DataTH>
                <DataTH align="right">Items</DataTH>
                <DataTH align="right">Amount</DataTH>
                <DataTH>Status</DataTH>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((order) => (
                <Fragment key={order.id}>
                  <DataTR
                    onClick={() => setExpanded(expanded === order.id ? null : order.id)}
                    data-testid={`row-order-${order.id}`}
                  >
                    <DataTD align="center">
                      {expanded === order.id ? (
                        <ChevronDown className="size-3.5 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="size-3.5 text-muted-foreground" />
                      )}
                    </DataTD>
                    <DataTD className="text-xs font-semibold text-cyan-700">
                      {order.orderNumber}
                    </DataTD>
                    <DataTD className="text-xs text-muted-foreground">{order.orderDate}</DataTD>
                    <DataTD>
                      <PersonCell name={order.customerName} subtitle={order.city} size="xs" />
                    </DataTD>
                    <DataTD>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase bg-blue-100 text-blue-700">
                        {order.type}
                      </span>
                    </DataTD>
                    <DataTD align="right">{order.lines.length}</DataTD>
                    <DataTD align="right" className="font-semibold">
                      ₹{order.totalAmount.toLocaleString()}
                    </DataTD>
                    <DataTD>
                      <StatusBadge status={order.status} />
                    </DataTD>
                  </DataTR>
                  {expanded === order.id && (
                    <tr className="bg-muted/10">
                      <td colSpan={8} className="px-6 py-4">
                        <div className="text-xs">
                          <p className="font-semibold mb-2">Order Details</p>
                          <p>Shipping Address: {order.shippingAddress}</p>
                          <p>Payment Mode: {order.paymentMode}</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </DataTableContainer>
      )}
      <SopModal open={sopOpen} onOpenChange={setSopOpen} config={SOP_REGISTRY["oms-orders"].sop} color={vertical.color} />
      <TutorialModal open={tutorialOpen} onOpenChange={setTutorialOpen} config={SOP_REGISTRY["oms-orders"].tutorial} color={vertical.color} />
    </PageShell>
  );
}

import { Fragment } from "react";
