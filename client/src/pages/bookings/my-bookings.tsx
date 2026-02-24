import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Search, Loader2, CheckCircle2, XCircle, Clock, UserX, Calendar, RefreshCw, MessageCircle, Mail, Copy, ExternalLink } from "lucide-react";

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
  cancelToken?: string;
  createdAt: string;
}

interface BookingType {
  id: string;
  title: string;
  slug: string;
  duration: number;
  color: string;
}

function statusBadge(status: string) {
  switch (status) {
    case "confirmed": return <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400">Confirmed</Badge>;
    case "completed": return <Badge className="bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400">Completed</Badge>;
    case "cancelled": return <Badge variant="destructive">Cancelled</Badge>;
    case "no_show": return <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400">No Show</Badge>;
    case "rescheduled": return <Badge variant="secondary">Rescheduled</Badge>;
    default: return <Badge variant="secondary">{status}</Badge>;
  }
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

export default function MyBookingsPage() {
  const { toast } = useToast();
  const [tab, setTab] = useState("upcoming");
  const [search, setSearch] = useState("");
  const [actionBooking, setActionBooking] = useState<BookingRecord | null>(null);
  const [actionType, setActionType] = useState<"cancel" | "status">("cancel");
  const [cancelReason, setCancelReason] = useState("");
  const [newStatus, setNewStatus] = useState("completed");

  const { data: allBookings = [], isLoading, refetch } = useQuery<BookingRecord[]>({
    queryKey: ["/api/bookings"],
  });

  const { data: types = [] } = useQuery<BookingType[]>({
    queryKey: ["/api/booking-types"],
  });

  const typesMap = Object.fromEntries(types.map(t => [t.id, t]));

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const res = await apiRequest("PATCH", `/api/bookings/${id}`, updates);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      toast({ title: "Booking updated!" });
      setActionBooking(null);
      setCancelReason(""); setNewStatus("completed");
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const now = new Date();
  const filtered = allBookings.filter(b => {
    const matchesSearch = !search || b.customerName.toLowerCase().includes(search.toLowerCase()) || b.customerEmail.toLowerCase().includes(search.toLowerCase());
    const isUpcoming = new Date(b.startTime) >= now && b.status !== "cancelled";
    const isPast = new Date(b.startTime) < now || b.status === "cancelled" || b.status === "completed" || b.status === "no_show";
    if (tab === "upcoming") return matchesSearch && isUpcoming;
    return matchesSearch && isPast;
  });

  const stats = {
    total: allBookings.length,
    upcoming: allBookings.filter(b => new Date(b.startTime) >= now && b.status === "confirmed").length,
    completed: allBookings.filter(b => b.status === "completed").length,
    noShow: allBookings.filter(b => b.status === "no_show").length,
  };

  const shareWhatsapp = (b: BookingRecord) => {
    const bt = typesMap[b.bookingTypeId];
    const start = new Date(b.startTime);
    const msg = encodeURIComponent(`Hello ${b.customerName},\n\nYour booking is confirmed!\n\n📅 *${bt?.title || "Meeting"}*\n🗓 ${start.toLocaleDateString("en-IN", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })}\n⏰ ${start.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })} - ${new Date(b.endTime).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}\n${b.meetingLink ? `\n🔗 Join: ${b.meetingLink}` : ""}\n\nLooking forward to speaking with you!\n- Suprans Team`);
    const phone = b.customerPhone?.replace(/[^0-9]/g, "") || "";
    window.open(`https://wa.me/${phone.length === 10 ? "91" + phone : phone}?text=${msg}`, "_blank");
  };

  return (
    <div className="px-6 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight" data-testid="text-page-title">My Bookings</h1>
          <p className="text-sm text-muted-foreground">View and manage your scheduled meetings</p>
        </div>
        <Button variant="outline" size="icon" onClick={() => refetch()} data-testid="button-refresh">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Bookings", value: stats.total, icon: Calendar, color: "text-foreground" },
          { label: "Upcoming", value: stats.upcoming, icon: Clock, color: "text-blue-600" },
          { label: "Completed", value: stats.completed, icon: CheckCircle2, color: "text-green-600" },
          { label: "No Shows", value: stats.noShow, icon: UserX, color: "text-yellow-600" },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="shadow-[0px_1px_2px_0px_rgba(13,13,18,0.06)] dark:shadow-none">
            <CardContent className="pt-5 pb-4 px-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{label}</p>
                  <p className={`text-2xl font-bold mt-1 ${color}`} data-testid={`stat-${label.toLowerCase().replace(/\s/g, "-")}`}>{value}</p>
                </div>
                <Icon className={`h-5 w-5 ${color} opacity-50`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="upcoming" data-testid="tab-upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="past" data-testid="tab-past">Past</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" data-testid="input-search" />
        </div>
      </div>

      <Card className="shadow-[0px_1px_2px_0px_rgba(13,13,18,0.06)] dark:shadow-none">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Meeting</TableHead>
              <TableHead>Date & Time</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8"><Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" /></TableCell></TableRow>
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No bookings found</TableCell></TableRow>
            ) : filtered.map(b => {
              const bt = typesMap[b.bookingTypeId];
              const start = new Date(b.startTime);
              return (
                <TableRow key={b.id} data-testid={`row-booking-${b.id}`}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-sm">{b.customerName}</p>
                      <p className="text-xs text-muted-foreground">{b.customerEmail}</p>
                      {b.customerPhone && <p className="text-xs text-muted-foreground">{b.customerPhone}</p>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {bt && <div className="w-2 h-2 rounded-full" style={{ backgroundColor: bt.color }} />}
                      <span className="text-sm">{bt?.title || "Meeting"}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm font-medium">{start.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</p>
                      <p className="text-xs text-muted-foreground">{start.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })} - {new Date(b.endTime).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</p>
                    </div>
                  </TableCell>
                  <TableCell>{statusBadge(b.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {b.status === "confirmed" && (
                        <>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setActionType("status"); setNewStatus("completed"); setActionBooking(b); }} title="Update Status" data-testid={`button-update-status-${b.id}`}>
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setActionType("cancel"); setActionBooking(b); }} title="Cancel" data-testid={`button-cancel-${b.id}`}>
                            <XCircle className="h-4 w-4 text-destructive" />
                          </Button>
                        </>
                      )}
                      {b.customerPhone && (
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => shareWhatsapp(b)} title="WhatsApp" data-testid={`button-whatsapp-${b.id}`}>
                          <MessageCircle className="h-4 w-4 text-green-600" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => generateIcs(b, bt?.title || "Meeting")} title="Download .ics" data-testid={`button-ics-${b.id}`}>
                        <Calendar className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={!!actionBooking} onOpenChange={v => !v && setActionBooking(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{actionType === "cancel" ? "Cancel Booking" : "Update Status"}</DialogTitle>
            <DialogDescription>
              {actionBooking && `${actionBooking.customerName} - ${new Date(actionBooking.startTime).toLocaleDateString("en-IN")}`}
            </DialogDescription>
          </DialogHeader>
          {actionType === "cancel" ? (
            <div className="space-y-4 py-2">
              <div>
                <Label>Cancellation Reason</Label>
                <Textarea value={cancelReason} onChange={e => setCancelReason(e.target.value)} placeholder="Reason for cancellation..." rows={3} data-testid="input-cancel-reason" />
              </div>
            </div>
          ) : (
            <div className="space-y-4 py-2">
              <div>
                <Label>New Status</Label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger data-testid="select-new-status"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="no_show">No Show</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionBooking(null)}>Cancel</Button>
            <Button onClick={() => {
              if (!actionBooking) return;
              if (actionType === "cancel") {
                updateMutation.mutate({ id: actionBooking.id, updates: { status: "cancelled", cancellationReason: cancelReason } });
              } else {
                updateMutation.mutate({ id: actionBooking.id, updates: { status: newStatus } });
              }
            }} disabled={updateMutation.isPending} variant={actionType === "cancel" ? "destructive" : "default"} data-testid="button-confirm-action">
              {updateMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {actionType === "cancel" ? "Cancel Booking" : "Update Status"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}