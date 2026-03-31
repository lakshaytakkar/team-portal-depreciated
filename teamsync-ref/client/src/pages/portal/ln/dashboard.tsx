import { useState } from "react";
import { useLocation, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  Building2, FileText, Receipt, MessageSquare, Calendar, Clock,
  Check, AlertTriangle, ArrowRight, Phone, Shield, DollarSign,
  ChevronRight, Activity, ExternalLink, CheckCircle2, Circle,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  CLIENT_PROFILE,
  FORMATION_STAGES,
  DASHBOARD_METRICS,
  COMPLIANCE_DEADLINES,
  RECENT_ACTIVITY,
  RM_CONTACT,
  LN_PORTAL_COLOR,
  LN_SETUP_DATA,
  getLnClientMode,
  setLnClientMode,
  type LnClientMode,
} from "@/lib/mock-data-dashboard-ln";

const CURRENT_STAGE_INDEX = 4;

const ICON_MAP: Record<string, typeof Check> = {
  check: Check, file: FileText, dollar: DollarSign, shield: Shield, message: MessageSquare,
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function timeAgo(ts: string) {
  const diff = Date.now() - new Date(ts).getTime();
  const days = Math.floor(diff / 86400000);
  if (days > 30) return formatDate(ts);
  if (days > 0) return `${days}d ago`;
  const hrs = Math.floor(diff / 3600000);
  if (hrs > 0) return `${hrs}h ago`;
  return "Just now";
}

function SetupDashboard() {
  const [, setLocation] = useLocation();
  const data = LN_SETUP_DATA;
  const doneItems = data.setupItems.filter(i => i.done);
  const pendingItems = data.setupItems.filter(i => !i.done);

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 p-6 text-white shadow-lg">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/3 translate-x-1/3" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm text-blue-200">Welcome, {CLIENT_PROFILE.name.split(" ")[0]}</span>
            <Badge className="bg-white/20 text-white border-0 text-xs font-semibold">Getting Started</Badge>
          </div>
          <h1 className="text-2xl font-bold font-heading" data-testid="text-setup-title">Start Your US Company Formation</h1>
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm mb-1.5">
              <span className="font-semibold text-white">{data.onboardingPercent}% complete</span>
              <span className="text-blue-200">{data.tasksRemaining} steps remaining</span>
            </div>
            <div className="h-3 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-white rounded-full transition-all" style={{ width: `${data.onboardingPercent}%` }} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card className="md:col-span-2 border-0 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-500" /> Formation Checklist
              </CardTitle>
              <Badge variant="outline" className="text-xs">{doneItems.length}/{data.setupItems.length} done</Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <Progress value={(doneItems.length / data.setupItems.length) * 100} className="h-2 mb-4" />
            <div className="space-y-2">
              {data.setupItems.map(item => (
                <Link key={item.id} href={item.href}>
                  <div
                    className={`flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-muted/30 cursor-pointer transition-colors ${item.done ? "opacity-60" : ""}`}
                    data-testid={`setup-item-${item.id}`}
                  >
                    {item.done
                      ? <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                      : <Circle className="w-4 h-4 text-blue-400 shrink-0" />
                    }
                    <span className={`text-sm ${item.done ? "line-through text-muted-foreground" : "font-medium"}`}>{item.label}</span>
                    {!item.done && <ChevronRight className="w-3.5 h-3.5 text-muted-foreground ml-auto shrink-0" />}
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Next Step</p>
              <p className="text-sm font-medium">{pendingItems[0]?.label}</p>
              <Link href={pendingItems[0]?.href || "/portal-ln/onboarding"}>
                <Button size="sm" className="w-full mt-3 bg-blue-600 hover:bg-blue-700 gap-1 text-xs" data-testid="button-continue-setup">
                  <ArrowRight className="w-3 h-3" /> Continue
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-sky-50/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <Avatar className="size-9">
                  <AvatarFallback className="bg-sky-100 text-sky-700 text-xs font-bold">{RM_CONTACT.avatar}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-semibold">{RM_CONTACT.name}</p>
                  <p className="text-xs text-muted-foreground">{RM_CONTACT.role}</p>
                </div>
              </div>
              <Button size="sm" className="w-full bg-sky-600 hover:bg-sky-700 text-white gap-2 text-xs" data-testid="button-setup-contact-rm">
                <Phone className="w-3.5 h-3.5" /> Contact Specialist
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function LnDashboard() {
  const [, setLocation] = useLocation();
  const [mode, setMode] = useState<LnClientMode>(getLnClientMode);
  const m = DASHBOARD_METRICS;

  const toggleMode = () => {
    const next = mode === "active" ? "setup" : "active";
    setLnClientMode(next);
    setMode(next);
  };

  return (
    <div className="p-6 space-y-8" data-testid="ln-dashboard-page">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          {mode === "active" ? (
            <>
              <h1 className="text-2xl font-bold tracking-tight" data-testid="text-dashboard-greeting">
                Welcome back, {CLIENT_PROFILE.name.split(" ")[0]}
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Here's what's happening with your US company formations
              </p>
            </>
          ) : (
            <div />
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="text-[10px] h-7 px-2 gap-1 text-muted-foreground"
            onClick={toggleMode}
            data-testid="button-toggle-client-mode"
          >
            <Settings className="w-3 h-3" />
            {mode === "active" ? "View Setup Mode" : "View Active Mode"}
          </Button>
          {mode === "active" && (
            <Button
              onClick={() => setLocation("/portal-ln/onboarding")}
              className="bg-blue-600 hover:bg-blue-700"
              data-testid="button-new-formation"
            >
              <Building2 className="w-4 h-4 mr-2" />
              New Formation
            </Button>
          )}
        </div>
      </div>

      {mode === "setup" && <SetupDashboard />}

      {mode === "active" && (
        <>
      

      <Card className="overflow-hidden" data-testid="formation-stepper-card">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">TechVentures LLC — Formation Progress</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">Delaware LLC • Premium Package • Started Dec 12, 2025</p>
            </div>
            <Badge variant="secondary" className="text-blue-700 bg-blue-50 text-xs">
              Stage {CURRENT_STAGE_INDEX + 1} of {FORMATION_STAGES.length}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pb-5">
          <div className="flex items-start gap-0 overflow-x-auto py-3" data-testid="formation-stepper">
            {FORMATION_STAGES.map((stage, idx) => {
              const isComplete = idx < CURRENT_STAGE_INDEX;
              const isCurrent = idx === CURRENT_STAGE_INDEX;
              const isFuture = idx > CURRENT_STAGE_INDEX;
              return (
                <div key={stage.id} className="flex items-start flex-1 min-w-[100px]">
                  <div className="flex flex-col items-center w-full">
                    <div className="flex items-center w-full">
                      <div
                        className={cn(
                          "size-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all z-10",
                          isComplete && "bg-green-500 text-white",
                          isCurrent && "bg-blue-600 text-white ring-4 ring-blue-100",
                          isFuture && "bg-gray-200 text-gray-400"
                        )}
                      >
                        {isComplete ? <Check className="w-4 h-4" /> : idx + 1}
                      </div>
                      {idx < FORMATION_STAGES.length - 1 && (
                        <div
                          className={cn(
                            "h-0.5 flex-1",
                            isComplete ? "bg-green-400" : "bg-gray-200"
                          )}
                        />
                      )}
                    </div>
                    <p className={cn(
                      "text-[11px] mt-2 text-center leading-tight px-1",
                      isCurrent ? "font-bold text-blue-700" : isComplete ? "font-medium text-green-700" : "text-gray-400"
                    )}>
                      {stage.shortName}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-2 mt-2 px-1">
            <Shield className="w-4 h-4 text-blue-500" />
            <p className="text-sm">
              <span className="font-semibold text-blue-700">Current:</span>{" "}
              {FORMATION_STAGES[CURRENT_STAGE_INDEX].name} — {FORMATION_STAGES[CURRENT_STAGE_INDEX].description}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" data-testid="dashboard-metrics">
        {[
          { label: "Active Entities", value: m.activeEntities, sub: `${m.completedEntities} completed`, icon: Building2, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Documents", value: m.verifiedDocuments, sub: `${m.pendingDocuments} pending`, icon: FileText, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Pending Invoices", value: m.pendingInvoices, sub: `$${m.outstandingAmount} due`, icon: Receipt, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Messages", value: m.unreadMessages, sub: "unread", icon: MessageSquare, color: "text-violet-600", bg: "bg-violet-50" },
        ].map((stat) => (
          <Card key={stat.label} className="hover:shadow-sm transition-shadow" data-testid={`metric-${stat.label.toLowerCase().replace(/\s+/g, "-")}`}>
            <CardContent className="pt-5 pb-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{stat.sub}</p>
                </div>
                <div className={cn("size-9 rounded-lg flex items-center justify-center", stat.bg)}>
                  <stat.icon className={cn("w-5 h-5", stat.color)} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card data-testid="recent-activity-card">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Recent Activity
                </CardTitle>
                <Button variant="ghost" size="sm" className="text-xs text-blue-600 h-7" data-testid="button-view-all-activity">
                  View All <ChevronRight className="w-3 h-3 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-0">
              {RECENT_ACTIVITY.map((act, idx) => {
                const Icon = ICON_MAP[act.icon] || Check;
                return (
                  <div
                    key={act.id}
                    className={cn(
                      "flex items-start gap-3 py-3",
                      idx < RECENT_ACTIVITY.length - 1 && "border-b border-gray-100"
                    )}
                    data-testid={`activity-item-${act.id}`}
                  >
                    <div className={cn(
                      "size-8 rounded-full flex items-center justify-center shrink-0",
                      act.type === "compliance" ? "bg-orange-100 text-orange-600" :
                      act.type === "payment" ? "bg-green-100 text-green-600" :
                      act.type === "document" ? "bg-blue-100 text-blue-600" :
                      act.type === "message" ? "bg-violet-100 text-violet-600" :
                      "bg-gray-100 text-gray-600"
                    )}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{act.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">{act.description}</p>
                    </div>
                    <span className="text-[11px] text-muted-foreground shrink-0">{timeAgo(act.timestamp)}</span>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card data-testid="compliance-deadlines-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Upcoming Deadlines
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {COMPLIANCE_DEADLINES.slice(0, 4).map((dl) => (
                <div key={dl.id} className="flex items-start gap-3" data-testid={`deadline-${dl.id}`}>
                  <Badge
                    variant="secondary"
                    className={cn(
                      "text-[9px] mt-1 shrink-0 px-1.5 py-0",
                      dl.priority === "high" ? "bg-red-100 text-red-700" :
                      dl.priority === "medium" ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"
                    )}
                    data-testid={`badge-priority-${dl.id}`}
                  >
                    {dl.priority === "high" ? "High" : dl.priority === "medium" ? "Medium" : "Low"}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{dl.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Clock className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{formatDate(dl.dueDate)}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">{dl.company}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card data-testid="rm-contact-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Your Specialist</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Avatar className="size-10">
                  <AvatarFallback className="bg-sky-100 text-sky-700 text-sm font-bold">
                    {RM_CONTACT.avatar}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm font-semibold">{RM_CONTACT.name}</p>
                  <p className="text-xs text-muted-foreground">{RM_CONTACT.role}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4">
                <Button variant="outline" size="sm" className="text-xs h-8" data-testid="button-call-rm">
                  <Phone className="w-3 h-3 mr-1" /> Call
                </Button>
                <Button variant="outline" size="sm" className="text-xs h-8" data-testid="button-whatsapp-rm">
                  <ExternalLink className="w-3 h-3 mr-1" /> WhatsApp
                </Button>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="w-full mt-2 text-xs text-blue-600 h-7"
                onClick={() => setLocation("/portal-ln/messages")}
                data-testid="button-message-rm"
              >
                <MessageSquare className="w-3 h-3 mr-1" /> Send Message
              </Button>
            </CardContent>
          </Card>

          <Card data-testid="quick-links-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5">
              {[
                { label: "Upload Document", url: "/portal-ln/documents", icon: FileText },
                { label: "View Invoice", url: "/portal-ln/invoices", icon: Receipt },
                { label: "Message Specialist", url: "/portal-ln/messages", icon: MessageSquare },
                { label: "Track Formation", url: "/portal-ln/companies", icon: Building2 },
              ].map((link) => (
                <Button
                  key={link.url}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-between text-xs h-8 font-medium"
                  onClick={() => setLocation(link.url)}
                  data-testid={`quick-link-${link.label.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  <span className="flex items-center gap-2">
                    <link.icon className="w-3.5 h-3.5 text-muted-foreground" />
                    {link.label}
                  </span>
                  <ArrowRight className="w-3 h-3 text-muted-foreground" />
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
      </>
      )}
    </div>
  );
}
