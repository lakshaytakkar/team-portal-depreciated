import { useState } from "react";
import { Star, Plus, Mail, Crown, Users } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { Fade, Stagger, StaggerItem } from "@/components/ui/animated";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { tourVendors, type VendorCategory } from "@/lib/mock-data-goyo";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { EVENTS_COLOR } from "@/lib/events-config";
import {
  PageShell,
  PageHeader,
  StatGrid,
  StatCard,
  IndexToolbar,
  DetailModal,
  DetailSection,
} from "@/components/layout";
import { PersonCell, CompanyCell } from "@/components/ui/avatar-cells";

const categoryConfig: Record<VendorCategory, { label: string; color: string }> = {
  ground_partner: { label: "Ground Partner", color: "bg-pink-100 text-pink-700" },
  hotel: { label: "Hotel", color: "bg-teal-100 text-teal-700" },
  guide: { label: "Guide", color: "bg-amber-100 text-amber-700" },
  visa_agent: { label: "Visa Agent", color: "bg-purple-100 text-purple-700" },
  transport: { label: "Transport", color: "bg-green-100 text-green-700" },
  flights: { label: "Flights", color: "bg-blue-100 text-blue-700" },
  insurance: { label: "Insurance", color: "bg-indigo-100 text-indigo-700" },
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`size-3 ${i < Math.floor(rating) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`} />
      ))}
      <span className="ml-1 text-[10px] font-bold text-muted-foreground">{rating}</span>
    </div>
  );
}

export default function EventsVendors() {
  const loading = useSimulatedLoading(600);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = tourVendors.filter((v) => {
    const matchesCategory = categoryFilter === "all" || v.category === categoryFilter;
    const matchesSearch = search === "" || v.name.toLowerCase().includes(search.toLowerCase()) || v.city.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const activeCount = tourVendors.filter((v) => v.status === "active").length;

  if (loading) {
    return (
      <PageShell>
        <div className="h-10 bg-muted rounded w-64 animate-pulse" />
        <StatGrid>
          {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-muted rounded-xl animate-pulse" />)}
        </StatGrid>
        <div className="h-80 bg-muted rounded-xl animate-pulse" />
      </PageShell>
    );
  }

  return (
    <PageShell>
      <Fade>
        <PageHeader
          title="Vendors & Partners"
          subtitle={`${tourVendors.length} total vendors · ${activeCount} active`}
          actions={
            <Button
              onClick={() => setDialogOpen(true)}
              className="gap-2 text-white"
              style={{ backgroundColor: EVENTS_COLOR }}
              data-testid="button-add-vendor"
            >
              <Plus className="size-4" />
              Add Vendor
            </Button>
          }
        />
      </Fade>

      <Fade>
        <StatGrid>
          <StatCard label="Total Vendors" value={tourVendors.length} icon={Users} iconBg="rgba(33, 150, 243, 0.1)" iconColor="#2196F3" />
          <StatCard label="Active Partners" value={activeCount} icon={Users} iconBg="rgba(76, 175, 80, 0.1)" iconColor="#4CAF50" />
          <StatCard label="Key Partners" value={tourVendors.filter(v => v.category === "ground_partner").length} icon={Crown} iconBg="rgba(233, 30, 99, 0.1)" iconColor={EVENTS_COLOR} />
          <StatCard label="Service Rating" value="4.8" icon={Star} iconBg="rgba(255, 152, 0, 0.1)" iconColor="#FF9800" />
        </StatGrid>
      </Fade>

      <Fade>
        <IndexToolbar
          search={search}
          onSearch={setSearch}
          placeholder="Search vendors or cities..."
          color={EVENTS_COLOR}
          filters={[
            { value: "all", label: "All Categories" },
            { value: "ground_partner", label: "Ground Partner" },
            { value: "guide", label: "Guide" },
            { value: "visa_agent", label: "Visa Agent" },
            { value: "transport", label: "Transport" },
            { value: "flights", label: "Flights" },
            { value: "insurance", label: "Insurance" },
          ]}
          activeFilter={categoryFilter}
          onFilter={setCategoryFilter}
        />
      </Fade>

      <Stagger staggerInterval={0.05} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((vendor) => {
          const cat = categoryConfig[vendor.category];
          const isKeyPartner = vendor.category === "ground_partner";

          return (
            <StaggerItem key={vendor.id}>
              <div
                className={`rounded-xl border bg-card p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${isKeyPartner ? "border-pink-300 dark:border-pink-800 ring-1 ring-pink-200 dark:ring-pink-900" : "border-border"}`}
                data-testid={`card-vendor-${vendor.id}`}
              >
                <div className="flex items-start justify-between gap-2 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5 mb-1">
                      <CompanyCell name={vendor.name} size="sm" />
                      {isKeyPartner && (
                        <span className="flex items-center gap-0.5 rounded-full bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-tight">
                          <Crown className="size-2.5" />KEY
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{vendor.city}, {vendor.country}</p>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-tighter shrink-0 ${cat.color}`}>
                    {cat.label}
                  </span>
                </div>

                <div className="mb-4">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Primary Contact</p>
                  <PersonCell name={vendor.contact_person} size="sm" />
                  <div className="flex items-center gap-1.5 mt-2">
                    {vendor.whatsapp && (
                      <a href={`https://wa.me/${vendor.whatsapp}`} target="_blank" rel="noreferrer">
                        <Button variant="ghost" size="icon" className="size-8 text-green-600 hover:bg-green-50">
                          <SiWhatsapp className="size-4" />
                        </Button>
                      </a>
                    )}
                    <a href={`mailto:${vendor.email}`}>
                      <Button variant="ghost" size="icon" className="size-8">
                        <Mail className="size-4 text-muted-foreground" />
                      </Button>
                    </a>
                    <a href={`tel:${vendor.phone}`} className="text-[11px] font-bold text-blue-500 hover:underline ml-1">
                      {vendor.phone}
                    </a>
                  </div>
                </div>

                <div className="mb-4 flex items-center justify-between">
                  <StarRating rating={vendor.rating} />
                  <div className="flex items-center gap-1.5">
                    <div className={`size-2 rounded-full ${vendor.status === "active" ? "bg-green-500" : "bg-red-400"}`} />
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{vendor.status}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {vendor.services.map((s) => (
                    <span key={s} className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground border border-muted-foreground/10">{s}</span>
                  ))}
                </div>

                {vendor.notes && (
                  <p className="text-[11px] text-muted-foreground font-medium line-clamp-2 pt-4 border-t italic">"{vendor.notes}"</p>
                )}
              </div>
            </StaggerItem>
          );
        })}
      </Stagger>

      <DetailModal
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title="Add Vendor"
        subtitle="Expand the partner network"
        footer={
          <>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button 
              style={{ backgroundColor: EVENTS_COLOR }} 
              className="text-white hover:opacity-90"
              onClick={() => setDialogOpen(false)}
            >
              Add Vendor
            </Button>
          </>
        }
      >
        <DetailSection title="Basic Information">
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label>Vendor Name</Label>
              <Input placeholder="Company name" />
            </div>
            <div className="grid gap-1.5">
              <Label>Category</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(categoryConfig).map(([key, cfg]) => (
                    <SelectItem key={key} value={key}>{cfg.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </DetailSection>
        <DetailSection title="Location & Contact">
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label>Country</Label>
              <Input placeholder="China / India" />
            </div>
            <div className="grid gap-1.5">
              <Label>City</Label>
              <Input placeholder="City" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="grid gap-1.5">
              <Label>Contact Person</Label>
              <Input placeholder="Full name" />
            </div>
            <div className="grid gap-1.5">
              <Label>Email</Label>
              <Input type="email" placeholder="vendor@email.com" />
            </div>
          </div>
        </DetailSection>
      </DetailModal>
    </PageShell>
  );
}
