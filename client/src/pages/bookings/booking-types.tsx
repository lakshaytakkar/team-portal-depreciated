import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Copy, Clock, IndianRupee, ExternalLink, Pencil, Trash2, Loader2, Calendar } from "lucide-react";

interface BookingType {
  id: string;
  userId: string;
  title: string;
  slug: string;
  description?: string;
  duration: number;
  color: string;
  price: number;
  currency: string;
  location: string;
  bufferBefore: number;
  bufferAfter: number;
  maxBookingsPerDay?: number;
  requiresApproval: boolean;
  isActive: boolean;
  createdAt: string;
}

function BookingTypeDialog({ open, onOpenChange, editData }: { open: boolean; onOpenChange: (v: boolean) => void; editData?: BookingType | null }) {
  const { toast } = useToast();
  const [title, setTitle] = useState(editData?.title || "");
  const [slug, setSlug] = useState(editData?.slug || "");
  const [description, setDescription] = useState(editData?.description || "");
  const [duration, setDuration] = useState(String(editData?.duration || 30));
  const [color, setColor] = useState(editData?.color || "#3B82F6");
  const [price, setPrice] = useState(String(editData?.price || 0));
  const [location, setLocation] = useState(editData?.location || "Google Meet");
  const [bufferBefore, setBufferBefore] = useState(String(editData?.bufferBefore || 0));
  const [bufferAfter, setBufferAfter] = useState(String(editData?.bufferAfter || 10));
  const [maxBookingsPerDay, setMaxBookingsPerDay] = useState(editData?.maxBookingsPerDay ? String(editData.maxBookingsPerDay) : "");
  const [requiresApproval, setRequiresApproval] = useState(editData?.requiresApproval || false);
  const [isActive, setIsActive] = useState(editData?.isActive !== false);

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      if (editData) {
        const res = await apiRequest("PATCH", `/api/booking-types/${editData.id}`, data);
        return res.json();
      }
      const res = await apiRequest("POST", "/api/booking-types", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/booking-types"] });
      toast({ title: editData ? "Booking type updated!" : "Booking type created!" });
      onOpenChange(false);
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const autoSlug = (t: string) => {
    setTitle(t);
    if (!editData) setSlug(t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editData ? "Edit" : "Create"} Booking Type</DialogTitle>
          <DialogDescription>Define a type of meeting your customers can book</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <Label>Title *</Label>
            <Input value={title} onChange={e => autoSlug(e.target.value)} placeholder="30-Min Discovery Call" data-testid="input-bt-title" />
          </div>
          <div>
            <Label>URL Slug *</Label>
            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
              <span>/book/</span>
              <Input value={slug} onChange={e => setSlug(e.target.value)} placeholder="discovery-call" className="font-mono" data-testid="input-bt-slug" />
            </div>
          </div>
          <div>
            <Label>Description</Label>
            <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="A quick call to understand your needs..." rows={2} data-testid="input-bt-description" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label>Duration (min)</Label>
              <Input type="number" value={duration} onChange={e => setDuration(e.target.value)} data-testid="input-bt-duration" />
            </div>
            <div>
              <Label>Price (₹)</Label>
              <Input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="0 = Free" data-testid="input-bt-price" />
            </div>
            <div>
              <Label>Color</Label>
              <Input type="color" value={color} onChange={e => setColor(e.target.value)} className="h-10 p-1" data-testid="input-bt-color" />
            </div>
          </div>
          <div>
            <Label>Location</Label>
            <Input value={location} onChange={e => setLocation(e.target.value)} placeholder="Google Meet / Office" data-testid="input-bt-location" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label>Buffer Before (min)</Label>
              <Input type="number" value={bufferBefore} onChange={e => setBufferBefore(e.target.value)} data-testid="input-bt-buffer-before" />
            </div>
            <div>
              <Label>Buffer After (min)</Label>
              <Input type="number" value={bufferAfter} onChange={e => setBufferAfter(e.target.value)} data-testid="input-bt-buffer-after" />
            </div>
            <div>
              <Label>Max/Day</Label>
              <Input type="number" value={maxBookingsPerDay} onChange={e => setMaxBookingsPerDay(e.target.value)} placeholder="Unlimited" data-testid="input-bt-max-day" />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <Label>Requires Approval</Label>
            <Switch checked={requiresApproval} onCheckedChange={setRequiresApproval} data-testid="switch-bt-approval" />
          </div>
          <div className="flex items-center justify-between">
            <Label>Active</Label>
            <Switch checked={isActive} onCheckedChange={setIsActive} data-testid="switch-bt-active" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => mutation.mutate({ title, slug, description, duration: parseInt(duration), color, price: parseInt(price) || 0, location, bufferBefore: parseInt(bufferBefore) || 0, bufferAfter: parseInt(bufferAfter) || 0, maxBookingsPerDay: maxBookingsPerDay ? parseInt(maxBookingsPerDay) : undefined, requiresApproval, isActive })} disabled={!title || !slug || mutation.isPending} data-testid="button-save-bt">
            {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            {editData ? "Update" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function BookingTypesPage() {
  const { toast } = useToast();
  const [createOpen, setCreateOpen] = useState(false);
  const [editData, setEditData] = useState<BookingType | null>(null);

  const { data: types = [], isLoading } = useQuery<BookingType[]>({
    queryKey: ["/api/booking-types"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { await apiRequest("DELETE", `/api/booking-types/${id}`); },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/booking-types"] });
      toast({ title: "Booking type deleted" });
    },
  });

  const copyLink = (slug: string) => {
    const url = `${window.location.origin}/book/${slug}`;
    navigator.clipboard.writeText(url);
    toast({ title: "Booking link copied!" });
  };

  return (
    <div className="px-6 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight" data-testid="text-page-title">Booking Types</h1>
          <p className="text-sm text-muted-foreground">Create meeting types that customers can book with you</p>
        </div>
        <Button onClick={() => { setEditData(null); setCreateOpen(true); }} data-testid="button-new-bt">
          <Plus className="h-4 w-4 mr-2" /> New Booking Type
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : types.length === 0 ? (
        <Card className="shadow-[0px_1px_2px_0px_rgba(13,13,18,0.06)] dark:shadow-none">
          <CardContent className="py-12 text-center">
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Booking Types Yet</h3>
            <p className="text-sm text-muted-foreground mb-4">Create your first meeting type to start accepting bookings</p>
            <Button onClick={() => { setEditData(null); setCreateOpen(true); }}>
              <Plus className="h-4 w-4 mr-2" /> Create Booking Type
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {types.map(bt => (
            <Card key={bt.id} className="shadow-[0px_1px_2px_0px_rgba(13,13,18,0.06)] dark:shadow-none overflow-hidden" data-testid={`card-bt-${bt.id}`}>
              <div className="h-1.5" style={{ backgroundColor: bt.color }} />
              <CardContent className="pt-5 pb-4 px-5 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{bt.title}</h3>
                    {bt.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{bt.description}</p>}
                  </div>
                  <Badge variant={bt.isActive ? "default" : "secondary"} className={bt.isActive ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400" : ""}>
                    {bt.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {bt.duration} min</span>
                  <span className="flex items-center gap-1"><IndianRupee className="h-3.5 w-3.5" /> {bt.price > 0 ? `₹${bt.price}` : "Free"}</span>
                </div>
                <div className="text-xs text-muted-foreground font-mono bg-muted/50 rounded px-2 py-1 truncate">/book/{bt.slug}</div>
                <div className="flex items-center gap-1 pt-1">
                  <Button variant="outline" size="sm" onClick={() => copyLink(bt.slug)} data-testid={`button-copy-link-${bt.id}`}>
                    <Copy className="h-3.5 w-3.5 mr-1" /> Copy Link
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => window.open(`/book/${bt.slug}`, "_blank")} data-testid={`button-preview-${bt.id}`}>
                    <ExternalLink className="h-3.5 w-3.5 mr-1" /> Preview
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditData(bt); setCreateOpen(true); }} data-testid={`button-edit-bt-${bt.id}`}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { if (confirm("Delete this booking type?")) deleteMutation.mutate(bt.id); }} data-testid={`button-delete-bt-${bt.id}`}>
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <BookingTypeDialog open={createOpen} onOpenChange={v => { setCreateOpen(v); if (!v) setEditData(null); }} editData={editData} />
    </div>
  );
}