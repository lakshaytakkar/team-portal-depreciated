import { useState, useMemo, Fragment } from "react";
import {
  Package, Truck, MapPin, Check, Clock, Search,
  ChevronDown, ChevronUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { VENDOR_COLOR } from "@/lib/vendor-config";
import { SopModal, TutorialModal, SopTutorialButtons } from "@/components/sop/sop-modal";
import { SOP_REGISTRY } from "@/lib/sop-data";
import {
  PageShell, PageHeader, StatGrid, StatCard,
  DataTableContainer, DataTH, SortableDataTH, DataTD, DataTR,
} from "@/components/layout";
import {
  vendorTracking,
  type VendorTracking,
  type VendorTrackingStatus,
} from "@/lib/mock-data-vendor";

const TRACKING_STEPS: VendorTrackingStatus[] = [
  "Label Created",
  "Picked Up",
  "In Transit",
  "Out for Delivery",
  "Delivered",
];

const STATUS_STYLE: Record<VendorTrackingStatus, { color: string; bg: string }> = {
  "Label Created":    { color: "#64748b", bg: "#f1f5f9" },
  "Picked Up":        { color: "#0284c7", bg: "#e0f2fe" },
  "In Transit":       { color: "#d97706", bg: "#fef3c7" },
  "Out for Delivery": { color: "#7c3aed", bg: "#ede9fe" },
  "Delivered":        { color: "#059669", bg: "#d1fae5" },
};

const CARRIER_ICONS: Record<string, string> = {
  FedEx: "FX",
  UPS: "UPS",
  USPS: "USPS",
  DHL: "DHL",
};

function getStepIndex(status: VendorTrackingStatus): number {
  return TRACKING_STEPS.indexOf(status);
}

function TrackingStepper({ status }: { status: VendorTrackingStatus }) {
  const currentIdx = getStepIndex(status);

  return (
    <div className="flex items-center gap-0.5" data-testid="tracking-stepper">
      {TRACKING_STEPS.map((step, i) => {
        const isDone = i < currentIdx;
        const isCurrent = i === currentIdx;

        return (
          <div key={step} className="flex items-center gap-0.5">
            {i > 0 && (
              <div
                className={cn(
                  "h-0.5 w-3",
                  isDone ? "bg-emerald-500" : isCurrent ? "bg-blue-400" : "bg-muted"
                )}
              />
            )}
            <div
              className={cn(
                "flex size-5 shrink-0 items-center justify-center rounded-full text-[9px] font-medium",
                isDone && "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
                isCurrent && "bg-blue-100 text-blue-700 ring-1 ring-blue-400/40 dark:bg-blue-950 dark:text-blue-300",
                !isDone && !isCurrent && "bg-muted text-muted-foreground"
              )}
              title={step}
              data-testid={`tracking-step-${i}`}
            >
              {isDone ? <Check className="size-2.5" /> : i + 1}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ExpandedTimeline({ updates }: { updates: VendorTracking["statusUpdates"] }) {
  return (
    <div className="pl-4 py-3 space-y-3" data-testid="timeline-expanded">
      {updates.map((u, i) => {
        const style = STATUS_STYLE[u.status];
        return (
          <div key={i} className="flex items-start gap-3">
            <div className="relative flex flex-col items-center">
              <div
                className="size-3 rounded-full shrink-0 mt-0.5"
                style={{ backgroundColor: style.color }}
              />
              {i < updates.length - 1 && (
                <div className="w-0.5 flex-1 bg-border mt-1" style={{ minHeight: 20 }} />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium">{u.status}</span>
                <span className="text-xs text-muted-foreground">{u.location}</span>
              </div>
              <span className="text-xs text-muted-foreground">
                {new Date(u.date).toLocaleString("en-US", {
                  month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                })}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function formatDate(d: string): string {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function VendorTracking() {
  const [search, setSearch] = useState("");
  const [sopOpen, setSopOpen] = useState(false);
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [carrierFilter, setCarrierFilter] = useState<string>("all");
  const [sortKey, setSortKey] = useState<string>("shipDate");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const carriers = useMemo(() => Array.from(new Set(vendorTracking.map(t => t.carrier))), []);
  const statuses = useMemo(() => Array.from(new Set(vendorTracking.map(t => t.status))), []);

  const filtered = useMemo(() => {
    let data = [...vendorTracking];

    if (search) {
      const q = search.toLowerCase();
      data = data.filter(t =>
        t.orderNumber.toLowerCase().includes(q) ||
        t.customerName.toLowerCase().includes(q) ||
        t.trackingNumber.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== "all") {
      data = data.filter(t => t.status === statusFilter);
    }

    if (carrierFilter !== "all") {
      data = data.filter(t => t.carrier === carrierFilter);
    }

    data.sort((a, b) => {
      let cmp = 0;
      if (sortKey === "shipDate") cmp = a.shipDate.localeCompare(b.shipDate);
      else if (sortKey === "estimatedDelivery") cmp = a.estimatedDelivery.localeCompare(b.estimatedDelivery);
      else if (sortKey === "orderNumber") cmp = a.orderNumber.localeCompare(b.orderNumber);
      else if (sortKey === "customerName") cmp = a.customerName.localeCompare(b.customerName);
      else if (sortKey === "carrier") cmp = a.carrier.localeCompare(b.carrier);
      return sortDir === "asc" ? cmp : -cmp;
    });

    return data;
  }, [search, statusFilter, carrierFilter, sortKey, sortDir]);

  const stats = useMemo(() => {
    const total = vendorTracking.length;
    const inTransit = vendorTracking.filter(t => t.status === "In Transit").length;
    const outForDelivery = vendorTracking.filter(t => t.status === "Out for Delivery").length;
    const delivered = vendorTracking.filter(t => t.status === "Delivered").length;
    return { total, inTransit, outForDelivery, delivered };
  }, []);

  const currentSort = sortKey ? { key: sortKey, dir: sortDir } : null;

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(d => d === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  return (
    <PageShell>
      <PageHeader
        title="Tracking"
        subtitle={`${vendorTracking.length} shipments tracked`}
        actions={<SopTutorialButtons onSopClick={() => setSopOpen(true)} onTutorialClick={() => setTutorialOpen(true)} />}
      />

      <StatGrid>
        <StatCard
          label="Total Shipments"
          value={stats.total}
          icon={Package}
          iconBg={`${VENDOR_COLOR}15`}
          iconColor={VENDOR_COLOR}
        />
        <StatCard
          label="In Transit"
          value={stats.inTransit}
          icon={Truck}
          iconBg="rgba(217,119,6,0.1)"
          iconColor="#d97706"
        />
        <StatCard
          label="Out for Delivery"
          value={stats.outForDelivery}
          icon={MapPin}
          iconBg="rgba(124,58,237,0.1)"
          iconColor="#7c3aed"
        />
        <StatCard
          label="Delivered"
          value={stats.delivered}
          icon={Check}
          iconBg="rgba(5,150,105,0.1)"
          iconColor="#059669"
        />
      </StatGrid>

      <div className="flex items-center gap-3 flex-wrap" data-testid="tracking-toolbar">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search order #, customer, tracking..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
            data-testid="input-search-tracking"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]" data-testid="select-status-filter">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {statuses.map(s => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={carrierFilter} onValueChange={setCarrierFilter}>
          <SelectTrigger className="w-[140px]" data-testid="select-carrier-filter">
            <SelectValue placeholder="All Carriers" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Carriers</SelectItem>
            {carriers.map(c => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DataTableContainer>
        <thead>
          <tr>
            <DataTH />
            <SortableDataTH sortKey="orderNumber" currentSort={currentSort} onSort={handleSort}>
              Order #
            </SortableDataTH>
            <SortableDataTH sortKey="customerName" currentSort={currentSort} onSort={handleSort}>
              Customer
            </SortableDataTH>
            <SortableDataTH sortKey="carrier" currentSort={currentSort} onSort={handleSort}>
              Carrier
            </SortableDataTH>
            <DataTH>Tracking #</DataTH>
            <DataTH>Status</DataTH>
            <DataTH>Progress</DataTH>
            <SortableDataTH sortKey="shipDate" currentSort={currentSort} onSort={handleSort}>
              Ship Date
            </SortableDataTH>
            <SortableDataTH sortKey="estimatedDelivery" currentSort={currentSort} onSort={handleSort}>
              ETA
            </SortableDataTH>
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 ? (
            <tr>
              <DataTD colSpan={9}>
                <div className="text-center py-8 text-muted-foreground">
                  No shipments found
                </div>
              </DataTD>
            </tr>
          ) : (
            filtered.map(t => {
              const isExpanded = expandedId === t.id;
              const style = STATUS_STYLE[t.status];
              const carrierLabel = CARRIER_ICONS[t.carrier] || t.carrier;

              return (
                <Fragment key={t.id}>
                  <DataTR>
                    <DataTD>
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : t.id)}
                        className="p-1 rounded-md hover-elevate"
                        data-testid={`button-expand-${t.id}`}
                      >
                        {isExpanded
                          ? <ChevronUp className="size-4 text-muted-foreground" />
                          : <ChevronDown className="size-4 text-muted-foreground" />}
                      </button>
                    </DataTD>
                    <DataTD>
                      <span className="text-sm font-medium" data-testid={`text-order-${t.id}`}>
                        {t.orderNumber}
                      </span>
                    </DataTD>
                    <DataTD>
                      <span className="text-sm" data-testid={`text-customer-${t.id}`}>
                        {t.customerName}
                      </span>
                    </DataTD>
                    <DataTD>
                      <Badge
                        variant="secondary"
                        className="text-xs font-semibold"
                        data-testid={`badge-carrier-${t.id}`}
                      >
                        {carrierLabel}
                      </Badge>
                    </DataTD>
                    <DataTD>
                      <span className="text-xs font-mono text-muted-foreground" data-testid={`text-tracking-${t.id}`}>
                        {t.trackingNumber}
                      </span>
                    </DataTD>
                    <DataTD>
                      <Badge
                        variant="outline"
                        className="text-xs font-medium border-0"
                        style={{ backgroundColor: style.bg, color: style.color }}
                        data-testid={`badge-status-${t.id}`}
                      >
                        {t.status}
                      </Badge>
                    </DataTD>
                    <DataTD>
                      <TrackingStepper status={t.status} />
                    </DataTD>
                    <DataTD>
                      <span className="text-sm text-muted-foreground" data-testid={`text-ship-date-${t.id}`}>
                        {formatDate(t.shipDate)}
                      </span>
                    </DataTD>
                    <DataTD>
                      <div className="flex items-center gap-1.5" data-testid={`text-eta-${t.id}`}>
                        <Clock className="size-3 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {formatDate(t.estimatedDelivery)}
                        </span>
                      </div>
                    </DataTD>
                  </DataTR>
                  {isExpanded && (
                    <tr>
                      <td colSpan={9} className="p-0 border-b">
                        <ExpandedTimeline updates={t.statusUpdates} />
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })
          )}
        </tbody>
      </DataTableContainer>
      <SopModal open={sopOpen} onOpenChange={setSopOpen} config={SOP_REGISTRY["vendor-tracking"].sop} color={VENDOR_COLOR} />
      <TutorialModal open={tutorialOpen} onOpenChange={setTutorialOpen} config={SOP_REGISTRY["vendor-tracking"].tutorial} color={VENDOR_COLOR} />
    </PageShell>
  );
}
