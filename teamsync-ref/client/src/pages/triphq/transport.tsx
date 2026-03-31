import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plane, Train, Bus, Car, Ship, MapPin, Plus, Edit2, Trash2, Upload, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { TRIPHQ_COLOR } from "@/lib/triphq-config";
import { SopModal, TutorialModal, SopTutorialButtons } from "@/components/sop/sop-modal";
import { SOP_REGISTRY } from "@/lib/sop-data";
import { PageShell, PageHeader, StatGrid, StatCard } from "@/components/layout";
import { FormDialog } from "@/components/ds/form-dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

const MODE_ICONS: Record<string, any> = { flight: Plane, train: Train, bus: Bus, taxi: Car, ferry: Ship, other: MapPin };
const STATUS_COLORS: Record<string, string> = { planned: "text-blue-700", booked: "text-amber-700", completed: "text-emerald-700" };

export default function TripHQTransport() {
  const { toast } = useToast();
  const [sopOpen, setSopOpen] = useState(false);
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);

  const { data: legs = [], isLoading } = useQuery<any[]>({ queryKey: ["/api/triphq/transport_legs"] });
  const { data: docs = [] } = useQuery<any[]>({ queryKey: ["/api/triphq/documents"] });

  const saveMutation = useMutation({
    mutationFn: async (body: any) => {
      if (editItem?.id) return apiRequest("PATCH", `/api/triphq/transport_legs/${editItem.id}`, body);
      return apiRequest("POST", "/api/triphq/transport_legs", body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/triphq/transport_legs"] });
      setFormOpen(false); setEditItem(null);
      toast({ title: editItem?.id ? "Leg updated" : "Leg added" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/triphq/transport_legs/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/triphq/transport_legs"] }); toast({ title: "Leg removed" }); },
  });

  const handleUpload = async (legId: string, file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("doc_type", "ticket");
    fd.append("entity_type", "transport");
    fd.append("entity_id", legId);
    await fetch("/api/triphq/upload", { method: "POST", body: fd });
    queryClient.invalidateQueries({ queryKey: ["/api/triphq/documents"] });
    toast({ title: "Ticket uploaded" });
  };

  const booked = legs.filter((l: any) => l.status === "booked" || l.status === "completed").length;

  const openCreate = () => { setEditItem(null); setFormOpen(true); };
  const openEdit = (l: any) => { setEditItem(l); setFormOpen(true); };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    saveMutation.mutate({
      leg_order: parseInt(fd.get("leg_order") as string),
      from_city: fd.get("from_city"),
      to_city: fd.get("to_city"),
      mode: fd.get("mode"),
      departure_time: fd.get("departure_time") ? new Date(fd.get("departure_time") as string).toISOString() : null,
      arrival_time: fd.get("arrival_time") ? new Date(fd.get("arrival_time") as string).toISOString() : null,
      booking_ref: fd.get("booking_ref") || null,
      status: fd.get("status") || "planned",
      notes: fd.get("notes") || null,
    });
  };

  if (isLoading) {
    return (<PageShell className="animate-pulse"><div className="h-16 bg-muted rounded-xl" /><div className="space-y-4">{[...Array(5)].map((_, i) => <div key={i} className="h-24 bg-muted rounded-xl" />)}</div></PageShell>);
  }

  return (
    <PageShell>
      <PageHeader title="Transport" subtitle={`${legs.length} legs · ${booked} booked`} actions={
        <div className="flex items-center gap-2">
          <SopTutorialButtons onSopClick={() => setSopOpen(true)} onTutorialClick={() => setTutorialOpen(true)} />
          <Button onClick={openCreate} style={{ backgroundColor: TRIPHQ_COLOR }} className="text-white" data-testid="button-add-leg"><Plus className="h-4 w-4 mr-2" />Add Leg</Button>
        </div>
      } />

      <StatGrid>
        <StatCard label="Total Legs" value={legs.length} icon={Plane} iconBg="rgba(8,145,178,0.1)" iconColor={TRIPHQ_COLOR} />
        <StatCard label="Booked" value={booked} icon={Clock} iconBg="rgba(16,185,129,0.1)" iconColor="#10B981" />
      </StatGrid>

      <div className="space-y-3">
        {legs.map((leg: any, idx: number) => {
          const ModeIcon = MODE_ICONS[leg.mode] || MapPin;
          const legDocs = docs.filter((d: any) => d.entityType === "transport" && d.entityId === leg.id);
          return (
            <div key={leg.id} className="relative" data-testid={`transport-${leg.id}`}>
              {idx < legs.length - 1 && <div className="absolute left-6 top-16 bottom-0 w-0.5 bg-border" />}
              <div className="flex items-start gap-4 p-4 border rounded-xl bg-card hover:shadow-sm transition-shadow">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${TRIPHQ_COLOR}15` }}>
                  <ModeIcon className="h-5 w-5" style={{ color: TRIPHQ_COLOR }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm">{leg.fromCity}</span>
                    <span className="text-muted-foreground">→</span>
                    <span className="font-semibold text-sm">{leg.toCity}</span>
                    <Badge variant="outline" className={`text-xs ${STATUS_COLORS[leg.status] || ""}`}>{leg.status}</Badge>
                    <Badge variant="secondary" className="text-xs capitalize">{leg.mode}</Badge>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                    {leg.departureTime && <span>Dep: {new Date(leg.departureTime).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>}
                    {leg.arrivalTime && <span>Arr: {new Date(leg.arrivalTime).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>}
                  </div>
                  {leg.bookingRef && <div className="text-xs text-muted-foreground mt-1">Ref: {leg.bookingRef}</div>}
                  {leg.notes && <p className="text-xs text-muted-foreground mt-1 italic">{leg.notes}</p>}
                  {legDocs.length > 0 && (
                    <div className="flex gap-1 mt-2">{legDocs.map((d: any) => <a key={d.id} href={d.fileUrl} target="_blank" rel="noopener noreferrer"><Badge variant="secondary" className="text-xs">{d.fileName}</Badge></a>)}</div>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <label className="cursor-pointer"><input type="file" className="hidden" accept="image/*,.pdf" onChange={(e) => { if (e.target.files?.[0]) handleUpload(leg.id, e.target.files[0]); }} /><div className="h-8 w-8 rounded-md border flex items-center justify-center hover:bg-muted"><Upload className="h-3.5 w-3.5 text-muted-foreground" /></div></label>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(leg)}><Edit2 className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => deleteMutation.mutate(leg.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <FormDialog open={formOpen} onOpenChange={setFormOpen} title={editItem?.id ? "Edit Leg" : "Add Leg"} onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div><label className="text-sm font-medium">Order #</label><Input name="leg_order" type="number" required defaultValue={editItem?.legOrder || legs.length + 1} data-testid="input-order" /></div>
            <div><label className="text-sm font-medium">From *</label><Input name="from_city" required defaultValue={editItem?.fromCity || ""} data-testid="input-from" /></div>
            <div><label className="text-sm font-medium">To *</label><Input name="to_city" required defaultValue={editItem?.toCity || ""} data-testid="input-to" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Mode *</label>
              <select name="mode" required defaultValue={editItem?.mode || "flight"} className="w-full border rounded-md px-3 py-2 text-sm" data-testid="select-mode">
                <option value="flight">Flight</option><option value="train">Train</option><option value="bus">Bus</option><option value="taxi">Taxi / DiDi</option><option value="ferry">Ferry</option><option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Status</label>
              <select name="status" defaultValue={editItem?.status || "planned"} className="w-full border rounded-md px-3 py-2 text-sm" data-testid="select-status">
                <option value="planned">Planned</option><option value="booked">Booked</option><option value="completed">Completed</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-sm font-medium">Departure</label><Input name="departure_time" type="datetime-local" defaultValue={editItem?.departureTime ? new Date(editItem.departureTime).toISOString().slice(0, 16) : ""} data-testid="input-departure" /></div>
            <div><label className="text-sm font-medium">Arrival</label><Input name="arrival_time" type="datetime-local" defaultValue={editItem?.arrivalTime ? new Date(editItem.arrivalTime).toISOString().slice(0, 16) : ""} data-testid="input-arrival" /></div>
          </div>
          <div><label className="text-sm font-medium">Booking Reference</label><Input name="booking_ref" defaultValue={editItem?.bookingRef || ""} data-testid="input-booking-ref" /></div>
          <div><label className="text-sm font-medium">Notes</label><Textarea name="notes" rows={2} defaultValue={editItem?.notes || ""} data-testid="input-notes" /></div>
        </div>
      </FormDialog>
      <SopModal open={sopOpen} onOpenChange={setSopOpen} config={SOP_REGISTRY["triphq-transport"].sop} color={TRIPHQ_COLOR} />
      <TutorialModal open={tutorialOpen} onOpenChange={setTutorialOpen} config={SOP_REGISTRY["triphq-transport"].tutorial} color={TRIPHQ_COLOR} />
    </PageShell>
  );
}
