import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { DataTable, type Column } from "@/components/ds/data-table";
import {
  PageShell,
  PageHeader,
  DetailModal,
  DetailSection,
  IndexToolbar,
} from "@/components/layout";
import {
  FileText,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Ban,
  CalendarDays,
  Target,
  Flag,
  MessageSquare,
} from "lucide-react";

const BRAND_COLOR = "#6366F1";

type ProjectStatus = "On Track" | "At Risk" | "Blocked";

interface Milestone {
  title: string;
  date: string;
  completed: boolean;
}

interface ProjectReport {
  id: string;
  verticalName: string;
  currentSprintFocus: string;
  completionPct: number;
  status: ProjectStatus;
  lastUpdated: string;
  blockers: string;
  lead: string;
  timeline: string;
  milestones: Milestone[];
  notes: string;
}

const statusConfig: Record<ProjectStatus, { variant: "default" | "secondary" | "destructive" | "outline"; className: string }> = {
  "On Track": { variant: "default", className: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-0" },
  "At Risk": { variant: "default", className: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-0" },
  "Blocked": { variant: "default", className: "bg-red-500/15 text-red-700 dark:text-red-400 border-0" },
};

const mockProjectReports: ProjectReport[] = [
  {
    id: "1",
    verticalName: "HRMS",
    currentSprintFocus: "Payroll module & attendance integration",
    completionPct: 82,
    status: "On Track",
    lastUpdated: "2025-06-08",
    blockers: "None",
    lead: "Priya Sharma",
    timeline: "Jan 2025 - Aug 2025",
    milestones: [
      { title: "Employee onboarding flow", date: "2025-02-15", completed: true },
      { title: "Leave management system", date: "2025-03-30", completed: true },
      { title: "Payroll processing engine", date: "2025-06-15", completed: false },
      { title: "Performance review module", date: "2025-07-30", completed: false },
    ],
    notes: "Payroll module is ahead of schedule. Attendance biometric integration pending vendor API access. Performance review templates finalized.",
  },
  {
    id: "2",
    verticalName: "CRM",
    currentSprintFocus: "Deal pipeline & email template builder",
    completionPct: 74,
    status: "On Track",
    lastUpdated: "2025-06-07",
    blockers: "None",
    lead: "Ravi Patel",
    timeline: "Feb 2025 - Sep 2025",
    milestones: [
      { title: "Contact management", date: "2025-03-10", completed: true },
      { title: "Lead scoring engine", date: "2025-04-20", completed: true },
      { title: "Pipeline automation", date: "2025-06-30", completed: false },
      { title: "Analytics dashboard", date: "2025-08-15", completed: false },
    ],
    notes: "Deal pipeline drag-and-drop working well. Email template builder needs rich text editor improvements. Integration with marketing vertical planned for Q3.",
  },
  {
    id: "3",
    verticalName: "ATS (Applicant Tracking)",
    currentSprintFocus: "Interview scheduling & evaluation forms",
    completionPct: 68,
    status: "At Risk",
    lastUpdated: "2025-06-06",
    blockers: "Calendar API rate limits causing scheduling delays",
    lead: "Anita Desai",
    timeline: "Mar 2025 - Oct 2025",
    milestones: [
      { title: "Job posting engine", date: "2025-04-01", completed: true },
      { title: "Candidate pipeline", date: "2025-05-15", completed: true },
      { title: "Interview scheduling", date: "2025-07-01", completed: false },
      { title: "Offer management", date: "2025-09-01", completed: false },
    ],
    notes: "Calendar integration hitting rate limits. Evaluating alternative APIs. Candidate pipeline is stable and well-received by hiring managers.",
  },
  {
    id: "4",
    verticalName: "Faire (Wholesale)",
    currentSprintFocus: "Order fulfillment & shipment tracking",
    completionPct: 71,
    status: "On Track",
    lastUpdated: "2025-06-08",
    blockers: "None",
    lead: "Lakshay Takkar",
    timeline: "Jan 2025 - Sep 2025",
    milestones: [
      { title: "Product catalog sync", date: "2025-02-28", completed: true },
      { title: "Retailer portal", date: "2025-04-15", completed: true },
      { title: "Shipment tracking", date: "2025-07-15", completed: false },
      { title: "Analytics & reporting", date: "2025-08-30", completed: false },
    ],
    notes: "Faire API integration stable. Retailer portal launched with positive feedback. Working on real-time shipment tracking with carrier APIs.",
  },
  {
    id: "5",
    verticalName: "Finance",
    currentSprintFocus: "Intercompany reconciliation & tax compliance",
    completionPct: 60,
    status: "At Risk",
    lastUpdated: "2025-06-05",
    blockers: "Waiting on tax compliance rules for MENA region",
    lead: "Karan Mehta",
    timeline: "Feb 2025 - Nov 2025",
    milestones: [
      { title: "Chart of accounts setup", date: "2025-03-15", completed: true },
      { title: "Transaction ledger", date: "2025-05-01", completed: true },
      { title: "Intercompany transfers", date: "2025-07-30", completed: false },
      { title: "Tax compliance engine", date: "2025-10-15", completed: false },
    ],
    notes: "Core ledger and cashbook operational. Intercompany module requires multi-currency reconciliation. Tax rules for India and USA complete, MENA rules pending legal review.",
  },
  {
    id: "6",
    verticalName: "OMS (Order Management)",
    currentSprintFocus: "Returns workflow & inventory alerts",
    completionPct: 77,
    status: "On Track",
    lastUpdated: "2025-06-07",
    blockers: "None",
    lead: "Neha Gupta",
    timeline: "Jan 2025 - Aug 2025",
    milestones: [
      { title: "Order processing engine", date: "2025-02-20", completed: true },
      { title: "Inventory management", date: "2025-04-10", completed: true },
      { title: "Returns & refunds", date: "2025-06-20", completed: false },
      { title: "Supplier portal", date: "2025-07-30", completed: false },
    ],
    notes: "Order processing and inventory tracking live. Returns workflow 70% complete. Low-stock alerts being tested with Shopify webhook integration.",
  },
  {
    id: "7",
    verticalName: "ETS (EazyToSell)",
    currentSprintFocus: "Proposal builder & pricing calculator",
    completionPct: 55,
    status: "At Risk",
    lastUpdated: "2025-06-04",
    blockers: "Pricing model complexity - 47 variables to account for",
    lead: "Vikram Singh",
    timeline: "Mar 2025 - Nov 2025",
    milestones: [
      { title: "Client intake forms", date: "2025-04-15", completed: true },
      { title: "Pipeline dashboard", date: "2025-05-30", completed: true },
      { title: "Pricing calculator", date: "2025-08-01", completed: false },
      { title: "Automated proposals", date: "2025-10-01", completed: false },
    ],
    notes: "Pipeline and client management stable. Pricing calculator is the most complex module - involves margins, shipping, customs, and multi-currency conversion. Needs dedicated sprint.",
  },
  {
    id: "8",
    verticalName: "Social Media",
    currentSprintFocus: "Content calendar & approval workflows",
    completionPct: 65,
    status: "On Track",
    lastUpdated: "2025-06-06",
    blockers: "None",
    lead: "Meera Joshi",
    timeline: "Feb 2025 - Sep 2025",
    milestones: [
      { title: "Post composer", date: "2025-03-20", completed: true },
      { title: "Content calendar", date: "2025-05-15", completed: true },
      { title: "Approval workflows", date: "2025-07-15", completed: false },
      { title: "Analytics integration", date: "2025-08-30", completed: false },
    ],
    notes: "Post composer supports multi-platform scheduling. Calendar view well-received. Approval workflow needs role-based access control integration.",
  },
  {
    id: "9",
    verticalName: "EventHub",
    currentSprintFocus: "Venue management & budget tracking",
    completionPct: 58,
    status: "On Track",
    lastUpdated: "2025-06-05",
    blockers: "None",
    lead: "Arjun Nair",
    timeline: "Mar 2025 - Oct 2025",
    milestones: [
      { title: "Event creation wizard", date: "2025-04-10", completed: true },
      { title: "Attendee management", date: "2025-05-25", completed: true },
      { title: "Venue booking system", date: "2025-07-30", completed: false },
      { title: "Budget & analytics", date: "2025-09-15", completed: false },
    ],
    notes: "Event creation and attendee management functional. Venue booking requires calendar conflict detection. Check-in QR code system prototype ready.",
  },
  {
    id: "10",
    verticalName: "GoyoTours (Events)",
    currentSprintFocus: "Package builder & hotel integration",
    completionPct: 62,
    status: "On Track",
    lastUpdated: "2025-06-07",
    blockers: "None",
    lead: "Sanya Kapoor",
    timeline: "Feb 2025 - Oct 2025",
    milestones: [
      { title: "Tour package catalog", date: "2025-03-25", completed: true },
      { title: "Booking engine", date: "2025-05-20", completed: true },
      { title: "Hotel API integration", date: "2025-08-01", completed: false },
      { title: "Vendor payments", date: "2025-09-15", completed: false },
    ],
    notes: "Package creation and booking flow complete. Working on hotel availability API. Lead capture from website inquiries performing well.",
  },
  {
    id: "11",
    verticalName: "Sales (USDrop)",
    currentSprintFocus: "User analytics & subscription management",
    completionPct: 85,
    status: "On Track",
    lastUpdated: "2025-06-08",
    blockers: "None",
    lead: "Lakshay Takkar",
    timeline: "Dec 2024 - Jul 2025",
    milestones: [
      { title: "Product catalog", date: "2025-01-30", completed: true },
      { title: "Subscription engine", date: "2025-03-15", completed: true },
      { title: "User analytics", date: "2025-05-30", completed: true },
      { title: "Revenue dashboards", date: "2025-06-30", completed: false },
    ],
    notes: "Most mature vertical. Subscription management and user analytics live. Revenue dashboards in final review. LMS content module added for free learning resources.",
  },
  {
    id: "12",
    verticalName: "Admin",
    currentSprintFocus: "Team management & system settings",
    completionPct: 90,
    status: "On Track",
    lastUpdated: "2025-06-08",
    blockers: "None",
    lead: "Lakshay Takkar",
    timeline: "Dec 2024 - Jun 2025",
    milestones: [
      { title: "User management", date: "2025-01-15", completed: true },
      { title: "Role-based access", date: "2025-02-28", completed: true },
      { title: "System settings", date: "2025-04-15", completed: true },
      { title: "Audit logging", date: "2025-06-15", completed: false },
    ],
    notes: "Admin panel nearly complete. User management, RBAC, and settings all live. Audit logging is the final piece before v1 sign-off.",
  },
  {
    id: "13",
    verticalName: "Developer Portal",
    currentSprintFocus: "Project board & skill library",
    completionPct: 72,
    status: "On Track",
    lastUpdated: "2025-06-07",
    blockers: "None",
    lead: "Amit Verma",
    timeline: "Feb 2025 - Aug 2025",
    milestones: [
      { title: "Project management", date: "2025-03-20", completed: true },
      { title: "Task board (Kanban)", date: "2025-05-01", completed: true },
      { title: "Skill library", date: "2025-06-30", completed: false },
      { title: "Design system docs", date: "2025-07-30", completed: false },
    ],
    notes: "Project and task management fully operational. Skill library being populated. Design system documentation will reference component patterns from this codebase.",
  },
  {
    id: "14",
    verticalName: "Vendor Portal",
    currentSprintFocus: "Quotation management & ledger view",
    completionPct: 45,
    status: "Blocked",
    lastUpdated: "2025-06-03",
    blockers: "Vendor onboarding flow depends on Faire API vendor endpoints not yet available",
    lead: "Pooja Reddy",
    timeline: "Apr 2025 - Dec 2025",
    milestones: [
      { title: "Vendor registration", date: "2025-05-15", completed: true },
      { title: "Quotation system", date: "2025-07-01", completed: false },
      { title: "Ledger & payments", date: "2025-09-01", completed: false },
      { title: "Self-service portal", date: "2025-11-01", completed: false },
    ],
    notes: "Vendor registration complete but onboarding flow blocked on Faire vendor API. Quotation system UI ready but needs backend integration. Prioritizing ledger view as workaround.",
  },
  {
    id: "15",
    verticalName: "LegalNations Portal",
    currentSprintFocus: "Document vault & invoice tracking",
    completionPct: 52,
    status: "On Track",
    lastUpdated: "2025-06-06",
    blockers: "None",
    lead: "Deepak Malhotra",
    timeline: "Apr 2025 - Nov 2025",
    milestones: [
      { title: "Company dashboard", date: "2025-05-10", completed: true },
      { title: "Document management", date: "2025-06-30", completed: false },
      { title: "Invoice tracking", date: "2025-08-15", completed: false },
      { title: "Client messaging", date: "2025-10-01", completed: false },
    ],
    notes: "Client portal dashboard live. Document vault supports file uploads and categorization. Invoice tracking will integrate with Finance vertical for reconciliation.",
  },
  {
    id: "16",
    verticalName: "Suprans (Inbound Ops)",
    currentSprintFocus: "Assignment routing & enrichment pipeline",
    completionPct: 48,
    status: "At Risk",
    lastUpdated: "2025-06-04",
    blockers: "Data enrichment API (Clearbit) pricing negotiation ongoing",
    lead: "Rohit Khanna",
    timeline: "Apr 2025 - Nov 2025",
    milestones: [
      { title: "Inbound lead capture", date: "2025-05-20", completed: true },
      { title: "Assignment rules engine", date: "2025-07-15", completed: false },
      { title: "Data enrichment", date: "2025-09-01", completed: false },
      { title: "Reporting dashboard", date: "2025-10-15", completed: false },
    ],
    notes: "Inbound capture working with web forms and email parsing. Assignment routing rules engine in design phase. Clearbit vs ZoomInfo evaluation for data enrichment - cost analysis pending.",
  },
];

const STATUS_OPTIONS = ["On Track", "At Risk", "Blocked"];

function StatusBadgeCell({ status }: { status: ProjectStatus }) {
  const config = statusConfig[status];
  const IconComp = status === "On Track" ? CheckCircle2 : status === "At Risk" ? AlertTriangle : Ban;
  return (
    <Badge variant={config.variant} className={config.className}>
      <IconComp className="size-3 mr-1" />
      {status}
    </Badge>
  );
}

export default function RndProjectReports() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedReport, setSelectedReport] = useState<ProjectReport | null>(null);

  const filtered = useMemo(() => {
    let result = [...mockProjectReports];
    if (statusFilter !== "all") {
      result = result.filter((r) => r.status === statusFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (r) =>
          r.verticalName.toLowerCase().includes(q) ||
          r.currentSprintFocus.toLowerCase().includes(q) ||
          r.blockers.toLowerCase().includes(q)
      );
    }
    return result;
  }, [search, statusFilter]);

  const filterOptions = [
    { value: "all", label: "All Statuses", count: mockProjectReports.length },
    ...STATUS_OPTIONS.map((s) => ({
      value: s,
      label: s,
      count: mockProjectReports.filter((r) => r.status === s).length,
    })),
  ];

  const columns: Column<ProjectReport>[] = [
    {
      key: "verticalName",
      header: "Vertical",
      sortable: true,
      render: (item) => (
        <span className="text-sm font-medium" data-testid={`text-vertical-${item.id}`}>
          {item.verticalName}
        </span>
      ),
    },
    {
      key: "currentSprintFocus",
      header: "Current Sprint Focus",
      render: (item) => (
        <span className="text-sm text-muted-foreground line-clamp-1" data-testid={`text-sprint-${item.id}`}>
          {item.currentSprintFocus}
        </span>
      ),
    },
    {
      key: "completionPct",
      header: "Completion",
      sortable: true,
      width: "w-36",
      render: (item) => (
        <div className="flex items-center gap-2" data-testid={`progress-${item.id}`}>
          <Progress value={item.completionPct} className="h-1.5 flex-1" />
          <span className="text-xs font-medium tabular-nums w-8 text-right">{item.completionPct}%</span>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (item) => <StatusBadgeCell status={item.status} />,
    },
    {
      key: "lastUpdated",
      header: "Last Updated",
      sortable: true,
      render: (item) => (
        <span className="text-sm text-muted-foreground" data-testid={`text-updated-${item.id}`}>
          {new Date(item.lastUpdated).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </span>
      ),
    },
    {
      key: "blockers",
      header: "Blockers",
      render: (item) => (
        <span
          className={`text-sm line-clamp-1 ${item.blockers === "None" ? "text-muted-foreground" : "text-red-600 dark:text-red-400"}`}
          data-testid={`text-blockers-${item.id}`}
        >
          {item.blockers}
        </span>
      ),
    },
  ];

  return (
    <PageShell>
      <PageHeader
        title="Project Reports"
        subtitle="Track vertical development status across all 16 verticals"
      />

      <IndexToolbar
        search={search}
        onSearch={setSearch}
        filters={filterOptions}
        activeFilter={statusFilter}
        onFilter={setStatusFilter}
        color={BRAND_COLOR}
        placeholder="Search verticals, sprint focus, blockers..."
      />

      <DataTable
        data={filtered}
        columns={columns}
        searchPlaceholder="Search verticals..."
        onRowClick={(item) => setSelectedReport(item)}
        pageSize={16}
        emptyTitle="No project reports found"
        emptyDescription="Try adjusting your search or filter criteria."
        hideSearch
      />

      {selectedReport && (
        <DetailModal
          open={!!selectedReport}
          onClose={() => setSelectedReport(null)}
          title={selectedReport.verticalName}
          subtitle={`Lead: ${selectedReport.lead}`}
          headerActions={<StatusBadgeCell status={selectedReport.status} />}
          footer={
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <span className="text-xs text-muted-foreground" data-testid="text-modal-updated">
                Last updated: {new Date(selectedReport.lastUpdated).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </span>
              <button
                onClick={() => setSelectedReport(null)}
                className="rounded-lg px-4 py-2 text-sm font-medium text-white"
                style={{ backgroundColor: BRAND_COLOR }}
                data-testid="button-modal-close"
              >
                Close
              </button>
            </div>
          }
        >
          <div className="overflow-y-auto max-h-[65vh]">
            <DetailSection title="Overview">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start gap-2">
                  <Target className="size-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Current Sprint</p>
                    <p className="text-sm font-medium" data-testid="text-detail-sprint">{selectedReport.currentSprintFocus}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CalendarDays className="size-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Timeline</p>
                    <p className="text-sm font-medium" data-testid="text-detail-timeline">{selectedReport.timeline}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Flag className="size-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Completion</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Progress value={selectedReport.completionPct} className="h-2 w-24" />
                      <span className="text-sm font-bold" data-testid="text-detail-completion">{selectedReport.completionPct}%</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <AlertTriangle className="size-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Blockers</p>
                    <p
                      className={`text-sm font-medium ${selectedReport.blockers === "None" ? "" : "text-red-600 dark:text-red-400"}`}
                      data-testid="text-detail-blockers"
                    >
                      {selectedReport.blockers}
                    </p>
                  </div>
                </div>
              </div>
            </DetailSection>

            <DetailSection title="Milestones">
              <div className="space-y-3">
                {selectedReport.milestones.map((ms, idx) => (
                  <div key={idx} className="flex items-center gap-3" data-testid={`milestone-${idx}`}>
                    <div
                      className={`flex items-center justify-center size-6 rounded-full shrink-0 ${
                        ms.completed
                          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {ms.completed ? (
                        <CheckCircle2 className="size-3.5" />
                      ) : (
                        <Clock className="size-3.5" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${ms.completed ? "line-through text-muted-foreground" : "font-medium"}`}>
                        {ms.title}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {new Date(ms.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                  </div>
                ))}
              </div>
            </DetailSection>

            <DetailSection title="Notes">
              <div className="flex items-start gap-2">
                <MessageSquare className="size-4 text-muted-foreground mt-0.5 shrink-0" />
                <p className="text-sm text-muted-foreground leading-relaxed" data-testid="text-detail-notes">
                  {selectedReport.notes}
                </p>
              </div>
            </DetailSection>
          </div>
        </DetailModal>
      )}
    </PageShell>
  );
}
