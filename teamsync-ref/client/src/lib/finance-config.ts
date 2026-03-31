export const FINANCE_COLOR = "#B45309";

export type FinanceTransactionStatus = "pending" | "completed" | "failed" | "reconciled" | "unreconciled";

export type FinanceTransactionType = "income" | "expense" | "transfer" | "debit" | "credit";

export type FinancePaymentGateway = "razorpay" | "stripe" | "bank" | "cash" | "wise" | "paypal";

export type FinancePaymentStatus = "pending" | "paid" | "partial" | "overdue" | "refunded" | "failed";

export const FINANCE_TRANSACTION_STATUS_CONFIG: Record<FinanceTransactionStatus, { label: string; color: string; bg: string }> = {
  pending:       { label: "Pending",       color: "#d97706", bg: "#fef3c7" },
  completed:     { label: "Completed",     color: "#059669", bg: "#d1fae5" },
  failed:        { label: "Failed",        color: "#dc2626", bg: "#fee2e2" },
  reconciled:    { label: "Reconciled",    color: "#0284c7", bg: "#e0f2fe" },
  unreconciled:  { label: "Unreconciled",  color: "#d97706", bg: "#fef3c7" },
};

export const FINANCE_TYPE_CONFIG: Record<FinanceTransactionType, { label: string; color: string; bg: string }> = {
  income:   { label: "Income",   color: "#059669", bg: "#d1fae5" },
  expense:  { label: "Expense",  color: "#dc2626", bg: "#fee2e2" },
  transfer: { label: "Transfer", color: "#0284c7", bg: "#e0f2fe" },
  debit:    { label: "Debit",    color: "#dc2626", bg: "#fee2e2" },
  credit:   { label: "Credit",   color: "#059669", bg: "#d1fae5" },
};

export const FINANCE_GATEWAY_CONFIG: Record<FinancePaymentGateway, { label: string; color: string; bg: string }> = {
  razorpay: { label: "RZP",    color: "#ea580c", bg: "#ffedd5" },
  stripe:   { label: "STRP",   color: "#7c3aed", bg: "#ede9fe" },
  bank:     { label: "BANK",   color: "#64748b", bg: "#f1f5f9" },
  cash:     { label: "CASH",   color: "#059669", bg: "#d1fae5" },
  wise:     { label: "WISE",   color: "#0284c7", bg: "#e0f2fe" },
  paypal:   { label: "PAYPAL", color: "#1d4ed8", bg: "#dbeafe" },
};

export const FINANCE_PAYMENT_STATUS_CONFIG: Record<FinancePaymentStatus, { label: string; color: string; bg: string }> = {
  pending:  { label: "Pending",  color: "#64748b", bg: "#f1f5f9" },
  paid:     { label: "Paid",     color: "#059669", bg: "#d1fae5" },
  partial:  { label: "Partial",  color: "#d97706", bg: "#fef3c7" },
  overdue:  { label: "Overdue",  color: "#dc2626", bg: "#fee2e2" },
  refunded: { label: "Refunded", color: "#64748b", bg: "#f1f5f9" },
  failed:   { label: "Failed",   color: "#dc2626", bg: "#fee2e2" },
};
