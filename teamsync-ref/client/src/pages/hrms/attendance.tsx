import { useState } from "react";
import { LayoutGrid, List } from "lucide-react";
import { Fade } from "@/components/ui/animated";
import { CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { attendanceRecords } from "@/lib/mock-data-hrms";
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
} from "@/components/layout";
import { StatusBadge } from "@/components/ds/status-badge";
import { PersonCell } from "@/components/ui/avatar-cells";
import { SopModal, TutorialModal, SopTutorialButtons } from "@/components/sop/sop-modal";
import { SOP_REGISTRY } from "@/lib/sop-data";
import { HRMS_COLOR } from "@/lib/hrms-config";

const calendarStatusDot: Record<string, string> = {
  present: "bg-emerald-500",
  absent: "bg-red-500",
  "half-day": "bg-amber-500",
  wfh: "bg-sky-500",
};

const todayRecords = attendanceRecords.filter((a) => a.date === "2026-02-28");
const presentToday = todayRecords.filter((a) => a.status === "present" || a.status === "wfh").length;
const absentToday = todayRecords.filter((a) => a.status === "absent").length;
const wfhToday = todayRecords.filter((a) => a.status === "wfh").length;
const onLeaveCount = 2;

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const sampleDates = ["2026-02-24", "2026-02-25", "2026-02-26", "2026-02-27", "2026-02-28"];

export default function HrmsAttendance() {
  const isLoading = useSimulatedLoading(700);
  const [view, setView] = useState<"table" | "calendar">("table");
  const [empFilter, setEmpFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [sopOpen, setSopOpen] = useState(false);
  const [tutorialOpen, setTutorialOpen] = useState(false);

  const uniqueEmps = Array.from(new Set(attendanceRecords.map((a) => a.employeeName)));

  const filtered = attendanceRecords.filter((a) => {
    const matchEmp = empFilter === "all" || a.employeeName === empFilter;
    const matchStatus = statusFilter === "all" || a.status === statusFilter;
    const matchSearch = a.employeeName.toLowerCase().includes(search.toLowerCase());
    return matchEmp && matchStatus && matchSearch;
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
          title="Attendance Log"
          subtitle="Track daily attendance across the organization"
          actions={
            <>
              <SopTutorialButtons onSopClick={() => setSopOpen(true)} onTutorialClick={() => setTutorialOpen(true)} />
              <div className="flex gap-1 bg-muted rounded-lg p-1">
                <Button variant={view === "table" ? "default" : "ghost"} size="sm" onClick={() => setView("table")} data-testid="table-view-btn"><List className="size-4" /></Button>
                <Button variant={view === "calendar" ? "default" : "ghost"} size="sm" onClick={() => setView("calendar")} data-testid="calendar-view-btn"><LayoutGrid className="size-4" /></Button>
              </div>
            </>
          }
        />
      </Fade>

      <Fade>
        <StatGrid>
          <StatCard
            label="Present Today"
            value={presentToday}
            icon={List}
            iconBg="rgba(16, 185, 129, 0.1)"
            iconColor="#10b981"
          />
          <StatCard
            label="Absent"
            value={absentToday}
            icon={List}
            iconBg="rgba(239, 68, 68, 0.1)"
            iconColor="#ef4444"
          />
          <StatCard
            label="Work From Home"
            value={wfhToday}
            icon={List}
            iconBg="rgba(14, 165, 233, 0.1)"
            iconColor="#0ea5e9"
          />
          <StatCard
            label="On Leave"
            value={onLeaveCount}
            icon={List}
            iconBg="rgba(245, 158, 11, 0.1)"
            iconColor="#f59e0b"
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
              <Select value={empFilter} onValueChange={setEmpFilter}>
                <SelectTrigger className="w-48" data-testid="emp-filter"><SelectValue placeholder="All Employees" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Employees</SelectItem>
                  {uniqueEmps.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-36" data-testid="status-filter"><SelectValue placeholder="All Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="present">Present</SelectItem>
                  <SelectItem value="absent">Absent</SelectItem>
                  <SelectItem value="wfh">WFH</SelectItem>
                  <SelectItem value="half-day">Half Day</SelectItem>
                </SelectContent>
              </Select>
            </div>
          }
        />
      </Fade>

      {view === "table" ? (
        <Fade>
          <DataTableContainer>
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/30">
                <tr>
                  <DataTH>Employee</DataTH>
                  <DataTH>Date</DataTH>
                  <DataTH>Check In</DataTH>
                  <DataTH>Check Out</DataTH>
                  <DataTH>Hours</DataTH>
                  <DataTH>Status</DataTH>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((rec) => (
                  <DataTR key={rec.id} data-testid={`attendance-row-${rec.id}`}>
                    <DataTD><PersonCell name={rec.employeeName} size="sm" /></DataTD>
                    <DataTD className="text-muted-foreground">{rec.date}</DataTD>
                    <DataTD>{rec.checkIn}</DataTD>
                    <DataTD>{rec.checkOut}</DataTD>
                    <DataTD>{rec.hoursWorked > 0 ? `${rec.hoursWorked}h` : "-"}</DataTD>
                    <DataTD>
                      <StatusBadge status={rec.status} />
                    </DataTD>
                  </DataTR>
                ))}
                {filtered.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground text-sm">No records found</td></tr>}
              </tbody>
            </table>
          </DataTableContainer>
        </Fade>
      ) : (
        <Fade>
          <DataTableContainer>
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/30">
                <tr>
                  <DataTH>Employee</DataTH>
                  {weekDays.map((d, i) => (
                    <DataTH key={d} align="center">
                      <div>{d}</div>
                      <div className="text-[10px] font-normal text-muted-foreground/60">{sampleDates[i].slice(5)}</div>
                    </DataTH>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {uniqueEmps.slice(0, 8).map((empName) => (
                  <DataTR key={empName}>
                    <DataTD><PersonCell name={empName} size="sm" /></DataTD>
                    {sampleDates.map((date) => {
                      const rec = attendanceRecords.find((a) => a.employeeName === empName && a.date === date);
                      return (
                        <DataTD key={date} align="center">
                          {rec ? (
                            <div className="flex justify-center">
                              <div className={`size-3 rounded-full ${calendarStatusDot[rec.status]}`} title={rec.status} />
                            </div>
                          ) : (
                            <span className="text-muted-foreground/30">·</span>
                          )}
                        </DataTD>
                      );
                    })}
                  </DataTR>
                ))}
              </tbody>
            </table>
            <div className="flex items-center gap-4 px-4 py-3 border-t bg-muted/10 text-xs text-muted-foreground">
              {Object.entries(calendarStatusDot).map(([s, c]) => (
                <div key={s} className="flex items-center gap-1.5">
                  <div className={`size-2.5 rounded-full ${c}`} />
                  <span className="capitalize">{s}</span>
                </div>
              ))}
            </div>
          </DataTableContainer>
        </Fade>
      )}

      <SopModal open={sopOpen} onOpenChange={setSopOpen} config={SOP_REGISTRY["hrms-attendance"].sop} color={HRMS_COLOR} />
      <TutorialModal open={tutorialOpen} onOpenChange={setTutorialOpen} config={SOP_REGISTRY["hrms-attendance"].tutorial} color={HRMS_COLOR} />
    </PageShell>
  );
}
