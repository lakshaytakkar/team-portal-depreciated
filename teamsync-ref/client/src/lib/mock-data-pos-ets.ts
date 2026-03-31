import type { PosProduct, PosBillItem, PosHeldBill, PosSale, StockStatus, MovementType, AdjustmentReason, InventoryItem, StockMovement, StockReceiveSession, StockReceiveItem, RegisterSession, ReturnRecord, ReturnItem, StoreSettings } from "@/types/pos-ets";
export type { PosProduct, PosBillItem, PosHeldBill, PosSale, StockStatus, MovementType, AdjustmentReason, InventoryItem, StockMovement, StockReceiveSession, StockReceiveItem, RegisterSession, ReturnRecord, ReturnItem, StoreSettings };


export const POS_STORE = {
  id: "store-001",
  name: "EazyToSell - Rajesh Store",
  address: "Shop 12, Kamla Nagar, New Delhi - 110007",
  gstin: "07AABCU9603R1ZP",
  phone: "+91 98110 45678",
  status: "active" as "active" | "setup" | "inactive",
  ownerName: "Rajesh Kumar",
  upiId: "eazytosell@upi",
};

export const PRODUCT_IMAGES: Record<string, string> = {
  p1: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=120&h=120&fit=crop&q=80",
  p2: "https://images.unsplash.com/photo-1507473885765-e6ed057ab6fe?w=120&h=120&fit=crop&q=80",
  p3: "https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=120&h=120&fit=crop&q=80",
  p4: "https://images.unsplash.com/photo-1620626011761-996317b8d101?w=120&h=120&fit=crop&q=80",
  p5: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=120&h=120&fit=crop&q=80",
  p6: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=120&h=120&fit=crop&q=80",
  p7: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=120&h=120&fit=crop&q=80",
  p8: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=120&h=120&fit=crop&q=80",
  p9: "https://images.unsplash.com/photo-1588412079929-790b9f593d8e?w=120&h=120&fit=crop&q=80",
  p10: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=120&h=120&fit=crop&q=80",
  p11: "https://images.unsplash.com/photo-1601524909162-ae8725290836?w=120&h=120&fit=crop&q=80",
  p12: "https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=120&h=120&fit=crop&q=80",
  p13: "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=120&h=120&fit=crop&q=80",
  p14: "https://images.unsplash.com/photo-1563453392212-326f5e854473?w=120&h=120&fit=crop&q=80",
  p15: "https://images.unsplash.com/photo-1474722883778-792e7990302f?w=120&h=120&fit=crop&q=80",
  p16: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=120&h=120&fit=crop&q=80",
  p17: "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=120&h=120&fit=crop&q=80",
  p18: "https://images.unsplash.com/photo-1513519245088-0e12902e35ca?w=120&h=120&fit=crop&q=80",
  p19: "https://images.unsplash.com/photo-1620626011761-996317b8d101?w=120&h=120&fit=crop&q=80",
  p20: "https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=120&h=120&fit=crop&q=80",
};

export function getProductImage(productId: string): string | null {
  return PRODUCT_IMAGES[productId] ?? null;
}

export const POS_PRODUCTS: PosProduct[] = [
  { id: "p1", name: "Kitchen Organizer Set", barcode: "8901234567890", mrp: 599, category: "Kitchen", image: PRODUCT_IMAGES.p1, inStock: 45 },
  { id: "p2", name: "LED Desk Lamp", barcode: "8901234567891", mrp: 899, category: "Electronics", image: PRODUCT_IMAGES.p2, inStock: 30 },
  { id: "p3", name: "Wall Clock Modern", barcode: "8901234567892", mrp: 1299, category: "Decor", image: PRODUCT_IMAGES.p3, inStock: 20 },
  { id: "p4", name: "Bathroom Caddy", barcode: "8901234567893", mrp: 449, category: "Bathroom", image: PRODUCT_IMAGES.p4, inStock: 55 },
  { id: "p5", name: "Spice Rack 3-Tier", barcode: "8901234567894", mrp: 349, category: "Kitchen", image: PRODUCT_IMAGES.p5, inStock: 60 },
  { id: "p6", name: "Cushion Cover Set (5)", barcode: "8901234567895", mrp: 799, category: "Home", image: PRODUCT_IMAGES.p6, inStock: 35 },
  { id: "p7", name: "Phone Stand Bamboo", barcode: "8901234567896", mrp: 299, category: "Accessories", image: PRODUCT_IMAGES.p7, inStock: 80 },
  { id: "p8", name: "Storage Box Set (3)", barcode: "8901234567897", mrp: 699, category: "Storage", image: PRODUCT_IMAGES.p8, inStock: 40 },
  { id: "p9", name: "Fridge Magnet Set", barcode: "8901234567898", mrp: 199, category: "Decor", image: PRODUCT_IMAGES.p9, inStock: 100 },
  { id: "p10", name: "Laundry Basket Foldable", barcode: "8901234567899", mrp: 549, category: "Home", image: PRODUCT_IMAGES.p10, inStock: 25 },
  { id: "p11", name: "Cable Organizer", barcode: "8901234567900", mrp: 249, category: "Electronics", image: PRODUCT_IMAGES.p11, inStock: 70 },
  { id: "p12", name: "Soap Dispenser Glass", barcode: "8901234567901", mrp: 399, category: "Bathroom", image: PRODUCT_IMAGES.p12, inStock: 50 },
  { id: "p13", name: "Key Holder Wall Mount", barcode: "8901234567902", mrp: 329, category: "Decor", image: PRODUCT_IMAGES.p13, inStock: 45 },
  { id: "p14", name: "Tissue Box Cover", barcode: "8901234567903", mrp: 279, category: "Home", image: PRODUCT_IMAGES.p14, inStock: 60 },
  { id: "p15", name: "Wine Glass Set (4)", barcode: "8901234567904", mrp: 1499, category: "Kitchen", image: PRODUCT_IMAGES.p15, inStock: 15 },
  { id: "p16", name: "Door Mat Premium", barcode: "8901234567905", mrp: 499, category: "Home", image: PRODUCT_IMAGES.p16, inStock: 40 },
  { id: "p17", name: "Pen Stand Wooden", barcode: "8901234567906", mrp: 349, category: "Accessories", image: PRODUCT_IMAGES.p17, inStock: 55 },
  { id: "p18", name: "Photo Frame Set (3)", barcode: "8901234567907", mrp: 899, category: "Decor", image: PRODUCT_IMAGES.p18, inStock: 30 },
  { id: "p19", name: "Towel Rack Steel", barcode: "8901234567908", mrp: 649, category: "Bathroom", image: PRODUCT_IMAGES.p19, inStock: 35 },
  { id: "p20", name: "Flower Vase Ceramic", barcode: "8901234567909", mrp: 799, category: "Decor", image: PRODUCT_IMAGES.p20, inStock: 20 },
];

export const QUICK_ADD_PRODUCTS = POS_PRODUCTS.slice(0, 8);

export const RECENT_SALES: PosSale[] = [
  {
    id: "s1",
    receiptNumber: "R-0001",
    storeId: "store-001",
    items: [
      { id: "i1", productId: "p1", name: "Kitchen Organizer Set", mrp: 599, quantity: 2, lineTotal: 1198, image: PRODUCT_IMAGES.p1 },
      { id: "i2", productId: "p7", name: "Phone Stand Bamboo", mrp: 299, quantity: 1, lineTotal: 299, image: PRODUCT_IMAGES.p7 },
    ],
    totalAmount: 1497,
    paymentMethod: "upi",
    timestamp: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "s2",
    receiptNumber: "R-0002",
    storeId: "store-001",
    items: [
      { id: "i3", productId: "p3", name: "Wall Clock Modern", mrp: 1299, quantity: 1, lineTotal: 1299, image: PRODUCT_IMAGES.p3 },
    ],
    totalAmount: 1299,
    paymentMethod: "cash",
    cashReceived: 1500,
    changeReturned: 201,
    timestamp: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: "s3",
    receiptNumber: "R-0003",
    storeId: "store-001",
    items: [
      { id: "i4", productId: "p6", name: "Cushion Cover Set (5)", mrp: 799, quantity: 3, lineTotal: 2397, image: PRODUCT_IMAGES.p6 },
      { id: "i5", productId: "p9", name: "Fridge Magnet Set", mrp: 199, quantity: 5, lineTotal: 995, image: PRODUCT_IMAGES.p9 },
    ],
    totalAmount: 3392,
    paymentMethod: "card",
    timestamp: new Date(Date.now() - 900000).toISOString(),
  },
];

let nextReceiptNum = 4;
export function getNextReceiptNumber(): string {
  const num = nextReceiptNum++;
  return `R-${String(num).padStart(4, "0")}`;
}

export const ADJUSTMENT_REASONS: Record<AdjustmentReason, string> = {
  "physical-count": "Physical count correction",
  "damaged": "Damaged and removed",
  "found-backroom": "Found in backroom",
  "lost-stolen": "Lost or stolen",
  "miscount-receive": "Miscounted during receive",
};

function daysAgo(d: number) {
  return new Date(Date.now() - d * 86400000).toISOString();
}

export const INVENTORY: InventoryItem[] = POS_PRODUCTS.map(p => ({
  productId: p.id,
  storeId: "store-001",
  currentStock: p.inStock,
  reorderThreshold: 5,
  costPrice: Math.round(p.mrp * 0.45),
  lastUpdated: daysAgo(Math.floor(Math.random() * 5)),
}));

INVENTORY[14] = { ...INVENTORY[14], currentStock: 0 };
INVENTORY[19] = { ...INVENTORY[19], currentStock: 0 };
INVENTORY[2]  = { ...INVENTORY[2],  currentStock: 3 };
INVENTORY[9]  = { ...INVENTORY[9],  currentStock: 2 };
INVENTORY[17] = { ...INVENTORY[17], currentStock: 4 };

export function getStockStatus(stock: number, threshold: number): StockStatus {
  if (stock <= 0) return "out";
  if (stock <= threshold) return "low";
  return "healthy";
}

export const STOCK_STATUS_CONFIG: Record<StockStatus, { label: string; color: string; bg: string }> = {
  healthy: { label: "In Stock",   color: "#059669", bg: "#d1fae5" },
  low:     { label: "Low Stock",  color: "#d97706", bg: "#fef3c7" },
  out:     { label: "Out of Stock", color: "#dc2626", bg: "#fee2e2" },
};

export const STOCK_MOVEMENTS: StockMovement[] = [
  { id: "m1", storeId: "store-001", productId: "p1", movementType: "sale", quantityChange: -2, referenceType: "receipt", referenceId: "R-0001", performedBy: "Cashier", timestamp: daysAgo(0) },
  { id: "m2", storeId: "store-001", productId: "p7", movementType: "sale", quantityChange: -1, referenceType: "receipt", referenceId: "R-0001", performedBy: "Cashier", timestamp: daysAgo(0) },
  { id: "m3", storeId: "store-001", productId: "p3", movementType: "sale", quantityChange: -1, referenceType: "receipt", referenceId: "R-0002", performedBy: "Cashier", timestamp: daysAgo(0) },
  { id: "m4", storeId: "store-001", productId: "p6", movementType: "sale", quantityChange: -3, referenceType: "receipt", referenceId: "R-0003", performedBy: "Cashier", timestamp: daysAgo(0) },
  { id: "m5", storeId: "store-001", productId: "p9", movementType: "sale", quantityChange: -5, referenceType: "receipt", referenceId: "R-0003", performedBy: "Cashier", timestamp: daysAgo(0) },
  { id: "m6", storeId: "store-001", productId: "p1", movementType: "receive", quantityChange: 24, referenceType: "stock-receive", referenceId: "SR-001", performedBy: "Rajesh Kumar", timestamp: daysAgo(2) },
  { id: "m7", storeId: "store-001", productId: "p2", movementType: "receive", quantityChange: 12, referenceType: "stock-receive", referenceId: "SR-001", performedBy: "Rajesh Kumar", timestamp: daysAgo(2) },
  { id: "m8", storeId: "store-001", productId: "p5", movementType: "receive", quantityChange: 30, referenceType: "stock-receive", referenceId: "SR-002", performedBy: "Rajesh Kumar", timestamp: daysAgo(5) },
  { id: "m9", storeId: "store-001", productId: "p8", movementType: "receive", quantityChange: 20, referenceType: "stock-receive", referenceId: "SR-002", performedBy: "Rajesh Kumar", timestamp: daysAgo(5) },
  { id: "m10", storeId: "store-001", productId: "p3", movementType: "adjustment", quantityChange: 3, referenceType: "adjustment", referenceId: "ADJ-001", reason: "Found in backroom", performedBy: "Rajesh Kumar", timestamp: daysAgo(3) },
  { id: "m11", storeId: "store-001", productId: "p15", movementType: "sale", quantityChange: -4, referenceType: "receipt", referenceId: "R-0005", performedBy: "Cashier", timestamp: daysAgo(1) },
  { id: "m12", storeId: "store-001", productId: "p15", movementType: "sale", quantityChange: -6, referenceType: "receipt", referenceId: "R-0008", performedBy: "Cashier", timestamp: daysAgo(2) },
  { id: "m13", storeId: "store-001", productId: "p15", movementType: "sale", quantityChange: -5, referenceType: "receipt", referenceId: "R-0012", performedBy: "Cashier", timestamp: daysAgo(3) },
  { id: "m14", storeId: "store-001", productId: "p20", movementType: "sale", quantityChange: -8, referenceType: "receipt", referenceId: "R-0009", performedBy: "Cashier", timestamp: daysAgo(1) },
  { id: "m15", storeId: "store-001", productId: "p20", movementType: "sale", quantityChange: -12, referenceType: "receipt", referenceId: "R-0015", performedBy: "Cashier", timestamp: daysAgo(4) },
];

export const STOCK_RECEIVES: StockReceiveSession[] = [
  {
    id: "sr1", storeId: "store-001", referenceNumber: "SR-001",
    items: [
      { productId: "p1", productName: "Kitchen Organizer Set", barcode: "8901234567890", quantity: 24, image: PRODUCT_IMAGES.p1 },
      { productId: "p2", productName: "LED Desk Lamp", barcode: "8901234567891", quantity: 12, image: PRODUCT_IMAGES.p2 },
      { productId: "p4", productName: "Bathroom Caddy", barcode: "8901234567893", quantity: 30, image: PRODUCT_IMAGES.p4 },
    ],
    totalItems: 66, receivedBy: "Rajesh Kumar", timestamp: daysAgo(2),
  },
  {
    id: "sr2", storeId: "store-001", referenceNumber: "SR-002",
    items: [
      { productId: "p5", productName: "Spice Rack 3-Tier", barcode: "8901234567894", quantity: 30, image: PRODUCT_IMAGES.p5 },
      { productId: "p8", productName: "Storage Box Set (3)", barcode: "8901234567897", quantity: 20, image: PRODUCT_IMAGES.p8 },
      { productId: "p11", productName: "Cable Organizer", barcode: "8901234567900", quantity: 40, image: PRODUCT_IMAGES.p11 },
    ],
    totalItems: 90, receivedBy: "Rajesh Kumar", timestamp: daysAgo(5),
  },
];

let nextSRNum = 3;
export function getNextSRNumber(): string {
  const num = nextSRNum++;
  return `SR-${String(num).padStart(3, "0")}`;
}

export function getProductMovements(productId: string): StockMovement[] {
  return STOCK_MOVEMENTS.filter(m => m.productId === productId).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export function getDailySalesRate(productId: string): number {
  const twoWeeksAgo = Date.now() - 14 * 86400000;
  const recentSales = STOCK_MOVEMENTS.filter(m =>
    m.productId === productId && m.movementType === "sale" && new Date(m.timestamp).getTime() > twoWeeksAgo
  );
  const totalSold = recentSales.reduce((sum, m) => sum + Math.abs(m.quantityChange), 0);
  return totalSold / 14;
}

let nextMovementId = STOCK_MOVEMENTS.length + 1;

export function addStockMovement(movement: Omit<StockMovement, "id">) {
  const id = `m${nextMovementId++}`;
  STOCK_MOVEMENTS.unshift({ ...movement, id });
}

export function updateInventoryStock(productId: string, newStock: number) {
  const inv = INVENTORY.find(i => i.productId === productId);
  if (inv) {
    inv.currentStock = newStock;
    inv.lastUpdated = new Date().toISOString();
  }
}

export function addReceiveToInventory(items: StockReceiveItem[], referenceId: string) {
  items.forEach(item => {
    const inv = INVENTORY.find(i => i.productId === item.productId);
    if (inv) {
      inv.currentStock += item.quantity;
      inv.lastUpdated = new Date().toISOString();
    }
    addStockMovement({
      storeId: "store-001", productId: item.productId, movementType: "receive",
      quantityChange: item.quantity, referenceType: "stock-receive", referenceId,
      performedBy: "Rajesh Kumar", timestamp: new Date().toISOString(),
    });
  });
}

export const RETURN_REASONS = [
  "Defective product",
  "Wrong product given",
  "Customer changed mind",
  "Damaged packaging",
  "Other",
];

export const STORE_SETTINGS: StoreSettings = {
  storeName: POS_STORE.name,
  address: POS_STORE.address,
  gstin: POS_STORE.gstin,
  phone: POS_STORE.phone,
  lowStockThreshold: 5,
  quickAddProductIds: POS_PRODUCTS.slice(0, 8).map(p => p.id),
  autoPrintReceipt: false,
  storeId: "store-001",
  partnerPackage: "Pro",
  storeStatus: "active",
};

function todayAt(hour: number) {
  const d = new Date();
  d.setHours(hour, Math.floor(Math.random() * 59), 0, 0);
  return d.toISOString();
}

export const EXPANDED_SALES: PosSale[] = [
  ...RECENT_SALES,
  { id: "s4", receiptNumber: "R-0004", storeId: "store-001", items: [
    { id: "i6", productId: "p2", name: "LED Desk Lamp", mrp: 899, quantity: 1, lineTotal: 899, image: PRODUCT_IMAGES.p2 },
    { id: "i7", productId: "p14", name: "Tissue Box Cover", mrp: 279, quantity: 2, lineTotal: 558, image: PRODUCT_IMAGES.p14 },
  ], totalAmount: 1457, paymentMethod: "cash", cashReceived: 1500, changeReturned: 43, timestamp: todayAt(10) },
  { id: "s5", receiptNumber: "R-0005", storeId: "store-001", items: [
    { id: "i8", productId: "p15", name: "Wine Glass Set (4)", mrp: 1499, quantity: 1, lineTotal: 1499, image: PRODUCT_IMAGES.p15 },
  ], totalAmount: 1499, paymentMethod: "upi", timestamp: todayAt(11) },
  { id: "s6", receiptNumber: "R-0006", storeId: "store-001", items: [
    { id: "i9", productId: "p4", name: "Bathroom Caddy", mrp: 449, quantity: 2, lineTotal: 898, image: PRODUCT_IMAGES.p4 },
    { id: "i10", productId: "p12", name: "Soap Dispenser Glass", mrp: 399, quantity: 1, lineTotal: 399, image: PRODUCT_IMAGES.p12 },
  ], totalAmount: 1297, paymentMethod: "cash", cashReceived: 1300, changeReturned: 3, timestamp: todayAt(12) },
  { id: "s7", receiptNumber: "R-0007", storeId: "store-001", items: [
    { id: "i11", productId: "p16", name: "Door Mat Premium", mrp: 499, quantity: 3, lineTotal: 1497, image: PRODUCT_IMAGES.p16 },
  ], totalAmount: 1497, paymentMethod: "card", timestamp: todayAt(13) },
  { id: "s8", receiptNumber: "R-0008", storeId: "store-001", items: [
    { id: "i12", productId: "p5", name: "Spice Rack 3-Tier", mrp: 349, quantity: 2, lineTotal: 698, image: PRODUCT_IMAGES.p5 },
    { id: "i13", productId: "p9", name: "Fridge Magnet Set", mrp: 199, quantity: 4, lineTotal: 796, image: PRODUCT_IMAGES.p9 },
    { id: "i14", productId: "p13", name: "Key Holder Wall Mount", mrp: 329, quantity: 1, lineTotal: 329, image: PRODUCT_IMAGES.p13 },
  ], totalAmount: 1823, paymentMethod: "upi", timestamp: todayAt(14) },
  { id: "s9", receiptNumber: "R-0009", storeId: "store-001", items: [
    { id: "i15", productId: "p18", name: "Photo Frame Set (3)", mrp: 899, quantity: 1, lineTotal: 899, image: PRODUCT_IMAGES.p18 },
    { id: "i16", productId: "p17", name: "Pen Stand Wooden", mrp: 349, quantity: 1, lineTotal: 349, image: PRODUCT_IMAGES.p17 },
  ], totalAmount: 1248, paymentMethod: "cash", cashReceived: 1250, changeReturned: 2, timestamp: todayAt(15) },
  { id: "s10", receiptNumber: "R-0010", storeId: "store-001", items: [
    { id: "i17", productId: "p11", name: "Cable Organizer", mrp: 249, quantity: 3, lineTotal: 747, image: PRODUCT_IMAGES.p11 },
  ], totalAmount: 747, paymentMethod: "upi", timestamp: todayAt(16) },
  { id: "s11", receiptNumber: "R-0011", storeId: "store-001", items: [
    { id: "i18", productId: "p1", name: "Kitchen Organizer Set", mrp: 599, quantity: 1, lineTotal: 599, image: PRODUCT_IMAGES.p1 },
    { id: "i19", productId: "p8", name: "Storage Box Set (3)", mrp: 699, quantity: 1, lineTotal: 699, image: PRODUCT_IMAGES.p8 },
  ], totalAmount: 1298, paymentMethod: "card", timestamp: todayAt(17) },
  { id: "s12", receiptNumber: "R-0012", storeId: "store-001", items: [
    { id: "i20", productId: "p10", name: "Laundry Basket Foldable", mrp: 549, quantity: 1, lineTotal: 549, image: PRODUCT_IMAGES.p10 },
  ], totalAmount: 549, paymentMethod: "cash", cashReceived: 550, changeReturned: 1, timestamp: todayAt(18) },
];

export const REGISTER_SESSIONS: RegisterSession[] = [
  {
    id: "reg-3", storeId: "store-001", openedBy: "Rajesh Kumar",
    openedAt: new Date(new Date().setHours(9, 15, 0, 0)).toISOString(),
    openingAmount: 5000, status: "open",
  },
  {
    id: "reg-2", storeId: "store-001", openedBy: "Rajesh Kumar",
    openedAt: daysAgo(1).replace(/T.*/, "T09:00:00.000Z"), openingAmount: 4500,
    closedBy: "Rajesh Kumar", closedAt: daysAgo(1).replace(/T.*/, "T21:30:00.000Z"),
    closingAmount: 12350, expectedAmount: 12400, difference: -50,
    status: "closed", notes: "Minor rounding differences throughout the day",
  },
  {
    id: "reg-1", storeId: "store-001", openedBy: "Rajesh Kumar",
    openedAt: daysAgo(2).replace(/T.*/, "T09:30:00.000Z"), openingAmount: 5000,
    closedBy: "Rajesh Kumar", closedAt: daysAgo(2).replace(/T.*/, "T21:00:00.000Z"),
    closingAmount: 14200, expectedAmount: 14180, difference: 20,
    status: "closed",
  },
];

export const RETURN_RECORDS: ReturnRecord[] = [
  {
    id: "ret-1", referenceNumber: "RET-001", storeId: "store-001",
    originalSaleId: "s2", originalReceiptNumber: "R-0002",
    items: [
      { productId: "p3", productName: "Wall Clock Modern", image: PRODUCT_IMAGES.p3, mrp: 1299, originalQty: 1, returnQty: 1, lineTotal: 1299 },
    ],
    totalRefund: 1299, refundMethod: "cash", reason: "Defective product",
    processedBy: "Rajesh Kumar", timestamp: daysAgo(0),
  },
];

let nextReturnNum = 2;
export function getNextReturnNumber(): string {
  const num = nextReturnNum++;
  return `RET-${String(num).padStart(3, "0")}`;
}

export function getCashSalesToday(): number {
  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
  return EXPANDED_SALES.filter(s =>
    s.paymentMethod === "cash" && new Date(s.timestamp) >= todayStart
  ).reduce((sum, s) => sum + s.totalAmount, 0);
}

export function addAdjustmentToInventory(productId: string, systemCount: number, physicalCount: number, reason: string) {
  const difference = physicalCount - systemCount;
  updateInventoryStock(productId, physicalCount);
  addStockMovement({
    storeId: "store-001", productId, movementType: "adjustment",
    quantityChange: difference, referenceType: "adjustment",
    referenceId: `ADJ-${Date.now().toString(36).toUpperCase()}`,
    reason, performedBy: "Rajesh Kumar", timestamp: new Date().toISOString(),
  });
}
