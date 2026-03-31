import { useLocation, Link } from "wouter";
import {
  LayoutDashboard, Building2, FileText, Receipt,
  MessageSquare, Bell, LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { portalClient, portalMessages } from "@/lib/mock-data-portal-legalnations";

interface NavItem {
  title: string;
  url: string;
  icon: typeof LayoutDashboard;
  badge?: number;
}

const navItems: NavItem[] = [
  { title: "Dashboard", url: "/portal/legalnations", icon: LayoutDashboard },
  { title: "Companies", url: "/portal/legalnations/companies", icon: Building2 },
  { title: "Documents", url: "/portal/legalnations/documents", icon: FileText },
  { title: "Invoices", url: "/portal/legalnations/invoices", icon: Receipt },
  { title: "Messages", url: "/portal/legalnations/messages", icon: MessageSquare, badge: portalMessages.filter(m => !m.read).length },
];

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();

  const isActive = (url: string) => {
    if (url === "/portal/legalnations") return location === url;
    return location.startsWith(url);
  };

  return (
    <div className="flex h-screen w-full flex-col bg-background">
      <header className="h-14 border-b bg-white dark:bg-slate-900 shrink-0 z-30">
        <div className="h-full px-4 sm:px-8 lg:px-24 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/portal/legalnations" className="flex items-center gap-2.5" data-testid="link-portal-home">
              <span className="text-xl font-black tracking-tight text-blue-600 dark:text-blue-400 select-none" style={{ letterSpacing: "-0.03em" }}>LN</span>
              <div className="h-5 w-px bg-border" />
              <span className="text-sm font-semibold text-muted-foreground hidden sm:inline">Client Portal</span>
            </Link>

            <nav className="hidden md:flex items-center gap-1" data-testid="portal-nav">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.url);
                return (
                  <Link
                    key={item.url}
                    href={item.url}
                    className={cn(
                      "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                      active
                        ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                    data-testid={`nav-portal-${item.title.toLowerCase()}`}
                  >
                    <Icon className="size-4" />
                    <span>{item.title}</span>
                    {item.badge && item.badge > 0 && (
                      <Badge variant="destructive" className="h-4 min-w-[16px] text-[9px] px-1 rounded-full">
                        {item.badge}
                      </Badge>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-[10px] border-amber-300 text-amber-700 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400 hidden sm:flex">
              Preview Mode
            </Badge>

            <Button variant="ghost" size="icon" className="h-8 w-8 relative" data-testid="button-portal-notifications">
              <Bell className="size-4" />
              <span className="absolute top-1 right-1 size-2 rounded-full bg-red-500" />
            </Button>

            <div className="h-5 w-px bg-border hidden sm:block" />

            <div className="hidden sm:flex items-center gap-2">
              <div className="size-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-xs font-bold text-blue-700 dark:text-blue-400">
                {portalClient.avatar}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold truncate leading-none">{portalClient.name}</p>
                <p className="text-[10px] text-muted-foreground truncate leading-none mt-0.5">{portalClient.email}</p>
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground"
              onClick={() => setLocation("/legalnations")}
              data-testid="button-back-internal"
              title="Back to Internal Portal"
            >
              <LogOut className="size-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="md:hidden border-b bg-white dark:bg-slate-900 overflow-x-auto">
        <nav className="flex items-center gap-1 px-4 py-2" data-testid="portal-nav-mobile">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.url);
            return (
              <Link
                key={item.url}
                href={item.url}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors",
                  active
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                    : "text-muted-foreground hover:bg-muted"
                )}
                data-testid={`nav-portal-mobile-${item.title.toLowerCase()}`}
              >
                <Icon className="size-3.5" />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
