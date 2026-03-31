import { useState } from "react";
import { useLocation } from "wouter";
import { CalendarPlus, Mail } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { Fade } from "@/components/ui/animated";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { applications, jobOpenings, candidates } from "@/lib/mock-data-ats";
import {
  PageShell,
  PageHeader,
  IndexToolbar,
  DataTableContainer,
  DataTH,
  DataTD,
  DataTR,
} from "@/components/layout";
import { StatusBadge } from "@/components/ds/status-badge";
import { PersonCell } from "@/components/ui/avatar-cells";

const interviewers = Array.from(new Set(applications.map(a => a.currentInterviewer).filter(Boolean)))

export default function AtsApplications() {
  const [, setLocation] = useLocation();
  const isLoading = useSimulatedLoading(700);
  const [jobFilter, setJobFilter] = useState("all");
  const [stageFilter, setStageFilter] = useState("all");
  const [interviewerFilter, setInterviewerFilter] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = applications.filter(a => {
    const matchJob = jobFilter === "all" || a.jobId === jobFilter;
    const matchStage = stageFilter === "all" || a.stage === stageFilter;
    const matchInterviewer = interviewerFilter === "all" || a.currentInterviewer === interviewerFilter;
    const matchSearch = a.candidateName.toLowerCase().includes(search.toLowerCase()) || a.jobTitle.toLowerCase().includes(search.toLowerCase());
    return matchJob && matchStage && matchInterviewer && matchSearch;
  });

  if (isLoading) {
    return (
      <PageShell className="animate-pulse">
        <div className="h-10 bg-muted rounded w-48" />
        <div className="h-12 bg-muted rounded-xl" />
        {[...Array(8)].map((_, i) => <div key={i} className="h-12 bg-muted rounded-xl" />)}
      </PageShell>
    );
  }

  return (
    <PageShell>
      <Fade>
        <PageHeader
          title="Applications"
          subtitle={`${applications.length} total applications across all openings`}
        />
      </Fade>

      <Fade>
        <IndexToolbar
          search={search}
          onSearch={setSearch}
          placeholder="Search applications..."
          color="#7c3aed"
          extra={
            <div className="flex gap-2">
              <Select value={jobFilter} onValueChange={setJobFilter}>
                <SelectTrigger className="w-52" data-testid="job-filter"><SelectValue placeholder="All Jobs" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Jobs</SelectItem>
                  {jobOpenings.map(j => <SelectItem key={j.id} value={j.id}>{j.title}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={stageFilter} onValueChange={setStageFilter}>
                <SelectTrigger className="w-40" data-testid="stage-filter"><SelectValue placeholder="All Stages" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stages</SelectItem>
                  <SelectItem value="applied">Applied</SelectItem>
                  <SelectItem value="phone-screen">Phone Screen</SelectItem>
                  <SelectItem value="technical">Technical</SelectItem>
                  <SelectItem value="cultural">Cultural</SelectItem>
                  <SelectItem value="final">Final Round</SelectItem>
                  <SelectItem value="offer">Offer</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Select value={interviewerFilter} onValueChange={setInterviewerFilter}>
                <SelectTrigger className="w-44" data-testid="interviewer-filter"><SelectValue placeholder="All Interviewers" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Interviewers</SelectItem>
                  {interviewers.map(i => i && <SelectItem key={i} value={i}>{i}</SelectItem>)}
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
                <DataTH>Candidate</DataTH>
                <DataTH>Job Title</DataTH>
                <DataTH>Applied</DataTH>
                <DataTH>Stage</DataTH>
                <DataTH>Interviewer</DataTH>
                <DataTH>Last Activity</DataTH>
                <DataTH align="right">Actions</DataTH>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map(app => {
                const cand = candidates.find(c => c.id === app.candidateId);
                return (
                  <DataTR
                    key={app.id}
                    onClick={() => setLocation(`/ats/candidates/${app.candidateId}`)}
                    data-testid={`app-row-${app.id}`}
                  >
                    <DataTD><PersonCell name={app.candidateName} size="sm" /></DataTD>
                    <DataTD className="text-muted-foreground">{app.jobTitle}</DataTD>
                    <DataTD className="text-muted-foreground">{app.appliedDate}</DataTD>
                    <DataTD>
                      <StatusBadge status={app.stage} />
                    </DataTD>
                    <DataTD className="text-muted-foreground">{app.currentInterviewer || "—"}</DataTD>
                    <DataTD className="text-muted-foreground">{app.lastActivity}</DataTD>
                    <DataTD align="right">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={(e) => { e.stopPropagation(); cand && window.open(`https://wa.me/${cand.phone.replace(/\D/g, "")}`, "_blank"); }}
                          className="p-1.5 rounded hover:bg-muted transition-colors text-green-600"
                          data-testid={`whatsapp-app-${app.id}`}
                          title="WhatsApp"
                        >
                          <SiWhatsapp className="size-3.5" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); cand && (window.location.href = `mailto:${cand.email}`); }}
                          className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground"
                          data-testid={`email-app-${app.id}`}
                          title="Email"
                        >
                          <Mail className="size-3.5" />
                        </button>
                        <button
                          onClick={(e) => e.stopPropagation()}
                          className="p-1.5 rounded hover:bg-muted transition-colors text-violet-600"
                          data-testid={`schedule-app-${app.id}`}
                          title="Schedule Interview"
                        >
                          <CalendarPlus className="size-3.5" />
                        </button>
                      </div>
                    </DataTD>
                  </DataTR>
                );
              })}
              {filtered.length === 0 && <tr><td colSpan={7} className="px-4 py-12 text-center text-muted-foreground text-sm">No applications found</td></tr>}
            </tbody>
          </table>
        </DataTableContainer>
      </Fade>
    </PageShell>
  );
}
