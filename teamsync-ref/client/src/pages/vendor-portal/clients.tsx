import { useState, useMemo } from "react";
import {
  Building2, Mail, Phone, Globe, ShoppingCart, DollarSign,
  Search, Users, Crown, Zap, Rocket, ArrowLeft, ExternalLink,
  Package, FileText,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Fade } from "@/components/ui/animated";
import {
  PageShell, PageHeader, IndexToolbar, StatGrid, StatCard,
  DataTableContainer, DataTH, DataTD, DataTR,
} from "@/components/layout";
import { VENDOR_COLOR } from "@/lib/vendor-config";
import { SopModal, TutorialModal, SopTutorialButtons } from "@/components/sop/sop-modal";
import { SOP_REGISTRY } from "@/lib/sop-data";
import {
  vendorClients, vendorStores, vendorOrders, vendorLedger,
  type VendorClient,
} from "@/lib/mock-data-vendor";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";

const PLAN_ICONS: Record<string, typeof Crown> = {
  Enterprise: Crown,
  Growth: Rocket,
  Starter: Zap,
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function ClientCard({ client, onClick }: { client: VendorClient; onClick: () => void }) {
  const PlanIcon = PLAN_ICONS[client.planTier] ?? Zap;
  const isActive = client.status === "Active";

  return (
    <Card
      className="hover-elevate cursor-pointer overflow-visible"
      onClick={onClick}
      data-testid={`card-client-${client.id}`}
    >
      <CardContent className="p-5 space-y-4">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="size-10 rounded-md flex items-center justify-center text-white font-bold shrink-0"
              style={{ background: VENDOR_COLOR }}
            >
              {client.businessName.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-sm truncate" data-testid={`text-client-name-${client.id}`}>
                {client.businessName}
              </p>
              <p className="text-xs text-muted-foreground truncate">{client.contactPerson}</p>
            </div>
          </div>
          <Badge
            variant={isActive ? "default" : "secondary"}
            className="shrink-0"
            style={isActive ? { background: "#059669" } : {}}
            data-testid={`badge-status-${client.id}`}
          >
            {client.status}
          </Badge>
        </div>

        <div className="space-y-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Mail className="size-3.5 shrink-0" />
            <span className="truncate">{client.email}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="size-3.5 shrink-0" />
            <span>{client.phone}</span>
          </div>
          <div className="flex items-center gap-2">
            <Globe className="size-3.5 shrink-0" />
            <span className="truncate">{client.shopifyDomain}</span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 pt-2 border-t flex-wrap">
          <div className="flex items-center gap-1.5 text-xs">
            <PlanIcon className="size-3.5" style={{ color: VENDOR_COLOR }} />
            <span className="font-medium">{client.planTier}</span>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1">
              <ShoppingCart className="size-3.5 text-muted-foreground" />
              <span className="font-semibold" data-testid={`text-orders-${client.id}`}>{client.totalOrders}</span>
            </span>
            <span className="flex items-center gap-1">
              <DollarSign className="size-3.5 text-muted-foreground" />
              <span className="font-semibold" data-testid={`text-spent-${client.id}`}>{formatCurrency(client.totalSpent)}</span>
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ClientDetail({ client, onBack }: { client: VendorClient; onBack: () => void }) {
  const clientStores = vendorStores.filter(s => s.clientId === client.id);
  const clientOrders = vendorOrders.filter(o =>
    clientStores.some(s => s.id === o.storeId)
  );
  const clientLedger = vendorLedger.filter(l => l.clientId === client.id);

  const totalCredits = clientLedger.filter(l => l.type === "Credit").reduce((s, l) => s + l.amount, 0);
  const totalDebits = clientLedger.filter(l => l.type === "Debit").reduce((s, l) => s + l.amount, 0);
  const isActive = client.status === "Active";
  const PlanIcon = PLAN_ICONS[client.planTier] ?? Zap;

  return (
    <div className="space-y-6">
      <Fade>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="ghost" size="icon" onClick={onBack} data-testid="button-back">
            <ArrowLeft className="size-4" />
          </Button>
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="size-10 rounded-md flex items-center justify-center text-white font-bold shrink-0"
              style={{ background: VENDOR_COLOR }}
            >
              {client.businessName.charAt(0)}
            </div>
            <div className="min-w-0">
              <h2 className="font-semibold text-lg" data-testid="text-detail-client-name">{client.businessName}</h2>
              <p className="text-sm text-muted-foreground">{client.contactPerson}</p>
            </div>
          </div>
          <Badge
            variant={isActive ? "default" : "secondary"}
            className="shrink-0"
            style={isActive ? { background: "#059669" } : {}}
          >
            {client.status}
          </Badge>
        </div>
      </Fade>

      <Fade>
        <StatGrid cols={4}>
          <StatCard label="Total Orders" value={client.totalOrders} icon={ShoppingCart} iconBg="#e0f2fe" iconColor={VENDOR_COLOR} />
          <StatCard label="Total Spent" value={formatCurrency(client.totalSpent)} icon={DollarSign} iconBg="#d1fae5" iconColor="#059669" />
          <StatCard label="Stores" value={clientStores.length} icon={Building2} iconBg="#ede9fe" iconColor="#7c3aed" />
          <StatCard label="Ledger Balance" value={formatCurrency(totalCredits - totalDebits)} icon={FileText} iconBg="#fef3c7" iconColor="#d97706" />
        </StatGrid>
      </Fade>

      <Fade>
        <Card>
          <CardContent className="p-5 space-y-3">
            <h3 className="font-semibold text-sm">Client Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <Mail className="size-4 text-muted-foreground shrink-0" />
                <span>{client.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="size-4 text-muted-foreground shrink-0" />
                <span>{client.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="size-4 text-muted-foreground shrink-0" />
                <a href={`https://${client.shopifyDomain}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:underline" data-testid="link-shopify-domain">
                  {client.shopifyDomain}
                  <ExternalLink className="size-3" />
                </a>
              </div>
              <div className="flex items-center gap-2">
                <PlanIcon className="size-4 shrink-0" style={{ color: VENDOR_COLOR }} />
                <span>{client.planTier} Plan</span>
              </div>
              <div className="text-muted-foreground text-xs">
                Joined {formatDate(client.joinedDate)}
              </div>
            </div>
          </CardContent>
        </Card>
      </Fade>

      {clientStores.length > 0 && (
        <Fade>
          <Card>
            <CardContent className="p-5 space-y-3">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <Building2 className="size-4" style={{ color: VENDOR_COLOR }} />
                Stores ({clientStores.length})
              </h3>
              <DataTableContainer>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/30">
                      <DataTH>Store Name</DataTH>
                      <DataTH>Domain</DataTH>
                      <DataTH>Products</DataTH>
                      <DataTH>Orders</DataTH>
                      <DataTH>Status</DataTH>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {clientStores.map(store => (
                      <DataTR key={store.id} data-testid={`store-row-${store.id}`}>
                        <DataTD>
                          <span className="font-medium">{store.storeName}</span>
                        </DataTD>
                        <DataTD>
                          <span className="text-muted-foreground text-xs">{store.domain}</span>
                        </DataTD>
                        <DataTD>{store.productCount}</DataTD>
                        <DataTD>{store.orderCount}</DataTD>
                        <DataTD>
                          <Badge
                            variant="secondary"
                            className="text-xs"
                            style={
                              store.status === "Connected"
                                ? { background: "#d1fae5", color: "#059669" }
                                : store.status === "Syncing"
                                ? { background: "#fef3c7", color: "#d97706" }
                                : { background: "#fee2e2", color: "#dc2626" }
                            }
                          >
                            {store.status}
                          </Badge>
                        </DataTD>
                      </DataTR>
                    ))}
                  </tbody>
                </table>
              </DataTableContainer>
            </CardContent>
          </Card>
        </Fade>
      )}

      {clientOrders.length > 0 && (
        <Fade>
          <Card>
            <CardContent className="p-5 space-y-3">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <Package className="size-4" style={{ color: VENDOR_COLOR }} />
                Recent Orders ({clientOrders.length})
              </h3>
              <DataTableContainer>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/30">
                      <DataTH>Order #</DataTH>
                      <DataTH>Customer</DataTH>
                      <DataTH>Items</DataTH>
                      <DataTH>Total</DataTH>
                      <DataTH>Status</DataTH>
                      <DataTH>Date</DataTH>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {clientOrders.slice(0, 10).map(order => {
                      const statusColors: Record<string, { bg: string; color: string }> = {
                        New: { bg: "#e0f2fe", color: "#0284c7" },
                        Quoted: { bg: "#fef3c7", color: "#d97706" },
                        Processing: { bg: "#ede9fe", color: "#7c3aed" },
                        Shipped: { bg: "#dbeafe", color: "#2563eb" },
                        Delivered: { bg: "#d1fae5", color: "#059669" },
                        Cancelled: { bg: "#fee2e2", color: "#dc2626" },
                      };
                      const sc = statusColors[order.status] ?? { bg: "#f1f5f9", color: "#64748b" };
                      return (
                        <DataTR key={order.id} data-testid={`order-row-${order.id}`}>
                          <DataTD>
                            <span className="font-medium">{order.shopifyOrderNumber}</span>
                          </DataTD>
                          <DataTD>{order.customerName}</DataTD>
                          <DataTD>{order.items.length}</DataTD>
                          <DataTD>
                            <span className="font-semibold">{formatCurrency(order.total)}</span>
                          </DataTD>
                          <DataTD>
                            <Badge variant="secondary" className="text-xs" style={{ background: sc.bg, color: sc.color }}>
                              {order.status}
                            </Badge>
                          </DataTD>
                          <DataTD>
                            <span className="text-muted-foreground text-xs">{formatDate(order.createdAt)}</span>
                          </DataTD>
                        </DataTR>
                      );
                    })}
                  </tbody>
                </table>
              </DataTableContainer>
            </CardContent>
          </Card>
        </Fade>
      )}

      {clientLedger.length > 0 && (
        <Fade>
          <Card>
            <CardContent className="p-5 space-y-3">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <FileText className="size-4" style={{ color: VENDOR_COLOR }} />
                Ledger Summary ({clientLedger.length} entries)
              </h3>
              <div className="flex items-center gap-4 text-sm flex-wrap">
                <span className="text-emerald-600 font-medium">Credits: {formatCurrency(totalCredits)}</span>
                <span className="text-red-500 font-medium">Debits: {formatCurrency(totalDebits)}</span>
                <span className="font-semibold">Net: {formatCurrency(totalCredits - totalDebits)}</span>
              </div>
              <DataTableContainer>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/30">
                      <DataTH>Date</DataTH>
                      <DataTH>Description</DataTH>
                      <DataTH>Invoice</DataTH>
                      <DataTH>Type</DataTH>
                      <DataTH>Amount</DataTH>
                      <DataTH>Status</DataTH>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {clientLedger.slice(0, 10).map(entry => (
                      <DataTR key={entry.id} data-testid={`ledger-row-${entry.id}`}>
                        <DataTD>
                          <span className="text-xs text-muted-foreground">{formatDate(entry.date)}</span>
                        </DataTD>
                        <DataTD>{entry.description}</DataTD>
                        <DataTD>
                          <span className="text-xs font-mono">{entry.invoiceNumber}</span>
                        </DataTD>
                        <DataTD>
                          <Badge
                            variant="secondary"
                            className="text-xs"
                            style={
                              entry.type === "Credit"
                                ? { background: "#d1fae5", color: "#059669" }
                                : { background: "#fee2e2", color: "#dc2626" }
                            }
                          >
                            {entry.type}
                          </Badge>
                        </DataTD>
                        <DataTD>
                          <span className={`font-semibold ${entry.type === "Credit" ? "text-emerald-600" : "text-red-500"}`}>
                            {entry.type === "Credit" ? "+" : "-"}{formatCurrency(entry.amount)}
                          </span>
                        </DataTD>
                        <DataTD>
                          <Badge
                            variant="secondary"
                            className="text-xs"
                            style={
                              entry.paymentStatus === "Paid"
                                ? { background: "#d1fae5", color: "#059669" }
                                : entry.paymentStatus === "Pending"
                                ? { background: "#fef3c7", color: "#d97706" }
                                : { background: "#fee2e2", color: "#dc2626" }
                            }
                          >
                            {entry.paymentStatus}
                          </Badge>
                        </DataTD>
                      </DataTR>
                    ))}
                  </tbody>
                </table>
              </DataTableContainer>
            </CardContent>
          </Card>
        </Fade>
      )}
    </div>
  );
}

export default function VendorClients() {
  const isLoading = useSimulatedLoading(500);
  const [search, setSearch] = useState("");
  const [sopOpen, setSopOpen] = useState(false);
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"all" | "Active" | "Inactive">("all");
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

  const filteredClients = useMemo(() => {
    return vendorClients.filter(c => {
      if (statusFilter !== "all" && c.status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          c.businessName.toLowerCase().includes(q) ||
          c.contactPerson.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.shopifyDomain.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [search, statusFilter]);

  const selectedClient = selectedClientId
    ? vendorClients.find(c => c.id === selectedClientId) ?? null
    : null;

  const activeCount = vendorClients.filter(c => c.status === "Active").length;
  const totalRevenue = vendorClients.reduce((s, c) => s + c.totalSpent, 0);
  const totalOrders = vendorClients.reduce((s, c) => s + c.totalOrders, 0);

  if (isLoading) {
    return (
      <PageShell>
        <div className="h-10 bg-muted rounded w-48 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-52 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      </PageShell>
    );
  }

  if (selectedClient) {
    return (
      <PageShell>
        <ClientDetail client={selectedClient} onBack={() => setSelectedClientId(null)} />
      </PageShell>
    );
  }

  return (
    <PageShell>
      <Fade>
        <PageHeader
          title="Clients"
          subtitle={`${vendorClients.length} USDrop client businesses`}
          actions={<SopTutorialButtons onSopClick={() => setSopOpen(true)} onTutorialClick={() => setTutorialOpen(true)} />}
        />
      </Fade>

      <Fade>
        <StatGrid cols={4}>
          <StatCard label="Total Clients" value={vendorClients.length} icon={Users} iconBg="#e0f2fe" iconColor={VENDOR_COLOR} />
          <StatCard label="Active Clients" value={activeCount} icon={Building2} iconBg="#d1fae5" iconColor="#059669" />
          <StatCard label="Total Orders" value={totalOrders} icon={ShoppingCart} iconBg="#ede9fe" iconColor="#7c3aed" />
          <StatCard label="Total Revenue" value={formatCurrency(totalRevenue)} icon={DollarSign} iconBg="#fef3c7" iconColor="#d97706" />
        </StatGrid>
      </Fade>

      <Fade>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search clients..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9"
              data-testid="input-search-clients"
            />
          </div>
          <Select value={statusFilter} onValueChange={v => setStatusFilter(v as typeof statusFilter)}>
            <SelectTrigger className="w-[140px]" data-testid="select-status-filter">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Fade>

      <Fade>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredClients.map(client => (
            <ClientCard
              key={client.id}
              client={client}
              onClick={() => setSelectedClientId(client.id)}
            />
          ))}
          {filteredClients.length === 0 && (
            <div className="col-span-full py-12 text-center text-sm text-muted-foreground">
              No clients match your search criteria.
            </div>
          )}
        </div>
      </Fade>
      <SopModal open={sopOpen} onOpenChange={setSopOpen} config={SOP_REGISTRY["vendor-clients"].sop} color={VENDOR_COLOR} />
      <TutorialModal open={tutorialOpen} onOpenChange={setTutorialOpen} config={SOP_REGISTRY["vendor-clients"].tutorial} color={VENDOR_COLOR} />
    </PageShell>
  );
}
