import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar,
  CalendarDays,
  Users,
  MapPin,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Ticket,
  Building2,
  TrendingUp
} from "lucide-react";
import { format, isPast, isFuture, isToday, differenceInDays } from "date-fns";
import type { Event, EventAttendee } from "@shared/schema";

export default function EventsDashboard() {
  const { data: events = [], isLoading: eventsLoading } = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });

  const { data: attendees = [] } = useQuery<EventAttendee[]>({
    queryKey: ["/api/events/attendees"],
  });

  const upcomingEvents = events.filter(e => e.status === 'upcoming' || (e.date && isFuture(new Date(e.date))));
  const soldOutEvents = events.filter(e => e.status === 'sold_out');
  const completedEvents = events.filter(e => e.status === 'completed');
  const totalCapacity = events.reduce((sum, e) => sum + (e.capacity || 0), 0);
  const totalAttendees = attendees.length;

  const nextEvent = events
    .filter(e => e.date && (isFuture(new Date(e.date)) || isToday(new Date(e.date))))
    .sort((a, b) => new Date(a.date!).getTime() - new Date(b.date!).getTime())[0];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-100 text-blue-700';
      case 'sold_out': return 'bg-green-100 text-green-700';
      case 'ongoing': return 'bg-yellow-100 text-yellow-700';
      case 'completed': return 'bg-gray-100 text-gray-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getDaysUntil = (date: Date) => {
    const days = differenceInDays(date, new Date());
    if (days === 0) return 'Today';
    if (days === 1) return 'Tomorrow';
    if (days < 0) return `${Math.abs(days)} days ago`;
    return `${days} days`;
  };

  if (eventsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Events Dashboard</h1>
          <p className="text-[14px] text-muted-foreground mt-1">
            Overview of all IBS seminars and investor meets
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/events">
            <Button variant="outline">
              <CalendarDays className="mr-2 h-4 w-4 text-muted-foreground" />
              View All Events
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-card border rounded-lg p-4 flex flex-col gap-2 shadow-[0px_1px_2px_0px_rgba(13,13,18,0.06)] dark:shadow-none">
          <div className="flex items-center justify-between w-full">
            <p className="text-muted-foreground text-[14px] font-medium">Total Events</p>
            <div className="w-[36px] h-[36px] bg-card border rounded-lg flex items-center justify-center">
              <CalendarDays className="h-[18px] w-[18px] text-primary" />
            </div>
          </div>
          <p className="text-foreground text-xl font-semibold tracking-tight">{events.length}</p>
          <p className="text-muted-foreground text-[14px]">{upcomingEvents.length} upcoming</p>
        </div>

        <div className="bg-card border rounded-lg p-4 flex flex-col gap-2 shadow-[0px_1px_2px_0px_rgba(13,13,18,0.06)] dark:shadow-none">
          <div className="flex items-center justify-between w-full">
            <p className="text-muted-foreground text-[14px] font-medium">Total Attendees</p>
            <div className="w-[36px] h-[36px] bg-card border rounded-lg flex items-center justify-center">
              <Users className="h-[18px] w-[18px] text-primary" />
            </div>
          </div>
          <p className="text-foreground text-xl font-semibold tracking-tight">{totalAttendees}</p>
          <p className="text-muted-foreground text-[14px]">Registered across all events</p>
        </div>

        <div className="bg-card border rounded-lg p-4 flex flex-col gap-2 shadow-[0px_1px_2px_0px_rgba(13,13,18,0.06)] dark:shadow-none">
          <div className="flex items-center justify-between w-full">
            <p className="text-muted-foreground text-[14px] font-medium">Sold Out Events</p>
            <div className="w-[36px] h-[36px] bg-card border rounded-lg flex items-center justify-center">
              <Ticket className="h-[18px] w-[18px] text-primary" />
            </div>
          </div>
          <p className="text-foreground text-xl font-semibold tracking-tight">{soldOutEvents.length}</p>
          <p className="text-muted-foreground text-[14px]">100% capacity reached</p>
        </div>

        <div className="bg-card border rounded-lg p-4 flex flex-col gap-2 shadow-[0px_1px_2px_0px_rgba(13,13,18,0.06)] dark:shadow-none">
          <div className="flex items-center justify-between w-full">
            <p className="text-muted-foreground text-[14px] font-medium">Total Capacity</p>
            <div className="w-[36px] h-[36px] bg-card border rounded-lg flex items-center justify-center">
              <Building2 className="h-[18px] w-[18px] text-primary" />
            </div>
          </div>
          <p className="text-foreground text-xl font-semibold tracking-tight">{totalCapacity}</p>
          <p className="text-muted-foreground text-[14px]">Seats across all events</p>
        </div>
      </div>

      {/* Next Event Highlight */}
      {nextEvent && (
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-primary rounded-xl flex flex-col items-center justify-center text-white">
                <span className="text-2xl font-bold">{format(new Date(nextEvent.date!), 'd')}</span>
                <span className="text-xs uppercase">{format(new Date(nextEvent.date!), 'MMM')}</span>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge className={getStatusColor(nextEvent.status)}>{nextEvent.status.replace('_', ' ')}</Badge>
                  <span className="text-sm text-primary font-medium">{getDaysUntil(new Date(nextEvent.date!))}</span>
                </div>
                <h3 className="text-xl font-bold text-foreground">{nextEvent.name}</h3>
                <div className="flex items-center gap-4 mt-2 text-muted-foreground text-sm">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {nextEvent.city}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {format(new Date(nextEvent.date!), 'h:mm a')}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {nextEvent.capacity} seats
                  </span>
                </div>
              </div>
            </div>
            <Link href={`/events/${nextEvent.id}`}>
              <Button>
                View Details
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Events List & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Events List */}
        <div className="lg:col-span-2 bg-card rounded-xl border shadow-[0px_1px_2px_0px_rgba(13,13,18,0.06)] dark:shadow-none overflow-hidden">
          <div className="p-6 border-b">
            <h3 className="text-lg font-bold text-foreground">All Events</h3>
            <p className="text-sm text-muted-foreground">Upcoming seminars and IBS events</p>
          </div>
          <div className="divide-y divide-border">
            {events.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <CalendarDays className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No events scheduled</p>
              </div>
            ) : (
              events.slice(0, 6).map((event) => (
                <Link key={event.id} href={`/events/${event.id}`}>
                  <div className="p-4 hover-elevate transition-colors cursor-pointer" data-testid={`event-row-${event.id}`}>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex flex-col items-center justify-center text-primary">
                        <span className="text-lg font-bold">{format(new Date(event.date!), 'd')}</span>
                        <span className="text-[10px] uppercase">{format(new Date(event.date!), 'MMM')}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-foreground truncate">{event.name}</h4>
                          <Badge className={getStatusColor(event.status)} variant="secondary">
                            {event.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {event.city}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {event.capacity} seats
                          </span>
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-muted-foreground" />
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
          {events.length > 6 && (
            <div className="p-4 border-t">
              <Link href="/events">
                <Button variant="outline" className="w-full justify-between">
                  View All Events
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <div className="bg-card rounded-xl border p-6 shadow-[0px_1px_2px_0px_rgba(13,13,18,0.06)] dark:shadow-none">
            <h3 className="text-lg font-bold text-foreground mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link href="/events/attendees">
                <Button variant="outline" className="w-full justify-start gap-3 h-12">
                  <Users className="h-5 w-5 text-primary" />
                  Attendee Database
                </Button>
              </Link>
              <Link href="/venues">
                <Button variant="outline" className="w-full justify-start gap-3 h-12">
                  <Building2 className="h-5 w-5 text-primary" />
                  Venue Comparison
                </Button>
              </Link>
              <Link href="/events/cities">
                <Button variant="outline" className="w-full justify-start gap-3 h-12">
                  <MapPin className="h-5 w-5 text-primary" />
                  City Management
                </Button>
              </Link>
              <Link href="/events/vendors">
                <Button variant="outline" className="w-full justify-start gap-3 h-12">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Vendor Management
                </Button>
              </Link>
            </div>
          </div>

          {/* Event Stats by City */}
          <div className="bg-card rounded-xl border p-6 shadow-[0px_1px_2px_0px_rgba(13,13,18,0.06)] dark:shadow-none">
            <h3 className="text-lg font-bold text-foreground mb-4">Events by City</h3>
            <div className="space-y-3">
              {Object.entries(
                events.reduce((acc, event) => {
                  acc[event.city] = (acc[event.city] || 0) + 1;
                  return acc;
                }, {} as Record<string, number>)
              ).map(([city, count]) => (
                <div key={city} className="flex items-center justify-between">
                  <span className="text-foreground font-medium">{city}</span>
                  <Badge variant="secondary" className="bg-primary/10 text-primary">
                    {count} {count === 1 ? 'event' : 'events'}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
