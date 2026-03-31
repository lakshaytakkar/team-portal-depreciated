import type { PortalClient, FormationStage, PortalCompany, PortalDocument, PortalInvoice, PortalMessage, PortalActivity } from "@/types/portal-legalnations";
export type { PortalClient, FormationStage, PortalCompany, PortalDocument, PortalInvoice, PortalMessage, PortalActivity };


export const portalClient: PortalClient = {
  id: "client-001",
  name: "Rajesh Kumar",
  email: "rajesh@techventures.in",
  phone: "+91 98765 43210",
  avatar: "RK",
  joinedAt: "2025-11-15",
};

export const portalCompanies: PortalCompany[] = [
  {
    id: "comp-001",
    name: "TechVentures LLC",
    entityType: "LLC",
    state: "Delaware",
    package: "Premium",
    status: "in-progress",
    filedAt: "2026-01-20",
    stages: [
      { id: "s1", name: "Payment & Package Selection", status: "completed", completedAt: "2025-12-10", description: "Premium package selected and payment received" },
      { id: "s2", name: "KYC & Document Collection", status: "completed", completedAt: "2025-12-18", description: "Passport, address proof, and SSN/ITIN collected" },
      { id: "s3", name: "Articles of Organization", status: "completed", completedAt: "2026-01-20", description: "Filed with Delaware Division of Corporations" },
      { id: "s4", name: "EIN Application", status: "completed", completedAt: "2026-02-05", description: "IRS Form SS-4 submitted and EIN received" },
      { id: "s5", name: "BOI Filing", status: "in-progress", description: "Beneficial Ownership Information report being prepared for FinCEN" },
      { id: "s6", name: "Banking & Stripe Setup", status: "pending", description: "Mercury bank account and Stripe merchant account setup" },
      { id: "s7", name: "Compliance Calendar & Handover", status: "pending", description: "Final compliance calendar and document package delivery" },
    ],
    einNumber: "88-1234567",
  },
  {
    id: "comp-002",
    name: "CloudBase Corp",
    entityType: "Corporation",
    state: "Wyoming",
    package: "Standard",
    status: "completed",
    filedAt: "2025-08-15",
    completedAt: "2025-10-28",
    einNumber: "85-9876543",
    stages: [
      { id: "s1", name: "Payment & Package Selection", status: "completed", completedAt: "2025-07-22", description: "Standard package selected" },
      { id: "s2", name: "KYC & Document Collection", status: "completed", completedAt: "2025-08-01", description: "All identity documents verified" },
      { id: "s3", name: "Articles of Incorporation", status: "completed", completedAt: "2025-08-15", description: "Filed with Wyoming Secretary of State" },
      { id: "s4", name: "EIN Application", status: "completed", completedAt: "2025-09-02", description: "EIN received from IRS" },
      { id: "s5", name: "BOI Filing", status: "completed", completedAt: "2025-09-20", description: "FinCEN BOI report filed successfully" },
      { id: "s6", name: "Banking Setup", status: "completed", completedAt: "2025-10-15", description: "Relay bank account opened" },
      { id: "s7", name: "Compliance Calendar & Handover", status: "completed", completedAt: "2025-10-28", description: "All documents delivered, compliance calendar set up" },
    ],
  },
];

export const portalDocuments: PortalDocument[] = [
  { id: "doc-001", companyId: "comp-001", companyName: "TechVentures LLC", name: "Passport - Rajesh Kumar", category: "identity", type: "uploaded", uploadedAt: "2025-12-15", size: "2.4 MB", status: "verified" },
  { id: "doc-002", companyId: "comp-001", companyName: "TechVentures LLC", name: "Address Proof - Utility Bill", category: "identity", type: "uploaded", uploadedAt: "2025-12-16", size: "1.1 MB", status: "verified" },
  { id: "doc-003", companyId: "comp-001", companyName: "TechVentures LLC", name: "Articles of Organization", category: "formation", type: "generated", uploadedAt: "2026-01-20", size: "340 KB", status: "verified" },
  { id: "doc-004", companyId: "comp-001", companyName: "TechVentures LLC", name: "Operating Agreement", category: "formation", type: "generated", uploadedAt: "2026-01-22", size: "520 KB", status: "verified" },
  { id: "doc-005", companyId: "comp-001", companyName: "TechVentures LLC", name: "EIN Confirmation Letter", category: "tax", type: "generated", uploadedAt: "2026-02-05", size: "180 KB", status: "verified" },
  { id: "doc-006", companyId: "comp-001", companyName: "TechVentures LLC", name: "BOI Filing Draft", category: "compliance", type: "generated", uploadedAt: "2026-02-28", size: "290 KB", status: "pending-review" },
  { id: "doc-007", companyId: "comp-002", companyName: "CloudBase Corp", name: "Passport - Rajesh Kumar", category: "identity", type: "uploaded", uploadedAt: "2025-07-28", size: "2.4 MB", status: "verified" },
  { id: "doc-008", companyId: "comp-002", companyName: "CloudBase Corp", name: "Articles of Incorporation", category: "formation", type: "generated", uploadedAt: "2025-08-15", size: "380 KB", status: "verified" },
  { id: "doc-009", companyId: "comp-002", companyName: "CloudBase Corp", name: "EIN Confirmation Letter", category: "tax", type: "generated", uploadedAt: "2025-09-02", size: "180 KB", status: "verified" },
  { id: "doc-010", companyId: "comp-002", companyName: "CloudBase Corp", name: "BOI Filing Confirmation", category: "compliance", type: "generated", uploadedAt: "2025-09-20", size: "210 KB", status: "verified" },
  { id: "doc-011", companyId: "comp-002", companyName: "CloudBase Corp", name: "Bank Account Details", category: "banking", type: "generated", uploadedAt: "2025-10-15", size: "95 KB", status: "verified" },
];

export const portalInvoices: PortalInvoice[] = [
  { id: "inv-001", number: "LN-2025-0042", description: "Premium Formation Package — TechVentures LLC", companyName: "TechVentures LLC", amount: 1499, currency: "USD", status: "paid", issuedAt: "2025-12-10", dueDate: "2025-12-20", paidAt: "2025-12-12" },
  { id: "inv-002", number: "LN-2026-0008", description: "Registered Agent — Annual Fee (Delaware)", companyName: "TechVentures LLC", amount: 149, currency: "USD", status: "paid", issuedAt: "2026-01-05", dueDate: "2026-01-20", paidAt: "2026-01-18" },
  { id: "inv-003", number: "LN-2026-0019", description: "BOI Filing Service — TechVentures LLC", companyName: "TechVentures LLC", amount: 99, currency: "USD", status: "pending", issuedAt: "2026-02-25", dueDate: "2026-03-10" },
  { id: "inv-004", number: "LN-2025-0021", description: "Standard Formation Package — CloudBase Corp", companyName: "CloudBase Corp", amount: 799, currency: "USD", status: "paid", issuedAt: "2025-07-22", dueDate: "2025-08-05", paidAt: "2025-07-24" },
  { id: "inv-005", number: "LN-2025-0033", description: "Registered Agent — Annual Fee (Wyoming)", companyName: "CloudBase Corp", amount: 99, currency: "USD", status: "paid", issuedAt: "2025-08-20", dueDate: "2025-09-05", paidAt: "2025-08-28" },
  { id: "inv-006", number: "LN-2026-0025", description: "Annual Report Filing — CloudBase Corp", companyName: "CloudBase Corp", amount: 125, currency: "USD", status: "overdue", issuedAt: "2026-02-01", dueDate: "2026-02-28" },
];

export const portalMessages: PortalMessage[] = [
  { id: "msg-001", from: "Priya Sharma", fromRole: "Formation Specialist", isClient: false, content: "Hi Rajesh! Your Articles of Organization for TechVentures LLC have been successfully filed with the Delaware Division of Corporations. You should receive the stamped copy within 5-7 business days.", timestamp: "2026-01-20T14:30:00Z", read: true },
  { id: "msg-002", from: "Rajesh Kumar", fromRole: "Client", isClient: true, content: "That's great news! How long will the EIN application take after this?", timestamp: "2026-01-20T15:10:00Z", read: true },
  { id: "msg-003", from: "Priya Sharma", fromRole: "Formation Specialist", isClient: false, content: "We'll submit the SS-4 form to the IRS within 48 hours. Typically takes 2-4 weeks to receive the EIN, but we'll expedite it. I'll keep you updated!", timestamp: "2026-01-20T15:45:00Z", read: true },
  { id: "msg-004", from: "Priya Sharma", fromRole: "Formation Specialist", isClient: false, content: "Great news — your EIN has been assigned! It's 88-1234567. I've uploaded the confirmation letter to your document vault.", timestamp: "2026-02-05T10:20:00Z", read: true },
  { id: "msg-005", from: "Rajesh Kumar", fromRole: "Client", isClient: true, content: "Amazing, thank you! What's the next step now?", timestamp: "2026-02-05T11:00:00Z", read: true },
  { id: "msg-006", from: "Arjun Mehta", fromRole: "Compliance Officer", isClient: false, content: "Hi Rajesh, I'm handling your BOI filing. I've prepared the draft — please review it in your Documents section and confirm the beneficial ownership details are correct.", timestamp: "2026-02-28T09:15:00Z", read: false },
  { id: "msg-007", from: "Priya Sharma", fromRole: "Formation Specialist", isClient: false, content: "Also, just a heads up — once the BOI filing is done, we'll start the Mercury bank account application and Stripe setup. Should be about 1-2 weeks from there to completion!", timestamp: "2026-02-28T09:30:00Z", read: false },
];

export const portalActivity: PortalActivity[] = [
  { id: "act-001", type: "compliance", title: "BOI Filing Draft Ready", description: "Review your Beneficial Ownership Information draft in Documents", timestamp: "2026-02-28T09:15:00Z", icon: "shield" },
  { id: "act-002", type: "document", title: "EIN Confirmation Uploaded", description: "EIN 88-1234567 confirmed for TechVentures LLC", timestamp: "2026-02-05T10:20:00Z", icon: "file" },
  { id: "act-003", type: "stage", title: "EIN Application Completed", description: "IRS has assigned your Employer Identification Number", timestamp: "2026-02-05T10:15:00Z", icon: "check" },
  { id: "act-004", type: "payment", title: "Invoice LN-2026-0008 Paid", description: "Registered Agent annual fee — $149", timestamp: "2026-01-18T08:00:00Z", icon: "dollar" },
  { id: "act-005", type: "stage", title: "Articles Filed Successfully", description: "Delaware Division of Corporations approved TechVentures LLC", timestamp: "2026-01-20T14:30:00Z", icon: "check" },
  { id: "act-006", type: "document", title: "Operating Agreement Generated", description: "Your LLC operating agreement is ready for download", timestamp: "2026-01-22T11:00:00Z", icon: "file" },
];

export const upcomingDeadlines = [
  { id: "dl-001", title: "Review BOI Filing Draft", dueDate: "2026-03-05", company: "TechVentures LLC", priority: "high" as const },
  { id: "dl-002", title: "Pay BOI Filing Invoice", dueDate: "2026-03-10", company: "TechVentures LLC", priority: "medium" as const },
  { id: "dl-003", title: "Annual Report Filing — Wyoming", dueDate: "2026-05-01", company: "CloudBase Corp", priority: "low" as const },
  { id: "dl-004", title: "Delaware Franchise Tax", dueDate: "2026-06-01", company: "TechVentures LLC", priority: "low" as const },
];
