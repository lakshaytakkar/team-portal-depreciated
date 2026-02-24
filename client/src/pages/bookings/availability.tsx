import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Save, Loader2, Plus, Trash2, CalendarOff, Clock } from "lucide-react";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DEFAULT_START = "10:00";
const DEFAULT_END = "18:00";

interface Schedule {
  id?: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

interface Override {
  id: string;
  date: string;
  isAvailable: boolean;
  startTime?: string;
  endTime?: string;
  reason?: string;
}

export default function AvailabilityPage() {
  const { toast } = useToast();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [overrideOpen, setOverrideOpen] = useState(false);
  const [overrideDate, setOverrideDate] = useState("");
  const [overrideAvailable, setOverrideAvailable] = useState(false);
  const [overrideStart, setOverrideStart] = useState("10:00");
  const [overrideEnd, setOverrideEnd] = useState("18:00");
  const [overrideReason, setOverrideReason] = useState("");

  const { data: savedSchedules = [], isLoading } = useQuery<Schedule[]>({
    queryKey: ["/api/availability/schedules"],
  });

  const { data: overrides = [], isLoading: loadingOverrides } = useQuery<Override[]>({
    queryKey: ["/api/availability/overrides"],
  });

  useEffect(() => {
    if (savedSchedules.length > 0) {
      const all: Schedule[] = [];
      for (let d = 0; d < 7; d++) {
        const existing = savedSchedules.find(s => s.dayOfWeek === d);
        if (existing) {
          all.push({ ...existing });
        } else {
          all.push({ dayOfWeek: d, startTime: DEFAULT_START, endTime: DEFAULT_END, isActive: d >= 1 && d <= 5 });
        }
      }
      setSchedules(all);
    } else if (!isLoading) {
      setSchedules(DAYS.map((_, i) => ({
        dayOfWeek: i,
        startTime: DEFAULT_START,
        endTime: DEFAULT_END,
        isActive: i >= 1 && i <= 5,
      })));
    }
  }, [savedSchedules, isLoading]);

  const saveMutation = useMutation({
    mutationFn: async (data: Schedule[]) => {
      const active = data.filter(s => s.isActive);
      const res = await apiRequest("PUT", "/api/availability/schedules", { schedules: active });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/availability/schedules"] });
      toast({ title: "Availability saved!" });
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const addOverrideMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/availability/overrides", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/availability/overrides"] });
      toast({ title: "Date override added!" });
      setOverrideOpen(false);
      setOverrideDate(""); setOverrideReason("");
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const deleteOverrideMutation = useMutation({
    mutationFn: async (id: string) => { await apiRequest("DELETE", `/api/availability/overrides/${id}`); },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/availability/overrides"] });
      toast({ title: "Override removed" });
    },
  });

  const updateSchedule = (dayOfWeek: number, field: string, value: any) => {
    setSchedules(prev => prev.map(s => s.dayOfWeek === dayOfWeek ? { ...s, [field]: value } : s));
  };

  return (
    <div className="px-6 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight" data-testid="text-page-title">My Availability</h1>
          <p className="text-sm text-muted-foreground">Set your weekly hours and block specific dates</p>
        </div>
        <Button onClick={() => saveMutation.mutate(schedules)} disabled={saveMutation.isPending} data-testid="button-save-availability">
          {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
          Save Schedule
        </Button>
      </div>

      <Card className="shadow-[0px_1px_2px_0px_rgba(13,13,18,0.06)] dark:shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2"><Clock className="h-4 w-4" /> Weekly Hours</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            <div className="flex items-center justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : schedules.map(s => (
            <div key={s.dayOfWeek} className={`flex items-center gap-4 p-3 rounded-lg border transition-colors ${s.isActive ? "bg-card" : "bg-muted/30 opacity-60"}`} data-testid={`schedule-day-${s.dayOfWeek}`}>
              <Switch checked={s.isActive} onCheckedChange={v => updateSchedule(s.dayOfWeek, "isActive", v)} />
              <span className="w-24 font-medium text-sm">{DAYS[s.dayOfWeek]}</span>
              {s.isActive ? (
                <div className="flex items-center gap-2">
                  <Input type="time" value={s.startTime} onChange={e => updateSchedule(s.dayOfWeek, "startTime", e.target.value)} className="w-32" data-testid={`input-start-${s.dayOfWeek}`} />
                  <span className="text-muted-foreground">to</span>
                  <Input type="time" value={s.endTime} onChange={e => updateSchedule(s.dayOfWeek, "endTime", e.target.value)} className="w-32" data-testid={`input-end-${s.dayOfWeek}`} />
                </div>
              ) : (
                <span className="text-sm text-muted-foreground">Unavailable</span>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="shadow-[0px_1px_2px_0px_rgba(13,13,18,0.06)] dark:shadow-none">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2"><CalendarOff className="h-4 w-4" /> Date Overrides</CardTitle>
            <Button variant="outline" size="sm" onClick={() => setOverrideOpen(true)} data-testid="button-add-override">
              <Plus className="h-4 w-4 mr-1" /> Add Override
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">Block off specific dates or add special hours</p>
        </CardHeader>
        <CardContent>
          {loadingOverrides ? (
            <div className="flex items-center justify-center py-4"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
          ) : overrides.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No date overrides set</p>
          ) : (
            <div className="space-y-2">
              {overrides.map(o => (
                <div key={o.id} className="flex items-center justify-between p-3 rounded-lg border" data-testid={`override-${o.id}`}>
                  <div className="flex items-center gap-3">
                    <Badge variant={o.isAvailable ? "default" : "destructive"} className={o.isAvailable ? "bg-green-100 text-green-700" : ""}>
                      {o.isAvailable ? "Available" : "Blocked"}
                    </Badge>
                    <span className="font-medium text-sm">{new Date(o.date + "T12:00:00").toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "short", year: "numeric" })}</span>
                    {o.isAvailable && o.startTime && o.endTime && (
                      <span className="text-xs text-muted-foreground">{o.startTime} - {o.endTime}</span>
                    )}
                    {o.reason && <span className="text-xs text-muted-foreground">({o.reason})</span>}
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => deleteOverrideMutation.mutate(o.id)} data-testid={`button-delete-override-${o.id}`}>
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={overrideOpen} onOpenChange={setOverrideOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Add Date Override</DialogTitle>
            <DialogDescription>Block a date or set custom hours</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Date *</Label>
              <Input type="date" value={overrideDate} onChange={e => setOverrideDate(e.target.value)} data-testid="input-override-date" />
            </div>
            <div className="flex items-center justify-between">
              <Label>Available on this day?</Label>
              <Switch checked={overrideAvailable} onCheckedChange={setOverrideAvailable} data-testid="switch-override-available" />
            </div>
            {overrideAvailable && (
              <div className="flex items-center gap-2">
                <Input type="time" value={overrideStart} onChange={e => setOverrideStart(e.target.value)} className="w-32" />
                <span className="text-muted-foreground">to</span>
                <Input type="time" value={overrideEnd} onChange={e => setOverrideEnd(e.target.value)} className="w-32" />
              </div>
            )}
            <div>
              <Label>Reason (optional)</Label>
              <Input value={overrideReason} onChange={e => setOverrideReason(e.target.value)} placeholder="Holiday, personal leave..." data-testid="input-override-reason" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOverrideOpen(false)}>Cancel</Button>
            <Button onClick={() => addOverrideMutation.mutate({ date: overrideDate, isAvailable: overrideAvailable, startTime: overrideAvailable ? overrideStart : undefined, endTime: overrideAvailable ? overrideEnd : undefined, reason: overrideReason || undefined })} disabled={!overrideDate || addOverrideMutation.isPending} data-testid="button-save-override">
              {addOverrideMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Save Override
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}