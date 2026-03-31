export const LN_PORTAL_COLOR = "#225AEA";

import type { LnCompany, LnClientProfile, FormationStageDefinition, DashboardMetrics, ComplianceDeadline, RecentActivity, RmContact, PackageTier, LnDocument, LnInvoiceLineItem, LnInvoice, LnConversation, LnMessage, TaxFilingStatus, TaxFiling, TaxCalendarDeadline, LnClientMode } from "@/types/dashboard-ln";
export type { LnCompany, LnClientProfile, FormationStageDefinition, DashboardMetrics, ComplianceDeadline, RecentActivity, RmContact, PackageTier, LnDocument, LnInvoiceLineItem, LnInvoice, LnConversation, LnMessage, TaxFilingStatus, TaxFiling, TaxCalendarDeadline, LnClientMode };


export const CLIENT_PROFILE: LnClientProfile = {
  id: "LN-C-0042",
  name: "Rajesh Kumar",
  email: "rajesh@techventures.in",
  phone: "+91 98765 43210",
  avatar: "RK",
  joinedAt: "2025-11-15",
  specialistName: "Priya Sharma",
  specialistRole: "Formation Specialist",
  companies: [
    {
      id: "co-001",
      name: "TechVentures LLC",
      entityType: "LLC",
      state: "Delaware",
      status: "forming",
      currentStage: 4,
      packageTier: "Premium",
      startedAt: "2025-12-12",
      registeredAgent: "LegalNations Registered Agent (DE)",
      stageCompletionDates: { s1: "2025-12-12", s2: "2025-12-18", s3: "2026-01-20", s4: "2026-02-05" },
    },
    {
      id: "co-002",
      name: "CloudBase Corp",
      entityType: "C-Corp",
      state: "Wyoming",
      status: "completed",
      currentStage: 7,
      ein: "92-7654321",
      packageTier: "Standard",
      startedAt: "2025-06-01",
      registeredAgent: "LegalNations Registered Agent (WY)",
      stageCompletionDates: { s1: "2025-06-01", s2: "2025-06-15", s3: "2025-08-15", s4: "2025-09-02", s5: "2025-09-20", s6: "2025-10-15", s7: "2025-10-28" },
    },
  ],
};

export const FORMATION_STAGES: FormationStageDefinition[] = [
  { id: "s1", name: "Payment & Package Selection", shortName: "Package", description: "Select your formation package and complete payment" },
  { id: "s2", name: "KYC & Document Collection", shortName: "KYC", description: "Upload passport, address proof, and identity documents" },
  { id: "s3", name: "Articles of Organization", shortName: "Articles", description: "File formation documents with the Secretary of State" },
  { id: "s4", name: "EIN Application", shortName: "EIN", description: "Apply for Employer Identification Number from IRS" },
  { id: "s5", name: "BOI Filing", shortName: "BOI", description: "Submit Beneficial Ownership Information to FinCEN" },
  { id: "s6", name: "Banking & Stripe Setup", shortName: "Banking", description: "Open US business bank account and payment processing" },
  { id: "s7", name: "Compliance Calendar & Handover", shortName: "Handover", description: "Deliver compliance calendar and complete document package" },
];

export const DASHBOARD_METRICS: DashboardMetrics = {
  activeEntities: 1,
  completedEntities: 1,
  verifiedDocuments: 11,
  pendingDocuments: 1,
  pendingInvoices: 2,
  outstandingAmount: 224,
  unreadMessages: 2,
  nextDeadline: "2026-03-05",
  nextDeadlineTitle: "Review BOI Filing Draft",
};

export const COMPLIANCE_DEADLINES: ComplianceDeadline[] = [
  { id: "dl-001", title: "Review BOI Filing Draft", dueDate: "2026-03-05", company: "TechVentures LLC", priority: "high", type: "boi" },
  { id: "dl-002", title: "Pay BOI Filing Invoice", dueDate: "2026-03-10", company: "TechVentures LLC", priority: "medium", type: "boi" },
  { id: "dl-003", title: "IRS Form 1120 Filing", dueDate: "2026-04-15", company: "CloudBase Corp", priority: "high", type: "tax-filing" },
  { id: "dl-004", title: "Annual Report — Wyoming", dueDate: "2026-05-01", company: "CloudBase Corp", priority: "medium", type: "annual-report" },
  { id: "dl-005", title: "Delaware Franchise Tax", dueDate: "2026-06-01", company: "TechVentures LLC", priority: "low", type: "franchise-tax" },
  { id: "dl-006", title: "Registered Agent Renewal", dueDate: "2026-08-20", company: "CloudBase Corp", priority: "low", type: "registered-agent" },
];

export const RECENT_ACTIVITY: RecentActivity[] = [
  { id: "act-001", type: "compliance", title: "BOI Filing Draft Ready", description: "Review your Beneficial Ownership Information draft in Documents", timestamp: "2026-02-28T09:15:00Z", icon: "shield" },
  { id: "act-002", type: "message", title: "New Message from Compliance Officer", description: "Arjun Mehta sent you a message about BOI filing", timestamp: "2026-02-28T09:15:00Z", icon: "message" },
  { id: "act-003", type: "document", title: "EIN Confirmation Uploaded", description: "EIN 88-1234567 confirmed for TechVentures LLC", timestamp: "2026-02-05T10:20:00Z", icon: "file" },
  { id: "act-004", type: "stage", title: "EIN Application Completed", description: "IRS has assigned your Employer Identification Number", timestamp: "2026-02-05T10:15:00Z", icon: "check" },
  { id: "act-005", type: "payment", title: "Invoice LN-2026-0008 Paid", description: "Registered Agent annual fee — $149", timestamp: "2026-01-18T08:00:00Z", icon: "dollar" },
  { id: "act-006", type: "stage", title: "Articles Filed Successfully", description: "Delaware Division of Corporations approved TechVentures LLC", timestamp: "2026-01-20T14:30:00Z", icon: "check" },
  { id: "act-007", type: "document", title: "Operating Agreement Generated", description: "Your LLC operating agreement is ready for download", timestamp: "2026-01-22T11:00:00Z", icon: "file" },
  { id: "act-008", type: "payment", title: "Premium Package Payment", description: "TechVentures LLC formation package — $1,499", timestamp: "2025-12-12T10:00:00Z", icon: "dollar" },
];

export const RM_CONTACT: RmContact = {
  name: "Priya Sharma",
  role: "Formation Specialist",
  phone: "+91 99887 76655",
  whatsApp: "+919988776655",
  email: "priya@legalnations.com",
  avatar: "PS",
};

export const FORMATION_PACKAGES: PackageTier[] = [
  {
    id: "basic",
    name: "Basic",
    price: 399,
    currency: "USD",
    features: [
      "LLC or Corporation filing",
      "Articles of Organization",
      "Operating Agreement template",
      "EIN Application",
      "Standard processing (3-4 weeks)",
      "Email support",
    ],
  },
  {
    id: "standard",
    name: "Standard",
    price: 799,
    currency: "USD",
    popular: true,
    features: [
      "Everything in Basic",
      "Expedited processing (2-3 weeks)",
      "BOI Filing included",
      "Registered Agent (1st year free)",
      "Banking setup assistance",
      "Dedicated specialist",
      "Priority support",
    ],
  },
  {
    id: "premium",
    name: "Premium",
    price: 1499,
    currency: "USD",
    features: [
      "Everything in Standard",
      "Rush processing (7-10 days)",
      "Compliance calendar setup",
      "Annual report filing (1st year)",
      "Tax filing consultation",
      "Mercury/Stripe full setup",
      "WhatsApp direct line",
      "Dedicated compliance officer",
    ],
  },
];

export const LN_DOCUMENTS: LnDocument[] = [
  { id: "doc-001", companyId: "co-001", companyName: "TechVentures LLC", name: "Passport - Rajesh Kumar", category: "identity", uploadedAt: "2025-12-15", size: "2.4 MB", status: "verified" },
  { id: "doc-002", companyId: "co-001", companyName: "TechVentures LLC", name: "Address Proof - Utility Bill", category: "identity", uploadedAt: "2025-12-16", size: "1.1 MB", status: "verified" },
  { id: "doc-003", companyId: "co-001", companyName: "TechVentures LLC", name: "Articles of Organization", category: "formation", uploadedAt: "2026-01-20", size: "340 KB", status: "verified" },
  { id: "doc-004", companyId: "co-001", companyName: "TechVentures LLC", name: "Operating Agreement", category: "formation", uploadedAt: "2026-01-22", size: "520 KB", status: "verified" },
  { id: "doc-005", companyId: "co-001", companyName: "TechVentures LLC", name: "EIN Confirmation Letter (CP 575)", category: "tax", uploadedAt: "2026-02-05", size: "180 KB", status: "verified" },
  { id: "doc-006", companyId: "co-001", companyName: "TechVentures LLC", name: "BOI Filing Draft", category: "compliance", uploadedAt: "2026-02-28", size: "290 KB", status: "action-required" },
  { id: "doc-007", companyId: "co-001", companyName: "TechVentures LLC", name: "SSN/ITIN Application Receipt", category: "identity", uploadedAt: "2026-01-10", size: "95 KB", status: "pending-review" },
  { id: "doc-008", companyId: "co-002", companyName: "CloudBase Corp", name: "Passport - Rajesh Kumar", category: "identity", uploadedAt: "2025-06-10", size: "2.4 MB", status: "verified" },
  { id: "doc-009", companyId: "co-002", companyName: "CloudBase Corp", name: "Articles of Incorporation", category: "formation", uploadedAt: "2025-08-15", size: "380 KB", status: "verified" },
  { id: "doc-010", companyId: "co-002", companyName: "CloudBase Corp", name: "EIN Confirmation Letter (CP 575)", category: "tax", uploadedAt: "2025-09-02", size: "180 KB", status: "verified" },
  { id: "doc-011", companyId: "co-002", companyName: "CloudBase Corp", name: "BOI Filing Confirmation", category: "compliance", uploadedAt: "2025-09-20", size: "210 KB", status: "verified" },
  { id: "doc-012", companyId: "co-002", companyName: "CloudBase Corp", name: "Relay Bank Account Details", category: "banking", uploadedAt: "2025-10-15", size: "95 KB", status: "verified" },
  { id: "doc-013", companyId: "co-002", companyName: "CloudBase Corp", name: "Compliance Calendar 2026", category: "compliance", uploadedAt: "2025-10-28", size: "150 KB", status: "verified" },
];

export const LN_INVOICES: LnInvoice[] = [
  { id: "inv-001", number: "LN-2025-0042", description: "Premium Formation Package — TechVentures LLC", companyId: "co-001", companyName: "TechVentures LLC", amount: 1499, status: "paid", issuedAt: "2025-12-10", dueDate: "2025-12-20", paidAt: "2025-12-12", lineItems: [
    { id: "li-001", description: "Premium Formation Package", amount: 1299 },
    { id: "li-002", description: "Rush Processing Fee", amount: 200 },
  ]},
  { id: "inv-002", number: "LN-2026-0008", description: "Registered Agent — Annual Fee (Delaware)", companyId: "co-001", companyName: "TechVentures LLC", amount: 149, status: "paid", issuedAt: "2026-01-05", dueDate: "2026-01-20", paidAt: "2026-01-18", lineItems: [
    { id: "li-003", description: "Registered Agent Service — Delaware (Annual)", amount: 149 },
  ]},
  { id: "inv-003", number: "LN-2026-0019", description: "BOI Filing Service — TechVentures LLC", companyId: "co-001", companyName: "TechVentures LLC", amount: 99, status: "pending", issuedAt: "2026-02-25", dueDate: "2026-03-10", lineItems: [
    { id: "li-004", description: "Beneficial Ownership Information Report Filing", amount: 99 },
  ]},
  { id: "inv-004", number: "LN-2025-0021", description: "Standard Formation Package — CloudBase Corp", companyId: "co-002", companyName: "CloudBase Corp", amount: 799, status: "paid", issuedAt: "2025-07-22", dueDate: "2025-08-05", paidAt: "2025-07-24", lineItems: [
    { id: "li-005", description: "Standard Formation Package", amount: 699 },
    { id: "li-006", description: "Registered Agent (1st Year Free)", amount: 0 },
    { id: "li-007", description: "Expedited Processing", amount: 100 },
  ]},
  { id: "inv-005", number: "LN-2025-0033", description: "Registered Agent — Annual Fee (Wyoming)", companyId: "co-002", companyName: "CloudBase Corp", amount: 99, status: "paid", issuedAt: "2025-08-20", dueDate: "2025-09-05", paidAt: "2025-08-28", lineItems: [
    { id: "li-008", description: "Registered Agent Service — Wyoming (Annual)", amount: 99 },
  ]},
  { id: "inv-006", number: "LN-2026-0025", description: "Annual Report Filing — CloudBase Corp", companyId: "co-002", companyName: "CloudBase Corp", amount: 125, status: "overdue", issuedAt: "2026-02-01", dueDate: "2026-02-28", lineItems: [
    { id: "li-009", description: "Wyoming Annual Report Filing Service", amount: 75 },
    { id: "li-010", description: "State Filing Fee (Wyoming)", amount: 50 },
  ]},
];

export const LN_CONVERSATIONS: LnConversation[] = [
  { id: "conv-001", specialistName: "Priya Sharma", specialistRole: "Formation Specialist", specialistInitials: "PS", companyName: "TechVentures LLC", lastMessage: "Once the BOI filing is done, we'll start the Mercury bank account application and Stripe setup.", lastTimestamp: "2026-02-28T09:30:00Z", unread: 1 },
  { id: "conv-002", specialistName: "Arjun Mehta", specialistRole: "Compliance Officer", specialistInitials: "AM", companyName: "TechVentures LLC", lastMessage: "Please review the BOI draft in your Documents section and confirm the beneficial ownership details.", lastTimestamp: "2026-02-28T09:15:00Z", unread: 1 },
  { id: "conv-003", specialistName: "Priya Sharma", specialistRole: "Formation Specialist", specialistInitials: "PS", companyName: "CloudBase Corp", lastMessage: "CloudBase Corp formation is now complete! All documents have been delivered.", lastTimestamp: "2025-10-28T16:00:00Z", unread: 0 },
];

export const LN_MESSAGES: LnMessage[] = [
  { id: "msg-001", conversationId: "conv-001", from: "Priya Sharma", fromRole: "Formation Specialist", isClient: false, content: "Hi Rajesh! Your Articles of Organization for TechVentures LLC have been successfully filed with the Delaware Division of Corporations. You should receive the stamped copy within 5-7 business days.", timestamp: "2026-01-20T14:30:00Z" },
  { id: "msg-002", conversationId: "conv-001", from: "Rajesh Kumar", fromRole: "Client", isClient: true, content: "That's great news! How long will the EIN application take after this?", timestamp: "2026-01-20T15:10:00Z" },
  { id: "msg-003", conversationId: "conv-001", from: "Priya Sharma", fromRole: "Formation Specialist", isClient: false, content: "We'll submit the SS-4 form to the IRS within 48 hours. Typically takes 2-4 weeks to receive the EIN, but we'll expedite it. I'll keep you updated!", timestamp: "2026-01-20T15:45:00Z" },
  { id: "msg-004", conversationId: "conv-001", from: "Priya Sharma", fromRole: "Formation Specialist", isClient: false, content: "Great news — your EIN has been assigned! It's 88-1234567. I've uploaded the confirmation letter to your document vault.", timestamp: "2026-02-05T10:20:00Z" },
  { id: "msg-005", conversationId: "conv-001", from: "Rajesh Kumar", fromRole: "Client", isClient: true, content: "Amazing, thank you! What's the next step now?", timestamp: "2026-02-05T11:00:00Z" },
  { id: "msg-006", conversationId: "conv-001", from: "Priya Sharma", fromRole: "Formation Specialist", isClient: false, content: "Once the BOI filing is done, we'll start the Mercury bank account application and Stripe setup. Should be about 1-2 weeks from there to completion!", timestamp: "2026-02-28T09:30:00Z" },
  { id: "msg-007", conversationId: "conv-002", from: "Arjun Mehta", fromRole: "Compliance Officer", isClient: false, content: "Hi Rajesh, I'm handling your BOI filing for TechVentures LLC. I've prepared the draft — please review it in your Documents section and confirm the beneficial ownership details are correct.", timestamp: "2026-02-28T09:15:00Z" },
  { id: "msg-008", conversationId: "conv-003", from: "Priya Sharma", fromRole: "Formation Specialist", isClient: false, content: "Hi Rajesh! Just wanted to let you know that CloudBase Corp's formation process is now fully complete. All compliance calendars and documents have been delivered to your vault.", timestamp: "2025-10-28T16:00:00Z" },
  { id: "msg-009", conversationId: "conv-003", from: "Rajesh Kumar", fromRole: "Client", isClient: true, content: "Excellent work! The whole process was very smooth. Thank you for everything.", timestamp: "2025-10-28T16:30:00Z" },
  { id: "msg-010", conversationId: "conv-003", from: "Priya Sharma", fromRole: "Formation Specialist", isClient: false, content: "Thank you, Rajesh! Don't forget to file your annual report before May 1st. It's already in your compliance calendar. Reach out anytime you need help!", timestamp: "2025-10-28T17:00:00Z" },
];

export const LN_FAQS = [
  { question: "How long does LLC formation take?", answer: "LLC formation timelines vary by state: Delaware typically takes 3-5 business days, Wyoming 2-3 business days, and most other states 1-2 weeks. With our Rush Processing (Premium package), we can often get Delaware filings completed in 24-48 hours." },
  { question: "What documents do I need for KYC?", answer: "You'll need a valid passport (color scan of the photo page), proof of address (utility bill or bank statement less than 3 months old), a selfie holding your passport, and optionally your SSN or ITIN if you have one." },
  { question: "Which state should I choose for my company?", answer: "Delaware is ideal for companies planning to raise investment due to its well-established business courts. Wyoming offers the best value with no state tax, strong privacy, and low fees. Nevada provides similar tax benefits with strong privacy protections. If you operate locally, your home state may be most practical." },
  { question: "What is a BOI filing and is it required?", answer: "BOI (Beneficial Ownership Information) filing is a federal requirement under the Corporate Transparency Act. All US companies must report their beneficial owners to FinCEN. New companies must file within 90 days of formation. Failure to file can result in fines up to $500/day." },
  { question: "When is my annual report due?", answer: "Annual report deadlines vary by state: Delaware LLCs have a $300 annual tax due June 1st. Wyoming annual reports are due on the anniversary of formation. Corporations may have different deadlines. Your compliance calendar tracks all your specific deadlines." },
  { question: "How do I get my EIN (Employer Identification Number)?", answer: "We file IRS Form SS-4 on your behalf. For US persons, EINs can be obtained same-day online. For international applicants, the process takes 2-4 weeks via fax or mail. We handle the entire process and upload the confirmation letter to your document vault." },
  { question: "What's included in each package?", answer: "Basic ($399): LLC/Corp filing, Articles, Operating Agreement, EIN. Standard ($799): Everything in Basic plus expedited processing, BOI filing, 1st year registered agent, banking assistance, and dedicated specialist. Premium ($1,499): Everything in Standard plus rush processing, compliance calendar, annual report filing, tax consultation, full banking setup, and dedicated compliance officer." },
  { question: "How do I open a US bank account?", answer: "We assist with opening accounts at Mercury (our recommended partner) or other neo-banks. For international founders, Mercury allows remote account opening without a US visit. We prepare all required documentation and guide you through their application process. Most accounts are approved within 1-2 weeks." },
  { question: "What is a Registered Agent and do I need one?", answer: "A registered agent is a person or company designated to receive legal and government correspondence on behalf of your business. Every US company is required to have a registered agent in the state of formation. Our Standard and Premium packages include registered agent service for the first year." },
  { question: "Can I form a company as a non-US resident?", answer: "Yes! Non-US residents can form LLCs and Corporations in all 50 states without needing a visa or Social Security Number. You will need a passport for KYC verification. We specialize in helping international founders establish their US business presence." },
  { question: "What taxes will my company owe?", answer: "Tax obligations depend on your entity type, state, and business activities. LLCs are pass-through entities (profits taxed at personal rates). C-Corps pay a 21% federal corporate tax. Some states impose franchise taxes, annual fees, or state income tax. We recommend consulting with our tax specialist for your specific situation." },
  { question: "How do I maintain compliance after formation?", answer: "Key compliance tasks include: filing annual reports, paying state franchise taxes, maintaining a registered agent, filing BOI reports, keeping operating agreements current, and meeting tax filing deadlines. Our Premium package includes a compliance calendar that tracks all your obligations." },
  { question: "Can I change my company's state later?", answer: "Yes, you can domesticate (transfer) your company to another state, though it involves filing in both the old and new states. It's more cost-effective to choose the right state from the beginning. We can help you evaluate the best state for your specific needs." },
  { question: "What's the difference between an LLC and a Corporation?", answer: "LLCs offer flexible management, pass-through taxation, and simpler compliance. Corporations (C-Corps) are better for raising venture capital, offering stock options, and scaling. C-Corps face double taxation but have well-established corporate governance. Most small businesses and startups start with an LLC." },
  { question: "How do I set up Stripe for payment processing?", answer: "After your company has an EIN and a US bank account, we assist with creating your Stripe account. The process involves verifying your business details, connecting your bank account, and setting up your payment preferences. Most setups are completed within 3-5 business days." },
];

export const ADMIN_COMPANIES_ALL = [
  { id: "FC-001", name: "TechVentures LLC", client: "Rajesh Kumar", state: "Delaware", stage: "EIN Application", stageNum: 4, package: "Premium", revenue: 1499, health: 78 },
  { id: "FC-007", name: "CloudBase Corp", client: "Rajesh Kumar", state: "Wyoming", stage: "Completed", stageNum: 7, package: "Standard", revenue: 799, health: 100 },
  { id: "FC-002", name: "GreenLeaf Organics LLC", client: "Amit Patel", state: "Delaware", stage: "Articles Filing", stageNum: 3, package: "Premium", revenue: 1499, health: 55 },
  { id: "FC-003", name: "SwiftPay Solutions Inc", client: "Neha Joshi", state: "Nevada", stage: "KYC", stageNum: 2, package: "Basic", revenue: 399, health: 30 },
  { id: "FC-004", name: "DataBridge Analytics LLC", client: "Vikram Rao", state: "Wyoming", stage: "BOI Filing", stageNum: 5, package: "Standard", revenue: 799, health: 88 },
  { id: "FC-005", name: "UrbanNest Realty Corp", client: "Priya Singh", state: "Texas", stage: "Payment", stageNum: 1, package: "Premium", revenue: 1499, health: 12 },
  { id: "FC-006", name: "NovaTech AI Inc", client: "Deepak Verma", state: "Delaware", stage: "Banking Setup", stageNum: 6, package: "Standard", revenue: 799, health: 92 },
  { id: "FC-008", name: "MediCare Solutions LLC", client: "Sunita Agarwal", state: "Florida", stage: "Completed", stageNum: 7, package: "Premium", revenue: 1499, health: 100 },
];

export const ADMIN_PIPELINE_COUNTS: Record<string, number> = {
  "Payment": 3, "KYC": 5, "Articles Filing": 4,
  "EIN Application": 6, "BOI Filing": 3, "Banking Setup": 2, "Completed": 12,
};

export const ADMIN_TEAM = [
  { name: "Priya Sharma", role: "Formation Specialist", status: "Active", activeClients: 14 },
  { name: "Arjun Mehta", role: "Compliance Officer", status: "Active", activeClients: 11 },
  { name: "Neha Gupta", role: "Sales/BD", status: "Active", activeClients: 8 },
  { name: "Deepak Verma", role: "Tax Specialist", status: "Active", activeClients: 9 },
];

export const ADMIN_MONTHLY_REVENUE = [
  { month: "Oct 2025", amount: 2298, formations: 3 },
  { month: "Nov 2025", amount: 1598, formations: 2 },
  { month: "Dec 2025", amount: 3497, formations: 4 },
  { month: "Jan 2026", amount: 2697, formations: 3 },
  { month: "Feb 2026", amount: 1898, formations: 2 },
  { month: "Mar 2026", amount: 2996, formations: 3 },
];

export const FORMATION_CLIENTS = [
  { id: "FC-001", name: "TechVentures LLC", client: "Rajesh Kumar", state: "DE", stage: 4, stageName: "EIN Application", package: "Premium", daysInStage: 12, kycStatus: "approved" as const, einStatus: "pending" as const },
  { id: "FC-002", name: "GreenLeaf Organics LLC", client: "Amit Patel", state: "DE", stage: 3, stageName: "Articles Filing", package: "Premium", daysInStage: 8, kycStatus: "approved" as const, einStatus: "not-started" as const },
  { id: "FC-003", name: "SwiftPay Solutions Inc", client: "Neha Joshi", state: "NV", stage: 2, stageName: "KYC", package: "Basic", daysInStage: 3, kycStatus: "in-review" as const, einStatus: "not-started" as const },
  { id: "FC-004", name: "DataBridge Analytics LLC", client: "Vikram Rao", state: "WY", stage: 5, stageName: "BOI Filing", package: "Standard", daysInStage: 5, kycStatus: "approved" as const, einStatus: "received" as const },
  { id: "FC-005", name: "UrbanNest Realty Corp", client: "Priya Singh", state: "TX", stage: 1, stageName: "Payment", package: "Premium", daysInStage: 1, kycStatus: "not-started" as const, einStatus: "not-started" as const },
  { id: "FC-006", name: "NovaTech AI Inc", client: "Deepak Verma", state: "DE", stage: 6, stageName: "Banking Setup", package: "Standard", daysInStage: 4, kycStatus: "approved" as const, einStatus: "received" as const },
  { id: "FC-007", name: "CloudBase Corp", client: "Rajesh Kumar", state: "WY", stage: 7, stageName: "Completed", package: "Standard", daysInStage: 0, kycStatus: "approved" as const, einStatus: "received" as const },
  { id: "FC-008", name: "MediCare Solutions LLC", client: "Sunita Agarwal", state: "FL", stage: 7, stageName: "Completed", package: "Premium", daysInStage: 0, kycStatus: "approved" as const, einStatus: "received" as const },
];

export const KYC_QUEUE = [
  { id: "KYC-001", client: "Neha Joshi", company: "SwiftPay Solutions Inc", submitted: "2026-03-23", docs: ["Passport", "Address Proof"], status: "in-review" as const, notes: "Utility bill is blurry — may need re-upload" },
  { id: "KYC-002", client: "Priya Singh", company: "UrbanNest Realty Corp", submitted: "2026-03-25", docs: ["Passport"], status: "incomplete" as const, notes: "Missing address proof document" },
  { id: "KYC-003", client: "Suresh Kapoor", company: "AquaFlow Systems LLC", submitted: "2026-03-20", docs: ["Passport", "Address Proof", "Selfie"], status: "approved" as const, notes: "" },
  { id: "KYC-004", client: "Meera Reddy", company: "BrightStar Consulting Corp", submitted: "2026-03-24", docs: ["Passport", "Address Proof"], status: "in-review" as const, notes: "Awaiting ITIN confirmation" },
];

export const EIN_TRACKER = [
  { id: "EIN-001", company: "TechVentures LLC", client: "Rajesh Kumar", state: "DE", submittedDate: "2026-02-01", status: "pending" as const, method: "Fax", estimatedDate: "2026-03-15" },
  { id: "EIN-002", company: "DataBridge Analytics LLC", client: "Vikram Rao", state: "WY", submittedDate: "2026-01-20", status: "received" as const, method: "Online", estimatedDate: "2026-01-20", ein: "92-8765432" },
  { id: "EIN-003", company: "NovaTech AI Inc", client: "Deepak Verma", state: "DE", submittedDate: "2026-01-25", status: "received" as const, method: "Fax", estimatedDate: "2026-02-20", ein: "88-9123456" },
  { id: "EIN-004", company: "GreenLeaf Organics LLC", client: "Amit Patel", state: "DE", submittedDate: "", status: "not-started" as const, method: "-", estimatedDate: "-" },
];

export const SALES_LEADS = [
  { id: "LN-L001", name: "Rohit Agarwal", company: "Proposed LLC", state: "Delaware", stage: "Qualified", source: "Website", followUp: "Today", hot: true, value: 1499, assignedTo: "sales" },
  { id: "LN-L002", name: "Kavita Nair", company: "KN Imports Corp", state: "Wyoming", stage: "New Lead", source: "Referral", followUp: "Tomorrow", hot: false, value: 799, assignedTo: "sales" },
  { id: "LN-L003", name: "Suresh Kapoor", company: "AquaFlow Systems LLC", state: "Delaware", stage: "Proposal Sent", source: "LinkedIn", followUp: "Today", hot: true, value: 1499, assignedTo: "sales" },
  { id: "LN-L004", name: "Meera Reddy", company: "BrightStar Consulting Corp", state: "Nevada", stage: "Qualified", source: "Website", followUp: "In 2 days", hot: false, value: 399, assignedTo: "sales" },
  { id: "LN-L005", name: "Arjun Desai", company: "FinEdge Solutions LLC", state: "Wyoming", stage: "Proposal Sent", source: "Referral", followUp: "Today", hot: true, value: 799, assignedTo: "sales" },
  { id: "LN-L006", name: "Pooja Bhatia", company: "PB Wellness Inc", state: "Texas", stage: "New Lead", source: "Instagram", followUp: "In 3 days", hot: false, value: 399, assignedTo: "sales" },
  { id: "LN-L007", name: "Vikram Mehta", company: "VentureFirst Inc", state: "Delaware", stage: "Converted", source: "Website", followUp: "Done", hot: false, value: 799, assignedTo: "manager" },
  { id: "LN-L008", name: "Priya Sharma", company: "Sharma Holdings LLC", state: "Wyoming", stage: "Converted", source: "Referral", followUp: "Done", hot: false, value: 1499, assignedTo: "manager" },
];

export const SALES_PROPOSALS = [
  { id: "LN-P001", client: "Suresh Kapoor", company: "AquaFlow Systems LLC", package: "Premium", amount: "$1,499", status: "Sent", date: "Mar 23" },
  { id: "LN-P002", client: "Arjun Desai", company: "FinEdge Solutions LLC", package: "Standard", amount: "$799", status: "Under Review", date: "Mar 24" },
  { id: "LN-P003", client: "Vikram Rao", company: "DataBridge Analytics LLC", package: "Standard", amount: "$799", status: "Accepted", date: "Mar 18" },
  { id: "LN-P004", client: "Rohit Agarwal", company: "Proposed LLC", package: "Premium", amount: "$1,499", status: "Draft", date: "Mar 25" },
];

export const BOI_QUEUE = [
  { id: "BOI-001", company: "TechVentures LLC", client: "Rajesh Kumar", state: "DE", status: "draft-ready" as const, dueDate: "2026-04-15", owners: 1, filedDate: "" },
  { id: "BOI-002", company: "GreenLeaf Organics LLC", client: "Amit Patel", state: "DE", status: "in-progress" as const, dueDate: "2026-05-01", owners: 2, filedDate: "" },
  { id: "BOI-003", company: "SwiftPay Solutions Inc", client: "Neha Joshi", state: "NV", status: "pending-kyc" as const, dueDate: "2026-06-20", owners: 1, filedDate: "" },
  { id: "BOI-004", company: "CloudBase Corp", client: "Rajesh Kumar", state: "WY", status: "filed" as const, dueDate: "2025-09-20", owners: 1, filedDate: "2025-09-18" },
  { id: "BOI-005", company: "NovaTech AI Inc", client: "Deepak Verma", state: "DE", status: "pending-kyc" as const, dueDate: "2026-04-25", owners: 3, filedDate: "" },
];

export const ANNUAL_REPORTS = [
  { id: "AR-001", company: "CloudBase Corp", state: "Wyoming", dueDate: "2026-05-01", fee: 50, status: "upcoming" as const },
  { id: "AR-002", company: "TechVentures LLC", state: "Delaware", dueDate: "2026-06-01", fee: 300, status: "upcoming" as const },
  { id: "AR-003", company: "MediCare Solutions LLC", state: "Florida", dueDate: "2026-05-15", fee: 138, status: "filed" as const },
  { id: "AR-004", company: "DataBridge Analytics LLC", state: "Wyoming", dueDate: "2026-07-20", fee: 50, status: "upcoming" as const },
];

export const COMPLIANCE_CLIENTS = [
  { id: "CC-001", company: "TechVentures LLC", client: "Rajesh Kumar", state: "DE", boiStatus: "draft-ready", annualReportDue: "2026-06-01", raExpiry: "2027-01-01", overallHealth: 72 },
  { id: "CC-002", company: "CloudBase Corp", client: "Rajesh Kumar", state: "WY", boiStatus: "filed", annualReportDue: "2026-05-01", raExpiry: "2026-08-20", overallHealth: 85 },
  { id: "CC-003", company: "GreenLeaf Organics LLC", client: "Amit Patel", state: "DE", boiStatus: "in-progress", annualReportDue: "2026-06-01", raExpiry: "2027-03-15", overallHealth: 58 },
  { id: "CC-004", company: "NovaTech AI Inc", client: "Deepak Verma", state: "DE", boiStatus: "pending-kyc", annualReportDue: "2026-06-01", raExpiry: "2027-02-01", overallHealth: 45 },
];

export const TAX_FILINGS: TaxFiling[] = [
  { id: "TF-001", company: "CloudBase Corp", client: "Rajesh Kumar", state: "WY", ein: "92-7654321", entityType: "C-Corp", taxYear: 2025, status: "in-prep", forms: ["Form 1120", "Form 5472"], revenue: 0, assignedTo: "Deepak Verma", dueDate: "2026-04-15", notes: "Zero-activity return, single foreign owner" },
  { id: "TF-002", company: "TechVentures LLC", client: "Rajesh Kumar", state: "DE", ein: "88-1234567", entityType: "LLC", taxYear: 2025, status: "docs-pending", forms: ["Form 1120", "Form 5472"], revenue: 0, assignedTo: "Deepak Verma", dueDate: "2026-04-15", notes: "Awaiting bank statements from client" },
  { id: "TF-003", company: "MediCare Solutions LLC", client: "Sunita Agarwal", state: "FL", ein: "65-4321987", entityType: "LLC", taxYear: 2025, status: "filed", forms: ["Form 1120", "Form 5472"], revenue: 12500, assignedTo: "Deepak Verma", dueDate: "2026-04-15", filedDate: "2026-03-10", trackingNumber: "7025 0640 0001 2345 6789", notes: "Active LLC with revenue" },
  { id: "TF-004", company: "DataBridge Analytics LLC", client: "Vikram Rao", state: "WY", ein: "92-8765432", entityType: "LLC", taxYear: 2025, status: "review", forms: ["Form 1120", "Form 5472"], revenue: 0, assignedTo: "Deepak Verma", dueDate: "2026-04-15", notes: "Zero-activity, QC pending senior review" },
  { id: "TF-005", company: "NovaTech AI Inc", client: "Deepak Verma", state: "DE", ein: "88-9123456", entityType: "C-Corp", taxYear: 2025, status: "ready-to-file", forms: ["Form 1120", "Form 5472", "Schedule L"], revenue: 45000, assignedTo: "Deepak Verma", dueDate: "2026-04-15", notes: "Revenue-generating corp, all forms complete" },
  { id: "TF-006", company: "GreenLeaf Organics LLC", client: "Amit Patel", state: "DE", ein: "", entityType: "LLC", taxYear: 2025, status: "not-started", forms: ["Form 1120", "Form 5472"], revenue: 0, assignedTo: "Deepak Verma", dueDate: "2026-04-15", notes: "EIN not yet received — cannot start" },
  { id: "TF-007", company: "UrbanNest Realty Corp", client: "Priya Singh", state: "TX", ein: "", entityType: "C-Corp", taxYear: 2025, status: "not-started", forms: ["Form 1120"], revenue: 0, assignedTo: "Deepak Verma", dueDate: "2026-04-15", notes: "New formation, no EIN yet" },
  { id: "TF-008", company: "SwiftPay Solutions Inc", client: "Neha Joshi", state: "NV", ein: "", entityType: "C-Corp", taxYear: 2025, status: "not-started", forms: ["Form 1120"], revenue: 0, assignedTo: "Deepak Verma", dueDate: "2026-04-15", notes: "Formation still in KYC stage" },
];

export const TAX_STATUS_LABELS: Record<TaxFilingStatus, string> = {
  "not-started": "Not Started",
  "docs-pending": "Docs Pending",
  "in-prep": "In Preparation",
  "review": "Internal Review",
  "client-review": "Client Review",
  "ready-to-file": "Ready to File",
  "mailed": "Mailed",
  "filed": "Filed",
};

export const TAX_STATUS_COLORS: Record<TaxFilingStatus, string> = {
  "not-started": "border-gray-200 text-gray-500 bg-gray-50",
  "docs-pending": "border-red-300 text-red-700 bg-red-50",
  "in-prep": "border-amber-300 text-amber-700 bg-amber-50",
  "review": "border-blue-300 text-blue-700 bg-blue-50",
  "client-review": "border-purple-300 text-purple-700 bg-purple-50",
  "ready-to-file": "border-green-300 text-green-700 bg-green-50",
  "mailed": "border-teal-300 text-teal-700 bg-teal-50",
  "filed": "border-emerald-300 text-emerald-700 bg-emerald-50",
};

export const TAX_PREP_STEPS = [
  { n: 1, key: "doc-collection", title: "Document Collection", description: "Request bank statements, income/expense records" },
  { n: 2, key: "ein-verify", title: "EIN Verification", description: "Verify EIN with IRS records, confirm entity type" },
  { n: 3, key: "form-1120", title: "Form 1120 Preparation", description: "Prepare with entity info, income/deductions, balance sheet" },
  { n: 4, key: "form-5472", title: "Form 5472 Preparation", description: "Report transactions for 25%+ foreign owners" },
  { n: 5, key: "review", title: "Internal Review & QC", description: "Cross-check all forms for accuracy" },
  { n: 6, key: "client-review", title: "Client Review", description: "Send forms to client for review and confirmation" },
  { n: 7, key: "print-sign", title: "Print & Package", description: "Print filing package, prepare cover letter" },
  { n: 8, key: "mail", title: "Mail to IRS", description: "Ship via certified mail through LetterStream" },
];

export const TAX_CALENDAR_DEADLINES: TaxCalendarDeadline[] = [
  { id: "TC-001", title: "Form 1120 Filing Deadline", date: "2026-04-15", type: "filing", priority: "critical", done: false },
  { id: "TC-002", title: "Form 5472 Filing Deadline", date: "2026-04-15", type: "filing", priority: "critical", done: false },
  { id: "TC-003", title: "Form 7004 Extension (if needed)", date: "2026-04-15", type: "extension", priority: "high", done: false },
  { id: "TC-004", title: "Q1 Estimated Tax Payment", date: "2026-04-15", type: "estimated-tax", priority: "high", done: false },
  { id: "TC-005", title: "Delaware Franchise Tax", date: "2026-06-01", type: "state", company: "TechVentures LLC", priority: "medium", done: false },
  { id: "TC-006", title: "Q2 Estimated Tax Payment", date: "2026-06-15", type: "estimated-tax", priority: "medium", done: false },
  { id: "TC-007", title: "Q3 Estimated Tax Payment", date: "2026-09-15", type: "estimated-tax", priority: "low", done: false },
  { id: "TC-008", title: "Extended Filing Deadline", date: "2026-10-15", type: "filing", priority: "high", done: false },
  { id: "TC-009", title: "Q4 Estimated Tax Payment", date: "2027-01-15", type: "estimated-tax", priority: "low", done: false },
  { id: "TC-010", title: "MediCare Solutions — Filed", date: "2026-03-10", type: "filing", company: "MediCare Solutions LLC", priority: "critical", done: true },
];

const LN_CLIENT_MODE_KEY = "ln-client-dashboard-mode";

export function getLnClientMode(): LnClientMode {
  try {
    const v = localStorage.getItem(LN_CLIENT_MODE_KEY);
    if (v === "setup" || v === "active") return v;
  } catch {}
  return "active";
}

export function setLnClientMode(mode: LnClientMode): void {
  try {
    localStorage.setItem(LN_CLIENT_MODE_KEY, mode);
  } catch {}
}

export const LN_SETUP_DATA = {
  onboardingPercent: 35,
  currentStep: 2,
  totalSteps: 5,
  tasksRemaining: 3,
  setupItems: [
    { id: "s1", label: "Select Formation Package", done: true, href: "/portal-ln/onboarding" },
    { id: "s2", label: "Complete KYC / Upload Documents", done: true, href: "/portal-ln/documents" },
    { id: "s3", label: "Review & Submit Formation Details", done: false, href: "/portal-ln/onboarding" },
    { id: "s4", label: "Make Payment", done: false, href: "/portal-ln/invoices" },
    { id: "s5", label: "Track Formation Progress", done: false, href: "/portal-ln/companies" },
  ],
};

export const US_STATES_POPULAR = [
  { code: "DE", name: "Delaware", tag: "Most Popular", description: "No state income tax for LLCs, business-friendly courts" },
  { code: "WY", name: "Wyoming", tag: "Best Value", description: "No state tax, strong privacy, low fees" },
  { code: "NV", name: "Nevada", tag: "Privacy Focused", description: "No state tax, no information sharing with IRS" },
  { code: "TX", name: "Texas", tag: "", description: "Large market, no state income tax" },
  { code: "FL", name: "Florida", tag: "", description: "No state income tax, growing business hub" },
  { code: "CA", name: "California", tag: "", description: "Largest market, $800 annual franchise tax" },
  { code: "NY", name: "New York", tag: "", description: "Financial hub, publication requirement" },
  { code: "NM", name: "New Mexico", tag: "", description: "No annual report requirement" },
];
