import { useState } from "react";
import { Copy, Eye, Mail, MessageCircle, Phone, Linkedin, Plus, Check } from "lucide-react";
import { PageTransition, Fade, Stagger, StaggerItem } from "@/components/ui/animated";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { useToast } from "@/hooks/use-toast";
import { messageTemplates, ALL_VERTICALS_IN_CRM, type MessageTemplate, type TemplateType } from "@/lib/mock-data-crm";
import { CRM_COLOR } from "@/lib/crm-config";
import { PageShell } from "@/components/layout";

const typeConfig: Record<TemplateType, { label: string; icon: typeof Mail; cls: string }> = {
  email: { label: "Email", icon: Mail, cls: "bg-blue-50 text-blue-700" },
  whatsapp: { label: "WhatsApp", icon: MessageCircle, cls: "bg-emerald-50 text-emerald-700" },
  sms: { label: "SMS", icon: Phone, cls: "bg-amber-50 text-amber-700" },
  linkedin: { label: "LinkedIn", icon: Linkedin, cls: "bg-sky-50 text-sky-700" },
};

const stageLabels: Record<string, string> = {
  new: "New Lead", contacted: "Contacted", qualified: "Qualified",
  proposal: "Proposal Sent", negotiation: "Negotiation", won: "Won",
  lost: "Lost", general: "General", "follow-up": "Follow-up", "re-engage": "Re-engage",
};

const stageBadge: Record<string, string> = {
  new: "bg-slate-100 text-slate-700",
  contacted: "bg-sky-100 text-sky-700",
  qualified: "bg-amber-100 text-amber-700",
  proposal: "bg-blue-100 text-blue-700",
  negotiation: "bg-orange-100 text-orange-700",
  won: "bg-emerald-100 text-emerald-700",
  lost: "bg-red-100 text-red-700",
  general: "bg-slate-100 text-slate-700",
  "follow-up": "bg-violet-100 text-violet-700",
  "re-engage": "bg-pink-100 text-pink-700",
};

const ALL_TYPES: (TemplateType | "all")[] = ["all", "email", "whatsapp", "sms", "linkedin"];
const ALL_STAGES = ["all", "new", "contacted", "qualified", "proposal", "negotiation", "follow-up", "re-engage", "general", "won"];

function highlightVars(text: string) {
  const parts = text.split(/({{[^}]+}})/g);
  return parts.map((part, i) =>
    part.startsWith("{{") ? (
      <span key={i} className="bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 px-1 rounded text-xs">{part}</span>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

function fillTemplate(body: string, vars: Record<string, string>) {
  let result = body;
  Object.entries(vars).forEach(([k, v]) => {
    result = result.replace(new RegExp(k.replace(/[{}]/g, "\\$&"), "g"), v || k);
  });
  return result;
}

const defaultVarValues: Record<string, string> = {
  "{{name}}": "Priya Sharma",
  "{{company}}": "NexaTech Solutions",
  "{{vertical}}": "HR & Compliance",
  "{{sender_name}}": "Rahul Verma",
  "{{deal_title}}": "LegalNations HR Suite — Annual License",
  "{{value}}": "₹4,50,000",
  "{{timeline}}": "4–6 weeks",
  "{{start_date}}": "March 15, 2026",
  "{{final_value}}": "₹3,90,000",
  "{{expiry_date}}": "March 10, 2026",
  "{{meeting_time}}": "3:00 PM",
  "{{meeting_link}}": "meet.google.com/abc-def-ghi",
  "{{date}}": "March 5, 2026",
  "{{time}}": "10:00 AM",
  "{{link}}": "meet.google.com/abc-def-ghi",
  "{{industry}}": "Technology",
  "{{seats}}": "50",
  "{{demo_date}}": "March 7, 2026",
  "{{trial_link}}": "app.teamsync.in/trial/xyz123",
  "{{onboarding_date}}": "March 10, 2026",
  "{{csm_name}}": "Sneha Reddy",
  "{{csm_email}}": "sneha@teamsync.in",
  "{{key_feature_1}}": "automated compliance alerts",
  "{{key_feature_2}}": "payroll integration",
  "{{bonus_1}}": "3 months free onboarding support",
  "{{bonus_2}}": "Free data migration service",
  "{{new_feature_1}}": "AI lead scoring",
  "{{new_feature_2}}": "WhatsApp integration",
  "{{pain_point}}": "compliance management",
};

export default function CrmTemplates() {
  const isLoading = useSimulatedLoading(600);
  const { toast } = useToast();
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [stageFilter, setStageFilter] = useState("all");
  const [verticalFilter, setVerticalFilter] = useState("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<MessageTemplate | null>(null);
  const [varValues, setVarValues] = useState<Record<string, string>>(defaultVarValues);

  const filtered = messageTemplates.filter(t => {
    if (typeFilter !== "all" && t.type !== typeFilter) return false;
    if (stageFilter !== "all" && t.stage !== stageFilter) return false;
    if (verticalFilter !== "all" && !t.verticals.includes("all") && !t.verticals.includes(verticalFilter)) return false;
    return true;
  });

  const handleCopy = (t: MessageTemplate) => {
    navigator.clipboard.writeText(t.body).then(() => {
      setCopiedId(t.id);
      toast({ title: "Template copied to clipboard", description: `"${t.name}" ready to paste.` });
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const openPreview = (t: MessageTemplate) => {
    const initialVars: Record<string, string> = {};
    t.variables.forEach(v => { initialVars[v] = defaultVarValues[v] ?? ""; });
    setVarValues(prev => ({ ...prev, ...initialVars }));
    setPreviewTemplate(t);
  };

  if (isLoading) {
    return (
      <PageShell>
        <div className="h-10 bg-muted rounded w-48" />
        <div className="grid grid-cols-2 gap-4">{[...Array(6)].map((_, i) => <div key={i} className="h-52 bg-muted rounded-xl" />)}</div>
      </PageShell>
    );
  }

  return (
    <PageTransition className="px-16 py-6 lg:px-24 space-y-5">
      <Fade>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold">Message Templates</h1>
            <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-semibold px-2.5 py-1 rounded-full">
              {filtered.length}
            </span>
          </div>
          <Button size="sm" className="rounded-full gap-1.5 text-white" style={{ backgroundColor: CRM_COLOR }} data-testid="btn-new-template">
            <Plus className="size-4" /> New Template
          </Button>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {ALL_TYPES.map(t => {
            const cfg = t === "all" ? null : typeConfig[t as TemplateType];
            const Icon = cfg?.icon;
            return (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                data-testid={`pill-type-${t}`}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                  typeFilter === t ? "text-white border-transparent" : "bg-background border-border text-muted-foreground hover:border-foreground/30"
                }`}
                style={typeFilter === t ? { backgroundColor: CRM_COLOR } : {}}
              >
                {Icon && <Icon className="size-3" />}
                {t === "all" ? "All Types" : cfg?.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          <Select value={stageFilter} onValueChange={setStageFilter}>
            <SelectTrigger className="h-9 w-48 rounded-lg" data-testid="select-stage"><SelectValue placeholder="All Stages" /></SelectTrigger>
            <SelectContent>
              {ALL_STAGES.map(s => <SelectItem key={s} value={s}>{s === "all" ? "All Stages" : stageLabels[s]}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={verticalFilter} onValueChange={setVerticalFilter}>
            <SelectTrigger className="h-9 w-44 rounded-lg" data-testid="select-vertical"><SelectValue placeholder="All Verticals" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Verticals</SelectItem>
              {ALL_VERTICALS_IN_CRM.map(v => <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </Fade>

      <Stagger className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.map(t => {
          const cfg = typeConfig[t.type];
          const Icon = cfg.icon;
          const isCopied = copiedId === t.id;
          const vertNames = t.verticals.includes("all")
            ? ["All Verticals"]
            : t.verticals.map(vid => ALL_VERTICALS_IN_CRM.find(v => v.id === vid)?.name ?? vid);

          return (
            <StaggerItem key={t.id}>
              <Card className="border-0 shadow-sm hover:shadow-md transition-shadow h-full" data-testid={`template-card-${t.id}`}>
                <CardContent className="p-5 flex flex-col h-full">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <p className="text-sm font-semibold">{t.name}</p>
                        <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${cfg.cls}`}>
                          <Icon className="size-3" /> {cfg.label}
                        </span>
                        <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">Used {t.usageCount}×</span>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${stageBadge[t.stage]}`}>
                          {stageLabels[t.stage]}
                        </span>
                        {vertNames.slice(0, 2).map(n => (
                          <span key={n} className="text-xs bg-slate-50 dark:bg-slate-800 text-muted-foreground px-2 py-0.5 rounded-full">{n}</span>
                        ))}
                        {vertNames.length > 2 && <span className="text-xs text-muted-foreground">+{vertNames.length - 2} more</span>}
                      </div>
                    </div>
                  </div>

                  {t.type === "email" && t.subject && (
                    <p className="text-xs italic text-muted-foreground mb-2">Subject: {t.subject}</p>
                  )}

                  <div className="flex-1 text-xs text-muted-foreground bg-muted/50 rounded-lg p-3 line-clamp-4 leading-relaxed mb-3">
                    {highlightVars(t.body)}
                  </div>

                  <div className="flex items-center justify-between border-t pt-3">
                    <p className="text-xs text-muted-foreground">by {t.createdBy} · {t.createdDate}</p>
                    <div className="flex gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 px-3 text-xs rounded-lg gap-1"
                        onClick={() => handleCopy(t)}
                        data-testid={`btn-copy-${t.id}`}
                      >
                        {isCopied ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
                        {isCopied ? "Copied" : "Copy"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 px-3 text-xs rounded-lg gap-1"
                        onClick={() => openPreview(t)}
                        data-testid={`btn-preview-${t.id}`}
                      >
                        <Eye className="size-3" /> Preview
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </StaggerItem>
          );
        })}
        {filtered.length === 0 && (
          <div className="col-span-2 py-20 text-center text-muted-foreground text-sm">No templates match the current filters.</div>
        )}
      </Stagger>

      <Dialog open={!!previewTemplate} onOpenChange={o => !o && setPreviewTemplate(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {previewTemplate && (() => {
            const cfg = typeConfig[previewTemplate.type];
            const Icon = cfg.icon;
            const previewBody = fillTemplate(previewTemplate.body, varValues);
            return (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <span className={`flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full font-medium ${cfg.cls}`}>
                      <Icon className="size-3" /> {cfg.label}
                    </span>
                    {previewTemplate.name}
                  </DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-5 gap-4 pt-2">
                  <div className="col-span-2 space-y-3">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Variables</p>
                    {previewTemplate.variables.map(v => (
                      <div key={v}>
                        <label className="text-xs text-muted-foreground mb-1 block">{v}</label>
                        <Input
                          value={varValues[v] ?? ""}
                          onChange={e => setVarValues(prev => ({ ...prev, [v]: e.target.value }))}
                          className="h-8 text-xs rounded-lg"
                          data-testid={`var-input-${v.replace(/[{}]/g, "")}`}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="col-span-3 space-y-3">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Preview</p>
                    {previewTemplate.subject && (
                      <div className="bg-muted rounded-lg px-3 py-2">
                        <p className="text-xs text-muted-foreground">Subject:</p>
                        <p className="text-sm font-medium">{fillTemplate(previewTemplate.subject, varValues)}</p>
                      </div>
                    )}
                    <div className="bg-card border rounded-xl p-4 text-sm whitespace-pre-wrap leading-relaxed min-h-48">
                      {previewBody}
                    </div>
                    <Button
                      className="w-full rounded-lg text-white gap-2"
                      style={{ backgroundColor: CRM_COLOR }}
                      onClick={() => {
                        navigator.clipboard.writeText(previewBody);
                        toast({ title: "Filled template copied", description: "Ready to paste." });
                        setPreviewTemplate(null);
                      }}
                      data-testid="btn-copy-filled"
                    >
                      <Copy className="size-4" /> Copy Filled Template
                    </Button>
                  </div>
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </PageTransition>
  );
}
