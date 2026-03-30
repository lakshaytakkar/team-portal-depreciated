import { Router, type Request, type Response } from "express";
import { createOpenAI } from "@ai-sdk/openai";
import { streamText, tool } from "ai";
import { z } from "zod";
import { supabase } from "./db";
import pg from "pg";
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
    filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = [".csv", ".txt", ".json", ".png", ".jpg", ".jpeg", ".pdf"];
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, allowed.includes(ext));
  },
});

const pgPool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

const aiRouter = Router();

aiRouter.use(requireAuth);

const openai = createOpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY || "dummy",
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

const DANGEROUS_KEYWORDS = /\b(INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|TRUNCATE|GRANT|REVOKE|EXEC|EXECUTE)\b/i;

async function execReadonlySQL(query: string): Promise<any[]> {
  const trimmed = query.trim();
  if (!trimmed.toUpperCase().startsWith("SELECT")) {
    throw new Error("Only SELECT queries are allowed");
  }
  if (DANGEROUS_KEYWORDS.test(trimmed.replace(/^SELECT\b/i, ""))) {
    throw new Error("Query contains disallowed keywords");
  }
  if (trimmed.includes(";")) {
    throw new Error("Multi-statement queries are not allowed");
  }

  try {
    const { data, error } = await supabase.rpc("exec_readonly_sql", { sql_query: trimmed });
    if (!error) return data || [];
  } catch (rpcErr) {
    console.warn("RPC exec_readonly_sql unavailable, falling back to pg:", rpcErr);
  }

  const client = await pgPool.connect();
  try {
    await client.query("BEGIN READ ONLY");
    const result = await client.query(trimmed);
    await client.query("COMMIT");
    return result.rows;
  } catch (e) {
    await client.query("ROLLBACK").catch(() => {});
    throw e;
  } finally {
    client.release();
  }
}

async function verifyConversationOwnership(conversationId: string, userId: string): Promise<boolean> {
  const { data } = await supabase
    .from("ai_conversations")
    .select("id")
    .eq("id", conversationId)
    .eq("user_id", userId)
    .single();
  return !!data;
}

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
- Use queryTable, run_sql_query, or analyticsQuery tools to fetch real data. All accept structured parameters (table, columns, filters, orderBy, limit, aggregates, groupBy). Never write raw SQL.
- Use snake_case column names (e.g., assigned_to, team_id, created_at).
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
    leads: ["id", "name", "company", "phone", "email", "service", "value", "stage", "assigned_to", "team_id", "source", "address", "rating", "tags", "temperature", "next_follow_up", "won_amount", "won_date", "lost_reason", "created_at"],
    tasks: ["id", "title", "description", "status", "priority", "due_date", "assigned_to", "team_id", "lead_id", "tags", "created_at"],
    activities: ["id", "lead_id", "user_id", "type", "notes", "duration", "outcome", "from_stage", "to_stage", "created_at"],
    users: ["id", "name", "email", "role", "phone", "avatar", "office_id", "created_at"],
    team_members: ["id", "user_id", "team_id", "role", "created_at"],
    employees: ["id", "name", "role", "phone", "whatsapp", "avatar", "is_active", "employment_status", "joining_date"],
    events: ["id", "name", "type", "city", "venue", "date", "capacity", "status", "ticket_price"],
    event_attendees: ["id", "event_id", "name", "phone", "email", "company", "checked_in", "ticket_status"],
    services: ["id", "name", "slug", "category", "short_description", "description", "pricing", "is_active"],
  },
  manager: {
    leads: ["id", "name", "company", "phone", "email", "service", "value", "stage", "assigned_to", "team_id", "source", "address", "rating", "tags", "temperature", "next_follow_up", "won_amount", "won_date", "lost_reason", "created_at"],
    tasks: ["id", "title", "description", "status", "priority", "due_date", "assigned_to", "team_id", "lead_id", "tags", "created_at"],
    activities: ["id", "lead_id", "user_id", "type", "notes", "duration", "outcome", "from_stage", "to_stage", "created_at"],
    team_members: ["id", "user_id", "team_id", "role", "created_at"],
    events: ["id", "name", "type", "city", "venue", "date", "capacity", "status", "ticket_price"],
    event_attendees: ["id", "event_id", "name", "phone", "email", "company", "checked_in", "ticket_status"],
  },
  sales_executive: {
    leads: ["id", "name", "company", "phone", "email", "service", "value", "stage", "assigned_to", "source", "temperature", "next_follow_up", "created_at"],
    tasks: ["id", "title", "description", "status", "priority", "due_date", "assigned_to", "lead_id", "created_at"],
    activities: ["id", "lead_id", "user_id", "type", "notes", "duration", "outcome", "created_at"],
  },
};

function getColumnsForRole(role: string): Record<string, string[]> {
  return ROLE_TABLE_COLUMNS[role] || ROLE_TABLE_COLUMNS.sales_executive;
}

const SAFE_IDENTIFIER = /^[a-z_][a-z0-9_]*$/;

function validateColumn(col: string, allowedCols: string[]): string | null {
  const lower = col.toLowerCase().trim();
  if (!SAFE_IDENTIFIER.test(lower)) return null;
  if (!allowedCols.includes(lower)) return null;
  return lower;
}

function validateTable(table: string, roleColumns: Record<string, string[]>): string | null {
  const lower = table.toLowerCase().trim();
  if (!SAFE_IDENTIFIER.test(lower)) return null;
  if (!roleColumns[lower]) return null;
  return lower;
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

type FilterOp = z.infer<typeof filterOperatorSchema>;
type AggregateFn = z.infer<typeof aggregateFnSchema>;

function buildStrictQuery(
  roleColumns: Record<string, string[]>,
  table: string,
  columns: string[] | undefined,
  filters: FilterOp[] | undefined,
  orderByColumn: string | undefined,
  orderDirection: string | undefined,
  limit: number | undefined,
  aggregates: AggregateFn[] | undefined,
  groupByColumns: string[] | undefined,
): { sql: string; params: (string | number | boolean | null)[]; error?: string } {
  const safeTable = validateTable(table, roleColumns);
  if (!safeTable) {
    return { sql: "", params: [], error: `Table '${table}' is not accessible. Allowed: ${Object.keys(roleColumns).join(", ")}` };
  }
  const allowedCols = roleColumns[safeTable];
  const params: (string | number | boolean | null)[] = [];
  let paramIdx = 1;

  let selectParts: string[] = [];

  if (aggregates && aggregates.length > 0) {
    for (const agg of aggregates) {
      if (agg.column && agg.column !== "*") {
        const safeCol = validateColumn(agg.column, allowedCols);
        if (!safeCol) return { sql: "", params: [], error: `Column '${agg.column}' not allowed for aggregation on '${safeTable}'.` };
        selectParts.push(`${agg.fn}(${safeCol})`);
      } else {
        if (agg.fn !== "COUNT") return { sql: "", params: [], error: "Only COUNT can use '*'." };
        selectParts.push("COUNT(*)");
      }
    }
    if (groupByColumns && groupByColumns.length > 0) {
      for (const gc of groupByColumns) {
        const safeGc = validateColumn(gc, allowedCols);
        if (!safeGc) return { sql: "", params: [], error: `Column '${gc}' not allowed for GROUP BY on '${safeTable}'.` };
        if (!selectParts.includes(safeGc)) selectParts.unshift(safeGc);
      }
    }
  } else if (!columns || columns.length === 0) {
    selectParts = allowedCols.map(c => c);
  } else {
    for (const col of columns) {
      const safeCol = validateColumn(col, allowedCols);
      if (!safeCol) return { sql: "", params: [], error: `Column '${col}' not accessible on '${safeTable}'.` };
      selectParts.push(safeCol);
    }
  }

  let query = `SELECT ${selectParts.join(", ")} FROM ${safeTable}`;

  if (filters && filters.length > 0) {
    const whereParts: string[] = [];
    for (const f of filters) {
      const safeCol = validateColumn(f.column, allowedCols);
      if (!safeCol) return { sql: "", params: [], error: `Filter column '${f.column}' not accessible on '${safeTable}'.` };

      if (f.operator === "IS NULL") {
        whereParts.push(`${safeCol} IS NULL`);
      } else if (f.operator === "IS NOT NULL") {
        whereParts.push(`${safeCol} IS NOT NULL`);
      } else if (f.operator === "IN") {
        if (!Array.isArray(f.value)) return { sql: "", params: [], error: "IN operator requires an array value." };
        const placeholders = f.value.map((v) => { params.push(v); return `$${paramIdx++}`; });
        whereParts.push(`${safeCol} IN (${placeholders.join(", ")})`);
      } else {
        params.push(f.value as string | number | boolean | null);
        whereParts.push(`${safeCol} ${f.operator} $${paramIdx++}`);
      }
    }
    query += ` WHERE ${whereParts.join(" AND ")}`;
  }

  if (groupByColumns && groupByColumns.length > 0) {
    const safeGroups: string[] = [];
    for (const gc of groupByColumns) {
      const safeGc = validateColumn(gc, allowedCols);
      if (!safeGc) return { sql: "", params: [], error: `GROUP BY column '${gc}' not allowed.` };
      safeGroups.push(safeGc);
    }
    query += ` GROUP BY ${safeGroups.join(", ")}`;
  }

  if (orderByColumn) {
    const safeOrder = validateColumn(orderByColumn, allowedCols);
    if (!safeOrder) return { sql: "", params: [], error: `Order column '${orderByColumn}' not accessible.` };
    const dir = orderDirection === "ASC" ? "ASC" : "DESC";
    query += ` ORDER BY ${safeOrder} ${dir}`;
  }

  const safeLimit = Math.min(Math.max(1, limit || 100), 100);
  query += ` LIMIT ${safeLimit}`;

  return { sql: query, params };
}

async function execParameterizedQuery(sql: string, params: (string | number | boolean | null)[]): Promise<Record<string, unknown>[]> {
  const client = await pgPool.connect();
  try {
    await client.query("BEGIN READ ONLY");
    const result = await client.query(sql, params);
    await client.query("COMMIT");
    return result.rows;
  } catch (e) {
    await client.query("ROLLBACK").catch(() => {});
    throw e;
  } finally {
    client.release();
  }
}

function getReadTools(userRole: string) {
  const roleColumns = getColumnsForRole(userRole);
  const allowedTableNames = Object.keys(roleColumns);

  return {
    getSchema: tool({
      description: `Get database schema for accessible tables. Available tables: ${allowedTableNames.join(", ")}`,
      parameters: z.object({
        tableName: z.string().optional().describe("Specific table name, or omit for all accessible tables"),
      }),
      execute: async ({ tableName }) => {
        try {
          if (tableName) {
            const safe = validateTable(tableName, roleColumns);
            if (!safe) return { error: `Table '${tableName}' is not accessible.` };
            return { schema: { [safe]: roleColumns[safe] } };
          }
          return { schema: roleColumns };
        } catch (e: unknown) {
          return { error: e instanceof Error ? e.message : String(e) };
        }
      },
    }),

    queryTable: tool({
      description: `Query CRM data with structured parameters. All table names, column names, operators, and aggregate functions are validated server-side. Tables: ${allowedTableNames.join(", ")}.`,
      parameters: z.object({
        table: z.string().describe("Table to query"),
        columns: z.array(z.string()).optional().describe("Columns to select. Omit for all allowed columns."),
        filters: z.array(filterOperatorSchema).optional().describe("WHERE conditions as structured filter objects"),
        orderByColumn: z.string().optional().describe("Column name to sort by"),
        orderDirection: z.enum(["ASC", "DESC"]).optional().describe("Sort direction"),
        limit: z.number().optional().describe("Max rows (default 100, max 100)"),
        aggregates: z.array(aggregateFnSchema).optional().describe("Aggregate functions to apply"),
        groupByColumns: z.array(z.string()).optional().describe("Columns to group by"),
      }),
      execute: async ({ table, columns, filters, orderByColumn, orderDirection, limit, aggregates, groupByColumns }) => {
        try {
          const { sql, params, error: buildError } = buildStrictQuery(
            roleColumns, table, columns, filters, orderByColumn, orderDirection, limit, aggregates, groupByColumns
          );
          if (buildError) return { error: buildError };
          const rows = await execParameterizedQuery(sql, params);
          return { results: rows.slice(0, 100), rowCount: rows.length };
        } catch (e: unknown) {
          return { error: e instanceof Error ? e.message : String(e) };
        }
      },
    }),

    run_sql_query: tool({
      description: `Query CRM data (alias for queryTable). Specify structured parameters for table, columns, filters, ordering, and limit. Tables: ${allowedTableNames.join(", ")}.`,
      parameters: z.object({
        table: z.string().describe("Table to query"),
        columns: z.array(z.string()).optional().describe("Columns to select"),
        filters: z.array(filterOperatorSchema).optional().describe("WHERE conditions"),
        orderByColumn: z.string().optional().describe("Column to sort by"),
        orderDirection: z.enum(["ASC", "DESC"]).optional().describe("Sort direction"),
        limit: z.number().optional().describe("Max rows (default 100, max 100)"),
      }),
      execute: async ({ table, columns, filters, orderByColumn, orderDirection, limit }) => {
        try {
          const { sql, params, error: buildError } = buildStrictQuery(
            roleColumns, table, columns, filters, orderByColumn, orderDirection, limit, undefined, undefined
          );
          if (buildError) return { error: buildError };
          const rows = await execParameterizedQuery(sql, params);
          return { results: rows.slice(0, 100), rowCount: rows.length };
        } catch (e: unknown) {
          return { error: e instanceof Error ? e.message : String(e) };
        }
      },
    }),

    analyticsQuery: tool({
      description: `Run analytics/aggregation queries on CRM data. Use aggregate functions (COUNT, SUM, AVG, MIN, MAX) with optional groupBy. Tables: ${allowedTableNames.join(", ")}.`,
      parameters: z.object({
        table: z.string().describe("Table to query"),
        aggregates: z.array(aggregateFnSchema).describe("Aggregate functions to apply"),
        groupByColumns: z.array(z.string()).optional().describe("Columns to group by"),
        filters: z.array(filterOperatorSchema).optional().describe("WHERE conditions"),
        orderByColumn: z.string().optional().describe("Column to sort by"),
        orderDirection: z.enum(["ASC", "DESC"]).optional().describe("Sort direction"),
        limit: z.number().optional().describe("Max rows (default 100, max 100)"),
      }),
      execute: async ({ table, aggregates, groupByColumns, filters, orderByColumn, orderDirection, limit }) => {
        try {
          const { sql, params, error: buildError } = buildStrictQuery(
            roleColumns, table, undefined, filters, orderByColumn, orderDirection, limit, aggregates, groupByColumns
          );
          if (buildError) return { error: buildError };
          const rows = await execParameterizedQuery(sql, params);
          return { results: rows, rowCount: rows.length };
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
          const { data: result, error } = await supabase.from(table).insert(data).select().single();
          if (error) return { error: error.message };
          return { success: true, record: result };
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
          pendingMutations.delete(confirmationToken);
          const { data: result, error } = await supabase.from(table).update(data).eq("id", id).select().single();
          if (error) return { error: error.message };
          return { success: true, record: result };
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
          pendingMutations.delete(confirmationToken);
          const { error } = await supabase.from(table).delete().eq("id", id);
          if (error) return { error: error.message };
          return { success: true, message: `Record ${id} deleted from ${table}` };
        } catch (e: unknown) {
          return { error: e instanceof Error ? e.message : String(e) };
        }
      },
    }),
  };
}

aiRouter.get("/conversations", async (req: Request, res: Response) => {
  try {
    const user = req.user as User;
    const { data, error } = await supabase
      .from("ai_conversations")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    res.json(data || []);
  } catch (e: unknown) {
    res.status(500).json({ error: e instanceof Error ? e.message : String(e) });
  }
});

aiRouter.post("/conversations", async (req: Request, res: Response) => {
  try {
    const user = req.user as User;
    const { title } = req.body;
    const { data, error } = await supabase
      .from("ai_conversations")
      .insert({ user_id: user.id, title: title || "New Chat" })
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  } catch (e: unknown) {
    res.status(500).json({ error: e instanceof Error ? e.message : String(e) });
  }
});

aiRouter.get("/conversations/search", async (req: Request, res: Response) => {
  try {
    const user = req.user as User;
    const q = (req.query.q as string || "").trim();
    if (!q) return res.json([]);

    const { data: convs } = await supabase
      .from("ai_conversations")
      .select("id, title, updated_at")
      .eq("user_id", user.id)
      .ilike("title", `%${q}%`)
      .order("updated_at", { ascending: false })
      .limit(20);

    const { data: userConvs } = await supabase
      .from("ai_conversations")
      .select("id")
      .eq("user_id", user.id);
    const userConvIds = (userConvs || []).map((c: { id: string }) => c.id);

    const { data: msgHits } = userConvIds.length > 0
      ? await supabase
          .from("ai_messages")
          .select("conversation_id, content")
          .in("conversation_id", userConvIds)
          .ilike("content", `%${q}%`)
          .limit(50)
      : { data: null };

    const convIds = new Set((convs || []).map((c: { id: string }) => c.id));
    if (msgHits) {
      for (const m of msgHits) {
        if (!convIds.has(m.conversation_id)) {
          convIds.add(m.conversation_id);
        }
      }
    }

    const { data: results } = await supabase
      .from("ai_conversations")
      .select("*")
      .eq("user_id", user.id)
      .in("id", Array.from(convIds))
      .order("updated_at", { ascending: false });

    res.json(results || []);
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

    const { data, error } = await supabase
      .from("ai_messages")
      .select("*")
      .eq("conversation_id", id)
      .order("created_at", { ascending: true });

    if (error) return res.status(500).json({ error: error.message });
    res.json(data || []);
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

    const { data, error } = await supabase
      .from("ai_conversations")
      .update({ title })
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
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

    await supabase.from("ai_messages").delete().eq("conversation_id", id);
    const { error } = await supabase.from("ai_conversations").delete().eq("id", id).eq("user_id", user.id);
    if (error) return res.status(500).json({ error: error.message });
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

    res.json({
      storedFilename,
      fileName: file.originalname,
      fileType: file.mimetype,
      fileSize: file.size,
      fileContent,
    });
  } catch (e: unknown) {
    res.status(500).json({ error: e instanceof Error ? e.message : String(e) });
  }
});

aiRouter.get("/attachments/:filename", async (req: Request, res: Response) => {
  try {
    const user = req.user as User;
    const { filename } = req.params;

    const safeName = path.basename(filename);
    const filePath = path.join(uploadsDir, safeName);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "File not found" });
    }

    const { data: attachment } = await supabase
      .from("ai_attachments")
      .select("*, ai_messages!inner(conversation_id)")
      .eq("file_url", `/api/ai/attachments/${safeName}`)
      .single();

    if (!attachment) {
      return res.status(404).json({ error: "File not found" });
    }

    const attachmentWithMsg = attachment as { ai_messages?: { conversation_id: string } };
    const convId = attachmentWithMsg.ai_messages?.conversation_id;
    if (!convId || !(await verifyConversationOwnership(convId, user.id))) {
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

    const { data: userMsg } = await supabase.from("ai_messages").insert({
      conversation_id: conversationId,
      role: "user",
      content: message,
    }).select("id").single();

    if (attachment && userMsg) {
      await supabase.from("ai_attachments").insert({
        message_id: userMsg.id,
        file_name: attachment.fileName,
        file_type: attachment.fileType,
        file_url: `/api/ai/attachments/${attachment.storedFilename}`,
        file_size: attachment.fileSize,
      });
    }

    const { data: history } = await supabase
      .from("ai_messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    const chatMessages = (history || []).map((m: { role: string; content: string }) => ({
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
      tools: { ...getReadTools(user.role), ...getMutationTools(user.id, user.role) },
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

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = typeof value === "string" ? value : new TextDecoder().decode(value);
        res.write(chunk);

        const lines = chunk.split("\n");
        for (const line of lines) {
          if (line.startsWith("0:")) {
            try {
              const text = JSON.parse(line.slice(2));
              fullContent += text;
            } catch (e) {
              console.warn("Stream text chunk parse error:", e);
            }
          }
          if (line.startsWith("9:")) {
            try {
              const toolCall = JSON.parse(line.slice(2));
              toolCallsData.push(toolCall);
            } catch (e) {
              console.warn("Stream tool call parse error:", e);
            }
          }
          if (line.startsWith("g:")) {
            try {
              const reasoning = JSON.parse(line.slice(2));
              reasoningText += reasoning;
            } catch (e) {
              console.warn("Stream reasoning parse error:", e);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

    if (fullContent) {
      await supabase.from("ai_messages").insert({
        conversation_id: conversationId,
        role: "assistant",
        content: fullContent,
        tool_calls: toolCallsData.length > 0 ? toolCallsData : null,
        reasoning: reasoningText || null,
      });

      const { data: msgCount } = await supabase
        .from("ai_messages")
        .select("id", { count: "exact" })
        .eq("conversation_id", conversationId)
        .eq("role", "user");

      if (msgCount && msgCount.length <= 1) {
        const titleSnippet = message.slice(0, 50) + (message.length > 50 ? "..." : "");
        await supabase
          .from("ai_conversations")
          .update({ title: titleSnippet, updated_at: new Date().toISOString() })
          .eq("id", conversationId)
          .eq("user_id", user.id);
      } else {
        await supabase
          .from("ai_conversations")
          .update({ updated_at: new Date().toISOString() })
          .eq("id", conversationId)
          .eq("user_id", user.id);
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
