import { useState } from "react";
import { useLocation } from "wouter";
import { Plus, Search } from "lucide-react";
import { SiInstagram, SiYoutube,  SiFacebook, SiThreads } from "react-icons/si";
import { SiLinkedin } from "@/lib/icon-compat";
import { PageTransition, Fade } from "@/components/ui/animated";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { socialPosts, campaigns, socialAccounts, type PostStage } from "@/lib/mock-data-social";
import { StatusBadge } from "@/components/ds/status-badge";
import { SOCIAL_COLOR } from "@/lib/social-config";
import { PageShell } from "@/components/layout";
import { SopModal, TutorialModal, SopTutorialButtons } from "@/components/sop/sop-modal";
import { SOP_REGISTRY } from "@/lib/sop-data";


const mediaColors: Record<string, string> = {
  reel: "#E11D48",
  carousel: "#7C3AED",
  static: "#2563EB",
  story: "#EA580C",
  short: "#DC2626",
  "long-video": "#0D9488",
};

const platformIcons: Record<string, { icon: React.ElementType; color: string }> = {
  instagram: { icon: SiInstagram, color: "#E11D48" },
  youtube: { icon: SiYoutube, color: "#DC2626" },
  linkedin: { icon: SiLinkedin, color: "#2563EB" },
  facebook: { icon: SiFacebook, color: "#1D4ED8" },
  threads: { icon: SiThreads, color: "#1F2937" },
};

const stages: PostStage[] = ["idea", "script", "design", "caption", "approval", "scheduled", "published", "rejected"];

const scoreColor = (score: number | null) => {
  if (score === null) return "bg-slate-200 text-slate-500";
  if (score >= 80) return "bg-emerald-500 text-white";
  if (score >= 60) return "bg-amber-500 text-white";
  return "bg-red-500 text-white";
};

export default function SocialPosts() {
  const [, setLocation] = useLocation();
  const isLoading = useSimulatedLoading(600);
  const [sopOpen, setSopOpen] = useState(false);
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const [stageFilter, setStageFilter] = useState<PostStage | "all">("all");
  const [platformFilter, setPlatformFilter] = useState("All");
  const [campaignFilter, setCampaignFilter] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = socialPosts.filter(p => {
    if (stageFilter !== "all" && p.stage !== stageFilter) return false;
    if (platformFilter !== "All" && !p.platforms.includes(platformFilter as any)) return false;
    if (campaignFilter !== "All" && p.campaignId !== campaignFilter) return false;
    if (search && !p.caption.toLowerCase().includes(search.toLowerCase()) && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  if (isLoading) {
    return (
      <PageShell>
        <div className="h-10 bg-muted rounded-lg w-64" />
        <div className="flex gap-2">{stages.map((_, i) => <div key={i} className="h-8 w-20 bg-muted rounded-full" />)}</div>
        <div className="space-y-3">{[...Array(8)].map((_, i) => <div key={i} className="h-14 bg-muted rounded-lg" />)}</div>
      </PageShell>
    );
  }

  return (
    <PageTransition className="px-16 py-6 lg:px-24 space-y-6">
      <Fade>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold font-heading">Post Library</h1>
            <p className="text-muted-foreground text-sm mt-0.5">{socialPosts.length} total posts across all brands and stages</p>
          </div>
          <div className="flex items-center gap-2">
            <SopTutorialButtons onSopClick={() => setSopOpen(true)} onTutorialClick={() => setTutorialOpen(true)} />
            <Button onClick={() => setLocation("/social/composer")} data-testid="btn-new-post">
              <Plus size={16} className="mr-2" />
              New Post
            </Button>
          </div>
        </div>
      </Fade>

      <Fade>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setStageFilter("all")}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${stageFilter === "all" ? "text-white border-transparent" : "border-border hover:bg-accent"}`}
            style={stageFilter === "all" ? { background: SOCIAL_COLOR } : {}}
            data-testid="pill-all"
          >
            All ({socialPosts.length})
          </button>
          {stages.map(s => (
            <button
              key={s}
              onClick={() => setStageFilter(s)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${stageFilter === s ? "text-white border-transparent" : "border-border hover:bg-accent"}`}
              style={stageFilter === s ? { background: SOCIAL_COLOR } : {}}
              data-testid={`pill-${s}`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)} ({socialPosts.filter(p => p.stage === s).length})
            </button>
          ))}
        </div>
      </Fade>

      <Fade>
        <div className="flex gap-3 flex-wrap">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search posts..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 w-56 h-8 text-sm"
              data-testid="input-search"
            />
          </div>
          <select
            value={platformFilter}
            onChange={e => setPlatformFilter(e.target.value)}
            className="text-sm border rounded-lg px-3 py-1.5 bg-background h-8"
            data-testid="filter-platform"
          >
            {["All", "instagram", "youtube", "linkedin", "facebook", "threads"].map(p => <option key={p}>{p}</option>)}
          </select>
          <select
            value={campaignFilter}
            onChange={e => setCampaignFilter(e.target.value)}
            className="text-sm border rounded-lg px-3 py-1.5 bg-background h-8"
            data-testid="filter-campaign"
          >
            <option value="All">All Campaigns</option>
            {campaigns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </Fade>

      <Fade>
        <div className="rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 border-b">
              <tr>
                <th className="text-left p-3 font-medium text-muted-foreground text-xs">Caption</th>
                <th className="text-left p-3 font-medium text-muted-foreground text-xs">Platforms</th>
                <th className="text-left p-3 font-medium text-muted-foreground text-xs">Campaign</th>
                <th className="text-left p-3 font-medium text-muted-foreground text-xs">Stage</th>
                <th className="text-left p-3 font-medium text-muted-foreground text-xs">Score</th>
                <th className="text-left p-3 font-medium text-muted-foreground text-xs">Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(post => {
                const campaign = campaigns.find(c => c.id === post.campaignId);
                const date = post.publishedDate ?? post.scheduledDate;
                return (
                  <tr
                    key={post.id}
                    className="border-b last:border-0 hover:bg-accent cursor-pointer transition-colors"
                    onClick={() => setLocation(`/social/posts/${post.id}`)}
                    data-testid={`post-row-${post.id}`}
                  >
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-1 h-10 rounded-full shrink-0"
                          style={{ background: mediaColors[post.mediaType] ?? "#94A3B8" }}
                        />
                        <div>
                          <p className="font-medium text-sm truncate max-w-[300px]">{post.caption.slice(0, 65)}{post.caption.length > 65 ? "…" : ""}</p>
                          <p className="text-[10px] text-muted-foreground capitalize">{post.mediaType} · {post.verticalTag}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-1">
                        {post.platforms.map(p => {
                          const { icon: PIcon, color } = platformIcons[p];
                          return <PIcon key={p} size={13} style={{ color }} />;
                        })}
                      </div>
                    </td>
                    <td className="p-3">
                      {campaign ? <Badge variant="outline" className="text-[10px]">{campaign.name}</Badge> : <span className="text-muted-foreground text-xs">—</span>}
                    </td>
                    <td className="p-3">
                      <Badge >
                        {post.stage.charAt(0).toUpperCase() + post.stage.slice(1)}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <div className={`size-7 rounded-full flex items-center justify-center text-[10px] font-bold ${scoreColor(post.performanceScore)}`}>
                        {post.performanceScore ?? "—"}
                      </div>
                    </td>
                    <td className="p-3 text-xs text-muted-foreground">{date ?? "—"}</td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-muted-foreground">No posts match your filters</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Fade>
      <SopModal open={sopOpen} onOpenChange={setSopOpen} config={SOP_REGISTRY["social-posts"].sop} color={SOCIAL_COLOR} />
      <TutorialModal open={tutorialOpen} onOpenChange={setTutorialOpen} config={SOP_REGISTRY["social-posts"].tutorial} color={SOCIAL_COLOR} />
    </PageTransition>
  );
}
