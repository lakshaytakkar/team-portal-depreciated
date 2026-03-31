import { ReportTemplate, SubmittedReport, VerticalReportConfig } from "./mock-data-reports";

const adminTemplates: ReportTemplate[] = [
  {
    id: "admin-daily-store-ops",
    name: "Store Ops Daily",
    description: "Daily operations report for LBM Lifestyle retail stores.",
    scope: "employee",
    frequency: "daily",
    assignedRole: "Store Manager",
    fields: [
      { id: "new_orders", label: "New Orders", type: "number", required: true, unit: "orders" },
      { id: "shipped_orders", label: "Orders Shipped", type: "number", required: true, unit: "orders" },
      { id: "retailer_queries", label: "Retailer Queries", type: "number", required: true, unit: "queries" },
      { id: "payment_issues", label: "Payment Issues", type: "textarea", required: false, placeholder: "Describe any payment or gateway issues..." },
      { id: "notes", label: "Operational Notes", type: "textarea", required: false }
    ]
  },
  {
    id: "admin-weekly-b2b",
    name: "B2B Weekly",
    description: "Weekly performance summary for B2B operations.",
    scope: "department",
    frequency: "weekly",
    assignedRole: "Operations Head",
    fields: [
      { id: "total_orders", label: "Total Orders", type: "number", required: true, unit: "orders" },
      { id: "revenue", label: "Weekly Revenue", type: "number", required: true, unit: "₹" },
      { id: "new_retailers", label: "New Retailers", type: "number", required: true, unit: "onboarded" },
      { id: "pending_dispatches", label: "Pending Dispatches", type: "number", required: true, unit: "orders" },
      { id: "return_rate", label: "Return Rate", type: "number", required: true, unit: "%" },
      { id: "highlights", label: "Key Highlights", type: "textarea", required: true },
      { id: "blockers", label: "Blockers", type: "textarea", required: false }
    ]
  }
];

const devTemplates: ReportTemplate[] = [
  {
    id: "dev-daily-standup",
    name: "Dev Standup Daily",
    description: "Daily progress and planning for individual developers.",
    scope: "employee",
    frequency: "daily",
    assignedRole: "Developer",
    fields: [
      { id: "tasks_done", label: "Tasks Completed", type: "textarea", required: true, placeholder: "List tickets/tasks finished today..." },
      { id: "prs_raised", label: "PRs Raised", type: "number", required: true, unit: "PRs" },
      { id: "blockers", label: "Blockers", type: "textarea", required: false, placeholder: "Any technical or dependency blockers?" },
      { id: "tomorrow_plan", label: "Plan for Tomorrow", type: "textarea", required: true }
    ]
  },
  {
    id: "dev-weekly-sprint",
    name: "Sprint Weekly",
    description: "Weekly sprint summary for the engineering team.",
    scope: "department",
    frequency: "weekly",
    assignedRole: "Engineering Manager",
    fields: [
      { id: "stories_completed", label: "Stories Completed", type: "number", required: true, unit: "stories" },
      { id: "bugs_fixed", label: "Bugs Fixed", type: "number", required: true, unit: "bugs" },
      { id: "prs_merged", label: "PRs Merged", type: "number", required: true, unit: "PRs" },
      { id: "deployments", label: "Deployments", type: "number", required: true, unit: "deploys" },
      { id: "blockers", label: "Major Blockers", type: "textarea", required: false },
      { id: "next_goals", label: "Next Sprint Goals", type: "textarea", required: true }
    ]
  }
];

const etsTemplates: ReportTemplate[] = [
  {
    id: "ets-daily-franchise",
    name: "Franchise Daily",
    description: "Daily activities and sales for EazyToSell franchises.",
    scope: "employee",
    frequency: "daily",
    assignedRole: "Franchise Manager",
    fields: [
      { id: "client_calls", label: "Client Calls", type: "number", required: true, unit: "calls" },
      { id: "inquiries", label: "New Inquiries", type: "number", required: true, unit: "leads" },
      { id: "orders_placed", label: "Orders Placed", type: "number", required: true, unit: "orders" },
      { id: "payments_collected", label: "Payments Collected", type: "number", required: true, unit: "₹" },
      { id: "issues", label: "Reported Issues", type: "textarea", required: false }
    ]
  },
  {
    id: "ets-weekly-sales",
    name: "Sales Weekly",
    description: "Weekly performance review for the sales department.",
    scope: "department",
    frequency: "weekly",
    assignedRole: "Sales Director",
    fields: [
      { id: "new_franchise_clients", label: "New Franchise Clients", type: "number", required: true, unit: "clients" },
      { id: "orders_value", label: "Total Orders Value", type: "number", required: true, unit: "₹" },
      { id: "shipments", label: "Total Shipments", type: "number", required: true, unit: "shipments" },
      { id: "collections", label: "Total Collections", type: "number", required: true, unit: "₹" },
      { id: "performance", label: "Performance Summary", type: "textarea", required: true },
      { id: "targets", label: "Next Week Targets", type: "textarea", required: true }
    ]
  }
];

const faireTemplates: ReportTemplate[] = [
  {
    id: "faire-daily-store",
    name: "Store Ops Daily",
    description: "Daily operations report for FaireDesk managed stores.",
    scope: "employee",
    frequency: "daily",
    assignedRole: "Store Associate",
    fields: [
      { id: "orders_in", label: "Orders Received", type: "number", required: true, unit: "orders" },
      { id: "dispatched", label: "Orders Dispatched", type: "number", required: true, unit: "orders" },
      { id: "queries", label: "Retailer Inquiries", type: "number", required: true, unit: "queries" },
      { id: "disputes", label: "New Disputes", type: "number", required: true, unit: "disputes" },
      { id: "revenue", label: "Daily Revenue", type: "number", required: true, unit: "₹" },
      { id: "notes", label: "General Notes", type: "textarea", required: false }
    ]
  },
  {
    id: "faire-weekly-store",
    name: "Store Weekly",
    description: "Weekly consolidated performance for FaireDesk stores.",
    scope: "department",
    frequency: "weekly",
    assignedRole: "Account Manager",
    fields: [
      { id: "total_orders", label: "Total Orders", type: "number", required: true, unit: "orders" },
      { id: "total_revenue", label: "Total Revenue", type: "number", required: true, unit: "₹" },
      { id: "fulfillment_rate", label: "Fulfillment Rate", type: "number", required: true, unit: "%" },
      { id: "new_retailers", label: "New Retailers", type: "number", required: true, unit: "retailers" },
      { id: "campaign_perf", label: "Campaign Performance", type: "textarea", required: true },
      { id: "wins", label: "Key Wins", type: "textarea", required: true },
      { id: "blockers", label: "Blockers", type: "textarea", required: false }
    ]
  }
];

const generateReports = (vertical: string, templates: ReportTemplate[]): SubmittedReport[] => {
  const reports: SubmittedReport[] = [];
  const startDay = 17;
  const endDay = 28;

  for (let day = startDay; day <= endDay; day++) {
    const dateStr = `2026-02-${day}`;
    const isWeekend = [21, 22].includes(day); // Feb 21, 22 are Sat/Sun
    
    // Add Daily Report
    const dailyTemplate = templates[0];
    const isLate = day < 28 && Math.random() < 0.1;
    const isPending = day === 28 && Math.random() < 0.5;
    
    reports.push({
      id: `${vertical}-daily-${day}`,
      templateId: dailyTemplate.id,
      templateName: dailyTemplate.name,
      submittedBy: "Alex Johnson",
      submittedByRole: dailyTemplate.assignedRole,
      scope: dailyTemplate.scope,
      frequency: dailyTemplate.frequency,
      period: dateStr,
      periodLabel: `Feb ${day}, 2026`,
      submittedAt: isPending ? null : `${dateStr}T18:30:00Z`,
      status: isPending ? (isLate ? "late" : "pending") : "submitted",
      data: isPending ? {} : Object.fromEntries(dailyTemplate.fields.map(f => [
        f.id, 
        f.type === "number" ? Math.floor(Math.random() * 50) + 5 : 
        f.type === "textarea" ? `Completed routine checks and handled ${vertical} tasks.` : "Regular status"
      ]))
    });

    // Add Weekly Report on Fridays (Feb 20, 27)
    if (day === 20 || day === 27) {
      const weeklyTemplate = templates[1];
      reports.push({
        id: `${vertical}-weekly-${day}`,
        templateId: weeklyTemplate.id,
        templateName: weeklyTemplate.name,
        submittedBy: "Sarah Miller",
        submittedByRole: weeklyTemplate.assignedRole,
        scope: weeklyTemplate.scope,
        frequency: weeklyTemplate.frequency,
        period: `2026-W${day === 20 ? "08" : "09"}`,
        periodLabel: day === 20 ? "Feb 16 - Feb 20, 2026" : "Feb 23 - Feb 27, 2026",
        submittedAt: `${dateStr}T16:00:00Z`,
        status: "submitted",
        data: Object.fromEntries(weeklyTemplate.fields.map(f => [
          f.id,
          f.type === "number" ? Math.floor(Math.random() * 500) + 100 :
          f.type === "textarea" ? `Weekly summary for ${vertical} department. All targets met.` : "Confirmed"
        ]))
      });
    }
  }
  return reports;
};

export const group2ReportConfig: Record<string, VerticalReportConfig> = {
  admin: {
    templates: adminTemplates,
    submittedReports: generateReports("admin", adminTemplates)
  },
  dev: {
    templates: devTemplates,
    submittedReports: generateReports("dev", devTemplates)
  },
  ets: {
    templates: etsTemplates,
    submittedReports: generateReports("ets", etsTemplates)
  },
  faire: {
    templates: faireTemplates,
    submittedReports: generateReports("faire", faireTemplates)
  }
};
