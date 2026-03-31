export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  status: "active" | "inactive" | "invited";
  joinedDate: string;
  lastActive: string;
}

export interface SystemStat {
  label: string;
  value: number;
  change: number;
  unit?: string;
}

export interface ActivityLog {
  id: string;
  user: string;
  action: string;
  target: string;
  timestamp: string;
  type: "create" | "update" | "delete" | "login" | "export";
}

export interface Report {
  id: string;
  name: string;
  description: string;
  category: string;
  lastGenerated: string;
  frequency: string;
  status: "ready" | "generating" | "scheduled";
}
