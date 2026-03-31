export type CompanyType = "llc" | "pvt-ltd";
export type AccountType = "asset" | "liability" | "equity" | "revenue" | "expense";
export type TxType = "income" | "expense" | "transfer" | "cash-in" | "cash-out";
export type GatewayType = "razorpay" | "stripe" | "bank" | "cash" | null;
export type TxStatus = "reconciled" | "pending";
export type JournalStatus = "posted" | "draft";
export type ICStatus = "open" | "partial" | "settled";
export type GwTxType = "payment" | "refund" | "payout" | "fee";
export type GwStatus = "captured" | "paid" | "failed" | "pending";
export type ComplianceStatus = "filed" | "pending" | "overdue" | "not-applicable";
export type AllocationStatus = "allocated" | "pending";
export interface FinanceCompany {
  id: string;
  name: string;
  shortName: string;
  type: CompanyType;
  jurisdiction: string;
  country: "IN" | "US";
  currency: "INR" | "USD";
  incorporationDate: string;
  registrationNumber: string;
  gstOrEin: string;
  registeredAddress: string;
  directors: string[];
  color: string;
  badgeBg: string;
  badgeText: string;
}

export interface ChartOfAccount {
  id: string;
  name: string;
  code: string;
  type: AccountType;
  subtype: string;
  currency: "INR" | "USD" | "BOTH";
  companyId: string;
  openingBalance: number;
}

export interface FinanceTransaction {
  id: string;
  date: string;
  type: TxType;
  description: string;
  amount: number;
  currency: "INR" | "USD";
  accountId: string;
  accountName: string;
  companyId: string;
  category: string;
  gateway: GatewayType;
  reference: string;
  reconciledStatus: TxStatus;
  enteredBy: string;
}

export interface JournalLine {
  accountId: string;
  accountName: string;
  debit: number;
  credit: number;
  description: string;
}

export interface JournalEntry {
  id: string;
  date: string;
  narration: string;
  companyId: string;
  createdBy: string;
  status: JournalStatus;
  lines: JournalLine[];
  tags: string[];
}

export interface InterCompanyBalance {
  id: string;
  fromCompany: string;
  toCompany: string;
  amount: number;
  currency: "INR" | "USD";
  inrEquivalent: number;
  type: "due-to" | "due-from";
  description: string;
  createdDate: string;
  lastSettledDate?: string;
  status: ICStatus;
}

export interface GatewayTransaction {
  id: string;
  gateway: "razorpay" | "stripe";
  transactionId: string;
  date: string;
  type: GwTxType;
  amount: number;
  currency: "INR" | "USD";
  companyId: string;
  customerName: string;
  orderId: string;
  status: GwStatus;
  reconciledToLedger: boolean;
  reconciledDate?: string;
}

export interface AllocationItem {
  companyId: string;
  percentage: number;
  amount: number;
}

export interface SharedExpenseRule {
  id: string;
  name: string;
  description: string;
  totalAmount: number;
  currency: "INR" | "USD";
  frequency: "monthly";
  allocations: AllocationItem[];
  effectiveFrom: string;
  category: string;
  approvedBy: string;
}

export interface SharedExpenseMonthEntry {
  id: string;
  month: string;
  ruleId: string;
  ruleName: string;
  totalAmount: number;
  currency: "INR" | "USD";
  allocations: AllocationItem[];
  journalEntryRef: string;
  status: AllocationStatus;
}

export interface CashBookEntry {
  id: string;
  date: string;
  description: string;
  type: "in" | "out";
  amount: number;
  currency: "INR" | "USD";
  companyId: string;
  category: string;
  reference: string;
  runningBalance: number;
  enteredBy: string;
}

export interface ComplianceFiling {
  id: string;
  companyId: string;
  type: string;
  name: string;
  filingPeriod: string;
  dueDate: string;
  status: ComplianceStatus;
  filedDate?: string;
  filedBy?: string;
  penaltyAmount?: number;
  notes?: string;
}

export interface ExchangeRate {
  id: string;
  date: string;
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  source: string;
}
