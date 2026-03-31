export const DEV_COLOR = "#10B981";

export type DevTaskStatus = "todo" | "in-progress" | "review" | "done" | "blocked";

export type DevTaskPriority = "low" | "medium" | "high" | "critical";

export type DevProjectStatus = "planning" | "active" | "on-hold" | "completed" | "archived";

export const DEV_TASK_STATUS_CONFIG: Record<DevTaskStatus, { label: string; color: string; bg: string }> = {
  todo:         { label: "To Do",       color: "#64748b", bg: "#f1f5f9" },
  "in-progress":{ label: "In Progress", color: "#0284c7", bg: "#e0f2fe" },
  review:       { label: "Review",      color: "#d97706", bg: "#fef3c7" },
  done:         { label: "Done",        color: "#059669", bg: "#d1fae5" },
  blocked:      { label: "Blocked",     color: "#dc2626", bg: "#fee2e2" },
};

export const DEV_PROJECT_STATUS_CONFIG: Record<DevProjectStatus, { label: string; color: string; bg: string }> = {
  planning:  { label: "Planning",   color: "#64748b", bg: "#f1f5f9" },
  active:    { label: "Active",     color: "#059669", bg: "#d1fae5" },
  "on-hold": { label: "On Hold",    color: "#d97706", bg: "#fef3c7" },
  completed: { label: "Completed",  color: "#0284c7", bg: "#e0f2fe" },
  archived:  { label: "Archived",   color: "#64748b", bg: "#f8fafc" },
};
