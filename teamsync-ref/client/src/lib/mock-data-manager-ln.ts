import { SALES_LEADS } from "@/lib/mock-data-dashboard-ln";

export interface ManagerBOIOwner {
  id: string;
  name: string;
  ownership: string;
  dob: string;
  address: string;
  passportNum: string;
}

export interface ManagerClientDoc {
  id: string;
  name: string;
  required: boolean;
  category: "identity" | "formation" | "tax" | "compliance" | "banking";
  status: "not-requested" | "requested" | "uploaded" | "approved" | "rejected";
  requestedAt?: string;
  uploadedAt?: string;
  notes?: string;
  rejectReason?: string;
}

export interface BankingChecklistItem {
  id: string;
  label: string;
  done: boolean;
  date?: string;
}

export interface ManagerTask {
  id: string;
  title: string;
  assignedTo: string;
  due: string;
  status: "todo" | "in-progress" | "done";
  priority: "high" | "medium" | "low";
}

export interface ManagerNote {
  id: string;
  text: string;
  by: string;
  timestamp: string;
}

export interface ManagerTicket {
  id: string;
  subject: string;
  priority: "high" | "medium" | "low";
  status: "open" | "in-progress" | "resolved";
  created: string;
  lastUpdate: string;
  notes: string;
}

export interface ManagerActivityEntry {
  id: string;
  timestamp: string;
  type: "stage" | "document" | "message" | "system" | "action";
  description: string;
  by: string;
}

export interface ManagerClient {
  id: string;
  companyName: string;
  clientName: string;
  email: string;
  phone: string;
  whatsapp?: string;
  country: string;
  state: string;
  entityType: "LLC" | "C-Corp" | "S-Corp";
  package: "Basic" | "Standard" | "Premium";
  registeredAgent?: string;
  formationDate?: string;
  stage: number;
  stageName: string;
  stageDates: Record<number, string>;
  daysInStage: number;
  healthScore: number;
  assignedTo: string;
  assignedToInitials: string;
  startedAt: string;
  paymentStatus: "pending" | "paid";
  packageAmount: number;
  kycStatus: "not-started" | "in-review" | "approved" | "rejected";
  kycDocs: ManagerClientDoc[];
  kycNotes: string;
  llcEntityNameConfirmed: boolean;
  llcRegisteredAgentSelected: boolean;
  llcStateFeeCollected: boolean;
  articlesState: "not-started" | "draft" | "submitted" | "under-review" | "approved" | "stamped";
  articlesFiledDate?: string;
  articlesApprovedDate?: string;
  operatingAgreement: "pending" | "generated" | "signed";
  llcNotes: string;
  einStatus: "not-started" | "submitted-fax" | "submitted-online" | "received";
  einNumber?: string;
  einSubmittedDate?: string;
  einReceivedDate?: string;
  einMethod: "Fax" | "Online" | "-";
  einNotes: string;
  boiStatus: "not-started" | "pending-kyc" | "draft-ready" | "sent-for-review" | "client-approved" | "filed";
  boiOwners: ManagerBOIOwner[];
  boiFiledDate?: string;
  boiConfirmationNum?: string;
  boiConfirmDocUploaded?: boolean;
  boiNotes: string;
  mercuryChecklist: BankingChecklistItem[];
  mercuryAccountNum?: string;
  mercuryRoutingNum?: string;
  mercuryApprovedDate?: string;
  stripeChecklist: BankingChecklistItem[];
  stripeAccountId?: string;
  stripeApprovedDate?: string;
  bankingNotes: string;
  complianceCalendarDelivered: boolean;
  documentPackageDelivered: boolean;
  handoverNotes: string;
  tasks: ManagerTask[];
  notes: ManagerNote[];
  tickets: ManagerTicket[];
  activityLog: ManagerActivityEntry[];
}

export interface ManagerTeamMember {
  name: string;
  initials: string;
  role: string;
  activeClients: number;
}

export const MANAGER_TEAM: ManagerTeamMember[] = [
  { name: "Priya Sharma", initials: "PS", role: "Formation Specialist", activeClients: 14 },
  { name: "Arjun Mehta", initials: "AM", role: "Compliance Officer", activeClients: 11 },
  { name: "Neha Gupta", initials: "NG", role: "Sales/BD", activeClients: 8 },
  { name: "Deepak Verma", initials: "DV", role: "Tax Specialist", activeClients: 9 },
];

export const MANAGER_ALL_LEADS = SALES_LEADS.map((l) => ({
  ...l,
  assignedSalesName: l.assignedTo === "manager" ? "Vikas (Manager)" : "Neha Gupta",
}));

const MERCURY_CHECKLIST_TEMPLATE = (): BankingChecklistItem[] => [
  { id: "m1", label: "KYC docs sent to Mercury (passport, EIN letter, articles)", done: false },
  { id: "m2", label: "Mercury online application submitted", done: false },
  { id: "m3", label: "Mercury KYC approved by bank", done: false },
  { id: "m4", label: "Account details received (account + routing number)", done: false },
];

const STRIPE_CHECKLIST_TEMPLATE = (): BankingChecklistItem[] => [
  { id: "s1", label: "Stripe business account application submitted", done: false },
  { id: "s2", label: "Business identity verified by Stripe", done: false },
  { id: "s3", label: "Stripe account activated and in good standing", done: false },
  { id: "s4", label: "Payment method / bank account added", done: false },
];

export const MANAGER_CLIENTS: ManagerClient[] = [
  {
    id: "FC-001",
    companyName: "TechVentures LLC",
    clientName: "Rajesh Kumar",
    email: "rajesh@techventures.in",
    phone: "+91 98765 43210",
    whatsapp: "+91 98765 43210",
    country: "India",
    state: "Delaware",
    entityType: "LLC",
    package: "Premium",
    registeredAgent: "Registered Agents Inc.",
    stage: 4,
    stageName: "EIN Application",
    stageDates: { 1: "2025-12-12", 2: "2025-12-16", 3: "2026-01-20" },
    daysInStage: 12,
    healthScore: 78,
    assignedTo: "Priya Sharma",
    assignedToInitials: "PS",
    startedAt: "2025-12-12",
    paymentStatus: "paid",
    packageAmount: 1499,
    kycStatus: "approved",
    kycDocs: [
      { id: "kd-001", name: "Passport", required: true, category: "identity", status: "approved", requestedAt: "2025-12-13", uploadedAt: "2025-12-15" },
      { id: "kd-002", name: "Address Proof", required: true, category: "identity", status: "approved", requestedAt: "2025-12-13", uploadedAt: "2025-12-16" },
      { id: "kd-003", name: "Selfie with Passport", required: true, category: "identity", status: "approved", requestedAt: "2025-12-13", uploadedAt: "2025-12-16" },
      { id: "kd-004", name: "SSN / ITIN (if applicable)", required: false, category: "identity", status: "not-requested" },
      { id: "kd-005", name: "Additional Document", required: false, category: "identity", status: "not-requested" },
    ],
    kycNotes: "All KYC documents verified and approved on 16 Dec 2025.",
    llcEntityNameConfirmed: true,
    llcRegisteredAgentSelected: true,
    llcStateFeeCollected: true,
    articlesState: "stamped",
    articlesFiledDate: "2026-01-15",
    articlesApprovedDate: "2026-01-20",
    operatingAgreement: "generated",
    llcNotes: "Articles filed with Delaware Division of Corporations. Stamped copy delivered to client vault.",
    einStatus: "submitted-fax",
    einNumber: undefined,
    einSubmittedDate: "2026-02-01",
    einMethod: "Fax",
    einNotes: "IRS SS-4 faxed on Feb 1. Estimated 4-6 weeks. Follow up scheduled for Mar 15.",
    boiStatus: "draft-ready",
    boiOwners: [
      { id: "bo-001", name: "Rajesh Kumar", ownership: "100%", dob: "1985-04-12", address: "B-204, Andheri West, Mumbai 400053", passportNum: "Z1234567" },
    ],
    boiConfirmationNum: undefined,
    boiConfirmDocUploaded: false,
    boiNotes: "BOI draft prepared — awaiting client review and sign-off.",
    mercuryChecklist: MERCURY_CHECKLIST_TEMPLATE(),
    mercuryAccountNum: undefined,
    mercuryRoutingNum: undefined,
    mercuryApprovedDate: undefined,
    stripeChecklist: STRIPE_CHECKLIST_TEMPLATE(),
    stripeAccountId: undefined,
    stripeApprovedDate: undefined,
    bankingNotes: "Will initiate Mercury after EIN received.",
    complianceCalendarDelivered: false,
    documentPackageDelivered: false,
    handoverNotes: "",
    tasks: [
      { id: "mt-001", title: "Follow up on EIN fax status with IRS", assignedTo: "Priya Sharma", due: "2026-03-28", status: "todo", priority: "high" },
      { id: "mt-002", title: "Get client to approve BOI draft", assignedTo: "Arjun Mehta", due: "2026-03-27", status: "in-progress", priority: "high" },
      { id: "mt-003", title: "Prepare Mercury application documents", assignedTo: "Priya Sharma", due: "2026-04-10", status: "todo", priority: "medium" },
    ],
    notes: [
      { id: "n-001", text: "Client called — confirmed fax was sent on Feb 1. IRS confirmation awaited.", by: "Priya Sharma", timestamp: "2026-02-05T10:30:00Z" },
    ],
    tickets: [
      { id: "tk-001", subject: "EIN delay — IRS fax confirmation needed", priority: "high", status: "in-progress", created: "2026-03-10", lastUpdate: "2026-03-24", notes: "Tracking IRS fax acknowledgement. EIN expected by end of March." },
    ],
    activityLog: [
      { id: "al-001", timestamp: "2026-02-28T09:15:00Z", type: "document", description: "BOI draft prepared by Arjun Mehta", by: "Arjun Mehta" },
      { id: "al-002", timestamp: "2026-02-05T10:20:00Z", type: "stage", description: "Stage 4 (EIN Application) initiated — SS-4 submitted via fax to IRS", by: "Priya Sharma" },
      { id: "al-003", timestamp: "2026-01-22T11:00:00Z", type: "document", description: "Operating Agreement generated and uploaded", by: "System" },
      { id: "al-004", timestamp: "2026-01-20T14:30:00Z", type: "stage", description: "Stage 3 complete — Articles filed and stamped by Delaware", by: "Priya Sharma" },
      { id: "al-005", timestamp: "2025-12-16T10:00:00Z", type: "stage", description: "Stage 2 complete — KYC approved", by: "Arjun Mehta" },
      { id: "al-006", timestamp: "2025-12-12T10:00:00Z", type: "action", description: "Client onboarded — Premium package payment confirmed", by: "System" },
    ],
  },
  {
    id: "FC-002",
    companyName: "GreenLeaf Organics LLC",
    clientName: "Amit Patel",
    email: "amit@greenleaforganics.com",
    phone: "+91 98001 23456",
    whatsapp: "+91 98001 23456",
    country: "India",
    state: "Delaware",
    entityType: "LLC",
    package: "Premium",
    registeredAgent: "Northwest Registered Agent",
    stage: 3,
    stageName: "Articles Filing",
    stageDates: { 1: "2026-01-15", 2: "2026-01-20" },
    daysInStage: 8,
    healthScore: 55,
    assignedTo: "Priya Sharma",
    assignedToInitials: "PS",
    startedAt: "2026-01-15",
    paymentStatus: "paid",
    packageAmount: 1499,
    kycStatus: "approved",
    kycDocs: [
      { id: "kd-010", name: "Passport", required: true, category: "identity", status: "approved", requestedAt: "2026-01-16", uploadedAt: "2026-01-18" },
      { id: "kd-011", name: "Address Proof", required: true, category: "identity", status: "approved", requestedAt: "2026-01-16", uploadedAt: "2026-01-19" },
      { id: "kd-012", name: "Selfie with Passport", required: true, category: "identity", status: "approved", requestedAt: "2026-01-16", uploadedAt: "2026-01-20" },
      { id: "kd-013", name: "SSN / ITIN (if applicable)", required: false, category: "identity", status: "not-requested" },
      { id: "kd-014", name: "Additional Document", required: false, category: "identity", status: "not-requested" },
    ],
    kycNotes: "All documents clear. Approved Jan 20.",
    llcEntityNameConfirmed: true,
    llcRegisteredAgentSelected: true,
    llcStateFeeCollected: false,
    articlesState: "draft",
    operatingAgreement: "pending",
    llcNotes: "Articles draft under preparation. Name check completed — GreenLeaf Organics LLC available in Delaware.",
    einStatus: "not-started",
    einMethod: "-",
    einNotes: "EIN will be initiated after Articles approval.",
    boiStatus: "not-started",
    boiOwners: [
      { id: "bo-010", name: "Amit Patel", ownership: "70%", dob: "1988-09-23", address: "302, Satellite Road, Ahmedabad 380015", passportNum: "P7654321" },
      { id: "bo-011", name: "Ritu Patel", ownership: "30%", dob: "1990-03-14", address: "302, Satellite Road, Ahmedabad 380015", passportNum: "P9012345" },
    ],
    boiConfirmationNum: undefined,
    boiConfirmDocUploaded: false,
    boiNotes: "BOI to begin after EIN received.",
    mercuryChecklist: MERCURY_CHECKLIST_TEMPLATE(),
    mercuryAccountNum: undefined,
    mercuryRoutingNum: undefined,
    mercuryApprovedDate: undefined,
    stripeChecklist: STRIPE_CHECKLIST_TEMPLATE(),
    stripeAccountId: undefined,
    stripeApprovedDate: undefined,
    bankingNotes: "",
    complianceCalendarDelivered: false,
    documentPackageDelivered: false,
    handoverNotes: "",
    tasks: [
      { id: "mt-010", title: "Complete Articles of Organization draft", assignedTo: "Priya Sharma", due: "2026-03-30", status: "in-progress", priority: "high" },
      { id: "mt-011", title: "Collect Delaware state filing fee from client", assignedTo: "Neha Gupta", due: "2026-03-28", status: "todo", priority: "high" },
    ],
    notes: [],
    tickets: [
      { id: "tk-010", subject: "Articles filing timeline — client requesting update", priority: "medium", status: "open", created: "2026-03-21", lastUpdate: "2026-03-21", notes: "Client asked for ETA on Articles filing." },
    ],
    activityLog: [
      { id: "al-010", timestamp: "2026-03-18T10:00:00Z", type: "stage", description: "Stage 3 (Articles Filing) started", by: "Priya Sharma" },
      { id: "al-011", timestamp: "2026-01-20T14:00:00Z", type: "stage", description: "Stage 2 complete — KYC approved", by: "Arjun Mehta" },
      { id: "al-012", timestamp: "2026-01-15T09:00:00Z", type: "action", description: "Client onboarded — Premium package payment confirmed", by: "System" },
    ],
  },
  {
    id: "FC-003",
    companyName: "SwiftPay Solutions Inc",
    clientName: "Neha Joshi",
    email: "neha@swiftpay.io",
    phone: "+91 97532 10987",
    whatsapp: "+91 97532 10987",
    country: "India",
    state: "Nevada",
    entityType: "C-Corp",
    package: "Basic",
    registeredAgent: "Nevada Registered Agent",
    stage: 2,
    stageName: "KYC & Document Collection",
    stageDates: { 1: "2026-02-28" },
    daysInStage: 3,
    healthScore: 30,
    assignedTo: "Arjun Mehta",
    assignedToInitials: "AM",
    startedAt: "2026-02-28",
    paymentStatus: "paid",
    packageAmount: 399,
    kycStatus: "in-review",
    kycDocs: [
      { id: "kd-020", name: "Passport", required: true, category: "identity", status: "approved", requestedAt: "2026-03-01", uploadedAt: "2026-03-01" },
      { id: "kd-021", name: "Address Proof", required: true, category: "identity", status: "rejected", requestedAt: "2026-03-01", uploadedAt: "2026-03-02", rejectReason: "Document is blurry — please re-upload a clear scan" },
      { id: "kd-022", name: "Selfie with Passport", required: true, category: "identity", status: "requested", requestedAt: "2026-03-01" },
      { id: "kd-023", name: "SSN / ITIN (if applicable)", required: false, category: "identity", status: "not-requested" },
      { id: "kd-024", name: "Additional Document", required: false, category: "identity", status: "not-requested" },
    ],
    kycNotes: "Utility bill re-upload required. Passport is clear.",
    llcEntityNameConfirmed: false,
    llcRegisteredAgentSelected: false,
    llcStateFeeCollected: false,
    articlesState: "not-started",
    operatingAgreement: "pending",
    llcNotes: "",
    einStatus: "not-started",
    einMethod: "-",
    einNotes: "",
    boiStatus: "pending-kyc",
    boiOwners: [
      { id: "bo-020", name: "Neha Joshi", ownership: "100%", dob: "1992-07-04", address: "A-12, Koregaon Park, Pune 411001", passportNum: "M3344556" },
    ],
    boiConfirmationNum: undefined,
    boiConfirmDocUploaded: false,
    boiNotes: "",
    mercuryChecklist: MERCURY_CHECKLIST_TEMPLATE(),
    mercuryAccountNum: undefined,
    mercuryRoutingNum: undefined,
    mercuryApprovedDate: undefined,
    stripeChecklist: STRIPE_CHECKLIST_TEMPLATE(),
    stripeAccountId: undefined,
    stripeApprovedDate: undefined,
    bankingNotes: "",
    complianceCalendarDelivered: false,
    documentPackageDelivered: false,
    handoverNotes: "",
    tasks: [
      { id: "mt-020", title: "Request re-upload of address proof from Neha", assignedTo: "Arjun Mehta", due: "2026-03-27", status: "todo", priority: "high" },
    ],
    notes: [
      { id: "n-020", text: "Sent WhatsApp message to Neha asking for clear address proof scan.", by: "Arjun Mehta", timestamp: "2026-03-23T09:00:00Z" },
    ],
    tickets: [],
    activityLog: [
      { id: "al-020", timestamp: "2026-03-23T09:00:00Z", type: "stage", description: "Stage 2 (KYC) started — documents requested", by: "Arjun Mehta" },
      { id: "al-021", timestamp: "2026-03-02T12:00:00Z", type: "document", description: "Address proof rejected — blurry scan", by: "Arjun Mehta" },
      { id: "al-022", timestamp: "2026-02-28T10:00:00Z", type: "action", description: "Client onboarded — Basic package payment confirmed", by: "System" },
    ],
  },
  {
    id: "FC-004",
    companyName: "DataBridge Analytics LLC",
    clientName: "Vikram Rao",
    email: "vikram@databridge.ai",
    phone: "+91 96543 21098",
    whatsapp: "+91 96543 21098",
    country: "India",
    state: "Wyoming",
    entityType: "LLC",
    package: "Standard",
    registeredAgent: "Wyoming Agents LLC",
    formationDate: "2025-12-10",
    stage: 5,
    stageName: "BOI Filing",
    stageDates: { 1: "2025-11-20", 2: "2025-11-28", 3: "2025-12-10", 4: "2026-01-20" },
    daysInStage: 5,
    healthScore: 88,
    assignedTo: "Arjun Mehta",
    assignedToInitials: "AM",
    startedAt: "2025-11-20",
    paymentStatus: "paid",
    packageAmount: 799,
    kycStatus: "approved",
    kycDocs: [
      { id: "kd-030", name: "Passport", required: true, category: "identity", status: "approved", requestedAt: "2025-11-22", uploadedAt: "2025-11-25" },
      { id: "kd-031", name: "Address Proof", required: true, category: "identity", status: "approved", requestedAt: "2025-11-22", uploadedAt: "2025-11-25" },
      { id: "kd-032", name: "Selfie with Passport", required: true, category: "identity", status: "approved", requestedAt: "2025-11-22", uploadedAt: "2025-11-26" },
      { id: "kd-033", name: "SSN / ITIN (if applicable)", required: false, category: "identity", status: "not-requested" },
      { id: "kd-034", name: "Additional Document", required: false, category: "identity", status: "not-requested" },
    ],
    kycNotes: "KYC approved Nov 28, 2025.",
    llcEntityNameConfirmed: true,
    llcRegisteredAgentSelected: true,
    llcStateFeeCollected: true,
    articlesState: "stamped",
    articlesFiledDate: "2025-12-05",
    articlesApprovedDate: "2025-12-10",
    operatingAgreement: "signed",
    llcNotes: "Articles approved. Operating Agreement reviewed and signed by client.",
    einStatus: "received",
    einNumber: "92-8765432",
    einSubmittedDate: "2025-12-15",
    einReceivedDate: "2026-01-20",
    einMethod: "Online",
    einNotes: "EIN received online same-day. CP 575 uploaded to client vault.",
    boiStatus: "draft-ready",
    boiOwners: [
      { id: "bo-030", name: "Vikram Rao", ownership: "60%", dob: "1980-11-30", address: "Flat 5B, Jubilee Hills, Hyderabad 500033", passportNum: "A9988776" },
      { id: "bo-031", name: "Ananya Rao", ownership: "40%", dob: "1983-06-15", address: "Flat 5B, Jubilee Hills, Hyderabad 500033", passportNum: "A7766554" },
    ],
    boiConfirmationNum: undefined,
    boiConfirmDocUploaded: false,
    boiNotes: "BOI in progress. Collecting owner information. Filing due by Apr 15.",
    mercuryChecklist: MERCURY_CHECKLIST_TEMPLATE(),
    mercuryAccountNum: undefined,
    mercuryRoutingNum: undefined,
    mercuryApprovedDate: undefined,
    stripeChecklist: STRIPE_CHECKLIST_TEMPLATE(),
    stripeAccountId: undefined,
    stripeApprovedDate: undefined,
    bankingNotes: "Mercury application queued after BOI filing.",
    complianceCalendarDelivered: false,
    documentPackageDelivered: false,
    handoverNotes: "",
    tasks: [
      { id: "mt-030", title: "Collect BOI owner details from Vikram", assignedTo: "Arjun Mehta", due: "2026-03-28", status: "todo", priority: "high" },
      { id: "mt-031", title: "File BOI report with FinCEN", assignedTo: "Arjun Mehta", due: "2026-04-10", status: "todo", priority: "high" },
    ],
    notes: [],
    tickets: [],
    activityLog: [
      { id: "al-030", timestamp: "2026-03-21T09:00:00Z", type: "stage", description: "Stage 5 (BOI Filing) started", by: "Arjun Mehta" },
      { id: "al-031", timestamp: "2026-01-20T10:00:00Z", type: "stage", description: "EIN received — 92-8765432", by: "System" },
      { id: "al-032", timestamp: "2025-12-10T14:00:00Z", type: "stage", description: "Articles of Organization approved by Wyoming SOS", by: "Priya Sharma" },
      { id: "al-033", timestamp: "2025-11-28T11:00:00Z", type: "stage", description: "KYC approved", by: "Arjun Mehta" },
    ],
  },
  {
    id: "FC-005",
    companyName: "UrbanNest Realty Corp",
    clientName: "Priya Singh",
    email: "priya@urbannest.co",
    phone: "+91 94321 00987",
    whatsapp: "+91 94321 00987",
    country: "India",
    state: "Texas",
    entityType: "C-Corp",
    package: "Premium",
    stage: 1,
    stageName: "Payment & Package Selection",
    stageDates: {},
    daysInStage: 1,
    healthScore: 12,
    assignedTo: "Neha Gupta",
    assignedToInitials: "NG",
    startedAt: "2026-03-25",
    paymentStatus: "paid",
    packageAmount: 1499,
    kycStatus: "not-started",
    kycDocs: [
      { id: "kd-050", name: "Passport", required: true, category: "identity", status: "not-requested" },
      { id: "kd-051", name: "Address Proof", required: true, category: "identity", status: "not-requested" },
      { id: "kd-052", name: "Selfie with Passport", required: true, category: "identity", status: "not-requested" },
      { id: "kd-053", name: "SSN / ITIN (if applicable)", required: false, category: "identity", status: "not-requested" },
      { id: "kd-054", name: "Additional Document", required: false, category: "identity", status: "not-requested" },
    ],
    kycNotes: "KYC documents not yet requested.",
    llcEntityNameConfirmed: false,
    llcRegisteredAgentSelected: false,
    llcStateFeeCollected: false,
    articlesState: "not-started",
    operatingAgreement: "pending",
    llcNotes: "",
    einStatus: "not-started",
    einMethod: "-",
    einNotes: "",
    boiStatus: "not-started",
    boiOwners: [
      { id: "bo-050", name: "Priya Singh", ownership: "100%", dob: "1991-02-19", address: "401, Sector 15, Gurgaon 122001", passportNum: "J5544332" },
    ],
    boiConfirmationNum: undefined,
    boiConfirmDocUploaded: false,
    boiNotes: "",
    mercuryChecklist: MERCURY_CHECKLIST_TEMPLATE(),
    mercuryAccountNum: undefined,
    mercuryRoutingNum: undefined,
    mercuryApprovedDate: undefined,
    stripeChecklist: STRIPE_CHECKLIST_TEMPLATE(),
    stripeAccountId: undefined,
    stripeApprovedDate: undefined,
    bankingNotes: "",
    complianceCalendarDelivered: false,
    documentPackageDelivered: false,
    handoverNotes: "",
    tasks: [
      { id: "mt-050", title: "Send KYC document checklist to Priya Singh", assignedTo: "Neha Gupta", due: "2026-03-27", status: "todo", priority: "high" },
    ],
    notes: [],
    tickets: [],
    activityLog: [
      { id: "al-050", timestamp: "2026-03-25T10:00:00Z", type: "action", description: "Client onboarded — Premium package payment confirmed", by: "System" },
    ],
  },
  {
    id: "FC-006",
    companyName: "NovaTech AI Inc",
    clientName: "Deepak Verma",
    email: "deepak@novatech.ai",
    phone: "+91 99001 55432",
    whatsapp: "+91 99001 55432",
    country: "India",
    state: "Delaware",
    entityType: "C-Corp",
    package: "Standard",
    registeredAgent: "Delaware Registered Agent",
    formationDate: "2025-11-15",
    stage: 6,
    stageName: "Banking & Stripe Setup",
    stageDates: { 1: "2025-10-05", 2: "2025-10-12", 3: "2025-11-15", 4: "2025-12-10", 5: "2026-01-28" },
    daysInStage: 4,
    healthScore: 92,
    assignedTo: "Priya Sharma",
    assignedToInitials: "PS",
    startedAt: "2025-10-05",
    paymentStatus: "paid",
    packageAmount: 799,
    kycStatus: "approved",
    kycDocs: [
      { id: "kd-060", name: "Passport", required: true, category: "identity", status: "approved", requestedAt: "2025-10-06", uploadedAt: "2025-10-10" },
      { id: "kd-061", name: "Address Proof", required: true, category: "identity", status: "approved", requestedAt: "2025-10-06", uploadedAt: "2025-10-11" },
      { id: "kd-062", name: "Selfie with Passport", required: true, category: "identity", status: "approved", requestedAt: "2025-10-06", uploadedAt: "2025-10-12" },
      { id: "kd-063", name: "SSN / ITIN (if applicable)", required: false, category: "identity", status: "not-requested" },
      { id: "kd-064", name: "Additional Document", required: false, category: "identity", status: "not-requested" },
    ],
    kycNotes: "KYC approved Oct 12, 2025.",
    llcEntityNameConfirmed: true,
    llcRegisteredAgentSelected: true,
    llcStateFeeCollected: true,
    articlesState: "stamped",
    articlesFiledDate: "2025-11-10",
    articlesApprovedDate: "2025-11-15",
    operatingAgreement: "signed",
    llcNotes: "Articles of Incorporation approved by Delaware.",
    einStatus: "received",
    einNumber: "88-9123456",
    einSubmittedDate: "2025-11-20",
    einReceivedDate: "2025-12-10",
    einMethod: "Fax",
    einNotes: "EIN 88-9123456 received via fax confirmation letter.",
    boiStatus: "filed",
    boiOwners: [
      { id: "bo-060", name: "Deepak Verma", ownership: "55%", dob: "1979-08-22", address: "C-301, Powai, Mumbai 400076", passportNum: "G1122334" },
      { id: "bo-061", name: "Simran Verma", ownership: "25%", dob: "1982-12-01", address: "C-301, Powai, Mumbai 400076", passportNum: "G3344556" },
      { id: "bo-062", name: "Kiran Holdings Ltd", ownership: "20%", dob: "", address: "Mauritius", passportNum: "N/A (Corporate)" },
    ],
    boiFiledDate: "2026-01-28",
    boiConfirmationNum: "FIN-2026-88912",
    boiConfirmDocUploaded: true,
    boiNotes: "BOI filed with FinCEN on Jan 28. Tracking number: FIN-2026-88912.",
    mercuryChecklist: [
      { id: "m1", label: "KYC docs sent to Mercury (passport, EIN letter, articles)", done: true, date: "2026-03-15" },
      { id: "m2", label: "Mercury online application submitted", done: true, date: "2026-03-22" },
      { id: "m3", label: "Mercury KYC approved by bank", done: false },
      { id: "m4", label: "Account details received (account + routing number)", done: false },
    ],
    mercuryAccountNum: undefined,
    mercuryRoutingNum: undefined,
    mercuryApprovedDate: undefined,
    stripeChecklist: STRIPE_CHECKLIST_TEMPLATE(),
    stripeAccountId: undefined,
    stripeApprovedDate: undefined,
    bankingNotes: "Mercury application submitted Mar 22. Stripe to follow after Mercury approval.",
    complianceCalendarDelivered: false,
    documentPackageDelivered: false,
    handoverNotes: "",
    tasks: [
      { id: "mt-060", title: "Follow up Mercury account approval", assignedTo: "Priya Sharma", due: "2026-03-30", status: "in-progress", priority: "high" },
      { id: "mt-061", title: "Initiate Stripe business account", assignedTo: "Priya Sharma", due: "2026-04-05", status: "todo", priority: "medium" },
    ],
    notes: [],
    tickets: [],
    activityLog: [
      { id: "al-060", timestamp: "2026-03-22T10:00:00Z", type: "action", description: "Mercury bank application submitted", by: "Priya Sharma" },
      { id: "al-061", timestamp: "2026-01-28T14:00:00Z", type: "stage", description: "BOI filed with FinCEN — tracking #FIN-2026-88912", by: "Arjun Mehta" },
      { id: "al-062", timestamp: "2025-12-10T10:00:00Z", type: "stage", description: "EIN 88-9123456 received", by: "System" },
      { id: "al-063", timestamp: "2025-11-15T14:00:00Z", type: "stage", description: "Articles of Incorporation approved", by: "Priya Sharma" },
    ],
  },
  {
    id: "FC-007",
    companyName: "CloudBase Corp",
    clientName: "Ravi Mehta",
    email: "ravi@cloudbase.io",
    phone: "+91 99321 54321",
    whatsapp: "+91 99321 54321",
    country: "India",
    state: "Wyoming",
    entityType: "C-Corp",
    package: "Standard",
    registeredAgent: "Wyoming Agents LLC",
    formationDate: "2025-08-15",
    stage: 7,
    stageName: "Compliance & Handover",
    stageDates: { 1: "2025-06-01", 2: "2025-06-15", 3: "2025-08-15", 4: "2025-09-02", 5: "2025-09-18", 6: "2025-10-12" },
    daysInStage: 0,
    healthScore: 100,
    assignedTo: "Priya Sharma",
    assignedToInitials: "PS",
    startedAt: "2025-06-01",
    paymentStatus: "paid",
    packageAmount: 799,
    kycStatus: "approved",
    kycDocs: [
      { id: "kd-070", name: "Passport", required: true, category: "identity", status: "approved", requestedAt: "2025-06-02", uploadedAt: "2025-06-10" },
      { id: "kd-071", name: "Address Proof", required: true, category: "identity", status: "approved", requestedAt: "2025-06-02", uploadedAt: "2025-06-10" },
      { id: "kd-072", name: "Selfie with Passport", required: true, category: "identity", status: "approved", requestedAt: "2025-06-02", uploadedAt: "2025-06-15" },
      { id: "kd-073", name: "SSN / ITIN (if applicable)", required: false, category: "identity", status: "not-requested" },
      { id: "kd-074", name: "Additional Document", required: false, category: "identity", status: "not-requested" },
    ],
    kycNotes: "KYC approved June 15, 2025.",
    llcEntityNameConfirmed: true,
    llcRegisteredAgentSelected: true,
    llcStateFeeCollected: true,
    articlesState: "stamped",
    articlesFiledDate: "2025-08-10",
    articlesApprovedDate: "2025-08-15",
    operatingAgreement: "signed",
    llcNotes: "Articles of Incorporation filed in Wyoming. Complete.",
    einStatus: "received",
    einNumber: "92-7654321",
    einSubmittedDate: "2025-09-01",
    einReceivedDate: "2025-09-02",
    einMethod: "Online",
    einNotes: "EIN received online same-day.",
    boiStatus: "filed",
    boiOwners: [
      { id: "bo-070", name: "Ravi Mehta", ownership: "100%", dob: "1985-04-12", address: "C-501, Bandra West, Mumbai 400050", passportNum: "Z9876543" },
    ],
    boiFiledDate: "2025-09-18",
    boiConfirmationNum: "FIN-2025-92761",
    boiConfirmDocUploaded: true,
    boiNotes: "BOI filed Sep 18, 2025.",
    mercuryChecklist: [
      { id: "m1", label: "KYC docs sent to Mercury (passport, EIN letter, articles)", done: true, date: "2025-09-20" },
      { id: "m2", label: "Mercury online application submitted", done: true, date: "2025-09-22" },
      { id: "m3", label: "Mercury KYC approved by bank", done: true, date: "2025-10-05" },
      { id: "m4", label: "Account details received (account + routing number)", done: true, date: "2025-10-05" },
    ],
    mercuryAccountNum: "4521987630",
    mercuryRoutingNum: "021000089",
    mercuryApprovedDate: "2025-10-05",
    stripeChecklist: [
      { id: "s1", label: "Stripe business account application submitted", done: true, date: "2025-10-06" },
      { id: "s2", label: "Business identity verified by Stripe", done: true, date: "2025-10-10" },
      { id: "s3", label: "Stripe account activated and in good standing", done: true, date: "2025-10-12" },
      { id: "s4", label: "Payment method / bank account added", done: true, date: "2025-10-12" },
    ],
    stripeAccountId: "acct_CB7823K912",
    stripeApprovedDate: "2025-10-12",
    bankingNotes: "Mercury and Stripe both active.",
    complianceCalendarDelivered: true,
    documentPackageDelivered: true,
    handoverNotes: "Formation complete. Annual report due May 1, 2026.",
    tasks: [
      { id: "mt-070", title: "Annual report filing reminder for CloudBase", assignedTo: "Priya Sharma", due: "2026-04-20", status: "todo", priority: "medium" },
    ],
    notes: [
      { id: "n-070", text: "All formation documents delivered to client. Annual compliance calendar shared.", by: "Priya Sharma", timestamp: "2025-10-28T16:00:00Z" },
    ],
    tickets: [
      { id: "tk-070", subject: "Annual report filing — Wyoming due May 1", priority: "medium", status: "open", created: "2026-03-01", lastUpdate: "2026-03-01", notes: "Client notified. Will file before May 1." },
    ],
    activityLog: [
      { id: "al-070", timestamp: "2025-10-28T16:00:00Z", type: "stage", description: "Stage 7 complete — Compliance calendar & document package delivered", by: "Priya Sharma" },
      { id: "al-071", timestamp: "2025-10-15T10:00:00Z", type: "stage", description: "Banking setup complete — Mercury & Stripe approved", by: "Priya Sharma" },
      { id: "al-072", timestamp: "2025-09-20T14:00:00Z", type: "stage", description: "BOI filed with FinCEN", by: "Arjun Mehta" },
      { id: "al-073", timestamp: "2025-09-02T10:00:00Z", type: "stage", description: "EIN 92-7654321 received online", by: "System" },
    ],
  },
  {
    id: "FC-008",
    companyName: "MediCare Solutions LLC",
    clientName: "Sunita Agarwal",
    email: "sunita@medicaresol.com",
    phone: "+91 98123 45670",
    whatsapp: "+91 98123 45670",
    country: "India",
    state: "Florida",
    entityType: "LLC",
    package: "Premium",
    registeredAgent: "Florida Registered Agent Services",
    formationDate: "2025-10-05",
    stage: 7,
    stageName: "Compliance & Handover",
    stageDates: { 1: "2025-09-01", 2: "2025-09-10", 3: "2025-10-05", 4: "2025-10-25", 5: "2025-11-10", 6: "2025-12-05" },
    daysInStage: 0,
    healthScore: 100,
    assignedTo: "Deepak Verma",
    assignedToInitials: "DV",
    startedAt: "2025-09-01",
    paymentStatus: "paid",
    packageAmount: 1499,
    kycStatus: "approved",
    kycDocs: [
      { id: "kd-080", name: "Passport", required: true, category: "identity", status: "approved", requestedAt: "2025-09-02", uploadedAt: "2025-09-08" },
      { id: "kd-081", name: "Address Proof", required: true, category: "identity", status: "approved", requestedAt: "2025-09-02", uploadedAt: "2025-09-08" },
      { id: "kd-082", name: "Selfie with Passport", required: true, category: "identity", status: "approved", requestedAt: "2025-09-02", uploadedAt: "2025-09-09" },
      { id: "kd-083", name: "SSN / ITIN (if applicable)", required: false, category: "identity", status: "not-requested" },
      { id: "kd-084", name: "Additional Document", required: false, category: "identity", status: "not-requested" },
    ],
    kycNotes: "KYC approved Sept 10.",
    llcEntityNameConfirmed: true,
    llcRegisteredAgentSelected: true,
    llcStateFeeCollected: true,
    articlesState: "stamped",
    articlesFiledDate: "2025-09-30",
    articlesApprovedDate: "2025-10-05",
    operatingAgreement: "signed",
    llcNotes: "Articles filed in Florida. Complete.",
    einStatus: "received",
    einNumber: "65-4321987",
    einSubmittedDate: "2025-10-10",
    einReceivedDate: "2025-10-25",
    einMethod: "Fax",
    einNotes: "EIN 65-4321987 received via fax.",
    boiStatus: "filed",
    boiOwners: [
      { id: "bo-080", name: "Sunita Agarwal", ownership: "100%", dob: "1977-11-08", address: "D-5, Vasant Kunj, New Delhi 110070", passportNum: "K8877665" },
    ],
    boiFiledDate: "2025-11-10",
    boiConfirmationNum: "FIN-2025-65432",
    boiConfirmDocUploaded: true,
    boiNotes: "BOI filed Nov 10, 2025.",
    mercuryChecklist: [
      { id: "m1", label: "KYC docs sent to Mercury (passport, EIN letter, articles)", done: true, date: "2025-11-12" },
      { id: "m2", label: "Mercury online application submitted", done: true, date: "2025-11-15" },
      { id: "m3", label: "Mercury KYC approved by bank", done: true, date: "2025-11-28" },
      { id: "m4", label: "Account details received (account + routing number)", done: true, date: "2025-11-28" },
    ],
    mercuryAccountNum: "7734512890",
    mercuryRoutingNum: "021000089",
    mercuryApprovedDate: "2025-11-28",
    stripeChecklist: [
      { id: "s1", label: "Stripe business account application submitted", done: true, date: "2025-11-30" },
      { id: "s2", label: "Business identity verified by Stripe", done: true, date: "2025-12-03" },
      { id: "s3", label: "Stripe account activated and in good standing", done: true, date: "2025-12-05" },
      { id: "s4", label: "Payment method / bank account added", done: true, date: "2025-12-05" },
    ],
    stripeAccountId: "acct_MC4412X887",
    stripeApprovedDate: "2025-12-05",
    bankingNotes: "Mercury and Stripe both active since Dec 2025.",
    complianceCalendarDelivered: true,
    documentPackageDelivered: true,
    handoverNotes: "Formation complete. Tax filing in progress.",
    tasks: [],
    notes: [
      { id: "n-080", text: "Full document package delivered to client. Recommended starting tax filing setup.", by: "Deepak Verma", timestamp: "2025-12-20T14:00:00Z" },
    ],
    tickets: [],
    activityLog: [
      { id: "al-080", timestamp: "2025-12-20T14:00:00Z", type: "stage", description: "Stage 7 complete — Full document package delivered", by: "Deepak Verma" },
      { id: "al-081", timestamp: "2025-12-01T10:00:00Z", type: "stage", description: "Mercury & Stripe setup completed", by: "Priya Sharma" },
      { id: "al-082", timestamp: "2025-11-10T14:00:00Z", type: "stage", description: "BOI filed with FinCEN", by: "Arjun Mehta" },
    ],
  },
];
