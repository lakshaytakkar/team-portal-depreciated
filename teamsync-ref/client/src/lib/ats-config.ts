export const ATS_COLOR = "#8B5CF6";

export type AtsStage =
  | "applied"
  | "screening"
  | "interview"
  | "evaluation"
  | "offer"
  | "hired"
  | "rejected";

export type AtsJobStatus = "active" | "paused" | "closed" | "draft";

export type AtsPriority = "high" | "medium" | "low";

export type AtsEmploymentType = "full-time" | "contract" | "internship" | "part-time";

export type AtsInterviewStatus = "scheduled" | "completed" | "cancelled" | "rescheduled";

export type AtsRecommendation = "strong-yes" | "yes" | "maybe" | "no" | "strong-no";

export const ATS_STAGE_CONFIG: Record<AtsStage, { label: string; color: string; bg: string }> = {
  applied:    { label: "Applied",    color: "#64748b", bg: "#f1f5f9" },
  screening:  { label: "Screening",  color: "#0284c7", bg: "#e0f2fe" },
  interview:  { label: "Interview",  color: "#7c3aed", bg: "#ede9fe" },
  evaluation: { label: "Evaluation", color: "#d97706", bg: "#fef3c7" },
  offer:      { label: "Offer",      color: "#ea580c", bg: "#ffedd5" },
  hired:      { label: "Hired",      color: "#059669", bg: "#d1fae5" },
  rejected:   { label: "Rejected",   color: "#dc2626", bg: "#fee2e2" },
};

export const ATS_JOB_STATUS_CONFIG: Record<AtsJobStatus, { label: string; color: string; bg: string }> = {
  active: { label: "Active", color: "#059669", bg: "#d1fae5" },
  paused: { label: "Paused", color: "#d97706", bg: "#fef3c7" },
  closed: { label: "Closed", color: "#dc2626", bg: "#fee2e2" },
  draft:  { label: "Draft",  color: "#64748b", bg: "#f1f5f9" },
};

export const ATS_RECOMMENDATION_CONFIG: Record<AtsRecommendation, { label: string; color: string }> = {
  "strong-yes": { label: "Strong Yes", color: "#059669" },
  "yes":        { label: "Yes",        color: "#0284c7" },
  "maybe":      { label: "Maybe",      color: "#d97706" },
  "no":         { label: "No",         color: "#ea580c" },
  "strong-no":  { label: "Strong No",  color: "#dc2626" },
};

export const ATS_SOURCE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  linkedin:   { label: "LinkedIn",  color: "#0284c7", bg: "#e0f2fe" },
  referral:   { label: "Referral",  color: "#7c3aed", bg: "#ede9fe" },
  website:    { label: "Website",   color: "#059669", bg: "#d1fae5" },
  "job-board":{ label: "Job Board", color: "#d97706", bg: "#fef3c7" },
  direct:     { label: "Direct",    color: "#ea580c", bg: "#ffedd5" },
};
