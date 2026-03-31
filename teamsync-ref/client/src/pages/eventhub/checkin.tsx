import { useState, useMemo } from "react";
import { Search, CheckCircle2, Clock, Users, UserCheck, ChevronDown } from "lucide-react";

import { StatusBadge } from "@/components/ds/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { hubAttendees, hubEvents, type EventAttendee } from "@/lib/mock-data-eventhub";
import { getPersonAvatar } from "@/lib/avatars";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { PageTransition, Fade } from "@/components/ui/animated";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { PageShell } from "@/components/layout";

const ticketVariantMap: Record<string, "info" | "success" | "warning" | "neutral"> = {
  VIP: "success",
  Standard: "neutral",
  Speaker: "warning",
  Sponsor: "info",
};

export default function HubCheckin() {
  const loading = useSimulatedLoading();
  const { toast } = useToast();
  const [selectedEventId, setSelectedEventId] = useState(hubEvents[0].id);
  const [search, setSearch] = useState("");
  const [ticketFilter, setTicketFilter] = useState("all");
  const [quickCheckinInput, setQuickCheckinInput] = useState("");
  const [attendees, setAttendees] = useState<EventAttendee[]>(hubAttendees);

  const eventAttendees = useMemo(
    () => attendees.filter((a) => a.eventId === selectedEventId),
    [attendees, selectedEventId]
  );

  const filtered = useMemo(() => {
    return eventAttendees.filter((a) => {
      const q = search.toLowerCase();
      if (q && !a.name.toLowerCase().includes(q) && !a.company.toLowerCase().includes(q) && !a.email.toLowerCase().includes(q)) return false;
      if (ticketFilter !== "all" && a.ticketType !== ticketFilter) return false;
      return true;
    });
  }, [eventAttendees, search, ticketFilter]);

  const totalReg = eventAttendees.length;
  const checkedInCount = eventAttendees.filter((a) => a.checkedIn).length;
  const checkinRate = totalReg > 0 ? Math.round((checkedInCount / totalReg) * 100) : 0;

  const toggleCheckin = (id: string) => {
    setAttendees((prev) =>
      prev.map((a) => {
        if (a.id !== id) return a;
        const newState = !a.checkedIn;
        const now = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
        toast({
          title: newState ? "Checked in" : "Check-in removed",
          description: a.name,
        });
        return { ...a, checkedIn: newState, checkedInAt: newState ? now : undefined };
      })
    );
  };

  const checkInAll = () => {
    const now = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
    setAttendees((prev) =>
      prev.map((a) =>
        a.eventId === selectedEventId ? { ...a, checkedIn: true, checkedInAt: a.checkedInAt ?? now } : a
      )
    );
    toast({ title: "All attendees checked in", description: `${totalReg} attendees for this event` });
  };

  const handleQuickCheckin = () => {
    if (!quickCheckinInput.trim()) return;
    const q = quickCheckinInput.toLowerCase().trim();
    const match = eventAttendees.find(
      (a) => a.id.toLowerCase() === q || a.name.toLowerCase().includes(q)
    );
    if (match) {
      const now = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
      setAttendees((prev) =>
        prev.map((a) => (a.id === match.id ? { ...a, checkedIn: true, checkedInAt: now } : a))
      );
      toast({ title: "Checked in via Quick Check-in", description: match.name });
      setQuickCheckinInput("");
    } else {
      toast({ title: "Attendee not found", description: `No match for "${quickCheckinInput}"`, variant: "destructive" });
    }
  };

  const selectedEvent = hubEvents.find((e) => e.id === selectedEventId);

  return (
    <PageShell>
      <PageTransition>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground" data-testid="hub-checkin-title">Live Check-in</h1>
          <p className="text-sm text-muted-foreground">Manage attendee check-ins for your events</p>
        </div>

        <div className="mb-5 flex flex-wrap items-center gap-3">
          <Select value={selectedEventId} onValueChange={setSelectedEventId}>
            <SelectTrigger className="w-72" data-testid="select-event">
              <SelectValue placeholder="Select event" />
            </SelectTrigger>
            <SelectContent>
              {hubEvents.map((e) => (
                <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedEvent && (
            <Badge variant="outline" className="text-xs">
              {selectedEvent.city} · {new Date(selectedEvent.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
            </Badge>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-3 gap-4 mb-6">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
          </div>
        ) : (
          <Fade>
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Card data-testid="stat-total-registered">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-900/30">
                    <Users className="size-5 text-violet-600 dark:text-violet-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{totalReg}</p>
                    <p className="text-xs text-muted-foreground">Registered</p>
                  </div>
                </CardContent>
              </Card>
              <Card data-testid="stat-checked-in">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
                    <UserCheck className="size-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{checkedInCount}</p>
                    <p className="text-xs text-muted-foreground">Checked In</p>
                  </div>
                </CardContent>
              </Card>
              <Card data-testid="stat-checkin-rate">
                <CardContent className="p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-2xl font-bold text-foreground">{checkinRate}%</p>
                    <p className="text-xs text-muted-foreground">Check-in Rate</p>
                  </div>
                  <Progress value={checkinRate} className="h-2" />
                </CardContent>
              </Card>
            </div>
          </Fade>
        )}

        <div className="mb-5 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-56 max-w-sm">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, company, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
              data-testid="input-search"
            />
          </div>
          <Select value={ticketFilter} onValueChange={setTicketFilter}>
            <SelectTrigger className="w-36" data-testid="filter-ticket">
              <SelectValue placeholder="Ticket Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tickets</SelectItem>
              <SelectItem value="VIP">VIP</SelectItem>
              <SelectItem value="Standard">Standard</SelectItem>
              <SelectItem value="Speaker">Speaker</SelectItem>
              <SelectItem value="Sponsor">Sponsor</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex gap-2">
            <div className="flex gap-2 items-center">
              <Input
                placeholder="Quick check-in (name or ID)"
                value={quickCheckinInput}
                onChange={(e) => setQuickCheckinInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleQuickCheckin()}
                className="w-52"
                data-testid="input-quick-checkin"
              />
              <Button variant="outline" onClick={handleQuickCheckin} data-testid="button-quick-checkin">
                Go
              </Button>
            </div>
            <Button
              variant="outline"
              onClick={checkInAll}
              className="gap-2 border-green-300 text-green-700 hover:bg-green-50 dark:border-green-700 dark:text-green-400 dark:hover:bg-green-950"
              data-testid="button-checkin-all"
            >
              <CheckCircle2 className="size-4" />
              Check In All
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}
          </div>
        ) : (
          <div className="space-y-2" data-testid="checkin-list">
            {filtered.length === 0 && (
              <p className="py-8 text-center text-sm text-muted-foreground">No attendees found</p>
            )}
            {filtered.map((attendee) => (
              <div
                key={attendee.id}
                className={`flex items-center gap-4 rounded-lg border p-3 transition-colors ${
                  attendee.checkedIn
                    ? "border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-950/30"
                    : "border-border bg-card hover:bg-muted/30"
                }`}
                data-testid={`row-attendee-${attendee.id}`}
              >
                <img
                  src={getPersonAvatar(attendee.name)}
                  alt={attendee.name}
                  className="size-10 rounded-full object-cover shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium text-foreground" data-testid={`text-name-${attendee.id}`}>{attendee.name}</p>
                    <StatusBadge status={attendee.ticketType} variant={ticketVariantMap[attendee.ticketType]} />
                  </div>
                  <p className="text-xs text-muted-foreground">{attendee.company} · {attendee.role}</p>
                  {attendee.checkedIn && attendee.checkedInAt && (
                    <p className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 mt-0.5">
                      <Clock className="size-3" />
                      Checked in at {attendee.checkedInAt}
                    </p>
                  )}
                </div>
                <Button
                  size="sm"
                  variant={attendee.checkedIn ? "outline" : "default"}
                  onClick={() => toggleCheckin(attendee.id)}
                  className={attendee.checkedIn
                    ? "gap-1 border-green-300 text-green-700 hover:bg-green-50 dark:border-green-700 dark:text-green-400"
                    : "gap-1 bg-violet-600 hover:bg-violet-700 text-white"}
                  data-testid={`button-toggle-checkin-${attendee.id}`}
                >
                  <CheckCircle2 className="size-4" />
                  {attendee.checkedIn ? "Checked In" : "Check In"}
                </Button>
              </div>
            ))}
          </div>
        )}
      </PageTransition>
    </PageShell>
  );
}
