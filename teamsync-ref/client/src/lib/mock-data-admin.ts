import type { TeamMember, SystemStat, ActivityLog, Report } from "@/types/admin";
export type { TeamMember, SystemStat, ActivityLog, Report };


export const teamMembers: TeamMember[] = [
  { id: "TM-001", name: "Arjun Mehta", email: "arjun.mehta@lumin.com", role: "Tech Lead", department: "Engineering", status: "active", joinedDate: "2023-01-15", lastActive: "2025-02-27" },
  { id: "TM-002", name: "Priya Sharma", email: "priya.sharma@lumin.com", role: "Lead Designer", department: "Design", status: "active", joinedDate: "2022-06-20", lastActive: "2025-02-27" },
  { id: "TM-003", name: "Sneha Patel", email: "sneha.patel@lumin.com", role: "HR Manager", department: "HR", status: "active", joinedDate: "2021-09-01", lastActive: "2025-02-27" },
  { id: "TM-004", name: "Vikram Singh", email: "vikram.singh@lumin.com", role: "Marketing Lead", department: "Marketing", status: "active", joinedDate: "2022-11-05", lastActive: "2025-02-26" },
  { id: "TM-005", name: "Karan Gupta", email: "karan.gupta@lumin.com", role: "Sales Executive", department: "Sales", status: "active", joinedDate: "2024-01-08", lastActive: "2025-02-27" },
  { id: "TM-006", name: "Divya Iyer", email: "divya.iyer@lumin.com", role: "Finance Analyst", department: "Finance", status: "inactive", joinedDate: "2021-12-01", lastActive: "2025-01-15" },
  { id: "TM-007", name: "Rohan Joshi", email: "rohan.joshi@lumin.com", role: "DevOps Engineer", department: "Engineering", status: "active", joinedDate: "2022-04-15", lastActive: "2025-02-27" },
  { id: "TM-008", name: "Nisha Choudhary", email: "nisha.choudhary@lumin.com", role: "Recruiter", department: "HR", status: "active", joinedDate: "2024-02-10", lastActive: "2025-02-26" },
  { id: "TM-009", name: "Siddharth Rao", email: "siddharth.rao@lumin.com", role: "Product Manager", department: "Product", status: "active", joinedDate: "2022-08-14", lastActive: "2025-02-27" },
  { id: "TM-010", name: "Amit Desai", email: "amit.desai@lumin.com", role: "Engineering Manager", department: "Engineering", status: "active", joinedDate: "2021-03-20", lastActive: "2025-02-27" },
  { id: "TM-011", name: "Pooja Bhat", email: "pooja.bhat@lumin.com", role: "Content Writer", department: "Marketing", status: "active", joinedDate: "2023-11-03", lastActive: "2025-02-25" },
  { id: "TM-012", name: "Rahul Kumar", email: "rahul.kumar@lumin.com", role: "Frontend Developer", department: "Engineering", status: "invited", joinedDate: "2025-02-20", lastActive: "2025-02-20" },
];

export const activityLogs: ActivityLog[] = [
  { id: "AL-001", user: "Sneha Patel", action: "Created new employee", target: "Rahul Kumar", timestamp: "2025-02-27 14:30", type: "create" },
  { id: "AL-002", user: "Arjun Mehta", action: "Updated project status", target: "Portal Redesign", timestamp: "2025-02-27 13:15", type: "update" },
  { id: "AL-003", user: "Vikram Singh", action: "Exported sales report", target: "Q1 Sales Report", timestamp: "2025-02-27 11:45", type: "export" },
  { id: "AL-004", user: "Priya Sharma", action: "Deleted draft document", target: "Brand Guidelines v2", timestamp: "2025-02-27 10:20", type: "delete" },
  { id: "AL-005", user: "Karan Gupta", action: "Logged in", target: "Sales CRM", timestamp: "2025-02-27 09:00", type: "login" },
  { id: "AL-006", user: "Nisha Choudhary", action: "Created job posting", target: "Senior Backend Developer", timestamp: "2025-02-26 16:45", type: "create" },
  { id: "AL-007", user: "Rohan Joshi", action: "Updated server config", target: "Production Server", timestamp: "2025-02-26 15:30", type: "update" },
  { id: "AL-008", user: "Divya Iyer", action: "Generated payroll", target: "February 2025 Payroll", timestamp: "2025-02-26 14:00", type: "create" },
  { id: "AL-009", user: "Siddharth Rao", action: "Updated roadmap", target: "Q2 Product Roadmap", timestamp: "2025-02-26 11:30", type: "update" },
  { id: "AL-010", user: "Amit Desai", action: "Exported team report", target: "Engineering Team Report", timestamp: "2025-02-25 17:00", type: "export" },
];

export const reports: Report[] = [
  { id: "RPT-001", name: "Monthly Sales Summary", description: "Overview of sales performance, pipeline, and revenue metrics", category: "Sales", lastGenerated: "2025-02-01", frequency: "Monthly", status: "ready" },
  { id: "RPT-002", name: "Employee Attendance Report", description: "Daily attendance tracking with trends and anomalies", category: "HR", lastGenerated: "2025-02-27", frequency: "Daily", status: "ready" },
  { id: "RPT-003", name: "Revenue Forecast", description: "Projected revenue based on pipeline and historical data", category: "Finance", lastGenerated: "2025-02-15", frequency: "Bi-weekly", status: "ready" },
  { id: "RPT-004", name: "User Activity Audit", description: "Detailed log of all user actions and system access", category: "Security", lastGenerated: "2025-02-27", frequency: "Daily", status: "generating" },
  { id: "RPT-005", name: "Department Budget vs Actual", description: "Budget utilization across all departments", category: "Finance", lastGenerated: "2025-02-20", frequency: "Monthly", status: "ready" },
  { id: "RPT-006", name: "Recruitment Pipeline Report", description: "Candidate flow, conversion rates, and hiring metrics", category: "HR", lastGenerated: "2025-02-25", frequency: "Weekly", status: "ready" },
  { id: "RPT-007", name: "Event ROI Analysis", description: "Return on investment for completed events", category: "Events", lastGenerated: "2025-02-22", frequency: "Per Event", status: "scheduled" },
  { id: "RPT-008", name: "System Health Report", description: "Server uptime, performance, and error rates", category: "IT", lastGenerated: "2025-02-27", frequency: "Daily", status: "ready" },
];
