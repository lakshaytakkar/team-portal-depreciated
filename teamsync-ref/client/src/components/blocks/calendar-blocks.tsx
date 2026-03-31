import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
} from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  isSameMonth,
  isSameDay,
  isToday,
  getHours,
  getMinutes,
  differenceInMinutes,
  startOfDay,
} from "date-fns";

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end?: Date;
  color?: string;
  allDay?: boolean;
}

interface MonthCalendarProps {
  events?: CalendarEvent[];
  date?: Date;
  onDateChange?: (date: Date) => void;
  onEventClick?: (event: CalendarEvent) => void;
  className?: string;
}

export function MonthCalendar({
  events = [],
  date,
  onDateChange,
  onEventClick,
  className,
}: MonthCalendarProps) {
  const [currentDate, setCurrentDate] = useState(date ?? new Date());

  const handlePrev = () => {
    const next = subMonths(currentDate, 1);
    setCurrentDate(next);
    onDateChange?.(next);
  };

  const handleNext = () => {
    const next = addMonths(currentDate, 1);
    setCurrentDate(next);
    onDateChange?.(next);
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    onDateChange?.(today);
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const weeks: Date[][] = [];
  let day = calStart;
  while (day <= calEnd) {
    const week: Date[] = [];
    for (let i = 0; i < 7; i++) {
      week.push(day);
      day = addDays(day, 1);
    }
    weeks.push(week);
  }

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const getEventsForDay = (d: Date) =>
    events.filter((e) => isSameDay(e.start, d));

  return (
    <div className={cn("w-full", className)} data-testid="month-calendar">
      <div className="flex items-center justify-between gap-2 mb-4 flex-wrap">
        <h3
          className="text-lg font-semibold"
          data-testid="text-month-calendar-title"
        >
          {format(currentDate, "MMMM yyyy")}
        </h3>
        <div className="flex items-center gap-1">
          <Button
            size="icon"
            variant="ghost"
            onClick={handlePrev}
            data-testid="button-month-prev"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleToday}
            data-testid="button-month-today"
          >
            Today
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={handleNext}
            data-testid="button-month-next"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px bg-border rounded-md overflow-hidden">
        {dayNames.map((name) => (
          <div
            key={name}
            className="bg-muted px-2 py-2 text-center text-xs font-medium text-muted-foreground"
          >
            {name}
          </div>
        ))}
        {weeks.map((week, wi) =>
          week.map((d, di) => {
            const dayEvents = getEventsForDay(d);
            const inMonth = isSameMonth(d, currentDate);
            const today = isToday(d);
            return (
              <div
                key={`${wi}-${di}`}
                className={cn(
                  "bg-card min-h-[5rem] p-1.5 text-sm",
                  !inMonth && "opacity-40"
                )}
                data-testid={`month-cell-${format(d, "yyyy-MM-dd")}`}
              >
                <span
                  className={cn(
                    "inline-flex items-center justify-center h-6 w-6 rounded-full text-xs",
                    today && "bg-primary text-primary-foreground font-bold"
                  )}
                >
                  {format(d, "d")}
                </span>
                <div className="mt-1 space-y-0.5">
                  {dayEvents.slice(0, 3).map((ev) => (
                    <button
                      key={ev.id}
                      onClick={() => onEventClick?.(ev)}
                      className="flex items-center gap-1 w-full text-left truncate text-[10px] leading-tight rounded px-1 py-0.5 hover-elevate"
                      style={{
                        backgroundColor: ev.color
                          ? `${ev.color}20`
                          : undefined,
                        color: ev.color || undefined,
                      }}
                      data-testid={`month-event-${ev.id}`}
                    >
                      <span
                        className="h-1.5 w-1.5 rounded-full shrink-0"
                        style={{
                          backgroundColor:
                            ev.color || "hsl(var(--primary))",
                        }}
                      />
                      <span className="truncate">{ev.title}</span>
                    </button>
                  ))}
                  {dayEvents.length > 3 && (
                    <span className="text-[10px] text-muted-foreground px-1">
                      +{dayEvents.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

const HOUR_HEIGHT = 60;
const HOURS = Array.from({ length: 24 }, (_, i) => i);

function formatHour(h: number) {
  if (h === 0) return "12 AM";
  if (h < 12) return `${h} AM`;
  if (h === 12) return "12 PM";
  return `${h - 12} PM`;
}

interface TimeGridEvent {
  event: CalendarEvent;
  top: number;
  height: number;
}

function layoutEventsForDay(
  events: CalendarEvent[],
  day: Date
): TimeGridEvent[] {
  const dayStart = startOfDay(day);
  return events
    .filter((e) => !e.allDay && isSameDay(e.start, day))
    .map((e) => {
      const startMins =
        getHours(e.start) * 60 + getMinutes(e.start);
      const endDate = e.end ?? addDays(e.start, 0);
      const duration = e.end
        ? Math.max(differenceInMinutes(e.end, e.start), 30)
        : 60;
      return {
        event: e,
        top: (startMins / 60) * HOUR_HEIGHT,
        height: (duration / 60) * HOUR_HEIGHT,
      };
    });
}

interface WeekCalendarProps {
  events?: CalendarEvent[];
  date?: Date;
  onDateChange?: (date: Date) => void;
  onEventClick?: (event: CalendarEvent) => void;
  className?: string;
}

export function WeekCalendar({
  events = [],
  date,
  onDateChange,
  onEventClick,
  className,
}: WeekCalendarProps) {
  const [currentDate, setCurrentDate] = useState(date ?? new Date());
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });

  const handlePrev = () => {
    const next = subWeeks(currentDate, 1);
    setCurrentDate(next);
    onDateChange?.(next);
  };

  const handleNext = () => {
    const next = addWeeks(currentDate, 1);
    setCurrentDate(next);
    onDateChange?.(next);
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    onDateChange?.(today);
  };

  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  return (
    <div className={cn("w-full", className)} data-testid="week-calendar">
      <div className="flex items-center justify-between gap-2 mb-4 flex-wrap">
        <h3
          className="text-lg font-semibold"
          data-testid="text-week-calendar-title"
        >
          {format(weekStart, "MMM d")} –{" "}
          {format(addDays(weekStart, 6), "MMM d, yyyy")}
        </h3>
        <div className="flex items-center gap-1">
          <Button
            size="icon"
            variant="ghost"
            onClick={handlePrev}
            data-testid="button-week-prev"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleToday}
            data-testid="button-week-today"
          >
            Today
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={handleNext}
            data-testid="button-week-next"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="border rounded-md overflow-auto max-h-[600px]">
        <div className="grid grid-cols-[3.5rem_repeat(7,1fr)] sticky top-0 z-10 bg-muted border-b">
          <div className="border-r" />
          {days.map((d) => (
            <div
              key={d.toISOString()}
              className={cn(
                "px-2 py-2 text-center text-xs font-medium border-r last:border-r-0",
                isToday(d) && "text-primary font-bold"
              )}
            >
              <div>{format(d, "EEE")}</div>
              <div
                className={cn(
                  "inline-flex items-center justify-center h-6 w-6 rounded-full text-sm mt-0.5",
                  isToday(d) && "bg-primary text-primary-foreground"
                )}
              >
                {format(d, "d")}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-[3.5rem_repeat(7,1fr)]">
          <div className="border-r">
            {HOURS.map((h) => (
              <div
                key={h}
                className="border-b text-[10px] text-muted-foreground text-right pr-1 pt-1"
                style={{ height: HOUR_HEIGHT }}
              >
                {formatHour(h)}
              </div>
            ))}
          </div>
          {days.map((d) => {
            const laid = layoutEventsForDay(events, d);
            return (
              <div
                key={d.toISOString()}
                className="relative border-r last:border-r-0"
              >
                {HOURS.map((h) => (
                  <div
                    key={h}
                    className="border-b"
                    style={{ height: HOUR_HEIGHT }}
                  />
                ))}
                {laid.map((le) => (
                  <button
                    key={le.event.id}
                    onClick={() => onEventClick?.(le.event)}
                    className="absolute left-0.5 right-0.5 rounded px-1 py-0.5 text-[10px] leading-tight truncate text-left overflow-hidden"
                    style={{
                      top: le.top,
                      height: Math.max(le.height, 20),
                      backgroundColor: le.event.color
                        ? `${le.event.color}30`
                        : "hsl(var(--primary) / 0.15)",
                      color:
                        le.event.color || "hsl(var(--primary))",
                      borderLeft: `2px solid ${le.event.color || "hsl(var(--primary))"}`,
                    }}
                    data-testid={`week-event-${le.event.id}`}
                  >
                    {le.event.title}
                  </button>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

interface DayCalendarProps {
  events?: CalendarEvent[];
  date?: Date;
  onDateChange?: (date: Date) => void;
  onEventClick?: (event: CalendarEvent) => void;
  className?: string;
}

export function DayCalendar({
  events = [],
  date,
  onDateChange,
  onEventClick,
  className,
}: DayCalendarProps) {
  const [currentDate, setCurrentDate] = useState(date ?? new Date());

  const handlePrev = () => {
    const next = addDays(currentDate, -1);
    setCurrentDate(next);
    onDateChange?.(next);
  };

  const handleNext = () => {
    const next = addDays(currentDate, 1);
    setCurrentDate(next);
    onDateChange?.(next);
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    onDateChange?.(today);
  };

  const laid = layoutEventsForDay(events, currentDate);
  const allDayEvents = events.filter(
    (e) => e.allDay && isSameDay(e.start, currentDate)
  );

  return (
    <div className={cn("w-full", className)} data-testid="day-calendar">
      <div className="flex items-center justify-between gap-2 mb-4 flex-wrap">
        <h3
          className="text-lg font-semibold"
          data-testid="text-day-calendar-title"
        >
          {format(currentDate, "EEEE, MMMM d, yyyy")}
        </h3>
        <div className="flex items-center gap-1">
          <Button
            size="icon"
            variant="ghost"
            onClick={handlePrev}
            data-testid="button-day-prev"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleToday}
            data-testid="button-day-today"
          >
            Today
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={handleNext}
            data-testid="button-day-next"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {allDayEvents.length > 0 && (
        <div className="mb-2 flex items-center gap-2 flex-wrap" data-testid="day-allday-events">
          <span className="text-xs text-muted-foreground mr-1">All day:</span>
          {allDayEvents.map((ev) => (
            <Badge
              key={ev.id}
              variant="secondary"
              className="cursor-pointer"
              onClick={() => onEventClick?.(ev)}
              style={{
                backgroundColor: ev.color ? `${ev.color}20` : undefined,
                color: ev.color || undefined,
              }}
              data-testid={`day-allday-event-${ev.id}`}
            >
              {ev.title}
            </Badge>
          ))}
        </div>
      )}

      <div className="border rounded-md overflow-auto max-h-[600px]">
        <div className="grid grid-cols-[3.5rem_1fr]">
          <div className="border-r">
            {HOURS.map((h) => (
              <div
                key={h}
                className="border-b text-[10px] text-muted-foreground text-right pr-1 pt-1"
                style={{ height: HOUR_HEIGHT }}
              >
                {formatHour(h)}
              </div>
            ))}
          </div>
          <div className="relative">
            {HOURS.map((h) => (
              <div
                key={h}
                className="border-b"
                style={{ height: HOUR_HEIGHT }}
              />
            ))}
            {laid.map((le) => (
              <button
                key={le.event.id}
                onClick={() => onEventClick?.(le.event)}
                className="absolute left-1 right-1 rounded px-2 py-1 text-xs truncate text-left overflow-hidden"
                style={{
                  top: le.top,
                  height: Math.max(le.height, 24),
                  backgroundColor: le.event.color
                    ? `${le.event.color}30`
                    : "hsl(var(--primary) / 0.15)",
                  color: le.event.color || "hsl(var(--primary))",
                  borderLeft: `3px solid ${le.event.color || "hsl(var(--primary))"}`,
                }}
                data-testid={`day-event-${le.event.id}`}
              >
                <span className="font-medium">{le.event.title}</span>
                <span className="ml-2 opacity-70">
                  {format(le.event.start, "h:mm a")}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

interface AgendaViewProps {
  events?: CalendarEvent[];
  days?: number;
  date?: Date;
  onEventClick?: (event: CalendarEvent) => void;
  className?: string;
}

export function AgendaView({
  events = [],
  days = 14,
  date,
  onEventClick,
  className,
}: AgendaViewProps) {
  const startDate = date ?? new Date();

  const grouped = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (let i = 0; i < days; i++) {
      const d = addDays(startDate, i);
      const key = format(d, "yyyy-MM-dd");
      const dayEvents = events
        .filter((e) => isSameDay(e.start, d))
        .sort((a, b) => a.start.getTime() - b.start.getTime());
      if (dayEvents.length > 0) {
        map.set(key, dayEvents);
      }
    }
    return map;
  }, [events, days, startDate]);

  if (grouped.size === 0) {
    return (
      <div
        className="py-8 text-center text-sm text-muted-foreground"
        data-testid="agenda-empty"
      >
        No upcoming events
      </div>
    );
  }

  return (
    <div className={cn("w-full", className)} data-testid="agenda-view">
      {Array.from(grouped.entries()).map(([dateKey, dayEvents]) => {
        const d = new Date(dateKey + "T00:00:00");
        return (
          <div key={dateKey} className="mb-4" data-testid={`agenda-day-${dateKey}`}>
            <div className="flex items-center gap-2 mb-2">
              <span
                className={cn(
                  "inline-flex items-center justify-center h-8 w-8 rounded-full text-sm font-medium",
                  isToday(d) && "bg-primary text-primary-foreground"
                )}
              >
                {format(d, "d")}
              </span>
              <div>
                <span className="text-sm font-medium">
                  {format(d, "EEEE")}
                </span>
                <span className="text-xs text-muted-foreground ml-2">
                  {format(d, "MMM yyyy")}
                </span>
              </div>
            </div>
            <div className="divide-y ml-10">
              {dayEvents.map((ev) => (
                <button
                  key={ev.id}
                  onClick={() => onEventClick?.(ev)}
                  className="flex items-center gap-3 w-full text-left py-2.5 px-2 rounded hover-elevate"
                  data-testid={`agenda-event-${ev.id}`}
                >
                  <span
                    className="h-2.5 w-2.5 rounded-full shrink-0"
                    style={{
                      backgroundColor:
                        ev.color || "hsl(var(--primary))",
                    }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">
                      {ev.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {ev.allDay
                        ? "All day"
                        : ev.end
                          ? `${format(ev.start, "h:mm a")} – ${format(ev.end, "h:mm a")}`
                          : format(ev.start, "h:mm a")}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

type CalendarViewType = "month" | "week" | "day" | "agenda";

interface CalendarBlockProps {
  events?: CalendarEvent[];
  defaultView?: CalendarViewType;
  date?: Date;
  onDateChange?: (date: Date) => void;
  onEventClick?: (event: CalendarEvent) => void;
  className?: string;
}

export function CalendarBlock({
  events = [],
  defaultView = "month",
  date,
  onDateChange,
  onEventClick,
  className,
}: CalendarBlockProps) {
  const [view, setView] = useState<CalendarViewType>(defaultView);

  return (
    <Card className={cn("w-full", className)} data-testid="calendar-block">
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          Calendar
        </CardTitle>
        <Tabs
          value={view}
          onValueChange={(v) => setView(v as CalendarViewType)}
        >
          <TabsList data-testid="calendar-view-tabs">
            <TabsTrigger value="month" data-testid="tab-month">
              Month
            </TabsTrigger>
            <TabsTrigger value="week" data-testid="tab-week">
              Week
            </TabsTrigger>
            <TabsTrigger value="day" data-testid="tab-day">
              Day
            </TabsTrigger>
            <TabsTrigger value="agenda" data-testid="tab-agenda">
              Agenda
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        {view === "month" && (
          <MonthCalendar
            events={events}
            date={date}
            onDateChange={onDateChange}
            onEventClick={onEventClick}
          />
        )}
        {view === "week" && (
          <WeekCalendar
            events={events}
            date={date}
            onDateChange={onDateChange}
            onEventClick={onEventClick}
          />
        )}
        {view === "day" && (
          <DayCalendar
            events={events}
            date={date}
            onDateChange={onDateChange}
            onEventClick={onEventClick}
          />
        )}
        {view === "agenda" && (
          <AgendaView
            events={events}
            date={date}
            onEventClick={onEventClick}
          />
        )}
      </CardContent>
    </Card>
  );
}
