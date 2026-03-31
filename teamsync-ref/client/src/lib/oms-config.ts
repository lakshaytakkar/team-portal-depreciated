export const OMS_COLOR = "#0891B2";

export type OmsOrderStatus =
  | "pending"
  | "confirmed"
  | "picking"
  | "packed"
  | "dispatched"
  | "delivered"
  | "cancelled"
  | "on-hold"
  | "returned";

export type OmsInventoryStatus = "in-stock" | "low-stock" | "out-of-stock" | "discontinued";

export type OmsPurchaseOrderStatus = "draft" | "sent" | "confirmed" | "received" | "cancelled";

export type OmsReturnStatus = "requested" | "approved" | "received" | "refunded" | "rejected";

export const OMS_ORDER_STATUS_CONFIG: Record<OmsOrderStatus, { label: string; color: string; bg: string }> = {
  pending:    { label: "Pending",    color: "#64748b", bg: "#f1f5f9" },
  confirmed:  { label: "Confirmed",  color: "#0284c7", bg: "#e0f2fe" },
  picking:    { label: "Picking",    color: "#d97706", bg: "#fef3c7" },
  packed:     { label: "Packed",     color: "#0891b2", bg: "#cffafe" },
  dispatched: { label: "Dispatched", color: "#7c3aed", bg: "#ede9fe" },
  delivered:  { label: "Delivered",  color: "#059669", bg: "#d1fae5" },
  cancelled:  { label: "Cancelled",  color: "#dc2626", bg: "#fee2e2" },
  "on-hold":  { label: "On Hold",    color: "#ea580c", bg: "#ffedd5" },
  returned:   { label: "Returned",   color: "#64748b", bg: "#f1f5f9" },
};

export const OMS_INVENTORY_STATUS_CONFIG: Record<OmsInventoryStatus, { label: string; color: string; bg: string }> = {
  "in-stock":      { label: "In Stock",      color: "#059669", bg: "#d1fae5" },
  "low-stock":     { label: "Low Stock",     color: "#d97706", bg: "#fef3c7" },
  "out-of-stock":  { label: "Out of Stock",  color: "#dc2626", bg: "#fee2e2" },
  discontinued:    { label: "Discontinued",  color: "#64748b", bg: "#f1f5f9" },
};

export const OMS_PO_STATUS_CONFIG: Record<OmsPurchaseOrderStatus, { label: string; color: string; bg: string }> = {
  draft:     { label: "Draft",     color: "#64748b", bg: "#f1f5f9" },
  sent:      { label: "Sent",      color: "#0284c7", bg: "#e0f2fe" },
  confirmed: { label: "Confirmed", color: "#7c3aed", bg: "#ede9fe" },
  received:  { label: "Received",  color: "#059669", bg: "#d1fae5" },
  cancelled: { label: "Cancelled", color: "#dc2626", bg: "#fee2e2" },
};
