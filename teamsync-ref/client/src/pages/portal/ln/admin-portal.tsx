import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useLocation } from "wouter";
import {
  Users, Building2, DollarSign, Kanban, Shield, Video, Play, Clock,
  ChevronRight, ArrowLeft,
} from "lucide-react";
import {
  ADMIN_COMPANIES_ALL, ADMIN_PIPELINE_COUNTS, ADMIN_TEAM, ADMIN_MONTHLY_REVENUE,
} from "@/lib/mock-data-dashboard-ln";

export default function LnAdminPortal() {
  const [, setLocation] = useLocation();
  const totalRevenue = ADMIN_COMPANIES_ALL.reduce((sum, c) => sum + c.revenue, 0);
  const completed = ADMIN_COMPANIES_ALL.filter(c => c.stageNum === 7).length;
  const inPipeline = ADMIN_COMPANIES_ALL.length - completed;

  return (
    <div className="px-16 lg:px-24 py-6 space-y-6" data-testid="ln-admin-portal-dashboard">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 p-6 text-white shadow-lg">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/3 translate-x-1/3" />
        <div className="relative z-10">
          <p className="text-sm text-violet-200 mb-1">CEO Command Center</p>
          <h1 className="text-2xl font-bold font-heading" data-testid="text-ln-admin-title">LegalNations — Overview</h1>
          <div className="flex items-center gap-6 mt-3 text-sm text-violet-200">
            <span><strong className="text-white">{ADMIN_COMPANIES_ALL.length}</strong> Total Formations</span>
            <span><strong className="text-white">{completed}</strong> Completed</span>
            <span><strong className="text-white">${totalRevenue.toLocaleString()}</strong> Revenue</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Formations", value: ADMIN_COMPANIES_ALL.length, icon: Building2, color: "text-violet-600", bg: "bg-violet-50" },
          { label: "Completed", value: completed, icon: Shield, color: "text-green-600", bg: "bg-green-50" },
          { label: "In Pipeline", value: inPipeline, icon: Kanban, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Total Revenue", value: `$${totalRevenue.toLocaleString()}`, icon: DollarSign, color: "text-blue-600", bg: "bg-blue-50" },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className={`w-9 h-9 rounded-lg ${stat.bg} flex items-center justify-center mb-3`}>
                  <Icon className={`w-4 h-4 ${stat.color}`} />
                </div>
                <p className="text-xl font-bold" data-testid={`stat-${stat.label.toLowerCase().replace(/\s+/g, "-")}`}>{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card className="md:col-span-2 border-0 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">Active Formations</CardTitle>
              <Badge variant="outline" className="text-xs">{ADMIN_COMPANIES_ALL.length} companies</Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0 space-y-2">
            {ADMIN_COMPANIES_ALL.map((co, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 hover:bg-muted/60 transition-colors cursor-pointer"
                onClick={() => setLocation(`/portal-ln/formation/client/${co.id}`)}
                data-testid={`admin-company-row-${idx}`}
              >
                <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-xs font-bold text-violet-600 shrink-0">
                  {co.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{co.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Progress value={(co.stageNum / 7) * 100} className="h-1 w-20" />
                    <span className="text-xs text-muted-foreground">{co.state} · {co.client}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <Badge
                    variant="outline"
                    className={`text-[10px] ${co.stageNum === 7 ? "border-green-300 text-green-700 bg-green-50" : "border-gray-200 text-gray-500"}`}
                  >
                    {co.stage}
                  </Badge>
                  <p className="text-xs font-bold mt-0.5">${co.revenue.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Pipeline Overview</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              {Object.entries(ADMIN_PIPELINE_COUNTS).map(([stage, count]) => (
                <div key={stage} className="flex items-center justify-between" data-testid={`admin-pipeline-${stage.toLowerCase().replace(/\s+/g, "-")}`}>
                  <span className="text-xs text-muted-foreground">{stage}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-violet-500 rounded-full" style={{ width: `${(count / 15) * 100}%` }} />
                    </div>
                    <span className="text-xs font-bold w-4 text-right">{count}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Team Performance</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              {ADMIN_TEAM.map((member, idx) => (
                <div key={idx} className="flex items-center gap-2.5" data-testid={`admin-team-${member.name.toLowerCase().replace(/\s+/g, "-")}`}>
                  <div className="w-7 h-7 rounded-full bg-violet-100 flex items-center justify-center text-[10px] font-bold text-violet-600 shrink-0">
                    {member.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold">{member.name}</p>
                    <p className="text-[10px] text-muted-foreground">{member.role}</p>
                  </div>
                  <Badge variant="outline" className="text-[10px]">{member.activeClients} active</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export function LnAdminPipeline() {
  const [, setLocation] = useLocation();
  const stages = Object.entries(ADMIN_PIPELINE_COUNTS);
  return (
    <div className="px-16 lg:px-24 py-6 space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground h-8 px-2" onClick={() => setLocation("/portal-ln/admin")} data-testid="breadcrumb-back-pipeline">
          <ArrowLeft className="w-3.5 h-3.5" /> Dashboard
        </Button>
        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="text-sm font-semibold">Pipeline Overview</span>
      </div>
      <div>
        <h1 className="text-xl font-bold">Pipeline Overview</h1>
        <p className="text-sm text-muted-foreground">All client formations across every stage</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stages.map(([stage, count]) => (
          <Card key={stage} className="border-0 shadow-sm">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-violet-600" data-testid={`admin-pipeline-count-${stage}`}>{count}</p>
              <p className="text-xs text-muted-foreground mt-1">{stage}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="border-0 shadow-sm">
        <CardHeader><CardTitle className="text-sm">All Formations</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {ADMIN_COMPANIES_ALL.map((co, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-xl bg-muted/40 hover:bg-muted/60 cursor-pointer transition-colors"
                onClick={() => setLocation(`/portal-ln/formation/client/${co.id}`)}
                data-testid={`admin-pipeline-co-${idx}`}
              >
                <div>
                  <p className="text-sm font-medium">{co.name}</p>
                  <p className="text-xs text-muted-foreground">{co.client} · {co.state}</p>
                  <Progress value={(co.stageNum / 7) * 100} className="h-1 w-32 mt-1" />
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{co.stage}</Badge>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function LnAdminTeam() {
  const [, setLocation] = useLocation();
  return (
    <div className="px-16 lg:px-24 py-6 space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground h-8 px-2" onClick={() => setLocation("/portal-ln/admin")} data-testid="breadcrumb-back-team">
          <ArrowLeft className="w-3.5 h-3.5" /> Dashboard
        </Button>
        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="text-sm font-semibold">Team Management</span>
      </div>
      <h1 className="text-xl font-bold">Team Management</h1>
      <div className="grid md:grid-cols-2 gap-4">
        {ADMIN_TEAM.map((member, idx) => (
          <Card key={idx} className="border-0 shadow-sm">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-violet-100 flex items-center justify-center text-lg font-bold text-violet-600">
                {member.name.split(" ").map(n => n[0]).join("")}
              </div>
              <div>
                <p className="font-semibold">{member.name}</p>
                <p className="text-sm text-muted-foreground">{member.role}</p>
                <Badge className="mt-1 text-[10px]" variant="outline">{member.activeClients} active clients</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function LnAdminRevenue() {
  const [, setLocation] = useLocation();
  const totalRevenue = ADMIN_MONTHLY_REVENUE.reduce((s, m) => s + m.amount, 0);

  return (
    <div className="px-16 lg:px-24 py-6 space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground h-8 px-2" onClick={() => setLocation("/portal-ln/admin")} data-testid="breadcrumb-back-revenue">
          <ArrowLeft className="w-3.5 h-3.5" /> Dashboard
        </Button>
        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="text-sm font-semibold">Revenue Analytics</span>
      </div>
      <h1 className="text-xl font-bold">Revenue Analytics</h1>
      <div className="grid grid-cols-3 gap-3">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-violet-600" data-testid="stat-total-revenue">${totalRevenue.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">Total Revenue (6 mo)</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-violet-600">17</p>
            <p className="text-xs text-muted-foreground mt-1">Total Formations</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-violet-600">${Math.round(totalRevenue / 6).toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">Avg Monthly</p>
          </CardContent>
        </Card>
      </div>
      <Card className="border-0 shadow-sm">
        <CardHeader><CardTitle className="text-sm">Monthly Breakdown</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {ADMIN_MONTHLY_REVENUE.map((m) => (
            <div key={m.month} className="flex items-center justify-between" data-testid={`revenue-${m.month.replace(/\s+/g, "-").toLowerCase()}`}>
              <div>
                <p className="text-sm font-medium">{m.month}</p>
                <p className="text-xs text-muted-foreground">{m.formations} formations</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-violet-500 rounded-full" style={{ width: `${(m.amount / 4000) * 100}%` }} />
                </div>
                <span className="text-sm font-bold w-16 text-right">${m.amount.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export function LnAdminSettings() {
  const [, setLocation] = useLocation();
  return (
    <div className="px-16 lg:px-24 py-6 space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground h-8 px-2" onClick={() => setLocation("/portal-ln/admin")} data-testid="breadcrumb-back-settings">
          <ArrowLeft className="w-3.5 h-3.5" /> Dashboard
        </Button>
        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="text-sm font-semibold">System Settings</span>
      </div>
      <h1 className="text-xl font-bold">System Settings</h1>
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6 space-y-4">
          {["Package Pricing & Tiers", "Formation Stage Workflow", "Team Role Permissions", "Notification Rules", "Integration Configs (Mercury, Stripe)", "Compliance Calendar Templates", "Invoice Auto-Generation Rules"].map((setting) => (
            <div key={setting} className="flex items-center justify-between py-3 border-b last:border-0">
              <p className="text-sm font-medium">{setting}</p>
              <Button size="sm" variant="outline" data-testid={`setting-${setting.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}>Configure</Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export function LnAdminTraining() {
  const [, setLocation] = useLocation();
  const TRAINING_VIDEOS = [
    { id: "TV-001", title: "LLC Formation Process — End to End Walkthrough", category: "Formation", duration: "24:30", instructor: "Lakshay", views: 12, date: "2026-02-15" },
    { id: "TV-002", title: "KYC Review SOP — Document Verification Standards", category: "KYC", duration: "18:45", instructor: "Lakshay", views: 9, date: "2026-02-20" },
    { id: "TV-003", title: "BOI Filing Guide — FinCEN Submission Steps", category: "Compliance", duration: "15:20", instructor: "Lakshay", views: 11, date: "2026-03-01" },
    { id: "TV-004", title: "EIN Application — IRS Fax vs Online Methods", category: "Formation", duration: "12:10", instructor: "Lakshay", views: 8, date: "2026-03-05" },
    { id: "TV-005", title: "Sales Scripts — Discovery Call Framework", category: "Sales", duration: "21:55", instructor: "Lakshay", views: 14, date: "2026-03-10" },
    { id: "TV-006", title: "Mercury Bank Setup SOP — Step-by-Step", category: "Banking", duration: "16:40", instructor: "Lakshay", views: 7, date: "2026-03-15" },
  ];

  const CATEGORY_COLORS: Record<string, string> = {
    "Formation": "bg-sky-100 text-sky-700",
    "KYC": "bg-amber-100 text-amber-700",
    "Compliance": "bg-emerald-100 text-emerald-700",
    "Sales": "bg-pink-100 text-pink-700",
    "Banking": "bg-violet-100 text-violet-700",
  };

  return (
    <div className="px-16 lg:px-24 py-6 space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground h-8 px-2" onClick={() => setLocation("/portal-ln/admin")} data-testid="breadcrumb-back-training">
          <ArrowLeft className="w-3.5 h-3.5" /> Dashboard
        </Button>
        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="text-sm font-semibold">Training Videos</span>
      </div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Training Videos</h1>
          <p className="text-sm text-muted-foreground">SOPs and training content for the LegalNations team</p>
        </div>
        <Button className="bg-violet-600 hover:bg-violet-700 text-white gap-1" data-testid="button-add-training-video">
          <Video className="w-4 h-4" /> Add Video
        </Button>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {TRAINING_VIDEOS.map((video) => (
          <Card key={video.id} className="border-0 shadow-sm" data-testid={`admin-training-video-${video.id}`}>
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center shrink-0">
                  <Video className="w-6 h-6 text-violet-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm leading-snug">{video.title}</p>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <Badge className={`text-[10px] ${CATEGORY_COLORS[video.category] || "bg-gray-100 text-gray-600"}`} variant="outline">
                      {video.category}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                      <Clock className="w-3 h-3" />{video.duration}
                    </span>
                    <span className="text-[10px] text-muted-foreground">{video.views} views</span>
                    <span className="text-[10px] text-muted-foreground">{video.date}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button size="sm" className="bg-violet-600 hover:bg-violet-700 text-white gap-1 h-8 text-xs" data-testid={`play-training-video-${video.id}`}>
                  <Play className="w-3.5 h-3.5" /> Play
                </Button>
                <Button size="sm" variant="outline" className="h-8 text-xs" data-testid={`edit-training-video-${video.id}`}>Edit</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
