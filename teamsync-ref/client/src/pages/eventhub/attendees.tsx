import { useState } from "react";
import { Plus, Copy, Mail } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { useLocation } from "wouter";

import { DataTable, type Column } from "@/components/ds/data-table";
import { StatusBadge } from "@/components/ds/status-badge";
import { FormDialog } from "@/components/ds/form-dialog";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { hubAttendees, hubEvents, type EventAttendee } from "@/lib/mock-data-eventhub";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { PageTransition } from "@/components/ui/animated";
import { useToast } from "@/hooks/use-toast";
import { PageShell } from "@/components/layout";
import { PersonCell } from "@/components/ui/avatar-cells";

const ticketVariantMap: Record<string, "info" | "success" | "warning" | "neutral"> = {
  VIP: "success",
  Standard: "neutral",
  Speaker: "warning",
  Sponsor: "info",
};

const getEventName = (eventId: string) => {
  const event = hubEvents.find((e) => e.id === eventId);
  return event?.name ?? eventId;
};

const columns: Column<EventAttendee>[] = [
  { key: "id", header: "ID", sortable: true },
  { key: "name", header: "Name", sortable: true, render: (item) => <PersonCell name={item.name} size="sm" /> },
  { key: "company", header: "Company", sortable: true },
  { key: "role", header: "Role" },
  {
    key: "eventId",
    header: "Event",
    render: (item) => (
      <Badge variant="outline" className="text-xs max-w-[180px] truncate block" data-testid={`badge-event-${item.id}`}>
        {getEventName(item.eventId)}
      </Badge>
    ),
  },
  {
    key: "ticketType",
    header: "Ticket",
    render: (item) => <StatusBadge status={item.ticketType} variant={ticketVariantMap[item.ticketType]} />,
  },
  { key: "source", header: "Source" },
  {
    key: "registeredDate",
    header: "Registered",
    sortable: true,
    render: (item) => (
      <span className="text-sm" data-testid={`text-registered-${item.id}`}>
        {new Date(item.registeredDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
      </span>
    ),
  },
  {
    key: "checkedIn",
    header: "Checked In",
    render: (item) => (
      <StatusBadge
        status={item.checkedIn ? "Checked In" : "Pending"}
        variant={item.checkedIn ? "success" : "neutral"}
      />
    ),
  },
  {
    key: "_contact",
    header: "",
    render: (item) => (
      <div className="flex items-center gap-1">
        <a href={`https://wa.me/${item.phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" data-testid={`btn-whatsapp-${item.id}`}>
          <Button variant="ghost" size="icon" className="size-8 text-green-600 hover:text-green-700 hover:bg-green-50">
            <SiWhatsapp className="size-4" />
          </Button>
        </a>
        <a href={`mailto:${item.email}`} data-testid={`btn-email-${item.id}`}>
          <Button variant="ghost" size="icon" className="size-8">
            <Mail className="size-4" />
          </Button>
        </a>
      </div>
    ),
  },
];

export default function HubAttendees() {
  const loading = useSimulatedLoading();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [eventFilter, setEventFilter] = useState("all");
  const [ticketFilter, setTicketFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [checkinFilter, setCheckinFilter] = useState("all");

  const uniqueSources = Array.from(new Set(hubAttendees.map((a) => a.source)));

  const filtered = hubAttendees.filter((a) => {
    if (eventFilter !== "all" && a.eventId !== eventFilter) return false;
    if (ticketFilter !== "all" && a.ticketType !== ticketFilter) return false;
    if (sourceFilter !== "all" && a.source !== sourceFilter) return false;
    if (checkinFilter === "checked" && !a.checkedIn) return false;
    if (checkinFilter === "pending" && a.checkedIn) return false;
    return true;
  });

  const totalCount = hubAttendees.length;
  const vipCount = hubAttendees.filter((a) => a.ticketType === "VIP").length;
  const speakerCount = hubAttendees.filter((a) => a.ticketType === "Speaker").length;
  const sponsorCount = hubAttendees.filter((a) => a.ticketType === "Sponsor").length;
  const checkedInCount = hubAttendees.filter((a) => a.checkedIn).length;
  const checkinRate = Math.round((checkedInCount / totalCount) * 100);

  return (
    <PageShell>
      <PageTransition>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground" data-testid="hub-attendees-title">All Attendees</h1>
            <p className="text-sm text-muted-foreground">{totalCount} registered attendees</p>
          </div>
          <Button
            onClick={() => setDialogOpen(true)}
            className="gap-2 bg-violet-600 hover:bg-violet-700 text-white"
            data-testid="button-add-attendee"
          >
            <Plus className="size-4" />
            Add Attendee
          </Button>
        </div>

        <div className="mb-5 flex flex-wrap gap-4">
          <div className="rounded-lg border border-border bg-card p-3 text-center min-w-[75px]" data-testid="stat-total">
            <p className="text-xl font-bold text-foreground">{totalCount}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-3 text-center min-w-[75px]" data-testid="stat-vip">
            <p className="text-xl font-bold text-green-600">{vipCount}</p>
            <p className="text-xs text-muted-foreground">VIP</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-3 text-center min-w-[75px]" data-testid="stat-speakers">
            <p className="text-xl font-bold text-amber-600">{speakerCount}</p>
            <p className="text-xs text-muted-foreground">Speakers</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-3 text-center min-w-[75px]" data-testid="stat-sponsors">
            <p className="text-xl font-bold text-blue-600">{sponsorCount}</p>
            <p className="text-xs text-muted-foreground">Sponsors</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-3 text-center min-w-[90px]" data-testid="stat-checkin-rate">
            <p className="text-xl font-bold text-violet-600">{checkinRate}%</p>
            <p className="text-xs text-muted-foreground">Check-in Rate</p>
          </div>
        </div>

        <div className="mb-4 flex flex-wrap gap-3">
          <Select value={eventFilter} onValueChange={setEventFilter}>
            <SelectTrigger className="w-52" data-testid="filter-event">
              <SelectValue placeholder="Event" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Events</SelectItem>
              {hubEvents.map((e) => (
                <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
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
          <Select value={sourceFilter} onValueChange={setSourceFilter}>
            <SelectTrigger className="w-44" data-testid="filter-source">
              <SelectValue placeholder="Source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              {uniqueSources.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={checkinFilter} onValueChange={setCheckinFilter}>
            <SelectTrigger className="w-40" data-testid="filter-checkin">
              <SelectValue placeholder="Check-in Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="checked">Checked In</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <TableSkeleton rows={10} columns={9} />
        ) : (
          <DataTable
            columns={columns}
            data={filtered}
            rowActions={[
              {
                label: "Copy Email",
                onClick: (item) => {
                  navigator.clipboard.writeText(item.email);
                  toast({ title: "Email copied", description: item.email });
                },
              },
              {
                label: "View Event",
                onClick: (item) => navigate(`/hub/events/${item.eventId}`),
              },
            ]}
          />
        )}

        <FormDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          title="Add Attendee"
          onSubmit={() => setDialogOpen(false)}
        >
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="att-name">Full Name</Label>
                <Input id="att-name" placeholder="e.g. Rahul Sharma" data-testid="input-att-name" />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="att-company">Company</Label>
                <Input id="att-company" placeholder="e.g. TechCorp India" data-testid="input-att-company" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="att-email">Email</Label>
                <Input id="att-email" type="email" placeholder="email@company.com" data-testid="input-att-email" />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="att-phone">Phone</Label>
                <Input id="att-phone" placeholder="+91 98xxx xxxxx" data-testid="input-att-phone" />
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="att-role">Role / Designation</Label>
              <Input id="att-role" placeholder="e.g. CEO, CTO, Partner" data-testid="input-att-role" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="att-event">Event</Label>
                <Select>
                  <SelectTrigger id="att-event" data-testid="input-att-event">
                    <SelectValue placeholder="Select event" />
                  </SelectTrigger>
                  <SelectContent>
                    {hubEvents.map((e) => (
                      <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="att-ticket">Ticket Type</Label>
                <Select>
                  <SelectTrigger id="att-ticket" data-testid="input-att-ticket">
                    <SelectValue placeholder="Select ticket" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="VIP">VIP</SelectItem>
                    <SelectItem value="Standard">Standard</SelectItem>
                    <SelectItem value="Speaker">Speaker</SelectItem>
                    <SelectItem value="Sponsor">Sponsor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </FormDialog>
      </PageTransition>
    </PageShell>
  );
}
