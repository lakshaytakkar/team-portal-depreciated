import { PARTNER_PROFILE } from "./mock-data-dashboard-ets";

import type { EtsPortalClient, SetupItemGroup, SetupItem, StoreSizeSqFt } from "@/types/portal-ets";
export type { EtsPortalClient, SetupItemGroup, SetupItem, StoreSizeSqFt };


export const portalEtsClient: EtsPortalClient = {
  id: PARTNER_PROFILE.id,
  name: PARTNER_PROFILE.name,
  email: PARTNER_PROFILE.email,
  phone: PARTNER_PROFILE.phone,
  avatar: "RK",
  city: PARTNER_PROFILE.city,
};

export const ETS_PORTAL_COLOR = "#F97316";

export const ETS_STAGE_DESCRIPTIONS: Record<string, string> = {
  "new-lead": "Your inquiry has been received and our team is reviewing your profile.",
  "qualified": "You have been qualified for the EazyToSell franchise program. Next step: package selection and proposal review.",
  "token-paid": "Token payment received! Your onboarding process has begun. Your account manager will schedule a discovery call.",
  "store-design": "Your store interior layout and design is being prepared. You'll receive 3D renders for approval soon.",
  "inventory-ordered": "Your product inventory has been confirmed with our factory partners. Production is underway.",
  "in-transit": "Your shipment is on its way from China to India. Track your container status in the Orders section.",
  "launched": "Congratulations! Your store is live and operational. Our support team is here to help you succeed.",
  "reordering": "You're now a repeat partner! Your reorder is being processed. Keep the momentum going!",
};

export const ETS_STAGE_DISPLAY_LABELS: Record<string, string> = {
  "new-lead": "Inquiry Received",
  "qualified": "Qualified",
  "token-paid": "Token Paid",
  "store-design": "Store Design",
  "inventory-ordered": "Inventory Ordered",
  "in-transit": "Shipment In Transit",
  "launched": "Store Launched",
  "reordering": "Reordering",
};

export const ETS_ORDER_STAGE_LABELS: Record<string, string> = {
  ordered: "Order Placed",
  "factory-ready": "Factory Ready",
  shipped: "Shipped",
  customs: "At Customs",
  warehouse: "In Warehouse",
  dispatched: "Dispatched",
};

export const ETS_ORDER_STAGES = ["ordered", "factory-ready", "shipped", "customs", "warehouse", "dispatched"] as const;

export const SETUP_ITEMS: SetupItem[] = [
  {
    id: "shelf-gondola",
    name: "Gondola Shelving Unit",
    description: "Double-sided freestanding gondola shelves ideal for aisle product display. Adjustable shelf heights, powder-coated finish.",
    group: "Shelving & Display",
    priceRangeMin: 4500,
    priceRangeMax: 7000,
    recommendedQtyFor1000sqft: 10,
    isEssential: true,
    buyLink: "https://example.com/gondola",
    imageUrl: "https://placehold.co/300x300?text=Gondola+Shelf",
  },
  {
    id: "shelf-wall",
    name: "Wall-Mount Display Shelves",
    description: "Heavy-duty wall-bracket shelving for perimeter walls. Supports up to 30 kg per shelf. Includes brackets and hardware.",
    group: "Shelving & Display",
    priceRangeMin: 1200,
    priceRangeMax: 2500,
    recommendedQtyFor1000sqft: 20,
    isEssential: true,
    imageUrl: "https://placehold.co/300x300?text=Wall+Shelves",
  },
  {
    id: "shelf-display-cabinet",
    name: "Glass Display Cabinet",
    description: "Lockable glass-front display cabinet for high-value or fragile items. LED-lit interior.",
    group: "Shelving & Display",
    priceRangeMin: 8000,
    priceRangeMax: 14000,
    recommendedQtyFor1000sqft: 2,
    isEssential: false,
    imageUrl: "https://placehold.co/300x300?text=Display+Cabinet",
  },
  {
    id: "shelf-feature-wall",
    name: "Feature Wall Display Rack",
    description: "Slatwall panel system for the feature wall at the store entrance. Accepts hooks, baskets, and shelf brackets.",
    group: "Shelving & Display",
    priceRangeMin: 3500,
    priceRangeMax: 6000,
    recommendedQtyFor1000sqft: 4,
    isEssential: true,
    imageUrl: "https://placehold.co/300x300?text=Feature+Wall+Rack",
  },
  {
    id: "tech-pos-terminal",
    name: "POS Terminal (Touch Screen)",
    description: "15-inch touchscreen all-in-one POS with receipt printer port, barcode scanner support, and dual display.",
    group: "Technology & Hardware",
    priceRangeMin: 18000,
    priceRangeMax: 28000,
    recommendedQtyFor1000sqft: 2,
    isEssential: true,
    imageUrl: "https://placehold.co/300x300?text=POS+Terminal",
  },
  {
    id: "tech-barcode-scanner",
    name: "Barcode Scanner (USB)",
    description: "Omnidirectional 1D/2D barcode scanner. Plug-and-play USB connection, compatible with all major POS software.",
    group: "Technology & Hardware",
    priceRangeMin: 2500,
    priceRangeMax: 4500,
    recommendedQtyFor1000sqft: 2,
    isEssential: true,
    imageUrl: "https://placehold.co/300x300?text=Barcode+Scanner",
  },
  {
    id: "tech-label-printer",
    name: "Thermal Label Printer",
    description: "Desktop thermal label printer for product tags and shelf labels. 4-inch print width, 203 DPI resolution.",
    group: "Technology & Hardware",
    priceRangeMin: 5000,
    priceRangeMax: 9000,
    recommendedQtyFor1000sqft: 1,
    isEssential: true,
    imageUrl: "https://placehold.co/300x300?text=Label+Printer",
  },
  {
    id: "tech-router",
    name: "WiFi Router (Business Grade)",
    description: "Dual-band business-grade Wi-Fi router with gigabit ports. Supports 30+ simultaneous devices for POS and surveillance.",
    group: "Technology & Hardware",
    priceRangeMin: 3000,
    priceRangeMax: 6000,
    recommendedQtyFor1000sqft: 1,
    isEssential: true,
    imageUrl: "https://placehold.co/300x300?text=WiFi+Router",
  },
  {
    id: "tech-receipt-printer",
    name: "Thermal Receipt Printer",
    description: "80mm thermal receipt printer with auto-cutter. Compatible with ESC/POS commands, USB + LAN connectivity.",
    group: "Technology & Hardware",
    priceRangeMin: 4000,
    priceRangeMax: 7000,
    recommendedQtyFor1000sqft: 2,
    isEssential: true,
    imageUrl: "https://placehold.co/300x300?text=Receipt+Printer",
  },
  {
    id: "counter-checkout",
    name: "Checkout Counter",
    description: "L-shaped checkout counter with under-counter storage, cable management, and laminate finish. 1.5m × 0.8m.",
    group: "Counters & Furniture",
    priceRangeMin: 15000,
    priceRangeMax: 25000,
    recommendedQtyFor1000sqft: 1,
    isEssential: true,
    imageUrl: "https://placehold.co/300x300?text=Checkout+Counter",
  },
  {
    id: "counter-cash-drawer",
    name: "Cash Drawer",
    description: "Steel cash drawer with 8-note and 8-coin compartments. RJ-11 connection to receipt printer, keyed lock.",
    group: "Counters & Furniture",
    priceRangeMin: 2500,
    priceRangeMax: 4500,
    recommendedQtyFor1000sqft: 2,
    isEssential: true,
    imageUrl: "https://placehold.co/300x300?text=Cash+Drawer",
  },
  {
    id: "counter-staff-stool",
    name: "Ergonomic Staff Stool",
    description: "Adjustable-height ergonomic stool for checkout staff. Footrest ring and backrest included.",
    group: "Counters & Furniture",
    priceRangeMin: 2000,
    priceRangeMax: 4000,
    recommendedQtyFor1000sqft: 2,
    isEssential: false,
    imageUrl: "https://placehold.co/300x300?text=Staff+Stool",
  },
  {
    id: "counter-backroom-shelving",
    name: "Backroom Storage Rack",
    description: "Industrial boltless steel rack for backroom inventory storage. 5 adjustable tiers, 500 kg load capacity.",
    group: "Counters & Furniture",
    priceRangeMin: 3500,
    priceRangeMax: 6000,
    recommendedQtyFor1000sqft: 4,
    isEssential: true,
    imageUrl: "https://placehold.co/300x300?text=Storage+Rack",
  },
  {
    id: "sign-fascia",
    name: "Fascia Signboard (Illuminated)",
    description: "Backlit acrylic fascia board for storefront. Includes store name cutout with LED illumination. Custom-sized.",
    group: "Branding & Signage",
    priceRangeMin: 12000,
    priceRangeMax: 25000,
    recommendedQtyFor1000sqft: 1,
    isEssential: true,
    imageUrl: "https://placehold.co/300x300?text=Fascia+Signboard",
  },
  {
    id: "sign-interior-branding",
    name: "Interior Wall Branding Graphics",
    description: "Vinyl wall wrap graphics for brand wall and entrance zone. Includes brand colors, logo, and tagline.",
    group: "Branding & Signage",
    priceRangeMin: 8000,
    priceRangeMax: 15000,
    recommendedQtyFor1000sqft: 1,
    isEssential: true,
    imageUrl: "https://placehold.co/300x300?text=Brand+Graphics",
  },
  {
    id: "sign-price-tags",
    name: "Price Tag Display Holders",
    description: "Snap-in acrylic label holders for gondola shelf edges. Pack of 100 holders in standard sizes.",
    group: "Branding & Signage",
    priceRangeMin: 800,
    priceRangeMax: 1500,
    recommendedQtyFor1000sqft: 3,
    isEssential: true,
    imageUrl: "https://placehold.co/300x300?text=Price+Tag+Holders",
  },
  {
    id: "light-track",
    name: "LED Track Lighting System",
    description: "Adjustable LED track lights for product spotlighting. 3000K warm white. 3-meter track with 4 spotlights.",
    group: "Lighting",
    priceRangeMin: 4000,
    priceRangeMax: 8000,
    recommendedQtyFor1000sqft: 6,
    isEssential: true,
    imageUrl: "https://placehold.co/300x300?text=Track+Lights",
  },
  {
    id: "light-ceiling",
    name: "LED Panel Light (Ceiling)",
    description: "600×600mm LED flush panel for general illumination. 40W, 4000K neutral white, flicker-free driver.",
    group: "Lighting",
    priceRangeMin: 1200,
    priceRangeMax: 2500,
    recommendedQtyFor1000sqft: 12,
    isEssential: true,
    imageUrl: "https://placehold.co/300x300?text=LED+Panel",
  },
  {
    id: "light-signage",
    name: "LED Sign Light Strip",
    description: "Waterproof LED strip for under-shelf and signage backlighting. 5m roll, warm white, adhesive backed.",
    group: "Lighting",
    priceRangeMin: 500,
    priceRangeMax: 1200,
    recommendedQtyFor1000sqft: 8,
    isEssential: false,
    imageUrl: "https://placehold.co/300x300?text=LED+Strip",
  },
  {
    id: "security-cctv",
    name: "CCTV Camera System (4-Channel)",
    description: "4-channel DVR with 4 dome cameras, 1TB HDD, night vision. Covers entrance, aisles, and checkout.",
    group: "Security",
    priceRangeMin: 12000,
    priceRangeMax: 20000,
    recommendedQtyFor1000sqft: 1,
    isEssential: true,
    imageUrl: "https://placehold.co/300x300?text=CCTV+System",
  },
  {
    id: "security-eas",
    name: "EAS Anti-Theft System",
    description: "RF 8.2MHz EAS pedestals for store entrance. Includes deactivation pad and 500 soft tags.",
    group: "Security",
    priceRangeMin: 18000,
    priceRangeMax: 30000,
    recommendedQtyFor1000sqft: 1,
    isEssential: false,
    imageUrl: "https://placehold.co/300x300?text=EAS+System",
  },
  {
    id: "security-safe",
    name: "Cash Safe Box",
    description: "Electronic keypad cash safe, 30L capacity. Wall-mountable with anchor kit, anti-pry construction.",
    group: "Security",
    priceRangeMin: 5000,
    priceRangeMax: 9000,
    recommendedQtyFor1000sqft: 1,
    isEssential: true,
    imageUrl: "https://placehold.co/300x300?text=Cash+Safe",
  },
];

export const SETUP_ITEM_GROUPS: SetupItemGroup[] = [
  "Shelving & Display",
  "Technology & Hardware",
  "Counters & Furniture",
  "Branding & Signage",
  "Lighting",
  "Security",
];

export const STORE_SIZES: StoreSizeSqFt[] = [500, 800, 1000];

export const STORE_SIZE_SCALE: Record<StoreSizeSqFt, number> = {
  500: 0.5,
  800: 0.8,
  1000: 1.0,
};

export function getRecommendedQty(item: SetupItem, storeSize: StoreSizeSqFt): number {
  const base = item.recommendedQtyFor1000sqft;
  const scale = STORE_SIZE_SCALE[storeSize];
  return Math.max(1, Math.round(base * scale));
}

export function storeSizeFromArea(area: number | null | undefined): StoreSizeSqFt {
  if (!area) return 1000;
  if (area <= 650) return 500;
  if (area <= 900) return 800;
  return 1000;
}

export const BRAND_COLORS = [
  { name: "Brand Orange", hex: "#F97316", usage: "Primary – CTAs, headers, accent elements" },
  { name: "Warm White", hex: "#FFF8F3", usage: "Background – Store walls, ceiling" },
  { name: "Charcoal", hex: "#1C1C1E", usage: "Text – Signage, pricing boards" },
  { name: "Light Grey", hex: "#F3F4F6", usage: "Neutral – Fixtures, shelving frames" },
  { name: "Gold Accent", hex: "#D4A017", usage: "Premium – Feature wall, seasonal highlights" },
];
