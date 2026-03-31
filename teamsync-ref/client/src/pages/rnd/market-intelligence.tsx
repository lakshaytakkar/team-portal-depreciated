import { useState } from "react";
import { Globe, TrendingUp, MapPin, BarChart3, ExternalLink, Calendar, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import {
  PageShell,
  PageHeader,
  StatCard,
  StatGrid,
  FilterPill,
  IndexToolbar,
} from "@/components/layout/page-layout";

const BRAND = "#6366F1";
const BRAND_DARK = "#4338CA";

type MarketRegion = "All" | "India" | "USA" | "EU" | "MENA";

interface MarketIntelEntry {
  id: number;
  title: string;
  summary: string;
  market: "India" | "USA" | "EU" | "MENA";
  tags: string[];
  source: string;
  date: string;
  relevanceScore: number;
  category: string;
}

const marketIntelData: MarketIntelEntry[] = [
  {
    id: 1,
    title: "India D2C Market Projected to Hit $100B by 2025",
    summary: "Direct-to-consumer brands in India are scaling rapidly across beauty, wellness, and electronics. Key enablers include UPI adoption, vernacular content, and tier-2/3 city penetration.",
    market: "India",
    tags: ["D2C", "E-commerce", "Growth"],
    source: "RedSeer Consulting",
    date: "2025-01-15",
    relevanceScore: 95,
    category: "Market Size",
  },
  {
    id: 2,
    title: "US Dropshipping Regulation Tightening in 2025",
    summary: "FTC increasing scrutiny on dropshipping claims and delivery timelines. New guidelines expected Q2 2025 that may require sellers to disclose fulfillment methods.",
    market: "USA",
    tags: ["Regulation", "Dropshipping", "Compliance"],
    source: "FTC Reports",
    date: "2025-01-10",
    relevanceScore: 88,
    category: "Regulatory",
  },
  {
    id: 3,
    title: "Ayurveda Products Gaining Traction in EU Markets",
    summary: "European consumers increasingly adopting Ayurvedic wellness products. Germany, UK, and Netherlands showing highest demand. Certification requirements remain a barrier.",
    market: "EU",
    tags: ["Ayurveda", "Wellness", "Export"],
    source: "Euromonitor",
    date: "2025-01-08",
    relevanceScore: 82,
    category: "Opportunity",
  },
  {
    id: 4,
    title: "MENA E-commerce Growing at 25% CAGR",
    summary: "Gulf states driving e-commerce growth with high smartphone penetration and young demographics. Saudi Arabia and UAE remain top markets with increasing demand for Indian goods.",
    market: "MENA",
    tags: ["E-commerce", "Growth", "Gulf"],
    source: "Bain & Company",
    date: "2025-01-05",
    relevanceScore: 79,
    category: "Market Size",
  },
  {
    id: 5,
    title: "India Quick Commerce Disrupting Traditional Retail",
    summary: "10-minute delivery services like Blinkit, Zepto, and Swiggy Instamart are reshaping consumer expectations. Implications for inventory management and supplier relationships.",
    market: "India",
    tags: ["Quick Commerce", "Logistics", "Disruption"],
    source: "Inc42",
    date: "2024-12-28",
    relevanceScore: 91,
    category: "Trend",
  },
  {
    id: 6,
    title: "US Holiday Season 2024: Private Label Brands Outperform",
    summary: "Amazon private label and store brands saw 18% higher growth vs. national brands during Q4 2024. Consumers prioritizing value over brand loyalty in discretionary categories.",
    market: "USA",
    tags: ["Private Label", "Amazon", "Retail"],
    source: "Nielsen IQ",
    date: "2024-12-20",
    relevanceScore: 85,
    category: "Competitive",
  },
  {
    id: 7,
    title: "EU Digital Product Passport Mandate Starting 2026",
    summary: "EU requiring digital product passports for textiles, electronics, and batteries. Sellers must provide full lifecycle data including sourcing, carbon footprint, and recyclability.",
    market: "EU",
    tags: ["Sustainability", "Compliance", "DPP"],
    source: "European Commission",
    date: "2024-12-15",
    relevanceScore: 76,
    category: "Regulatory",
  },
  {
    id: 8,
    title: "India Toy Manufacturing Sees 300% FDI Increase",
    summary: "Make in India push driving massive investment in domestic toy production. Import duties on Chinese toys raised to 70%. Opportunity for Toyarina brand expansion.",
    market: "India",
    tags: ["Toys", "Manufacturing", "FDI"],
    source: "IBEF",
    date: "2024-12-10",
    relevanceScore: 93,
    category: "Opportunity",
  },
  {
    id: 9,
    title: "US TikTok Shop Generating $15B+ in GMV",
    summary: "Social commerce through TikTok Shop has accelerated. Beauty, fashion, and gadgets dominate. Live selling events driving 3x higher conversion than static listings.",
    market: "USA",
    tags: ["Social Commerce", "TikTok", "Live Selling"],
    source: "eMarketer",
    date: "2024-12-05",
    relevanceScore: 87,
    category: "Trend",
  },
  {
    id: 10,
    title: "Saudi Vision 2030 Creating New Retail Corridors",
    summary: "NEOM and other mega-projects creating demand for lifestyle, home, and wellness products. Saudi Arabia easing import regulations for select consumer goods categories.",
    market: "MENA",
    tags: ["Saudi Arabia", "Vision 2030", "Retail"],
    source: "McKinsey",
    date: "2024-11-28",
    relevanceScore: 74,
    category: "Opportunity",
  },
  {
    id: 11,
    title: "India UPI Merchant Payments Cross 10B Monthly Transactions",
    summary: "UPI infrastructure now supports massive scale commerce. Rural merchant adoption up 140% YoY. Key enabler for tier-3/4 city e-commerce expansion strategies.",
    market: "India",
    tags: ["Fintech", "UPI", "Payments"],
    source: "NPCI",
    date: "2024-11-20",
    relevanceScore: 80,
    category: "Infrastructure",
  },
  {
    id: 12,
    title: "EU Cross-Border E-commerce Tax Changes Effective July 2025",
    summary: "New VAT regulations for cross-border e-commerce sellers. Import One Stop Shop (IOSS) becoming mandatory for non-EU sellers shipping goods under EUR 150.",
    market: "EU",
    tags: ["Tax", "VAT", "Cross-Border"],
    source: "Deloitte",
    date: "2024-11-15",
    relevanceScore: 71,
    category: "Regulatory",
  },
];

const regionTabs: { value: MarketRegion; label: string }[] = [
  { value: "All", label: "All Markets" },
  { value: "India", label: "India" },
  { value: "USA", label: "USA" },
  { value: "EU", label: "EU" },
  { value: "MENA", label: "MENA" },
];

const marketColorMap: Record<string, string> = {
  India: "#F97316",
  USA: "#3B82F6",
  EU: "#8B5CF6",
  MENA: "#10B981",
};

const relevanceColor = (score: number) => {
  if (score >= 90) return "text-emerald-600 dark:text-emerald-400";
  if (score >= 75) return "text-amber-600 dark:text-amber-400";
  return "text-muted-foreground";
};

export default function MarketIntelligence() {
  const isLoading = useSimulatedLoading(600);
  const [region, setRegion] = useState<MarketRegion>("All");
  const [search, setSearch] = useState("");

  const filtered = marketIntelData.filter((item) => {
    if (region !== "All" && item.market !== region) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.summary.toLowerCase().includes(q) ||
        item.tags.some((t) => t.toLowerCase().includes(q)) ||
        item.source.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const indiaCount = marketIntelData.filter((i) => i.market === "India").length;
  const usaCount = marketIntelData.filter((i) => i.market === "USA").length;
  const otherCount = marketIntelData.filter((i) => i.market !== "India" && i.market !== "USA").length;

  if (isLoading) {
    return (
      <PageShell>
        <div className="h-8 bg-muted rounded w-64" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-muted rounded-xl" />
          ))}
        </div>
        <div className="h-10 bg-muted rounded w-96" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-48 bg-muted rounded-xl" />
          ))}
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <PageHeader
        title="Market Intelligence"
        subtitle="Research insights across global markets"
      />

      <StatGrid>
        <StatCard
          label="Total Reports"
          value={marketIntelData.length}
          icon={BarChart3}
          iconBg="rgba(99,102,241,0.12)"
          iconColor={BRAND}
        />
        <StatCard
          label="India Insights"
          value={indiaCount}
          trend={`${Math.round((indiaCount / marketIntelData.length) * 100)}% of total`}
          icon={MapPin}
          iconBg="rgba(249,115,22,0.12)"
          iconColor="#F97316"
        />
        <StatCard
          label="USA Insights"
          value={usaCount}
          trend={`${Math.round((usaCount / marketIntelData.length) * 100)}% of total`}
          icon={Globe}
          iconBg="rgba(59,130,246,0.12)"
          iconColor="#3B82F6"
        />
        <StatCard
          label="Other Markets"
          value={otherCount}
          trend="EU + MENA coverage"
          icon={TrendingUp}
          iconBg="rgba(16,185,129,0.12)"
          iconColor="#10B981"
        />
      </StatGrid>

      <IndexToolbar
        search={search}
        onSearch={setSearch}
        color={BRAND}
        placeholder="Search reports, markets, tags..."
        filters={regionTabs.map((r) => ({
          value: r.value,
          label: r.label,
          count: r.value === "All" ? marketIntelData.length : marketIntelData.filter((i) => i.market === r.value).length,
        }))}
        activeFilter={region}
        onFilter={(v) => setRegion(v as MarketRegion)}
      />

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center" data-testid="empty-state">
          <Globe className="h-12 w-12 text-muted-foreground/40 mb-3" />
          <p className="text-sm font-medium text-foreground">No reports found</p>
          <p className="text-xs text-muted-foreground mt-1">Try adjusting your filters or search terms</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4" data-testid="intel-grid">
          {filtered.map((item) => (
            <Card
              key={item.id}
              className="hover-elevate"
              data-testid={`card-intel-${item.id}`}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge
                      variant="outline"
                      style={{ borderColor: marketColorMap[item.market], color: marketColorMap[item.market] }}
                      data-testid={`badge-market-${item.id}`}
                    >
                      {item.market}
                    </Badge>
                    <Badge variant="secondary" data-testid={`badge-category-${item.id}`}>
                      {item.category}
                    </Badge>
                  </div>
                  <div className={`flex items-center gap-1 text-xs font-semibold ${relevanceColor(item.relevanceScore)}`} data-testid={`score-${item.id}`}>
                    <Star className="h-3 w-3" />
                    {item.relevanceScore}
                  </div>
                </div>

                <h3 className="mt-3 text-sm font-semibold text-foreground leading-snug" data-testid={`title-intel-${item.id}`}>
                  {item.title}
                </h3>

                <p className="mt-2 text-xs text-muted-foreground leading-relaxed line-clamp-3" data-testid={`summary-intel-${item.id}`}>
                  {item.summary}
                </p>

                <div className="mt-3 flex items-center gap-1.5 flex-wrap">
                  {item.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-[10px]" data-testid={`tag-${item.id}-${tag}`}>
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div className="mt-3 flex items-center justify-between gap-2 flex-wrap text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <ExternalLink className="h-3 w-3" />
                    <span data-testid={`source-${item.id}`}>{item.source}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3 w-3" />
                    <span data-testid={`date-${item.id}`}>{new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </PageShell>
  );
}
