import { useState } from "react";
import { useLocation } from "wouter";
import { List, LayoutGrid, Plus } from "lucide-react";
import { SopModal, TutorialModal, SopTutorialButtons } from "@/components/sop/sop-modal";
import { SOP_REGISTRY } from "@/lib/sop-data";
import { ATS_COLOR } from "@/lib/ats-config";
import { Fade } from "@/components/ui/animated";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { PersonCell } from "@/components/ui/avatar-cells";
import { candidates as allCandidatesData, jobOpenings } from "@/lib/mock-data-ats";
import type { Candidate } from "@/lib/mock-data-ats";
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
import { Input } from "@/components/ui/input";
import { KanbanBoard, type KanbanColumnData, type KanbanCardItem } from "@/components/blocks/kanban-blocks";
import { useToast } from "@/hooks/use-toast";

const pipelineStages = ["applied", "screening", "interview", "evaluation", "offer", "hired"] as const;

const stageConfig: Record<string, { label: string; color: string; bg: string }> = {
  applied: { label: "Applied", color: "text-slate-700", bg: "bg-slate-50 border-slate-200" },
  screening: { label: "Screening", color: "text-sky-700", bg: "bg-sky-50 border-sky-200" },
  interview: { label: "Interview", color: "text-violet-700", bg: "bg-violet-50 border-violet-200" },
  evaluation: { label: "Evaluation", color: "text-amber-700", bg: "bg-amber-50 border-amber-200" },
  offer: { label: "Offer", color: "text-orange-700", bg: "bg-orange-50 border-orange-200" },
  hired: { label: "Hired", color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" },
};

export default function AtsCandidates() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const isLoading = useSimulatedLoading(700);
  const [view, setView] = useState<"kanban" | "table">("kanban");
  const [search, setSearch] = useState("");
  const [jobFilter, setJobFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [addOpen, setAddOpen] = useState(false);
  const [sopOpen, setSopOpen] = useState(false);
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const [candidates, setCandidates] = useState(allCandidatesData);

  const activeCandidates = candidates.filter(c => c.stage !== "rejected");
  const sources = Array.from(new Set(candidates.map(c => c.source)))

  const filtered = activeCandidates.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.currentRole.toLowerCase().includes(search.toLowerCase());
    const matchJob = jobFilter === "all" || c.appliedJobId === jobFilter;
    const matchSource = sourceFilter === "all" || c.source === sourceFilter;
    return matchSearch && matchJob && matchSource;
  });

  if (isLoading) {
    return (
      <PageShell className="animate-pulse">
        <div className="h-10 bg-muted rounded w-48" />
        <div className="flex gap-4">{[...Array(6)].map((_, i) => <div key={i} className="flex-1 h-64 bg-muted rounded-xl" />)}</div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <Fade>
        <PageHeader
          title="Candidates"
          subtitle={`${activeCandidates.length} candidates in pipeline`}
          actions={
            <div className="flex gap-2">
              <SopTutorialButtons onSopClick={() => setSopOpen(true)} onTutorialClick={() => setTutorialOpen(true)} />
              <div className="flex gap-1 bg-muted rounded-lg p-1">
                <Button variant={view === "kanban" ? "default" : "ghost"} size="sm" onClick={() => setView("kanban")} data-testid="kanban-view-btn"><LayoutGrid className="size-4" /></Button>
                <Button variant={view === "table" ? "default" : "ghost"} size="sm" onClick={() => setView("table")} data-testid="table-view-btn"><List className="size-4" /></Button>
              </div>
              <PrimaryAction
                color="#7c3aed"
                icon={Plus}
                onClick={() => setAddOpen(true)}
                testId="add-candidate-btn"
              >
                Add Candidate
              </PrimaryAction>
            </div>
          }
        />
      </Fade>

      <Fade>
        <IndexToolbar
          search={search}
          onSearch={setSearch}
          placeholder="Search candidates..."
          color="#7c3aed"
          extra={
            <div className="flex gap-2">
              <Select value={jobFilter} onValueChange={setJobFilter}>
                <SelectTrigger className="w-52" data-testid="job-filter"><SelectValue placeholder="All Jobs" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Jobs</SelectItem>
                  {jobOpenings.filter(j => j.status !== "closed").map(j => <SelectItem key={j.id} value={j.id}>{j.title}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={sourceFilter} onValueChange={setSourceFilter}>
                <SelectTrigger className="w-36" data-testid="source-filter"><SelectValue placeholder="Source" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  {sources.map(s => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          }
        />
      </Fade>

      {view === "kanban" ? (
        <Fade>
          <KanbanBoard
            columns={pipelineStages.map((stage) => {
              const stageCandidates = filtered.filter(c => c.stage === stage);
              return {
                id: stage,
                title: stageConfig[stage].label,
                cards: stageCandidates.map(c => ({
                  id: c.id,
                  title: c.name,
                  subtitle: c.currentRole,
                })),
              };
            })}
            columnClassName="flex-shrink-0 w-52"
            onCardMove={(cardId, sourceColumnId, targetColumnId) => {
              const sourceLabel = stageConfig[sourceColumnId]?.label ?? sourceColumnId;
              const targetLabel = stageConfig[targetColumnId]?.label ?? targetColumnId;
              const candidate = candidates.find(c => c.id === cardId);
              setCandidates(prev => prev.map(c =>
                c.id === cardId ? { ...c, stage: targetColumnId as Candidate["stage"] } : c
              ));
              toast({
                title: "Stage Updated",
                description: `${candidate?.name ?? cardId} moved from ${sourceLabel} to ${targetLabel}`,
              });
            }}
            renderColumnHeader={(column) => {
              const config = stageConfig[column.id];
              return (
                <div className={`rounded-t-lg px-3 py-2 border ${config.bg}`} data-testid={`kanban-col-${column.id}`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-semibold ${config.color}`}>{config.label}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium bg-white/80 ${config.color}`}>{column.cards.length}</span>
                  </div>
                </div>
              );
            }}
            renderCard={(card) => {
              const c = filtered.find(cand => cand.id === card.id);
              if (!c) return null;
              return (
                <Card
                  className="border shadow-sm cursor-pointer hover-elevate"
                  onClick={() => setLocation(`/ats/candidates/${c.id}`)}
                  data-testid={`candidate-card-${c.id}`}
                >
                  <CardContent className="p-3 space-y-2">
                    <PersonCell name={c.name} subtitle={c.currentRole} size="sm" />
                    <p className="text-[10px] text-muted-foreground truncate">{c.currentCompany}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full">{c.experience}y exp</span>
                      <StatusBadge status={c.source} />
                    </div>
                  </CardContent>
                </Card>
              );
            }}
          />
        </Fade>
      ) : (
        <Fade>
          <DataTableContainer>
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/30">
                <tr>
                  <DataTH>Candidate</DataTH>
                  <DataTH>Current Role</DataTH>
                  <DataTH>Job Applied</DataTH>
                  <DataTH>Exp</DataTH>
                  <DataTH>Source</DataTH>
                  <DataTH>Stage</DataTH>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map(c => (
                  <DataTR key={c.id} onClick={() => setLocation(`/ats/candidates/${c.id}`)} data-testid={`candidate-row-${c.id}`}>
                    <DataTD>
                      <PersonCell name={c.name} subtitle={c.email} />
                    </DataTD>
                    <DataTD className="text-muted-foreground">{c.currentRole} · {c.currentCompany}</DataTD>
                    <DataTD>{c.appliedJobTitle}</DataTD>
                    <DataTD>{c.experience}y</DataTD>
                    <DataTD><StatusBadge status={c.source} /></DataTD>
                    <DataTD><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${stageConfig[c.stage]?.bg || "bg-muted"} ${stageConfig[c.stage]?.color || "text-muted-foreground"}`}>{c.stage}</span></DataTD>
                  </DataTR>
                ))}
                {filtered.length === 0 && <tr><td colSpan={6} className="px-4 py-12 text-center text-muted-foreground text-sm">No candidates found</td></tr>}
              </tbody>
            </table>
          </DataTableContainer>
        </Fade>
      )}

      <DetailModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add Candidate"
        subtitle="Add a new candidate to the recruitment pipeline"
        footer={
          <PrimaryAction color="#7c3aed" onClick={() => setAddOpen(false)} data-testid="submit-candidate">Add Candidate</PrimaryAction>
        }
      >
        <DetailSection title="Candidate Details">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5"><label className="text-sm font-medium">Full Name</label><Input placeholder="e.g. Aarav Sharma" /></div>
            <div className="space-y-1.5"><label className="text-sm font-medium">Email</label><Input type="email" placeholder="aarav@email.com" /></div>
            <div className="space-y-1.5"><label className="text-sm font-medium">Phone</label><Input placeholder="+91 98765 43210" /></div>
            <div className="space-y-1.5"><label className="text-sm font-medium">Current Role</label><Input placeholder="e.g. Backend Engineer" /></div>
            <div className="space-y-1.5"><label className="text-sm font-medium">Current Company</label><Input placeholder="e.g. Swiggy" /></div>
            <div className="space-y-1.5"><label className="text-sm font-medium">Experience (years)</label><Input type="number" placeholder="e.g. 4" /></div>
            <div className="space-y-1.5"><label className="text-sm font-medium">Applying For</label>
              <Select><SelectTrigger><SelectValue placeholder="Select job opening" /></SelectTrigger>
                <SelectContent>{jobOpenings.filter(j => j.status === "active").map(j => <SelectItem key={j.id} value={j.id}>{j.title}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><label className="text-sm font-medium">Source</label>
              <Select><SelectTrigger><SelectValue placeholder="How did they apply?" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="linkedin">LinkedIn</SelectItem>
                  <SelectItem value="referral">Referral</SelectItem>
                  <SelectItem value="website">Website</SelectItem>
                  <SelectItem value="job-board">Job Board</SelectItem>
                  <SelectItem value="direct">Direct</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </DetailSection>
      </DetailModal>
      <SopModal open={sopOpen} onOpenChange={setSopOpen} config={SOP_REGISTRY["ats-candidates"].sop} color={ATS_COLOR} />
      <TutorialModal open={tutorialOpen} onOpenChange={setTutorialOpen} config={SOP_REGISTRY["ats-candidates"].tutorial} color={ATS_COLOR} />
    </PageShell>
  );
}
