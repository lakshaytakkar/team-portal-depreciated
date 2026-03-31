export type ProductSource =
  | "china_haoduobao"
  | "china_allen"
  | "india_deodap"
  | "india_wholesaledock"
  | "india_basketo"
  | "india_other";

export type ProductComplianceStatus = "safe" | "restricted" | "banned";
export type ProductLabelStatus = "english" | "chinese" | "needs_relabel";
export type ProductTag = "Bestseller" | "New Arrival" | "Recommended" | "Seasonal" | "High Margin" | "Fast Mover";

export interface CatalogProduct {
  id: string;
  name: string;
  description: string;
  zoneId?: string;
  categoryId?: string;
  subcategoryId?: string;
  barcode?: string;
  imageUrl?: string;
  tags: ProductTag[];
  source: ProductSource;
  supplierName: string;
  exwPriceYuan?: number;
  wholesalePriceInr?: number;
  moq: number;
  unitsPerCarton: number;
  cartonLengthCm: number;
  cartonWidthCm: number;
  cartonHeightCm: number;
  landedCostInr?: number;
  partnerPriceInr?: number;
  suggestedMrp?: number;
  marginPercent?: number;
  complianceStatus?: ProductComplianceStatus;
  bisRequired: boolean;
  complianceNotes?: string;
  labelStatus: ProductLabelStatus;
}

export interface CatalogSubcategory {
  id: string;
  name: string;
  description?: string;
}

export interface CatalogCategory {
  id: string;
  name: string;
  description?: string;
  subcategories: CatalogSubcategory[];
}

export interface CatalogZone {
  id: string;
  name: string;
  icon: string;
  description?: string;
  categories: CatalogCategory[];
}

export const CATALOG_ZONE_TREE: CatalogZone[] = [
  {
    id: "kitchen",
    name: "Kitchen Zone",
    icon: "🍳",
    description: "Cookware, storage, and dining essentials",
    categories: [
      {
        id: "cooking-utensils",
        name: "Cooking Utensils",
        description: "Pans, woks, spatulas, and chopping tools for everyday cooking",
        subcategories: [
          { id: "pans-woks", name: "Pans & Woks", description: "Non-stick and carbon-steel pans and woks" },
          { id: "tools-spatulas", name: "Tools & Spatulas", description: "Flippers, ladles, and kitchen helpers" },
          { id: "choppers-graters", name: "Choppers & Graters", description: "Vegetable choppers and multi-graters" },
        ],
      },
      {
        id: "storage-org",
        name: "Storage & Organization",
        description: "Containers, racks, and wraps to keep kitchens tidy",
        subcategories: [
          { id: "containers-boxes", name: "Containers & Boxes", description: "Airtight and stackable food containers" },
          { id: "racks-shelves", name: "Racks & Shelves", description: "Wall-mount and countertop organiser racks" },
          { id: "bags-wraps", name: "Bags & Wraps", description: "Zip-lock, vacuum, and reusable storage bags" },
        ],
      },
      {
        id: "dining",
        name: "Dining & Serveware",
        description: "Tiffins, bottles, and tableware for serving and dining",
        subcategories: [
          { id: "tiffin-bottles", name: "Tiffin & Bottles", description: "Insulated tiffins and water bottles" },
          { id: "cups-mugs", name: "Cups & Mugs", description: "Ceramic and stainless-steel cups and mugs" },
        ],
      },
    ],
  },
  {
    id: "personal-care",
    name: "Personal Care Zone",
    icon: "💆",
    description: "Skincare, haircare, and body care products",
    categories: [
      {
        id: "skincare",
        name: "Skincare",
        description: "Face washes, creams, and moisturisers for daily skincare",
        subcategories: [
          { id: "face-wash-cream", name: "Face Wash & Cream", description: "Cleansers and face creams" },
          { id: "moisturisers", name: "Moisturisers", description: "Day and night moisturising lotions" },
        ],
      },
      {
        id: "haircare",
        name: "Haircare",
        description: "Combs, brushes, and accessories for hair grooming",
        subcategories: [
          { id: "combs-brushes", name: "Combs & Brushes", description: "Detangling combs and styling brushes" },
          { id: "accessories", name: "Hair Accessories", description: "Clips, bands, and pins" },
        ],
      },
      {
        id: "bath-body",
        name: "Bath & Body",
        description: "Soaps, loofahs, and bath-time essentials",
        subcategories: [
          { id: "soap-shower", name: "Soap & Shower", description: "Bar soaps and shower gels" },
          { id: "loofahs-scrubs", name: "Loofahs & Scrubs", description: "Exfoliating loofahs and body scrubs" },
        ],
      },
    ],
  },
  {
    id: "stationery",
    name: "Stationery Zone",
    icon: "✏️",
    description: "Writing tools, office supplies, and art materials",
    categories: [
      {
        id: "writing-tools",
        name: "Writing Tools",
        description: "Pens, markers, pencils, and erasers for writing and drawing",
        subcategories: [
          { id: "pens-markers", name: "Pens & Markers", description: "Ball-point, gel, and whiteboard markers" },
          { id: "pencils-erasers", name: "Pencils & Erasers", description: "HB pencils, colour pencils, and erasers" },
        ],
      },
      {
        id: "office-supplies",
        name: "Office Supplies",
        description: "Notebooks, desk organisers, and labelling essentials",
        subcategories: [
          { id: "notebooks-pads", name: "Notebooks & Pads", description: "Spiral, hardcover, and A4 writing pads" },
          { id: "desk-organisers", name: "Desk Organisers", description: "Pen holders, trays, and file organisers" },
          { id: "sticky-notes", name: "Sticky Notes & Labels", description: "Post-it notes and label stickers" },
        ],
      },
      {
        id: "art-craft",
        name: "Art & Craft",
        description: "Colours, paints, and DIY craft kits",
        subcategories: [
          { id: "colour-paint", name: "Colour & Paint", description: "Acrylic paints and colouring sets" },
          { id: "craft-kits", name: "Craft Kits", description: "DIY jewellery, origami, and decoupage kits" },
        ],
      },
    ],
  },
  {
    id: "home-decor",
    name: "Home Decor Zone",
    icon: "🏮",
    description: "Wall art, indoor decor, and lighting",
    categories: [
      {
        id: "wall-art",
        name: "Wall Art",
        description: "Frames, posters, and handcrafted wall hangings",
        subcategories: [
          { id: "frames-posters", name: "Frames & Posters", description: "Photo frames and decorative poster prints" },
          { id: "macrame-hangings", name: "Macramé & Hangings", description: "Handmade macramé and woven wall décor" },
        ],
      },
      {
        id: "indoor-decor",
        name: "Indoor Decor",
        description: "Planters, candles, diffusers, and table-top accessories",
        subcategories: [
          { id: "planters-pots", name: "Planters & Pots", description: "Ceramic and plastic indoor plant pots" },
          { id: "candles-diffusers", name: "Candles & Diffusers", description: "Scented candles and reed diffusers" },
          { id: "clocks", name: "Clocks", description: "Wall clocks and desk clocks" },
        ],
      },
      {
        id: "lighting",
        name: "Lighting",
        description: "LED strips and fairy lights for ambient home lighting",
        subcategories: [
          { id: "led-lights", name: "LED Lights & Strips", description: "Smart and colour-changing LED strips" },
          { id: "fairy-lights", name: "Fairy Lights", description: "Battery and USB-powered fairy string lights" },
        ],
      },
    ],
  },
  {
    id: "bags-storage",
    name: "Bags & Storage Zone",
    icon: "👜",
    description: "Travel bags, everyday bags, and storage solutions",
    categories: [
      {
        id: "travel-bags",
        name: "Travel Bags",
        description: "Duffel bags, trolleys, and backpacks for travel",
        subcategories: [
          { id: "duffel-trolley", name: "Duffel & Trolley", description: "Wheeled trolley bags and duffel carry-ons" },
          { id: "backpacks", name: "Backpacks", description: "Anti-theft and travel backpacks" },
        ],
      },
      {
        id: "everyday-bags",
        name: "Everyday Bags",
        description: "Tote bags, shoulder bags, and pouches for daily use",
        subcategories: [
          { id: "tote-shoulder", name: "Tote & Shoulder", description: "Canvas and leather-look totes and shoulder bags" },
          { id: "pouches-wallets", name: "Pouches & Wallets", description: "Zip pouches and slim wallets" },
        ],
      },
      {
        id: "storage-solutions",
        name: "Storage Solutions",
        description: "Under-bed boxes and laundry baskets for home storage",
        subcategories: [
          { id: "underbed-boxes", name: "Under-Bed Boxes", description: "Collapsible under-bed storage boxes" },
          { id: "laundry-baskets", name: "Laundry Baskets", description: "Foldable and wicker laundry baskets" },
        ],
      },
    ],
  },
  {
    id: "toys-games",
    name: "Toys & Games Zone",
    icon: "🎮",
    description: "Kids toys, fidgets, and educational games",
    categories: [
      {
        id: "kids-toys",
        name: "Kids Toys",
        description: "Building blocks, drawing boards, and outdoor play toys",
        subcategories: [
          { id: "building-blocks", name: "Building Blocks", description: "Lego-style and magnetic building sets" },
          { id: "drawing-boards", name: "Drawing Boards", description: "LCD and magnetic drawing tablets" },
          { id: "outdoor-play", name: "Outdoor Play", description: "Frisbees, bubbles, and outdoor activity kits" },
        ],
      },
      {
        id: "fidgets-stress",
        name: "Fidgets & Stress",
        description: "Fidget spinners, cubes, and stress-relief squeeze toys",
        subcategories: [
          { id: "fidget-cubes", name: "Fidget Cubes & Spinners", description: "Multi-function fidget cubes and spinners" },
          { id: "squeeze-balls", name: "Squeeze Balls", description: "Squishy and stress-relief squeeze toys" },
        ],
      },
      {
        id: "educational",
        name: "Educational",
        description: "STEM kits and flashcards for learning through play",
        subcategories: [
          { id: "stem-kits", name: "STEM Kits", description: "Science and engineering experiment kits" },
          { id: "flashcards", name: "Flashcards & Learning", description: "Alphabet, number, and vocabulary flashcards" },
        ],
      },
    ],
  },
  {
    id: "gifts-novelty",
    name: "Gifts & Novelty Zone",
    icon: "🎁",
    description: "Gift sets, seasonal items, and novelty products",
    categories: [
      {
        id: "gift-sets",
        name: "Gift Sets",
        description: "Curated combo packs and gift boxes for all occasions",
        subcategories: [
          { id: "combo-packs", name: "Combo Packs", description: "Multi-item bundled gift combos" },
          { id: "gift-boxes", name: "Gift Boxes & Wrapping", description: "Decorative gift boxes and wrapping supplies" },
        ],
      },
      {
        id: "seasonal",
        name: "Seasonal",
        description: "Festive and back-to-school seasonal collections",
        subcategories: [
          { id: "festive-diwali", name: "Festive & Diwali", description: "Diwali diyas, rangoli, and festive kits" },
          { id: "back-to-school", name: "Back to School", description: "Stationery and bag kits for school season" },
        ],
      },
      {
        id: "novelty",
        name: "Novelty & Fun",
        description: "Quirky gadgets and novelty items for gifting",
        subcategories: [
          { id: "gadgets-novelty", name: "Gadget Novelty", description: "Mini gadgets and novelty tech accessories" },
          { id: "funny-gifts", name: "Funny & Quirky", description: "Humorous and unique novelty gift items" },
        ],
      },
    ],
  },
];

export const CATALOG_PRODUCTS: CatalogProduct[] = [
  {
    id: "PRD-001", name: "Non-Stick Granite Frying Pan 26cm", description: "PFOA-free granite coated, induction ready, cool-touch handle", zoneId: "kitchen", categoryId: "cooking-utensils", subcategoryId: "pans-woks", barcode: "8901234567890", tags: ["Bestseller", "Fast Mover"], source: "china_haoduobao", supplierName: "Haoduobao Industrial", exwPriceYuan: 28, moq: 12, unitsPerCarton: 6, cartonLengthCm: 60, cartonWidthCm: 50, cartonHeightCm: 40, landedCostInr: 520, partnerPriceInr: 650, suggestedMrp: 999, marginPercent: 35, complianceStatus: "safe", bisRequired: false, labelStatus: "needs_relabel",
  },
  {
    id: "PRD-002", name: "Silicone Kitchen Tool Set 6pc", description: "Heat resistant to 230°C, includes spatula, ladle, tongs, whisk", zoneId: "kitchen", categoryId: "cooking-utensils", subcategoryId: "tools-spatulas", barcode: "8901234567891", tags: ["Recommended"], source: "china_haoduobao", supplierName: "Haoduobao Industrial", exwPriceYuan: 18, moq: 12, unitsPerCarton: 12, cartonLengthCm: 40, cartonWidthCm: 30, cartonHeightCm: 30, landedCostInr: 360, partnerPriceInr: 450, suggestedMrp: 699, marginPercent: 36, complianceStatus: "safe", bisRequired: false, labelStatus: "needs_relabel",
  },
  {
    id: "PRD-003", name: "Electric Vegetable Chopper 350W", description: "Mini food chopper, 2-blade, 500ml bowl, easy to clean", zoneId: "kitchen", categoryId: "cooking-utensils", subcategoryId: "choppers-graters", barcode: "8901234567892", tags: ["High Margin"], source: "china_haoduobao", supplierName: "Haoduobao Industrial", exwPriceYuan: 45, moq: 6, unitsPerCarton: 4, cartonLengthCm: 50, cartonWidthCm: 40, cartonHeightCm: 40, landedCostInr: 820, partnerPriceInr: 1025, suggestedMrp: 1599, marginPercent: 36, complianceStatus: "safe", bisRequired: true, complianceNotes: "BIS required for electrical appliances", labelStatus: "chinese",
  },
  {
    id: "PRD-004", name: "Stackable Food Storage Containers 5pc", description: "Airtight BPA-free containers, microwave safe, 3 sizes", zoneId: "kitchen", categoryId: "storage-org", subcategoryId: "containers-boxes", barcode: "8901234567893", tags: ["Bestseller", "Recommended"], source: "china_haoduobao", supplierName: "Haoduobao Industrial", exwPriceYuan: 22, moq: 12, unitsPerCarton: 8, cartonLengthCm: 45, cartonWidthCm: 35, cartonHeightCm: 35, landedCostInr: 420, partnerPriceInr: 525, suggestedMrp: 799, marginPercent: 34, complianceStatus: "safe", bisRequired: false, labelStatus: "needs_relabel",
  },
  {
    id: "PRD-005", name: "Rotating Kitchen Rack Organiser", description: "360° rotating rack, 3 tiers, holds spices and bottles", zoneId: "kitchen", categoryId: "storage-org", subcategoryId: "racks-shelves", barcode: "8901234567894", tags: ["Fast Mover"], source: "china_haoduobao", supplierName: "Haoduobao Industrial", exwPriceYuan: 32, moq: 6, unitsPerCarton: 6, cartonLengthCm: 40, cartonWidthCm: 40, cartonHeightCm: 50, landedCostInr: 600, partnerPriceInr: 750, suggestedMrp: 1199, marginPercent: 37, complianceStatus: "safe", bisRequired: false, labelStatus: "chinese",
  },
  {
    id: "PRD-006", name: "Stainless Steel Tiffin Box 3-Tier", description: "Insulated, leak-proof lid, carry bag included, BPA-free", zoneId: "kitchen", categoryId: "dining", subcategoryId: "tiffin-bottles", barcode: "8901234567895", tags: ["Bestseller"], source: "india_deodap", supplierName: "Deodap", wholesalePriceInr: 180, moq: 12, unitsPerCarton: 12, cartonLengthCm: 40, cartonWidthCm: 30, cartonHeightCm: 40, landedCostInr: 216, partnerPriceInr: 270, suggestedMrp: 399, marginPercent: 32, complianceStatus: "safe", bisRequired: false, labelStatus: "english",
  },
  {
    id: "PRD-007", name: "Borosilicate Glass Water Bottle 750ml", description: "Heat-resistant glass, bamboo lid, silicone sleeve, eco-friendly", zoneId: "kitchen", categoryId: "dining", subcategoryId: "tiffin-bottles", barcode: "8901234567896", tags: ["Recommended", "High Margin"], source: "india_deodap", supplierName: "Deodap", wholesalePriceInr: 145, moq: 12, unitsPerCarton: 12, cartonLengthCm: 35, cartonWidthCm: 25, cartonHeightCm: 40, landedCostInr: 174, partnerPriceInr: 218, suggestedMrp: 349, marginPercent: 37, complianceStatus: "safe", bisRequired: false, labelStatus: "english",
  },
  {
    id: "PRD-008", name: "Ceramic Mug Set 4pc", description: "Nordic design, dishwasher safe, 330ml, assorted colours", zoneId: "kitchen", categoryId: "dining", subcategoryId: "cups-mugs", barcode: "8901234567897", tags: ["Seasonal", "Recommended"], source: "china_haoduobao", supplierName: "Haoduobao Industrial", exwPriceYuan: 20, moq: 12, unitsPerCarton: 8, cartonLengthCm: 35, cartonWidthCm: 30, cartonHeightCm: 30, landedCostInr: 380, partnerPriceInr: 475, suggestedMrp: 749, marginPercent: 37, complianceStatus: "safe", bisRequired: false, labelStatus: "needs_relabel",
  },
  {
    id: "PRD-009", name: "Reusable Silicone Food Bags 3pc", description: "Freezer safe, microwave safe, leakproof zip, eco alternative", zoneId: "kitchen", categoryId: "storage-org", subcategoryId: "bags-wraps", barcode: "8901234567898", tags: ["New Arrival"], source: "china_allen", supplierName: "Allen Exports", exwPriceYuan: 15, moq: 24, unitsPerCarton: 12, cartonLengthCm: 30, cartonWidthCm: 20, cartonHeightCm: 20, landedCostInr: 290, partnerPriceInr: 362, suggestedMrp: 549, marginPercent: 34, complianceStatus: "safe", bisRequired: false, labelStatus: "chinese",
  },
  {
    id: "PRD-010", name: "Vacuum Food Sealer Bags 50pc", description: "BPA-free, compatible with all vacuum sealers, pre-cut 20×30cm", zoneId: "kitchen", categoryId: "storage-org", subcategoryId: "bags-wraps", barcode: "8901234567899", tags: ["Fast Mover"], source: "china_allen", supplierName: "Allen Exports", exwPriceYuan: 10, moq: 24, unitsPerCarton: 24, cartonLengthCm: 30, cartonWidthCm: 20, cartonHeightCm: 25, landedCostInr: 195, partnerPriceInr: 244, suggestedMrp: 399, marginPercent: 39, complianceStatus: "safe", bisRequired: false, labelStatus: "english",
  },
  {
    id: "PRD-011", name: "Face Wash Foam Cleanser 100ml", description: "Oil control, deep cleanse, suitable for all skin types", zoneId: "personal-care", categoryId: "skincare", subcategoryId: "face-wash-cream", barcode: "8901234567900", tags: ["Bestseller"], source: "india_deodap", supplierName: "Deodap", wholesalePriceInr: 65, moq: 24, unitsPerCarton: 24, cartonLengthCm: 30, cartonWidthCm: 20, cartonHeightCm: 30, landedCostInr: 78, partnerPriceInr: 98, suggestedMrp: 149, marginPercent: 34, complianceStatus: "safe", bisRequired: false, labelStatus: "english",
  },
  {
    id: "PRD-012", name: "Daily Moisturiser SPF15 50ml", description: "Lightweight formula, broad-spectrum SPF15, non-greasy", zoneId: "personal-care", categoryId: "skincare", subcategoryId: "moisturisers", barcode: "8901234567901", tags: ["Recommended"], source: "india_deodap", supplierName: "Deodap", wholesalePriceInr: 78, moq: 24, unitsPerCarton: 24, cartonLengthCm: 25, cartonWidthCm: 20, cartonHeightCm: 25, landedCostInr: 94, partnerPriceInr: 118, suggestedMrp: 199, marginPercent: 41, complianceStatus: "safe", bisRequired: false, labelStatus: "english",
  },
  {
    id: "PRD-013", name: "Wide-Tooth Detangling Comb", description: "Anti-static, suitable for wet and dry hair, flexible teeth", zoneId: "personal-care", categoryId: "haircare", subcategoryId: "combs-brushes", barcode: "8901234567902", tags: ["Fast Mover"], source: "china_haoduobao", supplierName: "Haoduobao Industrial", exwPriceYuan: 3.5, moq: 50, unitsPerCarton: 50, cartonLengthCm: 30, cartonWidthCm: 20, cartonHeightCm: 20, landedCostInr: 72, partnerPriceInr: 90, suggestedMrp: 149, marginPercent: 40, complianceStatus: "safe", bisRequired: false, labelStatus: "needs_relabel",
  },
  {
    id: "PRD-014", name: "Satin Scrunchie Set 10pc", description: "Satin silk finish, gentle on hair, assorted colours", zoneId: "personal-care", categoryId: "haircare", subcategoryId: "accessories", barcode: "8901234567903", tags: ["Bestseller", "Fast Mover"], source: "china_haoduobao", supplierName: "Haoduobao Industrial", exwPriceYuan: 6, moq: 36, unitsPerCarton: 36, cartonLengthCm: 25, cartonWidthCm: 20, cartonHeightCm: 15, landedCostInr: 118, partnerPriceInr: 148, suggestedMrp: 249, marginPercent: 41, complianceStatus: "safe", bisRequired: false, labelStatus: "chinese",
  },
  {
    id: "PRD-015", name: "Loofah Bath Sponge Set 3pc", description: "Natural sisal loofah, exfoliating, eco-friendly, with hanging cord", zoneId: "personal-care", categoryId: "bath-body", subcategoryId: "loofahs-scrubs", barcode: "8901234567904", tags: ["Recommended"], source: "india_wholesaledock", supplierName: "Wholesaledock India", wholesalePriceInr: 45, moq: 36, unitsPerCarton: 36, cartonLengthCm: 30, cartonWidthCm: 20, cartonHeightCm: 20, landedCostInr: 54, partnerPriceInr: 68, suggestedMrp: 99, marginPercent: 31, complianceStatus: "safe", bisRequired: false, labelStatus: "english",
  },
  {
    id: "PRD-016", name: "Glycerin Soap Bar 6pc Pack", description: "Transparent glycerin, moisturising, floral fragrance, 75g each", zoneId: "personal-care", categoryId: "bath-body", subcategoryId: "soap-shower", barcode: "8901234567905", tags: ["Fast Mover"], source: "india_deodap", supplierName: "Deodap", wholesalePriceInr: 55, moq: 24, unitsPerCarton: 24, cartonLengthCm: 25, cartonWidthCm: 15, cartonHeightCm: 15, landedCostInr: 66, partnerPriceInr: 83, suggestedMrp: 129, marginPercent: 36, complianceStatus: "safe", bisRequired: false, labelStatus: "english",
  },
  {
    id: "PRD-017", name: "Gel Pen Set 12pc Multicolour", description: "0.5mm tip, smooth-flow ink, quick dry, ideal for students", zoneId: "stationery", categoryId: "writing-tools", subcategoryId: "pens-markers", barcode: "8901234567906", tags: ["Bestseller", "Fast Mover"], source: "china_haoduobao", supplierName: "Haoduobao Industrial", exwPriceYuan: 8, moq: 24, unitsPerCarton: 24, cartonLengthCm: 25, cartonWidthCm: 15, cartonHeightCm: 15, landedCostInr: 155, partnerPriceInr: 194, suggestedMrp: 299, marginPercent: 35, complianceStatus: "safe", bisRequired: false, labelStatus: "needs_relabel",
  },
  {
    id: "PRD-018", name: "Whiteboard Marker Set 8pc", description: "Low-odour, dry-erase, built-in eraser tip, vivid colours", zoneId: "stationery", categoryId: "writing-tools", subcategoryId: "pens-markers", barcode: "8901234567907", tags: ["Recommended"], source: "china_haoduobao", supplierName: "Haoduobao Industrial", exwPriceYuan: 9, moq: 24, unitsPerCarton: 24, cartonLengthCm: 25, cartonWidthCm: 15, cartonHeightCm: 15, landedCostInr: 172, partnerPriceInr: 215, suggestedMrp: 349, marginPercent: 38, complianceStatus: "safe", bisRequired: false, labelStatus: "needs_relabel",
  },
  {
    id: "PRD-019", name: "A5 Hardcover Dotted Notebook", description: "200 pages, elastic band closure, ribbon bookmark, premium paper", zoneId: "stationery", categoryId: "office-supplies", subcategoryId: "notebooks-pads", barcode: "8901234567908", tags: ["Recommended", "High Margin"], source: "india_wholesaledock", supplierName: "Wholesaledock India", wholesalePriceInr: 110, moq: 24, unitsPerCarton: 24, cartonLengthCm: 30, cartonWidthCm: 22, cartonHeightCm: 25, landedCostInr: 132, partnerPriceInr: 165, suggestedMrp: 249, marginPercent: 34, complianceStatus: "safe", bisRequired: false, labelStatus: "english",
  },
  {
    id: "PRD-020", name: "Bamboo Desk Organiser with Drawer", description: "Multi-compartment, 1 drawer, eco-friendly bamboo", zoneId: "stationery", categoryId: "office-supplies", subcategoryId: "desk-organisers", barcode: "8901234567909", tags: ["Recommended"], source: "china_allen", supplierName: "Allen Exports", exwPriceYuan: 25, moq: 6, unitsPerCarton: 4, cartonLengthCm: 45, cartonWidthCm: 35, cartonHeightCm: 30, landedCostInr: 470, partnerPriceInr: 588, suggestedMrp: 899, marginPercent: 35, complianceStatus: "safe", bisRequired: false, labelStatus: "chinese",
  },
  {
    id: "PRD-021", name: "Sticky Note Cube 500 Sheets", description: "Bright colours, repositionable adhesive, 76×76mm", zoneId: "stationery", categoryId: "office-supplies", subcategoryId: "sticky-notes", tags: ["Fast Mover"], source: "india_wholesaledock", supplierName: "Wholesaledock India", wholesalePriceInr: 48, moq: 36, unitsPerCarton: 36, cartonLengthCm: 30, cartonWidthCm: 20, cartonHeightCm: 20, landedCostInr: 58, partnerPriceInr: 73, suggestedMrp: 129, marginPercent: 43, complianceStatus: "safe", bisRequired: false, labelStatus: "english",
  },
  {
    id: "PRD-022", name: "Watercolour Paint Set 24 Colours", description: "Professional grade, semi-moist cakes, includes brush and palette", zoneId: "stationery", categoryId: "art-craft", subcategoryId: "colour-paint", barcode: "8901234567910", tags: ["New Arrival"], source: "china_haoduobao", supplierName: "Haoduobao Industrial", exwPriceYuan: 14, moq: 12, unitsPerCarton: 12, cartonLengthCm: 30, cartonWidthCm: 20, cartonHeightCm: 15, landedCostInr: 268, partnerPriceInr: 335, suggestedMrp: 499, marginPercent: 33, complianceStatus: "safe", bisRequired: false, labelStatus: "needs_relabel",
  },
  {
    id: "PRD-023", name: "Diamond Painting Kit 30×40cm", description: "Full drill canvas, 5D effect, includes all tools, beginner friendly", zoneId: "stationery", categoryId: "art-craft", subcategoryId: "craft-kits", barcode: "8901234567911", tags: ["Seasonal", "High Margin"], source: "china_haoduobao", supplierName: "Haoduobao Industrial", exwPriceYuan: 18, moq: 6, unitsPerCarton: 6, cartonLengthCm: 45, cartonWidthCm: 35, cartonHeightCm: 15, landedCostInr: 342, partnerPriceInr: 428, suggestedMrp: 699, marginPercent: 39, complianceStatus: "safe", bisRequired: false, labelStatus: "chinese",
  },
  {
    id: "PRD-024", name: "Macramé Wall Hanging 40cm", description: "Handcrafted, natural cotton cord, wooden dowel, bohemian style", zoneId: "home-decor", categoryId: "wall-art", subcategoryId: "macrame-hangings", barcode: "8901234567912", tags: ["Recommended", "Seasonal"], source: "india_basketo", supplierName: "Basketo", wholesalePriceInr: 165, moq: 12, unitsPerCarton: 6, cartonLengthCm: 50, cartonWidthCm: 40, cartonHeightCm: 20, landedCostInr: 198, partnerPriceInr: 248, suggestedMrp: 399, marginPercent: 38, complianceStatus: "safe", bisRequired: false, labelStatus: "english",
  },
  {
    id: "PRD-025", name: "Geometric Ceramic Succulent Pots 3pc", description: "White and gold finish, drainage holes, ideal for succulents", zoneId: "home-decor", categoryId: "indoor-decor", subcategoryId: "planters-pots", barcode: "8901234567913", tags: ["Recommended"], source: "china_allen", supplierName: "Allen Exports", exwPriceYuan: 22, moq: 6, unitsPerCarton: 4, cartonLengthCm: 35, cartonWidthCm: 30, cartonHeightCm: 30, landedCostInr: 415, partnerPriceInr: 519, suggestedMrp: 799, marginPercent: 35, complianceStatus: "safe", bisRequired: false, labelStatus: "chinese",
  },
  {
    id: "PRD-026", name: "Soy Wax Scented Candle 200g", description: "Vanilla-lavender fragrance, cotton wick, 45-hour burn, glass jar", zoneId: "home-decor", categoryId: "indoor-decor", subcategoryId: "candles-diffusers", barcode: "8901234567914", tags: ["Bestseller", "Seasonal"], source: "india_basketo", supplierName: "Basketo", wholesalePriceInr: 130, moq: 12, unitsPerCarton: 12, cartonLengthCm: 30, cartonWidthCm: 25, cartonHeightCm: 25, landedCostInr: 156, partnerPriceInr: 195, suggestedMrp: 299, marginPercent: 35, complianceStatus: "safe", bisRequired: false, labelStatus: "english",
  },
  {
    id: "PRD-027", name: "Silent Sweep Wall Clock 30cm", description: "Scandinavian minimal design, matte black frame, no tick noise", zoneId: "home-decor", categoryId: "indoor-decor", subcategoryId: "clocks", barcode: "8901234567915", tags: ["Fast Mover"], source: "china_allen", supplierName: "Allen Exports", exwPriceYuan: 28, moq: 6, unitsPerCarton: 4, cartonLengthCm: 40, cartonWidthCm: 40, cartonHeightCm: 20, landedCostInr: 525, partnerPriceInr: 656, suggestedMrp: 999, marginPercent: 34, complianceStatus: "safe", bisRequired: false, labelStatus: "needs_relabel",
  },
  {
    id: "PRD-028", name: "LED Strip Lights 5m RGB", description: "USB powered, app control, 16 million colours, adhesive backing", zoneId: "home-decor", categoryId: "lighting", subcategoryId: "led-lights", barcode: "8901234567916", tags: ["Bestseller", "New Arrival"], source: "china_haoduobao", supplierName: "Haoduobao Industrial", exwPriceYuan: 20, moq: 6, unitsPerCarton: 6, cartonLengthCm: 25, cartonWidthCm: 20, cartonHeightCm: 15, landedCostInr: 385, partnerPriceInr: 481, suggestedMrp: 749, marginPercent: 36, complianceStatus: "restricted", bisRequired: true, complianceNotes: "BIS mandatory for electrical items — ensure certification before listing", labelStatus: "chinese",
  },
  {
    id: "PRD-029", name: "LED Neon Sign Flex Light", description: "12 colours available, USB powered, room and event decor", zoneId: "home-decor", categoryId: "lighting", subcategoryId: "led-lights", barcode: "8901234567917", tags: ["Seasonal", "High Margin"], source: "china_allen", supplierName: "Allen Exports", exwPriceYuan: 35, moq: 4, unitsPerCarton: 4, cartonLengthCm: 40, cartonWidthCm: 30, cartonHeightCm: 15, landedCostInr: 650, partnerPriceInr: 813, suggestedMrp: 1299, marginPercent: 37, complianceStatus: "restricted", bisRequired: true, complianceNotes: "BIS certification required — do not list until certified", labelStatus: "chinese",
  },
  {
    id: "PRD-030", name: "Copper Fairy Lights 10m 100LED", description: "Warm white, battery + USB, waterproof IP44, indoor/outdoor", zoneId: "home-decor", categoryId: "lighting", subcategoryId: "fairy-lights", barcode: "8901234567918", tags: ["Seasonal", "Bestseller"], source: "china_haoduobao", supplierName: "Haoduobao Industrial", exwPriceYuan: 12, moq: 12, unitsPerCarton: 12, cartonLengthCm: 25, cartonWidthCm: 20, cartonHeightCm: 20, landedCostInr: 232, partnerPriceInr: 290, suggestedMrp: 449, marginPercent: 35, complianceStatus: "safe", bisRequired: false, labelStatus: "needs_relabel",
  },
  {
    id: "PRD-031", name: "Travel Duffel Bag 40L Waterproof", description: "Separate shoe compartment, wet pocket, fits overhead cabin", zoneId: "bags-storage", categoryId: "travel-bags", subcategoryId: "duffel-trolley", barcode: "8901234567919", tags: ["Bestseller"], source: "china_allen", supplierName: "Allen Exports", exwPriceYuan: 42, moq: 4, unitsPerCarton: 4, cartonLengthCm: 55, cartonWidthCm: 35, cartonHeightCm: 30, landedCostInr: 780, partnerPriceInr: 975, suggestedMrp: 1499, marginPercent: 35, complianceStatus: "safe", bisRequired: false, labelStatus: "chinese",
  },
  {
    id: "PRD-032", name: "Anti-Theft Backpack 25L", description: "Hidden zipper, USB charging port, laptop sleeve, waterproof", zoneId: "bags-storage", categoryId: "travel-bags", subcategoryId: "backpacks", barcode: "8901234567920", tags: ["High Margin", "Recommended"], source: "china_allen", supplierName: "Allen Exports", exwPriceYuan: 48, moq: 4, unitsPerCarton: 4, cartonLengthCm: 50, cartonWidthCm: 35, cartonHeightCm: 25, landedCostInr: 890, partnerPriceInr: 1113, suggestedMrp: 1799, marginPercent: 38, complianceStatus: "safe", bisRequired: false, labelStatus: "chinese",
  },
  {
    id: "PRD-033", name: "Jute Tote Bag with Zipper", description: "Natural jute, cotton lining, inner pocket, reusable, eco-friendly", zoneId: "bags-storage", categoryId: "everyday-bags", subcategoryId: "tote-shoulder", barcode: "8901234567921", tags: ["Recommended"], source: "india_basketo", supplierName: "Basketo", wholesalePriceInr: 88, moq: 24, unitsPerCarton: 12, cartonLengthCm: 40, cartonWidthCm: 30, cartonHeightCm: 25, landedCostInr: 106, partnerPriceInr: 133, suggestedMrp: 199, marginPercent: 33, complianceStatus: "safe", bisRequired: false, labelStatus: "english",
  },
  {
    id: "PRD-034", name: "Canvas Pouch Set 3pc", description: "Zipper closure, travel organiser set — small, medium, large", zoneId: "bags-storage", categoryId: "everyday-bags", subcategoryId: "pouches-wallets", barcode: "8901234567922", tags: ["Fast Mover"], source: "india_wholesaledock", supplierName: "Wholesaledock India", wholesalePriceInr: 72, moq: 24, unitsPerCarton: 24, cartonLengthCm: 30, cartonWidthCm: 20, cartonHeightCm: 15, landedCostInr: 86, partnerPriceInr: 108, suggestedMrp: 179, marginPercent: 40, complianceStatus: "safe", bisRequired: false, labelStatus: "english",
  },
  {
    id: "PRD-035", name: "Under-Bed Storage Box with Wheels", description: "100L flat box with lid and wheels, foldable, waterproof fabric", zoneId: "bags-storage", categoryId: "storage-solutions", subcategoryId: "underbed-boxes", barcode: "8901234567923", tags: ["Recommended"], source: "china_haoduobao", supplierName: "Haoduobao Industrial", exwPriceYuan: 30, moq: 4, unitsPerCarton: 2, cartonLengthCm: 65, cartonWidthCm: 45, cartonHeightCm: 30, landedCostInr: 580, partnerPriceInr: 725, suggestedMrp: 1099, marginPercent: 34, complianceStatus: "safe", bisRequired: false, labelStatus: "needs_relabel",
  },
  {
    id: "PRD-036", name: "Foldable Laundry Basket with Lid 60L", description: "Pop-up design, mesh body, easy to collapse when empty", zoneId: "bags-storage", categoryId: "storage-solutions", subcategoryId: "laundry-baskets", barcode: "8901234567924", tags: ["Fast Mover"], source: "india_deodap", supplierName: "Deodap", wholesalePriceInr: 160, moq: 6, unitsPerCarton: 4, cartonLengthCm: 45, cartonWidthCm: 40, cartonHeightCm: 40, landedCostInr: 192, partnerPriceInr: 240, suggestedMrp: 399, marginPercent: 40, complianceStatus: "safe", bisRequired: false, labelStatus: "english",
  },
  {
    id: "PRD-037", name: "Wooden Building Blocks 50pc", description: "Natural wood, non-toxic paint, smooth edges, storage bag, ages 2+", zoneId: "toys-games", categoryId: "kids-toys", subcategoryId: "building-blocks", barcode: "8901234567925", tags: ["Recommended"], source: "india_basketo", supplierName: "Basketo", wholesalePriceInr: 245, moq: 6, unitsPerCarton: 6, cartonLengthCm: 35, cartonWidthCm: 25, cartonHeightCm: 25, landedCostInr: 294, partnerPriceInr: 368, suggestedMrp: 549, marginPercent: 33, complianceStatus: "safe", bisRequired: false, labelStatus: "english",
  },
  {
    id: "PRD-038", name: "Magnetic Drawing Board Colourful", description: "Lock button to save drawings, ages 3+, wipe-clean surface", zoneId: "toys-games", categoryId: "kids-toys", subcategoryId: "drawing-boards", barcode: "8901234567926", tags: ["Bestseller", "Fast Mover"], source: "china_haoduobao", supplierName: "Haoduobao Industrial", exwPriceYuan: 16, moq: 12, unitsPerCarton: 6, cartonLengthCm: 40, cartonWidthCm: 30, cartonHeightCm: 15, landedCostInr: 308, partnerPriceInr: 385, suggestedMrp: 599, marginPercent: 36, complianceStatus: "safe", bisRequired: false, labelStatus: "needs_relabel",
  },
  {
    id: "PRD-039", name: "Badminton Set 4 Racket + Net", description: "Lightweight aluminium rackets, portable net, carry bag included", zoneId: "toys-games", categoryId: "kids-toys", subcategoryId: "outdoor-play", barcode: "8901234567927", tags: ["Seasonal"], source: "china_allen", supplierName: "Allen Exports", exwPriceYuan: 38, moq: 4, unitsPerCarton: 2, cartonLengthCm: 70, cartonWidthCm: 40, cartonHeightCm: 20, landedCostInr: 710, partnerPriceInr: 888, suggestedMrp: 1399, marginPercent: 37, complianceStatus: "safe", bisRequired: false, labelStatus: "needs_relabel",
  },
  {
    id: "PRD-040", name: "Bubble Pop Keychain Fidget", description: "Silicone infinite bubble pop, 8 bubbles, stress-relieving, washable", zoneId: "toys-games", categoryId: "fidgets-stress", subcategoryId: "fidget-cubes", barcode: "8901234567928", tags: ["Bestseller", "Fast Mover"], source: "china_haoduobao", supplierName: "Haoduobao Industrial", exwPriceYuan: 3, moq: 100, unitsPerCarton: 100, cartonLengthCm: 30, cartonWidthCm: 20, cartonHeightCm: 20, landedCostInr: 60, partnerPriceInr: 75, suggestedMrp: 129, marginPercent: 42, complianceStatus: "safe", bisRequired: false, labelStatus: "needs_relabel",
  },
  {
    id: "PRD-041", name: "Mini Stress Relief Ball Set 3pc", description: "Squishy beaded mesh balls, soft, anxiety and focus aid, mixed colours", zoneId: "toys-games", categoryId: "fidgets-stress", subcategoryId: "squeeze-balls", barcode: "8901234567929", tags: ["Fast Mover"], source: "china_haoduobao", supplierName: "Haoduobao Industrial", exwPriceYuan: 5, moq: 50, unitsPerCarton: 50, cartonLengthCm: 25, cartonWidthCm: 20, cartonHeightCm: 20, landedCostInr: 98, partnerPriceInr: 123, suggestedMrp: 199, marginPercent: 38, complianceStatus: "safe", bisRequired: false, labelStatus: "needs_relabel",
  },
  {
    id: "PRD-042", name: "Solar System Science Kit", description: "Assemble and paint your own solar system model, STEM learning, ages 8+", zoneId: "toys-games", categoryId: "educational", subcategoryId: "stem-kits", barcode: "8901234567930", tags: ["New Arrival", "Recommended"], source: "india_basketo", supplierName: "Basketo", wholesalePriceInr: 220, moq: 6, unitsPerCarton: 6, cartonLengthCm: 35, cartonWidthCm: 25, cartonHeightCm: 20, landedCostInr: 264, partnerPriceInr: 330, suggestedMrp: 499, marginPercent: 34, complianceStatus: "safe", bisRequired: false, labelStatus: "english",
  },
  {
    id: "PRD-043", name: "Premium Gift Box Set (3 sizes)", description: "Gold foil, satin ribbon, tissue paper, matching greeting card", zoneId: "gifts-novelty", categoryId: "gift-sets", subcategoryId: "gift-boxes", barcode: "8901234567931", tags: ["Seasonal", "Bestseller"], source: "india_wholesaledock", supplierName: "Wholesaledock India", wholesalePriceInr: 85, moq: 24, unitsPerCarton: 24, cartonLengthCm: 30, cartonWidthCm: 25, cartonHeightCm: 20, landedCostInr: 102, partnerPriceInr: 128, suggestedMrp: 199, marginPercent: 36, complianceStatus: "safe", bisRequired: false, labelStatus: "english",
  },
  {
    id: "PRD-044", name: "Diwali Hamper Gift Set", description: "Diyas, sweets box, incense sticks, decorative bag — festive combo", zoneId: "gifts-novelty", categoryId: "seasonal", subcategoryId: "festive-diwali", barcode: "8901234567932", tags: ["Seasonal"], source: "india_other", supplierName: "Local Artisans", wholesalePriceInr: 280, moq: 6, unitsPerCarton: 4, cartonLengthCm: 40, cartonWidthCm: 35, cartonHeightCm: 30, landedCostInr: 336, partnerPriceInr: 420, suggestedMrp: 649, marginPercent: 35, complianceStatus: "safe", bisRequired: false, labelStatus: "english",
  },
  {
    id: "PRD-045", name: "Crystal Healing Stone Set 7pc", description: "Polished natural crystals, velvet pouch and ID card, popular gifting", zoneId: "gifts-novelty", categoryId: "novelty", subcategoryId: "funny-gifts", barcode: "8901234567933", tags: ["Recommended"], source: "india_deodap", supplierName: "Deodap", wholesalePriceInr: 190, moq: 12, unitsPerCarton: 12, cartonLengthCm: 25, cartonWidthCm: 20, cartonHeightCm: 15, landedCostInr: 228, partnerPriceInr: 285, suggestedMrp: 449, marginPercent: 37, complianceStatus: "safe", bisRequired: false, labelStatus: "english",
  },
  {
    id: "PRD-046", name: "Bluetooth Speaker Waterproof Mini", description: "IPX6, 8-hour battery, 360° sound, USB-C charge, clip mount", zoneId: "gifts-novelty", categoryId: "gift-sets", subcategoryId: "combo-packs", barcode: "8901234567934", tags: ["High Margin", "Bestseller"], source: "china_allen", supplierName: "Allen Exports", exwPriceYuan: 55, moq: 4, unitsPerCarton: 4, cartonLengthCm: 30, cartonWidthCm: 25, cartonHeightCm: 20, landedCostInr: 1020, partnerPriceInr: 1275, suggestedMrp: 1999, marginPercent: 36, complianceStatus: "restricted", bisRequired: true, complianceNotes: "BIS mandatory for wireless devices — CRS certification required", labelStatus: "chinese",
  },
  {
    id: "PRD-047", name: "Microfiber Cleaning Cloth 12pc Set", description: "300 GSM, 3 colours, ultra-soft, machine washable, all-purpose", zoneId: "kitchen", categoryId: "storage-org", subcategoryId: "bags-wraps", barcode: "8901234567935", tags: ["Fast Mover"], source: "india_deodap", supplierName: "Deodap", wholesalePriceInr: 95, moq: 24, unitsPerCarton: 24, cartonLengthCm: 30, cartonWidthCm: 20, cartonHeightCm: 15, landedCostInr: 114, partnerPriceInr: 143, suggestedMrp: 229, marginPercent: 38, complianceStatus: "safe", bisRequired: false, labelStatus: "english",
  },
  {
    id: "PRD-048", name: "Magnetic Fridge Spice Rack 6pc", description: "Neodymium magnets, clear lids, any fridge or magnetic surface", zoneId: "kitchen", categoryId: "storage-org", subcategoryId: "racks-shelves", barcode: "8901234567936", tags: ["Recommended"], source: "china_haoduobao", supplierName: "Haoduobao Industrial", exwPriceYuan: 16, moq: 12, unitsPerCarton: 6, cartonLengthCm: 35, cartonWidthCm: 25, cartonHeightCm: 20, landedCostInr: 308, partnerPriceInr: 385, suggestedMrp: 599, marginPercent: 36, complianceStatus: "safe", bisRequired: false, labelStatus: "chinese",
  },
  {
    id: "PRD-049", name: "Back-to-School Stationery Kit", description: "15-piece kit: pens, pencils, eraser, ruler, sharpener, pouch", zoneId: "stationery", categoryId: "office-supplies", subcategoryId: "notebooks-pads", barcode: "8901234567937", tags: ["Seasonal", "Fast Mover"], source: "india_wholesaledock", supplierName: "Wholesaledock India", wholesalePriceInr: 120, moq: 24, unitsPerCarton: 24, cartonLengthCm: 30, cartonWidthCm: 20, cartonHeightCm: 20, landedCostInr: 144, partnerPriceInr: 180, suggestedMrp: 299, marginPercent: 40, complianceStatus: "safe", bisRequired: false, labelStatus: "english",
  },
  {
    id: "PRD-050", name: "Aroma Diffuser 300ml with LED", description: "Ultrasonic, 7-colour night light, mist control, auto shut-off", zoneId: "home-decor", categoryId: "indoor-decor", subcategoryId: "candles-diffusers", barcode: "8901234567938", tags: ["Recommended", "High Margin"], source: "china_allen", supplierName: "Allen Exports", exwPriceYuan: 32, moq: 4, unitsPerCarton: 4, cartonLengthCm: 30, cartonWidthCm: 25, cartonHeightCm: 25, landedCostInr: 598, partnerPriceInr: 748, suggestedMrp: 1199, marginPercent: 38, complianceStatus: "restricted", bisRequired: true, complianceNotes: "BIS required for electrical items", labelStatus: "chinese",
  },
  {
    id: "PRD-051", name: "Laser Toy for Cats Interactive", description: "Random motion laser, USB rechargeable, auto shut-off, 3 patterns", zoneId: "gifts-novelty", categoryId: "novelty", subcategoryId: "gadgets-novelty", tags: ["New Arrival", "Fast Mover"], source: "china_haoduobao", supplierName: "Haoduobao Industrial", exwPriceYuan: 12, moq: 12, unitsPerCarton: 12, cartonLengthCm: 25, cartonWidthCm: 15, cartonHeightCm: 15, landedCostInr: 232, partnerPriceInr: 290, suggestedMrp: 449, marginPercent: 35, complianceStatus: "restricted", bisRequired: false, complianceNotes: "Class 2 laser — keep away from direct eye contact warning required on packaging", labelStatus: "chinese",
  },
  {
    id: "PRD-052", name: "Bamboo Bath Mat 60×40cm", description: "Non-slip rubber feet, drainage holes, quick-dry, eco-friendly", zoneId: "personal-care", categoryId: "bath-body", subcategoryId: "loofahs-scrubs", barcode: "8901234567939", tags: ["Recommended"], source: "china_haoduobao", supplierName: "Haoduobao Industrial", exwPriceYuan: 20, moq: 6, unitsPerCarton: 4, cartonLengthCm: 65, cartonWidthCm: 45, cartonHeightCm: 15, landedCostInr: 385, partnerPriceInr: 481, suggestedMrp: 749, marginPercent: 36, complianceStatus: "safe", bisRequired: false, labelStatus: "needs_relabel",
  },
  {
    id: "PRD-053", name: "Wall Photo Frame Collage 6-in-1", description: "Mixed size frames, black wood finish, includes hanging kit, A4+4R", zoneId: "home-decor", categoryId: "wall-art", subcategoryId: "frames-posters", barcode: "8901234567940", tags: ["Seasonal", "Recommended"], source: "india_other", supplierName: "Local Artisans", wholesalePriceInr: 380, moq: 4, unitsPerCarton: 2, cartonLengthCm: 65, cartonWidthCm: 50, cartonHeightCm: 20, landedCostInr: 456, partnerPriceInr: 570, suggestedMrp: 899, marginPercent: 37, complianceStatus: "safe", bisRequired: false, labelStatus: "english",
  },
  {
    id: "PRD-054", name: "Portable Mini Fan USB Rechargeable", description: "3-speed, 360° rotation base, whisper-quiet, 5000mAh battery", zoneId: "gifts-novelty", categoryId: "novelty", subcategoryId: "gadgets-novelty", barcode: "8901234567941", tags: ["Seasonal", "High Margin"], source: "china_allen", supplierName: "Allen Exports", exwPriceYuan: 22, moq: 6, unitsPerCarton: 6, cartonLengthCm: 25, cartonWidthCm: 20, cartonHeightCm: 25, landedCostInr: 415, partnerPriceInr: 519, suggestedMrp: 799, marginPercent: 35, complianceStatus: "safe", bisRequired: false, labelStatus: "chinese",
  },
  {
    id: "PRD-055", name: "RFID Blocking Slim Wallet", description: "Carbon fibre finish, holds 12 cards, aluminium case, click mechanism", zoneId: "bags-storage", categoryId: "everyday-bags", subcategoryId: "pouches-wallets", barcode: "8901234567942", tags: ["High Margin", "Recommended"], source: "china_allen", supplierName: "Allen Exports", exwPriceYuan: 18, moq: 12, unitsPerCarton: 12, cartonLengthCm: 25, cartonWidthCm: 15, cartonHeightCm: 15, landedCostInr: 340, partnerPriceInr: 425, suggestedMrp: 649, marginPercent: 35, complianceStatus: "safe", bisRequired: false, labelStatus: "chinese",
  },
  {
    id: "PRD-056", name: "Acupressure Foot Roller", description: "Stimulates pressure points, relieves fatigue, natural wood, portable", zoneId: "personal-care", categoryId: "bath-body", subcategoryId: "loofahs-scrubs", barcode: "8901234567943", tags: ["New Arrival"], source: "india_other", supplierName: "Local Artisans", wholesalePriceInr: 145, moq: 12, unitsPerCarton: 12, cartonLengthCm: 30, cartonWidthCm: 15, cartonHeightCm: 10, landedCostInr: 174, partnerPriceInr: 218, suggestedMrp: 349, marginPercent: 37, complianceStatus: "safe", bisRequired: false, labelStatus: "english",
  },
  {
    id: "PRD-057", name: "Remote Control Toy Car 2.4GHz", description: "1:20 scale, 4-wheel drive, 2.4GHz control, USB rechargeable", zoneId: "toys-games", categoryId: "kids-toys", subcategoryId: "outdoor-play", tags: ["Bestseller"], source: "china_haoduobao", supplierName: "Haoduobao Industrial", exwPriceYuan: 38, moq: 4, unitsPerCarton: 4, cartonLengthCm: 40, cartonWidthCm: 30, cartonHeightCm: 20, landedCostInr: 710, partnerPriceInr: 888, suggestedMrp: 1399, marginPercent: 37, complianceStatus: "banned", bisRequired: false, complianceNotes: "BANNED — 2.4GHz RC toys require WPC approval — remove from catalog", labelStatus: "chinese",
  },
  {
    id: "PRD-058", name: "Drone Mini Quadcopter Foldable", description: "360° flip, one-key return, headless mode, 15min flight time", zoneId: "toys-games", categoryId: "kids-toys", subcategoryId: "outdoor-play", barcode: "8901234567944", tags: [], source: "china_allen", supplierName: "Allen Exports", exwPriceYuan: 65, moq: 2, unitsPerCarton: 2, cartonLengthCm: 35, cartonWidthCm: 30, cartonHeightCm: 20, landedCostInr: 1200, partnerPriceInr: 1500, complianceStatus: "banned", bisRequired: false, complianceNotes: "BANNED — Drones require DGCA registration and WPC type approval — cannot sell without compliance", labelStatus: "chinese",
  },
  {
    id: "PRD-059", name: "Toy Walkie Talkie Set 2pc", description: "500m range, 22 channels, flashlight, kids 3+", zoneId: "toys-games", categoryId: "kids-toys", subcategoryId: "outdoor-play", barcode: "8901234567945", tags: ["Seasonal"], source: "china_haoduobao", supplierName: "Haoduobao Industrial", exwPriceYuan: 20, moq: 6, unitsPerCarton: 6, cartonLengthCm: 30, cartonWidthCm: 25, cartonHeightCm: 20, landedCostInr: 385, partnerPriceInr: 481, complianceStatus: "banned", bisRequired: false, complianceNotes: "BANNED — Walkie-talkies require WPC type approval — do not list or stock", labelStatus: "chinese",
  },
  {
    id: "PRD-060", name: "Copper Tongue Cleaner Set 2pc", description: "100% pure copper, U-shaped, ayurvedic design, reusable, antimicrobial", zoneId: "personal-care", categoryId: "bath-body", subcategoryId: "soap-shower", barcode: "8901234567946", tags: ["New Arrival", "Recommended"], source: "india_other", supplierName: "Local Artisans", wholesalePriceInr: 55, moq: 36, unitsPerCarton: 36, cartonLengthCm: 20, cartonWidthCm: 15, cartonHeightCm: 10, landedCostInr: 66, partnerPriceInr: 83, suggestedMrp: 129, marginPercent: 36, complianceStatus: "safe", bisRequired: false, labelStatus: "english",
  },
  {
    id: "PRD-061", name: "Peel-Off Nose Strips 12pc", description: "Deep cleanse pores, blackhead removal, moisturising formula", zoneId: "personal-care", categoryId: "skincare", subcategoryId: "face-wash-cream", tags: ["Fast Mover"], source: "india_deodap", supplierName: "Deodap", wholesalePriceInr: 38, moq: 48, unitsPerCarton: 48, cartonLengthCm: 25, cartonWidthCm: 15, cartonHeightCm: 15, landedCostInr: 46, partnerPriceInr: 58, suggestedMrp: 99, marginPercent: 41, complianceStatus: "safe", bisRequired: false, labelStatus: "english",
  },
  {
    id: "PRD-062", name: "Wooden Pencil Set 12pc HB", description: "Hexagonal barrel, premium graphite, pre-sharpened, eco-friendly", zoneId: "stationery", categoryId: "writing-tools", subcategoryId: "pencils-erasers", barcode: "8901234567947", tags: ["Fast Mover"], source: "india_wholesaledock", supplierName: "Wholesaledock India", wholesalePriceInr: 35, moq: 48, unitsPerCarton: 48, cartonLengthCm: 25, cartonWidthCm: 15, cartonHeightCm: 10, landedCostInr: 42, partnerPriceInr: 53, suggestedMrp: 79, marginPercent: 33, complianceStatus: "safe", bisRequired: false, labelStatus: "english",
  },
  {
    id: "PRD-063", name: "Adhesive Cable Clips 30pc Set", description: "Self-adhesive, strong hold, desk cable organiser, assorted sizes", zoneId: "home-decor", categoryId: "indoor-decor", subcategoryId: "clocks", barcode: "8901234567948", tags: ["Fast Mover"], source: "china_haoduobao", supplierName: "Haoduobao Industrial", exwPriceYuan: 4, moq: 50, unitsPerCarton: 50, cartonLengthCm: 20, cartonWidthCm: 15, cartonHeightCm: 10, landedCostInr: 78, partnerPriceInr: 98, suggestedMrp: 149, marginPercent: 34, complianceStatus: "safe", bisRequired: false, labelStatus: "needs_relabel",
  },
  {
    id: "PRD-064", name: "Plant Misting Spray Bottle 500ml", description: "Fine mist, transparent bottle, 360° nozzle, indoor plants", zoneId: "home-decor", categoryId: "indoor-decor", subcategoryId: "planters-pots", tags: ["Recommended"], source: "india_basketo", supplierName: "Basketo", wholesalePriceInr: 48, moq: 24, unitsPerCarton: 24, cartonLengthCm: 25, cartonWidthCm: 15, cartonHeightCm: 20, landedCostInr: 58, partnerPriceInr: 73, suggestedMrp: 129, marginPercent: 43, complianceStatus: "safe", bisRequired: false, labelStatus: "english",
  },
  {
    id: "PRD-065", name: "Abacus Bead Frame Learning Toy", description: "20-rod wooden abacus, maths learning, ages 3+, smooth beads", zoneId: "toys-games", categoryId: "educational", subcategoryId: "flashcards", barcode: "8901234567949", tags: ["Recommended"], source: "india_basketo", supplierName: "Basketo", wholesalePriceInr: 185, moq: 6, unitsPerCarton: 6, cartonLengthCm: 35, cartonWidthCm: 25, cartonHeightCm: 15, landedCostInr: 222, partnerPriceInr: 278, suggestedMrp: 449, marginPercent: 38, complianceStatus: "safe", bisRequired: false, labelStatus: "english",
  },
];

export function getProductsByZone(zoneId: string): CatalogProduct[] {
  return CATALOG_PRODUCTS.filter((p) => p.zoneId === zoneId);
}

export function getProductCountByZone(zoneId: string): number {
  return getProductsByZone(zoneId).length;
}

export function getProductCountByCategory(zoneId: string, categoryId: string): number {
  return CATALOG_PRODUCTS.filter((p) => p.zoneId === zoneId && p.categoryId === categoryId).length;
}

export function getProductCountBySubcategory(subcategoryId: string): number {
  return CATALOG_PRODUCTS.filter((p) => p.subcategoryId === subcategoryId).length;
}

export function getCatalogStats() {
  const total = CATALOG_PRODUCTS.length;
  const bySource: Record<string, number> = {};
  const byCompliance: Record<string, number> = { safe: 0, restricted: 0, banned: 0, undefined: 0 };
  let missingMrp = 0, missingBarcode = 0, missingCategory = 0, missingCompliance = 0;
  let totalMarginChina = 0, countChina = 0, totalMarginIndia = 0, countIndia = 0;

  for (const p of CATALOG_PRODUCTS) {
    bySource[p.source] = (bySource[p.source] || 0) + 1;
    const cs = p.complianceStatus ?? "undefined";
    byCompliance[cs] = (byCompliance[cs] || 0) + 1;
    if (!p.suggestedMrp) missingMrp++;
    if (!p.barcode) missingBarcode++;
    if (!p.zoneId) missingCategory++;
    if (!p.complianceStatus) missingCompliance++;
    if (p.marginPercent !== undefined) {
      if (p.source.startsWith("china_")) {
        totalMarginChina += p.marginPercent;
        countChina++;
      } else {
        totalMarginIndia += p.marginPercent;
        countIndia++;
      }
    }
  }

  return {
    total,
    bySource,
    compliance: byCompliance,
    missingMrp,
    missingBarcode,
    missingCategory,
    missingCompliance,
    avgMarginChina: countChina ? Math.round(totalMarginChina / countChina) : 0,
    avgMarginIndia: countIndia ? Math.round(totalMarginIndia / countIndia) : 0,
  };
}

export const SOURCE_LABELS: Record<ProductSource, string> = {
  china_haoduobao: "Haoduobao (China)",
  china_allen: "Allen (China)",
  india_deodap: "Deodap (India)",
  india_wholesaledock: "Wholesaledock (India)",
  india_basketo: "Basketo (India)",
  india_other: "Other (India)",
};

export const SOURCE_COLORS: Record<ProductSource, string> = {
  china_haoduobao: "bg-red-100 text-red-700",
  china_allen: "bg-orange-100 text-orange-700",
  india_deodap: "bg-blue-100 text-blue-700",
  india_wholesaledock: "bg-purple-100 text-purple-700",
  india_basketo: "bg-teal-100 text-teal-700",
  india_other: "bg-gray-100 text-gray-700",
};

export const ALL_PRODUCT_TAGS: ProductTag[] = ["Bestseller", "New Arrival", "Recommended", "Seasonal", "High Margin", "Fast Mover"];
