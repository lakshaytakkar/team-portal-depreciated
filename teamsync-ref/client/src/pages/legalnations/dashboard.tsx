import {
  Briefcase,
  Users,
  CheckCircle2,
  IndianRupee,
  ArrowRight,
  UserPlus,
  GitBranch,
  FileText,
  AlertTriangle,
} from "lucide-react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { StatusBadge } from "@/components/ds/status-badge";
import { Button } from "@/components/ui/button";
import {
  PageShell,
  HeroBanner,
  StatGrid,
  StatCard,
  SectionGrid,
  SectionCard,
} from "@/components/layout";
import { ButtonGrid } from "@/components/blocks";

const LLC_STAGES = [
  "LLC Booked", "Onboarded", "LLC Under Formation", "Under EIN",
  "Under Website Formation", "EIN received", "Received EIN Letter",
  "Under BOI", "Under Banking", "Under Payment Gateway",
  "Ready to Deliver", "Delivered",
];

const statusVariantMap: Record<string, "success" | "error" | "warning" | "neutral" | "info"> = {
  "LLC Booked": "neutral", "Onboarded": "info", "LLC Under Formation": "info",
  "Under EIN": "warning", "Under Website Formation": "warning", "EIN received": "info",
  "Received EIN Letter": "info", "Under BOI": "warning", "Under Banking": "warning",
  "Under Payment Gateway": "warning", "Ready to Deliver": "info",
  "Delivered": "success", "Refunded": "error",
};

const healthColor: Record<string, string> = {
  Healthy: "border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/50",
  Neutral: "border-sky-200 bg-sky-50 dark:border-sky-900 dark:bg-sky-950/50",
  "At Risk": "border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/50",
  Critical: "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/50",
  Unknown: "border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950/50",
};

const healthTextColor: Record<string, string> = {
  Healthy: "text-emerald-700 dark:text-emerald-300",
  Neutral: "text-sky-700 dark:text-sky-300",
  "At Risk": "text-amber-700 dark:text-amber-300",
  Critical: "text-red-700 dark:text-red-300",
  Unknown: "text-zinc-700 dark:text-zinc-300",
};

interface DashboardStats {
  totalClients: number;
  delivered: number;
  active: number;
  refunded: number;
  totalRevenue: number;
  statusDistribution: Record<string, number>;
  healthDistribution: Record<string, number>;
  countryDistribution: Record<string, number>;
  taxFilings: { total: number; inProgress: number; completed: number };
}

export default function Dashboard() {
  const [, navigate] = useLocation();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/legalnations/stats"],
  });

  const formatCurrency = (val: number) => val ? `₹${val.toLocaleString("en-IN")}` : "₹0";

  if (isLoading || !stats) {
    return (
      <PageShell className="animate-pulse">
        <div className="h-48 bg-muted rounded-2xl" />
        <StatGrid cols={4}>
          {[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-muted rounded-xl" />)}
        </StatGrid>
        <SectionGrid>
          <div className="h-64 bg-muted rounded-xl" />
          <div className="h-64 bg-muted rounded-xl" />
        </SectionGrid>
      </PageShell>
    );
  }

  const stageDistribution = LLC_STAGES.map((stage) => ({
    name: stage,
    count: stats.statusDistribution[stage] || 0,
  }));
  if (stats.statusDistribution["Refunded"]) {
    stageDistribution.push({ name: "Refunded", count: stats.statusDistribution["Refunded"] });
  }
  const maxStageCount = Math.max(...stageDistribution.map((s) => s.count), 1);

  return (
    <PageShell>
      <HeroBanner
        eyebrow={`${greeting}`}
        headline="LegalNations"
        tagline="US company formation, compliance & team operations portal"
        color="#225AEA"
        colorDark="#1a48c4"
        metrics={[
          { label: "Total Clients", value: stats.totalClients },
          { label: "Active Formations", value: stats.active },
          { label: "Delivered", value: stats.delivered },
        ]}
      />

      <StatGrid cols={4}>
        <StatCard
          label="Total Clients"
          value={stats.totalClients}
          trend={`${stats.active} active, ${stats.delivered} delivered`}
          icon={Users}
          iconBg="#EFF6FF"
          iconColor="#2563EB"
        />
        <StatCard
          label="Active Formations"
          value={stats.active}
          trend="Currently in progress"
          icon={Briefcase}
          iconBg="#F0FDF4"
          iconColor="#16A34A"
        />
        <StatCard
          label="Delivered"
          value={stats.delivered}
          trend={`${stats.refunded} refunded`}
          icon={CheckCircle2}
          iconBg="#FAF5FF"
          iconColor="#9333EA"
        />
        <StatCard
          label="Total Revenue"
          value={formatCurrency(stats.totalRevenue)}
          trend={`From ${stats.totalClients - stats.refunded} active clients`}
          icon={IndianRupee}
          iconBg="#FFF7ED"
          iconColor="#EA580C"
        />
      </StatGrid>

      <SectionGrid>
        <SectionCard title="Status Distribution">
          <div className="flex flex-col gap-2.5">
            {stageDistribution.filter(s => s.count > 0).map((stage) => (
              <div key={stage.name} className="flex items-center gap-3" data-testid={`stage-bar-${stage.name}`}>
                <span className="text-xs font-medium text-muted-foreground w-36 shrink-0 truncate">
                  {stage.name}
                </span>
                <div className="flex-1 h-6 bg-muted rounded-md overflow-hidden relative">
                  <div
                    className={`h-full rounded-md transition-all duration-500 ${stage.name === "Refunded" ? "bg-red-400" : stage.name === "Delivered" ? "bg-green-500" : "bg-primary/80"}`}
                    style={{ width: `${(stage.count / maxStageCount) * 100}%` }}
                  />
                  <span className="absolute inset-y-0 right-2 flex items-center text-xs font-medium text-foreground">
                    {stage.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Client Health Overview">
          <div className="grid grid-cols-2 gap-3 mb-4">
            {Object.entries(stats.healthDistribution).map(([health, count]) => (
              <div
                key={health}
                className={`flex flex-col items-center gap-1.5 rounded-lg border p-4 ${healthColor[health] || healthColor.Unknown}`}
                data-testid={`health-${health}`}
              >
                <span className={`text-2xl font-semibold font-heading ${healthTextColor[health] || healthTextColor.Unknown}`}>
                  {count}
                </span>
                <span className={`text-xs font-medium ${healthTextColor[health] || healthTextColor.Unknown}`}>
                  {health}
                </span>
              </div>
            ))}
          </div>
        </SectionCard>
      </SectionGrid>

      <SectionGrid>
        <SectionCard title="Tax Filing Service">
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <p className="text-2xl font-semibold font-heading">{stats.taxFilings.total}</p>
                <p className="text-xs text-muted-foreground mt-1">Total Filings</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <p className="text-2xl font-semibold font-heading text-amber-600">{stats.taxFilings.inProgress}</p>
                <p className="text-xs text-muted-foreground mt-1">In Progress</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <p className="text-2xl font-semibold font-heading text-green-600">{stats.taxFilings.completed}</p>
                <p className="text-xs text-muted-foreground mt-1">Completed</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => navigate("/legalnations/tax-filing")}
              data-testid="btn-view-tax-filings"
            >
              <FileText className="size-3.5 mr-1.5" />
              View Tax Filings
              <ArrowRight className="size-3.5 ml-auto" />
            </Button>
          </div>
        </SectionCard>

        <SectionCard title="Quick Actions">
          <ButtonGrid
            items={[
              { id: "new-client", icon: UserPlus, label: "New Client", description: "Add a new client", onClick: () => navigate("/legalnations/clients") },
              { id: "view-pipeline", icon: GitBranch, label: "Pipeline", description: "Formation pipeline", onClick: () => navigate("/legalnations/pipeline") },
              { id: "tax-filing", icon: FileText, label: "Tax Filing", description: "Manage tax filings", onClick: () => navigate("/legalnations/tax-filing") },
              { id: "clients", icon: Users, label: "All Clients", description: "View all 249 clients", onClick: () => navigate("/legalnations/clients") },
            ]}
            cols={2}
          />
        </SectionCard>
      </SectionGrid>

      <SectionCard title="Country Distribution">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {Object.entries(stats.countryDistribution)
            .sort(([, a], [, b]) => b - a)
            .map(([country, count]) => (
              <div key={country} className="text-center p-3 rounded-lg border hover:bg-muted/30 transition-colors" data-testid={`country-${country}`}>
                <p className="text-lg font-semibold font-heading">{count}</p>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">{country}</p>
              </div>
            ))}
        </div>
      </SectionCard>
    </PageShell>
  );
}
