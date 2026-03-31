export interface PortalClient {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  joinedAt: string;
}

export interface FormationStage {
  id: string;
  name: string;
  status: "completed" | "in-progress" | "pending";
  completedAt?: string;
  description: string;
}

export interface PortalCompany {
  id: string;
  name: string;
  entityType: "LLC" | "Corporation" | "S-Corp";
  state: string;
  package: "Basic" | "Standard" | "Premium";
  status: "completed" | "in-progress" | "pending";
  filedAt?: string;
  completedAt?: string;
  einNumber?: string;
  stages: FormationStage[];
}

export interface PortalDocument {
  id: string;
  companyId: string;
  companyName: string;
  name: string;
  category: "formation" | "tax" | "compliance" | "identity" | "banking";
  type: "uploaded" | "generated";
  uploadedAt: string;
  size: string;
  status: "verified" | "pending-review" | "action-required";
}

export interface PortalInvoice {
  id: string;
  number: string;
  description: string;
  companyName: string;
  amount: number;
  currency: string;
  status: "paid" | "pending" | "overdue";
  issuedAt: string;
  dueDate: string;
  paidAt?: string;
}

export interface PortalMessage {
  id: string;
  from: string;
  fromRole: string;
  isClient: boolean;
  content: string;
  timestamp: string;
  read: boolean;
}

export interface PortalActivity {
  id: string;
  type: "document" | "stage" | "payment" | "message" | "compliance";
  title: string;
  description: string;
  timestamp: string;
  icon: string;
}
