import type { CompanyType, AccountType, TxType, GatewayType, TxStatus, JournalStatus, ICStatus, GwTxType, GwStatus, ComplianceStatus, AllocationStatus, FinanceCompany, ChartOfAccount, FinanceTransaction, JournalLine, JournalEntry, InterCompanyBalance, GatewayTransaction, AllocationItem, SharedExpenseRule, SharedExpenseMonthEntry, CashBookEntry, ComplianceFiling, ExchangeRate } from "@/types/finance";
export type { CompanyType, AccountType, TxType, GatewayType, TxStatus, JournalStatus, ICStatus, GwTxType, GwStatus, ComplianceStatus, AllocationStatus, FinanceCompany, ChartOfAccount, FinanceTransaction, JournalLine, JournalEntry, InterCompanyBalance, GatewayTransaction, AllocationItem, SharedExpenseRule, SharedExpenseMonthEntry, CashBookEntry, ComplianceFiling, ExchangeRate };


export const ALL_FINANCE_COMPANIES: FinanceCompany[] = [
  {
    id: "neom",
    name: "Neom International LLC",
    shortName: "NEOM",
    type: "llc",
    jurisdiction: "Wyoming, USA",
    country: "US",
    currency: "USD",
    incorporationDate: "2022-03-15",
    registrationNumber: "2022-000812047",
    gstOrEin: "88-1234567",
    registeredAddress: "1712 Pioneer Ave, Cheyenne, WY 82001, USA",
    directors: ["Rahul Verma", "Priya Sharma"],
    color: "#0284C7",
    badgeBg: "bg-sky-100",
    badgeText: "text-sky-700",
  },
  {
    id: "cloudnest",
    name: "Cloudnest LLC",
    shortName: "CLOUD",
    type: "llc",
    jurisdiction: "Wyoming, USA",
    country: "US",
    currency: "USD",
    incorporationDate: "2023-01-10",
    registrationNumber: "2023-000415892",
    gstOrEin: "92-7654321",
    registeredAddress: "1712 Pioneer Ave, Cheyenne, WY 82001, USA",
    directors: ["Rahul Verma", "Aditya Kapoor"],
    color: "#7C3AED",
    badgeBg: "bg-violet-100",
    badgeText: "text-violet-700",
  },
  {
    id: "startupsquad",
    name: "Startup Squad Pvt. Ltd.",
    shortName: "SSPL",
    type: "pvt-ltd",
    jurisdiction: "Haryana, India",
    country: "IN",
    currency: "INR",
    incorporationDate: "2021-07-22",
    registrationNumber: "U74999HR2021PTC093421",
    gstOrEin: "06AAHCS1234A1ZP",
    registeredAddress: "Plot 42, Sector 18, Gurugram, Haryana 122015",
    directors: ["Rahul Verma", "Sneha Reddy", "Priya Sharma"],
    color: "#059669",
    badgeBg: "bg-emerald-100",
    badgeText: "text-emerald-700",
  },
  {
    id: "lumbee",
    name: "Lumbee International Pvt. Ltd.",
    shortName: "LIPL",
    type: "pvt-ltd",
    jurisdiction: "Haryana, India",
    country: "IN",
    currency: "INR",
    incorporationDate: "2022-11-05",
    registrationNumber: "U74999HR2022PTC108774",
    gstOrEin: "06AAHCL5678B1ZQ",
    registeredAddress: "Plot 42, Sector 18, Gurugram, Haryana 122015",
    directors: ["Aditya Kapoor", "Rahul Verma"],
    color: "#D97706",
    badgeBg: "bg-amber-100",
    badgeText: "text-amber-700",
  },
];

export const chartOfAccounts: ChartOfAccount[] = [
  { id: "ac001", name: "Cash in Hand", code: "1001", type: "asset", subtype: "current", currency: "BOTH", companyId: "all", openingBalance: 45000 },
  { id: "ac002", name: "Bank – HDFC INR", code: "1002", type: "asset", subtype: "current", currency: "INR", companyId: "startupsquad", openingBalance: 380000 },
  { id: "ac003", name: "Bank – HDFC INR", code: "1003", type: "asset", subtype: "current", currency: "INR", companyId: "lumbee", openingBalance: 215000 },
  { id: "ac004", name: "Bank – Mercury USD", code: "1004", type: "asset", subtype: "current", currency: "USD", companyId: "neom", openingBalance: 12500 },
  { id: "ac005", name: "Bank – Mercury USD", code: "1005", type: "asset", subtype: "current", currency: "USD", companyId: "cloudnest", openingBalance: 8200 },
  { id: "ac006", name: "Bank – Wise USD", code: "1006", type: "asset", subtype: "current", currency: "USD", companyId: "neom", openingBalance: 3400 },
  { id: "ac007", name: "Accounts Receivable", code: "1010", type: "asset", subtype: "current", currency: "BOTH", companyId: "all", openingBalance: 95000 },
  { id: "ac008", name: "Security Deposit", code: "1020", type: "asset", subtype: "non-current", currency: "INR", companyId: "startupsquad", openingBalance: 120000 },
  { id: "ac009", name: "Prepaid Expenses", code: "1030", type: "asset", subtype: "current", currency: "INR", companyId: "all", openingBalance: 24000 },
  { id: "ac010", name: "Intercompany Receivable", code: "1040", type: "asset", subtype: "current", currency: "BOTH", companyId: "all", openingBalance: 0 },

  { id: "ac011", name: "Accounts Payable", code: "2001", type: "liability", subtype: "current", currency: "BOTH", companyId: "all", openingBalance: 48000 },
  { id: "ac012", name: "GST Payable", code: "2002", type: "liability", subtype: "current", currency: "INR", companyId: "startupsquad", openingBalance: 32000 },
  { id: "ac013", name: "GST Payable", code: "2003", type: "liability", subtype: "current", currency: "INR", companyId: "lumbee", openingBalance: 18500 },
  { id: "ac014", name: "TDS Payable", code: "2004", type: "liability", subtype: "current", currency: "INR", companyId: "all", openingBalance: 15000 },
  { id: "ac015", name: "Director Loan", code: "2010", type: "liability", subtype: "non-current", currency: "INR", companyId: "startupsquad", openingBalance: 500000 },
  { id: "ac016", name: "Intercompany Payable", code: "2020", type: "liability", subtype: "current", currency: "BOTH", companyId: "all", openingBalance: 0 },

  { id: "ac017", name: "Paid-up Capital", code: "3001", type: "equity", subtype: "capital", currency: "INR", companyId: "startupsquad", openingBalance: 1000000 },
  { id: "ac018", name: "Paid-up Capital", code: "3002", type: "equity", subtype: "capital", currency: "INR", companyId: "lumbee", openingBalance: 500000 },
  { id: "ac019", name: "Member Capital – Neom", code: "3003", type: "equity", subtype: "capital", currency: "USD", companyId: "neom", openingBalance: 25000 },
  { id: "ac020", name: "Member Capital – Cloudnest", code: "3004", type: "equity", subtype: "capital", currency: "USD", companyId: "cloudnest", openingBalance: 15000 },
  { id: "ac021", name: "Retained Earnings", code: "3010", type: "equity", subtype: "retained", currency: "BOTH", companyId: "all", openingBalance: 0 },
  { id: "ac022", name: "Owner's Draw", code: "3020", type: "equity", subtype: "draw", currency: "BOTH", companyId: "all", openingBalance: 0 },

  { id: "ac023", name: "Service Revenue", code: "4001", type: "revenue", subtype: "operating", currency: "BOTH", companyId: "all", openingBalance: 0 },
  { id: "ac024", name: "Product Sales", code: "4002", type: "revenue", subtype: "operating", currency: "USD", companyId: "neom", openingBalance: 0 },
  { id: "ac025", name: "Wholesale Revenue – Faire", code: "4003", type: "revenue", subtype: "operating", currency: "USD", companyId: "cloudnest", openingBalance: 0 },
  { id: "ac026", name: "Commission Income", code: "4004", type: "revenue", subtype: "operating", currency: "INR", companyId: "startupsquad", openingBalance: 0 },
  { id: "ac027", name: "Forex Gain", code: "4010", type: "revenue", subtype: "non-operating", currency: "BOTH", companyId: "all", openingBalance: 0 },

  { id: "ac028", name: "Office Rent", code: "5001", type: "expense", subtype: "overhead", currency: "INR", companyId: "all", openingBalance: 0 },
  { id: "ac029", name: "Salaries & Wages", code: "5002", type: "expense", subtype: "payroll", currency: "INR", companyId: "all", openingBalance: 0 },
  { id: "ac030", name: "Marketing & Advertising", code: "5003", type: "expense", subtype: "sales", currency: "BOTH", companyId: "all", openingBalance: 0 },
  { id: "ac031", name: "Platform Fees", code: "5004", type: "expense", subtype: "operational", currency: "BOTH", companyId: "all", openingBalance: 0 },
  { id: "ac032", name: "Software Subscriptions", code: "5005", type: "expense", subtype: "operational", currency: "BOTH", companyId: "all", openingBalance: 0 },
  { id: "ac033", name: "Bank Charges", code: "5006", type: "expense", subtype: "finance", currency: "BOTH", companyId: "all", openingBalance: 0 },
  { id: "ac034", name: "Professional Fees", code: "5007", type: "expense", subtype: "operational", currency: "INR", companyId: "all", openingBalance: 0 },
  { id: "ac035", name: "Internet & Utilities", code: "5008", type: "expense", subtype: "overhead", currency: "INR", companyId: "all", openingBalance: 0 },
  { id: "ac036", name: "Forex Loss", code: "5010", type: "expense", subtype: "finance", currency: "BOTH", companyId: "all", openingBalance: 0 },
  { id: "ac037", name: "Depreciation", code: "5011", type: "expense", subtype: "non-cash", currency: "INR", companyId: "all", openingBalance: 0 },
  { id: "ac038", name: "Travel & Conveyance", code: "5012", type: "expense", subtype: "operational", currency: "INR", companyId: "all", openingBalance: 0 },
  { id: "ac039", name: "Dropshipping COGS", code: "5013", type: "expense", subtype: "cogs", currency: "USD", companyId: "neom", openingBalance: 0 },
  { id: "ac040", name: "Faire COGS", code: "5014", type: "expense", subtype: "cogs", currency: "USD", companyId: "cloudnest", openingBalance: 0 },
];

export const financeTransactions: FinanceTransaction[] = [
  { id: "tx001", date: "2026-02-28", type: "income", description: "Stripe payout – Feb batch", amount: 4820, currency: "USD", accountId: "ac004", accountName: "Bank – Mercury USD", companyId: "neom", category: "Product Sales", gateway: "stripe", reference: "STR-PAY-20260228", reconciledStatus: "reconciled", enteredBy: "Rahul Verma" },
  { id: "tx002", date: "2026-02-28", type: "income", description: "Stripe payout – Faire wholesale", amount: 3150, currency: "USD", accountId: "ac005", accountName: "Bank – Mercury USD", companyId: "cloudnest", category: "Wholesale Revenue – Faire", gateway: "stripe", reference: "STR-PAY-20260228-C", reconciledStatus: "reconciled", enteredBy: "Aditya Kapoor" },
  { id: "tx003", date: "2026-02-28", type: "income", description: "Razorpay payout – Feb settlements", amount: 182000, currency: "INR", accountId: "ac002", accountName: "Bank – HDFC INR", companyId: "startupsquad", category: "Service Revenue", gateway: "razorpay", reference: "RZP-PAY-20260228", reconciledStatus: "reconciled", enteredBy: "Sneha Reddy" },
  { id: "tx004", date: "2026-02-28", type: "income", description: "Razorpay payout – Feb settlements", amount: 124500, currency: "INR", accountId: "ac003", accountName: "Bank – HDFC INR", companyId: "lumbee", category: "Service Revenue", gateway: "razorpay", reference: "RZP-PAY-20260228-L", reconciledStatus: "reconciled", enteredBy: "Aditya Kapoor" },
  { id: "tx005", date: "2026-02-27", type: "expense", description: "Office rent – Gurugram (SSPL share 40%)", amount: 12000, currency: "INR", accountId: "ac028", accountName: "Office Rent", companyId: "startupsquad", category: "Office Rent", gateway: "bank", reference: "RENT-FEB26-SSPL", reconciledStatus: "reconciled", enteredBy: "Sneha Reddy" },
  { id: "tx006", date: "2026-02-27", type: "expense", description: "Office rent – Gurugram (LIPL share 60%)", amount: 18000, currency: "INR", accountId: "ac028", accountName: "Office Rent", companyId: "lumbee", category: "Office Rent", gateway: "bank", reference: "RENT-FEB26-LIPL", reconciledStatus: "reconciled", enteredBy: "Aditya Kapoor" },
  { id: "tx007", date: "2026-02-25", type: "expense", description: "Salaries – Feb 2026 (SSPL)", amount: 245000, currency: "INR", accountId: "ac029", accountName: "Salaries & Wages", companyId: "startupsquad", category: "Salaries", gateway: "bank", reference: "SAL-FEB26-SSPL", reconciledStatus: "reconciled", enteredBy: "Sneha Reddy" },
  { id: "tx008", date: "2026-02-25", type: "expense", description: "Salaries – Feb 2026 (LIPL)", amount: 145000, currency: "INR", accountId: "ac029", accountName: "Salaries & Wages", companyId: "lumbee", category: "Salaries", gateway: "bank", reference: "SAL-FEB26-LIPL", reconciledStatus: "reconciled", enteredBy: "Aditya Kapoor" },
  { id: "tx009", date: "2026-02-24", type: "expense", description: "Shopify subscription – Feb (Neom)", amount: 79, currency: "USD", accountId: "ac032", accountName: "Software Subscriptions", companyId: "neom", category: "Software", gateway: "stripe", reference: "SHOPIFY-FEB26", reconciledStatus: "reconciled", enteredBy: "Rahul Verma" },
  { id: "tx010", date: "2026-02-24", type: "expense", description: "Faire platform fee – Feb", amount: 220, currency: "USD", accountId: "ac031", accountName: "Platform Fees", companyId: "cloudnest", category: "Platform Fees", gateway: "stripe", reference: "FAIRE-FEE-FEB26", reconciledStatus: "reconciled", enteredBy: "Aditya Kapoor" },
  { id: "tx011", date: "2026-02-22", type: "income", description: "Client payment – TechSolutions Inc (US)", amount: 8500, currency: "USD", accountId: "ac004", accountName: "Bank – Mercury USD", companyId: "neom", category: "Service Revenue", gateway: "stripe", reference: "INV-2026-042", reconciledStatus: "reconciled", enteredBy: "Rahul Verma" },
  { id: "tx012", date: "2026-02-22", type: "income", description: "Client payment – Acme Retail India", amount: 95000, currency: "INR", accountId: "ac002", accountName: "Bank – HDFC INR", companyId: "startupsquad", category: "Service Revenue", gateway: "razorpay", reference: "INV-2026-SS-038", reconciledStatus: "reconciled", enteredBy: "Sneha Reddy" },
  { id: "tx013", date: "2026-02-20", type: "transfer", description: "Inter-company transfer: Neom → SSPL (USD client settlement)", amount: 705600, currency: "INR", accountId: "ac016", accountName: "Intercompany Payable", companyId: "neom", category: "Inter-Company", gateway: "bank", reference: "IC-2026-012", reconciledStatus: "reconciled", enteredBy: "Rahul Verma" },
  { id: "tx014", date: "2026-02-20", type: "income", description: "Inter-company receipt: from Neom (USD settlement INR equiv)", amount: 705600, currency: "INR", accountId: "ac002", accountName: "Bank – HDFC INR", companyId: "startupsquad", category: "Inter-Company", gateway: "bank", reference: "IC-2026-012", reconciledStatus: "reconciled", enteredBy: "Sneha Reddy" },
  { id: "tx015", date: "2026-02-18", type: "expense", description: "Google Ads – Feb (SSPL)", amount: 28000, currency: "INR", accountId: "ac030", accountName: "Marketing & Advertising", companyId: "startupsquad", category: "Marketing", gateway: "bank", reference: "GADS-FEB26-SS", reconciledStatus: "reconciled", enteredBy: "Sneha Reddy" },
  { id: "tx016", date: "2026-02-18", type: "expense", description: "Facebook Ads – Feb (Neom)", amount: 1200, currency: "USD", accountId: "ac030", accountName: "Marketing & Advertising", companyId: "neom", category: "Marketing", gateway: "stripe", reference: "FBADS-FEB26-NEOM", reconciledStatus: "reconciled", enteredBy: "Rahul Verma" },
  { id: "tx017", date: "2026-02-15", type: "income", description: "Dropshipping revenue – batch sale US", amount: 6300, currency: "USD", accountId: "ac004", accountName: "Bank – Mercury USD", companyId: "neom", category: "Product Sales", gateway: "stripe", reference: "DROP-BATCH-FEB2", reconciledStatus: "reconciled", enteredBy: "Rahul Verma" },
  { id: "tx018", date: "2026-02-15", type: "expense", description: "COGS – Dropshipping supplier payment", amount: 4200, currency: "USD", accountId: "ac039", accountName: "Dropshipping COGS", companyId: "neom", category: "COGS", gateway: "stripe", reference: "COGS-FEB15", reconciledStatus: "reconciled", enteredBy: "Rahul Verma" },
  { id: "tx019", date: "2026-02-14", type: "income", description: "Faire wholesale order – HomeGoods Co.", amount: 2800, currency: "USD", accountId: "ac005", accountName: "Bank – Mercury USD", companyId: "cloudnest", category: "Wholesale Revenue – Faire", gateway: "stripe", reference: "FAIRE-ORD-FEB14", reconciledStatus: "reconciled", enteredBy: "Aditya Kapoor" },
  { id: "tx020", date: "2026-02-14", type: "expense", description: "Faire COGS – product sourcing", amount: 1680, currency: "USD", accountId: "ac040", accountName: "Faire COGS", companyId: "cloudnest", category: "COGS", gateway: "stripe", reference: "FAIRE-COGS-FEB14", reconciledStatus: "reconciled", enteredBy: "Aditya Kapoor" },
  { id: "tx021", date: "2026-02-12", type: "expense", description: "CA/Accounting fees – Feb (shared)", amount: 15000, currency: "INR", accountId: "ac034", accountName: "Professional Fees", companyId: "startupsquad", category: "Professional Fees", gateway: "bank", reference: "CA-FEB26-SSPL", reconciledStatus: "reconciled", enteredBy: "Sneha Reddy" },
  { id: "tx022", date: "2026-02-12", type: "expense", description: "CA/Accounting fees – Feb (shared)", amount: 15000, currency: "INR", accountId: "ac034", accountName: "Professional Fees", companyId: "lumbee", category: "Professional Fees", gateway: "bank", reference: "CA-FEB26-LIPL", reconciledStatus: "reconciled", enteredBy: "Aditya Kapoor" },
  { id: "tx023", date: "2026-02-10", type: "income", description: "Client payment – GlobalMart Ltd", amount: 68000, currency: "INR", accountId: "ac003", accountName: "Bank – HDFC INR", companyId: "lumbee", category: "Service Revenue", gateway: "razorpay", reference: "INV-2026-L-019", reconciledStatus: "reconciled", enteredBy: "Aditya Kapoor" },
  { id: "tx024", date: "2026-02-08", type: "cash-in", description: "Cash received from client – advance", amount: 25000, currency: "INR", accountId: "ac001", accountName: "Cash in Hand", companyId: "startupsquad", category: "Client Payment", gateway: "cash", reference: "CASH-ADV-008", reconciledStatus: "pending", enteredBy: "Sneha Reddy" },
  { id: "tx025", date: "2026-02-07", type: "cash-out", description: "Petty cash – office supplies", amount: 3200, currency: "INR", accountId: "ac001", accountName: "Cash in Hand", companyId: "startupsquad", category: "Office Supplies", gateway: "cash", reference: "PETTY-007", reconciledStatus: "pending", enteredBy: "Sneha Reddy" },
  { id: "tx026", date: "2026-02-05", type: "expense", description: "Internet & broadband – Feb (SSPL 50%)", amount: 2000, currency: "INR", accountId: "ac035", accountName: "Internet & Utilities", companyId: "startupsquad", category: "Utilities", gateway: "bank", reference: "NET-FEB26-SSPL", reconciledStatus: "reconciled", enteredBy: "Sneha Reddy" },
  { id: "tx027", date: "2026-02-05", type: "expense", description: "Internet & broadband – Feb (LIPL 50%)", amount: 2000, currency: "INR", accountId: "ac035", accountName: "Internet & Utilities", companyId: "lumbee", category: "Utilities", gateway: "bank", reference: "NET-FEB26-LIPL", reconciledStatus: "reconciled", enteredBy: "Aditya Kapoor" },
  { id: "tx028", date: "2026-02-03", type: "expense", description: "Bank charges – wire transfer fee (Neom)", amount: 25, currency: "USD", accountId: "ac033", accountName: "Bank Charges", companyId: "neom", category: "Bank Charges", gateway: "bank", reference: "WIRE-FEE-020326", reconciledStatus: "reconciled", enteredBy: "Rahul Verma" },
  { id: "tx029", date: "2026-02-01", type: "income", description: "Commission – Startup Squad referral", amount: 18500, currency: "INR", accountId: "ac002", accountName: "Bank – HDFC INR", companyId: "startupsquad", category: "Commission Income", gateway: "bank", reference: "COMM-FEB01", reconciledStatus: "reconciled", enteredBy: "Priya Sharma" },
  { id: "tx030", date: "2026-01-31", type: "income", description: "Stripe payout – Jan batch (Neom)", amount: 5240, currency: "USD", accountId: "ac004", accountName: "Bank – Mercury USD", companyId: "neom", category: "Product Sales", gateway: "stripe", reference: "STR-PAY-20260131", reconciledStatus: "reconciled", enteredBy: "Rahul Verma" },
  { id: "tx031", date: "2026-01-31", type: "income", description: "Razorpay payout – Jan (SSPL)", amount: 165000, currency: "INR", accountId: "ac002", accountName: "Bank – HDFC INR", companyId: "startupsquad", category: "Service Revenue", gateway: "razorpay", reference: "RZP-PAY-20260131", reconciledStatus: "reconciled", enteredBy: "Sneha Reddy" },
  { id: "tx032", date: "2026-01-30", type: "expense", description: "Office rent – Gurugram Jan (SSPL share)", amount: 12000, currency: "INR", accountId: "ac028", accountName: "Office Rent", companyId: "startupsquad", category: "Office Rent", gateway: "bank", reference: "RENT-JAN26-SSPL", reconciledStatus: "reconciled", enteredBy: "Sneha Reddy" },
  { id: "tx033", date: "2026-01-30", type: "expense", description: "Office rent – Gurugram Jan (LIPL share)", amount: 18000, currency: "INR", accountId: "ac028", accountName: "Office Rent", companyId: "lumbee", category: "Office Rent", gateway: "bank", reference: "RENT-JAN26-LIPL", reconciledStatus: "reconciled", enteredBy: "Aditya Kapoor" },
  { id: "tx034", date: "2026-01-28", type: "expense", description: "Salaries – Jan 2026 (SSPL)", amount: 245000, currency: "INR", accountId: "ac029", accountName: "Salaries & Wages", companyId: "startupsquad", category: "Salaries", gateway: "bank", reference: "SAL-JAN26-SSPL", reconciledStatus: "reconciled", enteredBy: "Sneha Reddy" },
  { id: "tx035", date: "2026-01-28", type: "expense", description: "Salaries – Jan 2026 (LIPL)", amount: 145000, currency: "INR", accountId: "ac029", accountName: "Salaries & Wages", companyId: "lumbee", category: "Salaries", gateway: "bank", reference: "SAL-JAN26-LIPL", reconciledStatus: "reconciled", enteredBy: "Aditya Kapoor" },
  { id: "tx036", date: "2026-01-25", type: "income", description: "Client payment – InnovateTech Solutions", amount: 75000, currency: "INR", accountId: "ac002", accountName: "Bank – HDFC INR", companyId: "startupsquad", category: "Service Revenue", gateway: "razorpay", reference: "INV-2026-SS-031", reconciledStatus: "reconciled", enteredBy: "Priya Sharma" },
  { id: "tx037", date: "2026-01-22", type: "income", description: "Dropshipping revenue – Jan batch 1", amount: 7820, currency: "USD", accountId: "ac004", accountName: "Bank – Mercury USD", companyId: "neom", category: "Product Sales", gateway: "stripe", reference: "DROP-JAN-B1", reconciledStatus: "reconciled", enteredBy: "Rahul Verma" },
  { id: "tx038", date: "2026-01-22", type: "expense", description: "COGS – supplier payment Jan", amount: 5100, currency: "USD", accountId: "ac039", accountName: "Dropshipping COGS", companyId: "neom", category: "COGS", gateway: "stripe", reference: "COGS-JAN22", reconciledStatus: "reconciled", enteredBy: "Rahul Verma" },
  { id: "tx039", date: "2026-01-20", type: "income", description: "Faire order – WholesaleDirect Inc.", amount: 3400, currency: "USD", accountId: "ac005", accountName: "Bank – Mercury USD", companyId: "cloudnest", category: "Wholesale Revenue – Faire", gateway: "stripe", reference: "FAIRE-ORD-JAN20", reconciledStatus: "reconciled", enteredBy: "Aditya Kapoor" },
  { id: "tx040", date: "2026-01-18", type: "transfer", description: "Forex conversion: USD to INR via Wise", amount: 415000, currency: "INR", accountId: "ac002", accountName: "Bank – HDFC INR", companyId: "startupsquad", category: "Forex Transfer", gateway: "bank", reference: "WISE-CONV-JAN18", reconciledStatus: "reconciled", enteredBy: "Rahul Verma" },
  { id: "tx041", date: "2026-01-15", type: "expense", description: "Travel – Delhi client meeting", amount: 8500, currency: "INR", accountId: "ac038", accountName: "Travel & Conveyance", companyId: "startupsquad", category: "Travel", gateway: "cash", reference: "TRVL-JAN15", reconciledStatus: "pending", enteredBy: "Priya Sharma" },
  { id: "tx042", date: "2026-01-12", type: "expense", description: "Google Ads – Jan (SSPL)", amount: 32000, currency: "INR", accountId: "ac030", accountName: "Marketing & Advertising", companyId: "startupsquad", category: "Marketing", gateway: "bank", reference: "GADS-JAN26-SS", reconciledStatus: "reconciled", enteredBy: "Sneha Reddy" },
  { id: "tx043", date: "2026-01-10", type: "income", description: "Client payment – RetailX Pvt Ltd", amount: 112000, currency: "INR", accountId: "ac003", accountName: "Bank – HDFC INR", companyId: "lumbee", category: "Service Revenue", gateway: "razorpay", reference: "INV-2026-L-011", reconciledStatus: "reconciled", enteredBy: "Aditya Kapoor" },
  { id: "tx044", date: "2026-01-08", type: "expense", description: "AWS hosting – Jan (SSPL)", amount: 12500, currency: "INR", accountId: "ac032", accountName: "Software Subscriptions", companyId: "startupsquad", category: "Software", gateway: "bank", reference: "AWS-JAN26", reconciledStatus: "reconciled", enteredBy: "Sneha Reddy" },
  { id: "tx045", date: "2026-01-05", type: "cash-in", description: "Cash sale – walk-in client", amount: 15000, currency: "INR", accountId: "ac001", accountName: "Cash in Hand", companyId: "lumbee", category: "Cash Sale", gateway: "cash", reference: "CASH-SALE-005", reconciledStatus: "pending", enteredBy: "Aditya Kapoor" },
  { id: "tx046", date: "2025-12-31", type: "income", description: "Stripe payout – Dec 2025 (Neom)", amount: 4680, currency: "USD", accountId: "ac004", accountName: "Bank – Mercury USD", companyId: "neom", category: "Product Sales", gateway: "stripe", reference: "STR-PAY-20251231", reconciledStatus: "reconciled", enteredBy: "Rahul Verma" },
  { id: "tx047", date: "2025-12-31", type: "income", description: "Razorpay payout – Dec (SSPL)", amount: 198000, currency: "INR", accountId: "ac002", accountName: "Bank – HDFC INR", companyId: "startupsquad", category: "Service Revenue", gateway: "razorpay", reference: "RZP-PAY-20251231", reconciledStatus: "reconciled", enteredBy: "Sneha Reddy" },
  { id: "tx048", date: "2025-12-28", type: "expense", description: "Year-end professional fee – CA audit", amount: 45000, currency: "INR", accountId: "ac034", accountName: "Professional Fees", companyId: "startupsquad", category: "Professional Fees", gateway: "bank", reference: "AUDIT-DEC25", reconciledStatus: "reconciled", enteredBy: "Sneha Reddy" },
  { id: "tx049", date: "2025-12-20", type: "expense", description: "Wyoming annual report fee (Neom)", amount: 62, currency: "USD", accountId: "ac034", accountName: "Professional Fees", companyId: "neom", category: "Compliance", gateway: "stripe", reference: "WY-AR-2025-NEOM", reconciledStatus: "reconciled", enteredBy: "Rahul Verma" },
  { id: "tx050", date: "2025-12-20", type: "expense", description: "Wyoming annual report fee (Cloudnest)", amount: 62, currency: "USD", accountId: "ac034", accountName: "Professional Fees", companyId: "cloudnest", category: "Compliance", gateway: "stripe", reference: "WY-AR-2025-CLOUD", reconciledStatus: "reconciled", enteredBy: "Aditya Kapoor" },
  { id: "tx051", date: "2025-12-15", type: "expense", description: "TDS deposit – Q3 FY26 (SSPL)", amount: 22500, currency: "INR", accountId: "ac014", accountName: "TDS Payable", companyId: "startupsquad", category: "Tax Payment", gateway: "bank", reference: "TDS-Q3-FY26-SSPL", reconciledStatus: "reconciled", enteredBy: "Sneha Reddy" },
  { id: "tx052", date: "2025-12-15", type: "expense", description: "GST payment – Nov 2025 (SSPL)", amount: 34000, currency: "INR", accountId: "ac012", accountName: "GST Payable", companyId: "startupsquad", category: "Tax Payment", gateway: "bank", reference: "GST-NOV25-SSPL", reconciledStatus: "reconciled", enteredBy: "Sneha Reddy" },
  { id: "tx053", date: "2025-12-10", type: "income", description: "Faire wholesale – Dec batch", amount: 4200, currency: "USD", accountId: "ac005", accountName: "Bank – Mercury USD", companyId: "cloudnest", category: "Wholesale Revenue – Faire", gateway: "stripe", reference: "FAIRE-DEC-B1", reconciledStatus: "reconciled", enteredBy: "Aditya Kapoor" },
  { id: "tx054", date: "2025-12-05", type: "expense", description: "Electricity – Nov (SSPL 60%)", amount: 3600, currency: "INR", accountId: "ac035", accountName: "Internet & Utilities", companyId: "startupsquad", category: "Utilities", gateway: "bank", reference: "ELEC-NOV25-SSPL", reconciledStatus: "reconciled", enteredBy: "Sneha Reddy" },
  { id: "tx055", date: "2025-12-05", type: "expense", description: "Electricity – Nov (LIPL 40%)", amount: 2400, currency: "INR", accountId: "ac035", accountName: "Internet & Utilities", companyId: "lumbee", category: "Utilities", gateway: "bank", reference: "ELEC-NOV25-LIPL", reconciledStatus: "reconciled", enteredBy: "Aditya Kapoor" },
  { id: "tx056", date: "2025-11-30", type: "income", description: "Razorpay payout – Nov (LIPL)", amount: 108000, currency: "INR", accountId: "ac003", accountName: "Bank – HDFC INR", companyId: "lumbee", category: "Service Revenue", gateway: "razorpay", reference: "RZP-PAY-20251130-L", reconciledStatus: "reconciled", enteredBy: "Aditya Kapoor" },
  { id: "tx057", date: "2025-11-20", type: "cash-out", description: "Petty cash – courier charges", amount: 1500, currency: "INR", accountId: "ac001", accountName: "Cash in Hand", companyId: "lumbee", category: "Petty Expense", gateway: "cash", reference: "PETTY-NOV20", reconciledStatus: "pending", enteredBy: "Aditya Kapoor" },
  { id: "tx058", date: "2025-11-15", type: "expense", description: "Depreciation – office equipment Q3", amount: 8500, currency: "INR", accountId: "ac037", accountName: "Depreciation", companyId: "startupsquad", category: "Depreciation", gateway: null, reference: "DEPR-Q3-SSPL", reconciledStatus: "reconciled", enteredBy: "Sneha Reddy" },
  { id: "tx059", date: "2025-11-10", type: "income", description: "Commission – referral from LegalNations", amount: 22000, currency: "INR", accountId: "ac002", accountName: "Bank – HDFC INR", companyId: "startupsquad", category: "Commission Income", gateway: "bank", reference: "COMM-LN-NOV10", reconciledStatus: "reconciled", enteredBy: "Priya Sharma" },
  { id: "tx060", date: "2025-11-05", type: "expense", description: "Forex loss – USD conversion (Cloudnest)", amount: 340, currency: "USD", accountId: "ac036", accountName: "Forex Loss", companyId: "cloudnest", category: "Forex Loss", gateway: "bank", reference: "FOREX-LOSS-NOV05", reconciledStatus: "reconciled", enteredBy: "Aditya Kapoor" },
];

export const journalEntries: JournalEntry[] = [
  {
    id: "je001", date: "2026-02-28", narration: "Shared office rent allocation – Feb 2026", companyId: "all", createdBy: "Sneha Reddy", status: "posted", tags: ["SE"],
    lines: [
      { accountId: "ac028", accountName: "Office Rent", debit: 30000, credit: 0, description: "Total rent charge" },
      { accountId: "ac016", accountName: "Intercompany Payable", debit: 0, credit: 18000, description: "LIPL share 60%" },
      { accountId: "ac016", accountName: "Intercompany Payable", debit: 0, credit: 12000, description: "SSPL share 40%" },
    ]
  },
  {
    id: "je002", date: "2026-02-20", narration: "Inter-company settlement: Neom → SSPL (TechSolutions USD payment)", companyId: "neom", createdBy: "Rahul Verma", status: "posted", tags: ["IC"],
    lines: [
      { accountId: "ac016", accountName: "Intercompany Payable", debit: 705600, credit: 0, description: "Neom owes SSPL – 8500 USD @ 83.01" },
      { accountId: "ac006", accountName: "Bank – Wise USD", debit: 0, credit: 705600, description: "Wire transfer out to SSPL HDFC" },
    ]
  },
  {
    id: "je003", date: "2026-02-25", narration: "Salary expense allocation – Feb 2026 (SSPL + LIPL)", companyId: "all", createdBy: "Sneha Reddy", status: "posted", tags: ["SE"],
    lines: [
      { accountId: "ac029", accountName: "Salaries & Wages", debit: 195000, credit: 0, description: "SSPL payroll Feb 2026" },
      { accountId: "ac029", accountName: "Salaries & Wages", debit: 100000, credit: 0, description: "LIPL payroll Feb 2026" },
      { accountId: "ac014", accountName: "TDS Payable", debit: 0, credit: 20000, description: "TDS deducted on salary" },
      { accountId: "ac002", accountName: "Bank – HDFC INR", debit: 0, credit: 275000, description: "Net salary paid" },
    ]
  },
  {
    id: "je004", date: "2026-02-15", narration: "GST liability recognition – Feb 2026 (SSPL)", companyId: "startupsquad", createdBy: "Sneha Reddy", status: "posted", tags: [],
    lines: [
      { accountId: "ac023", accountName: "Service Revenue", debit: 0, credit: 182000, description: "Revenue recognized" },
      { accountId: "ac012", accountName: "GST Payable", debit: 0, credit: 32760, description: "GST @18% on revenue" },
      { accountId: "ac007", accountName: "Accounts Receivable", debit: 214760, credit: 0, description: "Total receivable incl GST" },
    ]
  },
  {
    id: "je005", date: "2026-02-10", narration: "Forex revaluation – USD assets (Feb closing)", companyId: "neom", createdBy: "Rahul Verma", status: "posted", tags: [],
    lines: [
      { accountId: "ac004", accountName: "Bank – Mercury USD", debit: 8300, credit: 0, description: "Revaluation gain on USD balance" },
      { accountId: "ac027", accountName: "Forex Gain", debit: 0, credit: 8300, description: "Forex gain – INR strengthened" },
    ]
  },
  {
    id: "je006", date: "2026-01-31", narration: "Shared expense allocation – Internet Jan 2026", companyId: "all", createdBy: "Aditya Kapoor", status: "posted", tags: ["SE"],
    lines: [
      { accountId: "ac035", accountName: "Internet & Utilities", debit: 4000, credit: 0, description: "Total internet bill Jan 2026" },
      { accountId: "ac016", accountName: "Intercompany Payable", debit: 0, credit: 2000, description: "SSPL share 50%" },
      { accountId: "ac016", accountName: "Intercompany Payable", debit: 0, credit: 2000, description: "LIPL share 50%" },
    ]
  },
  {
    id: "je007", date: "2026-01-20", narration: "Inter-company settlement: Cloudnest → LIPL (Faire revenue)", companyId: "cloudnest", createdBy: "Aditya Kapoor", status: "posted", tags: ["IC"],
    lines: [
      { accountId: "ac016", accountName: "Intercompany Payable", debit: 282200, credit: 0, description: "Cloudnest owes LIPL – 3400 USD @ 83.0" },
      { accountId: "ac005", accountName: "Bank – Mercury USD", debit: 0, credit: 282200, description: "Wire transfer to LIPL HDFC" },
    ]
  },
  {
    id: "je008", date: "2026-01-15", narration: "TDS deduction on professional fees – Q3 FY26", companyId: "startupsquad", createdBy: "Sneha Reddy", status: "posted", tags: [],
    lines: [
      { accountId: "ac034", accountName: "Professional Fees", debit: 15000, credit: 0, description: "CA fee gross" },
      { accountId: "ac014", accountName: "TDS Payable", debit: 0, credit: 1500, description: "TDS @10%" },
      { accountId: "ac011", accountName: "Accounts Payable", debit: 0, credit: 13500, description: "Net payable to CA" },
    ]
  },
  {
    id: "je009", date: "2025-12-31", narration: "Year-end depreciation entry – Dec 2025", companyId: "all", createdBy: "Sneha Reddy", status: "posted", tags: [],
    lines: [
      { accountId: "ac037", accountName: "Depreciation", debit: 25000, credit: 0, description: "Depreciation on fixed assets Q4" },
      { accountId: "ac008", accountName: "Security Deposit", debit: 0, credit: 25000, description: "Accumulated depreciation" },
    ]
  },
  {
    id: "je010", date: "2025-12-31", narration: "GST payment – Nov 2025 (SSPL GSTR-3B)", companyId: "startupsquad", createdBy: "Sneha Reddy", status: "posted", tags: [],
    lines: [
      { accountId: "ac012", accountName: "GST Payable", debit: 34000, credit: 0, description: "GSTR-3B liability discharge" },
      { accountId: "ac002", accountName: "Bank – HDFC INR", debit: 0, credit: 34000, description: "GST paid via bank" },
    ]
  },
  {
    id: "je011", date: "2025-12-15", narration: "Shared expense – electricity allocation Nov 2025", companyId: "all", createdBy: "Aditya Kapoor", status: "posted", tags: ["SE"],
    lines: [
      { accountId: "ac035", accountName: "Internet & Utilities", debit: 6000, credit: 0, description: "Total electricity Nov 2025" },
      { accountId: "ac016", accountName: "Intercompany Payable", debit: 0, credit: 3600, description: "SSPL share 60%" },
      { accountId: "ac016", accountName: "Intercompany Payable", debit: 0, credit: 2400, description: "LIPL share 40%" },
    ]
  },
  {
    id: "je012", date: "2025-12-10", narration: "Owner's draw – Rahul Verma (Neom Q4)", companyId: "neom", createdBy: "Rahul Verma", status: "posted", tags: [],
    lines: [
      { accountId: "ac022", accountName: "Owner's Draw", debit: 5000, credit: 0, description: "Q4 distribution to member" },
      { accountId: "ac004", accountName: "Bank – Mercury USD", debit: 0, credit: 5000, description: "Transfer to personal account" },
    ]
  },
  {
    id: "je013", date: "2026-02-20", narration: "Accounting fee allocation – 4 entities Feb 2026", companyId: "all", createdBy: "Priya Sharma", status: "draft", tags: ["SE"],
    lines: [
      { accountId: "ac034", accountName: "Professional Fees", debit: 60000, credit: 0, description: "Total CA fee 4 entities" },
      { accountId: "ac016", accountName: "Intercompany Payable", debit: 0, credit: 15000, description: "NEOM share 25%" },
      { accountId: "ac016", accountName: "Intercompany Payable", debit: 0, credit: 15000, description: "CLOUD share 25%" },
      { accountId: "ac016", accountName: "Intercompany Payable", debit: 0, credit: 15000, description: "SSPL share 25%" },
      { accountId: "ac016", accountName: "Intercompany Payable", debit: 0, credit: 15000, description: "LIPL share 25%" },
    ]
  },
  {
    id: "je014", date: "2026-02-28", narration: "Advance tax payment – Q4 FY26 (SSPL)", companyId: "startupsquad", createdBy: "Sneha Reddy", status: "draft", tags: [],
    lines: [
      { accountId: "ac009", accountName: "Prepaid Expenses", debit: 45000, credit: 0, description: "Advance tax paid Q4" },
      { accountId: "ac002", accountName: "Bank – HDFC INR", debit: 0, credit: 45000, description: "Payment via challan" },
    ]
  },
  {
    id: "je015", date: "2026-01-10", narration: "Inter-company loan repayment: SSPL → Director", companyId: "startupsquad", createdBy: "Sneha Reddy", status: "posted", tags: ["IC"],
    lines: [
      { accountId: "ac015", accountName: "Director Loan", debit: 50000, credit: 0, description: "Partial repayment of director loan" },
      { accountId: "ac002", accountName: "Bank – HDFC INR", debit: 0, credit: 50000, description: "Transfer to director account" },
    ]
  },
  {
    id: "je016", date: "2025-11-30", narration: "Common staff salary allocation – Nov 2025 (50/50)", companyId: "all", createdBy: "Aditya Kapoor", status: "posted", tags: ["SE"],
    lines: [
      { accountId: "ac029", accountName: "Salaries & Wages", debit: 60000, credit: 0, description: "Common staff gross salary Nov" },
      { accountId: "ac016", accountName: "Intercompany Payable", debit: 0, credit: 30000, description: "SSPL share 50%" },
      { accountId: "ac016", accountName: "Intercompany Payable", debit: 0, credit: 30000, description: "LIPL share 50%" },
    ]
  },
  {
    id: "je017", date: "2025-12-20", narration: "Wyoming annual report fees (Neom + Cloudnest)", companyId: "all", createdBy: "Rahul Verma", status: "posted", tags: [],
    lines: [
      { accountId: "ac034", accountName: "Professional Fees", debit: 5146, credit: 0, description: "WY fees 62 USD × 2 @ 41.50 INR/USD × 2" },
      { accountId: "ac004", accountName: "Bank – Mercury USD", debit: 0, credit: 2573, description: "Neom USD payment" },
      { accountId: "ac005", accountName: "Bank – Mercury USD", debit: 0, credit: 2573, description: "Cloudnest USD payment" },
    ]
  },
  {
    id: "je018", date: "2026-02-01", narration: "Prepaid subscription amortization – Feb 2026", companyId: "startupsquad", createdBy: "Sneha Reddy", status: "posted", tags: [],
    lines: [
      { accountId: "ac032", accountName: "Software Subscriptions", debit: 8000, credit: 0, description: "Monthly amortization of prepaid SaaS" },
      { accountId: "ac009", accountName: "Prepaid Expenses", debit: 0, credit: 8000, description: "Utilization of prepaid balance" },
    ]
  },
  {
    id: "je019", date: "2026-02-14", narration: "Faire revenue recognition (Cloudnest → LIPL service recharge)", companyId: "cloudnest", createdBy: "Aditya Kapoor", status: "posted", tags: ["IC"],
    lines: [
      { accountId: "ac025", accountName: "Wholesale Revenue – Faire", debit: 0, credit: 2800, description: "Revenue from HomeGoods Co. USD" },
      { accountId: "ac007", accountName: "Accounts Receivable", debit: 2800, credit: 0, description: "Receivable from Cloudnest" },
    ]
  },
  {
    id: "je020", date: "2026-02-28", narration: "Month-end accrual – outstanding vendor payables Feb", companyId: "all", createdBy: "Priya Sharma", status: "draft", tags: [],
    lines: [
      { accountId: "ac030", accountName: "Marketing & Advertising", debit: 18000, credit: 0, description: "Accrued marketing expense Feb" },
      { accountId: "ac011", accountName: "Accounts Payable", debit: 0, credit: 18000, description: "Payable to digital agency" },
    ]
  },
];

export const interCompanyBalances: InterCompanyBalance[] = [
  { id: "ic001", fromCompany: "neom", toCompany: "startupsquad", amount: 8500, currency: "USD", inrEquivalent: 705500, type: "due-to", description: "TechSolutions US client paid Neom; work delivered by SSPL India team", createdDate: "2026-02-10", status: "partial", lastSettledDate: "2026-02-20" },
  { id: "ic002", fromCompany: "cloudnest", toCompany: "lumbee", amount: 6200, currency: "USD", inrEquivalent: 514600, type: "due-to", description: "Faire wholesale revenue received by Cloudnest; fulfillment ops by LIPL", createdDate: "2026-01-15", status: "open" },
  { id: "ic003", fromCompany: "lumbee", toCompany: "startupsquad", amount: 36000, currency: "INR", inrEquivalent: 36000, type: "due-to", description: "Shared rent recharge: SSPL paid full rent, LIPL owes 60% share for Dec–Jan", createdDate: "2026-01-01", status: "partial", lastSettledDate: "2026-01-30" },
  { id: "ic004", fromCompany: "startupsquad", toCompany: "lumbee", amount: 30000, currency: "INR", inrEquivalent: 30000, type: "due-to", description: "Common staff salary paid by SSPL; LIPL owes 50% share for Nov–Dec", createdDate: "2025-11-01", status: "open" },
  { id: "ic005", fromCompany: "neom", toCompany: "startupsquad", amount: 12000, currency: "USD", inrEquivalent: 996000, type: "due-to", description: "Enterprise client GlobalMax Inc paid Neom; SSPL delivered service", createdDate: "2026-01-20", status: "open" },
  { id: "ic006", fromCompany: "cloudnest", toCompany: "startupsquad", amount: 15000, currency: "INR", inrEquivalent: 15000, type: "due-to", description: "Accounting fee share: SSPL covered Cloudnest's 25% portion", createdDate: "2026-02-12", status: "open" },
  { id: "ic007", fromCompany: "startupsquad", toCompany: "neom", amount: 5000, currency: "USD", inrEquivalent: 415000, type: "due-to", description: "SSPL invested via Neom for Amazon Seller Account setup costs", createdDate: "2025-10-15", status: "settled", lastSettledDate: "2025-12-01" },
  { id: "ic008", fromCompany: "lumbee", toCompany: "cloudnest", amount: 2800, currency: "USD", inrEquivalent: 232400, type: "due-to", description: "LIPL co-funded Faire inventory for Cloudnest Q4 wholesale batch", createdDate: "2025-11-01", status: "open" },
  { id: "ic009", fromCompany: "neom", toCompany: "lumbee", amount: 3400, currency: "USD", inrEquivalent: 282200, type: "due-to", description: "Neom received payment for LIPL consulting client in US", createdDate: "2026-02-01", status: "open" },
  { id: "ic010", fromCompany: "startupsquad", toCompany: "lumbee", amount: 18000, currency: "INR", inrEquivalent: 18000, type: "due-to", description: "SSPL paid electricity bills in full; LIPL owes 40% for Jan–Feb", createdDate: "2026-01-05", status: "partial", lastSettledDate: "2026-01-30" },
  { id: "ic011", fromCompany: "cloudnest", toCompany: "neom", amount: 8500, currency: "USD", inrEquivalent: 705500, type: "due-to", description: "Cloudnest borrowing from Neom for Faire inventory bulk purchase", createdDate: "2025-12-20", status: "open" },
  { id: "ic012", fromCompany: "lumbee", toCompany: "startupsquad", amount: 15000, currency: "INR", inrEquivalent: 15000, type: "due-to", description: "Accounting fee share: SSPL covered LIPL's 25% portion for Q3", createdDate: "2025-10-01", status: "settled", lastSettledDate: "2025-11-15" },
];

export const gatewayTransactions: GatewayTransaction[] = [
  { id: "gw001", gateway: "stripe", transactionId: "ch_3OmKxLHG1234567890", date: "2026-02-28", type: "payout", amount: 4820, currency: "USD", companyId: "neom", customerName: "Stripe Payout", orderId: "po_3OmKxL", status: "paid", reconciledToLedger: true, reconciledDate: "2026-02-28" },
  { id: "gw002", gateway: "stripe", transactionId: "ch_3OmKxLHG0987654321", date: "2026-02-28", type: "payout", amount: 3150, currency: "USD", companyId: "cloudnest", customerName: "Stripe Payout", orderId: "po_3OmKxM", status: "paid", reconciledToLedger: true, reconciledDate: "2026-02-28" },
  { id: "gw003", gateway: "razorpay", transactionId: "pay_NmKxLABC12345", date: "2026-02-28", type: "payout", amount: 182000, currency: "INR", companyId: "startupsquad", customerName: "Razorpay Payout", orderId: "pout_SSPL_FEB", status: "paid", reconciledToLedger: true, reconciledDate: "2026-02-28" },
  { id: "gw004", gateway: "razorpay", transactionId: "pay_NmKxLDEF67890", date: "2026-02-28", type: "payout", amount: 124500, currency: "INR", companyId: "lumbee", customerName: "Razorpay Payout", orderId: "pout_LIPL_FEB", status: "paid", reconciledToLedger: true, reconciledDate: "2026-02-28" },
  { id: "gw005", gateway: "stripe", transactionId: "ch_3OmKxLHG1122334455", date: "2026-02-22", type: "payment", amount: 8500, currency: "USD", companyId: "neom", customerName: "TechSolutions Inc.", orderId: "INV-2026-042", status: "captured", reconciledToLedger: true, reconciledDate: "2026-02-23" },
  { id: "gw006", gateway: "razorpay", transactionId: "pay_NmAcmeRetail001", date: "2026-02-22", type: "payment", amount: 95000, currency: "INR", companyId: "startupsquad", customerName: "Acme Retail India", orderId: "INV-2026-SS-038", status: "captured", reconciledToLedger: true, reconciledDate: "2026-02-22" },
  { id: "gw007", gateway: "stripe", transactionId: "ch_3OmKxLHG5566778899", date: "2026-02-15", type: "payment", amount: 6300, currency: "USD", companyId: "neom", customerName: "Drop Batch Sale US", orderId: "DROP-BATCH-FEB2", status: "captured", reconciledToLedger: true, reconciledDate: "2026-02-16" },
  { id: "gw008", gateway: "stripe", transactionId: "ch_3OmFaire001", date: "2026-02-14", type: "payment", amount: 2800, currency: "USD", companyId: "cloudnest", customerName: "HomeGoods Co.", orderId: "FAIRE-ORD-FEB14", status: "captured", reconciledToLedger: false },
  { id: "gw009", gateway: "razorpay", transactionId: "pay_GlobalMart010", date: "2026-02-10", type: "payment", amount: 68000, currency: "INR", companyId: "lumbee", customerName: "GlobalMart Ltd", orderId: "INV-2026-L-019", status: "captured", reconciledToLedger: true, reconciledDate: "2026-02-11" },
  { id: "gw010", gateway: "stripe", transactionId: "fee_NmKxLSHOPIFY", date: "2026-02-24", type: "fee", amount: 79, currency: "USD", companyId: "neom", customerName: "Shopify", orderId: "SHOPIFY-FEB26", status: "paid", reconciledToLedger: true, reconciledDate: "2026-02-24" },
  { id: "gw011", gateway: "stripe", transactionId: "fee_NmKxLFAIRE", date: "2026-02-24", type: "fee", amount: 220, currency: "USD", companyId: "cloudnest", customerName: "Faire Platform", orderId: "FAIRE-FEE-FEB26", status: "paid", reconciledToLedger: false },
  { id: "gw012", gateway: "razorpay", transactionId: "pay_RetailX011", date: "2026-01-10", type: "payment", amount: 112000, currency: "INR", companyId: "lumbee", customerName: "RetailX Pvt Ltd", orderId: "INV-2026-L-011", status: "captured", reconciledToLedger: true, reconciledDate: "2026-01-11" },
  { id: "gw013", gateway: "stripe", transactionId: "ch_3OmJanDrop001", date: "2026-01-22", type: "payment", amount: 7820, currency: "USD", companyId: "neom", customerName: "Drop Batch Jan 1", orderId: "DROP-JAN-B1", status: "captured", reconciledToLedger: true, reconciledDate: "2026-01-23" },
  { id: "gw014", gateway: "stripe", transactionId: "ch_3OmFaireJan001", date: "2026-01-20", type: "payment", amount: 3400, currency: "USD", companyId: "cloudnest", customerName: "WholesaleDirect Inc.", orderId: "FAIRE-ORD-JAN20", status: "captured", reconciledToLedger: true, reconciledDate: "2026-01-21" },
  { id: "gw015", gateway: "razorpay", transactionId: "pay_InnovateTech031", date: "2026-01-25", type: "payment", amount: 75000, currency: "INR", companyId: "startupsquad", customerName: "InnovateTech Solutions", orderId: "INV-2026-SS-031", status: "captured", reconciledToLedger: true, reconciledDate: "2026-01-26" },
  { id: "gw016", gateway: "stripe", transactionId: "ref_3OmRefund001", date: "2026-01-18", type: "refund", amount: 250, currency: "USD", companyId: "neom", customerName: "Refund – Order #1092", orderId: "REF-ORD-1092", status: "paid", reconciledToLedger: false },
  { id: "gw017", gateway: "razorpay", transactionId: "pay_Dec2025SS001", date: "2025-12-31", type: "payout", amount: 198000, currency: "INR", companyId: "startupsquad", customerName: "Razorpay Payout Dec", orderId: "pout_SSPL_DEC", status: "paid", reconciledToLedger: true, reconciledDate: "2025-12-31" },
  { id: "gw018", gateway: "stripe", transactionId: "ch_3OmDecNeom001", date: "2025-12-31", type: "payout", amount: 4680, currency: "USD", companyId: "neom", customerName: "Stripe Payout Dec", orderId: "po_DecNeom", status: "paid", reconciledToLedger: true, reconciledDate: "2025-12-31" },
  { id: "gw019", gateway: "stripe", transactionId: "ch_3OmFaireDec001", date: "2025-12-10", type: "payment", amount: 4200, currency: "USD", companyId: "cloudnest", customerName: "Faire Wholesale Dec Batch", orderId: "FAIRE-DEC-B1", status: "captured", reconciledToLedger: true, reconciledDate: "2025-12-11" },
  { id: "gw020", gateway: "razorpay", transactionId: "pay_LIPL_NOV30", date: "2025-11-30", type: "payout", amount: 108000, currency: "INR", companyId: "lumbee", customerName: "Razorpay Payout Nov", orderId: "pout_LIPL_NOV", status: "paid", reconciledToLedger: true, reconciledDate: "2025-11-30" },
  { id: "gw021", gateway: "razorpay", transactionId: "pay_LN_COMM001", date: "2026-02-01", type: "payment", amount: 18500, currency: "INR", companyId: "startupsquad", customerName: "LegalNations referral commission", orderId: "COMM-FEB01", status: "captured", reconciledToLedger: false },
  { id: "gw022", gateway: "stripe", transactionId: "ch_3OmAdsNeom001", date: "2026-02-18", type: "fee", amount: 1200, currency: "USD", companyId: "neom", customerName: "Facebook Ads", orderId: "FBADS-FEB26-NEOM", status: "paid", reconciledToLedger: true, reconciledDate: "2026-02-19" },
  { id: "gw023", gateway: "razorpay", transactionId: "pay_CommNov001", date: "2025-11-10", type: "payment", amount: 22000, currency: "INR", companyId: "startupsquad", customerName: "LegalNations – referral Nov", orderId: "COMM-LN-NOV10", status: "captured", reconciledToLedger: true, reconciledDate: "2025-11-11" },
  { id: "gw024", gateway: "stripe", transactionId: "ch_3OmDrop002", date: "2026-02-28", type: "payment", amount: 1850, currency: "USD", companyId: "neom", customerName: "ShopX Order #2201", orderId: "DROP-FEB-2201", status: "pending", reconciledToLedger: false },
  { id: "gw025", gateway: "razorpay", transactionId: "pay_SSPL_Jan31", date: "2026-01-31", type: "payout", amount: 165000, currency: "INR", companyId: "startupsquad", customerName: "Razorpay Payout Jan", orderId: "pout_SSPL_JAN", status: "paid", reconciledToLedger: true, reconciledDate: "2026-01-31" },
];

export const sharedExpenseRules: SharedExpenseRule[] = [
  {
    id: "se001", name: "Office Rent – Gurugram", description: "Monthly rent for Plot 42, Sector 18, Gurugram office space", totalAmount: 30000, currency: "INR", frequency: "monthly",
    allocations: [
      { companyId: "lumbee", percentage: 60, amount: 18000 },
      { companyId: "startupsquad", percentage: 40, amount: 12000 },
    ],
    effectiveFrom: "2022-11-01", category: "Office Rent", approvedBy: "Rahul Verma"
  },
  {
    id: "se002", name: "Internet & Broadband", description: "Monthly internet/broadband charges at office", totalAmount: 4000, currency: "INR", frequency: "monthly",
    allocations: [
      { companyId: "startupsquad", percentage: 50, amount: 2000 },
      { companyId: "lumbee", percentage: 50, amount: 2000 },
    ],
    effectiveFrom: "2022-11-01", category: "Utilities", approvedBy: "Aditya Kapoor"
  },
  {
    id: "se003", name: "Electricity – Office", description: "Monthly electricity charges at Gurugram office", totalAmount: 6000, currency: "INR", frequency: "monthly",
    allocations: [
      { companyId: "startupsquad", percentage: 60, amount: 3600 },
      { companyId: "lumbee", percentage: 40, amount: 2400 },
    ],
    effectiveFrom: "2022-11-01", category: "Utilities", approvedBy: "Aditya Kapoor"
  },
  {
    id: "se004", name: "Common Staff Salary", description: "Office manager + receptionist salary shared equally", totalAmount: 60000, currency: "INR", frequency: "monthly",
    allocations: [
      { companyId: "startupsquad", percentage: 50, amount: 30000 },
      { companyId: "lumbee", percentage: 50, amount: 30000 },
    ],
    effectiveFrom: "2023-04-01", category: "Salaries", approvedBy: "Rahul Verma"
  },
  {
    id: "se005", name: "Accounting & CA Fees", description: "Monthly CA retainer and accounting fee – split across all 4 entities", totalAmount: 60000, currency: "INR", frequency: "monthly",
    allocations: [
      { companyId: "neom", percentage: 25, amount: 15000 },
      { companyId: "cloudnest", percentage: 25, amount: 15000 },
      { companyId: "startupsquad", percentage: 25, amount: 15000 },
      { companyId: "lumbee", percentage: 25, amount: 15000 },
    ],
    effectiveFrom: "2023-01-01", category: "Professional Fees", approvedBy: "Rahul Verma"
  },
];

export const sharedExpenseHistory: SharedExpenseMonthEntry[] = [
  { id: "sh001", month: "2026-02", ruleId: "se001", ruleName: "Office Rent – Gurugram", totalAmount: 30000, currency: "INR", allocations: [{ companyId: "lumbee", percentage: 60, amount: 18000 }, { companyId: "startupsquad", percentage: 40, amount: 12000 }], journalEntryRef: "JE-001", status: "allocated" },
  { id: "sh002", month: "2026-02", ruleId: "se002", ruleName: "Internet & Broadband", totalAmount: 4000, currency: "INR", allocations: [{ companyId: "startupsquad", percentage: 50, amount: 2000 }, { companyId: "lumbee", percentage: 50, amount: 2000 }], journalEntryRef: "JE-006", status: "allocated" },
  { id: "sh003", month: "2026-02", ruleId: "se003", ruleName: "Electricity – Office", totalAmount: 6000, currency: "INR", allocations: [{ companyId: "startupsquad", percentage: 60, amount: 3600 }, { companyId: "lumbee", percentage: 40, amount: 2400 }], journalEntryRef: "JE-011", status: "allocated" },
  { id: "sh004", month: "2026-02", ruleId: "se004", ruleName: "Common Staff Salary", totalAmount: 60000, currency: "INR", allocations: [{ companyId: "startupsquad", percentage: 50, amount: 30000 }, { companyId: "lumbee", percentage: 50, amount: 30000 }], journalEntryRef: "JE-016", status: "allocated" },
  { id: "sh005", month: "2026-02", ruleId: "se005", ruleName: "Accounting & CA Fees", totalAmount: 60000, currency: "INR", allocations: [{ companyId: "neom", percentage: 25, amount: 15000 }, { companyId: "cloudnest", percentage: 25, amount: 15000 }, { companyId: "startupsquad", percentage: 25, amount: 15000 }, { companyId: "lumbee", percentage: 25, amount: 15000 }], journalEntryRef: "JE-013", status: "pending" },
  { id: "sh006", month: "2026-01", ruleId: "se001", ruleName: "Office Rent – Gurugram", totalAmount: 30000, currency: "INR", allocations: [{ companyId: "lumbee", percentage: 60, amount: 18000 }, { companyId: "startupsquad", percentage: 40, amount: 12000 }], journalEntryRef: "JE-021", status: "allocated" },
  { id: "sh007", month: "2026-01", ruleId: "se002", ruleName: "Internet & Broadband", totalAmount: 4000, currency: "INR", allocations: [{ companyId: "startupsquad", percentage: 50, amount: 2000 }, { companyId: "lumbee", percentage: 50, amount: 2000 }], journalEntryRef: "JE-022", status: "allocated" },
  { id: "sh008", month: "2026-01", ruleId: "se003", ruleName: "Electricity – Office", totalAmount: 6000, currency: "INR", allocations: [{ companyId: "startupsquad", percentage: 60, amount: 3600 }, { companyId: "lumbee", percentage: 40, amount: 2400 }], journalEntryRef: "JE-023", status: "allocated" },
  { id: "sh009", month: "2026-01", ruleId: "se004", ruleName: "Common Staff Salary", totalAmount: 60000, currency: "INR", allocations: [{ companyId: "startupsquad", percentage: 50, amount: 30000 }, { companyId: "lumbee", percentage: 50, amount: 30000 }], journalEntryRef: "JE-024", status: "allocated" },
  { id: "sh010", month: "2026-01", ruleId: "se005", ruleName: "Accounting & CA Fees", totalAmount: 60000, currency: "INR", allocations: [{ companyId: "neom", percentage: 25, amount: 15000 }, { companyId: "cloudnest", percentage: 25, amount: 15000 }, { companyId: "startupsquad", percentage: 25, amount: 15000 }, { companyId: "lumbee", percentage: 25, amount: 15000 }], journalEntryRef: "JE-025", status: "allocated" },
  { id: "sh011", month: "2025-12", ruleId: "se001", ruleName: "Office Rent – Gurugram", totalAmount: 30000, currency: "INR", allocations: [{ companyId: "lumbee", percentage: 60, amount: 18000 }, { companyId: "startupsquad", percentage: 40, amount: 12000 }], journalEntryRef: "JE-031", status: "allocated" },
  { id: "sh012", month: "2025-12", ruleId: "se002", ruleName: "Internet & Broadband", totalAmount: 4000, currency: "INR", allocations: [{ companyId: "startupsquad", percentage: 50, amount: 2000 }, { companyId: "lumbee", percentage: 50, amount: 2000 }], journalEntryRef: "JE-032", status: "allocated" },
  { id: "sh013", month: "2025-12", ruleId: "se003", ruleName: "Electricity – Office", totalAmount: 6000, currency: "INR", allocations: [{ companyId: "startupsquad", percentage: 60, amount: 3600 }, { companyId: "lumbee", percentage: 40, amount: 2400 }], journalEntryRef: "JE-033", status: "allocated" },
  { id: "sh014", month: "2025-12", ruleId: "se004", ruleName: "Common Staff Salary", totalAmount: 60000, currency: "INR", allocations: [{ companyId: "startupsquad", percentage: 50, amount: 30000 }, { companyId: "lumbee", percentage: 50, amount: 30000 }], journalEntryRef: "JE-034", status: "allocated" },
  { id: "sh015", month: "2025-12", ruleId: "se005", ruleName: "Accounting & CA Fees", totalAmount: 60000, currency: "INR", allocations: [{ companyId: "neom", percentage: 25, amount: 15000 }, { companyId: "cloudnest", percentage: 25, amount: 15000 }, { companyId: "startupsquad", percentage: 25, amount: 15000 }, { companyId: "lumbee", percentage: 25, amount: 15000 }], journalEntryRef: "JE-035", status: "allocated" },
];

export const cashBookEntries: CashBookEntry[] = [
  { id: "cb001", date: "2026-02-28", description: "Petty cash – refreshments for client meeting", type: "out", amount: 1800, currency: "INR", companyId: "startupsquad", category: "Petty Expense", reference: "PETTY-228-01", runningBalance: 23200, enteredBy: "Sneha Reddy" },
  { id: "cb002", date: "2026-02-27", description: "Cash payment from walk-in client", type: "in", amount: 15000, currency: "INR", companyId: "startupsquad", category: "Client Payment", reference: "CASH-227-SS", runningBalance: 25000, enteredBy: "Priya Sharma" },
  { id: "cb003", date: "2026-02-25", description: "Courier charges – document delivery", type: "out", amount: 650, currency: "INR", companyId: "lumbee", category: "Petty Expense", reference: "PETTY-225-L", runningBalance: 8200, enteredBy: "Aditya Kapoor" },
  { id: "cb004", date: "2026-02-22", description: "Cash advance to employee – field trip", type: "out", amount: 5000, currency: "INR", companyId: "startupsquad", category: "Cash Advance", reference: "ADV-222-SS", runningBalance: 10000, enteredBy: "Sneha Reddy" },
  { id: "cb005", date: "2026-02-20", description: "Cash sale – product demo subscription", type: "in", amount: 8000, currency: "INR", companyId: "lumbee", category: "Cash Sale", reference: "CSALE-220-L", runningBalance: 8850, enteredBy: "Aditya Kapoor" },
  { id: "cb006", date: "2026-02-18", description: "Stationery and printing", type: "out", amount: 2200, currency: "INR", companyId: "startupsquad", category: "Petty Expense", reference: "PETTY-218-SS", runningBalance: 15000, enteredBy: "Sneha Reddy" },
  { id: "cb007", date: "2026-02-15", description: "Cash settlement – vendor balance cleared", type: "out", amount: 12000, currency: "INR", companyId: "lumbee", category: "Cash Settlement", reference: "SETTLE-215-L", runningBalance: 850, enteredBy: "Aditya Kapoor" },
  { id: "cb008", date: "2026-02-14", description: "Received cash advance return from employee", type: "in", amount: 3500, currency: "INR", companyId: "startupsquad", category: "Advance Return", reference: "ADV-RET-214", runningBalance: 17200, enteredBy: "Sneha Reddy" },
  { id: "cb009", date: "2026-02-12", description: "Tea & snacks – office", type: "out", amount: 800, currency: "INR", companyId: "startupsquad", category: "Petty Expense", reference: "PETTY-212-SS", runningBalance: 13700, enteredBy: "Priya Sharma" },
  { id: "cb010", date: "2026-02-10", description: "Client cash payment – project milestone", type: "in", amount: 25000, currency: "INR", companyId: "startupsquad", category: "Client Payment", reference: "CASH-210-SS", runningBalance: 14500, enteredBy: "Sneha Reddy" },
  { id: "cb011", date: "2026-02-08", description: "Auto fare – director commute", type: "out", amount: 450, currency: "INR", companyId: "lumbee", category: "Petty Expense", reference: "PETTY-208-L", runningBalance: 12850, enteredBy: "Aditya Kapoor" },
  { id: "cb012", date: "2026-02-05", description: "Office supplies – pens, folders", type: "out", amount: 1200, currency: "INR", companyId: "startupsquad", category: "Petty Expense", reference: "PETTY-205-SS", runningBalance: 18500, enteredBy: "Sneha Reddy" },
  { id: "cb013", date: "2026-01-31", description: "Cash sale – consulting session", type: "in", amount: 10000, currency: "INR", companyId: "startupsquad", category: "Cash Sale", reference: "CSALE-131-SS", runningBalance: 19700, enteredBy: "Priya Sharma" },
  { id: "cb014", date: "2026-01-28", description: "Petty cash replenishment from bank", type: "in", amount: 20000, currency: "INR", companyId: "startupsquad", category: "Cash Advance", reference: "REPLEN-128", runningBalance: 9700, enteredBy: "Sneha Reddy" },
  { id: "cb015", date: "2026-01-25", description: "Vendor payment – stall material cash", type: "out", amount: 6500, currency: "INR", companyId: "lumbee", category: "Cash Settlement", reference: "SETTLE-125-L", runningBalance: 13300, enteredBy: "Aditya Kapoor" },
  { id: "cb016", date: "2026-01-20", description: "Cash received – advance from new client", type: "in", amount: 30000, currency: "INR", companyId: "lumbee", category: "Client Payment", reference: "ADV-120-L", runningBalance: 19800, enteredBy: "Aditya Kapoor" },
  { id: "cb017", date: "2026-01-15", description: "Travel expense – Delhi client visit", type: "out", amount: 8500, currency: "INR", companyId: "startupsquad", category: "Cash Advance", reference: "TRVL-115-SS", runningBalance: 9700, enteredBy: "Priya Sharma" },
  { id: "cb018", date: "2026-01-10", description: "Printing – client proposal booklets", type: "out", amount: 3200, currency: "INR", companyId: "startupsquad", category: "Petty Expense", reference: "PETTY-110-SS", runningBalance: 18200, enteredBy: "Sneha Reddy" },
  { id: "cb019", date: "2026-01-05", description: "Cash sale – walk-in client consultation", type: "in", amount: 15000, currency: "INR", companyId: "lumbee", category: "Cash Sale", reference: "CSALE-105-L", runningBalance: 13300, enteredBy: "Aditya Kapoor" },
  { id: "cb020", date: "2025-12-31", description: "Year-end petty cash reconciliation – return", type: "in", amount: 5000, currency: "INR", companyId: "startupsquad", category: "Advance Return", reference: "RECON-1231", runningBalance: 21400, enteredBy: "Sneha Reddy" },
];

export const complianceFilings: ComplianceFiling[] = [
  { id: "cf001", companyId: "startupsquad", type: "GST", name: "GSTR-1", filingPeriod: "Feb 2026", dueDate: "2026-03-11", status: "pending", notes: "Monthly outward supply details" },
  { id: "cf002", companyId: "startupsquad", type: "GST", name: "GSTR-3B", filingPeriod: "Feb 2026", dueDate: "2026-03-20", status: "pending", notes: "Summary return + GST payment" },
  { id: "cf003", companyId: "lumbee", type: "GST", name: "GSTR-1", filingPeriod: "Feb 2026", dueDate: "2026-03-11", status: "pending", notes: "Monthly outward supply details" },
  { id: "cf004", companyId: "lumbee", type: "GST", name: "GSTR-3B", filingPeriod: "Feb 2026", dueDate: "2026-03-20", status: "pending", notes: "Summary return + GST payment" },
  { id: "cf005", companyId: "startupsquad", type: "GST", name: "GSTR-1", filingPeriod: "Jan 2026", dueDate: "2026-02-11", status: "filed", filedDate: "2026-02-09", filedBy: "Sneha Reddy" },
  { id: "cf006", companyId: "startupsquad", type: "GST", name: "GSTR-3B", filingPeriod: "Jan 2026", dueDate: "2026-02-20", status: "filed", filedDate: "2026-02-18", filedBy: "Sneha Reddy" },
  { id: "cf007", companyId: "lumbee", type: "GST", name: "GSTR-1", filingPeriod: "Jan 2026", dueDate: "2026-02-11", status: "filed", filedDate: "2026-02-10", filedBy: "Aditya Kapoor" },
  { id: "cf008", companyId: "lumbee", type: "GST", name: "GSTR-3B", filingPeriod: "Jan 2026", dueDate: "2026-02-20", status: "filed", filedDate: "2026-02-19", filedBy: "Aditya Kapoor" },
  { id: "cf009", companyId: "startupsquad", type: "TDS", name: "TDS Return (26Q)", filingPeriod: "Q3 FY2026 (Oct–Dec 2025)", dueDate: "2026-01-31", status: "filed", filedDate: "2026-01-28", filedBy: "Sneha Reddy" },
  { id: "cf010", companyId: "lumbee", type: "TDS", name: "TDS Return (26Q)", filingPeriod: "Q3 FY2026 (Oct–Dec 2025)", dueDate: "2026-01-31", status: "filed", filedDate: "2026-01-30", filedBy: "Aditya Kapoor" },
  { id: "cf011", companyId: "startupsquad", type: "TDS", name: "TDS Return (26Q)", filingPeriod: "Q4 FY2026 (Jan–Mar 2026)", dueDate: "2026-05-31", status: "pending", notes: "Due after Q4 close" },
  { id: "cf012", companyId: "lumbee", type: "TDS", name: "TDS Return (26Q)", filingPeriod: "Q4 FY2026 (Jan–Mar 2026)", dueDate: "2026-05-31", status: "pending", notes: "Due after Q4 close" },
  { id: "cf013", companyId: "startupsquad", type: "ROC", name: "MGT-7 (Annual Return)", filingPeriod: "FY2025-26", dueDate: "2026-11-29", status: "pending", notes: "Within 60 days of AGM date" },
  { id: "cf014", companyId: "lumbee", type: "ROC", name: "MGT-7 (Annual Return)", filingPeriod: "FY2025-26", dueDate: "2026-11-29", status: "pending", notes: "Within 60 days of AGM date" },
  { id: "cf015", companyId: "startupsquad", type: "Income Tax", name: "Income Tax Return (ITR-6)", filingPeriod: "FY2024-25", dueDate: "2025-10-31", status: "filed", filedDate: "2025-10-25", filedBy: "CA Rajesh Gupta" },
  { id: "cf016", companyId: "lumbee", type: "Income Tax", name: "Income Tax Return (ITR-6)", filingPeriod: "FY2024-25", dueDate: "2025-10-31", status: "filed", filedDate: "2025-10-28", filedBy: "CA Rajesh Gupta" },
  { id: "cf017", companyId: "neom", type: "IRS", name: "Form 1065 – Partnership Return", filingPeriod: "Tax Year 2025", dueDate: "2026-03-15", status: "pending", notes: "Multi-member LLC taxed as partnership. Extension available to Sept 15." },
  { id: "cf018", companyId: "cloudnest", type: "IRS", name: "Form 1065 – Partnership Return", filingPeriod: "Tax Year 2025", dueDate: "2026-03-15", status: "pending", notes: "Multi-member LLC taxed as partnership. Extension available to Sept 15." },
  { id: "cf019", companyId: "neom", type: "Wyoming", name: "Wyoming Annual Report", filingPeriod: "2026 Annual", dueDate: "2026-03-15", status: "pending", notes: "Due on first anniversary each year. Fee: $62 online." },
  { id: "cf020", companyId: "cloudnest", type: "Wyoming", name: "Wyoming Annual Report", filingPeriod: "2026 Annual", dueDate: "2026-01-10", status: "overdue", filedDate: undefined, penaltyAmount: 50, notes: "Overdue – $50 late penalty accruing. File immediately." },
];

export const exchangeRates: ExchangeRate[] = [
  { id: "er001", date: "2026-02-28", fromCurrency: "USD", toCurrency: "INR", rate: 83.20, source: "Wise" },
  { id: "er002", date: "2026-02-15", fromCurrency: "USD", toCurrency: "INR", rate: 83.01, source: "RBI Reference" },
  { id: "er003", date: "2026-01-31", fromCurrency: "USD", toCurrency: "INR", rate: 83.10, source: "Google Finance" },
  { id: "er004", date: "2026-01-15", fromCurrency: "USD", toCurrency: "INR", rate: 83.05, source: "Wise" },
  { id: "er005", date: "2025-12-31", fromCurrency: "USD", toCurrency: "INR", rate: 83.45, source: "RBI Reference" },
  { id: "er006", date: "2025-12-15", fromCurrency: "USD", toCurrency: "INR", rate: 83.60, source: "Google Finance" },
  { id: "er007", date: "2025-11-30", fromCurrency: "USD", toCurrency: "INR", rate: 83.72, source: "Wise" },
  { id: "er008", date: "2025-11-15", fromCurrency: "USD", toCurrency: "INR", rate: 83.85, source: "RBI Reference" },
  { id: "er009", date: "2026-02-28", fromCurrency: "INR", toCurrency: "USD", rate: 0.01202, source: "Wise" },
  { id: "er010", date: "2026-01-31", fromCurrency: "INR", toCurrency: "USD", rate: 0.01203, source: "Wise" },
];
