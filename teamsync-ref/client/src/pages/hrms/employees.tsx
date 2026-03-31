import { useState } from "react";
import { useLocation } from "wouter";
import { UserPlus, Mail } from "lucide-react";
import { Fade } from "@/components/ui/animated";
import { CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { PersonCell } from "@/components/ui/avatar-cells";
import { Label } from "@/components/ui/label";
import { employees, hrmsDepartments } from "@/lib/mock-data-hrms";
import {
  PageShell,
  PageHeader,
  IndexToolbar,
  DataTableContainer,
  DataTH,
  DataTD,
  DataTR,
  PrimaryAction,
  DetailModal,
  DetailSection
} from "@/components/layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ds/status-badge";

export default function HrmsEmployees() {
  const [, setLocation] = useLocation();
  const isLoading = useSimulatedLoading(700);
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [addOpen, setAddOpen] = useState(false);

  const filtered = employees.filter((e) => {
    const matchSearch = e.name.toLowerCase().includes(search.toLowerCase()) || e.designation.toLowerCase().includes(search.toLowerCase());
    const matchDept = deptFilter === "all" || e.department === deptFilter;
    const matchStatus = statusFilter === "all" || e.status === statusFilter;
    const matchType = typeFilter === "all" || e.employmentType === typeFilter;
    return matchSearch && matchDept && matchStatus && matchType;
  });

  if (isLoading) {
    return (
      <PageShell className="animate-pulse">
        <div className="h-10 bg-muted rounded-xl w-48" />
        <div className="h-12 bg-muted rounded-xl" />
        {[...Array(6)].map((_, i) => <div key={i} className="h-16 bg-muted rounded-xl" />)}
      </PageShell>
    );
  }

  return (
    <PageShell>
      <Fade>
        <PageHeader
          title="Employees"
          subtitle={`${employees.length} total employees across ${hrmsDepartments.length} departments`}
          actions={
            <PrimaryAction
              color="#0284c7"
              icon={UserPlus}
              onClick={() => setAddOpen(true)}
              testId="add-employee-btn"
            >
              Add Employee
            </PrimaryAction>
          }
        />
      </Fade>

      <Fade>
        <IndexToolbar
          search={search}
          onSearch={setSearch}
          placeholder="Search by name or designation..."
          color="#0284c7"
          extra={
            <div className="flex gap-2">
              <Select value={deptFilter} onValueChange={setDeptFilter}>
                <SelectTrigger className="w-40" data-testid="dept-filter">
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {hrmsDepartments.map((d) => (
                    <SelectItem key={d.id} value={d.name}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-36" data-testid="status-filter">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="on-leave">On Leave</SelectItem>
                  <SelectItem value="terminated">Terminated</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-36" data-testid="type-filter">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="full-time">Full Time</SelectItem>
                  <SelectItem value="part-time">Part Time</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
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
                <DataTH>Department</DataTH>
                <DataTH>Designation</DataTH>
                <DataTH>Type</DataTH>
                <DataTH>Status</DataTH>
                <DataTH>Location</DataTH>
                <DataTH>Joined</DataTH>
                <DataTH align="right">Contact</DataTH>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((emp) => (
                <DataTR
                  key={emp.id}
                  onClick={() => setLocation(`/hrms/employees/${emp.id}`)}
                  data-testid={`employee-row-${emp.id}`}
                >
                  <DataTD>
                    <PersonCell name={emp.name} />
                  </DataTD>
                  <DataTD className="text-muted-foreground">{emp.department}</DataTD>
                  <DataTD>{emp.designation}</DataTD>
                  <DataTD>
                    <StatusBadge status={emp.employmentType} />
                  </DataTD>
                  <DataTD>
                    <StatusBadge status={emp.status} />
                  </DataTD>
                  <DataTD className="text-muted-foreground">{emp.location}</DataTD>
                  <DataTD className="text-muted-foreground">
                    {new Date(emp.joiningDate).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "2-digit",
                    })}
                  </DataTD>
                  <DataTD align="right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        window.location.href = `mailto:${emp.email}`;
                      }}
                      className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                      data-testid={`email-emp-${emp.id}`}
                      title={emp.email}
                    >
                      <Mail className="size-4" />
                    </button>
                  </DataTD>
                </DataTR>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-muted-foreground text-sm">
                    No employees found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </DataTableContainer>
      </Fade>

      <DetailModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add Employee"
        subtitle="Add a new team member to the organization"
        footer={
          <Button 
            className="w-full bg-sky-600 hover:bg-sky-700 text-white" 
            data-testid="submit-add-employee"
            onClick={() => setAddOpen(false)}
          >
            Add Employee
          </Button>
        }
      >
        <DetailSection title="Basic Information">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5"><Label className="text-sm font-medium">Full Name</Label><Input placeholder="e.g. Aarav Sharma" /></div>
            <div className="space-y-1.5"><Label className="text-sm font-medium">Email</Label><Input type="email" placeholder="aarav@teamsync.io" /></div>
            <div className="space-y-1.5"><Label className="text-sm font-medium">Phone</Label><Input placeholder="+91 98765 43210" /></div>
            <div className="space-y-1.5"><Label className="text-sm font-medium">Location</Label><Input placeholder="e.g. Mumbai" /></div>
          </div>
        </DetailSection>

        <DetailSection title="Employment Details">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5"><Label className="text-sm font-medium">Department</Label>
              <Select><SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                <SelectContent>{hrmsDepartments.map((d) => <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label className="text-sm font-medium">Designation</Label><Input placeholder="e.g. Backend Engineer" /></div>
            <div className="space-y-1.5"><Label className="text-sm font-medium">Employment Type</Label>
              <Select><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="full-time">Full Time</SelectItem>
                  <SelectItem value="part-time">Part Time</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label className="text-sm font-medium">Joining Date</Label><Input type="date" /></div>
          </div>
        </DetailSection>

        <DetailSection title="Management">
          <div className="space-y-1.5"><Label className="text-sm font-medium">Reporting Manager</Label>
            <Select><SelectTrigger><SelectValue placeholder="Select manager" /></SelectTrigger>
              <SelectContent>{employees.filter(e => e.designation.includes("Manager") || e.designation.includes("Lead") || e.designation.includes("CEO")).map((e) => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </DetailSection>
      </DetailModal>
    </PageShell>
  );
}
