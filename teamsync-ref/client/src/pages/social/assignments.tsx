import { useState } from "react";
import { Plus } from "lucide-react";
import { PageTransition, Stagger, StaggerItem, Fade } from "@/components/ui/animated";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { useToast } from "@/hooks/use-toast";
import { assignments as initialAssignments, socialPosts, campaigns, type Assignment, type AssignmentType } from "@/lib/mock-data-social";
import { PersonCell } from "@/components/ui/avatar-cells";
import { StatusBadge } from "@/components/ds/status-badge";
import { SOCIAL_COLOR } from "@/lib/social-config";
import { PageShell } from "@/components/layout";


const statusCycle: Assignment["status"][] = ["pending", "in-progress", "done"];

const teamMembers = [
  { name: "Ananya", role: "SM Manager" },
  { name: "Rahul", role: "Content Creator" },
  { name: "Priya", role: "Designer" },
  { name: "Dev", role: "Copywriter" },
  { name: "Founder", role: "Founder" },
];

const assignmentTypes: AssignmentType[] = ["caption", "script", "design", "scheduling", "reporting"];

export default function SocialAssignments() {
  const isLoading = useSimulatedLoading(600);
  const { toast } = useToast();
  const [assignments, setAssignments] = useState<Assignment[]>(initialAssignments);
  const [filterAssignedTo, setFilterAssignedTo] = useState("All");
  const [filterType, setFilterType] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterCampaign, setFilterCampaign] = useState("All");
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({ title: "", type: "caption" as AssignmentType, assignedTo: "Ananya", postId: "", campaignId: "", dueDate: "", notes: "" });

  const cycleStatus = (id: string) => {
    setAssignments(prev => prev.map(a => {
      if (a.id !== id || a.status === "overdue") return a;
      const idx = statusCycle.indexOf(a.status);
      const next = statusCycle[(idx + 1) % statusCycle.length];
      toast({ title: "Status Updated", description: `Assignment marked as ${next}.` });
      return { ...a, status: next };
    }));
  };

  const filtered = assignments.filter(a => {
    if (filterAssignedTo !== "All" && a.assignedTo !== filterAssignedTo) return false;
    if (filterType !== "All" && a.type !== filterType) return false;
    if (filterStatus !== "All" && a.status !== filterStatus.toLowerCase().replace(" ", "-")) return false;
    if (filterCampaign !== "All" && a.campaignId !== filterCampaign) return false;
    return true;
  });

  const getWorkload = (name: string) => ({
    inProgress: assignments.filter(a => a.assignedTo === name && a.status === "in-progress").length,
    overdue: assignments.filter(a => a.assignedTo === name && a.status === "overdue").length,
  });

  const handleCreate = () => {
    const post = socialPosts.find(p => p.id === form.postId);
    const newAssignment: Assignment = {
      id: `ASN-${assignments.length + 1}`,
      title: form.title,
      type: form.type,
      assignedTo: form.assignedTo,
      role: teamMembers.find(m => m.name === form.assignedTo)?.role ?? "",
      postId: form.postId || null,
      postTitle: post?.title ?? null,
      campaignId: form.campaignId || null,
      dueDate: form.dueDate,
      status: "pending",
      notes: form.notes,
    };
    setAssignments(prev => [...prev, newAssignment]);
    toast({ title: "Assignment Created", description: `"${form.title}" assigned to ${form.assignedTo}.` });
    setCreateOpen(false);
  };

  if (isLoading) {
    return (
      <PageShell>
        <div className="grid grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <div key={i} className="h-20 bg-muted rounded-xl" />)}</div>
        <div className="space-y-3">{[...Array(6)].map((_, i) => <div key={i} className="h-12 bg-muted rounded-lg" />)}</div>
      </PageShell>
    );
  }

  return (
    <PageTransition className="px-16 py-6 lg:px-24 space-y-6">
      <Fade>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold font-heading">Team Assignments</h1>
            <p className="text-muted-foreground text-sm mt-0.5">Track tasks across your social media team</p>
          </div>
          <Button onClick={() => setCreateOpen(true)} data-testid="btn-create-assignment">
            <Plus size={16} className="mr-2" />
            Create Assignment
          </Button>
        </div>
      </Fade>

      <Stagger>
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Total Assignments", value: assignments.length, color: "text-foreground" },
            { label: "Overdue", value: assignments.filter(a => a.status === "overdue").length, color: "text-red-600" },
            { label: "In Progress", value: assignments.filter(a => a.status === "in-progress").length, color: "text-sky-600" },
            { label: "Done This Week", value: assignments.filter(a => a.status === "done").length, color: "text-emerald-600" },
          ].map((s, i) => (
            <StaggerItem key={i}>
              <Card>
                <CardContent className="p-4">
                  <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
                </CardContent>
              </Card>
            </StaggerItem>
          ))}
        </div>
      </Stagger>

      <Fade>
        <div className="flex gap-3 overflow-x-auto pb-1">
          {teamMembers.map(({ name, role }) => {
            const { inProgress, overdue } = getWorkload(name);
            return (
              <div key={name} className="rounded-xl border bg-card p-3 flex items-center gap-3 min-w-[160px] shrink-0" data-testid={`member-card-${name}`}>
                <PersonCell name={name} subtitle={role} size="sm" />
                <div className="flex gap-2 mt-1">
                  <span className="text-[10px] text-sky-600">{inProgress} active</span>
                  {overdue > 0 && <span className="text-[10px] text-red-600 font-medium">{overdue} overdue</span>}
                </div>
              </div>
            );
          })}
        </div>
      </Fade>

      <Fade>
        <div className="flex gap-3 flex-wrap">
          <select value={filterAssignedTo} onChange={e => setFilterAssignedTo(e.target.value)} className="text-sm border rounded-lg px-3 py-1.5 bg-background" data-testid="filter-assigned-to">
            <option value="All">All Members</option>
            {teamMembers.map(m => <option key={m.name}>{m.name}</option>)}
          </select>
          <select value={filterType} onChange={e => setFilterType(e.target.value)} className="text-sm border rounded-lg px-3 py-1.5 bg-background" data-testid="filter-type">
            <option value="All">All Types</option>
            {assignmentTypes.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
          </select>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="text-sm border rounded-lg px-3 py-1.5 bg-background" data-testid="filter-status">
            {["All", "Pending", "In-progress", "Done", "Overdue"].map(s => <option key={s}>{s}</option>)}
          </select>
          <select value={filterCampaign} onChange={e => setFilterCampaign(e.target.value)} className="text-sm border rounded-lg px-3 py-1.5 bg-background" data-testid="filter-campaign">
            <option value="All">All Campaigns</option>
            {campaigns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </Fade>

      <Fade>
        <div className="rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 border-b">
              <tr>
                <th className="text-left p-3 font-medium text-muted-foreground text-xs">Assignment</th>
                <th className="text-left p-3 font-medium text-muted-foreground text-xs">Type</th>
                <th className="text-left p-3 font-medium text-muted-foreground text-xs">Assigned To</th>
                <th className="text-left p-3 font-medium text-muted-foreground text-xs">Linked Post</th>
                <th className="text-left p-3 font-medium text-muted-foreground text-xs">Due Date</th>
                <th className="text-left p-3 font-medium text-muted-foreground text-xs">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(asn => (
                <tr key={asn.id} className="border-b last:border-0 hover:bg-accent/50 transition-colors" data-testid={`assignment-row-${asn.id}`}>
                  <td className="p-3">
                    <p className="text-sm font-medium">{asn.title}</p>
                    {asn.notes && <p className="text-[10px] text-muted-foreground truncate max-w-[200px]">{asn.notes}</p>}
                  </td>
                  <td className="p-3">
                    <Badge >{asn.type}</Badge>
                  </td>
                  <td className="p-3">
                    <PersonCell name={asn.assignedTo} subtitle={asn.role} size="xs" />
                  </td>
                  <td className="p-3 text-xs text-muted-foreground">
                    {asn.postTitle ? <span className="truncate max-w-[140px] block">{asn.postTitle}</span> : "—"}
                  </td>
                  <td className={`p-3 text-xs font-medium ${asn.status === "overdue" ? "text-red-600" : ""}`}>
                    {asn.dueDate}
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => cycleStatus(asn.id)}
                      disabled={asn.status === "overdue"}
                      data-testid={`status-badge-${asn.id}`}
                    >
                      <StatusBadge status={asn.status} />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="text-center py-12 text-muted-foreground">No assignments match your filters</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Fade>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Assignment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Title</Label>
              <Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Write caption for launch reel" data-testid="input-title" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Type</Label>
                <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value as AssignmentType }))} className="w-full text-sm border rounded-lg px-3 py-2 bg-background" data-testid="select-type">
                  {assignmentTypes.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Assign To</Label>
                <select value={form.assignedTo} onChange={e => setForm(p => ({ ...p, assignedTo: e.target.value }))} className="w-full text-sm border rounded-lg px-3 py-2 bg-background" data-testid="select-assigned-to">
                  {teamMembers.map(m => <option key={m.name}>{m.name}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Link Post</Label>
                <select value={form.postId} onChange={e => setForm(p => ({ ...p, postId: e.target.value }))} className="w-full text-sm border rounded-lg px-3 py-2 bg-background" data-testid="select-post">
                  <option value="">No Post</option>
                  {socialPosts.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Link Campaign</Label>
                <select value={form.campaignId} onChange={e => setForm(p => ({ ...p, campaignId: e.target.value }))} className="w-full text-sm border rounded-lg px-3 py-2 bg-background" data-testid="select-campaign">
                  <option value="">No Campaign</option>
                  {campaigns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Due Date</Label>
              <Input type="date" value={form.dueDate} onChange={e => setForm(p => ({ ...p, dueDate: e.target.value }))} data-testid="input-due-date" />
            </div>
            <div className="space-y-1.5">
              <Label>Notes</Label>
              <Textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} rows={3} placeholder="Any context for the assignee..." data-testid="input-notes" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={!form.title.trim()} data-testid="btn-confirm-create">Create Assignment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageTransition>
  );
}
