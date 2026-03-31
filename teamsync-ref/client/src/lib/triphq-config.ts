export const TRIPHQ_COLOR = "#0891B2";

export type TripContactStatus = "upcoming" | "met" | "followed-up";
export type CatalogueStatus = "shortlisted" | "confirmed" | "rejected";
export type TransportStatus = "planned" | "booked" | "completed";
export type ContentStatus = "planned" | "shot" | "editing" | "published";
export type DeliverableStatus = "pending" | "in-progress" | "done";
export type ChecklistCategory = "documents" | "travel" | "tech" | "business" | "health" | "general";
export type PackingCategory = "documents" | "tech" | "clothing" | "toiletries" | "health" | "business" | "general";
export type ExpenseCategory = "transport" | "food" | "hotel" | "shopping" | "business" | "misc";
export type TransportMode = "flight" | "train" | "bus" | "taxi" | "ferry" | "other";
export type AppCategory = "transport" | "payment" | "communication" | "navigation" | "business" | "tech";

export const CONTACT_STATUS_CONFIG: Record<TripContactStatus, { label: string; color: string; bg: string }> = {
  upcoming: { label: "Upcoming", color: "text-blue-700", bg: "bg-blue-50 dark:bg-blue-950" },
  met: { label: "Met", color: "text-emerald-700", bg: "bg-emerald-50 dark:bg-emerald-950" },
  "followed-up": { label: "Followed Up", color: "text-violet-700", bg: "bg-violet-50 dark:bg-violet-950" },
};

export const CATALOGUE_STATUS_CONFIG: Record<CatalogueStatus, { label: string; color: string; bg: string }> = {
  shortlisted: { label: "Shortlisted", color: "text-amber-700", bg: "bg-amber-50 dark:bg-amber-950" },
  confirmed: { label: "Confirmed", color: "text-emerald-700", bg: "bg-emerald-50 dark:bg-emerald-950" },
  rejected: { label: "Rejected", color: "text-red-700", bg: "bg-red-50 dark:bg-red-950" },
};

export const TRANSPORT_MODE_CONFIG: Record<TransportMode, { label: string; icon: string }> = {
  flight: { label: "Flight", icon: "Plane" },
  train: { label: "Train", icon: "Train" },
  bus: { label: "Bus", icon: "Bus" },
  taxi: { label: "Taxi / DiDi", icon: "Car" },
  ferry: { label: "Ferry", icon: "Ship" },
  other: { label: "Other", icon: "MapPin" },
};

export const EXPENSE_CATEGORIES: ExpenseCategory[] = ["transport", "food", "hotel", "shopping", "business", "misc"];
export const CURRENCIES = ["CNY", "USD", "INR", "THB"] as const;
