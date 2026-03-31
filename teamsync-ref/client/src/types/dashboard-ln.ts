export interface LnCompany {
  id: string;
  name: string;
  entityType: "LLC" | "C-Corp" | "S-Corp";
  state: string;
  status: "active" | "forming" | "completed" | "dissolved";
  currentStage: number;
  ein?: string;
  packageTier: string;
  startedAt: string;
  registeredAgent?: string;
  stageCompletionDates?: Record<string, string>;
}

export interface LnClientProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  joinedAt: string;
  specialistName: string;
  specialistRole: string;
  companies: LnCompany[];
}

export interface FormationStageDefinition {
  id: string;
  name: string;
  shortName: string;
  description: string;
}

export interface DashboardMetrics {
  activeEntities: number;
  completedEntities: number;
  verifiedDocuments: number;
  pendingDocuments: number;
  pendingInvoices: number;
  outstandingAmount: number;
  unreadMessages: number;
  nextDeadline: string;
  nextDeadlineTitle: string;
}

export interface ComplianceDeadline {
  id: string;
  title: string;
  dueDate: string;
  company: string;
  priority: "high" | "medium" | "low";
  type: "boi" | "annual-report" | "franchise-tax" | "registered-agent" | "tax-filing";
}

export interface RecentActivity {
  id: string;
  type: "document" | "stage" | "payment" | "message" | "compliance";
  title: string;
  description: string;
  timestamp: string;
  icon: "check" | "file" | "dollar" | "shield" | "message";
}

export interface RmContact {
  name: string;
  role: string;
  phone: string;
  whatsApp: string;
  email: string;
  avatar: string;
}

export interface PackageTier {
  id: string;
  name: string;
  price: number;
  currency: string;
  popular?: boolean;
  features: string[];
}

export interface LnDocument {
  id: string;
  companyId: string;
  companyName: string;
  name: string;
  category: "formation" | "tax" | "compliance" | "identity" | "banking";
  uploadedAt: string;
  size: string;
  status: "verified" | "pending-review" | "action-required";
}

export interface LnInvoiceLineItem {
  id: string;
  description: string;
  amount: number;
}

export interface LnInvoice {
  id: string;
  number: string;
  description: string;
  companyId: string;
  companyName: string;
  amount: number;
  status: "paid" | "pending" | "overdue";
  issuedAt: string;
  dueDate: string;
  paidAt?: string;
  lineItems: LnInvoiceLineItem[];
}

export interface LnConversation {
  id: string;
  specialistName: string;
  specialistRole: string;
  specialistInitials: string;
  companyName: string;
  lastMessage: string;
  lastTimestamp: string;
  unread: number;
}

export interface LnMessage {
  id: string;
  conversationId: string;
  from: string;
  fromRole: string;
  isClient: boolean;
  content: string;
  timestamp: string;
}

export type TaxFilingStatus = "not-started" | "docs-pending" | "in-prep" | "review" | "client-review" | "ready-to-file" | "mailed" | "filed";
export interface TaxFiling {
  id: string;
  company: string;
  client: string;
  state: string;
  ein: string;
  entityType: "LLC" | "C-Corp" | "S-Corp";
  taxYear: number;
  status: TaxFilingStatus;
  forms: string[];
  revenue: number;
  assignedTo: string;
  dueDate: string;
  filedDate?: string;
  trackingNumber?: string;
  notes: string;
}

export interface TaxCalendarDeadline {
  id: string;
  title: string;
  date: string;
  type: "filing" | "extension" | "estimated-tax" | "state" | "reminder";
  company?: string;
  priority: "critical" | "high" | "medium" | "low";
  done: boolean;
}

export type LnClientMode = "setup" | "active";
