import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Filter, X } from "lucide-react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, startOfWeek, endOfWeek, isSameMonth } from "date-fns";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { PageTransition, Fade } from "@/components/ui/animated";
import { bookings, tourPackages, type Booking } from "@/lib/mock-data-goyo";
import { StatusBadge } from "@/components/ds/status-badge";
import { cn } from "@/lib/utils";
import { PageShell } from "@/components/layout";

const bookingStatusConfig: Record<string, { variant: "success" | "warning" | "error" | "neutral" | "info" }> = {
  confirmed: { variant: "success" },
  pending: { variant: "warning" },
  cancelled: { variant: "error" },
};

const packageCategoryColors: Record<string, string> = {
  "Canton Fair": "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800",
  "Custom Tour": "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800",
  "Sourcing Tour": "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800",
};

export default function EventsCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 1, 1)); // February 2026
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      if (statusFilter !== "all" && b.booking_status !== statusFilter) return false;
      return true;
    });
  }, [statusFilter]);

  const getBookingsForDay = (day: Date) => {
    return filteredBookings.filter((b) => isSameDay(new Date(b.travel_date), day));
  };

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const handleToday = () => setCurrentDate(new Date(2026, 1, 1));

  const pkgColors = (pkgId: string) => {
    const pkg = tourPackages.find((p) => p.id === pkgId);
    return packageCategoryColors[pkg?.category || ""] || "bg-muted text-muted-foreground";
  };

  return (
    <PageShell>
      <PageTransition>
        <Fade direction="up" delay={0}>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold font-heading text-foreground" data-testid="calendar-title">Booking Calendar</h1>
              <p className="text-sm text-muted-foreground mt-0.5">Monthly view of all tour and travel bookings</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleToday} data-testid="button-today">
                Today
              </Button>
              <div className="flex items-center border rounded-md">
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-none border-r" onClick={handlePrevMonth} data-testid="button-prev-month">
                  <ChevronLeft className="size-4" />
                </Button>
                <div className="px-4 py-1 text-sm font-medium min-w-32 text-center" data-testid="text-current-month">
                  {format(currentDate, "MMMM yyyy")}
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-none border-l" onClick={handleNextMonth} data-testid="button-next-month">
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          </div>
        </Fade>

        <Fade direction="up" delay={0.05} className="mb-4 flex items-center justify-between">
          <div className="flex gap-1.5">
            {["all", "confirmed", "pending", "cancelled"].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-medium capitalize transition-colors",
                  statusFilter === s 
                    ? "bg-pink-500 text-white" 
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
                data-testid={`filter-status-${s}`}
              >
                {s === "all" ? "All Statuses" : s}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <div className="size-2 rounded-full bg-blue-500" />
              <span>Canton Fair</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="size-2 rounded-full bg-purple-500" />
              <span>Custom Tour</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="size-2 rounded-full bg-amber-500" />
              <span>Sourcing Tour</span>
            </div>
          </div>
        </Fade>

        <div className="flex-1 grid grid-cols-4 gap-6 min-h-0">
          <Card className="col-span-3 flex flex-col min-h-0 border-none shadow-none bg-transparent">
            <CardContent className="p-0 flex flex-col h-full">
              <div className="grid grid-cols-7 border-b border-r bg-muted/30 rounded-t-lg overflow-hidden">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                  <div key={day} className="py-2 text-center text-xs font-semibold text-muted-foreground border-l">
                    {day}
                  </div>
                ))}
              </div>
              <div className="flex-1 grid grid-cols-7 grid-rows-5 border-b border-r bg-card rounded-b-lg overflow-hidden">
                {calendarDays.map((day, idx) => {
                  const dayBookings = getBookingsForDay(day);
                  const isCurrentMonth = isSameMonth(day, monthStart);
                  
                  return (
                    <div 
                      key={day.toISOString()} 
                      className={cn(
                        "min-h-24 p-1.5 border-l border-t flex flex-col gap-1 transition-colors hover:bg-muted/10",
                        !isCurrentMonth && "bg-muted/20 text-muted-foreground"
                      )}
                      onClick={() => dayBookings.length > 0 && setSelectedBooking(dayBookings[0])}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className={cn(
                          "text-xs font-medium size-6 flex items-center justify-center rounded-full",
                          isToday(day) && "bg-pink-500 text-white"
                        )}>
                          {format(day, "d")}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1 overflow-y-auto max-h-20 scrollbar-none">
                        {dayBookings.map((b) => (
                          <div
                            key={b.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedBooking(b);
                            }}
                            className={cn(
                              "px-1.5 py-0.5 rounded text-[10px] truncate cursor-pointer border shadow-sm",
                              pkgColors(b.package_id)
                            )}
                            data-testid={`booking-pill-${b.id}`}
                          >
                            {b.client_name}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <div className="col-span-1 flex flex-col gap-4 min-h-0">
            {selectedBooking ? (
              <Fade direction="right" className="h-full">
                <Card className="h-full flex flex-col overflow-hidden border-pink-100 bg-pink-50/30 dark:bg-pink-900/10 dark:border-pink-900">
                  <div className="p-4 border-b flex items-center justify-between bg-white dark:bg-card">
                    <h3 className="font-bold font-heading text-sm">Booking Details</h3>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setSelectedBooking(null)}>
                      <X className="size-4" />
                    </Button>
                  </div>
                  <ScrollArea className="flex-1">
                    <div className="p-4 flex flex-col gap-4">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Booking ID</span>
                          <StatusBadge status={selectedBooking.booking_status} variant={bookingStatusConfig[selectedBooking.booking_status].variant} />
                        </div>
                        <p className="text-lg font-bold" data-testid="detail-id">{selectedBooking.id}</p>
                      </div>

                      <Separator />

                      <div>
                        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Client</span>
                        <p className="font-semibold text-sm" data-testid="detail-name">{selectedBooking.client_name}</p>
                        <p className="text-xs text-muted-foreground">{selectedBooking.client_phone}</p>
                        <p className="text-xs text-muted-foreground">{selectedBooking.client_email}</p>
                      </div>

                      <div>
                        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Tour Package</span>
                        <p className="text-xs font-medium leading-relaxed" data-testid="detail-package">{selectedBooking.package_name}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Travel Date</span>
                          <p className="text-xs font-medium">{format(new Date(selectedBooking.travel_date), "dd MMM yyyy")}</p>
                        </div>
                        <div>
                          <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Passengers</span>
                          <p className="text-xs font-medium">{selectedBooking.passengers} Pax</p>
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Financials</span>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-muted-foreground">Total</span>
                          <span className="text-xs font-bold">₹{selectedBooking.total_amount.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between mt-0.5">
                          <span className="text-xs text-muted-foreground">Balance Due</span>
                          <span className={cn("text-xs font-bold", selectedBooking.balance_due > 0 ? "text-amber-600" : "text-green-600")}>
                            ₹{selectedBooking.balance_due.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <div className="pt-2">
                        <Button 
                          className="w-full text-white text-xs h-8" 
                          style={{ backgroundColor: "#E91E63" }}
                          onClick={() => window.location.href = `/events/bookings/${selectedBooking.id}`}
                          data-testid="button-view-full"
                        >
                          View Full Details
                        </Button>
                      </div>
                    </div>
                  </ScrollArea>
                </Card>
              </Fade>
            ) : (
              <div className="h-full rounded-xl border-2 border-dashed flex flex-col items-center justify-center p-6 text-center text-muted-foreground bg-muted/10">
                <CalendarIcon className="size-8 mb-2 opacity-20" />
                <p className="text-xs">Select a booking pill to view details</p>
              </div>
            )}
          </div>
        </div>
      </PageTransition>
    </PageShell>
  );
}
