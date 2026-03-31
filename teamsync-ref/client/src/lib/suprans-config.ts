export const SUPRANS_COLOR = "#3730A3";
export const VENDOR_COLOR = "#7C3AED";

export type SupransAssignmentStatus = "pending" | "in-progress" | "completed" | "on-hold" | "cancelled";

export type SupransLeadStatus = "new" | "enriched" | "qualified" | "assigned" | "converted" | "lost";

export const SUPRANS_ASSIGNMENT_STATUS_CONFIG: Record<SupransAssignmentStatus, { label: string; color: string; bg: string }> = {
  pending:      { label: "Pending",     color: "#64748b", bg: "#f1f5f9" },
  "in-progress":{ label: "In Progress", color: "#0284c7", bg: "#e0f2fe" },
  completed:    { label: "Completed",   color: "#059669", bg: "#d1fae5" },
  "on-hold":    { label: "On Hold",     color: "#d97706", bg: "#fef3c7" },
  cancelled:    { label: "Cancelled",   color: "#dc2626", bg: "#fee2e2" },
};

export const SUPRANS_LEAD_STATUS_CONFIG: Record<SupransLeadStatus, { label: string; color: string; bg: string }> = {
  new:       { label: "New",       color: "#64748b", bg: "#f1f5f9" },
  enriched:  { label: "Enriched",  color: "#0284c7", bg: "#e0f2fe" },
  qualified: { label: "Qualified", color: "#d97706", bg: "#fef3c7" },
  assigned:  { label: "Assigned",  color: "#7c3aed", bg: "#ede9fe" },
  converted: { label: "Converted", color: "#059669", bg: "#d1fae5" },
  lost:      { label: "Lost",      color: "#dc2626", bg: "#fee2e2" },
};

export const VENDOR_PORTAL_COLOR = "#7C3AED";
