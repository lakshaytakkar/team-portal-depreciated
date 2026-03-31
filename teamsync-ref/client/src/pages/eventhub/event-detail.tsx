import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import { ArrowLeft, MapPin, Users, Calendar, IndianRupee, CheckCircle2, Clock, Tag } from "lucide-react";

import { StatusBadge } from "@/components/ds/status-badge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { hubEvents, hubAttendees, hubVendors, hubBudgetItems } from "@/lib/mock-data-eventhub";
import { PersonCell, CompanyCell } from "@/components/ui/avatar-cells";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { PageTransition, Fade } from "@/components/ui/animated";
import { useToast } from "@/hooks/use-toast";
import { PageShell } from "@/components/layout";

const formatCurrency = (val: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(val);

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

const ticketVariantMap: Record<string, "info" | "success" | "warning" | "neutral"> = {
  VIP: "success",
  Standard: "neutral",
  Speaker: "warning",
  Sponsor: "info",
};

const budgetStatusVariantMap: Record<string, "success" | "error" | "neutral"> = {
  "on-track": "success",
  "over-budget": "error",
  "under-budget": "success",
  pending: "neutral",
};

const categoryColorMap: Record<string, string> = {
  "AV & Tech": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  Catering: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  Photography: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
  Decoration: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  Security: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  Transport: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  Marketing: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
};

const tasksByType: Record<string, string[]> = {
  Seminar: [
    "Book and confirm venue",
    "Finalize speakers and panelists",
    "Send invitations to attendees",
    "Set up registration system",
    "Arrange AV equipment",
    "Confirm catering requirements",
    "Prepare name badges and lanyards",
    "Brief security team",
    "Test live streaming setup",
    "Create event day schedule",
  ],
  Workshop: [
    "Book workshop venue",
    "Prepare workshop materials",
    "Confirm facilitators",
    "Send pre-work to attendees",
    "Arrange whiteboards/flip charts",
    "Confirm catering for sessions",
    "Prepare participant kits",
    "Set up breakout rooms",
    "Create attendance sheet",
    "Arrange post-workshop survey",
  ],
  Conference: [
    "Book convention centre",
    "Confirm keynote speakers",
    "Design conference branding",
    "Set up registration portal",
    "Arrange AV and stage setup",
    "Plan networking breaks",
    "Coordinate sponsor booths",
    "Arrange gala dinner",
    "Confirm photographer",
    "Prepare press kits",
  ],
  "Investor Meet": [
    "Curate investor list",
    "Send personalized invitations",
    "Book boardroom/private venue",
    "Prepare founder pitch decks",
    "Set up matching algorithm",
    "Arrange gourmet catering",
    "Brief host on sector focus",
    "Prepare NDA documents",
    "Coordinate follow-up calendar",
    "Send post-event summary",
  ],
  "Launch Event": [
    "Book event venue",
    "Invite press and media",
    "Prepare demo stations",
    "Design branded backdrop",
    "Arrange product display",
    "Confirm AV and lighting",
    "Invite key partners",
    "Coordinate social media team",
    "Prepare post-event press release",
    "Arrange photographer and videographer",
  ],
  Roundtable: [
    "Select and invite participants",
    "Book private meeting room",
    "Prepare discussion agenda",
    "Assign discussion facilitator",
    "Arrange working lunch/breakfast",
    "Confirm name placements",
    "Set up recording (if approved)",
    "Prepare summary document template",
    "Send pre-read to attendees",
    "Arrange follow-up action tracking",
  ],
};

export default function HubEventDetail() {
  const [, params] = useRoute("/eventhub/events/:id");
  const [, navigate] = useLocation();
  const loading = useSimulatedLoading();
  const { toast } = useToast();

  const eventId = params?.id ?? "";
  const event = hubEvents.find((e) => e.id === eventId);

  const eventAttendees = hubAttendees.filter((a) => a.eventId === eventId);
  const eventVendors = hubVendors.filter((v) => v.eventsAssigned.includes(eventId));
  const eventBudget = hubBudgetItems.filter((b) => b.eventId === eventId);
  const tasks = tasksByType[event?.type ?? "Seminar"] ?? tasksByType["Seminar"];

  const [checkedInState, setCheckedInState] = useState<Record<string, boolean>>(
    Object.fromEntries(eventAttendees.map((a) => [a.id, a.checkedIn]))
  );
  const [completedTasks, setCompletedTasks] = useState<Record<number, boolean>>({});

  const toggleAttendeeCheckin = (id: string) => {
    setCheckedInState((prev) => {
      const next = !prev[id];
      toast({ title: next ? "Checked in" : "Check-in removed", description: eventAttendees.find((a) => a.id === id)?.name });
      return { ...prev, [id]: next };
    });
  };

  const toggleTask = (idx: number) => {
    setCompletedTasks((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  if (!event) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-muted-foreground">Event not found.</p>
      </div>
    );
  }

  const checkedInCount = Object.values(checkedInState).filter(Boolean).length;
  const checkinRate = eventAttendees.length > 0 ? Math.round((checkedInCount / eventAttendees.length) * 100) : 0;
  const completedTaskCount = Object.values(completedTasks).filter(Boolean).length;

  return (
    <PageShell>
      <PageTransition>
        <div className="mb-5">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/eventhub/events")}
            className="mb-3 gap-2 text-muted-foreground hover:text-foreground"
            data-testid="button-back"
          >
            <ArrowLeft className="size-4" />
            All Events
          </Button>

          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-5 w-48" />
            </div>
          ) : (
            <Fade>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-3 flex-wrap mb-1">
                    <h1 className="text-2xl font-bold text-foreground" data-testid="text-event-name">{event.name}</h1>
                    <StatusBadge status={event.type} variant={typeVariantMap[event.type] || "neutral"} />
                    <StatusBadge status={event.status} variant={statusVariantMap[event.status]} />
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                    <span className="flex items-center gap-1">
                      <Calendar className="size-4" />
                      {new Date(event.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      {event.endDate !== event.date && ` – ${new Date(event.endDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="size-4" />
                      {event.venue}, {event.city}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="size-4" />
                      {event.organizer}
                    </span>
                  </div>
                </div>
              </div>
            </Fade>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-4 mb-6 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
          </div>
        ) : (
          <Fade delay={0.05}>
            <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <Card data-testid="stat-total-attendees">
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground">Total Attendees</p>
                  <p className="text-2xl font-bold text-foreground">{event.totalAttendees}</p>
                </CardContent>
              </Card>
              <Card data-testid="stat-checked-in">
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground">Checked In</p>
                  <p className="text-2xl font-bold text-green-600">{checkedInCount} <span className="text-sm text-muted-foreground">({checkinRate}%)</span></p>
                </CardContent>
              </Card>
              <Card data-testid="stat-budget">
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground">Budget</p>
                  <p className="text-2xl font-bold text-foreground">{formatCurrency(event.budget)}</p>
                </CardContent>
              </Card>
              <Card data-testid="stat-actual-spend">
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground">Actual Spend</p>
                  <p className="text-2xl font-bold text-foreground">
                    {event.actualSpend > 0 ? formatCurrency(event.actualSpend) : <span className="text-muted-foreground text-lg">—</span>}
                  </p>
                </CardContent>
              </Card>
            </div>
          </Fade>
        )}

        {loading ? (
          <Skeleton className="h-[600px] rounded-xl" />
        ) : (
          <Fade delay={0.1}>
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="mb-4" data-testid="event-tabs">
                <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
                <TabsTrigger value="attendees" data-testid="tab-attendees">Attendees ({eventAttendees.length})</TabsTrigger>
                <TabsTrigger value="vendors" data-testid="tab-vendors">Vendors ({eventVendors.length})</TabsTrigger>
                <TabsTrigger value="budget" data-testid="tab-budget">Budget ({eventBudget.length})</TabsTrigger>
                <TabsTrigger value="tasks" data-testid="tab-tasks">Tasks ({completedTaskCount}/{tasks.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                  <div className="lg:col-span-2 space-y-6">
                    <Card>
                      <CardHeader className="pb-3"><CardTitle className="text-base">About this Event</CardTitle></CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground leading-relaxed" data-testid="text-description">{event.description}</p>
                        <div className="mt-4 flex flex-wrap gap-2" data-testid="event-tags">
                          {event.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs gap-1">
                              <Tag className="size-3" />
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-3"><CardTitle className="text-base">Check-in Progress</CardTitle></CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between mb-2 text-sm">
                          <span>{checkedInCount} of {eventAttendees.length} checked in</span>
                          <span className="font-medium">{checkinRate}%</span>
                        </div>
                        <Progress value={checkinRate} className="h-2" />
                      </CardContent>
                    </Card>
                  </div>
                  <div>
                    <Card>
                      <CardHeader className="pb-3"><CardTitle className="text-base">Event Info</CardTitle></CardHeader>
                      <CardContent className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Type</span>
                          <StatusBadge status={event.type} variant={typeVariantMap[event.type] || "neutral"} />
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Start</span>
                          <span className="font-medium">{new Date(event.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">End</span>
                          <span className="font-medium">{new Date(event.endDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">City</span>
                          <span className="font-medium">{event.city}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Organizer</span>
                          <PersonCell name={event.organizer} size="xs" />
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Status</span>
                          <StatusBadge status={event.status} variant={statusVariantMap[event.status]} />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="attendees">
                <Card>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Name</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Company</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Role</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Ticket</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Source</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Status</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {eventAttendees.map((attendee) => (
                            <tr key={attendee.id} data-testid={`row-attendee-${attendee.id}`} className="hover:bg-muted/30">
                              <td className="px-4 py-3">
                                <PersonCell name={attendee.name} size="sm" />
                              </td>
                              <td className="px-4 py-3 text-muted-foreground">{attendee.company}</td>
                              <td className="px-4 py-3 text-muted-foreground">{attendee.role}</td>
                              <td className="px-4 py-3">
                                <StatusBadge status={attendee.ticketType} variant={ticketVariantMap[attendee.ticketType]} />
                              </td>
                              <td className="px-4 py-3 text-muted-foreground">{attendee.source}</td>
                              <td className="px-4 py-3">
                                <StatusBadge
                                  status={checkedInState[attendee.id] ? "Checked In" : "Pending"}
                                  variant={checkedInState[attendee.id] ? "success" : "neutral"}
                                />
                              </td>
                              <td className="px-4 py-3">
                                <Button
                                  size="sm"
                                  variant={checkedInState[attendee.id] ? "outline" : "default"}
                                  onClick={() => toggleAttendeeCheckin(attendee.id)}
                                  className={`text-xs ${checkedInState[attendee.id]
                                    ? "border-green-300 text-green-700 dark:text-green-400"
                                    : "bg-violet-600 hover:bg-violet-700 text-white"}`}
                                  data-testid={`button-toggle-${attendee.id}`}
                                >
                                  {checkedInState[attendee.id] ? "Undo" : "Check In"}
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {eventAttendees.length === 0 && (
                        <p className="py-8 text-center text-sm text-muted-foreground">No attendees registered for this event.</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="vendors">
                <Card>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Vendor</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Category</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Specialty</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Contact</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Rate/Day</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {eventVendors.map((vendor) => (
                            <tr key={vendor.id} data-testid={`row-vendor-${vendor.id}`} className="hover:bg-muted/30">
                              <td className="px-4 py-3"><CompanyCell name={vendor.name} size="sm" /></td>
                              <td className="px-4 py-3">
                                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${categoryColorMap[vendor.category] || ""}`}>
                                  {vendor.category}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-muted-foreground text-xs">{vendor.specialty}</td>
                              <td className="px-4 py-3">
                                <PersonCell name={vendor.contactName} subtitle={vendor.contactEmail} size="sm" />
                              </td>
                              <td className="px-4 py-3 font-medium text-foreground">{formatCurrency(vendor.ratePerDay)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {eventVendors.length === 0 && (
                        <p className="py-8 text-center text-sm text-muted-foreground">No vendors assigned to this event.</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="budget">
                <Card>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Category</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Description</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Planned</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Actual</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Variance</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {eventBudget.map((item) => {
                            const v = item.actualAmount - item.plannedAmount;
                            return (
                              <tr key={item.id} data-testid={`row-budget-${item.id}`} className="hover:bg-muted/30">
                                <td className="px-4 py-3 font-medium text-foreground">{item.category}</td>
                                <td className="px-4 py-3 text-muted-foreground text-xs">{item.description}</td>
                                <td className="px-4 py-3 text-right">{formatCurrency(item.plannedAmount)}</td>
                                <td className="px-4 py-3 text-right">
                                  {item.actualAmount > 0 ? formatCurrency(item.actualAmount) : <span className="text-muted-foreground">—</span>}
                                </td>
                                <td className="px-4 py-3 text-right">
                                  {item.actualAmount > 0 ? (
                                    <span className={`font-medium ${v > 0 ? "text-red-600" : "text-green-600"}`}>
                                      {v > 0 ? "+" : ""}{formatCurrency(v)}
                                    </span>
                                  ) : <span className="text-muted-foreground">—</span>}
                                </td>
                                <td className="px-4 py-3">
                                  <StatusBadge
                                    status={item.status.split("-").map(w => w[0].toUpperCase() + w.slice(1)).join(" ")}
                                    variant={budgetStatusVariantMap[item.status]}
                                  />
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                      {eventBudget.length === 0 && (
                        <p className="py-8 text-center text-sm text-muted-foreground">No budget items for this event.</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="tasks">
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Pre-Event Checklist</CardTitle>
                      <span className="text-sm text-muted-foreground">{completedTaskCount}/{tasks.length} complete</span>
                    </div>
                    <Progress value={(completedTaskCount / tasks.length) * 100} className="h-1.5 mt-2" />
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {tasks.map((task, idx) => (
                      <div
                        key={idx}
                        className={`flex items-center gap-3 rounded-lg p-3 cursor-pointer transition-colors ${
                          completedTasks[idx]
                            ? "bg-green-50/50 dark:bg-green-950/20"
                            : "hover:bg-muted/30"
                        }`}
                        onClick={() => toggleTask(idx)}
                        data-testid={`row-task-${idx}`}
                      >
                        <button
                          className={`shrink-0 size-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                            completedTasks[idx]
                              ? "border-green-500 bg-green-500 text-white"
                              : "border-muted-foreground/40"
                          }`}
                          data-testid={`button-task-toggle-${idx}`}
                        >
                          {completedTasks[idx] && <CheckCircle2 className="size-3" />}
                        </button>
                        <span className={`text-sm ${completedTasks[idx] ? "line-through text-muted-foreground" : "text-foreground"}`}>
                          {task}
                        </span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </Fade>
        )}
      </PageTransition>
    </PageShell>
  );
}
