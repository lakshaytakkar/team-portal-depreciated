import { useState } from "react";
import { Link } from "wouter";
import {
  CheckCircle2, Clock, AlertTriangle, Download, Loader2,
  Receipt, ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { LN_INVOICES, type LnInvoice } from "@/lib/mock-data-dashboard-ln";

const STATUS_TABS = [
  { id: "all", label: "All" },
  { id: "pending", label: "Pending" },
  { id: "paid", label: "Paid" },
  { id: "overdue", label: "Overdue" },
];

const statusConfig: Record<string, { label: string; icon: typeof CheckCircle2; cls: string }> = {
  paid: { label: "Paid", icon: CheckCircle2, cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  pending: { label: "Pending", icon: Clock, cls: "bg-amber-50 text-amber-700 border-amber-200" },
  overdue: { label: "Overdue", icon: AlertTriangle, cls: "bg-red-50 text-red-700 border-red-200" },
};

function fmt(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function LnInvoices() {
  const { toast } = useToast();
  const [tab, setTab] = useState("all");
  const [payingId, setPayingId] = useState<string | null>(null);
  const [paidIds, setPaidIds] = useState<Set<string>>(new Set());

  const filtered = LN_INVOICES.filter(inv => {
    if (tab === "all") return true;
    if (paidIds.has(inv.id)) return tab === "paid";
    return inv.status === tab;
  });

  const totalPaid = LN_INVOICES.filter(i => i.status === "paid" || paidIds.has(i.id)).reduce((s, i) => s + i.amount, 0);
  const totalPending = LN_INVOICES.filter(i => i.status === "pending" && !paidIds.has(i.id)).reduce((s, i) => s + i.amount, 0);
  const totalOverdue = LN_INVOICES.filter(i => i.status === "overdue" && !paidIds.has(i.id)).reduce((s, i) => s + i.amount, 0);

  function handlePay(inv: LnInvoice) {
    setPayingId(inv.id);
    setTimeout(() => {
      setPayingId(null);
      setPaidIds(prev => { const next = new Set(prev); next.add(inv.id); return next; });
      toast({ title: "Payment Successful", description: `Invoice ${inv.number} has been paid — $${inv.amount}` });
    }, 2000);
  }

  function getStatus(inv: LnInvoice) {
    if (paidIds.has(inv.id)) return "paid";
    return inv.status;
  }

  return (
    <div className="p-6 space-y-6" data-testid="ln-invoices-page">
      <div>
        <h1 className="text-2xl font-bold font-heading" data-testid="text-page-title">Invoices & Payments</h1>
        <p className="text-sm text-muted-foreground mt-1">View your billing history and outstanding invoices</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="p-5 border-t-2 border-t-emerald-500">
          <p className="text-xs font-medium text-muted-foreground mb-1">Total Paid</p>
          <p className="text-2xl font-bold text-emerald-700" data-testid="text-total-paid">${totalPaid.toLocaleString()}</p>
        </Card>
        <Card className="p-5 border-t-2 border-t-amber-500">
          <p className="text-xs font-medium text-muted-foreground mb-1">Pending</p>
          <p className="text-2xl font-bold text-amber-700" data-testid="text-total-pending">${totalPending.toLocaleString()}</p>
        </Card>
        <Card className="p-5 border-t-2 border-t-red-500">
          <p className="text-xs font-medium text-muted-foreground mb-1">Overdue</p>
          <p className="text-2xl font-bold text-red-700" data-testid="text-total-overdue">${totalOverdue.toLocaleString()}</p>
        </Card>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="h-9" data-testid="tabs-status">
          {STATUS_TABS.map(t => (
            <TabsTrigger key={t.id} value={t.id} className="text-xs" data-testid={`tab-${t.id}`}>
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="space-y-3">
        {filtered.map(inv => {
          const status = getStatus(inv);
          const st = statusConfig[status];
          const isPaying = payingId === inv.id;
          return (
            <Card key={inv.id} className="p-5" data-testid={`invoice-row-${inv.id}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-bold" data-testid={`text-inv-number-${inv.id}`}>{inv.number}</p>
                    <Badge variant="outline" className={cn("text-[10px]", st.cls)} data-testid={`badge-inv-status-${inv.id}`}>{st.label}</Badge>
                  </div>
                  <p className="text-sm">{inv.description}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{inv.companyName}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span>Issued: {fmt(inv.issuedAt)}</span>
                    <span>Due: {fmt(inv.dueDate)}</span>
                    {(inv.paidAt || paidIds.has(inv.id)) && (
                      <span className="text-emerald-600">Paid: {inv.paidAt ? fmt(inv.paidAt) : "Just now"}</span>
                    )}
                  </div>
                </div>
                <div className="text-right shrink-0 ml-4">
                  <p className="text-xl font-bold">${inv.amount}</p>
                  <p className="text-xs text-muted-foreground">USD</p>
                  <div className="flex gap-2 mt-2">
                    {status === "pending" && (
                      <Button
                        size="sm"
                        className="h-7 text-xs bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={() => handlePay(inv)}
                        disabled={isPaying}
                        data-testid={`button-pay-${inv.id}`}
                      >
                        {isPaying ? <><Loader2 className="size-3 animate-spin mr-1" /> Processing...</> : "Pay Now"}
                      </Button>
                    )}
                    <Link href={`/portal-ln/invoices/${inv.id}`}>
                      <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" data-testid={`button-view-inv-${inv.id}`}>
                        Details <ArrowRight className="size-3" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <Receipt className="size-8 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">No invoices found in this category</p>
          </div>
        )}
      </div>
    </div>
  );
}
