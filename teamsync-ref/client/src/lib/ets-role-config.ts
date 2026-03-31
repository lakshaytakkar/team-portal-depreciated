import {
  LayoutDashboard,
  Kanban,
  ClipboardList,
  Package,
  Users,
  Settings,
  FileText,
  MessageSquare,
  CheckSquare,
  Truck,
  BarChart3,
  CreditCard,
  ShoppingCart,
  Store,
  UserPlus,
  Tag,
  Upload,
  AlertTriangle,
  Receipt,
  Calendar,
  type LucideIcon,
} from "lucide-react";

export type EtsRoleId = "admin" | "sales" | "ops" | "fulfillment" | "product" | "partner" | "vendor";
export type EtsSubRole = "owner" | "cashier";

export interface EtsRoleNavItem {
  title: string;
  url: string;
  icon: LucideIcon;
}

export interface EtsRoleDefinition {
  id: EtsRoleId;
  label: string;
  description: string;
  color: string;
  bgColor: string;
  textColor: string;
  userName: string;
  userInitials: string;
  navItems: EtsRoleNavItem[];
  defaultUrl: string;
}

export const ETS_ROLES: EtsRoleDefinition[] = [
  {
    id: "admin",
    label: "Admin",
    description: "CEO command center — full visibility",
    color: "#7c3aed",
    bgColor: "bg-violet-100",
    textColor: "text-violet-700",
    userName: "Lakshay",
    userInitials: "LA",
    defaultUrl: "/portal-ets/admin",
    navItems: [
      { title: "Overview", url: "/portal-ets/admin", icon: LayoutDashboard },
      { title: "Pipeline", url: "/portal-ets/admin/pipeline", icon: Kanban },
      { title: "Team", url: "/portal-ets/admin/team", icon: Users },
      { title: "Revenue", url: "/portal-ets/admin/revenue", icon: BarChart3 },
      { title: "Settings", url: "/portal-ets/admin/settings", icon: Settings },
    ],
  },
  {
    id: "sales",
    label: "Sales",
    description: "Lead pipeline & proposals",
    color: "#0ea5e9",
    bgColor: "bg-sky-100",
    textColor: "text-sky-700",
    userName: "Harsh / Suprans",
    userInitials: "SA",
    defaultUrl: "/portal-ets/sales/dashboard",
    navItems: [
      { title: "Dashboard", url: "/portal-ets/sales/dashboard", icon: LayoutDashboard },
      { title: "Pipeline", url: "/portal-ets/sales/pipeline", icon: Kanban },
      { title: "Scripts", url: "/portal-ets/sales/scripts", icon: MessageSquare },
      { title: "Proposals", url: "/portal-ets/sales/proposals", icon: FileText },
      { title: "Calendar", url: "/portal-ets/sales/calendar", icon: Calendar },
    ],
  },
  {
    id: "ops",
    label: "Ops",
    description: "Client stage management & tickets",
    color: "#10b981",
    bgColor: "bg-emerald-100",
    textColor: "text-emerald-700",
    userName: "Aditya",
    userInitials: "OP",
    defaultUrl: "/portal-ets/ops",
    navItems: [
      { title: "Dashboard", url: "/portal-ets/ops", icon: LayoutDashboard },
      { title: "Client Journey", url: "/portal-ets/ops/clients", icon: Kanban },
      { title: "Tickets", url: "/portal-ets/ops/tickets", icon: AlertTriangle },
      { title: "Team Assignments", url: "/portal-ets/ops/team", icon: Users },
    ],
  },
  {
    id: "fulfillment",
    label: "Fulfillment",
    description: "Warehouse, QC & dispatch",
    color: "#f59e0b",
    bgColor: "bg-amber-100",
    textColor: "text-amber-700",
    userName: "Khushal",
    userInitials: "FU",
    defaultUrl: "/portal-ets/fulfillment",
    navItems: [
      { title: "Dashboard", url: "/portal-ets/fulfillment", icon: LayoutDashboard },
      { title: "Order Queue", url: "/portal-ets/fulfillment/orders", icon: ShoppingCart },
      { title: "China Batches", url: "/portal-ets/fulfillment/batches", icon: Package },
      { title: "QC", url: "/portal-ets/fulfillment/qc", icon: CheckSquare },
      { title: "MRP Tagging", url: "/portal-ets/fulfillment/stickers", icon: Tag },
      { title: "Dispatch", url: "/portal-ets/fulfillment/dispatch", icon: Truck },
    ],
  },
  {
    id: "product",
    label: "Product Team",
    description: "Catalog, pricing & compliance",
    color: "#ec4899",
    bgColor: "bg-pink-100",
    textColor: "text-pink-700",
    userName: "Lakshay + Listing",
    userInitials: "PT",
    defaultUrl: "/portal-ets/product",
    navItems: [
      { title: "Dashboard", url: "/portal-ets/product", icon: Package },
      { title: "Products", url: "/portal-ets/product/list", icon: Package },
      { title: "Categories", url: "/portal-ets/product/categories", icon: Tag },
      { title: "Pricing Rules", url: "/portal-ets/product/pricing", icon: CreditCard },
      { title: "Compliance", url: "/portal-ets/product/compliance", icon: CheckSquare },
      { title: "Bulk Upload", url: "/portal-ets/product/bulk-upload", icon: Upload },
      { title: "Intelligence", url: "/portal-ets/product/intelligence", icon: BarChart3 },
    ],
  },
  {
    id: "partner",
    label: "Partner",
    description: "Store owner — franchise portal",
    color: "#f97316",
    bgColor: "bg-orange-100",
    textColor: "text-orange-700",
    userName: "Store Owner",
    userInitials: "SO",
    defaultUrl: "/portal-ets",
    navItems: [
      { title: "Dashboard", url: "/portal-ets", icon: LayoutDashboard },
      { title: "POS Billing", url: "/portal-ets/pos", icon: Receipt },
      { title: "Stock Receive", url: "/portal-ets/stock-receive", icon: ClipboardList },
      { title: "Inventory", url: "/portal-ets/inventory", icon: Package },
      { title: "Orders", url: "/portal-ets/orders", icon: ShoppingCart },
      { title: "Payments", url: "/portal-ets/payments", icon: CreditCard },
      { title: "My Store", url: "/portal-ets/store", icon: Store },
      { title: "Team", url: "/portal-ets/team-settings", icon: Users },
      { title: "Settings", url: "/portal-ets/store-settings", icon: Settings },
    ],
  },
  {
    id: "vendor",
    label: "Vendor",
    description: "Supplier portal",
    color: "#6366f1",
    bgColor: "bg-indigo-100",
    textColor: "text-indigo-700",
    userName: "Vendor / Supplier",
    userInitials: "VE",
    defaultUrl: "/portal-ets/vendor",
    navItems: [
      { title: "Dashboard", url: "/portal-ets/vendor", icon: LayoutDashboard },
      { title: "My Listings", url: "/portal-ets/vendor/listings", icon: Package },
      { title: "Incoming Orders", url: "/portal-ets/vendor/orders", icon: ShoppingCart },
      { title: "Stock & Pricing", url: "/portal-ets/vendor/stock", icon: Tag },
      { title: "KYC Status", url: "/portal-ets/vendor/kyc", icon: UserPlus },
    ],
  },
];

export function getEtsRole(id: EtsRoleId): EtsRoleDefinition {
  return ETS_ROLES.find((r) => r.id === id) ?? ETS_ROLES[5];
}

const ROLE_STORAGE_KEY = "ets-portal-role";
const SUB_ROLE_STORAGE_KEY = "ets-portal-sub-role";

export function getStoredEtsRole(): EtsRoleId {
  try {
    const v = localStorage.getItem(ROLE_STORAGE_KEY);
    if (v && ETS_ROLES.some((r) => r.id === v)) return v as EtsRoleId;
  } catch {}
  return "partner";
}

export function setStoredEtsRole(id: EtsRoleId): void {
  try {
    localStorage.setItem(ROLE_STORAGE_KEY, id);
  } catch {}
}

export function getStoredEtsSubRole(): EtsSubRole {
  try {
    const v = localStorage.getItem(SUB_ROLE_STORAGE_KEY);
    if (v === "cashier" || v === "owner") return v;
  } catch {}
  return "owner";
}

export function setStoredEtsSubRole(sub: EtsSubRole): void {
  try {
    localStorage.setItem(SUB_ROLE_STORAGE_KEY, sub);
  } catch {}
}
