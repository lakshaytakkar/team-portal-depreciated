import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Star, Clock, MessageSquare, Users, FileText, Calendar,
  BookOpen, Link, Copy, Check, Image, Video, Download,
} from "lucide-react";
import { useState } from "react";
import {
  FORMATION_PACKAGES, SALES_LEADS, SALES_PROPOSALS,
} from "@/lib/mock-data-dashboard-ln";

const STAGE_COLORS: Record<string, string> = {
  "New Lead": "bg-gray-100 text-gray-600",
  "Qualified": "bg-blue-100 text-blue-700",
  "Proposal Sent": "bg-purple-100 text-purple-700",
  "Converted": "bg-green-100 text-green-700",
};

const BOOKING_SLOTS = [
  { id: "BS-001", client: "Rohit Agarwal", date: "2026-03-27", time: "10:00 AM", type: "Discovery Call", status: "confirmed" as const },
  { id: "BS-002", client: "Kavita Nair", date: "2026-03-27", time: "2:00 PM", type: "Proposal Walkthrough", status: "confirmed" as const },
  { id: "BS-003", client: "Meera Reddy", date: "2026-03-28", time: "11:00 AM", type: "Discovery Call", status: "pending" as const },
  { id: "BS-004", client: "Pooja Bhatia", date: "2026-03-29", time: "3:00 PM", type: "Follow-up Call", status: "confirmed" as const },
  { id: "BS-005", client: "Suresh Kapoor", date: "2026-03-31", time: "10:30 AM", type: "Closing Call", status: "pending" as const },
];

const SALES_SCRIPTS = [
  { id: "SC-001", title: "Cold Outreach — WhatsApp Initial Message", type: "WhatsApp", updated: "2026-03-01", tags: ["outreach", "first-contact"], content: "Hi {Name}! I'm reaching out from LegalNations. We help Indian founders set up US LLCs quickly and affordably. Are you interested in learning more about forming a company in Delaware or Wyoming? 🇺🇸" },
  { id: "SC-002", title: "Discovery Call Script — LLC Formation", type: "Call", updated: "2026-03-10", tags: ["discovery", "call"], content: "Opening: Thank them for their time. Ask: What type of business are you building? Have you done business in the US before? What state are you considering? Main pitch: Present state options and our package tiers. Close: Which package makes sense for your needs?" },
  { id: "SC-003", title: "Objection Handling — Price Concerns", type: "Call", updated: "2026-03-05", tags: ["objections", "pricing"], content: "When client says the price is too high: 'I understand budget is important. Our Basic package at $399 covers everything you need to get started legally. And when you compare this to the cost of a US lawyer — often $2,000+ — this is actually a significant saving...' " },
  { id: "SC-004", title: "Proposal Follow-up Message", type: "WhatsApp", updated: "2026-03-15", tags: ["follow-up", "proposal"], content: "Hi {Name}! Just following up on the proposal I sent for {Company}. Do you have any questions? Happy to jump on a quick call to walk you through it. The {Package} package is best suited for your goals." },
  { id: "SC-005", title: "Closing Script — Urgency Creation", type: "Call", updated: "2026-03-20", tags: ["closing", "urgency"], content: "We're currently processing formations within 7-10 days for Delaware. If you start today, you'll have your company ready before [Month]. The IRS EIN turnaround is about 3-4 weeks so the sooner we start, the better positioned you'll be." },
];

const SALES_ASSETS = [
  { id: "SA-001", title: "LegalNations — LLC Formation Brochure", type: "PDF", size: "2.4 MB", updated: "2026-03-01", category: "brochure" as const },
  { id: "SA-002", title: "State Comparison Guide (DE vs WY vs NV)", type: "PDF", size: "1.1 MB", updated: "2026-02-15", category: "guide" as const },
  { id: "SA-003", title: "Package Comparison Slide Deck", type: "PPT", size: "3.8 MB", updated: "2026-03-10", category: "presentation" as const },
  { id: "SA-004", title: "LegalNations Brand Kit", type: "ZIP", size: "12.5 MB", updated: "2026-01-20", category: "brand" as const },
  { id: "SA-005", title: "Client Testimonials Video", type: "MP4", size: "45 MB", updated: "2026-02-28", category: "video" as const },
  { id: "SA-006", title: "WhatsApp Image Templates", type: "ZIP", size: "8.2 MB", updated: "2026-03-15", category: "social" as const },
];

const PAYMENT_LINK_TEMPLATES = [
  { id: "PL-001", label: "Basic Package — $399", amount: 399, description: "LLC/Corp filing + EIN + Articles" },
  { id: "PL-002", label: "Standard Package — $799", amount: 799, description: "Everything in Basic + BOI + Banking" },
  { id: "PL-003", label: "Premium Package — $1,499", amount: 1499, description: "Everything in Standard + Rush processing" },
  { id: "PL-004", label: "BOI Filing Add-on — $99", amount: 99, description: "BOI filing service for existing company" },
  { id: "PL-005", label: "Registered Agent — $149/yr", amount: 149, description: "Annual registered agent service" },
  { id: "PL-006", label: "Annual Report Filing — $75+", amount: 75, description: "Annual report service (state fees extra)" },
];

const ASSET_ICONS: Record<string, typeof FileText> = {
  brochure: FileText,
  guide: BookOpen,
  presentation: FileText,
  brand: Image,
  video: Video,
  social: Image,
};

const MY_LEADS = SALES_LEADS.filter(l => l.assignedTo === "sales");

export default function LnSalesPortal() {
  const todayFollowups = MY_LEADS.filter(l => l.followUp === "Today").length;
  const hotLeads = MY_LEADS.filter(l => l.hot).length;
  const todayBookings = BOOKING_SLOTS.filter(b => b.date === "2026-03-27").length;

  return (
    <div className="px-16 lg:px-24 py-6 space-y-6" data-testid="ln-sales-portal-dashboard">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 p-6 text-white shadow-lg">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/4 translate-x-1/4" />
        <div className="relative z-10">
          <p className="text-sm text-pink-200 mb-1">Sales Executive</p>
          <h1 className="text-2xl font-bold" data-testid="text-sales-title">Sales Dashboard</h1>
          <div className="flex items-center gap-6 mt-3 text-sm text-pink-200">
            <span><strong className="text-white">{MY_LEADS.length}</strong> Active Leads</span>
            <span><strong className="text-white">{todayFollowups}</strong> Follow-ups Today</span>
            <span><strong className="text-white">{hotLeads}</strong> Hot Leads</span>
            <span><strong className="text-white">{todayBookings}</strong> Bookings Today</span>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Users className="w-4 h-4 text-pink-500" /> My Lead Pipeline
              </CardTitle>
              <Badge variant="outline" className="text-xs">{MY_LEADS.length} leads</Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0 space-y-2">
            {MY_LEADS.map((lead) => (
              <div
                key={lead.id}
                className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 hover:bg-muted/60 transition-colors"
                data-testid={`sales-lead-${lead.id}`}
              >
                <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center text-xs font-bold text-pink-600 shrink-0">
                  {lead.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-medium truncate">{lead.name}</p>
                    {lead.hot && <Star className="w-3 h-3 text-amber-500 fill-amber-500 shrink-0" />}
                  </div>
                  <p className="text-xs text-muted-foreground">{lead.company} · {lead.state} · {lead.source}</p>
                </div>
                <div className="text-right shrink-0 space-y-1">
                  <Badge className={`text-[10px] ${STAGE_COLORS[lead.stage] || "bg-gray-100 text-gray-600"}`} variant="outline">
                    {lead.stage}
                  </Badge>
                  <p className={`text-[10px] font-medium ${lead.followUp === "Today" ? "text-red-500" : "text-muted-foreground"}`}>
                    {lead.followUp === "Today" ? "Follow up now" : lead.followUp}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Clock className="w-4 h-4 text-red-500" /> Today's Follow-ups
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              {MY_LEADS.filter(l => l.followUp === "Today").map((lead) => (
                <div key={lead.id} className="flex items-center justify-between p-2.5 rounded-lg border border-red-100 bg-red-50/50" data-testid={`sales-followup-${lead.id}`}>
                  <div>
                    <p className="text-sm font-medium">{lead.name}</p>
                    <p className="text-xs text-muted-foreground">{lead.stage} · {lead.company}</p>
                  </div>
                  <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white gap-1 h-7 text-xs" data-testid={`sales-wa-${lead.id}`}>
                    <MessageSquare className="w-3 h-3" /> WA
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Calendar className="w-4 h-4 text-pink-500" /> Today's Bookings
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              {BOOKING_SLOTS.filter(b => b.date === "2026-03-27").map((slot) => (
                <div key={slot.id} className="flex items-center justify-between py-2" data-testid={`sales-booking-${slot.id}`}>
                  <div>
                    <p className="text-xs font-medium">{slot.client}</p>
                    <p className="text-[10px] text-muted-foreground">{slot.type} · {slot.time}</p>
                  </div>
                  <Badge variant="outline" className={`text-[10px] ${slot.status === "confirmed" ? "border-green-300 text-green-700" : "border-amber-300 text-amber-700"}`}>
                    {slot.status}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export function LnSalesPipeline() {
  const stages = ["New Lead", "Qualified", "Proposal Sent", "Converted"];
  return (
    <div className="px-16 lg:px-24 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">My Lead Pipeline</h1>
        <Badge variant="outline" className="text-xs text-pink-700 border-pink-300">{MY_LEADS.length} assigned leads</Badge>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stages.map((stage) => {
          const count = MY_LEADS.filter(l => l.stage === stage).length;
          return (
            <Card key={stage} className="border-0 shadow-sm">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">{stage}</p>
                <p className="text-2xl font-bold mt-1 text-pink-600" data-testid={`sales-pipeline-count-${stage}`}>{count}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
      <div className="space-y-2">
        {MY_LEADS.map((lead) => (
          <div key={lead.id} className="flex items-center gap-3 p-4 rounded-xl border bg-white hover:bg-muted/20 transition-colors" data-testid={`sales-pipeline-lead-${lead.id}`}>
            <div className="w-9 h-9 rounded-full bg-pink-100 flex items-center justify-center font-bold text-pink-600 text-xs">{lead.name[0]}</div>
            <div className="flex-1">
              <div className="flex items-center gap-1.5">
                <p className="font-medium text-sm">{lead.name}</p>
                {lead.hot && <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />}
              </div>
              <p className="text-xs text-muted-foreground">{lead.company} · {lead.state} · {lead.source}</p>
            </div>
            <Badge className={`text-xs ${STAGE_COLORS[lead.stage] || ""}`} variant="outline">{lead.stage}</Badge>
          </div>
        ))}
      </div>
    </div>
  );
}

export function LnSalesBookings() {
  const STATUS_COLORS: Record<string, string> = {
    "confirmed": "border-green-300 text-green-700 bg-green-50",
    "pending": "border-amber-300 text-amber-700 bg-amber-50",
    "cancelled": "border-red-300 text-red-700 bg-red-50",
  };

  const dates = [...new Set(BOOKING_SLOTS.map(b => b.date))];

  return (
    <div className="px-16 lg:px-24 py-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold">Booking Calendar</h1>
        <p className="text-sm text-muted-foreground">Scheduled calls and meetings with leads</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {[
          { label: "Total Bookings", value: BOOKING_SLOTS.length },
          { label: "Confirmed", value: BOOKING_SLOTS.filter(b => b.status === "confirmed").length },
          { label: "Pending", value: BOOKING_SLOTS.filter(b => b.status === "pending").length },
        ].map((stat) => (
          <Card key={stat.label} className="border-0 shadow-sm">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-pink-600" data-testid={`sales-booking-stat-${stat.label.toLowerCase().replace(/\s+/g, "-")}`}>{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      {dates.map((date) => (
        <div key={date}>
          <p className="text-sm font-semibold text-muted-foreground mb-2">{date}</p>
          <div className="space-y-2">
            {BOOKING_SLOTS.filter(b => b.date === date).map((slot) => (
              <Card key={slot.id} className="border-0 shadow-sm" data-testid={`sales-booking-card-${slot.id}`}>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-16 text-center shrink-0">
                    <p className="text-sm font-bold text-pink-600">{slot.time}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{slot.client}</p>
                    <p className="text-xs text-muted-foreground">{slot.type}</p>
                  </div>
                  <Badge variant="outline" className={`text-[10px] ${STATUS_COLORS[slot.status]}`}>{slot.status}</Badge>
                  <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white h-8 gap-1 text-xs" data-testid={`sales-join-call-${slot.id}`}>
                    <MessageSquare className="w-3 h-3" /> Join
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function LnSalesScripts() {
  const [expanded, setExpanded] = useState<string | null>(null);

  const TYPE_COLORS: Record<string, string> = {
    "WhatsApp": "bg-green-100 text-green-700",
    "Call": "bg-blue-100 text-blue-700",
  };

  return (
    <div className="px-16 lg:px-24 py-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold">Sales Scripts Library</h1>
        <p className="text-sm text-muted-foreground">Ready-to-use scripts for every stage of the sales journey</p>
      </div>
      <div className="space-y-3">
        {SALES_SCRIPTS.map((script) => (
          <Card key={script.id} className="border-0 shadow-sm" data-testid={`sales-script-${script.id}`}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <BookOpen className="w-4 h-4 text-pink-500 shrink-0" />
                    <p className="font-semibold text-sm">{script.title}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className={`text-[10px] ${TYPE_COLORS[script.type] || "bg-gray-100 text-gray-600"}`} variant="outline">
                      {script.type}
                    </Badge>
                    {script.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-[10px]">#{tag}</Badge>
                    ))}
                    <span className="text-[10px] text-muted-foreground">Updated {script.updated}</span>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setExpanded(expanded === script.id ? null : script.id)}
                  data-testid={`sales-script-expand-${script.id}`}
                >
                  {expanded === script.id ? "Hide" : "View"}
                </Button>
              </div>
              {expanded === script.id && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm text-muted-foreground leading-relaxed" data-testid={`sales-script-content-${script.id}`}>
                  {script.content}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function LnSalesAssets() {
  const CATEGORY_LABELS: Record<string, string> = {
    brochure: "Brochure",
    guide: "Guide",
    presentation: "Presentation",
    brand: "Brand Kit",
    video: "Video",
    social: "Social Media",
  };

  return (
    <div className="px-16 lg:px-24 py-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold">Sales Assets</h1>
        <p className="text-sm text-muted-foreground">Marketing materials, templates, and brand assets</p>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {SALES_ASSETS.map((asset) => {
          const Icon = ASSET_ICONS[asset.category] || FileText;
          return (
            <Card key={asset.id} className="border-0 shadow-sm" data-testid={`sales-asset-${asset.id}`}>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-pink-50 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-pink-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{asset.title}</p>
                  <p className="text-xs text-muted-foreground">{CATEGORY_LABELS[asset.category]} · {asset.type} · {asset.size}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Updated {asset.updated}</p>
                </div>
                <Button size="sm" variant="outline" className="shrink-0 gap-1" data-testid={`sales-asset-download-${asset.id}`}>
                  <Download className="w-3.5 h-3.5" /> Get
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export function LnSalesPaymentLinks() {
  const [copied, setCopied] = useState<string | null>(null);
  const [customName, setCustomName] = useState("");
  const [customAmount, setCustomAmount] = useState("");
  const [generatedLinks, setGeneratedLinks] = useState<Array<{ id: string; label: string; url: string }>>([]);

  const handleCopy = (id: string, url: string) => {
    navigator.clipboard.writeText(url).catch(() => {});
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const generateLink = () => {
    if (!customName || !customAmount) return;
    const newLink = {
      id: `custom-${Date.now()}`,
      label: `${customName} — $${customAmount}`,
      url: `https://pay.legalnations.com/ln-${Math.random().toString(36).substr(2, 8)}`,
    };
    setGeneratedLinks(prev => [newLink, ...prev]);
    setCustomName("");
    setCustomAmount("");
  };

  return (
    <div className="px-16 lg:px-24 py-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold">Payment Link Generator</h1>
        <p className="text-sm text-muted-foreground">Generate and share payment links for LLC formation packages</p>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Custom Payment Link</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3 items-end flex-wrap">
            <div className="flex-1 min-w-[180px]">
              <label className="text-xs text-muted-foreground mb-1 block">Description</label>
              <input
                type="text"
                value={customName}
                onChange={e => setCustomName(e.target.value)}
                placeholder="e.g. Premium Package for Rohit"
                className="w-full border rounded-lg px-3 py-2 text-sm"
                data-testid="input-custom-link-name"
              />
            </div>
            <div className="w-32">
              <label className="text-xs text-muted-foreground mb-1 block">Amount (USD)</label>
              <input
                type="number"
                value={customAmount}
                onChange={e => setCustomAmount(e.target.value)}
                placeholder="1499"
                className="w-full border rounded-lg px-3 py-2 text-sm"
                data-testid="input-custom-link-amount"
              />
            </div>
            <Button
              onClick={generateLink}
              className="bg-pink-500 hover:bg-pink-600 text-white gap-1"
              data-testid="button-generate-payment-link"
            >
              <Link className="w-4 h-4" /> Generate Link
            </Button>
          </div>
          {generatedLinks.length > 0 && (
            <div className="mt-4 space-y-2">
              {generatedLinks.map((link) => (
                <div key={link.id} className="flex items-center gap-3 p-3 rounded-lg bg-pink-50 border border-pink-100" data-testid={`generated-link-${link.id}`}>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium">{link.label}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{link.url}</p>
                  </div>
                  <Button size="sm" variant="outline" className="shrink-0 gap-1" onClick={() => handleCopy(link.id, link.url)} data-testid={`copy-generated-link-${link.id}`}>
                    {copied === link.id ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied === link.id ? "Copied!" : "Copy"}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div>
        <p className="text-sm font-semibold mb-3">Standard Payment Links</p>
        <div className="space-y-3">
          {PAYMENT_LINK_TEMPLATES.map((tmpl) => {
            const url = `https://pay.legalnations.com/pkg-${tmpl.id.toLowerCase()}`;
            return (
              <Card key={tmpl.id} className="border-0 shadow-sm" data-testid={`payment-link-${tmpl.id}`}>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-9 h-9 rounded-lg bg-pink-50 flex items-center justify-center shrink-0">
                    <Link className="w-4 h-4 text-pink-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold">{tmpl.label}</p>
                    <p className="text-xs text-muted-foreground">{tmpl.description}</p>
                    <p className="text-[10px] text-muted-foreground truncate mt-0.5">{url}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="shrink-0 gap-1"
                    onClick={() => handleCopy(tmpl.id, url)}
                    data-testid={`copy-payment-link-${tmpl.id}`}
                  >
                    {copied === tmpl.id ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied === tmpl.id ? "Copied!" : "Copy"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
