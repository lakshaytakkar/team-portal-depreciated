export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  employmentType: "full-time" | "part-time" | "contract";
  status: "active" | "on-leave" | "terminated";
  reportingManager: string;
  joiningDate: string;
  location: string;
  salary: number;
  avatar: string;
  skills: string[];
}

export interface HrmsDepartment {
  id: string;
  name: string;
  head: string;
  headId: string;
  headCount: number;
  color: string;
  designations: string[];
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  checkIn: string;
  checkOut: string;
  status: "present" | "absent" | "half-day" | "wfh";
  hoursWorked: number;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  type: "casual" | "sick" | "annual" | "maternity" | "paternity";
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: "pending" | "approved" | "rejected";
  appliedOn: string;
}

export interface PayrollEntry {
  id: string;
  employeeId: string;
  employeeName: string;
  month: string;
  grossSalary: number;
  deductions: number;
  netSalary: number;
  status: "processed" | "pending" | "on-hold";
  payDate: string;
}

export interface PerformanceReview {
  id: string;
  employeeId: string;
  employeeName: string;
  reviewCycle: string;
  rating: number;
  reviewer: string;
  status: "pending" | "submitted" | "acknowledged";
  completedDate: string;
  goals: string[];
  feedback: string;
}

export interface Goal {
  id: string;
  employeeId: string;
  employeeName: string;
  title: string;
  description: string;
  targetDate: string;
  progress: number;
  status: "on-track" | "at-risk" | "completed";
}

export interface HrPolicy {
  id: string;
  title: string;
  category: "leave" | "code-of-conduct" | "payroll" | "benefits" | "remote-work";
  updatedDate: string;
  description: string;
  fileType: string;
}

export interface Holiday {
  id: string;
  name: string;
  date: string;
  type: "national" | "optional" | "company";
}

export interface OrgNode {
  id: string;
  name: string;
  role: string;
  department: string;
  reportingTo: string | null;
  avatar: string;
  children?: OrgNode[];
}
