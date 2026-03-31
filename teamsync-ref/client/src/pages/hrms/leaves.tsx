import { useState } from "react";
import { CheckCircle2, XCircle, CalendarDays } from "lucide-react";
import { Fade } from "@/components/ui/animated";
import { CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { FormDialog } from "@/components/ds/form-dialog";
import { leaveRequests } from "@/lib/mock-data-hrms";
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
} from "@/components/layout";
import { StatusBadge } from "@/components/ds/status-badge";
import { PersonCell } from "@/components/ui/avatar-cells";
import { SopModal, TutorialModal, SopTutorialButtons } from "@/components/sop/sop-modal";
import { SOP_REGISTRY } from "@/lib/sop-data";
import { HRMS_COLOR } from "@/lib/hrms-config";

export default function HrmsLeaves() {
  const isLoading = useSimulatedLoading(700);
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [requestOpen, setRequestOpen] = useState(false);
  const [leaveData, setLeaveData] = useState(leaveRequests);
  const [search, setSearch] = useState("");
  const [sopOpen, setSopOpen] = useState(false);
  const [tutorialOpen, setTutorialOpen] = useState(false);

  const handleApprove = (id: string) => {
    setLeaveData((prev) => prev.map((l) => l.id === id ? { ...l, status: "approved" as const } : l));
  };

  const handleReject = (id: string) => {
    setLeaveData((prev) => prev.map((l) => l.id === id ? { ...l, status: "rejected" as const } : l));
  };

  const pending = leaveData.filter((l) => l.status === "pending").length;
  const approvedThisMonth = leaveData.filter((l) => l.status === "approved" && l.startDate.startsWith("2026-02")).length;
  const rejected = leaveData.filter((l) => l.status === "rejected").length;
  const onLeave = leaveData.filter((l) => l.status === "approved" && l.startDate <= "2026-02-28" && l.endDate >= "2026-02-28").length;

  const filtered = leaveData.filter((l) => {
    const matchType = typeFilter === "all" || l.type === typeFilter;
    const matchStatus = statusFilter === "all" || l.status === statusFilter;
    const matchSearch = l.employeeName.toLowerCase().includes(search.toLowerCase()) || l.reason.toLowerCase().includes(search.toLowerCase());
    return matchType && matchStatus && matchSearch;
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

  const filterOptions = [
    { value: "all", label: "All Status" },
    { value: "pending", label: "Pending" },
    { value: "approved", label: "Approved" },
    { value: "rejected", label: "Rejected" },
  ];

  return (
    <PageShell>
      <Fade>
        <PageHeader
          title="Leave Requests"
          subtitle="Manage and approve team leave applications"
          actions={
            <>
              <SopTutorialButtons onSopClick={() => setSopOpen(true)} onTutorialClick={() => setTutorialOpen(true)} />
              <PrimaryAction
                color="#0284c7"
                icon={CalendarDays}
                onClick={() => setRequestOpen(true)}
                testId="request-leave-btn"
              >
                Request Leave
              </PrimaryAction>
            </>
          }
        />
      </Fade>

      <Fade>
        <StatGrid>
          <StatCard
            label="Pending Approvals"
            value={pending}
            icon={CalendarDays}
            iconBg="rgba(245, 158, 11, 0.1)"
            iconColor="#f59e0b"
          />
          <StatCard
            label="Approved This Month"
            value={approvedThisMonth}
            icon={CalendarDays}
            iconBg="rgba(16, 185, 129, 0.1)"
            iconColor="#10b981"
          />
          <StatCard
            label="Rejected"
            value={rejected}
            icon={CalendarDays}
            iconBg="rgba(239, 68, 68, 0.1)"
            iconColor="#ef4444"
          />
          <StatCard
            label="On Leave Today"
            value={onLeave}
            icon={CalendarDays}
            iconBg="rgba(14, 165, 233, 0.1)"
            iconColor="#0ea5e9"
          />
        </StatGrid>
      </Fade>

      <Fade>
        <IndexToolbar
          search={search}
          onSearch={setSearch}
          placeholder="Search requests..."
          color="#0284c7"
          filters={filterOptions}
          activeFilter={statusFilter}
          onFilter={setStatusFilter}
          extra={
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-36" data-testid="type-filter"><SelectValue placeholder="Leave Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="casual">Casual</SelectItem>
                <SelectItem value="sick">Sick</SelectItem>
                <SelectItem value="annual">Annual</SelectItem>
                <SelectItem value="maternity">Maternity</SelectItem>
                <SelectItem value="paternity">Paternity</SelectItem>
              </SelectContent>
            </Select>
          }
        />
      </Fade>

      <Fade>
        <DataTableContainer>
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/30">
              <tr>
                <DataTH>Employee</DataTH>
                <DataTH>Type</DataTH>
                <DataTH>Duration</DataTH>
                <DataTH>Dates</DataTH>
                <DataTH>Reason</DataTH>
                <DataTH>Status</DataTH>
                <DataTH align="right">Actions</DataTH>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((leave) => (
                <DataTR key={leave.id} data-testid={`leave-row-${leave.id}`}>
                  <DataTD><PersonCell name={leave.employeeName} size="sm" /></DataTD>
                  <DataTD>
                    <StatusBadge status={leave.type} />
                  </DataTD>
                  <DataTD>{leave.days} day{leave.days > 1 ? "s" : ""}</DataTD>
                  <DataTD className="text-xs text-muted-foreground">{leave.startDate} → {leave.endDate}</DataTD>
                  <DataTD className="max-w-[200px] truncate" title={leave.reason}>{leave.reason}</DataTD>
                  <DataTD>
                    <StatusBadge status={leave.status} />
                  </DataTD>
                  <DataTD align="right">
                    {leave.status === "pending" && (
                      <div className="flex justify-end gap-1.5">
                        <button onClick={() => handleApprove(leave.id)} className="p-1 rounded hover:bg-emerald-100 text-emerald-600 transition-colors" data-testid={`approve-${leave.id}`} title="Approve">
                          <CheckCircle2 className="size-4" />
                        </button>
                        <button onClick={() => handleReject(leave.id)} className="p-1 rounded hover:bg-red-100 text-red-600 transition-colors" data-testid={`reject-${leave.id}`} title="Reject">
                          <XCircle className="size-4" />
                        </button>
                      </div>
                    )}
                  </DataTD>
                </DataTR>
              ))}
              {filtered.length === 0 && <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground text-sm">No leave requests found</td></tr>}
            </tbody>
          </table>
        </DataTableContainer>
      </Fade>

      <FormDialog title="Request Leave" open={requestOpen} onOpenChange={setRequestOpen} onSubmit={() => setRequestOpen(false)}>
        <div className="space-y-4">
          <div className="space-y-1.5"><label className="text-sm font-medium">Employee</label>
            <Select><SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="self">Myself (Sneha Patel)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5"><label className="text-sm font-medium">Leave Type</label>
            <Select><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="casual">Casual Leave</SelectItem>
                <SelectItem value="sick">Sick Leave</SelectItem>
                <SelectItem value="annual">Annual Leave</SelectItem>
                <SelectItem value="maternity">Maternity Leave</SelectItem>
                <SelectItem value="paternity">Paternity Leave</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5"><label className="text-sm font-medium">Start Date</label><Input type="date" /></div>
            <div className="space-y-1.5"><label className="text-sm font-medium">End Date</label><Input type="date" /></div>
          </div>
          <div className="space-y-1.5"><label className="text-sm font-medium">Reason</label><Input placeholder="Brief reason for leave" /></div>
        </div>
        <Button className="w-full mt-4 bg-sky-600 hover:bg-sky-700" data-testid="submit-leave">Submit Request</Button>
      </FormDialog>

      <SopModal open={sopOpen} onOpenChange={setSopOpen} config={SOP_REGISTRY["hrms-leaves"].sop} color={HRMS_COLOR} />
      <TutorialModal open={tutorialOpen} onOpenChange={setTutorialOpen} config={SOP_REGISTRY["hrms-leaves"].tutorial} color={HRMS_COLOR} />
    </PageShell>
  );
}
