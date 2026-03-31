import { useState } from "react";
import { Plus } from "lucide-react";
import { useLocation } from "wouter";

import { StatusBadge } from "@/components/ds/status-badge";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { Button } from "@/components/ui/button";
import { hubEvents, type NetworkingEvent } from "@/lib/mock-data-eventhub";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import {
  PageShell,
  PageHeader,
  IndexToolbar,
  DataTableContainer,
  DataTH,
  DataTD,
  DataTR,
  DetailModal,
  DetailSection,
} from "@/components/layout";
import { verticals } from "@/lib/verticals-config";
import { SopModal, TutorialModal, SopTutorialButtons } from "@/components/sop/sop-modal";
import { SOP_REGISTRY } from "@/lib/sop-data";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const formatCurrency = (val: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(val);

const statusVariantMap: Record<string, "info" | "success" | "neutral" | "error"> = {
  upcoming: "info",
  live: "success",
  completed: "neutral",
  cancelled: "error",
};

const typeVariantMap: Record<string, "info" | "success" | "neutral" | "warning"> = {
  Seminar: "info",
  Workshop: "warning",
  Conference: "neutral",
  "Investor Meet": "success",
  "Launch Event": "info",
  Roundtable: "neutral",
};

export default function HubEventsList() {
  const loading = useSimulatedLoading();
  const [, navigate] = useLocation();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [sopOpen, setSopOpen] = useState(false);
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const [events] = useState(hubEvents);

  const vertical = verticals.find((v) => v.id === "eventhub")!;

  const filtered = events.filter((e) => {
    const matchesSearch = e.name.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = activeFilter === "all" || e.status === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const filterOptions = [
    { value: "all", label: "All Events" },
    { value: "upcoming", label: "Upcoming" },
    { value: "live", label: "Live" },
    { value: "completed", label: "Completed" },
  ];

  return (
    <PageShell>
      <PageHeader
        title="All Events"
        subtitle={`${events.length} networking events`}
        actions={
          <>
            <SopTutorialButtons onSopClick={() => setSopOpen(true)} onTutorialClick={() => setTutorialOpen(true)} />
            <Button
              onClick={() => setDialogOpen(true)}
              className="gap-2"
              style={{ backgroundColor: vertical.color, color: "#fff" }}
              data-testid="button-create-event"
            >
              <Plus className="size-4" />
              Create Event
            </Button>
          </>
        }
      />

      <IndexToolbar
        search={search}
        onSearch={setSearch}
        filters={filterOptions}
        activeFilter={activeFilter}
        onFilter={setActiveFilter}
        color={vertical.color}
        placeholder="Search events..."
      />

      {loading ? (
        <TableSkeleton rows={8} columns={10} />
      ) : (
        <DataTableContainer>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <DataTH>ID</DataTH>
                <DataTH>Name</DataTH>
                <DataTH>Type</DataTH>
                <DataTH>Date</DataTH>
                <DataTH>Venue</DataTH>
                <DataTH>City</DataTH>
                <DataTH>Status</DataTH>
                <DataTH align="right">Attendees</DataTH>
                <DataTH align="right">Budget</DataTH>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((item) => (
                <DataTR key={item.id} onClick={() => navigate(`/hub/events/${item.id}`)}>
                  <DataTD>{item.id}</DataTD>
                  <DataTD className="font-medium">{item.name}</DataTD>
                  <DataTD>
                    <StatusBadge
                      status={item.type}
                      variant={typeVariantMap[item.type] || "neutral"}
                    />
                  </DataTD>
                  <DataTD>
                    <span data-testid={`text-date-${item.id}`}>
                      {new Date(item.date).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </DataTD>
                  <DataTD>{item.venue}</DataTD>
                  <DataTD>{item.city}</DataTD>
                  <DataTD>
                    <StatusBadge status={item.status} variant={statusVariantMap[item.status]} />
                  </DataTD>
                  <DataTD align="right" data-testid={`text-attendees-${item.id}`}>
                    {item.totalAttendees}
                  </DataTD>
                  <DataTD align="right" data-testid={`text-budget-${item.id}`}>
                    {formatCurrency(item.budget)}
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
        title="Create New Event"
        subtitle="Fill in the details to schedule a new networking event."
        footer={
          <>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              style={{ backgroundColor: vertical.color, color: "#fff" }}
              onClick={() => setDialogOpen(false)}
            >
              Create Event
            </Button>
          </>
        }
      >
        <DetailSection title="Basic Info">
          <div className="grid gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="event-name">Event Name</Label>
              <Input
                id="event-name"
                placeholder="e.g. Founders Summit 2026"
                data-testid="input-event-name"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="event-type">Type</Label>
                <Select>
                  <SelectTrigger id="event-type" data-testid="input-event-type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Seminar">Seminar</SelectItem>
                    <SelectItem value="Workshop">Workshop</SelectItem>
                    <SelectItem value="Conference">Conference</SelectItem>
                    <SelectItem value="Investor Meet">Investor Meet</SelectItem>
                    <SelectItem value="Launch Event">Launch Event</SelectItem>
                    <SelectItem value="Roundtable">Roundtable</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="event-city">City</Label>
                <Input id="event-city" placeholder="e.g. Mumbai" data-testid="input-event-city" />
              </div>
            </div>
          </div>
        </DetailSection>

        <DetailSection title="Schedule & Venue">
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="event-date">Start Date</Label>
                <Input id="event-date" type="date" data-testid="input-event-date" />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="event-end-date">End Date</Label>
                <Input id="event-end-date" type="date" data-testid="input-event-end-date" />
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="event-venue">Venue</Label>
              <Input
                id="event-venue"
                placeholder="e.g. Taj Palace Convention Centre"
                data-testid="input-event-venue"
              />
            </div>
          </div>
        </DetailSection>

        <DetailSection title="Budget & Logistics">
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="event-budget">Budget (INR)</Label>
                <Input
                  id="event-budget"
                  type="number"
                  placeholder="e.g. 1500000"
                  data-testid="input-event-budget"
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="event-organizer">Organizer</Label>
                <Input
                  id="event-organizer"
                  placeholder="Full name"
                  data-testid="input-event-organizer"
                />
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="event-description">Description</Label>
              <Input
                id="event-description"
                placeholder="Brief event description"
                data-testid="input-event-description"
              />
            </div>
          </div>
        </DetailSection>
      </DetailModal>
      <SopModal open={sopOpen} onOpenChange={setSopOpen} config={SOP_REGISTRY["eventhub-events"].sop} color={vertical.color} />
      <TutorialModal open={tutorialOpen} onOpenChange={setTutorialOpen} config={SOP_REGISTRY["eventhub-events"].tutorial} color={vertical.color} />
    </PageShell>
  );
}
