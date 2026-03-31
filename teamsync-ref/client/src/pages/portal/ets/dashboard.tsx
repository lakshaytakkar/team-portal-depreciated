import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import {
  AlertCircle, ChevronRight, MapPin, Phone, Store,
  ShoppingCart, CreditCard, TrendingUp, Zap,
  Package, ClipboardList, AlertTriangle, Receipt,
  Users, CheckCircle2, Circle, ArrowRight, Sparkles,
  BarChart2, Boxes, Banknote, ShoppingBag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductImage } from "@/components/product-image";
import {
  portalEtsClient,
  ETS_PORTAL_COLOR,
  ETS_STAGE_DISPLAY_LABELS,
} from "@/lib/mock-data-portal-ets";
import {
  EXPANDED_SALES, RETURN_RECORDS, POS_PRODUCTS, INVENTORY,
  getProductImage, REGISTER_SESSIONS, STORE_SETTINGS,
} from "@/lib/mock-data-pos-ets";
import {
  DASHBOARD_SETUP, DASHBOARD_ACTIVE, PARTNER_PROFILE,
  getStoreStatusMode, setStoreStatusMode, type StoreStatusMode,
} from "@/lib/mock-data-dashboard-ets";

import iconPosBilling from "@assets/generated_images/icon-pos-billing.png";
import iconInventory from "@assets/generated_images/icon-inventory.png";
import iconDailyReport from "@assets/generated_images/icon-daily-report.png";
import iconReturns from "@assets/generated_images/icon-returns.png";
import iconCashRegister from "@assets/generated_images/icon-cash-register.png";
import iconStoreSettings from "@assets/generated_images/icon-store-settings.png";
import iconRevenue from "@assets/generated_images/icon-revenue.png";
import iconAvgBasket from "@assets/generated_images/icon-avg-basket.png";
import iconDigitalPayment from "@assets/generated_images/icon-digital-payment.png";
import iconCashPayment from "@assets/generated_images/icon-cash-payment.png";

function formatINR(n: number): string {
  if (n >= 100000) return "₹" + (n / 100000).toFixed(1) + "L";
  if (n >= 1000) return "₹" + (n / 1000).toFixed(1) + "K";
  return "₹" + n.toLocaleString("en-IN");
}

function formatINRFull(n: number): string {
  return "₹" + n.toLocaleString("en-IN");
}

function DashboardSkeleton() {
  return (
    <div className="px-16 lg:px-24 py-6 space-y-6">
      <Skeleton className="h-36 rounded-2xl" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        <Skeleton className="h-60 rounded-xl md:col-span-2" />
        <Skeleton className="h-60 rounded-xl" />
      </div>
    </div>
  );
}

function SetupDashboard({ storeName, city, storeStatus }: { storeName: string; city: string; storeStatus: string }) {
  const data = DASHBOARD_SETUP;
  const rm = PARTNER_PROFILE;

  const doneItems = data.setupItems.filter(i => i.done);
  const pendingItems = data.setupItems.filter(i => !i.done);

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500 via-orange-600 to-amber-600 p-5 md:p-8 text-white shadow-lg">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/3 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-orange-100">Welcome back</span>
                <Badge className="bg-white/20 text-white border-0 text-xs font-semibold">Setting Up</Badge>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold font-heading" data-testid="text-dashboard-title">
                {storeName}
              </h1>
              <div className="flex items-center gap-3 mt-2 text-sm text-orange-100">
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {city}</span>
              </div>
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <span className="font-semibold text-white">Your store is {data.storeReadiness}% ready</span>
                  <span className="text-orange-200">{data.tasksRemaining} tasks remaining</span>
                </div>
                <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white rounded-full transition-all"
                    style={{ width: `${data.storeReadiness}%` }}
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <Link href="/portal-ets/onboarding">
                <Button className="bg-white text-orange-600 hover:bg-orange-50 font-bold shadow-md gap-2" data-testid="button-continue-setup">
                  <ArrowRight className="h-4 w-4" /> Continue Setup
                </Button>
              </Link>
              <a href={`https://wa.me/${rm.rmWhatsApp}`} target="_blank" rel="noopener noreferrer">
                <Button className="bg-white/15 backdrop-blur-sm text-white border border-white/30 hover:bg-white/25 gap-2" data-testid="button-contact-manager">
                  <Phone className="h-4 w-4" /> Manager
                </Button>
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-0 shadow-sm bg-gradient-to-br from-orange-50 to-amber-50">
          <CardContent className="p-4">
            <p className="text-xs font-semibold text-orange-700 uppercase tracking-wider mb-1">Onboarding</p>
            <p className="text-2xl font-bold text-orange-800" data-testid="text-onboarding-percent">{data.onboardingPercent}%</p>
            <div className="mt-2 h-1.5 bg-orange-100 rounded-full overflow-hidden">
              <div className="h-full bg-orange-500 rounded-full" style={{ width: `${data.onboardingPercent}%` }} />
            </div>
            <Link href="/portal-ets/onboarding">
              <p className="text-xs text-orange-600 mt-1.5 font-medium hover:underline cursor-pointer">Continue →</p>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardContent className="p-4">
            <p className="text-xs font-semibold text-blue-700 uppercase tracking-wider mb-1">BOQ Items</p>
            <p className="text-2xl font-bold text-blue-800" data-testid="text-boq-selected">{data.boqSelected}/{data.boqTotal}</p>
            <p className="text-xs text-blue-600 mt-0.5">Est. cost: {formatINR(data.boqEstimatedCost)}</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-emerald-50">
          <CardContent className="p-4">
            <p className="text-xs font-semibold text-green-700 uppercase tracking-wider mb-1">Orders</p>
            <p className="text-2xl font-bold text-green-800" data-testid="text-orders-count">{data.ordersPlaced} Placed</p>
            <p className="text-xs text-green-600 mt-0.5">{data.ordersDelivered} delivered · {data.ordersInTransit} in transit</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-violet-50">
          <CardContent className="p-4">
            <p className="text-xs font-semibold text-purple-700 uppercase tracking-wider mb-1">Payments</p>
            <p className="text-2xl font-bold text-purple-800" data-testid="text-milestone-paid">{formatINR(data.milestonePaid)}</p>
            <p className="text-xs text-purple-600 mt-0.5">{formatINR(data.milestonePending)} pending</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card className="md:col-span-2 border-0 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-orange-500" /> Store Setup Checklist
              </CardTitle>
              <Badge variant="outline" className="text-xs">{doneItems.length}/{data.setupItems.length} done</Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="mb-4">
              <Progress value={(doneItems.length / data.setupItems.length) * 100} className="h-2" />
            </div>
            <div className="space-y-2">
              {data.setupItems.slice(0, 8).map(item => (
                <Link key={item.id} href={item.href}>
                  <div
                    className={`flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-muted/30 cursor-pointer transition-colors ${item.done ? "opacity-60" : ""}`}
                    data-testid={`checklist-item-${item.id}`}
                  >
                    {item.done
                      ? <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                      : <Circle className="w-4 h-4 text-orange-400 shrink-0" />
                    }
                    <span className={`text-sm ${item.done ? "line-through text-muted-foreground" : "font-medium"}`}>
                      {item.label}
                    </span>
                    {!item.done && <ChevronRight className="w-3.5 h-3.5 text-muted-foreground ml-auto shrink-0" />}
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Readiness Checklist</p>
              <div className="flex items-center gap-3 mb-2">
                <Progress value={(data.checklistDone / data.checklistTotal) * 100} className="flex-1 h-2" />
                <span className="text-sm font-bold text-muted-foreground" data-testid="text-readiness-progress">{data.checklistDone}/{data.checklistTotal}</span>
              </div>
              <Link href="/portal-ets/checklist">
                <Button variant="outline" size="sm" className="w-full mt-2 text-xs gap-1" data-testid="button-view-checklist">
                  View Checklist <ChevronRight className="w-3 h-3" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm border-green-100 bg-green-50/40">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Your Manager</p>
                  <p className="text-xs text-muted-foreground">{rm.rmName}</p>
                </div>
              </div>
              <a
                href={`https://wa.me/${rm.rmWhatsApp}?text=${encodeURIComponent(`Hi, I need help with my store ${PARTNER_PROFILE.storeName}`)}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button size="sm" className="w-full bg-green-600 hover:bg-green-700 text-white gap-2 text-xs" data-testid="button-whatsapp-rm">
                  WhatsApp Manager
                </Button>
              </a>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function ActiveDashboard({ storeName, city }: { storeName: string; city: string }) {
  const data = DASHBOARD_ACTIVE;
  const rm = PARTNER_PROFILE;

  const todayStats = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const todayEnd = todayStart + 86400000;
    const todaySales = EXPANDED_SALES.filter(s => {
      const t = new Date(s.timestamp).getTime();
      return t >= todayStart && t < todayEnd;
    });
    const totalRevenue = todaySales.reduce((s, x) => s + x.totalAmount, 0) || data.todaySalesTotal;
    const txCount = todaySales.length || data.todayTransactionCount;
    const cashTotal = todaySales.filter(s => s.paymentMethod === "cash").reduce((s, x) => s + x.totalAmount, 0);
    const upiTotal = todaySales.filter(s => s.paymentMethod === "upi").reduce((s, x) => s + x.totalAmount, 0);
    const cardTotal = todaySales.filter(s => s.paymentMethod === "card").reduce((s, x) => s + x.totalAmount, 0);
    const avgBasket = txCount > 0 ? Math.round(totalRevenue / txCount) : 0;
    return { totalRevenue, txCount, cashTotal, upiTotal, cardTotal, avgBasket };
  }, [data]);

  const stockSummary = useMemo(() => {
    let healthy = 0, low = 0, out = 0;
    INVENTORY.forEach(inv => {
      if (inv.currentStock === 0) out++;
      else if (inv.currentStock <= inv.reorderThreshold) low++;
      else healthy++;
    });
    return { healthy: healthy || data.stockHealthy, low: low || data.stockLow, out: out || data.stockOut };
  }, [data]);

  const openRegister = REGISTER_SESSIONS.find(r => r.status === "open");

  const topProducts = useMemo(() => {
    const map: Record<string, { productId: string; name: string; image: string | null; qty: number; revenue: number }> = {};
    EXPANDED_SALES.forEach(sale => sale.items.forEach(item => {
      if (!map[item.productId]) {
        map[item.productId] = { productId: item.productId, name: item.name, image: getProductImage(item.productId), qty: 0, revenue: 0 };
      }
      map[item.productId].qty += item.quantity;
      map[item.productId].revenue += item.lineTotal;
    }));
    return Object.values(map).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  }, []);

  const recentSales = useMemo(() => EXPANDED_SALES.slice(0, 5), []);

  const stockAlerts = useMemo(() => {
    return INVENTORY
      .filter(inv => inv.currentStock <= inv.reorderThreshold)
      .map(inv => {
        const prod = POS_PRODUCTS.find(p => p.id === inv.productId)!;
        return { ...inv, ...prod };
      })
      .slice(0, 4);
  }, []);

  const quickActions = [
    { label: "POS Billing", href: "/portal-ets/pos", img: iconPosBilling, desc: "Start billing" },
    { label: "Inventory", href: "/portal-ets/inventory", img: iconInventory, desc: "Stock control" },
    { label: "Daily Report", href: "/portal-ets/daily-report", img: iconDailyReport, desc: "View analytics" },
    { label: "Returns", href: "/portal-ets/returns", img: iconReturns, desc: "Process refunds" },
    { label: "Cash Register", href: "/portal-ets/cash-register", img: iconCashRegister, desc: "Cash management" },
    { label: "Store Settings", href: "/portal-ets/store-settings", img: iconStoreSettings, desc: "Configure store" },
  ];

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500 via-orange-600 to-amber-600 p-5 md:p-8 text-white shadow-lg">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/3 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-orange-100">Welcome back</span>
                <Badge className="bg-green-500/80 text-white border-0 text-xs font-semibold">Live</Badge>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold font-heading" data-testid="text-dashboard-title">
                {storeName}
              </h1>
              <div className="flex items-center gap-3 mt-2 text-sm text-orange-100">
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {city}</span>
                <span className="w-px h-4 bg-white/30" />
                <span>{new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short" })}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Link href="/portal-ets/pos">
                <Button className="bg-white text-orange-600 hover:bg-orange-50 font-bold shadow-md gap-2" data-testid="button-open-pos">
                  <Zap className="h-4 w-4" /> Open POS
                </Button>
              </Link>
              <a
                href={`https://wa.me/${rm.rmWhatsApp}?text=${encodeURIComponent(`Hi, I need help with my store ${PARTNER_PROFILE.storeName}`)}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button className="bg-white/15 backdrop-blur-sm text-white border border-white/30 hover:bg-white/25 gap-2" data-testid="button-contact-manager">
                  <Phone className="h-4 w-4" /> Manager
                </Button>
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-emerald-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2.5 mb-2">
              <img src={iconRevenue} alt="Revenue" className="w-9 h-9 object-contain" />
              <span className="text-xs font-semibold text-green-700 uppercase tracking-wider">Revenue</span>
            </div>
            <p className="text-xl md:text-2xl font-bold text-green-800" data-testid="text-today-revenue">{formatINRFull(todayStats.totalRevenue)}</p>
            <p className="text-xs text-green-600 mt-0.5">{todayStats.txCount} transactions today</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2.5 mb-2">
              <img src={iconAvgBasket} alt="Avg Basket" className="w-9 h-9 object-contain" />
              <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider">Avg Basket</span>
            </div>
            <p className="text-xl md:text-2xl font-bold text-blue-800" data-testid="text-avg-basket">{formatINRFull(todayStats.avgBasket)}</p>
            <p className="text-xs text-blue-600 mt-0.5">per transaction</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-violet-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2.5 mb-2">
              <img src={iconDigitalPayment} alt="Digital" className="w-9 h-9 object-contain" />
              <span className="text-xs font-semibold text-purple-700 uppercase tracking-wider">Digital</span>
            </div>
            <p className="text-xl md:text-2xl font-bold text-purple-800" data-testid="text-digital-total">{formatINRFull(todayStats.upiTotal + todayStats.cardTotal)}</p>
            <p className="text-xs text-purple-600 mt-0.5">UPI + Card payments</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-amber-50 to-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2.5 mb-2">
              <img src={iconCashPayment} alt="Cash" className="w-9 h-9 object-contain" />
              <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">Cash</span>
            </div>
            <p className="text-xl md:text-2xl font-bold text-amber-800" data-testid="text-cash-total">{formatINRFull(todayStats.cashTotal)}</p>
            <p className="text-xs text-amber-600 mt-0.5">in cash drawer</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
              <Boxes className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Stock Health</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs font-medium text-green-700" data-testid="text-stock-healthy">{stockSummary.healthy} healthy</span>
                {stockSummary.low > 0 && <span className="text-xs font-medium text-amber-600" data-testid="text-stock-low">· {stockSummary.low} low</span>}
                {stockSummary.out > 0 && <span className="text-xs font-medium text-red-600" data-testid="text-stock-out">· {stockSummary.out} out</span>}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`border-0 shadow-sm ${openRegister ? "bg-green-50/50" : "bg-muted/20"}`}>
          <CardContent className="p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${openRegister ? "bg-green-100" : "bg-muted"}`}>
              <Banknote className={`w-5 h-5 ${openRegister ? "text-green-600" : "text-muted-foreground"}`} />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Cash Register</p>
              <p className="text-sm font-bold mt-0.5" data-testid="text-register-status">
                {openRegister ? `Open · ${formatINRFull(data.cashRegisterRunningTotal)}` : "Closed"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center shrink-0">
              <ShoppingBag className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pending Orders</p>
              <p className="text-sm font-bold mt-0.5" data-testid="text-pending-orders">
                {data.recentPendingOrders.length > 0 ? `${data.recentPendingOrders.length} orders` : "All clear"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
        {quickActions.map(action => (
          <Link key={action.label} href={action.href}>
            <Card className="rounded-xl border bg-card shadow-sm hover:bg-muted/20 transition-colors cursor-pointer h-full" data-testid={`card-action-${action.label.toLowerCase().replace(/\s+/g, "-")}`}>
              <CardContent className="p-3 flex flex-col items-center text-center gap-1.5">
                <img src={action.img} alt={action.label} className="w-12 h-12 object-contain" />
                <div>
                  <p className="text-xs font-semibold leading-tight">{action.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{action.desc}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid md:grid-cols-5 gap-4">
        <Card className="md:col-span-3 border-0 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">Top Selling Products</CardTitle>
              <Link href="/portal-ets/daily-report">
                <Button variant="ghost" size="sm" className="text-xs text-orange-600 hover:text-orange-700 gap-1 h-7" data-testid="link-view-report">
                  View Report <ChevronRight className="w-3 h-3" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2.5">
              {topProducts.map((product, idx) => (
                <div key={product.productId} className="flex items-center gap-3 py-1.5" data-testid={`top-product-${idx}`}>
                  <span className="text-xs font-bold text-muted-foreground w-4 text-right">{idx + 1}</span>
                  <ProductImage src={product.image} alt={product.name} size="md" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{product.qty} sold</p>
                  </div>
                  <span className="text-sm font-bold">{formatINRFull(product.revenue)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 border-0 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">Recent Sales</CardTitle>
              <Badge variant="outline" className="text-xs font-medium">{todayStats.txCount} today</Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {recentSales.map(sale => (
                <div key={sale.id} className="flex items-center gap-3 py-1.5 border-b last:border-0" data-testid={`recent-sale-${sale.id}`}>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center shrink-0">
                    <Receipt className="w-3.5 h-3.5 text-gray-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium">{sale.receiptNumber}</p>
                    <p className="text-xs text-muted-foreground">{sale.items.length} items · {sale.paymentMethod}</p>
                  </div>
                  <span className="text-xs font-bold">{formatINRFull(sale.totalAmount)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {stockAlerts.length > 0 && (
        <Card className="shadow-sm border border-amber-200 bg-amber-50/30">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" /> Stock Alerts
              </CardTitle>
              <Link href="/portal-ets/low-stock-alerts">
                <Button variant="ghost" size="sm" className="text-xs text-amber-600 hover:text-amber-700 gap-1 h-7" data-testid="link-view-alerts">
                  View All <ChevronRight className="w-3 h-3" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {stockAlerts.map(item => (
                <div key={item.productId} className={`rounded-lg p-2.5 ${item.currentStock === 0 ? "bg-red-50" : "bg-amber-50"}`} data-testid={`stock-alert-${item.productId}`}>
                  <div className="flex items-center gap-2">
                    <ProductImage src={item.image} alt={item.name} size="sm" />
                    <div className="min-w-0">
                      <p className="text-xs font-medium truncate">{item.name}</p>
                      <p className={`text-xs font-bold ${item.currentStock === 0 ? "text-red-600" : "text-amber-600"}`}>
                        {item.currentStock === 0 ? "Out of Stock" : `${item.currentStock} left`}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function EtsPortalDashboard() {
  const [storeMode, setStoreMode] = useState<StoreStatusMode>(getStoreStatusMode);

  const storeName = PARTNER_PROFILE.storeName;
  const city = PARTNER_PROFILE.city;

  const toggleMode = () => {
    const next: StoreStatusMode = storeMode === "active" ? "setup" : "active";
    setStoreStatusMode(next);
    setStoreMode(next);
  };

  return (
    <div className="px-16 lg:px-24 py-6 space-y-6" data-testid="ets-portal-dashboard">
      <div className="flex items-center justify-end">
        <button
          onClick={toggleMode}
          className="text-xs px-3 py-1.5 rounded-lg border border-dashed border-muted-foreground/30 text-muted-foreground hover:bg-muted/30 transition-colors flex items-center gap-1.5"
          data-testid="button-toggle-store-mode"
          title="Developer toggle — switch between setup and active store modes"
        >
          <span className={`w-1.5 h-1.5 rounded-full ${storeMode === "active" ? "bg-green-500" : "bg-orange-400"}`} />
          Dev: {storeMode === "active" ? "Active Mode" : "Setup Mode"}
        </button>
      </div>

      {storeMode === "setup"
        ? <SetupDashboard storeName={storeName} city={city} storeStatus={storeMode} />
        : <ActiveDashboard storeName={storeName} city={city} />
      }
    </div>
  );
}
