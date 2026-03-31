import type { VendorOrderStatus, VendorStoreStatus, VendorClientStatus, VendorTrackingStatus, VendorLedgerType, VendorLedgerPaymentStatus, VendorProductStockStatus, VendorClient, VendorStore, VendorProduct, VendorOrderItem, VendorOrder, VendorTracking, VendorLedgerEntry } from "@/types/vendor";
export type { VendorOrderStatus, VendorStoreStatus, VendorClientStatus, VendorTrackingStatus, VendorLedgerType, VendorLedgerPaymentStatus, VendorProductStockStatus, VendorClient, VendorStore, VendorProduct, VendorOrderItem, VendorOrder, VendorTracking, VendorLedgerEntry };


const PRODUCT_IMAGES: Record<string, string> = {
  "vp-prod-001": "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80",
  "vp-prod-002": "https://images.unsplash.com/photo-1602523961358-f9f03dd557db?w=400&q=80",
  "vp-prod-003": "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&q=80",
  "vp-prod-004": "https://images.unsplash.com/photo-1544441893-675973e31985?w=400&q=80",
  "vp-prod-005": "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&q=80",
  "vp-prod-006": "https://images.unsplash.com/photo-1586521995568-39abaa0c2311?w=400&q=80",
  "vp-prod-007": "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=400&q=80",
  "vp-prod-008": "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&q=80",
  "vp-prod-009": "https://images.unsplash.com/photo-1571781565036-d3f759be73e4?w=400&q=80",
  "vp-prod-010": "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=400&q=80",
  "vp-prod-011": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&q=80",
  "vp-prod-012": "https://images.unsplash.com/photo-1612817288484-6f916006741a?w=400&q=80",
  "vp-prod-013": "https://images.unsplash.com/photo-1595341888016-a392ef81b7de?w=400&q=80",
  "vp-prod-014": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80",
  "vp-prod-015": "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&q=80",
};

export function getVendorProductImage(productId: string): string {
  return PRODUCT_IMAGES[productId] ?? "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&q=80";
}

export const vendorClients: VendorClient[] = [
  {
    id: "vc-001",
    businessName: "TrendSetters NYC",
    contactPerson: "Olivia Martinez",
    email: "olivia@trendsettersnyc.com",
    phone: "+1 (212) 555-0134",
    shopifyDomain: "trendsettersnyc.myshopify.com",
    planTier: "Enterprise",
    status: "Active",
    totalOrders: 87,
    totalSpent: 42680,
    joinedDate: "2024-03-15",
  },
  {
    id: "vc-002",
    businessName: "Pacific Home Goods",
    contactPerson: "James Chen",
    email: "james@pacifichomegoods.com",
    phone: "+1 (415) 555-0278",
    shopifyDomain: "pacifichomegoods.myshopify.com",
    planTier: "Growth",
    status: "Active",
    totalOrders: 64,
    totalSpent: 31250,
    joinedDate: "2024-06-01",
  },
  {
    id: "vc-003",
    businessName: "Sunshine Boutique",
    contactPerson: "Emma Williams",
    email: "emma@sunshineboutique.com",
    phone: "+1 (305) 555-0192",
    shopifyDomain: "sunshineboutique.myshopify.com",
    planTier: "Growth",
    status: "Active",
    totalOrders: 53,
    totalSpent: 24800,
    joinedDate: "2024-08-20",
  },
  {
    id: "vc-004",
    businessName: "Mountain Trail Co",
    contactPerson: "Ryan Brooks",
    email: "ryan@mountaintrailco.com",
    phone: "+1 (720) 555-0341",
    shopifyDomain: "mountaintrailco.myshopify.com",
    planTier: "Starter",
    status: "Active",
    totalOrders: 28,
    totalSpent: 12400,
    joinedDate: "2025-01-10",
  },
  {
    id: "vc-005",
    businessName: "Luxe Living Dallas",
    contactPerson: "Sarah Anderson",
    email: "sarah@luxelivingdallas.com",
    phone: "+1 (214) 555-0456",
    shopifyDomain: "luxelivingdallas.myshopify.com",
    planTier: "Enterprise",
    status: "Active",
    totalOrders: 92,
    totalSpent: 58300,
    joinedDate: "2024-01-05",
  },
  {
    id: "vc-006",
    businessName: "Coastal Vibes Shop",
    contactPerson: "Michael Torres",
    email: "michael@coastalvibes.com",
    phone: "+1 (619) 555-0523",
    shopifyDomain: "coastalvibesshop.myshopify.com",
    planTier: "Growth",
    status: "Active",
    totalOrders: 41,
    totalSpent: 19750,
    joinedDate: "2024-11-15",
  },
  {
    id: "vc-007",
    businessName: "Heartland Crafts",
    contactPerson: "Lisa Johnson",
    email: "lisa@heartlandcrafts.com",
    phone: "+1 (816) 555-0687",
    shopifyDomain: "heartlandcrafts.myshopify.com",
    planTier: "Starter",
    status: "Inactive",
    totalOrders: 12,
    totalSpent: 5600,
    joinedDate: "2025-04-01",
  },
  {
    id: "vc-008",
    businessName: "Urban Nest Decor",
    contactPerson: "David Kim",
    email: "david@urbannestdecor.com",
    phone: "+1 (773) 555-0812",
    shopifyDomain: "urbannestdecor.myshopify.com",
    planTier: "Growth",
    status: "Active",
    totalOrders: 36,
    totalSpent: 17200,
    joinedDate: "2025-02-14",
  },
];

export const vendorStores: VendorStore[] = [
  { id: "vs-001", clientId: "vc-001", storeName: "TrendSetters NYC Main", domain: "trendsettersnyc.myshopify.com", productCount: 124, orderCount: 87, status: "Connected", lastSync: "2026-03-08T14:22:00Z", createdDate: "2024-03-15" },
  { id: "vs-002", clientId: "vc-002", storeName: "Pacific Home Goods", domain: "pacifichomegoods.myshopify.com", productCount: 89, orderCount: 64, status: "Connected", lastSync: "2026-03-08T14:18:00Z", createdDate: "2024-06-01" },
  { id: "vs-003", clientId: "vc-003", storeName: "Sunshine Boutique", domain: "sunshineboutique.myshopify.com", productCount: 67, orderCount: 53, status: "Connected", lastSync: "2026-03-08T13:45:00Z", createdDate: "2024-08-20" },
  { id: "vs-004", clientId: "vc-004", storeName: "Mountain Trail Co", domain: "mountaintrailco.myshopify.com", productCount: 42, orderCount: 28, status: "Syncing", lastSync: "2026-03-08T12:30:00Z", createdDate: "2025-01-10" },
  { id: "vs-005", clientId: "vc-005", storeName: "Luxe Living Dallas", domain: "luxelivingdallas.myshopify.com", productCount: 156, orderCount: 72, status: "Connected", lastSync: "2026-03-08T14:20:00Z", createdDate: "2024-01-05" },
  { id: "vs-006", clientId: "vc-005", storeName: "Luxe Living Wholesale", domain: "luxelivingwholesale.myshopify.com", productCount: 98, orderCount: 20, status: "Connected", lastSync: "2026-03-08T14:15:00Z", createdDate: "2024-09-10" },
  { id: "vs-007", clientId: "vc-006", storeName: "Coastal Vibes Shop", domain: "coastalvibesshop.myshopify.com", productCount: 53, orderCount: 41, status: "Connected", lastSync: "2026-03-08T13:50:00Z", createdDate: "2024-11-15" },
  { id: "vs-008", clientId: "vc-007", storeName: "Heartland Crafts", domain: "heartlandcrafts.myshopify.com", productCount: 31, orderCount: 12, status: "Disconnected", lastSync: "2026-02-20T09:10:00Z", createdDate: "2025-04-01" },
  { id: "vs-009", clientId: "vc-008", storeName: "Urban Nest Decor", domain: "urbannestdecor.myshopify.com", productCount: 78, orderCount: 36, status: "Connected", lastSync: "2026-03-08T14:00:00Z", createdDate: "2025-02-14" },
  { id: "vs-010", clientId: "vc-001", storeName: "TrendSetters Pop-Up", domain: "trendsetters-popup.myshopify.com", productCount: 45, orderCount: 15, status: "Syncing", lastSync: "2026-03-08T11:00:00Z", createdDate: "2025-06-01" },
];

export const vendorProducts: VendorProduct[] = [
  { id: "vp-prod-001", name: "Handwoven Cotton Throw", sku: "HQ-THR-001", imageUrl: PRODUCT_IMAGES["vp-prod-001"], category: "Home Textiles", weight: 1.8, costPrice: 24.50, sellingPrice: 49.99, supplier: "AsiaDirect Supply", stockStatus: "In Stock", stockQuantity: 84 },
  { id: "vp-prod-002", name: "Soy Wax Candle Set", sku: "HQ-CND-002", imageUrl: PRODUCT_IMAGES["vp-prod-002"], category: "Home Fragrance", weight: 2.2, costPrice: 15.00, sellingPrice: 34.99, supplier: "ShipFast Logistics", stockStatus: "In Stock", stockQuantity: 120 },
  { id: "vp-prod-003", name: "Rattan Fruit Bowl", sku: "HQ-RFB-003", imageUrl: PRODUCT_IMAGES["vp-prod-003"], category: "Kitchen & Dining", weight: 0.9, costPrice: 12.00, sellingPrice: 28.99, supplier: "GlobalPack Co", stockStatus: "In Stock", stockQuantity: 200 },
  { id: "vp-prod-004", name: "Linen Napkin Set (4pc)", sku: "HQ-NAP-004", imageUrl: PRODUCT_IMAGES["vp-prod-004"], category: "Kitchen & Dining", weight: 0.5, costPrice: 11.00, sellingPrice: 24.99, supplier: "ShipFast Logistics", stockStatus: "Low Stock", stockQuantity: 18 },
  { id: "vp-prod-005", name: "Leather Journal", sku: "HQ-JRN-005", imageUrl: PRODUCT_IMAGES["vp-prod-005"], category: "Stationery", weight: 0.6, costPrice: 18.00, sellingPrice: 39.99, supplier: "QuickFulfill EU", stockStatus: "In Stock", stockQuantity: 60 },
  { id: "vp-prod-006", name: "Macramé Wall Hanging", sku: "HQ-MAC-006", imageUrl: PRODUCT_IMAGES["vp-prod-006"], category: "Wall Decor", weight: 0.7, costPrice: 22.00, sellingPrice: 44.99, supplier: "QuickFulfill EU", stockStatus: "In Stock", stockQuantity: 32 },
  { id: "vp-prod-007", name: "Ceramic Mug Set", sku: "HQ-MUG-007", imageUrl: PRODUCT_IMAGES["vp-prod-007"], category: "Kitchen & Dining", weight: 1.5, costPrice: 14.00, sellingPrice: 32.99, supplier: "AsiaDirect Supply", stockStatus: "In Stock", stockQuantity: 72 },
  { id: "vp-prod-008", name: "Lavender Body Oil", sku: "HQ-OIL-008", imageUrl: PRODUCT_IMAGES["vp-prod-008"], category: "Bath & Body", weight: 0.4, costPrice: 8.50, sellingPrice: 19.99, supplier: "ShipFast Logistics", stockStatus: "In Stock", stockQuantity: 240 },
  { id: "vp-prod-009", name: "Rose Facial Serum", sku: "HQ-SRM-009", imageUrl: PRODUCT_IMAGES["vp-prod-009"], category: "Skincare", weight: 0.2, costPrice: 12.00, sellingPrice: 28.99, supplier: "ShipFast Logistics", stockStatus: "Low Stock", stockQuantity: 22 },
  { id: "vp-prod-010", name: "Wildflower Honey Jar", sku: "HQ-HON-010", imageUrl: PRODUCT_IMAGES["vp-prod-010"], category: "Food & Pantry", weight: 0.8, costPrice: 7.50, sellingPrice: 16.99, supplier: "GlobalPack Co", stockStatus: "In Stock", stockQuantity: 360 },
  { id: "vp-prod-011", name: "Bamboo Cutting Board", sku: "HQ-BCB-011", imageUrl: PRODUCT_IMAGES["vp-prod-011"], category: "Kitchen & Dining", weight: 1.2, costPrice: 10.00, sellingPrice: 22.99, supplier: "GlobalPack Co", stockStatus: "In Stock", stockQuantity: 150 },
  { id: "vp-prod-012", name: "Essential Oil Diffuser", sku: "HQ-DIF-012", imageUrl: PRODUCT_IMAGES["vp-prod-012"], category: "Home Fragrance", weight: 0.6, costPrice: 18.00, sellingPrice: 42.99, supplier: "AsiaDirect Supply", stockStatus: "Out of Stock", stockQuantity: 0 },
  { id: "vp-prod-013", name: "Organic Cotton Tote Bag", sku: "HQ-TOT-013", imageUrl: PRODUCT_IMAGES["vp-prod-013"], category: "Accessories", weight: 0.3, costPrice: 5.50, sellingPrice: 14.99, supplier: "AsiaDirect Supply", stockStatus: "In Stock", stockQuantity: 500 },
  { id: "vp-prod-014", name: "Wireless Bamboo Speaker", sku: "HQ-SPK-014", imageUrl: PRODUCT_IMAGES["vp-prod-014"], category: "Electronics", weight: 0.5, costPrice: 22.00, sellingPrice: 49.99, supplier: "GlobalPack Co", stockStatus: "In Stock", stockQuantity: 45 },
  { id: "vp-prod-015", name: "Vintage Polaroid Camera", sku: "HQ-CAM-015", imageUrl: PRODUCT_IMAGES["vp-prod-015"], category: "Electronics", weight: 0.4, costPrice: 35.00, sellingPrice: 74.99, supplier: "QuickFulfill EU", stockStatus: "Low Stock", stockQuantity: 8 },
];

const productMap = Object.fromEntries(vendorProducts.map(p => [p.id, p]));

function makeItems(orderId: string, productIds: string[], quantities: number[]): VendorOrderItem[] {
  return productIds.map((pid, i) => {
    const p = productMap[pid];
    const qty = quantities[i];
    return {
      id: `${orderId}-item-${i + 1}`,
      orderId,
      productId: pid,
      productName: p.name,
      sku: p.sku,
      imageUrl: p.imageUrl,
      quantity: qty,
      unitPrice: p.sellingPrice,
      total: +(p.sellingPrice * qty).toFixed(2),
    };
  });
}

function orderTotal(items: VendorOrderItem[], shipping: number): { subtotal: number; total: number } {
  const subtotal = +items.reduce((s, i) => s + i.total, 0).toFixed(2);
  return { subtotal, total: +(subtotal + shipping).toFixed(2) };
}

function buildOrder(
  id: string, shopifyNum: string, storeId: string, storeName: string,
  customerName: string, address: VendorOrder["shippingAddress"],
  productIds: string[], quantities: number[], shipping: number,
  status: VendorOrderStatus, createdAt: string, updatedAt: string, quotedCost?: number
): VendorOrder {
  const items = makeItems(id, productIds, quantities);
  const { subtotal, total } = orderTotal(items, shipping);
  return { id, shopifyOrderNumber: shopifyNum, storeId, storeName, customerName, shippingAddress: address, items, subtotal, shippingCost: shipping, total, status, quotedCost, createdAt, updatedAt };
}

export const vendorOrders: VendorOrder[] = [
  buildOrder("vo-001", "#1042", "vs-001", "TrendSetters NYC Main", "Jennifer Adams",
    { line1: "742 Evergreen Terrace", city: "Springfield", state: "IL", zip: "62704", country: "US" },
    ["vp-prod-001", "vp-prod-002"], [2, 3], 8.99, "New", "2026-03-08T09:15:00Z", "2026-03-08T09:15:00Z"),

  buildOrder("vo-002", "#1043", "vs-002", "Pacific Home Goods", "Mark Sullivan",
    { line1: "1520 Ocean Blvd", line2: "Apt 4B", city: "Santa Monica", state: "CA", zip: "90401", country: "US" },
    ["vp-prod-003", "vp-prod-004", "vp-prod-011"], [4, 2, 1], 12.50, "New", "2026-03-08T08:30:00Z", "2026-03-08T08:30:00Z"),

  buildOrder("vo-003", "#1044", "vs-003", "Sunshine Boutique", "Rachel Green",
    { line1: "425 S Collins St", city: "Miami", state: "FL", zip: "33130", country: "US" },
    ["vp-prod-008", "vp-prod-009"], [6, 4], 6.99, "Quoted", "2026-03-07T14:20:00Z", "2026-03-08T10:00:00Z", 85.00),

  buildOrder("vo-004", "#1045", "vs-005", "Luxe Living Dallas", "Thomas Wright",
    { line1: "8900 Preston Rd", line2: "Suite 200", city: "Dallas", state: "TX", zip: "75225", country: "US" },
    ["vp-prod-001", "vp-prod-005", "vp-prod-006"], [3, 2, 2], 15.00, "Quoted", "2026-03-07T11:45:00Z", "2026-03-07T16:30:00Z", 195.00),

  buildOrder("vo-005", "#1046", "vs-001", "TrendSetters NYC Main", "Amanda Foster",
    { line1: "350 5th Ave", line2: "Floor 34", city: "New York", state: "NY", zip: "10118", country: "US" },
    ["vp-prod-007", "vp-prod-010"], [6, 12], 9.99, "Processing", "2026-03-06T16:00:00Z", "2026-03-07T09:00:00Z", 180.00),

  buildOrder("vo-006", "#1047", "vs-007", "Coastal Vibes Shop", "Brandon Lee",
    { line1: "2814 Camino del Rio S", city: "San Diego", state: "CA", zip: "92108", country: "US" },
    ["vp-prod-013", "vp-prod-003"], [10, 3], 7.50, "Processing", "2026-03-06T10:30:00Z", "2026-03-07T08:15:00Z", 110.00),

  buildOrder("vo-007", "#1048", "vs-009", "Urban Nest Decor", "Catherine Park",
    { line1: "445 N Michigan Ave", city: "Chicago", state: "IL", zip: "60611", country: "US" },
    ["vp-prod-006", "vp-prod-001"], [2, 4], 14.99, "Processing", "2026-03-05T15:20:00Z", "2026-03-06T11:00:00Z", 210.00),

  buildOrder("vo-008", "#1049", "vs-005", "Luxe Living Dallas", "Victoria Hayes",
    { line1: "3737 Mockingbird Ln", city: "Dallas", state: "TX", zip: "75205", country: "US" },
    ["vp-prod-012", "vp-prod-014"], [3, 2], 11.99, "Shipped", "2026-03-04T09:00:00Z", "2026-03-06T14:30:00Z", 175.00),

  buildOrder("vo-009", "#1050", "vs-002", "Pacific Home Goods", "Daniel Roberts",
    { line1: "680 Folsom St", city: "San Francisco", state: "CA", zip: "94107", country: "US" },
    ["vp-prod-002", "vp-prod-008", "vp-prod-010"], [4, 8, 6], 10.00, "Shipped", "2026-03-03T12:15:00Z", "2026-03-05T16:00:00Z", 220.00),

  buildOrder("vo-010", "#1051", "vs-003", "Sunshine Boutique", "Sophia Bennett",
    { line1: "1234 Brickell Ave", line2: "PH 1", city: "Miami", state: "FL", zip: "33131", country: "US" },
    ["vp-prod-015"], [2], 12.99, "Shipped", "2026-03-02T08:45:00Z", "2026-03-04T10:30:00Z", 82.00),

  buildOrder("vo-011", "#1052", "vs-001", "TrendSetters NYC Main", "Robert Kim",
    { line1: "200 Park Ave", city: "New York", state: "NY", zip: "10166", country: "US" },
    ["vp-prod-004", "vp-prod-007", "vp-prod-011"], [4, 6, 2], 8.99, "Delivered", "2026-02-28T14:00:00Z", "2026-03-05T09:00:00Z", 160.00),

  buildOrder("vo-012", "#1053", "vs-007", "Coastal Vibes Shop", "Emily Watson",
    { line1: "4545 La Jolla Village Dr", city: "San Diego", state: "CA", zip: "92122", country: "US" },
    ["vp-prod-008", "vp-prod-013"], [12, 8], 6.50, "Delivered", "2026-02-27T10:30:00Z", "2026-03-04T12:00:00Z", 135.00),

  buildOrder("vo-013", "#1054", "vs-005", "Luxe Living Dallas", "Natalie Brooks",
    { line1: "2500 Cedar Springs Rd", city: "Dallas", state: "TX", zip: "75201", country: "US" },
    ["vp-prod-001", "vp-prod-002", "vp-prod-005"], [4, 6, 3], 15.00, "Delivered", "2026-02-25T09:00:00Z", "2026-03-03T11:30:00Z", 280.00),

  buildOrder("vo-014", "#1055", "vs-009", "Urban Nest Decor", "William Chen",
    { line1: "1 N State St", city: "Chicago", state: "IL", zip: "60602", country: "US" },
    ["vp-prod-003", "vp-prod-011"], [6, 4], 9.50, "Delivered", "2026-02-24T16:00:00Z", "2026-03-02T14:00:00Z", 95.00),

  buildOrder("vo-015", "#1056", "vs-002", "Pacific Home Goods", "Ashley Morgan",
    { line1: "900 North Point St", city: "San Francisco", state: "CA", zip: "94109", country: "US" },
    ["vp-prod-006", "vp-prod-009"], [3, 6], 11.99, "Delivered", "2026-02-22T11:00:00Z", "2026-03-01T09:30:00Z", 170.00),

  buildOrder("vo-016", "#1057", "vs-004", "Mountain Trail Co", "Chris Anderson",
    { line1: "1600 California St", city: "Denver", state: "CO", zip: "80202", country: "US" },
    ["vp-prod-010", "vp-prod-013"], [12, 6], 7.99, "New", "2026-03-08T07:45:00Z", "2026-03-08T07:45:00Z"),

  buildOrder("vo-017", "#1058", "vs-006", "Luxe Living Wholesale", "Patricia Moore",
    { line1: "4100 Alpha Rd", city: "Dallas", state: "TX", zip: "75244", country: "US" },
    ["vp-prod-014", "vp-prod-015", "vp-prod-007"], [4, 2, 6], 18.00, "Quoted", "2026-03-07T09:00:00Z", "2026-03-07T15:00:00Z", 310.00),

  buildOrder("vo-018", "#1059", "vs-003", "Sunshine Boutique", "Kevin Taylor",
    { line1: "777 Brickell Ave", city: "Miami", state: "FL", zip: "33131", country: "US" },
    ["vp-prod-002", "vp-prod-012"], [6, 2], 9.99, "Processing", "2026-03-05T13:00:00Z", "2026-03-06T10:45:00Z", 145.00),

  buildOrder("vo-019", "#1060", "vs-001", "TrendSetters NYC Main", "Lauren Phillips",
    { line1: "55 Water St", city: "New York", state: "NY", zip: "10041", country: "US" },
    ["vp-prod-005", "vp-prod-008"], [4, 10], 8.50, "Shipped", "2026-03-03T15:30:00Z", "2026-03-05T08:00:00Z", 155.00),

  buildOrder("vo-020", "#1061", "vs-005", "Luxe Living Dallas", "Megan Clark",
    { line1: "6060 N Central Expy", line2: "Suite 560", city: "Dallas", state: "TX", zip: "75206", country: "US" },
    ["vp-prod-001", "vp-prod-003", "vp-prod-010"], [2, 4, 8], 14.50, "Delivered", "2026-02-20T10:00:00Z", "2026-02-28T16:00:00Z", 200.00),

  buildOrder("vo-021", "#1062", "vs-007", "Coastal Vibes Shop", "Jason Rivera",
    { line1: "3100 Ocean Park Blvd", city: "Santa Monica", state: "CA", zip: "90405", country: "US" },
    ["vp-prod-011", "vp-prod-004"], [3, 4], 7.99, "Cancelled", "2026-03-04T11:00:00Z", "2026-03-05T09:00:00Z"),

  buildOrder("vo-022", "#1063", "vs-009", "Urban Nest Decor", "Hannah Lee",
    { line1: "333 E Ontario St", city: "Chicago", state: "IL", zip: "60611", country: "US" },
    ["vp-prod-012", "vp-prod-006"], [1, 3], 11.50, "New", "2026-03-08T06:30:00Z", "2026-03-08T06:30:00Z"),

  buildOrder("vo-023", "#1064", "vs-004", "Mountain Trail Co", "Tyler Russell",
    { line1: "1441 18th St", city: "Denver", state: "CO", zip: "80202", country: "US" },
    ["vp-prod-007", "vp-prod-014"], [4, 1], 8.99, "Quoted", "2026-03-06T14:00:00Z", "2026-03-07T10:00:00Z", 105.00),

  buildOrder("vo-024", "#1065", "vs-002", "Pacific Home Goods", "Nicole Stewart",
    { line1: "501 2nd St", city: "San Francisco", state: "CA", zip: "94107", country: "US" },
    ["vp-prod-001", "vp-prod-009", "vp-prod-013"], [2, 4, 6], 10.50, "Shipped", "2026-03-02T12:00:00Z", "2026-03-04T15:00:00Z", 145.00),

  buildOrder("vo-025", "#1066", "vs-006", "Luxe Living Wholesale", "Greg Howard",
    { line1: "5000 Quorum Dr", city: "Dallas", state: "TX", zip: "75254", country: "US" },
    ["vp-prod-002", "vp-prod-005", "vp-prod-008", "vp-prod-011"], [8, 4, 12, 4], 22.00, "Delivered", "2026-02-18T09:30:00Z", "2026-02-26T11:00:00Z", 380.00),
];

export const vendorTracking: VendorTracking[] = [
  {
    id: "vt-001", orderId: "vo-008", orderNumber: "#1049", customerName: "Victoria Hayes",
    carrier: "FedEx", trackingNumber: "FX7849201356", status: "In Transit",
    shipDate: "2026-03-06", estimatedDelivery: "2026-03-10",
    statusUpdates: [
      { status: "Label Created", date: "2026-03-06T08:00:00Z", location: "Dallas, TX" },
      { status: "Picked Up", date: "2026-03-06T14:30:00Z", location: "Dallas, TX" },
      { status: "In Transit", date: "2026-03-07T06:00:00Z", location: "Memphis, TN" },
    ],
  },
  {
    id: "vt-002", orderId: "vo-009", orderNumber: "#1050", customerName: "Daniel Roberts",
    carrier: "UPS", trackingNumber: "1Z999AA10123456784", status: "In Transit",
    shipDate: "2026-03-05", estimatedDelivery: "2026-03-09",
    statusUpdates: [
      { status: "Label Created", date: "2026-03-05T10:00:00Z", location: "Portland, OR" },
      { status: "Picked Up", date: "2026-03-05T16:00:00Z", location: "Portland, OR" },
      { status: "In Transit", date: "2026-03-06T08:00:00Z", location: "Reno, NV" },
    ],
  },
  {
    id: "vt-003", orderId: "vo-010", orderNumber: "#1051", customerName: "Sophia Bennett",
    carrier: "USPS", trackingNumber: "9400111899223100456789", status: "Out for Delivery",
    shipDate: "2026-03-04", estimatedDelivery: "2026-03-08",
    statusUpdates: [
      { status: "Label Created", date: "2026-03-04T07:00:00Z", location: "Brooklyn, NY" },
      { status: "Picked Up", date: "2026-03-04T12:00:00Z", location: "Brooklyn, NY" },
      { status: "In Transit", date: "2026-03-05T06:00:00Z", location: "Jacksonville, FL" },
      { status: "Out for Delivery", date: "2026-03-08T06:30:00Z", location: "Miami, FL" },
    ],
  },
  {
    id: "vt-004", orderId: "vo-011", orderNumber: "#1052", customerName: "Robert Kim",
    carrier: "FedEx", trackingNumber: "FX7849201890", status: "Delivered",
    shipDate: "2026-03-01", estimatedDelivery: "2026-03-05",
    statusUpdates: [
      { status: "Label Created", date: "2026-03-01T09:00:00Z", location: "Denver, CO" },
      { status: "Picked Up", date: "2026-03-01T15:00:00Z", location: "Denver, CO" },
      { status: "In Transit", date: "2026-03-02T07:00:00Z", location: "Indianapolis, IN" },
      { status: "Out for Delivery", date: "2026-03-04T06:00:00Z", location: "New York, NY" },
      { status: "Delivered", date: "2026-03-04T14:22:00Z", location: "New York, NY" },
    ],
  },
  {
    id: "vt-005", orderId: "vo-012", orderNumber: "#1053", customerName: "Emily Watson",
    carrier: "UPS", trackingNumber: "1Z999AA10987654321", status: "Delivered",
    shipDate: "2026-02-28", estimatedDelivery: "2026-03-04",
    statusUpdates: [
      { status: "Label Created", date: "2026-02-28T08:00:00Z", location: "Austin, TX" },
      { status: "Picked Up", date: "2026-02-28T14:00:00Z", location: "Austin, TX" },
      { status: "In Transit", date: "2026-03-01T06:00:00Z", location: "Phoenix, AZ" },
      { status: "Out for Delivery", date: "2026-03-03T07:00:00Z", location: "San Diego, CA" },
      { status: "Delivered", date: "2026-03-03T13:45:00Z", location: "San Diego, CA" },
    ],
  },
  {
    id: "vt-006", orderId: "vo-013", orderNumber: "#1054", customerName: "Natalie Brooks",
    carrier: "FedEx", trackingNumber: "FX7849204567", status: "Delivered",
    shipDate: "2026-02-27", estimatedDelivery: "2026-03-03",
    statusUpdates: [
      { status: "Label Created", date: "2026-02-27T07:00:00Z", location: "Dallas, TX" },
      { status: "Picked Up", date: "2026-02-27T13:00:00Z", location: "Dallas, TX" },
      { status: "In Transit", date: "2026-02-28T06:00:00Z", location: "Fort Worth, TX" },
      { status: "Out for Delivery", date: "2026-03-02T06:30:00Z", location: "Dallas, TX" },
      { status: "Delivered", date: "2026-03-02T11:15:00Z", location: "Dallas, TX" },
    ],
  },
  {
    id: "vt-007", orderId: "vo-014", orderNumber: "#1055", customerName: "William Chen",
    carrier: "USPS", trackingNumber: "9400111899223100789012", status: "Delivered",
    shipDate: "2026-02-26", estimatedDelivery: "2026-03-02",
    statusUpdates: [
      { status: "Label Created", date: "2026-02-26T09:00:00Z", location: "Portland, OR" },
      { status: "Picked Up", date: "2026-02-26T14:30:00Z", location: "Portland, OR" },
      { status: "In Transit", date: "2026-02-27T06:00:00Z", location: "Salt Lake City, UT" },
      { status: "Out for Delivery", date: "2026-03-01T07:00:00Z", location: "Chicago, IL" },
      { status: "Delivered", date: "2026-03-01T15:30:00Z", location: "Chicago, IL" },
    ],
  },
  {
    id: "vt-008", orderId: "vo-015", orderNumber: "#1056", customerName: "Ashley Morgan",
    carrier: "UPS", trackingNumber: "1Z999AA10543216789", status: "Delivered",
    shipDate: "2026-02-24", estimatedDelivery: "2026-03-01",
    statusUpdates: [
      { status: "Label Created", date: "2026-02-24T08:00:00Z", location: "Brooklyn, NY" },
      { status: "Picked Up", date: "2026-02-24T15:00:00Z", location: "Brooklyn, NY" },
      { status: "In Transit", date: "2026-02-25T07:00:00Z", location: "Reno, NV" },
      { status: "Out for Delivery", date: "2026-02-28T06:00:00Z", location: "San Francisco, CA" },
      { status: "Delivered", date: "2026-02-28T12:40:00Z", location: "San Francisco, CA" },
    ],
  },
  {
    id: "vt-009", orderId: "vo-019", orderNumber: "#1060", customerName: "Lauren Phillips",
    carrier: "FedEx", trackingNumber: "FX7849207890", status: "In Transit",
    shipDate: "2026-03-05", estimatedDelivery: "2026-03-09",
    statusUpdates: [
      { status: "Label Created", date: "2026-03-05T07:00:00Z", location: "Denver, CO" },
      { status: "Picked Up", date: "2026-03-05T14:00:00Z", location: "Denver, CO" },
      { status: "In Transit", date: "2026-03-06T06:00:00Z", location: "Kansas City, MO" },
    ],
  },
  {
    id: "vt-010", orderId: "vo-020", orderNumber: "#1061", customerName: "Megan Clark",
    carrier: "UPS", trackingNumber: "1Z999AA10111222333", status: "Delivered",
    shipDate: "2026-02-22", estimatedDelivery: "2026-02-28",
    statusUpdates: [
      { status: "Label Created", date: "2026-02-22T09:00:00Z", location: "Portland, OR" },
      { status: "Picked Up", date: "2026-02-22T14:00:00Z", location: "Portland, OR" },
      { status: "In Transit", date: "2026-02-23T08:00:00Z", location: "Denver, CO" },
      { status: "Out for Delivery", date: "2026-02-27T06:00:00Z", location: "Dallas, TX" },
      { status: "Delivered", date: "2026-02-27T13:10:00Z", location: "Dallas, TX" },
    ],
  },
  {
    id: "vt-011", orderId: "vo-024", orderNumber: "#1065", customerName: "Nicole Stewart",
    carrier: "USPS", trackingNumber: "9400111899223100111222", status: "In Transit",
    shipDate: "2026-03-04", estimatedDelivery: "2026-03-09",
    statusUpdates: [
      { status: "Label Created", date: "2026-03-04T10:00:00Z", location: "Austin, TX" },
      { status: "Picked Up", date: "2026-03-04T16:00:00Z", location: "Austin, TX" },
      { status: "In Transit", date: "2026-03-05T08:00:00Z", location: "Phoenix, AZ" },
    ],
  },
  {
    id: "vt-012", orderId: "vo-025", orderNumber: "#1066", customerName: "Greg Howard",
    carrier: "FedEx", trackingNumber: "FX7849209999", status: "Delivered",
    shipDate: "2026-02-20", estimatedDelivery: "2026-02-26",
    statusUpdates: [
      { status: "Label Created", date: "2026-02-20T08:00:00Z", location: "Denver, CO" },
      { status: "Picked Up", date: "2026-02-20T13:00:00Z", location: "Denver, CO" },
      { status: "In Transit", date: "2026-02-21T06:00:00Z", location: "Oklahoma City, OK" },
      { status: "Out for Delivery", date: "2026-02-25T07:00:00Z", location: "Dallas, TX" },
      { status: "Delivered", date: "2026-02-25T14:20:00Z", location: "Dallas, TX" },
    ],
  },
];

export const vendorLedger: VendorLedgerEntry[] = [
  { id: "vl-001", clientId: "vc-005", clientName: "Luxe Living Dallas", date: "2026-03-08", description: "Order #1045 — Fulfillment quote accepted", invoiceNumber: "INV-2026-0308-001", type: "Credit", amount: 375.93, balance: 375.93, paymentStatus: "Pending" },
  { id: "vl-002", clientId: "vc-001", clientName: "TrendSetters NYC", date: "2026-03-07", description: "Order #1046 — Processing payment received", invoiceNumber: "INV-2026-0307-001", type: "Credit", amount: 411.87, balance: 787.80, paymentStatus: "Paid" },
  { id: "vl-003", clientId: "vc-006", clientName: "Coastal Vibes Shop", date: "2026-03-07", description: "Order #1047 — Fulfillment payment", invoiceNumber: "INV-2026-0307-002", type: "Debit", amount: 110.00, balance: 677.80, paymentStatus: "Paid" },
  { id: "vl-004", clientId: "vc-008", clientName: "Urban Nest Decor", date: "2026-03-06", description: "Order #1048 — Processing payment", invoiceNumber: "INV-2026-0306-001", type: "Credit", amount: 294.95, balance: 972.75, paymentStatus: "Paid" },
  { id: "vl-005", clientId: "vc-005", clientName: "Luxe Living Dallas", date: "2026-03-06", description: "Order #1049 — Shipment cost deduction", invoiceNumber: "INV-2026-0306-002", type: "Debit", amount: 175.00, balance: 797.75, paymentStatus: "Paid" },
  { id: "vl-006", clientId: "vc-002", clientName: "Pacific Home Goods", date: "2026-03-05", description: "Order #1050 — Revenue credit", invoiceNumber: "INV-2026-0305-001", type: "Credit", amount: 509.86, balance: 1307.61, paymentStatus: "Paid" },
  { id: "vl-007", clientId: "vc-003", clientName: "Sunshine Boutique", date: "2026-03-04", description: "Order #1051 — Revenue credit", invoiceNumber: "INV-2026-0304-001", type: "Credit", amount: 162.97, balance: 1470.58, paymentStatus: "Pending" },
  { id: "vl-008", clientId: "vc-001", clientName: "TrendSetters NYC", date: "2026-03-03", description: "Order #1052 — Delivered payment", invoiceNumber: "INV-2026-0303-001", type: "Credit", amount: 422.91, balance: 1893.49, paymentStatus: "Paid" },
  { id: "vl-009", clientId: "vc-006", clientName: "Coastal Vibes Shop", date: "2026-03-02", description: "Order #1053 — Fulfillment cost", invoiceNumber: "INV-2026-0302-001", type: "Debit", amount: 135.00, balance: 1758.49, paymentStatus: "Paid" },
  { id: "vl-010", clientId: "vc-005", clientName: "Luxe Living Dallas", date: "2026-03-01", description: "Order #1054 — Full payment received", invoiceNumber: "INV-2026-0301-001", type: "Credit", amount: 534.91, balance: 2293.40, paymentStatus: "Paid" },
  { id: "vl-011", clientId: "vc-008", clientName: "Urban Nest Decor", date: "2026-02-28", description: "Order #1055 — Revenue credit", invoiceNumber: "INV-2026-0228-001", type: "Credit", amount: 274.44, balance: 2567.84, paymentStatus: "Paid" },
  { id: "vl-012", clientId: "vc-002", clientName: "Pacific Home Goods", date: "2026-02-27", description: "Order #1056 — Revenue credit", invoiceNumber: "INV-2026-0227-001", type: "Credit", amount: 320.93, balance: 2888.77, paymentStatus: "Paid" },
  { id: "vl-013", clientId: "vc-002", clientName: "Pacific Home Goods", date: "2026-02-26", description: "Fulfillment expense — bulk shipping", invoiceNumber: "INV-2026-0226-001", type: "Debit", amount: 170.00, balance: 2718.77, paymentStatus: "Paid" },
  { id: "vl-014", clientId: "vc-005", clientName: "Luxe Living Dallas", date: "2026-02-25", description: "Order #1061 — Delivered payment", invoiceNumber: "INV-2026-0225-001", type: "Credit", amount: 425.38, balance: 3144.15, paymentStatus: "Paid" },
  { id: "vl-015", clientId: "vc-001", clientName: "TrendSetters NYC", date: "2026-02-24", description: "Monthly service fee — Enterprise plan", invoiceNumber: "INV-2026-0224-001", type: "Debit", amount: 299.00, balance: 2845.15, paymentStatus: "Paid" },
  { id: "vl-016", clientId: "vc-003", clientName: "Sunshine Boutique", date: "2026-02-23", description: "Order refund — defective item return", invoiceNumber: "INV-2026-0223-001", type: "Debit", amount: 49.99, balance: 2795.16, paymentStatus: "Paid" },
  { id: "vl-017", clientId: "vc-004", clientName: "Mountain Trail Co", date: "2026-02-22", description: "Order #1057 — Revenue credit", invoiceNumber: "INV-2026-0222-001", type: "Credit", amount: 301.87, balance: 3097.03, paymentStatus: "Pending" },
  { id: "vl-018", clientId: "vc-006", clientName: "Coastal Vibes Shop", date: "2026-02-21", description: "Monthly service fee — Growth plan", invoiceNumber: "INV-2026-0221-001", type: "Debit", amount: 149.00, balance: 2948.03, paymentStatus: "Paid" },
  { id: "vl-019", clientId: "vc-005", clientName: "Luxe Living Dallas", date: "2026-02-20", description: "Bulk order credit — wholesale pricing", invoiceNumber: "INV-2026-0220-001", type: "Credit", amount: 850.00, balance: 3798.03, paymentStatus: "Paid" },
  { id: "vl-020", clientId: "vc-002", clientName: "Pacific Home Goods", date: "2026-02-19", description: "Monthly service fee — Growth plan", invoiceNumber: "INV-2026-0219-001", type: "Debit", amount: 149.00, balance: 3649.03, paymentStatus: "Paid" },
  { id: "vl-021", clientId: "vc-001", clientName: "TrendSetters NYC", date: "2026-02-18", description: "Performance bonus — top client", invoiceNumber: "INV-2026-0218-001", type: "Credit", amount: 200.00, balance: 3849.03, paymentStatus: "Paid" },
  { id: "vl-022", clientId: "vc-008", clientName: "Urban Nest Decor", date: "2026-02-17", description: "Order revenue credit", invoiceNumber: "INV-2026-0217-001", type: "Credit", amount: 189.50, balance: 4038.53, paymentStatus: "Pending" },
  { id: "vl-023", clientId: "vc-003", clientName: "Sunshine Boutique", date: "2026-02-16", description: "Monthly service fee — Growth plan", invoiceNumber: "INV-2026-0216-001", type: "Debit", amount: 149.00, balance: 3889.53, paymentStatus: "Overdue" },
  { id: "vl-024", clientId: "vc-004", clientName: "Mountain Trail Co", date: "2026-02-15", description: "Monthly service fee — Starter plan", invoiceNumber: "INV-2026-0215-001", type: "Debit", amount: 79.00, balance: 3810.53, paymentStatus: "Paid" },
  { id: "vl-025", clientId: "vc-005", clientName: "Luxe Living Dallas", date: "2026-02-14", description: "Fulfillment cost — priority shipping", invoiceNumber: "INV-2026-0214-001", type: "Debit", amount: 225.00, balance: 3585.53, paymentStatus: "Paid" },
  { id: "vl-026", clientId: "vc-001", clientName: "TrendSetters NYC", date: "2026-02-13", description: "Order revenue credit", invoiceNumber: "INV-2026-0213-001", type: "Credit", amount: 345.80, balance: 3931.33, paymentStatus: "Paid" },
  { id: "vl-027", clientId: "vc-006", clientName: "Coastal Vibes Shop", date: "2026-02-12", description: "Order revenue credit", invoiceNumber: "INV-2026-0212-001", type: "Credit", amount: 278.45, balance: 4209.78, paymentStatus: "Paid" },
  { id: "vl-028", clientId: "vc-007", clientName: "Heartland Crafts", date: "2026-02-11", description: "Account credit — onboarding refund", invoiceNumber: "INV-2026-0211-001", type: "Credit", amount: 50.00, balance: 4259.78, paymentStatus: "Pending" },
  { id: "vl-029", clientId: "vc-008", clientName: "Urban Nest Decor", date: "2026-02-10", description: "Monthly service fee — Growth plan", invoiceNumber: "INV-2026-0210-001", type: "Debit", amount: 149.00, balance: 4110.78, paymentStatus: "Overdue" },
  { id: "vl-030", clientId: "vc-002", clientName: "Pacific Home Goods", date: "2026-02-09", description: "Bulk fulfillment credit", invoiceNumber: "INV-2026-0209-001", type: "Credit", amount: 620.00, balance: 4730.78, paymentStatus: "Paid" },
];

export const vendorDashboardStats = {
  newOrders: vendorOrders.filter(o => o.status === "New").length,
  quotedOrders: vendorOrders.filter(o => o.status === "Quoted").length,
  processingOrders: vendorOrders.filter(o => o.status === "Processing").length,
  shippedOrders: vendorOrders.filter(o => o.status === "Shipped").length,
  deliveredOrders: vendorOrders.filter(o => o.status === "Delivered").length,
  cancelledOrders: vendorOrders.filter(o => o.status === "Cancelled").length,
  totalRevenue: +vendorOrders.filter(o => o.status !== "Cancelled").reduce((s, o) => s + o.total, 0).toFixed(2),
  activeClients: vendorClients.filter(c => c.status === "Active").length,
  totalClients: vendorClients.length,
  fulfillmentRate: +(vendorOrders.filter(o => o.status === "Delivered").length / vendorOrders.filter(o => o.status !== "Cancelled").length * 100).toFixed(1),
  avgOrderValue: +(vendorOrders.filter(o => o.status !== "Cancelled").reduce((s, o) => s + o.total, 0) / vendorOrders.filter(o => o.status !== "Cancelled").length).toFixed(2),
  totalProducts: vendorProducts.length,
  totalStores: vendorStores.length,
};
