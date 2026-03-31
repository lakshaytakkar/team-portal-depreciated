import {
  LayoutDashboard,
  Building2,
  FileText,
  Receipt,
  MessageSquare,
  Phone,
  Shield,
  Kanban,
  UserPlus,
  ClipboardList,
  BarChart3,
  Calendar,
  Settings,
  Users,
  Briefcase,
  Ticket,
  CheckSquare,
  BookOpen,
  Link,
  Video,
  type LucideIcon,
} from "lucide-react";

export type LnRoleId =
  | "admin"     // SuperAdmin — Lakshay
  | "manager"   // Manager — Vikas
  | "ops"       // Ops Executive — Nitin
  | "sales"     // Sales Executive
  | "tax"       // Tax Specialist — Task #3, not in dev switcher
  | "client";   // Client self-service portal

export interface LnRoleNavItem {
  title: string;
  url: string;
  icon: LucideIcon;
}

export interface LnRoleDefinition {
  id: LnRoleId;
  label: string;
  description: string;
  color: string;
  bgColor: string;
  textColor: string;
  userName: string;
  userInitials: string;
  navItems: LnRoleNavItem[];
  defaultUrl: string;
}

export const LN_ROLES: LnRoleDefinition[] = [
  {
    id: "admin",
    label: "SuperAdmin",
    description: "Full access — oversight, financials, control panel, SOPs",
    color: "#7c3aed",
    bgColor: "bg-violet-100",
    textColor: "text-violet-700",
    userName: "Lakshay",
    userInitials: "LA",
    defaultUrl: "/portal-ln/admin",
    navItems: [
      { title: "Overview", url: "/portal-ln/admin", icon: LayoutDashboard },
      { title: "All Formations", url: "/portal-ln/admin/pipeline", icon: Kanban },
      { title: "Formation Pipeline", url: "/portal-ln/formation", icon: Briefcase },
      { title: "KYC Queue", url: "/portal-ln/formation/kyc", icon: UserPlus },
      { title: "EIN Tracker", url: "/portal-ln/formation/ein", icon: ClipboardList },
      { title: "Compliance & BOI", url: "/portal-ln/compliance", icon: Shield },
      { title: "Annual Reports", url: "/portal-ln/compliance/annual", icon: Calendar },
      { title: "Ops Tasks", url: "/portal-ln/ops", icon: CheckSquare },
      { title: "Lead Pipeline", url: "/portal-ln/sales/pipeline", icon: Kanban },
      { title: "Revenue", url: "/portal-ln/admin/revenue", icon: BarChart3 },
      { title: "Team", url: "/portal-ln/admin/team", icon: Users },
      { title: "Training Videos", url: "/portal-ln/admin/training", icon: Video },
      { title: "Settings", url: "/portal-ln/admin/settings", icon: Settings },
    ],
  },
  {
    id: "manager",
    label: "Manager",
    description: "Complete client journey — formation, filing, docs",
    color: "#0ea5e9",
    bgColor: "bg-sky-100",
    textColor: "text-sky-700",
    userName: "Vikas",
    userInitials: "VK",
    defaultUrl: "/portal-ln/manager",
    navItems: [
      { title: "Dashboard", url: "/portal-ln/manager", icon: LayoutDashboard },
      { title: "Lead Inbox", url: "/portal-ln/manager/leads", icon: UserPlus },
      { title: "All Clients", url: "/portal-ln/manager/clients", icon: Building2 },
      { title: "Tasks", url: "/portal-ln/manager/tasks", icon: CheckSquare },
      { title: "Tickets", url: "/portal-ln/manager/tickets", icon: Ticket },
    ],
  },
  {
    id: "ops",
    label: "Ops Executive",
    description: "Assigned tasks, client docs, tickets — task executor",
    color: "#10b981",
    bgColor: "bg-emerald-100",
    textColor: "text-emerald-700",
    userName: "Nitin",
    userInitials: "NT",
    defaultUrl: "/portal-ln/ops",
    navItems: [
      { title: "My Tasks", url: "/portal-ln/ops", icon: CheckSquare },
      { title: "Client List", url: "/portal-ln/ops/clients", icon: Building2 },
      { title: "Tickets", url: "/portal-ln/ops/tickets", icon: Ticket },
      { title: "Documents", url: "/portal-ln/ops/docs", icon: FileText },
    ],
  },
  {
    id: "sales",
    label: "Sales Executive",
    description: "Leads CRM, bookings, scripts, assets, payment links",
    color: "#ec4899",
    bgColor: "bg-pink-100",
    textColor: "text-pink-700",
    userName: "Sales Executive",
    userInitials: "SE",
    defaultUrl: "/portal-ln/sales",
    navItems: [
      { title: "Dashboard", url: "/portal-ln/sales", icon: LayoutDashboard },
      { title: "Lead Pipeline", url: "/portal-ln/sales/pipeline", icon: Kanban },
      { title: "Bookings", url: "/portal-ln/sales/bookings", icon: Calendar },
      { title: "Scripts", url: "/portal-ln/sales/scripts", icon: BookOpen },
      { title: "Assets", url: "/portal-ln/sales/assets", icon: FileText },
      { title: "Payment Links", url: "/portal-ln/sales/payment-links", icon: Link },
    ],
  },
  {
    id: "tax",
    label: "Tax Specialist",
    description: "IRS filings & tax season tracking",
    color: "#f59e0b",
    bgColor: "bg-amber-100",
    textColor: "text-amber-700",
    userName: "Tax Specialist",
    userInitials: "TS",
    defaultUrl: "/portal-ln/tax",
    navItems: [
      { title: "Dashboard", url: "/portal-ln/tax", icon: LayoutDashboard },
      { title: "Filing Queue", url: "/portal-ln/tax/queue", icon: ClipboardList },
      { title: "Preparation", url: "/portal-ln/tax/prep", icon: FileText },
      { title: "Filing Detail", url: "/portal-ln/tax/detail", icon: Receipt },
      { title: "Tax Calendar", url: "/portal-ln/tax/calendar", icon: Calendar },
    ],
  },
  {
    id: "client",
    label: "Client",
    description: "Self-service formation portal",
    color: "#225AEA",
    bgColor: "bg-blue-100",
    textColor: "text-blue-700",
    userName: "Rajesh Kumar",
    userInitials: "RK",
    defaultUrl: "/portal-ln",
    navItems: [
      { title: "Dashboard", url: "/portal-ln", icon: LayoutDashboard },
      { title: "My Companies", url: "/portal-ln/companies", icon: Building2 },
      { title: "Documents", url: "/portal-ln/documents", icon: FileText },
      { title: "Invoices", url: "/portal-ln/invoices", icon: Receipt },
      { title: "Messages", url: "/portal-ln/messages", icon: MessageSquare },
      { title: "Support", url: "/portal-ln/support", icon: Phone },
    ],
  },
];

export const LN_INTERNAL_ROLES: LnRoleId[] = ["admin", "manager", "ops", "sales"];
export const LN_SWITCHER_ROLES: LnRoleId[] = ["admin", "manager", "ops", "sales"];

export function getLnRole(id: LnRoleId): LnRoleDefinition {
  return LN_ROLES.find((r) => r.id === id) ?? LN_ROLES[LN_ROLES.length - 1];
}

const ROLE_STORAGE_KEY = "ln-portal-role";

export function getStoredLnRole(): LnRoleId {
  try {
    const v = localStorage.getItem(ROLE_STORAGE_KEY);
    if (v && LN_ROLES.some((r) => r.id === v)) return v as LnRoleId;
  } catch {}
  return "client";
}

export function setStoredLnRole(id: LnRoleId): void {
  try {
    localStorage.setItem(ROLE_STORAGE_KEY, id);
  } catch {}
}
