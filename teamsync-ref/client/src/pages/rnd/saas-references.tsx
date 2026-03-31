import { useState } from "react";
import { ExternalLink, Star, StarHalf } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PageShell, PageHeader } from "@/components/layout";
import { DataTable, type Column } from "@/components/ds/data-table";

const RND_COLOR = "#6366F1";

interface SaasReference {
  id: string;
  name: string;
  category: string;
  pricingModel: string;
  monthlyCost: string;
  relevance: string[];
  rating: number;
  notes: string;
  url: string;
}

const saasTools: SaasReference[] = [
  {
    id: "1",
    name: "Stripe",
    category: "Payments",
    pricingModel: "Usage-based",
    monthlyCost: "$0 + 2.9% per txn",
    relevance: ["EazySell", "Faire", "ETS", "OMS"],
    rating: 4.5,
    notes: "Industry-standard payment processing. Supports 135+ currencies. Strong API documentation and developer tools.",
    url: "https://stripe.com",
  },
  {
    id: "2",
    name: "HubSpot CRM",
    category: "CRM",
    pricingModel: "Freemium",
    monthlyCost: "$0 - $1,200",
    relevance: ["CRM", "Sales", "ETS"],
    rating: 4.0,
    notes: "Free tier sufficient for small teams. Marketing Hub integration is powerful. Consider for lead nurturing flows.",
    url: "https://hubspot.com",
  },
  {
    id: "3",
    name: "Mixpanel",
    category: "Analytics",
    pricingModel: "Freemium",
    monthlyCost: "$0 - $833",
    relevance: ["EazySell", "Admin", "Social"],
    rating: 4.0,
    notes: "Event-based analytics with strong funnel and retention analysis. Free tier up to 20M events/month.",
    url: "https://mixpanel.com",
  },
  {
    id: "4",
    name: "Clerk",
    category: "Auth",
    pricingModel: "Freemium",
    monthlyCost: "$0 - $99",
    relevance: ["All Verticals"],
    rating: 4.5,
    notes: "Drop-in auth with SSO, MFA, user management UI. Great DX. React/Next.js first-class support.",
    url: "https://clerk.com",
  },
  {
    id: "5",
    name: "Resend",
    category: "Email",
    pricingModel: "Freemium",
    monthlyCost: "$0 - $79",
    relevance: ["CRM", "HRMS", "ATS", "ETS"],
    rating: 4.0,
    notes: "Modern transactional email API. React Email integration. 3,000 emails/month free tier.",
    url: "https://resend.com",
  },
  {
    id: "6",
    name: "Supabase",
    category: "Database",
    pricingModel: "Freemium",
    monthlyCost: "$0 - $25",
    relevance: ["All Verticals"],
    rating: 4.5,
    notes: "Postgres with realtime subscriptions, auth, storage. Self-hostable. Currently used across TeamSync.",
    url: "https://supabase.com",
  },
  {
    id: "7",
    name: "Vercel",
    category: "Hosting",
    pricingModel: "Freemium",
    monthlyCost: "$0 - $20/seat",
    relevance: ["Dev", "All Verticals"],
    rating: 4.5,
    notes: "Zero-config deployments for Next.js/React. Edge functions, analytics, and preview deployments built in.",
    url: "https://vercel.com",
  },
  {
    id: "8",
    name: "PostHog",
    category: "Analytics",
    pricingModel: "Usage-based",
    monthlyCost: "$0 - $450",
    relevance: ["EazySell", "Admin", "Dev"],
    rating: 4.0,
    notes: "Open-source product analytics with session replay, feature flags, and A/B testing. Self-hostable.",
    url: "https://posthog.com",
  },
  {
    id: "9",
    name: "Wise Business",
    category: "Payments",
    pricingModel: "Per-transaction",
    monthlyCost: "Variable",
    relevance: ["Finance", "Faire", "ETS"],
    rating: 4.0,
    notes: "Multi-currency accounts with low FX fees. API for automated payouts. Currently integrated with Finance vertical.",
    url: "https://wise.com/business",
  },
  {
    id: "10",
    name: "Notion",
    category: "Productivity",
    pricingModel: "Freemium",
    monthlyCost: "$0 - $10/seat",
    relevance: ["Dev", "R&D", "Admin"],
    rating: 4.0,
    notes: "Docs, wikis, and project management. API available for integrations. Good for internal knowledge bases.",
    url: "https://notion.so",
  },
  {
    id: "11",
    name: "Twilio",
    category: "Communications",
    pricingModel: "Usage-based",
    monthlyCost: "Variable",
    relevance: ["CRM", "ETS", "EventHub"],
    rating: 3.5,
    notes: "SMS, voice, WhatsApp API. Programmable messaging for notifications and reminders. Segment integration.",
    url: "https://twilio.com",
  },
  {
    id: "12",
    name: "Cloudinary",
    category: "Media",
    pricingModel: "Freemium",
    monthlyCost: "$0 - $89",
    relevance: ["EazySell", "Faire", "Social"],
    rating: 4.0,
    notes: "Image/video optimization, transformation, and CDN delivery. 25GB storage on free plan.",
    url: "https://cloudinary.com",
  },
  {
    id: "13",
    name: "Linear",
    category: "Project Management",
    pricingModel: "Freemium",
    monthlyCost: "$0 - $8/seat",
    relevance: ["Dev", "R&D"],
    rating: 4.5,
    notes: "Fast issue tracking with cycles, roadmaps, and Git integrations. Superior UX to Jira for small teams.",
    url: "https://linear.app",
  },
  {
    id: "14",
    name: "Algolia",
    category: "Search",
    pricingModel: "Freemium",
    monthlyCost: "$0 - $110",
    relevance: ["EazySell", "OMS", "Faire"],
    rating: 4.0,
    notes: "Instant search-as-you-type with typo tolerance. 10K searches/month free. AI recommendations add-on.",
    url: "https://algolia.com",
  },
  {
    id: "15",
    name: "Sentry",
    category: "Monitoring",
    pricingModel: "Freemium",
    monthlyCost: "$0 - $26",
    relevance: ["Dev", "All Verticals"],
    rating: 4.5,
    notes: "Error tracking and performance monitoring. Source maps, breadcrumbs, and release tracking.",
    url: "https://sentry.io",
  },
  {
    id: "16",
    name: "Lemon Squeezy",
    category: "Payments",
    pricingModel: "Usage-based",
    monthlyCost: "$0 + 5% per txn",
    relevance: ["EazySell", "Sales"],
    rating: 3.5,
    notes: "Merchant of record for digital products. Handles sales tax globally. Good for SaaS subscription billing.",
    url: "https://lemonsqueezy.com",
  },
  {
    id: "17",
    name: "OpenAI API",
    category: "AI/ML",
    pricingModel: "Usage-based",
    monthlyCost: "Variable",
    relevance: ["All Verticals", "R&D"],
    rating: 4.5,
    notes: "GPT-4o, embeddings, image generation. Currently powering AI chat across TeamSync. Fine-tuning available.",
    url: "https://platform.openai.com",
  },
  {
    id: "18",
    name: "Shippo",
    category: "Logistics",
    pricingModel: "Freemium",
    monthlyCost: "$0 - $10",
    relevance: ["OMS", "Faire", "EazySell"],
    rating: 3.5,
    notes: "Multi-carrier shipping API. Label generation, tracking, and rate comparison. 30+ carrier integrations.",
    url: "https://goshippo.com",
  },
];

const categories = [
  "Payments",
  "CRM",
  "Analytics",
  "Auth",
  "Email",
  "Database",
  "Hosting",
  "Productivity",
  "Communications",
  "Media",
  "Project Management",
  "Search",
  "Monitoring",
  "AI/ML",
  "Logistics",
];

function RatingStars({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: full }).map((_, i) => (
        <Star key={`f-${i}`} className="size-3.5 fill-amber-400 text-amber-400" />
      ))}
      {half && <StarHalf className="size-3.5 fill-amber-400 text-amber-400" />}
      <span className="ml-1 text-xs text-muted-foreground">{rating.toFixed(1)}</span>
    </div>
  );
}

const columns: Column<SaasReference>[] = [
  {
    key: "name",
    header: "Tool Name",
    sortable: true,
    render: (item) => (
      <div className="flex items-center gap-2">
        <span className="font-medium text-foreground" data-testid={`text-tool-name-${item.id}`}>{item.name}</span>
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="text-muted-foreground hover:text-foreground transition-colors"
          data-testid={`link-tool-url-${item.id}`}
        >
          <ExternalLink className="size-3.5" />
        </a>
      </div>
    ),
  },
  {
    key: "category",
    header: "Category",
    sortable: true,
    render: (item) => (
      <Badge variant="secondary" data-testid={`badge-category-${item.id}`}>
        {item.category}
      </Badge>
    ),
  },
  {
    key: "pricingModel",
    header: "Pricing Model",
    sortable: true,
    render: (item) => (
      <span className="text-sm" data-testid={`text-pricing-model-${item.id}`}>{item.pricingModel}</span>
    ),
  },
  {
    key: "monthlyCost",
    header: "Monthly Cost",
    render: (item) => (
      <span className="text-sm font-medium" data-testid={`text-monthly-cost-${item.id}`}>{item.monthlyCost}</span>
    ),
  },
  {
    key: "relevance",
    header: "Relevant Verticals",
    render: (item) => (
      <div className="flex flex-wrap gap-1" data-testid={`tags-relevance-${item.id}`}>
        {item.relevance.slice(0, 3).map((v) => (
          <Badge key={v} variant="outline" className="text-[10px]">{v}</Badge>
        ))}
        {item.relevance.length > 3 && (
          <Badge variant="outline" className="text-[10px]">+{item.relevance.length - 3}</Badge>
        )}
      </div>
    ),
  },
  {
    key: "rating",
    header: "Rating",
    sortable: true,
    render: (item) => <RatingStars rating={item.rating} />,
  },
  {
    key: "notes",
    header: "Notes",
    width: "max-w-[280px]",
    render: (item) => (
      <span className="text-sm text-muted-foreground line-clamp-2" data-testid={`text-notes-${item.id}`}>
        {item.notes}
      </span>
    ),
  },
];

export default function SaasReferences() {
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const filtered = categoryFilter === "all"
    ? saasTools
    : saasTools.filter((t) => t.category === categoryFilter);

  return (
    <PageShell>
      <PageHeader
        title="SaaS References"
        subtitle="Curated library of SaaS tools evaluated for TeamSync verticals"
      />
      <DataTable
        data={filtered}
        columns={columns}
        searchPlaceholder="Search tools..."
        searchKey="name"
        filters={[
          {
            label: "Category",
            key: "category",
            options: categories,
          },
        ]}
        pageSize={10}
        emptyTitle="No SaaS tools found"
        emptyDescription="Try adjusting your search or filter criteria."
      />
    </PageShell>
  );
}