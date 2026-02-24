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
    name: "Travel - Sales",
    subtitle: "Tour Bookings & Inquiries",
    icon: Plane,
    color: "#F34147",
    groups: [
      {
        label: "Pinned",
        items: [
          { href: "/team/dashboard", icon: LayoutDashboard, label: "Dashboard" },
          { href: "/team/chat", icon: MessageSquare, label: "Chat" },
          { href: "/team/members", icon: Users, label: "Team" },
        ]
      },
      {
        label: "My Sales",
        items: [
          { href: "/team/leads", icon: Users, label: "My Inquiries" },
          { href: "/team/pipeline", icon: KanbanSquare, label: "Booking Pipeline" },
          { href: "/team/tasks", icon: CheckSquare, label: "My Tasks" },
          { href: "/team/follow-ups", icon: Phone, label: "Follow-ups" },
        ]
      },
      {
        label: "Scheduling",
        items: [
          { href: "/team/calendar", icon: CalendarDays, label: "Calendar" },
          { href: "/team/bookings", icon: Calendar, label: "My Bookings" },
          { href: "/team/bookings/availability", icon: CalendarCheck, label: "My Availability" },
          { href: "/team/bookings/types", icon: CalendarDays, label: "Booking Types" },
        ]
      },
      {
        label: "Resources",
        items: [
          { href: "/team/resources/templates", icon: FileText, label: "Templates" },
          { href: "/team/knowledge/services", icon: BookOpen, label: "Packages & FAQs" },
        ]
      },
      {
        label: "Performance",
        items: [
          { href: "/team/performance", icon: BarChart3, label: "My Performance" },
        ]
      }
    ],
    adminGroups: [
      {
        label: "Pinned",
        items: [
          { href: "/team/dashboard", icon: LayoutDashboard, label: "Dashboard" },
          { href: "/team/chat", icon: MessageSquare, label: "Chat" },
          { href: "/team/members", icon: Users, label: "Team" },
        ]
      },
      {
        label: "Sales Management",
        items: [
          { href: "/team/admin/leads", icon: Users, label: "All Tour Inquiries" },
          { href: "/team/pipeline", icon: KanbanSquare, label: "Booking Pipeline" },
          { href: "/team/admin/assignments", icon: UserCheck, label: "Assignments" },
          { href: "/team/payment-links", icon: Link2, label: "Payment Links" },
        ]
      },
      {
        label: "Scheduling",
        items: [
          { href: "/team/calendar", icon: CalendarDays, label: "Calendar" },
          { href: "/team/bookings", icon: Calendar, label: "My Bookings" },
          { href: "/team/bookings/availability", icon: CalendarCheck, label: "My Availability" },
          { href: "/team/bookings/types", icon: CalendarDays, label: "Booking Types" },
          { href: "/team/admin/bookings", icon: Users, label: "All Team Bookings" },
        ]
      },
      {
        label: "Reports",
        items: [
          { href: "/team/admin/reports", icon: BarChart3, label: "Sales Reports" },
          { href: "/team/performance", icon: TrendingUp, label: "Team Performance" },
        ]
      },
      {
        label: "Resources",
        items: [
          { href: "/team/resources/templates", icon: FileText, label: "Templates" },
          { href: "/team/knowledge/services", icon: BookOpen, label: "Packages & FAQs" },
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
          { href: "/team/dashboard", icon: LayoutDashboard, label: "Dashboard" },
          { href: "/team/chat", icon: MessageSquare, label: "Chat" },
          { href: "/team/members", icon: Users, label: "Team" },
        ]
      },
      {
        label: "My Work",
        items: [
          { href: "/team/travel/my-bookings", icon: CalendarDays, label: "My Bookings" },
          { href: "/team/travel/my-visas", icon: FileCheck, label: "My Visa Tasks" },
          { href: "/team/tasks", icon: CheckSquare, label: "My Tasks" },
        ]
      },
      {
        label: "Performance",
        items: [
          { href: "/team/performance", icon: BarChart3, label: "My Performance" },
        ]
      }
    ],
    adminGroups: [
      {
        label: "Pinned",
        items: [
          { href: "/team/dashboard", icon: LayoutDashboard, label: "Dashboard" },
          { href: "/team/chat", icon: MessageSquare, label: "Chat" },
          { href: "/team/members", icon: Users, label: "Team" },
        ]
      },
      {
        label: "Operations Management",
        items: [
          { href: "/team/travel/bookings", icon: CalendarDays, label: "All Bookings" },
          { href: "/team/travel/visas", icon: FileCheck, label: "Visa Processing" },
          { href: "/team/travel/hotels", icon: Building2, label: "Hotel Bookings" },
          { href: "/team/travel/itineraries", icon: MapPin, label: "Itineraries" },
          { href: "/team/travel/assignments", icon: UserCheck, label: "Assignments" },
        ]
      },
      {
        label: "Reports",
        items: [
          { href: "/team/admin/reports", icon: BarChart3, label: "Operations Reports" },
          { href: "/team/performance", icon: TrendingUp, label: "Team Performance" },
        ]
      },
      {
        label: "Vendors",
        items: [
          { href: "/team/vendors", icon: Truck, label: "Vendor Management" },
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
          { href: "/team/dashboard", icon: LayoutDashboard, label: "Dashboard" },
          { href: "/team/chat", icon: MessageSquare, label: "Chat" },
          { href: "/team/members", icon: Users, label: "Team" },
        ]
      },
      {
        label: "My Work",
        items: [
          { href: "/team/accounts/my-invoices", icon: Receipt, label: "My Invoices" },
          { href: "/team/payment-links", icon: Link2, label: "Payment Links" },
          { href: "/team/tasks", icon: CheckSquare, label: "My Tasks" },
        ]
      },
      {
        label: "Performance",
        items: [
          { href: "/team/performance", icon: BarChart3, label: "My Performance" },
        ]
      }
    ],
    adminGroups: [
      {
        label: "Pinned",
        items: [
          { href: "/team/dashboard", icon: LayoutDashboard, label: "Dashboard" },
          { href: "/team/chat", icon: MessageSquare, label: "Chat" },
          { href: "/team/members", icon: Users, label: "Team" },
        ]
      },
      {
        label: "Financial Management",
        items: [
          { href: "/team/accounts/invoices", icon: Receipt, label: "All Invoices" },
          { href: "/team/accounts/payments", icon: CreditCard, label: "Payments Received" },
          { href: "/team/payment-links", icon: Link2, label: "Payment Links" },
          { href: "/team/accounts/vendor-payments", icon: DollarSign, label: "Vendor Payments" },
        ]
      },
      {
        label: "Reports",
        items: [
          { href: "/team/accounts/reports", icon: BarChart3, label: "Financial Reports" },
          { href: "/team/performance", icon: TrendingUp, label: "Team Performance" },
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
          { href: "/team/dashboard", icon: LayoutDashboard, label: "Dashboard" },
          { href: "/team/chat", icon: MessageSquare, label: "Chat" },
          { href: "/team/members", icon: Users, label: "Team" },
        ]
      },
      {
        label: "My Sales",
        items: [
          { href: "/team/leads", icon: Users, label: "My Inquiries" },
          { href: "/team/pipeline", icon: KanbanSquare, label: "Sales Pipeline" },
          { href: "/team/tasks", icon: CheckSquare, label: "My Tasks" },
          { href: "/team/follow-ups", icon: Phone, label: "Follow-ups" },
        ]
      },
      {
        label: "Resources",
        items: [
          { href: "/team/suppliers", icon: Factory, label: "Supplier Database" },
        ]
      },
      {
        label: "Performance",
        items: [
          { href: "/team/performance", icon: BarChart3, label: "My Performance" },
        ]
      }
    ],
    adminGroups: [
      {
        label: "Pinned",
        items: [
          { href: "/team/dashboard", icon: LayoutDashboard, label: "Dashboard" },
          { href: "/team/chat", icon: MessageSquare, label: "Chat" },
          { href: "/team/members", icon: Users, label: "Team" },
        ]
      },
      {
        label: "Sales Management",
        items: [
          { href: "/team/admin/leads", icon: Users, label: "All Inquiries" },
          { href: "/team/pipeline", icon: KanbanSquare, label: "Sales Pipeline" },
          { href: "/team/admin/assignments", icon: UserCheck, label: "Assignments" },
        ]
      },
      {
        label: "Reports",
        items: [
          { href: "/team/admin/reports", icon: BarChart3, label: "Sales Reports" },
          { href: "/team/performance", icon: TrendingUp, label: "Team Performance" },
        ]
      },
      {
        label: "Resources",
        items: [
          { href: "/team/suppliers", icon: Factory, label: "Supplier Database" },
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
          { href: "/team/dashboard", icon: LayoutDashboard, label: "Dashboard" },
          { href: "/team/chat", icon: MessageSquare, label: "Chat" },
          { href: "/team/members", icon: Users, label: "Team" },
        ]
      },
      {
        label: "My Work",
        items: [
          { href: "/team/import/my-orders", icon: Package, label: "My Orders" },
          { href: "/team/import/my-qc", icon: CheckSquare, label: "My QC Tasks" },
          { href: "/team/tasks", icon: CheckSquare, label: "My Tasks" },
        ]
      },
      {
        label: "Performance",
        items: [
          { href: "/team/performance", icon: BarChart3, label: "My Performance" },
        ]
      }
    ],
    adminGroups: [
      {
        label: "Pinned",
        items: [
          { href: "/team/dashboard", icon: LayoutDashboard, label: "Dashboard" },
          { href: "/team/chat", icon: MessageSquare, label: "Chat" },
          { href: "/team/members", icon: Users, label: "Team" },
        ]
      },
      {
        label: "Operations Management",
        items: [
          { href: "/team/import/orders", icon: Package, label: "All Orders" },
          { href: "/team/import/qc", icon: CheckSquare, label: "Quality Control" },
          { href: "/team/import/shipping", icon: Ship, label: "Shipping" },
          { href: "/team/import/customs", icon: FileCheck, label: "Customs" },
          { href: "/team/import/assignments", icon: UserCheck, label: "Assignments" },
        ]
      },
      {
        label: "Reports",
        items: [
          { href: "/team/admin/reports", icon: BarChart3, label: "Operations Reports" },
          { href: "/team/performance", icon: TrendingUp, label: "Team Performance" },
        ]
      },
      {
        label: "Suppliers",
        items: [
          { href: "/team/suppliers", icon: Factory, label: "Supplier Database" },
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
          { href: "/team/dashboard", icon: LayoutDashboard, label: "Dashboard" },
          { href: "/team/chat", icon: MessageSquare, label: "Chat" },
          { href: "/team/members", icon: Users, label: "Team" },
        ]
      },
      {
        label: "My Sales",
        items: [
          { href: "/team/leads", icon: Users, label: "My Inquiries" },
          { href: "/team/pipeline", icon: KanbanSquare, label: "Sales Pipeline" },
          { href: "/team/tasks", icon: CheckSquare, label: "My Tasks" },
          { href: "/team/follow-ups", icon: Phone, label: "Follow-ups" },
        ]
      },
      {
        label: "Performance",
        items: [
          { href: "/team/performance", icon: BarChart3, label: "My Performance" },
        ]
      }
    ],
    adminGroups: [
      {
        label: "Pinned",
        items: [
          { href: "/team/dashboard", icon: LayoutDashboard, label: "Dashboard" },
          { href: "/team/chat", icon: MessageSquare, label: "Chat" },
          { href: "/team/members", icon: Users, label: "Team" },
        ]
      },
      {
        label: "Sales Management",
        items: [
          { href: "/team/admin/leads", icon: Users, label: "All Inquiries" },
          { href: "/team/pipeline", icon: KanbanSquare, label: "Sales Pipeline" },
          { href: "/team/admin/assignments", icon: UserCheck, label: "Assignments" },
        ]
      },
      {
        label: "Reports",
        items: [
          { href: "/team/admin/reports", icon: BarChart3, label: "Sales Reports" },
          { href: "/team/performance", icon: TrendingUp, label: "Team Performance" },
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
          { href: "/team/dashboard", icon: LayoutDashboard, label: "Dashboard" },
          { href: "/team/chat", icon: MessageSquare, label: "Chat" },
          { href: "/team/members", icon: Users, label: "Team" },
        ]
      },
      {
        label: "My Work",
        items: [
          { href: "/team/dropship/my-orders", icon: ClipboardList, label: "My Orders" },
          { href: "/team/tasks", icon: CheckSquare, label: "My Tasks" },
        ]
      },
      {
        label: "Performance",
        items: [
          { href: "/team/performance", icon: BarChart3, label: "My Performance" },
        ]
      }
    ],
    adminGroups: [
      {
        label: "Pinned",
        items: [
          { href: "/team/dashboard", icon: LayoutDashboard, label: "Dashboard" },
          { href: "/team/chat", icon: MessageSquare, label: "Chat" },
          { href: "/team/members", icon: Users, label: "Team" },
        ]
      },
      {
        label: "Operations Management",
        items: [
          { href: "/team/dropship/products", icon: Package, label: "Products" },
          { href: "/team/dropship/inventory", icon: Database, label: "Inventory" },
          { href: "/team/dropship/orders", icon: ClipboardList, label: "All Orders" },
          { href: "/team/dropship/assignments", icon: UserCheck, label: "Assignments" },
        ]
      },
      {
        label: "Reports",
        items: [
          { href: "/team/admin/reports", icon: BarChart3, label: "Operations Reports" },
          { href: "/team/performance", icon: TrendingUp, label: "Team Performance" },
        ]
      },
      {
        label: "Suppliers",
        items: [
          { href: "/team/dropship/suppliers", icon: Truck, label: "Suppliers" },
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
          { href: "/team/dashboard", icon: LayoutDashboard, label: "Dashboard" },
          { href: "/team/chat", icon: MessageSquare, label: "Chat" },
          { href: "/team/members", icon: Users, label: "Team" },
        ]
      },
      {
        label: "My Sales",
        items: [
          { href: "/team/leads", icon: Users, label: "My Inquiries" },
          { href: "/team/pipeline", icon: KanbanSquare, label: "Sales Pipeline" },
          { href: "/team/tasks", icon: CheckSquare, label: "My Tasks" },
          { href: "/team/follow-ups", icon: Phone, label: "Follow-ups" },
        ]
      },
      {
        label: "Resources",
        items: [
          { href: "/team/resources/templates", icon: FileText, label: "Templates" },
          { href: "/team/knowledge/services", icon: BookOpen, label: "LLC Packages" },
        ]
      },
      {
        label: "Performance",
        items: [
          { href: "/team/performance", icon: BarChart3, label: "My Performance" },
        ]
      }
    ],
    adminGroups: [
      {
        label: "Pinned",
        items: [
          { href: "/team/dashboard", icon: LayoutDashboard, label: "Dashboard" },
          { href: "/team/chat", icon: MessageSquare, label: "Chat" },
          { href: "/team/members", icon: Users, label: "Team" },
        ]
      },
      {
        label: "Sales Management",
        items: [
          { href: "/team/admin/leads", icon: Users, label: "All Inquiries" },
          { href: "/team/pipeline", icon: KanbanSquare, label: "Sales Pipeline" },
          { href: "/team/admin/assignments", icon: UserCheck, label: "Assignments" },
        ]
      },
      {
        label: "Reports",
        items: [
          { href: "/team/admin/reports", icon: BarChart3, label: "Sales Reports" },
          { href: "/team/performance", icon: TrendingUp, label: "Team Performance" },
        ]
      },
      {
        label: "Resources",
        items: [
          { href: "/team/resources/templates", icon: FileText, label: "Templates" },
          { href: "/team/knowledge/services", icon: BookOpen, label: "LLC Packages" },
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
          { href: "/team/dashboard", icon: LayoutDashboard, label: "Dashboard" },
          { href: "/team/chat", icon: MessageSquare, label: "Chat" },
          { href: "/team/members", icon: Users, label: "Team" },
        ]
      },
      {
        label: "My Work",
        items: [
          { href: "/team/llc/my-applications", icon: FileText, label: "My Applications" },
          { href: "/team/tasks", icon: CheckSquare, label: "My Tasks" },
        ]
      },
      {
        label: "Performance",
        items: [
          { href: "/team/performance", icon: BarChart3, label: "My Performance" },
        ]
      }
    ],
    adminGroups: [
      {
        label: "Pinned",
        items: [
          { href: "/team/dashboard", icon: LayoutDashboard, label: "Dashboard" },
          { href: "/team/chat", icon: MessageSquare, label: "Chat" },
          { href: "/team/members", icon: Users, label: "Team" },
        ]
      },
      {
        label: "Operations Management",
        items: [
          { href: "/team/llc/applications", icon: FileText, label: "All Applications" },
          { href: "/team/llc/documents", icon: FileCheck, label: "Documents" },
          { href: "/team/llc/compliance", icon: ClipboardList, label: "Compliance" },
          { href: "/team/llc/assignments", icon: UserCheck, label: "Assignments" },
        ]
      },
      {
        label: "Reports",
        items: [
          { href: "/team/admin/reports", icon: BarChart3, label: "Operations Reports" },
          { href: "/team/performance", icon: TrendingUp, label: "Team Performance" },
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
          { href: "/team/dashboard", icon: LayoutDashboard, label: "Dashboard" },
          { href: "/team/chat", icon: MessageSquare, label: "Chat" },
          { href: "/team/members", icon: Users, label: "Team" },
        ]
      },
      {
        label: "Events",
        items: [
          { href: "/team/events", icon: CalendarDays, label: "My Events" },
        ]
      },
      {
        label: "My Work",
        items: [
          { href: "/team/events/my-tasks", icon: ClipboardList, label: "My Tasks" },
          { href: "/team/tasks", icon: CheckSquare, label: "General Tasks" },
        ]
      },
      {
        label: "Performance",
        items: [
          { href: "/team/performance", icon: BarChart3, label: "My Performance" },
        ]
      }
    ],
    adminGroups: [
      {
        label: "Pinned",
        items: [
          { href: "/team/dashboard", icon: LayoutDashboard, label: "Dashboard" },
          { href: "/team/chat", icon: MessageSquare, label: "Chat" },
          { href: "/team/members", icon: Users, label: "Team" },
        ]
      },
      {
        label: "Event Management",
        items: [
          { href: "/team/events", icon: CalendarDays, label: "All Events" },
          { href: "/team/venues", icon: Building2, label: "Venue Comparison" },
          { href: "/team/events/cities", icon: MapPin, label: "City Management" },
        ]
      },
      {
        label: "Operations",
        items: [
          { href: "/team/events/attendees", icon: Users, label: "Attendee Database" },
          { href: "/team/events/tasks", icon: ClipboardList, label: "All Event Tasks" },
          { href: "/team/events/assignments", icon: UserCheck, label: "Task Assignments" },
        ]
      },
      {
        label: "Reports",
        items: [
          { href: "/team/events/reports", icon: BarChart3, label: "Event Reports" },
          { href: "/team/performance", icon: TrendingUp, label: "Team Performance" },
        ]
      },
      {
        label: "Logistics",
        items: [
          { href: "/team/events/vendors", icon: Truck, label: "Vendor Management" },
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
          { href: "/team/dashboard", icon: LayoutDashboard, label: "Dashboard" },
          { href: "/team/chat", icon: MessageSquare, label: "Chat" },
          { href: "/team/members", icon: Users, label: "Team" },
        ]
      },
      {
        label: "My HR",
        items: [
          { href: "/team/hr/my-profile", icon: UserCheck, label: "My Profile" },
          { href: "/team/hr/my-attendance", icon: CalendarCheck, label: "My Attendance" },
          { href: "/team/hr/my-leave-requests", icon: Calendar, label: "My Leave Requests" },
          { href: "/team/tasks", icon: CheckSquare, label: "My Tasks" },
        ]
      },
      {
        label: "Performance",
        items: [
          { href: "/team/performance", icon: BarChart3, label: "My Performance" },
        ]
      }
    ],
    adminGroups: [
      {
        label: "Pinned",
        items: [
          { href: "/team/dashboard", icon: LayoutDashboard, label: "Dashboard" },
          { href: "/team/chat", icon: MessageSquare, label: "Chat" },
          { href: "/team/members", icon: Users, label: "Team" },
        ]
      },
      {
        label: "Employee Management",
        items: [
          { href: "/team/hr/employees", icon: UserCheck, label: "Employee Directory" },
          { href: "/team/hr/assets", icon: Package, label: "Assets" },
          { href: "/team/hr/attendance", icon: CalendarCheck, label: "Attendance" },
          { href: "/team/hr/leave-requests", icon: CalendarOff, label: "Leave Requests" },
        ]
      },
      {
        label: "Recruitment",
        items: [
          { href: "/team/hr/candidates", icon: Users, label: "Candidates" },
          { href: "/team/hr/jobs", icon: Briefcase, label: "Job Openings" },
          { href: "/team/hr/interviews", icon: CalendarDays, label: "Interviews" },
          { href: "/team/hr/onboarding", icon: ClipboardList, label: "Onboarding" },
          { href: "/team/hr/assignments", icon: UserCheck, label: "Assignments" },
        ]
      },
      {
        label: "Reports",
        items: [
          { href: "/team/hr/reports", icon: BarChart3, label: "HR Reports" },
          { href: "/team/performance", icon: TrendingUp, label: "Team Performance" },
        ]
      },
      {
        label: "Resources",
        items: [
          { href: "/team/hr/portals", icon: Globe, label: "Job Portals" },
          { href: "/team/hr/templates", icon: FileText, label: "HR Templates" },
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
          { href: "/team/dashboard", icon: LayoutDashboard, label: "Dashboard" },
          { href: "/team/chat", icon: MessageSquare, label: "Chat" },
          { href: "/team/members", icon: Users, label: "Team" },
        ]
      },
      {
        label: "My Work",
        items: [
          { href: "/team/finance/my-expenses", icon: Receipt, label: "My Expenses" },
          { href: "/team/tasks", icon: CheckSquare, label: "My Tasks" },
        ]
      },
      {
        label: "Performance",
        items: [
          { href: "/team/performance", icon: BarChart3, label: "My Performance" },
        ]
      }
    ],
    adminGroups: [
      {
        label: "Pinned",
        items: [
          { href: "/team/dashboard", icon: LayoutDashboard, label: "Dashboard" },
          { href: "/team/chat", icon: MessageSquare, label: "Chat" },
          { href: "/team/members", icon: Users, label: "Team" },
        ]
      },
      {
        label: "Financial Management",
        items: [
          { href: "/team/finance/revenue", icon: TrendingUp, label: "Revenue" },
          { href: "/team/finance/expenses", icon: Receipt, label: "All Expenses" },
          { href: "/team/finance/payroll", icon: DollarSign, label: "Payroll" },
          { href: "/team/finance/assignments", icon: UserCheck, label: "Assignments" },
        ]
      },
      {
        label: "Reports",
        items: [
          { href: "/team/finance/reports", icon: BarChart3, label: "Financial Reports" },
          { href: "/team/performance", icon: TrendingUp, label: "Team Performance" },
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
          { href: "/team/dashboard", icon: LayoutDashboard, label: "Dashboard" },
          { href: "/team/chat", icon: MessageSquare, label: "Chat" },
          { href: "/team/members", icon: Users, label: "Team" },
        ]
      },
      {
        label: "My Work",
        items: [
          { href: "/team/marketing/my-content", icon: FileText, label: "My Content" },
          { href: "/team/tasks", icon: CheckSquare, label: "My Tasks" },
        ]
      },
      {
        label: "Performance",
        items: [
          { href: "/team/performance", icon: BarChart3, label: "My Performance" },
        ]
      }
    ],
    adminGroups: [
      {
        label: "Pinned",
        items: [
          { href: "/team/dashboard", icon: LayoutDashboard, label: "Dashboard" },
          { href: "/team/chat", icon: MessageSquare, label: "Chat" },
          { href: "/team/members", icon: Users, label: "Team" },
        ]
      },
      {
        label: "Campaign Management",
        items: [
          { href: "/team/marketing/campaigns", icon: Target, label: "Campaigns" },
          { href: "/team/marketing/content", icon: FileText, label: "All Content" },
          { href: "/team/marketing/assignments", icon: UserCheck, label: "Assignments" },
        ]
      },
      {
        label: "Channels",
        items: [
          { href: "/team/marketing/social", icon: Globe, label: "Social Media" },
        ]
      },
      {
        label: "Reports",
        items: [
          { href: "/team/marketing/analytics", icon: BarChart3, label: "Analytics" },
          { href: "/team/performance", icon: TrendingUp, label: "Team Performance" },
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
          { href: "/team/dashboard", icon: LayoutDashboard, label: "Dashboard" },
          { href: "/team/chat", icon: MessageSquare, label: "Chat" },
          { href: "/team/members", icon: Users, label: "Team" },
        ]
      },
      {
        label: "My Work",
        items: [
          { href: "/team/media/my-projects", icon: Video, label: "My Projects" },
          { href: "/team/tasks", icon: CheckSquare, label: "My Tasks" },
        ]
      },
      {
        label: "Performance",
        items: [
          { href: "/team/performance", icon: BarChart3, label: "My Performance" },
        ]
      }
    ],
    adminGroups: [
      {
        label: "Pinned",
        items: [
          { href: "/team/dashboard", icon: LayoutDashboard, label: "Dashboard" },
          { href: "/team/chat", icon: MessageSquare, label: "Chat" },
          { href: "/team/members", icon: Users, label: "Team" },
        ]
      },
      {
        label: "Project Management",
        items: [
          { href: "/team/media/videos", icon: Video, label: "All Videos" },
          { href: "/team/media/designs", icon: FileText, label: "All Designs" },
          { href: "/team/media/assignments", icon: UserCheck, label: "Assignments" },
        ]
      },
      {
        label: "Reports",
        items: [
          { href: "/team/admin/reports", icon: BarChart3, label: "Project Reports" },
          { href: "/team/performance", icon: TrendingUp, label: "Team Performance" },
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
          { href: "/team/dashboard", icon: LayoutDashboard, label: "Dashboard" },
          { href: "/team/chat", icon: MessageSquare, label: "Chat" },
          { href: "/team/members", icon: Users, label: "Team" },
        ]
      },
      {
        label: "My Work",
        items: [
          { href: "/team/it/my-tickets", icon: Headphones, label: "My Tickets" },
          { href: "/team/tasks", icon: CheckSquare, label: "My Tasks" },
        ]
      },
      {
        label: "Performance",
        items: [
          { href: "/team/performance", icon: BarChart3, label: "My Performance" },
        ]
      }
    ],
    adminGroups: [
      {
        label: "Pinned",
        items: [
          { href: "/team/dashboard", icon: LayoutDashboard, label: "Dashboard" },
          { href: "/team/chat", icon: MessageSquare, label: "Chat" },
          { href: "/team/members", icon: Users, label: "Team" },
        ]
      },
      {
        label: "Administration",
        items: [
          { href: "/team/admin/team", icon: Users, label: "Team Management" },
          { href: "/team/admin/settings", icon: Settings, label: "Settings" },
        ]
      },
      {
        label: "Support",
        items: [
          { href: "/team/it/tickets", icon: Headphones, label: "All Tickets" },
          { href: "/team/it/systems", icon: Database, label: "Systems" },
        ]
      },
      {
        label: "Reports",
        items: [
          { href: "/team/admin/reports", icon: BarChart3, label: "IT Reports" },
          { href: "/team/performance", icon: TrendingUp, label: "Team Performance" },
        ]
      },
      {
        label: "Content",
        items: [
          { href: "/team/admin/templates", icon: Mail, label: "Templates" },
          { href: "/team/admin/services", icon: BookOpen, label: "Knowledge Base" },
          { href: "/team/admin/training", icon: GraduationCap, label: "Training" },
          { href: "/team/admin/website", icon: Globe, label: "Website Manager" },
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
          { href: "/team/dashboard", icon: LayoutDashboard, label: "Dashboard" },
          { href: "/team/chat", icon: MessageSquare, label: "Chat" },
          { href: "/team/members", icon: Users, label: "Team" },
        ]
      },
      {
        label: "Sales",
        items: [
          { href: "/team/leads", icon: Users, label: "All Leads" },
          { href: "/team/pipeline", icon: KanbanSquare, label: "Sales Pipeline" },
          { href: "/team/tasks", icon: CheckSquare, label: "Tasks" },
          { href: "/team/follow-ups", icon: Phone, label: "Follow-ups" },
        ]
      },
      {
        label: "Scheduling",
        items: [
          { href: "/team/calendar", icon: CalendarDays, label: "Calendar" },
          { href: "/team/bookings", icon: Calendar, label: "My Bookings" },
          { href: "/team/bookings/availability", icon: CalendarCheck, label: "My Availability" },
          { href: "/team/bookings/types", icon: CalendarDays, label: "Booking Types" },
        ]
      },
      {
        label: "Resources",
        items: [
          { href: "/team/resources/templates", icon: FileText, label: "Templates" },
          { href: "/team/knowledge/services", icon: BookOpen, label: "Products & Services" },
        ]
      },
      {
        label: "Performance",
        items: [
          { href: "/team/performance", icon: BarChart3, label: "My Performance" },
        ]
      }
    ],
    adminGroups: [
      {
        label: "Pinned",
        items: [
          { href: "/team/dashboard", icon: LayoutDashboard, label: "Dashboard" },
          { href: "/team/chat", icon: MessageSquare, label: "Chat" },
          { href: "/team/members", icon: Users, label: "Team" },
        ]
      },
      {
        label: "Sales Management",
        items: [
          { href: "/team/admin/leads", icon: Users, label: "All Leads" },
          { href: "/team/pipeline", icon: KanbanSquare, label: "Sales Pipeline" },
          { href: "/team/admin/assignments", icon: UserCheck, label: "Assignments" },
          { href: "/team/payment-links", icon: Link2, label: "Payment Links" },
        ]
      },
      {
        label: "Scheduling",
        items: [
          { href: "/team/calendar", icon: CalendarDays, label: "Calendar" },
          { href: "/team/bookings", icon: Calendar, label: "My Bookings" },
          { href: "/team/bookings/availability", icon: CalendarCheck, label: "My Availability" },
          { href: "/team/bookings/types", icon: CalendarDays, label: "Booking Types" },
          { href: "/team/admin/bookings", icon: Users, label: "All Team Bookings" },
        ]
      },
      {
        label: "Reports & Analytics",
        items: [
          { href: "/team/admin/reports", icon: BarChart3, label: "Sales Reports" },
          { href: "/team/performance", icon: TrendingUp, label: "Team Performance" },
        ]
      },
      {
        label: "Resources",
        items: [
          { href: "/team/resources/templates", icon: FileText, label: "Templates" },
          { href: "/team/knowledge/services", icon: BookOpen, label: "Products & Services" },
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
          { href: "/team/dashboard", icon: LayoutDashboard, label: "Dashboard" },
          { href: "/team/chat", icon: MessageSquare, label: "Chat" },
          { href: "/team/members", icon: Users, label: "Team" },
        ]
      },
      {
        label: "My Work",
        items: [
          { href: "/team/faire/orders", icon: ClipboardList, label: "My Orders" },
          { href: "/team/faire/shipments", icon: Truck, label: "My Shipments" },
          { href: "/team/tasks", icon: CheckSquare, label: "My Tasks" },
        ]
      },
      {
        label: "Performance",
        items: [
          { href: "/team/performance", icon: BarChart3, label: "My Performance" },
        ]
      }
    ],
    adminGroups: [
      {
        label: "Pinned",
        items: [
          { href: "/team/dashboard", icon: LayoutDashboard, label: "Dashboard" },
          { href: "/team/chat", icon: MessageSquare, label: "Chat" },
          { href: "/team/members", icon: Users, label: "Team" },
        ]
      },
      {
        label: "Order Management",
        items: [
          { href: "/team/faire/orders", icon: ClipboardList, label: "All Orders" },
          { href: "/team/faire/shipments", icon: Truck, label: "Shipments" },
          { href: "/team/faire/stores", icon: Building2, label: "Stores" },
        ]
      },
      {
        label: "Reports",
        items: [
          { href: "/team/admin/reports", icon: BarChart3, label: "Order Reports" },
          { href: "/team/performance", icon: TrendingUp, label: "Team Performance" },
        ]
      },
      {
        label: "Suppliers",
        items: [
          { href: "/team/faire/suppliers", icon: Factory, label: "Suppliers" },
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
          { href: "/team/dashboard", icon: LayoutDashboard, label: "Dashboard" },
          { href: "/team/chat", icon: MessageSquare, label: "Chat" },
          { href: "/team/members", icon: Users, label: "Team" },
        ]
      },
      {
        label: "My Work",
        items: [
          { href: "/team/faire/products", icon: Package, label: "My Products" },
          { href: "/team/faire/inventory", icon: Database, label: "Inventory" },
          { href: "/team/tasks", icon: CheckSquare, label: "My Tasks" },
        ]
      },
      {
        label: "Performance",
        items: [
          { href: "/team/performance", icon: BarChart3, label: "My Performance" },
        ]
      }
    ],
    adminGroups: [
      {
        label: "Pinned",
        items: [
          { href: "/team/dashboard", icon: LayoutDashboard, label: "Dashboard" },
          { href: "/team/chat", icon: MessageSquare, label: "Chat" },
          { href: "/team/members", icon: Users, label: "Team" },
        ]
      },
      {
        label: "Product Management",
        items: [
          { href: "/team/faire/products", icon: Package, label: "All Products" },
          { href: "/team/faire/variants", icon: Database, label: "Variants" },
          { href: "/team/faire/inventory", icon: ClipboardList, label: "Inventory" },
        ]
      },
      {
        label: "Reports",
        items: [
          { href: "/team/admin/reports", icon: BarChart3, label: "Product Reports" },
          { href: "/team/performance", icon: TrendingUp, label: "Team Performance" },
        ]
      },
      {
        label: "Suppliers",
        items: [
          { href: "/team/faire/suppliers", icon: Factory, label: "Suppliers" },
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
