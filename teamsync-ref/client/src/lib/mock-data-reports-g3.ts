import { 
  VerticalReportConfig, 
  ReportTemplate, 
  SubmittedReport 
} from "./mock-data-reports";

const hrmsTemplates: ReportTemplate[] = [
  {
    id: "hrms-attendance-daily",
    name: "Attendance Daily Report",
    description: "Daily tracking of employee attendance, leaves, and WFH status.",
    scope: "employee",
    frequency: "daily",
    assignedRole: "HR Associate",
    fields: [
      { id: "present", label: "Employees Present", type: "number", required: true, unit: "pax" },
      { id: "absent", label: "Employees Absent", type: "number", required: true, unit: "pax" },
      { id: "late", label: "Late Arrivals", type: "number", required: true, unit: "pax" },
      { id: "leave_requests", label: "New Leave Requests", type: "number", required: true, unit: "requests" },
      { id: "wfh", label: "WFH Count", type: "number", required: true, unit: "pax" },
      { id: "notes", label: "Attendance Notes", type: "textarea", required: false, placeholder: "Mention any specific attendance issues..." }
    ]
  },
  {
    id: "hrms-hr-weekly",
    name: "HR Weekly Summary",
    description: "Weekly overview of hiring, exits, and payroll status.",
    scope: "department",
    frequency: "weekly",
    assignedRole: "HR Manager",
    fields: [
      { id: "new_hires", label: "New Hires", type: "number", required: true, unit: "people" },
      { id: "exits", label: "Employee Exits", type: "number", required: true, unit: "people" },
      { id: "open_positions", label: "Open Positions", type: "number", required: true, unit: "roles" },
      { id: "payroll_status", label: "Payroll Processed", type: "select", required: true, options: ["Pending", "In Progress", "Completed"] },
      { id: "performance_reviews", label: "Reviews Completed", type: "number", required: true, unit: "reviews" },
      { id: "key_issues", label: "Key Issues/Concerns", type: "textarea", required: false }
    ]
  }
];

const atsTemplates: ReportTemplate[] = [
  {
    id: "ats-recruiter-daily",
    name: "Recruiter Daily Activity",
    description: "Daily log of screening and interviewing activities.",
    scope: "employee",
    frequency: "daily",
    assignedRole: "Recruiter",
    fields: [
      { id: "screened", label: "Candidates Screened", type: "number", required: true, unit: "candidates" },
      { id: "interviews_scheduled", label: "Interviews Scheduled", type: "number", required: true, unit: "interviews" },
      { id: "offers_sent", label: "Offers Sent", type: "number", required: true, unit: "offers" },
      { id: "rejections", label: "Total Rejections", type: "number", required: true, unit: "candidates" },
      { id: "top_candidate", label: "Top Candidate Name", type: "text", required: false },
      { id: "notes", label: "Daily Notes", type: "textarea", required: false }
    ]
  },
  {
    id: "ats-hiring-weekly",
    name: "Hiring Weekly Overview",
    description: "Weekly metrics for the recruitment pipeline.",
    scope: "department",
    frequency: "weekly",
    assignedRole: "Recruitment Lead",
    fields: [
      { id: "open_positions", label: "Total Open Positions", type: "number", required: true, unit: "roles" },
      { id: "total_applications", label: "Applications Received", type: "number", required: true, unit: "apps" },
      { id: "total_interviews", label: "Total Interviews Done", type: "number", required: true, unit: "interviews" },
      { id: "offers_accepted", label: "Offers Accepted", type: "number", required: true, unit: "hires" },
      { id: "time_to_fill", label: "Avg Time to Fill", type: "number", required: true, unit: "days" },
      { id: "highlights", label: "Weekly Highlights", type: "textarea", required: false },
      { id: "blockers", label: "Critical Blockers", type: "textarea", required: false }
    ]
  }
];

const socialTemplates: ReportTemplate[] = [
  {
    id: "social-content-daily",
    name: "Content Daily Report",
    description: "Daily social media publishing and engagement stats.",
    scope: "employee",
    frequency: "daily",
    assignedRole: "Social Media Executive",
    fields: [
      { id: "posts_published", label: "Posts Published", type: "number", required: true, unit: "posts" },
      { id: "stories", label: "Stories Posted", type: "number", required: true, unit: "stories" },
      { id: "engagements", label: "Total Engagements", type: "number", required: true, unit: "interactions" },
      { id: "dms_replied", label: "DMs Replied", type: "number", required: true, unit: "replies" },
      { id: "notes", label: "Daily Notes", type: "textarea", required: false }
    ]
  },
  {
    id: "social-campaign-weekly",
    name: "Social Campaign Weekly",
    description: "Weekly performance across all social channels.",
    scope: "department",
    frequency: "weekly",
    assignedRole: "Social Media Manager",
    fields: [
      { id: "total_posts", label: "Total Weekly Posts", type: "number", required: true, unit: "posts" },
      { id: "follower_growth", label: "Follower Growth", type: "number", required: true, unit: "users" },
      { id: "reach", label: "Total Reach", type: "number", required: true, unit: "reach" },
      { id: "engagement_rate", label: "Engagement Rate", type: "number", required: true, unit: "%" },
      { id: "top_post", label: "Top Performing Post", type: "text", required: true },
      { id: "learnings", label: "Key Learnings", type: "textarea", required: false },
      { id: "next_week_plan", label: "Next Week Strategy", type: "textarea", required: false }
    ]
  }
];

// Generate Mock Data Helper
const createMockReport = (
  id: string,
  template: ReportTemplate,
  submittedBy: string,
  role: string,
  period: string,
  periodLabel: string,
  submittedAt: string | null,
  status: "submitted" | "pending" | "late",
  data: Record<string, any> = {}
): SubmittedReport => ({
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
  data
});

export const group3ReportConfig: Record<string, VerticalReportConfig> = {
  hrms: {
    templates: hrmsTemplates,
    submittedReports: [
      createMockReport("hrms-rep-1", hrmsTemplates[0], "Ananya Sharma", "HR Associate", "2026-02-27", "Feb 27, 2026", "2026-02-27T17:45:00Z", "submitted", {
        present: 142, absent: 8, late: 12, leave_requests: 5, wfh: 15, notes: "All good. System glitch in morning attendance fixed."
      }),
      createMockReport("hrms-rep-2", hrmsTemplates[0], "Ananya Sharma", "HR Associate", "2026-02-26", "Feb 26, 2026", "2026-02-26T18:10:00Z", "submitted", {
        present: 138, absent: 12, late: 5, leave_requests: 3, wfh: 18, notes: "High WFH due to local transit strike."
      }),
      createMockReport("hrms-rep-3", hrmsTemplates[1], "Rahul Mehra", "HR Manager", "2026-W08", "Feb 16 - Feb 22, 2026", "2026-02-23T10:00:00Z", "submitted", {
        new_hires: 4, exits: 1, open_positions: 12, payroll_status: "Completed", performance_reviews: 25, key_issues: "Need to speed up engineering hiring."
      }),
      createMockReport("hrms-rep-4", hrmsTemplates[0], "Ananya Sharma", "HR Associate", "2026-02-25", "Feb 25, 2026", "2026-02-25T17:30:00Z", "submitted", {
        present: 145, absent: 5, late: 2, leave_requests: 2, wfh: 12
      }),
      createMockReport("hrms-rep-5", hrmsTemplates[0], "Ananya Sharma", "HR Associate", "2026-02-28", "Feb 28, 2026", null, "pending", {}),
      createMockReport("hrms-rep-6", hrmsTemplates[1], "Rahul Mehra", "HR Manager", "2026-W09", "Feb 23 - Mar 01, 2026", null, "pending", {}),
      createMockReport("hrms-rep-7", hrmsTemplates[0], "Ananya Sharma", "HR Associate", "2026-02-24", "Feb 24, 2026", "2026-02-24T19:20:00Z", "submitted", {
        present: 140, absent: 10, late: 8, leave_requests: 6, wfh: 14
      }),
      createMockReport("hrms-rep-8", hrmsTemplates[0], "Ananya Sharma", "HR Associate", "2026-02-23", "Feb 23, 2026", "2026-02-23T17:50:00Z", "submitted", {
        present: 141, absent: 9, late: 4, leave_requests: 1, wfh: 13
      }),
      createMockReport("hrms-rep-9", hrmsTemplates[0], "Ananya Sharma", "HR Associate", "2026-02-22", "Feb 22, 2026", "2026-02-22T17:00:00Z", "submitted", {
        present: 148, absent: 2, late: 1, leave_requests: 0, wfh: 10
      }),
      createMockReport("hrms-rep-10", hrmsTemplates[0], "Ananya Sharma", "HR Associate", "2026-02-21", "Feb 21, 2026", null, "late", {})
    ]
  },
  ats: {
    templates: atsTemplates,
    submittedReports: [
      createMockReport("ats-rep-1", atsTemplates[0], "Vikram Singh", "Recruiter", "2026-02-27", "Feb 27, 2026", "2026-02-27T18:30:00Z", "submitted", {
        screened: 25, interviews_scheduled: 8, offers_sent: 2, rejections: 12, top_candidate: "Rohan Das", notes: "Busy day with technical rounds."
      }),
      createMockReport("ats-rep-2", atsTemplates[0], "Vikram Singh", "Recruiter", "2026-02-26", "Feb 26, 2026", "2026-02-26T19:00:00Z", "submitted", {
        screened: 30, interviews_scheduled: 5, offers_sent: 1, rejections: 15, top_candidate: "Sarah J.", notes: "Filtering backend devs."
      }),
      createMockReport("ats-rep-3", atsTemplates[1], "Priya Gupta", "Recruitment Lead", "2026-W08", "Feb 16 - Feb 22, 2026", "2026-02-23T09:30:00Z", "submitted", {
        open_positions: 15, total_applications: 450, total_interviews: 42, offers_accepted: 3, time_to_fill: 24, highlights: "Closed 3 critical SDE roles.", blockers: "Notice period negotiations are slow."
      }),
      createMockReport("ats-rep-4", atsTemplates[0], "Vikram Singh", "Recruiter", "2026-02-25", "Feb 25, 2026", "2026-02-25T17:45:00Z", "submitted", {
        screened: 22, interviews_scheduled: 10, offers_sent: 0, rejections: 10
      }),
      createMockReport("ats-rep-5", atsTemplates[0], "Vikram Singh", "Recruiter", "2026-02-28", "Feb 28, 2026", null, "pending", {}),
      createMockReport("ats-rep-6", atsTemplates[1], "Priya Gupta", "Recruitment Lead", "2026-W09", "Feb 23 - Mar 01, 2026", null, "pending", {}),
      createMockReport("ats-rep-7", atsTemplates[0], "Vikram Singh", "Recruiter", "2026-02-24", "Feb 24, 2026", "2026-02-24T18:15:00Z", "submitted", {
        screened: 28, interviews_scheduled: 6, offers_sent: 1, rejections: 14
      }),
      createMockReport("ats-rep-8", atsTemplates[0], "Vikram Singh", "Recruiter", "2026-02-23", "Feb 23, 2026", "2026-02-23T17:30:00Z", "submitted", {
        screened: 20, interviews_scheduled: 4, offers_sent: 0, rejections: 8
      }),
      createMockReport("ats-rep-9", atsTemplates[0], "Vikram Singh", "Recruiter", "2026-02-22", "Feb 22, 2026", "2026-02-22T16:00:00Z", "submitted", {
        screened: 15, interviews_scheduled: 2, offers_sent: 0, rejections: 5
      }),
      createMockReport("ats-rep-10", atsTemplates[0], "Vikram Singh", "Recruiter", "2026-02-21", "Feb 21, 2026", null, "late", {})
    ]
  },
  social: {
    templates: socialTemplates,
    submittedReports: [
      createMockReport("soc-rep-1", socialTemplates[0], "Karan Joshi", "Social Media Executive", "2026-02-27", "Feb 27, 2026", "2026-02-27T19:15:00Z", "submitted", {
        posts_published: 4, stories: 8, engagements: 1250, dms_replied: 45, notes: "Giveaway post performing very well."
      }),
      createMockReport("soc-rep-2", socialTemplates[0], "Karan Joshi", "Social Media Executive", "2026-02-26", "Feb 26, 2026", "2026-02-26T20:00:00Z", "submitted", {
        posts_published: 3, stories: 6, engagements: 850, dms_replied: 30, notes: "Normal engagement levels."
      }),
      createMockReport("soc-rep-3", socialTemplates[1], "Nisha Verma", "Social Media Manager", "2026-W08", "Feb 16 - Feb 22, 2026", "2026-02-23T11:00:00Z", "submitted", {
        total_posts: 25, follower_growth: 1200, reach: 45000, engagement_rate: 4.8, top_post: "Product Launch Video", learnings: "Short form video (Reels) has 3x reach.", next_week_plan: "Focus on video testimonials."
      }),
      createMockReport("soc-rep-4", socialTemplates[0], "Karan Joshi", "Social Media Executive", "2026-02-25", "Feb 25, 2026", "2026-02-25T18:30:00Z", "submitted", {
        posts_published: 5, stories: 10, engagements: 2100, dms_replied: 50
      }),
      createMockReport("soc-rep-5", socialTemplates[0], "Karan Joshi", "Social Media Executive", "2026-02-28", "Feb 28, 2026", null, "pending", {}),
      createMockReport("soc-rep-6", socialTemplates[1], "Nisha Verma", "Social Media Manager", "2026-W09", "Feb 23 - Mar 01, 2026", null, "pending", {}),
      createMockReport("soc-rep-7", socialTemplates[0], "Karan Joshi", "Social Media Executive", "2026-02-24", "Feb 24, 2026", "2026-02-24T17:45:00Z", "submitted", {
        posts_published: 2, stories: 5, engagements: 600, dms_replied: 20
      }),
      createMockReport("soc-rep-8", socialTemplates[0], "Karan Joshi", "Social Media Executive", "2026-02-23", "Feb 23, 2026", "2026-02-23T18:10:00Z", "submitted", {
        posts_published: 3, stories: 7, engagements: 950, dms_replied: 35
      }),
      createMockReport("soc-rep-9", socialTemplates[0], "Karan Joshi", "Social Media Executive", "2026-02-22", "Feb 22, 2026", "2026-02-22T17:00:00Z", "submitted", {
        posts_published: 1, stories: 4, engagements: 400, dms_replied: 15
      }),
      createMockReport("soc-rep-10", socialTemplates[0], "Karan Joshi", "Social Media Executive", "2026-02-21", "Feb 21, 2026", null, "late", {})
    ]
  }
};
