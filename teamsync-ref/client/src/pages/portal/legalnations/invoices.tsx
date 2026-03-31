import { DollarSign, CheckCircle2, Clock, AlertTriangle, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ds/status-badge";
import { cn } from "@/lib/utils";
import { PageTransition } from "@/components/ui/animated";
import { portalInvoices } from "@/lib/mock-data-portal-legalnations";

const statusConfig: Record<string, { label: string; icon: typeof CheckCircle2; variant: "success" | "warning" | "error" }> = {
  paid: { label: "Paid", icon: CheckCircle2, variant: "success" },
  pending: { label: "Pending", icon: Clock, variant: "warning" },
  overdue: { label: "Overdue", icon: AlertTriangle, variant: "error" },
};

export default function PortalInvoices() {
  const totalPaid = portalInvoices.filter(i => i.status === "paid").reduce((s, i) => s + i.amount, 0);
  const totalPending = portalInvoices.filter(i => i.status === "pending").reduce((s, i) => s + i.amount, 0);
  const totalOverdue = portalInvoices.filter(i => i.status === "overdue").reduce((s, i) => s + i.amount, 0);

  return (
    <PageTransition className="px-4 sm:px-8 py-6 lg:px-24 space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading">Invoices & Payments</h1>
        <p className="text-sm text-muted-foreground mt-1">View your billing history and outstanding invoices</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5 border-t-2 border-t-emerald-500">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Total Paid</p>
              <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">${totalPaid.toLocaleString()}</p>
            </div>
            <div className="size-9 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <CheckCircle2 className="size-4 text-emerald-600" />
            </div>
          </div>
        </Card>
        <Card className="p-5 border-t-2 border-t-amber-500">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Pending</p>
              <p className="text-2xl font-bold text-amber-700 dark:text-amber-400">${totalPending.toLocaleString()}</p>
            </div>
            <div className="size-9 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <Clock className="size-4 text-amber-600" />
            </div>
          </div>
        </Card>
        <Card className="p-5 border-t-2 border-t-red-500">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Overdue</p>
              <p className="text-2xl font-bold text-red-700 dark:text-red-400">${totalOverdue.toLocaleString()}</p>
            </div>
            <div className="size-9 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <AlertTriangle className="size-4 text-red-600" />
            </div>
          </div>
        </Card>
      </div>

      <div className="space-y-3">
        {portalInvoices.map(inv => {
          const st = statusConfig[inv.status];
          return (
            <Card key={inv.id} className="p-5" data-testid={`invoice-${inv.id}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-bold">{inv.number}</p>
                    <StatusBadge status={st.label} variant={st.variant} />
                  </div>
                  <p className="text-sm">{inv.description}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span>Issued: {new Date(inv.issuedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                    <span>Due: {new Date(inv.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                    {inv.paidAt && (
                      <span className="text-emerald-600">Paid: {new Date(inv.paidAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                    )}
                  </div>
                </div>
                <div className="text-right shrink-0 ml-4">
                  <p className="text-xl font-bold">${inv.amount}</p>
                  <p className="text-xs text-muted-foreground">{inv.currency}</p>
                  <div className="flex gap-2 mt-2">
                    {inv.status !== "paid" && (
                      <Button size="sm" className="h-7 text-xs bg-blue-600 hover:bg-blue-700" data-testid={`pay-${inv.id}`}>
                        Pay Now
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" className="h-7 w-7" data-testid={`download-invoice-${inv.id}`}>
                      <Download className="size-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </PageTransition>
  );
}
