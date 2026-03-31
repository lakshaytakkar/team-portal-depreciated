import { createContext, useContext } from "react";
import { useLocation, Link } from "wouter";
import { useVertical } from "@/lib/vertical-store";
import { useEtsRole } from "@/lib/use-ets-role";
import { cn } from "@/lib/utils";
import { getStoreStatus } from "@/lib/mock-data-ets-store";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Package, ArrowDownToLine, ClipboardList, AlertTriangle,
  Wallet, RotateCcw, BarChart3, Settings,
  ShoppingBag, Store, CheckSquare,
  CreditCard, FileText, Users,
  Receipt, Lock, Phone, UserRound,
  Hammer, ListChecks, LayoutDashboard, Palette,
  ShoppingCart, ListOrdered, Milestone,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const EtsSidebarContext = createContext(false);
export function useEtsSidebar() {
  return useContext(EtsSidebarContext);
}

const SUB_ITEM_ICONS: Record<string, LucideIcon> = {
  "/portal-ets/inventory": Package,
  "/portal-ets/stock-receive": ArrowDownToLine,
  "/portal-ets/stock-adjustment": ClipboardList,
  "/portal-ets/low-stock-alerts": AlertTriangle,
  "/portal-ets/cash-register": Wallet,
  "/portal-ets/returns": RotateCcw,
  "/portal-ets/daily-report": BarChart3,
  "/portal-ets/store-settings": Settings,
  "/portal-ets/launch-kit": ShoppingBag,
  "/portal-ets/store": Store,
  "/portal-ets/setup-kit": Hammer,
  "/portal-ets/boq-builder": ListChecks,
  "/portal-ets/layout-guide": LayoutDashboard,
  "/portal-ets/brand-kit": Palette,
  "/portal-ets/checklist": CheckSquare,
  "/portal-ets/payments": CreditCard,
  "/portal-ets/invoices": FileText,
  "/portal-ets/team-settings": Users,
  "/portal-ets/pos": Receipt,
  "/portal-ets/catalog": ShoppingBag,
  "/portal-ets/orders": Package,
  "/portal-ets/profile": UserRound,
  "/portal-ets/support": Phone,
  "/portal-ets/checkout": ShoppingCart,
  "/portal-ets/my-orders": ListOrdered,
  "/portal-ets/payment-milestones": Milestone,
};

const PHASE_SUBTITLES: Record<string, string> = {
  "Phase A — Store Setup": "Get your store ready to launch",
  "Phase B — Products & Orders": "Catalog, orders & payments",
  "Phase C — Store Operations": "Day-to-day store management",
  "My Account": "Profile, support & team",
};

function isItemActive(location: string, itemUrl: string): boolean {
  return location === itemUrl || location.startsWith(itemUrl + "/");
}

function getActiveCategory(location: string, navCategories: any[]) {
  for (const cat of navCategories) {
    if (cat.items && cat.items.length > 1) {
      for (const item of cat.items) {
        if (isItemActive(location, item.url)) return cat;
      }
    }
  }
  return null;
}

export function EtsSubNavSidebar({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { currentVertical } = useVertical();
  const { roleId, subRole } = useEtsRole();

  const isEtsPortal = currentVertical?.id === "ets-portal";
  if (!isEtsPortal) return <>{children}</>;
  if (roleId !== "partner") return <>{children}</>;
  if (subRole === "cashier") return <>{children}</>;

  const storeStatus = getStoreStatus().status;
  const isSetup = storeStatus === "setup";

  const activeCategory = getActiveCategory(location, currentVertical.navCategories);
  if (!activeCategory || !activeCategory.items || activeCategory.items.length <= 1) {
    return <>{children}</>;
  }

  const CategoryIcon = activeCategory.icon;
  const subtitle = PHASE_SUBTITLES[activeCategory.title] || "";
  const isCategoryLocked = isSetup && activeCategory.lockWhenSetup;

  return (
    <EtsSidebarContext.Provider value={true}>
      <div className="px-16 lg:px-24 py-6 space-y-4" data-testid="ets-sidebar-layout">
        <div className="flex items-center gap-3">
          {CategoryIcon && <CategoryIcon className={cn("w-6 h-6", isCategoryLocked ? "text-gray-400" : "text-orange-500")} />}
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2" data-testid="text-sidebar-category-title">
              {activeCategory.title}
              {isCategoryLocked && <Lock className="w-4 h-4 text-gray-400" />}
            </h1>
            {subtitle && <p className="text-sm text-muted-foreground" data-testid="text-sidebar-category-subtitle">{subtitle}</p>}
          </div>
        </div>

        <div className="flex flex-col md:flex-row rounded-2xl bg-gray-50/60 min-h-[calc(100vh-200px)] overflow-hidden" data-testid="ets-sidebar-card">
          <nav className="w-full md:w-[200px] shrink-0 py-4 md:py-5 px-3 flex md:flex-col gap-1 overflow-x-auto md:overflow-x-visible" data-testid="ets-subnav-sidebar">
            <p className="hidden md:block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3 px-4" data-testid="text-submenu-label">Sub menu</p>
            <TooltipProvider>
              {activeCategory.items.map((item: any) => {
                const isActive = isItemActive(location, item.url);
                const Icon = SUB_ITEM_ICONS[item.url];
                const isItemLocked = isCategoryLocked;

                if (isItemLocked) {
                  return (
                    <Tooltip key={item.url}>
                      <TooltipTrigger asChild>
                        <div
                          className="flex items-center gap-3 px-4 py-2.5 rounded-[10px] text-[14px] text-gray-300 font-semibold cursor-not-allowed whitespace-nowrap select-none"
                          data-testid={`sidebar-locked-${item.title.toLowerCase().replace(/\s+/g, "-")}`}
                        >
                          <Lock className="w-[18px] h-[18px] shrink-0 text-gray-300" />
                          <span className="truncate">{item.title}</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="text-xs">
                        Available when your store is live
                      </TooltipContent>
                    </Tooltip>
                  );
                }

                return (
                  <Link
                    key={item.url}
                    href={item.url}
                    data-testid={`sidebar-${item.title.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    <div
                      className={cn(
                        "flex items-center gap-3 px-4 py-2.5 rounded-[10px] text-[14px] transition-colors cursor-pointer whitespace-nowrap",
                        isActive
                          ? "bg-orange-100 text-orange-600 font-bold"
                          : "text-[#6c7278] font-semibold hover:bg-gray-100"
                      )}
                    >
                      {Icon && (
                        <Icon
                          className={cn(
                            "w-[18px] h-[18px] shrink-0",
                            isActive ? "text-orange-500" : "text-gray-400"
                          )}
                        />
                      )}
                      <span className="truncate">{item.title}</span>
                    </div>
                  </Link>
                );
              })}
            </TooltipProvider>
          </nav>
          <div className="flex-1 bg-white md:rounded-r-2xl rounded-b-2xl md:rounded-bl-none overflow-auto">
            {children}
          </div>
        </div>
      </div>
    </EtsSidebarContext.Provider>
  );
}
