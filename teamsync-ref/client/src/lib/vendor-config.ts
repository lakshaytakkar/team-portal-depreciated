export const VENDOR_COLOR = "#1E3A5F";

export type VendorOrderStatus = "new" | "quoted" | "processing" | "shipped" | "delivered" | "cancelled";

export type FulfillmentStatus = "unfulfilled" | "partial" | "fulfilled" | "returned";

export type TrackingStatus = "label_created" | "in_transit" | "out_for_delivery" | "delivered" | "exception";

export type LedgerEntryType = "credit" | "debit";

export type LedgerPaymentStatus = "paid" | "pending" | "overdue";

export type StoreConnectionStatus = "connected" | "syncing" | "disconnected";

export type ClientStatus = "active" | "inactive";

export const VENDOR_ORDER_STATUS_CONFIG: Record<VendorOrderStatus, { label: string; color: string; bg: string }> = {
  new:        { label: "New",        color: "#0284c7", bg: "#e0f2fe" },
  quoted:     { label: "Quoted",     color: "#d97706", bg: "#fef3c7" },
  processing: { label: "Processing", color: "#7c3aed", bg: "#ede9fe" },
  shipped:    { label: "Shipped",    color: "#2563eb", bg: "#dbeafe" },
  delivered:  { label: "Delivered",  color: "#059669", bg: "#d1fae5" },
  cancelled:  { label: "Cancelled",  color: "#dc2626", bg: "#fee2e2" },
};

export const FULFILLMENT_STATUS_CONFIG: Record<FulfillmentStatus, { label: string; color: string; bg: string }> = {
  unfulfilled: { label: "Unfulfilled", color: "#dc2626", bg: "#fee2e2" },
  partial:     { label: "Partial",     color: "#d97706", bg: "#fef3c7" },
  fulfilled:   { label: "Fulfilled",   color: "#059669", bg: "#d1fae5" },
  returned:    { label: "Returned",    color: "#64748b", bg: "#f1f5f9" },
};

export const TRACKING_STATUS_CONFIG: Record<TrackingStatus, { label: string; color: string; bg: string }> = {
  label_created:    { label: "Label Created",    color: "#64748b", bg: "#f1f5f9" },
  in_transit:       { label: "In Transit",       color: "#0284c7", bg: "#e0f2fe" },
  out_for_delivery: { label: "Out for Delivery", color: "#d97706", bg: "#fef3c7" },
  delivered:        { label: "Delivered",         color: "#059669", bg: "#d1fae5" },
  exception:        { label: "Exception",         color: "#dc2626", bg: "#fee2e2" },
};

export const LEDGER_PAYMENT_STATUS_CONFIG: Record<LedgerPaymentStatus, { label: string; color: string; bg: string }> = {
  paid:    { label: "Paid",    color: "#059669", bg: "#d1fae5" },
  pending: { label: "Pending", color: "#d97706", bg: "#fef3c7" },
  overdue: { label: "Overdue", color: "#dc2626", bg: "#fee2e2" },
};

export const STORE_STATUS_CONFIG: Record<StoreConnectionStatus, { label: string; color: string; bg: string }> = {
  connected:    { label: "Connected",    color: "#059669", bg: "#d1fae5" },
  syncing:      { label: "Syncing",      color: "#d97706", bg: "#fef3c7" },
  disconnected: { label: "Disconnected", color: "#dc2626", bg: "#fee2e2" },
};

export const CLIENT_STATUS_CONFIG: Record<ClientStatus, { label: string; color: string; bg: string }> = {
  active:   { label: "Active",   color: "#059669", bg: "#d1fae5" },
  inactive: { label: "Inactive", color: "#64748b", bg: "#f1f5f9" },
};
