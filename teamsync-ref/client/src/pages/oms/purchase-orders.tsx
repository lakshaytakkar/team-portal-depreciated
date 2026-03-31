import { PageTransition, Fade } from "@/components/ui/animated";
import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { Input } from "@/components/ui/input";
import { PersonCell, CompanyCell } from "@/components/ui/avatar-cells";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { omsPurchaseOrders, omsSuppliers } from "@/lib/mock-data-oms";
import { cn } from "@/lib/utils";
import { PageShell } from "@/components/layout";
import { verticals } from "@/lib/verticals-config";
import { SopModal, TutorialModal, SopTutorialButtons } from "@/components/sop/sop-modal";
import { SOP_REGISTRY } from "@/lib/sop-data";

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-slate-100 text-slate-600",
  sent: "bg-blue-100 text-blue-700",
  confirmed: "bg-cyan-100 text-cyan-700",
  "partially-received": "bg-amber-100 text-amber-700",
  received: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function OmsPurchaseOrders() {
  const loading = useSimulatedLoading(600);
  const [statusFilter, setStatusFilter] = useState("all");
  const [supplierFilter, setSupplierFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [sopOpen, setSopOpen] = useState(false);
  const [tutorialOpen, setTutorialOpen] = useState(false);

  const vertical = verticals.find((v) => v.id === "oms")!;

  const filtered = useMemo(() => {
    let list = [...omsPurchaseOrders].sort((a, b) => b.orderedDate.localeCompare(a.orderedDate));
    if (statusFilter !== "all") list = list.filter(po => po.status === statusFilter);
    if (supplierFilter !== "all") list = list.filter(po => po.supplierId === supplierFilter);
    if (search) list = list.filter(po =>
      po.poNumber.toLowerCase().includes(search.toLowerCase()) ||
      po.supplierName.toLowerCase().includes(search.toLowerCase())
    );
    return list;
  }, [statusFilter, supplierFilter, search]);

  const selectedPO = selected ? omsPurchaseOrders.find(po => po.id === selected) : null;

  if (loading) {
    return (
      <PageShell>
        <div className="h-14 w-72 bg-muted rounded-lg" />
        <div className="flex gap-4 h-96">
          <div className="w-64 bg-muted rounded-xl" />
          <div className="flex-1 bg-muted rounded-xl" />
        </div>
      </PageShell>
    );
  }

  return (
    <PageTransition>
      <div className="px-16 py-6 lg:px-24 space-y-5">
        <Fade>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold" data-testid="po-heading">Purchase Orders</h1>
                <span className="text-sm bg-cyan-100 text-cyan-700 font-semibold px-2.5 py-0.5 rounded-full">{filtered.length}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">Manage supplier POs and inbound stock receiving</p>
            </div>
            <div className="flex items-center gap-2">
              <SopTutorialButtons onSopClick={() => setSopOpen(true)} onTutorialClick={() => setTutorialOpen(true)} />
              <Button style={{ backgroundColor: "#0891B2" }} className="text-white hover:opacity-90" data-testid="btn-new-po">
                + New PO
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {(["all", "draft", "sent", "confirmed", "partially-received", "received", "cancelled"] as const).map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                data-testid={`filter-po-${s}`}
                className={cn("px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                  statusFilter === s ? "bg-cyan-600 text-white" : "bg-muted text-muted-foreground hover:bg-accent"
                )}
              >
                {s === "all" ? "All" : s === "partially-received" ? "Partial" : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
            <div className="flex-1" />
            <Select value={supplierFilter} onValueChange={setSupplierFilter}>
              <SelectTrigger className="w-48 h-9" data-testid="select-supplier">
                <SelectValue placeholder="Supplier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Suppliers</SelectItem>
                {omsSuppliers.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
              <Input className="pl-8 h-9 w-44" placeholder="Search PO..." value={search} onChange={e => setSearch(e.target.value)} data-testid="input-search-po" />
            </div>
          </div>
        </Fade>

        <div className="flex gap-4 items-start">
          <div className="w-72 border border-border rounded-xl bg-background overflow-hidden shrink-0">
            <div className="p-3 border-b border-border bg-muted/20">
              <p className="text-xs font-semibold text-muted-foreground">{filtered.length} Purchase Orders</p>
            </div>
            <div className="divide-y divide-border max-h-[600px] overflow-y-auto">
              {filtered.map(po => (
                <button
                  key={po.id}
                  onClick={() => setSelected(selected === po.id ? null : po.id)}
                  className={cn("w-full text-left p-3 hover:bg-muted/20 transition-colors", selected === po.id && "bg-cyan-50 border-l-2 border-cyan-500")}
                  data-testid={`po-list-item-${po.id}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-semibold text-cyan-700">{po.poNumber}</p>
                    <span className={cn("text-[10px] font-semibold px-1.5 py-0.5 rounded-full shrink-0", STATUS_STYLES[po.status])}>
                      {po.status === "partially-received" ? "Partial" : po.status}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 truncate">{po.supplierName}</p>
                  <div className="flex justify-between mt-1">
                    <span className="text-[10px] text-muted-foreground">{po.orderedDate}</span>
                    <span className="text-xs font-semibold">₹{po.totalAmount.toLocaleString()}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{po.lines.length} line{po.lines.length !== 1 ? "s" : ""}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1">
            {selectedPO ? (
              <div className="border border-border rounded-xl bg-background overflow-hidden">
                <div className="p-5 border-b border-border">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">{selectedPO.poNumber}</p>
                      <div className="mt-0.5"><CompanyCell name={selectedPO.supplierName} size="lg" /></div>
                    </div>
                    <span className={cn("text-sm font-semibold px-3 py-1 rounded-full", STATUS_STYLES[selectedPO.status])}>
                      {selectedPO.status === "partially-received" ? "Partially Received" : selectedPO.status.charAt(0).toUpperCase() + selectedPO.status.slice(1)}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mt-4 text-sm">
                    <div><p className="text-xs text-muted-foreground">Ordered Date</p><p className="font-medium">{selectedPO.orderedDate}</p></div>
                    <div><p className="text-xs text-muted-foreground">Expected Delivery</p><p className="font-medium">{selectedPO.expectedDate}</p></div>
                    <div><p className="text-xs text-muted-foreground">Created By</p><PersonCell name={selectedPO.createdBy} size="sm" /></div>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/20">
                        <th className="text-left py-3 px-5 text-xs font-medium text-muted-foreground">SKU</th>
                        <th className="text-left py-3 px-5 text-xs font-medium text-muted-foreground">Product</th>
                        <th className="text-right py-3 px-5 text-xs font-medium text-muted-foreground">Ordered</th>
                        <th className="text-right py-3 px-5 text-xs font-medium text-muted-foreground">Received</th>
                        <th className="text-right py-3 px-5 text-xs font-medium text-muted-foreground">Unit Cost</th>
                        <th className="text-right py-3 px-5 text-xs font-medium text-muted-foreground">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedPO.lines.map((line, idx) => {
                        const isPartial = line.receivedQty < line.orderedQty && line.receivedQty > 0;
                        const isNone = line.receivedQty === 0 && selectedPO.status !== "draft" && selectedPO.status !== "sent";
                        return (
                          <tr key={idx} className={cn("border-b border-border/50", isPartial && "bg-amber-50", isNone && selectedPO.status === "partially-received" && "bg-amber-50/40")}>
                            <td className="py-2.5 px-5 text-xs">{line.sku}</td>
                            <td className="py-2.5 px-5 text-xs">{line.productName}</td>
                            <td className="py-2.5 px-5 text-right text-xs font-medium">{line.orderedQty}</td>
                            <td className="py-2.5 px-5 text-right text-xs">
                              <span className={cn("font-semibold", line.receivedQty === line.orderedQty ? "text-emerald-600" : line.receivedQty > 0 ? "text-amber-600" : "text-muted-foreground")}>
                                {line.receivedQty}
                              </span>
                              {isPartial && <span className="text-[10px] text-amber-600 ml-1">(partial)</span>}
                            </td>
                            <td className="py-2.5 px-5 text-right text-xs text-muted-foreground">₹{line.unitCost.toLocaleString()}</td>
                            <td className="py-2.5 px-5 text-right text-xs font-semibold">₹{line.totalCost.toLocaleString()}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="border-t border-border bg-muted/10">
                        <td colSpan={5} className="py-3 px-5 text-right text-sm font-semibold">Total Amount</td>
                        <td className="py-3 px-5 text-right text-sm font-bold">₹{selectedPO.totalAmount.toLocaleString()}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
                <div className="p-5 border-t border-border flex gap-3">
                  {selectedPO.status === "draft" && (
                    <Button style={{ backgroundColor: "#0891B2" }} className="text-white hover:opacity-90" data-testid="btn-send-supplier">Send to Supplier</Button>
                  )}
                  {(selectedPO.status === "confirmed" || selectedPO.status === "partially-received") && (
                    <Button style={{ backgroundColor: "#059669" }} className="text-white hover:opacity-90" data-testid="btn-receive-stock">Receive Stock</Button>
                  )}
                  {selectedPO.receivedDate && (
                    <p className="text-xs text-muted-foreground self-center">Fully received on {selectedPO.receivedDate}</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="border border-border rounded-xl bg-background h-80 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-sm font-medium text-muted-foreground">No purchase order selected</p>
                  <p className="text-xs text-muted-foreground mt-1">Click a PO from the list to view details</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <SopModal open={sopOpen} onOpenChange={setSopOpen} config={SOP_REGISTRY["oms-purchase-orders"].sop} color={vertical.color} />
      <TutorialModal open={tutorialOpen} onOpenChange={setTutorialOpen} config={SOP_REGISTRY["oms-purchase-orders"].tutorial} color={vertical.color} />
    </PageTransition>
  );
}
