import { useState } from "react";
import { useLocation } from "wouter";
import { Sparkles, Send } from "lucide-react";
import { SiInstagram, SiYoutube,  SiFacebook, SiThreads } from "react-icons/si";
import { SiLinkedin } from "@/lib/icon-compat";
import { PageShell } from "@/components/layout";
import { PageTransition, Fade } from "@/components/ui/animated";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { campaigns } from "@/lib/mock-data-social";
import { SOCIAL_COLOR } from "@/lib/social-config";


const platformOptions = [
  { id: "instagram", label: "Instagram", icon: SiInstagram, color: "#E11D48" },
  { id: "youtube", label: "YouTube", icon: SiYoutube, color: "#DC2626" },
  { id: "linkedin", label: "LinkedIn", icon: SiLinkedin, color: "#2563EB" },
  { id: "facebook", label: "Facebook", icon: SiFacebook, color: "#1D4ED8" },
  { id: "threads", label: "Threads", icon: SiThreads, color: "#1F2937" },
];

const mockAiTexts: Record<string, string> = {
  caption: "\n\n✨ [AI Generated] Indian founders — your US company can be live in 5 business days. No travel required. We've helped 500+ founders go global from their laptops. Your next chapter starts now. DM us or click link in bio. 🚀 #IndianFounders #USCompany #GlobalBusiness",
  hooks: "\n\n🪝 [AI Hooks] Try one of these:\n→ \"What no one tells you about running a US business from India...\"\n→ \"I registered my US company from Bangalore — here's exactly how\"\n→ \"The 5-day shortcut Indian founders use to go global\"",
  cta: "\n\n📣 [AI CTA] Add one of these:\n→ \"DM 'US' and we'll send you the full guide\"\n→ \"Save this post — you'll thank yourself later\"\n→ \"Comment your city 👇 and let's connect\"",
};

export default function SocialComposer() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [caption, setCaption] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(["instagram"]);
  const [mediaType, setMediaType] = useState("reel");
  const [campaignId, setCampaignId] = useState("");
  const [verticalTag, setVerticalTag] = useState("Suprans");
  const [workflowStage, setWorkflowStage] = useState("idea");
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("09:00");
  const [mediaAttached, setMediaAttached] = useState(false);
  const [aiLoading, setAiLoading] = useState<string | null>(null);

  const togglePlatform = (id: string) => {
    setSelectedPlatforms(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
  };

  const handleAI = async (type: string) => {
    setAiLoading(type);
    await new Promise(r => setTimeout(r, 1200));
    setCaption(prev => prev + mockAiTexts[type]);
    setAiLoading(null);
    toast({ title: "AI Suggestion Added", description: `${type === "caption" ? "Caption" : type === "hooks" ? "Hooks" : "CTA"} appended to your draft.` });
  };

  const handleSendForApproval = () => {
    toast({ title: "Sent for Founder Approval ✅", description: "The post has been submitted to the approval queue. You'll be notified when reviewed." });
  };

  const handleSaveDraft = () => {
    toast({ title: "Saved as Draft", description: "Your post has been saved. You can continue editing anytime." });
  };

  return (
    <PageShell>
    <PageTransition>
      <Fade>
        <div className="mb-6">
          <h1 className="text-2xl font-bold font-heading">Post Composer</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Create and schedule content across all brands and platforms</p>
        </div>
      </Fade>

      <div className="flex gap-6">
        <div className="flex-1 space-y-5">
          <Fade>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Caption</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Textarea
                  placeholder="Write your caption here, or use AI tools below to generate one..."
                  value={caption}
                  onChange={e => setCaption(e.target.value)}
                  rows={8}
                  className="resize-none text-sm leading-relaxed"
                  data-testid="input-caption"
                />
                <div className="flex gap-2 flex-wrap">
                  {[
                    { key: "caption", label: "✨ Generate Caption" },
                    { key: "hooks", label: "🪝 Write Hooks" },
                    { key: "cta", label: "📣 Add CTA" },
                  ].map(({ key, label }) => (
                    <Button
                      key={key}
                      size="sm"
                      variant="outline"
                      onClick={() => handleAI(key)}
                      disabled={aiLoading === key}
                      data-testid={`btn-ai-${key}`}
                    >
                      {aiLoading === key ? (
                        <span className="flex items-center gap-1.5"><Sparkles size={12} className="animate-pulse" /> Generating…</span>
                      ) : label}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </Fade>

          <Fade>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Select Platforms</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {platformOptions.map(({ id, label, icon: Icon, color }) => (
                    <div key={id} className="flex items-center gap-3">
                      <Checkbox
                        id={`platform-${id}`}
                        checked={selectedPlatforms.includes(id)}
                        onCheckedChange={() => togglePlatform(id)}
                        data-testid={`checkbox-${id}`}
                      />
                      <label htmlFor={`platform-${id}`} className="flex items-center gap-2 cursor-pointer text-sm">
                        <Icon size={16} style={{ color }} />
                        {label}
                      </label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </Fade>

          <Fade>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Media</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">Media Type</Label>
                  <select
                    value={mediaType}
                    onChange={e => setMediaType(e.target.value)}
                    className="w-full text-sm border rounded-lg px-3 py-2 bg-background"
                    data-testid="select-media-type"
                  >
                    {["reel", "carousel", "static", "story", "short", "long-video"].map(t => (
                      <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1).replace("-", " ")}</option>
                    ))}
                  </select>
                </div>
                {mediaAttached ? (
                  <div className="flex items-center gap-3 p-3 bg-teal-50 dark:bg-teal-950/20 rounded-lg border border-teal-200 dark:border-teal-800">
                    <div className="size-8 rounded bg-teal-500 flex items-center justify-center">
                      <span className="text-white text-xs font-bold">1</span>
                    </div>
                    <p className="text-sm text-teal-800 dark:text-teal-300 font-medium">1 file attached</p>
                    <button onClick={() => setMediaAttached(false)} className="ml-auto text-xs text-muted-foreground hover:text-foreground">Remove</button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => setMediaAttached(true)}
                    className="w-full"
                    data-testid="btn-attach-media"
                  >
                    Attach Media
                  </Button>
                )}
              </CardContent>
            </Card>
          </Fade>
        </div>

        <div className="w-72 shrink-0">
          <div className="sticky top-6">
            <Fade>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Post Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Campaign</Label>
                    <select
                      value={campaignId}
                      onChange={e => setCampaignId(e.target.value)}
                      className="w-full text-sm border rounded-lg px-3 py-2 bg-background"
                      data-testid="select-campaign"
                    >
                      <option value="">No Campaign</option>
                      {campaigns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs">Vertical Tag</Label>
                    <select
                      value={verticalTag}
                      onChange={e => setVerticalTag(e.target.value)}
                      className="w-full text-sm border rounded-lg px-3 py-2 bg-background"
                      data-testid="select-vertical"
                    >
                      {["Suprans", "LegalNations", "USDrop", "Gullee", "General"].map(v => <option key={v}>{v}</option>)}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs">Workflow Stage</Label>
                    <select
                      value={workflowStage}
                      onChange={e => setWorkflowStage(e.target.value)}
                      className="w-full text-sm border rounded-lg px-3 py-2 bg-background"
                      data-testid="select-stage"
                    >
                      {["idea", "script", "design", "caption"].map(s => (
                        <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs">Schedule Date</Label>
                    <input
                      type="date"
                      value={scheduleDate}
                      onChange={e => setScheduleDate(e.target.value)}
                      className="w-full text-sm border rounded-lg px-3 py-2 bg-background"
                      data-testid="input-schedule-date"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs">Schedule Time</Label>
                    <input
                      type="time"
                      value={scheduleTime}
                      onChange={e => setScheduleTime(e.target.value)}
                      className="w-full text-sm border rounded-lg px-3 py-2 bg-background"
                      data-testid="input-schedule-time"
                    />
                  </div>

                  <Separator />

                  <Button
                    className="w-full text-white"
                    style={{ background: SOCIAL_COLOR }}
                    onClick={handleSendForApproval}
                    data-testid="btn-send-approval"
                  >
                    <Send size={14} className="mr-2" />
                    Send for Founder Approval
                  </Button>

                  <Button
                    variant="ghost"
                    className="w-full"
                    onClick={handleSaveDraft}
                    data-testid="btn-save-draft"
                  >
                    Save as Draft
                  </Button>
                </CardContent>
              </Card>
            </Fade>
          </div>
        </div>
      </div>
    </PageTransition>
    </PageShell>
  );
}
