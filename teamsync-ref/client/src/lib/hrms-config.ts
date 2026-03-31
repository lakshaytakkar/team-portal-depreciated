export const HRMS_COLOR = "#0EA5E9";

export type HrmsEmployeeStatus = "active" | "on-leave" | "terminated";

export type HrmsEmploymentType = "full-time" | "part-time" | "contract";

export type HrmsAttendanceStatus = "present" | "absent" | "late" | "half-day" | "on-leave";

export type HrmsLeaveStatus = "pending" | "approved" | "rejected";

export type HrmsPayrollStatus = "pending" | "paid" | "failed";

export type HrmsGoalStatus = "on-track" | "at-risk" | "completed";

export const HRMS_EMPLOYEE_STATUS_CONFIG: Record<HrmsEmployeeStatus, { label: string; color: string; bg: string }> = {
  active:      { label: "Active",      color: "#059669", bg: "#d1fae5" },
  "on-leave":  { label: "On Leave",    color: "#d97706", bg: "#fef3c7" },
  terminated:  { label: "Terminated",  color: "#dc2626", bg: "#fee2e2" },
};

export const HRMS_ATTENDANCE_CONFIG: Record<HrmsAttendanceStatus, { label: string; color: string; bg: string }> = {
  present:    { label: "Present",  color: "#059669", bg: "#d1fae5" },
  absent:     { label: "Absent",   color: "#dc2626", bg: "#fee2e2" },
  late:       { label: "Late",     color: "#d97706", bg: "#fef3c7" },
  "half-day": { label: "Half Day", color: "#0284c7", bg: "#e0f2fe" },
  "on-leave": { label: "On Leave", color: "#d97706", bg: "#fef3c7" },
};

export const HRMS_GOAL_CONFIG: Record<HrmsGoalStatus, { label: string; color: string; bg: string; bar: string }> = {
  "on-track":  { label: "On Track",  color: "#059669", bg: "#d1fae5", bar: "bg-emerald-500" },
  "at-risk":   { label: "At Risk",   color: "#d97706", bg: "#fef3c7", bar: "bg-amber-500"   },
  completed:   { label: "Completed", color: "#0284c7", bg: "#e0f2fe", bar: "bg-blue-500"    },
};

export const HRMS_EMPLOYMENT_CONFIG: Record<HrmsEmploymentType, { label: string; color: string; bg: string }> = {
  "full-time": { label: "Full-time", color: "#64748b", bg: "#f1f5f9" },
  "part-time": { label: "Part-time", color: "#7c3aed", bg: "#ede9fe" },
  contract:    { label: "Contract",  color: "#ea580c", bg: "#ffedd5" },
};

export type AssetStatus = "available" | "assigned" | "in-repair" | "retired";
export type AssetCondition = "new" | "good" | "fair" | "poor";

export const HRMS_ASSET_STATUS_CONFIG: Record<AssetStatus, { label: string; color: string; bg: string }> = {
  available:   { label: "Available",  color: "#059669", bg: "#d1fae5" },
  assigned:    { label: "Assigned",   color: "#0284c7", bg: "#e0f2fe" },
  "in-repair": { label: "In Repair",  color: "#d97706", bg: "#fef3c7" },
  retired:     { label: "Retired",    color: "#64748b", bg: "#f1f5f9" },
};

export const HRMS_ASSET_CONDITION_CONFIG: Record<AssetCondition, { label: string; color: string; bg: string }> = {
  new:  { label: "New",  color: "#059669", bg: "#d1fae5" },
  good: { label: "Good", color: "#0284c7", bg: "#e0f2fe" },
  fair: { label: "Fair", color: "#d97706", bg: "#fef3c7" },
  poor: { label: "Poor", color: "#dc2626", bg: "#fee2e2" },
};
