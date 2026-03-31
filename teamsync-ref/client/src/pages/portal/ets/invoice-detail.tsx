import { useParams, Link } from "wouter";
import { ArrowLeft, Printer, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ETS_PORTAL_COLOR } from "@/lib/mock-data-portal-ets";
import { useEtsOrders } from "@/lib/ets-order-store";
import { useEtsSidebar } from "@/components/layout/ets-subnav-sidebar";

export default function EtsInvoiceDetail() {
  const params = useParams<{ invoiceId: string }>();
  const { getInvoice } = useEtsOrders();
  const invoice = getInvoice(params.invoiceId);
  const inSidebar = useEtsSidebar();
  const containerClass = inSidebar ? "p-5 space-y-4" : "px-16 lg:px-24 py-6 space-y-4";

  if (!invoice) {
    return (
      <div className={containerClass} data-testid="invoice-not-found">
        <Link href="/portal-ets/invoices">
          <Button variant="ghost" className="mb-4"><ArrowLeft className="h-4 w-4 mr-2" /> Back to Invoices</Button>
        </Link>
        <div className="text-center py-16">
          <h3 className="text-lg font-semibold mb-2">Invoice Not Found</h3>
          <p className="text-muted-foreground">The invoice {params.invoiceId} could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={containerClass} data-testid="ets-invoice-detail">
      <div className="flex items-center gap-4 print:hidden">
        <Link href="/portal-ets/invoices">
          <Button variant="ghost" size="sm" data-testid="button-back-invoices">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Invoices
          </Button>
        </Link>
        <div className="flex-1" />
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.print()}
          data-testid="button-print-invoice"
        >
          <Printer className="h-4 w-4 mr-2" /> Print / Download
        </Button>
      </div>

      <Card className="rounded-xl border bg-white max-w-3xl mx-auto shadow-sm" data-testid="invoice-card">
        <CardContent className="p-8 space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: ETS_PORTAL_COLOR }}>
                  <Building2 className="h-4 w-4 text-white" />
                </div>
                <span className="text-lg font-bold font-heading" style={{ color: ETS_PORTAL_COLOR }}>EazyToSell</span>
              </div>
              <p className="text-xs text-muted-foreground">Plot 12, Sector 18, Gurugram, Haryana - 122015</p>
              <p className="text-xs text-muted-foreground">GSTIN: 06AABCE0396F1Z3</p>
              <p className="text-xs text-muted-foreground">support@easytosell.in</p>
            </div>
            <div className="text-right">
              <h2 className="text-2xl font-bold font-heading text-foreground" data-testid="text-invoice-number">INVOICE</h2>
              <p className="text-muted-foreground font-medium">{invoice.number}</p>
              <p className="text-sm text-muted-foreground mt-1">Date: {invoice.date}</p>
              <Badge
                className={invoice.status === "paid" ? "bg-green-50 text-green-700 border-green-200 mt-2" : "bg-yellow-50 text-yellow-700 border-yellow-200 mt-2"}
                variant="outline"
                data-testid="badge-invoice-status"
              >
                {invoice.status === "paid" ? "Paid" : "Pending"}
              </Badge>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Bill To</p>
              <p className="font-semibold" data-testid="text-partner-name">{invoice.partnerName}</p>
              <p className="text-sm text-muted-foreground">{invoice.partnerAddress}</p>
              <p className="text-sm text-muted-foreground">GSTIN: {invoice.partnerGst}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Payment Info</p>
              <p className="text-sm"><span className="text-muted-foreground">Order:</span> <span className="font-medium">{invoice.orderId}</span></p>
              <p className="text-sm"><span className="text-muted-foreground">Method:</span> <span className="font-medium">{invoice.paymentMethod}</span></p>
              <p className="text-sm"><span className="text-muted-foreground">Ref:</span> <span className="font-mono text-xs">{invoice.paymentReference}</span></p>
            </div>
          </div>

          <Separator />

          <div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 font-semibold text-muted-foreground">#</th>
                  <th className="text-left py-2 font-semibold text-muted-foreground">Product</th>
                  <th className="text-right py-2 font-semibold text-muted-foreground">Qty</th>
                  <th className="text-right py-2 font-semibold text-muted-foreground">Unit Price</th>
                  <th className="text-right py-2 font-semibold text-muted-foreground">Amount</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item, idx) => (
                  <tr key={item.id} className="border-b border-muted/50" data-testid={`invoice-item-${item.id}`}>
                    <td className="py-2.5 text-muted-foreground">{idx + 1}</td>
                    <td className="py-2.5">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.category}</p>
                    </td>
                    <td className="py-2.5 text-right">{item.quantity}</td>
                    <td className="py-2.5 text-right">₹{item.price.toLocaleString("en-IN")}</td>
                    <td className="py-2.5 text-right font-medium">₹{item.lineTotal.toLocaleString("en-IN")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end">
            <div className="w-64 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span data-testid="text-invoice-subtotal">₹{invoice.subtotal.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">GST (18%)</span>
                <span data-testid="text-invoice-gst">₹{invoice.gst.toLocaleString("en-IN")}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-base">
                <span>Grand Total</span>
                <span data-testid="text-invoice-grand-total">₹{invoice.grandTotal.toLocaleString("en-IN")}</span>
              </div>
            </div>
          </div>

          <Separator />

          <div className="text-center text-xs text-muted-foreground">
            <p>Thank you for your business with EazyToSell!</p>
            <p>For any queries, contact us at support@easytosell.in</p>
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
