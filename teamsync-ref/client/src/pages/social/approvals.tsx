import { useState } from "react";
import { PersonCell } from "@/components/ui/avatar-cells";
import { CheckCircle2, XCircle, Clock, ShieldCheck } from "lucide-react";
import { SiInstagram, SiYoutube,  SiFacebook, SiThreads } from "react-icons/si";
import { SiLinkedin } from "@/lib/icon-compat";
import { PageTransition, Stagger, StaggerItem, Fade } from "@/components/ui/animated";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { useToast } from "@/hooks/use-toast";
import { approvalRequests as initialApprovals, type ApprovalRequest } from "@/lib/mock-data-social";
import { PageShell } from "@/components/layout";


const platformIcons: Record<string, { icon: React.ElementType; color: string }> = {
  instagram: { icon: SiInstagram, color: "#E11D48" },
  youtube: { icon: SiYoutube, color: "#DC2626" },
  linkedin: { icon: SiLinkedin, color: "#2563EB" },
  facebook: { icon: SiFacebook, color: "#1D4ED8" },
  threads: { icon: SiThreads, color: "#1F2937" },
};

export default function SocialApprovals() {
  const isLoading = useSimulatedLoading(600);
  const { toast } = useToast();
  const [approvals, setApprovals] = useState<ApprovalRequest[]>(initialApprovals);
  const [activeTab, setActiveTab] = useState<"pending" | "approved" | "rejected">("pending");
  const [approveDialog, setApproveDialog] = useState<ApprovalRequest | null>(null);
  const [rejectDialog, setRejectDialog] = useState<ApprovalRequest | null>(null);
  const [comment, setComment] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [filterBrand, setFilterBrand] = useState("All");
  const [filterPriority, setFilterPriority] = useState("All");

  const pending = approvals.filter(a => a.status === "pending");
  const approved = approvals.filter(a => a.status === "approved");
  const rejected = approvals.filter(a => a.status === "rejected");

  const brands = ["All", ...Array.from(new Set(approvals.map(a => a.brand)))];

  const filterList = (list: ApprovalRequest[]) => list.filter(a => {
    if (filterBrand !== "All" && a.brand !== filterBrand) return false;
    if (filterPriority !== "All" && a.priority !== filterPriority.toLowerCase()) return false;
    return true;
  });

  const handleApprove = () => {
    if (!approveDialog) return;
    setApprovals(prev => prev.map(a => a.id === approveDialog.id ? { ...a, status: "approved", approverComment: comment, reviewedDate: "2026-02-28" } : a));
    toast({ title: "Post Approved", description: `"${approveDialog.postTitle}" has been approved and is ready to schedule.` });
    setApproveDialog(null);
    setComment("");
  };

  const handleReject = () => {
    if (!rejectDialog || !rejectReason.trim()) return;
    setApprovals(prev => prev.map(a => a.id === rejectDialog.id ? { ...a, status: "rejected", approverComment: rejectReason, reviewedDate: "2026-02-28" } : a));
    toast({ title: "Post Rejected", description: `"${rejectDialog.postTitle}" has been rejected with feedback.`, variant: "destructive" });
    setRejectDialog(null);
    setRejectReason("");
  };

  const tabs = [
    { key: "pending", label: "Pending", count: pending.length, color: "text-amber-600" },
    { key: "approved", label: "Approved", count: approved.length, color: "text-emerald-600" },
    { key: "rejected", label: "Rejected", count: rejected.length, color: "text-red-600" },
  ] as const;

  const activeList = filterList(activeTab === "pending" ? pending : activeTab === "approved" ? approved : rejected);

  if (isLoading) {
    return (
      <PageShell>
        <div className="grid grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <div key={i} className="h-20 bg-muted rounded-xl" />)}</div>
        <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="h-40 bg-muted rounded-xl" />)}</div>
      </PageShell>
    );
  }

  return (
    <PageTransition className="px-16 py-6 lg:px-24 space-y-6">
      <Fade>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold font-heading">Approvals Queue</h1>
            <p className="text-muted-foreground text-sm mt-0.5">Review and approve posts before they go live</p>
          </div>
        </div>
      </Fade>

      <Stagger>
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Pending", value: pending.length, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950/30" },
            { label: "Approved This Month", value: approved.length, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/30" },
            { label: "Rejected", value: rejected.length, color: "text-red-600", bg: "bg-red-50 dark:bg-red-950/30" },
            { label: "High Priority", value: approvals.filter(a => a.priority === "high").length, color: "text-violet-600", bg: "bg-violet-50 dark:bg-violet-950/30" },
          ].map((s, i) => (
            <StaggerItem key={i}>
              <Card>
                <CardContent className={`p-4 ${s.bg} rounded-xl`}>
                  <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
                </CardContent>
              </Card>
            </StaggerItem>
          ))}
        </div>
      </Stagger>

      <Fade>
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex rounded-lg border bg-muted/40 p-0.5 gap-0.5">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === tab.key ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                data-testid={`tab-${tab.key}`}
              >
                {tab.label}
                <span className={`ml-1.5 text-xs font-bold ${activeTab === tab.key ? tab.color : "text-muted-foreground"}`}>{tab.count}</span>
              </button>
            ))}
          </div>
          <select
            value={filterBrand}
            onChange={e => setFilterBrand(e.target.value)}
            className="text-sm border rounded-lg px-3 py-1.5 bg-background"
            data-testid="filter-brand"
          >
            {brands.map(b => <option key={b}>{b}</option>)}
          </select>
          <select
            value={filterPriority}
            onChange={e => setFilterPriority(e.target.value)}
            className="text-sm border rounded-lg px-3 py-1.5 bg-background"
            data-testid="filter-priority"
          >
            {["All", "High", "Normal"].map(p => <option key={p}>{p}</option>)}
          </select>
        </div>
      </Fade>

      <div className="space-y-4">
        {activeList.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <ShieldCheck size={40} className="mx-auto mb-3 opacity-30" />
            <p>No {activeTab} approvals</p>
          </div>
        )}
        {activeList.map(appr => (
          <Fade key={appr.id}>
            <Card data-testid={`approval-card-${appr.id}`}>
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <span className="font-semibold text-sm">{appr.postTitle}</span>
                      {appr.priority === "high" && (
                        <Badge className="bg-red-100 text-red-700 border-red-200 text-[10px]">High Priority</Badge>
                      )}
                      <Badge variant="outline" className="text-[10px]">{appr.brand}</Badge>
                      {appr.platforms.map(p => {
                        const { icon: PIcon, color } = platformIcons[p];
                        return <PIcon key={p} size={12} style={{ color }} />;
                      })}
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {appr.postCaption.slice(0, 160)}{appr.postCaption.length > 160 ? "…" : ""}
                    </p>
                    <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1.5">Submitted by <PersonCell name={appr.submittedBy} size="xs" /></span>
                      <span>·</span>
                      <span>{appr.submittedDate}</span>
                    </div>
                    {(appr.status === "approved" || appr.status === "rejected") && appr.approverComment && (
                      <div className={`mt-3 p-3 rounded-lg text-xs ${appr.status === "approved" ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300" : "bg-red-50 dark:bg-red-950/20 text-red-800 dark:text-red-300"}`}>
                        <span className="font-medium">Founder's note: </span>{appr.approverComment}
                        {appr.reviewedDate && <span className="ml-2 opacity-60">· {appr.reviewedDate}</span>}
                      </div>
                    )}
                  </div>
                  {appr.status === "pending" && (
                    <div className="flex gap-2 shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                        onClick={() => setApproveDialog(appr)}
                        data-testid={`btn-approve-${appr.id}`}
                      >
                        <CheckCircle2 size={14} className="mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-red-300 text-red-700 hover:bg-red-50"
                        onClick={() => setRejectDialog(appr)}
                        data-testid={`btn-reject-${appr.id}`}
                      >
                        <XCircle size={14} className="mr-1" />
                        Reject
                      </Button>
                    </div>
                  )}
                  {appr.status === "approved" && (
                    <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 shrink-0">
                      <CheckCircle2 size={11} className="mr-1" /> Approved
                    </Badge>
                  )}
                  {appr.status === "rejected" && (
                    <Badge className="bg-red-100 text-red-700 border-red-200 shrink-0">
                      <XCircle size={11} className="mr-1" /> Rejected
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </Fade>
        ))}
      </div>

      <Dialog open={!!approveDialog} onOpenChange={() => { setApproveDialog(null); setComment(""); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Post</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-sm text-muted-foreground">Approving: <span className="font-medium text-foreground">{approveDialog?.postTitle}</span></p>
            <div>
              <Label className="text-sm">Note (optional)</Label>
              <Textarea
                placeholder="Any scheduling instructions or feedback..."
                value={comment}
                onChange={e => setComment(e.target.value)}
                className="mt-1.5"
                rows={3}
                data-testid="input-approve-comment"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveDialog(null)}>Cancel</Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleApprove} data-testid="btn-confirm-approve">
              Approve Post
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!rejectDialog} onOpenChange={() => { setRejectDialog(null); setRejectReason(""); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Post</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-sm text-muted-foreground">Rejecting: <span className="font-medium text-foreground">{rejectDialog?.postTitle}</span></p>
            <div>
              <Label className="text-sm">Reason for rejection <span className="text-red-500">*</span></Label>
              <Textarea
                placeholder="Tell the team what needs to be changed..."
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                className="mt-1.5"
                rows={4}
                data-testid="input-reject-reason"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialog(null)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={!rejectReason.trim()}
              data-testid="btn-confirm-reject"
            >
              Reject Post
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageTransition>
  );
}
