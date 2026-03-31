import { useLocation } from "wouter";
import { Bell, TrendingUp, TrendingDown, Calendar, Target, Eye, BarChart2 } from "lucide-react";
import { SiInstagram, SiYoutube,  SiFacebook, SiThreads } from "react-icons/si";
import { SiLinkedin } from "@/lib/icon-compat";
import { Fade, Stagger, StaggerItem } from "@/components/ui/animated";
import {
  PageShell,
  PageHeader,
  HeroBanner,
  StatCard,
  StatGrid,
  SectionCard,
  SectionGrid,
} from "@/components/layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { socialPosts, socialAccounts, campaigns, approvalRequests } from "@/lib/mock-data-social";
import { SOCIAL_COLOR } from "@/lib/social-config";


const platformIcons: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  instagram: { icon: SiInstagram, color: "#E11D48", label: "Instagram" },
  youtube: { icon: SiYoutube, color: "#DC2626", label: "YouTube" },
  linkedin: { icon: SiLinkedin, color: "#2563EB", label: "LinkedIn" },
  facebook: { icon: SiFacebook, color: "#1D4ED8", label: "Facebook" },
  threads: { icon: SiThreads, color: "#1F2937", label: "Threads" },
};

export default function SocialDashboard() {
  const [, setLocation] = useLocation();
  const isLoading = useSimulatedLoading(700);

  const pendingApprovals = approvalRequests.filter(a => a.status === "pending");
  const scheduledThisWeek = socialPosts.filter(p => p.stage === "scheduled" && p.scheduledDate && p.scheduledDate >= "2026-02-28" && p.scheduledDate <= "2026-03-06").length;
  const liveCampaigns = campaigns.filter(c => c.status === "active").length;
  const totalReach7d = socialPosts.filter(p => p.publishedDate && p.publishedDate >= "2026-02-21").reduce((sum, p) => sum + (p.metrics?.reach ?? 0), 0);

  const upcomingPosts = socialPosts.filter(p => p.stage === "scheduled" && p.scheduledDate).sort((a, b) => (a.scheduledDate ?? "").localeCompare(b.scheduledDate ?? "")).slice(0, 5);
  const topPosts = socialPosts.filter(p => p.performanceScore !== null).sort((a, b) => (b.performanceScore ?? 0) - (a.performanceScore ?? 0)).slice(0, 3);

  const platformStats = [
    { platform: "instagram", total: socialAccounts.filter(a => a.platform === "instagram").reduce((s, a) => s + a.followers, 0), engagement: 4.8, posts: socialAccounts.filter(a => a.platform === "instagram").reduce((s, a) => s + a.postsThisMonth, 0) },
    { platform: "youtube", total: socialAccounts.filter(a => a.platform === "youtube").reduce((s, a) => s + a.followers, 0), engagement: 6.8, posts: socialAccounts.filter(a => a.platform === "youtube").reduce((s, a) => s + a.postsThisMonth, 0) },
    { platform: "linkedin", total: socialAccounts.filter(a => a.platform === "linkedin").reduce((s, a) => s + a.followers, 0), engagement: 2.6, posts: socialAccounts.filter(a => a.platform === "linkedin").reduce((s, a) => s + a.postsThisMonth, 0) },
    { platform: "facebook", total: socialAccounts.filter(a => a.platform === "facebook").reduce((s, a) => s + a.followers, 0), engagement: 1.6, posts: socialAccounts.filter(a => a.platform === "facebook").reduce((s, a) => s + a.postsThisMonth, 0) },
    { platform: "threads", total: socialAccounts.filter(a => a.platform === "threads").reduce((s, a) => s + a.followers, 0), engagement: 3.5, posts: socialAccounts.filter(a => a.platform === "threads").reduce((s, a) => s + a.postsThisMonth, 0) },
  ];

  const scoreColor = (score: number) => score >= 80 ? "bg-emerald-500" : score >= 60 ? "bg-amber-500" : "bg-red-500";

  if (isLoading) {
    return (
      <PageShell>
        <div className="h-36 bg-muted rounded-2xl animate-pulse" />
        <div className="h-20 bg-muted rounded-xl animate-pulse" />
        <StatGrid>
          {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-muted rounded-xl animate-pulse" />)}
        </StatGrid>
        <div className="flex gap-3 overflow-hidden">
          {[...Array(5)].map((_, i) => <div key={i} className="h-28 flex-1 bg-muted rounded-xl animate-pulse" />)}
        </div>
        <SectionGrid>
          <div className="h-64 bg-muted rounded-xl animate-pulse" />
          <div className="h-64 bg-muted rounded-xl animate-pulse" />
        </SectionGrid>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <HeroBanner
        eyebrow="Good morning, Ananya"
        headline="SocialDesk"
        tagline="Content ops & brand performance across Suprans, LegalNations, USDrop and Gullee"
        color={SOCIAL_COLOR}
        colorDark="#0891B2"
        metrics={[
          { label: "Scheduled", value: scheduledThisWeek },
          { label: "Pending", value: pendingApprovals.length },
          { label: "Live Campaigns", value: liveCampaigns }
        ]}
      />

      {pendingApprovals.length > 0 && (
        <div className="rounded-xl border-2 border-amber-400 bg-amber-50 dark:bg-amber-950/20 p-4 flex items-center gap-4" data-testid="founder-approval-widget">
          <div className="size-10 rounded-full bg-amber-400 flex items-center justify-center shrink-0">
            <Bell size={18} className="text-white" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-amber-800 dark:text-amber-300">
              {pendingApprovals.length} post{pendingApprovals.length > 1 ? "s" : ""} need your approval before scheduling
            </p>
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
              {pendingApprovals.filter(a => a.priority === "high").length} high priority · Includes event promos and feature launches
            </p>
          </div>
          <Button
            size="sm"
            className="bg-amber-500 hover:bg-amber-600 text-white shrink-0"
            onClick={() => setLocation("/social/approvals")}
            data-testid="btn-review-approvals"
          >
            Review Now
          </Button>
        </div>
      )}

      <StatGrid>
        <StatCard label="Scheduled This Week" value={scheduledThisWeek} icon={Calendar} iconBg="rgba(13, 148, 136, 0.1)" iconColor="#0D9488" />
        <StatCard label="Pending Approvals" value={pendingApprovals.length} icon={Bell} iconBg={pendingApprovals.length > 0 ? "rgba(245, 158, 11, 0.1)" : "rgba(13, 148, 136, 0.1)"} iconColor={pendingApprovals.length > 0 ? "#f59e0b" : "#0D9488"} />
        <StatCard label="Live Campaigns" value={liveCampaigns} icon={Target} iconBg="rgba(124, 58, 237, 0.1)" iconColor="#7c3aed" />
        <StatCard label="Total Reach (7d)" value={`${(totalReach7d / 1000).toFixed(0)}K`} icon={Eye} iconBg="rgba(14, 165, 233, 0.1)" iconColor="#0ea5e9" />
      </StatGrid>

      <div className="flex gap-3 overflow-x-auto pb-2">
        {platformStats.map(({ platform, total, engagement, posts }) => {
          const { icon: Icon, color, label } = platformIcons[platform];
          return (
            <div key={platform} className="min-w-[140px] flex-1 rounded-xl border bg-card p-3 flex flex-col gap-2" data-testid={`platform-card-${platform}`}>
              <div className="flex items-center gap-2">
                <Icon size={16} style={{ color }} />
                <span className="text-xs font-semibold">{label}</span>
              </div>
              <p className="text-lg font-bold">{(total / 1000).toFixed(1)}K</p>
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>{engagement}% eng</span>
                <span>{posts} posts</span>
              </div>
            </div>
          );
        })}
      </div>

      <SectionGrid>
        <SectionCard title="Upcoming Scheduled Posts">
          <div className="space-y-3">
            {upcomingPosts.map(post => (
              <div
                key={post.id}
                className="flex items-start gap-3 p-2 rounded-lg hover:bg-accent cursor-pointer transition-colors"
                onClick={() => setLocation(`/social/posts/${post.id}`)}
                data-testid={`upcoming-post-${post.id}`}
              >
                <div className="size-8 rounded-md flex items-center justify-center shrink-0" style={{ background: `${SOCIAL_COLOR}20` }}>
                  <span className="text-[10px] font-bold" style={{ color: SOCIAL_COLOR }}>{post.mediaType.slice(0, 2).toUpperCase()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{post.caption.slice(0, 60)}…</p>
                  <div className="flex items-center gap-1 mt-1 flex-wrap">
                    {post.platforms.slice(0, 3).map(p => {
                      const { icon: PIcon, color } = platformIcons[p];
                      return <PIcon key={p} size={10} style={{ color }} />;
                    })}
                    <Badge variant="outline" className="text-[9px] px-1 py-0">{post.scheduledDate}</Badge>
                  </div>
                </div>
              </div>
            ))}
            {upcomingPosts.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No scheduled posts this week</p>}
          </div>
        </SectionCard>

        <SectionCard title="Top Performers">
          <div className="space-y-3">
            {topPosts.map((post, i) => (
              <div
                key={post.id}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent cursor-pointer transition-colors"
                onClick={() => setLocation(`/social/posts/${post.id}`)}
                data-testid={`top-post-${post.id}`}
              >
                <div className="size-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ background: SOCIAL_COLOR }}>
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{post.caption.slice(0, 55)}…</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {(post.metrics?.reach ?? 0).toLocaleString()} reach · {(post.metrics?.engagement ?? 0).toLocaleString()} eng
                  </p>
                </div>
                <div className={`size-8 rounded-full ${scoreColor(post.performanceScore ?? 0)} flex items-center justify-center shrink-0`}>
                  <span className="text-[10px] font-bold text-white">{post.performanceScore}</span>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </SectionGrid>
    </PageShell>
  );
}
