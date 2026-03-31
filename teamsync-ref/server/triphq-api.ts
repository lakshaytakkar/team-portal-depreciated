import { Router } from "express";
import { createClient } from "@supabase/supabase-js";
import multer from "multer";

const supabaseUrl = process.env.SUPABASE_URL ?? "";
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

const triphqSupabase = supabaseUrl && supabaseServiceRoleKey
  ? createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: { persistSession: false },
      db: { schema: "triphq" },
    })
  : null as any;

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });

export const triphqRouter = Router();

const TRIP_ID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";
const BUCKET = "triphq-files";

async function ensureBucket() {
  const rawClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: { persistSession: false },
  });
  const { data } = await rawClient.storage.getBucket(BUCKET);
  if (!data) {
    await rawClient.storage.createBucket(BUCKET, { public: true });
  }
}
ensureBucket().catch(() => {});

function camelRow(row: any): any {
  if (!row) return row;
  const result: any = {};
  for (const key of Object.keys(row)) {
    const camel = key.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
    result[camel] = row[key];
  }
  return result;
}

// ── Trips ────────────────────────────────────────────────────────────────────

triphqRouter.get("/trips", async (_req, res) => {
  const { data, error } = await triphqSupabase.from("trips").select("*").order("start_date", { ascending: true });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data.map(camelRow));
});

triphqRouter.get("/trips/:id", async (req, res) => {
  const { data, error } = await triphqSupabase.from("trips").select("*").eq("id", req.params.id).single();
  if (error) return res.status(404).json({ error: error.message });
  res.json(camelRow(data));
});

triphqRouter.get("/trips/:id/stats", async (req, res) => {
  const tripId = req.params.id;
  const [contacts, products, expenses, checklist, packing, content, itinerary, transport] = await Promise.all([
    triphqSupabase.from("contacts").select("id, meeting_status").eq("trip_id", tripId),
    triphqSupabase.from("catalogue_products").select("id, status").eq("trip_id", tripId),
    triphqSupabase.from("expenses").select("amount, currency").eq("trip_id", tripId),
    triphqSupabase.from("checklist_items").select("id, is_completed").eq("trip_id", tripId),
    triphqSupabase.from("packing_items").select("id, is_packed").eq("trip_id", tripId),
    triphqSupabase.from("content_plans").select("id, status").eq("trip_id", tripId),
    triphqSupabase.from("itinerary_days").select("id").eq("trip_id", tripId),
    triphqSupabase.from("transport_legs").select("id, status").eq("trip_id", tripId),
  ]);
  const totalExpense = (expenses.data || []).reduce((sum: number, e: any) => sum + parseFloat(e.amount || 0), 0);
  const checklistDone = (checklist.data || []).filter((c: any) => c.is_completed).length;
  const checklistTotal = (checklist.data || []).length;
  const packingDone = (packing.data || []).filter((p: any) => p.is_packed).length;
  const packingTotal = (packing.data || []).length;
  const contactsMet = (contacts.data || []).filter((c: any) => c.meeting_status === "met" || c.meeting_status === "followed-up").length;
  res.json({
    totalContacts: (contacts.data || []).length,
    contactsMet,
    totalProducts: (products.data || []).length,
    confirmedProducts: (products.data || []).filter((p: any) => p.status === "confirmed").length,
    totalExpense,
    checklistDone,
    checklistTotal,
    packingDone,
    packingTotal,
    totalContent: (content.data || []).length,
    contentShot: (content.data || []).filter((c: any) => c.status !== "planned").length,
    totalDays: (itinerary.data || []).length,
    totalLegs: (transport.data || []).length,
    bookedLegs: (transport.data || []).filter((t: any) => t.status === "booked" || t.status === "completed").length,
  });
});

// ── Generic CRUD helper ──────────────────────────────────────────────────────

function crudRoutes(table: string, orderCol = "created_at") {
  triphqRouter.get(`/${table}`, async (req, res) => {
    const tripId = (req.query.trip_id as string) || TRIP_ID;
    const { data, error } = await triphqSupabase.from(table).select("*").eq("trip_id", tripId).order(orderCol, { ascending: true });
    if (error) return res.status(500).json({ error: error.message });
    res.json(data.map(camelRow));
  });

  triphqRouter.get(`/${table}/:id`, async (req, res) => {
    const { data, error } = await triphqSupabase.from(table).select("*").eq("id", req.params.id).single();
    if (error) return res.status(404).json({ error: error.message });
    res.json(camelRow(data));
  });

  triphqRouter.post(`/${table}`, async (req, res) => {
    const body = { ...req.body, trip_id: req.body.trip_id || TRIP_ID };
    const { data, error } = await triphqSupabase.from(table).insert(body).select().single();
    if (error) return res.status(400).json({ error: error.message });
    res.json(camelRow(data));
  });

  triphqRouter.patch(`/${table}/:id`, async (req, res) => {
    const { data, error } = await triphqSupabase.from(table).update(req.body).eq("id", req.params.id).select().single();
    if (error) return res.status(400).json({ error: error.message });
    res.json(camelRow(data));
  });

  triphqRouter.delete(`/${table}/:id`, async (req, res) => {
    const { error } = await triphqSupabase.from(table).delete().eq("id", req.params.id);
    if (error) return res.status(400).json({ error: error.message });
    res.json({ success: true });
  });
}

crudRoutes("itinerary_days", "day_number");
crudRoutes("contacts", "created_at");
crudRoutes("catalogue_products", "created_at");
crudRoutes("expenses", "date");
crudRoutes("checklist_items", "created_at");
crudRoutes("packing_items", "created_at");
crudRoutes("transport_legs", "leg_order");
crudRoutes("content_plans", "created_at");
crudRoutes("deliverables", "created_at");
crudRoutes("external_apps", "created_at");

// ── Documents ────────────────────────────────────────────────────────────────

triphqRouter.get("/documents", async (req, res) => {
  const tripId = (req.query.trip_id as string) || TRIP_ID;
  let query = triphqSupabase.from("documents").select("*").eq("trip_id", tripId);
  if (req.query.doc_type) query = query.eq("doc_type", req.query.doc_type);
  if (req.query.city) query = query.eq("city", req.query.city);
  if (req.query.entity_type) query = query.eq("entity_type", req.query.entity_type);
  if (req.query.entity_id) query = query.eq("entity_id", req.query.entity_id);
  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data.map(camelRow));
});

triphqRouter.delete("/documents/:id", async (req, res) => {
  const { data: doc } = await triphqSupabase.from("documents").select("file_url").eq("id", req.params.id).single();
  if (doc?.file_url) {
    const path = doc.file_url.split(`${BUCKET}/`).pop();
    if (path) {
      const rawClient = createClient(supabaseUrl, supabaseServiceRoleKey, { auth: { persistSession: false } });
      await rawClient.storage.from(BUCKET).remove([path]);
    }
  }
  const { error } = await triphqSupabase.from("documents").delete().eq("id", req.params.id);
  if (error) return res.status(400).json({ error: error.message });
  res.json({ success: true });
});

triphqRouter.patch("/documents/:id", async (req, res) => {
  const { data, error } = await triphqSupabase.from("documents").update(req.body).eq("id", req.params.id).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.json(camelRow(data));
});

// ── File Upload ──────────────────────────────────────────────────────────────

triphqRouter.post("/upload", upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file provided" });

  const tripId = req.body.trip_id || TRIP_ID;
  const docType = req.body.doc_type || "photo";
  const city = req.body.city || null;
  const contactName = req.body.contact_name || null;
  const dayNumber = req.body.day_number ? parseInt(req.body.day_number) : null;
  const entityType = req.body.entity_type || null;
  const entityId = req.body.entity_id || null;
  const notes = req.body.notes || null;

  const timestamp = Date.now();
  const sanitizedName = req.file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
  const filePath = `${tripId}/${docType}/${timestamp}_${sanitizedName}`;

  const rawClient = createClient(supabaseUrl, supabaseServiceRoleKey, { auth: { persistSession: false } });
  const { error: uploadError } = await rawClient.storage.from(BUCKET).upload(filePath, req.file.buffer, {
    contentType: req.file.mimetype,
    upsert: false,
  });
  if (uploadError) return res.status(500).json({ error: uploadError.message });

  const { data: urlData } = rawClient.storage.from(BUCKET).getPublicUrl(filePath);
  const fileUrl = urlData.publicUrl;

  const { data, error } = await triphqSupabase.from("documents").insert({
    trip_id: tripId,
    file_name: req.file.originalname,
    file_url: fileUrl,
    file_type: req.file.mimetype,
    file_size: req.file.size,
    doc_type: docType,
    city,
    contact_name: contactName,
    day_number: dayNumber,
    entity_type: entityType,
    entity_id: entityId,
    notes,
  }).select().single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(camelRow(data));
});

// ── Bulk toggle helpers ──────────────────────────────────────────────────────

triphqRouter.patch("/checklist_items/:id/toggle", async (req, res) => {
  const { data: item } = await triphqSupabase.from("checklist_items").select("is_completed").eq("id", req.params.id).single();
  if (!item) return res.status(404).json({ error: "Not found" });
  const { data, error } = await triphqSupabase.from("checklist_items").update({ is_completed: !item.is_completed }).eq("id", req.params.id).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.json(camelRow(data));
});

triphqRouter.patch("/packing_items/:id/toggle", async (req, res) => {
  const { data: item } = await triphqSupabase.from("packing_items").select("is_packed").eq("id", req.params.id).single();
  if (!item) return res.status(404).json({ error: "Not found" });
  const { data, error } = await triphqSupabase.from("packing_items").update({ is_packed: !item.is_packed }).eq("id", req.params.id).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.json(camelRow(data));
});
