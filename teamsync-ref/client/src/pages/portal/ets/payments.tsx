import { useQuery } from "@tanstack/react-query";
import { useEtsSidebar } from "@/components/layout/ets-subnav-sidebar";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  portalEtsClient,
  ETS_PORTAL_COLOR,
} from "@/lib/mock-data-portal-ets";

function PaymentsSkeleton() {
  return (
    <div className="p-5 space-y-5">
      <Skeleton className="h-10 w-48" />
      <div className="grid md:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-28 rounded-xl" />)}
      </div>
      <Skeleton className="h-64 rounded-xl" />
    </div>
  );
}

export default function EtsPortalPayments() {
  const inSidebar = useEtsSidebar();
  const clientId = portalEtsClient.id;

  const { data: paymentsData, isLoading } = useQuery<{ payments: any[] }>({
    queryKey: ['/api/ets-portal/client', clientId, 'payments'],
  });

  if (isLoading) return <PaymentsSkeleton />;

  const payments = paymentsData?.payments || [];
  const totalPaid = payments.filter((p: any) => p.status === "received").reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
  const totalDue = payments.filter((p: any) => p.status === "pending" || p.status === "overdue").reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
  const nextDue = payments.find((p: any) => p.status === "pending" || p.status === "overdue");

  return (
    <div className={inSidebar ? "p-5 space-y-5" : "px-16 lg:px-24 py-6 space-y-6"} data-testid="ets-portal-payments">
      <div>
        <h1 className="text-2xl font-bold font-heading" data-testid="text-payments-title">Payments</h1>
        <p className="text-muted-foreground">Track your investment and download invoices.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="rounded-xl border bg-green-50 dark:bg-green-900/10 border-green-100 dark:border-green-900">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-green-800 dark:text-green-300">Total Paid</p>
            <p className="text-2xl font-bold font-heading text-green-700 dark:text-green-400 mt-2" data-testid="text-total-paid">
              {"\u20B9"}{totalPaid.toLocaleString("en-IN")}
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-xl border bg-amber-50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-900">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-amber-800 dark:text-amber-300">Total Due</p>
            <p className="text-2xl font-bold font-heading text-amber-700 dark:text-amber-400 mt-2" data-testid="text-total-due">
              {"\u20B9"}{totalDue.toLocaleString("en-IN")}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Next Payment Due</p>
              <p className="text-lg font-bold mt-1" data-testid="text-next-due">{nextDue ? nextDue.date || "Soon" : "None"}</p>
            </div>
            <Button style={{ backgroundColor: ETS_PORTAL_COLOR }} className="text-white" data-testid="button-pay-now">Pay Now</Button>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-xl border bg-card">
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground" data-testid="text-empty-payments">No payments found.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((p: any) => (
                  <TableRow key={p.id} data-testid={`row-payment-${p.id}`}>
                    <TableCell className="font-medium">{p.id}</TableCell>
                    <TableCell>{p.date || "—"}</TableCell>
                    <TableCell>{p.type || "General"}</TableCell>
                    <TableCell>{p.method || "—"}</TableCell>
                    <TableCell>{"\u20B9"}{(p.amount || 0).toLocaleString("en-IN")}</TableCell>
                    <TableCell>
                      <Badge
                        variant={p.status === "received" ? "outline" : "destructive"}
                        className={p.status === "received" ? "bg-green-50 text-green-700 border-green-200" : ""}
                        data-testid={`status-payment-${p.id}`}
                      >
                        {p.status === "received" ? "Paid" : p.status === "pending" ? "Pending" : p.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {p.status === "received" && (
                        <Button variant="ghost" size="sm" data-testid={`button-download-${p.id}`}>
                          <Download className="h-4 w-4 mr-2" /> Invoice
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
