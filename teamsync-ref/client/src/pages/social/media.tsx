import { useState } from "react";
import { useLocation } from "wouter";
import { Plus, Download, Image, Video, Film, BookTemplate, Type } from "lucide-react";
import { PageTransition, Stagger, StaggerItem, Fade } from "@/components/ui/animated";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { SmallDetailModal } from "@/components/blocks/detail-view-blocks";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { useToast } from "@/hooks/use-toast";
import { mediaAssets, type MediaAsset, type AssetType } from "@/lib/mock-data-social";
import { PageShell } from "@/components/layout";


const assetColors: Record<AssetType, { bg: string; color: string; icon: React.ElementType }> = {
  image: { bg: "#EFF6FF", color: "#2563EB", icon: Image },
  video: { bg: "#FEF2F2", color: "#DC2626", icon: Video },
  reel: { bg: "#FFF1F2", color: "#E11D48", icon: Film },
  "story-template": { bg: "#FDF4FF", color: "#9333EA", icon: BookTemplate },
  logo: { bg: "#F0FDF4", color: "#16A34A", icon: Image },
  thumbnail: { bg: "#FFFBEB", color: "#D97706", icon: Image },
};

const brands = ["All", "Suprans", "LegalNations", "USDrop", "Gullee"];
const assetTypes: AssetType[] = ["image", "video", "reel", "story-template", "logo", "thumbnail"];

export default function SocialMedia() {
  const isLoading = useSimulatedLoading(600);
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"approved" | "drafts">("approved");
  const [brandFilter, setBrandFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [previewAsset, setPreviewAsset] = useState<MediaAsset | null>(null);
  const [, setLocation] = useLocation();
  const [form, setForm] = useState({ name: "", brand: "Suprans", type: "image" as AssetType, status: "approved" as "approved" | "draft", tags: "" });

  const filtered = mediaAssets.filter(a => {
    if (a.status !== (activeTab === "approved" ? "approved" : "draft")) return false;
    if (brandFilter !== "All" && a.brand !== brandFilter) return false;
    if (typeFilter !== "All" && a.type !== typeFilter) return false;
    if (search && !a.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleUpload = () => {
    toast({ title: "Asset Uploaded", description: `"${form.name}" has been added to the media library.` });
    setUploadOpen(false);
  };

  if (isLoading) {
    return (
      <PageShell>
        <div className="h-10 bg-muted rounded w-48" />
        <div className="grid grid-cols-4 gap-4">{[...Array(8)].map((_, i) => <div key={i} className="h-48 bg-muted rounded-xl" />)}</div>
      </PageShell>
    );
  }

  return (
    <PageTransition className="px-16 py-6 lg:px-24 space-y-6">
      <Fade>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold font-heading">Media Library</h1>
            <p className="text-muted-foreground text-sm mt-0.5">{mediaAssets.length} total assets across all brands</p>
          </div>
          <Button onClick={() => setUploadOpen(true)} data-testid="btn-upload-asset">
            <Plus size={16} className="mr-2" />
            Upload Asset
          </Button>
        </div>
      </Fade>

      <Fade>
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex rounded-lg border bg-muted/40 p-0.5 gap-0.5">
            {(["approved", "drafts"] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors capitalize ${activeTab === tab ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                data-testid={`tab-${tab}`}
              >
                {tab === "approved" ? `Approved (${mediaAssets.filter(a => a.status === "approved").length})` : `Drafts (${mediaAssets.filter(a => a.status === "draft").length})`}
              </button>
            ))}
          </div>
          <Input
            placeholder="Search assets..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-48 h-8 text-sm"
            data-testid="input-search"
          />
          <select value={brandFilter} onChange={e => setBrandFilter(e.target.value)} className="text-sm border rounded-lg px-3 py-1.5 bg-background" data-testid="filter-brand">
            {brands.map(b => <option key={b}>{b}</option>)}
          </select>
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="text-sm border rounded-lg px-3 py-1.5 bg-background" data-testid="filter-type">
            <option value="All">All Types</option>
            {assetTypes.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1).replace("-", " ")}</option>)}
          </select>
        </div>
      </Fade>

      <Stagger>
        <div className="grid grid-cols-4 gap-4">
          {filtered.map(asset => {
            const cfg = assetColors[asset.type];
            const TypeIcon = cfg.icon;
            return (
              <StaggerItem key={asset.id}>
                <Card
                  className="cursor-pointer hover:shadow-md transition-shadow overflow-hidden"
                  onClick={() => setPreviewAsset(asset)}
                  data-testid={`asset-card-${asset.id}`}
                >
                  <div
                    className="h-32 flex items-center justify-center"
                    style={{ background: cfg.bg }}
                  >
                    <TypeIcon size={32} style={{ color: cfg.color }} />
                  </div>
                  <CardContent className="p-3">
                    <p className="text-xs font-semibold truncate">{asset.name}</p>
                    <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                      <Badge variant="outline" className="text-[9px] px-1.5 py-0">{asset.brand}</Badge>
                      <Badge className="text-[9px] px-1.5 py-0 capitalize" style={{ background: `${cfg.color}20`, color: cfg.color }}>
                        {asset.type.replace("-", " ")}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-0.5 mt-1.5">
                      {asset.tags.slice(0, 2).map(tag => (
                        <span key={tag} className="text-[9px] bg-muted px-1.5 py-0.5 rounded-full text-muted-foreground">{tag}</span>
                      ))}
                      {asset.tags.length > 2 && <span className="text-[9px] text-muted-foreground">+{asset.tags.length - 2}</span>}
                    </div>
                    <p className="text-[9px] text-muted-foreground mt-2">{asset.uploadedBy} · {asset.uploadedDate}</p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full mt-2 h-7 text-xs"
                      onClick={e => { e.stopPropagation(); setLocation("/social/composer"); }}
                      data-testid={`btn-use-${asset.id}`}
                    >
                      Use in Post
                    </Button>
                  </CardContent>
                </Card>
              </StaggerItem>
            );
          })}
          {filtered.length === 0 && (
            <div className="col-span-4 text-center py-16 text-muted-foreground">No assets match your filters</div>
          )}
        </div>
      </Stagger>

      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Asset</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Asset Name</Label>
              <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Suprans Logo White" data-testid="input-asset-name" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Brand</Label>
                <select value={form.brand} onChange={e => setForm(p => ({ ...p, brand: e.target.value }))} className="w-full text-sm border rounded-lg px-3 py-2 bg-background" data-testid="select-brand">
                  {["Suprans", "LegalNations", "USDrop", "Gullee"].map(b => <option key={b}>{b}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Type</Label>
                <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value as AssetType }))} className="w-full text-sm border rounded-lg px-3 py-2 bg-background" data-testid="select-type">
                  {assetTypes.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1).replace("-", " ")}</option>)}
                </select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value as "approved" | "draft" }))} className="w-full text-sm border rounded-lg px-3 py-2 bg-background" data-testid="select-status">
                <option value="approved">Approved</option>
                <option value="draft">Draft</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Tags (comma-separated)</Label>
              <Input value={form.tags} onChange={e => setForm(p => ({ ...p, tags: e.target.value }))} placeholder="e.g. logo, white, primary" data-testid="input-tags" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUploadOpen(false)}>Cancel</Button>
            <Button onClick={handleUpload} disabled={!form.name.trim()} data-testid="btn-confirm-upload">Upload Asset</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {previewAsset && (() => {
        const cfg = assetColors[previewAsset.type];
        const TypeIcon = cfg.icon;
        return (
          <SmallDetailModal
            open={!!previewAsset}
            onClose={() => setPreviewAsset(null)}
            title={previewAsset.name}
            size="sm"
            footer={
              <>
                <Button variant="outline" onClick={() => setPreviewAsset(null)}>Close</Button>
                <Button data-testid="btn-download">
                  <Download size={14} className="mr-1.5" /> Download
                </Button>
              </>
            }
          >
            <div className="space-y-4">
              <div className="h-40 rounded-xl flex items-center justify-center" style={{ background: cfg.bg }}>
                <TypeIcon size={48} style={{ color: cfg.color }} />
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div><p className="text-muted-foreground">Brand</p><p className="font-medium">{previewAsset.brand}</p></div>
                <div><p className="text-muted-foreground">Type</p><p className="font-medium capitalize">{previewAsset.type.replace("-", " ")}</p></div>
                <div><p className="text-muted-foreground">Status</p><p className="font-medium capitalize">{previewAsset.status}</p></div>
                <div><p className="text-muted-foreground">Size</p><p className="font-medium">{previewAsset.size}</p></div>
                <div><p className="text-muted-foreground">Uploaded by</p><p className="font-medium">{previewAsset.uploadedBy}</p></div>
                <div><p className="text-muted-foreground">Date</p><p className="font-medium">{previewAsset.uploadedDate}</p></div>
              </div>
              <div className="flex flex-wrap gap-1">
                {previewAsset.tags.map(tag => (
                  <span key={tag} className="text-xs bg-muted px-2 py-0.5 rounded-full">{tag}</span>
                ))}
              </div>
            </div>
          </SmallDetailModal>
        );
      })()}
    </PageTransition>
  );
}
