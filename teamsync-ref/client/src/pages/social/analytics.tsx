import { useState } from "react";
import { useLocation } from "wouter";
import { TrendingUp, TrendingDown } from "lucide-react";
import { SiInstagram, SiYoutube,  SiFacebook } from "react-icons/si";
import { SiLinkedin } from "@/lib/icon-compat";
import { PageTransition, Stagger, StaggerItem, Fade } from "@/components/ui/animated";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { socialPosts, campaigns } from "@/lib/mock-data-social";
import { SOCIAL_COLOR } from "@/lib/social-config";
import { PageShell } from "@/components/layout";


type PlatformTab = "instagram" | "youtube" | "linkedin" | "facebook";
type TimeFilter = "7d" | "30d" | "month" | "custom";

const platformData: Record<PlatformTab, {
  color: string; icon: React.ElementType; reach: number; impressions: number; engagement: string;
  saves: number; shares: number; followerGrowth: number; watchTime: number; trend: number;
}> = {
  instagram: { color: "#E11D48", icon: SiInstagram, reach: 84200, impressions: 142000, engagement: "4.8%", saves: 2840, shares: 920, followerGrowth: 684, watchTime: 0, trend: 12 },
  youtube: { color: "#DC2626", icon: SiYoutube, reach: 15600, impressions: 28000, engagement: "6.8%", saves: 0, shares: 340, followerGrowth: 142, watchTime: 128400, trend: 8 },
  linkedin: { color: "#2563EB", icon: SiLinkedin, reach: 52400, impressions: 89000, engagement: "2.6%", saves: 1240, shares: 640, followerGrowth: 210, watchTime: 0, trend: -3 },
  facebook: { color: "#1D4ED8", icon: SiFacebook, reach: 9800, impressions: 16000, engagement: "1.6%", saves: 0, shares: 180, followerGrowth: 64, watchTime: 0, trend: -8 },
};

const scoreColor = (score: number) => score >= 80 ? "bg-emerald-500" : score >= 60 ? "bg-amber-500" : "bg-red-500";

export default function SocialAnalytics() {
  const [, setLocation] = useLocation();
  const isLoading = useSimulatedLoading(700);
  const [platform, setPlatform] = useState<PlatformTab>("instagram");
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("30d");

  const pData = platformData[platform];
  const publishedPosts = socialPosts.filter(p => p.performanceScore !== null);
  const topPosts = [...publishedPosts].sort((a, b) => (b.performanceScore ?? 0) - (a.performanceScore ?? 0)).slice(0, 5);
  const bottomPosts = [...publishedPosts].sort((a, b) => (a.performanceScore ?? 0) - (b.performanceScore ?? 0)).slice(0, 5);

  const platformTabs = [
    { id: "instagram" as PlatformTab, label: "Instagram", icon: SiInstagram, color: "#E11D48" },
    { id: "youtube" as PlatformTab, label: "YouTube", icon: SiYoutube, color: "#DC2626" },
    { id: "linkedin" as PlatformTab, label: "LinkedIn", icon: SiLinkedin, color: "#2563EB" },
    { id: "facebook" as PlatformTab, label: "Facebook", icon: SiFacebook, color: "#1D4ED8" },
  ];

  if (isLoading) {
    return (
      <PageShell>
        <div className="h-10 bg-muted rounded w-96" />
        <div className="grid grid-cols-6 gap-4">{[...Array(6)].map((_, i) => <div key={i} className="h-24 bg-muted rounded-xl" />)}</div>
        <div className="grid grid-cols-2 gap-6"><div className="h-64 bg-muted rounded-xl" /><div className="h-64 bg-muted rounded-xl" /></div>
      </PageShell>
    );
  }

  return (
    <PageTransition className="px-16 py-6 lg:px-24 space-y-6">
      <Fade>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h1 className="text-2xl font-bold font-heading">Analytics</h1>
          <div className="flex rounded-lg border bg-muted/40 p-0.5 gap-0.5">
            {(["7d", "30d", "month", "custom"] as TimeFilter[]).map(t => (
              <button
                key={t}
                onClick={() => setTimeFilter(t)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${timeFilter === t ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                data-testid={`time-${t}`}
              >
                {t === "7d" ? "7 Days" : t === "30d" ? "30 Days" : t === "month" ? "This Month" : "Custom"}
              </button>
            ))}
          </div>
        </div>
      </Fade>

      <Fade>
        <div className="flex border-b">
          {platformTabs.map(({ id, label, icon: PIcon, color }) => (
            <button
              key={id}
              onClick={() => setPlatform(id)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors ${platform === id ? "border-current" : "border-transparent text-muted-foreground hover:text-foreground"}`}
              style={{ color: platform === id ? color : undefined }}
              data-testid={`platform-tab-${id}`}
            >
              <PIcon size={14} />
              {label}
            </button>
          ))}
        </div>
      </Fade>

      <Stagger>
        <div className={`grid gap-4 ${platform === "youtube" ? "grid-cols-3" : "grid-cols-6"}`}>
          {[
            { label: "Reach", value: pData.reach.toLocaleString() },
            { label: "Impressions", value: pData.impressions.toLocaleString() },
            { label: "Engagement Rate", value: pData.engagement },
            { label: "Saves", value: pData.saves > 0 ? pData.saves.toLocaleString() : "N/A" },
            { label: "Shares", value: pData.shares.toLocaleString() },
            { label: "Follower Growth", value: `+${pData.followerGrowth}` },
          ].map((stat, i) => (
            <StaggerItem key={i}>
              <Card data-testid={`analytics-stat-${i}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                    {pData.trend > 0 ? (
                      <TrendingUp size={12} className="text-emerald-500" />
                    ) : (
                      <TrendingDown size={12} className="text-red-500" />
                    )}
                  </div>
                  <p className="text-xl font-bold">{stat.value}</p>
                  <p className={`text-[10px] ${pData.trend > 0 ? "text-emerald-600" : "text-red-600"}`}>
                    {pData.trend > 0 ? "+" : ""}{pData.trend}% vs prev period
                  </p>
                </CardContent>
              </Card>
            </StaggerItem>
          ))}
        </div>
      </Stagger>

      {platform === "youtube" && (
        <Fade>
          <Card>
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Watch Time</p>
                <p className="text-3xl font-bold mt-1">{Math.floor(pData.watchTime / 3600).toLocaleString()}h</p>
                <p className="text-xs text-muted-foreground mt-0.5">avg {Math.floor(pData.watchTime / 60 / 8)} min per view</p>
              </div>
              <div className="h-2 flex-1 mx-8 rounded-full bg-muted overflow-hidden">
                <div className="h-full rounded-full" style={{ width: "72%", background: "#DC2626" }} />
              </div>
              <p className="text-sm text-muted-foreground">72% retention</p>
            </CardContent>
          </Card>
        </Fade>
      )}

      <div className="grid grid-cols-2 gap-6">
        <Fade>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-emerald-600">Top 5 Posts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {topPosts.map((post, i) => (
                <div
                  key={post.id}
                  className="flex items-center gap-3 cursor-pointer hover:bg-accent p-2 rounded-lg transition-colors"
                  onClick={() => setLocation(`/social/posts/${post.id}`)}
                  data-testid={`top-post-${post.id}`}
                >
                  <div className="size-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0" style={{ background: SOCIAL_COLOR }}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{post.caption.slice(0, 60)}…</p>
                    <p className="text-[10px] text-muted-foreground">{(post.metrics?.reach ?? 0).toLocaleString()} reach · {(post.metrics?.engagement ?? 0).toLocaleString()} eng</p>
                  </div>
                  <div className={`size-8 rounded-full ${scoreColor(post.performanceScore ?? 0)} flex items-center justify-center shrink-0`}>
                    <span className="text-[10px] font-bold text-white">{post.performanceScore}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </Fade>

        <Fade>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-red-500">Needs Attention — Bottom 5</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {bottomPosts.map((post, i) => (
                <div key={post.id} className="flex items-center gap-3 p-2 rounded-lg" data-testid={`bottom-post-${post.id}`}>
                  <div className="size-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white bg-red-400 shrink-0">{i + 1}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{post.caption.slice(0, 55)}…</p>
                    <p className="text-[10px] text-muted-foreground">{(post.metrics?.reach ?? 0).toLocaleString()} reach</p>
                  </div>
                  <div className={`size-8 rounded-full ${scoreColor(post.performanceScore ?? 0)} flex items-center justify-center shrink-0`}>
                    <span className="text-[10px] font-bold text-white">{post.performanceScore}</span>
                  </div>
                  <button
                    onClick={() => setLocation(`/social/posts/${post.id}`)}
                    className="text-[10px] font-medium shrink-0 hover:underline"
                    style={{ color: SOCIAL_COLOR }}
                    data-testid={`repurpose-${post.id}`}
                  >
                    Repurpose →
                  </button>
                </div>
              ))}
            </CardContent>
          </Card>
        </Fade>
      </div>

      <Fade>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Campaign Performance — Reach</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {campaigns.map(campaign => {
              const maxReach = Math.max(...campaigns.map(c => c.totalReach));
              const pct = maxReach > 0 ? (campaign.totalReach / maxReach) * 100 : 0;
              return (
                <div key={campaign.id} className="flex items-center gap-3" data-testid={`camp-bar-${campaign.id}`}>
                  <div className="w-36 shrink-0">
                    <p className="text-xs font-medium truncate">{campaign.name}</p>
                    <p className="text-[10px] text-muted-foreground">{campaign.brand}</p>
                  </div>
                  <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, background: campaign.status === "active" ? SOCIAL_COLOR : "#94A3B8" }}
                    />
                  </div>
                  <p className="text-xs font-semibold w-14 text-right">{(campaign.totalReach / 1000).toFixed(0)}K</p>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </Fade>

      <Fade>
        <div className="flex gap-4">
          {platformTabs.map(({ id, label, icon: PIcon, color }) => {
            const data = platformData[id];
            return (
              <div key={id} className="flex-1 rounded-xl border bg-card p-4" data-testid={`platform-compare-${id}`}>
                <div className="flex items-center gap-2 mb-2">
                  <PIcon size={14} style={{ color }} />
                  <span className="text-xs font-semibold">{label}</span>
                </div>
                <p className="text-xl font-bold">{data.engagement}</p>
                <p className="text-[10px] text-muted-foreground">Engagement rate</p>
                <div className={`flex items-center gap-1 mt-1 text-[10px] ${data.trend >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                  {data.trend >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                  {data.trend >= 0 ? "+" : ""}{data.trend}% vs prev
                </div>
              </div>
            );
          })}
        </div>
      </Fade>
    </PageTransition>
  );
}
