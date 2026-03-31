export const SALES_COLOR = "#F34147";

export type SalesSubscriptionStatus = "active" | "trial" | "paused" | "cancelled" | "expired";

export type SalesLeadStatus = "new" | "contacted" | "qualified" | "converted" | "lost";

export type SalesTicketStatus = "open" | "in-progress" | "resolved" | "closed";

export type SalesTicketPriority = "low" | "medium" | "high" | "urgent";

export const SALES_SUBSCRIPTION_STATUS_CONFIG: Record<SalesSubscriptionStatus, { label: string; color: string; bg: string }> = {
  active:    { label: "Active",    color: "#059669", bg: "#d1fae5" },
  trial:     { label: "Trial",     color: "#0284c7", bg: "#e0f2fe" },
  paused:    { label: "Paused",    color: "#d97706", bg: "#fef3c7" },
  cancelled: { label: "Cancelled", color: "#dc2626", bg: "#fee2e2" },
  expired:   { label: "Expired",   color: "#64748b", bg: "#f1f5f9" },
};

export const SALES_TICKET_STATUS_CONFIG: Record<SalesTicketStatus, { label: string; color: string; bg: string }> = {
  open:         { label: "Open",        color: "#dc2626", bg: "#fee2e2" },
  "in-progress":{ label: "In Progress", color: "#d97706", bg: "#fef3c7" },
  resolved:     { label: "Resolved",    color: "#059669", bg: "#d1fae5" },
  closed:       { label: "Closed",      color: "#64748b", bg: "#f1f5f9" },
};

export const SALES_TICKET_PRIORITY_CONFIG: Record<SalesTicketPriority, { label: string; color: string; bg: string }> = {
  low:    { label: "Low",    color: "#64748b", bg: "#f1f5f9" },
  medium: { label: "Medium", color: "#d97706", bg: "#fef3c7" },
  high:   { label: "High",   color: "#ea580c", bg: "#ffedd5" },
  urgent: { label: "Urgent", color: "#dc2626", bg: "#fee2e2" },
};
