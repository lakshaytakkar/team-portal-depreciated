import { useParams, Link } from "wouter";
import {
  Building2, CheckCircle2, Clock, ArrowLeft, MapPin, Hash,
  Package, Shield, FileText, Receipt, MessageSquare, Calendar,
  Download, CreditCard, User,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  CLIENT_PROFILE,
  FORMATION_STAGES,
  LN_DOCUMENTS,
  LN_INVOICES,
  LN_CONVERSATIONS,
  LN_MESSAGES,
} from "@/lib/mock-data-dashboard-ln";

const categoryIcon: Record<string, typeof FileText> = {
  formation: Building2, tax: CreditCard, compliance: Shield, identity: User, banking: CreditCard,
};

const statusBadge: Record<string, { label: string; cls: string }> = {
  verified: { label: "Verified", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  "pending-review": { label: "Pending Review", cls: "bg-amber-50 text-amber-700 border-amber-200" },
  "action-required": { label: "Action Required", cls: "bg-red-50 text-red-700 border-red-200" },
};

const invStatusBadge: Record<string, { label: string; cls: string }> = {
  paid: { label: "Paid", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  pending: { label: "Pending", cls: "bg-amber-50 text-amber-700 border-amber-200" },
  overdue: { label: "Overdue", cls: "bg-red-50 text-red-700 border-red-200" },
};

function fmt(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function LnCompanyDetail() {
  const params = useParams<{ companyId: string }>();
  const company = CLIENT_PROFILE.companies.find(c => c.id === params.companyId);

  if (!company) {
    return (
      <div className="p-6" data-testid="company-not-found">
        <Link href="/portal-ln/companies">
          <Button variant="ghost" size="sm"><ArrowLeft className="size-4 mr-2" /> Back to Companies</Button>
        </Link>
        <div className="text-center py-16">
          <Building2 className="size-8 mx-auto text-muted-foreground mb-3" />
          <h3 className="text-lg font-semibold">Company Not Found</h3>
        </div>
      </div>
    );
  }

  const docs = LN_DOCUMENTS.filter(d => d.companyId === company.id);
  const invoices = LN_INVOICES.filter(i => i.companyId === company.id);
  const conversations = LN_CONVERSATIONS.filter(c => c.companyName === company.name);
  const latestConvo = conversations[0];
  const convoMessages = latestConvo ? LN_MESSAGES.filter(m => m.conversationId === latestConvo.id).slice(-3) : [];

  const completedStages = Math.min(company.currentStage, FORMATION_STAGES.length);
  const isCompleted = company.status === "completed" || company.status === "active";

  return (
    <div className="p-6 space-y-6" data-testid="ln-company-detail-page">
      <div className="flex items-center gap-3">
        <Link href="/portal-ln/companies">
          <Button variant="ghost" size="sm" data-testid="button-back-companies">
            <ArrowLeft className="size-4 mr-2" /> Back
          </Button>
        </Link>
      </div>

      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className={cn(
            "size-14 rounded-xl flex items-center justify-center",
            isCompleted ? "bg-emerald-100" : "bg-blue-100"
          )}>
            <Building2 className={cn("size-7", isCompleted ? "text-emerald-600" : "text-blue-600")} />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-heading" data-testid="text-company-name">{company.name}</h1>
            <div className="flex items-center gap-3 mt-1">
              <Badge variant="outline" className="text-xs">{company.entityType}</Badge>
              <Badge variant="outline" className={cn("text-xs", isCompleted ? "bg-emerald-50 text-emerald-700" : "bg-blue-50 text-blue-700")}>
                {isCompleted ? "Completed" : "In Progress"}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { icon: MapPin, label: "State", value: company.state },
          { icon: Package, label: "Package", value: company.packageTier },
          { icon: Hash, label: "EIN", value: company.ein || "Pending" },
          { icon: Shield, label: "Registered Agent", value: company.registeredAgent || "Pending Assignment" },
          { icon: Calendar, label: "Started", value: fmt(company.startedAt) },
        ].map(item => (
          <Card key={item.label} className="p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <item.icon className="size-3.5" />
              <span>{item.label}</span>
            </div>
            <p className="text-sm font-semibold" data-testid={`text-detail-${item.label.toLowerCase()}`}>{item.value}</p>
          </Card>
        ))}
      </div>

      <Card data-testid="formation-timeline-card">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="size-4 text-blue-600" />
            Formation Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-0">
            {FORMATION_STAGES.map((stage, idx) => {
              const isDone = idx < completedStages;
              const isCurrent = idx === completedStages && !isCompleted;
              return (
                <div key={stage.id} className="flex items-start gap-4" data-testid={`timeline-stage-${stage.id}`}>
                  <div className="flex flex-col items-center">
                    <div className={cn(
                      "size-8 rounded-full flex items-center justify-center text-xs font-semibold",
                      isDone && "bg-emerald-100 text-emerald-700",
                      isCurrent && "bg-blue-100 text-blue-700 ring-2 ring-blue-400/40",
                      !isDone && !isCurrent && "bg-gray-100 text-gray-400"
                    )}>
                      {isDone ? <CheckCircle2 className="size-4" /> : isCurrent ? <Clock className="size-4 animate-pulse" /> : idx + 1}
                    </div>
                    {idx < FORMATION_STAGES.length - 1 && (
                      <div className={cn("w-0.5 h-8 mt-1", isDone ? "bg-emerald-300" : "bg-gray-200")} />
                    )}
                  </div>
                  <div className="pb-4 flex-1">
                    <p className={cn(
                      "text-sm font-medium",
                      isDone && "text-emerald-700",
                      isCurrent && "text-blue-700 font-semibold",
                      !isDone && !isCurrent && "text-muted-foreground"
                    )}>
                      {stage.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">{stage.description}</p>
                    {isDone && company.stageCompletionDates?.[stage.id] && (
                      <p className="text-[10px] text-emerald-600 mt-0.5">Completed {fmt(company.stageCompletionDates[stage.id])}</p>
                    )}
                    {isCurrent && (
                      <Badge className="mt-1 bg-blue-50 text-blue-700 border-blue-200 text-[10px]" variant="outline">Current Stage</Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card data-testid="company-documents-card">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="size-4 text-blue-600" />
                Documents ({docs.length})
              </CardTitle>
              <Link href="/portal-ln/documents">
                <Button variant="ghost" size="sm" className="text-xs text-blue-600">View All</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {docs.slice(0, 5).map(doc => {
              const st = statusBadge[doc.status];
              const Icon = categoryIcon[doc.category] || FileText;
              return (
                <div key={doc.id} className="flex items-center gap-3 py-2 border-b last:border-0" data-testid={`company-doc-${doc.id}`}>
                  <div className="size-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                    <Icon className="size-4 text-gray-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{doc.name}</p>
                    <p className="text-xs text-muted-foreground">{doc.size} · {fmt(doc.uploadedAt)}</p>
                  </div>
                  <Badge variant="outline" className={cn("text-[9px] shrink-0", st.cls)}>{st.label}</Badge>
                  <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" data-testid={`download-doc-${doc.id}`}>
                    <Download className="size-3.5" />
                  </Button>
                </div>
              );
            })}
            {docs.length === 0 && <p className="text-sm text-muted-foreground py-4 text-center">No documents yet</p>}
          </CardContent>
        </Card>

        <Card data-testid="company-invoices-card">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Receipt className="size-4 text-blue-600" />
                Invoices ({invoices.length})
              </CardTitle>
              <Link href="/portal-ln/invoices">
                <Button variant="ghost" size="sm" className="text-xs text-blue-600">View All</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {invoices.map(inv => {
              const st = invStatusBadge[inv.status];
              return (
                <div key={inv.id} className="flex items-center gap-3 py-2 border-b last:border-0" data-testid={`company-inv-${inv.id}`}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold">{inv.number}</p>
                      <Badge variant="outline" className={cn("text-[9px]", st.cls)}>{st.label}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{inv.description}</p>
                  </div>
                  <p className="text-sm font-bold shrink-0">${inv.amount}</p>
                </div>
              );
            })}
            {invoices.length === 0 && <p className="text-sm text-muted-foreground py-4 text-center">No invoices yet</p>}
          </CardContent>
        </Card>
      </div>

      {latestConvo && (
        <Card data-testid="company-messages-card">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <MessageSquare className="size-4 text-blue-600" />
                Recent Messages — {latestConvo.specialistName}
              </CardTitle>
              <Link href="/portal-ln/messages">
                <Button variant="ghost" size="sm" className="text-xs text-blue-600">Open Messages</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {convoMessages.map(msg => (
              <div key={msg.id} className={cn("flex gap-3", msg.isClient && "flex-row-reverse")} data-testid={`company-msg-${msg.id}`}>
                <div className={cn(
                  "size-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                  msg.isClient ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-600"
                )}>
                  {msg.isClient ? CLIENT_PROFILE.avatar : msg.from.split(" ").map(n => n[0]).join("")}
                </div>
                <div className={cn("max-w-[75%]")}>
                  <div className={cn("flex items-center gap-2 mb-1", msg.isClient && "flex-row-reverse")}>
                    <span className="text-xs font-semibold">{msg.from}</span>
                    {!msg.isClient && <Badge variant="outline" className="text-[9px] h-4">{msg.fromRole}</Badge>}
                  </div>
                  <div className={cn(
                    "rounded-2xl px-4 py-2.5 text-sm",
                    msg.isClient ? "bg-blue-600 text-white rounded-tr-md" : "bg-slate-100 rounded-tl-md"
                  )}>
                    {msg.content}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
