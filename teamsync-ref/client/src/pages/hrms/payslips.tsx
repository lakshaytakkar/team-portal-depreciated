import { useState } from "react";
import { Download } from "lucide-react";
import { PageTransition, Fade } from "@/components/ui/animated";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SmallDetailModal } from "@/components/blocks/detail-view-blocks";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { PersonCell } from "@/components/ui/avatar-cells";
import { payrollEntries } from "@/lib/mock-data-hrms";
import { PageShell } from "@/components/layout";

const processedSlips = payrollEntries.filter(p => p.status === "processed");

export default function HrmsPayslips() {
  const isLoading = useSimulatedLoading(600);
  const [selected, setSelected] = useState<(typeof processedSlips)[0] | null>(null);

  if (isLoading) {
    return (
      <PageShell>
        <div className="h-10 bg-muted rounded w-48" />
        {[...Array(6)].map((_, i) => <div key={i} className="h-14 bg-muted rounded-xl" />)}
      </PageShell>
    );
  }

  return (
    <PageTransition className="px-16 py-6 lg:px-24 space-y-5">
      <Fade>
        <div>
          <h1 className="text-2xl font-bold">Payslips</h1>
          <p className="text-sm text-muted-foreground">{processedSlips.length} processed payslips</p>
        </div>
      </Fade>

      <Fade>
        <Card className="border-0 shadow-sm overflow-hidden">
          <CardContent className="p-0">
            <table className="w-full">
              <thead className="border-b bg-muted/30">
                <tr>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Employee</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Month</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Net Pay</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {processedSlips.map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-muted/20 cursor-pointer"
                    onClick={() => setSelected(p)}
                    data-testid={`payslip-row-${p.id}`}
                  >
                    <td className="px-4 py-3"><PersonCell name={p.employeeName} size="sm" /></td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{p.month}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-emerald-600">₹{p.netSalary.toLocaleString("en-IN")}</td>
                    <td className="px-4 py-3">
                      <Button variant="outline" size="sm" className="h-7 px-2 text-xs" onClick={(e) => e.stopPropagation()} data-testid={`download-slip-${p.id}`}>
                        <Download className="size-3 mr-1" /> Download
                      </Button>
                    </td>
                  </tr>
                ))}
                {processedSlips.length === 0 && <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground text-sm">No processed payslips yet</td></tr>}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </Fade>

      {selected && (
        <SmallDetailModal
          open={!!selected}
          onClose={() => setSelected(null)}
          title={`Payslip — ${selected.month}`}
          subtitle={selected.employeeName}
          size="sm"
          footer={
            <Button className="w-full bg-sky-600 hover:bg-sky-700" data-testid="download-payslip">
              <Download className="size-4 mr-2" /> Download PDF
            </Button>
          }
        >
          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Earnings</p>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between"><span>Basic Salary</span><span>₹{Math.round(selected.grossSalary * 0.5).toLocaleString("en-IN")}</span></div>
                <div className="flex justify-between"><span>HRA</span><span>₹{Math.round(selected.grossSalary * 0.2).toLocaleString("en-IN")}</span></div>
                <div className="flex justify-between"><span>Transport Allowance</span><span>₹{Math.round(selected.grossSalary * 0.1).toLocaleString("en-IN")}</span></div>
                <div className="flex justify-between"><span>Special Allowance</span><span>₹{Math.round(selected.grossSalary * 0.2).toLocaleString("en-IN")}</span></div>
              </div>
              <div className="flex justify-between font-semibold text-sm border-t mt-2 pt-2">
                <span>Gross Earnings</span><span>₹{selected.grossSalary.toLocaleString("en-IN")}</span>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Deductions</p>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between text-red-600"><span>PF (Employee 12%)</span><span>-₹{Math.round(selected.grossSalary * 0.05 * 0.12).toLocaleString("en-IN")}</span></div>
                <div className="flex justify-between text-red-600"><span>TDS</span><span>-₹{Math.round(selected.deductions * 0.6).toLocaleString("en-IN")}</span></div>
                <div className="flex justify-between text-red-600"><span>ESI</span><span>-₹{Math.round(selected.deductions * 0.4).toLocaleString("en-IN")}</span></div>
              </div>
              <div className="flex justify-between font-semibold text-sm border-t mt-2 pt-2 text-red-600">
                <span>Total Deductions</span><span>-₹{selected.deductions.toLocaleString("en-IN")}</span>
              </div>
            </div>

            <Separator />

            <div className="flex justify-between font-bold text-lg text-emerald-600 bg-emerald-50 dark:bg-emerald-950 p-3 rounded-lg">
              <span>Net Pay</span><span>₹{selected.netSalary.toLocaleString("en-IN")}</span>
            </div>
          </div>
        </SmallDetailModal>
      )}
    </PageTransition>
  );
}
