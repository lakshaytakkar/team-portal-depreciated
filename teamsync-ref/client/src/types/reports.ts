export type ReportScope = "employee" | "department" | "executive";
export type ReportFrequency = "daily" | "weekly";
export type ReportStatus = "submitted" | "pending" | "late";
export type ReportFieldType = "number" | "text" | "textarea" | "select";
export interface ReportField {
  id: string;
  label: string;
  type: ReportFieldType;
  required: boolean;
  placeholder?: string;
  unit?: string;
  options?: string[];
}

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  scope: ReportScope;
  frequency: ReportFrequency;
  assignedRole: string;
  fields: ReportField[];
}

export interface SubmittedReport {
  id: string;
  templateId: string;
  templateName: string;
  submittedBy: string;
  submittedByRole: string;
  scope: ReportScope;
  frequency: ReportFrequency;
  period: string;
  periodLabel: string;
  submittedAt: string | null;
  status: ReportStatus;
  data: Record<string, string | number>;
  store?: string;
}

export interface VerticalReportConfig {
  templates: ReportTemplate[];
  submittedReports: SubmittedReport[];
}
