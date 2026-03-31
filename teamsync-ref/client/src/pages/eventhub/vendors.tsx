import { useState } from "react";
import { Star, Plus, Mail } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";

import { StatusBadge } from "@/components/ds/status-badge";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { Button } from "@/components/ui/button";
import { hubVendors, type EventVendor } from "@/lib/mock-data-eventhub";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { useToast } from "@/hooks/use-toast";
import {
  PageShell,
  PageHeader,
  IndexToolbar,
  DataTableContainer,
  DataTH,
  DataTD,
  DataTR,
  StatGrid,
  StatCard,
  DetailModal,
  DetailSection,
} from "@/components/layout";
import { verticals } from "@/lib/verticals-config";
import { PersonCell, CompanyCell } from "@/components/ui/avatar-cells";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const statusVariantMap: Record<string, "success" | "neutral" | "warning"> = {
  active: "success",
  inactive: "neutral",
  pending: "warning",
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`size-3 ${
            i < Math.floor(rating) ? "fill-amber-400 text-amber-400" : "text-muted-foreground"
          }`}
        />
      ))}
      <span className="ml-1 text-xs text-muted-foreground">{rating}</span>
    </div>
  );
}

const formatCurrency = (val: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(val);

export default function HubVendors() {
  const loading = useSimulatedLoading();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  const vertical = verticals.find((v) => v.id === "eventhub")!;

  const filtered = hubVendors.filter((v) => {
    const matchesSearch =
      v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.category.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = activeFilter === "all" || v.category === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const uniqueCategories = Array.from(new Set(hubVendors.map((v) => v.category)));
  const filterOptions = [
    { value: "all", label: "All Categories" },
    ...uniqueCategories.map((c) => ({ value: c, label: c })),
  ];

  const totalVendors = hubVendors.length;
  const activeCount = hubVendors.filter((v) => v.status === "active").length;
  const pendingCount = hubVendors.filter((v) => v.status === "pending").length;
  const avgRating = (
    hubVendors.reduce((sum, v) => sum + v.rating, 0) / hubVendors.length
  ).toFixed(1);

  return (
    <PageShell>
      <PageHeader
        title="Vendors"
        subtitle={`${totalVendors} registered vendors`}
        actions={
          <Button
            onClick={() => setDialogOpen(true)}
            className="gap-2"
            style={{ backgroundColor: vertical.color, color: "#fff" }}
            data-testid="button-add-vendor"
          >
            <Plus className="size-4" />
            Add Vendor
          </Button>
        }
      />

      <StatGrid>
        <StatCard
          label="Total Vendors"
          value={totalVendors}
          icon={Plus}
          iconBg="rgba(124, 58, 237, 0.1)"
          iconColor="rgb(124, 58, 237)"
        />
        <StatCard
          label="Active"
          value={activeCount}
          icon={Plus}
          iconBg="rgba(16, 185, 129, 0.1)"
          iconColor="rgb(16, 185, 129)"
        />
        <StatCard
          label="Pending"
          value={pendingCount}
          icon={Plus}
          iconBg="rgba(245, 158, 11, 0.1)"
          iconColor="rgb(245, 158, 11)"
        />
        <StatCard
          label="Avg Rating"
          value={avgRating}
          icon={Star}
          iconBg="rgba(124, 58, 237, 0.1)"
          iconColor="rgb(124, 58, 237)"
        />
      </StatGrid>

      <IndexToolbar
        search={search}
        onSearch={setSearch}
        filters={filterOptions}
        activeFilter={activeFilter}
        onFilter={setActiveFilter}
        color={vertical.color}
        placeholder="Search vendors..."
      />

      {loading ? (
        <TableSkeleton rows={8} columns={8} />
      ) : (
        <DataTableContainer>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <DataTH>Name</DataTH>
                <DataTH>Category</DataTH>
                <DataTH>Specialty</DataTH>
                <DataTH>Contact</DataTH>
                <DataTH>Rate/Day</DataTH>
                <DataTH>Rating</DataTH>
                <DataTH>Status</DataTH>
                <DataTH align="right">Actions</DataTH>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((item) => (
                <DataTR key={item.id}>
                  <DataTD><CompanyCell name={item.name} size="sm" /></DataTD>
                  <DataTD>{item.category}</DataTD>
                  <DataTD className="text-muted-foreground">{item.specialty}</DataTD>
                  <DataTD>
                    <PersonCell name={item.contactName} subtitle={item.contactEmail} size="sm" />
                  </DataTD>
                  <DataTD>{formatCurrency(item.ratePerDay)}</DataTD>
                  <DataTD>
                    <StarRating rating={item.rating} />
                  </DataTD>
                  <DataTD>
                    <StatusBadge status={item.status} variant={statusVariantMap[item.status]} />
                  </DataTD>
                  <DataTD align="right">
                    <div className="flex items-center justify-end gap-1">
                      <a
                        href={`https://wa.me/${item.phone.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noreferrer"
                        data-testid={`btn-whatsapp-${item.id}`}
                      >
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                        >
                          <SiWhatsapp className="size-4" />
                        </Button>
                      </a>
                      <a href={`mailto:${item.contactEmail}`} data-testid={`btn-email-${item.id}`}>
                        <Button variant="ghost" size="icon" className="size-8">
                          <Mail className="size-4" />
                        </Button>
                      </a>
                    </div>
                  </DataTD>
                </DataTR>
              ))}
            </tbody>
          </table>
        </DataTableContainer>
      )}

      <DetailModal
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title="Add Vendor"
        subtitle="Register a new vendor for event services."
        footer={
          <>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              style={{ backgroundColor: vertical.color, color: "#fff" }}
              onClick={() => setDialogOpen(false)}
            >
              Add Vendor
            </Button>
          </>
        }
      >
        <DetailSection title="Basic Info">
          <div className="grid gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="vendor-name">Vendor Name</Label>
              <Input
                id="vendor-name"
                placeholder="e.g. SoundWave AV Solutions"
                data-testid="input-vendor-name"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="vendor-category">Category</Label>
                <Select>
                  <SelectTrigger id="vendor-category" data-testid="input-vendor-category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AV & Tech">AV & Tech</SelectItem>
                    <SelectItem value="Catering">Catering</SelectItem>
                    <SelectItem value="Photography">Photography</SelectItem>
                    <SelectItem value="Decoration">Decoration</SelectItem>
                    <SelectItem value="Security">Security</SelectItem>
                    <SelectItem value="Transport">Transport</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="vendor-rate">Rate/Day (INR)</Label>
                <Input
                  id="vendor-rate"
                  type="number"
                  placeholder="e.g. 50000"
                  data-testid="input-vendor-rate"
                />
              </div>
            </div>
          </div>
        </DetailSection>

        <DetailSection title="Contact Details">
          <div className="grid gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="vendor-specialty">Specialty</Label>
              <Input
                id="vendor-specialty"
                placeholder="e.g. Live streaming, LED walls"
                data-testid="input-vendor-specialty"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="vendor-contact-name">Contact Name</Label>
              <Input
                id="vendor-contact-name"
                placeholder="Full name"
                data-testid="input-vendor-contact-name"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="vendor-email">Contact Email</Label>
                <Input
                  id="vendor-email"
                  type="email"
                  placeholder="email@vendor.com"
                  data-testid="input-vendor-email"
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="vendor-phone">Contact Phone</Label>
                <Input
                  id="vendor-phone"
                  placeholder="+91 98xxx xxxxx"
                  data-testid="input-vendor-phone"
                />
              </div>
            </div>
          </div>
        </DetailSection>
      </DetailModal>
    </PageShell>
  );
}
