import type { Employee, HrmsDepartment, AttendanceRecord, LeaveRequest, PayrollEntry, PerformanceReview, Goal, HrPolicy, Holiday, OrgNode } from "@/types/hrms";
export type { Employee, HrmsDepartment, AttendanceRecord, LeaveRequest, PayrollEntry, PerformanceReview, Goal, HrPolicy, Holiday, OrgNode };


export const hrmsDepartments: HrmsDepartment[] = [
  { id: "DEPT-ENG", name: "Engineering", head: "Rohan Mehta", headId: "EMP-001", headCount: 6, color: "#0EA5E9", designations: ["Senior Engineer", "Backend Engineer", "Frontend Engineer", "DevOps Engineer"] },
  { id: "DEPT-OPS", name: "Operations", head: "Priya Sharma", headId: "EMP-006", headCount: 4, color: "#10B981", designations: ["Operations Manager", "Process Lead", "Operations Analyst"] },
  { id: "DEPT-SALES", name: "Sales", head: "Vikram Nair", headId: "EMP-010", headCount: 4, color: "#F97316", designations: ["Sales Manager", "Business Development", "Account Executive"] },
  { id: "DEPT-FIN", name: "Finance", head: "Kavya Reddy", headId: "EMP-014", headCount: 3, color: "#8B5CF6", designations: ["Finance Manager", "Accountant", "Financial Analyst"] },
  { id: "DEPT-HR", name: "HR", head: "Sneha Patel", headId: "EMP-017", headCount: 3, color: "#E91E63", designations: ["HR Manager", "HR Executive", "Talent Acquisition"] },
];

export const employees: Employee[] = [
  { id: "EMP-001", name: "Rohan Mehta", email: "rohan.mehta@teamsync.io", phone: "+91 98765 43210", department: "Engineering", designation: "Senior Engineer", employmentType: "full-time", status: "active", reportingManager: "Arjun Kapoor", joiningDate: "2021-06-15", location: "Bengaluru", salary: 180000, avatar: "RM", skills: ["React", "Node.js", "PostgreSQL", "AWS"] },
  { id: "EMP-002", name: "Ananya Singh", email: "ananya.singh@teamsync.io", phone: "+91 87654 32109", department: "Engineering", designation: "Backend Engineer", employmentType: "full-time", status: "active", reportingManager: "Rohan Mehta", joiningDate: "2022-03-01", location: "Bengaluru", salary: 140000, avatar: "AS", skills: ["Python", "Django", "Redis", "Docker"] },
  { id: "EMP-003", name: "Karan Joshi", email: "karan.joshi@teamsync.io", phone: "+91 76543 21098", department: "Engineering", designation: "Frontend Engineer", employmentType: "full-time", status: "active", reportingManager: "Rohan Mehta", joiningDate: "2022-08-20", location: "Mumbai", salary: 130000, avatar: "KJ", skills: ["React", "TypeScript", "Tailwind", "Figma"] },
  { id: "EMP-004", name: "Divya Rao", email: "divya.rao@teamsync.io", phone: "+91 65432 10987", department: "Engineering", designation: "DevOps Engineer", employmentType: "full-time", status: "on-leave", reportingManager: "Rohan Mehta", joiningDate: "2023-01-10", location: "Hyderabad", salary: 155000, avatar: "DR", skills: ["Kubernetes", "Terraform", "CI/CD", "Linux"] },
  { id: "EMP-005", name: "Siddharth Kumar", email: "siddharth.kumar@teamsync.io", phone: "+91 54321 09876", department: "Engineering", designation: "Backend Engineer", employmentType: "contract", status: "active", reportingManager: "Rohan Mehta", joiningDate: "2024-01-15", location: "Remote", salary: 120000, avatar: "SK", skills: ["Go", "gRPC", "Microservices"] },
  { id: "EMP-006", name: "Priya Sharma", email: "priya.sharma@teamsync.io", phone: "+91 43210 98765", department: "Operations", designation: "Operations Manager", employmentType: "full-time", status: "active", reportingManager: "Arjun Kapoor", joiningDate: "2021-09-05", location: "Delhi", salary: 160000, avatar: "PS", skills: ["Process Improvement", "Project Management", "SOP", "ERP"] },
  { id: "EMP-007", name: "Rahul Verma", email: "rahul.verma@teamsync.io", phone: "+91 32109 87654", department: "Operations", designation: "Process Lead", employmentType: "full-time", status: "active", reportingManager: "Priya Sharma", joiningDate: "2022-05-12", location: "Delhi", salary: 110000, avatar: "RV", skills: ["Six Sigma", "JIRA", "Lean", "Analytics"] },
  { id: "EMP-008", name: "Meera Pillai", email: "meera.pillai@teamsync.io", phone: "+91 21098 76543", department: "Operations", designation: "Operations Analyst", employmentType: "full-time", status: "active", reportingManager: "Priya Sharma", joiningDate: "2023-07-18", location: "Kochi", salary: 90000, avatar: "MP", skills: ["Excel", "Data Analysis", "MIS", "Tableau"] },
  { id: "EMP-009", name: "Arjun Bose", email: "arjun.bose@teamsync.io", phone: "+91 10987 65432", department: "Operations", designation: "Operations Analyst", employmentType: "part-time", status: "active", reportingManager: "Priya Sharma", joiningDate: "2023-11-20", location: "Kolkata", salary: 65000, avatar: "AB", skills: ["SQL", "Power BI", "Reporting"] },
  { id: "EMP-010", name: "Vikram Nair", email: "vikram.nair@teamsync.io", phone: "+91 99887 76655", department: "Sales", designation: "Sales Manager", employmentType: "full-time", status: "active", reportingManager: "Arjun Kapoor", joiningDate: "2021-11-01", location: "Mumbai", salary: 170000, avatar: "VN", skills: ["B2B Sales", "CRM", "Negotiation", "Strategy"] },
  { id: "EMP-011", name: "Pooja Agarwal", email: "pooja.agarwal@teamsync.io", phone: "+91 88776 65544", department: "Sales", designation: "Business Development", employmentType: "full-time", status: "active", reportingManager: "Vikram Nair", joiningDate: "2022-02-14", location: "Pune", salary: 115000, avatar: "PA", skills: ["Lead Generation", "Cold Calling", "LinkedIn", "HubSpot"] },
  { id: "EMP-012", name: "Nikhil Shah", email: "nikhil.shah@teamsync.io", phone: "+91 77665 54433", department: "Sales", designation: "Account Executive", employmentType: "full-time", status: "active", reportingManager: "Vikram Nair", joiningDate: "2023-04-03", location: "Surat", salary: 95000, avatar: "NS", skills: ["Account Management", "Upselling", "Zoho CRM"] },
  { id: "EMP-013", name: "Tanya Khanna", email: "tanya.khanna@teamsync.io", phone: "+91 66554 43322", department: "Sales", designation: "Account Executive", employmentType: "full-time", status: "on-leave", reportingManager: "Vikram Nair", joiningDate: "2023-08-28", location: "Jaipur", salary: 92000, avatar: "TK", skills: ["Client Relations", "Presentations", "Sales Funnel"] },
  { id: "EMP-014", name: "Kavya Reddy", email: "kavya.reddy@teamsync.io", phone: "+91 55443 32211", department: "Finance", designation: "Finance Manager", employmentType: "full-time", status: "active", reportingManager: "Arjun Kapoor", joiningDate: "2021-07-22", location: "Hyderabad", salary: 165000, avatar: "KR", skills: ["Financial Planning", "Budgeting", "Audit", "Tally ERP"] },
  { id: "EMP-015", name: "Suresh Iyer", email: "suresh.iyer@teamsync.io", phone: "+91 44332 21100", department: "Finance", designation: "Accountant", employmentType: "full-time", status: "active", reportingManager: "Kavya Reddy", joiningDate: "2022-06-30", location: "Chennai", salary: 100000, avatar: "SI", skills: ["GST", "TDS", "Bookkeeping", "Reconciliation"] },
  { id: "EMP-016", name: "Ritu Bansal", email: "ritu.bansal@teamsync.io", phone: "+91 33221 10099", department: "Finance", designation: "Financial Analyst", employmentType: "contract", status: "active", reportingManager: "Kavya Reddy", joiningDate: "2024-02-01", location: "Delhi", salary: 110000, avatar: "RB", skills: ["Financial Modeling", "Excel", "Forecasting", "MIS"] },
  { id: "EMP-017", name: "Sneha Patel", email: "sneha.patel@teamsync.io", phone: "+91 22110 09988", department: "HR", designation: "HR Manager", employmentType: "full-time", status: "active", reportingManager: "Arjun Kapoor", joiningDate: "2021-08-10", location: "Mumbai", salary: 150000, avatar: "SP", skills: ["Recruitment", "Payroll", "Compliance", "Policy"] },
  { id: "EMP-018", name: "Nisha Choudhary", email: "nisha.choudhary@teamsync.io", phone: "+91 11009 98877", department: "HR", designation: "Talent Acquisition", employmentType: "full-time", status: "active", reportingManager: "Sneha Patel", joiningDate: "2023-05-05", location: "Delhi", skills: ["Sourcing", "Interviews", "ATS", "LinkedIn"], avatar: "NC", salary: 95000 },
  { id: "EMP-019", name: "Pooja Bhat", email: "pooja.bhat@teamsync.io", phone: "+91 10998 87766", department: "HR", designation: "HR Executive", employmentType: "full-time", status: "active", reportingManager: "Sneha Patel", joiningDate: "2023-09-12", location: "Bengaluru", salary: 85000, avatar: "PB", skills: ["Employee Relations", "HRMS", "Onboarding"] },
  { id: "EMP-020", name: "Arjun Kapoor", email: "arjun.kapoor@teamsync.io", phone: "+91 90099 00011", department: "Engineering", designation: "CEO & Co-Founder", employmentType: "full-time", status: "active", reportingManager: "", joiningDate: "2020-01-01", location: "Mumbai", salary: 500000, avatar: "AK", skills: ["Vision", "Leadership", "Product", "Strategy"] },
];

export const attendanceRecords: AttendanceRecord[] = [
  { id: "ATT-001", employeeId: "EMP-001", employeeName: "Rohan Mehta", date: "2026-02-28", checkIn: "09:05", checkOut: "18:30", status: "present", hoursWorked: 9.4 },
  { id: "ATT-002", employeeId: "EMP-001", employeeName: "Rohan Mehta", date: "2026-02-27", checkIn: "09:15", checkOut: "19:00", status: "present", hoursWorked: 9.8 },
  { id: "ATT-003", employeeId: "EMP-001", employeeName: "Rohan Mehta", date: "2026-02-26", checkIn: "10:00", checkOut: "18:00", status: "wfh", hoursWorked: 8.0 },
  { id: "ATT-004", employeeId: "EMP-001", employeeName: "Rohan Mehta", date: "2026-02-25", checkIn: "09:00", checkOut: "13:00", status: "half-day", hoursWorked: 4.0 },
  { id: "ATT-005", employeeId: "EMP-001", employeeName: "Rohan Mehta", date: "2026-02-24", checkIn: "-", checkOut: "-", status: "absent", hoursWorked: 0 },
  { id: "ATT-006", employeeId: "EMP-002", employeeName: "Ananya Singh", date: "2026-02-28", checkIn: "09:30", checkOut: "18:45", status: "present", hoursWorked: 9.3 },
  { id: "ATT-007", employeeId: "EMP-002", employeeName: "Ananya Singh", date: "2026-02-27", checkIn: "09:00", checkOut: "18:00", status: "present", hoursWorked: 9.0 },
  { id: "ATT-008", employeeId: "EMP-002", employeeName: "Ananya Singh", date: "2026-02-26", checkIn: "10:15", checkOut: "19:15", status: "wfh", hoursWorked: 9.0 },
  { id: "ATT-009", employeeId: "EMP-002", employeeName: "Ananya Singh", date: "2026-02-25", checkIn: "09:05", checkOut: "18:05", status: "present", hoursWorked: 9.0 },
  { id: "ATT-010", employeeId: "EMP-002", employeeName: "Ananya Singh", date: "2026-02-24", checkIn: "09:10", checkOut: "18:10", status: "present", hoursWorked: 9.0 },
  { id: "ATT-011", employeeId: "EMP-017", employeeName: "Sneha Patel", date: "2026-02-28", checkIn: "08:55", checkOut: "17:55", status: "present", hoursWorked: 9.0 },
  { id: "ATT-012", employeeId: "EMP-017", employeeName: "Sneha Patel", date: "2026-02-27", checkIn: "09:00", checkOut: "18:30", status: "present", hoursWorked: 9.5 },
  { id: "ATT-013", employeeId: "EMP-017", employeeName: "Sneha Patel", date: "2026-02-26", checkIn: "09:20", checkOut: "18:20", status: "wfh", hoursWorked: 9.0 },
  { id: "ATT-014", employeeId: "EMP-010", employeeName: "Vikram Nair", date: "2026-02-28", checkIn: "09:00", checkOut: "19:00", status: "present", hoursWorked: 10.0 },
  { id: "ATT-015", employeeId: "EMP-010", employeeName: "Vikram Nair", date: "2026-02-27", checkIn: "-", checkOut: "-", status: "absent", hoursWorked: 0 },
  { id: "ATT-016", employeeId: "EMP-003", employeeName: "Karan Joshi", date: "2026-02-28", checkIn: "10:00", checkOut: "19:00", status: "wfh", hoursWorked: 9.0 },
  { id: "ATT-017", employeeId: "EMP-006", employeeName: "Priya Sharma", date: "2026-02-28", checkIn: "08:45", checkOut: "17:45", status: "present", hoursWorked: 9.0 },
  { id: "ATT-018", employeeId: "EMP-014", employeeName: "Kavya Reddy", date: "2026-02-28", checkIn: "09:30", checkOut: "18:00", status: "present", hoursWorked: 8.5 },
  { id: "ATT-019", employeeId: "EMP-005", employeeName: "Siddharth Kumar", date: "2026-02-28", checkIn: "11:00", checkOut: "20:00", status: "wfh", hoursWorked: 9.0 },
  { id: "ATT-020", employeeId: "EMP-004", employeeName: "Divya Rao", date: "2026-02-28", checkIn: "-", checkOut: "-", status: "absent", hoursWorked: 0 },
  { id: "ATT-021", employeeId: "EMP-007", employeeName: "Rahul Verma", date: "2026-02-28", checkIn: "09:15", checkOut: "18:00", status: "present", hoursWorked: 8.8 },
  { id: "ATT-022", employeeId: "EMP-008", employeeName: "Meera Pillai", date: "2026-02-28", checkIn: "09:45", checkOut: "18:45", status: "present", hoursWorked: 9.0 },
  { id: "ATT-023", employeeId: "EMP-011", employeeName: "Pooja Agarwal", date: "2026-02-28", checkIn: "09:00", checkOut: "18:00", status: "present", hoursWorked: 9.0 },
  { id: "ATT-024", employeeId: "EMP-015", employeeName: "Suresh Iyer", date: "2026-02-28", checkIn: "09:10", checkOut: "17:10", status: "half-day", hoursWorked: 4.0 },
  { id: "ATT-025", employeeId: "EMP-018", employeeName: "Nisha Choudhary", date: "2026-02-28", checkIn: "09:30", checkOut: "18:30", status: "present", hoursWorked: 9.0 },
];

export const leaveRequests: LeaveRequest[] = [
  { id: "LVE-001", employeeId: "EMP-004", employeeName: "Divya Rao", type: "sick", startDate: "2026-02-20", endDate: "2026-02-28", days: 7, reason: "Viral fever and doctor-advised rest", status: "approved", appliedOn: "2026-02-19" },
  { id: "LVE-002", employeeId: "EMP-013", employeeName: "Tanya Khanna", type: "maternity", startDate: "2026-02-15", endDate: "2026-05-15", days: 90, reason: "Maternity leave", status: "approved", appliedOn: "2026-02-10" },
  { id: "LVE-003", employeeId: "EMP-007", employeeName: "Rahul Verma", type: "casual", startDate: "2026-03-05", endDate: "2026-03-06", days: 2, reason: "Family function — sister's wedding", status: "pending", appliedOn: "2026-02-25" },
  { id: "LVE-004", employeeId: "EMP-012", employeeName: "Nikhil Shah", type: "annual", startDate: "2026-03-15", endDate: "2026-03-22", days: 6, reason: "Family vacation to Goa", status: "pending", appliedOn: "2026-02-27" },
  { id: "LVE-005", employeeId: "EMP-002", employeeName: "Ananya Singh", type: "sick", startDate: "2026-02-10", endDate: "2026-02-11", days: 2, reason: "Severe migraine", status: "approved", appliedOn: "2026-02-10" },
  { id: "LVE-006", employeeId: "EMP-008", employeeName: "Meera Pillai", type: "casual", startDate: "2026-03-01", endDate: "2026-03-01", days: 1, reason: "Personal work", status: "pending", appliedOn: "2026-02-28" },
  { id: "LVE-007", employeeId: "EMP-015", employeeName: "Suresh Iyer", type: "annual", startDate: "2026-01-26", endDate: "2026-01-28", days: 3, reason: "Republic Day holiday extension — family trip", status: "approved", appliedOn: "2026-01-20" },
  { id: "LVE-008", employeeId: "EMP-019", employeeName: "Pooja Bhat", type: "casual", startDate: "2026-02-14", endDate: "2026-02-14", days: 1, reason: "Personal appointment", status: "rejected", appliedOn: "2026-02-13" },
  { id: "LVE-009", employeeId: "EMP-009", employeeName: "Arjun Bose", type: "sick", startDate: "2026-03-03", endDate: "2026-03-04", days: 2, reason: "Stomach infection, doctor visit required", status: "pending", appliedOn: "2026-02-28" },
  { id: "LVE-010", employeeId: "EMP-016", employeeName: "Ritu Bansal", type: "annual", startDate: "2026-03-20", endDate: "2026-03-25", days: 4, reason: "Travel plans — Rajasthan trip", status: "pending", appliedOn: "2026-02-26" },
];

export const payrollEntries: PayrollEntry[] = [
  { id: "PAY-001", employeeId: "EMP-001", employeeName: "Rohan Mehta", month: "Feb 2026", grossSalary: 180000, deductions: 21600, netSalary: 158400, status: "pending", payDate: "2026-02-28" },
  { id: "PAY-002", employeeId: "EMP-002", employeeName: "Ananya Singh", month: "Feb 2026", grossSalary: 140000, deductions: 16800, netSalary: 123200, status: "pending", payDate: "2026-02-28" },
  { id: "PAY-003", employeeId: "EMP-017", employeeName: "Sneha Patel", month: "Feb 2026", grossSalary: 150000, deductions: 18000, netSalary: 132000, status: "pending", payDate: "2026-02-28" },
  { id: "PAY-004", employeeId: "EMP-010", employeeName: "Vikram Nair", month: "Feb 2026", grossSalary: 170000, deductions: 20400, netSalary: 149600, status: "pending", payDate: "2026-02-28" },
  { id: "PAY-005", employeeId: "EMP-001", employeeName: "Rohan Mehta", month: "Jan 2026", grossSalary: 180000, deductions: 21600, netSalary: 158400, status: "processed", payDate: "2026-01-31" },
  { id: "PAY-006", employeeId: "EMP-002", employeeName: "Ananya Singh", month: "Jan 2026", grossSalary: 140000, deductions: 16800, netSalary: 123200, status: "processed", payDate: "2026-01-31" },
  { id: "PAY-007", employeeId: "EMP-017", employeeName: "Sneha Patel", month: "Jan 2026", grossSalary: 150000, deductions: 18000, netSalary: 132000, status: "processed", payDate: "2026-01-31" },
  { id: "PAY-008", employeeId: "EMP-010", employeeName: "Vikram Nair", month: "Jan 2026", grossSalary: 170000, deductions: 20400, netSalary: 149600, status: "processed", payDate: "2026-01-31" },
  { id: "PAY-009", employeeId: "EMP-001", employeeName: "Rohan Mehta", month: "Dec 2025", grossSalary: 180000, deductions: 21600, netSalary: 158400, status: "processed", payDate: "2025-12-31" },
  { id: "PAY-010", employeeId: "EMP-002", employeeName: "Ananya Singh", month: "Dec 2025", grossSalary: 140000, deductions: 16800, netSalary: 123200, status: "processed", payDate: "2025-12-31" },
  { id: "PAY-011", employeeId: "EMP-004", employeeName: "Divya Rao", month: "Feb 2026", grossSalary: 155000, deductions: 18600, netSalary: 136400, status: "on-hold", payDate: "2026-02-28" },
  { id: "PAY-012", employeeId: "EMP-006", employeeName: "Priya Sharma", month: "Feb 2026", grossSalary: 160000, deductions: 19200, netSalary: 140800, status: "pending", payDate: "2026-02-28" },
];

export const performanceReviews: PerformanceReview[] = [
  { id: "REV-001", employeeId: "EMP-001", employeeName: "Rohan Mehta", reviewCycle: "Q4 2025", rating: 4.5, reviewer: "Arjun Kapoor", status: "acknowledged", completedDate: "2026-01-15", goals: ["Migrate to microservices", "Team mentorship", "99.9% uptime"], feedback: "Exceptional performance this quarter. Led the backend architecture migration successfully." },
  { id: "REV-002", employeeId: "EMP-002", employeeName: "Ananya Singh", reviewCycle: "Q4 2025", rating: 4.0, reviewer: "Rohan Mehta", status: "acknowledged", completedDate: "2026-01-18", goals: ["API optimization", "Unit test coverage 80%", "Documentation"], feedback: "Solid contributor. API performance improvements reduced latency by 40%." },
  { id: "REV-003", employeeId: "EMP-006", employeeName: "Priya Sharma", reviewCycle: "Q4 2025", rating: 4.8, reviewer: "Arjun Kapoor", status: "acknowledged", completedDate: "2026-01-20", goals: ["Process automation", "Team headcount scaling", "ISO compliance"], feedback: "Outstanding leader. Automated 3 core operational processes saving 20 hrs/week." },
  { id: "REV-004", employeeId: "EMP-010", employeeName: "Vikram Nair", reviewCycle: "Q4 2025", rating: 4.2, reviewer: "Arjun Kapoor", status: "submitted", completedDate: "2026-01-22", goals: ["₹2Cr quarterly revenue", "10 new enterprise accounts", "Expand to South India"], feedback: "Good quarter overall. Missed south India target but exceeded enterprise account acquisition." },
  { id: "REV-005", employeeId: "EMP-017", employeeName: "Sneha Patel", reviewCycle: "Q4 2025", rating: 4.6, reviewer: "Arjun Kapoor", status: "submitted", completedDate: "2026-01-25", goals: ["Reduce attrition to <5%", "HRMS implementation", "Policy revamp"], feedback: "Excellent execution. HRMS implementation completed on time. Attrition dropped to 3.2%." },
  { id: "REV-006", employeeId: "EMP-014", employeeName: "Kavya Reddy", reviewCycle: "Q4 2025", rating: 4.3, reviewer: "Arjun Kapoor", status: "pending", completedDate: "", goals: ["Close FY books", "Reduce DSO", "Implement AI budgeting"], feedback: "" },
  { id: "REV-007", employeeId: "EMP-007", employeeName: "Rahul Verma", reviewCycle: "Q4 2025", rating: 3.8, reviewer: "Priya Sharma", status: "submitted", completedDate: "2026-01-28", goals: ["Process documentation", "Team training", "SLA adherence"], feedback: "Meets expectations. Process docs completed. Can improve on cross-team collaboration." },
  { id: "REV-008", employeeId: "EMP-003", employeeName: "Karan Joshi", reviewCycle: "Q4 2025", rating: 4.1, reviewer: "Rohan Mehta", status: "pending", completedDate: "", goals: ["Design system contribution", "Page load optimization", "Accessibility audit"], feedback: "" },
];

export const goals: Goal[] = [
  { id: "GOAL-001", employeeId: "EMP-001", employeeName: "Rohan Mehta", title: "Migrate monolith to microservices", description: "Break down the legacy monolith into domain-driven microservices by Q1 end", targetDate: "2026-03-31", progress: 65, status: "on-track" },
  { id: "GOAL-002", employeeId: "EMP-002", employeeName: "Ananya Singh", title: "Achieve 80% unit test coverage", description: "Write unit tests for all critical API endpoints and business logic", targetDate: "2026-03-15", progress: 72, status: "on-track" },
  { id: "GOAL-003", employeeId: "EMP-017", employeeName: "Sneha Patel", title: "Implement HRMS v2 modules", description: "Roll out leave, attendance, and payroll modules for all 20 employees", targetDate: "2026-03-01", progress: 88, status: "on-track" },
  { id: "GOAL-004", employeeId: "EMP-010", employeeName: "Vikram Nair", title: "Onboard 10 enterprise clients Q1", description: "Sign and onboard 10 new enterprise accounts with ACV > ₹5L each", targetDate: "2026-03-31", progress: 40, status: "at-risk" },
  { id: "GOAL-005", employeeId: "EMP-006", employeeName: "Priya Sharma", title: "Automate 5 operational workflows", description: "Use n8n to automate repetitive operational tasks across finance and ops teams", targetDate: "2026-02-28", progress: 100, status: "completed" },
  { id: "GOAL-006", employeeId: "EMP-014", employeeName: "Kavya Reddy", title: "Close FY26 audit by March 31", description: "Prepare all financial statements and close external audit with zero findings", targetDate: "2026-03-31", progress: 30, status: "on-track" },
  { id: "GOAL-007", employeeId: "EMP-003", employeeName: "Karan Joshi", title: "Build accessible design system", description: "Document and implement WCAG 2.1 AA compliant design tokens and components", targetDate: "2026-04-15", progress: 20, status: "at-risk" },
  { id: "GOAL-008", employeeId: "EMP-011", employeeName: "Pooja Agarwal", title: "Generate 50 qualified leads/month", description: "Build outbound engine to consistently generate 50+ MQLs per month via LinkedIn + email", targetDate: "2026-03-31", progress: 55, status: "on-track" },
  { id: "GOAL-009", employeeId: "EMP-007", employeeName: "Rahul Verma", title: "Document all SOPs by Feb end", description: "Write and publish standard operating procedures for all operational workflows", targetDate: "2026-02-28", progress: 100, status: "completed" },
  { id: "GOAL-010", employeeId: "EMP-018", employeeName: "Nisha Choudhary", title: "Hire 8 roles by Q1 end", description: "Close open positions across Engineering (4), Sales (2), and Operations (2)", targetDate: "2026-03-31", progress: 38, status: "at-risk" },
];

export const hrPolicies: HrPolicy[] = [
  { id: "POL-001", title: "Leave Policy 2026", category: "leave", updatedDate: "2026-01-01", description: "Covers casual leave (12 days), sick leave (12 days), annual leave (18 days), and special leaves including maternity (90 days) and paternity (15 days). All leaves require prior approval except sick leave.", fileType: "pdf" },
  { id: "POL-002", title: "Code of Conduct", category: "code-of-conduct", updatedDate: "2025-10-15", description: "Defines expected professional behavior, workplace ethics, anti-harassment policies, and disciplinary procedures for all employees and contractors.", fileType: "pdf" },
  { id: "POL-003", title: "Payroll & Compensation Policy", category: "payroll", updatedDate: "2026-01-01", description: "Outlines salary structure, pay cycles (last working day of month), PF deductions (12% of basic), TDS calculation methodology, and bonus disbursement criteria.", fileType: "pdf" },
  { id: "POL-004", title: "Employee Benefits Guide", category: "benefits", updatedDate: "2025-11-20", description: "Details health insurance coverage (₹5L sum insured for self and family), term life cover (10x CTC), meal allowances, learning & development budget (₹50K/year), and gym reimbursement.", fileType: "pdf" },
  { id: "POL-005", title: "Remote Work Policy", category: "remote-work", updatedDate: "2025-09-01", description: "Governs work-from-home eligibility, expected online hours (10am–6pm IST), equipment provisioning, internet allowance (₹1,500/month), and data security requirements for remote employees.", fileType: "pdf" },
  { id: "POL-006", title: "Performance Review Process", category: "code-of-conduct", updatedDate: "2026-01-10", description: "Outlines the bi-annual performance review cycle, OKR-setting process, rating scale (1–5), calibration process, and linkage to increment and promotion decisions.", fileType: "pdf" },
];

export const holidays: Holiday[] = [
  { id: "HOL-001", name: "Republic Day", date: "2026-01-26", type: "national" },
  { id: "HOL-002", name: "Holi", date: "2026-03-04", type: "national" },
  { id: "HOL-003", name: "Good Friday", date: "2026-04-03", type: "national" },
  { id: "HOL-004", name: "Eid ul-Fitr", date: "2026-03-31", type: "national" },
  { id: "HOL-005", name: "Independence Day", date: "2026-08-15", type: "national" },
  { id: "HOL-006", name: "Gandhi Jayanti", date: "2026-10-02", type: "national" },
  { id: "HOL-007", name: "Diwali", date: "2026-11-09", type: "national" },
  { id: "HOL-008", name: "Christmas Day", date: "2026-12-25", type: "national" },
  { id: "HOL-009", name: "Dussehra", date: "2026-10-20", type: "optional" },
  { id: "HOL-010", name: "Mahashivratri", date: "2026-02-18", type: "optional" },
  { id: "HOL-011", name: "TeamSync Foundation Day", date: "2026-06-01", type: "company" },
  { id: "HOL-012", name: "Year-End Company Break", date: "2026-12-26", type: "company" },
];

export const orgChart: OrgNode = {
  id: "EMP-020",
  name: "Arjun Kapoor",
  role: "CEO & Co-Founder",
  department: "Leadership",
  reportingTo: null,
  avatar: "AK",
  children: [
    {
      id: "EMP-001",
      name: "Rohan Mehta",
      role: "Engineering Lead",
      department: "Engineering",
      reportingTo: "EMP-020",
      avatar: "RM",
      children: [
        { id: "EMP-002", name: "Ananya Singh", role: "Backend Engineer", department: "Engineering", reportingTo: "EMP-001", avatar: "AS", children: [] },
        { id: "EMP-003", name: "Karan Joshi", role: "Frontend Engineer", department: "Engineering", reportingTo: "EMP-001", avatar: "KJ", children: [] },
        { id: "EMP-004", name: "Divya Rao", role: "DevOps Engineer", department: "Engineering", reportingTo: "EMP-001", avatar: "DR", children: [] },
        { id: "EMP-005", name: "Siddharth Kumar", role: "Backend Engineer", department: "Engineering", reportingTo: "EMP-001", avatar: "SK", children: [] },
      ],
    },
    {
      id: "EMP-006",
      name: "Priya Sharma",
      role: "Operations Head",
      department: "Operations",
      reportingTo: "EMP-020",
      avatar: "PS",
      children: [
        { id: "EMP-007", name: "Rahul Verma", role: "Process Lead", department: "Operations", reportingTo: "EMP-006", avatar: "RV", children: [] },
        { id: "EMP-008", name: "Meera Pillai", role: "Ops Analyst", department: "Operations", reportingTo: "EMP-006", avatar: "MP", children: [] },
        { id: "EMP-009", name: "Arjun Bose", role: "Ops Analyst", department: "Operations", reportingTo: "EMP-006", avatar: "AB", children: [] },
      ],
    },
    {
      id: "EMP-010",
      name: "Vikram Nair",
      role: "Sales Manager",
      department: "Sales",
      reportingTo: "EMP-020",
      avatar: "VN",
      children: [
        { id: "EMP-011", name: "Pooja Agarwal", role: "Business Development", department: "Sales", reportingTo: "EMP-010", avatar: "PA", children: [] },
        { id: "EMP-012", name: "Nikhil Shah", role: "Account Executive", department: "Sales", reportingTo: "EMP-010", avatar: "NS", children: [] },
        { id: "EMP-013", name: "Tanya Khanna", role: "Account Executive", department: "Sales", reportingTo: "EMP-010", avatar: "TK", children: [] },
      ],
    },
    {
      id: "EMP-014",
      name: "Kavya Reddy",
      role: "Finance Manager",
      department: "Finance",
      reportingTo: "EMP-020",
      avatar: "KR",
      children: [
        { id: "EMP-015", name: "Suresh Iyer", role: "Accountant", department: "Finance", reportingTo: "EMP-014", avatar: "SI", children: [] },
        { id: "EMP-016", name: "Ritu Bansal", role: "Financial Analyst", department: "Finance", reportingTo: "EMP-014", avatar: "RB", children: [] },
      ],
    },
    {
      id: "EMP-017",
      name: "Sneha Patel",
      role: "HR Manager",
      department: "HR",
      reportingTo: "EMP-020",
      avatar: "SP",
      children: [
        { id: "EMP-018", name: "Nisha Choudhary", role: "Talent Acquisition", department: "HR", reportingTo: "EMP-017", avatar: "NC", children: [] },
        { id: "EMP-019", name: "Pooja Bhat", role: "HR Executive", department: "HR", reportingTo: "EMP-017", avatar: "PB", children: [] },
      ],
    },
  ],
};
