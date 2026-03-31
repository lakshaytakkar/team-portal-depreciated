import { useState, useMemo } from "react";
import { DataTable, type Column } from "@/components/ds/data-table";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { StatusBadge } from "@/components/ds/status-badge";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { PageShell, PageHeader } from "@/components/layout";
import { verticals } from "@/lib/verticals-config";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Package,
  Globe,
  TrendingUp,
  BarChart3,
  MapPin,
  Calendar,
  User,
  ExternalLink,
  FileText,
} from "lucide-react";

interface ProductResearchItem {
  id: string;
  productName: string;
  category: string;
  sourceMarket: string;
  targetMarket: string;
  competition: "Low" | "Medium" | "High";
  marginPercent: number;
  supplier: string;
  status: "Researching" | "Validated" | "Rejected";
  addedDate: string;
  notes: string;
  supplierLink: string;
  estimatedCost: number;
  estimatedRetail: number;
  addedBy: string;
  tags: string[];
}

const mockProducts: ProductResearchItem[] = [
  {
    id: "pr-001",
    productName: "Organic Turmeric Capsules",
    category: "Health & Wellness",
    sourceMarket: "India",
    targetMarket: "USA",
    competition: "Medium",
    marginPercent: 62,
    supplier: "Kerala Ayurveda Exports",
    status: "Validated",
    addedDate: "2025-01-12",
    notes: "Strong demand in US wellness market. FDA-compliant packaging available from supplier. Minimum order 500 units. Good reviews on competitor listings.",
    supplierLink: "https://keralaayurveda.example.com",
    estimatedCost: 3.20,
    estimatedRetail: 18.99,
    addedBy: "Lakshay T.",
    tags: ["Ayurveda", "Supplements", "Trending"],
  },
  {
    id: "pr-002",
    productName: "Bamboo Fiber Kitchen Towels",
    category: "Home & Kitchen",
    sourceMarket: "India",
    targetMarket: "USA",
    competition: "Low",
    marginPercent: 55,
    supplier: "GreenWeave Industries",
    status: "Validated",
    addedDate: "2025-01-08",
    notes: "Eco-friendly angle is strong. Reusable, washable bamboo towels with no direct competitor on Faire. Packaging needs sustainability certification.",
    supplierLink: "https://greenweave.example.com",
    estimatedCost: 2.50,
    estimatedRetail: 12.99,
    addedBy: "Priya S.",
    tags: ["Eco-friendly", "Kitchen", "Low Competition"],
  },
  {
    id: "pr-003",
    productName: "Smart LED Grow Light Panel",
    category: "Garden & Outdoor",
    sourceMarket: "Other",
    targetMarket: "USA",
    competition: "High",
    marginPercent: 38,
    supplier: "Shenzhen BrightGrow Tech",
    status: "Researching",
    addedDate: "2025-01-15",
    notes: "App-controlled grow lights for indoor gardening. High competition but strong demand in urban farming segment. Need UL certification for US market.",
    supplierLink: "https://brightgrow.example.com",
    estimatedCost: 28.00,
    estimatedRetail: 64.99,
    addedBy: "Lakshay T.",
    tags: ["Tech", "Indoor Garden", "Smart Home"],
  },
  {
    id: "pr-004",
    productName: "Handwoven Jute Tote Bags",
    category: "Fashion & Accessories",
    sourceMarket: "India",
    targetMarket: "EU",
    competition: "Low",
    marginPercent: 68,
    supplier: "Bengal Crafts Co-op",
    status: "Validated",
    addedDate: "2024-12-20",
    notes: "Artisan-made jute bags with block print designs. Strong story for European boutique market. Fair trade certified. EU import duties minimal for jute goods.",
    supplierLink: "https://bengalcrafts.example.com",
    estimatedCost: 4.00,
    estimatedRetail: 24.99,
    addedBy: "Ananya M.",
    tags: ["Artisan", "Fair Trade", "Sustainable"],
  },
  {
    id: "pr-005",
    productName: "Portable UV-C Sanitizer Wand",
    category: "Electronics",
    sourceMarket: "Other",
    targetMarket: "USA",
    competition: "Medium",
    marginPercent: 45,
    supplier: "Dongguan CleanTech",
    status: "Rejected",
    addedDate: "2024-12-15",
    notes: "Market has shifted post-pandemic. Demand declining steadily. Multiple cheap alternatives flooding the market. Not viable for premium positioning.",
    supplierLink: "https://cleantech.example.com",
    estimatedCost: 8.50,
    estimatedRetail: 29.99,
    addedBy: "Lakshay T.",
    tags: ["Electronics", "Hygiene"],
  },
  {
    id: "pr-006",
    productName: "Brass Incense Holder Set",
    category: "Home Decor",
    sourceMarket: "India",
    targetMarket: "USA",
    competition: "Low",
    marginPercent: 72,
    supplier: "Moradabad Metalworks",
    status: "Validated",
    addedDate: "2025-01-05",
    notes: "Handcrafted brass holders with intricate designs. Pairs well with incense product line. High perceived value in US home decor market. Ships well with minimal breakage.",
    supplierLink: "https://moradabadmetals.example.com",
    estimatedCost: 5.50,
    estimatedRetail: 34.99,
    addedBy: "Priya S.",
    tags: ["Handcrafted", "Home Decor", "Brass"],
  },
  {
    id: "pr-007",
    productName: "Himalayan Salt Lamp (USB)",
    category: "Home Decor",
    sourceMarket: "India",
    targetMarket: "USA",
    competition: "High",
    marginPercent: 52,
    supplier: "Salt Range Exports",
    status: "Researching",
    addedDate: "2025-01-18",
    notes: "USB-powered mini salt lamps for desks. Differentiated by compact size and USB power. Saturated market but USB angle has less competition.",
    supplierLink: "https://saltrange.example.com",
    estimatedCost: 6.00,
    estimatedRetail: 22.99,
    addedBy: "Ananya M.",
    tags: ["Wellness", "USB", "Desk Accessory"],
  },
  {
    id: "pr-008",
    productName: "Cold-Pressed Neem Oil (Organic)",
    category: "Health & Wellness",
    sourceMarket: "India",
    targetMarket: "USA",
    competition: "Medium",
    marginPercent: 58,
    supplier: "TamilNadu Organics Ltd",
    status: "Researching",
    addedDate: "2025-01-20",
    notes: "USDA organic certified neem oil. Strong demand in natural skincare and garden pest control segments. Dual-use positioning increases market reach.",
    supplierLink: "https://tnorganics.example.com",
    estimatedCost: 4.80,
    estimatedRetail: 19.99,
    addedBy: "Lakshay T.",
    tags: ["Organic", "Skincare", "Garden"],
  },
  {
    id: "pr-009",
    productName: "Ceramic Pour-Over Coffee Set",
    category: "Home & Kitchen",
    sourceMarket: "Other",
    targetMarket: "USA",
    competition: "Medium",
    marginPercent: 48,
    supplier: "Jingdezhen Ceramics Co",
    status: "Validated",
    addedDate: "2024-12-28",
    notes: "Handmade ceramic dripper with matching mug. Artisan coffee segment growing 15% YoY. High-quality glaze finish. Gift set packaging available.",
    supplierLink: "https://jdzceramic.example.com",
    estimatedCost: 12.00,
    estimatedRetail: 42.99,
    addedBy: "Priya S.",
    tags: ["Coffee", "Ceramic", "Gift Set"],
  },
  {
    id: "pr-010",
    productName: "Copper Water Bottle (Ayurvedic)",
    category: "Health & Wellness",
    sourceMarket: "India",
    targetMarket: "EU",
    competition: "Low",
    marginPercent: 64,
    supplier: "Rajasthan Copper Works",
    status: "Validated",
    addedDate: "2025-01-02",
    notes: "Pure copper bottles with Ayurvedic health benefits angle. EU market receptive to wellness products from India. Leak-proof design tested.",
    supplierLink: "https://rajcopperwroks.example.com",
    estimatedCost: 7.00,
    estimatedRetail: 32.99,
    addedBy: "Ananya M.",
    tags: ["Ayurveda", "Copper", "Wellness"],
  },
  {
    id: "pr-011",
    productName: "Reusable Beeswax Food Wraps",
    category: "Home & Kitchen",
    sourceMarket: "India",
    targetMarket: "USA",
    competition: "Medium",
    marginPercent: 60,
    supplier: "Himalayan Bee Products",
    status: "Researching",
    addedDate: "2025-01-22",
    notes: "Set of 3 sizes with organic cotton and beeswax. Eco-conscious consumers are primary target. Need to verify shelf life claims and FDA food contact compliance.",
    supplierLink: "https://himalayanbee.example.com",
    estimatedCost: 3.50,
    estimatedRetail: 16.99,
    addedBy: "Lakshay T.",
    tags: ["Eco-friendly", "Kitchen", "Zero Waste"],
  },
  {
    id: "pr-012",
    productName: "Wooden Bluetooth Speaker",
    category: "Electronics",
    sourceMarket: "Other",
    targetMarket: "USA",
    competition: "Medium",
    marginPercent: 42,
    supplier: "Yiwu AudioCraft",
    status: "Rejected",
    addedDate: "2024-12-10",
    notes: "Natural wood finish Bluetooth speaker. Sound quality testing showed below-average bass response compared to competition. FCC certification costs too high for expected volume.",
    supplierLink: "https://audiocraft.example.com",
    estimatedCost: 15.00,
    estimatedRetail: 44.99,
    addedBy: "Priya S.",
    tags: ["Audio", "Wood", "Bluetooth"],
  },
  {
    id: "pr-013",
    productName: "Moringa Powder (Superfood)",
    category: "Health & Wellness",
    sourceMarket: "India",
    targetMarket: "USA",
    competition: "Low",
    marginPercent: 70,
    supplier: "South India Superfoods",
    status: "Validated",
    addedDate: "2025-01-10",
    notes: "Organic moringa leaf powder in resealable pouches. Superfood trend still growing. Supplier has USDA organic and non-GMO certifications. 300g and 500g SKUs.",
    supplierLink: "https://sisuperfoods.example.com",
    estimatedCost: 3.00,
    estimatedRetail: 19.99,
    addedBy: "Lakshay T.",
    tags: ["Superfood", "Organic", "High Margin"],
  },
  {
    id: "pr-014",
    productName: "Macrame Wall Hanging Kit",
    category: "Home Decor",
    sourceMarket: "India",
    targetMarket: "EU",
    competition: "Low",
    marginPercent: 65,
    supplier: "Jaipur Textile Arts",
    status: "Researching",
    addedDate: "2025-01-25",
    notes: "DIY macrame kit with cotton rope, wooden dowel, and instruction booklet. Craft kit market booming in EU. Instagram-friendly packaging. Good repeat purchase potential.",
    supplierLink: "https://jaipurtextile.example.com",
    estimatedCost: 5.00,
    estimatedRetail: 28.99,
    addedBy: "Ananya M.",
    tags: ["DIY", "Craft", "Instagram"],
  },
  {
    id: "pr-015",
    productName: "Stainless Steel Lunch Box (Tiered)",
    category: "Home & Kitchen",
    sourceMarket: "India",
    targetMarket: "USA",
    competition: "Medium",
    marginPercent: 50,
    supplier: "Mumbai Steel Exports",
    status: "Researching",
    addedDate: "2025-01-28",
    notes: "Traditional Indian tiffin-style stainless steel lunch boxes. 3-tier design appeals to meal prep community. BPA-free, dishwasher safe. Need better lifestyle photography.",
    supplierLink: "https://mumbaisteel.example.com",
    estimatedCost: 8.00,
    estimatedRetail: 29.99,
    addedBy: "Priya S.",
    tags: ["Meal Prep", "Stainless Steel", "Eco-friendly"],
  },
];

const statusVariant: Record<string, "success" | "error" | "warning" | "neutral" | "info"> = {
  Validated: "success",
  Researching: "info",
  Rejected: "error",
};

const competitionColor: Record<string, string> = {
  Low: "text-emerald-600 dark:text-emerald-400",
  Medium: "text-amber-600 dark:text-amber-400",
  High: "text-red-600 dark:text-red-400",
};

const formatCurrency = (v: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(v);

export default function ProductResearchPage() {
  const loading = useSimulatedLoading();
  const [data] = useState<ProductResearchItem[]>(mockProducts);
  const [selectedProduct, setSelectedProduct] = useState<ProductResearchItem | null>(null);

  const vertical = verticals.find((v) => v.id === "rnd")!;

  const categories = useMemo(() => Array.from(new Set(data.map((p) => p.category))), [data]);
  const sourceMarkets = useMemo(() => Array.from(new Set(data.map((p) => p.sourceMarket))), [data]);

  const columns: Column<ProductResearchItem>[] = [
    {
      key: "productName",
      header: "Product Name",
      sortable: true,
      render: (item) => (
        <div className="min-w-0">
          <span className="text-sm font-medium block truncate max-w-[200px]" data-testid={`text-product-name-${item.id}`}>
            {item.productName}
          </span>
          <span className="text-xs text-muted-foreground">{item.category}</span>
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
      sortable: true,
      render: (item) => <span className="text-sm">{item.category}</span>,
    },
    {
      key: "sourceMarket",
      header: "Source",
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-1.5">
          <MapPin className="h-3 w-3 text-muted-foreground" />
          <span className="text-sm">{item.sourceMarket}</span>
        </div>
      ),
    },
    {
      key: "targetMarket",
      header: "Target",
      sortable: true,
      render: (item) => <span className="text-sm">{item.targetMarket}</span>,
    },
    {
      key: "competition",
      header: "Competition",
      sortable: true,
      render: (item) => (
        <span className={`text-sm font-medium ${competitionColor[item.competition]}`}>
          {item.competition}
        </span>
      ),
    },
    {
      key: "marginPercent",
      header: "Margin %",
      sortable: true,
      render: (item) => (
        <span className="text-sm font-medium">{item.marginPercent}%</span>
      ),
    },
    {
      key: "supplier",
      header: "Supplier",
      render: (item) => (
        <span className="text-sm text-muted-foreground truncate block max-w-[150px]">{item.supplier}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (item) => (
        <StatusBadge
          status={item.status}
          variant={statusVariant[item.status]}
        />
      ),
    },
    {
      key: "addedDate",
      header: "Added",
      sortable: true,
      render: (item) => (
        <span className="text-sm text-muted-foreground">
          {new Date(item.addedDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
        </span>
      ),
    },
  ];

  return (
    <PageShell>
      <PageHeader
        title="Product Research"
        subtitle="Dropshipping and brand product research pipeline"
      />

      {loading ? (
        <TableSkeleton rows={10} columns={9} />
      ) : (
        <DataTable
          data={data}
          columns={columns}
          searchPlaceholder="Search products, suppliers, categories..."
          searchKey="productName"
          onRowClick={(item) => setSelectedProduct(item)}
          filters={[
            { label: "Source Market", key: "sourceMarket", options: sourceMarkets },
            { label: "Category", key: "category", options: categories },
            { label: "Status", key: "status", options: ["Researching", "Validated", "Rejected"] },
            { label: "Competition", key: "competition", options: ["Low", "Medium", "High"] },
          ]}
        />
      )}

      <Dialog open={!!selectedProduct} onOpenChange={(open) => !open && setSelectedProduct(null)}>
        <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden" data-testid="dialog-product-detail">
          {selectedProduct && (
            <>
              <DialogHeader className="px-6 py-4 border-b">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <DialogTitle className="text-base font-semibold" data-testid="text-detail-title">
                      {selectedProduct.productName}
                    </DialogTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">{selectedProduct.category}</p>
                  </div>
                  <StatusBadge
                    status={selectedProduct.status}
                    variant={statusVariant[selectedProduct.status]}
                  />
                </div>
              </DialogHeader>
              <ScrollArea className="max-h-[65vh]">
                <div className="px-6 py-5 space-y-5">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="rounded-lg border p-3 text-center">
                      <Globe className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
                      <div className="text-sm font-semibold" data-testid="text-detail-source">{selectedProduct.sourceMarket}</div>
                      <div className="text-xs text-muted-foreground">Source</div>
                    </div>
                    <div className="rounded-lg border p-3 text-center">
                      <MapPin className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
                      <div className="text-sm font-semibold" data-testid="text-detail-target">{selectedProduct.targetMarket}</div>
                      <div className="text-xs text-muted-foreground">Target</div>
                    </div>
                    <div className="rounded-lg border p-3 text-center">
                      <TrendingUp className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
                      <div className="text-sm font-semibold" data-testid="text-detail-margin">{selectedProduct.marginPercent}%</div>
                      <div className="text-xs text-muted-foreground">Margin</div>
                    </div>
                    <div className="rounded-lg border p-3 text-center">
                      <BarChart3 className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
                      <div className={`text-sm font-semibold ${competitionColor[selectedProduct.competition]}`} data-testid="text-detail-competition">
                        {selectedProduct.competition}
                      </div>
                      <div className="text-xs text-muted-foreground">Competition</div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold">Pricing Estimate</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                        <span className="text-sm text-muted-foreground">Estimated Cost</span>
                        <span className="text-sm font-semibold" data-testid="text-detail-cost">{formatCurrency(selectedProduct.estimatedCost)}</span>
                      </div>
                      <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                        <span className="text-sm text-muted-foreground">Estimated Retail</span>
                        <span className="text-sm font-semibold" data-testid="text-detail-retail">{formatCurrency(selectedProduct.estimatedRetail)}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                      <span className="text-sm text-muted-foreground">Estimated Profit</span>
                      <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400" data-testid="text-detail-profit">
                        {formatCurrency(selectedProduct.estimatedRetail - selectedProduct.estimatedCost)}
                      </span>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold">Supplier Information</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between py-1.5">
                        <span className="text-sm text-muted-foreground">Supplier</span>
                        <span className="text-sm font-medium" data-testid="text-detail-supplier">{selectedProduct.supplier}</span>
                      </div>
                      <div className="flex items-center justify-between py-1.5">
                        <span className="text-sm text-muted-foreground">Link</span>
                        <a
                          href={selectedProduct.supplierLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium flex items-center gap-1"
                          style={{ color: vertical.color }}
                          data-testid="link-supplier"
                        >
                          Visit Supplier <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                      <div className="flex items-center justify-between py-1.5">
                        <span className="text-sm text-muted-foreground">Added By</span>
                        <div className="flex items-center gap-1.5">
                          <User className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm font-medium" data-testid="text-detail-added-by">{selectedProduct.addedBy}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between py-1.5">
                        <span className="text-sm text-muted-foreground">Date Added</span>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm font-medium" data-testid="text-detail-date">
                            {new Date(selectedProduct.addedDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold flex items-center gap-1.5">
                      <FileText className="h-3.5 w-3.5" /> Research Notes
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed" data-testid="text-detail-notes">
                      {selectedProduct.notes}
                    </p>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold">Tags</h3>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {selectedProduct.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs" data-testid={`badge-tag-${tag.toLowerCase().replace(/\s+/g, "-")}`}>
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </>
          )}
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
