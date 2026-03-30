import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Calendar,
  MapPin,
  Users,
  Plus,
  Search,
  Filter,
  CalendarDays,
  Building2,
  Mic2,
  CheckCircle2,
  Clock,
  ArrowRight,
} from "lucide-react";
import { format, differenceInDays, isPast } from "date-fns";
import { cn } from "@/lib/utils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Event } from "@shared/schema";

const eventTypeConfig = {
  ibs: {
    label: "IBS - Investor Meet",
    color: "bg-blue-100 text-blue-700",
    icon: Building2,
  },
  seminar: {
    label: "Seminar",
    color: "bg-purple-100 text-purple-700",
    icon: Mic2,
  },
};

const statusConfig = {
  upcoming: { label: "Upcoming", color: "bg-amber-100 text-amber-700" },
  ongoing: { label: "Ongoing", color: "bg-green-100 text-green-700" },
  completed: { label: "Completed", color: "bg-gray-100 text-gray-600" },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-700" },
};

export default function EventsPage() {
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: events = [], isLoading } = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });

  const [formData, setFormData] = useState({
    name: "",
    type: "ibs",
    city: "",
    venue: "",
    venueAddress: "",
    date: "",
    capacity: 60,
    description: "",
    hiTeaTime: "10:00 AM - 6:00 PM",
    lunchTime: "",
    slotDuration: 30,
  });

  const handleCreateEvent = async () => {
    try {
      await apiRequest("POST", "/api/events", {
        ...formData,
        date: new Date(formData.date),
        capacity: Number(formData.capacity),
        slotDuration: Number(formData.slotDuration),
      });
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      setIsCreateOpen(false);
      setFormData({
        name: "",
        type: "ibs",
        city: "",
        venue: "",
        venueAddress: "",
        date: "",
        capacity: 60,
        description: "",
        hiTeaTime: "10:00 AM - 6:00 PM",
        lunchTime: "",
        slotDuration: 30,
      });
      toast({ title: "Event created successfully" });
    } catch (error: any) {
      toast({ title: "Error creating event", description: error.message, variant: "destructive" });
    }
  };

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.city.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || event.type === typeFilter;
    const matchesStatus = statusFilter === "all" || event.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const upcomingEvents = filteredEvents.filter((e) => e.status === "upcoming");
  const pastEvents = filteredEvents.filter((e) => e.status !== "upcoming");

  const stats = {
    total: events.length,
    upcoming: events.filter((e) => e.status === "upcoming").length,
    ibs: events.filter((e) => e.type === "ibs").length,
    seminar: events.filter((e) => e.type === "seminar").length,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Event Management</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage IBS investor meets and seminars across cities
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-event">
              <Plus className="w-4 h-4 mr-2" />
              Create Event
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Event</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label>Event Name</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., IBS Delhi January 2026"
                    data-testid="input-event-name"
                  />
                </div>
                <div>
                  <Label>Event Type</Label>
                  <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                    <SelectTrigger data-testid="select-event-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ibs">IBS - Investor Meet</SelectItem>
                      <SelectItem value="seminar">Seminar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>City</Label>
                  <Input
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="e.g., Delhi"
                    data-testid="input-event-city"
                  />
                </div>
                <div>
                  <Label>Date</Label>
                  <Input
                    type="datetime-local"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    data-testid="input-event-date"
                  />
                </div>
                <div>
                  <Label>Capacity</Label>
                  <Input
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                    data-testid="input-event-capacity"
                  />
                </div>
                <div className="col-span-2">
                  <Label>Venue Name</Label>
                  <Input
                    value={formData.venue}
                    onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                    placeholder="e.g., The Taj Palace Hotel"
                    data-testid="input-event-venue"
                  />
                </div>
                <div className="col-span-2">
                  <Label>Venue Address</Label>
                  <Input
                    value={formData.venueAddress}
                    onChange={(e) => setFormData({ ...formData, venueAddress: e.target.value })}
                    placeholder="Full address"
                  />
                </div>
                <div>
                  <Label>Hi-Tea Time</Label>
                  <Input
                    value={formData.hiTeaTime}
                    onChange={(e) => setFormData({ ...formData, hiTeaTime: e.target.value })}
                    placeholder="e.g., 10:00 AM - 6:00 PM"
                  />
                </div>
                {formData.type === "seminar" && (
                  <div>
                    <Label>Lunch Time</Label>
                    <Input
                      value={formData.lunchTime}
                      onChange={(e) => setFormData({ ...formData, lunchTime: e.target.value })}
                      placeholder="e.g., 1:00 PM - 2:00 PM"
                    />
                  </div>
                )}
                {formData.type === "ibs" && (
                  <div>
                    <Label>Slot Duration (minutes)</Label>
                    <Input
                      type="number"
                      value={formData.slotDuration}
                      onChange={(e) => setFormData({ ...formData, slotDuration: Number(e.target.value) })}
                    />
                  </div>
                )}
                <div className="col-span-2">
                  <Label>Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Event description..."
                    rows={3}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateEvent}
                  data-testid="button-submit-event"
                >
                  Create Event
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                <CalendarDays className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total Events</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.upcoming}</p>
                <p className="text-sm text-muted-foreground">Upcoming</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.ibs}</p>
                <p className="text-sm text-muted-foreground">IBS Events</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Mic2 className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.seminar}</p>
                <p className="text-sm text-muted-foreground">Seminars</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="input-search-events"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-40" data-testid="select-type-filter">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="ibs">IBS</SelectItem>
            <SelectItem value="seminar">Seminar</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40" data-testid="select-status-filter">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="upcoming">Upcoming</SelectItem>
            <SelectItem value="ongoing">Ongoing</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Upcoming Events */}
      {upcomingEvents.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Upcoming Events</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </div>
      )}

      {/* Past Events */}
      {pastEvents.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Past Events</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pastEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </div>
      )}

      {filteredEvents.length === 0 && (
        <div className="text-center py-12">
          <CalendarDays className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground">No events found</h3>
          <p className="text-muted-foreground mt-1">Create your first event to get started</p>
        </div>
      )}
    </div>
  );
}

function EventCard({ event }: { event: Event }) {
  const typeConf = eventTypeConfig[event.type as keyof typeof eventTypeConfig] || eventTypeConfig.ibs;
  const statusConf = statusConfig[event.status as keyof typeof statusConfig] || statusConfig.upcoming;
  const Icon = typeConf.icon;
  const daysUntil = differenceInDays(new Date(event.date), new Date());
  const eventDate = new Date(event.date);

  return (
    <Link href={`/events/${event.id}`}>
      <Card className="hover-elevate cursor-pointer transition-all h-full" data-testid={`card-event-${event.id}`}>
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center", typeConf.color)}>
                <Icon className="h-4 w-4" />
              </div>
              <Badge className={cn("text-xs", typeConf.color)}>{typeConf.label}</Badge>
            </div>
            <Badge className={cn("text-xs", statusConf.color)}>{statusConf.label}</Badge>
          </div>

          <h3 className="font-semibold text-foreground mb-2">{event.name}</h3>

          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{format(eventDate, "EEE, MMM d, yyyy")}</span>
              {daysUntil >= 0 && daysUntil <= 7 && (
                <Badge variant="outline" className="text-xs ml-auto">
                  {daysUntil === 0 ? "Today" : `${daysUntil}d`}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{event.city}</span>
              {event.venue && <span className="text-muted-foreground">• {event.venue}</span>}
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span>Capacity: {event.capacity}</span>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <span className="text-xs text-muted-foreground">
              {event.type === "ibs" ? `${event.slotDuration}min slots` : "Theatre seating"}
            </span>
            <span className="text-xs text-primary font-medium flex items-center gap-1">
              Manage <ArrowRight className="h-3 w-3" />
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
