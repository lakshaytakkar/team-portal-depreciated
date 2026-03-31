import { useState } from "react";
import { useStore } from "@/lib/store";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Calendar, Clock, MapPin, Pencil, Trash2, Video, Phone, Users } from "lucide-react";
import { format, isPast, isToday, isTomorrow } from "date-fns";
import type { Appointment, Contact, User } from "@shared/schema";

const TYPES = ["meeting", "call", "video_call", "site_visit", "follow_up"];
const STATUSES = ["scheduled", "completed", "cancelled", "rescheduled"];

function AppointmentForm({ appointment, contacts, users, onSave, onCancel }: {
  appointment?: Appointment;
  contacts: Contact[];
  users: User[];
  onSave: (data: any) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    title: appointment?.title || "",
    type: appointment?.type || "meeting",
    dateTime: appointment?.dateTime ? format(new Date(appointment.dateTime), "yyyy-MM-dd'T'HH:mm") : "",
    duration: appointment?.duration || 30,
    contactId: appointment?.contactId || "",
    location: appointment?.location || "",
    notes: appointment?.notes || "",
    status: appointment?.status || "scheduled",
    assignedTo: appointment?.assignedTo || "",
  });

  return (
    <div className="grid gap-4 py-4">
      <div className="space-y-2">
        <Label>Title *</Label>
        <Input data-testid="input-appt-title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Type</Label>
          <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v }))}>
            <SelectTrigger data-testid="select-appt-type"><SelectValue /></SelectTrigger>
            <SelectContent>
              {TYPES.map(t => <SelectItem key={t} value={t}>{t.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Date & Time *</Label>
          <Input data-testid="input-appt-datetime" type="datetime-local" value={form.dateTime} onChange={e => setForm(f => ({ ...f, dateTime: e.target.value }))} />
        </div>
        <div className="space-y-2">
          <Label>Duration (min)</Label>
          <Input data-testid="input-appt-duration" type="number" value={form.duration} onChange={e => setForm(f => ({ ...f, duration: parseInt(e.target.value) || 30 }))} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Contact</Label>
          <Select value={form.contactId} onValueChange={v => setForm(f => ({ ...f, contactId: v }))}>
            <SelectTrigger data-testid="select-appt-contact"><SelectValue placeholder="Select contact" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No contact</SelectItem>
              {contacts.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Location</Label>
          <Input data-testid="input-appt-location" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Assigned To</Label>
          <Select value={form.assignedTo} onValueChange={v => setForm(f => ({ ...f, assignedTo: v }))}>
            <SelectTrigger data-testid="select-appt-assigned"><SelectValue placeholder="Select user" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Unassigned</SelectItem>
              {users.map(u => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Status</Label>
          <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
            <SelectTrigger data-testid="select-appt-status"><SelectValue /></SelectTrigger>
            <SelectContent>
              {STATUSES.map(s => <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label>Notes</Label>
        <Textarea data-testid="input-appt-notes" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={3} />
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel} data-testid="button-cancel">Cancel</Button>
        <Button onClick={() => {
          onSave({
            ...form,
            dateTime: form.dateTime ? new Date(form.dateTime).toISOString() : null,
            contactId: form.contactId === "none" ? null : form.contactId || null,
            assignedTo: form.assignedTo === "none" ? null : form.assignedTo || null,
          });
        }} disabled={!form.title || !form.dateTime} data-testid="button-save-appt">
          {appointment ? "Update" : "Create"} Appointment
        </Button>
      </DialogFooter>
    </div>
  );
}

const typeIcon = (type: string) => {
  switch (type) {
    case "call": return <Phone className="h-4 w-4" />;
    case "video_call": return <Video className="h-4 w-4" />;
    case "site_visit": return <MapPin className="h-4 w-4" />;
    default: return <Users className="h-4 w-4" />;
  }
};

const statusBadge = (status: string) => {
  switch (status) {
    case "completed": return "default" as const;
    case "cancelled": return "destructive" as const;
    case "rescheduled": return "secondary" as const;
    default: return "outline" as const;
  }
};

export default function AppointmentsPage() {
  const { currentTeamId } = useStore();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAppt, setEditingAppt] = useState<Appointment | undefined>();
  const [statusFilter, setStatusFilter] = useState("all");

  const appointmentsUrl = (() => {
    const params = new URLSearchParams();
    if (currentTeamId) params.set("team_id", currentTeamId);
    if (statusFilter !== "all") params.set("status", statusFilter);
    const qs = params.toString();
    return `/api/appointments${qs ? `?${qs}` : ""}`;
  })();

  const { data: appointments = [], isLoading } = useQuery<Appointment[]>({
    queryKey: [appointmentsUrl],
  });
  const { data: contacts = [] } = useQuery<Contact[]>({ queryKey: ["/api/contacts"] });
  const { data: users = [] } = useQuery<User[]>({ queryKey: ["/api/users"] });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/appointments", { ...data, teamId: currentTeamId }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/appointments"] }); setDialogOpen(false); toast({ title: "Appointment created" }); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => apiRequest("PATCH", `/api/appointments/${id}`, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/appointments"] }); setDialogOpen(false); setEditingAppt(undefined); toast({ title: "Appointment updated" }); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/appointments/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/appointments"] }); toast({ title: "Appointment deleted" }); },
  });

  const getDateLabel = (dt: string) => {
    const d = new Date(dt);
    if (isToday(d)) return "Today";
    if (isTomorrow(d)) return "Tomorrow";
    return format(d, "EEE, MMM d");
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-page-title">Appointments</h1>
          <p className="text-muted-foreground">{appointments.length} appointments</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]" data-testid="select-status-filter"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {STATUSES.map(s => <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>)}
            </SelectContent>
          </Select>
          <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) setEditingAppt(undefined); }}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-appointment"><Plus className="h-4 w-4 mr-2" /> New Appointment</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader><DialogTitle>{editingAppt ? "Edit Appointment" : "New Appointment"}</DialogTitle></DialogHeader>
              <AppointmentForm appointment={editingAppt} contacts={contacts} users={users} onSave={(data) => { editingAppt ? updateMutation.mutate({ id: editingAppt.id, data }) : createMutation.mutate(data); }} onCancel={() => { setDialogOpen(false); setEditingAppt(undefined); }} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="space-y-3">
        {appointments.length === 0 ? (
          <Card><CardContent className="py-8 text-center text-muted-foreground">No appointments found. Schedule your first appointment.</CardContent></Card>
        ) : (
          appointments.map(appt => {
            const dt = new Date(appt.dateTime);
            const past = isPast(dt) && appt.status === "scheduled";
            return (
              <Card key={appt.id} className={past ? "border-destructive/50" : ""} data-testid={`card-appointment-${appt.id}`}>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${past ? "bg-destructive/10" : "bg-primary/10"}`}>
                    {typeIcon(appt.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium" data-testid={`text-appt-title-${appt.id}`}>{appt.title}</p>
                      <Badge variant={statusBadge(appt.status)}>{appt.status}</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{getDateLabel(appt.dateTime as any)}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{format(dt, "h:mm a")} ({appt.duration} min)</span>
                      {appt.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{appt.location}</span>}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => { setEditingAppt(appt); setDialogOpen(true); }} data-testid={`button-edit-appt-${appt.id}`}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => { if (confirm("Delete?")) deleteMutation.mutate(appt.id); }} data-testid={`button-delete-appt-${appt.id}`}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
