import { useLocation, useRoute } from "wouter";
import { PersonCell } from "@/components/ui/avatar-cells";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { SiInstagram, SiYoutube,  SiFacebook, SiThreads } from "react-icons/si";
import { SiLinkedin } from "@/lib/icon-compat";
import { PageTransition, Fade } from "@/components/ui/animated";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { campaigns, socialPosts, type PostStage } from "@/lib/mock-data-social";
import { StatusBadge } from "@/components/ds/status-badge";
import { SOCIAL_COLOR } from "@/lib/social-config";
import { PageShell } from "@/components/layout";


const platformIcons: Record<string, { icon: React.ElementType; color: string }> = {
  instagram: { icon: SiInstagram, color: "#E11D48" },
  youtube: { icon: SiYoutube, color: "#DC2626" },
  linkedin: { icon: SiLinkedin, color: "#2563EB" },
  facebook: { icon: SiFacebook, color: "#1D4ED8" },
  threads: { icon: SiThreads, color: "#1F2937" },
};

export default function SocialCampaignDetail() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/social/campaigns/:id");
  const isLoading = useSimulatedLoading(500);

  const campaign = campaigns.find(c => c.id === params?.id);
  const linkedPosts = socialPosts.filter(p => p.campaignId === params?.id);

  if (isLoading) {
    return (
      <PageShell>
        <div className="h-8 bg-muted rounded w-48" />
        <div className="h-28 bg-muted rounded-2xl" />
        <div className="grid grid-cols-5 gap-4">{[...Array(5)].map((_, i) => <div key={i} className="h-20 bg-muted rounded-xl" />)}</div>
        <div className="grid grid-cols-2 gap-6"><div className="h-48 bg-muted rounded-xl" /><div className="h-48 bg-muted rounded-xl" /></div>
      </PageShell>
    );
  }

  if (!campaign) {
    return (
      <div className="px-16 py-6 lg:px-24 text-center py-32">
        <p className="text-muted-foreground">Campaign not found</p>
        <Button variant="outline" className="mt-4" onClick={() => setLocation("/social/campaigns")}>Back to Campaigns</Button>
      </div>
    );
  }

  const avgEngagement = campaign.totalEngagement > 0 && campaign.totalReach > 0
    ? ((campaign.totalEngagement / campaign.totalReach) * 100).toFixed(1)
    : "0";

  return (
    <PageTransition className="px-16 py-6 lg:px-24 space-y-6">
      <Fade>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => setLocation("/social/campaigns")} data-testid="btn-back">
            <ArrowLeft size={16} className="mr-1" /> Campaigns
          </Button>
          <h1 className="text-xl font-bold font-heading">{campaign.name}</h1>
          <Badge className={statusColors[campaign.status]}>{campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}</Badge>
          <Badge variant="outline">{campaign.brand}</Badge>
        </div>
      </Fade>

      <Fade>
        <div
          className="rounded-2xl p-6 text-white"
          style={{ background: `linear-gradient(135deg, ${SOCIAL_COLOR} 0%, #0891B2 100%)` }}
        >
          <p className="text-xs text-white/70 uppercase tracking-wider font-medium mb-1">Campaign Goal</p>
          <p className="text-lg font-semibold">{campaign.goal}</p>
          <p className="text-sm text-white/70 mt-2">{campaign.startDate} → {campaign.endDate} · Managed by {campaign.managedBy}</p>
        </div>
      </Fade>

      <Fade>
        <div className="grid grid-cols-5 gap-4">
          {[
            { label: "Total Posts", value: campaign.postCount },
            { label: "Total Reach", value: `${(campaign.totalReach / 1000).toFixed(0)}K` },
            { label: "Avg Engagement", value: `${avgEngagement}%` },
            { label: "Leads Generated", value: campaign.leads },
            { label: "Revenue", value: `₹${(campaign.revenue / 100000).toFixed(1)}L` },
          ].map((s, i) => (
            <div key={i} className="rounded-xl border bg-card p-4" data-testid={`camp-stat-${i}`}>
              <p className="text-xl font-bold">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </Fade>

      <div className="grid grid-cols-2 gap-6">
        <Fade>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Campaign Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground">Description</p>
                <p className="text-sm mt-0.5 leading-relaxed">{campaign.description}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Platforms</p>
                <div className="flex gap-2 mt-1.5">
                  {campaign.platforms.map(p => {
                    const cfg = platformIcons[p];
                    if (!cfg) return null;
                    const PIcon = cfg.icon;
                    return <PIcon key={p} size={16} style={{ color: cfg.color }} />;
                  })}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">Start Date</p>
                  <p className="text-sm font-medium">{campaign.startDate}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">End Date</p>
                  <p className="text-sm font-medium">{campaign.endDate}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Managed By</p>
                <PersonCell name={campaign.managedBy} size="sm" />
              </div>
            </CardContent>
          </Card>
        </Fade>

        <Fade>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Leads → Revenue Pipeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between gap-2">
                {[
                  { label: "Leads", value: campaign.leads, color: "bg-sky-500" },
                  { label: "Conversions", value: Math.round(campaign.leads * 0.25), color: "bg-violet-500" },
                  { label: "Revenue", value: `₹${(campaign.revenue / 100000).toFixed(1)}L`, color: "bg-teal-500" },
                ].map((step, i, arr) => (
                  <div key={step.label} className="flex items-center gap-2">
                    <div className="text-center">
                      <div className={`${step.color} rounded-xl px-4 py-3 text-white`}>
                        <p className="text-lg font-bold">{step.value}</p>
                        <p className="text-[10px] opacity-80">{step.label}</p>
                      </div>
                    </div>
                    {i < arr.length - 1 && (
                      <ArrowRight size={16} className="text-muted-foreground shrink-0" />
                    )}
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground mt-4">
                Conversion rate: {campaign.leads > 0 ? ((Math.round(campaign.leads * 0.25) / campaign.leads) * 100).toFixed(0) : 0}% · Avg deal value: ₹{campaign.revenue > 0 && Math.round(campaign.leads * 0.25) > 0 ? Math.round(campaign.revenue / Math.round(campaign.leads * 0.25)).toLocaleString() : "—"}
              </p>
            </CardContent>
          </Card>
        </Fade>
      </div>

      <Fade>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Linked Posts ({linkedPosts.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 border-b">
                  <tr>
                    <th className="text-left p-3 font-medium text-muted-foreground text-xs">Caption</th>
                    <th className="text-left p-3 font-medium text-muted-foreground text-xs">Platforms</th>
                    <th className="text-left p-3 font-medium text-muted-foreground text-xs">Stage</th>
                    <th className="text-left p-3 font-medium text-muted-foreground text-xs">Score</th>
                    <th className="text-left p-3 font-medium text-muted-foreground text-xs">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {linkedPosts.map(post => (
                    <tr
                      key={post.id}
                      className="border-b last:border-0 hover:bg-accent cursor-pointer transition-colors"
                      onClick={() => setLocation(`/social/posts/${post.id}`)}
                      data-testid={`linked-post-${post.id}`}
                    >
                      <td className="p-3 text-xs max-w-[300px]">
                        <p className="truncate">{post.caption.slice(0, 70)}…</p>
                        <p className="text-muted-foreground capitalize">{post.mediaType}</p>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-1">
                          {post.platforms.map(p => {
                            const cfg = platformIcons[p];
                            if (!cfg) return null;
                            const PIcon = cfg.icon;
                            return <PIcon key={p} size={12} style={{ color: cfg.color }} />;
                          })}
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge >
                          {post.stage.charAt(0).toUpperCase() + post.stage.slice(1)}
                        </Badge>
                      </td>
                      <td className="p-3">
                        {post.performanceScore !== null ? (
                          <div className={`size-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${post.performanceScore >= 80 ? "bg-emerald-500" : post.performanceScore >= 60 ? "bg-amber-500" : "bg-red-500"}`}>
                            {post.performanceScore}
                          </div>
                        ) : <span className="text-muted-foreground text-xs">—</span>}
                      </td>
                      <td className="p-3 text-xs text-muted-foreground">{post.scheduledDate ?? post.publishedDate ?? "—"}</td>
                    </tr>
                  ))}
                  {linkedPosts.length === 0 && (
                    <tr><td colSpan={5} className="text-center py-8 text-muted-foreground">No posts linked to this campaign yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </Fade>
    </PageTransition>
  );
}
