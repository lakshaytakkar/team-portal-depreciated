import { useState } from "react";
import {
  Lightbulb,
  Target,
  TrendingUp,
  Shield,
  Cpu,
  Compass,
  ArrowUpRight,
  Calendar,
  Search,
  Filter,
  BookOpen,
  Zap,
  AlertTriangle,
  BarChart3,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  PageShell,
  PageHeader,
  StatGrid,
  StatCard,
  IndexToolbar,
} from "@/components/layout/page-layout";
import { Timeline } from "@/components/blocks";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";

const BRAND = "#6366F1";
const BRAND_DARK = "#4338CA";

type FindingCategory = "Competitive" | "Market" | "Product" | "Tech" | "Strategy";
type ImpactLevel = "High" | "Medium" | "Low";

interface KeyFinding {
  id: string;
  title: string;
  category: FindingCategory;
  impact: ImpactLevel;
  source: string;
  date: string;
  notes: string;
}

const categoryIcons: Record<FindingCategory, React.ElementType> = {
  Competitive: Target,
  Market: TrendingUp,
  Product: Lightbulb,
  Tech: Cpu,
  Strategy: Compass,
};

const categoryColors: Record<FindingCategory, { bg: string; fg: string }> = {
  Competitive: { bg: "#FEE2E2", fg: "#DC2626" },
  Market: { bg: "#DBEAFE", fg: "#2563EB" },
  Product: { bg: "#FEF3C7", fg: "#D97706" },
  Tech: { bg: "#E0E7FF", fg: "#6366F1" },
  Strategy: { bg: "#D1FAE5", fg: "#059669" },
};

const impactColors: Record<ImpactLevel, string> = {
  High: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  Medium: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  Low: "bg-slate-100 text-slate-600 dark:bg-slate-800/50 dark:text-slate-400",
};

const findings: KeyFinding[] = [
  {
    id: "kf-1",
    title: "Shopify Q4 2024 earnings show 31% revenue growth in merchant solutions",
    category: "Competitive",
    impact: "High",
    source: "Shopify Investor Relations",
    date: "2025-01-15",
    notes: "Shopify's merchant solutions revenue grew 31% YoY, driven by payments penetration. Their Shop Pay GMV crossed $16B. Key takeaway: bundled payment solutions are becoming the primary revenue driver for e-commerce platforms, not SaaS subscriptions.",
  },
  {
    id: "kf-2",
    title: "India's D2C market projected to reach $100B by 2027 with 40% CAGR",
    category: "Market",
    impact: "High",
    source: "IBEF / Bain & Company Report",
    date: "2025-01-12",
    notes: "Key growth drivers include tier-2/3 city adoption, UPI-powered COD alternatives, and social commerce. Beauty & personal care, food & beverages, and fashion lead the category mix. This validates our India-first D2C enablement strategy.",
  },
  {
    id: "kf-3",
    title: "AI-powered product description generators reduce listing time by 73%",
    category: "Product",
    impact: "High",
    source: "Internal A/B Test - EazyToSell Beta",
    date: "2025-01-10",
    notes: "Our internal test across 200 product listings showed AI-generated descriptions reduced time from avg 12 min to 3.2 min per listing. Quality scores (readability + SEO) improved 18%. Recommending full rollout across all storefronts.",
  },
  {
    id: "kf-4",
    title: "Edge computing latency improvements make real-time inventory sync viable",
    category: "Tech",
    impact: "Medium",
    source: "Cloudflare Workers Benchmark",
    date: "2025-01-08",
    notes: "Cloudflare Workers D1 now supports < 50ms global reads. Combined with Durable Objects for write coordination, we can achieve real-time inventory sync across multi-store setups without a dedicated WebSocket infrastructure. Cost: ~$0.50/M requests.",
  },
  {
    id: "kf-5",
    title: "Vertical SaaS companies outperform horizontal peers by 2.3x in NRR",
    category: "Strategy",
    impact: "High",
    source: "Bessemer Cloud Index / SaaStr Analysis",
    date: "2025-01-05",
    notes: "Vertical SaaS companies show 125-140% NRR vs 105-115% for horizontal. Key drivers: deeper workflow integration, higher switching costs, and embedded fintech. Supports our strategy of building deep vertical solutions rather than generic tools.",
  },
  {
    id: "kf-6",
    title: "TikTok Shop's US GMV crossed $9B in 2024, threatening traditional marketplaces",
    category: "Competitive",
    impact: "Medium",
    source: "The Information / Bloomberg",
    date: "2025-01-03",
    notes: "TikTok Shop's rapid growth indicates social commerce is no longer experimental. Key categories: beauty, fashion, home goods. Average order value $35-45. Implication: our social media management vertical should include shoppable content workflows.",
  },
  {
    id: "kf-7",
    title: "Faire's wholesale marketplace model shows 3x better unit economics than B2C",
    category: "Market",
    impact: "Medium",
    source: "Faire Annual Report / Internal Analysis",
    date: "2024-12-28",
    notes: "B2B wholesale marketplace: avg AOV $350 vs B2C $45. Customer acquisition cost 60% lower due to higher intent. Retention 85% vs 30%. Our Faire integration vertical is well-positioned to capture this high-margin segment.",
  },
  {
    id: "kf-8",
    title: "WebAssembly adoption in SaaS reaches 23%, enabling client-side data processing",
    category: "Tech",
    impact: "Low",
    source: "State of WebAssembly 2024 Survey",
    date: "2024-12-22",
    notes: "WASM is being used for PDF generation, image processing, and spreadsheet calculations. Could reduce server costs by 40% for compute-heavy features. Worth exploring for our report generation and image studio modules.",
  },
  {
    id: "kf-9",
    title: "Cross-border e-commerce compliance costs rising 25% annually in MENA region",
    category: "Market",
    impact: "Medium",
    source: "Dubai Chamber of Commerce Report",
    date: "2024-12-18",
    notes: "VAT harmonization across GCC, new customs documentation requirements, and digital services tax implementation are increasing compliance burden. Automated compliance tools represent a significant upsell opportunity in our ETS vertical.",
  },
  {
    id: "kf-10",
    title: "Internal NPS for TeamSync dropped to 62 - onboarding flow cited as primary friction",
    category: "Product",
    impact: "High",
    source: "Internal User Survey Q4 2024",
    date: "2024-12-15",
    notes: "Survey of 150 internal users shows onboarding new team members takes avg 3.5 days. Key pain points: too many verticals to learn, no role-based default views, missing guided tours. Recommendation: implement progressive disclosure and role-based dashboards.",
  },
  {
    id: "kf-11",
    title: "Stripe's embedded finance tools generate 4x more revenue per merchant than standalone payments",
    category: "Strategy",
    impact: "Medium",
    source: "Stripe Atlas Report / a16z Fintech",
    date: "2024-12-10",
    notes: "Embedded lending, insurance, and treasury products layered on top of payment processing increase ARPU by 4x. Our finance vertical could integrate embedded lending for merchant cash advances. Estimated TAM: $500M in our target segments.",
  },
  {
    id: "kf-12",
    title: "Competitor analysis: Zoho One bundles 45+ apps at $45/user/mo - positioning threat",
    category: "Competitive",
    impact: "Medium",
    source: "Zoho Pricing Page / G2 Reviews",
    date: "2024-12-05",
    notes: "Zoho's aggressive bundling creates perception of superior value. However, G2 reviews show 3.8/5 satisfaction vs our target of 4.5+. Key complaints: complexity, poor mobile experience, generic workflows. Our vertical-specific approach provides better depth per use case.",
  },
];

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function KeyFindings() {
  const isLoading = useSimulatedLoading(500);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [impactFilter, setImpactFilter] = useState("All");

  const now = new Date();
  const thisMonth = findings.filter((f) => {
    const d = new Date(f.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const highImpact = findings.filter((f) => f.impact === "High");
  const uniqueSources = new Set(findings.map((f) => f.source)).size;

  const filtered = findings.filter((f) => {
    if (categoryFilter !== "All" && f.category !== categoryFilter) return false;
    if (impactFilter !== "All" && f.impact !== impactFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        f.title.toLowerCase().includes(q) ||
        f.notes.toLowerCase().includes(q) ||
        f.source.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const categories: FindingCategory[] = ["Competitive", "Market", "Product", "Tech", "Strategy"];
  const impacts: ImpactLevel[] = ["High", "Medium", "Low"];

  const categoryFilters = [
    { value: "All", label: "All Categories", count: findings.length },
    ...categories.map((c) => ({
      value: c,
      label: c,
      count: findings.filter((f) => f.category === c).length,
    })),
  ];

  const impactFilters = [
    { value: "All", label: "All Impact" },
    ...impacts.map((i) => ({
      value: i,
      label: `${i} Impact`,
      count: findings.filter((f) => f.impact === i).length,
    })),
  ];

  if (isLoading) {
    return (
      <PageShell>
        <div className="h-8 bg-muted rounded-lg w-48" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-muted rounded-xl" />
          ))}
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-28 bg-muted rounded-xl" />
          ))}
        </div>
      </PageShell>
    );
  }

  const timelineEvents = filtered
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .map((f) => {
      const colors = categoryColors[f.category];
      return {
        id: f.id,
        title: f.title,
        description: f.notes,
        timestamp: formatDate(f.date),
        icon: categoryIcons[f.category],
        iconBg: colors.bg,
        iconColor: colors.fg,
        meta: (
          <div className="flex items-center gap-2 flex-wrap mt-1">
            <Badge
              variant="secondary"
              className="text-xs"
              style={{ backgroundColor: colors.bg, color: colors.fg }}
              data-testid={`badge-category-${f.id}`}
            >
              {f.category}
            </Badge>
            <Badge
              variant="secondary"
              className={`text-xs ${impactColors[f.impact]}`}
              data-testid={`badge-impact-${f.id}`}
            >
              {f.impact === "High" && <Zap className="h-3 w-3 mr-1" />}
              {f.impact === "Medium" && <AlertTriangle className="h-3 w-3 mr-1" />}
              {f.impact} Impact
            </Badge>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <BookOpen className="h-3 w-3" />
              {f.source}
            </span>
          </div>
        ),
      };
    });

  return (
    <PageShell>
      <PageHeader
        title="Key Findings"
        subtitle="Important discoveries, insights, and strategic intelligence"
      />

      <StatGrid>
        <StatCard
          label="Total Findings"
          value={findings.length}
          icon={BarChart3}
          iconBg="#E0E7FF"
          iconColor="#6366F1"
          data-testid="stat-total-findings"
        />
        <StatCard
          label="High Impact"
          value={highImpact.length}
          icon={Zap}
          iconBg="#FEE2E2"
          iconColor="#DC2626"
          trend={`${Math.round((highImpact.length / findings.length) * 100)}% of total`}
          data-testid="stat-high-impact"
        />
        <StatCard
          label="This Month"
          value={thisMonth.length}
          icon={Calendar}
          iconBg="#DBEAFE"
          iconColor="#2563EB"
          data-testid="stat-this-month"
        />
        <StatCard
          label="Sources Tracked"
          value={uniqueSources}
          icon={BookOpen}
          iconBg="#D1FAE5"
          iconColor="#059669"
          data-testid="stat-sources-tracked"
        />
      </StatGrid>

      <IndexToolbar
        search={search}
        onSearch={setSearch}
        filters={categoryFilters}
        activeFilter={categoryFilter}
        onFilter={setCategoryFilter}
        color={BRAND}
        placeholder="Search findings..."
        extra={
          <div className="flex items-center gap-2 flex-wrap">
            {impactFilters.map((f) => (
              <button
                key={f.value}
                onClick={() => setImpactFilter(f.value)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  impactFilter === f.value
                    ? "bg-foreground text-background"
                    : "bg-muted text-muted-foreground"
                }`}
                data-testid={`pill-impact-${f.value.toLowerCase()}`}
              >
                {f.label}
                {"count" in f && f.count !== undefined && (
                  <span className="ml-1 opacity-70">({f.count})</span>
                )}
              </button>
            ))}
          </div>
        }
      />

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center" data-testid="empty-state">
          <Search className="h-10 w-10 text-muted-foreground mb-3 opacity-40" />
          <p className="text-sm font-medium text-foreground">No findings match your filters</p>
          <p className="text-xs text-muted-foreground mt-1 max-w-xs">
            Try adjusting your search or filter criteria
          </p>
        </div>
      ) : (
        <div className="rounded-xl border bg-card p-6" data-testid="findings-timeline">
          <Timeline events={timelineEvents} />
        </div>
      )}
    </PageShell>
  );
}
