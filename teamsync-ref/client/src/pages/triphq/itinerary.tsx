import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Calendar, MapPin, Hotel, Sun, Moon, Plus, Edit2, Trash2, Upload, ChevronDown, ChevronUp } from "lucide-react";
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

export default function TripHQItinerary() {
  const { toast } = useToast();
  const [sopOpen, setSopOpen] = useState(false);
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const { data: days = [], isLoading } = useQuery<any[]>({ queryKey: ["/api/triphq/itinerary_days"] });

  const saveMutation = useMutation({
    mutationFn: async (body: any) => {
      if (editItem?.id) {
        return apiRequest("PATCH", `/api/triphq/itinerary_days/${editItem.id}`, body);
      }
      return apiRequest("POST", "/api/triphq/itinerary_days", body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/triphq/itinerary_days"] });
      setFormOpen(false);
      setEditItem(null);
      toast({ title: editItem?.id ? "Day updated" : "Day added" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/triphq/itinerary_days/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/triphq/itinerary_days"] });
      toast({ title: "Day removed" });
    },
  });

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const openCreate = () => { setEditItem(null); setFormOpen(true); };
  const openEdit = (day: any) => { setEditItem(day); setFormOpen(true); };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    saveMutation.mutate({
      day_number: parseInt(fd.get("day_number") as string),
      date: fd.get("date"),
      city: fd.get("city"),
      morning_plan: fd.get("morning_plan") || null,
      evening_plan: fd.get("evening_plan") || null,
      hotel_name: fd.get("hotel_name") || null,
      notes: fd.get("notes") || null,
    });
  };

  const cities = [...new Set(days.map((d) => d.city))];

  if (isLoading) {
    return (
      <PageShell className="animate-pulse">
        <div className="h-16 bg-muted rounded-xl" />
        <div className="space-y-4">{[...Array(5)].map((_, i) => <div key={i} className="h-28 bg-muted rounded-xl" />)}</div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <PageHeader
        title="Itinerary"
        subtitle={`${days.length} days · ${cities.length} cities`}
        actions={
          <div className="flex items-center gap-2">
            <SopTutorialButtons onSopClick={() => setSopOpen(true)} onTutorialClick={() => setTutorialOpen(true)} />
            <Button onClick={openCreate} style={{ backgroundColor: TRIPHQ_COLOR }} className="text-white" data-testid="button-add-day">
              <Plus className="h-4 w-4 mr-2" />Add Day
            </Button>
          </div>
        }
      />

      <StatGrid>
        <StatCard label="Total Days" value={days.length} icon={Calendar} iconBg="rgba(8,145,178,0.1)" iconColor={TRIPHQ_COLOR} />
        <StatCard label="Cities" value={cities.length} icon={MapPin} iconBg="rgba(16,185,129,0.1)" iconColor="#10B981" />
      </StatGrid>

      <div className="space-y-3">
        {days.map((day: any) => {
          const isOpen = expanded.has(day.id);
          return (
            <div key={day.id} className="border rounded-xl overflow-hidden bg-card" data-testid={`itinerary-day-${day.dayNumber}`}>
              <button
                onClick={() => toggleExpand(day.id)}
                className="w-full flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors text-left"
                data-testid={`toggle-day-${day.dayNumber}`}
              >
                <div className="w-12 h-12 rounded-xl flex flex-col items-center justify-center text-white font-bold" style={{ backgroundColor: TRIPHQ_COLOR }}>
                  <span className="text-[10px] leading-none font-medium">DAY</span>
                  <span className="text-lg leading-tight">{day.dayNumber}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{day.city}</span>
                    <Badge variant="outline" className="text-xs">{new Date(day.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</Badge>
                  </div>
                  {day.hotelName && (
                    <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                      <Hotel className="h-3 w-3" />{day.hotelName}
                    </div>
                  )}
                </div>
                {isOpen ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
              </button>

              {isOpen && (
                <div className="px-4 pb-4 space-y-3 border-t">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3">
                    {day.morningPlan && (
                      <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30">
                        <div className="flex items-center gap-1.5 text-xs font-medium text-amber-700 dark:text-amber-400 mb-1"><Sun className="h-3 w-3" />Morning</div>
                        <p className="text-sm">{day.morningPlan}</p>
                      </div>
                    )}
                    {day.eveningPlan && (
                      <div className="p-3 rounded-lg bg-indigo-50 dark:bg-indigo-950/30">
                        <div className="flex items-center gap-1.5 text-xs font-medium text-indigo-700 dark:text-indigo-400 mb-1"><Moon className="h-3 w-3" />Evening</div>
                        <p className="text-sm">{day.eveningPlan}</p>
                      </div>
                    )}
                  </div>
                  {day.notes && <p className="text-sm text-muted-foreground italic">{day.notes}</p>}
                  <div className="flex items-center gap-2 pt-1">
                    <Button variant="outline" size="sm" onClick={() => openEdit(day)} data-testid={`edit-day-${day.dayNumber}`}><Edit2 className="h-3 w-3 mr-1" />Edit</Button>
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700" onClick={() => deleteMutation.mutate(day.id)} data-testid={`delete-day-${day.dayNumber}`}><Trash2 className="h-3 w-3 mr-1" />Delete</Button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <FormDialog open={formOpen} onOpenChange={setFormOpen} title={editItem?.id ? "Edit Day" : "Add Day"} onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div><label className="text-sm font-medium">Day #</label><Input name="day_number" type="number" required defaultValue={editItem?.dayNumber || days.length + 1} data-testid="input-day-number" /></div>
            <div><label className="text-sm font-medium">Date</label><Input name="date" type="date" required defaultValue={editItem?.date?.split("T")[0] || ""} data-testid="input-date" /></div>
            <div><label className="text-sm font-medium">City</label><Input name="city" required defaultValue={editItem?.city || ""} data-testid="input-city" /></div>
          </div>
          <div><label className="text-sm font-medium">Morning Plan</label><Textarea name="morning_plan" rows={2} defaultValue={editItem?.morningPlan || ""} data-testid="input-morning-plan" /></div>
          <div><label className="text-sm font-medium">Evening Plan</label><Textarea name="evening_plan" rows={2} defaultValue={editItem?.eveningPlan || ""} data-testid="input-evening-plan" /></div>
          <div><label className="text-sm font-medium">Hotel Name</label><Input name="hotel_name" defaultValue={editItem?.hotelName || ""} data-testid="input-hotel" /></div>
          <div><label className="text-sm font-medium">Notes</label><Textarea name="notes" rows={2} defaultValue={editItem?.notes || ""} data-testid="input-notes" /></div>
        </div>
      </FormDialog>
      <SopModal open={sopOpen} onOpenChange={setSopOpen} config={SOP_REGISTRY["triphq-itinerary"].sop} color={TRIPHQ_COLOR} />
      <TutorialModal open={tutorialOpen} onOpenChange={setTutorialOpen} config={SOP_REGISTRY["triphq-itinerary"].tutorial} color={TRIPHQ_COLOR} />
    </PageShell>
  );
}
