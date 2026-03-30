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
- Always use the queryTable tool to fetch real data. Specify table, columns, where, orderBy, limit, aggregation, and groupBy as structured parameters. Never write raw SQL.
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
    leads: ["id", "name", "email", "phone", "company", "status", "source", "assigned_to", "notes", "created_at", "updated_at", "stage", "value", "priority", "last_contact", "next_follow_up"],
    tasks: ["id", "title", "description", "status", "priority", "due_date", "assigned_to", "created_by", "lead_id", "created_at", "updated_at", "completed_at"],
    activities: ["id", "type", "description", "lead_id", "user_id", "created_at", "metadata"],
    users: ["id", "name", "email", "role", "team", "created_at", "is_active"],
    team_members: ["id", "user_id", "team", "role", "joined_at"],
    employees: ["id", "name", "email", "department", "designation", "joined_at", "is_active"],
    events: ["id", "title", "description", "start_date", "end_date", "location", "created_by", "created_at"],
    event_attendees: ["id", "event_id", "user_id", "status"],
    services: ["id", "name", "description", "price", "category", "is_active"],
    templates: ["id", "name", "content", "type", "created_by", "created_at"],
  },
  manager: {
    leads: ["id", "name", "email", "phone", "company", "status", "source", "assigned_to", "notes", "created_at", "updated_at", "stage", "value", "priority", "last_contact", "next_follow_up"],
    tasks: ["id", "title", "description", "status", "priority", "due_date", "assigned_to", "created_by", "lead_id", "created_at", "updated_at", "completed_at"],
    activities: ["id", "type", "description", "lead_id", "user_id", "created_at", "metadata"],
    team_members: ["id", "user_id", "team", "role", "joined_at"],
    events: ["id", "title", "description", "start_date", "end_date", "location", "created_by", "created_at"],
    event_attendees: ["id", "event_id", "user_id", "status"],
  },
  sales_executive: {
    leads: ["id", "name", "email", "phone", "company", "status", "source", "assigned_to", "notes", "created_at", "stage", "value", "priority"],
    tasks: ["id", "title", "description", "status", "priority", "due_date", "assigned_to", "lead_id", "created_at", "completed_at"],
    activities: ["id", "type", "description", "lead_id", "user_id", "created_at"],
  },
};

const SAFE_IDENTIFIER = /^[a-z_][a-z0-9_]*$/;

function sanitizeIdentifier(name: string): string | null {
  const lower = name.toLowerCase().trim();
  return SAFE_IDENTIFIER.test(lower) ? lower : null;
}

function getColumnsForRole(role: string): Record<string, string[]> {
  return ROLE_TABLE_COLUMNS[role] || ROLE_TABLE_COLUMNS.sales_executive;
}

function buildSafeQuery(
  roleColumns: Record<string, string[]>,
  table: string,
  columns: string[] | undefined,
  where: string | undefined,
  orderBy: string | undefined,
  limit: number | undefined,
  aggregation: string | undefined,
  groupBy: string | undefined,
  joinTable: string | undefined,
  joinOn: string | undefined,
): { sql: string; error?: string } {
  const safeTable = sanitizeIdentifier(table);
  if (!safeTable || !roleColumns[safeTable]) {
    return { sql: "", error: `Table '${table}' is not accessible for your role. Allowed: ${Object.keys(roleColumns).join(", ")}` };
  }
  const allowedCols = roleColumns[safeTable];

  let selectCols: string;
  if (aggregation) {
    selectCols = aggregation;
  } else if (!columns || columns.length === 0) {
    selectCols = allowedCols.map(c => `${safeTable}.${c}`).join(", ");
  } else {
    const validCols: string[] = [];
    for (const col of columns) {
      const safeCol = sanitizeIdentifier(col);
      if (!safeCol || !allowedCols.includes(safeCol)) {
        return { sql: "", error: `Column '${col}' is not accessible on table '${safeTable}'.` };
      }
      validCols.push(`${safeTable}.${safeCol}`);
    }
    selectCols = validCols.join(", ");
  }

  let query = `SELECT ${selectCols} FROM ${safeTable}`;

  if (joinTable && joinOn) {
    const safeJoin = sanitizeIdentifier(joinTable);
    if (!safeJoin || !roleColumns[safeJoin]) {
      return { sql: "", error: `Join table '${joinTable}' is not accessible.` };
    }
    const safeJoinOn = joinOn.replace(/[;'"\\]/g, "");
    query += ` JOIN ${safeJoin} ON ${safeJoinOn}`;
  }

  if (where) {
    const safeWhere = where.replace(/[;'"\\]/g, "").replace(/--/g, "");
    query += ` WHERE ${safeWhere}`;
  }

  if (groupBy) {
    const safeGroup = groupBy.replace(/[;'"\\]/g, "");
    query += ` GROUP BY ${safeGroup}`;
  }

  if (orderBy) {
    const safeOrder = orderBy.replace(/[;'"\\]/g, "");
    query += ` ORDER BY ${safeOrder}`;
  }

  const safeLimit = Math.min(Math.max(1, limit || 100), 100);
  query += ` LIMIT ${safeLimit}`;

  return { sql: query };
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
            const safe = sanitizeIdentifier(tableName);
            if (!safe || !roleColumns[safe]) {
              return { error: `Table '${tableName}' is not accessible.` };
            }
            return { schema: { [safe]: roleColumns[safe] } };
          }
          return { schema: roleColumns };
        } catch (e: any) {
          return { error: e.message };
        }
      },
    }),

    queryTable: tool({
      description: `Query CRM data from a single table with optional filters, sorting, aggregation, and joins. Tables: ${allowedTableNames.join(", ")}. All column names and table names are validated server-side.`,
      parameters: z.object({
        table: z.string().describe("Main table to query"),
        columns: z.array(z.string()).optional().describe("Columns to select. Omit for all allowed columns."),
        where: z.string().optional().describe("WHERE clause conditions (without the WHERE keyword). Use column_name = value syntax."),
        orderBy: z.string().optional().describe("ORDER BY clause (without the keyword). e.g. 'created_at DESC'"),
        limit: z.number().optional().describe("Max rows to return (default 100, max 100)"),
        aggregation: z.string().optional().describe("Aggregation expression for SELECT clause, e.g. 'COUNT(*)', 'status, COUNT(*)'"),
        groupBy: z.string().optional().describe("GROUP BY columns, e.g. 'status'"),
        joinTable: z.string().optional().describe("Table to JOIN with"),
        joinOn: z.string().optional().describe("JOIN condition, e.g. 'leads.assigned_to = users.id'"),
      }),
      execute: async ({ table, columns, where, orderBy, limit, aggregation, groupBy, joinTable, joinOn }) => {
        try {
          const { sql, error: buildError } = buildSafeQuery(
            roleColumns, table, columns, where, orderBy, limit, aggregation, groupBy, joinTable, joinOn
          );
          if (buildError) return { error: buildError };
          const rows = await execReadonlySQL(sql);
          const limited = Array.isArray(rows) ? rows.slice(0, 100) : rows;
          return { results: limited, rowCount: Array.isArray(rows) ? rows.length : 0 };
        } catch (e: any) {
          return { error: e.message };
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
        data: z.record(z.any()).describe("Record data as key-value pairs"),
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
        } catch (e: any) {
          return { error: e.message };
        }
      },
    }),

    updateRecord: tool({
      description: "Update a record by ID. Requires a confirmation token from proposeMutation.",
      parameters: z.object({
        table: z.enum(["leads", "tasks", "activities"]).describe("Table to update"),
        id: z.string().describe("Record ID"),
        data: z.record(z.any()).describe("Fields to update"),
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
        } catch (e: any) {
          return { error: e.message };
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
        } catch (e: any) {
          return { error: e.message };
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
  } catch (e: any) {
    res.status(500).json({ error: e.message });
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
  } catch (e: any) {
    res.status(500).json({ error: e.message });
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

    const { data: msgHits } = await supabase
      .from("ai_messages")
      .select("conversation_id, content")
      .ilike("content", `%${q}%`)
      .limit(50);

    const convIds = new Set((convs || []).map((c: any) => c.id));
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
  } catch (e: any) {
    res.status(500).json({ error: e.message });
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
  } catch (e: any) {
    res.status(500).json({ error: e.message });
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
  } catch (e: any) {
    res.status(500).json({ error: e.message });
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
  } catch (e: any) {
    res.status(500).json({ error: e.message });
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
  } catch (e: any) {
    res.status(500).json({ error: e.message });
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

    const convId = (attachment as any).ai_messages?.conversation_id;
    if (!convId || !(await verifyConversationOwnership(convId, user.id))) {
      return res.status(404).json({ error: "File not found" });
    }

    res.sendFile(filePath);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
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

    const chatMessages = (history || []).map((m: any) => ({
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
    let toolCallsData: any[] = [];
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
  } catch (e: any) {
    console.error("AI chat error:", e);
    if (!res.headersSent) {
      res.status(500).json({ error: e.message });
    } else {
      res.end();
    }
  }
});

export { aiRouter };
