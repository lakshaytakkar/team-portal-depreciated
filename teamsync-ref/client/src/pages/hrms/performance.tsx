import { useState } from "react";
import { Award, Star } from "lucide-react";
import { Fade } from "@/components/ui/animated";
import { CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { performanceReviews } from "@/lib/mock-data-hrms";
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

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <Star key={s} className={`size-3.5 ${s <= Math.round(rating) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`} />
      ))}
      <span className="text-xs text-muted-foreground ml-1">{rating}</span>
    </div>
  );
}

export default function HrmsPerformance() {
  const isLoading = useSimulatedLoading(700);
  const [cycleFilter, setCycleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [cycleDialog, setCycleDialog] = useState(false);
  const [search, setSearch] = useState("");
  const [sopOpen, setSopOpen] = useState(false);
  const [tutorialOpen, setTutorialOpen] = useState(false);

  const pending = performanceReviews.filter(r => r.status === "pending").length;
  const submitted = performanceReviews.filter(r => r.status === "submitted").length;
  const acknowledged = performanceReviews.filter(r => r.status === "acknowledged").length;
  const avgRating = (performanceReviews.filter(r => r.rating > 0).reduce((s, r) => s + r.rating, 0) / performanceReviews.filter(r => r.rating > 0).length).toFixed(1);

  const cycles = Array.from(new Set(performanceReviews.map(r => r.reviewCycle)));

  const filtered = performanceReviews.filter(r => {
    const matchCycle = cycleFilter === "all" || r.reviewCycle === cycleFilter;
    const matchStatus = statusFilter === "all" || r.status === statusFilter;
    const matchSearch = r.employeeName.toLowerCase().includes(search.toLowerCase());
    return matchCycle && matchStatus && matchSearch;
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
          title="Performance Reviews"
          subtitle="Track and manage employee performance evaluations"
          actions={
            <>
              <SopTutorialButtons onSopClick={() => setSopOpen(true)} onTutorialClick={() => setTutorialOpen(true)} />
              <PrimaryAction
                color="#0284c7"
                icon={Award}
                onClick={() => setCycleDialog(true)}
                testId="start-review-btn"
              >
                Start Review Cycle
              </PrimaryAction>
            </>
          }
        />
      </Fade>

      <Fade>
        <StatGrid>
          <StatCard
            label="Pending Reviews"
            value={pending}
            icon={Award}
            iconBg="rgba(245, 158, 11, 0.1)"
            iconColor="#f59e0b"
          />
          <StatCard
            label="Submitted"
            value={submitted}
            icon={Award}
            iconBg="rgba(14, 165, 233, 0.1)"
            iconColor="#0ea5e9"
          />
          <StatCard
            label="Acknowledged"
            value={acknowledged}
            icon={Award}
            iconBg="rgba(16, 185, 129, 0.1)"
            iconColor="#10b981"
          />
          <StatCard
            label="Avg Rating"
            value={avgRating}
            icon={Award}
            iconBg="rgba(139, 92, 246, 0.1)"
            iconColor="#8b5cf6"
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
              <Select value={cycleFilter} onValueChange={setCycleFilter}>
                <SelectTrigger className="w-36" data-testid="cycle-filter"><SelectValue placeholder="All Cycles" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cycles</SelectItem>
                  {cycles.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-36" data-testid="status-filter"><SelectValue placeholder="All Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="acknowledged">Acknowledged</SelectItem>
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
                <DataTH>Review Cycle</DataTH>
                <DataTH>Rating</DataTH>
                <DataTH>Reviewer</DataTH>
                <DataTH>Status</DataTH>
                <DataTH>Completed</DataTH>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((r) => (
                <DataTR key={r.id} data-testid={`review-row-${r.id}`}>
                  <DataTD><PersonCell name={r.employeeName} size="sm" /></DataTD>
                  <DataTD className="text-muted-foreground">{r.reviewCycle}</DataTD>
                  <DataTD>{r.rating > 0 ? <StarRating rating={r.rating} /> : <span className="text-xs text-muted-foreground">—</span>}</DataTD>
                  <DataTD><PersonCell name={r.reviewer} size="sm" /></DataTD>
                  <DataTD>
                    <StatusBadge status={r.status} />
                  </DataTD>
                  <DataTD className="text-muted-foreground">{r.completedDate || "—"}</DataTD>
                </DataTR>
              ))}
              {filtered.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground text-sm">No reviews found</td></tr>}
            </tbody>
          </table>
        </DataTableContainer>
      </Fade>

      <DetailModal
        open={cycleDialog}
        onClose={() => setCycleDialog(false)}
        title="Start New Review Cycle"
        footer={
          <>
            <Button variant="outline" onClick={() => setCycleDialog(false)}>Cancel</Button>
            <PrimaryAction color="#0284c7" onClick={() => setCycleDialog(false)} data-testid="confirm-cycle">Create Cycle</PrimaryAction>
          </>
        }
      >
        <DetailSection title="Cycle Details">
          <div className="space-y-4">
            <div className="space-y-1.5"><label className="text-sm font-medium">Cycle Name</label><Input placeholder="e.g. Q1 2026" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5"><label className="text-sm font-medium">Start Date</label><Input type="date" /></div>
              <div className="space-y-1.5"><label className="text-sm font-medium">End Date</label><Input type="date" /></div>
            </div>
            <div className="space-y-1.5"><label className="text-sm font-medium">Department</label>
              <Select><SelectTrigger><SelectValue placeholder="All Departments" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  <SelectItem value="engineering">Engineering</SelectItem>
                  <SelectItem value="operations">Operations</SelectItem>
                  <SelectItem value="sales">Sales</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="hr">HR</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </DetailSection>
      </DetailModal>

      <SopModal open={sopOpen} onOpenChange={setSopOpen} config={SOP_REGISTRY["hrms-performance"].sop} color={HRMS_COLOR} />
      <TutorialModal open={tutorialOpen} onOpenChange={setTutorialOpen} config={SOP_REGISTRY["hrms-performance"].tutorial} color={HRMS_COLOR} />
    </PageShell>
  );
}
