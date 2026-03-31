export type OpsStage =
  | "token-paid"
  | "space-confirmed"
  | "design-phase"
  | "interior-construction"
  | "inventory-ordered"
  | "goods-at-warehouse"
  | "mrp-tagging"
  | "dispatched"
  | "store-ready"
  | "launched";

export const OPS_STAGES: OpsStage[] = [
  "token-paid",
  "space-confirmed",
  "design-phase",
  "interior-construction",
  "inventory-ordered",
  "goods-at-warehouse",
  "mrp-tagging",
  "dispatched",
  "store-ready",
  "launched",
];

export const OPS_STAGE_LABELS: Record<OpsStage, string> = {
  "token-paid": "Token Paid",
  "space-confirmed": "Space Confirmed",
  "design-phase": "Design Phase",
  "interior-construction": "Interior Construction",
  "inventory-ordered": "Inventory Ordered",
  "goods-at-warehouse": "Goods at Warehouse",
  "mrp-tagging": "MRP Tagging",
  "dispatched": "Dispatched",
  "store-ready": "Store Ready",
  "launched": "Launched",
};

export type PackageTier = "lite" | "pro" | "elite";

export interface OpsClient {
  id: string;
  name: string;
  city: string;
  storeAddress: string;
  storeArea: number;
  package: PackageTier;
  assignedSales: string;
  opsManager: string;
  phone: string;
  email: string;
  currentStage: OpsStage;
  tokenPaidDate: string;
  estimatedLaunchDate: string;
  checklistCompletion: number;
  batchId: string;
}

export const mockOpsClients: OpsClient[] = [
  {
    id: "OC001",
    name: "Meena Singh",
    city: "Lucknow",
    storeAddress: "Shop 12, Gomti Nagar Market, Lucknow",
    storeArea: 850,
    package: "pro",
    assignedSales: "Harsh",
    opsManager: "Aditya",
    phone: "+91 98765 43210",
    email: "meena.singh@gmail.com",
    currentStage: "dispatched",
    tokenPaidDate: "2026-01-10",
    estimatedLaunchDate: "2026-04-01",
    checklistCompletion: 78,
    batchId: "BATCH-2026-Q1-A",
  },
  {
    id: "OC002",
    name: "Prashant Yadav",
    city: "Kanpur",
    storeAddress: "Plot 5, Naveen Market, Kanpur",
    storeArea: 650,
    package: "lite",
    assignedSales: "Suprans",
    opsManager: "Aditya",
    phone: "+91 97654 32109",
    email: "prashant.yadav@gmail.com",
    currentStage: "interior-construction",
    tokenPaidDate: "2026-01-25",
    estimatedLaunchDate: "2026-04-20",
    checklistCompletion: 35,
    batchId: "BATCH-2026-Q1-A",
  },
  {
    id: "OC003",
    name: "Anita Sharma",
    city: "Agra",
    storeAddress: "G-7, Sanjay Place Complex, Agra",
    storeArea: 1000,
    package: "elite",
    assignedSales: "Harsh",
    opsManager: "Aditya",
    phone: "+91 96543 21098",
    email: "anita.sharma@gmail.com",
    currentStage: "design-phase",
    tokenPaidDate: "2026-02-05",
    estimatedLaunchDate: "2026-05-10",
    checklistCompletion: 22,
    batchId: "BATCH-2026-Q1-B",
  },
  {
    id: "OC004",
    name: "Sonal Gupta",
    city: "Ahmedabad",
    storeAddress: "Shop 23, SG Highway Mall, Ahmedabad",
    storeArea: 750,
    package: "pro",
    assignedSales: "Suprans",
    opsManager: "Aditya",
    phone: "+91 95432 10987",
    email: "sonal.gupta@gmail.com",
    currentStage: "goods-at-warehouse",
    tokenPaidDate: "2026-01-18",
    estimatedLaunchDate: "2026-03-30",
    checklistCompletion: 65,
    batchId: "BATCH-2026-Q1-A",
  },
  {
    id: "OC005",
    name: "Kiran Patel",
    city: "Vadodara",
    storeAddress: "14-A, Alkapuri Shopping Centre, Vadodara",
    storeArea: 900,
    package: "pro",
    assignedSales: "Harsh",
    opsManager: "Aditya",
    phone: "+91 94321 09876",
    email: "kiran.patel@gmail.com",
    currentStage: "inventory-ordered",
    tokenPaidDate: "2026-02-01",
    estimatedLaunchDate: "2026-04-25",
    checklistCompletion: 48,
    batchId: "BATCH-2026-Q1-B",
  },
  {
    id: "OC006",
    name: "Rajesh Mehta",
    city: "Jaipur",
    storeAddress: "C-5, Tonk Road Commercial Complex, Jaipur",
    storeArea: 600,
    package: "lite",
    assignedSales: "Suprans",
    opsManager: "Aditya",
    phone: "+91 93210 98765",
    email: "rajesh.mehta@gmail.com",
    currentStage: "store-ready",
    tokenPaidDate: "2025-12-15",
    estimatedLaunchDate: "2026-03-28",
    checklistCompletion: 92,
    batchId: "BATCH-2026-Q1-A",
  },
  {
    id: "OC007",
    name: "Sunita Verma",
    city: "Bhopal",
    storeAddress: "Shop 8, MP Nagar Zone 1, Bhopal",
    storeArea: 700,
    package: "pro",
    assignedSales: "Harsh",
    opsManager: "Aditya",
    phone: "+91 92109 87654",
    email: "sunita.verma@gmail.com",
    currentStage: "space-confirmed",
    tokenPaidDate: "2026-02-20",
    estimatedLaunchDate: "2026-05-30",
    checklistCompletion: 12,
    batchId: "BATCH-2026-Q1-B",
  },
  {
    id: "OC008",
    name: "Deepak Joshi",
    city: "Pune",
    storeAddress: "Shop 3, Aundh Market, Pune",
    storeArea: 800,
    package: "elite",
    assignedSales: "Suprans",
    opsManager: "Aditya",
    phone: "+91 91098 76543",
    email: "deepak.joshi@gmail.com",
    currentStage: "mrp-tagging",
    tokenPaidDate: "2026-01-05",
    estimatedLaunchDate: "2026-03-22",
    checklistCompletion: 85,
    batchId: "BATCH-2026-Q1-A",
  },
];

export type MilestoneType = "token" | "space-confirmed" | "interior-start" | "inventory-order" | "goods-ready";

export const MILESTONE_LABELS: Record<MilestoneType, string> = {
  "token": "Token Payment",
  "space-confirmed": "Space Confirmed",
  "interior-start": "Interior Start",
  "inventory-order": "Inventory Order",
  "goods-ready": "Goods Ready",
};

export interface MilestonePayment {
  id: string;
  clientId: string;
  type: MilestoneType;
  amountDue: number;
  dueDate: string;
  isPaid: boolean;
  paidDate?: string;
  paymentMethod?: "bank-transfer" | "upi" | "cheque" | "cash";
  notes?: string;
}

export const mockMilestonePayments: MilestonePayment[] = [
  { id: "MP001", clientId: "OC001", type: "token", amountDue: 50000, dueDate: "2026-01-10", isPaid: true, paidDate: "2026-01-10", paymentMethod: "bank-transfer" },
  { id: "MP002", clientId: "OC001", type: "space-confirmed", amountDue: 150000, dueDate: "2026-01-25", isPaid: true, paidDate: "2026-01-27", paymentMethod: "bank-transfer" },
  { id: "MP003", clientId: "OC001", type: "interior-start", amountDue: 200000, dueDate: "2026-02-10", isPaid: true, paidDate: "2026-02-12", paymentMethod: "upi" },
  { id: "MP004", clientId: "OC001", type: "inventory-order", amountDue: 300000, dueDate: "2026-02-28", isPaid: true, paidDate: "2026-03-01", paymentMethod: "bank-transfer" },
  { id: "MP005", clientId: "OC001", type: "goods-ready", amountDue: 150000, dueDate: "2026-03-20", isPaid: false },

  { id: "MP006", clientId: "OC002", type: "token", amountDue: 35000, dueDate: "2026-01-25", isPaid: true, paidDate: "2026-01-25", paymentMethod: "upi" },
  { id: "MP007", clientId: "OC002", type: "space-confirmed", amountDue: 100000, dueDate: "2026-02-08", isPaid: true, paidDate: "2026-02-10", paymentMethod: "cheque" },
  { id: "MP008", clientId: "OC002", type: "interior-start", amountDue: 150000, dueDate: "2026-02-25", isPaid: false },
  { id: "MP009", clientId: "OC002", type: "inventory-order", amountDue: 200000, dueDate: "2026-03-15", isPaid: false },
  { id: "MP010", clientId: "OC002", type: "goods-ready", amountDue: 100000, dueDate: "2026-04-05", isPaid: false },

  { id: "MP011", clientId: "OC003", type: "token", amountDue: 75000, dueDate: "2026-02-05", isPaid: true, paidDate: "2026-02-05", paymentMethod: "bank-transfer" },
  { id: "MP012", clientId: "OC003", type: "space-confirmed", amountDue: 200000, dueDate: "2026-02-20", isPaid: true, paidDate: "2026-02-22", paymentMethod: "bank-transfer" },
  { id: "MP013", clientId: "OC003", type: "interior-start", amountDue: 250000, dueDate: "2026-03-10", isPaid: false },
  { id: "MP014", clientId: "OC003", type: "inventory-order", amountDue: 400000, dueDate: "2026-04-01", isPaid: false },
  { id: "MP015", clientId: "OC003", type: "goods-ready", amountDue: 200000, dueDate: "2026-04-25", isPaid: false },

  { id: "MP016", clientId: "OC004", type: "token", amountDue: 50000, dueDate: "2026-01-18", isPaid: true, paidDate: "2026-01-18", paymentMethod: "upi" },
  { id: "MP017", clientId: "OC004", type: "space-confirmed", amountDue: 150000, dueDate: "2026-02-01", isPaid: true, paidDate: "2026-02-03", paymentMethod: "bank-transfer" },
  { id: "MP018", clientId: "OC004", type: "interior-start", amountDue: 180000, dueDate: "2026-02-20", isPaid: true, paidDate: "2026-02-20", paymentMethod: "bank-transfer" },
  { id: "MP019", clientId: "OC004", type: "inventory-order", amountDue: 250000, dueDate: "2026-03-05", isPaid: true, paidDate: "2026-03-08", paymentMethod: "upi" },
  { id: "MP020", clientId: "OC004", type: "goods-ready", amountDue: 120000, dueDate: "2026-03-20", isPaid: false },

  { id: "MP026", clientId: "OC005", type: "token", amountDue: 50000, dueDate: "2026-02-01", isPaid: true, paidDate: "2026-02-01", paymentMethod: "upi" },
  { id: "MP027", clientId: "OC005", type: "space-confirmed", amountDue: 150000, dueDate: "2026-02-15", isPaid: true, paidDate: "2026-02-17", paymentMethod: "bank-transfer" },
  { id: "MP028", clientId: "OC005", type: "interior-start", amountDue: 180000, dueDate: "2026-03-01", isPaid: true, paidDate: "2026-03-02", paymentMethod: "cheque" },
  { id: "MP029", clientId: "OC005", type: "inventory-order", amountDue: 250000, dueDate: "2026-03-20", isPaid: false },
  { id: "MP030", clientId: "OC005", type: "goods-ready", amountDue: 120000, dueDate: "2026-04-15", isPaid: false },

  { id: "MP031", clientId: "OC007", type: "token", amountDue: 50000, dueDate: "2026-02-20", isPaid: true, paidDate: "2026-02-20", paymentMethod: "bank-transfer" },
  { id: "MP032", clientId: "OC007", type: "space-confirmed", amountDue: 140000, dueDate: "2026-03-05", isPaid: false },
  { id: "MP033", clientId: "OC007", type: "interior-start", amountDue: 160000, dueDate: "2026-03-25", isPaid: false },
  { id: "MP034", clientId: "OC007", type: "inventory-order", amountDue: 220000, dueDate: "2026-04-20", isPaid: false },
  { id: "MP035", clientId: "OC007", type: "goods-ready", amountDue: 110000, dueDate: "2026-05-10", isPaid: false },

  { id: "MP036", clientId: "OC008", type: "token", amountDue: 75000, dueDate: "2026-01-05", isPaid: true, paidDate: "2026-01-05", paymentMethod: "bank-transfer" },
  { id: "MP037", clientId: "OC008", type: "space-confirmed", amountDue: 200000, dueDate: "2026-01-20", isPaid: true, paidDate: "2026-01-22", paymentMethod: "bank-transfer" },
  { id: "MP038", clientId: "OC008", type: "interior-start", amountDue: 250000, dueDate: "2026-02-10", isPaid: true, paidDate: "2026-02-11", paymentMethod: "bank-transfer" },
  { id: "MP039", clientId: "OC008", type: "inventory-order", amountDue: 350000, dueDate: "2026-02-28", isPaid: true, paidDate: "2026-03-01", paymentMethod: "upi" },
  { id: "MP040", clientId: "OC008", type: "goods-ready", amountDue: 180000, dueDate: "2026-03-15", isPaid: true, paidDate: "2026-03-15", paymentMethod: "bank-transfer" },

  { id: "MP021", clientId: "OC006", type: "token", amountDue: 35000, dueDate: "2025-12-15", isPaid: true, paidDate: "2025-12-15", paymentMethod: "bank-transfer" },
  { id: "MP022", clientId: "OC006", type: "space-confirmed", amountDue: 100000, dueDate: "2025-12-30", isPaid: true, paidDate: "2026-01-02", paymentMethod: "bank-transfer" },
  { id: "MP023", clientId: "OC006", type: "interior-start", amountDue: 130000, dueDate: "2026-01-20", isPaid: true, paidDate: "2026-01-22", paymentMethod: "cheque" },
  { id: "MP024", clientId: "OC006", type: "inventory-order", amountDue: 180000, dueDate: "2026-02-10", isPaid: true, paidDate: "2026-02-12", paymentMethod: "bank-transfer" },
  { id: "MP025", clientId: "OC006", type: "goods-ready", amountDue: 90000, dueDate: "2026-03-10", isPaid: true, paidDate: "2026-03-10", paymentMethod: "upi" },
];

export type ChecklistCategory =
  | "Infrastructure"
  | "Fixtures"
  | "Inventory"
  | "Billing"
  | "Staff"
  | "Legal"
  | "Launch Prep";

export interface ChecklistItem {
  id: string;
  category: ChecklistCategory;
  label: string;
  opsOnly: boolean;
  description: string;
}

export const CHECKLIST_CATEGORIES: ChecklistCategory[] = [
  "Infrastructure",
  "Fixtures",
  "Inventory",
  "Billing",
  "Staff",
  "Legal",
  "Launch Prep",
];

export const mockChecklist: ChecklistItem[] = [
  { id: "CL001", category: "Infrastructure", label: "Electrical wiring complete", opsOnly: true, description: "All outlets, DB board, and AC points installed and tested." },
  { id: "CL002", category: "Infrastructure", label: "Flooring laid and finished", opsOnly: false, description: "Tiles or vinyl flooring complete across entire store area." },
  { id: "CL003", category: "Infrastructure", label: "False ceiling done", opsOnly: false, description: "False ceiling with coves and lighting cutouts complete." },
  { id: "CL004", category: "Infrastructure", label: "Air conditioning installed", opsOnly: true, description: "AC units installed, tested, and operational." },
  { id: "CL005", category: "Infrastructure", label: "Internet connection active", opsOnly: false, description: "Broadband connection live with static IP if required." },
  { id: "CL006", category: "Infrastructure", label: "Washroom ready", opsOnly: false, description: "Staff washroom plumbing and fixtures in place." },
  { id: "CL007", category: "Infrastructure", label: "Fire extinguisher placed", opsOnly: true, description: "ABC type fire extinguisher mounted at checkout counter." },

  { id: "CL008", category: "Fixtures", label: "Gondola shelving installed", opsOnly: true, description: "All freestanding gondola units bolted and leveled." },
  { id: "CL009", category: "Fixtures", label: "Wall shelving mounted", opsOnly: true, description: "Perimeter wall shelves with brackets fitted and tested for load." },
  { id: "CL010", category: "Fixtures", label: "Checkout counter in place", opsOnly: true, description: "L-shaped counter with cable management installed." },
  { id: "CL011", category: "Fixtures", label: "Feature wall display rack up", opsOnly: true, description: "Slatwall panel system at store entrance fitted." },
  { id: "CL012", category: "Fixtures", label: "LED track lights fitted", opsOnly: true, description: "Spotlights on tracks adjusted to illuminate key SKUs." },
  { id: "CL013", category: "Fixtures", label: "Fascia signboard installed", opsOnly: true, description: "Illuminated storefront fascia with brand name lit up." },
  { id: "CL014", category: "Fixtures", label: "Interior brand graphics applied", opsOnly: true, description: "Vinyl wall wrap on brand wall and entrance." },
  { id: "CL015", category: "Fixtures", label: "Price tag holders on shelves", opsOnly: false, description: "Snap-in acrylic label holders placed on gondola edges." },

  { id: "CL016", category: "Inventory", label: "First shipment received at warehouse", opsOnly: true, description: "All cartons unloaded and counted at Delhi warehouse." },
  { id: "CL017", category: "Inventory", label: "QC inspection completed", opsOnly: true, description: "Quality check done, defective units quarantined." },
  { id: "CL018", category: "Inventory", label: "MRP stickers applied to all units", opsOnly: true, description: "Every SKU stickered with MRP, brand, and country of origin." },
  { id: "CL019", category: "Inventory", label: "Inventory dispatched to store", opsOnly: true, description: "Final consignment dispatched to partner store address." },
  { id: "CL020", category: "Inventory", label: "Stock received and counted at store", opsOnly: false, description: "Partner confirms stock received and counts match PO." },
  { id: "CL021", category: "Inventory", label: "Inventory entered in POS system", opsOnly: false, description: "All SKUs with barcodes added to POS inventory module." },
  { id: "CL022", category: "Inventory", label: "Shelf arrangement planogram followed", opsOnly: false, description: "Products placed per ETS category planogram guide." },

  { id: "CL023", category: "Billing", label: "POS hardware installed", opsOnly: true, description: "POS terminal, barcode scanner, and receipt printer connected." },
  { id: "CL024", category: "Billing", label: "POS software activated", opsOnly: true, description: "ETS POS license activated and linked to store account." },
  { id: "CL025", category: "Billing", label: "GST number entered in POS", opsOnly: false, description: "Store GST registration number configured in system." },
  { id: "CL026", category: "Billing", label: "Test transactions completed", opsOnly: true, description: "At least 5 test sale + return transactions verified." },
  { id: "CL027", category: "Billing", label: "Cash drawer configured", opsOnly: false, description: "Cash drawer opens on print command from POS." },
  { id: "CL028", category: "Billing", label: "Payment QR codes displayed", opsOnly: false, description: "UPI QR code printed and placed at counter." },

  { id: "CL029", category: "Staff", label: "Owner trained on POS billing", opsOnly: true, description: "Owner attended POS training session with ops team." },
  { id: "CL030", category: "Staff", label: "Staff hired (min 1 cashier)", opsOnly: false, description: "At least one trained billing staff member ready." },
  { id: "CL031", category: "Staff", label: "Staff trained on stock receive", opsOnly: true, description: "Staff can do stock receive workflow in POS." },
  { id: "CL032", category: "Staff", label: "Uniform / dress code ready", opsOnly: false, description: "Staff in ETS-branded or approved attire." },
  { id: "CL033", category: "Staff", label: "Shift schedule prepared", opsOnly: false, description: "Opening hours and staff roster finalized." },

  { id: "CL034", category: "Legal", label: "GST registration obtained", opsOnly: false, description: "Partner holds valid GST certificate for store location." },
  { id: "CL035", category: "Legal", label: "Shop & establishment license", opsOnly: false, description: "Municipal shop license obtained before opening." },
  { id: "CL036", category: "Legal", label: "Trade license obtained", opsOnly: false, description: "Local trade license for retail operations." },
  { id: "CL037", category: "Legal", label: "Franchise agreement signed", opsOnly: true, description: "Signed franchise agreement copy on file with ops." },
  { id: "CL038", category: "Legal", label: "Insurance coverage in place", opsOnly: false, description: "Store contents insurance policy active." },

  { id: "CL039", category: "Launch Prep", label: "Opening stock display ready", opsOnly: false, description: "All shelves stocked and visually appealing." },
  { id: "CL040", category: "Launch Prep", label: "Social media posts scheduled", opsOnly: false, description: "Opening day Instagram and WhatsApp posts prepared." },
  { id: "CL041", category: "Launch Prep", label: "Launch discount / offer planned", opsOnly: false, description: "Opening week promotional offers decided." },
  { id: "CL042", category: "Launch Prep", label: "ETS regional manager visit done", opsOnly: true, description: "Pre-launch inspection by ETS ops or regional manager." },
  { id: "CL043", category: "Launch Prep", label: "Photographer booked for opening", opsOnly: false, description: "Professional photos of the store planned." },
  { id: "CL044", category: "Launch Prep", label: "Opening date communicated to ETS", opsOnly: true, description: "Launch date confirmed and logged in system." },
];

export interface ClientChecklistState {
  clientId: string;
  completedItems: string[];
}

export const mockClientChecklistStates: ClientChecklistState[] = [
  {
    clientId: "OC001",
    completedItems: [
      "CL001","CL002","CL003","CL004","CL005","CL006","CL007",
      "CL008","CL009","CL010","CL011","CL012","CL013","CL014","CL015",
      "CL016","CL017","CL018","CL019","CL020","CL021","CL022",
      "CL023","CL024","CL025","CL026","CL027",
      "CL029","CL030","CL031",
      "CL034","CL037",
    ],
  },
  {
    clientId: "OC002",
    completedItems: [
      "CL001","CL002","CL003","CL005",
      "CL008","CL009",
      "CL034","CL037",
    ],
  },
  {
    clientId: "OC003",
    completedItems: [
      "CL001","CL002",
      "CL034","CL037",
    ],
  },
  {
    clientId: "OC004",
    completedItems: [
      "CL001","CL002","CL003","CL004","CL005","CL006","CL007",
      "CL008","CL009","CL010","CL011","CL012","CL013","CL014",
      "CL016","CL017","CL018","CL019","CL020",
      "CL023","CL024",
      "CL034","CL035","CL037",
      "CL029",
    ],
  },
  {
    clientId: "OC005",
    completedItems: [
      "CL001","CL002","CL003","CL004","CL005",
      "CL008","CL009","CL010",
      "CL016",
      "CL034","CL037",
    ],
  },
  {
    clientId: "OC006",
    completedItems: mockChecklist.map(i => i.id).filter((_, idx) => idx < 40),
  },
  {
    clientId: "OC007",
    completedItems: ["CL001","CL034","CL037"],
  },
  {
    clientId: "OC008",
    completedItems: [
      "CL001","CL002","CL003","CL004","CL005","CL006","CL007",
      "CL008","CL009","CL010","CL011","CL012","CL013","CL014","CL015",
      "CL016","CL017","CL018","CL019","CL020","CL021",
      "CL023","CL024","CL025","CL026","CL027","CL028",
      "CL029","CL030","CL031","CL032",
      "CL034","CL035","CL036","CL037","CL038",
      "CL039","CL040",
    ],
  },
];

export type ActivityType =
  | "stage-change"
  | "milestone-paid"
  | "checklist-complete"
  | "note"
  | "ticket-created"
  | "ticket-resolved";

export interface OpsActivity {
  id: string;
  clientId: string;
  type: ActivityType;
  title: string;
  description: string;
  actor: string;
  timestamp: string;
}

export const mockOpsActivities: OpsActivity[] = [
  { id: "A001", clientId: "OC001", type: "stage-change", title: "Stage advanced to Dispatched", description: "Inventory dispatched from Delhi warehouse. Tracking: DTDC-123456", actor: "Aditya", timestamp: "2026-03-15T10:30:00Z" },
  { id: "A002", clientId: "OC001", type: "milestone-paid", title: "Inventory Order payment received", description: "₹3,00,000 received via bank transfer. UTR: HDFC123456789", actor: "Aditya", timestamp: "2026-03-01T14:20:00Z" },
  { id: "A003", clientId: "OC001", type: "checklist-complete", title: "MRP Tagging completed", description: "All 2,400 units tagged with MRP stickers at warehouse.", actor: "Khushal", timestamp: "2026-03-10T09:00:00Z" },
  { id: "A004", clientId: "OC001", type: "note", title: "Client note added", description: "Meena confirmed she has arranged 2 staff members for opening.", actor: "Aditya", timestamp: "2026-03-14T16:45:00Z" },
  { id: "A005", clientId: "OC001", type: "stage-change", title: "Stage advanced to MRP Tagging", description: "Goods received at Delhi warehouse and QC cleared.", actor: "Aditya", timestamp: "2026-03-05T11:00:00Z" },

  { id: "A006", clientId: "OC002", type: "stage-change", title: "Stage advanced to Interior Construction", description: "Interior contractor hired. Work started on 2026-02-20.", actor: "Aditya", timestamp: "2026-02-20T09:00:00Z" },
  { id: "A007", clientId: "OC002", type: "milestone-paid", title: "Space Confirmed payment received", description: "₹1,00,000 received by cheque. Deposited.", actor: "Aditya", timestamp: "2026-02-10T11:30:00Z" },
  { id: "A008", clientId: "OC002", type: "note", title: "Interior delay flagged", description: "Contractor delayed by 5 days due to tile unavailability. ETA updated.", actor: "Aditya", timestamp: "2026-03-01T10:00:00Z" },

  { id: "A009", clientId: "OC003", type: "stage-change", title: "Stage advanced to Design Phase", description: "Space lock-in confirmed. 3D design work started by team.", actor: "Aditya", timestamp: "2026-02-22T13:00:00Z" },
  { id: "A010", clientId: "OC003", type: "note", title: "Design revision requested", description: "Anita requested a different gondola arrangement in the 3D layout.", actor: "Aditya", timestamp: "2026-03-05T15:30:00Z" },

  { id: "A011", clientId: "OC004", type: "stage-change", title: "Stage advanced to Goods at Warehouse", description: "Container arrived at Delhi warehouse. Offloading in progress.", actor: "Khushal", timestamp: "2026-03-12T08:00:00Z" },
  { id: "A012", clientId: "OC004", type: "milestone-paid", title: "Inventory Order payment received", description: "₹2,50,000 received via UPI. Payment confirmed.", actor: "Aditya", timestamp: "2026-03-08T14:00:00Z" },

  { id: "A013", clientId: "OC006", type: "stage-change", title: "Stage advanced to Store Ready", description: "All fixtures installed, inventory placed, POS tested. Ready to launch!", actor: "Aditya", timestamp: "2026-03-20T17:00:00Z" },
  { id: "A014", clientId: "OC006", type: "milestone-paid", title: "Goods Ready payment received", description: "₹90,000 received via UPI. Final milestone before dispatch.", actor: "Aditya", timestamp: "2026-03-10T11:00:00Z" },
  { id: "A015", clientId: "OC006", type: "checklist-complete", title: "Pre-launch inspection done", description: "ETS regional inspection completed. Store approved for launch.", actor: "Aditya", timestamp: "2026-03-22T12:00:00Z" },

  { id: "A016", clientId: "OC008", type: "stage-change", title: "Stage advanced to MRP Tagging", description: "QC done. Goods cleared. MRP tagging underway.", actor: "Khushal", timestamp: "2026-03-14T10:00:00Z" },
  { id: "A017", clientId: "OC008", type: "note", title: "Priority client — fast-track requested", description: "Deepak needs to open by Gudi Padwa (Mar 30). Fast-tracking tagging.", actor: "Aditya", timestamp: "2026-03-16T09:00:00Z" },
];

export type TicketPriority = "urgent" | "high" | "medium" | "low";
export type TicketStatus = "open" | "in-progress" | "resolved" | "closed";

export interface TicketMessage {
  id: string;
  actor: string;
  text: string;
  timestamp: string;
}

export interface OpsTicket {
  id: string;
  title: string;
  clientId: string;
  clientName: string;
  priority: TicketPriority;
  status: TicketStatus;
  assignedTo: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  thread: TicketMessage[];
}

export const mockTickets: OpsTicket[] = [
  {
    id: "TK001",
    title: "Shipment tracking link not working",
    clientId: "OC001",
    clientName: "Meena Singh",
    priority: "urgent",
    status: "open",
    assignedTo: "Aditya",
    description: "Client says the DTDC tracking link shared doesn't load. Need to share correct link urgently.",
    createdAt: "2026-03-20T09:00:00Z",
    updatedAt: "2026-03-20T09:00:00Z",
    thread: [
      { id: "TM001", actor: "Meena Singh", text: "The tracking link is not working. I cannot see where my stock is.", timestamp: "2026-03-20T09:00:00Z" },
      { id: "TM002", actor: "Aditya", text: "Investigating. Will share corrected link within 2 hours.", timestamp: "2026-03-20T09:30:00Z" },
    ],
  },
  {
    id: "TK002",
    title: "3D design revision — gondola rearrangement",
    clientId: "OC003",
    clientName: "Anita Sharma",
    priority: "medium",
    status: "in-progress",
    assignedTo: "Bharti",
    description: "Client wants the gondola rows rearranged for better customer flow. New layout being prepared.",
    createdAt: "2026-03-05T15:30:00Z",
    updatedAt: "2026-03-15T11:00:00Z",
    thread: [
      { id: "TM003", actor: "Anita Sharma", text: "Please rotate the gondolas 90 degrees. Current layout blocks the entrance view.", timestamp: "2026-03-05T15:30:00Z" },
      { id: "TM004", actor: "Bharti", text: "Understood. Working on a revised layout. Will send in 3–4 days.", timestamp: "2026-03-06T10:00:00Z" },
      { id: "TM005", actor: "Anita Sharma", text: "Thanks! Please also add a small kids' section near the window.", timestamp: "2026-03-06T10:15:00Z" },
      { id: "TM006", actor: "Bharti", text: "Will include that. New 3D render ready. Please review.", timestamp: "2026-03-15T11:00:00Z" },
    ],
  },
  {
    id: "TK003",
    title: "GST number missing from POS invoices",
    clientId: "OC004",
    clientName: "Sonal Gupta",
    priority: "high",
    status: "open",
    assignedTo: "Love Kumar",
    description: "POS printing invoices without GST number. Needs to be fixed before stock arrives.",
    createdAt: "2026-03-18T14:00:00Z",
    updatedAt: "2026-03-18T14:00:00Z",
    thread: [
      { id: "TM007", actor: "Sonal Gupta", text: "My invoices don't show my GSTIN. Customers are asking for proper GST bills.", timestamp: "2026-03-18T14:00:00Z" },
      { id: "TM008", actor: "Love Kumar", text: "Checking the POS settings. Can you confirm your GSTIN number?", timestamp: "2026-03-18T14:30:00Z" },
      { id: "TM009", actor: "Sonal Gupta", text: "GSTIN: 24ABCDE1234F1Z5", timestamp: "2026-03-18T14:35:00Z" },
    ],
  },
  {
    id: "TK004",
    title: "AC installation delay — contractor issue",
    clientId: "OC002",
    clientName: "Prashant Yadav",
    priority: "high",
    status: "in-progress",
    assignedTo: "Aditya",
    description: "AC contractor backed out. Need to find alternate contractor in Kanpur area urgently.",
    createdAt: "2026-03-10T11:00:00Z",
    updatedAt: "2026-03-22T09:00:00Z",
    thread: [
      { id: "TM010", actor: "Prashant Yadav", text: "AC wala bhaag gaya. Help chahiye.", timestamp: "2026-03-10T11:00:00Z" },
      { id: "TM011", actor: "Aditya", text: "We have a Kanpur-based contractor in our network. Sharing contact.", timestamp: "2026-03-10T13:00:00Z" },
      { id: "TM012", actor: "Prashant Yadav", text: "Called them. They'll visit tomorrow for site check.", timestamp: "2026-03-11T10:00:00Z" },
      { id: "TM013", actor: "Aditya", text: "Good. Please confirm once they give a quote.", timestamp: "2026-03-11T10:15:00Z" },
    ],
  },
  {
    id: "TK005",
    title: "Product pricing query on imported items",
    clientId: "OC005",
    clientName: "Kiran Patel",
    priority: "low",
    status: "open",
    assignedTo: "Bharti",
    description: "Client wants to understand how MRP is calculated. Needs education on pricing structure.",
    createdAt: "2026-03-19T10:00:00Z",
    updatedAt: "2026-03-19T10:00:00Z",
    thread: [
      { id: "TM014", actor: "Kiran Patel", text: "I see some items with MRP ₹99. But cost seems too high. How is margin calculated?", timestamp: "2026-03-19T10:00:00Z" },
      { id: "TM015", actor: "Bharti", text: "Great question! Scheduling a 15-min call to explain our margin structure.", timestamp: "2026-03-19T11:00:00Z" },
    ],
  },
  {
    id: "TK006",
    title: "Opening day photographer booking",
    clientId: "OC006",
    clientName: "Rajesh Mehta",
    priority: "medium",
    status: "open",
    assignedTo: "Love Kumar",
    description: "Need to arrange ETS photographer for the store opening on March 28.",
    createdAt: "2026-03-21T15:00:00Z",
    updatedAt: "2026-03-21T15:00:00Z",
    thread: [
      { id: "TM016", actor: "Aditya", text: "Rajesh's store opens March 28. Need photographer confirmed by March 25.", timestamp: "2026-03-21T15:00:00Z" },
      { id: "TM017", actor: "Love Kumar", text: "On it. Will check our Jaipur vendor list.", timestamp: "2026-03-21T15:30:00Z" },
    ],
  },
  {
    id: "TK007",
    title: "Urgent: Deepak store must open by March 30",
    clientId: "OC008",
    clientName: "Deepak Joshi",
    priority: "urgent",
    status: "in-progress",
    assignedTo: "Aditya",
    description: "Deepak has booked opening event for Gudi Padwa (March 30). All tasks need fast-tracking.",
    createdAt: "2026-03-16T09:00:00Z",
    updatedAt: "2026-03-24T08:00:00Z",
    thread: [
      { id: "TM018", actor: "Deepak Joshi", text: "I have an opening ceremony on March 30 — Gudi Padwa. Please fast-track everything.", timestamp: "2026-03-16T09:00:00Z" },
      { id: "TM019", actor: "Aditya", text: "Noted. Escalating to priority. MRP tagging being fast-tracked. Dispatch by March 26.", timestamp: "2026-03-16T09:30:00Z" },
      { id: "TM020", actor: "Khushal", text: "MRP tagging team assigned exclusively to Deepak's lot. Completing by March 22.", timestamp: "2026-03-16T10:00:00Z" },
      { id: "TM021", actor: "Deepak Joshi", text: "Thank you! Looking forward to the opening.", timestamp: "2026-03-16T10:30:00Z" },
    ],
  },
  {
    id: "TK008",
    title: "Franchise agreement revision request",
    clientId: "OC007",
    clientName: "Sunita Verma",
    priority: "medium",
    status: "open",
    assignedTo: "Aditya",
    description: "Sunita wants clause 8.2 (territory exclusivity) reviewed before signing final agreement.",
    createdAt: "2026-03-12T10:00:00Z",
    updatedAt: "2026-03-12T10:00:00Z",
    thread: [
      { id: "TM022", actor: "Sunita Verma", text: "Can we discuss clause 8.2? I need exclusivity in a 2km radius.", timestamp: "2026-03-12T10:00:00Z" },
      { id: "TM023", actor: "Aditya", text: "I'll loop in management. Standard exclusivity is 1.5km. Let me check if we can accommodate.", timestamp: "2026-03-12T11:00:00Z" },
    ],
  },
];

export interface OpsBatch {
  id: string;
  name: string;
  clientIds: string[];
  targetLaunchDate: string;
  overallProgress: number;
  blockers: string[];
}

export const mockBatches: OpsBatch[] = [
  {
    id: "BATCH-2026-Q1-A",
    name: "Q1 Batch A — March Wave",
    clientIds: ["OC001", "OC002", "OC004", "OC006", "OC008"],
    targetLaunchDate: "2026-04-01",
    overallProgress: 72,
    blockers: ["Meena goods delivery pending (TK001)", "Sonal GST config issue (TK003)"],
  },
  {
    id: "BATCH-2026-Q1-B",
    name: "Q1 Batch B — April Wave",
    clientIds: ["OC003", "OC005", "OC007"],
    targetLaunchDate: "2026-05-15",
    overallProgress: 28,
    blockers: ["Anita design revision pending (TK002)", "Prashant AC contractor issue (TK004)"],
  },
];

export const TEAM_MEMBERS = ["Aditya", "Bharti", "Khushal", "Love Kumar"];

export interface TeamAssignment {
  teamMember: string;
  clientId: string;
  responsibility: string;
  hasOverdueItems: boolean;
}

export const mockTeamAssignments: TeamAssignment[] = [
  { teamMember: "Aditya", clientId: "OC001", responsibility: "Stage Mgmt, Dispatch Coord", hasOverdueItems: true },
  { teamMember: "Aditya", clientId: "OC002", responsibility: "Stage Mgmt, Contractor Follow-up", hasOverdueItems: true },
  { teamMember: "Aditya", clientId: "OC003", responsibility: "Stage Mgmt", hasOverdueItems: false },
  { teamMember: "Aditya", clientId: "OC004", responsibility: "Stage Mgmt, Payment Follow-up", hasOverdueItems: true },
  { teamMember: "Aditya", clientId: "OC005", responsibility: "Stage Mgmt", hasOverdueItems: false },
  { teamMember: "Aditya", clientId: "OC006", responsibility: "Launch Coordination", hasOverdueItems: false },
  { teamMember: "Aditya", clientId: "OC007", responsibility: "Stage Mgmt, Agreement Review", hasOverdueItems: false },
  { teamMember: "Aditya", clientId: "OC008", responsibility: "Priority Fast-track", hasOverdueItems: false },

  { teamMember: "Bharti", clientId: "OC003", responsibility: "3D Design, Layout Planning", hasOverdueItems: true },
  { teamMember: "Bharti", clientId: "OC001", responsibility: "Store Planogram", hasOverdueItems: false },
  { teamMember: "Bharti", clientId: "OC005", responsibility: "Pricing Education", hasOverdueItems: false },
  { teamMember: "Bharti", clientId: "OC007", responsibility: "Design Preparation", hasOverdueItems: false },

  { teamMember: "Khushal", clientId: "OC001", responsibility: "Warehouse QC, MRP Tagging", hasOverdueItems: false },
  { teamMember: "Khushal", clientId: "OC004", responsibility: "Warehouse QC", hasOverdueItems: true },
  { teamMember: "Khushal", clientId: "OC006", responsibility: "Dispatch Coordination", hasOverdueItems: false },
  { teamMember: "Khushal", clientId: "OC008", responsibility: "Priority MRP Tagging", hasOverdueItems: false },

  { teamMember: "Love Kumar", clientId: "OC004", responsibility: "POS Support", hasOverdueItems: true },
  { teamMember: "Love Kumar", clientId: "OC006", responsibility: "Photographer Booking", hasOverdueItems: false },
  { teamMember: "Love Kumar", clientId: "OC008", responsibility: "POS Setup Support", hasOverdueItems: false },
  { teamMember: "Love Kumar", clientId: "OC002", responsibility: "POS Training Preparation", hasOverdueItems: false },
];

export interface MockBOQItem {
  category: string;
  item: string;
  qty: number;
  unitPrice: number;
}

export const mockBOQItems: Record<string, MockBOQItem[]> = {
  "OC001": [
    { category: "Fixtures", item: "Gondola Shelving Unit", qty: 8, unitPrice: 5500 },
    { category: "Fixtures", item: "Wall-Mount Display Shelves", qty: 16, unitPrice: 1800 },
    { category: "Fixtures", item: "Checkout Counter", qty: 1, unitPrice: 18000 },
    { category: "Technology", item: "POS Terminal", qty: 2, unitPrice: 22000 },
    { category: "Technology", item: "Barcode Scanner", qty: 2, unitPrice: 3500 },
    { category: "Branding", item: "Fascia Signboard", qty: 1, unitPrice: 18000 },
  ],
  "OC003": [
    { category: "Fixtures", item: "Gondola Shelving Unit", qty: 12, unitPrice: 5500 },
    { category: "Fixtures", item: "Wall-Mount Display Shelves", qty: 20, unitPrice: 1800 },
    { category: "Fixtures", item: "Glass Display Cabinet", qty: 2, unitPrice: 11000 },
    { category: "Fixtures", item: "Checkout Counter", qty: 2, unitPrice: 18000 },
    { category: "Technology", item: "POS Terminal", qty: 2, unitPrice: 22000 },
    { category: "Technology", item: "Barcode Scanner", qty: 3, unitPrice: 3500 },
    { category: "Branding", item: "Fascia Signboard", qty: 1, unitPrice: 22000 },
    { category: "Lighting", item: "LED Track Lights", qty: 8, unitPrice: 6000 },
  ],
};

export const mockProductOrders: Record<string, { skus: number; totalUnits: number; valueInr: number; categories: string[] }> = {
  "OC001": { skus: 180, totalUnits: 2400, valueInr: 720000, categories: ["Toys", "Kitchenware", "Stationery", "Decor"] },
  "OC002": { skus: 120, totalUnits: 1600, valueInr: 480000, categories: ["Toys", "Stationery", "Household"] },
  "OC003": { skus: 240, totalUnits: 3200, valueInr: 960000, categories: ["Toys", "Kitchenware", "Stationery", "Decor", "Bags", "Gifts"] },
  "OC004": { skus: 160, totalUnits: 2000, valueInr: 600000, categories: ["Toys", "Kitchenware", "Stationery", "Decor"] },
  "OC005": { skus: 200, totalUnits: 2600, valueInr: 780000, categories: ["Toys", "Kitchenware", "Stationery", "Decor", "Household"] },
  "OC006": { skus: 110, totalUnits: 1400, valueInr: 420000, categories: ["Toys", "Stationery", "Household"] },
  "OC007": { skus: 140, totalUnits: 1800, valueInr: 540000, categories: ["Toys", "Kitchenware", "Decor", "Bags"] },
  "OC008": { skus: 220, totalUnits: 2800, valueInr: 840000, categories: ["Toys", "Kitchenware", "Stationery", "Decor", "Gifts"] },
};
