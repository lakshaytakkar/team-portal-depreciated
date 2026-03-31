import { Router, type Request, type Response } from "express";
import { createOpenAI } from "@ai-sdk/openai";
import { streamText, tool } from "ai";
import { z } from "zod";
import { loadDb, saveDb, genId } from "./db";
import multer from "multer";
import path from "path";
import fs from "fs";
import { requireAuth } from "./auth";
import type { User } from "@shared/schema";

const uploadsDir = path.join(process.cwd(), "uploads", "ai-attachments");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
const upload = multer({
  storage: multer.diskStorage({
    destination: uploadsDir,
    filename: (_req, file, cb) => {
      const safeExt = path.extname(path.basename(file.originalname)).toLowerCase().replace(/[^a-z0-9.]/g, "");
      const uuid = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
      cb(null, `${uuid}${safeExt}`);
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = [".csv", ".txt", ".json", ".png", ".jpg", ".jpeg", ".pdf"];
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, allowed.includes(ext));
  },
});

const aiRouter = Router();
aiRouter.use(requireAuth);

const openai = createOpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY || "dummy",
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

// ── JSON helpers for AI-specific tables ──────────────────────────────────────

function nowStr() { return new Date().toISOString(); }

function getConversations(): any[] { return loadDb()['ai_conversations'] ?? []; }
function getMessages(): any[] { return loadDb()['ai_messages'] ?? []; }
function getAttachments(): any[] { return loadDb()['ai_attachments'] ?? []; }

function saveConversations(rows: any[]) { const db = loadDb(); db['ai_conversations'] = rows; saveDb(db); }
function saveMessages(rows: any[]) { const db = loadDb(); db['ai_messages'] = rows; saveDb(db); }
function saveAttachments(rows: any[]) { const db = loadDb(); db['ai_attachments'] = rows; saveDb(db); }

function insertConversation(data: Record<string, any>) {
  const rows = getConversations();
  const row = { id: genId(), created_at: nowStr(), updated_at: nowStr(), ...data };
  rows.push(row);
  saveConversations(rows);
  return row;
}
function insertMessage(data: Record<string, any>) {
  const rows = getMessages();
  const row = { id: genId(), created_at: nowStr(), ...data };
  rows.push(row);
  saveMessages(rows);
  return row;
}
function insertAttachment(data: Record<string, any>) {
  const rows = getAttachments();
  const row = { id: genId(), created_at: nowStr(), ...data };
  rows.push(row);
  saveAttachments(rows);
  return row;
}

async function verifyConversationOwnership(conversationId: string, userId: string): Promise<boolean> {
  return getConversations().some(c => c.id === conversationId && c.user_id === userId);
}

// ── System prompt ─────────────────────────────────────────────────────────────

function getSystemPrompt(userName: string): string {
  return `You are the Suprans AI Assistant — an intelligent co-pilot for Suprans Business Consulting's CRM portal.

Current user: ${userName}

You help the team with:
- Querying leads, tasks, activities, and team data
- Generating reports and analytics summaries
- Creating and updating records in the system
- Answering business questions about the CRM data
- Providing sales insights and recommendations

Use getSchema to discover which tables and columns are available for your role.

Lead stages: new → contacted → qualified → proposal → negotiation → won / lost
Task statuses: todo, in_progress, review, done
Task priorities: low, medium, high
Lead temperatures: hot, warm, cold

Guidelines:
- Use queryTable or analyticsQuery tools to fetch real data. All accept structured parameters (table, columns, filters, orderBy, limit, aggregates, groupBy).
- Use camelCase field names when filtering (e.g., assignedTo, teamId, createdAt).
- Format numbers and currency in Indian Rupee (₹) format when relevant.
- Keep responses concise but informative.
- When showing tabular data, use markdown tables.
- IMPORTANT: Never execute createRecord, updateRecord, or deleteRecord without first calling proposeMutation and getting a confirmation token. Always explain the planned change first.
- For analytics queries, provide clear summaries with key metrics.`;
}

const pendingMutations = new Map<string, { action: string; table: string; description: string; userId: string; createdAt: number }>();

const ALLOWED_TABLES = ["leads", "tasks", "activities"] as const;
type AllowedTable = typeof ALLOWED_TABLES[number];

function isAllowedTable(t: string): t is AllowedTable {
  return (ALLOWED_TABLES as readonly string[]).includes(t);
}

const ROLE_TABLE_COLUMNS: Record<string, Record<string, string[]>> = {
  superadmin: {
    leads: ["id", "name", "company", "phone", "email", "service", "value", "stage", "assignedTo", "teamId", "source", "address", "rating", "tags", "temperature", "nextFollowUp", "wonAmount", "wonDate", "lostReason", "createdAt"],
    tasks: ["id", "title", "description", "status", "priority", "dueDate", "assignedTo", "teamId", "leadId", "tags", "createdAt"],
    activities: ["id", "leadId", "userId", "type", "notes", "duration", "outcome", "fromStage", "toStage", "createdAt"],
    users: ["id", "name", "email", "role", "phone", "avatar", "officeId", "createdAt"],
    team_members: ["id", "userId", "teamId", "role", "createdAt"],
    employees: ["id", "name", "role", "phone", "whatsapp", "avatar", "isActive", "employmentStatus", "joiningDate"],
    events: ["id", "name", "type", "city", "venue", "date", "capacity", "status", "ticketPrice"],
    event_attendees: ["id", "eventId", "name", "phone", "email", "company", "checkedIn", "ticketStatus"],
    services: ["id", "name", "slug", "category", "shortDescription", "description", "pricing", "isActive"],
  },
  manager: {
    leads: ["id", "name", "company", "phone", "email", "service", "value", "stage", "assignedTo", "teamId", "source", "address", "rating", "tags", "temperature", "nextFollowUp", "wonAmount", "wonDate", "lostReason", "createdAt"],
    tasks: ["id", "title", "description", "status", "priority", "dueDate", "assignedTo", "teamId", "leadId", "tags", "createdAt"],
    activities: ["id", "leadId", "userId", "type", "notes", "duration", "outcome", "fromStage", "toStage", "createdAt"],
    team_members: ["id", "userId", "teamId", "role", "createdAt"],
    events: ["id", "name", "type", "city", "venue", "date", "capacity", "status", "ticketPrice"],
    event_attendees: ["id", "eventId", "name", "phone", "email", "company", "checkedIn", "ticketStatus"],
  },
  sales_executive: {
    leads: ["id", "name", "company", "phone", "email", "service", "value", "stage", "assignedTo", "source", "temperature", "nextFollowUp", "createdAt"],
    tasks: ["id", "title", "description", "status", "priority", "dueDate", "assignedTo", "leadId", "createdAt"],
    activities: ["id", "leadId", "userId", "type", "notes", "duration", "outcome", "createdAt"],
  },
};

function getColumnsForRole(role: string): Record<string, string[]> {
  return ROLE_TABLE_COLUMNS[role] || ROLE_TABLE_COLUMNS.sales_executive;
}

// ── JSON query engine (replaces pgPool) ──────────────────────────────────────

type FilterOp = {
  column: string;
  operator: "=" | "!=" | ">" | "<" | ">=" | "<=" | "LIKE" | "ILIKE" | "IS NULL" | "IS NOT NULL" | "IN";
  value?: string | number | boolean | null | (string | number)[];
};

type AggregateFn = { fn: "COUNT" | "SUM" | "AVG" | "MIN" | "MAX"; column?: string };

function applyFilter(row: Record<string, any>, filter: FilterOp): boolean {
  const val = row[filter.column];
  const fv = filter.value;
  switch (filter.operator) {
    case "IS NULL": return val == null;
    case "IS NOT NULL": return val != null;
    case "IN": return Array.isArray(fv) && fv.includes(val);
    case "=": return val == fv;
    case "!=": return val != fv;
    case ">": return val > (fv as any);
    case "<": return val < (fv as any);
    case ">=": return val >= (fv as any);
    case "<=": return val <= (fv as any);
    case "LIKE":
    case "ILIKE": {
      if (val == null || fv == null) return false;
      const pattern = String(fv).replace(/%/g, ".*").replace(/_/g, ".");
      return new RegExp(`^${pattern}$`, filter.operator === "ILIKE" ? "i" : "").test(String(val));
    }
    default: return true;
  }
}

function execJsonQuery(
  roleColumns: Record<string, string[]>,
  table: string,
  columns: string[] | undefined,
  filters: FilterOp[] | undefined,
  orderByColumn: string | undefined,
  orderDirection: string | undefined,
  limit: number | undefined,
  aggregates: AggregateFn[] | undefined,
  groupByColumns: string[] | undefined,
  rowFilters?: Record<string, { column: string; value: string }>,
): { results?: Record<string, unknown>[]; error?: string } {
  const allowedCols = roleColumns[table];
  if (!allowedCols) return { error: `Table '${table}' is not accessible. Allowed: ${Object.keys(roleColumns).join(", ")}` };

  const db = loadDb();
  let rows: Record<string, any>[] = db[table] ?? [];

  // Apply row-level filters (user scoping)
  const rowFilter = rowFilters?.[table];
  if (rowFilter) {
    rows = rows.filter(r => r[rowFilter.column] === rowFilter.value);
  }

  // Apply user filters
  if (filters && filters.length > 0) {
    for (const f of filters) {
      if (!allowedCols.includes(f.column)) return { error: `Column '${f.column}' not accessible on '${table}'.` };
      rows = rows.filter(r => applyFilter(r, f));
    }
  }

  // Aggregates
  if (aggregates && aggregates.length > 0) {
    if (groupByColumns && groupByColumns.length > 0) {
      const groups = new Map<string, Record<string, any>[]>();
      for (const row of rows) {
        const key = groupByColumns.map(gc => row[gc]).join("|||");
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key)!.push(row);
      }
      const results: Record<string, unknown>[] = [];
      for (const [, groupRows] of groups) {
        const result: Record<string, unknown> = {};
        for (const gc of groupByColumns) result[gc] = groupRows[0][gc];
        for (const agg of aggregates) {
          const col = agg.column && agg.column !== "*" ? agg.column : null;
          const vals = col ? groupRows.map(r => r[col]).filter(v => v != null) : groupRows;
          if (agg.fn === "COUNT") result[`${agg.fn}(${col ?? "*"})`] = groupRows.length;
          else if (agg.fn === "SUM") result[`${agg.fn}(${col})`] = vals.reduce((a: number, b: number) => a + Number(b), 0);
          else if (agg.fn === "AVG") result[`${agg.fn}(${col})`] = vals.length ? vals.reduce((a: number, b: number) => a + Number(b), 0) / vals.length : null;
          else if (agg.fn === "MIN") result[`${agg.fn}(${col})`] = vals.length ? Math.min(...vals.map(Number)) : null;
          else if (agg.fn === "MAX") result[`${agg.fn}(${col})`] = vals.length ? Math.max(...vals.map(Number)) : null;
        }
        results.push(result);
      }
      return { results: results.slice(0, Math.min(limit ?? 100, 100)) };
    }
    // No groupBy
    const result: Record<string, unknown> = {};
    for (const agg of aggregates) {
      const col = agg.column && agg.column !== "*" ? agg.column : null;
      const vals = col ? rows.map(r => r[col]).filter(v => v != null) : rows;
      if (agg.fn === "COUNT") result[`${agg.fn}(${col ?? "*"})`] = rows.length;
      else if (agg.fn === "SUM") result[`${agg.fn}(${col})`] = vals.reduce((a: number, b: number) => a + Number(b), 0);
      else if (agg.fn === "AVG") result[`${agg.fn}(${col})`] = vals.length ? vals.reduce((a: number, b: number) => a + Number(b), 0) / vals.length : null;
      else if (agg.fn === "MIN") result[`${agg.fn}(${col})`] = vals.length ? Math.min(...vals.map(Number)) : null;
      else if (agg.fn === "MAX") result[`${agg.fn}(${col})`] = vals.length ? Math.max(...vals.map(Number)) : null;
    }
    return { results: [result] };
  }

  // Order
  if (orderByColumn) {
    if (!allowedCols.includes(orderByColumn)) return { error: `Order column '${orderByColumn}' not accessible.` };
    const dir = orderDirection === "ASC" ? 1 : -1;
    rows = [...rows].sort((a, b) => {
      if (a[orderByColumn] < b[orderByColumn]) return -dir;
      if (a[orderByColumn] > b[orderByColumn]) return dir;
      return 0;
    });
  }

  // Select columns
  const safeLimit = Math.min(Math.max(1, limit ?? 100), 100);
  const selectCols = columns && columns.length > 0
    ? columns.filter(c => allowedCols.includes(c))
    : allowedCols;

  const results = rows.slice(0, safeLimit).map(row => {
    const out: Record<string, unknown> = {};
    for (const c of selectCols) out[c] = row[c];
    return out;
  });
  return { results };
}

function getOwnershipColumn(table: string): string | null {
  if (table === "leads") return "assignedTo";
  if (table === "tasks") return "assignedTo";
  if (table === "activities") return "userId";
  return null;
}

function verifyRecordOwnership(table: string, id: string, userId: string, userRole: string): { allowed: boolean; error?: string } {
  if (userRole === "superadmin") return { allowed: true };
  const ownerCol = getOwnershipColumn(table);
  if (!ownerCol) return { allowed: false, error: "No ownership column for this table." };
  const db = loadDb();
  const rows: any[] = db[table] ?? [];
  const record = rows.find(r => r.id === id);
  if (!record) return { allowed: false, error: "Record not found." };
  if (String(record[ownerCol]) !== userId) {
    return { allowed: false, error: "You do not have permission to modify this record (not assigned to you)." };
  }
  return { allowed: true };
}

function getRowFilters(userRole: string, userId: string): Record<string, { column: string; value: string }> {
  if (userRole === "superadmin" || userRole === "manager") return {};
  return {
    leads: { column: "assignedTo", value: userId },
    tasks: { column: "assignedTo", value: userId },
    activities: { column: "userId", value: userId },
  };
}

const filterOperatorSchema = z.object({
  column: z.string(),
  operator: z.enum(["=", "!=", ">", "<", ">=", "<=", "LIKE", "ILIKE", "IS NULL", "IS NOT NULL", "IN"]),
  value: z.union([z.string(), z.number(), z.boolean(), z.null(), z.array(z.union([z.string(), z.number()]))]).optional(),
});

const aggregateFnSchema = z.object({
  fn: z.enum(["COUNT", "SUM", "AVG", "MIN", "MAX"]),
  column: z.string().optional().describe("Column to aggregate. Use '*' only with COUNT."),
});

function getReadTools(userRole: string, userId: string) {
  const roleColumns = getColumnsForRole(userRole);
  const allowedTableNames = Object.keys(roleColumns);
  const rowFilters = getRowFilters(userRole, userId);

  return {
    getSchema: tool({
      description: `Get database schema for accessible tables. Available tables: ${allowedTableNames.join(", ")}`,
      parameters: z.object({
        tableName: z.string().optional().describe("Specific table name, or omit for all accessible tables"),
      }),
      execute: async ({ tableName }) => {
        if (tableName) {
          const cols = roleColumns[tableName.toLowerCase()];
          if (!cols) return { error: `Table '${tableName}' not accessible. Available: ${allowedTableNames.join(", ")}` };
          return { table: tableName, columns: cols };
        }
        return { tables: Object.entries(roleColumns).map(([t, cols]) => ({ table: t, columns: cols })) };
      },
    }),

    queryTable: tool({
      description: "Query a table from the CRM database. Use camelCase field names.",
      parameters: z.object({
        table: z.string().describe(`Table to query. Available: ${allowedTableNames.join(", ")}`),
        columns: z.array(z.string()).optional().describe("Columns to return (all if omitted)"),
        filters: z.array(filterOperatorSchema).optional().describe("Filter conditions"),
        orderBy: z.string().optional().describe("Column to sort by"),
        orderDirection: z.enum(["ASC", "DESC"]).optional().default("DESC"),
        limit: z.number().int().min(1).max(100).optional().default(50),
      }),
      execute: async ({ table, columns, filters, orderBy, orderDirection, limit }) => {
        try {
          const tbl = table.toLowerCase().trim();
          const result = execJsonQuery(roleColumns, tbl, columns, filters as FilterOp[], orderBy, orderDirection, limit, undefined, undefined, rowFilters);
          if (result.error) return { error: result.error };
          return { results: result.results, rowCount: result.results!.length };
        } catch (e: unknown) {
          return { error: e instanceof Error ? e.message : String(e) };
        }
      },
    }),

    analyticsQuery: tool({
      description: "Run aggregation queries on CRM data (COUNT, SUM, AVG, MIN, MAX with optional GROUP BY). Use camelCase field names.",
      parameters: z.object({
        table: z.string().describe(`Table to aggregate. Available: ${allowedTableNames.join(", ")}`),
        aggregates: z.array(aggregateFnSchema).describe("Aggregation functions to apply"),
        groupBy: z.array(z.string()).optional().describe("Columns to group by"),
        filters: z.array(filterOperatorSchema).optional().describe("Filter conditions"),
        limit: z.number().int().min(1).max(100).optional().default(50),
      }),
      execute: async ({ table, aggregates, groupBy, filters, limit }) => {
        try {
          const tbl = table.toLowerCase().trim();
          const result = execJsonQuery(roleColumns, tbl, undefined, filters as FilterOp[], undefined, undefined, limit, aggregates as AggregateFn[], groupBy, rowFilters);
          if (result.error) return { error: result.error };
          return { results: result.results, rowCount: result.results!.length };
        } catch (e: unknown) {
          return { error: e instanceof Error ? e.message : String(e) };
        }
      },
    }),
  };
}

function getMutationTools(userId: string, userRole: string) {
  const canMutate = ["superadmin", "manager"].includes(userRole);

  return {
    proposeMutation: tool({
      description: "Propose a database mutation (create/update/delete) and get a confirmation token. Always call this BEFORE createRecord, updateRecord, or deleteRecord.",
      parameters: z.object({
        action: z.enum(["create", "update", "delete"]).describe("The type of mutation"),
        table: z.enum(["leads", "tasks", "activities"]).describe("Target table"),
        description: z.string().describe("Human-readable description of what will be changed"),
      }),
      execute: async ({ action, table, description }) => {
        if (!canMutate) {
          return { error: "You do not have permission to modify records. Contact a manager or admin." };
        }
        const token = `mut_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
        pendingMutations.set(token, { action, table, description, userId, createdAt: Date.now() });
        setTimeout(() => pendingMutations.delete(token), 5 * 60 * 1000);
        return {
          confirmationToken: token,
          message: `Mutation proposed: ${action} on ${table}. Description: ${description}. Use this token to execute.`,
        };
      },
    }),

    createRecord: tool({
      description: "Create a new record. Requires a confirmation token from proposeMutation.",
      parameters: z.object({
        table: z.enum(["leads", "tasks", "activities"]).describe("Table to insert into"),
        data: z.record(z.union([z.string(), z.number(), z.boolean(), z.null()])).describe("Record data as key-value pairs"),
        confirmationToken: z.string().describe("Token from proposeMutation"),
      }),
      execute: async ({ table, data, confirmationToken }) => {
        try {
          if (!isAllowedTable(table)) return { error: "Table not allowed" };
          const pending = pendingMutations.get(confirmationToken);
          if (!pending || pending.userId !== userId) {
            return { error: "Invalid or expired confirmation token. Call proposeMutation first." };
          }
          if (pending.action !== "create" || pending.table !== table) {
            return { error: `Token was issued for ${pending.action} on ${pending.table}, not create on ${table}.` };
          }
          pendingMutations.delete(confirmationToken);
          const db = loadDb();
          const rows: any[] = db[table] ?? [];
          const record = { id: genId(), createdAt: nowStr(), updatedAt: nowStr(), ...data };
          rows.push(record);
          db[table] = rows;
          saveDb(db);
          return { success: true, record };
        } catch (e: unknown) {
          return { error: e instanceof Error ? e.message : String(e) };
        }
      },
    }),

    updateRecord: tool({
      description: "Update a record by ID. Requires a confirmation token from proposeMutation.",
      parameters: z.object({
        table: z.enum(["leads", "tasks", "activities"]).describe("Table to update"),
        id: z.string().describe("Record ID"),
        data: z.record(z.union([z.string(), z.number(), z.boolean(), z.null()])).describe("Fields to update"),
        confirmationToken: z.string().describe("Token from proposeMutation"),
      }),
      execute: async ({ table, id, data, confirmationToken }) => {
        try {
          if (!isAllowedTable(table)) return { error: "Table not allowed" };
          const pending = pendingMutations.get(confirmationToken);
          if (!pending || pending.userId !== userId) {
            return { error: "Invalid or expired confirmation token. Call proposeMutation first." };
          }
          if (pending.action !== "update" || pending.table !== table) {
            return { error: `Token was issued for ${pending.action} on ${pending.table}, not update on ${table}.` };
          }
          const ownership = verifyRecordOwnership(table, id, userId, userRole);
          if (!ownership.allowed) return { error: ownership.error || "Access denied." };
          pendingMutations.delete(confirmationToken);
          const db = loadDb();
          const rows: any[] = db[table] ?? [];
          const idx = rows.findIndex(r => r.id === id);
          if (idx === -1) return { error: "Record not found." };
          rows[idx] = { ...rows[idx], ...data, updatedAt: nowStr() };
          db[table] = rows;
          saveDb(db);
          return { success: true, record: rows[idx] };
        } catch (e: unknown) {
          return { error: e instanceof Error ? e.message : String(e) };
        }
      },
    }),

    deleteRecord: tool({
      description: "Delete a record by ID. Requires a confirmation token from proposeMutation.",
      parameters: z.object({
        table: z.enum(["leads", "tasks", "activities"]).describe("Table to delete from"),
        id: z.string().describe("Record ID"),
        confirmationToken: z.string().describe("Token from proposeMutation"),
      }),
      execute: async ({ table, id, confirmationToken }) => {
        try {
          if (!isAllowedTable(table)) return { error: "Table not allowed" };
          const pending = pendingMutations.get(confirmationToken);
          if (!pending || pending.userId !== userId) {
            return { error: "Invalid or expired confirmation token. Call proposeMutation first." };
          }
          if (pending.action !== "delete" || pending.table !== table) {
            return { error: `Token was issued for ${pending.action} on ${pending.table}, not delete on ${table}.` };
          }
          const ownership = verifyRecordOwnership(table, id, userId, userRole);
          if (!ownership.allowed) return { error: ownership.error || "Access denied." };
          pendingMutations.delete(confirmationToken);
          const db = loadDb();
          const rows: any[] = db[table] ?? [];
          const next = rows.filter(r => r.id !== id);
          db[table] = next;
          saveDb(db);
          return { success: true, message: `Record ${id} deleted from ${table}` };
        } catch (e: unknown) {
          return { error: e instanceof Error ? e.message : String(e) };
        }
      },
    }),
  };
}

// ── Routes ────────────────────────────────────────────────────────────────────

aiRouter.get("/conversations", async (req: Request, res: Response) => {
  try {
    const user = req.user as User;
    const convs = getConversations()
      .filter(c => c.user_id === user.id)
      .sort((a, b) => (a.updated_at < b.updated_at ? 1 : -1));
    res.json(convs);
  } catch (e: unknown) {
    res.status(500).json({ error: e instanceof Error ? e.message : String(e) });
  }
});

aiRouter.post("/conversations", async (req: Request, res: Response) => {
  try {
    const user = req.user as User;
    const { title } = req.body;
    const conv = insertConversation({ user_id: user.id, title: title || "New Chat" });
    res.json(conv);
  } catch (e: unknown) {
    res.status(500).json({ error: e instanceof Error ? e.message : String(e) });
  }
});

aiRouter.get("/conversations/search", async (req: Request, res: Response) => {
  try {
    const user = req.user as User;
    const q = ((req.query.q as string) || "").trim().toLowerCase();
    if (!q) return res.json([]);

    const allConvs = getConversations().filter(c => c.user_id === user.id);
    const userConvIds = new Set(allConvs.map(c => c.id));

    // Match conversations by title
    const matchedConvIds = new Set(allConvs.filter(c => c.title?.toLowerCase().includes(q)).map(c => c.id));

    // Match conversations by message content
    const msgHits = getMessages().filter(m => userConvIds.has(m.conversation_id) && m.content?.toLowerCase().includes(q));
    for (const m of msgHits) matchedConvIds.add(m.conversation_id);

    const results = allConvs
      .filter(c => matchedConvIds.has(c.id))
      .sort((a, b) => (a.updated_at < b.updated_at ? 1 : -1))
      .slice(0, 20);

    res.json(results);
  } catch (e: unknown) {
    res.status(500).json({ error: e instanceof Error ? e.message : String(e) });
  }
});

aiRouter.get("/conversations/:id/messages", async (req: Request, res: Response) => {
  try {
    const user = req.user as User;
    const { id } = req.params;
    if (!(await verifyConversationOwnership(id, user.id))) {
      return res.status(404).json({ error: "Conversation not found" });
    }
    const msgs = getMessages()
      .filter(m => m.conversation_id === id)
      .sort((a, b) => (a.created_at < b.created_at ? -1 : 1));
    res.json(msgs);
  } catch (e: unknown) {
    res.status(500).json({ error: e instanceof Error ? e.message : String(e) });
  }
});

aiRouter.patch("/conversations/:id", async (req: Request, res: Response) => {
  try {
    const user = req.user as User;
    const { id } = req.params;
    const { title } = req.body;
    if (!(await verifyConversationOwnership(id, user.id))) {
      return res.status(404).json({ error: "Conversation not found" });
    }
    const convs = getConversations();
    const idx = convs.findIndex(c => c.id === id && c.user_id === user.id);
    if (idx === -1) return res.status(404).json({ error: "Conversation not found" });
    convs[idx] = { ...convs[idx], title, updated_at: nowStr() };
    saveConversations(convs);
    res.json(convs[idx]);
  } catch (e: unknown) {
    res.status(500).json({ error: e instanceof Error ? e.message : String(e) });
  }
});

aiRouter.delete("/conversations/:id", async (req: Request, res: Response) => {
  try {
    const user = req.user as User;
    const { id } = req.params;
    if (!(await verifyConversationOwnership(id, user.id))) {
      return res.status(404).json({ error: "Conversation not found" });
    }
    saveMessages(getMessages().filter(m => m.conversation_id !== id));
    saveAttachments(getAttachments().filter(a => a.conversation_id !== id));
    saveConversations(getConversations().filter(c => !(c.id === id && c.user_id === user.id)));
    res.json({ success: true });
  } catch (e: unknown) {
    res.status(500).json({ error: e instanceof Error ? e.message : String(e) });
  }
});

aiRouter.post("/upload", upload.single("file"), async (req: Request, res: Response) => {
  try {
    const user = req.user as User;
    const file = req.file;
    const { conversationId } = req.body;
    if (!file) return res.status(400).json({ error: "No file uploaded" });
    if (!conversationId) return res.status(400).json({ error: "conversationId is required" });
    if (!(await verifyConversationOwnership(conversationId, user.id))) {
      return res.status(404).json({ error: "Conversation not found" });
    }
    const storedFilename = file.filename;
    let fileContent: string | null = null;
    const textTypes = [".csv", ".txt", ".json"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (textTypes.includes(ext)) {
      try {
        const raw = fs.readFileSync(path.join(uploadsDir, storedFilename), "utf-8");
        fileContent = raw.slice(0, 50000);
      } catch (readErr) {
        console.error("Failed to read uploaded file content:", readErr);
      }
    }
    res.json({ storedFilename, fileName: file.originalname, fileType: file.mimetype, fileSize: file.size, fileContent });
  } catch (e: unknown) {
    res.status(500).json({ error: e instanceof Error ? e.message : String(e) });
  }
});

aiRouter.get("/attachments/:filename", async (req: Request, res: Response) => {
  try {
    const user = req.user as User;
    const { filename } = req.params;
    const safeName = path.basename(filename).replace(/[^a-z0-9._-]/gi, "");
    const filePath = path.resolve(uploadsDir, safeName);
    if (!filePath.startsWith(path.resolve(uploadsDir))) {
      return res.status(400).json({ error: "Invalid filename" });
    }
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "File not found" });
    }
    const fileUrl = `/api/ai/attachments/${safeName}`;
    const attachment = getAttachments().find(a => a.file_url === fileUrl);
    if (!attachment) return res.status(404).json({ error: "File not found" });
    if (!(await verifyConversationOwnership(attachment.conversation_id, user.id))) {
      return res.status(404).json({ error: "File not found" });
    }
    res.sendFile(filePath);
  } catch (e: unknown) {
    res.status(500).json({ error: e instanceof Error ? e.message : String(e) });
  }
});

aiRouter.post("/chat", async (req: Request, res: Response) => {
  try {
    const user = req.user as User;
    const { conversationId, message, attachment } = req.body;
    if (!conversationId || !message) {
      return res.status(400).json({ error: "conversationId and message are required" });
    }
    if (!(await verifyConversationOwnership(conversationId, user.id))) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    const userMsg = insertMessage({ conversation_id: conversationId, role: "user", content: message });

    if (attachment && userMsg) {
      insertAttachment({
        message_id: userMsg.id,
        conversation_id: conversationId,
        file_name: attachment.fileName,
        file_type: attachment.fileType,
        file_url: `/api/ai/attachments/${attachment.storedFilename}`,
        file_size: attachment.fileSize,
      });
    }

    const history = getMessages()
      .filter(m => m.conversation_id === conversationId)
      .sort((a, b) => (a.created_at < b.created_at ? -1 : 1));

    const chatMessages = history.map((m: { role: string; content: string }) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");

    const result = streamText({
      model: openai("gpt-4o"),
      system: getSystemPrompt(user.name),
      messages: chatMessages,
      tools: { ...getReadTools(user.role, user.id), ...getMutationTools(user.id, user.role) },
      maxSteps: 8,
      onError: (error) => {
        console.error("AI stream error:", error);
      },
    });

    let fullContent = "";
    let toolCallsData: Record<string, unknown>[] = [];
    let reasoningText = "";

    const stream = result.toDataStream();
    const reader = stream.getReader();
    let parseBuffer = "";
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = typeof value === "string" ? value : new TextDecoder().decode(value);
        res.write(chunk);
        parseBuffer += chunk;
        const lines = parseBuffer.split("\n");
        parseBuffer = lines.pop() || "";
        for (const line of lines) {
          if (!line.trim()) continue;
          if (line.startsWith("0:")) {
            try { fullContent += JSON.parse(line.slice(2)); } catch {}
          }
          if (line.startsWith("9:")) {
            try { toolCallsData.push(JSON.parse(line.slice(2))); } catch {}
          }
          if (line.startsWith("g:")) {
            try { reasoningText += JSON.parse(line.slice(2)); } catch {}
          }
        }
      }
      if (parseBuffer.trim() && parseBuffer.startsWith("0:")) {
        try { fullContent += JSON.parse(parseBuffer.slice(2)); } catch {}
      }
    } finally {
      reader.releaseLock();
    }

    if (fullContent) {
      insertMessage({
        conversation_id: conversationId,
        role: "assistant",
        content: fullContent,
        tool_calls: toolCallsData.length > 0 ? toolCallsData : null,
        reasoning: reasoningText || null,
      });

      const userMsgCount = getMessages().filter(m => m.conversation_id === conversationId && m.role === "user").length;
      const convs = getConversations();
      const cidx = convs.findIndex(c => c.id === conversationId);
      if (cidx !== -1) {
        if (userMsgCount <= 1) {
          const titleSnippet = message.slice(0, 50) + (message.length > 50 ? "..." : "");
          convs[cidx] = { ...convs[cidx], title: titleSnippet, updated_at: nowStr() };
        } else {
          convs[cidx] = { ...convs[cidx], updated_at: nowStr() };
        }
        saveConversations(convs);
      }
    }

    res.end();
  } catch (e: unknown) {
    console.error("AI chat error:", e);
    if (!res.headersSent) {
      res.status(500).json({ error: e instanceof Error ? e.message : String(e) });
    } else {
      res.end();
    }
  }
});

export { aiRouter };
