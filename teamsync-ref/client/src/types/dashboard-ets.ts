export type StoreStatusMode = "setup" | "active";
export interface DashboardSetupData {
  storeReadiness: number;
  tasksRemaining: number;
  onboardingPercent: number;
  onboardingCompleted: boolean;
  boqSelected: number;
  boqTotal: number;
  boqEstimatedCost: number;
  ordersPlaced: number;
  ordersDelivered: number;
  ordersInTransit: number;
  milestoneTotal: number;
  milestonePaid: number;
  milestonePending: number;
  checklistDone: number;
  checklistTotal: number;
  setupItems: SetupItem[];
}

export interface SetupItem {
  id: string;
  label: string;
  done: boolean;
  href: string;
}

export interface DashboardActiveData {
  todaySalesTotal: number;
  todayTransactionCount: number;
  stockHealthy: number;
  stockLow: number;
  stockOut: number;
  cashRegisterOpen: boolean;
  cashRegisterRunningTotal: number;
  recentPendingOrders: PendingOrder[];
}

export interface PendingOrder {
  id: string;
  receiptNumber: string;
  itemCount: number;
  total: number;
  status: "pending" | "processing";
  createdAt: string;
}

export interface PartnerProfile {
  id: number;
  name: string;
  phone: string;
  email: string;
  storeName: string;
  storeAddress: string;
  city: string;
  state: string;
  area: string;
  gstin: string;
  pan: string;
  packageTier: "Lite" | "Pro" | "Elite";
  rmName: string;
  rmPhone: string;
  rmWhatsApp: string;
  onboardingCompleted: boolean;
}
