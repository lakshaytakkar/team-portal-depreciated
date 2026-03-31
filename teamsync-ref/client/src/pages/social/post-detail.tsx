import { useLocation, useRoute } from "wouter";
import { ArrowLeft, Mail, RefreshCw } from "lucide-react";
import { SiWhatsapp, SiInstagram, SiYoutube,  SiFacebook, SiThreads } from "react-icons/si";
import { SiLinkedin } from "@/lib/icon-compat";
import { PageTransition, Fade } from "@/components/ui/animated";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { useToast } from "@/hooks/use-toast";
import { socialPosts, campaigns } from "@/lib/mock-data-social";
import { SOCIAL_COLOR } from "@/lib/social-config";
import { StatusBadge } from "@/components/ds/status-badge";
import { PageShell } from "@/components/layout";


const stageOrder = ["idea", "script", "design", "caption", "approval", "scheduled", "published"];

const stageTimestamps: Record<string, string> = {
  idea: "Jan 25, 2026",
  script: "Jan 28, 2026",
  design: "Feb 2, 2026",
  caption: "Feb 5, 2026",
  approval: "Feb 8, 2026",
  scheduled: "Feb 10, 2026",
  published: "Feb 14, 2026",
};

const mediaColors: Record<string, string> = {
  reel: "#E11D48", carousel: "#7C3AED", static: "#2563EB", story: "#EA580C", short: "#DC2626", "long-video": "#0D9488",
};

const platformIcons: Record<string, { icon: React.ElementType; color: string }> = {
  instagram: { icon: SiInstagram, color: "#E11D48" },
  youtube: { icon: SiYoutube, color: "#DC2626" },
  linkedin: { icon: SiLinkedin, color: "#2563EB" },
  facebook: { icon: SiFacebook, color: "#1D4ED8" },
  threads: { icon: SiThreads, color: "#1F2937" },
};

export default function SocialPostDetail() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/social/posts/:id");
  const { toast } = useToast();
  const isLoading = useSimulatedLoading(500);

  const post = socialPosts.find(p => p.id === params?.id);
  const campaign = campaigns.find(c => c.id === post?.campaignId);

  const currentStageIdx = post ? stageOrder.indexOf(post.stage) : -1;

  const handleRepurpose = (type: string) => {
    toast({ title: "Added to Queue", description: `"${type}" added to repurpose queue. Team will be notified.` });
  };

  if (isLoading) {
    return (
      <PageShell>
        <div className="h-8 bg-muted rounded w-48" />
        <div className="grid grid-cols-5 gap-6">
          <div className="col-span-3 space-y-4"><div className="h-40 bg-muted rounded-xl" /><div className="h-40 bg-muted rounded-xl" /></div>
          <div className="col-span-2 space-y-4"><div className="h-80 bg-muted rounded-xl" /></div>
        </div>
      </PageShell>
    );
  }

  if (!post) {
    return (
      <div className="px-16 py-6 lg:px-24 text-center py-32">
        <p className="text-muted-foreground">Post not found</p>
        <Button variant="outline" className="mt-4" onClick={() => setLocation("/social/posts")}>Back to Library</Button>
      </div>
    );
  }

  const scoreColor = (score: number) => score >= 80 ? "bg-emerald-500" : score >= 60 ? "bg-amber-500" : "bg-red-500";

  return (
    <PageTransition className="px-16 py-6 lg:px-24 space-y-6">
      <Fade>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => setLocation("/social/posts")} data-testid="btn-back">
            <ArrowLeft size={16} className="mr-1" /> Post Library
          </Button>
          <div className="flex items-center gap-2 flex-wrap">
            <StatusBadge status={post.stage} />
            <Badge variant="outline" className="capitalize">{post.mediaType}</Badge>
            <Badge variant="outline">{post.verticalTag}</Badge>
          </div>
          <div className="ml-auto flex gap-2">
            <Button size="sm" variant="outline" data-testid="btn-whatsapp">
              <SiWhatsapp size={14} className="mr-1.5 text-green-500" /> WhatsApp
            </Button>
            <Button size="sm" variant="outline" data-testid="btn-email">
              <Mail size={14} className="mr-1.5" /> Email
            </Button>
          </div>
        </div>
      </Fade>

      <div className="grid grid-cols-5 gap-6">
        <div className="col-span-3 space-y-4">
          <Fade>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Caption</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{post.caption}</p>
              </CardContent>
            </Card>
          </Fade>

          <Fade>
            <Card>
              <CardContent className="p-0">
                <div
                  className="h-48 rounded-t-xl flex items-center justify-center"
                  style={{ background: `${mediaColors[post.mediaType] ?? "#94A3B8"}20` }}
                >
                  <div className="text-center">
                    <div
                      className="w-12 h-12 rounded-xl mx-auto flex items-center justify-center mb-2"
                      style={{ background: mediaColors[post.mediaType] ?? "#94A3B8" }}
                    >
                      <span className="text-white text-xs font-bold capitalize">{post.mediaType.slice(0, 3).toUpperCase()}</span>
                    </div>
                    <p className="text-xs text-muted-foreground capitalize">{post.mediaType} — Media Placeholder</p>
                  </div>
                </div>
                <div className="p-4 flex items-center gap-3 flex-wrap">
                  {post.platforms.map(p => {
                    const { icon: PIcon, color } = platformIcons[p];
                    return <div key={p} className="flex items-center gap-1.5 text-xs"><PIcon size={14} style={{ color }} /></div>;
                  })}
                  <span className="text-xs text-muted-foreground">·</span>
                  {campaign && <Badge variant="outline" className="text-[10px]">{campaign.name}</Badge>}
                  {post.notes && <p className="text-xs text-muted-foreground italic">"{post.notes}"</p>}
                </div>
              </CardContent>
            </Card>
          </Fade>

          {(post.mediaType === "reel" || post.mediaType === "long-video") && (
            <Fade>
              <Card className="border-teal-200 dark:border-teal-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <RefreshCw size={14} style={{ color: SOCIAL_COLOR }} />
                    Repurpose This Content
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex gap-2 flex-wrap">
                  {[
                    { label: "Cut as Short (60s)", desc: "Trim for YouTube Shorts + Instagram" },
                    { label: "Trim for LinkedIn", desc: "Optimise for LinkedIn audience" },
                    { label: "Extract Highlights", desc: "Pull key moments into clips" },
                  ].map(({ label, desc }) => (
                    <button
                      key={label}
                      onClick={() => handleRepurpose(label)}
                      className="flex-1 min-w-[140px] rounded-lg border border-teal-200 dark:border-teal-700 p-3 text-left hover:bg-teal-50 dark:hover:bg-teal-950/20 transition-colors"
                      data-testid={`btn-repurpose-${label.replace(/\s/g, "-").toLowerCase()}`}
                    >
                      <p className="text-xs font-semibold" style={{ color: SOCIAL_COLOR }}>{label}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{desc}</p>
                    </button>
                  ))}
                </CardContent>
              </Card>
            </Fade>
          )}
        </div>

        <div className="col-span-2 space-y-4">
          <Fade>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Workflow Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-0">
                  {stageOrder.map((stage, idx) => {
                    const isCompleted = idx < currentStageIdx;
                    const isCurrent = idx === currentStageIdx;
                    const isPending = idx > currentStageIdx;
                    return (
                      <div key={stage} className="flex items-start gap-3">
                        <div className="flex flex-col items-center">
                          <div className={`size-5 rounded-full flex items-center justify-center mt-0.5 ${
                            isCompleted ? "text-white" : isCurrent ? "border-2 bg-background" : "border-2 border-border bg-background"
                          }`} style={{
                            background: isCompleted ? SOCIAL_COLOR : undefined,
                            borderColor: isCurrent ? SOCIAL_COLOR : undefined,
                          }}>
                            {isCompleted && <span className="text-[9px]">✓</span>}
                            {isCurrent && <div className="size-2 rounded-full" style={{ background: SOCIAL_COLOR }} />}
                          </div>
                          {idx < stageOrder.length - 1 && (
                            <div className={`w-0.5 h-7 mt-0.5 ${isCompleted ? "" : "bg-border"}`} style={{ background: isCompleted ? SOCIAL_COLOR : undefined }} />
                          )}
                        </div>
                        <div className="pb-1">
                          <p className={`text-xs font-medium capitalize ${isPending ? "text-muted-foreground" : ""}`}>{stage}</p>
                          {(isCompleted || isCurrent) && <p className="text-[10px] text-muted-foreground">{stageTimestamps[stage] ?? "—"}</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </Fade>

          {post.metrics && post.stage === "published" && (
            <Fade>
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">Performance</CardTitle>
                    <div className={`size-10 rounded-full flex items-center justify-center text-sm font-bold text-white ${scoreColor(post.performanceScore ?? 0)}`}>
                      {post.performanceScore}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "Reach", value: post.metrics.reach.toLocaleString() },
                      { label: "Impressions", value: post.metrics.impressions.toLocaleString() },
                      { label: "Engagement", value: post.metrics.engagement.toLocaleString() },
                      { label: "Saves", value: post.metrics.saves.toLocaleString() },
                      { label: "Shares", value: post.metrics.shares.toLocaleString() },
                      { label: "Watch Time", value: `${Math.floor(post.metrics.watchTime / 60)}m` },
                      { label: "Clicks", value: post.metrics.clicks.toLocaleString() },
                      { label: "New Followers", value: `+${post.metrics.followerGain}` },
                    ].map(({ label, value }) => (
                      <div key={label} className="bg-muted/40 rounded-lg p-2.5">
                        <p className="text-[10px] text-muted-foreground">{label}</p>
                        <p className="text-sm font-bold">{value}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </Fade>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
