export const EVENTHUB_COLOR = "#7C3AED";

export type EventHubEventStatus = "upcoming" | "ongoing" | "completed" | "cancelled" | "draft";

export type EventHubLeadStatus = "new" | "contacted" | "qualified" | "converted" | "lost";

export type EventHubBudgetStatus = "pending" | "approved" | "paid" | "overdue";

export type EventHubTicketType = "vip" | "general" | "student" | "speaker" | "press";

export const EVENTHUB_EVENT_STATUS_CONFIG: Record<EventHubEventStatus, { label: string; color: string; bg: string }> = {
  upcoming:  { label: "Upcoming",  color: "#0284c7", bg: "#e0f2fe" },
  ongoing:   { label: "Ongoing",   color: "#059669", bg: "#d1fae5" },
  completed: { label: "Completed", color: "#64748b", bg: "#f1f5f9" },
  cancelled: { label: "Cancelled", color: "#dc2626", bg: "#fee2e2" },
  draft:     { label: "Draft",     color: "#d97706", bg: "#fef3c7" },
};

export const EVENTHUB_BUDGET_STATUS_CONFIG: Record<EventHubBudgetStatus, { label: string; color: string; bg: string }> = {
  pending:  { label: "Pending",  color: "#64748b", bg: "#f1f5f9" },
  approved: { label: "Approved", color: "#059669", bg: "#d1fae5" },
  paid:     { label: "Paid",     color: "#0284c7", bg: "#e0f2fe" },
  overdue:  { label: "Overdue",  color: "#dc2626", bg: "#fee2e2" },
};
