import {
  LayoutDashboard,
  Users,
  Phone,
  KanbanSquare,
  BarChart3,
  Settings,
  MessageSquare,
  BookOpen,
  GraduationCap,
  Video,
  FileText,
  UserPlus,
  CheckSquare,
  CalendarDays,
  Calendar,
  CalendarCheck,
  CalendarOff,
  Building2,
  MapPin,
  Truck,
  ClipboardList,
  Plane,
  Package,
  Globe,
  DollarSign,
  CreditCard,
  Receipt,
  Briefcase,
  ShoppingCart,
  Factory,
  Ship,
  FileCheck,
  Megaphone,
  Target,
  TrendingUp,
  Headphones,
  Wrench,
  Database,
  Mail,
  Calculator,
  PiggyBank,
  UserCheck,
  GraduationCap as Training,
  Link2,
  type LucideIcon
} from "lucide-react";

export interface NavItem {
  href: string;
  icon: LucideIcon;
  label: string;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export interface TeamMember {
  email: string;
  role: 'admin' | 'member';
}

export interface Team {
  id: string;
  name: string;
  subtitle: string;
  icon: LucideIcon;
  color: string;
  groups: NavGroup[];
  adminGroups?: NavGroup[];
  members?: TeamMember[];
}

export const teams: Team[] = [
  {
    id: "travel-sales",
    name: "Suprans - Sales",
    subtitle: "Sales & Lead Management",
    icon: Plane,
    color: "#F34147",
    groups: [
      {
        label: "Pinned",
        items: [
          { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
          { href: "/chat", icon: MessageSquare, label: "Chat" },
          { href: "/members", icon: Users, label: "Team" },
        ]
      },
      {
        label: "My Sales",
        items: [
          { href: "/leads", icon: Users, label: "My Leads" },
          { href: "/pipeline", icon: KanbanSquare, label: "Pipeline" },
          { href: "/tasks", icon: CheckSquare, label: "My Tasks" },
          { href: "/follow-ups", icon: Phone, label: "Follow-ups" },
        ]
      },
      {
        label: "Scheduling",
        items: [
          { href: "/calendar", icon: CalendarDays, label: "Calendar" },
        ]
      },
      {
        label: "Resources",
        items: [
          { href: "/resources/templates", icon: FileText, label: "Templates" },
          { href: "/knowledge/services", icon: BookOpen, label: "Knowledge Base" },
        ]
      },
      {
        label: "Performance",
        items: [
          { href: "/performance", icon: BarChart3, label: "My Performance" },
        ]
      }
    ],
    adminGroups: [
      {
        label: "Pinned",
        items: [
          { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
          { href: "/chat", icon: MessageSquare, label: "Chat" },
          { href: "/members", icon: Users, label: "Team" },
        ]
      },
      {
        label: "Sales Management",
        items: [
          { href: "/admin/leads", icon: Users, label: "All Leads" },
          { href: "/pipeline", icon: KanbanSquare, label: "Pipeline" },
          { href: "/admin/assignments", icon: UserCheck, label: "Assignments" },
          { href: "/payment-links", icon: Link2, label: "Payment Links" },
        ]
      },
      {
        label: "Scheduling",
        items: [
          { href: "/calendar", icon: CalendarDays, label: "Calendar" },
        ]
      },
      {
        label: "Reports",
        items: [
          { href: "/admin/reports", icon: BarChart3, label: "Sales Reports" },
          { href: "/performance", icon: TrendingUp, label: "Team Performance" },
        ]
      },
      {
        label: "Resources",
        items: [
          { href: "/resources/templates", icon: FileText, label: "Templates" },
          { href: "/knowledge/services", icon: BookOpen, label: "Knowledge Base" },
        ]
      }
    ],
    members: [
      { email: "admin@suprans.in", role: "admin" },
    ]
  },
  {
    id: "travel-operations",
    name: "Travel - Operations",
    subtitle: "Logistics & Visa Processing",
    icon: Plane,
    color: "#2196F3",
    groups: [
      {
        label: "Pinned",
        items: [
          { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
          { href: "/chat", icon: MessageSquare, label: "Chat" },
          { href: "/members", icon: Users, label: "Team" },
        ]
      },
      {
        label: "My Work",
        items: [
          { href: "/travel/my-bookings", icon: CalendarDays, label: "My Bookings" },
          { href: "/travel/my-visas", icon: FileCheck, label: "My Visa Tasks" },
          { href: "/tasks", icon: CheckSquare, label: "My Tasks" },
        ]
      },
      {
        label: "Performance",
        items: [
          { href: "/performance", icon: BarChart3, label: "My Performance" },
        ]
      }
    ],
    adminGroups: [
      {
        label: "Pinned",
        items: [
          { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
          { href: "/chat", icon: MessageSquare, label: "Chat" },
          { href: "/members", icon: Users, label: "Team" },
        ]
      },
      {
        label: "Operations Management",
        items: [
          { href: "/travel/bookings", icon: CalendarDays, label: "All Bookings" },
          { href: "/travel/visas", icon: FileCheck, label: "Visa Processing" },
          { href: "/travel/hotels", icon: Building2, label: "Hotel Bookings" },
          { href: "/travel/itineraries", icon: MapPin, label: "Itineraries" },
          { href: "/travel/assignments", icon: UserCheck, label: "Assignments" },
        ]
      },
      {
        label: "Reports",
        items: [
          { href: "/admin/reports", icon: BarChart3, label: "Operations Reports" },
          { href: "/performance", icon: TrendingUp, label: "Team Performance" },
        ]
      },
      {
        label: "Vendors",
        items: [
          { href: "/vendors", icon: Truck, label: "Vendor Management" },
        ]
      }
    ],
    members: [
      { email: "admin@suprans.in", role: "admin" },
    ]
  },
  {
    id: "travel-accounts",
    name: "Travel - Accounts",
    subtitle: "Payments & Invoicing",
    icon: Calculator,
    color: "#4CAF50",
    groups: [
      {
        label: "Pinned",
        items: [
          { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
          { href: "/chat", icon: MessageSquare, label: "Chat" },
          { href: "/members", icon: Users, label: "Team" },
        ]
      },
      {
        label: "My Work",
        items: [
          { href: "/accounts/my-invoices", icon: Receipt, label: "My Invoices" },
          { href: "/payment-links", icon: Link2, label: "Payment Links" },
          { href: "/tasks", icon: CheckSquare, label: "My Tasks" },
        ]
      },
      {
        label: "Performance",
        items: [
          { href: "/performance", icon: BarChart3, label: "My Performance" },
        ]
      }
    ],
    adminGroups: [
      {
        label: "Pinned",
        items: [
          { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
          { href: "/chat", icon: MessageSquare, label: "Chat" },
          { href: "/members", icon: Users, label: "Team" },
        ]
      },
      {
        label: "Financial Management",
        items: [
          { href: "/accounts/invoices", icon: Receipt, label: "All Invoices" },
          { href: "/accounts/payments", icon: CreditCard, label: "Payments Received" },
          { href: "/payment-links", icon: Link2, label: "Payment Links" },
          { href: "/accounts/vendor-payments", icon: DollarSign, label: "Vendor Payments" },
        ]
      },
      {
        label: "Reports",
        items: [
          { href: "/accounts/reports", icon: BarChart3, label: "Financial Reports" },
          { href: "/performance", icon: TrendingUp, label: "Team Performance" },
        ]
      }
    ],
    members: [
      { email: "admin@suprans.in", role: "admin" },
    ]
  },
  {
    id: "china-import-sales",
    name: "Import From China - Sales",
    subtitle: "Sourcing & Supplier Connections",
    icon: Ship,
    color: "#FF9800",
    groups: [
      {
        label: "Pinned",
        items: [
          { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
          { href: "/chat", icon: MessageSquare, label: "Chat" },
          { href: "/members", icon: Users, label: "Team" },
        ]
      },
      {
        label: "My Sales",
        items: [
          { href: "/leads", icon: Users, label: "My Inquiries" },
          { href: "/pipeline", icon: KanbanSquare, label: "Sales Pipeline" },
          { href: "/tasks", icon: CheckSquare, label: "My Tasks" },
          { href: "/follow-ups", icon: Phone, label: "Follow-ups" },
        ]
      },
      {
        label: "Resources",
        items: [
          { href: "/suppliers", icon: Factory, label: "Supplier Database" },
        ]
      },
      {
        label: "Performance",
        items: [
          { href: "/performance", icon: BarChart3, label: "My Performance" },
        ]
      }
    ],
    adminGroups: [
      {
        label: "Pinned",
        items: [
          { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
          { href: "/chat", icon: MessageSquare, label: "Chat" },
          { href: "/members", icon: Users, label: "Team" },
        ]
      },
      {
        label: "Sales Management",
        items: [
          { href: "/admin/leads", icon: Users, label: "All Inquiries" },
          { href: "/pipeline", icon: KanbanSquare, label: "Sales Pipeline" },
          { href: "/admin/assignments", icon: UserCheck, label: "Assignments" },
        ]
      },
      {
        label: "Reports",
        items: [
          { href: "/admin/reports", icon: BarChart3, label: "Sales Reports" },
          { href: "/performance", icon: TrendingUp, label: "Team Performance" },
        ]
      },
      {
        label: "Resources",
        items: [
          { href: "/suppliers", icon: Factory, label: "Supplier Database" },
        ]
      }
    ],
    members: [
      { email: "admin@suprans.in", role: "admin" },
    ]
  },
  {
    id: "china-import-operations",
    name: "Import From China - Ops",
    subtitle: "Quality Control & Shipping",
    icon: Ship,
    color: "#9C27B0",
    groups: [
      {
        label: "Pinned",
        items: [
          { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
          { href: "/chat", icon: MessageSquare, label: "Chat" },
          { href: "/members", icon: Users, label: "Team" },
        ]
      },
      {
        label: "My Work",
        items: [
          { href: "/import/my-orders", icon: Package, label: "My Orders" },
          { href: "/import/my-qc", icon: CheckSquare, label: "My QC Tasks" },
          { href: "/tasks", icon: CheckSquare, label: "My Tasks" },
        ]
      },
      {
        label: "Performance",
        items: [
          { href: "/performance", icon: BarChart3, label: "My Performance" },
        ]
      }
    ],
    adminGroups: [
      {
        label: "Pinned",
        items: [
          { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
          { href: "/chat", icon: MessageSquare, label: "Chat" },
          { href: "/members", icon: Users, label: "Team" },
        ]
      },
      {
        label: "Operations Management",
        items: [
          { href: "/import/orders", icon: Package, label: "All Orders" },
          { href: "/import/qc", icon: CheckSquare, label: "Quality Control" },
          { href: "/import/shipping", icon: Ship, label: "Shipping" },
          { href: "/import/customs", icon: FileCheck, label: "Customs" },
          { href: "/import/assignments", icon: UserCheck, label: "Assignments" },
        ]
      },
      {
        label: "Reports",
        items: [
          { href: "/admin/reports", icon: BarChart3, label: "Operations Reports" },
          { href: "/performance", icon: TrendingUp, label: "Team Performance" },
        ]
      },
      {
        label: "Suppliers",
        items: [
          { href: "/suppliers", icon: Factory, label: "Supplier Database" },
        ]
      }
    ],
    members: [
      { email: "admin@suprans.in", role: "admin" },
    ]
  },
  {
    id: "dropshipping-sales",
    name: "USA Dropshipping - Sales",
    subtitle: "Product Listings & Orders",
    icon: ShoppingCart,
    color: "#00BCD4",
    groups: [
      {
        label: "Pinned",
        items: [
          { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
          { href: "/chat", icon: MessageSquare, label: "Chat" },
          { href: "/members", icon: Users, label: "Team" },
        ]
      },
      {
        label: "My Sales",
        items: [
          { href: "/leads", icon: Users, label: "My Inquiries" },
          { href: "/pipeline", icon: KanbanSquare, label: "Sales Pipeline" },
          { href: "/tasks", icon: CheckSquare, label: "My Tasks" },
          { href: "/follow-ups", icon: Phone, label: "Follow-ups" },
        ]
      },
      {
        label: "Performance",
        items: [
          { href: "/performance", icon: BarChart3, label: "My Performance" },
        ]
      }
    ],
    adminGroups: [
      {
        label: "Pinned",
        items: [
          { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
          { href: "/chat", icon: MessageSquare, label: "Chat" },
          { href: "/members", icon: Users, label: "Team" },
        ]
      },
      {
        label: "Sales Management",
        items: [
          { href: "/admin/leads", icon: Users, label: "All Inquiries" },
          { href: "/pipeline", icon: KanbanSquare, label: "Sales Pipeline" },
          { href: "/admin/assignments", icon: UserCheck, label: "Assignments" },
        ]
      },
      {
        label: "Reports",
        items: [
          { href: "/admin/reports", icon: BarChart3, label: "Sales Reports" },
          { href: "/performance", icon: TrendingUp, label: "Team Performance" },
        ]
      }
    ],
    members: [
      { email: "admin@suprans.in", role: "admin" },
    ]
  },
  {
    id: "dropshipping-operations",
    name: "USA Dropshipping - Ops",
    subtitle: "Inventory & Suppliers",
    icon: ShoppingCart,
    color: "#795548",
    groups: [
      {
        label: "Pinned",
        items: [
          { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
          { href: "/chat", icon: MessageSquare, label: "Chat" },
          { href: "/members", icon: Users, label: "Team" },
        ]
      },
      {
        label: "My Work",
        items: [
          { href: "/dropship/my-orders", icon: ClipboardList, label: "My Orders" },
          { href: "/tasks", icon: CheckSquare, label: "My Tasks" },
        ]
      },
      {
        label: "Performance",
        items: [
          { href: "/performance", icon: BarChart3, label: "My Performance" },
        ]
      }
    ],
    adminGroups: [
      {
        label: "Pinned",
        items: [
          { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
          { href: "/chat", icon: MessageSquare, label: "Chat" },
          { href: "/members", icon: Users, label: "Team" },
        ]
      },
      {
        label: "Operations Management",
        items: [
          { href: "/dropship/products", icon: Package, label: "Products" },
          { href: "/dropship/inventory", icon: Database, label: "Inventory" },
          { href: "/dropship/orders", icon: ClipboardList, label: "All Orders" },
          { href: "/dropship/assignments", icon: UserCheck, label: "Assignments" },
        ]
      },
      {
        label: "Reports",
        items: [
          { href: "/admin/reports", icon: BarChart3, label: "Operations Reports" },
          { href: "/performance", icon: TrendingUp, label: "Team Performance" },
        ]
      },
      {
        label: "Suppliers",
        items: [
          { href: "/dropship/suppliers", icon: Truck, label: "Suppliers" },
        ]
      }
    ],
    members: [
      { email: "admin@suprans.in", role: "admin" },
    ]
  },
  {
    id: "llc-sales",
    name: "USA LLC Formation - Sales",
    subtitle: "Consultation & Packages",
    icon: Briefcase,
    color: "#3F51B5",
    groups: [
      {
        label: "Pinned",
        items: [
          { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
          { href: "/chat", icon: MessageSquare, label: "Chat" },
          { href: "/members", icon: Users, label: "Team" },
        ]
      },
      {
        label: "My Sales",
        items: [
          { href: "/leads", icon: Users, label: "My Inquiries" },
          { href: "/pipeline", icon: KanbanSquare, label: "Sales Pipeline" },
          { href: "/tasks", icon: CheckSquare, label: "My Tasks" },
          { href: "/follow-ups", icon: Phone, label: "Follow-ups" },
        ]
      },
      {
        label: "Resources",
        items: [
          { href: "/resources/templates", icon: FileText, label: "Templates" },
          { href: "/knowledge/services", icon: BookOpen, label: "LLC Packages" },
        ]
      },
      {
        label: "Performance",
        items: [
          { href: "/performance", icon: BarChart3, label: "My Performance" },
        ]
      }
    ],
    adminGroups: [
      {
        label: "Pinned",
        items: [
          { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
          { href: "/chat", icon: MessageSquare, label: "Chat" },
          { href: "/members", icon: Users, label: "Team" },
        ]
      },
      {
        label: "Sales Management",
        items: [
          { href: "/admin/leads", icon: Users, label: "All Inquiries" },
          { href: "/pipeline", icon: KanbanSquare, label: "Sales Pipeline" },
          { href: "/admin/assignments", icon: UserCheck, label: "Assignments" },
        ]
      },
      {
        label: "Reports",
        items: [
          { href: "/admin/reports", icon: BarChart3, label: "Sales Reports" },
          { href: "/performance", icon: TrendingUp, label: "Team Performance" },
        ]
      },
      {
        label: "Resources",
        items: [
          { href: "/resources/templates", icon: FileText, label: "Templates" },
          { href: "/knowledge/services", icon: BookOpen, label: "LLC Packages" },
        ]
      }
    ],
    members: [
      { email: "admin@suprans.in", role: "admin" },
    ]
  },
  {
    id: "llc-operations",
    name: "USA LLC Formation - Ops",
    subtitle: "Document Processing",
    icon: Briefcase,
    color: "#607D8B",
    groups: [
      {
        label: "Pinned",
        items: [
          { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
          { href: "/chat", icon: MessageSquare, label: "Chat" },
          { href: "/members", icon: Users, label: "Team" },
        ]
      },
      {
        label: "My Work",
        items: [
          { href: "/llc/my-applications", icon: FileText, label: "My Applications" },
          { href: "/tasks", icon: CheckSquare, label: "My Tasks" },
        ]
      },
      {
        label: "Performance",
        items: [
          { href: "/performance", icon: BarChart3, label: "My Performance" },
        ]
      }
    ],
    adminGroups: [
      {
        label: "Pinned",
        items: [
          { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
          { href: "/chat", icon: MessageSquare, label: "Chat" },
          { href: "/members", icon: Users, label: "Team" },
        ]
      },
      {
        label: "Operations Management",
        items: [
          { href: "/llc/applications", icon: FileText, label: "All Applications" },
          { href: "/llc/documents", icon: FileCheck, label: "Documents" },
          { href: "/llc/compliance", icon: ClipboardList, label: "Compliance" },
          { href: "/llc/assignments", icon: UserCheck, label: "Assignments" },
        ]
      },
      {
        label: "Reports",
        items: [
          { href: "/admin/reports", icon: BarChart3, label: "Operations Reports" },
          { href: "/performance", icon: TrendingUp, label: "Team Performance" },
        ]
      }
    ],
    members: [
      { email: "admin@suprans.in", role: "admin" },
    ]
  },
  {
    id: "events",
    name: "Events",
    subtitle: "IBS Seminars & Investor Meets",
    icon: CalendarDays,
    color: "#E91E63",
    groups: [
      {
        label: "Pinned",
        items: [
          { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
          { href: "/chat", icon: MessageSquare, label: "Chat" },
          { href: "/members", icon: Users, label: "Team" },
        ]
      },
      {
        label: "Events",
        items: [
          { href: "/events", icon: CalendarDays, label: "My Events" },
        ]
      },
      {
        label: "My Work",
        items: [
          { href: "/events/my-tasks", icon: ClipboardList, label: "My Tasks" },
          { href: "/tasks", icon: CheckSquare, label: "General Tasks" },
        ]
      },
      {
        label: "Performance",
        items: [
          { href: "/performance", icon: BarChart3, label: "My Performance" },
        ]
      }
    ],
    adminGroups: [
      {
        label: "Pinned",
        items: [
          { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
          { href: "/chat", icon: MessageSquare, label: "Chat" },
          { href: "/members", icon: Users, label: "Team" },
        ]
      },
      {
        label: "Event Management",
        items: [
          { href: "/events", icon: CalendarDays, label: "All Events" },
          { href: "/venues", icon: Building2, label: "Venue Comparison" },
          { href: "/events/cities", icon: MapPin, label: "City Management" },
        ]
      },
      {
        label: "Operations",
        items: [
          { href: "/events/attendees", icon: Users, label: "Attendee Database" },
          { href: "/events/tasks", icon: ClipboardList, label: "All Event Tasks" },
          { href: "/events/assignments", icon: UserCheck, label: "Task Assignments" },
        ]
      },
      {
        label: "Reports",
        items: [
          { href: "/events/reports", icon: BarChart3, label: "Event Reports" },
          { href: "/performance", icon: TrendingUp, label: "Team Performance" },
        ]
      },
      {
        label: "Logistics",
        items: [
          { href: "/events/vendors", icon: Truck, label: "Vendor Management" },
        ]
      }
    ],
    members: [
      { email: "admin@suprans.in", role: "admin" },
      { email: "gaurav@suprans.in", role: "admin" },
      { email: "akansha@suprans.in", role: "member" },
    ]
  },
  {
    id: "hr-recruitment",
    name: "HR & Recruitment",
    subtitle: "Hiring & Onboarding",
    icon: UserPlus,
    color: "#8BC34A",
    groups: [
      {
        label: "Pinned",
        items: [
          { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
          { href: "/chat", icon: MessageSquare, label: "Chat" },
          { href: "/members", icon: Users, label: "Team" },
        ]
      },
      {
        label: "My HR",
        items: [
          { href: "/hr/my-profile", icon: UserCheck, label: "My Profile" },
          { href: "/hr/my-attendance", icon: CalendarCheck, label: "My Attendance" },
          { href: "/hr/my-leave-requests", icon: Calendar, label: "My Leave Requests" },
          { href: "/tasks", icon: CheckSquare, label: "My Tasks" },
        ]
      },
      {
        label: "Performance",
        items: [
          { href: "/performance", icon: BarChart3, label: "My Performance" },
        ]
      }
    ],
    adminGroups: [
      {
        label: "Pinned",
        items: [
          { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
          { href: "/chat", icon: MessageSquare, label: "Chat" },
          { href: "/members", icon: Users, label: "Team" },
        ]
      },
      {
        label: "Employee Management",
        items: [
          { href: "/hr/employees", icon: UserCheck, label: "Employee Directory" },
          { href: "/hr/assets", icon: Package, label: "Assets" },
          { href: "/hr/attendance", icon: CalendarCheck, label: "Attendance" },
          { href: "/hr/leave-requests", icon: CalendarOff, label: "Leave Requests" },
        ]
      },
      {
        label: "Recruitment",
        items: [
          { href: "/hr/candidates", icon: Users, label: "Candidates" },
          { href: "/hr/jobs", icon: Briefcase, label: "Job Openings" },
          { href: "/hr/interviews", icon: CalendarDays, label: "Interviews" },
          { href: "/hr/onboarding", icon: ClipboardList, label: "Onboarding" },
          { href: "/hr/assignments", icon: UserCheck, label: "Assignments" },
        ]
      },
      {
        label: "Reports",
        items: [
          { href: "/hr/reports", icon: BarChart3, label: "HR Reports" },
          { href: "/performance", icon: TrendingUp, label: "Team Performance" },
        ]
      },
      {
        label: "Resources",
        items: [
          { href: "/hr/portals", icon: Globe, label: "Job Portals" },
          { href: "/hr/templates", icon: FileText, label: "HR Templates" },
        ]
      }
    ],
    members: [
      { email: "admin@suprans.in", role: "admin" },
      { email: "tina@suprans.in", role: "admin" },
    ]
  },
  {
    id: "finance",
    name: "Finance & Accounts",
    subtitle: "Company Finances & Payroll",
    icon: PiggyBank,
    color: "#009688",
    groups: [
      {
        label: "Pinned",
        items: [
          { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
          { href: "/chat", icon: MessageSquare, label: "Chat" },
          { href: "/members", icon: Users, label: "Team" },
        ]
      },
      {
        label: "My Work",
        items: [
          { href: "/finance/my-expenses", icon: Receipt, label: "My Expenses" },
          { href: "/tasks", icon: CheckSquare, label: "My Tasks" },
        ]
      },
      {
        label: "Performance",
        items: [
          { href: "/performance", icon: BarChart3, label: "My Performance" },
        ]
      }
    ],
    adminGroups: [
      {
        label: "Pinned",
        items: [
          { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
          { href: "/chat", icon: MessageSquare, label: "Chat" },
          { href: "/members", icon: Users, label: "Team" },
        ]
      },
      {
        label: "Financial Management",
        items: [
          { href: "/finance/revenue", icon: TrendingUp, label: "Revenue" },
          { href: "/finance/expenses", icon: Receipt, label: "All Expenses" },
          { href: "/finance/payroll", icon: DollarSign, label: "Payroll" },
          { href: "/finance/assignments", icon: UserCheck, label: "Assignments" },
        ]
      },
      {
        label: "Reports",
        items: [
          { href: "/finance/reports", icon: BarChart3, label: "Financial Reports" },
          { href: "/performance", icon: TrendingUp, label: "Team Performance" },
        ]
      }
    ],
    members: [
      { email: "admin@suprans.in", role: "admin" },
    ]
  },
  {
    id: "marketing",
    name: "Marketing",
    subtitle: "Campaigns & Content",
    icon: Megaphone,
    color: "#FF5722",
    groups: [
      {
        label: "Pinned",
        items: [
          { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
          { href: "/chat", icon: MessageSquare, label: "Chat" },
          { href: "/members", icon: Users, label: "Team" },
        ]
      },
      {
        label: "My Work",
        items: [
          { href: "/marketing/my-content", icon: FileText, label: "My Content" },
          { href: "/tasks", icon: CheckSquare, label: "My Tasks" },
        ]
      },
      {
        label: "Performance",
        items: [
          { href: "/performance", icon: BarChart3, label: "My Performance" },
        ]
      }
    ],
    adminGroups: [
      {
        label: "Pinned",
        items: [
          { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
          { href: "/chat", icon: MessageSquare, label: "Chat" },
          { href: "/members", icon: Users, label: "Team" },
        ]
      },
      {
        label: "Campaign Management",
        items: [
          { href: "/marketing/campaigns", icon: Target, label: "Campaigns" },
          { href: "/marketing/content", icon: FileText, label: "All Content" },
          { href: "/marketing/assignments", icon: UserCheck, label: "Assignments" },
        ]
      },
      {
        label: "Channels",
        items: [
          { href: "/marketing/social", icon: Globe, label: "Social Media" },
        ]
      },
      {
        label: "Reports",
        items: [
          { href: "/marketing/analytics", icon: BarChart3, label: "Analytics" },
          { href: "/performance", icon: TrendingUp, label: "Team Performance" },
        ]
      }
    ],
    members: [
      { email: "admin@suprans.in", role: "admin" },
    ]
  },
  {
    id: "media",
    name: "Media",
    subtitle: "Video Editing & Design",
    icon: Video,
    color: "#E040FB",
    groups: [
      {
        label: "Pinned",
        items: [
          { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
          { href: "/chat", icon: MessageSquare, label: "Chat" },
          { href: "/members", icon: Users, label: "Team" },
        ]
      },
      {
        label: "My Work",
        items: [
          { href: "/media/my-projects", icon: Video, label: "My Projects" },
          { href: "/tasks", icon: CheckSquare, label: "My Tasks" },
        ]
      },
      {
        label: "Performance",
        items: [
          { href: "/performance", icon: BarChart3, label: "My Performance" },
        ]
      }
    ],
    adminGroups: [
      {
        label: "Pinned",
        items: [
          { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
          { href: "/chat", icon: MessageSquare, label: "Chat" },
          { href: "/members", icon: Users, label: "Team" },
        ]
      },
      {
        label: "Project Management",
        items: [
          { href: "/media/videos", icon: Video, label: "All Videos" },
          { href: "/media/designs", icon: FileText, label: "All Designs" },
          { href: "/media/assignments", icon: UserCheck, label: "Assignments" },
        ]
      },
      {
        label: "Reports",
        items: [
          { href: "/admin/reports", icon: BarChart3, label: "Project Reports" },
          { href: "/performance", icon: TrendingUp, label: "Team Performance" },
        ]
      }
    ],
    members: [
      { email: "admin@suprans.in", role: "admin" },
      { email: "amit@suprans.in", role: "member" },
    ]
  },
  {
    id: "admin-it",
    name: "Admin & IT",
    subtitle: "System Administration",
    icon: Wrench,
    color: "#673AB7",
    groups: [
      {
        label: "Pinned",
        items: [
          { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
          { href: "/chat", icon: MessageSquare, label: "Chat" },
          { href: "/members", icon: Users, label: "Team" },
        ]
      },
      {
        label: "My Work",
        items: [
          { href: "/it/my-tickets", icon: Headphones, label: "My Tickets" },
          { href: "/tasks", icon: CheckSquare, label: "My Tasks" },
        ]
      },
      {
        label: "Performance",
        items: [
          { href: "/performance", icon: BarChart3, label: "My Performance" },
        ]
      }
    ],
    adminGroups: [
      {
        label: "Pinned",
        items: [
          { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
          { href: "/chat", icon: MessageSquare, label: "Chat" },
          { href: "/members", icon: Users, label: "Team" },
        ]
      },
      {
        label: "Administration",
        items: [
          { href: "/admin/team", icon: Users, label: "Team Management" },
          { href: "/admin/settings", icon: Settings, label: "Settings" },
        ]
      },
      {
        label: "Support",
        items: [
          { href: "/it/tickets", icon: Headphones, label: "All Tickets" },
          { href: "/it/systems", icon: Database, label: "Systems" },
        ]
      },
      {
        label: "Reports",
        items: [
          { href: "/admin/reports", icon: BarChart3, label: "IT Reports" },
          { href: "/performance", icon: TrendingUp, label: "Team Performance" },
        ]
      },
      {
        label: "Content",
        items: [
          { href: "/admin/templates", icon: Mail, label: "Templates" },
          { href: "/admin/services", icon: BookOpen, label: "Knowledge Base" },
          { href: "/admin/training", icon: GraduationCap, label: "Training" },
          { href: "/admin/website", icon: Globe, label: "Website Manager" },
        ]
      }
    ],
    members: [
      { email: "admin@suprans.in", role: "admin" },
    ]
  },
  {
    id: "sales",
    name: "Sales",
    subtitle: "Combined Sales Team",
    icon: TrendingUp,
    color: "#F34147",
    groups: [
      {
        label: "Pinned",
        items: [
          { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
          { href: "/chat", icon: MessageSquare, label: "Chat" },
          { href: "/members", icon: Users, label: "Team" },
        ]
      },
      {
        label: "Sales",
        items: [
          { href: "/leads", icon: Users, label: "All Leads" },
          { href: "/pipeline", icon: KanbanSquare, label: "Sales Pipeline" },
          { href: "/tasks", icon: CheckSquare, label: "Tasks" },
          { href: "/follow-ups", icon: Phone, label: "Follow-ups" },
        ]
      },
      {
        label: "Scheduling",
        items: [
          { href: "/calendar", icon: CalendarDays, label: "Calendar" },
          { href: "/bookings", icon: Calendar, label: "My Bookings" },
          { href: "/bookings/availability", icon: CalendarCheck, label: "My Availability" },
          { href: "/bookings/types", icon: CalendarDays, label: "Booking Types" },
        ]
      },
      {
        label: "Resources",
        items: [
          { href: "/resources/templates", icon: FileText, label: "Templates" },
          { href: "/knowledge/services", icon: BookOpen, label: "Products & Services" },
        ]
      },
      {
        label: "Performance",
        items: [
          { href: "/performance", icon: BarChart3, label: "My Performance" },
        ]
      }
    ],
    adminGroups: [
      {
        label: "Pinned",
        items: [
          { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
          { href: "/chat", icon: MessageSquare, label: "Chat" },
          { href: "/members", icon: Users, label: "Team" },
        ]
      },
      {
        label: "Sales Management",
        items: [
          { href: "/admin/leads", icon: Users, label: "All Leads" },
          { href: "/pipeline", icon: KanbanSquare, label: "Sales Pipeline" },
          { href: "/admin/assignments", icon: UserCheck, label: "Assignments" },
          { href: "/payment-links", icon: Link2, label: "Payment Links" },
        ]
      },
      {
        label: "Scheduling",
        items: [
          { href: "/calendar", icon: CalendarDays, label: "Calendar" },
          { href: "/bookings", icon: Calendar, label: "My Bookings" },
          { href: "/bookings/availability", icon: CalendarCheck, label: "My Availability" },
          { href: "/bookings/types", icon: CalendarDays, label: "Booking Types" },
          { href: "/admin/bookings", icon: Users, label: "All Team Bookings" },
        ]
      },
      {
        label: "Reports & Analytics",
        items: [
          { href: "/admin/reports", icon: BarChart3, label: "Sales Reports" },
          { href: "/performance", icon: TrendingUp, label: "Team Performance" },
        ]
      },
      {
        label: "Resources",
        items: [
          { href: "/resources/templates", icon: FileText, label: "Templates" },
          { href: "/knowledge/services", icon: BookOpen, label: "Products & Services" },
        ]
      }
    ],
    members: [
      { email: "admin@suprans.in", role: "admin" },
      { email: "himanshu@suprans.in", role: "member" },
      { email: "abhinandan@suprans.in", role: "member" },
      { email: "simran@suprans.in", role: "member" },
      { email: "sumit@suprans.in", role: "member" },
      { email: "punit@suprans.in", role: "member" },
      { email: "sunny@suprans.in", role: "member" },
      { email: "akshay@suprans.in", role: "member" },
      { email: "garima@suprans.in", role: "member" },
      { email: "sahil.solanki@suprans.in", role: "member" },
      { email: "yash@suprans.in", role: "member" },
      { email: "payal@suprans.in", role: "member" },
      { email: "parthiv@suprans.in", role: "member" },
    ]
  },
  {
    id: "faire-order-fulfilment",
    name: "Faire Order Fulfilment",
    subtitle: "Wholesale Order Management",
    icon: Package,
    color: "#FF6B35",
    groups: [
      {
        label: "Pinned",
        items: [
          { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
          { href: "/chat", icon: MessageSquare, label: "Chat" },
          { href: "/members", icon: Users, label: "Team" },
        ]
      },
      {
        label: "My Work",
        items: [
          { href: "/faire/orders", icon: ClipboardList, label: "My Orders" },
          { href: "/faire/shipments", icon: Truck, label: "My Shipments" },
          { href: "/tasks", icon: CheckSquare, label: "My Tasks" },
        ]
      },
      {
        label: "Performance",
        items: [
          { href: "/performance", icon: BarChart3, label: "My Performance" },
        ]
      }
    ],
    adminGroups: [
      {
        label: "Pinned",
        items: [
          { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
          { href: "/chat", icon: MessageSquare, label: "Chat" },
          { href: "/members", icon: Users, label: "Team" },
        ]
      },
      {
        label: "Order Management",
        items: [
          { href: "/faire/orders", icon: ClipboardList, label: "All Orders" },
          { href: "/faire/shipments", icon: Truck, label: "Shipments" },
          { href: "/faire/stores", icon: Building2, label: "Stores" },
        ]
      },
      {
        label: "Reports",
        items: [
          { href: "/admin/reports", icon: BarChart3, label: "Order Reports" },
          { href: "/performance", icon: TrendingUp, label: "Team Performance" },
        ]
      },
      {
        label: "Suppliers",
        items: [
          { href: "/faire/suppliers", icon: Factory, label: "Suppliers" },
        ]
      }
    ],
    members: [
      { email: "admin@suprans.in", role: "admin" },
    ]
  },
  {
    id: "faire-products",
    name: "Faire - Products",
    subtitle: "Product Development & Inventory",
    icon: Package,
    color: "#4ECDC4",
    groups: [
      {
        label: "Pinned",
        items: [
          { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
          { href: "/chat", icon: MessageSquare, label: "Chat" },
          { href: "/members", icon: Users, label: "Team" },
        ]
      },
      {
        label: "My Work",
        items: [
          { href: "/faire/products", icon: Package, label: "My Products" },
          { href: "/faire/inventory", icon: Database, label: "Inventory" },
          { href: "/tasks", icon: CheckSquare, label: "My Tasks" },
        ]
      },
      {
        label: "Performance",
        items: [
          { href: "/performance", icon: BarChart3, label: "My Performance" },
        ]
      }
    ],
    adminGroups: [
      {
        label: "Pinned",
        items: [
          { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
          { href: "/chat", icon: MessageSquare, label: "Chat" },
          { href: "/members", icon: Users, label: "Team" },
        ]
      },
      {
        label: "Product Management",
        items: [
          { href: "/faire/products", icon: Package, label: "All Products" },
          { href: "/faire/variants", icon: Database, label: "Variants" },
          { href: "/faire/inventory", icon: ClipboardList, label: "Inventory" },
        ]
      },
      {
        label: "Reports",
        items: [
          { href: "/admin/reports", icon: BarChart3, label: "Product Reports" },
          { href: "/performance", icon: TrendingUp, label: "Team Performance" },
        ]
      },
      {
        label: "Suppliers",
        items: [
          { href: "/faire/suppliers", icon: Factory, label: "Suppliers" },
        ]
      }
    ],
    members: [
      { email: "admin@suprans.in", role: "admin" },
    ]
  }
];

export function getTeamById(id: string): Team | undefined {
  return teams.find(t => t.id === id);
}

export function getDefaultTeam(): Team {
  return teams[0];
}
