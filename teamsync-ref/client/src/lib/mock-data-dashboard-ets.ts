import type { StoreStatusMode, DashboardSetupData, SetupItem, DashboardActiveData, PendingOrder, PartnerProfile } from "@/types/dashboard-ets";
export type { StoreStatusMode, DashboardSetupData, SetupItem, DashboardActiveData, PendingOrder, PartnerProfile };


let currentStoreStatus: StoreStatusMode = "active";

export function getStoreStatusMode(): StoreStatusMode {
  return currentStoreStatus;
}

export function setStoreStatusMode(mode: StoreStatusMode) {
  currentStoreStatus = mode;
}

export const PARTNER_PROFILE: PartnerProfile = {
  id: 1,
  name: "Rajesh Kumar",
  phone: "+91 98110 45678",
  email: "rajesh@example.in",
  storeName: "EazyToSell - Rajesh Store",
  storeAddress: "Shop 12, Kamla Nagar, New Delhi - 110007",
  city: "Delhi",
  state: "Delhi",
  area: "Kamla Nagar",
  gstin: "07AABCU9603R1ZP",
  pan: "ABCPK1234L",
  packageTier: "Pro",
  rmName: "Ankit Sharma",
  rmPhone: "+91 93065 66900",
  rmWhatsApp: "+919306566900",
  onboardingCompleted: false,
};

export const DASHBOARD_SETUP: DashboardSetupData = {
  storeReadiness: 65,
  tasksRemaining: 8,
  onboardingPercent: 60,
  onboardingCompleted: false,
  boqSelected: 18,
  boqTotal: 22,
  boqEstimatedCost: 210000,
  ordersPlaced: 2,
  ordersDelivered: 1,
  ordersInTransit: 1,
  milestoneTotal: 450000,
  milestonePaid: 180000,
  milestonePending: 270000,
  checklistDone: 5,
  checklistTotal: 12,
  setupItems: [
    { id: "onboarding", label: "Complete store onboarding", done: false, href: "/portal-ets/onboarding" },
    { id: "boq", label: "Finalize BOQ (Bill of Quantities)", done: true, href: "/portal-ets/catalog" },
    { id: "design", label: "Approve 3D store design", done: true, href: "/portal-ets/store" },
    { id: "payment1", label: "Release 40% token payment", done: true, href: "/portal-ets/payments" },
    { id: "order", label: "Confirm inventory order", done: true, href: "/portal-ets/orders" },
    { id: "payment2", label: "Release 50% milestone payment", done: false, href: "/portal-ets/payments" },
    { id: "tracking", label: "Track shipment from factory", done: false, href: "/portal-ets/orders" },
    { id: "checklist", label: "Complete store readiness checklist", done: false, href: "/portal-ets/checklist" },
    { id: "staff", label: "Add cashier staff to team", done: false, href: "/portal-ets/team-settings" },
    { id: "pos", label: "Configure POS and test billing", done: false, href: "/portal-ets/pos" },
    { id: "launch", label: "Schedule launch date with RM", done: false, href: "/portal-ets/support" },
    { id: "training", label: "Complete staff training", done: false, href: "/portal-ets/support" },
  ],
};

export const DASHBOARD_ACTIVE: DashboardActiveData = {
  todaySalesTotal: 14807,
  todayTransactionCount: 12,
  stockHealthy: 16,
  stockLow: 2,
  stockOut: 2,
  cashRegisterOpen: true,
  cashRegisterRunningTotal: 8350,
  recentPendingOrders: [
    { id: "po-1", receiptNumber: "R-0022", itemCount: 3, total: 2497, status: "pending", createdAt: new Date(Date.now() - 900000).toISOString() },
    { id: "po-2", receiptNumber: "R-0021", itemCount: 1, total: 799, status: "processing", createdAt: new Date(Date.now() - 1800000).toISOString() },
  ],
};

export const MOCK_FAQS = [
  {
    question: "How do I scan a product at the POS?",
    answer: "On the POS Billing screen, tap the barcode field at the top (or press Enter to activate it) and scan the product barcode using your scanner. The item will be added to the cart automatically. You can also search by product name if you don't have a scanner handy.",
  },
  {
    question: "What do I do if a barcode doesn't scan?",
    answer: "First, try cleaning the barcode label with a dry cloth — smudges are the most common cause. If it still doesn't scan, use the search bar on the POS screen to find the product by name. You can also manually type the barcode number. If a product is missing from the system, contact your relationship manager to get it added.",
  },
  {
    question: "How do I process a customer return?",
    answer: "Go to the Returns section from the main menu. Enter the original receipt number (e.g., R-0012), select which items are being returned, choose the reason, and confirm the refund method (cash or store credit). The system will automatically update your inventory stock.",
  },
  {
    question: "How do I open and close the cash register?",
    answer: "Go to Cash Register from the main menu. At the start of the day, tap 'Open Register' and enter your opening cash amount. At the end of the day, tap 'Close Register', count your physical cash, enter the amount, and submit. The system will show any differences for your records.",
  },
  {
    question: "How do I add a new cashier to my team?",
    answer: "Go to Team Settings from the main menu. You'll see existing staff members listed there. Tap 'Add Staff', enter the cashier's name and phone number, and assign them the Cashier role. Cashiers can only access POS Billing and Stock Receive — they cannot see reports, payments, or settings.",
  },
  {
    question: "My cashier can't see the daily report. Is that normal?",
    answer: "Yes, this is by design. Cashiers have restricted access and can only use POS Billing and Stock Receive. Only the owner account can access reports, inventory management, cash register, returns, payments, and store settings. Switch to Owner mode in Team Settings if you need full access.",
  },
  {
    question: "How do I receive new stock when a shipment arrives?",
    answer: "Go to the Stock Receive section. Enter the supplier reference number, then scan or search each product and enter the quantity received. Once all items are entered, tap 'Confirm Receipt'. Your inventory levels will be updated automatically.",
  },
  {
    question: "How do I place a reorder for products that are running low?",
    answer: "Go to the Inventory section and look for products marked as 'Low Stock' or 'Out of Stock'. You can also check the Low Stock Alerts from the Dashboard. Contact your relationship manager via WhatsApp to place a reorder — they will coordinate with the supplier and send you a proforma invoice.",
  },
  {
    question: "Why does my Daily Report show zero sales today?",
    answer: "The Daily Report shows sales for the current calendar day only. If you opened the register before midnight and sold items after midnight, those will count as today's sales. Make sure the date on your device is correct. If sales are still not showing, refresh the page or contact support.",
  },
  {
    question: "How do I view or print a past receipt?",
    answer: "Go to the Daily Report section and look for the Sales History tab. You can search by receipt number or browse by date. Tap on any sale to view the full receipt details. Use the Print button on the receipt screen to reprint it.",
  },
  {
    question: "Can I accept UPI or card payments?",
    answer: "Yes. On the POS Billing screen, after adding items to the cart, tap 'Checkout' and select your payment method — Cash, UPI, or Card. For UPI, show your store QR code to the customer. For card, swipe or tap on your card machine. Always confirm payment before marking it complete.",
  },
  {
    question: "What happens if I make a mistake while billing?",
    answer: "You can remove items from the cart before completing the sale by tapping the minus button or the trash icon next to the item. If the sale is already complete, use the Returns section to process a refund. Do not try to edit completed receipts — always use the return process.",
  },
  {
    question: "How do I update my store's GSTIN or address on receipts?",
    answer: "Go to Store Settings from the main menu. You can update your store name, address, phone number, and GSTIN there. These changes will appear on all new receipts immediately. Note that GSTIN is printed for reference only — the system does not calculate GST automatically.",
  },
  {
    question: "How do I contact my relationship manager?",
    answer: "Go to the Support page and tap 'Contact Your Manager'. This will open WhatsApp with a pre-filled message. Your RM's phone number is also shown there for direct calls. Your RM is available Monday to Saturday, 10 AM to 7 PM IST.",
  },
  {
    question: "What is the milestone payment schedule?",
    answer: "The typical payment schedule is: 40% token payment at the time of agreement, 50% milestone payment when your inventory order is confirmed and production begins, and 10% final payment on store launch. Your relationship manager can share the exact schedule based on your specific package.",
  },
];
