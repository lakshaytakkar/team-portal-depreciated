import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  ChevronLeft, ChevronRight, Clock, MapPin, User, Mail, Phone,
  CheckCircle2, XCircle, UserX, Calendar as CalendarIcon, Video,
  MessageCircle, Copy, ExternalLink, Download, Plus, Loader2
} from "lucide-react";

interface BookingRecord {
  id: string;
  bookingTypeId: string;
  hostUserId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  startTime: string;
  endTime: string;
  status: string;
  meetingLink?: string;
  customerNotes?: string;
  internalNotes?: string;
  cancellationReason?: string;
  createdAt: string;
}

interface BookingType {
  id: string;
  title: string;
  slug: string;
  duration: number;
  color: string;
  location?: string;
  price?: number;
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function statusConfig(status: string) {
  switch (status) {
    case "confirmed": return { label: "Confirmed", className: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400", dot: "bg-blue-500" };
    case "completed": return { label: "Completed", className: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400", dot: "bg-green-500" };
    case "cancelled": return { label: "Cancelled", className: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400", dot: "bg-red-400" };
    case "no_show": return { label: "No Show", className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400", dot: "bg-yellow-500" };
    case "pending": return { label: "Pending", className: "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400", dot: "bg-orange-500" };
    default: return { label: status, className: "bg-gray-100 text-gray-700", dot: "bg-gray-400" };
  }
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
}

function generateIcs(booking: BookingRecord, typeName: string) {
  const start = new Date(booking.startTime);
  const end = new Date(booking.endTime);
  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const ics = [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Suprans//Booking//EN",
    "BEGIN:VEVENT",
    `DTSTART:${fmt(start)}`, `DTEND:${fmt(end)}`,
    `SUMMARY:${typeName} with ${booking.customerName}`,
    `DESCRIPTION:Customer: ${booking.customerName}\\nEmail: ${booking.customerEmail}${booking.customerPhone ? "\\nPhone: " + booking.customerPhone : ""}`,
    booking.meetingLink ? `LOCATION:${booking.meetingLink}` : "",
    `UID:${booking.id}@suprans.in`,
    "END:VEVENT", "END:VCALENDAR",
  ].filter(Boolean).join("\r\n");
  const blob = new Blob([ics], { type: "text/calendar" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `booking-${booking.id.slice(0, 8)}.ics`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function CalendarPage() {
  const { toast } = useToast();
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<string | null>(
    `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`
  );
  const [selectedBooking, setSelectedBooking] = useState<BookingRecord | null>(null);
  const [actionType, setActionType] = useState<"cancel" | "status" | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [newStatus, setNewStatus] = useState("completed");

  const { data: allBookings = [], isLoading } = useQuery<BookingRecord[]>({
    queryKey: ["/api/bookings"],
  });
  const { data: types = [] } = useQuery<BookingType[]>({
    queryKey: ["/api/booking-types"],
  });

  const typesMap = useMemo(() => Object.fromEntries(types.map(t => [t.id, t])), [types]);

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const res = await apiRequest("PATCH", `/api/bookings/${id}`, updates);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      toast({ title: "Booking updated!" });
      setSelectedBooking(null);
      setActionType(null);
      setCancelReason("");
      setNewStatus("completed");
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const bookingsByDate = useMemo(() => {
    const map: Record<string, BookingRecord[]> = {};
    allBookings.forEach(b => {
      const d = new Date(b.startTime);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      if (!map[key]) map[key] = [];
      map[key].push(b);
    });
    Object.values(map).forEach(arr => arr.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()));
    return map;
  }, [allBookings]);

  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

  const calendarDays: { date: number; month: number; year: number; key: string; isCurrentMonth: boolean }[] = [];
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i;
    const m = currentMonth === 0 ? 12 : currentMonth;
    const y = currentMonth === 0 ? currentYear - 1 : currentYear;
    calendarDays.push({ date: d, month: m, year: y, key: `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`, isCurrentMonth: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const m = currentMonth + 1;
    calendarDays.push({ date: d, month: m, year: currentYear, key: `${currentYear}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`, isCurrentMonth: true });
  }
  const remaining = 42 - calendarDays.length;
  for (let d = 1; d <= remaining; d++) {
    const m = currentMonth === 11 ? 1 : currentMonth + 2;
    const y = currentMonth === 11 ? currentYear + 1 : currentYear;
    calendarDays.push({ date: d, month: m, year: y, key: `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`, isCurrentMonth: false });
  }

  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const selectedDayBookings = selectedDate ? (bookingsByDate[selectedDate] || []) : [];

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
    else setCurrentMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
    else setCurrentMonth(m => m + 1);
  };
  const goToToday = () => {
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
    setSelectedDate(todayKey);
  };

  const selectedDateObj = selectedDate ? new Date(selectedDate + "T00:00:00") : null;

  const stats = useMemo(() => {
    const now = new Date();
    return {
      total: allBookings.length,
      upcoming: allBookings.filter(b => new Date(b.startTime) >= now && (b.status === "confirmed" || b.status === "pending")).length,
      todayCount: bookingsByDate[todayKey]?.filter(b => b.status !== "cancelled").length || 0,
      thisMonth: allBookings.filter(b => {
        const d = new Date(b.startTime);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear && b.status !== "cancelled";
      }).length,
    };
  }, [allBookings, bookingsByDate, todayKey, currentMonth, currentYear]);

  const shareWhatsapp = (b: BookingRecord) => {
    const bt = typesMap[b.bookingTypeId];
    const start = new Date(b.startTime);
    const msg = encodeURIComponent(`Hello ${b.customerName},\n\nYour booking is confirmed!\n\n📅 *${bt?.title || "Meeting"}*\n🗓 ${start.toLocaleDateString("en-IN", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })}\n⏰ ${start.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })} - ${new Date(b.endTime).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}\n${b.meetingLink ? `\n🔗 Join: ${b.meetingLink}` : ""}\n\nLooking forward to speaking with you!\n- Suprans Team`);
    const phone = b.customerPhone?.replace(/[^0-9]/g, "") || "";
    window.open(`https://wa.me/${phone.length === 10 ? "91" + phone : phone}?text=${msg}`, "_blank");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="px-6 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight" data-testid="text-page-title">Calendar</h1>
          <p className="text-sm text-muted-foreground">View all your bookings at a glance</p>
        </div>
        <Button variant="outline" size="sm" onClick={goToToday} data-testid="button-today">
          Today
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Today", value: stats.todayCount, icon: CalendarIcon, color: "text-blue-600" },
          { label: "Upcoming", value: stats.upcoming, icon: Clock, color: "text-green-600" },
          { label: "This Month", value: stats.thisMonth, icon: CalendarIcon, color: "text-purple-600" },
          { label: "Total", value: stats.total, icon: CheckCircle2, color: "text-foreground" },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="shadow-[0px_1px_2px_0px_rgba(13,13,18,0.06)] dark:shadow-none">
            <CardContent className="pt-4 pb-3 px-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className={`text-xl font-bold mt-0.5 ${color}`} data-testid={`stat-${label.toLowerCase()}`}>{value}</p>
                </div>
                <Icon className={`h-5 w-5 ${color} opacity-40`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="shadow-[0px_1px_2px_0px_rgba(13,13,18,0.06)] dark:shadow-none">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">{MONTHS[currentMonth]} {currentYear}</h2>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={prevMonth} data-testid="button-prev-month">
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={nextMonth} data-testid="button-next-month">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-7 mb-1">
                {DAYS.map(d => (
                  <div key={d} className="text-center text-xs font-medium text-muted-foreground py-2">{d}</div>
                ))}
              </div>

              <div className="grid grid-cols-7">
                {calendarDays.map((day) => {
                  const dayBookings = bookingsByDate[day.key] || [];
                  const activeBookings = dayBookings.filter(b => b.status !== "cancelled");
                  const isToday = day.key === todayKey;
                  const isSelected = day.key === selectedDate;
                  const hasBookings = activeBookings.length > 0;

                  return (
                    <button
                      key={day.key}
                      onClick={() => setSelectedDate(day.key)}
                      data-testid={`calendar-day-${day.key}`}
                      className={`
                        relative p-1 min-h-[72px] md:min-h-[84px] border border-border/50 text-left transition-all
                        ${!day.isCurrentMonth ? "bg-muted/30 text-muted-foreground/50" : "hover:bg-muted/50"}
                        ${isSelected ? "ring-2 ring-primary bg-primary/5" : ""}
                        ${isToday && !isSelected ? "bg-blue-50/50 dark:bg-blue-950/20" : ""}
                      `}
                    >
                      <span className={`
                        inline-flex items-center justify-center w-6 h-6 text-xs font-medium rounded-full
                        ${isToday ? "bg-primary text-primary-foreground" : ""}
                      `}>
                        {day.date}
                      </span>
                      {hasBookings && (
                        <div className="mt-0.5 space-y-0.5">
                          {activeBookings.slice(0, 2).map(b => {
                            const bt = typesMap[b.bookingTypeId];
                            return (
                              <div
                                key={b.id}
                                className="text-[10px] leading-tight px-1 py-0.5 rounded truncate"
                                style={{ backgroundColor: (bt?.color || "#3B82F6") + "20", color: bt?.color || "#3B82F6" }}
                              >
                                {formatTime(b.startTime)} {b.customerName.split(" ")[0]}
                              </div>
                            );
                          })}
                          {activeBookings.length > 2 && (
                            <div className="text-[10px] text-muted-foreground px-1">+{activeBookings.length - 2} more</div>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="shadow-[0px_1px_2px_0px_rgba(13,13,18,0.06)] dark:shadow-none sticky top-6">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">
                  {selectedDateObj
                    ? selectedDateObj.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })
                    : "Select a date"}
                </h3>
                {selectedDayBookings.length > 0 && (
                  <Badge variant="secondary" className="text-xs">{selectedDayBookings.filter(b => b.status !== "cancelled").length} booking{selectedDayBookings.filter(b => b.status !== "cancelled").length !== 1 ? "s" : ""}</Badge>
                )}
              </div>

              {selectedDayBookings.length === 0 ? (
                <div className="text-center py-12">
                  <CalendarIcon className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No bookings on this day</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">Select a day with bookings to see details</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[calc(100vh-320px)] overflow-y-auto pr-1">
                  {selectedDayBookings.map(booking => {
                    const bt = typesMap[booking.bookingTypeId];
                    const sc = statusConfig(booking.status);
                    const isUpcoming = new Date(booking.startTime) >= new Date() && booking.status !== "cancelled";
                    return (
                      <button
                        key={booking.id}
                        onClick={() => setSelectedBooking(booking)}
                        data-testid={`booking-card-${booking.id}`}
                        className="w-full text-left rounded-lg border bg-card p-3 hover:shadow-md transition-shadow space-y-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${sc.dot} shrink-0`} />
                              <span className="text-sm font-medium truncate">{bt?.title || "Meeting"}</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 ml-4">
                              {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                            </p>
                          </div>
                          <Badge className={`${sc.className} text-[10px] shrink-0`}>{sc.label}</Badge>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <User className="h-3 w-3 text-muted-foreground shrink-0" />
                          <span className="text-xs truncate">{booking.customerName}</span>
                        </div>
                        {isUpcoming && (
                          <div className="flex items-center gap-2 ml-4">
                            <div
                              className="w-3 h-0.5 rounded-full shrink-0"
                              style={{ backgroundColor: bt?.color || "#3B82F6" }}
                            />
                            <span className="text-[10px] text-muted-foreground">{bt?.duration || 30} min</span>
                            {bt?.location && (
                              <>
                                <MapPin className="h-3 w-3 text-muted-foreground shrink-0" />
                                <span className="text-[10px] text-muted-foreground truncate">{bt.location}</span>
                              </>
                            )}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={!!selectedBooking && !actionType} onOpenChange={(open) => { if (!open) setSelectedBooking(null); }}>
        <DialogContent className="max-w-md">
          {selectedBooking && (() => {
            const bt = typesMap[selectedBooking.bookingTypeId];
            const sc = statusConfig(selectedBooking.status);
            const start = new Date(selectedBooking.startTime);
            const end = new Date(selectedBooking.endTime);
            const isUpcoming = start >= new Date() && selectedBooking.status !== "cancelled" && selectedBooking.status !== "completed";
            return (
              <>
                <DialogHeader>
                  <div className="flex items-center gap-3 mb-1">
                    <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: bt?.color || "#3B82F6" }} />
                    <DialogTitle className="text-base">{bt?.title || "Meeting"}</DialogTitle>
                  </div>
                  <DialogDescription className="sr-only">Booking details</DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge className={sc.className}>{sc.label}</Badge>
                    {bt?.price && bt.price > 0 && (
                      <Badge variant="outline">₹{bt.price}</Badge>
                    )}
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-3">
                      <CalendarIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span>{start.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span>{formatTime(selectedBooking.startTime)} - {formatTime(selectedBooking.endTime)} ({bt?.duration || Math.round((end.getTime() - start.getTime()) / 60000)} min)</span>
                    </div>
                    {bt?.location && (
                      <div className="flex items-center gap-3">
                        <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span>{bt.location}</span>
                      </div>
                    )}
                    {selectedBooking.meetingLink && (
                      <div className="flex items-center gap-3">
                        <Video className="h-4 w-4 text-muted-foreground shrink-0" />
                        <a href={selectedBooking.meetingLink} target="_blank" rel="noopener noreferrer" className="text-primary underline truncate">{selectedBooking.meetingLink}</a>
                      </div>
                    )}
                  </div>

                  <div className="border-t pt-3 space-y-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Customer</p>
                    <div className="flex items-center gap-3 text-sm">
                      <User className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="font-medium">{selectedBooking.customerName}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                      <a href={`mailto:${selectedBooking.customerEmail}`} className="text-primary underline">{selectedBooking.customerEmail}</a>
                    </div>
                    {selectedBooking.customerPhone && (
                      <div className="flex items-center gap-3 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                        <a href={`tel:${selectedBooking.customerPhone}`} className="text-primary underline">{selectedBooking.customerPhone}</a>
                      </div>
                    )}
                  </div>

                  {selectedBooking.customerNotes && (
                    <div className="border-t pt-3">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Notes from customer</p>
                      <p className="text-sm bg-muted/50 rounded p-2">{selectedBooking.customerNotes}</p>
                    </div>
                  )}

                  {selectedBooking.cancellationReason && (
                    <div className="border-t pt-3">
                      <p className="text-xs font-medium text-red-500 uppercase tracking-wider mb-1">Cancellation Reason</p>
                      <p className="text-sm bg-red-50 dark:bg-red-950/20 rounded p-2">{selectedBooking.cancellationReason}</p>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 pt-2 border-t">
                  {selectedBooking.customerPhone && (
                    <Button size="sm" variant="outline" onClick={() => shareWhatsapp(selectedBooking)} data-testid="button-whatsapp">
                      <MessageCircle className="h-3.5 w-3.5 mr-1.5" /> WhatsApp
                    </Button>
                  )}
                  <Button size="sm" variant="outline" onClick={() => generateIcs(selectedBooking, bt?.title || "Meeting")} data-testid="button-download-ics">
                    <Download className="h-3.5 w-3.5 mr-1.5" /> .ics
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => {
                    navigator.clipboard.writeText(selectedBooking.meetingLink || `Booking: ${bt?.title} on ${start.toLocaleDateString()}`);
                    toast({ title: "Copied!" });
                  }} data-testid="button-copy">
                    <Copy className="h-3.5 w-3.5 mr-1.5" /> Copy
                  </Button>
                  {isUpcoming && (
                    <>
                      <Button size="sm" variant="outline" onClick={() => setActionType("status")} data-testid="button-update-status">
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" /> Status
                      </Button>
                      <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700" onClick={() => setActionType("cancel")} data-testid="button-cancel-booking">
                        <XCircle className="h-3.5 w-3.5 mr-1.5" /> Cancel
                      </Button>
                    </>
                  )}
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>

      <Dialog open={actionType === "cancel"} onOpenChange={(open) => { if (!open) { setActionType(null); setCancelReason(""); } }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Cancel Booking</DialogTitle>
            <DialogDescription>This will cancel the booking and notify the customer.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Label>Reason (optional)</Label>
            <Textarea value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} placeholder="Why are you cancelling?" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setActionType(null); setCancelReason(""); }}>Back</Button>
            <Button
              variant="destructive"
              disabled={updateMutation.isPending}
              onClick={() => {
                if (selectedBooking) updateMutation.mutate({ id: selectedBooking.id, updates: { status: "cancelled", cancellationReason: cancelReason || undefined } });
              }}
              data-testid="button-confirm-cancel"
            >
              {updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Cancel Booking"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={actionType === "status"} onOpenChange={(open) => { if (!open) { setActionType(null); setNewStatus("completed"); } }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Update Status</DialogTitle>
            <DialogDescription>Change the status of this booking.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Label>New Status</Label>
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="no_show">No Show</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setActionType(null); setNewStatus("completed"); }}>Back</Button>
            <Button
              disabled={updateMutation.isPending}
              onClick={() => {
                if (selectedBooking) updateMutation.mutate({ id: selectedBooking.id, updates: { status: newStatus } });
              }}
              data-testid="button-confirm-status"
            >
              {updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
