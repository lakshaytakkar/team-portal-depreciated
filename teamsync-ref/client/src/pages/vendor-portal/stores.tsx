import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import {
  Store, Wifi, WifiOff, RefreshCw, ExternalLink, ShoppingCart,
  Package, Clock, Search,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Fade } from "@/components/ui/animated";
import {
  PageShell, PageHeader, StatGrid, StatCard,
  DataTableContainer, DataTH, DataTD, DataTR,
} from "@/components/layout";
import { VENDOR_COLOR } from "@/lib/vendor-config";
import { SopModal, TutorialModal, SopTutorialButtons } from "@/components/sop/sop-modal";
import { SOP_REGISTRY } from "@/lib/sop-data";
import {
  vendorStores, vendorClients,
  type VendorStore, type VendorStoreStatus,
} from "@/lib/mock-data-vendor";

const STATUS_CONFIG: Record<VendorStoreStatus, { label: string; color: string; bg: string; icon: typeof Wifi }> = {
  Connected:    { label: "Connected",    color: "#059669", bg: "#d1fae5", icon: Wifi },
  Syncing:      { label: "Syncing",      color: "#d97706", bg: "#fef3c7", icon: RefreshCw },
  Disconnected: { label: "Disconnected", color: "#dc2626", bg: "#fee2e2", icon: WifiOff },
};

function getClientName(clientId: string): string {
  return vendorClients.find(c => c.id === clientId)?.businessName ?? "Unknown";
}

function formatSyncTime(ts: string): string {
  const diff = Math.round((Date.now() - new Date(ts).getTime()) / 60000);
  if (diff < 2) return "Just now";
  if (diff < 60) return `${diff}m ago`;
  if (diff < 1440) return `${Math.round(diff / 60)}h ago`;
  return `${Math.round(diff / 1440)}d ago`;
}

export default function VendorStores() {
  const [, setLocation] = useLocation();
  const [sopOpen, setSopOpen] = useState(false);
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    return vendorStores.filter((s) => {
      if (statusFilter !== "all" && s.status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        const clientName = getClientName(s.clientId).toLowerCase();
        return (
          s.storeName.toLowerCase().includes(q) ||
          s.domain.toLowerCase().includes(q) ||
          clientName.includes(q)
        );
      }
      return true;
    });
  }, [search, statusFilter]);

  const connectedCount = vendorStores.filter(s => s.status === "Connected").length;
  const syncingCount = vendorStores.filter(s => s.status === "Syncing").length;
  const disconnectedCount = vendorStores.filter(s => s.status === "Disconnected").length;
  const totalProducts = vendorStores.reduce((sum, s) => sum + s.productCount, 0);
  const totalOrders = vendorStores.reduce((sum, s) => sum + s.orderCount, 0);

  return (
    <PageShell>
      <Fade>
        <PageHeader
          title="Stores"
          subtitle={`${vendorStores.length} Shopify stores connected`}
          actions={<SopTutorialButtons onSopClick={() => setSopOpen(true)} onTutorialClick={() => setTutorialOpen(true)} />}
        />
      </Fade>

      <Fade>
        <StatGrid cols={4}>
          <StatCard
            label="Total Stores"
            value={vendorStores.length}
            icon={Store}
            iconBg={VENDOR_COLOR + "18"}
            iconColor={VENDOR_COLOR}
          />
          <StatCard
            label="Connected"
            value={connectedCount}
            icon={Wifi}
            iconBg="#05966918"
            iconColor="#059669"
          />
          <StatCard
            label="Total Products"
            value={totalProducts.toLocaleString()}
            icon={Package}
            iconBg="#7c3aed18"
            iconColor="#7c3aed"
          />
          <StatCard
            label="Total Orders"
            value={totalOrders.toLocaleString()}
            icon={ShoppingCart}
            iconBg="#0284c718"
            iconColor="#0284c7"
          />
        </StatGrid>
      </Fade>

      <Fade>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search stores, domains, clients..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
              data-testid="input-search-stores"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px]" data-testid="select-status-filter">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Connected">Connected</SelectItem>
              <SelectItem value="Syncing">Syncing</SelectItem>
              <SelectItem value="Disconnected">Disconnected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Fade>

      <Fade>
        <DataTableContainer>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <DataTH>Store Name</DataTH>
                <DataTH>Client</DataTH>
                <DataTH>Domain</DataTH>
                <DataTH>Products</DataTH>
                <DataTH>Orders</DataTH>
                <DataTH>Status</DataTH>
                <DataTH>Last Sync</DataTH>
                <DataTH align="right">Actions</DataTH>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((store) => {
                const cfg = STATUS_CONFIG[store.status];
                const StatusIcon = cfg.icon;
                const clientName = getClientName(store.clientId);
                return (
                  <DataTR
                    key={store.id}
                    onClick={() => setLocation(`/vendor/orders?store=${store.id}`)}
                    data-testid={`store-row-${store.id}`}
                  >
                    <DataTD>
                      <div className="flex items-center gap-3">
                        <div
                          className="size-9 rounded-md flex items-center justify-center text-white text-sm font-bold shrink-0"
                          style={{ background: VENDOR_COLOR }}
                        >
                          {store.storeName.charAt(0)}
                        </div>
                        <span className="font-medium" data-testid={`text-store-name-${store.id}`}>
                          {store.storeName}
                        </span>
                      </div>
                    </DataTD>
                    <DataTD>
                      <span
                        className="text-muted-foreground cursor-pointer hover:underline"
                        onClick={(e) => {
                          e.stopPropagation();
                          setLocation(`/vendor/clients`);
                        }}
                        data-testid={`text-client-${store.id}`}
                      >
                        {clientName}
                      </span>
                    </DataTD>
                    <DataTD>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-muted-foreground font-mono" data-testid={`text-domain-${store.id}`}>
                          {store.domain}
                        </span>
                        <ExternalLink size={12} className="text-muted-foreground/50" />
                      </div>
                    </DataTD>
                    <DataTD>
                      <span className="font-medium" data-testid={`text-products-${store.id}`}>
                        {store.productCount}
                      </span>
                    </DataTD>
                    <DataTD>
                      <span className="font-medium" data-testid={`text-orders-${store.id}`}>
                        {store.orderCount}
                      </span>
                    </DataTD>
                    <DataTD>
                      <Badge
                        variant="outline"
                        className="gap-1"
                        style={{
                          color: cfg.color,
                          backgroundColor: cfg.bg,
                          borderColor: cfg.color + "33",
                        }}
                        data-testid={`badge-status-${store.id}`}
                      >
                        <StatusIcon size={12} className={store.status === "Syncing" ? "animate-spin" : ""} />
                        {cfg.label}
                      </Badge>
                    </DataTD>
                    <DataTD>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock size={12} />
                        <span data-testid={`text-sync-${store.id}`}>
                          {formatSyncTime(store.lastSync)}
                        </span>
                      </div>
                    </DataTD>
                    <DataTD align="right" onClick={(e) => e.stopPropagation()}>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setLocation(`/vendor/orders?store=${store.id}`)}
                        data-testid={`btn-view-orders-${store.id}`}
                      >
                        <ShoppingCart size={14} />
                      </Button>
                    </DataTD>
                  </DataTR>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-sm text-muted-foreground">
                    {vendorStores.length === 0
                      ? "No stores configured yet."
                      : "No stores match your search."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </DataTableContainer>
      </Fade>

      {disconnectedCount > 0 && (
        <Fade>
          <div className="rounded-md border border-destructive/20 bg-destructive/5 p-4">
            <p className="text-sm text-destructive font-medium" data-testid="text-disconnected-warning">
              {disconnectedCount} store{disconnectedCount > 1 ? "s" : ""} disconnected. Reconnect to resume order syncing.
            </p>
          </div>
        </Fade>
      )}
      <SopModal open={sopOpen} onOpenChange={setSopOpen} config={SOP_REGISTRY["vendor-stores"].sop} color={VENDOR_COLOR} />
      <TutorialModal open={tutorialOpen} onOpenChange={setTutorialOpen} config={SOP_REGISTRY["vendor-stores"].tutorial} color={VENDOR_COLOR} />
    </PageShell>
  );
}
