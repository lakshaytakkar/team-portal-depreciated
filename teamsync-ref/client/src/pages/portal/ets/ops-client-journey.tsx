import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  CheckCircle2,
  Circle,
  ArrowLeft,
  MapPin,
  Package,
  User,
  Calendar,
  ChevronRight,
  CheckSquare,
  Square,
  MessageSquare,
  AlertCircle,
  Loader2,
} from "lucide-react";
import {
  mockOpsClients,
  mockMilestonePayments,
  mockChecklist,
  mockClientChecklistStates,
  mockOpsActivities,
  mockBOQItems,
  mockProductOrders,
  OPS_STAGES,
  OPS_STAGE_LABELS,
  CHECKLIST_CATEGORIES,
  MILESTONE_LABELS,
  type OpsStage,
  type MilestonePayment,
  type OpsActivity,
  type ClientChecklistState,
} from "@/lib/mock-data-ops-ets";

const STAGE_INDEX: Record<OpsStage, number> = Object.fromEntries(
  OPS_STAGES.map((s, i) => [s, i])
) as Record<OpsStage, number>;

function daysSince(dateStr: string): number {
  const d = new Date(dateStr);
  const now = new Date("2026-03-26");
  return Math.floor((now.getTime() - d.getTime()) / 86400000);
}

function fmtDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function fmtCurrency(amount: number): string {
  return "₹" + amount.toLocaleString("en-IN");
}

function fmtTimestamp(ts: string): string {
  return new Date(ts).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function EtsOpsClientJourney() {
  const [, params] = useRoute("/portal-ets/ops/client/:id");
  const [, navigate] = useLocation();
  const clientId = params?.id ?? "";

  const client = mockOpsClients.find((c) => c.id === clientId);

  const [currentStage, setCurrentStage] = useState<OpsStage>(client?.currentStage ?? "token-paid");
  const [showAdvanceConfirm, setShowAdvanceConfirm] = useState(false);
  const [advanceNote, setAdvanceNote] = useState("");

  const [milestones, setMilestones] = useState<MilestonePayment[]>(
    mockMilestonePayments.filter((m) => m.clientId === clientId)
  );

  const checklistState = mockClientChecklistStates.find((cs) => cs.clientId === clientId);
  const [completedItems, setCompletedItems] = useState<Set<string>>(
    new Set(checklistState?.completedItems ?? [])
  );

  const [activities, setActivities] = useState<OpsActivity[]>(
    mockOpsActivities.filter((a) => a.clientId === clientId).sort((a, b) => b.timestamp.localeCompare(a.timestamp))
  );
  const [noteText, setNoteText] = useState("");

  if (!client) {
    return (
      <div className="px-6 py-12 text-center text-muted-foreground" data-testid="ops-client-not-found">
        Client not found.
        <Button variant="link" onClick={() => navigate("/portal-ets/ops")} className="ml-2">
          Back to Dashboard
        </Button>
      </div>
    );
  }

  const currentStageIndex = STAGE_INDEX[currentStage];
  const nextStage = OPS_STAGES[currentStageIndex + 1];
  const isLaunched = currentStage === "launched";

  const totalChecklist = mockChecklist.length;
  const checklistCompletion = Math.round((completedItems.size / totalChecklist) * 100);

  function advanceStage() {
    if (!nextStage) return;
    const newActivity: OpsActivity = {
      id: `A-new-${Date.now()}`,
      clientId,
      type: "stage-change",
      title: `Stage advanced to ${OPS_STAGE_LABELS[nextStage]}`,
      description: advanceNote || "Stage advanced by ops team.",
      actor: "Aditya",
      timestamp: new Date().toISOString(),
    };
    setActivities([newActivity, ...activities]);
    setCurrentStage(nextStage);
    setShowAdvanceConfirm(false);
    setAdvanceNote("");
  }

  function toggleMilestonePaid(milestoneId: string) {
    setMilestones((prev) =>
      prev.map((m) =>
        m.id === milestoneId
          ? { ...m, isPaid: true, paidDate: "2026-03-26", paymentMethod: "bank-transfer" }
          : m
      )
    );
    const ms = milestones.find((m) => m.id === milestoneId);
    if (ms) {
      const newActivity: OpsActivity = {
        id: `A-ms-${Date.now()}`,
        clientId,
        type: "milestone-paid",
        title: `${MILESTONE_LABELS[ms.type]} payment received`,
        description: `${fmtCurrency(ms.amountDue)} marked as paid.`,
        actor: "Aditya",
        timestamp: new Date().toISOString(),
      };
      setActivities([newActivity, ...activities]);
    }
  }

  function toggleChecklistItem(itemId: string) {
    setCompletedItems((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
        const item = mockChecklist.find((c) => c.id === itemId);
        if (item) {
          const newActivity: OpsActivity = {
            id: `A-cl-${Date.now()}`,
            clientId,
            type: "checklist-complete",
            title: `Checklist: "${item.label}" completed`,
            description: `Item in ${item.category} category marked complete.`,
            actor: "Aditya",
            timestamp: new Date().toISOString(),
          };
          setActivities((prev) => [newActivity, ...prev]);
        }
      }
      return next;
    });
  }

  function addNote() {
    if (!noteText.trim()) return;
    const newActivity: OpsActivity = {
      id: `A-note-${Date.now()}`,
      clientId,
      type: "note",
      title: "Note added",
      description: noteText.trim(),
      actor: "Aditya",
      timestamp: new Date().toISOString(),
    };
    setActivities([newActivity, ...activities]);
    setNoteText("");
  }

  const boqItems = mockBOQItems[clientId] ?? mockBOQItems["OC001"];
  const boqTotal = boqItems.reduce((s, i) => s + i.qty * i.unitPrice, 0);
  const productOrder = mockProductOrders[clientId];

  const packageColors: Record<string, string> = {
    lite: "bg-blue-100 text-blue-700",
    pro: "bg-emerald-100 text-emerald-700",
    elite: "bg-purple-100 text-purple-700",
  };

  const activityTypeIcon: Record<string, { icon: React.ReactNode; color: string }> = {
    "stage-change": { icon: <ChevronRight className="w-3.5 h-3.5" />, color: "bg-emerald-100 text-emerald-700" },
    "milestone-paid": { icon: <CheckCircle2 className="w-3.5 h-3.5" />, color: "bg-blue-100 text-blue-700" },
    "checklist-complete": { icon: <CheckSquare className="w-3.5 h-3.5" />, color: "bg-violet-100 text-violet-700" },
    "note": { icon: <MessageSquare className="w-3.5 h-3.5" />, color: "bg-gray-100 text-gray-600" },
    "ticket-created": { icon: <AlertCircle className="w-3.5 h-3.5" />, color: "bg-red-100 text-red-700" },
    "ticket-resolved": { icon: <CheckCircle2 className="w-3.5 h-3.5" />, color: "bg-green-100 text-green-700" },
  };

  return (
    <div className="px-6 lg:px-10 py-6 space-y-6" data-testid="ops-client-journey">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/portal-ets/ops")}
          data-testid="button-back-to-dashboard"
          className="text-muted-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Dashboard
        </Button>
      </div>

      <Card className="border-0 shadow-sm" data-testid="card-client-info">
        <CardContent className="p-5">
          <div className="flex flex-col md:flex-row md:items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-lg font-bold text-emerald-600 shrink-0">
              {client.name[0]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 flex-wrap">
                <div>
                  <h1 className="text-xl font-bold" data-testid="text-client-name">{client.name}</h1>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mt-0.5">
                    <MapPin className="w-3.5 h-3.5" /> {client.city}
                  </div>
                </div>
                <Badge className={`${packageColors[client.package]} capitalize`} variant="outline" data-testid="badge-package">
                  {client.package} Package
                </Badge>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Store Address</p>
                  <p className="font-medium text-xs leading-snug">{client.storeAddress}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Store Area</p>
                  <p className="font-medium">{client.storeArea} sq.ft.</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Sales Person</p>
                  <p className="font-medium flex items-center gap-1"><User className="w-3 h-3" /> {client.assignedSales}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Ops Manager</p>
                  <p className="font-medium flex items-center gap-1"><User className="w-3 h-3" /> {client.opsManager}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Token Paid</p>
                  <p className="font-medium">{fmtDate(client.tokenPaidDate)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Est. Launch</p>
                  <p className="font-medium flex items-center gap-1"><Calendar className="w-3 h-3" /> {fmtDate(client.estimatedLaunchDate)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Days Since Token</p>
                  <p className="font-medium">{daysSince(client.tokenPaidDate)}d</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Checklist</p>
                  <p className="font-medium">{checklistCompletion}% complete</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm" data-testid="card-stage-tracker">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Journey Tracker</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="overflow-x-auto pb-2">
            <div className="flex items-center gap-0 min-w-max">
              {OPS_STAGES.map((stage, idx) => {
                const isCompleted = idx < currentStageIndex;
                const isCurrent = idx === currentStageIndex;
                const isPending = idx > currentStageIndex;
                return (
                  <div key={stage} className="flex items-center">
                    <div
                      className={`flex flex-col items-center px-2 py-2 rounded-lg min-w-[90px] ${isCurrent ? "bg-emerald-50 border border-emerald-200" : ""}`}
                      data-testid={`stage-${stage}`}
                    >
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center mb-1 text-xs font-bold
                        ${isCompleted ? "bg-emerald-500 text-white" : isCurrent ? "bg-emerald-100 text-emerald-700 border-2 border-emerald-500" : "bg-gray-100 text-gray-400"}`}>
                        {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                      </div>
                      <span className={`text-[10px] text-center leading-tight font-medium ${isCurrent ? "text-emerald-700" : isCompleted ? "text-emerald-600" : "text-muted-foreground"}`}>
                        {OPS_STAGE_LABELS[stage]}
                      </span>
                    </div>
                    {idx < OPS_STAGES.length - 1 && (
                      <div className={`h-0.5 w-4 ${idx < currentStageIndex ? "bg-emerald-400" : "bg-gray-200"}`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="text-sm font-medium">
                Current Stage: <span className="text-emerald-700">{OPS_STAGE_LABELS[currentStage]}</span>
              </p>
              {!isLaunched && nextStage && (
                <p className="text-xs text-muted-foreground">Next: {OPS_STAGE_LABELS[nextStage]}</p>
              )}
            </div>
            {!isLaunched && nextStage && (
              showAdvanceConfirm ? (
                <div className="flex flex-col gap-2 w-full md:w-auto">
                  <Textarea
                    placeholder={`Add a note about advancing to "${OPS_STAGE_LABELS[nextStage]}"...`}
                    value={advanceNote}
                    onChange={(e) => setAdvanceNote(e.target.value)}
                    className="text-sm min-h-[60px]"
                    data-testid="input-advance-note"
                  />
                  <div className="flex gap-2">
                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={advanceStage} data-testid="button-confirm-advance">
                      Confirm Advance
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setShowAdvanceConfirm(false)} data-testid="button-cancel-advance">
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => setShowAdvanceConfirm(true)} data-testid="button-advance-stage">
                  Advance to {OPS_STAGE_LABELS[nextStage]} →
                </Button>
              )
            )}
            {isLaunched && (
              <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">Store Launched!</Badge>
            )}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="milestones" data-testid="tabs-client-detail">
        <TabsList className="w-full grid grid-cols-4 mb-4">
          <TabsTrigger value="milestones" data-testid="tab-milestones">Milestones</TabsTrigger>
          <TabsTrigger value="checklist" data-testid="tab-checklist">Checklist</TabsTrigger>
          <TabsTrigger value="activity" data-testid="tab-activity">Activity Log</TabsTrigger>
          <TabsTrigger value="orders" data-testid="tab-orders">BOQ & Orders</TabsTrigger>
        </TabsList>

        <TabsContent value="milestones">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Payment Milestones</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm" data-testid="table-milestones">
                  <thead>
                    <tr className="border-b text-xs text-muted-foreground">
                      <th className="text-left py-2 pr-4 font-medium">Milestone</th>
                      <th className="text-left py-2 pr-4 font-medium">Amount Due</th>
                      <th className="text-left py-2 pr-4 font-medium">Due Date</th>
                      <th className="text-left py-2 pr-4 font-medium">Status</th>
                      <th className="text-left py-2 pr-4 font-medium">Paid Date</th>
                      <th className="text-left py-2 font-medium">Method</th>
                      <th className="text-right py-2 font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {milestones.map((m) => (
                      <tr key={m.id} className="border-b last:border-0" data-testid={`milestone-row-${m.id}`}>
                        <td className="py-3 pr-4 font-medium">{MILESTONE_LABELS[m.type]}</td>
                        <td className="py-3 pr-4">{fmtCurrency(m.amountDue)}</td>
                        <td className="py-3 pr-4 text-muted-foreground">{fmtDate(m.dueDate)}</td>
                        <td className="py-3 pr-4">
                          {m.isPaid ? (
                            <Badge className="bg-emerald-100 text-emerald-700 text-[10px]">Paid</Badge>
                          ) : new Date(m.dueDate) < new Date("2026-03-26") ? (
                            <Badge className="bg-red-100 text-red-700 text-[10px]">Overdue</Badge>
                          ) : (
                            <Badge className="bg-gray-100 text-gray-600 text-[10px]">Pending</Badge>
                          )}
                        </td>
                        <td className="py-3 pr-4 text-muted-foreground">{m.paidDate ? fmtDate(m.paidDate) : "—"}</td>
                        <td className="py-3 pr-4 capitalize text-muted-foreground">{m.paymentMethod?.replace("-", " ") ?? "—"}</td>
                        <td className="py-3 text-right">
                          {!m.isPaid && (
                            <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => toggleMilestonePaid(m.id)} data-testid={`button-mark-paid-${m.id}`}>
                              Mark Paid
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="checklist">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">Readiness Checklist</CardTitle>
                <div className="flex items-center gap-2">
                  <Progress value={checklistCompletion} className="w-24 h-2" />
                  <span className="text-sm font-medium">{checklistCompletion}%</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0 space-y-5" data-testid="checklist-content">
              {CHECKLIST_CATEGORIES.map((cat) => {
                const items = mockChecklist.filter((c) => c.category === cat);
                const completed = items.filter((i) => completedItems.has(i.id)).length;
                const catPct = Math.round((completed / items.length) * 100);
                return (
                  <div key={cat}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">{cat}</span>
                        <span className="text-xs text-muted-foreground">{completed}/{items.length}</span>
                      </div>
                      <Progress value={catPct} className="w-20 h-1.5" />
                    </div>
                    <div className="space-y-1.5">
                      {items.map((item) => {
                        const done = completedItems.has(item.id);
                        return (
                          <div
                            key={item.id}
                            className={`flex items-start gap-2 p-2 rounded-lg cursor-pointer hover:bg-muted/40 transition-colors ${done ? "opacity-70" : ""}`}
                            onClick={() => toggleChecklistItem(item.id)}
                            data-testid={`checklist-item-${item.id}`}
                          >
                            <div className="mt-0.5 shrink-0">
                              {done ? (
                                <CheckSquare className="w-4 h-4 text-emerald-500" />
                              ) : (
                                <Square className="w-4 h-4 text-muted-foreground" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm ${done ? "line-through text-muted-foreground" : "font-medium"}`}>
                                {item.label}
                              </p>
                              <p className="text-xs text-muted-foreground">{item.description}</p>
                            </div>
                            {item.opsOnly && (
                              <Badge variant="outline" className="text-[10px] shrink-0 border-violet-200 text-violet-600">Ops</Badge>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Activity Log</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-4" data-testid="activity-log">
              <div className="flex gap-2">
                <Textarea
                  placeholder="Add a manual note..."
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  className="text-sm min-h-[60px]"
                  data-testid="input-note"
                />
                <Button size="sm" className="self-end shrink-0" onClick={addNote} data-testid="button-add-note">
                  Add Note
                </Button>
              </div>
              <div className="space-y-3 mt-2">
                {activities.map((act) => {
                  const meta = activityTypeIcon[act.type] ?? activityTypeIcon["note"];
                  return (
                    <div key={act.id} className="flex gap-3" data-testid={`activity-${act.id}`}>
                      <div className={`w-7 h-7 rounded-full ${meta.color} flex items-center justify-center shrink-0 mt-0.5`}>
                        {meta.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{act.title}</p>
                        <p className="text-xs text-muted-foreground">{act.description}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {act.actor} · {fmtTimestamp(act.timestamp)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders">
          <div className="space-y-4">
            <Card className="border-0 shadow-sm" data-testid="card-boq">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Package className="w-4 h-4" /> BOQ (Phase A) — Read Only
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-xs text-muted-foreground">
                      <th className="text-left py-2 pr-4 font-medium">Category</th>
                      <th className="text-left py-2 pr-4 font-medium">Item</th>
                      <th className="text-right py-2 pr-4 font-medium">Qty</th>
                      <th className="text-right py-2 pr-4 font-medium">Unit Price</th>
                      <th className="text-right py-2 font-medium">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {boqItems.map((item, idx) => (
                      <tr key={idx} className="border-b last:border-0">
                        <td className="py-2 pr-4 text-muted-foreground">{item.category}</td>
                        <td className="py-2 pr-4">{item.item}</td>
                        <td className="py-2 pr-4 text-right">{item.qty}</td>
                        <td className="py-2 pr-4 text-right">{fmtCurrency(item.unitPrice)}</td>
                        <td className="py-2 text-right font-medium">{fmtCurrency(item.qty * item.unitPrice)}</td>
                      </tr>
                    ))}
                    <tr>
                      <td colSpan={4} className="py-2 text-right font-bold text-sm">Total BOQ Value</td>
                      <td className="py-2 text-right font-bold text-emerald-700">{fmtCurrency(boqTotal)}</td>
                    </tr>
                  </tbody>
                </table>
              </CardContent>
            </Card>

            {productOrder && (
              <Card className="border-0 shadow-sm" data-testid="card-product-order">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Package className="w-4 h-4" /> Product Order (Phase B) — Read Only
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">Total SKUs</p>
                      <p className="text-lg font-bold">{productOrder.skus}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Total Units</p>
                      <p className="text-lg font-bold">{productOrder.totalUnits.toLocaleString("en-IN")}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Order Value</p>
                      <p className="text-lg font-bold text-emerald-700">{fmtCurrency(productOrder.valueInr)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Categories</p>
                      <p className="text-sm font-medium">{productOrder.categories.join(", ")}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
