export const CRM_COLOR = "#0369A1";

export type CrmStatus = "lead" | "prospect" | "qualified" | "customer" | "churned";

export type CrmSource =
  | "website"
  | "referral"
  | "linkedin"
  | "cold-outreach"
  | "event"
  | "partner"
  | "inbound";

export type CrmDealStage =
  | "prospecting"
  | "qualification"
  | "proposal"
  | "negotiation"
  | "closed-won"
  | "closed-lost";

export const CRM_STATUS_CONFIG: Record<CrmStatus, { label: string; color: string; bg: string }> = {
  lead:      { label: "New",       color: "#64748b", bg: "#f1f5f9" },
  prospect:  { label: "Contacted", color: "#0284c7", bg: "#e0f2fe" },
  qualified: { label: "Qualified", color: "#d97706", bg: "#fef3c7" },
  customer:  { label: "Converted", color: "#059669", bg: "#d1fae5" },
  churned:   { label: "Lost",      color: "#dc2626", bg: "#fee2e2" },
};

export const CRM_SOURCE_CONFIG: Record<CrmSource, { label: string; color: string; bg: string }> = {
  website:        { label: "Website",       color: "#0284c7", bg: "#e0f2fe" },
  referral:       { label: "Referral",      color: "#059669", bg: "#d1fae5" },
  linkedin:       { label: "LinkedIn",      color: "#1d4ed8", bg: "#dbeafe" },
  "cold-outreach":{ label: "Cold Outreach", color: "#64748b", bg: "#f1f5f9" },
  event:          { label: "Event",         color: "#d97706", bg: "#fef3c7" },
  partner:        { label: "Partner",       color: "#7c3aed", bg: "#ede9fe" },
  inbound:        { label: "Inbound",       color: "#0d9488", bg: "#ccfbf1" },
};

export const CRM_DEAL_STAGE_CONFIG: Record<CrmDealStage, { label: string; color: string; bg: string }> = {
  prospecting:   { label: "Prospecting",   color: "#64748b", bg: "#f1f5f9" },
  qualification: { label: "Qualification", color: "#0284c7", bg: "#e0f2fe" },
  proposal:      { label: "Proposal",      color: "#7c3aed", bg: "#ede9fe" },
  negotiation:   { label: "Negotiation",   color: "#d97706", bg: "#fef3c7" },
  "closed-won":  { label: "Closed Won",    color: "#059669", bg: "#d1fae5" },
  "closed-lost": { label: "Closed Lost",   color: "#dc2626", bg: "#fee2e2" },
};

export const CRM_KANBAN_COLS = [
  { key: "lead",      label: "New Lead",   color: "border-slate-300",  bg: "bg-slate-50"  },
  { key: "prospect",  label: "Contacted",  color: "border-sky-300",    bg: "bg-sky-50"    },
  { key: "qualified", label: "Qualified",  color: "border-amber-300",  bg: "bg-amber-50"  },
  { key: "customer",  label: "Converted",  color: "border-emerald-300",bg: "bg-emerald-50"},
  { key: "churned",   label: "Lost",       color: "border-red-300",    bg: "bg-red-50"    },
] as const;
