export const ETS_COLOR = "#F97316";

export type EtsOrderStatus = "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";

export type EtsProposalStatus = "draft" | "sent" | "accepted" | "rejected" | "expired";

export type EtsPaymentStatus = "pending" | "partial" | "paid" | "overdue" | "refunded";

export const ETS_ORDER_STATUS_CONFIG: Record<EtsOrderStatus, { label: string; color: string; bg: string }> = {
  pending:    { label: "Pending",    color: "#64748b", bg: "#f1f5f9" },
  confirmed:  { label: "Confirmed",  color: "#0284c7", bg: "#e0f2fe" },
  processing: { label: "Processing", color: "#d97706", bg: "#fef3c7" },
  shipped:    { label: "Shipped",    color: "#7c3aed", bg: "#ede9fe" },
  delivered:  { label: "Delivered",  color: "#059669", bg: "#d1fae5" },
  cancelled:  { label: "Cancelled",  color: "#dc2626", bg: "#fee2e2" },
};

export const ETS_PROPOSAL_STATUS_CONFIG: Record<EtsProposalStatus, { label: string; color: string; bg: string }> = {
  draft:    { label: "Draft",    color: "#64748b", bg: "#f1f5f9" },
  sent:     { label: "Sent",     color: "#0284c7", bg: "#e0f2fe" },
  accepted: { label: "Accepted", color: "#059669", bg: "#d1fae5" },
  rejected: { label: "Rejected", color: "#dc2626", bg: "#fee2e2" },
  expired:  { label: "Expired",  color: "#d97706", bg: "#fef3c7" },
};

export const ETS_PAYMENT_STATUS_CONFIG: Record<EtsPaymentStatus, { label: string; color: string; bg: string }> = {
  pending:  { label: "Pending",  color: "#64748b", bg: "#f1f5f9" },
  partial:  { label: "Partial",  color: "#d97706", bg: "#fef3c7" },
  paid:     { label: "Paid",     color: "#059669", bg: "#d1fae5" },
  overdue:  { label: "Overdue",  color: "#dc2626", bg: "#fee2e2" },
  refunded: { label: "Refunded", color: "#64748b", bg: "#f1f5f9" },
};
