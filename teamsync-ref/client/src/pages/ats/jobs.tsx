import { useState } from "react";
import { useLocation } from "wouter";
import { Plus } from "lucide-react";
import { Fade } from "@/components/ui/animated";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { jobOpenings } from "@/lib/mock-data-ats";
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
  DetailSection,
} from "@/components/layout";
import { StatusBadge } from "@/components/ds/status-badge";
import { PersonCell } from "@/components/ui/avatar-cells";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";



export default function AtsJobs() {
  const [, setLocation] = useLocation();
  const isLoading = useSimulatedLoading(700);
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [addOpen, setAddOpen] = useState(false);

  const depts = Array.from(new Set(jobOpenings.map(j => j.department)))

  const filtered = jobOpenings.filter(j => {
    const matchSearch = j.title.toLowerCase().includes(search.toLowerCase()) || j.hiringManager.toLowerCase().includes(search.toLowerCase());
    const matchDept = deptFilter === "all" || j.department === deptFilter;
    const matchStatus = statusFilter === "all" || j.status === statusFilter;
    const matchPriority = priorityFilter === "all" || j.priority === priorityFilter;
    return matchSearch && matchDept && matchStatus && matchPriority;
  });

  if (isLoading) {
    return (
      <PageShell className="animate-pulse">
        <div className="h-10 bg-muted rounded w-48" />
        <div className="h-12 bg-muted rounded-xl" />
        {[...Array(6)].map((_, i) => <div key={i} className="h-14 bg-muted rounded-xl" />)}
      </PageShell>
    );
  }

  return (
    <PageShell>
      <Fade>
        <PageHeader
          title="Job Openings"
          subtitle={`${jobOpenings.filter(j => j.status === "active").length} active openings · ${jobOpenings.reduce((s, j) => s + j.openings - j.filled, 0)} positions to fill`}
          actions={
            <PrimaryAction
              color="#7c3aed"
              icon={Plus}
              onClick={() => setAddOpen(true)}
              testId="create-job-btn"
            >
              Create Job Opening
            </PrimaryAction>
          }
        />
      </Fade>

      <Fade>
        <IndexToolbar
          search={search}
          onSearch={setSearch}
          placeholder="Search by title or hiring manager..."
          color="#7c3aed"
          extra={
            <div className="flex gap-2">
              <Select value={deptFilter} onValueChange={setDeptFilter}>
                <SelectTrigger className="w-40" data-testid="dept-filter"><SelectValue placeholder="Department" /></SelectTrigger>
                <SelectContent><SelectItem value="all">All Departments</SelectItem>{depts.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32" data-testid="status-filter"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-32" data-testid="priority-filter"><SelectValue placeholder="Priority" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
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
                <DataTH>Job Title</DataTH>
                <DataTH>Department</DataTH>
                <DataTH>Type</DataTH>
                <DataTH>Status</DataTH>
                <DataTH>Priority</DataTH>
                <DataTH>Openings</DataTH>
                <DataTH>Hiring Manager</DataTH>
                <DataTH>Target Date</DataTH>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((job) => (
                <DataTR key={job.id} onClick={() => setLocation(`/ats/jobs/${job.id}`)} data-testid={`job-row-${job.id}`}>
                  <DataTD>
                    <p className="font-medium">{job.title}</p>
                    <p className="text-xs text-muted-foreground">{job.location}</p>
                  </DataTD>
                  <DataTD className="text-muted-foreground">{job.department}</DataTD>
                  <DataTD><StatusBadge status={job.type} /></DataTD>
                  <DataTD><StatusBadge status={job.status} /></DataTD>
                  <DataTD><StatusBadge status={job.priority} /></DataTD>
                  <DataTD className="font-medium">{job.filled}/{job.openings}</DataTD>
                  <DataTD><PersonCell name={job.hiringManager} size="sm" /></DataTD>
                  <DataTD className="text-muted-foreground">{job.targetDate}</DataTD>
                </DataTR>
              ))}
              {filtered.length === 0 && <tr><td colSpan={8} className="px-4 py-12 text-center text-muted-foreground text-sm">No job openings found</td></tr>}
            </tbody>
          </table>
        </DataTableContainer>
      </Fade>

      <DetailModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Create Job Opening"
        subtitle="Post a new job opening for the team"
        footer={
          <PrimaryAction color="#7c3aed" onClick={() => setAddOpen(false)} data-testid="submit-job">Create Job Opening</PrimaryAction>
        }
      >
        <DetailSection title="Job Details">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1.5"><label className="text-sm font-medium">Job Title</label><Input placeholder="e.g. Senior Backend Engineer" /></div>
            <div className="space-y-1.5"><label className="text-sm font-medium">Department</label>
              <Select><SelectTrigger><SelectValue placeholder="Select dept" /></SelectTrigger>
                <SelectContent><SelectItem value="engineering">Engineering</SelectItem><SelectItem value="sales">Sales</SelectItem><SelectItem value="operations">Operations</SelectItem><SelectItem value="hr">HR</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><label className="text-sm font-medium">Location</label><Input placeholder="e.g. Bengaluru / Remote" /></div>
            <div className="space-y-1.5"><label className="text-sm font-medium">Type</label>
              <Select><SelectTrigger><SelectValue placeholder="Employment type" /></SelectTrigger>
                <SelectContent><SelectItem value="full-time">Full Time</SelectItem><SelectItem value="contract">Contract</SelectItem><SelectItem value="internship">Internship</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><label className="text-sm font-medium">Priority</label>
              <Select><SelectTrigger><SelectValue placeholder="Priority" /></SelectTrigger>
                <SelectContent><SelectItem value="high">High</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="low">Low</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><label className="text-sm font-medium">Number of Openings</label><Input type="number" placeholder="e.g. 2" /></div>
            <div className="space-y-1.5"><label className="text-sm font-medium">Hiring Manager</label><Input placeholder="e.g. Rohan Mehta" /></div>
            <div className="space-y-1.5"><label className="text-sm font-medium">Min Salary (₹)</label><Input type="number" placeholder="e.g. 1200000" /></div>
            <div className="space-y-1.5"><label className="text-sm font-medium">Max Salary (₹)</label><Input type="number" placeholder="e.g. 2000000" /></div>
            <div className="col-span-2 space-y-1.5"><label className="text-sm font-medium">Target Date</label><Input type="date" /></div>
          </div>
        </DetailSection>
      </DetailModal>
    </PageShell>
  );
}
