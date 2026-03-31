export type SupransService =
  | "company-formation"
  | "tour-booking"
  | "ecommerce-setup"
  | "event-management"
  | "hr-consulting"
  | "franchise";

export type SupransLeadStatus =
  | "new"
  | "validated"
  | "enriched"
  | "assigned"
  | "converted"
  | "dropped";

export type LeadSource =
  | "website"
  | "referral"
  | "instagram"
  | "linkedin"
  | "google-ads"
  | "walk-in"
  | "whatsapp";
export type LeadPriority = "high" | "medium" | "low";
export interface SupransLead {
  id: string;
  name: string;
  phone: string;
  email: string;
  service: SupransService;
  source: LeadSource;
  status: SupransLeadStatus;
  notes: string;
  assignedVertical?: string;
  assignedRep?: string;
  enrichedAt?: string;
  assignedAt?: string;
  createdAt: string;
  priority: LeadPriority;
}

export interface SupransService_ {
  id: SupransService;
  label: string;
  vertical: string;
  verticalLabel: string;
  color: string;
}
