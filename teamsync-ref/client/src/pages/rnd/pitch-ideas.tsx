import { useState, useMemo } from "react";
import {
  Lightbulb,
  Plus,
  Target,
  Clock,
  Rocket,
  Zap,
  Users,
  TrendingUp,
  Globe,
  ShoppingCart,
  Search,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PageShell,
  PageHeader,
  StatCard,
  StatGrid,
} from "@/components/layout";
import { KanbanBoard, type KanbanColumnData, type KanbanCardItem } from "@/components/blocks";
import { verticals } from "@/lib/verticals-config";
import { cn } from "@/lib/utils";

type PitchStage = "draft" | "under-review" | "approved" | "in-development" | "launched";
type Priority = "low" | "medium" | "high";
type Effort = "Small (1-2 weeks)" | "Medium (1-2 months)" | "Large (3-6 months)" | "XL (6+ months)";

interface PitchIdea {
  id: string;
  title: string;
  elevatorPitch: string;
  targetMarket: string;
  estimatedEffort: Effort;
  champion: string;
  priority: Priority;
  stage: PitchStage;
  fullWriteUp: string;
  category: string;
  createdDate: string;
  lastUpdated: string;
}

const PITCH_STAGES: { key: PitchStage; label: string; color: string }[] = [
  { key: "draft", label: "Draft", color: "#94a3b8" },
  { key: "under-review", label: "Under Review", color: "#f59e0b" },
  { key: "approved", label: "Approved", color: "#22c55e" },
  { key: "in-development", label: "In Development", color: "#6366f1" },
  { key: "launched", label: "Launched", color: "#06b6d4" },
];

const PRIORITY_CONFIG: Record<Priority, { dot: string; label: string }> = {
  low: { dot: "bg-emerald-500", label: "Low" },
  medium: { dot: "bg-yellow-500", label: "Medium" },
  high: { dot: "bg-orange-500", label: "High" },
};

const seedIdeas: PitchIdea[] = [
  {
    id: "pitch-1",
    title: "AI-Powered Inventory Forecasting SaaS",
    elevatorPitch: "Machine learning tool that predicts optimal stock levels for e-commerce brands, reducing overstock by 30% and stockouts by 45%.",
    targetMarket: "Mid-size e-commerce brands ($1M-$50M ARR)",
    estimatedEffort: "Large (3-6 months)",
    champion: "Lakshay T.",
    priority: "high",
    stage: "in-development",
    fullWriteUp: "We've identified a gap in the market for affordable AI-driven inventory management. Current solutions like Inventory Planner cost $500+/mo. Our approach uses lightweight ML models trained on Shopify/WooCommerce data to deliver 85% accuracy at $99/mo. MVP would integrate with Shopify first, then expand to Amazon and WooCommerce. Revenue model: tiered SaaS with usage-based pricing for enterprise.",
    category: "SaaS Product",
    createdDate: "2025-01-15",
    lastUpdated: "2025-06-01",
  },
  {
    id: "pitch-2",
    title: "Premium Ayurvedic Wellness Brand for US Market",
    elevatorPitch: "Source high-quality Ayurvedic supplements from India, rebrand for the US wellness market with FDA-compliant packaging and modern branding.",
    targetMarket: "US health-conscious consumers, 25-45 age group",
    estimatedEffort: "Medium (1-2 months)",
    champion: "Priya S.",
    priority: "high",
    stage: "approved",
    fullWriteUp: "The US Ayurvedic market is projected to reach $14.9B by 2026. We can source from certified manufacturers in Haridwar/Rishikesh at 80% lower cost than US manufacturing. Key products: Ashwagandha gummies, Turmeric capsules, Triphala powder. Initial launch through Amazon FBA with a Shopify DTC site. Margins: 65-72% after COGS and shipping. Need FDA facility registration and supplement facts panel compliance.",
    category: "Dropshipping Brand",
    createdDate: "2025-02-10",
    lastUpdated: "2025-05-28",
  },
  {
    id: "pitch-3",
    title: "Unified Vendor Communication Platform",
    elevatorPitch: "Single dashboard to manage all supplier communications across WhatsApp, email, and WeChat with auto-translation and order tracking.",
    targetMarket: "Dropshipping businesses and import/export companies",
    estimatedEffort: "Large (3-6 months)",
    champion: "Rahul M.",
    priority: "medium",
    stage: "under-review",
    fullWriteUp: "Cross-border communication is fragmented. Vendors in China use WeChat, India uses WhatsApp, and US suppliers prefer email. Our platform unifies all channels with real-time translation (Google Translate API), order context linking, and automated follow-ups. Pricing: $49/mo for 5 vendors, $149/mo for unlimited. Competitive advantage: none of the existing tools combine multi-channel messaging with purchase order context.",
    category: "SaaS Product",
    createdDate: "2025-03-05",
    lastUpdated: "2025-05-20",
  },
  {
    id: "pitch-4",
    title: "Smart Home Gadgets Private Label",
    elevatorPitch: "Launch a curated line of smart home gadgets sourced from Shenzhen with custom branding, targeting the $80-200 price segment on Amazon.",
    targetMarket: "US smart home early adopters, Amazon Prime members",
    estimatedEffort: "Medium (1-2 months)",
    champion: "Amit K.",
    priority: "medium",
    stage: "draft",
    fullWriteUp: "Smart home market growing 25% YoY. We can source smart plugs, LED strip controllers, and WiFi cameras from Shenzhen at 4-6x markup potential. Start with 3 SKUs, test on Amazon with PPC budget of $5K. Target BSR top 50 in subcategories. Need UL/FCC certifications ($2-3K per SKU). Private label approach with Tuya-compatible firmware for app integration.",
    category: "Private Label",
    createdDate: "2025-04-12",
    lastUpdated: "2025-04-12",
  },
  {
    id: "pitch-5",
    title: "TeamSync Mobile App (React Native)",
    elevatorPitch: "Native mobile companion app for TeamSync platform enabling on-the-go task management, approvals, and real-time notifications.",
    targetMarket: "Existing TeamSync users and prospects",
    estimatedEffort: "XL (6+ months)",
    champion: "Lakshay T.",
    priority: "medium",
    stage: "draft",
    fullWriteUp: "60% of our internal team accesses TeamSync from mobile browsers. A dedicated React Native app would improve UX significantly. Phase 1: notifications + task management. Phase 2: chat + approvals. Phase 3: offline mode + biometric auth. Estimated cost: $40K for outsourced development or 4 months with in-house team. Revenue impact: reduces churn by 20% for SaaS customers.",
    category: "Platform Extension",
    createdDate: "2025-03-20",
    lastUpdated: "2025-05-15",
  },
  {
    id: "pitch-6",
    title: "MENA Market Expansion for EazyToSell",
    elevatorPitch: "Expand EazyToSell dropshipping platform to UAE and Saudi Arabia with Arabic localization and local payment gateway integration.",
    targetMarket: "MENA region e-commerce entrepreneurs",
    estimatedEffort: "Large (3-6 months)",
    champion: "Zara A.",
    priority: "high",
    stage: "under-review",
    fullWriteUp: "MENA e-commerce growing 30% annually. UAE and KSA have highest purchasing power. Key requirements: Arabic RTL support, Tabby/Tamara BNPL integration, local warehouse partnerships (Aramex/Fetchr). Revenue model: same SaaS model as current, pricing adjusted 15% lower for market entry. Competitor analysis shows only Zid and Salla serve this market, both lacking advanced analytics.",
    category: "Market Expansion",
    createdDate: "2025-02-28",
    lastUpdated: "2025-05-25",
  },
  {
    id: "pitch-7",
    title: "Automated Social Proof Widget",
    elevatorPitch: "Embeddable widget showing real-time purchase notifications, review highlights, and trust badges for e-commerce stores.",
    targetMarket: "Shopify and WooCommerce store owners",
    estimatedEffort: "Small (1-2 weeks)",
    champion: "Neha P.",
    priority: "low",
    stage: "approved",
    fullWriteUp: "Social proof tools like Fomo.com charge $39-199/mo. We can build a lightweight alternative at $19/mo with higher conversion impact. Features: real-time purchase popups, review carousels, stock scarcity counters, visitor count badges. Technical: single JS snippet install, 2KB bundle size, no performance impact. Initial distribution through Shopify App Store.",
    category: "SaaS Product",
    createdDate: "2025-04-01",
    lastUpdated: "2025-05-30",
  },
  {
    id: "pitch-8",
    title: "Sustainable Packaging Supply Chain",
    elevatorPitch: "Partner with Indian manufacturers to supply eco-friendly packaging materials to US D2C brands at 40% lower cost than domestic options.",
    targetMarket: "US D2C brands focused on sustainability",
    estimatedEffort: "Medium (1-2 months)",
    champion: "Vikram D.",
    priority: "low",
    stage: "draft",
    fullWriteUp: "Sustainable packaging demand is surging as brands commit to eco-friendly goals. Indian manufacturers in Gujarat produce compostable mailers, recycled cardboard, and plant-based bubble wrap at 40-60% lower cost. We can set up a B2B portal with MOQ of 1000 units, 3-4 week lead time via sea freight. Target first 20 customers through LinkedIn outreach to D2C founders.",
    category: "B2B Supply Chain",
    createdDate: "2025-05-10",
    lastUpdated: "2025-05-10",
  },
  {
    id: "pitch-9",
    title: "AI Content Studio for Product Listings",
    elevatorPitch: "GPT-powered tool that generates SEO-optimized product titles, bullet points, descriptions, and A+ content for Amazon and Shopify listings.",
    targetMarket: "Amazon sellers and Shopify store owners",
    estimatedEffort: "Small (1-2 weeks)",
    champion: "Lakshay T.",
    priority: "high",
    stage: "launched",
    fullWriteUp: "Product listing optimization is time-consuming. Our tool uses GPT-4 with fine-tuned prompts to generate Amazon-compliant titles (200 char limit), 5 bullet points, and HTML descriptions. Integrates with our existing platform. Pricing: freemium with 10 free listings/month, $29/mo for unlimited. Already validated with 50 beta users showing 23% improvement in CTR. Launched as part of EazyToSell toolkit.",
    category: "SaaS Product",
    createdDate: "2024-11-15",
    lastUpdated: "2025-04-20",
  },
  {
    id: "pitch-10",
    title: "Cross-Border Returns Management Platform",
    elevatorPitch: "Streamline international product returns with local collection points, automated customs paperwork, and refurbishment partnerships.",
    targetMarket: "Cross-border e-commerce sellers (US, EU, MENA)",
    estimatedEffort: "XL (6+ months)",
    champion: "Rahul M.",
    priority: "medium",
    stage: "draft",
    fullWriteUp: "International returns cost sellers 3-5x more than domestic returns. Our platform establishes local return collection points in key markets, handles customs documentation automatically, and partners with refurbishment centers to resell returned goods. Revenue: per-return fee ($5-15) + monthly subscription for dashboard access. Need partnerships with logistics providers in at least 3 countries for MVP.",
    category: "SaaS Product",
    createdDate: "2025-05-20",
    lastUpdated: "2025-05-20",
  },
];

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function PitchIdeasPage() {
  const loading = useSimulatedLoading();
  const { toast } = useToast();
  const vertical = verticals.find((v) => v.id === "rnd")!;

  const [ideas, setIdeas] = useState<PitchIdea[]>(seedIdeas);
  const [search, setSearch] = useState("");
  const [selectedIdea, setSelectedIdea] = useState<PitchIdea | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  const [newTitle, setNewTitle] = useState("");
  const [newPitch, setNewPitch] = useState("");
  const [newMarket, setNewMarket] = useState("");
  const [newEffort, setNewEffort] = useState<Effort>("Small (1-2 weeks)");
  const [newChampion, setNewChampion] = useState("");
  const [newPriority, setNewPriority] = useState<Priority>("medium");
  const [newCategory, setNewCategory] = useState("");
  const [newWriteUp, setNewWriteUp] = useState("");

  const filtered = useMemo(() => {
    if (!search) return ideas;
    const q = search.toLowerCase();
    return ideas.filter(
      (i) =>
        i.title.toLowerCase().includes(q) ||
        i.elevatorPitch.toLowerCase().includes(q) ||
        i.champion.toLowerCase().includes(q) ||
        i.category.toLowerCase().includes(q)
    );
  }, [ideas, search]);

  const totalIdeas = ideas.length;
  const inPipeline = ideas.filter((i) => i.stage !== "launched").length;
  const highPriority = ideas.filter((i) => i.priority === "high").length;
  const launchedCount = ideas.filter((i) => i.stage === "launched").length;

  const kanbanColumns: KanbanColumnData[] = useMemo(() => {
    return PITCH_STAGES.map((stage) => {
      const stageIdeas = filtered.filter((i) => i.stage === stage.key);
      return {
        id: stage.key,
        title: stage.label,
        color: stage.color,
        cards: stageIdeas.map((idea) => ({
          id: idea.id,
          title: idea.title,
          subtitle: idea.elevatorPitch.slice(0, 80) + (idea.elevatorPitch.length > 80 ? "..." : ""),
          priority: idea.priority,
          assignee: idea.champion,
          badges: [
            { label: idea.category, variant: "secondary" },
            { label: idea.estimatedEffort.split(" ")[0], variant: "outline" },
          ],
        })),
      };
    });
  }, [filtered]);

  const openDetail = (idea: PitchIdea) => {
    setSelectedIdea(idea);
    setDetailOpen(true);
  };

  const handleCardClick = (card: KanbanCardItem) => {
    const idea = ideas.find((i) => i.id === card.id);
    if (idea) openDetail(idea);
  };

  const handleCardMove = (cardId: string, _sourceCol: string, targetCol: string) => {
    setIdeas((prev) =>
      prev.map((i) =>
        i.id === cardId
          ? { ...i, stage: targetCol as PitchStage, lastUpdated: new Date().toISOString().split("T")[0] }
          : i
      )
    );
    const idea = ideas.find((i) => i.id === cardId);
    const targetStage = PITCH_STAGES.find((s) => s.key === targetCol);
    if (idea && targetStage) {
      toast({ title: "Idea moved", description: `"${idea.title}" moved to ${targetStage.label}` });
    }
  };

  const handleAddIdea = () => {
    if (!newTitle.trim()) {
      toast({ title: "Title required", description: "Please enter a title for the pitch idea", variant: "destructive" });
      return;
    }
    const newIdea: PitchIdea = {
      id: `pitch-${Date.now()}`,
      title: newTitle,
      elevatorPitch: newPitch,
      targetMarket: newMarket,
      estimatedEffort: newEffort,
      champion: newChampion || "Unassigned",
      priority: newPriority,
      stage: "draft",
      fullWriteUp: newWriteUp,
      category: newCategory || "General",
      createdDate: new Date().toISOString().split("T")[0],
      lastUpdated: new Date().toISOString().split("T")[0],
    };
    setIdeas((prev) => [newIdea, ...prev]);
    setAddOpen(false);
    setNewTitle("");
    setNewPitch("");
    setNewMarket("");
    setNewEffort("Small (1-2 weeks)");
    setNewChampion("");
    setNewPriority("medium");
    setNewCategory("");
    setNewWriteUp("");
    toast({ title: "Idea added", description: `"${newTitle}" has been added to Drafts` });
  };

  const handleAddCard = (_columnId: string) => {
    setAddOpen(true);
  };

  function renderKanbanCard(card: KanbanCardItem, _columnId: string) {
    const idea = ideas.find((i) => i.id === card.id);
    if (!idea) return null;
    const priorityCfg = PRIORITY_CONFIG[idea.priority];

    return (
      <Card
        className="p-3 cursor-pointer hover-elevate"
        onClick={() => openDetail(idea)}
        data-testid={`pitch-card-${idea.id}`}
      >
        <div className="flex items-start gap-2">
          <span className={cn("mt-1.5 h-2 w-2 rounded-full shrink-0", priorityCfg.dot)} />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium line-clamp-2" data-testid={`text-idea-title-${idea.id}`}>
              {idea.title}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
              {idea.elevatorPitch}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 mt-2 flex-wrap">
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
            {idea.category}
          </Badge>
          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
            {idea.estimatedEffort.split(" ")[0]}
          </Badge>
        </div>
        <div className="flex items-center justify-between gap-2 mt-2">
          <span className="text-[10px] text-muted-foreground">{idea.targetMarket.split(",")[0]}</span>
          <Avatar className="h-5 w-5 shrink-0">
            <AvatarFallback className="text-[9px]">
              {getInitials(idea.champion)}
            </AvatarFallback>
          </Avatar>
        </div>
      </Card>
    );
  }

  return (
    <PageShell>
      <PageHeader
        title="Pitch Ideas"
        subtitle="Track and manage new product and business ideas through the innovation pipeline"
        actions={
          <Button
            className="gap-2"
            style={{ backgroundColor: vertical.color }}
            onClick={() => setAddOpen(true)}
            data-testid="button-add-idea"
          >
            <Plus className="h-4 w-4" />
            Add Idea
          </Button>
        }
      />

      <StatGrid>
        <StatCard
          label="Total Ideas"
          value={totalIdeas}
          icon={Lightbulb}
          iconBg="#eef2ff"
          iconColor="#6366f1"
        />
        <StatCard
          label="In Pipeline"
          value={inPipeline}
          icon={Target}
          iconBg="#fef3c7"
          iconColor="#d97706"
        />
        <StatCard
          label="High Priority"
          value={highPriority}
          icon={Zap}
          iconBg="#fee2e2"
          iconColor="#dc2626"
        />
        <StatCard
          label="Launched"
          value={launchedCount}
          icon={Rocket}
          iconBg="#d1fae5"
          iconColor="#059669"
        />
      </StatGrid>

      <div className="flex items-center justify-between gap-4 flex-wrap" data-testid="pitch-toolbar">
        <div className="relative w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none h-4 w-4" />
          <Input
            className="pl-10 bg-muted/30"
            placeholder="Search ideas, champions, categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            data-testid="input-search-ideas"
          />
        </div>
      </div>

      {loading ? (
        <TableSkeleton rows={6} columns={5} />
      ) : (
        <KanbanBoard
          columns={kanbanColumns}
          onCardClick={handleCardClick}
          onCardMove={handleCardMove}
          onAddCard={handleAddCard}
          renderCard={renderKanbanCard}
          columnClassName="w-64 min-w-[16rem]"
        />
      )}

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-lg p-0 gap-0 overflow-hidden" data-testid="pitch-detail-modal">
          {selectedIdea && (
            <>
              <div className="px-5 py-4 border-b">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <h2 className="text-lg font-semibold" data-testid="modal-title">{selectedIdea.title}</h2>
                    <p className="text-sm text-muted-foreground mt-0.5">{selectedIdea.category}</p>
                  </div>
                  <Badge
                    style={{
                      backgroundColor: PITCH_STAGES.find((s) => s.key === selectedIdea.stage)?.color + "20",
                      color: PITCH_STAGES.find((s) => s.key === selectedIdea.stage)?.color,
                    }}
                    className="no-default-active-elevate shrink-0"
                    data-testid="badge-idea-stage"
                  >
                    {PITCH_STAGES.find((s) => s.key === selectedIdea.stage)?.label}
                  </Badge>
                </div>
              </div>

              <div className="px-5 py-4 space-y-4 max-h-[65vh] overflow-y-auto">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">Elevator Pitch</label>
                  <p className="text-sm" data-testid="text-elevator-pitch">{selectedIdea.elevatorPitch}</p>
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">Full Write-Up</label>
                  <p className="text-sm text-muted-foreground leading-relaxed" data-testid="text-writeup">{selectedIdea.fullWriteUp}</p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-xs text-muted-foreground block">Target Market</span>
                    <span className="font-medium" data-testid="text-target-market">{selectedIdea.targetMarket}</span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">Estimated Effort</span>
                    <span className="font-medium" data-testid="text-effort">{selectedIdea.estimatedEffort}</span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">Champion</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Avatar className="h-5 w-5">
                        <AvatarFallback className="text-[9px]">{getInitials(selectedIdea.champion)}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium" data-testid="text-champion">{selectedIdea.champion}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">Priority</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={cn("h-2 w-2 rounded-full", PRIORITY_CONFIG[selectedIdea.priority].dot)} />
                      <span className="font-medium capitalize" data-testid="text-priority">{selectedIdea.priority}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">Created</span>
                    <span className="font-medium">{selectedIdea.createdDate}</span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">Last Updated</span>
                    <span className="font-medium">{selectedIdea.lastUpdated}</span>
                  </div>
                </div>
              </div>

              <div className="px-5 py-3 border-t flex items-center justify-end gap-2">
                <Button variant="outline" onClick={() => setDetailOpen(false)} data-testid="button-close-detail">
                  Close
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-md" data-testid="add-idea-dialog">
          <DialogHeader>
            <DialogTitle>Add New Idea</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Title</label>
              <Input
                placeholder="Idea title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                data-testid="input-new-title"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Elevator Pitch</label>
              <Textarea
                placeholder="One-liner description of the idea"
                value={newPitch}
                onChange={(e) => setNewPitch(e.target.value)}
                rows={2}
                className="resize-none text-sm"
                data-testid="input-new-pitch"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Target Market</label>
              <Input
                placeholder="Who is this for?"
                value={newMarket}
                onChange={(e) => setNewMarket(e.target.value)}
                data-testid="input-new-market"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Estimated Effort</label>
                <Select value={newEffort} onValueChange={(v) => setNewEffort(v as Effort)}>
                  <SelectTrigger data-testid="select-new-effort">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Small (1-2 weeks)">Small (1-2 weeks)</SelectItem>
                    <SelectItem value="Medium (1-2 months)">Medium (1-2 months)</SelectItem>
                    <SelectItem value="Large (3-6 months)">Large (3-6 months)</SelectItem>
                    <SelectItem value="XL (6+ months)">XL (6+ months)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Priority</label>
                <Select value={newPriority} onValueChange={(v) => setNewPriority(v as Priority)}>
                  <SelectTrigger data-testid="select-new-priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Champion</label>
              <Input
                placeholder="Who's championing this idea?"
                value={newChampion}
                onChange={(e) => setNewChampion(e.target.value)}
                data-testid="input-new-champion"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Category</label>
              <Input
                placeholder="e.g. SaaS Product, Dropshipping Brand"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                data-testid="input-new-category"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Full Write-Up</label>
              <Textarea
                placeholder="Detailed description, market analysis, revenue model..."
                value={newWriteUp}
                onChange={(e) => setNewWriteUp(e.target.value)}
                rows={4}
                className="resize-none text-sm"
                data-testid="input-new-writeup"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)} data-testid="button-cancel-add">
              Cancel
            </Button>
            <Button
              style={{ backgroundColor: vertical.color }}
              onClick={handleAddIdea}
              data-testid="button-submit-idea"
            >
              Add Idea
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
