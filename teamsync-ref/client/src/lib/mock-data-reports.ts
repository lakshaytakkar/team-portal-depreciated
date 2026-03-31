import type { ReportScope, ReportFrequency, ReportStatus, ReportFieldType, ReportField, ReportTemplate, SubmittedReport, VerticalReportConfig } from "@/types/reports";
export type { ReportScope, ReportFrequency, ReportStatus, ReportFieldType, ReportField, ReportTemplate, SubmittedReport, VerticalReportConfig };


import { group1ReportConfig } from "./mock-data-reports-g1";
import { group2ReportConfig } from "./mock-data-reports-g2";
import { group3ReportConfig } from "./mock-data-reports-g3";
import { group4ReportConfig } from "./mock-data-reports-g4";

export const verticalReportConfig: Record<string, VerticalReportConfig> = {
  ...group1ReportConfig,
  ...group2ReportConfig,
  ...group3ReportConfig,
  ...group4ReportConfig,
};
