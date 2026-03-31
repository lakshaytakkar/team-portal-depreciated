import { useState } from "react";
import {
  CalendarCheck,
  CalendarDays,
  Clock,
  Plus,
  Search,
  Phone,
  Video,
  Users,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  List,
  LayoutGrid,
} from "lucide-react";
import { PageTransition, Fade, Stagger, StaggerItem } from "@/components/ui/animated";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { PersonCell } from "@/components/ui/avatar-cells";
import { CRM_COLOR } from "@/lib/crm-config";
import {
  PageShell,
  PageHeader,
  StatGrid,
  StatCard,
} from "@/components/layout";

type AppointmentType = "call" | "meeting" | "demo" | "consultation";
type AppointmentStatus = "upcoming" | "completed" | "cancelled" | "no-show";

interface Appointment {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  date: string;
  time: string;
  duration: number;
  type: AppointmentType;
  status: AppointmentStatus;
  notes: string;
}

const TYPE_CONFIG: Record<AppointmentType, { label: string; icon: typeof Phone; color: string; bg: string; dot: string }> = {
  call:         { label: "Call",         icon: Phone,          color: "#0284c7", bg: "#e0f2fe", dot: "bg-sky-500" },
  meeting:      { label: "Meeting",      icon: Users,          color: "#7c3aed", bg: "#ede9fe", dot: "bg-violet-500" },
  demo:         { label: "Demo",         icon: Video,          color: "#d97706", bg: "#fef3c7", dot: "bg-amber-500" },
  consultation: { label: "Consultation", icon: MessageSquare,  color: "#059669", bg: "#d1fae5", dot: "bg-emerald-500" },
};

const STATUS_CONFIG: Record<AppointmentStatus, { label: string; color: string; bg: string }> = {
  upcoming:   { label: "Upcoming",  color: "#0284c7", bg: "#e0f2fe" },
  completed:  { label: "Completed", color: "#059669", bg: "#d1fae5" },
  cancelled:  { label: "Cancelled", color: "#dc2626", bg: "#fee2e2" },
  "no-show":  { label: "No Show",   color: "#64748b", bg: "#f1f5f9" },
};

const today = new Date();
const fmt = (d: Date) => d.toISOString().split("T")[0];
const addDays = (d: Date, n: number) => { const r = new Date(d); r.setDate(r.getDate() + n); return r; };

const initialAppointments: Appointment[] = [
  {
    id: "APT-001",
    clientName: "Rajesh Kumar",
    clientEmail: "rajesh.k@gmail.com",
    clientPhone: "+91 98765 43210",
    date: fmt(today),
    time: "10:00",
    duration: 30,
    type: "call",
    status: "upcoming",
    notes: "Follow up on legal consultation requirements",
  },
  {
    id: "APT-002",
    clientName: "Anita Sharma",
    clientEmail: "anita.s@outlook.com",
    clientPhone: "+91 91234 56789",
    date: fmt(today),
    time: "14:00",
    duration: 60,
    type: "meeting",
    status: "upcoming",
    notes: "Discuss company incorporation process",
  },
  {
    id: "APT-003",
    clientName: "Vikram Singh",
    clientEmail: "vikram.v@techstart.in",
    clientPhone: "+91 99887 76655",
    date: fmt(addDays(today, 1)),
    time: "11:30",
    duration: 45,
    type: "demo",
    status: "upcoming",
    notes: "Product demo for CRM integration",
  },
  {
    id: "APT-004",
    clientName: "Siddharth Malhotra",
    clientEmail: "sid.m@retailhub.com",
    clientPhone: "+91 98989 89898",
    date: fmt(addDays(today, 2)),
    time: "09:00",
    duration: 30,
    type: "consultation",
    status: "upcoming",
    notes: "E-commerce strategy consultation",
  },
  {
    id: "APT-005",
    clientName: "Meera Iyer",
    clientEmail: "meera.iyer@lifestyle.in",
    clientPhone: "+91 97654 32109",
    date: fmt(addDays(today, -1)),
    time: "15:00",
    duration: 60,
    type: "meeting",
    status: "completed",
    notes: "Brand registration discussion completed",
  },
  {
    id: "APT-006",
    clientName: "Arjun Reddy",
    clientEmail: "arjun.r@venture.com",
    clientPhone: "+91 95544 33221",
    date: fmt(addDays(today, -2)),
    time: "10:30",
    duration: 30,
    type: "call",
    status: "completed",
    notes: "Retainer fee discussion - agreed on terms",
  },
  {
    id: "APT-007",
    clientName: "Priyanka Chopra",
    clientEmail: "priyanka.c@global.com",
    clientPhone: "+91 94433 22110",
    date: fmt(addDays(today, -3)),
    time: "16:00",
    duration: 45,
    type: "demo",
    status: "cancelled",
    notes: "Client requested reschedule",
  },
  {
    id: "APT-008",
    clientName: "Karan Johar",
    clientEmail: "karan.j@productions.in",
    clientPhone: "+91 93322 11009",
    date: fmt(addDays(today, 3)),
    time: "13:00",
    duration: 60,
    type: "consultation",
    status: "upcoming",
    notes: "Media licensing consultation",
  },
  {
    id: "APT-009",
    clientName: "Neha Gupta",
    clientEmail: "neha.g@startups.io",
    clientPhone: "+91 92211 00998",
    date: fmt(addDays(today, -4)),
    time: "11:00",
    duration: 30,
    type: "call",
    status: "no-show",
    notes: "Client did not join the scheduled call",
  },
  {
    id: "APT-010",
    clientName: "Rohit Verma",
    clientEmail: "rohit.v@techcorp.in",
    clientPhone: "+91 91100 99887",
    date: fmt(addDays(today, 5)),
    time: "10:00",
    duration: 45,
    type: "meeting",
    status: "upcoming",
    notes: "Partnership agreement review meeting",
  },
];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function CrmAppointmentsPage() {
  const isLoading = useSimulatedLoading(800);
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [calYear, setCalYear] = useState(today.getFullYear());

  const [formData, setFormData] = useState({
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    date: fmt(today),
    time: "10:00",
    duration: "30",
    type: "call" as AppointmentType,
    notes: "",
  });

  const filtered = appointments.filter((a) => {
    const matchSearch =
      a.clientName.toLowerCase().includes(search.toLowerCase()) ||
      a.id.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "all" || a.type === typeFilter;
    const matchStatus = statusFilter === "all" || a.status === statusFilter;
    return matchSearch && matchType && matchStatus;
  });

  const sortedList = [...filtered].sort((a, b) => {
    const da = new Date(`${a.date}T${a.time}`);
    const db = new Date(`${b.date}T${b.time}`);
    return da.getTime() - db.getTime();
  });

  const todayStr = fmt(today);
  const weekEnd = fmt(addDays(today, 7));

  const totalAppointments = appointments.length;
  const upcomingToday = appointments.filter((a) => a.date === todayStr && a.status === "upcoming").length;
  const thisWeek = appointments.filter((a) => a.date >= todayStr && a.date <= weekEnd && a.status === "upcoming").length;
  const completedCount = appointments.filter((a) => a.status === "completed").length;

  const appointmentsByDate = appointments.reduce<Record<string, Appointment[]>>((acc, a) => {
    if (!acc[a.date]) acc[a.date] = [];
    acc[a.date].push(a);
    return acc;
  }, {});

  const daysInMonth = getDaysInMonth(calYear, calMonth);
  const firstDay = getFirstDayOfMonth(calYear, calMonth);

  const prevMonth = () => {
    if (calMonth === 0) { setCalMonth(11); setCalYear(calYear - 1); }
    else setCalMonth(calMonth - 1);
  };
  const nextMonth = () => {
    if (calMonth === 11) { setCalMonth(0); setCalYear(calYear + 1); }
    else setCalMonth(calMonth + 1);
  };

  const resetForm = () => {
    setFormData({
      clientName: "",
      clientEmail: "",
      clientPhone: "",
      date: fmt(today),
      time: "10:00",
      duration: "30",
      type: "call",
      notes: "",
    });
  };

  const handleCreate = () => {
    if (!formData.clientName || !formData.clientEmail || !formData.date || !formData.time) {
      toast({ title: "Missing Fields", description: "Please fill in all required fields.", variant: "destructive" });
      return;
    }
    const newAppt: Appointment = {
      id: `APT-${String(appointments.length + 1).padStart(3, "0")}`,
      clientName: formData.clientName,
      clientEmail: formData.clientEmail,
      clientPhone: formData.clientPhone,
      date: formData.date,
      time: formData.time,
      duration: parseInt(formData.duration),
      type: formData.type,
      status: "upcoming",
      notes: formData.notes,
    };
    setAppointments([newAppt, ...appointments]);
    setIsCreateOpen(false);
    resetForm();
    toast({ title: "Appointment Created", description: `Scheduled with ${newAppt.clientName}` });
  };

  const formatTime = (time: string) => {
    const [h, m] = time.split(":").map(Number);
    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 || 12;
    return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
  };

  if (isLoading) {
    return (
      <PageShell>
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <div className="h-8 bg-muted rounded w-48" />
            <div className="h-4 bg-muted rounded w-64" />
          </div>
          <div className="h-10 bg-muted rounded w-32" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-muted rounded-xl" />
          ))}
        </div>
        <div className="h-96 bg-muted rounded-xl" />
      </PageShell>
    );
  }

  return (
    <PageTransition className="px-16 py-6 lg:px-24 space-y-6">
      <Fade>
        <PageHeader
          title="Appointments"
          subtitle="Schedule and manage client appointments"
          actions={
            <Button
              className="rounded-full gap-2"
              style={{ backgroundColor: CRM_COLOR }}
              onClick={() => setIsCreateOpen(true)}
              data-testid="button-create-appointment"
            >
              <Plus className="size-4" /> New Appointment
            </Button>
          }
        />
      </Fade>

      <Fade>
        <StatGrid>
          <StatCard label="Total" value={totalAppointments} icon={CalendarDays} iconBg="#e0f2fe" iconColor="#0284c7" />
          <StatCard label="Today" value={upcomingToday} icon={Clock} iconBg="#fef3c7" iconColor="#d97706" />
          <StatCard label="This Week" value={thisWeek} icon={CalendarCheck} iconBg="#ede9fe" iconColor="#7c3aed" />
          <StatCard label="Completed" value={completedCount} icon={CheckCircle2} iconBg="#d1fae5" iconColor="#059669" />
        </StatGrid>
      </Fade>

      <Fade>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-3 flex-1">
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                className="pl-10 rounded-xl"
                placeholder="Search appointments..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                data-testid="input-search-appointments"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-40 rounded-xl" data-testid="select-type-filter">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="call">Call</SelectItem>
                <SelectItem value="meeting">Meeting</SelectItem>
                <SelectItem value="demo">Demo</SelectItem>
                <SelectItem value="consultation">Consultation</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-40 rounded-xl" data-testid="select-status-filter">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="no-show">No Show</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-1 p-1 bg-muted rounded-full">
            <button
              onClick={() => setViewMode("calendar")}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 ${
                viewMode === "calendar" ? "text-white shadow-sm" : "text-muted-foreground"
              }`}
              style={viewMode === "calendar" ? { backgroundColor: CRM_COLOR } : {}}
              data-testid="button-view-calendar"
            >
              <LayoutGrid className="size-3.5" /> Calendar
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 ${
                viewMode === "list" ? "text-white shadow-sm" : "text-muted-foreground"
              }`}
              style={viewMode === "list" ? { backgroundColor: CRM_COLOR } : {}}
              data-testid="button-view-list"
            >
              <List className="size-3.5" /> List
            </button>
          </div>
        </div>
      </Fade>

      {viewMode === "calendar" && (
        <Fade>
          <Card className="border shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-5">
                <Button variant="ghost" size="icon" onClick={prevMonth} data-testid="button-prev-month">
                  <ChevronLeft className="size-4" />
                </Button>
                <h3 className="text-lg font-semibold font-heading" data-testid="text-calendar-month">
                  {MONTH_NAMES[calMonth]} {calYear}
                </h3>
                <Button variant="ghost" size="icon" onClick={nextMonth} data-testid="button-next-month">
                  <ChevronRight className="size-4" />
                </Button>
              </div>

              <div className="grid grid-cols-7 gap-1">
                {DAY_NAMES.map((d) => (
                  <div key={d} className="text-center text-xs font-medium text-muted-foreground py-2">
                    {d}
                  </div>
                ))}

                {Array.from({ length: firstDay }).map((_, i) => (
                  <div key={`empty-${i}`} className="aspect-square" />
                ))}

                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                  const dayAppointments = appointmentsByDate[dateStr] || [];
                  const isToday = dateStr === todayStr;
                  const isSelected = dateStr === selectedDate;

                  return (
                    <button
                      key={day}
                      onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                      className={`aspect-square rounded-lg p-1 flex flex-col items-center justify-start transition-all text-sm relative ${
                        isToday
                          ? "bg-sky-50 dark:bg-sky-950 font-bold"
                          : ""
                      } ${isSelected ? "ring-2 ring-sky-600" : "hover-elevate"}`}
                      data-testid={`calendar-day-${dateStr}`}
                    >
                      <span className={isToday ? "text-sky-700 dark:text-sky-300" : ""}>
                        {day}
                      </span>
                      {dayAppointments.length > 0 && (
                        <div className="flex items-center gap-0.5 mt-0.5 flex-wrap justify-center">
                          {dayAppointments.slice(0, 3).map((appt) => (
                            <span
                              key={appt.id}
                              className={`size-1.5 rounded-full ${TYPE_CONFIG[appt.type].dot}`}
                            />
                          ))}
                          {dayAppointments.length > 3 && (
                            <span className="text-[8px] text-muted-foreground">+{dayAppointments.length - 3}</span>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {selectedDate && (
            <Fade>
              <Card className="border shadow-sm">
                <CardContent className="p-5">
                  <h4 className="text-sm font-semibold mb-3" data-testid="text-selected-date">
                    {formatDate(selectedDate)}
                  </h4>
                  {(appointmentsByDate[selectedDate] || []).length === 0 ? (
                    <p className="text-sm text-muted-foreground" data-testid="text-no-appointments">No appointments on this date.</p>
                  ) : (
                    <div className="space-y-2">
                      {(appointmentsByDate[selectedDate] || []).map((appt) => {
                        const tc = TYPE_CONFIG[appt.type];
                        const TypeIcon = tc.icon;
                        return (
                          <div
                            key={appt.id}
                            className="flex items-center justify-between gap-4 p-3 rounded-lg bg-muted/50"
                            data-testid={`appointment-card-${appt.id}`}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className="flex items-center justify-center size-8 rounded-lg"
                                style={{ backgroundColor: tc.bg, color: tc.color }}
                              >
                                <TypeIcon className="size-4" />
                              </div>
                              <div>
                                <p className="text-sm font-medium" data-testid={`text-cal-client-${appt.id}`}>{appt.clientName}</p>
                                <p className="text-xs text-muted-foreground" data-testid={`text-cal-details-${appt.id}`}>
                                  {formatTime(appt.time)} · {appt.duration}min · {tc.label}
                                </p>
                              </div>
                            </div>
                            <Badge
                              className="border-0 no-default-hover-elevate no-default-active-elevate"
                              style={{ backgroundColor: STATUS_CONFIG[appt.status].bg, color: STATUS_CONFIG[appt.status].color }}
                            >
                              {STATUS_CONFIG[appt.status].label}
                            </Badge>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </Fade>
          )}
        </Fade>
      )}

      {viewMode === "list" && (
        <Stagger className="space-y-3">
          {sortedList.length === 0 && (
            <div className="py-20 text-center space-y-3">
              <div className="bg-muted size-12 rounded-full flex items-center justify-center mx-auto text-muted-foreground">
                <CalendarDays className="size-6" />
              </div>
              <p className="text-muted-foreground text-sm">No appointments match your filters.</p>
            </div>
          )}
          {sortedList.map((appt) => {
            const tc = TYPE_CONFIG[appt.type];
            const TypeIcon = tc.icon;
            return (
              <StaggerItem key={appt.id}>
                <Card className="border-0 shadow-sm" data-testid={`appointment-row-${appt.id}`}>
                  <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div
                        className="flex items-center justify-center size-10 rounded-xl shrink-0"
                        style={{ backgroundColor: tc.bg, color: tc.color }}
                      >
                        <TypeIcon className="size-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold" data-testid={`text-client-name-${appt.id}`}>{appt.clientName}</p>
                          <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded uppercase shrink-0" data-testid={`text-appt-id-${appt.id}`}>
                            {appt.id}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5" data-testid={`text-appt-notes-${appt.id}`}>{appt.notes}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:flex md:items-center gap-4 md:gap-8">
                      <div className="space-y-0.5">
                        <p className="text-[10px] text-muted-foreground uppercase font-semibold">Date</p>
                        <p className="text-sm" data-testid={`text-appt-date-${appt.id}`}>{formatDate(appt.date)}</p>
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-[10px] text-muted-foreground uppercase font-semibold">Time</p>
                        <p className="text-sm font-medium" data-testid={`text-appt-time-${appt.id}`}>{formatTime(appt.time)} · {appt.duration}min</p>
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-[10px] text-muted-foreground uppercase font-semibold">Type</p>
                        <Badge
                          className="border-0 no-default-hover-elevate no-default-active-elevate"
                          style={{ backgroundColor: tc.bg, color: tc.color }}
                          data-testid={`badge-appt-type-${appt.id}`}
                        >
                          {tc.label}
                        </Badge>
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-[10px] text-muted-foreground uppercase font-semibold">Status</p>
                        <Badge
                          className="border-0 no-default-hover-elevate no-default-active-elevate"
                          style={{ backgroundColor: STATUS_CONFIG[appt.status].bg, color: STATUS_CONFIG[appt.status].color }}
                          data-testid={`badge-appt-status-${appt.id}`}
                        >
                          {STATUS_CONFIG[appt.status].label}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </StaggerItem>
            );
          })}
        </Stagger>
      )}

      <Dialog open={isCreateOpen} onOpenChange={(open) => { setIsCreateOpen(open); if (!open) resetForm(); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Schedule Appointment</DialogTitle>
            <DialogDescription>Fill in the details to create a new appointment.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="apt-name">Client Name *</Label>
              <Input
                id="apt-name"
                placeholder="e.g. Rajesh Kumar"
                value={formData.clientName}
                onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                data-testid="input-client-name"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="apt-email">Email *</Label>
                <Input
                  id="apt-email"
                  type="email"
                  placeholder="client@example.com"
                  value={formData.clientEmail}
                  onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                  data-testid="input-client-email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="apt-phone">Phone</Label>
                <Input
                  id="apt-phone"
                  placeholder="+91 XXXXX XXXXX"
                  value={formData.clientPhone}
                  onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                  data-testid="input-client-phone"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="apt-date">Date *</Label>
                <Input
                  id="apt-date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  data-testid="input-date"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="apt-time">Time *</Label>
                <Input
                  id="apt-time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  data-testid="input-time"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Duration</Label>
                <Select value={formData.duration} onValueChange={(v) => setFormData({ ...formData, duration: v })}>
                  <SelectTrigger data-testid="select-duration">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 min</SelectItem>
                    <SelectItem value="30">30 min</SelectItem>
                    <SelectItem value="45">45 min</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="90">1.5 hours</SelectItem>
                    <SelectItem value="120">2 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v as AppointmentType })}>
                  <SelectTrigger data-testid="select-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="call">Call</SelectItem>
                    <SelectItem value="meeting">Meeting</SelectItem>
                    <SelectItem value="demo">Demo</SelectItem>
                    <SelectItem value="consultation">Consultation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="apt-notes">Notes</Label>
              <Textarea
                id="apt-notes"
                placeholder="Add any relevant notes..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="resize-none"
                data-testid="input-notes"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsCreateOpen(false); resetForm(); }} data-testid="button-cancel-appointment">
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              style={{ backgroundColor: CRM_COLOR }}
              data-testid="button-save-appointment"
            >
              Schedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageTransition>
  );
}
