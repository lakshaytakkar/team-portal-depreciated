import { useState, useMemo } from "react";
import {
  Plus,
  Search,
  Phone,
  Mail,
  Copy,
  BookOpen,
  Clock,
  Flame,
  MessageCircle,
  ExternalLink,
  Calendar,
  User,
  MapPin,
  FileText,
  Link2,
} from "lucide-react";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  pipelineLeads,
  pipelineStageConfig,
  type PipelineLead,
  type PipelineStage,
} from "@/lib/mock-data-sales";
import { PersonCell } from "@/components/ui/avatar-cells";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import {
  PageShell,
  PageHeader,
  FilterPill,
  StatCard,
  StatGrid,
  DataTableContainer,
  DataTH,
  DataTD,
  DataTR,
} from "@/components/layout";
import { StatusBadge } from "@/components/ds/status-badge";
import { KanbanBoard, type KanbanColumnData, type KanbanCardItem } from "@/components/blocks";
import { verticals } from "@/lib/verticals-config";
import { DS } from "@/lib/design-tokens";

const STAGES: PipelineStage[] = ["new", "contacted", "engaged", "qualified", "demo_done", "negotiation", "converted"];

const engagementLabels: Record<string, { label: string; variant: "info" | "warning" | "error" }> = {
  cold: { label: "Cold", variant: "info" },
  warm: { label: "Warm", variant: "warning" },
  hot: { label: "Hot", variant: "error" },
};

function daysVariant(days: number): "success" | "warning" | "error" {
  if (days <= 2) return "success";
  if (days <= 5) return "warning";
  return "error";
}

function scoreBarColor(score: number): string {
  if (score >= 70) return DS.color.system.success;
  if (score >= 40) return DS.color.system.warning;
  return "hsl(var(--muted-foreground))";
}

function generateWhatsAppMessage(lead: PipelineLead): string {
  const stage = pipelineStageConfig[lead.pipelineStage].label;
  if (lead.pipelineStage === "new") {
    return `Hi ${lead.name}! Welcome to USDrop AI. I see you've started your dropshipping journey and completed ${lead.chaptersCompleted} chapters already. I'm ${lead.assignedTo}, your dedicated success manager. How can I help you get started?`;
  }
  if (lead.pipelineStage === "contacted" || lead.pipelineStage === "engaged") {
    return `Hi ${lead.name}! Great progress on your learning - ${lead.chaptersCompleted}/${lead.totalChapters} chapters done! Ready to take the next step? I'd love to show you how our paid tools can accelerate your dropshipping business. When's a good time for a quick call?`;
  }
  if (lead.pipelineStage === "qualified" || lead.pipelineStage === "demo_done") {
    return `Hi ${lead.name}! Following up on our conversation about USDrop AI Pro. You've already mastered the fundamentals (${lead.chaptersCompleted} chapters complete). Let me know if you have any questions about the plan - I can also share some success stories from similar users.`;
  }
  return `Hi ${lead.name}! Just checking in on your decision. Our special offer is still available. Let me know if you'd like to discuss anything - happy to help!`;
}

export default function LeadsPage() {
  const loading = useSimulatedLoading();
  const [data, setData] = useState<PipelineLead[]>(pipelineLeads);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("kanban");
  const [selectedLead, setSelectedLead] = useState<PipelineLead | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [dateFilter, setDateFilter] = useState("all");
  const { toast } = useToast();

  const vertical = verticals.find((v) => v.id === "usdrop")!;

  const filtered = useMemo(() => {
    return data.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.email.toLowerCase().includes(search.toLowerCase()) ||
        item.phone.includes(search);
      return matchesSearch;
    });
  }, [data, search]);

  const kanbanColumns: KanbanColumnData[] = useMemo(() => {
    return STAGES.map((stage) => {
      const stageLeads = filtered.filter((l) => l.pipelineStage === stage);
      const config = pipelineStageConfig[stage];
      return {
        id: stage,
        title: config.label,
        color: config.color,
        cards: stageLeads.map((l) => ({
          id: l.id,
          title: l.name,
          subtitle: `${l.chaptersCompleted}/${l.totalChapters} chapters`,
          badges: [
            { label: engagementLabels[l.engagementLevel].label, variant: "secondary" },
          ],
          dueDate: `${l.daysInStage}d in stage`,
          assignee: l.assignedTo,
        })),
      };
    });
  }, [filtered]);

  const hotLeads = useMemo(() => {
    return [...filtered]
      .filter((l) => l.pipelineStage !== "converted")
      .sort((a, b) => b.engagementScore - a.engagementScore);
  }, [filtered]);

  const stats = useMemo(() => {
    const total = data.length;
    const hot = data.filter((l) => l.engagementLevel === "hot").length;
    const converted = data.filter((l) => l.pipelineStage === "converted").length;
    const avgScore = Math.round(data.reduce((s, l) => s + l.engagementScore, 0) / total);
    return { total, hot, converted, avgScore };
  }, [data]);

  function handleCardClick(card: KanbanCardItem) {
    const lead = data.find((l) => l.id === card.id);
    if (lead) {
      setSelectedLead(lead);
      setDrawerOpen(true);
    }
  }

  function handleCardMove(cardId: string, _sourceCol: string, targetCol: string) {
    setData((prev) =>
      prev.map((l) =>
        l.id === cardId ? { ...l, pipelineStage: targetCol as PipelineStage, daysInStage: 0 } : l
      )
    );
  }

  function handleCopyWhatsApp(lead: PipelineLead) {
    const msg = generateWhatsAppMessage(lead);
    navigator.clipboard.writeText(msg).then(() => {
      toast({ title: "Copied to clipboard", description: "WhatsApp message ready to paste" });
    });
  }

  function renderKanbanCard(card: KanbanCardItem, _columnId: string) {
    const lead = data.find((l) => l.id === card.id);
    if (!lead) return null;
    const eng = engagementLabels[lead.engagementLevel];

    return (
      <Card
        className="p-3 cursor-pointer hover-elevate"
        onClick={() => {
          setSelectedLead(lead);
          setDrawerOpen(true);
        }}
        data-testid={`kanban-card-${lead.id}`}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium truncate" data-testid={`card-name-${lead.id}`}>{lead.name}</p>
            <p className="text-xs text-muted-foreground mt-0.5 truncate">{lead.phone}</p>
          </div>
          <StatusBadge status={eng.label} variant={eng.variant} className="shrink-0" />
        </div>
        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <BookOpen className="h-3 w-3" />
            {lead.chaptersCompleted}/{lead.totalChapters}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <StatusBadge status={`${lead.daysInStage}d`} variant={daysVariant(lead.daysInStage)} className="px-1 py-0 text-[10px]" />
          </span>
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-[11px] text-muted-foreground">{lead.assignedTo.split(" ")[0]}</span>
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6"
            onClick={(e) => {
              e.stopPropagation();
              handleCopyWhatsApp(lead);
            }}
            data-testid={`btn-whatsapp-${lead.id}`}
          >
            <MessageCircle className="h-3 w-3" />
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <PageShell>
      <PageHeader
        title="Pipeline"
        subtitle="Pre-sales pipeline management with kanban and hot leads tracking"
        actions={
          <Button
            className="gap-2"
            style={{ backgroundColor: vertical.color }}
            onClick={() => setAddDialogOpen(true)}
            data-testid="button-add-lead"
          >
            <Plus className="h-4 w-4" />
            Add Lead
          </Button>
        }
      />

      <StatGrid>
        <StatCard
          label="Total Leads"
          value={stats.total}
          icon={User}
          iconBg="#6366f120"
          iconColor="#6366f1"
        />
        <StatCard
          label="Hot Leads"
          value={stats.hot}
          icon={Flame}
          iconBg="#ef444420"
          iconColor="#ef4444"
        />
        <StatCard
          label="Converted"
          value={stats.converted}
          icon={ExternalLink}
          iconBg="#22c55e20"
          iconColor="#22c55e"
        />
        <StatCard
          label="Avg Score"
          value={`${stats.avgScore}%`}
          icon={BookOpen}
          iconBg="#f59e0b20"
          iconColor="#f59e0b"
        />
      </StatGrid>

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="relative w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            className="pl-10 h-9 bg-muted/30"
            placeholder="Search leads by name, email, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            data-testid="input-search-leads"
          />
        </div>
        <div className="flex items-center gap-2">
          <FilterPill active={dateFilter === "all"} color={vertical.color} onClick={() => setDateFilter("all")} testId="pill-date-all">All Time</FilterPill>
          <FilterPill active={dateFilter === "7d"} color={vertical.color} onClick={() => setDateFilter("7d")} testId="pill-date-7d">Last 7 Days</FilterPill>
          <FilterPill active={dateFilter === "30d"} color={vertical.color} onClick={() => setDateFilter("30d")} testId="pill-date-30d">Last 30 Days</FilterPill>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList data-testid="tabs-pipeline">
          <TabsTrigger value="kanban" data-testid="tab-kanban">Kanban Board</TabsTrigger>
          <TabsTrigger value="hot-leads" data-testid="tab-hot-leads">Hot Leads</TabsTrigger>
        </TabsList>

        <TabsContent value="kanban" className="mt-4">
          {loading ? (
            <TableSkeleton rows={6} columns={7} />
          ) : (
            <KanbanBoard
              columns={kanbanColumns}
              onCardClick={handleCardClick}
              onCardMove={handleCardMove}
              renderCard={renderKanbanCard}
              columnClassName="w-52 min-w-[13rem]"
            />
          )}
        </TabsContent>

        <TabsContent value="hot-leads" className="mt-4">
          {loading ? (
            <TableSkeleton rows={10} columns={6} />
          ) : (
            <DataTableContainer>
              <table className="w-full text-sm">
                <thead>
                  <tr className={DS.table.headerRow}>
                    <DataTH>Contact</DataTH>
                    <DataTH>Engagement</DataTH>
                    <DataTH>Score</DataTH>
                    <DataTH>Chapters</DataTH>
                    <DataTH>Stage</DataTH>
                    <DataTH>Days in Stage</DataTH>
                    <DataTH align="right">Actions</DataTH>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {hotLeads.map((lead) => {
                    const eng = engagementLabels[lead.engagementLevel];
                    const stageConf = pipelineStageConfig[lead.pipelineStage];
                    return (
                      <DataTR
                        key={lead.id}
                        className="cursor-pointer"
                        onClick={() => {
                          setSelectedLead(lead);
                          setDrawerOpen(true);
                        }}
                        data-testid={`hot-lead-row-${lead.id}`}
                      >
                        <DataTD>
                          <PersonCell name={lead.name} subtitle={lead.phone} size="sm" />
                        </DataTD>
                        <DataTD>
                          <StatusBadge status={eng.label} variant={eng.variant} />
                        </DataTD>
                        <DataTD>
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-16 rounded-full bg-muted overflow-visible">
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${lead.engagementScore}%`,
                                  backgroundColor: scoreBarColor(lead.engagementScore),
                                }}
                              />
                            </div>
                            <span className="text-xs font-medium">{lead.engagementScore}%</span>
                          </div>
                        </DataTD>
                        <DataTD className="text-sm">
                          {lead.chaptersCompleted}/{lead.totalChapters}
                        </DataTD>
                        <DataTD>
                          <Badge variant="outline" className="text-[10px]" style={{ borderColor: stageConf.color, color: stageConf.color }}>
                            {stageConf.label}
                          </Badge>
                        </DataTD>
                        <DataTD>
                          <StatusBadge status={`${lead.daysInStage} days`} variant={daysVariant(lead.daysInStage)} />
                        </DataTD>
                        <DataTD align="right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopyWhatsApp(lead);
                              }}
                              data-testid={`btn-wa-${lead.id}`}
                            >
                              <MessageCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                window.location.href = `tel:${lead.phone}`;
                              }}
                              data-testid={`btn-call-${lead.id}`}
                            >
                              <Phone className="h-4 w-4" />
                            </Button>
                          </div>
                        </DataTD>
                      </DataTR>
                    );
                  })}
                </tbody>
              </table>
            </DataTableContainer>
          )}
        </TabsContent>
      </Tabs>

      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
          {selectedLead && (
            <>
              <SheetHeader>
                <SheetTitle data-testid="drawer-lead-name">{selectedLead.name}</SheetTitle>
                <SheetDescription>{selectedLead.email}</SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge
                    variant="outline"
                    style={{
                      borderColor: pipelineStageConfig[selectedLead.pipelineStage].color,
                      color: pipelineStageConfig[selectedLead.pipelineStage].color,
                    }}
                    data-testid="badge-lead-stage"
                  >
                    {pipelineStageConfig[selectedLead.pipelineStage].label}
                  </Badge>
                  <StatusBadge
                    status={engagementLabels[selectedLead.engagementLevel].label}
                    variant={engagementLabels[selectedLead.engagementLevel].variant}
                    data-testid="badge-lead-engagement"
                  />
                  {selectedLead.plan !== "none" && (
                    <Badge variant="secondary" data-testid="badge-lead-plan">
                      {selectedLead.plan.charAt(0).toUpperCase() + selectedLead.plan.slice(1)}
                    </Badge>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span data-testid="text-lead-phone">{selectedLead.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="truncate" data-testid="text-lead-email">{selectedLead.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span data-testid="text-lead-location">{selectedLead.city}, {selectedLead.country}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span data-testid="text-lead-created">{selectedLead.createdDate}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={() => handleCopyWhatsApp(selectedLead)}
                    data-testid="btn-drawer-whatsapp"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Copy WhatsApp
                  </Button>
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={() => {
                      toast({ title: "Payment link sent", description: `Sent to ${selectedLead.email}` });
                    }}
                    data-testid="btn-drawer-payment"
                  >
                    <Link2 className="h-4 w-4" />
                    Send Payment Link
                  </Button>
                </div>

                <Separator />

                <div>
                  <h4 className="text-sm font-semibold mb-2" data-testid="section-activity-summary">Activity Summary</h4>
                  <p className="text-sm text-muted-foreground" data-testid="text-activity-summary">
                    {selectedLead.activitySummary}
                  </p>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <Card className="p-3">
                      <p className="text-xs text-muted-foreground">Engagement Score</p>
                      <p className="text-lg font-bold mt-1" data-testid="text-engagement-score">{selectedLead.engagementScore}%</p>
                    </Card>
                    <Card className="p-3">
                      <p className="text-xs text-muted-foreground">Chapters Progress</p>
                      <p className="text-lg font-bold mt-1" data-testid="text-chapters-progress">{selectedLead.chaptersCompleted}/{selectedLead.totalChapters}</p>
                    </Card>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="text-sm font-semibold mb-2" data-testid="section-notes">Notes</h4>
                  <p className="text-sm text-muted-foreground" data-testid="text-lead-notes">{selectedLead.notes}</p>
                </div>

                <Separator />

                <div>
                  <h4 className="text-sm font-semibold mb-2" data-testid="section-call-log">Call Log</h4>
                  {selectedLead.callLog.length === 0 ? (
                    <p className="text-sm text-muted-foreground" data-testid="text-no-calls">No calls recorded yet</p>
                  ) : (
                    <div className="space-y-3">
                      {selectedLead.callLog.map((call, i) => (
                        <div key={i} className="flex items-start gap-3" data-testid={`call-log-${i}`}>
                          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5">
                            <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-sm font-medium">{call.date}</p>
                              <span className="text-xs text-muted-foreground shrink-0">{call.duration}</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">{call.summary}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Separator />

                <div>
                  <h4 className="text-sm font-semibold mb-2" data-testid="section-whatsapp-preview">WhatsApp Message Preview</h4>
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-sm whitespace-pre-wrap" data-testid="text-whatsapp-preview">
                      {generateWhatsAppMessage(selectedLead)}
                    </p>
                    <Button
                      variant="outline"
                      className="mt-2 gap-2"
                      onClick={() => handleCopyWhatsApp(selectedLead)}
                      data-testid="btn-copy-wa-preview"
                    >
                      <Copy className="h-3.5 w-3.5" />
                      Copy Message
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-w-md" data-testid="dialog-add-lead">
          <DialogHeader>
            <DialogTitle>Add New Lead</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              const newLead: PipelineLead = {
                id: `PL-${String(data.length + 1).padStart(3, "0")}`,
                name: fd.get("name") as string,
                email: fd.get("email") as string,
                phone: fd.get("phone") as string,
                source: (fd.get("source") as PipelineLead["source"]) || "website",
                pipelineStage: "new",
                engagementLevel: "cold",
                engagementScore: 0,
                chaptersCompleted: 0,
                totalChapters: 12,
                daysInStage: 0,
                assignedTo: "Karan Gupta",
                createdDate: new Date().toISOString().split("T")[0],
                lastActivity: new Date().toISOString().split("T")[0],
                notes: fd.get("notes") as string || "",
                callLog: [],
                activitySummary: "Newly added lead",
                plan: "none",
                city: fd.get("city") as string || "Unknown",
                country: "India",
              };
              setData((prev) => [newLead, ...prev]);
              setAddDialogOpen(false);
              toast({ title: "Lead added", description: `${newLead.name} added to pipeline` });
            }}
          >
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="lead-name">Name</Label>
                <Input id="lead-name" name="name" required data-testid="input-lead-name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lead-email">Email</Label>
                <Input id="lead-email" name="email" type="email" required data-testid="input-lead-email" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lead-phone">Phone</Label>
                <Input id="lead-phone" name="phone" placeholder="+91 XXXXX XXXXX" required data-testid="input-lead-phone" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lead-city">City</Label>
                <Input id="lead-city" name="city" data-testid="input-lead-city" />
              </div>
              <div className="space-y-2">
                <Label>Source</Label>
                <Select name="source" defaultValue="website">
                  <SelectTrigger data-testid="select-lead-source">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="website">Website</SelectItem>
                    <SelectItem value="youtube">YouTube</SelectItem>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="ad">Ad</SelectItem>
                    <SelectItem value="referral">Referral</SelectItem>
                    <SelectItem value="organic">Organic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="lead-notes">Notes</Label>
                <Textarea id="lead-notes" name="notes" className="resize-none" data-testid="input-lead-notes" />
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setAddDialogOpen(false)} data-testid="btn-cancel-add">Cancel</Button>
              <Button type="submit" style={{ backgroundColor: vertical.color }} data-testid="btn-submit-add">Add Lead</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
