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
  } catch {}

  const client = await pgPool.connect();
  try {
    await client.query("SET TRANSACTION READ ONLY");
    await client.query("BEGIN");
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

const pendingMutations = new Map<string, { action: string; table: string; description: string; createdAt: number }>();

const ALLOWED_TABLES = ["leads", "tasks", "activities"] as const;
type AllowedTable = typeof ALLOWED_TABLES[number];

function isAllowedTable(t: string): t is AllowedTable {
  return (ALLOWED_TABLES as readonly string[]).includes(t);
}

const aiTools = {
  getSchema: tool({
    description: "Get the database schema information including table names and column details",
    parameters: z.object({
      tableName: z.string().optional().describe("Specific table name to get schema for, or leave empty for all tables"),
    }),
    execute: async ({ tableName }) => {
      try {
        const safeTableName = tableName ? tableName.replace(/[^a-zA-Z0-9_]/g, "") : null;
        let query = `
          SELECT table_name, column_name, data_type, is_nullable
          FROM information_schema.columns
          WHERE table_schema = 'public'
        `;
        if (safeTableName) {
          query += ` AND table_name = '${safeTableName}'`;
        }
        query += ` ORDER BY table_name, ordinal_position`;

        const rows = await execReadonlySQL(query);
        return { schema: rows };
      } catch (e: any) {
        return { error: e.message };
      }
    },
  }),

  run_sql_query: tool({
    description: "Run a read-only SQL SELECT query against the Suprans CRM database. Only SELECT statements allowed. Use snake_case column names.",
    parameters: z.object({
      query: z.string().describe("The SQL SELECT query to execute. Must start with SELECT."),
    }),
    execute: async ({ query }) => {
      try {
        const rows = await execReadonlySQL(query);
        const limited = Array.isArray(rows) ? rows.slice(0, 100) : rows;
        return { results: limited, rowCount: Array.isArray(rows) ? rows.length : 0 };
      } catch (e: any) {
        return { error: e.message };
      }
    },
  }),

  analyticsQuery: tool({
    description: "Run an analytics/aggregation SELECT query on CRM data. Returns summarized data for dashboards and reports.",
    parameters: z.object({
      query: z.string().describe("An analytics SQL SELECT query with aggregations like COUNT, SUM, AVG, GROUP BY."),
    }),
    execute: async ({ query }) => {
      try {
        const rows = await execReadonlySQL(query);
        return { results: rows, rowCount: Array.isArray(rows) ? rows.length : 0 };
      } catch (e: any) {
        return { error: e.message };
      }
    },
  }),

  createRecord: tool({
    description: "Create a new record in the database. Only supports leads, tasks, and activities tables. You MUST first call proposeMutation to describe and get a confirmation token, then pass that token here.",
    parameters: z.object({
      table: z.enum(["leads", "tasks", "activities"]).describe("Table to insert into"),
      data: z.record(z.any()).describe("Record data as key-value pairs using snake_case column names"),
      confirmationToken: z.string().describe("Token from proposeMutation tool confirming this action"),
    }),
    execute: async ({ table, data, confirmationToken }) => {
      try {
        if (!isAllowedTable(table)) return { error: "Table not allowed" };
        if (!pendingMutations.has(confirmationToken)) {
          return { error: "Invalid or expired confirmation token. Call proposeMutation first." };
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
    description: "Update an existing record in the database by ID. Only supports leads, tasks, and activities. You MUST first call proposeMutation to get a confirmation token.",
    parameters: z.object({
      table: z.enum(["leads", "tasks", "activities"]).describe("Table to update"),
      id: z.string().describe("ID of the record to update"),
      data: z.record(z.any()).describe("Fields to update as key-value pairs using snake_case column names"),
      confirmationToken: z.string().describe("Token from proposeMutation tool confirming this action"),
    }),
    execute: async ({ table, id, data, confirmationToken }) => {
      try {
        if (!isAllowedTable(table)) return { error: "Table not allowed" };
        if (!pendingMutations.has(confirmationToken)) {
          return { error: "Invalid or expired confirmation token. Call proposeMutation first." };
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
    description: "Delete a record from the database by ID. Only supports leads, tasks, and activities. You MUST first call proposeMutation to get a confirmation token.",
    parameters: z.object({
      table: z.enum(["leads", "tasks", "activities"]).describe("Table to delete from"),
      id: z.string().describe("ID of the record to delete"),
      confirmationToken: z.string().describe("Token from proposeMutation tool confirming this action"),
    }),
    execute: async ({ table, id, confirmationToken }) => {
      try {
        if (!isAllowedTable(table)) return { error: "Table not allowed" };
        if (!pendingMutations.has(confirmationToken)) {
          return { error: "Invalid or expired confirmation token. Call proposeMutation first." };
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

  proposeMutation: tool({
    description: "Propose a database mutation (create/update/delete) and get a confirmation token. Always call this BEFORE createRecord, updateRecord, or deleteRecord to describe the intended change. The token is returned immediately — you should present the description to the user and then proceed with the mutation using the token.",
    parameters: z.object({
      action: z.enum(["create", "update", "delete"]).describe("The type of mutation"),
      table: z.enum(["leads", "tasks", "activities"]).describe("Target table"),
      description: z.string().describe("Human-readable description of what will be changed"),
    }),
    execute: async ({ action, table, description }) => {
      const token = `mut_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
      pendingMutations.set(token, { action, table, description, createdAt: Date.now() });
      setTimeout(() => pendingMutations.delete(token), 5 * 60 * 1000);
      return {
        confirmationToken: token,
        message: `Mutation proposed: ${action} on ${table}. Description: ${description}. Use this token to execute the mutation.`,
      };
    },
  }),
};

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
    const { messageId, conversationId } = req.body;

    if (!file) return res.status(400).json({ error: "No file uploaded" });
    if (!conversationId) return res.status(400).json({ error: "conversationId is required" });

    if (!(await verifyConversationOwnership(conversationId, user.id))) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    const fileUrl = `/uploads/ai-attachments/${file.filename}`;

    if (messageId) {
      const { data, error } = await supabase
        .from("ai_attachments")
        .insert({
          message_id: messageId,
          file_name: file.originalname,
          file_type: file.mimetype,
          file_url: fileUrl,
          file_size: file.size,
        })
        .select()
        .single();
      if (error) return res.status(500).json({ error: error.message });
      return res.json(data);
    }

    res.json({
      fileName: file.originalname,
      fileType: file.mimetype,
      fileUrl,
      fileSize: file.size,
    });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

aiRouter.post("/chat", async (req: Request, res: Response) => {
  try {
    const user = req.user as User;
    const { conversationId, message } = req.body;

    if (!conversationId || !message) {
      return res.status(400).json({ error: "conversationId and message are required" });
    }

    if (!(await verifyConversationOwnership(conversationId, user.id))) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    await supabase.from("ai_messages").insert({
      conversation_id: conversationId,
      role: "user",
      content: message,
    });

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
      tools: aiTools,
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
            } catch {}
          }
          if (line.startsWith("9:")) {
            try {
              const toolCall = JSON.parse(line.slice(2));
              toolCallsData.push(toolCall);
            } catch {}
          }
          if (line.startsWith("g:")) {
            try {
              const reasoning = JSON.parse(line.slice(2));
              reasoningText += reasoning;
            } catch {}
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
