import { useState } from "react";
import { CalendarPlus, ExternalLink } from "lucide-react";
import { SopModal, TutorialModal, SopTutorialButtons } from "@/components/sop/sop-modal";
import { SOP_REGISTRY } from "@/lib/sop-data";
import { ATS_COLOR } from "@/lib/ats-config";
import { Fade } from "@/components/ui/animated";
import { CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { interviews, candidates, jobOpenings } from "@/lib/mock-data-ats";
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

const today = "2026-02-28";
const thisWeekEnd = "2026-03-06";

export default function AtsInterviews() {
  const isLoading = useSimulatedLoading(700);
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [sopOpen, setSopOpen] = useState(false);
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const [search, setSearch] = useState("");

  const scheduledToday = interviews.filter(i => i.scheduledDate === today).length;
  const thisWeek = interviews.filter(i => i.scheduledDate >= today && i.scheduledDate <= thisWeekEnd).length;
  const completed = interviews.filter(i => i.status === "completed").length;
  const cancelled = interviews.filter(i => i.status === "cancelled").length;

  const filtered = interviews.filter(i => {
    const matchType = typeFilter === "all" || i.type === typeFilter;
    const matchStatus = statusFilter === "all" || i.status === statusFilter;
    const matchSearch = i.candidateName.toLowerCase().includes(search.toLowerCase()) || i.jobTitle.toLowerCase().includes(search.toLowerCase());
    return matchType && matchStatus && matchSearch;
  }).sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate));

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
          title="Interview Schedule"
          subtitle={`${interviews.length} interviews tracked`}
          actions={
            <div className="flex gap-2">
            <SopTutorialButtons onSopClick={() => setSopOpen(true)} onTutorialClick={() => setTutorialOpen(true)} />
            <PrimaryAction
              color="#7c3aed"
              icon={CalendarPlus}
              onClick={() => setScheduleOpen(true)}
              testId="schedule-interview-btn"
            >
              Schedule Interview
            </PrimaryAction>
            </div>
          }
        />
      </Fade>

      <Fade>
        <StatGrid>
          <StatCard
            label="Scheduled Today"
            value={scheduledToday}
            icon={CalendarPlus}
            iconBg="rgba(124, 58, 237, 0.1)"
            iconColor="#7c3aed"
          />
          <StatCard
            label="This Week"
            value={thisWeek}
            icon={CalendarPlus}
            iconBg="rgba(14, 165, 233, 0.1)"
            iconColor="#0ea5e9"
          />
          <StatCard
            label="Completed"
            value={completed}
            icon={CalendarPlus}
            iconBg="rgba(16, 185, 129, 0.1)"
            iconColor="#10b981"
          />
          <StatCard
            label="Cancelled"
            value={cancelled}
            icon={CalendarPlus}
            iconBg="rgba(239, 68, 68, 0.1)"
            iconColor="#ef4444"
          />
        </StatGrid>
      </Fade>

      <Fade>
        <IndexToolbar
          search={search}
          onSearch={setSearch}
          placeholder="Search interviews..."
          color="#7c3aed"
          extra={
            <div className="flex gap-2">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-36" data-testid="type-filter"><SelectValue placeholder="All Types" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="phone">Phone</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="onsite">Onsite</SelectItem>
                  <SelectItem value="technical">Technical</SelectItem>
                  <SelectItem value="panel">Panel</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-36" data-testid="status-filter"><SelectValue placeholder="All Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="rescheduled">Rescheduled</SelectItem>
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
                <DataTH>Job</DataTH>
                <DataTH>Date & Time</DataTH>
                <DataTH>Type</DataTH>
                <DataTH>Interviewers</DataTH>
                <DataTH>Duration</DataTH>
                <DataTH>Status</DataTH>
                <DataTH align="right">Meet</DataTH>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map(iv => (
                <DataTR key={iv.id} data-testid={`interview-row-${iv.id}`}>
                  <DataTD><PersonCell name={iv.candidateName} size="sm" /></DataTD>
                  <DataTD className="text-muted-foreground">{iv.jobTitle}</DataTD>
                  <DataTD>{iv.scheduledDate} {iv.scheduledTime}</DataTD>
                  <DataTD><StatusBadge status={iv.type} /></DataTD>
                  <DataTD className="text-muted-foreground max-w-[160px] truncate" title={iv.interviewers.join(", ")}>{iv.interviewers.join(", ")}</DataTD>
                  <DataTD className="text-muted-foreground">{iv.duration}m</DataTD>
                  <DataTD><StatusBadge status={iv.status} /></DataTD>
                  <DataTD align="right">
                    {iv.meetLink && (
                      <a href={iv.meetLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-violet-600 hover:underline" data-testid={`meet-link-${iv.id}`}>
                        Join <ExternalLink className="size-3" />
                      </a>
                    )}
                  </DataTD>
                </DataTR>
              ))}
              {filtered.length === 0 && <tr><td colSpan={8} className="px-4 py-12 text-center text-muted-foreground text-sm">No interviews found</td></tr>}
            </tbody>
          </table>
        </DataTableContainer>
      </Fade>

      <DetailModal
        open={scheduleOpen}
        onClose={() => setScheduleOpen(false)}
        title="Schedule Interview"
        subtitle="Set up a new interview for a candidate"
        footer={
          <PrimaryAction color="#7c3aed" onClick={() => setScheduleOpen(false)} data-testid="submit-interview">Schedule Interview</PrimaryAction>
        }
      >
        <DetailSection title="Interview Details">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1.5"><label className="text-sm font-medium">Candidate</label>
              <Select><SelectTrigger><SelectValue placeholder="Select candidate" /></SelectTrigger>
                <SelectContent>{candidates.slice(0, 10).map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="col-span-2 space-y-1.5"><label className="text-sm font-medium">Job Opening</label>
              <Select><SelectTrigger><SelectValue placeholder="Select job" /></SelectTrigger>
                <SelectContent>{jobOpenings.filter(j => j.status === "active").map(j => <SelectItem key={j.id} value={j.id}>{j.title}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><label className="text-sm font-medium">Interview Type</label>
              <Select><SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="phone">Phone Screen</SelectItem>
                  <SelectItem value="video">Video Call</SelectItem>
                  <SelectItem value="technical">Technical</SelectItem>
                  <SelectItem value="panel">Panel</SelectItem>
                  <SelectItem value="onsite">Onsite</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><label className="text-sm font-medium">Duration (mins)</label>
              <Select><SelectTrigger><SelectValue placeholder="Duration" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 min</SelectItem>
                  <SelectItem value="45">45 min</SelectItem>
                  <SelectItem value="60">60 min</SelectItem>
                  <SelectItem value="90">90 min</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><label className="text-sm font-medium">Date</label><Input type="date" /></div>
            <div className="space-y-1.5"><label className="text-sm font-medium">Time</label><Input type="time" /></div>
            <div className="col-span-2 space-y-1.5"><label className="text-sm font-medium">Interviewers</label><Input placeholder="e.g. Rohan Mehta, Priya Sharma" /></div>
            <div className="col-span-2 space-y-1.5"><label className="text-sm font-medium">Meet Link</label><Input placeholder="https://meet.google.com/..." /></div>
          </div>
        </DetailSection>
      </DetailModal>
      <SopModal open={sopOpen} onOpenChange={setSopOpen} config={SOP_REGISTRY["ats-interviews"].sop} color={ATS_COLOR} />
      <TutorialModal open={tutorialOpen} onOpenChange={setTutorialOpen} config={SOP_REGISTRY["ats-interviews"].tutorial} color={ATS_COLOR} />
    </PageShell>
  );
}
