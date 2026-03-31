import { useState } from "react";
import { useLocation } from "wouter";
import { Plus } from "lucide-react";
import { SiInstagram, SiYoutube,  SiFacebook, SiThreads } from "react-icons/si";
import { SiLinkedin } from "@/lib/icon-compat";
import { PageTransition, Stagger, StaggerItem, Fade } from "@/components/ui/animated";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { useToast } from "@/hooks/use-toast";
import { campaigns, type Campaign } from "@/lib/mock-data-social";
import { StatusBadge } from "@/components/ds/status-badge";
import { PageShell } from "@/components/layout";
import { SOCIAL_COLOR } from "@/lib/social-config";
import { SopModal, TutorialModal, SopTutorialButtons } from "@/components/sop/sop-modal";
import { SOP_REGISTRY } from "@/lib/sop-data";


const platformIcons: Record<string, { icon: React.ElementType; color: string }> = {
  instagram: { icon: SiInstagram, color: "#E11D48" },
  youtube: { icon: SiYoutube, color: "#DC2626" },
  linkedin: { icon: SiLinkedin, color: "#2563EB" },
  facebook: { icon: SiFacebook, color: "#1D4ED8" },
  threads: { icon: SiThreads, color: "#1F2937" },
};

const brands = ["Suprans", "LegalNations", "USDrop", "Gullee"];
const platformOptions = ["instagram", "youtube", "linkedin", "facebook", "threads"];

export default function SocialCampaigns() {
  const [, setLocation] = useLocation();
  const isLoading = useSimulatedLoading(600);
  const { toast } = useToast();
  const [sopOpen, setSopOpen] = useState(false);
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("All");
  const [brandFilter, setBrandFilter] = useState("All");
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({ name: "", brand: "Suprans", goal: "", description: "", startDate: "", endDate: "", platforms: [] as string[] });

  const filtered = campaigns.filter(c => {
    if (statusFilter !== "All" && c.status !== statusFilter.toLowerCase()) return false;
    if (brandFilter !== "All" && c.brand !== brandFilter) return false;
    return true;
  });

  const togglePlatform = (p: string) => {
    setForm(prev => ({
      ...prev,
      platforms: prev.platforms.includes(p) ? prev.platforms.filter(x => x !== p) : [...prev.platforms, p]
    }));
  };

  const handleCreate = () => {
    toast({ title: "Campaign Created", description: `"${form.name}" has been created successfully.` });
    setCreateOpen(false);
    setForm({ name: "", brand: "Suprans", goal: "", description: "", startDate: "", endDate: "", platforms: [] });
  };

  if (isLoading) {
    return (
      <PageShell>
        <div className="grid grid-cols-3 gap-4">{[...Array(6)].map((_, i) => <div key={i} className="h-48 bg-muted rounded-xl" />)}</div>
      </PageShell>
    );
  }

  return (
    <PageTransition className="px-16 py-6 lg:px-24 space-y-6">
      <Fade>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold font-heading">Campaigns</h1>
            <p className="text-muted-foreground text-sm mt-0.5">{campaigns.length} campaigns across all brands</p>
          </div>
          <div className="flex items-center gap-2">
            <SopTutorialButtons onSopClick={() => setSopOpen(true)} onTutorialClick={() => setTutorialOpen(true)} />
            <Button onClick={() => setCreateOpen(true)} data-testid="btn-create-campaign">
              <Plus size={16} className="mr-2" />
              Create Campaign
            </Button>
          </div>
        </div>
      </Fade>

      <Fade>
        <div className="flex gap-3">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="text-sm border rounded-lg px-3 py-1.5 bg-background"
            data-testid="filter-status"
          >
            {["All", "Active", "Completed", "Draft"].map(s => <option key={s}>{s}</option>)}
          </select>
          <select
            value={brandFilter}
            onChange={e => setBrandFilter(e.target.value)}
            className="text-sm border rounded-lg px-3 py-1.5 bg-background"
            data-testid="filter-brand"
          >
            {["All", ...brands].map(b => <option key={b}>{b}</option>)}
          </select>
        </div>
      </Fade>

      <Stagger>
        <div className="grid grid-cols-3 gap-5">
          {filtered.map(campaign => (
            <StaggerItem key={campaign.id}>
              <Card
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setLocation(`/social/campaigns/${campaign.id}`)}
                data-testid={`campaign-card-${campaign.id}`}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm truncate">{campaign.name}</h3>
                      <Badge variant="outline" className="text-[10px] mt-1">{campaign.brand}</Badge>
                    </div>
                    <StatusBadge status={campaign.status} />
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed mb-3 line-clamp-2">{campaign.goal}</p>

                  <div className="flex items-center gap-1 mb-3">
                    {campaign.platforms.map(p => {
                      const cfg = platformIcons[p];
                      if (!cfg) return null;
                      const PIcon = cfg.icon;
                      return <PIcon key={p} size={12} style={{ color: cfg.color }} />;
                    })}
                  </div>

                  <div className="text-[10px] text-muted-foreground mb-3">
                    {campaign.startDate} → {campaign.endDate}
                  </div>

                  <div className="flex items-center gap-3 pt-3 border-t">
                    <div>
                      <p className="text-xs font-semibold">{campaign.postCount}</p>
                      <p className="text-[10px] text-muted-foreground">Posts</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold">{(campaign.totalReach / 1000).toFixed(0)}K</p>
                      <p className="text-[10px] text-muted-foreground">Reach</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold">{campaign.leads}</p>
                      <p className="text-[10px] text-muted-foreground">Leads</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </StaggerItem>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-3 text-center py-16 text-muted-foreground">No campaigns match your filters</div>
          )}
        </div>
      </Stagger>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Campaign</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Campaign Name</Label>
              <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Summer Launch 2026" data-testid="input-campaign-name" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Brand</Label>
                <select value={form.brand} onChange={e => setForm(p => ({ ...p, brand: e.target.value }))} className="w-full text-sm border rounded-lg px-3 py-2 bg-background" data-testid="select-brand">
                  {brands.map(b => <option key={b}>{b}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Goal</Label>
                <Input value={form.goal} onChange={e => setForm(p => ({ ...p, goal: e.target.value }))} placeholder="e.g. Brand Awareness" data-testid="input-goal" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3} placeholder="Campaign brief..." data-testid="input-description" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Start Date</Label>
                <Input type="date" value={form.startDate} onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))} data-testid="input-start-date" />
              </div>
              <div className="space-y-1.5">
                <Label>End Date</Label>
                <Input type="date" value={form.endDate} onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))} data-testid="input-end-date" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Platforms</Label>
              <div className="flex flex-wrap gap-3">
                {platformOptions.map(p => {
                  const cfg = platformIcons[p];
                  const PIcon = cfg.icon;
                  return (
                    <div key={p} className="flex items-center gap-1.5">
                      <Checkbox
                        id={`plat-${p}`}
                        checked={form.platforms.includes(p)}
                        onCheckedChange={() => togglePlatform(p)}
                        data-testid={`checkbox-${p}`}
                      />
                      <label htmlFor={`plat-${p}`} className="flex items-center gap-1 text-xs cursor-pointer">
                        <PIcon size={12} style={{ color: cfg.color }} /> {p}
                      </label>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={!form.name.trim()} data-testid="btn-confirm-create">Create Campaign</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <SopModal open={sopOpen} onOpenChange={setSopOpen} config={SOP_REGISTRY["social-campaigns"].sop} color={SOCIAL_COLOR} />
      <TutorialModal open={tutorialOpen} onOpenChange={setTutorialOpen} config={SOP_REGISTRY["social-campaigns"].tutorial} color={SOCIAL_COLOR} />
    </PageTransition>
  );
}
