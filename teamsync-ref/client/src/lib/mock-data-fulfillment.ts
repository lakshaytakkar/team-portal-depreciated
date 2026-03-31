export type FulfillmentStatus =
  | "New"
  | "Source Split"
  | "Vendor Orders Placed"
  | "Partially Received"
  | "Fully Received"
  | "QC In Progress"
  | "QC Passed"
  | "MRP Tagging"
  | "Ready to Ship"
  | "Shipped"
  | "Delivered";

export const FULFILLMENT_STAGES: FulfillmentStatus[] = [
  "New",
  "Source Split",
  "Vendor Orders Placed",
  "Partially Received",
  "Fully Received",
  "QC In Progress",
  "QC Passed",
  "MRP Tagging",
  "Ready to Ship",
  "Shipped",
  "Delivered",
];

export type SupplierSource =
  | "china_haoduobao"
  | "china_allen"
  | "india_deodap"
  | "india_wholesaledock"
  | "india_basketo";

export const SUPPLIER_SOURCES: SupplierSource[] = [
  "china_haoduobao",
  "china_allen",
  "india_deodap",
  "india_wholesaledock",
  "india_basketo",
];

export const SUPPLIER_LABELS: Record<SupplierSource, string> = {
  china_haoduobao: "China – Haoduobao",
  china_allen: "China – Allen",
  india_deodap: "India – Deodap",
  india_wholesaledock: "India – WholeSaleDock",
  india_basketo: "India – Basketo",
};

export const CHINA_SUPPLIERS: SupplierSource[] = ["china_haoduobao", "china_allen"];
export const INDIA_SUPPLIERS: SupplierSource[] = ["india_deodap", "india_wholesaledock", "india_basketo"];

export type VendorOrderStatus = "Pending" | "Ordered" | "Partially Received" | "Received";
export type QCStatus = "Pending" | "In Progress" | "Passed" | "Failed";
export type TaggingStatus = "Pending" | "In Progress" | "Done";
export type BatchStatus = "Active" | "In Transit" | "Received";

export interface FulfillmentOrderItem {
  id: string;
  productName: string;
  sku: string;
  quantity: number;
  mrp: number;
  supplier: SupplierSource;
  barcode: string;
  countryOfOrigin: string;
}

export interface QCProductRecord {
  itemId: string;
  productName: string;
  qty: number;
  checked: number;
  passed: number;
  failed: number;
  notes: string;
}

export interface VendorGroup {
  id: string;
  orderId: string;
  supplier: SupplierSource;
  items: FulfillmentOrderItem[];
  status: VendorOrderStatus;
  referenceNumber?: string;
  expectedArrival?: string;
  orderedQty: number;
  receivedQty: number;
  qcStatus?: QCStatus;
  qcProducts?: QCProductRecord[];
}

export interface FulfillmentOrder {
  id: string;
  orderNumber: string;
  partnerName: string;
  partnerCity: string;
  deliveryAddress: string;
  orderDate: string;
  totalValue: number;
  items: FulfillmentOrderItem[];
  status: FulfillmentStatus;
  vendorGroups?: VendorGroup[];
  shippingProvider?: string;
  trackingNumber?: string;
  expectedDelivery?: string;
  boxCount?: number;
  shippedDate?: string;
  deliveredDate?: string;
  stageEnteredAt?: Partial<Record<FulfillmentStatus, string>>;
}

export interface ChinaBatch {
  id: string;
  batchNumber: string;
  supplier: "china_haoduobao" | "china_allen";
  status: BatchStatus;
  totalItems: number;
  totalCbm: number;
  estimatedShippingCost: number;
  includedOrderIds: string[];
  estimatedArrival: string;
  createdDate: string;
  receivedDate?: string;
}

export interface TaggingQueueItem {
  id: string;
  orderId: string;
  orderNumber: string;
  partnerName: string;
  productName: string;
  sku: string;
  quantityToTag: number;
  mrp: number;
  barcode: string;
  countryOfOrigin: string;
  status: TaggingStatus;
}

export interface DispatchRecord {
  id: string;
  orderId: string;
  orderNumber: string;
  partnerName: string;
  partnerCity: string;
  deliveryAddress: string;
  itemCount: number;
  totalWeight: number;
  shippingProvider: string;
  trackingNumber: string;
  expectedDelivery: string;
  boxCount: number;
  shippedDate: string;
  status: "Shipped" | "Delivered";
}

const ORDER_ITEMS_ORD001: FulfillmentOrderItem[] = [
  { id: "i001-1", productName: "Unicorn Plush Toy 30cm", sku: "TOY-UNI-001", quantity: 24, mrp: 299, supplier: "china_haoduobao", barcode: "8901234001001", countryOfOrigin: "China" },
  { id: "i001-2", productName: "Stainless Steel Tiffin 3-tier", sku: "KIT-TIF-002", quantity: 12, mrp: 499, supplier: "india_deodap", barcode: "8901234001002", countryOfOrigin: "India" },
  { id: "i001-3", productName: "Cartoon Pencil Box", sku: "STN-PNB-003", quantity: 36, mrp: 149, supplier: "china_allen", barcode: "8901234001003", countryOfOrigin: "China" },
];

const ORDER_ITEMS_ORD002: FulfillmentOrderItem[] = [
  { id: "i002-1", productName: "Mini Desk Fan USB", sku: "HME-FAN-004", quantity: 18, mrp: 399, supplier: "china_haoduobao", barcode: "8901234002001", countryOfOrigin: "China" },
  { id: "i002-2", productName: "Bamboo Serving Board", sku: "KIT-BRD-005", quantity: 12, mrp: 249, supplier: "india_wholesaledock", barcode: "8901234002002", countryOfOrigin: "India" },
  { id: "i002-3", productName: "LED Fairy Lights 10m", sku: "DCR-LED-006", quantity: 24, mrp: 199, supplier: "china_allen", barcode: "8901234002003", countryOfOrigin: "China" },
];

const ORDER_ITEMS_ORD003: FulfillmentOrderItem[] = [
  { id: "i003-1", productName: "Building Blocks 100pc", sku: "TOY-BLK-007", quantity: 30, mrp: 599, supplier: "china_haoduobao", barcode: "8901234003001", countryOfOrigin: "China" },
  { id: "i003-2", productName: "Steel Water Bottle 750ml", sku: "KIT-WBT-008", quantity: 20, mrp: 349, supplier: "india_deodap", barcode: "8901234003002", countryOfOrigin: "India" },
  { id: "i003-3", productName: "Gel Pen Set 12pc", sku: "STN-GPN-009", quantity: 48, mrp: 99, supplier: "india_basketo", barcode: "8901234003003", countryOfOrigin: "India" },
];

const ORDER_ITEMS_ORD004: FulfillmentOrderItem[] = [
  { id: "i004-1", productName: "Kids Backpack Dino Print", sku: "BAG-KBP-010", quantity: 15, mrp: 799, supplier: "china_allen", barcode: "8901234004001", countryOfOrigin: "China" },
  { id: "i004-2", productName: "Non-stick Frying Pan 24cm", sku: "KIT-PAN-011", quantity: 10, mrp: 699, supplier: "india_wholesaledock", barcode: "8901234004002", countryOfOrigin: "India" },
];

const ORDER_ITEMS_ORD005: FulfillmentOrderItem[] = [
  { id: "i005-1", productName: "Remote Control Car", sku: "TOY-RCC-012", quantity: 20, mrp: 999, supplier: "china_haoduobao", barcode: "8901234005001", countryOfOrigin: "China" },
  { id: "i005-2", productName: "Ceramic Mug Set 6pc", sku: "KIT-MUG-013", quantity: 12, mrp: 599, supplier: "india_deodap", barcode: "8901234005002", countryOfOrigin: "India" },
  { id: "i005-3", productName: "Origami Paper Pack 200 sheets", sku: "STN-ORP-014", quantity: 36, mrp: 129, supplier: "china_allen", barcode: "8901234005003", countryOfOrigin: "China" },
  { id: "i005-4", productName: "Kitchen Scale Digital 5kg", sku: "KIT-SCL-015", quantity: 8, mrp: 449, supplier: "india_basketo", barcode: "8901234005004", countryOfOrigin: "India" },
];

const ORDER_ITEMS_ORD006: FulfillmentOrderItem[] = [
  { id: "i006-1", productName: "Soft Doll 40cm", sku: "TOY-DLL-016", quantity: 24, mrp: 499, supplier: "china_haoduobao", barcode: "8901234006001", countryOfOrigin: "China" },
  { id: "i006-2", productName: "Plastic Hanger Set 20pc", sku: "HME-HGR-017", quantity: 20, mrp: 199, supplier: "india_wholesaledock", barcode: "8901234006002", countryOfOrigin: "India" },
];

const ORDER_ITEMS_ORD007: FulfillmentOrderItem[] = [
  { id: "i007-1", productName: "Fidget Spinner Pack", sku: "TOY-FSP-018", quantity: 40, mrp: 149, supplier: "china_allen", barcode: "8901234007001", countryOfOrigin: "China" },
  { id: "i007-2", productName: "Chopping Board Bamboo Large", sku: "KIT-CBL-019", quantity: 15, mrp: 299, supplier: "india_deodap", barcode: "8901234007002", countryOfOrigin: "India" },
  { id: "i007-3", productName: "Sticky Note Pack 600 sheets", sku: "STN-SNP-020", quantity: 30, mrp: 149, supplier: "india_basketo", barcode: "8901234007003", countryOfOrigin: "India" },
];

const ORDER_ITEMS_ORD008: FulfillmentOrderItem[] = [
  { id: "i008-1", productName: "Solar System Mobile Toy", sku: "TOY-SSM-021", quantity: 12, mrp: 799, supplier: "china_haoduobao", barcode: "8901234008001", countryOfOrigin: "China" },
  { id: "i008-2", productName: "Lunch Box with Handle", sku: "KIT-LBH-022", quantity: 18, mrp: 349, supplier: "india_wholesaledock", barcode: "8901234008002", countryOfOrigin: "India" },
];

const ORDER_ITEMS_ORD009: FulfillmentOrderItem[] = [
  { id: "i009-1", productName: "Magnetic Drawing Board", sku: "TOY-MDB-023", quantity: 20, mrp: 549, supplier: "china_allen", barcode: "8901234009001", countryOfOrigin: "China" },
  { id: "i009-2", productName: "Steel Spice Box 7-in-1", sku: "KIT-SBX-024", quantity: 10, mrp: 599, supplier: "india_deodap", barcode: "8901234009002", countryOfOrigin: "India" },
  { id: "i009-3", productName: "Colour Pencil Set 24pc", sku: "STN-CPS-025", quantity: 36, mrp: 199, supplier: "india_basketo", barcode: "8901234009003", countryOfOrigin: "India" },
];

const ORDER_ITEMS_ORD010: FulfillmentOrderItem[] = [
  { id: "i010-1", productName: "Bubble Wand Set Kids", sku: "TOY-BWS-026", quantity: 30, mrp: 99, supplier: "china_haoduobao", barcode: "8901234010001", countryOfOrigin: "China" },
  { id: "i010-2", productName: "Glass Jar Set 6pc", sku: "KIT-GJS-027", quantity: 12, mrp: 449, supplier: "india_wholesaledock", barcode: "8901234010002", countryOfOrigin: "India" },
  { id: "i010-3", productName: "Calligraphy Pen Kit", sku: "STN-CPK-028", quantity: 15, mrp: 299, supplier: "india_basketo", barcode: "8901234010003", countryOfOrigin: "India" },
];

const ORDER_ITEMS_ORD011: FulfillmentOrderItem[] = [
  { id: "i011-1", productName: "Wooden Puzzle 48pc", sku: "TOY-WPZ-029", quantity: 24, mrp: 449, supplier: "china_haoduobao", barcode: "8901234011001", countryOfOrigin: "China" },
  { id: "i011-2", productName: "Masala Dabba Steel 7-in-1", sku: "KIT-MDB-030", quantity: 12, mrp: 599, supplier: "india_deodap", barcode: "8901234011002", countryOfOrigin: "India" },
  { id: "i011-3", productName: "Sketch Book A4 50 sheets", sku: "STN-SKB-031", quantity: 36, mrp: 99, supplier: "india_basketo", barcode: "8901234011003", countryOfOrigin: "India" },
];

function makeQCProducts(items: FulfillmentOrderItem[]): QCProductRecord[] {
  return items.map(item => ({
    itemId: item.id,
    productName: item.productName,
    qty: item.quantity,
    checked: item.quantity,
    passed: Math.floor(item.quantity * 0.97),
    failed: Math.ceil(item.quantity * 0.03),
    notes: "",
  }));
}

function makeVendorGroups(orderId: string, items: FulfillmentOrderItem[], status: FulfillmentStatus): VendorGroup[] {
  const grouped: Record<string, FulfillmentOrderItem[]> = {};
  for (const item of items) {
    if (!grouped[item.supplier]) grouped[item.supplier] = [];
    grouped[item.supplier].push(item);
  }

  return Object.entries(grouped).map(([supplier, grpItems], idx) => {
    const orderedQty = grpItems.reduce((s, i) => s + i.quantity, 0);
    const sup = supplier as SupplierSource;

    const baseGroup: VendorGroup = {
      id: `${orderId}-vg-${idx + 1}`,
      orderId,
      supplier: sup,
      items: grpItems,
      status: "Pending",
      orderedQty,
      receivedQty: 0,
    };

    const atOrPast = (stage: FulfillmentStatus) => {
      const stageIndex = FULFILLMENT_STAGES.indexOf(stage);
      const orderIndex = FULFILLMENT_STAGES.indexOf(status);
      return orderIndex >= stageIndex;
    };

    if (atOrPast("Vendor Orders Placed")) {
      baseGroup.status = "Ordered";
      baseGroup.referenceNumber = `REF-${orderId.slice(-4)}-${sup.slice(0, 3).toUpperCase()}-${1000 + idx}`;
      baseGroup.expectedArrival = "2026-04-10";
    }
    if (status === "Partially Received") {
      baseGroup.status = "Partially Received";
      baseGroup.receivedQty = Math.floor(orderedQty * 0.6);
    }
    if (atOrPast("Fully Received")) {
      baseGroup.status = "Received";
      baseGroup.receivedQty = orderedQty;
    }
    if (atOrPast("QC In Progress")) {
      baseGroup.qcStatus = atOrPast("QC Passed") ? "Passed" : "In Progress";
      baseGroup.qcProducts = makeQCProducts(grpItems);
    }

    return baseGroup;
  });
}

export const fulfillmentOrders: FulfillmentOrder[] = [
  {
    id: "ORD-F001",
    orderNumber: "FO-2401",
    partnerName: "Meena Singh",
    partnerCity: "Lucknow",
    deliveryAddress: "42 Hazratganj, Lucknow, UP 226001",
    orderDate: "2026-03-01",
    totalValue: 128000,
    items: ORDER_ITEMS_ORD001,
    status: "New",
    stageEnteredAt: { "New": "2026-03-01" },
  },
  {
    id: "ORD-F002",
    orderNumber: "FO-2402",
    partnerName: "Anita Sharma",
    partnerCity: "Agra",
    deliveryAddress: "17 Sanjay Place, Agra, UP 282002",
    orderDate: "2026-02-26",
    totalValue: 95000,
    items: ORDER_ITEMS_ORD002,
    status: "Source Split",
    stageEnteredAt: { "New": "2026-02-26", "Source Split": "2026-02-27" },
  },
  {
    id: "ORD-F003",
    orderNumber: "FO-2403",
    partnerName: "Kiran Patel",
    partnerCity: "Vadodara",
    deliveryAddress: "5 Alkapuri, Vadodara, GJ 390007",
    orderDate: "2026-02-20",
    totalValue: 112000,
    items: ORDER_ITEMS_ORD003,
    status: "Vendor Orders Placed",
    vendorGroups: makeVendorGroups("ORD-F003", ORDER_ITEMS_ORD003, "Vendor Orders Placed"),
    stageEnteredAt: { "New": "2026-02-20", "Source Split": "2026-02-21", "Vendor Orders Placed": "2026-02-22" },
  },
  {
    id: "ORD-F004",
    orderNumber: "FO-2404",
    partnerName: "Prashant Yadav",
    partnerCity: "Kanpur",
    deliveryAddress: "88 Civil Lines, Kanpur, UP 208001",
    orderDate: "2026-02-15",
    totalValue: 78000,
    items: ORDER_ITEMS_ORD004,
    status: "Partially Received",
    vendorGroups: makeVendorGroups("ORD-F004", ORDER_ITEMS_ORD004, "Partially Received"),
    stageEnteredAt: { "New": "2026-02-15", "Source Split": "2026-02-16", "Vendor Orders Placed": "2026-02-17", "Partially Received": "2026-02-25" },
  },
  {
    id: "ORD-F005",
    orderNumber: "FO-2405",
    partnerName: "Sunita Devi",
    partnerCity: "Bhopal",
    deliveryAddress: "33 MP Nagar, Bhopal, MP 462011",
    orderDate: "2026-02-10",
    totalValue: 185000,
    items: ORDER_ITEMS_ORD005,
    status: "Fully Received",
    vendorGroups: makeVendorGroups("ORD-F005", ORDER_ITEMS_ORD005, "Fully Received"),
    stageEnteredAt: { "New": "2026-02-10", "Source Split": "2026-02-11", "Vendor Orders Placed": "2026-02-12", "Partially Received": "2026-02-20", "Fully Received": "2026-02-28" },
  },
  {
    id: "ORD-F006",
    orderNumber: "FO-2406",
    partnerName: "Ramesh Joshi",
    partnerCity: "Jaipur",
    deliveryAddress: "12 C-Scheme, Jaipur, RJ 302001",
    orderDate: "2026-02-05",
    totalValue: 92000,
    items: ORDER_ITEMS_ORD006,
    status: "QC In Progress",
    vendorGroups: makeVendorGroups("ORD-F006", ORDER_ITEMS_ORD006, "QC In Progress"),
    stageEnteredAt: { "New": "2026-02-05", "Source Split": "2026-02-06", "Vendor Orders Placed": "2026-02-07", "Fully Received": "2026-02-18", "QC In Progress": "2026-02-28" },
  },
  {
    id: "ORD-F007",
    orderNumber: "FO-2407",
    partnerName: "Lalita Mishra",
    partnerCity: "Varanasi",
    deliveryAddress: "7 Sigra, Varanasi, UP 221010",
    orderDate: "2026-01-28",
    totalValue: 143000,
    items: ORDER_ITEMS_ORD007,
    status: "QC Passed",
    vendorGroups: makeVendorGroups("ORD-F007", ORDER_ITEMS_ORD007, "QC Passed"),
    stageEnteredAt: { "New": "2026-01-28", "Source Split": "2026-01-29", "Vendor Orders Placed": "2026-01-30", "Fully Received": "2026-02-10", "QC In Progress": "2026-02-20", "QC Passed": "2026-02-25" },
  },
  {
    id: "ORD-F008",
    orderNumber: "FO-2408",
    partnerName: "Ajay Verma",
    partnerCity: "Indore",
    deliveryAddress: "55 Vijay Nagar, Indore, MP 452010",
    orderDate: "2026-01-22",
    totalValue: 116000,
    items: ORDER_ITEMS_ORD008,
    status: "MRP Tagging",
    vendorGroups: makeVendorGroups("ORD-F008", ORDER_ITEMS_ORD008, "MRP Tagging"),
    stageEnteredAt: { "New": "2026-01-22", "Source Split": "2026-01-23", "Vendor Orders Placed": "2026-01-24", "Fully Received": "2026-02-05", "QC In Progress": "2026-02-12", "QC Passed": "2026-02-18", "MRP Tagging": "2026-02-25" },
  },
  {
    id: "ORD-F009",
    orderNumber: "FO-2409",
    partnerName: "Priya Kapoor",
    partnerCity: "Pune",
    deliveryAddress: "22 Koregaon Park, Pune, MH 411001",
    orderDate: "2026-01-15",
    totalValue: 164000,
    items: ORDER_ITEMS_ORD009,
    status: "Ready to Ship",
    vendorGroups: makeVendorGroups("ORD-F009", ORDER_ITEMS_ORD009, "Ready to Ship"),
    stageEnteredAt: { "New": "2026-01-15", "Source Split": "2026-01-16", "Vendor Orders Placed": "2026-01-17", "Fully Received": "2026-01-28", "QC In Progress": "2026-02-05", "QC Passed": "2026-02-10", "MRP Tagging": "2026-02-17", "Ready to Ship": "2026-02-22" },
  },
  {
    id: "ORD-F010",
    orderNumber: "FO-2410",
    partnerName: "Nilesh Gupta",
    partnerCity: "Ahmedabad",
    deliveryAddress: "3 CG Road, Ahmedabad, GJ 380006",
    orderDate: "2026-01-08",
    totalValue: 98000,
    items: ORDER_ITEMS_ORD010,
    status: "Shipped",
    vendorGroups: makeVendorGroups("ORD-F010", ORDER_ITEMS_ORD010, "Shipped"),
    shippingProvider: "Delhivery",
    trackingNumber: "DL2026031501",
    expectedDelivery: "2026-03-20",
    boxCount: 4,
    shippedDate: "2026-03-15",
    stageEnteredAt: { "New": "2026-01-08", "Shipped": "2026-03-15" },
  },
  {
    id: "ORD-F011",
    orderNumber: "FO-2411",
    partnerName: "Sonal Bhatt",
    partnerCity: "Surat",
    deliveryAddress: "9 Athwa Lines, Surat, GJ 395001",
    orderDate: "2025-12-20",
    totalValue: 134000,
    items: ORDER_ITEMS_ORD011,
    status: "Delivered",
    vendorGroups: makeVendorGroups("ORD-F011", ORDER_ITEMS_ORD011, "Delivered"),
    shippingProvider: "BlueDart",
    trackingNumber: "BD2026010201",
    expectedDelivery: "2026-01-10",
    boxCount: 5,
    shippedDate: "2026-01-05",
    deliveredDate: "2026-01-10",
    stageEnteredAt: { "New": "2025-12-20", "Shipped": "2026-01-05", "Delivered": "2026-01-10" },
  },
];

export const chinaBatches: ChinaBatch[] = [
  {
    id: "BATCH-C001",
    batchNumber: "CB-2026-001",
    supplier: "china_haoduobao",
    status: "In Transit",
    totalItems: 86,
    totalCbm: 3.2,
    estimatedShippingCost: 25600,
    includedOrderIds: ["ORD-F001", "ORD-F003", "ORD-F005"],
    estimatedArrival: "2026-04-12",
    createdDate: "2026-03-01",
  },
  {
    id: "BATCH-C002",
    batchNumber: "CB-2026-002",
    supplier: "china_allen",
    status: "Active",
    totalItems: 127,
    totalCbm: 4.8,
    estimatedShippingCost: 38400,
    includedOrderIds: ["ORD-F002", "ORD-F004", "ORD-F006"],
    estimatedArrival: "2026-04-25",
    createdDate: "2026-03-10",
  },
];

export const taggingQueue: TaggingQueueItem[] = [
  { id: "TQ001", orderId: "ORD-F008", orderNumber: "FO-2408", partnerName: "Ajay Verma", productName: "Solar System Mobile Toy", sku: "TOY-SSM-021", quantityToTag: 12, mrp: 799, barcode: "8901234008001", countryOfOrigin: "China", status: "In Progress" },
  { id: "TQ002", orderId: "ORD-F008", orderNumber: "FO-2408", partnerName: "Ajay Verma", productName: "Lunch Box with Handle", sku: "KIT-LBH-022", quantityToTag: 18, mrp: 349, barcode: "8901234008002", countryOfOrigin: "India", status: "Pending" },
  { id: "TQ003", orderId: "ORD-F007", orderNumber: "FO-2407", partnerName: "Lalita Mishra", productName: "Fidget Spinner Pack", sku: "TOY-FSP-018", quantityToTag: 40, mrp: 149, barcode: "8901234007001", countryOfOrigin: "China", status: "Done" },
  { id: "TQ004", orderId: "ORD-F007", orderNumber: "FO-2407", partnerName: "Lalita Mishra", productName: "Chopping Board Bamboo Large", sku: "KIT-CBL-019", quantityToTag: 15, mrp: 299, barcode: "8901234007002", countryOfOrigin: "India", status: "Done" },
  { id: "TQ005", orderId: "ORD-F007", orderNumber: "FO-2407", partnerName: "Lalita Mishra", productName: "Sticky Note Pack 600 sheets", sku: "STN-SNP-020", quantityToTag: 30, mrp: 149, barcode: "8901234007003", countryOfOrigin: "India", status: "Pending" },
];

export const dispatchRecords: DispatchRecord[] = [
  {
    id: "DISP001",
    orderId: "ORD-F010",
    orderNumber: "FO-2410",
    partnerName: "Nilesh Gupta",
    partnerCity: "Ahmedabad",
    deliveryAddress: "3 CG Road, Ahmedabad, GJ 380006",
    itemCount: 57,
    totalWeight: 28.5,
    shippingProvider: "Delhivery",
    trackingNumber: "DL2026031501",
    expectedDelivery: "2026-03-20",
    boxCount: 4,
    shippedDate: "2026-03-15",
    status: "Shipped",
  },
];

export const OVERDUE_THRESHOLDS_DAYS: Partial<Record<FulfillmentStatus, number>> = {
  "New": 2,
  "Source Split": 1,
  "Vendor Orders Placed": 7,
  "Partially Received": 14,
  "Fully Received": 2,
  "QC In Progress": 3,
  "QC Passed": 2,
  "MRP Tagging": 3,
  "Ready to Ship": 1,
  "Shipped": 10,
};

export function getDaysInStage(order: FulfillmentOrder): number {
  const entered = order.stageEnteredAt?.[order.status];
  if (!entered) return 0;
  const now = new Date("2026-03-26");
  const enteredDate = new Date(entered);
  return Math.floor((now.getTime() - enteredDate.getTime()) / (1000 * 60 * 60 * 24));
}

export function isOrderOverdue(order: FulfillmentOrder): boolean {
  const threshold = OVERDUE_THRESHOLDS_DAYS[order.status];
  if (threshold === undefined) return false;
  return getDaysInStage(order) > threshold;
}

export function getOrderUrgency(order: FulfillmentOrder): "green" | "yellow" | "red" {
  const now = new Date("2026-03-26");
  const ordered = new Date(order.orderDate);
  const days = Math.floor((now.getTime() - ordered.getTime()) / (1000 * 60 * 60 * 24));
  if (days < 3) return "green";
  if (days <= 7) return "yellow";
  return "red";
}

export function buildTaggingItems(order: FulfillmentOrder): TaggingQueueItem[] {
  return order.items.map(item => ({
    id: `tq-${order.id}-${item.id}`,
    orderId: order.id,
    orderNumber: order.orderNumber,
    partnerName: order.partnerName,
    productName: item.productName,
    sku: item.sku,
    quantityToTag: item.quantity,
    mrp: item.mrp,
    barcode: item.barcode,
    countryOfOrigin: item.countryOfOrigin,
    status: "Pending" as TaggingStatus,
  }));
}
