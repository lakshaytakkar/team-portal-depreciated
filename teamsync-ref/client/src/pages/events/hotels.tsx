import { useState } from "react";
import { Star, Plus, Mail, Users, MapPin } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { Fade, Stagger, StaggerItem } from "@/components/ui/animated";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { chinaHotels, tourPackages } from "@/lib/mock-data-goyo";
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


const cities = ["All", "Guangzhou", "Hong Kong", "Shanghai", "Yiwu", "Foshan", "Wuxi"];
const starFilters = ["All", "3", "4", "5"];

function StarDisplay({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`size-3 ${i < count ? "fill-amber-400 text-amber-400" : "text-muted-foreground/20"}`} />
      ))}
    </div>
  );
}

export default function EventsHotels() {
  const loading = useSimulatedLoading(600);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [cityFilter, setCityFilter] = useState("All");
  const [starFilter, setStarFilter] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = chinaHotels.filter((h) => {
    if (cityFilter !== "All" && h.city !== cityFilter) return false;
    if (starFilter !== "All" && h.stars !== parseInt(starFilter)) return false;
    if (search && !h.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const totalHotels = chinaHotels.length;
  const uniqueCities = new Set(chinaHotels.map((h) => h.city)).size;
  const avgRate = Math.round(chinaHotels.reduce((s, h) => s + h.our_rate_usd, 0) / chinaHotels.length);

  const getPackageName = (id: string) => {
    const p = tourPackages.find((p) => p.id === id);
    return p ? p.name : id;
  };

  if (loading) {
    return (
      <PageShell>
        <div className="h-10 bg-muted rounded w-64 animate-pulse" />
        <StatGrid>
          {[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-muted rounded-xl animate-pulse" />)}
        </StatGrid>
        <div className="h-80 bg-muted rounded-xl animate-pulse" />
      </PageShell>
    );
  }

  return (
    <PageShell>
      <Fade>
        <PageHeader
          title="Hotel Directory"
          subtitle={`${totalHotels} partner hotels across ${uniqueCities} cities`}
          actions={
            <Button
              onClick={() => setDialogOpen(true)}
              className="gap-2 text-white"
              style={{ backgroundColor: EVENTS_COLOR }}
              data-testid="button-add-hotel"
            >
              <Plus className="size-4" />
              Add Hotel
            </Button>
          }
        />
      </Fade>

      <Fade>
        <StatGrid cols={3}>
          <StatCard label="Partner Hotels" value={totalHotels} icon={Users} iconBg="rgba(233, 30, 99, 0.1)" iconColor={EVENTS_COLOR} />
          <StatCard label="Cities Covered" value={uniqueCities} icon={MapPin} iconBg="rgba(33, 150, 243, 0.1)" iconColor="#2196F3" />
          <StatCard label="Avg Our Rate" value={`$${avgRate}`} icon={Star} iconBg="rgba(76, 175, 80, 0.1)" iconColor="#4CAF50" />
        </StatGrid>
      </Fade>

      <Fade>
        <IndexToolbar
          search={search}
          onSearch={setSearch}
          placeholder="Search by hotel name..."
          color={EVENTS_COLOR}
          filters={cities.map(c => ({ value: c, label: c }))}
          activeFilter={cityFilter}
          onFilter={setCityFilter}
          extra={
            <div className="flex gap-1 ml-4">
              {starFilters.map((s) => (
                <button
                  key={s}
                  onClick={() => setStarFilter(s)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${starFilter === s ? "text-white" : "bg-muted text-muted-foreground"}`}
                  style={starFilter === s ? { backgroundColor: "#fbbf24" } : {}}
                >
                  {s === "All" ? "All Stars" : `${s}★`}
                </button>
              ))}
            </div>
          }
        />
      </Fade>

      <Stagger staggerInterval={0.05} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((hotel) => (
          <StaggerItem key={hotel.id}>
            <div
              className="rounded-xl border border-border bg-card p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
              data-testid={`card-hotel-${hotel.id}`}
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex-1">
                  <h3 className="text-sm font-bold leading-tight" data-testid={`text-hotel-name-${hotel.id}`}>{hotel.name}</h3>
                  <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{hotel.city}, {hotel.country}</p>
                </div>
                <div className={`size-2.5 rounded-full shrink-0 mt-1 ${hotel.status === "active" ? "bg-green-500" : "bg-red-400"}`} />
              </div>

              <div className="flex items-center gap-2 mb-4">
                <StarDisplay count={hotel.stars} />
                <span className="text-[10px] font-bold text-muted-foreground">{hotel.stars} STARS</span>
              </div>

              <div className="rounded-lg bg-muted/30 p-3 mb-4 space-y-2 border border-muted-foreground/5">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Public Rate</span>
                  <span className="text-xs line-through text-muted-foreground font-medium">${hotel.rate_usd_per_night}/night</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider">Our Rate</span>
                  <span className="text-sm font-bold text-green-600" data-testid={`text-rate-${hotel.id}`}>${hotel.our_rate_usd}/night</span>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Direct Contact</p>
                <p className="text-xs font-bold">{hotel.contact_person}</p>
                <div className="flex items-center gap-1.5 mt-2">
                  <a href={`https://wa.me/${hotel.contact_phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer">
                    <Button variant="ghost" size="icon" className="size-8 text-green-600">
                      <SiWhatsapp size={14} />
                    </Button>
                  </a>
                  <a href={`mailto:${hotel.contact_email}`}>
                    <Button variant="ghost" size="icon" className="size-8">
                      <Mail className="size-14 text-muted-foreground" />
                    </Button>
                  </a>
                  <a href={`tel:${hotel.contact_phone}`} className="text-[10px] font-bold text-blue-500 hover:underline ml-1">
                    {hotel.contact_phone}
                  </a>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-4">
                {hotel.amenities.slice(0, 4).map((a) => (
                  <span key={a} className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground border border-muted-foreground/10">{a}</span>
                ))}
              </div>

              {hotel.notes && (
                <p className="mt-4 pt-4 border-t text-[11px] text-muted-foreground font-medium line-clamp-2 italic">"{hotel.notes}"</p>
              )}
            </div>
          </StaggerItem>
        ))}
      </Stagger>

      <DetailModal
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title="Add Partner Hotel"
        subtitle="Expand the directory"
        footer={
          <>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button 
              style={{ backgroundColor: EVENTS_COLOR }} 
              className="text-white hover:opacity-90"
              onClick={() => setDialogOpen(false)}
            >
              Add Hotel
            </Button>
          </>
        }
      >
        <DetailSection title="Basic Details">
          <div className="grid gap-4">
            <div className="grid gap-1.5">
              <Label>Hotel Name</Label>
              <Input placeholder="Hotel full name" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="grid gap-1.5">
                <Label>City</Label>
                <Input placeholder="Guangzhou" />
              </div>
              <div className="grid gap-1.5">
                <Label>Stars</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="★" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3-star</SelectItem>
                    <SelectItem value="4">4-star</SelectItem>
                    <SelectItem value="5">5-star</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </DetailSection>
      </DetailModal>
    </PageShell>
  );
}
