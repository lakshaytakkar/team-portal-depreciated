import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  CheckSquare, Building2, FileText, Ticket,
  CheckCircle2, AlertTriangle,
} from "lucide-react";
import { FORMATION_CLIENTS } from "@/lib/mock-data-dashboard-ln";

const OPS_ASSIGNED_TASKS = [
  { id: "OT-001", title: "Upload stamped Articles of Organization for GreenLeaf", company: "GreenLeaf Organics LLC", client: "Amit Patel", due: "2026-03-27", priority: "high" as const, done: false },
  { id: "OT-002", title: "Request address proof re-upload from Neha Joshi", company: "SwiftPay Solutions Inc", client: "Neha Joshi", due: "2026-03-27", priority: "high" as const, done: false },
  { id: "OT-003", title: "Verify EIN for TechVentures LLC on IRS portal", company: "TechVentures LLC", client: "Rajesh Kumar", due: "2026-03-28", priority: "medium" as const, done: false },
  { id: "OT-004", title: "Prepare BOI draft for review — DataBridge Analytics", company: "DataBridge Analytics LLC", client: "Vikram Rao", due: "2026-03-29", priority: "medium" as const, done: false },
  { id: "OT-005", title: "Send Mercury bank link to NovaTech client", company: "NovaTech AI Inc", client: "Deepak Verma", due: "2026-03-30", priority: "low" as const, done: true },
  { id: "OT-006", title: "Archive completed docs for CloudBase Corp", company: "CloudBase Corp", client: "Rajesh Kumar", due: "2026-03-25", priority: "low" as const, done: true },
];

const OPS_TICKETS = [
  { id: "TK-001", company: "TechVentures LLC", client: "Rajesh Kumar", subject: "KYC document re-upload needed", priority: "high" as const, status: "open" as const, assigned: true },
  { id: "TK-002", company: "SwiftPay Solutions Inc", client: "Neha Joshi", subject: "EIN delay follow-up", priority: "medium" as const, status: "in-progress" as const, assigned: true },
  { id: "TK-003", company: "GreenLeaf Organics LLC", client: "Amit Patel", subject: "Articles filing status check", priority: "low" as const, status: "open" as const, assigned: false },
];

const OPS_DOCS = [
  { id: "D-001", company: "TechVentures LLC", client: "Rajesh Kumar", doc: "BOI Filing Draft", category: "compliance", status: "action-required" as const },
  { id: "D-002", company: "SwiftPay Solutions Inc", client: "Neha Joshi", doc: "Address Proof", category: "identity", status: "pending-review" as const },
  { id: "D-003", company: "GreenLeaf Organics LLC", client: "Amit Patel", doc: "Passport - Amit Patel", category: "identity", status: "verified" as const },
  { id: "D-004", company: "DataBridge Analytics LLC", client: "Vikram Rao", doc: "EIN Confirmation Letter", category: "tax", status: "verified" as const },
];

const PRIORITY_COLORS: Record<string, string> = {
  "high": "border-red-300 text-red-700 bg-red-50",
  "medium": "border-amber-300 text-amber-700 bg-amber-50",
  "low": "border-gray-200 text-gray-500 bg-gray-50",
};

const DOC_STATUS_COLORS: Record<string, string> = {
  "verified": "border-green-300 text-green-700 bg-green-50",
  "pending-review": "border-amber-300 text-amber-700 bg-amber-50",
  "action-required": "border-red-300 text-red-700 bg-red-50",
};

export default function LnOpsPortal() {
  const pendingTasks = OPS_ASSIGNED_TASKS.filter(t => !t.done);
  const completedTasks = OPS_ASSIGNED_TASKS.filter(t => t.done);
  const openTickets = OPS_TICKETS.filter(t => t.status !== "resolved").length;
  const highPriorityTasks = pendingTasks.filter(t => t.priority === "high").length;

  return (
    <div className="px-16 lg:px-24 py-6 space-y-6" data-testid="ln-ops-portal-dashboard">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-6 text-white shadow-lg">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/4 translate-x-1/4" />
        <div className="relative z-10">
          <p className="text-sm text-emerald-200 mb-1">Ops Executive</p>
          <h1 className="text-2xl font-bold" data-testid="text-ops-title">My Work — Nitin</h1>
          <div className="flex items-center gap-6 mt-3 text-sm text-emerald-200">
            <span><strong className="text-white">{pendingTasks.length}</strong> Pending Tasks</span>
            <span><strong className="text-white">{highPriorityTasks}</strong> High Priority</span>
            <span><strong className="text-white">{openTickets}</strong> Open Tickets</span>
            <span><strong className="text-white">{completedTasks.length}</strong> Done Today</span>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-emerald-500" /> Assigned Tasks
              </CardTitle>
              <Badge variant="outline" className="text-xs">{pendingTasks.length} pending</Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0 space-y-2">
            {OPS_ASSIGNED_TASKS.map((task) => (
              <div
                key={task.id}
                className={`flex items-start gap-3 p-3 rounded-xl border ${task.done ? "opacity-50 border-transparent" : task.priority === "high" ? "border-red-100 bg-red-50/40" : "bg-muted/30 border-transparent"}`}
                data-testid={`ops-task-${task.id}`}
              >
                <CheckCircle2 className={`w-4 h-4 mt-0.5 shrink-0 ${task.done ? "text-green-500" : "text-gray-200"}`} />
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-medium ${task.done ? "line-through text-muted-foreground" : ""}`}>{task.title}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{task.company} · Due {task.due}</p>
                </div>
                <Badge variant="outline" className={`text-[10px] shrink-0 ${PRIORITY_COLORS[task.priority]}`}>
                  {task.priority}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Ticket className="w-4 h-4 text-emerald-500" /> My Tickets
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              {OPS_TICKETS.map((ticket) => (
                <div key={ticket.id} className="p-2.5 rounded-lg bg-muted/40" data-testid={`ops-ticket-${ticket.id}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold truncate flex-1 mr-2">{ticket.subject}</span>
                    <Badge variant="outline" className={`text-[10px] shrink-0 ${PRIORITY_COLORS[ticket.priority]}`}>
                      {ticket.priority}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{ticket.company} · {ticket.client}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-500" /> Recent Docs
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              {OPS_DOCS.slice(0, 3).map((doc) => (
                <div key={doc.id} className="flex items-center justify-between py-2" data-testid={`ops-doc-preview-${doc.id}`}>
                  <div>
                    <p className="text-xs font-medium">{doc.doc}</p>
                    <p className="text-[10px] text-muted-foreground">{doc.company}</p>
                  </div>
                  <Badge variant="outline" className={`text-[10px] ${DOC_STATUS_COLORS[doc.status]}`}>
                    {doc.status.replace("-", " ")}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export function LnOpsClients() {
  return (
    <div className="px-16 lg:px-24 py-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold">Client List</h1>
        <p className="text-sm text-muted-foreground">Active clients you are assigned to support</p>
      </div>
      <div className="space-y-3">
        {FORMATION_CLIENTS.map((fc) => (
          <Card key={fc.id} className="border-0 shadow-sm" data-testid={`ops-client-${fc.id}`}>
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center font-bold text-emerald-600">
                  {fc.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold">{fc.name}</p>
                  <p className="text-sm text-muted-foreground">{fc.client} · {fc.state} · {fc.package}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Progress value={(fc.stage / 7) * 100} className="h-1.5 w-32" />
                    <span className="text-xs text-muted-foreground">Stage {fc.stage}/7</span>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs shrink-0">{fc.stageName}</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function LnOpsTickets() {
  const ALL_TICKETS = [
    { id: "TK-001", company: "TechVentures LLC", client: "Rajesh Kumar", subject: "KYC document re-upload needed", priority: "high" as const, status: "open" as const, created: "2026-03-24" },
    { id: "TK-002", company: "SwiftPay Solutions Inc", client: "Neha Joshi", subject: "EIN delay follow-up", priority: "medium" as const, status: "in-progress" as const, created: "2026-03-22" },
    { id: "TK-003", company: "GreenLeaf Organics LLC", client: "Amit Patel", subject: "Articles filing status check", priority: "low" as const, status: "open" as const, created: "2026-03-21" },
    { id: "TK-004", company: "DataBridge Analytics LLC", client: "Vikram Rao", subject: "BOI preparation task assigned", priority: "medium" as const, status: "in-progress" as const, created: "2026-03-20" },
  ];

  const STATUS_LABELS: Record<string, string> = {
    "open": "Open",
    "in-progress": "In Progress",
    "resolved": "Resolved",
  };

  return (
    <div className="px-16 lg:px-24 py-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold">Tickets</h1>
        <p className="text-sm text-muted-foreground">Support tickets assigned to you</p>
      </div>
      <div className="space-y-3">
        {ALL_TICKETS.map((ticket) => (
          <Card key={ticket.id} className="border-0 shadow-sm" data-testid={`ops-ticket-full-${ticket.id}`}>
            <CardContent className="p-5 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{ticket.subject}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{ticket.company} · {ticket.client} · Created {ticket.created}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge variant="outline" className={`text-[10px] ${PRIORITY_COLORS[ticket.priority]}`}>{ticket.priority}</Badge>
                <Badge variant="outline" className="text-[10px]">{STATUS_LABELS[ticket.status]}</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function LnOpsDocs() {
  const ALL_DOCS = [
    { id: "D-001", company: "TechVentures LLC", client: "Rajesh Kumar", doc: "BOI Filing Draft", category: "compliance", status: "action-required" as const },
    { id: "D-002", company: "SwiftPay Solutions Inc", client: "Neha Joshi", doc: "Address Proof", category: "identity", status: "pending-review" as const },
    { id: "D-003", company: "GreenLeaf Organics LLC", client: "Amit Patel", doc: "Passport - Amit Patel", category: "identity", status: "verified" as const },
    { id: "D-004", company: "DataBridge Analytics LLC", client: "Vikram Rao", doc: "EIN Confirmation Letter", category: "tax", status: "verified" as const },
    { id: "D-005", company: "NovaTech AI Inc", client: "Deepak Verma", doc: "Operating Agreement", category: "formation", status: "verified" as const },
    { id: "D-006", company: "TechVentures LLC", client: "Rajesh Kumar", doc: "Articles of Organization", category: "formation", status: "verified" as const },
  ];

  return (
    <div className="px-16 lg:px-24 py-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold">Documents</h1>
        <p className="text-sm text-muted-foreground">Client documents you have access to manage</p>
      </div>
      <div className="space-y-3">
        {ALL_DOCS.map((doc) => (
          <Card key={doc.id} className="border-0 shadow-sm" data-testid={`ops-doc-${doc.id}`}>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{doc.doc}</p>
                <p className="text-xs text-muted-foreground">{doc.company} · {doc.client}</p>
              </div>
              <Badge variant="outline" className={`text-[10px] shrink-0 ${DOC_STATUS_COLORS[doc.status]}`}>
                {doc.status.replace("-", " ")}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
