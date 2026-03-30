import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  MapPin,
  Phone,
  Mail,
  Building2,
  Star,
  Check,
  X,
  Edit2,
  Trash2,
  ExternalLink,
  IndianRupee,
  Plane,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { VenueComparison } from "@shared/schema";

const cities = ["Delhi", "Chennai", "Hyderabad", "Mumbai"];
const categories = ["5 Star", "4 Star", "3 Star"];
const stages = ["pending", "contacted", "quoted", "negotiating", "booked", "rejected"];
const stageLabels: Record<string, string> = {
  pending: "Pending",
  contacted: "Contacted",
  quoted: "Quoted",
  negotiating: "Negotiating",
  booked: "Booked",
  rejected: "Rejected",
};
const stageColors: Record<string, string> = {
  pending: "bg-gray-100 text-gray-700",
  contacted: "bg-blue-100 text-blue-700",
  quoted: "bg-purple-100 text-purple-700",
  negotiating: "bg-yellow-100 text-yellow-700",
  booked: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

export default function VenueComparisonPage() {
  const { toast } = useToast();
  const [selectedCity, setSelectedCity] = useState<string>("all");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingVenue, setEditingVenue] = useState<VenueComparison | null>(null);
  const [form, setForm] = useState({
    city: "Delhi",
    category: "5 Star",
    name: "",
    airportDistance: "",
    location: "",
    contactPhone: "",
    email: "",
    pocContactPerson: "",
    firstContactMade: false,
    quotation: "",
    stage: "pending",
    notes: "",
    paymentStatus: "",
    paymentAmount: 0,
    bookingDates: "",
  });

  const { data: venues = [], isLoading } = useQuery<VenueComparison[]>({
    queryKey: ["/api/venues", selectedCity !== "all" ? selectedCity : undefined],
  });

  const filteredVenues = selectedCity === "all" 
    ? venues 
    : venues.filter(v => v.city === selectedCity);

  const addMutation = useMutation({
    mutationFn: async (data: typeof form) => {
      return apiRequest("POST", "/api/venues", data);
    },
    onSuccess: () => {
      toast({ title: "Venue added" });
      queryClient.invalidateQueries({ queryKey: ["/api/venues"] });
      setIsAddOpen(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<typeof form> }) => {
      return apiRequest("PATCH", `/api/venues/${id}`, data);
    },
    onSuccess: () => {
      toast({ title: "Venue updated" });
      queryClient.invalidateQueries({ queryKey: ["/api/venues"] });
      setEditingVenue(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/venues/${id}`);
    },
    onSuccess: () => {
      toast({ title: "Venue removed" });
      queryClient.invalidateQueries({ queryKey: ["/api/venues"] });
    },
  });

  const resetForm = () => {
    setForm({
      city: "Delhi",
      category: "5 Star",
      name: "",
      airportDistance: "",
      location: "",
      contactPhone: "",
      email: "",
      pocContactPerson: "",
      firstContactMade: false,
      quotation: "",
      stage: "pending",
      notes: "",
      paymentStatus: "",
      paymentAmount: 0,
      bookingDates: "",
    });
  };

  const handleAdd = () => {
    if (!form.name || !form.city || !form.category) {
      toast({ title: "Please fill required fields", variant: "destructive" });
      return;
    }
    addMutation.mutate(form);
  };

  const handleStageChange = (venue: VenueComparison, newStage: string) => {
    updateMutation.mutate({ id: venue.id, data: { stage: newStage } });
  };

  const handleFirstContactChange = (venue: VenueComparison, checked: boolean) => {
    updateMutation.mutate({ id: venue.id, data: { firstContactMade: checked } });
  };

  const venuesByCity = cities.reduce((acc, city) => {
    acc[city] = filteredVenues.filter(v => v.city === city);
    return acc;
  }, {} as Record<string, VenueComparison[]>);

  const stats = {
    total: venues.length,
    booked: venues.filter(v => v.stage === "booked").length,
    quoted: venues.filter(v => v.stage === "quoted").length,
    pending: venues.filter(v => v.stage === "pending").length,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2563EB]" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Venue Comparison</h1>
          <p className="text-gray-500">Compare and track hotel/venue options for events</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white" data-testid="button-add-venue">
              <Plus className="h-4 w-4 mr-2" /> Add Venue
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Add Venue Option</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>City *</Label>
                  <Select value={form.city} onValueChange={(v) => setForm({ ...form, city: v })}>
                    <SelectTrigger data-testid="select-venue-city"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {cities.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Category *</Label>
                  <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                    <SelectTrigger data-testid="select-venue-category"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
                  <Label>Hotel/Venue Name *</Label>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} data-testid="input-venue-name" />
                </div>
                <div>
                  <Label>Airport Distance</Label>
                  <Input value={form.airportDistance} onChange={(e) => setForm({ ...form, airportDistance: e.target.value })} placeholder="e.g., 15 km" data-testid="input-venue-distance" />
                </div>
                <div>
                  <Label>Location/Address</Label>
                  <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} data-testid="input-venue-location" />
                </div>
                <div>
                  <Label>Contact Phone</Label>
                  <Input value={form.contactPhone} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} data-testid="input-venue-phone" />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} data-testid="input-venue-email" />
                </div>
                <div>
                  <Label>POC Contact Person</Label>
                  <Input value={form.pocContactPerson} onChange={(e) => setForm({ ...form, pocContactPerson: e.target.value })} data-testid="input-venue-poc" />
                </div>
                <div>
                  <Label>Quotation</Label>
                  <Input value={form.quotation} onChange={(e) => setForm({ ...form, quotation: e.target.value })} placeholder="e.g., 1.5 lakh + tax" data-testid="input-venue-quotation" />
                </div>
                <div>
                  <Label>Stage</Label>
                  <Select value={form.stage} onValueChange={(v) => setForm({ ...form, stage: v })}>
                    <SelectTrigger data-testid="select-venue-stage"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {stages.map((s) => <SelectItem key={s} value={s}>{stageLabels[s]}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Booking Dates</Label>
                  <Input value={form.bookingDates} onChange={(e) => setForm({ ...form, bookingDates: e.target.value })} placeholder="e.g., Jan 31, Feb 1" data-testid="input-venue-dates" />
                </div>
                <div className="col-span-2">
                  <Label>Notes</Label>
                  <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} data-testid="input-venue-notes" />
                </div>
                <div className="col-span-2 flex items-center gap-2">
                  <Checkbox checked={form.firstContactMade} onCheckedChange={(checked) => setForm({ ...form, firstContactMade: !!checked })} data-testid="checkbox-first-contact" />
                  <Label>First Contact Made</Label>
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                <Button onClick={handleAdd} className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white" disabled={addMutation.isPending}>Add Venue</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <p className="text-sm text-gray-500">Total Venues</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-green-600">{stats.booked}</div>
            <p className="text-sm text-gray-500">Booked</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-purple-600">{stats.quoted}</div>
            <p className="text-sm text-gray-500">Quoted</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-gray-600">{stats.pending}</div>
            <p className="text-sm text-gray-500">Pending</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={selectedCity} onValueChange={setSelectedCity}>
        <TabsList>
          <TabsTrigger value="all" data-testid="tab-venue-all">All Cities</TabsTrigger>
          {cities.map((city) => (
            <TabsTrigger key={city} value={city} data-testid={`tab-venue-${city.toLowerCase()}`}>
              {city} ({venues.filter(v => v.city === city).length})
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="all" className="mt-4">
          <div className="space-y-8">
            {cities.map((city) => {
              const cityVenues = venuesByCity[city];
              if (cityVenues.length === 0) return null;
              return (
                <div key={city}>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-[#2563EB]" />
                    {city}
                    <Badge variant="secondary">{cityVenues.length} venues</Badge>
                  </h2>
                  <VenueTable 
                    venues={cityVenues} 
                    onStageChange={handleStageChange}
                    onFirstContactChange={handleFirstContactChange}
                    onDelete={(id) => deleteMutation.mutate(id)}
                    onEdit={setEditingVenue}
                  />
                </div>
              );
            })}
          </div>
        </TabsContent>

        {cities.map((city) => (
          <TabsContent key={city} value={city} className="mt-4">
            <VenueTable 
              venues={venuesByCity[city] || []} 
              onStageChange={handleStageChange}
              onFirstContactChange={handleFirstContactChange}
              onDelete={(id) => deleteMutation.mutate(id)}
              onEdit={setEditingVenue}
            />
          </TabsContent>
        ))}
      </Tabs>

      {editingVenue && (
        <EditVenueDialog 
          venue={editingVenue} 
          onClose={() => setEditingVenue(null)}
          onSave={(data) => updateMutation.mutate({ id: editingVenue.id, data })}
          isPending={updateMutation.isPending}
        />
      )}
    </div>
  );
}

function VenueTable({ 
  venues, 
  onStageChange, 
  onFirstContactChange,
  onDelete,
  onEdit,
}: { 
  venues: VenueComparison[];
  onStageChange: (venue: VenueComparison, stage: string) => void;
  onFirstContactChange: (venue: VenueComparison, checked: boolean) => void;
  onDelete: (id: string) => void;
  onEdit: (venue: VenueComparison) => void;
}) {
  if (venues.length === 0) {
    return <p className="text-center text-gray-500 py-8">No venues added for this city yet</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-50 text-left">
            <th className="p-3 text-xs font-medium text-gray-500 uppercase">Hotel/Venue</th>
            <th className="p-3 text-xs font-medium text-gray-500 uppercase">Category</th>
            <th className="p-3 text-xs font-medium text-gray-500 uppercase">Distance</th>
            <th className="p-3 text-xs font-medium text-gray-500 uppercase">Contact</th>
            <th className="p-3 text-xs font-medium text-gray-500 uppercase">POC</th>
            <th className="p-3 text-xs font-medium text-gray-500 uppercase">First Contact</th>
            <th className="p-3 text-xs font-medium text-gray-500 uppercase">Quotation</th>
            <th className="p-3 text-xs font-medium text-gray-500 uppercase">Stage</th>
            <th className="p-3 text-xs font-medium text-gray-500 uppercase">Notes</th>
            <th className="p-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {venues.map((venue) => (
            <tr key={venue.id} className={cn("hover:bg-gray-50", venue.stage === "booked" && "bg-green-50")} data-testid={`row-venue-${venue.id}`}>
              <td className="p-3">
                <div className="font-medium text-gray-900">{venue.name}</div>
                {venue.location && <div className="text-xs text-gray-500 truncate max-w-[200px]">{venue.location}</div>}
              </td>
              <td className="p-3">
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 text-yellow-500" />
                  <span className="text-sm">{venue.category}</span>
                </div>
              </td>
              <td className="p-3">
                <div className="flex items-center gap-1 text-sm">
                  <Plane className="h-3 w-3 text-gray-400" />
                  {venue.airportDistance || "-"}
                </div>
              </td>
              <td className="p-3">
                <div className="space-y-1">
                  {venue.contactPhone && (
                    <a href={`tel:${venue.contactPhone}`} className="flex items-center gap-1 text-sm text-gray-600 hover:text-[#2563EB]">
                      <Phone className="h-3 w-3" /> {venue.contactPhone}
                    </a>
                  )}
                  {venue.email && (
                    <a href={`mailto:${venue.email}`} className="flex items-center gap-1 text-xs text-gray-500 hover:text-[#2563EB] truncate max-w-[150px]">
                      <Mail className="h-3 w-3" /> {venue.email}
                    </a>
                  )}
                </div>
              </td>
              <td className="p-3 text-sm">{venue.pocContactPerson || "-"}</td>
              <td className="p-3">
                <Checkbox 
                  checked={venue.firstContactMade || false} 
                  onCheckedChange={(checked) => onFirstContactChange(venue, !!checked)}
                  data-testid={`checkbox-contact-${venue.id}`}
                />
              </td>
              <td className="p-3">
                {venue.quotation ? (
                  <div className="flex items-center gap-1 text-sm font-medium text-green-600">
                    <IndianRupee className="h-3 w-3" /> {venue.quotation}
                  </div>
                ) : (
                  <span className="text-gray-400">-</span>
                )}
              </td>
              <td className="p-3">
                <Select value={venue.stage} onValueChange={(v) => onStageChange(venue, v)}>
                  <SelectTrigger className={cn("w-28 h-8 text-xs", stageColors[venue.stage])}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {stages.map((s) => <SelectItem key={s} value={s}>{stageLabels[s]}</SelectItem>)}
                  </SelectContent>
                </Select>
              </td>
              <td className="p-3">
                <div className="text-xs text-gray-500 max-w-[150px] truncate" title={venue.notes || ""}>
                  {venue.notes || "-"}
                </div>
              </td>
              <td className="p-3">
                <div className="flex items-center gap-1">
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => onEdit(venue)} data-testid={`button-edit-venue-${venue.id}`}>
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500" onClick={() => onDelete(venue.id)} data-testid={`button-delete-venue-${venue.id}`}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function EditVenueDialog({ 
  venue, 
  onClose, 
  onSave,
  isPending,
}: { 
  venue: VenueComparison;
  onClose: () => void;
  onSave: (data: Partial<VenueComparison>) => void;
  isPending: boolean;
}) {
  const [form, setForm] = useState({
    city: venue.city,
    category: venue.category,
    name: venue.name,
    airportDistance: venue.airportDistance || "",
    location: venue.location || "",
    contactPhone: venue.contactPhone || "",
    email: venue.email || "",
    pocContactPerson: venue.pocContactPerson || "",
    firstContactMade: venue.firstContactMade || false,
    quotation: venue.quotation || "",
    stage: venue.stage,
    notes: venue.notes || "",
    paymentStatus: venue.paymentStatus || "",
    paymentAmount: venue.paymentAmount || 0,
    bookingDates: venue.bookingDates || "",
  });

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Edit Venue</DialogTitle></DialogHeader>
        <div className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>City</Label>
              <Select value={form.city} onValueChange={(v) => setForm({ ...form, city: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {cities.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Category</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2">
              <Label>Hotel/Venue Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <Label>Airport Distance</Label>
              <Input value={form.airportDistance} onChange={(e) => setForm({ ...form, airportDistance: e.target.value })} />
            </div>
            <div>
              <Label>Location/Address</Label>
              <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
            </div>
            <div>
              <Label>Contact Phone</Label>
              <Input value={form.contactPhone} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} />
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <Label>POC Contact Person</Label>
              <Input value={form.pocContactPerson} onChange={(e) => setForm({ ...form, pocContactPerson: e.target.value })} />
            </div>
            <div>
              <Label>Quotation</Label>
              <Input value={form.quotation} onChange={(e) => setForm({ ...form, quotation: e.target.value })} />
            </div>
            <div>
              <Label>Stage</Label>
              <Select value={form.stage} onValueChange={(v) => setForm({ ...form, stage: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {stages.map((s) => <SelectItem key={s} value={s}>{stageLabels[s]}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Payment Status</Label>
              <Select value={form.paymentStatus || "pending"} onValueChange={(v) => setForm({ ...form, paymentStatus: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="partial">Partial</SelectItem>
                  <SelectItem value="full">Full</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Booking Dates</Label>
              <Input value={form.bookingDates} onChange={(e) => setForm({ ...form, bookingDates: e.target.value })} placeholder="e.g., Jan 31, Feb 1" />
            </div>
            <div>
              <Label>Payment Amount</Label>
              <Input type="number" value={form.paymentAmount} onChange={(e) => setForm({ ...form, paymentAmount: Number(e.target.value) })} />
            </div>
            <div className="col-span-2">
              <Label>Notes</Label>
              <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
            <div className="col-span-2 flex items-center gap-2">
              <Checkbox checked={form.firstContactMade} onCheckedChange={(checked) => setForm({ ...form, firstContactMade: !!checked })} />
              <Label>First Contact Made</Label>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={() => onSave(form)} className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white" disabled={isPending}>Save Changes</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
