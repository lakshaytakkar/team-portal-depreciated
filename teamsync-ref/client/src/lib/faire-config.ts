// ─────────────────────────────────────────────────────────────────────────────
// faire-config.ts — Single source of truth for all Faire vertical constants
//
// FROZEN: Never edit inline in a page. Always import from here.
// ─────────────────────────────────────────────────────────────────────────────

export const FAIRE_COLOR = "#1A6B45";

// ── Order State ───────────────────────────────────────────────────────────────

export type OrderState =
  | "NEW"
  | "PROCESSING"
  | "PRE_TRANSIT"
  | "IN_TRANSIT"
  | "DELIVERED"
  | "PENDING_RETAILER_CONFIRMATION"
  | "BACKORDERED"
  | "CANCELED";

export const ORDER_STATE_CONFIG: Record<OrderState, { label: string; color: string; bg: string }> = {
  NEW:                          { label: "New",                  color: "#2563EB", bg: "#EFF6FF" },
  PROCESSING:                   { label: "Processing",           color: "#7C3AED", bg: "#F5F3FF" },
  PRE_TRANSIT:                  { label: "Pre-Transit",          color: "#9333EA", bg: "#FAF5FF" },
  IN_TRANSIT:                   { label: "In Transit",           color: "#D97706", bg: "#FFFBEB" },
  DELIVERED:                    { label: "Delivered",            color: "#059669", bg: "#ECFDF5" },
  PENDING_RETAILER_CONFIRMATION:{ label: "Pending Confirmation", color: "#EA580C", bg: "#FFF7ED" },
  BACKORDERED:                  { label: "Backordered",          color: "#DC4A26", bg: "#FFF1EE" },
  CANCELED:                     { label: "Canceled",             color: "#6B7280", bg: "#F9FAFB" },
};

export const ORDER_STATE_LABELS: Record<string, string> = {
  all:                          "All",
  NEW:                          "New",
  PROCESSING:                   "Processing",
  PRE_TRANSIT:                  "Pre-Transit",
  IN_TRANSIT:                   "In Transit",
  DELIVERED:                    "Delivered",
  PENDING_RETAILER_CONFIRMATION:"Pending",
  BACKORDERED:                  "Backordered",
  CANCELED:                     "Canceled",
};

export const ALL_ORDER_STATES: (OrderState | "all")[] = [
  "all", "NEW", "PROCESSING", "PRE_TRANSIT", "IN_TRANSIT",
  "DELIVERED", "PENDING_RETAILER_CONFIRMATION", "BACKORDERED", "CANCELED",
];

export const TIMELINE_STATES: OrderState[] = [
  "NEW", "PROCESSING", "PRE_TRANSIT", "IN_TRANSIT", "DELIVERED",
];

// ── Quotation Status ──────────────────────────────────────────────────────────

export const QUOT_STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  DRAFT:          { label: "Draft",          color: "#6B7280", bg: "#F9FAFB" },
  SENT:           { label: "Sent",           color: "#2563EB", bg: "#EFF6FF" },
  QUOTE_RECEIVED: { label: "Quote Received", color: "#D97706", bg: "#FFFBEB" },
  ACCEPTED:       { label: "Accepted",       color: "#059669", bg: "#ECFDF5" },
  CHALLENGED:     { label: "Challenged",     color: "#EA580C", bg: "#FFF7ED" },
  SENT_ELSEWHERE: { label: "Sent Elsewhere", color: "#64748B", bg: "#F1F5F9" },
};

// ── Ledger / Payment Status ───────────────────────────────────────────────────

export const LED_STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  PENDING:        { label: "Pending",         color: "#D97706", bg: "#FFFBEB" },
  PARTIALLY_PAID: { label: "Partially Paid",  color: "#2563EB", bg: "#EFF6FF" },
  CLEARED:        { label: "Cleared",         color: "#059669", bg: "#ECFDF5" },
};

// ── Cancel Reasons ────────────────────────────────────────────────────────────

export const CANCEL_REASONS: { value: string; label: string }[] = [
  { value: "REQUESTED_BY_RETAILER",    label: "Requested by retailer" },
  { value: "RETAILER_NOT_GOOD_FIT",    label: "Retailer not a good fit" },
  { value: "CHANGE_REPLACE_ORDER",     label: "Change / replace order" },
  { value: "ITEM_OUT_OF_STOCK",        label: "Item out of stock" },
  { value: "INCORRECT_PRICING",        label: "Incorrect pricing" },
  { value: "ORDER_TOO_SMALL",          label: "Order too small" },
  { value: "REJECT_INTERNATIONAL_ORDER", label: "Reject international order" },
  { value: "OTHER",                    label: "Other" },
];

// ── Source Labels ─────────────────────────────────────────────────────────────

export const SOURCE_LABELS: Record<string, string> = {
  MARKETPLACE:  "Marketplace",
  FAIRE_DIRECT: "Faire Direct",
  TRADESHOW:    "Tradeshow",
};

// ── Shipping ──────────────────────────────────────────────────────────────────

export const CARRIERS = ["UPS", "FedEx", "USPS", "DHL"] as const;

export const SHIP_TYPES: { value: string; label: string }[] = [
  { value: "SHIP_ON_YOUR_OWN",      label: "Ship on your own" },
  { value: "FAIRE_SHIPPING_LABEL",  label: "Faire shipping label" },
];
