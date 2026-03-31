export const EVENTS_COLOR = "#E91E63";

export type EventBookingStatus = "confirmed" | "pending" | "cancelled" | "tentative" | "waitlisted";

export type EventPaymentStatus = "paid" | "pending" | "partial" | "refunded" | "failed";

export type EventVisaStatus = "approved" | "pending" | "rejected" | "not-required";

export type EventLeadStatus = "new" | "contacted" | "qualified" | "converted" | "lost";

export const EVENTS_BOOKING_STATUS_CONFIG: Record<EventBookingStatus, { label: string; color: string; bg: string }> = {
  confirmed:  { label: "Confirmed",  color: "#059669", bg: "#d1fae5" },
  pending:    { label: "Pending",    color: "#d97706", bg: "#fef3c7" },
  cancelled:  { label: "Cancelled",  color: "#dc2626", bg: "#fee2e2" },
  tentative:  { label: "Tentative",  color: "#0284c7", bg: "#e0f2fe" },
  waitlisted: { label: "Waitlisted", color: "#64748b", bg: "#f1f5f9" },
};

export const EVENTS_PAYMENT_STATUS_CONFIG: Record<EventPaymentStatus, { label: string; color: string; bg: string }> = {
  paid:     { label: "Paid",     color: "#059669", bg: "#d1fae5" },
  pending:  { label: "Pending",  color: "#d97706", bg: "#fef3c7" },
  partial:  { label: "Partial",  color: "#0284c7", bg: "#e0f2fe" },
  refunded: { label: "Refunded", color: "#64748b", bg: "#f1f5f9" },
  failed:   { label: "Failed",   color: "#dc2626", bg: "#fee2e2" },
};
