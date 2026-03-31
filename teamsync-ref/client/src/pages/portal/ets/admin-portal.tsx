import { Link } from "wouter";
import {
  LayoutDashboard, Users, TrendingUp, Store, ChevronRight,
  ArrowUpRight, Kanban, ShoppingCart, Package, DollarSign,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const STORES = [
  { name: "Rajesh Kumar — Jaipur", stage: "Live", revenue: 184200, health: 92 },
  { name: "Meena Singh — Lucknow", stage: "In Transit", revenue: 0, health: 68 },
  { name: "Prashant Yadav — Kanpur", stage: "Token Paid", revenue: 0, health: 41 },
  { name: "Anita Sharma — Agra", stage: "Store Design", revenue: 0, health: 57 },
  { name: "Vikram Patel — Surat", stage: "Live", revenue: 209400, health: 88 },
  { name: "Sonal Gupta — Ahmedabad", stage: "Qualified", revenue: 0, health: 22 },
];

const PIPELINE_COUNTS: Record<string, number> = {
  "New Lead": 14, "Qualified": 8, "Token Paid": 6,
  "Store Design": 4, "In Transit": 3, "Live": 11, "Reordering": 5,
};

const TEAM = [
  { name: "Harsh", role: "Sales", status: "Active", leads: 22 },
  { name: "Aditya", role: "Ops", status: "Active", leads: 18 },
  { name: "Khushal", role: "Fulfillment", status: "Active", leads: 31 },
  { name: "Suprans", role: "Sales", status: "Active", leads: 17 },
];

function formatINR(n: number) {
  return "₹" + n.toLocaleString("en-IN");
}

export default function EtsAdminPortal() {
  const totalRevenue = STORES.filter(s => s.stage === "Live").reduce((sum, s) => sum + s.revenue, 0);
  const liveStores = STORES.filter(s => s.stage === "Live").length;

  return (
    <div className="px-16 lg:px-24 py-6 space-y-6" data-testid="admin-portal-dashboard">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 p-6 text-white shadow-lg">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/3 translate-x-1/3" />
        <div className="relative z-10">
          <p className="text-sm text-violet-200 mb-1">Admin Command Center</p>
          <h1 className="text-2xl font-bold font-heading" data-testid="text-admin-title">EazyToSell — All Stores</h1>
          <div className="flex items-center gap-6 mt-3 text-sm text-violet-200">
            <span><strong className="text-white">{STORES.length}</strong> Total Partners</span>
            <span><strong className="text-white">{liveStores}</strong> Live Stores</span>
            <span><strong className="text-white">{formatINR(totalRevenue)}</strong> Total Revenue</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Partners", value: STORES.length, icon: Users, color: "text-violet-600", bg: "bg-violet-50" },
          { label: "Live Stores", value: liveStores, icon: Store, color: "text-green-600", bg: "bg-green-50" },
          { label: "In Pipeline", value: STORES.length - liveStores, icon: Kanban, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Total Revenue", value: formatINR(totalRevenue), icon: DollarSign, color: "text-blue-600", bg: "bg-blue-50" },
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
              <CardTitle className="text-sm font-semibold">Partner Stores</CardTitle>
              <Badge variant="outline" className="text-xs">{STORES.length} stores</Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0 space-y-2">
            {STORES.map((store, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 hover:bg-muted/60 transition-colors"
                data-testid={`store-row-${idx}`}
              >
                <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-xs font-bold text-violet-600 shrink-0">
                  {store.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{store.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Progress value={store.health} className="h-1 w-20" />
                    <span className="text-xs text-muted-foreground">{store.health}%</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <Badge
                    variant="outline"
                    className={`text-[10px] ${store.stage === "Live" ? "border-green-300 text-green-700 bg-green-50" : "border-gray-200 text-gray-500"}`}
                  >
                    {store.stage}
                  </Badge>
                  {store.revenue > 0 && (
                    <p className="text-xs font-bold mt-0.5">{formatINR(store.revenue)}</p>
                  )}
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
              {Object.entries(PIPELINE_COUNTS).map(([stage, count]) => (
                <div key={stage} className="flex items-center justify-between" data-testid={`pipeline-${stage.toLowerCase().replace(/\s+/g, "-")}`}>
                  <span className="text-xs text-muted-foreground">{stage}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-violet-500 rounded-full" style={{ width: `${(count / 20) * 100}%` }} />
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
              {TEAM.map((member, idx) => (
                <div key={idx} className="flex items-center gap-2.5" data-testid={`team-${member.name.toLowerCase()}`}>
                  <div className="w-7 h-7 rounded-full bg-violet-100 flex items-center justify-center text-[10px] font-bold text-violet-600 shrink-0">
                    {member.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold">{member.name}</p>
                    <p className="text-[10px] text-muted-foreground">{member.role}</p>
                  </div>
                  <Badge variant="outline" className="text-[10px]">{member.leads} active</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export function EtsAdminPipeline() {
  const stages = Object.entries(PIPELINE_COUNTS);
  return (
    <div className="px-6 lg:px-10 py-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold">Pipeline Overview</h1>
        <p className="text-sm text-muted-foreground">All partner stages across the franchise network</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stages.map(([stage, count]) => (
          <Card key={stage} className="border-0 shadow-sm">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-violet-600" data-testid={`pipeline-count-${stage}`}>{count}</p>
              <p className="text-xs text-muted-foreground mt-1">{stage}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="border-0 shadow-sm">
        <CardHeader><CardTitle className="text-sm">All Partners</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {STORES.map((store, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-muted/40" data-testid={`pipeline-store-${idx}`}>
                <div>
                  <p className="text-sm font-medium">{store.name}</p>
                  <Progress value={store.health} className="h-1 w-32 mt-1" />
                </div>
                <Badge variant="outline">{store.stage}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function EtsAdminTeam() {
  return (
    <div className="px-6 lg:px-10 py-6 space-y-6">
      <h1 className="text-xl font-bold">Team Management</h1>
      <div className="grid md:grid-cols-2 gap-4">
        {TEAM.map((member, idx) => (
          <Card key={idx} className="border-0 shadow-sm">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-violet-100 flex items-center justify-center text-lg font-bold text-violet-600">
                {member.name[0]}
              </div>
              <div>
                <p className="font-semibold">{member.name}</p>
                <p className="text-sm text-muted-foreground">{member.role}</p>
                <Badge className="mt-1 text-[10px]" variant="outline">{member.leads} active assignments</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function EtsAdminRevenue() {
  return (
    <div className="px-6 lg:px-10 py-6 space-y-6">
      <h1 className="text-xl font-bold">Revenue Analytics</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {STORES.filter(s => s.revenue > 0).map((store, idx) => (
          <Card key={idx} className="border-0 shadow-sm">
            <CardContent className="p-4">
              <p className="text-sm font-medium text-muted-foreground">{store.name.split(" — ")[0]}</p>
              <p className="text-xl font-bold mt-1" data-testid={`revenue-${idx}`}>{formatINR(store.revenue)}</p>
              <p className="text-xs text-muted-foreground">{store.name.split(" — ")[1]}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function EtsAdminSettings() {
  return (
    <div className="px-6 lg:px-10 py-6 space-y-6">
      <h1 className="text-xl font-bold">System Settings</h1>
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6 space-y-4">
          {["Franchise Fee Structure", "Commission Rules", "Product Catalog Visibility", "Notification Settings", "Integration Configs"].map((setting) => (
            <div key={setting} className="flex items-center justify-between py-3 border-b last:border-0">
              <p className="text-sm font-medium">{setting}</p>
              <Button size="sm" variant="outline">Configure</Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
