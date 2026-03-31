import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useLocation, useParams } from "wouter";
import {
  Kanban, UserPlus, ClipboardList, Briefcase, CheckCircle2, FileText,
  ArrowLeft, ChevronRight,
} from "lucide-react";
import {
  FORMATION_STAGES, FORMATION_CLIENTS, KYC_QUEUE, EIN_TRACKER,
} from "@/lib/mock-data-dashboard-ln";

type FormationClient = typeof FORMATION_CLIENTS[0];

const KYC_STATUS_COLORS: Record<string, string> = {
  "approved": "border-green-300 text-green-700 bg-green-50",
  "in-review": "border-amber-300 text-amber-700 bg-amber-50",
  "incomplete": "border-red-300 text-red-700 bg-red-50",
  "not-started": "border-gray-200 text-gray-500",
};

const EIN_STATUS_COLORS: Record<string, string> = {
  "received": "border-green-300 text-green-700 bg-green-50",
  "pending": "border-amber-300 text-amber-700 bg-amber-50",
  "not-started": "border-gray-200 text-gray-500",
};

function ClientDetailDialog({ client, open, onClose }: { client: FormationClient | null; open: boolean; onClose: () => void }) {
  if (!client) return null;
  const stageNames = FORMATION_STAGES.map(s => s.shortName || s.name);
  const currentStageIdx = client.stage - 1;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-sky-100 flex items-center justify-center font-bold text-sky-600 text-sm">
              {client.name[0]}
            </div>
            <div>
              <p>{client.name}</p>
              <p className="text-xs text-muted-foreground font-normal">{client.client} · {client.state} · {client.package}</p>
            </div>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-muted/40 rounded-xl p-3">
              <p className="text-xs text-muted-foreground">Current Stage</p>
              <p className="font-bold mt-0.5">{client.stageName}</p>
            </div>
            <div className="bg-muted/40 rounded-xl p-3">
              <p className="text-xs text-muted-foreground">Progress</p>
              <p className="font-bold mt-0.5">Stage {client.stage}/7</p>
            </div>
            <div className="bg-muted/40 rounded-xl p-3">
              <p className="text-xs text-muted-foreground">Days in Stage</p>
              <p className={`font-bold mt-0.5 ${client.daysInStage > 10 ? "text-amber-600" : ""}`}>{client.daysInStage} days</p>
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Stage Progress</p>
            <div className="flex items-center gap-1 overflow-x-auto pb-1">
              {stageNames.map((stage, idx) => {
                const isComplete = idx < currentStageIdx;
                const isCurrent = idx === currentStageIdx;
                return (
                  <div key={stage} className="flex items-center shrink-0">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      isComplete ? "bg-green-500 text-white" :
                      isCurrent ? "bg-sky-500 text-white ring-2 ring-sky-200" :
                      "bg-gray-200 text-gray-400"
                    }`}>
                      {isComplete ? <CheckCircle2 className="w-3.5 h-3.5" /> : idx + 1}
                    </div>
                    {idx < stageNames.length - 1 && <div className={`w-4 h-0.5 ${isComplete ? "bg-green-400" : "bg-gray-200"}`} />}
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between mt-2">
              {stageNames.slice(0, 4).map((s) => (
                <p key={s} className="text-[9px] text-muted-foreground truncate" style={{ maxWidth: "60px" }}>{s}</p>
              ))}
            </div>
          </div>
          <Progress value={(client.stage / 7) * 100} className="h-2" />
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function LnFormationPortal() {
  const [selectedClient, setSelectedClient] = useState<FormationClient | null>(null);
  const inPipeline = FORMATION_CLIENTS.length;
  const kycPending = KYC_QUEUE.filter(k => k.status !== "approved").length;
  const einPending = EIN_TRACKER.filter(e => e.status === "pending").length;

  return (
    <div className="px-16 lg:px-24 py-6 space-y-6" data-testid="ln-formation-portal-dashboard">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 p-6 text-white shadow-lg">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/4 translate-x-1/4" />
        <div className="relative z-10">
          <p className="text-sm text-sky-200 mb-1">Formation Specialist</p>
          <h1 className="text-2xl font-bold" data-testid="text-formation-title">Client Pipeline</h1>
          <div className="flex items-center gap-6 mt-3 text-sm text-sky-200">
            <span><strong className="text-white">{inPipeline}</strong> In Pipeline</span>
            <span><strong className="text-white">{kycPending}</strong> KYC Pending</span>
            <span><strong className="text-white">{einPending}</strong> EIN Pending</span>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Kanban className="w-4 h-4 text-sky-500" /> Active Formations
              </CardTitle>
              <Badge variant="outline" className="text-xs">{inPipeline} clients</Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0 space-y-2">
            {FORMATION_CLIENTS.map((fc) => (
              <div
                key={fc.id}
                onClick={() => setSelectedClient(fc)}
                className={`p-3 rounded-xl border cursor-pointer hover:shadow-sm transition-shadow ${fc.daysInStage > 10 ? "border-amber-200 bg-amber-50/40 hover:bg-amber-50/60" : "bg-muted/30 border-transparent hover:bg-muted/50"}`}
                data-testid={`formation-client-${fc.id}`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div>
                    <p className="text-sm font-medium">{fc.name}</p>
                    <p className="text-xs text-muted-foreground">{fc.client} · {fc.state} · {fc.package}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Badge variant="outline" className="text-[10px]">{fc.stageName}</Badge>
                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Progress value={(fc.stage / 7) * 100} className="flex-1 h-1.5" />
                  <span className="text-xs text-muted-foreground">Stage {fc.stage}/7</span>
                  {fc.daysInStage > 10 && (
                    <span className="text-[10px] text-amber-600 font-medium">{fc.daysInStage}d</span>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-sky-500" /> KYC Queue
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              {KYC_QUEUE.filter(k => k.status !== "approved").map((kyc) => (
                <div key={kyc.id} className="p-2.5 rounded-lg bg-muted/40" data-testid={`kyc-queue-${kyc.id}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold">{kyc.client}</span>
                    <Badge variant="outline" className={`text-[10px] ${KYC_STATUS_COLORS[kyc.status]}`}>
                      {kyc.status.replace("-", " ")}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{kyc.company}</p>
                  {kyc.notes && <p className="text-[10px] text-amber-600 mt-1">{kyc.notes}</p>}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-sky-500" /> EIN Status
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              {EIN_TRACKER.filter(e => e.status !== "not-started").map((ein) => (
                <div key={ein.id} className="flex items-center justify-between py-2" data-testid={`ein-status-${ein.id}`}>
                  <div>
                    <p className="text-xs font-medium">{ein.company}</p>
                    <p className="text-[10px] text-muted-foreground">Via {ein.method} · {ein.submittedDate}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className={`text-[10px] ${EIN_STATUS_COLORS[ein.status]}`}>
                      {ein.status === "received" ? `EIN: ${ein.ein}` : "Pending"}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
      <ClientDetailDialog client={selectedClient} open={!!selectedClient} onClose={() => setSelectedClient(null)} />
    </div>
  );
}

export function LnFormationPipeline() {
  const [, setLocation] = useLocation();
  const [selectedClient, setSelectedClient] = useState<FormationClient | null>(null);
  return (
    <div className="px-16 lg:px-24 py-6 space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground h-8 px-2" onClick={() => setLocation("/portal-ln/formation")} data-testid="breadcrumb-back-formation-pipeline">
          <ArrowLeft className="w-3.5 h-3.5" /> Dashboard
        </Button>
        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="text-sm font-semibold">Formation Pipeline</span>
      </div>
      <h1 className="text-xl font-bold">Formation Pipeline</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {FORMATION_STAGES.slice(0, 4).map((stage) => {
          const count = FORMATION_CLIENTS.filter(c => c.stage === parseInt(stage.id.replace("s", ""))).length;
          return (
            <Card key={stage.id} className="border-0 shadow-sm">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">{stage.shortName}</p>
                <p className="text-2xl font-bold mt-1 text-sky-600" data-testid={`pipeline-count-${stage.id}`}>{count}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
      <div className="space-y-2">
        {FORMATION_CLIENTS.map((fc) => (
          <div
            key={fc.id}
            className="flex items-center gap-3 p-4 rounded-xl border bg-white hover:bg-muted/20 transition-colors cursor-pointer"
            onClick={() => setSelectedClient(fc)}
            data-testid={`pipeline-fc-${fc.id}`}
          >
            <div className="w-9 h-9 rounded-full bg-sky-100 flex items-center justify-center font-bold text-sky-600 text-xs">{fc.name[0]}</div>
            <div className="flex-1">
              <p className="font-medium text-sm">{fc.name}</p>
              <p className="text-xs text-muted-foreground">{fc.client} · {fc.state} · Stage {fc.stage}/7</p>
              <Progress value={(fc.stage / 7) * 100} className="h-1 w-40 mt-1" />
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">{fc.stageName}</Badge>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </div>
          </div>
        ))}
      </div>
      <ClientDetailDialog client={selectedClient} open={!!selectedClient} onClose={() => setSelectedClient(null)} />
    </div>
  );
}

export function LnFormationKYC() {
  const [, setLocation] = useLocation();
  return (
    <div className="px-16 lg:px-24 py-6 space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground h-8 px-2" onClick={() => setLocation("/portal-ln/formation")} data-testid="breadcrumb-back-kyc">
          <ArrowLeft className="w-3.5 h-3.5" /> Dashboard
        </Button>
        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="text-sm font-semibold">KYC Review Queue</span>
      </div>
      <div>
        <h1 className="text-xl font-bold">KYC Review Queue</h1>
        <p className="text-sm text-muted-foreground">Review client identity documents and approve KYC submissions</p>
      </div>
      <div className="space-y-3">
        {KYC_QUEUE.map((kyc) => (
          <Card key={kyc.id} className="border-0 shadow-sm" data-testid={`kyc-card-${kyc.id}`}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-semibold">{kyc.client}</p>
                  <p className="text-sm text-muted-foreground">{kyc.company} · Submitted {kyc.submitted}</p>
                </div>
                <Badge variant="outline" className={KYC_STATUS_COLORS[kyc.status]}>
                  {kyc.status.replace("-", " ")}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {kyc.docs.map((doc) => (
                  <Badge key={doc} variant="outline" className="text-[10px]">
                    <FileText className="w-3 h-3 mr-1" />{doc}
                  </Badge>
                ))}
              </div>
              {kyc.notes && (
                <p className="text-xs text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg mb-3">{kyc.notes}</p>
              )}
              {kyc.status !== "approved" && (
                <div className="flex gap-2">
                  <Button size="sm" className="bg-sky-500 hover:bg-sky-600 text-white gap-1" data-testid={`approve-kyc-${kyc.id}`}>
                    <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1" data-testid={`request-reupload-${kyc.id}`}>
                    Request Re-upload
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function LnFormationEIN() {
  const [, setLocation] = useLocation();
  return (
    <div className="px-16 lg:px-24 py-6 space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground h-8 px-2" onClick={() => setLocation("/portal-ln/formation")} data-testid="breadcrumb-back-ein">
          <ArrowLeft className="w-3.5 h-3.5" /> Dashboard
        </Button>
        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="text-sm font-semibold">EIN Tracker</span>
      </div>
      <div>
        <h1 className="text-xl font-bold">EIN Tracker</h1>
        <p className="text-sm text-muted-foreground">Track IRS EIN applications across all formations</p>
      </div>
      <div className="grid grid-cols-3 gap-3 mb-2">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{EIN_TRACKER.filter(e => e.status === "received").length}</p>
            <p className="text-xs text-muted-foreground mt-1">Received</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-amber-600">{EIN_TRACKER.filter(e => e.status === "pending").length}</p>
            <p className="text-xs text-muted-foreground mt-1">Pending</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-gray-400">{EIN_TRACKER.filter(e => e.status === "not-started").length}</p>
            <p className="text-xs text-muted-foreground mt-1">Not Started</p>
          </CardContent>
        </Card>
      </div>
      <div className="space-y-3">
        {EIN_TRACKER.map((ein) => (
          <Card key={ein.id} className="border-0 shadow-sm" data-testid={`ein-card-${ein.id}`}>
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="font-semibold">{ein.company}</p>
                <p className="text-sm text-muted-foreground">{ein.client} · {ein.state}</p>
                {ein.submittedDate && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Submitted: {ein.submittedDate} · Method: {ein.method}
                    {ein.estimatedDate !== "-" && ` · ETA: ${ein.estimatedDate}`}
                  </p>
                )}
              </div>
              <Badge variant="outline" className={EIN_STATUS_COLORS[ein.status]}>
                {ein.status === "received" ? ein.ein : ein.status === "pending" ? "Pending IRS" : "Not Started"}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function LnFormationActions() {
  const [, setLocation] = useLocation();
  const stageActions = [
    { stage: "Payment", pending: 1, actions: ["Send payment link", "Verify payment receipt", "Assign to specialist"] },
    { stage: "KYC", pending: 2, actions: ["Review uploaded documents", "Request re-uploads", "Approve KYC package"] },
    { stage: "Articles Filing", pending: 1, actions: ["Prepare Articles of Organization", "File with Secretary of State", "Upload stamped copy"] },
    { stage: "EIN Application", pending: 1, actions: ["Prepare SS-4 form", "Submit to IRS (fax/online)", "Upload CP 575 letter"] },
    { stage: "BOI Filing", pending: 1, actions: ["Prepare FinCEN BOI report", "Get client approval", "File with FinCEN"] },
    { stage: "Banking Setup", pending: 1, actions: ["Initiate Mercury application", "Setup Stripe account", "Verify bank connection"] },
  ];

  return (
    <div className="px-16 lg:px-24 py-6 space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground h-8 px-2" onClick={() => setLocation("/portal-ln/formation")} data-testid="breadcrumb-back-actions">
          <ArrowLeft className="w-3.5 h-3.5" /> Dashboard
        </Button>
        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="text-sm font-semibold">Stage Actions</span>
      </div>
      <div>
        <h1 className="text-xl font-bold">Stage Actions</h1>
        <p className="text-sm text-muted-foreground">Checklists and actions for each formation stage</p>
      </div>
      <div className="space-y-4">
        {stageActions.map((sa) => (
          <Card key={sa.stage} className="border-0 shadow-sm" data-testid={`stage-actions-${sa.stage.toLowerCase().replace(/\s+/g, "-")}`}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-sky-500" />
                  <span className="font-semibold">{sa.stage}</span>
                </div>
                <Badge variant="outline" className="text-xs">{sa.pending} pending</Badge>
              </div>
              <div className="space-y-2">
                {sa.actions.map((action, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-gray-200" />
                    <span className="text-muted-foreground">{action}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function LnFormationClientDetail() {
  const params = useParams<{ clientId: string }>();
  const [, setLocation] = useLocation();

  const client = FORMATION_CLIENTS.find(c => c.id === params.clientId) ?? FORMATION_CLIENTS[0];
  const stageNames = FORMATION_STAGES.map(s => s.shortName || s.name);
  const currentStageIdx = client.stage - 1;

  return (
    <div className="px-16 lg:px-24 py-6 space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground h-8 px-2" onClick={() => setLocation("/portal-ln/formation/pipeline")} data-testid="breadcrumb-back-client">
          <ArrowLeft className="w-3.5 h-3.5" /> Pipeline
        </Button>
        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="text-sm font-semibold" data-testid="breadcrumb-client-name">{client.name}</span>
      </div>

      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-sky-100 flex items-center justify-center text-xl font-bold text-sky-600 shrink-0">
          {client.name[0]}
        </div>
        <div>
          <h1 className="text-xl font-bold" data-testid="text-formation-client-title">{client.name}</h1>
          <p className="text-sm text-muted-foreground">{client.client} · {client.state} · {client.package} Package</p>
        </div>
        <Badge variant="outline" className="ml-auto bg-sky-50 border-sky-300 text-sky-700">Stage {client.stage}/7</Badge>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Formation Progress</p>
          <div className="flex items-center gap-1 mb-3 flex-wrap">
            {stageNames.map((stage, idx) => {
              const isComplete = idx < currentStageIdx;
              const isCurrent = idx === currentStageIdx;
              return (
                <div key={stage} className="flex items-center shrink-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    isComplete ? "bg-green-500 text-white" :
                    isCurrent ? "bg-sky-500 text-white ring-2 ring-sky-200" :
                    "bg-gray-100 text-gray-400"
                  }`} data-testid={`stage-dot-${idx + 1}`}>
                    {isComplete ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                  </div>
                  {idx < stageNames.length - 1 && <div className={`w-5 h-0.5 ${isComplete ? "bg-green-400" : "bg-gray-200"}`} />}
                </div>
              );
            })}
          </div>
          <Progress value={(client.stage / 7) * 100} className="h-2.5 mt-2" />
          <p className="text-xs text-muted-foreground mt-1">{Math.round((client.stage / 7) * 100)}% complete · {7 - client.stage} stage{7 - client.stage !== 1 ? "s" : ""} remaining</p>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Client Details</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            {[
              { label: "Current Stage", value: client.stageName },
              { label: "Days in Stage", value: `${client.daysInStage} day${client.daysInStage !== 1 ? "s" : ""}`, highlight: client.daysInStage > 10 },
              { label: "State", value: client.state },
              { label: "Package", value: client.package },
            ].map(({ label, value, highlight }) => (
              <div key={label} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                <span className="text-xs text-muted-foreground">{label}</span>
                <span className={`text-xs font-semibold ${highlight ? "text-amber-600" : ""}`}>{value}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Status Overview</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-50">
              <span className="text-xs text-muted-foreground">KYC Status</span>
              <Badge variant="outline" className={`text-xs ${KYC_STATUS_COLORS[client.kycStatus]}`}>
                {client.kycStatus.replace("-", " ").replace(/\b\w/g, c => c.toUpperCase())}
              </Badge>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-xs text-muted-foreground">EIN Status</span>
              <Badge variant="outline" className={`text-xs ${EIN_STATUS_COLORS[client.einStatus]}`}>
                {client.einStatus.replace("-", " ").replace(/\b\w/g, c => c.toUpperCase())}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-2">
        <Button size="sm" variant="outline" className="gap-1 text-xs" onClick={() => setLocation("/portal-ln/formation/kyc")} data-testid="action-view-kyc">
          <FileText className="w-3.5 h-3.5" /> View KYC
        </Button>
        <Button size="sm" variant="outline" className="gap-1 text-xs" onClick={() => setLocation("/portal-ln/formation/ein")} data-testid="action-view-ein">
          <Briefcase className="w-3.5 h-3.5" /> EIN Tracker
        </Button>
        <Button size="sm" className="gap-1 text-xs bg-sky-500 hover:bg-sky-600 text-white" onClick={() => setLocation("/portal-ln/formation/actions")} data-testid="action-stage-actions">
          <ClipboardList className="w-3.5 h-3.5" /> Stage Actions
        </Button>
      </div>
    </div>
  );
}
