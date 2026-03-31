import { useState, useMemo, useCallback } from "react";
import { Link } from "wouter";
import {
  Phone, MessageSquare, FileText, Users, Clock, Flame, Thermometer,
  Copy, Check, ChevronRight, X, Calendar, Star, MapPin,
  TrendingUp, CreditCard, UserCheck, AlertCircle, Zap, Mail,
  Package, BarChart3, ArrowRight, Info,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

const SALES_USERS = ["Harsh", "Suprans"] as const;
type SalesUser = (typeof SALES_USERS)[number];
const SALES_USER_KEY = "ets-sales-current-user";

function getStoredSalesUser(): SalesUser {
  try {
    const v = localStorage.getItem(SALES_USER_KEY);
    if (v === "Harsh" || v === "Suprans") return v;
  } catch {}
  return "Harsh";
}

function setStoredSalesUser(u: SalesUser): void {
  try { localStorage.setItem(SALES_USER_KEY, u); } catch {}
}

function useSalesUser(): [SalesUser, (u: SalesUser) => void] {
  const [user, setUserState] = useState<SalesUser>(getStoredSalesUser);
  const setUser = useCallback((u: SalesUser) => {
    setUserState(u);
    setStoredSalesUser(u);
  }, []);
  return [user, setUser];
}

function useCurrentSalesUser(): SalesUser {
  return getStoredSalesUser();
}

// ─── Shared Types & Data ────────────────────────────────────────────────────

type LeadScore = "Hot" | "Warm" | "Nurture";
type LeadStage =
  | "New Inquiry"
  | "Qualification Sent"
  | "Discovery Call"
  | "Proposal Sent"
  | "Negotiation"
  | "Token Paid"
  | "In Execution"
  | "Launched"
  | "Lost";

interface Lead {
  id: string;
  name: string;
  city: string;
  phone: string;
  email: string;
  score: LeadScore;
  stage: LeadStage;
  package: "Lite" | "Pro" | "Elite";
  investment: number;
  assignedTo: string;
  source: string;
  lastContactedDate: string;
  nextFollowupDate: string;
  notes: string;
  activityLog: { date: string; action: string; note: string }[];
  stageHistory: { stage: string; date: string }[];
}

function getTodayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
const TODAY = getTodayStr();

const MOCK_LEADS: Lead[] = [
  {
    id: "L001",
    name: "Rahul Agarwal",
    city: "Pune",
    phone: "9876543210",
    email: "rahul.agarwal@gmail.com",
    score: "Hot",
    stage: "Negotiation",
    package: "Pro",
    investment: 475000,
    assignedTo: "Harsh",
    source: "Instagram",
    lastContactedDate: "2026-03-25",
    nextFollowupDate: "2026-03-26",
    notes: "Very interested in launching in Wakad area. Wants ROI clarity.",
    activityLog: [
      { date: "2026-03-25", action: "Call", note: "Discussed package details, shared investment breakdown." },
      { date: "2026-03-22", action: "WhatsApp", note: "Sent proposal document." },
      { date: "2026-03-18", action: "Call", note: "Initial discovery call — positive response." },
    ],
    stageHistory: [
      { stage: "New Inquiry", date: "2026-03-14" },
      { stage: "Qualification Sent", date: "2026-03-16" },
      { stage: "Discovery Call", date: "2026-03-18" },
      { stage: "Proposal Sent", date: "2026-03-22" },
      { stage: "Negotiation", date: "2026-03-25" },
    ],
  },
  {
    id: "L002",
    name: "Sunita Verma",
    city: "Bhopal",
    phone: "9812345678",
    email: "sunita.verma@gmail.com",
    score: "Warm",
    stage: "Proposal Sent",
    package: "Lite",
    investment: 320000,
    assignedTo: "Suprans",
    source: "Reference",
    lastContactedDate: "2026-03-23",
    nextFollowupDate: "2026-03-26",
    notes: "Has seen 2 EazyToSell stores. Comparing with local franchise.",
    activityLog: [
      { date: "2026-03-23", action: "WhatsApp", note: "Sent Lite package proposal." },
      { date: "2026-03-20", action: "Call", note: "Discovery call done, good fit." },
    ],
    stageHistory: [
      { stage: "New Inquiry", date: "2026-03-15" },
      { stage: "Discovery Call", date: "2026-03-20" },
      { stage: "Proposal Sent", date: "2026-03-23" },
    ],
  },
  {
    id: "L003",
    name: "Kiran Patel",
    city: "Vadodara",
    phone: "9934567890",
    email: "kiran.patel@gmail.com",
    score: "Hot",
    stage: "Token Paid",
    package: "Elite",
    investment: 650000,
    assignedTo: "Harsh",
    source: "Facebook Ad",
    lastContactedDate: "2026-03-24",
    nextFollowupDate: "2026-03-28",
    notes: "Token paid. Ops handoff pending. Will set up in April.",
    activityLog: [
      { date: "2026-03-24", action: "Call", note: "Confirmed token payment. Ops handoff initiated." },
      { date: "2026-03-21", action: "WhatsApp", note: "Payment link sent." },
    ],
    stageHistory: [
      { stage: "New Inquiry", date: "2026-03-08" },
      { stage: "Qualification Sent", date: "2026-03-10" },
      { stage: "Discovery Call", date: "2026-03-13" },
      { stage: "Proposal Sent", date: "2026-03-17" },
      { stage: "Negotiation", date: "2026-03-20" },
      { stage: "Token Paid", date: "2026-03-24" },
    ],
  },
  {
    id: "L004",
    name: "Amit Singh",
    city: "Patna",
    phone: "9845001122",
    email: "amit.singh@gmail.com",
    score: "Hot",
    stage: "Negotiation",
    package: "Pro",
    investment: 475000,
    assignedTo: "Suprans",
    source: "YouTube",
    lastContactedDate: "2026-03-26",
    nextFollowupDate: "2026-03-26",
    notes: "Asking about ROI timeline. Has budget ready.",
    activityLog: [
      { date: "2026-03-26", action: "Call", note: "Discussed objections around profitability." },
      { date: "2026-03-23", action: "WhatsApp", note: "Proposal sent with ROI projections." },
    ],
    stageHistory: [
      { stage: "New Inquiry", date: "2026-03-16" },
      { stage: "Discovery Call", date: "2026-03-20" },
      { stage: "Proposal Sent", date: "2026-03-23" },
      { stage: "Negotiation", date: "2026-03-26" },
    ],
  },
  {
    id: "L005",
    name: "Divya Malhotra",
    city: "Chandigarh",
    phone: "9767890123",
    email: "divya.m@gmail.com",
    score: "Warm",
    stage: "Discovery Call",
    package: "Lite",
    investment: 320000,
    assignedTo: "Harsh",
    source: "Instagram",
    lastContactedDate: "2026-03-19",
    nextFollowupDate: "2026-03-26",
    notes: "Homemaker wanting supplemental income. Spouse approval needed.",
    activityLog: [
      { date: "2026-03-19", action: "Call", note: "Discovery call done. Positive." },
    ],
    stageHistory: [
      { stage: "New Inquiry", date: "2026-03-17" },
      { stage: "Qualification Sent", date: "2026-03-18" },
      { stage: "Discovery Call", date: "2026-03-19" },
    ],
  },
  {
    id: "L006",
    name: "Rajan Mehta",
    city: "Indore",
    phone: "9823456701",
    email: "rajan.mehta@gmail.com",
    score: "Hot",
    stage: "Proposal Sent",
    package: "Pro",
    investment: 475000,
    assignedTo: "Suprans",
    source: "WhatsApp Group",
    lastContactedDate: "2026-03-25",
    nextFollowupDate: "2026-03-26",
    notes: "Has retail background, very confident. Wants quick launch.",
    activityLog: [
      { date: "2026-03-25", action: "WhatsApp", note: "Sent Pro proposal, followed up on review." },
      { date: "2026-03-21", action: "Call", note: "Discovery call — great rapport." },
    ],
    stageHistory: [
      { stage: "New Inquiry", date: "2026-03-14" },
      { stage: "Discovery Call", date: "2026-03-21" },
      { stage: "Proposal Sent", date: "2026-03-25" },
    ],
  },
  {
    id: "L007",
    name: "Poonam Joshi",
    city: "Nagpur",
    phone: "9900112233",
    email: "poonam.j@gmail.com",
    score: "Nurture",
    stage: "Qualification Sent",
    package: "Lite",
    investment: 320000,
    assignedTo: "Harsh",
    source: "Google Ad",
    lastContactedDate: "2026-03-10",
    nextFollowupDate: "2026-03-27",
    notes: "Interested but low urgency. Follow up next week.",
    activityLog: [
      { date: "2026-03-10", action: "WhatsApp", note: "Sent qualification document." },
    ],
    stageHistory: [
      { stage: "New Inquiry", date: "2026-03-08" },
      { stage: "Qualification Sent", date: "2026-03-10" },
    ],
  },
  {
    id: "L008",
    name: "Manish Sharma",
    city: "Lucknow",
    phone: "9870123456",
    email: "manish.s@gmail.com",
    score: "Nurture",
    stage: "New Inquiry",
    package: "Lite",
    investment: 320000,
    assignedTo: "Suprans",
    source: "Referral",
    lastContactedDate: "2026-03-24",
    nextFollowupDate: "2026-03-28",
    notes: "Just enquired. Send intro message.",
    activityLog: [
      { date: "2026-03-24", action: "WhatsApp", note: "Sent intro message." },
    ],
    stageHistory: [{ stage: "New Inquiry", date: "2026-03-24" }],
  },
  {
    id: "L009",
    name: "Geeta Reddy",
    city: "Hyderabad",
    phone: "9456789012",
    email: "geeta.reddy@gmail.com",
    score: "Warm",
    stage: "In Execution",
    package: "Elite",
    investment: 650000,
    assignedTo: "Harsh",
    source: "Event",
    lastContactedDate: "2026-03-22",
    nextFollowupDate: "2026-04-01",
    notes: "Store setup in progress. Weekly check-in needed.",
    activityLog: [
      { date: "2026-03-22", action: "Call", note: "Store design phase underway." },
    ],
    stageHistory: [
      { stage: "Token Paid", date: "2026-03-10" },
      { stage: "In Execution", date: "2026-03-22" },
    ],
  },
  {
    id: "L010",
    name: "Vinod Kumar",
    city: "Jaipur",
    phone: "9321456789",
    email: "vinod.k@gmail.com",
    score: "Nurture",
    stage: "Lost",
    package: "Lite",
    investment: 320000,
    assignedTo: "Suprans",
    source: "Instagram",
    lastContactedDate: "2026-03-15",
    nextFollowupDate: "2026-04-15",
    notes: "Chose competitor. Re-nurture after 3 weeks.",
    activityLog: [
      { date: "2026-03-15", action: "Call", note: "Lead marked lost — went with local franchise." },
    ],
    stageHistory: [
      { stage: "New Inquiry", date: "2026-03-05" },
      { stage: "Discovery Call", date: "2026-03-12" },
      { stage: "Lost", date: "2026-03-15" },
    ],
  },
  {
    id: "L011",
    name: "Pooja Nair",
    city: "Kochi",
    phone: "9678901234",
    email: "pooja.nair@gmail.com",
    score: "Hot",
    stage: "Discovery Call",
    package: "Pro",
    investment: 475000,
    assignedTo: "Harsh",
    source: "YouTube",
    lastContactedDate: "2026-03-25",
    nextFollowupDate: "2026-03-26",
    notes: "Excited about the concept. Discovery call scheduled today.",
    activityLog: [
      { date: "2026-03-25", action: "WhatsApp", note: "Confirmed today's discovery call." },
    ],
    stageHistory: [
      { stage: "New Inquiry", date: "2026-03-20" },
      { stage: "Qualification Sent", date: "2026-03-22" },
      { stage: "Discovery Call", date: "2026-03-25" },
    ],
  },
  {
    id: "L012",
    name: "Suresh Bansal",
    city: "Ahmedabad",
    phone: "9512345678",
    email: "suresh.bansal@gmail.com",
    score: "Warm",
    stage: "Launched",
    package: "Pro",
    investment: 475000,
    assignedTo: "Suprans",
    source: "Reference",
    lastContactedDate: "2026-03-20",
    nextFollowupDate: "2026-04-05",
    notes: "Store launched. Monthly check-in.",
    activityLog: [
      { date: "2026-03-20", action: "Call", note: "Store launch day — all smooth." },
    ],
    stageHistory: [
      { stage: "Token Paid", date: "2026-02-20" },
      { stage: "In Execution", date: "2026-03-01" },
      { stage: "Launched", date: "2026-03-20" },
    ],
  },
];

const PACKAGE_DETAILS = {
  Lite: {
    label: "Lite Package",
    investment: 320000,
    skus: 150,
    storeSize: "100–200 sq ft",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    breakdown: [
      { item: "Store Interior & Fitout", amount: 80000 },
      { item: "Inventory (150 SKUs)", amount: 160000 },
      { item: "EazyToSell Tech Setup", amount: 30000 },
      { item: "Training & Onboarding", amount: 20000 },
      { item: "Launch Support & Marketing Kit", amount: 30000 },
    ],
    paymentSchedule: [
      { milestone: "Token Amount", percent: 10 },
      { milestone: "On Store Design Approval", percent: 30 },
      { milestone: "On Inventory Dispatch", percent: 50 },
      { milestone: "On Store Launch", percent: 10 },
    ],
    inclusions: [
      "150 curated SKUs from China factory",
      "Store branding & signage",
      "POS billing software",
      "1-month post-launch support",
      "WhatsApp community access",
    ],
    timeline: [
      { week: "Week 1–2", activity: "Store design finalization" },
      { week: "Week 3–4", activity: "Interior work & fitout" },
      { week: "Week 5–6", activity: "Inventory production" },
      { week: "Week 7", activity: "Shipping & delivery" },
      { week: "Week 8", activity: "Store launch & training" },
    ],
  },
  Pro: {
    label: "Pro Package",
    investment: 475000,
    skus: 250,
    storeSize: "200–350 sq ft",
    color: "text-sky-600",
    bgColor: "bg-sky-50",
    breakdown: [
      { item: "Store Interior & Fitout", amount: 120000 },
      { item: "Inventory (250 SKUs)", amount: 245000 },
      { item: "EazyToSell Tech Setup", amount: 40000 },
      { item: "Training & Onboarding", amount: 30000 },
      { item: "Launch Support & Marketing Kit", amount: 40000 },
    ],
    paymentSchedule: [
      { milestone: "Token Amount", percent: 10 },
      { milestone: "On Store Design Approval", percent: 30 },
      { milestone: "On Inventory Dispatch", percent: 50 },
      { milestone: "On Store Launch", percent: 10 },
    ],
    inclusions: [
      "250 curated SKUs from China factory",
      "Premium store branding & signage",
      "POS billing software + inventory management",
      "2-month post-launch support",
      "Monthly sales review calls",
      "WhatsApp community access",
    ],
    timeline: [
      { week: "Week 1–2", activity: "Store design & mood board" },
      { week: "Week 3–4", activity: "Interior work & premium fitout" },
      { week: "Week 5–7", activity: "Inventory production & QC" },
      { week: "Week 8", activity: "Shipping & delivery" },
      { week: "Week 9–10", activity: "Store launch & training" },
    ],
  },
  Elite: {
    label: "Elite Package",
    investment: 650000,
    skus: 400,
    storeSize: "350–500 sq ft",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    breakdown: [
      { item: "Store Interior & Premium Fitout", amount: 180000 },
      { item: "Inventory (400 SKUs)", amount: 360000 },
      { item: "EazyToSell Tech Setup + CRM", amount: 50000 },
      { item: "Training & Onboarding", amount: 35000 },
      { item: "Launch Support & Marketing Kit", amount: 25000 },
    ],
    paymentSchedule: [
      { milestone: "Token Amount", percent: 10 },
      { milestone: "On Store Design Approval", percent: 30 },
      { milestone: "On Inventory Dispatch", percent: 50 },
      { milestone: "On Store Launch", percent: 10 },
    ],
    inclusions: [
      "400 curated SKUs from China factory",
      "Premium store branding, signage & displays",
      "Full POS suite + inventory + CRM",
      "Dedicated account manager (6 months)",
      "3-month post-launch support",
      "Weekly sales review calls",
      "WhatsApp community + exclusive partner events",
    ],
    timeline: [
      { week: "Week 1–2", activity: "Store design, site survey & mood board" },
      { week: "Week 3–5", activity: "Premium interior work & custom fitout" },
      { week: "Week 6–8", activity: "Inventory production, QC & branding" },
      { week: "Week 9", activity: "Shipping & delivery" },
      { week: "Week 10–11", activity: "Store launch, training & soft opening" },
    ],
  },
};

// ─── Helper Utilities ────────────────────────────────────────────────────────

function daysSince(dateStr: string): number {
  const d = new Date(dateStr).getTime();
  const now = new Date(TODAY).getTime();
  return Math.floor((now - d) / 86400000);
}

function isOverdue(dateStr: string): boolean {
  return dateStr <= TODAY;
}

function scoreBadge(score: LeadScore) {
  if (score === "Hot") return <Badge className="bg-red-100 text-red-700 border-red-200 gap-1"><Flame className="w-2.5 h-2.5" /> Hot</Badge>;
  if (score === "Warm") return <Badge className="bg-amber-100 text-amber-700 border-amber-200 gap-1"><Thermometer className="w-2.5 h-2.5" /> Warm</Badge>;
  return <Badge className="bg-blue-100 text-blue-700 border-blue-200 gap-1"><Star className="w-2.5 h-2.5" /> Nurture</Badge>;
}

function formatINR(n: number) {
  if (n >= 100000) return "₹" + (n / 100000).toFixed(1) + "L";
  if (n >= 1000) return "₹" + (n / 1000).toFixed(0) + "K";
  return "₹" + n.toLocaleString("en-IN");
}

// ─── Lead Detail Panel ───────────────────────────────────────────────────────

function LeadDetailPanel({ lead, onClose, onStageChange }: {
  lead: Lead;
  onClose: () => void;
  onStageChange: (id: string, stage: LeadStage) => void;
}) {
  const [notes, setNotes] = useState(lead.notes);
  const [followupDate, setFollowupDate] = useState(lead.nextFollowupDate);
  const days = daysSince(lead.lastContactedDate);
  const STAGES: LeadStage[] = ["New Inquiry", "Qualification Sent", "Discovery Call", "Proposal Sent", "Negotiation", "Token Paid", "In Execution", "Launched", "Lost"];

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white shadow-2xl flex flex-col overflow-hidden">
        <div className="bg-gradient-to-br from-sky-500 to-blue-600 p-5 text-white">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                {scoreBadge(lead.score)}
                <Badge className="bg-white/20 text-white border-0 text-xs">{lead.stage}</Badge>
              </div>
              <h2 className="text-xl font-bold">{lead.name}</h2>
              <p className="text-sky-200 text-sm mt-0.5 flex items-center gap-1"><MapPin className="w-3 h-3" />{lead.city}</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors" data-testid="button-close-panel">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex gap-2 mt-4">
            <a href={`tel:+91${lead.phone}`}>
              <Button size="sm" className="bg-white text-sky-600 hover:bg-sky-50 gap-1.5 font-semibold" data-testid="button-call-lead">
                <Phone className="w-3.5 h-3.5" /> Call
              </Button>
            </a>
            <a href={`https://wa.me/91${lead.phone}?text=${encodeURIComponent(`Hi ${lead.name}!`)}`} target="_blank" rel="noopener noreferrer">
              <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white gap-1.5 font-semibold" data-testid="button-wa-lead">
                <MessageSquare className="w-3.5 h-3.5" /> WhatsApp
              </Button>
            </a>
            <a href={`mailto:${lead.email}`}>
              <Button size="sm" className="bg-white/20 hover:bg-white/30 text-white gap-1.5 border border-white/30" data-testid="button-email-lead">
                <Mail className="w-3.5 h-3.5" /> Email
              </Button>
            </a>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-muted/30">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Package</p>
              <p className="font-semibold text-sm">{lead.package}</p>
              <p className="text-xs text-muted-foreground">{formatINR(lead.investment)}</p>
            </div>
            <div className="p-3 rounded-xl bg-muted/30">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Source</p>
              <p className="font-semibold text-sm">{lead.source}</p>
              <p className="text-xs text-muted-foreground">Assigned: {lead.assignedTo}</p>
            </div>
            <div className="p-3 rounded-xl bg-muted/30">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Last Contact</p>
              <p className={`font-semibold text-sm ${days > 7 ? "text-red-600" : ""}`}>{days === 0 ? "Today" : `${days}d ago`}</p>
              <p className="text-xs text-muted-foreground">{lead.lastContactedDate}</p>
            </div>
            <div className="p-3 rounded-xl bg-muted/30">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Phone</p>
              <p className="font-semibold text-sm">+91 {lead.phone}</p>
              <p className="text-xs text-muted-foreground truncate">{lead.email}</p>
            </div>
          </div>

          {lead.package !== "TBD" && PACKAGE_DETAILS[lead.package as keyof typeof PACKAGE_DETAILS] && (() => {
            const pkgDet = PACKAGE_DETAILS[lead.package as keyof typeof PACKAGE_DETAILS];
            return (
              <div className="p-3 rounded-xl bg-sky-50 border border-sky-100">
                <p className="text-xs font-semibold text-sky-700 uppercase tracking-wider mb-2">Investment Breakdown</p>
                <div className="space-y-1.5">
                  {pkgDet.breakdown.map((row) => (
                    <div key={row.item} className="flex justify-between text-xs">
                      <span className="text-muted-foreground">{row.item}</span>
                      <span className="font-semibold text-foreground">{formatINR(row.amount)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between text-xs border-t border-sky-200 pt-1.5 mt-1.5">
                    <span className="font-semibold text-sky-700">Total Investment</span>
                    <span className="font-bold text-sky-700">{formatINR(pkgDet.investment)}</span>
                  </div>
                </div>
              </div>
            );
          })()}

          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Move Stage</p>
            <Select value={lead.stage} onValueChange={(v) => onStageChange(lead.id, v as LeadStage)}>
              <SelectTrigger className="w-full" data-testid="select-stage">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STAGES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Next Follow-up Date</p>
            <Input type="date" value={followupDate} onChange={(e) => setFollowupDate(e.target.value)} data-testid="input-followup-date" />
          </div>

          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Notes</p>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Add notes..." data-testid="textarea-notes" />
          </div>

          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Stage History</p>
            <div className="space-y-2">
              {lead.stageHistory.map((h, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${idx === lead.stageHistory.length - 1 ? "bg-sky-500" : "bg-muted-foreground/30"}`} />
                  <div className="flex-1 flex items-center justify-between">
                    <p className="text-sm font-medium">{h.stage}</p>
                    <p className="text-xs text-muted-foreground">{h.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Activity Log</p>
            <div className="space-y-3">
              {lead.activityLog.map((a, idx) => (
                <div key={idx} className="flex gap-3">
                  <div className="w-7 h-7 rounded-full bg-sky-100 flex items-center justify-center shrink-0">
                    {a.action === "Call" ? <Phone className="w-3 h-3 text-sky-600" /> : a.action === "Email" ? <Mail className="w-3 h-3 text-sky-600" /> : <MessageSquare className="w-3 h-3 text-green-600" />}
                  </div>
                  <div>
                    <p className="text-xs font-semibold">{a.action} · <span className="text-muted-foreground font-normal">{a.date}</span></p>
                    <p className="text-sm text-muted-foreground">{a.note}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t p-4">
          <Button className="w-full bg-sky-600 hover:bg-sky-700 text-white" onClick={onClose} data-testid="button-save-lead">
            Save & Close
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── 1. SALES DASHBOARD ──────────────────────────────────────────────────────

export default function EtsSalesPortal() {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [leads, setLeads] = useState<Lead[]>(MOCK_LEADS);
  const [currentUser, setCurrentUser] = useSalesUser();

  const myLeads = leads.filter((l) => l.assignedTo === currentUser);
  const needFollowup = myLeads.filter((l) => l.nextFollowupDate <= TODAY && l.stage !== "Lost" && l.stage !== "Launched");
  const activeNegotiation = myLeads.filter((l) => l.stage === "Proposal Sent" || l.stage === "Negotiation");
  const currentMonth = TODAY.slice(0, 7);
  const tokensThisMonth = myLeads.filter((l) =>
    l.activityLog.some((a) => a.action === "Token" && a.date.startsWith(currentMonth))
    || (l.stage === "Token Paid" && l.stageHistory.some((h) => h.stage === "Token Paid" && h.date.startsWith(currentMonth)))
  ).length;

  const todayFollowups = myLeads
    .filter((l) => l.nextFollowupDate <= TODAY && l.stage !== "Lost" && l.stage !== "Launched")
    .sort((a, b) => {
      const scoreOrder: Record<LeadScore, number> = { Hot: 0, Warm: 1, Nurture: 2 };
      return scoreOrder[a.score] - scoreOrder[b.score];
    });

  const handleStageChange = useCallback((id: string, stage: LeadStage) => {
    setLeads((prev) => prev.map((l) => l.id === id ? { ...l, stage } : l));
  }, []);

  return (
    <div className="px-16 lg:px-24 py-6 space-y-6" data-testid="sales-dashboard">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-sky-500 via-sky-600 to-blue-700 p-6 text-white shadow-lg">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/3 translate-x-1/3" />
        <div className="relative z-10">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-sky-200 mb-1">Good morning ☀️ — {new Date(TODAY).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}</p>
              <h1 className="text-2xl font-bold font-heading" data-testid="text-dashboard-title">EazyToSell Sales Dashboard</h1>
              <p className="text-sm text-sky-200 mt-1">Your pipeline, today's followups & quick actions — all in one place.</p>
            </div>
            <div className="shrink-0">
              <p className="text-xs text-sky-300 mb-1.5 text-right">Viewing as</p>
              <div className="flex gap-1.5">
                {SALES_USERS.map((u) => (
                  <button
                    key={u}
                    onClick={() => setCurrentUser(u)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${currentUser === u ? "bg-white text-sky-700 shadow-sm" : "bg-white/20 text-white hover:bg-white/30"}`}
                    data-testid={`user-switch-${u}`}
                  >
                    {u}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Leads Assigned to Me", value: myLeads.length, icon: Users, color: "text-sky-600", bg: "bg-sky-50" },
          { label: "Followups Needed Today", value: needFollowup.length, icon: AlertCircle, color: "text-red-600", bg: "bg-red-50" },
          { label: "Active Negotiation", value: activeNegotiation.length, icon: TrendingUp, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Tokens This Month", value: tokensThisMonth, icon: CreditCard, color: "text-green-600", bg: "bg-green-50" },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className={`w-9 h-9 rounded-lg ${stat.bg} flex items-center justify-center mb-3`}>
                  <Icon className={`w-4 h-4 ${stat.color}`} />
                </div>
                <p className="text-2xl font-bold" data-testid={`kpi-${stat.label.toLowerCase().replace(/\s+/g, "-")}`}>{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Clock className="w-4 h-4 text-red-500" /> Today's Followups
            </CardTitle>
            <Badge variant="outline" className="text-xs">{todayFollowups.length} pending</Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0 space-y-2">
          {todayFollowups.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">All caught up! No pending followups today.</p>
          )}
          {todayFollowups.map((lead) => (
            <div
              key={lead.id}
              className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
              onClick={() => setSelectedLead(lead)}
              data-testid={`followup-row-${lead.id}`}
            >
              <div className="w-9 h-9 rounded-full bg-sky-100 flex items-center justify-center text-sm font-bold text-sky-600 shrink-0">
                {lead.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold truncate">{lead.name}</p>
                  {scoreBadge(lead.score)}
                </div>
                <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                  <MapPin className="w-3 h-3" />{lead.city}
                  <span className="w-px h-3 bg-muted-foreground/30" />
                  <span>{lead.stage}</span>
                  <span className="w-px h-3 bg-muted-foreground/30" />
                  <span>Last: {daysSince(lead.lastContactedDate)}d ago</span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <a href={`tel:+91${lead.phone}`} onClick={(e) => e.stopPropagation()}>
                  <Button size="sm" variant="outline" className="h-8 w-8 p-0 rounded-full" data-testid={`btn-call-${lead.id}`}>
                    <Phone className="w-3.5 h-3.5" />
                  </Button>
                </a>
                <a href={`https://wa.me/91${lead.phone}?text=${encodeURIComponent(`Hi ${lead.name}! 👋`)}`} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                  <Button size="sm" className="h-8 w-8 p-0 rounded-full bg-green-500 hover:bg-green-600 text-white" data-testid={`btn-wa-${lead.id}`}>
                    <MessageSquare className="w-3.5 h-3.5" />
                  </Button>
                </a>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {selectedLead && (
        <LeadDetailPanel
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onStageChange={handleStageChange}
        />
      )}
    </div>
  );
}

// ─── 2. PIPELINE KANBAN ──────────────────────────────────────────────────────

const KANBAN_STAGES: LeadStage[] = [
  "New Inquiry", "Qualification Sent", "Discovery Call",
  "Proposal Sent", "Negotiation", "Token Paid",
  "In Execution", "Launched", "Lost",
];

const STAGE_COLORS_KANBAN: Record<LeadStage, string> = {
  "New Inquiry": "border-gray-200 bg-gray-50",
  "Qualification Sent": "border-blue-200 bg-blue-50",
  "Discovery Call": "border-indigo-200 bg-indigo-50",
  "Proposal Sent": "border-purple-200 bg-purple-50",
  "Negotiation": "border-amber-200 bg-amber-50",
  "Token Paid": "border-green-200 bg-green-50",
  "In Execution": "border-teal-200 bg-teal-50",
  "Launched": "border-emerald-200 bg-emerald-50",
  "Lost": "border-red-200 bg-red-50",
};

const STAGE_HEADER_COLORS: Record<LeadStage, string> = {
  "New Inquiry": "text-gray-600",
  "Qualification Sent": "text-blue-600",
  "Discovery Call": "text-indigo-600",
  "Proposal Sent": "text-purple-600",
  "Negotiation": "text-amber-600",
  "Token Paid": "text-green-600",
  "In Execution": "text-teal-600",
  "Launched": "text-emerald-600",
  "Lost": "text-red-600",
};

export function EtsSalesPipeline() {
  const [leads, setLeads] = useState<Lead[]>(MOCK_LEADS);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<LeadStage | null>(null);

  const grouped = useMemo(() => {
    const g: Record<LeadStage, Lead[]> = {} as Record<LeadStage, Lead[]>;
    KANBAN_STAGES.forEach((s) => { g[s] = []; });
    leads.forEach((l) => { g[l.stage]?.push(l); });
    return g;
  }, [leads]);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDragging(id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDrop = (e: React.DragEvent, stage: LeadStage) => {
    e.preventDefault();
    if (dragging) {
      setLeads((prev) => prev.map((l) => l.id === dragging ? { ...l, stage } : l));
      setDragging(null);
      setDragOver(null);
    }
  };

  const handleStageChange = useCallback((id: string, stage: LeadStage) => {
    setLeads((prev) => prev.map((l) => l.id === id ? { ...l, stage } : l));
    setSelectedLead((prev) => prev?.id === id ? { ...prev, stage } : prev);
  }, []);

  return (
    <div className="px-4 lg:px-6 py-6" data-testid="sales-pipeline">
      <div className="mb-5">
        <h1 className="text-xl font-bold font-heading">Pipeline Kanban</h1>
        <p className="text-sm text-muted-foreground">Drag cards between stages to update. Click any card for full details.</p>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-4">
        {KANBAN_STAGES.map((stage) => {
          const stageLeads = grouped[stage] || [];
          const isDragOver = dragOver === stage;
          return (
            <div
              key={stage}
              className={`flex-none w-56 rounded-xl border-2 transition-colors ${isDragOver ? "border-sky-400 bg-sky-50/50" : "border-transparent bg-muted/20"}`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(stage); }}
              onDragLeave={() => setDragOver(null)}
              onDrop={(e) => handleDrop(e, stage)}
              data-testid={`kanban-column-${stage}`}
            >
              <div className="p-3 border-b border-muted-foreground/10">
                <div className="flex items-center justify-between">
                  <p className={`text-xs font-bold uppercase tracking-wider ${STAGE_HEADER_COLORS[stage]}`}>{stage}</p>
                  <Badge variant="outline" className="text-xs h-5 px-1.5">{stageLeads.length}</Badge>
                </div>
              </div>
              <div className="p-2 space-y-2 min-h-[100px]">
                {stageLeads.map((lead) => {
                  const days = daysSince(lead.lastContactedDate);
                  return (
                    <div
                      key={lead.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, lead.id)}
                      onDragEnd={() => { setDragging(null); setDragOver(null); }}
                      onClick={() => setSelectedLead(lead)}
                      className={`p-3 rounded-lg border bg-white shadow-sm cursor-grab active:cursor-grabbing hover:shadow-md transition-all ${dragging === lead.id ? "opacity-40" : ""} ${STAGE_COLORS_KANBAN[stage]}`}
                      data-testid={`kanban-card-${lead.id}`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <p className="text-sm font-semibold truncate">{lead.name}</p>
                        {scoreBadge(lead.score)}
                      </div>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1.5">
                        <MapPin className="w-3 h-3" />{lead.city}
                      </p>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-[10px] px-1.5 h-4">{lead.package}</Badge>
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${days > 7 ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-600"}`}>
                          {days}d ago
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 font-medium">{formatINR(lead.investment)}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {selectedLead && (
        <LeadDetailPanel
          lead={leads.find(l => l.id === selectedLead.id) || selectedLead}
          onClose={() => setSelectedLead(null)}
          onStageChange={handleStageChange}
        />
      )}
    </div>
  );
}

// ─── 3. SCRIPTS & COMMUNICATION TOOLKIT ─────────────────────────────────────

type ScriptStage = "New Inquiry" | "Discovery Call" | "Proposal Sent" | "Negotiation" | "Token Paid";

interface Script {
  id: string;
  title: string;
  type: "whatsapp" | "call" | "checklist" | "objection";
  content: string;
}

const SCRIPTS: Record<ScriptStage, Script[]> = {
  "New Inquiry": [
    {
      id: "ni-1",
      title: "Initial WhatsApp Intro Message",
      type: "whatsapp",
      content: `Hi [Name]! 👋

I'm Harsh from EazyToSell — we help people launch profitable gifting & lifestyle retail stores in cities like [City].

We source directly from China factories, so margins are great and the products are unique — nothing like what's in the local market.

Many of our partners are already earning ₹60,000–₹1,20,000/month from a store of just 150–300 sq ft.

I'd love to share how this works! Can we connect for a quick 10-minute call this week? 🙏`,
    },
    {
      id: "ni-2",
      title: "2-Day Follow-up (No Response)",
      type: "whatsapp",
      content: `Hi [Name]! 😊

Just checking in — did you get a chance to go through my message about the EazyToSell store opportunity?

We're getting a lot of interest from [City] right now, and I didn't want you to miss this.

Would love to answer any questions you might have. Just reply or call me anytime! 📞`,
    },
    {
      id: "ni-3",
      title: "Phone Call Opener",
      type: "call",
      content: `📞 CALL SCRIPT — New Inquiry

Opening:
"Hi [Name], this is Harsh calling from EazyToSell. You had shown interest in our franchise/partner store concept — is this a good time to talk for 5–10 minutes?"

If yes → proceed:
"Great! So let me give you a quick overview of what EazyToSell is and why people are really excited about it..."

Key points to cover:
• We source from China factories → unique products, great margins
• Partner stores earn ₹60K–₹1.2L/month typically
• We handle inventory, branding, tech, training — everything
• Investment starts at ₹3.2L for Lite package

Close with:
"Would you be open to a proper 30-minute discovery call where I walk you through the complete business model and numbers?"`,
    },
  ],
  "Discovery Call": [
    {
      id: "dc-1",
      title: "Call Agenda Checklist",
      type: "checklist",
      content: `📋 DISCOVERY CALL AGENDA

Pre-call (5 mins):
☐ Review lead profile & source
☐ Note their city/location interest
☐ Have package PDFs ready to share

Call Structure (30–40 mins):

1. Build Rapport (5 mins)
   • "Tell me about your background"
   • "What made you interested in starting a store?"

2. Understand Their Situation (10 mins)
   • Current job/business?
   • Do they have a shop location in mind?
   • Family/spouse support?
   • Budget range?

3. Present EazyToSell (10 mins)
   • Business model overview
   • What we do vs. what they do
   • Show 2–3 success stories from similar cities

4. Address Initial Concerns (5–10 mins)
   • Typical concerns: risk, ROI timeline, product variety

5. Next Step (5 mins)
   • "I'll send you the detailed proposal for [Package]"
   • Set a review call date`,
    },
    {
      id: "dc-2",
      title: "Pitch Script",
      type: "call",
      content: `🎯 DISCOVERY CALL PITCH SCRIPT

Opening:
"So [Name], in simple words — EazyToSell is a plug-and-play retail store business. You open the store, we give you everything — products, branding, tech, training. You focus on customers, we handle the backend."

The Model:
"We source from factories in China. So the products are unique — you won't see them in any local market. And because we source directly, margins are 50–70% for the store owner."

Real Numbers:
"Our partners in cities like [City] are doing ₹60K to ₹1.2L take-home every month from a 150–300 sq ft store. The investment starts at ₹3.2L for our Lite package."

Investment Return:
"Most stores break even in 8–12 months. After that it's pure profit. And the products keep changing — we refresh the collection quarterly."

Why Now:
"The gifting and lifestyle segment is booming. Unique, affordable products with good presentation — customers love it. This is still early in most Tier 2 cities."`,
    },
    {
      id: "dc-3",
      title: "Key Discovery Questions",
      type: "call",
      content: `❓ KEY QUESTIONS FOR DISCOVERY CALL

Financial Readiness:
• "Have you thought about the investment range you're comfortable with?"
• "Do you have funds ready, or would you need some time to arrange?"

Location:
• "Do you have a shop location in mind, or do you need help finding one?"
• "What area of [City] are you targeting?"

Timeline:
• "When are you looking to launch? Is there a target month?"
• "Are there any factors that might delay a decision?"

Decision Making:
• "Is it just you deciding, or is your family/spouse involved in the decision?"
• "What would be the one thing that would make you say YES to this right now?"

Concerns:
• "What's your biggest concern about starting this business?"
• "What have you heard about EazyToSell before speaking with me?"`,
    },
  ],
  "Proposal Sent": [
    {
      id: "ps-1",
      title: "WhatsApp — Proposal Sent",
      type: "whatsapp",
      content: `Hi [Name]! 🎉

As promised, I've shared the detailed investment proposal for the EazyToSell [Package] Store.

Here's a quick summary:
📦 Package: [Package]
💰 Total Investment: [Amount]
🏪 Store Size: [Size] sq ft
📊 Expected Monthly Revenue: ₹1.2L–₹2L
📅 Launch Timeline: 8–10 weeks from token

The proposal includes a full investment breakdown, payment schedule, ROI projection, and all inclusions.

Take your time reviewing it. I'm available anytime for questions! 🙏

Let me know when you'd like to walk through it together on a call. Usually takes just 20 minutes and most doubts get cleared up instantly!`,
    },
    {
      id: "ps-2",
      title: "3-Day Follow-up (Proposal)",
      type: "whatsapp",
      content: `Hi [Name]! 😊

Hope you're doing well. Just following up on the EazyToSell proposal I sent 3 days ago.

Have you had a chance to go through it? I know it's a big decision and there might be questions.

Some common things people ask:
❓ "Will products work in my city?" — Yes! We've launched in 40+ cities with great results.
❓ "What if sales are slow?" — We give you a full marketing kit + training to drive footfall.
❓ "Can I negotiate the price?" — The investment is fixed, but we can discuss the payment schedule.

Would love to clear any doubts on a quick call. When works best for you this week? 📞`,
    },
    {
      id: "ps-3",
      title: "Walk-through Call Script",
      type: "call",
      content: `📞 PROPOSAL WALK-THROUGH CALL SCRIPT

Opening:
"[Name], thank you for making time. I'll walk you through the proposal quickly — should take about 20 minutes — and please stop me anytime if something isn't clear."

Section 1 — What You Get:
"The [Package] gives you [X] SKUs, premium store fitout, our POS tech, training and 2 months of post-launch support. Everything is included."

Section 2 — Investment Breakdown:
Walk through each line item. Emphasize value:
"The fitout alone at ₹X is done by our team — no need to hire vendors separately."

Section 3 — Payment Schedule:
"The nice thing about our payment structure is you only pay 10% as token. The bulk comes at inventory dispatch, by which time you've already seen the store design and product samples."

Section 4 — ROI Projection:
"If your store does even ₹3L/month in revenue, at 50% margin, you're taking home ₹1.5L. You recover the investment in 8–10 months."

Close:
"Does this make sense to you? What's holding you back from moving forward?"`,
    },
  ],
  "Negotiation": [
    {
      id: "neg-1",
      title: "\"It's too expensive\" — Handler",
      type: "objection",
      content: `🎯 OBJECTION: "It's too expensive / I don't have that kind of money"

Response:
"I completely understand, [Name]. ₹[Amount] is a significant decision. But let me put it in perspective for you.

If you invest ₹[Amount] in a fixed deposit, you'll earn maybe ₹25,000–₹30,000 a year. With an EazyToSell store, our partners in your city range are taking home ₹60,000–₹1.2L every month.

Also, we've structured the payment to be very friendly — only 10% token upfront, which is ₹[Token Amount]. The bulk payment comes only when your inventory is shipped. By then you've already seen the store design and product samples.

What's the amount you're comfortable starting with?"`,
    },
    {
      id: "neg-2",
      title: "\"What's the ROI?\" — Handler",
      type: "objection",
      content: `🎯 OBJECTION: "When will I get my money back? What's the ROI?"

Response:
"Great question — let me give you real numbers.

If your store does ₹2.5L in monthly sales (which is conservative for a [Package] store), and you keep a 50% margin after products, that's ₹1.25L gross profit.

Deduct rent (~₹20K), staff (~₹15K), misc (~₹10K) → You're taking home ₹80,000–₹1L per month.

At ₹[Amount] investment and ₹80K monthly profit, you break even in about 8–10 months. After that it's all profit.

Compare that to any other business you could start with ₹[Amount] — most take 2–3 years to break even, if at all.

Does that math work for you?"`,
    },
    {
      id: "neg-3",
      title: "\"Will it work in my city?\" — Handler",
      type: "objection",
      content: `🎯 OBJECTION: "Will this work in my city? [City] market is different"

Response:
"[Name], I love this question because every partner asks it! And I completely understand the concern.

Here's what we know: Our best-performing stores are actually in Tier 2 and Tier 3 cities — not metros. Why? Because in smaller cities, there's less competition for unique gifting and lifestyle products.

We've launched in [comparable city similar to theirs] and the partner there is doing ₹[X]L per month after just [X] months.

The products we bring are completely different from what's in the local market — imported directly from factories. Customers come back because they can't find this anywhere else.

Would you like me to connect you with a partner in a city similar to [City] so you can hear it directly from them?"`,
    },
    {
      id: "neg-4",
      title: "\"Need time to think\" — Handler",
      type: "objection",
      content: `🎯 OBJECTION: "I need some more time / Let me think about it"

Response:
"Of course, [Name]! This is a big decision and I'd never want you to rush.

Can I ask — what specifically are you still thinking through? Is it the investment amount, ROI clarity, location, or something else? Just so I can make sure you have all the information you need to decide.

Also — just so you know — we're currently seeing strong demand from [City] and we can only work with one or two partners per area to avoid market saturation. I can't guarantee the spot will be available for long.

But more importantly, I want you to be confident. What would help you feel more certain about this?"`,
    },
    {
      id: "neg-5",
      title: "\"My spouse/family doesn't agree\" — Handler",
      type: "objection",
      content: `🎯 OBJECTION: "My wife/husband/family is not convinced"

Response:
"[Name], I completely understand — a family business decision needs family buy-in. That's actually a great sign — it means you're thinking long-term!

Would it help if I had a quick 15-minute call with your spouse as well? Sometimes hearing it from us directly, with real numbers and examples, makes the difference.

Alternatively, I can send you a simple one-page summary that you can share at home — no jargon, just the key points: investment, returns, risk, and what support we provide.

Which would work better?"`,
    },
    {
      id: "neg-6",
      title: "\"What if the business fails?\" — Handler",
      type: "objection",
      content: `🎯 OBJECTION: "What if the business doesn't work out / I lose money?"

Response:
"[Name], that's the most honest question anyone can ask, and I respect it.

Here's how we de-risk it for you:
1. We only launch you if your location is viable — we review the site before you pay any bulk amount.
2. We give you a full training — operations, billing, inventory, customer handling.
3. We have an ops team that checks in weekly for the first 2 months.
4. Our products are proven — they're already selling in 40+ stores across India.

Now, can a store fail? Yes, if the owner doesn't show up to work. But if you're committed and follow the system — the risk is very low.

What specifically worries you the most — the investment, the products, or something else?"`,
    },
    {
      id: "neg-7",
      title: "\"Can you reduce the price?\" — Handler",
      type: "objection",
      content: `🎯 OBJECTION: "Can you give a discount / reduce the cost?"

Response:
"[Name], I wish I could! But let me be transparent — the investment is structured to ensure you get a store that actually works profitably.

The fitout, inventory quality, tech, and support — if we cut any of these, your store suffers, and that's not something we're willing to do.

What I can offer is flexibility on the payment schedule if that's the concern. Instead of the standard structure, we can sometimes adjust the milestone dates to give you more time between payments.

Is it the total amount that's the issue, or is it the timing of payments? Let's solve for the right thing."`,
    },
    {
      id: "neg-8",
      title: "\"Already looking at other options\" — Handler",
      type: "objection",
      content: `🎯 OBJECTION: "I'm comparing with other franchises / competitors"

Response:
"That's smart, [Name] — you should compare before deciding. Let me give you a framework to evaluate:

1. Sourcing: Do they import directly from factories, or resell through distributors? (EazyToSell = direct import = better margins)

2. Margin: What % of MRP do you keep? (We offer 50–70% store margin)

3. Support: Do they have a hands-on ops team or just send a manual?

4. Products: Are the products exclusive/unique, or available on Amazon/local markets?

5. Track Record: Ask for real references from stores in Tier 2 cities.

After you compare, I'd love to hear what you find. I'm confident in what we offer, but the decision should be yours. Can we reconnect after you've done your research?"`,
    },
    {
      id: "neg-9",
      title: "\"I don't have a shop location\" — Handler",
      type: "objection",
      content: `🎯 OBJECTION: "I don't have a shop / don't know where to open"

Response:
"That's actually very common, [Name], and it's not a blocker at all!

Once you confirm with token, our ops team will help you shortlist 2–3 viable locations in your city. We look for:
• High foot traffic areas (markets, malls, residential complexes)
• 150–300 sq ft minimum space
• Reasonable rent (typically ₹15K–₹30K/month for Tier 2 cities)

We've helped dozens of partners find their perfect spots. So no location = not a problem.

Should we start by discussing what areas of [City] you're familiar with?"`,
    },
    {
      id: "neg-10",
      title: "\"Online shopping will kill retail\" — Handler",
      type: "objection",
      content: `🎯 OBJECTION: "Online shopping is growing — why open a physical store?"

Response:
"[Name], that's a really valid concern. But here's the reality — our product category is actually thriving offline.

Gifting, home decor, lifestyle accessories — people want to touch, feel, and experience these products. They want to pick out a gift in person, not wait 3 days for delivery.

Also, our products aren't available on Amazon or Meesho — they're exclusive factory imports. So we're not competing with e-commerce, we're complementing it.

The numbers back this up: our partner stores in [comparable city] are growing 15–20% month-on-month. Customers keep coming back because the product collection changes every quarter.

Physical retail for unique, experience-driven products is very much alive. This is the sweet spot."`,
    },
    {
      id: "neg-11",
      title: "\"Products quality concerns\" — Handler",
      type: "objection",
      content: `🎯 OBJECTION: "I'm worried about product quality from China"

Response:
"[Name], that's a fair concern. Let me address it directly.

We work with verified factories that have been audited by our sourcing team in China. Every batch goes through QC before shipping — we reject anything that doesn't meet standards.

And here's the key: our products sell at ₹99–₹999 price points. At that price, customers have very reasonable quality expectations — not luxury, but good, functional, attractive products. And that's exactly what we deliver.

The best way to see for yourself is to visit one of our existing stores in a city near you. You can see the actual products on shelves, talk to the store owner, and judge for yourself.

Can I arrange a store visit for you?"`,
    },
    {
      id: "neg-12",
      title: "\"I'm not a business person\" — Handler",
      type: "objection",
      content: `🎯 OBJECTION: "I don't have business experience / I've never run a store"

Response:
"[Name], honestly — that's one of the things that makes our model special. You don't need prior experience.

We designed EazyToSell for regular people who want to be entrepreneurs. Here's what we handle:
• Product sourcing and quality (we do it)
• Store design and fitout (we manage it)
• Inventory and billing tech (we set it up)
• Training on how to run daily operations (we do this with you)

What you need is: willingness to show up, greet customers, and follow our system.

Some of our best performing partners are homemakers, retired government employees, and people who've never been in retail before.

What matters most is your commitment. Are you committed to making this work?"`,
    },
  ],
  "Token Paid": [
    {
      id: "tp-1",
      title: "Congratulations Message",
      type: "whatsapp",
      content: `🎉 Congratulations [Name]!!

Welcome to the EazyToSell family! Your token payment is confirmed and your store journey officially starts NOW! 🚀

Here's what happens next:
✅ Our ops team will reach out within 24 hours
📍 Location finalization & site visit
🎨 Store design mood board — your inputs needed
📦 Inventory selection begins

You've made an amazing decision. We're with you every step of the way.

If you have ANY questions, I'm one message away.

Let's build something great in [City]! 💪`,
    },
    {
      id: "tp-2",
      title: "Ops Handoff Message",
      type: "whatsapp",
      content: `Hi [Name]! 

Just looping in [Ops Name] from our Operations team — they'll be your primary point of contact from here on for everything related to your store setup.

[Ops Name] will handle:
🏗️ Store design & fitout coordination
📦 Inventory selection & ordering
🚚 Shipment tracking
🎓 Launch training

I'll still be around if you ever need me, but [Ops Name] is your go-to person now.

[Ops Name], please say hi to [Name] and take it from here! 🙏

Super excited for your launch in [City]! 🎉`,
    },
  ],
};

export function EtsSalesScripts() {
  const [selectedStage, setSelectedStage] = useState<ScriptStage>("New Inquiry");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const stages: ScriptStage[] = ["New Inquiry", "Discovery Call", "Proposal Sent", "Negotiation", "Token Paid"];
  const scripts = SCRIPTS[selectedStage] || [];

  const handleCopy = (id: string, content: string) => {
    navigator.clipboard?.writeText(content).catch(() => {});
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const typeIcon = (type: Script["type"]) => {
    if (type === "whatsapp") return <MessageSquare className="w-3.5 h-3.5 text-green-600" />;
    if (type === "call") return <Phone className="w-3.5 h-3.5 text-blue-600" />;
    if (type === "checklist") return <UserCheck className="w-3.5 h-3.5 text-purple-600" />;
    return <Info className="w-3.5 h-3.5 text-amber-600" />;
  };

  const typeBadge = (type: Script["type"]) => {
    const labels = { whatsapp: "WhatsApp", call: "Call Script", checklist: "Checklist", objection: "Objection Handler" };
    const colors = { whatsapp: "bg-green-50 border-green-200 text-green-700", call: "bg-blue-50 border-blue-200 text-blue-700", checklist: "bg-purple-50 border-purple-200 text-purple-700", objection: "bg-amber-50 border-amber-200 text-amber-700" };
    return <Badge variant="outline" className={`text-[10px] gap-1 ${colors[type]}`}>{typeIcon(type)}{labels[type]}</Badge>;
  };

  return (
    <div className="px-16 lg:px-24 py-6 space-y-6" data-testid="sales-scripts">
      <div>
        <h1 className="text-xl font-bold font-heading">Scripts & Communication Toolkit</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Select a pipeline stage to see all scripts, objection handlers, and call guides.</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {stages.map((s) => (
          <button
            key={s}
            onClick={() => setSelectedStage(s)}
            className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all ${selectedStage === s ? "bg-sky-600 text-white border-sky-600 shadow-sm" : "bg-white text-muted-foreground border-muted hover:border-sky-300 hover:text-sky-600"}`}
            data-testid={`tab-${s}`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {scripts.map((script) => (
          <Card key={script.id} className="border-0 shadow-sm" data-testid={`script-${script.id}`}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-2">
                  {typeBadge(script.type)}
                  <span className="text-sm font-semibold">{script.title}</span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className={`shrink-0 gap-1.5 transition-all ${copiedId === script.id ? "bg-green-50 border-green-300 text-green-700" : ""}`}
                  onClick={() => handleCopy(script.id, script.content)}
                  data-testid={`copy-${script.id}`}
                >
                  {copiedId === script.id ? <><Check className="w-3.5 h-3.5" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
                </Button>
              </div>
              <pre className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap font-sans">{script.content}</pre>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ─── 4. PROPOSALS ────────────────────────────────────────────────────────────

export function EtsSalesProposals() {
  const [selectedLeadId, setSelectedLeadId] = useState<string>(MOCK_LEADS[0].id);
  const [selectedPackage, setSelectedPackage] = useState<"Lite" | "Pro" | "Elite">("Pro");
  const [copied, setCopied] = useState(false);

  const lead = MOCK_LEADS.find((l) => l.id === selectedLeadId) || MOCK_LEADS[0];
  const pkg = PACKAGE_DETAILS[selectedPackage];

  const proposalText = `INVESTMENT PROPOSAL — EazyToSell ${pkg.label}

Prepared for: ${lead.name} | ${lead.city}
Date: ${TODAY}

─────────────────────────────────

PACKAGE OVERVIEW
Package: ${pkg.label}
Store Size: ${pkg.storeSize}
Number of SKUs: ${pkg.skus}
Total Investment: ₹${pkg.investment.toLocaleString("en-IN")}

─────────────────────────────────

INVESTMENT BREAKDOWN
${pkg.breakdown.map((b) => `${b.item.padEnd(40)} ₹${b.amount.toLocaleString("en-IN")}`).join("\n")}

TOTAL: ₹${pkg.investment.toLocaleString("en-IN")}

─────────────────────────────────

PAYMENT SCHEDULE
${pkg.paymentSchedule.map((p) => `${p.milestone}: ${p.percent}% = ₹${Math.round(pkg.investment * p.percent / 100).toLocaleString("en-IN")}`).join("\n")}

─────────────────────────────────

WHAT'S INCLUDED
${pkg.inclusions.map((i) => `✅ ${i}`).join("\n")}

─────────────────────────────────

LAUNCH TIMELINE
${pkg.timeline.map((t) => `${t.week}: ${t.activity}`).join("\n")}

─────────────────────────────────

NEXT STEPS
1. Confirm your intent with a token (10% = ₹${Math.round(pkg.investment * 0.10).toLocaleString("en-IN")})
2. Location finalization & site visit
3. Store design approval
4. Inventory production begins
5. Store launch in ${pkg.timeline.length * 2} weeks!

Questions? Contact your sales manager anytime.
EazyToSell | sales@eazytosell.com`;

  const handleCopy = () => {
    navigator.clipboard?.writeText(proposalText).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const waText = encodeURIComponent(`Hi ${lead.name}! 🎉 Your personalized EazyToSell investment proposal is ready. Check the details:\n\n${proposalText.slice(0, 500)}...\n\nReply to this message to discuss further!`);

  return (
    <div className="px-16 lg:px-24 py-6 space-y-6" data-testid="sales-proposals">
      <div>
        <h1 className="text-xl font-bold font-heading">Proposal Generator</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Select a lead and package to generate a formatted investment proposal.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Select Lead</label>
          <Select value={selectedLeadId} onValueChange={setSelectedLeadId}>
            <SelectTrigger data-testid="select-lead">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MOCK_LEADS.filter((l) => l.stage !== "Lost").map((l) => (
                <SelectItem key={l.id} value={l.id}>{l.name} — {l.city}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Select Package</label>
          <div className="flex gap-2">
            {(["Lite", "Pro", "Elite"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setSelectedPackage(p)}
                className={`flex-1 py-2 px-3 rounded-lg border text-sm font-semibold transition-all ${selectedPackage === p ? "bg-sky-600 text-white border-sky-600" : "bg-white border-muted text-muted-foreground hover:border-sky-300"}`}
                data-testid={`pkg-${p}`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-3">
        <Card className="border-0 shadow-sm bg-sky-50">
          <CardContent className="p-4">
            <p className="text-xs font-semibold text-sky-700 uppercase tracking-wider mb-1">Total Investment</p>
            <p className="text-2xl font-bold text-sky-800" data-testid="text-total-investment">₹{pkg.investment.toLocaleString("en-IN")}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-green-50">
          <CardContent className="p-4">
            <p className="text-xs font-semibold text-green-700 uppercase tracking-wider mb-1">Token Amount (10%)</p>
            <p className="text-2xl font-bold text-green-800">₹{Math.round(pkg.investment * 0.1).toLocaleString("en-IN")}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-purple-50">
          <CardContent className="p-4">
            <p className="text-xs font-semibold text-purple-700 uppercase tracking-wider mb-1">SKUs Included</p>
            <p className="text-2xl font-bold text-purple-800">{pkg.skus}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold">Investment Breakdown</CardTitle>
            <Badge variant="outline" className="text-xs">{pkg.label}</Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            {pkg.breakdown.map((b, idx) => (
              <div key={idx} className="flex items-center justify-between py-2 border-b border-muted last:border-0">
                <span className="text-sm">{b.item}</span>
                <span className="font-semibold text-sm">₹{b.amount.toLocaleString("en-IN")}</span>
              </div>
            ))}
            <div className="flex items-center justify-between py-2 bg-sky-50 rounded-lg px-3 mt-2">
              <span className="text-sm font-bold text-sky-700">Total</span>
              <span className="font-bold text-sky-700">₹{pkg.investment.toLocaleString("en-IN")}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Full Proposal Preview</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <pre className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap font-mono bg-muted/20 rounded-xl p-4 max-h-80 overflow-y-auto" data-testid="proposal-preview">
            {proposalText}
          </pre>
          <div className="flex gap-3 mt-4">
            <Button onClick={handleCopy} variant="outline" className={`gap-2 ${copied ? "bg-green-50 border-green-300 text-green-700" : ""}`} data-testid="button-copy-proposal">
              {copied ? <><Check className="w-4 h-4" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy Proposal</>}
            </Button>
            <a href={`https://wa.me/91${lead.phone}?text=${waText}`} target="_blank" rel="noopener noreferrer">
              <Button className="gap-2 bg-green-500 hover:bg-green-600 text-white" data-testid="button-share-wa">
                <MessageSquare className="w-4 h-4" /> Share via WhatsApp
              </Button>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── 5. CALENDAR ─────────────────────────────────────────────────────────────

interface SalesCalendarEvent {
  id: string;
  leadId: string;
  leadName: string;
  city: string;
  score: LeadScore;
  type: "followup" | "call";
  date: string;
  overdue: boolean;
}

function buildCalendarEvents(leads: Lead[], currentUser: string): SalesCalendarEvent[] {
  const myLeads = leads.filter((l) => l.assignedTo === currentUser);
  const events: SalesCalendarEvent[] = [];

  myLeads.forEach((l) => {
    if (l.nextFollowupDate && l.stage !== "Lost" && l.stage !== "Launched") {
      events.push({
        id: `fu-${l.id}`,
        leadId: l.id,
        leadName: l.name,
        city: l.city,
        score: l.score,
        type: "followup",
        date: l.nextFollowupDate,
        overdue: l.nextFollowupDate < TODAY,
      });
    }
    l.activityLog.forEach((a, idx) => {
      if (a.action === "Call") {
        events.push({
          id: `call-${l.id}-${idx}`,
          leadId: l.id,
          leadName: l.name,
          city: l.city,
          score: l.score,
          type: "call",
          date: a.date,
          overdue: false,
        });
      }
    });
  });

  return events;
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

export function EtsSalesCalendar() {
  const [currentUser, setCurrentUser] = useSalesUser();
  const todayDate = new Date(TODAY);
  const [viewYear, setViewYear] = useState(todayDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(todayDate.getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const events = useMemo(() => buildCalendarEvents(MOCK_LEADS, currentUser), [currentUser]);
  const eventsMap = useMemo(() => {
    const m: Record<string, SalesCalendarEvent[]> = {};
    events.forEach((e) => {
      if (!m[e.date]) m[e.date] = [];
      m[e.date].push(e);
    });
    return m;
  }, [events]);

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);
  const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
    setSelectedDay(null);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
    setSelectedDay(null);
  };

  const getDateStr = (day: number) => `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  const selectedDateStr = selectedDay ? getDateStr(selectedDay) : null;
  const selectedEvents = selectedDateStr ? (eventsMap[selectedDateStr] || []) : [];

  const overdueEvents = events.filter((e) => e.overdue);

  return (
    <div className="px-16 lg:px-24 py-6 space-y-6" data-testid="sales-calendar">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold font-heading">Follow-up Calendar</h1>
          <p className="text-sm text-muted-foreground mt-0.5">All scheduled followups and calls. Overdue events highlighted in red.</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-sm text-muted-foreground">Viewing as:</span>
          {SALES_USERS.map((u) => (
            <button
              key={u}
              onClick={() => setCurrentUser(u)}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold border transition-all ${currentUser === u ? "bg-sky-600 text-white border-sky-600" : "bg-white text-muted-foreground border-border hover:border-sky-300"}`}
              data-testid={`calendar-user-switch-${u}`}
            >
              {u}
            </button>
          ))}
        </div>
      </div>

      {overdueEvents.length > 0 && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-200">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-700">{overdueEvents.length} Overdue Followup{overdueEvents.length > 1 ? "s" : ""}</p>
            <p className="text-xs text-red-600 mt-0.5">{overdueEvents.map((e) => e.leadName).join(", ")}</p>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={prevMonth} data-testid="button-prev-month">
                  <ChevronRight className="w-4 h-4 rotate-180" />
                </Button>
                <CardTitle className="text-base font-semibold">{MONTHS[viewMonth]} {viewYear}</CardTitle>
                <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={nextMonth} data-testid="button-next-month">
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-7 mb-2">
                {WEEKDAYS.map((d) => (
                  <div key={d} className="text-center text-xs font-semibold text-muted-foreground py-1">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const dateStr = getDateStr(day);
                  const dayEvents = eventsMap[dateStr] || [];
                  const isToday = dateStr === TODAY;
                  const isSelected = selectedDay === day;
                  const hasOverdue = dayEvents.some((e) => e.overdue);
                  const hasEvents = dayEvents.length > 0;

                  return (
                    <button
                      key={day}
                      onClick={() => setSelectedDay(isSelected ? null : day)}
                      className={`relative aspect-square rounded-lg flex flex-col items-center justify-start pt-1 text-sm font-medium transition-all hover:bg-sky-50
                        ${isSelected ? "bg-sky-600 text-white hover:bg-sky-700" : ""}
                        ${isToday && !isSelected ? "ring-2 ring-sky-400 text-sky-700" : ""}
                        ${hasOverdue && !isSelected ? "bg-red-50" : ""}
                      `}
                      data-testid={`calendar-day-${day}`}
                    >
                      <span>{day}</span>
                      {hasEvents && (
                        <div className="flex gap-0.5 mt-0.5">
                          {dayEvents.slice(0, 3).map((ev, idx) => (
                            <div
                              key={idx}
                              className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-white" : ev.overdue ? "bg-red-500" : ev.type === "call" ? "bg-blue-400" : "bg-sky-400"}`}
                            />
                          ))}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          {selectedDay && selectedEvents.length > 0 ? (
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">{MONTHS[viewMonth]} {selectedDay} — Events</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                {selectedEvents.map((event) => (
                  <div
                    key={event.id}
                    className={`p-3 rounded-xl border ${event.overdue ? "border-red-200 bg-red-50" : event.type === "call" ? "border-blue-100 bg-blue-50" : "border-sky-100 bg-sky-50"}`}
                    data-testid={`event-${event.id}`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {scoreBadge(event.score)}
                      <Badge variant="outline" className={`text-[10px] gap-1 ${event.type === "call" ? "bg-blue-50 border-blue-200 text-blue-700" : "bg-sky-50 border-sky-200 text-sky-700"}`}>
                        {event.type === "call" ? <><Phone className="w-2.5 h-2.5" /> Call</> : <><Clock className="w-2.5 h-2.5" /> Followup</>}
                      </Badge>
                      {event.overdue && <Badge className="bg-red-100 text-red-700 border-red-200 text-[10px]">Overdue</Badge>}
                    </div>
                    <p className="text-sm font-semibold">{event.leadName}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" />{event.city}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : selectedDay ? (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6 text-center">
                <Calendar className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No events on {MONTHS[viewMonth]} {selectedDay}</p>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6 text-center">
                <Calendar className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Click a date to see followups</p>
              </CardContent>
            </Card>
          )}

          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Upcoming This Month</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              {events
                .filter((e) => {
                  const d = new Date(e.date);
                  return d.getFullYear() === viewYear && d.getMonth() === viewMonth;
                })
                .sort((a, b) => a.date.localeCompare(b.date))
                .slice(0, 8)
                .map((event) => (
                  <div
                    key={event.id}
                    className={`flex items-center gap-3 p-2 rounded-lg ${event.overdue ? "bg-red-50" : "bg-muted/30"}`}
                    data-testid={`upcoming-${event.id}`}
                  >
                    <div className={`w-8 text-center shrink-0 text-xs font-bold ${event.overdue ? "text-red-600" : event.type === "call" ? "text-blue-600" : "text-sky-600"}`}>
                      {new Date(event.date).getDate()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate">{event.leadName}</p>
                      <p className="text-xs text-muted-foreground capitalize">{event.city} · {event.type}</p>
                    </div>
                    {event.overdue && <div className="w-2 h-2 rounded-full bg-red-500 shrink-0" />}
                  </div>
                ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ─── Legacy exports (followups page replaced by calendar) ────────────────────

export function EtsSalesFollowups() {
  return <EtsSalesCalendar />;
}
