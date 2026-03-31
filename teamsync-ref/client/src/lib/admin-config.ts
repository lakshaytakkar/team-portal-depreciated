export const ADMIN_COLOR = "#673AB7";

export type AdminUserRole = "super-admin" | "admin" | "manager" | "viewer";

export type AdminReportStatus = "pending" | "processing" | "completed" | "failed";

export const ADMIN_ROLE_CONFIG: Record<AdminUserRole, { label: string; color: string; bg: string }> = {
  "super-admin": { label: "Super Admin", color: "#7c3aed", bg: "#ede9fe" },
  admin:         { label: "Admin",       color: "#0284c7", bg: "#e0f2fe" },
  manager:       { label: "Manager",     color: "#d97706", bg: "#fef3c7" },
  viewer:        { label: "Viewer",      color: "#64748b", bg: "#f1f5f9" },
};

export const ADMIN_REPORT_STATUS_CONFIG: Record<AdminReportStatus, { label: string; color: string; bg: string }> = {
  pending:    { label: "Pending",    color: "#64748b", bg: "#f1f5f9" },
  processing: { label: "Processing", color: "#d97706", bg: "#fef3c7" },
  completed:  { label: "Completed",  color: "#059669", bg: "#d1fae5" },
  failed:     { label: "Failed",     color: "#dc2626", bg: "#fee2e2" },
};
