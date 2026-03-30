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

Database tables available:
- users (id, name, email, role, phone, avatar, office_id, salary, created_at)
- leads (id, name, company, phone, email, service, value, stage, assigned_to, team_id, source, address, rating, tags, temperature, next_follow_up, won_amount, won_date, lost_reason, created_at)
- activities (id, lead_id, user_id, type, notes, duration, outcome, from_stage, to_stage, created_at)
- tasks (id, title, description, status, priority, due_date, assigned_to, team_id, lead_id, tags, created_at)
- team_members (id, user_id, team_id, role, created_at)
- employees (id, name, role, phone, whatsapp, avatar, is_active, employment_status, joining_date)
- events (id, name, type, city, venue, date, capacity, status, ticket_price)
- event_attendees (id, event_id, name, phone, email, company, checked_in, ticket_status)

Lead stages: new → contacted → qualified → proposal → negotiation → won / lost
Task statuses: todo, in_progress, review, done
Task priorities: low, medium, high
Lead temperatures: hot, warm, cold

Guidelines:
- Always use the run_sql_query tool to query real data. Never make up data.
- When querying, use snake_case column names (e.g., assigned_to, team_id, created_at).
- Format numbers and currency in Indian Rupee (₹) format when relevant.
- Keep responses concise but informative.
- When showing tabular data, use markdown tables.
- IMPORTANT: Never execute createRecord, updateRecord, or deleteRecord without first describing what you plan to do and getting confirmation in the conversation. Always explain the change first.
- For analytics queries, provide clear summaries with key metrics.`;
}

const pendingMutations = new Map<string, { action: string; table: string; description: string; userId: string; createdAt: number }>();

const ALLOWED_TABLES = ["leads", "tasks", "activities"] as const;
type AllowedTable = typeof ALLOWED_TABLES[number];

function isAllowedTable(t: string): t is AllowedTable {
  return (ALLOWED_TABLES as readonly string[]).includes(t);
}

const ACCESSIBLE_TABLES: Record<string, string[]> = {
  superadmin: ["leads", "tasks", "activities", "users", "team_members", "employees", "events", "event_attendees", "services", "templates"],
  manager: ["leads", "tasks", "activities", "team_members", "events", "event_attendees"],
  sales_executive: ["leads", "tasks", "activities"],
};

const SENSITIVE_COLUMNS = ["password", "salary"];

function validateQueryTables(query: string, role: string): string | null {
  const allowedTables = ACCESSIBLE_TABLES[role] || ACCESSIBLE_TABLES.sales_executive;
  const fromMatches = query.match(/\bFROM\s+(\w+)/gi) || [];
  const joinMatches = query.match(/\bJOIN\s+(\w+)/gi) || [];
  const allRefs = [...fromMatches, ...joinMatches];
  for (const ref of allRefs) {
    const tableName = ref.replace(/^(FROM|JOIN)\s+/i, "").toLowerCase();
    if (tableName === "information_schema" || tableName === "pg_catalog") continue;
    if (!allowedTables.includes(tableName)) {
      return `Access denied: table '${tableName}' is not accessible for your role.`;
    }
  }
  for (const col of SENSITIVE_COLUMNS) {
    if (new RegExp(`\\b${col}\\b`, "i").test(query)) {
      return `Access denied: column '${col}' is restricted.`;
    }
  }
  return null;
}

function getReadTools(userRole: string) {
  const allowedTables = ACCESSIBLE_TABLES[userRole] || ACCESSIBLE_TABLES.sales_executive;

  return {
    getSchema: tool({
      description: "Get the database schema information for allowed tables",
      parameters: z.object({
        tableName: z.string().optional().describe("Specific table name to get schema for, or leave empty for all allowed tables"),
      }),
      execute: async ({ tableName }) => {
        try {
          const safeTableName = tableName ? tableName.replace(/[^a-zA-Z0-9_]/g, "") : null;
          if (safeTableName && !allowedTables.includes(safeTableName)) {
            return { error: `Table '${safeTableName}' is not accessible for your role.` };
          }
          const tableFilter = safeTableName
            ? `AND table_name = '${safeTableName}'`
            : `AND table_name IN (${allowedTables.map(t => `'${t}'`).join(",")})`;
          const query = `
            SELECT table_name, column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_schema = 'public'
            ${tableFilter}
            AND column_name NOT IN (${SENSITIVE_COLUMNS.map(c => `'${c}'`).join(",")})
            ORDER BY table_name, ordinal_position
          `;
          const rows = await execReadonlySQL(query);
          return { schema: rows };
        } catch (e: any) {
          return { error: e.message };
        }
      },
    }),

    run_sql_query: tool({
      description: `Run a read-only SQL SELECT query. Only allowed tables: ${allowedTables.join(", ")}. Restricted columns: ${SENSITIVE_COLUMNS.join(", ")}.`,
      parameters: z.object({
        query: z.string().describe("The SQL SELECT query to execute."),
      }),
      execute: async ({ query }) => {
        try {
          const violation = validateQueryTables(query, userRole);
          if (violation) return { error: violation };
          const rows = await execReadonlySQL(query);
          const limited = Array.isArray(rows) ? rows.slice(0, 100) : rows;
          return { results: limited, rowCount: Array.isArray(rows) ? rows.length : 0 };
        } catch (e: any) {
          return { error: e.message };
        }
      },
    }),

    analyticsQuery: tool({
      description: `Run an analytics/aggregation query on CRM data. Only allowed tables: ${allowedTables.join(", ")}.`,
      parameters: z.object({
        query: z.string().describe("An analytics SQL SELECT query with aggregations."),
      }),
      execute: async ({ query }) => {
        try {
          const violation = validateQueryTables(query, userRole);
          if (violation) return { error: violation };
          const rows = await execReadonlySQL(query);
          return { results: rows, rowCount: Array.isArray(rows) ? rows.length : 0 };
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
