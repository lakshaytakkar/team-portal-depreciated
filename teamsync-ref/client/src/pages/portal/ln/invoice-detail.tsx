import { useParams, Link } from "wouter";
import { ArrowLeft, Printer, Building2, CheckCircle2, Clock, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { LN_INVOICES, CLIENT_PROFILE } from "@/lib/mock-data-dashboard-ln";

function fmt(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function LnInvoiceDetail() {
  const params = useParams<{ invoiceId: string }>();
  const invoice = LN_INVOICES.find(i => i.id === params.invoiceId);

  if (!invoice) {
    return (
      <div className="p-6" data-testid="invoice-not-found">
        <Link href="/portal-ln/invoices">
          <Button variant="ghost" size="sm"><ArrowLeft className="size-4 mr-2" /> Back to Invoices</Button>
        </Link>
        <div className="text-center py-16">
          <h3 className="text-lg font-semibold mb-2">Invoice Not Found</h3>
          <p className="text-muted-foreground">The invoice could not be found.</p>
        </div>
      </div>
    );
  }

  const subtotal = invoice.lineItems.reduce((s, li) => s + li.amount, 0);

  return (
    <div className="p-6 space-y-4" data-testid="ln-invoice-detail-page">
      <div className="flex items-center gap-4 print:hidden">
        <Link href="/portal-ln/invoices">
          <Button variant="ghost" size="sm" data-testid="button-back-invoices">
            <ArrowLeft className="size-4 mr-2" /> Back to Invoices
          </Button>
        </Link>
        <div className="flex-1" />
        <Button variant="outline" size="sm" onClick={() => window.print()} data-testid="button-print-invoice">
          <Printer className="size-4 mr-2" /> Print / PDF
        </Button>
      </div>

      <Card className="rounded-xl border bg-white max-w-3xl mx-auto shadow-sm" data-testid="invoice-card">
        <CardContent className="p-8 space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="size-8 rounded-lg bg-blue-600 flex items-center justify-center">
                  <Building2 className="size-4 text-white" />
                </div>
                <span className="text-lg font-bold font-heading text-blue-600">LegalNations</span>
              </div>
              <p className="text-xs text-muted-foreground">123 Business Ave, Suite 400</p>
              <p className="text-xs text-muted-foreground">Wilmington, DE 19801</p>
              <p className="text-xs text-muted-foreground">support@legalnations.com</p>
            </div>
            <div className="text-right">
              <h2 className="text-2xl font-bold font-heading" data-testid="text-invoice-heading">INVOICE</h2>
              <p className="text-muted-foreground font-medium">{invoice.number}</p>
              <p className="text-sm text-muted-foreground mt-1">Date: {fmt(invoice.issuedAt)}</p>
              <Badge
                variant="outline"
                className={
                  invoice.status === "paid"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200 mt-2"
                    : invoice.status === "overdue"
                    ? "bg-red-50 text-red-700 border-red-200 mt-2"
                    : "bg-amber-50 text-amber-700 border-amber-200 mt-2"
                }
                data-testid="badge-invoice-status"
              >
                {invoice.status === "paid" ? "Paid" : invoice.status === "overdue" ? "Overdue" : "Pending"}
              </Badge>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Bill To</p>
              <p className="font-semibold" data-testid="text-client-name">{CLIENT_PROFILE.name}</p>
              <p className="text-sm text-muted-foreground">{CLIENT_PROFILE.email}</p>
              <p className="text-sm text-muted-foreground">{CLIENT_PROFILE.phone}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Details</p>
              <p className="text-sm"><span className="text-muted-foreground">Company:</span> <span className="font-medium">{invoice.companyName}</span></p>
              <p className="text-sm"><span className="text-muted-foreground">Due Date:</span> <span className="font-medium">{fmt(invoice.dueDate)}</span></p>
              {invoice.paidAt && (
                <p className="text-sm"><span className="text-muted-foreground">Paid:</span> <span className="font-medium text-emerald-600">{fmt(invoice.paidAt)}</span></p>
              )}
            </div>
          </div>

          <Separator />

          <div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 font-semibold text-muted-foreground">#</th>
                  <th className="text-left py-2 font-semibold text-muted-foreground">Description</th>
                  <th className="text-right py-2 font-semibold text-muted-foreground">Amount</th>
                </tr>
              </thead>
              <tbody>
                {invoice.lineItems.map((item, idx) => (
                  <tr key={item.id} className="border-b border-muted/50" data-testid={`line-item-${item.id}`}>
                    <td className="py-2.5 text-muted-foreground">{idx + 1}</td>
                    <td className="py-2.5 font-medium">{item.description}</td>
                    <td className="py-2.5 text-right font-medium">{item.amount === 0 ? "Free" : `$${item.amount}`}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end">
            <div className="w-64 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span data-testid="text-subtotal">${subtotal}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-base">
                <span>Total</span>
                <span data-testid="text-total">${invoice.amount}</span>
              </div>
            </div>
          </div>

          <Separator />

          <div data-testid="payment-history">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Payment History</p>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="size-7 rounded-full bg-blue-50 flex items-center justify-center">
                  <CreditCard className="size-3.5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Invoice Created</p>
                  <p className="text-xs text-muted-foreground">{fmt(invoice.issuedAt)}</p>
                </div>
              </div>
              {invoice.status === "overdue" && (
                <div className="flex items-center gap-3">
                  <div className="size-7 rounded-full bg-red-50 flex items-center justify-center">
                    <Clock className="size-3.5 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-700">Payment Overdue</p>
                    <p className="text-xs text-muted-foreground">Due date was {fmt(invoice.dueDate)}</p>
                  </div>
                </div>
              )}
              {invoice.paidAt && (
                <div className="flex items-center gap-3">
                  <div className="size-7 rounded-full bg-emerald-50 flex items-center justify-center">
                    <CheckCircle2 className="size-3.5 text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-emerald-700">Payment Received</p>
                    <p className="text-xs text-muted-foreground">{fmt(invoice.paidAt)} via Wire Transfer — ${invoice.amount} USD</p>
                  </div>
                </div>
              )}
              {!invoice.paidAt && invoice.status !== "overdue" && (
                <div className="flex items-center gap-3">
                  <div className="size-7 rounded-full bg-amber-50 flex items-center justify-center">
                    <Clock className="size-3.5 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-amber-700">Awaiting Payment</p>
                    <p className="text-xs text-muted-foreground">Due by {fmt(invoice.dueDate)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <Separator />

          <div className="text-center text-xs text-muted-foreground">
            <p>Thank you for choosing LegalNations!</p>
            <p>For any queries, contact us at support@legalnations.com</p>
          </div>
        </CardContent>
      </Card>

      <style>{`
        @media print {
          .print\\:hidden { display: none !important; }
          body { -webkit-print-color-adjust: exact; }
        }
      `}</style>
    </div>
  );
}
