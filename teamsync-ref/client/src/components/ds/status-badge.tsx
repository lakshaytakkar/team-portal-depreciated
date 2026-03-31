import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type StatusVariant = "success" | "error" | "warning" | "neutral" | "info";

const variantMap: Record<string, StatusVariant> = {
  // General
  Active: "success",
  active: "success",
  Inactive: "error",
  inactive: "error",
  Archived: "neutral",
  archived: "neutral",
  Paused: "warning",
  paused: "warning",
  Draft: "neutral",
  draft: "neutral",
  Pending: "warning",
  pending: "warning",
  Approved: "success",
  approved: "success",
  Rejected: "error",
  rejected: "error",
  Completed: "success",
  completed: "success",
  Cancelled: "error",
  cancelled: "error",
  Canceled: "error",
  canceled: "error",
  Overdue: "error",
  overdue: "error",
  "On Hold": "warning",
  "on-hold": "warning",
  Open: "success",
  open: "success",
  Closed: "error",
  closed: "error",
  Sent: "info",
  sent: "info",
  Opened: "success",
  opened: "success",
  Clicked: "success",
  clicked: "success",
  Bounced: "error",
  bounced: "error",
  Failed: "error",
  failed: "error",
  Paid: "success",
  paid: "success",
  Processing: "warning",
  processing: "warning",
  Refunded: "neutral",
  refunded: "neutral",

  // Status flows
  "To Do": "neutral",
  "In Progress": "info",
  "in-progress": "info",
  Review: "warning",
  review: "warning",
  Done: "success",
  done: "success",
  High: "error",
  high: "error",
  Medium: "warning",
  medium: "warning",
  Low: "neutral",
  low: "neutral",

  // ATS stages
  Applied: "info",
  applied: "info",
  Screening: "warning",
  screening: "warning",
  Interview: "info",
  interview: "info",
  Evaluation: "warning",
  evaluation: "warning",
  Offer: "success",
  offer: "success",
  Hired: "success",
  hired: "success",
  Rescheduled: "warning",
  rescheduled: "warning",
  Scheduled: "info",
  scheduled: "info",

  // ATS recommendation scores
  "strong-yes": "success",
  yes: "success",
  maybe: "warning",
  no: "error",
  "strong-no": "error",

  // Employment types
  "Full-time": "neutral",
  "full-time": "neutral",
  "Part-time": "info",
  "part-time": "info",
  Contract: "warning",
  contract: "warning",
  Internship: "neutral",
  internship: "neutral",

  // CRM
  Lead: "neutral",
  lead: "neutral",
  Prospect: "info",
  prospect: "info",
  Qualified: "warning",
  qualified: "warning",
  Customer: "success",
  customer: "success",
  Churned: "error",
  churned: "error",
  "cold-outreach": "neutral",
  referral: "success",
  website: "info",
  linkedin: "info",
  event: "warning",
  partner: "success",
  inbound: "info",

  // HRMS attendance/leave
  Present: "success",
  present: "success",
  Absent: "error",
  absent: "error",
  Late: "warning",
  late: "warning",
  "Half Day": "info",
  "half-day": "info",
  "On Leave": "warning",
  "on-leave": "warning",
  Terminated: "error",
  terminated: "error",
  "on-track": "success",
  "at-risk": "error",

  // OMS / fulfillment
  Confirmed: "success",
  confirmed: "success",
  Picking: "info",
  picking: "info",
  Packed: "warning",
  packed: "warning",
  Dispatched: "info",
  dispatched: "info",
  Delivered: "success",
  delivered: "success",
  Returned: "neutral",
  returned: "neutral",

  // Finance
  Reconciled: "success",
  reconciled: "success",
  Unreconciled: "warning",
  unreconciled: "warning",
  Partial: "warning",
  partial: "warning",
  Debit: "error",
  debit: "error",
  Credit: "success",
  credit: "success",
  Expense: "error",
  expense: "error",
  Income: "success",
  income: "success",

  // Social
  Published: "success",
  published: "success",
  "In Review": "warning",
  "in-review": "warning",

  // Tickets
  Escalated: "error",
  escalated: "error",
  Waiting: "warning",
  waiting: "warning",
  Resolved: "success",
  resolved: "success",
  critical: "error",
  Critical: "error",
  "feature-request": "info",
  bug: "error",
  performance: "warning",
  integration: "info",
  infrastructure: "neutral",
  "client-request": "warning",
  content: "neutral",
  general: "neutral",

  // Asset management
  available: "success",
  Available: "success",
  assigned: "info",
  Assigned: "info",
  "in-repair": "warning",
  "In Repair": "warning",
  retired: "neutral",
  Retired: "neutral",
  new: "success",
  New: "success",
  good: "info",
  Good: "info",
  fair: "warning",
  Fair: "warning",
  poor: "error",
  Poor: "error",

  // Events
  Tentative: "warning",
  tentative: "warning",
  "Checked In": "success",
  "checked-in": "success",
  Waitlisted: "neutral",
  waitlisted: "neutral",

  // Document/Content types
  Policy: "info",
  Certificate: "success",
  Report: "warning",
  Other: "neutral",
};

const variantStyles: Record<StatusVariant, string> = {
  success: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  error: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300",
  warning: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  neutral: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  info: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
};

interface StatusBadgeProps {
  status: string;
  variant?: StatusVariant;
  className?: string;
}

export function StatusBadge({ status, variant, className }: StatusBadgeProps) {
  const resolvedVariant = variant || variantMap[status] || "neutral";
  return (
    <Badge
      variant="secondary"
      className={cn(
        "border-0 text-xs font-medium px-2 py-0.5",
        variantStyles[resolvedVariant],
        className
      )}
      data-testid={`badge-status-${status.toLowerCase().replace(/\s+/g, "-")}`}
    >
      {status}
    </Badge>
  );
}
