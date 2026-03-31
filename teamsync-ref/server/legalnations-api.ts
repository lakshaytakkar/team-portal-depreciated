import { Router } from "express";
import multer from "multer";
import { supabase } from "./supabase";
import { uploadClientDocument, getClientDocumentUrl, deleteClientDocumentFile } from "./supabase";

const docUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

export const legalnationsRouter = Router();

legalnationsRouter.get("/clients", async (req, res) => {
  try {
    const { search, status, plan, health, page = "1", limit = "500" } = req.query;
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

    let query = supabase
      .from("ln_clients")
      .select("*", { count: "exact" });

    if (search) {
      const s = `%${search}%`;
      query = query.or(
        `client_name.ilike.${s},llc_name.ilike.${s},client_code.ilike.${s},email.ilike.${s}`
      );
    }
    if (status) query = query.eq("llc_status", status);
    if (plan) query = query.eq("plan", plan);
    if (health) query = query.eq("client_health", health);

    query = query
      .order("created_at", { ascending: false })
      .range(offset, offset + parseInt(limit as string) - 1);

    const { data, error, count } = await query;
    if (error) throw error;

    res.json({ clients: data, total: count });
  } catch (err: any) {
    console.error("[legalnations] GET /clients error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

legalnationsRouter.get("/clients/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const isUuid = /^[0-9a-f]{8}-/.test(id);

    let clientQuery;
    if (isUuid) {
      clientQuery = supabase
        .from("ln_clients")
        .select("*")
        .eq("id", id)
        .single();
    } else {
      clientQuery = supabase
        .from("ln_clients")
        .select("*")
        .eq("client_code", id)
        .single();
    }

    const { data: client, error: clientError } = await clientQuery;
    if (clientError) throw clientError;

    const [checklistRes, docsRes, credsRes] = await Promise.all([
      supabase
        .from("ln_onboarding_checklist")
        .select("*")
        .eq("client_id", client.id)
        .order("sort_order"),
      supabase
        .from("ln_client_documents")
        .select("*")
        .eq("client_id", client.id)
        .order("uploaded_at", { ascending: false }),
      supabase
        .from("ln_client_credentials")
        .select("*")
        .eq("client_id", client.id)
        .order("created_at"),
    ]);

    res.json({
      client,
      checklist: checklistRes.data || [],
      documents: docsRes.data || [],
      credentials: credsRes.data || [],
    });
  } catch (err: any) {
    console.error("[legalnations] GET /clients/:id error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

legalnationsRouter.patch("/clients/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };
    delete updates.id;
    delete updates.created_at;
    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("ln_clients")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err: any) {
    console.error("[legalnations] PATCH /clients/:id error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

legalnationsRouter.post("/clients", async (req, res) => {
  try {
    const body = { ...req.body, llc_status: req.body.llc_status || "LLC Booked" };
    const { data, error } = await supabase
      .from("ln_clients")
      .insert(body)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err: any) {
    console.error("[legalnations] POST /clients error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

legalnationsRouter.patch("/checklist/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { is_completed } = req.body;

    const updates: any = {
      is_completed,
      completed_at: is_completed ? new Date().toISOString() : null,
    };

    const { data, error } = await supabase
      .from("ln_onboarding_checklist")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err: any) {
    console.error("[legalnations] PATCH /checklist/:id error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

legalnationsRouter.post("/clients/:id/credentials", async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from("ln_client_credentials")
      .insert({ ...req.body, client_id: id })
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err: any) {
    console.error("[legalnations] POST credentials error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

legalnationsRouter.delete("/credentials/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from("ln_client_credentials")
      .delete()
      .eq("id", id);

    if (error) throw error;
    res.json({ success: true });
  } catch (err: any) {
    console.error("[legalnations] DELETE credentials error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

legalnationsRouter.get("/clients/:id/documents", async (req, res) => {
  try {
    const { id } = req.params;
    const { category } = req.query;
    let query = supabase
      .from("ln_client_documents")
      .select("*")
      .eq("client_id", id)
      .order("uploaded_at", { ascending: false });

    if (category && category !== "all") {
      query = query.eq("category", category as string);
    }

    const { data, error } = await query;
    if (error) throw error;
    res.json(data || []);
  } catch (err: any) {
    console.error("[legalnations] GET client documents error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

legalnationsRouter.post("/clients/:id/documents", docUpload.single("file"), async (req, res) => {
  try {
    const { id } = req.params;
    const file = (req as any).file;

    if (!file) {
      return res.status(400).json({ error: "No file provided" });
    }

    const category = req.body.category || "other";
    const documentName = req.body.document_name || file.originalname;
    const documentType = req.body.document_type || "other";

    const storagePath = await uploadClientDocument(
      id, category, file.buffer, file.originalname, file.mimetype
    );

    if (!storagePath) {
      return res.status(500).json({ error: "Failed to upload file to storage" });
    }

    const { data, error } = await supabase
      .from("ln_client_documents")
      .insert({
        client_id: id,
        document_name: documentName,
        document_type: documentType,
        file_url: storagePath,
        file_name: file.originalname,
        file_size: file.size,
        category,
        status: "uploaded",
      })
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err: any) {
    console.error("[legalnations] POST documents error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

legalnationsRouter.get("/documents/:id/url", async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from("ln_client_documents")
      .select("file_url")
      .eq("id", id)
      .single();

    if (error) throw error;
    if (!data?.file_url) return res.status(404).json({ error: "No file URL found" });

    const signedUrl = await getClientDocumentUrl(data.file_url);
    if (!signedUrl) return res.status(500).json({ error: "Failed to generate signed URL" });

    res.json({ url: signedUrl });
  } catch (err: any) {
    console.error("[legalnations] GET document URL error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

legalnationsRouter.patch("/documents/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const { data, error } = await supabase
      .from("ln_client_documents")
      .update({ status })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err: any) {
    console.error("[legalnations] PATCH document error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

legalnationsRouter.delete("/documents/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { data: doc, error: fetchError } = await supabase
      .from("ln_client_documents")
      .select("file_url")
      .eq("id", id)
      .single();

    if (fetchError) throw fetchError;

    if (doc?.file_url) {
      await deleteClientDocumentFile(doc.file_url);
    }

    const { error } = await supabase
      .from("ln_client_documents")
      .delete()
      .eq("id", id);

    if (error) throw error;
    res.json({ success: true });
  } catch (err: any) {
    console.error("[legalnations] DELETE documents error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

legalnationsRouter.get("/tax-filings", async (req, res) => {
  try {
    const { search, status, llc_type } = req.query;

    let query = supabase
      .from("ln_tax_filings")
      .select("*", { count: "exact" });

    if (search) {
      const s = `%${search}%`;
      query = query.or(
        `llc_name.ilike.${s},main_entity_name.ilike.${s},email_address.ilike.${s}`
      );
    }
    if (status) query = query.eq("status", status);
    if (llc_type) query = query.eq("llc_type", llc_type);

    query = query.order("created_at", { ascending: false });

    const { data, error, count } = await query;
    if (error) throw error;

    res.json({ filings: data, total: count });
  } catch (err: any) {
    console.error("[legalnations] GET /tax-filings error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

legalnationsRouter.patch("/tax-filings/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };
    delete updates.id;
    delete updates.created_at;
    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("ln_tax_filings")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err: any) {
    console.error("[legalnations] PATCH /tax-filings/:id error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

legalnationsRouter.get("/stats", async (req, res) => {
  try {
    const [clientsRes, taxRes] = await Promise.all([
      supabase
        .from("ln_clients")
        .select("id, llc_status, plan, client_health, amount_received, country"),
      supabase
        .from("ln_tax_filings")
        .select("id, status, filing_done, llc_type"),
    ]);

    if (clientsRes.error) throw clientsRes.error;
    const clients = clientsRes.data || [];
    const taxFilings = taxRes.data || [];

    const totalClients = clients.length;
    const delivered = clients.filter((c: any) => c.llc_status === "Delivered").length;
    const active = clients.filter((c: any) => c.llc_status !== "Delivered" && c.llc_status !== "Refunded").length;
    const totalRevenue = clients.reduce((sum: number, c: any) => sum + (parseFloat(c.amount_received) || 0), 0);

    const statusDistribution: Record<string, number> = {};
    clients.forEach((c: any) => {
      statusDistribution[c.llc_status] = (statusDistribution[c.llc_status] || 0) + 1;
    });

    const healthDistribution: Record<string, number> = {};
    clients.forEach((c: any) => {
      const h = c.client_health || "Unknown";
      healthDistribution[h] = (healthDistribution[h] || 0) + 1;
    });

    const countryDistribution: Record<string, number> = {};
    clients.forEach((c: any) => {
      const country = c.country || "Unknown";
      countryDistribution[country] = (countryDistribution[country] || 0) + 1;
    });

    res.json({
      totalClients,
      delivered,
      active,
      refunded: clients.filter((c: any) => c.llc_status === "Refunded").length,
      totalRevenue,
      statusDistribution,
      healthDistribution,
      countryDistribution,
      taxFilings: {
        total: taxFilings.length,
        inProgress: taxFilings.filter((t: any) => t.status === "In progress").length,
        completed: taxFilings.filter((t: any) => t.filing_done).length,
      },
    });
  } catch (err: any) {
    console.error("[legalnations] GET /stats error:", err.message);
    res.status(500).json({ error: err.message });
  }
});
