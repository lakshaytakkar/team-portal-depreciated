export const SOCIAL_COLOR = "#0D9488";

export type SocialPostStatus = "draft" | "scheduled" | "published" | "in-review" | "failed";

export type SocialCampaignStatus = "active" | "draft" | "paused" | "completed" | "archived";

export type SocialAssignmentStatus = "pending" | "in-progress" | "review" | "approved" | "published";

export type SocialApprovalStatus = "pending" | "approved" | "rejected" | "revision-needed";

export const SOCIAL_POST_STATUS_CONFIG: Record<SocialPostStatus, { label: string; color: string; bg: string }> = {
  draft:       { label: "Draft",       color: "#64748b", bg: "#f1f5f9" },
  scheduled:   { label: "Scheduled",   color: "#0284c7", bg: "#e0f2fe" },
  published:   { label: "Published",   color: "#059669", bg: "#d1fae5" },
  "in-review": { label: "In Review",   color: "#d97706", bg: "#fef3c7" },
  failed:      { label: "Failed",      color: "#dc2626", bg: "#fee2e2" },
};

export const SOCIAL_CAMPAIGN_STATUS_CONFIG: Record<SocialCampaignStatus, { label: string; color: string; bg: string }> = {
  active:    { label: "Active",    color: "#059669", bg: "#d1fae5" },
  draft:     { label: "Draft",     color: "#64748b", bg: "#f1f5f9" },
  paused:    { label: "Paused",    color: "#d97706", bg: "#fef3c7" },
  completed: { label: "Completed", color: "#0284c7", bg: "#e0f2fe" },
  archived:  { label: "Archived",  color: "#64748b", bg: "#f8fafc" },
};

export const SOCIAL_ASSIGNMENT_STATUS_CONFIG: Record<SocialAssignmentStatus, { label: string; color: string; bg: string }> = {
  pending:      { label: "Pending",    color: "#64748b", bg: "#f1f5f9" },
  "in-progress":{ label: "In Progress",color: "#0284c7", bg: "#e0f2fe" },
  review:       { label: "Review",     color: "#d97706", bg: "#fef3c7" },
  approved:     { label: "Approved",   color: "#059669", bg: "#d1fae5" },
  published:    { label: "Published",  color: "#0d9488", bg: "#ccfbf1" },
};
