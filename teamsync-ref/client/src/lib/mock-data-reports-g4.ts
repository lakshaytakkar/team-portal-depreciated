import {
  VerticalReportConfig,
  ReportTemplate,
  SubmittedReport,
} from "./mock-data-reports";

const financeTemplates: ReportTemplate[] = [
  {
    id: "finance-daily-txn",
    name: "Daily Transaction Log",
    description: "Daily tracking of invoices, payments, and bank balances across entities.",
    scope: "employee",
    frequency: "daily",
    assignedRole: "Finance Associate",
    fields: [
      { id: "invoices_raised", label: "Invoices Raised", type: "number", required: true, unit: "invoices" },
      { id: "payments_received", label: "Payments Received", type: "number", required: true, unit: "₹" },
      { id: "payments_made", label: "Payments Made", type: "number", required: true, unit: "₹" },
      { id: "bank_balance", label: "Closing Bank Balance", type: "number", required: true, unit: "₹" },
      { id: "pending_receivables", label: "Pending Receivables", type: "number", required: true, unit: "₹" },
      { id: "notes", label: "Notes / Flags", type: "textarea", required: false, placeholder: "Any discrepancies, pending approvals, or bank issues..." },
    ],
  },
  {
    id: "finance-weekly-review",
    name: "Weekly Finance Review",
    description: "Weekly summary of revenue, expenses, GST compliance, and open invoices.",
    scope: "department",
    frequency: "weekly",
    assignedRole: "Finance Manager",
    fields: [
      { id: "total_revenue", label: "Total Revenue", type: "number", required: true, unit: "₹" },
      { id: "total_expenses", label: "Total Expenses", type: "number", required: true, unit: "₹" },
      { id: "gst_filed", label: "GST Return Status", type: "select", required: true, options: ["Filed", "Pending", "N/A"] },
      { id: "tds_deducted", label: "TDS Deducted", type: "number", required: true, unit: "₹" },
      { id: "open_invoices", label: "Open Invoices", type: "number", required: true, unit: "invoices" },
      { id: "key_highlights", label: "Key Highlights", type: "textarea", required: true, placeholder: "Weekly financial summary, concerns, or escalations..." },
    ],
  },
];

const omsTemplates: ReportTemplate[] = [
  {
    id: "oms-daily-dispatch",
    name: "Daily Dispatch Summary",
    description: "Daily log of orders dispatched, pending, and RTO shipments across couriers.",
    scope: "employee",
    frequency: "daily",
    assignedRole: "Operations Associate",
    fields: [
      { id: "orders_dispatched", label: "Orders Dispatched", type: "number", required: true, unit: "orders" },
      { id: "orders_pending", label: "Orders Pending Dispatch", type: "number", required: true, unit: "orders" },
      { id: "rto_count", label: "RTO Received", type: "number", required: true, unit: "shipments" },
      { id: "courier", label: "Primary Courier Used", type: "select", required: true, options: ["Delhivery", "Shiprocket", "DTDC", "BlueDart", "Ekart", "Mixed"] },
      { id: "cod_collected", label: "COD Collected", type: "number", required: true, unit: "₹" },
      { id: "notes", label: "Notes / Issues", type: "textarea", required: false, placeholder: "Any delays, courier issues, or order escalations..." },
    ],
  },
  {
    id: "oms-weekly-inventory",
    name: "Weekly Inventory Report",
    description: "Weekly overview of stock levels, restocking activity, and fulfillment performance.",
    scope: "department",
    frequency: "weekly",
    assignedRole: "Operations Manager",
    fields: [
      { id: "skus_restocked", label: "SKUs Restocked", type: "number", required: true, unit: "SKUs" },
      { id: "critical_stock_skus", label: "Critical Stock SKUs", type: "number", required: true, unit: "SKUs" },
      { id: "pos_raised", label: "Purchase Orders Raised", type: "number", required: true, unit: "POs" },
      { id: "returns_processed", label: "Returns Processed", type: "number", required: true, unit: "returns" },
      { id: "fulfillment_rate", label: "Fulfillment Rate", type: "number", required: true, unit: "%" },
      { id: "highlights", label: "Highlights & Concerns", type: "textarea", required: true, placeholder: "Weekly operations summary, inventory alerts, or supplier issues..." },
    ],
  },
];

const crmTemplates: ReportTemplate[] = [
  {
    id: "crm-daily-activity",
    name: "Daily CRM Activity",
    description: "Daily log of sales calls, emails, demos, and lead activity.",
    scope: "employee",
    frequency: "daily",
    assignedRole: "Sales Executive",
    fields: [
      { id: "calls_made", label: "Calls Made", type: "number", required: true, unit: "calls" },
      { id: "emails_sent", label: "Emails Sent", type: "number", required: true, unit: "emails" },
      { id: "demos_done", label: "Demos Conducted", type: "number", required: true, unit: "demos" },
      { id: "leads_added", label: "New Leads Added", type: "number", required: true, unit: "leads" },
      { id: "deals_closed", label: "Deal Value Closed", type: "number", required: true, unit: "₹" },
      { id: "notes", label: "Notes / Follow-ups", type: "textarea", required: false, placeholder: "Key prospect updates, blockers, or next steps..." },
    ],
  },
  {
    id: "crm-weekly-pipeline",
    name: "Pipeline Weekly Review",
    description: "Weekly summary of pipeline health, deals won/lost, and proposal activity.",
    scope: "department",
    frequency: "weekly",
    assignedRole: "Sales Manager",
    fields: [
      { id: "leads_in_pipeline", label: "Total Leads in Pipeline", type: "number", required: true, unit: "leads" },
      { id: "qualified_leads", label: "Qualified Leads", type: "number", required: true, unit: "leads" },
      { id: "proposals_sent", label: "Proposals Sent", type: "number", required: true, unit: "proposals" },
      { id: "deals_won", label: "Revenue from Deals Won", type: "number", required: true, unit: "₹" },
      { id: "deals_lost", label: "Deals Lost", type: "number", required: true, unit: "deals" },
      { id: "pipeline_health", label: "Pipeline Health", type: "select", required: true, options: ["Healthy", "At Risk", "Critical"] },
      { id: "highlights", label: "Key Highlights", type: "textarea", required: true, placeholder: "Top wins, risks, team performance notes..." },
    ],
  },
];

function makeReport(
  id: string,
  template: ReportTemplate,
  submittedBy: string,
  role: string,
  period: string,
  periodLabel: string,
  submittedAt: string | null,
  status: "submitted" | "pending" | "late",
  data: Record<string, string | number> = {}
): SubmittedReport {
  return {
    id,
    templateId: template.id,
    templateName: template.name,
    submittedBy,
    submittedByRole: role,
    scope: template.scope,
    frequency: template.frequency,
    period,
    periodLabel,
    submittedAt,
    status,
    data,
  };
}

const financeReports: SubmittedReport[] = [
  makeReport("fr-001", financeTemplates[0], "Arjun Mehta", "Finance Associate", "2026-02-28", "28 Feb 2026", "2026-02-28T09:15:00Z", "submitted", { invoices_raised: 4, payments_received: 185000, payments_made: 62000, bank_balance: 834000, pending_receivables: 245000, notes: "Reconciled HDFC and ICICI accounts. 2 invoices still awaiting client approval." }),
  makeReport("fr-002", financeTemplates[0], "Priya Nair", "Finance Associate", "2026-02-27", "27 Feb 2026", "2026-02-27T09:30:00Z", "submitted", { invoices_raised: 3, payments_received: 97000, payments_made: 41000, bank_balance: 711000, pending_receivables: 318000, notes: "TDS deducted on vendor payment. Pending client confirmation for Neom invoice." }),
  makeReport("fr-003", financeTemplates[0], "Arjun Mehta", "Finance Associate", "2026-02-26", "26 Feb 2026", "2026-02-26T09:00:00Z", "submitted", { invoices_raised: 5, payments_received: 220000, payments_made: 89000, bank_balance: 655000, pending_receivables: 185000 }),
  makeReport("fr-004", financeTemplates[0], "Priya Nair", "Finance Associate", "2026-02-25", "25 Feb 2026", "2026-02-25T09:45:00Z", "submitted", { invoices_raised: 2, payments_received: 54000, payments_made: 28000, bank_balance: 524000, pending_receivables: 390000, notes: "Bank charges deducted from ICICI. Need approval for ₹50K vendor advance." }),
  makeReport("fr-005", financeTemplates[1], "Meera Pillai", "Finance Manager", "2026-02-22", "Week of 17 Feb", "2026-02-22T11:00:00Z", "submitted", { total_revenue: 1240000, total_expenses: 680000, gst_filed: "Filed", tds_deducted: 28500, open_invoices: 7, key_highlights: "Strong revenue week. GST GSTR-1 filed on time. 3 invoices pending from B2B clients. Forex gain on USD conversion booked." }),
  makeReport("fr-006", financeTemplates[0], "Arjun Mehta", "Finance Associate", "2026-02-24", "24 Feb 2026", "2026-02-24T09:10:00Z", "submitted", { invoices_raised: 3, payments_received: 140000, payments_made: 55000, bank_balance: 498000, pending_receivables: 275000 }),
  makeReport("fr-007", financeTemplates[1], "Meera Pillai", "Finance Manager", "2026-02-15", "Week of 10 Feb", "2026-02-15T10:30:00Z", "submitted", { total_revenue: 980000, total_expenses: 590000, gst_filed: "Pending", tds_deducted: 18000, open_invoices: 11, key_highlights: "GST filing delayed — compliance team working on it. Expenses higher due to payroll processing. 2 large invoices expected next week." }),
  makeReport("fr-008", financeTemplates[0], "Priya Nair", "Finance Associate", "2026-02-28", "28 Feb 2026", null, "pending", {}),
  makeReport("fr-009", financeTemplates[1], "Meera Pillai", "Finance Manager", "2026-02-28", "Week of 24 Feb", null, "pending", {}),
];

const omsReports: SubmittedReport[] = [
  makeReport("or-001", omsTemplates[0], "Sneha Patel", "Operations Associate", "2026-02-28", "28 Feb 2026", "2026-02-28T08:30:00Z", "submitted", { orders_dispatched: 18, orders_pending: 4, rto_count: 1, courier: "Delhivery", cod_collected: 8400, notes: "1 RTO from BlueDart — customer not reachable. 4 orders on hold awaiting payment confirmation." }),
  makeReport("or-002", omsTemplates[0], "Ravi Kumar", "Operations Associate", "2026-02-27", "27 Feb 2026", "2026-02-27T08:45:00Z", "submitted", { orders_dispatched: 22, orders_pending: 3, rto_count: 0, courier: "Shiprocket", cod_collected: 12600 }),
  makeReport("or-003", omsTemplates[0], "Sneha Patel", "Operations Associate", "2026-02-26", "26 Feb 2026", "2026-02-26T09:00:00Z", "submitted", { orders_dispatched: 15, orders_pending: 6, rto_count: 2, courier: "Mixed", cod_collected: 7200, notes: "2 RTOs from DTDC — courier handoff delay. Escalated to courier account manager." }),
  makeReport("or-004", omsTemplates[1], "Sneha Patel", "Operations Manager", "2026-02-22", "Week of 17 Feb", "2026-02-22T10:00:00Z", "submitted", { skus_restocked: 8, critical_stock_skus: 5, pos_raised: 3, returns_processed: 4, fulfillment_rate: 94, highlights: "Fulfillment rate healthy at 94%. 5 SKUs critically low — POs raised for 3. 4 returns processed, 2 restocked. Delhivery performance strong this week." }),
  makeReport("or-005", omsTemplates[0], "Ravi Kumar", "Operations Associate", "2026-02-25", "25 Feb 2026", "2026-02-25T08:30:00Z", "submitted", { orders_dispatched: 20, orders_pending: 2, rto_count: 0, courier: "BlueDart", cod_collected: 9800 }),
  makeReport("or-006", omsTemplates[0], "Sneha Patel", "Operations Associate", "2026-02-24", "24 Feb 2026", "2026-02-24T08:40:00Z", "submitted", { orders_dispatched: 17, orders_pending: 5, rto_count: 1, courier: "Ekart", cod_collected: 6300, notes: "Ekart pickup delayed by 2 hours. Notified all affected customers." }),
  makeReport("or-007", omsTemplates[1], "Sneha Patel", "Operations Manager", "2026-02-15", "Week of 10 Feb", "2026-02-15T10:30:00Z", "submitted", { skus_restocked: 5, critical_stock_skus: 8, pos_raised: 5, returns_processed: 6, fulfillment_rate: 89, highlights: "Fulfillment dipped to 89% — stock shortage in Electronics category. 5 POs raised with suppliers. RTO rate increased slightly with Shiprocket." }),
  makeReport("or-008", omsTemplates[0], "Ravi Kumar", "Operations Associate", "2026-02-28", "28 Feb 2026", null, "pending", {}),
  makeReport("or-009", omsTemplates[1], "Sneha Patel", "Operations Manager", "2026-02-28", "Week of 24 Feb", null, "late", {}),
];

const crmReports: SubmittedReport[] = [
  makeReport("cr-001", crmTemplates[0], "Karan Desai", "Sales Executive", "2026-02-28", "28 Feb 2026", "2026-02-28T08:00:00Z", "submitted", { calls_made: 14, emails_sent: 22, demos_done: 2, leads_added: 3, deals_closed: 45000, notes: "Strong day — demo with RetailCo went well. Follow-up scheduled for Monday. Chasing 2 proposals from last week." }),
  makeReport("cr-002", crmTemplates[0], "Ananya Sharma", "Sales Executive", "2026-02-28", "28 Feb 2026", "2026-02-28T08:15:00Z", "submitted", { calls_made: 18, emails_sent: 16, demos_done: 1, leads_added: 5, deals_closed: 0, notes: "Demo postponed by client. Added 5 new leads from LinkedIn campaign. Pipeline looking full." }),
  makeReport("cr-003", crmTemplates[0], "Karan Desai", "Sales Executive", "2026-02-27", "27 Feb 2026", "2026-02-27T08:30:00Z", "submitted", { calls_made: 12, emails_sent: 19, demos_done: 3, leads_added: 2, deals_closed: 72000 }),
  makeReport("cr-004", crmTemplates[1], "Vikram Nair", "Sales Manager", "2026-02-22", "Week of 17 Feb", "2026-02-22T11:00:00Z", "submitted", { leads_in_pipeline: 48, qualified_leads: 22, proposals_sent: 9, deals_won: 280000, deals_lost: 2, pipeline_health: "Healthy", highlights: "Best week this month — ₹2.8L closed. RetailCo and Karan Enterprises both converted. 9 proposals in review. Pipeline health strong heading into March." }),
  makeReport("cr-005", crmTemplates[0], "Ananya Sharma", "Sales Executive", "2026-02-26", "26 Feb 2026", "2026-02-26T08:00:00Z", "submitted", { calls_made: 10, emails_sent: 24, demos_done: 2, leads_added: 4, deals_closed: 35000, notes: "Closed deal with StartupX. Nurturing 4 warm leads from the trade show." }),
  makeReport("cr-006", crmTemplates[0], "Karan Desai", "Sales Executive", "2026-02-25", "25 Feb 2026", "2026-02-25T08:00:00Z", "submitted", { calls_made: 16, emails_sent: 18, demos_done: 1, leads_added: 3, deals_closed: 0 }),
  makeReport("cr-007", crmTemplates[1], "Vikram Nair", "Sales Manager", "2026-02-15", "Week of 10 Feb", "2026-02-15T11:30:00Z", "submitted", { leads_in_pipeline: 42, qualified_leads: 18, proposals_sent: 7, deals_won: 145000, deals_lost: 3, pipeline_health: "At Risk", highlights: "3 deals lost to competitor pricing. Need to revisit discount structure. Pipeline at risk — need 5 more qualified leads by end of month." }),
  makeReport("cr-008", crmTemplates[0], "Ananya Sharma", "Sales Executive", "2026-02-28", "28 Feb 2026", null, "pending", {}),
  makeReport("cr-009", crmTemplates[1], "Vikram Nair", "Sales Manager", "2026-02-28", "Week of 24 Feb", null, "pending", {}),
];

const supransTemplates: ReportTemplate[] = [
  {
    id: "suprans-daily-intake",
    name: "Daily Lead Intake",
    description: "Daily log of new inbound leads received across all sources.",
    scope: "employee",
    frequency: "daily",
    assignedRole: "Lead Intake Specialist",
    fields: [
      { id: "total_leads", label: "Total Leads Received", type: "number", required: true, unit: "leads" },
      { id: "website_leads", label: "Website Leads", type: "number", required: true, unit: "leads" },
      { id: "social_leads", label: "Social Media Leads", type: "number", required: true, unit: "leads" },
      { id: "referral_leads", label: "Referral Leads", type: "number", required: true, unit: "leads" },
      { id: "validated_count", label: "Validated Today", type: "number", required: true, unit: "leads" },
      { id: "notes", label: "Notes / Flags", type: "textarea", required: false, placeholder: "Any unusual volume, duplicate entries, or quality issues..." },
    ],
  },
  {
    id: "suprans-weekly-assignments",
    name: "Weekly Assignment Summary",
    description: "Weekly summary of lead enrichment and vertical assignment activity.",
    scope: "department",
    frequency: "weekly",
    assignedRole: "Lead Operations Manager",
    fields: [
      { id: "leads_enriched", label: "Leads Enriched", type: "number", required: true, unit: "leads" },
      { id: "leads_assigned", label: "Leads Assigned to Verticals", type: "number", required: true, unit: "leads" },
      { id: "conversion_rate", label: "Conversion Rate", type: "number", required: true, unit: "%" },
      { id: "top_vertical", label: "Top Performing Vertical", type: "select", required: true, options: ["LegalNations", "GoyoTours", "USDrop AI", "EventHub", "HRMS", "EazyToSell"] },
      { id: "dropped_leads", label: "Dropped Leads", type: "number", required: true, unit: "leads" },
      { id: "highlights", label: "Weekly Highlights", type: "textarea", required: true, placeholder: "Key wins, bottlenecks, vertical feedback, or pipeline health..." },
    ],
  },
];

const supransReports: SubmittedReport[] = [
  makeReport("sp-001", supransTemplates[0], "Kavitha Nair", "Lead Intake Specialist", "2026-02-28", "28 Feb 2026", "2026-02-28T09:00:00Z", "submitted", { total_leads: 8, website_leads: 3, social_leads: 3, referral_leads: 2, validated_count: 6, notes: "2 leads from Instagram appeared duplicate — flagged for review." }),
  makeReport("sp-002", supransTemplates[0], "Kavitha Nair", "Lead Intake Specialist", "2026-02-27", "27 Feb 2026", "2026-02-27T09:15:00Z", "submitted", { total_leads: 5, website_leads: 2, social_leads: 2, referral_leads: 1, validated_count: 5 }),
  makeReport("sp-003", supransTemplates[1], "Priya Sharma", "Lead Operations Manager", "2026-02-24", "Week of 17 Feb", "2026-02-24T11:00:00Z", "submitted", { leads_enriched: 9, leads_assigned: 7, conversion_rate: 28, top_vertical: "LegalNations", dropped_leads: 1, highlights: "LegalNations receiving highest quality leads. GoyoTours pipeline needs nurturing — 3 leads gone cold. Suggest WhatsApp follow-up campaign." }),
  makeReport("sp-004", supransTemplates[0], "Kavitha Nair", "Lead Intake Specialist", "2026-02-28", "28 Feb 2026", null, "pending", {}),
  makeReport("sp-005", supransTemplates[1], "Priya Sharma", "Lead Operations Manager", "2026-02-28", "Week of 24 Feb", null, "pending", {}),
];

export const group4ReportConfig: Record<string, VerticalReportConfig> = {
  finance: {
    templates: financeTemplates,
    submittedReports: financeReports,
  },
  oms: {
    templates: omsTemplates,
    submittedReports: omsReports,
  },
  crm: {
    templates: crmTemplates,
    submittedReports: crmReports,
  },
  suprans: {
    templates: supransTemplates,
    submittedReports: supransReports,
  },
};
