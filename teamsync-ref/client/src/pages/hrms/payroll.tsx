import { useState } from "react";
import { DollarSign, Play } from "lucide-react";
import { Fade } from "@/components/ui/animated";
import { CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { payrollEntries } from "@/lib/mock-data-hrms";
import {
  PageShell,
  PageHeader,
  StatGrid,
  StatCard,
  DataTableContainer,
  DataTH,
  DataTD,
  DataTR,
  IndexToolbar,
  PrimaryAction,
  DetailModal,
  DetailSection,
} from "@/components/layout";
import { StatusBadge } from "@/components/ds/status-badge";
import { PersonCell } from "@/components/ui/avatar-cells";
import { SopModal, TutorialModal, SopTutorialButtons } from "@/components/sop/sop-modal";
import { SOP_REGISTRY } from "@/lib/sop-data";
import { HRMS_COLOR } from "@/lib/hrms-config";

export default function HrmsPayroll() {
  const isLoading = useSimulatedLoading(700);
  const [monthFilter, setMonthFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [runDialog, setRunDialog] = useState(false);
  const [search, setSearch] = useState("");
  const [sopOpen, setSopOpen] = useState(false);
  const [tutorialOpen, setTutorialOpen] = useState(false);

  const totalThisMonth = payrollEntries.filter(p => p.month === "Feb 2026").reduce((sum, p) => sum + p.netSalary, 0);
  const processed = payrollEntries.filter(p => p.status === "processed").length;
  const pending = payrollEntries.filter(p => p.status === "pending").length;
  const onHold = payrollEntries.filter(p => p.status === "on-hold").length;

  const months = Array.from(new Set(payrollEntries.map(p => p.month)));

  const filtered = payrollEntries.filter(p => {
    const matchMonth = monthFilter === "all" || p.month === monthFilter;
    const matchStatus = statusFilter === "all" || p.status === statusFilter;
    const matchSearch = p.employeeName.toLowerCase().includes(search.toLowerCase());
    return matchMonth && matchStatus && matchSearch;
  });

  if (isLoading) {
    return (
      <PageShell className="animate-pulse">
        <div className="h-10 bg-muted rounded w-48" />
        <StatGrid>
          <div className="h-20 bg-muted rounded-xl" />
          <div className="h-20 bg-muted rounded-xl" />
          <div className="h-20 bg-muted rounded-xl" />
          <div className="h-20 bg-muted rounded-xl" />
        </StatGrid>
        <div className="h-72 bg-muted rounded-xl" />
      </PageShell>
    );
  }

  return (
    <PageShell>
      <Fade>
        <PageHeader
          title="Payroll"
          subtitle="Manage monthly payroll processing and disbursements"
          actions={
            <>
              <SopTutorialButtons onSopClick={() => setSopOpen(true)} onTutorialClick={() => setTutorialOpen(true)} />
              <PrimaryAction
                color="#0284c7"
                icon={Play}
                onClick={() => setRunDialog(true)}
                testId="run-payroll-btn"
              >
                Run Payroll
              </PrimaryAction>
            </>
          }
        />
      </Fade>

      <Fade>
        <StatGrid>
          <StatCard
            label="Total Payroll (Feb)"
            value={`₹${(totalThisMonth / 100000).toFixed(2)}L`}
            icon={DollarSign}
            iconBg="rgba(14, 165, 233, 0.1)"
            iconColor="#0ea5e9"
          />
          <StatCard
            label="Processed"
            value={processed}
            icon={DollarSign}
            iconBg="rgba(16, 185, 129, 0.1)"
            iconColor="#10b981"
          />
          <StatCard
            label="Pending"
            value={pending}
            icon={DollarSign}
            iconBg="rgba(245, 158, 11, 0.1)"
            iconColor="#f59e0b"
          />
          <StatCard
            label="On Hold"
            value={onHold}
            icon={DollarSign}
            iconBg="rgba(239, 68, 68, 0.1)"
            iconColor="#ef4444"
          />
        </StatGrid>
      </Fade>

      <Fade>
        <IndexToolbar
          search={search}
          onSearch={setSearch}
          placeholder="Search employee..."
          color="#0284c7"
          extra={
            <div className="flex gap-2">
              <Select value={monthFilter} onValueChange={setMonthFilter}>
                <SelectTrigger className="w-36" data-testid="month-filter"><SelectValue placeholder="All Months" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Months</SelectItem>
                  {months.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-36" data-testid="status-filter"><SelectValue placeholder="All Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="processed">Processed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="on-hold">On Hold</SelectItem>
                </SelectContent>
              </Select>
            </div>
          }
        />
      </Fade>

      <Fade>
        <DataTableContainer>
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/30">
              <tr>
                <DataTH>Employee</DataTH>
                <DataTH>Month</DataTH>
                <DataTH>Gross Salary</DataTH>
                <DataTH>Deductions</DataTH>
                <DataTH>Net Salary</DataTH>
                <DataTH>Status</DataTH>
                <DataTH>Pay Date</DataTH>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((p) => (
                <DataTR key={p.id} data-testid={`payroll-row-${p.id}`}>
                  <DataTD><PersonCell name={p.employeeName} size="sm" /></DataTD>
                  <DataTD className="text-muted-foreground">{p.month}</DataTD>
                  <DataTD>₹{p.grossSalary.toLocaleString("en-IN")}</DataTD>
                  <DataTD className="text-red-600">-₹{p.deductions.toLocaleString("en-IN")}</DataTD>
                  <DataTD className="font-semibold text-emerald-600">₹{p.netSalary.toLocaleString("en-IN")}</DataTD>
                  <DataTD>
                    <StatusBadge status={p.status} />
                  </DataTD>
                  <DataTD className="text-muted-foreground">{p.payDate}</DataTD>
                </DataTR>
              ))}
              {filtered.length === 0 && <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground text-sm">No payroll records found</td></tr>}
            </tbody>
          </table>
        </DataTableContainer>
      </Fade>

      <DetailModal
        open={runDialog}
        onClose={() => setRunDialog(false)}
        title="Run Payroll — Feb 2026"
        footer={
          <>
            <Button variant="outline" onClick={() => setRunDialog(false)} data-testid="cancel-run-payroll">Cancel</Button>
            <PrimaryAction color="#0284c7" onClick={() => setRunDialog(false)} data-testid="confirm-run-payroll">Confirm & Process</PrimaryAction>
          </>
        }
      >
        <DetailSection title="Payroll Summary">
          <div className="space-y-3 text-sm">
            <p className="text-muted-foreground">This will process payroll for all <strong>{pending}</strong> pending employees for <strong>February 2026</strong>.</p>
            <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-3 text-amber-700 dark:text-amber-300 text-xs">
              Total payout: <strong>₹{(totalThisMonth / 100000).toFixed(2)} Lakhs</strong>. Ensure bank balance is sufficient before proceeding.
            </div>
          </div>
        </DetailSection>
      </DetailModal>

      <SopModal open={sopOpen} onOpenChange={setSopOpen} config={SOP_REGISTRY["hrms-payroll"].sop} color={HRMS_COLOR} />
      <TutorialModal open={tutorialOpen} onOpenChange={setTutorialOpen} config={SOP_REGISTRY["hrms-payroll"].tutorial} color={HRMS_COLOR} />
    </PageShell>
  );
}
