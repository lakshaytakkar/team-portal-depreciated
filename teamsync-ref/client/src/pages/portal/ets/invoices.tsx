import { useEtsSidebar } from "@/components/layout/ets-subnav-sidebar";
import { Link } from "wouter";
import { FileText, Download, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import {
  ETS_PORTAL_COLOR,
} from "@/lib/mock-data-portal-ets";
import { useEtsOrders } from "@/lib/ets-order-store";

export default function EtsPortalInvoices() {
  const inSidebar = useEtsSidebar();
  const [searchTerm, setSearchTerm] = useState("");
  const { invoices } = useEtsOrders();

  const filtered = invoices.filter((inv) =>
    !searchTerm || (inv.number || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={inSidebar ? "p-5 space-y-5" : "px-16 lg:px-24 py-6 space-y-6"} data-testid="ets-portal-invoices">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading" data-testid="text-invoices-title">Invoices</h1>
          <p className="text-muted-foreground">View and download your invoices.</p>
        </div>
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search invoices..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
            data-testid="input-search-invoices"
          />
        </div>
      </div>

      <Card className="rounded-xl border bg-card">
        <CardHeader>
          <CardTitle>All Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2" data-testid="text-empty-title">No Invoices Found</h3>
              <p className="text-muted-foreground max-w-md">
                {searchTerm ? "No invoices match your search." : "Invoices will appear here once payments are processed."}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Download</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((inv) => (
                  <TableRow key={inv.id} data-testid={`row-invoice-${inv.id}`}>
                    <TableCell className="font-medium">{inv.number}</TableCell>
                    <TableCell>{inv.date || "—"}</TableCell>
                    <TableCell>{inv.description || "Invoice"}</TableCell>
                    <TableCell>₹{(inv.amount || 0).toLocaleString("en-IN")}</TableCell>
                    <TableCell>
                      <Badge
                        variant={inv.status === "paid" ? "outline" : "destructive"}
                        className={inv.status === "paid" ? "bg-green-50 text-green-700 border-green-200" : ""}
                        data-testid={`status-invoice-${inv.id}`}
                      >
                        {inv.status === "paid" ? "Paid" : "Pending"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/portal-ets/invoices/${inv.id}`}>
                        <Button variant="ghost" size="sm" data-testid={`button-download-${inv.id}`}>
                          <Download className="h-4 w-4" />
                        </Button>
                      </Link>
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
