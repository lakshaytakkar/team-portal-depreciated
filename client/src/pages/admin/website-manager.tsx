import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Save, Plus, Trash2, GripVertical, Globe, Megaphone, BarChart3, HelpCircle, Video, Building2, Phone, Link2, MessageSquare, Award, Target } from "lucide-react";

type ContentMap = Record<string, Record<string, any>>;

function useWebsiteContent() {
  return useQuery<ContentMap>({
    queryKey: ["/api/public/website-content"],
  });
}

function useSaveContent() {
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (data: { section: string; key: string; value: any }) => {
      return apiRequest("PATCH", "/api/website-content", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/public/website-content"] });
      toast({ title: "Saved", description: "Content updated successfully." });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });
}

function SiteBannerSection({ content }: { content: ContentMap }) {
  const save = useSaveContent();
  const [text, setText] = useState(content?.site_banner?.text || "");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Megaphone className="h-5 w-5" /> Site Banner</CardTitle>
        <CardDescription>The announcement bar shown at the top of every page</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Banner text..."
          data-testid="input-banner-text"
        />
        <Button
          onClick={() => save.mutate({ section: "site_banner", key: "text", value: text })}
          disabled={save.isPending}
          data-testid="button-save-banner"
        >
          <Save className="h-4 w-4 mr-2" />
          Save Banner
        </Button>
      </CardContent>
    </Card>
  );
}

function HeroSection({ content }: { content: ContentMap }) {
  const save = useSaveContent();
  const hero = content?.home_hero || {};
  const [tags, setTags] = useState<string[]>(hero.tags || []);
  const [trustBadge, setTrustBadge] = useState(hero.trust_badge || "");
  const [headline, setHeadline] = useState(hero.headline || "");
  const [headlineSub, setHeadlineSub] = useState(hero.headline_subtitle || "");
  const [description, setDescription] = useState(hero.description || "");
  const [descMobile, setDescMobile] = useState(hero.description_mobile || "");
  const [ctaPrimary, setCtaPrimary] = useState(hero.cta_primary || { text: "", link: "" });
  const [ctaSecondary, setCtaSecondary] = useState(hero.cta_secondary || { text: "", link: "" });

  const saveAll = async () => {
    await save.mutateAsync({ section: "home_hero", key: "tags", value: tags });
    await save.mutateAsync({ section: "home_hero", key: "trust_badge", value: trustBadge });
    await save.mutateAsync({ section: "home_hero", key: "headline", value: headline });
    await save.mutateAsync({ section: "home_hero", key: "headline_subtitle", value: headlineSub });
    await save.mutateAsync({ section: "home_hero", key: "description", value: description });
    await save.mutateAsync({ section: "home_hero", key: "description_mobile", value: descMobile });
    await save.mutateAsync({ section: "home_hero", key: "cta_primary", value: ctaPrimary });
    await save.mutateAsync({ section: "home_hero", key: "cta_secondary", value: ctaSecondary });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Globe className="h-5 w-5" /> Homepage Hero</CardTitle>
        <CardDescription>Main headline, tags, and call-to-action buttons</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Headline</label>
          <Input value={headline} onChange={(e) => setHeadline(e.target.value)} data-testid="input-hero-headline" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Subtitle</label>
          <Input value={headlineSub} onChange={(e) => setHeadlineSub(e.target.value)} data-testid="input-hero-subtitle" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Description (Desktop)</label>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} data-testid="input-hero-description" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Description (Mobile)</label>
          <Input value={descMobile} onChange={(e) => setDescMobile(e.target.value)} data-testid="input-hero-desc-mobile" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Trust Badge Text</label>
          <Input value={trustBadge} onChange={(e) => setTrustBadge(e.target.value)} data-testid="input-hero-trust" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Expertise Tags</label>
          {tags.map((tag, i) => (
            <div key={i} className="flex items-center gap-2">
              <Input
                value={tag}
                onChange={(e) => { const t = [...tags]; t[i] = e.target.value; setTags(t); }}
                data-testid={`input-hero-tag-${i}`}
              />
              <Button variant="ghost" size="icon" onClick={() => setTags(tags.filter((_, j) => j !== i))}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={() => setTags([...tags, ""])}>
            <Plus className="h-4 w-4 mr-1" /> Add Tag
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Primary CTA Text</label>
            <Input value={ctaPrimary.text} onChange={(e) => setCtaPrimary({ ...ctaPrimary, text: e.target.value })} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Primary CTA Link</label>
            <Input value={ctaPrimary.link} onChange={(e) => setCtaPrimary({ ...ctaPrimary, link: e.target.value })} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Secondary CTA Text</label>
            <Input value={ctaSecondary.text} onChange={(e) => setCtaSecondary({ ...ctaSecondary, text: e.target.value })} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Secondary CTA Link</label>
            <Input value={ctaSecondary.link} onChange={(e) => setCtaSecondary({ ...ctaSecondary, link: e.target.value })} />
          </div>
        </div>
        <Button onClick={saveAll} disabled={save.isPending} data-testid="button-save-hero">
          <Save className="h-4 w-4 mr-2" /> Save Hero
        </Button>
      </CardContent>
    </Card>
  );
}

function StatsSection({ content }: { content: ContentMap }) {
  const save = useSaveContent();
  const [items, setItems] = useState<Array<{ value: string; label: string }>>(
    content?.home_stats?.items || []
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5" /> Stats</CardTitle>
        <CardDescription>Statistics shown on homepage and about page</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <Input
              value={item.value}
              onChange={(e) => { const n = [...items]; n[i] = { ...n[i], value: e.target.value }; setItems(n); }}
              placeholder="Value (e.g. 1000+)"
              className="w-32"
              data-testid={`input-stat-value-${i}`}
            />
            <Input
              value={item.label}
              onChange={(e) => { const n = [...items]; n[i] = { ...n[i], label: e.target.value }; setItems(n); }}
              placeholder="Label"
              className="flex-1"
              data-testid={`input-stat-label-${i}`}
            />
            <Button variant="ghost" size="icon" onClick={() => setItems(items.filter((_, j) => j !== i))}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setItems([...items, { value: "", label: "" }])}>
            <Plus className="h-4 w-4 mr-1" /> Add Stat
          </Button>
          <Button
            onClick={async () => {
              await save.mutateAsync({ section: "home_stats", key: "items", value: items });
              await save.mutateAsync({ section: "about_stats", key: "items", value: items });
            }}
            disabled={save.isPending}
            data-testid="button-save-stats"
          >
            <Save className="h-4 w-4 mr-2" /> Save Stats
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function ProcessStepsSection({ content }: { content: ContentMap }) {
  const save = useSaveContent();
  const [items, setItems] = useState<Array<{ step: number; title: string; description: string }>>(
    content?.home_process?.items || []
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Target className="h-5 w-5" /> How It Works Steps</CardTitle>
        <CardDescription>Process steps shown on the homepage</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-bold flex-shrink-0">{i + 1}</div>
            <Input
              value={item.title}
              onChange={(e) => { const n = [...items]; n[i] = { ...n[i], title: e.target.value }; setItems(n); }}
              placeholder="Title"
              className="w-48"
            />
            <Input
              value={item.description}
              onChange={(e) => { const n = [...items]; n[i] = { ...n[i], description: e.target.value }; setItems(n); }}
              placeholder="Description"
              className="flex-1"
            />
            <Button variant="ghost" size="icon" onClick={() => setItems(items.filter((_, j) => j !== i))}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setItems([...items, { step: items.length + 1, title: "", description: "" }])}>
            <Plus className="h-4 w-4 mr-1" /> Add Step
          </Button>
          <Button
            onClick={() => save.mutate({ section: "home_process", key: "items", value: items.map((it, i) => ({ ...it, step: i + 1 })) })}
            disabled={save.isPending}
          >
            <Save className="h-4 w-4 mr-2" /> Save Steps
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function FAQsSection({ content }: { content: ContentMap }) {
  const save = useSaveContent();
  const [items, setItems] = useState<Array<{ question: string; answer: string }>>(
    content?.home_faqs?.items || []
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><HelpCircle className="h-5 w-5" /> FAQs</CardTitle>
        <CardDescription>Frequently asked questions on the homepage</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map((item, i) => (
          <div key={i} className="border rounded-md p-3 space-y-2">
            <div className="flex items-center gap-2">
              <Input
                value={item.question}
                onChange={(e) => { const n = [...items]; n[i] = { ...n[i], question: e.target.value }; setItems(n); }}
                placeholder="Question"
                data-testid={`input-faq-question-${i}`}
              />
              <Button variant="ghost" size="icon" onClick={() => setItems(items.filter((_, j) => j !== i))}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <Textarea
              value={item.answer}
              onChange={(e) => { const n = [...items]; n[i] = { ...n[i], answer: e.target.value }; setItems(n); }}
              placeholder="Answer"
              rows={2}
              data-testid={`input-faq-answer-${i}`}
            />
          </div>
        ))}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setItems([...items, { question: "", answer: "" }])}>
            <Plus className="h-4 w-4 mr-1" /> Add FAQ
          </Button>
          <Button onClick={() => save.mutate({ section: "home_faqs", key: "items", value: items })} disabled={save.isPending} data-testid="button-save-faqs">
            <Save className="h-4 w-4 mr-2" /> Save FAQs
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function VideosSection({ content }: { content: ContentMap }) {
  const save = useSaveContent();
  const [items, setItems] = useState<Array<{ id: string; title: string }>>(
    content?.home_videos?.items || []
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Video className="h-5 w-5" /> Video Testimonials</CardTitle>
        <CardDescription>YouTube video IDs shown on the homepage</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <Input
              value={item.id}
              onChange={(e) => { const n = [...items]; n[i] = { ...n[i], id: e.target.value }; setItems(n); }}
              placeholder="YouTube Video ID"
              className="w-56"
              data-testid={`input-video-id-${i}`}
            />
            <Input
              value={item.title}
              onChange={(e) => { const n = [...items]; n[i] = { ...n[i], title: e.target.value }; setItems(n); }}
              placeholder="Title"
              className="flex-1"
              data-testid={`input-video-title-${i}`}
            />
            <Button variant="ghost" size="icon" onClick={() => setItems(items.filter((_, j) => j !== i))}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setItems([...items, { id: "", title: "" }])}>
            <Plus className="h-4 w-4 mr-1" /> Add Video
          </Button>
          <Button onClick={() => save.mutate({ section: "home_videos", key: "items", value: items })} disabled={save.isPending}>
            <Save className="h-4 w-4 mr-2" /> Save Videos
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function AboutSection({ content }: { content: ContentMap }) {
  const save = useSaveContent();
  const about = content?.about_hero || {};
  const mission = content?.about_mission || {};
  const [title, setTitle] = useState(about.title || "");
  const [desc, setDesc] = useState(about.description || "");
  const [p1, setP1] = useState(mission.paragraph1 || "");
  const [p2, setP2] = useState(mission.paragraph2 || "");

  const saveAll = async () => {
    await save.mutateAsync({ section: "about_hero", key: "title", value: title });
    await save.mutateAsync({ section: "about_hero", key: "description", value: desc });
    await save.mutateAsync({ section: "about_mission", key: "paragraph1", value: p1 });
    await save.mutateAsync({ section: "about_mission", key: "paragraph2", value: p2 });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Building2 className="h-5 w-5" /> About Page</CardTitle>
        <CardDescription>Hero text and mission statement for the About page</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Page Title</label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} data-testid="input-about-title" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Hero Description</label>
          <Textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={2} data-testid="input-about-desc" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Mission - Paragraph 1</label>
          <Textarea value={p1} onChange={(e) => setP1(e.target.value)} rows={3} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Mission - Paragraph 2</label>
          <Textarea value={p2} onChange={(e) => setP2(e.target.value)} rows={3} />
        </div>
        <Button onClick={saveAll} disabled={save.isPending} data-testid="button-save-about">
          <Save className="h-4 w-4 mr-2" /> Save About
        </Button>
      </CardContent>
    </Card>
  );
}

function AchievementsSection({ content }: { content: ContentMap }) {
  const save = useSaveContent();
  const [items, setItems] = useState<Array<{ icon: string; label: string }>>(
    content?.about_achievements?.items || []
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Award className="h-5 w-5" /> Founder Achievements</CardTitle>
        <CardDescription>Achievement list shown on About page</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <Input
              value={item.label}
              onChange={(e) => { const n = [...items]; n[i] = { ...n[i], label: e.target.value }; setItems(n); }}
              placeholder="Achievement text"
              className="flex-1"
              data-testid={`input-achievement-${i}`}
            />
            <Button variant="ghost" size="icon" onClick={() => setItems(items.filter((_, j) => j !== i))}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setItems([...items, { icon: "Award", label: "" }])}>
            <Plus className="h-4 w-4 mr-1" /> Add Achievement
          </Button>
          <Button onClick={() => save.mutate({ section: "about_achievements", key: "items", value: items })} disabled={save.isPending}>
            <Save className="h-4 w-4 mr-2" /> Save Achievements
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function ValuesSection({ content }: { content: ContentMap }) {
  const save = useSaveContent();
  const [items, setItems] = useState<Array<{ icon: string; title: string; description: string }>>(
    content?.about_values?.items || []
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Company Values</CardTitle>
        <CardDescription>Values shown on About page</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <Input
              value={item.title}
              onChange={(e) => { const n = [...items]; n[i] = { ...n[i], title: e.target.value }; setItems(n); }}
              placeholder="Title"
              className="w-40"
            />
            <Input
              value={item.description}
              onChange={(e) => { const n = [...items]; n[i] = { ...n[i], description: e.target.value }; setItems(n); }}
              placeholder="Description"
              className="flex-1"
            />
            <Button variant="ghost" size="icon" onClick={() => setItems(items.filter((_, j) => j !== i))}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setItems([...items, { icon: "Target", title: "", description: "" }])}>
            <Plus className="h-4 w-4 mr-1" /> Add Value
          </Button>
          <Button onClick={() => save.mutate({ section: "about_values", key: "items", value: items })} disabled={save.isPending}>
            <Save className="h-4 w-4 mr-2" /> Save Values
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function OfficesSection({ content }: { content: ContentMap }) {
  const save = useSaveContent();
  const [items, setItems] = useState<Array<{ city: string; country: string; countryCode: string; address: string }>>(
    content?.about_offices?.items || []
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Office Locations</CardTitle>
        <CardDescription>Office addresses shown on About page</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map((item, i) => (
          <div key={i} className="border rounded-md p-3 space-y-2">
            <div className="flex items-center gap-2">
              <Input
                value={item.city}
                onChange={(e) => { const n = [...items]; n[i] = { ...n[i], city: e.target.value }; setItems(n); }}
                placeholder="City"
                className="w-32"
              />
              <Input
                value={item.country}
                onChange={(e) => { const n = [...items]; n[i] = { ...n[i], country: e.target.value }; setItems(n); }}
                placeholder="Country"
                className="w-32"
              />
              <Input
                value={item.countryCode}
                onChange={(e) => { const n = [...items]; n[i] = { ...n[i], countryCode: e.target.value }; setItems(n); }}
                placeholder="Code (IN/CN/US)"
                className="w-24"
              />
              <Button variant="ghost" size="icon" onClick={() => setItems(items.filter((_, j) => j !== i))}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <Input
              value={item.address}
              onChange={(e) => { const n = [...items]; n[i] = { ...n[i], address: e.target.value }; setItems(n); }}
              placeholder="Full address"
            />
          </div>
        ))}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setItems([...items, { city: "", country: "", countryCode: "", address: "" }])}>
            <Plus className="h-4 w-4 mr-1" /> Add Office
          </Button>
          <Button onClick={() => save.mutate({ section: "about_offices", key: "items", value: items })} disabled={save.isPending}>
            <Save className="h-4 w-4 mr-2" /> Save Offices
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function ContactSection({ content }: { content: ContentMap }) {
  const save = useSaveContent();
  const ci = content?.contact_info || {};
  const [phones, setPhones] = useState<string[]>(ci.phones || []);
  const [emails, setEmails] = useState<string[]>(ci.emails || []);
  const [whatsapp, setWhatsapp] = useState(ci.whatsapp || { number: "", display: "" });
  const [office, setOffice] = useState(ci.office || "");
  const [hours, setHours] = useState(ci.hours || { weekday: "", weekend: "" });

  const saveAll = async () => {
    await save.mutateAsync({ section: "contact_info", key: "phones", value: phones });
    await save.mutateAsync({ section: "contact_info", key: "emails", value: emails });
    await save.mutateAsync({ section: "contact_info", key: "whatsapp", value: whatsapp });
    await save.mutateAsync({ section: "contact_info", key: "office", value: office });
    await save.mutateAsync({ section: "contact_info", key: "hours", value: hours });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Phone className="h-5 w-5" /> Contact Information</CardTitle>
        <CardDescription>Phone numbers, emails, and business hours on Contact page</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Phone Numbers</label>
          {phones.map((ph, i) => (
            <div key={i} className="flex items-center gap-2">
              <Input value={ph} onChange={(e) => { const n = [...phones]; n[i] = e.target.value; setPhones(n); }} data-testid={`input-phone-${i}`} />
              <Button variant="ghost" size="icon" onClick={() => setPhones(phones.filter((_, j) => j !== i))}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={() => setPhones([...phones, ""])}>
            <Plus className="h-4 w-4 mr-1" /> Add Phone
          </Button>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Email Addresses</label>
          {emails.map((em, i) => (
            <div key={i} className="flex items-center gap-2">
              <Input value={em} onChange={(e) => { const n = [...emails]; n[i] = e.target.value; setEmails(n); }} data-testid={`input-email-${i}`} />
              <Button variant="ghost" size="icon" onClick={() => setEmails(emails.filter((_, j) => j !== i))}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={() => setEmails([...emails, ""])}>
            <Plus className="h-4 w-4 mr-1" /> Add Email
          </Button>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">WhatsApp</label>
          <div className="grid grid-cols-2 gap-4">
            <Input value={whatsapp.number} onChange={(e) => setWhatsapp({ ...whatsapp, number: e.target.value })} placeholder="Number (e.g. 919350818272)" />
            <Input value={whatsapp.display} onChange={(e) => setWhatsapp({ ...whatsapp, display: e.target.value })} placeholder="Display text" />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Office Location</label>
          <Input value={office} onChange={(e) => setOffice(e.target.value)} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Business Hours</label>
          <Input value={hours.weekday} onChange={(e) => setHours({ ...hours, weekday: e.target.value })} placeholder="Weekday hours" />
          <Input value={hours.weekend} onChange={(e) => setHours({ ...hours, weekend: e.target.value })} placeholder="Weekend hours" />
        </div>
        <Button onClick={saveAll} disabled={save.isPending} data-testid="button-save-contact">
          <Save className="h-4 w-4 mr-2" /> Save Contact Info
        </Button>
      </CardContent>
    </Card>
  );
}

function SocialLinksSection({ content }: { content: ContentMap }) {
  const save = useSaveContent();
  const [items, setItems] = useState<Array<{ platform: string; url: string }>>(
    content?.footer_social?.items || []
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><MessageSquare className="h-5 w-5" /> Social Media Links</CardTitle>
        <CardDescription>Social links shown in the footer</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <Input
              value={item.platform}
              onChange={(e) => { const n = [...items]; n[i] = { ...n[i], platform: e.target.value }; setItems(n); }}
              placeholder="Platform (facebook, linkedin, etc.)"
              className="w-40"
            />
            <Input
              value={item.url}
              onChange={(e) => { const n = [...items]; n[i] = { ...n[i], url: e.target.value }; setItems(n); }}
              placeholder="URL"
              className="flex-1"
            />
            <Button variant="ghost" size="icon" onClick={() => setItems(items.filter((_, j) => j !== i))}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setItems([...items, { platform: "", url: "" }])}>
            <Plus className="h-4 w-4 mr-1" /> Add Social Link
          </Button>
          <Button onClick={() => save.mutate({ section: "footer_social", key: "items", value: items })} disabled={save.isPending}>
            <Save className="h-4 w-4 mr-2" /> Save Social Links
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function UsefulLinksSection({ content }: { content: ContentMap }) {
  const save = useSaveContent();
  const [items, setItems] = useState<Array<{ label: string; url: string }>>(
    content?.footer_useful_links?.items || []
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Link2 className="h-5 w-5" /> Useful Links</CardTitle>
        <CardDescription>External links shown in the footer under "Useful Links"</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <Input
              value={item.label}
              onChange={(e) => { const n = [...items]; n[i] = { ...n[i], label: e.target.value }; setItems(n); }}
              placeholder="Link label"
              className="w-56"
              data-testid={`input-useful-link-label-${i}`}
            />
            <Input
              value={item.url}
              onChange={(e) => { const n = [...items]; n[i] = { ...n[i], url: e.target.value }; setItems(n); }}
              placeholder="URL"
              className="flex-1"
              data-testid={`input-useful-link-url-${i}`}
            />
            <Button variant="ghost" size="icon" onClick={() => setItems(items.filter((_, j) => j !== i))}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setItems([...items, { label: "", url: "" }])}>
            <Plus className="h-4 w-4 mr-1" /> Add Link
          </Button>
          <Button
            onClick={() => save.mutate({ section: "footer_useful_links", key: "items", value: items })}
            disabled={save.isPending}
            data-testid="button-save-useful-links"
          >
            <Save className="h-4 w-4 mr-2" /> Save Useful Links
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function FooterContactSection({ content }: { content: ContentMap }) {
  const save = useSaveContent();
  const fc = content?.footer_contact || {};
  const [phones, setPhones] = useState<string[]>(fc.phones || []);
  const [email, setEmail] = useState(fc.email || "");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Footer Contact</CardTitle>
        <CardDescription>Contact info shown in the footer</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Footer Phone Numbers</label>
          {phones.map((ph, i) => (
            <div key={i} className="flex items-center gap-2">
              <Input value={ph} onChange={(e) => { const n = [...phones]; n[i] = e.target.value; setPhones(n); }} />
              <Button variant="ghost" size="icon" onClick={() => setPhones(phones.filter((_, j) => j !== i))}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={() => setPhones([...phones, ""])}>
            <Plus className="h-4 w-4 mr-1" /> Add Phone
          </Button>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Footer Email</label>
          <Input value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <Button
          onClick={async () => {
            await save.mutateAsync({ section: "footer_contact", key: "phones", value: phones });
            await save.mutateAsync({ section: "footer_contact", key: "email", value: email });
          }}
          disabled={save.isPending}
        >
          <Save className="h-4 w-4 mr-2" /> Save Footer Contact
        </Button>
      </CardContent>
    </Card>
  );
}

export default function WebsiteManager() {
  const { data: content, isLoading } = useWebsiteContent();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2563EB]" />
      </div>
    );
  }

  const c = content || {};

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight" data-testid="text-website-manager-title">Website Manager</h1>
        <p className="text-muted-foreground mt-1">
          Edit all public website content - changes go live immediately.
        </p>
      </div>

      <Tabs defaultValue="homepage" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="homepage" data-testid="tab-homepage">Homepage</TabsTrigger>
          <TabsTrigger value="about" data-testid="tab-about">About</TabsTrigger>
          <TabsTrigger value="contact" data-testid="tab-contact">Contact</TabsTrigger>
          <TabsTrigger value="footer" data-testid="tab-footer">Footer</TabsTrigger>
          <TabsTrigger value="global" data-testid="tab-global">Global</TabsTrigger>
        </TabsList>

        <TabsContent value="homepage" className="mt-6 space-y-6">
          <HeroSection key={JSON.stringify(c.home_hero)} content={c} />
          <StatsSection key={JSON.stringify(c.home_stats)} content={c} />
          <ProcessStepsSection key={JSON.stringify(c.home_process)} content={c} />
          <FAQsSection key={JSON.stringify(c.home_faqs)} content={c} />
          <VideosSection key={JSON.stringify(c.home_videos)} content={c} />
        </TabsContent>

        <TabsContent value="about" className="mt-6 space-y-6">
          <AboutSection key={JSON.stringify(c.about_hero) + JSON.stringify(c.about_mission)} content={c} />
          <AchievementsSection key={JSON.stringify(c.about_achievements)} content={c} />
          <ValuesSection key={JSON.stringify(c.about_values)} content={c} />
          <OfficesSection key={JSON.stringify(c.about_offices)} content={c} />
        </TabsContent>

        <TabsContent value="contact" className="mt-6 space-y-6">
          <ContactSection key={JSON.stringify(c.contact_info)} content={c} />
        </TabsContent>

        <TabsContent value="footer" className="mt-6 space-y-6">
          <SocialLinksSection key={JSON.stringify(c.footer_social)} content={c} />
          <UsefulLinksSection key={JSON.stringify(c.footer_useful_links)} content={c} />
          <FooterContactSection key={JSON.stringify(c.footer_contact)} content={c} />
        </TabsContent>

        <TabsContent value="global" className="mt-6 space-y-6">
          <SiteBannerSection key={JSON.stringify(c.site_banner)} content={c} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
