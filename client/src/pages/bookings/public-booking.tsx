import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, IndianRupee, Calendar, ChevronLeft, ChevronRight, CheckCircle2, Loader2, Download, ArrowLeft, User } from "lucide-react";

interface BookingTypeInfo {
  id: string;
  title: string;
  slug: string;
  description?: string;
  duration: number;
  color: string;
  price: number;
  currency: string;
  location: string;
  hostName: string;
  hostAvatar?: string;
}

interface SlotData {
  slots: string[];
  blocked: boolean;
  reason?: string;
}

interface BookingResult {
  id: string;
  startTime: string;
  endTime: string;
  status: string;
  cancelToken: string;
  bookingType: BookingTypeInfo;
  hostName: string;
}

function generateIcsContent(booking: BookingResult) {
  const start = new Date(booking.startTime);
  const end = new Date(booking.endTime);
  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  return [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Suprans//Booking//EN",
    "BEGIN:VEVENT",
    `DTSTART:${fmt(start)}`, `DTEND:${fmt(end)}`,
    `SUMMARY:${booking.bookingType.title} with ${booking.hostName}`,
    `DESCRIPTION:Booking confirmed with ${booking.hostName}`,
    `UID:${booking.id}@suprans.in`,
    "END:VEVENT", "END:VCALENDAR",
  ].join("\r\n");
}

function downloadIcs(booking: BookingResult) {
  const ics = generateIcsContent(booking);
  const blob = new Blob([ics], { type: "text/calendar" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `booking-${booking.id.slice(0, 8)}.ics`;
  a.click();
  URL.revokeObjectURL(url);
}

function CalendarPicker({ selectedDate, onSelect, availableDays }: { selectedDate: string; onSelect: (d: string) => void; availableDays?: number[] }) {
  const [viewMonth, setViewMonth] = useState(() => {
    const today = new Date();
    return { year: today.getFullYear(), month: today.getMonth() };
  });

  const daysInMonth = new Date(viewMonth.year, viewMonth.month + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewMonth.year, viewMonth.month, 1).getDay();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const prevMonth = () => {
    setViewMonth(prev => prev.month === 0 ? { year: prev.year - 1, month: 11 } : { ...prev, month: prev.month - 1 });
  };
  const nextMonth = () => {
    setViewMonth(prev => prev.month === 11 ? { year: prev.year + 1, month: 0 } : { ...prev, month: prev.month + 1 });
  };

  const monthName = new Date(viewMonth.year, viewMonth.month).toLocaleDateString("en-IN", { month: "long", year: "numeric" });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" size="icon" onClick={prevMonth}><ChevronLeft className="h-4 w-4" /></Button>
        <span className="font-semibold text-sm">{monthName}</span>
        <Button variant="ghost" size="icon" onClick={nextMonth}><ChevronRight className="h-4 w-4" /></Button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(d => (
          <div key={d} className="text-xs font-medium text-muted-foreground py-1">{d}</div>
        ))}
        {Array.from({ length: firstDayOfWeek }).map((_, i) => <div key={`e-${i}`} />)}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const date = new Date(viewMonth.year, viewMonth.month, day);
          const dateStr = `${viewMonth.year}-${String(viewMonth.month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const isPast = date < today;
          const isSelected = dateStr === selectedDate;
          const dayOfWeek = date.getDay();
          const isAvailableDay = !availableDays || availableDays.includes(dayOfWeek);
          const isDisabled = isPast || !isAvailableDay;

          return (
            <button
              key={day}
              onClick={() => !isDisabled && onSelect(dateStr)}
              disabled={isDisabled}
              className={`h-9 w-9 rounded-full text-sm mx-auto flex items-center justify-center transition-colors
                ${isSelected ? "bg-primary text-primary-foreground font-bold" : ""}
                ${isDisabled ? "text-muted-foreground/30 cursor-not-allowed" : "hover:bg-primary/10 cursor-pointer"}
                ${!isSelected && !isDisabled ? "font-medium" : ""}
              `}
              data-testid={`date-${dateStr}`}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function PublicBookingPage() {
  const { slug } = useParams<{ slug: string }>();
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [step, setStep] = useState<"date" | "form" | "confirmed">("date");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [bookingResult, setBookingResult] = useState<BookingResult | null>(null);

  const { data: btInfo, isLoading: loadingBt, error: btError } = useQuery<BookingTypeInfo>({
    queryKey: ["/api/public/booking-types", slug],
    queryFn: async () => {
      const res = await fetch(`/api/public/booking-types/${slug}`);
      if (!res.ok) throw new Error("Booking type not found");
      return res.json();
    },
    enabled: !!slug,
  });

  const { data: slotData, isLoading: loadingSlots } = useQuery<SlotData>({
    queryKey: ["/api/public/availability", slug, selectedDate],
    queryFn: async () => {
      const res = await fetch(`/api/public/availability/${slug}/${selectedDate}`);
      return res.json();
    },
    enabled: !!slug && !!selectedDate,
  });

  const bookMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(`/api/public/book/${slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Booking failed");
      }
      return res.json();
    },
    onSuccess: (data) => {
      setBookingResult(data);
      setStep("confirmed");
    },
  });

  if (loadingBt) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (btError || !btInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-8 pb-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Booking Not Found</h2>
            <p className="text-muted-foreground">This booking link may be inactive or invalid.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === "confirmed" && bookingResult) {
    const start = new Date(bookingResult.startTime);
    const end = new Date(bookingResult.endTime);
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-8 pb-6 space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-950 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold">Booking Confirmed!</h2>
              <p className="text-sm text-muted-foreground mt-1">You'll receive a confirmation shortly</p>
            </div>
            <div className="bg-muted/50 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{start.toLocaleDateString("en-IN", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{start.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })} - {end.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })} IST</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>{bookingResult.hostName}</span>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Button onClick={() => downloadIcs(bookingResult)} variant="outline" className="w-full" data-testid="button-download-ics">
                <Download className="h-4 w-4 mr-2" /> Add to Calendar (.ics)
              </Button>
              <Button variant="ghost" onClick={() => { setStep("date"); setSelectedDate(""); setSelectedTime(""); setName(""); setEmail(""); setPhone(""); setNotes(""); setBookingResult(null); }} className="w-full text-sm" data-testid="button-book-another">
                Book another time
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full overflow-hidden">
        <div className="h-1.5" style={{ backgroundColor: btInfo.color }} />
        <CardContent className="p-0">
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border">
            <div className="p-6 space-y-4">
              <div>
                {btInfo.hostAvatar ? (
                  <img src={btInfo.hostAvatar} className="w-12 h-12 rounded-full mb-3" alt="" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                )}
                <p className="text-sm text-muted-foreground">{btInfo.hostName}</p>
                <h2 className="text-xl font-bold mt-1">{btInfo.title}</h2>
              </div>
              {btInfo.description && <p className="text-sm text-muted-foreground">{btInfo.description}</p>}
              <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-2"><Clock className="h-4 w-4" /> {btInfo.duration} minutes</span>
                <span className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {btInfo.location}</span>
                {btInfo.price > 0 && <span className="flex items-center gap-2"><IndianRupee className="h-4 w-4" /> ₹{btInfo.price}</span>}
              </div>
              {selectedDate && (
                <div className="pt-3 border-t">
                  <p className="text-sm font-medium">
                    {new Date(selectedDate + "T12:00:00").toLocaleDateString("en-IN", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })}
                  </p>
                  {selectedTime && <p className="text-sm text-muted-foreground">{selectedTime} IST</p>}
                </div>
              )}
            </div>

            <div className="p-6">
              {step === "date" ? (
                <div className="space-y-4">
                  <h3 className="font-semibold text-sm">Select a Date & Time</h3>
                  <CalendarPicker selectedDate={selectedDate} onSelect={(d) => { setSelectedDate(d); setSelectedTime(""); }} />
                  {selectedDate && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Available Times</h4>
                      {loadingSlots ? (
                        <div className="flex items-center justify-center py-4"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
                      ) : slotData?.blocked ? (
                        <p className="text-sm text-muted-foreground py-2">{slotData.reason || "No availability on this date"}</p>
                      ) : (slotData?.slots?.length || 0) === 0 ? (
                        <p className="text-sm text-muted-foreground py-2">No available slots for this date</p>
                      ) : (
                        <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                          {slotData?.slots.map(slot => (
                            <button
                              key={slot}
                              onClick={() => setSelectedTime(slot)}
                              className={`px-3 py-2 text-sm rounded-lg border transition-colors ${selectedTime === slot ? "bg-primary text-primary-foreground border-primary font-semibold" : "hover:border-primary/50 hover:bg-primary/5"}`}
                              data-testid={`slot-${slot}`}
                            >
                              {slot}
                            </button>
                          ))}
                        </div>
                      )}
                      {selectedTime && (
                        <Button onClick={() => setStep("form")} className="w-full mt-3" data-testid="button-next-step">
                          Continue
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <button onClick={() => setStep("date")} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
                    <ArrowLeft className="h-4 w-4" /> Change time
                  </button>
                  <h3 className="font-semibold text-sm">Enter Your Details</h3>
                  <div>
                    <Label>Name *</Label>
                    <Input value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" data-testid="input-booking-name" />
                  </div>
                  <div>
                    <Label>Email *</Label>
                    <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" data-testid="input-booking-email" />
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 9876543210" data-testid="input-booking-phone" />
                  </div>
                  <div>
                    <Label>Notes (optional)</Label>
                    <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Anything you'd like us to know..." rows={2} data-testid="input-booking-notes" />
                  </div>
                  {bookMutation.isError && (
                    <p className="text-sm text-destructive">{(bookMutation.error as Error).message}</p>
                  )}
                  <Button onClick={() => bookMutation.mutate({ customerName: name, customerEmail: email, customerPhone: phone, date: selectedDate, time: selectedTime, customerNotes: notes })} disabled={!name || !email || bookMutation.isPending} className="w-full" data-testid="button-confirm-booking">
                    {bookMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                    Confirm Booking
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}