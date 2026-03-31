import { z } from "zod";
import { pgTable, uuid, text, integer, boolean, timestamp, date } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";

export const devProjects = pgTable("dev_projects", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  key: text("key").notNull(),
  description: text("description"),
  color: text("color").notNull().default("#6366f1"),
  status: text("status").notNull().default("active"),
  owner: text("owner").notNull().default("Sneha Patel"),
  verticalId: text("vertical_id").notNull().default("dev"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const devTasks = pgTable("dev_tasks", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: uuid("project_id").references(() => devProjects.id, { onDelete: "cascade" }),
  taskCode: text("task_code"),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").notNull().default("todo"),
  priority: text("priority").notNull().default("medium"),
  type: text("type").notNull().default("task"),
  assignee: text("assignee").notNull().default("Replit Agent"),
  reporter: text("reporter").notNull().default("Sneha Patel"),
  tags: text("tags").array().default(sql`'{}'::text[]`),
  dueDate: date("due_date"),
  storyPoints: integer("story_points"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const devSubtasks = pgTable("dev_subtasks", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  taskId: uuid("task_id").notNull().references(() => devTasks.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  completed: boolean("completed").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const devComments = pgTable("dev_comments", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  taskId: uuid("task_id").notNull().references(() => devTasks.id, { onDelete: "cascade" }),
  author: text("author").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const insertDevProjectSchema = createInsertSchema(devProjects).omit({ id: true, createdAt: true, updatedAt: true });
export const insertDevTaskSchema = createInsertSchema(devTasks).omit({ id: true, createdAt: true, updatedAt: true });
export const insertDevSubtaskSchema = createInsertSchema(devSubtasks).omit({ id: true });
export const insertDevCommentSchema = createInsertSchema(devComments).omit({ id: true, createdAt: true });

export type DevProjectRecord = typeof devProjects.$inferSelect;
export type InsertDevProject = z.infer<typeof insertDevProjectSchema>;
export type DevTaskRecord = typeof devTasks.$inferSelect;
export type InsertDevTask = z.infer<typeof insertDevTaskSchema>;
export type DevSubtaskRecord = typeof devSubtasks.$inferSelect;
export type InsertDevSubtask = z.infer<typeof insertDevSubtaskSchema>;
export type DevCommentRecord = typeof devComments.$inferSelect;
export type InsertDevComment = z.infer<typeof insertDevCommentSchema>;

export interface FormationClient {
  id: string;
  clientName: string;
  companyName: string;
  companyType: "LLC" | "Corp" | "S-Corp";
  state: string;
  packageType: "Basic" | "Standard" | "Premium";
  assignedManager: string;
  currentStage: number;
  priority: "high" | "medium" | "low";
  riskFlag: "at-risk" | "delayed" | "on-track";
  startDate: string;
  expectedCompletion: string;
  notes: string;
  email: string;
  phone: string;
}

export interface StageChecklist {
  id: string;
  clientId: string;
  stage: number;
  item: string;
  responsible: string;
  deadline: string;
  completed: boolean;
  documentAttachment?: string;
}

export interface ClientDocument {
  id: string;
  clientId: string;
  clientName: string;
  title: string;
  category: "Articles" | "EIN Letter" | "BOI Receipt" | "Operating Agreement" | "Bank Docs" | "Passport" | "Address Proof" | "Filing Receipt" | "IRS Confirmation" | "Other";
  stage: number;
  uploadDate: string;
  uploadedBy: string;
  fileSize: string;
  status: "uploaded" | "pending" | "verified";
}

export interface ComplianceItem {
  id: string;
  clientId: string;
  companyName: string;
  type: "annual-report" | "boi-recheck" | "irs-compliance" | "state-alert";
  dueDate: string;
  status: "upcoming" | "overdue" | "completed";
  state: string;
  notes: string;
}

export interface FormationTask {
  id: string;
  clientId: string;
  clientName: string;
  title: string;
  description: string;
  assignedTo: string;
  dueDate: string;
  priority: "high" | "medium" | "low";
  status: "pending" | "in-progress" | "completed" | "overdue";
  stage: number;
  autoGenerated: boolean;
}

export interface Escalation {
  id: string;
  clientId: string;
  companyName: string;
  type: "delayed" | "missing-docs" | "irs-rejection" | "bank-rejection" | "client-unresponsive";
  severity: "critical" | "warning";
  createdDate: string;
  resolvedDate?: string;
  assignedTo: string;
  notes: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: "ops-manager" | "executive" | "admin";
  activeClients: number;
  completedThisMonth: number;
  avgCompletionDays: number;
  email: string;
}

export interface FormationMetric {
  month: string;
  formations: number;
  completed: number;
  avgDays: number;
  rejections: number;
}

export interface StageDefinition {
  id: string;
  number: number;
  name: string;
  description: string;
  checklistTemplate: string[];
}

export interface DocumentTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  lastUpdated: string;
  version: string;
}

export const stageDefinitions: StageDefinition[] = [
  { id: "STG-0", number: 0, name: "Lead Converted", description: "Payment received, package selected, client ID generated", checklistTemplate: ["Payment confirmed", "Package selected", "Client ID generated", "Assigned to Ops Manager"] },
  { id: "STG-1", number: 1, name: "Intake", description: "KYC docs collected, formation state finalized", checklistTemplate: ["Passport collected", "Address proof collected", "Email confirmed", "Formation state finalized", "KYC verification complete"] },
  { id: "STG-2", number: 2, name: "Formation Filed", description: "Articles submitted, filing receipt uploaded", checklistTemplate: ["Articles of incorporation drafted", "Articles submitted to state", "Filing receipt uploaded", "Registered agent confirmed"] },
  { id: "STG-3", number: 3, name: "EIN", description: "EIN applied and IRS confirmation received", checklistTemplate: ["EIN application submitted", "IRS confirmation received", "EIN letter uploaded", "EIN shared with client"] },
  { id: "STG-4", number: 4, name: "BOI Filing", description: "Beneficial Ownership Information filed", checklistTemplate: ["BOI form completed", "BOI submitted to FinCEN", "BOI confirmation uploaded"] },
  { id: "STG-5", number: 5, name: "Bank / Stripe", description: "Banking and payment processing initiated", checklistTemplate: ["Bank application submitted", "Bank account opened", "Stripe application submitted", "Stripe account verified"] },
  { id: "STG-6", number: 6, name: "Completion", description: "All docs compiled, compliance calendar created, handover complete", checklistTemplate: ["All documents compiled", "Compliance calendar created", "Handover checklist completed", "Client onboarding call done"] },
];

export const insertFormationClientSchema = z.object({
  clientName: z.string().min(1),
  companyName: z.string().min(1),
  companyType: z.enum(["LLC", "Corp", "S-Corp"]),
  state: z.string().min(1),
  packageType: z.enum(["Basic", "Standard", "Premium"]),
  assignedManager: z.string().min(1),
  currentStage: z.number().min(0).max(6),
  priority: z.enum(["high", "medium", "low"]),
  riskFlag: z.enum(["at-risk", "delayed", "on-track"]),
  startDate: z.string().min(1),
  expectedCompletion: z.string().min(1),
  notes: z.string(),
  email: z.string().email(),
  phone: z.string().min(1),
});

export const insertFormationTaskSchema = z.object({
  clientId: z.string().min(1),
  clientName: z.string().min(1),
  title: z.string().min(1),
  description: z.string(),
  assignedTo: z.string().min(1),
  dueDate: z.string().min(1),
  priority: z.enum(["high", "medium", "low"]),
  status: z.enum(["pending", "in-progress", "completed", "overdue"]),
  stage: z.number().min(0).max(6),
  autoGenerated: z.boolean(),
});

export const insertClientDocumentSchema = z.object({
  clientId: z.string().min(1),
  clientName: z.string().min(1),
  title: z.string().min(1),
  category: z.enum(["Articles", "EIN Letter", "BOI Receipt", "Operating Agreement", "Bank Docs", "Passport", "Address Proof", "Filing Receipt", "IRS Confirmation", "Other"]),
  stage: z.number().min(0).max(6),
  uploadDate: z.string().min(1),
  uploadedBy: z.string().min(1),
  fileSize: z.string().min(1),
  status: z.enum(["uploaded", "pending", "verified"]),
});

export type InsertFormationClient = z.infer<typeof insertFormationClientSchema>;
export type InsertFormationTask = z.infer<typeof insertFormationTaskSchema>;
export type InsertClientDocument = z.infer<typeof insertClientDocumentSchema>;
