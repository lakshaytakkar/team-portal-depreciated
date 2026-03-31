import { VerticalReportConfig, ReportTemplate, SubmittedReport } from "./mock-data-reports";

const hrTemplates: ReportTemplate[] = [
  {
    id: "hr-daily-ops",
    name: "Client Ops Daily",
    description: "Daily tracking of client intakes, formations, and compliance tasks",
    scope: "employee",
    frequency: "daily",
    assignedRole: "Operations Associate",
    fields: [
      { id: "new_intakes", label: "New Intakes", type: "number", required: true, unit: "clients" },
      { id: "formations_submitted", label: "Formations Submitted", type: "number", required: true, unit: "filings" },
      { id: "client_comms", label: "Client Communications", type: "number", required: true, unit: "calls/emails" },
      { id: "compliance_tasks", label: "Compliance Tasks", type: "number", required: true, unit: "tasks" },
      { id: "blockers", label: "Blockers", type: "textarea", required: false, placeholder: "Any issues preventing progress?" }
    ]
  },
  {
    id: "hr-weekly-pipeline",
    name: "Formation Pipeline Weekly",
    description: "Weekly summary of the formation pipeline and compliance health",
    scope: "department",
    frequency: "weekly",
    assignedRole: "Operations Manager",
    fields: [
      { id: "total_new_clients", label: "New Clients This Week", type: "number", required: true },
      { id: "completions", label: "Completions", type: "number", required: true },
      { id: "pending_filings", label: "Pending Filings", type: "number", required: true },
      { id: "compliance_issues", label: "Compliance Issues", type: "textarea", required: true },
      { id: "highlights", label: "Weekly Highlights", type: "textarea", required: true },
      { id: "next_week_plan", label: "Next Week Plan", type: "textarea", required: true }
    ]
  }
];

const salesTemplates: ReportTemplate[] = [
  {
    id: "sales-daily",
    name: "Sales Daily",
    description: "Daily sales activity and revenue tracking",
    scope: "employee",
    frequency: "daily",
    assignedRole: "Sales Executive",
    fields: [
      { id: "calls", label: "Calls Made", type: "number", required: true },
      { id: "demos", label: "Demos Conducted", type: "number", required: true },
      { id: "signups", label: "New Signups", type: "number", required: true },
      { id: "revenue", label: "Revenue (₹)", type: "number", required: true, unit: "₹" },
      { id: "notes", label: "Notes", type: "textarea", required: false }
    ]
  },
  {
    id: "sales-weekly-store",
    name: "Store Weekly",
    description: "Weekly performance across all active stores",
    scope: "department",
    frequency: "weekly",
    assignedRole: "Sales Manager",
    fields: [
      { id: "active_stores", label: "Active Stores", type: "number", required: true },
      { id: "weekly_signups", label: "Weekly Signups", type: "number", required: true },
      { id: "mrr", label: "MRR (₹)", type: "number", required: true, unit: "₹" },
      { id: "churn", label: "Churned Stores", type: "number", required: true },
      { id: "wins", label: "Key Wins", type: "textarea", required: true },
      { id: "blockers", label: "Blockers", type: "textarea", required: true }
    ]
  }
];

const eventsTemplates: ReportTemplate[] = [
  {
    id: "events-daily-leads",
    name: "Leads Daily",
    description: "Daily inquiry and booking tracking",
    scope: "employee",
    frequency: "daily",
    assignedRole: "Leads Coordinator",
    fields: [
      { id: "new_inquiries", label: "New Inquiries", type: "number", required: true },
      { id: "follow_ups", label: "Follow-ups", type: "number", required: true },
      { id: "bookings", label: "Bookings Confirmed", type: "number", required: true },
      { id: "revenue", label: "Revenue (₹)", type: "number", required: true, unit: "₹" },
      { id: "notes", label: "Notes", type: "textarea", required: false }
    ]
  },
  {
    id: "events-weekly-ops",
    name: "Tour Ops Weekly",
    description: "Weekly operational summary for tour bookings",
    scope: "department",
    frequency: "weekly",
    assignedRole: "Operations Head",
    fields: [
      { id: "packages_sold", label: "Packages Sold", type: "number", required: true },
      { id: "booking_value", label: "Booking Value (₹)", type: "number", required: true, unit: "₹" },
      { id: "hotel_confirmations", label: "Hotel Confirmations", type: "number", required: true },
      { id: "vendor_payments", label: "Vendor Payments Made", type: "number", required: true },
      { id: "team_notes", label: "Team Notes", type: "textarea", required: true }
    ]
  }
];

const eventhubTemplates: ReportTemplate[] = [
  {
    id: "hub-daily-ops",
    name: "Event Ops Daily",
    description: "Daily event execution and logistics tracking",
    scope: "employee",
    frequency: "daily",
    assignedRole: "Event Coordinator",
    fields: [
      { id: "registrations", label: "Registrations", type: "number", required: true },
      { id: "check_ins", label: "Check-ins", type: "number", required: true },
      { id: "vendor_confirmations", label: "Vendor Confirmations", type: "number", required: true },
      { id: "issues", label: "Issues Encountered", type: "textarea", required: true },
      { id: "highlights", label: "Daily Highlights", type: "textarea", required: true }
    ]
  },
  {
    id: "hub-weekly-summary",
    name: "Event Weekly",
    description: "Weekly summary of events held and metrics",
    scope: "department",
    frequency: "weekly",
    assignedRole: "Event Manager",
    fields: [
      { id: "events_held", label: "Events Held", type: "number", required: true },
      { id: "total_attendees", label: "Total Attendees", type: "number", required: true },
      { id: "venue_bookings", label: "Venue Bookings", type: "number", required: true },
      { id: "budget_utilization", label: "Budget Used (%)", type: "number", required: true, unit: "%" },
      { id: "feedback_score", label: "Avg Feedback Score", type: "number", required: true },
      { id: "notes", label: "General Notes", type: "textarea", required: false }
    ]
  }
];

const fmt = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

const generateReports = (
  vertical: string,
  templates: ReportTemplate[],
  names: [string, string]
): SubmittedReport[] => {
  const reports: SubmittedReport[] = [];
  const baseDate = new Date("2026-02-28");

  for (let i = 0; i < 10; i++) {
    const date = new Date(baseDate);
    date.setDate(baseDate.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];
    const friendlyDate = fmt(dateStr);

    const template = templates[i % 2];
    const isSubmitted = i < 7;
    const isLate = i === 9;

    const report: SubmittedReport = {
      id: `${vertical}-report-${i}`,
      templateId: template.id,
      templateName: template.name,
      submittedBy: i % 2 === 0 ? names[0] : names[1],
      submittedByRole: template.assignedRole,
      scope: template.scope,
      frequency: template.frequency,
      period: dateStr,
      periodLabel: template.frequency === "daily" ? friendlyDate : `Week of ${friendlyDate}`,
      submittedAt: isSubmitted ? new Date(date.getTime() + 8 * 3600000).toISOString() : null,
      status: isSubmitted ? "submitted" : (isLate ? "late" : "pending"),
      data: isSubmitted ? template.fields.reduce((acc, field) => {
        if (field.type === "number") {
          acc[field.id] = Math.floor(Math.random() * 50) + 5;
        } else if (field.type === "textarea") {
          acc[field.id] = `Progress update for ${field.label} on ${friendlyDate}. All on track.`;
        } else {
          acc[field.id] = "Regular Status";
        }
        return acc;
      }, {} as Record<string, string | number>) : {}
    };

    reports.push(report);
  }

  return reports;
};

export const group1ReportConfig: Record<string, VerticalReportConfig> = {
  hr: {
    templates: hrTemplates,
    submittedReports: generateReports("hr", hrTemplates, ["Priya Sharma", "Arjun Mehta"])
  },
  sales: {
    templates: salesTemplates,
    submittedReports: generateReports("sales", salesTemplates, ["Rahul Verma", "Neha Kapoor"])
  },
  events: {
    templates: eventsTemplates,
    submittedReports: generateReports("events", eventsTemplates, ["Aditya Singh", "Pooja Nair"])
  },
  eventhub: {
    templates: eventhubTemplates,
    submittedReports: generateReports("eventhub", eventhubTemplates, ["Karan Malhotra", "Sana Sheikh"])
  }
};
