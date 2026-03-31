export interface VerticalMember {
  id: string;
  verticalId: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  status: "online" | "away" | "offline";
  location: string;
  skills: string[];
  joinedDate: string;
}

export interface ChatChannel {
  id: string;
  verticalId: string;
  name: string;
  type: "channel" | "dm";
  description: string;
  memberNames: string[];
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isPinned: boolean;
}

export interface ChatMessage {
  id: string;
  channelId: string;
  senderName: string;
  content: string;
  timestamp: string;
  isMe: boolean;
}

export interface SharedResource {
  id: string;
  verticalId: string;
  title: string;
  description: string;
  category: "Brochure" | "Script" | "Spreadsheet" | "Link" | "Presentation" | "Document" | "Template" | "Process" | "SOP" | "Playbook" | "Workflow" | "Learning";
  type: "pdf" | "excel" | "ppt" | "doc" | "link" | "image" | "knowledge";
  tags: string[];
  addedBy: string;
  addedDate: string;
  fileSize: string;
  url: string;
  isPinned: boolean;
  version: string;
  content?: string;
}

export interface SharedTaskSubtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface SharedTask {
  id: string;
  taskCode?: string;
  verticalId: string;
  title: string;
  description: string;
  status: "backlog" | "todo" | "in-progress" | "review" | "done";
  priority: "critical" | "high" | "medium" | "low";
  assigneeName: string;
  dueDate: string;
  tags: string[];
  createdDate: string;
  subtasks: SharedTaskSubtask[];
}

export interface ExternalApp {
  id: string;
  verticalId: string;
  appName: string;
  url: string;
  category: "hosting" | "database" | "ai" | "payment" | "analytics" | "communication" | "design" | "docs" | "crm" | "hr" | "productivity" | "other";
  status: "active" | "expired" | "pending";
  environment: "production" | "staging" | "dev";
  apiKeyHint: string;
  notes: string;
  addedDate: string;
  iconName: string;
  isGlobal?: boolean;
  email?: string;
  password?: string;
  loginUrl?: string;
}

export interface QuickAddTemplate {
  appName: string;
  url: string;
  loginUrl: string;
  category: ExternalApp["category"];
  iconName: string;
  description: string;
}

export type NotificationType = "order" | "fulfillment" | "inventory" | "finance" | "retailer" | "application" | "system" | "quotation";
export interface AppNotification {
  id: string;
  verticalId: string;
  type: NotificationType;
  title: string;
  description: string;
  time: string;
  url: string;
  isRead: boolean;
}
