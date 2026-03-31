import type { Request, Response } from "express";
import { Router } from "express";
import { createOpenAI } from "@ai-sdk/openai";
import { streamText, tool, jsonSchema, stepCountIs } from "ai";
import multer from "multer";
import { supabase } from "./supabase";

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

const openai = createOpenAI({
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL ?? process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1",
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY ?? process.env.OPENAI_API_KEY ?? "",
});

let cachedLiveSchema: string | null = null;
let schemaCacheTime = 0;
const SCHEMA_CACHE_TTL = 5 * 60 * 1000;

async function getLiveDatabaseSchema(): Promise<string> {
  const now = Date.now();
  if (cachedLiveSchema && (now - schemaCacheTime) < SCHEMA_CACHE_TTL) {
    return cachedLiveSchema;
  }

  try {
    const schemaQuery = `SELECT t.table_schema, t.table_name, json_agg(json_build_object('column', c.column_name, 'type', c.data_type, 'nullable', c.is_nullable, 'default', c.column_default) ORDER BY c.ordinal_position) as columns FROM information_schema.tables t JOIN information_schema.columns c ON t.table_schema = c.table_schema AND t.table_name = c.table_name WHERE t.table_schema IN ('public', 'faire') AND t.table_type = 'BASE TABLE' GROUP BY t.table_schema, t.table_name ORDER BY t.table_schema, t.table_name`;

    const { data: schemaData, error: schemaError } = await supabase.rpc("exec_readonly_sql", { query_text: schemaQuery });

    if (schemaError || !schemaData) {
      console.error("[ai-schema] Failed to fetch live schema:", schemaError?.message);
      return FALLBACK_SCHEMA;
    }

    const countQueries: string[] = [];
    const tableNames: string[] = [];
    for (const table of schemaData) {
      const fullName = table.table_schema === 'public'
        ? table.table_name
        : `${table.table_schema}.${table.table_name}`;
      tableNames.push(fullName);
      countQueries.push(`SELECT '${fullName}' as tbl, COUNT(*)::int as cnt FROM ${fullName}`);
    }

    let countMap: Record<string, number> = {};
    if (countQueries.length > 0) {
      try {
        const countSql = countQueries.join(" UNION ALL ");
        const { data: countData } = await supabase.rpc("exec_readonly_sql", { query_text: countSql });
        if (countData) {
          for (const row of countData) {
            countMap[row.tbl] = row.cnt;
          }
        }
      } catch (e) {
        console.error("[ai-schema] Count query failed:", e);
      }
    }

    const sampleQueries: string[] = [];
    const sampleTableNames: string[] = [];
    for (const table of schemaData) {
      const fullName = table.table_schema === 'public'
        ? table.table_name
        : `${table.table_schema}.${table.table_name}`;
      const count = countMap[fullName] ?? 0;
      if (count > 0 && !fullName.includes("ai_") && !fullName.includes("generated_images")) {
        sampleTableNames.push(fullName);
        sampleQueries.push(`SELECT '${fullName}' as _tbl, t.* FROM ${fullName} t LIMIT 2`);
      }
    }

    let sampleMap: Record<string, any[]> = {};
    for (let i = 0; i < sampleQueries.length; i++) {
      try {
        const { data: sampleData } = await supabase.rpc("exec_readonly_sql", { query_text: sampleQueries[i] });
        if (sampleData && sampleData.length > 0) {
          const tblName = sampleTableNames[i];
          sampleMap[tblName] = sampleData.map((row: any) => {
            const { _tbl, ...rest } = row;
            const cleaned: Record<string, any> = {};
            for (const [k, v] of Object.entries(rest)) {
              if (typeof v === "string" && v.length > 120) {
                cleaned[k] = (v as string).slice(0, 120) + "…";
              } else {
                cleaned[k] = v;
              }
            }
            return cleaned;
          });
        }
      } catch {}
    }

    let schemaText = "## LIVE DATABASE SCHEMA\n\n";

    for (const table of schemaData) {
      const fullName = table.table_schema === 'public'
        ? table.table_name
        : `${table.table_schema}.${table.table_name}`;
      const count = countMap[fullName] ?? 0;
      const cols = (table.columns as any[]).map((c: any) => {
        const parts = [c.column];
        parts.push(c.type);
        if (c.nullable === 'NO') parts.push('NOT NULL');
        if (c.default) {
          const def = String(c.default);
          if (def.includes('uuid') || def.includes('nextval') || def.includes('now()')) {
            parts.push('AUTO');
          }
        }
        return parts.join(' ');
      });

      schemaText += `### ${fullName} (${count} rows)\n`;
      schemaText += `Columns: ${cols.join(', ')}\n`;

      if (sampleMap[fullName]) {
        schemaText += `Sample data: ${JSON.stringify(sampleMap[fullName])}\n`;
      }
      schemaText += "\n";
    }

    cachedLiveSchema = schemaText;
    schemaCacheTime = now;
    console.log(`[ai-schema] Built live schema context: ${schemaData.length} tables, ${Object.keys(sampleMap).length} with samples`);
    return schemaText;
  } catch (err) {
    console.error("[ai-schema] Schema introspection failed:", err);
    return FALLBACK_SCHEMA;
  }
}

const FALLBACK_SCHEMA = `
## DATABASE SCHEMA (27 tables):

### Business Verticals
- verticals(id text PK, name text, short_name text, color text, tagline text, description text, is_active boolean)
  Vertical IDs: hr (LegalNations), sales (USDrop AI), faire (FaireDesk), events (GoyoTours), suprans, hub (EventHub), ets (EazyToSell), dev (Developer), admin (LBM Lifestyle), hrms, ats, crm, finance, oms, social

### Users & Teams
- users(id uuid PK, employee_code text, name text, email text, phone text, role text, department text, designation text, employment_type text, status text, location text, skills text[], avatar_initials text, salary numeric, reporting_manager_id uuid FK→users, joined_date date)
- user_verticals(user_id uuid FK→users, vertical_id text FK→verticals, vertical_role text)

### Tasks & Tickets
- tasks(id uuid PK, task_code text, vertical_id text, title text, description text, status text [todo/in-progress/review/done/blocked], priority text [critical/high/medium/low], assignee_id uuid FK→users, assignee_name text, due_date date, tags text[], created_by_name text)
- task_subtasks(id uuid PK, task_id uuid FK→tasks, title text, completed boolean, sort_order int)
- task_activity(id uuid PK, task_id text, type text, content text, author text)
- tickets(id uuid PK, ticket_code text, vertical_id text, title text, description text, status text [open/in-progress/waiting/escalated/resolved/closed], priority text [critical/high/medium/low], category text, reported_by text, assigned_to text, tags text[], resolution text, due_date date)

### Communication
- channels(id uuid PK, vertical_id text, name text, type text [channel/dm], description text, member_names text[], is_pinned boolean, last_message text, last_message_at timestamptz, unread_count int)
- channel_messages(id uuid PK, channel_id uuid FK→channels, sender_name text, content text, is_me boolean, attachments jsonb, reactions jsonb, message_type text)

### Contacts & Resources
- contacts(id uuid PK, name text, title text, organization text, category text, vertical_ids text[], phone text, whatsapp text, email text, city text, country text, priority text, notes text, tags text[])
- resources(id uuid PK, vertical_id text, title text, description text, category text, file_type text, tags text[], added_by text, url text, is_pinned boolean)
- notifications(id uuid PK, vertical_id text, type text, title text, description text, action_url text, is_read boolean)

### Finance & Banking
- bank_transactions(id uuid PK, source text, entity text, bank_name text, date date, description text, amount numeric, currency text, amount_usd numeric, type text [credit/debit], category text, is_business boolean, tags text[], reference text, faire_order_id text, reconciled boolean, notes text)
- ledger_parties(id uuid PK, name text, type text, contact_name text, email text, phone text, country text, currency text, credit_limit numeric, credit_days int, tags text[], is_active boolean)
- ledger_party_transactions(id uuid PK, party_id uuid FK→ledger_parties, type text, direction text, date date, due_date date, amount numeric, currency text, amount_usd numeric, reference text, description text, status text, paid_amount numeric, payment_date date)

### Faire / Wholesale (use faire.tablename for faire schema)
- faire.stores(id uuid PK, brand_name text, store_url text, is_active boolean)
- faire.orders(id text PK, store_id uuid FK, display_id text, state text, retailer_name text, created_at timestamptz)
- faire.products(id text PK, store_id uuid FK, name text, lifecycle_state text)
- faire.retailers(id text PK, name text, city text, state text, country text)
- faire_vendors(id uuid PK, name text, contact_name text, email text, whatsapp text, is_default boolean, country text, rating numeric)
- faire_product_vendors(product_id text, vendor_id uuid FK→faire_vendors, is_exclusive boolean)
- faire_seller_applications(id uuid PK, brand_name text, category text, status text [drafting/applied/pending_docs/approved/rejected])
- retailer_enrichments(retailer_id text PK, contact_name text, contact_email text, store_address text, business_type text)

### AI & Images
- ai_conversations(id uuid PK, title text, vertical_id text)
- ai_messages(id uuid PK, conversation_id uuid FK, role text, content text)
- ai_attachments(id uuid PK, conversation_id uuid FK, filename text, file_size int, mime_type text)
- generated_images(id uuid PK, prompt text, style text, aspect_ratio text, status text, vertical_id text, error_message text)
`;

function buildSystemPrompt(liveSchema: string, verticalId?: string): string {
  const verticalContext = verticalId ? `\n\nThe user is currently viewing the "${verticalId}" vertical. When querying, prefer filtering by vertical_id = '${verticalId}' when relevant, but still answer cross-vertical questions when asked.` : "";

  return `You are TeamSync AI — the intelligent co-pilot for the TeamSync business operations platform.

TeamSync is an internal operating system for a multi-brand enterprise with these verticals:
1. **LegalNations** (id: hr) — US company formation, KYC, IRS compliance
2. **USDrop AI** (id: sales) — Dropshipping, Shopify stores
3. **FaireDesk** (id: faire) — Wholesale marketplace on Faire.com
4. **GoyoTours** (id: events) — China B2B travel, tour packages
5. **Suprans** (id: suprans) — Lead intake & routing hub
6. **EventHub** (id: hub) — Networking events, venues
7. **EazyToSell** (id: ets) — Retail franchise, China-to-India
8. **Developer** (id: dev) — Internal tools, design system
9. **LBM Lifestyle** (id: admin) — Admin operations
10. **HRMS** (id: hrms) — HR management, employees, payroll
11. **ATS** (id: ats) — Applicant tracking, recruitment
12. **Sales CRM** (id: crm) — CRM, leads, deals
13. **Finance** (id: finance) — Accounting, ledger
14. **OMS** (id: oms) — Order management, inventory
15. **SMM** (id: social) — Social media management
16. **Vendor Portal** (id: vendor) — External vendor access

${liveSchema}

## CRITICAL RULES — READ CAREFULLY:

### 1. ALWAYS QUERY THE DATABASE
- NEVER guess, estimate, or fabricate data. If you don't know something, QUERY FOR IT.
- NEVER say "I don't have access to..." or "I can't check..." — you CAN query AND WRITE to the database.
- NEVER give generic instructions like "go to the dashboard" — query the actual data instead.
- If the user asks about any data, metrics, counts, lists, statuses, employees, tasks, orders, etc. — USE the run_sql_query tool.

### 2. QUERY STRATEGY
- Use **getSchema** first if you're unsure about table structure, column names, or data shape.
- Use **run_sql_query** for data retrieval: counts, lists, joins, filters.
- Use **analyticsQuery** for aggregations, GROUP BY, trends, KPIs, reports.
- Use **createRecord** to insert new records (tasks, contacts, tickets, etc.).
- Use **updateRecord** to modify existing records (change status, reassign, etc.).
- Use **deleteRecord** to remove records (always confirm with user first).
- For Faire tables in the faire schema, use fully qualified names: faire.orders, faire.products, faire.stores, faire.retailers.
- For public schema tables, use just the table name: users, tasks, tickets, etc.
- Use LIMIT in queries. Use ORDER BY for meaningful results.
- Join tables when you need related data (e.g., tasks + users for assignee names).
- Use ILIKE for text search (case-insensitive).

### 3. HANDLE ERRORS GRACEFULLY
- If a query fails, READ the error message carefully. Common fixes:
  - Wrong column name → use getSchema to check actual column names
  - Wrong table name → check if it needs faire. prefix
  - Type mismatch → cast appropriately (e.g., ::text, ::int)
- Try a simpler query if the first one fails.
- You can make up to 12 sequential tool calls to answer complex questions.

### 4. RESPONSE FORMAT
- Present data in clear markdown tables when showing lists.
- Include actual numbers, names, and statuses from the database.
- Summarize findings with key insights.
- If asked to compare or analyze, show the relevant data first, then provide your analysis.
- When creating or updating records, always show the result to confirm what was done.

### 5. AVAILABLE TOOLS
- **getSchema**: Discover database structure — tables, columns, types, FKs, sample data, row counts. Call with no args for full table list, or with a table name for details.
- **run_sql_query**: Execute read-only SQL (SELECT). Max 100 rows. For data retrieval, filtering, joins.
- **analyticsQuery**: Run aggregate/analytics SQL (COUNT, SUM, AVG, GROUP BY). For KPIs, reports, trends. Up to 500 rows.
- **createRecord**: Insert a new record into a writable table. Uses Supabase client (not raw SQL). Returns the created record.
- **updateRecord**: Update an existing record by ID. Returns the updated record.
- **deleteRecord**: Delete a record by ID. Always confirm with user first.
- **generateImage**: Generate images with DALL-E 3.

### 6. WRITE OPERATIONS
- Writable tables: tasks, task_subtasks, task_activity, tickets, contacts, channels, channel_messages, resources, notifications, users, user_verticals, bank_transactions, ledger_parties, ledger_party_transactions, faire_vendors, faire_product_vendors, faire_seller_applications, faire_application_followups, faire_application_links, retailer_enrichments.
- Protected tables (read-only): ai_conversations, ai_messages, ai_attachments, generated_images, verticals.
- Faire schema tables (faire.orders, faire.products, etc.) are synced from Faire API — cannot write directly.
- Always use snake_case column names. Omit auto-generated fields (id, created_at, updated_at, task_code, ticket_code).

### 7. ATTACHMENTS & IMAGES
- Users can attach files (images, CSVs, PDFs, text files). Their content is included in the message.
- When generating images, include the ID in your response: [GENERATED_IMAGE:imageId]

### 8. PORTAL LINKS — ALWAYS LINK TO RECORDS
When you reference a specific record (order, task, ticket, contact, product, etc.), ALWAYS include a clickable markdown link to its portal page. Use the record's **id** (UUID) in the URL path.

**Link format:** \`[Display Text](/vertical/page/record-id)\`

**Route map (use the record's id (UUID) column as the URL parameter):**

Detail pages (have /:id routes):
- **Faire orders:** \`[Order #DISPLAY_ID](/faire/orders/ID)\`
- **Faire products:** \`[Product Name](/faire/products/ID)\`
- **Faire retailers:** \`[Retailer Name](/faire/retailers/ID)\`
- **Faire quotations:** \`[Quotation #CODE](/faire/quotations/ID)\`
- **Faire applications:** \`[Application Name](/faire/applications/ID)\`
- **Tickets:** \`[Ticket TICKET_CODE](/VERTICAL_ID/tickets/ID)\` (works for all verticals)
- **HR Clients:** \`[Client Name](/legalnations/clients/ID)\`
- **Events bookings:** \`[Booking](/goyotours/bookings/ID)\`
- **Events packages:** \`[Package Name](/goyotours/packages/ID)\`
- **Hub events:** \`[Event Name](/eventhub/events/ID)\`
- **ETS clients:** \`[Client Name](/ets/clients/ID)\`
- **HRMS employees:** \`[Employee Name](/hrms/employees/ID)\`
- **ATS jobs:** \`[Job Title](/ats/jobs/ID)\`
- **ATS candidates:** \`[Candidate Name](/ats/candidates/ID)\`
- **Social posts:** \`[Post Title](/social/posts/ID)\`
- **Social campaigns:** \`[Campaign Name](/social/campaigns/ID)\`
- **Dev projects:** \`[Project Name](/dev/projects/ID)\`

List pages (no /:id route — link to the list):
- **Tasks:** \`[Task TASK_CODE](/VERTICAL_ID/tasks)\`
- **Contacts:** \`[Contact Name](/VERTICAL_ID/contacts)\` or \`[Contact Name](/crm/contacts)\` for CRM
- **Dashboard pages:** \`[Vertical Dashboard](/VERTICAL_ID)\`
- **Faire stores:** \`[Stores](/faire/stores)\`
- **OMS orders:** \`[Orders](/oms/orders)\`
- **Finance ledger:** \`[Ledger](/finance/ledger)\`

**Examples:**
- "The largest order is [Order #3ZC8AMJ4P9](/faire/orders/7fc98b40-9887-4c57-889d-b4e74ab73c41) with a payout of $985.80."
- "Here are the open tickets: [TKT-0042](/legalnations/tickets/abc-123), [TKT-0043](/legalnations/tickets/def-456)"
- "Assigned to [Sneha Patel](/legalnations/team) in the [HR Dashboard](/legalnations)"

**Rules:**
- Always SELECT the id (UUID) column alongside display fields so you can build the link.
- For list queries, include links for each item when practical (up to ~10 items).
- Use the display_id, task_code, ticket_code, or name as the link text — never show raw UUIDs as text.
- Links must start with / (relative paths within the portal).
${verticalContext}`;
}

function getDimensions(aspectRatio: string): { width: number; height: number } {
  switch (aspectRatio) {
    case "16:9": return { width: 1024, height: 576 };
    case "9:16": return { width: 576, height: 1024 };
    case "4:3": return { width: 1024, height: 768 };
    case "3:4": return { width: 768, height: 1024 };
    case "1:1":
    default: return { width: 1024, height: 1024 };
  }
}

function getOpenAISize(aspectRatio: string): string {
  switch (aspectRatio) {
    case "16:9": return "1792x1024";
    case "9:16": return "1024x1792";
    default: return "1024x1024";
  }
}

const generateImageTool = tool({
  description: "Generate an image using DALL-E 3. Use this when the user asks you to create, generate, draw, or design an image. The image will be stored in the library automatically.",
  inputSchema: jsonSchema<{ prompt: string; aspectRatio?: string }>({
    type: "object",
    properties: {
      prompt: { type: "string", description: "Detailed description of the image to generate. Be specific about style, composition, colors, and subject." },
      aspectRatio: { type: "string", description: "Aspect ratio: 1:1, 16:9, 9:16, 4:3, 3:4. Default 1:1.", enum: ["1:1", "16:9", "9:16", "4:3", "3:4"] },
    },
    required: ["prompt"],
    additionalProperties: false,
  }),
  execute: async ({ prompt, aspectRatio = "1:1" }) => {
    console.log(`[ai-chat] Generating image: ${prompt.slice(0, 100)}`);

    const dimensions = getDimensions(aspectRatio);
    const { data: record, error: insertError } = await supabase
      .from("generated_images")
      .insert({
        prompt: prompt.trim(),
        style: "auto",
        aspect_ratio: aspectRatio,
        width: dimensions.width,
        height: dimensions.height,
        status: "pending",
        source: "chat",
      })
      .select("id")
      .single();

    if (insertError || !record) {
      return { error: "Failed to create image record", imageId: null };
    }

    const apiKey = process.env.IMAGE_GEN_API_KEY
      ?? process.env.AI_INTEGRATIONS_OPENAI_API_KEY
      ?? process.env.OPENAI_API_KEY;
    const baseUrl = process.env.AI_INTEGRATIONS_OPENAI_BASE_URL
      ?? process.env.OPENAI_BASE_URL
      ?? "https://api.openai.com/v1";

    if (!apiKey) {
      await supabase
        .from("generated_images")
        .update({ status: "failed", error_message: "API key not configured", updated_at: new Date().toISOString() })
        .eq("id", record.id);
      return { error: "Image generation API key not configured", imageId: record.id };
    }

    try {
      const response = await fetch(`${baseUrl}/images/generations`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: "dall-e-3",
          prompt,
          n: 1,
          size: getOpenAISize(aspectRatio),
          response_format: "b64_json",
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        await supabase
          .from("generated_images")
          .update({ status: "failed", error_message: `API error ${response.status}: ${errText.slice(0, 300)}`, updated_at: new Date().toISOString() })
          .eq("id", record.id);
        return { error: `Image generation failed (${response.status})`, imageId: record.id };
      }

      const result = (await response.json()) as { data?: Array<{ b64_json?: string; url?: string }> };
      const imageResult = result.data?.[0];

      if (imageResult?.b64_json) {
        const imageData = `data:image/png;base64,${imageResult.b64_json}`;
        await supabase
          .from("generated_images")
          .update({ status: "completed", image_data: imageData, updated_at: new Date().toISOString() })
          .eq("id", record.id);
        return { success: true, imageId: record.id, message: "Image generated successfully" };
      } else if (imageResult?.url) {
        await supabase
          .from("generated_images")
          .update({ status: "completed", image_url: imageResult.url, updated_at: new Date().toISOString() })
          .eq("id", record.id);
        return { success: true, imageId: record.id, message: "Image generated successfully" };
      }

      await supabase
        .from("generated_images")
        .update({ status: "failed", error_message: "No image returned", updated_at: new Date().toISOString() })
        .eq("id", record.id);
      return { error: "No image returned from API", imageId: record.id };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      await supabase
        .from("generated_images")
        .update({ status: "failed", error_message: msg, updated_at: new Date().toISOString() })
        .eq("id", record.id);
      return { error: `Image generation failed: ${msg}`, imageId: record.id };
    }
  },
});

const VALID_TABLE_NAME = /^[a-zA-Z0-9_.]+$/;

const WRITABLE_TABLES = new Set([
  "tasks", "task_subtasks", "task_activity",
  "tickets",
  "contacts",
  "channels", "channel_messages",
  "resources",
  "notifications",
  "users", "user_verticals",
  "bank_transactions",
  "ledger_parties", "ledger_party_transactions",
  "faire_vendors", "faire_product_vendors", "faire_seller_applications",
  "faire_application_followups", "faire_application_links",
  "retailer_enrichments",
]);

const PROTECTED_TABLES = new Set([
  "ai_conversations", "ai_messages", "ai_attachments", "generated_images",
  "verticals",
]);

function validateTableAccess(tableName: string, operation: string): string | null {
  if (!VALID_TABLE_NAME.test(tableName)) {
    return "Invalid table name. Use only letters, numbers, underscores, and dots.";
  }
  const baseName = tableName.includes(".") ? tableName.split(".")[1] : tableName;
  if (PROTECTED_TABLES.has(baseName)) {
    return `Table "${tableName}" is protected and cannot be modified via ${operation}. It is managed by the system.`;
  }
  if (tableName.startsWith("faire.")) {
    return `Faire schema tables (${tableName}) cannot be written to directly. They are synced from the Faire API. Use public schema tables like faire_vendors, faire_seller_applications, etc.`;
  }
  if (!WRITABLE_TABLES.has(baseName)) {
    return `Table "${tableName}" is not in the list of writable tables. Writable tables: ${[...WRITABLE_TABLES].join(", ")}`;
  }
  if (tableName.includes(".")) {
    return `Write operations only work on public schema tables. Use the table name without schema prefix (e.g., "${baseName}" instead of "${tableName}").`;
  }
  return null;
}

const getSchemaTool = tool({
  description: "Get the full schema for one or all database tables. Returns column names, types, constraints, row counts, and sample data. Use this to understand the database structure before querying or writing data. Pass tableName for a specific table, or omit it to get an overview of all tables.",
  inputSchema: jsonSchema<{ tableName?: string }>({
    type: "object",
    properties: {
      tableName: { type: "string", description: "Optional. Specific table name (e.g., 'users', 'faire.orders'). Omit to list all tables with row counts." },
    },
    additionalProperties: false,
  }),
  execute: async ({ tableName }) => {
    if (tableName) {
      console.log(`[ai-db] getSchema for: ${tableName}`);

      if (!VALID_TABLE_NAME.test(tableName)) {
        return { error: "Invalid table name.", tables: [] };
      }

      let schema = "public";
      let table = tableName;
      if (tableName.includes(".")) {
        const parts = tableName.split(".");
        schema = parts[0];
        table = parts[1];
      }

      try {
        const colQuery = `SELECT column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_schema = '${schema}' AND table_name = '${table}' ORDER BY ordinal_position`;
        const { data: colData, error: colError } = await supabase.rpc("exec_readonly_sql", { query_text: colQuery });

        if (colError) return { error: `Schema query failed: ${colError.message}`, tables: [] };
        if (!colData || colData.length === 0) return { error: `Table "${tableName}" not found. Check the name and schema prefix.`, tables: [] };

        const countQuery = `SELECT COUNT(*)::int as total FROM ${tableName}`;
        const { data: countData } = await supabase.rpc("exec_readonly_sql", { query_text: countQuery });
        const rowCount = countData?.[0]?.total ?? 0;

        const sampleQuery = `SELECT * FROM ${tableName} LIMIT 3`;
        const { data: sampleData } = await supabase.rpc("exec_readonly_sql", { query_text: sampleQuery });

        const fkQuery = `SELECT kcu.column_name, ccu.table_schema || '.' || ccu.table_name || '(' || ccu.column_name || ')' as references_to FROM information_schema.table_constraints tc JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema JOIN information_schema.constraint_column_usage ccu ON ccu.constraint_name = tc.constraint_name AND ccu.table_schema = tc.table_schema WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = '${schema}' AND tc.table_name = '${table}'`;
        const { data: fkData } = await supabase.rpc("exec_readonly_sql", { query_text: fkQuery });

        const enumQuery = `SELECT DISTINCT column_name, data_type FROM information_schema.columns WHERE table_schema = '${schema}' AND table_name = '${table}' AND data_type = 'USER-DEFINED'`;
        const { data: enumData } = await supabase.rpc("exec_readonly_sql", { query_text: enumQuery });

        const truncatedSamples = (sampleData ?? []).map((row: any) => {
          const cleaned: Record<string, any> = {};
          for (const [k, v] of Object.entries(row)) {
            if (typeof v === "string" && v.length > 150) cleaned[k] = (v as string).slice(0, 150) + "…";
            else cleaned[k] = v;
          }
          return cleaned;
        });

        return {
          table: tableName,
          schema,
          rowCount,
          columns: colData,
          foreignKeys: fkData ?? [],
          enumColumns: enumData ?? [],
          sampleRows: truncatedSamples,
          isWritable: WRITABLE_TABLES.has(table),
        };
      } catch (err: unknown) {
        return { error: `Schema introspection failed: ${err instanceof Error ? err.message : "Unknown"}`, tables: [] };
      }
    } else {
      console.log("[ai-db] getSchema: listing all tables");
      try {
        const query = `SELECT table_schema, table_name FROM information_schema.tables WHERE table_schema IN ('public', 'faire') AND table_type = 'BASE TABLE' ORDER BY table_schema, table_name`;
        const { data, error } = await supabase.rpc("exec_readonly_sql", { query_text: query });
        if (error) return { error: `Failed: ${error.message}`, tables: [] };

        const tables: Array<{ name: string; schema: string; rowCount: number; isWritable: boolean }> = [];
        for (const t of data ?? []) {
          const fullName = t.table_schema === "public" ? t.table_name : `${t.table_schema}.${t.table_name}`;
          try {
            const { data: cnt } = await supabase.rpc("exec_readonly_sql", { query_text: `SELECT COUNT(*)::int as total FROM ${fullName}` });
            tables.push({ name: fullName, schema: t.table_schema, rowCount: cnt?.[0]?.total ?? 0, isWritable: WRITABLE_TABLES.has(t.table_name) });
          } catch {
            tables.push({ name: fullName, schema: t.table_schema, rowCount: -1, isWritable: WRITABLE_TABLES.has(t.table_name) });
          }
        }
        return { tables, totalTables: tables.length };
      } catch (err: unknown) {
        return { error: `Schema listing failed: ${err instanceof Error ? err.message : "Unknown"}`, tables: [] };
      }
    }
  },
});

const runSqlQueryTool = tool({
  description: "Execute a read-only SQL query against the TeamSync PostgreSQL database. Use this for any data retrieval — questions, counts, lists, joins, aggregations. Only SELECT queries allowed. Always include LIMIT (max 100). For faire schema tables use fully qualified names (faire.orders, faire.products, etc.).",
  inputSchema: jsonSchema<{ sql: string; purpose: string }>({
    type: "object",
    properties: {
      sql: { type: "string", description: "The SELECT SQL query to execute. Must be read-only." },
      purpose: { type: "string", description: "Brief description of what this query retrieves" },
    },
    required: ["sql", "purpose"],
    additionalProperties: false,
  }),
  execute: async ({ sql: query, purpose }) => {
    console.log(`[ai-db] SQL (${purpose}): ${query.slice(0, 300)}`);

    const WRITE_SQL = /\b(INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|TRUNCATE|GRANT|REVOKE|EXECUTE|COPY)\b/i;
    if (WRITE_SQL.test(query)) {
      return { error: "Only SELECT queries are allowed here. Use createRecord or updateRecord for writes.", rows: [] };
    }
    if (!query.trim().toUpperCase().startsWith("SELECT")) {
      return { error: "Query must start with SELECT.", rows: [] };
    }

    query = query.replace(/;\s*$/, "").trim();
    const limitMatch = query.match(/LIMIT\s+(\d+)/i);
    if (limitMatch) {
      const n = parseInt(limitMatch[1], 10);
      if (n > 100) query = query.replace(/LIMIT\s+\d+/i, "LIMIT 100");
    } else {
      query += " LIMIT 100";
    }

    try {
      const { data, error } = await supabase.rpc("exec_readonly_sql", { query_text: query });
      if (error) {
        const suggestion = buildQueryErrorSuggestion(error.message, query);
        return { error: `Query failed: ${error.message}`, rows: [], executedQuery: query, suggestion };
      }
      const rows = data ?? [];
      return {
        rows,
        rowCount: rows.length,
        executedQuery: query,
        note: rows.length >= 100 ? "Results capped at 100 rows. Use COUNT(*) for totals or add WHERE filters." : undefined,
      };
    } catch (err: unknown) {
      return { error: `Execution failed: ${err instanceof Error ? err.message : "Unknown"}`, rows: [], executedQuery: query };
    }
  },
});

const analyticsQueryTool = tool({
  description: "Run an analytics/aggregation query. Optimized for COUNT, SUM, AVG, GROUP BY, date-range analysis, trends, and cross-table summaries. No row limit — returns aggregated results. Use this for dashboards, KPIs, reports, and business intelligence questions.",
  inputSchema: jsonSchema<{ sql: string; purpose: string }>({
    type: "object",
    properties: {
      sql: { type: "string", description: "Analytics SQL query. Must use aggregate functions (COUNT, SUM, AVG, MIN, MAX) or GROUP BY. No raw SELECT * allowed." },
      purpose: { type: "string", description: "What business metric or insight this calculates" },
    },
    required: ["sql", "purpose"],
    additionalProperties: false,
  }),
  execute: async ({ sql: query, purpose }) => {
    console.log(`[ai-db] Analytics (${purpose}): ${query.slice(0, 300)}`);

    const WRITE_SQL = /\b(INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|TRUNCATE|GRANT|REVOKE|EXECUTE|COPY)\b/i;
    if (WRITE_SQL.test(query)) {
      return { error: "Only SELECT queries allowed.", rows: [] };
    }
    if (!query.trim().toUpperCase().startsWith("SELECT")) {
      return { error: "Must start with SELECT.", rows: [] };
    }

    query = query.replace(/;\s*$/, "").trim();

    if (!query.match(/LIMIT\s+\d+/i)) {
      query += " LIMIT 500";
    }

    try {
      const { data, error } = await supabase.rpc("exec_readonly_sql", { query_text: query });
      if (error) {
        return { error: `Analytics query failed: ${error.message}`, rows: [], executedQuery: query, suggestion: buildQueryErrorSuggestion(error.message, query) };
      }
      return { rows: data ?? [], rowCount: (data ?? []).length, executedQuery: query };
    } catch (err: unknown) {
      return { error: `Execution failed: ${err instanceof Error ? err.message : "Unknown"}`, rows: [], executedQuery: query };
    }
  },
});

const createRecordTool = tool({
  description: "Insert a new record into a database table. Use this when the user asks to create, add, or insert data. Validates the table is writable and uses the Supabase client for safe inserts. Returns the created record with its generated ID.",
  inputSchema: jsonSchema<{ table: string; data: Record<string, any>; purpose: string }>({
    type: "object",
    properties: {
      table: { type: "string", description: "Table name to insert into (e.g., 'tasks', 'contacts', 'tickets'). Public schema only." },
      data: { type: "object", description: "Key-value pairs for the new record. Omit auto-generated fields (id, created_at, updated_at, task_code, ticket_code). Use snake_case column names.", additionalProperties: true },
      purpose: { type: "string", description: "What record is being created" },
    },
    required: ["table", "data", "purpose"],
    additionalProperties: false,
  }),
  execute: async ({ table, data, purpose }) => {
    console.log(`[ai-db] CREATE in ${table} (${purpose}):`, JSON.stringify(data).slice(0, 300));

    const accessError = validateTableAccess(table, "create");
    if (accessError) return { error: accessError, record: null };

    const cleanData = { ...data };
    delete cleanData.id;
    delete cleanData.created_at;
    delete cleanData.updated_at;

    try {
      const { data: result, error } = await supabase
        .from(table)
        .insert(cleanData)
        .select("*")
        .single();

      if (error) {
        console.error(`[ai-db] Insert error in ${table}:`, error.message);
        return { error: `Insert failed: ${error.message}. Check column names with getSchema tool.`, record: null, hint: error.hint || null };
      }

      return { success: true, record: result, table, message: `Record created successfully in ${table}` };
    } catch (err: unknown) {
      return { error: `Insert failed: ${err instanceof Error ? err.message : "Unknown"}`, record: null };
    }
  },
});

const updateRecordTool = tool({
  description: "Update an existing record in the database. Use this when the user asks to modify, change, or update data. Requires the record ID. Returns the updated record.",
  inputSchema: jsonSchema<{ table: string; id: string; data: Record<string, any>; purpose: string }>({
    type: "object",
    properties: {
      table: { type: "string", description: "Table name (e.g., 'tasks', 'contacts', 'tickets')" },
      id: { type: "string", description: "The ID (uuid or text) of the record to update" },
      data: { type: "object", description: "Key-value pairs to update. Only include fields that should change. Use snake_case column names.", additionalProperties: true },
      purpose: { type: "string", description: "What is being updated and why" },
    },
    required: ["table", "id", "data", "purpose"],
    additionalProperties: false,
  }),
  execute: async ({ table, id, data, purpose }) => {
    console.log(`[ai-db] UPDATE ${table}[${id}] (${purpose}):`, JSON.stringify(data).slice(0, 300));

    const accessError = validateTableAccess(table, "update");
    if (accessError) return { error: accessError, record: null };

    const cleanData = { ...data };
    delete cleanData.id;
    delete cleanData.created_at;

    try {
      const { data: colCheck } = await supabase.rpc("exec_readonly_sql", {
        query_text: `SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = '${table}' AND column_name = 'updated_at'`
      });
      if (colCheck && colCheck.length > 0) {
        cleanData.updated_at = new Date().toISOString();
      }

      const { data: result, error } = await supabase
        .from(table)
        .update(cleanData)
        .eq("id", id)
        .select("*")
        .single();

      if (error) {
        console.error(`[ai-db] Update error in ${table}:`, error.message);
        return { error: `Update failed: ${error.message}`, record: null };
      }
      if (!result) {
        return { error: `No record found with id "${id}" in table "${table}"`, record: null };
      }

      return { success: true, record: result, table, message: `Record ${id} updated successfully in ${table}` };
    } catch (err: unknown) {
      return { error: `Update failed: ${err instanceof Error ? err.message : "Unknown"}`, record: null };
    }
  },
});

const deleteRecordTool = tool({
  description: "Delete a record from the database. Use with caution. Requires confirmation from the user first. Returns whether the deletion was successful.",
  inputSchema: jsonSchema<{ table: string; id: string; purpose: string }>({
    type: "object",
    properties: {
      table: { type: "string", description: "Table name (e.g., 'tasks', 'contacts', 'tickets')" },
      id: { type: "string", description: "The ID of the record to delete" },
      purpose: { type: "string", description: "Why this record is being deleted" },
    },
    required: ["table", "id", "purpose"],
    additionalProperties: false,
  }),
  execute: async ({ table, id, purpose }) => {
    console.log(`[ai-db] DELETE ${table}[${id}] (${purpose})`);

    const accessError = validateTableAccess(table, "delete");
    if (accessError) return { error: accessError, deleted: false };

    try {
      const { data: existing } = await supabase
        .from(table)
        .select("id")
        .eq("id", id)
        .single();

      if (!existing) {
        return { error: `No record found with id "${id}" in table "${table}"`, deleted: false };
      }

      const { error } = await supabase
        .from(table)
        .delete()
        .eq("id", id);

      if (error) {
        console.error(`[ai-db] Delete error in ${table}:`, error.message);
        return { error: `Delete failed: ${error.message}`, deleted: false };
      }

      return { success: true, deleted: true, table, id, message: `Record ${id} deleted from ${table}` };
    } catch (err: unknown) {
      return { error: `Delete failed: ${err instanceof Error ? err.message : "Unknown"}`, deleted: false };
    }
  },
});

function buildQueryErrorSuggestion(errorMsg: string, query: string): string {
  const msg = errorMsg.toLowerCase();

  if (msg.includes("does not exist") && msg.includes("relation")) {
    const match = errorMsg.match(/relation "([^"]+)"/);
    const tableName = match ? match[1] : "unknown";
    if (!tableName.includes(".") && (tableName.startsWith("faire_") || ["orders", "products", "stores", "retailers", "shipments", "order_items"].includes(tableName))) {
      return `Table "${tableName}" might be in the faire schema. Try "faire.${tableName}" instead. Use the listColumns tool to verify.`;
    }
    return `Table "${tableName}" was not found. Use the listColumns tool to check available tables, or try a different table name.`;
  }

  if (msg.includes("does not exist") && msg.includes("column")) {
    const match = errorMsg.match(/column "([^"]+)"/);
    const colName = match ? match[1] : "unknown";
    return `Column "${colName}" does not exist. Use the listColumns tool to check the actual column names for this table.`;
  }

  if (msg.includes("type") && (msg.includes("mismatch") || msg.includes("cannot"))) {
    return "There's a type mismatch. Try casting values (e.g., ::text, ::int, ::date) or check the column types with listColumns.";
  }

  if (msg.includes("syntax error")) {
    return "SQL syntax error. Double-check your query syntax. Common issues: missing quotes around strings, wrong JOIN syntax, or reserved words used as identifiers.";
  }

  return "Try a simpler version of the query, or use listColumns to verify the table structure.";
}

async function getOrCreateConversation(
  conversationId: string | undefined,
  verticalId: string | undefined
): Promise<string> {
  if (conversationId) {
    const { data } = await supabase
      .from("ai_conversations")
      .select("id")
      .eq("id", conversationId)
      .single();
    if (data) return conversationId;
  }

  const { data, error } = await supabase
    .from("ai_conversations")
    .insert({ title: "New Chat", vertical_id: verticalId ?? null })
    .select("id")
    .single();

  if (error || !data) throw new Error("Failed to create conversation");
  return data.id;
}

async function saveMessage(
  conversationId: string,
  role: "user" | "assistant",
  content: string
) {
  await supabase
    .from("ai_messages")
    .insert({ conversation_id: conversationId, role, content });
}

async function updateConversationTitle(conversationId: string, firstUserMessage: string) {
  const title = firstUserMessage.slice(0, 60) + (firstUserMessage.length > 60 ? "…" : "");
  await supabase
    .from("ai_conversations")
    .update({ title, updated_at: new Date().toISOString() })
    .eq("id", conversationId)
    .eq("title", "New Chat");
}

function extractMessageContent(msg: any): string {
  if (typeof msg.content === "string") return msg.content;
  if (Array.isArray(msg.parts)) {
    return msg.parts
      .filter((p: any) => p.type === "text")
      .map((p: any) => p.text)
      .join("");
  }
  return "";
}

router.post("/chat", async (req: Request, res: Response) => {
  try {
    const { messages, conversationId: incomingId, verticalId, attachmentIds } = req.body as {
      messages: any[];
      conversationId?: string;
      verticalId?: string;
      attachmentIds?: string[];
    };

    if (!messages || messages.length === 0) {
      return res.status(400).json({ error: "messages required" });
    }

    const convId = await getOrCreateConversation(incomingId, verticalId);

    const lastUserMessage = [...messages].reverse().find((m) => m.role === "user");
    if (lastUserMessage) {
      const content = extractMessageContent(lastUserMessage);
      await saveMessage(convId, "user", content);
      await updateConversationTitle(convId, content);
    }

    const aiMessages: Array<{ role: "user" | "assistant" | "system"; content: string | Array<any> }> = messages.map((m) => ({
      role: m.role as "user" | "assistant" | "system",
      content: extractMessageContent(m),
    }));

    if (attachmentIds && attachmentIds.length > 0) {
      const { data: attachmentRows } = await supabase
        .from("ai_attachments")
        .select("id, filename, file_data, mime_type")
        .eq("conversation_id", convId)
        .in("id", attachmentIds);

      if (attachmentRows && attachmentRows.length > 0) {
        const lastUserIdx = aiMessages.length - 1 - [...aiMessages].reverse().findIndex((m) => m.role === "user");
        if (lastUserIdx >= 0 && lastUserIdx < aiMessages.length) {
          const textContent = typeof aiMessages[lastUserIdx].content === "string"
            ? aiMessages[lastUserIdx].content as string
            : "";

          const TEXT_EMBEDDABLE_MIMES = [
            "text/", "application/json", "application/csv", "application/xml",
            "application/javascript", "application/typescript", "application/x-yaml",
            "application/octet-stream",
          ];
          const isTextEmbeddable = (mime: string) =>
            TEXT_EMBEDDABLE_MIMES.some((prefix) => mime.startsWith(prefix));

          const contentParts: Array<any> = [{ type: "text", text: textContent }];

          for (const att of attachmentRows) {
            const mimeType = att.mime_type as string;
            const fileData = att.file_data as string;
            const filename = att.filename as string;

            if (mimeType.startsWith("image/")) {
              const imgBase64Match = fileData.match(/^data:[^;]+;base64,(.+)$/);
              if (imgBase64Match) {
                const imgBuffer = Buffer.from(imgBase64Match[1], "base64");
                contentParts.push({
                  type: "image",
                  image: imgBuffer,
                  mimeType: mimeType,
                });
                console.log(`[ai-chat] Including image attachment: ${filename} (${imgBuffer.length} bytes)`);
              }
            } else if (isTextEmbeddable(mimeType)) {
              const base64Match = fileData.match(/^data:[^;]+;base64,(.+)$/);
              if (base64Match) {
                const decoded = Buffer.from(base64Match[1], "base64").toString("utf-8");
                const truncated = decoded.length > 50000 ? decoded.slice(0, 50000) + "\n\n[Content truncated at 50,000 characters]" : decoded;
                contentParts.push({
                  type: "text",
                  text: `\n\n--- Attached file: ${filename} (${mimeType}) ---\n${truncated}\n--- End of file ---`,
                });
                console.log(`[ai-chat] Including text attachment: ${filename} (${decoded.length} chars)`);
              }
            } else {
              contentParts.push({
                type: "text",
                text: `\n\n[Attached file: ${filename} (${mimeType}) — binary file type, content cannot be displayed inline]`,
              });
              console.log(`[ai-chat] Skipping binary attachment: ${filename} (${mimeType})`);
            }
          }

          aiMessages[lastUserIdx].content = contentParts;
        }
      }
    }

    const liveSchema = await getLiveDatabaseSchema();
    const systemPrompt = buildSystemPrompt(liveSchema, verticalId);

    const result = streamText({
      model: openai.chat("gpt-4o"),
      system: systemPrompt,
      messages: aiMessages,
      tools: {
        getSchema: getSchemaTool,
        run_sql_query: runSqlQueryTool,
        analyticsQuery: analyticsQueryTool,
        createRecord: createRecordTool,
        updateRecord: updateRecordTool,
        deleteRecord: deleteRecordTool,
        generateImage: generateImageTool,
      },
      stopWhen: stepCountIs(12),
      maxOutputTokens: 8192,
      onFinish: async ({ text }) => {
        if (text) {
          await saveMessage(convId, "assistant", text);
          await supabase
            .from("ai_conversations")
            .update({ updated_at: new Date().toISOString() })
            .eq("id", convId);
        }
      },
    });

    res.setHeader("X-Conversation-Id", convId);
    result.pipeUIMessageStreamToResponse(res);
  } catch (err) {
    console.error("[ai-chat] chat error:", err);
    return res.status(500).json({ error: "AI chat failed" });
  }
});

router.get("/conversations/search", async (req: Request, res: Response) => {
  try {
    const q = (req.query.q as string || "").trim();
    if (!q || q.length < 2) return res.json([]);

    const pattern = `%${q}%`;

    const { data: titleMatches, error: titleErr } = await supabase
      .from("ai_conversations")
      .select("id, title, vertical_id, created_at, updated_at")
      .ilike("title", pattern)
      .order("updated_at", { ascending: false })
      .limit(20);

    if (titleErr) return res.status(500).json({ error: "Search failed" });

    const { data: messageMatches, error: msgErr } = await supabase
      .from("ai_messages")
      .select("conversation_id, content, role, created_at")
      .ilike("content", pattern)
      .order("created_at", { ascending: false })
      .limit(50);

    if (msgErr) return res.status(500).json({ error: "Search failed" });

    const messageConvIds = new Set(
      (messageMatches ?? []).map((m) => m.conversation_id)
    );
    const titleConvIds = new Set((titleMatches ?? []).map((c) => c.id));

    const missingIds = [...messageConvIds].filter((id) => !titleConvIds.has(id));
    let extraConvs: any[] = [];
    if (missingIds.length > 0) {
      const { data, error: extraErr } = await supabase
        .from("ai_conversations")
        .select("id, title, vertical_id, created_at, updated_at")
        .in("id", missingIds);
      if (extraErr) return res.status(500).json({ error: "Search failed" });
      extraConvs = data ?? [];
    }

    const allConvs = [...(titleMatches ?? []), ...extraConvs];

    const snippetsByConv = new Map<string, { content: string; role: string }[]>();
    for (const m of messageMatches ?? []) {
      if (!snippetsByConv.has(m.conversation_id)) {
        snippetsByConv.set(m.conversation_id, []);
      }
      const arr = snippetsByConv.get(m.conversation_id)!;
      if (arr.length < 3) {
        const idx = m.content.toLowerCase().indexOf(q.toLowerCase());
        const start = Math.max(0, idx - 40);
        const end = Math.min(m.content.length, idx + q.length + 40);
        const snippet =
          (start > 0 ? "…" : "") +
          m.content.slice(start, end) +
          (end < m.content.length ? "…" : "");
        arr.push({ content: snippet, role: m.role });
      }
    }

    const results = allConvs.map((conv) => ({
      ...conv,
      titleMatch: conv.title.toLowerCase().includes(q.toLowerCase()),
      messageSnippets: snippetsByConv.get(conv.id) ?? [],
    }));

    results.sort((a, b) => {
      if (a.titleMatch && !b.titleMatch) return -1;
      if (!a.titleMatch && b.titleMatch) return 1;
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    });

    return res.json(results);
  } catch (err) {
    console.error("[ai-chat] search error:", err);
    return res.status(500).json({ error: "Search failed" });
  }
});

router.get("/conversations", async (_req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from("ai_conversations")
      .select("id, title, vertical_id, created_at, updated_at")
      .order("updated_at", { ascending: false })
      .limit(50);

    if (error) return res.status(500).json({ error: error.message });
    return res.json(data ?? []);
  } catch {
    return res.status(500).json({ error: "Failed to fetch conversations" });
  }
});

router.post("/conversations", async (req: Request, res: Response) => {
  try {
    const { title = "New Chat", verticalId } = req.body as {
      title?: string;
      verticalId?: string;
    };
    const { data, error } = await supabase
      .from("ai_conversations")
      .insert({ title, vertical_id: verticalId ?? null })
      .select("id, title, vertical_id, created_at, updated_at")
      .single();

    if (error || !data) return res.status(500).json({ error: "Failed to create conversation" });
    return res.json(data);
  } catch {
    return res.status(500).json({ error: "Failed to create conversation" });
  }
});

router.get("/conversations/:id/messages", async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from("ai_messages")
      .select("id, role, content, created_at")
      .eq("conversation_id", req.params.id)
      .order("created_at", { ascending: true });

    if (error) return res.status(500).json({ error: error.message });
    return res.json(data ?? []);
  } catch {
    return res.status(500).json({ error: "Failed to fetch messages" });
  }
});

router.patch("/conversations/:id", async (req: Request, res: Response) => {
  try {
    const { title } = req.body as { title?: string };
    if (!title || !title.trim()) return res.status(400).json({ error: "title required" });

    const { data, error } = await supabase
      .from("ai_conversations")
      .update({ title: title.trim(), updated_at: new Date().toISOString() })
      .eq("id", req.params.id)
      .select("id, title, vertical_id, created_at, updated_at")
      .single();

    if (error) return res.status(500).json({ error: error.message });
    if (!data) return res.status(404).json({ error: "Conversation not found" });
    return res.json(data);
  } catch {
    return res.status(500).json({ error: "Failed to rename conversation" });
  }
});

router.delete("/conversations/:id", async (req: Request, res: Response) => {
  try {
    const { error } = await supabase
      .from("ai_conversations")
      .delete()
      .eq("id", req.params.id);

    if (error) return res.status(500).json({ error: error.message });
    return res.json({ ok: true });
  } catch {
    return res.status(500).json({ error: "Failed to delete conversation" });
  }
});

router.post("/upload", upload.single("file"), async (req: Request, res: Response) => {
  try {
    const file = req.file;
    const conversationId = req.body.conversationId as string;

    if (!file) return res.status(400).json({ error: "No file provided" });
    if (!conversationId) return res.status(400).json({ error: "conversationId required" });

    const { data: convCheck } = await supabase
      .from("ai_conversations")
      .select("id")
      .eq("id", conversationId)
      .single();

    if (!convCheck) {
      const { error: createErr } = await supabase
        .from("ai_conversations")
        .insert({ id: conversationId, title: "New Chat" });
      if (createErr) {
        console.error("[ai-chat] Failed to create conversation for upload:", createErr.message);
        return res.status(500).json({ error: "Failed to create conversation for upload" });
      }
    }

    const base64Data = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;

    const { data, error } = await supabase
      .from("ai_attachments")
      .insert({
        conversation_id: conversationId,
        filename: file.originalname,
        file_data: base64Data,
        file_size: file.size,
        mime_type: file.mimetype,
      })
      .select("id, filename, file_size, mime_type, created_at")
      .single();

    if (error) {
      console.error("[ai-chat] Upload insert error:", error.message, error.details);
      return res.status(500).json({ error: `Failed to upload file: ${error.message}` });
    }
    if (!data) return res.status(500).json({ error: "Failed to upload file: no data returned" });

    console.log(`[ai-chat] File uploaded: ${file.originalname} (${file.size} bytes) -> ${data.id}`);
    return res.json(data);
  } catch (err) {
    console.error("[ai-chat] Upload exception:", err);
    return res.status(500).json({ error: "Failed to upload file" });
  }
});

router.get("/conversations/:id/attachments", async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from("ai_attachments")
      .select("id, filename, file_size, mime_type, created_at")
      .eq("conversation_id", req.params.id)
      .order("created_at", { ascending: true });

    if (error) return res.status(500).json({ error: error.message });
    return res.json(data ?? []);
  } catch {
    return res.status(500).json({ error: "Failed to fetch attachments" });
  }
});

router.get("/attachments/:id/download", async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from("ai_attachments")
      .select("filename, file_data, mime_type")
      .eq("id", req.params.id)
      .single();

    if (error) {
      console.error("[ai-chat] Attachment download error:", error.message);
      return res.status(404).json({ error: "Attachment not found" });
    }
    if (!data) return res.status(404).json({ error: "Attachment not found" });

    const fileData = data.file_data as string;
    if (!fileData) {
      return res.status(500).json({ error: "Attachment has no file data" });
    }

    const base64Match = fileData.match(/^data:[^;]+;base64,(.+)$/);
    if (!base64Match) return res.status(500).json({ error: "Invalid file data format" });

    const buffer = Buffer.from(base64Match[1], "base64");
    const filename = (data.filename as string).replace(/[^\w.\-]/g, "_");
    res.setHeader("Content-Type", data.mime_type as string);
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Length", buffer.length.toString());
    return res.send(buffer);
  } catch (err) {
    console.error("[ai-chat] Download exception:", err);
    return res.status(500).json({ error: "Failed to download attachment" });
  }
});

router.delete("/attachments/:id", async (req: Request, res: Response) => {
  try {
    const { error } = await supabase
      .from("ai_attachments")
      .delete()
      .eq("id", req.params.id);

    if (error) return res.status(500).json({ error: error.message });
    return res.json({ ok: true });
  } catch {
    return res.status(500).json({ error: "Failed to delete attachment" });
  }
});

export { router as aiChatRouter };
