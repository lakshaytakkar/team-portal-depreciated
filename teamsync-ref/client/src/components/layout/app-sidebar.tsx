import { useLocation, Link } from "wouter";
import {
  LayoutDashboard,
  Users,
  UserPlus,
  Building2,
  Briefcase,
  CalendarDays,
  Clock,
  FileText,
  Wallet,
  FolderKanban,
  Palette,
  Component,
  Grid3X3,
} from "lucide-react";
import { TeamSyncMascot } from "@/components/brand/teamsync-mascot";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import { Fade } from "@/components/ui/animated";
import { motion } from "motion/react";

const mainNavItems = [
  { title: "Dashboard", url: "/legalnations", icon: LayoutDashboard },
  { title: "Employees", url: "/legalnations/employees", icon: Users },
  { title: "Candidates", url: "/legalnations/candidates", icon: UserPlus },
  { title: "Departments", url: "/legalnations/departments", icon: Building2 },
  { title: "Job Postings", url: "/legalnations/job-postings", icon: Briefcase },
  { title: "Leave Management", url: "/legalnations/leave", icon: CalendarDays },
  { title: "Attendance", url: "/legalnations/attendance", icon: Clock },
  { title: "Documents", url: "/legalnations/documents", icon: FileText },
  { title: "Payroll", url: "/legalnations/payroll", icon: Wallet },
  { title: "Projects", url: "/legalnations/projects", icon: FolderKanban },
];

const designNavItems = [
  { title: "Design System", url: "/dev/design-system", icon: Palette },
  { title: "Components", url: "/dev/components", icon: Component },
  { title: "Icons", url: "/dev/icons", icon: Grid3X3 },
];

function NavItem({ item, isActive, index }: { item: typeof mainNavItems[0]; isActive: boolean; index: number }) {
  return (
    <SidebarMenuItem
      className="sidebar-nav-item"
      style={{ animationDelay: `${100 + index * 30}ms` }}
    >
      <SidebarMenuButton
        asChild
        isActive={isActive}
        tooltip={item.title}
      >
        <Link href={item.url} data-testid={`nav-${item.title.toLowerCase().replace(/\s+/g, "-")}`}>
          <item.icon className="size-4" />
          <span>{item.title}</span>
        </Link>
      </SidebarMenuButton>
      {isActive && (
        <motion.div
          layoutId="sidebar-active-indicator"
          className="absolute left-0 top-0 bottom-0 w-0.5 rounded-full bg-primary"
          transition={{ type: "spring", stiffness: 350, damping: 30 }}
        />
      )}
    </SidebarMenuItem>
  );
}

export function AppSidebar() {
  const [location] = useLocation();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border px-4 py-4">
        <Fade delay={0.05}>
          <div className="flex items-center gap-3">
            <TeamSyncMascot size={36} className="shrink-0" />
            {!isCollapsed && (
              <span className="text-xl font-bold font-heading tracking-tight" data-testid="text-brand-name">TeamSync</span>
            )}
          </div>
        </Fade>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item, index) => {
                const isActive = item.url === "/" ? location === "/" : location.startsWith(item.url);
                return (
                  <NavItem key={item.title} item={item} isActive={isActive} index={index} />
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Design System</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {designNavItems.map((item, index) => {
                const isActive = location.startsWith(item.url);
                return (
                  <NavItem key={item.title} item={item} isActive={isActive} index={mainNavItems.length + index} />
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

    </Sidebar>
  );
}
