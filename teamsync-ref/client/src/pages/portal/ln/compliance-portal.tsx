import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Shield, Calendar, AlertTriangle, Building2,
  FileText, Eye,
} from "lucide-react";
import {
  COMPLIANCE_DEADLINES, BOI_QUEUE, ANNUAL_REPORTS, COMPLIANCE_CLIENTS,
} from "@/lib/mock-data-dashboard-ln";

const BOI_STATUS_COLORS: Record<string, string> = {
  "filed": "border-green-300 text-green-700 bg-green-50",
  "draft-ready": "border-blue-300 text-blue-700 bg-blue-50",
  "in-progress": "border-amber-300 text-amber-700 bg-amber-50",
  "pending-kyc": "border-red-300 text-red-700 bg-red-50",
};

const BOI_STATUS_LABELS: Record<string, string> = {
  "filed": "Filed",
  "draft-ready": "Draft Ready",
  "in-progress": "In Progress",
  "pending-kyc": "Pending KYC",
};

export default function LnCompliancePortal() {
  const pendingBOI = BOI_QUEUE.filter(b => b.status !== "filed").length;
  const upcomingReports = ANNUAL_REPORTS.filter(a => a.status === "upcoming").length;
  const highAlerts = COMPLIANCE_DEADLINES.filter(d => d.priority === "high").length;

  return (
    <div className="px-16 lg:px-24 py-6 space-y-6" data-testid="ln-compliance-portal-dashboard">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-6 text-white shadow-lg">
        <div className="relative z-10">
          <p className="text-sm text-emerald-200 mb-1">Compliance Officer</p>
          <h1 className="text-2xl font-bold" data-testid="text-compliance-title">Compliance Dashboard</h1>
          <div className="flex items-center gap-6 mt-3 text-sm text-emerald-200">
            <span><strong className="text-white">{pendingBOI}</strong> BOI Pending</span>
            <span><strong className="text-white">{upcomingReports}</strong> Annual Reports Due</span>
            <span><strong className="text-white">{highAlerts}</strong> High Priority Alerts</span>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-500" /> BOI Filing Queue
              </CardTitle>
              <Badge variant="outline" className="text-xs">{BOI_QUEUE.length} filings</Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0 space-y-2">
            {BOI_QUEUE.map((boi) => (
              <div
                key={boi.id}
                className={`p-3 rounded-xl border ${boi.status === "pending-kyc" ? "border-red-200 bg-red-50/30" : "bg-muted/30 border-transparent"}`}
                data-testid={`boi-queue-${boi.id}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div>
                    <p className="text-sm font-medium">{boi.company}</p>
                    <p className="text-xs text-muted-foreground">{boi.client} · {boi.state} · {boi.owners} owner{boi.owners > 1 ? "s" : ""}</p>
                  </div>
                  <Badge variant="outline" className={`text-[10px] ${BOI_STATUS_COLORS[boi.status]}`}>
                    {BOI_STATUS_LABELS[boi.status]}
                  </Badge>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  {boi.status === "filed" ? `Filed: ${boi.filedDate}` : `Due: ${boi.dueDate}`}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" /> Upcoming Deadlines
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              {COMPLIANCE_DEADLINES.slice(0, 4).map((dl) => (
                <div
                  key={dl.id}
                  className="p-2.5 rounded-lg bg-muted/40"
                  data-testid={`compliance-deadline-${dl.id}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold">{dl.title}</span>
                    <Badge
                      variant="outline"
                      className={`text-[10px] ${dl.priority === "high" ? "border-red-300 text-red-700 bg-red-50" : dl.priority === "medium" ? "border-amber-300 text-amber-700 bg-amber-50" : "border-gray-200 text-gray-500"}`}
                    >
                      {dl.priority}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{dl.company} · Due {dl.dueDate}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-500" /> Annual Reports
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              {ANNUAL_REPORTS.filter(a => a.status === "upcoming").slice(0, 3).map((ar) => (
                <div key={ar.id} className="flex items-center justify-between py-2" data-testid={`annual-report-${ar.id}`}>
                  <div>
                    <p className="text-xs font-medium">{ar.company}</p>
                    <p className="text-[10px] text-muted-foreground">{ar.state} · Due {ar.dueDate}</p>
                  </div>
                  <span className="text-xs font-bold">${ar.fee}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export function LnComplianceBOI() {
  return (
    <div className="px-16 lg:px-24 py-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold">BOI Filing Queue</h1>
        <p className="text-sm text-muted-foreground">Beneficial Ownership Information reports for FinCEN</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {(["filed", "draft-ready", "in-progress", "pending-kyc"] as const).map((status) => {
          const count = BOI_QUEUE.filter(b => b.status === status).length;
          return (
            <Card key={status} className="border-0 shadow-sm">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-emerald-600" data-testid={`boi-count-${status}`}>{count}</p>
                <p className="text-xs text-muted-foreground mt-1">{BOI_STATUS_LABELS[status]}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
      <div className="space-y-3">
        {BOI_QUEUE.map((boi) => (
          <Card key={boi.id} className="border-0 shadow-sm" data-testid={`boi-card-${boi.id}`}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-semibold">{boi.company}</p>
                  <p className="text-sm text-muted-foreground">{boi.client} · {boi.state} · {boi.owners} beneficial owner{boi.owners > 1 ? "s" : ""}</p>
                </div>
                <Badge variant="outline" className={BOI_STATUS_COLORS[boi.status]}>
                  {BOI_STATUS_LABELS[boi.status]}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                {boi.status === "filed" ? `Filed on ${boi.filedDate}` : `Deadline: ${boi.dueDate}`}
              </p>
              {boi.status === "draft-ready" && (
                <div className="flex gap-2">
                  <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white gap-1" data-testid={`send-boi-${boi.id}`}>
                    <FileText className="w-3.5 h-3.5" /> Send to Client
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1" data-testid={`preview-boi-${boi.id}`}>
                    <Eye className="w-3.5 h-3.5" /> Preview
                  </Button>
                </div>
              )}
              {boi.status === "in-progress" && (
                <Button size="sm" variant="outline" className="gap-1" data-testid={`continue-boi-${boi.id}`}>
                  Continue Preparation
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function LnComplianceAnnual() {
  return (
    <div className="px-16 lg:px-24 py-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold">Annual Reports</h1>
        <p className="text-sm text-muted-foreground">Track and file annual reports across all states</p>
      </div>
      <div className="space-y-3">
        {ANNUAL_REPORTS.map((ar) => (
          <Card key={ar.id} className="border-0 shadow-sm" data-testid={`annual-report-card-${ar.id}`}>
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="font-semibold">{ar.company}</p>
                <p className="text-sm text-muted-foreground">{ar.state} · Due {ar.dueDate}</p>
                <p className="text-xs text-muted-foreground mt-1">State Filing Fee: ${ar.fee}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={ar.status === "filed" ? "border-green-300 text-green-700 bg-green-50" : "border-amber-300 text-amber-700 bg-amber-50"}>
                  {ar.status === "filed" ? "Filed" : "Upcoming"}
                </Badge>
                {ar.status === "upcoming" && (
                  <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white" data-testid={`file-ar-${ar.id}`}>
                    File Now
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function LnComplianceAlerts() {
  return (
    <div className="px-16 lg:px-24 py-6 space-y-6">
      <h1 className="text-xl font-bold">Compliance Alerts</h1>
      <div className="space-y-3">
        {COMPLIANCE_DEADLINES.map((dl) => (
          <div
            key={dl.id}
            className={`flex items-center gap-4 p-4 rounded-xl border ${dl.priority === "high" ? "border-red-200 bg-red-50/50" : dl.priority === "medium" ? "border-amber-200 bg-amber-50/50" : "bg-white"}`}
            data-testid={`alert-${dl.id}`}
          >
            <div className={`w-9 h-9 rounded-full flex items-center justify-center ${dl.priority === "high" ? "bg-red-100" : dl.priority === "medium" ? "bg-amber-100" : "bg-gray-100"}`}>
              <AlertTriangle className={`w-4 h-4 ${dl.priority === "high" ? "text-red-600" : dl.priority === "medium" ? "text-amber-600" : "text-gray-400"}`} />
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm">{dl.title}</p>
              <p className="text-xs text-muted-foreground">{dl.company} · Due {dl.dueDate}</p>
            </div>
            <Badge
              variant="outline"
              className={`text-xs ${dl.priority === "high" ? "border-red-300 text-red-700" : dl.priority === "medium" ? "border-amber-300 text-amber-700" : "border-gray-200 text-gray-500"}`}
            >
              {dl.priority}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
}

export function LnComplianceDetail() {
  return (
    <div className="px-16 lg:px-24 py-6 space-y-6">
      <h1 className="text-xl font-bold">Client Compliance Detail</h1>
      <div className="space-y-4">
        {COMPLIANCE_CLIENTS.map((cc) => (
          <Card key={cc.id} className="border-0 shadow-sm" data-testid={`compliance-client-${cc.id}`}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center font-bold text-emerald-600">
                    {cc.company[0]}
                  </div>
                  <div>
                    <p className="font-semibold">{cc.company}</p>
                    <p className="text-sm text-muted-foreground">{cc.client} · {cc.state}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Progress value={cc.overallHealth} className="w-20 h-2" />
                  <span className="text-xs font-bold">{cc.overallHealth}%</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-muted/40 rounded-lg p-3 text-center">
                  <Shield className="w-4 h-4 mx-auto mb-1 text-emerald-500" />
                  <p className="text-[10px] text-muted-foreground">BOI</p>
                  <Badge variant="outline" className={`text-[9px] mt-1 ${BOI_STATUS_COLORS[cc.boiStatus]}`}>
                    {BOI_STATUS_LABELS[cc.boiStatus]}
                  </Badge>
                </div>
                <div className="bg-muted/40 rounded-lg p-3 text-center">
                  <Calendar className="w-4 h-4 mx-auto mb-1 text-emerald-500" />
                  <p className="text-[10px] text-muted-foreground">Annual Report</p>
                  <p className="text-[10px] font-medium mt-1">{cc.annualReportDue}</p>
                </div>
                <div className="bg-muted/40 rounded-lg p-3 text-center">
                  <Building2 className="w-4 h-4 mx-auto mb-1 text-emerald-500" />
                  <p className="text-[10px] text-muted-foreground">RA Expiry</p>
                  <p className="text-[10px] font-medium mt-1">{cc.raExpiry}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
