export type DealStage = "new" | "contacted" | "qualified" | "proposal" | "negotiation" | "won" | "lost";
export type ActivityType = "call" | "email" | "meeting" | "whatsapp" | "task" | "note";
export type TemplateType = "email" | "whatsapp" | "sms" | "linkedin";
export type ContactSource = "website" | "referral" | "linkedin" | "cold-outreach" | "event" | "partner" | "inbound";
export type CompanySize = "1-10" | "11-50" | "51-200" | "201-500" | "500+";
export interface CrmContact {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  designation: string;
  vertical: string;
  source: ContactSource;
  city: string;
  country: string;
  assignedTo: string;
  tags: string[];
  lastActivity: string;
  addedDate: string;
  status: "lead" | "prospect" | "customer" | "churned";
  nurtureScore: number;
  nextAction?: string;
  expectedValue?: number;
}

export interface CrmCompany {
  id: string;
  name: string;
  website: string;
  industry: string;
  size: CompanySize;
  vertical: string;
  city: string;
  country: string;
  dealCount: number;
  revenuePotential: number;
  assignedTo: string;
  addedDate: string;
  contacts: string[];
}

export interface CrmDeal {
  id: string;
  title: string;
  contactId: string;
  contactName: string;
  companyName: string;
  vertical: string;
  value: number;
  currency: "INR" | "USD";
  stage: DealStage;
  probability: number;
  expectedClose: string;
  assignedTo: string;
  createdDate: string;
  lastActivity: string;
  source: ContactSource;
  priority: "low" | "medium" | "high";
  notes: string;
  tags: string[];
}

export interface CrmActivity {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  contactId?: string;
  contactName?: string;
  dealId?: string;
  dealTitle?: string;
  vertical: string;
  performedBy: string;
  scheduledAt?: string;
  completedAt?: string;
  status: "completed" | "scheduled" | "overdue";
  outcome?: string;
}

export interface MessageTemplate {
  id: string;
  name: string;
  type: TemplateType;
  stage: DealStage | "general" | "follow-up" | "re-engage";
  verticals: string[];
  subject?: string;
  body: string;
  variables: string[];
  usageCount: number;
  createdBy: string;
  createdDate: string;
  tags: string[];
}

export interface TeamPerformance {
  id: string;
  name: string;
  role: string;
  vertical: string;
  leadsAssigned: number;
  leadsConverted: number;
  dealsWon: number;
  dealsLost: number;
  revenue: number;
  avgDealSize: number;
  activitiesCompleted: number;
  responseTime: number;
  winRate: number;
  target: number;
  achieved: number;
  rank: number;
  auditEvents: string[];
}
