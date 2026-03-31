import { createContext, useContext } from "react";
import { useLocation, Link } from "wouter";
import { useVertical } from "@/lib/vertical-store";
import { useLnRole } from "@/lib/use-ln-role";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Building2, FileText, Receipt,
  MessageSquare, Phone,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const LnSidebarContext = createContext(false);
export function useLnSidebar() {
  return useContext(LnSidebarContext);
}

interface SidebarEntry {
  title: string;
  url: string;
  icon: LucideIcon;
}

const CLIENT_SIDEBAR_ENTRIES: SidebarEntry[] = [
  { title: "Dashboard", url: "/portal-ln", icon: LayoutDashboard },
  { title: "My Companies", url: "/portal-ln/companies", icon: Building2 },
  { title: "Documents", url: "/portal-ln/documents", icon: FileText },
  { title: "Invoices", url: "/portal-ln/invoices", icon: Receipt },
  { title: "Messages", url: "/portal-ln/messages", icon: MessageSquare },
  { title: "Support", url: "/portal-ln/support", icon: Phone },
];

function isItemActive(location: string, itemUrl: string): boolean {
  if (itemUrl === "/portal-ln") return location === itemUrl;
  return location === itemUrl || location.startsWith(itemUrl + "/");
}

export function LnSubNavSidebar({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { currentVertical } = useVertical();
  const { roleId } = useLnRole();

  const isLnPortal = currentVertical?.id === "ln-portal";
  if (!isLnPortal) return <>{children}</>;
  if (roleId !== "client") return <>{children}</>;

  const isOnboarding = location === "/portal-ln/onboarding";
  if (isOnboarding) return <>{children}</>;

  return (
    <LnSidebarContext.Provider value={true}>
      <div className="px-16 lg:px-24 py-6" data-testid="ln-sidebar-layout">
        <div className="flex flex-col md:flex-row rounded-2xl bg-gray-50/60 min-h-[calc(100vh-200px)] overflow-hidden" data-testid="ln-sidebar-card">
          <nav className="w-full md:w-[200px] shrink-0 py-4 md:py-5 px-3 flex md:flex-col gap-1 overflow-x-auto md:overflow-x-visible" data-testid="ln-subnav-sidebar">
            <p className="hidden md:block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3 px-4" data-testid="text-ln-submenu-label">My Portal</p>
            {CLIENT_SIDEBAR_ENTRIES.map((item) => {
              const isActive = isItemActive(location, item.url);
              const Icon = item.icon;

              return (
                <Link
                  key={item.url}
                  href={item.url}
                  data-testid={`ln-sidebar-${item.title.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  <div
                    className={cn(
                      "flex items-center gap-3 px-4 py-2.5 rounded-[10px] text-[14px] transition-colors cursor-pointer whitespace-nowrap",
                      isActive
                        ? "bg-blue-100 text-blue-600 font-bold"
                        : "text-[#6c7278] font-semibold hover:bg-gray-100"
                    )}
                  >
                    <Icon
                      className={cn(
                        "w-[18px] h-[18px] shrink-0",
                        isActive ? "text-blue-500" : "text-gray-400"
                      )}
                    />
                    <span className="truncate">{item.title}</span>
                  </div>
                </Link>
              );
            })}
          </nav>
          <div className="flex-1 bg-white md:rounded-r-2xl rounded-b-2xl md:rounded-bl-none overflow-auto">
            {children}
          </div>
        </div>
      </div>
    </LnSidebarContext.Provider>
  );
}
