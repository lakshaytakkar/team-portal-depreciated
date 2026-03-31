import { useState } from "react";
import { MapPin, Users, Star, Phone, Plus, Building2 } from "lucide-react";

import { StatusBadge } from "@/components/ds/status-badge";
import { FormDialog } from "@/components/ds/form-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { hubVenues, type EventVenue } from "@/lib/mock-data-eventhub";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { PageTransition, Stagger, StaggerItem } from "@/components/ui/animated";
import { PageShell } from "@/components/layout";

const formatCurrency = (val: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(val);

const statusVariantMap: Record<string, "success" | "error" | "warning"> = {
  available: "success",
  booked: "error",
  maintenance: "warning",
};

const statusDotMap: Record<string, string> = {
  available: "bg-green-500",
  booked: "bg-red-500",
  maintenance: "bg-amber-500",
};

export default function HubVenues() {
  const loading = useSimulatedLoading();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [cityFilter, setCityFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const uniqueCities = Array.from(new Set(hubVenues.map((v) => v.city)));
  const uniqueTypes = Array.from(new Set(hubVenues.map((v) => v.type)));

  const filtered = hubVenues.filter((v) => {
    if (cityFilter !== "all" && v.city !== cityFilter) return false;
    if (typeFilter !== "all" && v.type !== typeFilter) return false;
    if (statusFilter !== "all" && v.status !== statusFilter) return false;
    return true;
  });

  const totalVenues = hubVenues.length;
  const availableCount = hubVenues.filter((v) => v.status === "available").length;
  const bookedCount = hubVenues.filter((v) => v.status === "booked").length;

  return (
    <PageShell>
      <PageTransition>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground" data-testid="hub-venues-title">Venues</h1>
            <p className="text-sm text-muted-foreground">{totalVenues} registered venues</p>
          </div>
          <Button
            onClick={() => setDialogOpen(true)}
            className="gap-2 bg-violet-600 hover:bg-violet-700 text-white"
            data-testid="button-add-venue"
          >
            <Plus className="size-4" />
            Add Venue
          </Button>
        </div>

        <div className="mb-4 grid grid-cols-3 gap-4 max-w-sm">
          <div className="rounded-lg border border-border bg-card p-3 text-center" data-testid="stat-total-venues">
            <p className="text-xl font-bold text-foreground">{totalVenues}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-3 text-center" data-testid="stat-available-venues">
            <p className="text-xl font-bold text-green-600">{availableCount}</p>
            <p className="text-xs text-muted-foreground">Available</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-3 text-center" data-testid="stat-booked-venues">
            <p className="text-xl font-bold text-red-600">{bookedCount}</p>
            <p className="text-xs text-muted-foreground">Booked</p>
          </div>
        </div>

        <div className="mb-5 flex flex-wrap gap-3">
          <Select value={cityFilter} onValueChange={setCityFilter}>
            <SelectTrigger className="w-36" data-testid="filter-city">
              <SelectValue placeholder="City" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Cities</SelectItem>
              {uniqueCities.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-44" data-testid="filter-type">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {uniqueTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36" data-testid="filter-status">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="booked">Booked</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}><CardContent className="p-5 space-y-3"><Skeleton className="h-5 w-3/4" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-1/2" /></CardContent></Card>
            ))}
          </div>
        ) : (
          <Stagger staggerInterval={0.04} className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((venue) => (
              <StaggerItem key={venue.id}>
                <Card
                  className="group relative cursor-default overflow-hidden transition-shadow hover:shadow-md"
                  onMouseEnter={() => setHoveredId(venue.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  data-testid={`card-venue-${venue.id}`}
                >
                  <CardContent className="p-5">
                    <div className="mb-3 flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`inline-block size-2 rounded-full ${statusDotMap[venue.status]}`} />
                        <span className="text-xs text-muted-foreground capitalize">{venue.status}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">{venue.type}</Badge>
                    </div>

                    <div className="mb-1 flex items-center gap-2">
                      <Building2 className="size-4 shrink-0 text-violet-500" />
                      <h3 className="font-semibold text-foreground text-sm leading-tight" data-testid={`text-venue-name-${venue.id}`}>{venue.name}</h3>
                    </div>

                    <div className="flex items-start gap-1 mb-3">
                      <MapPin className="size-3.5 mt-0.5 shrink-0 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground leading-relaxed">{venue.address}</p>
                    </div>

                    <div className="mb-3 flex items-center gap-4">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground" data-testid={`text-capacity-${venue.id}`}>
                        <Users className="size-3.5" />
                        <span>{venue.capacity.toLocaleString()} pax</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground" data-testid={`text-rating-${venue.id}`}>
                        <Star className="size-3.5 fill-amber-400 text-amber-400" />
                        <span>{venue.rating}</span>
                      </div>
                      <div className="text-xs font-medium text-foreground" data-testid={`text-price-${venue.id}`}>
                        {formatCurrency(venue.pricePerDay)}/day
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {venue.amenities.slice(0, 4).map((a) => (
                        <Badge key={a} variant="secondary" className="text-xs px-1.5 py-0">{a}</Badge>
                      ))}
                      {venue.amenities.length > 4 && (
                        <Badge variant="secondary" className="text-xs px-1.5 py-0">+{venue.amenities.length - 4}</Badge>
                      )}
                    </div>

                    {hoveredId === venue.id && (
                      <div className="mt-3 flex items-center gap-2 border-t border-border pt-3 text-xs text-muted-foreground">
                        <Phone className="size-3.5 shrink-0" />
                        <span data-testid={`text-contact-${venue.id}`}>{venue.contactName} · {venue.contactPhone}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </StaggerItem>
            ))}
          </Stagger>
        )}

        <FormDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          title="Add Venue"
          onSubmit={() => setDialogOpen(false)}
        >
          <div className="grid gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="venue-name">Venue Name</Label>
              <Input id="venue-name" placeholder="e.g. The Lalit Mumbai" data-testid="input-venue-name" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="venue-city">City</Label>
                <Input id="venue-city" placeholder="e.g. Mumbai" data-testid="input-venue-city" />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="venue-type">Type</Label>
                <Select>
                  <SelectTrigger id="venue-type" data-testid="input-venue-type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Convention Centre">Convention Centre</SelectItem>
                    <SelectItem value="Hotel Ballroom">Hotel Ballroom</SelectItem>
                    <SelectItem value="Boutique Hotel">Boutique Hotel</SelectItem>
                    <SelectItem value="Co-working Space">Co-working Space</SelectItem>
                    <SelectItem value="Outdoor">Outdoor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="venue-address">Address</Label>
              <Input id="venue-address" placeholder="Full address" data-testid="input-venue-address" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="venue-capacity">Capacity (pax)</Label>
                <Input id="venue-capacity" type="number" placeholder="e.g. 250" data-testid="input-venue-capacity" />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="venue-price">Price/Day (INR)</Label>
                <Input id="venue-price" type="number" placeholder="e.g. 250000" data-testid="input-venue-price" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="venue-contact">Contact Name</Label>
                <Input id="venue-contact" placeholder="Contact person" data-testid="input-venue-contact" />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="venue-phone">Contact Phone</Label>
                <Input id="venue-phone" placeholder="+91 98xxx xxxxx" data-testid="input-venue-phone" />
              </div>
            </div>
          </div>
        </FormDialog>
      </PageTransition>
    </PageShell>
  );
}
