import { useState } from "react";
import {
  FlaskConical,
  Lightbulb,
  Search,
  FileText,
  Globe,
  TrendingUp,
  BarChart3,
  Library,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Target,
  Rocket,
  Eye,
} from "lucide-react";
import { useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  PageShell,
  HeroBanner,
  StatCard,
  StatGrid,
  SectionCard,
  SectionGrid,
} from "@/components/layout";
import { ShortcutGrid } from "@/components/blocks";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { StatsCardSkeleton } from "@/components/ui/card-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

const BRAND = "#6366F1";
const BRAND_DARK = "#4338CA";

const recentActivity = [
  {
    id: "ra-1",
    title: "Completed competitor analysis for Shopify Markets Pro",
    category: "Market Intelligence",
    user: "Sneha Patel",
    time: "2h ago",
    icon: Globe,
    color: "#6366f1",
  },
  {
    id: "ra-2",
    title: "New pitch idea submitted: AI-Powered Inventory Forecasting",
    category: "Pitch Ideas",
    user: "Lakshay Takkar",
    time: "4h ago",
    icon: Lightbulb,
    color: "#f59e0b",
  },
  {
    id: "ra-3",
    title: "Product research validated: Bamboo Yoga Accessories",
    category: "Product Research",
    user: "Arjun Mehta",
    time: "6h ago",
    icon: CheckCircle2,
    color: "#10b981",
  },
  {
    id: "ra-4",
    title: "Key finding: MENA dropshipping market growing 34% YoY",
    category: "Key Findings",
    user: "Priya Sharma",
    time: "8h ago",
    icon: TrendingUp,
    color: "#0ea5e9",
  },
  {
    id: "ra-5",
    title: "SaaS evaluation completed: Metabase vs Looker Studio",
    category: "SaaS References",
    user: "Sneha Patel",
    time: "1d ago",
    icon: Library,
    color: "#8b5cf6",
  },
  {
    id: "ra-6",
    title: "Sprint review: EventHub vertical at 78% completion",
    category: "Project Reports",
    user: "Dev Team",
    time: "1d ago",
    icon: BarChart3,
    color: "#ec4899",
  },
];

const activeProjects = [
  {
    id: "ap-1",
    name: "CRM Vertical",
    sprint: "Pipeline automation",
    completion: 85,
    status: "On Track" as const,
  },
  {
    id: "ap-2",
    name: "EventHub Vertical",
    sprint: "Check-in & analytics",
    completion: 78,
    status: "On Track" as const,
  },
  {
    id: "ap-3",
    name: "Finance Module",
    sprint: "Multi-currency support",
    completion: 62,
    status: "At Risk" as const,
  },
  {
    id: "ap-4",
    name: "Faire Operations",
    sprint: "Vendor portal integration",
    completion: 91,
    status: "On Track" as const,
  },
  {
    id: "ap-5",
    name: "R&D Portal",
    sprint: "Dashboard & pages setup",
    completion: 45,
    status: "On Track" as const,
  },
];

const latestFindings = [
  {
    id: "lf-1",
    title: "India D2C market to reach $100B by 2025",
    impact: "High",
    category: "Market",
    date: "Jan 15",
  },
  {
    id: "lf-2",
    title: "Shopify POS adoption up 40% in tier-2 cities",
    impact: "Medium",
    category: "Competitive",
    date: "Jan 14",
  },
  {
    id: "lf-3",
    title: "AI chatbot retention improves NPS by 22 points",
    impact: "High",
    category: "Product",
    date: "Jan 13",
  },
  {
    id: "lf-4",
    title: "Cross-border payments: Wise vs PayPal cost analysis",
    impact: "Medium",
    category: "Tech",
    date: "Jan 12",
  },
  {
    id: "lf-5",
    title: "Subscription fatigue: churn patterns in SaaS tools",
    impact: "High",
    category: "Strategy",
    date: "Jan 11",
  },
];

const statusColor: Record<string, string> = {
  "On Track": "#10b981",
  "At Risk": "#f59e0b",
  "Blocked": "#ef4444",
};

const impactVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  High: "destructive",
  Medium: "secondary",
  Low: "outline",
};

export default function RndDashboard() {
  const loading = useSimulatedLoading();
  const [, navigate] = useLocation();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const quickLinks = [
    {
      title: "Project Reports",
      description: "Vertical dev status",
      icon: FileText,
      url: "/rnd/project-reports",
      color: "#6366f1",
    },
    {
      title: "Pitch Ideas",
      description: "5 in pipeline",
      icon: Lightbulb,
      url: "/rnd/pitch-ideas",
      color: "#f59e0b",
    },
    {
      title: "Product Research",
      description: "15 products tracked",
      icon: Search,
      url: "/rnd/product-research",
      color: "#10b981",
    },
    {
      title: "Market Intel",
      description: "12 reports",
      icon: Globe,
      url: "/rnd/market-intelligence",
      color: "#0ea5e9",
    },
    {
      title: "Key Findings",
      description: "10 discoveries",
      icon: Target,
      url: "/rnd/key-findings",
      color: "#ec4899",
    },
    {
      title: "SaaS References",
      description: "18 tools tracked",
      icon: Library,
      url: "/rnd/saas-references",
      color: "#8b5cf6",
    },
  ];

  return (
    <PageShell>
      <HeroBanner
        eyebrow={`${greeting}, Lakshay`}
        headline="Research & Development"
        tagline="Product research, market intelligence & innovation pipeline"
        color={BRAND}
        colorDark={BRAND_DARK}
        metrics={[
          { label: "Active Research Projects", value: 12 },
          { label: "Pitch Ideas", value: 8 },
          { label: "Key Findings", value: 24 },
          { label: "Market Reports", value: 16 },
        ]}
      />

      {loading ? (
        <StatGrid>
          <StatsCardSkeleton />
          <StatsCardSkeleton />
          <StatsCardSkeleton />
          <StatsCardSkeleton />
        </StatGrid>
      ) : (
        <StatGrid>
          <StatCard
            label="Active Research Projects"
            value={12}
            trend="+2 this month"
            icon={FlaskConical}
            iconBg="rgba(99, 102, 241, 0.1)"
            iconColor={BRAND}
          />
          <StatCard
            label="Pitch Ideas in Pipeline"
            value={8}
            trend="3 under review"
            icon={Lightbulb}
            iconBg="rgba(245, 158, 11, 0.1)"
            iconColor="#f59e0b"
          />
          <StatCard
            label="Key Findings This Month"
            value={7}
            trend="3 high impact"
            icon={Target}
            iconBg="rgba(236, 72, 153, 0.1)"
            iconColor="#ec4899"
          />
          <StatCard
            label="Market Reports"
            value={16}
            trend="4 new this week"
            icon={Globe}
            iconBg="rgba(14, 165, 233, 0.1)"
            iconColor="#0ea5e9"
          />
        </StatGrid>
      )}

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {[...Array(6)].map((_, i) => <StatsCardSkeleton key={i} />)}
        </div>
      ) : (
        <ShortcutGrid
          items={quickLinks.map((link) => ({
            id: link.title.toLowerCase().replace(/\s+/g, "-"),
            icon: link.icon,
            iconBg: `${link.color}15`,
            iconColor: link.color,
            label: link.title,
            onClick: () => navigate(link.url),
          }))}
          cols={6}
        />
      )}

      {loading ? (
        <SectionGrid>
          <Skeleton className="h-[400px] w-full rounded-xl" />
          <Skeleton className="h-[400px] w-full rounded-xl" />
        </SectionGrid>
      ) : (
        <SectionGrid>
          <SectionCard
            title="Recent Activity"
            noPadding
          >
            <div className="divide-y">
              {recentActivity.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.id}
                    className="flex items-start gap-3 px-5 py-3 transition-colors hover:bg-muted/20"
                    data-testid={`card-activity-${item.id}`}
                  >
                    <div
                      className="flex items-center justify-center w-8 h-8 rounded-md shrink-0 mt-0.5"
                      style={{ backgroundColor: `${item.color}15`, color: item.color }}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" data-testid={`text-activity-title-${item.id}`}>
                        {item.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {item.user} &middot; {item.time}
                      </p>
                    </div>
                    <Badge variant="secondary" className="shrink-0 mt-0.5">
                      {item.category}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </SectionCard>

          <SectionCard
            title="Active Projects"
            viewAllLabel="View All"
            onViewAll={() => navigate("/rnd/project-reports")}
          >
            <div className="space-y-3">
              {activeProjects.map((proj) => (
                <div
                  key={proj.id}
                  className="cursor-pointer rounded-lg px-3 py-2.5 transition-colors hover:bg-muted/20"
                  onClick={() => navigate("/rnd/project-reports")}
                  data-testid={`card-project-${proj.id}`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className="size-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: statusColor[proj.status] }}
                      />
                      <span className="text-sm font-medium truncate">{proj.name}</span>
                    </div>
                    <Badge
                      variant="outline"
                      className="text-[10px] shrink-0"
                      style={{
                        borderColor: statusColor[proj.status],
                        color: statusColor[proj.status],
                      }}
                    >
                      {proj.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-1.5 pl-[18px]">
                    Sprint: {proj.sprint}
                  </p>
                  <div className="flex items-center gap-2 pl-[18px]">
                    <div className="h-1.5 flex-1 rounded-full bg-muted/40 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${proj.completion}%`,
                          backgroundColor: statusColor[proj.status],
                        }}
                      />
                    </div>
                    <span className="text-xs font-medium text-muted-foreground w-8 text-right">
                      {proj.completion}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        </SectionGrid>
      )}

      {loading ? (
        <Skeleton className="h-[300px] w-full rounded-xl" />
      ) : (
        <SectionCard
          title="Latest Findings"
          viewAllLabel="View All"
          onViewAll={() => navigate("/rnd/key-findings")}
          noPadding
        >
          <div className="divide-y">
            {latestFindings.map((finding) => (
              <div
                key={finding.id}
                className="flex items-center justify-between gap-3 px-5 py-3 transition-colors hover:bg-muted/20 cursor-pointer"
                onClick={() => navigate("/rnd/key-findings")}
                data-testid={`card-finding-${finding.id}`}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div
                    className="flex items-center justify-center w-8 h-8 rounded-md shrink-0"
                    style={{ backgroundColor: "rgba(99, 102, 241, 0.1)" }}
                  >
                    <Zap className="w-4 h-4" style={{ color: BRAND }} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate" data-testid={`text-finding-title-${finding.id}`}>
                      {finding.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {finding.category} &middot; {finding.date}
                    </p>
                  </div>
                </div>
                <Badge variant={impactVariant[finding.impact]} className="shrink-0">
                  {finding.impact} Impact
                </Badge>
              </div>
            ))}
          </div>
        </SectionCard>
      )}
    </PageShell>
  );
}
