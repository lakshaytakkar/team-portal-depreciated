export interface DevPrompt {
  id: string;
  title: string;
  content: string;
  category: "agent" | "frontend" | "backend" | "database" | "debug" | "audit" | "testing" | "ux" | "seo" | "security" | "performance" | "devops";
  scope: "narrow" | "broad";
  tags: string[];
  model: "claude" | "gpt" | "replit-agent";
  lastUsed: string;
  createdDate: string;
  isFavorite: boolean;
}

export interface DevResource {
  id: string;
  title: string;
  description: string;
  category: "process" | "learning" | "playbook" | "workflow";
  tags: string[];
  createdDate: string;
  updatedDate: string;
  content: string;
}

export interface AppCredential {
  id: string;
  appName: string;
  url: string;
  category: "hosting" | "database" | "ai" | "payment" | "analytics" | "other";
  status: "active" | "expired" | "pending";
  environment: "production" | "staging" | "dev";
  apiKeyHint: string;
  notes: string;
  addedDate: string;
  iconName: string;
  scope: "universal" | "project";
}

export interface ProjectLink {
  id: string;
  projectId: string;
  service: "github" | "replit" | "supabase" | "vercel" | "figma" | "notion" | "other";
  url: string;
  label: string;
  iconName: string;
}

export interface ProjectCredential {
  id: string;
  projectId: string;
  appName: string;
  category: "hosting" | "database" | "ai" | "payment" | "analytics" | "other";
  environment: "production" | "staging" | "dev";
  apiKeyHint: string;
  status: "active" | "expired" | "pending";
  notes: string;
  iconName: string;
  url: string;
}

export interface ImportantLink {
  id: string;
  title: string;
  url: string;
  category: "tool" | "docs" | "dashboard" | "repo";
  description: string;
  iconName: string;
  isPinned: boolean;
}

export interface QuickTool {
  id: string;
  name: string;
  description: string;
  category: "payment" | "utility" | "generator";
  status: "ready" | "wip" | "planned";
  route: string;
  vertical: string;
  iconName: string;
}

export interface DevProject {
  id: string;
  name: string;
  key: string;
  description: string;
  color: string;
  status: "active" | "paused" | "completed" | "archived";
  owner: string;
  memberCount: number;
  taskCount: number;
  completedTaskCount: number;
  createdDate: string;
  updatedDate: string;
}

export interface DevTaskSubtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface DevTaskComment {
  id: string;
  author: string;
  content: string;
  date: string;
}

export interface DevTaskAttachment {
  name: string;
  type: string;
  size: string;
}

export interface DevTask {
  id: string;
  projectId: string;
  projectKey: string;
  title: string;
  description: string;
  status: "backlog" | "todo" | "in-progress" | "in-review" | "done" | "cancelled";
  priority: "critical" | "high" | "medium" | "low";
  type: "feature" | "bug" | "improvement" | "task" | "story";
  assignee: string;
  reporter: string;
  tags: string[];
  dueDate: string;
  createdDate: string;
  updatedDate: string;
  storyPoints: number;
  sprintId?: string;
  subtasks: DevTaskSubtask[];
  comments: DevTaskComment[];
  attachments: DevTaskAttachment[];
}

export interface DevSprint {
  id: string;
  name: string;
  projectId: string;
  status: "active" | "planned" | "completed";
  startDate: string;
  endDate: string;
  taskIds: string[];
}

export interface ClaudeSkill {
  id: string;
  name: string;
  description: string;
  category: "document" | "development" | "design" | "communication" | "testing" | "security" | "automation" | "data";
  source: "official" | "community";
  author: string;
  repoUrl: string;
  installCmd?: string;
  useCase: string;
  relevance: "critical" | "high" | "medium" | "low";
  tags: string[];
  isInstalled: boolean;
  addedDate: string;
}
